import { RefreshOutlined } from '@mui/icons-material';
import { Alert, Box, Button, Divider, Typography } from '@mui/material';
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

  // GET /insights — KPIs, gráficos e alertas. Independente da tabela de gerências.
  const { data, isLoading, isError, refetch, isFetching } = useInsights({
    dateFrom: dateFrom?.format('YYYY-MM-DD'),
    dateTo: dateTo?.format('YYYY-MM-DD')
  });

  const handleDateChange = useCallback((from: Dayjs | null, to: Dayjs | null) => {
    setDateFrom(from);
    setDateTo(to);
  }, []);

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: 'grey.50' }}>
      <Box
        sx={{
          backgroundColor: 'background.paper',
          borderBottom: 1,
          borderColor: 'divider',
          px: { xs: 3, md: 4 },
          py: 3,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        <Box>
          <Typography variant='h3' sx={{ fontWeight: 700, color: 'text.primary', lineHeight: 1.2, mb: 0.5 }}>
            Insights do módulo Planejamento da Contratação
          </Typography>
          <Typography variant='body1' color='text.secondary'>
            Visão geral dos dados importantes dos processos licitatórios da organização
          </Typography>
        </Box>
        <Button
          startIcon={<RefreshOutlined sx={{ animation: isFetching ? 'spin 1s linear infinite' : 'none' }} />}
          onClick={() => refetch()}
          disabled={isFetching}
          variant='contained'
          size='small'
          sx={{
            borderRadius: 3,
            textTransform: 'uppercase',
            fontWeight: 600,
            letterSpacing: '0.05em',
            px: 3,
            boxShadow: '0 2px 8px rgba(25,118,210,0.2)',
            '&:hover': { boxShadow: '0 4px 12px rgba(25,118,210,0.3)', transform: 'translateY(-1px)' },
            '&:disabled': { backgroundColor: '#e3f2fd', color: '#90caf9', boxShadow: 'none' }
          }}
        >
          Atualizar
        </Button>
      </Box>

      <Divider />

      <Box sx={{ px: { xs: 2, md: 4 }, py: 3, display: 'flex', flexDirection: 'column', gap: 3 }}>
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

        {/* GET /insights/departments — query própria, não afeta KPIs/gráficos */}
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
