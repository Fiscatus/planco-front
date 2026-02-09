import { CssBaseline } from '@mui/material';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CookiesProvider } from 'react-cookie';
import { BrowserRouter } from 'react-router-dom';
import { ChunkLoadErrorBoundary, NotificationProvider } from '@/components';
import { ActiveDepartmentProvider, ThemeContextProvider } from '@/contexts';
import { AuthProvider } from '@/providers';
import { AppRouter } from '@/router';

const App = () => {
  const queryClient = new QueryClient();

  return (
    <CookiesProvider>
      <ThemeContextProvider>
        <CssBaseline />
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <ActiveDepartmentProvider>
              <NotificationProvider>
                <BrowserRouter>
                  <ChunkLoadErrorBoundary>
                    <AppRouter />
                  </ChunkLoadErrorBoundary>
                </BrowserRouter>
              </NotificationProvider>
            </ActiveDepartmentProvider>
          </AuthProvider>
        </QueryClientProvider>
      </ThemeContextProvider>
    </CookiesProvider>
  );
};

export { App };
