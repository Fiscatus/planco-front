import {
  AccountTreeOutlined,
  AssignmentOutlined,
  CalendarTodayOutlined,
  FolderOutlined,
  FormatListBulletedOutlined,
  HomeOutlined,
  InsightsOutlined,
  SearchOutlined,
  TaskAltOutlined
} from '@mui/icons-material';
import {
  Box,
  Button,
  Card,
  Chip,
  Divider,
  Grid,
  Skeleton,
  Typography
} from '@mui/material';
import dayjs from 'dayjs';
import 'dayjs/locale/pt-br';
import { useNavigate } from 'react-router-dom';
import type { Pendencia, ProximoPrazo } from '@/globals/types';

dayjs.locale('pt-br');

const URGENCY: Record<string, { color: string; bg: string; label: string }> = {
  critico:    { color: '#ba1a1a', bg: 'rgba(186,26,26,0.08)', label: 'Crítico' },
  prioritario:{ color: '#ea580c', bg: 'rgba(234,88,12,0.08)',  label: 'Prioritário' },
  aguardando: { color: '#ca8a04', bg: 'rgba(202,138,4,0.08)',  label: 'Aguardando' },
  normal:     { color: '#64748b', bg: 'rgba(100,116,139,0.08)', label: 'Normal' }
};

const TYPE_ICON: Record<string, React.ReactNode> = {
  tarefa:     <TaskAltOutlined sx={{ fontSize: 22 }} />,
  assinatura: <AssignmentOutlined sx={{ fontSize: 22 }} />,
  validacao:  <FormatListBulletedOutlined sx={{ fontSize: 22 }} />,
  timeline:   <CalendarTodayOutlined sx={{ fontSize: 22 }} />,
  outro:      <TaskAltOutlined sx={{ fontSize: 22 }} />
};

const QUICK_ACTIONS = [
  { label: 'Planejamento', icon: <HomeOutlined sx={{ fontSize: 24 }} />,        path: '/planejamento-da-contratacao' },
  { label: 'Processos',    icon: <SearchOutlined sx={{ fontSize: 24 }} />,       path: '/processos-gerencia' },
  { label: 'Modelos Fluxo',icon: <AccountTreeOutlined sx={{ fontSize: 24 }} />,  path: '/modelos-fluxo' },
  { label: 'Pastas',       icon: <FolderOutlined sx={{ fontSize: 24 }} />,        path: '/gerenciamento-pastas' },
  { label: 'Insights',     icon: <InsightsOutlined sx={{ fontSize: 24 }} />,      path: '/insights' },
  { label: 'Novo Processo',icon: <AssignmentOutlined sx={{ fontSize: 24 }} />,    path: '/processos-gerencia' }
];

type Props = {
  pendencias?: Pendencia[];
  proximosPrazos?: ProximoPrazo[];
  loading: boolean;
};

export const PlanejamentoSidebar = ({ pendencias, proximosPrazos, loading }: Props) => {
  const navigate = useNavigate();

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>

      {/* Minhas Pendências */}
      <Card sx={{ border: '1px solid', borderColor: '#e2e8f0', boxShadow: '0 1px 2px 0 rgba(0,0,0,0.05)', overflow: 'hidden', backgroundColor: '#ffffff' }}>
        <Box sx={{ px: 3, py: 3, borderBottom: '1px solid #f1f5f9', backgroundColor: '#fafbfc' }}>
          <Typography sx={{ fontWeight: 600, fontSize: '1rem', color: '#0f172a', letterSpacing: '-0.01em' }}>
            Minhas pendências
          </Typography>
        </Box>

        <Box sx={{ p: 1.5, display: 'flex', flexDirection: 'column', gap: 1 }}>
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} variant='rectangular' height={80} sx={{ borderRadius: 2 }} />
            ))
          ) : pendencias?.length === 0 ? (
            <Box sx={{ py: 6, textAlign: 'center' }}>
              <Typography variant='body2' color='text.secondary'>Sem pendências</Typography>
            </Box>
          ) : (
            pendencias?.map((p) => {
              const urg = URGENCY[p.urgency] ?? URGENCY.normal;
              const isTimeline = p.type === 'timeline';
              const hasDate = isTimeline && p.date;
              const date = hasDate ? dayjs(p.date) : null;

              return (
                <Box
                  key={p.pendenciaId}
                  onClick={() => p.processId && navigate(`/processos-gerencia/${p.processId}`)}
                  sx={{
                    display: 'flex',
                    alignItems: 'stretch',
                    borderRadius: 2,
                    border: '1px solid #f1f5f9',
                    overflow: 'hidden',
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                    '&:hover': { borderColor: urg.color, backgroundColor: '#fafbfc' }
                  }}
                >
                  {/* Barra lateral colorida por urgência */}
                  <Box sx={{ width: 4, flexShrink: 0, backgroundColor: urg.color }} />

                  {/* Ícone */}
                  <Box sx={{ width: 52, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: urg.bg, flexShrink: 0, color: urg.color }}>
                    {TYPE_ICON[p.type] ?? TYPE_ICON.outro}
                  </Box>

                  {/* Conteúdo */}
                  <Box sx={{ flex: 1, minWidth: 0, px: 2, py: 1.75 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
                      <Typography sx={{ fontSize: '0.9375rem', fontWeight: 600, color: '#1e293b', lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
                        {p.title}
                      </Typography>
                      <Chip
                        label={urg.label}
                        size='small'
                        sx={{ backgroundColor: urg.bg, color: urg.color, fontWeight: 700, fontSize: '0.625rem', textTransform: 'uppercase', letterSpacing: '0.04em', height: 20, flexShrink: 0, borderRadius: 1 }}
                      />
                    </Box>

                    <Typography sx={{ fontSize: '0.8125rem', color: '#64748b', mt: 0.5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {p.detail}
                    </Typography>

                    {/* Data para timeline */}
                    {date && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.75 }}>
                        <CalendarTodayOutlined sx={{ fontSize: 13, color: urg.color }} />
                        <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: urg.color }}>
                          {date.format('DD/MM/YYYY [às] HH:mm')}
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </Box>
              );
            })
          )}
        </Box>

        <Divider />
        <Box sx={{ p: 1.5 }}>
          <Button
            variant='text'
            fullWidth
            onClick={() => navigate('/processos-gerencia')}
            sx={{ textTransform: 'none', fontWeight: 600, fontSize: '0.875rem', color: 'primary.main', borderRadius: 2, py: 1, '&:hover': { backgroundColor: '#EBF3FF' } }}
          >
            Ver todas as pendências
          </Button>
        </Box>
      </Card>

      {/* Prazos dos Processos da Gerência */}
      <Card sx={{ border: '1px solid', borderColor: '#e2e8f0', boxShadow: '0 1px 2px 0 rgba(0,0,0,0.05)', overflow: 'hidden', backgroundColor: '#ffffff' }}>
        <Box sx={{ px: 3, py: 3, borderBottom: '1px solid #f1f5f9', backgroundColor: '#fafbfc' }}>
          <Typography sx={{ fontWeight: 600, fontSize: '1rem', color: '#0f172a', letterSpacing: '-0.01em' }}>
            Prazos dos Processos da Gerência
          </Typography>
          <Typography sx={{ fontSize: '0.8125rem', color: '#64748b', mt: 0.25 }}>
            Próximos prazos
          </Typography>
        </Box>

        <Box sx={{ p: 2.5 }}>
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} variant='rectangular' height={88} sx={{ borderRadius: 2, mb: 2 }} />
            ))
          ) : proximosPrazos?.length === 0 ? (
            <Box sx={{ py: 6, textAlign: 'center' }}>
              <Typography variant='body2' color='text.secondary'>Nenhum prazo próximo</Typography>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {proximosPrazos?.map((prazo) => {
                const date = dayjs(prazo.date);
                const isToday = date.isSame(dayjs(), 'day');
                const isOverdue = date.isBefore(dayjs(), 'day');
                const chipColor = isOverdue ? '#ba1a1a' : isToday ? '#ca8a04' : '#1877F2';
                const chipBg = isOverdue ? 'rgba(186,26,26,0.05)' : isToday ? 'rgba(202,138,4,0.06)' : 'rgba(24,119,242,0.05)';
                const chipBorder = isOverdue ? 'rgba(186,26,26,0.15)' : isToday ? 'rgba(202,138,4,0.2)' : 'rgba(24,119,242,0.15)';

                return (
                  <Box
                    key={prazo.prazoId}
                    onClick={() => prazo.processId && navigate(`/processos-gerencia/${prazo.processId}`)}
                    sx={{ display: 'flex', alignItems: 'center', gap: 3, p: 3, borderRadius: 2, border: '1px solid #f1f5f9', '&:hover': { backgroundColor: '#EBF3FF', borderColor: 'rgba(24,119,242,0.15)' }, transition: 'all 0.15s' }}
                  >
                    <Box sx={{ width: 68, height: 68, borderRadius: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexShrink: 0, backgroundColor: chipBg, border: '1px solid', borderColor: chipBorder }}>
                      <Typography sx={{ fontSize: '0.75rem', fontWeight: 900, textTransform: 'uppercase', color: chipColor, lineHeight: 1, letterSpacing: '0.05em' }}>
                        {date.format('MMM')}
                      </Typography>
                      <Typography sx={{ fontSize: '1.75rem', fontWeight: 900, color: chipColor, lineHeight: 1.1 }}>
                        {date.format('DD')}
                      </Typography>
                    </Box>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.25 }}>
                        {prazo.processNumber && (
                          <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#1877F2' }}>
                            {prazo.processNumber}
                          </Typography>
                        )}
                      </Box>
                      <Typography sx={{ fontSize: '1rem', fontWeight: 600, color: '#0f172a', lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {prazo.title}
                      </Typography>
                      <Typography sx={{ fontSize: '0.875rem', color: '#64748b', mt: 0.5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {prazo.description}
                      </Typography>
                      <Typography sx={{ fontSize: '0.8125rem', color: chipColor, fontWeight: 600, mt: 0.5 }}>
                        {date.format('DD/MM/YYYY')}{isToday && ' · Hoje'}{isOverdue && ' · Vencido'}
                      </Typography>
                    </Box>
                  </Box>
                );
              })}
            </Box>
          )}
        </Box>

        <Divider />
        <Box sx={{ p: 1.5 }}>
          <Button
            variant='text'
            fullWidth
            onClick={() => navigate('/processos-gerencia')}
            sx={{ textTransform: 'none', fontWeight: 600, fontSize: '0.875rem', color: 'primary.main', borderRadius: 2, py: 1, '&:hover': { backgroundColor: '#EBF3FF' } }}
          >
            Ver todos os processos
          </Button>
        </Box>
      </Card>

      {/* Ações Rápidas */}
      <Box>
        <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', mb: 1.5, px: 0.5 }}>
          Ações Rápidas
        </Typography>
        <Grid container spacing={2}>
          {QUICK_ACTIONS.map((action) => (
            <Grid key={action.label} size={{ xs: 6 }}>
              <Box
                onClick={() => navigate(action.path)}
                sx={{ backgroundColor: '#ffffff', p: 2.5, borderRadius: 2, border: '1px solid #e2e8f0', boxShadow: '0 1px 2px 0 rgba(0,0,0,0.05)', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 2, transition: 'all 0.2s ease-in-out', '&:hover': { borderColor: '#1877F2', backgroundColor: '#EBF3FF', transform: 'translateY(-1px)', boxShadow: '0 4px 8px rgba(24,119,242,0.1)', '& .qa-icon': { backgroundColor: '#E7F3FF', color: '#1877F2' }, '& .qa-label': { color: '#0f172a' } } }}
              >
                <Box className='qa-icon' sx={{ width: 52, height: 52, borderRadius: 2, backgroundColor: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', transition: 'all 0.2s' }}>
                  {action.icon}
                </Box>
                <Typography className='qa-label' sx={{ fontSize: '0.8125rem', fontWeight: 600, color: '#475569', lineHeight: 1.2, transition: 'color 0.2s' }}>
                  {action.label}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Box>
  );
};
