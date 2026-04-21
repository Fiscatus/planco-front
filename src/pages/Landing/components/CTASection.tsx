import { Box, Button } from '@mui/material';
import { Link } from 'react-router-dom';
import { BLUE_500, BLUE_600, BLUE_700, INK_25, CONTAINER_SX } from '../constants';
import { RevealBox } from './RevealBox';

const ArrowIcon = () => (
  <svg width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
    <path d='M5 12h14'/><path d='m12 5 7 7-7 7'/>
  </svg>
);

const CTASection = () => (
  <Box component='section' id='cta' sx={{ py: '88px' }}>
    <Box sx={CONTAINER_SX}>
      <RevealBox
        sx={{
          background: `radial-gradient(ellipse at top left, rgba(66,165,245,0.35), transparent 55%), radial-gradient(ellipse at bottom right, rgba(100,181,246,0.25), transparent 55%), linear-gradient(180deg, ${BLUE_500} 0%, ${BLUE_700} 100%)`,
          borderRadius: '20px',
          p: { xs: '48px 28px', sm: '72px 48px' },
          textAlign: 'center',
          color: '#fff',
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            inset: 0,
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)',
            backgroundSize: '48px 48px',
            maskImage: 'radial-gradient(ellipse at center, black 0%, transparent 70%)',
            WebkitMaskImage: 'radial-gradient(ellipse at center, black 0%, transparent 70%)',
            pointerEvents: 'none',
          },
        }}
      >
        <Box
          component='h2'
          sx={{ fontSize: 'clamp(30px, 4vw, 48px)', lineHeight: 1.1, letterSpacing: '-0.025em', fontWeight: 500, color: '#fff', m: 0, mb: '16px', position: 'relative' }}
        >
          Pronto para estruturar
          <br />
          a gestão de processos do seu órgão?
        </Box>
        <Box
          component='p'
          sx={{ fontSize: '17px', color: 'rgba(255,255,255,0.85)', maxWidth: 540, mx: 'auto', mb: '32px', lineHeight: 1.55, position: 'relative', fontWeight: 400 }}
        >
          Agende uma demonstração guiada de 30 minutos e veja como o Planco se adapta à estrutura e aos fluxos do seu órgão.
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap', position: 'relative' }}>
          <Button
            component={Link}
            to='/solicitar-demonstracao'
            disableElevation
            sx={{
              background: '#fff',
              color: BLUE_600,
              fontWeight: 500,
              fontSize: '15px',
              textTransform: 'none',
              px: '22px',
              height: '46px',
              borderRadius: '6px',
              boxShadow: '0 4px 14px rgba(13, 71, 161, 0.24)',
              gap: '8px',
              '&:hover': { background: INK_25, boxShadow: '0 8px 20px rgba(13, 71, 161, 0.32)' },
              '& .arrow': { transition: 'transform .15s' },
              '&:hover .arrow': { transform: 'translateX(2px)' },
            }}
          >
            Solicitar demonstração
            <Box className='arrow' component='span' sx={{ display: 'flex', alignItems: 'center' }}>
              <ArrowIcon />
            </Box>
          </Button>
          <Button
            component={Link}
            to='/solicitar-demonstracao'
            disableElevation
            sx={{
              color: '#fff',
              background: 'transparent',
              fontWeight: 500,
              fontSize: '15px',
              textTransform: 'none',
              px: '22px',
              height: '46px',
              borderRadius: '6px',
              '&:hover': { background: 'rgba(255,255,255,0.12)', color: '#fff' },
            }}
          >
            Falar com a equipe
          </Button>
        </Box>
      </RevealBox>
    </Box>
  </Box>
);

export { CTASection };
