import { Box, Button, CircularProgress, Link, TextField, Typography } from '@mui/material';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthSplitLayout } from '@/components/auth';
import { api } from '@/services';

const inputSx = (hasError: boolean) => ({
  width: '100%',
  '& .MuiOutlinedInput-root': {
    height: '52px',
    borderRadius: '10px',
    backgroundColor: 'white',
    '& fieldset': {
      borderColor: hasError ? '#ef4444' : '#E5E7EB',
      borderWidth: '1.5px'
    },
    '&:hover fieldset': {
      borderColor: hasError ? '#ef4444' : '#D1D5DB'
    },
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
});

const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    setError('');
    try {
      await api.post('/auth/forgot-password', { email });
      setSent(true);
    } catch (err: any) {
      setError(err.message || 'Erro ao enviar email. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email.trim()) return;
    setLoading(true);
    setError('');
    try {
      await api.post('/auth/forgot-password', { email });
      setSent(true);
    } catch (err: any) {
      setError(err.message || 'Erro ao reenviar email. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const topRightSlot = (
    <Box
      component='button'
      type='button'
      onClick={() => navigate('/auth')}
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 0.75,
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        p: 0,
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        fontSize: '0.8125rem',
        color: '#6B7280',
        transition: 'color 0.15s ease',
        '&:hover': { color: '#0B1220' }
      }}
    >
      <Box
        component='svg'
        width={16}
        height={16}
        viewBox='0 0 24 24'
        fill='none'
        stroke='currentColor'
        strokeWidth={2}
        strokeLinecap='round'
        strokeLinejoin='round'
      >
        <path d='M19 12H5M12 19l-7-7 7-7' />
      </Box>
      Voltar para login
    </Box>
  );

  return (
    <AuthSplitLayout topRightSlot={topRightSlot}>
      {!sent ? (
        /* Form state */
        <Box>
          <Box sx={{ mb: 5 }}>
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
              Recuperar{' '}
              <Box
                component='em'
                sx={{ fontWeight: 300, fontStyle: 'italic', color: '#1d4ed8', fontSize: 'inherit' }}
              >
                senha.
              </Box>
            </Typography>
            <Typography
              sx={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontSize: '0.9375rem',
                color: '#6B7280',
                lineHeight: 1.55
              }}
            >
              Informe seu e-mail e enviaremos um link seguro para você redefinir sua senha.
            </Typography>
          </Box>

          <form onSubmit={handleSubmit}>
            <Box sx={{ mb: 0.75 }}>
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
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError('');
                }}
                error={!!error}
                helperText={error}
                sx={inputSx(!!error)}
              />
            </Box>

            <Button
              type='submit'
              fullWidth
              disabled={loading || !email.trim()}
              sx={{
                height: '54px',
                borderRadius: '12px',
                backgroundColor: '#1d4ed8',
                color: 'white',
                fontSize: '0.9375rem',
                fontWeight: 600,
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                textTransform: 'none',
                mt: 2.25,
                mb: 2.75,
                boxShadow: '0 14px 30px -12px rgba(29,78,216,0.5), inset 0 1px 0 rgba(255,255,255,0.12)',
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                '&:hover:not(:disabled)': {
                  backgroundColor: '#1e40af',
                  transform: 'translateY(-1px)',
                  '& .arrow-icon': { transform: 'translateX(4px)' }
                },
                '&:active:not(:disabled)': { transform: 'translateY(0)' },
                '&:disabled': { backgroundColor: '#E5E7EB', color: '#9CA3AF', boxShadow: 'none' },
                transition: 'all 0.2s ease'
              }}
            >
              {loading ? (
                <CircularProgress
                  size={20}
                  sx={{ color: 'white' }}
                />
              ) : (
                <>
                  Enviar link de recuperação
                  <Box
                    component='svg'
                    className='arrow-icon'
                    width={18}
                    height={18}
                    viewBox='0 0 24 24'
                    fill='none'
                    stroke='currentColor'
                    strokeWidth={2}
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    sx={{ transition: 'transform 0.2s ease', flexShrink: 0 }}
                  >
                    <path d='M5 12h14M12 5l7 7-7 7' />
                  </Box>
                </>
              )}
            </Button>

            {/* Security note */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box
                component='svg'
                width={12}
                height={12}
                viewBox='0 0 24 24'
                fill='none'
                stroke='#475467'
                strokeWidth={2}
                strokeLinecap='round'
                strokeLinejoin='round'
                sx={{ flexShrink: 0 }}
              >
                <path d='M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z' />
              </Box>
              <Typography
                sx={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '0.78125rem', color: '#475467' }}
              >
                Validade do link:{' '}
                <Box
                  component='strong'
                  sx={{ fontWeight: 600 }}
                >
                  30 minutos
                </Box>
              </Typography>
            </Box>
          </form>

          {/* Footer link */}
          <Typography
            sx={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontSize: '0.875rem',
              color: '#6B7280',
              textAlign: 'center',
              mt: 4
            }}
          >
            Lembrou sua senha?{' '}
            <Link
              component='button'
              type='button'
              onClick={() => navigate('/auth')}
              sx={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontSize: '0.875rem',
                color: '#1d4ed8',
                fontWeight: 600,
                textDecoration: 'none',
                '&:hover': { textDecoration: 'underline' }
              }}
            >
              Entrar
            </Link>
          </Typography>
        </Box>
      ) : (
        /* Sent state */
        <Box>
          {/* Icon circle */}
          <Box
            sx={{
              width: 56,
              height: 56,
              borderRadius: '14px',
              backgroundColor: '#EFF6FF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mb: 3
            }}
          >
            <Box
              component='svg'
              width={28}
              height={28}
              viewBox='0 0 24 24'
              fill='none'
              stroke='#1d4ed8'
              strokeWidth={1.75}
              strokeLinecap='round'
              strokeLinejoin='round'
            >
              <path d='M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z' />
              <polyline points='22,6 12,13 2,6' />
            </Box>
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
            Verifique seu{' '}
            <Box
              component='em'
              sx={{ fontWeight: 300, fontStyle: 'italic', color: '#1d4ed8', fontSize: 'inherit' }}
            >
              e-mail.
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
            Enviamos um link de recuperação para{' '}
            <Box
              component='strong'
              sx={{ color: '#0B1220', fontWeight: 600 }}
            >
              {email}
            </Box>
            . Verifique sua caixa de entrada e a pasta de spam.
          </Typography>

          {/* Info card */}
          <Box
            sx={{
              border: '1px solid #E5E7EB',
              borderRadius: '14px',
              p: 2.25,
              mb: 3,
              display: 'flex',
              gap: 1.75,
              alignItems: 'flex-start'
            }}
          >
            <Box
              sx={{
                width: 38,
                height: 38,
                borderRadius: '10px',
                backgroundColor: '#F1F5F9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
            >
              <Box
                component='svg'
                width={18}
                height={18}
                viewBox='0 0 24 24'
                fill='none'
                stroke='#475467'
                strokeWidth={1.75}
                strokeLinecap='round'
                strokeLinejoin='round'
              >
                <circle
                  cx='12'
                  cy='12'
                  r='10'
                />
                <polyline points='12,6 12,12 16,14' />
              </Box>
            </Box>
            <Typography
              sx={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontSize: '0.8125rem',
                color: '#475467',
                lineHeight: 1.55
              }}
            >
              Não recebeu? Verifique novamente em alguns minutos ou{' '}
              <Box
                component='span'
                onClick={() => setSent(false)}
                sx={{
                  color: '#1d4ed8',
                  fontWeight: 600,
                  cursor: 'pointer',
                  '&:hover': { textDecoration: 'underline' }
                }}
              >
                tente outro e-mail
              </Box>
              .
            </Typography>
          </Box>

          {/* Resend button */}
          <Button
            onClick={handleResend}
            disabled={loading}
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
              mb: 3,
              border: '1.5px solid #E5E7EB',
              '&:hover': { backgroundColor: '#F9FAFB', borderColor: '#D1D5DB' },
              '&:disabled': { backgroundColor: '#F9FAFB', color: '#9CA3AF' }
            }}
          >
            {loading ? (
              <CircularProgress
                size={20}
                sx={{ color: '#6B7280' }}
              />
            ) : (
              'Reenviar link'
            )}
          </Button>

          <Typography
            sx={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontSize: '0.875rem',
              color: '#6B7280',
              textAlign: 'center'
            }}
          >
            Lembrou sua senha?{' '}
            <Link
              component='button'
              type='button'
              onClick={() => navigate('/auth')}
              sx={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontSize: '0.875rem',
                color: '#1d4ed8',
                fontWeight: 600,
                textDecoration: 'none',
                '&:hover': { textDecoration: 'underline' }
              }}
            >
              Entrar
            </Link>
          </Typography>
        </Box>
      )}
    </AuthSplitLayout>
  );
};

export default ForgotPasswordPage;
