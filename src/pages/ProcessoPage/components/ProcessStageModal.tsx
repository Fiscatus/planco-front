import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Box, Chip, Dialog, DialogContent, IconButton, Tooltip, Typography } from '@mui/material';
import {
  Close as CloseIcon,
  Fullscreen as FullscreenIcon,
  FullscreenExit as FullscreenExitIcon,
  Refresh as RefreshIcon,
  Lock as LockIcon,
  HourglassEmpty as HourglassIcon,
} from '@mui/icons-material';
import type { ProcessFlowStageCard } from '@/globals/types';
import { ProcessFormComponent } from './ProcessFormComponent';
import { ProcessFilesManagementComponent } from './ProcessFilesManagementComponent';
import { ProcessChecklistComponent } from './ProcessChecklistComponent';
import { ProcessCommentsComponent } from './ProcessCommentsComponent';
import { ProcessTimelineComponent } from './ProcessTimelineComponent';
import { ProcessApprovalComponent } from './ProcessApprovalComponent';
import { SignatureComponent } from '@/pages/FlowModels/components/SignatureComponent';
import { ProcessSignatureComponent } from './ProcessSignatureComponent';

type ProcessStageModalProps = {
  isOpen: boolean;
  onClose: () => void;
  stage: ProcessFlowStageCard | null;
  processId: string;
  instanceId: string;
  stageStatus?: 'completed' | 'in_progress' | 'pending';
  canManage?: boolean;
};

export const ProcessStageModal = ({ isOpen, onClose, stage, processId, instanceId, stageStatus, canManage }: ProcessStageModalProps) => {
  const [fullscreen, setFullscreen] = useState(false);
  const queryClient = useQueryClient();
  const isCompleted = stageStatus === 'completed';
  const isPending = stageStatus === 'pending';

  const handleRefreshAll = () => {
    queryClient.invalidateQueries({ queryKey: ['flowInstance'] });
    queryClient.invalidateQueries({ queryKey: ['form'] });
    queryClient.invalidateQueries({ queryKey: ['files'] });
    queryClient.invalidateQueries({ queryKey: ['timeline'] });
    queryClient.invalidateQueries({ queryKey: ['checklist'] });
    queryClient.invalidateQueries({ queryKey: ['comments'] });
    queryClient.invalidateQueries({ queryKey: ['approval-pending'] });
    queryClient.invalidateQueries({ queryKey: ['approval-history'] });
  };

  if (!stage) return null;

  const compEnabled = isOpen;
  const isReadOnly = isCompleted || isPending;

  const renderComponent = (component: ProcessFlowStageCard['components'][number]) => {
    const context = { processId, stageId: stage.stageId, componentKey: component.componentKey };

    switch (component.componentType) {
      case 'FORM':
        return <ProcessFormComponent key={component.componentKey} label={component.label} context={context} enabled={compEnabled} readOnly={isReadOnly} />;
      case 'FILES_MANAGEMENT':
        return <ProcessFilesManagementComponent key={component.componentKey} label={component.label} context={context} enabled={compEnabled} readOnly={isReadOnly} />;
      case 'TIMELINE':
        return <ProcessTimelineComponent key={component.componentKey} label={component.label} context={context} enabled={compEnabled} readOnly={isReadOnly} />;
      case 'CHECKLIST':
        return <ProcessChecklistComponent key={component.componentKey} label={component.label} context={context} enabled={compEnabled} readOnly={isReadOnly} />;
      case 'COMMENTS':
        return <ProcessCommentsComponent key={component.componentKey} label={component.label} context={context} enabled={compEnabled} readOnly={isReadOnly} />;
      case 'APPROVAL':
        return <ProcessApprovalComponent key={component.componentKey} label={component.label} context={context} enabled={compEnabled} readOnly={isReadOnly} onApproved={onClose} />;
      case 'SIGNATURE':
        return <ProcessSignatureComponent key={component.componentKey} label={component.label} context={context} enabled={compEnabled} readOnly={isReadOnly} canManage={canManage} />;
      default:
        return null;
    }
  };

  const header = (
    <Box sx={{ px: 3, py: 2.5, borderBottom: '1px solid #E4E6EB', display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: '#FAFBFC' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Box>
          <Typography sx={{ fontWeight: 800, fontSize: '1.25rem', color: '#0f172a' }}>{stage.title}</Typography>
          <Typography variant="body2" sx={{ color: '#64748b', mt: 0.5 }}>Etapa {stage.order} • {stage.department}</Typography>
        </Box>
        {isCompleted && (
          <Chip icon={<LockIcon sx={{ fontSize: 14 }} />} label="Etapa concluída" size="small"
            sx={{ bgcolor: '#DCFCE7', color: '#16A34A', fontWeight: 700, fontSize: '0.75rem', '& .MuiChip-icon': { color: '#16A34A' } }} />
        )}
        {isPending && (
          <Chip icon={<HourglassIcon sx={{ fontSize: 14 }} />} label="Aguardando" size="small"
            sx={{ bgcolor: '#F1F5F9', color: '#64748b', fontWeight: 700, fontSize: '0.75rem', '& .MuiChip-icon': { color: '#64748b' } }} />
        )}
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Tooltip title="Atualizar dados">
          <IconButton onClick={handleRefreshAll} sx={{ color: '#64748b' }}>
            <RefreshIcon />
          </IconButton>
        </Tooltip>
        <IconButton onClick={() => setFullscreen((v) => !v)} sx={{ color: '#64748b' }}>
          {fullscreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
        </IconButton>
        <IconButton onClick={onClose} sx={{ color: '#64748b' }}>
          <CloseIcon />
        </IconButton>
      </Box>
    </Box>
  );

  const content = (
    <DialogContent sx={{ p: 3 }}>
      {isPending && (
        <Box sx={{ mb: 3, p: 2, bgcolor: '#F8FAFC', border: '1px solid #E4E6EB', borderRadius: 2, display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <HourglassIcon sx={{ color: '#94a3b8', fontSize: 20 }} />
          <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 600 }}>
            Esta etapa ainda não foi iniciada. Os dados estão em modo somente leitura.
          </Typography>
        </Box>
      )}
      {isCompleted && (
        <Box sx={{ mb: 3, p: 2, bgcolor: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: 2, display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <LockIcon sx={{ color: '#16A34A', fontSize: 20 }} />
          <Typography variant="body2" sx={{ color: '#15803D', fontWeight: 600 }}>
            Esta etapa foi concluída. Os dados estão em modo somente leitura.
          </Typography>
        </Box>
      )}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {stage.components.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8, color: '#94a3b8' }}>
            <Typography variant="h6" sx={{ mb: 1 }}>Nenhum componente configurado</Typography>
            <Typography variant="body2">Esta etapa não possui componentes associados</Typography>
          </Box>
        ) : (
          stage.components.map((component) => renderComponent(component))
        )}
      </Box>
    </DialogContent>
  );

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      fullScreen={fullscreen}
      PaperProps={{ sx: { borderRadius: fullscreen ? 0 : 3, maxHeight: fullscreen ? '100vh' : '90vh' } }}
    >
      {header}
      {content}
    </Dialog>
  );
};
