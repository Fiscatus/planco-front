import { Block as BlockIcon, Home as HomeIcon } from '@mui/icons-material';
import { Box, Button, Link, Typography } from '@mui/material';
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

  const _handleGoBack = () => {
    navigate(-1);
  };

  return (
    <Box
      component='section'
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        bgcolor: hasOrganization ? 'transparent' : 'rgb(249, 250, 251)',
        py: 4,
        px: 2,
        mt: 2
      }}
    >
      <Box
        sx={{
          textAlign: 'center',
          maxWidth: 'lg',
          mx: 'auto',
          p: { xs: 3, md: 6 },
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: { xs: 3, md: 4 }
        }}
      >
        {/* Ícone de bloqueio centralizado */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            mb: { xs: 2, md: 3 }
          }}
        >
          <BlockIcon
            sx={{
              fontSize: { xs: 100, md: 120 },
              color: 'primary.main',
              opacity: 0.8
            }}
          />
        </Box>

        {/* Container do conteúdo principal */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: { xs: 1.5, md: 2 },
            maxWidth: 600,
            width: '100%',
            textAlign: 'center'
          }}
        >
          {/* Título principal */}
          <Typography
            variant='h1'
            sx={{
              fontSize: { xs: '2.5rem', md: '3rem' },
              fontWeight: 800,
              color: 'primary.main',
              lineHeight: 1.1,
              letterSpacing: '-0.02em',
              mb: { xs: 0.5, md: 1 }
            }}
          >
            Acesso Negado
          </Typography>

          {/* Subtítulo */}
          <Typography
            variant='h2'
            sx={{
              fontSize: { xs: '1.25rem', md: '1.5rem' },
              fontWeight: 600,
              color: 'rgb(31, 41, 55)',
              lineHeight: 1.2,
              letterSpacing: '-0.01em',
              mb: { xs: 1.5, md: 2 }
            }}
          >
            Sem acesso a esse recurso
          </Typography>

          {/* Descrição */}
          <Typography
            variant='body1'
            sx={{
              color: 'rgb(107, 114, 128)',
              fontSize: { xs: '0.95rem', md: '1rem' },
              lineHeight: 1.6,
              maxWidth: 480,
              textAlign: 'center',
              mx: 'auto',
              px: { xs: 1, md: 0 }
            }}
          >
            Ops! Você não tem acesso a esse recurso. Verifique suas permissões ou entre em contato com o administrador.
          </Typography>
        </Box>

        {/* Botão principal */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            mt: { xs: 3, md: 4 },
            width: '100%'
          }}
        >
          <Button
            variant='contained'
            onClick={handleGoHome}
            size='large'
            startIcon={<HomeIcon />}
            sx={{
              bgcolor: 'primary.main',
              color: 'common.white',
              textTransform: 'none',
              fontSize: { xs: '0.95rem', md: '1rem' },
              fontWeight: 500,
              px: { xs: 3, md: 4 },
              py: { xs: 1.25, md: 1.5 },
              borderRadius: 2,
              boxShadow: 'none',
              minWidth: { xs: 200, md: 220 },
              '&:hover': {
                bgcolor: 'primary.dark',
                boxShadow: '0 4px 12px rgba(24, 119, 242, 0.3)'
              },
              '&:focus': {
                outline: 'none',
                boxShadow: '0 0 0 2px rgba(24, 119, 242, 0.2)'
              }
            }}
          >
            {hasOrganization ? 'Voltar para a Página Inicial' : isLoggedInWithoutOrg ? 'Ver Convites' : 'Fazer Login'}
          </Button>
        </Box>

        {/* Link de suporte */}
        <Box
          sx={{
            mt: { xs: 4, md: 5 },
            width: '100%',
            maxWidth: 400,
            textAlign: 'center'
          }}
        >
          <Typography
            variant='body2'
            sx={{
              color: 'rgb(107, 114, 128)',
              fontSize: { xs: '0.8rem', md: '0.875rem' },
              lineHeight: 1.5
            }}
          >
            Se você acha que isso é um erro, por favor, entre em contato com nosso{' '}
            <Link
              href='#'
              sx={{
                color: 'primary.main',
                textDecoration: 'none',
                fontWeight: 500,
                '&:hover': {
                  textDecoration: 'underline'
                }
              }}
            >
              suporte
            </Link>
            .
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default NotAccessPage;
