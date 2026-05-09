import { useEffect, useState } from 'react';
import { Box, Button, IconButton } from '@mui/material';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { BLUE_500, INK_50, INK_100, INK_600, INK_700, INK_900, DARK } from '../constants';
import { useLandingTheme } from '../LandingThemeContext';

const NAV_ANCHORS = [
  { label: 'Produto', sectionId: 'produto' },
  { label: 'Funcionalidades', sectionId: 'funcionalidades' },
  { label: 'Como funciona', sectionId: 'processo' },
  { label: 'Segurança', sectionId: 'seguranca' },
  { label: 'FAQ', sectionId: 'faq' },
];

const SunIcon = () => (
  <svg width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
    <circle cx='12' cy='12' r='5'/><path d='M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42'/>
  </svg>
);

const MoonIcon = () => (
  <svg width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
    <path d='M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z'/>
  </svg>
);

const LandingNavbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { mode, toggle } = useLandingTheme();
  const dark = mode === 'dark';

  const scrollToSection = (sectionId: string) => {
    if (pathname === '/') {
      document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
    } else {
      navigate('/');
      setTimeout(() => {
        document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  };

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <Box
      component='header'
      sx={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        backdropFilter: 'saturate(180%) blur(16px)',
        WebkitBackdropFilter: 'saturate(180%) blur(16px)',
        background: dark
          ? scrolled ? 'rgba(11,15,26,0.92)' : 'rgba(11,15,26,0.8)'
          : scrolled ? 'rgba(255,255,255,0.94)' : 'rgba(255,255,255,0.82)',
        borderBottom: `1px solid ${scrolled ? (dark ? DARK.border : INK_100) : 'transparent'}`,
        transition: 'border-color .2s, background .2s',
      }}
    >
      <Box
        sx={{
          width: '100%',
          maxWidth: '1200px',
          mx: 'auto',
          px: { xs: '20px', sm: '32px' },
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: '68px',
        }}
      >
        {/* Brand */}
        <Box
          component='a'
          href='/'
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontWeight: 500,
            fontSize: '19px',
            letterSpacing: '-0.01em',
            color: dark ? DARK.text : INK_900,
            textDecoration: 'none',
          }}
        >
          <Box component='img' src='/assets/isologo.svg' alt='Planco' sx={{ width: 22, height: 27, flexShrink: 0 }} />
          Planco
        </Box>

        {/* Nav links */}
        <Box component='nav' sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: '32px' }}>
          {NAV_ANCHORS.map(link => (
            <Box
              key={link.label}
              component='button'
              onClick={() => scrollToSection(link.sectionId)}
              sx={{
                fontSize: '14px',
                color: dark ? DARK.textMuted : INK_600,
                fontWeight: 500,
                textDecoration: 'none',
                transition: 'color .15s',
                background: 'none',
                border: 'none',
                padding: 0,
                cursor: 'pointer',
                fontFamily: 'inherit',
                '&:hover': { color: BLUE_500 },
              }}
            >
              {link.label}
            </Box>
          ))}
        </Box>

        {/* Actions */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <IconButton
            onClick={toggle}
            size='small'
            sx={{ color: dark ? DARK.textMuted : INK_700, '&:hover': { color: BLUE_500 } }}
          >
            {dark ? <SunIcon /> : <MoonIcon />}
          </IconButton>
          <Button
            component={Link}
            to='/auth'
            disableElevation
            sx={{
              color: dark ? DARK.text : INK_700,
              background: 'transparent',
              fontWeight: 500,
              fontSize: '14px',
              textTransform: 'none',
              px: '18px',
              height: '40px',
              borderRadius: '6px',
              minWidth: 0,
              '&:hover': { color: BLUE_500, background: dark ? DARK.surfaceAlt : INK_50 },
            }}
          >
            Entrar
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export { LandingNavbar };
