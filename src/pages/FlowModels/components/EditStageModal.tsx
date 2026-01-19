import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogContent,
  Divider,
  FormControlLabel,
  IconButton,
  MenuItem,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import {
  Add as AddIcon,
  Close as CloseIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import type {
  ComponentType,
  FlowModelComponent,
  FlowModelStage,
} from "@/hooks/useFlowModels";

type EditStageModalProps = {
  open: boolean;
  onClose: () => void;
  stage: FlowModelStage | null;

  // retorna a etapa editada para o pai atualizar o draftStages
  onSaveStage: (updatedStage: FlowModelStage) => void;

  // se estiver false, deixa tudo readonly (ex: modelo do sistema, ou view mode)
  editable?: boolean;
};

const COMPONENT_TYPES: ComponentType[] = [
  "SIGNATURE",
  "COMMENTS",
  "FORM",
  "APPROVAL",
  "FILES_MANAGMENT",
  "STAGE_PANEL",
  "TIMELINE",
  "FILE_VIEWER",
];

function deepClone<T>(v: T): T {
  return JSON.parse(JSON.stringify(v)) as T;
}

function parseCsvIds(input: string): string[] {
  // aceita: "id1, id2 ,id3"
  const parts = String(input || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  // remove duplicados preservando ordem
  const seen = new Set<string>();
  const out: string[] = [];
  for (const p of parts) {
    const key = String(p);
    if (!seen.has(key)) {
      seen.add(key);
      out.push(key);
    }
  }
  return out;
}

function joinCsvIds(ids?: string[]): string {
  if (!ids || !Array.isArray(ids) || ids.length === 0) return "";
  return ids.join(", ");
}

function nextAvailableNumber(used: number[], start = 0): number {
  const set = new Set(used);
  let n = start;
  while (set.has(n)) n += 1;
  return n;
}

export const EditStageModal = ({
  open,
  onClose,
  stage,
  onSaveStage,
  editable = true,
}: EditStageModalProps) => {
  const [localStage, setLocalStage] = useState<FlowModelStage | null>(null);

  // CSV (sem endpoints) — fiel ao DTO do backend: string[]
  const [approverRolesCsv, setApproverRolesCsv] = useState("");
  const [approverDepartmentsCsv, setApproverDepartmentsCsv] = useState("");

  // ✅ Editor de JSON robusto (não “apaga” enquanto digita inválido)
  const [configTextByKey, setConfigTextByKey] = useState<Record<string, string>>(
    {},
  );

  const isReadOnly = !editable;

  useEffect(() => {
    if (!open) return;

    if (!stage) {
      setLocalStage(null);
      setApproverRolesCsv("");
      setApproverDepartmentsCsv("");
      setConfigTextByKey({});
      return;
    }

    const clone = deepClone(stage);
    clone.components = Array.isArray(clone.components) ? clone.components : [];

    // normaliza arrays opcionais
    clone.approverRoles = Array.isArray(clone.approverRoles)
      ? clone.approverRoles
      : [];
    clone.approverDepartments = Array.isArray(clone.approverDepartments)
      ? clone.approverDepartments
      : [];

    clone.components = (clone.components || []).map((c) => ({
      ...c,
      visibilityRoles: Array.isArray(c.visibilityRoles) ? c.visibilityRoles : [],
      editableRoles: Array.isArray(c.editableRoles) ? c.editableRoles : [],
      config: c.config ?? {},
      lockedAfterCompletion: !!c.lockedAfterCompletion,
      required: !!c.required,
    }));

    // ordena por order para render estável
    clone.components.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

    setLocalStage(clone);

    setApproverRolesCsv(joinCsvIds(clone.approverRoles));
    setApproverDepartmentsCsv(joinCsvIds(clone.approverDepartments));

    const nextConfigText: Record<string, string> = {};
    for (const c of clone.components) {
      nextConfigText[c.key] = JSON.stringify(c.config ?? {}, null, 2);
    }
    setConfigTextByKey(nextConfigText);
  }, [open, stage]);

  const componentErrors = useMemo(() => {
    if (!localStage) return [];

    const errs: string[] = [];

    const keys = (localStage.components || []).map((c) => c.key);
    if (keys.length !== new Set(keys).size) {
      errs.push("Existem componentes com KEY repetida nesta etapa.");
    }

    const orders = (localStage.components || []).map((c) => c.order);
    if (orders.length !== new Set(orders).size) {
      errs.push("Existem componentes com ORDER repetida nesta etapa.");
    }

    return errs;
  }, [localStage]);

  const handleChangeStageField = <K extends keyof FlowModelStage>(
    key: K,
    value: FlowModelStage[K],
  ) => {
    if (!localStage) return;

    // ✅ se desmarcar aprovação, limpa aprovadores
    if (key === "requiresApproval") {
      const nextRequires = Boolean(value as any);
      if (!nextRequires) {
        setApproverRolesCsv("");
        setApproverDepartmentsCsv("");
        setLocalStage({
          ...localStage,
          requiresApproval: false as any,
          approverRoles: [],
          approverDepartments: [],
        });
        return;
      }
    }

    // ✅ se desmarcar repetição, limpa condição de repetição
    if (key === "canRepeat") {
      const nextRepeat = Boolean(value as any);
      if (!nextRepeat) {
        setLocalStage({
          ...localStage,
          canRepeat: false as any,
          repeatCondition: "",
        });
        return;
      }
    }

    setLocalStage({ ...localStage, [key]: value });
  };

  const handleAddComponent = () => {
    if (!localStage) return;

    const usedOrders = (localStage.components || []).map((c) => c.order);
    const nextOrder = nextAvailableNumber(usedOrders, 0);

    const usedKeys = new Set((localStage.components || []).map((c) => c.key));
    let idx = 1;
    let nextKey = `component_${idx}`;
    while (usedKeys.has(nextKey)) {
      idx += 1;
      nextKey = `component_${idx}`;
    }

    const newComponent: FlowModelComponent = {
      order: nextOrder,
      type: "FORM",
      key: nextKey,
      label: "Novo componente",
      description: "",
      required: false,
      config: {},
      visibilityRoles: [],
      editableRoles: [],
      lockedAfterCompletion: false,
    };

    const nextComponents = [...(localStage.components || []), newComponent].sort(
      (a, b) => (a.order ?? 0) - (b.order ?? 0),
    );

    setLocalStage({
      ...localStage,
      components: nextComponents,
    });

    setConfigTextByKey((prev) => ({
      ...prev,
      [nextKey]: JSON.stringify(newComponent.config ?? {}, null, 2),
    }));
  };

  const handleRemoveComponent = (index: number) => {
    if (!localStage) return;

    const comp = localStage.components?.[index];
    const next = (localStage.components || []).slice();
    next.splice(index, 1);

    setLocalStage({ ...localStage, components: next });

    if (comp?.key) {
      setConfigTextByKey((prev) => {
        const copy = { ...prev };
        delete copy[comp.key];
        return copy;
      });
    }
  };

  const handleChangeComponent = <K extends keyof FlowModelComponent>(
    index: number,
    key: K,
    value: FlowModelComponent[K],
  ) => {
    if (!localStage) return;

    const next = (localStage.components || []).slice();
    const prevComp = next[index];

    if (!prevComp) return;

    // ✅ se trocar a key, migra o configText
    if (key === "key") {
      const newKey = String(value ?? "").trim();
      const oldKey = String(prevComp.key ?? "").trim();

      next[index] = { ...prevComp, key: newKey } as any;
      // mantém ordenado visualmente
      next.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
      setLocalStage({ ...localStage, components: next });

      if (oldKey && newKey && oldKey !== newKey) {
        setConfigTextByKey((prev) => {
          const copy = { ...prev };
          if (copy[oldKey] !== undefined && copy[newKey] === undefined) {
            copy[newKey] = copy[oldKey];
          }
          delete copy[oldKey];
          return copy;
        });
      }
      return;
    }

    // normal update
    next[index] = { ...prevComp, [key]: value };

    // ✅ mantém ordenado quando mexe em order
    if (key === "order") {
      next.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    }

    setLocalStage({ ...localStage, components: next });
  };

  const handleSave = () => {
    if (!localStage) return;

    const updated: FlowModelStage = {
      ...localStage,
      approverRoles: localStage.requiresApproval ? parseCsvIds(approverRolesCsv) : [],
      approverDepartments: localStage.requiresApproval
        ? parseCsvIds(approverDepartmentsCsv)
        : [],
      components: (localStage.components || [])
        .slice()
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
        .map((c) => ({
          ...c,
          visibilityRoles: Array.isArray(c.visibilityRoles) ? c.visibilityRoles : [],
          editableRoles: Array.isArray(c.editableRoles) ? c.editableRoles : [],
          config: c.config ?? {},
          required: !!c.required,
          lockedAfterCompletion: !!c.lockedAfterCompletion,
        })),
      canRepeat: !!localStage.canRepeat,
      requiresApproval: !!localStage.requiresApproval,
    };

    // validações mínimas alinhadas ao backend (evita 400)
    if (!updated.stageId?.trim()) return;
    if (!updated.name?.trim()) return;

    const keys = updated.components.map((c) => String(c.key || "").trim());
    if (keys.some((k) => !k)) return;
    if (keys.length !== new Set(keys).size) return;

    const orders = updated.components.map((c) => c.order);
    if (orders.some((o) => typeof o !== "number" || !Number.isFinite(o))) return;
    if (orders.length !== new Set(orders).size) return;

    onSaveStage(updated);
    onClose();
  };

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
        {/* Header (padrão do sistema) */}
        <Box
          sx={{
            px: { xs: 2, sm: 3, md: 4 },
            py: { xs: 2, sm: 2.5, md: 3 },
            borderBottom: "1px solid #e2e8f0",
            flexShrink: 0,
            backgroundColor: "#ffffff",
          }}
        >
          {/* Faixa 1: Título + fechar */}
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
                  fontWeight: 800,
                  color: "#212121",
                  fontSize: { xs: "1.25rem", sm: "1.375rem", md: "1.5rem" },
                  lineHeight: { xs: 1.3, sm: 1.2 },
                }}
              >
                Editar Etapa
              </Typography>
              <Typography variant="body2" sx={{ color: "#616161", mt: 0.25 }}>
                Campos alinhados ao backend (FlowStage + FlowComponent)
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

          {/* Faixa 2: chips status */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
            {isReadOnly ? (
              <Chip
                label="Somente leitura"
                size="small"
                sx={{
                  bgcolor: "#F0F2F5",
                  color: "#212121",
                  fontWeight: 800,
                }}
              />
            ) : (
              <Chip
                label="Editável"
                size="small"
                sx={{
                  bgcolor: "#E7F3FF",
                  color: "#1877F2",
                  fontWeight: 800,
                }}
              />
            )}
          </Box>
        </Box>

        {/* Body (scrollável) */}
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
          {!localStage ? (
            <Typography variant="body2" sx={{ color: "#616161" }}>
              Nenhuma etapa selecionada.
            </Typography>
          ) : (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
              {/* Dados da etapa */}
              <Box
                sx={{
                  bgcolor: "background.paper",
                  border: "1px solid #E4E6EB",
                  borderRadius: 2,
                  p: 2.5,
                }}
              >
                <Typography sx={{ fontWeight: 800, color: "#212121", mb: 1.5 }}>
                  Dados da etapa
                </Typography>

                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                    gap: 2,
                  }}
                >
                  <TextField
                    label="stageId (único)"
                    value={localStage.stageId || ""}
                    onChange={(e) =>
                      handleChangeStageField("stageId", e.target.value as any)
                    }
                    fullWidth
                    disabled={isReadOnly}
                    helperText="Obrigatório. Deve ser único no modelo."
                    error={!String(localStage.stageId || "").trim()}
                  />

                  <TextField
                    label="order"
                    type="number"
                    value={Number.isFinite(localStage.order) ? localStage.order : 0}
                    onChange={(e) =>
                      handleChangeStageField("order", Number(e.target.value) as any)
                    }
                    fullWidth
                    disabled={isReadOnly}
                    helperText="Obrigatório. Deve ser único no modelo."
                  />

                  <TextField
                    label="name"
                    value={localStage.name || ""}
                    onChange={(e) =>
                      handleChangeStageField("name", e.target.value as any)
                    }
                    fullWidth
                    disabled={isReadOnly}
                    error={!String(localStage.name || "").trim()}
                  />

                  <TextField
                    label="description"
                    value={localStage.description || ""}
                    onChange={(e) =>
                      handleChangeStageField("description", e.target.value as any)
                    }
                    fullWidth
                    disabled={isReadOnly}
                  />
                </Box>

                <Box sx={{ mt: 2 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={!!localStage.requiresApproval}
                        onChange={(e) =>
                          handleChangeStageField(
                            "requiresApproval",
                            e.target.checked as any,
                          )
                        }
                        disabled={isReadOnly}
                      />
                    }
                    label="requiresApproval"
                  />

                  {localStage.requiresApproval ? (
                    <Box
                      sx={{
                        display: "grid",
                        gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                        gap: 2,
                        mt: 1.5,
                      }}
                    >
                      <TextField
                        label="approverRoles (IDs separados por vírgula)"
                        value={approverRolesCsv}
                        onChange={(e) => setApproverRolesCsv(e.target.value)}
                        fullWidth
                        disabled={isReadOnly}
                        helperText="Ex: 64f..., 64a..., 12b..."
                      />
                      <TextField
                        label="approverDepartments (IDs separados por vírgula)"
                        value={approverDepartmentsCsv}
                        onChange={(e) => setApproverDepartmentsCsv(e.target.value)}
                        fullWidth
                        disabled={isReadOnly}
                      />
                    </Box>
                  ) : null}
                </Box>

                <Divider sx={{ my: 2 }} />

                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                    gap: 2,
                  }}
                >
                  <FormControlLabel
                    control={
                      <Switch
                        checked={!!localStage.canRepeat}
                        onChange={(e) =>
                          handleChangeStageField("canRepeat", e.target.checked as any)
                        }
                        disabled={isReadOnly}
                      />
                    }
                    label="canRepeat"
                  />

                  <Box />

                  {localStage.canRepeat ? (
                    <TextField
                      label="repeatCondition"
                      value={localStage.repeatCondition || ""}
                      onChange={(e) =>
                        handleChangeStageField("repeatCondition", e.target.value as any)
                      }
                      fullWidth
                      disabled={isReadOnly}
                    />
                  ) : null}

                  <TextField
                    label="visibilityCondition"
                    value={localStage.visibilityCondition || ""}
                    onChange={(e) =>
                      handleChangeStageField(
                        "visibilityCondition",
                        e.target.value as any,
                      )
                    }
                    fullWidth
                    disabled={isReadOnly}
                  />
                </Box>
              </Box>

              {/* Componentes */}
              <Box
                sx={{
                  bgcolor: "background.paper",
                  border: "1px solid #E4E6EB",
                  borderRadius: 2,
                  p: 2.5,
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    mb: 1.5,
                    gap: 2,
                  }}
                >
                  <Box>
                    <Typography sx={{ fontWeight: 800, color: "#212121" }}>
                      Componentes
                    </Typography>
                    <Typography variant="body2" sx={{ color: "#616161", mt: 0.25 }}>
                      Cada componente precisa ter <b>key</b> e <b>order</b> únicos dentro
                      da etapa.
                    </Typography>
                  </Box>

                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={handleAddComponent}
                    disabled={isReadOnly}
                    sx={{
                      bgcolor: "#1877F2",
                      "&:hover": { bgcolor: "#166FE5" },
                      textTransform: "none",
                      fontWeight: 700,
                      borderRadius: 2,
                      boxShadow: "none",
                    }}
                  >
                    Adicionar
                  </Button>
                </Box>

                {componentErrors.length > 0 ? (
                  <Box sx={{ mb: 2 }}>
                    {componentErrors.map((e) => (
                      <Chip
                        key={e}
                        label={e}
                        color="warning"
                        variant="outlined"
                        sx={{ mr: 1, mb: 1 }}
                      />
                    ))}
                  </Box>
                ) : null}

                {localStage.components.length === 0 ? (
                  <Typography variant="body2" sx={{ color: "#616161" }}>
                    Nenhum componente nesta etapa.
                  </Typography>
                ) : (
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    {/* ✅ NÃO ordenar + findIndex (evita remover item errado); o array já está mantido ordenado */}
                    {localStage.components.map((comp, compIndex) => {
                      const configText =
                        configTextByKey[comp.key] ??
                        JSON.stringify(comp.config ?? {}, null, 2);

                      return (
                        <Box
                          key={`${comp.key}-${compIndex}`}
                          sx={{
                            border: "1px solid #E4E6EB",
                            borderRadius: 2,
                            p: 2,
                            bgcolor: "#fff",
                          }}
                        >
                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "flex-start",
                              gap: 2,
                              mb: 1.5,
                            }}
                          >
                            <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                              <Chip
                                label={`order: ${comp.order}`}
                                size="small"
                                sx={{
                                  bgcolor: "#E7F3FF",
                                  color: "#1877F2",
                                  fontWeight: 700,
                                }}
                              />
                              <Chip
                                label={comp.type}
                                size="small"
                                sx={{
                                  bgcolor: "#F0F2F5",
                                  color: "#212121",
                                  fontWeight: 700,
                                }}
                              />
                              <Chip
                                label={`key: ${comp.key}`}
                                size="small"
                                sx={{
                                  bgcolor: "#F0F2F5",
                                  color: "#616161",
                                  fontWeight: 700,
                                }}
                              />
                            </Box>

                            <IconButton
                              onClick={() => handleRemoveComponent(compIndex)}
                              size="small"
                              disabled={isReadOnly}
                              sx={{ color: "#F02849" }}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Box>

                          <Box
                            sx={{
                              display: "grid",
                              gridTemplateColumns: { xs: "1fr", sm: "120px 1fr" },
                              gap: 2,
                              mb: 2,
                            }}
                          >
                            <TextField
                              label="order"
                              type="number"
                              value={Number.isFinite(comp.order) ? comp.order : 0}
                              onChange={(e) =>
                                handleChangeComponent(
                                  compIndex,
                                  "order",
                                  Number(e.target.value) as any,
                                )
                              }
                              disabled={isReadOnly}
                            />

                            <TextField
                              select
                              label="type"
                              value={comp.type}
                              onChange={(e) =>
                                handleChangeComponent(
                                  compIndex,
                                  "type",
                                  e.target.value as any,
                                )
                              }
                              disabled={isReadOnly}
                            >
                              {COMPONENT_TYPES.map((t) => (
                                <MenuItem key={t} value={t}>
                                  {t}
                                </MenuItem>
                              ))}
                            </TextField>

                            <TextField
                              label="key"
                              value={comp.key}
                              onChange={(e) =>
                                handleChangeComponent(
                                  compIndex,
                                  "key",
                                  e.target.value as any,
                                )
                              }
                              fullWidth
                              disabled={isReadOnly}
                              error={!String(comp.key || "").trim()}
                            />

                            <TextField
                              label="label"
                              value={comp.label}
                              onChange={(e) =>
                                handleChangeComponent(
                                  compIndex,
                                  "label",
                                  e.target.value as any,
                                )
                              }
                              fullWidth
                              disabled={isReadOnly}
                              error={!String(comp.label || "").trim()}
                            />

                            <TextField
                              label="description"
                              value={comp.description || ""}
                              onChange={(e) =>
                                handleChangeComponent(
                                  compIndex,
                                  "description",
                                  e.target.value as any,
                                )
                              }
                              fullWidth
                              disabled={isReadOnly}
                            />
                          </Box>

                          <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                            <FormControlLabel
                              control={
                                <Switch
                                  checked={!!comp.required}
                                  onChange={(e) =>
                                    handleChangeComponent(
                                      compIndex,
                                      "required",
                                      e.target.checked as any,
                                    )
                                  }
                                  disabled={isReadOnly}
                                />
                              }
                              label="required"
                            />

                            <FormControlLabel
                              control={
                                <Switch
                                  checked={!!comp.lockedAfterCompletion}
                                  onChange={(e) =>
                                    handleChangeComponent(
                                      compIndex,
                                      "lockedAfterCompletion",
                                      e.target.checked as any,
                                    )
                                  }
                                  disabled={isReadOnly}
                                />
                              }
                              label="lockedAfterCompletion"
                            />
                          </Box>

                          <Box
                            sx={{
                              display: "grid",
                              gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                              gap: 2,
                              mt: 2,
                            }}
                          >
                            <TextField
                              label="visibilityRoles (IDs por vírgula)"
                              value={joinCsvIds(comp.visibilityRoles)}
                              onChange={(e) =>
                                handleChangeComponent(
                                  compIndex,
                                  "visibilityRoles",
                                  parseCsvIds(e.target.value) as any,
                                )
                              }
                              fullWidth
                              disabled={isReadOnly}
                            />

                            <TextField
                              label="editableRoles (IDs por vírgula)"
                              value={joinCsvIds(comp.editableRoles)}
                              onChange={(e) =>
                                handleChangeComponent(
                                  compIndex,
                                  "editableRoles",
                                  parseCsvIds(e.target.value) as any,
                                )
                              }
                              fullWidth
                              disabled={isReadOnly}
                            />

                            <TextField
                              label="config (JSON)"
                              value={configText}
                              onChange={(e) => {
                                const text = e.target.value;
                                setConfigTextByKey((prev) => ({
                                  ...prev,
                                  [comp.key]: text,
                                }));

                                try {
                                  const parsed = text?.trim() ? JSON.parse(text) : {};
                                  handleChangeComponent(
                                    compIndex,
                                    "config",
                                    parsed as any,
                                  );
                                } catch {
                                  // mantém o texto local, aplica no objeto quando ficar válido
                                }
                              }}
                              fullWidth
                              disabled={isReadOnly}
                              multiline
                              minRows={4}
                              helperText="Dica: pode ficar inválido enquanto digita; quando ficar válido, o sistema aplica."
                            />
                          </Box>
                        </Box>
                      );
                    })}
                  </Box>
                )}
              </Box>
            </Box>
          )}
        </Box>

        {/* Footer (fixo) */}
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
              fontWeight: 700,
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
            onClick={handleSave}
            variant="contained"
            disabled={!localStage || isReadOnly || componentErrors.length > 0}
            sx={{
              bgcolor: "#1877F2",
              "&:hover": { bgcolor: "#166FE5" },
              textTransform: "none",
              fontWeight: 800,
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
            Salvar etapa
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
};
