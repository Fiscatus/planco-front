import { Box, Link, Typography } from '@mui/material';
import type { ReactNode } from 'react';
import { AuthEditorialPanel } from './AuthEditorialPanel';

type Props = {
  children: ReactNode;
  topRightSlot?: ReactNode;
  formMaxWidth?: number;
};

export const AuthSplitLayout = ({ children, topRightSlot, formMaxWidth = 440 }: Props) => {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', lg: '1.05fr 1fr' },
        backgroundColor: '#FAFAF7'
      }}
    >
      {/* Left panel */}
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          px: { xs: 3, sm: 4, md: 6, lg: '72px' },
          py: { xs: 4, lg: '44px' },
          backgroundColor: '#FAFAF7'
        }}
      >
        {/* Header */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexShrink: 0
          }}
        >
          <Box
            component='a'
            href='/'
            sx={{ display: 'flex', alignItems: 'center', gap: 1.25, textDecoration: 'none' }}
          >
            <img
              src='/assets/isologo.svg'
              alt='Planco'
              style={{ width: 32, height: 32, objectFit: 'contain' }}
            />
            <Typography
              sx={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontWeight: 700,
                fontSize: '1rem',
                color: '#0B1220',
                letterSpacing: '-0.01em'
              }}
            >
              Planco
            </Typography>
          </Box>
          {topRightSlot ?? null}
        </Box>

        {/* Form — verticalmente centralizado (problema 4) + alinhado ao centro (problema 5) */}
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            width: '100%',
            py: 4
          }}
        >
          <Box sx={{ width: '100%', maxWidth: formMaxWidth }}>{children}</Box>
        </Box>

        {/* Footer */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexShrink: 0,
            flexWrap: { xs: 'wrap', sm: 'nowrap' },
            gap: 2,
            pt: 3,
            borderTop: '1px solid #E5E7EB',
            fontSize: 12,
            color: '#6B7280'
          }}
        >
          <Typography sx={{ fontSize: '0.75rem', color: '#6B7280' }}>© 2026 Planco</Typography>
          <Box sx={{ display: 'flex', gap: 2.5, flexWrap: 'wrap' }}>
            {['Privacidade', 'Termos', 'Suporte'].map((label) => (
              <Link
                key={label}
                href='#'
                underline='none'
                sx={{ fontSize: '0.75rem', color: '#6B7280', '&:hover': { color: '#0B1220' } }}
              >
                {label}
              </Link>
            ))}
          </Box>
        </Box>
      </Box>

      {/* Right panel — sticky, hidden on mobile */}
      <Box
        sx={{
          display: { xs: 'none', lg: 'block' },
          position: 'sticky',
          top: 0,
          height: '100vh',
          alignSelf: 'start'
        }}
      >
        <AuthEditorialPanel />
      </Box>
    </Box>
  );
};
