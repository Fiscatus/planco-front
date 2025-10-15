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
        p: 3,
        borderRadius: 3,
        boxShadow: 2,
        height: '100%',
        backgroundColor: '#fff',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
        <Typography
          variant='h6'
          fontWeight={700}
          sx={{
            color: '#212121',
            fontSize: '1.25rem'
          }}
        >
          Precisa de Ajuda?
        </Typography>
        <Chip
          label='Online agora'
          size='small'
          color='success'
          sx={{
            fontWeight: 700,
            fontSize: '0.75rem'
          }}
        />
      </Box>

      <Typography
        variant='body2'
        sx={{
          color: '#616161',
          mb: 2,
          lineHeight: 1.6
        }}
      >
        Nossa equipe de suporte está pronta para te ajudar. Veja nossos canais de atendimento ou abra um chamado.
      </Typography>

      <Box sx={{ mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', color: '#616161', mb: 1 }}>
          <ChatIcon sx={{ color: '#1877F2', mr: 1.5, fontSize: '1.25rem' }} />
          <Typography variant='body2'>Chat em tempo real</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', color: '#616161', mb: 1 }}>
          <PhoneInTalkIcon sx={{ color: '#1877F2', mr: 1.5, fontSize: '1.25rem' }} />
          <Typography variant='body2'>(99) 99999-9999</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', color: '#616161', mb: 1 }}>
          <EmailIcon sx={{ color: '#1877F2', mr: 1.5, fontSize: '1.25rem' }} />
          <Typography variant='body2'>ajuda@planco.co.br</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', color: '#616161' }}>
          <HelpCenterIcon sx={{ color: '#1877F2', mr: 1.5, fontSize: '1.25rem' }} />
          <Typography variant='body2'>Central de ajuda</Typography>
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
            fontWeight: 700,
            py: 1.2,
            borderRadius: 9999,
            '&:hover': {
              boxShadow: 3
            },
            transition: 'all 0.3s ease'
          }}
        >
          Abrir Suporte
        </Button>
      </Box>
    </Card>
  );
};

export { SupportSection };
