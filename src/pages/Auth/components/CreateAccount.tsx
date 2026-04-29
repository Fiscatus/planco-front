import { zodResolver } from '@hookform/resolvers/zod';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import {
  Box,
  Button,
  Checkbox,
  CircularProgress,
  Grid,
  IconButton,
  InputAdornment,
  TextField,
  Typography
} from '@mui/material';
import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { PrivacyPolicyModal, TermsOfUseModal, useNotification } from '@/components';
import type { RegisterDto } from '@/globals/types/User';
import { useAuth } from '@/hooks';

type Props = {
  setIsSignIn: (value: boolean) => void;
  setRegistrationSuccess: (value: boolean) => void;
  setRegisteredEmail: (email: string) => void;
};

const formatCPF = (value: string) => {
  const numbers = value.replace(/\D/g, '');

  if (numbers.length <= 3) {
    return numbers;
  }
  if (numbers.length <= 6) {
    return `${numbers.slice(0, 3)}.${numbers.slice(3)}`;
  }
  if (numbers.length <= 9) {
    return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6)}`;
  }
  return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6, 9)}-${numbers.slice(9, 11)}`;
};

const formatPhone = (value: string) => {
  const numbers = value.replace(/\D/g, '');

  if (numbers.length <= 2) {
    return numbers;
  }
  if (numbers.length <= 7) {
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
  }
  return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
};

const authSchema = z
  .object({
    name: z.string().min(2, 'Mínimo de 2 caracteres').max(100, 'Máximo 100 caracteres'),
    lastName: z.string().min(2, 'Mínimo de 2 caracteres').max(100, 'Máximo 100 caracteres'),
    email: z.email('Email não é válido'),
    cpf: z
      .string()
      .min(14, 'CPF deve ter 11 caracteres')
      .max(14, 'CPF deve ter 11 caracteres')
      .regex(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/, 'CPF deve estar no formato 000.000.000-00'),
    phone: z
      .string()
      .min(15, 'Telefone deve ter 11 caracteres')
      .max(15, 'Telefone deve ter 11 caracteres')
      .regex(/^\(\d{2}\)\s\d{5}-\d{4}$/, 'Telefone deve estar no formato (XX) XXXXX-XXXX'),
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

const inputSx = (hasError: boolean) => ({
  width: '100%',
  '& .MuiOutlinedInput-root': {
    height: '48px',
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
    padding: '12px 14px',
    fontSize: '0.875rem',
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    '&::placeholder': { color: '#9CA3AF', opacity: 1 }
  }
});

const labelSx = {
  fontFamily: "'Plus Jakarta Sans', sans-serif",
  fontSize: '0.8125rem',
  fontWeight: 500,
  color: '#374151',
  mb: 0.75,
  display: 'block'
};

const errorSx = { color: '#ef4444', fontSize: '0.75rem', mt: 0.5, ml: 0.5 };

const CreateAccount = ({ setIsSignIn: _setIsSignIn, setRegistrationSuccess, setRegisteredEmail }: Props) => {
  const { signUp } = useAuth();
  const { showNotification } = useNotification();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [privacyModalOpen, setPrivacyModalOpen] = useState(false);
  const [termsModalOpen, setTermsModalOpen] = useState(false);

  const { mutate: signUpMutation, isPending: signingUp } = useMutation({
    mutationFn: async (registerData: RegisterDto) => {
      return await signUp(registerData);
    },
    onError: (error: any) => {
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
    },
    onSuccess: (_data, variables) => {
      setRegisteredEmail(variables.email);
      setRegistrationSuccess(true);
      showNotification('Conta criada! Verifique seu email para ativar.', 'success');
    }
  });

  const onSubmit = (formData: z.infer<typeof authSchema>) => {
    const registerData: RegisterDto = {
      firstName: formData.name,
      lastName: formData.lastName,
      email: formData.email,
      password: formData.password,
      cpf: formData.cpf,
      phone: formData.phone.replace(/\D/g, '')
    };

    signUpMutation(registerData);
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
      {/* Headline */}
      <Box sx={{ mb: 4 }}>
        <Typography
          component='h1'
          sx={{
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontWeight: 600,
            fontSize: { xs: '1.875rem', sm: '2.125rem', md: '2.375rem', lg: '3rem' },
            color: '#0B1220',
            lineHeight: 1.1,
            letterSpacing: '-0.03em',
            mb: 1
          }}
        >
          Solicite seu{' '}
          <Box
            component='em'
            sx={{ fontWeight: 300, fontStyle: 'italic', color: '#1d4ed8', fontSize: 'inherit' }}
          >
            acesso.
          </Box>
        </Typography>
        <Typography
          sx={{
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontSize: '0.875rem',
            color: '#6B7280',
            mb: '36px'
          }}
        >
          Validamos sua solicitação em até 1 dia útil.
        </Typography>
      </Box>

      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Row 1: Nome + Sobrenome */}
        <Grid
          container
          spacing={1.5}
          sx={{ mb: 1.5 }}
        >
          <Grid size={{ xs: 12, sm: 6 }}>
            <Typography sx={labelSx}>Nome</Typography>
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
                    sx={inputSx(!!errors.name)}
                  />
                  {errors.name && <Typography sx={errorSx}>{errors.name.message}</Typography>}
                </Box>
              )}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Typography sx={labelSx}>Sobrenome</Typography>
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
                    sx={inputSx(!!errors.lastName)}
                  />
                  {errors.lastName && <Typography sx={errorSx}>{errors.lastName.message}</Typography>}
                </Box>
              )}
            />
          </Grid>
        </Grid>

        {/* Row 2: E-mail (full width) */}
        <Box sx={{ mb: 1.5 }}>
          <Typography sx={labelSx}>E-mail institucional</Typography>
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
                {errors.email && <Typography sx={errorSx}>{errors.email.message}</Typography>}
              </Box>
            )}
          />
        </Box>

        {/* Row 3: CPF + Telefone */}
        <Grid
          container
          spacing={1.5}
          sx={{ mb: 1.5 }}
        >
          <Grid size={{ xs: 12, sm: 6 }}>
            <Typography sx={labelSx}>CPF</Typography>
            <Controller
              name='cpf'
              control={control}
              defaultValue=''
              render={({ field }) => (
                <Box>
                  <TextField
                    {...field}
                    type='text'
                    placeholder='000.000.000-00'
                    onFocus={() => clearErrors('cpf')}
                    onChange={(e) => {
                      const formattedValue = formatCPF(e.target.value);
                      field.onChange(formattedValue);
                    }}
                    inputProps={{ maxLength: 14 }}
                    sx={inputSx(!!errors.cpf)}
                  />
                  {errors.cpf && <Typography sx={errorSx}>{errors.cpf.message}</Typography>}
                </Box>
              )}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Typography sx={labelSx}>Telefone</Typography>
            <Controller
              name='phone'
              control={control}
              defaultValue=''
              render={({ field }) => (
                <Box>
                  <TextField
                    {...field}
                    type='text'
                    placeholder='(11) 99999-9999'
                    onFocus={() => clearErrors('phone')}
                    onChange={(e) => {
                      const formattedValue = formatPhone(e.target.value);
                      field.onChange(formattedValue);
                    }}
                    inputProps={{ maxLength: 15 }}
                    sx={inputSx(!!errors.phone)}
                  />
                  {errors.phone && <Typography sx={errorSx}>{errors.phone.message}</Typography>}
                </Box>
              )}
            />
          </Grid>
        </Grid>

        {/* Row 4: Senha + Confirmar Senha */}
        <Grid
          container
          spacing={1.5}
          sx={{ mb: 2 }}
        >
          <Grid size={{ xs: 12, sm: 6 }}>
            <Typography sx={labelSx}>Senha</Typography>
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
                  {errors.password && <Typography sx={errorSx}>{errors.password.message}</Typography>}
                </Box>
              )}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Typography sx={labelSx}>Confirmar senha</Typography>
            <Controller
              name='confirmPassword'
              control={control}
              defaultValue=''
              render={({ field }) => (
                <Box>
                  <TextField
                    {...field}
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder='Repita a senha'
                    onFocus={() => clearErrors('confirmPassword')}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position='end'>
                          <IconButton
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            edge='end'
                            sx={{ color: '#9CA3AF', '&:hover': { color: '#6B7280' } }}
                          >
                            {showConfirmPassword ? <VisibilityOff fontSize='small' /> : <Visibility fontSize='small' />}
                          </IconButton>
                        </InputAdornment>
                      )
                    }}
                    sx={inputSx(!!errors.confirmPassword)}
                  />
                  {errors.confirmPassword && <Typography sx={errorSx}>{errors.confirmPassword.message}</Typography>}
                </Box>
              )}
            />
          </Grid>
        </Grid>

        {/* Terms */}
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.25, mb: 2.5 }}>
          <Checkbox
            checked={acceptedTerms}
            onChange={(e) => setAcceptedTerms(e.target.checked)}
            sx={{
              p: 0,
              mt: 0.25,
              color: '#E5E7EB',
              borderRadius: '5px',
              '&.Mui-checked': { color: '#1d4ed8' },
              '& .MuiSvgIcon-root': { fontSize: 20, borderRadius: '4px' }
            }}
          />
          <Typography
            sx={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontSize: '0.8125rem',
              color: '#6B7280',
              lineHeight: 1.55
            }}
          >
            Aceito os{' '}
            <Typography
              component='span'
              onClick={() => setTermsModalOpen(true)}
              sx={{ color: '#1d4ed8', fontWeight: 600, cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
            >
              termos de uso
            </Typography>{' '}
            e a{' '}
            <Typography
              component='span'
              onClick={() => setPrivacyModalOpen(true)}
              sx={{ color: '#1d4ed8', fontWeight: 600, cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
            >
              política de privacidade
            </Typography>{' '}
            do sistema.
          </Typography>
        </Box>

        {/* CTA */}
        <Button
          disabled={!isDirty || !acceptedTerms || signingUp}
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
          {signingUp ? (
            <CircularProgress
              size={20}
              sx={{ color: 'white' }}
            />
          ) : (
            <>
              Solicitar acesso
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
      </form>

      <PrivacyPolicyModal
        open={privacyModalOpen}
        onClose={() => setPrivacyModalOpen(false)}
      />
      <TermsOfUseModal
        open={termsModalOpen}
        onClose={() => setTermsModalOpen(false)}
      />
    </Box>
  );
};

export default CreateAccount;
