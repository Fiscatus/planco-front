import { useEffect, useRef } from 'react';
import { Box, Button } from '@mui/material';
import { Link } from 'react-router-dom';
import {
  AMBER_500, BLUE_50, BLUE_500, BLUE_600, FONT_MONO,
  GREEN_500, INK_100, INK_200, INK_25, INK_300, INK_400, INK_50,
  INK_500, INK_600, INK_700, INK_75, INK_800, INK_900,
  RED_500, SHADOW_XL,
} from '../constants';

const CONTAINER = { width: '100%', maxWidth: '1200px', mx: 'auto', px: { xs: '20px', sm: '32px' } };

/* ── Dashboard: sidebar nav icon paths (raw SVGs from HTML design) ── */
const IconGrid = () => (
  <svg width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
    <rect x='3' y='3' width='7' height='7'/><rect x='14' y='3' width='7' height='7'/>
    <rect x='3' y='14' width='7' height='7'/><rect x='14' y='14' width='7' height='7'/>
  </svg>
);
const IconDoc = () => (
  <svg width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
    <path d='M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z'/><path d='M14 2v6h6'/>
  </svg>
);
const IconFolder = () => (
  <svg width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
    <path d='M20 7h-3a2 2 0 0 1-2-2V2'/><path d='M9 18a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h7l4 4v7a2 2 0 0 1-2 2Z'/>
    <path d='M3 7.6v12.8A1.6 1.6 0 0 0 4.6 22h9.8'/>
  </svg>
);
const IconClock = () => (
  <svg width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
    <circle cx='12' cy='12' r='10'/><path d='M12 6v6l4 2'/>
  </svg>
);
const IconLayers = () => (
  <svg width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
    <path d='M12 2 2 7l10 5 10-5-10-5Z'/><path d='m2 17 10 5 10-5'/><path d='m2 12 10 5 10-5'/>
  </svg>
);
const IconBuilding = () => (
  <svg width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
    <path d='M3 21h18'/><path d='M5 21V7l8-4v18'/><path d='M19 21V11l-6-4'/>
  </svg>
);
const IconPeople = () => (
  <svg width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
    <path d='M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2'/><circle cx='9' cy='7' r='4'/>
    <path d='M22 21v-2a4 4 0 0 0-3-3.87'/><path d='M16 3.13a4 4 0 0 1 0 7.75'/>
  </svg>
);
const IconSearch = () => (
  <svg width='13' height='13' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
    <circle cx='11' cy='11' r='8'/><path d='m21 21-4.3-4.3'/>
  </svg>
);
const IconFilter = () => (
  <svg width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
    <path d='M3 6h18'/><path d='M7 12h10'/><path d='M10 18h4'/>
  </svg>
);
const IconPlus = () => (
  <svg width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2.5' strokeLinecap='round' strokeLinejoin='round'>
    <path d='M5 12h14'/><path d='M12 5v14'/>
  </svg>
);
const IconCheck = () => (
  <svg width='10' height='10' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='3' strokeLinecap='round' strokeLinejoin='round'>
    <path d='M20 6 9 17l-5-5'/>
  </svg>
);
const IconArrow = () => (
  <svg width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
    <path d='M5 12h14'/><path d='m12 5 7 7-7 7'/>
  </svg>
);
const IconShield = () => (
  <svg width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
    <path d='M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z'/>
  </svg>
);

const STAT_CARDS = [
  { label: 'Em análise', value: '34', trend: '+12%', trendNeg: false },
  { label: 'Aguardando aprovação', value: '18', trend: '+3', trendNeg: true },
  { label: 'Em tramitação', value: '52', trend: null, trendNeg: false },
  { label: 'Concluídos (mês)', value: '24', trend: '+8', trendNeg: false },
];

const PROCESS_ROWS = [
  { id: 'PR-2026/0472', title: 'Aquisição de equipamentos de TI', stage: 'Análise técnica', stageClass: 'analise', progress: 62, avatars: ['AR', 'LM', 'PS'], avColors: ['#7C3AED', '#0891B2', '#DB2777'], due: '18 abr', urgent: false },
  { id: 'PR-2026/0471', title: 'Contratação de serviços de limpeza', stage: 'Aprovação', stageClass: 'aprov', progress: 84, avatars: ['JC', 'MT'], avColors: ['#CA8A04', '#059669'], due: 'hoje', urgent: true },
  { id: 'PR-2026/0469', title: 'Manutenção predial — edifício sede', stage: 'Tramitação', stageClass: 'trami', progress: 40, avatars: ['LM', 'AR', '+2'], avColors: ['#0891B2', '#7C3AED', '#D0D5DD'], due: '02 mai', urgent: false },
  { id: 'PR-2026/0465', title: 'Locação de veículos — frota 2026', stage: 'Concluído', stageClass: 'concl', progress: 100, avatars: ['PS', 'MT'], avColors: ['#DB2777', '#059669'], due: 'concl.', urgent: false },
];

const STAGE_COLORS: Record<string, string> = {
  analise: BLUE_500,
  aprov: AMBER_500,
  trami: '#8B5CF6',
  concl: GREEN_500,
};

const FLOW_STEPS = [
  { label: 'Formalização da demanda', meta: 'Concluído · 28 mar', done: true, current: false },
  { label: 'Termo de referência', meta: 'Concluído · 04 abr', done: true, current: false },
  { label: 'Análise técnica', meta: 'Em andamento · vence 18 abr', done: false, current: true },
  { label: 'Aprovação da autoridade', meta: 'Aguardando', done: false, current: false },
];

const SIDEBAR_NAV = [
  { icon: <IconGrid />, label: 'Início', count: null, active: false },
  { icon: <IconDoc />, label: 'Processos', count: '128', active: true },
  { icon: <IconFolder />, label: 'Pastas', count: '42', active: false },
  { icon: <IconClock />, label: 'Minhas tarefas', count: '7', active: false },
  { icon: <IconLayers />, label: 'Modelos de fluxo', count: null, active: false },
];

const SIDEBAR_ORG = [
  { icon: <IconBuilding />, label: 'Gerências', active: false },
  { icon: <IconPeople />, label: 'Pessoas', active: false },
];

const HeroSection = () => {
  const orb1Ref = useRef<HTMLDivElement>(null);
  const orb2Ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      if (orb1Ref.current) orb1Ref.current.style.transform = `translate3d(0, ${y * 0.25}px, 0)`;
      if (orb2Ref.current) orb2Ref.current.style.transform = `translate3d(0, ${y * 0.15}px, 0)`;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <Box
      component='section'
      sx={{
        position: 'relative',
        pt: { xs: '80px', sm: '104px' },
        pb: '64px',
        overflow: 'hidden',
        background: `radial-gradient(900px 400px at 50% -80px, rgba(25,118,210,0.08), transparent 60%), linear-gradient(180deg, ${INK_25} 0%, #fff 75%)`,
        '&::before': {
          content: '""',
          position: 'absolute',
          inset: 0,
          backgroundImage: `linear-gradient(${INK_100} 1px, transparent 1px), linear-gradient(90deg, ${INK_100} 1px, transparent 1px)`,
          backgroundSize: '56px 56px',
          backgroundPosition: '-1px -1px',
          maskImage: 'radial-gradient(ellipse 70% 55% at 50% 0%, black 0%, transparent 70%)',
          WebkitMaskImage: 'radial-gradient(ellipse 70% 55% at 50% 0%, black 0%, transparent 70%)',
          opacity: 0.55,
          pointerEvents: 'none',
        },
      }}
    >
      {/* Parallax orbs */}
      <Box
        ref={orb1Ref}
        sx={{
          position: 'absolute',
          width: 420, height: 420,
          borderRadius: '50%',
          filter: 'blur(60px)',
          pointerEvents: 'none',
          opacity: 0.55,
          background: 'radial-gradient(circle, rgba(25,118,210,0.35), transparent 60%)',
          top: -80, left: -120,
        }}
      />
      <Box
        ref={orb2Ref}
        sx={{
          position: 'absolute',
          width: 360, height: 360,
          borderRadius: '50%',
          filter: 'blur(60px)',
          pointerEvents: 'none',
          opacity: 0.55,
          background: 'radial-gradient(circle, rgba(100,181,246,0.35), transparent 60%)',
          top: 40, right: -100,
        }}
      />

      {/* Hero text */}
      <Box sx={{ ...CONTAINER, position: 'relative' }}>
        <Box sx={{ textAlign: 'center', maxWidth: 820, mx: 'auto' }}>

          {/* H1 */}
          <Box
            component='h1'
            sx={{
              fontSize: 'clamp(38px, 5.4vw, 62px)',
              lineHeight: 1.05,
              letterSpacing: '-0.025em',
              color: INK_900,
              fontWeight: 600,
              m: 0,
              mb: '22px',
            }}
          >
            O sistema operacional
            <br />
            da{' '}
            <Box component='span' sx={{ color: BLUE_500, fontWeight: 600 }}>
              contratação pública.
            </Box>
          </Box>

          {/* Lede */}
          <Box
            component='p'
            sx={{
              fontSize: 'clamp(16px, 1.4vw, 19px)',
              lineHeight: 1.55,
              color: INK_600,
              maxWidth: 640,
              mx: 'auto',
              mb: '36px',
              fontWeight: 400,
            }}
          >
            Planco reúne os processos administrativos e de contratação pública em um único ambiente
            rastreável, desde a formalização da demanda até a assinatura do contrato.
          </Box>

          {/* CTAs */}
          <Box sx={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap', mb: '20px' }}>
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
                boxShadow: '0 1px 2px rgba(25, 118, 210, 0.18)',
                gap: '8px',
                '&:hover': { background: BLUE_600, boxShadow: '0 4px 10px rgba(25, 118, 210, 0.25)' },
                '& .arrow': { transition: 'transform .15s' },
                '&:hover .arrow': { transform: 'translateX(2px)' },
              }}
            >
              Solicitar demonstração
              <Box className='arrow' component='span' sx={{ display: 'flex', alignItems: 'center' }}>
                <IconArrow />
              </Box>
            </Button>
            <Button
              component='a'
              href='#produto'
              disableElevation
              sx={{
                color: INK_800,
                background: '#fff',
                border: `1px solid ${INK_200}`,
                fontWeight: 500,
                fontSize: '15px',
                textTransform: 'none',
                px: '22px',
                height: '46px',
                borderRadius: '6px',
                '&:hover': { borderColor: INK_300, background: INK_25 },
              }}
            >
              Conhecer o produto
            </Button>
          </Box>

          {/* Meta */}
          <Box sx={{ fontSize: '13px', color: INK_500, display: 'inline-flex', alignItems: 'center', gap: '8px', fontWeight: 400 }}>
            <Box sx={{ color: BLUE_500, display: 'flex' }}>
              <IconShield />
            </Box>
            Aderente à Lei 14.133/2021 · LGPD · Hospedagem em solo nacional
          </Box>
        </Box>
      </Box>

      {/* ──────────── DASHBOARD MOCKUP ──────────── */}
      <Box
        id='produto'
        sx={{ ...CONTAINER, position: 'relative', mt: '64px', pb: '32px' }}
      >
        {/* Glow behind mockup */}
        <Box
          sx={{
            position: 'absolute',
            inset: '40px 10% auto 10%',
            height: '60%',
            background: 'radial-gradient(ellipse at center, rgba(25,118,210,0.18), transparent 70%)',
            filter: 'blur(60px)',
            zIndex: 0,
            pointerEvents: 'none',
          }}
        />

        <Box
          sx={{
            position: 'relative',
            zIndex: 1,
            background: '#fff',
            border: `1px solid ${INK_100}`,
            borderRadius: '14px',
            boxShadow: SHADOW_XL,
            overflow: 'hidden',
            maxWidth: '1140px',
            mx: 'auto',
          }}
        >
          {/* Chrome bar */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px', px: '14px', py: '10px', background: INK_25, borderBottom: `1px solid ${INK_100}` }}>
            <Box sx={{ display: 'flex', gap: '6px' }}>
              {[0, 1, 2].map(i => <Box key={i} sx={{ width: 10, height: 10, borderRadius: '50%', background: INK_200 }} />)}
            </Box>
            <Box sx={{ mx: 'auto', fontFamily: FONT_MONO, fontSize: '11px', color: INK_400, background: '#fff', px: '12px', py: '4px', borderRadius: '6px', border: `1px solid ${INK_100}` }}>
              app.planco.gov.br / processos
            </Box>
            <Box sx={{ width: 42 }} />
          </Box>

          {/* Dash body */}
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '220px 1fr' }, minHeight: 540, position: 'relative' }}>
            {/* Sidebar */}
            <Box
              component='aside'
              sx={{
                background: INK_25,
                borderRight: `1px solid ${INK_100}`,
                p: '18px 12px',
                display: { xs: 'none', md: 'flex' },
                flexDirection: 'column',
                gap: '18px',
              }}
            >
              {/* Brand */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: '10px', px: '8px', py: '6px', fontSize: '14px', fontWeight: 500, color: INK_900, letterSpacing: '-0.01em' }}>
                <Box component='img' src='/assets/isologo.svg' alt='' sx={{ width: 18, height: 22 }} />
                Planco
                <Box sx={{ ml: 'auto', fontSize: '10px', fontWeight: 500, color: INK_500, px: '6px', py: '2px', background: '#fff', border: `1px solid ${INK_100}`, borderRadius: '4px' }}>
                  SEF
                </Box>
              </Box>

              {/* Search */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px', px: '10px', py: '7px', background: '#fff', border: `1px solid ${INK_100}`, borderRadius: '6px', fontSize: '12px', color: INK_400 }}>
                <Box sx={{ display: 'flex', color: INK_400 }}><IconSearch /></Box>
                Buscar processos…
                <Box component='kbd' sx={{ ml: 'auto', fontFamily: FONT_MONO, fontSize: '10px', px: '5px', py: '1px', background: INK_50, border: `1px solid ${INK_100}`, borderRadius: '3px', color: INK_500 }}>
                  ⌘ K
                </Box>
              </Box>

              {/* Work nav */}
              <Box>
                <Box sx={{ fontSize: '10px', color: INK_400, fontWeight: 500, px: '8px', textTransform: 'uppercase', letterSpacing: '0.06em', mb: '6px' }}>Trabalho</Box>
                <Box sx={{ display: 'grid', gap: '2px' }}>
                  {SIDEBAR_NAV.map(item => (
                    <Box
                      key={item.label}
                      sx={{
                        display: 'flex', alignItems: 'center', gap: '10px',
                        px: '9px', py: '7px', borderRadius: '6px',
                        fontSize: '13px', fontWeight: 500,
                        background: item.active ? BLUE_50 : 'transparent',
                        color: item.active ? BLUE_600 : INK_600,
                        '& svg': { color: item.active ? BLUE_500 : INK_400 },
                      }}
                    >
                      {item.icon}
                      {item.label}
                      {item.count && (
                        <Box sx={{ ml: 'auto', fontSize: '11px', fontFamily: FONT_MONO, color: item.active ? BLUE_600 : INK_400 }}>
                          {item.count}
                        </Box>
                      )}
                    </Box>
                  ))}
                </Box>
              </Box>

              {/* Org nav */}
              <Box>
                <Box sx={{ fontSize: '10px', color: INK_400, fontWeight: 500, px: '8px', textTransform: 'uppercase', letterSpacing: '0.06em', mb: '6px' }}>Organização</Box>
                <Box sx={{ display: 'grid', gap: '2px' }}>
                  {SIDEBAR_ORG.map(item => (
                    <Box key={item.label} sx={{ display: 'flex', alignItems: 'center', gap: '10px', px: '9px', py: '7px', borderRadius: '6px', fontSize: '13px', fontWeight: 500, color: INK_600, '& svg': { color: INK_400 } }}>
                      {item.icon}
                      {item.label}
                    </Box>
                  ))}
                </Box>
              </Box>
            </Box>

            {/* Main content */}
            <Box component='main' sx={{ p: '22px 28px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Header */}
              <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px' }}>
                <Box>
                  <Box component='h3' sx={{ fontSize: '20px', fontWeight: 500, color: INK_900, letterSpacing: '-0.015em', m: 0, mb: '4px' }}>Processos ativos</Box>
                  <Box component='p' sx={{ fontSize: '13px', color: INK_500, m: 0 }}>Gerência de Contratações · 128 processos em andamento</Box>
                </Box>
                <Box sx={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                  <Box sx={{ height: 32, px: '12px', borderRadius: '6px', border: `1px solid ${INK_200}`, background: '#fff', fontSize: '12px', fontWeight: 500, color: INK_700, display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                    <IconFilter /> Filtrar
                  </Box>
                  <Box sx={{ height: 32, px: '12px', borderRadius: '6px', background: BLUE_500, border: `1px solid ${BLUE_500}`, fontSize: '12px', fontWeight: 500, color: '#fff', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                    <IconPlus /> Novo processo
                  </Box>
                </Box>
              </Box>

              {/* Stat cards */}
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2,1fr)', md: 'repeat(4,1fr)' }, gap: '12px' }}>
                {STAT_CARDS.map(card => (
                  <Box key={card.label} sx={{ p: '14px 16px', background: `linear-gradient(180deg, #fff 0%, ${INK_25} 100%)`, border: `1px solid ${INK_100}`, borderRadius: '8px' }}>
                    <Box sx={{ fontSize: '11px', color: INK_500, textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 500, mb: '8px' }}>{card.label}</Box>
                    <Box sx={{ fontSize: '22px', fontWeight: 500, color: INK_900, letterSpacing: '-0.015em', display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                      {card.value}
                      {card.trend && (
                        <Box component='span' sx={{ fontSize: '11px', fontWeight: 500, color: card.trendNeg ? AMBER_500 : GREEN_500 }}>{card.trend}</Box>
                      )}
                    </Box>
                  </Box>
                ))}
              </Box>

              {/* Process table */}
              <Box sx={{ border: `1px solid ${INK_100}`, borderRadius: '8px', overflow: 'hidden' }}>
                {/* Table head */}
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1.5fr 1fr 0.8fr', md: '1.8fr 1fr 1.2fr 0.9fr 0.9fr' }, px: '16px', py: '10px', background: INK_25, borderBottom: `1px solid ${INK_100}`, fontSize: '11px', color: INK_500, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  <Box>Processo</Box>
                  <Box>Etapa</Box>
                  <Box>Progresso</Box>
                  <Box sx={{ display: { xs: 'none', md: 'block' } }}>Responsáveis</Box>
                  <Box sx={{ display: { xs: 'none', md: 'block' } }}>Prazo</Box>
                </Box>

                {PROCESS_ROWS.map((row, idx) => (
                  <Box
                    key={row.id}
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: { xs: '1.5fr 1fr 0.8fr', md: '1.8fr 1fr 1.2fr 0.9fr 0.9fr' },
                      px: '16px', py: '12px',
                      borderBottom: idx < PROCESS_ROWS.length - 1 ? `1px solid ${INK_75}` : 'none',
                      alignItems: 'center',
                      fontSize: '13px',
                    }}
                  >
                    <Box sx={{ fontWeight: 500, color: INK_900, display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                      <Box sx={{ fontFamily: FONT_MONO, fontSize: '11px', color: INK_500, background: INK_50, px: '6px', py: '2px', borderRadius: '4px', fontWeight: 400, flexShrink: 0 }}>{row.id}</Box>
                      <Box sx={{ fontSize: '13px' }}>{row.title}</Box>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: INK_600 }}>
                      <Box sx={{ width: 6, height: 6, borderRadius: '50%', background: STAGE_COLORS[row.stageClass] ?? INK_300, flexShrink: 0 }} />
                      {row.stage}
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px', color: INK_600, fontFamily: FONT_MONO, fontSize: '11px' }}>
                      <Box sx={{ flex: 1, height: 4, background: INK_75, borderRadius: '999px', overflow: 'hidden' }}>
                        <Box sx={{ width: `${row.progress}%`, height: '100%', background: row.stageClass === 'concl' ? GREEN_500 : BLUE_500, borderRadius: '999px' }} />
                      </Box>
                      <span>{row.progress}%</span>
                    </Box>
                    <Box sx={{ display: { xs: 'none', md: 'flex' }, ml: '-6px' }}>
                      {row.avatars.map((av, i) => (
                        <Box
                          key={i}
                          sx={{
                            width: 22, height: 22, borderRadius: '50%',
                            border: '2px solid #fff',
                            ml: i === 0 ? 0 : '-6px',
                            fontSize: '9px', fontWeight: 500,
                            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                            color: av === '+2' ? INK_600 : '#fff',
                            background: row.avColors[i],
                            fontFamily: "'Roboto', sans-serif",
                          }}
                        >
                          {av}
                        </Box>
                      ))}
                    </Box>
                    <Box sx={{ display: { xs: 'none', md: 'block' }, fontFamily: FONT_MONO, fontSize: '12px', color: row.urgent ? RED_500 : INK_600 }}>
                      {row.due}
                    </Box>
                  </Box>
                ))}
              </Box>
            </Box>

            {/* Flow panel — hidden below 1100px */}
            <Box
              sx={{
                position: 'absolute',
                right: '16px',
                bottom: '20px',
                width: 280,
                background: 'rgba(255,255,255,0.85)',
                backdropFilter: 'saturate(180%) blur(16px)',
                WebkitBackdropFilter: 'saturate(180%) blur(16px)',
                border: `1px solid rgba(25,118,210,0.16)`,
                borderRadius: '12px',
                boxShadow: '0 20px 48px -16px rgba(13,71,161,0.25), 0 4px 12px -4px rgba(16,24,40,0.08)',
                p: '16px',
                zIndex: 2,
                '@media (max-width: 1100px)': { display: 'none' },
              }}
            >
              <Box sx={{ fontSize: '13px', fontWeight: 500, m: 0, mb: '2px', color: INK_900, letterSpacing: '-0.01em' }}>Fluxo do processo</Box>
              <Box sx={{ fontSize: '11px', color: INK_500, mb: '14px' }}>PR-2026/0472 · Etapa 3 de 6</Box>

              {FLOW_STEPS.map((step, idx) => (
                <Box key={idx} sx={{ display: 'flex', gap: '12px', position: 'relative', pb: idx < FLOW_STEPS.length - 1 ? '14px' : 0, '&:not(:last-child)::after': { content: '""', position: 'absolute', left: '11px', top: '24px', bottom: '2px', width: '1.5px', background: INK_100 } }}>
                  <Box
                    sx={{
                      width: 22, height: 22, borderRadius: '50%',
                      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0,
                      fontSize: '10px', fontWeight: 500,
                      zIndex: 1,
                      background: step.done ? BLUE_500 : step.current ? BLUE_50 : '#fff',
                      border: `2px solid ${step.done ? BLUE_500 : step.current ? BLUE_500 : INK_200}`,
                      color: step.done ? '#fff' : step.current ? BLUE_600 : INK_400,
                      boxShadow: step.current ? '0 0 0 4px rgba(25,118,210,0.12)' : 'none',
                    }}
                  >
                    {step.done ? <IconCheck /> : idx + 1}
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Box sx={{ fontSize: '13px', fontWeight: 500, color: INK_800, mb: '2px' }}>{step.label}</Box>
                    <Box sx={{ fontSize: '11px', color: step.current ? BLUE_600 : INK_500, fontWeight: step.current ? 500 : 400 }}>{step.meta}</Box>
                  </Box>
                </Box>
              ))}
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export { HeroSection };
