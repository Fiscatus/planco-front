import { Alert, Box, Typography } from '@mui/material';
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

  const { data, isLoading, isError, refetch } = usePlanejamentoDashboard(activeDepartment?._id);

  if (!activeDepartment) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant='h6' color='error'>Nenhuma gerência selecionada</Typography>
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
            <AlertasCriticos alerts={data?.alertasCriticos} loading={isLoading} />
            <ProcessosRecentes processes={data?.processosRecentes} loading={isLoading} />
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
