import {
  Chat as ChatIcon,
  Email as EmailIcon,
  HelpCenter as HelpCenterIcon,
  PhoneInTalk as PhoneInTalkIcon,
  SupportAgent as SupportAgentIcon
} from '@mui/icons-material';
import { Box, Button, Card, Chip, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';

// ATENÇÃO: Não usar <Container> aqui. Este componente é embutido na OrganizationHome.

type Props = {
  onNavigateHistoria: () => void;
  onOpenChat: () => void;
  embedded?: boolean;
};

const SupportSection = ({ onNavigateHistoria, onOpenChat, embedded = true }: Props) => {
  const theme = useTheme();
  return (
    <Card
      sx={{
        p: { xs: 5, sm: 6, lg: 6 },
        borderRadius: 4,
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        height: '100%',
        backgroundColor: 'background.paper',
        display: 'flex',
        flexDirection: 'column',
        border: `1px solid ${theme.palette.divider}`,
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
          transform: 'translateY(-1px)'
        },
        '@media (max-width: 767px)': {
          p: 3,
          borderRadius: 3
        }
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
        <Typography
          variant='h5'
          fontWeight={700}
          sx={{
            color: 'text.primary',
            fontSize: '1.5rem',
            letterSpacing: '-0.025em',
            '@media (max-width: 767px)': {
              fontSize: '1.25rem'
            }
          }}
        >
          Precisa de Ajuda?
        </Typography>
        <Chip
          label='Online agora'
          size='small'
          sx={{
            bgcolor: 'success.light',
            color: 'success.main',
            fontWeight: 600,
            fontSize: '0.75rem',
            px: 2,
            py: 0.5,
            borderRadius: '9999px',
            border: `1px solid ${theme.palette.success.light}`,
            '@media (max-width: 767px)': {
              fontSize: '0.6875rem',
              px: 1.5,
              py: 0.25
            }
          }}
        />
      </Box>

      <Typography
        variant='body1'
        sx={{
          color: 'text.secondary',
          mb: 4,
          lineHeight: 1.6,
          fontSize: '1rem',
          fontWeight: 400,
          '@media (max-width: 767px)': {
            fontSize: '0.9375rem',
            mb: 3
          }
        }}
      >
        Nossa equipe de suporte está pronta para te ajudar. Veja nossos canais de atendimento ou abra um chamado.
      </Typography>

      <Box
        sx={{
          mb: 4,
          '@media (max-width: 767px)': {
            mb: 3 // 24px para mobile
          }
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            mb: 2.5,
            '@media (max-width: 767px)': {
              mb: 2
            }
          }}
        >
          <Box
            sx={{
              bgcolor: 'info.light',
              p: 1,
              borderRadius: 2,
              mr: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              '@media (max-width: 767px)': {
                p: 0.75,
                mr: 1.5
              }
            }}
          >
            <ChatIcon
              sx={{
                color: 'primary.main',
                fontSize: '1.25rem',
                '@media (max-width: 767px)': {
                  fontSize: '1.125rem'
                }
              }}
            />
          </Box>

          <Typography
            variant='body1'
            sx={{
              fontSize: '1rem',
              color: 'text.secondary',
              fontWeight: 500,
              '@media (max-width: 767px)': {
                fontSize: '0.9375rem'
              }
            }}
          >
            Chat em tempo real
          </Typography>
        </Box>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            mb: 2.5,
            '@media (max-width: 767px)': {
              mb: 2
            }
          }}
        >
          <Box
            sx={{
              bgcolor: 'info.light',
              p: 1,
              borderRadius: 2,
              mr: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              '@media (max-width: 767px)': {
                p: 0.75,
                mr: 1.5
              }
            }}
          >
            <PhoneInTalkIcon
              sx={{
                color: 'primary.main',
                fontSize: '1.25rem',
                '@media (max-width: 767px)': {
                  fontSize: '1.125rem'
                }
              }}
            />
          </Box>
          <Typography
            variant='body1'
            sx={{
              fontSize: '1rem',
              color: 'text.secondary',
              fontWeight: 500,
              '@media (max-width: 767px)': {
                fontSize: '0.9375rem'
              }
            }}
          >
            (99) 99999-9999
          </Typography>
        </Box>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            mb: 2.5,
            '@media (max-width: 767px)': {
              mb: 2
            }
          }}
        >
          <Box
            sx={{
              bgcolor: 'info.light',
              p: 1,
              borderRadius: 2,
              mr: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              '@media (max-width: 767px)': {
                p: 0.75,
                mr: 1.5
              }
            }}
          >
            <EmailIcon
              sx={{
                color: 'primary.main',
                fontSize: '1.25rem',
                '@media (max-width: 767px)': {
                  fontSize: '1.125rem'
                }
              }}
            />
          </Box>
          <Typography
            variant='body1'
            sx={{
              fontSize: '1rem',
              color: 'text.secondary',
              fontWeight: 500,
              '@media (max-width: 767px)': {
                fontSize: '0.9375rem'
              }
            }}
          >
            ajuda@planco.co.br
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Box
            sx={{
              bgcolor: 'info.light',
              p: 1,
              borderRadius: 2,
              mr: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              '@media (max-width: 767px)': {
                p: 0.75,
                mr: 1.5
              }
            }}
          >
            <HelpCenterIcon
              sx={{
                color: 'primary.main',
                fontSize: '1.25rem',
                '@media (max-width: 767px)': {
                  fontSize: '1.125rem'
                }
              }}
            />
          </Box>
          <Typography
            variant='body1'
            sx={{
              fontSize: '1rem',
              color: 'text.secondary',
              fontWeight: 500,
              '@media (max-width: 767px)': {
                fontSize: '0.9375rem'
              }
            }}
          >
            Central de ajuda
          </Typography>
        </Box>
      </Box>

      <Box sx={{ mt: 'auto' }}>
        <Button
          fullWidth
          variant='contained'
          color='primary'
          onClick={onOpenChat}
          startIcon={<SupportAgentIcon />}
          sx={{
            fontWeight: 600,
            py: 2,
            px: 3,
            borderRadius: 3,
            fontSize: '1rem',
            bgcolor: 'primary.main',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            '&:hover': {
              bgcolor: 'primary.dark',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
              transform: 'translateY(-1px)'
            },
            transition: 'all 0.2s ease-in-out',
            '@media (max-width: 767px)': {
              py: 1.5,
              px: 2.5,
              fontSize: '0.9375rem',
              borderRadius: 2.5
            }
          }}
        >
          Abrir Suporte
        </Button>
      </Box>
    </Card>
  );
};

export { SupportSection };
