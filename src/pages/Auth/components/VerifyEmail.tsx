import { CheckCircle, Error as ErrorIcon } from '@mui/icons-material';
import { Box, Button, CircularProgress, TextField, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useNotification } from '@/components';
import { AuthSplitLayout } from '@/components/auth';
import { api } from '@/services';

const inputSx = {
  width: '100%',
  '& .MuiOutlinedInput-root': {
    height: '52px',
    borderRadius: '10px',
    backgroundColor: 'white',
    '& fieldset': { borderColor: '#E5E7EB', borderWidth: '1.5px' },
    '&:hover fieldset': { borderColor: '#D1D5DB' },
    '&.Mui-focused fieldset': {
      borderColor: '#1d4ed8',
      borderWidth: '1.5px',
      boxShadow: '0 0 0 3px rgba(29,78,216,0.12)'
    }
  },
  '& .MuiInputBase-input': {
    padding: '14px 16px',
    fontSize: '0.9375rem',
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    '&::placeholder': { color: '#9CA3AF', opacity: 1 }
  }
};

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

  // biome-ignore lint/correctness/useExhaustiveDependencies: executes once on mount — token is read from URL at mount time
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
    <AuthSplitLayout>
      {/* Loading */}
      {status === 'loading' && (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 3 }}>
          <Box sx={{ mb: 4 }}>
            <Typography
              component='h1'
              sx={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontWeight: 600,
                fontSize: { xs: '2rem', sm: '2.25rem', md: '2.5rem', lg: '3.25rem' },
                color: '#0B1220',
                lineHeight: 1.1,
                letterSpacing: '-0.03em',
                mb: 1
              }}
            >
              Verificando seu{' '}
              <Box
                component='em'
                sx={{ fontWeight: 300, fontStyle: 'italic', color: '#1d4ed8', fontSize: 'inherit' }}
              >
                e-mail.
              </Box>
            </Typography>
            <Typography sx={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '0.9375rem', color: '#6B7280' }}>
              Aguarde enquanto confirmamos sua conta.
            </Typography>
          </Box>
          <CircularProgress
            size={36}
            sx={{ color: '#1d4ed8' }}
          />
        </Box>
      )}

      {/* Sucesso */}
      {status === 'success' && (
        <Box>
          <Box
            sx={{
              width: 56,
              height: 56,
              borderRadius: '14px',
              backgroundColor: '#F0FDF4',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mb: 3
            }}
          >
            <CheckCircle sx={{ fontSize: 28, color: '#16a34a' }} />
          </Box>
          <Typography
            component='h1'
            sx={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontWeight: 600,
              fontSize: { xs: '2rem', sm: '2.25rem', md: '2.5rem', lg: '3.25rem' },
              color: '#0B1220',
              lineHeight: 1.1,
              letterSpacing: '-0.03em',
              mb: 1
            }}
          >
            Email{' '}
            <Box
              component='em'
              sx={{ fontWeight: 300, fontStyle: 'italic', color: '#1d4ed8', fontSize: 'inherit' }}
            >
              verificado!
            </Box>
          </Typography>
          <Typography
            sx={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontSize: '0.9375rem',
              color: '#6B7280',
              lineHeight: 1.55,
              mb: 4
            }}
          >
            Sua conta foi ativada com sucesso. Você será redirecionado para o login em instantes.
          </Typography>
          <Button
            onClick={() => navigate('/auth')}
            fullWidth
            sx={{
              height: '54px',
              borderRadius: '12px',
              backgroundColor: '#1d4ed8',
              color: 'white',
              fontSize: '0.9375rem',
              fontWeight: 600,
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              textTransform: 'none',
              boxShadow: '0 14px 30px -12px rgba(29,78,216,0.5)',
              '&:hover': { backgroundColor: '#1e40af' }
            }}
          >
            Ir para o login
          </Button>
        </Box>
      )}

      {/* Erro */}
      {status === 'error' && (
        <Box>
          <Box
            sx={{
              width: 56,
              height: 56,
              borderRadius: '14px',
              backgroundColor: '#FEF2F2',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mb: 3
            }}
          >
            <ErrorIcon sx={{ fontSize: 28, color: '#dc2626' }} />
          </Box>
          <Typography
            component='h1'
            sx={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontWeight: 600,
              fontSize: { xs: '2rem', sm: '2.25rem', md: '2.5rem', lg: '3.25rem' },
              color: '#0B1220',
              lineHeight: 1.1,
              letterSpacing: '-0.03em',
              mb: 1
            }}
          >
            Erro na{' '}
            <Box
              component='em'
              sx={{ fontWeight: 300, fontStyle: 'italic', color: '#1d4ed8', fontSize: 'inherit' }}
            >
              verificação.
            </Box>
          </Typography>
          <Typography
            sx={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontSize: '0.9375rem',
              color: '#6B7280',
              lineHeight: 1.55,
              mb: 4
            }}
          >
            {errorMessage}
          </Typography>

          <Box sx={{ mb: 2 }}>
            <Typography
              sx={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontSize: '0.8125rem',
                fontWeight: 500,
                color: '#374151',
                mb: 0.75
              }}
            >
              E-mail
            </Typography>
            <TextField
              fullWidth
              type='email'
              placeholder='nome@orgao.gov.br'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              sx={inputSx}
            />
          </Box>

          <Button
            onClick={handleResendVerification}
            disabled={resending}
            fullWidth
            sx={{
              height: '54px',
              borderRadius: '12px',
              backgroundColor: '#1d4ed8',
              color: 'white',
              fontSize: '0.9375rem',
              fontWeight: 600,
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              textTransform: 'none',
              mb: 2,
              boxShadow: '0 14px 30px -12px rgba(29,78,216,0.5)',
              '&:hover:not(:disabled)': { backgroundColor: '#1e40af' },
              '&:disabled': { backgroundColor: '#E5E7EB', color: '#9CA3AF', boxShadow: 'none' }
            }}
          >
            {resending ? (
              <CircularProgress
                size={20}
                sx={{ color: 'white' }}
              />
            ) : (
              'Reenviar email de verificação'
            )}
          </Button>

          <Button
            onClick={() => navigate('/auth')}
            fullWidth
            sx={{
              height: '54px',
              borderRadius: '12px',
              backgroundColor: 'transparent',
              color: '#0B1220',
              fontSize: '0.9375rem',
              fontWeight: 600,
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              textTransform: 'none',
              border: '1.5px solid #E5E7EB',
              '&:hover': { backgroundColor: '#F9FAFB', borderColor: '#D1D5DB' }
            }}
          >
            Voltar ao login
          </Button>
        </Box>
      )}
    </AuthSplitLayout>
  );
};

export default VerifyEmail;
