import { Dialog, DialogContent, Button, Box, Typography, IconButton } from "@mui/material";
import { Close as CloseIcon, Warning as WarningIcon } from "@mui/icons-material";

type ConfirmDialogProps = {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
};

export const ConfirmDialog = ({
  open,
  onClose,
  onConfirm,
  title = "Confirmar ação",
  message = "Tem certeza que deseja continuar?",
}: ConfirmDialogProps) => (
  <Dialog
    open={open}
    onClose={onClose}
    maxWidth="xs"
    fullWidth
    PaperProps={{ sx: { borderRadius: 3, overflow: "hidden", boxShadow: "0 25px 60px rgba(0,0,0,.22)" } }}
  >
    <DialogContent sx={{ p: 0 }}>
      <Box sx={{ px: 3, pt: 3, pb: 2, display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 2 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Box sx={{ width: 40, height: 40, borderRadius: "50%", bgcolor: "#FEF3C7", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <WarningIcon sx={{ color: "#F59E0B", fontSize: 24 }} />
          </Box>
          <Typography sx={{ fontWeight: 900, color: "#0f172a", fontSize: "1.25rem", lineHeight: 1.2 }}>
            {title}
          </Typography>
        </Box>
        <IconButton onClick={onClose} sx={{ width: 40, height: 40, color: "#64748b" }}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>

      <Box sx={{ px: 3, py: 2 }}>
        <Typography variant="body2" sx={{ color: "#64748b", lineHeight: 1.6 }}>
          {message}
        </Typography>
      </Box>

      <Box sx={{ px: 3, py: 2, display: "flex", justifyContent: "flex-end", gap: 1.25, bgcolor: "#f8fafc", borderTop: "1px solid #eef2f7" }}>
        <Button onClick={onClose} variant="outlined" sx={{ textTransform: "none", borderRadius: 999, borderColor: "#e2e8f0", color: "#0f172a", fontWeight: 800, px: 2.5, "&:hover": { borderColor: "#cbd5e1", backgroundColor: "#ffffff" } }}>
          Cancelar
        </Button>
        <Button onClick={onConfirm} variant="contained" sx={{ textTransform: "none", borderRadius: 999, backgroundColor: "primary.main", fontWeight: 900, px: 3, boxShadow: "none", "&:hover": { backgroundColor: "primary.dark" } }}>
          Continuar
        </Button>
      </Box>
    </DialogContent>
  </Dialog>
);
