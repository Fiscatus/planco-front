import { Box, Typography } from '@mui/material';
import { useParams } from 'react-router-dom';
import { Loading } from '@/components';
import { useProcessFlowState } from '@/hooks';
import {
  ActionHistory,
  ProcessHeader,
  ProcessInfoCards,
  ProcessProgress,
  ProcessStagesSection,
  RelatedDocuments
} from './components';

const ProcessoPage = () => {
  const { id: processId } = useParams<{ id: string }>();

  const { data: processFlowState, isLoading, error } = useProcessFlowState(processId);

  const isOwner = true;

  if (!processId) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          bgcolor: '#F8FAFC',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          px: 3
        }}
      >
        <Typography
          variant='h6'
          sx={{ color: '#b91c1c', textAlign: 'center', fontWeight: 700 }}
        >
          Processo não encontrado na URL.
        </Typography>
      </Box>
    );
  }

  if (isLoading) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          bgcolor: '#F8FAFC',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <Loading isLoading={true} />
      </Box>
    );
  }

  if (error || !processFlowState) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          bgcolor: '#F8FAFC',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          px: 3
        }}
      >
        <Typography
          variant='h6'
          sx={{ color: '#b91c1c', textAlign: 'center', fontWeight: 700 }}
        >
          {error instanceof Error ? error.message : 'Falha ao carregar o fluxo do processo.'}
        </Typography>
      </Box>
    );
  }

  const stages = processFlowState.stages;
  const completedStages = stages.filter((stage) => stage.status === 'completed').length;
  const totalStages = stages.length;
  const progress = totalStages > 0 ? Math.round((completedStages / totalStages) * 100) : 0;

  const processTitle = processFlowState.process.processNumber || processFlowState.process._id;
  const processSubtitle = processFlowState.process.object || 'Objeto não informado';
  const processStatus = processFlowState.process.status || 'Em Andamento';

  const staleComponentsCount = processFlowState.staleComponentInstanceKeys.length;
  const componentErrorsCount = Object.keys(processFlowState.componentErrorsByInstanceKey).length;

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
          title={processTitle}
          subtitle={processSubtitle}
          status={processStatus}
          isOwner={isOwner}
        />

        {(staleComponentsCount > 0 || componentErrorsCount > 0) && (
          <Box
            sx={{
              mb: 3,
              p: 2,
              borderRadius: 2,
              border: '1px solid #FCD34D',
              bgcolor: '#FFFBEB'
            }}
          >
            <Typography
              variant='body2'
              sx={{ color: '#92400E', fontWeight: 600 }}
            >
              {staleComponentsCount > 0
                ? `${staleComponentsCount} componente(s) retornaram snapshot desatualizado.`
                : null}
              {staleComponentsCount > 0 && componentErrorsCount > 0 ? ' ' : null}
              {componentErrorsCount > 0
                ? `${componentErrorsCount} componente(s) falharam ao carregar (mantidos para retry).`
                : null}
            </Typography>
          </Box>
        )}

        <ProcessInfoCards />

        <ProcessProgress
          progress={progress}
          completedStages={completedStages}
          totalStages={totalStages}
        />

        <ProcessStagesSection stages={stages} />

        <ActionHistory />

        <RelatedDocuments />
      </Box>
    </Box>
  );
};

export default ProcessoPage;
