import { Box } from '@mui/material';
import { BLUE_500, BLUE_700, CONTAINER_SX } from '../constants';
import { RevealBox } from './RevealBox';

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
          sx={{ fontSize: '17px', color: 'rgba(255,255,255,0.85)', maxWidth: 540, mx: 'auto', mb: 0, lineHeight: 1.55, position: 'relative', fontWeight: 400 }}
        >
          Veja como o Planco se adapta à estrutura e aos fluxos do seu órgão assistindo ao vídeo acima.
        </Box>
      </RevealBox>
    </Box>
  </Box>
);

export { CTASection };
