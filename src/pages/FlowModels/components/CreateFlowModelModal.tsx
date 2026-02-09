import { Close as CloseIcon } from '@mui/icons-material';
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogContent,
  IconButton,
  TextField,
  Typography
} from '@mui/material';
import { useCallback, useEffect, useState } from 'react';
import type { CreateFlowModelDto } from '@/hooks/useFlowModels';

type CreateFlowModelModalProps = {
  open: boolean;
  onClose: () => void;
  onSave: (data: CreateFlowModelDto) => void;
  loading?: boolean;
};

export const CreateFlowModelModal = ({ open, onClose, onSave, loading = false }: CreateFlowModelModalProps) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (open) {
      setName('');
      setDescription('');
    }
  }, [open]);

  const handleSave = useCallback(() => {
    if (!name.trim()) return;
    onSave({
      name: name.trim(),
      description: description.trim() || undefined,
      stages: [
        {
          stageId: `stage_${Date.now()}`,
          order: 1,
          name: 'Etapa 1',
          description: 'Etapa inicial do fluxo',
          requiresApproval: false,
          components: [
            {
              order: 1,
              type: 'STAGE_PANEL',
              key: 'stage_panel',
              label: 'Painel da Etapa',
              description: 'Visão geral da etapa',
              required: false
            }
          ]
        }
      ],
      isActive: true
    });
  }, [name, description, onSave]);

  const handleClose = useCallback(() => {
    if (!loading) onClose();
  }, [loading, onClose]);

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      maxWidth='sm'
      PaperProps={{
        sx: {
          borderRadius: { xs: 3, sm: 4 },
          overflow: 'hidden',
          boxShadow: '0 25px 60px rgba(0,0,0,.22)',
          border: '1px solid divider'
        }
      }}
    >
      <DialogContent sx={{ p: 0 }}>
        <Box
          sx={{
            px: { xs: 2.5, sm: 3 },
            pt: { xs: 2.5, sm: 3 },
            pb: 2,
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: 2,
            background: 'background.paper'
          }}
        >
          <Box sx={{ minWidth: 0 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, flexWrap: 'wrap' }}>
              <Typography
                sx={{
                  fontWeight: 900,
                  color: 'text.primary',
                  fontSize: { xs: '1.25rem', sm: '1.35rem' },
                  lineHeight: 1.2,
                  letterSpacing: '-0.02em'
                }}
              >
                Novo Modelo de Fluxo
              </Typography>

              <Chip
                label='Novo'
                size='small'
                sx={{
                  height: 22,
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  backgroundColor: 'secondary.light',
                  color: 'primary.main',
                  border: '1px solid secondary.light'
                }}
              />
            </Box>

            <Typography
              variant='body2'
              sx={{
                mt: 0.75,
                color: 'text.secondary',
                lineHeight: 1.5,
                maxWidth: 520
              }}
            >
              Crie um modelo base para reutilizar em diferentes processos.
            </Typography>
          </Box>

          <IconButton
            onClick={handleClose}
            disabled={loading}
            sx={{
              width: 40,
              height: 40,
              color: 'text.secondary',
              '&:hover': { backgroundColor: 'grey.100' },
              '&:disabled': { opacity: 0.5 }
            }}
          >
            <CloseIcon fontSize='small' />
          </IconButton>
        </Box>

        <Box sx={{ height: 1, backgroundColor: 'divider' }} />

        <Box
          sx={{
            px: { xs: 2.5, sm: 3 },
            py: { xs: 2.5, sm: 3 },
            background: 'background.paper'
          }}
        >
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label='Nome do Modelo'
              value={name}
              onChange={(e) => setName(e.target.value)}
              fullWidth
              required
              disabled={loading}
              placeholder='Ex: Modelo Fiscatus'
              sx={{
                '& .MuiInputLabel-root': { fontWeight: 700 },
                '& .MuiOutlinedInput-root': {
                  borderRadius: 3,
                  backgroundColor: 'background.paper',
                  '& fieldset': { borderColor: 'divider' },
                  '&:hover fieldset': { borderColor: 'grey.300' },
                  '&.Mui-focused fieldset': { borderColor: 'primary.main' }
                }
              }}
            />

            <TextField
              label='Descrição'
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              fullWidth
              multiline
              rows={4}
              disabled={loading}
              placeholder='Descreva o propósito deste modelo de fluxo...'
              sx={{
                '& .MuiInputLabel-root': { fontWeight: 700 },
                '& .MuiOutlinedInput-root': {
                  borderRadius: 3,
                  backgroundColor: 'background.paper',
                  '& fieldset': { borderColor: 'divider' },
                  '&:hover fieldset': { borderColor: 'grey.300' },
                  '&.Mui-focused fieldset': { borderColor: 'primary.main' }
                }
              }}
            />

            <TextField
              label='Descrição'
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              fullWidth
              multiline
              rows={4}
              disabled={loading}
              placeholder='Descreva o propósito deste modelo de fluxo...'
              sx={{
                '& .MuiInputLabel-root': { fontWeight: 700 },
                '& .MuiOutlinedInput-root': {
                  borderRadius: 3,
                  backgroundColor: 'background.paper',
                  '& fieldset': { borderColor: 'divider' },
                  '&:hover fieldset': { borderColor: 'grey.300' },
                  '&.Mui-focused fieldset': { borderColor: 'primary.main' }
                }
              }}
            />

            <Typography
              variant='caption'
              sx={{ color: 'text.disabled', lineHeight: 1.4 }}
            >
              Ao criar, o sistema gera uma etapa inicial padrão para você começar a editar.
            </Typography>
          </Box>
        </Box>

        <Box
          sx={{
            px: { xs: 2.5, sm: 3 },
            py: 2,
            display: 'flex',
            justifyContent: 'flex-end',
            gap: 1.25,
            background: 'grey.50',
            borderTop: '1px solid divider'
          }}
        >
          <Button
            onClick={handleClose}
            disabled={loading}
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
            onClick={handleSave}
            variant='contained'
            disabled={loading || !name.trim()}
            sx={{
              textTransform: 'none',
              borderRadius: 999,
              backgroundColor: 'primary.main',
              fontWeight: 900,
              px: 3,
              boxShadow: 'none',
              '&:hover': { backgroundColor: 'primary.dark' },
              '&:disabled': { backgroundColor: 'divider', color: 'text.disabled' }
            }}
          >
            {loading ? (
              <CircularProgress
                size={18}
                sx={{ color: '#fff' }}
              />
            ) : (
              'Criar'
            )}
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
};
