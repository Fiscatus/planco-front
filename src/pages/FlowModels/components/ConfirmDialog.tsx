import { Dialog, DialogContent, Button, Box, Typography, IconButton } from "@mui/material";
import { Close as CloseIcon, Warning as WarningIcon, Delete as DeleteIcon } from "@mui/icons-material";

type ConfirmDialogProps = {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
  variant?: "warning" | "danger";
};

export const ConfirmDialog = ({
  open,
  onClose,
  onConfirm,
  title = "Confirmar ação",
  message = "Tem certeza que deseja continuar?",
  variant = "warning",
}: ConfirmDialogProps) => {
  const isDanger = variant === "danger";
  
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{ sx: { borderRadius: isDanger ? 2 : 3, overflow: "hidden", boxShadow: "0 25px 60px rgba(0,0,0,.22)" } }}
    >
      <DialogContent sx={{ p: isDanger ? 3 : 0 }}>
        {isDanger ? (
          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
            <Box sx={{ bgcolor: "#FEE2E2", borderRadius: "50%", p: 1.5, mb: 2 }}>
              <DeleteIcon sx={{ fontSize: 32, color: "#DC2626" }} />
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
              {title}
            </Typography>
            <Typography variant="body2" sx={{ color: "#64748b", mb: 3 }}>
              {message}
            </Typography>
            <Box sx={{ display: "flex", gap: 1.5, width: "100%" }}>
              <Button
                onClick={onClose}
                variant="outlined"
                fullWidth
                sx={{
                  textTransform: "none",
                  borderRadius: 1.5,
                  fontWeight: 600,
                  borderColor: "#E4E6EB",
                  color: "#212121",
                }}
              >
                Cancelar
              </Button>
              <Button
                onClick={onConfirm}
                variant="contained"
                fullWidth
                sx={{
                  textTransform: "none",
                  borderRadius: 1.5,
                  fontWeight: 600,
                  bgcolor: "#DC2626",
                  "&:hover": { bgcolor: "#B91C1C" },
                }}
              >
                Excluir
              </Button>
            </Box>
          </Box>
        ) : (
          <>
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
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};
