import { Layers as LayersIcon } from '@mui/icons-material';
import { Box, Button, Chip, Container, Typography, alpha, useTheme } from '@mui/material';

import logo from '/assets/isologo.svg';
import { useNavigate } from 'react-router-dom';
import { version } from '@/../package.json';

const NAVIGATE_PATHS = {
  PRIVACY_POLICY_PATH: '/politica-privacidade',
  TERMS_OF_USE_PATH: '/termos-de-uso',
  SUPPORT_PATH: '/suporte'
};

const Footer = () => {
  const theme = useTheme();
  const navigate = useNavigate();

  return (
    <Box
      component='footer'
      sx={{
        backgroundColor: '#ffffff',
        borderTop: '1px solid rgba(229, 231, 235, 1)',
        mt: 4,
        width: '100%'
      }}
    >
      <Container
        maxWidth={false}
        sx={{ py: 4, px: { xs: 2, sm: 4, md: 6, lg: 8 } }}
      >
        <Box sx={{ maxWidth: '1400px', mx: 'auto' }}>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                sm: 'repeat(2, 1fr)',
                md: 'repeat(4, 1fr)'
              },
              gap: 4,
              textAlign: { xs: 'center', md: 'left' }
            }}
          >
          {/* Logo e Descrição */}
          <Box>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: { xs: 'center', md: 'flex-start' },
                gap: 1,
                mb: 1
              }}
            >
              <LayersIcon sx={{ color: '#1877F2', fontSize: '1.5rem' }} />
              <Typography
                variant='h6'
                sx={{ 
                  fontWeight: 700, 
                  color: '#212121',
                  fontSize: '1.125rem'
                }}
              >
                Planco
              </Typography>
            </Box>
            <Typography
              variant='body2'
              sx={{ 
                color: '#616161',
                fontSize: '0.875rem'
              }}
            >
              Gestão moderna e integrada para o setor público.
            </Typography>
          </Box>

          {/* Status do Sistema */}
          <Box>
            <Typography
              variant='caption'
              sx={{
                textTransform: 'uppercase',
                color: '#212121',
                display: 'block',
                fontWeight: 700,
                mb: 1,
                fontSize: '0.75rem'
              }}
            >
              STATUS DO SISTEMA
            </Typography>
            <Chip
              label='Online'
              size='small'
              sx={{
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                color: '#047857',
                border: '1px solid rgba(16, 185, 129, 0.2)',
                fontSize: '0.75rem',
                fontWeight: 700,
                height: 24,
                '& .MuiChip-icon': {
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  backgroundColor: '#10b981'
                }
              }}
              icon={
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    backgroundColor: '#10b981'
                  }}
                />
              }
            />
          </Box>

          {/* Links Úteis */}
          <Box>
            <Typography
              variant='caption'
              sx={{
                textTransform: 'uppercase',
                color: '#212121',
                mb: 1,
                display: 'block',
                fontWeight: 700,
                fontSize: '0.75rem'
              }}
            >
              LINKS ÚTEIS
            </Typography>
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: { xs: 'center', md: 'flex-start' },
                gap: 0.5
              }}
            >
              <Button
                variant='text'
                size='small'
                onClick={() => navigate(NAVIGATE_PATHS.PRIVACY_POLICY_PATH)}
                sx={{
                  justifyContent: { xs: 'center', md: 'flex-start' },
                  color: '#616161',
                  fontSize: '0.875rem',
                  minHeight: 'auto',
                  py: 0.25,
                  px: 0,
                  textTransform: 'uppercase',
                  fontWeight: 500,
                  '&:hover': {
                    color: '#1877F2',
                    backgroundColor: 'transparent'
                  }
                }}
              >
                POLÍTICA DE PRIVACIDADE
              </Button>
              <Button
                variant='text'
                size='small'
                onClick={() => navigate(NAVIGATE_PATHS.TERMS_OF_USE_PATH)}
                sx={{
                  justifyContent: { xs: 'center', md: 'flex-start' },
                  color: '#616161',
                  fontSize: '0.875rem',
                  minHeight: 'auto',
                  py: 0.25,
                  px: 0,
                  textTransform: 'uppercase',
                  fontWeight: 500,
                  '&:hover': {
                    color: '#1877F2',
                    backgroundColor: 'transparent'
                  }
                }}
              >
                TERMOS DE USO
              </Button>
              <Button
                variant='text'
                size='small'
                onClick={() => navigate(NAVIGATE_PATHS.SUPPORT_PATH)}
                sx={{
                  justifyContent: { xs: 'center', md: 'flex-start' },
                  color: '#616161',
                  fontSize: '0.875rem',
                  minHeight: 'auto',
                  py: 0.25,
                  px: 0,
                  textTransform: 'uppercase',
                  fontWeight: 500,
                  '&:hover': {
                    color: '#1877F2',
                    backgroundColor: 'transparent'
                  }
                }}
              >
                SUPORTE
              </Button>
            </Box>
          </Box>

          {/* Informações Técnicas */}
          <Box>
            <Typography
              variant='caption'
              sx={{
                textTransform: 'uppercase',
                color: '#212121',
                fontWeight: 700,
                display: 'block',
                mb: 1,
                fontSize: '0.75rem'
              }}
            >
              INFORMAÇÕES TÉCNICAS
            </Typography>
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: { xs: 'center', md: 'flex-start' },
                gap: 0.25
              }}
            >
              <Typography
                variant='body2'
                sx={{ 
                  color: '#616161',
                  fontSize: '0.875rem'
                }}
              >
                Versão: v{version}
              </Typography>
              <Typography
                variant='body2'
                sx={{ 
                  color: '#616161',
                  fontSize: '0.875rem'
                }}
              >
                Build: 20240521-A
              </Typography>
              <Typography
                variant='body2'
                sx={{ 
                  color: '#616161',
                  fontSize: '0.875rem'
                }}
              >
                Ambiente: Produção
              </Typography>
            </Box>
          </Box>
        </Box>
        </Box>
      </Container>

      <Box
        sx={{
          py: 2,
          textAlign: 'center',
          borderTop: '1px solid rgba(229, 231, 235, 1)'
        }}
      >
        <Container maxWidth={false} sx={{ px: { xs: 2, sm: 4, md: 6, lg: 8 } }}>
          <Box sx={{ maxWidth: '1400px', mx: 'auto' }}>
            <Typography
              variant='caption'
              sx={{ 
                color: '#616161',
                fontSize: '0.875rem'
              }}
            >
              ©2024 Planco - Feito com dedicação para a administração pública brasileira.
            </Typography>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export { Footer };
