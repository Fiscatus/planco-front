import { Alert, Box, Button, Typography } from '@mui/material';
import { BusinessCenter as BusinessCenterIcon, Refresh as RefreshIcon } from '@mui/icons-material';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useActiveDepartment } from '@/contexts';
import { usePlanejamentoDashboard } from '@/hooks/usePlanejamentoDashboard';
import { AlertasCriticos } from './components/AlertasCriticos';
import { PlanejamentoKpiCards } from './components/PlanejamentoKpiCards';
import { PlanejamentoSidebar } from './components/PlanejamentoSidebar';
import { ProcessosRecentes } from './components/ProcessosRecentes';

const PlanejamentoContratacaoPage = () => {
  const navigate = useNavigate();
  const { activeDepartment } = useActiveDepartment();

  const [alertasPage, setAlertasPage] = useState(1);
  const [alertasLimit, setAlertasLimit] = useState(5);
  const [recentesPage, setRecentesPage] = useState(1);
  const [recentesLimit, setRecentesLimit] = useState(5);

  const { data, isLoading, isError, refetch } = usePlanejamentoDashboard({
    departmentId: activeDepartment?._id,
    alertasPage,
    alertasLimit,
    recentesPage,
    recentesLimit,
  });

  if (!activeDepartment) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', bgcolor: '#F8FAFC', py: 4, px: 2 }}>
        <Box sx={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, maxWidth: 480 }}>
          <BusinessCenterIcon sx={{ fontSize: 100, color: '#1877F2', opacity: 0.8 }} />
          <Box>
            <Typography variant='h2' sx={{ fontSize: { xs: '1.25rem', md: '1.5rem' }, fontWeight: 600, color: '#1f2937', mb: 1 }}>
              Nenhuma gerência selecionada
            </Typography>
            <Typography variant='body1' sx={{ color: '#6b7280', fontSize: '0.9375rem', lineHeight: 1.6 }}>
              Selecione uma gerência na seção de minhas gerências.
            </Typography>
          </Box>
          <Button
            variant='contained'
            startIcon={<RefreshIcon />}
            onClick={() => window.location.reload()}
            sx={{ bgcolor: '#1877F2', textTransform: 'none', fontWeight: 600, px: 4, py: 1.5, borderRadius: 2, boxShadow: 'none', fontSize: '0.9375rem', '&:hover': { bgcolor: '#166fe5', boxShadow: '0 4px 12px rgba(24,119,242,0.3)' } }}
          >
            Recarregar página
          </Button>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%' }}>
      {/* Header — padrão GerenciaProcessesPage */}
      <Box
        sx={{
          py: { xs: 2, sm: 2.5, md: 3 },
          px: { xs: 2, sm: 3, md: 6, lg: 8 },
          '@media (max-width: 767px)': { py: 2, px: 1.5 },
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', sm: 'center' },
          gap: { xs: 2, sm: 2.5, md: 3 }
        }}
      >
        <Box sx={{ width: { xs: '100%', md: 'auto' } }}>
          <Typography
            variant='h4'
            sx={{ fontWeight: 700, fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2.25rem' }, color: '#0f172a', mb: { xs: 0.75, md: 1 }, lineHeight: { xs: 1.3, md: 1.2 } }}
          >
            Planejamento da Contratação
          </Typography>
          <Typography
            variant='body1'
            sx={{ color: '#64748b', fontSize: { xs: '0.875rem', sm: '0.9375rem', md: '1rem' }, maxWidth: { xs: '100%', md: '600px' }, lineHeight: { xs: 1.5, md: 1.6 }, mt: { xs: 0.5, md: 0 } }}
          >
            Acompanhe pendências, prazos e processos em andamento da gerência{' '}
            <Box component='span' sx={{ fontWeight: 700, color: '#0f172a' }}>
              {activeDepartment.department_name}
            </Box>
            .
          </Typography>
        </Box>
      </Box>

      {/* Conteúdo Principal */}
      <Box
        sx={{
          px: { xs: 2, sm: 3, md: 6, lg: 8 },
          '@media (max-width: 767px)': { px: 1.5 },
          pb: { xs: 4, sm: 5, md: 6 }
        }}
      >
        {isError && (
          <Alert severity='error' sx={{ borderRadius: 2, mb: 3 }} onClose={() => refetch()}>
            Erro ao carregar os dados. Tente novamente.
          </Alert>
        )}

        {/* KPI Cards */}
        <PlanejamentoKpiCards kpis={data?.kpis} loading={isLoading} />

        {/* Grid principal */}
        <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', lg: 'row' } }}>
          {/* Coluna esquerda */}
          <Box sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 3 }}>
            <AlertasCriticos
              data={data?.alertasCriticos}
              loading={isLoading}
              page={alertasPage}
              limit={alertasLimit}
              onPageChange={setAlertasPage}
              onLimitChange={(l) => { setAlertasLimit(l); setAlertasPage(1); }}
            />
            <ProcessosRecentes
              data={data?.processosRecentes}
              loading={isLoading}
              page={recentesPage}
              limit={recentesLimit}
              onPageChange={setRecentesPage}
              onLimitChange={(l) => { setRecentesLimit(l); setRecentesPage(1); }}
            />
          </Box>

          {/* Sidebar direita */}
          <Box sx={{ width: { xs: '100%', lg: 435 }, flexShrink: 0 }}>
            <PlanejamentoSidebar
              pendencias={data?.pendencias}
              proximosPrazos={data?.proximosPrazos}
              loading={isLoading}
            />
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default PlanejamentoContratacaoPage;
