import {
  Add as AddIcon,
  CalendarMonth as CalendarMonthIcon,
  Clear as ClearIcon,
  FilterAlt as FilterAltIcon,
  Edit as EditIcon,
  Search as SearchIcon,
  Sort as SortIcon
} from '@mui/icons-material';
import { CreateFolderModal, ManageFolderModal, SelectFolderModal } from '@/components/modals';
import {
  Box,
  Button,
  Card,
  Chip,
  FormControl,
  Grid,
  MenuItem,
  Pagination,
  Select,
  TextField,
  Typography,
  useTheme
} from '@mui/material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Loading, useNotification } from '@/components';
import type { CreateFolderDto, FilterFoldersDto, Folder, UpdateFolderDto, MoveProcessesDto } from '@/globals/types';
import { useFolders, useSearchWithDebounce } from '@/hooks';
import { FolderCard } from './components/FolderCard';
import { years } from '@/globals/constants';

const FolderManagement = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { showNotification } = useNotification();
  const [urlParams, setUrlParams] = useSearchParams();
  
  const {
    search: folderSearch,
    debouncedSearch: debouncedFolderSearch,
    handleSearchChange: handleFolderSearchChange
  } = useSearchWithDebounce('folderSearch');

  const { fetchFolders, createFolder, updateFolder, deleteFolder, moveProcesses } = useFolders();

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectModalOpen, setSelectModalOpen] = useState(false);
  const [manageModalOpen, setManageModalOpen] = useState(false);
  const [selectedFolder, setSelectedFolder] = useState<Folder | null>(null);

  // Query para buscar todas as pastas (para mover processos)
  const { data: allFoldersData, isLoading: allFoldersLoading } = useQuery({
    queryKey: ['fetchAllFolders'],
    enabled: manageModalOpen, // Habilitar quando o modal abrir
    refetchOnWindowFocus: false,
    queryFn: async () => {
      return await fetchFolders({ limit: 100 });
    }
  });

  // Query para buscar pastas
  const {
    data: foldersData,
    isLoading: foldersLoading,
    error: foldersError,
    refetch: refetchFolders
  } = useQuery({
    queryKey: [
      'fetchFolders',
      `page:${urlParams.get('page') || 1}`,
      `limit:${urlParams.get('limit') || 12}`,
      `search:${debouncedFolderSearch}`,
      `year:${urlParams.get('year') || ''}`,
      `sortBy:${urlParams.get('sortBy') || 'name'}`,
      `sortOrder:${urlParams.get('sortOrder') || 'asc'}`
    ],
    refetchOnWindowFocus: false,
    queryFn: async () => {
      const filters: FilterFoldersDto = {
        page: Number(urlParams.get('page') || 1),
        limit: Number(urlParams.get('limit') || 12),
        search: debouncedFolderSearch || undefined,
        year: urlParams.get('year') || undefined,
        sortBy: urlParams.get('sortBy') || 'name',
        sortOrder: (urlParams.get('sortOrder') as 'asc' | 'desc') || 'asc'
      };
      return await fetchFolders(filters);
    }
  });

  // Mutation para criar pasta
  const { mutate: saveFolder, isPending: savingFolder } = useMutation({
    mutationFn: async (data: CreateFolderDto) => {
      return await createFolder(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fetchFolders'] });
      showNotification('Pasta criada com sucesso!', 'success');
      setCreateModalOpen(false);
    },
    onError: (error: Error) => {
      showNotification(error.message || 'Erro ao criar pasta', 'error');
    }
  });

  // Mutation para editar pasta
  const { mutate: editFolder, isPending: editingFolder } = useMutation({
    mutationFn: async (data: UpdateFolderDto) => {
      if (!selectedFolder) throw new Error('Pasta não selecionada');
      return await updateFolder(selectedFolder._id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fetchFolders'] });
      queryClient.invalidateQueries({ queryKey: ['fetchFolder'] });
      showNotification('Pasta editada com sucesso!', 'success');
    },
    onError: (error: Error) => {
      showNotification(error.message || 'Erro ao editar pasta', 'error');
    }
  });

  // Mutation para excluir pasta
  const { mutate: removeFolder, isPending: deletingFolder } = useMutation({
    mutationFn: async () => {
      if (!selectedFolder) throw new Error('Pasta não selecionada');
      return await deleteFolder(selectedFolder._id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fetchFolders'] });
      showNotification('Pasta excluída com sucesso!', 'success');
    },
    onError: (error: Error) => {
      showNotification(error.message || 'Erro ao excluir pasta', 'error');
    }
  });

  // Mutation para mover processos
  const { mutate: moveProcessesMutation, isPending: movingProcesses } = useMutation({
    mutationFn: async (data: any) => {
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

  const handleOpenCreate = useCallback(() => {
    setSelectedFolder(null);
    setCreateModalOpen(true);
  }, []);

  const handleOpenManage = useCallback(() => {
    setSelectModalOpen(true);
  }, []);

  const handleSelectFolder = useCallback((folder: Folder) => {
    setSelectedFolder(folder);
    setSelectModalOpen(false);
    setManageModalOpen(true);
  }, []);

  const handleToggleFavorite = useCallback((id: string) => {
    // Funcionalidade de favoritar temporariamente desabilitada
    // favoriteFolder(id);
  }, []);

  const handleCardClick = useCallback((id: string) => {
    navigate(`/pasta/${id}`);
  }, [navigate]);

  const handleClearFilters = useCallback(() => {
    const newParams = new URLSearchParams();
    setUrlParams(newParams, { replace: true });
  }, [setUrlParams]);

  const handlePageChange = useCallback(
    (page: number) => {
      const newParams = new URLSearchParams(urlParams);
      newParams.set('page', String(page));
      setUrlParams(newParams, { replace: true });
    },
    [urlParams, setUrlParams]
  );

  const handleLimitChange = useCallback(
    (limit: number) => {
      const newParams = new URLSearchParams(urlParams);
      newParams.set('limit', String(limit));
      newParams.set('page', '1');
      setUrlParams(newParams, { replace: true });
    },
    [urlParams, setUrlParams]
  );

  const handleYearChange = useCallback(
    (year: string) => {
      const newParams = new URLSearchParams(urlParams);
      if (year === 'all') {
        newParams.delete('year');
      } else {
        newParams.set('year', year);
      }
      newParams.set('page', '1');
      setUrlParams(newParams, { replace: true });
    },
    [urlParams, setUrlParams]
  );

  const handleSortByChange = useCallback(
    (sortBy: string) => {
      const newParams = new URLSearchParams(urlParams);
      newParams.set('sortBy', sortBy);
      newParams.set('page', '1');
      setUrlParams(newParams, { replace: true });
    },
    [urlParams, setUrlParams]
  );

  const handleSortOrderChange = useCallback(
    (sortOrder: string) => {
      const newParams = new URLSearchParams(urlParams);
      newParams.set('sortOrder', sortOrder);
      newParams.set('page', '1');
      setUrlParams(newParams, { replace: true });
    },
    [urlParams, setUrlParams]
  );

  const foldersTotal = foldersData?.total || 0;
  const foldersTotalPages = foldersData?.totalPages || 1;

  if (foldersLoading) return <Loading isLoading={true} />;

  if (foldersError) {
    return (
      <Box sx={{ p: 3 }}>
        <Card
          sx={{
            borderRadius: 2,
            border: '1px solid',
            borderColor: 'divider',
            boxShadow: 'none',
            p: 4,
            textAlign: 'center'
          }}
        >
          <Typography
            variant='h6'
            sx={{
              fontWeight: 600,
              color: '#dc2626',
              mb: 2
            }}
          >
            Erro ao carregar pastas
          </Typography>
          <Typography
            variant='body1'
            sx={{
              color: '#64748b',
              mb: 2
            }}
          >
            {foldersError instanceof Error ? foldersError.message : 'Erro desconhecido'}
          </Typography>
          <Typography
            variant='body2'
            sx={{
              color: '#9ca3af',
              fontSize: '0.875rem'
            }}
          >
            Verifique se a API está configurada corretamente e tente novamente.
          </Typography>
        </Card>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%' }}>
      {/* Header */}
      <Box
        sx={{
          py: { xs: 6, md: 8 },
          px: { xs: 2, sm: 4, md: 6, lg: 8 },
          '@media (max-width: 767px)': {
            py: 4,
            px: 1.5
          },
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', md: 'center' },
          gap: 3
        }}
      >
        <Box>
          <Typography
            variant='h4'
            sx={{
              fontWeight: 700,
              fontSize: { xs: '1.75rem', md: '2.25rem' },
              color: '#0f172a',
              mb: 1
            }}
          >
            Gerenciamento de Pastas
          </Typography>
          <Typography
            variant='body1'
            sx={{
              color: '#64748b',
              fontSize: '1rem',
              maxWidth: '600px'
            }}
          >
            Organize e acesse facilmente todos os processos da administração pública em um só lugar.
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Button
            variant='contained'
            startIcon={<AddIcon />}
            onClick={handleOpenCreate}
            sx={{
              borderRadius: 2,
              px: 3,
              py: 1.25,
              fontSize: '0.875rem',
              fontWeight: 600,
              textTransform: 'none',
              backgroundColor: '#1877F2',
              boxShadow: 'none',
              '&:hover': {
                backgroundColor: '#166fe5',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }
            }}
          >
            Criar Pasta
          </Button>
          <Button
            variant='outlined'
            startIcon={<EditIcon />}
            onClick={handleOpenManage}
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
            Gerenciar Pastas
          </Button>
        </Box>
      </Box>

      {/* Filtros de Pesquisa */}
      <Box
        sx={{
          px: { xs: 2, sm: 4, md: 6, lg: 8 },
          mb: 4,
          '@media (max-width: 767px)': {
            px: 1.5
          }
        }}
      >
        <Card
          sx={{
            borderRadius: 3,
            border: '1px solid',
            borderColor: '#e2e8f0',
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
            overflow: 'hidden',
            transition: 'all 0.3s ease-in-out',
            backgroundColor: '#ffffff',
            '&:hover': {
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
            }
          }}
        >
          <Box
            sx={{
              p: 3,
              background: 'linear-gradient(135deg, rgba(248, 250, 252, 1) 0%, rgba(255, 255, 255, 1) 100%)',
              borderBottom: '1px solid',
              borderColor: '#e2e8f0'
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 44,
                    height: 44,
                    borderRadius: 2.5,
                    background: 'linear-gradient(135deg, #1877F2 0%, #166fe5 100%)',
                    boxShadow: '0 2px 8px rgba(24, 119, 242, 0.3)'
                  }}
                >
                  <FilterAltIcon sx={{ color: '#ffffff', fontSize: 22 }} />
                </Box>
                <Box>
                  <Typography
                    variant='h6'
                    sx={{
                      fontWeight: 600,
                      fontSize: '1.125rem',
                      color: '#0f172a',
                      letterSpacing: '-0.01em',
                      lineHeight: 1.4
                    }}
                  >
                    Filtros de Pesquisa
                  </Typography>
                  <Typography
                    variant='caption'
                    sx={{
                      color: '#64748b',
                      fontSize: '0.8125rem',
                      display: 'block',
                      mt: 0.25,
                      lineHeight: 1.3
                    }}
                  >
                    Encontre suas pastas de forma rápida
                  </Typography>
                </Box>
              </Box>
              {(urlParams.get('year') || urlParams.get('sortBy') !== 'name' || urlParams.get('sortOrder') !== 'asc' || folderSearch) && (
                <Chip
                  icon={<ClearIcon sx={{ fontSize: 16 }} />}
                  label='Limpar'
                  onClick={handleClearFilters}
                  sx={{
                    height: 32,
                    fontWeight: 600,
                    fontSize: '0.8125rem',
                    borderRadius: 2.5,
                    backgroundColor: '#fef2f2',
                    color: '#dc2626',
                    border: '1px solid #fecaca',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                      backgroundColor: '#fee2e2',
                      borderColor: '#fca5a5',
                      transform: 'translateY(-1px)'
                    },
                    '& .MuiChip-icon': {
                      color: '#dc2626',
                      marginLeft: '6px'
                    }
                  }}
                />
              )}
            </Box>
          </Box>
          <Box sx={{ p: 3, pt: 2.5 }}>
            <Grid
              container
              spacing={2.5}
            >
              {/* Campo de busca */}
              <Grid size={{ xs: 12, md: 6 }}>
                <Box>
                  <Typography
                    variant='caption'
                    sx={{
                      display: 'block',
                      mb: 1.5,
                      fontWeight: 600,
                      color: '#475569',
                      fontSize: '0.6875rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.08em'
                    }}
                  >
                    Buscar
                  </Typography>
                  <TextField
                    fullWidth
                    placeholder='Digite nome da pasta, processo ou ano...'
                    value={folderSearch}
                    onChange={(e) => handleFolderSearchChange(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            mr: 1.25,
                            width: 20,
                            height: 20
                          }}
                        >
                          <SearchIcon sx={{ color: '#94a3b8', fontSize: '1.25rem' }} />
                        </Box>
                      ),
                      sx: { height: 44 }
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2.5,
                        backgroundColor: '#ffffff',
                        border: '1px solid #e2e8f0',
                        transition: 'all 0.2s ease-in-out',
                        '&:hover': {
                          borderColor: '#cbd5e1'
                        },
                        '&.Mui-focused': {
                          borderColor: theme.palette.primary.main,
                          boxShadow: `0 0 0 3px ${theme.palette.primary.main}15`,
                          backgroundColor: '#ffffff'
                        }
                      },
                      '& .MuiInputBase-input::placeholder': {
                        color: '#94a3b8',
                        opacity: 1,
                        fontWeight: 400
                      }
                    }}
                  />
                </Box>
              </Grid>

              {/* Filtro de ano */}
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Box>
                  <Typography
                    variant='caption'
                    sx={{
                      display: 'block',
                      mb: 1.5,
                      fontWeight: 600,
                      color: '#475569',
                      fontSize: '0.6875rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.08em'
                    }}
                  >
                    Ano
                  </Typography>
                  <FormControl fullWidth>
                    <Select
                      value={urlParams.get('year') || 'all'}
                      onChange={(e) => handleYearChange(e.target.value)}
                      displayEmpty
                      sx={{
                        height: 44,
                        borderRadius: 2.5,
                        backgroundColor: '#ffffff',
                        border: '1px solid #e2e8f0',
                        transition: 'all 0.2s ease-in-out',
                        '&:hover': {
                          borderColor: '#cbd5e1'
                        },
                        '&.Mui-focused': {
                          borderColor: theme.palette.primary.main,
                          boxShadow: `0 0 0 3px ${theme.palette.primary.main}15`,
                          backgroundColor: '#ffffff'
                        },
                        '& .MuiSelect-select': {
                          display: 'flex',
                          alignItems: 'center',
                          paddingLeft: '12px !important'
                        }
                      }}
                      renderValue={(value) => {
                        const selectedYear = value === 'all' ? 'Todos os anos' : value;
                        return (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <CalendarMonthIcon sx={{ fontSize: 18, color: '#64748b' }} />
                            <Box component='span' sx={{ fontWeight: 400, color: '#0f172a' }}>
                              {selectedYear}
                            </Box>
                          </Box>
                        );
                      }}
                    >
                      <MenuItem value='all'>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <CalendarMonthIcon sx={{ fontSize: 18, color: '#64748b' }} />
                          <Box component='span' sx={{ color: '#64748b' }}>Todos os anos</Box>
                        </Box>
                      </MenuItem>
                      {years().slice(0, 10).map((year) => (
                        <MenuItem key={year} value={year}>
                          {year}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>
              </Grid>

              {/* Filtro de ordenação */}
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Box>
                  <Typography
                    variant='caption'
                    sx={{
                      display: 'block',
                      mb: 1.5,
                      fontWeight: 600,
                      color: '#475569',
                      fontSize: '0.6875rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.08em'
                    }}
                  >
                    Ordenação
                  </Typography>
                  <FormControl fullWidth>
                    <Select
                      value={`${urlParams.get('sortBy') || 'name'}-${urlParams.get('sortOrder') || 'asc'}`}
                      onChange={(e) => {
                        const [sortBy, sortOrder] = e.target.value.split('-');
                        handleSortByChange(sortBy);
                        handleSortOrderChange(sortOrder);
                      }}
                      sx={{
                        height: 44,
                        borderRadius: 2.5,
                        backgroundColor: '#ffffff',
                        border: '1px solid #e2e8f0',
                        transition: 'all 0.2s ease-in-out',
                        '&:hover': {
                          borderColor: '#cbd5e1'
                        },
                        '&.Mui-focused': {
                          borderColor: theme.palette.primary.main,
                          boxShadow: `0 0 0 3px ${theme.palette.primary.main}15`,
                          backgroundColor: '#ffffff'
                        },
                        '& .MuiSelect-select': {
                          display: 'flex',
                          alignItems: 'center',
                          paddingLeft: '12px !important'
                        }
                      }}
                      renderValue={(value) => {
                        return (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <SortIcon sx={{ fontSize: 18, color: '#64748b' }} />
                            <Box component='span' sx={{ fontWeight: 400, color: '#0f172a' }}>
                              {value === 'name-asc' ? 'Nome (A-Z)' : value === 'name-desc' ? 'Nome (Z-A)' : 'Nome (A-Z)'}
                            </Box>
                          </Box>
                        );
                      }}
                    >
                      <MenuItem value='name-asc'>Nome (A-Z)</MenuItem>
                      <MenuItem value='name-desc'>Nome (Z-A)</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
              </Grid>
            </Grid>
          </Box>
        </Card>
      </Box>

      {/* Grid de Pastas */}
      <Box
        sx={{
          px: { xs: 2, sm: 4, md: 6, lg: 8 },
          mb: 4,
          '@media (max-width: 767px)': {
            px: 1.5
          }
        }}
      >
        {foldersData?.folders && foldersData.folders.length > 0 ? (
          <>
            <Box sx={{ mb: 2 }}>
              <Typography
                variant='body2'
                sx={{
                  color: '#64748b',
                  fontSize: '0.875rem',
                  fontWeight: 500
                }}
              >
                {foldersData.total} {foldersData.total === 1 ? 'pasta encontrada' : 'pastas encontradas'}
              </Typography>
            </Box>
            <Grid
              container
              spacing={3}
            >
              {foldersData.folders.map((folder) => (
                <Grid
                  key={folder._id}
                  size={{ xs: 12, sm: 6, md: 4, lg: 3 }}
                >
                  <FolderCard
                    folder={folder}
                    onToggleFavorite={handleToggleFavorite}
                    onClick={handleCardClick}
                  />
                </Grid>
              ))}
            </Grid>
          </>
        ) : (
          <Card
            sx={{
              borderRadius: 3,
              border: '1px solid',
              borderColor: 'divider',
              boxShadow: 'none',
              p: 6,
              textAlign: 'center'
            }}
          >
            <Typography
              variant='body1'
              sx={{
                color: '#64748b',
                fontSize: '1rem'
              }}
            >
              Nenhuma pasta encontrada
            </Typography>
          </Card>
        )}
      </Box>

      {/* Paginação */}
      {foldersTotalPages > 1 && (
        <Box
          sx={{
            px: { xs: 2, sm: 4, md: 6, lg: 8 },
            '@media (max-width: 767px)': {
              px: 1.5
            },
            mt: 6,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 3,
            pt: 4,
            borderTop: '1px solid',
            borderColor: 'divider'
          }}
        >
          <Typography
            variant='body2'
            sx={{ color: '#6b7280', fontSize: '0.875rem', fontWeight: 500 }}
          >
            {((Number(urlParams.get('page') || 1) - 1) * Number(urlParams.get('limit') || 12)) + 1}-
            {Math.min(Number(urlParams.get('page') || 1) * Number(urlParams.get('limit') || 12), foldersTotal)} de {foldersTotal}
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Select
              value={urlParams.get('limit') || 12}
              onChange={(e) => handleLimitChange(Number(e.target.value))}
              sx={{
                minWidth: 140,
                height: 36,
                fontSize: '0.875rem',
                borderRadius: 2
              }}
            >
              {[12, 24, 48, 96].map((limit) => (
                <MenuItem key={limit} value={limit}>
                  {limit} por página
                </MenuItem>
              ))}
            </Select>

            <Pagination
              count={foldersTotalPages}
              page={Number(urlParams.get('page') || 1)}
              onChange={(_e, value) => handlePageChange(value)}
              variant='outlined'
              shape='rounded'
              color='primary'
            />
          </Box>
        </Box>
      )}

      {/* Modais */}
      <CreateFolderModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSave={saveFolder}
        loading={savingFolder}
      />

      <SelectFolderModal
        open={selectModalOpen}
        onClose={() => setSelectModalOpen(false)}
        onSelect={handleSelectFolder}
        folders={foldersData?.folders || []}
      />

      <ManageFolderModal
        open={manageModalOpen}
        onClose={() => {
          setManageModalOpen(false);
          setSelectedFolder(null);
        }}
        folder={selectedFolder}
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

export default FolderManagement;

