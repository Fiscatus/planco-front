import {
  Box,
  Button,
  Dialog,
  DialogContent,
  Grid,
  TextField,
  Typography
} from '@mui/material';
import type { CreateFolderDto } from '@/globals/types';
import { useCallback, useEffect, useState } from 'react';

interface CreateFolderModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: CreateFolderDto) => void;
  loading?: boolean;
}

export const CreateFolderModal = ({
  open,
  onClose,
  onSave,
  loading = false
}: CreateFolderModalProps) => {
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
        ...(folderForm.observations && folderForm.observations.trim() ? { observations: folderForm.observations.trim() } : {}),
        ...(folderForm.year && folderForm.year.toString().trim() ? { year: Number(folderForm.year) } : {})
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
              Nova Pasta
            </Typography>
            <Typography
              variant='body2'
              sx={{
                color: '#64748b',
                fontSize: '0.875rem',
                mt: 0.5
              }}
            >
              Preencha os dados para criar uma nova pasta.
            </Typography>
          </Box>
        </Box>

        {/* Form Content */}
        <Box sx={{ p: 4 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Nome da pasta */}
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
                Nome da Pasta *
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

            {/* Ano */}
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
                Ano
              </Typography>
              <TextField
                fullWidth
                type='number'
                placeholder='Ex: 2025'
                value={folderForm.year || ''}
                onChange={(e) => {
                  const yearValue = e.target.value;
                  setFolderForm((prev) => ({ ...prev, year: yearValue ? yearValue : undefined }));
                }}
                variant='outlined'
                inputProps={{ min: 2000, max: new Date().getFullYear() }}
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
                placeholder='Descreva o propósito desta pasta...'
                value={folderForm.observations || ''}
                onChange={(e) => setFolderForm((prev) => ({ ...prev, observations: e.target.value }))}
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
            onClick={handleSave}
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
            {loading ? 'Criando...' : 'Criar Pasta'}
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

