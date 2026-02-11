import { useEffect, useState } from "react";
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
  List,
  ListItem,
  ListItemText,
  Tooltip,
  Alert,
} from "@mui/material";
import {
  Add as AddIcon,
  Close as CloseIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  Fullscreen as FullscreenIcon,
  FullscreenExit as FullscreenExitIcon,
  DragIndicator as DragIndicatorIcon,
  Info as InfoIcon,
  Edit as EditIcon,
  Warning as WarningIcon,
  ContentCopy as ContentCopyIcon,
} from "@mui/icons-material";
import { useQuery } from "@tanstack/react-query";
import type {
  FlowModelComponent,
  FlowModelStage,
} from "@/hooks/useFlowModels";
import { useRolesAndDepartments } from "@/hooks/useRolesAndDepartments";
import { useUsers } from "@/hooks/useUsers";
import { AddComponentModal } from "./AddComponentModal";
import { SignatureComponent } from "./SignatureComponent";
import { FilesManagementComponent } from "./FilesManagementComponent";
import { ApprovalComponent } from "./ApprovalComponent";
import { TimelineComponent } from "./TimelineComponent";
import { CommentsComponent } from "./CommentsComponent";
import { ChecklistComponent } from "./ChecklistComponent";
import { FormComponent } from "./FormComponent";

// Mapeamento de componentes implementados
const COMPONENT_MAP: Record<string, React.ComponentType<any>> = {
  SIGNATURE: SignatureComponent,
  FILES_MANAGEMENT: FilesManagementComponent,
  APPROVAL: ApprovalComponent,
  TIMELINE: TimelineComponent,
  COMMENTS: CommentsComponent,
  CHECKLIST: ChecklistComponent,
  FORM: FormComponent,
};

// Componentes que têm implementação de preview
const COMPONENTS_WITH_PREVIEW = Object.keys(COMPONENT_MAP);

type EditStageModalProps = {
  open: boolean;
  onClose: () => void;
  stage: FlowModelStage | null;
  onSaveStage: (updatedStage: FlowModelStage) => void;
  onDuplicateStage?: (stage: FlowModelStage) => void;
  editable?: boolean;
};

function deepClone<T>(v: T): T {
  return JSON.parse(JSON.stringify(v)) as T;
}

export const EditStageModal = ({
  open,
  onClose,
  stage,
  onSaveStage,
  onDuplicateStage,
  editable = true,
}: EditStageModalProps) => {
  const [localStage, setLocalStage] = useState<FlowModelStage | null>(null);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [usersPage, setUsersPage] = useState(1);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [addComponentOpen, setAddComponentOpen] = useState(false);
  const [editingComponent, setEditingComponent] = useState<FlowModelComponent | null>(null);
  const [previewComponentKey, setPreviewComponentKey] = useState<string | null>(null);
  const [previewFullscreen, setPreviewFullscreen] = useState(false);
  const [editModalFullscreen, setEditModalFullscreen] = useState(false);

  const { fetchRolesByOrg } = useRolesAndDepartments();
  const { fetchUsers } = useUsers();

  const { data: roles = [], refetch: refetchRoles } = useQuery({
    queryKey: ["roles"],
    queryFn: fetchRolesByOrg,
    enabled: false,
  });

  const { data: usersData, isFetching: isFetchingUsers, refetch: refetchUsers } = useQuery({
    queryKey: ["users-org", usersPage],
    queryFn: () => fetchUsers({ limit: 100, page: usersPage }),
    enabled: false,
  });

  useEffect(() => {
    if (usersData?.users) {
      setAllUsers(prev => {
        if (usersPage === 1) {
          return usersData.users;
        }
        const existingIds = new Set(prev.map(u => u._id));
        const newUsers = usersData.users.filter(u => !existingIds.has(u._id));
        return [...prev, ...newUsers];
      });
    }
  }, [usersData, usersPage]);

  const handleUsersScroll = (event: React.SyntheticEvent) => {
    const listboxNode = event.currentTarget;
    if (listboxNode.scrollTop + listboxNode.clientHeight >= listboxNode.scrollHeight - 10) {
      if (usersData?.hasNext && !isFetchingUsers) {
        setUsersPage(prev => prev + 1);
      }
    }
  };

  const isReadOnly = !editable;

  useEffect(() => {
    if (!open) {
      setUsersPage(1);
      return;
    }

    if (!stage) {
      setLocalStage(null);
      setSelectedRoles([]);
      setSelectedUsers([]);
      return;
    }

    const clone = deepClone(stage);
    clone.components = Array.isArray(clone.components) ? clone.components : [];
    clone.approverRoles = Array.isArray(clone.approverRoles) ? clone.approverRoles : [];
    clone.approverUsers = Array.isArray(clone.approverUsers) ? clone.approverUsers : [];

    clone.components = (clone.components || []).map((c) => ({
      ...c,
      visibilityRoles: Array.isArray(c.visibilityRoles) ? c.visibilityRoles : [],
      editableRoles: Array.isArray(c.editableRoles) ? c.editableRoles : [],
      config: c.config ?? {},
      lockedAfterCompletion: !!c.lockedAfterCompletion,
      required: !!c.required,
    }));

    clone.components.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

    setLocalStage(clone);
    setSelectedRoles(clone.approverRoles || []);
    setSelectedUsers(clone.approverUsers || []);
  }, [open, stage]);

  const handleChangeStageField = <K extends keyof FlowModelStage>(key: K, value: FlowModelStage[K]) => {
    if (!localStage) return;
    setLocalStage({ ...localStage, [key]: value });
  };

  const handleSave = () => {
    if (!localStage?.name?.trim()) return;
    onSaveStage({
      ...localStage,
      approverRoles: selectedRoles,
      approverUsers: selectedUsers,
    });
    onClose();
  };

  const handleDuplicate = () => {
    if (!localStage || !onDuplicateStage) return;
    const duplicated: FlowModelStage = {
      ...deepClone(localStage),
      stageId: `stage_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: `${localStage.name} (Cópia)`,
      approverRoles: selectedRoles,
      approverUsers: selectedUsers,
    };
    onDuplicateStage(duplicated);
    onClose();
  };

  const handleAddComponent = (component: FlowModelComponent) => {
    if (!localStage) return;
    if (editingComponent) {
      const updated = (localStage.components || []).map(c => c.key === component.key ? component : c);
      setLocalStage({ ...localStage, components: updated });
    } else {
      setLocalStage({ ...localStage, components: [...(localStage.components || []), component] });
    }
    setAddComponentOpen(false);
    setEditingComponent(null);
  };

  const handleDeleteComponent = (key: string) => {
    if (!localStage) return;
    const componentToDelete = localStage.components?.find(c => c.key === key);
    
    if (componentToDelete?.type === "FILES_MANAGEMENT") {
      const hasApproval = localStage.components?.some(c => c.type === "APPROVAL");
      if (hasApproval) {
        alert("Não é possível remover o componente de Gerenciar Arquivos quando há um componente de Aprovação na etapa.");
        return;
      }
    }
    
    setLocalStage({ ...localStage, components: (localStage.components || []).filter((c) => c.key !== key) });
  };

  const handlePreviewComponent = (key: string) => {
    setPreviewComponentKey(key);
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", String(index));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (!localStage) return;

    const dragIndex = Number(e.dataTransfer.getData("text/plain"));
    if (dragIndex === dropIndex) return;

    const components = [...(localStage.components || [])];
    const [draggedItem] = components.splice(dragIndex, 1);
    components.splice(dropIndex, 0, draggedItem);

    const reordered = components.map((c, idx) => ({ ...c, order: idx + 1 }));
    setLocalStage({ ...localStage, components: reordered });
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      fullScreen={editModalFullscreen}
      maxWidth={editModalFullscreen ? false : "md"}
      PaperProps={{
        sx: {
          borderRadius: editModalFullscreen ? 0 : { xs: 2, sm: 3 },
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
          overflow: "hidden",
          margin: editModalFullscreen ? 0 : { xs: 1, sm: 2 },
          maxWidth: editModalFullscreen ? "none" : { xs: "calc(100% - 16px)", sm: "600px", md: "800px" },
          width: "100%",
          maxHeight: editModalFullscreen ? "100vh" : { xs: "calc(100vh - 32px)", sm: "calc(100vh - 64px)" },
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

            <Box sx={{ display: "flex", gap: 1 }}>
              <IconButton
                onClick={() => setEditModalFullscreen(!editModalFullscreen)}
                sx={{
                  width: { xs: 36, sm: 40 },
                  height: { xs: 36, sm: 40 },
                  color: "#1877F2",
                  backgroundColor: "transparent",
                  flexShrink: 0,
                  "&:hover": {
                    backgroundColor: "#E7F3FF",
                  },
                }}
              >
                {editModalFullscreen ? <FullscreenExitIcon sx={{ fontSize: { xs: 18, sm: 20 } }} /> : <FullscreenIcon sx={{ fontSize: { xs: 18, sm: 20 } }} />}
              </IconButton>
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
          </Box>

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
                    onChange={(e) => handleChangeStageField("name", e.target.value)}
                    fullWidth
                    disabled={isReadOnly}
                    error={!String(localStage.name || "").trim()}
                    required
                  />

                  <TextField
                    label="Descrição"
                    value={localStage.description || ""}
                    onChange={(e) => handleChangeStageField("description", e.target.value)}
                    fullWidth
                    disabled={isReadOnly}
                    inputProps={{ maxLength: 100 }}
                    helperText={`${(localStage.description || "").length}/100 caracteres`}
                  />

                  <TextField
                    label="Duração em dias úteis (opcional)"
                    type="number"
                    value={localStage.businessDaysDuration ?? ""}
                    onChange={(e) => handleChangeStageField("businessDaysDuration", e.target.value ? Number(e.target.value) : undefined)}
                    onKeyDown={(e) => {
                      if (e.key === 'e' || e.key === 'E' || e.key === '+' || e.key === '-') {
                        e.preventDefault();
                      }
                    }}
                    fullWidth
                    disabled={isReadOnly}
                    inputProps={{ min: 0 }}
                    placeholder="Ex: 5 dias úteis"
                    helperText="Quantidade de dias úteis estimados para conclusão desta etapa"
                  />

                  <FormControlLabel
                    control={
                      <Switch
                        checked={!!localStage.isOptional}
                        onChange={(e) => handleChangeStageField("isOptional", e.target.checked)}
                        disabled={isReadOnly}
                      />
                    }
                    label={
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <Typography>Etapas Opcionais</Typography>
                        <Tooltip title="Etapas opcionais aparecem em roxo e podem ser adicionadas dinamicamente durante o processo pelo criador" arrow>
                          <InfoIcon sx={{ fontSize: 16, color: "#64748b" }} />
                        </Tooltip>
                      </Box>
                    }
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
                <Typography sx={{ fontWeight: 800, color: "#212121", mb: 1.5 }}>
                  Responsáveis do Card
                </Typography>

                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  <Autocomplete
                    multiple
                    options={roles}
                    getOptionLabel={(option) => option.name || option._id}
                    value={roles.filter((r) => selectedRoles.includes(r._id))}
                    onChange={(_, newValue) => {
                      setSelectedRoles(newValue.map((v) => v._id));
                    }}
                    onOpen={() => {
                      if (!roles || roles.length === 0) {
                        refetchRoles();
                      }
                    }}
                    disabled={isReadOnly}
                    renderInput={(params) => (
                      <TextField {...params} label="Cargos aprovadores" placeholder="Selecione os cargos" />
                    )}
                  />

                  <Box>
                    <Autocomplete
                      multiple
                      options={allUsers}
                      getOptionLabel={(option) => {
                        if (!option.firstName || !option.lastName) return option.email || 'Usuário sem nome';
                        const depts = option.departments?.map((d: any) => d.department_name).filter(Boolean).join(", ") || "Sem gerência";
                        return `${option.firstName} ${option.lastName} (${depts})`;
                      }}
                      value={allUsers.filter((u) => selectedUsers.includes(u._id || ""))}
                      onChange={(_, newValue) => {
                        setSelectedUsers(newValue.map((v) => v._id || ""));
                      }}
                      onOpen={() => {
                        if (allUsers.length === 0 && usersData?.users) {
                          setAllUsers(usersData.users);
                        } else if (allUsers.length === 0) {
                          setUsersPage(1);
                          refetchUsers();
                        }
                      }}
                      disabled={isReadOnly}
                      loading={isFetchingUsers}
                      noOptionsText="Nenhum usuário encontrado"
                      ListboxProps={{
                        onScroll: handleUsersScroll,
                        style: { maxHeight: '400px' },
                      }}
                      renderInput={(params) => (
                        <TextField {...params} label="Pessoas aprovadoras" placeholder="Selecione pessoas específicas" />
                      )}
                    />
                    {selectedUsers.length > 0 && (
                      <Alert severity="warning" icon={<WarningIcon />} sx={{ mt: 1.5 }}>
                        Pode colocar uma pessoa, mas isso limita o reaproveitamento, porque só ela poderá avançar a etapa.
                      </Alert>
                    )}
                  </Box>
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
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1.5 }}>
                  <Typography sx={{ fontWeight: 800, color: "#212121" }}>
                    Componentes ({(localStage.components || []).length})
                  </Typography>
                  {!isReadOnly && (
                    <Button
                      variant="contained"
                      size="small"
                      startIcon={<AddIcon />}
                      onClick={() => { setEditingComponent(null); setAddComponentOpen(true); }}
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
                  )}
                </Box>

                {(localStage.components || []).length === 0 ? (
                  <Typography variant="body2" sx={{ color: "#94a3b8", textAlign: "center", py: 2 }}>
                    Nenhum componente adicionado
                  </Typography>
                ) : (
                  <List sx={{ p: 0 }}>
                    {localStage.components
                      ?.sort((a, b) => a.order - b.order)
                      .map((comp, index) => (
                        <ListItem
                          key={comp.key}
                          draggable={!isReadOnly}
                          onDragStart={(e) => handleDragStart(e, index)}
                          onDragOver={handleDragOver}
                          onDrop={(e) => handleDrop(e, index)}
                          sx={{
                            border: "1px solid #E4E6EB",
                            borderRadius: 1,
                            mb: 1,
                            bgcolor: "#FAFBFC",
                            cursor: isReadOnly ? "default" : "grab",
                            "&:active": { cursor: isReadOnly ? "default" : "grabbing" },
                          }}
                          secondaryAction={
                            <Box sx={{ display: "flex", gap: 0.5 }}>
                              {COMPONENTS_WITH_PREVIEW.includes(comp.type) && (
                                <IconButton
                                  edge="end"
                                  onClick={() => handlePreviewComponent(comp.key)}
                                  sx={{ color: "#1877F2" }}
                                >
                                  <VisibilityIcon fontSize="small" />
                                </IconButton>
                              )}
                              {!isReadOnly && (
                                <>
                                  <IconButton
                                    edge="end"
                                    onClick={() => { setEditingComponent(comp); setAddComponentOpen(true); }}
                                    sx={{ color: "#1877F2" }}
                                  >
                                    <EditIcon fontSize="small" />
                                  </IconButton>
                                  <IconButton
                                    edge="end"
                                    onClick={() => handleDeleteComponent(comp.key)}
                                    sx={{ color: "#F02849" }}
                                  >
                                    <DeleteIcon fontSize="small" />
                                  </IconButton>
                                </>
                              )}
                            </Box>
                          }
                        >
                          {!isReadOnly && (
                            <Box sx={{ mr: 1, display: "flex", alignItems: "center", color: "#94a3b8" }}>
                              <DragIndicatorIcon fontSize="small" />
                            </Box>
                          )}
                          <ListItemText
                            primary={
                              <Box sx={{ display: "flex", gap: 1, alignItems: "center", flexWrap: "wrap" }}>
                                <Typography sx={{ fontWeight: 700, fontSize: "0.875rem" }}>
                                  {comp.label}
                                </Typography>
                                <Chip
                                  label={comp.type}
                                  size="small"
                                  sx={{
                                    height: 20,
                                    fontSize: "0.7rem",
                                    bgcolor: "#E7F3FF",
                                    color: "#1877F2",
                                  }}
                                />
                                {comp.required && (
                                  <Chip
                                    label="Obrigatório"
                                    size="small"
                                    sx={{
                                      height: 20,
                                      fontSize: "0.7rem",
                                      bgcolor: "#FEF3C7",
                                      color: "#92400E",
                                    }}
                                  />
                                )}
                              </Box>
                            }
                            secondary={comp.description}
                          />
                        </ListItem>
                      ))}
                  </List>
                )}
              </Box>
            </Box>
          )}
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
        onClose={() => { setAddComponentOpen(false); setEditingComponent(null); }}
        onAdd={handleAddComponent}
        existingComponents={localStage?.components || []}
        editingComponent={editingComponent}
      />

      <Dialog
        open={!!previewComponentKey}
        onClose={() => setPreviewComponentKey(null)}
        fullWidth
        fullScreen={previewFullscreen}
        maxWidth={previewFullscreen ? false : "md"}
        PaperProps={{ sx: { borderRadius: previewFullscreen ? 0 : 3, overflow: "hidden" } }}
      >
        <DialogContent sx={{ p: 0 }}>
          <Box sx={{ px: 3, py: 2.5, borderBottom: "1px solid #E4E6EB", display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
            <Box sx={{ flex: 1 }}>
              {previewComponentKey && (() => {
                const comp = localStage?.components?.find((c) => c.key === previewComponentKey);
                return comp ? (
                  <>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Typography sx={{ fontWeight: 700, color: "#0f172a", fontSize: "1.25rem" }}>
                        {comp.label}
                      </Typography>
                      {comp.description && (
                        <Tooltip title={comp.description} arrow>
                          <InfoIcon sx={{ fontSize: 20, color: "#1877F2", cursor: "help" }} />
                        </Tooltip>
                      )}
                    </Box>
                    <Typography variant="body2" sx={{ color: "#64748b", mt: 0.25 }}>
                      Visualização com dados simulados
                    </Typography>
                  </>
                ) : null;
              })()}
            </Box>
            <Box sx={{ display: "flex", gap: 1 }}>
              <IconButton onClick={() => setPreviewFullscreen(!previewFullscreen)} sx={{ color: "#1877F2" }}>
                {previewFullscreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
              </IconButton>
              <IconButton onClick={() => setPreviewComponentKey(null)}>
                <CloseIcon />
              </IconButton>
            </Box>
          </Box>
          <Box sx={{ p: 3, bgcolor: "#FAFBFC", height: previewFullscreen ? "calc(100vh - 80px)" : "auto", overflow: "auto" }}>
            {previewComponentKey && (() => {
              const comp = localStage?.components?.find((c) => c.key === previewComponentKey);
              const Component = comp ? COMPONENT_MAP[comp.type] : null;
              return Component ? <Component config={comp.config} /> : null;
            })()}
          </Box>
        </DialogContent>
      </Dialog>
    </Dialog>
  );
};
