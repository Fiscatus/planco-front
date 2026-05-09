import { Box } from '@mui/material';
import { BLUE_50, BLUE_500, BLUE_600, INK_100, INK_500, INK_900, CONTAINER_SX, SHADOW_SM, DARK } from '../constants';
import { RevealBox } from './RevealBox';
import { useLandingTheme } from '../LandingThemeContext';

const STEPS = [
  {
    num: '01',
    title: 'Formalização da demanda',
    desc: 'O solicitante abre o processo no Planco, informa o objeto, a justificativa e anexa a documentação inicial. O processo recebe número, pasta e fluxo correspondente.',
  },
  {
    num: '02',
    title: 'Termo de referência',
    desc: 'A equipe técnica elabora o termo de referência com controle de versões. Revisões, pareceres e ajustes ficam registrados na linha do tempo do processo.',
  },
  {
    num: '03',
    title: 'Análise e aprovação',
    desc: 'Autoridades competentes analisam, despacham e aprovam dentro do sistema. Cada ação fica carimbada com autor, data e permissão utilizada.',
  },
  {
    num: '04',
    title: 'Tramitação entre gerências',
    desc: 'O processo segue para procuradoria, orçamento ou outros setores conforme o fluxo configurado. Cada passagem tem responsável definido e prazo registrado.',
  },
  {
    num: '05',
    title: 'Acompanhamento contínuo',
    desc: 'Painéis gerenciais mostram gargalos, prazos críticos e produtividade. A gestão deixa de discutir status e passa a discutir decisões.',
  },
];

const HowItWorksSection = () => {
  const { mode } = useLandingTheme();
  const dark = mode === 'dark';

  return (
    <Box component='section' id='processo' sx={{ py: '88px' }}>
      <Box sx={CONTAINER_SX}>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
            gap: { xs: '32px', md: '64px' },
            alignItems: 'start',
          }}
        >
          {/* Sticky left */}
          <RevealBox sx={{ position: { md: 'sticky' }, top: { md: '100px' } }}>
            <Box sx={{ display: 'inline-block', fontSize: '12px', color: BLUE_500, fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase', mb: '14px' }}>
              Como funciona
            </Box>
            <Box
              component='h2'
              sx={{ fontSize: 'clamp(28px, 3vw, 40px)', lineHeight: 1.1, letterSpacing: '-0.025em', fontWeight: 500, m: 0, mb: '18px', color: dark ? DARK.text : INK_900 }}
            >
              Um{' '}
              <Box component='span' sx={{ color: BLUE_500 }}>processo administrativo</Box>
              , do início ao fim.
            </Box>
            <Box component='p' sx={{ fontSize: '16px', color: dark ? DARK.textMuted : INK_500, lineHeight: 1.6, m: 0, maxWidth: '440px', fontWeight: 400 }}>
              Cada processo segue um fluxo configurável, com responsáveis e prazos definidos em cada etapa. O estado de cada demanda é sempre visível — sem consultas manuais ou dependência de e-mails.
            </Box>
          </RevealBox>

          {/* Steps list */}
          <RevealBox sx={{ display: 'grid', gap: '16px' }}>
            {STEPS.map(step => (
              <Box
                key={step.num}
                sx={{
                  display: 'grid',
                  gridTemplateColumns: 'auto 1fr',
                  gap: '18px',
                  p: '22px 24px',
                  background: dark ? DARK.surface : '#fff',
                  border: `1px solid ${dark ? DARK.border : INK_100}`,
                  borderRadius: '12px',
                  transition: 'border-color .2s, box-shadow .2s',
                  '&:hover': { borderColor: dark ? BLUE_500 : '#90CAF9', boxShadow: SHADOW_SM },
                }}
              >
                <Box
                  sx={{
                    width: 36, height: 36,
                    borderRadius: '8px',
                    background: dark ? 'rgba(25,118,210,0.15)' : BLUE_50,
                    color: BLUE_600,
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 500,
                    fontSize: '14px',
                    flexShrink: 0,
                  }}
                >
                  {step.num}
                </Box>
                <Box sx={{ pt: '4px' }}>
                  <Box component='h4' sx={{ fontSize: '16px', fontWeight: 500, m: 0, mb: '6px', color: dark ? DARK.text : INK_900, letterSpacing: '-0.01em' }}>
                    {step.title}
                  </Box>
                  <Box component='p' sx={{ fontSize: '14px', color: dark ? DARK.textMuted : INK_500, lineHeight: 1.6, m: 0 }}>
                    {step.desc}
                  </Box>
                </Box>
              </Box>
            ))}
          </RevealBox>
        </Box>
      </Box>
    </Box>
  );
};

export { HowItWorksSection };
