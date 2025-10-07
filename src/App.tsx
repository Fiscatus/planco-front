import { ChunkLoadErrorBoundary, NotificationProvider } from '@/components';
import { CssBaseline, ThemeProvider } from '@mui/material';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { AppRouter } from '@/router';
import { AuthProvider } from '@/providers';
import { BrowserRouter } from 'react-router-dom';
import { CookiesProvider } from 'react-cookie';
import { theme } from '@/globals/theme';

const App = () => {
  const queryClient = new QueryClient();

  return (
    <CookiesProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <NotificationProvider>
              <BrowserRouter>
                <ChunkLoadErrorBoundary>
                  <AppRouter />
                </ChunkLoadErrorBoundary>
              </BrowserRouter>
            </NotificationProvider>
          </AuthProvider>
        </QueryClientProvider>
      </ThemeProvider>
    </CookiesProvider>
  );
};

export { App };
