import { Block as BlockIcon, Home as HomeIcon } from '@mui/icons-material';
import { Box, Button, Container, Stack, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks';

const NotAccessPage = () => {
  const navigate = useNavigate();
  const { user, hasOrganization } = useAuth();

  const isLoggedInWithoutOrg = user && !hasOrganization;

  const handleGoHome = () => {
    if (hasOrganization) {
      navigate('/');
      return;
    }

    if (isLoggedInWithoutOrg) {
      navigate('/invites');
      return;
    }

    navigate('/auth');
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <Box
      component='section'
      sx={{
        py: { xs: 6, md: 8 },
        px: { xs: 4, md: 6 },
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: hasOrganization ? '60vh' : '100vh',
        bgcolor: hasOrganization ? 'transparent' : 'rgb(245, 245, 245)'
      }}
    >
      <Container maxWidth='md'>
        <Box
          sx={{
            textAlign: 'center',
            position: 'relative'
          }}
        >
          <Box
            aria-hidden
            sx={{
              position: 'absolute',
              inset: 0,
              mx: 'auto',
              width: { xs: '80%', md: '60%' },
              height: { xs: 200, md: 300 },
              top: { xs: -50, md: -80 },
              borderRadius: 4,
              filter: 'blur(40px)',
              opacity: 0.3,
              background: 'radial-gradient(60% 60% at 50% 40%, rgb(137, 78, 238) 0%, transparent 70%)'
            }}
          />

          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              mb: 3,
              position: 'relative'
            }}
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 120,
                height: 120,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, rgb(252, 239, 255), rgb(248, 238, 255))',
                border: '2px solid rgb(236, 183, 250)',
                boxShadow: 3
              }}
            >
              <BlockIcon
                sx={{
                  fontSize: 60,
                  color: 'rgb(137, 78, 238)'
                }}
              />
            </Box>
          </Box>

          <Stack
            spacing={3}
            sx={{ position: 'relative' }}
          >
            <Box>
              <Typography
                variant='h3'
                sx={{
                  fontSize: { xs: 24, md: 32 },
                  fontWeight: 600,
                  color: '#111827',
                  mb: 2
                }}
              >
                Sem acesso a esse recurso
              </Typography>
              <Typography
                variant='body1'
                sx={{
                  fontSize: { xs: 16, md: 18 },
                  color: '#6b7280',
                  maxWidth: 500,
                  mx: 'auto',
                  lineHeight: 1.6
                }}
              >
                Ops! Você não tem acesso a esse recurso.{' '}
                {hasOrganization
                  ? 'Que tal voltar para o início e explorar nossos módulos?'
                  : 'Que tal fazer login para acessar nossa plataforma?'}
              </Typography>
            </Box>

            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={2}
              sx={{
                justifyContent: 'center',
                mt: 4
              }}
            >
              <Button
                variant='contained'
                onClick={handleGoHome}
                size='large'
                startIcon={<HomeIcon />}
                sx={{
                  bgcolor: 'rgb(137, 78, 238)',
                  color: '#ffffff',
                  textTransform: 'none',
                  fontSize: 16,
                  fontWeight: 600,
                  px: 4,
                  py: 1.5,
                  borderRadius: 2,
                  boxShadow: 2,
                  '&:hover': {
                    bgcolor: 'rgb(120, 60, 220)',
                    boxShadow: 4
                  }
                }}
              >
                {hasOrganization ? 'Voltar ao Início' : isLoggedInWithoutOrg ? 'Ver Convites' : 'Fazer Login'}
              </Button>
              <Button
                variant='outlined'
                onClick={handleGoBack}
                size='large'
                sx={{
                  color: '#374151',
                  borderColor: '#d1d5db',
                  textTransform: 'none',
                  fontSize: 16,
                  fontWeight: 600,
                  px: 4,
                  py: 1.5,
                  borderRadius: 2,
                  '&:hover': {
                    borderColor: '#9ca3af',
                    bgcolor: 'rgba(0,0,0,0.04)'
                  }
                }}
              >
                Voltar
              </Button>
            </Stack>

            <Typography
              variant='body2'
              sx={{
                color: '#9ca3af',
                fontSize: 14,
                mt: 3
              }}
            >
              Se você acredita que isso é um erro, entre em contato com nosso suporte.
            </Typography>
          </Stack>
        </Box>
      </Container>
    </Box>
  );
};

export default NotAccessPage;
