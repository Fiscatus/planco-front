import { Box, Typography, useTheme } from '@mui/material';
import { useState } from 'react';
import CreateAccount from './components/CreateAccount';
import SignIn from './components/SignIn';
import GavelIcon from '@mui/icons-material/Gavel';

const Auth = () => {
  const [isSignIn, setIsSignIn] = useState(true);
  const theme = useTheme();

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
          minHeight: { lg: '80vh' },
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
            padding: { xs: 4, sm: 6, lg: 8 },
            backgroundColor: 'white'
        }}
      >
          <Box sx={{ width: '100%', maxWidth: '400px' }}>
          {isSignIn ? <SignIn setIsSignIn={setIsSignIn} /> : <CreateAccount setIsSignIn={setIsSignIn} />}
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
                 width: '140px',
                 height: '140px',
                 borderRadius: '50%',
                 backgroundColor: 'rgba(255, 255, 255, 0.1)',
                 backdropFilter: 'blur(15px)',
                 border: '3px solid rgba(255, 255, 255, 0.3)',
                 boxShadow: '0 12px 40px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
                 animation: 'logoFloat 4s ease-in-out infinite',
                 position: 'relative',
                 '&::before': {
                   content: '""',
                   position: 'absolute',
                   inset: '-4px',
                   borderRadius: '50%',
                   background: 'linear-gradient(45deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05))',
                   zIndex: -1,
                   animation: 'logoGlow 3s ease-in-out infinite alternate'
                 }
               }}
             >
               <GavelIcon
                 sx={{
                   fontSize: '4rem',
                   color: 'white',
                   textShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
                   filter: 'drop-shadow(0 0 8px rgba(255, 255, 255, 0.3))',
                   animation: 'iconPulse 2s ease-in-out infinite'
                 }}
               />
             </Box>

             {/* Título */}
             <Typography
               variant="h2"
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
               variant="h5"
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


          {/* Keyframes para animação */}
          <style>
            {`
              @keyframes logoFloat {
                0%, 100% {
                  transform: translateY(0px) scale(1);
                }
                50% {
                  transform: translateY(-8px) scale(1.02);
                }
              }
              
              @keyframes logoGlow {
                0% {
                  opacity: 0.3;
                  transform: scale(1);
                }
                100% {
                  opacity: 0.6;
                  transform: scale(1.05);
                }
              }
              
              @keyframes iconPulse {
                0%, 100% {
                  transform: scale(1);
                  filter: drop-shadow(0 0 8px rgba(255, 255, 255, 0.3));
                }
                50% {
                  transform: scale(1.05);
                  filter: drop-shadow(0 0 12px rgba(255, 255, 255, 0.5));
                }
              }
              
              @keyframes pulse {
                0%, 100% {
                  transform: scale(1);
                  opacity: 1;
                }
                50% {
                  transform: scale(1.05);
                  opacity: 0.7;
                }
              }
            `}
          </style>
        </Box>
      </Box>
    </Box>
  );
};

export default Auth;
