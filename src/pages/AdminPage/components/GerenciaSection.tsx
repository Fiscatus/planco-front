import {
  Add as AddIcon,
  Edit as EditIcon,
  GroupAdd as GroupAddIcon,
  Refresh as RefreshIcon,
  Search as SearchIcon
} from '@mui/icons-material';
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
  InputAdornment,
  InputLabel,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  MenuItem,
  Select,
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
import type { CreateDepartmentDto, Department, UpdateDepartmentDto } from '@/globals/types';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useDepartments, useUsers } from '@/hooks';

import type { User } from '@/globals/types';
import { useNotification } from '@/components';

const GerenciaSection = () => {
  const { showNotification } = useNotification();

  const {
    departments,
    loading,
    error,
    fetchDepartments,
    createDepartment,
    updateDepartment,
    deleteDepartment,
    getDepartmentMembers,
    addMembersBulk,
    removeMember,
    clearError
  } = useDepartments();
  const { users, fetchUsers } = useUsers();

  const [search, setSearch] = useState('');
  const [membersDialogOpen, setMembersDialogOpen] = useState(false);
  const [selectedDept, setSelectedDept] = useState<Department | null>(null);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [savingMembers, setSavingMembers] = useState(false);
  const [membersPagination, setMembersPagination] = useState({
    page: 0,
    limit: 5,
    total: 0
  });
  const [pagination, setPagination] = useState({
    page: 0,
    limit: 5,
    total: 0
  });

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [departmentToDelete, setDepartmentToDelete] = useState<Department | null>(null);
  const [departmentForm, setDepartmentForm] = useState<Partial<CreateDepartmentDto>>({});
  const [savingDepartment, setSavingDepartment] = useState(false);

  const [responsavelSearch, setResponsavelSearch] = useState('');
  const [responsavelUsers, setResponsavelUsers] = useState<User[]>([]);
  const [loadingResponsavel, setLoadingResponsavel] = useState(false);

  const [userSearch, setUserSearch] = useState('');
  const [userPagination, setUserPagination] = useState({ page: 0, limit: 5, total: 0 });
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    fetchDepartments(pagination.page + 1, pagination.limit, search);
    fetchUsers({ page: 1, limit: 100 });
  }, [fetchDepartments, fetchUsers, pagination.page, pagination.limit, search]);

  useEffect(() => {
    if (selectedDept?._id) {
      const loadMembers = async () => {
        try {
          await getDepartmentMembers(selectedDept._id);
        } catch (error) {
          console.error('Erro ao carregar membros:', error);
        }
      };
      loadMembers();
    }
  }, [selectedDept, getDepartmentMembers]);

  const paginatedDepartments = departments;

  const handleRefresh = useCallback(() => {
    fetchDepartments(pagination.page + 1, pagination.limit, search);
  }, [fetchDepartments, pagination.page, pagination.limit, search]);

  const openMembersDialog = useCallback((dept: Department) => {
    setSelectedDept(dept);
    setUserSearch('');
    setUserPagination({ page: 0, limit: 5, total: 0 });
    setSelectedUserIds([]);
    setAllUsers([]);
    setMembersDialogOpen(true);
  }, []);

  const toggleUserSelection = useCallback(
    (userId: string) => {
      const user = allUsers.find((u) => u._id === userId);
      if (user && (user as any).isMember) {
        showNotification('Este usuário já é membro do departamento', 'warning');
        return;
      }

      setSelectedUserIds((prev) => (prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]));
    },
    [allUsers, showNotification]
  );

  const handleSaveMembers = useCallback(async () => {
    if (!selectedDept) return;
    try {
      setSavingMembers(true);

      const response = await addMembersBulk(selectedDept._id, selectedUserIds);

      showNotification(response.message, 'success');
      setMembersDialogOpen(false);
      setSelectedDept(null);

      fetchDepartments(pagination.page + 1, pagination.limit, search);
      fetchUsers({ page: 1, limit: 100 });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao adicionar membros';
      showNotification(errorMessage, 'error');
    } finally {
      setSavingMembers(false);
    }
  }, [
    selectedDept,
    selectedUserIds,
    addMembersBulk,
    showNotification,
    fetchDepartments,
    pagination.page,
    pagination.limit,
    search,
    fetchUsers
  ]);

  const handlePageChange = useCallback((_event: unknown, newPage: number) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
  }, []);

  const handleRowsPerPageChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const newLimit = Number(event.target.value);
    setPagination((prev) => ({ ...prev, limit: newLimit, page: 0 }));
  }, []);

  const searchResponsavel = useCallback(
    async (query: string) => {
      setLoadingResponsavel(true);
      try {
        const result = await fetchUsers({ page: 1, limit: 50, name: query.trim() || undefined });
        setResponsavelUsers(result?.users || []);
      } catch (error) {
        console.error('Erro ao buscar usuários:', error);
        setResponsavelUsers([]);
      } finally {
        setLoadingResponsavel(false);
      }
    },
    [fetchUsers]
  );

  const handleOpenCreate = useCallback(async () => {
    setDepartmentForm({});
    setResponsavelSearch('');
    setResponsavelUsers([]);
    setCreateDialogOpen(true);
    await searchResponsavel('');
  }, [searchResponsavel]);

  const handleOpenEdit = useCallback(
    async (dept: Department) => {
      
      const responsavelId = typeof dept.responsavelUserId === 'string' 
        ? dept.responsavelUserId 
        : dept.responsavelUserId?._id || dept.responsavelUserId_details?._id;
      
      setDepartmentForm({
        department_name: dept.department_name,
        department_acronym: dept.department_acronym,
        deparment_email: dept.deparment_email,
        department_phone: dept.department_phone,
        email_owner: dept.email_owner,
        description: dept.description,
        responsavelUserId: responsavelId
      });
      setSelectedDept(dept);
      setResponsavelSearch('');
      setResponsavelUsers([]);
      setEditDialogOpen(true);
      await searchResponsavel('');
    },
    [searchResponsavel]
  );

  const handleOpenDelete = useCallback((dept: Department) => {
    setDepartmentToDelete(dept);
    setDeleteDialogOpen(true);
  }, []);

  const handleCloseDialogs = useCallback(() => {
    setCreateDialogOpen(false);
    setEditDialogOpen(false);
    setDeleteDialogOpen(false);
    setDepartmentToDelete(null);
    setSelectedDept(null);
    setDepartmentForm({});
    setResponsavelSearch('');
    setResponsavelUsers([]);
  }, []);

  const handleSaveDepartment = useCallback(async () => {
    if (!departmentForm.department_name || !departmentForm.deparment_email || !departmentForm.email_owner) {
      showNotification('Preencha todos os campos obrigatórios', 'error');
      return;
    }

    try {
      setSavingDepartment(true);

      if (editDialogOpen && selectedDept) {
        await updateDepartment(selectedDept._id, departmentForm as UpdateDepartmentDto);
        showNotification('Gerência atualizada com sucesso!', 'success');
      } else {
        await createDepartment(departmentForm as CreateDepartmentDto);
        showNotification('Gerência criada com sucesso!', 'success');
      }

      handleCloseDialogs();
      fetchDepartments(pagination.page + 1, pagination.limit, search);
      fetchUsers({ page: 1, limit: 100 });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao salvar gerência';
      showNotification(errorMessage, 'error');
    } finally {
      setSavingDepartment(false);
    }
  }, [
    departmentForm,
    editDialogOpen,
    selectedDept,
    updateDepartment,
    createDepartment,
    showNotification,
    handleCloseDialogs,
    fetchDepartments,
    pagination.page,
    pagination.limit,
    search
  ]);

  const handleDeleteDepartment = useCallback(async () => {
    if (!departmentToDelete) return;

    try {
      setSavingDepartment(true);
      await deleteDepartment(departmentToDelete._id);
      showNotification('Gerência excluída com sucesso!', 'success');
      handleCloseDialogs();
      fetchDepartments(pagination.page + 1, pagination.limit, search);
      fetchUsers({ page: 1, limit: 100 });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao excluir gerência';
      showNotification(errorMessage, 'error');
    } finally {
      setSavingDepartment(false);
    }
  }, [
    departmentToDelete,
    deleteDepartment,
    showNotification,
    handleCloseDialogs,
    fetchDepartments,
    pagination.page,
    pagination.limit,
    search
  ]);

  const searchUsers = useCallback(
    async (query: string, page = 1) => {
      if (!selectedDept) return;

      try {
        setLoadingUsers(true);

        await fetchUsers({
          page,
          limit: membersPagination.limit,
          name: query.trim() || undefined
        });

        const membersResponse = await getDepartmentMembers(selectedDept._id);
        const memberIds = membersResponse.map((member) => member._id);

        const usersWithMembership = users.map((user) => ({
          ...user,
          isMember: memberIds.includes(user._id)
        }));

        setAllUsers(usersWithMembership);
        setUserPagination((prev) => ({
          ...prev,
          total: users.length,
          page: page - 1
        }));
      } catch (err) {
        console.error('Erro ao buscar usuários:', err);
        showNotification('Erro ao carregar usuários', 'error');
        setAllUsers([]);
      } finally {
        setLoadingUsers(false);
      }
    },
    [selectedDept, showNotification, membersPagination.limit, fetchUsers, users, getDepartmentMembers]
  );

  const paginatedUsers = allUsers;

  const handleUserSearch = useCallback(
    (searchTerm: string) => {
      setUserSearch(searchTerm);
      setUserPagination((prev) => ({ ...prev, page: 0 }));

      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }

      const timeout = setTimeout(() => {
        if (searchTerm.trim() !== userSearch.trim()) {
          searchUsers(searchTerm, 1);
        }
      }, 300);

      setSearchTimeout(timeout);
    },
    [searchUsers, searchTimeout, userSearch]
  );

  const handleUserPageChange = useCallback(
    (_event: unknown, newPage: number) => {
      setUserPagination((prev) => ({ ...prev, page: newPage }));
      searchUsers(userSearch, newPage + 1);
    },
    [searchUsers, userSearch]
  );

  const handleMembersPageChange = useCallback((_event: unknown, newPage: number) => {
    setMembersPagination((prev) => ({ ...prev, page: newPage }));
  }, []);

  const handleMembersRowsPerPageChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const newLimit = Number.parseInt(event.target.value, 10);
    setMembersPagination((prev) => ({ ...prev, limit: newLimit, page: 0 }));
  }, []);

  useEffect(() => {
    if (membersDialogOpen && allUsers.length === 0) {
      searchUsers('', 1);
    }
  }, [membersDialogOpen, searchUsers, allUsers.length]);

  useEffect(() => {
    return () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
    };
  }, [searchTimeout]);

  const effectiveUsersForCounts: User[] = users;

  const selected = selectedDept || departments[0] || null;

  const membersOfSelected = useMemo(() => {
    if (!selected) return [] as User[];
    return effectiveUsersForCounts.filter((u) => (u.departments || []).some((d) => d._id === selected._id));
  }, [selected, effectiveUsersForCounts]);

  const paginatedMembers = useMemo(() => {
    const startIndex = membersPagination.page * membersPagination.limit;
    const endIndex = startIndex + membersPagination.limit;
    return membersOfSelected.slice(startIndex, endIndex);
  }, [membersOfSelected, membersPagination.page, membersPagination.limit]);

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
          <Grid
            container
            spacing={2}
          >
        <Grid size={{ xs: 12, md: 4 }}>
          <Card>
            <CardHeader
              title={<Typography variant='h6'>Gerências</Typography>}
              subheader={`${departments.length} unidades`}
              action={
                <Stack
                  direction='row'
                  spacing={1}
                >
                  <Button
                    startIcon={<RefreshIcon />}
                    onClick={handleRefresh}
                    disabled={loading}
                    variant='outlined'
                    size='small'
                  >
                    Atualizar
                  </Button>
                  <Button
                    startIcon={<AddIcon />}
                    variant='contained'
                    size='small'
                    sx={{ textTransform: 'none' }}
                    onClick={handleOpenCreate}
                  >
                    Nova Gerência
                  </Button>
                </Stack>
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
              <TextField
                fullWidth
                placeholder='Buscar gerência...'
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position='start'>
                      <SearchIcon />
                    </InputAdornment>
                  )
                }}
                sx={{ mb: 2 }}
              />

              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
                  <CircularProgress />
                </Box>
              ) : (
                <>
                  <List disablePadding>
                    {paginatedDepartments.map((dept) => {
                      const memberCount = effectiveUsersForCounts.filter((u) =>
                        (u.departments || []).some((d) => d._id === dept._id)
                      ).length;
                      const isSelected = selected?._id === dept._id;
                      return (
                        <ListItem
                          key={dept._id}
                          disableGutters
                          sx={{ mb: 1 }}
                        >
                          <ListItemButton
                            selected={isSelected}
                            onClick={() => setSelectedDept(dept)}
                            sx={{ borderRadius: 1 }}
                          >
                            <ListItemText
                              primary={
                                <Stack
                                  direction='row'
                                  spacing={1}
                                  alignItems='center'
                                >
                                  <Typography
                                    variant='body1'
                                    fontWeight={600}
                                  >
                                    {dept.department_name}
                                  </Typography>
                                  <Chip
                                    size='small'
                                    label={dept.department_acronym}
                                    variant='outlined'
                                  />
                                </Stack>
                              }
                            />
                            {memberCount > 0 && (
                              <Chip
                                size='small'
                                label={`${memberCount}`}
                              />
                            )}
                          </ListItemButton>
                        </ListItem>
                      );
                    })}
                    {paginatedDepartments.length === 0 && (
                      <Typography
                        variant='body2'
                        color='text.secondary'
                      >
                        Nenhuma gerência encontrada
                      </Typography>
                    )}
                  </List>

                  <TablePagination
                    component='div'
                    count={departments.length}
                    page={pagination.page}
                    onPageChange={handlePageChange}
                    rowsPerPage={pagination.limit}
                    onRowsPerPageChange={handleRowsPerPageChange}
                    rowsPerPageOptions={[5, 10, 25, 50]}
                    labelRowsPerPage='Itens por página:'
                    labelDisplayedRows={({ from, to, count }) =>
                      `${from}-${to} de ${count !== -1 ? count : `mais de ${to}`}`
                    }
                  />
                </>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 8 }}>
          <Stack spacing={2}>
            <Card>
              <CardHeader
                title={
                  <Stack
                    direction='row'
                    spacing={1}
                    alignItems='center'
                  >
                    <Typography variant='h6'>{selected ? selected.department_name : 'Gerência selecionada'}</Typography>
                    {selected && (
                      <Chip
                        size='small'
                        label={selected.department_acronym}
                        variant='outlined'
                      />
                    )}
                  </Stack>
                }
                subheader={selected ? 'Gerência selecionada' : 'Selecione uma gerência à esquerda'}
                action={
                  <Stack
                    direction='row'
                    spacing={1}
                  >
                    <Button
                      variant='outlined'
                      size='small'
                      startIcon={<EditIcon />}
                      onClick={() => selected && handleOpenEdit(selected)}
                    >
                      Editar
                    </Button>
                    <Button
                      variant='outlined'
                      size='small'
                      color='error'
                      onClick={() => selected && handleOpenDelete(selected)}
                    >
                      Excluir
                    </Button>
                  </Stack>
                }
              />
              <CardContent>
                {selected ? (
                  <Grid
                    container
                    spacing={2}
                  >
                    <Grid size={{ xs: 12, md: 6 }}>
                      <Typography
                        variant='subtitle2'
                        color='text.secondary'
                      >
                        E-mail do Departamento
                      </Typography>
                      <Typography variant='body2'>{selected.deparment_email}</Typography>
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <Typography
                        variant='subtitle2'
                        color='text.secondary'
                      >
                        Responsável gerência
                      </Typography>
                      <Typography variant='body2'>{selected.email_owner}</Typography>
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <Typography
                        variant='subtitle2'
                        color='text.secondary'
                      >
                        Telefone
                      </Typography>
                      <Typography variant='body2'>{selected.department_phone}</Typography>
                    </Grid>
                    {selected.description && (
                      <Grid size={{ xs: 12 }}>
                        <Typography
                          variant='subtitle2'
                          color='text.secondary'
                        >
                          Descrição
                        </Typography>
                        <Typography variant='body2'>{selected.description}</Typography>
                      </Grid>
                    )}
                  </Grid>
                ) : (
                  <Alert severity='info'>Nenhuma gerência selecionada</Alert>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader
                title={<Typography variant='h6'>Membros</Typography>}
                subheader='Usuários associados à gerência'
                action={
                  <Button
                    startIcon={<GroupAddIcon />}
                    onClick={() => selected && openMembersDialog(selected)}
                    variant='contained'
                    disabled={!selected}
                  >
                    Adicionar Membro
                  </Button>
                }
              />
              <CardContent>
                {!selected ? (
                  <Alert severity='info'>Selecione uma gerência para ver os membros</Alert>
                ) : membersOfSelected.length === 0 ? (
                  <Alert severity='info'>Nenhum membro. Clique em "Adicionar Membro".</Alert>
                ) : (
                  <>
                    <TableContainer>
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell>Usuário</TableCell>
                            <TableCell>E-mail</TableCell>
                            <TableCell>Função</TableCell>
                            <TableCell>Ações</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {paginatedMembers.map((u) => {
                            const isResponsavel = u.email === selected?.email_owner;
                            const isOnlyMember = membersOfSelected.length === 1;
                            const canRemove = !isResponsavel && !(isOnlyMember && isResponsavel);
                            return (
                              <TableRow key={u._id}>
                                <TableCell>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Typography variant='body2'>
                                      {u.firstName} {u.lastName}
                                    </Typography>
                                    {isResponsavel && (
                                      <Chip
                                        label='Responsável'
                                        size='small'
                                        color='primary'
                                        variant='outlined'
                                      />
                                    )}
                                  </Box>
                                </TableCell>
                                <TableCell>{u.email}</TableCell>
                                <TableCell className='capitalize'>{isResponsavel ? 'Responsável' : 'Membro'}</TableCell>
                                <TableCell>
                                  <Button
                                    size='small'
                                    variant='outlined'
                                    color='error'
                                    disabled={!canRemove}
                                    onClick={async () => {
                                      if (!u._id || !selected) return;
                                      try {
                                        await removeMember(selected._id, u._id);
                                        showNotification('Membro removido com sucesso', 'success');
                                        fetchDepartments(pagination.page + 1, pagination.limit, search);
                                        fetchUsers({ page: 1, limit: 100 });
                                      } catch {
                                        showNotification('Erro ao remover membro', 'error');
                                      }
                                    }}
                                  >
                                    Remover
                                  </Button>
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </TableContainer>

                    <TablePagination
                      component='div'
                      count={membersOfSelected.length}
                      page={membersPagination.page}
                      onPageChange={handleMembersPageChange}
                      rowsPerPage={membersPagination.limit}
                      onRowsPerPageChange={handleMembersRowsPerPageChange}
                      rowsPerPageOptions={[5, 10, 25, 50]}
                      labelRowsPerPage='Itens por página:'
                      labelDisplayedRows={({ from, to, count }) =>
                        `${from}-${to} de ${count !== -1 ? count : `mais de ${to}`}`
                      }
                    />
                  </>
                )}
              </CardContent>
            </Card>
          </Stack>
        </Grid>
      </Grid>

      <Dialog
        open={createDialogOpen || editDialogOpen}
        onClose={handleCloseDialogs}
        fullWidth
        maxWidth='md'
      >
        <DialogTitle>{editDialogOpen ? 'Editar Gerência' : 'Nova Gerência'}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 1 }}>
            <Grid
              container
              spacing={3}
            >
              <Grid size={{ xs: 12, md: 8 }}>
                <TextField
                  fullWidth
                  label='Departamento'
                  placeholder='Ex: Departamento de Projetos'
                  value={departmentForm.department_name || ''}
                  onChange={(e) => setDepartmentForm((prev) => ({ ...prev, department_name: e.target.value }))}
                  required
                  variant='outlined'
                />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <TextField
                  fullWidth
                  label='Sigla'
                  placeholder='GSP'
                  value={departmentForm.department_acronym || ''}
                  onChange={(e) =>
                    setDepartmentForm((prev) => ({ ...prev, department_acronym: e.target.value.toUpperCase() }))
                  }
                  inputProps={{ maxLength: 5 }}
                  variant='outlined'
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label='Telefone'
                  placeholder='(61) 99999-9999'
                  value={departmentForm.department_phone || ''}
                  onChange={(e) => {
                    let value = e.target.value.replace(/\D/g, '');

                    if (value.length <= 2) {
                      // do nothing
                    } else if (value.length <= 7) {
                      value = `(${value.slice(0, 2)}) ${value.slice(2)}`;
                    } else {
                      value = `(${value.slice(0, 2)}) ${value.slice(2, 7)}-${value.slice(7, 11)}`;
                    }

                    setDepartmentForm((prev) => ({ ...prev, department_phone: value }));
                  }}
                  inputProps={{
                    maxLength: 15
                  }}
                  variant='outlined'
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label='E-mail do Departamento'
                  type='email'
                  placeholder='gsp@org.gov.br'
                  value={departmentForm.deparment_email || ''}
                  onChange={(e) =>
                    setDepartmentForm((prev) => ({ ...prev, deparment_email: e.target.value.toLowerCase() }))
                  }
                  required
                  variant='outlined'
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <FormControl
                  fullWidth
                  variant='outlined'
                >
                  <InputLabel>Responsável</InputLabel>
                  <Select
                    value={
                      responsavelUsers.find((u) => u._id === departmentForm.responsavelUserId)
                        ? departmentForm.responsavelUserId || ''
                        : ''
                    }
                    label='Responsável'
                    onChange={(e) => {
                      const userId = e.target.value;
                      const selectedUser = responsavelUsers.find((u) => u._id === userId);
                      setDepartmentForm((prev) => ({
                        ...prev,
                        responsavelUserId: userId || null,
                        email_owner: selectedUser?.email || ''
                      }));
                    }}
                    MenuProps={{
                      PaperProps: {
                        style: {
                          maxHeight: 300,
                          overflow: 'auto'
                        }
                      }
                    }}
                  >
                    <MenuItem value=''>
                      <em>Nenhum</em>
                    </MenuItem>
                    {responsavelUsers.map((user) => (
                      <MenuItem
                        key={user._id}
                        value={user._id}
                      >
                        <Box>
                          <Typography
                            variant='body2'
                            fontWeight={600}
                          >
                            {user.firstName} {user.lastName}
                          </Typography>
                          <Typography
                            variant='body2'
                            color='text.secondary'
                          >
                            {user.email}
                          </Typography>
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label='E-mail do Responsável'
                  type='email'
                  placeholder='Selecione um responsável'
                  value={departmentForm.email_owner || ''}
                  InputProps={{
                    readOnly: true
                  }}
                  variant='outlined'
                  helperText='Preenchido automaticamente com o email do responsável selecionado'
                />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  label='Descrição'
                  multiline
                  rows={3}
                  placeholder='Descreva as responsabilidades e objetivos desta gerência...'
                  value={departmentForm.description || ''}
                  onChange={(e) => setDepartmentForm((prev) => ({ ...prev, description: e.target.value }))}
                  variant='outlined'
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleCloseDialogs}
            variant='outlined'
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSaveDepartment}
            variant='contained'
            disabled={savingDepartment}
          >
            {savingDepartment ? 'Salvando...' : editDialogOpen ? 'Atualizar' : 'Criar'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={deleteDialogOpen}
        onClose={handleCloseDialogs}
        fullWidth
        maxWidth='sm'
      >
        <DialogTitle>Confirmar Exclusão</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <Typography variant='body1'>
              Tem certeza que deseja excluir a gerência <strong>{departmentToDelete?.department_name}</strong>?
            </Typography>
            {departmentToDelete && (
              <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                <Typography
                  variant='body2'
                  color='text.secondary'
                  gutterBottom
                >
                  Detalhes da gerência:
                </Typography>
                <Typography variant='body2'>
                  <strong>Nome:</strong> {departmentToDelete.department_name}
                </Typography>
                <Typography variant='body2'>
                  <strong>Sigla:</strong> {departmentToDelete.department_acronym}
                </Typography>
                <Typography variant='body2'>
                  <strong>E-mail:</strong> {departmentToDelete.deparment_email}
                </Typography>
              </Box>
            )}
            <Alert severity='warning'>Esta ação não pode ser desfeita. A gerência será permanentemente removida.</Alert>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleCloseDialogs}
            variant='outlined'
          >
            Cancelar
          </Button>
          <Button
            onClick={handleDeleteDepartment}
            color='error'
            variant='contained'
          >
            {savingDepartment ? 'Excluindo...' : 'Confirmar Exclusão'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={membersDialogOpen}
        onClose={() => setMembersDialogOpen(false)}
        fullWidth
        maxWidth='md'
        PaperProps={{
          sx: {
            height: '650px',
            maxHeight: '650px'
          }
        }}
      >
        <DialogTitle>Gerenciar membros {selectedDept ? `- ${selectedDept.department_name}` : ''}</DialogTitle>
        <DialogContent sx={{ height: '100%', display: 'flex', flexDirection: 'column', p: 0 }}>
          <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
            <TextField
              fullWidth
              placeholder='Buscar usuários por nome ou email...'
              value={userSearch}
              onChange={(e) => handleUserSearch(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position='start'>
                    <SearchIcon />
                  </InputAdornment>
                )
              }}
            />
          </Box>

          <Box sx={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <TableContainer sx={{ flex: 1, overflow: 'auto' }}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell>Usuário</TableCell>
                    <TableCell>E-mail</TableCell>
                    <TableCell align='center'>Ação</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loadingUsers ? (
                    <TableRow>
                      <TableCell
                        colSpan={3}
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
                  ) : paginatedUsers.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={3}
                        align='center'
                        sx={{ py: 4 }}
                      >
                        <Typography
                          variant='body2'
                          color='text.secondary'
                        >
                          {userSearch ? 'Nenhum usuário encontrado' : 'Digite para buscar usuários'}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedUsers.map((u) => (
                      <TableRow key={u._id}>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography
                              variant='body2'
                              fontWeight={600}
                            >
                              {u.firstName} {u.lastName}
                            </Typography>
                            {(u as any).isMember && (
                              <Chip
                                label='Já é membro'
                                size='small'
                                color='success'
                                variant='outlined'
                              />
                            )}
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography
                            variant='body2'
                            color='text.secondary'
                          >
                            {u.email}
                          </Typography>
                        </TableCell>
                        <TableCell align='center'>
                          <Button
                            size='small'
                            variant={selectedUserIds.includes(u._id || '') ? 'contained' : 'outlined'}
                            onClick={() => u._id && toggleUserSelection(u._id)}
                            disabled={(u as any).isMember}
                            color={(u as any).isMember ? 'warning' : 'primary'}
                          >
                            {(u as any).isMember
                              ? 'Já é membro'
                              : selectedUserIds.includes(u._id || '')
                                ? 'Remover'
                                : 'Adicionar'}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            {!loadingUsers && userPagination.total > 0 && (
              <Box sx={{ borderTop: 1, borderColor: 'divider' }}>
                <TablePagination
                  component='div'
                  count={userPagination.total}
                  page={userPagination.page}
                  onPageChange={handleUserPageChange}
                  rowsPerPage={userPagination.limit}
                  rowsPerPageOptions={[]}
                  labelRowsPerPage='Itens por página: 5'
                  labelDisplayedRows={({ from, to, count }) =>
                    `${from}-${to} de ${count !== -1 ? count : `mais de ${to}`}`
                  }
                  showFirstButton
                  showLastButton
                />
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setMembersDialogOpen(false)}
            variant='outlined'
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSaveMembers}
            variant='contained'
            disabled={savingMembers || !selectedDept}
          >
            {savingMembers ? 'Adicionando...' : `Adicionar ${selectedUserIds.length} membro(s)`}
          </Button>
        </DialogActions>
      </Dialog>
        </CardContent>
      </Card>
    </Box>
  );
};

export { GerenciaSection };
