import { zodResolver } from '@hookform/resolvers/zod';
import { Box, Button, Checkbox, FormControlLabel, Grid, Paper, TextField, Typography, InputAdornment, IconButton } from '@mui/material';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { PrivacyPolicyModal, useNotification } from '@/components';
import type { RegisterDto } from '@/globals/types/User';
import { useAuth } from '@/hooks';
import PersonIcon from '@mui/icons-material/Person';
import LockIcon from '@mui/icons-material/Lock';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';

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
  const { signUp } = useAuth();
  const { showNotification } = useNotification();

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
      // biome-ignore lint/suspicious/noExplicitAny: <TODO: create error type>
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
    formState: { errors, isDirty }
  } = useForm<z.infer<typeof authSchema>>({
    resolver: zodResolver(authSchema)
  });

  return (
    <Box>
      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Cabeçalho */}
        <Box sx={{ mb: 4, textAlign: 'center' }}>
          <VerifiedUserIcon
            sx={{
              fontSize: '4rem',
              color: '#1877F2',
              mb: 2,
              display: 'block',
              mx: 'auto'
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
            Crie sua Conta
          </Typography>
          <Typography 
            sx={{ 
              color: '#6C757D',
              fontSize: '1rem'
            }}
          >
            Preencha os campos abaixo para se cadastrar.
          </Typography>
        </Box>
        {/* Seção de Informações Pessoais */}
        <Box sx={{ mb: 4 }}>
          <Typography
            variant="h6"
            sx={{
              fontSize: '1.125rem',
              fontWeight: 600,
              color: '#212529',
              mb: 2
            }}
          >
            Informações Pessoais
          </Typography>
          
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Typography
                variant='body2'
                sx={{ 
                  mb: 1, 
                  fontWeight: 500,
                  color: '#495057',
                  fontSize: '0.875rem'
                }}
              >
                Nome
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
                      placeholder='Seu nome'
                      onFocus={() => clearErrors('name')}
                      sx={{
                        width: '100%',
                        '& .MuiOutlinedInput-root': {
                          height: '44px',
                          borderRadius: '8px',
                          backgroundColor: 'white',
                          '& fieldset': {
                            borderColor: errors.name ? '#DC3545' : '#CED4DA',
                            borderWidth: '1px'
                          },
                          '&:hover fieldset': {
                            borderColor: errors.name ? '#DC3545' : '#ADB5BD'
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: '#1877F2',
                            borderWidth: '2px'
                          }
                        },
                        '& .MuiInputBase-input': {
                          padding: '8px 12px',
                          fontSize: '0.875rem',
                          '&::placeholder': {
                            color: '#6C757D',
                            opacity: 1
                          }
                        }
                      }}
                    />
                    {errors.name && (
                      <Typography 
                        sx={{ 
                          color: '#DC3545', 
                          fontSize: '0.75rem',
                          mt: 0.5,
                          ml: 1
                        }}
                      >
                        {errors.name.message}
                      </Typography>
                    )}
                  </Box>
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography
                variant='body2'
                sx={{ 
                  mb: 1, 
                  fontWeight: 500,
                  color: '#495057',
                  fontSize: '0.875rem'
                }}
              >
                Sobrenome
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
                      placeholder='Seu sobrenome'
                      onFocus={() => clearErrors('lastName')}
                      sx={{
                        width: '100%',
                        '& .MuiOutlinedInput-root': {
                          height: '44px',
                          borderRadius: '8px',
                          backgroundColor: 'white',
                          '& fieldset': {
                            borderColor: errors.lastName ? '#DC3545' : '#CED4DA',
                            borderWidth: '1px'
                          },
                          '&:hover fieldset': {
                            borderColor: errors.lastName ? '#DC3545' : '#ADB5BD'
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: '#1877F2',
                            borderWidth: '2px'
                          }
                        },
                        '& .MuiInputBase-input': {
                          padding: '8px 12px',
                          fontSize: '0.875rem',
                          '&::placeholder': {
                            color: '#6C757D',
                            opacity: 1
                          }
                        }
                      }}
                    />
                    {errors.lastName && (
                      <Typography 
                        sx={{ 
                          color: '#DC3545', 
                          fontSize: '0.75rem',
                          mt: 0.5,
                          ml: 1
                        }}
                      >
                        {errors.lastName.message}
                      </Typography>
                    )}
                  </Box>
                )}
              />
            </Grid>
          </Grid>
        </Box>
        {/* Seção de Informações de Acesso */}
        <Box sx={{ mb: 4 }}>
          <Typography
            variant="h6"
            sx={{
              fontSize: '1.125rem',
              fontWeight: 600,
              color: '#212529',
              mb: 2
            }}
          >
            Informações de Acesso
          </Typography>
          
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
                    sx={{
                      width: '100%',
                      '& .MuiOutlinedInput-root': {
                        height: '44px',
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
                        padding: '8px 12px',
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
          {/* Campos de Senha */}
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
              Senha
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
                    placeholder='Crie uma senha forte'
                    onFocus={() => clearErrors('password')}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowPassword(!showPassword)}
                            edge="end"
                            sx={{ color: '#6C757D' }}
                          >
                            {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      width: '100%',
                      '& .MuiOutlinedInput-root': {
                        height: '44px',
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
                        padding: '8px 12px',
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
              Confirmar Senha
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
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            edge="end"
                            sx={{ color: '#6C757D' }}
                          >
                            {showConfirmPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      width: '100%',
                      '& .MuiOutlinedInput-root': {
                        height: '44px',
                        borderRadius: '8px',
                        backgroundColor: 'white',
                        '& fieldset': {
                          borderColor: errors.confirmPassword ? '#DC3545' : '#CED4DA',
                          borderWidth: '1px'
                        },
                        '&:hover fieldset': {
                          borderColor: errors.confirmPassword ? '#DC3545' : '#ADB5BD'
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#1877F2',
                          borderWidth: '2px'
                        }
                      },
                      '& .MuiInputBase-input': {
                        padding: '8px 12px',
                        fontSize: '0.875rem',
                        '&::placeholder': {
                          color: '#6C757D',
                          opacity: 1
                        }
                      }
                    }}
                  />
                  {errors.confirmPassword && (
                    <Typography 
                      sx={{ 
                        color: '#DC3545', 
                        fontSize: '0.75rem',
                        mt: 0.5,
                        ml: 1
                      }}
                    >
                      {errors.confirmPassword.message}
                    </Typography>
                  )}
                </Box>
              )}
            />
          </Box>
        </Box>
        {/* Seção de Termos e Condições */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
            <Checkbox
              checked={acceptedTerms}
              onChange={(e) => setAcceptedTerms(e.target.checked)}
              sx={{
                mt: 0.5,
                '&.Mui-checked': {
                  color: '#1877F2'
                }
              }}
            />
            <Typography
              variant='body2'
              sx={{ 
                fontSize: '0.875rem',
                color: '#6C757D',
                lineHeight: 1.5
              }}
            >
              Li e aceito a{' '}
              <Typography
                component='span'
                onClick={() => setPrivacyModalOpen(true)}
                sx={{
                  color: '#1877F2',
                  textDecoration: 'underline',
                  cursor: 'pointer',
                  fontWeight: 500,
                  '&:hover': {
                    textDecoration: 'none'
                  }
                }}
              >
                política de privacidade
              </Typography>
              {' '}e os{' '}
              <Typography
                component='span'
                sx={{
                  color: '#1877F2',
                  textDecoration: 'underline',
                  cursor: 'pointer',
                  fontWeight: 500,
                  '&:hover': {
                    textDecoration: 'none'
                  }
                }}
              >
                termos de uso
              </Typography>
              {' '}do sistema.
            </Typography>
          </Box>
        </Box>

        {/* Botão de Cadastro */}
        <Button
          disabled={!isDirty || !acceptedTerms}
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
          Criar conta
        </Button>

        {/* Link para Login */}
        <Typography
          sx={{
            fontSize: '0.875rem',
            color: '#6C757D',
            textAlign: 'center'
          }}
        >
          Já possui uma conta?{' '}
          <Typography
            component='span'
            onClick={() => {
              setIsSignIn(true);
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
            Entrar
          </Typography>
        </Typography>
      </form>
      <PrivacyPolicyModal
        open={privacyModalOpen}
        onClose={() => setPrivacyModalOpen(false)}
      />
    </Box>
  );
};

export default CreateAccount;
