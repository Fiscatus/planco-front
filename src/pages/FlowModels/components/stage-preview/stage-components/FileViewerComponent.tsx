import { useEffect, useMemo, useRef, useState } from "react";
import {
  Box,
  Button,
  Chip,
  Divider,
  IconButton,
  Menu,
  MenuItem,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  Visibility as VisibilityIcon,
  MoreVert as MoreVertIcon,
  Download as DownloadIcon,
  SwapHoriz as SwapHorizIcon,
  PictureAsPdf as PictureAsPdfIcon,
  Image as ImageIcon,
  InsertDriveFile as InsertDriveFileIcon,
  OpenInNew as OpenInNewIcon,
  UploadFile as UploadFileIcon,
} from "@mui/icons-material";
import type { StageComponentRuntimeProps } from "../componentRegistry";
import { BaseStageComponentCard } from "./BaseStageComponentCard";

type FileItem = {
  id: string;
  name: string;
  url?: string;
  mimeType?: string;
  sizeBytes?: number;
  category?: string;

  /** interno do frontend: quando o arquivo foi adicionado pelo usuário */
  isLocal?: boolean;
};

function safeString(v: unknown) {
  return String(v ?? "").trim();
}

function isPdf(mime?: string, name?: string) {
  const m = safeString(mime).toLowerCase();
  const n = safeString(name).toLowerCase();
  return m.includes("pdf") || n.endsWith(".pdf");
}

function isImage(mime?: string, name?: string) {
  const m = safeString(mime).toLowerCase();
  const n = safeString(name).toLowerCase();
  if (m.startsWith("image/")) return true;
  return /\.(png|jpg|jpeg|webp|gif)$/i.test(n);
}

function pickIcon(mime?: string, name?: string) {
  if (isPdf(mime, name)) return <PictureAsPdfIcon sx={{ fontSize: 18 }} />;
  if (isImage(mime, name)) return <ImageIcon sx={{ fontSize: 18 }} />;
  return <InsertDriveFileIcon sx={{ fontSize: 18 }} />;
}

function formatBytes(sizeBytes?: number) {
  if (!sizeBytes || !Number.isFinite(sizeBytes) || sizeBytes <= 0) return "";
  const units = ["B", "KB", "MB", "GB", "TB"];
  let v = sizeBytes;
  let idx = 0;
  while (v >= 1024 && idx < units.length - 1) {
    v /= 1024;
    idx += 1;
  }
  const digits = idx === 0 ? 0 : idx === 1 ? 0 : 1;
  return `${v.toFixed(digits)} ${units[idx]}`;
}

function fileKindLabel(file: FileItem) {
  if (isPdf(file.mimeType, file.name)) return "PDF";
  if (isImage(file.mimeType, file.name)) return "Imagem";
  return "Documento";
}

function openInNewTab(url: string) {
  try {
    window.open(url, "_blank", "noopener,noreferrer");
  } catch {
    // silêncio
  }
}

function downloadFromUrl(url: string, filename?: string) {
  try {
    const a = document.createElement("a");
    a.href = url;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    if (filename) a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
  } catch {
    // silêncio
  }
}

function canPreview(file: FileItem | null, mode: "embed" | "placeholder") {
  if (!file) return false;
  if (mode !== "embed") return false;
  if (!safeString(file.url)) return false;
  return isPdf(file.mimeType, file.name) || isImage(file.mimeType, file.name);
}

function buildLocalFileItem(file: File): FileItem {
  const id = `local_${Date.now()}_${Math.random().toString(16).slice(2)}`;
  const url = URL.createObjectURL(file);

  return {
    id,
    name: safeString(file.name) || "Arquivo",
    url,
    mimeType: safeString(file.type) || undefined,
    sizeBytes: Number.isFinite(file.size) ? file.size : undefined,
    category: isPdf(file.type, file.name) ? "PDF" : isImage(file.type, file.name) ? "Imagem" : "Documento",
    isLocal: true,
  };
}

export const FileViewerComponent = ({
  component,
  isReadOnly,
  stageCompleted,
  onEvent,
}: StageComponentRuntimeProps) => {
  const cfg = useMemo(() => {
    const raw = (component.config ?? {}) as Record<string, unknown>;

    const height =
      typeof raw.height === "number" && Number.isFinite(raw.height) && raw.height > 260
        ? Math.floor(raw.height)
        : 520;

    const allowSelectFromList = raw.allowSelectFromList === false ? false : true;

    const mode = safeString(raw.mode) as "embed" | "placeholder";
    const resolvedMode: "embed" | "placeholder" = mode === "placeholder" ? "placeholder" : "embed";

    const filesRaw = raw.files as unknown;
    const files: FileItem[] = Array.isArray(filesRaw)
      ? ((filesRaw
          .map((f) => {
            const obj = (f ?? {}) as Record<string, unknown>;
            const id = safeString(obj.id) || safeString(obj._id);
            const name = safeString(obj.name);
            if (!id || !name) return null;

            return {
              id,
              name,
              url: safeString(obj.url) || undefined,
              mimeType: safeString(obj.mimeType) || undefined,
              sizeBytes:
                typeof obj.sizeBytes === "number" && Number.isFinite(obj.sizeBytes) ? obj.sizeBytes : undefined,
              category: safeString(obj.category) || undefined,
            } as FileItem;
          })
          .filter(Boolean) as FileItem[]) ?? [])
      : [];

    const selectedRaw = raw.selectedFile as unknown;
    const selected =
      selectedRaw && typeof selectedRaw === "object"
        ? ({
            id: safeString((selectedRaw as any).id) || safeString((selectedRaw as any)._id),
            name: safeString((selectedRaw as any).name),
            url: safeString((selectedRaw as any).url) || undefined,
            mimeType: safeString((selectedRaw as any).mimeType) || undefined,
            sizeBytes:
              typeof (selectedRaw as any).sizeBytes === "number" && Number.isFinite((selectedRaw as any).sizeBytes)
                ? (selectedRaw as any).sizeBytes
                : undefined,
            category: safeString((selectedRaw as any).category) || undefined,
          } as FileItem)
        : null;

    return {
      height,
      allowSelectFromList,
      mode: resolvedMode,
      files,
      selected,
    };
  }, [component.config]);

  /**
   * Estado local de arquivos:
   * - começa com os arquivos vindos do config
   * - permite adicionar arquivos via upload (local) e visualizar na hora
   */
  const [filesState, setFilesState] = useState<FileItem[]>(() => {
    const initial = cfg.files?.length ? cfg.files : cfg.selected ? [cfg.selected] : [];
    const unique: Record<string, FileItem> = {};
    for (const f of initial) {
      if (f?.id) unique[f.id] = f;
    }
    return Object.values(unique);
  });

  useEffect(() => {
    // sincroniza quando o backend/config mudar
    // (sem apagar arquivos locais já adicionados na sessão)
    setFilesState((prev) => {
      const map: Record<string, FileItem> = {};
      for (const p of prev) {
        if (p?.id) map[p.id] = p;
      }
      for (const f of cfg.files) {
        if (f?.id) map[f.id] = { ...f, isLocal: map[f.id]?.isLocal ?? false };
      }
      if (cfg.selected?.id) map[cfg.selected.id] = { ...cfg.selected, isLocal: map[cfg.selected.id]?.isLocal ?? false };
      return Object.values(map);
    });
  }, [cfg.files, cfg.selected]);

  const initialSelected = useMemo(() => {
    if (cfg.selected?.id && cfg.selected?.name) return cfg.selected.id;
    if (cfg.files.length) return cfg.files[0].id;
    if (filesState.length) return filesState[0].id;
    return null;
  }, [cfg.selected, cfg.files, filesState]);

  const [selectedId, setSelectedId] = useState<string | null>(initialSelected);

  useEffect(() => {
    setSelectedId((cur) => cur ?? initialSelected);
  }, [initialSelected]);

  const selectedFile = useMemo(() => {
    if (!selectedId) return null;
    return filesState.find((f) => f.id === selectedId) || null;
  }, [filesState, selectedId]);

  const canSelect = cfg.allowSelectFromList && filesState.length > 1;

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectEl, setSelectEl] = useState<null | HTMLElement>(null);

  const openMenu = (e: React.MouseEvent<HTMLElement>) => setAnchorEl(e.currentTarget);
  const closeMenu = () => setAnchorEl(null);

  const openSelect = (e: React.MouseEvent<HTMLElement>) => setSelectEl(e.currentTarget);
  const closeSelect = () => setSelectEl(null);

  const inputRef = useRef<HTMLInputElement | null>(null);

  const previewEnabled = canPreview(selectedFile, cfg.mode);

  /** Fallback inteligente do preview */
  const [embedLoading, setEmbedLoading] = useState(false);
  const [embedFailed, setEmbedFailed] = useState(false);

  useEffect(() => {
    setEmbedFailed(false);
    setEmbedLoading(false);

    if (!previewEnabled) return;
    if (!selectedFile?.url) return;

    // imagens: deixamos o onError tratar
    if (isImage(selectedFile.mimeType, selectedFile.name)) return;

    // PDFs: fallback por timeout (porque iframe pode “carregar” mas não renderizar em alguns casos)
    setEmbedLoading(true);
    const t = window.setTimeout(() => {
      setEmbedLoading(false);
      setEmbedFailed(true);
    }, 2500);

    return () => window.clearTimeout(t);
  }, [previewEnabled, selectedFile?.id, selectedFile?.url, selectedFile?.mimeType, selectedFile?.name]);

  const markEmbedOk = () => {
    setEmbedLoading(false);
    setEmbedFailed(false);
  };

  const markEmbedFail = () => {
    setEmbedLoading(false);
    setEmbedFailed(true);
  };

  const handleSelect = (fileId: string) => {
    closeSelect();

    const file = filesState.find((x) => x.id === fileId) || null;
    setSelectedId(fileId);

    onEvent?.("files:select", {
      componentKey: component.key,
      fileId,
      file,
    });
  };

  const handleOpenNewTab = () => {
    if (!selectedFile?.url) return;

    onEvent?.("files:open", {
      componentKey: component.key,
      fileId: selectedFile.id,
      url: selectedFile.url,
    });

    openInNewTab(selectedFile.url);
  };

  const handleDownload = () => {
    if (!selectedFile?.url) return;

    onEvent?.("files:download", {
      componentKey: component.key,
      fileId: selectedFile.id,
      url: selectedFile.url,
    });

    downloadFromUrl(selectedFile.url, selectedFile.name);
  };

  const handleClickAdd = () => {
    if (isReadOnly) return;
    inputRef.current?.click();
  };

  const handleAddFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const first = files.item(0);
    if (!first) return;

    const newItem = buildLocalFileItem(first);

    setFilesState((prev) => [newItem, ...prev]);
    setSelectedId(newItem.id);

    onEvent?.("files:add", {
      componentKey: component.key,
      fileId: newItem.id,
      name: newItem.name,
      mimeType: newItem.mimeType,
      sizeBytes: newItem.sizeBytes,
      file: first,
    });
  };

  useEffect(() => {
    // evita vazamento de memória de objectURL
    return () => {
      try {
        for (const f of filesState) {
          if (f.isLocal && f.url) URL.revokeObjectURL(f.url);
        }
      } catch {
        // silêncio
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const rightChip = selectedFile ? (
    <Chip
      icon={pickIcon(selectedFile.mimeType, selectedFile.name)}
      label={selectedFile.category ? selectedFile.category : fileKindLabel(selectedFile)}
      size="small"
      sx={{
        bgcolor: "#E7F3FF",
        color: "#1877F2",
        fontWeight: 800,
        fontSize: "0.75rem",
        height: 24,
        "& .MuiChip-icon": { ml: 0.5, color: "#1877F2" },
      }}
    />
  ) : (
    <Chip
      label="Sem arquivo"
      size="small"
      sx={{
        bgcolor: "#F0F2F5",
        color: "#616161",
        fontWeight: 800,
        fontSize: "0.75rem",
        height: 24,
      }}
    />
  );

  return (
    <BaseStageComponentCard
      title={component.label}
      subtitle={component.description}
      icon={<VisibilityIcon sx={{ fontSize: 18 }} />}
      required={component.required}
      lockedAfterCompletion={component.lockedAfterCompletion}
      isReadOnly={isReadOnly}
      rightSlot={rightChip}
    >
      {/* input escondido para upload */}
      <input
        ref={inputRef}
        type="file"
        style={{ display: "none" }}
        onChange={(e) => {
          handleAddFiles(e.target.files);
          // permite selecionar o mesmo arquivo novamente
          e.currentTarget.value = "";
        }}
      />

      {/* Topo */}
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2 }}>
        <Box sx={{ minWidth: 0 }}>
          <Typography
            sx={{
              fontWeight: 900,
              color: "#0f172a",
              fontSize: "0.95rem",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
            title={selectedFile?.name || ""}
          >
            {selectedFile?.name || "Nenhum arquivo selecionado"}
          </Typography>

          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", alignItems: "center", mt: 0.35 }}>
            <Typography variant="body2" sx={{ color: "#64748b" }}>
              {stageCompleted ? "Etapa concluída" : "Visualize e baixe documentos desta etapa"}
            </Typography>

            {selectedFile?.sizeBytes ? (
              <Chip
                label={formatBytes(selectedFile.sizeBytes)}
                size="small"
                sx={{
                  bgcolor: "#F0F2F5",
                  color: "#475569",
                  fontWeight: 900,
                  height: 22,
                  fontSize: "0.7rem",
                }}
              />
            ) : null}
          </Box>
        </Box>

        <Box sx={{ display: "flex", gap: 1, alignItems: "center", flexShrink: 0 }}>
          <Button
            onClick={handleClickAdd}
            variant="contained"
            startIcon={<UploadFileIcon />}
            disabled={isReadOnly}
            sx={{
              bgcolor: "#1877F2",
              "&:hover": { bgcolor: "#166FE5" },
              textTransform: "none",
              fontWeight: 950,
              borderRadius: 2,
              boxShadow: "none",
            }}
          >
            Adicionar arquivo
          </Button>

          {canSelect ? (
            <Button
              onClick={openSelect}
              variant="outlined"
              startIcon={<SwapHorizIcon />}
              disabled={isReadOnly}
              sx={{
                textTransform: "none",
                borderRadius: 2,
                borderColor: "#E4E6EB",
                color: "#212121",
                fontWeight: 800,
                "&:hover": { borderColor: "#CBD5E1", backgroundColor: "#F8F9FA" },
              }}
            >
              Trocar
            </Button>
          ) : null}

          <Tooltip title="Ações" arrow>
            <IconButton
              onClick={openMenu}
              sx={{
                border: "1px solid #E4E6EB",
                borderRadius: 2,
                bgcolor: "#fff",
                "&:hover": { borderColor: "#CBD5E1", bgcolor: "#F8F9FA" },
              }}
            >
              <MoreVertIcon fontSize="small" sx={{ color: "#616161" }} />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Menus */}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={closeMenu}>
        <MenuItem
          onClick={() => {
            closeMenu();
            handleOpenNewTab();
          }}
          disabled={!selectedFile?.url}
        >
          <OpenInNewIcon sx={{ mr: 1, fontSize: 20, color: "#1877F2" }} />
          Abrir em nova aba
        </MenuItem>

        <MenuItem
          onClick={() => {
            closeMenu();
            handleDownload();
          }}
          disabled={!selectedFile?.url}
        >
          <DownloadIcon sx={{ mr: 1, fontSize: 20, color: "#1877F2" }} />
          Baixar arquivo
        </MenuItem>
      </Menu>

      <Menu anchorEl={selectEl} open={Boolean(selectEl)} onClose={closeSelect}>
        {filesState.map((f) => {
          const isActive = selectedId === f.id;
          return (
            <MenuItem
              key={f.id}
              onClick={() => handleSelect(f.id)}
              disabled={isReadOnly}
              sx={{ maxWidth: 460, bgcolor: isActive ? "#F8FAFC" : "transparent" }}
            >
              <Box sx={{ display: "flex", gap: 1, alignItems: "center", minWidth: 0, width: "100%" }}>
                <Box sx={{ color: "#1877F2", flexShrink: 0 }}>{pickIcon(f.mimeType, f.name)}</Box>

                <Box sx={{ minWidth: 0, flex: 1 }}>
                  <Typography
                    sx={{
                      fontWeight: 900,
                      color: "#212121",
                      fontSize: "0.875rem",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                    title={f.name}
                  >
                    {f.name}
                  </Typography>

                  <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 800 }}>
                    {fileKindLabel(f)}
                    {f.sizeBytes ? ` • ${formatBytes(f.sizeBytes)}` : ""}
                    {f.isLocal ? " • Adicionado agora" : ""}
                  </Typography>
                </Box>

                {isActive ? (
                  <Chip
                    label="Selecionado"
                    size="small"
                    sx={{
                      bgcolor: "#E7F3FF",
                      color: "#1877F2",
                      fontWeight: 950,
                      height: 22,
                      fontSize: "0.68rem",
                    }}
                  />
                ) : null}
              </Box>
            </MenuItem>
          );
        })}
      </Menu>

      <Divider sx={{ my: 2 }} />

      {/* Área de visualização */}
      {!selectedFile ? (
        <Box
          sx={{
            py: 3,
            px: 2,
            textAlign: "center",
            border: "1px dashed #CBD5E1",
            borderRadius: 2,
            bgcolor: "#FFFFFF",
          }}
        >
          <Typography sx={{ fontWeight: 950, color: "#0f172a", mb: 0.5 }}>
            Nenhum arquivo anexado
          </Typography>
          <Typography variant="body2" sx={{ color: "#64748b", fontWeight: 700 }}>
            Clique em <strong>Adicionar arquivo</strong> para anexar um documento e visualizar aqui.
          </Typography>
        </Box>
      ) : previewEnabled && !embedFailed ? (
        <Box
          sx={{
            borderRadius: 2,
            border: "1px solid #E4E6EB",
            overflow: "hidden",
            bgcolor: "#fff",
          }}
        >
          {/* Barra de ações do viewer */}
          <Box
            sx={{
              px: 1.5,
              py: 1.25,
              borderBottom: "1px solid #E4E6EB",
              bgcolor: "#FAFBFC",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 1,
              flexWrap: "wrap",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, minWidth: 0 }}>
              <Box sx={{ color: "#1877F2", flexShrink: 0 }}>{pickIcon(selectedFile.mimeType, selectedFile.name)}</Box>
              <Typography
                sx={{
                  fontWeight: 950,
                  color: "#0f172a",
                  fontSize: "0.9rem",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  maxWidth: { xs: 200, sm: 520, md: 720 },
                }}
                title={selectedFile.name}
              >
                {selectedFile.name}
              </Typography>

              {embedLoading ? (
                <Chip
                  label="Carregando..."
                  size="small"
                  sx={{ bgcolor: "#F0F2F5", color: "#475569", fontWeight: 900, height: 22, fontSize: "0.68rem" }}
                />
              ) : null}
            </Box>

            <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
              <Button
                onClick={handleOpenNewTab}
                variant="outlined"
                startIcon={<OpenInNewIcon />}
                disabled={!selectedFile.url}
                sx={{
                  textTransform: "none",
                  borderRadius: 2,
                  borderColor: "#E4E6EB",
                  color: "#212121",
                  fontWeight: 900,
                  "&:hover": { borderColor: "#CBD5E1", backgroundColor: "#fff" },
                }}
              >
                Nova aba
              </Button>

              <Button
                onClick={handleDownload}
                variant="contained"
                startIcon={<DownloadIcon />}
                disabled={!selectedFile.url}
                sx={{
                  bgcolor: "#1877F2",
                  "&:hover": { bgcolor: "#166FE5" },
                  textTransform: "none",
                  fontWeight: 950,
                  borderRadius: 2,
                  boxShadow: "none",
                }}
              >
                Baixar
              </Button>
            </Box>
          </Box>

          {/* Viewer */}
          <Box sx={{ height: cfg.height, bgcolor: "#fff" }}>
            {isImage(selectedFile.mimeType, selectedFile.name) ? (
              <Box
                component="img"
                src={selectedFile.url}
                alt={selectedFile.name}
                onLoad={markEmbedOk}
                onError={markEmbedFail}
                sx={{ width: "100%", height: "100%", objectFit: "contain", bgcolor: "#fff" }}
              />
            ) : (
              <Box
                component="iframe"
                src={selectedFile.url}
                title={selectedFile.name}
                onLoad={markEmbedOk}
                sx={{ width: "100%", height: "100%", border: 0 }}
              />
            )}
          </Box>
        </Box>
      ) : (
        <Box
          sx={{
            height: cfg.height,
            borderRadius: 2,
            border: "1px dashed #CBD5E1",
            bgcolor: "#F8FAFC",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
            gap: 1,
            textAlign: "center",
            px: 2,
          }}
        >
          <Box sx={{ color: "#1877F2" }}>{pickIcon(selectedFile.mimeType, selectedFile.name)}</Box>

          <Typography sx={{ fontWeight: 950, color: "#0f172a" }}>
            Não foi possível carregar a prévia aqui
          </Typography>

          <Typography variant="body2" sx={{ color: "#64748b", maxWidth: 560, fontWeight: 700 }}>
            Em alguns casos, o arquivo bloqueia a visualização dentro do sistema. Use os botões abaixo para abrir completo.
          </Typography>

          <Box sx={{ display: "flex", gap: 1, mt: 1, flexWrap: "wrap", justifyContent: "center" }}>
            <Button
              onClick={handleOpenNewTab}
              variant="contained"
              startIcon={<OpenInNewIcon />}
              disabled={!selectedFile?.url}
              sx={{
                bgcolor: "#1877F2",
                "&:hover": { bgcolor: "#166FE5" },
                textTransform: "none",
                fontWeight: 950,
                borderRadius: 2,
                boxShadow: "none",
                px: 2.5,
              }}
            >
              Abrir em nova aba
            </Button>

            <Button
              onClick={handleDownload}
              variant="outlined"
              startIcon={<DownloadIcon />}
              disabled={!selectedFile?.url}
              sx={{
                textTransform: "none",
                borderRadius: 2,
                borderColor: "#E4E6EB",
                color: "#212121",
                fontWeight: 900,
                "&:hover": { borderColor: "#CBD5E1", backgroundColor: "#fff" },
              }}
            >
              Baixar
            </Button>

            {previewEnabled ? (
              <Button
                onClick={() => {
                  setEmbedFailed(false);
                  setEmbedLoading(false);
                }}
                variant="text"
                sx={{ textTransform: "none", fontWeight: 900, color: "#1877F2" }}
              >
                Tentar novamente
              </Button>
            ) : null}
          </Box>
        </Box>
      )}
    </BaseStageComponentCard>
  );
};
