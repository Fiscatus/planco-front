import { useState } from 'react';
import { Box, Collapse } from '@mui/material';
import { BLUE_500, INK_100, INK_400, INK_500, INK_900, CONTAINER_SX, DARK } from '../constants';
import { RevealBox } from './RevealBox';
import { useLandingTheme } from '../LandingThemeContext';

const FAQS = [
  {
    q: 'O Planco atende à Lei 14.133/2021 (Nova Lei de Licitações)?',
    a: 'Sim. A plataforma traz modelos de fluxo prontos para pregão eletrônico, dispensa, inexigibilidade, credenciamento e concorrência — todos alinhados ao rito da Nova Lei. Os modelos são configuráveis pelo órgão para refletir peculiaridades internas.',
  },
  {
    q: 'Como funciona a implantação em um órgão público?',
    a: 'O onboarding padrão contempla mapeamento dos fluxos existentes, migração da estrutura organizacional, configuração dos modelos de processo e treinamento das gerências. A implantação é conduzida em conjunto com o órgão, em etapas definidas com prazos claros.',
  },
  {
    q: 'O sistema se integra ao SEI, a ERPs e a sistemas legados?',
    a: 'Sim. O Planco disponibiliza API REST para integração com SEI, ComprasNet e principais ERPs do setor público, além de integrações customizadas sob demanda com sistemas legados do órgão.',
  },
  {
    q: 'Onde os dados ficam armazenados?',
    a: 'Toda a infraestrutura opera em data centers em solo brasileiro, com conformidade à LGPD, backups diários criptografados e replicação geográfica. Opções de cloud privada e on-premise estão disponíveis sob demanda.',
  },
  {
    q: 'Como é o modelo de contratação?',
    a: 'A contratação é dimensionada conforme o porte do órgão, o volume de processos e o número de usuários ativos. Solicite uma proposta para receber os detalhes comerciais adequados à sua realidade.',
  },
  {
    q: 'O Planco atende órgãos municipais, estaduais e federais?',
    a: 'Sim. A plataforma foi projetada para se adaptar às estruturas de prefeituras, secretarias estaduais, autarquias, institutos federais, universidades, câmaras legislativas e tribunais — cada um com seu escopo de fluxos e gerências.',
  },
];

const ChevronIcon = () => (
  <svg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
    <polyline points='6 9 12 15 18 9'/>
  </svg>
);

const FAQSection = () => {
  const [open, setOpen] = useState<number | null>(0);
  const { mode } = useLandingTheme();
  const dark = mode === 'dark';

  const toggle = (idx: number) => setOpen(prev => (prev === idx ? null : idx));

  return (
    <Box component='section' id='faq' sx={{ py: '88px' }}>
      <Box sx={CONTAINER_SX}>
        <RevealBox sx={{ maxWidth: 720, mx: 'auto', mb: '64px', textAlign: 'center' }}>
          <Box sx={{ display: 'inline-block', fontSize: '12px', color: BLUE_500, fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase', mb: '14px' }}>
            Perguntas frequentes
          </Box>
          <Box component='h2' sx={{ fontSize: 'clamp(30px, 3.6vw, 44px)', lineHeight: 1.1, letterSpacing: '-0.025em', fontWeight: 500, color: dark ? DARK.text : INK_900, m: 0 }}>
            Tudo o que você
            <br />
            quer saber{' '}
            <Box component='span' sx={{ color: BLUE_500 }}>antes</Box>.
          </Box>
        </RevealBox>

        <RevealBox sx={{ maxWidth: 760, mx: 'auto' }}>
          {FAQS.map((faq, idx) => (
            <Box
              key={idx}
              sx={{
                borderBottom: `1px solid ${dark ? DARK.border : INK_100}`,
                ...(idx === 0 ? { borderTop: `1px solid ${dark ? DARK.border : INK_100}` } : {}),
              }}
            >
              <Box
                component='button'
                onClick={() => toggle(idx)}
                sx={{
                  width: '100%',
                  textAlign: 'left',
                  py: '22px',
                  px: '8px',
                  fontSize: '16px',
                  fontWeight: 500,
                  color: open === idx ? BLUE_500 : (dark ? DARK.text : INK_900),
                  letterSpacing: '-0.005em',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '16px',
                  transition: 'color .15s',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  '&:hover': { color: BLUE_500 },
                }}
              >
                {faq.q}
                <Box
                  component='span'
                  sx={{
                    display: 'flex',
                    color: open === idx ? BLUE_500 : (dark ? DARK.textSubtle : INK_400),
                    flexShrink: 0,
                    transition: 'transform .25s ease, color .15s',
                    transform: open === idx ? 'rotate(180deg)' : 'none',
                  }}
                >
                  <ChevronIcon />
                </Box>
              </Box>
              <Collapse in={open === idx}>
                <Box sx={{ px: '8px', pb: '24px', fontSize: '15px', color: dark ? DARK.textMuted : INK_500, lineHeight: 1.65 }}>
                  {faq.a}
                </Box>
              </Collapse>
            </Box>
          ))}
        </RevealBox>
      </Box>
    </Box>
  );
};

export { FAQSection };
