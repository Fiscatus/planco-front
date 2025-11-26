import {
  Add as AddIcon,
  Delete as DeleteIcon,
  FilterListOff as FilterListOffIcon,
  MailOutline as MailOutlineIcon,
  Refresh as RefreshIcon,
  Search as SearchIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogContent,
  FormControl,
  Grid,
  IconButton,
  MenuItem,
  Pagination,
  Paper,
  Select,
  Skeleton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
  useTheme
} from '@mui/material';
import type { CreateInviteDto, FilterInvitesDto, Invite, InviteStatus } from '@/globals/types';
import { Loading, useNotification } from '@/components';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useDebounce, useDepartments, useInvites, useRoles, useScreen } from '@/hooks';
import { useMutation, useQuery } from '@tanstack/react-query';

import { useSearchParams } from 'react-router-dom';

interface InvitesSectionProps {
  currentTab: 'users' | 'gerencias' | 'invites' | 'roles';
}

const InvitesSection = ({ currentTab }: InvitesSectionProps) => {
  const theme = useTheme();
  const { isMobile } = useScreen();
  const [urlParams, setUrlParams] = useSearchParams();
  const [localSearch, setLocalSearch] = useState(urlParams.get('name') || '');
  const debouncedLocalSearch = useDebounce(localSearch, 300);

  // Atualiza URL params apenas quando o debounce for processado
  useEffect(() => {
    const currentName = urlParams.get('name') || '';
    if (debouncedLocalSearch !== currentName) {
      const newParams = new URLSearchParams(urlParams);
      if (debouncedLocalSearch.trim() === '') {
        newParams.delete('name');
        newParams.delete('email');
      } else {
        newParams.set('name', debouncedLocalSearch);
        newParams.set('email', debouncedLocalSearch);
      }
      newParams.set('page', '1');
      setUrlParams(newParams, { replace: true });
    }
  }, [debouncedLocalSearch, urlParams, setUrlParams]);

  const { showNotification } = useNotification();
  const { fetchInvites, createInvite, deleteInvite } = useInvites();
  const { fetchRoles } = useRoles();
  const { fetchDepartments } = useDepartments();

  useEffect(() => {
    if (currentTab !== 'invites') {
      setUrlParams({}, { replace: true });
    } else {
      // Inicializar page e limit se não existirem
      const hasPage = urlParams.has('page');
      const hasLimit = urlParams.has('limit');
      if (!hasPage || !hasLimit) {
        const newParams = new URLSearchParams(urlParams);
        if (!hasPage) newParams.set('page', '1');
        if (!hasLimit) newParams.set('limit', '10');
        setUrlParams(newParams, { replace: true });
      }
    }
  }, [currentTab, urlParams, setUrlParams]);

  // Limpar parâmetros vazios da URL
  useEffect(() => {
    if (currentTab === 'invites') {
      const newParams = new URLSearchParams(urlParams);
      let hasChanges = false;

      const status = newParams.get('status');
      if (status === '') {
        newParams.delete('status');
        hasChanges = true;
      }

      const role = newParams.get('role');
      if (role === '') {
        newParams.delete('role');
        hasChanges = true;
      }

      if (hasChanges) {
        setUrlParams(newParams, { replace: true });
      }
    }
  }, [currentTab, urlParams, setUrlParams]);

  const [rolesDropdownOpen, setRolesDropdownOpen] = useState(false);
  const [departmentsDropdownOpen, setDepartmentsDropdownOpen] = useState(false);

  const invitesQueryKey = useMemo(() => [
    'fetchInvites', 
    `page:${urlParams.get('page') || 1}`,
    `limit:${urlParams.get('limit') || 5}`,
    `status:${urlParams.get('status') || ''}`,
    `email:${urlParams.get('email') || ''}`,
    `role:${urlParams.get('role') || ''}`
  ], [urlParams]);

  const {
    data: invitesData,
    isLoading: invitesLoading,
    error: invitesError,
    refetch: refetchInvites
  } = useQuery({
    queryKey: invitesQueryKey,
    refetchOnWindowFocus: false,
    queryFn: async () => {
      const filters: FilterInvitesDto = {
        page: urlParams.get('page') || '1',
        limit: urlParams.get('limit') || '10',
        status: (urlParams.get('status') as InviteStatus) || undefined,
        email: urlParams.get('email') || '',
        role: urlParams.get('role') || ''
      };
      return await fetchInvites(filters);
    }
  });

  const { data: rolesData, refetch: refetchRoles } = useQuery({
    queryKey: ['fetchRoles'],
    refetchOnWindowFocus: false,
    enabled: false,
    queryFn: async () => {
      return await fetchRoles();
    }
  });

  const { data: departmentsData, refetch: refetchDepartments } = useQuery({
    queryKey: ['fetchDepartments'],
    refetchOnWindowFocus: false,
    enabled: false,
    queryFn: async () => {
      return await fetchDepartments();
    }
  });

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [createForm, setCreateForm] = useState<CreateInviteDto>({
    email: '',
    roleId: '',
    departmentIds: []
  });

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [inviteToDelete, setInviteToDelete] = useState<Invite | null>(null);

  const { mutate: createInviteMutation, isPending: creatingInvite } = useMutation({
    mutationFn: async (data: CreateInviteDto) => {
      return await createInvite(data);
    },
    onError: (error: any) => {
      let errorMessage = 'Erro ao criar convite';

      if (error?.response?.data?.message) {
        const message = error.response.data.message;
        if (message.includes('Email não está cadastrado')) {
          errorMessage = 'Este email não está cadastrado no sistema';
        } else if (message.includes('já existe um convite pendente')) {
          errorMessage = 'Já existe um convite pendente para este email';
        } else if (message.includes('já existe nesta organização')) {
          errorMessage = 'Este usuário já pertence à organização';
        } else {
          errorMessage = message;
        }
      }

      showNotification(errorMessage, 'error');
    },
    onSuccess: () => {
      showNotification('Convite criado com sucesso!', 'success');
      setCreateModalOpen(false);
      setCreateForm({ email: '', roleId: '', departmentIds: [] });
      refetchInvites();
    }
  });

  const { mutate: deleteInviteMutation, isPending: deletingInvite } = useMutation({
    mutationFn: async (inviteId: string) => {
      return await deleteInvite(inviteId);
    },
    onError: (error: any) => {
      let errorMessage = 'Erro ao deletar convite';

      if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      }

      showNotification(errorMessage, 'error');
    },
    onSuccess: () => {
      showNotification('Convite deletado com sucesso!', 'success');
      setDeleteConfirmOpen(false);
      setInviteToDelete(null);
      refetchInvites();
    }
  });

  const handleRolesDropdownOpen = useCallback(async () => {
    setRolesDropdownOpen(true);
    if (!rolesData) {
      await refetchRoles();
    }
  }, [rolesData, refetchRoles]);

  const handleDepartmentsDropdownOpen = useCallback(async () => {
    setDepartmentsDropdownOpen(true);
    if (!departmentsData) {
      await refetchDepartments();
    }
  }, [departmentsData, refetchDepartments]);

  const handleClearFilters = useCallback(() => {
    setUrlParams({}, { replace: true });
  }, [setUrlParams]);

  const handlePageChange = useCallback(
    (_event: unknown, newPage: number) => {
      urlParams.set('page', String(newPage));
      setUrlParams(urlParams, { replace: true });
    },
    [urlParams, setUrlParams]
  );

  const handleLimitChange = useCallback(
    (newLimit: number) => {
      urlParams.set('limit', String(newLimit));
      urlParams.set('page', '1');
      setUrlParams(urlParams, { replace: true });
    },
    [urlParams, setUrlParams]
  );

  const handleOpenCreate = useCallback(() => {
    setCreateForm({
      email: '',
      roleId: '',
      departmentIds: []
    });
    setCreateModalOpen(true);
  }, []);

  const handleCreateInvite = useCallback(() => {
    if (!createForm.email || !createForm.roleId) return;
    createInviteMutation(createForm);
  }, [createForm, createInviteMutation]);

  const handleOpenDeleteConfirm = useCallback((invite: Invite) => {
    setInviteToDelete(invite);
    setDeleteConfirmOpen(true);
  }, []);

  const handleConfirmDelete = useCallback(() => {
    if (!inviteToDelete?._id) return;
    deleteInviteMutation(inviteToDelete._id);
  }, [inviteToDelete, deleteInviteMutation]);

  const handleCancelDelete = useCallback(() => {
    setDeleteConfirmOpen(false);
    setInviteToDelete(null);
  }, []);

  const handleRefresh = useCallback(() => {
    refetchInvites();
  }, [refetchInvites]);

  const getStatusColor = (status: InviteStatus): 'primary' | 'success' | 'error' | 'warning' | 'default' => {
    switch (status) {
      case 'pendente':
        return 'primary';
      case 'aceito':
        return 'success';
      case 'recusado':
        return 'error';
      case 'expirado':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getStatusChipProps = (status: InviteStatus) => {
    switch (status) {
      case 'aceito':
        return {
          sx: {
            backgroundColor: 'success.main',
            color: 'white',
            fontWeight: 600,
            '&:hover': {
              backgroundColor: '#059669'
            }
          }
        };
      default:
        return {};
    }
  };

  const getStatusText = (status: InviteStatus) => {
    switch (status) {
      case 'pendente':
        return 'pendente';
      case 'aceito':
        return 'aceito';
      case 'recusado':
        return 'recusado';
      case 'expirado':
        return 'expirado';
      default:
        return status;
    }
  };

  return (
    <Box sx={{ p: 2 }}>
      <Card
        sx={{
          borderRadius: 0,
          boxShadow: 'none',
          border: 'none',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        <CardContent sx={{ p: 4, display: 'flex', flexDirection: 'column' }}>
          {/* Filtros e Ações Responsivos */}
          <Box sx={{ mb: 4 }}>
            <Grid
              container
              spacing={2}
            >
              {/* Campo de busca - agora inline com outros filtros */}
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <TextField
                  fullWidth
                  size='small'
                  placeholder='Buscar por email ou nome'
                  value={localSearch}
                  onChange={(e) => {
                    setLocalSearch(e.target.value);
                  }}
                  InputProps={{
                    startAdornment: <SearchIcon sx={{ mr: 1, color: '#9ca3af', fontSize: '1.25rem' }} />,
                    sx: { height: 40 }
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 3,
                      backgroundColor: '#ffffff',
                      border: '2px solid #e5e7eb',
                      transition: 'all 0.2s ease-in-out',
                      '&:hover': {
                        borderColor: '#d1d5db'
                      },
                      '&.Mui-focused': {
                        borderColor: theme.palette.primary.main,
                        boxShadow: `0 0 0 3px ${theme.palette.primary.main}20`
                      }
                    },
                    '& .MuiInputBase-input::placeholder': {
                      color: '#9ca3af',
                      opacity: 1,
                      fontWeight: 400
                    }
                  }}
                />
              </Grid>

              {/* Filtros - xs: empilhados, sm: duas colunas, md+: linha única */}
              <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                <FormControl
                  fullWidth
                  size='small'
                >
                  <Select
                    value={urlParams.get('status') || 'todos'}
                    displayEmpty
                    onChange={(e) => {
                      const value = e.target.value;
                      const newParams = new URLSearchParams(urlParams);
                      const statusValue = value === 'todos' ? '' : value;
                      if (statusValue === '') {
                        newParams.delete('status');
                      } else {
                        newParams.set('status', statusValue);
                      }
                      newParams.set('page', '1');
                      setUrlParams(newParams, { replace: true });
                    }}
                    sx={{
                      height: 40,
                      borderRadius: 3,
                      backgroundColor: '#ffffff',
                      '& .MuiOutlinedInput-notchedOutline': {
                        border: '2px solid #e5e7eb',
                        transition: 'all 0.2s ease-in-out'
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#d1d5db'
                      },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: theme.palette.primary.main,
                        boxShadow: `0 0 0 3px ${theme.palette.primary.main}20`
                      },
                      '& .MuiSelect-select': {
                        color: !urlParams.get('status') ? '#9ca3af' : '#374151'
                      }
                    }}
                    renderValue={(value) => {
                      if (value === 'todos' || value === undefined) {
                        return <span style={{ color: '#9ca3af' }}>Status</span>;
                      }
                      return value === 'pendente'
                        ? 'Pendente'
                        : value === 'aceito'
                          ? 'Aceito'
                          : value === 'recusado'
                            ? 'Recusado'
                            : value === 'expirado'
                              ? 'Expirado'
                              : value;
                    }}
                  >
                    <MenuItem 
                      value='todos'
                      sx={{
                        '&:hover': {
                          backgroundColor: '#f8fafc'
                        },
                        '&.Mui-selected': {
                          backgroundColor: '#f1f5f9',
                          '&:hover': {
                            backgroundColor: '#f1f5f9'
                          }
                        }
                      }}
                    >
                      Todos
                    </MenuItem>
                    <MenuItem 
                      value='pendente'
                      sx={{
                        '&:hover': {
                          backgroundColor: '#f8fafc'
                        },
                        '&.Mui-selected': {
                          backgroundColor: '#f1f5f9',
                          '&:hover': {
                            backgroundColor: '#f1f5f9'
                          }
                        }
                      }}
                    >
                      Pendente
                    </MenuItem>
                    <MenuItem 
                      value='aceito'
                      sx={{
                        '&:hover': {
                          backgroundColor: '#f8fafc'
                        },
                        '&.Mui-selected': {
                          backgroundColor: '#f1f5f9',
                          '&:hover': {
                            backgroundColor: '#f1f5f9'
                          }
                        }
                      }}
                    >
                      Aceito
                    </MenuItem>
                    <MenuItem 
                      value='recusado'
                      sx={{
                        '&:hover': {
                          backgroundColor: '#f8fafc'
                        },
                        '&.Mui-selected': {
                          backgroundColor: '#f1f5f9',
                          '&:hover': {
                            backgroundColor: '#f1f5f9'
                          }
                        }
                      }}
                    >
                      Recusado
                    </MenuItem>
                    <MenuItem 
                      value='expirado'
                      sx={{
                        '&:hover': {
                          backgroundColor: '#f8fafc'
                        },
                        '&.Mui-selected': {
                          backgroundColor: '#f1f5f9',
                          '&:hover': {
                            backgroundColor: '#f1f5f9'
                          }
                        }
                      }}
                    >
                      Expirado
                    </MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                <FormControl
                  fullWidth
                  size='small'
                >
                  <Select
                    value={urlParams.get('role') || ''}
                    displayEmpty
                    onChange={(e) => {
                      const newParams = new URLSearchParams(urlParams);
                      const roleValue = e.target.value;
                      if (roleValue === '') {
                        newParams.delete('role');
                      } else {
                        newParams.set('role', roleValue);
                      }
                      newParams.set('page', '1');
                      setUrlParams(newParams, { replace: true });
                    }}
                    onOpen={handleRolesDropdownOpen}
                    disabled={invitesLoading}
                    sx={{
                      height: 40,
                      borderRadius: 3,
                      backgroundColor: '#ffffff',
                      '& .MuiOutlinedInput-notchedOutline': {
                        border: '2px solid #e5e7eb',
                        transition: 'all 0.2s ease-in-out'
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#d1d5db'
                      },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: theme.palette.primary.main,
                        boxShadow: `0 0 0 3px ${theme.palette.primary.main}20`
                      },
                      '& .MuiSelect-select': {
                        color: !urlParams.get('role') ? '#9ca3af' : '#374151'
                      }
                    }}
                    renderValue={(value) => {
                      if (!value) {
                        return <span style={{ color: '#9ca3af' }}>Role</span>;
                      }
                      const role = (rolesData || []).find((r) => r._id === value);
                      return role ? role.name : value;
                    }}
                  >
                    <MenuItem 
                      value=''
                      sx={{
                        '&:hover': {
                          backgroundColor: '#f8fafc'
                        },
                        '&.Mui-selected': {
                          backgroundColor: '#f1f5f9',
                          '&:hover': {
                            backgroundColor: '#f1f5f9'
                          }
                        }
                      }}
                    >
                      <em>Todas as roles</em>
                    </MenuItem>
                    {!rolesData ? (
                      <MenuItem disabled>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <CircularProgress size={20} />
                          Carregando roles...
                        </Box>
                      </MenuItem>
                    ) : (
                      (rolesData || []).map((role) => (
                        <MenuItem
                          key={role._id}
                          value={role._id}
                          sx={{
                            '&:hover': {
                              backgroundColor: '#f8fafc'
                            },
                            '&.Mui-selected': {
                              backgroundColor: '#f1f5f9',
                              '&:hover': {
                                backgroundColor: '#f1f5f9'
                              }
                            }
                          }}
                        >
                          {role.name}
                        </MenuItem>
                      ))
                    )}
                  </Select>
                </FormControl>
              </Grid>

              {/* Botão limpar filtros - só aparece no desktop */}
              {!isMobile && (
                <Grid size={{ xs: 12, sm: 6, md: 1 }}>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'flex-start',
                      alignItems: 'center',
                      height: '100%',
                      minHeight: '40px'
                    }}
                  >
                    <IconButton
                      onClick={handleClearFilters}
                      disabled={invitesLoading}
                      title='Limpar filtros'
                      sx={{
                        backgroundColor: '#f3f4f6',
                        color: '#6b7280',
                        borderRadius: 3,
                        p: 1.5,
                        transition: 'all 0.2s ease-in-out',
                        '&:hover': {
                          backgroundColor: '#fee2e2',
                          color: '#dc2626',
                          transform: 'scale(1.05)'
                        },
                        '&:disabled': {
                          backgroundColor: '#f9fafb',
                          color: '#d1d5db'
                        }
                      }}
                    >
                      <FilterListOffIcon sx={{ fontSize: '1.25rem' }} />
                    </IconButton>
                  </Box>
                </Grid>
              )}

              {/* Botões de ação - xs-sm: full width abaixo dos filtros, md+: alinhado à direita */}
              <Grid size={{ xs: 12, sm: 12, md: 'auto' }}>
                <Box
                  sx={{
                    display: 'flex',
                    gap: 1,
                    alignItems: 'center',
                    justifyContent: { xs: 'space-between', sm: 'space-between', md: 'flex-end' },
                    width: { xs: '100%', sm: '100%', md: '100%' },
                    height: { md: '40px' }
                  }}
                >
                  {/* Botão limpar filtros - só aparece no mobile */}
                  {isMobile && (
                    <IconButton
                      onClick={handleClearFilters}
                      disabled={invitesLoading}
                      title='Limpar filtros'
                      sx={{
                        backgroundColor: '#f3f4f6',
                        color: '#6b7280',
                        borderRadius: 3,
                        p: 1.5,
                        transition: 'all 0.2s ease-in-out',
                        '&:hover': {
                          backgroundColor: '#fee2e2',
                          color: '#dc2626',
                          transform: 'scale(1.05)'
                        },
                        '&:disabled': {
                          backgroundColor: '#f9fafb',
                          color: '#d1d5db'
                        }
                      }}
                    >
                      <FilterListOffIcon sx={{ fontSize: '1.25rem' }} />
                    </IconButton>
                  )}

                  {/* Botão Novo Convite */}
                  <Button
                    startIcon={<AddIcon />}
                    onClick={handleOpenCreate}
                    variant='contained'
                    color='success'
                    fullWidth={isMobile}
                    size={isMobile ? 'medium' : 'small'}
                    sx={{
                      height: isMobile ? '48px' : '40px',
                      borderRadius: 3,
                      textTransform: 'uppercase',
                      fontWeight: 600,
                      letterSpacing: '0.05em',
                      px: isMobile ? 4 : 3,
                      backgroundColor: '#10b981',
                      color: '#ffffff',
                      boxShadow: '0 2px 8px rgba(16, 185, 129, 0.2)',
                      transition: 'all 0.2s ease-in-out',
                      '&:hover': {
                        backgroundColor: '#059669',
                        boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
                        transform: 'translateY(-1px)'
                      },
                      '&:active': {
                        transform: 'translateY(0)',
                        boxShadow: '0 2px 8px rgba(16, 185, 129, 0.2)'
                      }
                    }}
                  >
                    Novo Convite
                  </Button>

                  {/* Botão Atualizar */}
                  <Button
                    startIcon={<RefreshIcon sx={{ fontSize: '1.25rem' }} />}
                    onClick={handleRefresh}
                    disabled={invitesLoading}
                    variant='contained'
                    color='primary'
                    fullWidth={isMobile}
                    size={isMobile ? 'medium' : 'small'}
                    sx={{
                      height: isMobile ? '48px' : '40px',
                      borderRadius: 3,
                      textTransform: 'uppercase',
                      fontWeight: 600,
                      letterSpacing: '0.05em',
                      px: isMobile ? 4 : 3,
                      boxShadow: '0 2px 8px rgba(25, 118, 210, 0.2)',
                      transition: 'all 0.2s ease-in-out',
                      '&:hover': {
                        boxShadow: '0 4px 12px rgba(25, 118, 210, 0.3)',
                        transform: 'translateY(-1px)'
                      },
                      '&:active': {
                        transform: 'translateY(0)',
                        boxShadow: '0 2px 8px rgba(25, 118, 210, 0.2)'
                      },
                      '&:disabled': {
                        backgroundColor: '#e3f2fd',
                        color: '#90caf9',
                        boxShadow: 'none',
                        transform: 'none'
                      }
                    }}
                  >
                    Atualizar
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </Box>

          {invitesError && (
            <Alert
              severity='error'
              sx={{
                mb: 3,
                borderRadius: 3,
                border: '1px solid #fecaca',
                backgroundColor: '#fef2f2',
                '& .MuiAlert-icon': {
                  color: '#dc2626'
                },
                '& .MuiAlert-message': {
                  color: '#991b1b',
                  fontWeight: 500
                }
              }}
            >
              {invitesError?.message || 'Erro ao carregar convites'}
            </Alert>
          )}

          {/* Desktop Table View */}
          {!isMobile && (
            <TableContainer
              component={Paper}
              variant='outlined'
              sx={{
                borderRadius: 2,
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                border: '1px solid #e5e7eb',
                overflow: 'hidden',
                display: 'block',
                maxHeight: 'calc(100vh - 300px)',
                minHeight: 'auto'
              }}
            >
              <Table
                stickyHeader
                sx={{
                  '& .MuiTableRow-root': {
                    height: 64,
                    '&:hover': {
                      backgroundColor: 'rgba(5, 50, 105, 0.02)',
                      transform: 'translateY(-1px)',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                      transition: 'all 0.2s ease-in-out'
                    }
                  }
                }}
              >
                <TableHead>
                  <TableRow
                    sx={{
                      backgroundColor: '#f8fafc',
                      height: 64,
                      '& .MuiTableCell-head': {
                        backgroundColor: '#f8fafc',
                        color: '#374151',
                        fontWeight: 600,
                        fontSize: '0.875rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        borderBottom: '2px solid #e5e7eb',
                        py: 2,
                        verticalAlign: 'middle'
                      }
                    }}
                  >
                    <TableCell>Email</TableCell>
                    <TableCell>Role</TableCell>
                    <TableCell>Gerências</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Convidado por</TableCell>
                    <TableCell>Criado em</TableCell>
                    <TableCell>Expira em</TableCell>
                    <TableCell align='center'>Ações</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {invitesLoading ? (
                    <TableRow>
                      <TableCell
                        colSpan={8}
                        align='center'
                        sx={{
                          py: 6,
                          backgroundColor: '#fafafa'
                        }}
                      >
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                          <CircularProgress
                            size={32}
                            sx={{ color: theme.palette.primary.main }}
                          />
                          <Typography
                            variant='body2'
                            sx={{
                              color: '#6b7280',
                              fontWeight: 500
                            }}
                          >
                            Carregando convites...
                          </Typography>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ) : (invitesData?.invites || []).length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={8}
                        align='center'
                        sx={{
                          py: 6,
                          backgroundColor: '#fafafa'
                        }}
                      >
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                          <MailOutlineIcon sx={{ fontSize: 48, color: '#9ca3af' }} />
                          <Typography
                            variant='h6'
                            sx={{
                              color: '#6b7280',
                              fontWeight: 500
                            }}
                          >
                            Nenhum convite encontrado
                          </Typography>
                          <Typography
                            variant='body2'
                            sx={{
                              color: '#9ca3af',
                              fontStyle: 'italic'
                            }}
                          >
                            Tente ajustar os filtros de busca
                          </Typography>
                          <Button
                            onClick={handleOpenCreate}
                            variant='outlined'
                            size='small'
                            sx={{ mt: 1 }}
                          >
                            Novo Convite
                          </Button>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ) : (
                    (invitesData?.invites || []).map((invite) => (
                      <TableRow
                        key={invite._id}
                        sx={{
                          '& .MuiTableCell-root': {
                            borderBottom: '1px solid #f1f5f9',
                            py: 2,
                            transition: 'all 0.2s ease-in-out',
                            verticalAlign: 'middle'
                          }
                        }}
                      >
                        <TableCell>
                          <Typography
                            variant='body2'
                            fontWeight={500}
                          >
                            {invite.email}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={invite.role.name}
                            size='small'
                            variant='filled'
                            sx={{
                              backgroundColor: 'warning.main',
                              color: 'white',
                              fontWeight: 600,
                              borderRadius: 2,
                              '& .MuiChip-label': {
                                px: 1.5
                              }
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          {(() => {
                            if (invite.departments && invite.departments.length > 0) {
                              return (
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                  {invite.departments.map((dept) => (
                                    <Chip
                                      key={dept._id}
                                      label={dept.department_name}
                                      size='small'
                                      variant='filled'
                                      sx={{
                                        backgroundColor: '#15803d',
                                        color: 'white',
                                        fontWeight: 600,
                                        borderRadius: 2,
                                        '& .MuiChip-label': {
                                          px: 1.5
                                        },
                                        '&:hover': {
                                          backgroundColor: '#166534'
                                        }
                                      }}
                                    />
                                  ))}
                                </Box>
                              );
                            }

                            return (
                              <Typography
                                variant='body2'
                                color='text.secondary'
                                sx={{ fontStyle: 'italic' }}
                              >
                                Sem gerências
                              </Typography>
                            );
                          })()}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={getStatusText(invite.status)}
                            size='small'
                            color={getStatusColor(invite.status)}
                            {...getStatusChipProps(invite.status)}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant='body2'>
                            {invite.invitedBy.firstName} {invite.invitedBy.lastName}
                          </Typography>
                          <Typography
                            variant='caption'
                            color='text.secondary'
                          >
                            {invite.invitedBy.email}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant='body2'>
                            {new Date(invite.createdAt).toLocaleDateString('pt-BR')}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant='body2'>
                            {new Date(invite.expiresAt).toLocaleDateString('pt-BR')}
                          </Typography>
                        </TableCell>
                        <TableCell align='center'>
                          <IconButton
                            size='small'
                            onClick={() => handleOpenDeleteConfirm(invite)}
                            aria-label='Excluir convite'
                            sx={{
                              color: '#dc2626',
                              backgroundColor: 'transparent',
                              borderRadius: 2,
                              p: 1,
                              transition: 'all 0.2s ease-in-out',
                              '&:hover': {
                                backgroundColor: '#fef2f2',
                                color: '#b91c1c',
                                transform: 'scale(1.1)'
                              }
                            }}
                          >
                            <DeleteIcon sx={{ fontSize: '1.25rem' }} />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {/* Mobile Cards View */}
          {isMobile && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {invitesLoading ? (
                // Loading skeletons for mobile
                Array.from({ length: 3 }).map(() => {
                  const uniqueKey = crypto.randomUUID();
                  return (
                    <Paper
                      key={`skeleton-${uniqueKey}`}
                      variant='outlined'
                      sx={{
                        p: 2,
                        borderRadius: 2,
                        border: '1px solid #e5e7eb'
                      }}
                    >
                      <Skeleton
                        variant='rectangular'
                        height={84}
                      />
                    </Paper>
                  );
                })
              ) : (invitesData?.invites || []).length === 0 ? (
                // Empty state for mobile
                <Paper
                  variant='outlined'
                  sx={{
                    p: 4,
                    borderRadius: 2,
                    border: '1px solid #e5e7eb',
                    textAlign: 'center',
                    backgroundColor: '#fafafa'
                  }}
                >
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                    <MailOutlineIcon sx={{ fontSize: 48, color: '#9ca3af' }} />
                    <Typography
                      variant='h6'
                      sx={{
                        color: '#6b7280',
                        fontWeight: 500
                      }}
                    >
                      Nenhum convite encontrado
                    </Typography>
                    <Typography
                      variant='body2'
                      sx={{
                        color: '#9ca3af',
                        fontStyle: 'italic'
                      }}
                    >
                      Tente ajustar os filtros de busca
                    </Typography>
                    <Button
                      onClick={handleOpenCreate}
                      variant='outlined'
                      size='small'
                      sx={{ mt: 1 }}
                    >
                      Novo Convite
                    </Button>
                  </Box>
                </Paper>
              ) : (
                // Invite cards for mobile
                (invitesData?.invites || []).map((invite) => (
                  <Paper
                    key={invite._id}
                    variant='outlined'
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      border: '1px solid #e5e7eb',
                      transition: 'all 0.2s ease-in-out',
                      '&:hover': {
                        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                        transform: 'translateY(-1px)'
                      }
                    }}
                  >
                    <Stack spacing={1.5}>
                      {/* Top: Email */}
                      <Tooltip
                        title={invite.email}
                        arrow
                      >
                        <Typography
                          variant='subtitle1'
                          fontWeight={600}
                          noWrap
                          sx={{
                            color: '#1f2937',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                          }}
                        >
                          {invite.email}
                        </Typography>
                      </Tooltip>

                      {/* Middle: Role and Status chips */}
                      <Stack
                        direction='row'
                        spacing={1}
                        flexWrap='wrap'
                        useFlexGap
                      >
                        <Chip
                          label={invite.role.name}
                          size='small'
                          variant='filled'
                          sx={{
                            backgroundColor: 'warning.main',
                            color: 'white',
                            fontWeight: 600,
                            borderRadius: 2,
                            '& .MuiChip-label': {
                              px: 1.5
                            }
                          }}
                        />
                        <Chip
                          label={getStatusText(invite.status)}
                          size='small'
                          variant='outlined'
                          color={getStatusColor(invite.status)}
                          {...getStatusChipProps(invite.status)}
                        />
                      </Stack>

                      {/* Bottom: Actions */}
                      <Stack
                        direction='row'
                        spacing={1}
                        justifyContent='flex-end'
                      >
                        <IconButton
                          size='large'
                          onClick={() => handleOpenDeleteConfirm(invite)}
                          aria-label='Excluir convite'
                          sx={{
                            color: '#dc2626',
                            backgroundColor: 'transparent',
                            borderRadius: 2,
                            minWidth: 44,
                            minHeight: 44,
                            transition: 'all 0.2s ease-in-out',
                            '&:hover': {
                              backgroundColor: '#fef2f2',
                              color: '#b91c1c',
                              transform: 'scale(1.1)'
                            }
                          }}
                        >
                          <DeleteIcon sx={{ fontSize: '1.25rem' }} />
                        </IconButton>
                      </Stack>
                    </Stack>
                  </Paper>
                ))
              )}
            </Box>
          )}

          {/* Pagination */}
          <Box
            sx={{
              p: 4,
              display: 'flex',
              flexDirection: { xs: 'column', md: 'row' },
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: 2,
              backgroundColor: '#f8fafc',
              borderTop: '1px solid #e5e7eb'
            }}
          >
            {/* Pagination Info */}
            <Typography
              variant='body2'
              sx={{ color: '#6b7280', fontSize: '0.875rem' }}
            >
              {invitesData ? (
                <>
                  {(Number(urlParams.get('page') || 1) - 1) * Number(urlParams.get('limit') || 10) + 1}-
                  {Math.min(Number(urlParams.get('page') || 1) * Number(urlParams.get('limit') || 10), invitesData.total)} de {invitesData.total}
                </>
              ) : (
                '0 de 0'
              )}
            </Typography>

            {/* Pagination Controls */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Select
                value={urlParams.get('limit') || 10}
                onChange={(e) => handleLimitChange(Number(e.target.value))}
                sx={{ minWidth: 120, height: 32, fontSize: '0.875rem' }}
              >
                {[5, 10, 25, 50].map((limit) => (
                  <MenuItem 
                    key={limit} 
                    value={limit}
                    sx={{
                      '&:hover': {
                        backgroundColor: '#f8fafc'
                      },
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
                count={invitesData ? Math.ceil(invitesData.total / Number(urlParams.get('limit') || 10)) : 0}
                page={Number(urlParams.get('page') || 1)}
                onChange={(_e, value) => handlePageChange(_e, value)}
                variant='outlined'
                shape='rounded'
                showFirstButton={!isMobile}
                showLastButton={!isMobile}
              />
            </Box>
          </Box>
        </CardContent>
      </Card>

      <Dialog
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        maxWidth='sm'
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            overflow: 'hidden'
          }
        }}
      >
        <DialogContent sx={{ p: 0 }}>
          {/* Header */}
          <Box
            sx={{
              p: 3,
              borderBottom: '1px solid #CED0D4'
            }}
          >
            <Typography
              variant='h6'
              sx={{
                fontWeight: 700,
                color: '#050505',
                fontSize: '1.25rem'
              }}
            >
              Criar Novo Convite
            </Typography>
          </Box>

          {/* Form Content */}
          <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Email Field */}
            <Box>
              <Typography
                variant='body2'
                sx={{
                  fontWeight: 500,
                  color: '#65676B',
                  mb: 1,
                  fontSize: '0.875rem'
                }}
              >
                Email *
              </Typography>
              <TextField
                fullWidth
                type='email'
                placeholder='exemplo@email.com'
                value={createForm.email}
                onChange={(e) => setCreateForm((prev) => ({ ...prev, email: e.target.value }))}
                required
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: '#F0F2F5',
                    borderRadius: 2,
                    '& .MuiOutlinedInput-notchedOutline': {
                      border: '1px solid #CED0D4',
                      transition: 'all 0.2s ease-in-out'
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#B0B3B8'
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#1877F2',
                      boxShadow: '0 0 0 3px rgba(24, 119, 242, 0.1)'
                    }
                  },
                  '& .MuiInputBase-input::placeholder': {
                    color: '#65676B',
                    opacity: 1
                  }
                }}
              />
              <Typography
                variant='caption'
                sx={{
                  color: '#65676B',
                  fontSize: '0.75rem',
                  mt: 0.5,
                  display: 'block'
                }}
              >
                O email deve estar cadastrado no sistema
              </Typography>
            </Box>

            {/* Role Field */}
            <Box>
              <Typography
                variant='body2'
                sx={{
                  fontWeight: 500,
                  color: '#65676B',
                  mb: 1,
                  fontSize: '0.875rem'
                }}
              >
                Role *
              </Typography>
              <FormControl fullWidth>
                <Select
                  value={createForm.roleId}
                  onChange={(e) => {
                    setCreateForm((prev) => ({
                      ...prev,
                      roleId: e.target.value
                    }));
                  }}
                  onOpen={handleRolesDropdownOpen}
                  disabled={creatingInvite}
                  displayEmpty
                  sx={{
                    backgroundColor: '#F0F2F5',
                    borderRadius: 2,
                    '& .MuiOutlinedInput-notchedOutline': {
                      border: '1px solid #CED0D4',
                      transition: 'all 0.2s ease-in-out'
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#B0B3B8'
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#1877F2',
                      boxShadow: '0 0 0 3px rgba(24, 119, 242, 0.1)'
                    },
                    '& .MuiSelect-select': {
                      color: createForm.roleId ? '#050505' : '#65676B'
                    }
                  }}
                  renderValue={(value) => {
                    if (!value) {
                      return <span style={{ color: '#65676B' }}>Selecione um role</span>;
                    }
                    const role = (rolesData || []).find((r) => r._id === value);
                    return role ? role.name : value;
                  }}
                >
                  {!rolesData ? (
                    <MenuItem disabled>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CircularProgress size={20} />
                        Carregando roles...
                      </Box>
                    </MenuItem>
                  ) : (
                    (rolesData || []).map((role) => (
                      <MenuItem
                        key={role._id}
                        value={role._id}
                      >
                        {role.name}
                      </MenuItem>
                    ))
                  )}
                </Select>
              </FormControl>
            </Box>

            {/* Departments Field */}
            <Box>
              <Typography
                variant='body2'
                sx={{
                  fontWeight: 500,
                  color: '#65676B',
                  mb: 1,
                  fontSize: '0.875rem'
                }}
              >
                Gerências (opcional)
              </Typography>
              <FormControl fullWidth>
                <Select
                  multiple
                  value={createForm.departmentIds || []}
                  onChange={(e) => {
                    const value = typeof e.target.value === 'string' ? e.target.value.split(',') : e.target.value;
                    setCreateForm((prev) => ({
                      ...prev,
                      departmentIds: value
                    }));
                    setDepartmentsDropdownOpen(false);
                  }}
                  onOpen={handleDepartmentsDropdownOpen}
                  onClose={() => setDepartmentsDropdownOpen(false)}
                  open={departmentsDropdownOpen}
                  disabled={creatingInvite}
                  displayEmpty
                  sx={{
                    backgroundColor: '#F0F2F5',
                    borderRadius: 2,
                    '& .MuiOutlinedInput-notchedOutline': {
                      border: '1px solid #CED0D4',
                      transition: 'all 0.2s ease-in-out'
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#B0B3B8'
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#1877F2',
                      boxShadow: '0 0 0 3px rgba(24, 119, 242, 0.1)'
                    },
                    '& .MuiSelect-select': {
                      color: (createForm.departmentIds?.length || 0) > 0 ? '#050505' : '#65676B'
                    }
                  }}
                  renderValue={(selected) => {
                    if (!selected || selected.length === 0) {
                      return <span style={{ color: '#65676B' }}>Selecione uma gerência</span>;
                    }
                    return selected
                      .map((id) => ((departmentsData?.departments || departmentsData) as any[]).find((dept) => dept._id === id)?.department_name)
                      .join(', ');
                  }}
                >
                  {!departmentsData ? (
                    <MenuItem disabled>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Loading isLoading={true} />
                      </Box>
                    </MenuItem>
                  ) : (
                    ((departmentsData?.departments || departmentsData) as any[]).map((dept) => (
                      <MenuItem
                        key={dept._id}
                        value={dept._id}
                        sx={{
                          '&:hover': {
                            backgroundColor: '#f8fafc'
                          },
                          '&.Mui-selected': {
                            backgroundColor: '#f1f5f9',
                            '&:hover': {
                              backgroundColor: '#f1f5f9'
                            }
                          }
                        }}
                      >
                        {dept.department_name}
                      </MenuItem>
                    ))
                  )}
                </Select>
              </FormControl>
            </Box>
          </Box>
        </DialogContent>

        {/* Footer com botões */}
        <Box
          sx={{
            p: 3,
            backgroundColor: '#f9fafb',
            borderTop: '1px solid #CED0D4',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: 2
          }}
        >
          <Button
            onClick={() => setCreateModalOpen(false)}
            sx={{
              px: 3,
              py: 1.25,
              fontSize: '0.875rem',
              fontWeight: 500,
              color: '#white',
              textTransform: 'uppercase',
              borderRadius: 2,
              transition: 'all 0.2s ease-in-out',
              '&:hover': {
                backgroundColor: 'rgba(24, 119, 242, 0.1)',
                color: '#1877F2'
              }
            }}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleCreateInvite}
            variant='contained'
            disabled={creatingInvite || !createForm.email || !createForm.roleId}
            sx={{
              px: 3,
              py: 1.25,
              fontSize: '0.875rem',
              fontWeight: 500,
              backgroundColor: '#1877F2',
              textTransform: 'uppercase',
              borderRadius: 2,
              boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
              transition: 'all 0.2s ease-in-out',
              '&:hover': {
                backgroundColor: '#166fe5',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              },
              '&:focus': {
                outline: 'none',
                boxShadow: '0 0 0 3px rgba(24, 119, 242, 0.1)'
              },
              '&:disabled': {
                backgroundColor: '#d1d5db',
                color: '#9ca3af',
                boxShadow: 'none'
              }
            }}
          >
            Criar Convite
          </Button>
        </Box>
      </Dialog>

      {/* Modal de confirmação de exclusão */}
      <Dialog
        open={deleteConfirmOpen}
        onClose={handleCancelDelete}
        maxWidth='sm'
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            overflow: 'hidden'
          }
        }}
      >
        <DialogContent sx={{ p: 4 }}>
          {/* Header com ícone */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              mb: 3
            }}
          >
            <Box
              sx={{
                backgroundColor: '#fef2f2',
                borderRadius: '50%',
                p: 1.5,
                mb: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <DeleteIcon
                sx={{
                  fontSize: 32,
                  color: '#DC2626'
                }}
              />
            </Box>
            <Typography
              variant='h5'
              sx={{
                fontWeight: 700,
                color: '#1F2937',
                fontSize: '1.5rem'
              }}
            >
              Confirmar Exclusão
            </Typography>
          </Box>

          {/* Texto de confirmação */}
          <Typography
            variant='body1'
            sx={{
              textAlign: 'center',
              color: '#6B7280',
              mb: 3,
              fontSize: '1rem'
            }}
          >
            Tem certeza que deseja excluir o convite para{' '}
            <strong style={{ color: '#1F2937' }}>{inviteToDelete?.email}</strong>?
          </Typography>

          {/* Detalhes do convite */}
          {inviteToDelete && (
            <Box
              sx={{
                backgroundColor: '#f9fafb',
                borderRadius: 2,
                p: 2,
                mb: 3
              }}
            >
              <Typography
                variant='body2'
                sx={{
                  fontWeight: 600,
                  color: '#1F2937',
                  mb: 1,
                  fontSize: '0.875rem'
                }}
              >
                Detalhes do convite:
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <Typography
                  variant='body2'
                  sx={{ fontSize: '0.875rem' }}
                >
                  <strong style={{ fontWeight: 500 }}>Email:</strong> {inviteToDelete.email}
                </Typography>
                <Typography
                  variant='body2'
                  sx={{ fontSize: '0.875rem' }}
                >
                  <strong style={{ fontWeight: 500 }}>Role:</strong> {inviteToDelete.role.name}
                </Typography>
                <Typography
                  variant='body2'
                  sx={{ fontSize: '0.875rem' }}
                >
                  <strong style={{ fontWeight: 500 }}>Status:</strong> {getStatusText(inviteToDelete.status)}
                </Typography>
                <Typography
                  variant='body2'
                  sx={{ fontSize: '0.875rem' }}
                >
                  <strong style={{ fontWeight: 500 }}>Criado em:</strong>{' '}
                  {new Date(inviteToDelete.createdAt).toLocaleDateString('pt-BR')}
                </Typography>
              </Box>
            </Box>
          )}

          {/* Alert de aviso */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'flex-start',
              p: 2,
              borderRadius: 2,
              backgroundColor: '#FEF3C7',
              border: '1px solid #FCD34D',
              mb: 3
            }}
          >
            <WarningIcon
              sx={{
                color: '#92400E',
                fontSize: 20,
                mr: 1.5,
                mt: 0.25
              }}
            />
            <Typography
              variant='body2'
              sx={{
                color: '#92400E',
                fontSize: '0.875rem',
                lineHeight: 1.5
              }}
            >
              Esta ação não pode ser desfeita. O convite será permanentemente removido.
            </Typography>
          </Box>

          {/* Botões de ação */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: 2
            }}
          >
            <Button
              onClick={handleCancelDelete}
              sx={{
                px: 3,
                py: 1.25,
                fontSize: '0.875rem',
                fontWeight: 600,
                color: '#1F2937',
                textTransform: 'uppercase',
                borderRadius: 2,
                border: '1px solid #E5E7EB',
                backgroundColor: 'transparent',
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  backgroundColor: '#f3f4f6',
                  borderColor: '#D1D5DB'
                }
              }}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleConfirmDelete}
              disabled={deletingInvite}
              sx={{
                px: 3,
                py: 1.25,
                fontSize: '0.875rem',
                fontWeight: 600,
                backgroundColor: '#DC2626',
                textTransform: 'uppercase',
                borderRadius: 2,
                color: 'white',
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  backgroundColor: '#B91C1C'
                },
                '&:disabled': {
                  backgroundColor: '#e5e7eb',
                  color: '#9ca3af'
                }
              }}
            >
              {deletingInvite ? 'Excluindo...' : 'Excluir Convite'}
            </Button>
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export { InvitesSection };
