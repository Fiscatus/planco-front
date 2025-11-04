import {
  Alert,
  Box,
  Button,
  Card,
  Chip,
  MenuItem,
  Pagination,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography
} from '@mui/material';
import { Delete as DeleteIcon, GroupAdd as GroupAddIcon } from '@mui/icons-material';
import type { Department, User } from '@/globals/types';

import { Loading } from '@/components';
import { useAccessControl } from '@/hooks';
import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';

interface MembersSectionProps {
  gerencia: Department | null;
  members: User[];
  onAddMember?: () => void;
  onRemoveMember?: ({ userIds, type }: { userIds: string[]; type: 'remove' }) => void
  loading?: boolean;
  canEdit?: boolean;
  membersPagination?: {
    page: number;
    limit: number;
    total: number;
  };
  onMembersPageChange?: (page: number) => void;
  onMembersLimitChange?: (limit: number) => void;
}

export const MembersSection = ({
  gerencia,
  members,
  onAddMember,
  onRemoveMember,
  loading = false,
  canEdit = false,
  membersPagination = { page: 0, limit: 5, total: 0 },
  onMembersPageChange,
  onMembersLimitChange
}: MembersSectionProps) => {
  const { hasPermission } = useAccessControl();
  const [urlParams, setUrlParams] = useSearchParams();

  const canManageMembers = canEdit || hasPermission('departments.update');

  const paginatedMembers = useMemo(() => {
    const startIndex = membersPagination.page * membersPagination.limit;
    const endIndex = startIndex + membersPagination.limit;
    return members.slice(startIndex, endIndex);
  }, [members, membersPagination.page, membersPagination.limit]);

  const handleMembersPageChange = (_event: unknown, newPage: number) => {
    if (onMembersPageChange) {
      onMembersPageChange(newPage - 1);
    } else {
      urlParams.set('membersPage', String(newPage));
      setUrlParams(urlParams, { replace: true });
    }
  };

  const handleMembersLimitChange = (event: any) => {
    const newLimit = Number(event.target.value);
    if (onMembersLimitChange) {
      onMembersLimitChange(newLimit);
    } else {
      urlParams.set('membersLimit', String(newLimit));
      urlParams.set('membersPage', '1');
      setUrlParams(urlParams, { replace: true });
    }
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

            {/* Pagination */}
            <Box
              sx={{
                p: 3,
                display: 'flex',
                flexDirection: { xs: 'column', md: 'row' },
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: 2,
                backgroundColor: '#f8fafc',
                borderTop: '1px solid #e5e7eb'
              }}
            >
              {/* Pagination Info */}
              <Typography
                variant='body2'
                sx={{ color: '#6b7280', fontSize: '0.875rem' }}
              >
                {membersPagination.page * membersPagination.limit + 1}-
                {Math.min((membersPagination.page + 1) * membersPagination.limit, members.length)} de {members.length}
              </Typography>

              {/* Pagination Controls */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Select
                  value={membersPagination.limit}
                  onChange={handleMembersLimitChange}
                  sx={{ minWidth: 120, height: 32, fontSize: '0.875rem' }}
                >
                  {[5, 10, 25, 50].map((limit) => (
                    <MenuItem 
                      key={limit} 
                      value={limit}
                      sx={{
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
                  count={Math.ceil(members.length / membersPagination.limit)}
                  page={membersPagination.page + 1}
                  onChange={handleMembersPageChange}
                  variant='outlined'
                  shape='rounded'
                />
              </Box>
            </Box>
          </>
        )}
      </Box>
    </Card>
  );
};
