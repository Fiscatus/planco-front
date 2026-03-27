import { ChunkLoadErrorBoundary, NotificationProvider } from '@/components';
import { CssBaseline, ThemeProvider } from '@mui/material';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { ActiveDepartmentProvider, SupportChatProvider } from '@/contexts';
import { AppRouter } from '@/router';
import { AuthProvider } from '@/providers';
import { BrowserRouter } from 'react-router-dom';
import { CookiesProvider } from 'react-cookie';
import { theme } from '@/globals/theme';

const queryClient = new QueryClient();

const App = () => {
  return (
    <CookiesProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <ActiveDepartmentProvider>
              <BrowserRouter>
                <NotificationProvider>
                  <SupportChatProvider>
                    <ChunkLoadErrorBoundary>
                      <AppRouter />
                    </ChunkLoadErrorBoundary>
                  </SupportChatProvider>
                </NotificationProvider>
              </BrowserRouter>
            </ActiveDepartmentProvider>
          </AuthProvider>
        </QueryClientProvider>
      </ThemeProvider>
    </CookiesProvider>
  );
};

export { App };
