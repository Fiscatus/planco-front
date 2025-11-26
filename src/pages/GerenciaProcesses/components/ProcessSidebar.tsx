import {
  Box,
  Card,
  IconButton,
  Typography
} from '@mui/material';
import {
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  CalendarToday as CalendarIcon
} from '@mui/icons-material';
import type { Process } from '@/globals/types';
import { useState, useMemo } from 'react';
import dayjs from 'dayjs';
import 'dayjs/locale/pt-br';

dayjs.locale('pt-br');

interface ProcessSidebarProps {
  onDateClick: (date: Date) => void;
  selectedDate: Date | null;
  processes: Process[];
}

const getWeekDates = (date: Date) => {
  const startOfWeek = dayjs(date).startOf('week');
  const dates = [];
  for (let i = 0; i < 7; i++) {
    dates.push(startOfWeek.add(i, 'day').toDate());
  }
  return dates;
};

const getMonthDates = (date: Date) => {
  const startOfMonth = dayjs(date).startOf('month');
  const endOfMonth = dayjs(date).endOf('month');
  const startDate = startOfMonth.startOf('week');
  const endDate = endOfMonth.endOf('week');
  const dates = [];
  let current = startDate;
  while (current.isBefore(endDate) || current.isSame(endDate, 'day')) {
    dates.push(current.toDate());
    current = current.add(1, 'day');
  }
  return dates;
};

const getProcessStatusForDate = (process: Process, date: Date): string | null => {
  const deadline = process.dueDate;
  if (!deadline) return null;
  
  const processDate = dayjs(deadline);
  const checkDate = dayjs(date);
  
  if (!processDate.isSame(checkDate, 'day')) return null;
  
  return process.status || null;
};

export const ProcessSidebar = ({
  onDateClick,
  selectedDate,
  processes
}: ProcessSidebarProps) => {
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const weekDates = useMemo(() => getWeekDates(currentWeek), [currentWeek]);
  const monthDates = useMemo(() => getMonthDates(currentMonth), [currentMonth]);

  const weekDeadlines = useMemo(() => {
    return weekDates.filter(date => {
      return processes.some(process => {
        const deadline = process.dueDate;
        if (!deadline) return false;
        return dayjs(deadline).isSame(dayjs(date), 'day');
      });
    }).length;
  }, [weekDates, processes]);

  const handlePreviousWeek = () => {
    setCurrentWeek(dayjs(currentWeek).subtract(1, 'week').toDate());
  };

  const handleNextWeek = () => {
    setCurrentWeek(dayjs(currentWeek).add(1, 'week').toDate());
  };

  const handlePreviousMonth = () => {
    setCurrentMonth(dayjs(currentMonth).subtract(1, 'month').toDate());
  };

  const handleNextMonth = () => {
    setCurrentMonth(dayjs(currentMonth).add(1, 'month').toDate());
  };

  const getDateColor = (date: Date): string | null => {
    const today = dayjs();
    const checkDate = dayjs(date);
    const isToday = checkDate.isSame(today, 'day');
    const isTomorrow = checkDate.isSame(today.add(1, 'day'), 'day');
    const isThisWeek = checkDate.isSame(today, 'week');
    const isPast = checkDate.isBefore(today, 'day');

    // Verificar se há processos com prazo nesta data
    const hasProcesses = processes.some(process => {
      const deadline = process.dueDate;
      if (!deadline) return false;
      return dayjs(deadline).isSame(checkDate, 'day');
    });

    if (!hasProcesses) return null;

    if (isPast) return '#B81E34'; // Atrasado - vermelho
    if (isToday) return '#B38800'; // Hoje - laranja
    if (isTomorrow) return '#FCD34D'; // Amanhã - amarelo
    if (isThisWeek) return '#1877F2'; // Esta semana - azul
    return null;
  };

  const getDateStatus = (date: Date): string | null => {
    const processStatuses = processes
      .map(process => getProcessStatusForDate(process, date))
      .filter(Boolean) as string[];

    if (processStatuses.length === 0) return null;

    // Priorizar status mais importante
    if (processStatuses.includes('Atrasado') || processStatuses.includes('Em Atraso')) {
      return 'Atrasado';
    }
    if (processStatuses.includes('Em Andamento')) {
      return 'Em andamento';
    }
    if (processStatuses.includes('Concluído')) {
      return 'Concluído';
    }
    if (processStatuses.includes('Pendente')) {
      return 'Pendente';
    }

    return processStatuses[0];
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {/* Widget Prazos da Semana */}
      <Card
        sx={{
          p: 2,
          borderRadius: 2,
          border: '1px solid #E4E6EB',
          backgroundColor: '#FFFFFF'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Typography
            variant='h6'
            sx={{
              fontWeight: 700,
              fontSize: '1rem',
              color: '#212121'
            }}
          >
            Prazos da Semana
          </Typography>
          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              backgroundColor: '#1877F2',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: '0.875rem'
            }}
          >
            {weekDeadlines}
          </Box>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <IconButton size='small' onClick={handlePreviousWeek}>
            <ChevronLeftIcon fontSize='small' />
          </IconButton>
          <Typography variant='body2' sx={{ color: '#212121', fontWeight: 600 }}>
            Esta semana
          </Typography>
          <IconButton size='small' onClick={handleNextWeek}>
            <ChevronRightIcon fontSize='small' />
          </IconButton>
        </Box>

        {weekDeadlines === 0 ? (
          <Typography variant='body2' sx={{ color: '#8A8D91', textAlign: 'center', py: 2 }}>
            Nenhum prazo para esta semana
          </Typography>
        ) : (
          <Box sx={{ mb: 2 }}>
            {weekDates.map((date, index) => {
              const color = getDateColor(date);
              if (!color) return null;
              return (
                <Box
                  key={index}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    py: 0.5
                  }}
                >
                  <Box
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      backgroundColor: color
                    }}
                  />
                  <Typography variant='caption' sx={{ color: '#212121' }}>
                    {dayjs(date).format('DD/MM')}
                  </Typography>
                </Box>
              );
            })}
          </Box>
        )}

        {/* Legenda */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, mt: 2, pt: 2, borderTop: '1px solid #E4E6EB' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#B81E34' }} />
            <Typography variant='caption' sx={{ color: '#8A8D91', fontSize: '0.75rem' }}>
              Atrasado
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#B38800' }} />
            <Typography variant='caption' sx={{ color: '#8A8D91', fontSize: '0.75rem' }}>
              Hoje
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#FCD34D' }} />
            <Typography variant='caption' sx={{ color: '#8A8D91', fontSize: '0.75rem' }}>
              Amanhã
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#1877F2' }} />
            <Typography variant='caption' sx={{ color: '#8A8D91', fontSize: '0.75rem' }}>
              Esta semana
            </Typography>
          </Box>
        </Box>
      </Card>

      {/* Widget Calendário de Prazos */}
      <Card
        sx={{
          p: 2,
          borderRadius: 2,
          border: '1px solid #E4E6EB',
          backgroundColor: '#FFFFFF'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <IconButton size='small' onClick={handlePreviousMonth}>
            <ChevronLeftIcon fontSize='small' />
          </IconButton>
          <Typography
            variant='h6'
            sx={{
              fontWeight: 700,
              fontSize: '1rem',
              color: '#212121'
            }}
          >
            {dayjs(currentMonth).format('MMMM YYYY')}
          </Typography>
          <IconButton size='small' onClick={handleNextMonth}>
            <ChevronRightIcon fontSize='small' />
          </IconButton>
        </Box>

        {/* Dias da semana */}
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 0.5, mb: 1 }}>
          {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((day) => (
            <Typography
              key={day}
              variant='caption'
              sx={{
                textAlign: 'center',
                fontWeight: 600,
                color: '#8A8D91',
                fontSize: '0.75rem'
              }}
            >
              {day}
            </Typography>
          ))}
        </Box>

        {/* Calendário */}
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 0.5 }}>
          {monthDates.map((date, index) => {
            const isCurrentMonth = dayjs(date).isSame(dayjs(currentMonth), 'month');
            const status = getDateStatus(date);
            const isSelected = selectedDate && dayjs(date).isSame(dayjs(selectedDate), 'day');
            const isToday = dayjs(date).isSame(dayjs(), 'day');

            let backgroundColor = 'transparent';
            let color = isCurrentMonth ? '#212121' : '#8A8D91';

            if (status) {
              switch (status) {
                case 'Atrasado':
                  backgroundColor = '#FDE8EC';
                  color = '#B81E34';
                  break;
                case 'Em andamento':
                  backgroundColor = '#E7F3FF';
                  color = '#105BBE';
                  break;
                case 'Concluído':
                  backgroundColor = '#E6F4EA';
                  color = '#1F7A37';
                  break;
                case 'Pendente':
                  backgroundColor = '#FFF5D6';
                  color = '#B38800';
                  break;
              }
            }

            if (isSelected) {
              backgroundColor = '#1877F2';
              color = '#FFFFFF';
            }

            return (
              <Box
                key={index}
                onClick={() => onDateClick(date)}
                sx={{
                  aspectRatio: '1',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 1,
                  backgroundColor,
                  color,
                  cursor: status ? 'pointer' : 'default',
                  border: isToday ? '2px solid #1877F2' : 'none',
                  '&:hover': {
                    backgroundColor: status ? (isSelected ? '#1877F2' : '#F8F9FA') : 'transparent'
                  }
                }}
              >
                <Typography
                  variant='caption'
                  sx={{
                    fontSize: '0.75rem',
                    fontWeight: isToday ? 700 : 400
                  }}
                >
                  {dayjs(date).format('D')}
                </Typography>
              </Box>
            );
          })}
        </Box>

        {/* Legenda */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, mt: 2, pt: 2, borderTop: '1px solid #E4E6EB' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#B81E34' }} />
            <Typography variant='caption' sx={{ color: '#8A8D91', fontSize: '0.75rem' }}>
              Atrasado
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#1877F2' }} />
            <Typography variant='caption' sx={{ color: '#8A8D91', fontSize: '0.75rem' }}>
              Em andamento
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#1F7A37' }} />
            <Typography variant='caption' sx={{ color: '#8A8D91', fontSize: '0.75rem' }}>
              Concluído
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#B38800' }} />
            <Typography variant='caption' sx={{ color: '#8A8D91', fontSize: '0.75rem' }}>
              Pendente
            </Typography>
          </Box>
        </Box>

        <Typography
          variant='caption'
          sx={{
            color: '#8A8D91',
            fontSize: '0.75rem',
            mt: 1,
            display: 'block',
            textAlign: 'center'
          }}
        >
          Clique em uma data para filtrar os processos
        </Typography>
      </Card>
    </Box>
  );
};

