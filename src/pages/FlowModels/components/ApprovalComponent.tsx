import {
  Cancel as CancelIcon,
  CheckCircle as CheckCircleIcon,
  Info as InfoIcon,
  OpenInNew as OpenInNewIcon,
  PictureAsPdf as PdfIcon,
  Schedule as ScheduleIcon
} from '@mui/icons-material';
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  TextField,
  Tooltip,
  Typography
} from '@mui/material';
import { useState } from 'react';

type ReviewStatus = 'in_review' | 'approved' | 'changes_requested';
type FileReview = {
  id: string;
  name: string;
  version: number;
  status: ReviewStatus;
  reviewedBy?: string;
  reviewedAt?: string;
  reviewNote?: string;
  submittedBy?: string;
  submittedAt?: string;
};

const MOCK_FILES: FileReview[] = [
  {
    id: '1',
    name: 'Proposta_Comercial.docx',
    version: 2,
    status: 'in_review',
    submittedBy: 'Pedro Costa',
    submittedAt: '2025-01-17T09:15:00'
  },
  {
    id: '2',
    name: 'Contrato_Fornecedor.pdf',
    version: 1,
    status: 'approved',
    submittedBy: 'Ana Silva',
    submittedAt: '2025-01-14T08:00:00',
    reviewedBy: 'João Silva',
    reviewedAt: '2025-01-15T10:30:00',
    reviewNote: 'Documento aprovado conforme especificações'
  },
  {
    id: '3',
    name: 'Planilha_Custos.xlsx',
    version: 1,
    status: 'changes_requested',
    submittedBy: 'Carlos Mendes',
    submittedAt: '2025-01-13T16:45:00',
    reviewedBy: 'Maria Santos',
    reviewedAt: '2025-01-14T14:20:00',
    reviewNote: 'Necessário ajustar valores da coluna C'
  }
];

const getStatusChip = (status: ReviewStatus) => {
  if (status === 'approved')
    return {
      label: 'Aprovado',
      bg: 'success.light',
      color: 'success.dark',
      icon: <CheckCircleIcon sx={{ fontSize: 16 }} />
    };
  if (status === 'changes_requested')
    return {
      label: 'Correções solicitadas',
      bg: 'error.light',
      color: 'error.dark',
      icon: <CancelIcon sx={{ fontSize: 16 }} />
    };
  return {
    label: 'Em análise',
    bg: 'warning.light',
    color: 'warning.dark',
    icon: <ScheduleIcon sx={{ fontSize: 16 }} />
  };
};

const formatDate = (date?: string) => {
  if (!date) return '—';
  const d = new Date(date);
  return `${d.toLocaleDateString('pt-BR')} às ${d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
};

export const ApprovalComponent = ({
  config,
  label,
  description
}: {
  config?: { hasFilesManagement?: boolean };
  label?: string;
  description?: string;
}) => {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmType, setConfirmType] = useState<'approved' | 'changes_requested'>('approved');
  const _hasFilesManagement = config?.hasFilesManagement || false;

  const filesInReview = MOCK_FILES.filter((f) => f.status === 'in_review');
  const filesHistory = MOCK_FILES.filter((f) => f.status !== 'in_review');

  return (
    <Box sx={{ border: '1px solid divider', borderRadius: 2, bgcolor: 'common.white', overflow: 'hidden' }}>
      <Box sx={{ px: 2.25, py: 2, bgcolor: 'grey.100', borderBottom: '2px solid divider' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
          <Typography sx={{ fontWeight: 700, color: 'text.primary', fontSize: '0.95rem' }}>
            {label || 'Aprovação'}
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
        <Typography
          variant='body2'
          sx={{ color: 'text.secondary', fontSize: '0.8rem' }}
        >
          {filesInReview.length} {filesInReview.length === 1 ? 'documento' : 'documentos'} aguardando análise
        </Typography>
      </Box>

      {/* Arquivos em análise */}
      <Box sx={{ p: 2.25 }}>
        <Typography sx={{ fontWeight: 700, color: 'text.primary', fontSize: '0.9rem', mb: 1.5 }}>
          Documentos em análise
        </Typography>
        {filesInReview.length === 0 ? (
          <Typography
            variant='body2'
            sx={{ color: 'text.disabled', textAlign: 'center', py: 2 }}
          >
            Nenhum documento aguardando análise
          </Typography>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {filesInReview.map((file) => (
              <Box
                key={file.id}
                sx={{ p: 1.5, bgcolor: 'grey.50', borderRadius: 2, border: '1px solid divider' }}
              >
                <Box
                  sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1.5, mb: 0.75 }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1, minWidth: 0 }}>
                    <Chip
                      label={`v${file.version}`}
                      size='small'
                      sx={{
                        bgcolor: 'secondary.light',
                        color: 'primary.main',
                        fontWeight: 700,
                        fontSize: '0.75rem',
                        height: 22
                      }}
                    />
                    <Typography
                      sx={{
                        fontWeight: 700,
                        color: 'text.primary',
                        fontSize: '0.9rem',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {file.name}
                    </Typography>
                  </Box>
                  <Tooltip title='Abrir em nova guia'>
                    <IconButton
                      sx={{
                        border: '1px solid divider',
                        borderRadius: 2,
                        '&:hover': { borderColor: 'primary.main', bgcolor: '#F0F9FF' }
                      }}
                    >
                      <OpenInNewIcon
                        fontSize='small'
                        sx={{ color: 'primary.main' }}
                      />
                    </IconButton>
                  </Tooltip>
                </Box>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  <Chip
                    icon={getStatusChip(file.status).icon}
                    label={getStatusChip(file.status).label}
                    size='small'
                    sx={{
                      bgcolor: getStatusChip(file.status).bg,
                      color: getStatusChip(file.status).color,
                      fontWeight: 700,
                      fontSize: '0.75rem',
                      height: 22,
                      '& .MuiChip-icon': { color: getStatusChip(file.status).color }
                    }}
                  />
                  <Chip
                    label={`Enviado por: ${file.submittedBy || '—'}`}
                    size='small'
                    sx={{ bgcolor: 'grey.50', color: '#475569', fontWeight: 700, fontSize: '0.75rem', height: 22 }}
                  />
                  <Chip
                    label={formatDate(file.submittedAt)}
                    size='small'
                    sx={{
                      bgcolor: 'grey.50',
                      color: 'text.secondary',
                      fontWeight: 700,
                      fontSize: '0.75rem',
                      height: 22
                    }}
                  />
                </Box>
              </Box>
            ))}
          </Box>
        )}
      </Box>

      <Divider sx={{ borderColor: '#E8EEF5' }} />

      {/* Histórico */}
      <Box sx={{ p: 2.25 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
          <Typography sx={{ fontWeight: 700, color: 'text.primary', fontSize: '0.9rem' }}>
            Histórico de análises
          </Typography>
          <Button
            variant='outlined'
            startIcon={<PdfIcon />}
            size='small'
            sx={{
              textTransform: 'none',
              borderRadius: 2,
              borderColor: 'divider',
              color: 'text.primary',
              fontWeight: 700,
              '&:hover': { borderColor: 'primary.main', bgcolor: '#F0F9FF', color: 'primary.main' }
            }}
          >
            Exportar PDF - Auditoria
          </Button>
        </Box>
        {filesHistory.length === 0 ? (
          <Typography
            variant='body2'
            sx={{ color: 'text.disabled', textAlign: 'center', py: 2 }}
          >
            Nenhuma análise realizada
          </Typography>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {filesHistory.map((file, idx) => {
              const status = getStatusChip(file.status);
              return (
                <Box key={file.id}>
                  <Box sx={{ py: 1.25 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.75 }}>
                      <Chip
                        label={`v${file.version}`}
                        size='small'
                        sx={{
                          bgcolor: 'grey.100',
                          color: 'text.secondary',
                          fontWeight: 700,
                          fontSize: '0.75rem',
                          height: 22
                        }}
                      />
                      <Typography sx={{ fontWeight: 700, color: 'text.primary', fontSize: '0.9rem' }}>
                        {file.name}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 0.75 }}>
                      <Chip
                        icon={status.icon}
                        label={status.label}
                        size='small'
                        sx={{
                          bgcolor: status.bg,
                          color: status.color,
                          fontWeight: 700,
                          fontSize: '0.75rem',
                          height: 22,
                          '& .MuiChip-icon': { color: status.color }
                        }}
                      />
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 0.5 }}>
                      <Chip
                        label={`Enviado por: ${file.submittedBy || '—'}`}
                        size='small'
                        sx={{ bgcolor: 'grey.100', color: '#475569', fontWeight: 700, fontSize: '0.7rem', height: 20 }}
                      />
                      <Chip
                        label={`Em: ${formatDate(file.submittedAt)}`}
                        size='small'
                        sx={{
                          bgcolor: 'grey.100',
                          color: 'text.secondary',
                          fontWeight: 700,
                          fontSize: '0.7rem',
                          height: 20
                        }}
                      />
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 0.75 }}>
                      <Chip
                        label={`Analisado por: ${file.reviewedBy || '—'}`}
                        size='small'
                        sx={{ bgcolor: 'grey.50', color: '#475569', fontWeight: 700, fontSize: '0.7rem', height: 20 }}
                      />
                      <Chip
                        label={`Em: ${formatDate(file.reviewedAt)}`}
                        size='small'
                        sx={{
                          bgcolor: 'grey.50',
                          color: 'text.secondary',
                          fontWeight: 700,
                          fontSize: '0.7rem',
                          height: 20
                        }}
                      />
                    </Box>
                    <Typography
                      variant='body2'
                      sx={{
                        color: file.reviewNote ? 'text.primary' : 'text.disabled',
                        fontWeight: 700,
                        fontSize: '0.8rem'
                      }}
                    >
                      Motivo: {file.reviewNote || '—'}
                    </Typography>
                  </Box>
                  {idx < filesHistory.length - 1 && <Divider sx={{ borderColor: '#EEF2F7' }} />}
                </Box>
              );
            })}
          </Box>
        )}
      </Box>

      {/* Ações */}
      <Box sx={{ px: 2.25, pb: 2.25, display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
        <Button
          onClick={() => {
            setConfirmType('changes_requested');
            setConfirmOpen(true);
          }}
          variant='outlined'
          startIcon={<CancelIcon />}
          sx={{ textTransform: 'none', borderRadius: 2, borderColor: '#FECACA', color: 'error.dark', fontWeight: 700 }}
        >
          Solicitar correções
        </Button>
        <Button
          onClick={() => {
            setConfirmType('approved');
            setConfirmOpen(true);
          }}
          variant='contained'
          startIcon={<CheckCircleIcon />}
          sx={{ bgcolor: 'success.main', textTransform: 'none', fontWeight: 700, borderRadius: 2 }}
        >
          Aprovar
        </Button>
      </Box>

      {/* Modal de confirmação */}
      <Dialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        fullWidth
        maxWidth='xs'
      >
        <DialogTitle sx={{ fontWeight: 700, color: 'text.primary' }}>
          {confirmType === 'approved' ? 'Aprovar documentos' : 'Solicitar correções'}
        </DialogTitle>
        <DialogContent>
          <Typography
            variant='body2'
            sx={{ color: 'text.secondary', mb: 2 }}
          >
            {confirmType === 'approved'
              ? 'Adicione uma observação sobre a aprovação (opcional)'
              : 'Descreva as correções necessárias'}
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={3}
            disabled
            placeholder='Modo de visualização'
            sx={{ mb: 1 }}
          />
          <Typography
            variant='caption'
            sx={{ color: 'text.disabled', fontStyle: 'italic' }}
          >
            Modo de visualização - Ações desabilitadas
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={() => setConfirmOpen(false)}
            variant='outlined'
            sx={{ textTransform: 'none', borderRadius: 2 }}
          >
            Cancelar
          </Button>
          <Button
            disabled
            variant='contained'
            sx={{
              bgcolor: confirmType === 'approved' ? 'success.main' : 'error.main',
              textTransform: 'none',
              borderRadius: 2
            }}
          >
            Confirmar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
