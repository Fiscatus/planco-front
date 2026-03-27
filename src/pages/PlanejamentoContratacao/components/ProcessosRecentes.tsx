import { Box, Button, Card, Chip, Skeleton, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';
import type { ProcessoRecente } from '@/globals/types';

const StatusBadge = ({ status, daysLate, dueDate }: Pick<ProcessoRecente, 'status' | 'daysLate' | 'dueDate'>) => {
  if (status === 'em_dia') {
    return <Chip label='Em dia' size='small' sx={{ backgroundColor: 'rgba(0,110,41,0.05)', color: '#006e29', fontWeight: 900, fontSize: '0.625rem', textTransform: 'uppercase', border: '1px solid rgba(0,110,41,0.1)', borderRadius: '999px' }} />;
  }
  if (status === 'atrasado') {
    return <Chip label={`Atrasado (${daysLate}d)`} size='small' sx={{ backgroundColor: 'rgba(186,26,26,0.05)', color: '#ba1a1a', fontWeight: 900, fontSize: '0.625rem', textTransform: 'uppercase', border: '1px solid rgba(186,26,26,0.1)', borderRadius: '999px' }} />;
  }
  // prazo
  return (
    <Box>
      <Chip label='Vence em breve' size='small' sx={{ backgroundColor: 'rgba(202,138,4,0.08)', color: '#ca8a04', fontWeight: 900, fontSize: '0.625rem', textTransform: 'uppercase', border: '1px solid rgba(202,138,4,0.15)', borderRadius: '999px' }} />
      {dueDate && (
        <Typography sx={{ fontSize: '0.6875rem', color: '#94a3b8', mt: 0.25 }}>
          {dayjs(dueDate).format('DD/MM/YYYY')}
        </Typography>
      )}
    </Box>
  );
};

type Props = { processes?: ProcessoRecente[]; loading: boolean };

export const ProcessosRecentes = ({ processes, loading }: Props) => {
  const navigate = useNavigate();

  return (
    <Card sx={{ border: '1px solid', borderColor: 'divider', boxShadow: '0 2px 15px -3px rgba(0,0,0,0.07)', overflow: 'hidden' }}>
      <Box sx={{ px: 4, py: 2.5, borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography sx={{ fontSize: '0.8125rem', fontWeight: 900, letterSpacing: '0.1em', color: '#0f172a', textTransform: 'uppercase' }}>
          Meus processos recentes
        </Typography>
        <Typography
          component='span'
          onClick={() => navigate('/processos-gerencia')}
          sx={{ fontSize: '0.875rem', fontWeight: 600, color: 'primary.main', cursor: 'pointer', textTransform: 'none', '&:hover': { textDecoration: 'underline' } }}
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
              <TableCell>Status / Prazo</TableCell>
              <TableCell align='right' sx={{ pr: 4 }}>Ação</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 5 }).map((__, j) => (
                    <TableCell key={j}><Skeleton variant='text' /></TableCell>
                  ))}
                </TableRow>
              ))
            ) : processes?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align='center' sx={{ py: 5 }}>
                  <Typography variant='body2' color='text.secondary'>Nenhum processo recente</Typography>
                </TableCell>
              </TableRow>
            ) : (
              processes?.map((proc) => (
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
                      <Box sx={{ width: 8, height: 8, borderRadius: '50%', flexShrink: 0, backgroundColor: proc.status === 'atrasado' ? '#94a3b8' : proc.status === 'prazo' ? '#ca8a04' : '#1877F2', boxShadow: proc.status === 'em_dia' ? '0 0 0 2px rgba(24,119,242,0.2)' : 'none' }} />
                      <Typography sx={{ fontSize: '0.8125rem', fontWeight: 700, color: '#374151' }}>{proc.currentStage}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={proc.status} daysLate={proc.daysLate} dueDate={proc.dueDate} />
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
    </Card>
  );
};
