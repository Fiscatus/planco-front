import { CssBaseline, ThemeProvider } from '@mui/material';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import posthog from 'posthog-js';
import { PostHogProvider } from 'posthog-js/react';
import { useEffect } from 'react';
import { CookiesProvider } from 'react-cookie';
import { BrowserRouter } from 'react-router-dom';
import { ChunkLoadErrorBoundary } from '@/components';
import { theme } from '@/globals/theme';
import { AuthProvider } from '@/providers';
import { AppRouter } from '@/router';


const App = () => {
  const queryClient = new QueryClient();

  return (
    <PostHogProvider client={posthog}>
      <CookiesProvider>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <QueryClientProvider client={queryClient}>
            <AuthProvider>
                <BrowserRouter>
                  <ChunkLoadErrorBoundary>
                    <AppRouter />
                  </ChunkLoadErrorBoundary>
                </BrowserRouter>
            </AuthProvider>
          </QueryClientProvider>
        </ThemeProvider>
      </CookiesProvider>
    </PostHogProvider>
  );
};

export { App };
