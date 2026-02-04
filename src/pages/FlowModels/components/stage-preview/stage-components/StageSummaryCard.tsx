// src/pages/FlowModels/components/stage-preview/stage-components/StageSummaryCard.tsx

import { useMemo, useState, useCallback } from "react";
import type { ReactNode } from "react";
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
  Person as PersonIcon,
  Event as EventIcon,
  Schedule as ScheduleIcon,
  EventAvailable as EventAvailableIcon,
} from "@mui/icons-material";
import type { StageComponentRuntimeProps } from "../componentRegistry";

type FileItem = {
  id: string;
  name: string;
  url?: string;
  mimeType?: string;
  sizeBytes?: number;
  category?: string;
};

type ResponsibleItem = {
  id?: string;
  nome: string;
  cargo?: string;
  setor?: string;
};

type StageDeadline = {
  data?: string; // YYYY-MM-DD ou ISO
};

function safeString(v: unknown) {
  return String(v ?? "").trim();
}

function isTruthy(v: unknown) {
  return v === true || v === "true" || v === 1 || v === "1";
}

function normalizeStatusText(v: unknown) {
  return safeString(v).toLowerCase();
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

function normalizeResponsaveis(raw: unknown): ResponsibleItem[] {
  if (!Array.isArray(raw)) return [];

  return raw
    .map((r) => {
      const obj = (r ?? {}) as Record<string, unknown>;
      const nome = safeString(obj.nome ?? obj.name ?? obj.fullName);
      if (!nome) return null;

      const id = safeString(obj.id ?? obj.userId ?? obj._id) || undefined;
      const cargo = safeString(obj.cargo ?? obj.role) || undefined;
      const setor = safeString(obj.setor ?? obj.department) || undefined;

      return { id, nome, cargo, setor } as ResponsibleItem;
    })
    .filter(Boolean) as ResponsibleItem[];
}

function parseDateLike(raw: unknown): Date | null {
  const s = safeString(raw);
  if (!s) return null;

  const d = new Date(s);
  if (!Number.isFinite(d.getTime())) return null;
  return d;
}

function startOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function diffDays(a: Date, b: Date) {
  const ms = startOfDay(b).getTime() - startOfDay(a).getTime();
  return Math.round(ms / (1000 * 60 * 60 * 24));
}

function formatDateBR(d: Date) {
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

function inferComponentDone(
  type: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  config: Record<string, any> | undefined,
): { done: boolean; reason?: string } {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const items = cfg.items as any[];
      const total2 = items.length;
      const checked2 = items.filter((x) => x?.checked === true).length;
      if (total2 > 0) {
        const ok = checked2 >= total2;
        return {
          done: ok,
          reason: ok ? undefined : `Checklist incompleto (${checked2}/${total2})`,
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
    if (Number.isFinite(count)) {
      return { done: count > 0, reason: count > 0 ? undefined : "Sem comentários" };
    }
    if (Array.isArray(cfg.comments)) {
      return {
        done: cfg.comments.length > 0,
        reason: cfg.comments.length ? undefined : "Sem comentários",
      };
    }
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

type CardShellProps = {
  title: string;
  icon: ReactNode;
  right?: ReactNode;
  children?: ReactNode;
  footer?: ReactNode;
};

function CardShell({ title, icon, right, children, footer }: CardShellProps) {
  return (
    <Box
      sx={{
        border: "1px solid #EEF2F7",
        borderRadius: 3,
        bgcolor: "#ffffff",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        minWidth: 0,
        height: "100%", // ✅ força mesma altura entre KPIs
      }}
    >
      <Box
        sx={{
          px: 1.5,
          py: 1.25,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 1,
          borderBottom: "1px solid #F1F5F9",
          bgcolor: "#FFFFFF",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, minWidth: 0 }}>
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
              color: "#475569",
              flexShrink: 0,
            }}
          >
            {icon}
          </Box>

          <Typography
            sx={{
              fontWeight: 950,
              color: "#0f172a",
              minWidth: 0,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {title}
          </Typography>
        </Box>

        {right ? <Box sx={{ flexShrink: 0 }}>{right}</Box> : null}
      </Box>

      <Box sx={{ p: 1.5, minWidth: 0, flex: 1 }}>{children}</Box>

      {footer ? (
        <Box
          sx={{
            px: 1.5,
            py: 1.25,
            borderTop: "1px solid #F1F5F9",
            bgcolor: "#FAFBFC",
          }}
        >
          {footer}
        </Box>
      ) : null}
    </Box>
  );
}

export const StageSummaryCard = ({
  component,
  stageComponents,
  stageCompleted,
  onEvent,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  stage,
}: StageComponentRuntimeProps & { stage?: any }) => {
  const [detailsOpen, setDetailsOpen] = useState(false);

  const allComponents = useMemo(() => {
    const base = Array.isArray(stageComponents) && stageComponents.length ? stageComponents : [];
    return base.filter((c) => c?.type !== "STAGE_SUMMARY");
  }, [stageComponents]);

  const panelInfo = useMemo(() => {
    const cfg = (component?.config ?? {}) as Record<string, unknown>;

    const responsaveis = normalizeResponsaveis(
      cfg.responsaveis ?? cfg.assignees ?? cfg.responsibles,
    );

    const prazoRaw = (cfg.prazo ?? cfg.deadline ?? cfg.dueAt) as
      | StageDeadline
      | string
      | undefined;

    const prazoDate =
      typeof prazoRaw === "string"
        ? parseDateLike(prazoRaw)
        : parseDateLike((prazoRaw as StageDeadline | undefined)?.data);

    const today = new Date();
    const daysToDue = prazoDate ? diffDays(today, prazoDate) : null;

    const prazoStatus =
      !prazoDate
        ? "sem_prazo"
        : daysToDue === 0
          ? "vence_hoje"
          : daysToDue > 0
            ? "a_vencer"
            : "vencido";

    const prazoLabel =
      !prazoDate
        ? "Sem prazo"
        : prazoStatus === "vence_hoje"
          ? `Vence hoje (${formatDateBR(prazoDate)})`
          : prazoStatus === "a_vencer"
            ? `Vence em ${daysToDue} dia(s) (${formatDateBR(prazoDate)})`
            : `Vencido há ${Math.abs(daysToDue ?? 0)} dia(s) (${formatDateBR(prazoDate)})`;

    const approverRolesCount = Array.isArray(stage?.approverRoles) ? stage.approverRoles.length : 0;
    const approverDepartmentsCount = Array.isArray(stage?.approverDepartments)
      ? stage.approverDepartments.length
      : 0;

    const hasFallbackApprovers = approverRolesCount > 0 || approverDepartmentsCount > 0;

    return {
      responsaveis,
      prazoStatus,
      prazoLabel,
      hasFallbackApprovers,
      approverRolesCount,
      approverDepartmentsCount,
    };
  }, [component?.config, stage]);

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

    const files = (() => {
      const collector: FileItem[] = [];
      for (const c of allComponents) {
        if (c.type === "FILES_MANAGMENT" || c.type === "FILE_VIEWER") {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

    const requiredDone = doneRequiredKeys.size;
    const requiredPending = pendingRequired.length;

    const progress =
      requiredTotal > 0 ? Math.round((requiredDone / requiredTotal) * 100) : 100;

    const status = stageCompleted
      ? "concluida"
      : requiredPending > 0
        ? "pendente"
        : "em_dia";

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
      filesCount: files.length,
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

  const handleGoToFiles = useCallback(() => {
    if (!stats.filesComponentKey) return;

    onEvent?.("stageSummary:scrollToComponent", {
      targetKey: stats.filesComponentKey,
      targetType: "FILES_MANAGMENT",
      fromComponentKey: safeString(component?.key),
    });
  }, [onEvent, component, stats.filesComponentKey]);

  const handleGoToFirstPending = useCallback(() => {
    const first = stats.pendingRequired[0];
    if (!first?.key) return;

    onEvent?.("stageSummary:scrollToComponent", {
      targetKey: first.key,
      targetType: first.type,
      fromComponentKey: safeString(component?.key),
    });

    // ✅ abre detalhes automaticamente quando o usuário quer ver pendências
    setDetailsOpen(true);
  }, [onEvent, component, stats.pendingRequired]);

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

  const prazoChipTone = useMemo(() => {
    if (panelInfo.prazoStatus === "vencido") {
      return { bg: "#FEE2E2", color: "#991B1B", icon: <ScheduleIcon sx={{ fontSize: 16 }} /> };
    }
    if (panelInfo.prazoStatus === "vence_hoje") {
      return { bg: "#FFEDD5", color: "#9A3412", icon: <EventAvailableIcon sx={{ fontSize: 16 }} /> };
    }
    if (panelInfo.prazoStatus === "a_vencer") {
      return { bg: "#E0F2FE", color: "#075985", icon: <EventIcon sx={{ fontSize: 16 }} /> };
    }
    return { bg: "#F1F5F9", color: "#475569", icon: <EventIcon sx={{ fontSize: 16 }} /> };
  }, [panelInfo.prazoStatus]);

  const hasResponsaveis = panelInfo.responsaveis.length > 0;

  const helperText = useMemo(() => {
    if (hasResponsaveis) return "";

    if (panelInfo.hasFallbackApprovers) {
      const roles = panelInfo.approverRolesCount;
      const deps = panelInfo.approverDepartmentsCount;
      const parts = [roles ? `${roles} role(s)` : null, deps ? `${deps} setor(es)` : null].filter(
        Boolean,
      );

      return `Configure responsáveis e prazo no componente STAGE_SUMMARY (config). Se não configurar, o sistema tenta usar roles/setores aprovadores da própria etapa como fallback (${parts.join(
        " • ",
      )}).`;
    }

    return "Configure responsáveis e prazo no componente STAGE_SUMMARY (config).";
  }, [
    hasResponsaveis,
    panelInfo.hasFallbackApprovers,
    panelInfo.approverRolesCount,
    panelInfo.approverDepartmentsCount,
  ]);

  const PendingAction = useMemo(() => {
    if (stats.requiredPending <= 0) return null;

    return (
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
        Visualizar pendências
      </Button>
    );
  }, [stats.requiredPending, handleGoToFirstPending, onEvent]);

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
          py: { xs: 1.5, sm: 1.75 },
          bgcolor: "#FFFFFF",
          borderBottom: "1px solid #EEF2F7",
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 1.5,
        }}
      >
        <Box sx={{ minWidth: 0, display: "flex", gap: 1.25, alignItems: "flex-start" }}>
          <Box
            sx={{
              mt: 0.25,
              width: 34,
              height: 34,
              borderRadius: 2,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              bgcolor: "#F8FAFC",
              border: "1px solid #EEF2F7",
            }}
          >
            {headerTone.icon}
          </Box>

          <Box sx={{ minWidth: 0 }}>
            <Typography sx={{ fontWeight: 950, color: "#0f172a", lineHeight: 1.2 }}>
              {safeString(component?.label) || "Resumo do Card"}
            </Typography>
            <Typography variant="body2" sx={{ color: "#475569", mt: 0.25, fontWeight: 650 }}>
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

          <Tooltip title={detailsOpen ? "Ocultar detalhes" : "Ver detalhes"} arrow>
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
          bgcolor: "#FFFFFF",
        }}
      >
        {/* KPI Grid - mesmo tamanho */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" }, // ✅ 3 iguais
            gap: 1.5,
            alignItems: "stretch", // ✅ força mesma altura
          }}
        >
          {/* Obrigatórios */}
          <Box sx={{ minWidth: 0 }}>
            <CardShell
              title="Obrigatórios"
              icon={<InsightsIcon sx={{ fontSize: 18 }} />}
              right={
                <Chip
                  size="small"
                  label={`${stats.progress}%`}
                  sx={{
                    bgcolor: stats.status === "pendente" ? "#FEF3C7" : "#E7F3FF",
                    color: stats.status === "pendente" ? "#92400E" : "#1877F2",
                    fontWeight: 950,
                  }}
                />
              }
              footer={
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1 }}>
                  <Box sx={{ display: "flex", gap: 0.75, flexWrap: "wrap" }}>
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
                      sx={{ bgcolor: "#F1F5F9", color: "#475569", fontWeight: 950 }}
                    />
                  </Box>

                  {PendingAction ? <Box sx={{ flexShrink: 0 }}>{PendingAction}</Box> : null}
                </Box>
              }
            >
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                <Box sx={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
                  <Typography sx={{ fontWeight: 950, color: "#0f172a", fontSize: "1.25rem" }}>
                    {stats.requiredDone}/{stats.requiredTotal}
                  </Typography>

                  <Typography variant="body2" sx={{ color: "#64748b", fontWeight: 900 }}>
                    {stats.requiredTotal ? "Concluídos" : "Sem obrigatórios"}
                  </Typography>
                </Box>

                <LinearProgress
                  variant="determinate"
                  value={stats.progress}
                  sx={{
                    height: 8,
                    borderRadius: 999,
                    bgcolor: "#F1F5F9",
                    "& .MuiLinearProgress-bar": {
                      borderRadius: 999,
                      backgroundColor: progressColor,
                    },
                  }}
                />

                <Typography variant="body2" sx={{ color: "#64748b", fontWeight: 700 }}>
                  {stats.requiredPending > 0
                    ? "Há pendências obrigatórias para resolver."
                    : "Sem pendências obrigatórias."}
                </Typography>
              </Box>
            </CardShell>
          </Box>

          {/* Arquivos */}
          <Box sx={{ minWidth: 0 }}>
            <CardShell
              title="Arquivos"
              icon={<FolderIcon sx={{ fontSize: 18 }} />}
              right={
                <Chip
                  size="small"
                  label={stats.filesCount > 0 ? "OK" : "Sem anexos"}
                  sx={{
                    bgcolor: stats.filesCount > 0 ? "#ECFDF3" : "#F1F5F9",
                    color: stats.filesCount > 0 ? "#065F46" : "#475569",
                    fontWeight: 950,
                  }}
                />
              }
              footer={
                <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
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
                    Abrir Gerenciar Arquivos
                  </Button>
                </Box>
              }
            >
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, minWidth: 0 }}>
                  <Typography sx={{ fontWeight: 950, color: "#0f172a", fontSize: "1.25rem" }}>
                    {stats.filesCount}
                  </Typography>
                  <Typography variant="body2" sx={{ color: "#64748b", fontWeight: 750 }}>
                    {stats.filesCount === 1 ? "arquivo" : "arquivos"}
                  </Typography>
                </Box>

                <Typography variant="body2" sx={{ color: "#64748b", fontWeight: 700 }}>
                  {stats.filesCount > 0 ? "Pronto para revisão" : "Anexe para avançar"}
                </Typography>
              </Box>
            </CardShell>
          </Box>

          {/* Responsáveis & Prazo */}
          <Box sx={{ minWidth: 0 }}>
            <CardShell
              title="Responsáveis e prazo"
              icon={<PersonIcon sx={{ fontSize: 18 }} />}
              right={
                <Chip
                  size="small"
                  icon={prazoChipTone.icon}
                  label={
                    panelInfo.prazoStatus === "vencido"
                      ? "Atrasado"
                      : panelInfo.prazoStatus === "vence_hoje"
                        ? "Hoje"
                        : panelInfo.prazoStatus === "a_vencer"
                          ? "A vencer"
                          : "Sem prazo"
                  }
                  sx={{
                    bgcolor: prazoChipTone.bg,
                    color: prazoChipTone.color,
                    fontWeight: 950,
                    "& .MuiChip-icon": { color: prazoChipTone.color },
                  }}
                />
              }
              footer={
                !hasResponsaveis ? (
                  <Box
                    sx={{
                      px: 1,
                      py: 0.75,
                      borderRadius: 2,
                      border: "1px dashed #E2E8F0",
                      bgcolor: "#FFFFFF",
                    }}
                  >
                    <Typography variant="body2" sx={{ color: "#64748b", fontWeight: 750 }}>
                      {helperText}
                    </Typography>
                  </Box>
                ) : null
              }
            >
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1.25 }}>
                <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 1 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, minWidth: 0 }}>
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
                        color: "#475569",
                        flexShrink: 0,
                      }}
                    >
                      <EventIcon sx={{ fontSize: 18 }} />
                    </Box>

                    <Box sx={{ minWidth: 0 }}>
                      <Typography sx={{ fontWeight: 950, color: "#0f172a", lineHeight: 1.2 }}>
                        Prazo
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ color: "#64748b", fontWeight: 750, mt: 0.25 }}
                        noWrap
                        title={panelInfo.prazoLabel}
                      >
                        {panelInfo.prazoLabel}
                      </Typography>
                    </Box>
                  </Box>
                </Box>

                <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 1 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, minWidth: 0 }}>
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
                        color: "#475569",
                        flexShrink: 0,
                      }}
                    >
                      <PersonIcon sx={{ fontSize: 18 }} />
                    </Box>

                    <Box sx={{ minWidth: 0 }}>
                      <Typography sx={{ fontWeight: 950, color: "#0f172a", lineHeight: 1.2 }}>
                        Responsáveis
                      </Typography>

                      <Typography variant="body2" sx={{ color: "#64748b", fontWeight: 750, mt: 0.25 }}>
                        {hasResponsaveis
                          ? "Definidos no painel"
                          : panelInfo.hasFallbackApprovers
                            ? "Usando aprovadores da etapa (fallback)"
                            : "Não definido"}
                      </Typography>
                    </Box>
                  </Box>

                  <Chip
                    size="small"
                    label={
                      hasResponsaveis
                        ? `${panelInfo.responsaveis.length}`
                        : panelInfo.hasFallbackApprovers
                          ? `${panelInfo.approverRolesCount + panelInfo.approverDepartmentsCount}`
                          : "0"
                    }
                    sx={{
                      bgcolor: hasResponsaveis ? "#E7F3FF" : "#F1F5F9",
                      color: hasResponsaveis ? "#1877F2" : "#475569",
                      fontWeight: 950,
                      flexShrink: 0,
                    }}
                  />
                </Box>

                {hasResponsaveis ? (
                  <Box sx={{ display: "flex", gap: 0.75, flexWrap: "wrap" }}>
                    {panelInfo.responsaveis.slice(0, 4).map((r, idx) => {
                      const label = r.nome;
                      const tipParts = [r.nome, r.cargo, r.setor].filter(Boolean);
                      const tip = tipParts.join(" • ");
                      return (
                        <Tooltip key={`${r.id ?? r.nome}-${idx}`} title={tip} arrow>
                          <Chip
                            size="small"
                            label={label}
                            sx={{
                              maxWidth: 220,
                              bgcolor: "#F1F5F9",
                              color: "#0f172a",
                              fontWeight: 900,
                              "& .MuiChip-label": {
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                              },
                            }}
                          />
                        </Tooltip>
                      );
                    })}

                    {panelInfo.responsaveis.length > 4 ? (
                      <Chip
                        size="small"
                        label={`+${panelInfo.responsaveis.length - 4}`}
                        sx={{ bgcolor: "#F1F5F9", color: "#475569", fontWeight: 950 }}
                      />
                    ) : null}
                  </Box>
                ) : null}
              </Box>
            </CardShell>
          </Box>
        </Box>

        {/* Details */}
        <Collapse in={detailsOpen} unmountOnExit>
          <Box
            sx={{
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
                  <Typography variant="body2" sx={{ color: "#065F46", fontWeight: 900 }}>
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
                        <Typography sx={{ fontWeight: 950, color: "#0f172a", lineHeight: 1.2 }}>
                          {p.label}
                        </Typography>
                        <Typography variant="body2" sx={{ color: "#64748b", fontWeight: 750, mt: 0.25 }}>
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

              <Typography variant="body2" sx={{ color: "#64748b", fontWeight: 750 }}>
                Dica: Revise os dados deste card para garantir a conformidade da etapa antes de prosseguir.
              </Typography>
            </Box>
          </Box>
        </Collapse>
      </Box>
    </Box>
  );
};
