import {
  CheckCircle as CheckCircleIcon,
  Email as EmailIcon,
  Instagram as InstagramIcon,
  LinkedIn as LinkedInIcon,
  Phone as PhoneIcon
} from '@mui/icons-material';
import { Box, Button, Container, Typography, useTheme } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import logo from '/assets/isologo.svg';

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
        backgroundColor: 'grey.50',
        borderTop: '2px solid',
        borderColor: 'secondary.light',
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
          background: `linear-gradient(90deg, transparent 0%, ${theme.palette.secondary.light} 20%, ${theme.palette.secondary.light} 80%, transparent 100%)`
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
            <Box
              sx={{
                gridColumn: { xs: '1', lg: '1 / 5' },
                mb: { xs: 2, lg: 0 },
                display: 'flex',
                flexDirection: 'column',
                height: '100%'
              }}
            >
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
                  alt='Planco Logo'
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
                    color: 'text.primary',
                    fontSize: '1.5rem',
                    letterSpacing: '-0.02em',
                    lineHeight: 1.2,
                    '@media (max-width: 767px)': {
                      fontSize: '1.25rem'
                    }
                  }}
                >
                  Planco
                </Typography>
              </Box>
              <Typography
                variant='body2'
                sx={{
                  color: 'text.secondary',
                  fontSize: '0.8rem',
                  lineHeight: 1.6,
                  mb: 1.5,
                  textAlign: { xs: 'center', lg: 'left' },
                  '@media (max-width: 767px)': {
                    fontSize: '0.75rem'
                  }
                }}
              >
                Tecnologia que impulsiona o planejamento público eficiente.
              </Typography>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  justifyContent: { xs: 'center', lg: 'flex-start' }
                }}
              >
                <CheckCircleIcon
                  sx={{
                    color: 'success.main',
                    fontSize: '1.25rem',
                    '@media (max-width: 767px)': {
                      fontSize: '1.125rem'
                    }
                  }}
                />
                <Typography
                  variant='body2'
                  sx={{
                    color: 'success.dark',
                    fontSize: '0.8rem',
                    fontWeight: 500,
                    lineHeight: 1.4,
                    '@media (max-width: 767px)': {
                      fontSize: '0.75rem'
                    }
                  }}
                >
                  Todos os sistemas operacionais.
                </Typography>
              </Box>
            </Box>

            <Box
              sx={{
                gridColumn: { xs: '1', lg: '6 / 13' },
                mb: { xs: 2, lg: 0 },
                display: 'flex',
                flexDirection: 'column',
                height: '100%'
              }}
            >
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
                    gap: 3
                  }
                }}
              >
                <Box>
                  <Typography
                    variant='caption'
                    sx={{
                      textTransform: 'uppercase',
                      color: 'text.primary',
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
                        fontSize: '0.75rem',
                        mb: 1.5
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
                        gap: 0.75
                      }
                    }}
                  >
                    <Button
                      variant='text'
                      size='small'
                      onClick={() => navigate(NAVIGATE_PATHS.PRIVACY_POLICY_PATH)}
                      sx={{
                        justifyContent: { xs: 'center', lg: 'flex-start' },
                        color: 'text.secondary',
                        fontSize: '0.8rem',
                        minHeight: 'auto',
                        py: 0.5,
                        px: 0,
                        textTransform: 'none',
                        fontWeight: 400,
                        '&:hover': {
                          color: 'primary.main',
                          backgroundColor: 'transparent'
                        },
                        '@media (max-width: 767px)': {
                          fontSize: '0.75rem',
                          py: 0.25
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
                        color: 'text.secondary',
                        fontSize: '0.8rem',
                        minHeight: 'auto',
                        py: 0.5,
                        px: 0,
                        textTransform: 'none',
                        fontWeight: 400,
                        '&:hover': {
                          color: 'primary.main',
                          backgroundColor: 'transparent'
                        },
                        '@media (max-width: 767px)': {
                          fontSize: '0.75rem',
                          py: 0.25
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
                        color: 'text.secondary',
                        fontSize: '0.8rem',
                        minHeight: 'auto',
                        py: 0.5,
                        px: 0,
                        textTransform: 'none',
                        fontWeight: 400,
                        '&:hover': {
                          color: 'primary.main',
                          backgroundColor: 'transparent'
                        },
                        '@media (max-width: 767px)': {
                          fontSize: '0.75rem',
                          py: 0.25
                        }
                      }}
                    >
                      Sobre o Sistema
                    </Button>
                  </Box>
                </Box>

                <Box>
                  <Typography
                    variant='caption'
                    sx={{
                      textTransform: 'uppercase',
                      color: 'text.primary',
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
                        fontSize: '0.75rem',
                        mb: 1.5
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
                        color: 'text.secondary',
                        fontSize: '0.8rem',
                        minHeight: 'auto',
                        py: 0.5,
                        px: 0,
                        textTransform: 'none',
                        fontWeight: 400,
                        '&:hover': {
                          color: 'primary.main',
                          backgroundColor: 'transparent'
                        },
                        '@media (max-width: 767px)': {
                          fontSize: '0.75rem',
                          py: 0.25
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
                        color: 'text.secondary',
                        fontSize: '0.8rem',
                        minHeight: 'auto',
                        py: 0.5,
                        px: 0,
                        textTransform: 'none',
                        fontWeight: 400,
                        '&:hover': {
                          color: 'primary.main',
                          backgroundColor: 'transparent'
                        },
                        '@media (max-width: 767px)': {
                          fontSize: '0.75rem',
                          py: 0.25
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
                        color: 'text.secondary',
                        fontSize: '0.8rem',
                        minHeight: 'auto',
                        py: 0.5,
                        px: 0,
                        textTransform: 'none',
                        fontWeight: 400,
                        '&:hover': {
                          color: 'primary.main',
                          backgroundColor: 'transparent'
                        },
                        '@media (max-width: 767px)': {
                          fontSize: '0.75rem',
                          py: 0.25
                        }
                      }}
                    >
                      Enviar Feedback
                    </Button>
                  </Box>
                </Box>

                <Box>
                  <Typography
                    variant='caption'
                    sx={{
                      textTransform: 'uppercase',
                      color: 'text.primary',
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
                        fontSize: '0.75rem',
                        mb: 1.5
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
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.75,
                        justifyContent: { xs: 'center', lg: 'flex-start' }
                      }}
                    >
                      <EmailIcon
                        sx={{
                          color: 'text.secondary',
                          fontSize: '1.125rem',
                          '@media (max-width: 767px)': {
                            fontSize: '1rem'
                          }
                        }}
                      />
                      <Button
                        component='a'
                        href='mailto:contato@planco.com.br'
                        variant='text'
                        size='small'
                        sx={{
                          justifyContent: { xs: 'center', lg: 'flex-start' },
                          color: 'text.secondary',
                          fontSize: '0.8rem',
                          minHeight: 'auto',
                          py: 0.5,
                          px: 0,
                          textTransform: 'none',
                          fontWeight: 400,
                          lineHeight: 1.4,
                          transition: 'all 0.2s ease-in-out',
                          '&:hover': {
                            color: 'primary.main',
                            backgroundColor: 'transparent',
                            transform: 'translateY(-1px)'
                          }
                        }}
                      >
                        contato@planco.com.br
                      </Button>
                    </Box>
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.75,
                        justifyContent: { xs: 'center', lg: 'flex-start' }
                      }}
                    >
                      <PhoneIcon
                        sx={{
                          color: 'text.secondary',
                          fontSize: '1.125rem',
                          '@media (max-width: 767px)': {
                            fontSize: '1rem'
                          }
                        }}
                      />
                      <Button
                        component='a'
                        href='tel:+5511999999999'
                        variant='text'
                        size='small'
                        sx={{
                          justifyContent: { xs: 'center', lg: 'flex-start' },
                          color: 'text.secondary',
                          fontSize: '0.8rem',
                          minHeight: 'auto',
                          py: 0.5,
                          px: 0,
                          textTransform: 'none',
                          fontWeight: 400,
                          lineHeight: 1.4,
                          transition: 'all 0.2s ease-in-out',
                          '&:hover': {
                            color: 'primary.main',
                            backgroundColor: 'transparent',
                            transform: 'translateY(-1px)'
                          }
                        }}
                      >
                        (11) 99999-9999
                      </Button>
                    </Box>

                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.75,
                        justifyContent: { xs: 'center', lg: 'flex-start' },
                        mt: 1
                      }}
                    >
                      <Button
                        component='a'
                        href='https://instagram.com/planco'
                        target='_blank'
                        rel='noopener noreferrer'
                        variant='text'
                        size='small'
                        sx={{
                          color: 'text.secondary',
                          minWidth: 'auto',
                          p: 0.5,
                          transition: 'all 0.2s ease-in-out',
                          '&:hover': {
                            color: 'primary.main',
                            backgroundColor: 'transparent',
                            transform: 'scale(1.1)'
                          }
                        }}
                      >
                        <InstagramIcon
                          sx={{
                            fontSize: '1.25rem',
                            '@media (max-width: 767px)': {
                              fontSize: '1.125rem'
                            }
                          }}
                        />
                      </Button>
                      <Button
                        component='a'
                        href='https://linkedin.com/company/planco'
                        target='_blank'
                        rel='noopener noreferrer'
                        variant='text'
                        size='small'
                        sx={{
                          color: 'text.secondary',
                          minWidth: 'auto',
                          p: 0.5,
                          transition: 'all 0.2s ease-in-out',
                          '&:hover': {
                            color: 'primary.main',
                            backgroundColor: 'transparent',
                            transform: 'scale(1.1)'
                          }
                        }}
                      >
                        <LinkedInIcon
                          sx={{
                            fontSize: '1.25rem',
                            '@media (max-width: 767px)': {
                              fontSize: '1.125rem'
                            }
                          }}
                        />
                      </Button>
                    </Box>
                  </Box>
                </Box>
              </Box>
            </Box>
          </Box>
        </Box>
      </Container>

      <Box
        sx={{
          py: { xs: 1.5, md: 2 },
          borderTop: '1px solid',
          borderColor: 'divider',
          backgroundColor: 'grey.100'
        }}
      >
        <Container
          maxWidth={false}
          sx={{ px: { xs: 3, sm: 4, md: 6, lg: 8 } }}
        >
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
                  color: 'text.secondary',
                  fontSize: '0.8rem',
                  textAlign: 'center',
                  '@media (max-width: 767px)': {
                    fontSize: '0.75rem'
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
