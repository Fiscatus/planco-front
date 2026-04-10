import { Box, Chip, Dialog, DialogContent, IconButton, Typography } from '@mui/material';
import { Close as CloseIcon, Schedule as ScheduleIcon, CheckCircle as CheckCircleIcon, PlayArrow as PlayArrowIcon, HourglassEmpty as HourglassIcon } from '@mui/icons-material';

type Stage = {
  title: string;
  status: 'completed' | 'in_progress' | 'pending';
  departments: (string | { _id: string; department_name: string; department_acronym: string })[];
  order: number;
  startedAt?: string;
  completedAt?: string;
  businessDaysDuration?: number;
  dueDate?: string;
};

type Props = {
  open: boolean;
  onClose: () => void;
  stages: Stage[];
  completedCount: number;
};

const statusConfig = {
  completed:  { label: 'Concluído',   bg: '#DCFCE7', color: '#16A34A', icon: <CheckCircleIcon sx={{ fontSize: 14 }} /> },
  in_progress:{ label: 'Andamento',   bg: '#E7F3FF', color: '#1877F2', icon: <PlayArrowIcon   sx={{ fontSize: 14 }} /> },
  pending:    { label: 'Pendente',    bg: '#F1F5F9', color: '#64748b', icon: <HourglassIcon   sx={{ fontSize: 14 }} /> },
};

const fmt = (d?: string) => d ? new Date(d).toLocaleDateString('pt-BR') : '—';

// Adiciona N dias úteis a uma data (pula sábado e domingo)
const addBusinessDays = (start: string, days: number): string => {
  const date = new Date(start);
  let added = 0;
  while (added < days) {
    date.setDate(date.getDate() + 1);
    const dow = date.getDay();
    if (dow !== 0 && dow !== 6) added++;
  }
  return date.toISOString();
};

const getEffectiveDueDate = (stage: Stage): string | undefined => {
  if (stage.dueDate) return stage.dueDate;
  if (stage.startedAt && stage.businessDaysDuration && stage.businessDaysDuration > 0)
    return addBusinessDays(stage.startedAt, stage.businessDaysDuration);
  return undefined;
};

const getDeadlineStatus = (stage: Stage) => {
  if (stage.status === 'completed') return null;
  const due = getEffectiveDueDate(stage);
  if (!due) return null;
  const diffDays = Math.ceil((new Date(due).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  if (diffDays < 0)  return { label: 'Atrasado',          bg: '#FEE2E2', color: '#B91C1C' };
  if (diffDays <= 3) return { label: 'Próximo do Prazo',  bg: '#FEF3C7', color: '#92400E' };
  return { label: 'Dentro do Prazo', bg: '#DCFCE7', color: '#16A34A' };
};

export const ProcessDeadlinesModal = ({ open, onClose, stages, completedCount }: Props) => {
  const pendingCount = stages.filter(s => s.status === 'pending').length;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth='md' PaperProps={{ sx: { borderRadius: 3, maxHeight: '85vh' } }}>
      <Box sx={{ px: 3, py: 2.5, borderBottom: '1px solid #E4E6EB', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box sx={{ width: 36, height: 36, borderRadius: 2, bgcolor: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ScheduleIcon sx={{ color: '#64748b', fontSize: 20 }} />
          </Box>
          <Box>
            <Typography sx={{ fontWeight: 800, color: '#0f172a', fontSize: '1.1rem' }}>Controle de Prazos das Etapas</Typography>
            <Box sx={{ display: 'flex', gap: 1, mt: 0.25 }}>
              <Chip label={`${completedCount} Concluídas`} size='small' sx={{ bgcolor: '#DCFCE7', color: '#16A34A', fontWeight: 700, fontSize: '0.7rem', height: 20 }} />
              <Chip label={`${pendingCount} Pendentes`}    size='small' sx={{ bgcolor: '#F1F5F9', color: '#64748b', fontWeight: 700, fontSize: '0.7rem', height: 20 }} />
              <Chip label={`${stages.length} etapas`}      size='small' sx={{ bgcolor: '#E7F3FF', color: '#1877F2', fontWeight: 700, fontSize: '0.7rem', height: 20 }} />
            </Box>
          </Box>
        </Box>
        <IconButton onClick={onClose} size='small'><CloseIcon /></IconButton>
      </Box>

      {/* Header da tabela */}
      <Box sx={{ px: 3, py: 1.5, bgcolor: '#F8FAFC', borderBottom: '1px solid #E4E6EB', display: 'grid', gridTemplateColumns: '2fr 1.5fr 1fr 1fr 1fr 1fr', gap: 1, flexShrink: 0 }}>
        {['Etapa', 'Gerência', 'Início', 'Prazo Final', 'Dias Úteis', 'Status Prazo'].map(h => (
          <Typography key={h} variant='caption' sx={{ color: '#64748b', fontWeight: 700, textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: '0.05em' }}>{h}</Typography>
        ))}
      </Box>

      <DialogContent sx={{ p: 0, overflow: 'auto' }}>
        {stages.map((stage, idx) => {
          const st = statusConfig[stage.status];
          const dl = getDeadlineStatus(stage);
          return (
            <Box key={idx} sx={{ px: 3, py: 1.75, display: 'grid', gridTemplateColumns: '2fr 1.5fr 1fr 1fr 1fr 1fr', gap: 1, alignItems: 'center', borderBottom: '1px solid #F1F5F9', '&:hover': { bgcolor: '#FAFBFC' } }}>
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.25 }}>
                  <Chip icon={st.icon} label={st.label} size='small' sx={{ bgcolor: st.bg, color: st.color, fontWeight: 700, fontSize: '0.7rem', height: 20, '& .MuiChip-icon': { color: st.color } }} />
                </Box>
                <Typography sx={{ fontWeight: 700, color: '#0f172a', fontSize: '0.875rem' }}>{stage.title}</Typography>
              </Box>
              <Typography sx={{ color: '#64748b', fontSize: '0.8rem', fontWeight: 600 }}>{stage.departments.map(d => typeof d === 'object' ? `${d.department_acronym} - ${d.department_name}` : d).join(' • ') || '—'}</Typography>
              <Typography sx={{ color: '#64748b', fontSize: '0.8rem' }}>{fmt(stage.startedAt)}</Typography>
              <Typography sx={{ color: '#64748b', fontSize: '0.8rem' }}>{fmt(getEffectiveDueDate(stage))}</Typography>
              <Typography sx={{ color: '#64748b', fontSize: '0.8rem' }}>
                {stage.businessDaysDuration ? `${stage.businessDaysDuration} dias` : '—'}
              </Typography>
              <Box>
                {dl ? (
                  <Chip label={dl.label} size='small' sx={{ bgcolor: dl.bg, color: dl.color, fontWeight: 700, fontSize: '0.7rem', height: 20 }} />
                ) : stage.status === 'completed' ? (
                  <Typography sx={{ color: '#16A34A', fontSize: '0.8rem', fontWeight: 700 }}>{fmt(stage.completedAt)}</Typography>
                ) : (
                  <Typography sx={{ color: '#94a3b8', fontSize: '0.8rem' }}>—</Typography>
                )}
              </Box>
            </Box>
          );
        })}
      </DialogContent>

      <Box sx={{ px: 3, py: 1.5, borderTop: '1px solid #E4E6EB', bgcolor: '#F8FAFC', flexShrink: 0 }}>
        <Typography variant='caption' sx={{ color: '#94a3b8' }}>Role para ver todas as etapas</Typography>
      </Box>
    </Dialog>
  );
};
