import {
  CheckCircle as CheckCircleIcon,
  Close as CloseIcon,
  Description as DescriptionIcon,
  Download as DownloadIcon,
  FullscreenExit as FullscreenExitIcon,
  Fullscreen as FullscreenIcon,
  Info as InfoIcon,
  Lock as LockIcon,
  OpenInNew as OpenInNewIcon,
  Person as PersonIcon,
  PersonOff as PersonOffIcon,
  PictureAsPdf as PictureAsPdfIcon,
  Schedule as ScheduleIcon,
  BorderColor as SignatureIcon,
  Tag as TagIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon
} from '@mui/icons-material';
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogContent,
  Divider,
  IconButton,
  InputAdornment,
  TextField,
  Tooltip,
  Typography
} from '@mui/material';
import { useMemo, useState } from 'react';

type SignatureStatus = 'assinado' | 'pendente' | 'recusado';
type Signer = { id: string; nome: string; cargo: string; status: SignatureStatus; data?: string; hora?: string };
type DocumentInfo = {
  id: string;
  numeroProcesso?: string;
  nome?: string;
  tipo?: string;
  prazo?: string;
  status?: 'pendente' | 'assinado' | 'atrasado';
};

const MOCK_DOC: DocumentInfo = {
  id: 'doc_mock',
  numeroProcesso: '0000/2026',
  nome: 'Informações do documento:',
  tipo: 'DFD',
  prazo: '—',
  status: 'pendente'
};
const MOCK_SIGNERS: Signer[] = [
  {
    id: 's1',
    nome: 'Guilherme de Carvalho Silva',
    cargo: 'Gerente Suprimentos e Logística',
    status: 'assinado',
    data: '15/01/2025',
    hora: '14:32'
  },
  {
    id: 's2',
    nome: 'Dallas Kelson Francisco de Souza',
    cargo: 'Gerente Financeiro',
    status: 'assinado',
    data: '16/01/2025',
    hora: '09:15'
  },
  { id: 's3', nome: 'Gabriel Miranda', cargo: 'Analista de Contratos', status: 'pendente' }
];

const getDocStatusChip = (status?: string) => {
  if (status === 'assinado') return { label: 'Assinado', bg: 'success.light', color: 'success.dark' };
  if (status === 'atrasado') return { label: 'Atrasado', bg: 'error.light', color: 'error.dark' };
  return { label: 'Pendente', bg: 'warning.light', color: 'warning.dark' };
};

const getSignerStatusChip = (status: SignatureStatus) => {
  if (status === 'assinado')
    return {
      label: 'Assinado',
      bg: 'success.light',
      color: 'success.dark',
      icon: <CheckCircleIcon sx={{ fontSize: 16 }} />
    };
  if (status === 'recusado')
    return { label: 'Recusado', bg: 'error.light', color: 'error.dark', icon: <PersonOffIcon sx={{ fontSize: 16 }} /> };
  return {
    label: 'Pendente',
    bg: 'warning.light',
    color: 'warning.dark',
    icon: <ScheduleIcon sx={{ fontSize: 16 }} />
  };
};

const FileViewerDialog = ({
  open,
  onClose,
  fileName,
  fileType
}: {
  open: boolean;
  onClose: () => void;
  fileName?: string;
  fileType?: string;
}) => {
  const [fullscreen, setFullscreen] = useState(false);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      fullScreen={fullscreen}
      maxWidth={fullscreen ? false : 'lg'}
    >
      <DialogContent sx={{ p: 0 }}>
        <Box
          sx={{
            px: 3,
            py: 2.5,
            borderBottom: '1px solid divider',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <Box>
            <Typography sx={{ fontWeight: 700, color: 'text.primary', fontSize: '1.25rem' }}>
              Visualizar documento
            </Typography>
            <Typography
              variant='body2'
              sx={{ color: 'text.secondary', mt: 0.25 }}
            >
              Modo de visualização
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <IconButton
              onClick={() => setFullscreen(!fullscreen)}
              sx={{ color: 'primary.main' }}
            >
              {fullscreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
            </IconButton>
            <IconButton onClick={onClose}>
              <CloseIcon />
            </IconButton>
          </Box>
        </Box>

        <Box sx={{ px: 2.5, py: 2, borderBottom: '1px solid divider' }}>
          <Typography sx={{ fontWeight: 700, color: 'text.primary', fontSize: '0.95rem', mb: 1 }}>
            {fileName || 'Documento'}
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center', mb: 1.5 }}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.75,
                px: 1.5,
                py: 0.75,
                bgcolor: 'warning.light',
                borderRadius: 1.5,
                border: '1px solid #92400E33'
              }}
            >
              <CheckCircleIcon sx={{ fontSize: 16, color: 'warning.dark' }} />
              <Typography sx={{ fontWeight: 700, color: 'warning.dark', fontSize: '0.75rem' }}>
                Status: Pendente
              </Typography>
            </Box>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.75,
                px: 1.5,
                py: 0.75,
                bgcolor: '#EFF6FF',
                borderRadius: 1.5,
                border: '1px solid #BFDBFE'
              }}
            >
              <DescriptionIcon sx={{ fontSize: 16, color: '#2563EB' }} />
              <Typography sx={{ fontWeight: 700, color: '#1E40AF', fontSize: '0.75rem' }}>
                Processo: 0000/2026
              </Typography>
            </Box>
            {fileType && (
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.75,
                  px: 1.5,
                  py: 0.75,
                  bgcolor: '#F5F3FF',
                  borderRadius: 1.5,
                  border: '1px solid #DDD6FE'
                }}
              >
                <TagIcon sx={{ fontSize: 16, color: '#7C3AED' }} />
                <Typography sx={{ fontWeight: 700, color: '#6D28D9', fontSize: '0.75rem' }}>
                  Documento: {fileType}
                </Typography>
              </Box>
            )}
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant='outlined'
              startIcon={<OpenInNewIcon />}
              disabled
              sx={{ textTransform: 'none', borderRadius: 2 }}
            >
              Abrir em nova guia
            </Button>
            <Button
              variant='outlined'
              startIcon={<DownloadIcon />}
              disabled
              sx={{ textTransform: 'none', borderRadius: 2 }}
            >
              Baixar PDF
            </Button>
          </Box>
        </Box>

        <Box
          sx={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            gap: 1,
            p: 3,
            bgcolor: 'grey.50',
            minHeight: 400
          }}
        >
          <PictureAsPdfIcon sx={{ fontSize: 64, color: 'primary.main' }} />
          <Typography sx={{ fontWeight: 700, color: 'text.primary' }}>Pré-visualização do documento</Typography>
          <Typography
            variant='body2'
            sx={{ color: 'text.secondary', textAlign: 'center' }}
          >
            O conteúdo do PDF será exibido aqui no processo real.
          </Typography>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

const PasswordDialog = ({ open, onClose }: { open: boolean; onClose: () => void }) => {
  const [fullscreen, setFullscreen] = useState(false);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      fullScreen={fullscreen}
      maxWidth={fullscreen ? false : 'xs'}
    >
      <DialogContent sx={{ p: 0 }}>
        <Box
          sx={{
            p: 2.5,
            borderBottom: '1px solid divider',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                bgcolor: 'secondary.light',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <LockIcon sx={{ fontSize: 18, color: 'primary.main' }} />
            </Box>
            <Box>
              <Typography sx={{ fontWeight: 700, color: 'text.primary' }}>Confirmar assinatura</Typography>
              <Typography
                variant='body2'
                sx={{ color: 'text.secondary' }}
              >
                Digite sua senha para assinar
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <IconButton
              onClick={() => setFullscreen(!fullscreen)}
              sx={{ color: 'primary.main' }}
            >
              {fullscreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
            </IconButton>
            <IconButton onClick={onClose}>
              <CloseIcon />
            </IconButton>
          </Box>
        </Box>

        <Box sx={{ p: 2.5, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          <TextField
            label='Senha'
            type='password'
            disabled
            placeholder='Modo de visualização'
            InputProps={{
              endAdornment: (
                <InputAdornment position='end'>
                  <IconButton
                    edge='end'
                    disabled
                  >
                    <VisibilityOffIcon />
                  </IconButton>
                </InputAdornment>
              )
            }}
          />

          <Box
            sx={{
              border: '1px solid #BFDBFE',
              bgcolor: '#EFF6FF',
              borderRadius: 2,
              p: 1.5,
              display: 'flex',
              gap: 1.25
            }}
          >
            <LockIcon sx={{ fontSize: 18, color: '#2563EB', mt: '2px' }} />
            <Box>
              <Typography sx={{ fontWeight: 700, color: '#1E3A8A', fontSize: '0.9rem' }}>
                Assinatura digital segura
              </Typography>
              <Typography
                variant='body2'
                sx={{ color: '#1D4ED8', fontWeight: 600 }}
              >
                Sua senha será usada para validar a assinatura e garantir autenticidade.
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
            <Button
              onClick={onClose}
              variant='outlined'
              sx={{ textTransform: 'none', borderRadius: 2, flex: 1 }}
            >
              Cancelar
            </Button>
            <Button
              variant='contained'
              sx={{ bgcolor: 'primary.main', textTransform: 'none', borderRadius: 2, flex: 1 }}
            >
              Confirmar
            </Button>
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export const SignatureComponent = ({
  config,
  label,
  description
}: {
  config?: { documento?: DocumentInfo; assinaturas?: Signer[] };
  label?: string;
  description?: string;
}) => {
  const [fileViewerOpen, setFileViewerOpen] = useState(false);
  const [pwdOpen, setPwdOpen] = useState(false);

  const documento = config?.documento || MOCK_DOC;
  const assinaturas = config?.assinaturas || MOCK_SIGNERS;
  const _signed = useMemo(() => assinaturas.filter((s) => s.status === 'assinado').length, [assinaturas]);
  const docChip = useMemo(() => getDocStatusChip(documento.status), [documento.status]);

  return (
    <>
      <Box sx={{ border: '1px solid divider', borderRadius: 2, bgcolor: 'common.white', overflow: 'hidden' }}>
        <Box sx={{ px: 2.25, py: 2, bgcolor: 'grey.100', borderBottom: '2px solid divider' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
            <Typography sx={{ fontWeight: 700, color: 'text.primary', fontSize: '0.95rem' }}>
              {label || 'Assinatura Eletrônica'}
            </Typography>
            {description && (
              <Tooltip
                title={description}
                arrow
              >
                <InfoIcon sx={{ fontSize: 18, color: 'primary.main', cursor: 'help' }} />
              </Tooltip>
            )}
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 2, mb: 1.5 }}>
            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Typography sx={{ fontWeight: 700, color: 'text.primary', fontSize: '0.95rem', mb: 0.5 }}>
                Documento para assinatura
              </Typography>
              <Typography
                variant='body2'
                sx={{ color: 'text.secondary', fontSize: '0.8rem' }}
              >
                {documento.nome || 'Documento'}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                onClick={() => setFileViewerOpen(true)}
                variant='outlined'
                startIcon={<VisibilityIcon />}
                sx={{ textTransform: 'none', borderRadius: 2, fontWeight: 700 }}
              >
                Ver documento
              </Button>
              <Button
                onClick={() => setPwdOpen(true)}
                variant='contained'
                startIcon={<SignatureIcon />}
                sx={{ bgcolor: 'primary.main', textTransform: 'none', fontWeight: 700, borderRadius: 2 }}
              >
                Assinar
              </Button>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.75,
                px: 1.5,
                py: 0.75,
                bgcolor: docChip.bg,
                borderRadius: 1.5,
                border: `1px solid ${docChip.color}20`
              }}
            >
              <CheckCircleIcon sx={{ fontSize: 16, color: docChip.color }} />
              <Typography sx={{ fontWeight: 700, color: docChip.color, fontSize: '0.75rem' }}>
                Status: {docChip.label}
              </Typography>
            </Box>
            {documento.numeroProcesso && (
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.75,
                  px: 1.5,
                  py: 0.75,
                  bgcolor: '#EFF6FF',
                  borderRadius: 1.5,
                  border: '1px solid #BFDBFE'
                }}
              >
                <DescriptionIcon sx={{ fontSize: 16, color: '#2563EB' }} />
                <Typography sx={{ fontWeight: 700, color: '#1E40AF', fontSize: '0.75rem' }}>
                  Processo: {documento.numeroProcesso}
                </Typography>
              </Box>
            )}
            {documento.tipo && (
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.75,
                  px: 1.5,
                  py: 0.75,
                  bgcolor: '#F5F3FF',
                  borderRadius: 1.5,
                  border: '1px solid #DDD6FE'
                }}
              >
                <TagIcon sx={{ fontSize: 16, color: '#7C3AED' }} />
                <Typography sx={{ fontWeight: 700, color: '#6D28D9', fontSize: '0.75rem' }}>
                  Documento: {documento.tipo}
                </Typography>
              </Box>
            )}
          </Box>
        </Box>

        <Box sx={{ p: 2.25, display: 'flex', flexDirection: 'column', gap: 0 }}>
          {assinaturas.map((s, idx) => {
            const st = getSignerStatusChip(s.status);
            return (
              <Box key={s.id}>
                <Box
                  sx={{ py: 1.25, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 2 }}
                >
                  <Box sx={{ display: 'flex', gap: 1.25, minWidth: 0 }}>
                    <Box
                      sx={{
                        width: 36,
                        height: 36,
                        borderRadius: '50%',
                        bgcolor: st.bg,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <PersonIcon sx={{ fontSize: 18, color: st.color }} />
                    </Box>
                    <Box sx={{ minWidth: 0 }}>
                      <Typography sx={{ fontWeight: 700, color: 'text.primary', fontSize: '0.9rem' }}>
                        {s.nome}
                      </Typography>
                      <Typography
                        variant='body2'
                        sx={{ color: 'text.secondary', fontWeight: 600, fontSize: '0.8rem' }}
                      >
                        {s.cargo}
                      </Typography>
                      {s.status === 'assinado' && s.data && (
                        <Typography
                          variant='caption'
                          sx={{ color: 'text.disabled', fontWeight: 600, display: 'block', mt: 0.5 }}
                        >
                          Assinado em {s.data}
                          {s.hora ? ` às ${s.hora}` : ''}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                  <Chip
                    icon={st.icon}
                    label={st.label}
                    size='small'
                    sx={{ bgcolor: st.bg, color: st.color, fontWeight: 700, fontSize: '0.72rem', height: 22 }}
                  />
                </Box>
                {idx < assinaturas.length - 1 && <Divider sx={{ borderColor: '#EEF2F7' }} />}
              </Box>
            );
          })}
        </Box>
      </Box>

      <FileViewerDialog
        open={fileViewerOpen}
        onClose={() => setFileViewerOpen(false)}
        fileName={documento.nome}
        fileType={documento.tipo}
      />
      <PasswordDialog
        open={pwdOpen}
        onClose={() => setPwdOpen(false)}
      />
    </>
  );
};
