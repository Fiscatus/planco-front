import { Close as CloseIcon } from '@mui/icons-material';
import { Box, Button, Dialog, DialogContent, IconButton, TextField, Typography } from '@mui/material';
import { useCallback, useEffect, useState } from 'react';
import type { CreateFolderDto } from '@/globals/types';

interface CreateFolderModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: CreateFolderDto) => void;
  loading?: boolean;
}

export const CreateFolderModal = ({ open, onClose, onSave, loading = false }: CreateFolderModalProps) => {
  const [folderForm, setFolderForm] = useState<Partial<CreateFolderDto> & { year?: string | number }>({
    name: '',
    observations: '',
    year: undefined
  });

  useEffect(() => {
    if (open) {
      setFolderForm({
        name: '',
        observations: '',
        year: undefined
      });
    }
  }, [open]);

  const handleSave = useCallback(async () => {
    if (!folderForm.name.trim()) {
      return;
    }

    try {
      // Preparar dados para enviar
      const dataToSave: CreateFolderDto = {
        name: folderForm.name,
        ...(folderForm.observations?.trim() ? { observations: folderForm.observations.trim() } : {}),
        ...(folderForm.year?.toString().trim() ? { year: Number(folderForm.year) } : {})
      };
      await onSave(dataToSave);
      onClose();
    } catch (error) {
      console.error('Erro ao criar pasta:', error);
    }
  }, [folderForm, onSave, onClose]);

  const handleClose = useCallback(() => {
    setFolderForm({
      name: '',
      observations: '',
      year: undefined
    });
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
          borderRadius: { xs: 2, sm: 3 },
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          overflow: 'hidden',
          margin: { xs: 1, sm: 2 },
          maxWidth: { xs: 'calc(100% - 16px)', sm: '600px' },
          width: '100%'
        }
      }}
    >
      <DialogContent sx={{ p: 0 }}>
        {/* Header */}
        <Box
          sx={{
            p: { xs: 2.5, sm: 3 },
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            gap: 1
          }}
        >
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              variant='h5'
              sx={{
                fontWeight: 700,
                color: '#0f172a',
                fontSize: { xs: '1.25rem', sm: '1.5rem' },
                lineHeight: { xs: 1.3, sm: 1.2 }
              }}
            >
              Nova Pasta
            </Typography>
            <Typography
              variant='body2'
              sx={{
                color: '#64748b',
                fontSize: { xs: '0.8125rem', sm: '0.875rem' },
                mt: { xs: 0.5, sm: 0.5 },
                lineHeight: { xs: 1.4, sm: 1.5 }
              }}
            >
              Preencha os dados para criar uma nova pasta.
            </Typography>
          </Box>
          <IconButton
            onClick={handleClose}
            sx={{
              width: { xs: 36, sm: 40 },
              height: { xs: 36, sm: 40 },
              color: '#64748b',
              backgroundColor: 'transparent',
              flexShrink: 0,
              '&:hover': {
                backgroundColor: '#f1f5f9'
              }
            }}
          >
            <CloseIcon sx={{ fontSize: { xs: 18, sm: 20 } }} />
          </IconButton>
        </Box>

        {/* Form Content */}
        <Box sx={{ p: { xs: 2.5, sm: 3, md: 4 } }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 2.5, sm: 3 } }}>
            {/* Nome da pasta */}
            <Box>
              <Typography
                variant='body2'
                sx={{
                  fontWeight: 600,
                  color: '#0f172a',
                  mb: { xs: 0.75, sm: 1 },
                  fontSize: { xs: '0.8125rem', sm: '0.875rem' }
                }}
              >
                Nome da Pasta
              </Typography>
              <TextField
                fullWidth
                placeholder='Ex: Processos 2025'
                value={folderForm.name || ''}
                onChange={(e) => setFolderForm((prev) => ({ ...prev, name: e.target.value }))}
                required
                variant='outlined'
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: '#ffffff',
                    borderRadius: 2,
                    height: { xs: 44, sm: 48 },
                    fontSize: { xs: '0.875rem', sm: '1rem' },
                    '& .MuiOutlinedInput-notchedOutline': {
                      border: '2px solid #e2e8f0',
                      transition: 'all 0.2s ease-in-out'
                    },
                    '&:hover': {
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#cbd5e1'
                      },
                      backgroundColor: '#ffffff'
                    },
                    '&.Mui-focused': {
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#1877F2',
                        boxShadow: '0 0 0 3px rgba(24, 119, 242, 0.1)'
                      },
                      backgroundColor: '#ffffff'
                    }
                  },
                  '& .MuiInputBase-input::placeholder': {
                    color: '#9ca3af',
                    opacity: 1,
                    fontSize: { xs: '0.875rem', sm: '1rem' }
                  }
                }}
              />
            </Box>

            {/* Ano */}
            <Box>
              <Typography
                variant='body2'
                sx={{
                  fontWeight: 600,
                  color: '#0f172a',
                  mb: { xs: 0.75, sm: 1 },
                  fontSize: { xs: '0.8125rem', sm: '0.875rem' }
                }}
              >
                Ano
              </Typography>
              <TextField
                fullWidth
                type='number'
                placeholder='Ex: 2025'
                value={folderForm.year ?? ''}
                onChange={(e) => {
                  const yearValue = e.target.value;
                  setFolderForm((prev) => ({
                    ...prev,
                    year: yearValue ? Number(yearValue) : undefined
                  }));
                }}
                variant='outlined'
                slotProps={{ htmlInput: { min: 2000, max: new Date().getFullYear() } }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: '#ffffff',
                    borderRadius: 2,
                    height: { xs: 44, sm: 48 },
                    fontSize: { xs: '0.875rem', sm: '1rem' },
                    '& .MuiOutlinedInput-notchedOutline': {
                      border: '2px solid #e2e8f0',
                      transition: 'all 0.2s ease-in-out'
                    },
                    '&:hover': {
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#cbd5e1'
                      },
                      backgroundColor: '#ffffff'
                    },
                    '&.Mui-focused': {
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#1877F2',
                        boxShadow: '0 0 0 3px rgba(24, 119, 242, 0.1)'
                      },
                      backgroundColor: '#ffffff'
                    }
                  },
                  '& .MuiInputBase-input::placeholder': {
                    color: '#9ca3af',
                    opacity: 1,
                    fontSize: { xs: '0.875rem', sm: '1rem' }
                  }
                }}
              />
            </Box>

            {/* Descrição */}
            <Box>
              <Typography
                variant='body2'
                sx={{
                  fontWeight: 600,
                  color: '#0f172a',
                  mb: { xs: 0.75, sm: 1 },
                  fontSize: { xs: '0.8125rem', sm: '0.875rem' }
                }}
              >
                Descrição
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={4}
                placeholder='Descreva o propósito desta pasta...'
                value={folderForm.observations || ''}
                onChange={(e) => setFolderForm((prev) => ({ ...prev, observations: e.target.value }))}
                variant='outlined'
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: '#ffffff',
                    borderRadius: 2,
                    fontSize: { xs: '0.875rem', sm: '1rem' },
                    '& .MuiOutlinedInput-notchedOutline': {
                      border: '2px solid #e2e8f0',
                      transition: 'all 0.2s ease-in-out'
                    },
                    '&:hover': {
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#cbd5e1'
                      },
                      backgroundColor: '#ffffff'
                    },
                    '&.Mui-focused': {
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#1877F2',
                        boxShadow: '0 0 0 3px rgba(24, 119, 242, 0.1)'
                      },
                      backgroundColor: '#ffffff'
                    }
                  },
                  '& .MuiInputBase-input': {
                    fontSize: { xs: '0.875rem', sm: '1rem' },
                    padding: { xs: '12px 14px', sm: '14px 16px' }
                  },
                  '& .MuiInputBase-input::placeholder': {
                    color: '#9ca3af',
                    opacity: 1,
                    fontSize: { xs: '0.875rem', sm: '1rem' }
                  }
                }}
              />
            </Box>
          </Box>
        </Box>

        {/* Footer com botões */}
        <Box
          sx={{
            p: { xs: 2, sm: 3 },
            backgroundColor: '#f8fafc',
            borderTop: '1px solid #e2e8f0',
            display: 'flex',
            flexDirection: { xs: 'column-reverse', sm: 'row' },
            justifyContent: 'flex-end',
            alignItems: 'stretch',
            gap: { xs: 1.5, sm: 1 }
          }}
        >
          <Button
            onClick={handleClose}
            variant='outlined'
            sx={{
              textTransform: 'none',
              borderRadius: 2,
              borderColor: '#E4E6EB',
              color: '#212121',
              px: { xs: 2.5, sm: 3 },
              py: { xs: 1.125, sm: 1.25 },
              fontSize: { xs: '0.8125rem', sm: '0.875rem' },
              fontWeight: 600,
              width: { xs: '100%', sm: 'auto' },
              '&:hover': {
                borderColor: '#CBD5E1',
                backgroundColor: '#F8F9FA'
              }
            }}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            variant='contained'
            disabled={loading}
            sx={{
              textTransform: 'none',
              borderRadius: 2,
              backgroundColor: '#1877F2',
              color: '#FFFFFF',
              px: { xs: 2.5, sm: 4 },
              py: { xs: 1.125, sm: 1.25 },
              fontSize: { xs: '0.8125rem', sm: '0.875rem' },
              fontWeight: 600,
              width: { xs: '100%', sm: 'auto' },
              '&:hover': {
                backgroundColor: '#166fe5'
              },
              '&:disabled': {
                backgroundColor: '#E4E6EB',
                color: '#8A8D91'
              }
            }}
          >
            {loading ? 'Criando...' : 'Criar Pasta'}
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
};
