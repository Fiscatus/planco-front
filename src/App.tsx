import { CssBaseline, ThemeProvider } from '@mui/material';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CookiesProvider } from 'react-cookie';
import { BrowserRouter } from 'react-router-dom';
import { ChunkLoadErrorBoundary, NotificationProvider } from '@/components';
import { theme } from '@/globals/theme';
import { AuthProvider } from '@/providers';
import { AppRouter } from '@/router';

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
