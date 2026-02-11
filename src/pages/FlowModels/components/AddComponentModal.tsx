import { useState, useEffect } from "react";
import { Dialog, DialogContent, Button, Box, Typography, IconButton, TextField, MenuItem, FormControlLabel, Switch, Alert, Chip, Select, FormControl, InputLabel } from "@mui/material";
import { Close as CloseIcon, Warning as WarningIcon, Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, DragIndicator as DragIndicatorIcon, Fullscreen as FullscreenIcon, FullscreenExit as FullscreenExitIcon } from "@mui/icons-material";
import type { ComponentType, FlowModelComponent } from "@/hooks/useFlowModels";

type FieldType = "text" | "textarea" | "number" | "date" | "select" | "multiselect";
type FieldWidth = "full" | "half";

type FormField = {
  id: string;
  name: string;
  label: string;
  type: FieldType;
  width: FieldWidth;
  required: boolean;
  options?: { label: string; value: string }[];
};

type AddComponentModalProps = {
  open: boolean;
  onClose: () => void;
  onAdd: (component: FlowModelComponent) => void;
  existingComponents: FlowModelComponent[];
  editingComponent?: FlowModelComponent | null;
};

const COMPONENT_TYPES: { value: ComponentType; label: string }[] = [
  { value: "SIGNATURE", label: "Assinatura Eletrônica" },
  { value: "FORM", label: "Formulário" },
  { value: "FILES_MANAGEMENT", label: "Gerenciar Arquivos" },
  { value: "COMMENTS", label: "Comentários" },
  { value: "APPROVAL", label: "Aprovação" },
  { value: "TIMELINE", label: "Cronograma" },
  { value: "CHECKLIST", label: "Checklist" },
];

export const AddComponentModal = ({ open, onClose, onAdd, existingComponents, editingComponent }: AddComponentModalProps) => {
  const [type, setType] = useState<ComponentType>("FORM");
  const [label, setLabel] = useState("");
  const [description, setDescription] = useState("");
  const [required, setRequired] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  
  const [formFields, setFormFields] = useState<FormField[]>([]);
  const [fieldDialogOpen, setFieldDialogOpen] = useState(false);
  const [editingField, setEditingField] = useState<FormField | null>(null);
  const [draggedField, setDraggedField] = useState<string | null>(null);
  const [fieldFormData, setFieldFormData] = useState({
    name: "",
    label: "",
    type: "text" as FieldType,
    width: "full" as FieldWidth,
    required: false,
    options: [] as { label: string; value: string }[],
  });

  const hasFilesManagement = existingComponents.some(c => c.type === "FILES_MANAGEMENT");
  const isEditMode = !!editingComponent;
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    if (open && editingComponent) {
      setType(editingComponent.type);
      setLabel(editingComponent.label);
      setDescription(editingComponent.description || "");
      setRequired(editingComponent.required || false);
      setFormFields((editingComponent.config?.fields as FormField[]) || []);
    } else if (open && !editingComponent) {
      setType("FORM");
      setLabel("");
      setDescription("");
      setRequired(false);
      setFormFields([]);
    }
    setShowAlert(false);
  }, [open, editingComponent]);

  const handleAdd = () => {
    if (!label.trim()) return;
    
    if (type === "APPROVAL" && !hasFilesManagement && !isEditMode) {
      setShowAlert(true);
      return;
    }
    
    if (!isEditMode && existingComponents.some(c => c.type === type)) {
      setShowAlert(true);
      return;
    }
    
    if (isEditMode && editingComponent) {
      onAdd({
        ...editingComponent,
        label: label.trim(),
        description: description.trim() || undefined,
        required,
        config: type === "FORM" ? { fields: formFields } : editingComponent.config,
      });
    } else {
      const nextOrder = existingComponents.length > 0 ? Math.max(...existingComponents.map((c) => c.order)) + 1 : 1;
      onAdd({
        order: nextOrder,
        type,
        key: `${type.toLowerCase()}_${Date.now()}`,
        label: label.trim(),
        description: description.trim() || undefined,
        required,
        config: type === "FORM" ? { fields: formFields } : {},
        visibilityRoles: [],
        editableRoles: [],
        lockedAfterCompletion: false,
      });
    }
    handleClose();
  };

  const handleClose = () => {
    setType("FORM");
    setLabel("");
    setDescription("");
    setRequired(false);
    setShowAlert(false);
    setFormFields([]);
    setFieldDialogOpen(false);
    setEditingField(null);
    onClose();
  };

  const handleOpenFieldDialog = (field?: FormField) => {
    if (field) {
      setEditingField(field);
      setFieldFormData({
        name: field.name,
        label: field.label,
        type: field.type,
        width: field.width,
        required: field.required,
        options: field.options || [],
      });
    } else {
      setEditingField(null);
      setFieldFormData({ name: "", label: "", type: "text", width: "full", required: false, options: [] });
    }
    setFieldDialogOpen(true);
  };

  const handleSaveField = () => {
    if (!fieldFormData.label.trim()) return;

    const options = (fieldFormData.type === "select" || fieldFormData.type === "multiselect") && fieldFormData.options.length > 0
      ? fieldFormData.options.filter(o => o.label.trim())
      : undefined;

    const newField: FormField = {
      id: editingField?.id || `field_${Date.now()}`,
      name: fieldFormData.name.trim() || `field_${Date.now()}`,
      label: fieldFormData.label.trim(),
      type: fieldFormData.type,
      width: fieldFormData.width,
      required: fieldFormData.required,
      options,
    };

    if (editingField) {
      setFormFields(prev => prev.map(f => f.id === editingField.id ? newField : f));
    } else {
      setFormFields(prev => [...prev, newField]);
    }

    setFieldDialogOpen(false);
    setEditingField(null);
    setFieldFormData({ name: "", label: "", type: "text", width: "full", required: false, options: [] });
  };

  const handleDeleteField = (fieldId: string) => {
    setFormFields(prev => prev.filter(f => f.id !== fieldId));
  };

  const handleDragStart = (e: React.DragEvent, fieldId: string) => {
    setDraggedField(fieldId);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!draggedField || draggedField === targetId) return;

    setFormFields(prev => {
      const draggedIdx = prev.findIndex(f => f.id === draggedField);
      const targetIdx = prev.findIndex(f => f.id === targetId);
      if (draggedIdx === -1 || targetIdx === -1) return prev;

      const newFields = [...prev];
      const [removed] = newFields.splice(draggedIdx, 1);
      newFields.splice(targetIdx, 0, removed);
      return newFields;
    });

    setDraggedField(null);
  };

  const toggleFieldWidth = (fieldId: string) => {
    setFormFields(prev => prev.map(f => 
      f.id === fieldId ? { ...f, width: f.width === "full" ? "half" : "full" } : f
    ));
  };

  return (
    <Dialog open={open} onClose={handleClose} fullScreen={isFullscreen} fullWidth={!isFullscreen} maxWidth={!isFullscreen ? "sm" : undefined} PaperProps={{ sx: { borderRadius: isFullscreen ? 0 : 3, overflow: "hidden", boxShadow: isFullscreen ? "none" : "0 25px 60px rgba(0,0,0,.22)", display: "flex", flexDirection: "column", maxHeight: isFullscreen ? "100vh" : "90vh" } }}>
      <DialogContent sx={{ p: 0, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <Box sx={{ px: 3, pt: 3, pb: 2, display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 2, flexShrink: 0, borderBottom: "1px solid #e2e8f0" }}>
          <Box>
            <Typography sx={{ fontWeight: 900, color: "#0f172a", fontSize: "1.25rem", lineHeight: 1.2 }}>
              {isEditMode ? "Editar Componente" : "Adicionar Componente"}
            </Typography>
            <Typography variant="body2" sx={{ color: "#64748b", mt: 0.5 }}>
              {isEditMode ? "Modifique as configurações do componente" : "Selecione o tipo de componente e configure"}
            </Typography>
          </Box>
          <Box sx={{ display: "flex", gap: 1 }}>
            <IconButton onClick={() => setIsFullscreen(!isFullscreen)} sx={{ width: 40, height: 40, color: "#64748b" }}>
              {isFullscreen ? <FullscreenExitIcon fontSize="small" /> : <FullscreenIcon fontSize="small" />}
            </IconButton>
            <IconButton onClick={handleClose} sx={{ width: 40, height: 40, color: "#64748b" }}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>
        </Box>

        <Box sx={{ px: 3, py: 2, flex: 1, overflow: "auto" }}>
          {showAlert && (
            <Alert severity="warning" icon={<WarningIcon />} onClose={() => setShowAlert(false)} sx={{ mb: 2 }}>
              {type === "APPROVAL" && !hasFilesManagement
                ? "Para adicionar o componente de Aprovação, você precisa primeiro adicionar o componente de Gerenciar Arquivos."
                : "Já existe um componente deste tipo nesta etapa. Não é possível adicionar componentes duplicados."}
            </Alert>
          )}
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <TextField select label="Tipo de Componente" value={type} onChange={(e) => setType(e.target.value as ComponentType)} fullWidth required disabled={isEditMode} helperText={isEditMode ? "O tipo não pode ser alterado após a criação" : undefined}>
              {COMPONENT_TYPES.map((option) => (
                <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
              ))}
            </TextField>
            <TextField label="Nome do Componente" value={label} onChange={(e) => setLabel(e.target.value)} fullWidth required placeholder="Ex: Assinatura do Responsável" />
            <TextField label="Descrição (opcional)" value={description} onChange={(e) => setDescription(e.target.value)} fullWidth multiline rows={2} placeholder="Descreva o propósito deste componente" />
            <FormControlLabel control={<Switch checked={required} onChange={(e) => setRequired(e.target.checked)} />} label="Campo obrigatório" />
            
            {type === "FORM" && (
              <Box sx={{ mt: 2, border: "1px solid #E4E6EB", borderRadius: 2, overflow: "hidden" }}>
                <Box sx={{ px: 2, py: 1.5, bgcolor: "#FAFBFC", borderBottom: "1px solid #E4E6EB" }}>
                  <Typography sx={{ fontWeight: 700, color: "#0f172a", fontSize: "0.9375rem" }}>Campos do Formulário</Typography>
                </Box>
                <Box sx={{ p: 2, maxHeight: 300, overflowY: "auto", bgcolor: "#FAFBFC" }}>
                  {formFields.length === 0 ? (
                    <Box
                      onClick={() => handleOpenFieldDialog()}
                      sx={{
                        p: 2,
                        border: "2px dashed #CBD5E1",
                        borderRadius: 1,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                        bgcolor: "#FAFBFC",
                        "&:hover": { borderColor: "#1877F2", bgcolor: "#F0F9FF" },
                      }}
                    >
                      <AddIcon sx={{ color: "#94a3b8", fontSize: 20, mr: 0.5 }} />
                      <Typography variant="body2" sx={{ color: "#94a3b8", fontWeight: 600 }}>Adicionar novo campo</Typography>
                    </Box>
                  ) : (
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5 }}>
                      {formFields.map((field) => {
                        const renderFieldCard = (f: FormField) => (
                          <Box
                            draggable
                            onDragStart={(e) => handleDragStart(e, f.id)}
                            onDragOver={handleDragOver}
                            onDrop={(e) => handleDrop(e, f.id)}
                            sx={{
                              p: 1.5,
                              bgcolor: "#fff",
                              border: "1px solid #E4E6EB",
                              borderRadius: 1,
                              display: "flex",
                              flexDirection: "column",
                              gap: 1,
                              cursor: "move",
                              opacity: draggedField === f.id ? 0.5 : 1,
                              "&:hover": { borderColor: "#1877F2" },
                            }}
                          >
                            <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1 }}>
                              <DragIndicatorIcon sx={{ color: "#94a3b8", fontSize: 18, mt: 0.25 }} />
                              <Box sx={{ flex: 1, minWidth: 0 }}>
                                <Typography sx={{ fontWeight: 700, fontSize: "0.875rem", color: "#0f172a" }}>{f.label}</Typography>
                                <Typography variant="caption" sx={{ color: "#64748b" }}>{f.type}</Typography>
                              </Box>
                              <Box sx={{ display: "flex", gap: 0.5 }}>
                                <IconButton size="small" onClick={(e) => { e.stopPropagation(); handleOpenFieldDialog(f); }} sx={{ "&:hover": { color: "#1877F2" }, p: 0.25 }}>
                                  <EditIcon sx={{ fontSize: 16 }} />
                                </IconButton>
                                <IconButton size="small" onClick={(e) => { e.stopPropagation(); handleDeleteField(f.id); }} sx={{ "&:hover": { color: "#F02849" }, p: 0.25 }}>
                                  <DeleteIcon sx={{ fontSize: 16 }} />
                                </IconButton>
                              </Box>
                            </Box>
                            <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}>
                              {f.required && <Chip label="Obrigatório" size="small" sx={{ bgcolor: "#FEF3C7", color: "#92400E", fontWeight: 700, fontSize: "0.7rem", height: 20 }} />}
                              <Chip 
                                label={f.width === "full" ? "Longo" : "Curto"} 
                                size="small" 
                                onClick={(e) => { e.stopPropagation(); toggleFieldWidth(f.id); }}
                                sx={{ 
                                  bgcolor: f.width === "full" ? "#E7F3FF" : "#FEF3C7", 
                                  color: f.width === "full" ? "#1877F2" : "#92400E", 
                                  fontWeight: 700, 
                                  fontSize: "0.7rem", 
                                  height: 20,
                                  cursor: "pointer",
                                  "&:hover": { opacity: 0.8 }
                                }} 
                              />
                            </Box>
                          </Box>
                        );

                        return (
                          <Box key={field.id} sx={{ width: field.width === "half" ? "calc(50% - 6px)" : "100%" }}>
                            {renderFieldCard(field)}
                          </Box>
                        );
                      })}
                      <Box
                        onDragOver={(e) => {
                          e.preventDefault();
                          e.dataTransfer.dropEffect = "move";
                        }}
                        onDrop={(e) => {
                          e.preventDefault();
                          if (draggedField) {
                            const draggedIdx = formFields.findIndex(f => f.id === draggedField);
                            if (draggedIdx !== -1) {
                              setFormFields(prev => {
                                const newFields = [...prev];
                                const [removed] = newFields.splice(draggedIdx, 1);
                                newFields.push(removed);
                                return newFields;
                              });
                            }
                            setDraggedField(null);
                          }
                        }}
                        onClick={() => handleOpenFieldDialog()}
                        sx={{
                          p: 2,
                          border: "2px dashed #CBD5E1",
                          borderRadius: 1,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          cursor: "pointer",
                          bgcolor: "#FAFBFC",
                          "&:hover": { borderColor: "#1877F2", bgcolor: "#F0F9FF" },
                        }}
                      >
                        <AddIcon sx={{ color: "#94a3b8", fontSize: 20, mr: 0.5 }} />
                        <Typography variant="body2" sx={{ color: "#94a3b8", fontWeight: 600 }}>Adicionar novo campo</Typography>
                      </Box>
                    </Box>
                  )}
                </Box>
              </Box>
            )}
          </Box>
        </Box>

        <Box sx={{ px: 3, py: 2, display: "flex", justifyContent: "flex-end", gap: 1.25, bgcolor: "#f8fafc", borderTop: "1px solid #eef2f7", flexShrink: 0 }}>
          <Button onClick={handleClose} variant="outlined" sx={{ textTransform: "none", borderRadius: 999, borderColor: "#e2e8f0", color: "#0f172a", fontWeight: 800, px: 2.5, "&:hover": { borderColor: "#cbd5e1", backgroundColor: "#ffffff" } }}>
            Cancelar
          </Button>
          <Button onClick={handleAdd} variant="contained" disabled={!label.trim()} sx={{ textTransform: "none", borderRadius: 999, backgroundColor: "#1877F2", fontWeight: 900, px: 3, boxShadow: "none", "&:hover": { backgroundColor: "#166FE5" }, "&:disabled": { backgroundColor: "#e2e8f0", color: "#94a3b8" } }}>
            {isEditMode ? "Salvar" : "Adicionar"}
          </Button>
        </Box>
      </DialogContent>
      
      <Dialog open={fieldDialogOpen} onClose={() => setFieldDialogOpen(false)} maxWidth="sm" fullWidth>
        <Box sx={{ p: 3 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
            <Typography sx={{ fontWeight: 700, fontSize: "1.125rem" }}>{editingField ? "Editar Campo" : "Novo Campo"}</Typography>
            <IconButton size="small" onClick={() => setFieldDialogOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <TextField label="Campo" value={fieldFormData.label} onChange={(e) => setFieldFormData(prev => ({ ...prev, label: e.target.value }))} fullWidth required placeholder="ex: Nome do Projeto" helperText="Texto que aparece no formulário" inputProps={{ maxLength: 35 }} />
            <FormControl fullWidth>
              <InputLabel>Tipo</InputLabel>
              <Select value={fieldFormData.type} label="Tipo" onChange={(e) => setFieldFormData(prev => ({ ...prev, type: e.target.value as FieldType }))}>
                <MenuItem value="text">Texto</MenuItem>
                <MenuItem value="textarea">Texto Longo</MenuItem>
                <MenuItem value="number">Número</MenuItem>
                <MenuItem value="date">Data</MenuItem>
                <MenuItem value="select">Seleção Única</MenuItem>
                <MenuItem value="multiselect">Seleção Múltipla</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Largura</InputLabel>
              <Select value={fieldFormData.width} label="Largura" onChange={(e) => setFieldFormData(prev => ({ ...prev, width: e.target.value as FieldWidth }))}>
                <MenuItem value="full">Longo</MenuItem>
                <MenuItem value="half">Curto</MenuItem>
              </Select>
            </FormControl>
            {(fieldFormData.type === "select" || fieldFormData.type === "multiselect") && (
              <Box>
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1 }}>
                  <Typography sx={{ fontWeight: 900, color: "#0f172a" }}>Opções</Typography>
                  <Button
                    size="small"
                    startIcon={<AddIcon />}
                    onClick={() => setFieldFormData(prev => ({ ...prev, options: [...prev.options, { label: "", value: "" }] }))}
                    sx={{ textTransform: "none", fontWeight: 900 }}
                  >
                    Adicionar
                  </Button>
                </Box>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                  {fieldFormData.options.map((opt, idx) => (
                    <Box key={idx} sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                      <TextField
                        size="small"
                        placeholder="Campo"
                        value={opt.label}
                        onChange={(e) => {
                          const newOpts = [...fieldFormData.options];
                          newOpts[idx] = { ...newOpts[idx], label: e.target.value, value: e.target.value.toLowerCase().replace(/\s+/g, "_") };
                          setFieldFormData(prev => ({ ...prev, options: newOpts }));
                        }}
                        sx={{ flex: 1 }}
                      />
                      <IconButton
                        size="small"
                        onClick={() => setFieldFormData(prev => ({ ...prev, options: prev.options.filter((_, i) => i !== idx) }))}
                        sx={{ color: "#B91C1C" }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  ))}
                </Box>
              </Box>
            )}
            <FormControlLabel control={<Switch checked={fieldFormData.required} onChange={(e) => setFieldFormData(prev => ({ ...prev, required: e.target.checked }))} />} label="Campo obrigatório" />
          </Box>
          <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1, mt: 3 }}>
            <Button onClick={() => setFieldDialogOpen(false)} sx={{ textTransform: "none" }}>Cancelar</Button>
            <Button onClick={handleSaveField} variant="contained" disabled={!fieldFormData.label.trim()} sx={{ textTransform: "none", bgcolor: "#1877F2", "&:hover": { bgcolor: "#166FE5" } }}>
              {editingField ? "Salvar" : "Adicionar"}
            </Button>
          </Box>
        </Box>
      </Dialog>
    </Dialog>
  );
};
