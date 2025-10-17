import {
  Alert,
  Box,
  Button,
  Card,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Typography
} from '@mui/material';
import { Delete as DeleteIcon, GroupAdd as GroupAddIcon } from '@mui/icons-material';
import type { Department, User } from '@/globals/types';
import { useMemo, useState } from 'react';

import { Loading } from '@/components';
import { useAccessControl } from '@/hooks';

interface MembersSectionProps {
  gerencia: Department | null;
  members: User[];
  onAddMember?: () => void;
  onRemoveMember?: ({ userIds, type }: { userIds: string[]; type: 'remove' }) => void
  loading?: boolean;
  canEdit?: boolean;
}

export const MembersSection = ({
  gerencia,
  members,
  onAddMember,
  onRemoveMember,
  loading = false,
  canEdit = false
}: MembersSectionProps) => {
  const { hasPermission } = useAccessControl();

  const canManageMembers = canEdit || hasPermission('departments.update');

  const [membersPagination, setMembersPagination] = useState({
    page: 0,
    limit: 5,
    total: 0
  });

  const paginatedMembers = useMemo(() => {
    const startIndex = membersPagination.page * membersPagination.limit;
    const endIndex = startIndex + membersPagination.limit;
    return members.slice(startIndex, endIndex);
  }, [members, membersPagination.page, membersPagination.limit]);

  const handleMembersPageChange = (_event: unknown, newPage: number) => {
    setMembersPagination((prev) => ({ ...prev, page: newPage }));
  };

  const handleMembersRowsPerPageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newLimit = Number.parseInt(event.target.value, 10);
    setMembersPagination((prev) => ({ ...prev, limit: newLimit, page: 0 }));
  };

  return (
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
              {members.length} usuário{members.length !== 1 ? 's' : ''} associado
              {members.length !== 1 ? 's' : ''}
            </Typography>
          </Box>
          {canManageMembers && (
            <Button
              startIcon={<GroupAddIcon />}
              onClick={onAddMember}
              variant='contained'
              disabled={!gerencia}
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
          )}
        </Box>
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column' }}>
        {!gerencia ? (
          <Box sx={{ p: 3 }}>
            <Alert severity='info'>Carregando informações da gerência...</Alert>
          </Box>
        ) : members.length === 0 ? (
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
                    {canManageMembers && (
                      <TableCell
                        align='right'
                        sx={{ fontWeight: 500, color: 'text.secondary', py: 2 }}
                      >
                        Ações
                      </TableCell>
                    )}
                  </TableRow>
                </TableHead>
                {!loading ? (
                  <TableBody>
                    {paginatedMembers.map((u) => {
                      const isResponsavel = u.email === gerencia?.email_owner;
                      const isOnlyMember = members.length === 1;
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
                          {canManageMembers && (
                            <TableCell
                              align='right'
                              sx={{ py: 2 }}
                            >
                              <Button
                                size='small'
                                variant='text'
                                color='error'
                                disabled={!canRemove}
                                onClick={() => u._id && onRemoveMember?.({ userIds: [u._id], type: 'remove' })}
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
                          )}
                        </TableRow>
                      );
                    })}
                  </TableBody>
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={3}
                      align='center'
                    >
                      <Loading isLoading />
                    </TableCell>
                  </TableRow>
                )}
              </Table>
            </TableContainer>

            <Box sx={{ borderTop: '1px solid', borderColor: 'divider' }}>
              <TablePagination
                component='div'
                count={members.length}
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
  );
};
