import React, { useCallback, useMemo, useState } from "react";
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  TextField,
  Typography,
  Tooltip,
} from "@mui/material";
import {
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Info as InfoIcon,
  History as HistoryIcon,
  PictureAsPdf as PictureAsPdfIcon,
  WarningAmber as WarningAmberIcon,
} from "@mui/icons-material";
import type { StageComponentRuntimeProps } from "../componentRegistry";
import { BaseStageComponentCard } from "./BaseStageComponentCard";

/* =========================
 * Helpers
 * ========================= */

function safeString(v: unknown) {
  return String(v ?? "").trim();
}

function safeArray(v: unknown) {
  return Array.isArray(v) ? v : [];
}

function formatDateTimePtBR(iso?: string) {
  const s = safeString(iso);
  if (!s) return "—";
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function escapeHtml(input: string) {
  return input
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

/* =========================
 * Types
 * ========================= */

export type ReviewStatus = "draft" | "in_review" | "approved" | "rejected";

type FileItem = {
  id: string;
  name: string;
  reviewStatus?: ReviewStatus;
  reviewNote?: string;
  reviewedAt?: string;
  reviewedBy?: string;
};

type ApprovalDecision = "approved" | "changes_requested";

type ApprovalConfig = {
  decision?: ApprovalDecision;
  justification?: string;
  decidedAt?: string;
  decidedBy?: string;
};

function parseReviewStatus(v: unknown): ReviewStatus | undefined {
  const s = safeString(v) as ReviewStatus;
  if (s === "draft" || s === "in_review" || s === "approved" || s === "rejected")
    return s;
  return undefined;
}

function parseApprovalDecision(v: unknown): ApprovalDecision | undefined {
  const s = safeString(v) as ApprovalDecision;
  if (s === "approved" || s === "changes_requested") return s;
  return undefined;
}

/* =========================
 * Component
 * ========================= */

export const ApprovalComponent = ({
  component,
  stageComponents,
  isReadOnly,
  stageCompleted,
  onEvent,
}: StageComponentRuntimeProps) => {
  const locked = isReadOnly || stageCompleted;

  const cfg = useMemo<ApprovalConfig>(() => {
    const raw = (component.config ?? {}) as Record<string, unknown>;

    return {
      decision: parseApprovalDecision(raw.decision),
      justification: safeString(raw.justification) || "",
      decidedAt: safeString(raw.decidedAt) || "",
      decidedBy: safeString(raw.decidedBy) || "",
    };
  }, [component.config]);

  const filesComponent = useMemo(() => {
    const list = stageComponents ?? [];
    return list.find((c) => c.type === "FILES_MANAGMENT");
  }, [stageComponents]);

  const stageFiles = useMemo<FileItem[]>(() => {
    if (!filesComponent) return [];

    const rawCfg = (filesComponent.config ?? {}) as Record<string, unknown>;
    const files = safeArray(rawCfg.files);

    return files
      .map((f) => {
        const o = (f ?? {}) as Record<string, unknown>;
        const id = safeString(o.id) || safeString(o._id);
        const name = safeString(o.name);
        if (!id || !name) return null;

        return {
          id,
          name,
          reviewStatus: parseReviewStatus(o.reviewStatus),
          reviewNote: safeString(o.reviewNote) || undefined,
          reviewedAt: safeString(o.reviewedAt) || undefined,
          reviewedBy: safeString(o.reviewedBy) || undefined,
        } as FileItem;
      })
      .filter(Boolean) as FileItem[];
  }, [filesComponent]);

  const filesInReview = useMemo(
    () => stageFiles.filter((f) => f.reviewStatus === "in_review"),
    [stageFiles],
  );

  const filesRejected = useMemo(
    () => stageFiles.filter((f) => f.reviewStatus === "rejected"),
    [stageFiles],
  );

  const filesHistory = useMemo(() => {
    // Histórico = arquivos que já tiveram decisão (aprovado ou reprovado)
    // Exibição: mais recente primeiro
    return stageFiles
      .filter((f) => f.reviewStatus === "approved" || f.reviewStatus === "rejected")
      .sort((a, b) => {
        const da = a.reviewedAt ? new Date(a.reviewedAt).getTime() : 0;
        const db = b.reviewedAt ? new Date(b.reviewedAt).getTime() : 0;
        return db - da;
      });
  }, [stageFiles]);

  /**
   * 🔢 Numeração de versões (1,2,3...) por ordem cronológica (mais antiga = 1).
   * Mesmo que a lista exibida esteja do mais recente pro mais antigo, o número fica correto.
   */
  const versionById = useMemo(() => {
    const asc = [...filesHistory].sort((a, b) => {
      const da = a.reviewedAt ? new Date(a.reviewedAt).getTime() : 0;
      const db = b.reviewedAt ? new Date(b.reviewedAt).getTime() : 0;
      return da - db;
    });

    const map = new Map<string, number>();
    asc.forEach((f, idx) => {
      map.set(f.id, idx + 1);
    });
    return map;
  }, [filesHistory]);

  const canDecideByFiles = filesInReview.length > 0;

  /**
   * 🔐 BLOQUEIO REAL (sem travar fluxo quando você já recusou uma versão antiga):
   * Só bloqueia se houver arquivo em "in_review" SEM registro mínimo (reviewedAt/reviewedBy).
   * Se o novo arquivo já veio com data/autor (como no seu print), NÃO bloqueia.
   */
  const pendingInReview = useMemo(() => {
    return filesInReview.filter(
      (f) => !safeString(f.reviewedAt) || !safeString(f.reviewedBy),
    );
  }, [filesInReview]);

  const isBlockedByPendingInReview = pendingInReview.length > 0;

  /**
   * ✅ REGRA CORRETA:
   * - Permite decidir SEMPRE que existir arquivo em análise (in_review),
   *   mesmo que já exista uma decisão anterior em cfg.decision.
   * - A decisão anterior vira "última decisão registrada", não bloqueio.
   */
  const canDecide =
    !locked &&
    Boolean(filesComponent) &&
    canDecideByFiles &&
    !isBlockedByPendingInReview;

  const [justification, setJustification] = useState(cfg.justification || "");

  // dialog confirm
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmType, setConfirmType] = useState<ApprovalDecision>("approved");

  const openConfirm = useCallback(
    (type: ApprovalDecision) => {
      setConfirmType(type);
      setConfirmOpen(true);
    },
    [],
  );

  const closeConfirm = useCallback(() => setConfirmOpen(false), []);

  const emitDecision = useCallback(() => {
    if (!canDecide) return;

    const fileIds = filesInReview.map((f) => f.id);

    const filesTargetStatus: ReviewStatus =
      confirmType === "approved" ? "approved" : "rejected";

    onEvent?.("approval:decision", {
      componentKey: component.key,
      decision: confirmType,
      justification: safeString(justification),
      fileIds,
      filesTargetStatus,
    });

    setConfirmOpen(false);
  }, [
    canDecide,
    filesInReview,
    onEvent,
    component.key,
    confirmType,
    justification,
  ]);

  const headerChip = useMemo(() => {
    // Header mostra a ÚLTIMA decisão registrada (não bloqueia novas decisões)
    if (!cfg.decision) {
      return (
        <Chip
          label="Pendente"
          size="small"
          sx={{
            bgcolor: "#FFF7ED",
            color: "#9A3412",
            fontWeight: 950,
            height: 24,
          }}
        />
      );
    }

    if (cfg.decision === "approved") {
      return (
        <Chip
          icon={<CheckCircleIcon sx={{ fontSize: 16 }} />}
          label="Aprovado"
          size="small"
          sx={{
            bgcolor: "#ECFDF3",
            color: "#065F46",
            fontWeight: 950,
            height: 24,
            "& .MuiChip-icon": { ml: 0.5, color: "#065F46" },
          }}
        />
      );
    }

    return (
      <Chip
        icon={<CancelIcon sx={{ fontSize: 16 }} />}
        label="Correções solicitadas"
        size="small"
        sx={{
          bgcolor: "#FEF2F2",
          color: "#B91C1C",
          fontWeight: 950,
          height: 24,
          "& .MuiChip-icon": { ml: 0.5, color: "#B91C1C" },
        }}
      />
    );
  }, [cfg.decision]);

  const emptyState = useMemo(() => {
    if (!filesComponent) {
      return (
        <Box
          sx={{
            border: "1px solid #EEF2F7",
            borderRadius: 2,
            bgcolor: "#FAFBFC",
            p: 2,
          }}
        >
          <Typography sx={{ fontWeight: 950, color: "#0f172a" }}>
            Componente de arquivos não encontrado
          </Typography>
          <Typography
            variant="body2"
            sx={{ color: "#475569", fontWeight: 700, mt: 0.5 }}
          >
            Esta etapa não possui “Gerenciar Arquivos” (FILES_MANAGMENT). Sem anexos em análise, a aprovação fica indisponível.
          </Typography>
        </Box>
      );
    }

    if (!canDecideByFiles) {
      return (
        <Box
          sx={{
            border: "1px solid #EEF2F7",
            borderRadius: 2,
            bgcolor: "#FAFBFC",
            p: 2,
          }}
        >
          <Typography sx={{ fontWeight: 950, color: "#0f172a" }}>
            Nenhum arquivo enviado para análise
          </Typography>
          <Typography
            variant="body2"
            sx={{ color: "#475569", fontWeight: 700, mt: 0.5 }}
          >
            Para aprovar ou solicitar correções, envie pelo menos 1 arquivo para o status “Em análise” no card de “Gerenciar Arquivos”.
          </Typography>

          {filesRejected.length > 0 ? (
            <Typography
              variant="body2"
              sx={{ color: "#B91C1C", fontWeight: 800, mt: 0.75 }}
            >
              Existem {filesRejected.length} arquivo(s) rejeitado(s). Anexe a nova versão e envie para análise.
            </Typography>
          ) : null}
        </Box>
      );
    }

    return null;
  }, [canDecideByFiles, filesComponent, filesRejected.length]);

  const blockReasonBox = useMemo(() => {
    if (!filesComponent) return null;
    if (!canDecideByFiles) return null;
    if (!isBlockedByPendingInReview) return null;

    return (
      <Box
        sx={{
          border: "1px solid #FEF3C7",
          borderRadius: 2,
          bgcolor: "#FFFBEB",
          p: 2,
          display: "flex",
          gap: 1.25,
          alignItems: "flex-start",
        }}
      >
        <WarningAmberIcon sx={{ color: "#92400E", mt: 0.25 }} />
        <Box sx={{ minWidth: 0 }}>
          <Typography sx={{ fontWeight: 950, color: "#92400E" }}>
            Aprovação bloqueada: existe arquivo “Em análise” pendente
          </Typography>
          <Typography
            variant="body2"
            sx={{ color: "#92400E", fontWeight: 750, mt: 0.5 }}
          >
            Para liberar a decisão, registre a análise mínima no card “Gerenciar Arquivos” (ex.: quem analisou e a data da análise).
          </Typography>

          <Box sx={{ mt: 1 }}>
            {pendingInReview.slice(0, 4).map((f) => (
              <Typography
                key={f.id}
                variant="body2"
                sx={{ color: "#7C2D12", fontWeight: 800 }}
              >
                • {f.name}
              </Typography>
            ))}
            {pendingInReview.length > 4 ? (
              <Typography
                variant="body2"
                sx={{ color: "#7C2D12", fontWeight: 800 }}
              >
                • +{pendingInReview.length - 4} arquivo(s)
              </Typography>
            ) : null}
          </Box>
        </Box>
      </Box>
    );
  }, [
    canDecideByFiles,
    filesComponent,
    isBlockedByPendingInReview,
    pendingInReview,
  ]);

  const exportHistoryToPdf = useCallback(() => {
    const title = safeString(component.label) || "Aprovação";
    const subtitle =
      safeString(component.description) || "Histórico de análises e decisão";
    const now = new Date().toLocaleString("pt-BR");

    const decisionLabel =
      cfg.decision === "approved"
        ? "Aprovado"
        : cfg.decision === "changes_requested"
          ? "Correções solicitadas"
          : "Pendente";

    const decidedAt = cfg.decidedAt ? formatDateTimePtBR(cfg.decidedAt) : "—";
    const decidedBy = safeString(cfg.decidedBy) || "—";

    const justificationTxt = safeString(justification);

    const rows = filesHistory
      .map((f) => {
        const status =
          f.reviewStatus === "approved"
            ? "APROVADO"
            : f.reviewStatus === "rejected"
              ? "CORREÇÕES SOLICITADAS"
              : "—";

        const v = versionById.get(f.id) ?? 0;

        return `
          <tr>
            <td>#${escapeHtml(String(v || "—"))}</td>
            <td>${escapeHtml(safeString(f.name) || "—")}</td>
            <td>${escapeHtml(status)}</td>
            <td>${escapeHtml(formatDateTimePtBR(f.reviewedAt))}</td>
            <td>${escapeHtml(safeString(f.reviewedBy) || "—")}</td>
            <td>${escapeHtml(safeString(f.reviewNote) || "—")}</td>
          </tr>
        `;
      })
      .join("");

    const html = `
      <html>
        <head>
          <meta charset="utf-8"/>
          <title>${escapeHtml(title)} - PDF</title>
          <style>
            * { box-sizing: border-box; }
            body { font-family: Arial, sans-serif; margin: 24px; color: #0f172a; }
            .top { display:flex; justify-content: space-between; gap: 16px; align-items:flex-start; }
            .badge { display:inline-block; padding: 6px 10px; border-radius: 999px; font-weight: 700; font-size: 12px; background: #E7F3FF; color: #1877F2; }
            h1 { margin: 0; font-size: 18px; }
            .sub { margin-top: 6px; color: #475569; font-weight: 600; font-size: 13px; }
            .meta { margin-top: 14px; padding: 12px; border: 1px solid #E4E6EB; border-radius: 12px; background: #FAFBFC; }
            .meta .row { display:flex; gap: 12px; flex-wrap: wrap; font-size: 12.5px; }
            .meta b { color:#0f172a; }
            .section { margin-top: 18px; }
            .section h2 { font-size: 14px; margin: 0 0 10px; }
            table { width:100%; border-collapse: collapse; }
            th, td { border: 1px solid #E4E6EB; padding: 10px; vertical-align: top; font-size: 12px; }
            th { background: #F8FAFC; text-align: left; }
            .muted { color:#64748b; }
            .note { white-space: pre-wrap; }
          </style>
        </head>
        <body>
          <div class="top">
            <div>
              <div class="badge">${escapeHtml(decisionLabel)}</div>
              <h1>${escapeHtml(title)}</h1>
              <div class="sub">${escapeHtml(subtitle)}</div>
              <div class="sub muted">Gerado em: ${escapeHtml(now)}</div>
            </div>
          </div>

          <div class="meta">
            <div class="row">
              <div><b>Última decisão registrada:</b> ${escapeHtml(decisionLabel)}</div>
              <div><b>Decidido em:</b> ${escapeHtml(decidedAt)}</div>
              <div><b>Decidido por:</b> ${escapeHtml(decidedBy)}</div>
            </div>
            <div class="row" style="margin-top:8px;">
              <div style="width:100%;">
                <b>Justificativa / Observações:</b>
                <div class="note" style="margin-top:6px;">${escapeHtml(justificationTxt || "—")}</div>
              </div>
            </div>
          </div>

          <div class="section">
            <h2>Histórico de análises (versões)</h2>
            ${
              filesHistory.length === 0
                ? `<div class="muted">Nenhum arquivo com análise registrada.</div>`
                : `
                    <table>
                      <thead>
                        <tr>
                          <th>Versão</th>
                          <th>Arquivo</th>
                          <th>Status</th>
                          <th>Data</th>
                          <th>Analisado por</th>
                          <th>Motivo / Observação</th>
                        </tr>
                      </thead>
                      <tbody>
                        ${rows}
                      </tbody>
                    </table>
                  `
            }
          </div>

          <script>
            setTimeout(function() {
              window.print();
            }, 250);
          </script>
        </body>
      </html>
    `;

    const w = window.open("", "_blank", "noopener,noreferrer,width=980,height=720");
    if (!w) return;

    w.document.open();
    w.document.write(html);
    w.document.close();
  }, [
    component.label,
    component.description,
    cfg.decision,
    cfg.decidedAt,
    cfg.decidedBy,
    filesHistory,
    justification,
    versionById,
  ]);

  const historySummary = useMemo(() => {
    const approved = filesHistory.filter((f) => f.reviewStatus === "approved").length;
    const rejected = filesHistory.filter((f) => f.reviewStatus === "rejected").length;
    return { total: filesHistory.length, approved, rejected };
  }, [filesHistory]);

  return (
    <BaseStageComponentCard
      title={component.label || "Aprovação"}
      subtitle={
        component.description ||
        "Aprove ou solicite correções com base nos anexos em análise"
      }
      icon={<InfoIcon sx={{ fontSize: 18 }} />}
      required={component.required}
      lockedAfterCompletion={component.lockedAfterCompletion}
      isReadOnly={isReadOnly}
      rightSlot={headerChip}
    >
      {emptyState}

      {blockReasonBox ? (
        <>
          <Box sx={{ mt: 1.5 }} />
          {blockReasonBox}
        </>
      ) : null}

      <Box sx={{ mt: 1.5 }} />

      <TextField
        value={justification}
        onChange={(e) => setJustification(e.target.value)}
        label="Justificativa / Observações"
        placeholder="Descreva o motivo da aprovação ou as correções solicitadas..."
        fullWidth
        multiline
        minRows={4}
        disabled={locked}
        sx={{
          "& .MuiInputBase-root": {
            borderRadius: 2,
            bgcolor: locked ? "#F8FAFC" : "#FFFFFF",
          },
        }}
      />

      <Box sx={{ mt: 2 }} />

      {/* Arquivos em análise */}
      <Box
        sx={{
          border: "1px solid #EEF2F7",
          borderRadius: 2,
          bgcolor: "#FFFFFF",
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            px: 2,
            py: 1.25,
            bgcolor: "#FAFBFC",
            borderBottom: "1px solid #EEF2F7",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 1,
            flexWrap: "wrap",
          }}
        >
          <Typography sx={{ fontWeight: 950, color: "#0f172a" }}>
            Arquivos em análise: {filesInReview.length}
          </Typography>

          {pendingInReview.length > 0 ? (
            <Chip
              icon={<WarningAmberIcon sx={{ fontSize: 16 }} />}
              label={`${pendingInReview.length} pendente(s)`}
              size="small"
              sx={{
                bgcolor: "#FFFBEB",
                color: "#92400E",
                fontWeight: 950,
                height: 22,
                "& .MuiChip-icon": { color: "#92400E", ml: 0.5 },
              }}
            />
          ) : null}
        </Box>

        {filesInReview.length === 0 ? (
          <Box sx={{ p: 2 }}>
            <Typography sx={{ color: "#64748b", fontWeight: 700 }}>
              Nenhum arquivo no status “Em análise”.
            </Typography>
          </Box>
        ) : (
          <Box sx={{ p: 2 }}>
            {filesInReview.map((f, idx) => {
              const isPending = pendingInReview.some((p) => p.id === f.id);

              return (
                <React.Fragment key={f.id}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "flex-start",
                      justifyContent: "space-between",
                      gap: 2,
                    }}
                  >
                    <Box sx={{ minWidth: 0, flex: 1 }}>
                      <Typography
                        sx={{
                          fontWeight: 900,
                          color: "#0f172a",
                          minWidth: 0,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                        title={f.name}
                      >
                        {f.name}
                      </Typography>

                      <Box
                        sx={{
                          display: "flex",
                          gap: 1,
                          flexWrap: "wrap",
                          alignItems: "center",
                          mt: 0.75,
                        }}
                      >
                        <Chip
                          label="Em análise"
                          size="small"
                          sx={{
                            bgcolor: "#E7F3FF",
                            color: "#1877F2",
                            fontWeight: 950,
                            height: 22,
                          }}
                        />

                        {safeString(f.reviewedBy) ? (
                          <Chip
                            label={`Analisado por: ${safeString(f.reviewedBy)}`}
                            size="small"
                            sx={{
                              bgcolor: "#FAFBFC",
                              color: "#475569",
                              fontWeight: 900,
                              height: 22,
                            }}
                          />
                        ) : null}

                        {safeString(f.reviewedAt) ? (
                          <Chip
                            label={`Data: ${formatDateTimePtBR(f.reviewedAt)}`}
                            size="small"
                            sx={{
                              bgcolor: "#FAFBFC",
                              color: "#64748b",
                              fontWeight: 900,
                              height: 22,
                            }}
                          />
                        ) : null}

                        {isPending ? (
                          <Chip
                            icon={<WarningAmberIcon sx={{ fontSize: 16 }} />}
                            label="Pendente de registro"
                            size="small"
                            sx={{
                              bgcolor: "#FFFBEB",
                              color: "#92400E",
                              fontWeight: 950,
                              height: 22,
                              "& .MuiChip-icon": { color: "#92400E", ml: 0.5 },
                            }}
                          />
                        ) : null}
                      </Box>
                    </Box>
                  </Box>

                  {idx < filesInReview.length - 1 ? (
                    <Divider sx={{ my: 1.25, borderColor: "#EEF2F7" }} />
                  ) : null}
                </React.Fragment>
              );
            })}
          </Box>
        )}
      </Box>

      {/* Histórico */}
      <Box sx={{ mt: 2 }} />

      <Box
        sx={{
          border: "1px solid #EEF2F7",
          borderRadius: 2,
          bgcolor: "#FFFFFF",
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            px: 2,
            py: 1.25,
            bgcolor: "#FAFBFC",
            borderBottom: "1px solid #EEF2F7",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 1,
            flexWrap: "wrap",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
            <HistoryIcon sx={{ fontSize: 18, color: "#64748b" }} />
            <Typography sx={{ fontWeight: 950, color: "#0f172a" }}>
              Histórico de análises
            </Typography>

            <Chip
              label={`${historySummary.total} versão(ões)`}
              size="small"
              sx={{
                bgcolor: "#F0F2F5",
                color: "#334155",
                fontWeight: 900,
                height: 22,
              }}
            />

            {historySummary.approved > 0 ? (
              <Chip
                icon={<CheckCircleIcon sx={{ fontSize: 16 }} />}
                label={`${historySummary.approved} aprovado(s)`}
                size="small"
                sx={{
                  bgcolor: "#ECFDF3",
                  color: "#065F46",
                  fontWeight: 900,
                  height: 22,
                  "& .MuiChip-icon": { color: "#065F46", ml: 0.5 },
                }}
              />
            ) : null}

            {historySummary.rejected > 0 ? (
              <Chip
                icon={<CancelIcon sx={{ fontSize: 16 }} />}
                label={`${historySummary.rejected} correções`}
                size="small"
                sx={{
                  bgcolor: "#FEF2F2",
                  color: "#B91C1C",
                  fontWeight: 900,
                  height: 22,
                  "& .MuiChip-icon": { color: "#B91C1C", ml: 0.5 },
                }}
              />
            ) : null}
          </Box>

          <Tooltip title="Exportar histórico em PDF" arrow>
            <span>
              <Button
                onClick={exportHistoryToPdf}
                variant="outlined"
                startIcon={<PictureAsPdfIcon />}
                disabled={filesHistory.length === 0}
                sx={{
                  textTransform: "none",
                  borderRadius: 2,
                  borderColor: "#E4E6EB",
                  color: "#0f172a",
                  fontWeight: 900,
                  bgcolor: "#FFFFFF",
                  "&:hover": { borderColor: "#CBD5E1", bgcolor: "#FFFFFF" },
                }}
              >
                Exportar PDF
              </Button>
            </span>
          </Tooltip>
        </Box>

        {filesHistory.length === 0 ? (
          <Box sx={{ p: 2 }}>
            <Typography sx={{ color: "#64748b", fontWeight: 700 }}>
              Ainda não há registros de análise (aprovado/reprovado).
            </Typography>
          </Box>
        ) : (
          <Box sx={{ p: 2 }}>
            {filesHistory.map((f, idx) => {
              const isApproved = f.reviewStatus === "approved";
              const version = versionById.get(f.id) ?? 0;

              const statusChip = isApproved ? (
                <Chip
                  icon={<CheckCircleIcon sx={{ fontSize: 16 }} />}
                  label="Aprovado"
                  size="small"
                  sx={{
                    bgcolor: "#ECFDF3",
                    color: "#065F46",
                    fontWeight: 950,
                    height: 22,
                    "& .MuiChip-icon": { color: "#065F46", ml: 0.5 },
                  }}
                />
              ) : (
                <Chip
                  icon={<CancelIcon sx={{ fontSize: 16 }} />}
                  label="Correções solicitadas"
                  size="small"
                  sx={{
                    bgcolor: "#FEF2F2",
                    color: "#B91C1C",
                    fontWeight: 950,
                    height: 22,
                    "& .MuiChip-icon": { color: "#B91C1C", ml: 0.5 },
                  }}
                />
              );

              return (
                <React.Fragment key={f.id}>
                  <Box
                    sx={{
                      display: "flex",
                      gap: 2,
                      alignItems: "flex-start",
                      justifyContent: "space-between",
                    }}
                  >
                    <Box sx={{ minWidth: 0, flex: 1 }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
                        <Chip
                          label={`#${version || "—"}`}
                          size="small"
                          sx={{
                            bgcolor: "#F1F5F9",
                            color: "#0f172a",
                            fontWeight: 950,
                            height: 22,
                          }}
                        />

                        <Typography
                          sx={{
                            fontWeight: 900,
                            color: "#0f172a",
                            minWidth: 0,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                            flex: 1,
                          }}
                          title={f.name}
                        >
                          {f.name}
                        </Typography>
                      </Box>

                      <Box
                        sx={{
                          display: "flex",
                          gap: 1,
                          flexWrap: "wrap",
                          alignItems: "center",
                          mt: 0.75,
                        }}
                      >
                        {statusChip}

                        <Chip
                          label={`Data: ${formatDateTimePtBR(f.reviewedAt)}`}
                          size="small"
                          sx={{
                            bgcolor: "#FAFBFC",
                            color: "#64748b",
                            fontWeight: 900,
                            height: 22,
                          }}
                        />

                        <Chip
                          label={`Analisado por: ${safeString(f.reviewedBy) || "—"}`}
                          size="small"
                          sx={{
                            bgcolor: "#FAFBFC",
                            color: "#475569",
                            fontWeight: 900,
                            height: 22,
                          }}
                        />
                      </Box>

                      {safeString(f.reviewNote) ? (
                        <Typography
                          variant="body2"
                          sx={{
                            color: "#0f172a",
                            fontWeight: 750,
                            mt: 0.75,
                            whiteSpace: "pre-wrap",
                          }}
                        >
                          Motivo: {safeString(f.reviewNote)}
                        </Typography>
                      ) : (
                        <Typography
                          variant="body2"
                          sx={{ color: "#94a3b8", fontWeight: 800, mt: 0.75 }}
                        >
                          Motivo: —
                        </Typography>
                      )}
                    </Box>
                  </Box>

                  {idx < filesHistory.length - 1 ? (
                    <Divider sx={{ my: 1.5, borderColor: "#EEF2F7" }} />
                  ) : null}
                </React.Fragment>
              );
            })}
          </Box>
        )}
      </Box>

      <Box sx={{ mt: 2 }} />

      {/* Ações */}
      <Box
        sx={{
          display: "flex",
          gap: 1,
          flexWrap: "wrap",
          justifyContent: "flex-end",
        }}
      >
        <Tooltip
          title={
            !canDecide && isBlockedByPendingInReview
              ? "Bloqueado: existe arquivo em análise sem registro mínimo (quem/data)."
              : ""
          }
          arrow
        >
          <span>
            <Button
              variant="outlined"
              startIcon={<CancelIcon />}
              disabled={!canDecide}
              onClick={() => openConfirm("changes_requested")}
              sx={{
                textTransform: "none",
                borderRadius: 2,
                borderColor: "#FECACA",
                color: "#B91C1C",
                fontWeight: 950,
                bgcolor: "#FFFFFF",
                "&:hover": { borderColor: "#FCA5A5", bgcolor: "#FFFFFF" },
              }}
            >
              Solicitar correções
            </Button>
          </span>
        </Tooltip>

        <Tooltip
          title={
            !canDecide && isBlockedByPendingInReview
              ? "Bloqueado: existe arquivo em análise sem registro mínimo (quem/data)."
              : ""
          }
          arrow
        >
          <span>
            <Button
              variant="contained"
              startIcon={<CheckCircleIcon />}
              disabled={!canDecide}
              onClick={() => openConfirm("approved")}
              sx={{
                bgcolor: "#16A34A",
                "&:hover": { bgcolor: "#15803D" },
                textTransform: "none",
                fontWeight: 950,
                borderRadius: 2,
                boxShadow: "none",
              }}
            >
              Aprovar
            </Button>
          </span>
        </Tooltip>
      </Box>

      {/* Confirm dialog */}
      <Dialog open={confirmOpen} onClose={closeConfirm} fullWidth maxWidth="xs">
        <DialogTitle sx={{ fontWeight: 950, color: "#0f172a" }}>
          {confirmType === "approved"
            ? "Aprovar arquivos?"
            : "Solicitar correções?"}
        </DialogTitle>

        <DialogContent sx={{ pt: 0.5 }}>
          <Typography sx={{ color: "#475569", fontWeight: 700 }}>
            {confirmType === "approved"
              ? `Você aprovará ${filesInReview.length} arquivo(s) em análise e liberará o avanço da etapa.`
              : `Você solicitará correções para ${filesInReview.length} arquivo(s) em análise. A etapa volta para ajustes.`}
          </Typography>

          {isBlockedByPendingInReview ? (
            <Box
              sx={{
                mt: 1.25,
                border: "1px solid #FEF3C7",
                borderRadius: 2,
                bgcolor: "#FFFBEB",
                p: 1.25,
                display: "flex",
                gap: 1,
                alignItems: "flex-start",
              }}
            >
              <WarningAmberIcon sx={{ color: "#92400E", mt: 0.25 }} />
              <Typography
                variant="body2"
                sx={{ color: "#92400E", fontWeight: 800 }}
              >
                Atenção: existe arquivo “Em análise” sem registro mínimo (quem/data). A decisão permanecerá bloqueada.
              </Typography>
            </Box>
          ) : null}
        </DialogContent>

        <DialogActions sx={{ p: 2, pt: 1.25 }}>
          <Button
            onClick={closeConfirm}
            variant="outlined"
            sx={{
              textTransform: "none",
              borderRadius: 2,
              borderColor: "#E4E6EB",
              color: "#0f172a",
              fontWeight: 900,
              "&:hover": { borderColor: "#CBD5E1", backgroundColor: "#fff" },
            }}
          >
            Cancelar
          </Button>

          <Button
            onClick={emitDecision}
            variant="contained"
            disabled={!canDecide}
            sx={{
              bgcolor: confirmType === "approved" ? "#16A34A" : "#F02849",
              "&:hover": {
                bgcolor: confirmType === "approved" ? "#15803D" : "#D61F3D",
              },
              textTransform: "none",
              fontWeight: 950,
              borderRadius: 2,
              boxShadow: "none",
            }}
          >
            Confirmar
          </Button>
        </DialogActions>
      </Dialog>
    </BaseStageComponentCard>
  );
};
