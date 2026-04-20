import { Box, Typography } from '@mui/material';
import { useParams } from 'react-router-dom';
import { Loading } from '@/components';
import { useFlowInstance } from '@/hooks';
import { useAuth } from '@/hooks';
import { useFlowInstanceSSE } from '@/hooks/useFlowInstanceSSE';
import { useState } from 'react';
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

  const [stageFilters, setStageFilters] = useState<{ stageName?: string; departmentId?: string; status?: string }>({});

  const { data: flowInstance, isLoading, error } = useFlowInstance(processId, stageFilters);
  const { user } = useAuth();

  useFlowInstanceSSE(flowInstance?._id, processId);

  const createdById = typeof flowInstance?.process.createdBy === 'object'
    ? flowInstance.process.createdBy._id
    : flowInstance?.process.createdBy;

  const isManager = flowInstance?.process.managers?.some(m =>
    (typeof m === 'object' ? m._id : m) === user?._id
  ) ?? false;

  const canAdvance = !!user && !!flowInstance && (
    createdById === user._id || user.isPlatformAdmin || isManager
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

  if (isLoading && !flowInstance) {
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
      const lastRelevantLog = execution?.auditLogs
        ?.filter((log: any) => log.action === 'ADVANCED' || log.action === 'ROLLED_BACK')
        .sort((a: any, b: any) => (a.performedAt > b.performedAt ? 1 : -1))
        .at(-1);
      const wasAdvanced = !!advancedLog && lastRelevantLog?.action === 'ADVANCED';

      return {
        id: stage.stageId,
        order: stage.order,
        stageId: stage.stageId,
        stageInstanceId: flowInstance._id,
        title: stage.name,
        departments: (() => {
          const depts = stage.responsibleDepartments || [];
          if (depts.length > 0) {
            return depts.map(d =>
              d && typeof d === 'object' ? `${d.department_acronym} - ${d.department_name}` : d || 'Não informado'
            );
          }
          // fallback: gerência criadora
          const creator = flowInstance.process.creatorDepartment;
          const creatorStr = creator && typeof creator === 'object'
            ? `${creator.department_acronym} - ${creator.department_name}`
            : creator || 'Não informado';
          return [creatorStr];
        })(),
        status,
        wasAdvanced,
        advancedReason: advancedLog?.reason,
        businessDaysDuration: stage.businessDaysDuration,
        startedAt: execution?.startedAt,
        completedAt: execution?.completedAt,
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

  // Departamentos únicos de todas as etapas do snapshot (para o filtro)
  const allDepartments = flowInstance
    ? Array.from(
        new Map(
          flowInstance.snapshotStages
            .flatMap(s => (s.responsibleDepartments ?? []) as any[])
            .filter(d => d && typeof d === 'object' && d._id)
            .map(d => [d._id, d])
        ).values()
      )
    : [];

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
          flowInstance={flowInstance}
        />

        <ProcessInfoCards flowInstance={flowInstance} stages={stages} />

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
          canRollback={canAdvance}
          departments={allDepartments}
          filters={stageFilters}
          onFilterChange={setStageFilters}
        />

        <RelatedDocuments processId={flowInstance.process._id} />

        <ActionHistory
          stageExecutions={flowInstance.stageExecutions}
          snapshotStages={flowInstance.snapshotStages}
          stages={stages}
          processId={flowInstance.process._id}
          instanceId={flowInstance._id}
        />
      </Box>
    </Box>
  );
};

export default ProcessoPage;
