import {
  AccountCircleOutlined,
  BadgeOutlined,
  CameraAltOutlined,
  CheckCircleOutlined,
  LockOutlined,
  PhoneOutlined,
  Visibility,
  VisibilityOff,
} from '@mui/icons-material';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  Chip,
  Divider,
  IconButton,
  InputAdornment,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { useRef, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';

const formatCPF = (value: string) => {
  const n = value.replace(/\D/g, '');
  if (n.length <= 3) return n;
  if (n.length <= 6) return `${n.slice(0, 3)}.${n.slice(3)}`;
  if (n.length <= 9) return `${n.slice(0, 3)}.${n.slice(3, 6)}.${n.slice(6)}`;
  return `${n.slice(0, 3)}.${n.slice(3, 6)}.${n.slice(6, 9)}-${n.slice(9, 11)}`;
};

const formatPhone = (value: string) => {
  const n = value.replace(/\D/g, '');
  if (n.length <= 2) return n;
  if (n.length <= 7) return `(${n.slice(0, 2)}) ${n.slice(2)}`;
  return `(${n.slice(0, 2)}) ${n.slice(2, 7)}-${n.slice(7, 11)}`;
};

const ProfileSection = () => {
  const { user, updateUser } = useAuth();
  const { loading, updateMyProfile, changePassword, updateAvatar } = useProfile();

  const [firstName, setFirstName] = useState(user?.firstName ?? '');
  const [lastName, setLastName] = useState(user?.lastName ?? '');
  const [cpf, setCpf] = useState(formatCPF(user?.cpf ?? ''));
  const [phone, setPhone] = useState(formatPhone(user?.phone ?? ''));
  const [profileMsg, setProfileMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleProfileSave = async () => {
    try {
      const updated = await updateMyProfile({ firstName, lastName, cpf, phone });
      updateUser({ firstName: updated.firstName, lastName: updated.lastName, cpf: updated.cpf, phone: updated.phone });
      setProfileMsg({ type: 'success', text: 'Perfil atualizado com sucesso.' });
    } catch (e: any) {
      setProfileMsg({ type: 'error', text: e.message });
    }
  };

  const handlePasswordSave = async () => {
    try {
      await changePassword({ currentPassword, newPassword, confirmPassword });
      setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
      setPasswordMsg({ type: 'success', text: 'Senha alterada com sucesso.' });
    } catch (e: any) {
      setPasswordMsg({ type: 'error', text: e.message });
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const updated = await updateAvatar(file);
      updateUser({ avatarUrl: updated.avatarUrl });
    } catch (e: any) {
      setProfileMsg({ type: 'error', text: e.message });
    }
  };

  const passwordStrength = (() => {
    if (!newPassword) return null;
    if (newPassword.length < 8) return { label: 'Fraca', color: '#ef4444', width: '33%' };
    if (newPassword.length < 12 || !/[^a-zA-Z0-9]/.test(newPassword)) return { label: 'Média', color: '#f59e0b', width: '66%' };
    return { label: 'Forte', color: '#16a34a', width: '100%' };
  })();

  const eyeAdornment = (show: boolean, toggle: () => void) => (
    <InputAdornment position='end'>
      <IconButton size='small' onClick={toggle} edge='end' tabIndex={-1}>
        {show ? <VisibilityOff sx={{ fontSize: 18 }} /> : <Visibility sx={{ fontSize: 18 }} />}
      </IconButton>
    </InputAdornment>
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>

      {/* ── Dados pessoais ── */}
      <Card sx={{ border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', borderRadius: 3, overflow: 'hidden' }}>
        {/* Header */}
        <Box sx={{ px: 3, py: 2.5, borderBottom: '1px solid #f1f5f9', bgcolor: '#fafbfc', display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box sx={{ width: 36, height: 36, borderRadius: 2, bgcolor: '#EBF3FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <AccountCircleOutlined sx={{ color: '#1877F2', fontSize: 20 }} />
          </Box>
          <Box>
            <Typography sx={{ fontWeight: 700, fontSize: '0.9375rem', color: '#0f172a' }}>Dados pessoais</Typography>
            <Typography sx={{ fontSize: '0.8rem', color: '#64748b' }}>Atualize suas informações de perfil</Typography>
          </Box>
        </Box>

        {/* Avatar + info somente leitura */}
        <Box sx={{ px: 3, pt: 3, pb: 2.5, display: 'flex', alignItems: 'flex-start', gap: 3, flexDirection: { xs: 'column', sm: 'row' } }}>
          {/* Avatar */}
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1, flexShrink: 0 }}>
            <Box sx={{ position: 'relative' }}>
              <Avatar
                src={user?.avatarUrl ?? undefined}
                sx={{ width: 88, height: 88, fontSize: '2rem', bgcolor: '#1877F2', border: '3px solid #e2e8f0' }}
              >
                {!user?.avatarUrl && `${firstName?.[0] ?? ''}${lastName?.[0] ?? ''}`}
              </Avatar>
              <Tooltip title='Alterar foto'>
                <IconButton
                  size='small'
                  onClick={() => fileInputRef.current?.click()}
                  sx={{ position: 'absolute', bottom: 0, right: 0, bgcolor: '#1877F2', color: '#fff', width: 28, height: 28, border: '2px solid #fff', '&:hover': { bgcolor: '#1565C0' } }}
                >
                  <CameraAltOutlined sx={{ fontSize: 14 }} />
                </IconButton>
              </Tooltip>
              <input ref={fileInputRef} type='file' accept='image/jpeg,image/png,image/webp' hidden onChange={handleAvatarChange} />
            </Box>
            <Typography sx={{ fontSize: '0.7rem', color: '#94a3b8', textAlign: 'center' }}>JPEG, PNG, WebP<br />máx. 5 MB</Typography>
          </Box>

          {/* Info somente leitura */}
          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            <Box>
              <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', mb: 0.5 }}>E-mail</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography sx={{ fontSize: '0.9375rem', color: '#0f172a', fontWeight: 500 }}>{user?.email}</Typography>
                {user?.emailVerified && (
                  <Chip icon={<CheckCircleOutlined sx={{ fontSize: 13 }} />} label='Verificado' size='small'
                    sx={{ height: 20, fontSize: '0.7rem', fontWeight: 700, bgcolor: '#DCFCE7', color: '#16a34a', '& .MuiChip-icon': { color: '#16a34a' } }} />
                )}
              </Box>
            </Box>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              {user?.org && (
                <Box>
                  <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', mb: 0.25 }}>Organização</Typography>
                  <Typography sx={{ fontSize: '0.875rem', color: '#374151', fontWeight: 500 }}>{user.org.name}</Typography>
                </Box>
              )}
              {user?.role && (
                <Box>
                  <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', mb: 0.25 }}>Perfil</Typography>
                  <Chip label={user.role.name} size='small'
                    sx={{ height: 22, fontSize: '0.75rem', fontWeight: 700, bgcolor: '#EBF3FF', color: '#1877F2' }} />
                </Box>
              )}
            </Box>
            {user?.departments && user.departments.length > 0 && (
              <Box>
                <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', mb: 0.5 }}>Gerências</Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                  {user.departments.map(d => (
                    <Chip key={d._id} label={d.department_name} size='small'
                      sx={{ height: 22, fontSize: '0.75rem', fontWeight: 600, bgcolor: '#F1F5F9', color: '#475569' }} />
                  ))}
                </Box>
              </Box>
            )}
          </Box>
        </Box>

        <Divider sx={{ mx: 3 }} />

        {/* Campos editáveis */}
        <Box sx={{ px: 3, py: 2.5, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
            <TextField label='Nome' value={firstName} onChange={e => setFirstName(e.target.value)} size='small' fullWidth />
            <TextField label='Sobrenome' value={lastName} onChange={e => setLastName(e.target.value)} size='small' fullWidth />
          </Box>
          <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
            <TextField
              label='CPF' value={cpf} onChange={e => setCpf(formatCPF(e.target.value))} size='small' fullWidth
              inputProps={{ maxLength: 14 }}
              placeholder='000.000.000-00'
              InputProps={{ startAdornment: <InputAdornment position='start'><BadgeOutlined sx={{ fontSize: 18, color: '#94a3b8' }} /></InputAdornment> }}
            />
            <TextField
              label='Telefone' value={phone} onChange={e => setPhone(formatPhone(e.target.value))} size='small' fullWidth
              inputProps={{ maxLength: 15 }}
              placeholder='(11) 99999-9999'
              InputProps={{ startAdornment: <InputAdornment position='start'><PhoneOutlined sx={{ fontSize: 18, color: '#94a3b8' }} /></InputAdornment> }}
            />
          </Box>
        </Box>

        {profileMsg && (
          <Box sx={{ px: 3, pb: 1 }}>
            <Alert severity={profileMsg.type} onClose={() => setProfileMsg(null)} sx={{ fontSize: '0.8125rem' }}>{profileMsg.text}</Alert>
          </Box>
        )}

        <Box sx={{ px: 3, pb: 2.5, display: 'flex', justifyContent: 'flex-end' }}>
          <Button variant='contained' disabled={loading || !firstName.trim() || !lastName.trim()} onClick={handleProfileSave}
            sx={{ textTransform: 'none', fontWeight: 600, bgcolor: '#1877F2', borderRadius: 2, '&:hover': { bgcolor: '#1565C0' } }}>
            Salvar alterações
          </Button>
        </Box>
      </Card>

      {/* ── Alterar senha ── */}
      <Card sx={{ border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', borderRadius: 3, overflow: 'hidden' }}>
        {/* Header */}
        <Box sx={{ px: 3, py: 2.5, borderBottom: '1px solid #f1f5f9', bgcolor: '#fafbfc', display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box sx={{ width: 36, height: 36, borderRadius: 2, bgcolor: '#FEF3C7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <LockOutlined sx={{ color: '#d97706', fontSize: 20 }} />
          </Box>
          <Box>
            <Typography sx={{ fontWeight: 700, fontSize: '0.9375rem', color: '#0f172a' }}>Alterar senha</Typography>
            <Typography sx={{ fontSize: '0.8rem', color: '#64748b' }}>Use uma senha forte com letras, números e símbolos</Typography>
          </Box>
        </Box>

        <Box sx={{ px: 3, py: 2.5, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            label='Senha atual' size='small' fullWidth
            type={showCurrent ? 'text' : 'password'}
            value={currentPassword} onChange={e => setCurrentPassword(e.target.value)}
            InputProps={{ endAdornment: eyeAdornment(showCurrent, () => setShowCurrent(v => !v)) }}
          />

          <Box>
            <TextField
              label='Nova senha' size='small' fullWidth
              type={showNew ? 'text' : 'password'}
              value={newPassword} onChange={e => setNewPassword(e.target.value)}
              InputProps={{ endAdornment: eyeAdornment(showNew, () => setShowNew(v => !v)) }}
            />
            {passwordStrength && (
              <Box sx={{ mt: 1 }}>
                <Box sx={{ height: 4, borderRadius: 2, bgcolor: '#e2e8f0', overflow: 'hidden' }}>
                  <Box sx={{ height: '100%', width: passwordStrength.width, bgcolor: passwordStrength.color, borderRadius: 2, transition: 'width 0.3s, background 0.3s' }} />
                </Box>
                <Typography sx={{ fontSize: '0.75rem', color: passwordStrength.color, fontWeight: 600, mt: 0.5 }}>
                  Força da senha: {passwordStrength.label}
                </Typography>
              </Box>
            )}
          </Box>

          <TextField
            label='Confirmar nova senha' size='small' fullWidth
            type={showConfirm ? 'text' : 'password'}
            value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
            error={!!confirmPassword && confirmPassword !== newPassword}
            helperText={!!confirmPassword && confirmPassword !== newPassword ? 'As senhas não coincidem' : ''}
            InputProps={{ endAdornment: eyeAdornment(showConfirm, () => setShowConfirm(v => !v)) }}
          />
        </Box>

        {passwordMsg && (
          <Box sx={{ px: 3, pb: 1 }}>
            <Alert severity={passwordMsg.type} onClose={() => setPasswordMsg(null)} sx={{ fontSize: '0.8125rem' }}>{passwordMsg.text}</Alert>
          </Box>
        )}

        <Divider />
        <Box sx={{ px: 3, py: 2, bgcolor: '#fafbfc', display: 'flex', justifyContent: 'flex-end' }}>
          <Button variant='contained' onClick={handlePasswordSave}
            disabled={loading || !currentPassword || !newPassword || !confirmPassword || newPassword !== confirmPassword}
            sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 2, bgcolor: '#d97706', '&:hover': { bgcolor: '#b45309' }, '&.Mui-disabled': { bgcolor: '#e2e8f0' } }}>
            Alterar senha
          </Button>
        </Box>
      </Card>
    </Box>
  );
};

export default ProfileSection;
