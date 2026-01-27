import { useMemo, useState } from "react";
import {
  Box,
  Button,
  Chip,
  Divider,
  IconButton,
  Menu,
  MenuItem,
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
};

function safeString(v: unknown) {
  return String(v ?? "").trim();
}

function pickIcon(mime?: string, name?: string) {
  const m = safeString(mime).toLowerCase();
  const n = safeString(name).toLowerCase();

  if (m.includes("pdf") || n.endsWith(".pdf"))
    return <PictureAsPdfIcon sx={{ fontSize: 18 }} />;
  if (m.startsWith("image/") || /\.(png|jpg|jpeg|webp|gif)$/i.test(n))
    return <ImageIcon sx={{ fontSize: 18 }} />;
  return <InsertDriveFileIcon sx={{ fontSize: 18 }} />;
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
      typeof raw.height === "number" &&
      Number.isFinite(raw.height) &&
      raw.height > 200
        ? Math.floor(raw.height)
        : 520;

    const allowSelectFromList =
      raw.allowSelectFromList === false ? false : true;

    const mode = safeString(raw.mode) as "embed" | "placeholder";
    const resolvedMode: "embed" | "placeholder" =
      mode === "placeholder" ? "placeholder" : "embed";

    const filesRaw = raw.files as unknown;
    const files: FileItem[] = Array.isArray(filesRaw)
      ? (filesRaw
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
                typeof obj.sizeBytes === "number" &&
                Number.isFinite(obj.sizeBytes)
                  ? obj.sizeBytes
                  : undefined,
              category: safeString(obj.category) || undefined,
            } as FileItem;
          })
          .filter(Boolean) as FileItem[])
      : [];

    const selectedRaw = raw.selectedFile as unknown;
    const selected =
      selectedRaw && typeof selectedRaw === "object"
        ? ({
            id:
              safeString((selectedRaw as any).id) ||
              safeString((selectedRaw as any)._id),
            name: safeString((selectedRaw as any).name),
            url: safeString((selectedRaw as any).url) || undefined,
            mimeType: safeString((selectedRaw as any).mimeType) || undefined,
            sizeBytes:
              typeof (selectedRaw as any).sizeBytes === "number" &&
              Number.isFinite((selectedRaw as any).sizeBytes)
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

  // selecionado: prioridade config.selectedFile, fallback primeiro da lista
  const selectedFile = useMemo(() => {
    if (cfg.selected?.id && cfg.selected?.name) return cfg.selected;

    if (cfg.files.length) return cfg.files[0];

    return null;
  }, [cfg.selected, cfg.files]);

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectEl, setSelectEl] = useState<null | HTMLElement>(null);

  const openMenu = (e: React.MouseEvent<HTMLElement>) =>
    setAnchorEl(e.currentTarget);
  const closeMenu = () => setAnchorEl(null);

  const openSelect = (e: React.MouseEvent<HTMLElement>) =>
    setSelectEl(e.currentTarget);
  const closeSelect = () => setSelectEl(null);

  const canSelect = cfg.allowSelectFromList && cfg.files.length > 1;

  const handleSelect = (fileId: string) => {
    closeSelect();

    const file = cfg.files.find((x) => x.id === fileId) || null;

    onEvent?.("files:select", {
      componentKey: component.key,
      fileId,
      file,
    });
  };

  const handleOpen = () => {
    if (!selectedFile?.id) return;
    onEvent?.("files:open", {
      componentKey: component.key,
      fileId: selectedFile.id,
    });
  };

  const handleDownload = () => {
    if (!selectedFile?.id) return;
    onEvent?.("files:download", {
      componentKey: component.key,
      fileId: selectedFile.id,
    });
  };

  const canEmbed =
    cfg.mode === "embed" &&
    !!selectedFile?.url &&
    (safeString(selectedFile.mimeType).startsWith("image/") ||
      safeString(selectedFile.mimeType).includes("pdf") ||
      /\.pdf$/i.test(safeString(selectedFile.name)));

  return (
    <BaseStageComponentCard
      title={component.label}
      subtitle={component.description}
      icon={<VisibilityIcon sx={{ fontSize: 18 }} />}
      required={component.required}
      lockedAfterCompletion={component.lockedAfterCompletion}
      isReadOnly={isReadOnly}
      rightSlot={
        selectedFile ? (
          <Chip
            icon={pickIcon(selectedFile.mimeType, selectedFile.name)}
            label={selectedFile.category ? selectedFile.category : "Arquivo"}
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
        )
      }
    >
      {/* Header actions */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 2,
        }}
      >
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

          <Typography variant="body2" sx={{ color: "#64748b", mt: 0.25 }}>
            {stageCompleted
              ? "Etapa concluída"
              : "Pré-visualização do arquivo selecionado"}
          </Typography>
        </Box>

        <Box
          sx={{ display: "flex", gap: 1, alignItems: "center", flexShrink: 0 }}
        >
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
                "&:hover": {
                  borderColor: "#CBD5E1",
                  backgroundColor: "#F8F9FA",
                },
              }}
            >
              Trocar
            </Button>
          ) : null}

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
        </Box>
      </Box>

      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={closeMenu}>
        <MenuItem
          onClick={() => {
            closeMenu();
            handleOpen();
          }}
          disabled={!selectedFile}
        >
          <VisibilityIcon sx={{ mr: 1, fontSize: 20, color: "#1877F2" }} />
          Abrir
        </MenuItem>

        <MenuItem
          onClick={() => {
            closeMenu();
            handleDownload();
          }}
          disabled={!selectedFile}
        >
          <DownloadIcon sx={{ mr: 1, fontSize: 20, color: "#1877F2" }} />
          Baixar
        </MenuItem>
      </Menu>

      <Menu anchorEl={selectEl} open={Boolean(selectEl)} onClose={closeSelect}>
        {cfg.files.map((f) => (
          <MenuItem
            key={f.id}
            onClick={() => handleSelect(f.id)}
            disabled={isReadOnly}
            sx={{ maxWidth: 420 }}
          >
            <Box
              sx={{
                display: "flex",
                gap: 1,
                alignItems: "center",
                minWidth: 0,
              }}
            >
              <Box sx={{ color: "#1877F2", flexShrink: 0 }}>
                {pickIcon(f.mimeType, f.name)}
              </Box>
              <Typography
                sx={{
                  fontWeight: 800,
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
            </Box>
          </MenuItem>
        ))}
      </Menu>

      <Divider sx={{ my: 2 }} />

      {/* Viewer area */}
      {!selectedFile ? (
        <Box sx={{ py: 2.5, textAlign: "center" }}>
          <Typography sx={{ fontWeight: 900, color: "#0f172a", mb: 0.5 }}>
            Nenhum arquivo disponível
          </Typography>
          <Typography variant="body2" sx={{ color: "#64748b" }}>
            Configure este componente com <strong>selectedFile</strong> ou
            forneça <strong>files</strong> em component.config.
          </Typography>
        </Box>
      ) : canEmbed ? (
        <Box
          sx={{
            height: cfg.height,
            borderRadius: 2,
            border: "1px solid #E4E6EB",
            overflow: "hidden",
            bgcolor: "#fff",
          }}
        >
          {/* PDF / image embed */}
          {safeString(selectedFile.mimeType).startsWith("image/") ? (
            <Box
              component="img"
              src={selectedFile.url}
              alt={selectedFile.name}
              sx={{
                width: "100%",
                height: "100%",
                objectFit: "contain",
                bgcolor: "#fff",
              }}
            />
          ) : (
            <Box
              component="iframe"
              src={selectedFile.url}
              title={selectedFile.name}
              sx={{ width: "100%", height: "100%", border: 0 }}
            />
          )}
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
          <Box sx={{ color: "#1877F2" }}>
            {pickIcon(selectedFile.mimeType, selectedFile.name)}
          </Box>
          <Typography sx={{ fontWeight: 900, color: "#0f172a" }}>
            Visualização indisponível na prévia
          </Typography>
          <Typography variant="body2" sx={{ color: "#64748b", maxWidth: 520 }}>
            Para habilitar preview, informe <strong>url</strong> e{" "}
            <strong>mimeType</strong> (PDF ou imagem) em{" "}
            <code>component.config.selectedFile</code>.
          </Typography>

          <Box sx={{ display: "flex", gap: 1, mt: 1 }}>
            <Button
              onClick={handleOpen}
              variant="contained"
              disabled={!selectedFile}
              sx={{
                bgcolor: "#1877F2",
                "&:hover": { bgcolor: "#166FE5" },
                textTransform: "none",
                fontWeight: 900,
                borderRadius: 2,
                boxShadow: "none",
                px: 2.5,
              }}
            >
              Abrir
            </Button>
            <Button
              onClick={handleDownload}
              variant="outlined"
              disabled={!selectedFile}
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
          </Box>
        </Box>
      )}
    </BaseStageComponentCard>
  );
};
