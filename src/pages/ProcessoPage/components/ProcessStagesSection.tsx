import { Box, Typography } from '@mui/material';
import { ProcessStageCard, type StageStatus } from './ProcessStageCard';

type StageMock = {
  id: string;
  order: number;
  title: string;
  department: string;
  status: StageStatus;
  additionalInfo?: string;
};

const MOCK_STAGES: StageMock[] = [
  {
    id: '1',
    order: 1,
    title: 'Análise Inicial da Demanda',
    department: 'Diretoria Clínica',
    status: 'completed',
    additionalInfo: 'Concluído em 15/10/2023'
  },
  {
    id: '2',
    order: 2,
    title: 'Elaboração do DFD',
    department: 'Setor de Compras',
    status: 'in_progress',
    additionalInfo: 'Prazo: 22/10/2023'
  },
  {
    id: '3',
    order: 3,
    title: 'Aprovação do DFD',
    department: 'Diretoria Administrativa',
    status: 'pending',
    additionalInfo: 'Esperando etapa anterior'
  },
  {
    id: '4',
    order: 4,
    title: 'Estudo Técnico Preliminar (ETP)',
    department: 'Engenharia Clínica',
    status: 'pending',
    additionalInfo: 'Esperando etapa anterior'
  },
  {
    id: '5',
    order: 5,
    title: 'Aprovação do ETP',
    department: 'Diretoria Técnica',
    status: 'pending',
    additionalInfo: 'Esperando etapa anterior'
  }
];

export const ProcessStagesSection = () => {
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
          {MOCK_STAGES.length} etapas
        </Typography>
      </Box>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: 2
        }}
      >
        {MOCK_STAGES.map((stage) => (
          <ProcessStageCard
            key={stage.id}
            order={stage.order}
            title={stage.title}
            department={stage.department}
            status={stage.status}
            additionalInfo={stage.additionalInfo}
          />
        ))}
      </Box>
    </Box>
  );
};
