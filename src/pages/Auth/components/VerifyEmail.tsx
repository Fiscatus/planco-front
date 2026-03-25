import { Box, Button, CircularProgress, TextField, Typography } from '@mui/material';
import { CheckCircle, Error as ErrorIcon } from '@mui/icons-material';
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '@/services';
import { useNotification } from '@/components';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState('');
  const [email, setEmail] = useState('');
  const [resending, setResending] = useState(false);

  const verifyEmail = async (token: string) => {
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

    verifyEmail(token);
  }, []);

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #F8F9FA 0%, #E9ECEF 100%)',
        padding: 2
      }}
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
            <CircularProgress size={60} sx={{ mb: 3, color: '#1877F2' }} />
            <Typography variant="h5" sx={{ fontWeight: 600, color: '#212529', mb: 1 }}>
              Verificando seu email...
            </Typography>
            <Typography sx={{ color: '#6C757D' }}>
              Aguarde enquanto confirmamos sua conta.
            </Typography>
          </>
        )}

        {status === 'success' && (
          <>
            <CheckCircle sx={{ fontSize: 80, color: '#28A745', mb: 2 }} />
            <Typography variant="h5" sx={{ fontWeight: 600, color: '#212529', mb: 1 }}>
              Email verificado!
            </Typography>
            <Typography sx={{ color: '#6C757D', mb: 3 }}>
              Sua conta foi ativada com sucesso. Você será redirecionado para o login.
            </Typography>
            <Button
              onClick={() => navigate('/auth')}
              sx={{
                height: '48px',
                borderRadius: '8px',
                backgroundColor: '#1877F2',
                color: 'white',
                fontSize: '1rem',
                fontWeight: 600,
                textTransform: 'none',
                px: 4,
                '&:hover': {
                  backgroundColor: '#166FE5'
                }
              }}
            >
              Ir para Login
            </Button>
          </>
        )}

        {status === 'error' && (
          <>
            <ErrorIcon sx={{ fontSize: 80, color: '#DC3545', mb: 2 }} />
            <Typography variant="h5" sx={{ fontWeight: 600, color: '#212529', mb: 1 }}>
              Erro na verificação
            </Typography>
            <Typography sx={{ color: '#6C757D', mb: 3 }}>
              {errorMessage}
            </Typography>
            
            <Box sx={{ width: '100%', mb: 2 }}>
              <TextField
                fullWidth
                type="email"
                placeholder="Digite seu email"
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
                backgroundColor: '#1877F2',
                color: 'white',
                fontSize: '1rem',
                fontWeight: 600,
                textTransform: 'none',
                mb: 2,
                '&:hover': {
                  backgroundColor: '#166FE5'
                },
                '&:disabled': {
                  backgroundColor: '#E9ECEF',
                  color: '#6C757D'
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
                color: '#1877F2',
                fontSize: '1rem',
                fontWeight: 600,
                textTransform: 'none',
                border: '2px solid #1877F2',
                '&:hover': {
                  backgroundColor: '#F8F9FA'
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
