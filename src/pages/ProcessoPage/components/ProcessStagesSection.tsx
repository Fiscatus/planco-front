import { Box, Typography } from '@mui/material';
import type { ProcessFlowStageCard } from '@/globals/types';
import { ProcessStageCard, type StageStatus } from './ProcessStageCard';

type ProcessStagesSectionProps = {
  stages: ProcessFlowStageCard[];
};

export const ProcessStagesSection = ({ stages }: ProcessStagesSectionProps) => {
  const getStageStatus = (status: ProcessFlowStageCard['status']): StageStatus => {
    if (status === 'completed' || status === 'in_progress' || status === 'pending') {
      return status;
    }

    return 'pending';
  };

  return (
    <Box sx={{ mb: 6 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography
          variant='h6'
          sx={{ fontWeight: 800, color: '#0f172a' }}
        >
          Fluxo Completo do Processo
        </Typography>
        <Typography
          variant='body2'
          sx={{ color: '#64748b', fontWeight: 600 }}
        >
          {stages.length} etapas
        </Typography>
      </Box>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: 2
        }}
      >
        {stages.map((stage) => (
          <ProcessStageCard
            key={stage.id}
            order={stage.order}
            title={stage.title}
            department={stage.department}
            status={getStageStatus(stage.status)}
            additionalInfo={stage.additionalInfo}
          />
        ))}
      </Box>
    </Box>
  );
};
