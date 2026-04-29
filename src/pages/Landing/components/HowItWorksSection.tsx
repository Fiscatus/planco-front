import { Box, Button } from '@mui/material';
import { Link } from 'react-router-dom';
import { BLUE_50, BLUE_500, BLUE_600, INK_100, INK_500, INK_900, CONTAINER_SX, SHADOW_SM } from '../constants';
import { RevealBox } from './RevealBox';

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

const ArrowIcon = () => (
  <svg width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
    <path d='M5 12h14'/><path d='m12 5 7 7-7 7'/>
  </svg>
);

const HowItWorksSection = () => (
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
            sx={{ fontSize: 'clamp(28px, 3vw, 40px)', lineHeight: 1.1, letterSpacing: '-0.025em', fontWeight: 500, m: 0, mb: '18px', color: INK_900 }}
          >
            Um{' '}
            <Box component='span' sx={{ color: BLUE_500 }}>processo administrativo</Box>
            , do início ao fim.
          </Box>
          <Box component='p' sx={{ fontSize: '16px', color: INK_500, lineHeight: 1.6, m: 0, mb: '28px', maxWidth: '440px', fontWeight: 400 }}>
            Cada processo segue um fluxo configurável, com responsáveis e prazos definidos em cada etapa. O estado de cada demanda é sempre visível — sem consultas manuais ou dependência de e-mails.
          </Box>
          <Button
            component={Link}
            to='/solicitar-demonstracao'
            disableElevation
            sx={{
              background: BLUE_500,
              color: '#fff',
              fontWeight: 500,
              fontSize: '15px',
              textTransform: 'none',
              px: '22px',
              height: '46px',
              borderRadius: '6px',
              gap: '8px',
              boxShadow: '0 1px 2px rgba(25, 118, 210, 0.18)',
              '&:hover': { background: BLUE_600, boxShadow: '0 4px 10px rgba(25, 118, 210, 0.25)' },
              '& .arrow': { transition: 'transform .15s' },
              '&:hover .arrow': { transform: 'translateX(2px)' },
            }}
          >
            Agendar demonstração
            <Box className='arrow' component='span' sx={{ display: 'flex', alignItems: 'center' }}>
              <ArrowIcon />
            </Box>
          </Button>
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
                background: '#fff',
                border: `1px solid ${INK_100}`,
                borderRadius: '12px',
                transition: 'border-color .2s, box-shadow .2s',
                '&:hover': { borderColor: '#90CAF9', boxShadow: SHADOW_SM },
              }}
            >
              <Box
                sx={{
                  width: 36, height: 36,
                  borderRadius: '8px',
                  background: BLUE_50,
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
                <Box component='h4' sx={{ fontSize: '16px', fontWeight: 500, m: 0, mb: '6px', color: INK_900, letterSpacing: '-0.01em' }}>
                  {step.title}
                </Box>
                <Box component='p' sx={{ fontSize: '14px', color: INK_500, lineHeight: 1.6, m: 0 }}>
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

export { HowItWorksSection };
