import {
  Box,
  Button,
  Card,
  LinearProgress,
  TextField,
  Typography,
  Grid,
  FormControl,
  MenuItem,
  Select,
  Pagination
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  CalendarToday as CalendarIcon,
  Edit as EditIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  RemoveCircle as RemoveCircleIcon,
  Visibility as VisibilityIcon,
  FilterAlt as FilterAltIcon,
  Clear as ClearIcon
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback, useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Loading, useNotification } from '@/components';
import { useProcesses, useSearchWithDebounce, useFolders } from '@/hooks';
import { useActiveDepartment } from '@/contexts';
import type { FilterProcessesDto, Process, CreateProcessDto } from '@/globals/types';
import { ProcessTable } from './components/ProcessTable';
import { ProcessSidebar } from './components/ProcessSidebar';
import { CreateProcessModal } from './components/CreateProcessModal';
import dayjs from 'dayjs';

const GerenciaProcessesPage = () => {
  const { activeDepartment } = useActiveDepartment();
  const { showNotification } = useNotification();
  const queryClient = useQueryClient();
  const [urlParams, setUrlParams] = useSearchParams();
  const { fetchProcessesByDepartment, createProcess } = useProcesses();
  const { fetchFolders } = useFolders();

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const {
    search: processSearch,
    debouncedSearch: debouncedProcessSearch,
    handleSearchChange: handleProcessSearchChange
  } = useSearchWithDebounce('search');

  // Buscar pastas para o modal de criar processo
  const { data: foldersData } = useQuery({
    queryKey: ['fetchFolders'],
    queryFn: async () => {
      return await fetchFolders({ limit: 100 });
    },
    enabled: createModalOpen
  });

  // Buscar processos do departamento
  const {
    data: processesData,
    isLoading: processesLoading,
    error: processesError,
    refetch: refetchProcesses
  } = useQuery({
    queryKey: [
      'fetchProcessesByDepartment',
      activeDepartment?._id,
      `search:${debouncedProcessSearch}`,
      `status:${urlParams.get('status') || ''}`,
      `priority:${urlParams.get('priority') || ''}`,
      `modality:${urlParams.get('modality') || ''}`,
      `currentStage:${urlParams.get('currentStage') || ''}`,
      `pending:${urlParams.get('pending') || ''}`,
      `date:${selectedDate?.toISOString() || ''}`,
      `page:${urlParams.get('page') || 1}`,
      `limit:${urlParams.get('limit') || 10}`
    ],
    enabled: !!activeDepartment?._id,
    refetchOnWindowFocus: false,
    queryFn: async () => {
      if (!activeDepartment?._id) {
        return { processes: [], total: 0, page: 1, limit: 10, totalPages: 1 };
      }

      const processFilters: FilterProcessesDto = {
        page: Number(urlParams.get('page') || 1),
        limit: Number(urlParams.get('limit') || 10)
      };

      // Busca: buscar tanto por processNumber quanto por object
      if (debouncedProcessSearch) {
        processFilters.processNumber = debouncedProcessSearch;
        processFilters.object = debouncedProcessSearch;
      }

      // Aplicar filtro de status da URL
      if (urlParams.get('status')) {
        processFilters.status = urlParams.get('status') as string;
      }

      if (urlParams.get('priority')) processFilters.priority = urlParams.get('priority') as string;
      if (urlParams.get('modality')) processFilters.modality = urlParams.get('modality') as string;
      if (urlParams.get('currentStage')) processFilters.currentStage = urlParams.get('currentStage') as string;

      try {
        return await fetchProcessesByDepartment(activeDepartment._id, processFilters);
      } catch (error: any) {
        console.error('Erro ao buscar processos:', error);
        showNotification(
          error?.response?.data?.message || error?.message || 'Erro ao buscar processos',
          'error'
        );
        return { processes: [], total: 0, page: 1, limit: 10, totalPages: 1 };
      }
    }
  });

  // Filtrar processos por data selecionada e pendência (filtros do frontend)
  const filteredProcesses = useMemo(() => {
    if (!processesData?.processes) return [];
    
    let filtered = processesData.processes;

    // Filtrar por pendência
    const pendingFilter = urlParams.get('pending');
    if (pendingFilter === 'yes') {
      // Processos com pendência: status "Em Andamento" (precisa assinar)
      filtered = filtered.filter((process: Process) => {
        return process.status === 'Em Andamento';
      });
    } else if (pendingFilter === 'no') {
      // Processos sem pendência: status "Concluído" ou "Em Atraso"
      filtered = filtered.filter((process: Process) => {
        return process.status === 'Concluído' || process.status === 'Em Atraso';
      });
    }

    // Filtrar por data selecionada
    if (selectedDate) {
      filtered = filtered.filter((process: Process) => {
        const processDate = process.dueDate;
        if (!processDate) return true;
        return dayjs(processDate).isSame(dayjs(selectedDate), 'day');
      });
    }

    return filtered;
  }, [processesData?.processes, selectedDate, urlParams]);

  // Mutation para criar processo
  const { mutate: createProcessMutation, isPending: creatingProcess } = useMutation({
    mutationFn: async (data: CreateProcessDto) => {
      return await createProcess(data);
    },
    onSuccess: () => {
      // Invalidar todas as queries relacionadas a processos
      queryClient.invalidateQueries({ queryKey: ['fetchProcessesByDepartment'] });
      queryClient.invalidateQueries({ queryKey: ['fetchProcesses'] });
      showNotification('Processo criado com sucesso!', 'success');
      setCreateModalOpen(false);
    },
    onError: (error: any) => {
      showNotification(error?.response?.data?.message || 'Erro ao criar processo', 'error');
    }
  });

  const handleCreateProcess = useCallback((data: CreateProcessDto) => {
    // Adicionar o departamento ativo como creatorDepartment
    const processData: CreateProcessDto = {
      ...data,
      creatorDepartment: activeDepartment?._id
    };
    createProcessMutation(processData);
  }, [createProcessMutation, activeDepartment]);

  const handleProcessClick = useCallback((process: Process) => {
    showNotification('Funcionalidade de visualizar processo em desenvolvimento', 'info');
  }, [showNotification]);

  const handleDateClick = useCallback((date: Date) => {
    setSelectedDate(date);
  }, []);

  // Verificar se há filtros ativos
  const hasActiveFilters = useMemo(() => {
    const status = urlParams.get('status');
    const pending = urlParams.get('pending');
    return !!(status || pending || debouncedProcessSearch);
  }, [urlParams, debouncedProcessSearch]);

  // Limpar filtros
  const handleClearFilters = useCallback(() => {
    const newParams = new URLSearchParams();
    setUrlParams(newParams);
    handleProcessSearchChange('');
  }, [setUrlParams, handleProcessSearchChange]);

  // Handlers de paginação
  const handleProcessesPageChange = useCallback((_event: unknown, newPage: number) => {
    const newParams = new URLSearchParams(urlParams);
    newParams.set('page', String(newPage));
    setUrlParams(newParams, { replace: true });
  }, [urlParams, setUrlParams]);

  const handleProcessesLimitChange = useCallback((event: any) => {
    const newLimit = Number(event.target.value);
    const newParams = new URLSearchParams(urlParams);
    newParams.set('limit', String(newLimit));
    newParams.set('page', '1');
    setUrlParams(newParams, { replace: true });
  }, [urlParams, setUrlParams]);

  if (!activeDepartment) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant='h6' color='error'>
          Nenhuma gerência selecionada
        </Typography>
      </Box>
    );
  }

  const processes = filteredProcesses;
  const totalProcesses = processesData?.total || filteredProcesses.length;
  const processesLimit = Number(urlParams.get('limit') || 10);
  const processesTotalPages = processesData?.totalPages || Math.ceil(totalProcesses / processesLimit);

  return (
    <Box sx={{ width: '100%' }}>
      {/* Header */}
      <Box
        sx={{
          py: { xs: 2, sm: 2.5, md: 3 },
          px: { xs: 2, sm: 3, md: 6, lg: 8 },
          '@media (max-width: 767px)': {
            py: 2,
            px: 1.5
          },
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', sm: 'center' },
          gap: { xs: 2, sm: 2.5, md: 3 }
        }}
      >
        <Box sx={{ width: { xs: '100%', md: 'auto' } }}>
          <Typography
            variant='h4'
            sx={{
              fontWeight: 700,
              fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2.25rem' },
              color: '#0f172a',
              mb: { xs: 0.75, md: 1 },
              lineHeight: { xs: 1.3, md: 1.2 }
            }}
          >
            Processos da Gerência
          </Typography>
          <Typography
            variant='body1'
            sx={{
              color: '#64748b',
              fontSize: { xs: '0.875rem', sm: '0.9375rem', md: '1rem' },
              maxWidth: { xs: '100%', md: '600px' },
              lineHeight: { xs: 1.5, md: 1.6 },
              mt: { xs: 0.5, md: 0 }
            }}
          >
            Tenha uma visão completa dos processos vinculados à sua gerência, reunidos em um único ambiente.
          </Typography>
        </Box>

        <Box 
          sx={{ 
            display: 'flex', 
            gap: { xs: 1.5, sm: 2 }, 
            flexWrap: { xs: 'wrap', sm: 'nowrap' },
            alignItems: 'center',
            width: { xs: '100%', sm: 'auto' }
          }}
        >
          <Button
            variant='contained'
            startIcon={<AddIcon />}
            onClick={() => setCreateModalOpen(true)}
            sx={{
              backgroundColor: '#1877F2',
              color: '#FFFFFF',
              textTransform: 'none',
              fontWeight: 600,
              px: { xs: 2, sm: 3 },
              py: { xs: 1, sm: 1.25 },
              borderRadius: 2,
              fontSize: { xs: '0.875rem', sm: '0.9375rem' },
              boxShadow: '0 2px 4px rgba(24, 119, 242, 0.2)',
              '&:hover': {
                backgroundColor: '#166fe5',
                boxShadow: '0 4px 8px rgba(24, 119, 242, 0.3)'
              },
              flexShrink: 0,
              whiteSpace: 'nowrap'
            }}
          >
            Novo Processo
          </Button>
        </Box>
      </Box>

      {/* Conteúdo Principal */}
      <Box
        sx={{
          px: { xs: 2, sm: 3, md: 6, lg: 8 },
          '@media (max-width: 767px)': {
            px: 1.5
          },
          pb: { xs: 4, sm: 5, md: 6 }
        }}
      >
        {/* Filtros de Pesquisa */}
        <Box sx={{ mb: { xs: 3, sm: 4, md: 4 } }}>
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
                px: { xs: 2, sm: 3 },
                py: { xs: 2, sm: 2.5 },
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderBottom: '1px solid',
                borderColor: '#f1f5f9',
                backgroundColor: '#fafbfc',
                flexWrap: { xs: 'wrap', sm: 'nowrap' },
                gap: { xs: 1.5, sm: 0 }
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 1.5 } }}>
                <FilterAltIcon sx={{ color: '#1877F2', fontSize: { xs: 18, sm: 20 } }} />
                <Typography
                  variant='subtitle1'
                  sx={{
                    fontWeight: 600,
                    fontSize: { xs: '0.875rem', sm: '0.9375rem' },
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
                  startIcon={<ClearIcon sx={{ fontSize: { xs: 14, sm: 16 } }} />}
                  onClick={handleClearFilters}
                  sx={{
                    minWidth: 'auto',
                    px: { xs: 1.5, sm: 2 },
                    py: { xs: 0.75, sm: 0.875 },
                    fontSize: { xs: '0.75rem', sm: '0.8125rem' },
                    fontWeight: 600,
                    color: '#64748b',
                    borderColor: '#cbd5e1',
                    textTransform: 'none',
                    borderRadius: 2,
                    backgroundColor: '#ffffff',
                    transition: 'all 0.2s ease-in-out',
                    width: { xs: '100%', sm: 'auto' },
                    mt: { xs: 1, sm: 0 },
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
            <Box sx={{ p: { xs: 2, sm: 2.5, md: 3 } }}>
              <Grid container spacing={{ xs: 2, sm: 2.5, md: 2.5 }}>
                {/* Campo de busca */}
                <Grid size={{ xs: 12, sm: 12, md: 6 }}>
                  <TextField
                    fullWidth
                    placeholder='Buscar por número ou objeto...'
                    value={processSearch}
                    onChange={(e) => handleProcessSearchChange(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <SearchIcon sx={{ color: '#94a3b8', fontSize: { xs: 18, sm: 20 }, mr: { xs: 1, sm: 1.5 } }} />
                      )
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        height: { xs: 40, sm: 42 },
                        borderRadius: 2,
                        backgroundColor: '#ffffff',
                        fontSize: { xs: '0.8125rem', sm: '0.875rem' },
                        transition: 'all 0.2s ease-in-out',
                        '&:hover': {
                          '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#cbd5e1'
                          }
                        },
                        '&.Mui-focused': {
                          '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#1877F2',
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
                        fontSize: { xs: '0.8125rem', sm: '0.875rem' }
                      }
                    }}
                  />
                </Grid>

                {/* Filtro de Status */}
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <FormControl fullWidth>
                    <Select
                      value={urlParams.get('status') || 'all'}
                      onChange={(e) => {
                        const newParams = new URLSearchParams(urlParams);
                        if (e.target.value === 'all') {
                          newParams.delete('status');
                        } else {
                          newParams.set('status', e.target.value);
                        }
                        setUrlParams(newParams);
                      }}
                      displayEmpty
                      sx={{
                        height: { xs: 40, sm: 42 },
                        borderRadius: 2,
                        fontSize: { xs: '0.8125rem', sm: '0.875rem' },
                        backgroundColor: '#ffffff',
                        '&:hover': {
                          '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#cbd5e1'
                          }
                        },
                        '&.Mui-focused': {
                          '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#1877F2',
                            borderWidth: '1.5px'
                          }
                        },
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#e2e8f0'
                        },
                        '& .MuiSelect-select': {
                          display: 'flex',
                          alignItems: 'center',
                          py: { xs: 1.125, sm: 1.25 },
                          px: { xs: 1.25, sm: 1.5 }
                        },
                        '& .MuiSelect-icon': {
                          color: '#64748b',
                          fontSize: { xs: 20, sm: 24 }
                        }
                      }}
                    >
                      <MenuItem value='all'>Todos os status</MenuItem>
                      <MenuItem value='Em Andamento'>Em Andamento</MenuItem>
                      <MenuItem value='Em Atraso'>Em Atraso</MenuItem>
                      <MenuItem value='Concluído'>Concluído</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                {/* Filtro de Pendência */}
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <FormControl fullWidth>
                    <Select
                      value={urlParams.get('pending') || 'all'}
                      onChange={(e) => {
                        const newParams = new URLSearchParams(urlParams);
                        if (e.target.value === 'all') {
                          newParams.delete('pending');
                        } else {
                          newParams.set('pending', e.target.value);
                        }
                        setUrlParams(newParams);
                      }}
                      displayEmpty
                      sx={{
                        height: { xs: 40, sm: 42 },
                        borderRadius: 2,
                        fontSize: { xs: '0.8125rem', sm: '0.875rem' },
                        backgroundColor: '#ffffff',
                        '&:hover': {
                          '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#cbd5e1'
                          }
                        },
                        '&.Mui-focused': {
                          '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#1877F2',
                            borderWidth: '1.5px'
                          }
                        },
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#e2e8f0'
                        },
                        '& .MuiSelect-select': {
                          display: 'flex',
                          alignItems: 'center',
                          py: { xs: 1.125, sm: 1.25 },
                          px: { xs: 1.25, sm: 1.5 }
                        },
                        '& .MuiSelect-icon': {
                          color: '#64748b',
                          fontSize: { xs: 20, sm: 24 }
                        }
                      }}
                      renderValue={(value) => {
                        if (value === 'all' || !value) {
                          return 'Todas as pendências';
                        }
                        if (value === 'yes') {
                          return 'Com pendência';
                        }
                        if (value === 'no') {
                          return 'Sem pendência';
                        }
                        return 'Todas as pendências';
                      }}
                    >
                      <MenuItem value='all'>Todas as pendências</MenuItem>
                      <MenuItem value='yes'>Com pendência</MenuItem>
                      <MenuItem value='no'>Sem pendência</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </Box>
          </Card>
        </Box>

        {/* Conteúdo Principal */}
        <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', lg: 'row' } }}>
        {/* Área Principal */}
        <Box sx={{ flex: 1, minWidth: 0 }}>

          {/* Tabela de Processos */}
          {processesLoading ? (
            <Loading isLoading={true} />
          ) : processesError ? (
            <Card
              sx={{
                p: 4,
                textAlign: 'center',
                borderRadius: 2,
                border: '1px solid #E4E6EB',
                backgroundColor: '#FFFFFF'
              }}
            >
              <Typography variant='h6' color='error' sx={{ mb: 1 }}>
                Erro ao carregar processos
              </Typography>
              <Typography variant='body2' color='text.secondary'>
                {processesError instanceof Error 
                  ? processesError.message 
                  : 'Ocorreu um erro ao buscar os processos. Tente novamente.'}
              </Typography>
            </Card>
          ) : (
            <>
              <ProcessTable
                processes={processes}
                onProcessClick={handleProcessClick}
              />
              
              {/* Paginação */}
              {totalProcesses > 0 && (
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
                    {Math.min(Number(urlParams.get('page') || 1) * Number(urlParams.get('limit') || 10), totalProcesses)} de {totalProcesses}
                  </Typography>

                  {/* Pagination Controls */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Select
                      value={processesLimit}
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
                      count={processesTotalPages}
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

        {/* Sidebar */}
        <Box sx={{ width: { xs: '100%', lg: 320 }, flexShrink: 0 }}>
          <ProcessSidebar
            onDateClick={handleDateClick}
            selectedDate={selectedDate}
            processes={processes}
          />
        </Box>
      </Box>
      </Box>

      {/* Modal de Criar Processo */}
      <CreateProcessModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSave={handleCreateProcess}
        loading={creatingProcess}
        folders={foldersData?.folders || []}
      />
    </Box>
  );
};

export default GerenciaProcessesPage;

