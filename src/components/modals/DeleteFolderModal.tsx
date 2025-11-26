import {
  Box,
  Button,
  Dialog,
  DialogContent,
  Typography
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Warning as WarningIcon
} from '@mui/icons-material';

import type { Folder } from '@/globals/types';

interface DeleteFolderModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  folder: Folder | null;
  loading?: boolean;
}

export const DeleteFolderModal = ({
  open,
  onClose,
  onConfirm,
  folder,
  loading = false
}: DeleteFolderModalProps) => {
  const handleConfirm = async () => {
    try {
      await onConfirm();
      onClose();
    } catch (error) {
      console.error('Erro ao excluir pasta:', error);
    }
  };

  if (!folder) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth='sm'
      PaperProps={{
        sx: {
          borderRadius: 2,
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          overflow: 'hidden'
        }
      }}
    >
      <DialogContent sx={{ p: 4 }}>
        {/* Header com ícone */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            mb: 3
          }}
        >
          <Box
            sx={{
              backgroundColor: '#fef2f2',
              borderRadius: '50%',
              p: 1.5,
              mb: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <DeleteIcon
              sx={{
                fontSize: 32,
                color: '#DC2626'
              }}
            />
          </Box>
          <Typography
            variant='h5'
            sx={{
              fontWeight: 700,
              color: '#1F2937',
              fontSize: '1.5rem'
            }}
          >
            Confirmar Exclusão
          </Typography>
        </Box>

        {/* Texto de confirmação */}
        <Typography
          variant='body1'
          sx={{
            textAlign: 'center',
            color: '#6B7280',
            mb: 3,
            fontSize: '1rem'
          }}
        >
          Tem certeza que deseja excluir a pasta{' '}
          <strong style={{ color: '#1F2937' }}>{folder.name}</strong>?
        </Typography>

        {/* Detalhes da pasta */}
        <Box
          sx={{
            backgroundColor: '#f9fafb',
            borderRadius: 2,
            p: 2,
            mb: 3
          }}
        >
          <Typography
            variant='body2'
            sx={{
              fontWeight: 600,
              color: '#1F2937',
              mb: 1,
              fontSize: '0.875rem'
            }}
          >
            Detalhes da pasta:
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            <Typography
              variant='body2'
              sx={{ fontSize: '0.875rem' }}
            >
              <strong style={{ fontWeight: 500 }}>Nome:</strong> {folder.name}
            </Typography>
            {folder.year && (
              <Typography
                variant='body2'
                sx={{ fontSize: '0.875rem' }}
              >
                <strong style={{ fontWeight: 500 }}>Ano:</strong> {folder.year}
              </Typography>
            )}
            {folder.processCount !== undefined && (
              <Typography
                variant='body2'
                sx={{ fontSize: '0.875rem' }}
              >
                <strong style={{ fontWeight: 500 }}>Processos:</strong> {folder.processCount}
              </Typography>
            )}
          </Box>
        </Box>

        {/* Alert de aviso */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'flex-start',
            p: 2,
            borderRadius: 2,
            backgroundColor: '#FEF3C7',
            border: '1px solid #FCD34D',
            mb: 3
          }}
        >
          <WarningIcon
            sx={{
              color: '#92400E',
              fontSize: 20,
              mr: 1.5,
              mt: 0.25
            }}
          />
          <Typography
            variant='body2'
            sx={{
              color: '#92400E',
              fontSize: '0.875rem',
              lineHeight: 1.5
            }}
          >
            Esta ação não pode ser desfeita. Os processos desta pasta serão movidos para a Pasta Planco.
          </Typography>
        </Box>

        {/* Botões de ação */}
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
            onClick={onClose}
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
            onClick={handleConfirm}
            disabled={loading}
            variant='contained'
            sx={{
              textTransform: 'none',
              borderRadius: 2,
              backgroundColor: '#DC2626',
              color: '#FFFFFF',
              px: { xs: 2.5, sm: 4 },
              py: { xs: 1.125, sm: 1.25 },
              fontSize: { xs: '0.8125rem', sm: '0.875rem' },
              fontWeight: 600,
              width: { xs: '100%', sm: 'auto' },
              '&:hover': {
                backgroundColor: '#B91C1C'
              },
              '&:disabled': {
                backgroundColor: '#E4E6EB',
                color: '#8A8D91'
              }
            }}
          >
            {loading ? 'Excluindo...' : 'Confirmar Exclusão'}
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

