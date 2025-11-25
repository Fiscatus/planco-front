import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import {
  Box,
  Button,
  Card,
  Typography,
  Pagination,
  Select,
  MenuItem
} from '@mui/material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback, useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Loading, useNotification } from '@/components';
import { ManageFolderModal } from '@/components/modals';
import type { FilterProcessesDto, FolderStatsDto, MoveProcessesDto, UpdateFolderDto } from '@/globals/types';
import { useFolders, useProcesses, useSearchWithDebounce } from '@/hooks';
import { StatsCards } from './components/StatsCards';
import { FiltersSection } from './components/FiltersSection';
import { ProcessTable } from './components/ProcessTable';

const FolderProcessesPage = () => {
  const navigate = useNavigate();
  const { id: folderId } = useParams<{ id: string }>();
  const [urlParams, setUrlParams] = useSearchParams();
  const queryClient = useQueryClient();
  const { showNotification } = useNotification();
  const { fetchFolderById, updateFolder, deleteFolder, fetchFolders } = useFolders();
  const { fetchProcessesByFolder, fetchFolderStats, moveProcesses } = useProcesses();

  const [manageModalOpen, setManageModalOpen] = useState(false);

  const {
    search: processSearch,
    debouncedSearch: debouncedProcessSearch,
    handleSearchChange: handleProcessSearchChange
  } = useSearchWithDebounce('search');

  // Buscar informações da pasta
  const { data: folder, isLoading: folderLoading } = useQuery({
    queryKey: ['fetchFolder', folderId],
    enabled: !!folderId,
    refetchOnWindowFocus: false,
    queryFn: async () => {
      if (!folderId) return null;
      return await fetchFolderById(folderId);
    }
  });

  // Buscar estatísticas da pasta
  const {
    data: stats,
    isLoading: statsLoading
  } = useQuery({
    queryKey: ['fetchFolderStats', folderId],
    enabled: !!folderId,
    refetchOnWindowFocus: false,
    queryFn: async () => {
      if (!folderId) return null;
      return await fetchFolderStats(folderId);
    }
  });

  // Buscar processos da pasta
  const {
    data: processesData,
    isLoading: processesLoading
  } = useQuery({
    queryKey: [
      'fetchProcessesByFolder',
      folderId,
      `search:${debouncedProcessSearch}`,
      `priority:${urlParams.get('priority') || ''}`,
      `modality:${urlParams.get('modality') || ''}`,
      `currentStage:${urlParams.get('currentStage') || ''}`,
      `status:${urlParams.get('status') || ''}`,
      `page:${urlParams.get('page') || 1}`,
      `limit:${urlParams.get('limit') || 10}`
    ],
    enabled: !!folderId,
    refetchOnWindowFocus: false,
    queryFn: async () => {
      if (!folderId) {
        return { processes: [], total: 0, page: 1, limit: 10, totalPages: 1 };
      }
      const processFilters: FilterProcessesDto = {
        page: Number(urlParams.get('page') || 1),
        limit: Number(urlParams.get('limit') || 10)
      };
      
      // Se houver busca, buscar tanto por processNumber quanto por object
      // A API provavelmente faz busca OR (número OU objeto)
      if (debouncedProcessSearch) {
        processFilters.processNumber = debouncedProcessSearch;
        processFilters.object = debouncedProcessSearch;
      }
      
      // Adicionar filtros da URL
      if (urlParams.get('priority')) processFilters.priority = urlParams.get('priority') as string;
      if (urlParams.get('modality')) processFilters.modality = urlParams.get('modality') as string;
      if (urlParams.get('currentStage')) processFilters.currentStage = urlParams.get('currentStage') as string;
      if (urlParams.get('status')) processFilters.status = urlParams.get('status') as string;
      
      return await fetchProcessesByFolder(folderId, processFilters);
    }
  });

  // Query para buscar todas as pastas (para mover processos)
  const { data: allFoldersData, isLoading: allFoldersLoading } = useQuery({
    queryKey: ['fetchAllFolders'],
    enabled: manageModalOpen, // Habilitar quando o modal abrir
    refetchOnWindowFocus: false,
    queryFn: async () => {
      return await fetchFolders({ limit: 100 });
    }
  });

  // Mutation para editar pasta
  const { mutate: editFolder, isPending: editingFolder } = useMutation({
    mutationFn: async (data: UpdateFolderDto) => {
      if (!folderId) throw new Error('Pasta não selecionada');
      return await updateFolder(folderId, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fetchFolder'] });
      queryClient.invalidateQueries({ queryKey: ['fetchFolders'] });
      showNotification('Pasta editada com sucesso!', 'success');
    },
    onError: (error: Error) => {
      showNotification(error.message || 'Erro ao editar pasta', 'error');
    }
  });

  // Mutation para excluir pasta
  const { mutate: removeFolder, isPending: deletingFolder } = useMutation({
    mutationFn: async () => {
      if (!folderId) throw new Error('Pasta não selecionada');
      return await deleteFolder(folderId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fetchFolders'] });
      showNotification('Pasta excluída com sucesso!', 'success');
      navigate('/gerenciamento-pastas');
    },
    onError: (error: Error) => {
      showNotification(error.message || 'Erro ao excluir pasta', 'error');
    }
  });

  // Mutation para mover processos
  const { mutate: moveProcessesMutation, isPending: movingProcesses } = useMutation({
    mutationFn: async (data: MoveProcessesDto) => {
      return await moveProcesses(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fetchProcessesByFolder'] });
      queryClient.invalidateQueries({ queryKey: ['fetchFolderStats'] });
      showNotification('Processos movidos com sucesso!', 'success');
    },
    onError: (error: Error) => {
      showNotification(error.message || 'Erro ao mover processos', 'error');
    }
  });

  const handleProcessClick = useCallback((process: any) => {
    // Navegar para detalhes do processo ou abrir modal
    showNotification('Funcionalidade de visualizar processo em desenvolvimento', 'info');
  }, [showNotification]);

  const handleManageFolder = useCallback(() => {
    setManageModalOpen(true);
  }, []);

  // Handlers de paginação
  const handleProcessesPageChange = useCallback((_event: unknown, newPage: number) => {
    const newParams = new URLSearchParams(urlParams);
    newParams.set('page', String(newPage));
    // Garantir que limit esteja presente
    if (!newParams.get('limit')) {
      newParams.set('limit', '10');
    }
    setUrlParams(newParams, { replace: true });
  }, [urlParams, setUrlParams]);

  const handleProcessesLimitChange = useCallback((event: any) => {
    const newLimit = Number(event.target.value);
    const newParams = new URLSearchParams(urlParams);
    newParams.set('limit', String(newLimit));
    newParams.set('page', '1');
    setUrlParams(newParams, { replace: true });
  }, [urlParams, setUrlParams]);

  // Garantir que page e limit sempre estejam na URL
  useEffect(() => {
    const currentPage = urlParams.get('page');
    const currentLimit = urlParams.get('limit');
    const needsUpdate = !currentPage || !currentLimit;

    if (needsUpdate) {
      const newParams = new URLSearchParams(urlParams);
      if (!currentPage) {
        newParams.set('page', '1');
      }
      if (!currentLimit) {
        newParams.set('limit', '10');
      }
      setUrlParams(newParams, { replace: true });
    }
  }, [urlParams, setUrlParams]);

  if (!folderId) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant='h6' color='error'>
          Pasta não encontrada
        </Typography>
      </Box>
    );
  }

  if (folderLoading || statsLoading) {
    return <Loading isLoading={true} />;
  }

  const pageTitle = folder?.name || 'Processos';
  const pageSubtitle = folder?.description || 'Processos administrativos e licitatórios do exercício atual - Acompanhamento e gestão de demandas em andamento';
  
  const isPlancoFolder = folder?.isDefault || folder?.name?.toLowerCase().includes('planco');

  return (
    <Box
      sx={{
        width: '100%',
        minHeight: '100vh',
        background: 'linear-gradient(180deg, #F7F9FB 0%, #F4F6F8 100%)',
        pt: { xs: 2, sm: 3, md: 3.5 },
        px: { xs: 2, sm: 3, md: 4, lg: 5 },
        pb: { xs: 4, sm: 5, md: 6 },
        '@media (max-width: 640px)': {
          px: 2
        }
      }}
    >
      {/* Cabeçalho da Página */}
      <Box
        sx={{
          mb: { xs: 3, sm: 4, md: 5 },
          px: { xs: 0, sm: 0, md: 0 },
          '@media (max-width: 640px)': {
            px: 0
          }
        }}
      >
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: { xs: 'flex-start', sm: 'center' },
            flexDirection: { xs: 'column', sm: 'row' },
            flexWrap: { xs: 'nowrap', sm: 'wrap' },
            gap: { xs: 2, sm: 2, md: 3 }
          }}
        >
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: { xs: 1.5, sm: 2, md: 2.5 }, 
            flex: 1, 
            minWidth: 0,
            width: { xs: '100%', sm: 'auto' }
          }}>
            <Button
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate('/gerenciamento-pastas')}
              sx={{
                color: '#8A8D91',
                textTransform: 'none',
                minWidth: 'auto',
                p: { xs: 0.75, sm: 1 },
                backgroundColor: 'transparent',
                flexShrink: 0,
                '&:hover': {
                  backgroundColor: 'transparent',
                  color: '#212121'
                },
                '&:focus': {
                  backgroundColor: 'transparent'
                },
                '& .MuiSvgIcon-root': {
                  fontSize: { xs: '20px', sm: '24px' }
                }
              }}
            />
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography
                variant='h4'
                sx={{
                  fontWeight: 700,
                  fontSize: { xs: '1.25rem', sm: '1.5rem', md: '1.75rem', lg: '1.875rem' },
                  color: '#212121',
                  mb: { xs: 0.25, sm: 0.5 },
                  lineHeight: { xs: 1.3, sm: 1.2 },
                  wordBreak: 'break-word'
                }}
              >
                {pageTitle}
              </Typography>
              <Typography
                variant='body1'
                sx={{
                  color: '#8A8D91',
                  fontSize: { xs: '0.875rem', sm: '0.9375rem', md: '1rem' },
                  lineHeight: { xs: 1.4, sm: 1.5 },
                  display: { xs: 'none', sm: 'block' }
                }}
              >
                {pageSubtitle}
              </Typography>
            </Box>
          </Box>

          <Button
            variant='outlined'
            startIcon={<EditIcon />}
            onClick={handleManageFolder}
            sx={{
              borderRadius: 2,
              px: { xs: 2.5, sm: 3, md: 3.5 },
              py: { xs: 1, sm: 1.125, md: 1.25 },
              fontSize: { xs: '0.8125rem', sm: '0.875rem' },
              fontWeight: 600,
              textTransform: 'none',
              borderColor: '#1877F2',
              color: '#1877F2',
              width: { xs: '100%', sm: 'auto' },
              mt: { xs: 1, sm: 0 },
              '&:hover': {
                borderColor: '#166fe5',
                backgroundColor: '#f0f9ff'
              }
            }}
          >
            Gerenciar Pasta
          </Button>
        </Box>
      </Box>

      {/* Content */}
      <Box
        sx={{
          px: { xs: 0, sm: 0, md: 0 },
          '@media (max-width: 640px)': {
            px: 0
          }
        }}
      >
        {/* Cards de Estatísticas */}
        {stats && <StatsCards stats={stats} />}

        {/* Banner Informativo - Pasta Planco */}
        {isPlancoFolder && (
          <Box sx={{ mb: { xs: 3, sm: 4, md: 4 }, mt: { xs: 2, sm: 3, md: 3 } }}>
            <Card
              sx={{
                borderRadius: { xs: '10px', sm: '12px' },
                border: '1px solid #BFDBFE',
                backgroundColor: '#EFF6FF',
                boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
                p: { xs: 2, sm: 2.5, md: 3 },
                transition: 'box-shadow 0.2s ease-in-out',
                '&:hover': {
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                }
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: { xs: 2, sm: 2.5, md: 2.5 } }}>
                <Box
                  sx={{
                    width: { xs: 40, sm: 44 },
                    height: { xs: 40, sm: 44 },
                    borderRadius: '50%',
                    backgroundColor: '#DBEAFE',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
                  }}
                >
                  <InfoIcon sx={{ fontSize: { xs: 20, sm: 22 }, color: '#2563EB' }} />
                </Box>
                <Box sx={{ flex: 1, pt: 0.25, minWidth: 0 }}>
                  <Typography
                    variant='subtitle1'
                    sx={{
                      fontWeight: 700,
                      fontSize: { xs: '14px', sm: '15px' },
                      color: '#1E3A8A',
                      mb: { xs: 1, sm: 1.25 },
                      lineHeight: 1.4
                    }}
                  >
                    Pasta Padrão do Sistema
                  </Typography>
                  <Typography
                    variant='body2'
                    sx={{
                      fontSize: { xs: '13px', sm: '14px' },
                      color: '#1E40AF',
                      lineHeight: { xs: 1.5, sm: 1.65 },
                      letterSpacing: '0.01em',
                      wordBreak: 'break-word'
                    }}
                  >
                    Esta é a{' '}
                    <Box
                      component='span'
                      sx={{
                        fontWeight: 700,
                        color: '#2563EB'
                      }}
                    >
                      Pasta Planco
                    </Box>
                    , pasta inicial do sistema. Processos administrativos criados sem pasta específica são automaticamente direcionados para este repositório. Processos oriundos de pastas excluídas também são preservados neste local, garantindo a integridade documental. Esta pasta é permanente e sempre estará disponível no sistema.
                  </Typography>
                </Box>
              </Box>
            </Card>
          </Box>
        )}

        {/* Filtros */}
        <FiltersSection
          searchValue={processSearch}
          onSearchChange={handleProcessSearchChange}
        />

        {/* Tabela de Processos */}
        {processesLoading ? (
          <Loading isLoading={true} />
        ) : (
          <>
            <ProcessTable
              processes={processesData?.processes || []}
              onProcessClick={handleProcessClick}
            />
            
            {/* Paginação */}
            {processesData && (processesData.total || 0) > 0 && (
              <Box
                sx={{
                  p: 3,
                  display: 'flex',
                  flexDirection: { xs: 'column', md: 'row' },
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: 2,
                  backgroundColor: '#f8fafc',
                  borderTop: '1px solid #e5e7eb',
                  borderRadius: '0 0 12px 12px',
                  mt: 2
                }}
              >
                {/* Pagination Info */}
                <Typography
                  variant='body2'
                  sx={{ color: '#6b7280', fontSize: '0.875rem' }}
                >
                  {((Number(urlParams.get('page') || 1) - 1) * Number(urlParams.get('limit') || 10)) + 1}-
                  {Math.min(Number(urlParams.get('page') || 1) * Number(urlParams.get('limit') || 10), processesData.total || 0)} de {processesData.total || 0}
                </Typography>

                {/* Pagination Controls */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Select
                    value={Number(urlParams.get('limit') || 10)}
                    onChange={handleProcessesLimitChange}
                    sx={{ minWidth: 120, height: 32, fontSize: '0.875rem' }}
                  >
                    {[5, 10, 25, 50].map((limit) => (
                      <MenuItem 
                        key={limit} 
                        value={limit}
                        sx={{
                          '&.Mui-selected': {
                            backgroundColor: '#f1f5f9',
                            '&:hover': {
                              backgroundColor: '#f1f5f9'
                            }
                          }
                        }}
                      >
                        {limit} por página
                      </MenuItem>
                    ))}
                  </Select>

                  <Pagination
                    count={processesData?.totalPages || Math.ceil((processesData?.total || 0) / Number(urlParams.get('limit') || 10))}
                    page={Number(urlParams.get('page') || 1)}
                    onChange={handleProcessesPageChange}
                    variant='outlined'
                    shape='rounded'
                  />
                </Box>
              </Box>
            )}
          </>
        )}
      </Box>

      {/* Modal de Gerenciamento */}
      <ManageFolderModal
        open={manageModalOpen}
        onClose={() => setManageModalOpen(false)}
        folder={folder}
        availableFolders={allFoldersData?.folders || []}
        onEdit={editFolder}
        onDelete={removeFolder}
        onMoveProcesses={moveProcessesMutation}
        editingLoading={editingFolder}
        deletingLoading={deletingFolder}
        movingLoading={movingProcesses}
        loadingFolders={allFoldersLoading}
      />
    </Box>
  );
};

export default FolderProcessesPage;

