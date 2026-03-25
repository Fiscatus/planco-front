import { useState } from 'react';
import {
  BusinessCenter as BusinessCenterIcon,
  CheckCircle as CheckCircleIcon,
  HourglassEmpty as HourglassIcon,
  PlayArrow as PlayArrowIcon,
  RemoveRedEye as ViewIcon,
  ArrowForward as AdvanceIcon,
  FastForward as FastForwardIcon,
} from '@mui/icons-material';
import { Box, Button, Chip, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, TextField, Typography } from '@mui/material';
import { useAdvanceStage } from '@/hooks/useFlowInstance';
import { useNotification } from '@/components/NotificationProvider';

export type StageStatus = 'completed' | 'in_progress' | 'pending';

export type ProcessStageProps = {
  order: number;
  title: string;
  department: string;
  status: StageStatus;
  additionalInfo?: string;
  onClick?: () => void;
  canAdvance?: boolean;
  instanceId?: string;
  onAdvanced?: () => void;
  wasAdvanced?: boolean;
};

export const ProcessStageCard = ({ order, title, department, status, additionalInfo, onClick, canAdvance, instanceId, onAdvanced, wasAdvanced }: ProcessStageProps) => {
  const [advanceOpen, setAdvanceOpen] = useState(false);
  const [reason, setReason] = useState('');
  const advanceMutation = useAdvanceStage();
  const { showNotification } = useNotification();

  const handleAdvance = () => {
    if (!instanceId) return;
    advanceMutation.mutate({ instanceId, reason: reason || undefined }, {
      onSuccess: () => {
        showNotification('Etapa avançada com sucesso!', 'success');
        setAdvanceOpen(false);
        setReason('');
        onAdvanced?.();
      },
      onError: (err: any) => {
        const msg = err?.response?.data?.message || 'Erro ao avançar etapa';
        showNotification(Array.isArray(msg) ? msg.join(', ') : msg, 'error');
      }
    });
  };

  // Card colors por status
  const cardBorder = wasAdvanced || status === 'completed'
    ? '1px solid #BBF7D0'
    : status === 'in_progress'
    ? '1px solid #BFDBFE'
    : '1px solid #E4E6EB';

  const cardBg = wasAdvanced || status === 'completed'
    ? '#F0FDF4'
    : status === 'in_progress'
    ? '#EFF6FF'
    : '#fff';

  const cardHoverBorder = wasAdvanced || status === 'completed'
    ? '#3bac4e'
    : status === 'in_progress'
    ? '#1877F2'
    : '#CBD5E1';

  // Bolinha
  const circleBg = status === 'completed' ? '#DCFCE7' : status === 'in_progress' ? '#1877F2' : '#F1F5F9';
  const circleColor = status === 'completed' ? '#16A34A' : status === 'in_progress' ? '#fff' : '#64748b';

  // Chip
  const chipMap = {
    completed: { label: 'Concluído', bg: '#DCFCE7', color: '#008832', icon: <CheckCircleIcon sx={{ fontSize: 16 }} /> },
    in_progress: { label: 'Em Andamento', bg: '#E7F3FF', color: '#1877F2', icon: <PlayArrowIcon sx={{ fontSize: 16 }} /> },
    pending: { label: 'Pendente', bg: '#F1F5F9', color: '#64748b', icon: <HourglassIcon sx={{ fontSize: 16 }} /> },
  };
  const chip = chipMap[status];

  // Botão
  const btnConfig = wasAdvanced
    ? { text: 'Ver Detalhes', variant: 'outlined' as const, icon: <ViewIcon sx={{ fontSize: 18 }} />, sx: { borderColor: '#16A34A', color: '#16A34A', '&:hover': { borderColor: '#15803D', bgcolor: '#F0FDF4' } } }
    : status === 'completed'
    ? { text: 'Ver Detalhes', variant: 'outlined' as const, icon: <ViewIcon sx={{ fontSize: 18 }} />, sx: { borderColor: '#16A34A', color: '#16A34A', '&:hover': { borderColor: '#15803D', bgcolor: '#F0FDF4' } } }
    : status === 'in_progress'
    ? { text: 'Acessar Etapa', variant: 'contained' as const, icon: <PlayArrowIcon sx={{ fontSize: 18 }} />, sx: { bgcolor: '#1877F2', color: '#fff', boxShadow: 'none', '&:hover': { bgcolor: '#166FE5', boxShadow: 'none' } } }
    : { text: 'Aguardando', variant: 'outlined' as const, icon: null, sx: { borderColor: '#E4E6EB', color: '#64748b', bgcolor: '#F8FAFC' } };

  return (
    <>
      <Box sx={{
        border: cardBorder, borderRadius: 3, p: 2.5, bgcolor: cardBg,
        display: 'flex', flexDirection: 'column', gap: 2, transition: 'all 0.2s',
        '&:hover': { borderColor: cardHoverBorder, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }
      }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box sx={{
            width: 36, height: 36, borderRadius: '50%',
            bgcolor: circleBg, color: circleColor,
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1rem'
          }}>
            {order}
          </Box>
          <Chip icon={chip.icon} label={chip.label} size='small'
            sx={{ bgcolor: chip.bg, color: chip.color, fontWeight: 700, fontSize: '0.75rem', height: 24, '& .MuiChip-icon': { color: chip.color } }} />
          {wasAdvanced && (
            <Chip icon={<FastForwardIcon sx={{ fontSize: 14 }} />} label='Avançada' size='small'
              sx={{ bgcolor: '#FEF3C7', color: '#92400E', fontWeight: 700, fontSize: '0.75rem', height: 24, '& .MuiChip-icon': { color: '#92400E' } }} />
          )}
        </Box>

        <Box sx={{ flex: 1 }}>
          <Typography variant='subtitle1' sx={{ fontWeight: 800, color: '#0f172a', mb: 1, lineHeight: 1.3 }}>{title}</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
            <BusinessCenterIcon sx={{ fontSize: 16, color: '#64748b' }} />
            <Typography variant='body2' sx={{ color: '#475569', fontWeight: 600 }}>{department}</Typography>
          </Box>
          {additionalInfo && (
            <Typography variant='caption' sx={{ color: status === 'pending' ? '#94a3b8' : '#64748b', display: 'block', mt: 1 }}>
              {additionalInfo}
            </Typography>
          )}
        </Box>

        <Button variant={btnConfig.variant} fullWidth onClick={onClick} startIcon={btnConfig.icon}
          sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 2, py: 1, ...btnConfig.sx }}>
          {btnConfig.text}
        </Button>

        {canAdvance && status === 'in_progress' && (
          <Button variant='outlined' fullWidth startIcon={<AdvanceIcon sx={{ fontSize: 18 }} />}
            onClick={() => setAdvanceOpen(true)}
            sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 2, py: 1, borderColor: '#16A34A', color: '#16A34A', '&:hover': { borderColor: '#15803D', bgcolor: '#F0FDF4' } }}>
            Avançar Etapa
          </Button>
        )}
      </Box>

      <Dialog open={advanceOpen} onClose={() => setAdvanceOpen(false)} maxWidth='xs' fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 700, fontSize: '1.1rem', color: '#0f172a' }}>Avançar Etapa</DialogTitle>
        <DialogContent>
          <Typography variant='body2' sx={{ color: '#64748b', mb: 2 }}>
            Deseja avançar a etapa <strong>{title}</strong>? Se não houver dados preenchidos, informe o motivo.
          </Typography>
          <TextField fullWidth multiline rows={3} label='Motivo (opcional)'
            value={reason} onChange={(e) => setReason(e.target.value)}
            placeholder='Descreva o motivo para avançar...' />
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => setAdvanceOpen(false)} variant='outlined' sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 2 }}>
            Cancelar
          </Button>
          <Button onClick={handleAdvance} variant='contained' disabled={advanceMutation.isPending}
            startIcon={advanceMutation.isPending ? <CircularProgress size={16} /> : <AdvanceIcon />}
            sx={{ bgcolor: '#16A34A', textTransform: 'none', fontWeight: 700, borderRadius: 2, '&:hover': { bgcolor: '#15803D' } }}>
            {advanceMutation.isPending ? 'Avançando...' : 'Confirmar'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
