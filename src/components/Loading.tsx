import { Box, CircularProgress } from '@mui/material';

import { memo } from 'react';

type Props = {
  isLoading: boolean;
};

const Loading = memo(({ isLoading = false }: Props) => {
  if (!isLoading) return null;
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100px'
      }}
    >
      <CircularProgress />
    </Box>
  );
});

export { Loading };
