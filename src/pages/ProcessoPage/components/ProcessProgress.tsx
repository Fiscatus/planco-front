import { TrendingUp as TrendingUpIcon } from '@mui/icons-material';
import { Box, LinearProgress, Typography } from '@mui/material';

type ProcessProgressProps = {
  progress: number;
  completedStages: number;
  totalStages: number;
};

export const ProcessProgress = ({ progress, completedStages, totalStages }: ProcessProgressProps) => {
  return (
    <Box sx={{ mb: 4, bgcolor: '#fff', p: 3, borderRadius: 3, border: '1px solid #E4E6EB' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', mb: 2 }}>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
            <Box sx={{ bgcolor: '#DCFCE7', p: 1, borderRadius: 2, display: 'flex' }}>
              <TrendingUpIcon sx={{ color: '#16A34A', fontSize: 20 }} />
            </Box>
            <Typography
              variant='h6'
              sx={{ fontWeight: 800, color: '#0f172a' }}
            >
              Progresso das Etapas
            </Typography>
          </Box>
          <Typography
            variant='body2'
            sx={{ color: '#64748b' }}
          >
            Acompanhe o andamento geral do processo
          </Typography>
        </Box>
        <Box sx={{ textAlign: 'right' }}>
          <Typography
            variant='h5'
            sx={{ fontWeight: 800, color: '#16A34A', lineHeight: 1 }}
          >
            {progress}%
          </Typography>
          <Typography
            variant='caption'
            sx={{ color: '#64748b', fontWeight: 600 }}
          >
            {completedStages} de {totalStages} concluídas
          </Typography>
        </Box>
      </Box>
      <LinearProgress
        variant='determinate'
        value={progress}
        sx={{
          height: 8,
          borderRadius: 4,
          bgcolor: '#F1F5F9',
          '& .MuiLinearProgress-bar': {
            bgcolor: '#16A34A',
            borderRadius: 4
          }
        }}
      />
    </Box>
  );
};
