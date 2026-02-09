import { AdminPanelSettings, Business } from '@mui/icons-material';
import { Box, Button, Card, Chip, Grid, Typography } from '@mui/material';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useCallback, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ActiveDepartmentSelector, Loading, useNotification } from '@/components';
import { AddMembersModal, EditGerenciaModal } from '@/components/modals';
import type { CreateDepartmentDto, UpdateDepartmentDto } from '@/globals/types';
import { useAccessControl, useActiveDepartment, useAuth, useDepartments, useUsers } from '@/hooks';

import { InfoSection } from './components/InfoSection';
import { MembersSection } from './components/MembersSection';

const MinhasGerencias = () => {
  const { user: currentUser } = useAuth();
  const { canAccessAdmin, isAdminOnly } = useAccessControl();
  const { showNotification } = useNotification();
  const navigate = useNavigate();
  const [urlParams, setUrlParams] = useSearchParams();

  // Context da gerência ativa
  const { activeDepartment } = useActiveDepartment();

  const { updateDepartment, getDepartmentMembers, addMembersBulk, removeMember, checkAccess, getDepartmentInfo } =
    useDepartments();

  const { users, fetchUsers } = useUsers();

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [addMembersModalOpen, setAddMembersModalOpen] = useState(false);

  const [loadingUsers, _setLoadingUsers] = useState(false);
  const [_userPagination, setUserPagination] = useState({ page: 0, limit: 5, total: 0 });
  const usersRef = useRef(users);

  const clearModalParams = useCallback(() => {
    const newParams = new URLSearchParams(urlParams);
    newParams.delete('modalSearch');
    newParams.delete('modalPage');
    newParams.delete('modalLimit');
    setUrlParams(newParams, { replace: true });
  }, [urlParams, setUrlParams]);

  const handleEditGerencia = useCallback(() => {
    setEditModalOpen(true);
  }, []);

  const { data: gerencia, refetch: refetchGerencia } = useQuery({
    enabled: !!activeDepartment?._id,
    queryKey: ['fetchGerencia', `id:${activeDepartment?._id}`],
    refetchOnWindowFocus: false,
    queryFn: async () => {
      if (!activeDepartment?._id) return null;
      const gerenciaInfo = await getDepartmentInfo(activeDepartment._id);
      return gerenciaInfo;
    }
  });

  const { data: canEdit, refetch: refetchCanEdit } = useQuery({
    enabled: !!activeDepartment?._id && !!currentUser?._id,
    queryKey: ['checkGerenciaAccess', `userId:${currentUser?._id}`, `deptId:${activeDepartment?._id}`],
    refetchOnWindowFocus: false,
    queryFn: async () => {
      if (!activeDepartment?._id || !currentUser?._id) return false;
      const accessResult = await checkAccess(currentUser._id, activeDepartment._id);
      return accessResult.hasAccess;
    }
  });

  const {
    data: membersData,
    isLoading: membersLoading,
    refetch: refetchMembers
  } = useQuery({
    enabled: !!activeDepartment?._id,
    queryKey: ['fetchDepartmentMembers', `deptId:${activeDepartment?._id}`],
    refetchOnWindowFocus: false,
    queryFn: async () => {
      if (!activeDepartment?._id) return [];
      const membersResponse = await getDepartmentMembers(activeDepartment._id);
      return membersResponse;
    }
  });

  const { data: usersData, refetch: refetchUsers } = useQuery({
    enabled: !!activeDepartment?._id && membersData !== undefined && addMembersModalOpen,
    queryKey: [
      'fetchUsers',
      `deptId:${activeDepartment?._id}`,
      `page:${urlParams.get('modalPage') || 1}`,
      `limit:${Number(urlParams.get('modalLimit') || 5)}`,
      `search:${urlParams.get('modalSearch') || ''}`
    ],
    refetchOnWindowFocus: false,
    queryFn: async () => {
      if (!activeDepartment?._id) return { users: [], total: 0 };
      const res = await fetchUsers({
        page: Number(urlParams.get('modalPage') || 1),
        limit: Number(urlParams.get('modalLimit') || 5),
        name: urlParams.get('modalSearch') || undefined
      });
      const usersWithMembership = res.users.map((user) => ({
        ...user,
        isMember: membersData?.some((member) => member._id === user._id) || false
      }));

      setUserPagination((prev) => ({
        ...prev,
        total: res.total
      }));
      usersRef.current = usersWithMembership;

      return { users: usersRef.current, total: res.total };
    }
  });

  const { mutate: editActiveDepartment, isPending: editGerenciaPending } = useMutation({
    mutationFn: async (data: CreateDepartmentDto | UpdateDepartmentDto) => {
      return await updateDepartment(activeDepartment._id, data);
    },
    onError: () => {
      showNotification('Erro ao alterar gerência ativa', 'error');
    },
    onSuccess: () => {
      showNotification(`Gerência ativa alterada`, 'success');
      refetchGerencia();
      refetchCanEdit();
      refetchMembers();
      setEditModalOpen(false);
    }
  });

  const { mutate: mutateMembers, isPending: membersPending } = useMutation({
    mutationFn: async ({ userIds, type }: { userIds: string[]; type: 'add' | 'remove' }) => {
      if (!activeDepartment) throw new Error('Gerência ativa não definida');
      if (type === 'add') {
        return await addMembersBulk(activeDepartment._id, userIds);
      } else {
        if (userIds.length !== 1) throw new Error('Para remoção, envie exatamente um ID de usuário');
        return await removeMember(activeDepartment._id, userIds[0]);
      }
    },
    onError: (_error, variables) => {
      showNotification(`Erro ao ${variables.type === 'add' ? 'adicionar' : 'remover'} membros`, 'error');
    },
    onSuccess: (_data, variables) => {
      showNotification(`Membros ${variables.type === 'add' ? 'adicionados' : 'removidos'} com sucesso`, 'success');
      refetchMembers();
      setAddMembersModalOpen(false);
      clearModalParams();
    }
  });

  const handleAddMember = useCallback(() => {
    urlParams.delete('modalSearch');
    urlParams.set('modalPage', '1');
    urlParams.set('modalLimit', '5');
    setUrlParams(urlParams, { replace: true });
    setAddMembersModalOpen(true);
  }, [urlParams, setUrlParams]);

  const handleMembersPageChange = useCallback(
    (page: number) => {
      urlParams.set('membersPage', String(page + 1));
      setUrlParams(urlParams, { replace: true });
    },
    [urlParams, setUrlParams]
  );

  const handleMembersLimitChange = useCallback(
    (limit: number) => {
      urlParams.set('membersLimit', String(limit));
      urlParams.set('membersPage', '1');
      setUrlParams(urlParams, { replace: true });
    },
    [urlParams, setUrlParams]
  );

  if (isAdminOnly) {
    return (
      <Box sx={{ minHeight: '100%', p: 3, bgcolor: 'background.default' }}>
        <Box sx={{ maxWidth: 600, mx: 'auto', mt: 8 }}>
          <Card
            sx={{
              p: 4,
              textAlign: 'center',
              borderRadius: 3,
              boxShadow: 2,
              border: '1px solid',
              borderColor: 'divider'
            }}
          >
            <Box sx={{ mb: 3 }}>
              <AdminPanelSettings
                sx={{
                  fontSize: 64,
                  color: 'primary.main',
                  mb: 2
                }}
              />
            </Box>

            <Typography
              variant='h4'
              sx={{
                fontWeight: 600,
                color: 'text.primary',
                mb: 2
              }}
            >
              Acesso Administrativo
            </Typography>

            <Typography
              variant='body1'
              sx={{
                color: 'text.secondary',
                mb: 4,
                lineHeight: 1.6
              }}
            >
              Como administrador, você tem acesso completo ao painel de administração onde pode gerenciar todas as
              gerências da organização.
            </Typography>

            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Button
                variant='contained'
                size='large'
                startIcon={<AdminPanelSettings />}
                onClick={() => navigate('/admin')}
                sx={{
                  borderRadius: 2,
                  px: 3,
                  py: 1.5,
                  textTransform: 'none',
                  fontWeight: 600,
                  boxShadow: 2
                }}
              >
                Ir para Administração
              </Button>

              <Button
                variant='outlined'
                size='large'
                startIcon={<Business />}
                onClick={() => navigate('/')}
                sx={{
                  borderRadius: 2,
                  px: 3,
                  py: 1.5,
                  textTransform: 'none',
                  fontWeight: 600
                }}
              >
                Voltar ao Início
              </Button>
            </Box>

            <Box sx={{ mt: 4, p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
              <Typography
                variant='body2'
                sx={{
                  color: 'text.secondary',
                  fontStyle: 'italic'
                }}
              >
                💡 Dica: No painel de administração você pode criar, editar e gerenciar todas as gerências, além de
                controlar usuários e permissões.
              </Typography>
            </Box>
          </Card>
        </Box>
      </Box>
    );
  }

  if (!activeDepartment) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography
          variant='h5'
          sx={{ mb: 2 }}
        >
          Minhas Gerências
        </Typography>
        <Typography color='text.secondary'>Você não está associado a nenhuma gerência no momento.</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100%', p: 3, bgcolor: 'background.default' }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography
          variant='h4'
          sx={{
            fontWeight: 700,
            color: 'text.primary',
            mb: 1
          }}
        >
          Minhas Gerências
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <Typography
            variant='body1'
            sx={{
              color: 'text.secondary',
              fontWeight: 500
            }}
          >
            Gerencie sua gerência e membros da equipe
          </Typography>
          {canEdit && (
            <Chip
              label='Responsável'
              color='primary'
              variant='filled'
              size='small'
              sx={{
                fontWeight: 600,
                fontSize: '0.75rem'
              }}
            />
          )}
        </Box>

        {/* Seletor de Gerência Ativa */}
        <Box sx={{ mb: 2 }}>
          <ActiveDepartmentSelector
            variant='full'
            showLabel={true}
          />
        </Box>
      </Box>

      {/* Conteúdo principal */}
      <Grid
        container
        spacing={3}
        sx={{ alignItems: 'flex-start' }}
      >
        {/* Seção de Informações */}
        <Grid size={{ xs: 12, lg: 6 }}>
          <InfoSection
            gerencia={gerencia}
            canEdit={canEdit}
            onEdit={handleEditGerencia}
          />
        </Grid>

        {/* Seção de Membros */}
        <Grid size={{ xs: 12, lg: 6 }}>
          {membersData ? (
            <MembersSection
              gerencia={gerencia}
              members={membersData}
              onAddMember={async () => {
                await refetchUsers();
                handleAddMember();
              }}
              onRemoveMember={mutateMembers}
              loading={membersLoading}
              canEdit={canEdit}
              membersPagination={{
                page: Number(urlParams.get('membersPage') || 1) - 1,
                limit: Number(urlParams.get('membersLimit') || 5),
                total: membersData.length
              }}
              onMembersPageChange={handleMembersPageChange}
              onMembersLimitChange={handleMembersLimitChange}
            />
          ) : (
            <Loading isLoading={true} />
          )}
        </Grid>
      </Grid>

      {/* Modais */}
      <EditGerenciaModal
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        onSave={editActiveDepartment}
        gerencia={gerencia}
        isEdit={true}
        loading={editGerenciaPending}
      />

      <AddMembersModal
        open={addMembersModalOpen}
        onClose={() => {
          setAddMembersModalOpen(false);
          clearModalParams();
        }}
        onSave={mutateMembers}
        gerencia={gerencia}
        users={usersData?.users || []}
        loading={loadingUsers}
        userPagination={{
          page: Number(urlParams.get('modalPage') || 1) - 1,
          limit: Number(urlParams.get('modalLimit') || 5),
          total: usersData?.total || 0
        }}
      />
    </Box>
  );
};

export default MinhasGerencias;
