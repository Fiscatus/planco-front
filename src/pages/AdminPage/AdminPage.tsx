import { Alert, Box, Chip, Skeleton, Tab, Tabs, Typography } from '@mui/material';
import { Component, Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { GroupOutlined, PersonAddOutlined, RouteOutlined, ShieldOutlined } from '@mui/icons-material';
import { useAccessControl, useAuth, useScreen } from '@/hooks';

import { GerenciaSection } from './components/GerenciaSection';
import { InvitesSection } from './components/InvitesSection';
import { RolesSection } from './components/RolesSection';
import { UserSection } from './components/UserSection';

type TabValue = 'users' | 'gerencias' | 'invites' | 'roles';

type TabConfig = {
  label: string;
  value: TabValue;
  icon: React.ReactElement;
  description: string;
};

type PageConfig = TabConfig & {
  component: React.ComponentType;
};

const createPages = (permissions: {
  canAccessUsers: boolean;
  canAccessDepartments: boolean;
  canAccessInvites: boolean;
  canAccessRoles: boolean;
}): PageConfig[] => {
  const pages: PageConfig[] = [];

  if (permissions.canAccessUsers) {
    pages.push({
      label: 'Usuários',
      value: 'users',
      icon: <GroupOutlined />,
      description: 'Gerencie usuários e suas permissões',
      component: UserSection
    });
  }

  if (permissions.canAccessDepartments) {
    pages.push({
      label: 'Gerências',
      value: 'gerencias',
      icon: <RouteOutlined />,
      description: 'Configure estrutura organizacional',
      component: GerenciaSection
    });
  }

  if (permissions.canAccessInvites) {
    pages.push({
      label: 'Convites',
      value: 'invites',
      icon: <PersonAddOutlined />,
      description: 'Gerencie convites pendentes',
      component: InvitesSection
    });
  }

  if (permissions.canAccessRoles) {
    pages.push({
      label: 'Roles',
      value: 'roles',
      icon: <ShieldOutlined />,
      description: 'Configure roles e permissões',
      component: RolesSection
    });
  }

  return pages;
};

const LoadingFallback = () => (
  <Box sx={{ p: 3 }}>
    <Skeleton
      variant='text'
      width='40%'
      height={32}
      sx={{ mb: 1 }}
    />
    <Skeleton
      variant='text'
      width='60%'
      height={20}
      sx={{ mb: 3 }}
    />
    <Skeleton
      variant='rectangular'
      height={200}
    />
  </Box>
);

const ErrorFallback = ({ error, resetError }: { error: Error; resetError: () => void }) => (
  <Alert
    severity='error'
    action={
      <Box
        component='button'
        onClick={resetError}
        sx={{ cursor: 'pointer' }}
      >
        Tentar novamente
      </Box>
    }
    sx={{ m: 3 }}
  >
    <Typography variant='h6'>Erro ao carregar seção</Typography>
    <Typography variant='body2'>{error.message}</Typography>
  </Alert>
);

class TabErrorBoundary extends Component<
  { children: ReactNode; fallback: React.ComponentType<{ error: Error; resetError: () => void }> },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: ReactNode; fallback: React.ComponentType<{ error: Error; resetError: () => void }> }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Tab Error Boundary caught an error:', error, errorInfo);
  }

  resetError = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError && this.state.error) {
      const FallbackComponent = this.props.fallback;
      return (
        <FallbackComponent
          error={this.state.error}
          resetError={this.resetError}
        />
      );
    }

    return this.props.children;
  }
}
const AdminPage = () => {
  const { isPlatformAdmin } = useAuth();
  const { isMobile } = useScreen();
  const { canAccessUsers, canAccessDepartments, canAccessInvites, canAccessRoles } = useAccessControl();
  
  const pages = useMemo(() => createPages({
    canAccessUsers,
    canAccessDepartments,
    canAccessInvites,
    canAccessRoles
  }), [canAccessUsers, canAccessDepartments, canAccessInvites, canAccessRoles]);

  const [activeTabValue, setActiveTabValue] = useState<TabValue>('users');

  // URL synchronization
  useEffect(() => {
    const hash = window.location.hash.replace('#', '') as TabValue;
    if (hash && pages.some((p) => p.value === hash)) {
      setActiveTabValue(hash);
    }
  }, [pages]);

  useEffect(() => {
    window.location.hash = activeTabValue;
  }, [activeTabValue]);

  // Memoize current page configuration
  const currentPage = useMemo(() => pages.find((p) => p.value === activeTabValue) || pages[0], [pages, activeTabValue]);

  // Handle tab change with validation
  const handleTabChange = useCallback(
    (_: React.SyntheticEvent, newValue: TabValue) => {
      if (pages.some((p) => p.value === newValue)) {
        setActiveTabValue(newValue);
      }
    },
    [pages]
  );

  // Keyboard navigation OPTIONAL was just for fun
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey || event.metaKey) {
        const currentIndex = pages.findIndex((p) => p.value === activeTabValue);

        switch (event.key) {
          case '1':
          case '2':
          case '3':
          case '4': {
            event.preventDefault();
            const tabIndex = Number.parseInt(event.key) - 1;
            if (tabIndex < pages.length) {
              setActiveTabValue(pages[tabIndex].value);
            }
            break;
          }
          case 'ArrowLeft': {
            event.preventDefault();
            const prevIndex = currentIndex > 0 ? currentIndex - 1 : pages.length - 1;
            setActiveTabValue(pages[prevIndex].value);
            break;
          }
          case 'ArrowRight': {
            event.preventDefault();
            const nextIndex = currentIndex < pages.length - 1 ? currentIndex + 1 : 0;
            setActiveTabValue(pages[nextIndex].value);
            break;
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [pages, activeTabValue]);

  // Render current component with error boundary
  const renderTabContent = useCallback(() => {
    const Component = currentPage.component;
    return (
      <TabErrorBoundary fallback={ErrorFallback}>
        <Suspense fallback={<LoadingFallback />}>
          <Component />
        </Suspense>
      </TabErrorBoundary>
    );
  }, [currentPage.component]);

  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundColor: 'grey.50',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      {/* Header Section */}
      <Box
        sx={{
          backgroundColor: 'background.paper',
          borderBottom: 1,
          borderColor: 'divider',
          px: { xs: 2, md: 3 },
          py: 2
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexDirection: { xs: 'column', sm: 'row' },
            gap: 2
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              textAlign: { xs: 'center', sm: 'left' }
            }}
          >
            <Box>
              <Typography
                variant={isMobile ? 'h5' : 'h4'}
                sx={{ fontWeight: 700, lineHeight: 1.2 }}
              >
                Administração
              </Typography>
              <Typography
                variant='body2'
                sx={{ color: 'text.secondary', mt: 0.5 }}
              >
                {currentPage.description}
              </Typography>
            </Box>
          </Box>
          <Box>
            <Chip
              label={isPlatformAdmin ? 'Admin da Plataforma' : 'Admin da Organização'}
              color={isPlatformAdmin ? 'primary' : 'default'}
              variant={isPlatformAdmin ? 'filled' : 'outlined'}
              size='small'
              sx={{ fontWeight: 600 }}
            />
          </Box>
        </Box>
      </Box>

      {/* Content Section */}
      <Box sx={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {/* Navigation Tabs */}
        <Box
          sx={{
            px: { xs: 1, md: 3 },
            pt: 2,
            backgroundColor: 'background.paper',
            borderBottom: 1,
            borderColor: 'divider'
          }}
        >
          <Tabs
            value={activeTabValue}
            onChange={handleTabChange}
            aria-label='Abas da Administração'
            variant={isMobile ? 'scrollable' : 'standard'}
            scrollButtons={isMobile ? 'auto' : false}
            allowScrollButtonsMobile
            sx={{
              '& .MuiTab-root': {
                textTransform: 'none',
                fontWeight: 600,
                minWidth: { xs: 'auto', md: 120 },
                color: 'text.secondary',
                '&.Mui-selected': {
                  color: 'primary.main'
                }
              }
            }}
          >
            {pages.map((tab) => (
              <Tab
                key={tab.value}
                label={tab.label}
                value={tab.value}
                icon={tab.icon}
                iconPosition='start'
                aria-label={`${tab.label} - ${tab.description}`}
              />
            ))}
          </Tabs>
        </Box>

        {/* Tab Content */}
        <Box
          sx={{
            flex: 1,
            p: { xs: 2, md: 3 },
            overflow: 'auto',
            backgroundColor: 'grey.50'
          }}
        >
          {renderTabContent()}
        </Box>
      </Box>
    </Box>
  );
};

export default AdminPage;
