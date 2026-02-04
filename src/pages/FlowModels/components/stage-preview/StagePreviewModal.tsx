// src/pages/FlowModels/components/stage-preview/StagePreviewModal.tsx

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  Box,
  Typography,
  IconButton,
  Chip,
  Divider,
  Tooltip,
} from "@mui/material";
import {
  Close as CloseIcon,
  OpenInFull as OpenInFullIcon,
  CloseFullscreen as CloseFullscreenIcon,
} from "@mui/icons-material";
import type { FlowModelComponent, FlowModelStage } from "@/hooks/useFlowModels";
import { StageComponentsRenderer } from "./StageComponentsRenderer";

type FileItem = {
  id: string;
  name: string;
  url?: string;
  mimeType?: string;
  sizeBytes?: number;
  category?: string;

  reviewStatus?: "draft" | "in_review" | "approved" | "rejected";
  reviewNote?: string;
  reviewedAt?: string;
  reviewedBy?: string;
};

type StagePreviewModalProps = {
  open: boolean;
  onClose: () => void;
  stage: FlowModelStage | null;

  userRoleIds?: string[];
  readOnly?: boolean;
  stageCompleted?: boolean;
};

function safeString(v: unknown) {
  return String(v ?? "").trim();
}

function normalizeReviewStatus(v: unknown): FileItem["reviewStatus"] | undefined {
  const s = safeString(v);
  if (s === "draft" || s === "in_review" || s === "approved" || s === "rejected") return s;
  return undefined;
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

        reviewStatus: normalizeReviewStatus(obj.reviewStatus),
        reviewNote: safeString(obj.reviewNote) || undefined,
        reviewedAt: safeString(obj.reviewedAt) || undefined,
        reviewedBy: safeString(obj.reviewedBy) || undefined,
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (viewerCfg.selectedFile as any) ??
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (managerCfg.selectedFile as any) ??
    null;

  const selectedFileId = selectedRaw ? safeString(selectedRaw.id) || safeString(selectedRaw._id) : "";

  return { files, selectedFileId };
}

/* =========================
 * Checklist Suggestions (auto)
 * ========================= */

type ChecklistSuggestion = {
  id: string;
  label: string;
  autoKey?: string;
  priority?: "low" | "medium" | "high";
  relatedComponentKey?: string;
  relatedComponentType?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  meta?: Record<string, any>;
};

function stableAutoKey(input: string) {
  const s = safeString(input).toLowerCase();
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return `k_${h.toString(16)}`;
}

function deriveChecklistSuggestions(components: FlowModelComponent[]): ChecklistSuggestion[] {
  const arr = Array.isArray(components) ? components : [];
  const out: ChecklistSuggestion[] = [];

  const hasType = (t: FlowModelComponent["type"]) => arr.some((c) => c.type === t);

  for (const c of arr) {
    if (c.type === ("CHECKLIST" as any)) continue;

    if (c.type === "FORM") {
      const label = `Preencher formulário: ${safeString(c.label) || "Formulário"}`;
      out.push({
        id: `auto_form_${c.key}`,
        label,
        autoKey: stableAutoKey(`FORM::${c.key}::${label}`),
        priority: c.required ? "high" : "medium",
        relatedComponentKey: c.key,
        relatedComponentType: c.type,
        meta: { required: !!c.required },
      });
    }

    if (c.type === "FILES_MANAGMENT") {
      const label = "Anexar documentos necessários";
      out.push({
        id: `auto_files_${c.key}`,
        label,
        autoKey: stableAutoKey(`FILES::${c.key}::${label}`),
        priority: "high",
        relatedComponentKey: c.key,
        relatedComponentType: c.type,
      });
    }

    if (c.type === "SIGNATURE") {
      const label = "Realizar assinatura eletrônica";
      out.push({
        id: `auto_signature_${c.key}`,
        label,
        autoKey: stableAutoKey(`SIGNATURE::${c.key}::${label}`),
        priority: "high",
        relatedComponentKey: c.key,
        relatedComponentType: c.type,
      });
    }

    if (c.type === "APPROVAL") {
      const label = "Obter aprovação da etapa";
      out.push({
        id: `auto_approval_${c.key}`,
        label,
        autoKey: stableAutoKey(`APPROVAL::${c.key}::${label}`),
        priority: "high",
        relatedComponentKey: c.key,
        relatedComponentType: c.type,
      });
    }

    if (c.type === "COMMENTS") {
      const label = "Registrar observações/decisões nos comentários";
      out.push({
        id: `auto_comments_${c.key}`,
        label,
        autoKey: stableAutoKey(`COMMENTS::${c.key}::${label}`),
        priority: "medium",
        relatedComponentKey: c.key,
        relatedComponentType: c.type,
      });
    }

    if (c.type === "TIMELINE") {
      const label = "Conferir prazos e eventos no cronograma";
      out.push({
        id: `auto_timeline_${c.key}`,
        label,
        autoKey: stableAutoKey(`TIMELINE::${c.key}::${label}`),
        priority: "medium",
        relatedComponentKey: c.key,
        relatedComponentType: c.type,
      });
    }

    if (c.type === "FILE_VIEWER") {
      const label = "Revisar arquivos anexados no visualizador";
      out.push({
        id: `auto_viewer_${c.key}`,
        label,
        autoKey: stableAutoKey(`VIEWER::${c.key}::${label}`),
        priority: "medium",
        relatedComponentKey: c.key,
        relatedComponentType: c.type,
      });
    }
  }

  if (hasType("FILES_MANAGMENT") && hasType("FORM")) {
    const label = "Conferir se anexos batem com as informações do formulário";
    out.push({
      id: "auto_cross_files_form",
      label,
      autoKey: stableAutoKey(`CROSS::FILES+FORM::${label}`),
      priority: "medium",
      relatedComponentType: "CROSS",
    });
  }

  const seen = new Set<string>();
  return out.filter((x) => {
    const k = x.autoKey || x.id;
    if (!k) return false;
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}

function isDevEnv() {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const anyImportMeta = import.meta as any;
    if (anyImportMeta?.env?.DEV === true) return true;
  } catch {
    // ignore
  }

  // eslint-disable-next-line no-undef
  return typeof process !== "undefined" && process.env?.NODE_ENV !== "production";
}

/* =========================
 * LocalStorage + Keys
 * ========================= */

const LS_KEY_EXPANDED = "planco:stagePreview:expanded";

/* =========================
 * Helpers: DOM safe
 * ========================= */

function escapeCssId(id: string) {
  try {
    // alguns browsers têm CSS.escape; outros não
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const w = window as any;
    const esc = w?.CSS?.escape;
    if (typeof esc === "function") return esc(id);
  } catch {
    // ignore
  }

  // fallback conservador (serve para ids simples)
  return id.replace(/([ #;?%&,.+*~\':"!^$[\]()=>|/@])/g, "\\$1");
}

function raf2(cb: () => void) {
  requestAnimationFrame(() => requestAnimationFrame(cb));
}

/* =========================
 * Component
 * ========================= */

export const StagePreviewModal = ({
  open,
  onClose,
  stage,
  userRoleIds = [],
  readOnly = false,
  stageCompleted = false,
}: StagePreviewModalProps) => {
  const [runtimeComponents, setRuntimeComponents] = useState<FlowModelComponent[]>([]);
  const [runtimeFiles, setRuntimeFiles] = useState<FileItem[]>([]);
  const [runtimeSelectedFileId, setRuntimeSelectedFileId] = useState<string>("");

  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  const [highlightedAnchorId, setHighlightedAnchorId] = useState<string | null>(null);

  const highlightAnchor = useCallback((anchorId: string) => {
    setHighlightedAnchorId(anchorId);
    window.setTimeout(() => {
      setHighlightedAnchorId((prev) => (prev === anchorId ? null : prev));
    }, 1100);
  }, []);

  const [expanded, setExpanded] = useState(false);

  const readExpandedFromStorage = useCallback(() => {
    try {
      const raw = localStorage.getItem(LS_KEY_EXPANDED);
      return raw === "1";
    } catch {
      return false;
    }
  }, []);

  const persistExpanded = useCallback((v: boolean) => {
    try {
      localStorage.setItem(LS_KEY_EXPANDED, v ? "1" : "0");
    } catch {
      // ignore
    }
  }, []);

  const setExpandedSafe = useCallback(
    (next: boolean) => {
      setExpanded(next);
      persistExpanded(next);
    },
    [persistExpanded],
  );

  const toggleExpanded = useCallback(() => {
    setExpanded((prev) => {
      const next = !prev;
      persistExpanded(next);
      return next;
    });
  }, [persistExpanded]);

  useEffect(() => {
    if (!open) return;

    setExpandedSafe(readExpandedFromStorage());

    if (!stage) {
      setRuntimeFiles([]);
      setRuntimeSelectedFileId("");
      setRuntimeComponents([]);
      setHighlightedAnchorId(null);
      return;
    }

    setRuntimeComponents(stage.components || []);

    const boot = extractViewerBootstrap(stage.components || []);
    setRuntimeFiles(boot.files || []);
    setRuntimeSelectedFileId(boot.selectedFileId || "");
    setHighlightedAnchorId(null);
  }, [open, stage, readExpandedFromStorage, setExpandedSafe]);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e: KeyboardEvent) => {
      const key = (e.key || "").toLowerCase();

      const target = e.target as HTMLElement | null;
      const tag = (target?.tagName || "").toLowerCase();
      const isTypingSurface =
        tag === "input" || tag === "textarea" || target?.getAttribute?.("contenteditable") === "true";

      if (key === "f") {
        if (isTypingSurface) return;
        e.preventDefault();
        toggleExpanded();
        return;
      }

      if (key === "escape") {
        e.preventDefault();
        if (expanded) setExpandedSafe(false);
        else onClose();
      }
    };

    window.addEventListener("keydown", onKeyDown, { passive: false });
    return () => window.removeEventListener("keydown", onKeyDown as any);
  }, [open, expanded, onClose, toggleExpanded, setExpandedSafe]);

  const selectedFile = useMemo(() => {
    if (!runtimeFiles.length) return null;

    if (runtimeSelectedFileId) {
      const found = runtimeFiles.find((f) => f.id === runtimeSelectedFileId);
      if (found) return found;
    }

    return runtimeFiles[0];
  }, [runtimeFiles, runtimeSelectedFileId]);

  const componentsForRender = useMemo(() => {
    const arr = Array.isArray(runtimeComponents) ? runtimeComponents.slice() : [];
    const autoSuggestions = deriveChecklistSuggestions(arr);

    return arr.map((c) => {
      if (c.type === ("CHECKLIST" as any)) {
        const currentCfg = (c.config ?? {}) as Record<string, unknown>;
        return {
          ...c,
          config: {
            ...currentCfg,
            autoSuggestions,
            stageContext: {
              stageName: safeString(stage?.name),
              stageId: safeString((stage as any)?.stageId),
              stageCompleted,
            },
          },
        };
      }

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
  }, [runtimeComponents, runtimeFiles, selectedFile, stage, stageCompleted]);

  const componentsCount = stage?.components?.length || 0;

  const outerGutterX = expanded ? { xs: 2, sm: 3, md: 4 } : { xs: 1.5, sm: 2.25, md: 3 };
  const outerGutterY = expanded ? { xs: 2, sm: 2.5, md: 3 } : { xs: 1.5, sm: 2, md: 2.5 };
  const contentMaxWidth = expanded ? 1440 : 1180;

  const scrollToAnchorId = useCallback(
    (anchorId: string) => {
      const container = scrollContainerRef.current;
      if (!container) return;

      const selector = `#${escapeCssId(anchorId)}`;

      // ✅ espera layout estabilizar (evita “não rolou” quando DOM ainda está montando)
      raf2(() => {
        const el =
          (container.querySelector(selector) as HTMLElement | null) ??
          (document.getElementById(anchorId) as HTMLElement | null);

        if (!el) return;

        const cRect = container.getBoundingClientRect();
        const eRect = el.getBoundingClientRect();

        const paddingTop = 12;
        const nextTop = container.scrollTop + (eRect.top - cRect.top) - paddingTop;

        container.scrollTo({ top: Math.max(0, nextTop), behavior: "smooth" });
        highlightAnchor(anchorId);

        window.setTimeout(() => {
          const ctn = scrollContainerRef.current;
          if (!ctn) return;
          ctn.scrollBy({ top: -4, behavior: "smooth" });
        }, 240);
      });
    },
    [highlightAnchor],
  );

  const scrollToComponent = useCallback(
    (opts: {
      componentKey?: string;
      componentType?: FlowModelComponent["type"];
      preferredTypes?: FlowModelComponent["type"][];
    }) => {
      const list = Array.isArray(componentsForRender) ? componentsForRender : [];
      if (!list.length) return;

      const key = safeString(opts.componentKey);
      const type = safeString(opts.componentType) as FlowModelComponent["type"];
      const preferredTypes = Array.isArray(opts.preferredTypes) ? opts.preferredTypes : [];

      let target: FlowModelComponent | null = null;

      if (key) target = list.find((c) => safeString(c.key) === key) || null;
      if (!target && type) target = list.find((c) => c.type === type) || null;

      if (!target && preferredTypes.length) {
        for (const t of preferredTypes) {
          const found = list.find((c) => c.type === t);
          if (found) {
            target = found;
            break;
          }
        }
      }

      if (!target) return;

      const anchorId = `stage-comp-${safeString(target.key) || `order-${target.order}`}`;
      scrollToAnchorId(anchorId);
    },
    [componentsForRender, scrollToAnchorId],
  );

  const goToFilesManagement = useCallback(() => {
    // ✅ prioridade: Gerenciar Arquivos, fallback: Visualizador
    scrollToComponent({
      preferredTypes: ["FILES_MANAGMENT", "FILE_VIEWER"],
    });
  }, [scrollToComponent]);

  const handleEvent = useCallback(
    (eventType: string, payload?: Record<string, any>) => {
      if (isDevEnv()) {
        // eslint-disable-next-line no-console
        console.log("[STAGE_PREVIEW][EVENT]", eventType, payload || {});
      }

      // ✅ Clique do "Abrir arquivos" (StageSummaryCard)
      if (eventType === "stageSummary:openFiles") {
        goToFilesManagement();
        return;
      }

      // ✅ Genérico (caso algum componente use)
      if (eventType === "ui:scrollToComponent") {
        scrollToComponent({
          componentKey: payload?.componentKey,
          componentType: payload?.componentType,
          preferredTypes: payload?.preferredTypes,
        });
        return;
      }

      // FILES_MANAGMENT
      if (eventType === "files:setList") {
        const files = normalizeFiles(payload?.files);
        setRuntimeFiles(files);

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

      // FILE_VIEWER
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

      // APPROVAL (runtime)
      if (eventType === "approval:decision") {
        const componentKey = safeString(payload?.componentKey);
        const decision = safeString(payload?.decision);
        const justification = safeString(payload?.justification);
        const fileIds = Array.isArray(payload?.fileIds) ? payload?.fileIds : [];
        const filesTargetStatus = safeString(payload?.filesTargetStatus);
        const nowIso = new Date().toISOString();

        setRuntimeFiles((prev) => {
          if (!fileIds.length) return prev;

          return prev.map((f) => {
            if (!fileIds.includes(f.id)) return f;

            const targetStatus: FileItem["reviewStatus"] =
              filesTargetStatus === "approved" ? "approved" : "rejected";

            return {
              ...f,
              reviewStatus: targetStatus,
              reviewNote: justification || f.reviewNote,
              reviewedAt: nowIso,
              reviewedBy: "Preview",
            };
          });
        });

        setRuntimeComponents((prev) => {
          if (!componentKey) return prev;

          return prev.map((c) => {
            if (c.key !== componentKey) return c;

            const currentCfg = (c.config ?? {}) as Record<string, unknown>;
            const normalizedDecision =
              decision === "approved" || decision === "changes_requested" ? decision : undefined;

            return {
              ...c,
              config: {
                ...currentCfg,
                decision: normalizedDecision,
                justification,
                decidedAt: nowIso,
                decidedBy: "Preview",
              },
            };
          });
        });

        return;
      }
    },
    [goToFilesManagement, scrollToComponent],
  );

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullScreen={expanded}
      fullWidth
      maxWidth={expanded ? false : "lg"}
      PaperProps={{
        sx: {
          borderRadius: expanded ? 0 : { xs: 2, sm: 4 },
          margin: expanded ? 0 : { xs: 1, sm: 2 },

          width: expanded ? "100vw" : "min(1240px, 96vw)",
          height: expanded ? "100vh" : { xs: "calc(100vh - 16px)", sm: "min(86vh, 940px)" },
          maxHeight: expanded ? "100vh" : { xs: "calc(100vh - 16px)", sm: "min(86vh, 940px)" },

          boxShadow: expanded ? "none" : "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          bgcolor: "#ffffff",
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
            px: expanded ? { xs: 2, sm: 3, md: 4 } : { xs: 2, sm: 3, md: 4 },
            py: expanded ? { xs: 1.75, sm: 2, md: 2.25 } : { xs: 2, sm: 2.25, md: 2.5 },
            borderBottom: "1px solid #E4E6EB",
            flexShrink: 0,
            backgroundColor: "#ffffff",
            position: "sticky",
            top: 0,
            zIndex: 2,
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
                  color: "#0f172a",
                  fontSize: { xs: "1.25rem", sm: "1.375rem", md: "1.5rem" },
                  lineHeight: 1.2,
                }}
              >
                Prévia da Etapa
              </Typography>
              <Typography variant="body2" sx={{ color: "#475569", mt: 0.25, fontWeight: 650 }}>
                Visualização de como os componentes aparecerão dentro do card
              </Typography>
            </Box>

            <Box sx={{ display: "flex", gap: 0.75, alignItems: "center" }}>
              <Tooltip title={expanded ? "Sair da tela cheia (Esc)" : "Tela cheia (F)"} arrow>
                <IconButton
                  onClick={toggleExpanded}
                  aria-label={expanded ? "Sair da tela cheia" : "Tela cheia"}
                  sx={{
                    width: { xs: 36, sm: 40 },
                    height: { xs: 36, sm: 40 },
                    color: "#64748b",
                    "&:hover": { backgroundColor: "#f1f5f9" },
                  }}
                >
                  {expanded ? (
                    <CloseFullscreenIcon sx={{ fontSize: { xs: 18, sm: 20 } }} />
                  ) : (
                    <OpenInFullIcon sx={{ fontSize: { xs: 18, sm: 20 } }} />
                  )}
                </IconButton>
              </Tooltip>

              <Tooltip title={expanded ? "Fechar (Esc duas vezes)" : "Fechar (Esc)"} arrow>
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
              </Tooltip>
            </Box>
          </Box>

          {/* Header enxuto */}
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
                bgcolor: readOnly ? "#F1F5F9" : "#E7F3FF",
                color: readOnly ? "#475569" : "#1877F2",
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

            <Typography variant="body2" sx={{ color: "#0f172a", fontWeight: 850 }}>
              {stage?.name || "Etapa"}
            </Typography>

            <Typography variant="body2" sx={{ color: "#64748b", fontWeight: 700 }}>
              • {componentsCount} {componentsCount === 1 ? "componente" : "componentes"}
            </Typography>

            {expanded ? (
              <Chip
                label="Tela cheia"
                size="small"
                sx={{ bgcolor: "#0f172a", color: "#ffffff", fontWeight: 850 }}
              />
            ) : null}
          </Box>
        </Box>

        {/* Body */}
        <Box
          ref={scrollContainerRef}
          sx={{
            px: outerGutterX,
            py: outerGutterY,
            flex: 1,
            minHeight: 0,
            overflow: "auto",
            bgcolor: "#FAFBFC",
          }}
        >
          {!stage ? (
            <Typography variant="body2" sx={{ color: "#64748b", fontWeight: 650 }}>
              Nenhuma etapa selecionada.
            </Typography>
          ) : (
            <Box
              sx={{
                width: "100%",
                minWidth: 0,
                maxWidth: contentMaxWidth,
                mx: "auto",
              }}
            >
              <Box
                sx={{
                  width: "100%",
                  minWidth: 0,
                  bgcolor: "#fff",
                  border: "1px solid #E4E6EB",
                  borderRadius: 3,
                  overflow: "hidden",
                  p: expanded ? { xs: 2, sm: 2.5, md: 3 } : { xs: 1.75, sm: 2.25, md: 2.75 },
                }}
              >
                <StageComponentsRenderer
                  components={componentsForRender}
                  stage={stage}
                  stageComponents={componentsForRender}
                  userRoleIds={userRoleIds}
                  readOnly={readOnly}
                  stageCompleted={stageCompleted}
                  onEvent={handleEvent}
                  highlightedAnchorId={highlightedAnchorId}
                />
              </Box>

              <Box
                sx={{
                  mt: 1.25,
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: 1,
                  flexWrap: "wrap",
                }}
              >
                <Chip
                  label="F: Tela cheia"
                  size="small"
                  sx={{ bgcolor: "#F1F5F9", color: "#475569", fontWeight: 800 }}
                />
                <Chip
                  label="Esc: Sair/Fechar"
                  size="small"
                  sx={{ bgcolor: "#F1F5F9", color: "#475569", fontWeight: 800 }}
                />
              </Box>
            </Box>
          )}
        </Box>
      </DialogContent>
    </Dialog>
  );
};
