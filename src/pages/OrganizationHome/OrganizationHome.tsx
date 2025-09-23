import { Box, Typography } from "@mui/material";

import { LayoutNavbar } from "@/components";

// TODO: Implementar a home da organização
const OrganizationHome = () => {
  return (
    <LayoutNavbar>
        <Typography variant="h4" component="h1" gutterBottom>
          Home da Organização
        </Typography>
        <Typography variant="body1">
          Bem-vindo à página inicial da sua organização.
        </Typography>
    </LayoutNavbar>
  );
};

export default OrganizationHome;
