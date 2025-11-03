import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon
} from '@mui/icons-material';
import {
  Box,
  Button,
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

  return (
    <Box
      sx={{
        width: '100%',
        minHeight: '100vh',
        backgroundColor: '#f8fafc'
      }}
    >
      {/* Header */}
      <Box
        sx={{
          py: { xs: 6, md: 8 },
          px: { xs: 2, sm: 4, md: 6, lg: 8 },
          '@media (max-width: 767px)': {
            py: 4,
            px: 1.5
          },
          backgroundColor: '#ffffff',
          borderBottom: '1px solid #e2e8f0'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/gerenciamento-pastas')}
            sx={{
              color: '#64748b',
              textTransform: 'none',
              '&:hover': {
                backgroundColor: '#f1f5f9'
              }
            }}
          >
            Voltar
          </Button>
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 3 }}>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              variant='h4'
              sx={{
                fontWeight: 700,
                fontSize: { xs: '1.5rem', md: '2rem' },
                color: '#0f172a',
                mb: 1
              }}
            >
              {pageTitle}
            </Typography>
            <Typography
              variant='body1'
              sx={{
                color: '#64748b',
                fontSize: '0.9375rem',
                lineHeight: 1.6
              }}
            >
              {pageSubtitle}
            </Typography>
          </Box>

          <Button
            variant='contained'
            startIcon={<EditIcon />}
            onClick={handleManageFolder}
            sx={{
              borderRadius: 2.5,
              px: 3,
              py: 1.5,
              textTransform: 'none',
              fontWeight: 600,
              backgroundColor: '#1877F2',
              boxShadow: '0 2px 4px rgba(24, 119, 242, 0.2)',
              '&:hover': {
                backgroundColor: '#166fe5',
                boxShadow: '0 4px 8px rgba(24, 119, 242, 0.3)'
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
          py: { xs: 4, md: 6 },
          px: { xs: 2, sm: 4, md: 6, lg: 8 },
          '@media (max-width: 767px)': {
            py: 3,
            px: 1.5
          }
        }}
      >
        {/* Cards de Estatísticas */}
        {stats && <StatsCards stats={stats} />}

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

