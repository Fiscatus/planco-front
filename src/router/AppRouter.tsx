import { Box, CircularProgress } from "@mui/material";
import { Route, Routes, useLocation, useSearchParams } from "react-router-dom";
import { Suspense, lazy, useEffect, useState } from "react";

import { useAuth } from "@/hooks/useAuth";
import { useCookies } from "react-cookie";
import { useScreen } from "@/hooks/useScreen";
import { AppLayout } from "@/components";

const NotFoundPage = lazy(() => import("@/pages/NotFoundPage/NotFoundPage"));
const NotAccessPage = lazy(() => import("@/pages/NotAccessPage/NotAccessPage"));
const PrivacyPolicy = lazy(() => import("@/pages/PrivacyPolicy/PrivacyPolicy"));
const Auth = lazy(() => import("@/pages/Auth/Auth"));
const OrganizationHome = lazy(() => import("@/pages/OrganizationHome/OrganizationHome"));
const Invites = lazy(() => import("@/pages/Invites/Invites"));

const AppRouter = () => {
  const [_cookie, setCookie] = useCookies(["trafficType"]);
  const [searchParams] = useSearchParams();
  const { pathname } = useLocation();
  const { user, hasOrganization } = useAuth();
  const { isDesktop } = useScreen();
  const [showHeaderAndFooter, setShowHeaderAndFooter] = useState(true);

  useEffect(() => {
    const notTrackingParam = searchParams.get("not-tracking");
    if (notTrackingParam) {
      setCookie("trafficType", "internal", {
        path: "/",
        maxAge: 31536000,
      });
    }
  }, [pathname]);

  useEffect(() => {
    setShowHeaderAndFooter(["/auth"].includes(pathname));
  }, [pathname]);

  useEffect(() => {
    if (!user) {
      window.history.replaceState({}, "", isDesktop ? "/auth" : "/");
    }
  }, [user]);

  return (
    <>
      <AppLayout hideHeader={!hasOrganization} hideSidebar={!hasOrganization}>
        <Suspense
          fallback={
            <Box
              display={"flex"}
              justifyContent={"center"}
              alignItems={"center"}
              height={"100px"}
              width={"100%"}
            >
              <CircularProgress />
            </Box>
          }
        >
          <Routes>
            <Route path="/auth" element={<Auth />} />

            {!hasOrganization && (
              <>
                <Route path="*" element={<NotFoundPage />} />
              </>
            )}

            {user && (
              <>
                <Route path="/invites" element={<Invites />} />
                {hasOrganization && (
                  <>
                    <Route path="/" element={<OrganizationHome />} />
                  </>
                )}
              </>
            )}

            <Route path="/not-access" element={<NotAccessPage />} />
            <Route path="*" element={<NotFoundPage />} />
            <Route path="404" element={<NotFoundPage />} />
            <Route path="privacy-policy" element={<PrivacyPolicy />} />
          </Routes>
        </Suspense>
      </AppLayout>
    </>
  );
};

export { AppRouter };
