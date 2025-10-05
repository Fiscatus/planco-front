import { Add as AddIcon, Edit as EditIcon, GroupAdd as GroupAddIcon, MoreHoriz as MoreHorizIcon, Refresh as RefreshIcon, Search as SearchIcon } from '@mui/icons-material';
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
  Grid,
  IconButton,
  InputAdornment,
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
  TableRow,
  TextField,
  Typography
} from '@mui/material';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useDepartments, useUsers } from '@/hooks';

import type { User } from '@/globals/types';
import { useNotification } from '@/components';

type LocalDepartment = {
  _id: string;
  department_name: string;
  description?: string;
  org: string;
};

const GerenciaSection = () => {
  const { showNotification } = useNotification();
  const { departments, loading, error, fetchDepartments, clearError } = useDepartments();
  const { users, fetchUsers, updateUserDepartments } = useUsers();

  const [search, setSearch] = useState('');
  const [membersDialogOpen, setMembersDialogOpen] = useState(false);
  const [selectedDept, setSelectedDept] = useState<LocalDepartment | null>(null);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [savingMembers, setSavingMembers] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);

  useEffect(() => {
    fetchDepartments();
    // Load first page of users for membership management
    fetchUsers({ page: 1, limit: 100 });
  }, [fetchDepartments, fetchUsers]);

  const filteredDepartments = useMemo(() => {
    const term = search.trim().toLowerCase();
    // Mock mode if API ainda não retorna dados
    const mockDepartments: LocalDepartment[] = [
      { _id: 'dpt-1', department_name: 'Gerência de Projetos', description: 'Coordena iniciativas estratégicas', org: 'mock-org' },
      { _id: 'dpt-2', department_name: 'Gerência de TI', description: 'Infraestrutura e sistemas', org: 'mock-org' },
      { _id: 'dpt-3', department_name: 'Gerência Financeira', description: 'Orçamento e controle', org: 'mock-org' }
    ];
    const base = (departments as LocalDepartment[]).length > 0 ? (departments as LocalDepartment[]) : mockDepartments;
    if (!term) return base;
    return base.filter((d) =>
      [d.department_name, d.description].some((v) => (v || '').toLowerCase().includes(term))
    );
  }, [departments, search]);

  const handleRefresh = useCallback(() => {
    fetchDepartments();
  }, [fetchDepartments]);

  const openMembersDialog = useCallback((dept: LocalDepartment) => {
    setSelectedDept(dept);
    // preselect current members
    const mockUsers: User[] = [
      {
        _id: 'u-1',
        firstName: 'Ana',
        lastName: 'Silva',
        email: 'ana.silva@org.gov.br',
        departments: [{ _id: 'dpt-1', department_name: 'Gerência de Projetos' }]
      } as User,
      {
        _id: 'u-2',
        firstName: 'Bruno',
        lastName: 'Souza',
        email: 'bruno.souza@org.gov.br',
        departments: [{ _id: 'dpt-2', department_name: 'Gerência de TI' }]
      } as User,
      {
        _id: 'u-3',
        firstName: 'Clara',
        lastName: 'Oliveira',
        email: 'clara.oliveira@org.gov.br',
        departments: []
      } as User
    ];
    const effectiveUsers = users.length > 0 ? users : mockUsers;
    const currentMembers = effectiveUsers
      .filter((u) => (u.departments || []).some((d) => d._id === dept._id))
      .map((u) => u._id!)
      .filter(Boolean) as string[];
    setSelectedUserIds(currentMembers);
    setMembersDialogOpen(true);
  }, [users]);

  const toggleUserSelection = useCallback((userId: string) => {
    setSelectedUserIds((prev) => (prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]));
  }, []);

  const handleSaveMembers = useCallback(async () => {
    if (!selectedDept) return;
    try {
      setSavingMembers(true);
      // For each user, if should be a member, ensure dept is included; otherwise, remove it
      const tasks: Array<Promise<unknown>> = [];
      users.forEach((u) => {
        if (!u._id) return;
        const hasDept = (u.departments || []).some((d) => d._id === selectedDept._id);
        const shouldHave = selectedUserIds.includes(u._id);
        if (hasDept === shouldHave) return;
        const currentIds = (u.departments || []).map((d) => d._id);
        const nextIds = shouldHave
          ? Array.from(new Set([...currentIds, selectedDept._id]))
          : currentIds.filter((id) => id !== selectedDept._id);
        tasks.push(updateUserDepartments(u._id, nextIds));
      });
      await Promise.all(tasks);
      showNotification('Membros atualizados com sucesso!', 'success');
      setMembersDialogOpen(false);
      setSelectedDept(null);
    } catch (err) {
      showNotification('Erro ao atualizar membros', 'error');
    } finally {
      setSavingMembers(false);
    }
  }, [selectedDept, selectedUserIds, updateUserDepartments, users, showNotification]);

  // Helper
  const getSigla = (name: string): string => {
    const words = name.split(' ').filter(Boolean);
    if (words.length === 1) return words[0].slice(0, 3).toUpperCase();
    return words
      .slice(0, 3)
      .map((w) => w[0])
      .join('')
      .toUpperCase();
  };

  const effectiveUsersForCounts: User[] = users.length > 0
    ? users
    : [
        { _id: 'u-1', firstName: 'Ana', lastName: 'Silva', email: 'ana.silva@org.gov.br', departments: [{ _id: 'dpt-1', department_name: 'Gerência de Projetos' }] } as User,
        { _id: 'u-2', firstName: 'Bruno', lastName: 'Souza', email: 'bruno.souza@org.gov.br', departments: [{ _id: 'dpt-2', department_name: 'Gerência de TI' }] } as User,
        { _id: 'u-3', firstName: 'Clara', lastName: 'Oliveira', email: 'clara.oliveira@org.gov.br', departments: [] } as User
      ];

  const selected = selectedDept || filteredDepartments[0] || null;

  const membersOfSelected = useMemo(() => {
    if (!selected) return [] as User[];
    return effectiveUsersForCounts.filter((u) => (u.departments || []).some((d) => d._id === selected._id));
  }, [selected, effectiveUsersForCounts]);

  return (
    <Box>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card>
            <CardHeader
              title={<Typography variant='h6'>Gerências</Typography>}
              subheader={`${filteredDepartments.length} unidades`}
              action={
                <Stack direction='row' spacing={1}>
                  <Button startIcon={<RefreshIcon />} onClick={handleRefresh} disabled={loading} variant='outlined' size='small'>Atualizar</Button>
                  <Button startIcon={<AddIcon />} variant='contained' size='small' sx={{ textTransform: 'none' }} disabled title='Em breve'>Nova Gerência</Button>
                </Stack>
              }
            />
            <CardContent>
              {error && (
                <Alert severity='error' sx={{ mb: 2 }} onClose={clearError}>
                  {error}
                </Alert>
              )}
              <TextField
                fullWidth
                placeholder='Buscar gerência...'
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                InputProps={{ startAdornment: (<InputAdornment position='start'><SearchIcon /></InputAdornment>) }}
                sx={{ mb: 2 }}
              />

              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}><CircularProgress /></Box>
              ) : (
                <List disablePadding>
                  {filteredDepartments.map((dept) => {
                    const memberCount = effectiveUsersForCounts.filter((u) => (u.departments || []).some((d) => d._id === dept._id)).length;
                    const isSelected = selected?. _id === dept._id;
                    return (
                      <ListItem key={dept._id} disableGutters sx={{ mb: 1 }} secondaryAction={
                        <IconButton size='small' disabled>
                          <MoreHorizIcon />
                        </IconButton>
                      }>
                        <ListItemButton selected={isSelected} onClick={() => setSelectedDept(dept)} sx={{ borderRadius: 1 }}>
                          <ListItemText
                            primary={
                              <Stack direction='row' spacing={1} alignItems='center'>
                                <Typography variant='body1' fontWeight={600}>{dept.department_name}</Typography>
                                <Chip size='small' label={getSigla(dept.department_name)} variant='outlined' />
                                <Chip size='small' label='Ativa' color='success' variant='outlined' />
                              </Stack>
                            }
                          />
                          {memberCount > 0 && <Chip size='small' label={`${memberCount}`} />}
                        </ListItemButton>
                      </ListItem>
                    );
                  })}
                  {filteredDepartments.length === 0 && (
                    <Typography variant='body2' color='text.secondary'>Nenhuma gerência encontrada</Typography>
                  )}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 8 }}>
          <Stack spacing={2}>
            <Card>
              <CardHeader
                title={
                  <Stack direction='row' spacing={1} alignItems='center'>
                    <Typography variant='h6'>{selected ? selected.department_name : 'Gerência selecionada'}</Typography>
                    {selected && <Chip size='small' label={getSigla(selected.department_name)} variant='outlined' />}
                  </Stack>
                }
                subheader={selected ? 'Gerência selecionada' : 'Selecione uma gerência à esquerda'}
                action={
                  <Stack direction='row' spacing={1}>
                    <Button variant='outlined' size='small' startIcon={<EditIcon />} disabled>Editar</Button>
                    <Button variant='outlined' size='small' color='inherit' disabled>Excluir</Button>
                  </Stack>
                }
              />
              <CardContent>
                {selected ? (
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <Typography variant='subtitle2' color='text.secondary'>Responsável</Typography>
                      <Typography variant='body2'>—</Typography>
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <Typography variant='subtitle2' color='text.secondary'>E-mail do Departamento</Typography>
                      <Typography variant='body2'>—</Typography>
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <Typography variant='subtitle2' color='text.secondary'>E-mail do dono</Typography>
                      <Typography variant='body2'>—</Typography>
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <Typography variant='subtitle2' color='text.secondary'>Telefone</Typography>
                      <Typography variant='body2'>—</Typography>
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <Typography variant='subtitle2' color='text.secondary'>Organização</Typography>
                      <Typography variant='body2'>{selected.org || '—'}</Typography>
                    </Grid>
                    <Grid size={{ xs: 12 }}>
                      <Typography variant='subtitle2' color='text.secondary'>Unidade Pai</Typography>
                      <Typography variant='body2'>Raiz</Typography>
                    </Grid>
                    {selected.description && (
                      <Grid size={{ xs: 12 }}>
                        <Typography variant='subtitle2' color='text.secondary'>Descrição</Typography>
                        <Typography variant='body2'>{selected.description}</Typography>
                      </Grid>
                    )}
                  </Grid>
                ) : (
                  <Typography variant='body2' color='text.secondary'>Nenhuma gerência selecionada</Typography>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader
                title={<Typography variant='h6'>Membros</Typography>}
                subheader='Usuários associados à gerência'
                action={
                  <Button startIcon={<GroupAddIcon />} onClick={() => selected && openMembersDialog(selected)} variant='contained' disabled={!selected}>Adicionar Membro</Button>
                }
              />
              <CardContent>
                {!selected ? (
                  <Typography variant='body2' color='text.secondary'>Selecione uma gerência para ver os membros</Typography>
                ) : membersOfSelected.length === 0 ? (
                  <Typography variant='body2' color='text.secondary'>Nenhum membro. Clique em "Adicionar Membro".</Typography>
                ) : (
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Usuário</TableCell>
                          <TableCell>E-mail</TableCell>
                          <TableCell>Função</TableCell>
                          <TableCell>Desde</TableCell>
                          <TableCell>Até</TableCell>
                          <TableCell>Ações</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {membersOfSelected.map((u) => (
                          <TableRow key={u._id}>
                            <TableCell>{u.firstName} {u.lastName}</TableCell>
                            <TableCell>{u.email}</TableCell>
                            <TableCell className='capitalize'>membro</TableCell>
                            <TableCell>—</TableCell>
                            <TableCell>—</TableCell>
                            <TableCell>
                              <Stack direction='row' spacing={1}>
                                <Button size='small' variant='outlined' onClick={() => { setEditingUserId(u._id || null); openMembersDialog(selected); }}>Editar</Button>
                                <Button size='small' variant='outlined' onClick={async () => {
                                  if (!u._id || !selected) return;
                                  try {
                                    const currentIds = (u.departments || []).map((d) => d._id);
                                    const nextIds = currentIds.filter((id) => id !== selected._id);
                                    await updateUserDepartments(u._id, nextIds);
                                    showNotification('Membro removido', 'success');
                                  } catch {
                                    showNotification('Erro ao remover membro', 'error');
                                  }
                                }}>Remover</Button>
                              </Stack>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </CardContent>
            </Card>
          </Stack>
        </Grid>
      </Grid>

    <Dialog
      open={membersDialogOpen}
      onClose={() => setMembersDialogOpen(false)}
      fullWidth
      maxWidth='sm'
    >
      <DialogTitle>Gerenciar membros {selectedDept ? `- ${selectedDept.department_name}` : ''}</DialogTitle>
      <DialogContent>
        {(users.length === 0) && (
          <Alert severity='info' sx={{ mb: 2 }}>
            Modo demonstração: dados mockados. Alterações não serão persistidas.
          </Alert>
        )}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, pt: 1 }}>
          {(users.length > 0 ? users : [
            { _id: 'u-1', firstName: 'Ana', lastName: 'Silva', email: 'ana.silva@org.gov.br' } as User,
            { _id: 'u-2', firstName: 'Bruno', lastName: 'Souza', email: 'bruno.souza@org.gov.br' } as User,
            { _id: 'u-3', firstName: 'Clara', lastName: 'Oliveira', email: 'clara.oliveira@org.gov.br' } as User
          ]).map((u) => (
              <Box
                key={u._id || `${u.email}`}
                sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid', borderColor: 'divider', borderRadius: 1, p: 1 }}
              >
                <Box sx={{ minWidth: 0 }}>
                  <Typography variant='body2' fontWeight={600} noWrap>
                    {u.firstName} {u.lastName}
                  </Typography>
                  <Typography variant='caption' color='text.secondary' noWrap>
                    {u.email}
                  </Typography>
                </Box>
                <Box>
                  <Button
                    size='small'
                    variant={selectedUserIds.includes(u._id || '') ? 'contained' : 'outlined'}
                    onClick={() => u._id && toggleUserSelection(u._id)}
                  >
                    {selectedUserIds.includes(u._id || '') ? 'Remover' : 'Adicionar'}
                  </Button>
                </Box>
              </Box>
            ))}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setMembersDialogOpen(false)} variant='outlined'>Cancelar</Button>
        <Button onClick={handleSaveMembers} variant='contained' disabled={savingMembers || !selectedDept || users.length === 0}>
          {savingMembers ? 'Salvando...' : 'Salvar'}
        </Button>
      </DialogActions>
    </Dialog>
    </Box>
  );
};

export { GerenciaSection };
