import { CheckCircle, Error as ErrorIcon } from '@mui/icons-material';
import { Box, Button, CircularProgress, TextField, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useNotification } from '@/components';
import { api } from '@/services';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState('');
  const [email, setEmail] = useState('');
  const [resending, setResending] = useState(false);

  const handleResendVerification = async () => {
    if (!email) {
      showNotification('Digite seu email', 'error');
      return;
    }
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

  useEffect(() => {
    const token = searchParams.get('token');

    if (!token) {
      setStatus('error');
      setErrorMessage('Token de verificação não encontrado.');
      return;
    }

    const verifyEmail = async () => {
      try {
        await api.post('/auth/verify-email', { token });
        setStatus('success');
        showNotification('Email verificado com sucesso!', 'success');
        setTimeout(() => navigate('/auth'), 15000);
      } catch (error: any) {
        setStatus('error');
        setErrorMessage(error.message || 'Token inválido ou expirado.');
        showNotification('Erro ao verificar email.', 'error');
      }
    };

    verifyEmail();
  }, [searchParams, navigate, showNotification]);

  return (
    <Box
      sx={(theme) => ({
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: `linear-gradient(135deg, ${theme.palette.grey[50]} 0%, ${theme.palette.grey[100]} 100%)`,
        padding: 2
      })}
    >
      <Box
        sx={{
          maxWidth: '500px',
          width: '100%',
          borderRadius: 3,
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.1)',
          backgroundColor: 'white',
          padding: 4,
          textAlign: 'center'
        }}
      >
        {status === 'loading' && (
          <>
            <CircularProgress
              size={60}
              sx={{ mb: 3, color: 'primary.main' }}
            />
            <Typography
              variant='h5'
              sx={{ fontWeight: 600, color: 'text.primary', mb: 1 }}
            >
              Verificando seu email...
            </Typography>
            <Typography sx={{ color: 'text.secondary' }}>Aguarde enquanto confirmamos sua conta.</Typography>
          </>
        )}

        {status === 'success' && (
          <>
            <CheckCircle sx={{ fontSize: 80, color: 'success.main', mb: 2 }} />
            <Typography
              variant='h5'
              sx={{ fontWeight: 600, color: 'text.primary', mb: 1 }}
            >
              Email verificado!
            </Typography>
            <Typography sx={{ color: 'text.secondary', mb: 3 }}>
              Sua conta foi ativada com sucesso. Você será redirecionado para o login.
            </Typography>
            <Button
              onClick={() => navigate('/auth')}
              sx={{
                height: '48px',
                borderRadius: '8px',
                backgroundColor: 'primary.main',
                color: 'white',
                fontSize: '1rem',
                fontWeight: 600,
                textTransform: 'none',
                px: 4,
                '&:hover': {
                  backgroundColor: 'primary.dark'
                }
              }}
            >
              Ir para Login
            </Button>
          </>
        )}

        {status === 'error' && (
          <>
            <ErrorIcon sx={{ fontSize: 80, color: 'error.main', mb: 2 }} />
            <Typography
              variant='h5'
              sx={{ fontWeight: 600, color: 'text.primary', mb: 1 }}
            >
              Erro na verificação
            </Typography>
            <Typography sx={{ color: 'text.secondary', mb: 3 }}>{errorMessage}</Typography>

            <Box sx={{ width: '100%', mb: 2 }}>
              <TextField
                fullWidth
                type='email'
                placeholder='Digite seu email'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    height: '48px',
                    borderRadius: '8px'
                  }
                }}
              />
            </Box>

            <Button
              onClick={handleResendVerification}
              disabled={resending}
              fullWidth
              sx={{
                height: '48px',
                borderRadius: '8px',
                backgroundColor: 'primary.main',
                color: 'white',
                fontSize: '1rem',
                fontWeight: 600,
                textTransform: 'none',
                mb: 2,
                '&:hover': {
                  backgroundColor: 'primary.dark'
                },
                '&:disabled': {
                  backgroundColor: 'grey.100',
                  color: 'text.secondary'
                }
              }}
            >
              {resending ? 'Reenviando...' : 'Reenviar email de verificação'}
            </Button>

            <Button
              onClick={() => navigate('/auth')}
              fullWidth
              sx={{
                height: '48px',
                borderRadius: '8px',
                backgroundColor: 'white',
                color: 'primary.main',
                fontSize: '1rem',
                fontWeight: 600,
                textTransform: 'none',
                border: '2px solid',
                borderColor: 'primary.main',
                '&:hover': {
                  backgroundColor: 'grey.50'
                }
              }}
            >
              Voltar para Login
            </Button>
          </>
        )}
      </Box>
    </Box>
  );
};

export default VerifyEmail;
