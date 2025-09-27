import {
  Alert,
  Autocomplete,
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
  FormControlLabel,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Switch,
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
import {
  Clear as ClearIcon,
  Edit as EditIcon,
  Refresh as RefreshIcon,
  Search as SearchIcon
} from '@mui/icons-material';
import type { FilterUsersDto, User } from '@/globals/types';
import { useAuth, useDepartments, useRoles, useUsers } from '@/hooks';
import { useCallback, useEffect, useState } from 'react';

import { useNotification } from '@/components';

const UserSection = () => {
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
    <Box>
      <Card>
        <CardHeader
          title={<Typography variant='h6'>Usuários da Organização</Typography>}
          subheader='Gerencie os usuários e suas permissões'
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
                label='Buscar por nome ou email'
                placeholder='Digite o nome ou email do usuário'
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
                  startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
                }}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 2 }}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={filters.isActive === undefined ? 'todos' : filters.isActive}
                  label='Status'
                  onChange={(e) => {
                    const value = e.target.value;
                    setFilters((prev) => ({
                      ...prev,
                      isActive: value === 'todos' ? undefined : value === 'true'
                    }));
                  }}
                >
                  <MenuItem value='todos'>Todos</MenuItem>
                  <MenuItem value='true'>Ativos</MenuItem>
                  <MenuItem value='false'>Inativos</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, md: 2 }}>
              <Autocomplete
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
                    label='Role'
                    placeholder='Digite ou clique para buscar'
                    InputProps={{
                      ...params.InputProps
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
            <Grid size={{ xs: 12, md: 2 }}>
              <Autocomplete
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
                    label='Gerências'
                    placeholder='Digite ou clique para buscar'
                    InputProps={{
                      ...params.InputProps
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
                      colSpan={8}
                      align='center'
                      sx={{ py: 4 }}
                    >
                      <CircularProgress />
                      <Typography
                        variant='body2'
                        sx={{ mt: 1 }}
                      >
                        Carregando usuários...
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : users.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      align='center'
                      sx={{ py: 4 }}
                    >
                      <Typography color='text.secondary'>Nenhum usuário encontrado</Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((user) => (
                    <TableRow
                      key={user._id}
                      hover
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
                            variant='outlined'
                            color='primary'
                          />
                        ) : (
                          <Typography
                            variant='body2'
                            color='text.secondary'
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
                        <FormControlLabel
                          control={
                            <Switch
                              checked={user.isActive ?? true}
                              onChange={() => handleToggleStatus(user)}
                              disabled={loading || (currentUser?._id === user._id && user.isActive)}
                            />
                          }
                          label={user.isActive ? 'Ativo' : 'Inativo'}
                        />
                      </TableCell>
                      <TableCell align='center'>
                        <IconButton
                          size='small'
                          onClick={() => handleEditUser(user)}
                          color='primary'
                        >
                          <EditIcon />
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
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        maxWidth='sm'
        fullWidth
      >
        <DialogTitle>Editar Usuário</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <Typography
              variant='body2'
              color='text.secondary'
              sx={{ mb: 1 }}
            >
              Editando:{' '}
              <strong>
                {selectedUser?.firstName} {selectedUser?.lastName}
              </strong>
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
                  label='Role'
                  placeholder='Digite ou clique para buscar roles'
                  InputProps={{
                    ...params.InputProps
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
                  label='Gerências'
                  placeholder='Digite ou clique para buscar gerências'
                  InputProps={{
                    ...params.InputProps
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
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditModalOpen(false)}>Cancelar</Button>
          <Button
            onClick={handleSaveEdit}
            variant='contained'
            disabled={loading}
          >
            Salvar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export { UserSection };
