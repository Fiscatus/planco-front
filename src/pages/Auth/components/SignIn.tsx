import { Box, Button, Link, TextField, Typography, InputAdornment, IconButton } from '@mui/material';
import { Controller, useForm } from 'react-hook-form';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import type { LoginDto } from '@/globals/types/User';
import { useNotification } from '@/components';
import { useAuth } from '@/hooks';
import PersonIcon from '@mui/icons-material/Person';
import LockIcon from '@mui/icons-material/Lock';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
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

  const onSubmit = async (credentials: LoginDto) => {
    try {
      await signIn(credentials);
      showNotification('Login realizado com sucesso!', 'success');

      setShouldRedirectAfterLogin(true);
    } catch (error: unknown) {
      console.error('Erro ao fazer login:', error);

      if (error instanceof Error && error.message) {
        showNotification(error.message, 'error');
      } else {
        showNotification('Erro ao fazer login. Tente novamente.', 'error');
      }
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
            alt="Planco Logo" 
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
              color: '#212529',
              mb: 1,
              fontSize: { xs: '1.75rem', sm: '2rem' }
            }}
          >
            Acesso ao Sistema
          </Typography>
          <Typography
            sx={{
              color: '#6C757D',
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
              color: '#495057',
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
                        <PersonIcon sx={{ color: '#6C757D' }} />
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
                        borderColor: errors.email ? '#DC3545' : '#CED4DA',
                        borderWidth: '1px'
                      },
                      '&:hover fieldset': {
                        borderColor: errors.email ? '#DC3545' : '#ADB5BD'
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#1877F2',
                        borderWidth: '2px'
                      }
                    },
                    '& .MuiInputBase-input': {
                      padding: '12px 14px',
                      fontSize: '0.875rem',
                      '&::placeholder': {
                        color: '#6C757D',
                        opacity: 1
                      }
                    }
                  }}
                />
                {errors.email && (
                  <Typography
                    sx={{
                      color: '#DC3545',
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
                color: '#495057',
                fontSize: '0.875rem'
              }}
            >
              Senha
            </Typography>
            <Link
              href='/auth/forgot-password'
              sx={{
                fontSize: '0.875rem',
                color: '#1877F2',
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
                        <LockIcon sx={{ color: '#6C757D' }} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position='end'>
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge='end'
                          sx={{ color: '#6C757D' }}
                        >
                          {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
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
                        borderColor: errors.password ? '#DC3545' : '#CED4DA',
                        borderWidth: '1px'
                      },
                      '&:hover fieldset': {
                        borderColor: errors.password ? '#DC3545' : '#ADB5BD'
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#1877F2',
                        borderWidth: '2px'
                      }
                    },
                    '& .MuiInputBase-input': {
                      padding: '12px 14px',
                      fontSize: '0.875rem',
                      '&::placeholder': {
                        color: '#6C757D',
                        opacity: 1
                      }
                    }
                  }}
                />
                {errors.password && (
                  <Typography
                    sx={{
                      color: '#DC3545',
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
          disabled={!isDirty}
          type='submit'
          fullWidth
          sx={{
            height: '48px',
            borderRadius: '8px',
            backgroundColor: '#1877F2',
            color: 'white',
            fontSize: '1rem',
            fontWeight: 600,
            textTransform: 'none',
            mb: 3,
            '&:hover': {
              backgroundColor: '#166FE5'
            },
            '&:disabled': {
              backgroundColor: '#E9ECEF',
              color: '#6C757D'
            },
            transition: 'all 0.2s ease-in-out'
          }}
        >
          Entrar
        </Button>

        <Typography
          sx={{
            fontSize: '0.875rem',
            color: '#6C757D',
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
              color: '#1877F2',
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
