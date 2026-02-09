import { Close as CloseIcon, Warning as WarningIcon } from '@mui/icons-material';
import { Box, Button, Dialog, DialogContent, IconButton, Typography } from '@mui/material';

type ConfirmDialogProps = {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
};

export const ConfirmDialog = ({
  open,
  onClose,
  onConfirm,
  title = 'Confirmar ação',
  message = 'Tem certeza que deseja continuar?'
}: ConfirmDialogProps) => (
  <Dialog
    open={open}
    onClose={onClose}
    maxWidth='xs'
    fullWidth
    PaperProps={{ sx: { borderRadius: 3, overflow: 'hidden', boxShadow: '0 25px 60px rgba(0,0,0,.22)' } }}
  >
    <DialogContent sx={{ p: 0 }}>
      <Box
        sx={{ px: 3, pt: 3, pb: 2, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 2 }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: '50%',
              bgcolor: 'warning.light',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <WarningIcon sx={{ color: 'warning.main', fontSize: 24 }} />
          </Box>
          <Typography sx={{ fontWeight: 900, color: 'text.primary', fontSize: '1.25rem', lineHeight: 1.2 }}>
            {title}
          </Typography>
        </Box>
        <IconButton
          onClick={onClose}
          sx={{ width: 40, height: 40, color: 'text.secondary' }}
        >
          <CloseIcon fontSize='small' />
        </IconButton>
      </Box>

      <Box sx={{ px: 3, py: 2 }}>
        <Typography
          variant='body2'
          sx={{ color: 'text.secondary', lineHeight: 1.6 }}
        >
          {message}
        </Typography>
      </Box>

      <Box
        sx={{
          px: 3,
          py: 2,
          display: 'flex',
          justifyContent: 'flex-end',
          gap: 1.25,
          bgcolor: 'grey.50',
          borderTop: '1px solid divider'
        }}
      >
        <Button
          onClick={onClose}
          variant='outlined'
          sx={{
            textTransform: 'none',
            borderRadius: 999,
            borderColor: 'divider',
            color: 'text.primary',
            fontWeight: 800,
            px: 2.5,
            '&:hover': { borderColor: 'grey.300', backgroundColor: 'background.paper' }
          }}
        >
          Cancelar
        </Button>
        <Button
          onClick={onConfirm}
          variant='contained'
          sx={{
            textTransform: 'none',
            borderRadius: 999,
            backgroundColor: 'primary.main',
            fontWeight: 900,
            px: 3,
            boxShadow: 'none',
            '&:hover': { backgroundColor: 'primary.dark' }
          }}
        >
          Continuar
        </Button>
      </Box>
    </DialogContent>
  </Dialog>
);
