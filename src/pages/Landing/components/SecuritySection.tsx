import { Box } from '@mui/material';
import { BLUE_50, BLUE_500, INK_100, INK_500, INK_900, CONTAINER_SX, DARK } from '../constants';
import { RevealBox } from './RevealBox';
import { useLandingTheme } from '../LandingThemeContext';

const CARDS = [
  {
    title: 'Aderente à Lei 14.133',
    desc: 'Ritos de pregão, dispensa, inexigibilidade e credenciamento modelados conforme a Nova Lei de Licitações.',
    icon: (
      <svg width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
        <path d='M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z'/>
      </svg>
    ),
  },
  {
    title: 'LGPD por padrão',
    desc: 'Tratamento de dados pessoais com base legal definida, registros de consentimento e direitos do titular.',
    icon: (
      <svg width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
        <rect x='3' y='11' width='18' height='11' rx='2' ry='2'/><path d='M7 11V7a5 5 0 0 1 10 0v4'/>
      </svg>
    ),
  },
  {
    title: 'Hospedagem no Brasil',
    desc: 'Infraestrutura em data centers em solo nacional, com backup criptografado e replicação geográfica.',
    icon: (
      <svg width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
        <ellipse cx='12' cy='5' rx='9' ry='3'/><path d='M3 5v14a9 3 0 0 0 18 0V5'/><path d='M3 12a9 3 0 0 0 18 0'/>
      </svg>
    ),
  },
  {
    title: 'Integrações abertas',
    desc: 'API REST para integração com SEI, ComprasNet, ERPs e sistemas legados do órgão.',
    icon: (
      <svg width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
        <path d='M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71'/>
        <path d='M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71'/>
      </svg>
    ),
  },
];

const SecuritySection = () => {
  const { mode } = useLandingTheme();
  const dark = mode === 'dark';

  return (
    <Box component='section' id='seguranca' sx={{ py: '88px' }}>
      <Box sx={CONTAINER_SX}>
        <RevealBox sx={{ maxWidth: 720, mx: 'auto', mb: '64px', textAlign: 'center' }}>
          <Box sx={{ display: 'inline-block', fontSize: '12px', color: BLUE_500, fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase', mb: '14px' }}>
            Segurança e conformidade
          </Box>
          <Box component='h2' sx={{ fontSize: 'clamp(30px, 3.6vw, 44px)', lineHeight: 1.1, letterSpacing: '-0.025em', fontWeight: 500, color: dark ? DARK.text : INK_900, m: 0, mb: '18px' }}>
            Construído para o{' '}
            <Box component='span' sx={{ color: BLUE_500 }}>setor público</Box>.
          </Box>
          <Box component='p' sx={{ fontSize: '17px', color: dark ? DARK.textMuted : INK_500, lineHeight: 1.55, m: 0, fontWeight: 400 }}>
            Padrões de segurança, privacidade e operação adequados ao regime jurídico e às exigências dos órgãos de controle.
          </Box>
        </RevealBox>

        <RevealBox
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2,1fr)', md: 'repeat(4,1fr)' },
            gap: '20px',
          }}
        >
          {CARDS.map(card => (
            <Box
              key={card.title}
              sx={{
                p: '28px 24px',
                background: dark ? DARK.surface : '#fff',
                border: `1px solid ${dark ? DARK.border : INK_100}`,
                borderRadius: '12px',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
                transition: 'border-color .2s',
                '&:hover': { borderColor: dark ? BLUE_500 : '#90CAF9' },
              }}
            >
              <Box
                sx={{
                  width: 36, height: 36,
                  borderRadius: '8px',
                  background: dark ? 'rgba(25,118,210,0.15)' : BLUE_50,
                  color: BLUE_500,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mb: '8px',
                }}
              >
                {card.icon}
              </Box>
              <Box component='h4' sx={{ fontSize: '15px', fontWeight: 500, color: dark ? DARK.text : INK_900, m: 0, letterSpacing: '-0.005em' }}>
                {card.title}
              </Box>
              <Box component='p' sx={{ fontSize: '13px', color: dark ? DARK.textMuted : INK_500, lineHeight: 1.55, m: 0 }}>
                {card.desc}
              </Box>
            </Box>
          ))}
        </RevealBox>
      </Box>
    </Box>
  );
};

export { SecuritySection };
