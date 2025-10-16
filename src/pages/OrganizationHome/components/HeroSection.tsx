import { 
  Widgets as WidgetsIcon,
  PlayCircle as PlayCircleIcon
} from '@mui/icons-material';
import { Box, Button, Container, Stack, Typography } from '@mui/material';
import { useEffect, useState } from 'react';

type Props = {
  firstName: string;
  onPrimaryClick: () => void;
  onSecondaryClick: () => void;
};

const HeroSection = ({ firstName, onPrimaryClick, onSecondaryClick }: Props) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <Box
      component='section'
      sx={{
        py: { xs: 0.5, md: 2 }, // 4px/16px - reduzindo distância da topbar
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: { xs: 'auto', md: 'clamp(260px, 40vh, 380px)' },
        '@media (max-width: 767px)': {
          py: 0.25, // 2px para mobile - ainda mais próximo da topbar
          minHeight: 'auto'
        }
      }}
    >
      <Container maxWidth={false} sx={{ 
        px: { xs: 2, sm: 4, md: 6, lg: 8 },
        '@media (max-width: 767px)': {
          px: 1.5 // 12px para mobile
        }
      }}>
        <Box
          sx={{
            maxWidth: '1200px',
            mx: 'auto',
            background: 'linear-gradient(135deg, rgba(248, 250, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)',
            bgcolor: 'background.paper',
            borderRadius: { xs: 2, md: 3 },
            boxShadow: '0 8px 25px -5px rgba(0, 0, 0, 0.08), 0 4px 6px -2px rgba(0, 0, 0, 0.04)',
            border: '1px solid',
            borderColor: 'divider',
            overflow: 'hidden',
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '1.22fr 1fr' }, // 55/45 ratio
            gridTemplateRows: { xs: 'auto auto', md: '1fr' }, // Em mobile: texto acima, imagem abaixo
            alignItems: 'stretch',
            minHeight: { xs: 'auto', md: 'clamp(260px, 40vh, 380px)' },
            '@media (max-width: 767px)': {
              borderRadius: 1.5, // 12px para mobile
              boxShadow: '0 4px 12px -2px rgba(0, 0, 0, 0.06), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
              gap: 2 // 16px entre texto e imagem no mobile
            }
          }}
        >
          {/* Conteúdo de texto */}
          <Box sx={{ 
            p: { xs: 3, md: 4 }, // 24px/32px - baseline 8px
            '@media (max-width: 767px)': {
              p: 2 // 16px para mobile
            },
            textAlign: { xs: 'center', md: 'left' },
            display: 'flex',
            alignItems: 'center',
            justifyContent: { xs: 'center', md: 'flex-start' }
          }}>
            <Box sx={{ 
              maxWidth: '62ch', // Largura controlada para leitura confortável
              width: '100%'
            }}>
              {/* Headline Stack - Duas linhas controladas */}
              <Box
                sx={{
                  opacity: isVisible ? 1 : 0,
                  transform: isVisible ? 'translateY(0)' : 'translateY(8px)',
                  transition: 'opacity 350ms cubic-bezier(0.4, 0, 0.2, 1), transform 350ms cubic-bezier(0.4, 0, 0.2, 1)',
                  mb: { xs: 2.5, md: 3 } // Espaçamento profissional entre headline e descrição
                }}
              >
                <Typography
                  variant='h1'
                  fontWeight={600}
                  lineHeight={1.08}
                  sx={{
                    fontSize: { xs: '2rem', sm: '2.75rem', md: '3.25rem', lg: '3.75rem' }, // Tamanhos profissionais e escalonados
                    '@media (max-width: 767px)': {
                      fontSize: '1.75rem' // 28px para mobile
                    },
                    color: 'text.primary',
                    letterSpacing: { xs: '-0.015em', md: '-0.025em' }, // Letter-spacing refinado
                    display: 'block',
                    mb: 0,
                    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif' // Fonte profissional
                  }}
                >
                  Bem-vindo,
                </Typography>
                <Typography
                  variant='h1'
                  fontWeight={700}
                  lineHeight={1.08}
                  sx={{
                    fontSize: { xs: '2rem', sm: '2.75rem', md: '3.25rem', lg: '3.75rem' },
                    '@media (max-width: 767px)': {
                      fontSize: '1.75rem' // 28px para mobile
                    },
                    color: 'primary.main',
                    letterSpacing: { xs: '-0.015em', md: '-0.025em' },
                    display: 'block',
                    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif'
                  }}
                >
                  {firstName}
                </Typography>
              </Box>
              
              <Typography
                variant='body1'
                sx={{
                  color: 'text.secondary',
                  fontSize: { xs: '1.0625rem', md: '1.1875rem' }, // 17px/19px - tamanhos profissionais
                  '@media (max-width: 767px)': {
                    fontSize: '1rem' // 16px para mobile
                  },
                  lineHeight: 1.6, // Line-height otimizado para leitura
                  fontWeight: 400,
                  maxWidth: '52ch', // Largura ideal para leitura
                  mx: { xs: 'auto', md: 0 },
                  mb: { xs: 3.5, md: 4 }, // Espaçamento generoso antes dos botões
                  opacity: isVisible ? 1 : 0,
                  transition: 'opacity 300ms cubic-bezier(0.4, 0, 0.2, 1)',
                  transitionDelay: '80ms',
                  fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif'
                }}
              >
                A sua plataforma inteligente para conectar todas as fases da licitação pública com agilidade, transparência e&nbsp;eficiência.
              </Typography>
              
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={{ xs: 2, sm: 2.5 }} // Espaçamento profissional entre botões
                sx={{ 
                  '@media (max-width: 767px)': {
                    '& > * + *': {
                      mt: 1.5 // 12px entre botões no mobile
                    },
                    width: '100%'
                  },
                  justifyContent: { xs: 'center', md: 'flex-start' },
                  opacity: isVisible ? 1 : 0,
                  transform: isVisible ? 'scale(1)' : 'scale(1.02)',
                  transition: 'opacity 260ms cubic-bezier(0.4, 0, 0.2, 1), transform 260ms cubic-bezier(0.4, 0, 0.2, 1)',
                  transitionDelay: '140ms'
                }}
              >
                <Button
                  variant='contained'
                  onClick={onPrimaryClick}
                  size='large'
                  startIcon={<WidgetsIcon />}
                  aria-label="Explorar módulos da plataforma"
                  sx={{
                    bgcolor: '#1877F2',
                    color: 'white',
                    fontWeight: 600,
                    fontSize: '1rem',
                    py: 1.5,
                    px: 3.5,
                    borderRadius: 2,
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
                    '&:hover': { 
                      bgcolor: '#166fe5',
                      boxShadow: '0 8px 15px -3px rgba(0, 0, 0, 0.15), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
                      transform: 'translateY(-1px)'
                    },
                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                    minWidth: { xs: '100%', sm: 'auto' },
                    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
                    '@media (max-width: 767px)': {
                      py: 1.25, // 10px para mobile
                      px: 2.5, // 20px para mobile
                      fontSize: '0.9375rem' // 15px para mobile
                    }
                  }}
                >
                  Explorar Módulos
                </Button>
                
                <Button
                  variant='outlined'
                  onClick={onSecondaryClick}
                  size='large'
                  startIcon={<PlayCircleIcon />}
                  aria-label="Assistir guia rápido de uso"
                  sx={{
                    color: 'text.primary',
                    borderColor: 'rgba(0, 0, 0, 0.12)',
                    bgcolor: 'rgba(0, 0, 0, 0.02)',
                    fontWeight: 600,
                    fontSize: '1rem',
                    py: 1.5,
                    px: 3.5,
                    borderRadius: 2,
                    '&:hover': {
                      borderColor: 'rgba(0, 0, 0, 0.2)',
                      bgcolor: 'rgba(0, 0, 0, 0.04)',
                      transform: 'translateY(-1px)'
                    },
                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                    minWidth: { xs: '100%', sm: 'auto' },
                    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
                    '@media (max-width: 767px)': {
                      py: 1.25, // 10px para mobile
                      px: 2.5, // 20px para mobile
                      fontSize: '0.9375rem' // 15px para mobile
                    }
                  }}
                >
                  Assistir Guia Rápido
                </Button>
              </Stack>
            </Box>
          </Box>

          {/* Imagem */}
          <Box sx={{ 
            display: 'flex', // Mostrar em todas as telas
            alignItems: 'center',
            justifyContent: 'center',
            p: { xs: 2, md: 4 }, // 16px/32px - padding menor para mobile
            '@media (max-width: 767px)': {
              p: 1.5 // 12px para mobile
            }
          }}>
            <Box
              component='img'
              alt='Uma mulher e um homem trabalhando juntos em um escritório moderno, colaborando em um projeto em um laptop. A imagem é profissional e transmite uma sensação de produtividade e trabalho em equipe.'
              src='https://lh3.googleusercontent.com/aida-public/AB6AXuAJWGTRTdKCw9Rbx73UpfjVtc88nTz9GADQgT9fJdvY8TYk9J3XZQbBNvZ6O1y2YvJbtq4kfd3xzh-BbCRdhA6fZ5cRyoI6yOpa1AzhDGJmIbtsiyVmCB7KgF5-B8lhp6tMFtpFggYl6zm9_P2iP6PIE2MFCfGjVoXsedZaWAXyqW7Oe7hkhfkYvD8DPKfvma-aQNVDoBvfhvQ6pYxBtSku8SLPwd0Kbs8fKUl638fYOYigs8L7rAC9i62ELy9CbG4Ius9VllRRzfs'
              sx={{
                width: '100%',
                height: '100%',
                maxHeight: '100%',
                objectFit: 'cover',
                objectPosition: 'center',
                borderRadius: 2, // Mesmo raio visual do card
                display: 'block',
                '@media (max-width: 767px)': {
                  height: 'auto', // Altura automática para mobile
                  maxHeight: 'none',
                  objectFit: 'contain', // Mostra a imagem completa no mobile
                  borderRadius: 1.5 // 12px para mobile
                }
              }}
            />
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export { HeroSection };
