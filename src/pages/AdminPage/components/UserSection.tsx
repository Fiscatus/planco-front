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
  TablePagination,
  TableRow,
  TextField,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme
} from '@mui/material';
import {
  Edit as EditIcon,
  FilterListOff as FilterListOffIcon,
  GroupsOutlined as GroupsOutlinedIcon,
  Refresh as RefreshIcon,
  Search as SearchIcon
} from '@mui/icons-material';
import type { FilterUsersDto, User } from '@/globals/types';
import { useAuth, useDepartments, useRoles, useUsers } from '@/hooks';
import { useCallback, useEffect, useState } from 'react';

import { useNotification } from '@/components';

const UserSection = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const { showNotification } = useNotification();
  const {
    users,
    loading,
    error,
    pagination,
    fetchUsers,
    updateUserRole,
    updateUserDepartments,
    toggleUserStatus,
    clearError
  } = useUsers();

  const { user: currentUser } = useAuth();
  const { roles, fetchRoles } = useRoles();
  const { departments, fetchDepartments } = useDepartments();

  const [rolesDropdownOpen, setRolesDropdownOpen] = useState(false);
  const [departmentsDropdownOpen, setDepartmentsDropdownOpen] = useState(false);
  const [editRolesDropdownOpen, setEditRolesDropdownOpen] = useState(false);
  const [editDepartmentsDropdownOpen, setEditDepartmentsDropdownOpen] = useState(false);

  const [filters, setFilters] = useState<FilterUsersDto>({
    page: 1,
    limit: 10,
    name: '',
    email: '',
    isActive: undefined,
    role: '',
    departments: []
  });

  const [searchValue, setSearchValue] = useState('');

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [editForm, setEditForm] = useState<{
    role: string;
    departments: string[];
  }>({
    role: '',
    departments: []
  });

  useEffect(() => {
    fetchUsers(filters);
  }, []);

  const handleRolesDropdownOpen = useCallback(async () => {
    setRolesDropdownOpen(true);
    if (roles.length === 0) {
      await fetchRoles();
    }
  }, [roles.length, fetchRoles]);

  const handleDepartmentsDropdownOpen = useCallback(async () => {
    setDepartmentsDropdownOpen(true);
    if (departments.length === 0) {
      await fetchDepartments();
    }
  }, [departments.length, fetchDepartments]);

  const handleEditRolesDropdownOpen = useCallback(async () => {
    setEditRolesDropdownOpen(true);
    if (roles.length === 0) {
      await fetchRoles();
    }
  }, [roles.length, fetchRoles]);

  const handleEditDepartmentsDropdownOpen = useCallback(async () => {
    setEditDepartmentsDropdownOpen(true);
    if (departments.length === 0) {
      await fetchDepartments();
    }
  }, [departments.length, fetchDepartments]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchUsers({ ...filters, page: 1 });
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [filters.name, filters.email, filters.isActive, filters.role, filters.departments]);

  const handleClearFilters = useCallback(() => {
    const clearedFilters = {
      page: 1,
      limit: 10,
      name: '',
      email: '',
      isActive: undefined,
      role: '',
      departments: []
    };
    setFilters(clearedFilters);
    setSearchValue('');
  }, []);

  const handlePageChange = useCallback(
    (_event: unknown, newPage: number) => {
      const newFilters = { ...filters, page: newPage + 1 };
      setFilters(newFilters);
      fetchUsers(newFilters);
    },
    [filters, fetchUsers]
  );

  const handleRowsPerPageChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const newLimit = Number.parseInt(event.target.value, 10);
      const newFilters = { ...filters, page: 1, limit: newLimit };
      setFilters(newFilters);
      fetchUsers(newFilters);
    },
    [filters, fetchUsers]
  );

  const handleEditUser = useCallback((user: User) => {
    setSelectedUser(user);
    setEditForm({
      role: user.role?._id || '',
      departments: user.departments?.map((dept) => dept._id) || []
    });
    setEditModalOpen(true);
  }, []);

  const handleSaveEdit = useCallback(async () => {
    if (!selectedUser?._id) return;

    try {
      const roleChanged = editForm.role !== (selectedUser.role?._id || '');

      const currentDeptIds = selectedUser.departments?.map((dept) => dept._id) || [];
      const newDeptIds = editForm.departments || [];
      const departmentsChanged = JSON.stringify(currentDeptIds.sort()) !== JSON.stringify(newDeptIds.sort());

      if (roleChanged) {
        await updateUserRole(selectedUser._id, editForm.role);
      }

      if (departmentsChanged) {
        await updateUserDepartments(selectedUser._id, editForm.departments || []);
      }

      setEditModalOpen(false);
      setSelectedUser(null);
      setEditForm({ role: '', departments: [] });
    } catch {
      showNotification('Erro ao atualizar usuário', 'error');
    }
  }, [selectedUser, editForm, updateUserRole, updateUserDepartments]);

  const handleToggleStatus = useCallback(
    async (user: User) => {
      if (!user._id) return;

      if (currentUser?._id === user._id && user.isActive) {
        showNotification('Você não pode desabilitar a si mesmo', 'warning');
        return;
      }

      try {
        await toggleUserStatus(user._id);
      } catch {
        showNotification('Erro ao alterar status do usuário', 'error');
      }
    },
    [toggleUserStatus, currentUser?._id]
  );

  const handleRefresh = useCallback(() => {
    fetchUsers(filters);
  }, [filters, fetchUsers]);

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
            <Grid container spacing={2}>
              {/* Campo de busca - sempre full width */}
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder='Buscar por nome ou email'
                  value={searchValue}
                  onChange={(e) => {
                    const value = e.target.value;
                    setSearchValue(value);
                    setFilters((prev) => ({
                      ...prev,
                      name: value,
                      email: value
                    }));
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

              {/* Filtros em linha única no desktop, empilhados no mobile */}
              <Grid size={{ xs: 4, sm: 3, md: 2 }}>
                <FormControl fullWidth size="small">
                  <Select
                    value={filters.isActive === undefined ? 'todos' : filters.isActive}
                    displayEmpty
                    onChange={(e) => {
                      const value = e.target.value;
                      setFilters((prev) => ({
                        ...prev,
                        isActive: value === 'todos' ? undefined : value === 'true'
                      }));
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
                        color: filters.isActive === undefined ? '#9ca3af' : '#374151'
                      }
                    }}
                    renderValue={(value) => {
                      if (value === 'todos' || value === undefined) {
                        return <span style={{ color: '#9ca3af' }}>Status</span>;
                      }
                      return value === true ? 'Ativos' : 'Inativos';
                    }}
                  >
                    <MenuItem value='todos'>Todos</MenuItem>
                    <MenuItem value='true'>Ativos</MenuItem>
                    <MenuItem value='false'>Inativos</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid size={{ xs: 4, sm: 3, md: 2 }}>
                <Autocomplete
                  size="small"
                  options={roles}
                  getOptionLabel={(option) => (typeof option === 'string' ? option : option.name)}
                  value={roles.find((role) => role._id === filters.role) || null}
                  onChange={(_, newValue) => {
                    setFilters((prev) => ({
                      ...prev,
                      role: typeof newValue === 'string' ? newValue : newValue?._id || ''
                    }));
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
                  loading={roles.length === 0 && rolesDropdownOpen}
                  loadingText={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CircularProgress size={20} />
                      Carregando roles...
                    </Box>
                  }
                />
              </Grid>

              <Grid size={{ xs: 4, sm: 3, md: 2 }}>
                <Autocomplete
                  size="small"
                  multiple
                  options={departments}
                  getOptionLabel={(option) => (typeof option === 'string' ? option : option.department_name)}
                  value={departments.filter((dept) => filters.departments?.includes(dept._id)) || []}
                  onChange={(_, newValue) => {
                    setFilters((prev) => ({
                      ...prev,
                      departments: newValue.map((dept) => (typeof dept === 'string' ? dept : dept._id))
                    }));
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
                  loading={departments.length === 0 && departmentsDropdownOpen}
                  loadingText={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CircularProgress size={20} />
                      Carregando gerências...
                    </Box>
                  }
                />
              </Grid>

              {/* Botão limpar filtros - só aparece no desktop */}
              {!isMobile && (
                <Grid size={{ xs: 12, sm: 12, md: 1 }}>
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'flex-start',
                    alignItems: 'center',
                    height: '100%',
                    minHeight: '40px'
                  }}>
                    <IconButton
                      onClick={handleClearFilters}
                      disabled={loading}
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

              {/* Botão Atualizar - full width no mobile, inline no desktop */}
              <Grid size={{ xs: 12, sm: 12, md: 3 }}>
                <Box sx={{ 
                  display: 'flex', 
                  gap: 1,
                  alignItems: 'center',
                  justifyContent: { xs: 'space-between', sm: 'flex-end' }
                }}>
                  {isMobile && (
                    <IconButton
                      onClick={handleClearFilters}
                      disabled={loading}
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
                    disabled={loading}
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

          {error && (
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
              onClose={clearError}
            >
              {error}
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
              <Table stickyHeader size="medium" sx={{ 
                '& .MuiTableRow-root': {
                  height: 64,
                  '&:hover': {
                    backgroundColor: '#f8fafc',
                    transform: 'translateY(-1px)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                    transition: 'all 0.2s ease-in-out'
                  }
                }
              }}>
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
                  {loading ? (
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
                  ) : users.length === 0 ? (
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
                            variant="outlined"
                            size="small"
                            sx={{ mt: 1 }}
                          >
                            Limpar filtros
                          </Button>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ) : (
                    users.map((user) => (
                      <TableRow
                        key={user._id}
                        hover
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
                              disabled={loading || (currentUser?._id === user._id && user.isActive)}
                              sx={{
                                '& .MuiSwitch-switchBase.Mui-checked': {
                                  color: theme.palette.primary.main,
                                  '& + .MuiSwitch-track': {
                                    backgroundColor: theme.palette.primary.main,
                                  },
                                },
                                '& .MuiSwitch-track': {
                                  backgroundColor: '#ccc',
                                },
                              }}
                            />
                            <Typography
                              variant="body2"
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
                            aria-label="Editar usuário"
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
              {loading ? (
                Array.from({ length: 3 }).map(() => {
                  const uniqueKey = `loading-skeleton-${Math.random().toString(36).substr(2, 9)}`;
                  return (
                    <Paper
                      key={uniqueKey}
                      variant="outlined"
                      sx={{
                        p: 2,
                        borderRadius: 2,
                        border: '1px solid #e5e7eb'
                      }}
                    >
                      <Skeleton variant="rectangular" height={84} />
                    </Paper>
                  );
                })
              ) : users.length === 0 ? (
                // Empty state for mobile
                <Paper
                  variant="outlined"
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
                      variant="outlined"
                      size="small"
                      sx={{ mt: 1 }}
                    >
                      Limpar filtros
                    </Button>
                  </Box>
                </Paper>
              ) : (
                // User cards for mobile
                users.map((user) => (
                  <Paper
                    key={user._id}
                    variant="outlined"
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
                          variant="subtitle1"
                          fontWeight={600}
                          sx={{ color: '#1f2937' }}
                        >
                          {user.firstName} {user.lastName}
                        </Typography>
                        <IconButton
                          size="small"
                          onClick={() => handleEditUser(user)}
                          aria-label="Editar usuário"
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
                      <Tooltip title={user.email} arrow>
                        <Typography
                          variant="body2"
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
                              <Tooltip key={dept._id} title={dept.department_name} arrow>
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
                            disabled={loading || (currentUser?._id === user._id && user.isActive)}
                            sx={{
                              '& .MuiSwitch-switchBase.Mui-checked': {
                                color: theme.palette.primary.main,
                                '& + .MuiSwitch-track': {
                                  backgroundColor: theme.palette.primary.main,
                                },
                              },
                              '& .MuiSwitch-track': {
                                backgroundColor: '#ccc',
                              },
                            }}
                          />
                        }
                        label={
                          <Typography
                            variant="body2"
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

          <TablePagination
            component='div'
            count={pagination.total}
            page={pagination.page - 1}
            onPageChange={handlePageChange}
            rowsPerPage={pagination.limit}
            onRowsPerPageChange={handleRowsPerPageChange}
            rowsPerPageOptions={isMobile ? [5, 10] : [5, 10, 25, 50]}
            labelRowsPerPage='Itens por página:'
            labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count !== -1 ? count : `mais de ${to}`}`}
            showFirstButton={!isMobile}
            showLastButton={!isMobile}
            sx={{
              backgroundColor: '#f8fafc',
              borderTop: '1px solid #e5e7eb',
              '& .MuiTablePagination-toolbar': {
                paddingLeft: isMobile ? 1 : 2,
                paddingRight: isMobile ? 1 : 2,
                minHeight: isMobile ? 48 : 56,
                flexDirection: isMobile ? 'column' : 'row',
                gap: isMobile ? 1 : 0
              },
              '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': {
                color: '#374151',
                fontWeight: 500,
                fontSize: isMobile ? '0.75rem' : '0.875rem'
              },
              '& .MuiTablePagination-select': {
                color: theme.palette.primary.main,
                fontWeight: 600
              },
              '& .MuiIconButton-root': {
                color: '#6b7280',
                minWidth: 44,
                minHeight: 44,
                '&:hover': {
                  backgroundColor: '#f3f4f6',
                  color: theme.palette.primary.main
                }
              },
              '& .MuiTablePagination-actions': {
                marginLeft: isMobile ? 0 : 'auto'
              }
            }}
          />
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
            <Box sx={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              textAlign: 'center', 
              mb: 4 
            }}>
              <Box sx={{
                backgroundColor: 'rgba(24, 119, 242, 0.1)',
                p: 1.5,
                borderRadius: '50%',
                mb: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <EditIcon sx={{ 
                  fontSize: 32, 
                  color: '#1877F2' 
                }} />
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
                <Box component='span' sx={{ fontWeight: 600, color: '#1f2937' }}>
                  {selectedUser?.firstName} {selectedUser?.lastName}
                </Box>
                .
              </Typography>
            </Box>

            {/* Seção de Permissões */}
            <Box sx={{
              backgroundColor: '#f9fafb',
              p: 3,
              borderRadius: 2,
              border: '1px solid #e5e7eb',
              mb: 4
            }}>
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
                    options={roles}
                    getOptionLabel={(option) => (typeof option === 'string' ? option : option.name)}
                    value={roles.find((role) => role._id === editForm.role) || null}
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
                    loading={roles.length === 0 && editRolesDropdownOpen}
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
                    options={departments}
                    getOptionLabel={(option) => (typeof option === 'string' ? option : option.department_name)}
                    value={departments.filter((dept) => editForm.departments?.includes(dept._id)) || []}
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
                    loading={departments.length === 0 && editDepartmentsDropdownOpen}
                    loadingText={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CircularProgress size={20} />
                        Carregando gerências...
                      </Box>
                    }
                  />
                </Box>
              </Box>
            </Box>
          </Box>
        </DialogContent>
        
        <DialogActions sx={{ 
          p: 3, 
          pt: 0,
          justifyContent: 'flex-end',
          gap: 1
        }}>
          <Button 
            onClick={() => setEditModalOpen(false)}
            sx={{
              px: 3,
              py: 1.25,
              fontSize: '0.875rem',
              fontWeight: 600,
              color: '#6b7280',
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
            disabled={loading}
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
            Salvar Alterações
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export { UserSection };
