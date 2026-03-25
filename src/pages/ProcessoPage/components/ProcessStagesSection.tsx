import { useState } from 'react';
import { Box, Typography } from '@mui/material';
import type { ProcessFlowStageCard } from '@/globals/types';
import { ProcessStageCard, type StageStatus } from './ProcessStageCard';
import { ProcessStageModal } from './ProcessStageModal';

type ProcessStagesSectionProps = {
  stages: ProcessFlowStageCard[];
  processId: string;
  instanceId: string;
  canAdvance?: boolean;
};

export const ProcessStagesSection = ({ stages, processId, instanceId, canAdvance }: ProcessStagesSectionProps) => {
  const [selectedStage, setSelectedStage] = useState<ProcessFlowStageCard | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStageStatus, setSelectedStageStatus] = useState<'completed' | 'in_progress' | 'pending'>('pending');

  const getStageStatus = (status: ProcessFlowStageCard['status']): StageStatus => {
    if (status === 'completed' || status === 'in_progress' || status === 'pending') {
      return status;
    }

    return 'pending';
  };

  const handleStageClick = (stage: ProcessFlowStageCard) => {
    setSelectedStage(stage);
    setSelectedStageStatus(getStageStatus(stage.status));
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedStage(null);
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
            onClick={() => handleStageClick(stage)}
            canAdvance={canAdvance}
            instanceId={instanceId}
            onAdvanced={handleCloseModal}
            wasAdvanced={stage.wasAdvanced}
          />
        ))}
      </Box>

      <ProcessStageModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        stage={selectedStage}
        processId={processId}
        instanceId={instanceId}
        stageStatus={selectedStageStatus}
        canManage={canAdvance}
      />
    </Box>
  );
};
