import { Box, Button, Checkbox, FormControlLabel, Grid, Paper, TextField, Typography } from '@mui/material';
import { Controller, useForm } from 'react-hook-form';
import { PrivacyPolicyModal, useNotification } from '@/components';

import type { RegisterDto } from '@/globals/types/User';
import { useAuth } from '@/hooks';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

type Props = {
  setIsSignIn: (value: boolean) => void;
};

const authSchema = z
  .object({
    name: z
      .string()
      .min(2, 'O nome deve ter pelo menos 2 caracteres')
      .max(100, 'O nome deve ter no máximo 100 caracteres'),
    lastName: z
      .string()
      .min(2, 'O sobrenome deve ter pelo menos 2 caracteres')
      .max(100, 'O sobrenome deve ter no máximo 100 caracteres'),
    email: z.email('Email não é válido'),
    password: z
      .string()
      .min(8, 'A senha deve ter pelo menos 8 caracteres')
      .max(25, 'A senha deve ter no máximo 25 caracteres')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
        'Senha deve conter pelo menos uma letra maiúscula, uma minúscula, um número e um caractere especial'
      ),
    confirmPassword: z
      .string()
      .min(8, 'A senha deve ter pelo menos 8 caracteres')
      .max(25, 'A senha deve ter no máximo 25 caracteres')
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'As senhas não coincidem',
    path: ['confirmPassword']
  });

const CreateAccount = ({ setIsSignIn }: Props) => {
  const { signUp, checkIfUserExists } = useAuth();
  const { showNotification } = useNotification();
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [privacyModalOpen, setPrivacyModalOpen] = useState(false);

  const onSubmit = async (formData: z.infer<typeof authSchema>) => {
    try {
      const registerData: RegisterDto = {
        firstName: formData.name,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password
      };
      
      await signUp(registerData);
      
      showNotification('Conta criada com sucesso! Faça login para continuar.', 'success');
      setIsSignIn(true);
    } catch (error: any) {
      console.error('Erro ao criar conta:', error);
      
      const status = error.response?.status;
      
      if (status === 409) {
        showNotification('Este email já está em uso. Tente outro email.', 'error');
      } else if (status === 400) {
        showNotification('Dados inválidos. Verifique os campos e tente novamente.', 'error');
      } else if (error.code === 'ERR_NETWORK' || status === 0) {
        showNotification('Erro de conexão. Verifique sua internet e tente novamente.', 'error');
      } else {
        showNotification('Erro ao criar conta. Tente novamente.', 'error');
      }
    }
  };

  const {
    control,
    handleSubmit,
    clearErrors,
    setError,
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
                  Criar Conta
                </Typography>
                <Typography sx={{ color: 'text.secondary' }}>Digite seus dados para continuar.</Typography>
              </Grid>
              <Grid>
                <Typography variant='body2' sx={{ mb: 1, fontWeight: 'bold' }}>
                  Nome <span style={{ color: 'red' }}>*</span>
                </Typography>
                <Controller
                  name='name'
                  control={control}
                  defaultValue=''
                  render={({ field }) => (
                    <Box>
                      <TextField
                        {...field}
                        type='text'
                        placeholder='Digite seu nome'
                        onFocus={() => clearErrors('name')}
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
                            borderColor: errors.name ? 'red' : '#ccc'
                          }
                        }}
                      />
                      {errors.name && <span style={{ color: 'red', fontSize: '12px' }}>{errors.name.message}</span>}
                    </Box>
                  )}
                />
              </Grid>
              <Grid>
                <Typography variant='body2' sx={{ mb: 1, fontWeight: 'bold' }}>
                  Sobrenome <span style={{ color: 'red' }}>*</span>
                </Typography>
                <Controller
                  name='lastName'
                  control={control}
                  defaultValue=''
                  render={({ field }) => (
                    <Box>
                      <TextField
                        {...field}
                        type='text'
                        placeholder='Digite seu sobrenome'
                        onFocus={() => clearErrors('lastName')}
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
                            borderColor: errors.lastName ? 'red' : '#ccc'
                          }
                        }}
                      />
                      {errors.lastName && (
                        <span style={{ color: 'red', fontSize: '12px' }}>{errors.lastName.message}</span>
                      )}
                    </Box>
                  )}
                />
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
                        onBlur={async (e) => {
                          const email = e.target.value;
                          if (email && email.length > 0) {
                            const exists = await checkIfUserExists(email);
                            if (exists) {
                              setError('email', { type: 'manual', message: 'Este email já está em uso' });
                            }
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
                      {errors.email && <span style={{ color: 'red', fontSize: '12px' }}>{errors.email.message}</span>}
                    </Box>
                  )}
                />
              </Grid>
              <Grid>
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
              </Grid>
              <Grid>
                <Typography variant='body2' sx={{ mb: 1, fontWeight: 'bold' }}>
                  Confirmar Senha <span style={{ color: 'red' }}>*</span>
                </Typography>
                <Controller
                  name='confirmPassword'
                  control={control}
                  defaultValue=''
                  render={({ field }) => (
                    <Box>
                      <TextField
                        {...field}
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder='Confirme sua senha'
                        onFocus={() => clearErrors('confirmPassword')}
                        slotProps={{
                          input: {
                            onFocus: () => clearErrors('confirmPassword'),
                            endAdornment: (
                              <Button
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                sx={{ textTransform: 'none', fontSize: '12px' }}
                              >
                                {showConfirmPassword ? 'Esconder' : 'Mostrar'}
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
                            borderColor: errors.confirmPassword ? 'red' : '#ccc'
                          }
                        }}
                      />
                      {errors.confirmPassword && (
                        <span style={{ color: 'red', fontSize: '12px' }}>{errors.confirmPassword.message}</span>
                      )}
                    </Box>
                  )}
                />
              </Grid>
              <Grid>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={acceptedTerms}
                      onChange={(e) => setAcceptedTerms(e.target.checked)}
                      sx={{
                        '&.Mui-checked': {
                          color: 'hsl(262 83% 58%)'
                        }
                      }}
                    />
                  }
                  label={
                    <Typography variant='body2' sx={{ fontSize: '14px' }}>
                      Li e aceito a{' '}
                      <Typography
                        component='span'
                        onClick={() => setPrivacyModalOpen(true)}
                        sx={{
                          color: 'primary.main',
                          textDecoration: 'underline',
                          cursor: 'pointer',
                          '&:hover': {
                            textDecoration: 'none'
                          }
                        }}
                      >
                        política de privacidade
                      </Typography>
                    </Typography>
                  }
                />
              </Grid>
              <Grid>
                <Button
                  disabled={!isDirty || !acceptedTerms}
                  type='submit'
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: '4px',
                    border: 'none',
                    background: 'linear-gradient(135deg, hsl(262 83% 58%), hsl(224 71% 59%))',
                    color: '#fff',
                    cursor: 'pointer',
                    opacity: !isDirty || !acceptedTerms ? 0.5 : 1
                  }}
                >
                  Enviar
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
                  Já possui uma conta?{' '}
                  <Typography
                    component='a'
                    onClick={() => {
                      setIsSignIn(true);
                    }}
                    sx={{
                      fontSize: '14px',
                      color: 'primary.main',
                      textDecoration: 'none',
                      cursor: 'pointer',
                      '&:hover': {
                        textDecoration: 'underline'
                      }
                    }}
                  >
                    Entrar
                  </Typography>
                </Typography>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </form>
      <PrivacyPolicyModal
        open={privacyModalOpen}
        onClose={() => setPrivacyModalOpen(false)}
      />
    </Paper>
  );
};

export default CreateAccount;
