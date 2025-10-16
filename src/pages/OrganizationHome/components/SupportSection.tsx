import {
  Chat as ChatIcon,
  Email as EmailIcon,
  HeadsetMic as HeadsetMicIcon,
  HelpCenter as HelpCenterIcon,
  PhoneInTalk as PhoneInTalkIcon,
  SupportAgent as SupportAgentIcon
} from '@mui/icons-material';
import { Box, Button, Card, Chip, Grid, Typography } from '@mui/material';

// ATENÇÃO: Não usar <Container> aqui. Este componente é embutido na OrganizationHome.

type Props = {
  onNavigateHistoria: () => void;
  onOpenChat: () => void;
  embedded?: boolean;
};

const SupportSection = ({ onNavigateHistoria, onOpenChat, embedded = true }: Props) => {
  return (
    <Card
      sx={{
        p: { xs: 5, sm: 6, lg: 6 },
        borderRadius: 4,
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        height: '100%',
        backgroundColor: '#fff',
        display: 'flex',
        flexDirection: 'column',
        border: '1px solid #F1F5F9',
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
          transform: 'translateY(-1px)'
        },
        '@media (max-width: 767px)': {
          p: 3, // 24px para mobile
          borderRadius: 3 // 24px para mobile
        }
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
        <Typography
          variant='h5'
          fontWeight={700}
          sx={{
            color: '#1E293B',
            fontSize: '1.5rem',
            letterSpacing: '-0.025em',
            '@media (max-width: 767px)': {
              fontSize: '1.25rem' // 20px para mobile
            }
          }}
        >
          Precisa de Ajuda?
        </Typography>
        <Chip
          label='Online agora'
          size='small'
          sx={{
            bgcolor: '#ECFDF5',
            color: '#059669',
            fontWeight: 600,
            fontSize: '0.75rem',
            px: 2,
            py: 0.5,
            borderRadius: '9999px',
            border: '1px solid #D1FAE5',
            '@media (max-width: 767px)': {
              fontSize: '0.6875rem', // 11px para mobile
              px: 1.5, // 12px para mobile
              py: 0.25 // 2px para mobile
            }
          }}
        />
      </Box>

      <Typography
        variant='body1'
        sx={{
          color: '#64748B',
          mb: 4,
          lineHeight: 1.6,
          fontSize: '1rem',
          fontWeight: 400,
          '@media (max-width: 767px)': {
            fontSize: '0.9375rem', // 15px para mobile
            mb: 3 // 24px para mobile
          }
        }}
      >
        Nossa equipe de suporte está pronta para te ajudar. Veja nossos canais de atendimento ou abra um chamado.
      </Typography>

      <Box sx={{ 
        mb: 4,
        '@media (max-width: 767px)': {
          mb: 3 // 24px para mobile
        }
      }}>
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          mb: 2.5,
          '@media (max-width: 767px)': {
            mb: 2 // 16px para mobile
          }
        }}>
          <Box sx={{ 
            bgcolor: '#EBF4FF', 
            p: 1, 
            borderRadius: 2, 
            mr: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            '@media (max-width: 767px)': {
              p: 0.75, // 6px para mobile
              mr: 1.5 // 12px para mobile
            }
          }}>
            <ChatIcon sx={{ 
              color: '#1877F2', 
              fontSize: '1.25rem',
              '@media (max-width: 767px)': {
                fontSize: '1.125rem' // 18px para mobile
              }
            }} />
          </Box>
          <Typography variant='body1' sx={{ 
            fontSize: '1rem', 
            color: '#374151', 
            fontWeight: 500,
            '@media (max-width: 767px)': {
              fontSize: '0.9375rem' // 15px para mobile
            }
          }}>Chat em tempo real</Typography>
        </Box>
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          mb: 2.5,
          '@media (max-width: 767px)': {
            mb: 2 // 16px para mobile
          }
        }}>
          <Box sx={{ 
            bgcolor: '#EBF4FF', 
            p: 1, 
            borderRadius: 2, 
            mr: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            '@media (max-width: 767px)': {
              p: 0.75, // 6px para mobile
              mr: 1.5 // 12px para mobile
            }
          }}>
            <PhoneInTalkIcon sx={{ 
              color: '#1877F2', 
              fontSize: '1.25rem',
              '@media (max-width: 767px)': {
                fontSize: '1.125rem' // 18px para mobile
              }
            }} />
          </Box>
          <Typography variant='body1' sx={{ 
            fontSize: '1rem', 
            color: '#374151', 
            fontWeight: 500,
            '@media (max-width: 767px)': {
              fontSize: '0.9375rem' // 15px para mobile
            }
          }}>(99) 99999-9999</Typography>
        </Box>
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          mb: 2.5,
          '@media (max-width: 767px)': {
            mb: 2 // 16px para mobile
          }
        }}>
          <Box sx={{ 
            bgcolor: '#EBF4FF', 
            p: 1, 
            borderRadius: 2, 
            mr: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            '@media (max-width: 767px)': {
              p: 0.75, // 6px para mobile
              mr: 1.5 // 12px para mobile
            }
          }}>
            <EmailIcon sx={{ 
              color: '#1877F2', 
              fontSize: '1.25rem',
              '@media (max-width: 767px)': {
                fontSize: '1.125rem' // 18px para mobile
              }
            }} />
          </Box>
          <Typography variant='body1' sx={{ 
            fontSize: '1rem', 
            color: '#374151', 
            fontWeight: 500,
            '@media (max-width: 767px)': {
              fontSize: '0.9375rem' // 15px para mobile
            }
          }}>ajuda@planco.co.br</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Box sx={{ 
            bgcolor: '#EBF4FF', 
            p: 1, 
            borderRadius: 2, 
            mr: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            '@media (max-width: 767px)': {
              p: 0.75, // 6px para mobile
              mr: 1.5 // 12px para mobile
            }
          }}>
            <HelpCenterIcon sx={{ 
              color: '#1877F2', 
              fontSize: '1.25rem',
              '@media (max-width: 767px)': {
                fontSize: '1.125rem' // 18px para mobile
              }
            }} />
          </Box>
          <Typography variant='body1' sx={{ 
            fontSize: '1rem', 
            color: '#374151', 
            fontWeight: 500,
            '@media (max-width: 767px)': {
              fontSize: '0.9375rem' // 15px para mobile
            }
          }}>Central de ajuda</Typography>
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
            bgcolor: '#1877F2',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            '&:hover': {
              bgcolor: '#166fe5',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
              transform: 'translateY(-1px)'
            },
            transition: 'all 0.2s ease-in-out',
            '@media (max-width: 767px)': {
              py: 1.5, // 12px para mobile
              px: 2.5, // 20px para mobile
              fontSize: '0.9375rem', // 15px para mobile
              borderRadius: 2.5 // 20px para mobile
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
