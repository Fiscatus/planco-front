import { Box, Button, Dialog, DialogContent, IconButton, TextField, Typography } from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { useEffect, useState } from 'react';

type Props = {
  open: boolean;
  onClose: () => void;
  onConfirm: (name: string, description: string) => void;
  defaultName: string;
  defaultDescription: string;
  loading?: boolean;
};

export const EditFlowModelModal = ({ open, onClose, onConfirm, defaultName, defaultDescription, loading = false }: Props) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (open) {
      setName(defaultName);
      setDescription(defaultDescription);
    }
  }, [open, defaultName, defaultDescription]);

  const fieldSx = {
    '& .MuiOutlinedInput-root': {
      borderRadius: 2,
      '& .MuiOutlinedInput-notchedOutline': { border: '2px solid #e2e8f0' },
      '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#cbd5e1' },
      '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#1877F2', boxShadow: '0 0 0 3px rgba(24,119,242,0.1)' },
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth='sm'
      PaperProps={{ sx: { borderRadius: 3, boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', overflow: 'hidden' } }}>
      <DialogContent sx={{ p: 0 }}>
        <Box sx={{ px: 3, py: 2.5, borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 1 }}>
          <Box>
            <Typography sx={{ fontWeight: 700, color: '#0f172a', fontSize: '1.25rem' }}>Editar Modelo</Typography>
            <Typography variant='body2' sx={{ color: '#64748b', mt: 0.5 }}>Altere o nome e a descrição do modelo.</Typography>
          </Box>
          <IconButton onClick={onClose} size='small' sx={{ color: '#64748b', '&:hover': { bgcolor: '#f1f5f9' } }}>
            <CloseIcon sx={{ fontSize: 20 }} />
          </IconButton>
        </Box>

        <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          <Box>
            <Typography variant='body2' sx={{ fontWeight: 600, color: '#0f172a', mb: 1, fontSize: '0.875rem' }}>Nome</Typography>
            <TextField fullWidth value={name} onChange={(e) => setName(e.target.value)} variant='outlined' sx={fieldSx} />
          </Box>
          <Box>
            <Typography variant='body2' sx={{ fontWeight: 600, color: '#0f172a', mb: 1, fontSize: '0.875rem' }}>Descrição</Typography>
            <TextField fullWidth multiline rows={3} value={description} onChange={(e) => setDescription(e.target.value)} variant='outlined' sx={fieldSx} />
          </Box>
        </Box>

        <Box sx={{ px: 3, py: 2, bgcolor: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
          <Button onClick={onClose} variant='outlined'
            sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 2, borderColor: '#E4E6EB', color: '#212121', '&:hover': { borderColor: '#CBD5E1', bgcolor: '#F8F9FA' } }}>
            Cancelar
          </Button>
          <Button onClick={() => onConfirm(name, description)} variant='contained' disabled={loading || !name.trim()}
            sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 2, bgcolor: '#1877F2', '&:hover': { bgcolor: '#166fe5' }, '&:disabled': { bgcolor: '#E4E6EB', color: '#8A8D91' } }}>
            {loading ? 'Salvando...' : 'Salvar'}
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
};
