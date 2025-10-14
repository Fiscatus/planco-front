import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography
} from '@mui/material';
import {
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  KeyboardDoubleArrowLeft as KeyboardDoubleArrowLeftIcon,
  KeyboardDoubleArrowRight as KeyboardDoubleArrowRightIcon,
  Search as SearchIcon
} from '@mui/icons-material';
import type { Department, User } from '@/globals/types';
import { useCallback, useEffect, useState } from 'react';

type UserWithMembership = User & { isMember?: boolean };

interface AddMembersModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (userIds: string[]) => Promise<void>;
  gerencia: Department | null;
  users: UserWithMembership[];
  loading?: boolean;
  onSearchUsers: (query: string, page?: number) => Promise<void>;
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
  onSearchUsers,
  userPagination,
  onUserPageChange
}: AddMembersModalProps) => {
  const [userSearch, setUserSearch] = useState('');
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [savingMembers, setSavingMembers] = useState(false);
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);

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

  const handleSaveMembers = useCallback(async () => {
    if (!gerencia) return;
    try {
      setSavingMembers(true);
      await onSave(selectedUserIds);
      setSelectedUserIds([]);
      onClose();
    } catch (err) {
      console.error('Erro ao adicionar membros:', err);
    } finally {
      setSavingMembers(false);
    }
  }, [gerencia, selectedUserIds, onSave, onClose]);

  const handleUserSearch = useCallback(
    (searchTerm: string) => {
      setUserSearch(searchTerm);
      onUserPageChange(0);

      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }

      const timeout = setTimeout(() => {
        if (searchTerm.trim() !== userSearch.trim()) {
          onSearchUsers(searchTerm, 1);
        }
      }, 300);

      setSearchTimeout(timeout);
    },
    [searchTimeout, userSearch, onSearchUsers, onUserPageChange]
  );

  const handleUserPageChange = useCallback(
    (_event: unknown, newPage: number) => {
      onUserPageChange(newPage);
      onSearchUsers(userSearch, newPage + 1);
    },
    [onUserPageChange, onSearchUsers, userSearch]
  );

  useEffect(() => {
    if (open && users.length === 0) {
      onSearchUsers('', 1);
    }
  }, [open, onSearchUsers, users.length]);

  useEffect(() => {
    return () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
    };
  }, [searchTimeout]);

  const handleClose = useCallback(() => {
    setUserSearch('');
    setSelectedUserIds([]);
    onClose();
  }, [onClose]);

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
                        {userSearch ? 'Nenhum usuário encontrado' : 'Digite para buscar usuários'}
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
                            u.isMember
                              ? 'text'
                              : selectedUserIds.includes(u._id || '')
                                ? 'contained'
                                : 'outlined'
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
                          {u.isMember
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
            {Math.min((userPagination.page + 1) * userPagination.limit, userPagination.total)} de{' '}
            {userPagination.total}
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
        </Box>
      </DialogContent>
    </Dialog>
  );
};
