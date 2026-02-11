import { useState, useMemo } from "react";
import {
  Box,
  Typography,
  IconButton,
  Button,
  Checkbox,
  Chip,
  MenuItem,
  Select,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  CheckCircle as CheckCircleIcon,
  RadioButtonUnchecked as UncheckedIcon,
  Info as InfoIcon,
} from "@mui/icons-material";

type Priority = "Alta" | "Média" | "Baixa";

type ChecklistItem = {
  id: string;
  title: string;
  priority: Priority;
  completed: boolean;
  createdAt: string;
};

type ChecklistComponentProps = {
  config?: Record<string, unknown>;
  label?: string;
  description?: string;
};

const PRIORITY_COLORS: Record<Priority, string> = {
  Alta: "#EF4444",
  Média: "#F59E0B",
  Baixa: "#10B981",
};

const MOCK_ITEMS: ChecklistItem[] = [
  { id: "1", title: "Revisar documentação técnica", priority: "Alta", completed: false, createdAt: "2025-01-15T09:00:00Z" },
  { id: "2", title: "Aprovar orçamento do projeto", priority: "Alta", completed: true, createdAt: "2025-01-14T14:30:00Z" },
  { id: "3", title: "Agendar reunião com equipe", priority: "Média", completed: false, createdAt: "2025-01-13T10:00:00Z" },
  { id: "4", title: "Atualizar planilha de custos", priority: "Baixa", completed: true, createdAt: "2025-01-12T16:00:00Z" },
];

export const ChecklistComponent = ({ label, description }: ChecklistComponentProps) => {
  const [items, setItems] = useState<ChecklistItem[]>(MOCK_ITEMS);
  const [search, setSearch] = useState("");
  const [priorityFilter, setPriorityFilter] = useState<Priority | "Todas">("Todas");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ChecklistItem | null>(null);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesSearch = item.title.toLowerCase().includes(search.toLowerCase());
      const matchesPriority = priorityFilter === "Todas" || item.priority === priorityFilter;
      return matchesSearch && matchesPriority;
    });
  }, [items, search, priorityFilter]);

  const stats = useMemo(() => {
    const total = items.length;
    const completed = items.filter((i) => i.completed).length;
    return { total, completed, percentage: total > 0 ? Math.round((completed / total) * 100) : 0 };
  }, [items]);

  const handleToggle = (id: string) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, completed: !item.completed } : item))
    );
  };

  const handleOpenDialog = (item?: ChecklistItem) => {
    setEditingItem(item || null);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingItem(null);
  };

  return (
    <Box sx={{ bgcolor: "#fff", borderRadius: 2, border: "1px solid #E4E6EB", overflow: "hidden" }}>
      <Box sx={{ px: 3, py: 2, bgcolor: "#FAFBFC", borderBottom: "1px solid #E4E6EB" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
          <Typography sx={{ fontWeight: 700, color: "#0f172a", fontSize: "1.125rem" }}>
            {label || "Checklist"}
          </Typography>
          {description && (
            <Tooltip title={description} arrow>
              <InfoIcon sx={{ fontSize: 18, color: "#1877F2", cursor: "help" }} />
            </Tooltip>
          )}
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
          <Box sx={{ flex: 1, display: "flex", alignItems: "center", gap: 1, bgcolor: "#F8FAFC", border: "1px solid #E4E6EB", borderRadius: 2, px: 2, py: 1, cursor: "not-allowed" }}>
            <SearchIcon sx={{ color: "#94a3b8", fontSize: 20 }} />
            <input
              type="text"
              placeholder="Pesquisar tarefas (bloqueado no preview)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              disabled
              style={{
                border: "none",
                outline: "none",
                flex: 1,
                fontSize: "14px",
                fontFamily: "inherit",
                color: "#94a3b8",
                backgroundColor: "transparent",
                cursor: "not-allowed",
              }}
            />
          </Box>
          <Select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value as Priority | "Todas")}
            size="small"
            sx={{
              minWidth: 140,
              bgcolor: "#fff",
              borderRadius: 2,
              "& .MuiOutlinedInput-notchedOutline": { borderColor: "#E4E6EB" },
              "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#CBD5E1" },
              "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#1877F2" },
            }}
          >
            <MenuItem value="Todas">Todas</MenuItem>
            <MenuItem value="Alta">Alta</MenuItem>
            <MenuItem value="Média">Média</MenuItem>
            <MenuItem value="Baixa">Baixa</MenuItem>
          </Select>
        </Box>

        <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
          <Box sx={{ flex: 1, bgcolor: "#E5E7EB", borderRadius: 1, height: 8, overflow: "hidden" }}>
            <Box
              sx={{
                width: `${stats.percentage}%`,
                height: "100%",
                bgcolor: "#10B981",
                transition: "width 0.3s ease",
              }}
            />
          </Box>
          <Typography variant="body2" sx={{ color: "#64748b", fontWeight: 600, minWidth: 80 }}>
            {stats.completed}/{stats.total} ({stats.percentage}%)
          </Typography>
        </Box>
      </Box>

      <Box sx={{ maxHeight: 400, overflowY: "auto", px: 3, py: 2 }}>
        {filteredItems.length === 0 ? (
          <Box sx={{ textAlign: "center", py: 4 }}>
            <Typography variant="body2" sx={{ color: "#64748b" }}>
              {search || priorityFilter !== "Todas" ? "Nenhuma tarefa encontrada" : "Nenhuma tarefa ainda"}
            </Typography>
          </Box>
        ) : (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            {filteredItems.map((item) => (
              <Box
                key={item.id}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                  p: 1.5,
                  bgcolor: item.completed ? "#F8FAFC" : "#fff",
                  border: "1px solid #E4E6EB",
                  borderRadius: 2,
                  transition: "all 0.2s",
                  "&:hover": { borderColor: "#CBD5E1", bgcolor: "#FAFBFC" },
                }}
              >
                <Checkbox
                  checked={item.completed}
                  onChange={() => handleToggle(item.id)}
                  icon={<UncheckedIcon />}
                  checkedIcon={<CheckCircleIcon />}
                  sx={{
                    color: "#CBD5E1",
                    "&.Mui-checked": { color: "#10B981" },
                  }}
                />
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography
                    sx={{
                      color: item.completed ? "#94a3b8" : "#0f172a",
                      textDecoration: item.completed ? "line-through" : "none",
                      fontWeight: 500,
                      fontSize: "0.9375rem",
                    }}
                  >
                    {item.title}
                  </Typography>
                </Box>
                <Chip
                  label={item.priority}
                  size="small"
                  sx={{
                    bgcolor: `${PRIORITY_COLORS[item.priority]}15`,
                    color: PRIORITY_COLORS[item.priority],
                    fontWeight: 700,
                    fontSize: "0.75rem",
                    height: 24,
                  }}
                />
                <Tooltip title="Editar">
                  <IconButton
                    size="small"
                    onClick={() => handleOpenDialog(item)}
                    sx={{ color: "#64748b", "&:hover": { color: "#1877F2", bgcolor: "#F0F7FF" } }}
                  >
                    <EditIcon sx={{ fontSize: 18 }} />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Excluir (preview)">
                  <IconButton
                    size="small"
                    disabled
                    sx={{ color: "#64748b", opacity: 0.5 }}
                  >
                    <DeleteIcon sx={{ fontSize: 18 }} />
                  </IconButton>
                </Tooltip>
              </Box>
            ))}
          </Box>
        )}
      </Box>

      <Box sx={{ px: 3, py: 2, borderTop: "1px solid #E4E6EB", bgcolor: "#FAFBFC", display: "flex", justifyContent: "flex-end" }}>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
          sx={{
            bgcolor: "#1877F2",
            color: "#fff",
            textTransform: "none",
            fontWeight: 700,
            borderRadius: 2,
            "&:hover": { bgcolor: "#166FE5" },
          }}
        >
          Nova Tarefa
        </Button>
      </Box>

      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, color: "#0f172a" }}>
          {editingItem ? "Editar Tarefa" : "Nova Tarefa"}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
            <TextField
              label="Título da Tarefa"
              value={editingItem?.title || ""}
              fullWidth
              disabled
              placeholder="Digite o título da tarefa (bloqueado no preview)..."
            />
            <Box>
              <Typography variant="body2" sx={{ color: "#64748b", mb: 1, fontWeight: 600 }}>
                Prioridade
              </Typography>
              <Select
                value={editingItem?.priority || "Média"}
                fullWidth
                disabled
              >
                <MenuItem value="Alta">
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Box sx={{ width: 12, height: 12, borderRadius: "50%", bgcolor: PRIORITY_COLORS.Alta }} />
                    Alta
                  </Box>
                </MenuItem>
                <MenuItem value="Média">
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Box sx={{ width: 12, height: 12, borderRadius: "50%", bgcolor: PRIORITY_COLORS.Média }} />
                    Média
                  </Box>
                </MenuItem>
                <MenuItem value="Baixa">
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Box sx={{ width: 12, height: 12, borderRadius: "50%", bgcolor: PRIORITY_COLORS.Baixa }} />
                    Baixa
                  </Box>
                </MenuItem>
              </Select>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleCloseDialog} sx={{ color: "white", textTransform: "none" }}>
            Cancelar
          </Button>
          <Button
            variant="contained"
            disabled
            sx={{
              bgcolor: "#1877F2",
              textTransform: "none",
              fontWeight: 600,
              "&:disabled": { bgcolor: "#CBD5E1" },
            }}
          >
            {editingItem ? "Salvar (preview)" : "Criar (preview)"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
