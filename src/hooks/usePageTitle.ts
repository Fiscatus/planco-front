import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const PAGE_TITLES: Record<string, string> = {
  '/': 'Planco | Gestão de Processos',
  '/auth': 'Entrar | Planco',
  '/auth/forgot-password': 'Recuperar senha | Planco',
  '/reset-password': 'Redefinir senha | Planco',
  '/verify-email': 'Verificar e-mail | Planco',
  '/privacy-policy': 'Política de Privacidade | Planco',
  '/invites': 'Convites | Planco',
  '/minhas-gerencias': 'Minhas Gerências | Planco',
  '/gerenciamento-pastas': 'Pastas | Planco',
  '/processos-gerencia': 'Processos | Planco',
  '/modelos-fluxo': 'Modelos de Fluxo | Planco',
  '/planejamento-da-contratacao': 'Planejamento | Planco',
  '/insights': 'Insights | Planco',
  '/notificacoes': 'Notificações | Planco',
  '/configuracoes': 'Configurações | Planco',
  '/admin': 'Administração | Planco',
  '/admin/users': 'Usuários | Planco',
  '/admin/gerencias': 'Gerências | Planco',
  '/admin/invites': 'Convites | Planco',
  '/admin/roles': 'Cargos | Planco',
  '/not-access': 'Sem acesso | Planco',
  '/404': 'Página não encontrada | Planco',
};

export const usePageTitle = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    const title =
      PAGE_TITLES[pathname] ??
      Object.entries(PAGE_TITLES).find(([route]) => route !== '/' && pathname.startsWith(route))?.[1];
    document.title = title ?? 'Planco | Gestão de Processos';
  }, [pathname]);
};
