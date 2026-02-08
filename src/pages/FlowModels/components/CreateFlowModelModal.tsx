import { useCallback, useEffect, useState } from "react";
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogContent,
  IconButton,
  TextField,
  Typography,
  Chip,
} from "@mui/material";
import { Close as CloseIcon } from "@mui/icons-material";
import type { CreateFlowModelDto } from "@/hooks/useFlowModels";

type CreateFlowModelModalProps = {
  open: boolean;
  onClose: () => void;
  onSave: (data: CreateFlowModelDto) => void;
  loading?: boolean;
};

export const CreateFlowModelModal = ({ open, onClose, onSave, loading = false }: CreateFlowModelModalProps) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (open) {
      setName("");
      setDescription("");
    }
  }, [open]);

  const handleSave = useCallback(() => {
    if (!name.trim()) return;
    onSave({
      name: name.trim(),
      description: description.trim() || undefined,
      stages: [{
        stageId: `stage_${Date.now()}`,
        order: 1,
        name: "Etapa 1",
        description: "Etapa inicial do fluxo",
        requiresApproval: false,
        components: [{
          order: 1,
          type: "STAGE_PANEL",
          key: "stage_panel",
          label: "Painel da Etapa",
          description: "Visão geral da etapa",
          required: false,
        }],
      }],
      isActive: true,
    });
  }, [name, description, onSave]);

  const handleClose = useCallback(() => {
    if (!loading) onClose();
  }, [loading, onClose]);

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{
        sx: {
          borderRadius: { xs: 3, sm: 4 },
          overflow: "hidden",
          boxShadow: "0 25px 60px rgba(0,0,0,.22)",
          border: "1px solid #eef2f7",
        },
      }}
    >
      <DialogContent sx={{ p: 0 }}>
        <Box
          sx={{
            px: { xs: 2.5, sm: 3 },
            pt: { xs: 2.5, sm: 3 },
            pb: 2,
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: 2,
            background: "#ffffff",
          }}
        >
          <Box sx={{ minWidth: 0 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.25, flexWrap: "wrap" }}>
              <Typography
                sx={{
                  fontWeight: 900,
                  color: "#0f172a",
                  fontSize: { xs: "1.25rem", sm: "1.35rem" },
                  lineHeight: 1.2,
                  letterSpacing: "-0.02em",
                }}
              >
                Novo Modelo de Fluxo
              </Typography>

              <Chip
                label="Novo"
                size="small"
                sx={{
                  height: 22,
                  fontSize: "0.72rem",
                  fontWeight: 800,
                  backgroundColor: "#EFF6FF",
                  color: "#2563EB",
                  border: "1px solid #BFDBFE",
                }}
              />
            </Box>

            <Typography
              variant="body2"
              sx={{
                mt: 0.75,
                color: "#64748b",
                lineHeight: 1.5,
                maxWidth: 520,
              }}
            >
              Crie um modelo base para reutilizar em diferentes processos.
            </Typography>
          </Box>

          <IconButton
            onClick={handleClose}
            disabled={loading}
            sx={{
              width: 40,
              height: 40,
              color: "#64748b",
              "&:hover": { backgroundColor: "#f1f5f9" },
              "&:disabled": { opacity: 0.5 },
            }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>

        <Box sx={{ height: 1, backgroundColor: "#eef2f7" }} />

        <Box
          sx={{
            px: { xs: 2.5, sm: 3 },
            py: { xs: 2.5, sm: 3 },
            background: "#ffffff",
          }}
        >
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <TextField
              label="Nome do Modelo"
              value={name}
              onChange={(e) => setName(e.target.value)}
              fullWidth
              required
              disabled={loading}
              placeholder="Ex: Modelo Fiscatus"
              sx={{
                "& .MuiInputLabel-root": { fontWeight: 700 },
                "& .MuiOutlinedInput-root": {
                  borderRadius: 3,
                  backgroundColor: "#ffffff",
                  "& fieldset": { borderColor: "#e2e8f0" },
                  "&:hover fieldset": { borderColor: "#cbd5e1" },
                  "&.Mui-focused fieldset": { borderColor: "#1877F2" },
                },
              }}
            />

            <TextField
              label="Descrição"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              fullWidth
              multiline
              rows={4}
              disabled={loading}
              placeholder="Descreva o propósito deste modelo de fluxo..."
              sx={{
                "& .MuiInputLabel-root": { fontWeight: 700 },
                "& .MuiOutlinedInput-root": {
                  borderRadius: 3,
                  backgroundColor: "#ffffff",
                  "& fieldset": { borderColor: "#e2e8f0" },
                  "&:hover fieldset": { borderColor: "#cbd5e1" },
                  "&.Mui-focused fieldset": { borderColor: "#1877F2" },
                },
              }}
            />

            <Typography variant="caption" sx={{ color: "#94a3b8", lineHeight: 1.4 }}>
              Ao criar, o sistema gera uma etapa inicial padrão para você começar a editar.
            </Typography>
          </Box>
        </Box>

        <Box
          sx={{
            px: { xs: 2.5, sm: 3 },
            py: 2,
            display: "flex",
            justifyContent: "flex-end",
            gap: 1.25,
            background: "#f8fafc",
            borderTop: "1px solid #eef2f7",
          }}
        >
          <Button
            onClick={handleClose}
            disabled={loading}
            variant="outlined"
            sx={{
              textTransform: "none",
              borderRadius: 999,
              borderColor: "#e2e8f0",
              color: "#0f172a",
              fontWeight: 800,
              px: 2.5,
              "&:hover": { borderColor: "#cbd5e1", backgroundColor: "#ffffff" },
            }}
          >
            Cancelar
          </Button>

          <Button
            onClick={handleSave}
            variant="contained"
            disabled={loading || !name.trim()}
            sx={{
              textTransform: "none",
              borderRadius: 999,
              backgroundColor: "#1877F2",
              fontWeight: 900,
              px: 3,
              boxShadow: "none",
              "&:hover": { backgroundColor: "#166fe5" },
              "&:disabled": { backgroundColor: "#e2e8f0", color: "#94a3b8" },
            }}
          >
            {loading ? <CircularProgress size={18} sx={{ color: "#fff" }} /> : "Criar"}
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
};
