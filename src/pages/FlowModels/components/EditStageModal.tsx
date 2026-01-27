import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogContent,
  Divider,
  FormControlLabel,
  IconButton,
  Switch,
  TextField,
  Typography,
  Autocomplete,
  Tooltip,
} from "@mui/material";
import {
  Add as AddIcon,
  Close as CloseIcon,
  Delete as DeleteIcon,
  DragIndicator as DragIndicatorIcon,
} from "@mui/icons-material";
import { useQuery } from "@tanstack/react-query";
import type { FlowModelComponent, FlowModelStage } from "@/hooks/useFlowModels";
import { useRolesAndDepartments } from "@/hooks/useRolesAndDepartments";
import { AddComponentModal } from "./AddComponentModal";

type EditStageModalProps = {
  open: boolean;
  onClose: () => void;
  stage: FlowModelStage | null;
  onSaveStage: (updatedStage: FlowModelStage) => void;
  editable?: boolean;
};

function deepClone<T>(v: T): T {
  return JSON.parse(JSON.stringify(v)) as T;
}

function safeString(v: unknown) {
  return String(v ?? "").trim();
}

function normalizeComponent(comp: FlowModelComponent): FlowModelComponent {
  return {
    ...comp,
    key: safeString(comp.key),
    label: safeString(comp.label),
    description: safeString(comp.description),
    order:
      typeof comp.order === "number" && Number.isFinite(comp.order)
        ? comp.order
        : 0,
    visibilityRoles: Array.isArray(comp.visibilityRoles)
      ? comp.visibilityRoles
      : [],
    editableRoles: Array.isArray(comp.editableRoles) ? comp.editableRoles : [],
    config: comp.config ?? {},
    lockedAfterCompletion: !!comp.lockedAfterCompletion,
    required: !!comp.required,
  };
}

function sortByOrder(a: { order?: number }, b: { order?: number }) {
  return (a.order ?? 0) - (b.order ?? 0);
}

function reindexOrders(list: FlowModelComponent[]): FlowModelComponent[] {
  const sorted = list.slice().sort(sortByOrder);
  return sorted.map((c, idx) => ({ ...c, order: idx + 1 }));
}

function moveItemByKey(
  items: FlowModelComponent[],
  activeKey: string,
  overKey: string,
) {
  const sorted = items.slice().sort(sortByOrder);
  const from = sorted.findIndex((c) => safeString(c.key) === activeKey);
  const to = sorted.findIndex((c) => safeString(c.key) === overKey);
  if (from < 0 || to < 0 || from === to) return items;

  const next = sorted.slice();
  const [moved] = next.splice(from, 1);
  next.splice(to, 0, moved);

  return reindexOrders(next);
}

export const EditStageModal = ({
  open,
  onClose,
  stage,
  onSaveStage,
  editable = true,
}: EditStageModalProps) => {
  const [localStage, setLocalStage] = useState<FlowModelStage | null>(null);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [selectedDepartments, setSelectedDepartments] = useState<string[]>([]);
  const [shouldFetchDepartments, setShouldFetchDepartments] = useState(false);
  const [addComponentOpen, setAddComponentOpen] = useState(false);

  // DnD state (visual)
  const [draggingKey, setDraggingKey] = useState<string>("");
  const [dragOverKey, setDragOverKey] = useState<string>("");

  // ✅ FIX: arm do drag precisa ser síncrono (state é lento pro dragstart)
  const armDragKeyRef = useRef<string>("");

  const { fetchRolesByOrg, fetchDepartments } = useRolesAndDepartments();

  const { data: roles = [] } = useQuery({
    queryKey: ["roles"],
    queryFn: fetchRolesByOrg,
    enabled: open,
  });

  const { data: departments = [] } = useQuery({
    queryKey: ["departments"],
    queryFn: fetchDepartments,
    enabled: open && shouldFetchDepartments,
    staleTime: 0,
    refetchOnMount: true,
  });

  const isReadOnly = !editable;

  useEffect(() => {
    if (!open) return;

    setDraggingKey("");
    setDragOverKey("");
    armDragKeyRef.current = "";

    if (!stage) {
      setLocalStage(null);
      setSelectedRoles([]);
      setSelectedDepartments([]);
      return;
    }

    const clone = deepClone(stage);
    clone.components = Array.isArray(clone.components) ? clone.components : [];
    clone.approverRoles = Array.isArray(clone.approverRoles)
      ? clone.approverRoles
      : [];
    clone.approverDepartments = Array.isArray(clone.approverDepartments)
      ? clone.approverDepartments
      : [];

    clone.components = reindexOrders(
      (clone.components || []).map(normalizeComponent),
    );

    setLocalStage(clone);
    setSelectedRoles(clone.approverRoles || []);
    setSelectedDepartments(clone.approverDepartments || []);
  }, [open, stage]);

  const componentsSorted = useMemo(() => {
    const arr = localStage?.components || [];
    return arr.slice().sort(sortByOrder);
  }, [localStage?.components]);

  const handleChangeStageField = <K extends keyof FlowModelStage>(
    key: K,
    value: FlowModelStage[K],
  ) => {
    if (!localStage) return;

    if (key === "requiresApproval") {
      const nextRequires = Boolean(value);
      if (!nextRequires) {
        setSelectedRoles([]);
        setSelectedDepartments([]);
        setLocalStage({
          ...localStage,
          requiresApproval: false,
          approverRoles: [],
          approverDepartments: [],
        });
        return;
      }
    }

    if (key === "canRepeat") {
      const nextRepeat = Boolean(value);
      if (!nextRepeat) {
        setLocalStage({
          ...localStage,
          canRepeat: false,
          repeatCondition: "",
        });
        return;
      }
    }

    setLocalStage({ ...localStage, [key]: value });
  };

  const handleSave = () => {
    if (!localStage) return;

    const updated: FlowModelStage = {
      ...localStage,
      approverRoles: localStage.requiresApproval ? selectedRoles : [],
      approverDepartments: localStage.requiresApproval
        ? selectedDepartments
        : [],
      canRepeat: !!localStage.canRepeat,
      requiresApproval: !!localStage.requiresApproval,
      components: reindexOrders(
        (localStage.components || []).map(normalizeComponent),
      ),
    };

    if (!updated.name?.trim()) return;

    onSaveStage(updated);
    onClose();
  };

  const handleAddComponent = (component: FlowModelComponent) => {
    if (!localStage) return;

    const normalized = normalizeComponent(component);
    const ensuredKey =
      safeString(normalized.key) ||
      `comp_${Date.now()}_${Math.random().toString(16).slice(2)}`;

    const withKey: FlowModelComponent = { ...normalized, key: ensuredKey };

    const nextList = [...(localStage.components || []), withKey];
    const next = reindexOrders(nextList);

    setLocalStage({
      ...localStage,
      components: next,
    });

    setAddComponentOpen(false);
  };

  const handleDeleteComponent = (key: string) => {
    if (!localStage) return;

    const next = (localStage.components || []).filter((c) => c.key !== key);
    setLocalStage({
      ...localStage,
      components: reindexOrders(next),
    });
  };

  // =========================
  // DnD (HTML5) dos COMPONENTES
  // ✅ FIX: armDragKeyRef
  // =========================
  const onCompDragStart = (e: React.DragEvent, compKey: string) => {
    if (isReadOnly) return;

    const k = safeString(compKey);
    if (!k) return;

    // ✅ só permite drag se o handle foi o gatilho (ref é síncrono)
    if (armDragKeyRef.current !== k) {
      e.preventDefault();
      return;
    }

    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", k);

    setDraggingKey(k);
  };

  const onCompDragEnd = () => {
    setDraggingKey("");
    setDragOverKey("");
    armDragKeyRef.current = "";
  };

  const onCompDragOver = (e: React.DragEvent, overKey: string) => {
    if (isReadOnly) return;
    e.preventDefault(); // ESSENCIAL pro drop
    e.dataTransfer.dropEffect = "move";
    setDragOverKey(safeString(overKey));
  };

  const onCompDragLeave = (overKey: string) => {
    const k = safeString(overKey);
    if (dragOverKey === k) setDragOverKey("");
  };

  const onCompDrop = (e: React.DragEvent, overKey: string) => {
    if (isReadOnly) return;
    e.preventDefault();

    const activeKey = safeString(e.dataTransfer.getData("text/plain"));
    const over = safeString(overKey);

    setDragOverKey("");
    armDragKeyRef.current = "";

    if (!activeKey || !over || activeKey === over) return;

    setLocalStage((prev) => {
      if (!prev) return prev;
      const nextComponents = moveItemByKey(
        prev.components || [],
        activeKey,
        over,
      );
      return { ...prev, components: nextComponents };
    });

    setDraggingKey("");
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
          maxWidth: { xs: "calc(100% - 16px)", sm: "600px", md: "800px" },
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
        {/* HEADER */}
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
                  fontWeight: 800,
                  color: "#212121",
                  fontSize: { xs: "1.25rem", sm: "1.375rem", md: "1.5rem" },
                  lineHeight: { xs: 1.3, sm: 1.2 },
                }}
              >
                Editar Etapa
              </Typography>
              <Typography variant="body2" sx={{ color: "#616161", mt: 0.25 }}>
                Configure os detalhes da etapa do fluxo
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

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              flexWrap: "wrap",
            }}
          >
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

            {!isReadOnly ? (
              <Chip
                label="Arraste pelo handle para reordenar"
                size="small"
                sx={{
                  bgcolor: "#FAFBFC",
                  color: "#64748b",
                  fontWeight: 800,
                }}
              />
            ) : null}
          </Box>
        </Box>

        {/* BODY */}
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
              {/* Informações Básicas */}
              <Box
                sx={{
                  bgcolor: "background.paper",
                  border: "1px solid #E4E6EB",
                  borderRadius: 2,
                  p: 2.5,
                }}
              >
                <Typography sx={{ fontWeight: 800, color: "#212121", mb: 1.5 }}>
                  Informações Básicas
                </Typography>

                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  <TextField
                    label="Nome"
                    value={localStage.name || ""}
                    onChange={(e) =>
                      handleChangeStageField("name", e.target.value)
                    }
                    fullWidth
                    disabled={isReadOnly}
                    error={!String(localStage.name || "").trim()}
                    required
                  />

                  <TextField
                    label="Descrição"
                    value={localStage.description || ""}
                    onChange={(e) =>
                      handleChangeStageField("description", e.target.value)
                    }
                    fullWidth
                    disabled={isReadOnly}
                    inputProps={{ maxLength: 100 }}
                    helperText={`${(localStage.description || "").length}/100 caracteres`}
                  />
                </Box>
              </Box>

              {/* Configurações */}
              <Box
                sx={{
                  bgcolor: "background.paper",
                  border: "1px solid #E4E6EB",
                  borderRadius: 2,
                  p: 2.5,
                }}
              >
                <Typography sx={{ fontWeight: 800, color: "#212121", mb: 1.5 }}>
                  Configurações
                </Typography>

                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={!!localStage.requiresApproval}
                        onChange={(e) =>
                          handleChangeStageField(
                            "requiresApproval",
                            e.target.checked,
                          )
                        }
                        disabled={isReadOnly}
                      />
                    }
                    label="Requer aprovação"
                  />

                  {localStage.requiresApproval && (
                    <>
                      <Autocomplete
                        multiple
                        options={roles}
                        getOptionLabel={(option) => option.name || option._id}
                        value={roles.filter((r) =>
                          selectedRoles.includes(r._id),
                        )}
                        onChange={(_, newValue) => {
                          setSelectedRoles(newValue.map((v) => v._id));
                        }}
                        disabled={isReadOnly}
                        renderInput={(params) => (
                          <TextField {...params} label="Cargos aprovadores" />
                        )}
                      />

                      <Autocomplete
                        multiple
                        options={departments}
                        getOptionLabel={(option) => {
                          const name =
                            option.department_name || option.name || option._id;
                          return String(name);
                        }}
                        value={departments.filter((d) =>
                          selectedDepartments.includes(d._id),
                        )}
                        onChange={(_, newValue) => {
                          setSelectedDepartments(newValue.map((v) => v._id));
                        }}
                        onOpen={() => setShouldFetchDepartments(true)}
                        disabled={isReadOnly}
                        noOptionsText="Nenhum departamento encontrado"
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="Departamentos aprovadores"
                            helperText={`${departments.length} departamentos disponíveis`}
                          />
                        )}
                      />
                    </>
                  )}

                  <Divider />

                  <FormControlLabel
                    control={
                      <Switch
                        checked={!!localStage.canRepeat}
                        onChange={(e) =>
                          handleChangeStageField("canRepeat", e.target.checked)
                        }
                        disabled={isReadOnly}
                      />
                    }
                    label="Pode repetir"
                  />

                  {localStage.canRepeat && (
                    <TextField
                      label="Condição de repetição"
                      value={localStage.repeatCondition || ""}
                      onChange={(e) =>
                        handleChangeStageField(
                          "repeatCondition",
                          e.target.value,
                        )
                      }
                      fullWidth
                      disabled={isReadOnly}
                      placeholder='Ex: "enquanto status != APROVADO"'
                    />
                  )}

                  <TextField
                    label="Condição de visibilidade"
                    value={localStage.visibilityCondition || ""}
                    onChange={(e) =>
                      handleChangeStageField(
                        "visibilityCondition",
                        e.target.value,
                      )
                    }
                    fullWidth
                    disabled={isReadOnly}
                    placeholder='Ex: "se tipo_processo == MEDICAMENTO"'
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
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 1.5,
                    gap: 1.5,
                  }}
                >
                  <Typography sx={{ fontWeight: 800, color: "#212121" }}>
                    Componentes ({(localStage.components || []).length})
                  </Typography>

                  {!isReadOnly && (
                    <Button
                      variant="contained"
                      size="small"
                      startIcon={<AddIcon />}
                      onClick={() => setAddComponentOpen(true)}
                      sx={{
                        bgcolor: "#1877F2",
                        "&:hover": { bgcolor: "#166FE5" },
                        textTransform: "none",
                        fontWeight: 700,
                        borderRadius: 2,
                        boxShadow: "none",
                        whiteSpace: "nowrap",
                      }}
                    >
                      Adicionar
                    </Button>
                  )}
                </Box>

                {(localStage.components || []).length === 0 ? (
                  <Typography
                    variant="body2"
                    sx={{ color: "#94a3b8", textAlign: "center", py: 2 }}
                  >
                    Nenhum componente adicionado
                  </Typography>
                ) : (
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                    {componentsSorted.map((comp) => {
                      const compKey = safeString(comp.key);
                      const isDragging = draggingKey === compKey;
                      const isOver = dragOverKey === compKey;

                      return (
                        <Box
                          key={compKey || comp.key}
                          draggable={!isReadOnly}
                          onDragStart={(e) => onCompDragStart(e, compKey)}
                          onDragEnd={onCompDragEnd}
                          onDragOver={(e) => onCompDragOver(e, compKey)}
                          onDragLeave={() => onCompDragLeave(compKey)}
                          onDrop={(e) => onCompDrop(e, compKey)}
                          sx={{
                            border: "1px solid",
                            borderColor: isOver ? "#1877F2" : "#E4E6EB",
                            borderRadius: 1.75,
                            bgcolor: isOver ? "#F0F9FF" : "#FAFBFC",
                            transition: "all 0.15s ease",
                            opacity: isDragging ? 0.45 : 1,
                            boxShadow: isDragging
                              ? "0 10px 24px rgba(0,0,0,0.12)"
                              : "none",
                            display: "flex",
                            alignItems: "center",
                            gap: 1.25,
                            px: 1.25,
                            py: 1.1,
                            cursor: isReadOnly ? "default" : "grab",
                            userSelect: "none",
                          }}
                        >
                          {/* HANDLE: arma o drag (ref síncrona) */}
                          {!isReadOnly ? (
                            <Box
                              title="Arraste para reordenar"
                              onPointerDown={(e) => {
                                // evita seleção/scroll interferir no drag
                                e.preventDefault();
                                armDragKeyRef.current = compKey;
                              }}
                              onPointerUp={() => {
                                armDragKeyRef.current = "";
                              }}
                              onPointerLeave={() => {
                                armDragKeyRef.current = "";
                              }}
                              sx={{
                                width: 34,
                                height: 34,
                                borderRadius: 1.5,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                cursor: "grab",
                                color: "#94a3b8",
                                border: "1px solid #E4E6EB",
                                bgcolor: "#fff",
                                flexShrink: 0,
                                touchAction: "none",
                                "&:active": { cursor: "grabbing" },
                              }}
                            >
                              <DragIndicatorIcon sx={{ fontSize: 20 }} />
                            </Box>
                          ) : (
                            <Box sx={{ width: 34, height: 34 }} />
                          )}

                          {/* Conteúdo */}
                          <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Box
                              sx={{
                                display: "flex",
                                gap: 1,
                                alignItems: "center",
                                flexWrap: "wrap",
                              }}
                            >
                              <Typography
                                sx={{
                                  fontWeight: 800,
                                  fontSize: "0.9rem",
                                  color: "#0f172a",
                                }}
                              >
                                {(comp.order ?? 0) > 0 ? `${comp.order}. ` : ""}
                                {comp.label || "Componente"}
                              </Typography>

                              <Chip
                                label={comp.type}
                                size="small"
                                sx={{
                                  height: 20,
                                  fontSize: "0.7rem",
                                  bgcolor: "#E7F3FF",
                                  color: "#1877F2",
                                  fontWeight: 800,
                                }}
                              />

                              {comp.required ? (
                                <Chip
                                  label="Obrigatório"
                                  size="small"
                                  sx={{
                                    height: 20,
                                    fontSize: "0.7rem",
                                    bgcolor: "#FEF3C7",
                                    color: "#92400E",
                                    fontWeight: 800,
                                  }}
                                />
                              ) : null}

                              {comp.lockedAfterCompletion ? (
                                <Chip
                                  label="Trava ao concluir"
                                  size="small"
                                  sx={{
                                    height: 20,
                                    fontSize: "0.7rem",
                                    bgcolor: "#F0F2F5",
                                    color: "#212121",
                                    fontWeight: 800,
                                  }}
                                />
                              ) : null}
                            </Box>

                            {comp.description?.trim() ? (
                              <Typography
                                variant="body2"
                                sx={{
                                  color: "#64748b",
                                  mt: 0.25,
                                  fontWeight: 700,
                                  fontSize: "0.82rem",
                                  whiteSpace: "nowrap",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                }}
                              >
                                {comp.description}
                              </Typography>
                            ) : null}
                          </Box>

                          {/* Excluir */}
                          {!isReadOnly ? (
                            <Tooltip title="Excluir componente" arrow>
                              <span>
                                <IconButton
                                  onClick={() => handleDeleteComponent(comp.key)}
                                  sx={{
                                    color: "#F02849",
                                    border: "1px solid #E4E6EB",
                                    borderRadius: 1.5,
                                    bgcolor: "#fff",
                                    "&:hover": {
                                      borderColor: "#F02849",
                                      bgcolor: "#FFF1F3",
                                    },
                                    flexShrink: 0,
                                  }}
                                >
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              </span>
                            </Tooltip>
                          ) : null}
                        </Box>
                      );
                    })}
                  </Box>
                )}
              </Box>
            </Box>
          )}
        </Box>

        {/* FOOTER */}
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
            disabled={!localStage || isReadOnly}
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

      <AddComponentModal
        open={addComponentOpen}
        onClose={() => setAddComponentOpen(false)}
        onAdd={handleAddComponent}
        existingComponents={localStage?.components || []}
      />
    </Dialog>
  );
};
