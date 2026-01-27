import { useMemo, useState } from "react";
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogContent,
  Divider,
  IconButton,
  TextField,
  Typography,
  CircularProgress,
} from "@mui/material";
import {
  Close as CloseIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  FactCheck as FactCheckIcon,
  Gavel as GavelIcon,
  Lock as LockIcon,
} from "@mui/icons-material";
import type { StageComponentRuntimeProps } from "../componentRegistry";
import { BaseStageComponentCard } from "./BaseStageComponentCard";

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

type ApprovalDecision = "approved" | "changes_requested";

type ApprovalConfig = {
  decision?: ApprovalDecision;
  decidedBy?: string;
  decidedAt?: string; // ISO
};

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

function safeString(v: unknown) {
  return String(v ?? "").trim();
}

function normalizeConfig(raw: unknown): ApprovalConfig {
  if (!raw || typeof raw !== "object") return {};
  const obj = raw as Record<string, unknown>;

  const decision = safeString(obj.decision) as ApprovalDecision;

  if (decision !== "approved" && decision !== "changes_requested") {
    return {};
  }

  return {
    decision,
    decidedBy: safeString(obj.decidedBy) || undefined,
    decidedAt: safeString(obj.decidedAt) || undefined,
  };
}

function decisionChip(decision: ApprovalDecision) {
  if (decision === "approved") {
    return {
      label: "Aprovado",
      bg: "#ECFDF3",
      color: "#065F46",
      icon: <CheckCircleIcon sx={{ fontSize: 16 }} />,
    };
  }

  return {
    label: "Correção solicitada",
    bg: "#FEF2F2",
    color: "#B91C1C",
    icon: <CancelIcon sx={{ fontSize: 16 }} />,
  };
}

/* -------------------------------------------------------------------------- */
/* Confirmation Dialog                                                         */
/* -------------------------------------------------------------------------- */

type ConfirmDialogProps = {
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  confirmColor: string;
  loading?: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

const ConfirmDialog = ({
  open,
  title,
  description,
  confirmLabel,
  confirmColor,
  loading = false,
  onClose,
  onConfirm,
}: ConfirmDialogProps) => {
  return (
    <Dialog open={open} onClose={loading ? undefined : onClose} fullWidth maxWidth="xs">
      <DialogContent sx={{ p: 0 }}>
        <Box
          sx={{
            p: 2.5,
            borderBottom: "1px solid #E4E6EB",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 2,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                bgcolor: "#F0F2F5",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <GavelIcon sx={{ fontSize: 18, color: "#475569" }} />
            </Box>
            <Typography sx={{ fontWeight: 900, color: "#0f172a" }}>{title}</Typography>
          </Box>

          <IconButton onClick={onClose} disabled={loading}>
            <CloseIcon />
          </IconButton>
        </Box>

        <Box sx={{ p: 2.5, display: "flex", flexDirection: "column", gap: 2 }}>
          <Typography variant="body2" sx={{ color: "#475569", fontWeight: 700 }}>
            {description}
          </Typography>

          <Box sx={{ display: "flex", gap: 1 }}>
            <Button
              onClick={onClose}
              variant="outlined"
              disabled={loading}
              sx={{
                textTransform: "none",
                borderRadius: 2,
                borderColor: "#E4E6EB",
                color: "#212121",
                fontWeight: 900,
                flex: 1,
              }}
            >
              Cancelar
            </Button>

            <Button
              onClick={onConfirm}
              variant="contained"
              disabled={loading}
              sx={{
                bgcolor: confirmColor,
                "&:hover": { bgcolor: confirmColor },
                textTransform: "none",
                fontWeight: 900,
                borderRadius: 2,
                boxShadow: "none",
                flex: 1,
              }}
            >
              {loading ? (
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <CircularProgress size={16} sx={{ color: "#fff" }} />
                  Processando...
                </Box>
              ) : (
                confirmLabel
              )}
            </Button>
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

/* -------------------------------------------------------------------------- */
/* ApprovalComponent                                                           */
/* -------------------------------------------------------------------------- */

export const ApprovalComponent = ({
  component,
  isReadOnly,
  stageCompleted,
  onEvent,
}: StageComponentRuntimeProps) => {
  const cfg = useMemo(
    () => normalizeConfig(component.config),
    [component.config]
  );

  const alreadyDecided = Boolean(cfg.decision);

  const canDecide =
    !isReadOnly &&
    !stageCompleted &&
    !alreadyDecided;

  const [justification, setJustification] = useState("");
  const [error, setError] = useState("");
  const [confirmType, setConfirmType] = useState<ApprovalDecision | null>(null);
  const [loading, setLoading] = useState(false);

  const handleOpenConfirm = (type: ApprovalDecision) => {
    if (!canDecide) return;

    if (!safeString(justification)) {
      setError("A justificativa é obrigatória");
      return;
    }

    setError("");
    setConfirmType(type);
    onEvent?.("approval:confirm:open", {
      componentKey: component.key,
      decision: type,
    });
  };

  const handleConfirm = async () => {
    if (!confirmType) return;

    setLoading(true);

    onEvent?.("approval:decision", {
      componentKey: component.key,
      decision: confirmType,
      justification,
    });

    // preview: simula latência
    await new Promise((r) => setTimeout(r, 900));

    setLoading(false);
    setConfirmType(null);
  };

  const decisionUI = cfg.decision ? decisionChip(cfg.decision) : null;

  return (
    <>
      <BaseStageComponentCard
        title={component.label || "Decisão"}
        subtitle={component.description || "Aprovação ou solicitação de ajustes"}
        icon={<FactCheckIcon sx={{ fontSize: 18 }} />}
        required={component.required}
        lockedAfterCompletion={component.lockedAfterCompletion}
        isReadOnly={isReadOnly}
        rightSlot={
          decisionUI ? (
            <Chip
              icon={decisionUI.icon}
              label={decisionUI.label}
              size="small"
              sx={{
                bgcolor: decisionUI.bg,
                color: decisionUI.color,
                fontWeight: 900,
                fontSize: "0.75rem",
                height: 24,
                "& .MuiChip-icon": { color: decisionUI.color },
              }}
            />
          ) : null
        }
      >
        {/* Decisão já tomada */}
        {alreadyDecided ? (
          <Box
            sx={{
              border: "1px solid #E4E6EB",
              borderRadius: 2,
              bgcolor: "#FAFBFC",
              p: 2,
              display: "flex",
              alignItems: "center",
              gap: 1.5,
            }}
          >
            <LockIcon sx={{ color: "#64748b" }} />
            <Typography sx={{ fontWeight: 900, color: "#475569" }}>
              Decisão registrada. Esta etapa não pode mais ser alterada.
            </Typography>
          </Box>
        ) : (
          <>
            <TextField
              label="Justificativa"
              multiline
              minRows={4}
              value={justification}
              onChange={(e) => {
                setJustification(e.target.value);
                if (error) setError("");
              }}
              disabled={!canDecide}
              placeholder="Descreva o motivo da aprovação ou das correções solicitadas..."
              error={Boolean(error)}
              helperText={error}
              fullWidth
            />

            <Divider sx={{ my: 2 }} />

            <Box sx={{ display: "flex", gap: 1 }}>
              <Button
                onClick={() => handleOpenConfirm("changes_requested")}
                variant="outlined"
                disabled={!canDecide}
                startIcon={<CancelIcon />}
                sx={{
                  textTransform: "none",
                  borderRadius: 2,
                  borderColor: "#FECACA",
                  color: "#B91C1C",
                  fontWeight: 900,
                  flex: 1,
                  "&:hover": { bgcolor: "#FEF2F2" },
                }}
              >
                Solicitar correção
              </Button>

              <Button
                onClick={() => handleOpenConfirm("approved")}
                variant="contained"
                disabled={!canDecide}
                startIcon={<CheckCircleIcon />}
                sx={{
                  bgcolor: "#16A34A",
                  "&:hover": { bgcolor: "#15803D" },
                  textTransform: "none",
                  fontWeight: 900,
                  borderRadius: 2,
                  boxShadow: "none",
                  flex: 1,
                }}
              >
                Aprovar
              </Button>
            </Box>
          </>
        )}
      </BaseStageComponentCard>

      <ConfirmDialog
        open={Boolean(confirmType)}
        loading={loading}
        title={
          confirmType === "approved"
            ? "Confirmar aprovação"
            : "Solicitar correção"
        }
        description={
          confirmType === "approved"
            ? "Esta ação aprova a etapa e libera a próxima no fluxo."
            : "A etapa será devolvida para ajustes antes de prosseguir."
        }
        confirmLabel={
          confirmType === "approved" ? "Confirmar aprovação" : "Confirmar devolução"
        }
        confirmColor={confirmType === "approved" ? "#16A34A" : "#DC2626"}
        onClose={() => {
          if (loading) return;
          setConfirmType(null);
          onEvent?.("approval:confirm:close", { componentKey: component.key });
        }}
        onConfirm={handleConfirm}
      />
    </>
  );
};
