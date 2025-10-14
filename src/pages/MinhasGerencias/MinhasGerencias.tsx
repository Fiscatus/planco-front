import { AddMembersModal, DeleteGerenciaModal, EditGerenciaModal } from '@/components/modals';
import { AdminPanelSettings, ArrowForward, Business } from '@mui/icons-material';
import { Box, Button, Card, Chip, Grid, Stack, Typography } from '@mui/material';
import type { Department, User } from '@/globals/types';
import { Loading, useNotification } from '@/components';
import { useAccessControl, useActiveDepartment, useAuth, useDepartments, useUsers } from '@/hooks';
import { useCallback, useEffect, useState } from 'react';

import { ActiveDepartmentSelector } from '@/components';
import { InfoSection } from './components/InfoSection';
import { MembersSection } from './components/MembersSection';
import { useNavigate } from 'react-router-dom';

type UserWithMembership = User & { isMember?: boolean };

const MinhasGerencias = () => {
  const { user: currentUser } = useAuth();
  const { canAccessAdmin } = useAccessControl();
  const { showNotification } = useNotification();
  const navigate = useNavigate();
  
  // Context da gerência ativa
  const { 
    activeDepartment, 
    setActiveDepartment, 
    availableDepartments,
    isLoading: activeDeptLoading 
  } = useActiveDepartment();
  
  const {
    departments,
    loading: departmentsLoading,
    error: departmentsError,
    fetchDepartments,
    updateDepartment,
    deleteDepartment,
    getDepartmentMembers,
    addMembersBulk,
    removeMember,
    checkAccess,
    getDepartmentInfo
  } = useDepartments();
  
  const { users, fetchUsers } = useUsers();

  const [members, setMembers] = useState<User[]>([]);
  const [canEditGerencia, setCanEditGerencia] = useState(false);

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [addMembersModalOpen, setAddMembersModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [savingGerencia, setSavingGerencia] = useState(false);

  const [allUsers, setAllUsers] = useState<UserWithMembership[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [userPagination, setUserPagination] = useState({ page: 0, limit: 5, total: 0 });


  useEffect(() => {
    const loadActiveDepartmentData = async () => {
      if (!activeDepartment || !currentUser?._id) {
        setMembers([]);
        setCanEditGerencia(false);
        return;
      }

      try {
        const accessResult = await checkAccess(currentUser._id, activeDepartment._id);
        setCanEditGerencia(accessResult.hasAccess);

        const membersData = await getDepartmentMembers(activeDepartment._id);
        setMembers(membersData);
      } catch (error) {
        console.error('Erro ao carregar dados da gerência:', error);
        showNotification('Erro ao carregar dados da gerência', 'error');
        setCanEditGerencia(false);
        setMembers([]);
      }
    };

    loadActiveDepartmentData();
  }, [activeDepartment, currentUser, checkAccess, getDepartmentMembers, showNotification]);

  const handleEditGerencia = useCallback(() => {
    setEditModalOpen(true);
  }, []);

  const handleSaveGerencia = useCallback(async (data: any) => {
    if (!activeDepartment) return;

    try {
      setSavingGerencia(true);
      await updateDepartment(activeDepartment._id, data);
      showNotification('Gerência atualizada com sucesso!', 'success');

      if (activeDepartment._id) {
        const updatedMembers = await getDepartmentMembers(activeDepartment._id);
        setMembers(updatedMembers);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao atualizar gerência';
      showNotification(errorMessage, 'error');
    } finally {
      setSavingGerencia(false);
    }
  }, [activeDepartment, updateDepartment, showNotification, getDepartmentMembers]);

  const handleAddMember = useCallback(() => {
    setAddMembersModalOpen(true);
  }, []);

  const searchUsers = useCallback(
    async (query: string, page = 1) => {
      if (!activeDepartment) return;

      try {
        setLoadingUsers(true);

        await fetchUsers({
          page,
          limit: userPagination.limit,
          name: query.trim() || undefined
        });

        const membersResponse = await getDepartmentMembers(activeDepartment._id);
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
    [activeDepartment, showNotification, userPagination.limit, fetchUsers, users, getDepartmentMembers]
  );

  const handleSaveMembers = useCallback(async (userIds: string[]) => {
    if (!activeDepartment) return;

    try {
      const response = await addMembersBulk(activeDepartment._id, userIds);
      showNotification(response.message, 'success');

      const updatedMembers = await getDepartmentMembers(activeDepartment._id);
      setMembers(updatedMembers);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao adicionar membros';
      showNotification(errorMessage, 'error');
    }
  }, [activeDepartment, addMembersBulk, showNotification, getDepartmentMembers]);

  const handleUserPageChange = useCallback((page: number) => {
    setUserPagination((prev) => ({ ...prev, page }));
  }, []);

  const handleRemoveMember = useCallback(async (userId: string) => {
    if (!activeDepartment) return;

    try {
      await removeMember(activeDepartment._id, userId);
      showNotification('Membro removido com sucesso', 'success');

      const updatedMembers = await getDepartmentMembers(activeDepartment._id);
      setMembers(updatedMembers);
    } catch (error) {
      showNotification('Erro ao remover membro', 'error');
    }
  }, [activeDepartment, removeMember, showNotification, getDepartmentMembers]);

  const handleDeleteGerencia = useCallback(() => {
    setDeleteModalOpen(true);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (!activeDepartment) return;

    try {
      setSavingGerencia(true);
      await deleteDepartment(activeDepartment._id);
      showNotification('Gerência excluída com sucesso!', 'success');
      setActiveDepartment(null);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao excluir gerência';
      showNotification(errorMessage, 'error');
    } finally {
      setSavingGerencia(false);
    }
  }, [activeDepartment, deleteDepartment, showNotification, setActiveDepartment]);

  if (departmentsLoading) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Loading isLoading={true} />
      </Box>
    );
  }

  if (canAccessAdmin) {
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
              variant="h4"
              sx={{
                fontWeight: 600,
                color: 'text.primary',
                mb: 2
              }}
            >
              Acesso Administrativo
            </Typography>
            
            <Typography
              variant="body1"
              sx={{
                color: 'text.secondary',
                mb: 4,
                lineHeight: 1.6
              }}
            >
              Como administrador, você tem acesso completo ao painel de administração onde pode gerenciar todas as gerências da organização.
            </Typography>
            
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Button
                variant="contained"
                size="large"
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
                variant="outlined"
                size="large"
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
                variant="body2"
                sx={{
                  color: 'text.secondary',
                  fontStyle: 'italic'
                }}
              >
                💡 Dica: No painel de administração você pode criar, editar e gerenciar todas as gerências, além de controlar usuários e permissões.
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
        <Typography variant="h5" sx={{ mb: 2 }}>
          Minhas Gerências
        </Typography>
        <Typography color="text.secondary">
          Você não está associado a nenhuma gerência no momento.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100%', p: 3, bgcolor: 'background.default' }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h4"
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
            variant="body1"
            sx={{
              color: 'text.secondary',
              fontWeight: 500
            }}
          >
            Gerencie sua gerência e membros da equipe
          </Typography>
          {canEditGerencia && (
            <Chip
              label="Responsável"
              color="primary"
              variant="filled"
              size="small"
              sx={{
                fontWeight: 600,
                fontSize: '0.75rem'
              }}
            />
          )}
        </Box>
        
        {/* Seletor de Gerência Ativa */}
        <Box sx={{ mb: 2 }}>
          <ActiveDepartmentSelector variant="full" showLabel={true} />
        </Box>
      </Box>

      {/* Conteúdo principal */}
      <Grid container spacing={3} sx={{ alignItems: 'flex-start' }}>
        {/* Seção de Informações */}
        <Grid size={{ xs: 12, lg: 6 }}>
          <InfoSection
            gerencia={activeDepartment}
            canEdit={canEditGerencia}
            onEdit={handleEditGerencia}
          />
        </Grid>

        {/* Seção de Membros */}
        <Grid size={{ xs: 12, lg: 6 }}>
          <MembersSection
            gerencia={activeDepartment}
            members={members}
            onAddMember={handleAddMember}
            onRemoveMember={handleRemoveMember}
            loading={departmentsLoading}
            canEdit={canEditGerencia}
          />
        </Grid>
      </Grid>

      {/* Modais */}
      <EditGerenciaModal
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        onSave={handleSaveGerencia}
        gerencia={activeDepartment}
        isEdit={true}
        loading={savingGerencia}
      />

      <AddMembersModal
        open={addMembersModalOpen}
        onClose={() => setAddMembersModalOpen(false)}
        onSave={handleSaveMembers}
        gerencia={activeDepartment}
        users={allUsers}
        loading={loadingUsers}
        onSearchUsers={searchUsers}
        userPagination={userPagination}
        onUserPageChange={handleUserPageChange}
      />

      <DeleteGerenciaModal
        open={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        gerencia={activeDepartment}
        loading={savingGerencia}
      />
    </Box>
  );
};

export default MinhasGerencias;
