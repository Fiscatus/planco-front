import { useEffect, useState } from 'react';
import { Box, Button } from '@mui/material';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { BLUE_500, BLUE_600, INK_25, INK_50, INK_100, INK_600, INK_700, INK_900, SHADOW_XS } from '../constants';

const NAV_ANCHORS = [
  { label: 'Produto',        sectionId: 'produto' },
  { label: 'Funcionalidades', sectionId: 'funcionalidades' },
  { label: 'Como funciona',  sectionId: 'processo' },
  { label: 'Segurança',      sectionId: 'seguranca' },
  { label: 'FAQ',            sectionId: 'faq' },
];

const LandingNavbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const { pathname } = useLocation();
  const navigate = useNavigate();

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
        background: scrolled ? 'rgba(255,255,255,0.94)' : 'rgba(255,255,255,0.82)',
        borderBottom: `1px solid ${scrolled ? INK_100 : 'transparent'}`,
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
            color: INK_900,
            textDecoration: 'none',
          }}
        >
          <Box
            component='img'
            src='/assets/isologo.svg'
            alt='Planco'
            sx={{ width: 22, height: 27, flexShrink: 0 }}
          />
          Planco
        </Box>

        {/* Nav links — hidden below 900px */}
        <Box
          component='nav'
          sx={{
            display: { xs: 'none', md: 'flex' },
            alignItems: 'center',
            gap: '32px',
          }}
        >
          {NAV_ANCHORS.map(link => (
            <Box
              key={link.label}
              component='button'
              onClick={() => scrollToSection(link.sectionId)}
              sx={{
                fontSize: '14px',
                color: INK_600,
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

        {/* CTA buttons */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Button
            component={Link}
            to='/auth'
            disableElevation
            sx={{
              color: INK_700,
              background: 'transparent',
              fontWeight: 500,
              fontSize: '14px',
              textTransform: 'none',
              px: '18px',
              height: '40px',
              borderRadius: '6px',
              minWidth: 0,
              '&:hover': { color: BLUE_500, background: INK_50 },
            }}
          >
            Entrar
          </Button>
          <Button
            component={Link}
            to='/solicitar-demonstracao'
            disableElevation
            sx={{
              background: BLUE_500,
              color: '#fff',
              fontWeight: 500,
              fontSize: '14px',
              textTransform: 'none',
              px: '18px',
              height: '40px',
              borderRadius: '6px',
              minWidth: 0,
              whiteSpace: 'nowrap',
              boxShadow: `0 1px 2px rgba(25, 118, 210, 0.18)`,
              '&:hover': {
                background: BLUE_600,
                boxShadow: '0 4px 10px rgba(25, 118, 210, 0.25)',
              },
            }}
          >
            Solicitar demonstração
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export { LandingNavbar };
