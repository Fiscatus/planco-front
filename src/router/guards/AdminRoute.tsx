import { Navigate, Outlet } from 'react-router-dom';

import { useAccessControl } from '@/hooks/useAccessControl';

interface AdminRouteProps {
  redirectTo?: string;
}

/**
 * Guard para rotas administrativas.
 * Redireciona para a página de acesso negado se o usuário não tiver permissão.
 */
const AdminRoute = ({ redirectTo = '/not-access' }: AdminRouteProps) => {
  const { canAccessAdmin } = useAccessControl();

  if (!canAccessAdmin) {
    return (
      <Navigate
        to={redirectTo}
        replace
      />
    );
  }

  return <Outlet />;
};

export { AdminRoute };
