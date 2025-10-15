import { 
  Layers as LayersIcon, 
  Security as SecurityIcon,
  Help as HelpIcon,
  Info as InfoIcon,
  Build as BuildIcon,
  CheckCircle as CheckCircleIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Facebook as FacebookIcon,
  Twitter as TwitterIcon,
  GitHub as GitHubIcon
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
        mt: 6,
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
        sx={{ py: { xs: 2, md: 2.5 }, px: { xs: 3, sm: 4, md: 6, lg: 8 } }}
      >
        <Box sx={{ maxWidth: '1400px', mx: 'auto' }}>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                lg: 'repeat(12, 1fr)'
              },
              gap: { xs: 6, lg: 8 },
              textAlign: { xs: 'center', lg: 'left' },
              alignItems: 'start'
            }}
          >
          {/* Logo e Descrição - Ocupa 4 colunas */}
          <Box sx={{ 
            gridColumn: { xs: '1', lg: '1 / 5' },
            mb: { xs: 4, lg: 0 }
          }}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: { xs: 'center', lg: 'flex-start' },
                gap: 1.5,
                mb: 2
              }}
            >
              <LayersIcon sx={{ color: '#3B82F6', fontSize: '2rem' }} />
              <Typography
                variant='h4'
                sx={{ 
                  fontWeight: 700, 
                  color: '#1F2937',
                  fontSize: '1.5rem',
                  letterSpacing: '-0.02em'
                }}
              >
                Planco
              </Typography>
            </Box>
            <Typography
              variant='body2'
              sx={{ 
                color: '#6B7280',
                fontSize: '0.875rem',
                lineHeight: 1.5,
                mb: 2
              }}
            >
              Gestão moderna e integrada para o setor público.
            </Typography>
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 1,
              justifyContent: { xs: 'center', lg: 'flex-start' }
            }}>
              <CheckCircleIcon sx={{ color: '#10B981', fontSize: '1.25rem' }} />
              <Typography
                variant='body2'
                sx={{ 
                  color: '#059669',
                  fontSize: '0.875rem',
                  fontWeight: 500
                }}
              >
                Todos os sistemas operacionais.
              </Typography>
            </Box>
          </Box>

          {/* Links Úteis - Ocupa 8 colunas (6-13) */}
          <Box sx={{ 
            gridColumn: { xs: '1', lg: '6 / 13' },
            mb: { xs: 4, lg: 0 }
          }}>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: {
                  xs: '1fr',
                  md: 'repeat(3, 1fr)'
                },
                gap: { xs: 4, md: 6 }
              }}
            >
              {/* Links Úteis */}
              <Box>
                <Typography
                  variant='caption'
                  sx={{
                    textTransform: 'uppercase',
                    color: '#1F2937',
                    display: 'block',
                    fontWeight: 600,
                    fontSize: '0.875rem',
                    letterSpacing: '0.05em',
                    mb: 2
                  }}
                >
                  Links Úteis
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
                    onClick={() => navigate(NAVIGATE_PATHS.PRIVACY_POLICY_PATH)}
                    sx={{
                      justifyContent: { xs: 'center', lg: 'flex-start' },
                      color: '#6B7280',
                      fontSize: '0.875rem',
                      minHeight: 'auto',
                      py: 0.5,
                      px: 0,
                      textTransform: 'none',
                      fontWeight: 400,
                      '&:hover': {
                        color: '#3B82F6',
                        backgroundColor: 'transparent'
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
                      fontSize: '0.875rem',
                      minHeight: 'auto',
                      py: 0.5,
                      px: 0,
                      textTransform: 'none',
                      fontWeight: 400,
                      '&:hover': {
                        color: '#3B82F6',
                        backgroundColor: 'transparent'
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
                      fontSize: '0.875rem',
                      minHeight: 'auto',
                      py: 0.5,
                      px: 0,
                      textTransform: 'none',
                      fontWeight: 400,
                      '&:hover': {
                        color: '#3B82F6',
                        backgroundColor: 'transparent'
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
                    display: 'block',
                    fontWeight: 600,
                    fontSize: '0.875rem',
                    letterSpacing: '0.05em',
                    mb: 2
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
                      fontSize: '0.875rem',
                      minHeight: 'auto',
                      py: 0.5,
                      px: 0,
                      textTransform: 'none',
                      fontWeight: 400,
                      '&:hover': {
                        color: '#3B82F6',
                        backgroundColor: 'transparent'
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
                      fontSize: '0.875rem',
                      minHeight: 'auto',
                      py: 0.5,
                      px: 0,
                      textTransform: 'none',
                      fontWeight: 400,
                      '&:hover': {
                        color: '#3B82F6',
                        backgroundColor: 'transparent'
                      }
                    }}
                  >
                    Documentação
                  </Button>
                  <Button
                    variant='text'
                    size='small'
                    sx={{
                      justifyContent: { xs: 'center', lg: 'flex-start' },
                      color: '#6B7280',
                      fontSize: '0.875rem',
                      minHeight: 'auto',
                      py: 0.5,
                      px: 0,
                      textTransform: 'none',
                      fontWeight: 400,
                      '&:hover': {
                        color: '#3B82F6',
                        backgroundColor: 'transparent'
                      }
                    }}
                  >
                    Status da API
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
                    display: 'block',
                    fontWeight: 600,
                    fontSize: '0.875rem',
                    letterSpacing: '0.05em',
                    mb: 2
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
                    gap: 1,
                    justifyContent: { xs: 'center', lg: 'flex-start' }
                  }}>
                    <EmailIcon sx={{ color: '#6B7280', fontSize: '1rem' }} />
                    <Button
                      variant='text'
                      size='small'
                      sx={{
                        justifyContent: { xs: 'center', lg: 'flex-start' },
                        color: '#6B7280',
                        fontSize: '0.875rem',
                        minHeight: 'auto',
                        py: 0.5,
                        px: 0,
                        textTransform: 'none',
                        fontWeight: 400,
                        '&:hover': {
                          color: '#3B82F6',
                          backgroundColor: 'transparent'
                        }
                      }}
                    >
                      contato@planco.com.br
                    </Button>
                  </Box>
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 1,
                    justifyContent: { xs: 'center', lg: 'flex-start' }
                  }}>
                    <PhoneIcon sx={{ color: '#6B7280', fontSize: '1rem' }} />
                    <Button
                      variant='text'
                      size='small'
                      sx={{
                        justifyContent: { xs: 'center', lg: 'flex-start' },
                        color: '#6B7280',
                        fontSize: '0.875rem',
                        minHeight: 'auto',
                        py: 0.5,
                        px: 0,
                        textTransform: 'none',
                        fontWeight: 400,
                        '&:hover': {
                          color: '#3B82F6',
                          backgroundColor: 'transparent'
                        }
                      }}
                    >
                      (11) 99999-9999
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
          py: { xs: 3, md: 4 },
          borderTop: '1px solid #E5E7EB',
          backgroundColor: '#F9FAFB'
        }}
      >
        <Container maxWidth={false} sx={{ px: { xs: 3, sm: 4, md: 6, lg: 8 } }}>
          <Box sx={{ maxWidth: '1400px', mx: 'auto' }}>
            <Box
              sx={{
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: 2
              }}
            >
              <Typography
                variant='body2'
                sx={{ 
                  color: '#6B7280',
                  fontSize: '0.875rem',
                  textAlign: { xs: 'center', sm: 'left' }
                }}
              >
                © 2024 Planco. Todos os direitos reservados.
              </Typography>
              
              <Box
                sx={{
                  display: 'flex',
                  gap: 2,
                  alignItems: 'center'
                }}
              >
                <Button
                  variant='text'
                  size='small'
                  sx={{
                    color: '#6B7280',
                    minWidth: 'auto',
                    p: 0.5,
                    '&:hover': {
                      color: '#3B82F6',
                      backgroundColor: 'transparent'
                    }
                  }}
                >
                  <FacebookIcon sx={{ fontSize: '1.25rem' }} />
                </Button>
                <Button
                  variant='text'
                  size='small'
                  sx={{
                    color: '#6B7280',
                    minWidth: 'auto',
                    p: 0.5,
                    '&:hover': {
                      color: '#3B82F6',
                      backgroundColor: 'transparent'
                    }
                  }}
                >
                  <TwitterIcon sx={{ fontSize: '1.25rem' }} />
                </Button>
                <Button
                  variant='text'
                  size='small'
                  sx={{
                    color: '#6B7280',
                    minWidth: 'auto',
                    p: 0.5,
                    '&:hover': {
                      color: '#3B82F6',
                      backgroundColor: 'transparent'
                    }
                  }}
                >
                  <GitHubIcon sx={{ fontSize: '1.25rem' }} />
                </Button>
              </Box>
            </Box>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export { Footer };
