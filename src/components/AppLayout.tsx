import React, { useState } from "react";
import { Sidebar, Topbar } from "./layout";

import { Box } from "@mui/material";
import { Footer } from "./layout/Footer";

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout = ({ children }: AppLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleMenuClick = () => {
    setSidebarOpen(true);
  };

  const handleSidebarClose = () => {
    setSidebarOpen(false);
  };

  return (
    <Box sx={{ 
      display: "flex", 
      flexDirection: "column", 
      minHeight: "100vh",
      width: "100%",
    }}>
      <Topbar onMenuClick={handleMenuClick} />

      <Box sx={{
        display: 'flex',
        flex: 1,
        pt: '64px',
        width: '100%',
      }}>
        <Sidebar open={sidebarOpen} onClose={handleSidebarClose} />

        <Box
          component="main"
          sx={{
            flex: 1,
            width: '100%',
            py: 2,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {children}
        </Box>
      </Box>

      <Footer />
    </Box>
  );
};

export { AppLayout };
