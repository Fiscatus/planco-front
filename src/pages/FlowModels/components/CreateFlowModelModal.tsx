import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  CircularProgress,
} from "@mui/material";
import { useCallback, useState } from "react";
import type { CreateFlowModelDto } from "@/hooks/useFlowModels";

type CreateFlowModelModalProps = {
  open: boolean;
  onClose: () => void;
  onSave: (data: CreateFlowModelDto) => void;
  loading?: boolean;
};

export const CreateFlowModelModal = ({
  open,
  onClose,
  onSave,
  loading = false,
}: CreateFlowModelModalProps) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const handleSave = useCallback(() => {
    if (!name.trim()) {
      return;
    }

    onSave({
      name: name.trim(),
      description: description.trim() || undefined,
      stages: [
        {
          stageId: `stage_${Date.now()}`, // id único simples
          order: 1,
          name: "Etapa 1",
          description: "Etapa inicial do fluxo",
          requiresApproval: false,
          components: [
            {
              order: 1,
              type: "STAGE_PANEL",
              key: "stage_panel",
              label: "Painel da Etapa",
              description: "Visão geral da etapa",
              required: false,
            },
          ],
        },
      ],
      isActive: true,
    });

    // Reset form
    setName("");
    setDescription("");
  }, [name, description, onSave]);

  const handleClose = useCallback(() => {
    if (!loading) {
      setName("");
      setDescription("");
      onClose();
    }
  }, [loading, onClose]);

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 600 }}>Novo Modelo de Fluxo</DialogTitle>
      <DialogContent>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
          <TextField
            label="Nome do Modelo"
            value={name}
            onChange={(e) => setName(e.target.value)}
            fullWidth
            required
            disabled={loading}
            placeholder="Ex: Modelo Fiscatus"
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
          />
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button
          onClick={handleClose}
          disabled={loading}
          sx={{ textTransform: "none" }}
        >
          Cancelar
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          disabled={loading || !name.trim()}
          sx={{
            bgcolor: "#1877F2",
            "&:hover": { bgcolor: "#166FE5" },
            "&:disabled": {
              bgcolor: "#E4E6EB",
              color: "#A0A4A8",
            },
            textTransform: "none",
            minWidth: 100,
            borderRadius: 2,
            boxShadow: "none",
            fontWeight: 600,
          }}
        >
          {loading ? (
            <CircularProgress size={20} sx={{ color: "#fff" }} />
          ) : (
            "Criar"
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
