import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  Button,
  TextField,
  Box,
  Switch,
  FormControlLabel,
  Typography,
  IconButton,
  Autocomplete,
  Alert,
  Tooltip,
} from "@mui/material";
import { Close as CloseIcon, Info as InfoIcon, Warning as WarningIcon } from "@mui/icons-material";
import { useQuery } from "@tanstack/react-query";
import type { FlowModelStage } from "@/hooks/useFlowModels";
import { useRolesAndDepartments } from "@/hooks/useRolesAndDepartments";
import { useUsers } from "@/hooks/useUsers";

type CreateStageModalProps = {
  open: boolean;
  existingStages: FlowModelStage[];
  onClose: () => void;
  onCreate: (newStage: FlowModelStage) => void;
};

function generateStageId() {
  return `stage_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export const CreateStageModal = ({
  open,
  existingStages,
  onClose,
  onCreate,
}: CreateStageModalProps) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [businessDaysDuration, setBusinessDaysDuration] = useState<string>("");
  const [isOptional, setIsOptional] = useState(false);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [usersPage, setUsersPage] = useState(1);
  const [allUsers, setAllUsers] = useState<any[]>([]);

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

  useEffect(() => {
    if (open) {
      setName("");
      setDescription("");
      setBusinessDaysDuration("");
      setIsOptional(false);
      setSelectedRoles([]);
      setSelectedUsers([]);
      setUsersPage(1);
    }
  }, [open]);

  const nextOrder = useMemo(() => {
    const normalStages = existingStages.filter(s => !s.isOptional);
    const orders = normalStages.map(s => s.order).filter(o => typeof o === "number");
    return orders.length ? Math.max(...orders) + 1 : 1;
  }, [existingStages]);

  const handleCreate = useCallback(() => {
    const newStage: FlowModelStage = {
      stageId: generateStageId(),
      order: isOptional ? 0 : nextOrder,
      name: name.trim(),
      description: description.trim() || undefined,
      businessDaysDuration: businessDaysDuration.trim() && Number(businessDaysDuration) >= 0 ? Number(businessDaysDuration) : undefined,
      isOptional,
      approverRoles: selectedRoles,
      approverUsers: selectedUsers,
      components: [],
    };

    onCreate(newStage);
  }, [name, description, businessDaysDuration, isOptional, selectedRoles, selectedUsers, nextOrder, onCreate]);

  const isValid = name.trim().length > 0;

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
        },
      }}
    >
      <DialogContent sx={{ p: 0 }}>
        <Box sx={{ px: 4, py: 3, borderBottom: "1px solid #e2e8f0" }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 800, color: "#212121" }}>
                Criar Nova Etapa
              </Typography>
              <Typography variant="body2" sx={{ color: "#616161", mt: 0.5 }}>
                Configure os detalhes da nova etapa
              </Typography>
            </Box>
            <IconButton onClick={onClose} sx={{ color: "#64748b" }}>
              <CloseIcon />
            </IconButton>
          </Box>
        </Box>

        <Box sx={{ px: 4, py: 3, bgcolor: "#FAFBFC", maxHeight: "60vh", overflow: "auto" }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
            <Box sx={{ bgcolor: "background.paper", border: "1px solid #E4E6EB", borderRadius: 2, p: 2.5 }}>
              <Typography sx={{ fontWeight: 800, color: "#212121", mb: 1.5 }}>
                Informações Básicas
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <TextField
                  label="Nome da etapa"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  fullWidth
                  required
                  inputProps={{ maxLength: 200 }}
                />
                <TextField
                  label="Descrição"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  fullWidth
                  multiline
                  rows={3}
                  inputProps={{ maxLength: 100 }}
                  helperText={`${description.length}/100 caracteres`}
                />
                <TextField
                  label="Duração em dias úteis (opcional)"
                  type="number"
                  value={businessDaysDuration}
                  onChange={(e) => setBusinessDaysDuration(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'e' || e.key === 'E' || e.key === '+' || e.key === '-') {
                      e.preventDefault();
                    }
                  }}
                  fullWidth
                  inputProps={{ min: 0 }}
                  placeholder="Ex: 5 dias úteis"
                  helperText="Quantidade de dias úteis estimados para conclusão desta etapa"
                />
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Switch
                    checked={isOptional}
                    onChange={(e) => setIsOptional(e.target.checked)}
                  />
                  <Typography>Etapas Opcionais</Typography>
                  <Tooltip title="Etapas opcionais aparecem em roxo e podem ser adicionadas dinamicamente durante o processo pelo criador" arrow>
                    <InfoIcon sx={{ fontSize: 16, color: "#64748b", cursor: "help" }} />
                  </Tooltip>
                </Box>
              </Box>
            </Box>

            <Box sx={{ bgcolor: "background.paper", border: "1px solid #E4E6EB", borderRadius: 2, p: 2.5 }}>
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
          </Box>
        </Box>

        <Box sx={{ p: 3, backgroundColor: "#f8fafc", borderTop: "1px solid #e2e8f0", display: "flex", justifyContent: "flex-end", gap: 1 }}>
          <Button
            onClick={onClose}
            variant="outlined"
            sx={{
              textTransform: "none",
              borderRadius: 2,
              borderColor: "#E4E6EB",
              color: "#212121",
              fontWeight: 700,
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
              fontWeight: 800,
              borderRadius: 2,
              boxShadow: "none",
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
