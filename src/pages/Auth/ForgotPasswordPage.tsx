import { ArrowBackOutlined, EmailOutlined, LockResetOutlined } from '@mui/icons-material';
import { Box, Button, CircularProgress, TextField, Typography } from '@mui/material';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '@/services';
import logo from '/assets/isologo.svg';

const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    setError('');
    try {
      await api.post('/auth/forgot-password', { email });
      setSent(true);
    } catch (err: any) {
      setError(err.message || 'Erro ao enviar email. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#F8FAFC', px: 2 }}>
      <Box sx={{ width: '100%', maxWidth: 440, bgcolor: '#fff', borderRadius: 3, border: '1px solid #e2e8f0', boxShadow: '0 4px 24px rgba(0,0,0,0.06)', p: { xs: 3, sm: 4 } }}>

        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <img src={logo} alt='Planco' style={{ width: 48, height: 48, objectFit: 'contain', marginBottom: 12 }} />
          <Box sx={{ width: 56, height: 56, borderRadius: '50%', bgcolor: '#EBF3FF', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 2 }}>
            <LockResetOutlined sx={{ fontSize: 28, color: '#1877F2' }} />
          </Box>
          <Typography variant='h5' sx={{ fontWeight: 700, color: '#0f172a', mb: 0.5 }}>
            Esqueceu sua senha?
          </Typography>
          <Typography sx={{ fontSize: '0.875rem', color: '#64748b' }}>
            {sent
              ? 'Verifique seu e-mail para continuar.'
              : 'Informe seu e-mail e enviaremos um link para redefinir sua senha.'}
          </Typography>
        </Box>

        {!sent ? (
          <form onSubmit={handleSubmit}>
            <Box sx={{ mb: 2 }}>
              <Typography sx={{ fontSize: '0.875rem', fontWeight: 500, color: '#495057', mb: 0.75 }}>E-mail</Typography>
              <TextField
                fullWidth
                type='email'
                placeholder='seuemail@exemplo.com'
                value={email}
                onChange={e => { setEmail(e.target.value); setError(''); }}
                error={!!error}
                helperText={error}
                InputProps={{ startAdornment: <EmailOutlined sx={{ fontSize: 20, color: '#94a3b8', mr: 1 }} /> }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    height: 48, borderRadius: 2,
                    '& fieldset': { borderColor: error ? '#DC3545' : '#CED4DA' },
                    '&:hover fieldset': { borderColor: '#ADB5BD' },
                    '&.Mui-focused fieldset': { borderColor: '#1877F2', borderWidth: 2 }
                  },
                  '& .MuiInputBase-input': { fontSize: '0.875rem' }
                }}
              />
            </Box>

            <Button
              type='submit'
              fullWidth
              disabled={loading || !email.trim()}
              sx={{
                height: 48, borderRadius: 2, bgcolor: '#1877F2', color: '#fff',
                fontWeight: 600, fontSize: '0.9375rem', textTransform: 'none', mb: 2,
                '&:hover': { bgcolor: '#166FE5' },
                '&:disabled': { bgcolor: '#E9ECEF', color: '#6C757D' }
              }}
            >
              {loading ? <CircularProgress size={20} sx={{ color: '#fff' }} /> : 'Enviar link de redefinição'}
            </Button>
          </form>
        ) : (
          <Box sx={{ textAlign: 'center', py: 2, mb: 2 }}>
            <Box sx={{ width: 64, height: 64, borderRadius: '50%', bgcolor: '#DCFCE7', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 2 }}>
              <EmailOutlined sx={{ fontSize: 32, color: '#16a34a' }} />
            </Box>
            <Typography sx={{ fontSize: '0.9375rem', color: '#374151', fontWeight: 500, mb: 0.5 }}>
              Link enviado!
            </Typography>
            <Typography sx={{ fontSize: '0.8125rem', color: '#64748b' }}>
              Se este e-mail estiver cadastrado, você receberá as instruções em breve. Verifique também a pasta de spam.
            </Typography>
          </Box>
        )}

        <Button
          startIcon={<ArrowBackOutlined sx={{ fontSize: 16 }} />}
          onClick={() => navigate('/auth')}
          fullWidth
          variant='outlined'
          sx={{ height: 44, borderRadius: 2, textTransform: 'none', fontWeight: 600, borderColor: '#e2e8f0', color: '#64748b', '&:hover': { borderColor: '#1877F2', color: '#1877F2', bgcolor: '#EBF3FF' } }}
        >
          Voltar ao login
        </Button>
      </Box>
    </Box>
  );
};

export default ForgotPasswordPage;
