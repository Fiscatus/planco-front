import { Box, Typography } from '@mui/material';
import { useId } from 'react';

const PILLARS = [
  {
    num: '01',
    title: 'Planejamento',
    desc: 'Estruture fases, prazos e responsáveis antes de abrir o processo.'
  },
  {
    num: '02',
    title: 'Fase externa',
    desc: 'Acompanhe editais, impugnações e sessões em tempo real.'
  },
  {
    num: '03',
    title: 'Gestão contratual',
    desc: 'Controle vigências, reajustes e obrigações após a assinatura.'
  }
];

export const AuthEditorialPanel = () => {
  const gridPatternId = useId();

  return (
    <Box
      sx={{
        position: 'relative',
        height: '100vh',
        display: 'grid',
        gridTemplateRows: 'auto 1fr auto',
        background: 'linear-gradient(165deg, #1d4ed8 0%, #1e3a8a 100%)',
        color: '#fff',
        px: '64px',
        py: '56px',
        overflow: 'hidden'
      }}
    >
      {/* Radial glow — top right */}
      <Box
        sx={{
          position: 'absolute',
          top: '-10%',
          right: '-5%',
          width: '55%',
          height: '55%',
          background: 'radial-gradient(ellipse at center, rgba(99,102,241,0.38) 0%, transparent 70%)',
          pointerEvents: 'none',
          zIndex: 0
        }}
      />
      {/* Radial glow — bottom left */}
      <Box
        sx={{
          position: 'absolute',
          bottom: '-10%',
          left: '-10%',
          width: '60%',
          height: '50%',
          background: 'radial-gradient(ellipse at center, rgba(30,58,138,0.65) 0%, transparent 70%)',
          pointerEvents: 'none',
          zIndex: 0
        }}
      />

      {/* SVG grid pattern */}
      <Box
        component='svg'
        sx={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          opacity: 0.06,
          zIndex: 1,
          pointerEvents: 'none'
        }}
        xmlns='http://www.w3.org/2000/svg'
      >
        <defs>
          <pattern
            id={gridPatternId}
            width='72'
            height='72'
            patternUnits='userSpaceOnUse'
          >
            <path
              d='M 72 0 L 0 0 0 72'
              fill='none'
              stroke='white'
              strokeWidth='0.5'
            />
          </pattern>
        </defs>
        <rect
          width='100%'
          height='100%'
          fill={`url(#${gridPatternId})`}
        />
      </Box>

      {/* Linha 1: badge ISO/LGPD (auto) */}
      <Box sx={{ position: 'relative', display: 'flex', justifyContent: 'flex-end', zIndex: 2 }}>
        <Box
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 1,
            px: '14px',
            py: '7px',
            borderRadius: '999px',
            border: '1px solid rgba(255,255,255,0.22)',
            backgroundColor: 'rgba(255,255,255,0.06)',
            backdropFilter: 'blur(10px)'
          }}
        >
          <Box
            component='svg'
            width={12}
            height={12}
            viewBox='0 0 24 24'
            fill='none'
            stroke='rgba(191,219,254,0.85)'
            strokeWidth={2}
            strokeLinecap='round'
            strokeLinejoin='round'
          >
            <path d='M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z' />
          </Box>
          <Typography
            sx={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: '0.6875rem',
              fontWeight: 500,
              letterSpacing: '2px',
              textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.85)'
            }}
          >
            ISO 27001 · LGPD
          </Typography>
        </Box>
      </Box>

      {/* Linha 2: hero + subcopy (1fr — centrado verticalmente) */}
      <Box
        sx={{
          position: 'relative',
          zIndex: 2,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          maxWidth: 540,
          py: 3
        }}
      >
        {/* Hero — 3 linhas fixas com <br/> */}
        <Typography
          component='h2'
          sx={{
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontWeight: 500,
            fontSize: '4.75rem',
            lineHeight: 0.98,
            letterSpacing: '-2.6px',
            color: 'white',
            m: 0
          }}
        >
          Organizando
          <br />
          <Box
            component='span'
            sx={{
              fontStyle: 'italic',
              fontWeight: 300,
              color: '#bfdbfe',
              letterSpacing: '-1.2px'
            }}
          >
            cada fase
          </Box>
          <br />
          do processo.
        </Typography>
        <Typography
          sx={{
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontSize: '0.9375rem',
            color: 'rgba(219,234,254,0.82)',
            lineHeight: 1.65,
            maxWidth: 480,
            mt: '32px',
            mb: 0
          }}
        >
          Centralize o planejamento, a licitação e a gestão contratual em uma única plataforma, com mais organização,
          transparência e segurança para conduzir cada etapa.
        </Typography>
      </Box>

      {/* Linha 3: pillars (auto) */}
      <Box sx={{ position: 'relative', zIndex: 2 }}>
        <Box sx={{ height: '1px', backgroundColor: 'rgba(255,255,255,0.16)', mb: 3 }} />
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            columnGap: '32px'
          }}
        >
          {PILLARS.map((p) => (
            <Box key={p.num}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.25 }}>
                <Typography
                  sx={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: '0.6875rem',
                    fontWeight: 400,
                    letterSpacing: '2px',
                    color: 'rgba(191,219,254,0.7)',
                    flexShrink: 0
                  }}
                >
                  {p.num}
                </Typography>
                <Box sx={{ flex: 1, height: '1px', backgroundColor: 'rgba(255,255,255,0.18)' }} />
              </Box>
              <Typography
                sx={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontSize: '1rem',
                  fontWeight: 600,
                  color: 'white',
                  letterSpacing: '-0.01em',
                  mb: 0.5
                }}
              >
                {p.title}
              </Typography>
              <Typography
                sx={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontSize: '0.8125rem',
                  color: 'rgba(219,234,254,0.72)',
                  lineHeight: 1.5
                }}
              >
                {p.desc}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
};
