import {
  Assignment,
  AssignmentTurnedIn,
  BarChart,
  Business,
  Close,
  ExpandLess,
  ExpandMore,
  FolderOpen,
  Gavel,
  Home,
  Settings,
  Shield,
  AccountTreeOutlined,
  GroupOutlined,
  InsightsOutlined,
  FolderOutlined,
} from '@mui/icons-material';
import {
  Box,
  Collapse,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography
} from '@mui/material';
import { type ReactNode, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { version } from '@/../package.json';
import { useAccessControl } from '@/hooks';

import logo from '/assets/isologo.svg';

type SidebarProps = {
  open: boolean;
  onClose: () => void;
};

type SubItem = {
  label: string;
  icon: ReactNode;
  path: string;
};

type Module = {
  label: string;
  icon: ReactNode;
  path: string;
  description: string;
  disabled?: boolean;
  subItems?: SubItem[];
};

const dashboard = {
  label: 'Início',
  icon: <Home sx={{ fontSize: 20 }} />,
  path: '/',
  description: 'Painel inicial do sistema'
};

const modules: Module[] = [
  {
    label: 'Planejamento da Contratação',
    icon: <Assignment sx={{ fontSize: 20 }} />,
    path: '/planejamento-da-contratacao',
    description: 'Organize todas as fases da contratação',
    subItems: [
      { label: 'Painel', icon: <Home sx={{ fontSize: 16 }} />, path: '/planejamento-da-contratacao' },
      { label: 'Processos', icon: <GroupOutlined sx={{ fontSize: 16 }} />, path: '/processos-gerencia' },
      { label: 'Modelos de Fluxo', icon: <AccountTreeOutlined sx={{ fontSize: 16 }} />, path: '/modelos-fluxo' },
      { label: 'Gerenciamento de Pastas', icon: <FolderOutlined sx={{ fontSize: 16 }} />, path: '/gerenciamento-pastas' },
      { label: 'Insights', icon: <InsightsOutlined sx={{ fontSize: 16 }} />, path: '/insights' },
    ]
  }
];

const Sidebar = ({ open, onClose }: SidebarProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { canAccessAdmin, isAdminOnly } = useAccessControl();

  const SUBROUTES = ['/processos-gerencia', '/modelos-fluxo', '/gerenciamento-pastas', '/insights', '/planejamento-da-contratacao'];
  const isInPlanejamento = SUBROUTES.some(r => location.pathname.startsWith(r));

  const STORAGE_KEY = '@planco:sidebar_expanded_module';
  const getInitialExpanded = () => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved !== null) return saved === '' ? null : saved;
    return '/planejamento-da-contratacao'; // padrão: aberto
  };

  const [expandedModule, setExpandedModule] = useState<string | null>(getInitialExpanded);

  useEffect(() => {
    if (isInPlanejamento && expandedModule !== '/planejamento-da-contratacao') {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === null) setExpandedModule('/planejamento-da-contratacao');
    }
  }, [location.pathname, isInPlanejamento]);

  useEffect(() => {
    function handleEsc(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    if (open) window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [open, onClose]);

  const handleModuleClick = (module: Module) => {
    if (module.subItems?.length) {
      const next = expandedModule === module.path ? null : module.path;
      setExpandedModule(next);
      localStorage.setItem(STORAGE_KEY, next ?? '');
      return;
    }
    navigate(module.path);
    onClose();
  };

  const handleSubItemClick = (path: string) => {
    navigate(path);
    onClose();
  };

  const isActiveModule = (modulePath: string) => {
    if (modulePath === '/planejamento-da-contratacao') {
      return SUBROUTES.some(r => location.pathname.startsWith(r));
    }
    return (
      location.pathname === modulePath ||
      (modulePath === '/' && location.pathname === '/') ||
      (modulePath === '/admin' && location.pathname === '/admin') ||
      (modulePath === '/minhas-gerencias' && location.pathname === '/minhas-gerencias')
    );
  };

  const isActiveSubItem = (path: string) => location.pathname.startsWith(path) && (path !== '/planejamento-da-contratacao' || location.pathname === '/planejamento-da-contratacao');

  const isActiveDashboard = (dashboardPath: string) => {
    return location.pathname === dashboardPath;
  };

  const drawerContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: 64,
          px: 3,
          borderBottom: '1px solid #e5e7eb',
          backgroundColor: '#f9fafb',
          position: 'relative'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <img
            src={logo}
            alt='Planco Logo'
            style={{
              width: '30px',
              height: '30px',
              objectFit: 'contain'
            }}
          />
          <Typography
            variant='h6'
            sx={{
              fontSize: '1.125rem',
              fontWeight: 600,
              color: '#111827'
            }}
          >
            Planco
          </Typography>
        </Box>
        <IconButton
          onClick={onClose}
          sx={{
            position: 'absolute',
            right: 16,
            p: 1,
            borderRadius: 1,
            '&:hover': {
              backgroundColor: '#e5e7eb'
            }
          }}
          aria-label='Fechar sidebar'
        >
          <Close sx={{ fontSize: 20 }} />
        </IconButton>
      </Box>

      <Box sx={{ flex: 1, overflowY: 'auto', py: 2 }}>
        <Box sx={{ px: 2, mb: 2 }}>
          <ListItemButton
            onClick={() => handleModuleClick(dashboard)}
            sx={{
              borderRadius: 1,
              mb: 0.5,
              borderLeft: isActiveDashboard(dashboard.path) ? '4px solid #2563eb' : '4px solid transparent',
              backgroundColor: isActiveDashboard(dashboard.path) ? '#eff6ff' : 'transparent',
              color: isActiveDashboard(dashboard.path) ? '#2563eb' : '#374151',
              '&:hover': {
                backgroundColor: isActiveDashboard(dashboard.path) ? '#eff6ff' : '#f9fafb',
                borderLeft: isActiveDashboard(dashboard.path) ? '4px solid #2563eb' : '4px solid #d1d5db'
              },
              py: 1,
              px: 2
            }}
          >
            <ListItemIcon
              sx={{
                minWidth: 32,
                color: isActiveDashboard(dashboard.path) ? '#2563eb' : '#6b7280'
              }}
            >
              {dashboard.icon}
            </ListItemIcon>
            <ListItemText
              primary={
                <Typography
                  variant='body2'
                  sx={{
                    fontWeight: 500,
                    lineHeight: 1.2,
                    fontSize: '0.875rem'
                  }}
                >
                  {dashboard.label}
                </Typography>
              }
              secondary={
                <Typography
                  variant='caption'
                  sx={{
                    color: '#6b7280',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    lineHeight: 1.2,
                    fontSize: '0.75rem'
                  }}
                >
                  {dashboard.description}
                </Typography>
              }
            />
          </ListItemButton>
        </Box>

        <Box sx={{ px: 2 }}>
          <Typography
            variant='caption'
            sx={{
              fontSize: '0.75rem',
              fontWeight: 600,
              color: '#6b7280',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              mb: 1,
              display: 'block'
            }}
          >
            Módulos do Sistema
          </Typography>
        </Box>

        <List sx={{ px: 2 }}>
          {modules.map((module) => (
            <ListItem key={module.label} disablePadding sx={{ mb: 0.25, flexDirection: 'column', alignItems: 'stretch' }}>
              <ListItemButton
                onClick={() => handleModuleClick(module)}
                disabled={module.disabled}
                sx={{
                  borderRadius: 1,
                  borderLeft: isActiveModule(module.path) ? '4px solid #2563eb' : '4px solid transparent',
                  backgroundColor: isActiveModule(module.path) ? '#eff6ff' : 'transparent',
                  color: isActiveModule(module.path) ? '#2563eb' : module.disabled ? '#9ca3af' : '#374151',
                  opacity: module.disabled ? 0.5 : 1,
                  cursor: module.disabled ? 'not-allowed' : 'pointer',
                  '&:hover': {
                    backgroundColor: module.disabled ? 'transparent' : isActiveModule(module.path) ? '#eff6ff' : '#f9fafb',
                    borderLeft: module.disabled ? '4px solid transparent' : isActiveModule(module.path) ? '4px solid #2563eb' : '4px solid #d1d5db'
                  },
                  py: 1,
                  px: 2
                }}
              >
                <ListItemIcon sx={{ minWidth: 32, color: isActiveModule(module.path) ? '#2563eb' : module.disabled ? '#9ca3af' : '#6b7280' }}>
                  {module.icon}
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Typography variant='body2' sx={{ fontWeight: 500, lineHeight: 1.2, fontSize: '0.875rem', color: module.disabled ? '#9ca3af' : 'inherit' }}>
                      {module.label}
                    </Typography>
                  }
                  secondary={
                    <Typography variant='caption' sx={{ color: '#6b7280', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', lineHeight: 1.2, fontSize: '0.75rem' }}>
                      {module.description}
                    </Typography>
                  }
                />
                {module.subItems?.length && !module.disabled && (
                  expandedModule === module.path
                    ? <ExpandLess sx={{ fontSize: 18, color: '#6b7280', ml: 0.5 }} />
                    : <ExpandMore sx={{ fontSize: 18, color: '#6b7280', ml: 0.5 }} />
                )}
              </ListItemButton>

              {/* Sub-itens */}
              {module.subItems?.length && (
                <Collapse in={expandedModule === module.path} timeout='auto' unmountOnExit>
                  <List disablePadding sx={{ pl: 2, mt: 0.5, mb: 0.5 }}>
                    {module.subItems.map(sub => (
                      <ListItemButton
                        key={sub.path}
                        onClick={() => handleSubItemClick(sub.path)}
                        sx={{
                          borderRadius: 1,
                          py: 0.75,
                          px: 1.5,
                          mb: 0.25,
                          borderLeft: isActiveSubItem(sub.path) ? '3px solid #2563eb' : '3px solid transparent',
                          backgroundColor: isActiveSubItem(sub.path) ? '#eff6ff' : 'transparent',
                          color: isActiveSubItem(sub.path) ? '#2563eb' : '#4b5563',
                          '&:hover': {
                            backgroundColor: isActiveSubItem(sub.path) ? '#eff6ff' : '#f9fafb',
                            borderLeft: isActiveSubItem(sub.path) ? '3px solid #2563eb' : '3px solid #d1d5db',
                          }
                        }}
                      >
                        <ListItemIcon sx={{ minWidth: 28, color: isActiveSubItem(sub.path) ? '#2563eb' : '#9ca3af' }}>
                          {sub.icon}
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Typography variant='body2' sx={{ fontSize: '0.8125rem', fontWeight: isActiveSubItem(sub.path) ? 600 : 400, lineHeight: 1.3 }}>
                              {sub.label}
                            </Typography>
                          }
                        />
                      </ListItemButton>
                    ))}
                  </List>
                </Collapse>
              )}
            </ListItem>
          ))}
        </List>
      </Box>

      <Box sx={{ borderTop: '1px solid #e5e7eb', p: 2 }}>
        <Typography
          variant='caption'
          sx={{
            fontSize: '0.75rem',
            fontWeight: 600,
            color: '#6b7280',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            mb: 0.5,
            display: 'block'
          }}
        >
          Acesso Rápido
        </Typography>

        {!isAdminOnly && (
          <ListItemButton
            onClick={() =>
              handleModuleClick({
                label: 'Minhas Gerências',
                icon: <Business sx={{ fontSize: 16 }} />,
                path: '/minhas-gerencias',
                description: 'Gerencie suas gerências'
              })
            }
            sx={{
              borderRadius: 1,
              border: isActiveModule('/minhas-gerencias') ? '1px solid #bfdbfe' : '1px solid transparent',
              backgroundColor: isActiveModule('/minhas-gerencias') ? '#eff6ff' : 'transparent',
              color: isActiveModule('/minhas-gerencias') ? '#2563eb' : '#4b5563',
              '&:hover': {
                backgroundColor: isActiveModule('/minhas-gerencias') ? '#eff6ff' : '#f9fafb',
                border: isActiveModule('/minhas-gerencias') ? '1px solid #bfdbfe' : '1px solid #e5e7eb'
              },
              py: 1,
              px: 2
            }}
          >
            <ListItemIcon
              sx={{
                minWidth: 32,
                color: isActiveModule('/minhas-gerencias') ? '#2563eb' : '#6b7280'
              }}
            >
              <Business sx={{ fontSize: 16 }} />
            </ListItemIcon>
            <ListItemText
              primary={
                <Typography
                  variant='body2'
                  sx={{
                    fontWeight: 500,
                    fontSize: '0.875rem',
                    lineHeight: 1.2
                  }}
                >
                  Minhas Gerências
                </Typography>
              }
              secondary={
                <Typography
                  variant='caption'
                  sx={{
                    color: '#6b7280',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    lineHeight: 1.2,
                    fontSize: '0.75rem'
                  }}
                >
                  Acesse suas gerências
                </Typography>
              }
            />
          </ListItemButton>
        )}

        {canAccessAdmin && (
          <ListItemButton
            onClick={() =>
              handleModuleClick({
                label: 'Administração',
                icon: <Shield sx={{ fontSize: 16 }} />,
                path: '/admin',
                description: 'Painel de administração'
              })
            }
            sx={{
              borderRadius: 1,
              border: isActiveModule('/admin') ? '1px solid #bfdbfe' : '1px solid transparent',
              backgroundColor: isActiveModule('/admin') ? '#eff6ff' : 'transparent',
              color: isActiveModule('/admin') ? '#2563eb' : '#4b5563',
              '&:hover': {
                backgroundColor: isActiveModule('/admin') ? '#eff6ff' : '#f9fafb',
                border: isActiveModule('/admin') ? '1px solid #bfdbfe' : '1px solid #e5e7eb'
              },
              py: 1,
              px: 2
            }}
          >
            <ListItemIcon
              sx={{
                minWidth: 32,
                color: isActiveModule('/admin') ? '#2563eb' : '#6b7280'
              }}
            >
              <Shield sx={{ fontSize: 16 }} />
            </ListItemIcon>
            <ListItemText
              primary={
                <Typography
                  variant='body2'
                  sx={{
                    fontWeight: 500,
                    fontSize: '0.875rem',
                    lineHeight: 1.2
                  }}
                >
                  Administração
                </Typography>
              }
              secondary={
                <Typography
                  variant='caption'
                  sx={{
                    color: '#6b7280',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    lineHeight: 1.2,
                    fontSize: '0.75rem'
                  }}
                >
                  Painel de administração
                </Typography>
              }
            />
          </ListItemButton>
        )}
      </Box>

      <Box sx={{ borderTop: '1px solid #e5e7eb', p: 2 }}>
        <Box sx={{ textAlign: 'center' }}>
          <Typography
            variant='caption'
            sx={{
              color: '#6b7280',
              fontSize: '0.75rem',
              display: 'block'
            }}
          >
            Planco V{version}
          </Typography>
          <Typography
            variant='caption'
            sx={{
              color: '#6b7280',
              fontSize: '0.75rem',
              display: 'block',
              mt: 0.5
            }}
          >
            Tecnologia que impulsiona o planejamento público eficiente.
          </Typography>
        </Box>
      </Box>
    </Box>
  );

  return (
    <>
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          zIndex: 40,
          opacity: open ? 1 : 0,
          visibility: open ? 'visible' : 'hidden',
          transition: 'opacity 200ms, visibility 200ms',
          display: { xs: 'block', md: 'none' }
        }}
        onClick={onClose}
      />

      <Drawer
        variant='temporary'
        open={open}
        onClose={onClose}
        sx={{
          width: 360,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: 360,
            boxSizing: 'border-box',
            backgroundColor: 'white',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
            zIndex: 50,
            border: 'none'
          }
        }}
      >
        {drawerContent}
      </Drawer>
    </>
  );
};

export { Sidebar };
