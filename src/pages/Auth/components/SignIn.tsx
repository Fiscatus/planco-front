import { zodResolver } from '@hookform/resolvers/zod';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { Box, Button, CircularProgress, IconButton, InputAdornment, Link, TextField, Typography } from '@mui/material';
import { useMutation } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { useNotification } from '@/components';
import type { LoginDto } from '@/globals/types/User';
import { useAuth } from '@/hooks';
import { api } from '@/services';

type Props = {
  setIsSignIn: (value: boolean) => void;
};

const authSchema = z.object({
  email: z.email('Email não é válido'),
  password: z
    .string()
    .min(8, 'A senha deve ter pelo menos 8 caracteres')
    .max(25, 'A senha deve ter no máximo 25 caracteres')
});

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

const labelSx = {
  fontFamily: "'Plus Jakarta Sans', sans-serif",
  fontSize: '0.8125rem',
  fontWeight: 500,
  color: '#374151',
  mb: 0.75
};

const SignIn = ({ setIsSignIn }: Props) => {
  const { signIn, hasOrganization, user } = useAuth();
  const { showNotification } = useNotification();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(true);
  const [shouldRedirectAfterLogin, setShouldRedirectAfterLogin] = useState(false);
  const [emailNotVerified, setEmailNotVerified] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [resending, setResending] = useState(false);

  const { mutate: signInMutation, isPending: signingIn } = useMutation({
    mutationFn: async (credentials: LoginDto) => {
      return await signIn(credentials);
    },
    onError: (error: unknown) => {
      if (error instanceof Error && error.message) {
        if (error.message.includes('email não verificado') || error.message.includes('email not verified')) {
          setEmailNotVerified(true);
          showNotification('Email não verificado. Verifique sua caixa de entrada.', 'error');
        } else {
          showNotification(error.message, 'error');
        }
      } else {
        showNotification('Erro ao fazer login. Tente novamente.', 'error');
      }
    },
    onSuccess: () => {
      setEmailNotVerified(false);
      showNotification('Login realizado com sucesso!', 'success');
      setShouldRedirectAfterLogin(true);
    }
  });

  const onSubmit = (credentials: LoginDto) => {
    setUserEmail(credentials.email);
    signInMutation(credentials);
  };

  const handleResendVerification = async () => {
    setResending(true);
    try {
      await api.post('/auth/resend-verification', { email: userEmail });
      showNotification('Email de verificação reenviado!', 'success');
    } catch (error: any) {
      showNotification(error.message || 'Erro ao reenviar email.', 'error');
    }
  };

  useEffect(() => {
    if (!shouldRedirectAfterLogin) return;
    if (!user) return;

    if (hasOrganization) {
      navigate('/');
      return;
    }
    navigate('/invites');
  }, [shouldRedirectAfterLogin, user, hasOrganization, navigate]);

  const {
    control,
    handleSubmit,
    clearErrors,
    formState: { errors, isDirty }
  } = useForm<z.infer<typeof authSchema>>({
    resolver: zodResolver(authSchema)
  });

  return (
    <Box>
      {/* Headline */}
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
          Bem-vindo{' '}
          <Box
            component='em'
            sx={{ fontWeight: 300, fontStyle: 'italic', color: '#1d4ed8', fontSize: 'inherit' }}
          >
            de volta.
          </Box>
        </Typography>
        <Typography
          sx={{
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontSize: '0.9375rem',
            color: '#6B7280'
          }}
        >
          Acesse sua conta para continuar.
        </Typography>
      </Box>

      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Email */}
        <Box sx={{ mb: 2.5 }}>
          <Typography sx={labelSx}>E-mail</Typography>
          <Controller
            name='email'
            control={control}
            defaultValue=''
            render={({ field }) => (
              <Box>
                <TextField
                  {...field}
                  type='email'
                  placeholder='nome@orgao.gov.br'
                  onFocus={() => clearErrors('email')}
                  sx={inputSx(!!errors.email)}
                />
                {errors.email && (
                  <Typography sx={{ color: '#ef4444', fontSize: '0.75rem', mt: 0.5, ml: 0.5 }}>
                    {errors.email.message}
                  </Typography>
                )}
              </Box>
            )}
          />
        </Box>

        {/* Password */}
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.75 }}>
            <Typography sx={labelSx}>Senha</Typography>
            <Link
              component='button'
              type='button'
              onClick={() => navigate('/auth/forgot-password')}
              sx={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontSize: '0.8125rem',
                color: '#1d4ed8',
                textDecoration: 'none',
                fontWeight: 500,
                '&:hover': { textDecoration: 'underline' }
              }}
            >
              Esqueceu sua senha?
            </Link>
          </Box>
          <Controller
            name='password'
            control={control}
            defaultValue=''
            render={({ field }) => (
              <Box>
                <TextField
                  {...field}
                  type={showPassword ? 'text' : 'password'}
                  placeholder='••••••••••••'
                  onFocus={() => clearErrors('password')}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position='end'>
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge='end'
                          sx={{ color: '#9CA3AF', '&:hover': { color: '#6B7280' } }}
                        >
                          {showPassword ? <VisibilityOff fontSize='small' /> : <Visibility fontSize='small' />}
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                  sx={inputSx(!!errors.password)}
                />
                {errors.password && (
                  <Typography sx={{ color: '#ef4444', fontSize: '0.75rem', mt: 0.5, ml: 0.5 }}>
                    {errors.password.message}
                  </Typography>
                )}
              </Box>
            )}
          />
        </Box>

        {/* CTA */}
        <Button
          disabled={!isDirty || signingIn}
          type='submit'
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
          {signingIn ? (
            <CircularProgress
              size={20}
              sx={{ color: 'white' }}
            />
          ) : (
            <>
              Entrar
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

        {/* Resend verification */}
        {emailNotVerified && (
          <Button
            onClick={handleResendVerification}
            disabled={resending}
            fullWidth
            sx={{
              height: '48px',
              borderRadius: '10px',
              backgroundColor: 'white',
              color: '#1d4ed8',
              fontSize: '0.9375rem',
              fontWeight: 600,
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              textTransform: 'none',
              mb: 2,
              border: '1.5px solid #1d4ed8',
              '&:hover': { backgroundColor: '#EFF6FF' }
            }}
          >
            Reenviar email de verificação
          </Button>
        )}

        {/* Link para solicitar acesso — abaixo do botão Entrar, centralizado */}
        <Typography
          sx={{
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontSize: '0.875rem',
            color: '#6B7280',
            textAlign: 'center',
            mt: 1
          }}
        >
          Não tem uma conta?{' '}
          <Typography
            component='span'
            onClick={() => setIsSignIn(false)}
            sx={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontSize: '0.875rem',
              color: '#1d4ed8',
              fontWeight: 600,
              cursor: 'pointer',
              '&:hover': { textDecoration: 'underline' }
            }}
          >
            Solicite acesso
          </Typography>
        </Typography>
      </form>
    </Box>
  );
};

export default SignIn;
