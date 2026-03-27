import {
  Assignment as AssignmentIcon,
  CalendarToday as CalendarIcon,
  CheckCircle as CheckCircleIcon,
  Edit as EditIcon,
  SwapVert as SwapVertIcon,
  Visibility as VisibilityIcon,
  Warning as WarningIcon
} from '@mui/icons-material';
import {
  Box,
  Button,
  Chip,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography
} from '@mui/material';
import dayjs from 'dayjs';
import { useMemo, useState } from 'react';
import type { Process } from '@/globals/types';

interface ProcessTableProps {
  processes: Process[];
  onProcessClick?: (process: Process) => void;
}

const getStatusColor = (status?: string) => {
  switch (status) {
    case 'Em Andamento': return { bg: '#E7F3FF', color: '#105BBE', fontWeight: 700 };
    case 'Pendente':     return { bg: '#FFF5D6', color: '#B38800', fontWeight: 700 };
    case 'Atrasado':
    case 'Em Atraso':   return { bg: '#FDE8EC', color: '#B81E34', fontWeight: 700 };
    case 'Concluído':   return { bg: '#E6F4EA', color: '#1F7A37', fontWeight: 700 };
    case 'Cancelado':   return { bg: '#F0F2F5', color: '#616161', fontWeight: 600 };
    default:            return { bg: '#F3F4F6', color: '#6B7280', fontWeight: 600 };
  }
};

const PendenciaCell = ({ process, onProcessClick }: { process: Process; onProcessClick?: (p: Process) => void }) => {
  const pendencia = process.topPendencia;
  const hasPendencia = pendencia?.type !== null && pendencia?.type !== undefined;

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      {hasPendencia ? (
        <Button
          size='small'
          startIcon={<EditIcon />}
          onClick={() => onProcessClick?.(process)}
          sx={{
            textTransform: 'none',
            fontSize: '0.75rem',
            fontWeight: 600,
            px: 1.5,
            py: 0.5,
            borderRadius: 2,
            backgroundColor: '#1877F2',
            color: '#FFFFFF',
            '&:hover': { backgroundColor: '#166fe5' }
          }}
        >
          {pendencia?.label ?? 'Pendência'}
        </Button>
      ) : (
        <Chip
          icon={<CheckCircleIcon sx={{ fontSize: '14px !important', color: '#1F7A37' }} />}
          label='Sem pendência'
          size='small'
          onClick={() => onProcessClick?.(process)}
          sx={{
            fontSize: '0.75rem',
            fontWeight: 600,
            px: 1,
            borderRadius: '16px',
            backgroundColor: '#FFFFFF',
            color: '#1F7A37',
            border: '1px solid #E4E6EB',
            height: '28px',
            cursor: 'pointer',
            '&:hover': { backgroundColor: '#E6F4EA', borderColor: '#D1D5DB' }
          }}
        />
      )}

      <Tooltip title='Visualizar processo' arrow placement='top'>
        <IconButton
          size='small'
          onClick={() => onProcessClick?.(process)}
          sx={{
            width: 32, height: 32, borderRadius: '50%', color: '#8A8D91',
            '&:hover': { backgroundColor: 'rgba(24,119,242,0.08)', color: '#1877F2' }
          }}
        >
          <VisibilityIcon sx={{ fontSize: 18 }} />
        </IconButton>
      </Tooltip>
    </Box>
  );
};

export const ProcessTable = ({ processes, onProcessClick }: ProcessTableProps) => {
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const sortedProcesses = useMemo(() => {
    if (!processes || processes.length === 0) return processes;
    return [...processes].sort((a, b) => {
      const parse = (n: string) => {
        const parts = n.split('/');
        return parts.length === 2
          ? { number: parseInt(parts[0], 10) || 0, year: parseInt(parts[1], 10) || 0, original: n }
          : { number: 0, year: 0, original: n };
      };
      const ap = parse(a.processNumber || '');
      const bp = parse(b.processNumber || '');
      const mult = sortOrder === 'asc' ? 1 : -1;
      if (ap.year !== bp.year) return (ap.year - bp.year) * mult;
      if (ap.number !== bp.number) return (ap.number - bp.number) * mult;
      return ap.original.localeCompare(bp.original) * mult;
    });
  }, [processes, sortOrder]);

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, mb: 2 }}>
        <Box sx={{ width: 6, height: 24, borderRadius: '6px', backgroundColor: '#1877F2', flexShrink: 0 }} />
        <Typography variant='h6' sx={{ fontWeight: 700, fontSize: { xs: '16px', sm: '18px', md: '20px' }, color: '#212121' }}>
          {sortedProcesses.length === 1 ? '1 Processo' : `${sortedProcesses.length} Processos`}
        </Typography>
      </Box>

      <TableContainer
        sx={{
          borderRadius: 2, border: '1px solid #E4E6EB',
          boxShadow: '0 1px 3px rgba(16,24,40,0.06)', overflowX: 'auto',
          maxHeight: { xs: 'calc(100vh - 200px)', md: 'calc(100vh - 240px)' },
          backgroundColor: '#FFFFFF', mb: 3
        }}
      >
        <Table sx={{ minWidth: 900, tableLayout: 'auto' }}>
          <TableHead sx={{ position: 'sticky', top: 0, zIndex: 10 }}>
            <TableRow sx={{
              background: 'linear-gradient(to bottom, #F7F9FC 0%, #F3F6FA 100%)',
              '& th': { fontWeight: 600, fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#212121', borderBottom: '1px solid #E4E6EB', py: 2, px: { xs: 1.5, md: 2.5 }, whiteSpace: 'nowrap', backgroundColor: '#F7F9FC' }
            }}>
              <TableCell>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                  <Typography component='span' sx={{ fontSize: '0.875rem', fontWeight: 600 }}>Processo</Typography>
                  <Tooltip title={sortOrder === 'asc' ? 'Ordenar decrescente' : 'Ordenar crescente'} arrow placement='top'>
                    <IconButton size='small' onClick={() => setSortOrder(p => p === 'asc' ? 'desc' : 'asc')} sx={{ p: 0.5, borderRadius: 1 }}>
                      <SwapVertIcon sx={{ fontSize: '14px', color: '#8A8D91' }} />
                    </IconButton>
                  </Tooltip>
                </Box>
              </TableCell>
              <TableCell sx={{ minWidth: { xs: 200, md: 400 } }}>Objeto</TableCell>
              <TableCell>Etapa Atual</TableCell>
              <TableCell>Prazo Final</TableCell>
              <TableCell sx={{ minWidth: 140 }}>Situação</TableCell>
              <TableCell>Pendências</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedProcesses.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} sx={{ textAlign: 'center', py: 8 }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, py: 6 }}>
                    <Box sx={{ width: 80, height: 80, borderRadius: '50%', background: 'linear-gradient(180deg, #F7F9FB 0%, #E4E6EB 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <AssignmentIcon sx={{ fontSize: 40, color: '#9CA3AF' }} />
                    </Box>
                    <Typography variant='h6' sx={{ fontWeight: 600, color: '#212121' }}>Nenhum processo encontrado</Typography>
                    <Typography variant='body2' sx={{ color: '#8A8D91' }}>Tente ajustar os filtros ou criar um novo processo</Typography>
                  </Box>
                </TableCell>
              </TableRow>
            ) : (
              sortedProcesses.map((process, index) => {
                const statusColor = getStatusColor(process.status);
                return (
                  <TableRow
                    key={process._id}
                    sx={{
                      backgroundColor: index % 2 === 0 ? '#FFFFFF' : '#FAFBFC',
                      borderBottom: '1px solid #E4E6EB',
                      '&:hover': { backgroundColor: '#E7F3FF', cursor: 'pointer' },
                      transition: 'background 0.15s',
                      '& td': { py: 2, px: { xs: 1.5, md: 2.5 }, verticalAlign: 'middle' }
                    }}
                    onClick={() => onProcessClick?.(process)}
                  >
                    <TableCell onClick={e => e.stopPropagation()}>
                      <Typography
                        component='span'
                        onClick={() => onProcessClick?.(process)}
                        sx={{ color: '#1877F2', fontWeight: 700, fontSize: '1rem', cursor: 'pointer', '&:hover': { color: '#105BBE', textDecoration: 'underline' } }}
                      >
                        {process.processNumber}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ minWidth: { xs: 200, md: 400 } }}>
                      <Tooltip title={process.object} arrow placement='top'>
                        <Typography component='span' sx={{ color: '#212121', fontSize: '0.875rem', maxWidth: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}>
                          {process.object}
                        </Typography>
                      </Tooltip>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={process.currentStage || 'N/A'}
                        size='small'
                        sx={{ fontSize: '0.75rem', fontWeight: 600, borderRadius: '20px', backgroundColor: '#FFFFFF', color: '#3A3B3C', border: '1px solid #E4E6EB', height: '28px' }}
                      />
                    </TableCell>
                    <TableCell>
                      {process.dueDate ? (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <CalendarIcon sx={{ fontSize: 16, color: '#8A8D91' }} />
                          <Typography variant='body2' sx={{ color: '#212121' }}>
                            {dayjs(process.dueDate).format('DD/MM/YYYY')}
                          </Typography>
                        </Box>
                      ) : (
                        <Typography variant='body2' sx={{ color: '#8A8D91' }}>N/A</Typography>
                      )}
                    </TableCell>
                    <TableCell sx={{ minWidth: 140 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Chip
                          label={process.status || 'N/A'}
                          size='small'
                          sx={{ fontSize: '0.75rem', fontWeight: statusColor.fontWeight, borderRadius: '16px', backgroundColor: '#FFFFFF', color: statusColor.color, border: '1px solid #E4E6EB', height: '28px' }}
                        />
                        {process.status === 'Em Atraso' && (
                          <Box sx={{ width: 28, height: 28, borderRadius: '50%', backgroundColor: 'rgba(184,30,52,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(184,30,52,0.2)' }}>
                            <WarningIcon sx={{ fontSize: 18, color: '#B81E34' }} />
                          </Box>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell onClick={e => e.stopPropagation()}>
                      <PendenciaCell process={process} onProcessClick={onProcessClick} />
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};
