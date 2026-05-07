import { Assignment as AssignmentIcon, CalendarToday as CalendarIcon } from '@mui/icons-material';
import { Box, Chip, MenuItem, Select, Typography } from '@mui/material';
import dayjs from 'dayjs';
import type { Process } from '@/globals/types';

const COLUMNS: { key: string; label: string; color: string; bg: string; border: string }[] = [
  { key: 'Em Andamento', label: 'Em Andamento', color: '#1877F2', bg: '#EFF6FF', border: '#BFDBFE' },
  { key: 'Em Atraso',    label: 'Em Atraso',    color: '#B91C1C', bg: '#FFF1F2', border: '#FECACA' },
  { key: 'Pendente',     label: 'Pendente',      color: '#64748b', bg: '#F8FAFC', border: '#E2E8F0' },
  { key: 'Concluído',    label: 'Concluído',     color: '#15803D', bg: '#F0FDF4', border: '#BBF7D0' },
];

const ProcessCard = ({ process, onClick }: { process: Process; onClick: (p: Process) => void }) => (
  <Box
    onClick={() => onClick(process)}
    sx={{
      p: 2, borderRadius: 2, backgroundColor: '#fff',
      border: '1px solid #E4E6EB', cursor: 'pointer',
      transition: 'all 0.15s',
      '&:hover': { borderColor: '#1877F2', boxShadow: '0 2px 8px rgba(24,119,242,0.1)', transform: 'translateY(-1px)' },
    }}
  >
    <Typography sx={{ fontWeight: 700, color: '#1877F2', fontSize: '0.875rem', mb: 0.5 }}>
      {process.processNumber}
    </Typography>
    <Typography sx={{ fontSize: '0.8125rem', color: '#374151', fontWeight: 500, mb: 1, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
      {process.object}
    </Typography>
    {process.currentStage && (
      <Chip
        label={process.currentStage}
        size='small'
        sx={{ fontSize: '0.6875rem', fontWeight: 600, height: 22, borderRadius: '999px', backgroundColor: '#F1F5F9', color: '#475569', mb: 1 }}
      />
    )}
    {process.dueDate && (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        <CalendarIcon sx={{ fontSize: 13, color: '#94a3b8' }} />
        <Typography sx={{ fontSize: '0.75rem', color: '#94a3b8' }}>
          {dayjs(process.dueDate).format('DD/MM/YYYY')}
        </Typography>
      </Box>
    )}
  </Box>
);

type Props = {
  processes: Process[];
  total: number;
  limit: number;
  onLimitChange: (limit: number) => void;
  onProcessClick: (p: Process) => void;
};

export const ProcessKanban = ({ processes, total, limit, onLimitChange, onProcessClick }: Props) => {
  const grouped = COLUMNS.map(col => ({
    ...col,
    items: processes.filter(p => (p.status || 'Pendente') === col.key),
  }));

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {/* Colunas */}
      <Box sx={{ display: 'flex', gap: 2, alignItems: 'stretch' }}>
        {grouped.map(col => (
          <Box
            key={col.key}
            sx={{ flex: 1, minWidth: 0, borderRadius: 2, border: `1px solid ${col.border}`, backgroundColor: col.bg, display: 'flex', flexDirection: 'column' }}
          >
            {/* Header da coluna */}
            <Box sx={{ px: 2, py: 1.5, borderBottom: `1px solid ${col.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography sx={{ fontWeight: 700, fontSize: '0.8125rem', color: col.color, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {col.label}
              </Typography>
              <Box sx={{ width: 22, height: 22, borderRadius: '50%', backgroundColor: col.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography sx={{ fontSize: '0.6875rem', fontWeight: 900, color: '#fff' }}>{col.items.length}</Typography>
              </Box>
            </Box>

            {/* Cards */}
            <Box sx={{ p: 1.5, display: 'flex', flexDirection: 'column', gap: 1.5, flex: 1 }}>
              {col.items.length === 0 ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, gap: 1, opacity: 0.4 }}>
                  <AssignmentIcon sx={{ fontSize: 28, color: col.color }} />
                  <Typography sx={{ fontSize: '0.75rem', color: col.color, fontWeight: 600 }}>Nenhum processo</Typography>
                </Box>
              ) : (
                col.items.map(p => <ProcessCard key={p._id} process={p} onClick={onProcessClick} />)
              )}
            </Box>
          </Box>
        ))}
      </Box>

      {/* Rodapé — só select de quantidade */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 2, px: 0.5, py: 1.5, borderTop: '1px solid #e5e7eb', backgroundColor: '#f8fafc', borderRadius: 2 }}>
        <Typography variant='body2' sx={{ color: '#6b7280', fontSize: '0.875rem' }}>
          {processes.length} de {total} processos
        </Typography>
        <Select
          value={limit}
          onChange={(e) => onLimitChange(Number(e.target.value))}
          size='small'
          sx={{ height: 32, fontSize: '0.875rem', minWidth: 140 }}
        >
          {[10, 25, 50, 100].map((v) => (
            <MenuItem key={v} value={v}>{v} por página</MenuItem>
          ))}
        </Select>
      </Box>
    </Box>
  );
};
