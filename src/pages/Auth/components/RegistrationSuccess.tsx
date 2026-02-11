import { Box, Button, Typography } from '@mui/material';
import { Email } from '@mui/icons-material';
import { useState } from 'react';
import { api } from '@/services';
import { useNotification } from '@/components';
import logo from '/assets/isologo.svg';

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
        <Email sx={{ fontSize: 80, color: '#1877F2', mb: 2 }} />
        <Typography
          variant='h4'
          component='h1'
          fontWeight={700}
          sx={{
            color: '#212529',
            mb: 1,
            fontSize: { xs: '1.75rem', sm: '2rem' }
          }}
        >
          Conta criada!
        </Typography>
        <Typography
          sx={{
            color: '#6C757D',
            fontSize: '1rem',
            mb: 2
          }}
        >
          Verifique seu email para ativar sua conta.
        </Typography>
        <Typography
          sx={{
            color: '#495057',
            fontSize: '0.875rem',
            backgroundColor: '#F8F9FA',
            padding: 2,
            borderRadius: 2,
            border: '1px solid #E9ECEF'
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
          color: '#1877F2',
          fontSize: '1rem',
          fontWeight: 600,
          textTransform: 'none',
          mb: 2,
          border: '2px solid #1877F2',
          '&:hover': {
            backgroundColor: '#F8F9FA'
          },
          '&:disabled': {
            backgroundColor: '#E9ECEF',
            color: '#6C757D',
            borderColor: '#CED4DA'
          }
        }}
      >
        {resending ? 'Reenviando...' : 'Reenviar email de verificação'}
      </Button>

      <Typography
        sx={{
          fontSize: '0.875rem',
          color: '#6C757D',
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
            color: '#1877F2',
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
