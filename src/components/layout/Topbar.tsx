import {
  AccountTreeOutlined,
  FolderOutlined,
  GroupOutlined,
  Headphones,
  HomeOutlined,
  InsightsOutlined,
  Logout,
  Menu as MenuIcon,
  Notifications,
  Search,
  Settings
} from '@mui/icons-material';
import {
  AppBar,
  Avatar,
  Badge,
  Box,
  Divider,
  IconButton,
  InputBase,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Toolbar,
  Typography
} from '@mui/material';
import { ArrowDropDownIcon } from '@mui/x-date-pickers';
import { type MouseEvent, useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { NotificationDropdown } from '@/components/NotificationDropdown';
import { useNotification } from '@/components/NotificationProvider';
import { useSupportChat } from '@/contexts';
import { useAuth } from '@/hooks';
import { useNotificationSSE, useUserUpdatedSSE } from '@/hooks/useNotificationSSE';
import { useUnreadCount } from '@/hooks/useNotifications';
import { api } from '@/services';
import logo from '/assets/isologo.svg';

interface TopbarProps {
  onMenuClick: () => void;
  displayNavBarDropdown?: boolean;
}

const pageSet = [
  { route: '/planejamento-da-contratacao', name: 'Planejamento', icon: <HomeOutlined sx={{ color: 'rgba(0, 0, 0, 0.54)' }} /> },
  { route: '/processos-gerencia', name: 'Processos', icon: <GroupOutlined sx={{ color: 'rgba(0, 0, 0, 0.54)' }} /> },
  { route: '/modelos-fluxo', name: 'Modelos de Fluxo', icon: <AccountTreeOutlined sx={{ color: 'rgba(0, 0, 0, 0.54)' }} /> },
  { route: '/gerenciamento-pastas', name: 'Gerenciamento de Pastas', icon: <FolderOutlined sx={{ color: 'rgba(0, 0, 0, 0.54)' }} /> },
  { route: '/insights', name: 'Insights', icon: <InsightsOutlined sx={{ color: 'rgba(0, 0, 0, 0.54)' }} /> }
];

const Topbar = ({ onMenuClick, displayNavBarDropdown = false }: TopbarProps) => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { showAppNotification } = useNotification();
  const { openChat } = useSupportChat();

  const [notificationsAnchor, setNotificationsAnchor] = useState<null | HTMLElement>(null);
  const [accountMenuAnchor, setAccountMenuAnchor] = useState<null | HTMLElement>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const { data: unreadCount = 0 } = useUnreadCount();

  const shownIds = useRef<Set<string>>(new Set());

  useNotificationSSE(!!user, (notif) => {
    if (shownIds.current.has(notif._id)) return;
    shownIds.current.add(notif._id);
    showAppNotification(notif);
  });

  useUserUpdatedSSE(!!user, async () => {
    // Busca notificações não lidas recentes e exibe as que ainda não foram mostradas
    try {
      const { data } = await api.get<{ items: any[] }>('/notifications', {
        params: { read: false, limit: 5, page: 1 }
      });
      data.items.forEach((notif: any) => {
        if (shownIds.current.has(notif._id)) return;
        shownIds.current.add(notif._id);
        showAppNotification(notif);
      });
    } catch {
      // ignora
    }
  });

  const open = Boolean(anchorEl);
  const handleOpen = useCallback((event: React.MouseEvent<HTMLElement>) => setAnchorEl(event.currentTarget), []);
  const handleClose = useCallback(() => setAnchorEl(null), []);

  useEffect(() => {
    const handleScroll = () => window.scrollY;
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleAccountMenuOpen = (event: MouseEvent<HTMLElement>) => setAccountMenuAnchor(event.currentTarget);
  const handleAccountMenuClose = () => setAccountMenuAnchor(null);

  const handleLogout = async () => {
    await signOut();
    navigate('/auth');
    handleAccountMenuClose();
  };

  const getInitials = (name: string) =>
    name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase();

  return (
    <>
      <AppBar
        position='sticky'
        sx={{ backgroundColor: '#ffffff', boxShadow: 1, zIndex: 50, width: '100%', left: 0, right: 0 }}
      >
        <Toolbar
          sx={{
            width: '100%',
            px: { xs: 2, md: 4 },
            py: 1,
            minHeight: '64px !important',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            overflow: 'hidden',
            maxWidth: '100%'
          }}
        >
          {/* Left — logo + dropdown */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexShrink: 0, minWidth: 0 }}>
            <IconButton
              onClick={onMenuClick}
              sx={{ width: 40, height: 40, color: '#616161', borderRadius: '50%', '&:hover': { backgroundColor: 'rgba(0,0,0,0.04)' } }}
              aria-label='Menu'
            >
              <MenuIcon sx={{ fontSize: 24 }} />
            </IconButton>

            <img src={logo} alt='Planco Logo' style={{ width: 30, height: 30, objectFit: 'contain' }} />

            <Typography variant='h6' sx={{ fontWeight: 700, color: '#212121', fontSize: '1.25rem', whiteSpace: 'nowrap' }}>
              Planco
            </Typography>

            {displayNavBarDropdown && (
              <Box
                onClick={handleOpen}
                sx={{
                  minWidth: 'fit-content', border: '1px solid #E2E8F0', px: 2, py: 0.75,
                  borderRadius: '10px', display: 'flex', alignItems: 'center', gap: 1, height: 38,
                  cursor: 'pointer', backgroundColor: '#FFFFFF', transition: 'all 0.2s ease',
                  boxShadow: '0 1px 2px 0 rgba(0,0,0,0.05)',
                  '&:hover': { borderColor: '#CBD5E1', backgroundColor: '#F8FAFC', '& .MuiSvgIcon-root': { color: '#1877F2' } }
                }}
              >
                {pageSet.find((p) => p.route === window.location.pathname)?.icon}
                <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: '#0f172a', whiteSpace: 'nowrap' }}>
                  {pageSet.find((p) => p.route === window.location.pathname)?.name || 'Navegar'}
                </Typography>
                <ArrowDropDownIcon sx={{ color: '#64748b', fontSize: 20 }} />
              </Box>
            )}

            <Menu
              anchorEl={anchorEl}
              open={open}
              onClose={handleClose}
              slotProps={{ paper: { sx: { overflow: 'visible', mt: 1.5, border: '1px solid #E2E8F0', minWidth: 280, borderRadius: '12px', p: 1, boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' } } }}
              transformOrigin={{ horizontal: 'center', vertical: 'top' }}
              anchorOrigin={{ horizontal: 'center', vertical: 'bottom' }}
            >
              {pageSet.map((page) => (
                <MenuItem
                  key={page.route}
                  onClick={() => { navigate(page.route); handleClose(); }}
                  sx={{
                    borderRadius: '8px', mb: 0.5, px: 1.5, py: 1.25,
                    backgroundColor: page.route === window.location.pathname ? '#E7F3FF' : 'transparent',
                    color: page.route === window.location.pathname ? '#1877F2' : '#334155',
                    transition: 'all 0.15s ease',
                    '&:hover': { backgroundColor: page.route === window.location.pathname ? '#E7F3FF' : '#F8FAFC', color: '#1877F2', transform: 'translateX(4px)' },
                    '&:last-child': { mb: 0 },
                    '& .MuiListItemIcon-root .MuiSvgIcon-root': { color: page.route === window.location.pathname ? '#1877F2' : '#64748b' }
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 36 }}>{page.icon}</ListItemIcon>
                  <ListItemText primary={page.name} sx={{ '& .MuiTypography-root': { fontSize: '0.9375rem', fontWeight: 600 } }} />
                </MenuItem>
              ))}
            </Menu>
          </Box>

          {/* Right — notifications + avatar */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexShrink: 0, minWidth: 0 }}>
            <IconButton
              onClick={(e) => setNotificationsAnchor(e.currentTarget)}
              aria-label='Notificações'
              sx={{ width: 40, height: 40, color: '#616161', borderRadius: '50%', '&:hover': { backgroundColor: 'rgba(0,0,0,0.04)' } }}
            >
              <Badge
                badgeContent={unreadCount > 0 ? unreadCount : undefined}
                color='error'
                max={99}
                sx={{ '& .MuiBadge-badge': { fontSize: '0.6rem', minWidth: 16, height: 16, p: '0 4px' } }}
              >
                <Notifications sx={{ fontSize: 24 }} />
              </Badge>
            </IconButton>

            <Avatar
              src={user?.avatarUrl ?? undefined}
              onClick={handleAccountMenuOpen}
              sx={{
                width: 40, height: 40, bgcolor: '#1877F2',
                fontSize: '1rem', fontWeight: 700, cursor: 'pointer',
                transition: 'all 0.2s ease', '&:hover': { opacity: 0.9, transform: 'scale(1.05)' }
              }}
            >
              {!user?.avatarUrl && getInitials(((user?.firstName ?? '') + ' ' + (user?.lastName ?? '')).trim() || 'U')}
            </Avatar>

            <Menu
              anchorEl={accountMenuAnchor}
              open={Boolean(accountMenuAnchor)}
              onClose={handleAccountMenuClose}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              transformOrigin={{ vertical: 'top', horizontal: 'right' }}
              slotProps={{ paper: { sx: { width: 200, mt: 1 } } }}
            >
              <Box sx={{ px: 2, py: 1 }}>
                <Typography variant='subtitle2' sx={{ fontWeight: 600, lineHeight: 1.2, fontSize: '0.875rem' }}>
                  {user?.firstName || 'Usuário'}
                </Typography>
                <Typography variant='caption' sx={{ color: '#6b7280', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '0.75rem' }}>
                  {user?.email || ''}
                </Typography>
              </Box>
              <Divider />
              <MenuItem onClick={() => { navigate('/configuracoes'); handleAccountMenuClose(); }} sx={{ py: 1, minHeight: 36 }}>
                <ListItemIcon sx={{ minWidth: 32 }}><Settings sx={{ fontSize: 16 }} /></ListItemIcon>
                <ListItemText primary='Configurações' sx={{ '& .MuiTypography-root': { fontSize: '0.875rem' } }} />
              </MenuItem>
              <MenuItem onClick={() => { handleAccountMenuClose(); openChat(); }} sx={{ py: 1, minHeight: 36 }}>
                <ListItemIcon sx={{ minWidth: 32 }}><Headphones sx={{ fontSize: 16 }} /></ListItemIcon>
                <ListItemText primary='Suporte' sx={{ '& .MuiTypography-root': { fontSize: '0.875rem' } }} />
              </MenuItem>
              <Divider />
              <MenuItem onClick={handleLogout} sx={{ py: 1, minHeight: 36, color: '#dc2626', '&:hover': { backgroundColor: '#fef2f2' } }}>
                <ListItemIcon sx={{ minWidth: 32 }}><Logout sx={{ fontSize: 16, color: '#dc2626' }} /></ListItemIcon>
                <ListItemText primary='Sair do sistema' sx={{ '& .MuiTypography-root': { fontSize: '0.875rem' } }} />
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      <NotificationDropdown
        anchorEl={notificationsAnchor}
        onClose={() => setNotificationsAnchor(null)}
        onViewAll={() => { navigate('/notificacoes'); setNotificationsAnchor(null); }}
        unreadCount={unreadCount}
      />
    </>
  );
};

export { Topbar };
