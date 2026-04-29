import { Box, Button, CircularProgress, Typography } from '@mui/material';
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

      {/* Headline */}
      <Typography
        component='h1'
        sx={{
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          fontWeight: 600,
          fontSize: { xs: '1.875rem', lg: '2rem' },
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
          mb: 3,
          lineHeight: 1.55
        }}
      >
        Enviamos um link de verificação para{' '}
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
            onClick={handleResendEmail}
            sx={{ color: '#1d4ed8', fontWeight: 600, cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
          >
            reenvie o link
          </Box>
          .
        </Typography>
      </Box>

      {/* Resend button */}
      <Button
        onClick={handleResendEmail}
        disabled={resending}
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
        {resending ? (
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
        <Typography
          component='span'
          onClick={() => {
            setRegistrationSuccess(false);
            setIsSignIn(true);
          }}
          sx={{
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontSize: '0.875rem',
            color: '#1d4ed8',
            fontWeight: 600,
            cursor: 'pointer',
            '&:hover': { textDecoration: 'underline' }
          }}
        >
          Fazer login
        </Typography>
      </Typography>
    </Box>
  );
};

export default RegistrationSuccess;
