import { CloseOutlined } from '@mui/icons-material';
import {
  Box,
  Chip,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  Typography
} from '@mui/material';
import type { Dayjs } from 'dayjs';
import { useState } from 'react';
import type { DepartmentSummary } from '@/globals/types/Insights';
import { useDepartmentInsights } from '@/hooks/useDepartmentInsights';
import { InsightsCharts } from './InsightsCharts';
import { KpiCards } from './KpiCards';

type Props = {
  department: DepartmentSummary | null;
  onClose: () => void;
};

export const DepartmentDetailModal = ({ department, onClose }: Props) => {
  const [dateFrom, setDateFrom] = useState<Dayjs | null>(null);
  const [dateTo, setDateTo] = useState<Dayjs | null>(null);

  const { data, isLoading } = useDepartmentInsights(department?.departmentId, {
    dateFrom: dateFrom?.format('YYYY-MM-DD'),
    dateTo: dateTo?.format('YYYY-MM-DD')
  });

  const adapted = data
    ? {
        processes: data.processes,
        byDepartment: { data: [], total: 0, page: 1, limit: 20, totalPages: 0 },
        users: { total: 0, active: 0, inactive: 0, unverified: 0 },
        approvals: data.approvals,
        processesPerMonth: data.processesPerMonth,
        generatedAt: data.generatedAt
      }
    : undefined;

  return (
    <Dialog open={!!department} onClose={onClose} maxWidth='lg' fullWidth scroll='paper' PaperProps={{ sx: { borderRadius: 3 } }}>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Typography variant='h6' fontWeight={700}>{department?.name}</Typography>
          <Chip
            label={department?.acronym}
            size='small'
            sx={{ fontFamily: 'monospace', backgroundColor: '#f1f5f9', color: 'text.secondary', borderRadius: 1 }}
          />
        </Box>
        <IconButton onClick={onClose} size='small' sx={{ color: 'text.secondary' }}>
          <CloseOutlined />
        </IconButton>
      </DialogTitle>
      <Divider />
      <DialogContent sx={{ pt: 3 }}>
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <KpiCards data={adapted} loading={false} />
            <InsightsCharts
              data={adapted}
              loading={false}
              dateFrom={dateFrom}
              dateTo={dateTo}
              onDateChange={(from, to) => { setDateFrom(from); setDateTo(to); }}
            />
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
};
