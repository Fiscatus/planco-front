import { ArrowBackOutlined, CheckCircleOutlined, LockOutlined, Visibility, VisibilityOff } from '@mui/icons-material';
import { Box, Button, CircularProgress, IconButton, InputAdornment, TextField, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '@/services';
import logo from '/assets/isologo.svg';

const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') ?? '';

  const [tokenValid, setTokenValid] = useState<boolean | null>(null); // null = validando
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  // Valida token ao montar
  useEffect(() => {
    if (!token) { setTokenValid(false); return; }
    api.get(`/auth/reset-password/validate?token=${encodeURIComponent(token)}`)
      .then(() => setTokenValid(true))
      .catch(() => setTokenValid(false));
  }, [token]);

  const passwordStrength = (() => {
    if (!newPassword) return null;
    if (newPassword.length < 8) return { label: 'Fraca', color: '#ef4444', width: '33%' };
    if (newPassword.length < 12 || !/[^a-zA-Z0-9]/.test(newPassword)) return { label: 'Média', color: '#f59e0b', width: '66%' };
    return { label: 'Forte', color: '#16a34a', width: '100%' };
  })();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) { setError('As senhas não coincidem.'); return; }
    if (newPassword.length < 8) { setError('A senha deve ter pelo menos 8 caracteres.'); return; }
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
      <IconButton size='small' onClick={toggle} edge='end' tabIndex={-1}>
        {show ? <VisibilityOff sx={{ fontSize: 18 }} /> : <Visibility sx={{ fontSize: 18 }} />}
      </IconButton>
    </InputAdornment>
  );

  const fieldSx = {
    '& .MuiOutlinedInput-root': {
      height: 48, borderRadius: 2,
      '& fieldset': { borderColor: '#CED4DA' },
      '&:hover fieldset': { borderColor: '#ADB5BD' },
      '&.Mui-focused fieldset': { borderColor: '#1877F2', borderWidth: 2 }
    },
    '& .MuiInputBase-input': { fontSize: '0.875rem' }
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#F8FAFC', px: 2 }}>
      <Box sx={{ width: '100%', maxWidth: 440, bgcolor: '#fff', borderRadius: 3, border: '1px solid #e2e8f0', boxShadow: '0 4px 24px rgba(0,0,0,0.06)', p: { xs: 3, sm: 4 } }}>

        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <img src={logo} alt='Planco' style={{ width: 48, height: 48, objectFit: 'contain', marginBottom: 12 }} />
          <Typography variant='h5' sx={{ fontWeight: 700, color: '#0f172a', mb: 0.5 }}>
            Redefinir senha
          </Typography>
        </Box>

        {/* Validando token */}
        {tokenValid === null && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress size={32} />
          </Box>
        )}

        {/* Token inválido/expirado */}
        {tokenValid === false && (
          <Box sx={{ textAlign: 'center', py: 2, mb: 2 }}>
            <Box sx={{ width: 64, height: 64, borderRadius: '50%', bgcolor: '#FEE2E2', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 2 }}>
              <LockOutlined sx={{ fontSize: 32, color: '#dc2626' }} />
            </Box>
            <Typography sx={{ fontWeight: 600, color: '#0f172a', mb: 0.5 }}>Link inválido ou expirado</Typography>
            <Typography sx={{ fontSize: '0.8125rem', color: '#64748b', mb: 3 }}>
              Este link de redefinição não é mais válido. Solicite um novo link.
            </Typography>
            <Button
              onClick={() => navigate('/auth/forgot-password')}
              variant='contained'
              sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 2, bgcolor: '#1877F2', '&:hover': { bgcolor: '#166FE5' } }}
            >
              Solicitar novo link
            </Button>
          </Box>
        )}

        {/* Sucesso */}
        {done && (
          <Box sx={{ textAlign: 'center', py: 2, mb: 2 }}>
            <Box sx={{ width: 64, height: 64, borderRadius: '50%', bgcolor: '#DCFCE7', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 2 }}>
              <CheckCircleOutlined sx={{ fontSize: 32, color: '#16a34a' }} />
            </Box>
            <Typography sx={{ fontWeight: 600, color: '#0f172a', mb: 0.5 }}>Senha redefinida!</Typography>
            <Typography sx={{ fontSize: '0.8125rem', color: '#64748b', mb: 3 }}>
              Sua senha foi alterada com sucesso. Faça login com a nova senha.
            </Typography>
            <Button
              onClick={() => navigate('/auth')}
              variant='contained'
              sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 2, bgcolor: '#1877F2', '&:hover': { bgcolor: '#166FE5' } }}
            >
              Ir para o login
            </Button>
          </Box>
        )}

        {/* Formulário */}
        {tokenValid === true && !done && (
          <form onSubmit={handleSubmit}>
            <Typography sx={{ fontSize: '0.8125rem', color: '#64748b', mb: 2.5 }}>
              Crie uma nova senha forte para sua conta.
            </Typography>

            <Box sx={{ mb: 2 }}>
              <Typography sx={{ fontSize: '0.875rem', fontWeight: 500, color: '#495057', mb: 0.75 }}>Nova senha</Typography>
              <TextField
                fullWidth type={showNew ? 'text' : 'password'}
                value={newPassword} onChange={e => { setNewPassword(e.target.value); setError(''); }}
                InputProps={{ endAdornment: eyeAdornment(showNew, () => setShowNew(v => !v)) }}
                sx={fieldSx}
              />
              {passwordStrength && (
                <Box sx={{ mt: 0.75 }}>
                  <Box sx={{ height: 4, borderRadius: 2, bgcolor: '#e2e8f0', overflow: 'hidden' }}>
                    <Box sx={{ height: '100%', width: passwordStrength.width, bgcolor: passwordStrength.color, borderRadius: 2, transition: 'width 0.3s' }} />
                  </Box>
                  <Typography sx={{ fontSize: '0.75rem', color: passwordStrength.color, fontWeight: 600, mt: 0.5 }}>
                    Força: {passwordStrength.label}
                  </Typography>
                </Box>
              )}
            </Box>

            <Box sx={{ mb: 2.5 }}>
              <Typography sx={{ fontSize: '0.875rem', fontWeight: 500, color: '#495057', mb: 0.75 }}>Confirmar nova senha</Typography>
              <TextField
                fullWidth type={showConfirm ? 'text' : 'password'}
                value={confirmPassword} onChange={e => { setConfirmPassword(e.target.value); setError(''); }}
                error={!!confirmPassword && confirmPassword !== newPassword}
                helperText={!!confirmPassword && confirmPassword !== newPassword ? 'As senhas não coincidem' : ''}
                InputProps={{ endAdornment: eyeAdornment(showConfirm, () => setShowConfirm(v => !v)) }}
                sx={fieldSx}
              />
            </Box>

            {error && (
              <Typography sx={{ fontSize: '0.8125rem', color: '#dc2626', mb: 1.5, bgcolor: '#FEE2E2', px: 1.5, py: 1, borderRadius: 1.5 }}>
                {error}
              </Typography>
            )}

            <Button
              type='submit' fullWidth
              disabled={loading || !newPassword || !confirmPassword || newPassword !== confirmPassword}
              sx={{
                height: 48, borderRadius: 2, bgcolor: '#1877F2', color: '#fff',
                fontWeight: 600, fontSize: '0.9375rem', textTransform: 'none', mb: 2,
                '&:hover': { bgcolor: '#166FE5' },
                '&:disabled': { bgcolor: '#E9ECEF', color: '#6C757D' }
              }}
            >
              {loading ? <CircularProgress size={20} sx={{ color: '#fff' }} /> : 'Redefinir senha'}
            </Button>
          </form>
        )}

        {tokenValid !== null && !done && (
          <Button
            startIcon={<ArrowBackOutlined sx={{ fontSize: 16 }} />}
            onClick={() => navigate('/auth')}
            fullWidth variant='outlined'
            sx={{ height: 44, borderRadius: 2, textTransform: 'none', fontWeight: 600, borderColor: '#e2e8f0', color: '#64748b', '&:hover': { borderColor: '#1877F2', color: '#1877F2', bgcolor: '#EBF3FF' } }}
          >
            Voltar ao login
          </Button>
        )}
      </Box>
    </Box>
  );
};

export default ResetPasswordPage;
