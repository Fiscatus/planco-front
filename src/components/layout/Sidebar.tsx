import {
  Assignment,
  AssignmentTurnedIn,
  BarChart,
  Business,
  Close,
  FolderOpen,
  Gavel,
  Home,
  Settings,
  Shield
} from '@mui/icons-material';
import {
  Box,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography
} from '@mui/material';
import { type ReactNode, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { version } from '@/../package.json';
import { useAccessControl } from '@/hooks';

import logo from '/assets/isologo.svg';

type SidebarProps = {
  open: boolean;
  onClose: () => void;
};

type Module = {
  label: string;
  icon: ReactNode;
  path: string;
  description: string;
  disabled?: boolean;
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
    description: 'Organize todas as fases da contratação'
  },
  {
    label: 'Gestão Contratual',
    icon: <FolderOpen sx={{ fontSize: 20 }} />,
    path: '/gestao-contratual',
    description: 'Gerencie contratos e documentos',
    disabled: true
  },
  {
    label: 'Execução Contratual',
    icon: <AssignmentTurnedIn sx={{ fontSize: 20 }} />,
    path: '/execucao-contratual',
    description: 'Monitore a execução do contrato',
    disabled: true
  },
  {
    label: 'Processo Licitatório',
    icon: <Gavel sx={{ fontSize: 20 }} />,
    path: '/processo-licitatorio',
    description: 'Acompanhe o processo licitatório',
    disabled: true
  },
  {
    label: 'Relatórios',
    icon: <BarChart sx={{ fontSize: 20 }} />,
    path: '/relatorios',
    description: 'Visualize dados estratégicos',
    disabled: true
  },
  {
    label: 'Configurações do Fluxo',
    icon: <Settings sx={{ fontSize: 20 }} />,
    path: '/configuracoes-fluxo',
    description: 'Personalize o fluxo de trabalho',
    disabled: true
  }
];

const Sidebar = ({ open, onClose }: SidebarProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { canAccessAdmin, isAdminOnly } = useAccessControl();

  useEffect(() => {
    function handleEsc(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    if (open) window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [open, onClose]);

  const handleModuleClick = (module: Module) => {
    navigate(module.path);
    onClose();
  };

  const isActiveModule = (modulePath: string) => {
    return (
      location.pathname === modulePath ||
      (modulePath === '/' && location.pathname === '/') ||
      (modulePath === '/planejamento-da-contratacao' && location.pathname === '/planejamento-da-contratacao') ||
      (modulePath === '/admin' && location.pathname === '/admin') ||
      (modulePath === '/minhas-gerencias' && location.pathname === '/minhas-gerencias')
    );
  };

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
          borderBottom: 1,
          borderColor: 'divider',
          backgroundColor: 'background.default',
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
              color: 'text.primary'
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
              backgroundColor: 'action.hover'
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
              borderLeft: isActiveDashboard(dashboard.path) ? 4 : 4,
              borderColor: isActiveDashboard(dashboard.path) ? 'primary.main' : 'transparent',
              borderStyle: 'solid',
              backgroundColor: isActiveDashboard(dashboard.path) ? 'secondary.light' : 'transparent',
              color: isActiveDashboard(dashboard.path) ? 'primary.main' : 'text.primary',
              '&:hover': {
                backgroundColor: isActiveDashboard(dashboard.path) ? 'secondary.light' : 'action.hover',
                borderColor: isActiveDashboard(dashboard.path) ? 'primary.main' : 'divider'
              },
              py: 1,
              px: 2
            }}
          >
            <ListItemIcon
              sx={{
                minWidth: 32,
                color: isActiveDashboard(dashboard.path) ? 'primary.main' : 'text.secondary'
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
                    color: 'text.secondary',
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
              color: 'text.secondary',
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
            <ListItem
              key={module.label}
              disablePadding
              sx={{ mb: 0.25 }}
            >
              <ListItemButton
                onClick={() => handleModuleClick(module)}
                disabled={module.disabled}
                sx={{
                  borderRadius: 1,
                  borderLeft: isActiveModule(module.path) ? 4 : 4,
                  borderColor: isActiveModule(module.path) ? 'primary.main' : 'transparent',
                  borderStyle: 'solid',
                  backgroundColor: isActiveModule(module.path) ? 'secondary.light' : 'transparent',
                  color: isActiveModule(module.path)
                    ? 'primary.main'
                    : module.disabled
                      ? 'text.disabled'
                      : 'text.primary',
                  opacity: module.disabled ? 0.5 : 1,
                  cursor: module.disabled ? 'not-allowed' : 'pointer',
                  '&:hover': {
                    backgroundColor: module.disabled
                      ? 'transparent'
                      : isActiveModule(module.path)
                        ? 'secondary.light'
                        : 'action.hover',
                    borderColor: module.disabled
                      ? 'transparent'
                      : isActiveModule(module.path)
                        ? 'primary.main'
                        : 'divider'
                  },
                  py: 1,
                  px: 2
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 32,
                    color: isActiveModule(module.path)
                      ? 'primary.main'
                      : module.disabled
                        ? 'text.disabled'
                        : 'text.secondary'
                  }}
                >
                  {module.icon}
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Typography
                      variant='body2'
                      sx={{
                        fontWeight: 500,
                        lineHeight: 1.2,
                        fontSize: '0.875rem',
                        color: module.disabled ? 'text.disabled' : 'inherit'
                      }}
                    >
                      {module.label}
                    </Typography>
                  }
                  secondary={
                    <Typography
                      variant='caption'
                      sx={{
                        color: 'text.secondary',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        lineHeight: 1.2,
                        fontSize: '0.75rem'
                      }}
                    >
                      {module.description}
                    </Typography>
                  }
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Box>

      <Box sx={{ borderTop: 1, borderColor: 'divider', p: 2 }}>
        <Typography
          variant='caption'
          sx={{
            fontSize: '0.75rem',
            fontWeight: 600,
            color: 'text.secondary',
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
              border: 1,
              borderColor: isActiveModule('/minhas-gerencias') ? 'primary.light' : 'transparent',
              backgroundColor: isActiveModule('/minhas-gerencias') ? 'secondary.light' : 'transparent',
              color: isActiveModule('/minhas-gerencias') ? 'primary.main' : 'text.primary',
              '&:hover': {
                backgroundColor: isActiveModule('/minhas-gerencias') ? 'secondary.light' : 'action.hover',
                borderColor: isActiveModule('/minhas-gerencias') ? 'primary.light' : 'divider'
              },
              py: 1,
              px: 2
            }}
          >
            <ListItemIcon
              sx={{
                minWidth: 32,
                color: isActiveModule('/minhas-gerencias') ? 'primary.main' : 'text.secondary'
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
                    color: 'text.secondary',
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
              border: 1,
              borderColor: isActiveModule('/admin') ? 'primary.light' : 'transparent',
              backgroundColor: isActiveModule('/admin') ? 'secondary.light' : 'transparent',
              color: isActiveModule('/admin') ? 'primary.main' : 'text.primary',
              '&:hover': {
                backgroundColor: isActiveModule('/admin') ? 'secondary.light' : 'action.hover',
                borderColor: isActiveModule('/admin') ? 'primary.light' : 'divider'
              },
              py: 1,
              px: 2
            }}
          >
            <ListItemIcon
              sx={{
                minWidth: 32,
                color: isActiveModule('/admin') ? 'primary.main' : 'text.secondary'
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
                    color: 'text.secondary',
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

      <Box sx={{ borderTop: 1, borderColor: 'divider', p: 2 }}>
        <Box sx={{ textAlign: 'center' }}>
          <Typography
            variant='caption'
            sx={{
              color: 'text.secondary',
              fontSize: '0.75rem',
              display: 'block'
            }}
          >
            Planco V{version}
          </Typography>
          <Typography
            variant='caption'
            sx={{
              color: 'text.secondary',
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
          width: 320,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: 320,
            boxSizing: 'border-box',
            backgroundColor: 'background.paper',
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
