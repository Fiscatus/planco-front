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
  MenuItem,
  Pagination,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography
} from '@mui/material';
import type { CreateDepartmentDto, Department, UpdateDepartmentDto } from '@/globals/types';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useDebounce, useDepartments, useSearchWithDebounce, useUsers } from '@/hooks';
import { useMutation, useQuery } from '@tanstack/react-query';

import type { User } from '@/globals/types';
import { useNotification } from '@/components';
import { useSearchParams } from 'react-router-dom';

interface GerenciaSectionProps {
  currentTab: 'users' | 'gerencias' | 'invites' | 'roles';
}

const GerenciaSection = ({ currentTab }: GerenciaSectionProps) => {
  const { showNotification } = useNotification();
  const [urlParams, setUrlParams] = useSearchParams();
  const { 
    search: deptSearch,
    debouncedSearch: debouncedDeptSearch,
    handleSearchChange: handleDeptSearchChange 
  } = useSearchWithDebounce('deptSearch');
  const modalSearch = urlParams.get('modalSearch') || '';
  const debouncedModalSearch = useDebounce(modalSearch, 150);

  useEffect(() => {
    if (currentTab !== 'gerencias') {
      setUrlParams({}, { replace: true });
    }
  }, [currentTab, setUrlParams]);

  const {
    fetchDepartments,
    createDepartment,
    updateDepartment,
    deleteDepartment,
    getDepartmentMembers,
    addMembersBulk,
    removeMember
  } = useDepartments();
  const { fetchUsers } = useUsers();

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [addMembersModalOpen, setAddMembersModalOpen] = useState(false);
  const [selectedGerencia, setSelectedGerencia] = useState<Department | null>(null);
  const [loadingMembers, setLoadingMembers] = useState(false);

  const clearModalParams = useCallback(() => {
    const newParams = new URLSearchParams(urlParams);
    newParams.delete('modalSearch');
    newParams.delete('modalPage');
    newParams.delete('modalLimit');
    setUrlParams(newParams, { replace: true });
  }, [urlParams, setUrlParams]);

  const {
    data: departmentsData,
    isLoading: departmentsLoading,
    error: departmentsError,
    refetch: refetchDepartments
  } = useQuery({
    queryKey: ['fetchDepartments', 
      `page:${urlParams.get('deptPage') || 1}`,
      `limit:${urlParams.get('deptLimit') || 5}`,
      `search:${debouncedDeptSearch}`
    ],
    refetchOnWindowFocus: false,
    queryFn: async () => {
      return await fetchDepartments(
        Number(urlParams.get('deptPage') || 1),
        Number(urlParams.get('deptLimit') || 5),
        debouncedDeptSearch
      );
    }
  });

  const {
    data: usersData,
    refetch: refetchUsers
  } = useQuery({
    queryKey: ['fetchUsersForDepartments'],
    refetchOnWindowFocus: false,
    enabled: false,
    queryFn: async () => {
      return await fetchUsers({ page: 1, limit: 100 });
    }
  });

  const {
    data: departmentMembers,
    isLoading: departmentMembersLoading,
    refetch: refetchDepartmentMembers
  } = useQuery({
    queryKey: ['fetchDepartmentMembers', `deptId:${urlParams.get('selectedDept') || ''}`],
    refetchOnWindowFocus: false,
    enabled: !!urlParams.get('selectedDept'),
    queryFn: async () => {
      const selectedDeptId = urlParams.get('selectedDept');
      if (!selectedDeptId) return [];
      return await getDepartmentMembers(selectedDeptId);
    }
  });

  useEffect(() => {
    if (urlParams.get('selectedDept')) {
      setLoadingMembers(departmentMembersLoading);
    } else {
      setLoadingMembers(false);
    }
  }, [departmentMembersLoading, urlParams]);

  const {
    data: modalUsersData,
    isLoading: modalUsersLoading,
    refetch: refetchModalUsers
  } = useQuery({
    queryKey: ['fetchUsersForModal',
        `search:${debouncedModalSearch}`,
        `page:${urlParams.get('modalPage') || 1}`,
        `limit:${urlParams.get('modalLimit') || 5}`],
    refetchOnWindowFocus: false,
    enabled: addMembersModalOpen,
    queryFn: async () => {
      const page = Number(urlParams.get('modalPage') || 1);
      const limit = Number(urlParams.get('modalLimit') || 5);
      
      return await fetchUsers({
        page,
        limit,
        name: debouncedModalSearch.trim() || undefined,
        email: debouncedModalSearch.trim() || undefined
      });
    }
  });

  const {
    data: modalMembersData,
    isLoading: modalMembersLoading
  } = useQuery({
    queryKey: ['fetchDepartmentMembersForModal', `gerenciaId:${selectedGerencia?._id || ''}`],
    refetchOnWindowFocus: false,
    enabled: !!selectedGerencia && addMembersModalOpen,
    queryFn: async () => {
      if (!selectedGerencia) return [];
      return await getDepartmentMembers(selectedGerencia._id);
    }
  });

  const usersWithMembership = useMemo(() => {
    if (!modalUsersData?.users || !modalMembersData) {
      return modalUsersData?.users || [];
    }

    const memberIds = modalMembersData.map((member) => member._id);
    
    return modalUsersData.users.map((user) => ({
      ...user,
      isMember: memberIds.includes(user._id)
    }));
  }, [modalUsersData?.users, modalMembersData]);

  const { mutate: saveDepartment, isPending: savingDepartment } = useMutation({
    mutationFn: async (data: CreateDepartmentDto | UpdateDepartmentDto) => {
      
      if (selectedGerencia) {
        const getChangedFields = (newData: any, originalData: any) => {
          const changedFields: any = {};
          
          Object.keys(newData).forEach(key => {
            if (newData[key] !== undefined && newData[key] !== originalData[key]) {
              changedFields[key] = newData[key];
            }
          });
          
          return changedFields;
        };
        
        const updateData = getChangedFields(data, selectedGerencia);
        
        return await updateDepartment(selectedGerencia._id, updateData);
      } else {
        return await createDepartment(data as CreateDepartmentDto);
      }
    },
    onError: (error: any) => {
      let errorMessage = 'Erro ao salvar gerência';
      
      if (error?.response?.status === 409) {
        errorMessage = error?.response?.data?.message || 'Nome da gerência já existe ou email já está em uso';
      } else if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      showNotification(errorMessage, 'error');
    },
    onSuccess: () => {
      showNotification(
        selectedGerencia ? 'Gerência atualizada com sucesso!' : 'Gerência criada com sucesso!',
        'success'
      );
      setCreateModalOpen(false);
      setEditModalOpen(false);
      setSelectedGerencia(null);
      refetchDepartments();
      refetchUsers();
    }
  });

  const { mutate: deleteDepartmentMutation, isPending: deletingDepartment } = useMutation({
    mutationFn: async (deptId: string) => {
      return await deleteDepartment(deptId);
    },
    onError: (error) => {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao excluir gerência';
      showNotification(errorMessage, 'error');
    },
    onSuccess: () => {
      showNotification('Gerência excluída com sucesso!', 'success');
      setDeleteModalOpen(false);
      setSelectedGerencia(null);
      refetchDepartments();
      refetchUsers();
    }
  });

  const { mutate: addMembersMutation, isPending: addingMembers } = useMutation({
    mutationFn: async ({ deptId, userIds }: { deptId: string; userIds: string[] }) => {
      return await addMembersBulk(deptId, userIds);
    },
    onError: (error) => {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao adicionar membros';
      showNotification(errorMessage, 'error');
    },
    onSuccess: (response) => {
      showNotification(response.message, 'success');
      setAddMembersModalOpen(false);
      setSelectedGerencia(null);
      clearModalParams();
      refetchDepartments();
      refetchUsers();
      refetchDepartmentMembers();
    }
  });

  const { mutate: removeMemberMutation, isPending: removingMember } = useMutation({
    mutationFn: async ({ deptId, userId }: { deptId: string; userId: string }) => {
      return await removeMember(deptId, userId);
    },
    onError: () => {
      showNotification('Erro ao remover membro', 'error');
    },
    onSuccess: () => {
      showNotification('Membro removido com sucesso', 'success');
      refetchDepartments();
      refetchUsers();
      refetchDepartmentMembers();
    }
  });

  const handleRefresh = useCallback(() => {
    refetchDepartments();
  }, [refetchDepartments]);

  const handleSelectGerencia = useCallback((dept: Department) => {
    setLoadingMembers(true);
    setSelectedGerencia(dept);
    
    urlParams.set('selectedDept', dept._id);
    setUrlParams(urlParams, { replace: true });
  }, [urlParams, setUrlParams]);

  const openMembersDialog = useCallback(async (dept: Department) => {
    setSelectedGerencia(dept);
    urlParams.delete('modalSearch');
    urlParams.set('modalPage', '1');
    urlParams.set('modalLimit', '5');
    setUrlParams(urlParams, { replace: true });
    
    if (!usersData) {
      await refetchUsers();
    }
    
    setAddMembersModalOpen(true);
  }, [urlParams, setUrlParams, usersData, refetchUsers]);

  const handleDeptPageChange = useCallback((page: number) => {
    urlParams.set('deptPage', String(page));
    setUrlParams(urlParams, { replace: true });
  }, [urlParams, setUrlParams]);

  const handleDeptLimitChange = useCallback((limit: number) => {
    urlParams.set('deptLimit', String(limit));
    urlParams.set('deptPage', '1');
    setUrlParams(urlParams, { replace: true });
  }, [urlParams, setUrlParams]);

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

  const handleSaveGerencia = useCallback((data: CreateDepartmentDto | UpdateDepartmentDto) => {
    saveDepartment(data);
  }, [saveDepartment]);

  const handleDeleteGerencia = useCallback(async () => {
    if (!selectedGerencia) return;
    deleteDepartmentMutation(selectedGerencia._id);
  }, [selectedGerencia, deleteDepartmentMutation]);


  const handleSaveMembers = useCallback(({ userIds, type }: { userIds: string[]; type: 'add' | 'remove' }) => {
      if (!selectedGerencia) return;
    addMembersMutation({ deptId: selectedGerencia._id, userIds });
  }, [selectedGerencia, addMembersMutation]);


  const handleMembersPageChange = useCallback((page: number) => {
    urlParams.set('membersPage', String(page));
    setUrlParams(urlParams, { replace: true });
  }, [urlParams, setUrlParams]);

  const handleMembersLimitChange = useCallback((limit: number) => {
    urlParams.set('membersLimit', String(limit));
    urlParams.set('membersPage', '1');
    setUrlParams(urlParams, { replace: true });
  }, [urlParams, setUrlParams]);


  const handleSelectDepartment = useCallback((dept: Department) => {
    handleSelectGerencia(dept);
  }, [handleSelectGerencia]);

  const departments = (departmentsData?.departments || departmentsData || []) as Department[];
  const departmentsTotal = departmentsData?.total || departments.length;
  const departmentsTotalPages = departmentsData?.totalPages || Math.ceil(departments.length / Number(urlParams.get('deptLimit') || 5));
  const selectedDeptId = urlParams.get('selectedDept');
  const selected = departments.find((d) => d._id === selectedDeptId) || null;
  const effectiveUsersForCounts: User[] = usersData?.users || [];

  const membersOfSelected = useMemo(() => {
    if (!selected) return [] as User[];
    if (departmentMembers && departmentMembers.length > 0) {
      return departmentMembers as User[];
    }
    return effectiveUsersForCounts.filter((u) => (u.departments || []).some((d) => d._id === selected._id));
  }, [selected, departmentMembers, effectiveUsersForCounts]);

  const membersPage = Number(urlParams.get('membersPage') || 1);
  const membersLimit = Number(urlParams.get('membersLimit') || 5);

  const paginatedMembers = useMemo(() => {
    const startIndex = (membersPage - 1) * membersLimit;
    const endIndex = startIndex + membersLimit;
    return membersOfSelected.slice(startIndex, endIndex);
  }, [membersOfSelected, membersPage, membersLimit]);

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
                    disabled={departmentsLoading}
                    sx={{
                      minWidth: 'auto',
                      p: 1,
                      borderRadius: '50%',
                      color: 'white',
                      '&:hover': { bgcolor: 'grey.100', color: '#1f2937'}
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

              {departmentsError && (
                <Alert
                  severity='error'
                  sx={{ mb: 2 }}
                >
                  {departmentsError?.message || 'Erro ao carregar departamentos'}
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
                   value={deptSearch}
                   onChange={(e) => handleDeptSearchChange(e.target.value)}
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
              {departmentsLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
                  <CircularProgress />
                </Box>
              ) : (
                <>
                  <Box sx={{ overflow: 'auto', px: 1, pb: 1, maxHeight: '50vh' }}>
                    <List disablePadding>
                      {departments.map((dept) => {
                        const isSelected = selected?._id === dept._id;
                        return (
                          <ListItem
                            key={dept._id}
                            disableGutters
                            sx={{ mb: 0.5 }}
                          >
                            <ListItemButton
                              selected={isSelected}
                              onClick={() => handleSelectDepartment(dept)}
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
                            </ListItemButton>
                          </ListItem>
                        );
                      })}
                      {departments.length === 0 && (
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

                  <Box
                    sx={{
                      p: 2,
                      display: 'flex',
                      flexDirection: { xs: 'column', md: 'row' },
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: 2,
                      borderTop: '1px solid',
                      borderColor: 'divider'
                    }}
                  >
                    {/* Pagination Info */}
                    <Typography
                      variant='body2'
                      sx={{ color: '#6b7280', fontSize: '0.875rem' }}
                    >
                      {((Number(urlParams.get('deptPage') || 1) - 1) * Number(urlParams.get('deptLimit') || 5)) + 1}-
                      {Math.min(Number(urlParams.get('deptPage') || 1) * Number(urlParams.get('deptLimit') || 5), departmentsTotal)} de {departmentsTotal}
                    </Typography>

                    {/* Pagination Controls */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Select
                        value={urlParams.get('deptLimit') || 5}
                        onChange={(e) => handleDeptLimitChange(Number(e.target.value))}
                        sx={{ minWidth: 120, height: 32, fontSize: '0.875rem' }}
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
                        count={departmentsTotalPages}
                        page={Number(urlParams.get('deptPage') || 1)}
                        onChange={(_e, value) => handleDeptPageChange(value)}
                        variant='outlined'
                        shape='rounded'
                      />
                    </Box>
                  </Box>
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
                ) : loadingMembers ? (
                  <Box sx={{ p: 3, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <CircularProgress size={24} sx={{ mr: 2 }} />
                    <Typography variant='body2' color='text.secondary'>
                      Carregando membros...
                    </Typography>
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
                                    disabled={!canRemove || removingMember}
                                    onClick={() => {
                                      if (!u._id || !selected) return;
                                      removeMemberMutation({ deptId: selected._id, userId: u._id });
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
                      <Box
                        sx={{
                          p: 2,
                          display: 'flex',
                          flexDirection: { xs: 'column', md: 'row' },
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          gap: 2
                        }}
                      >
                        {/* Pagination Info */}
                        <Typography
                          variant='body2'
                          sx={{ color: '#6b7280', fontSize: '0.875rem' }}
                        >
                          {((membersPage - 1) * membersLimit) + 1}-
                          {Math.min(membersPage * membersLimit, membersOfSelected.length)} de {membersOfSelected.length}
                        </Typography>

                        {/* Pagination Controls */}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Select
                            value={membersLimit}
                            onChange={(e) => handleMembersLimitChange(Number(e.target.value))}
                            sx={{ minWidth: 120, height: 32, fontSize: '0.875rem' }}
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
                            count={Math.ceil(membersOfSelected.length / membersLimit)}
                            page={membersPage}
                            onChange={(_e, value) => handleMembersPageChange(value)}
                            variant='outlined'
                            shape='rounded'
                          />
                        </Box>
                      </Box>
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
        loading={savingDepartment}
      />

      <DeleteGerenciaModal
        open={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setSelectedGerencia(null);
        }}
        onConfirm={handleDeleteGerencia}
        gerencia={selectedGerencia}
        loading={deletingDepartment}
      />

      <AddMembersModal
        open={addMembersModalOpen}
        onClose={() => {
          setAddMembersModalOpen(false);
          setSelectedGerencia(null);
          clearModalParams();
        }}
        onSave={handleSaveMembers}
        gerencia={selectedGerencia}
        users={usersWithMembership}
        loading={modalUsersLoading || modalMembersLoading || addingMembers}
        userPagination={{
          page: Number(urlParams.get('modalPage') || 1) - 1,
          limit: Number(urlParams.get('modalLimit') || 5),
          total: modalUsersData?.total || 0
        }}
      />
    </Box>
  );
};

export { GerenciaSection };
