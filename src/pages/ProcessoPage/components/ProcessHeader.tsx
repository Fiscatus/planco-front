import { ArrowBackIosNew as ArrowBackIcon, Edit as EditIcon, Settings as SettingsIcon } from '@mui/icons-material';
import { Box, Button, Chip, IconButton, Typography } from '@mui/material';

type ProcessHeaderProps = {
  title: string;
  subtitle: string;
  status: string;
  isOwner?: boolean;
};

export const ProcessHeader = ({ title, subtitle, status, isOwner = false }: ProcessHeaderProps) => {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 4 }}>
      <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
        <IconButton
          sx={{
            mt: 0.5,
            border: '1px solid #E4E6EB',
            borderRadius: 2,
            bgcolor: '#fff',
            '&:hover': { bgcolor: '#F8FAFC' }
          }}
        >
          <ArrowBackIcon sx={{ fontSize: 18, color: '#64748b' }} />
        </IconButton>

        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
            <Typography
              variant='h4'
              sx={{ fontWeight: 800, color: '#0f172a' }}
            >
              {title}
            </Typography>
            <Chip
              label={status}
              size='small'
              sx={{
                bgcolor: '#DCFCE7',
                color: '#16A34A',
                fontWeight: 700,
                fontSize: '0.75rem',
                height: 24,
                px: 0.5
              }}
            />
          </Box>
          <Typography
            variant='subtitle1'
            sx={{ color: '#64748b', fontWeight: 500 }}
          >
            {subtitle}
          </Typography>
        </Box>
      </Box>

      {isOwner && (
        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <Button
            variant='outlined'
            startIcon={<SettingsIcon />}
            sx={{
              textTransform: 'none',
              fontWeight: 700,
              borderColor: '#E4E6EB',
              color: '#0f172a',
              borderRadius: 2,
              '&:hover': { borderColor: '#1877F2', bgcolor: '#F0F9FF', color: '#1877F2' }
            }}
          >
            Editar Processo
          </Button>
          <Button
            variant='contained'
            startIcon={<EditIcon />}
            sx={{
              textTransform: 'none',
              fontWeight: 700,
              bgcolor: '#1877F2',
              boxShadow: 'none',
              borderRadius: 2,
              '&:hover': { bgcolor: '#166FE5', boxShadow: 'none' }
            }}
          >
            Editar Fluxo
          </Button>
        </Box>
      )}
    </Box>
  );
};
