import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography
} from '@mui/material';
import dayjs from 'dayjs';
import type { CriticalAlert } from '@/globals/types';

const PRIORITY_COLOR: Record<string, 'error' | 'warning' | 'success'> = {
  Alta: 'error',
  Média: 'warning',
  Baixa: 'success'
};

type Props = { alerts?: CriticalAlert[]; loading: boolean };

export const CriticalAlerts = ({ alerts, loading }: Props) => (
  <Card sx={{ border: '1px solid', borderColor: 'divider', boxShadow: 1 }}>
    <CardHeader
      title={<Typography variant='subtitle1' sx={{ fontWeight: 600 }}>Alertas Críticos</Typography>}
      subheader={
        !loading && alerts && alerts.length > 0 ? (
          <Typography variant='body2' color='error'>
            {alerts.length} processo{alerts.length > 1 ? 's' : ''} em atraso
          </Typography>
        ) : null
      }
    />
    <CardContent sx={{ pt: 0 }}>
      <TableContainer sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, overflow: 'hidden' }}>
        <Table size='medium' stickyHeader>
          <TableHead>
            <TableRow sx={{ '& .MuiTableCell-head': { backgroundColor: '#f8fafc', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#374151', borderBottom: '2px solid #e5e7eb' } }}>
              <TableCell>Processo</TableCell>
              <TableCell>Objeto</TableCell>
              <TableCell>Prioridade</TableCell>
              <TableCell>Criado em</TableCell>
              <TableCell>Vencimento</TableCell>
              <TableCell align='right'>Dias em Atraso</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 6 }).map((__, j) => (
                    <TableCell key={j}><Skeleton variant='text' /></TableCell>
                  ))}
                </TableRow>
              ))
            ) : alerts?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align='center' sx={{ py: 5, backgroundColor: '#fafafa' }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                    <Typography variant='body1' color='text.secondary' fontWeight={500}>Nenhum alerta crítico</Typography>
                    <Typography variant='body2' color='text.secondary' sx={{ fontStyle: 'italic' }}>Todos os processos estão dentro do prazo</Typography>
                  </Box>
                </TableCell>
              </TableRow>
            ) : (
              alerts?.map((alert) => (
                <TableRow
                  key={alert.processId}
                  sx={{
                    '& .MuiTableCell-root': { borderBottom: '1px solid #f1f5f9', py: 1.5 },
                    '&:hover': { backgroundColor: '#EBF3FF' }
                  }}
                >
                  <TableCell>
                    <Typography variant='body2' fontWeight={500}>{alert.processNumber}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant='body2' sx={{ maxWidth: 260, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {alert.object}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip label={alert.priority} color={PRIORITY_COLOR[alert.priority] ?? 'default'} size='small' sx={{ fontWeight: 600, fontSize: '0.7rem' }} />
                  </TableCell>
                  <TableCell>
                    <Typography variant='body2' color='text.secondary'>{dayjs(alert.createdAt).format('DD/MM/YYYY')}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant='body2'>{dayjs(alert.dueDate).format('DD/MM/YYYY')}</Typography>
                  </TableCell>
                  <TableCell align='right'>
                    <Typography variant='body2' sx={{ color: 'error.main', fontWeight: 700 }}>{alert.daysOverdue}d</Typography>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </CardContent>
  </Card>
);
