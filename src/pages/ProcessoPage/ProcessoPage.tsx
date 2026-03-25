import { Box, Typography } from '@mui/material';
import { useParams } from 'react-router-dom';
import { Loading } from '@/components';
import { useFlowInstance } from '@/hooks';
import { useAuth } from '@/hooks';
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

  const { data: flowInstance, isLoading, error } = useFlowInstance(processId);
  const { user } = useAuth();

  const canAdvance = !!user && !!flowInstance && (
    flowInstance.process.createdBy === user._id || user.isPlatformAdmin
  );

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

  if (error || !flowInstance) {
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
          {error instanceof Error ? error.message : 'Falha ao carregar o processo.'}
        </Typography>
      </Box>
    );
  }

  const stages = flowInstance.snapshotStages
    .filter(stage => !stage.isOptional || flowInstance.stageExecutions.some(exec => exec.stageId === stage.stageId))
    .sort((a, b) => a.order - b.order)
    .map((stage) => {
      const execution = flowInstance.stageExecutions.find(exec => exec.stageId === stage.stageId);
      const executionStatus = execution?.status;
      
      let status: 'completed' | 'in_progress' | 'pending' = 'pending';
      if (executionStatus === 'APPROVED' || executionStatus === 'COMPLETED') {
        status = 'completed';
      } else if (executionStatus === 'IN_PROGRESS' || executionStatus === 'WAITING_APPROVAL') {
        status = 'in_progress';
      }

      const advancedLog = execution?.auditLogs?.find((log: any) => log.action === 'ADVANCED');
      const wasAdvanced = !!advancedLog;

      return {
        id: stage.stageId,
        order: stage.order,
        stageId: stage.stageId,
        stageInstanceId: flowInstance._id,
        title: stage.name,
        department: stage.approverRoles?.[0] || 'Não informado',
        status,
        wasAdvanced,
        advancedReason: advancedLog?.reason,
        additionalInfo: executionStatus === 'WAITING_APPROVAL' ? 'Aguardando aprovação' : 
                        wasAdvanced ? `Avançada manualmente${advancedLog?.reason ? `: ${advancedLog.reason}` : ''}` :
                        status === 'completed' ? 'Etapa concluída' :
                        status === 'in_progress' ? 'Etapa atual' : 'Aguardando etapa anterior',
        components: stage.components.map(comp => ({
          componentKey: comp.key,
          componentType: comp.type as any,
          label: comp.label,
          required: comp.required,
          processId: flowInstance.process._id,
          instanceId: flowInstance._id,
          stageId: stage.stageId
        }))
      };
    });

  const completedStages = stages.filter((stage) => stage.status === 'completed').length;
  const totalStages = stages.length;
  const progress = totalStages > 0 ? Math.round((completedStages / totalStages) * 100) : 0;

  const processTitle = flowInstance.process.processNumber;
  const processSubtitle = flowInstance.process.object;
  const processStatus = flowInstance.process.status;

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
          isOwner={canAdvance}
        />

        <ProcessInfoCards />

        <ProcessProgress
          progress={progress}
          completedStages={completedStages}
          totalStages={totalStages}
        />

        <ProcessStagesSection 
          stages={stages} 
          processId={flowInstance.process._id}
          instanceId={flowInstance._id}
          canAdvance={canAdvance}
        />

        <RelatedDocuments processId={flowInstance.process._id} />

        <ActionHistory stageExecutions={flowInstance.stageExecutions} snapshotStages={flowInstance.snapshotStages} />
      </Box>
    </Box>
  );
};

export default ProcessoPage;
