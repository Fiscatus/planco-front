import { Visibility, VisibilityOff } from '@mui/icons-material';
import { Box, Button, CircularProgress, IconButton, InputAdornment, Link, TextField, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AuthSplitLayout } from '@/components/auth';
import { api } from '@/services';

const inputSx = (hasError = false) => ({
  width: '100%',
  '& .MuiOutlinedInput-root': {
    height: '52px',
    borderRadius: '10px',
    backgroundColor: 'white',
    '& fieldset': { borderColor: hasError ? '#ef4444' : '#E5E7EB', borderWidth: '1.5px' },
    '&:hover fieldset': { borderColor: hasError ? '#ef4444' : '#D1D5DB' },
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

const headlineSx = {
  fontFamily: "'Plus Jakarta Sans', sans-serif",
  fontWeight: 600,
  fontSize: { xs: '2rem', sm: '2.25rem', md: '2.5rem', lg: '3.25rem' },
  color: '#0B1220',
  lineHeight: 1.1,
  letterSpacing: '-0.03em',
  mb: 1
};

const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') ?? '';

  const [tokenValid, setTokenValid] = useState<boolean | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) {
      setTokenValid(false);
      return;
    }
    api
      .get(`/auth/reset-password/validate?token=${encodeURIComponent(token)}`)
      .then(() => setTokenValid(true))
      .catch(() => setTokenValid(false));
  }, [token]);

  const passwordStrength = (() => {
    if (!newPassword) return null;
    if (newPassword.length < 8) return { label: 'Fraca', color: '#ef4444', width: '33%' };
    if (newPassword.length < 12 || !/[^a-zA-Z0-9]/.test(newPassword))
      return { label: 'Média', color: '#f59e0b', width: '66%' };
    return { label: 'Forte', color: '#16a34a', width: '100%' };
  })();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError('As senhas não coincidem.');
      return;
    }
    if (newPassword.length < 8) {
      setError('A senha deve ter pelo menos 8 caracteres.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await api.post('/auth/reset-password', { token, newPassword, confirmPassword });
      setDone(true);
    } catch (err: any) {
      setError(err.message || 'Erro ao redefinir senha. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const eyeAdornment = (show: boolean, toggle: () => void) => (
    <InputAdornment position='end'>
      <IconButton
        size='small'
        onClick={toggle}
        edge='end'
        tabIndex={-1}
        sx={{ color: '#9CA3AF' }}
      >
        {show ? <VisibilityOff sx={{ fontSize: 18 }} /> : <Visibility sx={{ fontSize: 18 }} />}
      </IconButton>
    </InputAdornment>
  );

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
        width={15}
        height={15}
        viewBox='0 0 24 24'
        fill='none'
        stroke='currentColor'
        strokeWidth={2}
        strokeLinecap='round'
        strokeLinejoin='round'
      >
        <path d='M19 12H5M12 19l-7-7 7-7' />
      </Box>
      Voltar ao login
    </Box>
  );

  return (
    <AuthSplitLayout topRightSlot={topRightSlot}>
      {/* Validando token */}
      {tokenValid === null && (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 3 }}>
          <Box sx={{ mb: 5 }}>
            <Typography
              component='h1'
              sx={headlineSx}
            >
              Verificando{' '}
              <Box
                component='em'
                sx={{ fontWeight: 300, fontStyle: 'italic', color: '#1d4ed8', fontSize: 'inherit' }}
              >
                link.
              </Box>
            </Typography>
            <Typography sx={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '0.9375rem', color: '#6B7280' }}>
              Aguarde enquanto validamos seu link de redefinição.
            </Typography>
          </Box>
          <CircularProgress
            size={36}
            sx={{ color: '#1d4ed8' }}
          />
        </Box>
      )}

      {/* Token inválido/expirado */}
      {tokenValid === false && (
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
            <Box
              component='svg'
              width={28}
              height={28}
              viewBox='0 0 24 24'
              fill='none'
              stroke='#dc2626'
              strokeWidth={1.75}
              strokeLinecap='round'
              strokeLinejoin='round'
            >
              <circle
                cx='12'
                cy='12'
                r='10'
              />
              <line
                x1='12'
                y1='8'
                x2='12'
                y2='12'
              />
              <line
                x1='12'
                y1='16'
                x2='12.01'
                y2='16'
              />
            </Box>
          </Box>
          <Typography
            component='h1'
            sx={{ ...headlineSx, mb: 1 }}
          >
            Link{' '}
            <Box
              component='em'
              sx={{ fontWeight: 300, fontStyle: 'italic', color: '#1d4ed8', fontSize: 'inherit' }}
            >
              expirado.
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
            Este link de redefinição não é mais válido. Solicite um novo link para continuar.
          </Typography>
          <Button
            onClick={() => navigate('/auth/forgot-password')}
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
            Solicitar novo link
          </Button>
        </Box>
      )}

      {/* Senha redefinida com sucesso */}
      {done && (
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
            <Box
              component='svg'
              width={28}
              height={28}
              viewBox='0 0 24 24'
              fill='none'
              stroke='#16a34a'
              strokeWidth={1.75}
              strokeLinecap='round'
              strokeLinejoin='round'
            >
              <path d='M22 11.08V12a10 10 0 1 1-5.93-9.14' />
              <polyline points='22 4 12 14.01 9 11.01' />
            </Box>
          </Box>
          <Typography
            component='h1'
            sx={{ ...headlineSx, mb: 1 }}
          >
            Senha{' '}
            <Box
              component='em'
              sx={{ fontWeight: 300, fontStyle: 'italic', color: '#1d4ed8', fontSize: 'inherit' }}
            >
              redefinida!
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
            Sua senha foi alterada com sucesso. Faça login com a nova senha.
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

      {/* Formulário de redefinição */}
      {tokenValid === true && !done && (
        <Box>
          <Box sx={{ mb: 5 }}>
            <Typography
              component='h1'
              sx={headlineSx}
            >
              Redefinir{' '}
              <Box
                component='em'
                sx={{ fontWeight: 300, fontStyle: 'italic', color: '#1d4ed8', fontSize: 'inherit' }}
              >
                senha.
              </Box>
            </Typography>
            <Typography sx={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '0.9375rem', color: '#6B7280' }}>
              Crie uma nova senha forte para sua conta.
            </Typography>
          </Box>

          <form onSubmit={handleSubmit}>
            <Box sx={{ mb: 2.5 }}>
              <Typography sx={labelSx}>Nova senha</Typography>
              <TextField
                fullWidth
                type={showNew ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  setError('');
                }}
                InputProps={{ endAdornment: eyeAdornment(showNew, () => setShowNew((v) => !v)) }}
                sx={inputSx()}
              />
              {passwordStrength && (
                <Box sx={{ mt: 1 }}>
                  <Box sx={{ height: 4, borderRadius: 2, bgcolor: '#E5E7EB', overflow: 'hidden' }}>
                    <Box
                      sx={{
                        height: '100%',
                        width: passwordStrength.width,
                        bgcolor: passwordStrength.color,
                        borderRadius: 2,
                        transition: 'width 0.3s'
                      }}
                    />
                  </Box>
                  <Typography sx={{ fontSize: '0.75rem', color: passwordStrength.color, fontWeight: 600, mt: 0.5 }}>
                    Força: {passwordStrength.label}
                  </Typography>
                </Box>
              )}
            </Box>

            <Box sx={{ mb: 3 }}>
              <Typography sx={labelSx}>Confirmar nova senha</Typography>
              <TextField
                fullWidth
                type={showConfirm ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  setError('');
                }}
                error={!!confirmPassword && confirmPassword !== newPassword}
                helperText={!!confirmPassword && confirmPassword !== newPassword ? 'As senhas não coincidem' : ''}
                InputProps={{ endAdornment: eyeAdornment(showConfirm, () => setShowConfirm((v) => !v)) }}
                sx={inputSx(!!confirmPassword && confirmPassword !== newPassword)}
              />
            </Box>

            {error && (
              <Box
                sx={{ bgcolor: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '10px', px: 2, py: 1.25, mb: 2.5 }}
              >
                <Typography
                  sx={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '0.8125rem', color: '#dc2626' }}
                >
                  {error}
                </Typography>
              </Box>
            )}

            <Button
              type='submit'
              fullWidth
              disabled={loading || !newPassword || !confirmPassword || newPassword !== confirmPassword}
              sx={{
                height: '54px',
                borderRadius: '12px',
                backgroundColor: '#1d4ed8',
                color: 'white',
                fontSize: '0.9375rem',
                fontWeight: 600,
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                textTransform: 'none',
                mb: 3,
                boxShadow: '0 14px 30px -12px rgba(29,78,216,0.5), inset 0 1px 0 rgba(255,255,255,0.12)',
                '&:hover:not(:disabled)': { backgroundColor: '#1e40af' },
                '&:disabled': { backgroundColor: '#E5E7EB', color: '#9CA3AF', boxShadow: 'none' }
              }}
            >
              {loading ? (
                <CircularProgress
                  size={20}
                  sx={{ color: 'white' }}
                />
              ) : (
                'Redefinir senha'
              )}
            </Button>
          </form>

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

export default ResetPasswordPage;
