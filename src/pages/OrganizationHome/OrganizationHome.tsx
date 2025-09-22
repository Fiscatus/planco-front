import { Box, Typography } from '@mui/material';

const OrganizationHome = () => {
  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Home da Organização
      </Typography>
      <Typography variant="body1">
        Bem-vindo à página inicial da sua organização.
      </Typography>
    </Box>
  );
};

export default OrganizationHome;
