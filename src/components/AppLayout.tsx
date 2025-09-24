import React, { useState } from "react";
import { Sidebar, Topbar } from "./layout";

import { Box } from "@mui/material";
import { Footer } from "./layout/Footer";

type AppLayoutProps = {
  children: React.ReactNode;
  hideHeader?: boolean;
  hideSidebar?: boolean;
};

const AppLayout = ({
  children,
  hideHeader = false,
  hideSidebar = false,
}: AppLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleMenuClick = () => {
    setSidebarOpen(true);
  };

  const handleSidebarClose = () => {
    setSidebarOpen(false);
  };

  return (
    <>
      {!hideSidebar ? (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            minHeight: "100vh",
            width: "100%",
          }}
        >
          {!hideHeader && <Topbar onMenuClick={handleMenuClick} />}

          <Box
            sx={{
              display: "flex",
              flex: 1,
              pt: "64px",
              width: "100%",
            }}
          >
            {!hideSidebar && (
              <Sidebar open={sidebarOpen} onClose={handleSidebarClose} />
            )}

            <Box
              component="main"
              sx={{
                flex: 1,
                width: "100%",
                py: 2,
                display: "flex",
                flexDirection: "column",
              }}
            >
              {children}
            </Box>
          </Box>

          {!hideHeader && <Footer />}
        </Box>
      ) : (
        <>{children}</>
      )}
    </>
  );
};

export { AppLayout };
