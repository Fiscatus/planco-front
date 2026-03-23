import { History as HistoryIcon } from '@mui/icons-material';
import { Box, MenuItem, Pagination, Select, Typography } from '@mui/material';

export const ActionHistory = () => {
  const totalItems = 0;
  const limit = 5;
  const page = 1;

  return (
    <Box sx={{ mb: 6 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
        <HistoryIcon sx={{ color: '#64748b' }} />
        <Typography
          variant='h6'
          sx={{ fontWeight: 800, color: '#0f172a' }}
        >
          Histórico de Ações
        </Typography>
      </Box>

      {totalItems === 0 ? (
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
            Nenhuma ação realizada no processo ainda.
          </Typography>
        </Box>
      ) : (
        <Box>
          <Box
            sx={{
              px: 3,
              py: 2,
              borderTop: '1px solid #E4E6EB',
              display: 'flex',
              flexDirection: { xs: 'column', md: 'row' },
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: 2,
              bgcolor: '#f8fafc',
              borderRadius: '0 0 12px 12px'
            }}
          >
            <Typography
              variant='body2'
              sx={{ color: '#6b7280', fontSize: '0.875rem' }}
            >
              {(page - 1) * limit + 1}-{Math.min(page * limit, totalItems)} de {totalItems}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Select
                value={limit}
                sx={{ minWidth: 120, height: 32, fontSize: '0.875rem' }}
              >
                {[5, 10, 25, 50].map((limitOption) => (
                  <MenuItem
                    key={limitOption}
                    value={limitOption}
                    sx={{ '&.Mui-selected': { backgroundColor: '#f1f5f9', '&:hover': { backgroundColor: '#f1f5f9' } } }}
                  >
                    {limitOption} por página
                  </MenuItem>
                ))}
              </Select>
              <Pagination
                count={1}
                page={page}
                variant='outlined'
                shape='rounded'
              />
            </Box>
          </Box>
        </Box>
      )}
    </Box>
  );
};
