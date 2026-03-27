import {
  AccessTimeOutlined,
  BalanceOutlined,
  DrawOutlined,
  InfoOutlined,
  NotificationsActiveOutlined
} from '@mui/icons-material';
import { Box, Button, Card, Chip, Divider, Skeleton, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import type { AlertaCritico } from '@/globals/types';

const ALERT_CONFIG: Record<string, { icon: React.ReactNode; bg: string; color: string }> = {
  vencido:    { icon: <AccessTimeOutlined sx={{ fontSize: 22 }} />,  bg: 'rgba(186,26,26,0.05)',  color: '#ba1a1a' },
  assinatura: { icon: <DrawOutlined sx={{ fontSize: 22 }} />,        bg: '#fff7ed',               color: '#ea580c' },
  juridico:   { icon: <BalanceOutlined sx={{ fontSize: 22 }} />,     bg: '#fefce8',               color: '#ca8a04' },
  outro:      { icon: <InfoOutlined sx={{ fontSize: 22 }} />,        bg: '#f8fafc',               color: '#64748b' }
};

type Props = { alerts?: AlertaCritico[]; loading: boolean };

export const AlertasCriticos = ({ alerts, loading }: Props) => {
  const navigate = useNavigate();

  return (
    <Card sx={{ border: '1px solid', borderColor: 'divider', boxShadow: '0 2px 15px -3px rgba(0,0,0,0.07)', overflow: 'hidden' }}>
      <Box sx={{ px: 4, py: 2.5, borderBottom: '1px solid #f1f5f9', backgroundColor: '#fafbfc', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <NotificationsActiveOutlined sx={{ color: '#ba1a1a', fontSize: 22 }} />
          <Typography sx={{ fontSize: '0.8125rem', fontWeight: 900, letterSpacing: '0.1em', color: '#0f172a', textTransform: 'uppercase' }}>
            O que exige sua atenção
          </Typography>
        </Box>
        {!loading && alerts && alerts.length > 0 && (
          <Chip
            label={`${alerts.length} Alerta${alerts.length > 1 ? 's' : ''} Crítico${alerts.length > 1 ? 's' : ''}`}
            size='small'
            sx={{ backgroundColor: 'rgba(186,26,26,0.1)', color: '#ba1a1a', fontWeight: 900, fontSize: '0.625rem', textTransform: 'uppercase', letterSpacing: '0.1em', borderRadius: '999px' }}
          />
        )}
      </Box>

      {loading ? (
        <Box sx={{ p: 2 }}>
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} variant='rectangular' height={64} sx={{ borderRadius: 1, mb: 1 }} />
          ))}
        </Box>
      ) : alerts?.length === 0 ? (
        <Box sx={{ px: 4, py: 5, textAlign: 'center' }}>
          <Typography variant='body2' color='text.secondary'>Nenhum alerta crítico no momento</Typography>
        </Box>
      ) : (
        alerts?.map((alert, idx) => {
          const cfg = ALERT_CONFIG[alert.alertType] ?? ALERT_CONFIG.outro;
          return (
            <Box key={`${alert.processId}-${alert.alertType}`}>
              <Box sx={{ px: 4, py: 2.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between', '&:hover': { backgroundColor: '#fafbfc' }, transition: 'background 0.15s' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5 }}>
                  <Box sx={{ width: 44, height: 44, borderRadius: 2, backgroundColor: cfg.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: cfg.color, flexShrink: 0 }}>
                    {cfg.icon}
                  </Box>
                  <Box>
                    <Typography sx={{ fontWeight: 900, color: '#0f172a', fontSize: '0.9375rem', letterSpacing: '-0.01em' }}>
                      Proc. <Box component='span' sx={{ color: '#1877F2' }}>{alert.processNumber}</Box>
                    </Typography>
                    <Typography sx={{ fontSize: '0.875rem', color: '#64748b', mt: 0.25 }}>
                      {alert.object} —{' '}
                      <Box component='span' sx={{ color: cfg.color, fontWeight: 700, textDecoration: 'underline', textDecorationColor: `${cfg.color}50` }}>
                        {alert.description}
                      </Box>
                    </Typography>
                  </Box>
                </Box>
                <Button
                  variant='outlined'
                  size='small'
                  onClick={() => navigate(`/processos-gerencia/${alert.processId}`)}
                  sx={{ textTransform: 'none', fontWeight: 600, fontSize: '0.875rem', borderRadius: 2, flexShrink: 0, ml: 2, borderColor: cfg.color, color: cfg.color, '&:hover': { backgroundColor: cfg.color, color: '#fff', borderColor: cfg.color } }}
                >
                  {alert.alertType === 'vencido' ? 'Resolver' : 'Abrir'}
                </Button>
              </Box>
              {idx < (alerts?.length ?? 0) - 1 && <Divider />}
            </Box>
          );
        })
      )}
    </Card>
  );
};
