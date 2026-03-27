import {
  BusinessOutlined,
  CameraAltOutlined,
  EditOutlined,
  EmailOutlined,
  LockOutlined,
  PhoneOutlined,
  PlaceOutlined,
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
  MenuItem,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { useEffect, useRef, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useAccessControl } from '@/hooks/useAccessControl';
import { useOrg } from '@/hooks/useOrg';
import type { OrgEndereco } from '@/globals/types';

const ESFERAS = ['Federal', 'Estadual', 'Municipal', 'Privado', 'Outro'] as const;

const formatCNPJ = (v: string) => {
  const n = v.replace(/\D/g, '');
  if (n.length <= 2) return n;
  if (n.length <= 5) return `${n.slice(0, 2)}.${n.slice(2)}`;
  if (n.length <= 8) return `${n.slice(0, 2)}.${n.slice(2, 5)}.${n.slice(5)}`;
  if (n.length <= 12) return `${n.slice(0, 2)}.${n.slice(2, 5)}.${n.slice(5, 8)}/${n.slice(8)}`;
  return `${n.slice(0, 2)}.${n.slice(2, 5)}.${n.slice(5, 8)}/${n.slice(8, 12)}-${n.slice(12, 14)}`;
};

const formatPhone = (v: string) => {
  const n = v.replace(/\D/g, '');
  if (n.length <= 2) return n;
  if (n.length <= 7) return `(${n.slice(0, 2)}) ${n.slice(2)}`;
  return `(${n.slice(0, 2)}) ${n.slice(2, 7)}-${n.slice(7, 11)}`;
};

const formatCEP = (v: string) => {
  const n = v.replace(/\D/g, '');
  if (n.length <= 5) return n;
  return `${n.slice(0, 5)}-${n.slice(5, 8)}`;
};

const SectionHeader = ({ icon, color, bg, title, subtitle }: {
  icon: React.ReactNode; color: string; bg: string; title: string; subtitle: string;
}) => (
  <Box sx={{ px: 3, py: 2.5, borderBottom: '1px solid #f1f5f9', bgcolor: '#fafbfc', display: 'flex', alignItems: 'center', gap: 1.5 }}>
    <Box sx={{ width: 36, height: 36, borderRadius: 2, bgcolor: bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {icon}
    </Box>
    <Box>
      <Typography sx={{ fontWeight: 700, fontSize: '0.9375rem', color: '#0f172a' }}>{title}</Typography>
      <Typography sx={{ fontSize: '0.8rem', color: '#64748b' }}>{subtitle}</Typography>
    </Box>
  </Box>
);

const ReadOnlyField = ({ label, value }: { label: string; value?: string }) => (
  <Box>
    <Typography sx={{ fontSize: '0.72rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', mb: 0.25 }}>{label}</Typography>
    <Typography sx={{ fontSize: '0.875rem', color: value ? '#0f172a' : '#cbd5e1', fontWeight: 500 }}>{value || '—'}</Typography>
  </Box>
);

const OrgSection = () => {
  const { isOrgAdmin, isPlatformAdmin } = useAuth();
  const { hasPermission } = useAccessControl();
  const canEdit = isOrgAdmin || isPlatformAdmin || hasPermission('org.update');
  const { org, loading, fetchOrg, updateOrg, updateLogo } = useOrg();

  const [editing, setEditing] = useState(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  // form state
  const [name, setName] = useState('');
  const [sigla, setSigla] = useState('');
  const [cnpj, setCnpj] = useState('');
  const [esfera, setEsfera] = useState('');
  const [emailContato, setEmailContato] = useState('');
  const [telefone, setTelefone] = useState('');
  const [endereco, setEndereco] = useState<OrgEndereco>({});

  useEffect(() => {
    fetchOrg().catch(() => {});
  }, []);

  useEffect(() => {
    if (!org) return;
    setName(org.name ?? '');
    setSigla(org.sigla ?? '');
    setCnpj(formatCNPJ(org.cnpj ?? ''));
    setEsfera(org.esfera ?? '');
    setEmailContato(org.emailContato ?? '');
    setTelefone(formatPhone(org.telefone ?? ''));
    setEndereco({
      logradouro: org.endereco?.logradouro ?? '',
      numero: org.endereco?.numero ?? '',
      complemento: org.endereco?.complemento ?? '',
      bairro: org.endereco?.bairro ?? '',
      cidade: org.endereco?.cidade ?? '',
      estado: org.endereco?.estado ?? '',
      cep: formatCEP(org.endereco?.cep ?? ''),
    });
  }, [org]);

  const handleSave = async () => {
    try {
      await updateOrg({
        name, sigla,
        cnpj: cnpj.replace(/\D/g, ''),
        esfera: esfera as any,
        emailContato,
        telefone: telefone.replace(/\D/g, ''),
        endereco: { ...endereco, cep: endereco.cep?.replace(/\D/g, '') },
      });
      setMsg({ type: 'success', text: 'Organização atualizada com sucesso.' });
      setEditing(false);
    } catch (e: any) {
      setMsg({ type: 'error', text: e.message });
    }
  };

  const handleCancel = () => {
    if (!org) return;
    setName(org.name ?? '');
    setSigla(org.sigla ?? '');
    setCnpj(formatCNPJ(org.cnpj ?? ''));
    setEsfera(org.esfera ?? '');
    setEmailContato(org.emailContato ?? '');
    setTelefone(formatPhone(org.telefone ?? ''));
    setEndereco({
      logradouro: org.endereco?.logradouro ?? '',
      numero: org.endereco?.numero ?? '',
      complemento: org.endereco?.complemento ?? '',
      bairro: org.endereco?.bairro ?? '',
      cidade: org.endereco?.cidade ?? '',
      estado: org.endereco?.estado ?? '',
      cep: formatCEP(org.endereco?.cep ?? ''),
    });
    setEditing(false);
    setMsg(null);
  };

  const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      await updateLogo(file);
      setMsg({ type: 'success', text: 'Logo atualizado com sucesso.' });
    } catch (e: any) {
      setMsg({ type: 'error', text: e.message });
    }
  };

  const addr = org?.endereco;
  const addrLine = [addr?.logradouro, addr?.numero, addr?.complemento].filter(Boolean).join(', ');
  const addrLine2 = [addr?.bairro, addr?.cidade, addr?.estado].filter(Boolean).join(' · ');

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>

      {/* ── Identidade ── */}
      <Card sx={{ border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', borderRadius: 3, overflow: 'hidden' }}>
        <SectionHeader
          icon={<BusinessOutlined sx={{ color: '#7C3AED', fontSize: 20 }} />}
          color='#7C3AED' bg='#F3EEFF'
          title='Identidade da organização'
          subtitle='Nome, sigla, CNPJ e esfera administrativa'
        />

        {/* Logo + nome */}
        <Box sx={{ px: 3, pt: 3, pb: 2.5, display: 'flex', alignItems: 'flex-start', gap: 3, flexDirection: { xs: 'column', sm: 'row' } }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1, flexShrink: 0 }}>
            <Box sx={{ position: 'relative' }}>
              <Avatar
                src={org?.logoUrl ?? undefined}
                variant='rounded'
                sx={{ width: 80, height: 80, bgcolor: '#F3EEFF', border: '2px solid #e2e8f0', fontSize: '1.75rem', color: '#7C3AED' }}
              >
                {!org?.logoUrl && (org?.sigla?.[0] ?? <BusinessOutlined />)}
              </Avatar>
              {canEdit && (
                <Tooltip title='Alterar logo'>
                  <IconButton
                    size='small'
                    onClick={() => logoInputRef.current?.click()}
                    sx={{ position: 'absolute', bottom: 0, right: 0, bgcolor: '#7C3AED', color: '#fff', width: 26, height: 26, border: '2px solid #fff', '&:hover': { bgcolor: '#6D28D9' } }}
                  >
                    <CameraAltOutlined sx={{ fontSize: 13 }} />
                  </IconButton>
                </Tooltip>
              )}
              <input ref={logoInputRef} type='file' accept='image/*' hidden onChange={handleLogoChange} />
            </Box>
            <Typography sx={{ fontSize: '0.7rem', color: '#94a3b8', textAlign: 'center' }}>Logo da org</Typography>
          </Box>

          {/* Info somente leitura quando não editando */}
          {!editing ? (
            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
                <Typography sx={{ fontWeight: 700, fontSize: '1.125rem', color: '#0f172a' }}>{org?.name || '—'}</Typography>
                {org?.sigla && <Chip label={org.sigla} size='small' sx={{ height: 22, fontSize: '0.75rem', fontWeight: 700, bgcolor: '#F3EEFF', color: '#7C3AED' }} />}
                {org?.esfera && <Chip label={org.esfera} size='small' sx={{ height: 22, fontSize: '0.75rem', fontWeight: 600, bgcolor: '#F1F5F9', color: '#475569' }} />}
              </Box>
              <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
                <ReadOnlyField label='CNPJ' value={org?.cnpj ? formatCNPJ(org.cnpj) : undefined} />
              </Box>
            </Box>
          ) : (
            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
                <TextField label='Nome da organização' value={name} onChange={e => setName(e.target.value)} size='small' fullWidth />
                <TextField label='Sigla' value={sigla} onChange={e => setSigla(e.target.value)} size='small' sx={{ maxWidth: 120 }} />
              </Box>
              <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
                <TextField
                  label='CNPJ' value={cnpj} size='small' fullWidth placeholder='00.000.000/0000-00'
                  inputProps={{ maxLength: 18 }}
                  onChange={e => setCnpj(formatCNPJ(e.target.value))}
                />
                <TextField label='Esfera' value={esfera} onChange={e => setEsfera(e.target.value)} size='small' select sx={{ minWidth: 140 }}>
                  {ESFERAS.map(e => <MenuItem key={e} value={e}>{e}</MenuItem>)}
                </TextField>
              </Box>
            </Box>
          )}
        </Box>

        {canEdit && !editing && (
          <Box sx={{ px: 3, pb: 2.5, display: 'flex', justifyContent: 'flex-end' }}>
            <Button startIcon={<EditOutlined />} onClick={() => setEditing(true)} variant='outlined'
              sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 2, borderColor: '#7C3AED', color: '#7C3AED', '&:hover': { bgcolor: '#F3EEFF', borderColor: '#7C3AED' } }}>
              Editar
            </Button>
          </Box>
        )}
      </Card>

      {/* ── Contato ── */}
      <Card sx={{ border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', borderRadius: 3, overflow: 'hidden' }}>
        <SectionHeader
          icon={<EmailOutlined sx={{ color: '#0369a1', fontSize: 20 }} />}
          color='#0369a1' bg='#E0F2FE'
          title='Contato'
          subtitle='E-mail e telefone de contato da organização'
        />
        <Box sx={{ px: 3, py: 2.5, display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
          {!editing ? (
            <>
              <ReadOnlyField label='E-mail de contato' value={org?.emailContato} />
              <ReadOnlyField label='Telefone' value={org?.telefone ? formatPhone(org.telefone) : undefined} />
            </>
          ) : (
            <>
              <TextField
                label='E-mail de contato' value={emailContato} onChange={e => setEmailContato(e.target.value)}
                size='small' fullWidth type='email'
                InputProps={{ startAdornment: <InputAdornment position='start'><EmailOutlined sx={{ fontSize: 16, color: '#94a3b8' }} /></InputAdornment> }}
              />
              <TextField
                label='Telefone' value={telefone} onChange={e => setTelefone(formatPhone(e.target.value))}
                size='small' fullWidth inputProps={{ maxLength: 15 }} placeholder='(11) 99999-9999'
                InputProps={{ startAdornment: <InputAdornment position='start'><PhoneOutlined sx={{ fontSize: 16, color: '#94a3b8' }} /></InputAdornment> }}
              />
            </>
          )}
        </Box>
      </Card>

      {/* ── Endereço ── */}
      <Card sx={{ border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', borderRadius: 3, overflow: 'hidden' }}>
        <SectionHeader
          icon={<PlaceOutlined sx={{ color: '#059669', fontSize: 20 }} />}
          color='#059669' bg='#ECFDF5'
          title='Endereço'
          subtitle='Localização da organização'
        />
        <Box sx={{ px: 3, py: 2.5 }}>
          {!editing ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
              {addrLine ? (
                <>
                  <Typography sx={{ fontSize: '0.9rem', color: '#0f172a', fontWeight: 500 }}>{addrLine}</Typography>
                  {addrLine2 && <Typography sx={{ fontSize: '0.875rem', color: '#64748b' }}>{addrLine2}</Typography>}
                  {addr?.cep && <Typography sx={{ fontSize: '0.8125rem', color: '#94a3b8' }}>CEP {formatCEP(addr.cep)}</Typography>}
                </>
              ) : (
                <Typography sx={{ fontSize: '0.875rem', color: '#cbd5e1' }}>Endereço não informado</Typography>
              )}
            </Box>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
                <TextField label='Logradouro' value={endereco.logradouro ?? ''} onChange={e => setEndereco(p => ({ ...p, logradouro: e.target.value }))} size='small' fullWidth />
                <TextField label='Número' value={endereco.numero ?? ''} onChange={e => setEndereco(p => ({ ...p, numero: e.target.value }))} size='small' sx={{ maxWidth: 100 }} />
                <TextField label='Complemento' value={endereco.complemento ?? ''} onChange={e => setEndereco(p => ({ ...p, complemento: e.target.value }))} size='small' sx={{ maxWidth: 160 }} />
              </Box>
              <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
                <TextField label='Bairro' value={endereco.bairro ?? ''} onChange={e => setEndereco(p => ({ ...p, bairro: e.target.value }))} size='small' fullWidth />
                <TextField label='Cidade' value={endereco.cidade ?? ''} onChange={e => setEndereco(p => ({ ...p, cidade: e.target.value }))} size='small' fullWidth />
                <TextField label='Estado' value={endereco.estado ?? ''} onChange={e => setEndereco(p => ({ ...p, estado: e.target.value }))} size='small' sx={{ maxWidth: 80 }} inputProps={{ maxLength: 2 }} />
                <TextField
                  label='CEP' value={endereco.cep ?? ''} onChange={e => setEndereco(p => ({ ...p, cep: formatCEP(e.target.value) }))}
                  size='small' sx={{ maxWidth: 120 }} inputProps={{ maxLength: 9 }} placeholder='00000-000'
                />
              </Box>
            </Box>
          )}
        </Box>
      </Card>

      {/* Feedback */}
      {msg && (
        <Alert severity={msg.type} onClose={() => setMsg(null)} sx={{ fontSize: '0.8125rem', borderRadius: 2 }}>{msg.text}</Alert>
      )}

      {/* Ações de edição */}
      {editing && (
        <Card sx={{ border: '1px solid #e2e8f0', borderRadius: 3, overflow: 'hidden' }}>
          <Box sx={{ px: 3, py: 2, bgcolor: '#fafbfc', display: 'flex', justifyContent: 'flex-end', gap: 1.5 }}>
            <Button onClick={handleCancel} variant='outlined' sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 2 }}>
              Cancelar
            </Button>
            <Button onClick={handleSave} variant='contained' disabled={loading || !name.trim()}
              sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 2, bgcolor: '#7C3AED', '&:hover': { bgcolor: '#6D28D9' } }}>
              Salvar alterações
            </Button>
          </Box>
        </Card>
      )}

      {/* Aviso somente leitura */}
      {!canEdit && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 2, py: 1.5, bgcolor: '#F8FAFC', border: '1px solid #e2e8f0', borderRadius: 2 }}>
          <LockOutlined sx={{ fontSize: 16, color: '#94a3b8' }} />
          <Typography sx={{ fontSize: '0.8125rem', color: '#94a3b8' }}>
            Apenas administradores podem editar as informações da organização.
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default OrgSection;
