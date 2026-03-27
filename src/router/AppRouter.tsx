import { Box, CircularProgress } from '@mui/material';
import { lazy, Suspense, useMemo } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';

import { AppLayout } from '@/components';
import { useAuth } from '@/hooks/useAuth';
import { useScreen } from '@/hooks/useScreen';
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
const WITHOUT_HEADER_ROUTES = ['/auth', '/verify-email', '/privacy-policy', '/auth/forgot-password', '/reset-password'];

// Prefixos de rotas que exibem o dropdown da navbar
const NAVBAR_DROPDOWN_PREFIXES = [
  '/planejamento-da-contratacao',
  '/processos-gerencia',
  '/modelos-fluxo',
  '/gerenciamento-pastas',
  '/insights'
];

// Loading fallback component
const LoadingFallback = () => (
  <Box
    display='flex'
    justifyContent='center'
    alignItems='center'
    height='100px'
    width='100%'
  >
    <CircularProgress />
  </Box>
);

const AppRouter = () => {
  const { pathname } = useLocation();
  const { user, hasOrganization } = useAuth();
  const { isDesktop } = useScreen();

  // Determina se deve esconder header baseado na rota
  const routeWithoutHeader = useMemo(
    () => WITHOUT_HEADER_ROUTES.some((route) => pathname.startsWith(route)),
    [pathname]
  );

  // Determina se deve exibir dropdown na navbar (funciona com subrotas)
  const displayNavBarDropdown = useMemo(
    () => NAVBAR_DROPDOWN_PREFIXES.some((prefix) => pathname.startsWith(prefix)),
    [pathname]
  );

  // Redireciona usuário não autenticado para auth
  const defaultRedirect = useMemo(() => {
    if (!user) {
      return isDesktop ? '/auth' : '/';
    }
    return null;
  }, [user, isDesktop]);

  return (
    <AppLayout
      hideHeader={!hasOrganization || routeWithoutHeader}
      hideSidebar={!hasOrganization || routeWithoutHeader}
      displayNavBarDropdown={displayNavBarDropdown}
    >
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          {/* ==================== ROTAS PÚBLICAS ==================== */}
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

          {/* Redirect para não autenticados */}
          {defaultRedirect && (
            <Route
              path='/'
              element={
                <Navigate
                  to={defaultRedirect}
                  replace
                />
              }
            />
          )}

          {/* ==================== ROTAS PROTEGIDAS ==================== */}
          <Route element={<ProtectedRoute />}>
            {/* Home - requer organização */}
            {hasOrganization && (
              <Route
                path='/'
                element={<OrganizationHome />}
              />
            )}

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
