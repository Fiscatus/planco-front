import { RefreshOutlined } from '@mui/icons-material';
import { Alert, Box, Button, Typography } from '@mui/material';
import type { Dayjs } from 'dayjs';
import { useCallback, useState } from 'react';
import type { DepartmentSummary } from '@/globals/types/Insights';
import { useInsights } from '@/hooks/useInsights';
import { CriticalAlerts } from './components/CriticalAlerts';
import { DepartmentDetailModal } from './components/DepartmentDetailModal';
import { DepartmentRanking } from './components/DepartmentRanking';
import { InsightsCharts } from './components/InsightsCharts';
import { KpiCards } from './components/KpiCards';

const InsightsPage = () => {
  const [selectedDept, setSelectedDept] = useState<DepartmentSummary | null>(null);
  const [dateFrom, setDateFrom] = useState<Dayjs | null>(null);
  const [dateTo, setDateTo] = useState<Dayjs | null>(null);

  const { data, isLoading, isError, refetch, isFetching } = useInsights({
    dateFrom: dateFrom?.format('YYYY-MM-DD'),
    dateTo: dateTo?.format('YYYY-MM-DD')
  });

  const handleDateChange = useCallback((from: Dayjs | null, to: Dayjs | null) => {
    setDateFrom(from);
    setDateTo(to);
  }, []);

  return (
    <Box
      sx={{
        width: '100%',
        minHeight: '100vh',
        background: 'linear-gradient(180deg, #F7F9FB 0%, #F4F6F8 100%)',
        pt: { xs: 2, sm: 3, md: 3.5 },
        px: { xs: 2, sm: 3, md: 4, lg: 5 },
        pb: { xs: 4, sm: 5, md: 6 }
      }}
    >
      {/* Cabeçalho */}
      <Box sx={{ mb: { xs: 3, sm: 4, md: 5 } }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: { xs: 'flex-start', sm: 'center' },
            flexDirection: { xs: 'column', sm: 'row' },
            gap: { xs: 2, sm: 2, md: 3 }
          }}
        >
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              variant='h4'
              sx={{
                fontWeight: 700,
                fontSize: { xs: '1.25rem', sm: '1.5rem', md: '1.75rem', lg: '1.875rem' },
                color: '#212121',
                mb: { xs: 0.25, sm: 0.5 },
                lineHeight: { xs: 1.3, sm: 1.2 }
              }}
            >
              Insights do módulo Planejamento da Contratação
            </Typography>
            <Typography
              variant='body1'
              sx={{
                color: '#8A8D91',
                fontSize: { xs: '0.875rem', sm: '0.9375rem', md: '1rem' },
                lineHeight: { xs: 1.4, sm: 1.5 },
                display: { xs: 'none', sm: 'block' }
              }}
            >
              Visão geral dos dados importantes dos processos licitatórios da organização
            </Typography>
          </Box>

          <Button
            variant='outlined'
            startIcon={<RefreshOutlined sx={{ animation: isFetching ? 'spin 1s linear infinite' : 'none' }} />}
            onClick={() => refetch()}
            disabled={isFetching}
            sx={{
              borderRadius: 2,
              px: { xs: 2.5, sm: 3, md: 3.5 },
              py: { xs: 1, sm: 1.125, md: 1.25 },
              fontSize: { xs: '0.8125rem', sm: '0.875rem' },
              fontWeight: 600,
              textTransform: 'none',
              borderColor: '#1877F2',
              color: '#1877F2',
              width: { xs: '100%', sm: 'auto' },
              mt: { xs: 1, sm: 0 },
              '&:hover': { borderColor: '#166fe5', backgroundColor: '#f0f9ff' }
            }}
          >
            Atualizar
          </Button>
        </Box>
      </Box>

      {/* Content */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {isError && (
          <Alert severity='error' sx={{ borderRadius: 2 }} onClose={() => refetch()}>
            Erro ao carregar os dados. Tente novamente.
          </Alert>
        )}

        <KpiCards data={data} loading={isLoading} />

        <InsightsCharts
          data={data}
          loading={isLoading}
          dateFrom={dateFrom}
          dateTo={dateTo}
          onDateChange={handleDateChange}
        />

        <DepartmentRanking onSelect={setSelectedDept} />

        <CriticalAlerts alerts={data?.processes.criticalAlerts} loading={isLoading} />
      </Box>

      <DepartmentDetailModal department={selectedDept} onClose={() => setSelectedDept(null)} />

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </Box>
  );
};

export default InsightsPage;
