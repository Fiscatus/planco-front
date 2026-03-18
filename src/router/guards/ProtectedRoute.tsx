import { Navigate, Outlet } from 'react-router-dom';

import { useAuth } from '@/hooks/useAuth';

interface ProtectedRouteProps {
  redirectTo?: string;
}

/**
 * Guard para rotas que requerem autenticação.
 * Redireciona para a página de login se o usuário não estiver autenticado.
 */
const ProtectedRoute = ({ redirectTo = '/auth' }: ProtectedRouteProps) => {
  const { user } = useAuth();

  if (!user) {
    return (
      <Navigate
        to={redirectTo}
        replace
      />
    );
  }

  return <Outlet />;
};

export { ProtectedRoute };
