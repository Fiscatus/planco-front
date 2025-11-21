import { Box, Card, Typography, Button, IconButton } from '@mui/material';
import { MoreVert as MoreVertIcon, Schedule as ScheduleIcon, Visibility as VisibilityIcon } from '@mui/icons-material';
import type { FlowModelStage } from '@/hooks/useFlowModels';

type StageCardProps = {
  stage: FlowModelStage;
  onViewDetails: () => void;
};

export const StageCard = ({ stage, onViewDetails }: StageCardProps) => {
  return (
    <Card
      sx={{
        p: 2.5,
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        border: 1,
        borderColor: '#E4E6EB',
        bgcolor: 'background.paper',
        borderRadius: 2,
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
          transform: 'translateY(-2px)',
          borderColor: '#1877F2'
        }
      }}
    >
      {/* Header com número e menu */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box
          sx={{
            width: 36,
            height: 36,
            borderRadius: '50%',
            bgcolor: '#1877F2',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 700,
            fontSize: '0.9375rem',
            boxShadow: '0 2px 4px rgba(24, 119, 242, 0.3)'
          }}
        >
          {stage.order}
        </Box>
        <IconButton 
          size="small" 
          sx={{ 
            color: '#616161',
            '&:hover': {
              bgcolor: '#F0F2F5',
              color: '#212121'
            }
          }}
        >
          <MoreVertIcon fontSize="small" />
        </IconButton>
      </Box>

      {/* Conteúdo */}
      <Box sx={{ flex: 1 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'text.primary', mb: 0.5 }}>
          {stage.name}
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.875rem' }}>
          {stage.departmentName || stage.departmentId || 'Departamento não definido'}
        </Typography>
      </Box>

      {/* Informações */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        {stage.durationDays !== undefined && (
          <Box sx={{ display: 'flex', alignItems: 'center', color: 'text.secondary' }}>
            <ScheduleIcon sx={{ fontSize: 18, mr: 1 }} />
            <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
              {stage.durationDays} {stage.durationDays === 1 ? 'dia útil' : 'dias úteis'}
            </Typography>
          </Box>
        )}

        <Box
          sx={{
            width: '100%',
            textAlign: 'center',
            bgcolor: '#F0F2F5',
            color: '#616161',
            py: 0.875,
            borderRadius: 1.5,
            fontSize: '0.8125rem',
            fontWeight: 600
          }}
        >
          Pendente
        </Box>
      </Box>

      {/* Botão */}
      <Button
        variant="outlined"
        startIcon={<VisibilityIcon />}
        onClick={onViewDetails}
        fullWidth
        sx={{
          textTransform: 'none',
          fontWeight: 600,
          borderColor: '#E4E6EB',
          color: '#212121',
          borderRadius: 2,
          fontSize: '0.875rem',
          '&:hover': {
            borderColor: '#1877F2',
            bgcolor: '#F0F9FF',
            color: '#1877F2'
          }
        }}
      >
        Ver Detalhes
      </Button>
    </Card>
  );
};

