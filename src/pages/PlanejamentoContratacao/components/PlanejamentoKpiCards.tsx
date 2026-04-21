import {
  CheckCircleOutlined,
  HourglassEmptyOutlined,
  RateReviewOutlined,
  TrendingUpOutlined,
  WarningAmberOutlined
} from '@mui/icons-material';
import { Box, Card, CardContent, Grid, Skeleton, Typography } from '@mui/material';
import type { PlanejamentoKpis } from '@/globals/types';

type KpiCardProps = {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  bg: string;
};

const KpiCard = ({ label, value, icon, color, bg }: KpiCardProps) => (
  <Card sx={{ height: '100%', border: '1px solid', borderColor: 'divider', boxShadow: 1 }}>
    <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2, p: '16px !important' }}>
      <Box sx={{ width: 44, height: 44, borderRadius: 2, backgroundColor: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color, flexShrink: 0 }}>
        {icon}
      </Box>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography sx={{ fontWeight: 700, fontSize: '1.375rem', lineHeight: 1, color: 'text.primary' }}>
          {value}
        </Typography>
        <Typography variant='body2' sx={{ color: 'text.secondary', mt: 0.5, fontSize: '0.8rem', lineHeight: 1.2 }}>
          {label}
        </Typography>
      </Box>
    </CardContent>
  </Card>
);

type Props = { kpis?: PlanejamentoKpis; loading: boolean; onAprovacaoClick?: () => void };

export const PlanejamentoKpiCards = ({ kpis, loading }: Props) => {
  if (loading) {
    return (
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {Array.from({ length: 6 }).map((_, i) => (
          <Grid key={i} size={{ xs: 12, sm: 6, md: 4, lg: 2 }}>
            <Skeleton variant='rectangular' height={88} sx={{ borderRadius: 2 }} />
          </Grid>
        ))}
      </Grid>
    );
  }

  if (!kpis) return null;

  const cards: KpiCardProps[] = [
    {
      label: 'Em Andamento',
      value: kpis.emAndamento,
      icon: <TrendingUpOutlined />,
      color: '#1877F2',
      bg: '#E7F3FF'
    },
    {
      label: 'Esta Semana',
      value: kpis.emAndamentoEstaSemana,
      icon: <TrendingUpOutlined />,
      color: '#0369a1',
      bg: '#e0f2fe'
    },
    {
      label: 'Prazos Críticos',
      value: kpis.prazosCriticos,
      icon: <WarningAmberOutlined />,
      color: kpis.prazosCriticos > 0 ? '#ba1a1a' : '#64748b',
      bg: kpis.prazosCriticos > 0 ? '#FEE2E2' : '#f1f5f9'
    },
    {
      label: 'Concluídos (Mês)',
      value: kpis.concluidosMes,
      icon: <CheckCircleOutlined />,
      color: '#1F7A37',
      bg: '#DCFCE7'
    },
    {
      label: 'Aguard. Aprovação',
      value: kpis.aguardandoAprovacao,
      icon: <HourglassEmptyOutlined />,
      color: '#C2410C',
      bg: '#FFEDD5'
    },
    {
      label: 'Aguard. Revisão',
      value: kpis.aguardandoRevisao,
      icon: <RateReviewOutlined />,
      color: '#B38800',
      bg: '#FEF9C3'
    }
  ];

  return (
    <Grid container spacing={2} sx={{ mb: 3 }}>
      {cards.map((card) => (
        <Grid key={card.label} size={{ xs: 12, sm: 6, md: 4, lg: 2 }}>
          <KpiCard {...card} />
        </Grid>
      ))}
    </Grid>
  );
};
