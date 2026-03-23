import { Box } from '@mui/material';
import { useParams } from 'react-router-dom';
import {
  ActionHistory,
  ProcessHeader,
  ProcessInfoCards,
  ProcessProgress,
  ProcessStagesSection,
  RelatedDocuments
} from './components';

const ProcessoPage = () => {
  const { id: _processId } = useParams<{ id: string }>();

  const isOwner = true;

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: '#F8FAFC',
        py: 3,
        px: { xs: 2, md: 4 }
      }}
    >
      <Box sx={{ maxWidth: 1600, mx: 'auto' }}>
        <ProcessHeader
          title='012/2025'
          subtitle='Aquisição de Equipamentos Médicos para UTI'
          status='Em Andamento'
          isOwner={isOwner}
        />

        <ProcessInfoCards />

        <ProcessProgress
          progress={20}
          completedStages={2}
          totalStages={10}
        />

        <ProcessStagesSection />

        <ActionHistory />

        <RelatedDocuments />
      </Box>
    </Box>
  );
};

export default ProcessoPage;
