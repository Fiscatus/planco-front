import { Box, CircularProgress } from '@mui/material';
import { Route, Routes, useLocation } from 'react-router-dom';
import { Suspense, lazy, useEffect, useState } from 'react';

import { AppLayout } from '@/components';
import { useAccessControl } from '@/hooks/useAccessControl';
import { useAuth } from '@/hooks/useAuth';
import { useScreen } from '@/hooks/useScreen';

const NotFoundPage = lazy(() => import('@/pages/NotFoundPage/NotFoundPage'));
const NotAccessPage = lazy(() => import('@/pages/NotAccessPage/NotAccessPage'));
const PrivacyPolicy = lazy(() => import('@/pages/PrivacyPolicy/PrivacyPolicy'));
const Auth = lazy(() => import('@/pages/Auth/Auth'));
const OrganizationHome = lazy(() => import('@/pages/OrganizationHome/OrganizationHome'));
const Invites = lazy(() => import('@/pages/Invites/Invites'));
const NotAccess = lazy(() => import('@/pages/NotAccessPage/NotAccessPage'));
const AdminPage = lazy(() => import('@/pages/AdminPage/AdminPage'));
const MinhasGerencias = lazy(() => import('@/pages/MinhasGerencias/MinhasGerencias'));

const withoutHeaderRoutes = ['/auth', '/privacy-policy'];

const AppRouter = () => {
  const { pathname } = useLocation();
  const { user, hasOrganization } = useAuth();
  const { canAccessAdmin } = useAccessControl();
  const { isDesktop } = useScreen();
  const [routeWithoutHeader, setRouteWithoutHeader] = useState(false);

  useEffect(() => {
    if (!user) {
      window.history.replaceState({}, '', isDesktop ? '/auth' : '/');
    }
  }, [user]);

  useEffect(() => {
    setRouteWithoutHeader(withoutHeaderRoutes.includes(pathname));
  }, [pathname]);

  return (
    <AppLayout
      hideHeader={!hasOrganization || routeWithoutHeader}
      hideSidebar={!hasOrganization || routeWithoutHeader}
    >
      <Suspense
        fallback={
          <Box
            display={'flex'}
            justifyContent={'center'}
            alignItems={'center'}
            height={'100px'}
            width={'100%'}
          >
            <CircularProgress />
          </Box>
        }
      >
        <Routes>
          <Route
            path='/auth'
            element={<Auth />}
          />

          {!hasOrganization && (
            <Route
              path='*'
              element={<NotFoundPage />}
            />
          )}

          {user && (
            <>
              <Route
                path='/invites'
                element={<Invites />}
              />
              {hasOrganization && (
                <Route
                  path='/'
                  element={<OrganizationHome />}
                />
              )}
               <Route
                 path='/admin'
                 element={canAccessAdmin ? <AdminPage /> : <NotAccess />}
               />
               <Route
                 path='/minhas-gerencias'
                 element={<MinhasGerencias />}
               />
            </>
          )}

          <Route
            path='/not-access'
            element={<NotAccessPage />}
          />
          <Route
            path='*'
            element={<NotFoundPage />}
          />
          <Route
            path='404'
            element={<NotFoundPage />}
          />
          <Route
            path='privacy-policy'
            element={<PrivacyPolicy />}
          />
        </Routes>
      </Suspense>
    </AppLayout>
  );
};

export { AppRouter };
