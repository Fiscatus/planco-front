import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  Box,
  Typography,
  IconButton,
  Chip,
  Divider,
} from "@mui/material";
import { Close as CloseIcon } from "@mui/icons-material";
import type { FlowModelComponent, FlowModelStage } from "@/hooks/useFlowModels";
import { StageComponentsRenderer } from "./StageComponentsRenderer";

type FileItem = {
  id: string;
  name: string;
  url?: string;
  mimeType?: string;
  sizeBytes?: number;
  category?: string;
};

type StagePreviewModalProps = {
  open: boolean;
  onClose: () => void;
  stage: FlowModelStage | null;

  // simula roles do usuário (no futuro vem do auth real)
  userRoleIds?: string[];

  /**
   * ✅ Preview precisa ser interativo por padrão, para testar componentes.
   * Se quiser travar, o chamador passa readOnly={true}.
   */
  readOnly?: boolean;

  // simula etapa concluída (pra testar lockedAfterCompletion)
  stageCompleted?: boolean;
};

function safeString(v: unknown) {
  return String(v ?? "").trim();
}

function normalizeFiles(raw: unknown): FileItem[] {
  if (!Array.isArray(raw)) return [];

  return raw
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
          typeof obj.sizeBytes === "number" && Number.isFinite(obj.sizeBytes)
            ? obj.sizeBytes
            : undefined,
        category: safeString(obj.category) || undefined,
      } as FileItem;
    })
    .filter(Boolean) as FileItem[];
}

function extractViewerBootstrap(components: FlowModelComponent[]) {
  const viewer = components.find((c) => c.type === "FILE_VIEWER");
  const manager = components.find((c) => c.type === "FILES_MANAGMENT");

  const viewerCfg = (viewer?.config ?? {}) as Record<string, unknown>;
  const managerCfg = (manager?.config ?? {}) as Record<string, unknown>;

  const viewerFiles = normalizeFiles(viewerCfg.files);
  const managerFiles = normalizeFiles(managerCfg.files);

  const files = viewerFiles.length ? viewerFiles : managerFiles;

  const selectedRaw =
    (viewerCfg.selectedFile as any) ?? (managerCfg.selectedFile as any) ?? null;

  const selectedFileId = selectedRaw
    ? safeString(selectedRaw.id) || safeString(selectedRaw._id)
    : "";

  return { files, selectedFileId };
}

function isDevEnv() {
  // Vite
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const anyImportMeta = import.meta as any;
    if (anyImportMeta?.env?.DEV === true) return true;
  } catch {
    // ignore
  }

  // CRA / Node-ish
  // eslint-disable-next-line no-undef
  return typeof process !== "undefined" && process.env?.NODE_ENV !== "production";
}

export const StagePreviewModal = ({
  open,
  onClose,
  stage,
  userRoleIds = [],
  readOnly = false, // ✅ default editável no preview
  stageCompleted = false,
}: StagePreviewModalProps) => {
  const baseComponents = stage?.components || [];

  // Runtime local (preview)
  const [runtimeFiles, setRuntimeFiles] = useState<FileItem[]>([]);
  const [runtimeSelectedFileId, setRuntimeSelectedFileId] =
    useState<string>("");

  // Bootstrap do runtime ao abrir modal / trocar stage
  useEffect(() => {
    if (!open) return;

    if (!stage) {
      setRuntimeFiles([]);
      setRuntimeSelectedFileId("");
      return;
    }

    const boot = extractViewerBootstrap(stage.components || []);
    setRuntimeFiles(boot.files || []);
    setRuntimeSelectedFileId(boot.selectedFileId || "");
  }, [open, stage]);

  const selectedFile = useMemo(() => {
    if (!runtimeFiles.length) return null;

    if (runtimeSelectedFileId) {
      const found = runtimeFiles.find((f) => f.id === runtimeSelectedFileId);
      if (found) return found;
    }

    return runtimeFiles[0];
  }, [runtimeFiles, runtimeSelectedFileId]);

  const handleEvent = useCallback((eventType: string, payload?: Record<string, any>) => {
    if (isDevEnv()) {
      // eslint-disable-next-line no-console
      console.log("[STAGE_PREVIEW][EVENT]", eventType, payload || {});
    }

    // =========================
    // Ponte FILES_MANAGMENT
    // =========================
    if (eventType === "files:setList") {
      const files = normalizeFiles(payload?.files);
      setRuntimeFiles(files);

      // mantém seleção se ainda existir; senão limpa (fallback será o primeiro)
      setRuntimeSelectedFileId((prev) => {
        if (!prev) return "";
        return files.some((f) => f.id === prev) ? prev : "";
      });

      return;
    }

    if (eventType === "files:select" || eventType === "files:open") {
      const fileId = safeString(payload?.fileId);
      if (fileId) setRuntimeSelectedFileId(fileId);
      return;
    }

    // =========================
    // Ponte FILE_VIEWER
    // =========================
    if (eventType === "fileViewer:select") {
      const fileId = safeString(payload?.fileId);
      if (fileId) setRuntimeSelectedFileId(fileId);
      return;
    }

    if (eventType === "fileViewer:open" || eventType === "fileViewer:download") {
      const fileId = safeString(payload?.fileId);
      if (fileId) setRuntimeSelectedFileId(fileId);
      return;
    }
  }, []);

  // ✅ injeta runtime config no FILE_VIEWER (e opcionalmente no FILES_MANAGMENT)
  const componentsForRender = useMemo(() => {
    const arr = Array.isArray(baseComponents) ? baseComponents.slice() : [];

    return arr.map((c) => {
      if (c.type === "FILE_VIEWER") {
        const currentCfg = (c.config ?? {}) as Record<string, unknown>;

        return {
          ...c,
          config: {
            ...currentCfg,
            files: runtimeFiles,
            selectedFile: selectedFile || undefined,
          },
        };
      }

      if (c.type === "FILES_MANAGMENT") {
        const currentCfg = (c.config ?? {}) as Record<string, unknown>;

        return {
          ...c,
          config: {
            ...currentCfg,
            files: runtimeFiles,
            selectedFile: selectedFile || undefined,
          },
        };
      }

      return c;
    });
  }, [baseComponents, runtimeFiles, selectedFile]);

  const componentsCount = stage?.components?.length || 0;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="md"
      PaperProps={{
        sx: {
          borderRadius: { xs: 2, sm: 3 },
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
          overflow: "hidden",
          margin: { xs: 1, sm: 2 },
          maxWidth: { xs: "calc(100% - 16px)", sm: "700px", md: "900px" },
          width: "100%",
          maxHeight: { xs: "calc(100vh - 32px)", sm: "calc(100vh - 64px)" },
          display: "flex",
          flexDirection: "column",
        },
      }}
    >
      <DialogContent
        sx={{
          p: 0,
          display: "flex",
          flexDirection: "column",
          flex: 1,
          minHeight: 0,
          overflow: "hidden",
          bgcolor: "#ffffff",
        }}
      >
        {/* Header */}
        <Box
          sx={{
            px: { xs: 2, sm: 3, md: 4 },
            py: { xs: 2, sm: 2.5, md: 3 },
            borderBottom: "1px solid #E4E6EB",
            flexShrink: 0,
            backgroundColor: "#ffffff",
          }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              mb: 1.25,
              gap: 1,
            }}
          >
            <Box sx={{ minWidth: 0 }}>
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 800,
                  color: "#212121",
                  fontSize: { xs: "1.25rem", sm: "1.375rem", md: "1.5rem" },
                  lineHeight: 1.2,
                }}
              >
                Prévia da Etapa
              </Typography>
              <Typography variant="body2" sx={{ color: "#616161", mt: 0.25 }}>
                Visualização de como os componentes aparecerão dentro do card
              </Typography>
            </Box>

            <IconButton
              onClick={onClose}
              aria-label="Fechar prévia"
              sx={{
                width: { xs: 36, sm: 40 },
                height: { xs: 36, sm: 40 },
                color: "#64748b",
                "&:hover": { backgroundColor: "#f1f5f9" },
              }}
            >
              <CloseIcon sx={{ fontSize: { xs: 18, sm: 20 } }} />
            </IconButton>
          </Box>

          <Box
            sx={{
              display: "flex",
              gap: 1,
              flexWrap: "wrap",
              alignItems: "center",
            }}
          >
            <Chip
              label={readOnly ? "Somente leitura" : "Editável"}
              size="small"
              sx={{
                bgcolor: readOnly ? "#F0F2F5" : "#E7F3FF",
                color: readOnly ? "#616161" : "#1877F2",
                fontWeight: 800,
              }}
            />
            <Chip
              label={stageCompleted ? "Etapa concluída" : "Etapa em andamento"}
              size="small"
              sx={{
                bgcolor: stageCompleted ? "#ECFDF3" : "#FEF3C7",
                color: stageCompleted ? "#065F46" : "#92400E",
                fontWeight: 800,
              }}
            />
            <Divider flexItem orientation="vertical" sx={{ mx: 0.5 }} />
            <Typography
              variant="body2"
              sx={{ color: "#212121", fontWeight: 800 }}
            >
              {stage?.name || "Etapa"}
            </Typography>
            <Typography variant="body2" sx={{ color: "#616161" }}>
              • {componentsCount}{" "}
              {componentsCount === 1 ? "componente" : "componentes"}
            </Typography>

            {runtimeFiles.length ? (
              <Chip
                label={`Arquivos: ${runtimeFiles.length}`}
                size="small"
                sx={{
                  bgcolor: "#E7F3FF",
                  color: "#1877F2",
                  fontWeight: 800,
                }}
              />
            ) : null}

            {selectedFile?.name ? (
              <Chip
                label={`Selecionado: ${selectedFile.name}`}
                size="small"
                sx={{
                  bgcolor: "#F0F2F5",
                  color: "#212121",
                  fontWeight: 800,
                  maxWidth: 360,
                  "& .MuiChip-label": {
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  },
                }}
              />
            ) : null}
          </Box>
        </Box>

        {/* Body */}
        <Box
          sx={{
            px: { xs: 2, sm: 3, md: 4 },
            py: { xs: 2, sm: 2.5, md: 3 },
            flex: 1,
            minHeight: 0,
            overflow: "auto",
            bgcolor: "#FAFBFC",
          }}
        >
          {!stage ? (
            <Typography variant="body2" sx={{ color: "#616161" }}>
              Nenhuma etapa selecionada.
            </Typography>
          ) : (
            <Box
              sx={{
                width: "100%",
                minWidth: 0,
                bgcolor: "#fff",
                border: "1px solid #E4E6EB",
                borderRadius: 3,
                p: { xs: 2, sm: 2.5, md: 3 },
              }}
            >
              <StageComponentsRenderer
                components={componentsForRender}
                userRoleIds={userRoleIds}
                readOnly={readOnly}
                stageCompleted={stageCompleted}
                onEvent={handleEvent}
              />
            </Box>
          )}
        </Box>
      </DialogContent>
    </Dialog>
  );
};
