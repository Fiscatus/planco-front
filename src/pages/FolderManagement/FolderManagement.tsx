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
import { useCallback, useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Loading, useNotification } from '@/components';
import type { CreateFolderDto, FilterFoldersDto, Folder, UpdateFolderDto, MoveProcessesDto } from '@/globals/types';
import { useFolders, useSearchWithDebounce, useFavoriteFolders } from '@/hooks';
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

  const { toggleFavorite, getFavoriteIds } = useFavoriteFolders();
  const [favoritesUpdateTrigger, setFavoritesUpdateTrigger] = useState(0);

  const handleToggleFavorite = useCallback(
    (id: string) => {
      toggleFavorite(id);
      // Forçar atualização da ordenação
      setFavoritesUpdateTrigger((prev) => prev + 1);
    },
    [toggleFavorite]
  );

  // Função para ordenar pastas: permanentes primeiro, depois favoritas (mais recente primeiro), depois as outras (mais recente primeiro)
  const sortedFolders = useMemo(() => {
    if (!foldersData?.folders) return [];
    
    const favoriteIds = getFavoriteIds();
    const favoriteIdsSet = new Set(favoriteIds);
    
    // Função auxiliar para obter a data mais recente de uma pasta
    const getLatestDate = (folder: Folder): number => {
      const updatedAt = folder.updatedAt ? new Date(folder.updatedAt).getTime() : 0;
      const createdAt = folder.createdAt ? new Date(folder.createdAt).getTime() : 0;
      return Math.max(updatedAt, createdAt);
    };
    
    return [...foldersData.folders].sort((a, b) => {
      const aIsPermanent = a.isPermanent || false;
      const bIsPermanent = b.isPermanent || false;
      const aIsFavorite = favoriteIdsSet.has(a._id);
      const bIsFavorite = favoriteIdsSet.has(b._id);
      
      // Pastas permanentes primeiro
      if (aIsPermanent && !bIsPermanent) return -1;
      if (!aIsPermanent && bIsPermanent) return 1;
      
      // Se ambas são permanentes, manter ordem original entre elas
      if (aIsPermanent && bIsPermanent) return 0;
      
      // Depois pastas favoritadas (não permanentes)
      if (aIsFavorite && !bIsFavorite) return -1;
      if (!aIsFavorite && bIsFavorite) return 1;
      
      // Se ambas são favoritas ou ambas não são favoritas, ordenar por data (mais recente primeiro)
      if ((aIsFavorite && bIsFavorite) || (!aIsFavorite && !bIsFavorite)) {
        const aDate = getLatestDate(a);
        const bDate = getLatestDate(b);
        // Mais recente primeiro (data maior vem primeiro)
        return bDate - aDate;
      }
      
      return 0;
    });
  }, [foldersData?.folders, getFavoriteIds, favoritesUpdateTrigger]);

  const handleCardClick = useCallback((id: string) => {
    navigate(`/pasta/${id}`);
  }, [navigate]);

  const handleClearFilters = useCallback(() => {
    const newParams = new URLSearchParams();
    setUrlParams(newParams, { replace: true });
  }, [setUrlParams]);

  const hasActiveFilters = !!(
    (urlParams.get('year') && urlParams.get('year') !== '') ||
    (urlParams.get('sortBy') && urlParams.get('sortBy') !== 'name') ||
    (urlParams.get('sortOrder') && urlParams.get('sortOrder') !== 'asc') ||
    (folderSearch && folderSearch.trim() !== '')
  );

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
          py: { xs: 3, md: 4 },
          px: { xs: 2, sm: 4, md: 6, lg: 8 },
          '@media (max-width: 767px)': {
            py: 2.5,
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
            borderRadius: 2,
            border: '1px solid',
            borderColor: '#e2e8f0',
            boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
            overflow: 'hidden',
            backgroundColor: '#ffffff'
          }}
        >
          <Box
            sx={{
              px: 3,
              py: 2.5,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderBottom: '1px solid',
              borderColor: '#f1f5f9',
              backgroundColor: '#fafbfc'
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <FilterAltIcon sx={{ color: '#1877F2', fontSize: 20 }} />
              <Typography
                variant='subtitle1'
                sx={{
                  fontWeight: 600,
                  fontSize: '0.9375rem',
                  color: '#0f172a',
                  letterSpacing: '-0.01em'
                }}
              >
                Filtros de Pesquisa
              </Typography>
            </Box>
            {hasActiveFilters && (
              <Button
                variant='outlined'
                size='small'
                startIcon={<ClearIcon sx={{ fontSize: 16 }} />}
                onClick={handleClearFilters}
                sx={{
                  minWidth: 'auto',
                  px: 2,
                  py: 0.875,
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  color: '#64748b',
                  borderColor: '#cbd5e1',
                  textTransform: 'none',
                  borderRadius: 2,
                  backgroundColor: '#ffffff',
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    backgroundColor: '#f8fafc',
                    borderColor: '#94a3b8',
                    color: '#475569',
                    boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
                  }
                }}
              >
                Limpar filtros
              </Button>
            )}
          </Box>
          <Box sx={{ p: 3 }}>
            <Grid container spacing={2.5}>
              {/* Campo de busca */}
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  placeholder='Buscar por nome da pasta, processo ou ano...'
                  value={folderSearch}
                  onChange={(e) => handleFolderSearchChange(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <SearchIcon sx={{ color: '#94a3b8', fontSize: 20, mr: 1.5 }} />
                    )
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      height: 42,
                      borderRadius: 2,
                      backgroundColor: '#ffffff',
                      fontSize: '0.875rem',
                      transition: 'all 0.2s ease-in-out',
                      '&:hover': {
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#cbd5e1'
                        }
                      },
                      '&.Mui-focused': {
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: theme.palette.primary.main,
                          borderWidth: '1.5px'
                        }
                      }
                    },
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#e2e8f0'
                    },
                    '& .MuiInputBase-input::placeholder': {
                      color: '#94a3b8',
                      opacity: 1,
                      fontSize: '0.875rem'
                    }
                  }}
                />
              </Grid>

              {/* Filtro de ano */}
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <FormControl fullWidth>
                  <Select
                    value={urlParams.get('year') || 'all'}
                    onChange={(e) => handleYearChange(e.target.value)}
                    displayEmpty
                    sx={{
                      height: 42,
                      borderRadius: 2,
                      fontSize: '0.875rem',
                      backgroundColor: '#ffffff',
                      '&:hover': {
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#cbd5e1'
                        }
                      },
                      '&.Mui-focused': {
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: theme.palette.primary.main,
                          borderWidth: '1.5px'
                        }
                      },
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#e2e8f0'
                      },
                      '& .MuiSelect-select': {
                        display: 'flex',
                        alignItems: 'center',
                        py: 1.25,
                        px: 1.5
                      }
                    }}
                    renderValue={(value) => {
                      const selectedYear = value === 'all' ? 'Todos os anos' : value;
                      return (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <CalendarMonthIcon sx={{ fontSize: 18, color: '#64748b' }} />
                          <Typography component='span' sx={{ fontSize: '0.875rem', color: '#0f172a' }}>
                            {selectedYear}
                          </Typography>
                        </Box>
                      );
                    }}
                  >
                    <MenuItem value='all' sx={{ fontSize: '0.875rem' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CalendarMonthIcon sx={{ fontSize: 18, color: '#64748b' }} />
                        <Typography component='span' sx={{ fontSize: '0.875rem' }}>Todos os anos</Typography>
                      </Box>
                    </MenuItem>
                    {years().slice(0, 10).map((year) => (
                      <MenuItem key={year} value={year} sx={{ fontSize: '0.875rem' }}>
                        {year}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Filtro de ordenação */}
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <FormControl fullWidth>
                  <Select
                    value={`${urlParams.get('sortBy') || 'name'}-${urlParams.get('sortOrder') || 'asc'}`}
                    onChange={(e) => {
                      const [sortBy, sortOrder] = e.target.value.split('-');
                      handleSortByChange(sortBy);
                      handleSortOrderChange(sortOrder);
                    }}
                    sx={{
                      height: 42,
                      borderRadius: 2,
                      fontSize: '0.875rem',
                      backgroundColor: '#ffffff',
                      '&:hover': {
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#cbd5e1'
                        }
                      },
                      '&.Mui-focused': {
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: theme.palette.primary.main,
                          borderWidth: '1.5px'
                        }
                      },
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#e2e8f0'
                      },
                      '& .MuiSelect-select': {
                        display: 'flex',
                        alignItems: 'center',
                        py: 1.25,
                        px: 1.5
                      }
                    }}
                    renderValue={(value) => {
                      const sortText = value === 'name-asc' ? 'Nome (A-Z)' : value === 'name-desc' ? 'Nome (Z-A)' : 'Nome (A-Z)';
                      return (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <SortIcon sx={{ fontSize: 18, color: '#64748b' }} />
                          <Typography component='span' sx={{ fontSize: '0.875rem', color: '#0f172a' }}>
                            {sortText}
                          </Typography>
                        </Box>
                      );
                    }}
                  >
                    <MenuItem value='name-asc' sx={{ fontSize: '0.875rem' }}>Nome (A-Z)</MenuItem>
                    <MenuItem value='name-desc' sx={{ fontSize: '0.875rem' }}>Nome (Z-A)</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Box>
        </Card>
      </Box>

      {/* Informação de Resultados */}
      {foldersData?.folders && foldersData.folders.length > 0 && (
        <Box
          sx={{
            px: { xs: 2, sm: 4, md: 6, lg: 8 },
            mb: 2.5,
            mt: 1,
            '@media (max-width: 767px)': {
              px: 1.5
            }
          }}
        >
          <Typography
            variant='body2'
            sx={{
              color: '#475569',
              fontSize: '0.875rem',
              fontWeight: 600
            }}
          >
            {foldersData.total} {foldersData.total === 1 ? 'pasta encontrada' : 'pastas encontradas'}
          </Typography>
        </Box>
      )}

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
        {sortedFolders && sortedFolders.length > 0 ? (
          <Grid
            container
            spacing={3}
          >
              {sortedFolders.map((folder) => (
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

