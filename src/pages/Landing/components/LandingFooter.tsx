import { Box } from '@mui/material';
import { BLUE_500, INK_100, INK_500, INK_700, INK_900, CONTAINER_SX, DARK } from '../constants';
import { useLandingTheme } from '../LandingThemeContext';

const FOOTER_COLS = [
  {
    title: 'Produto',
    links: [
      { label: 'Funcionalidades', href: '#funcionalidades' },
      { label: 'Como funciona', href: '#processo' },
      { label: 'Segurança', href: '#seguranca' },
      { label: 'FAQ', href: '#faq' },
    ],
  },
  {
    title: 'Institucional',
    links: [
      { label: 'Sobre', href: '#' },
      { label: 'Legislação', href: '#' },
      { label: 'Contato', href: '#' },
    ],
  },
  {
    title: 'Recursos',
    links: [
      { label: 'Documentação', href: '#' },
      { label: 'Integrações', href: '#' },
      { label: 'Status', href: '#' },
      { label: 'LGPD', href: '#' },
    ],
  },
];

const LandingFooter = () => {
  const { mode } = useLandingTheme();
  const dark = mode === 'dark';

  return (
    <Box
      component='footer'
      sx={{
        pt: '72px',
        pb: '40px',
        borderTop: `1px solid ${dark ? DARK.border : INK_100}`,
        mt: '96px',
      }}
    >
      <Box sx={CONTAINER_SX}>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr 1fr', md: '1.4fr 1fr 1fr 1fr' },
            gap: { xs: '32px', md: '48px' },
          }}
        >
          {/* Brand col */}
          <Box sx={{ gridColumn: { xs: 'span 2', md: 'auto' } }}>
            <Box
              component='a'
              href='/'
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '10px',
                fontWeight: 500,
                fontSize: '20px',
                letterSpacing: '-0.01em',
                color: dark ? DARK.text : INK_900,
                textDecoration: 'none',
              }}
            >
              <Box component='img' src='/assets/isologo.svg' alt='Planco' sx={{ width: 22, height: 27, flexShrink: 0 }} />
              Planco
            </Box>
            <Box component='p' sx={{ fontSize: '14px', color: dark ? DARK.textMuted : INK_500, lineHeight: 1.6, mt: '16px', mb: '20px', maxWidth: 300 }}>
              A plataforma para organizar todo o fluxo dos processos administrativos e de contratação pública.
            </Box>
          </Box>

          {/* Link cols */}
          {FOOTER_COLS.map(col => (
            <Box key={col.title}>
              <Box component='h5' sx={{ fontSize: '12px', color: dark ? DARK.textSubtle : INK_500, fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase', m: 0, mb: '16px' }}>
                {col.title}
              </Box>
              <Box component='ul' sx={{ listStyle: 'none', p: 0, m: 0, display: 'grid', gap: '10px' }}>
                {col.links.map(link => (
                  <Box component='li' key={link.label}>
                    <Box
                      component='a'
                      href={link.href}
                      sx={{
                        fontSize: '14px',
                        color: dark ? DARK.textMuted : INK_700,
                        fontWeight: 400,
                        textDecoration: 'none',
                        transition: 'color .15s',
                        '&:hover': { color: BLUE_500 },
                      }}
                    >
                      {link.label}
                    </Box>
                  </Box>
                ))}
              </Box>
            </Box>
          ))}
        </Box>

        {/* Bottom bar */}
        <Box
          sx={{
            mt: '56px',
            pt: '24px',
            borderTop: `1px solid ${dark ? DARK.border : INK_100}`,
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between',
            alignItems: { xs: 'flex-start', sm: 'center' },
            gap: { xs: '12px', sm: 0 },
            fontSize: '13px',
            color: dark ? DARK.textSubtle : INK_500,
          }}
        >
          <Box>© 2026 Planco. Todos os direitos reservados.</Box>
          <Box sx={{ display: 'flex', gap: '20px' }}>
            {[
              { label: 'Privacidade', href: '/privacy-policy' },
              { label: 'Termos de uso', href: '#' },
              { label: 'LGPD', href: '#' },
            ].map(link => (
              <Box
                key={link.label}
                component='a'
                href={link.href}
                sx={{ color: 'inherit', textDecoration: 'none', '&:hover': { color: BLUE_500 } }}
              >
                {link.label}
              </Box>
            ))}
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export { LandingFooter };
