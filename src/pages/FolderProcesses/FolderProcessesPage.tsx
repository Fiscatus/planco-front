import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import {
  Box,
  Button,
  Card,
  Typography
} from '@mui/material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Loading, useNotification } from '@/components';
import { ManageFolderModal } from '@/components/modals';
import type { FilterProcessesDto, Folder, FolderStatsDto, MoveProcessesDto, UpdateFolderDto } from '@/globals/types';
import { useFolders, useProcesses, useSearchWithDebounce } from '@/hooks';
import { StatsCards, FiltersSection, ProcessTable } from './components';

const FolderProcessesPage = () => {
  const navigate = useNavigate();
  const { id: folderId } = useParams<{ id: string }>();
  const [urlParams, setUrlParams] = useSearchParams();
  const queryClient = useQueryClient();
  const { showNotification } = useNotification();
  const { fetchFolderById, updateFolder, deleteFolder, moveProcesses, fetchFolders } = useFolders();
  const { fetchProcessesByFolder, fetchFolderStats } = useProcesses();

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
      `status:${urlParams.get('status') || ''}`
    ],
    enabled: !!folderId,
    refetchOnWindowFocus: false,
    queryFn: async () => {
      if (!folderId) return { processes: [], total: 0 };
      const processFilters: FilterProcessesDto = {};
      
      // Se houver busca, usar processNumber
      if (debouncedProcessSearch) {
        processFilters.processNumber = debouncedProcessSearch;
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
  const { data: allFoldersData, isLoading: allFoldersLoading, refetch: refetchAllFolders } = useQuery({
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
        pt: { xs: 2, sm: 3 },
        px: { xs: 2, sm: 4 },
        pb: 5,
        '@media (max-width: 640px)': {
          px: 2
        }
      }}
    >
      {/* Cabeçalho da Página */}
      <Box
        sx={{
          mb: 5,
          px: { xs: 2, sm: 4 },
          '@media (max-width: 640px)': {
            px: 2
          }
        }}
      >
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            flexWrap: 'wrap',
            gap: 2
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1, minWidth: 0 }}>
            <Button
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate('/gerenciamento-pastas')}
              sx={{
                color: '#8A8D91',
                textTransform: 'none',
                minWidth: 'auto',
                p: 1,
                backgroundColor: 'transparent',
                '&:hover': {
                  backgroundColor: 'transparent',
                  color: '#212121'
                },
                '&:focus': {
                  backgroundColor: 'transparent'
                },
                '& .MuiSvgIcon-root': {
                  fontSize: '24px'
                }
              }}
            />
            <Box>
              <Typography
                variant='h4'
                sx={{
                  fontWeight: 700,
                  fontSize: { xs: '1.5rem', md: '1.875rem' },
                  color: '#212121',
                  mb: 0.5
                }}
              >
                {pageTitle}
              </Typography>
              <Typography
                variant='body1'
                sx={{
                  color: '#8A8D91',
                  fontSize: '1rem'
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
              px: 3,
              py: 1.25,
              fontSize: '0.875rem',
              fontWeight: 600,
              textTransform: 'none',
              borderColor: '#1877F2',
              color: '#1877F2',
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
          px: { xs: 2, sm: 4 },
          '@media (max-width: 640px)': {
            px: 2
          }
        }}
      >
        {/* Cards de Estatísticas */}
        {stats && <StatsCards stats={stats} />}

        {/* Banner Informativo - Pasta Planco */}
        {isPlancoFolder && (
          <Box sx={{ mb: 4, mt: 3 }}>
            <Card
              sx={{
                borderRadius: '12px',
                border: '1px solid #BFDBFE',
                backgroundColor: '#EFF6FF',
                boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
                p: 3,
                transition: 'box-shadow 0.2s ease-in-out',
                '&:hover': {
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                }
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2.5 }}>
                <Box
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: '50%',
                    backgroundColor: '#DBEAFE',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
                  }}
                >
                  <InfoIcon sx={{ fontSize: 22, color: '#2563EB' }} />
                </Box>
                <Box sx={{ flex: 1, pt: 0.25 }}>
                  <Typography
                    variant='subtitle1'
                    sx={{
                      fontWeight: 700,
                      fontSize: '15px',
                      color: '#1E3A8A',
                      mb: 1.25,
                      lineHeight: 1.4
                    }}
                  >
                    Pasta Padrão do Sistema
                  </Typography>
                  <Typography
                    variant='body2'
                    sx={{
                      fontSize: '14px',
                      color: '#1E40AF',
                      lineHeight: 1.65,
                      letterSpacing: '0.01em'
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
          <ProcessTable
            processes={processesData?.processes || []}
            onProcessClick={handleProcessClick}
          />
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

