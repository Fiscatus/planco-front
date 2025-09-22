import { Box, Button, Grid, Link, Paper, TextField, Typography } from '@mui/material';
import { Controller, useForm } from 'react-hook-form';

import type { LoginDto } from '@/globals/types/User';
import { useAuth } from '@/hooks';
import { useNavigate } from 'react-router-dom';
import { useNotification } from '@/components';
import { useState } from 'react';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

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
  const { signIn } = useAuth();
  const { showNotification } = useNotification();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(true);

  const onSubmit = async (credentials: LoginDto) => {
    try {
      await signIn(credentials);
      showNotification('Login realizado com sucesso!', 'success');
    } catch (error: any) {
      console.error('Erro ao fazer login:', error);
      
      const status = error.response?.status;
      
      if (status === 401) {
        showNotification('Email ou senha incorretos. Tente novamente.', 'error');
      } else if (status === 400) {
        showNotification('Dados inválidos. Verifique os campos e tente novamente.', 'error');
      } else if (error.code === 'ERR_NETWORK' || status === 0) {
        showNotification('Erro de conexão. Verifique sua internet e tente novamente.', 'error');
      } else {
        showNotification('Erro ao fazer login. Tente novamente.', 'error');
      }
    }
  };

  const {
    control,
    handleSubmit,
    clearErrors,
    formState: { errors, isDirty }
  } = useForm<z.infer<typeof authSchema>>({ resolver: zodResolver(authSchema) });

  return (
    <Paper
      sx={{
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12), 0 4px 16px rgba(0, 0, 0, 0.08)',
        borderRadius: '12px'
      }}
    >
      <form onSubmit={handleSubmit(onSubmit)}>
        <Grid
          container
          sx={{
            borderRadius: '0.5rem'
          }}
        >
          <Grid
            size={12}
            sx={{ p: 4 }}
          >
            <Grid
              container
              direction='column'
              spacing={4}
            >
              <Grid>
                <Typography
                  variant='h5'
                  component='h2'
                  fontWeight={600}
                >
                  Bem-vindo de volta!
                </Typography>
                <Typography sx={{ color: 'text.secondary' }}>Entre na sua conta para continuar.</Typography>
              </Grid>
              <Grid>
              <Typography variant='body2' sx={{ mb: 1, fontWeight: 'bold' }}>
                  Email <span style={{ color: 'red' }}>*</span>
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
                        placeholder='Digite seu email'
                        onFocus={() => clearErrors('email')}
                        sx={{
                          width: '100%',
                          height: '40px',
                          p: 0,
                          '& .MuiInputBase-input': {
                            height: '40px',
                            boxSizing: 'border-box',
                            padding: '10px'
                          },
                          '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: errors.password ? 'red' : '#ccc'
                          }
                        }}
                      />
                      {errors.email && <span style={{ color: 'red', fontSize: '12px' }}>{errors.email.message}</span>}
                    </Box>
                  )}
                />
              </Grid>
              <Grid
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px'
                }}
              >
                <Typography variant='body2' sx={{ mb: 1, fontWeight: 'bold' }}>
                  Senha <span style={{ color: 'red' }}>*</span>
                </Typography>
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
                        slotProps={{
                          input: {
                            onFocus: () => clearErrors('password'),
                            endAdornment: (
                              <Button
                                onClick={() => setShowPassword(!showPassword)}
                                sx={{ textTransform: 'none', fontSize: '12px' }}
                              >
                                {showPassword ? 'Esconder' : 'Mostrar'}
                              </Button>
                            )
                          }
                        }}
                        sx={{
                          width: '100%',
                          height: '40px',
                          p: 0,
                          '& .MuiInputBase-input': {
                            height: '40px',
                            boxSizing: 'border-box',
                            padding: '10px'
                          },
                          '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: errors.password ? 'red' : '#ccc'
                          }
                        }}
                      />
                      {errors.password && (
                        <span style={{ color: 'red', fontSize: '12px' }}>{errors.password.message}</span>
                      )}
                    </Box>
                  )}
                />
                <Link
                  href='/auth/forgot-password'
                  sx={{
                    fontSize: '12px',
                    color: 'primary.main',
                    textDecoration: 'none',
                    textAlign: 'right',
                    alignSelf: 'flex-end',
                    '&:hover': {
                      textDecoration: 'underline'
                    }
                  }}
                >
                  Esqueceu sua senha?
                </Link>
              </Grid>
              <Grid>
                <Button
                  disabled={!isDirty}
                  type='submit'
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: '4px',
                    border: 'none',
                    background: 'linear-gradient(135deg, hsl(262 83% 58%), hsl(224 71% 59%))',
                    color: '#fff',
                    cursor: 'pointer',
                    opacity: !isDirty ? 0.5 : 1
                  }}
                >
                  Entrar
                </Button>
              </Grid>
              <Grid>
                <Typography
                  sx={{
                    fontSize: '14px',
                    color: 'text.secondary',
                    textAlign: 'center'
                  }}
                >
                  Não tem uma conta?{' '}
                  <Typography
                    component='a'
                    onClick={() => {
                      setIsSignIn(false);
                    }}
                    sx={{
                      fontSize: '14px',
                      color: 'primary.main',
                      textDecoration: 'none',
                      '&:hover': {
                        textDecoration: 'underline'
                      }
                    }}
                  >
                    Cadastre-se
                  </Typography>
                </Typography>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </form>
    </Paper>
  );
};

export default SignIn;
