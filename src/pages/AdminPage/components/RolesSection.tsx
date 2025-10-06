import { Add as AddIcon, Delete as DeleteIcon, Edit as EditIcon, Refresh as RefreshIcon } from '@mui/icons-material';
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
  IconButton,
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
    <Box>
      <Card>
        <CardHeader
          title={<Typography variant='h6'>Roles e Permissões</Typography>}
          subheader='Gerencie as roles e suas permissões'
          action={
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                startIcon={<RefreshIcon />}
                onClick={handleRefresh}
                disabled={loading}
                variant='outlined'
                size='small'
                sx={{ textTransform: 'none' }}
              >
                Atualizar
              </Button>
              <Button
                startIcon={<AddIcon />}
                onClick={handleOpenCreate}
                variant='contained'
                sx={{ textTransform: 'none' }}
              >
                Nova Role
              </Button>
            </Box>
          }
        />
        <CardContent>
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

          {loading ? (
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                py: 4
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  py: 4
                }}
              >
                <CircularProgress />
                <Typography
                  variant='body2'
                  component='span'
                  sx={{ mt: 1 }}
                >
                  Carregando roles...
                </Typography>
              </Box>
            </Box>
          ) : roles.length === 0 ? (
            <Box
              sx={{
                border: '1px solid #e5e7eb',
                borderRadius: 1,
                p: 4,
                textAlign: 'center'
              }}
            >
              <Typography color='text.secondary'>Nenhuma role encontrada</Typography>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {roles.map((role) => (
                <Card
                  key={role._id}
                  variant='outlined'
                >
                  <CardContent>
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start'
                      }}
                    >
                      <Box sx={{ flex: 1 }}>
                        <Typography
                          variant='h6'
                          sx={{ mb: 1 }}
                        >
                          {role.name}
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {role.permissions.length > 0 ? (
                            role.permissions.map((permission) => (
                              <Chip
                                key={permission}
                                label={permission}
                                size='small'
                                variant='outlined'
                                color='primary'
                              />
                            ))
                          ) : (
                            <Typography
                              variant='body2'
                              color='text.secondary'
                            >
                              Sem permissões
                            </Typography>
                          )}
                        </Box>
                      </Box>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <IconButton
                          size='small'
                          onClick={() => handleOpenEdit(role)}
                          disabled={loading}
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          size='small'
                          onClick={() => handleOpenDeleteConfirm(role)}
                          disabled={loading || role.name === 'Administrador'}
                          color='error'
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </Box>
          )}
        </CardContent>
      </Card>

      <Dialog
        open={createModalOpen}
        onClose={handleCloseModals}
        fullWidth
        maxWidth='sm'
      >
        <DialogTitle>Criar Nova Role</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label='Nome da Role'
              value={roleName}
              onChange={(e) => setRoleName(e.target.value)}
              fullWidth
              required
            />
            <Box>
              <Typography
                variant='subtitle2'
                sx={{ mb: 1, color: 'text.secondary' }}
              >
                Permissões
              </Typography>
              <Box
                sx={{
                  maxHeight: '300px',
                  overflowY: 'auto',
                  border: '1px solid #e0e0e0',
                  borderRadius: 1,
                  p: 1,
                  backgroundColor: '#fafafa'
                }}
              >
                {permissionsLoading ? (
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      py: 2
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CircularProgress size={20} />
                      <Typography
                        variant='body2'
                        component='span'
                      >
                        Carregando permissões...
                      </Typography>
                    </Box>
                  </Box>
                ) : (
                  Object.entries(groupedPermissions).map(([group, perms]) => (
                    <Box
                      key={group}
                      sx={{ mb: 1.5 }}
                    >
                      <Typography
                        variant='caption'
                        sx={{ fontWeight: 600, color: 'text.secondary' }}
                      >
                        {group}:
                      </Typography>
                      <FormGroup row>
                        {perms.map((permission) => (
                          <FormControlLabel
                            key={permission.key}
                            control={
                              <Checkbox
                                checked={permissions.includes(permission.key)}
                                onChange={() => togglePermission(permission.key)}
                              />
                            }
                            label={permission.label}
                          />
                        ))}
                      </FormGroup>
                    </Box>
                  ))
                )}
              </Box>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            variant='outlined'
            onClick={handleCloseModals}
            sx={{ textTransform: 'none' }}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleCreateRole}
            variant='contained'
            disabled={loading || !roleName.trim()}
            sx={{ textTransform: 'none' }}
          >
            Criar Role
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={editModalOpen}
        onClose={handleCloseModals}
        fullWidth
        maxWidth='sm'
      >
        <DialogTitle>Editar Role</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label='Nome da Role'
              value={roleName}
              onChange={(e) => setRoleName(e.target.value)}
              fullWidth
              required
              disabled={selectedRole?.name === 'Administrador'}
            />
            {selectedRole?.name === 'Administrador' && (
              <Alert severity='info'>O nome da role "Administrador" não pode ser alterado</Alert>
            )}
            <Box>
              <Typography
                variant='subtitle2'
                sx={{ mb: 1, color: 'text.secondary' }}
              >
                Permissões
              </Typography>
              <Box
                sx={{
                  maxHeight: '400px',
                  overflowY: 'auto',
                  border: '1px solid #e0e0e0',
                  borderRadius: 1,
                  p: 1,
                  backgroundColor: '#fafafa'
                }}
              >
                {permissionsLoading ? (
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      py: 2
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CircularProgress size={20} />
                      <Typography
                        variant='body2'
                        component='span'
                      >
                        Carregando permissões...
                      </Typography>
                    </Box>
                  </Box>
                ) : (
                  Object.entries(groupedPermissions).map(([group, perms]) => (
                    <Box
                      key={group}
                      sx={{ mb: 1.5 }}
                    >
                      <Typography
                        variant='caption'
                        sx={{ fontWeight: 600, color: 'text.secondary' }}
                      >
                        {group}:
                      </Typography>
                      <FormGroup row>
                        {perms.map((permission) => (
                          <FormControlLabel
                            key={permission.key}
                            control={
                              <Checkbox
                                checked={permissions.includes(permission.key)}
                                onChange={() => togglePermission(permission.key)}
                              />
                            }
                            label={permission.label}
                          />
                        ))}
                      </FormGroup>
                    </Box>
                  ))
                )}
              </Box>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            variant='outlined'
            onClick={handleCloseModals}
            sx={{ textTransform: 'none' }}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleUpdateRole}
            variant='contained'
            disabled={loading || !roleName.trim()}
            sx={{ textTransform: 'none' }}
          >
            Salvar Alterações
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={deleteConfirmOpen}
        onClose={handleCloseModals}
        fullWidth
        maxWidth='sm'
      >
        <DialogTitle>Confirmar Exclusão da Role</DialogTitle>
        <DialogContent>
          {deleteImpact && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
              <Alert severity={deleteImpact.canDelete ? 'warning' : 'error'}>{deleteImpact.message}</Alert>

              <Typography variant='body1'>
                <strong>Role:</strong> {deleteImpact.roleName}
              </Typography>

              <Typography variant='body1'>
                <strong>Usuários afetados:</strong> {deleteImpact.affectedUsers}
              </Typography>

              {deleteImpact.affectedUsers > 0 && (
                <Alert severity='info'>Os usuários que possuem esta role terão suas permissões removidas.</Alert>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            variant='outlined'
            onClick={handleCloseModals}
            sx={{ textTransform: 'none' }}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleConfirmDelete}
            disabled={loading || !deleteImpact?.canDelete}
            color='error'
            sx={{ textTransform: 'none' }}
          >
            Confirmar Exclusão
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export { RolesSection };
