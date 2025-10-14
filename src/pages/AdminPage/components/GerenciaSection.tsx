import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  GroupAdd as GroupAddIcon,
  Refresh as RefreshIcon,
  Search as SearchIcon
} from '@mui/icons-material';
import { AddMembersModal, DeleteGerenciaModal, EditGerenciaModal } from '@/components/modals';
import {
  Alert,
  Box,
  Button,
  Card,
  Chip,
  CircularProgress,
  Grid,
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
  const [selectedDept, setSelectedDept] = useState<Department | null>(null);
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

  // Estados dos modais
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [addMembersModalOpen, setAddMembersModalOpen] = useState(false);
  const [selectedGerencia, setSelectedGerencia] = useState<Department | null>(null);
  const [savingGerencia, setSavingGerencia] = useState(false);

  // Estados para o modal de adicionar membros
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [userPagination, setUserPagination] = useState({ page: 0, limit: 5, total: 0 });

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
    setSelectedGerencia(dept);
    setUserPagination({ page: 0, limit: 5, total: 0 });
    setAllUsers([]);
    setAddMembersModalOpen(true);
  }, []);

  const handlePageChange = useCallback((_event: unknown, newPage: number) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
  }, []);

  const handleRowsPerPageChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const newLimit = Number(event.target.value);
    setPagination((prev) => ({ ...prev, limit: newLimit, page: 0 }));
  }, []);

  const handleOpenCreate = useCallback(() => {
    setSelectedGerencia(null);
    setCreateModalOpen(true);
  }, []);

  const handleOpenEdit = useCallback((dept: Department) => {
    setSelectedGerencia(dept);
    setEditModalOpen(true);
  }, []);

  const handleOpenDelete = useCallback((dept: Department) => {
    setSelectedGerencia(dept);
    setDeleteModalOpen(true);
  }, []);

  const handleSaveGerencia = useCallback(async (data: CreateDepartmentDto | UpdateDepartmentDto) => {
    try {
      setSavingGerencia(true);

      if (selectedGerencia) {
        await updateDepartment(selectedGerencia._id, data as UpdateDepartmentDto);
        showNotification('Gerência atualizada com sucesso!', 'success');
      } else {
        await createDepartment(data as CreateDepartmentDto);
        showNotification('Gerência criada com sucesso!', 'success');
      }

      setCreateModalOpen(false);
      setEditModalOpen(false);
      setSelectedGerencia(null);
      fetchDepartments(pagination.page + 1, pagination.limit, search);
      fetchUsers({ page: 1, limit: 100 });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao salvar gerência';
      showNotification(errorMessage, 'error');
    } finally {
      setSavingGerencia(false);
    }
  }, [
    selectedGerencia,
    updateDepartment,
    createDepartment,
    showNotification,
    fetchDepartments,
    pagination.page,
    pagination.limit,
    search,
    fetchUsers
  ]);

  const handleDeleteGerencia = useCallback(async () => {
    if (!selectedGerencia) return;

    try {
      setSavingGerencia(true);
      await deleteDepartment(selectedGerencia._id);
      showNotification('Gerência excluída com sucesso!', 'success');
      setDeleteModalOpen(false);
      setSelectedGerencia(null);
      fetchDepartments(pagination.page + 1, pagination.limit, search);
      fetchUsers({ page: 1, limit: 100 });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao excluir gerência';
      showNotification(errorMessage, 'error');
    } finally {
      setSavingGerencia(false);
    }
  }, [
    selectedGerencia,
    deleteDepartment,
    showNotification,
    fetchDepartments,
    pagination.page,
    pagination.limit,
    search,
    fetchUsers
  ]);

  const searchUsers = useCallback(
    async (query: string, page = 1) => {
      if (!selectedGerencia) return;

      try {
        setLoadingUsers(true);

        await fetchUsers({
          page,
          limit: userPagination.limit,
          name: query.trim() || undefined
        });

        const membersResponse = await getDepartmentMembers(selectedGerencia._id);
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
    [selectedGerencia, showNotification, userPagination.limit, fetchUsers, users, getDepartmentMembers]
  );

  const handleSaveMembers = useCallback(async (userIds: string[]) => {
    if (!selectedGerencia) return;

    try {
      const response = await addMembersBulk(selectedGerencia._id, userIds);
      showNotification(response.message, 'success');
      setAddMembersModalOpen(false);
      setSelectedGerencia(null);
      fetchDepartments(pagination.page + 1, pagination.limit, search);
      fetchUsers({ page: 1, limit: 100 });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao adicionar membros';
      showNotification(errorMessage, 'error');
    }
  }, [selectedGerencia, addMembersBulk, showNotification, fetchDepartments, pagination.page, pagination.limit, search, fetchUsers]);

  const handleUserPageChange = useCallback((page: number) => {
    setUserPagination((prev) => ({ ...prev, page }));
  }, []);

  const handleMembersPageChange = useCallback((_event: unknown, newPage: number) => {
    setMembersPagination((prev) => ({ ...prev, page: newPage }));
  }, []);

  const handleMembersRowsPerPageChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const newLimit = Number.parseInt(event.target.value, 10);
    setMembersPagination((prev) => ({ ...prev, limit: newLimit, page: 0 }));
  }, []);

  useEffect(() => {
    if (addMembersModalOpen && allUsers.length === 0) {
      searchUsers('', 1);
    }
  }, [addMembersModalOpen, searchUsers, allUsers.length]);

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
    <Box sx={{ minHeight: '100%', p: 3, bgcolor: 'background.default' }}>
      <Grid
        container
        spacing={3}
        sx={{ alignItems: 'flex-start' }}
      >
        {/* Coluna da esquerda - Lista de Gerências */}
        <Grid size={{ xs: 12, lg: 4 }}>
          <Card
            sx={{
              display: 'flex',
              flexDirection: 'column',
              borderRadius: 3,
              boxShadow: 1,
              border: '1px solid',
              borderColor: 'divider',
              height: 'fit-content',
              maxHeight: '80vh'
            }}
          >
            <Box sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography
                  variant='h6'
                  sx={{ fontWeight: 500, px: 1 }}
                >
                  Gerências
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
                    Nova Gerência
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
                  placeholder='Buscar gerências...'
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

            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
                  <CircularProgress />
                </Box>
              ) : (
                <>
                  <Box sx={{ overflow: 'auto', px: 1, pb: 1, maxHeight: '50vh' }}>
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
                            sx={{ mb: 0.5 }}
                          >
                            <ListItemButton
                              selected={isSelected}
                              onClick={() => setSelectedDept(dept)}
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
                                    {dept.department_name}
                                  </Typography>
                                }
                              />
                              {memberCount > 0 && (
                                <Chip
                                  size='small'
                                  label={memberCount}
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
                      {paginatedDepartments.length === 0 && (
                        <Box sx={{ p: 2, textAlign: 'center' }}>
                          <Typography
                            variant='body2'
                            color='text.secondary'
                          >
                            Nenhuma gerência encontrada
                          </Typography>
                        </Box>
                      )}
                    </List>
                  </Box>

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

        {/* Coluna da direita - Detalhes e Membros */}
        <Grid size={{ xs: 12, lg: 8 }}>
          <Stack
            spacing={3}
            sx={{ alignItems: 'stretch' }}
          >
            {/* Card de Detalhes da Gerência */}
            <Card
              sx={{
                borderRadius: 3,
                border: '1px solid',
                borderColor: 'divider',
                boxShadow: 1,
                height: 'fit-content'
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
                      {selected ? selected.department_name : 'Gerência selecionada'}
                      {selected && (
                        <Chip
                          size='small'
                          label={selected.department_acronym}
                          sx={{
                            fontSize: '0.75rem',
                            fontFamily: 'monospace',
                            bgcolor: 'grey.200',
                            color: 'text.secondary',
                            borderRadius: 1
                          }}
                        />
                      )}
                    </Typography>
                    <Typography
                      variant='body2'
                      color='text.secondary'
                    >
                      {selected ? 'Detalhes da gerência selecionada' : 'Selecione uma gerência à esquerda'}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Button
                      variant='outlined'
                      size='small'
                      startIcon={<EditIcon />}
                      onClick={() => selected && handleOpenEdit(selected)}
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
                      onClick={() => selected && handleOpenDelete(selected)}
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

                {selected ? (
                  <Grid
                    container
                    spacing={3}
                  >
                    <Grid size={{ xs: 12, md: 6 }}>
                      <Typography
                        variant='body2'
                        fontWeight={500}
                        color='text.secondary'
                        sx={{ mb: 0.5 }}
                      >
                        E-mail do departamento
                      </Typography>
                      <Typography variant='body2'>{selected.deparment_email}</Typography>
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <Typography
                        variant='body2'
                        fontWeight={500}
                        color='text.secondary'
                        sx={{ mb: 0.5 }}
                      >
                        Responsável gerência
                      </Typography>
                      <Typography variant='body2'>{selected.email_owner}</Typography>
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <Typography
                        variant='body2'
                        fontWeight={500}
                        color='text.secondary'
                        sx={{ mb: 0.5 }}
                      >
                        Telefone
                      </Typography>
                      <Typography variant='body2'>{selected.department_phone}</Typography>
                    </Grid>
                    {selected.description && (
                      <Grid size={{ xs: 12, md: 6 }}>
                        <Typography
                          variant='body2'
                          fontWeight={500}
                          color='text.secondary'
                          sx={{ mb: 0.5 }}
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
              </Box>
            </Card>

            {/* Card de Membros */}
            <Card
              sx={{
                borderRadius: 3,
                border: '1px solid',
                borderColor: 'divider',
                boxShadow: 1,
                display: 'flex',
                flexDirection: 'column',
                height: 'fit-content',
                maxHeight: '70vh'
              }}
            >
              <Box sx={{ p: 3, borderBottom: '1px solid', borderColor: 'divider' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography
                      variant='h5'
                      sx={{ fontSize: '1.25rem', fontWeight: 500, mb: 0.5 }}
                    >
                      Membros
                    </Typography>
                    <Typography
                      variant='body2'
                      color='text.secondary'
                    >
                      {membersOfSelected.length} usuário{membersOfSelected.length !== 1 ? 's' : ''} associado
                      {membersOfSelected.length !== 1 ? 's' : ''}
                    </Typography>
                  </Box>
                  <Button
                    startIcon={<GroupAddIcon />}
                    onClick={() => selected && openMembersDialog(selected)}
                    variant='contained'
                    disabled={!selected}
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
                    Adicionar Membro
                  </Button>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                {!selected ? (
                  <Box sx={{ p: 3 }}>
                    <Alert severity='info'>Selecione uma gerência para ver os membros</Alert>
                  </Box>
                ) : membersOfSelected.length === 0 ? (
                  <Box sx={{ p: 3 }}>
                    <Alert severity='info'>Nenhum membro. Clique em "Adicionar Membro".</Alert>
                  </Box>
                ) : (
                  <>
                    <TableContainer sx={{ overflow: 'auto', maxHeight: '50vh' }}>
                      <Table stickyHeader>
                        <TableHead>
                          <TableRow>
                            <TableCell sx={{ fontWeight: 500, color: 'text.secondary', py: 2 }}>Usuário</TableCell>
                            <TableCell sx={{ fontWeight: 500, color: 'text.secondary', py: 2 }}>E-mail</TableCell>
                            <TableCell sx={{ fontWeight: 500, color: 'text.secondary', py: 2 }}>Função</TableCell>
                            <TableCell
                              align='right'
                              sx={{ fontWeight: 500, color: 'text.secondary', py: 2 }}
                            >
                              Ações
                            </TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {paginatedMembers.map((u) => {
                            const isResponsavel = u.email === selected?.email_owner;
                            const isOnlyMember = membersOfSelected.length === 1;
                            const canRemove = !isResponsavel && !(isOnlyMember && isResponsavel);
                            return (
                              <TableRow
                                key={u._id}
                                sx={{ borderBottom: '1px solid', borderColor: 'divider' }}
                              >
                                <TableCell sx={{ py: 2 }}>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Typography variant='body2'>
                                      {u.firstName} {u.lastName}
                                    </Typography>
                                    {isResponsavel && (
                                      <Chip
                                        label='Responsável'
                                        size='small'
                                        sx={{
                                          fontSize: '0.75rem',
                                          fontWeight: 600,
                                          bgcolor: 'warning.main',
                                          color: 'white',
                                          borderRadius: 1
                                        }}
                                      />
                                    )}
                                  </Box>
                                </TableCell>
                                <TableCell sx={{ py: 2 }}>{u.email}</TableCell>
                                <TableCell sx={{ py: 2, textTransform: 'capitalize' }}>
                                  {isResponsavel ? 'Responsável' : 'Membro'}
                                </TableCell>
                                <TableCell
                                  align='right'
                                  sx={{ py: 2 }}
                                >
                                  <Button
                                    size='small'
                                    variant='text'
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
                                    sx={{
                                      minWidth: 'auto',
                                      p: 1,
                                      borderRadius: '50%',
                                      color: canRemove ? 'error.main' : 'text.disabled',
                                      '&:hover': {
                                        bgcolor: canRemove ? 'error.main' : 'transparent',
                                        color: canRemove ? 'white' : 'text.disabled'
                                      }
                                    }}
                                  >
                                    <DeleteIcon />
                                  </Button>
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </TableContainer>

                    <Box sx={{ borderTop: '1px solid', borderColor: 'divider' }}>
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
                        sx={{
                          '& .MuiTablePagination-toolbar': {
                            minHeight: 48,
                            px: 2
                          }
                        }}
                      />
                    </Box>
                  </>
                )}
              </Box>
            </Card>
          </Stack>
        </Grid>
      </Grid>

      {/* Modais */}
      <EditGerenciaModal
        open={createModalOpen || editModalOpen}
        onClose={() => {
          setCreateModalOpen(false);
          setEditModalOpen(false);
          setSelectedGerencia(null);
        }}
        onSave={handleSaveGerencia}
        gerencia={selectedGerencia}
        isEdit={editModalOpen}
        loading={savingGerencia}
      />

      <DeleteGerenciaModal
        open={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setSelectedGerencia(null);
        }}
        onConfirm={handleDeleteGerencia}
        gerencia={selectedGerencia}
        loading={savingGerencia}
      />

      <AddMembersModal
        open={addMembersModalOpen}
        onClose={() => {
          setAddMembersModalOpen(false);
          setSelectedGerencia(null);
        }}
        onSave={handleSaveMembers}
        gerencia={selectedGerencia}
        users={allUsers}
        loading={loadingUsers}
        onSearchUsers={searchUsers}
        userPagination={userPagination}
        onUserPageChange={handleUserPageChange}
      />
    </Box>
  );
};

export { GerenciaSection };
