import {
  ArrowForward as ArrowForwardIcon,
  ExpandMore as ExpandMoreIcon,
  Folder as FolderIcon,
  Warning as WarningIcon
} from '@mui/icons-material';
import { Box, IconButton, Typography } from '@mui/material';

export const ProcessInfoCards = () => {
  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2, mb: 4 }}>
      {/* Card 1: Processo */}
      <Box
        sx={{
          bgcolor: '#fff',
          border: '1px solid #E4E6EB',
          borderRadius: 3,
          p: 2,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          cursor: 'pointer',
          '&:hover': { borderColor: '#1877F2', bgcolor: '#F0F9FF' }
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: 2,
              bgcolor: '#E7F3FF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <FolderIcon sx={{ color: '#1877F2' }} />
          </Box>
          <Box>
            <Typography
              variant='body2'
              sx={{ color: '#64748b', fontWeight: 600 }}
            >
              Processo
            </Typography>
            <Typography
              variant='subtitle1'
              sx={{ color: '#0f172a', fontWeight: 800 }}
            >
              012/2025
            </Typography>
          </Box>
        </Box>
        <IconButton size='small'>
          <ExpandMoreIcon sx={{ color: '#64748b' }} />
        </IconButton>
      </Box>

      {/* Card 2: Controle de Prazos */}
      <Box
        sx={{
          bgcolor: '#fff',
          border: '1px solid #E4E6EB',
          borderRadius: 3,
          p: 2,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          cursor: 'pointer',
          '&:hover': { borderColor: '#1877F2', bgcolor: '#F0F9FF' }
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: 2,
              bgcolor: '#F8FAFC',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <ArrowForwardIcon sx={{ color: '#64748b' }} />
          </Box>
          <Box>
            <Typography
              variant='body2'
              sx={{ color: '#64748b', fontWeight: 600 }}
            >
              Controle de Prazos
            </Typography>
            <Typography
              variant='subtitle1'
              sx={{ color: '#0f172a', fontWeight: 800 }}
            >
              Elaboração do DFD
            </Typography>
          </Box>
        </Box>
        <IconButton size='small'>
          <ExpandMoreIcon sx={{ color: '#64748b' }} />
        </IconButton>
      </Box>

      {/* Card 3: Pendências */}
      <Box
        sx={{
          bgcolor: '#FFF1F3',
          border: '1px solid #F02849',
          borderRadius: 3,
          p: 2,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          cursor: 'pointer',
          '&:hover': { bgcolor: '#FFE4E6' }
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: 2,
              bgcolor: '#F02849',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <WarningIcon sx={{ color: '#fff' }} />
          </Box>
          <Box>
            <Typography
              variant='body2'
              sx={{ color: '#F02849', fontWeight: 600 }}
            >
              Pendências
            </Typography>
            <Typography
              variant='subtitle1'
              sx={{ color: '#F02849', fontWeight: 800 }}
            >
              2 Urgentes
            </Typography>
          </Box>
        </Box>
        <IconButton size='small'>
          <ExpandMoreIcon sx={{ color: '#F02849' }} />
        </IconButton>
      </Box>
    </Box>
  );
};
