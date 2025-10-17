import { 
  Security as SecurityIcon,
  Help as HelpIcon,
  Info as InfoIcon,
  Build as BuildIcon,
  CheckCircle as CheckCircleIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Instagram as InstagramIcon,
  LinkedIn as LinkedInIcon
} from '@mui/icons-material';
import { Box, Button, Chip, Container, Typography, alpha, useTheme } from '@mui/material';

import logo from '/assets/isologo.svg';
import { useNavigate } from 'react-router-dom';
import { version } from '@/../package.json';

const NAVIGATE_PATHS = {
  PRIVACY_POLICY_PATH: '/politica-privacidade',
  TERMS_OF_USE_PATH: '/termos-de-uso',
  SUPPORT_PATH: '/suporte',
  ABOUT_SYSTEM_PATH: '/historia'
};

const Footer = () => {
  const theme = useTheme();
  const navigate = useNavigate();

  return (
    <Box
      component='footer'
      sx={{
        backgroundColor: '#fafbfc',
        borderTop: '2px solid #e3f2fd',
        mt: 4,
        width: '100%',
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '1px',
          background: 'linear-gradient(90deg, transparent 0%, #e3f2fd 20%, #e3f2fd 80%, transparent 100%)',
        }
      }}
    >
      <Container
        maxWidth={false}
        sx={{ py: { xs: 2, md: 3 }, px: { xs: 3, sm: 4, md: 6, lg: 8 } }}
      >
        <Box sx={{ maxWidth: '1400px', mx: 'auto' }}>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                lg: 'repeat(12, 1fr)'
              },
              gap: { xs: 3, lg: 4 },
              textAlign: { xs: 'center', lg: 'left' },
              alignItems: 'start'
            }}
          >
          {/* Logo e Descrição - Ocupa 4 colunas */}
          <Box sx={{ 
            gridColumn: { xs: '1', lg: '1 / 5' },
            mb: { xs: 2, lg: 0 },
            display: 'flex',
            flexDirection: 'column',
            height: '100%'
          }}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: { xs: 'center', lg: 'flex-start' },
                gap: 1.5,
                mb: 1.5
              }}
            >
              <img 
                src={logo} 
                alt="Planco Logo" 
                style={{ 
                  width: '32px', 
                  height: '32px',
                  objectFit: 'contain'
                }} 
              />
              <Typography
                variant='h4'
                sx={{ 
                  fontWeight: 700, 
                  color: '#1F2937',
                  fontSize: '1.5rem',
                  letterSpacing: '-0.02em',
                  lineHeight: 1.2,
                  '@media (max-width: 767px)': {
                    fontSize: '1.25rem' // 20px para mobile
                  }
                }}
              >
                Planco
              </Typography>
            </Box>
            <Typography
              variant='body2'
              sx={{ 
                color: '#6B7280',
                fontSize: '0.8rem',
                lineHeight: 1.6,
                mb: 1.5,
                textAlign: { xs: 'center', lg: 'left' },
                '@media (max-width: 767px)': {
                  fontSize: '0.75rem' // 12px para mobile
                }
              }}
            >
              Tecnologia que impulsiona o planejamento público eficiente.
            </Typography>
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 1,
              justifyContent: { xs: 'center', lg: 'flex-start' }
            }}>
              <CheckCircleIcon sx={{ 
                color: '#10B981', 
                fontSize: '1.25rem',
                '@media (max-width: 767px)': {
                  fontSize: '1.125rem' // 18px para mobile
                }
              }} />
              <Typography
                variant='body2'
                sx={{ 
                  color: '#059669',
                  fontSize: '0.8rem',
                  fontWeight: 500,
                  lineHeight: 1.4,
                  '@media (max-width: 767px)': {
                    fontSize: '0.75rem' // 12px para mobile
                  }
                }}
              >
                Todos os sistemas operacionais.
              </Typography>
            </Box>
          </Box>

          {/* Links Úteis - Ocupa 8 colunas (6-13) */}
          <Box sx={{ 
            gridColumn: { xs: '1', lg: '6 / 13' },
            mb: { xs: 2, lg: 0 },
            display: 'flex',
            flexDirection: 'column',
            height: '100%'
          }}>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: {
                  xs: '1fr',
                  sm: 'repeat(2, 1fr)',
                  md: 'repeat(3, 1fr)'
                },
                gap: { xs: 4, sm: 3, md: 4 },
                '@media (max-width: 767px)': {
                  gap: 3 // 24px para mobile
                }
              }}
            >
              {/* Links Úteis */}
              <Box>
                <Typography
                  variant='caption'
                  sx={{
                    textTransform: 'uppercase',
                    color: '#1F2937',
                    fontWeight: 600,
                    fontSize: '0.8rem',
                    letterSpacing: '0.05em',
                    mb: 1,
                    lineHeight: 1.2,
                    minHeight: '1.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: { xs: 'center', md: 'flex-start' },
                    '@media (max-width: 767px)': {
                      fontSize: '0.75rem', // 12px para mobile
                      mb: 1.5 // 12px para mobile
                    }
                  }}
                >
                  Links Úteis
                </Typography>
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 1,
                    '@media (max-width: 767px)': {
                      gap: 0.75 // 6px para mobile
                    }
                  }}
                >
                  <Button
                    variant='text'
                    size='small'
                    onClick={() => navigate(NAVIGATE_PATHS.PRIVACY_POLICY_PATH)}
                    sx={{
                      justifyContent: { xs: 'center', lg: 'flex-start' },
                      color: '#6B7280',
                      fontSize: '0.8rem',
                      minHeight: 'auto',
                      py: 0.5,
                      px: 0,
                      textTransform: 'none',
                      fontWeight: 400,
                      '&:hover': {
                        color: '#3B82F6',
                        backgroundColor: 'transparent'
                      },
                      '@media (max-width: 767px)': {
                        fontSize: '0.75rem', // 12px para mobile
                        py: 0.25 // 2px para mobile
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
                      justifyContent: { xs: 'center', lg: 'flex-start' },
                      color: '#6B7280',
                      fontSize: '0.8rem',
                      minHeight: 'auto',
                      py: 0.5,
                      px: 0,
                      textTransform: 'none',
                      fontWeight: 400,
                      '&:hover': {
                        color: '#3B82F6',
                        backgroundColor: 'transparent'
                      },
                      '@media (max-width: 767px)': {
                        fontSize: '0.75rem', // 12px para mobile
                        py: 0.25 // 2px para mobile
                      }
                    }}
                  >
                    Termos de Uso
                  </Button>
                  <Button
                    variant='text'
                    size='small'
                    onClick={() => navigate(NAVIGATE_PATHS.ABOUT_SYSTEM_PATH)}
                    sx={{
                      justifyContent: { xs: 'center', lg: 'flex-start' },
                      color: '#6B7280',
                      fontSize: '0.8rem',
                      minHeight: 'auto',
                      py: 0.5,
                      px: 0,
                      textTransform: 'none',
                      fontWeight: 400,
                      '&:hover': {
                        color: '#3B82F6',
                        backgroundColor: 'transparent'
                      },
                      '@media (max-width: 767px)': {
                        fontSize: '0.75rem', // 12px para mobile
                        py: 0.25 // 2px para mobile
                      }
                    }}
                  >
                    Sobre o Sistema
                  </Button>
                </Box>
              </Box>

              {/* Suporte */}
              <Box>
                <Typography
                  variant='caption'
                  sx={{
                    textTransform: 'uppercase',
                    color: '#1F2937',
                    fontWeight: 600,
                    fontSize: '0.8rem',
                    letterSpacing: '0.05em',
                    mb: 1,
                    lineHeight: 1.2,
                    minHeight: '1.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: { xs: 'center', md: 'flex-start' },
                    '@media (max-width: 767px)': {
                      fontSize: '0.75rem', // 12px para mobile
                      mb: 1.5 // 12px para mobile
                    }
                  }}
                >
                  Suporte
                </Typography>
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 1
                  }}
                >
                  <Button
                    variant='text'
                    size='small'
                    onClick={() => navigate(NAVIGATE_PATHS.SUPPORT_PATH)}
                    sx={{
                      justifyContent: { xs: 'center', lg: 'flex-start' },
                      color: '#6B7280',
                      fontSize: '0.8rem',
                      minHeight: 'auto',
                      py: 0.5,
                      px: 0,
                      textTransform: 'none',
                      fontWeight: 400,
                      '&:hover': {
                        color: '#3B82F6',
                        backgroundColor: 'transparent'
                      },
                      '@media (max-width: 767px)': {
                        fontSize: '0.75rem', // 12px para mobile
                        py: 0.25 // 2px para mobile
                      }
                    }}
                  >
                    Central de Ajuda
                  </Button>
                  <Button
                    variant='text'
                    size='small'
                    sx={{
                      justifyContent: { xs: 'center', lg: 'flex-start' },
                      color: '#6B7280',
                      fontSize: '0.8rem',
                      minHeight: 'auto',
                      py: 0.5,
                      px: 0,
                      textTransform: 'none',
                      fontWeight: 400,
                      '&:hover': {
                        color: '#3B82F6',
                        backgroundColor: 'transparent'
                      },
                      '@media (max-width: 767px)': {
                        fontSize: '0.75rem', // 12px para mobile
                        py: 0.25 // 2px para mobile
                      }
                    }}
                  >
                    Tutoriais Interativos
                  </Button>
                  <Button
                    variant='text'
                    size='small'
                    sx={{
                      justifyContent: { xs: 'center', lg: 'flex-start' },
                      color: '#6B7280',
                      fontSize: '0.8rem',
                      minHeight: 'auto',
                      py: 0.5,
                      px: 0,
                      textTransform: 'none',
                      fontWeight: 400,
                      '&:hover': {
                        color: '#3B82F6',
                        backgroundColor: 'transparent'
                      },
                      '@media (max-width: 767px)': {
                        fontSize: '0.75rem', // 12px para mobile
                        py: 0.25 // 2px para mobile
                      }
                    }}
                  >
                    Enviar Feedback
                  </Button>
                </Box>
              </Box>

              {/* Contato */}
              <Box>
                <Typography
                  variant='caption'
                  sx={{
                    textTransform: 'uppercase',
                    color: '#1F2937',
                    fontWeight: 600,
                    fontSize: '0.8rem',
                    letterSpacing: '0.05em',
                    mb: 1,
                    lineHeight: 1.2,
                    minHeight: '1.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: { xs: 'center', md: 'flex-start' },
                    '@media (max-width: 767px)': {
                      fontSize: '0.75rem', // 12px para mobile
                      mb: 1.5 // 12px para mobile
                    }
                  }}
                >
                  Contato
                </Typography>
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 1
                  }}
                >
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 0.75,
                    justifyContent: { xs: 'center', lg: 'flex-start' }
                  }}>
                    <EmailIcon sx={{ 
                      color: '#6B7280', 
                      fontSize: '1.125rem',
                      '@media (max-width: 767px)': {
                        fontSize: '1rem' // 16px para mobile
                      }
                    }} />
                    <Button
                      component="a"
                      href="mailto:contato@planco.com.br"
                      variant='text'
                      size='small'
                      sx={{
                        justifyContent: { xs: 'center', lg: 'flex-start' },
                        color: '#6B7280',
                        fontSize: '0.8rem',
                        minHeight: 'auto',
                        py: 0.5,
                        px: 0,
                        textTransform: 'none',
                        fontWeight: 400,
                        lineHeight: 1.4,
                        transition: 'all 0.2s ease-in-out',
                        '&:hover': {
                          color: '#3B82F6',
                          backgroundColor: 'transparent',
                          transform: 'translateY(-1px)'
                        }
                      }}
                    >
                      contato@planco.com.br
                    </Button>
                  </Box>
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 0.75,
                    justifyContent: { xs: 'center', lg: 'flex-start' }
                  }}>
                    <PhoneIcon sx={{ 
                      color: '#6B7280', 
                      fontSize: '1.125rem',
                      '@media (max-width: 767px)': {
                        fontSize: '1rem' // 16px para mobile
                      }
                    }} />
                    <Button
                      component="a"
                      href="tel:+5511999999999"
                      variant='text'
                      size='small'
                      sx={{
                        justifyContent: { xs: 'center', lg: 'flex-start' },
                        color: '#6B7280',
                        fontSize: '0.8rem',
                        minHeight: 'auto',
                        py: 0.5,
                        px: 0,
                        textTransform: 'none',
                        fontWeight: 400,
                        lineHeight: 1.4,
                        transition: 'all 0.2s ease-in-out',
                        '&:hover': {
                          color: '#3B82F6',
                          backgroundColor: 'transparent',
                          transform: 'translateY(-1px)'
                        }
                      }}
                    >
                      (11) 99999-9999
                    </Button>
                  </Box>
                  
                  {/* Redes Sociais */}
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 0.75,
                    justifyContent: { xs: 'center', lg: 'flex-start' },
                    mt: 1
                  }}>
                    <Button
                      component="a"
                      href="https://instagram.com/planco"
                      target="_blank"
                      rel="noopener noreferrer"
                      variant='text'
                      size='small'
                      sx={{
                        color: '#6B7280',
                        minWidth: 'auto',
                        p: 0.5,
                        transition: 'all 0.2s ease-in-out',
                        '&:hover': {
                          color: '#3B82F6',
                          backgroundColor: 'transparent',
                          transform: 'scale(1.1)'
                        }
                      }}
                    >
                      <InstagramIcon sx={{ 
                        fontSize: '1.25rem',
                        '@media (max-width: 767px)': {
                          fontSize: '1.125rem' // 18px para mobile
                        }
                      }} />
                    </Button>
                    <Button
                      component="a"
                      href="https://linkedin.com/company/planco"
                      target="_blank"
                      rel="noopener noreferrer"
                      variant='text'
                      size='small'
                      sx={{
                        color: '#6B7280',
                        minWidth: 'auto',
                        p: 0.5,
                        transition: 'all 0.2s ease-in-out',
                        '&:hover': {
                          color: '#3B82F6',
                          backgroundColor: 'transparent',
                          transform: 'scale(1.1)'
                        }
                      }}
                    >
                      <LinkedInIcon sx={{ 
                        fontSize: '1.25rem',
                        '@media (max-width: 767px)': {
                          fontSize: '1.125rem' // 18px para mobile
                        }
                      }} />
                    </Button>
                  </Box>
                </Box>
              </Box>
            </Box>
          </Box>

        </Box>
        </Box>
      </Container>

      {/* Seção de Copyright com Redes Sociais */}
      <Box
        sx={{
          py: { xs: 1.5, md: 2 },
          borderTop: '1px solid #E5E7EB',
          backgroundColor: '#F9FAFB'
        }}
      >
        <Container maxWidth={false} sx={{ px: { xs: 3, sm: 4, md: 6, lg: 8 } }}>
          <Box sx={{ maxWidth: '1400px', mx: 'auto' }}>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center'
              }}
            >
              <Typography
                variant='body2'
                sx={{ 
                  color: '#6B7280',
                  fontSize: '0.8rem',
                  textAlign: 'center',
                  '@media (max-width: 767px)': {
                    fontSize: '0.75rem' // 12px para mobile
                  }
                }}
              >
                © 2026 Planco. Todos os direitos reservados.
              </Typography>
            </Box>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export { Footer };
