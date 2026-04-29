import { Box } from '@mui/material';
import { BLUE_300, BLUE_500, FONT_MONO, INK_900, CONTAINER_SX } from '../constants';
import { RevealBox } from './RevealBox';

const ITEMS = [
  {
    num: '01',
    title: 'Auditoria completa por ação',
    desc: 'Quem fez, quando fez, com qual permissão. Cada evento é imutável e exportável para órgãos de controle.',
  },
  {
    num: '02',
    title: 'Documentos versionados',
    desc: 'Termos de referência, pareceres e contratos com controle de versões — sem "_final_v3_revisado.docx".',
  },
  {
    num: '03',
    title: 'Tramitação explícita',
    desc: 'Sempre fica claro onde o processo está, com quem, há quanto tempo e o que precisa acontecer para avançar.',
  },
];

const BenefitsSection = () => (
  <Box component='section' sx={{ py: '88px' }}>
    <Box sx={CONTAINER_SX}>
      <RevealBox
        sx={{
          background: INK_900,
          color: '#fff',
          borderRadius: '16px',
          p: { xs: '40px 28px', md: '64px' },
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
          gap: { xs: '32px', md: '64px' },
          alignItems: 'center',
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            right: '-150px',
            top: '-80px',
            width: 460, height: 460,
            background: `radial-gradient(circle, rgba(25,118,210,0.4), transparent 70%)`,
            filter: 'blur(40px)',
          },
        }}
      >
        {/* Left */}
        <Box sx={{ position: 'relative' }}>
          <Box sx={{ display: 'inline-block', fontSize: '12px', color: BLUE_300, fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase', mb: '14px' }}>
            Diferencial
          </Box>
          <Box component='h2' sx={{ fontSize: 'clamp(28px, 3.4vw, 40px)', lineHeight: 1.12, letterSpacing: '-0.025em', fontWeight: 500, color: '#fff', m: 0, mb: '18px', position: 'relative' }}>
            Rastreabilidade como{' '}
            <Box component='span' sx={{ color: BLUE_300 }}>princípio</Box>.
          </Box>
          <Box component='p' sx={{ fontSize: '16px', color: 'rgba(255,255,255,0.72)', lineHeight: 1.6, maxWidth: '460px', m: 0, mb: '28px', position: 'relative', fontWeight: 400 }}>
            Nada se perde entre gerências. Cada despacho, cada anexo, cada aprovação fica registrado na linha do tempo do processo, com autor, data e contexto completo.
          </Box>
        </Box>

        {/* Right */}
        <Box sx={{ position: 'relative', display: 'grid', gap: '18px' }}>
          {ITEMS.map(item => (
            <Box
              key={item.num}
              sx={{
                display: 'grid',
                gridTemplateColumns: 'auto 1fr',
                gap: '18px',
                p: '22px 24px',
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '12px',
              }}
            >
              <Box sx={{ fontSize: '22px', color: BLUE_300, fontWeight: 400, lineHeight: 1, pt: '4px', fontFamily: FONT_MONO }}>
                {item.num}
              </Box>
              <Box>
                <Box component='h4' sx={{ fontSize: '15px', fontWeight: 500, m: 0, mb: '4px', color: '#fff', letterSpacing: '-0.01em' }}>
                  {item.title}
                </Box>
                <Box component='p' sx={{ fontSize: '13px', color: 'rgba(255,255,255,0.65)', lineHeight: 1.6, m: 0, fontWeight: 400 }}>
                  {item.desc}
                </Box>
              </Box>
            </Box>
          ))}
        </Box>
      </RevealBox>
    </Box>
  </Box>
);

export { BenefitsSection };
