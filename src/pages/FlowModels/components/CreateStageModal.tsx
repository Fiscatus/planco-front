import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  Button,
  TextField,
  Box,
  Switch,
  FormControlLabel,
  Typography,
  Divider,
  Chip,
  IconButton,
} from "@mui/material";
import { Close as CloseIcon } from "@mui/icons-material";
import type { FlowModelStage } from "@/hooks/useFlowModels";

type CreateStageModalProps = {
  open: boolean;
  existingStages: FlowModelStage[];
  onClose: () => void;
  onCreate: (newStage: FlowModelStage) => void;
};

function slugifyStageId(input: string) {
  const base = input.trim().toLowerCase().normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "").slice(0, 60);
  return base ? `stage_${base}` : "stage_nova_etapa";
}

function nextOrder(stages: FlowModelStage[]) {
  const orders = stages.map((s) => typeof s.order === "number" && Number.isFinite(s.order) ? s.order : 0)
    .filter(Number.isFinite);
  return orders.length ? Math.max(...orders) + 1 : 1;
}

function ensureUniqueStageId(candidate: string, stages: FlowModelStage[]) {
  const used = new Set(stages.map((s) => String(s.stageId || "").trim()).filter(Boolean));
  if (!used.has(candidate)) return candidate;
  let i = 2;
  while (used.has(`${candidate}_${i}`)) i++;
  return `${candidate}_${i}`;
}

export const CreateStageModal = ({
  open,
  existingStages,
  onClose,
  onCreate,
}: CreateStageModalProps) => {
  const [name, setName] = useState("");
  const [stageId, setStageId] = useState("");
  const [description, setDescription] = useState("");

  const [requiresApproval, setRequiresApproval] = useState(false);
  const [canRepeat, setCanRepeat] = useState(false);
  const [repeatCondition, setRepeatCondition] = useState("");
  const [visibilityCondition, setVisibilityCondition] = useState("");

  const [orderText, setOrderText] = useState<string>("");

  const stageIdTouchedRef = useRef(false);

  const defaultOrder = useMemo(() => nextOrder(existingStages), [existingStages]);

  const parsedOrder = useMemo(() => {
    const v = Number(orderText);
    return Number.isFinite(v) ? v : null;
  }, [orderText]);

  useEffect(() => {
    if (open) {
      setName("");
      setDescription("");
      setRequiresApproval(false);
      setCanRepeat(false);
      setRepeatCondition("");
      setVisibilityCondition("");
      setOrderText(String(nextOrder(existingStages)));
      stageIdTouchedRef.current = false;
      setStageId("");
    }
  }, [open, existingStages]);

  useEffect(() => {
    if (open && !stageIdTouchedRef.current) {
      const auto = ensureUniqueStageId(slugifyStageId(name || ""), existingStages);
      if (!stageId || stageId.startsWith("stage_")) setStageId(auto);
    }
  }, [name, open, existingStages, stageId]);

  const orderIsUnique = useMemo(() => 
    parsedOrder !== null && !existingStages.some((s) => s.order === parsedOrder)
  , [existingStages, parsedOrder]);

  const stageIdIsUnique = useMemo(() => {
    const c = stageId.trim();
    return c && !existingStages.some((s) => String(s.stageId || "").trim() === c);
  }, [existingStages, stageId]);

  const validations = useMemo(() => {
    const errors: string[] = [];

    if (!name.trim()) errors.push("Informe o nome da etapa.");
    if (!stageId.trim()) errors.push("Informe o stageId.");
    if (stageId.trim() && !stageIdIsUnique) errors.push("Já existe uma etapa com esse stageId.");
    if (parsedOrder === null) errors.push("Informe uma ordem válida (número).");
    if (parsedOrder !== null && parsedOrder < 0) errors.push("A ordem não pode ser negativa.");
    if (parsedOrder !== null && !orderIsUnique) errors.push("Já existe uma etapa com essa ordem.");

    if (canRepeat && repeatCondition.trim().length > 0 && repeatCondition.trim().length < 3) {
      errors.push("A condição de repetição está muito curta.");
    }

    return errors;
  }, [name, stageId, stageIdIsUnique, parsedOrder, orderIsUnique, canRepeat, repeatCondition]);

  const isValid = validations.length === 0;

  const handleCreate = useCallback(() => {
    const cleanStageId = stageId.trim();
    const cleanName = name.trim();

    const orderFinal = parsedOrder ?? defaultOrder;

    const newStage: FlowModelStage = {
      stageId: cleanStageId,
      order: orderFinal,
      name: cleanName,
      description: description.trim() ? description.trim() : undefined,
      requiresApproval,

      canRepeat: canRepeat ? true : undefined,
      repeatCondition: canRepeat && repeatCondition.trim() ? repeatCondition.trim() : undefined,

      visibilityCondition: visibilityCondition.trim() ? visibilityCondition.trim() : undefined,

      components: [],
    };

    onCreate(newStage);
  }, [
    stageId,
    name,
    parsedOrder,
    defaultOrder,
    description,
    requiresApproval,
    canRepeat,
    repeatCondition,
    visibilityCondition,
    onCreate,
  ]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="md"
      PaperProps={{
        sx: {
          borderRadius: { xs: 2, sm: 3 },
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
          overflow: "hidden",
          margin: { xs: 1, sm: 2 },
          maxWidth: { xs: "calc(100% - 16px)", sm: "600px", md: "900px" },
          width: "100%",
          maxHeight: { xs: "calc(100vh - 32px)", sm: "calc(100vh - 64px)" },
          display: "flex",
          flexDirection: "column",
        },
      }}
    >
      <DialogContent
        sx={{
          p: 0,
          display: "flex",
          flexDirection: "column",
          flex: 1,
          minHeight: 0,
          overflow: "hidden",
          bgcolor: "#ffffff",
        }}
      >
        <Box
          sx={{
            px: { xs: 2, sm: 3, md: 4 },
            py: { xs: 2, sm: 2.5, md: 3 },
            borderBottom: "1px solid #e2e8f0",
            flexShrink: 0,
            backgroundColor: "#ffffff",
          }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              mb: { xs: 1, sm: 1.5 },
              gap: 1,
            }}
          >
            <Box sx={{ minWidth: 0 }}>
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 900,
                  color: "#212121",
                  fontSize: { xs: "1.25rem", sm: "1.375rem", md: "1.5rem" },
                  lineHeight: { xs: 1.3, sm: 1.2 },
                }}
              >
                Criar Etapa
              </Typography>

              <Typography variant="body2" sx={{ color: "#616161", mt: 0.25 }}>
                Campos alinhados ao backend (FlowStage)
              </Typography>
            </Box>

            <IconButton
              onClick={onClose}
              sx={{
                width: { xs: 36, sm: 40 },
                height: { xs: 36, sm: 40 },
                color: "#64748b",
                backgroundColor: "transparent",
                flexShrink: 0,
                "&:hover": {
                  backgroundColor: "#f1f5f9",
                },
              }}
            >
              <CloseIcon sx={{ fontSize: { xs: 18, sm: 20 } }} />
            </IconButton>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
            <Chip
              label="Etapa nova"
              size="small"
              sx={{
                bgcolor: "#E7F3FF",
                color: "#1877F2",
                fontWeight: 900,
              }}
            />
          </Box>
        </Box>

        <Box
          sx={{
            px: { xs: 2, sm: 3, md: 4 },
            py: { xs: 2, sm: 2.5, md: 3 },
            display: "flex",
            flexDirection: "column",
            flex: 1,
            minHeight: 0,
            overflow: "auto",
            bgcolor: "#FAFBFC",
          }}
        >
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
            <Box
              sx={{
                bgcolor: "background.paper",
                border: "1px solid #E4E6EB",
                borderRadius: 2,
                p: 2.5,
              }}
            >
              <Typography sx={{ fontWeight: 900, color: "#212121", mb: 1.5 }}>
                Dados da etapa
              </Typography>

              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr", sm: "1fr 220px" },
                  gap: 2,
                }}
              >
                <TextField
                  label="Nome da etapa"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  fullWidth
                  required
                  inputProps={{ maxLength: 200 }}
                />

                <TextField
                  label="Ordem no fluxo"
                  type="number"
                  value={orderText}
                  onChange={(e) => setOrderText(e.target.value)}
                  inputProps={{ min: 0 }}
                  error={orderText.trim().length > 0 && !orderIsUnique}
                  helperText={
                    orderText.trim().length > 0 && !orderIsUnique
                      ? "Já existe uma etapa com essa ordem."
                      : "Sugestão: manter sequência (1, 2, 3...)."
                  }
                />
              </Box>

              <Box sx={{ mt: 2 }}>
                <TextField
                  label="stageId (único)"
                  value={stageId}
                  onChange={(e) => {
                    stageIdTouchedRef.current = true;
                    setStageId(e.target.value);
                  }}
                  fullWidth
                  required
                  error={!!stageId && !stageIdIsUnique}
                  helperText={
                    !stageId
                      ? "Gerado automaticamente a partir do nome (você pode ajustar)."
                      : !stageIdIsUnique
                        ? "Já existe uma etapa com esse stageId."
                        : "Dica: use padrão stage_xxx (ex: stage_dfd_assinatura)."
                  }
                />
              </Box>

              <Box sx={{ mt: 2 }}>
                <TextField
                  label="Descrição (opcional)"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  fullWidth
                  multiline
                  rows={3}
                  inputProps={{ maxLength: 100 }}
                  helperText={`${description.length}/100 caracteres`}
                />
              </Box>
            </Box>

            <Box
              sx={{
                bgcolor: "background.paper",
                border: "1px solid #E4E6EB",
                borderRadius: 2,
                p: 2.5,
              }}
            >
              <Typography sx={{ fontWeight: 900, color: "#212121", mb: 1.5 }}>
                Regras da etapa
              </Typography>

              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, mb: 2 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={requiresApproval}
                      onChange={(e) => setRequiresApproval(e.target.checked)}
                    />
                  }
                  label="Requer aprovação"
                />

                <FormControlLabel
                  control={
                    <Switch checked={canRepeat} onChange={(e) => setCanRepeat(e.target.checked)} />
                  }
                  label="Pode repetir"
                />
              </Box>

              <Divider sx={{ my: 2 }} />

              {canRepeat ? (
                <TextField
                  label="repeatCondition (opcional)"
                  value={repeatCondition}
                  onChange={(e) => setRepeatCondition(e.target.value)}
                  fullWidth
                  placeholder='Ex: "enquanto status != APROVADO"'
                  sx={{ mb: 2 }}
                />
              ) : null}

              <TextField
                label="visibilityCondition (opcional)"
                value={visibilityCondition}
                onChange={(e) => setVisibilityCondition(e.target.value)}
                fullWidth
                placeholder='Ex: "se tipo_processo == MEDICAMENTO"'
              />

              <Typography
                variant="caption"
                sx={{ color: "text.secondary", display: "block", mt: 1.5 }}
              >
                Obs: componentes começam vazios (components: []). Depois você edita a etapa para adicionar
                componentes (SIGNATURE, FORM, COMMENTS etc.) conforme o backend.
              </Typography>
            </Box>

            {validations.length > 0 ? (
              <Box
                sx={{
                  bgcolor: "#FFF5F5",
                  border: "1px solid #FECACA",
                  borderRadius: 2,
                  p: 2,
                }}
              >
                <Typography sx={{ fontWeight: 900, color: "#991B1B", mb: 1 }}>
                  Corrija antes de criar:
                </Typography>
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                  {validations.map((err) => (
                    <Chip key={err} label={err} color="error" variant="outlined" />
                  ))}
                </Box>
              </Box>
            ) : null}
          </Box>
        </Box>

        <Box
          sx={{
            p: { xs: 2, sm: 3 },
            backgroundColor: "#f8fafc",
            borderTop: "1px solid #e2e8f0",
            display: "flex",
            flexDirection: { xs: "column-reverse", sm: "row" },
            justifyContent: "flex-end",
            alignItems: "stretch",
            gap: { xs: 1.5, sm: 1 },
            flexShrink: 0,
          }}
        >
          <Button
            onClick={onClose}
            variant="outlined"
            sx={{
              textTransform: "none",
              borderRadius: 2,
              borderColor: "#E4E6EB",
              color: "#212121",
              px: { xs: 2.5, sm: 3 },
              py: { xs: 1.125, sm: 1.25 },
              fontSize: { xs: "0.8125rem", sm: "0.875rem" },
              fontWeight: 800,
              width: { xs: "100%", sm: "auto" },
              "&:hover": {
                borderColor: "#CBD5E1",
                backgroundColor: "#F8F9FA",
              },
            }}
          >
            Cancelar
          </Button>

          <Button
            onClick={handleCreate}
            disabled={!isValid}
            variant="contained"
            sx={{
              bgcolor: "#1877F2",
              "&:hover": { bgcolor: "#166FE5" },
              textTransform: "none",
              fontWeight: 900,
              borderRadius: 2,
              boxShadow: "none",
              px: { xs: 2.5, sm: 4 },
              py: { xs: 1.125, sm: 1.25 },
              width: { xs: "100%", sm: "auto" },
              "&:disabled": {
                backgroundColor: "#E4E6EB",
                color: "#8A8D91",
              },
            }}
          >
            Criar etapa
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
};
