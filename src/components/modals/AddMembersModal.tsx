import { Search as SearchIcon } from '@mui/icons-material';
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogContent,
  MenuItem,
  Pagination,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography
} from '@mui/material';
import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { Department, User } from '@/globals/types';

type UserWithMembership = User & { isMember?: boolean };

interface AddMembersModalProps {
  open: boolean;
  onClose: () => void;
  onSave: ({ userIds, type }: { userIds: string[]; type: 'add' }) => void;
  gerencia: Department | null;
  users: UserWithMembership[];
  loading?: boolean;
  userPagination: {
    page: number;
    limit: number;
    total: number;
  };
  onUserPageChange: (page: number) => void;
}

export const AddMembersModal = ({
  open,
  onClose,
  onSave,
  gerencia,
  users,
  loading = false,
  userPagination,
  onUserPageChange
}: AddMembersModalProps) => {
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [savingMembers, setSavingMembers] = useState(false);
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [urlParams, setUrlParams] = useSearchParams();

  const toggleUserSelection = useCallback(
    (userId: string) => {
      const user = users.find((u) => u._id === userId) as UserWithMembership | undefined;
      if (user?.isMember) {
        return;
      }

      setSelectedUserIds((prev) => (prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]));
    },
    [users]
  );

  const handleClose = useCallback(() => {
    setSelectedUserIds([]);
    urlParams.delete('search');
    urlParams.delete('page');
    urlParams.delete('limit');
    setUrlParams(urlParams, { replace: true });
    onClose();
  }, [onClose, setUrlParams, urlParams]);

  const handleSaveMembers = useCallback(async () => {
    if (!gerencia) return;
    try {
      setSavingMembers(true);
      await onSave({ userIds: selectedUserIds, type: 'add' });
      setSelectedUserIds([]);
      handleClose();
    } catch (err) {
      console.error('Erro ao adicionar membros:', err);
    } finally {
      setSavingMembers(false);
    }
  }, [gerencia, selectedUserIds, onSave, handleClose]);

  useEffect(() => {
    return () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
    };
  }, [searchTimeout]);

  return (
    <Dialog
      open={open}
      onClose={handleClose}
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
            Gerencie os membros da equipe de {gerencia?.department_name || 'Gerência'}.
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
              value={urlParams.get('search') || ''}
              onChange={(e) => {
                const value = e.target.value;
                setUrlParams(
                  (prev) => {
                    const next = new URLSearchParams(prev);
                    next.set('search', value);
                    next.set('page', '1'); // reset paginação ao buscar
                    return next;
                  },
                  { replace: true }
                ); // evita empilhar histórico
              }}
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
                {loading ? (
                  <TableRow>
                    <TableCell
                      colSpan={3}
                      align='center'
                      sx={{ py: 6 }}
                    >
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                        <CircularProgress
                          size={32}
                          sx={{ color: '#1877F2' }}
                        />
                        <Typography
                          variant='body2'
                          sx={{ color: '#6b7280', fontWeight: 500 }}
                        >
                          Carregando usuários...
                        </Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                ) : users.length === 0 ? (
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
                        {urlParams.get('search') ? 'Nenhum usuário encontrado' : 'Digite para buscar usuários'}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((u) => (
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
                          {u.isMember && (
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
                      <TableCell
                        align='right'
                        sx={{ py: 2 }}
                      >
                        <Button
                          size='small'
                          variant={
                            u.isMember ? 'text' : selectedUserIds.includes(u._id || '') ? 'contained' : 'outlined'
                          }
                          onClick={() => u._id && toggleUserSelection(u._id)}
                          disabled={u.isMember}
                          sx={{
                            px: 2,
                            py: 1,
                            fontSize: '0.875rem',
                            fontWeight: 500,
                            borderRadius: 2,
                            textTransform: 'none',
                            minWidth: 100,
                            ...(u.isMember
                              ? {
                                  backgroundColor: '#f3f4f6',
                                  color: '#6b7280',
                                  cursor: 'not-allowed',
                                  '&:hover': {
                                    backgroundColor: '#f3f4f6'
                                  }
                                }
                              : selectedUserIds.includes(u._id || '')
                                ? {
                                    backgroundColor: '#1877F2',
                                    color: 'white',
                                    '&:hover': {
                                      backgroundColor: '#166fe5'
                                    }
                                  }
                                : {
                                    borderColor: '#1877F2',
                                    color: '#1877F2',
                                    '&:hover': {
                                      backgroundColor: 'rgba(24, 119, 242, 0.04)',
                                      borderColor: '#1877F2'
                                    }
                                  })
                          }}
                        >
                          {u.isMember ? 'Já é membro' : selectedUserIds.includes(u._id || '') ? 'Remover' : 'Adicionar'}
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
        <Box
          sx={{
            p: 4,
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
            {userPagination.page * userPagination.limit + 1}-
            {Math.min((userPagination.page + 1) * userPagination.limit, userPagination.total)} de {userPagination.total}
          </Typography>

          {/* Pagination Controls */}
          {/* select to change limit of items per page */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Select
              value={urlParams.get('limit') || userPagination.limit}
              onChange={(e) => {
                const newLimit = Number(e.target.value);
                urlParams.set('limit', String(newLimit));
                urlParams.set('page', '1'); // reset page to 1 when limit changes
                setUrlParams(urlParams, { replace: true });
              }}
              sx={{ minWidth: 120, height: 32, fontSize: '0.875rem' }}
            >
              {[5, 10, 25].map((limit) => (
                <MenuItem
                  key={limit}
                  value={limit}
                >
                  {limit} por página
                </MenuItem>
              ))}
            </Select>

            <Pagination
              count={Math.ceil(userPagination.total / userPagination.limit)}
              page={Number(urlParams.get('page') || 1)}
              onChange={(_e, value) => {
                urlParams.set('page', String(value));
                setUrlParams(urlParams);
              }}
              variant='outlined'
              shape='rounded'
            />
          </Box>
        </Box>
        {/* Action Buttons */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, justifyContent: 'flex-end', p: 4, pt: 0 }}>
          <Button
            onClick={handleClose}
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
            disabled={savingMembers || !gerencia || selectedUserIds.length === 0}
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
      </DialogContent>
    </Dialog>
  );
};
