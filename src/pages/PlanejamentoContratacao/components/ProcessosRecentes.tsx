import { Box, Button, Card, Chip, MenuItem, Pagination, Select, Skeleton, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import type { Paginated, ProcessoRecente } from '@/globals/types';

const STAGE_STATUS_CONFIG: Record<ProcessoRecente['stageStatus'], { label: string; bg: string; color: string; border: string }> = {
  em_dia:     { label: 'Em dia',      bg: 'rgba(0,110,41,0.05)',    color: '#006e29', border: 'rgba(0,110,41,0.1)' },
  atrasada:   { label: 'Atrasada',    bg: 'rgba(186,26,26,0.05)',   color: '#ba1a1a', border: 'rgba(186,26,26,0.1)' },
  vence_hoje: { label: 'Vence hoje',  bg: 'rgba(202,138,4,0.08)',   color: '#ca8a04', border: 'rgba(202,138,4,0.15)' },
  concluida:  { label: 'Concluída',   bg: 'rgba(99,102,241,0.07)',  color: '#4f46e5', border: 'rgba(99,102,241,0.15)' },
};

const PROCESS_STATUS_CONFIG: Record<ProcessoRecente['processStatus'], { label: string; bg: string; color: string; border: string }> = {
  em_andamento: { label: 'Em andamento', bg: 'rgba(24,119,242,0.07)',  color: '#1877F2', border: 'rgba(24,119,242,0.15)' },
  em_risco:     { label: 'Em risco',     bg: 'rgba(202,138,4,0.08)',   color: '#ca8a04', border: 'rgba(202,138,4,0.15)' },
  atrasado:     { label: 'Atrasado',     bg: 'rgba(186,26,26,0.05)',   color: '#ba1a1a', border: 'rgba(186,26,26,0.1)' },
  finalizado:   { label: 'Finalizado',   bg: 'rgba(0,110,41,0.05)',    color: '#006e29', border: 'rgba(0,110,41,0.1)' },
  paralisado:   { label: 'Paralisado',   bg: 'rgba(100,116,139,0.07)', color: '#475569', border: 'rgba(100,116,139,0.15)' },
};

const StatusChip = ({ cfg }: { cfg: { label: string; bg: string; color: string; border: string } }) => (
  <Chip
    label={cfg.label}
    size='small'
    sx={{ backgroundColor: cfg.bg, color: cfg.color, fontWeight: 900, fontSize: '0.625rem', textTransform: 'uppercase', border: `1px solid ${cfg.border}`, borderRadius: '999px' }}
  />
);

type Props = {
  data?: Paginated<ProcessoRecente>;
  loading: boolean;
  page: number;
  limit: number;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
};

export const ProcessosRecentes = ({ data, loading, page, limit, onPageChange, onLimitChange }: Props) => {
  const navigate = useNavigate();
  const total = data?.total ?? 0;
  const totalPages = data?.totalPages ?? 1;
  const from = total === 0 ? 0 : (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);

  return (
    <Card sx={{ border: '1px solid', borderColor: 'divider', boxShadow: '0 2px 15px -3px rgba(0,0,0,0.07)', overflow: 'hidden' }}>
      <Box sx={{ px: 4, py: 2.5, borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography sx={{ fontSize: '0.8125rem', fontWeight: 900, letterSpacing: '0.1em', color: '#0f172a', textTransform: 'uppercase' }}>
          Meus processos recentes
        </Typography>
        <Typography
          component='span'
          onClick={() => navigate('/processos-gerencia')}
          sx={{ fontSize: '0.875rem', fontWeight: 600, color: 'primary.main', cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
        >
          Ver todos
        </Typography>
      </Box>

      <TableContainer>
        <Table>
          <TableHead>
            <TableRow sx={{ '& .MuiTableCell-head': { backgroundColor: 'rgba(248,250,252,0.3)', fontSize: '0.625rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.18em', color: '#94a3b8', borderBottom: '1px solid #f1f5f9', py: 1.5 } }}>
              <TableCell sx={{ pl: 4 }}>Processo</TableCell>
              <TableCell>Objeto</TableCell>
              <TableCell>Etapa Atual</TableCell>
              <TableCell>Status da Etapa</TableCell>
              <TableCell>Status do Processo</TableCell>
              <TableCell align='right' sx={{ pr: 4 }}>Ação</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              Array.from({ length: limit }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 6 }).map((__, j) => (
                    <TableCell key={j}><Skeleton variant='text' /></TableCell>
                  ))}
                </TableRow>
              ))
            ) : (data?.items.length ?? 0) === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align='center' sx={{ py: 5 }}>
                  <Typography variant='body2' color='text.secondary'>Nenhum processo recente</Typography>
                </TableCell>
              </TableRow>
            ) : (
              data!.items.map((proc) => (
                <TableRow
                  key={proc.processId}
                  sx={{ '&:hover': { backgroundColor: '#EBF3FF' }, transition: 'background 0.15s', cursor: 'pointer', '& .MuiTableCell-root': { borderBottom: '1px solid #f1f5f9', py: 2 } }}
                  onClick={() => navigate(`/processos-gerencia/${proc.processId}`)}
                >
                  <TableCell sx={{ pl: 4 }}>
                    <Typography sx={{ fontWeight: 900, color: '#0f172a', fontSize: '0.875rem' }}>{proc.processNumber}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography sx={{ fontSize: '0.875rem', color: '#475569', fontWeight: 500, maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{proc.object}</Typography>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box sx={{ width: 8, height: 8, borderRadius: '50%', flexShrink: 0, backgroundColor: STAGE_STATUS_CONFIG[proc.stageStatus].color, opacity: 0.7 }} />
                      <Typography sx={{ fontSize: '0.8125rem', fontWeight: 700, color: '#374151' }}>{proc.currentStage}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <StatusChip cfg={STAGE_STATUS_CONFIG[proc.stageStatus]} />
                  </TableCell>
                  <TableCell>
                    <StatusChip cfg={PROCESS_STATUS_CONFIG[proc.processStatus]} />
                  </TableCell>
                  <TableCell align='right' sx={{ pr: 4 }} onClick={(e) => e.stopPropagation()}>
                    <Button
                      variant='outlined'
                      size='small'
                      onClick={() => navigate(`/processos-gerencia/${proc.processId}`)}
                      sx={{ textTransform: 'none', fontWeight: 600, fontSize: '0.875rem', borderRadius: 2, borderColor: '#1877F2', color: '#1877F2', '&:hover': { backgroundColor: '#1877F2', color: '#fff', borderColor: '#1877F2' } }}
                    >
                      Continuar
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Box sx={{ px: 4, py: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2, backgroundColor: '#f8fafc', borderTop: '1px solid #e5e7eb' }}>
        <Typography variant='body2' sx={{ color: '#6b7280', fontSize: '0.875rem' }}>
          {total > 0 ? `${from}–${to} de ${total}` : '0 de 0'}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Select
            value={limit}
            onChange={(e) => onLimitChange(Number(e.target.value))}
            size='small'
            sx={{ height: 32, fontSize: '0.875rem', minWidth: 120 }}
          >
            {[5, 10, 25].map((v) => (
              <MenuItem key={v} value={v}>{v} por página</MenuItem>
            ))}
          </Select>
          <Pagination
            count={totalPages}
            page={page}
            onChange={(_, p) => onPageChange(p)}
            variant='outlined'
            shape='rounded'
            showFirstButton
            showLastButton
            size='small'
          />
        </Box>
      </Box>
    </Card>
  );
};
