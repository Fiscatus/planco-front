import {
  Edit as EditIcon,
  FilterListOff as FilterListOffIcon,
  GroupsOutlined as GroupsOutlinedIcon,
  Refresh as RefreshIcon,
  Search as SearchIcon
} from '@mui/icons-material';
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  FormControl,
  FormControlLabel,
  Grid,
  IconButton,
  MenuItem,
  Pagination,
  Paper,
  Select,
  Skeleton,
  Stack,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme
} from '@mui/material';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Loading, useNotification } from '@/components';
import type { FilterUsersDto, User } from '@/globals/types';
import { useAuth, useDebounce, useDepartments, useRoles, useUsers } from '@/hooks';

interface UserSectionProps {
  currentTab: 'users' | 'gerencias' | 'invites' | 'roles';
}

const UserSection = ({ currentTab }: UserSectionProps) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [urlParams, setUrlParams] = useSearchParams();
  const [localSearch, setLocalSearch] = useState(urlParams.get('name') || '');
  const debouncedLocalSearch = useDebounce(localSearch, 300);

  // Atualiza URL params apenas quando o debounce for processado
  useEffect(() => {
    if (debouncedLocalSearch !== urlParams.get('name') && debouncedLocalSearch !== '') {
      urlParams.set('name', debouncedLocalSearch);
      urlParams.set('email', debouncedLocalSearch);
      urlParams.set('page', '1');
      setUrlParams(urlParams, { replace: true });
    }
  }, [debouncedLocalSearch, urlParams, setUrlParams]);

  const { showNotification } = useNotification();

  useEffect(() => {
    if (currentTab !== 'users') {
      setUrlParams({}, { replace: true });
    }
  }, [currentTab, setUrlParams]);
  const { fetchUsers, updateUserRole, updateUserDepartments, toggleUserStatus } = useUsers();

  const { user: currentUser } = useAuth();
  const { roles, fetchRoles } = useRoles();
  const { departments, fetchDepartments } = useDepartments();

  const [rolesDropdownOpen, setRolesDropdownOpen] = useState(false);
  const [departmentsDropdownOpen, setDepartmentsDropdownOpen] = useState(false);
  const [editRolesDropdownOpen, setEditRolesDropdownOpen] = useState(false);
  const [editDepartmentsDropdownOpen, setEditDepartmentsDropdownOpen] = useState(false);

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [editForm, setEditForm] = useState<{
    role: string;
    departments: string[];
  }>({
    role: '',
    departments: []
  });

  const {
    data: usersData,
    isLoading: usersLoading,
    error: usersError,
    refetch: refetchUsers
  } = useQuery({
    queryKey: [
      'fetchUsers',
      `page:${urlParams.get('page') || 1}`,
      `limit:${urlParams.get('limit') || 5}`,
      `name:${urlParams.get('name')}`,
      `email:${urlParams.get('email')}`,
      `isActive:${urlParams.get('isActive')}`,
      `role:${urlParams.get('role')}`,
      `departments:${urlParams.get('departments')}`
    ],
    refetchOnWindowFocus: false,
    queryFn: async () => {
      const filters: FilterUsersDto = {
        page: Number(urlParams.get('page') || 1),
        limit: Number(urlParams.get('limit') || 5),
        name: urlParams.get('name'),
        email: urlParams.get('email'),
        isActive: urlParams.get('isActive') ? urlParams.get('isActive') === 'true' : undefined,
        role: urlParams.get('role'),
        departments: urlParams.get('departments') ? urlParams.get('departments')!.split(',') : []
      };
      return await fetchUsers(filters);
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

  const handleEditRolesDropdownOpen = useCallback(async () => {
    setEditRolesDropdownOpen(true);
    if (!rolesData) {
      await refetchRoles();
    }
  }, [rolesData, refetchRoles]);

  const handleEditDepartmentsDropdownOpen = useCallback(async () => {
    setEditDepartmentsDropdownOpen(true);
    if (!departmentsData) {
      await refetchDepartments();
    }
  }, [departmentsData, refetchDepartments]);

  const handleClearFilters = useCallback(() => {
    urlParams.delete('name');
    urlParams.delete('email');
    urlParams.delete('isActive');
    urlParams.delete('role');
    urlParams.delete('departments');
    urlParams.set('page', '1');
    setUrlParams(urlParams, { replace: true });
  }, [urlParams, setUrlParams]);

  const handlePageChange = useCallback(
    (page: number) => {
      urlParams.set('page', String(page));
      setUrlParams(urlParams, { replace: true });
    },
    [urlParams, setUrlParams]
  );

  const handleLimitChange = useCallback(
    (limit: number) => {
      urlParams.set('limit', String(limit));
      urlParams.set('page', '1');
      setUrlParams(urlParams, { replace: true });
    },
    [urlParams, setUrlParams]
  );

  const { mutate: editUser, isPending: editUserPending } = useMutation({
    mutationFn: async ({ userId, role, departments }: { userId: string; role: string; departments: string[] }) => {
      const promises = [];

      if (role !== (selectedUser?.role?._id || '')) {
        promises.push(updateUserRole(userId, role));
      }

      const currentDeptIds = selectedUser?.departments?.map((dept) => dept._id) || [];
      const departmentsChanged = JSON.stringify(currentDeptIds.sort()) !== JSON.stringify(departments.sort());

      if (departmentsChanged) {
        promises.push(updateUserDepartments(userId, departments));
      }

      return await Promise.all(promises);
    },
    onError: () => {
      showNotification('Erro ao atualizar usuário', 'error');
    },
    onSuccess: () => {
      showNotification('Usuário atualizado com sucesso', 'success');
      refetchUsers();
      setEditModalOpen(false);
      setSelectedUser(null);
      setEditForm({ role: '', departments: [] });
    }
  });

  const { mutate: toggleStatus, isPending: toggleStatusPending } = useMutation({
    mutationFn: async (userId: string) => {
      return await toggleUserStatus(userId);
    },
    onError: () => {
      showNotification('Erro ao alterar status do usuário', 'error');
    },
    onSuccess: () => {
      showNotification('Status do usuário alterado com sucesso', 'success');
      refetchUsers();
    }
  });

  const handleEditUser = useCallback((user: User) => {
    setSelectedUser(user);
    setEditForm({
      role: user.role?._id || '',
      departments: user.departments?.map((dept) => dept._id) || []
    });
    setEditModalOpen(true);
  }, []);

  const handleSaveEdit = useCallback(() => {
    if (!selectedUser?._id) return;
    editUser({
      userId: selectedUser._id,
      role: editForm.role,
      departments: editForm.departments
    });
  }, [selectedUser, editForm, editUser]);

  const handleToggleStatus = useCallback(
    (user: User) => {
      if (!user._id) return;

      if (currentUser?._id === user._id && user.isActive) {
        showNotification('Você não pode desabilitar a si mesmo', 'warning');
        return;
      }

      toggleStatus(user._id);
    },
    [toggleStatus, currentUser?._id, showNotification]
  );

  const handleRefresh = useCallback(() => {
    refetchUsers();
  }, [refetchUsers]);

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
          {/* Filtros e Botão Atualizar */}
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
                  placeholder='Buscar por nome ou email'
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
                    value={urlParams.get('isActive') || 'todos'}
                    displayEmpty
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value === 'todos') {
                        urlParams.delete('isActive');
                      } else {
                        urlParams.set('isActive', value);
                      }
                      urlParams.set('page', '1');
                      setUrlParams(urlParams, { replace: true });
                    }}
                    sx={{
                      height: 40,
                      borderRadius: 3,
                      backgroundColor: '#ffffff',
                      '& .MuiOutlinedInput-notchedOutline': {
                        border: '2px solid #e5e7eb',
                        transition: 'all 0.2s ease-in-out'
                      },
                      '&:hover': {
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#d1d5db'
                        },
                        backgroundColor: '#ffffff'
                      },
                      '&.Mui-focused': {
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: theme.palette.primary.main,
                          boxShadow: `0 0 0 3px ${theme.palette.primary.main}20`
                        },
                        backgroundColor: '#ffffff'
                      },
                      '& .MuiSelect-select': {
                        color: !urlParams.get('isActive') ? '#9ca3af' : '#374151'
                      },
                      '& .MuiSelect-icon': {
                        color: '#64748b'
                      }
                    }}
                    renderValue={(value) => {
                      if (value === 'todos' || value === undefined) {
                        return <span style={{ color: '#9ca3af' }}>Status</span>;
                      }
                      return value === 'true' ? 'Ativos' : 'Inativos';
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
                      value='true'
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
                      Ativos
                    </MenuItem>
                    <MenuItem 
                      value='false'
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
                      Inativos
                    </MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                <Autocomplete
                  size='small'
                  options={rolesData || []}
                  getOptionLabel={(option) => (typeof option === 'string' ? option : option.name)}
                  value={rolesData?.find((role) => role._id === urlParams.get('role')) || null}
                  onChange={(_, newValue) => {
                    if (newValue && typeof newValue !== 'string') {
                      urlParams.set('role', newValue._id);
                    } else {
                      urlParams.delete('role');
                    }
                    urlParams.set('page', '1');
                    setUrlParams(urlParams, { replace: true });
                  }}
                  onOpen={handleRolesDropdownOpen}
                  onClose={() => setRolesDropdownOpen(false)}
                  open={rolesDropdownOpen}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      placeholder='Role'
                      InputProps={{
                        ...params.InputProps,
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
                  )}
                  freeSolo
                  clearOnBlur
                  selectOnFocus
                  handleHomeEndKeys
                  loading={!rolesData && rolesDropdownOpen}
                  loadingText={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CircularProgress size={20} />
                      Carregando roles...
                    </Box>
                  }
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                <Autocomplete
                  size='small'
                  multiple
                  options={(departmentsData?.departments || departmentsData || []) as any[]}
                  getOptionLabel={(option) => (typeof option === 'string' ? option : option.department_name)}
                  value={
                    ((departmentsData?.departments || departmentsData) as any[])?.filter((dept) =>
                      urlParams.get('departments')?.split(',').includes(dept._id)
                    ) || []
                  }
                  onChange={(_, newValue) => {
                    const deptIds = newValue.map((dept) => (typeof dept === 'string' ? dept : dept._id));
                    if (deptIds.length > 0) {
                      urlParams.set('departments', deptIds.join(','));
                    } else {
                      urlParams.delete('departments');
                    }
                    urlParams.set('page', '1');
                    setUrlParams(urlParams, { replace: true });
                  }}
                  onOpen={handleDepartmentsDropdownOpen}
                  onClose={() => setDepartmentsDropdownOpen(false)}
                  open={departmentsDropdownOpen}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      placeholder='Gerências'
                      InputProps={{
                        ...params.InputProps,
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
                  )}
                  freeSolo
                  clearOnBlur
                  selectOnFocus
                  handleHomeEndKeys
                  loading={!departmentsData && departmentsDropdownOpen}
                  loadingText={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Loading isLoading={true} />
                    </Box>
                  }
                />
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
                      disabled={usersLoading}
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

              {/* Botão Atualizar - xs-sm: full width abaixo dos filtros, md+: alinhado à direita */}
              <Grid size={{ xs: 12, sm: 12, md: 1 }}>
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
                  {isMobile && (
                    <IconButton
                      onClick={handleClearFilters}
                      disabled={usersLoading}
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

                  <Button
                    startIcon={<RefreshIcon sx={{ fontSize: '1.25rem' }} />}
                    onClick={handleRefresh}
                    disabled={usersLoading}
                    variant='contained'
                    color='primary'
                    size={isMobile ? 'medium' : 'small'}
                    fullWidth={isMobile}
                    sx={{
                      borderRadius: 3,
                      textTransform: 'uppercase',
                      fontWeight: 600,
                      letterSpacing: '0.05em',
                      px: isMobile ? 4 : 3,
                      py: isMobile ? 1.5 : 1,
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

          {usersError && (
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
              {usersError?.message || 'Erro ao carregar usuários'}
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
                size='medium'
                sx={{
                  '& .MuiTableRow-root': {
                    height: 64
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
                    <TableCell>Nome</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Role</TableCell>
                    <TableCell>Gerências</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align='center'>Ações</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {usersLoading ? (
                    <TableRow>
                      <TableCell
                        colSpan={6}
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
                            Carregando usuários...
                          </Typography>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ) : !usersData?.users || usersData.users.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        align='center'
                        sx={{
                          py: 6,
                          backgroundColor: '#fafafa'
                        }}
                      >
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                          <GroupsOutlinedIcon sx={{ fontSize: 48, color: '#9ca3af' }} />
                          <Typography
                            variant='h6'
                            sx={{
                              color: '#6b7280',
                              fontWeight: 500
                            }}
                          >
                            Nenhum usuário encontrado
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
                            onClick={handleClearFilters}
                            variant='outlined'
                            size='small'
                            sx={{ mt: 1 }}
                          >
                            Limpar filtros
                          </Button>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ) : (
                    usersData.users.map((user) => (
                      <TableRow
                        key={user._id}
                        sx={{
                          '& .MuiTableCell-root': {
                            borderBottom: '1px solid #f1f5f9',
                            py: 2,
                            transition: 'all 0.2s ease-in-out',
                            verticalAlign: 'middle'
                          },
                          '&:hover': {
                            backgroundColor: 'rgba(5, 50, 105, 0.02)',
                            '& .MuiTableCell-root': {
                              backgroundColor: 'transparent'
                            }
                          }
                        }}
                      >
                        <TableCell>
                          <Typography
                            variant='body2'
                            fontWeight={500}
                          >
                            {user.firstName} {user.lastName}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant='body2'>{user.email}</Typography>
                        </TableCell>
                        <TableCell>
                          {user.role ? (
                            <Chip
                              label={user.role.name}
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
                          ) : (
                            <Typography
                              variant='body2'
                              color='text.secondary'
                              sx={{ fontStyle: 'italic' }}
                            >
                              Sem role
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          {user.departments && user.departments.length > 0 ? (
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                              {user.departments.map((dept) => (
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
                          ) : (
                            <Typography
                              variant='body2'
                              color='text.secondary'
                              sx={{ fontStyle: 'italic' }}
                            >
                              Sem gerências
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Switch
                              checked={user.isActive ?? true}
                              onChange={() => handleToggleStatus(user)}
                              disabled={toggleStatusPending || (currentUser?._id === user._id && user.isActive)}
                              sx={{
                                '& .MuiSwitch-switchBase.Mui-checked': {
                                  color: theme.palette.primary.main,
                                  '& + .MuiSwitch-track': {
                                    backgroundColor: theme.palette.primary.main
                                  }
                                },
                                '& .MuiSwitch-track': {
                                  backgroundColor: '#ccc'
                                }
                              }}
                            />
                            <Typography
                              variant='body2'
                              sx={{
                                color: user.isActive ? 'primary.main' : 'text.secondary',
                                fontWeight: user.isActive ? 600 : 400,
                                transition: 'color 0.2s ease-in-out'
                              }}
                            >
                              {user.isActive ? 'Ativo' : 'Inativo'}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell align='center'>
                          <IconButton
                            size='small'
                            onClick={() => handleEditUser(user)}
                            aria-label='Editar usuário'
                            sx={{
                              color: '#6b7280',
                              backgroundColor: 'transparent',
                              borderRadius: 2,
                              p: 1,
                              transition: 'all 0.2s ease-in-out',
                              '&:hover': {
                                backgroundColor: '#f3f4f6',
                                color: theme.palette.primary.main,
                                transform: 'scale(1.1)'
                              }
                            }}
                          >
                            <EditIcon sx={{ fontSize: '1.25rem' }} />
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
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {usersLoading ? (
                Array.from({ length: 3 }).map(() => {
                  const uniqueKey = `loading-skeleton-${Math.random().toString(36).substr(2, 9)}`;
                  return (
                    <Paper
                      key={uniqueKey}
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
              ) : !usersData?.users || usersData.users.length === 0 ? (
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
                    <GroupsOutlinedIcon sx={{ fontSize: 48, color: '#9ca3af' }} />
                    <Typography
                      variant='h6'
                      sx={{
                        color: '#6b7280',
                        fontWeight: 500
                      }}
                    >
                      Nenhum usuário encontrado
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
                      onClick={handleClearFilters}
                      variant='outlined'
                      size='small'
                      sx={{ mt: 1 }}
                    >
                      Limpar filtros
                    </Button>
                  </Box>
                </Paper>
              ) : (
                // User cards for mobile
                usersData.users.map((user) => (
                  <Paper
                    key={user._id}
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
                      {/* Linha 1: Nome + Botão Editar */}
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography
                          variant='subtitle1'
                          fontWeight={600}
                          sx={{ color: '#1f2937' }}
                        >
                          {user.firstName} {user.lastName}
                        </Typography>
                        <IconButton
                          size='small'
                          onClick={() => handleEditUser(user)}
                          aria-label='Editar usuário'
                          sx={{
                            color: '#6b7280',
                            backgroundColor: 'transparent',
                            borderRadius: 2,
                            p: 1,
                            minWidth: 44,
                            minHeight: 44,
                            transition: 'all 0.2s ease-in-out',
                            '&:hover': {
                              backgroundColor: '#f3f4f6',
                              color: theme.palette.primary.main,
                              transform: 'scale(1.1)'
                            }
                          }}
                        >
                          <EditIcon sx={{ fontSize: '1.25rem' }} />
                        </IconButton>
                      </Box>

                      {/* Linha 2: Email com truncamento */}
                      <Tooltip
                        title={user.email}
                        arrow
                      >
                        <Typography
                          variant='body2'
                          noWrap
                          sx={{
                            color: '#6b7280',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                          }}
                        >
                          {user.email}
                        </Typography>
                      </Tooltip>

                      {/* Linha 3: Chips para Role e Gerências */}
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, alignItems: 'center' }}>
                        {user.role ? (
                          <Chip
                            label={user.role.name}
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
                        ) : (
                          <Typography
                            variant='body2'
                            color='text.secondary'
                            sx={{ fontStyle: 'italic', fontSize: '0.75rem' }}
                          >
                            Sem role
                          </Typography>
                        )}

                        {user.departments && user.departments.length > 0 && (
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, maxWidth: '100%' }}>
                            {user.departments.slice(0, 2).map((dept) => (
                              <Tooltip
                                key={dept._id}
                                title={dept.department_name}
                                arrow
                              >
                                <Chip
                                  label={dept.department_name}
                                  size='small'
                                  variant='outlined'
                                  sx={{
                                    color: '#15803d',
                                    borderColor: '#15803d',
                                    fontWeight: 600,
                                    borderRadius: 2,
                                    maxWidth: 120,
                                    '& .MuiChip-label': {
                                      px: 1.5,
                                      overflow: 'hidden',
                                      textOverflow: 'ellipsis',
                                      whiteSpace: 'nowrap'
                                    }
                                  }}
                                />
                              </Tooltip>
                            ))}
                            {user.departments.length > 2 && (
                              <Chip
                                label={`+${user.departments.length - 2}`}
                                size='small'
                                variant='outlined'
                                sx={{
                                  color: '#6b7280',
                                  borderColor: '#d1d5db',
                                  fontWeight: 600,
                                  borderRadius: 2,
                                  '& .MuiChip-label': {
                                    px: 1.5
                                  }
                                }}
                              />
                            )}
                          </Box>
                        )}
                      </Box>

                      {/* Linha 4: Status com Switch */}
                      <FormControlLabel
                        control={
                          <Switch
                            checked={user.isActive ?? true}
                            onChange={() => handleToggleStatus(user)}
                            disabled={toggleStatusPending || (currentUser?._id === user._id && user.isActive)}
                            sx={{
                              '& .MuiSwitch-switchBase.Mui-checked': {
                                color: theme.palette.primary.main,
                                '& + .MuiSwitch-track': {
                                  backgroundColor: theme.palette.primary.main
                                }
                              },
                              '& .MuiSwitch-track': {
                                backgroundColor: '#ccc'
                              }
                            }}
                          />
                        }
                        label={
                          <Typography
                            variant='body2'
                            sx={{
                              color: user.isActive ? 'primary.main' : 'text.secondary',
                              fontWeight: user.isActive ? 600 : 400,
                              transition: 'color 0.2s ease-in-out'
                            }}
                          >
                            {user.isActive ? 'Ativo' : 'Inativo'}
                          </Typography>
                        }
                        sx={{
                          margin: 0,
                          '& .MuiFormControlLabel-label': {
                            marginLeft: 1
                          }
                        }}
                      />
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
              {usersData ? (
                <>
                  {(Number(urlParams.get('page') || 1) - 1) * Number(urlParams.get('limit') || 10) + 1}-
                  {Math.min(Number(urlParams.get('page') || 1) * Number(urlParams.get('limit') || 10), usersData.total)}{' '}
                  de {usersData.total}
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
                sx={{ 
                  minWidth: 120, 
                  height: 32, 
                  fontSize: '0.875rem',
                  backgroundColor: '#ffffff',
                  '&:hover': {
                    backgroundColor: '#ffffff'
                  },
                  '&.Mui-focused': {
                    backgroundColor: '#ffffff'
                  },
                  '& .MuiSelect-icon': {
                    color: '#64748b'
                  }
                }}
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
                count={usersData ? Math.ceil(usersData.total / Number(urlParams.get('limit') || 10)) : 0}
                page={Number(urlParams.get('page') || 1)}
                onChange={(_e, value) => handlePageChange(value)}
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
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        maxWidth='sm'
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            overflow: 'hidden'
          }
        }}
      >
        <DialogContent sx={{ p: 0 }}>
          <Box sx={{ p: 4 }}>
            {/* Header com ícone e título */}
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                mb: 4
              }}
            >
              <Box
                sx={{
                  backgroundColor: 'rgba(24, 119, 242, 0.1)',
                  p: 1.5,
                  borderRadius: '50%',
                  mb: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <EditIcon
                  sx={{
                    fontSize: 32,
                    color: '#1877F2'
                  }}
                />
              </Box>

              <Typography
                variant='h5'
                sx={{
                  fontWeight: 700,
                  color: '#1f2937',
                  mb: 0.5
                }}
              >
                Editar Usuário
              </Typography>

              <Typography
                variant='body2'
                sx={{
                  color: '#6b7280',
                  fontSize: '0.875rem'
                }}
              >
                Atualize as informações de{' '}
                <Box
                  component='span'
                  sx={{ fontWeight: 600, color: '#1f2937' }}
                >
                  {selectedUser?.firstName} {selectedUser?.lastName}
                </Box>
                .
              </Typography>
            </Box>

            {/* Seção de Permissões */}
            <Box
              sx={{
                backgroundColor: '#f9fafb',
                p: 3,
                borderRadius: 2,
                border: '1px solid #e5e7eb',
                mb: 4
              }}
            >
              <Typography
                variant='h6'
                sx={{
                  fontWeight: 600,
                  color: '#1f2937',
                  mb: 2,
                  fontSize: '1.125rem'
                }}
              >
                Permissões
              </Typography>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box>
                  <Typography
                    variant='body2'
                    sx={{
                      fontWeight: 500,
                      color: '#6b7280',
                      mb: 0.5,
                      fontSize: '0.875rem'
                    }}
                  >
                    Role
                  </Typography>
                  <Autocomplete
                    options={rolesData || []}
                    getOptionLabel={(option) => (typeof option === 'string' ? option : option.name)}
                    value={rolesData?.find((role) => role._id === editForm.role) || null}
                    onChange={(_, newValue) => {
                      setEditForm((prev) => ({
                        ...prev,
                        role: typeof newValue === 'string' ? newValue : newValue?._id || ''
                      }));
                    }}
                    onOpen={handleEditRolesDropdownOpen}
                    onClose={() => setEditRolesDropdownOpen(false)}
                    open={editRolesDropdownOpen}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        placeholder='Selecione uma role'
                        InputProps={{
                          ...params.InputProps,
                          sx: {
                            backgroundColor: '#ffffff',
                            borderRadius: 2,
                            '& .MuiOutlinedInput-notchedOutline': {
                              border: '1px solid #e5e7eb',
                              transition: 'all 0.2s ease-in-out'
                            },
                            '&:hover .MuiOutlinedInput-notchedOutline': {
                              borderColor: '#d1d5db'
                            },
                            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                              borderColor: '#1877F2',
                              boxShadow: '0 0 0 3px rgba(24, 119, 242, 0.1)'
                            }
                          }
                        }}
                        sx={{
                          '& .MuiInputBase-input::placeholder': {
                            color: '#9ca3af',
                            opacity: 1
                          }
                        }}
                      />
                    )}
                    freeSolo
                    clearOnBlur
                    selectOnFocus
                    handleHomeEndKeys
                    loading={!rolesData && editRolesDropdownOpen}
                    loadingText={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CircularProgress size={20} />
                        Carregando roles...
                      </Box>
                    }
                  />
                </Box>

                <Box>
                  <Typography
                    variant='body2'
                    sx={{
                      fontWeight: 500,
                      color: '#6b7280',
                      mb: 0.5,
                      fontSize: '0.875rem'
                    }}
                  >
                    Gerências
                  </Typography>
                  <Autocomplete
                    multiple
                    options={(departmentsData?.departments || departmentsData || []) as any[]}
                    getOptionLabel={(option) => (typeof option === 'string' ? option : option.department_name)}
                    value={
                      ((departmentsData?.departments || departmentsData) as any[])?.filter((dept) =>
                        editForm.departments?.includes(dept._id)
                      ) || []
                    }
                    onChange={(_, newValue) => {
                      setEditForm((prev) => ({
                        ...prev,
                        departments: newValue.map((dept) => (typeof dept === 'string' ? dept : dept._id))
                      }));
                    }}
                    onOpen={handleEditDepartmentsDropdownOpen}
                    onClose={() => setEditDepartmentsDropdownOpen(false)}
                    open={editDepartmentsDropdownOpen}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        placeholder='Selecione as gerências'
                        InputProps={{
                          ...params.InputProps,
                          sx: {
                            backgroundColor: '#ffffff',
                            borderRadius: 2,
                            '& .MuiOutlinedInput-notchedOutline': {
                              border: '1px solid #e5e7eb',
                              transition: 'all 0.2s ease-in-out'
                            },
                            '&:hover .MuiOutlinedInput-notchedOutline': {
                              borderColor: '#d1d5db'
                            },
                            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                              borderColor: '#1877F2',
                              boxShadow: '0 0 0 3px rgba(24, 119, 242, 0.1)'
                            }
                          }
                        }}
                        sx={{
                          '& .MuiInputBase-input::placeholder': {
                            color: '#9ca3af',
                            opacity: 1
                          }
                        }}
                      />
                    )}
                    freeSolo
                    clearOnBlur
                    selectOnFocus
                    handleHomeEndKeys
                    loading={!departmentsData && editDepartmentsDropdownOpen}
                    loadingText={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Loading isLoading={true} />
                      </Box>
                    }
                  />
                </Box>
              </Box>
            </Box>
          </Box>
        </DialogContent>

        <DialogActions
          sx={{
            p: 3,
            pt: 0,
            justifyContent: 'flex-end',
            gap: 1
          }}
        >
          <Button
            onClick={() => setEditModalOpen(false)}
            sx={{
              px: 3,
              py: 1.25,
              fontSize: '0.875rem',
              fontWeight: 600,
              color: 'white',
              textTransform: 'none',
              borderRadius: 2,
              transition: 'all 0.2s ease-in-out',
              '&:hover': {
                backgroundColor: '#f3f4f6',
                color: '#374151'
              }
            }}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSaveEdit}
            variant='contained'
            disabled={editUserPending}
            sx={{
              px: 3,
              py: 1.25,
              fontSize: '0.875rem',
              fontWeight: 600,
              backgroundColor: '#1877F2',
              textTransform: 'none',
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
                backgroundColor: '#e5e7eb',
                color: '#9ca3af',
                boxShadow: 'none'
              }
            }}
          >
            {editUserPending ? 'Salvando...' : 'Salvar Alterações'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export { UserSection };
