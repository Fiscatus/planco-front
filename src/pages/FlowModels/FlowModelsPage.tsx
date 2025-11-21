import {
  Box,
  Button,
  Card,
  TextField,
  Typography,
  Tabs,
  Tab,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  CircularProgress
} from '@mui/material';
import {
  Add as AddIcon,
  ContentCopy as ContentCopyIcon,
  Search as SearchIcon,
  MoreVert as MoreVertIcon,
  Star as StarIcon,
  Schedule as ScheduleIcon,
  Layers as LayersIcon,
  Save as SaveIcon,
  Reorder as ReorderIcon,
  Visibility as VisibilityIcon,
  Delete as DeleteIcon,
  Edit as EditIcon
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback, useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useNotification } from '@/components';
import { useFlowModels, useSearchWithDebounce, useAuth } from '@/hooks';
import type { FlowModel, CreateFlowModelDto, UpdateFlowModelDto } from '@/hooks/useFlowModels';
import { Breadcrumbs } from '@/components';
import { CreateFlowModelModal } from './components/CreateFlowModelModal';
import { FlowModelCard } from './components/FlowModelCard';
import { StageCard } from './components/StageCard';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/pt-br';

dayjs.extend(relativeTime);
dayjs.locale('pt-br');

type TabValue = 'all' | 'system' | 'mine';

const FlowModelsPage = () => {
  const { showNotification } = useNotification();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [urlParams, setUrlParams] = useSearchParams();
  const { fetchFlowModels, findFlowModelById, createFlowModel, updateFlowModel, deleteFlowModel, duplicateFlowModel } = useFlowModels();

  const [selectedTab, setSelectedTab] = useState<TabValue>((urlParams.get('tab') as TabValue) || 'all');
  const [selectedModelId, setSelectedModelId] = useState<string | null>(urlParams.get('modelId') || null);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [menuModelId, setMenuModelId] = useState<string | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);

  const {
    search: modelSearch,
    debouncedSearch: debouncedModelSearch,
    handleSearchChange: handleModelSearchChange
  } = useSearchWithDebounce('search');

  // Buscar todos os modelos
  const {
    data: flowModels = [],
    isLoading: modelsLoading,
    error: modelsError
  } = useQuery({
    queryKey: ['fetchFlowModels', selectedTab],
    queryFn: async () => {
      const isActive = selectedTab === 'all' ? undefined : true;
      return await fetchFlowModels(isActive);
    }
  });

  // Buscar modelo selecionado
  const {
    data: selectedModel,
    isLoading: selectedModelLoading
  } = useQuery({
    queryKey: ['findFlowModelById', selectedModelId],
    queryFn: async () => {
      if (!selectedModelId) return null;
      return await findFlowModelById(selectedModelId);
    },
    enabled: !!selectedModelId
  });

  // Filtrar modelos por busca e tab
  const filteredModels = useMemo(() => {
    let filtered = flowModels;

    // Filtrar por busca
    if (debouncedModelSearch) {
      filtered = filtered.filter(
        (model) =>
          model.name.toLowerCase().includes(debouncedModelSearch.toLowerCase()) ||
          model.description?.toLowerCase().includes(debouncedModelSearch.toLowerCase())
      );
    }

    // Filtrar por tab
    if (selectedTab === 'system') {
      // Aba Sistema: mostrar apenas modelos padrão Planco
      filtered = filtered.filter((model) => model.isDefaultPlanco === true);
    } else if (selectedTab === 'mine') {
      // Aba Meus: mostrar apenas modelos criados pelo usuário, EXCETO modelos padrão Planco
      const currentUserId = user?._id;
      if (currentUserId) {
        filtered = filtered.filter((model) => {
          // Excluir modelos padrão Planco da aba "Meus"
          if (model.isDefaultPlanco === true) {
            return false;
          }
          
          // Comparar tanto o _id do createdBy quanto converter para string para garantir compatibilidade
          const createdById = model.createdBy?._id;
          if (!createdById) return false;
          
          // Normalizar ambos os IDs para string e comparar
          const normalizedCreatedById = String(createdById).trim();
          const normalizedCurrentUserId = String(currentUserId).trim();
          
          return normalizedCreatedById === normalizedCurrentUserId;
        });
      } else {
        // Se não houver usuário, não mostrar nenhum modelo
        filtered = [];
      }
    }

    return filtered;
  }, [flowModels, debouncedModelSearch, selectedTab, user?._id]);

  // Calcular total de dias úteis
  const totalBusinessDays = useMemo(() => {
    if (!selectedModel?.stages) return 0;
    return selectedModel.stages.reduce((total, stage) => total + (stage.durationDays || 0), 0);
  }, [selectedModel]);

  // Mutation para criar modelo
  const { mutate: createModelMutation, isPending: creatingModel } = useMutation({
    mutationFn: async (data: CreateFlowModelDto) => {
      return await createFlowModel(data);
    },
    onSuccess: (newModel) => {
      queryClient.invalidateQueries({ queryKey: ['fetchFlowModels'] });
      showNotification('Modelo criado com sucesso!', 'success');
      setCreateModalOpen(false);
      setSelectedModelId(newModel._id);
      // Mudar para a aba "Meus" após criar um modelo, para que o usuário veja o modelo criado
      const newParams = new URLSearchParams();
      newParams.set('modelId', newModel._id);
      newParams.set('tab', 'mine');
      setUrlParams(newParams);
      setSelectedTab('mine');
    },
    onError: (error: any) => {
      showNotification(error?.response?.data?.message || 'Erro ao criar modelo', 'error');
    }
  });

  // Mutation para atualizar modelo
  const { mutate: updateModelMutation, isPending: updatingModel } = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateFlowModelDto }) => {
      return await updateFlowModel(id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fetchFlowModels'] });
      queryClient.invalidateQueries({ queryKey: ['findFlowModelById', selectedModelId] });
      showNotification('Modelo atualizado com sucesso!', 'success');
    },
    onError: (error: any) => {
      showNotification(error?.response?.data?.message || 'Erro ao atualizar modelo', 'error');
    }
  });

  // Mutation para deletar modelo
  const { mutate: deleteModelMutation, isPending: deletingModel } = useMutation({
    mutationFn: async (id: string) => {
      return await deleteFlowModel(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fetchFlowModels'] });
      showNotification('Modelo excluído com sucesso!', 'success');
      if (selectedModelId === menuModelId) {
        setSelectedModelId(null);
        setUrlParams({ tab: selectedTab });
      }
    },
    onError: (error: any) => {
      showNotification(error?.response?.data?.message || 'Erro ao excluir modelo', 'error');
    }
  });

  // Mutation para duplicar modelo
  const { mutate: duplicateModelMutation, isPending: duplicatingModel } = useMutation({
    mutationFn: async (id: string) => {
      return await duplicateFlowModel(id);
    },
    onSuccess: (duplicatedModel) => {
      queryClient.invalidateQueries({ queryKey: ['fetchFlowModels'] });
      showNotification('Modelo duplicado com sucesso!', 'success');
      setSelectedModelId(duplicatedModel._id);
      setUrlParams({ modelId: duplicatedModel._id, tab: selectedTab });
    },
    onError: (error: any) => {
      showNotification(error?.response?.data?.message || 'Erro ao duplicar modelo', 'error');
    }
  });

  const handleTabChange = useCallback((_event: React.SyntheticEvent, newValue: TabValue) => {
    setSelectedTab(newValue);
    const newParams = new URLSearchParams(urlParams);
    newParams.set('tab', newValue);
    if (selectedModelId) {
      newParams.set('modelId', selectedModelId);
    }
    setUrlParams(newParams);
  }, [urlParams, selectedModelId, setUrlParams]);

  const handleModelClick = useCallback((modelId: string) => {
    setSelectedModelId(modelId);
    const newParams = new URLSearchParams(urlParams);
    newParams.set('modelId', modelId);
    newParams.set('tab', selectedTab);
    setUrlParams(newParams);
  }, [urlParams, selectedTab, setUrlParams]);

  const handleMenuOpen = useCallback((event: React.MouseEvent<HTMLElement>, modelId: string) => {
    // Não abrir menu para modelos padrão Planco
    const model = flowModels.find(m => m._id === modelId);
    if (model?.isDefaultPlanco === true) {
      return;
    }
    setAnchorEl(event.currentTarget);
    setMenuModelId(modelId);
  }, [flowModels]);

  const handleMenuClose = useCallback(() => {
    setAnchorEl(null);
    setMenuModelId(null);
  }, []);

  const handleDuplicate = useCallback(() => {
    if (menuModelId) {
      duplicateModelMutation(menuModelId);
    }
    handleMenuClose();
  }, [menuModelId, duplicateModelMutation, handleMenuClose]);

  const handleDelete = useCallback(() => {
    if (menuModelId) {
      if (window.confirm('Tem certeza que deseja excluir este modelo?')) {
        deleteModelMutation(menuModelId);
      }
    }
    handleMenuClose();
  }, [menuModelId, deleteModelMutation, handleMenuClose]);


  const handleEditFlow = useCallback(() => {
    setIsEditMode(true);
  }, []);

  const handleRevert = useCallback(() => {
    if (selectedModelId) {
      queryClient.invalidateQueries({ queryKey: ['findFlowModelById', selectedModelId] });
      showNotification('Alterações revertidas', 'info');
      setIsEditMode(false);
    }
  }, [selectedModelId, queryClient, showNotification]);

  const handleSave = useCallback(() => {
    if (!selectedModelId || !selectedModel) return;
    // Aqui você pode implementar a lógica de salvar alterações
    showNotification('Alterações salvas com sucesso!', 'success');
    setIsEditMode(false);
  }, [selectedModelId, selectedModel, showNotification]);

  const handleCreateCard = useCallback(() => {
    showNotification('Funcionalidade de criar card em desenvolvimento', 'info');
  }, [showNotification]);

  const handleReorderCards = useCallback(() => {
    showNotification('Funcionalidade de reordenar cards em desenvolvimento', 'info');
  }, [showNotification]);

  const handleSaveDraft = useCallback(() => {
    showNotification('Funcionalidade de salvar rascunho em desenvolvimento', 'info');
  }, [showNotification]);

  const handleViewDetails = useCallback((stageOrder: number) => {
    showNotification(`Visualizar detalhes da etapa ${stageOrder} em desenvolvimento`, 'info');
  }, [showNotification]);

  // Selecionar primeiro modelo se nenhum estiver selecionado
  useEffect(() => {
    if (!selectedModelId && filteredModels.length > 0) {
      const firstModel = filteredModels[0];
      const newParams = new URLSearchParams(urlParams);
      newParams.set('modelId', firstModel._id);
      newParams.set('tab', selectedTab);
      setUrlParams(newParams, { replace: true });
    }
  }, [selectedModelId, filteredModels, urlParams, selectedTab, setUrlParams]);

  return (
    <Box sx={{ display: 'flex', height: 'calc(100vh - 64px)', overflow: 'hidden', position: 'relative', bgcolor: '#f4f6f8' }}>
      {/* Sidebar */}
      <Box
        sx={{
          width: 360,
          bgcolor: 'background.paper',
          borderRight: 1,
          borderColor: '#E4E6EB',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
        }}
      >
        {/* Header */}
        <Box sx={{ p: 3, borderBottom: 1, borderColor: '#E4E6EB', bgcolor: '#FAFBFC' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5 }}>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 700, color: '#212121', fontSize: '1.375rem' }}>
                Modelos
              </Typography>
              <Typography variant="body2" sx={{ color: '#616161', mt: 0.5, fontSize: '0.875rem' }}>
                Fluxos de trabalho
              </Typography>
            </Box>
            <IconButton 
              size="small" 
              sx={{ 
                color: '#616161',
                '&:hover': { bgcolor: '#F0F2F5' }
              }}
            >
              <LayersIcon />
            </IconButton>
          </Box>

          {/* Botões de ação */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mb: 2.5 }}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setCreateModalOpen(true)}
              fullWidth
              sx={{
                bgcolor: '#1877F2',
                '&:hover': { bgcolor: '#166FE5' },
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
            <Button
              variant="outlined"
              startIcon={<ContentCopyIcon />}
              onClick={() => {
                if (selectedModelId) {
                  duplicateModelMutation(selectedModelId);
                } else {
                  showNotification('Selecione um modelo para duplicar', 'warning');
                }
              }}
              disabled={!selectedModelId || duplicatingModel}
              fullWidth
              sx={{
                textTransform: 'none',
                fontWeight: 600,
                py: 1.25,
                borderColor: '#E4E6EB',
                color: '#212121',
                borderRadius: 2,
                fontSize: '0.875rem',
                '&:hover': {
                  borderColor: '#1877F2',
                  bgcolor: '#F0F9FF'
                },
                '&:disabled': {
                  borderColor: '#E4E6EB',
                  color: '#A0A4A8'
                }
              }}
            >
              Duplicar Fiscatus
            </Button>
          </Box>

          {/* Busca */}
          <TextField
            fullWidth
            placeholder="Buscar modelos..."
            value={modelSearch}
            onChange={(e) => handleModelSearchChange(e.target.value)}
            InputProps={{
              startAdornment: <SearchIcon sx={{ color: '#8A8D91', mr: 1, fontSize: 20 }} />
            }}
            size="small"
            sx={{
              mb: 2.5,
              '& .MuiOutlinedInput-root': {
                bgcolor: '#F0F2F5',
                borderRadius: 2,
                '& fieldset': {
                  borderColor: '#E4E6EB'
                },
                '&:hover fieldset': {
                  borderColor: '#D8DADF'
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#1877F2',
                  borderWidth: '1.5px'
                }
              },
              '& .MuiInputBase-input::placeholder': {
                color: '#8A8D91',
                opacity: 1
              }
            }}
          />

          {/* Tabs */}
          <Tabs
            value={selectedTab}
            onChange={handleTabChange}
            sx={{
              borderBottom: 1,
              borderColor: '#E4E6EB',
              minHeight: 40,
              '& .MuiTab-root': {
                minHeight: 40,
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '0.875rem',
                color: '#616161',
                '&.Mui-selected': {
                  color: '#1877F2'
                }
              },
              '& .MuiTabs-indicator': {
                bgcolor: '#1877F2',
                height: 3
              }
            }}
          >
            <Tab label="Todos" value="all" />
            <Tab label="Sistema" value="system" />
            <Tab label="Meus" value="mine" />
          </Tabs>
        </Box>

        {/* Lista de modelos */}
        <Box sx={{ flex: 1, overflow: 'auto', p: 2, bgcolor: 'background.paper' }}>
          {modelsLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress size={24} sx={{ color: '#1877F2' }} />
            </Box>
          ) : modelsError ? (
            <Typography variant="body2" sx={{ textAlign: 'center', py: 4, color: '#F02849' }}>
              Erro ao carregar modelos
            </Typography>
          ) : filteredModels.length === 0 ? (
            <Typography variant="body2" sx={{ textAlign: 'center', py: 4, color: '#616161' }}>
              Nenhum modelo encontrado
            </Typography>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {filteredModels.map((model) => (
                <FlowModelCard
                  key={model._id}
                  model={model}
                  isSelected={selectedModelId === model._id}
                  onClick={() => handleModelClick(model._id)}
                  onMenuClick={(e) => handleMenuOpen(e, model._id)}
                  hideMenu={model.isDefaultPlanco === true}
                />
              ))}
            </Box>
          )}
        </Box>
      </Box>

      {/* Área principal */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', bgcolor: '#f4f6f8' }}>
        {selectedModelLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1 }}>
            <CircularProgress sx={{ color: '#1877F2' }} />
          </Box>
        ) : selectedModel ? (
          <>
            {/* Verificar se é modelo padrão Planco */}
            {(() => {
              const isDefaultPlanco = selectedModel.isDefaultPlanco === true;
              return (
                <>
                  {/* Header */}
                  <Box sx={{ p: 4, borderBottom: 1, borderColor: '#E4E6EB', bgcolor: 'background.paper' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
                      <Box sx={{ flex: 1 }}>
                        <Breadcrumbs />
                        <Typography variant="h4" sx={{ fontWeight: 700, color: '#212121', mb: 1.5, fontSize: '1.75rem' }}>
                          {selectedModel.name}
                        </Typography>
                        <Typography variant="body1" sx={{ color: '#616161', mb: 2.5, fontSize: '0.9375rem', lineHeight: 1.6 }}>
                          {selectedModel.description || 'Sem descrição'}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
                          <Chip
                            label={selectedModel.isDefaultPlanco ? 'Sistema' : 'Pessoal'}
                            size="small"
                            sx={{ 
                              bgcolor: '#F0F2F5',
                              color: '#212121',
                              fontWeight: 600,
                              fontSize: '0.75rem',
                              height: 24
                            }}
                          />
                          <Chip
                            icon={<LayersIcon sx={{ fontSize: 14, color: '#1877F2' }} />}
                            label={`${selectedModel.stages?.length || 0} Etapas`}
                            size="small"
                            sx={{ 
                              bgcolor: '#E7F3FF',
                              color: '#1877F2',
                              fontWeight: 600,
                              fontSize: '0.75rem',
                              height: 24,
                              '& .MuiChip-icon': {
                                ml: 0.5
                              }
                            }}
                          />
                          <Chip
                            icon={<ScheduleIcon sx={{ fontSize: 14, color: '#1877F2' }} />}
                            label={`${totalBusinessDays} Dias úteis`}
                            size="small"
                            sx={{ 
                              bgcolor: '#E7F3FF',
                              color: '#1877F2',
                              fontWeight: 600,
                              fontSize: '0.75rem',
                              height: 24,
                              '& .MuiChip-icon': {
                                ml: 0.5
                              }
                            }}
                          />
                        </Box>
                      </Box>
                      {/* Botões - apenas se NÃO for modelo padrão Planco */}
                      {!isDefaultPlanco && (
                        <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
                          {isEditMode ? (
                            // Modo de edição: mostrar Reverter e Salvar
                            <>
                              <Button
                                variant="text"
                                onClick={handleRevert}
                                sx={{ 
                                  textTransform: 'none', 
                                  fontWeight: 600,
                                  color: '#616161',
                                  '&:hover': {
                                    bgcolor: '#F0F2F5'
                                  }
                                }}
                              >
                                Reverter
                              </Button>
                              <Button
                                variant="contained"
                                onClick={handleSave}
                                disabled={updatingModel}
                                sx={{
                                  bgcolor: '#1877F2',
                                  '&:hover': { bgcolor: '#166FE5' },
                                  textTransform: 'none',
                                  fontWeight: 600,
                                  borderRadius: 2,
                                  boxShadow: 'none',
                                  px: 3
                                }}
                              >
                                {updatingModel ? <CircularProgress size={20} sx={{ color: '#fff' }} /> : 'Salvar'}
                              </Button>
                            </>
                          ) : (
                            // Modo visualização: mostrar Editar Fluxo
                            <Button
                              variant="contained"
                              startIcon={<EditIcon />}
                              onClick={handleEditFlow}
                              sx={{
                                bgcolor: '#1877F2',
                                '&:hover': { bgcolor: '#166FE5' },
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
                      )}
                    </Box>

                    {/* Barra de ações - apenas se NÃO for modelo padrão Planco E estiver em modo de edição */}
                    {!isDefaultPlanco && isEditMode && (
                      <Box sx={{ display: 'flex', gap: 1.5, pt: 3, borderTop: 1, borderColor: '#E4E6EB' }}>
                        <Button
                          variant="contained"
                          startIcon={<AddIcon />}
                          onClick={handleCreateCard}
                          sx={{
                            bgcolor: '#1877F2',
                            '&:hover': { bgcolor: '#166FE5' },
                            textTransform: 'none',
                            fontWeight: 600,
                            borderRadius: 2,
                            boxShadow: 'none',
                            px: 2.5
                          }}
                        >
                          Criar Card
                        </Button>
                        <Button
                          variant="outlined"
                          startIcon={<ReorderIcon />}
                          onClick={handleReorderCards}
                          sx={{ 
                            textTransform: 'none', 
                            fontWeight: 600, 
                            borderColor: '#E4E6EB',
                            color: '#212121',
                            borderRadius: 2,
                            px: 2.5,
                            '&:hover': {
                              borderColor: '#1877F2',
                              bgcolor: '#F0F9FF'
                            }
                          }}
                        >
                          Reordenar cards
                        </Button>
                      </Box>
                    )}
                  </Box>
                </>
              );
            })()}

            {/* Cards de etapas */}
            <Box sx={{ flex: 1, overflow: 'auto', p: 4, bgcolor: '#f4f6f8' }}>
              {selectedModel.stages && selectedModel.stages.length > 0 ? (
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: {
                      xs: '1fr',
                      sm: 'repeat(2, 1fr)',
                      md: 'repeat(3, 1fr)',
                      lg: 'repeat(4, 1fr)'
                    },
                    gap: 3
                  }}
                >
                  {selectedModel.stages
                    .sort((a, b) => a.order - b.order)
                    .map((stage) => (
                      <StageCard
                        key={stage.order}
                        stage={stage}
                        onViewDetails={() => handleViewDetails(stage.order)}
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
                    color: '#616161',
                    bgcolor: 'background.paper',
                    borderRadius: 2,
                    p: 4
                  }}
                >
                  <Typography variant="h6" sx={{ mb: 1, color: '#212121', fontWeight: 600 }}>
                    Nenhuma etapa cadastrada
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#616161' }}>
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
              color: '#616161',
              bgcolor: 'background.paper',
              m: 4,
              borderRadius: 2
            }}
          >
            <Typography variant="h6" sx={{ mb: 1, color: '#212121', fontWeight: 600 }}>
              Nenhum modelo selecionado
            </Typography>
            <Typography variant="body2" sx={{ color: '#616161' }}>
              Selecione um modelo da lista ou crie um novo
            </Typography>
          </Box>
        )}
      </Box>

      {/* Menu de contexto - apenas para modelos que não são padrão Planco */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        {menuModelId && (() => {
          const model = flowModels.find(m => m._id === menuModelId);
          const isDefaultPlanco = model?.isDefaultPlanco === true;
          
          if (isDefaultPlanco) {
            return null;
          }
          
          return (
            <>
              <MenuItem onClick={handleDuplicate} disabled={duplicatingModel}>
                <ContentCopyIcon sx={{ mr: 1, fontSize: 20 }} />
                Duplicar
              </MenuItem>
              <MenuItem onClick={handleDelete} disabled={deletingModel}>
                <DeleteIcon sx={{ mr: 1, fontSize: 20 }} />
                Excluir
              </MenuItem>
            </>
          );
        })()}
      </Menu>

      {/* Modal de criar modelo */}
      <CreateFlowModelModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSave={(data) => createModelMutation(data)}
        loading={creatingModel}
      />
    </Box>
  );
};

export default FlowModelsPage;

