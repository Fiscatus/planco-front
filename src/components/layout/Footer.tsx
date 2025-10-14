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
        backgroundColor: alpha(theme.palette.grey[50], 0.5),
        borderTop: `1px solid ${alpha(theme.palette.grey[300], 0.7)}`,
        mt: 'auto',
        width: '100%',
        justifyItems: 'center',
        textAlign: 'center'
      }}
    >
      <Container
        maxWidth='lg'
        sx={{ px: { xs: 1.5, md: 2 }, py: { xs: 1, md: 1.5 } }}
      >
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, 1fr)',
              md: 'repeat(4, 1fr)'
            },
            gap: { xs: 1.5, md: 2 },
            justifyItems: 'center',
            textAlign: 'center'
          }}
        >
          <Box>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 0.5,
                mb: 0.5
              }}
            >
              <img
                src={logo}
                alt='Logo Planco'
                style={{ width: 32, height: 32 }}
              />
              <Typography
                variant='subtitle1'
                sx={{ fontWeight: 'semibold', color: theme.palette.grey[900] }}
              >
                Planco
              </Typography>
            </Box>
            <Typography
              variant='body2'
              sx={{ color: theme.palette.grey[600] }}
            >
              Gestão moderna e integrada para contratações públicas.
            </Typography>
          </Box>

          <Box>
            <Typography
              variant='caption'
              sx={{
                textTransform: 'uppercase',
                color: 'black',
                display: 'block',
                fontWeight: 'bold'
              }}
            >
              Status do sistema
            </Typography>
            <Chip
              label='Online'
              size='small'
              sx={{
                backgroundColor: alpha(theme.palette.success.main, 0.1),
                color: theme.palette.success.main,
                border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`,
                fontSize: '12px',
                height: 24,
                '& .MuiChip-icon': {
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  backgroundColor: theme.palette.success.main
                }
              }}
              icon={
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    backgroundColor: theme.palette.success.main
                  }}
                />
              }
            />
          </Box>

          <Box>
            <Typography
              variant='caption'
              sx={{
                textTransform: 'uppercase',
                color: 'black',
                mb: 0.5,
                display: 'block',
                fontWeight: 'bold'
              }}
            >
              Links úteis
            </Typography>
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center'
              }}
            >
              <Button
                variant='text'
                size='small'
                onClick={() => navigate(NAVIGATE_PATHS.PRIVACY_POLICY_PATH)}
                sx={{
                  justifyContent: 'center',
                  color: theme.palette.grey[700],
                  fontSize: '14px',
                  minHeight: 'auto',
                  py: 0.25,
                  '&:hover': {
                    color: theme.palette.primary.main
                  }
                }}
              >
                Política de Privacidade
              </Button>
              <Button
                variant='text'
                size='small'
                onClick={() => navigate(NAVIGATE_PATHS.TERMS_OF_USE_PATH)}
                sx={{
                  justifyContent: 'center',
                  color: theme.palette.grey[700],
                  fontSize: '14px',
                  minHeight: 'auto',
                  py: 0.25,
                  '&:hover': {
                    color: theme.palette.primary.main
                  }
                }}
              >
                Termos de Uso
              </Button>
              <Button
                variant='text'
                size='small'
                onClick={() => navigate(NAVIGATE_PATHS.SUPPORT_PATH)}
                sx={{
                  justifyContent: 'center',
                  color: theme.palette.grey[700],
                  fontSize: '14px',
                  minHeight: 'auto',
                  py: 0.25,
                  '&:hover': {
                    color: theme.palette.primary.main
                  }
                }}
              >
                Suporte
              </Button>
            </Box>
          </Box>

          <Box>
            <Typography
              variant='caption'
              sx={{
                textTransform: 'uppercase',
                color: 'black',
                fontWeight: 'bold',
                display: 'block'
              }}
            >
              Informações técnicas
            </Typography>
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center'
              }}
            >
              <Typography
                variant='body2'
                sx={{ color: theme.palette.grey[700] }}
              >
                Versão: V{version}
              </Typography>
              <Typography
                variant='body2'
                sx={{ color: theme.palette.grey[700] }}
              >
                Ano: 2025
              </Typography>
              <Typography
                variant='body2'
                sx={{ color: theme.palette.grey[700] }}
              >
                Ambiente: Produção
              </Typography>
            </Box>
          </Box>
        </Box>
      </Container>

      <Box
        sx={{
          py: 0.5,
          textAlign: 'center',
          borderTop: `1px solid ${alpha(theme.palette.grey[300], 0.5)}`
        }}
      >
        <Typography
          variant='caption'
          sx={{ color: theme.palette.grey[600] }}
        >
          © 2025 Planco — Feito com dedicação para a administração pública brasileira
        </Typography>
      </Box>
    </Box>
  );
};

export { Footer };
