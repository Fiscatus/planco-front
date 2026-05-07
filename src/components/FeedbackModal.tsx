import { AutoAwesome, BugReport, Close, CloudUpload, Send, Undo } from '@mui/icons-material';
import {
  Box, Button, Chip, CircularProgress, Dialog, DialogContent,
  FormHelperText, IconButton, ToggleButton, ToggleButtonGroup, Typography
} from '@mui/material';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useNotification } from '@/components/NotificationProvider';
import { useAuth } from '@/hooks';
import { api } from '@/services';

const TYPES = [
  { value: 'Bug',                label: '🐛 Bug' },
  { value: 'Melhoria',           label: '✨ Melhoria' },
  { value: 'Layout',             label: '🎨 Layout' },
  { value: 'Dúvida',             label: '❓ Dúvida' },
  { value: 'Nova Funcionalidade', label: '🚀 Nova Funcionalidade' },
  { value: 'Outro',              label: '📝 Outro' },
];

const PRIORITIES = [
  { value: 'Baixa',   color: '#16a34a', bg: '#dcfce7', border: '#bbf7d0' },
  { value: 'Média',   color: '#ca8a04', bg: '#fef9c3', border: '#fde68a' },
  { value: 'Alta',    color: '#ea580c', bg: '#ffedd5', border: '#fed7aa' },
  { value: 'Crítica', color: '#dc2626', bg: '#fee2e2', border: '#fecaca' },
];

const MODULE_MAP: Record<string, string> = {
  '/planejamento-da-contratacao': 'Dashboard',
  '/processos-gerencia':          'Processos',
  '/modelos-fluxo':               'Fluxos',
  '/gerenciamento-pastas':        'Pastas',
  '/insights':                    'Insights',
  '/admin':                       'Administração',
  '/configuracoes':               'Configurações',
  '/minhas-gerencias':            'Gerências',
};

const inputSx = {
  width: '100%',
  '& textarea, & input': {
    fontFamily: 'inherit',
    fontSize: '0.875rem',
    color: '#0f172a',
    background: 'transparent',
    border: 'none',
    outline: 'none',
    resize: 'none' as const,
    width: '100%',
  },
};

type Props = { open: boolean; onClose: () => void };

export const FeedbackModal = ({ open, onClose }: Props) => {
  const { user } = useAuth();
  const { showNotification } = useNotification();
  const location = useLocation();

  const guessedModule = Object.entries(MODULE_MAP).find(([path]) =>
    location.pathname.startsWith(path)
  )?.[1] ?? 'Dashboard';

  const [type, setType] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('');
  const [module, setModule] = useState(guessedModule);

  // Sincroniza o módulo sempre que o modal abre
  useEffect(() => {
    if (open) setModule(guessedModule);
  }, [open]);
  const [file, setFile] = useState<File[]>([]);
  const [previews, setPreviews] = useState<{ name: string; url: string }[]>([]);
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [rewriting, setRewriting] = useState(false);
  const [prevDescription, setPrevDescription] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const fileRef = useRef<HTMLInputElement>(null);

  const reset = () => {
    setType(''); setTitle(''); setDescription(''); setPriority('');
    setModule(guessedModule); setFile([]); setPreviews([]); setErrors({});
  };

  const handleClose = () => { reset(); onClose(); };

  const handleFile = (files: FileList | File[]) => {
    const arr = Array.from(files);
    const oversized = arr.find(f => f.size > 5 * 1024 * 1024);
    if (oversized) {
      setErrors(e => ({ ...e, file: `"${oversized.name}" excede 5MB` }));
      return;
    }
    setErrors(e => ({ ...e, file: '' }));
    const newFiles = [...file, ...arr];
    setFile(newFiles);
    arr.forEach(f => {
      const reader = new FileReader();
      reader.onload = ev => setPreviews(prev => [...prev, { name: f.name, url: ev.target?.result as string }]);
      reader.readAsDataURL(f);
    });
  };

  const removeFile = (idx: number) => {
    setFile(prev => prev.filter((_, i) => i !== idx));
    setPreviews(prev => prev.filter((_, i) => i !== idx));
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    if (e.dataTransfer.files.length) handleFile(e.dataTransfer.files);
  }, [file]);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!type) e.type = 'Selecione o tipo';
    if (!title.trim()) e.title = 'Obrigatório';
    if (title.length > 200) e.title = 'Máx. 200 caracteres';
    if (!description.trim()) e.description = 'Obrigatório';
    if (description.length > 3000) e.description = 'Máx. 3000 caracteres';
    if (!priority) e.priority = 'Selecione a prioridade';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleRewrite = async () => {
    if (!description.trim() || rewriting) return;
    setRewriting(true);
    try {
      const context = [
        `Módulo: ${module || guessedModule}`,
        type ? `Tipo de feedback: ${type}` : null,
        title.trim() ? `Título: ${title}` : null,
      ].filter(Boolean).join(' | ');

      const { data } = await api.post('/tickets/rewrite', {
        text: description,
        context,
      });
      setPrevDescription(description);
      setDescription(data.rewritten);
    } catch (err: any) {
      showNotification(err?.message || 'Erro ao reescrever com IA', 'error');
    } finally {
      setRewriting(false);
    }
  };

  const handleUndo = () => {
    if (prevDescription !== null) {
      setDescription(prevDescription);
      setPrevDescription(null);
    }
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const form = new FormData();
      form.append('type', type);
      form.append('title', title);
      form.append('description', description);
      form.append('priority', priority);
      if (module) form.append('module', module);
      if (file.length) file.forEach(f => form.append('files', f));
      await api.post('/tickets', form, { headers: { 'Content-Type': 'multipart/form-data' } });
      showNotification('Obrigado pelo feedback! Sua mensagem foi registrada.', 'success');
      handleClose();
    } catch (err: any) {
      showNotification(err?.message || 'Erro ao enviar feedback', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (!user?.org) return null;

  const fieldBox = (label: string, required = false, error?: string, children?: React.ReactNode) => (
    <Box>
      <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', mb: 0.75, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
        {label}{required && <Box component='span' sx={{ color: '#ef4444', ml: 0.25 }}>*</Box>}
      </Typography>
      {children}
      {error && <FormHelperText error sx={{ mt: 0.5, fontSize: '0.75rem' }}>{error}</FormHelperText>}
    </Box>
  );

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth='sm'
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          overflow: 'hidden',
          boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
        }
      }}
    >
      {/* Header */}
      <Box sx={{ background: 'linear-gradient(135deg, #1877F2 0%, #0f4fa8 100%)', px: 3, py: 2.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box sx={{ width: 36, height: 36, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <BugReport sx={{ fontSize: 20, color: '#fff' }} />
          </Box>
          <Box>
            <Typography sx={{ fontWeight: 700, fontSize: '1rem', color: '#fff', lineHeight: 1.2 }}>Enviar Feedback</Typography>
            <Typography sx={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.7)', lineHeight: 1.2 }}>Ajude-nos a melhorar o Planco</Typography>
          </Box>
        </Box>
        <IconButton onClick={handleClose} size='small' sx={{ color: 'rgba(255,255,255,0.8)', '&:hover': { backgroundColor: 'rgba(255,255,255,0.15)', color: '#fff' }, borderRadius: 1.5 }}>
          <Close sx={{ fontSize: 18 }} />
        </IconButton>
      </Box>

      <DialogContent sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2.5, backgroundColor: '#f8fafc' }}>

        {/* Tipo */}
        {fieldBox('Tipo', true, errors.type,
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {TYPES.map(t => (
              <Chip
                key={t.value}
                label={t.label}
                onClick={() => { setType(t.value); setErrors(e => ({ ...e, type: '' })); }}
                sx={{
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '0.8125rem',
                  height: 32,
                  borderRadius: 2,
                  border: '1.5px solid',
                  borderColor: type === t.value ? '#1877F2' : '#e2e8f0',
                  backgroundColor: type === t.value ? '#eff6ff' : '#fff',
                  color: type === t.value ? '#1877F2' : '#475569',
                  transition: 'all 0.15s',
                  '&:hover': { borderColor: '#1877F2', backgroundColor: '#eff6ff', color: '#1877F2' },
                }}
              />
            ))}
          </Box>
        )}

        {/* Prioridade */}
        {fieldBox('Prioridade', true, errors.priority,
          <Box sx={{ display: 'flex', gap: 1 }}>
            {PRIORITIES.map(p => (
              <Box
                key={p.value}
                onClick={() => { setPriority(p.value); setErrors(e => ({ ...e, priority: '' })); }}
                sx={{
                  flex: 1, py: 0.75, borderRadius: 2, textAlign: 'center', cursor: 'pointer',
                  border: `1.5px solid ${priority === p.value ? p.color : p.border}`,
                  backgroundColor: priority === p.value ? p.bg : '#fff',
                  transition: 'all 0.15s',
                  '&:hover': { backgroundColor: p.bg, borderColor: p.color },
                }}
              >
                <Typography sx={{ fontSize: '0.8125rem', fontWeight: 700, color: p.color }}>{p.value}</Typography>
              </Box>
            ))}
          </Box>
        )}

        {/* Título */}
        {fieldBox('Título', true, errors.title,
          <Box sx={{ backgroundColor: '#fff', border: `1.5px solid ${errors.title ? '#ef4444' : '#e2e8f0'}`, borderRadius: 2, px: 1.5, py: 1.25, '&:focus-within': { borderColor: '#1877F2' }, transition: 'border-color 0.15s' }}>
            <input
              style={{ ...inputSx['& textarea, & input'], display: 'block' }}
              placeholder='Descreva o problema ou sugestão em poucas palavras...'
              value={title}
              maxLength={200}
              onChange={e => setTitle(e.target.value)}
            />
          </Box>
        )}
        <Typography sx={{ fontSize: '0.6875rem', color: '#94a3b8', mt: -2, textAlign: 'right' }}>{title.length}/200</Typography>

        {/* Descrição */}
        {fieldBox('Descrição', true, errors.description,
          <Box sx={{ backgroundColor: '#fff', border: `1.5px solid ${errors.description ? '#ef4444' : '#e2e8f0'}`, borderRadius: 2, overflow: 'hidden', '&:focus-within': { borderColor: '#1877F2' }, transition: 'border-color 0.15s' }}>
              <Box sx={{ px: 1.5, pt: 1.25, pb: 0.5 }}>
                <textarea
                  style={{ ...inputSx['& textarea, & input'], display: 'block', minHeight: 96 }}
                  placeholder='Descreva com detalhes o que aconteceu, o que esperava e o que ocorreu...'
                  value={description}
                  maxLength={3000}
                  onChange={e => { setDescription(e.target.value); setPrevDescription(null); }}
                />
              </Box>
              <Box sx={{ px: 1.25, py: 0.75, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 0.75, borderTop: '1px solid #f1f5f9', backgroundColor: '#fafafa' }}>
                {prevDescription !== null && (
                  <Box
                    onClick={handleUndo}
                    sx={{ display: 'flex', alignItems: 'center', gap: 0.5, cursor: 'pointer', px: 1, py: 0.25, borderRadius: 1, color: '#64748b', fontSize: '0.75rem', fontWeight: 600, '&:hover': { backgroundColor: '#f1f5f9', color: '#374151' } }}
                  >
                    <Undo sx={{ fontSize: 13 }} />
                    Desfazer
                  </Box>
                )}
                <Box
                  onClick={handleRewrite}
                  title='Melhorar com IA'
                  sx={{
                    display: 'flex', alignItems: 'center', gap: 0.5, cursor: description.trim() && !rewriting ? 'pointer' : 'not-allowed',
                    px: 1.75, py: 0.625, borderRadius: 1.5,
                    background: rewriting
                      ? 'linear-gradient(135deg, #3a64ed, #55c9f7)'
                      : description.trim() ? 'linear-gradient(135deg, #3a64ed, #55c9f7)' : '#cbd5e1',
                    opacity: 1,
                    transition: 'all 0.15s',
                    '&:hover': description.trim() && !rewriting ? { background: 'linear-gradient(135deg, #3a64ed, #55c9f7)', transform: 'scale(1.03)' } : {},
                  }}
                >
                  {rewriting
                    ? <CircularProgress size={12} sx={{ color: '#fff' }} />
                    : <AutoAwesome sx={{ fontSize: 15, color: '#fff' }} />
                  }
                  <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#fff', lineHeight: 1 }}>
                    {rewriting ? 'Reescrevendo...' : 'Melhorar com IA'}
                  </Typography>
                </Box>
              </Box>
            </Box>
        )}
        <Typography sx={{ fontSize: '0.6875rem', color: '#94a3b8', mt: -2, textAlign: 'right' }}>{description.length}/3000</Typography>

        {/* Módulo */}
        {fieldBox('Módulo', false, undefined,
          <Box sx={{ backgroundColor: '#fff', border: '1.5px solid #e2e8f0', borderRadius: 2, px: 1.5, py: 1.25, '&:focus-within': { borderColor: '#1877F2' }, transition: 'border-color 0.15s' }}>
            <input
              style={{ ...inputSx['& textarea, & input'], display: 'block' }}
              placeholder='Ex: Processos, Dashboard, Fluxos'
              value={module}
              onChange={e => setModule(e.target.value)}
            />
          </Box>
        )}

        {/* Upload */}
        {fieldBox('Anexar imagens', false, errors.file,
          <Box>
            <input ref={fileRef} type='file' accept='image/*' multiple style={{ display: 'none' }}
              onChange={e => { if (e.target.files?.length) handleFile(e.target.files); e.target.value = ''; }} />

            {/* Previews */}
            {previews.length > 0 && (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1.5 }}>
                {previews.map((p, idx) => (
                  <Box key={idx} sx={{ position: 'relative', width: 80, height: 80, borderRadius: 2, overflow: 'hidden', border: '1.5px solid #e2e8f0', flexShrink: 0 }}>
                    <img src={p.url} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                    <IconButton
                      size='small'
                      onClick={() => removeFile(idx)}
                      sx={{ position: 'absolute', top: 2, right: 2, bgcolor: 'rgba(0,0,0,0.55)', color: '#fff', width: 20, height: 20, '&:hover': { bgcolor: 'rgba(0,0,0,0.8)' } }}
                    >
                      <Close sx={{ fontSize: 12 }} />
                    </IconButton>
                  </Box>
                ))}
              </Box>
            )}

            {/* Drop zone */}
            <Box
              onDragOver={e => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileRef.current?.click()}
              sx={{
                border: `2px dashed ${dragging ? '#1877F2' : '#cbd5e1'}`,
                borderRadius: 2, py: 2, textAlign: 'center', cursor: 'pointer',
                backgroundColor: dragging ? '#eff6ff' : '#fff',
                transition: 'all 0.15s',
                '&:hover': { borderColor: '#1877F2', backgroundColor: '#eff6ff' }
              }}
            >
              <CloudUpload sx={{ fontSize: 28, color: dragging ? '#1877F2' : '#94a3b8', mb: 0.5 }} />
              <Typography sx={{ fontSize: '0.8125rem', fontWeight: 600, color: dragging ? '#1877F2' : '#475569' }}>
                Arraste ou <Box component='span' sx={{ color: '#1877F2', textDecoration: 'underline' }}>clique para selecionar</Box>
              </Typography>
              <Typography sx={{ fontSize: '0.75rem', color: '#94a3b8', mt: 0.25 }}>PNG, JPG, GIF — máx. 5MB por imagem</Typography>
            </Box>
          </Box>
        )}

        {/* Botões */}
        <Box sx={{ display: 'flex', gap: 1.5, pt: 0.5 }}>
          <Button
            fullWidth variant='outlined' onClick={handleClose} disabled={loading}
            sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 2, borderColor: '#e2e8f0', color: '#64748b', py: 1.25, '&:hover': { borderColor: '#cbd5e1', backgroundColor: '#f8fafc' } }}
          >
            Cancelar
          </Button>
          <Button
            fullWidth variant='contained' onClick={handleSubmit} disabled={loading}
            startIcon={loading ? <CircularProgress size={16} color='inherit' /> : <Send sx={{ fontSize: 16 }} />}
            sx={{
              textTransform: 'none', fontWeight: 700, borderRadius: 2, py: 1.25,
              background: 'linear-gradient(135deg, #1877F2 0%, #0f4fa8 100%)',
              boxShadow: '0 4px 12px rgba(24,119,242,0.35)',
              '&:hover': { background: 'linear-gradient(135deg, #166fe5 0%, #0d4494 100%)', boxShadow: '0 6px 16px rgba(24,119,242,0.45)' },
              '&:disabled': { background: '#e2e8f0', boxShadow: 'none', color: '#94a3b8' }
            }}
          >
            {loading ? 'Enviando...' : 'Enviar Feedback'}
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
};
