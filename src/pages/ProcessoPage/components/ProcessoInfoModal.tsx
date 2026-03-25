import { Box, Chip, Dialog, DialogContent, Divider, IconButton, Typography } from '@mui/material';
import { Close as CloseIcon, Folder as FolderIcon } from '@mui/icons-material';
import type { FlowInstance } from '@/hooks/useFlowInstance';

type Props = {
  open: boolean;
  onClose: () => void;
  flowInstance: FlowInstance;
  currentStage?: { title: string } | null;
};

const Row = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.25 }}>
    <Typography variant='caption' sx={{ color: '#64748b', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: '0.05em' }}>{label}</Typography>
    <Box sx={{ color: '#0f172a', fontWeight: 700, fontSize: '0.9rem' }}>{value}</Box>
  </Box>
);

const priorityColor: Record<string, { bg: string; color: string }> = {
  Alta:  { bg: '#FEE2E2', color: '#B91C1C' },
  Média: { bg: '#FEF3C7', color: '#92400E' },
  Baixa: { bg: '#DCFCE7', color: '#16A34A' },
};

export const ProcessoInfoModal = ({ open, onClose, flowInstance, currentStage }: Props) => {
  const p = flowInstance.process;
  const priority = p.priority ?? 'Baixa';
  const pColor = priorityColor[priority] ?? priorityColor.Baixa;

  const formatDate = (d?: string) => d ? new Date(d).toLocaleDateString('pt-BR') : '—';

  const creatorDept = typeof p.creatorDepartment === 'object'
    ? `${p.creatorDepartment.department_acronym} - ${p.creatorDepartment.department_name}`
    : p.creatorDepartment || '—';

  const createdByName = typeof p.createdBy === 'object'
    ? `${p.createdBy.firstName} ${p.createdBy.lastName}`
    : p.createdBy || '—';

  const participatingDepts = p.participatingDepartments?.length
    ? p.participatingDepartments.map(d =>
        typeof d === 'object' ? `${d.department_acronym} - ${d.department_name}` : d
      ).join(' • ')
    : '—';

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth='sm' PaperProps={{ sx: { borderRadius: 3 } }}>
      <Box sx={{ px: 3, py: 2.5, borderBottom: '1px solid #E4E6EB', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box sx={{ width: 36, height: 36, borderRadius: 2, bgcolor: '#E7F3FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FolderIcon sx={{ color: '#1877F2', fontSize: 20 }} />
          </Box>
          <Box>
            <Typography sx={{ fontWeight: 800, color: '#0f172a', fontSize: '1.1rem' }}>Informações do Processo</Typography>
            <Typography variant='caption' sx={{ color: '#64748b' }}>{p.processNumber}</Typography>
          </Box>
        </Box>
        <IconButton onClick={onClose} size='small'><CloseIcon /></IconButton>
      </Box>

      <DialogContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          <Row label='Objeto' value={p.object} />
          <Divider />
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
            <Row label='Número do Processo' value={p.processNumber} />
            <Row label='Data de Criação' value={formatDate(p.createdAt ?? flowInstance.createdAt)} />
          </Box>
          <Divider />
          <Row label='Gerência Responsável' value={creatorDept} />
          <Row label='Gerências Envolvidas' value={participatingDepts} />
          <Divider />
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
            <Row label='Etapa Atual' value={currentStage?.title ?? p.currentStage ?? '—'} />
            <Row label='Modalidade' value={p.modality ?? '—'} />
          </Box>
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
            <Row label='Prazo Final' value={formatDate(p.dueDate)} />
            <Row label='Prioridade' value={
              <Chip label={priority} size='small' sx={{ bgcolor: pColor.bg, color: pColor.color, fontWeight: 700, fontSize: '0.75rem', height: 22 }} />
            } />
          </Box>
          <Row label='Criado por' value={createdByName} />
          <Divider />
          <Row label='Situação' value={
            <Chip label={p.status} size='small' sx={{ bgcolor: '#DCFCE7', color: '#16A34A', fontWeight: 700, fontSize: '0.75rem', height: 22 }} />
          } />
        </Box>
      </DialogContent>
    </Dialog>
  );
};
