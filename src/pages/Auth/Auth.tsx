import { Box, Typography, useTheme } from '@mui/material';
import { useState } from 'react';
import CreateAccount from './components/CreateAccount';
import RegistrationSuccess from './components/RegistrationSuccess';
import SignIn from './components/SignIn';

const Auth = () => {
  const [isSignIn, setIsSignIn] = useState(true);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');
  const _theme = useTheme();

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #F8F9FA 0%, #E9ECEF 100%)',
        padding: { xs: 2, sm: 3 }
      }}
    >
      <Box
        sx={{
          maxWidth: '1200px',
          width: '100%',
          minHeight: { lg: '90vh' },
          borderRadius: { xs: 2, sm: 3 },
          overflow: 'hidden',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.1)',
          backgroundColor: 'white',
          display: 'flex',
          flexDirection: { xs: 'column', lg: 'row' }
        }}
      >
        {/* Seção do Formulário */}
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: { xs: 3, sm: 4, lg: 6 },
            backgroundColor: 'white'
          }}
        >
          <Box sx={{ width: '100%', maxWidth: '400px' }}>
            {registrationSuccess ? (
              <RegistrationSuccess
                email={registeredEmail}
                setIsSignIn={setIsSignIn}
                setRegistrationSuccess={setRegistrationSuccess}
              />
            ) : isSignIn ? (
              <SignIn setIsSignIn={setIsSignIn} />
            ) : (
              <CreateAccount
                setIsSignIn={setIsSignIn}
                setRegistrationSuccess={setRegistrationSuccess}
                setRegisteredEmail={setRegisteredEmail}
              />
            )}
          </Box>
        </Box>

        {/* Seção Lateral com Branding */}
        <Box
          sx={{
            flex: 1,
            display: { xs: 'none', lg: 'flex' },
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #1877F2 0%, #42A5F5 100%)',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          {/* Conteúdo principal centralizado */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              width: '100%',
              padding: 4,
              gap: 4,
              position: 'relative',
              zIndex: 2
            }}
          >
            {/* Logo centralizada */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 3
              }}
            >
              <img
                src='/assets/isologo.svg'
                alt='Planco Logo'
                style={{
                  width: '120px',
                  height: '120px',
                  objectFit: 'contain'
                }}
              />
            </Box>

            {/* Título */}
            <Typography
              variant='h2'
              sx={{
                fontWeight: 700,
                color: 'white',
                textAlign: 'center',
                lineHeight: 1.1,
                fontSize: { lg: '3rem', xl: '3.5rem' },
                maxWidth: '500px',
                textShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
                marginBottom: 2
              }}
            >
              Planco
            </Typography>

            {/* Descrição */}
            <Typography
              variant='h5'
              sx={{
                color: 'rgba(255, 255, 255, 0.9)',
                textAlign: 'center',
                lineHeight: 1.5,
                fontSize: { lg: '1.25rem', xl: '1.375rem' },
                maxWidth: '520px',
                fontWeight: 400,
                textShadow: '0 1px 4px rgba(0, 0, 0, 0.2)'
              }}
            >
              A plataforma inteligente que conecta todas as fases da licitação pública.
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default Auth;
