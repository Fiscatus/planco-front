import { useAuth } from '@/hooks';
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
import { Headphones, Logout, Menu as MenuIcon, Notifications, Search, Settings } from '@mui/icons-material';
import { type MouseEvent, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import logo from '/assets/isologo.svg';

interface TopbarProps {
  onMenuClick: () => void;
}

// TODO: Implementar busca e notificações
// TODO: Implementar busca do usuario e informações para colocação no menu
// TODO: Implementar logout

const Topbar = ({ onMenuClick }: TopbarProps) => {
  const { user } = useAuth();
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [accountMenuAnchor, setAccountMenuAnchor] = useState<null | HTMLElement>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [scrollY, setScrollY] = useState(0);
  const navigate = useNavigate();
  const { signOut } = useAuth();

  useEffect(() => {
    let scrollTimer: NodeJS.Timeout;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(scrollTimer);
    };
  }, []);

  const getBackgroundOpacity = () => {
    if (scrollY <= 10) return 0.9;
    return 0.6;
  };

  const getBlurIntensity = () => {
    if (scrollY <= 10) return '8px';
    return '4px';
  };

  const handleAccountMenuOpen = (event: MouseEvent<HTMLElement>) => {
    setAccountMenuAnchor(event.currentTarget);
  };

  const handleAccountMenuClose = () => {
    setAccountMenuAnchor(null);
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/auth');
    handleAccountMenuClose();
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  return (
    <AppBar
      position='fixed'
      sx={{
        backgroundColor: `rgba(255, 255, 255, ${getBackgroundOpacity()})`,
        backdropFilter: `blur(${getBlurIntensity()})`,
        borderBottom: '1px solid #f3f4f6',
        boxShadow: 'none',
        zIndex: 50,
        width: '100%',
        left: 0,
        right: 0,
        transition: 'all 0.3s ease-in-out'
      }}
    >
      <Toolbar
        sx={{
          width: '100%',
          px: { xs: 1, sm: 2 },
          minHeight: '64px !important',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          overflow: 'hidden',
          maxWidth: '100%'
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: { xs: 0.25, sm: 0.5 },
            flexShrink: 0,
            minWidth: 0
          }}
        >
          <IconButton
            onClick={onMenuClick}
            sx={{
              width: 36,
              height: 36,
              borderRadius: 1,
              '&:hover': {
                backgroundColor: '#f3f4f6'
              },
              '&:focus-visible': {
                outline: '2px solid #6366f1',
                outlineOffset: '2px'
              }
            }}
            aria-label='Abrir menu'
          >
            <MenuIcon sx={{ color: '#374151', fontSize: 20 }} />
          </IconButton>

          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: { xs: 0.25, sm: 0.5 },
              minWidth: 0
            }}
          >
            <img
              src={logo}
              alt='Logo Planco'
              style={{
                width: 32,
                height: 32
              }}
            />
            <Typography
              variant='h6'
              sx={{
                fontWeight: 700,
                color: '#1f2937',
                fontSize: '1.125rem',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: { xs: 'none', sm: 'block' }
              }}
            >
              Planco
            </Typography>
          </Box>
        </Box>

        <Box
          sx={{
            flex: 1,
            display: { xs: 'none', sm: 'flex' },
            justifyContent: 'center',
            mx: 1,
            minWidth: 0,
            maxWidth: { sm: '250px', md: '350px' }
          }}
        >
          <Box
            sx={{
              position: 'relative',
              width: '100%',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <Search
              sx={{
                position: 'absolute',
                left: 8,
                color: '#9ca3af',
                fontSize: 16,
                pointerEvents: 'none',
                zIndex: 1
              }}
            />
            <InputBase
              placeholder='Buscar...'
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              sx={{
                width: '100%',
                height: 32,
                borderRadius: '16px',
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                pl: 4,
                pr: 1,
                fontSize: '0.875rem',
                transition: 'all 0.2s ease',
                '&:focus': {
                  outline: '2px solid #6366f1',
                  outlineOffset: '2px',
                  borderColor: '#6366f1',
                  boxShadow: '0 0 0 3px rgba(99, 102, 241, 0.1)'
                },
                '&:hover': {
                  borderColor: '#d1d5db'
                },
                '&::placeholder': {
                  color: '#9ca3af'
                }
              }}
            />
          </Box>
        </Box>

        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: { xs: 0.25, sm: 0.5 },
            flexShrink: 0,
            minWidth: 0
          }}
        >
          <IconButton
            sx={{
              width: 36,
              height: 36,
              position: 'relative',
              color: '#374151',
              '&:hover': {
                backgroundColor: '#f3f4f6'
              }
            }}
            aria-label='Notificações'
            onClick={() => setNotificationsOpen(!notificationsOpen)}
          >
            <Badge
              badgeContent={156}
              sx={{
                '& .MuiBadge-badge': {
                  backgroundColor: '#ef4444',
                  color: 'white',
                  fontSize: '12px',
                  minWidth: 16,
                  height: 16,
                  top: -2,
                  right: -2,
                  fontWeight: 600
                }
              }}
            >
              <Notifications sx={{ fontSize: 22 }} />
            </Badge>
          </IconButton>

          <IconButton
            onClick={handleAccountMenuOpen}
            sx={{
              width: 36,
              height: 36,
              p: 0,
              overflow: 'hidden',
              borderRadius: '50%',
              border: '1px solid #e5e7eb',
              '&:hover': {
                backgroundColor: '#f3f4f6'
              }
            }}
            aria-label='Abrir menu da conta'
          >
            <Avatar
              sx={{
                width: 36,
                height: 36,
                fontSize: '0.875rem',
                fontWeight: 500,
                backgroundColor: '#6366f1',
                color: 'white'
              }}
            >
              {getInitials(
                ((user?.firstName ? user.firstName : '') + ' ' + (user?.lastName ? user.lastName : '')).trim() || 'U'
              )}
            </Avatar>
          </IconButton>

          <Menu
            anchorEl={accountMenuAnchor}
            open={Boolean(accountMenuAnchor)}
            onClose={handleAccountMenuClose}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right'
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right'
            }}
            slotProps={{
              paper: {
                sx: {
                  width: 200,
                  mt: 1
                }
              }
            }}
          >
            <Box sx={{ px: 2, py: 1 }}>
              <Typography
                variant='subtitle2'
                sx={{ fontWeight: 600, lineHeight: 1.2, fontSize: '0.875rem' }}
              >
                {user?.firstName || 'Usuário'}
              </Typography>
              <Typography
                variant='caption'
                sx={{
                  color: '#6b7280',
                  display: 'block',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  fontSize: '0.75rem'
                }}
              >
                {user?.email || ''}
              </Typography>
            </Box>
            <Divider />

            <MenuItem
              onClick={() => {
                navigate('/configuracoes');
                handleAccountMenuClose();
              }}
              sx={{ py: 1, minHeight: 36 }}
            >
              <ListItemIcon sx={{ minWidth: 32 }}>
                <Settings sx={{ fontSize: 16 }} />
              </ListItemIcon>
              <ListItemText
                primary='Configurações'
                sx={{ '& .MuiTypography-root': { fontSize: '0.875rem' } }}
              />
            </MenuItem>

            <MenuItem
              onClick={() => {
                navigate('/suporte');
                handleAccountMenuClose();
              }}
              sx={{ py: 1, minHeight: 36 }}
            >
              <ListItemIcon sx={{ minWidth: 32 }}>
                <Headphones sx={{ fontSize: 16 }} />
              </ListItemIcon>
              <ListItemText
                primary='Suporte'
                sx={{ '& .MuiTypography-root': { fontSize: '0.875rem' } }}
              />
            </MenuItem>

            <Divider />

            <MenuItem
              onClick={handleLogout}
              sx={{
                py: 1,
                minHeight: 36,
                color: '#dc2626',
                '&:hover': {
                  backgroundColor: '#fef2f2'
                }
              }}
            >
              <ListItemIcon sx={{ minWidth: 32 }}>
                <Logout sx={{ fontSize: 16, color: '#dc2626' }} />
              </ListItemIcon>
              <ListItemText
                primary='Sair do sistema'
                sx={{ '& .MuiTypography-root': { fontSize: '0.875rem' } }}
              />
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export { Topbar };
