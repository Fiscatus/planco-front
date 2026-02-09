import { zodResolver } from '@hookform/resolvers/zod';
import { Lock, Person, Visibility, VisibilityOff } from '@mui/icons-material';
import { Box, Button, IconButton, InputAdornment, Link, TextField, Typography } from '@mui/material';
import { useMutation } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { useNotification } from '@/components';
import type { LoginDto } from '@/globals/types/User';
import { useAuth } from '@/hooks';
import { api } from '@/services';
import logo from '/assets/isologo.svg';

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

const SignIn = ({ setIsSignIn }: Props) => {
  const { signIn, hasOrganization, user } = useAuth();
  const { showNotification } = useNotification();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(true);
  const [shouldRedirectAfterLogin, setShouldRedirectAfterLogin] = useState(false);
  const [emailNotVerified, setEmailNotVerified] = useState(false);
  const [userEmail, setUserEmail] = useState('');

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
      <form onSubmit={handleSubmit(onSubmit)}>
        <Box sx={{ mb: 4, textAlign: 'center' }}>
          <img
            src={logo}
            alt='Planco Logo'
            style={{
              width: '64px',
              height: '64px',
              objectFit: 'contain',
              display: 'block',
              margin: '0 auto 16px auto'
            }}
          />
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
            Acesso ao Sistema
          </Typography>
          <Typography
            sx={{
              color: 'text.secondary',
              fontSize: '1rem'
            }}
          >
            Entre na sua conta para continuar
          </Typography>
        </Box>
        <Box sx={{ mb: 3 }}>
          <Typography
            variant='body2'
            sx={{
              mb: 1,
              fontWeight: 500,
              color: 'text.primary',
              fontSize: '0.875rem'
            }}
          >
            E-mail
          </Typography>
          <Controller
            name='email'
            control={control}
            defaultValue=''
            render={({ field }) => (
              <Box>
                <TextField
                  {...field}
                  type='email'
                  placeholder='seuemail@exemplo.com'
                  onFocus={() => clearErrors('email')}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position='start'>
                        <Person sx={{ color: 'text.secondary' }} />
                      </InputAdornment>
                    )
                  }}
                  sx={{
                    width: '100%',
                    '& .MuiOutlinedInput-root': {
                      height: '48px',
                      borderRadius: '8px',
                      backgroundColor: 'white',
                      '& fieldset': {
                        borderColor: errors.email ? 'error.main' : 'grey.300',
                        borderWidth: '1px'
                      },
                      '&:hover fieldset': {
                        borderColor: errors.email ? 'error.main' : 'grey.400'
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: 'primary.main',
                        borderWidth: '2px'
                      }
                    },
                    '& .MuiInputBase-input': {
                      padding: '12px 14px',
                      fontSize: '0.875rem',
                      '&::placeholder': {
                        color: 'text.secondary',
                        opacity: 1
                      }
                    }
                  }}
                />
                {errors.email && (
                  <Typography
                    sx={{
                      color: 'error.main',
                      fontSize: '0.75rem',
                      mt: 0.5,
                      ml: 1
                    }}
                  >
                    {errors.email.message}
                  </Typography>
                )}
              </Box>
            )}
          />
        </Box>
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography
              variant='body2'
              sx={{
                fontWeight: 500,
                color: 'text.primary',
                fontSize: '0.875rem'
              }}
            >
              Senha
            </Typography>
            <Link
              href='/auth/forgot-password'
              sx={{
                fontSize: '0.875rem',
                color: 'primary.main',
                textDecoration: 'none',
                fontWeight: 500,
                '&:hover': {
                  textDecoration: 'underline'
                }
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
                  placeholder='Digite sua senha'
                  onFocus={() => clearErrors('password')}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position='start'>
                        <Lock sx={{ color: 'text.secondary' }} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position='end'>
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge='end'
                          sx={{ color: 'text.secondary' }}
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                  sx={{
                    width: '100%',
                    '& .MuiOutlinedInput-root': {
                      height: '48px',
                      borderRadius: '8px',
                      backgroundColor: 'white',
                      '& fieldset': {
                        borderColor: errors.password ? 'error.main' : 'grey.300',
                        borderWidth: '1px'
                      },
                      '&:hover fieldset': {
                        borderColor: errors.password ? 'error.main' : 'grey.400'
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: 'primary.main',
                        borderWidth: '2px'
                      }
                    },
                    '& .MuiInputBase-input': {
                      padding: '12px 14px',
                      fontSize: '0.875rem',
                      '&::placeholder': {
                        color: 'text.secondary',
                        opacity: 1
                      }
                    }
                  }}
                />
                {errors.password && (
                  <Typography
                    sx={{
                      color: 'error.main',
                      fontSize: '0.75rem',
                      mt: 0.5,
                      ml: 1
                    }}
                  >
                    {errors.password.message}
                  </Typography>
                )}
              </Box>
            )}
          />
        </Box>
        <Button
          disabled={!isDirty || signingIn}
          type='submit'
          fullWidth
          sx={{
            height: '48px',
            borderRadius: '8px',
            backgroundColor: 'primary.main',
            color: 'white',
            fontSize: '1rem',
            fontWeight: 600,
            textTransform: 'none',
            mb: 3,
            '&:hover': {
              backgroundColor: 'primary.dark'
            },
            '&:disabled': {
              backgroundColor: 'grey.100',
              color: 'text.secondary'
            },
            transition: 'all 0.2s ease-in-out'
          }}
        >
          Entrar
        </Button>

        {emailNotVerified && (
          <Button
            onClick={handleResendVerification}
            fullWidth
            sx={{
              height: '48px',
              borderRadius: '8px',
              backgroundColor: 'white',
              color: 'primary.main',
              fontSize: '1rem',
              fontWeight: 600,
              textTransform: 'none',
              mb: 3,
              border: '2px solid',
              borderColor: 'primary.main',
              '&:hover': {
                backgroundColor: 'grey.50'
              }
            }}
          >
            Reenviar email de verificação
          </Button>
        )}

        <Typography
          sx={{
            fontSize: '0.875rem',
            color: 'text.secondary',
            textAlign: 'center'
          }}
        >
          Não tem uma conta?{' '}
          <Typography
            component='span'
            onClick={() => {
              setIsSignIn(false);
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
            Cadastre-se
          </Typography>
        </Typography>
      </form>
    </Box>
  );
};

export default SignIn;
