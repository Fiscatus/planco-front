import { Description as DescriptionIcon } from '@mui/icons-material';
import { Box, Typography } from '@mui/material';

export const RelatedDocuments = () => {
  return (
    <Box sx={{ mb: 6 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
        <DescriptionIcon sx={{ color: '#64748b' }} />
        <Typography
          variant='h6'
          sx={{ fontWeight: 800, color: '#0f172a' }}
        >
          Documentos Relacionados
        </Typography>
      </Box>

      <Box
        sx={{
          bgcolor: '#FAFBFC',
          border: '1px dashed #E4E6EB',
          borderRadius: 3,
          p: 6,
          textAlign: 'center'
        }}
      >
        <Typography
          variant='body1'
          sx={{ color: '#64748b', fontWeight: 500 }}
        >
          Nenhum documento encontrado.
        </Typography>
      </Box>
    </Box>
  );
};
