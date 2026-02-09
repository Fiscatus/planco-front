import { Email } from '@mui/icons-material';
import { Box, Button, Typography } from '@mui/material';
import { useState } from 'react';
import { useNotification } from '@/components';
import { api } from '@/services';

type Props = {
  email: string;
  setIsSignIn: (value: boolean) => void;
  setRegistrationSuccess: (value: boolean) => void;
};

const RegistrationSuccess = ({ email, setIsSignIn, setRegistrationSuccess }: Props) => {
  const { showNotification } = useNotification();
  const [resending, setResending] = useState(false);

  const handleResendEmail = async () => {
    setResending(true);
    try {
      await api.post('/auth/resend-verification', { email });
      showNotification('Email de verificação reenviado!', 'success');
    } catch (error: any) {
      showNotification(error.message || 'Erro ao reenviar email.', 'error');
    } finally {
      setResending(false);
    }
  };

  return (
    <Box>
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Email sx={{ fontSize: 80, color: 'primary.main', mb: 2 }} />
        <Typography
          variant='h4'
          component='h1'
          fontWeight={700}
          sx={{
            color: 'text.primary',
            mb: 1,
            fontSize: { xs: '1.75rem', sm: '2rem' }
          }}
        >
          Conta criada!
        </Typography>
        <Typography
          sx={{
            color: 'text.secondary',
            fontSize: '1rem',
            mb: 2
          }}
        >
          Verifique seu email para ativar sua conta.
        </Typography>
        <Typography
          sx={{
            color: 'text.primary',
            fontSize: '0.875rem',
            backgroundColor: 'grey.50',
            padding: 2,
            borderRadius: 2,
            border: '1px solid',
            borderColor: 'grey.100'
          }}
        >
          Enviamos um link de verificação para <strong>{email}</strong>
        </Typography>
      </Box>

      <Button
        onClick={handleResendEmail}
        disabled={resending}
        fullWidth
        sx={{
          height: '48px',
          borderRadius: '8px',
          backgroundColor: 'white',
          color: 'primary.main',
          fontSize: '1rem',
          fontWeight: 600,
          textTransform: 'none',
          mb: 2,
          border: '2px solid',
          borderColor: 'primary.main',
          '&:hover': {
            backgroundColor: '#F8F9FA'
          },
          '&:disabled': {
            backgroundColor: 'grey.100',
            color: 'text.secondary',
            borderColor: 'grey.300'
          }
        }}
      >
        {resending ? 'Reenviando...' : 'Reenviar email de verificação'}
      </Button>

      <Typography
        sx={{
          fontSize: '0.875rem',
          color: 'text.secondary',
          textAlign: 'center'
        }}
      >
        Já verificou seu email?{' '}
        <Typography
          component='span'
          onClick={() => {
            setRegistrationSuccess(false);
            setIsSignIn(true);
          }}
          sx={{
            fontSize: '0.875rem',
            color: 'primary.main',
            textDecoration: 'none',
            fontWeight: 500,
            cursor: 'pointer',
            '&:hover': {
              textDecoration: 'underline'
            }
          }}
        >
          Fazer login
        </Typography>
      </Typography>
    </Box>
  );
};

export default RegistrationSuccess;
