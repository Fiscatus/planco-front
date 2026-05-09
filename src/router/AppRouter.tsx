import { Box, CircularProgress } from '@mui/material';
import { lazy, Suspense, useEffect, useMemo } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';

import { AppLayout } from '@/components';
import { useAuth } from '@/hooks/useAuth';
import { AdminRoute, ProtectedRoute } from './guards';

// Lazy loaded pages
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage/NotFoundPage'));
const NotAccessPage = lazy(() => import('@/pages/NotAccessPage/NotAccessPage'));
const PrivacyPolicy = lazy(() => import('@/pages/PrivacyPolicy/PrivacyPolicy'));
const Auth = lazy(() => import('@/pages/Auth/Auth'));
const VerifyEmail = lazy(() => import('@/pages/Auth/components/VerifyEmail'));
const OrganizationHome = lazy(() => import('@/pages/OrganizationHome/OrganizationHome'));
const Invites = lazy(() => import('@/pages/Invites/Invites'));
const AdminPage = lazy(() => import('@/pages/AdminPage/AdminPage'));
const MinhasGerencias = lazy(() => import('@/pages/MinhasGerencias/MinhasGerencias'));
const FolderManagement = lazy(() => import('@/pages/FolderManagement/FolderManagement'));
const FolderProcessesPage = lazy(() => import('@/pages/FolderProcesses/FolderProcessesPage'));
const GerenciaProcessesPage = lazy(() => import('@/pages/GerenciaProcesses/GerenciaProcessesPage'));
const FlowModelsPage = lazy(() => import('@/pages/FlowModels/FlowModelsPage'));
const ProcessoPage = lazy(() => import('@/pages/ProcessoPage/ProcessoPage'));
const InsightsPage = lazy(() => import('@/pages/Insights/InsightsPage'));
const PlanejamentoContratacaoPage = lazy(() => import('@/pages/PlanejamentoContratacao/PlanejamentoContratacaoPage'));
const NotificationsPage = lazy(() => import('@/pages/Notifications/NotificationsPage'));
const SettingsPage = lazy(() => import('@/pages/Settings/SettingsPage'));

const ForgotPasswordPage = lazy(() => import('@/pages/Auth/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('@/pages/Auth/ResetPasswordPage'));
const LandingPage = lazy(() => import('@/pages/Landing/LandingPage'));
const WITHOUT_HEADER_ROUTES = ['/auth', '/verify-email', '/privacy-policy', '/auth/forgot-password', '/reset-password'];


// Loading fallback component
const PageLoading = () => (
  <Box
    display='flex'
    justifyContent='center'
    alignItems='center'
    height='100vh'
    width='100%'
  >
    <CircularProgress />
  </Box>
);

// Renders the correct page for '/' depending on auth state
const RootRoute = () => {
  const { user, hasOrganization } = useAuth();
  if (!user) return <LandingPage />;
  if (hasOrganization) return <OrganizationHome />;
  return <Navigate to='/invites' replace />;
};

const AppRouter = () => {
  const { pathname } = useLocation();
  const { hasOrganization, isAuthLoading } = useAuth();

  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);

  if (isAuthLoading) return <PageLoading />;

  // Determina se deve esconder header baseado na rota
  const routeWithoutHeader = useMemo(
    () => WITHOUT_HEADER_ROUTES.some((route) => pathname.startsWith(route)),
    [pathname]
  );

  return (
    <AppLayout
      hideHeader={!hasOrganization || routeWithoutHeader}
      hideSidebar={!hasOrganization || routeWithoutHeader}
    >
      <Suspense fallback={<PageLoading />}>
        <Routes>
          {/* ==================== ROTAS PÚBLICAS ==================== */}
          {/* Root: serves landing for unauthenticated, OrganizationHome for authenticated */}
          <Route path='/' element={<RootRoute />} />

          <Route
            path='/auth'
            element={<Auth />}
          />
          <Route
            path='/verify-email'
            element={<VerifyEmail />}
          />
          <Route path='/privacy-policy' element={<PrivacyPolicy />} />
          <Route path='/auth/forgot-password' element={<ForgotPasswordPage />} />
          <Route path='/reset-password' element={<ResetPasswordPage />} />
          <Route path='/not-access' element={<NotAccessPage />} />
          <Route
            path='/404'
            element={<NotFoundPage />}
          />

          {/* ==================== ROTAS PROTEGIDAS ==================== */}
          <Route element={<ProtectedRoute />}>

            {/* Convites */}
            <Route
              path='/invites'
              element={<Invites />}
            />

            {/* Gerências */}
            <Route
              path='/minhas-gerencias'
              element={<MinhasGerencias />}
            />

            {/* Pastas */}
            <Route
              path='/gerenciamento-pastas'
              element={<FolderManagement />}
            />
            <Route
              path='/pasta/:id'
              element={<FolderProcessesPage />}
            />

            {/* Processos */}
            <Route
              path='/processos-gerencia'
              element={<GerenciaProcessesPage />}
            />
            <Route
              path='/processos-gerencia/:id'
              element={<ProcessoPage />}
            />

            {/* Modelos de Fluxo */}
            <Route
              path='/modelos-fluxo'
              element={<FlowModelsPage />}
            />

            {/* Planejamento da Contratação */}
            <Route
              path='/planejamento-da-contratacao'
              element={<PlanejamentoContratacaoPage />}
            />

            {/* Insights */}
            <Route
              path='/insights'
              element={<InsightsPage />}
            />

            {/* Notificações */}
            <Route path='/notificacoes' element={<NotificationsPage />} />

            {/* Configurações */}
            <Route path='/configuracoes' element={<SettingsPage />} />
            {/* ==================== ROTAS ADMIN ==================== */}
            <Route element={<AdminRoute />}>
              <Route
                path='/admin'
                element={<AdminPage />}
              />
              <Route
                path='/admin/users'
                element={<AdminPage />}
              />
              <Route
                path='/admin/gerencias'
                element={<AdminPage />}
              />
              <Route
                path='/admin/invites'
                element={<AdminPage />}
              />
              <Route
                path='/admin/roles'
                element={<AdminPage />}
              />
            </Route>
          </Route>

          {/* ==================== FALLBACK ==================== */}
          <Route
            path='*'
            element={<NotFoundPage />}
          />
        </Routes>
      </Suspense>
    </AppLayout>
  );
};

export { AppRouter };
