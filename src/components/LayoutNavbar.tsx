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
      <Sidebar open={sidebarOpen} onClose={handleSidebarClose} />
      {children}
    </Box>
  );
};

export { LayoutNavbar };
