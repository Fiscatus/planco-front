import { Headphones, Logout, Menu as MenuIcon, Notifications, Search, Settings } from '@mui/icons-material';
import {
  AppBar,
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
import { type MouseEvent, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks';

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
      position='sticky'
      sx={{
        backgroundColor: '#ffffff',
        boxShadow: 1,
        zIndex: 50,
        width: '100%',
        left: 0,
        right: 0
      }}
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
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            flexShrink: 0,
            minWidth: 0
          }}
        >
          <IconButton
            onClick={onMenuClick}
            sx={{
              width: 40,
              height: 40,
              color: '#616161',
              borderRadius: '50%',
              '&:hover': {
                backgroundColor: 'rgba(0, 0, 0, 0.04)'
              }
            }}
            aria-label='Menu'
          >
            <MenuIcon sx={{ fontSize: 24 }} />
          </IconButton>

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
              fontWeight: 700,
              color: '#212121',
              fontSize: '1.25rem',
              whiteSpace: 'nowrap'
            }}
          >
            Planco
          </Typography>
        </Box>

        <Box
          sx={{
            flex: 1,
            display: { xs: 'none', sm: 'flex' },
            justifyContent: 'center',
            mx: 2,
            minWidth: 0,
            maxWidth: '32rem'
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
                left: 16,
                color: '#64748B',
                fontSize: 20,
                pointerEvents: 'none',
                zIndex: 1,
                transition: 'color 0.2s ease'
              }}
            />
            <InputBase
              placeholder='Buscar por processos, contratos ou relatórios...'
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              sx={{
                width: '100%',
                height: 44,
                borderRadius: '12px',
                backgroundColor: '#F8FAFC',
                border: '1px solid #E2E8F0',
                pl: 6,
                pr: 3,
                fontSize: '0.875rem',
                fontWeight: 400,
                color: '#1E293B',
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                '&:focus': {
                  outline: 'none',
                  borderColor: '#1877F2',
                  backgroundColor: '#FFFFFF',
                  boxShadow: '0 0 0 3px rgba(24, 119, 242, 0.1), 0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  '& + .MuiSvgIcon-root': {
                    color: '#1877F2'
                  }
                },
                '&:hover': {
                  borderColor: '#CBD5E1',
                  backgroundColor: '#F1F5F9',
                  boxShadow: '0 2px 4px -1px rgba(0, 0, 0, 0.1)'
                },
                '&::placeholder': {
                  color: '#94A3B8',
                  fontWeight: 400,
                  opacity: 1
                },
                '&:focus::placeholder': {
                  color: '#CBD5E1'
                }
              }}
            />
          </Box>
        </Box>

        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            flexShrink: 0,
            minWidth: 0
          }}
        >
          <IconButton
            sx={{
              width: 40,
              height: 40,
              position: 'relative',
              color: '#616161',
              borderRadius: '50%',
              '&:hover': {
                backgroundColor: 'rgba(0, 0, 0, 0.04)'
              }
            }}
            aria-label='Notificações'
            onClick={() => setNotificationsOpen(!notificationsOpen)}
          >
            <Notifications sx={{ fontSize: 24 }} />
          </IconButton>

          <Box
            onClick={handleAccountMenuOpen}
            sx={{
              width: 40,
              height: 40,
              borderRadius: '50%',
              backgroundColor: '#1877F2',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: 700,
              fontSize: '1.125rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              '&:hover': {
                backgroundColor: '#166fe5',
                transform: 'scale(1.05)'
              }
            }}
          >
            {getInitials(
              ((user?.firstName ? user.firstName : '') + ' ' + (user?.lastName ? user.lastName : '')).trim() || 'U'
            )}
          </Box>

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
