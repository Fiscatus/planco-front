import {
  CalendarToday as CalendarIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  TodayOutlined as TodayIcon,
  Warning as WarningIcon
} from '@mui/icons-material';
import { Box, Button, Card, Chip, IconButton, Tooltip, Typography } from '@mui/material';
import dayjs from 'dayjs';
import 'dayjs/locale/pt-br';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Process } from '@/globals/types';

dayjs.locale('pt-br');

interface ProcessSidebarProps {
  onDateClick: (date: Date) => void;
  onProcessClick: (process: Process) => void;
  onResetAll: () => void;
  selectedDate: Date | null;
  processes: Process[];
}

const STATUS_COLOR: Record<string, { bg: string; color: string; dot: string }> = {
  'Em Andamento': { bg: '#E7F3FF', color: '#105BBE', dot: '#1877F2' },
  'Em Atraso':    { bg: '#FDE8EC', color: '#B81E34', dot: '#B81E34' },
  'Atrasado':     { bg: '#FDE8EC', color: '#B81E34', dot: '#B81E34' },
  'Concluído':    { bg: '#E6F4EA', color: '#1F7A37', dot: '#1F7A37' },
  'Pendente':     { bg: '#FFF5D6', color: '#B38800', dot: '#B38800' },
};

const getMonthDates = (date: Date) => {
  const start = dayjs(date).startOf('month').startOf('week');
  const end = dayjs(date).endOf('month').endOf('week');
  const dates: Date[] = [];
  let cur = start;
  while (cur.isBefore(end) || cur.isSame(end, 'day')) {
    dates.push(cur.toDate());
    cur = cur.add(1, 'day');
  }
  return dates;
};

const LEGEND = [
  { label: 'Em Atraso',    color: '#B81E34' },
  { label: 'Em Andamento', color: '#1877F2' },
  { label: 'Concluído',    color: '#1F7A37' },
  { label: 'Pendente',     color: '#B38800' },
];

export const ProcessSidebar = ({ onDateClick, onProcessClick, onResetAll, selectedDate, processes }: ProcessSidebarProps) => {
  const navigate = useNavigate();
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const weekStart = dayjs(currentWeek).startOf('week');
  const weekEnd = dayjs(currentWeek).endOf('week');
  const isCurrentWeek = weekStart.isSame(dayjs().startOf('week'), 'day');

  const weekProcesses = useMemo(() =>
    processes.filter(p => {
      if (!p.dueDate) return false;
      const d = dayjs(p.dueDate);
      return d.isAfter(weekStart.subtract(1, 'day')) && d.isBefore(weekEnd.add(1, 'day'));
    }),
    [processes, weekStart, weekEnd]
  );

  const monthDates = useMemo(() => getMonthDates(currentMonth), [currentMonth]);

  const getDateStatus = (date: Date) => {
    const matching = processes.filter(p => p.dueDate && dayjs(p.dueDate).isSame(dayjs(date), 'day'));
    if (matching.length === 0) return null;
    for (const s of ['Em Atraso', 'Atrasado', 'Pendente', 'Em Andamento', 'Concluído']) {
      if (matching.some(p => p.status === s)) return s;
    }
    return matching[0].status ?? null;
  };

  const getDateProcesses = (date: Date) =>
    processes.filter(p => p.dueDate && dayjs(p.dueDate).isSame(dayjs(date), 'day'));

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>

      {/* Prazos da Semana */}
      <Card sx={{ p: 2, borderRadius: 2, border: '1px solid #E4E6EB', backgroundColor: '#FFFFFF' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant='h6' sx={{ fontWeight: 700, fontSize: '1rem', color: '#212121' }}>
            Prazos da Semana
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ width: 28, height: 28, borderRadius: '50%', backgroundColor: weekProcesses.length > 0 ? '#1877F2' : '#E4E6EB', color: weekProcesses.length > 0 ? '#fff' : '#8A8D91', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.8125rem' }}>
              {weekProcesses.length}
            </Box>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
          <IconButton size='small' onClick={() => setCurrentWeek(dayjs(currentWeek).subtract(1, 'week').toDate())}>
            <ChevronLeftIcon fontSize='small' />
          </IconButton>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
            <Typography variant='body2' sx={{ color: '#212121', fontWeight: 600 }}>
              {weekStart.format('DD/MM')} – {weekEnd.format('DD/MM/YYYY')}
            </Typography>
            {!isCurrentWeek && (
              <Button
                size='small'
                variant='contained'
                startIcon={<TodayIcon sx={{ fontSize: 14 }} />}
                onClick={() => setCurrentWeek(new Date())}
                sx={{ textTransform: 'none', fontWeight: 600, fontSize: '0.75rem', borderRadius: 2, py: 0.5, px: 1.5, boxShadow: 'none', backgroundColor: '#1877F2', '&:hover': { backgroundColor: '#166fe5' } }}
              >
                Semana atual
              </Button>
            )}
          </Box>
          <IconButton size='small' onClick={() => setCurrentWeek(dayjs(currentWeek).add(1, 'week').toDate())}>
            <ChevronRightIcon fontSize='small' />
          </IconButton>
        </Box>

        {weekProcesses.length === 0 ? (
          <Typography variant='body2' sx={{ color: '#8A8D91', textAlign: 'center', py: 2 }}>
            Nenhum prazo para esta semana
          </Typography>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {weekProcesses.map(p => {
              const sc = STATUS_COLOR[p.status ?? ''] ?? { bg: '#F3F4F6', color: '#6B7280', dot: '#6B7280' };
              const isOverdue = p.status === 'Em Atraso' || p.status === 'Atrasado';
              return (
                <Box
                  key={p._id}
                  onClick={() => onProcessClick(p)}
                  sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: 1.5, borderRadius: 2, border: '1px solid #f1f5f9', backgroundColor: sc.bg, cursor: 'pointer', transition: 'all 0.15s', '&:hover': { borderColor: sc.dot, transform: 'translateX(2px)' } }}
                >
                  <Box sx={{ flexShrink: 0 }}>
                    {isOverdue
                      ? <WarningIcon sx={{ fontSize: 18, color: sc.color }} />
                      : <CalendarIcon sx={{ fontSize: 18, color: sc.color }} />
                    }
                  </Box>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography sx={{ fontSize: '0.8125rem', fontWeight: 700, color: '#212121', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {p.processNumber}
                    </Typography>
                    <Typography sx={{ fontSize: '0.75rem', color: '#64748b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {p.object}
                    </Typography>
                  </Box>
                  <Box sx={{ flexShrink: 0, textAlign: 'right' }}>
                    <Typography sx={{ fontSize: '0.6875rem', fontWeight: 700, color: sc.color }}>
                      {dayjs(p.dueDate).format('DD/MM')}
                    </Typography>
                    <Chip label={p.status} size='small' sx={{ fontSize: '0.5625rem', fontWeight: 700, height: 16, backgroundColor: 'transparent', color: sc.color, px: 0 }} />
                  </Box>
                </Box>
              );
            })}
          </Box>
        )}

        {/* Legenda */}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, mt: 2, pt: 2, borderTop: '1px solid #E4E6EB' }}>
          {LEGEND.map(({ label, color }) => (
            <Box key={label} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Box sx={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: color }} />
              <Typography variant='caption' sx={{ color: '#8A8D91', fontSize: '0.6875rem' }}>{label}</Typography>
            </Box>
          ))}
        </Box>
      </Card>

      {/* Calendário de Prazos */}
      <Card sx={{ p: 2, borderRadius: 2, border: '1px solid #E4E6EB', backgroundColor: '#FFFFFF' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <IconButton size='small' onClick={() => setCurrentMonth(dayjs(currentMonth).subtract(1, 'month').toDate())}>
            <ChevronLeftIcon fontSize='small' />
          </IconButton>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
            <Typography variant='h6' sx={{ fontWeight: 700, fontSize: '1rem', color: '#212121', textTransform: 'capitalize' }}>
              {dayjs(currentMonth).format('MMMM YYYY')}
            </Typography>
            {!dayjs(currentMonth).isSame(dayjs(), 'month') && (
              <Button
                size='small'
                variant='contained'
                startIcon={<TodayIcon sx={{ fontSize: 14 }} />}
                onClick={() => setCurrentMonth(new Date())}
                sx={{ textTransform: 'none', fontWeight: 600, fontSize: '0.75rem', borderRadius: 2, py: 0.5, px: 1.5, boxShadow: 'none', backgroundColor: '#1877F2', '&:hover': { backgroundColor: '#166fe5' } }}
              >
                Mês atual
              </Button>
            )}
          </Box>
          <IconButton size='small' onClick={() => setCurrentMonth(dayjs(currentMonth).add(1, 'month').toDate())}>
            <ChevronRightIcon fontSize='small' />
          </IconButton>
        </Box>

        {/* Cabeçalho dias */}
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 0.5, mb: 1 }}>
          {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(d => (
            <Typography key={d} variant='caption' sx={{ textAlign: 'center', fontWeight: 600, color: '#8A8D91', fontSize: '0.6875rem' }}>
              {d}
            </Typography>
          ))}
        </Box>

        {/* Dias */}
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 0.5 }}>
          {monthDates.map((date, idx) => {
            const isCurrentMonth = dayjs(date).isSame(dayjs(currentMonth), 'month');
            const status = getDateStatus(date);
            const sc = status ? (STATUS_COLOR[status] ?? null) : null;
            const isSelected = selectedDate && dayjs(date).isSame(dayjs(selectedDate), 'day');
            const isToday = dayjs(date).isSame(dayjs(), 'day');
            const dayProcs = getDateProcesses(date);

            return (
              <Tooltip
                key={idx}
                title={dayProcs.length > 0 ? dayProcs.map(p => `${p.processNumber} — ${p.status}`).join('\n') : ''}
                arrow
                placement='top'
                slotProps={{ tooltip: { sx: { whiteSpace: 'pre-line', fontSize: '0.75rem' } } }}
              >
                <Box
                  onClick={() => status && onDateClick(date)}
                  sx={{
                    aspectRatio: '1',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: 1,
                    backgroundColor: isSelected ? '#1877F2' : sc ? sc.bg : 'transparent',
                    color: isSelected ? '#FFFFFF' : sc ? sc.color : isCurrentMonth ? '#212121' : '#C0C4CC',
                    cursor: status ? 'pointer' : 'default',
                    border: isToday ? '2px solid #1877F2' : '2px solid transparent',
                    transition: 'all 0.15s',
                    '&:hover': { backgroundColor: status ? (isSelected ? '#105BBE' : '#F0F4FF') : 'transparent' }
                  }}
                >
                  <Typography variant='caption' sx={{ fontSize: '0.75rem', fontWeight: isToday ? 700 : 400, lineHeight: 1 }}>
                    {dayjs(date).format('D')}
                  </Typography>
                  {dayProcs.length > 0 && !isSelected && (
                    <Box sx={{ display: 'flex', gap: '2px', mt: '2px' }}>
                      {dayProcs.slice(0, 3).map((p, i) => (
                        <Box key={i} sx={{ width: 4, height: 4, borderRadius: '50%', backgroundColor: STATUS_COLOR[p.status ?? '']?.dot ?? '#8A8D91' }} />
                      ))}
                    </Box>
                  )}
                </Box>
              </Tooltip>
            );
          })}
        </Box>

        {/* Legenda */}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, mt: 2, pt: 2, borderTop: '1px solid #E4E6EB' }}>
          {LEGEND.map(({ label, color }) => (
            <Box key={label} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Box sx={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: color }} />
              <Typography variant='caption' sx={{ color: '#8A8D91', fontSize: '0.6875rem' }}>{label}</Typography>
            </Box>
          ))}
        </Box>

        {selectedDate && (
          <Typography variant='caption' sx={{ color: '#1877F2', fontSize: '0.6875rem', mt: 1, display: 'block', textAlign: 'center', fontWeight: 600 }}>
            Filtrando por {dayjs(selectedDate).format('DD/MM/YYYY')} — clique novamente para limpar
          </Typography>
        )}
        {!selectedDate && (
          <Typography variant='caption' sx={{ color: '#8A8D91', fontSize: '0.6875rem', mt: 1, display: 'block', textAlign: 'center' }}>
            Clique em uma data para filtrar os processos
          </Typography>
        )}
      </Card>

    </Box>
  );
};
