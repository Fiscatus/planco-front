import {
  Box,
  Button,
  Dialog,
  DialogContent,
  Grid,
  TextField,
  Typography
} from '@mui/material';
import type { Folder, UpdateFolderDto } from '@/globals/types';
import { useCallback, useEffect, useState } from 'react';

interface EditFolderModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: UpdateFolderDto) => void;
  folder?: Folder | null;
  loading?: boolean;
}

export const EditFolderModal = ({
  open,
  onClose,
  onSave,
  folder,
  loading = false
}: EditFolderModalProps) => {
  const [folderForm, setFolderForm] = useState<Partial<UpdateFolderDto> & { year?: string | number }>({
    name: '',
    observations: '',
    year: undefined
  });

  useEffect(() => {
    if (open && folder) {
      setFolderForm({
        name: folder.name || '',
        observations: folder.description || folder.observations || '',
        year: folder.year ? Number(folder.year) : undefined
      });
    }
  }, [open, folder]);

  const handleSave = useCallback(async () => {
    if (!folderForm.name?.trim()) {
      return;
    }

    try {
      // Preparar dados para enviar
      const dataToSave: UpdateFolderDto = {
        name: folderForm.name,
        ...(folderForm.observations && folderForm.observations.trim() ? { observations: folderForm.observations.trim() } : {}),
        ...(folderForm.year && folderForm.year.toString().trim() ? { year: Number(folderForm.year) } : {})
      };
      await onSave(dataToSave);
      onClose();
    } catch (error) {
      console.error('Erro ao editar pasta:', error);
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
              Editar Pasta
            </Typography>
            <Typography
              variant='body2'
              sx={{
                color: '#64748b',
                fontSize: '0.875rem',
                mt: 0.5
              }}
            >
              Altere as informações da pasta conforme necessário.
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
            borderTop: '1px solid #e2e8f0',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: 2
          }}
        >
          <Button
            onClick={handleClose}
            disabled={loading}
            sx={{
              px: 3,
              py: 1.25,
              fontSize: '0.875rem',
              fontWeight: 600,
              color: '#64748b',
              textTransform: 'uppercase',
              borderRadius: 2,
              border: '1px solid #e2e8f0',
              backgroundColor: 'transparent',
              transition: 'all 0.2s ease-in-out',
              '&:hover': {
                backgroundColor: '#f8fafc',
                borderColor: '#cbd5e1'
              },
              '&:disabled': {
                opacity: 0.5,
                cursor: 'not-allowed'
              }
            }}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            disabled={loading}
            variant='contained'
            sx={{
              px: 3,
              py: 1.25,
              fontSize: '0.875rem',
              fontWeight: 600,
              backgroundColor: '#1877F2',
              textTransform: 'uppercase',
              borderRadius: 2,
              color: 'white',
              transition: 'all 0.2s ease-in-out',
              '&:hover': {
                backgroundColor: '#166fe5'
              },
              '&:disabled': {
                backgroundColor: '#9ca3af',
                cursor: 'not-allowed'
              }
            }}
          >
            {loading ? 'Salvando...' : 'Salvar Alterações'}
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

