import { useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  Button,
  Box,
  Typography,
  IconButton,
  TextField,
  MenuItem,
  FormControlLabel,
  Switch,
} from "@mui/material";
import { Close as CloseIcon } from "@mui/icons-material";
import type { ComponentType, FlowModelComponent } from "@/hooks/useFlowModels";

type EditComponentModalProps = {
  open: boolean;
  onClose: () => void;
  onSave: (updated: FlowModelComponent) => void;
  component: FlowModelComponent | null;
  existingComponents: FlowModelComponent[];
};

const COMPONENT_TYPES: { value: ComponentType; label: string }[] = [
  { value: "SIGNATURE", label: "Assinatura Eletrônica" },
  { value: "FORM", label: "Formulário" },
  { value: "FILES_MANAGMENT", label: "Gerenciar Arquivos" },
  { value: "COMMENTS", label: "Comentários" },
  { value: "APPROVAL", label: "Aprovação" },
  { value: "TIMELINE", label: "Linha do Tempo" },
  { value: "FILE_VIEWER", label: "Visualizador de Arquivos" },
  { value: "CHECKLIST", label: "Checklist" },
  { value: "STAGE_SUMMARY", label: "Resumo da Etapa" },
];

function safeString(v: unknown) {
  return String(v ?? "").trim();
}

function clampOrderFromExisting(component: FlowModelComponent, existing: FlowModelComponent[]) {
  const currentOrder =
    typeof component.order === "number" && Number.isFinite(component.order) ? component.order : 0;

  if (currentOrder > 0) return currentOrder;

  const nextOrder =
    existing.length > 0 ? Math.max(...existing.map((c) => (Number.isFinite(c.order) ? c.order : 0))) + 1 : 1;

  return nextOrder;
}

export const EditComponentModal = ({
  open,
  onClose,
  onSave,
  component,
  existingComponents,
}: EditComponentModalProps) => {
  const [type, setType] = useState<ComponentType>("FORM");
  const [label, setLabel] = useState("");
  const [description, setDescription] = useState("");
  const [required, setRequired] = useState(false);

  const canSave = useMemo(() => !!safeString(label), [label]);

  useEffect(() => {
    if (!open) return;

    if (!component) {
      setType("FORM");
      setLabel("");
      setDescription("");
      setRequired(false);
      return;
    }

    setType((component.type as ComponentType) || "FORM");
    setLabel(safeString(component.label));
    setDescription(safeString(component.description));
    setRequired(!!component.required);
  }, [open, component]);

  const handleClose = () => {
    onClose();
  };

  const handleSave = () => {
    if (!component) return;
    if (!safeString(label)) return;

    // 🔒 Em edição:
    // - mantém key
    // - mantém order (se vier inválido, corrige com base no existingComponents)
    // - preserva config/roles/lockedAfterCompletion
    const updated: FlowModelComponent = {
      ...component,
      type,
      label: safeString(label),
      description: safeString(description) || undefined,
      required: !!required,
      key: safeString(component.key),
      order: clampOrderFromExisting(component, existingComponents),
      config: component.config ?? {},
      visibilityRoles: Array.isArray(component.visibilityRoles) ? component.visibilityRoles : [],
      editableRoles: Array.isArray(component.editableRoles) ? component.editableRoles : [],
      lockedAfterCompletion: !!component.lockedAfterCompletion,
    };

    onSave(updated);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{
        sx: {
          borderRadius: 3,
          overflow: "hidden",
          boxShadow: "0 25px 60px rgba(0,0,0,.22)",
        },
      }}
    >
      <DialogContent sx={{ p: 0 }}>
        <Box
          sx={{
            px: 3,
            pt: 3,
            pb: 2,
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: 2,
          }}
        >
          <Box sx={{ minWidth: 0 }}>
            <Typography
              sx={{
                fontWeight: 900,
                color: "#0f172a",
                fontSize: "1.25rem",
                lineHeight: 1.2,
              }}
              noWrap
            >
              Editar Componente
            </Typography>
            <Typography variant="body2" sx={{ color: "#64748b", mt: 0.5 }}>
              Atualize os dados do componente
            </Typography>
          </Box>

          <IconButton onClick={handleClose} sx={{ width: 40, height: 40, color: "#64748b" }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>

        <Box sx={{ px: 3, py: 2 }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <TextField
              select
              label="Tipo de Componente"
              value={type}
              onChange={(e) => setType(e.target.value as ComponentType)}
              fullWidth
              required
            >
              {COMPONENT_TYPES.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              label="Nome do Componente"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              fullWidth
              required
              placeholder="Ex: Assinatura do Responsável"
            />

            <TextField
              label="Descrição (opcional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              fullWidth
              multiline
              rows={2}
              placeholder="Descreva o propósito deste componente"
            />

            <FormControlLabel
              control={<Switch checked={required} onChange={(e) => setRequired(e.target.checked)} />}
              label="Campo obrigatório"
            />
          </Box>
        </Box>

        <Box
          sx={{
            px: 3,
            py: 2,
            display: "flex",
            justifyContent: "flex-end",
            gap: 1.25,
            bgcolor: "#f8fafc",
            borderTop: "1px solid #eef2f7",
          }}
        >
          <Button
            onClick={handleClose}
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
            disabled={!canSave || !component}
            sx={{
              textTransform: "none",
              borderRadius: 999,
              backgroundColor: "#1877F2",
              fontWeight: 900,
              px: 3,
              boxShadow: "none",
              "&:hover": { backgroundColor: "#166FE5" },
              "&:disabled": { backgroundColor: "#e2e8f0", color: "#94a3b8" },
            }}
          >
            Salvar
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
};
