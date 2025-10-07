import { Add as AddIcon, Clear as ClearIcon, Delete as DeleteIcon, Refresh as RefreshIcon } from '@mui/icons-material';
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
    <Box>
      <Card>
        <CardHeader
          title={<Typography variant='h6'>Convites</Typography>}
          subheader='Gerencie os convites para novos usuários'
          action={
            <Button
              startIcon={<RefreshIcon />}
              onClick={handleRefresh}
              disabled={loading}
              variant='outlined'
              size='small'
            >
              Atualizar
            </Button>
          }
        />
        <CardContent>
          <Grid
            container
            spacing={2}
            sx={{ mb: 3 }}
          >
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                fullWidth
                label='Buscar por email'
                placeholder='Digite o email do convite'
                value={filters.email || ''}
                onChange={(e) => {
                  setFilters((prev) => ({
                    ...prev,
                    email: e.target.value
                  }));
                }}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 2 }}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={filters.status || 'todos'}
                  label='Status'
                  onChange={(e) => {
                    const value = e.target.value;
                    setFilters((prev) => ({
                      ...prev,
                      status: value === 'todos' ? undefined : (value as InviteStatus)
                    }));
                  }}
                >
                  <MenuItem value='todos'>Todos</MenuItem>
                  <MenuItem value='pendente'>pendente</MenuItem>
                  <MenuItem value='aceito'>aceito</MenuItem>
                  <MenuItem value='recusado'>recusado</MenuItem>
                  <MenuItem value='expirado'>expirado</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, md: 2 }}>
              <FormControl fullWidth>
                <InputLabel>Role</InputLabel>
                <Select
                  value={filters.role || ''}
                  label='Role'
                  onChange={(e) => {
                    setFilters((prev) => ({
                      ...prev,
                      role: e.target.value
                    }));
                  }}
                  onOpen={handleRolesDropdownOpen}
                  disabled={loading}
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
            <Grid size={{ xs: 12, md: 1 }}>
              <Box sx={{ display: 'flex', gap: 1, height: '100%', alignItems: 'center' }}>
                <IconButton
                  onClick={handleClearFilters}
                  disabled={loading}
                  color='secondary'
                  title='Limpar filtros'
                >
                  <ClearIcon />
                </IconButton>
              </Box>
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <Button
                startIcon={<AddIcon />}
                onClick={handleOpenCreate}
                variant='contained'
                fullWidth
                sx={{ textTransform: 'none' }}
              >
                Novo Convite
              </Button>
            </Grid>
          </Grid>

          {error && (
            <Alert
              severity='error'
              sx={{ mb: 2 }}
              onClose={clearError}
            >
              {error}
            </Alert>
          )}

          <TableContainer
            component={Paper}
            variant='outlined'
          >
            <Table>
              <TableHead>
                <TableRow>
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
                      sx={{ py: 4 }}
                    >
                      <CircularProgress />
                      <Typography
                        variant='body2'
                        sx={{ mt: 1 }}
                      >
                        Carregando convites...
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : invites.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      align='center'
                      sx={{ py: 4 }}
                    >
                      <Typography color='text.secondary'>Nenhum convite encontrado</Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  invites.map((invite) => (
                    <TableRow
                      key={invite._id}
                      hover
                    >
                      <TableCell>
                        <Typography variant='body2'>{invite.email}</Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={invite.role.name}
                          size='small'
                          variant='outlined'
                          color='primary'
                        />
                      </TableCell>
                      <TableCell>
                        {invite.departments && invite.departments.length > 0 ? (
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            {invite.departments.map((dept) => (
                              <Chip
                                key={dept._id}
                                label={dept.department_name}
                                size='small'
                                variant='outlined'
                                color='secondary'
                              />
                            ))}
                          </Box>
                        ) : (
                          <Typography
                            variant='body2'
                            color='text.secondary'
                          >
                            Sem gerências
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={getStatusText(invite.status)}
                          size='small'
                          color={getStatusColor(invite.status)}
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
                          color='error'
                          title='Excluir convite'
                        >
                          <DeleteIcon />
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
