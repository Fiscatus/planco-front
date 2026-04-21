import { Box, Chip, Dialog, DialogContent, IconButton, Typography } from '@mui/material';
import { Close as CloseIcon, Warning as WarningIcon, HourglassEmpty as HourglassIcon, PlayArrow as PlayArrowIcon } from '@mui/icons-material';
import type { FlowInstance } from '@/hooks/useFlowInstance';

type Stage = {
  title: string;
  status: 'completed' | 'in_progress' | 'pending';
  departments: (string | { _id: string; department_name: string; department_acronym: string })[];
  order: number;
  dueDate?: string;
  startedAt?: string;
  businessDaysDuration?: number;
};

type Props = {
  open: boolean;
  onClose: () => void;
  stages: Stage[];
  flowInstance: FlowInstance;
};

const fmt = (d?: string) => d ? new Date(d).toLocaleDateString('pt-BR') : '—';

const addBusinessDays = (start: string, days: number): Date => {
  const date = new Date(start);
  let added = 0;
  while (added < days) {
    date.setDate(date.getDate() + 1);
    const dow = date.getDay();
    if (dow !== 0 && dow !== 6) added++;
  }
  return date;
};

const getEffectiveDueDate = (stage: Stage): Date | null => {
  if (stage.dueDate) return new Date(stage.dueDate);
  if (stage.startedAt && stage.businessDaysDuration && stage.businessDaysDuration > 0)
    return addBusinessDays(stage.startedAt, stage.businessDaysDuration);
  return null;
};

const getDeadlineStatus = (stage: Stage): { label: string; bg: string; color: string } | null => {
  if (stage.status === 'completed') return null;
  const due = getEffectiveDueDate(stage);
  if (!due) return null;
  const diffDays = Math.ceil((due.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  if (diffDays < 0)  return { label: 'Atrasado',         bg: '#FEE2E2', color: '#B91C1C' };
  if (diffDays <= 3) return { label: 'Próximo do Prazo', bg: '#FEF3C7', color: '#92400E' };
  return { label: 'Dentro do Prazo', bg: '#DCFCE7', color: '#16A34A' };
};

const stageStatusConfig = {
  in_progress: { label: 'Em Andamento', bg: '#E7F3FF', color: '#1877F2', icon: <PlayArrowIcon sx={{ fontSize: 12 }} /> },
  pending:     { label: 'Pendente',     bg: '#F1F5F9', color: '#64748b', icon: <HourglassIcon sx={{ fontSize: 12 }} /> },
};

export const ProcessPendenciesModal = ({ open, onClose, stages }: Props) => {
  const pendingStages = stages
    .filter(s => s.status === 'pending' || s.status === 'in_progress')
    .sort((a, b) => {
      // Ordena: atrasado > próximo > em andamento > pendente
      const deadlineOrder = (s: Stage) => {
        const dl = getDeadlineStatus(s);
        if (!dl) return 3;
        if (dl.label === 'Atrasado') return 0;
        if (dl.label === 'Próximo do Prazo') return 1;
        return 2;
      };
      return deadlineOrder(a) - deadlineOrder(b);
    });

  const overdueCount = pendingStages.filter(s => getDeadlineStatus(s)?.label === 'Atrasado').length;
  const nearCount    = pendingStages.filter(s => getDeadlineStatus(s)?.label === 'Próximo do Prazo').length;
  const inProgressCount = pendingStages.filter(s => s.status === 'in_progress').length;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth='sm' PaperProps={{ sx: { borderRadius: 3, maxHeight: '85vh' } }}>
      <Box sx={{ px: 3, py: 2.5, borderBottom: '1px solid #E4E6EB', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box sx={{ width: 36, height: 36, borderRadius: 2, bgcolor: overdueCount > 0 ? '#F02849' : '#F0F2F5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <WarningIcon sx={{ color: overdueCount > 0 ? '#fff' : '#64748b', fontSize: 20 }} />
          </Box>
          <Box>
            <Typography sx={{ fontWeight: 800, color: '#0f172a', fontSize: '1.1rem' }}>Pendências</Typography>
            <Box sx={{ display: 'flex', gap: 1, mt: 0.25, flexWrap: 'wrap' }}>
              {overdueCount > 0    && <Chip label={`${overdueCount} Atrasada${overdueCount > 1 ? 's' : ''}`}       size='small' sx={{ bgcolor: '#FEE2E2', color: '#B91C1C', fontWeight: 700, fontSize: '0.7rem', height: 20 }} />}
              {nearCount > 0       && <Chip label={`${nearCount} Próxima${nearCount > 1 ? 's' : ''} do Prazo`}     size='small' sx={{ bgcolor: '#FEF3C7', color: '#92400E', fontWeight: 700, fontSize: '0.7rem', height: 20 }} />}
              {inProgressCount > 0 && <Chip label={`${inProgressCount} Em Andamento`}                              size='small' sx={{ bgcolor: '#E7F3FF', color: '#1877F2', fontWeight: 700, fontSize: '0.7rem', height: 20 }} />}
              <Chip label={`${pendingStages.length} total`} size='small' sx={{ bgcolor: '#F1F5F9', color: '#64748b', fontWeight: 700, fontSize: '0.7rem', height: 20 }} />
            </Box>
          </Box>
        </Box>
        <IconButton onClick={onClose} size='small'><CloseIcon /></IconButton>
      </Box>

      <DialogContent sx={{ p: 0 }}>
        {pendingStages.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8, color: '#94a3b8' }}>
            <HourglassIcon sx={{ fontSize: 48, mb: 1 }} />
            <Typography variant='body2'>Nenhuma pendência encontrada</Typography>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            {pendingStages.map((stage, idx) => {
              const stCfg = stageStatusConfig[stage.status as 'in_progress' | 'pending'];
              const deadlineCfg = getDeadlineStatus(stage);
              const effectiveDue = getEffectiveDueDate(stage);

              return (
                <Box key={idx} sx={{ px: 3, py: 2, borderBottom: '1px solid #F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, '&:hover': { bgcolor: '#FAFBFC' } }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 0 }}>
                    <Box sx={{ width: 28, height: 28, borderRadius: '50%', bgcolor: stCfg.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      {stCfg.icon}
                    </Box>
                    <Box sx={{ minWidth: 0 }}>
                      <Typography sx={{ fontWeight: 700, color: '#0f172a', fontSize: '0.9rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {stage.title}
                      </Typography>
                      <Typography variant='caption' sx={{ color: '#64748b', fontWeight: 600 }}>
                        {stage.departments.map(d => typeof d === 'object' ? `${d.department_acronym} - ${d.department_name}` : d).join(' • ') || '—'}
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 0.5, flexShrink: 0 }}>
                    {/* Status da etapa */}
                    <Chip
                      label={stCfg.label}
                      size='small'
                      sx={{ bgcolor: stCfg.bg, color: stCfg.color, fontWeight: 700, fontSize: '0.7rem', height: 20 }}
                    />
                    {/* Status do prazo */}
                    {deadlineCfg && (
                      <Chip
                        label={deadlineCfg.label}
                        size='small'
                        sx={{ bgcolor: deadlineCfg.bg, color: deadlineCfg.color, fontWeight: 700, fontSize: '0.7rem', height: 20 }}
                      />
                    )}
                    {effectiveDue && (
                      <Typography variant='caption' sx={{ color: '#94a3b8', fontWeight: 600 }}>
                        Prazo: {fmt(effectiveDue.toISOString())}
                      </Typography>
                    )}
                  </Box>
                </Box>
              );
            })}
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
};
