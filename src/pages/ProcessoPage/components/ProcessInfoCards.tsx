import { useState } from 'react';
import { Box, Typography, IconButton } from '@mui/material';
import { Folder as FolderIcon, Schedule as ScheduleIcon, Warning as WarningIcon, ExpandMore as ExpandMoreIcon } from '@mui/icons-material';
import type { FlowInstance } from '@/hooks/useFlowInstance';
import { ProcessoInfoModal } from './ProcessoInfoModal';
import { ProcessDeadlinesModal } from './ProcessDeadlinesModal';
import { ProcessPendenciesModal } from './ProcessPendenciesModal';

type Props = {
  flowInstance: FlowInstance;
  stages: Array<{
    title: string;
    status: 'completed' | 'in_progress' | 'pending';
    departments: (string | { _id: string; department_name: string; department_acronym: string })[];
    order: number;
    startedAt?: string;
    completedAt?: string;
    businessDaysDuration?: number;
    dueDate?: string;
  }>;
};

export const ProcessInfoCards = ({ flowInstance, stages }: Props) => {
  const [infoOpen, setInfoOpen] = useState(false);
  const [deadlinesOpen, setDeadlinesOpen] = useState(false);
  const [pendenciesOpen, setPendenciesOpen] = useState(false);

  const addBusinessDays = (start: string, days: number): Date => {
    const date = new Date(start);
    let added = 0;
    while (added < days) {
      date.setDate(date.getDate() + 1);
      if (date.getDay() !== 0 && date.getDay() !== 6) added++;
    }
    return date;
  };

  const isOverdue = (stage: typeof stages[0]) => {
    if (stage.status === 'completed') return false;
    const due = stage.dueDate
      ? new Date(stage.dueDate)
      : stage.startedAt && stage.businessDaysDuration
      ? addBusinessDays(stage.startedAt, stage.businessDaysDuration)
      : null;
    return !!due && due.getTime() < Date.now();
  };

  const overdueCount = stages.filter(isOverdue).length;

  const currentStage = stages.find(s => s.status === 'in_progress');
  const completedCount = stages.filter(s => s.status === 'completed').length;

  return (
    <>
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2, mb: 4 }}>
        {/* Card: Processo */}
        <Box onClick={() => setInfoOpen(true)} sx={{ bgcolor: '#fff', border: '1px solid #E4E6EB', borderRadius: 3, p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', '&:hover': { borderColor: '#1877F2', bgcolor: '#F0F9FF' } }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ width: 40, height: 40, borderRadius: 2, bgcolor: '#E7F3FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FolderIcon sx={{ color: '#1877F2' }} />
            </Box>
            <Box>
              <Typography variant='body2' sx={{ color: '#64748b', fontWeight: 600 }}>Processo</Typography>
              <Typography variant='subtitle1' sx={{ color: '#0f172a', fontWeight: 800 }}>{flowInstance.process.processNumber}</Typography>
            </Box>
          </Box>
          <IconButton size='small'><ExpandMoreIcon sx={{ color: '#64748b' }} /></IconButton>
        </Box>

        {/* Card: Controle de Prazos */}
        <Box onClick={() => setDeadlinesOpen(true)} sx={{ bgcolor: '#fff', border: '1px solid #E4E6EB', borderRadius: 3, p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', '&:hover': { borderColor: '#1877F2', bgcolor: '#F0F9FF' } }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ width: 40, height: 40, borderRadius: 2, bgcolor: '#F8FAFC', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ScheduleIcon sx={{ color: '#64748b' }} />
            </Box>
            <Box>
              <Typography variant='body2' sx={{ color: '#64748b', fontWeight: 600 }}>Controle de Prazos</Typography>
              <Typography variant='subtitle1' sx={{ color: '#0f172a', fontWeight: 800 }}>
                {currentStage?.title ?? 'Nenhuma etapa ativa'}
              </Typography>
            </Box>
          </Box>
          <IconButton size='small'><ExpandMoreIcon sx={{ color: '#64748b' }} /></IconButton>
        </Box>

        {/* Card: Pendências */}
        <Box onClick={() => setPendenciesOpen(true)} sx={{ bgcolor: overdueCount > 0 ? '#FFF1F3' : '#fff', border: `1px solid ${overdueCount > 0 ? '#F02849' : '#E4E6EB'}`, borderRadius: 3, p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', '&:hover': { bgcolor: overdueCount > 0 ? '#FFE4E6' : '#F0F9FF' } }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ width: 40, height: 40, borderRadius: 2, bgcolor: overdueCount > 0 ? '#F02849' : '#F0F2F5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <WarningIcon sx={{ color: overdueCount > 0 ? '#fff' : '#64748b' }} />
            </Box>
            <Box>
              <Typography variant='body2' sx={{ color: overdueCount > 0 ? '#F02849' : '#64748b', fontWeight: 600 }}>Pendências</Typography>
              <Typography variant='subtitle1' sx={{ color: overdueCount > 0 ? '#F02849' : '#0f172a', fontWeight: 800 }}>
                {overdueCount > 0 ? `${overdueCount} Em Atraso` : 'Sem atrasos'}
              </Typography>
            </Box>
          </Box>
          <IconButton size='small'><ExpandMoreIcon sx={{ color: overdueCount > 0 ? '#F02849' : '#64748b' }} /></IconButton>
        </Box>
      </Box>

      <ProcessoInfoModal open={infoOpen} onClose={() => setInfoOpen(false)} flowInstance={flowInstance} currentStage={currentStage} />
      <ProcessDeadlinesModal open={deadlinesOpen} onClose={() => setDeadlinesOpen(false)} stages={stages} completedCount={completedCount} />
      <ProcessPendenciesModal open={pendenciesOpen} onClose={() => setPendenciesOpen(false)} stages={stages} flowInstance={flowInstance} />
    </>
  );
};
