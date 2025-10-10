import { Add as AddIcon, FilterListOff as FilterListOffIcon, Delete as DeleteIcon, Refresh as RefreshIcon, Search as SearchIcon } from '@mui/icons-material';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Typography
} from '@mui/material';
import type { CreateInviteDto, FilterInvitesDto, Invite, InviteStatus } from '@/globals/types';
import { useCallback, useEffect, useState } from 'react';
import { useDepartments, useInvites, useRoles } from '@/hooks';

import { useNotification } from '@/components';

const InvitesSection = () => {
  const { showNotification } = useNotification();
  const { invites, loading, error, pagination, fetchInvites, createInvite, deleteInvite, clearError } = useInvites();

  const { roles, fetchRoles } = useRoles();
  const { departments, fetchDepartments } = useDepartments();

  const [rolesDropdownOpen, setRolesDropdownOpen] = useState(false);
  const [departmentsDropdownOpen, setDepartmentsDropdownOpen] = useState(false);

  const [filters, setFilters] = useState<FilterInvitesDto>({
    page: '1',
    limit: '10',
    status: undefined,
    email: '',
    role: ''
  });

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [createForm, setCreateForm] = useState<CreateInviteDto>({
    email: '',
    roleId: '',
    departmentIds: []
  });

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [inviteToDelete, setInviteToDelete] = useState<Invite | null>(null);

  useEffect(() => {
    fetchInvites(filters);
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

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchInvites({ ...filters, page: '1' });
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [filters.status, filters.email, filters.role]);

  const handleClearFilters = useCallback(() => {
    const clearedFilters = {
      page: '1',
      limit: '10',
      status: undefined,
      email: '',
      role: ''
    };
    setFilters(clearedFilters);
  }, []);

  const handlePageChange = useCallback(
    (_event: unknown, newPage: number) => {
      const newFilters = { ...filters, page: String(newPage + 1) };
      setFilters(newFilters);
      fetchInvites(newFilters);
    },
    [filters, fetchInvites]
  );

  const handleRowsPerPageChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const newLimit = event.target.value;
      const newFilters = { ...filters, page: '1', limit: newLimit };
      setFilters(newFilters);
      fetchInvites(newFilters);
    },
    [filters, fetchInvites]
  );

  const handleOpenCreate = useCallback(() => {
    setCreateForm({
      email: '',
      roleId: '',
      departmentIds: []
    });
    setCreateModalOpen(true);
  }, []);

  const handleCreateInvite = useCallback(async () => {
    if (!createForm.email || !createForm.roleId) return;

    try {
      await createInvite(createForm);
      showNotification('Convite criado com sucesso!', 'success');
      setCreateModalOpen(false);
      setCreateForm({ email: '', roleId: '', departmentIds: [] });
      
      fetchInvites(filters);
    } catch (err) {
      let errorMessage = 'Erro ao criar convite';

      if (err?.response?.data?.message) {
        const message = err.response.data.message;
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
    }
  }, [createForm, createInvite, showNotification, fetchInvites, filters]);

  const handleOpenDeleteConfirm = useCallback((invite: Invite) => {
    setInviteToDelete(invite);
    setDeleteConfirmOpen(true);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (!inviteToDelete?._id) return;

    try {
      await deleteInvite(inviteToDelete._id);
      showNotification('Convite deletado com sucesso!', 'success');
      setDeleteConfirmOpen(false);
      setInviteToDelete(null);
    } catch (err) {
      let errorMessage = 'Erro ao deletar convite';

      if (err?.response?.data?.message) {
        errorMessage = err.response.data.message;
      }

      showNotification(errorMessage, 'error');
    }
  }, [inviteToDelete, deleteInvite, showNotification]);

  const handleCancelDelete = useCallback(() => {
    setDeleteConfirmOpen(false);
    setInviteToDelete(null);
  }, []);

  const handleRefresh = useCallback(() => {
    fetchInvites(filters);
  }, [filters, fetchInvites]);

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
            backgroundColor: 'success.main', // Verde claro das gerências para aceito
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
    <Box sx={{ height: '100%', p: 2 }}>
      <Card
        sx={{
          borderRadius: 0,
          boxShadow: 'none',
          border: 'none',
          overflow: 'hidden',
          height: '100%',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        <CardContent sx={{ p: 4, flex: 1, display: 'flex', flexDirection: 'column' }}>
          {/* Filtros e Botão Atualizar */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
            <Grid
              container
              spacing={2}
              sx={{ flex: 1 }}
            >
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <TextField
                fullWidth
                placeholder='Buscar por email'
                value={filters.email || ''}
                onChange={(e) => {
                  setFilters((prev) => ({
                    ...prev,
                    email: e.target.value
                  }));
                }}
                InputProps={{
                  startAdornment: <SearchIcon sx={{ mr: 1, color: '#9ca3af', fontSize: '1.25rem' }} />
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    height: '56px',
                    borderRadius: 3,
                    backgroundColor: '#ffffff',
                    border: '2px solid #e5e7eb',
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                      borderColor: '#d1d5db'
                    },
                    '&.Mui-focused': {
                      borderColor: '#1e40af',
                      boxShadow: '0 0 0 3px rgba(30, 64, 175, 0.1)'
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
            <Grid size={{ xs: 6, sm: 3, md: 2 }}>
              <FormControl fullWidth>
                <Select
                  value={filters.status || 'todos'}
                  displayEmpty
                  onChange={(e) => {
                    const value = e.target.value;
                    setFilters((prev) => ({
                      ...prev,
                      status: value === 'todos' ? undefined : (value as InviteStatus)
                    }));
                  }}
                  sx={{
                    height: '56px',
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
                      borderColor: '#1e40af',
                      boxShadow: '0 0 0 3px rgba(30, 64, 175, 0.1)'
                    },
                    '& .MuiSelect-select': {
                      color: filters.status === undefined ? '#9ca3af' : '#374151',
                      height: '56px',
                      display: 'flex',
                      alignItems: 'center'
                    }
                  }}
                  renderValue={(value) => {
                    if (value === 'todos' || value === undefined) {
                      return <span style={{ color: '#9ca3af' }}>Status</span>;
                    }
                    return value === 'pendente' ? 'Pendente' : 
                           value === 'aceito' ? 'Aceito' : 
                           value === 'recusado' ? 'Recusado' : 
                           value === 'expirado' ? 'Expirado' : value;
                  }}
                >
                  <MenuItem value='todos'>Todos</MenuItem>
                  <MenuItem value='pendente'>Pendente</MenuItem>
                  <MenuItem value='aceito'>Aceito</MenuItem>
                  <MenuItem value='recusado'>Recusado</MenuItem>
                  <MenuItem value='expirado'>Expirado</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 6, sm: 3, md: 2 }}>
              <FormControl fullWidth>
                <Select
                  value={filters.role || ''}
                  displayEmpty
                  onChange={(e) => {
                    setFilters((prev) => ({
                      ...prev,
                      role: e.target.value
                    }));
                  }}
                  onOpen={handleRolesDropdownOpen}
                  disabled={loading}
                  sx={{
                    height: '56px',
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
                      borderColor: '#1e40af',
                      boxShadow: '0 0 0 3px rgba(30, 64, 175, 0.1)'
                    },
                    '& .MuiSelect-select': {
                      color: filters.role === '' ? '#9ca3af' : '#374151',
                      height: '56px',
                      display: 'flex',
                      alignItems: 'center'
                    }
                  }}
                  renderValue={(value) => {
                    if (!value) {
                      return <span style={{ color: '#9ca3af' }}>Role</span>;
                    }
                    const role = roles.find(r => r._id === value);
                    return role ? role.name : value;
                  }}
                >
                  <MenuItem value=''>
                    <em>Todas as roles</em>
                  </MenuItem>
                  {roles.length === 0 ? (
                    <MenuItem disabled>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CircularProgress size={20} />
                        Carregando roles...
                      </Box>
                    </MenuItem>
                  ) : (
                    roles.map((role) => (
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
            </Grid>
            <Grid size={{ xs: 6, sm: 3, md: 1 }}>
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'center',
                alignItems: 'center',
                height: '56px'
              }}>
                <IconButton
                  onClick={handleClearFilters}
                  disabled={loading}
                  title='Limpar filtros'
                  sx={{
                    backgroundColor: '#f3f4f6',
                    color: '#6b7280',
                    borderRadius: 3,
                    width: '56px',
                    height: '56px',
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
            </Grid>
            
            {/* Botões de Ação - Agrupados à direita */}
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              <Button
                startIcon={<AddIcon />}
                onClick={handleOpenCreate}
                variant='contained'
                sx={{
                  height: '56px',
                  borderRadius: 3,
                  textTransform: 'uppercase',
                  fontWeight: 600,
                  letterSpacing: '0.05em',
                  px: 4,
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
              <Button
                startIcon={<RefreshIcon sx={{ fontSize: '1.25rem' }} />}
                onClick={handleRefresh}
                disabled={loading}
                variant='contained'
                sx={{
                  height: '56px',
                  borderRadius: 3,
                  textTransform: 'uppercase',
                  fontWeight: 600,
                  letterSpacing: '0.05em',
                  px: 4,
                  backgroundColor: '#1976d2',
                  color: '#ffffff',
                  boxShadow: '0 2px 8px rgba(25, 118, 210, 0.2)',
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    backgroundColor: '#1565c0',
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

          <TableContainer
            component={Paper}
            variant='outlined'
            sx={{
              borderRadius: 2,
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
              border: '1px solid #e5e7eb',
              overflow: 'hidden',
              flex: 1,
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            <Table sx={{ flex: 1 }}>
              <TableHead>
                <TableRow
                  sx={{
                    backgroundColor: '#f8fafc',
                    '& .MuiTableCell-head': {
                      backgroundColor: '#f8fafc',
                      color: '#374151',
                      fontWeight: 600,
                      fontSize: '0.875rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      borderBottom: '2px solid #e5e7eb',
                      py: 2
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
                {loading ? (
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
                          sx={{ color: '#1e40af' }}
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
                ) : invites.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      align='center'
                      sx={{ 
                        py: 6,
                        backgroundColor: '#fafafa'
                      }}
                    >
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
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
                      </Box>
                    </TableCell>
                  </TableRow>
                ) : (
                  invites.map((invite) => (
                    <TableRow
                      key={invite._id}
                      hover
                      sx={{
                        '&:hover': {
                          backgroundColor: '#f8fafc',
                          transform: 'translateY(-1px)',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                          transition: 'all 0.2s ease-in-out'
                        },
                        '& .MuiTableCell-root': {
                          borderBottom: '1px solid #f1f5f9',
                          py: 2,
                          transition: 'all 0.2s ease-in-out'
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
                                      backgroundColor: '#15803d', // Verde escuro para gerências
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
                          title='Excluir convite'
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

          <TablePagination
            component='div'
            count={pagination.total}
            page={pagination.page - 1}
            onPageChange={handlePageChange}
            rowsPerPage={pagination.limit}
            onRowsPerPageChange={handleRowsPerPageChange}
            rowsPerPageOptions={[5, 10, 25, 50]}
            labelRowsPerPage='Itens por página:'
            labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count !== -1 ? count : `mais de ${to}`}`}
            sx={{
              backgroundColor: '#f8fafc',
              borderTop: '1px solid #e5e7eb',
              '& .MuiTablePagination-toolbar': {
                paddingLeft: 2,
                paddingRight: 2,
                minHeight: 56
              },
              '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': {
                color: '#374151',
                fontWeight: 500
              },
              '& .MuiTablePagination-select': {
                color: '#1e40af',
                fontWeight: 600
              },
              '& .MuiIconButton-root': {
                color: '#6b7280',
                '&:hover': {
                  backgroundColor: '#f3f4f6',
                  color: '#1e40af'
                }
              }
            }}
          />
        </CardContent>
      </Card>

      <Dialog
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        maxWidth='sm'
        fullWidth
      >
        <DialogTitle>Criar Novo Convite</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField
              label='Email'
              type='email'
              value={createForm.email}
              onChange={(e) => setCreateForm((prev) => ({ ...prev, email: e.target.value }))}
              fullWidth
              required
              helperText='O email deve estar cadastrado no sistema'
            />

            <FormControl
              fullWidth
              required
            >
              <InputLabel>Role</InputLabel>
              <Select
                value={createForm.roleId}
                label='Role'
                onChange={(e) => {
                  setCreateForm((prev) => ({
                    ...prev,
                    roleId: e.target.value
                  }));
                }}
                onOpen={handleRolesDropdownOpen}
                disabled={loading}
              >
                {roles.length === 0 ? (
                  <MenuItem disabled>
                    <CircularProgress
                      size={20}
                      sx={{ mr: 1 }}
                    />
                    Carregando roles...
                  </MenuItem>
                ) : (
                  roles.map((role) => (
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

            <FormControl fullWidth>
              <InputLabel>Gerências (opcional)</InputLabel>
              <Select
                multiple
                value={createForm.departmentIds || []}
                label='Gerências (opcional)'
                onChange={(e) => {
                  const value = typeof e.target.value === 'string' ? e.target.value.split(',') : e.target.value;
                  setCreateForm((prev) => ({
                    ...prev,
                    departmentIds: value
                  }));
                  // Fechar o dropdown após a seleção
                  setDepartmentsDropdownOpen(false);
                }}
                onOpen={handleDepartmentsDropdownOpen}
                onClose={() => setDepartmentsDropdownOpen(false)}
                open={departmentsDropdownOpen}
                disabled={loading}
                renderValue={(selected) => {
                  if (!selected || selected.length === 0) return '';
                  return selected.map((id) => departments.find((dept) => dept._id === id)?.department_name).join(', ');
                }}
              >
                {departments.length === 0 ? (
                  <MenuItem disabled>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CircularProgress size={20} />
                      Carregando gerências...
                    </Box>
                  </MenuItem>
                ) : (
                  departments.map((dept) => (
                    <MenuItem
                      key={dept._id}
                      value={dept._id}
                    >
                      {dept.department_name}
                    </MenuItem>
                  ))
                )}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateModalOpen(false)}>Cancelar</Button>
          <Button
            onClick={handleCreateInvite}
            variant='contained'
            disabled={loading || !createForm.email || !createForm.roleId}
          >
            Criar Convite
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal de confirmação de exclusão */}
      <Dialog
        open={deleteConfirmOpen}
        onClose={handleCancelDelete}
        maxWidth='sm'
        fullWidth
      >
        <DialogTitle>Confirmar Exclusão</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <Typography variant='body1'>
              Tem certeza que deseja excluir o convite para <strong>{inviteToDelete?.email}</strong>?
            </Typography>

            {inviteToDelete && (
              <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                <Typography
                  variant='body2'
                  color='text.secondary'
                  gutterBottom
                >
                  Detalhes do convite:
                </Typography>
                <Typography variant='body2'>
                  <strong>Email:</strong> {inviteToDelete.email}
                </Typography>
                <Typography variant='body2'>
                  <strong>Role:</strong> {inviteToDelete.role.name}
                </Typography>
                <Typography variant='body2'>
                  <strong>Status:</strong> {getStatusText(inviteToDelete.status)}
                </Typography>
                <Typography variant='body2'>
                  <strong>Criado em:</strong> {new Date(inviteToDelete.createdAt).toLocaleDateString('pt-BR')}
                </Typography>
              </Box>
            )}

            <Alert severity='warning'>Esta ação não pode ser desfeita. O convite será permanentemente removido.</Alert>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleCancelDelete}
            variant='outlined'
          >
            Cancelar
          </Button>
          <Button
            onClick={handleConfirmDelete}
            color='error'
            variant='contained'
            disabled={loading}
          >
            Excluir Convite
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export { InvitesSection };
