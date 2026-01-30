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
} from "@mui/material";
import {
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Info as InfoIcon,
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

  const alreadyDecided = Boolean(cfg.decision);

  const canDecideByFiles = filesInReview.length > 0;
  const canDecide =
    !locked && !alreadyDecided && Boolean(filesComponent) && canDecideByFiles;

  const [justification, setJustification] = useState(cfg.justification || "");

  // dialog confirm
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmType, setConfirmType] = useState<ApprovalDecision>("approved");

  const openConfirm = useCallback((type: ApprovalDecision) => {
    setConfirmType(type);
    setConfirmOpen(true);
  }, []);

  const closeConfirm = useCallback(() => setConfirmOpen(false), []);

  const emitDecision = useCallback(() => {
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
  }, [filesInReview, onEvent, component.key, confirmType, justification]);

  const headerChip = useMemo(() => {
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
    if (alreadyDecided) return null;

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
            Esta etapa não possui “Gerenciar Arquivos” (FILES_MANAGMENT). Sem
            anexos em análise, a aprovação fica indisponível.
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
            Para aprovar ou solicitar correções, envie pelo menos 1 arquivo para
            o status “Em análise” no card de “Gerenciar Arquivos”.
          </Typography>

          {filesRejected.length > 0 ? (
            <Typography
              variant="body2"
              sx={{ color: "#B91C1C", fontWeight: 800, mt: 0.75 }}
            >
              Existem {filesRejected.length} arquivo(s) rejeitado(s). Anexe a
              nova versão e envie para análise.
            </Typography>
          ) : null}
        </Box>
      );
    }

    return null;
  }, [alreadyDecided, filesComponent, canDecideByFiles, filesRejected.length]);

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

      <Box sx={{ mt: 1.5 }} />

      <TextField
        value={justification}
        onChange={(e) => setJustification(e.target.value)}
        label="Justificativa / Observações"
        placeholder="Descreva o motivo da aprovação ou as correções solicitadas..."
        fullWidth
        multiline
        minRows={4}
        disabled={locked || alreadyDecided}
        sx={{
          "& .MuiInputBase-root": {
            borderRadius: 2,
            bgcolor: locked || alreadyDecided ? "#F8FAFC" : "#FFFFFF",
          },
        }}
      />

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
          }}
        >
          <Typography sx={{ fontWeight: 950, color: "#0f172a" }}>
            Arquivos em análise: {filesInReview.length}
          </Typography>
        </Box>

        {filesInReview.length === 0 ? (
          <Box sx={{ p: 2 }}>
            <Typography sx={{ color: "#64748b", fontWeight: 700 }}>
              Nenhum arquivo no status “Em análise”.
            </Typography>
          </Box>
        ) : (
          <Box sx={{ p: 2 }}>
            {filesInReview.map((f, idx) => (
              <React.Fragment key={f.id}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 2,
                  }}
                >
                  <Typography
                    sx={{
                      fontWeight: 900,
                      color: "#0f172a",
                      minWidth: 0,
                      flex: 1,
                    }}
                  >
                    {f.name}
                  </Typography>
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
                </Box>
                {idx < filesInReview.length - 1 ? (
                  <Divider sx={{ my: 1.25, borderColor: "#EEF2F7" }} />
                ) : null}
              </React.Fragment>
            ))}
          </Box>
        )}
      </Box>

      <Box sx={{ mt: 2 }} />

      <Box
        sx={{
          display: "flex",
          gap: 1,
          flexWrap: "wrap",
          justifyContent: "flex-end",
        }}
      >
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

        <Button
          variant="contained"
          startIcon={<CheckCircleIcon />}
          disabled={!canDecide}
          onClick={() => openConfirm("approved")}
          sx={{
            bgcolor: "#1877F2",
            "&:hover": { bgcolor: "#166FE5" },
            textTransform: "none",
            fontWeight: 950,
            borderRadius: 2,
            boxShadow: "none",
          }}
        >
          Aprovar
        </Button>
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
            sx={{
              bgcolor: confirmType === "approved" ? "#1877F2" : "#F02849",
              "&:hover": {
                bgcolor: confirmType === "approved" ? "#166FE5" : "#D61F3D",
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
