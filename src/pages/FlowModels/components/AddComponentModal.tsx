import { useState } from "react";
import { Dialog, DialogContent, Button, Box, Typography, IconButton, TextField, MenuItem, FormControlLabel, Switch } from "@mui/material";
import { Close as CloseIcon } from "@mui/icons-material";
import type { ComponentType, FlowModelComponent } from "@/hooks/useFlowModels";

type AddComponentModalProps = {
  open: boolean;
  onClose: () => void;
  onAdd: (component: FlowModelComponent) => void;
  existingComponents: FlowModelComponent[];
};

const COMPONENT_TYPES: { value: ComponentType; label: string }[] = [
  { value: "SIGNATURE", label: "Assinatura Eletrônica" },
  { value: "FORM", label: "Formulário" },
  { value: "FILES_MANAGMENT", label: "Gerenciar Arquivos" },
  { value: "COMMENTS", label: "Comentários" },
  { value: "APPROVAL", label: "Aprovação" },
  { value: "STAGE_PANEL", label: "Painel de Status" },
  { value: "TIMELINE", label: "Linha do Tempo" },
  { value: "FILE_VIEWER", label: "Visualizador de Arquivos" },
];

export const AddComponentModal = ({ open, onClose, onAdd, existingComponents }: AddComponentModalProps) => {
  const [type, setType] = useState<ComponentType>("FORM");
  const [label, setLabel] = useState("");
  const [description, setDescription] = useState("");
  const [required, setRequired] = useState(false);

  const handleAdd = () => {
    if (!label.trim()) return;
    const nextOrder = existingComponents.length > 0 ? Math.max(...existingComponents.map((c) => c.order)) + 1 : 1;
    onAdd({
      order: nextOrder,
      type,
      key: `${type.toLowerCase()}_${Date.now()}`,
      label: label.trim(),
      description: description.trim() || undefined,
      required,
      config: {},
      visibilityRoles: [],
      editableRoles: [],
      lockedAfterCompletion: false,
    });
    setType("FORM");
    setLabel("");
    setDescription("");
    setRequired(false);
  };

  const handleClose = () => {
    setType("FORM");
    setLabel("");
    setDescription("");
    setRequired(false);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm" PaperProps={{ sx: { borderRadius: 3, overflow: "hidden", boxShadow: "0 25px 60px rgba(0,0,0,.22)" } }}>
      <DialogContent sx={{ p: 0 }}>
        <Box sx={{ px: 3, pt: 3, pb: 2, display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 2 }}>
          <Box>
            <Typography sx={{ fontWeight: 900, color: "#0f172a", fontSize: "1.25rem", lineHeight: 1.2 }}>
              Adicionar Componente
            </Typography>
            <Typography variant="body2" sx={{ color: "#64748b", mt: 0.5 }}>
              Selecione o tipo de componente e configure
            </Typography>
          </Box>
          <IconButton onClick={handleClose} sx={{ width: 40, height: 40, color: "#64748b" }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>

        <Box sx={{ px: 3, py: 2 }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <TextField select label="Tipo de Componente" value={type} onChange={(e) => setType(e.target.value as ComponentType)} fullWidth required>
              {COMPONENT_TYPES.map((option) => (
                <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
              ))}
            </TextField>
            <TextField label="Nome do Componente" value={label} onChange={(e) => setLabel(e.target.value)} fullWidth required placeholder="Ex: Assinatura do Responsável" />
            <TextField label="Descrição (opcional)" value={description} onChange={(e) => setDescription(e.target.value)} fullWidth multiline rows={2} placeholder="Descreva o propósito deste componente" />
            <FormControlLabel control={<Switch checked={required} onChange={(e) => setRequired(e.target.checked)} />} label="Campo obrigatório" />
          </Box>
        </Box>

        <Box sx={{ px: 3, py: 2, display: "flex", justifyContent: "flex-end", gap: 1.25, bgcolor: "#f8fafc", borderTop: "1px solid #eef2f7" }}>
          <Button onClick={handleClose} variant="outlined" sx={{ textTransform: "none", borderRadius: 999, borderColor: "#e2e8f0", color: "#0f172a", fontWeight: 800, px: 2.5, "&:hover": { borderColor: "#cbd5e1", backgroundColor: "#ffffff" } }}>
            Cancelar
          </Button>
          <Button onClick={handleAdd} variant="contained" disabled={!label.trim()} sx={{ textTransform: "none", borderRadius: 999, backgroundColor: "#1877F2", fontWeight: 900, px: 3, boxShadow: "none", "&:hover": { backgroundColor: "#166FE5" }, "&:disabled": { backgroundColor: "#e2e8f0", color: "#94a3b8" } }}>
            Adicionar
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
};
