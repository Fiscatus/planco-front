import { useEffect, useMemo, useRef, useState } from "react";
import {
  Box,
  Button,
  Chip,
  Divider,
  IconButton,
  Tooltip,
  Typography,
  Menu,
  MenuItem,
} from "@mui/material";
import {
  Folder as FolderIcon,
  UploadFile as UploadFileIcon,
  MoreVert as MoreVertIcon,
  Visibility as VisibilityIcon,
  Download as DownloadIcon,
  Delete as DeleteIcon,
  Label as LabelIcon,
} from "@mui/icons-material";
import type { StageComponentRuntimeProps } from "../componentRegistry";
import { BaseStageComponentCard } from "./BaseStageComponentCard";

type FileItem = {
  id: string;
  name: string;
  sizeBytes?: number;
  mimeType?: string;
  category?: string;
  createdAt?: string;
  version?: number;
};

function formatBytes(n?: number) {
  if (!n || !Number.isFinite(n)) return "";
  const units = ["B", "KB", "MB", "GB"];
  let value = n;
  let idx = 0;
  while (value >= 1024 && idx < units.length - 1) {
    value /= 1024;
    idx += 1;
  }
  return `${value.toFixed(value >= 10 || idx === 0 ? 0 : 1)} ${units[idx]}`;
}

function safeString(v: unknown) {
  return String(v ?? "").trim();
}

function safeArrayOfStrings(v: unknown): string[] {
  if (!Array.isArray(v)) return [];
  return v.map((x) => safeString(x)).filter(Boolean);
}

export const FilesManagementComponent = ({
  component,
  isReadOnly,
  stageCompleted,
  onEvent,
}: StageComponentRuntimeProps) => {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const cfg = useMemo(() => {
    const raw = (component.config ?? {}) as Record<string, unknown>;

    const categories = safeArrayOfStrings(raw.categories);
    const maxFiles =
      typeof raw.maxFiles === "number" &&
      Number.isFinite(raw.maxFiles) &&
      raw.maxFiles > 0
        ? Math.floor(raw.maxFiles)
        : 20;

    const maxSizeMB =
      typeof raw.maxSizeMB === "number" &&
      Number.isFinite(raw.maxSizeMB) &&
      raw.maxSizeMB > 0
        ? raw.maxSizeMB
        : 25;

    const accept = safeString(raw.accept) || "application/pdf,image/*";
    const multiple = raw.multiple === false ? false : true;

    const showVersions = raw.showVersions === true;
    const requiredCategories = raw.requiredCategories === true;

    return {
      categories,
      maxFiles,
      maxSizeMB,
      accept,
      multiple,
      showVersions,
      requiredCategories,
    };
  }, [component.config]);

  // Preview/runtime local (sem backend): se quiser plugar com dados reais depois,
  // basta alimentar via component.config.files ou via runtime state do processo.
  const initialFiles = useMemo(() => {
    const raw = (component.config ?? {}) as Record<string, unknown>;
    const files = raw.files as unknown;

    if (!Array.isArray(files)) return [] as FileItem[];

    return files
      .map((f) => {
        const obj = (f ?? {}) as Record<string, unknown>;
        const id = safeString(obj.id) || safeString(obj._id) || "";
        const name = safeString(obj.name);
        if (!id || !name) return null;

        return {
          id,
          name,
          sizeBytes:
            typeof obj.sizeBytes === "number" && Number.isFinite(obj.sizeBytes)
              ? obj.sizeBytes
              : undefined,
          mimeType: safeString(obj.mimeType) || undefined,
          category: safeString(obj.category) || undefined,
          createdAt: safeString(obj.createdAt) || undefined,
          version:
            typeof obj.version === "number" && Number.isFinite(obj.version)
              ? obj.version
              : undefined,
        } as FileItem;
      })
      .filter(Boolean) as FileItem[];
  }, [component.config]);

  const [localFiles, setLocalFiles] = useState<FileItem[]>(initialFiles);

  // Se config mudar (ex: edição do modelo), reseta a lista local
  // para manter previsibilidade no preview.
  // (Se você preferir “não resetar”, removemos esse comportamento.)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    setLocalFiles(initialFiles);
  }, [initialFiles]);

  const canAddMore = localFiles.length < cfg.maxFiles;

  const emitList = (files: FileItem[]) => {
    onEvent?.("files:setList", {
      componentKey: component.key,
      files: files.map((f) => ({
        id: f.id,
        name: f.name,
        sizeBytes: f.sizeBytes,
        mimeType: f.mimeType,
        category: f.category,
        createdAt: f.createdAt,
        version: f.version,
      })),
    });
  };

  const handleClickAdd = () => {
    if (isReadOnly) return;
    if (!canAddMore) return;
    inputRef.current?.click();
  };

  const handleFilesSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isReadOnly) return;

    const list = e.target.files;
    if (!list || list.length === 0) return;

    const maxBytes = cfg.maxSizeMB * 1024 * 1024;

    const picked = Array.from(list)
      .slice(0, cfg.multiple ? list.length : 1)
      .filter((f) => {
        if (!f.name) return false;
        if (f.size && f.size > maxBytes) return false;
        return true;
      });

    if (!picked.length) {
      e.target.value = "";
      return;
    }

    // Cria itens locais “fake” pra preview
    const newItems: FileItem[] = picked
      .slice(0, cfg.maxFiles - localFiles.length)
      .map((f) => ({
        id: `local_${Date.now()}_${Math.random().toString(16).slice(2)}`,
        name: f.name,
        sizeBytes: f.size,
        mimeType: f.type,
        category: cfg.categories[0] || undefined,
        createdAt: new Date().toISOString(),
        version: cfg.showVersions ? 1 : undefined,
      }));

    setLocalFiles((prev) => {
      const next = [...prev, ...newItems];
      emitList(next);
      return next;
    });

    onEvent?.("files:add", {
      componentKey: component.key,
      files: picked.map((f) => ({
        name: f.name,
        sizeBytes: f.size,
        mimeType: f.type,
      })),
    });

    e.target.value = "";
  };

  const handleRemove = (fileId: string) => {
    if (isReadOnly) return;
    const ok = window.confirm("Remover este arquivo?");
    if (!ok) return;

    setLocalFiles((prev) => {
      const next = prev.filter((x) => x.id !== fileId);
      emitList(next);
      return next;
    });

    onEvent?.("files:remove", { componentKey: component.key, fileId });
  };

  const handleOpen = (fileId: string) => {
    onEvent?.("files:select", { componentKey: component.key, fileId });
    onEvent?.("files:open", { componentKey: component.key, fileId });
  };

  const handleDownload = (fileId: string) => {
    onEvent?.("files:download", { componentKey: component.key, fileId });
  };

  return (
    <BaseStageComponentCard
      title={component.label}
      subtitle={component.description}
      icon={<FolderIcon sx={{ fontSize: 18 }} />}
      required={component.required}
      lockedAfterCompletion={component.lockedAfterCompletion}
      isReadOnly={isReadOnly}
      rightSlot={
        <Chip
          icon={<LabelIcon sx={{ fontSize: 16 }} />}
          label={`${localFiles.length}/${cfg.maxFiles}`}
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
      }
    >
      {/* Hidden input */}
      <input
        ref={inputRef}
        type="file"
        hidden
        multiple={cfg.multiple}
        accept={cfg.accept}
        onChange={handleFilesSelected}
      />

      {/* Top actions */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 2,
        }}
      >
        <Box
          sx={{
            display: "flex",
            gap: 1,
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          {cfg.categories.length ? (
            <Chip
              label={`${cfg.categories.length} categoria(s)`}
              size="small"
              sx={{
                bgcolor: "#F0F2F5",
                color: "#616161",
                fontWeight: 800,
                fontSize: "0.75rem",
                height: 24,
              }}
            />
          ) : null}

          {cfg.showVersions ? (
            <Chip
              label="Versões"
              size="small"
              sx={{
                bgcolor: "#F0F2F5",
                color: "#616161",
                fontWeight: 800,
                fontSize: "0.75rem",
                height: 24,
              }}
            />
          ) : null}

          {stageCompleted ? (
            <Chip
              label="Etapa concluída"
              size="small"
              sx={{
                bgcolor: "#ECFDF3",
                color: "#065F46",
                fontWeight: 800,
                fontSize: "0.75rem",
                height: 24,
              }}
            />
          ) : null}
        </Box>

        <Button
          onClick={handleClickAdd}
          variant="contained"
          startIcon={<UploadFileIcon />}
          disabled={isReadOnly || !canAddMore}
          sx={{
            bgcolor: "#1877F2",
            "&:hover": { bgcolor: "#166FE5" },
            textTransform: "none",
            fontWeight: 800,
            borderRadius: 2,
            boxShadow: "none",
            px: 2.25,
            "&:disabled": { bgcolor: "#E4E6EB", color: "#8A8D91" },
          }}
        >
          Adicionar
        </Button>
      </Box>

      <Divider sx={{ my: 2 }} />

      {/* Empty state */}
      {localFiles.length === 0 ? (
        <Box sx={{ py: 2.5, textAlign: "center" }}>
          <Typography sx={{ fontWeight: 800, color: "#212121", mb: 0.5 }}>
            Nenhum arquivo anexado
          </Typography>
          <Typography variant="body2" sx={{ color: "#616161" }}>
            {isReadOnly
              ? "Este componente está em modo somente leitura."
              : `Clique em “Adicionar” para anexar arquivos${
                  cfg.requiredCategories ? " e selecionar categorias" : ""
                }.`}
          </Typography>
          <Typography
            variant="caption"
            sx={{ color: "#94a3b8", display: "block", mt: 1 }}
          >
            Limite: {cfg.maxFiles} arquivo(s) • Tamanho máx.: {cfg.maxSizeMB}MB
          </Typography>
        </Box>
      ) : (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.25 }}>
          {localFiles.map((f) => (
            <FileRow
              key={f.id}
              file={f}
              isReadOnly={isReadOnly}
              showVersions={cfg.showVersions}
              categories={cfg.categories}
              onOpen={handleOpen}
              onDownload={handleDownload}
              onRemove={handleRemove}
              onChangeCategory={(fileId, category) => {
                if (isReadOnly) return;

                setLocalFiles((prev) => {
                  const next = prev.map((x) =>
                    x.id === fileId ? { ...x, category } : x,
                  );
                  emitList(next);
                  return next;
                });

                onEvent?.("files:update", {
                  componentKey: component.key,
                  fileId,
                  patch: { category },
                });
              }}
            />
          ))}
        </Box>
      )}
    </BaseStageComponentCard>
  );
};

type FileRowProps = {
  file: FileItem;
  isReadOnly: boolean;
  showVersions: boolean;
  categories: string[];
  onOpen: (fileId: string) => void;
  onDownload: (fileId: string) => void;
  onRemove: (fileId: string) => void;
  onChangeCategory: (fileId: string, category: string) => void;
};

const FileRow = ({
  file,
  isReadOnly,
  showVersions,
  categories,
  onOpen,
  onDownload,
  onRemove,
  onChangeCategory,
}: FileRowProps) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const openMenu = (e: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(e.currentTarget);
  };
  const closeMenu = () => setAnchorEl(null);

  return (
    <Box
      sx={{
        border: "1px solid #E4E6EB",
        borderRadius: 2,
        bgcolor: "#FAFBFC",
        px: 2,
        py: 1.5,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 2,
      }}
    >
      <Box sx={{ minWidth: 0 }}>
        <Typography
          sx={{
            fontWeight: 800,
            color: "#212121",
            fontSize: "0.9rem",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {file.name}
        </Typography>

        <Box
          sx={{
            display: "flex",
            gap: 1,
            flexWrap: "wrap",
            mt: 0.5,
            alignItems: "center",
          }}
        >
          {file.sizeBytes ? (
            <Chip
              label={formatBytes(file.sizeBytes)}
              size="small"
              sx={{
                bgcolor: "#F0F2F5",
                color: "#616161",
                fontWeight: 800,
                fontSize: "0.75rem",
                height: 22,
              }}
            />
          ) : null}

          {showVersions && file.version ? (
            <Chip
              label={`v${file.version}`}
              size="small"
              sx={{
                bgcolor: "#E7F3FF",
                color: "#1877F2",
                fontWeight: 800,
                fontSize: "0.75rem",
                height: 22,
              }}
            />
          ) : null}

          {categories.length ? (
            <Chip
              label={file.category || "Sem categoria"}
              size="small"
              sx={{
                bgcolor: file.category ? "#ECFDF3" : "#FEF3C7",
                color: file.category ? "#065F46" : "#92400E",
                fontWeight: 800,
                fontSize: "0.75rem",
                height: 22,
                cursor: isReadOnly ? "default" : "pointer",
              }}
              onClick={() => {
                if (isReadOnly) return;
                // troca rápida: alterna entre categorias
                const idx = Math.max(
                  0,
                  categories.indexOf(file.category || ""),
                );
                const next = categories[(idx + 1) % categories.length];
                onChangeCategory(file.id, next);
              }}
            />
          ) : null}
        </Box>
      </Box>

      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <Tooltip title="Ver">
          <span>
            <IconButton
              onClick={() => onOpen(file.id)}
              sx={{
                border: "1px solid #E4E6EB",
                borderRadius: 2,
                bgcolor: "#fff",
                "&:hover": { borderColor: "#1877F2", bgcolor: "#F0F9FF" },
              }}
            >
              <VisibilityIcon fontSize="small" sx={{ color: "#1877F2" }} />
            </IconButton>
          </span>
        </Tooltip>

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

        <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={closeMenu}>
          <MenuItem
            onClick={() => {
              closeMenu();
              onDownload(file.id);
            }}
          >
            <DownloadIcon sx={{ mr: 1, fontSize: 20, color: "#1877F2" }} />
            Baixar
          </MenuItem>

          {!isReadOnly && (
            <MenuItem
              onClick={() => {
                closeMenu();
                onRemove(file.id);
              }}
            >
              <DeleteIcon sx={{ mr: 1, fontSize: 20, color: "#F02849" }} />
              Remover
            </MenuItem>
          )}
        </Menu>
      </Box>
    </Box>
  );
};
