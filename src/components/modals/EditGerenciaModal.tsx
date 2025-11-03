import {
  Box,
  Button,
  Dialog,
  DialogContent,
  FormControl,
  Grid,
  MenuItem,
  Select,
  TextField,
  Typography
} from '@mui/material';
import type { CreateDepartmentDto, Department, UpdateDepartmentDto, User } from '@/globals/types';
import { useCallback, useEffect, useState } from 'react';

import { useUsers } from '@/hooks';

interface EditGerenciaModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: CreateDepartmentDto | UpdateDepartmentDto) => void;
  gerencia?: Department | null;
  isEdit?: boolean;
  loading?: boolean;
}

export const EditGerenciaModal = ({
  open,
  onClose,
  onSave,
  gerencia,
  isEdit = false,
  loading = false
}: EditGerenciaModalProps) => {
  const { fetchUsers } = useUsers();

  const [gerenciaForm, setGerenciaForm] = useState<Partial<CreateDepartmentDto>>({});
  const [responsavelSearch, setResponsavelSearch] = useState('');
  const [responsavelUsers, setResponsavelUsers] = useState<User[]>([]);
  const [loadingResponsavel, setLoadingResponsavel] = useState(false);

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

  useEffect(() => {
    if (open) {
      if (isEdit && gerencia) {
        const responsavelId =
          typeof gerencia.responsavelUserId === 'string'
            ? gerencia.responsavelUserId
            : gerencia.responsavelUserId?._id || gerencia.responsavelUserId_details?._id;

        const formData = {
          department_name: gerencia.department_name,
          department_acronym: gerencia.department_acronym,
          deparment_email: gerencia.deparment_email,
          department_phone: gerencia.department_phone,
          email_owner: gerencia.email_owner,
          description: gerencia.description,
          responsavelUserId: responsavelId
        };

        setGerenciaForm(formData);
      } else {
        setGerenciaForm({});
      }
      setResponsavelSearch('');
      setResponsavelUsers([]);
      searchResponsavel('');
    }
  }, [open, isEdit, gerencia, searchResponsavel]);

  const handleSave = useCallback(async () => {
    if (!gerenciaForm.department_name || !gerenciaForm.deparment_email || !gerenciaForm.email_owner) {
      return;
    }

    try {
      await onSave(gerenciaForm as CreateDepartmentDto | UpdateDepartmentDto);
      onClose();
    } catch (error) {
      console.error('Erro ao salvar gerência:', error);
    }
  }, [gerenciaForm, onSave, onClose]);

  const handleClose = useCallback(() => {
    setGerenciaForm({});
    setResponsavelSearch('');
    setResponsavelUsers([]);
    onClose();
  }, [onClose]);

  return (
    <Dialog
      open={open}
      onClose={handleClose}
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
        <Box
          sx={{
            p: 3,
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <Box>
            <Typography
              variant='h5'
              sx={{
                fontWeight: 700,
                color: '#0f172a',
                fontSize: '1.5rem'
              }}
            >
              {isEdit ? 'Editar Gerência' : 'Nova Gerência'}
            </Typography>
            <Typography
              variant='body2'
              sx={{
                color: '#64748b',
                fontSize: '0.875rem',
                mt: 0.5
              }}
            >
              {isEdit ? 'Atualize os dados da gerência.' : 'Preencha os dados para criar uma nova gerência.'}
            </Typography>
          </Box>
        </Box>

        {/* Form Content */}
        <Box sx={{ p: 4 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Primeira linha - Departamento e Sigla */}
            <Grid
              container
              spacing={3}
            >
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
                    value={gerenciaForm.department_name || ''}
                    onChange={(e) => setGerenciaForm((prev) => ({ ...prev, department_name: e.target.value }))}
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
                    value={gerenciaForm.department_acronym || ''}
                    onChange={(e) =>
                      setGerenciaForm((prev) => ({ ...prev, department_acronym: e.target.value.toUpperCase() }))
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
            <Grid
              container
              spacing={3}
            >
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
                    value={gerenciaForm.department_phone || ''}
                    onChange={(e) => {
                      let value = e.target.value.replace(/\D/g, '');

                      if (value.length <= 2) {
                        // do nothing
                      } else if (value.length <= 7) {
                        value = `(${value.slice(0, 2)}) ${value.slice(2)}`;
                      } else {
                        value = `(${value.slice(0, 2)}) ${value.slice(2, 7)}-${value.slice(7, 11)}`;
                      }

                      setGerenciaForm((prev) => ({ ...prev, department_phone: value }));
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
                    value={gerenciaForm.deparment_email || ''}
                    onChange={(e) =>
                      setGerenciaForm((prev) => ({ ...prev, deparment_email: e.target.value.toLowerCase() }))
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
            <Grid
              container
              spacing={3}
            >
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
                  <FormControl
                    fullWidth
                    variant='outlined'
                  >
                    <Select
                      value={
                        responsavelUsers.find((u) => u._id === gerenciaForm.responsavelUserId)
                          ? gerenciaForm.responsavelUserId || ''
                          : ''
                      }
                      onChange={(e) => {
                        const userId = e.target.value;
                        const selectedUser = responsavelUsers.find((u) => u._id === userId);
                        setGerenciaForm((prev) => ({
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
                          color: gerenciaForm.responsavelUserId ? '#0f172a' : '#9ca3af'
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
                    value={gerenciaForm.email_owner || ''}
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
                value={gerenciaForm.description || ''}
                onChange={(e) => setGerenciaForm((prev) => ({ ...prev, description: e.target.value }))}
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

        {/* Footer com botões */}
        <Box
          sx={{
            p: 3,
            backgroundColor: '#f8fafc',
            borderTop: '1px solid #e2e8f0',
            display: 'flex',
            justifyContent: 'flex-end',
            alignItems: 'center',
            gap: 1
          }}
        >
          <Button
            onClick={handleClose}
            sx={{
              px: 3,
              py: 1.25,
              fontSize: '0.875rem',
              fontWeight: 600,
              color: 'white',
              textTransform: 'uppercase',
              borderRadius: 2,
              transition: 'all 0.2s ease-in-out',
              '&:hover': {
                backgroundColor: '#f1f5f9',
                color: 'gray'
              }
            }}
          >
            Cancelar
          </Button>
          <Button
            onClick={() => {
              handleSave();
            }}
            variant='contained'
            disabled={loading}
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
            {loading ? 'Salvando...' : isEdit ? 'Atualizar' : 'Criar Gerência'}
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
};
