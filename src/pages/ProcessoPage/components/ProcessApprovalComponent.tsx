import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Box, Button, Chip, Collapse, Dialog, DialogContent, DialogTitle, DialogActions, Typography, TextField, IconButton, Tooltip, CircularProgress } from "@mui/material";
import {
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Schedule as ScheduleIcon,
  OpenInNew as OpenInNewIcon,
  Info as InfoIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Fullscreen as FullscreenIcon,
} from "@mui/icons-material";
import { usePendingApproval, useResolveApproval, useDownloadFile } from "@/hooks";

type ReviewStatus = "in_review" | "approved" | "changes_requested";

const getStatusChip = (status: ReviewStatus) => {
  if (status === "approved") return { label: "Aprovado", bg: "#ECFDF3", color: "#065F46", icon: <CheckCircleIcon sx={{ fontSize: 16 }} /> };
  if (status === "changes_requested") return { label: "Correções solicitadas", bg: "#FEE2E2", color: "#B91C1C", icon: <CancelIcon sx={{ fontSize: 16 }} /> };
  return { label: "Em análise", bg: "#FEF3C7", color: "#92400E", icon: <ScheduleIcon sx={{ fontSize: 16 }} /> };
};

const formatDate = (date?: string) => {
  if (!date) return "—";
  const d = new Date(date);
  return `${d.toLocaleDateString("pt-BR")} às ${d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`;
};

type ProcessApprovalComponentProps = {
  label?: string;
  description?: string;
  context: {
    processId: string;
    stageId: string;
    componentKey: string;
  };
  enabled?: boolean;
  readOnly?: boolean;
  onApproved?: () => void;
};

const ApprovalContent = ({ context, enabled, readOnly = false, onApproved }: {
  context: ProcessApprovalComponentProps["context"];
  enabled: boolean;
  readOnly?: boolean;
  onApproved?: () => void;
}) => {
  const queryClient = useQueryClient();
  const { data: pendingData, isLoading } = usePendingApproval(context.processId, enabled);
  const resolveMutation = useResolveApproval();
  const downloadMutation = useDownloadFile();

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmType, setConfirmType] = useState<"approved" | "changes_requested">("approved");
  const [reason, setReason] = useState("");

  const handleResolve = () => {
    resolveMutation.mutate(
      { processId: context.processId, approved: confirmType === "approved", reason: reason || undefined },
      {
        onSuccess: () => {
          setConfirmOpen(false);
          setReason("");
          queryClient.invalidateQueries({ queryKey: ["flowInstance"] });
          onApproved?.();
        }
      }
    );
  };

  const handleOpenFile = async () => {
    if (!pendingData?.fileId?._id) return;
    const result = await downloadMutation.mutateAsync({ fileId: pendingData.fileId._id, inline: true });
    if (result?.signedUrl) window.open(result.signedUrl, "_blank");
  };

  if (isLoading) return <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}><CircularProgress /></Box>;

  const file = pendingData?.fileId;
  const hasPending = !!file;

  return (
    <>
      <Box sx={{ px: 2, py: 1, borderBottom: "1px solid #E4E6EB" }}>
        <Typography variant="body2" sx={{ color: "#64748b", fontSize: "0.8rem" }}>
          {hasPending ? "1 documento aguardando análise" : "Nenhum documento aguardando análise"}
        </Typography>
      </Box>

      <Box sx={{ p: 2.25 }}>
        <Typography sx={{ fontWeight: 700, color: "#0f172a", fontSize: "0.9rem", mb: 1.5 }}>Documentos em análise</Typography>
        {!hasPending ? (
          <Typography variant="body2" sx={{ color: "#94a3b8", textAlign: "center", py: 2 }}>Nenhum documento aguardando análise</Typography>
        ) : (
          <Box sx={{ p: 1.5, bgcolor: "#FAFBFC", borderRadius: 2, border: "1px solid #E4E6EB" }}>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1.5, mb: 0.75 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, flex: 1, minWidth: 0 }}>
                <Chip label={`v${file.version || 1}`} size="small" sx={{ bgcolor: "#E7F3FF", color: "#1877F2", fontWeight: 700, fontSize: "0.75rem", height: 22 }} />
                <Typography sx={{ fontWeight: 700, color: "#0f172a", fontSize: "0.9rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{file.fileName}</Typography>
              </Box>
              <Tooltip title="Abrir documento">
                <IconButton onClick={handleOpenFile} sx={{ border: "1px solid #E4E6EB", borderRadius: 2, "&:hover": { borderColor: "#1877F2", bgcolor: "#F0F9FF" } }}>
                  <OpenInNewIcon fontSize="small" sx={{ color: "#1877F2" }} />
                </IconButton>
              </Tooltip>
            </Box>
            <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
              <Chip icon={getStatusChip("in_review").icon} label={getStatusChip("in_review").label} size="small" sx={{ bgcolor: getStatusChip("in_review").bg, color: getStatusChip("in_review").color, fontWeight: 700, fontSize: "0.75rem", height: 22, "& .MuiChip-icon": { color: getStatusChip("in_review").color } }} />
              <Chip label={formatDate(pendingData.createdAt)} size="small" sx={{ bgcolor: "#FAFBFC", color: "#64748b", fontWeight: 700, fontSize: "0.75rem", height: 22 }} />
            </Box>
          </Box>
        )}
      </Box>

      {hasPending && !readOnly && (
        <Box sx={{ px: 2.25, pb: 2.25, display: "flex", gap: 1, justifyContent: "flex-end" }}>
          <Button onClick={() => { setConfirmType("changes_requested"); setConfirmOpen(true); }} variant="outlined" startIcon={<CancelIcon />} sx={{ textTransform: "none", borderRadius: 2, borderColor: "#FECACA", color: "#B91C1C", fontWeight: 700 }}>
            Solicitar correções
          </Button>
          <Button onClick={() => { setConfirmType("approved"); setConfirmOpen(true); }} variant="contained" startIcon={<CheckCircleIcon />} sx={{ bgcolor: "#16A34A", textTransform: "none", fontWeight: 700, borderRadius: 2 }}>
            Aprovar
          </Button>
        </Box>
      )}

      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle sx={{ fontWeight: 700, color: "#0f172a" }}>
          {confirmType === "approved" ? "Aprovar documento" : "Solicitar correções"}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: "#64748b", mb: 2 }}>
            {confirmType === "approved" ? "Adicione uma observação sobre a aprovação (opcional)" : "Descreva as correções necessárias"}
          </Typography>
          <TextField fullWidth multiline rows={3} value={reason} onChange={(e) => setReason(e.target.value)}
            placeholder={confirmType === "approved" ? "Observações..." : "Descreva as correções necessárias..."} />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setConfirmOpen(false)} variant="outlined" sx={{ textTransform: "none", borderRadius: 2 }}>Cancelar</Button>
          <Button onClick={handleResolve} disabled={resolveMutation.isPending} variant="contained"
            sx={{ bgcolor: confirmType === "approved" ? "#16A34A" : "#F02849", textTransform: "none", borderRadius: 2 }}>
            {resolveMutation.isPending ? <CircularProgress size={20} /> : "Confirmar"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export const ProcessApprovalComponent = ({ label, description, context, enabled = true, readOnly = false, onApproved }: ProcessApprovalComponentProps) => {
  const [collapsed, setCollapsed] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);

  const headerContent = (onClose?: () => void) => (
    <Box sx={{ px: 2.25, py: 2, bgcolor: "#F8FAFC", borderBottom: "2px solid #E4E6EB", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <Typography sx={{ fontWeight: 700, color: "#0f172a", fontSize: onClose ? "1.1rem" : "0.95rem" }}>{label || "Aprovação"}</Typography>
        {description && (
          <Tooltip title={description} arrow>
            <InfoIcon sx={{ fontSize: 18, color: "#1877F2", cursor: "help" }} />
          </Tooltip>
        )}
      </Box>
      <Box sx={{ display: "flex", gap: 0.5 }}>
        {onClose ? (
          <Button onClick={onClose} variant="outlined" sx={{ textTransform: "none", fontWeight: 700, borderRadius: 2 }}>Fechar</Button>
        ) : (
          <>
            <Tooltip title="Tela cheia">
              <IconButton size="small" onClick={() => setFullscreen(true)} sx={{ color: "#64748b" }}>
                <FullscreenIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title={collapsed ? "Expandir" : "Recolher"}>
              <IconButton size="small" onClick={() => setCollapsed((v) => !v)} sx={{ color: "#64748b" }}>
                {collapsed ? <ExpandMoreIcon fontSize="small" /> : <ExpandLessIcon fontSize="small" />}
              </IconButton>
            </Tooltip>
          </>
        )}
      </Box>
    </Box>
  );

  return (
    <>
      <Box sx={{ border: "1px solid #E4E6EB", borderRadius: 2, bgcolor: "#fff", overflow: "hidden" }}>
        {headerContent()}
        <Collapse in={!collapsed}>
          <ApprovalContent context={context} enabled={enabled} readOnly={readOnly} onApproved={onApproved} />
        </Collapse>
      </Box>

      <Dialog open={fullscreen} onClose={() => setFullscreen(false)} fullScreen>
        <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
          {headerContent(() => setFullscreen(false))}
          <Box sx={{ flex: 1, overflow: "auto", bgcolor: "#fff" }}>
            <ApprovalContent context={context} enabled={enabled} readOnly={readOnly} onApproved={onApproved} />
          </Box>
        </Box>
      </Dialog>
    </>
  );
};
