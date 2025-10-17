import {
  AdminPanelSettingsOutlined,
  BusinessOutlined,
  MailOutlineOutlined,
  PeopleAltOutlined
} from '@mui/icons-material';
import { Alert, Box, Chip, Skeleton, Tab, Tabs, Typography } from '@mui/material';
import { Component, Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
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
      icon: <PeopleAltOutlined />,
      description: 'Gerencie usuários e suas permissões',
      component: UserSection
    });
  }

  if (permissions.canAccessDepartments) {
    pages.push({
      label: 'Gerências',
      value: 'gerencias',
      icon: <BusinessOutlined />,
      description: 'Configure estrutura organizacional',
      component: GerenciaSection
    });
  }

  if (permissions.canAccessInvites) {
    pages.push({
      label: 'Convites',
      value: 'invites',
      icon: <MailOutlineOutlined />,
      description: 'Gerencie convites pendentes',
      component: InvitesSection
    });
  }

  if (permissions.canAccessRoles) {
    pages.push({
      label: 'Roles',
      value: 'roles',
      icon: <AdminPanelSettingsOutlined />,
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

  const pages = useMemo(
    () =>
      createPages({
        canAccessUsers,
        canAccessDepartments,
        canAccessInvites,
        canAccessRoles
      }),
    [canAccessUsers, canAccessDepartments, canAccessInvites, canAccessRoles]
  );

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
          px: { xs: 3, md: 4 },
          py: 3
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexDirection: { xs: 'column', sm: 'row' },
            gap: 3,
            mb: 3
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 3,
              textAlign: { xs: 'center', sm: 'left' }
            }}
          >
            <Box>
              <Typography
                variant={isMobile ? 'h4' : 'h3'}
                sx={{
                  fontWeight: 700,
                  lineHeight: 1.2,
                  color: 'text.primary',
                  mb: 1
                }}
              >
                Administração
              </Typography>
              <Typography
                variant='body1'
                sx={{
                  color: 'text.secondary',
                  fontWeight: 500,
                  fontSize: '1rem'
                }}
              >
                {currentPage.description}
              </Typography>
            </Box>
          </Box>
          <Box>
            <Chip
              label={isPlatformAdmin ? 'Admin da Plataforma' : 'Admin da Organização'}
              color={isPlatformAdmin ? 'primary' : 'secondary'}
              variant='filled'
              size='medium'
              sx={{
                fontWeight: 600,
                fontSize: '0.875rem',
                px: 2,
                py: 1,
                borderRadius: 2
              }}
            />
          </Box>
        </Box>

        {/* Navigation Tabs */}
        <Box>
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
                minWidth: { xs: 'auto', md: 140 },
                color: 'text.secondary',
                fontSize: '0.875rem',
                px: 3,
                py: 2,
                borderRadius: 2,
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  backgroundColor: 'rgba(24, 119, 242, 0.04)',
                  color: 'primary.main'
                },
                '&.Mui-selected': {
                  color: 'primary.main',
                  backgroundColor: 'rgba(24, 119, 242, 0.08)'
                },
                '& .MuiTab-iconWrapper': {
                  marginRight: 1,
                  '& svg': {
                    fontSize: '1.25rem'
                  }
                }
              },
              '& .MuiTabs-indicator': {
                backgroundColor: 'primary.main',
                height: 3,
                borderRadius: '2px 2px 0 0'
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
      </Box>

      {/* Tab Content */}
      <Box
        sx={{
          flex: 1,
          overflow: 'auto',
          backgroundColor: 'grey.50'
        }}
      >
        {renderTabContent()}
      </Box>
    </Box>
  );
};

export default AdminPage;
