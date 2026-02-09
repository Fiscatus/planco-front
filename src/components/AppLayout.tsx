import { Box } from '@mui/material';
import { type ReactNode, useState } from 'react';
import { Sidebar, Topbar } from './layout';
import { Footer } from './layout/Footer';

type AppLayoutProps = {
  children: ReactNode;
  hideHeader?: boolean;
  hideSidebar?: boolean;
};

const AppLayout = ({ children, hideHeader = false, hideSidebar = false }: AppLayoutProps) => {
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
            display: 'flex',
            flexDirection: 'column',
            minHeight: '100vh',
            width: '100%'
          }}
        >
          {!hideHeader && <Topbar onMenuClick={handleMenuClick} />}

          <Box
            sx={{
              display: 'flex',
              flex: 1,
              width: '100%'
            }}
          >
            {!hideSidebar && (
              <Sidebar
                open={sidebarOpen}
                onClose={handleSidebarClose}
              />
            )}

            <Box
              component='main'
              sx={{
                flex: 1,
                width: '100%',
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              {children}
            </Box>
          </Box>

          {!hideHeader && <Footer />}
        </Box>
      ) : (
        children
      )}
    </>
  );
};

export { AppLayout };
