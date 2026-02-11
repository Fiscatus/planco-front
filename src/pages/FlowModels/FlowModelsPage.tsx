import {
  Box,
  Button,
  TextField,
  Typography,
  Tabs,
  Tab,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  CircularProgress,
  Tooltip,
} from "@mui/material";
import {
  Add as AddIcon,
  Search as SearchIcon,
  Layers as LayersIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  ContentCopy as ContentCopyIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Info as InfoIcon,
} from "@mui/icons-material";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback, useState, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useNotification } from "@/components";
import { useFlowModels, useSearchWithDebounce, useAuth } from "@/hooks";
import type {
  UpdateFlowModelDto,
  FlowModel,
  FlowModelStage,
} from "@/hooks/useFlowModels";
import { Breadcrumbs } from "@/components";
import { CreateFlowModelModal } from "./components/CreateFlowModelModal";
import { FlowModelCard } from "./components/FlowModelCard";
import { StageCard } from "./components/StageCard";
import { EditStageModal } from "./components/EditStageModal";
import { CreateStageModal } from "./components/CreateStageModal";
import { ConfirmDialog } from "./components/ConfirmDialog";
import { useFavoriteFlowModels } from "@/hooks/useFavoriteFlowModels";

type TabValue = "all" | "system" | "mine";

function deepClone<T>(v: T): T {
  return JSON.parse(JSON.stringify(v)) as T;
}

const FlowModelsPage = () => {
  const { showNotification } = useNotification();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [urlParams, setUrlParams] = useSearchParams();

  const { isFavorite } = useFavoriteFlowModels();

  const {
    fetchFlowModels,
    findFlowModelById,
    createFlowModel,
    updateFlowModel,
    deleteFlowModel,
    duplicateFlowModel,
  } = useFlowModels();

  const [selectedTab, setSelectedTab] = useState<TabValue>(
    (urlParams.get("tab") as TabValue) || "all",
  );
  const [selectedModelId, setSelectedModelId] = useState<string | null>(
    urlParams.get("modelId") || null,
  );

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [menuModelId, setMenuModelId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // edição de etapa
  const [editStageOpen, setEditStageOpen] = useState(false);
  const [editingStageId, setEditingStageId] = useState<string | null>(null);
  const [editingStageOriginalId, setEditingStageOriginalId] = useState<
    string | null
  >(null);

  const [createStageOpen, setCreateStageOpen] = useState(false);

  const [isEditMode, setIsEditMode] = useState(false);
  const [draftStages, setDraftStages] = useState<FlowModelStage[] | null>(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

  const {
    search: modelSearch,
    debouncedSearch: debouncedModelSearch,
    handleSearchChange: handleModelSearchChange,
  } = useSearchWithDebounce("search");

  const {
    data: flowModels = [],
    isLoading: modelsLoading,
    error: modelsError,
  } = useQuery({
    queryKey: ["fetchFlowModels"],
    queryFn: async () => {
      return await fetchFlowModels(undefined);
    },
    refetchOnWindowFocus: false,
  });

  const { data: selectedModel, isLoading: selectedModelLoading } =
    useQuery<FlowModel | null>({
      queryKey: ["findFlowModelById", selectedModelId],
      queryFn: async () => {
        if (!selectedModelId) return null;
        return await findFlowModelById(selectedModelId);
      },
      enabled: !!selectedModelId,
      refetchOnWindowFocus: false,
    });

  const filteredModels = useMemo(() => {
    let filtered = flowModels;

    if (debouncedModelSearch) {
      const search = debouncedModelSearch.toLowerCase();
      filtered = filtered.filter((m) => 
        m.name.toLowerCase().includes(search) || m.description?.toLowerCase().includes(search)
      );
    }

    if (selectedTab === "system") {
      filtered = filtered.filter((m) => m.isDefaultPlanco);
    } else if (selectedTab === "mine" && user?._id) {
      filtered = filtered.filter((m) => {
        if (m.isDefaultPlanco) return false;
        const createdById = typeof m.createdBy === "string" ? m.createdBy : m.createdBy?._id;
        return String(createdById || "").trim() === String(user._id).trim();
      });
    } else if (selectedTab === "mine") {
      filtered = [];
    }

    return filtered;
  }, [flowModels, debouncedModelSearch, selectedTab, user?._id]);

  const sortedFilteredModels = useMemo(() => {
    return filteredModels.slice().sort((a, b) => {
      const aSystem = a.isDefaultPlanco ? 1 : 0;
      const bSystem = b.isDefaultPlanco ? 1 : 0;
      if (bSystem !== aSystem) return bSystem - aSystem;

      const aFav = !aSystem && isFavorite(a._id) ? 1 : 0;
      const bFav = !bSystem && isFavorite(b._id) ? 1 : 0;
      if (bFav !== aFav) return bFav - aFav;

      return (a.name || "").localeCompare(b.name || "", "pt-BR", { sensitivity: "base" });
    });
  }, [filteredModels, isFavorite]);

  const stagesToRender = useMemo(() => 
    !selectedModel ? [] : isEditMode ? (draftStages || []) : (selectedModel.stages || [])
  , [selectedModel, isEditMode, draftStages]);

  const totalComponents = useMemo(() => 
    (isEditMode ? (draftStages || []) : (selectedModel?.stages || [])).reduce(
      (acc, stage) => acc + (stage.components?.length || 0), 0
    )
  , [selectedModel?.stages, isEditMode, draftStages]);

  const { mutate: createModelMutation, isPending: creatingModel } = useMutation({
    mutationFn: createFlowModel,
    onSuccess: (newModel) => {
      queryClient.invalidateQueries({ queryKey: ["fetchFlowModels"] });
      showNotification("Modelo criado com sucesso!", "success");
      setCreateModalOpen(false);
      setIsEditMode(false);
      setDraftStages(null);
      setSelectedModelId(newModel._id);
      const newParams = new URLSearchParams();
      newParams.set("modelId", newModel._id);
      newParams.set("tab", "mine");
      setUrlParams(newParams);
      setSelectedTab("mine");
    },
    onError: (error: Error) => showNotification(error?.message || "Erro ao criar modelo", "error"),
  });

  const { mutate: updateModelMutation, isPending: updatingModel } = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateFlowModelDto }) => updateFlowModel(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fetchFlowModels"] });
      queryClient.invalidateQueries({ queryKey: ["findFlowModelById", selectedModelId] });
      showNotification("Modelo atualizado com sucesso!", "success");
      setIsEditMode(false);
      setDraftStages(null);
    },
    onError: (error: Error) => showNotification(error?.message || "Erro ao atualizar modelo", "error"),
  });

  const { mutate: deleteModelMutation, isPending: deletingModel } = useMutation({
    mutationFn: deleteFlowModel,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fetchFlowModels"] });
      showNotification("Modelo excluído com sucesso!", "success");
      if (selectedModelId === menuModelId) {
        setSelectedModelId(null);
        setIsEditMode(false);
        setDraftStages(null);
        const newParams = new URLSearchParams(urlParams);
        newParams.delete("modelId");
        newParams.set("tab", selectedTab);
        setUrlParams(newParams, { replace: true });
      }
      window.location.reload();
    },
    onError: (error: Error) => showNotification(error?.message || "Erro ao excluir modelo", "error"),
  });

  const { mutate: duplicateModelMutation, isPending: duplicatingModel } = useMutation({
    mutationFn: duplicateFlowModel,
    onSuccess: (newModel) => {
      queryClient.invalidateQueries({ queryKey: ["fetchFlowModels"] });
      showNotification("Modelo duplicado com sucesso!", "success");
      setIsEditMode(false);
      setDraftStages(null);
      setSelectedModelId(newModel._id);
      setSelectedTab("mine");
      const newParams = new URLSearchParams();
      newParams.set("tab", "mine");
      newParams.set("modelId", newModel._id);
      setUrlParams(newParams);
      setAnchorEl(null);
      setMenuModelId(null);
    },
    onError: (error: Error) => showNotification(error?.message || "Erro ao duplicar modelo", "error"),
  });

  const handleTabChange = useCallback((_event: React.SyntheticEvent, newValue: TabValue) => {
    const updateTab = () => {
      setSelectedTab(newValue);
      const newParams = new URLSearchParams(urlParams);
      newParams.set("tab", newValue);
      if (selectedModelId) newParams.set("modelId", selectedModelId);
      setUrlParams(newParams);
    };

    if (isEditMode) {
      setPendingAction(() => () => {
        setIsEditMode(false);
        setDraftStages(null);
        updateTab();
      });
      setConfirmDialogOpen(true);
    } else {
      updateTab();
    }
  }, [urlParams, selectedModelId, setUrlParams, isEditMode]);

  const handleModelClick = useCallback((modelId: string) => {
    const selectModel = () => {
      setSelectedModelId(modelId);
      setIsEditMode(false);
      setDraftStages(null);
      const newParams = new URLSearchParams(urlParams);
      newParams.set("modelId", modelId);
      newParams.set("tab", selectedTab);
      setUrlParams(newParams);
    };

    if (isEditMode) {
      setPendingAction(() => selectModel);
      setConfirmDialogOpen(true);
    } else {
      selectModel();
    }
  }, [urlParams, selectedTab, setUrlParams, isEditMode]);

  const handleMenuOpen = useCallback((event: React.MouseEvent<HTMLElement>, modelId: string) => {
    setAnchorEl(event.currentTarget);
    setMenuModelId(modelId);
  }, []);

  const handleMenuClose = useCallback(() => {
    if (duplicatingModel || deletingModel) return;
    setAnchorEl(null);
    setMenuModelId(null);
  }, [duplicatingModel, deletingModel]);

  const handleDelete = useCallback(() => {
    if (!menuModelId) return;
    const model = flowModels.find((m) => m._id === menuModelId);
    if (model?.isDefaultPlanco) {
      showNotification("Não é possível excluir o modelo do sistema.", "info");
      return;
    }
    if (window.confirm("Tem certeza que deseja excluir este modelo?")) {
      deleteModelMutation(menuModelId);
    }
    handleMenuClose();
  }, [menuModelId, flowModels, deleteModelMutation, handleMenuClose, showNotification]);

  const handleDuplicate = useCallback(() => {
    if (menuModelId) duplicateModelMutation(menuModelId);
  }, [menuModelId, duplicateModelMutation]);

  const handleEditFlow = useCallback(() => {
    if (!selectedModel) return;
    if (selectedModel.isDefaultPlanco) {
      showNotification("Este é um modelo do sistema. Duplique para editar.", "info");
      return;
    }
    setDraftStages(deepClone(selectedModel.stages || []));
    setIsEditMode(true);
  }, [selectedModel, showNotification]);

  const handleRevert = useCallback(() => {
    if (selectedModelId) {
      queryClient.invalidateQueries({
        queryKey: ["findFlowModelById", selectedModelId],
      });
      showNotification("Alterações revertidas", "info");
      setDraftStages(null);
      setIsEditMode(false);
    }
  }, [selectedModelId, queryClient, showNotification]);

  const handleSave = useCallback(() => {
    if (!selectedModelId) return;
    if (!draftStages) {
      showNotification("Nada para salvar.", "info");
      setIsEditMode(false);
      return;
    }

    const stageIds = draftStages.map((s) => s.stageId);
    if (stageIds.length !== new Set(stageIds).size) {
      showNotification("Existem etapas com stageId repetido.", "error");
      return;
    }

    const stageOrders = draftStages.map((s) => s.order);
    if (stageOrders.length !== new Set(stageOrders).size) {
      showNotification("Existem etapas com order repetido.", "error");
      return;
    }

    for (const st of draftStages) {
      const keys = (st.components || []).map((c) => c.key);
      if (keys.length !== new Set(keys).size) {
        showNotification(
          `Etapa "${st.name}": existe componente com key repetida.`,
          "error",
        );
        return;
      }

      const compOrders = (st.components || []).map((c) => c.order);
      if (compOrders.length !== new Set(compOrders).size) {
        showNotification(
          `Etapa "${st.name}": existe componente com order repetida.`,
          "error",
        );
        return;
      }
    }

    updateModelMutation({
      id: selectedModelId,
      data: { stages: draftStages },
    });
  }, [selectedModelId, draftStages, updateModelMutation, showNotification]);

  const handleCreateCard = useCallback(() => {
    if (!isEditMode) {
      showNotification("Clique em “Editar Fluxo” para adicionar etapas.", "info");
      return;
    }
    setCreateStageOpen(true);
  }, [isEditMode, showNotification]);

  const handleViewDetails = useCallback((stageId: string) => {
    setEditingStageId(stageId);
    setEditingStageOriginalId(stageId);
    setEditStageOpen(true);
  }, []);

  const handleCloseEditStageModal = useCallback(() => {
    setEditStageOpen(false);
    setEditingStageId(null);
    setEditingStageOriginalId(null);
  }, []);

  const handleSaveStageInDraft = useCallback((updatedStage: FlowModelStage) => {
    if (!isEditMode) return;

    setDraftStages((prev) => {
      const base = prev?.slice() || [];
      const originalId = editingStageOriginalId || updatedStage.stageId;
      const idx = base.findIndex((s) => s.stageId === originalId);

      if (base.some((s, i) => i !== idx && s.stageId === updatedStage.stageId)) {
        showNotification("Já existe uma etapa com esse stageId.", "error");
        return prev;
      }

      // Apenas valida order se não for opcional
      if (!updatedStage.isOptional && base.some((s, i) => i !== idx && s.order === updatedStage.order && !s.isOptional)) {
        showNotification("Já existe uma etapa com essa ordem (order).", "error");
        return prev;
      }

      if (idx === -1) return [...base, updatedStage];
      base[idx] = updatedStage;
      return base;
    });

    showNotification("Etapa atualizada no rascunho. Clique em Salvar para enviar ao backend.", "success");
  }, [isEditMode, showNotification, editingStageOriginalId]);

  const normalizeOrders = useCallback((stages: FlowModelStage[]) => 
    stages.slice().sort((a, b) => a.order - b.order).map((s, idx) => ({ ...s, order: idx + 1 }))
  , []);

  const handleDeleteStage = useCallback((stageId: string) => {
    if (!isEditMode) return;
    setDraftStages((prev) => {
      const arr = prev?.slice() || [];
      return normalizeOrders(arr.filter((s) => s.stageId !== stageId));
    });
    showNotification("Etapa removida do rascunho. Clique em Salvar para aplicar.", "info");
  }, [isEditMode, normalizeOrders, showNotification]);

  const handleMoveStage = useCallback((activeId: string, overId: string) => {
    if (!isEditMode) return;
    setDraftStages((prev) => {
      if (!prev) return prev;
      const arr = prev.slice().sort((a, b) => a.order - b.order);
      const activeIndex = arr.findIndex((s) => s.stageId === activeId);
      const overIndex = arr.findIndex((s) => s.stageId === overId);
      if (activeIndex === -1 || overIndex === -1 || activeIndex === overIndex) return prev;
      const reordered = [...arr];
      const [moved] = reordered.splice(activeIndex, 1);
      reordered.splice(overIndex, 0, moved);
      return reordered.map((s, idx) => ({ ...s, order: idx + 1 }));
    });
  }, [isEditMode]);

  const handleEditStage = useCallback((stage: FlowModelStage) => {
    setEditingStageId(stage.stageId);
    setEditingStageOriginalId(stage.stageId);
    setEditStageOpen(true);
  }, []);

  const handleCreateStage = useCallback((newStage: FlowModelStage) => {
    if (!isEditMode) return;
    setDraftStages((prev) => {
      const base = prev?.slice() || [];
      if (base.some((s) => s.stageId === newStage.stageId)) {
        showNotification("Já existe uma etapa com esse stageId.", "error");
        return prev;
      }
      
      // Recalcula order se não for opcional
      let finalStage = newStage;
      if (!newStage.isOptional) {
        const normalStages = base.filter(s => !s.isOptional);
        const maxOrder = normalStages.length > 0 ? Math.max(...normalStages.map(s => s.order)) : 0;
        finalStage = { ...newStage, order: maxOrder + 1 };
      }
      
      return [...base, finalStage];
    });
    setCreateStageOpen(false);
    showNotification("Etapa criada no rascunho. Clique em Salvar para enviar ao backend.", "success");
  }, [isEditMode, showNotification]);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isEditMode) {
        e.preventDefault();
        e.returnValue = "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isEditMode]);

  useEffect(() => {
    if (!selectedModelId && sortedFilteredModels.length > 0) {
      const firstModel = sortedFilteredModels[0];
      setIsEditMode(false);
      setDraftStages(null);
      const newParams = new URLSearchParams(urlParams);
      newParams.set("modelId", firstModel._id);
      newParams.set("tab", selectedTab);
      setUrlParams(newParams, { replace: true });
    }
  }, [selectedModelId, sortedFilteredModels, urlParams, selectedTab, setUrlParams]);

  return (
    <Box
      sx={{
        display: "flex",
        height: "calc(100vh - 64px)",
        overflow: "hidden",
        position: "relative",
        bgcolor: "#f4f6f8",
      }}
    >
      <Box
        sx={{
          width: sidebarOpen ? { xs: "100%", sm: 360 } : 56,
          bgcolor: "background.paper",
          borderRight: 1,
          borderColor: "#E4E6EB",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)",
          transition: "width 0.3s ease",
          position: { xs: "absolute", sm: "relative" },
          zIndex: { xs: 10, sm: 1 },
          height: "100%",
        }}
      >
        {!sidebarOpen && (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              p: 2,
              borderBottom: 1,
              borderColor: "#E4E6EB",
              bgcolor: "#FAFBFC",
            }}
          >
            <IconButton
              onClick={() => setSidebarOpen(true)}
              size="small"
              sx={{
                color: "#1877F2",
                "&:hover": { bgcolor: "#E7F3FF" },
              }}
            >
              <ChevronRightIcon />
            </IconButton>
          </Box>
        )}
        <Box
          sx={{
            p: 3,
            borderBottom: 1,
            borderColor: "#E4E6EB",
            bgcolor: "#FAFBFC",
            display: sidebarOpen ? "block" : "none",
          }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 2.5,
            }}
          >
            <Box>
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 700,
                  color: "#212121",
                  fontSize: "1.375rem",
                }}
              >
                Modelos
              </Typography>
              <Typography
                variant="body2"
                sx={{ color: "#616161", mt: 0.5, fontSize: "0.875rem" }}
              >
                Fluxos de trabalho
              </Typography>
            </Box>
            <IconButton
              onClick={() => setSidebarOpen(false)}
              size="small"
              sx={{ color: "#1877F2", "&:hover": { bgcolor: "#E7F3FF" } }}
            >
              <ChevronLeftIcon />
            </IconButton>
          </Box>

          <Box
            sx={{ display: "flex", flexDirection: "column", gap: 1.5, mb: 2.5 }}
          >
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setCreateModalOpen(true)}
              fullWidth
              sx={{
                bgcolor: "#1877F2",
                "&:hover": { bgcolor: "#166FE5" },
                textTransform: "none",
                fontWeight: 600,
                py: 1.25,
                borderRadius: 2,
                boxShadow: "none",
                fontSize: "0.875rem",
              }}
            >
              Novo Modelo
            </Button>
          </Box>

          <TextField
            fullWidth
            placeholder="Buscar modelos..."
            value={modelSearch}
            onChange={(e) => handleModelSearchChange(e.target.value)}
            InputProps={{
              startAdornment: (
                <SearchIcon sx={{ color: "#8A8D91", mr: 1, fontSize: 20 }} />
              ),
            }}
            size="small"
            sx={{
              mb: 2.5,
              "& .MuiOutlinedInput-root": {
                bgcolor: "#F0F2F5",
                borderRadius: 2,
                "& fieldset": { borderColor: "#E4E6EB" },
                "&:hover fieldset": { borderColor: "#D8DADF" },
                "&.Mui-focused fieldset": {
                  borderColor: "#1877F2",
                  borderWidth: "1.5px",
                },
              },
              "& .MuiInputBase-input::placeholder": {
                color: "#8A8D91",
                opacity: 1,
              },
            }}
          />

          <Tabs
            value={selectedTab}
            onChange={handleTabChange}
            sx={{
              borderBottom: 1,
              borderColor: "#E4E6EB",
              minHeight: 40,
              "& .MuiTab-root": {
                minHeight: 40,
                textTransform: "none",
                fontWeight: 600,
                fontSize: "0.875rem",
                color: "#616161",
                "&.Mui-selected": { color: "#1877F2" },
              },
              "& .MuiTabs-indicator": { bgcolor: "#1877F2", height: 3 },
            }}
          >
            <Tab label="Todos" value="all" />
            <Tab label="Sistema" value="system" />
            <Tab label="Meus" value="mine" />
          </Tabs>
        </Box>

        <Box
          sx={{
            flex: 1,
            overflow: "auto",
            p: 2,
            bgcolor: "background.paper",
            display: sidebarOpen ? "block" : "none",
          }}
        >
          {modelsLoading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
              <CircularProgress size={24} sx={{ color: "#1877F2" }} />
            </Box>
          ) : modelsError ? (
            <Typography
              variant="body2"
              sx={{ textAlign: "center", py: 4, color: "#F02849" }}
            >
              Erro ao carregar modelos
            </Typography>
          ) : sortedFilteredModels.length === 0 ? (
            <Typography
              variant="body2"
              sx={{ textAlign: "center", py: 4, color: "#616161" }}
            >
              Nenhum modelo encontrado
            </Typography>
          ) : (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
              {sortedFilteredModels.map((model) => (
                <FlowModelCard
                  key={model._id}
                  model={model}
                  isSelected={selectedModelId === model._id}
                  onClick={() => handleModelClick(model._id)}
                  onMenuClick={(e) => handleMenuOpen(e, model._id)}
                  hideMenu={false}
                />
              ))}
            </Box>
          )}
        </Box>
      </Box>

      <Box
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          bgcolor: "#f4f6f8",
        }}
      >
        {selectedModelLoading ? (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              flex: 1,
            }}
          >
            <CircularProgress sx={{ color: "#1877F2" }} />
          </Box>
        ) : selectedModel ? (
          <>
            {(() => {
              const isDefaultPlanco = selectedModel.isDefaultPlanco === true;

              return (
                <Box
                  sx={{
                    p: 4,
                    borderBottom: 1,
                    borderColor: "#E4E6EB",
                    bgcolor: "background.paper",
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      mb: 3,
                    }}
                  >
                    <Box sx={{ flex: 1 }}>
                      <Breadcrumbs />
                      <Typography
                        variant="h4"
                        sx={{
                          fontWeight: 700,
                          color: "#212121",
                          mb: 1.5,
                          fontSize: "1.75rem",
                        }}
                      >
                        {selectedModel.name}
                      </Typography>

                      <Typography
                        variant="body1"
                        sx={{
                          color: "#616161",
                          mb: 2.5,
                          fontSize: "0.9375rem",
                          lineHeight: 1.6,
                        }}
                      >
                        {selectedModel.description || "Sem descrição"}
                      </Typography>

                      <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap" }}>
                        <Chip
                          label={
                            selectedModel.isDefaultPlanco ? "Sistema" : "Pessoal"
                          }
                          size="small"
                          sx={{
                            bgcolor: "#F0F2F5",
                            color: "#212121",
                            fontWeight: 600,
                            fontSize: "0.75rem",
                            height: 24,
                          }}
                        />
                        <Chip
                          icon={
                            <LayersIcon
                              sx={{ fontSize: 14, color: "#1877F2" }}
                            />
                          }
                          label={`${selectedModel.stages?.length || 0} Etapas`}
                          size="small"
                          sx={{
                            bgcolor: "#E7F3FF",
                            color: "#1877F2",
                            fontWeight: 600,
                            fontSize: "0.75rem",
                            height: 24,
                            "& .MuiChip-icon": { ml: 0.5 },
                          }}
                        />
                        <Chip
                          icon={
                            <LayersIcon
                              sx={{ fontSize: 14, color: "#1877F2" }}
                            />
                          }
                          label={`${totalComponents} Componentes`}
                          size="small"
                          sx={{
                            bgcolor: "#E7F3FF",
                            color: "#1877F2",
                            fontWeight: 600,
                            fontSize: "0.75rem",
                            height: 24,
                            "& .MuiChip-icon": { ml: 0.5 },
                          }}
                        />
                      </Box>
                    </Box>

                    <Box sx={{ display: "flex", gap: 1.5, alignItems: "center" }}>
                      {isDefaultPlanco ? (
                        <Button
                          variant="contained"
                          startIcon={<ContentCopyIcon />}
                          onClick={() => duplicateModelMutation(selectedModel._id)}
                          disabled={duplicatingModel}
                          sx={{
                            bgcolor: "#1877F2",
                            "&:hover": { bgcolor: "#166FE5" },
                            textTransform: "none",
                            fontWeight: 600,
                            borderRadius: 2,
                            boxShadow: "none",
                            px: 3,
                          }}
                        >
                          {duplicatingModel ? (
                            <CircularProgress size={20} sx={{ color: "#fff" }} />
                          ) : (
                            "Duplicar"
                          )}
                        </Button>
                      ) : isEditMode ? (
                        <>
                          <Button
                            variant="text"
                            onClick={handleRevert}
                            disabled={updatingModel}
                            sx={{
                              textTransform: "none",
                              fontWeight: 600,
                              color: "#616161",
                              "&:hover": { bgcolor: "#F0F2F5" },
                            }}
                          >
                            Reverter
                          </Button>

                          <Button
                            variant="contained"
                            onClick={handleSave}
                            disabled={updatingModel}
                            sx={{
                              bgcolor: "#1877F2",
                              "&:hover": { bgcolor: "#166FE5" },
                              textTransform: "none",
                              fontWeight: 600,
                              borderRadius: 2,
                              boxShadow: "none",
                              px: 3,
                            }}
                          >
                            {updatingModel ? (
                              <CircularProgress size={20} sx={{ color: "#fff" }} />
                            ) : (
                              "Salvar"
                            )}
                          </Button>
                        </>
                      ) : (
                        <Button
                          variant="contained"
                          startIcon={<EditIcon />}
                          onClick={handleEditFlow}
                          sx={{
                            bgcolor: "#1877F2",
                            "&:hover": { bgcolor: "#166FE5" },
                            textTransform: "none",
                            fontWeight: 600,
                            borderRadius: 2,
                            boxShadow: "none",
                            px: 3,
                          }}
                        >
                          Editar Fluxo
                        </Button>
                      )}
                    </Box>
                  </Box>

                  {!isDefaultPlanco && isEditMode && (
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1.5,
                        pt: 3,
                        borderTop: 1,
                        borderColor: "#E4E6EB",
                      }}
                    >
                      <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={handleCreateCard}
                        sx={{
                          bgcolor: "#1877F2",
                          "&:hover": { bgcolor: "#166FE5" },
                          textTransform: "none",
                          fontWeight: 600,
                          borderRadius: 2,
                          boxShadow: "none",
                          px: 2.5,
                          height: 40,
                        }}
                      >
                        Criar Card
                      </Button>
                      <Chip
                        label="Modo de Edição Ativo"
                        sx={{
                          bgcolor: "#FEF3C7",
                          color: "#92400E",
                          fontWeight: 700,
                          fontSize: "0.875rem",
                          height: 40,
                          px: 1,
                        }}
                      />
                      {stagesToRender.some(stage => stage.isOptional) && (
                        <Tooltip 
                          title="Etapas opcionais ficam disponíveis para serem adicionados dinamicamente durante a execução do processo pelo criador" 
                          arrow
                          placement="top"
                        >
                          <Chip
                            icon={<InfoIcon sx={{ fontSize: 16, color: "#9333EA" }} />}
                            label="Etapas Opcionais Disponíveis"
                            sx={{
                              bgcolor: "#FAF5FF",
                              color: "#9333EA",
                              fontWeight: 700,
                              fontSize: "0.875rem",
                              height: 40,
                              px: 1,
                              border: "1px solid #E9D5FF",
                              cursor: "help",
                            }}
                          />
                        </Tooltip>
                      )}
                    </Box>
                  )}
                </Box>
              );
            })()}

            <Box sx={{ flex: 1, overflow: "auto", p: 4, bgcolor: "#f4f6f8" }}>
              {stagesToRender && stagesToRender.length > 0 ? (
                <Box sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  {/* Cards Normais */}
                  <Box>
                    <Typography sx={{ fontWeight: 700, fontSize: "1.125rem", color: "#212121", mb: 2 }}>
                      Etapas do Fluxo
                    </Typography>
                    <Box
                      sx={{
                        display: "grid",
                        gridTemplateColumns: {
                          xs: "1fr",
                          sm: "repeat(auto-fill, minmax(280px, 1fr))",
                          md: "repeat(auto-fill, minmax(320px, 1fr))",
                          lg: "repeat(auto-fill, minmax(340px, 1fr))",
                        },
                        gap: 3,
                      }}
                    >
                      {stagesToRender
                        .filter(stage => !stage.isOptional)
                        .slice()
                        .sort((a, b) => a.order - b.order)
                        .map((stage) => (
                          <StageCard
                            key={stage.stageId || String(stage.order)}
                            stage={stage}
                            isEditMode={isEditMode}
                            onEditStage={handleEditStage}
                            onDeleteStage={handleDeleteStage}
                            onDuplicateStage={handleCreateStage}
                            onDragEnd={handleMoveStage}
                          />
                        ))}
                    </Box>
                  </Box>

                  {/* Etapas Opcionais */}
                  {stagesToRender.some(stage => stage.isOptional) && (
                    <Box>
                      <Typography sx={{ fontWeight: 700, fontSize: "1.125rem", color: "#9333EA", mb: 2 }}>
                        Etapas Opcionais
                      </Typography>
                      <Box
                        sx={{
                          display: "grid",
                          gridTemplateColumns: {
                            xs: "1fr",
                            sm: "repeat(auto-fill, minmax(280px, 1fr))",
                            md: "repeat(auto-fill, minmax(320px, 1fr))",
                            lg: "repeat(auto-fill, minmax(340px, 1fr))",
                          },
                          gap: 3,
                        }}
                      >
                        {stagesToRender
                          .filter(stage => stage.isOptional)
                          .map((stage) => (
                            <StageCard
                              key={stage.stageId || String(stage.order)}
                              stage={stage}
                              isEditMode={isEditMode}
                              onEditStage={handleEditStage}
                              onDeleteStage={handleDeleteStage}
                              onDuplicateStage={handleCreateStage}
                              onDragEnd={handleMoveStage}
                            />
                          ))}
                      </Box>
                    </Box>
                  )}
                </Box>
              ) : (
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    height: "100%",
                    color: "#616161",
                    bgcolor: "background.paper",
                    borderRadius: 2,
                    p: 4,
                  }}
                >
                  <Typography
                    variant="h6"
                    sx={{ mb: 1, color: "#212121", fontWeight: 600 }}
                  >
                    Nenhuma etapa cadastrada
                  </Typography>
                  <Typography variant="body2" sx={{ color: "#616161" }}>
                    Clique em "Criar Card" para adicionar uma nova etapa ao modelo
                  </Typography>
                </Box>
              )}
            </Box>
          </>
        ) : (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              flex: 1,
              color: "#616161",
              bgcolor: "background.paper",
              m: 4,
              borderRadius: 2,
            }}
          >
            <Typography
              variant="h6"
              sx={{ mb: 1, color: "#212121", fontWeight: 600 }}
            >
              Nenhum modelo selecionado
            </Typography>
            <Typography variant="body2" sx={{ color: "#616161" }}>
              Selecione um modelo da lista ou crie um novo
            </Typography>
          </Box>
        )}
      </Box>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        {menuModelId &&
          (() => {
            const model = flowModels.find((m) => m._id === menuModelId);
            const isSystem = model?.isDefaultPlanco === true;

            return (
              <>
                <MenuItem onClick={handleDuplicate} disabled={duplicatingModel || deletingModel}>
                  <ContentCopyIcon sx={{ mr: 1, fontSize: 20 }} />
                  {duplicatingModel ? "Duplicando..." : "Duplicar"}
                </MenuItem>

                {!isSystem && (
                  <MenuItem onClick={handleDelete} disabled={deletingModel || duplicatingModel}>
                    <DeleteIcon sx={{ mr: 1, fontSize: 20 }} />
                    {deletingModel ? "Excluindo..." : "Excluir"}
                  </MenuItem>
                )}
              </>
            );
          })()}
      </Menu>

      <CreateFlowModelModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSave={(data) => createModelMutation(data)}
        loading={creatingModel}
      />

      <EditStageModal
        open={editStageOpen}
        onClose={handleCloseEditStageModal}
        stage={
          editingStageId
            ? stagesToRender.find((s) => s.stageId === editingStageId) || null
            : null
        }
        onSaveStage={handleSaveStageInDraft}
        editable={!selectedModel?.isDefaultPlanco && isEditMode}
      />

      <CreateStageModal
        open={createStageOpen}
        existingStages={stagesToRender || []}
        onClose={() => setCreateStageOpen(false)}
        onCreate={handleCreateStage}
      />
      <ConfirmDialog
        open={confirmDialogOpen}
        onClose={() => {
          setConfirmDialogOpen(false);
          setPendingAction(null);
        }}
        onConfirm={() => {
          if (pendingAction) pendingAction();
          setConfirmDialogOpen(false);
          setPendingAction(null);
        }}
        title="Alterações não salvas"
        message="Você está no modo de edição. As alterações não salvas serão perdidas. Deseja continuar?"
      />
    </Box>
  );
};

export default FlowModelsPage;
