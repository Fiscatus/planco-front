import { Box, Typography } from '@mui/material';

const Invites = () => {
  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Convites
      </Typography>
      <Typography variant="body1">
        Aqui você pode gerenciar seus convites para organizações.
      </Typography>
    </Box>
  );
};

export default Invites;
