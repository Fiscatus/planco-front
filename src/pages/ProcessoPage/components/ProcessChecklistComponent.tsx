import { useState } from "react";
import { Box, Button, Checkbox, Chip, Collapse, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, IconButton, InputLabel, LinearProgress, MenuItem, Select, TextField, Tooltip, Typography, CircularProgress } from "@mui/material";
import {
  Add as AddIcon,
  CheckCircle as CheckCircleIcon,
  Circle as CircleIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Info as InfoIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Fullscreen as FullscreenIcon,
  Search as SearchIcon,
} from "@mui/icons-material";
import { useChecklist, useCreateChecklistItem, useToggleChecklistItem, useUpdateChecklistItem, useDeleteChecklistItem } from "@/hooks";

type ProcessChecklistComponentProps = {
  label?: string;
  description?: string;
  context: {
    processId: string;
    stageId: string;
    componentKey: string;
  };
  enabled?: boolean;
  readOnly?: boolean;
};

const ChecklistContent = ({
  context,
  enabled,
  compact,
  readOnly = false,
}: {
  context: ProcessChecklistComponentProps["context"];
  enabled: boolean;
  compact?: boolean;
  readOnly?: boolean;
}) => {
  const { data: checklistData, isLoading } = useChecklist(context, enabled);
  const createMutation = useCreateChecklistItem();
  const toggleMutation = useToggleChecklistItem();
  const updateMutation = useUpdateChecklistItem();
  const deleteMutation = useDeleteChecklistItem();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskPriority, setNewTaskPriority] = useState<"Baixa" | "Média" | "Alta">("Média");
  const [editingItem, setEditingItem] = useState<any>(null);
  const [deletingItemId, setDeletingItemId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filterPriority, setFilterPriority] = useState<string>("all");

  const items = checklistData?.items || [];
  const completedCount = items.filter((i: any) => i.completed).length;
  const totalCount = items.length;
  const completionPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const filteredItems = items.filter((item: any) => {
    const matchSearch = !search || item.title.toLowerCase().includes(search.toLowerCase());
    const matchPriority = filterPriority === "all" || item.priority === filterPriority;
    return matchSearch && matchPriority;
  });

  const handleCreate = () => {
    if (newTaskTitle.trim()) {
      createMutation.mutate({ context, data: { title: newTaskTitle, priority: newTaskPriority } }, {
        onSuccess: () => { setNewTaskTitle(""); setNewTaskPriority("Média"); setShowCreateModal(false); }
      });
    }
  };

  const handleToggle = (id: string) => toggleMutation.mutate({ id, context });

  const handleOpenEdit = (item: any) => { setEditingItem(item); setShowEditModal(true); };

  const handleSaveEdit = () => {
    if (editingItem?.title?.trim()) {
      updateMutation.mutate({ id: editingItem._id, data: { title: editingItem.title, priority: editingItem.priority }, context }, {
        onSuccess: () => { setEditingItem(null); setShowEditModal(false); }
      });
    }
  };

  const handleOpenDelete = (id: string) => { setDeletingItemId(id); setShowDeleteModal(true); };

  const handleConfirmDelete = () => {
    if (deletingItemId) {
      deleteMutation.mutate({ id: deletingItemId, context }, {
        onSuccess: () => { setDeletingItemId(null); setShowDeleteModal(false); }
      });
    }
  };

  if (isLoading) return <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}><CircularProgress /></Box>;

  return (
    <>
      <Box sx={{ px: 2, py: 1.5, borderBottom: "1px solid #E4E6EB", display: "flex", gap: 1, alignItems: "center" }}>
        <TextField
          size="small"
          placeholder="Buscar tarefas..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{ startAdornment: <SearchIcon sx={{ fontSize: 18, color: "#8A8D91", mr: 0.5 }} /> }}
          sx={{ flex: 1, "& .MuiOutlinedInput-root": { borderRadius: 2, bgcolor: "#F0F2F5" } }}
        />
        <TextField
          select size="small" value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)}
          sx={{ width: 120, "& .MuiOutlinedInput-root": { borderRadius: 2, bgcolor: "#F0F2F5" } }}
        >
          <MenuItem value="all">Todas</MenuItem>
          <MenuItem value="Baixa">Baixa</MenuItem>
          <MenuItem value="Média">Média</MenuItem>
          <MenuItem value="Alta">Alta</MenuItem>
        </TextField>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setShowCreateModal(true)}
          sx={{ bgcolor: "#1877F2", textTransform: "none", fontWeight: 700, borderRadius: 2, whiteSpace: "nowrap", display: readOnly ? 'none' : undefined }}>
          Nova tarefa
        </Button>
      </Box>

      <Box sx={{ px: 2, py: 1.5, borderBottom: "1px solid #E4E6EB" }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 0.5 }}>
          <Typography variant="body2" sx={{ color: "#64748b", fontSize: "0.8rem" }}>
            {completedCount} de {totalCount} concluídas
          </Typography>
          <Typography variant="body2" sx={{ fontWeight: 700, color: "#1877F2", fontSize: "0.8rem" }}>{completionPercentage}%</Typography>
        </Box>
        <LinearProgress variant="determinate" value={completionPercentage}
          sx={{ height: 8, borderRadius: 1, bgcolor: "#E4E6EB", "& .MuiLinearProgress-bar": { bgcolor: "#1877F2", borderRadius: 1 } }} />
      </Box>

      <Box sx={{ maxHeight: compact ? 300 : 420, overflow: "auto", p: 2 }}>
        {filteredItems.length === 0 ? (
          <Box sx={{ textAlign: "center", py: 6, color: "#94a3b8" }}>
            <CheckCircleIcon sx={{ fontSize: 40, mb: 1 }} />
            <Typography variant="body2">{items.length === 0 ? "Nenhuma tarefa criada" : "Nenhuma tarefa encontrada"}</Typography>
          </Box>
        ) : (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            {filteredItems.map((item: any) => (
              <Box key={item._id} sx={{ p: 1.5, border: "1px solid #E4E6EB", borderRadius: 2, display: "flex", alignItems: "center", gap: 1.5, bgcolor: item.completed ? "#F8FAFC" : "#fff", "&:hover": { borderColor: "#1877F2" } }}>
                <Checkbox checked={item.completed} onChange={() => handleToggle(item._id)}
                  icon={<CircleIcon />} checkedIcon={<CheckCircleIcon />}
                  sx={{ color: "#CBD5E1", "&.Mui-checked": { color: "#16A34A" } }} />
                <Box sx={{ flex: 1 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
                    <Typography sx={{ fontWeight: 700, color: item.completed ? "#94a3b8" : "#0f172a", textDecoration: item.completed ? "line-through" : "none", fontSize: "0.9rem" }}>
                      {item.title}
                    </Typography>
                    <Chip label={item.priority} size="small" sx={{
                      bgcolor: item.priority === "Alta" ? "#FEE2E2" : item.priority === "Média" ? "#FEF3C7" : "#ECFDF3",
                      color: item.priority === "Alta" ? "#B91C1C" : item.priority === "Média" ? "#92400E" : "#065F46",
                      fontWeight: 700, fontSize: "0.7rem", height: 20
                    }} />
                  </Box>
                  {item.createdBy && (
                    <Typography variant="caption" sx={{ color: "#94a3b8" }}>
                      Criado por {item.createdBy.firstName} {item.createdBy.lastName}
                    </Typography>
                  )}
                </Box>
                {!item.completed && !readOnly && (
                  <IconButton size="small" onClick={() => handleOpenEdit(item)} sx={{ color: "#64748b" }}>
                    <EditIcon fontSize="small" />
                  </IconButton>
                )}
                {!readOnly && (
                <IconButton size="small" onClick={() => handleOpenDelete(item._id)} sx={{ color: "#EF4444" }}>
                  <DeleteIcon fontSize="small" />
                </IconButton>
                )}
              </Box>
            ))}
          </Box>
        )}
      </Box>

      <Dialog open={showCreateModal} onClose={() => setShowCreateModal(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 700, fontSize: "1.25rem", color: "#0f172a" }}>Nova Tarefa</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
            <TextField fullWidth label="Título da tarefa *" value={newTaskTitle} onChange={(e) => setNewTaskTitle(e.target.value)} autoFocus />
            <FormControl fullWidth>
              <InputLabel>Prioridade</InputLabel>
              <Select value={newTaskPriority} label="Prioridade" onChange={(e) => setNewTaskPriority(e.target.value as any)}>
                <MenuItem value="Baixa">Baixa</MenuItem>
                <MenuItem value="Média">Média</MenuItem>
                <MenuItem value="Alta">Alta</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => setShowCreateModal(false)} variant="outlined" sx={{ textTransform: "none", borderRadius: 2, fontWeight: 700 }}>Cancelar</Button>
          <Button variant="contained" onClick={handleCreate} disabled={createMutation.isPending || !newTaskTitle.trim()}
            startIcon={createMutation.isPending ? <CircularProgress size={16} /> : <AddIcon />}
            sx={{ bgcolor: "#1877F2", textTransform: "none", fontWeight: 700, borderRadius: 2 }}>
            {createMutation.isPending ? "Criando..." : "Criar"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={showEditModal} onClose={() => setShowEditModal(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 700, fontSize: "1.25rem", color: "#0f172a" }}>Editar Tarefa</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
            <TextField fullWidth label="Título da tarefa *" value={editingItem?.title || ""} onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })} autoFocus />
            <FormControl fullWidth>
              <InputLabel>Prioridade</InputLabel>
              <Select value={editingItem?.priority || "Média"} label="Prioridade" onChange={(e) => setEditingItem({ ...editingItem, priority: e.target.value })}>
                <MenuItem value="Baixa">Baixa</MenuItem>
                <MenuItem value="Média">Média</MenuItem>
                <MenuItem value="Alta">Alta</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => setShowEditModal(false)} variant="outlined" sx={{ textTransform: "none", borderRadius: 2, fontWeight: 700 }}>Cancelar</Button>
          <Button variant="contained" onClick={handleSaveEdit} disabled={updateMutation.isPending || !editingItem?.title?.trim()}
            startIcon={updateMutation.isPending ? <CircularProgress size={16} /> : <EditIcon />}
            sx={{ bgcolor: "#1877F2", textTransform: "none", fontWeight: 700, borderRadius: 2 }}>
            {updateMutation.isPending ? "Salvando..." : "Salvar"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={showDeleteModal} onClose={() => setShowDeleteModal(false)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 700, fontSize: "1.25rem", color: "#0f172a" }}>Excluir Tarefa</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: "#64748b" }}>Tem certeza que deseja excluir esta tarefa? Esta ação não pode ser desfeita.</Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => setShowDeleteModal(false)} variant="outlined" sx={{ textTransform: "none", borderRadius: 2, fontWeight: 700 }}>Cancelar</Button>
          <Button variant="contained" onClick={handleConfirmDelete} disabled={deleteMutation.isPending}
            startIcon={deleteMutation.isPending ? <CircularProgress size={16} /> : <DeleteIcon />}
            sx={{ bgcolor: "#EF4444", textTransform: "none", fontWeight: 700, borderRadius: 2, "&:hover": { bgcolor: "#DC2626" } }}>
            {deleteMutation.isPending ? "Excluindo..." : "Excluir"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export const ProcessChecklistComponent = ({ label, description, context, enabled = true, readOnly = false }: ProcessChecklistComponentProps) => {
  const [collapsed, setCollapsed] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);

  const header = (
    <Box sx={{ px: 2.25, py: 2, bgcolor: "#F8FAFC", borderBottom: "2px solid #E4E6EB", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <Typography sx={{ fontWeight: 700, color: "#0f172a", fontSize: "0.95rem" }}>{label || "Checklist"}</Typography>
        {description && (
          <Tooltip title={description} arrow>
            <InfoIcon sx={{ fontSize: 18, color: "#1877F2", cursor: "help" }} />
          </Tooltip>
        )}
      </Box>
      <Box sx={{ display: "flex", gap: 0.5 }}>
        <Tooltip title="Tela cheia">
          <IconButton size="small" onClick={() => setFullscreen(true)} sx={{ color: "#64748b" }}>
            <FullscreenIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title={collapsed ? "Expandir" : "Recolher"}>
          <IconButton size="small" onClick={() => setCollapsed((v) => !v)} sx={{ color: "#64748b" }}>
            {collapsed ? <ExpandMoreIcon fontSize="small" /> : <ExpandLessIcon fontSize="small" />}
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  );

  return (
    <>
      <Box sx={{ border: "1px solid #E4E6EB", borderRadius: 2, bgcolor: "#fff", overflow: "hidden" }}>
        {header}
        <Collapse in={!collapsed}>
          <ChecklistContent context={context} enabled={enabled} compact readOnly={readOnly} />
        </Collapse>
      </Box>

      <Dialog open={fullscreen} onClose={() => setFullscreen(false)} fullScreen>
        <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
          <Box sx={{ px: 2.25, py: 2, bgcolor: "#F8FAFC", borderBottom: "2px solid #E4E6EB", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Typography sx={{ fontWeight: 700, color: "#0f172a", fontSize: "1.1rem" }}>{label || "Checklist"}</Typography>
              {description && (
                <Tooltip title={description} arrow>
                  <InfoIcon sx={{ fontSize: 18, color: "#1877F2", cursor: "help" }} />
                </Tooltip>
              )}
            </Box>
            <Button onClick={() => setFullscreen(false)} variant="outlined" sx={{ textTransform: "none", fontWeight: 700, borderRadius: 2 }}>Fechar</Button>
          </Box>
          <Box sx={{ flex: 1, overflow: "auto", bgcolor: "#fff" }}>
            <ChecklistContent context={context} enabled={enabled} readOnly={readOnly} />
          </Box>
        </Box>
      </Dialog>
    </>
  );
};
