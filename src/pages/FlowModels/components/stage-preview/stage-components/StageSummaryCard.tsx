import { useMemo, useState, useCallback } from "react";
import type { ReactNode } from "react";
import { Box, Typography, Chip, Tooltip, IconButton, Collapse, Button, Divider } from "@mui/material";
import {
  Insights as InsightsIcon,
  WarningAmber as WarningAmberIcon,
  CheckCircle as CheckCircleIcon,
  Folder as FolderIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
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
          typeof obj.sizeBytes === "number" && Number.isFinite(obj.sizeBytes) ? obj.sizeBytes : undefined,
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
    return { done: false, reason: "Aguardando decisão" };
  }

  if (type === "SIGNATURE") {
    if (status === "signed" || isTruthy(cfg.signed)) return { done: true };

    const signedCount = Number(cfg.signedCount ?? cfg.signaturesDone ?? NaN);
    const requiredCount = Number(cfg.requiredCount ?? cfg.signersTotal ?? NaN);
    if (Number.isFinite(signedCount) && Number.isFinite(requiredCount) && requiredCount > 0) {
      const ok = signedCount >= requiredCount;
      return { done: ok, reason: ok ? undefined : `Assinaturas (${signedCount}/${requiredCount})` };
    }

    return { done: false, reason: "Aguardando assinatura" };
  }

  if (type === "FILES_MANAGMENT" || type === "FILE_VIEWER") {
    const files = normalizeFiles(cfg.files);
    const ok = files.length > 0;
    return { done: ok, reason: ok ? undefined : "Sem anexos" };
  }

  if (type === "CHECKLIST") {
    const checked = Number(cfg.checkedCount ?? cfg.doneCount ?? NaN);
    const total = Number(cfg.totalCount ?? cfg.itemsTotal ?? NaN);
    if (Number.isFinite(checked) && Number.isFinite(total) && total > 0) {
      const ok = checked >= total;
      return { done: ok, reason: ok ? undefined : `Checklist (${checked}/${total})` };
    }

    if (Array.isArray(cfg.items)) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const items = cfg.items as any[];
      const total2 = items.length;
      const checked2 = items.filter((x) => x?.checked === true).length;
      if (total2 > 0) {
        const ok = checked2 >= total2;
        return { done: ok, reason: ok ? undefined : `Checklist (${checked2}/${total2})` };
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
    if (Number.isFinite(count)) return { done: count > 0, reason: count > 0 ? undefined : "Sem comentários" };
    if (Array.isArray(cfg.comments)) return { done: cfg.comments.length > 0, reason: cfg.comments.length ? undefined : "Sem comentários" };
    return { done: false, reason: "Sem comentários" };
  }

  if (type === "TIMELINE") {
    return { done: false, reason: "Conferir cronograma" };
  }

  return { done: false, reason: "Pendente" };
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
        height: "100%",
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

      <Box sx={{ p: 1.5, minWidth: 0, flex: 1, display: "flex", flexDirection: "column" }}>{children}</Box>

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

    const responsaveis = normalizeResponsaveis(cfg.responsaveis ?? cfg.assignees ?? cfg.responsibles);

    const prazoRaw = (cfg.prazo ?? cfg.deadline ?? cfg.dueAt) as StageDeadline | string | undefined;

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
          ? `Vence hoje • ${formatDateBR(prazoDate)}`
          : prazoStatus === "a_vencer"
            ? `Vence em ${daysToDue} dia(s) • ${formatDateBR(prazoDate)}`
            : `Vencido há ${Math.abs(daysToDue ?? 0)} dia(s) • ${formatDateBR(prazoDate)}`;

    const approverRolesCount = Array.isArray(stage?.approverRoles) ? stage.approverRoles.length : 0;
    const approverDepartmentsCount = Array.isArray(stage?.approverDepartments) ? stage.approverDepartments.length : 0;

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

    const pendingRequired: Array<{ key: string; type: string; label: string; reason?: string }> = [];
    const doneRequiredKeys = new Set<string>();

    for (const c of required) {
      const key = safeString(c.key) || `${c.type}_${c.order}`;
      const label = safeString(c.label) || safeString(c.type);
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

    const progress = requiredTotal > 0 ? Math.round((requiredDone / requiredTotal) * 100) : 100;

    const status = stageCompleted ? "concluida" : requiredPending > 0 ? "pendente" : "em_dia";

    return {
      total,
      requiredTotal,
      requiredDone,
      requiredPending,
      pendingRequired,
      filesCount: files.length,
      progress,
      status,
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

  const handleGoToFirstPending = useCallback(() => {
    const first = stats.pendingRequired[0];
    if (!first?.key) return;

    onEvent?.("stageSummary:scrollToComponent", {
      targetKey: first.key,
      targetType: first.type,
      fromComponentKey: safeString(component?.key),
    });
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

  const prazoChipTone = useMemo(() => {
    if (panelInfo.prazoStatus === "vencido") {
      return { bg: "#FEE2E2", color: "#991B1B" };
    }
    if (panelInfo.prazoStatus === "vence_hoje") {
      return { bg: "#FFEDD5", color: "#9A3412" };
    }
    if (panelInfo.prazoStatus === "a_vencer") {
      return { bg: "#E0F2FE", color: "#075985" };
    }
    return { bg: "#F1F5F9", color: "#475569" };
  }, [panelInfo.prazoStatus]);

  const hasResponsaveis = panelInfo.responsaveis.length > 0;

  const helperText = useMemo(() => {
    if (hasResponsaveis) return "";

    if (panelInfo.hasFallbackApprovers) {
      return "Responsáveis não definidos no STAGE_SUMMARY. Usaremos aprovadores da etapa como fallback.";
    }

    return "Configure responsáveis no STAGE_SUMMARY para exibir aqui.";
  }, [hasResponsaveis, panelInfo.hasFallbackApprovers]);

  const arquivosStatus = useMemo(() => {
    if (stats.filesCount > 0) return { label: "OK", bg: "#ECFDF3", color: "#065F46" };
    return { label: "Sem anexos", bg: "#F1F5F9", color: "#475569" };
  }, [stats.filesCount]);

  const obrigatoriosStatus = useMemo(() => {
    if (stats.requiredPending > 0) return { bg: "#FEF3C7", color: "#92400E" };
    if (stats.requiredTotal === 0) return { bg: "#F1F5F9", color: "#475569" };
    return { bg: "#E7F3FF", color: "#1877F2" };
  }, [stats.requiredPending, stats.requiredTotal]);

  const showPrimaryAction = stats.requiredPending > 0;

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

          <Tooltip title={detailsOpen ? "Ocultar Responsáveis" : "Ver Responsáveis"} arrow>
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
        {/* KPI Grid (executivo) */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "repeat(12, 1fr)" },
            gap: 1.5,
            alignItems: "stretch",
          }}
        >
          {/* Itens Obrigatórios */}
          <Box sx={{ gridColumn: { xs: "1 / -1", md: "span 4" }, minWidth: 0 }}>
            <CardShell
              title="Itens Obrigatórios"
              icon={<InsightsIcon sx={{ fontSize: 18 }} />}
              right={
                <Chip
                  size="small"
                  label={`${stats.progress}%`}
                  sx={{
                    bgcolor: obrigatoriosStatus.bg,
                    color: obrigatoriosStatus.color,
                    fontWeight: 950,
                  }}
                />
              }
              footer={
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
              }
            >
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1.25, flex: 1 }}>
                <Box sx={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
                  <Typography sx={{ fontWeight: 950, color: "#0f172a", fontSize: "1.35rem" }}>
                    {stats.requiredDone}/{stats.requiredTotal}
                  </Typography>

                  <Typography variant="body2" sx={{ color: "#64748b", fontWeight: 750 }}>
                    {stats.requiredTotal === 0 ? "Sem obrigatórios" : stats.requiredPending > 0 ? "Requer ação" : "OK"}
                  </Typography>
                </Box>

                <Box
                  sx={{
                    height: 8,
                    borderRadius: 999,
                    bgcolor: "#F1F5F9",
                    overflow: "hidden",
                  }}
                >
                  <Box
                    sx={{
                      height: "100%",
                      width: `${Math.max(0, Math.min(100, stats.progress))}%`,
                      bgcolor:
                        stats.status === "concluida"
                          ? "#16a34a"
                          : stats.status === "pendente"
                            ? "#f59e0b"
                            : "#1877F2",
                      borderRadius: 999,
                      transition: "width .2s ease",
                    }}
                  />
                </Box>

                {showPrimaryAction ? (
                  <Box sx={{ display: "flex", justifyContent: "flex-end", mt: "auto" }}>
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
                      Visualizar Pendências
                    </Button>
                  </Box>
                ) : (
                  <Typography variant="body2" sx={{ color: "#64748b", fontWeight: 700, mt: "auto" }}>
                    Tudo certo.
                  </Typography>
                )}
              </Box>
            </CardShell>
          </Box>

          {/* Prazo */}
          <Box sx={{ gridColumn: { xs: "1 / -1", md: "span 4" }, minWidth: 0 }}>
            <CardShell
              title="Prazo"
              icon={<EventIcon sx={{ fontSize: 18 }} />}
              right={
                <Chip
                  size="small"
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
                  }}
                />
              }
            >
              <Box sx={{ display: "flex", flexDirection: "column", gap: 0.75, flex: 1 }}>
                <Typography sx={{ fontWeight: 950, color: "#0f172a", fontSize: "1.1rem" }}>
                  {panelInfo.prazoStatus === "sem_prazo" ? "Sem prazo" : panelInfo.prazoLabel}
                </Typography>

                <Typography variant="body2" sx={{ color: "#64748b", fontWeight: 700 }}>
                  {panelInfo.prazoStatus === "sem_prazo"
                    ? "Defina um prazo para orientar a execução."
                    : panelInfo.prazoStatus === "vencido"
                      ? "Atenção: prazo vencido."
                      : panelInfo.prazoStatus === "vence_hoje"
                        ? "Vence hoje."
                        : "Prazo em andamento."}
                </Typography>

                <Box sx={{ flex: 1 }} />
              </Box>
            </CardShell>
          </Box>

          {/* Arquivos */}
          <Box sx={{ gridColumn: { xs: "1 / -1", md: "span 4" }, minWidth: 0 }}>
            <CardShell
              title="Arquivos"
              icon={<FolderIcon sx={{ fontSize: 18 }} />}
              right={
                <Chip
                  size="small"
                  label={arquivosStatus.label}
                  sx={{
                    bgcolor: arquivosStatus.bg,
                    color: arquivosStatus.color,
                    fontWeight: 950,
                  }}
                />
              }
            >
              <Box sx={{ display: "flex", flexDirection: "column", gap: 0.75, flex: 1 }}>
                <Box sx={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
                  <Typography sx={{ fontWeight: 950, color: "#0f172a", fontSize: "1.35rem" }}>
                    {stats.filesCount}
                  </Typography>
                  <Typography variant="body2" sx={{ color: "#64748b", fontWeight: 750 }}>
                    {stats.filesCount === 1 ? "arquivo" : "arquivos"}
                  </Typography>
                </Box>

                <Typography variant="body2" sx={{ color: "#64748b", fontWeight: 700 }}>
                  {stats.filesCount > 0 ? "Pronto para revisão." : "Anexe os documentos no Gerenciar Arquivos."}
                </Typography>

                <Box sx={{ flex: 1 }} />
              </Box>
            </CardShell>
          </Box>
        </Box>

        {/* Expand: Responsáveis (somente aqui) */}
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
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <PersonIcon sx={{ fontSize: 18, color: "#1877F2" }} />
                <Typography sx={{ fontWeight: 950, color: "#0f172a" }}>Responsáveis</Typography>
              </Box>

              <Chip
                size="small"
                label={hasResponsaveis ? `${panelInfo.responsaveis.length}` : "0"}
                sx={{
                  bgcolor: hasResponsaveis ? "#E7F3FF" : "#F1F5F9",
                  color: hasResponsaveis ? "#1877F2" : "#475569",
                  fontWeight: 950,
                }}
              />
            </Box>

            <Box sx={{ p: 2 }}>
              {!hasResponsaveis ? (
                <Box
                  sx={{
                    px: 1.25,
                    py: 1,
                    borderRadius: 2,
                    border: "1px dashed #E2E8F0",
                    bgcolor: "#FFFFFF",
                  }}
                >
                  <Typography variant="body2" sx={{ color: "#64748b", fontWeight: 750 }}>
                    {helperText}
                  </Typography>

                  {panelInfo.hasFallbackApprovers ? (
                    <Box sx={{ display: "flex", gap: 0.75, flexWrap: "wrap", mt: 1 }}>
                      {panelInfo.approverRolesCount > 0 ? (
                        <Chip
                          size="small"
                          label={`Roles aprovadoras: ${panelInfo.approverRolesCount}`}
                          sx={{ bgcolor: "#F1F5F9", color: "#475569", fontWeight: 900 }}
                        />
                      ) : null}
                      {panelInfo.approverDepartmentsCount > 0 ? (
                        <Chip
                          size="small"
                          label={`Setores aprovadores: ${panelInfo.approverDepartmentsCount}`}
                          sx={{ bgcolor: "#F1F5F9", color: "#475569", fontWeight: 900 }}
                        />
                      ) : null}
                    </Box>
                  ) : null}
                </Box>
              ) : (
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                  {panelInfo.responsaveis.map((r, idx) => {
                    const title = r.nome;
                    const subtitle = [r.cargo, r.setor].filter(Boolean).join(" • ");

                    return (
                      <Box
                        key={`${r.id ?? r.nome}-${idx}`}
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          gap: 1,
                          p: 1.25,
                          borderRadius: 2,
                          border: "1px solid #EEF2F7",
                          bgcolor: "#FFFFFF",
                        }}
                      >
                        <Box sx={{ minWidth: 0, display: "flex", alignItems: "center", gap: 1 }}>
                          <Box
                            sx={{
                              width: 34,
                              height: 34,
                              borderRadius: 999,
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
                            <Typography sx={{ fontWeight: 950, color: "#0f172a", lineHeight: 1.2 }} noWrap title={title}>
                              {title}
                            </Typography>
                            {subtitle ? (
                              <Typography variant="body2" sx={{ color: "#64748b", fontWeight: 750, mt: 0.25 }} noWrap title={subtitle}>
                                {subtitle}
                              </Typography>
                            ) : (
                              <Typography variant="body2" sx={{ color: "#94a3b8", fontWeight: 750, mt: 0.25 }}>
                                Sem detalhes adicionais
                              </Typography>
                            )}
                          </Box>
                        </Box>

                        <Chip
                          size="small"
                          label={r.setor ? r.setor : r.cargo ? r.cargo : "Responsável"}
                          sx={{
                            bgcolor: "#F1F5F9",
                            color: "#475569",
                            fontWeight: 900,
                            flexShrink: 0,
                            maxWidth: 220,
                            "& .MuiChip-label": { overflow: "hidden", textOverflow: "ellipsis" },
                          }}
                        />
                      </Box>
                    );
                  })}

                  {stats.requiredPending > 0 ? (
                    <>
                      <Divider sx={{ my: 1.25 }} />
                      <Typography variant="body2" sx={{ color: "#64748b", fontWeight: 750 }}>
                        Há pendências obrigatórias nesta etapa. Use o botão “Visualizar Pendências” em Itens Obrigatórios.
                      </Typography>
                    </>
                  ) : null}
                </Box>
              )}

              {/* Se quiser, mantenha a lista de pendências (clicável) abaixo. Hoje deixei só aviso para não poluir. */}
              {stats.requiredPending > 0 ? (
                <Box sx={{ mt: 1.5, display: "none" }}>
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
                    />
                  ))}
                </Box>
              ) : null}
            </Box>
          </Box>
        </Collapse>
      </Box>
    </Box>
  );
};
