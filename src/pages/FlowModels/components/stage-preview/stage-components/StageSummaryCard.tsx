// src/pages/FlowModels/components/stage-preview/StageSummaryCard.tsx

import { useMemo, useState, useCallback } from "react";
import {
  Box,
  Typography,
  Chip,
  Divider,
  Tooltip,
  IconButton,
  LinearProgress,
  Collapse,
  Button,
} from "@mui/material";
import {
  Insights as InsightsIcon,
  WarningAmber as WarningAmberIcon,
  CheckCircle as CheckCircleIcon,
  Folder as FolderIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  FolderOpen as FolderOpenIcon,
  ArrowDownward as ArrowDownwardIcon,
} from "@mui/icons-material";
import type { StageComponentRuntimeProps } from "../componentRegistry";

/**
 * Painel cognitivo da etapa:
 * - Resumo rápido e objetivo (sem duplicar header do modal)
 * - Heurísticas robustas para “pendência” mesmo sem backend pronto
 * - Preparado para evoluir (se no futuro você padronizar status por componente)
 */

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

function isTruthy(v: unknown) {
  return v === true || v === "true" || v === 1 || v === "1";
}

function normalizeStatusText(v: unknown) {
  return safeString(v).toLowerCase();
}

/**
 * Heurística conservadora:
 * - Se tiver algum campo explícito de conclusão/aprovação/assinatura => respeita
 * - Senão, tenta inferir por dados (ex: anexos > 0)
 * - Se não der pra inferir, considera “pendente” quando required = true
 */
function inferComponentDone(
  type: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  config: Record<string, any> | undefined,
): { done: boolean; reason?: string } {
  const cfg = (config ?? {}) as Record<string, any>;
  const status = normalizeStatusText(cfg.status);

  if (
    isTruthy(cfg.completed) ||
    isTruthy(cfg.isCompleted) ||
    status === "done" ||
    status === "completed"
  ) {
    return { done: true };
  }

  if (type === "APPROVAL") {
    const decision = normalizeStatusText(cfg.decision);
    if (decision === "approved" || status === "approved") return { done: true };
    if (decision === "changes_requested" || status === "rejected") {
      return { done: false, reason: "Aprovação com ressalvas/reprovada" };
    }
    return { done: false, reason: "Aguardando decisão de aprovação" };
  }

  if (type === "SIGNATURE") {
    if (status === "signed" || isTruthy(cfg.signed)) return { done: true };

    const signedCount = Number(cfg.signedCount ?? cfg.signaturesDone ?? NaN);
    const requiredCount = Number(cfg.requiredCount ?? cfg.signersTotal ?? NaN);
    if (
      Number.isFinite(signedCount) &&
      Number.isFinite(requiredCount) &&
      requiredCount > 0
    ) {
      const ok = signedCount >= requiredCount;
      return {
        done: ok,
        reason: ok
          ? undefined
          : `Faltam assinaturas (${signedCount}/${requiredCount})`,
      };
    }

    return { done: false, reason: "Aguardando assinatura" };
  }

  if (type === "FILES_MANAGMENT" || type === "FILE_VIEWER") {
    const files = normalizeFiles(cfg.files);
    const ok = files.length > 0;
    return { done: ok, reason: ok ? undefined : "Sem arquivos anexados" };
  }

  if (type === "CHECKLIST") {
    const checked = Number(cfg.checkedCount ?? cfg.doneCount ?? NaN);
    const total = Number(cfg.totalCount ?? cfg.itemsTotal ?? NaN);
    if (Number.isFinite(checked) && Number.isFinite(total) && total > 0) {
      const ok = checked >= total;
      return {
        done: ok,
        reason: ok ? undefined : `Checklist incompleto (${checked}/${total})`,
      };
    }

    if (Array.isArray(cfg.items)) {
      const items = cfg.items as any[];
      const total2 = items.length;
      const checked2 = items.filter((x) => x?.checked === true).length;
      if (total2 > 0) {
        const ok = checked2 >= total2;
        return {
          done: ok,
          reason: ok
            ? undefined
            : `Checklist incompleto (${checked2}/${total2})`,
        };
      }
    }

    return { done: false, reason: "Checklist pendente" };
  }

  if (type === "FORM") {
    const values = cfg.values ?? cfg.data ?? cfg.answers ?? null;
    if (values && typeof values === "object") {
      const keys = Object.keys(values);
      if (keys.length > 0) return { done: true };
    }
    return { done: false, reason: "Formulário não preenchido" };
  }

  if (type === "COMMENTS") {
    const count = Number(cfg.count ?? cfg.commentsCount ?? NaN);
    if (Number.isFinite(count))
      return {
        done: count > 0,
        reason: count > 0 ? undefined : "Sem comentários",
      };
    if (Array.isArray(cfg.comments))
      return {
        done: cfg.comments.length > 0,
        reason: cfg.comments.length ? undefined : "Sem comentários",
      };
    return { done: false, reason: "Sem comentários" };
  }

  if (type === "TIMELINE") {
    return { done: false, reason: "Conferir prazos no cronograma" };
  }

  return { done: false, reason: "Pendente" };
}

function friendlyTypeLabel(type: string) {
  switch (type) {
    case "FORM":
      return "Formulário";
    case "FILES_MANAGMENT":
      return "Gerenciar Arquivos";
    case "FILE_VIEWER":
      return "Visualizador de Arquivos";
    case "SIGNATURE":
      return "Assinatura";
    case "APPROVAL":
      return "Aprovação";
    case "COMMENTS":
      return "Comentários";
    case "TIMELINE":
      return "Cronograma";
    case "CHECKLIST":
      return "Checklist";
    case "STAGE_SUMMARY":
      return "Resumo da etapa";
    default:
      return safeString(type) || "Componente";
  }
}

export const StageSummaryCard = ({
  component,
  stageComponents,
  stageCompleted,
  onEvent,
}: StageComponentRuntimeProps) => {
  const [detailsOpen, setDetailsOpen] = useState(false);

  const allComponents = useMemo(() => {
    const base =
      Array.isArray(stageComponents) && stageComponents.length
        ? stageComponents
        : [];
    // não inclui ele mesmo
    return base.filter((c) => c?.type !== "STAGE_SUMMARY");
  }, [stageComponents]);

  const stats = useMemo(() => {
    const total = allComponents.length;

    const required = allComponents.filter((c) => !!c.required);
    const requiredTotal = required.length;

    const pendingRequired: Array<{
      key: string;
      type: string;
      label: string;
      reason?: string;
    }> = [];

    const doneRequiredKeys = new Set<string>();

    for (const c of required) {
      const key = safeString(c.key) || `${c.type}_${c.order}`;
      const label = safeString(c.label) || friendlyTypeLabel(String(c.type));
      const { done, reason } = inferComponentDone(String(c.type), c.config);

      if (done) doneRequiredKeys.add(key);
      else pendingRequired.push({ key, type: String(c.type), label, reason });
    }

    // arquivos (uniq por id) vindo de FILES_MANAGMENT/FILE_VIEWER
    const files = (() => {
      const collector: FileItem[] = [];
      for (const c of allComponents) {
        if (c.type === "FILES_MANAGMENT" || c.type === "FILE_VIEWER") {
          const cfg = (c.config ?? {}) as Record<string, any>;
          const f = normalizeFiles(cfg.files);
          if (f.length) collector.push(...f);
        }
      }
      const seen = new Set<string>();
      return collector.filter((f) => {
        if (!f?.id) return false;
        if (seen.has(f.id)) return false;
        seen.add(f.id);
        return true;
      });
    })();

    const filesCount = files.length;

    const requiredDone = doneRequiredKeys.size;
    const requiredPending = pendingRequired.length;

    const progress =
      requiredTotal > 0
        ? Math.round((requiredDone / requiredTotal) * 100)
        : 100;

    const status = stageCompleted
      ? "concluida"
      : requiredPending > 0
        ? "pendente"
        : "em_dia";

    // acha o primeiro componente de arquivos (para scroll)
    const filesComponentKey =
      allComponents.find((c) => c.type === "FILES_MANAGMENT")?.key ||
      allComponents.find((c) => c.type === "FILE_VIEWER")?.key ||
      "";

    return {
      total,
      requiredTotal,
      requiredDone,
      requiredPending,
      pendingRequired,
      filesCount,
      progress,
      status,
      filesComponentKey,
    };
  }, [allComponents, stageCompleted]);

  const headerTone = useMemo(() => {
    if (stats.status === "concluida") {
      return {
        icon: <CheckCircleIcon sx={{ fontSize: 18, color: "#16a34a" }} />,
        title: "Concluída",
        subtitle: "Todos os requisitos foram atendidos.",
        chipBg: "#ECFDF3",
        chipColor: "#065F46",
      };
    }

    if (stats.status === "pendente") {
      return {
        icon: <WarningAmberIcon sx={{ fontSize: 18, color: "#b45309" }} />,
        title: "Pendências",
        subtitle: "Há itens obrigatórios que precisam de ação.",
        chipBg: "#FEF3C7",
        chipColor: "#92400E",
      };
    }

    return {
      icon: <InsightsIcon sx={{ fontSize: 18, color: "#1877F2" }} />,
      title: "Em dia",
      subtitle: "Sem pendências obrigatórias no momento.",
      chipBg: "#E7F3FF",
      chipColor: "#1877F2",
    };
  }, [stats.status]);

  const handleToggleDetails = useCallback(() => {
    setDetailsOpen((v) => !v);
  }, []);

  // ✅ rolar até o componente de gerenciar arquivos
  const handleGoToFiles = useCallback(() => {
    if (!stats.filesComponentKey) return;

    onEvent?.("stageSummary:scrollToComponent", {
      targetKey: stats.filesComponentKey,
      targetType: "FILES_MANAGMENT",
      fromComponentKey: safeString(component?.key),
    });
  }, [onEvent, component, stats.filesComponentKey]);

  // ✅ rolar até a primeira pendência obrigatória
  const handleGoToFirstPending = useCallback(() => {
    const first = stats.pendingRequired[0];
    if (!first?.key) return;

    onEvent?.("stageSummary:scrollToComponent", {
      targetKey: first.key,
      targetType: first.type,
      fromComponentKey: safeString(component?.key),
    });
  }, [onEvent, component, stats.pendingRequired]);

  // ✅ ao clicar numa pendência: rolar direto pro componente
  const handleGoToPendingKey = useCallback(
    (key: string, type: string) => {
      const k = safeString(key);
      if (!k) return;

      onEvent?.("stageSummary:scrollToComponent", {
        targetKey: k,
        targetType: type,
        fromComponentKey: safeString(component?.key),
      });
    },
    [onEvent, component],
  );

  const progressColor =
    stats.status === "concluida"
      ? "#16a34a"
      : stats.status === "pendente"
        ? "#f59e0b"
        : "#1877F2";

  return (
    <Box
      sx={{
        width: "100%",
        minWidth: 0,
        border: "1px solid #E4E6EB",
        borderRadius: 3,
        overflow: "hidden",
        bgcolor: "#ffffff",
        boxShadow: "0 1px 2px rgba(16,24,40,0.06)",
      }}
    >
      {/* Header */}
      <Box
        sx={{
          px: { xs: 2, sm: 2.5 },
          py: { xs: 1.75, sm: 2 },
          bgcolor: "#FAFBFC",
          borderBottom: "1px solid #EEF2F7",
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 1.5,
        }}
      >
        <Box
          sx={{
            minWidth: 0,
            display: "flex",
            gap: 1.25,
            alignItems: "flex-start",
          }}
        >
          <Box
            sx={{
              mt: 0.25,
              width: 34,
              height: 34,
              borderRadius: 2,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              bgcolor: "#ffffff",
              border: "1px solid #EEF2F7",
            }}
          >
            {headerTone.icon}
          </Box>

          <Box sx={{ minWidth: 0 }}>
            <Typography
              sx={{
                fontWeight: 950,
                color: "#0f172a",
                lineHeight: 1.2,
              }}
            >
              {safeString(component?.label) || "Resumo da etapa"}
            </Typography>
            <Typography
              variant="body2"
              sx={{ color: "#475569", mt: 0.25, fontWeight: 650 }}
            >
              {headerTone.subtitle}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: "flex", gap: 0.75, alignItems: "center" }}>
          <Chip
            size="small"
            label={headerTone.title}
            sx={{
              bgcolor: headerTone.chipBg,
              color: headerTone.chipColor,
              fontWeight: 950,
              borderRadius: 999,
              height: 26,
            }}
          />

          <Tooltip
            title={detailsOpen ? "Ocultar detalhes" : "Ver detalhes"}
            arrow
          >
            <IconButton
              onClick={handleToggleDetails}
              size="small"
              sx={{
                width: 34,
                height: 34,
                border: "1px solid #E4E6EB",
                bgcolor: "#ffffff",
                color: "#475569",
                "&:hover": { bgcolor: "#F8FAFC" },
              }}
            >
              {detailsOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Body */}
      <Box
        sx={{
          p: { xs: 2, sm: 2.5 },
          display: "flex",
          flexDirection: "column",
          gap: 1.5,
        }}
      >
        {/* KPI Row */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
            gap: 1.5,
          }}
        >
          {/* Progresso */}
          <Box
            sx={{
              border: "1px solid #EEF2F7",
              borderRadius: 3,
              p: 1.5,
              bgcolor: "#ffffff",
            }}
          >
            <Typography
              variant="body2"
              sx={{ color: "#64748b", fontWeight: 900 }}
            >
              Obrigatórios
            </Typography>

            <Box
              sx={{
                display: "flex",
                alignItems: "baseline",
                justifyContent: "space-between",
                mt: 0.75,
              }}
            >
              <Typography
                sx={{
                  fontWeight: 950,
                  color: "#0f172a",
                  fontSize: "1.25rem",
                }}
              >
                {stats.requiredDone}/{stats.requiredTotal}
              </Typography>
              <Typography
                variant="body2"
                sx={{ color: "#64748b", fontWeight: 900 }}
              >
                {stats.progress}%
              </Typography>
            </Box>

            <LinearProgress
              variant="determinate"
              value={stats.progress}
              sx={{
                mt: 1,
                height: 8,
                borderRadius: 999,
                bgcolor: "#F1F5F9",
                "& .MuiLinearProgress-bar": {
                  borderRadius: 999,
                  backgroundColor: progressColor,
                },
              }}
            />

            <Box
              sx={{ display: "flex", gap: 0.75, flexWrap: "wrap", mt: 1.25 }}
            >
              <Chip
                size="small"
                label={`Pendentes: ${stats.requiredPending}`}
                sx={{
                  bgcolor: stats.requiredPending > 0 ? "#FEF3C7" : "#ECFDF3",
                  color: stats.requiredPending > 0 ? "#92400E" : "#065F46",
                  fontWeight: 950,
                }}
              />
              <Chip
                size="small"
                label={`Componentes: ${stats.total}`}
                sx={{
                  bgcolor: "#F1F5F9",
                  color: "#475569",
                  fontWeight: 950,
                }}
              />
            </Box>

            {stats.requiredPending > 0 ? (
              <Box
                sx={{ mt: 1.25, display: "flex", justifyContent: "flex-end" }}
              >
                <Button
                  size="small"
                  variant="contained"
                  onClick={handleGoToFirstPending}
                  disabled={!onEvent}
                  startIcon={<ArrowDownwardIcon />}
                  sx={{
                    textTransform: "none",
                    fontWeight: 950,
                    borderRadius: 2,
                    bgcolor: "#1877F2",
                    boxShadow: "none",
                    "&:hover": { bgcolor: "#166FE5" },
                  }}
                >
                  Ir para pendências
                </Button>
              </Box>
            ) : null}
          </Box>

          {/* Arquivos */}
          <Box
            sx={{
              border: "1px solid #EEF2F7",
              borderRadius: 3,
              p: 1.5,
              bgcolor: "#ffffff",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              gap: 1.25,
            }}
          >
            <Box>
              <Typography
                variant="body2"
                sx={{ color: "#64748b", fontWeight: 900 }}
              >
                Arquivos
              </Typography>

              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  mt: 0.75,
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Box
                    sx={{
                      width: 32,
                      height: 32,
                      borderRadius: 2,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      bgcolor: "#F1F5F9",
                      border: "1px solid #EEF2F7",
                    }}
                  >
                    <FolderIcon sx={{ fontSize: 18, color: "#475569" }} />
                  </Box>
                  <Typography
                    sx={{
                      fontWeight: 950,
                      color: "#0f172a",
                      fontSize: "1.25rem",
                    }}
                  >
                    {stats.filesCount}
                  </Typography>
                </Box>

                <Chip
                  size="small"
                  label={stats.filesCount > 0 ? "OK" : "Sem anexos"}
                  sx={{
                    bgcolor: stats.filesCount > 0 ? "#ECFDF3" : "#F1F5F9",
                    color: stats.filesCount > 0 ? "#065F46" : "#475569",
                    fontWeight: 950,
                  }}
                />
              </Box>
            </Box>

            <Box
              sx={{
                display: "flex",
                gap: 1,
                flexWrap: "wrap",
                justifyContent: "flex-end",
              }}
            >
              <Button
                size="small"
                variant="outlined"
                onClick={handleGoToFiles}
                disabled={!onEvent || !stats.filesComponentKey}
                startIcon={<FolderOpenIcon />}
                sx={{
                  textTransform: "none",
                  fontWeight: 900,
                  borderRadius: 2,
                  borderColor: "#E4E6EB",
                  color: "#0f172a",
                  bgcolor: "#ffffff",
                  "&:hover": { bgcolor: "#F8FAFC", borderColor: "#D8DADF" },
                }}
              >
                Ir para Gerenciar Arquivos
              </Button>
            </Box>
          </Box>
        </Box>

        {/* Details */}
        <Collapse in={detailsOpen} unmountOnExit>
          <Box
            sx={{
              mt: 0.5,
              border: "1px solid #EEF2F7",
              borderRadius: 3,
              overflow: "hidden",
              bgcolor: "#ffffff",
            }}
          >
            <Box
              sx={{
                px: 2,
                py: 1.5,
                bgcolor: "#FAFBFC",
                borderBottom: "1px solid #EEF2F7",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 1,
              }}
            >
              <Typography sx={{ fontWeight: 950, color: "#0f172a" }}>
                Pendências obrigatórias
              </Typography>

              <Chip
                size="small"
                label={`${stats.requiredPending}`}
                sx={{
                  bgcolor: stats.requiredPending > 0 ? "#FEF3C7" : "#ECFDF3",
                  color: stats.requiredPending > 0 ? "#92400E" : "#065F46",
                  fontWeight: 950,
                }}
              />
            </Box>

            <Box sx={{ p: 2 }}>
              {stats.requiredPending === 0 ? (
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <CheckCircleIcon sx={{ fontSize: 18, color: "#16a34a" }} />
                  <Typography
                    variant="body2"
                    sx={{ color: "#065F46", fontWeight: 900 }}
                  >
                    Nenhuma pendência obrigatória. Etapa pronta para avançar.
                  </Typography>
                </Box>
              ) : (
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                  {stats.pendingRequired.map((p) => (
                    <Box
                      key={p.key}
                      onClick={() => handleGoToPendingKey(p.key, p.type)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          handleGoToPendingKey(p.key, p.type);
                        }
                      }}
                      sx={{
                        display: "flex",
                        alignItems: "flex-start",
                        justifyContent: "space-between",
                        gap: 1.5,
                        p: 1.25,
                        borderRadius: 2,
                        border: "1px solid #EEF2F7",
                        bgcolor: "#ffffff",
                        cursor: onEvent ? "pointer" : "default",
                        outline: "none",
                        "&:hover": {
                          bgcolor: onEvent ? "#FAFBFC" : "#ffffff",
                          borderColor: onEvent ? "#E2E8F0" : "#EEF2F7",
                        },
                        "&:focus-visible": {
                          boxShadow: "0 0 0 3px rgba(59,130,246,0.18)",
                          borderColor: "#BFDBFE",
                        },
                      }}
                    >
                      <Box sx={{ minWidth: 0 }}>
                        <Typography
                          sx={{
                            fontWeight: 950,
                            color: "#0f172a",
                            lineHeight: 1.2,
                          }}
                        >
                          {p.label}
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{ color: "#64748b", fontWeight: 750, mt: 0.25 }}
                        >
                          {p.reason || friendlyTypeLabel(p.type)}
                        </Typography>
                      </Box>

                      <Chip
                        size="small"
                        label={friendlyTypeLabel(p.type)}
                        sx={{
                          bgcolor: "#F1F5F9",
                          color: "#475569",
                          fontWeight: 950,
                          flexShrink: 0,
                        }}
                      />
                    </Box>
                  ))}
                </Box>
              )}

              <Divider sx={{ my: 2 }} />

              <Typography
                variant="body2"
                sx={{ color: "#64748b", fontWeight: 750 }}
              >
                Dica: Revise os dados deste card para garantir a conformidade da etapa antes de prosseguir.
              </Typography>
            </Box>
          </Box>
        </Collapse>
      </Box>
    </Box>
  );
};
