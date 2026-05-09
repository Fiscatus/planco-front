import { Box } from '@mui/material';
import { BLUE_50, BLUE_500, INK_100, INK_25, INK_500, INK_900, CONTAINER_SX, DARK } from '../constants';
import { RevealBox } from './RevealBox';
import { useLandingTheme } from '../LandingThemeContext';

const FEATURES = [
  {
    title: 'Processos estruturados',
    desc: 'Organize demandas em pastas, gerências e fluxos configuráveis. Cada processo reúne documentos, histórico e responsáveis em um só lugar.',
    icon: (
      <svg width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
        <path d='M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z'/>
        <path d='M14 2v6h6'/><path d='M9 13h6'/><path d='M9 17h6'/>
      </svg>
    ),
  },
  {
    title: 'Fluxos configuráveis',
    desc: 'Modele etapas, pareceres, aprovações e tramitações. Cada etapa tem SLA, responsáveis e gatilhos automáticos conforme o tipo de processo.',
    icon: (
      <svg width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
        <circle cx='18' cy='5' r='3'/><circle cx='6' cy='12' r='3'/><circle cx='18' cy='19' r='3'/>
        <path d='m8.59 13.51 6.83 3.98'/><path d='m15.41 6.51-6.82 3.98'/>
      </svg>
    ),
  },
  {
    title: 'Papéis e permissões',
    desc: 'Defina gerências, cargos e níveis de acesso. Usuários veem apenas o que é do escopo deles — com trilha de auditoria completa em cada ação.',
    icon: (
      <svg width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
        <path d='M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2'/><circle cx='9' cy='7' r='4'/>
        <path d='M22 21v-2a4 4 0 0 0-3-3.87'/><path d='M16 3.13a4 4 0 0 1 0 7.75'/>
      </svg>
    ),
  },
  {
    title: 'SLA e prazos por etapa',
    desc: 'Cada etapa tem prazo legal ou interno. O Planco alerta responsáveis antes do vencimento e expõe gargalos por gerência, tipo e volume.',
    icon: (
      <svg width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
        <circle cx='12' cy='12' r='10'/><polyline points='12 6 12 12 16 14'/>
      </svg>
    ),
  },
  {
    title: 'Painéis gerenciais',
    desc: 'Indicadores por gerência, tipo de contratação e etapa. Acompanhe tempo médio, volume financeiro e produtividade em tempo real.',
    icon: (
      <svg width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
        <path d='M3 3v18h18'/><path d='m7 12 4-4 4 4 6-6'/>
      </svg>
    ),
  },
  {
    title: 'Aderente à Lei 14.133',
    desc: 'Modelos prontos para pregão, dispensa, inexigibilidade e credenciamento. Configurações que refletem o rito da Nova Lei de Licitações.',
    icon: (
      <svg width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
        <rect x='3' y='4' width='18' height='18' rx='2' ry='2'/>
        <path d='M16 2v4'/><path d='M8 2v4'/><path d='M3 10h18'/>
      </svg>
    ),
  },
];

const FeaturesGrid = () => {
  const { mode } = useLandingTheme();
  const dark = mode === 'dark';

  return (
    <Box component='section' id='funcionalidades' sx={{ py: '112px' }}>
      <Box sx={CONTAINER_SX}>
        <RevealBox sx={{ maxWidth: 720, mx: 'auto', mb: '64px', textAlign: 'center' }}>
          <Box sx={{ display: 'inline-block', fontSize: '12px', color: BLUE_500, fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase', mb: '14px' }}>
            Funcionalidades
          </Box>
          <Box component='h2' sx={{ fontSize: 'clamp(30px, 3.6vw, 44px)', lineHeight: 1.1, letterSpacing: '-0.025em', fontWeight: 500, color: dark ? DARK.text : INK_900, m: 0, mb: '18px' }}>
            Todo o ciclo do processo
            <br />
            em um{' '}
            <Box component='span' sx={{ color: BLUE_500 }}>só ambiente</Box>.
          </Box>
          <Box component='p' sx={{ fontSize: '17px', color: dark ? DARK.textMuted : INK_500, lineHeight: 1.55, m: 0, fontWeight: 400 }}>
            Responsáveis, prazos, documentos e aprovações registrados em cada etapa, do início ao encerramento do contrato.
          </Box>
        </RevealBox>

        <RevealBox
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2,1fr)', md: 'repeat(3,1fr)' },
            gap: '1px',
            background: dark ? DARK.border : INK_100,
            border: `1px solid ${dark ? DARK.border : INK_100}`,
            borderRadius: '12px',
            overflow: 'hidden',
          }}
        >
          {FEATURES.map(feat => (
            <Box
              key={feat.title}
              sx={{
                background: dark ? DARK.surface : '#fff',
                p: '32px 28px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                transition: 'background .2s',
                '&:hover': { background: dark ? DARK.surfaceAlt : INK_25 },
              }}
            >
              <Box
                sx={{
                  width: 40, height: 40,
                  borderRadius: '8px',
                  background: dark ? 'rgba(25,118,210,0.15)' : BLUE_50,
                  color: BLUE_500,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mb: '4px',
                }}
              >
                {feat.icon}
              </Box>
              <Box component='h3' sx={{ fontSize: '17px', fontWeight: 500, color: dark ? DARK.text : INK_900, m: 0, letterSpacing: '-0.01em' }}>
                {feat.title}
              </Box>
              <Box component='p' sx={{ fontSize: '14px', color: dark ? DARK.textMuted : INK_500, lineHeight: 1.6, m: 0, fontWeight: 400 }}>
                {feat.desc}
              </Box>
            </Box>
          ))}
        </RevealBox>
      </Box>
    </Box>
  );
};

export { FeaturesGrid };
