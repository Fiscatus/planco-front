import { useState, useEffect } from "react";
import { Box, Typography, TextField, MenuItem, Collapse, Tooltip, Checkbox, Button, Chip, CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions, IconButton } from "@mui/material";
import { Description as DescriptionIcon, Info as InfoIcon, Save as SaveIcon, ExpandMore as ExpandMoreIcon, ExpandLess as ExpandLessIcon, Fullscreen as FullscreenIcon } from "@mui/icons-material";
import { useForm, useSubmitForm } from "@/hooks";
import { useNotification } from "@/components/NotificationProvider";

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

type ProcessFormComponentProps = {
  label?: string;
  description?: string;
  required?: boolean;
  context: { processId: string; stageId: string; componentKey: string };
  enabled?: boolean;
  readOnly?: boolean;
  previewFields?: FormField[];
};

export const ProcessFormComponent = ({ label, description, required, context, enabled = true, readOnly = false, previewFields }: ProcessFormComponentProps) => {
  const { data: formData, isLoading } = useForm(context, enabled && !previewFields);
  const submitMutation = useSubmitForm();
  const { showNotification } = useNotification();
  const [values, setValues] = useState<Record<string, unknown>>({});
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);

  useEffect(() => {
    if (formData) {
      const initialValues: Record<string, unknown> = {};
      const configFields = formData.config?.fields || [];
      const responseFields = formData.response?.fields || [];
      configFields.forEach((field: any) => {
        const savedField = responseFields.find((rf: any) => rf.fieldId === field.id);
        initialValues[field.name] = savedField?.value || (field.type === 'multiselect' ? [] : '');
      });
      setValues(initialValues);
    }
  }, [formData]);

  if (isLoading) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress /></Box>;

  const fields: FormField[] = previewFields ?? formData?.config?.fields ?? [];

  const handleSave = () => {
    const fieldsPayload = fields.map(field => ({
      fieldId: field.id,
      value: values[field.name] || (field.type === 'multiselect' ? [] : '')
    }));
    submitMutation.mutate({ context, data: { fields: fieldsPayload } }, {
      onSuccess: () => { setShowConfirmDialog(false); showNotification("Formulário salvo com sucesso", "success"); },
      onError: (error: any) => { showNotification(error?.response?.data?.message || "Erro ao salvar formulário", "error"); }
    });
  };

  const baseSx = { "& .MuiOutlinedInput-root": { bgcolor: "#F8FAFC", "& fieldset": { borderColor: "#E4E6EB" }, borderRadius: 2 } };

  const renderField = (f: FormField) => {
    const fieldLabel = f.required ? `${f.label} *` : f.label;
    if (f.type === "textarea") return (
      <Box sx={{ width: "100%" }}>
        <Typography sx={{ fontWeight: 900, color: "#0f172a", mb: 0.5 }}>{fieldLabel}</Typography>
        <TextField fullWidth value={values[f.name] || ""} onChange={(e) => setValues(prev => ({ ...prev, [f.name]: e.target.value }))} multiline rows={4} disabled={readOnly} placeholder="Campo de texto longo..." sx={baseSx} />
      </Box>
    );
    if (f.type === "select") return (
      <Box sx={{ width: "100%" }}>
        <Typography sx={{ fontWeight: 900, color: "#0f172a", mb: 0.5 }}>{fieldLabel}</Typography>
        <TextField fullWidth select value={values[f.name] || ""} onChange={(e) => setValues(prev => ({ ...prev, [f.name]: e.target.value }))} disabled={readOnly} sx={baseSx}>
          {(f.options || []).map((opt) => <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>)}
        </TextField>
      </Box>
    );
    if (f.type === "date") return (
      <Box sx={{ width: "100%" }}>
        <Typography sx={{ fontWeight: 900, color: "#0f172a", mb: 0.5 }}>{fieldLabel}</Typography>
        <TextField fullWidth type="date" value={values[f.name] || ""} onChange={(e) => setValues(prev => ({ ...prev, [f.name]: e.target.value }))} disabled={readOnly} InputLabelProps={{ shrink: true }}
          sx={{ ...baseSx, "& .MuiOutlinedInput-root": { ...baseSx["& .MuiOutlinedInput-root"], "& input[type='date']::-webkit-calendar-picker-indicator": { cursor: "pointer", filter: "invert(47%) sepia(89%) saturate(2476%) hue-rotate(197deg) brightness(98%) contrast(97%)", width: 20, height: 20 }, "& input[type='date']": { fontWeight: 700, color: "#0f172a" } } }} />
      </Box>
    );
    if (f.type === "multiselect") {
      const selected = Array.isArray(values[f.name]) ? values[f.name] as string[] : [];
      return (
        <Box sx={{ width: "100%" }}>
          <Typography sx={{ fontWeight: 900, color: "#0f172a", mb: 0.5 }}>{fieldLabel}</Typography>
          <Box sx={{ border: "1px solid #E4E6EB", borderRadius: 2, p: 2, bgcolor: "#fff" }}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              {(f.options || []).map((opt) => {
                const checked = selected.includes(opt.value);
                return (
                  <Box key={opt.value} onClick={() => { if (readOnly) return; const next = checked ? selected.filter(v => v !== opt.value) : [...selected, opt.value]; setValues(prev => ({ ...prev, [f.name]: next })); }}
                    sx={{ border: "1px solid #E4E6EB", borderRadius: 2, px: 1.5, py: 1.25, display: "flex", alignItems: "center", justifyContent: "space-between", cursor: readOnly ? "default" : "pointer", bgcolor: checked ? "#E7F3FF" : "#fff", "&:hover": { borderColor: readOnly ? "#E4E6EB" : "#1877F2", bgcolor: checked ? "#E7F3FF" : readOnly ? "#fff" : "#F5FAFF" } }}>
                    <Typography sx={{ fontWeight: 800, color: "#334155" }}>{opt.label}</Typography>
                    <Checkbox checked={checked} disabled={readOnly} />
                  </Box>
                );
              })}
            </Box>
          </Box>
        </Box>
      );
    }
    return (
      <Box sx={{ width: "100%" }}>
        <Typography sx={{ fontWeight: 900, color: "#0f172a", mb: 0.5 }}>{fieldLabel}</Typography>
        <TextField fullWidth type={f.type} value={values[f.name] || ""} onChange={(e) => setValues(prev => ({ ...prev, [f.name]: e.target.value }))} disabled={readOnly} placeholder="Campo de texto..." sx={baseSx} />
      </Box>
    );
  };

  const headerContent = (onClose?: () => void) => (
    <Box sx={{ px: 3, py: 2, bgcolor: "#FAFBFC", borderBottom: "1px solid #E4E6EB", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <DescriptionIcon sx={{ fontSize: 20, color: "#1877F2" }} />
        <Typography sx={{ fontWeight: 700, color: "#0f172a", fontSize: onClose ? "1.125rem" : "1rem" }}>{label || "Formulário"}</Typography>
        {required && !onClose && <Chip label="Obrigatório" size="small" sx={{ bgcolor: "#FEF3C7", color: "#92400E", fontWeight: 700, fontSize: "0.65rem", height: 18 }} />}
        {description && <Tooltip title={description} arrow><InfoIcon sx={{ fontSize: 18, color: "#1877F2", cursor: "help" }} /></Tooltip>}
      </Box>
      <Box sx={{ display: "flex", gap: 0.5 }}>
        {onClose ? (
          <Button onClick={onClose} variant="outlined" sx={{ textTransform: "none", fontWeight: 700, borderRadius: 2 }}>Fechar</Button>
        ) : (
          <>
            <Tooltip title="Tela cheia"><IconButton size="small" onClick={() => setFullscreen(true)} sx={{ color: "#64748b" }}><FullscreenIcon fontSize="small" /></IconButton></Tooltip>
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

  const formBody = (
    <Box sx={{ px: 3, py: 3 }}>
      {fields.length === 0 ? (
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", py: 8 }}>
          <Typography variant="h6" sx={{ color: "#94a3b8", mb: 1 }}>Nenhum campo configurado</Typography>
          <Typography variant="body2" sx={{ color: "#CBD5E1" }}>Configure os campos do formulário nas opções do componente</Typography>
        </Box>
      ) : (
        <>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, mb: 3 }}>
            {fields.map((f) => <Box key={f.id} sx={{ width: f.width === "half" ? "calc(50% - 8px)" : "100%" }}>{renderField(f)}</Box>)}
          </Box>
          <Box sx={{ display: "flex", justifyContent: "flex-end", pt: 2, borderTop: "1px solid #E4E6EB" }}>
            {!readOnly && (
              <Button variant="contained" startIcon={<SaveIcon />} onClick={() => setShowConfirmDialog(true)}
                sx={{ bgcolor: "#1877F2", textTransform: "none", fontWeight: 700, borderRadius: 2, px: 3, py: 1 }}>
                Salvar Formulário
              </Button>
            )}
          </Box>
        </>
      )}
    </Box>
  );

  return (
    <>
      <Box sx={{ bgcolor: "#fff", borderRadius: 2, border: "1px solid #E4E6EB", overflow: "hidden" }}>
        {headerContent()}
        <Collapse in={!collapsed}>{formBody}</Collapse>
      </Box>
      <Dialog open={fullscreen} onClose={() => setFullscreen(false)} fullScreen>
        <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
          {headerContent(() => setFullscreen(false))}
          <Box sx={{ flex: 1, overflow: "auto", bgcolor: "#fff" }}>{formBody}</Box>
        </Box>
      </Dialog>
      <Dialog open={showConfirmDialog} onClose={() => setShowConfirmDialog(false)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 700, fontSize: "1.25rem", color: "#0f172a" }}>Confirmar Salvamento</DialogTitle>
        <DialogContent><Typography variant="body2" sx={{ color: "#64748b" }}>Deseja salvar as alterações do formulário?</Typography></DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => setShowConfirmDialog(false)} variant="outlined" sx={{ textTransform: "none", borderRadius: 2, fontWeight: 700 }}>Cancelar</Button>
          <Button variant="contained" onClick={handleSave} disabled={submitMutation.isPending}
            startIcon={submitMutation.isPending ? <CircularProgress size={16} /> : <SaveIcon />}
            sx={{ bgcolor: "#1877F2", textTransform: "none", fontWeight: 700, borderRadius: 2 }}>
            {submitMutation.isPending ? "Salvando..." : "Confirmar"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
