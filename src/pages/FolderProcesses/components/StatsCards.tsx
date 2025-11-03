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
      icon: <AssignmentIcon sx={{ fontSize: 28, color: '#1877F2' }} />,
      bgColor: '#EFF6FF',
      iconBg: '#DBEAFE'
    },
    {
      label: 'PROCESSOS EM ANDAMENTO',
      value: stats.processosAndamento.toString(),
      icon: <TimerIcon sx={{ fontSize: 28, color: '#0EA5E9' }} />,
      bgColor: '#F0F9FF',
      iconBg: '#E0F2FE'
    },
    {
      label: 'PROCESSOS EM ATRASO',
      value: stats.processosAtraso.toString(),
      icon: <ErrorOutlineIcon sx={{ fontSize: 28, color: '#EF4444' }} />,
      bgColor: '#FEF2F2',
      iconBg: '#FEE2E2'
    },
    {
      label: 'PROCESSOS CONCLUÍDOS',
      value: stats.processosConcluidos.toString(),
      icon: <CheckCircleIcon sx={{ fontSize: 28, color: '#10B981' }} />,
      bgColor: '#F0FDF4',
      iconBg: '#D1FAE5'
    },
    {
      label: 'ÚLTIMA MODIFICAÇÃO',
      value: dayjs(stats.ultimaModificacao).format('DD/MM/YYYY'),
      icon: <ScheduleIcon sx={{ fontSize: 28, color: '#F59E0B' }} />,
      bgColor: '#FFFBEB',
      iconBg: '#FEF3C7'
    },
    {
      label: 'DATA DE CRIAÇÃO',
      value: dayjs(stats.dataCriacao).format('DD/MM/YYYY'),
      icon: <EventIcon sx={{ fontSize: 28, color: '#10B981' }} />,
      bgColor: '#F0FDF4',
      iconBg: '#D1FAE5'
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
        gap: 2.5,
        mb: 4
      }}
    >
      {cards.map((card, index) => (
        <Card
          key={index}
          sx={{
            borderRadius: 3,
            border: '1px solid',
            borderColor: 'divider',
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)',
            p: 2.5,
            backgroundColor: '#ffffff',
            transition: 'all 0.2s ease-in-out',
            '&:hover': {
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              transform: 'translateY(-2px)'
            }
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 56,
                height: 56,
                borderRadius: 2,
                backgroundColor: card.iconBg
              }}
            >
              {card.icon}
            </Box>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography
                variant='caption'
                sx={{
                  display: 'block',
                  fontWeight: 600,
                  color: '#64748b',
                  fontSize: '0.6875rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  mb: 0.5
                }}
              >
                {card.label}
              </Typography>
              <Typography
                variant='h6'
                sx={{
                  fontWeight: 700,
                  color: '#0f172a',
                  fontSize: '1.25rem',
                  lineHeight: 1.2
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

