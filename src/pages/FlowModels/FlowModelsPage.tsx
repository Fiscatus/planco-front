import {
  Add as AddIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  ContentCopy as ContentCopyIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Layers as LayersIcon,
  Search as SearchIcon
} from '@mui/icons-material';
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  IconButton,
  Menu,
  MenuItem,
  Tab,
  Tabs,
  TextField,
  Typography
} from '@mui/material';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Breadcrumbs, useNotification } from '@/components';
import { useAuth, useFlowModels, useSearchWithDebounce } from '@/hooks';
import { useFavoriteFlowModels } from '@/hooks/useFavoriteFlowModels';
import type { FlowModel, FlowModelStage, UpdateFlowModelDto } from '@/hooks/useFlowModels';
import { ConfirmDialog } from './components/ConfirmDialog';
import { CreateFlowModelModal } from './components/CreateFlowModelModal';
import { CreateStageModal } from './components/CreateStageModal';
import { EditStageModal } from './components/EditStageModal';
import { FlowModelCard } from './components/FlowModelCard';
import { StageCard } from './components/StageCard';

type TabValue = 'all' | 'system' | 'mine';

function deepClone<T>(v: T): T {
  return JSON.parse(JSON.stringify(v)) as T;
}

const FlowModelsPage = () => {
  const { showNotification } = useNotification();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [urlParams, setUrlParams] = useSearchParams();

  const { isFavorite } = useFavoriteFlowModels();

  const { fetchFlowModels, findFlowModelById, createFlowModel, updateFlowModel, deleteFlowModel, duplicateFlowModel } =
    useFlowModels();

  const [selectedTab, setSelectedTab] = useState<TabValue>((urlParams.get('tab') as TabValue) || 'all');
  const [selectedModelId, setSelectedModelId] = useState<string | null>(urlParams.get('modelId') || null);

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [menuModelId, setMenuModelId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // edição de etapa
  const [editStageOpen, setEditStageOpen] = useState(false);
  const [editingStageId, setEditingStageId] = useState<string | null>(null);
  const [editingStageOriginalId, setEditingStageOriginalId] = useState<string | null>(null);

  const [createStageOpen, setCreateStageOpen] = useState(false);

  const [isEditMode, setIsEditMode] = useState(false);
  const [draftStages, setDraftStages] = useState<FlowModelStage[] | null>(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

  const {
    search: modelSearch,
    debouncedSearch: debouncedModelSearch,
    handleSearchChange: handleModelSearchChange
  } = useSearchWithDebounce('search');

  const {
    data: flowModels = [],
    isLoading: modelsLoading,
    error: modelsError
  } = useQuery({
    queryKey: ['fetchFlowModels'],
    queryFn: async () => {
      return await fetchFlowModels(undefined);
    },
    refetchOnWindowFocus: false
  });

  const { data: selectedModel, isLoading: selectedModelLoading } = useQuery<FlowModel | null>({
    queryKey: ['findFlowModelById', selectedModelId],
    queryFn: async () => {
      if (!selectedModelId) return null;
      return await findFlowModelById(selectedModelId);
    },
    enabled: !!selectedModelId,
    refetchOnWindowFocus: false
  });

  const filteredModels = useMemo(() => {
    let filtered = flowModels;

    if (debouncedModelSearch) {
      const search = debouncedModelSearch.toLowerCase();
      filtered = filtered.filter(
        (m) => m.name.toLowerCase().includes(search) || m.description?.toLowerCase().includes(search)
      );
    }

    if (selectedTab === 'system') {
      filtered = filtered.filter((m) => m.isDefaultPlanco);
    } else if (selectedTab === 'mine' && user?._id) {
      filtered = filtered.filter((m) => {
        if (m.isDefaultPlanco) return false;
        const createdById = typeof m.createdBy === 'string' ? m.createdBy : m.createdBy?._id;
        return String(createdById || '').trim() === String(user._id).trim();
      });
    } else if (selectedTab === 'mine') {
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

      return (a.name || '').localeCompare(b.name || '', 'pt-BR', { sensitivity: 'base' });
    });
  }, [filteredModels, isFavorite]);

  const stagesToRender = useMemo(
    () => (!selectedModel ? [] : isEditMode ? draftStages || [] : selectedModel.stages || []),
    [selectedModel, isEditMode, draftStages]
  );

  const totalComponents = useMemo(
    () =>
      (isEditMode ? draftStages || [] : selectedModel?.stages || []).reduce(
        (acc, stage) => acc + (stage.components?.length || 0),
        0
      ),
    [selectedModel?.stages, isEditMode, draftStages]
  );

  const { mutate: createModelMutation, isPending: creatingModel } = useMutation({
    mutationFn: createFlowModel,
    onSuccess: (newModel) => {
      queryClient.invalidateQueries({ queryKey: ['fetchFlowModels'] });
      showNotification('Modelo criado com sucesso!', 'success');
      setCreateModalOpen(false);
      setIsEditMode(false);
      setDraftStages(null);
      setSelectedModelId(newModel._id);
      const newParams = new URLSearchParams();
      newParams.set('modelId', newModel._id);
      newParams.set('tab', 'mine');
      setUrlParams(newParams);
      setSelectedTab('mine');
    },
    onError: (error: Error) => showNotification(error?.message || 'Erro ao criar modelo', 'error')
  });

  const { mutate: updateModelMutation, isPending: updatingModel } = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateFlowModelDto }) => updateFlowModel(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fetchFlowModels'] });
      queryClient.invalidateQueries({ queryKey: ['findFlowModelById', selectedModelId] });
      showNotification('Modelo atualizado com sucesso!', 'success');
      setIsEditMode(false);
      setDraftStages(null);
    },
    onError: (error: Error) => showNotification(error?.message || 'Erro ao atualizar modelo', 'error')
  });

  const { mutate: deleteModelMutation, isPending: deletingModel } = useMutation({
    mutationFn: deleteFlowModel,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fetchFlowModels'] });
      showNotification('Modelo excluído com sucesso!', 'success');
      if (selectedModelId === menuModelId) {
        setSelectedModelId(null);
        setIsEditMode(false);
        setDraftStages(null);
        const newParams = new URLSearchParams(urlParams);
        newParams.delete('modelId');
        newParams.set('tab', selectedTab);
        setUrlParams(newParams, { replace: true });
      }
    },
    onError: (error: Error) => showNotification(error?.message || 'Erro ao excluir modelo', 'error')
  });

  const { mutate: duplicateModelMutation, isPending: duplicatingModel } = useMutation({
    mutationFn: duplicateFlowModel,
    onSuccess: (newModel) => {
      queryClient.invalidateQueries({ queryKey: ['fetchFlowModels'] });
      showNotification('Modelo duplicado com sucesso!', 'success');
      setIsEditMode(false);
      setDraftStages(null);
      setSelectedModelId(newModel._id);
      setSelectedTab('mine');
      const newParams = new URLSearchParams();
      newParams.set('tab', 'mine');
      newParams.set('modelId', newModel._id);
      setUrlParams(newParams);
      setAnchorEl(null);
      setMenuModelId(null);
    },
    onError: (error: Error) => showNotification(error?.message || 'Erro ao duplicar modelo', 'error')
  });

  const handleTabChange = useCallback(
    (_event: React.SyntheticEvent, newValue: TabValue) => {
      const updateTab = () => {
        setSelectedTab(newValue);
        const newParams = new URLSearchParams(urlParams);
        newParams.set('tab', newValue);
        if (selectedModelId) newParams.set('modelId', selectedModelId);
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
    },
    [urlParams, selectedModelId, setUrlParams, isEditMode]
  );

  const handleModelClick = useCallback(
    (modelId: string) => {
      const selectModel = () => {
        setSelectedModelId(modelId);
        setIsEditMode(false);
        setDraftStages(null);
        const newParams = new URLSearchParams(urlParams);
        newParams.set('modelId', modelId);
        newParams.set('tab', selectedTab);
        setUrlParams(newParams);
      };

      if (isEditMode) {
        setPendingAction(() => selectModel);
        setConfirmDialogOpen(true);
      } else {
        selectModel();
      }
    },
    [urlParams, selectedTab, setUrlParams, isEditMode]
  );

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
      showNotification('Não é possível excluir o modelo do sistema.', 'info');
      return;
    }
    if (window.confirm('Tem certeza que deseja excluir este modelo?')) {
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
      showNotification('Este é um modelo do sistema. Duplique para editar.', 'info');
      return;
    }
    setDraftStages(deepClone(selectedModel.stages || []));
    setIsEditMode(true);
  }, [selectedModel, showNotification]);

  const handleRevert = useCallback(() => {
    if (selectedModelId) {
      queryClient.invalidateQueries({
        queryKey: ['findFlowModelById', selectedModelId]
      });
      showNotification('Alterações revertidas', 'info');
      setDraftStages(null);
      setIsEditMode(false);
    }
  }, [selectedModelId, queryClient, showNotification]);

  const handleSave = useCallback(() => {
    if (!selectedModelId) return;
    if (!draftStages) {
      showNotification('Nada para salvar.', 'info');
      setIsEditMode(false);
      return;
    }

    const stageIds = draftStages.map((s) => s.stageId);
    if (stageIds.length !== new Set(stageIds).size) {
      showNotification('Existem etapas com stageId repetido.', 'error');
      return;
    }

    const stageOrders = draftStages.map((s) => s.order);
    if (stageOrders.length !== new Set(stageOrders).size) {
      showNotification('Existem etapas com order repetido.', 'error');
      return;
    }

    for (const st of draftStages) {
      const keys = (st.components || []).map((c) => c.key);
      if (keys.length !== new Set(keys).size) {
        showNotification(`Etapa "${st.name}": existe componente com key repetida.`, 'error');
        return;
      }

      const compOrders = (st.components || []).map((c) => c.order);
      if (compOrders.length !== new Set(compOrders).size) {
        showNotification(`Etapa "${st.name}": existe componente com order repetida.`, 'error');
        return;
      }
    }

    updateModelMutation({
      id: selectedModelId,
      data: { stages: draftStages }
    });
  }, [selectedModelId, draftStages, updateModelMutation, showNotification]);

  const handleCreateCard = useCallback(() => {
    if (!isEditMode) {
      showNotification('Clique em “Editar Fluxo” para adicionar etapas.', 'info');
      return;
    }
    setCreateStageOpen(true);
  }, [isEditMode, showNotification]);

  const _handleViewDetails = useCallback((stageId: string) => {
    setEditingStageId(stageId);
    setEditingStageOriginalId(stageId);
    setEditStageOpen(true);
  }, []);

  const handleCloseEditStageModal = useCallback(() => {
    setEditStageOpen(false);
    setEditingStageId(null);
    setEditingStageOriginalId(null);
  }, []);

  const handleSaveStageInDraft = useCallback(
    (updatedStage: FlowModelStage) => {
      if (!isEditMode) return;

      setDraftStages((prev) => {
        const base = prev?.slice() || [];
        const originalId = editingStageOriginalId || updatedStage.stageId;
        const idx = base.findIndex((s) => s.stageId === originalId);

        if (base.some((s, i) => i !== idx && s.stageId === updatedStage.stageId)) {
          showNotification('Já existe uma etapa com esse stageId.', 'error');
          return prev;
        }

        if (base.some((s, i) => i !== idx && s.order === updatedStage.order)) {
          showNotification('Já existe uma etapa com essa ordem (order).', 'error');
          return prev;
        }

        if (idx === -1) return [...base, updatedStage];
        base[idx] = updatedStage;
        return base;
      });

      showNotification('Etapa atualizada no rascunho. Clique em Salvar para enviar ao backend.', 'success');
    },
    [isEditMode, showNotification, editingStageOriginalId]
  );

  const normalizeOrders = useCallback(
    (stages: FlowModelStage[]) =>
      stages
        .slice()
        .sort((a, b) => a.order - b.order)
        .map((s, idx) => ({ ...s, order: idx + 1 })),
    []
  );

  const handleDeleteStage = useCallback(
    (stageId: string) => {
      if (!isEditMode) return;
      setDraftStages((prev) => {
        const arr = prev?.slice() || [];
        return normalizeOrders(arr.filter((s) => s.stageId !== stageId));
      });
      showNotification('Etapa removida do rascunho. Clique em Salvar para aplicar.', 'info');
    },
    [isEditMode, normalizeOrders, showNotification]
  );

  const handleMoveStage = useCallback(
    (activeId: string, overId: string) => {
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
    },
    [isEditMode]
  );

  const handleEditStage = useCallback((stage: FlowModelStage) => {
    setEditingStageId(stage.stageId);
    setEditingStageOriginalId(stage.stageId);
    setEditStageOpen(true);
  }, []);

  const handleCreateStage = useCallback(
    (newStage: FlowModelStage) => {
      if (!isEditMode) return;
      setDraftStages((prev) => {
        const base = prev?.slice() || [];
        if (base.some((s) => s.stageId === newStage.stageId)) {
          showNotification('Já existe uma etapa com esse stageId.', 'error');
          return prev;
        }
        if (base.some((s) => s.order === newStage.order)) {
          showNotification('Já existe uma etapa com essa ordem (order).', 'error');
          return prev;
        }
        return [...base, newStage];
      });
      setCreateStageOpen(false);
      showNotification('Etapa criada no rascunho. Clique em Salvar para enviar ao backend.', 'success');
    },
    [isEditMode, showNotification]
  );

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isEditMode) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isEditMode]);

  useEffect(() => {
    if (!selectedModelId && sortedFilteredModels.length > 0) {
      const firstModel = sortedFilteredModels[0];
      setIsEditMode(false);
      setDraftStages(null);
      const newParams = new URLSearchParams(urlParams);
      newParams.set('modelId', firstModel._id);
      newParams.set('tab', selectedTab);
      setUrlParams(newParams, { replace: true });
    }
  }, [selectedModelId, sortedFilteredModels, urlParams, selectedTab, setUrlParams]);

  return (
    <Box
      sx={{
        display: 'flex',
        height: 'calc(100vh - 64px)',
        overflow: 'hidden',
        position: 'relative',
        bgcolor: 'background.default'
      }}
    >
      <Box
        sx={{
          width: sidebarOpen ? { xs: '100%', sm: 360 } : 56,
          bgcolor: 'background.paper',
          borderRight: 1,
          borderColor: 'divider',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
          transition: 'width 0.3s ease',
          position: { xs: 'absolute', sm: 'relative' },
          zIndex: { xs: 10, sm: 1 },
          height: '100%'
        }}
      >
        {!sidebarOpen && (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              p: 2,
              borderBottom: 1,
              borderColor: 'divider',
              bgcolor: 'grey.50'
            }}
          >
            <IconButton
              onClick={() => setSidebarOpen(true)}
              size='small'
              sx={{
                color: 'primary.main',
                '&:hover': { bgcolor: 'secondary.light' }
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
            borderColor: 'divider',
            bgcolor: 'grey.50',
            display: sidebarOpen ? 'block' : 'none'
          }}
        >
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mb: 2.5
            }}
          >
            <Box>
              <Typography
                variant='h5'
                sx={{
                  fontWeight: 700,
                  color: 'text.primary',
                  fontSize: '1.375rem'
                }}
              >
                Modelos
              </Typography>
              <Typography
                variant='body2'
                sx={{ color: 'text.secondary', mt: 0.5, fontSize: '0.875rem' }}
              >
                Fluxos de trabalho
              </Typography>
            </Box>
            <IconButton
              onClick={() => setSidebarOpen(false)}
              size='small'
              sx={{ color: 'primary.main', '&:hover': { bgcolor: 'secondary.light' } }}
            >
              <ChevronLeftIcon />
            </IconButton>
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mb: 2.5 }}>
            <Button
              variant='contained'
              startIcon={<AddIcon />}
              onClick={() => setCreateModalOpen(true)}
              fullWidth
              sx={{
                bgcolor: 'primary.main',
                '&:hover': { bgcolor: 'primary.dark' },
                textTransform: 'none',
                fontWeight: 600,
                py: 1.25,
                borderRadius: 2,
                boxShadow: 'none',
                fontSize: '0.875rem'
              }}
            >
              Novo Modelo
            </Button>
          </Box>

          <TextField
            fullWidth
            placeholder='Buscar modelos...'
            value={modelSearch}
            onChange={(e) => handleModelSearchChange(e.target.value)}
            InputProps={{
              startAdornment: <SearchIcon sx={{ color: 'text.disabled', mr: 1, fontSize: 20 }} />
            }}
            size='small'
            sx={{
              mb: 2.5,
              '& .MuiOutlinedInput-root': {
                bgcolor: 'grey.100',
                borderRadius: 2,
                '& fieldset': { borderColor: 'divider' },
                '&:hover fieldset': { borderColor: 'grey.300' },
                '&.Mui-focused fieldset': {
                  borderColor: 'primary.main',
                  borderWidth: '1.5px'
                }
              },
              '& .MuiInputBase-input::placeholder': {
                color: 'text.disabled',
                opacity: 1
              }
            }}
          />

          <Tabs
            value={selectedTab}
            onChange={handleTabChange}
            sx={{
              borderBottom: 1,
              borderColor: 'divider',
              minHeight: 40,
              '& .MuiTab-root': {
                minHeight: 40,
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '0.875rem',
                color: 'text.secondary',
                '&.Mui-selected': { color: 'primary.main' }
              },
              '& .MuiTabs-indicator': { bgcolor: 'primary.main', height: 3 }
            }}
          >
            <Tab
              label='Todos'
              value='all'
            />
            <Tab
              label='Sistema'
              value='system'
            />
            <Tab
              label='Meus'
              value='mine'
            />
          </Tabs>
        </Box>

        <Box
          sx={{
            flex: 1,
            overflow: 'auto',
            p: 2,
            bgcolor: 'background.paper',
            display: sidebarOpen ? 'block' : 'none'
          }}
        >
          {modelsLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress
                size={24}
                sx={{ color: 'primary.main' }}
              />
            </Box>
          ) : modelsError ? (
            <Typography
              variant='body2'
              sx={{ textAlign: 'center', py: 4, color: 'error.main' }}
            >
              Erro ao carregar modelos
            </Typography>
          ) : sortedFilteredModels.length === 0 ? (
            <Typography
              variant='body2'
              sx={{ textAlign: 'center', py: 4, color: 'text.secondary' }}
            >
              Nenhum modelo encontrado
            </Typography>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
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
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          bgcolor: 'background.default'
        }}
      >
        {selectedModelLoading ? (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              flex: 1
            }}
          >
            <CircularProgress sx={{ color: 'primary.main' }} />
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
                    borderColor: 'divider',
                    bgcolor: 'background.paper'
                  }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      mb: 3
                    }}
                  >
                    <Box sx={{ flex: 1 }}>
                      <Breadcrumbs />
                      <Typography
                        variant='h4'
                        sx={{
                          fontWeight: 700,
                          color: 'text.primary',
                          mb: 1.5,
                          fontSize: '1.75rem'
                        }}
                      >
                        {selectedModel.name}
                      </Typography>

                      <Typography
                        variant='body1'
                        sx={{
                          color: 'text.secondary',
                          mb: 2.5,
                          fontSize: '0.9375rem',
                          lineHeight: 1.6
                        }}
                      >
                        {selectedModel.description || 'Sem descrição'}
                      </Typography>

                      <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
                        <Chip
                          label={selectedModel.isDefaultPlanco ? 'Sistema' : 'Pessoal'}
                          size='small'
                          sx={{
                            bgcolor: 'grey.100',
                            color: 'text.primary',
                            fontWeight: 600,
                            fontSize: '0.75rem',
                            height: 24
                          }}
                        />
                        <Chip
                          icon={<LayersIcon sx={{ fontSize: 14, color: 'primary.main' }} />}
                          label={`${selectedModel.stages?.length || 0} Etapas`}
                          size='small'
                          sx={{
                            bgcolor: 'secondary.light',
                            color: 'primary.main',
                            fontWeight: 600,
                            fontSize: '0.75rem',
                            height: 24,
                            '& .MuiChip-icon': { ml: 0.5 }
                          }}
                        />
                        <Chip
                          icon={<LayersIcon sx={{ fontSize: 14, color: 'primary.main' }} />}
                          label={`${totalComponents} Componentes`}
                          size='small'
                          sx={{
                            bgcolor: 'secondary.light',
                            color: 'primary.main',
                            fontWeight: 600,
                            fontSize: '0.75rem',
                            height: 24,
                            '& .MuiChip-icon': { ml: 0.5 }
                          }}
                        />
                      </Box>
                    </Box>

                    <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
                      {isDefaultPlanco ? (
                        <Button
                          variant='contained'
                          startIcon={<ContentCopyIcon />}
                          onClick={() => duplicateModelMutation(selectedModel._id)}
                          disabled={duplicatingModel}
                          sx={{
                            bgcolor: 'primary.main',
                            '&:hover': { bgcolor: 'primary.dark' },
                            textTransform: 'none',
                            fontWeight: 600,
                            borderRadius: 2,
                            boxShadow: 'none',
                            px: 3
                          }}
                        >
                          {duplicatingModel ? (
                            <CircularProgress
                              size={20}
                              sx={{ color: 'common.white' }}
                            />
                          ) : (
                            'Duplicar'
                          )}
                        </Button>
                      ) : isEditMode ? (
                        <>
                          <Button
                            variant='text'
                            onClick={handleRevert}
                            disabled={updatingModel}
                            sx={{
                              textTransform: 'none',
                              fontWeight: 600,
                              color: 'text.secondary',
                              '&:hover': { bgcolor: 'grey.100' }
                            }}
                          >
                            Reverter
                          </Button>

                          <Button
                            variant='contained'
                            onClick={handleSave}
                            disabled={updatingModel}
                            sx={{
                              bgcolor: 'primary.main',
                              '&:hover': { bgcolor: 'primary.dark' },
                              textTransform: 'none',
                              fontWeight: 600,
                              borderRadius: 2,
                              boxShadow: 'none',
                              px: 3
                            }}
                          >
                            {updatingModel ? (
                              <CircularProgress
                                size={20}
                                sx={{ color: 'common.white' }}
                              />
                            ) : (
                              'Salvar'
                            )}
                          </Button>
                        </>
                      ) : (
                        <Button
                          variant='contained'
                          startIcon={<EditIcon />}
                          onClick={handleEditFlow}
                          sx={{
                            bgcolor: 'primary.main',
                            '&:hover': { bgcolor: 'primary.dark' },
                            textTransform: 'none',
                            fontWeight: 600,
                            borderRadius: 2,
                            boxShadow: 'none',
                            px: 3
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
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1.5,
                        pt: 3,
                        borderTop: 1,
                        borderColor: 'divider'
                      }}
                    >
                      <Button
                        variant='contained'
                        startIcon={<AddIcon />}
                        onClick={handleCreateCard}
                        sx={{
                          bgcolor: 'primary.main',
                          '&:hover': { bgcolor: 'primary.dark' },
                          textTransform: 'none',
                          fontWeight: 600,
                          borderRadius: 2,
                          boxShadow: 'none',
                          px: 2.5,
                          height: 40
                        }}
                      >
                        Criar Card
                      </Button>
                      <Chip
                        label='Modo de Edição Ativo'
                        sx={{
                          bgcolor: 'warning.light',
                          color: 'warning.dark',
                          fontWeight: 700,
                          fontSize: '0.875rem',
                          height: 40,
                          px: 1
                        }}
                      />
                    </Box>
                  )}
                </Box>
              );
            })()}

            <Box sx={{ flex: 1, overflow: 'auto', p: 4, bgcolor: 'background.default' }}>
              {stagesToRender && stagesToRender.length > 0 ? (
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: {
                      xs: '1fr',
                      sm: 'repeat(auto-fill, minmax(280px, 1fr))',
                      md: 'repeat(auto-fill, minmax(320px, 1fr))',
                      lg: 'repeat(auto-fill, minmax(340px, 1fr))'
                    },
                    gap: 3
                  }}
                >
                  {stagesToRender
                    .slice()
                    .sort((a, b) => a.order - b.order)
                    .map((stage) => (
                      <StageCard
                        key={stage.stageId || String(stage.order)}
                        stage={stage}
                        isEditMode={isEditMode}
                        onEditStage={handleEditStage}
                        onDeleteStage={handleDeleteStage}
                        onDragEnd={handleMoveStage}
                      />
                    ))}
                </Box>
              ) : (
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '100%',
                    color: 'text.secondary',
                    bgcolor: 'background.paper',
                    borderRadius: 2,
                    p: 4
                  }}
                >
                  <Typography
                    variant='h6'
                    sx={{ mb: 1, color: 'text.primary', fontWeight: 600 }}
                  >
                    Nenhuma etapa cadastrada
                  </Typography>
                  <Typography
                    variant='body2'
                    sx={{ color: 'text.secondary' }}
                  >
                    Clique em "Criar Card" para adicionar uma nova etapa ao modelo
                  </Typography>
                </Box>
              )}
            </Box>
          </>
        ) : (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              flex: 1,
              color: 'text.secondary',
              bgcolor: 'background.paper',
              m: 4,
              borderRadius: 2
            }}
          >
            <Typography
              variant='h6'
              sx={{ mb: 1, color: 'text.primary', fontWeight: 600 }}
            >
              Nenhum modelo selecionado
            </Typography>
            <Typography
              variant='body2'
              sx={{ color: 'text.secondary' }}
            >
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
                <MenuItem
                  onClick={handleDuplicate}
                  disabled={duplicatingModel || deletingModel}
                >
                  <ContentCopyIcon sx={{ mr: 1, fontSize: 20 }} />
                  {duplicatingModel ? 'Duplicando...' : 'Duplicar'}
                </MenuItem>

                {!isSystem && (
                  <MenuItem
                    onClick={handleDelete}
                    disabled={deletingModel || duplicatingModel}
                  >
                    <DeleteIcon sx={{ mr: 1, fontSize: 20 }} />
                    {deletingModel ? 'Excluindo...' : 'Excluir'}
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
        stage={editingStageId ? stagesToRender.find((s) => s.stageId === editingStageId) || null : null}
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
        title='Alterações não salvas'
        message='Você está no modo de edição. As alterações não salvas serão perdidas. Deseja continuar?'
      />
    </Box>
  );
};

export default FlowModelsPage;
