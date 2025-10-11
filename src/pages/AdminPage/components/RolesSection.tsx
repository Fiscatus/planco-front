import { Add as AddIcon, Close as CloseIcon, Delete as DeleteIcon, Edit as EditIcon, Refresh as RefreshIcon, Search as SearchIcon, Warning as WarningIcon } from '@mui/icons-material';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Checkbox,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  FormGroup,
  Grid,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Stack,
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
import type { CreateRoleDto, PermissionDto, Role, UpdateRoleDto } from '@/globals/types';
import { useAuth, usePermissions, useRoles } from '@/hooks';
import { useCallback, useEffect, useState } from 'react';

import { useNotification } from '@/components';

const RolesSection = () => {
  const { user } = useAuth();
  const { showNotification } = useNotification();
  const { roles, loading, error, fetchRoles, createRole, updateRole, checkDeleteImpact, deleteRole, clearError } =
    useRoles();

  const {
    permissions: availablePermissions,
    loading: permissionsLoading,
    error: permissionsError,
    fetchPermissions,
    clearError: clearPermissionsError
  } = usePermissions();

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [deleteImpact, setDeleteImpact] = useState<{
    canDelete: boolean;
    affectedUsers: number;
    roleName: string;
    message: string;
  } | null>(null);

  const [roleName, setRoleName] = useState('');
  const [permissions, setPermissions] = useState<string[]>([]);
  const [search, setSearch] = useState('');
  const [pagination, setPagination] = useState({
    page: 0,
    limit: 5,
    total: 0
  });

  useEffect(() => {
    fetchRoles();
    fetchPermissions();
  }, [fetchRoles, fetchPermissions]);

  const clearForms = useCallback(() => {
    setRoleName('');
    setPermissions([]);
  }, []);

  const handleOpenCreate = useCallback(() => {
    clearForms();
    setCreateModalOpen(true);
  }, [clearForms]);

  const handleOpenEdit = useCallback((role: Role) => {
    setSelectedRole(role);
    setRoleName(role.name);
    setPermissions(role.permissions);
    setEditModalOpen(true);
  }, []);

  const handleCloseModals = useCallback(() => {
    setCreateModalOpen(false);
    setEditModalOpen(false);
    setDeleteConfirmOpen(false);
    setSelectedRole(null);
    setDeleteImpact(null);
    clearForms();
  }, [clearForms]);

  const handleCreateRole = useCallback(async () => {
    if (!user?.org?._id || !roleName.trim()) return;

    try {
      const roleData: CreateRoleDto = {
        name: roleName.trim(),
        permissions,
        orgId: user.org._id
      };

      await createRole(roleData);
      showNotification('Role criada com sucesso!', 'success');
      handleCloseModals();
    } catch {
      showNotification('Erro ao criar role', 'error');
    }
  }, [user?.org?._id, roleName, permissions, createRole, showNotification, handleCloseModals]);

  const handleUpdateRole = useCallback(async () => {
    if (!selectedRole?._id || !roleName.trim()) return;

    try {
      const updateData: UpdateRoleDto = {
        name: roleName.trim(),
        permissions
      };

      await updateRole(selectedRole._id, updateData);
      showNotification('Role atualizada com sucesso!', 'success');
      handleCloseModals();
    } catch {
      showNotification('Erro ao atualizar role', 'error');
    }
  }, [selectedRole?._id, roleName, permissions, updateRole, showNotification, handleCloseModals]);

  const handleOpenDeleteConfirm = useCallback(
    async (role: Role) => {
      if (!role._id) return;

      if (role.name === 'Administrador') {
        showNotification('Não é possível deletar a role "Administrador"', 'error');
        return;
      }

      try {
        setSelectedRole(role);
        const impact = await checkDeleteImpact(role._id);
        setDeleteImpact(impact);
        setDeleteConfirmOpen(true);
      } catch {
        showNotification('Erro ao verificar impacto da exclusão', 'error');
      }
    },
    [checkDeleteImpact, showNotification]
  );

  const handleConfirmDelete = useCallback(async () => {
    if (!selectedRole?._id) return;

    try {
      const result = await deleteRole(selectedRole._id);
      showNotification(`Role deletada com sucesso! ${result.affectedUsers} usuário(s) foram afetados.`, 'success');
      handleCloseModals();
    } catch {
      showNotification('Erro ao deletar role', 'error');
    }
  }, [selectedRole?._id, deleteRole, showNotification, handleCloseModals]);

  const handleRefresh = useCallback(() => {
    fetchRoles();
  }, [fetchRoles]);

  const handlePageChange = useCallback((_event: unknown, newPage: number) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
  }, []);

  const handleRowsPerPageChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const newLimit = Number(event.target.value);
    setPagination((prev) => ({ ...prev, limit: newLimit, page: 0 }));
  }, []);

  const filteredRoles = roles.filter(role => 
    role.name.toLowerCase().includes(search.toLowerCase())
  );

  const paginatedRoles = filteredRoles.slice(
    pagination.page * pagination.limit,
    (pagination.page + 1) * pagination.limit
  );

  const togglePermission = useCallback((permission: string) => {
    setPermissions((prev) =>
      prev.includes(permission) ? prev.filter((p) => p !== permission) : [...prev, permission]
    );
  }, []);

  const groupedPermissions = availablePermissions.reduce<Record<string, PermissionDto[]>>((acc, perm) => {
    const group = perm.category.toUpperCase();
    if (!acc[group]) acc[group] = [];
    acc[group].push(perm);
    return acc;
  }, {});

  return (
    <Box sx={{ height: '100%', p: 3, bgcolor: 'background.default' }}>
      <Grid container spacing={3} sx={{ height: '100%' }}>
        {/* Coluna da esquerda - Lista de Roles */}
        <Grid size={{ xs: 12, lg: 4 }}>
          <Card
            sx={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              borderRadius: 3,
              boxShadow: 1,
              border: '1px solid',
              borderColor: 'divider'
            }}
          >
            <Box sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant='h6' sx={{ fontWeight: 500, px: 1 }}>
                  Roles
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Button
                    onClick={handleRefresh}
                    disabled={loading}
                    sx={{
                      minWidth: 'auto',
                      p: 1,
                      borderRadius: '50%',
                      color: 'text.secondary',
                      '&:hover': { bgcolor: 'grey.100' }
                    }}
                  >
                    <RefreshIcon />
                  </Button>
                  <Button
                    startIcon={<AddIcon />}
                    variant='contained'
                    size='small'
                    onClick={handleOpenCreate}
                    sx={{
                      textTransform: 'none',
                      borderRadius: 6,
                      px: 2,
                      py: 1,
                      fontSize: '0.875rem',
                      fontWeight: 500,
                      boxShadow: 1
                    }}
                  >
                    Nova Role
                  </Button>
                </Box>
              </Box>
              
              {error && (
                <Alert
                  severity='error'
                  sx={{ mb: 2 }}
                  onClose={clearError}
                >
                  {error}
                </Alert>
              )}

              {permissionsError && (
                <Alert
                  severity='error'
                  sx={{ mb: 2 }}
                  onClose={clearPermissionsError}
                >
                  {permissionsError}
                </Alert>
              )}
              
              <Box sx={{ position: 'relative' }}>
                <SearchIcon
                  sx={{
                    position: 'absolute',
                    left: 14,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'text.secondary',
                    fontSize: 22,
                    zIndex: 1
                  }}
                />
                <TextField
                  fullWidth
                  placeholder='Buscar roles...'
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      pl: 6,
                      pr: 3,
                      py: 2,
                      borderRadius: 8,
                      fontSize: '0.95rem',
                      height: 48,
                      '& fieldset': {
                        borderColor: 'divider',
                        borderWidth: 1.5
                      },
                      '&:hover fieldset': {
                        borderColor: 'primary.main',
                        borderWidth: 1.5
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: 'primary.main',
                        borderWidth: 2
                      }
                    },
                    '& .MuiInputBase-input': {
                      fontSize: '0.95rem',
                      fontWeight: 400,
                      '&::placeholder': {
                        color: 'text.secondary',
                        opacity: 0.8,
                        fontSize: '0.95rem'
                      }
                    }
                  }}
                />
              </Box>
            </Box>

            <Box sx={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
                  <CircularProgress />
                </Box>
              ) : (
                <>
                  <Box sx={{ flex: 1, overflow: 'auto', px: 1, pb: 1 }}>
                    <List disablePadding>
                      {paginatedRoles.map((role) => {
                        const isSelected = selectedRole?._id === role._id;
                        return (
                          <ListItem key={role._id} disableGutters sx={{ mb: 0.5 }}>
                            <ListItemButton
                              selected={isSelected}
                              onClick={() => setSelectedRole(role)}
                              sx={{
                                borderRadius: 2,
                                py: 1.5,
                                px: 2,
                                border: isSelected ? '2px solid' : '1px solid',
                                borderColor: isSelected ? 'primary.main' : 'divider',
                                bgcolor: isSelected ? 'primary.main' : 'background.paper',
                                color: isSelected ? 'white' : 'text.primary',
                                boxShadow: isSelected ? 1 : 0,
                                transition: 'all 0.2s ease-in-out',
                                '&:hover': {
                                  bgcolor: isSelected ? 'primary.dark' : 'grey.50',
                                  borderColor: isSelected ? 'primary.dark' : 'primary.main',
                                  boxShadow: 1
                                },
                                '&.Mui-selected': {
                                  bgcolor: 'primary.main',
                                  color: 'white',
                                  borderColor: 'primary.main',
                                  boxShadow: 1,
                                  '&:hover': {
                                    bgcolor: 'primary.dark',
                                    borderColor: 'primary.dark'
                                  }
                                }
                              }}
                            >
                              <ListItemText
                                primary={
                                  <Typography
                                    variant='body2'
                                    fontWeight={500}
                                    sx={{ fontSize: '0.875rem' }}
                                  >
                                    {role.name}
                                  </Typography>
                                }
                              />
                              {role.permissions.length > 0 && (
                                <Chip
                                  size='small'
                                  label={role.permissions.length}
                                  sx={{
                                    fontSize: '0.75rem',
                                    fontWeight: 700,
                                    height: 20,
                                    bgcolor: isSelected ? 'white' : 'primary.main',
                                    color: isSelected ? 'primary.main' : 'white',
                                    borderRadius: 3,
                                    border: isSelected ? '1px solid' : 'none',
                                    borderColor: isSelected ? 'primary.main' : 'transparent'
                                  }}
                                />
                              )}
                            </ListItemButton>
                          </ListItem>
                        );
                      })}
                      {paginatedRoles.length === 0 && (
                        <Box sx={{ p: 2, textAlign: 'center' }}>
                          <Typography variant='body2' color='text.secondary'>
                            Nenhuma role encontrada
                          </Typography>
                        </Box>
                      )}
                    </List>
                  </Box>

                  <TablePagination
                    component='div'
                    count={filteredRoles.length}
                    page={pagination.page}
                    onPageChange={handlePageChange}
                    rowsPerPage={pagination.limit}
                    onRowsPerPageChange={handleRowsPerPageChange}
                    rowsPerPageOptions={[5, 10, 25, 50]}
                    labelRowsPerPage='Itens por página:'
                    labelDisplayedRows={({ from, to, count }) =>
                      `${from}-${to} de ${count !== -1 ? count : `mais de ${to}`}`
                    }
                    sx={{
                      borderTop: '1px solid',
                      borderColor: 'divider',
                      '& .MuiTablePagination-toolbar': {
                        minHeight: 48,
                        px: 2
                      }
                    }}
                  />
                </>
              )}
            </Box>
          </Card>
        </Grid>

        {/* Coluna da direita - Detalhes da Role */}
        <Grid size={{ xs: 12, lg: 8 }}>
          <Stack spacing={3} sx={{ height: '100%' }}>
            {/* Card de Detalhes da Role */}
            <Card
              sx={{
                borderRadius: 3,
                border: '1px solid',
                borderColor: 'divider',
                boxShadow: 1
              }}
            >
              <Box sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
                  <Box>
                    <Typography
                      variant='h4'
                      sx={{
                        fontSize: '1.5rem',
                        fontWeight: 400,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1.5,
                        mb: 0.5
                      }}
                    >
                      {selectedRole ? selectedRole.name : 'Role selecionada'}
                    </Typography>
                    <Typography variant='body2' color='text.secondary'>
                      {selectedRole ? 'Detalhes da role selecionada' : 'Selecione uma role à esquerda'}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Button
                      variant='outlined'
                      size='small'
                      startIcon={<EditIcon />}
                      onClick={() => selectedRole && handleOpenEdit(selectedRole)}
                      sx={{
                        textTransform: 'none',
                        borderRadius: 6,
                        px: 2,
                        py: 1,
                        fontSize: '0.875rem',
                        fontWeight: 500,
                        borderColor: 'primary.main',
                        color: 'primary.main',
                        '&:hover': {
                          bgcolor: 'primary.main',
                          color: 'white'
                        }
                      }}
                    >
                      Editar
                    </Button>
                    <Button
                      variant='outlined'
                      size='small'
                      color='error'
                      onClick={() => selectedRole && handleOpenDeleteConfirm(selectedRole)}
                      disabled={selectedRole?.name === 'Administrador'}
                      sx={{
                        textTransform: 'none',
                        borderRadius: 6,
                        px: 2,
                        py: 1,
                        fontSize: '0.875rem',
                        fontWeight: 500,
                        borderColor: 'error.main',
                        color: 'error.main',
                        '&:hover': {
                          bgcolor: 'error.main',
                          color: 'white'
                        }
                      }}
                    >
                      Excluir
                    </Button>
                  </Box>
                </Box>

                {selectedRole ? (
                  <Box>
                    <Typography variant='body2' fontWeight={500} color='text.secondary' sx={{ mb: 1 }}>
                      Permissões ({selectedRole.permissions.length})
                    </Typography>
                    {selectedRole.permissions.length > 0 ? (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                         {selectedRole.permissions.map((permission) => (
                           <Chip
                             key={permission}
                             label={permission}
                             size='small'
                             sx={{
                               fontSize: '0.75rem',
                               fontWeight: 600,
                               bgcolor: 'warning.main',
                               color: 'white',
                               border: 'none',
                               borderRadius: 2
                             }}
                           />
                         ))}
                      </Box>
                    ) : (
                      <Typography variant='body2' color='text.secondary' sx={{ fontStyle: 'italic' }}>
                        Nenhuma permissão definida
                      </Typography>
                    )}
                  </Box>
                ) : (
                  <Alert severity='info'>Nenhuma role selecionada</Alert>
                )}
              </Box>
            </Card>
          </Stack>
        </Grid>
      </Grid>

      <Dialog
        open={createModalOpen}
        onClose={handleCloseModals}
        fullWidth
        maxWidth='md'
        PaperProps={{
          sx: {
            borderRadius: 2,
            boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
            overflow: 'hidden'
          }
        }}
      >
        <DialogContent sx={{ p: 0 }}>
          {/* Header */}
          <Box sx={{ 
            p: 3, 
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 2
          }}>
            <Typography
              variant='h6'
              sx={{
                fontWeight: 700,
                color: '#050505',
                fontSize: '1.25rem'
              }}
            >
              Criar Nova Role
            </Typography>
            <IconButton
              onClick={handleCloseModals}
              sx={{
                color: '#65676B',
                '&:hover': {
                  backgroundColor: '#f3f4f6'
                }
              }}
            >
              <CloseIcon />
            </IconButton>
          </Box>

          {/* Form Content */}
          <Box sx={{ px: 3, display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Role Name Field */}
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
                Nome da Role *
              </Typography>
              <TextField
                fullWidth
                placeholder='Digite o nome da role'
                value={roleName}
                onChange={(e) => setRoleName(e.target.value)}
                required
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: '#F0F2F5',
                    borderRadius: 2,
                    '& .MuiOutlinedInput-notchedOutline': {
                      border: '1px solid #DADDE1',
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
            </Box>

            {/* Permissions Section */}
            <Box>
              <Typography
                variant='body2'
                sx={{
                  fontWeight: 600,
                  color: '#050505',
                  mb: 2,
                  fontSize: '1rem'
                }}
              >
                Permissões
              </Typography>
              <Box
                sx={{
                  border: '1px solid #DADDE1',
                  borderRadius: 2,
                  maxHeight: '40vh',
                  overflowY: 'auto',
                  backgroundColor: '#FFFFFF'
                }}
              >
                <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {permissionsLoading ? (
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        py: 4
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CircularProgress size={20} sx={{ color: '#1877F2' }} />
                        <Typography
                          variant='body2'
                          sx={{ color: '#65676B' }}
                        >
                          Carregando permissões...
                        </Typography>
                      </Box>
                    </Box>
                  ) : (
                    Object.entries(groupedPermissions).map(([group, perms]) => (
                      <Box
                        key={group}
                        sx={{
                          p: 2,
                          borderRadius: 2,
                          backgroundColor: '#f9fafb'
                        }}
                      >
                        <Typography
                          variant='body2'
                          sx={{
                            fontWeight: 600,
                            color: '#050505',
                            mb: 2,
                            fontSize: '0.875rem'
                          }}
                        >
                          {group}
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                          {perms.map((permission) => (
                            <FormControlLabel
                              key={permission.key}
                              control={
                                <Checkbox
                                  checked={permissions.includes(permission.key)}
                                  onChange={() => togglePermission(permission.key)}
                                  sx={{
                                    color: '#1877F2',
                                    '&.Mui-checked': {
                                      color: '#1877F2'
                                    },
                                    '& .MuiSvgIcon-root': {
                                      fontSize: 20
                                    }
                                  }}
                                />
                              }
                              label={
                                <Typography
                                  variant='body2'
                                  sx={{
                                    color: '#65676B',
                                    fontSize: '0.875rem'
                                  }}
                                >
                                  {permission.label}
                                </Typography>
                              }
                              sx={{
                                margin: 0,
                                '& .MuiFormControlLabel-label': {
                                  marginLeft: 1
                                }
                              }}
                            />
                          ))}
                        </Box>
                      </Box>
                    ))
                  )}
                </Box>
              </Box>
            </Box>
          </Box>
        </DialogContent>
        
        {/* Footer com botões */}
        <Box sx={{ 
          p: 3, 
          borderTop: '1px solid #DADDE1',
          display: 'flex',
          justifyContent: 'flex-end',
          gap: 2
        }}>
          <Button
            onClick={handleCloseModals}
            sx={{
              px: 3,
              py: 1,
              fontSize: '0.875rem',
              fontWeight: 600,
              color: '#65676B',
              textTransform: 'none',
              backgroundColor: '#e5e7eb',
              borderRadius: 2,
              transition: 'all 0.2s ease-in-out',
              '&:hover': {
                backgroundColor: '#d1d5db',
                color: '#374151'
              }
            }}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleCreateRole}
            variant='contained'
            disabled={loading || !roleName.trim()}
            sx={{
              px: 3,
              py: 1,
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
                backgroundColor: '#d1d5db',
                color: '#9ca3af',
                boxShadow: 'none'
              }
            }}
          >
            Criar Role
          </Button>
        </Box>
      </Dialog>

      <Dialog
        open={editModalOpen}
        onClose={handleCloseModals}
        fullWidth
        maxWidth='md'
        PaperProps={{
          sx: {
            borderRadius: 2,
            boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
            overflow: 'hidden'
          }
        }}
      >
        <DialogContent sx={{ p: 0 }}>
          {/* Header */}
          <Box sx={{ 
            p: 3, 
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 2
          }}>
            <Typography
              variant='h6'
              sx={{
                fontWeight: 700,
                color: '#050505',
                fontSize: '1.25rem'
              }}
            >
              Editar Role
            </Typography>
            <IconButton
              onClick={handleCloseModals}
              sx={{
                color: '#65676B',
                '&:hover': {
                  backgroundColor: '#f3f4f6'
                }
              }}
            >
              <CloseIcon />
            </IconButton>
          </Box>

          {/* Form Content */}
          <Box sx={{ px: 3, display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Role Name Field */}
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
                Nome da Role *
              </Typography>
              <TextField
                fullWidth
                placeholder='Digite o nome da role'
                value={roleName}
                onChange={(e) => setRoleName(e.target.value)}
                required
                disabled={selectedRole?.name === 'Administrador'}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: selectedRole?.name === 'Administrador' ? '#f3f4f6' : '#F0F2F5',
                    borderRadius: 2,
                    '& .MuiOutlinedInput-notchedOutline': {
                      border: '1px solid #DADDE1',
                      transition: 'all 0.2s ease-in-out'
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#B0B3B8'
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#1877F2',
                      boxShadow: '0 0 0 3px rgba(24, 119, 242, 0.1)'
                    },
                    '&.Mui-disabled': {
                      backgroundColor: '#f3f4f6',
                      color: '#9ca3af'
                    }
                  },
                  '& .MuiInputBase-input::placeholder': {
                    color: '#65676B',
                    opacity: 1
                  }
                }}
              />
              {selectedRole?.name === 'Administrador' && (
                <Alert 
                  severity='info'
                  sx={{
                    mt: 1,
                    borderRadius: 2,
                    backgroundColor: '#eff6ff',
                    border: '1px solid #bfdbfe',
                    '& .MuiAlert-icon': {
                      color: '#1877F2'
                    },
                    '& .MuiAlert-message': {
                      color: '#1e40af',
                      fontWeight: 500
                    }
                  }}
                >
                  O nome da role "Administrador" não pode ser alterado
                </Alert>
              )}
            </Box>

            {/* Permissions Section */}
            <Box>
              <Typography
                variant='body2'
                sx={{
                  fontWeight: 600,
                  color: '#050505',
                  mb: 2,
                  fontSize: '1rem'
                }}
              >
                Permissões
              </Typography>
              <Box
                sx={{
                  border: '1px solid #DADDE1',
                  borderRadius: 2,
                  maxHeight: '40vh',
                  overflowY: 'auto',
                  backgroundColor: '#FFFFFF'
                }}
              >
                <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {permissionsLoading ? (
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        py: 4
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CircularProgress size={20} sx={{ color: '#1877F2' }} />
                        <Typography
                          variant='body2'
                          sx={{ color: '#65676B' }}
                        >
                          Carregando permissões...
                        </Typography>
                      </Box>
                    </Box>
                  ) : (
                    Object.entries(groupedPermissions).map(([group, perms]) => (
                      <Box
                        key={group}
                        sx={{
                          p: 2,
                          borderRadius: 2,
                          backgroundColor: '#f9fafb'
                        }}
                      >
                        <Typography
                          variant='body2'
                          sx={{
                            fontWeight: 600,
                            color: '#050505',
                            mb: 2,
                            fontSize: '0.875rem'
                          }}
                        >
                          {group}
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                          {perms.map((permission) => (
                            <FormControlLabel
                              key={permission.key}
                              control={
                                <Checkbox
                                  checked={permissions.includes(permission.key)}
                                  onChange={() => togglePermission(permission.key)}
                                  sx={{
                                    color: '#1877F2',
                                    '&.Mui-checked': {
                                      color: '#1877F2'
                                    },
                                    '& .MuiSvgIcon-root': {
                                      fontSize: 20
                                    }
                                  }}
                                />
                              }
                              label={
                                <Typography
                                  variant='body2'
                                  sx={{
                                    color: '#65676B',
                                    fontSize: '0.875rem'
                                  }}
                                >
                                  {permission.label}
                                </Typography>
                              }
                              sx={{
                                margin: 0,
                                '& .MuiFormControlLabel-label': {
                                  marginLeft: 1
                                }
                              }}
                            />
                          ))}
                        </Box>
                      </Box>
                    ))
                  )}
                </Box>
              </Box>
            </Box>
          </Box>
        </DialogContent>
        
        {/* Footer com botões */}
        <Box sx={{ 
          p: 3, 
          borderTop: '1px solid #DADDE1',
          display: 'flex',
          justifyContent: 'flex-end',
          gap: 2
        }}>
          <Button
            onClick={handleCloseModals}
            sx={{
              px: 3,
              py: 1,
              fontSize: '0.875rem',
              fontWeight: 600,
              color: '#65676B',
              textTransform: 'none',
              backgroundColor: '#e5e7eb',
              borderRadius: 2,
              transition: 'all 0.2s ease-in-out',
              '&:hover': {
                backgroundColor: '#d1d5db',
                color: '#374151'
              }
            }}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleUpdateRole}
            variant='contained'
            disabled={loading || !roleName.trim()}
            sx={{
              px: 3,
              py: 1,
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
                backgroundColor: '#d1d5db',
                color: '#9ca3af',
                boxShadow: 'none'
              }
            }}
          >
            Salvar Alterações
          </Button>
        </Box>
      </Dialog>

      <Dialog
        open={deleteConfirmOpen}
        onClose={handleCloseModals}
        fullWidth
        maxWidth='sm'
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
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            textAlign: 'center', 
            mb: 3 
          }}>
            <Box sx={{
              backgroundColor: '#fef2f2',
              borderRadius: '50%',
              p: 1.5,
              mb: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <DeleteIcon sx={{
                fontSize: 32,
                color: '#DC2626'
              }} />
            </Box>
            <Typography
              variant='h5'
              sx={{
                fontWeight: 700,
                color: '#1F2937',
                fontSize: '1.5rem'
              }}
            >
              Confirmar Exclusão da Role
            </Typography>
          </Box>

          {deleteImpact && (
            <>
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
                Tem certeza que deseja excluir a role <strong style={{ color: '#1F2937' }}>{deleteImpact.roleName}</strong>?
              </Typography>

              {/* Detalhes da role */}
              <Box sx={{ 
                backgroundColor: '#f9fafb',
                borderRadius: 2,
                p: 2,
                mb: 3
              }}>
                <Typography
                  variant='body2'
                  sx={{
                    fontWeight: 600,
                    color: '#1F2937',
                    mb: 1,
                    fontSize: '0.875rem'
                  }}
                >
                  Detalhes da role:
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                  <Typography variant='body2' sx={{ fontSize: '0.875rem' }}>
                    <strong style={{ fontWeight: 500 }}>Role:</strong> {deleteImpact.roleName}
                  </Typography>
                  <Typography variant='body2' sx={{ fontSize: '0.875rem' }}>
                    <strong style={{ fontWeight: 500 }}>Usuários afetados:</strong> {deleteImpact.affectedUsers}
                  </Typography>
                </Box>
              </Box>

              {/* Alert de impacto */}
              <Box sx={{
                display: 'flex',
                alignItems: 'flex-start',
                p: 2,
                borderRadius: 2,
                backgroundColor: deleteImpact.canDelete ? '#FEF3C7' : '#FEF2F2',
                border: `1px solid ${deleteImpact.canDelete ? '#FCD34D' : '#FECACA'}`,
                mb: 3
              }}>
                <WarningIcon sx={{
                  color: deleteImpact.canDelete ? '#92400E' : '#DC2626',
                  fontSize: 20,
                  mr: 1.5,
                  mt: 0.25
                }} />
                <Typography
                  variant='body2'
                  sx={{
                    color: deleteImpact.canDelete ? '#92400E' : '#DC2626',
                    fontSize: '0.875rem',
                    lineHeight: 1.5
                  }}
                >
                  {deleteImpact.message}
                </Typography>
              </Box>

              {/* Alert adicional para usuários afetados */}
              {deleteImpact.affectedUsers > 0 && (
                <Box sx={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  p: 2,
                  borderRadius: 2,
                  backgroundColor: '#EFF6FF',
                  border: '1px solid #BFDBFE',
                  mb: 3
                }}>
                  <WarningIcon sx={{
                    color: '#1877F2',
                    fontSize: 20,
                    mr: 1.5,
                    mt: 0.25
                  }} />
                  <Typography
                    variant='body2'
                    sx={{
                      color: '#1E40AF',
                      fontSize: '0.875rem',
                      lineHeight: 1.5
                    }}
                  >
                    Os usuários que possuem esta role terão suas permissões removidas.
                  </Typography>
                </Box>
              )}
            </>
          )}

          {/* Botões de ação */}
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'flex-end', 
            gap: 2 
          }}>
            <Button
              onClick={handleCloseModals}
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
              disabled={loading || !deleteImpact?.canDelete}
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
              {loading ? 'Excluindo...' : 'Confirmar Exclusão'}
            </Button>
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export { RolesSection };
