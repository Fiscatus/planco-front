import { Box, Card, CardContent, CardHeader, Grid, Skeleton, Typography, useTheme } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import dayjs, { type Dayjs } from 'dayjs';
import 'dayjs/locale/pt-br';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import type { InsightsResponse, MonthCount } from '@/globals/types';

const PRIORITY_COLORS: Record<string, string> = { Alta: '#F02849', Média: '#F7B928', Baixa: '#31A24C' };
const STATUS_COLORS = ['#1877F2', '#31A24C', '#F02849', '#F7B928', '#8A8D91'];
const APPROVAL_COLORS = ['#F7B928', '#31A24C', '#F02849'];

const ChartCard = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <Card sx={{ height: '100%', border: '1px solid', borderColor: 'divider', boxShadow: 1 }}>
    <CardHeader title={<Typography variant='subtitle1' sx={{ fontWeight: 600 }}>{title}</Typography>} sx={{ pb: 0 }} />
    <CardContent sx={{ pt: 1 }}>{children}</CardContent>
  </Card>
);

type DateRangeProps = {
  dateFrom: Dayjs | null;
  dateTo: Dayjs | null;
  onChange: (from: Dayjs | null, to: Dayjs | null) => void;
};

const DateRangePicker = ({ dateFrom, dateTo, onChange }: DateRangeProps) => (
  <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale='pt-br'>
    <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', flexWrap: 'wrap' }}>
      <DatePicker
        label='De'
        value={dateFrom}
        onChange={(v) => onChange(v, dateTo)}
        maxDate={dateTo ?? undefined}
        slotProps={{
          textField: {
            size: 'small',
            sx: { width: 160, '& .MuiOutlinedInput-root': { borderRadius: 2 } }
          }
        }}
      />
      <DatePicker
        label='Até'
        value={dateTo}
        onChange={(v) => onChange(dateFrom, v)}
        minDate={dateFrom ?? undefined}
        slotProps={{
          textField: {
            size: 'small',
            sx: { width: 160, '& .MuiOutlinedInput-root': { borderRadius: 2 } }
          }
        }}
      />
    </Box>
  </LocalizationProvider>
);

type Props = {
  data?: InsightsResponse;
  loading: boolean;
  dateFrom: Dayjs | null;
  dateTo: Dayjs | null;
  onDateChange: (from: Dayjs | null, to: Dayjs | null) => void;
};

export const InsightsCharts = ({ data, loading, dateFrom, dateTo, onDateChange }: Props) => {
  const theme = useTheme();

  if (loading) {
    return (
      <Grid container spacing={2}>
        {Array.from({ length: 5 }).map((_, i) => (
          <Grid key={i} size={{ xs: 12, md: 6 }}>
            <Skeleton variant='rectangular' height={260} sx={{ borderRadius: 2 }} />
          </Grid>
        ))}
      </Grid>
    );
  }

  if (!data) return null;

  const statusData = Object.entries(data.processes.byStatus).map(([name, value]) => ({ name, value }));
  const modalityData = Object.entries(data.processes.byModality).map(([name, value]) => ({ name, value }));
  const priorityData = Object.entries(data.processes.byPriority).map(([name, value]) => ({ name, value }));
  const monthData = data.processesPerMonth.map((m: MonthCount) => ({
    name: dayjs(`${m.month}-01`).format('MMM/YY'),
    Processos: m.count
  }));
  const approvalsData = [
    { name: 'Pendente', value: data.approvals.pending },
    { name: 'Aprovado', value: data.approvals.approved },
    { name: 'Rejeitado', value: data.approvals.rejected }
  ];

  return (
    <Grid container spacing={2}>
      {/* Donut — Status */}
      <Grid size={{ xs: 12, md: 6 }}>
        <ChartCard title='Processos por Status'>
          <ResponsiveContainer width='100%' height={220}>
            <PieChart>
              <Pie data={statusData} dataKey='value' nameKey='name' cx='50%' cy='50%' innerRadius={55} outerRadius={85}>
                {statusData.map((_, i) => <Cell key={i} fill={STATUS_COLORS[i % STATUS_COLORS.length]} />)}
              </Pie>
              <Tooltip />
              <Legend iconType='circle' iconSize={10} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </Grid>

      {/* Bar — Modalidade */}
      <Grid size={{ xs: 12, md: 6 }}>
        <ChartCard title='Processos por Modalidade'>
          <ResponsiveContainer width='100%' height={220}>
            <BarChart data={modalityData} margin={{ left: -10 }}>
              <CartesianGrid strokeDasharray='3 3' stroke={theme.palette.divider} />
              <XAxis dataKey='name' tick={{ fontSize: 11 }} interval={0} angle={-15} textAnchor='end' height={50} />
              <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
              <Tooltip />
              <Bar dataKey='value' name='Processos' fill={theme.palette.primary.main} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </Grid>

      {/* Bar horizontal — Prioridade */}
      <Grid size={{ xs: 12, md: 6 }}>
        <ChartCard title='Processos por Prioridade'>
          <ResponsiveContainer width='100%' height={235}>
            <BarChart data={priorityData} layout='vertical' margin={{ left: 0 }}>
              <CartesianGrid strokeDasharray='3 3' stroke={theme.palette.divider} horizontal={false} />
              <XAxis type='number' tick={{ fontSize: 11 }} allowDecimals={false} />
              <YAxis type='category' dataKey='name' tick={{ fontSize: 12 }} width={50} />
              <Tooltip />
              <Bar dataKey='value' name='Processos' radius={[0, 4, 4, 0]}>
                {priorityData.map((entry) => <Cell key={entry.name} fill={PRIORITY_COLORS[entry.name] ?? '#8A8D91'} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </Grid>

      {/* Line — Processos por mês com DateRangePicker */}
      <Grid size={{ xs: 12, md: 6 }}>
        <Card sx={{ height: '100%', border: '1px solid', borderColor: 'divider', boxShadow: 1 }}>
          <CardHeader
            title={<Typography variant='subtitle1' sx={{ fontWeight: 600 }}>Processos por Mês</Typography>}
            action={<DateRangePicker dateFrom={dateFrom} dateTo={dateTo} onChange={onDateChange} />}
            sx={{ pb: 0, '& .MuiCardHeader-action': { alignSelf: 'center', mt: 0 } }}
          />
          <CardContent sx={{ pt: 1 }}>
            <ResponsiveContainer width='100%' height={220}>
              <LineChart data={monthData} margin={{ left: -10 }}>
                <CartesianGrid strokeDasharray='3 3' stroke={theme.palette.divider} />
                <XAxis dataKey='name' tick={{ fontSize: 11 }} />
                <YAxis
                  tick={{ fontSize: 11 }}
                  allowDecimals={false}
                  domain={[0, (dataMax: number) => dataMax + 1]}
                />
                <Tooltip />
                <Line type='monotone' dataKey='Processos' stroke={theme.palette.primary.main} strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </Grid>

      {/* Donut — Aprovações */}
      <Grid size={{ xs: 12, md: 6 }}>
        <ChartCard title='Aprovações'>
          <ResponsiveContainer width='100%' height={220}>
            <PieChart>
              <Pie data={approvalsData} dataKey='value' nameKey='name' cx='50%' cy='50%' innerRadius={55} outerRadius={85}>
                {approvalsData.map((_, i) => <Cell key={i} fill={APPROVAL_COLORS[i]} />)}
              </Pie>
              <Tooltip />
              <Legend iconType='circle' iconSize={10} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </Grid>
    </Grid>
  );
};
