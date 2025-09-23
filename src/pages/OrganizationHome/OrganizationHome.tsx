import { Box, Typography } from "@mui/material";

import { AppLayout } from "@/components";

// TODO: Implementar a home da organização
const OrganizationHome = () => {
  return (
    <AppLayout>
        <Typography variant="h4" component="h1" gutterBottom>
          Home da Organização
        </Typography>
        <Typography variant="body1">
          Bem-vindo à página inicial da sua organização.
        </Typography>
    </AppLayout>
  );
};

export default OrganizationHome;
