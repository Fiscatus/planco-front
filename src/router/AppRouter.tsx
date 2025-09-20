import { Box, CircularProgress } from '@mui/material';
import { lazy, Suspense, useEffect, useState } from 'react';
import { useCookies } from 'react-cookie';
import { Route, Routes, useLocation, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useScreen } from '@/hooks/useScreen';

const Home = lazy(() => import('@/pages/Home/Home'));
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage/NotFoundPage'));
const PrivacyPolicy = lazy(() => import('@/pages/PrivacyPolicy/PrivacyPolicy'));
const Auth = lazy(() => import('@/pages/Auth/Auth'));
// const TermsAndConditions = lazy(() => import('@/pages/TermsAndConditions/TermsAndConditions'));
// const FAQs = lazy(() => import('@/pages/FAQs/FAQs'));
// const AboutUs = lazy(() => import('@/pages/AboutUs/AboutUs'));

const AppRouter = () => {
  const [_cookie, setCookie] = useCookies(['trafficType']);
  const [searchParams] = useSearchParams();
  const { pathname } = useLocation();
  const { user } = useAuth();
  const { isDesktop } = useScreen();

  useEffect(() => {
    const notTrackingParam = searchParams.get('not-tracking');
    if (notTrackingParam) {
      setCookie('trafficType', 'internal', {
        path: '/',
        maxAge: 31536000
      });
    }
  }, [pathname]);

  useEffect(() => {
    if (!user) {
      window.history.replaceState({}, '', isDesktop ? '/auth' : '/');
    }
  }, [user]);

  return (
    <>
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
          <Route
            path='/'
            element={<Home />}
          />
          <Route
            path='404'
            element={<NotFoundPage />}
          />
          <Route
            path='privacy-policy'
            element={<PrivacyPolicy />}
          />
          {/* <Route
            path='terms-and-conditions'
            element={<TermsAndConditions />}
          />
          <Route
            path='faqs'
            element={<FAQs />}
          />
          <Route
            path='about-us'
            element={<AboutUs />}
          /> */}

          <Route
            path='*'
            element={<NotFoundPage />}
          />
        </Routes>
      </Suspense>
    </>
  );
};

export { AppRouter };
