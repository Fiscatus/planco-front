import {
  Box,
  Card,
  Typography
} from '@mui/material';
import {
  Assignment as AssignmentIcon,
  CheckCircle as CheckCircleIcon,
  ErrorOutline as ErrorOutlineIcon,
  Schedule as ScheduleIcon,
  Timer as TimerIcon,
  Event as EventIcon
} from '@mui/icons-material';
import type { FolderStatsDto } from '@/globals/types';
import dayjs from 'dayjs';

interface StatsCardsProps {
  stats: FolderStatsDto;
}

export const StatsCards = ({ stats }: StatsCardsProps) => {
  const cards = [
    {
      label: 'TOTAL DE PROCESSOS',
      value: stats.totalProcessos.toString(),
      icon: <AssignmentIcon sx={{ color: '#FFFFFF' }} />,
      gradient: 'linear-gradient(180deg, #1877F2 0%, #1567d3 100%)'
    },
    {
      label: 'PROCESSOS EM ANDAMENTO',
      value: stats.processosAndamento.toString(),
      icon: <TimerIcon sx={{ color: '#FFFFFF' }} />,
      gradient: 'linear-gradient(180deg, #06B6D4 0%, #0891B2 100%)'
    },
    {
      label: 'PROCESSOS EM ATRASO',
      value: stats.processosAtraso.toString(),
      icon: <ErrorOutlineIcon sx={{ color: '#FFFFFF' }} />,
      gradient: 'linear-gradient(180deg, #EF4444 0%, #DC2626 100%)'
    },
    {
      label: 'PROCESSOS CONCLUÍDOS',
      value: stats.processosConcluidos.toString(),
      icon: <CheckCircleIcon sx={{ color: '#FFFFFF' }} />,
      gradient: 'linear-gradient(180deg, #22C55E 0%, #16A34A 100%)'
    },
    {
      label: 'ÚLTIMA MODIFICAÇÃO',
      value: dayjs(stats.ultimaModificacao).format('DD/MM/YYYY'),
      icon: <ScheduleIcon sx={{ color: '#FFFFFF' }} />,
      gradient: 'linear-gradient(180deg, #F59E0B 0%, #D97706 100%)'
    },
    {
      label: 'DATA DE CRIAÇÃO',
      value: dayjs(stats.dataCriacao).format('DD/MM/YYYY'),
      icon: <EventIcon sx={{ color: '#FFFFFF' }} />,
      gradient: 'linear-gradient(180deg, #10B981 0%, #059669 100%)'
    }
  ];

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: {
          xs: '1fr',
          sm: 'repeat(2, 1fr)',
          md: 'repeat(3, 1fr)',
          lg: 'repeat(6, 1fr)'
        },
        gap: { xs: 1.5, sm: 2, md: 2 },
        mb: { xs: 3, sm: 4, md: 5 }
      }}
    >
      {cards.map((card, index) => (
        <Card
          key={index}
          sx={{
            borderRadius: { xs: '10px', sm: '12px' },
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            p: { xs: 1.5, sm: 2, md: 2 },
            background: card.gradient,
            color: '#FFFFFF',
            transition: 'all 200ms ease-in-out',
            overflow: 'hidden',
            '&:hover': {
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
              transform: 'translateY(-2px)',
              '& .icon-container': {
                transform: 'scale(1.05)'
              }
            }
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: { xs: 1, sm: 1.5 } }}>
            <Box
              className='icon-container'
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: { xs: 40, sm: 44, md: 48 },
                height: { xs: 40, sm: 44, md: 48 },
                borderRadius: '8px',
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                backdropFilter: 'blur(4px)',
                transition: 'transform 200ms ease-in-out',
                flexShrink: 0
              }}
            >
              <Box sx={{ 
                fontSize: { xs: 20, sm: 22, md: 24 },
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {card.icon}
              </Box>
            </Box>
            <Box sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'flex-start' }}>
              <Typography
                variant='caption'
                sx={{
                  display: 'block',
                  fontWeight: 600,
                  color: 'rgba(255, 255, 255, 0.9)',
                  fontSize: { xs: '10px', sm: '11px' },
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  mb: { xs: 0.25, sm: 0.5 },
                  lineHeight: 1.2
                }}
              >
                {card.label}
              </Typography>
              <Typography
                variant='h6'
                sx={{
                  fontWeight: 700,
                  color: '#FFFFFF',
                  fontSize: { xs: '18px', sm: '20px', md: '24px' },
                  lineHeight: { xs: '22px', sm: '26px', md: '30px' },
                  height: { xs: '22px', sm: '26px', md: '30px' }
                }}
              >
                {card.value}
              </Typography>
            </Box>
          </Box>
        </Card>
      ))}
    </Box>
  );
};

