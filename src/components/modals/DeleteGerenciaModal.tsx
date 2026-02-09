import { Delete as DeleteIcon, Warning as WarningIcon } from '@mui/icons-material';
import { Box, Button, Dialog, DialogContent, Typography } from '@mui/material';

import type { Department } from '@/globals/types';

interface DeleteGerenciaModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  gerencia: Department | null;
  loading?: boolean;
}

export const DeleteGerenciaModal = ({
  open,
  onClose,
  onConfirm,
  gerencia,
  loading = false
}: DeleteGerenciaModalProps) => {
  const handleConfirm = async () => {
    try {
      await onConfirm();
      onClose();
    } catch (error) {
      console.error('Erro ao excluir gerência:', error);
    }
  };

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
          Tem certeza que deseja excluir a gerência{' '}
          <strong style={{ color: '#1F2937' }}>{gerencia?.department_name}</strong>?
        </Typography>

        {/* Detalhes da gerência */}
        {gerencia && (
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
              Detalhes da gerência:
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
              <Typography
                variant='body2'
                sx={{ fontSize: '0.875rem' }}
              >
                <strong style={{ fontWeight: 500 }}>Nome:</strong> {gerencia.department_name}
              </Typography>
              <Typography
                variant='body2'
                sx={{ fontSize: '0.875rem' }}
              >
                <strong style={{ fontWeight: 500 }}>Sigla:</strong> {gerencia.department_acronym}
              </Typography>
              <Typography
                variant='body2'
                sx={{ fontSize: '0.875rem' }}
              >
                <strong style={{ fontWeight: 500 }}>E-mail:</strong> {gerencia.deparment_email}
              </Typography>
            </Box>
          </Box>
        )}

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
            Esta ação não pode ser desfeita. A gerência será permanentemente removida.
          </Typography>
        </Box>

        {/* Botões de ação */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: 2
          }}
        >
          <Button
            onClick={onClose}
            sx={{
              px: 3,
              py: 1.25,
              fontSize: '0.875rem',
              fontWeight: 600,
              color: '#1F2937',
              textTransform: 'uppercase',
              borderRadius: 2,
              border: '1px solid #E5E7EB',
              backgroundColor: 'transparent',
              transition: 'all 0.2s ease-in-out',
              '&:hover': {
                backgroundColor: '#f3f4f6',
                borderColor: '#D1D5DB'
              }
            }}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={loading}
            sx={{
              px: 3,
              py: 1.25,
              fontSize: '0.875rem',
              fontWeight: 600,
              backgroundColor: '#DC2626',
              textTransform: 'uppercase',
              borderRadius: 2,
              color: 'white',
              transition: 'all 0.2s ease-in-out',
              '&:hover': {
                backgroundColor: '#B91C1C'
              },
              '&:disabled': {
                backgroundColor: '#e5e7eb',
                color: '#9ca3af'
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
