import {
  AccessTimeOutlined,
  BalanceOutlined,
  DrawOutlined,
  InfoOutlined,
  NotificationsActiveOutlined,
  ScheduleOutlined
} from '@mui/icons-material';
import { Box, Button, Card, Chip, Divider, MenuItem, Pagination, Select, Skeleton, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import type { AlertaCritico, Paginated } from '@/globals/types';

const ALERT_CONFIG: Record<string, { icon: React.ReactNode; bg: string; color: string; btnLabel: string }> = {
  vencido:        { icon: <AccessTimeOutlined sx={{ fontSize: 22 }} />, bg: 'rgba(186,26,26,0.05)',  color: '#ba1a1a', btnLabel: 'Resolver' },
  etapa_atrasada: { icon: <ScheduleOutlined sx={{ fontSize: 22 }} />,   bg: 'rgba(234,88,12,0.07)', color: '#ea580c', btnLabel: 'Abrir' },
  assinatura:     { icon: <DrawOutlined sx={{ fontSize: 22 }} />,       bg: '#fff7ed',               color: '#ea580c', btnLabel: 'Abrir' },
  juridico:       { icon: <BalanceOutlined sx={{ fontSize: 22 }} />,    bg: '#fefce8',               color: '#ca8a04', btnLabel: 'Abrir' },
  outro:          { icon: <InfoOutlined sx={{ fontSize: 22 }} />,       bg: '#f8fafc',               color: '#64748b', btnLabel: 'Abrir' },
};

const ALERT_ORDER: AlertaCritico['alertType'][] = ['vencido', 'etapa_atrasada', 'assinatura', 'juridico', 'outro'];

const sortAlerts = (alerts: AlertaCritico[]) =>
  [...alerts].sort((a, b) => ALERT_ORDER.indexOf(a.alertType) - ALERT_ORDER.indexOf(b.alertType));

type Props = {
  data?: Paginated<AlertaCritico>;
  loading: boolean;
  page: number;
  limit: number;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
};

export const AlertasCriticos = ({ data, loading, page, limit, onPageChange, onLimitChange }: Props) => {
  const navigate = useNavigate();
  const sorted = sortAlerts(data?.items ?? []);
  const total = data?.total ?? 0;
  const totalPages = data?.totalPages ?? 1;
  const from = total === 0 ? 0 : (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);

  return (
    <Card sx={{ border: '1px solid', borderColor: 'divider', boxShadow: '0 2px 15px -3px rgba(0,0,0,0.07)', overflow: 'hidden' }}>
      <Box sx={{ px: 4, py: 2.5, borderBottom: '1px solid #f1f5f9', backgroundColor: '#fafbfc', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <NotificationsActiveOutlined sx={{ color: '#ba1a1a', fontSize: 22 }} />
          <Typography sx={{ fontSize: '0.8125rem', fontWeight: 900, letterSpacing: '0.1em', color: '#0f172a', textTransform: 'uppercase' }}>
            O que exige sua atenção
          </Typography>
        </Box>
        {!loading && total > 0 && (
          <Chip
            label={`${total} Alerta${total > 1 ? 's' : ''} Crítico${total > 1 ? 's' : ''}`}
            size='small'
            sx={{ backgroundColor: 'rgba(186,26,26,0.1)', color: '#ba1a1a', fontWeight: 900, fontSize: '0.625rem', textTransform: 'uppercase', letterSpacing: '0.1em', borderRadius: '999px' }}
          />
        )}
      </Box>

      {loading ? (
        <Box sx={{ p: 2 }}>
          {Array.from({ length: limit }).map((_, i) => (
            <Skeleton key={i} variant='rectangular' height={64} sx={{ borderRadius: 1, mb: 1 }} />
          ))}
        </Box>
      ) : sorted.length === 0 ? (
        <Box sx={{ px: 4, py: 5, textAlign: 'center' }}>
          <Typography variant='body2' color='text.secondary'>Nenhum alerta crítico no momento</Typography>
        </Box>
      ) : (
        sorted.map((alert, idx) => {
          const cfg = ALERT_CONFIG[alert.alertType] ?? ALERT_CONFIG.outro;
          return (
            <Box key={`${alert.processId}-${alert.alertType}-${idx}`}>
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
                      {alert.object && <>{alert.object} — </>}
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
                  {cfg.btnLabel}
                </Button>
              </Box>
              {idx < sorted.length - 1 && <Divider />}
            </Box>
          );
        })
      )}

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
