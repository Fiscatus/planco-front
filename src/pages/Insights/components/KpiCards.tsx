import {
  AccessTimeOutlined,
  CheckCircleOutlined,
  HourglassEmptyOutlined,
  PeopleAltOutlined,
  PendingActionsOutlined,
  WarningAmberOutlined
} from '@mui/icons-material';
import { Box, Card, CardContent, Grid, Skeleton, Typography } from '@mui/material';
import type { InsightsResponse } from '@/globals/types';

type KpiCardProps = {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  bg: string;
};

const KpiCard = ({ label, value, icon, color, bg }: KpiCardProps) => (
  <Card sx={{ height: '100%', border: '1px solid', borderColor: 'divider', boxShadow: 1 }}>
    <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2, p: '20px !important' }}>
      <Box
        sx={{
          width: 48,
          height: 48,
          borderRadius: 2,
          backgroundColor: bg,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color,
          flexShrink: 0
        }}
      >
        {icon}
      </Box>
      <Box>
        <Typography sx={{ fontWeight: 700, fontSize: '1.5rem', lineHeight: 1, color: 'text.primary' }}>
          {value}
        </Typography>
        <Typography variant='body2' sx={{ color: 'text.secondary', mt: 0.5, fontSize: '0.8rem' }}>
          {label}
        </Typography>
      </Box>
    </CardContent>
  </Card>
);

type Props = { data?: InsightsResponse; loading: boolean };

export const KpiCards = ({ data, loading }: Props) => {
  if (loading) {
    return (
      <Grid container spacing={2}>
        {Array.from({ length: 6 }).map((_, i) => (
          <Grid key={i} size={{ xs: 12, sm: 6, md: 4, lg: 2 }}>
            <Skeleton variant='rectangular' height={88} sx={{ borderRadius: 2 }} />
          </Grid>
        ))}
      </Grid>
    );
  }

  if (!data) return null;

  const cards: KpiCardProps[] = [
    { label: 'Total de Processos', value: data.processes.total, icon: <PendingActionsOutlined />, color: '#1877F2', bg: '#E7F3FF' },
    { label: 'Em Atraso', value: data.processes.overdue, icon: <WarningAmberOutlined />, color: '#F02849', bg: '#FEE2E2' },
    { label: 'Vencem em 7 dias', value: data.processes.dueSoon, icon: <AccessTimeOutlined />, color: '#B38800', bg: '#FEF9C3' },
    { label: 'Concluídos', value: data.processes.byStatus['Concluído'] ?? 0, icon: <CheckCircleOutlined />, color: '#1F7A37', bg: '#DCFCE7' },
    { label: 'Aprovações Pendentes', value: data.approvals.pending, icon: <HourglassEmptyOutlined />, color: '#C2410C', bg: '#FFEDD5' },
    { label: 'Usuários Ativos', value: `${data.users.active} / ${data.users.total}`, icon: <PeopleAltOutlined />, color: '#1877F2', bg: '#E7F3FF' }
  ];

  return (
    <Grid container spacing={2}>
      {cards.map((card) => (
        <Grid key={card.label} size={{ xs: 12, sm: 6, md: 4, lg: 2 }}>
          <KpiCard {...card} />
        </Grid>
      ))}
    </Grid>
  );
};
