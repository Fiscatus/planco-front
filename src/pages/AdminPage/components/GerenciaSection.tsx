import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  GroupAdd as GroupAddIcon,
  Refresh as RefreshIcon,
  Search as SearchIcon,
  KeyboardDoubleArrowLeft as KeyboardDoubleArrowLeftIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  KeyboardDoubleArrowRight as KeyboardDoubleArrowRightIcon
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
    <Box sx={{ height: '100%', p: 3, bgcolor: 'background.default' }}>
      <Grid container spacing={3} sx={{ height: '100%' }}>
        {/* Coluna da esquerda - Lista de Gerências */}
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

            <Box sx={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
                  <CircularProgress />
                </Box>
              ) : (
                <>
                  <Box sx={{ flex: 1, overflow: 'auto', px: 1, pb: 1 }}>
                    <List disablePadding>
                      {paginatedDepartments.map((dept) => {
                        const memberCount = effectiveUsersForCounts.filter((u) =>
                          (u.departments || []).some((d) => d._id === dept._id)
                        ).length;
                        const isSelected = selected?._id === dept._id;
                        return (
                          <ListItem key={dept._id} disableGutters sx={{ mb: 0.5 }}>
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
                          <Typography variant='body2' color='text.secondary'>
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
          <Stack spacing={3} sx={{ height: '100%' }}>
            {/* Card de Detalhes da Gerência */}
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
                    <Typography variant='body2' color='text.secondary'>
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
                  <Grid container spacing={3}>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <Typography variant='body2' fontWeight={500} color='text.secondary' sx={{ mb: 0.5 }}>
                        E-mail do departamento
                      </Typography>
                      <Typography variant='body2'>{selected.deparment_email}</Typography>
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <Typography variant='body2' fontWeight={500} color='text.secondary' sx={{ mb: 0.5 }}>
                        Responsável gerência
                      </Typography>
                      <Typography variant='body2'>{selected.email_owner}</Typography>
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <Typography variant='body2' fontWeight={500} color='text.secondary' sx={{ mb: 0.5 }}>
                        Telefone
                      </Typography>
                      <Typography variant='body2'>{selected.department_phone}</Typography>
                    </Grid>
                    {selected.description && (
                      <Grid size={{ xs: 12, md: 6 }}>
                        <Typography variant='body2' fontWeight={500} color='text.secondary' sx={{ mb: 0.5 }}>
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
                flex: 1,
                borderRadius: 3,
                border: '1px solid',
                borderColor: 'divider',
                boxShadow: 1,
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              <Box sx={{ p: 3, borderBottom: '1px solid', borderColor: 'divider' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography variant='h5' sx={{ fontSize: '1.25rem', fontWeight: 500, mb: 0.5 }}>
                      Membros
                    </Typography>
                    <Typography variant='body2' color='text.secondary'>
                      {membersOfSelected.length} usuário{membersOfSelected.length !== 1 ? 's' : ''} associado{membersOfSelected.length !== 1 ? 's' : ''}
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

              <Box sx={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
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
                    <TableContainer sx={{ flex: 1 }}>
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell sx={{ fontWeight: 500, color: 'text.secondary', py: 2 }}>
                              Usuário
                            </TableCell>
                            <TableCell sx={{ fontWeight: 500, color: 'text.secondary', py: 2 }}>
                              E-mail
                            </TableCell>
                            <TableCell sx={{ fontWeight: 500, color: 'text.secondary', py: 2 }}>
                              Função
                            </TableCell>
                            <TableCell align='right' sx={{ fontWeight: 500, color: 'text.secondary', py: 2 }}>
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
                              <TableRow key={u._id} sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>
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
                                <TableCell align='right' sx={{ py: 2 }}>
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

      <Dialog
        open={createDialogOpen || editDialogOpen}
        onClose={handleCloseDialogs}
        fullWidth
        maxWidth='md'
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            overflow: 'hidden'
          }
        }}
      >
        <DialogContent sx={{ p: 0 }}>
          {/* Header */}
          <Box sx={{ 
            p: 3, 
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <Box>
              <Typography
                variant='h5'
                sx={{
                  fontWeight: 700,
                  color: '#0f172a',
                  fontSize: '1.5rem'
                }}
              >
                {editDialogOpen ? 'Editar Gerência' : 'Nova Gerência'}
              </Typography>
              <Typography
                variant='body2'
                sx={{
                  color: '#64748b',
                  fontSize: '0.875rem',
                  mt: 0.5
                }}
              >
                {editDialogOpen ? 'Atualize os dados da gerência.' : 'Preencha os dados para criar uma nova gerência.'}
              </Typography>
            </Box>
          </Box>

          {/* Form Content */}
          <Box sx={{ p: 4 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {/* Primeira linha - Departamento e Sigla */}
              <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 8 }}>
                  <Box>
                    <Typography
                      variant='body2'
                      sx={{
                        fontWeight: 500,
                        color: '#64748b',
                        mb: 1,
                        fontSize: '0.875rem'
                      }}
                    >
                      Departamento *
                    </Typography>
                    <TextField
                      fullWidth
                      placeholder='Nome do Departamento'
                      value={departmentForm.department_name || ''}
                      onChange={(e) => setDepartmentForm((prev) => ({ ...prev, department_name: e.target.value }))}
                      required
                      variant='outlined'
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          backgroundColor: '#ffffff',
                          borderRadius: 2,
                          '& .MuiOutlinedInput-notchedOutline': {
                            border: '2px solid #e2e8f0',
                            transition: 'all 0.2s ease-in-out'
                          },
                          '&:hover .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#cbd5e1'
                          },
                          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#1877F2',
                            boxShadow: '0 0 0 3px rgba(24, 119, 242, 0.1)'
                          }
                        },
                        '& .MuiInputBase-input::placeholder': {
                          color: '#9ca3af',
                          opacity: 1
                        }
                      }}
                    />
                  </Box>
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <Box>
                    <Typography
                      variant='body2'
                      sx={{
                        fontWeight: 500,
                        color: '#64748b',
                        mb: 1,
                        fontSize: '0.875rem'
                      }}
                    >
                      Sigla
                    </Typography>
                    <TextField
                      fullWidth
                      placeholder='Ex: DFIN'
                      value={departmentForm.department_acronym || ''}
                      onChange={(e) =>
                        setDepartmentForm((prev) => ({ ...prev, department_acronym: e.target.value.toUpperCase() }))
                      }
                      inputProps={{ maxLength: 5 }}
                      variant='outlined'
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          backgroundColor: '#ffffff',
                          borderRadius: 2,
                          '& .MuiOutlinedInput-notchedOutline': {
                            border: '2px solid #e2e8f0',
                            transition: 'all 0.2s ease-in-out'
                          },
                          '&:hover .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#cbd5e1'
                          },
                          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#1877F2',
                            boxShadow: '0 0 0 3px rgba(24, 119, 242, 0.1)'
                          }
                        },
                        '& .MuiInputBase-input::placeholder': {
                          color: '#9ca3af',
                          opacity: 1
                        }
                      }}
                    />
                  </Box>
                </Grid>
              </Grid>

              {/* Segunda linha - Telefone e Email do Departamento */}
              <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Box>
                    <Typography
                      variant='body2'
                      sx={{
                        fontWeight: 500,
                        color: '#64748b',
                        mb: 1,
                        fontSize: '0.875rem'
                      }}
                    >
                      Telefone
                    </Typography>
                    <TextField
                      fullWidth
                      placeholder='(00) 00000-0000'
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
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          backgroundColor: '#ffffff',
                          borderRadius: 2,
                          '& .MuiOutlinedInput-notchedOutline': {
                            border: '2px solid #e2e8f0',
                            transition: 'all 0.2s ease-in-out'
                          },
                          '&:hover .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#cbd5e1'
                          },
                          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#1877F2',
                            boxShadow: '0 0 0 3px rgba(24, 119, 242, 0.1)'
                          }
                        },
                        '& .MuiInputBase-input::placeholder': {
                          color: '#9ca3af',
                          opacity: 1
                        }
                      }}
                    />
                  </Box>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Box>
                    <Typography
                      variant='body2'
                      sx={{
                        fontWeight: 500,
                        color: '#64748b',
                        mb: 1,
                        fontSize: '0.875rem'
                      }}
                    >
                      E-mail do Departamento *
                    </Typography>
                    <TextField
                      fullWidth
                      type='email'
                      placeholder='contato@departamento.com'
                      value={departmentForm.deparment_email || ''}
                      onChange={(e) =>
                        setDepartmentForm((prev) => ({ ...prev, deparment_email: e.target.value.toLowerCase() }))
                      }
                      required
                      variant='outlined'
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          backgroundColor: '#ffffff',
                          borderRadius: 2,
                          '& .MuiOutlinedInput-notchedOutline': {
                            border: '2px solid #e2e8f0',
                            transition: 'all 0.2s ease-in-out'
                          },
                          '&:hover .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#cbd5e1'
                          },
                          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#1877F2',
                            boxShadow: '0 0 0 3px rgba(24, 119, 242, 0.1)'
                          }
                        },
                        '& .MuiInputBase-input::placeholder': {
                          color: '#9ca3af',
                          opacity: 1
                        }
                      }}
                    />
                  </Box>
                </Grid>
              </Grid>

              {/* Terceira linha - Responsável e Email do Responsável */}
              <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Box>
                    <Typography
                      variant='body2'
                      sx={{
                        fontWeight: 500,
                        color: '#64748b',
                        mb: 1,
                        fontSize: '0.875rem'
                      }}
                    >
                      Responsável
                    </Typography>
                    <FormControl fullWidth variant='outlined'>
                      <Select
                        value={
                          responsavelUsers.find((u) => u._id === departmentForm.responsavelUserId)
                            ? departmentForm.responsavelUserId || ''
                            : ''
                        }
                        onChange={(e) => {
                          const userId = e.target.value;
                          const selectedUser = responsavelUsers.find((u) => u._id === userId);
                          setDepartmentForm((prev) => ({
                            ...prev,
                            responsavelUserId: userId || null,
                            email_owner: selectedUser?.email || ''
                          }));
                        }}
                        displayEmpty
                        sx={{
                          backgroundColor: '#ffffff',
                          borderRadius: 2,
                          '& .MuiOutlinedInput-notchedOutline': {
                            border: '2px solid #e2e8f0',
                            transition: 'all 0.2s ease-in-out'
                          },
                          '&:hover .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#cbd5e1'
                          },
                          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#1877F2',
                            boxShadow: '0 0 0 3px rgba(24, 119, 242, 0.1)'
                          },
                          '& .MuiSelect-select': {
                            color: departmentForm.responsavelUserId ? '#0f172a' : '#9ca3af'
                          }
                        }}
                        renderValue={(value) => {
                          if (!value) {
                            return <span style={{ color: '#9ca3af' }}>Selecione um responsável</span>;
                          }
                          const user = responsavelUsers.find((u) => u._id === value);
                          return user ? `${user.firstName} ${user.lastName}` : '';
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
                  </Box>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Box>
                    <Typography
                      variant='body2'
                      sx={{
                        fontWeight: 500,
                        color: '#64748b',
                        mb: 1,
                        fontSize: '0.875rem'
                      }}
                    >
                      E-mail do Responsável
                    </Typography>
                    <TextField
                      fullWidth
                      type='email'
                      placeholder='fulano@empresa.com'
                      value={departmentForm.email_owner || ''}
                      InputProps={{
                        readOnly: true
                      }}
                      variant='outlined'
                      disabled
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          backgroundColor: '#f1f5f9',
                          borderRadius: 2,
                          '& .MuiOutlinedInput-notchedOutline': {
                            border: '2px solid #e2e8f0'
                          }
                        },
                        '& .MuiInputBase-input': {
                          color: '#64748b',
                          cursor: 'not-allowed'
                        },
                        '& .MuiInputBase-input::placeholder': {
                          color: '#9ca3af',
                          opacity: 1
                        }
                      }}
                    />
                    <Typography
                      variant='caption'
                      sx={{
                        color: '#64748b',
                        fontSize: '0.75rem',
                        mt: 0.5,
                        display: 'block'
                      }}
                    >
                      Preenchido automaticamente com o e-mail do responsável.
                    </Typography>
                  </Box>
                </Grid>
              </Grid>

              {/* Descrição */}
              <Box>
                <Typography
                  variant='body2'
                  sx={{
                    fontWeight: 500,
                    color: '#64748b',
                    mb: 1,
                    fontSize: '0.875rem'
                  }}
                >
                  Descrição
                </Typography>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  placeholder='Descreva as atividades e responsabilidades da gerência...'
                  value={departmentForm.description || ''}
                  onChange={(e) => setDepartmentForm((prev) => ({ ...prev, description: e.target.value }))}
                  variant='outlined'
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: '#ffffff',
                      borderRadius: 2,
                      '& .MuiOutlinedInput-notchedOutline': {
                        border: '2px solid #e2e8f0',
                        transition: 'all 0.2s ease-in-out'
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#cbd5e1'
                      },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#1877F2',
                        boxShadow: '0 0 0 3px rgba(24, 119, 242, 0.1)'
                      }
                    },
                    '& .MuiInputBase-input::placeholder': {
                      color: '#9ca3af',
                      opacity: 1
                    }
                  }}
                />
              </Box>
            </Box>
          </Box>
        </DialogContent>
        
        {/* Footer com botões */}
        <Box sx={{ 
          p: 3, 
          backgroundColor: '#f8fafc',
          borderTop: '1px solid #e2e8f0',
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'center',
          gap: 1
        }}>
          <Button
            onClick={handleCloseDialogs}
            sx={{
              px: 3,
              py: 1.25,
              fontSize: '0.875rem',
              fontWeight: 600,
              color: '#64748b',
              textTransform: 'uppercase',
              borderRadius: 2,
              transition: 'all 0.2s ease-in-out',
              '&:hover': {
                backgroundColor: '#f1f5f9',
                color: '#0f172a'
              }
            }}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSaveDepartment}
            variant='contained'
            disabled={savingDepartment}
            sx={{
              px: 4,
              py: 1.25,
              fontSize: '0.875rem',
              fontWeight: 600,
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
                backgroundColor: '#e5e7eb',
                color: '#9ca3af',
                boxShadow: 'none'
              }
            }}
          >
            {savingDepartment ? 'Salvando...' : editDialogOpen ? 'Atualizar' : 'Criar Gerência'}
          </Button>
        </Box>
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
        maxWidth='lg'
        PaperProps={{
          sx: {
            borderRadius: 2,
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
            overflow: 'hidden',
            height: 'auto',
            maxHeight: '90vh'
          }
        }}
      >
        <DialogContent sx={{ p: 0 }}>
          {/* Header */}
          <Box sx={{ p: 4, mb: 2 }}>
            <Typography
              variant='h5'
              sx={{
                fontWeight: 700,
                color: '#1f2937',
                fontSize: '1.5rem',
                mb: 0.5
              }}
            >
              Adicionar Membro
            </Typography>
            <Typography
              variant='body2'
              sx={{
                color: '#6b7280',
                fontSize: '0.875rem'
              }}
            >
              Gerencie os membros da equipe de {selectedDept?.department_name || 'Gerência'}.
            </Typography>
          </Box>

          {/* Search Bar */}
          <Box sx={{ px: 4, mb: 3 }}>
            <Box sx={{ position: 'relative' }}>
              <SearchIcon
                sx={{
                  position: 'absolute',
                  left: 16,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#6b7280',
                  fontSize: 20,
                  zIndex: 1
                }}
              />
              <TextField
                fullWidth
                placeholder='Buscar usuários por nome ou email...'
                value={userSearch}
                onChange={(e) => handleUserSearch(e.target.value)}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    pl: 5,
                    pr: 3,
                    py: 1.5,
                    backgroundColor: '#f5f7f8',
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
                  },
                  '& .MuiInputBase-input::placeholder': {
                    color: '#6b7280',
                    opacity: 1
                  }
                }}
              />
            </Box>
          </Box>

          {/* Table Content */}
          <Box sx={{ px: 4, mb: 4 }}>
            <TableContainer sx={{ overflow: 'auto' }}>
              <Table>
                <TableHead>
                  <TableRow sx={{ borderBottom: '1px solid #e5e7eb' }}>
                    <TableCell
                      sx={{
                        fontWeight: 600,
                        color: '#6b7280',
                        fontSize: '0.875rem',
                        py: 2,
                        borderBottom: '1px solid #e5e7eb'
                      }}
                    >
                      Usuário
                    </TableCell>
                    <TableCell
                      sx={{
                        fontWeight: 600,
                        color: '#6b7280',
                        fontSize: '0.875rem',
                        py: 2,
                        borderBottom: '1px solid #e5e7eb'
                      }}
                    >
                      E-mail
                    </TableCell>
                    <TableCell
                      align='right'
                      sx={{
                        fontWeight: 600,
                        color: '#6b7280',
                        fontSize: '0.875rem',
                        py: 2,
                        borderBottom: '1px solid #e5e7eb'
                      }}
                    >
                      Ação
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loadingUsers ? (
                    <TableRow>
                      <TableCell
                        colSpan={3}
                        align='center'
                        sx={{ py: 6 }}
                      >
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                          <CircularProgress size={32} sx={{ color: '#1877F2' }} />
                          <Typography
                            variant='body2'
                            sx={{ color: '#6b7280', fontWeight: 500 }}
                          >
                            Carregando usuários...
                          </Typography>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ) : paginatedUsers.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={3}
                        align='center'
                        sx={{ py: 6 }}
                      >
                        <Typography
                          variant='body2'
                          sx={{ color: '#6b7280' }}
                        >
                          {userSearch ? 'Nenhum usuário encontrado' : 'Digite para buscar usuários'}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedUsers.map((u) => (
                      <TableRow 
                        key={u._id}
                        sx={{
                          borderBottom: '1px solid #e5e7eb',
                          '&:last-child': {
                            borderBottom: 'none'
                          }
                        }}
                      >
                        <TableCell sx={{ py: 2 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography
                              variant='body2'
                              sx={{
                                fontWeight: 500,
                                color: '#1f2937'
                              }}
                            >
                              {u.firstName} {u.lastName}
                            </Typography>
                            {(u as any).isMember && (
                              <Chip
                                label='Já é membro'
                                size='small'
                                sx={{
                                  fontSize: '0.75rem',
                                  fontWeight: 500,
                                  backgroundColor: '#dcfce7',
                                  color: '#166534',
                                  borderRadius: '9999px',
                                  height: 20,
                                  '& .MuiChip-label': {
                                    px: 1.5
                                  }
                                }}
                              />
                            )}
                          </Box>
                        </TableCell>
                        <TableCell sx={{ py: 2 }}>
                          <Typography
                            variant='body2'
                            sx={{ color: '#6b7280' }}
                          >
                            {u.email}
                          </Typography>
                        </TableCell>
                        <TableCell align='right' sx={{ py: 2 }}>
                          <Button
                            size='small'
                            variant={(u as any).isMember ? 'text' : selectedUserIds.includes(u._id || '') ? 'contained' : 'outlined'}
                            onClick={() => u._id && toggleUserSelection(u._id)}
                            disabled={(u as any).isMember}
                            sx={{
                              px: 2,
                              py: 1,
                              fontSize: '0.875rem',
                              fontWeight: 500,
                              borderRadius: 2,
                              textTransform: 'none',
                              minWidth: 100,
                              ...((u as any).isMember ? {
                                backgroundColor: '#f3f4f6',
                                color: '#6b7280',
                                cursor: 'not-allowed',
                                '&:hover': {
                                  backgroundColor: '#f3f4f6'
                                }
                              } : selectedUserIds.includes(u._id || '') ? {
                                backgroundColor: '#1877F2',
                                color: 'white',
                                '&:hover': {
                                  backgroundColor: '#166fe5'
                                }
                              } : {
                                borderColor: '#1877F2',
                                color: '#1877F2',
                                '&:hover': {
                                  backgroundColor: 'rgba(24, 119, 242, 0.04)',
                                  borderColor: '#1877F2'
                                }
                              })
                            }}
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
          </Box>

          {/* Footer */}
          <Box sx={{ 
            p: 4, 
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 2
          }}>
            {/* Pagination Info */}
            <Typography
              variant='body2'
              sx={{ color: '#6b7280', fontSize: '0.875rem' }}
            >
              {userPagination.page * userPagination.limit + 1}-{Math.min((userPagination.page + 1) * userPagination.limit, userPagination.total)} de {userPagination.total}
            </Typography>
            
            {/* Pagination Controls */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Button
                size='small'
                disabled={userPagination.page === 0}
                onClick={() => handleUserPageChange(null, 0)}
                sx={{
                  p: 1,
                  borderRadius: 2,
                  color: '#6b7280',
                  '&:hover': {
                    backgroundColor: '#f3f4f6'
                  },
                  '&:disabled': {
                    opacity: 0.5
                  }
                }}
              >
                <KeyboardDoubleArrowLeftIcon sx={{ fontSize: '1.25rem' }} />
              </Button>
              <Button
                size='small'
                disabled={userPagination.page === 0}
                onClick={() => handleUserPageChange(null, userPagination.page - 1)}
                sx={{
                  p: 1,
                  borderRadius: 2,
                  color: '#6b7280',
                  '&:hover': {
                    backgroundColor: '#f3f4f6'
                  },
                  '&:disabled': {
                    opacity: 0.5
                  }
                }}
              >
                <ChevronLeftIcon sx={{ fontSize: '1.25rem' }} />
              </Button>
              <Button
                size='small'
                disabled={(userPagination.page + 1) * userPagination.limit >= userPagination.total}
                onClick={() => handleUserPageChange(null, userPagination.page + 1)}
                sx={{
                  p: 1,
                  borderRadius: 2,
                  color: '#6b7280',
                  '&:hover': {
                    backgroundColor: '#f3f4f6'
                  },
                  '&:disabled': {
                    opacity: 0.5
                  }
                }}
              >
                <ChevronRightIcon sx={{ fontSize: '1.25rem' }} />
              </Button>
              <Button
                size='small'
                disabled={(userPagination.page + 1) * userPagination.limit >= userPagination.total}
                onClick={() => handleUserPageChange(null, Math.ceil(userPagination.total / userPagination.limit) - 1)}
                sx={{
                  p: 1,
                  borderRadius: 2,
                  color: '#6b7280',
                  '&:hover': {
                    backgroundColor: '#f3f4f6'
                  },
                  '&:disabled': {
                    opacity: 0.5
                  }
                }}
              >
                <KeyboardDoubleArrowRightIcon sx={{ fontSize: '1.25rem' }} />
              </Button>
            </Box>

            {/* Action Buttons */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Button
                onClick={() => setMembersDialogOpen(false)}
                sx={{
                  px: 3,
                  py: 1.5,
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  color: '#6b7280',
                  textTransform: 'none',
                  borderRadius: 2,
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    backgroundColor: '#f3f4f6',
                    color: '#1f2937'
                  }
                }}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleSaveMembers}
                variant='contained'
                disabled={savingMembers || !selectedDept || selectedUserIds.length === 0}
                sx={{
                  px: 3,
                  py: 1.5,
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
                {savingMembers ? 'Adicionando...' : `Adicionar ${selectedUserIds.length} membro(s)`}
              </Button>
            </Box>
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export { GerenciaSection };
