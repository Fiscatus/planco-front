import React, { useState } from "react";
import { Sidebar, Topbar } from "./navbar";

import { Box } from "@mui/material";

interface LayoutProps {
  children: React.ReactNode;
}

const LayoutNavbar = ({ children }: LayoutProps) => {
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
            px: { xs: 2, md: 3 },
            py: 2,
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
};

export { LayoutNavbar };
