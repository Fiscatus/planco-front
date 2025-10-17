import { Home as HomeIcon, SearchOff as SearchOffIcon } from '@mui/icons-material';
import { Box, Button, Container, Stack, Typography, Link } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks';
import { useNavigate } from 'react-router-dom';

const NotFoundPage = () => {
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
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        bgcolor: hasOrganization ? 'transparent' : 'rgb(249, 250, 251)',
        py: 4,
        px: 2
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
         {/* Ícone de erro centralizado */}
         <Box
           sx={{
             display: 'flex',
             justifyContent: 'center',
             alignItems: 'center',
             mb: { xs: 2, md: 3 }
           }}
         >
           <SearchOffIcon
             sx={{
               fontSize: { xs: 100, md: 120 },
               color: '#1877F2',
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
             gap: { xs: 2, md: 3 },
             maxWidth: 600,
             width: '100%'
           }}
         >
           {/* Título 404 */}
           <Typography
             variant='h1'
             sx={{
               fontSize: { xs: '3.5rem', md: '5rem' },
               fontWeight: 800,
               color: '#1877F2',
               lineHeight: 0.9,
               letterSpacing: '-0.02em'
             }}
           >
             404
           </Typography>

           {/* Subtítulo */}
           <Typography
             variant='h2'
             sx={{
               fontSize: { xs: '1.25rem', md: '1.5rem' },
               fontWeight: 600,
               color: 'rgb(31, 41, 55)',
               lineHeight: 1.3,
               letterSpacing: '-0.01em'
             }}
           >
             Página não encontrada
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
               mb: { xs: 1, md: 2 }
             }}
           >
             Ops! A página que você está procurando não pode ser encontrada. Verifique o URL ou volte para a página inicial.
           </Typography>
         </Box>

         {/* Botão principal */}
         <Box
           sx={{
             display: 'flex',
             justifyContent: 'center',
             alignItems: 'center',
             mt: { xs: 2, md: 3 }
           }}
         >
           <Button
             variant='contained'
             onClick={handleGoHome}
             size='large'
             startIcon={<HomeIcon />}
             sx={{
               bgcolor: '#1877F2',
               color: '#ffffff',
               textTransform: 'none',
               fontSize: { xs: '0.95rem', md: '1rem' },
               fontWeight: 500,
               px: { xs: 3, md: 4 },
               py: { xs: 1.25, md: 1.5 },
               borderRadius: 2,
               boxShadow: 'none',
               minWidth: { xs: 200, md: 220 },
               '&:hover': {
                 bgcolor: '#166fe5',
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
             mt: { xs: 3, md: 4 },
             pt: { xs: 2, md: 3 },
             borderTop: '1px solid rgb(229, 231, 235)',
             width: '100%',
             maxWidth: 400
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
                 color: '#1877F2',
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

export default NotFoundPage;
