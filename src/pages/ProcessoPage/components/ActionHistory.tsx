import { useState, useMemo } from 'react';
import {
  History as HistoryIcon,
  Description as FormIcon,
  CloudUpload as UploadIcon,
  Send as SendIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Schedule as ScheduleIcon,
  ChatBubble as CommentIcon,
  CheckBox as ChecklistIcon,
  Event as TimelineIcon,
  BorderColor as SignatureIcon,
  FastForward as AdvancedIcon,
  ArrowBack as RollbackIcon,
  Group as GroupIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  AttachFile as AttachFileIcon,
  Image as ImageIcon,
} from '@mui/icons-material';
import { Avatar, Box, Button, Chip, CircularProgress, Collapse, Dialog, IconButton, MenuItem, Select, Typography } from '@mui/material';
import { PictureAsPdf as PdfIcon } from '@mui/icons-material';
import { renderCommentText, type CommentMention } from '@/utils/renderCommentText';
import { useDownloadFile } from '@/hooks';
import { api } from '@/services';
import { ProcessStageModal } from './ProcessStageModal';
import type { ProcessFlowStageCard } from '@/globals/types';

type PerformedBy = string | { _id: string; email: string; firstName: string; lastName: string; avatarUrl?: string | null };

type AuditLog = {
  action: string;
  performedBy: PerformedBy;
  performedAt: string;
  stageName?: string;
  componentKey?: string;
  componentLabel?: string;
  reason?: string;
  fileName?: string;
  commentText?: string;
  commentMentions?: CommentMention[];
  commentAttachmentFileName?: string;
  commentAttachmentUrl?: string;
  commentAttachmentMimeType?: string;
  commentAttachmentFileId?: string;
  taskTitle?: string;
  eventTitle?: string;
  signatories?: string[];
  fromStageName?: string;
  toStageName?: string;
  [key: string]: any;
};

type StageExecution = {
  stageId: string;
  stageOrder?: number;
  status?: string;
  auditLogs?: AuditLog[];
};

type SnapshotStage = {
  stageId: string;
  order: number;
  name: string;
};

type ActionHistoryProps = {
  stageExecutions: StageExecution[];
  snapshotStages: SnapshotStage[];
  stages: ProcessFlowStageCard[];
  processId: string;
  instanceId: string;
};

const actionConfig: Record<string, { color: string; bg: string; icon: React.ReactNode }> = {
  FORM_SUBMITTED:             { color: '#1D4ED8', bg: '#EFF6FF', icon: <FormIcon        sx={{ fontSize: 14 }} /> },
  FORM_UPDATED:               { color: '#1D4ED8', bg: '#EFF6FF', icon: <FormIcon        sx={{ fontSize: 14 }} /> },
  FILE_UPLOADED:              { color: '#7C3AED', bg: '#F5F3FF', icon: <UploadIcon      sx={{ fontSize: 14 }} /> },
  FILE_SENT_TO_APPROVAL:      { color: '#92400E', bg: '#FEF3C7', icon: <SendIcon        sx={{ fontSize: 14 }} /> },
  FILE_APPROVED:              { color: '#065F46', bg: '#ECFDF3', icon: <CheckCircleIcon sx={{ fontSize: 14 }} /> },
  FILE_REJECTED:              { color: '#B91C1C', bg: '#FEE2E2', icon: <CancelIcon      sx={{ fontSize: 14 }} /> },
  COMMENT_ADDED:              { color: '#0369A1', bg: '#E0F2FE', icon: <CommentIcon     sx={{ fontSize: 14 }} /> },
  CHECKLIST_ITEM_CREATED:     { color: '#065F46', bg: '#ECFDF3', icon: <ChecklistIcon   sx={{ fontSize: 14 }} /> },
  CHECKLIST_ITEM_COMPLETED:   { color: '#065F46', bg: '#ECFDF3', icon: <CheckCircleIcon sx={{ fontSize: 14 }} /> },
  CHECKLIST_ITEM_UNCOMPLETED: { color: '#92400E', bg: '#FEF3C7', icon: <ScheduleIcon    sx={{ fontSize: 14 }} /> },
  CHECKLIST_ITEM_UPDATED:     { color: '#1D4ED8', bg: '#EFF6FF', icon: <ChecklistIcon   sx={{ fontSize: 14 }} /> },
  CHECKLIST_ITEM_DELETED:     { color: '#B91C1C', bg: '#FEE2E2', icon: <ChecklistIcon   sx={{ fontSize: 14 }} /> },
  TIMELINE_EVENT_CREATED:     { color: '#7C3AED', bg: '#F5F3FF', icon: <TimelineIcon    sx={{ fontSize: 14 }} /> },
  TIMELINE_EVENT_UPDATED:     { color: '#7C3AED', bg: '#F5F3FF', icon: <TimelineIcon    sx={{ fontSize: 14 }} /> },
  TIMELINE_EVENT_DELETED:     { color: '#B91C1C', bg: '#FEE2E2', icon: <TimelineIcon    sx={{ fontSize: 14 }} /> },
  SIGNATURE_SIGNED:           { color: '#065F46', bg: '#ECFDF3', icon: <SignatureIcon   sx={{ fontSize: 14 }} /> },
  SIGNATURE_SIGNATORIES_SET:  { color: '#1D4ED8', bg: '#EFF6FF', icon: <GroupIcon       sx={{ fontSize: 14 }} /> },
  ADVANCED:                   { color: '#92400E', bg: '#FEF3C7', icon: <AdvancedIcon    sx={{ fontSize: 14 }} /> },
  ROLLED_BACK:                { color: '#DC2626', bg: '#FEE2E2', icon: <RollbackIcon    sx={{ fontSize: 14 }} /> },
  APPROVED:                   { color: '#065F46', bg: '#ECFDF3', icon: <CheckCircleIcon sx={{ fontSize: 14 }} /> },
};

const buildDescription = (log: AuditLog): { title: string; detail?: string } => {
  const comp = log.componentLabel ? `em "${log.componentLabel}"` : '';
  switch (log.action) {
    case 'FORM_SUBMITTED':          return { title: `Formulário preenchido${comp ? ` — ${log.componentLabel}` : ''}` };
    case 'FORM_UPDATED':            return { title: `Formulário atualizado${comp ? ` — ${log.componentLabel}` : ''}` };
    case 'FILE_UPLOADED':           return { title: `Arquivo enviado${comp ? ` em "${log.componentLabel}"` : ''}`, detail: log.fileName };
    case 'FILE_SENT_TO_APPROVAL':   return { title: `Arquivo enviado para análise${comp ? ` em "${log.componentLabel}"` : ''}`, detail: log.fileName };
    case 'FILE_APPROVED':           return { title: `Arquivo aprovado${comp ? ` em "${log.componentLabel}"` : ''}`, detail: log.fileName ?? log.reason };
    case 'FILE_REJECTED':           return { title: `Correções solicitadas${comp ? ` em "${log.componentLabel}"` : ''}`, detail: log.fileName ?? log.reason };
    case 'COMMENT_ADDED':           return { title: `Comentário adicionado${comp ? ` em "${log.componentLabel}"` : ''}` };
    case 'CHECKLIST_ITEM_CREATED':  return { title: `Nova tarefa criada${comp ? ` em "${log.componentLabel}"` : ''}`, detail: log.taskTitle };
    case 'CHECKLIST_ITEM_COMPLETED':return { title: `Tarefa concluída${comp ? ` em "${log.componentLabel}"` : ''}`, detail: log.taskTitle };
    case 'CHECKLIST_ITEM_UNCOMPLETED': return { title: `Tarefa desmarcada${comp ? ` em "${log.componentLabel}"` : ''}`, detail: log.taskTitle };
    case 'CHECKLIST_ITEM_UPDATED':  return { title: `Tarefa atualizada${comp ? ` em "${log.componentLabel}"` : ''}`, detail: log.taskTitle };
    case 'CHECKLIST_ITEM_DELETED':  return { title: `Tarefa removida${comp ? ` em "${log.componentLabel}"` : ''}`, detail: log.taskTitle };
    case 'TIMELINE_EVENT_CREATED':  return { title: `Evento criado no cronograma${comp ? ` — "${log.componentLabel}"` : ''}`, detail: log.eventTitle };
    case 'TIMELINE_EVENT_UPDATED':  return { title: `Evento atualizado no cronograma${comp ? ` — "${log.componentLabel}"` : ''}`, detail: log.eventTitle };
    case 'TIMELINE_EVENT_DELETED':  return { title: `Evento removido do cronograma${comp ? ` — "${log.componentLabel}"` : ''}`, detail: log.eventTitle };
    case 'SIGNATURE_SIGNED':        return { title: `Documento assinado${comp ? ` em "${log.componentLabel}"` : ''}` };
    case 'SIGNATURE_SIGNATORIES_SET': return { title: `Signatários definidos${comp ? ` em "${log.componentLabel}"` : ''}`, detail: log.signatories?.join(', ') };
    case 'ADVANCED':                return { title: 'Etapa avançada manualmente', detail: log.reason };
    case 'ROLLED_BACK':             return { title: `Etapa retrocedida`, detail: `${log.fromStageName ?? ''} → ${log.toStageName ?? ''}${log.reason ? `\n${log.reason}` : ''}` };
    case 'APPROVED':                return { title: 'Etapa aprovada', detail: log.reason };
    default:                        return { title: log.action.replace(/_/g, ' ').toLowerCase(), detail: log.reason };
  }
};

const formatDate = (date: string) => {
  const d = new Date(date);
  return `${d.toLocaleDateString('pt-BR')} às ${d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
};

const getPerformedBy = (p: PerformedBy) => {
  if (typeof p === 'object' && p !== null) {
    return {
      name: `${p.firstName?.trim()} ${p.lastName?.trim()}`.trim(),
      initials: `${p.firstName?.charAt(0) || ''}${p.lastName?.charAt(0) || ''}`.toUpperCase(),
      avatarUrl: p.avatarUrl ?? undefined,
    };
  }
  if (typeof p === 'string' && p) {
    return { name: `Usuário (${p.slice(-6)})`, initials: '?', avatarUrl: undefined };
  }
  return null;
};

const CommentAttachment = ({ fileName, fileId, mimeType, directUrl }: {
  fileName: string;
  fileId?: string;
  mimeType?: string;
  directUrl?: string;
}) => {
  const downloadMutation = useDownloadFile();
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);
  const isImage = mimeType?.startsWith('image/') || /\.(png|jpe?g|gif|webp|svg)$/i.test(fileName);

  const handleClick = async () => {
    if (directUrl) {
      if (isImage) { setLightboxUrl(directUrl); return; }
      window.open(directUrl, '_blank');
      return;
    }
    if (!fileId) return;
    const result = await downloadMutation.mutateAsync({ fileId, inline: true });
    if (result?.signedUrl) {
      if (isImage) { setLightboxUrl(result.signedUrl); return; }
      window.open(result.signedUrl, '_blank');
    }
  };

  return (
    <>
      <Box onClick={handleClick}
        sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.75, px: 1.25, py: 0.75, bgcolor: '#F1F5F9', borderRadius: 1.5, border: '1px solid #E4E6EB', cursor: (fileId || directUrl) ? 'pointer' : 'default', mt: 0.5, mb: 0.75, '&:hover': (fileId || directUrl) ? { borderColor: '#1877F2', bgcolor: '#EFF6FF' } : {} }}>
        {isImage ? <ImageIcon sx={{ fontSize: 16, color: '#1877F2' }} /> : <AttachFileIcon sx={{ fontSize: 16, color: '#64748b' }} />}
        <Typography sx={{ fontSize: '0.78rem', color: '#0f172a', fontWeight: 600, maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {fileName}
        </Typography>
        {downloadMutation.isPending && <Box component='span' sx={{ fontSize: '0.7rem', color: '#94a3b8', ml: 0.5 }}>...</Box>}
      </Box>
      {lightboxUrl && (
        <Dialog open onClose={() => setLightboxUrl(null)} maxWidth={false}
          PaperProps={{ sx: { bgcolor: 'transparent', boxShadow: 'none', m: 1 } }}
          onClick={() => setLightboxUrl(null)}>
          <Box component='img' src={lightboxUrl} sx={{ maxWidth: '90vw', maxHeight: '90vh', borderRadius: 2, display: 'block', cursor: 'zoom-out' }} />
        </Dialog>
      )}
    </>
  );
};

export const ActionHistory = ({ stageExecutions, snapshotStages, stages, processId, instanceId }: ActionHistoryProps) => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [collapsed, setCollapsed] = useState(false);
  const [modalStage, setModalStage] = useState<ProcessFlowStageCard | null>(null);
  const [exportLoading, setExportLoading] = useState(false);

  const handleExportAudit = async () => {
    setExportLoading(true);
    try {
      const response = await api.get(`/flows/instances/${instanceId}/audit-export`, { responseType: 'blob' });
      const url = URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      const a = document.createElement('a');
      a.href = url;
      a.download = `auditoria-${instanceId}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setExportLoading(false);
    }
  };

  const handleLogClick = (stageId: string) => {
    const stage = stages.find(s => s.stageId === stageId);
    if (stage) setModalStage(stage);
  };

  const allLogs = useMemo(() => {
    const logs: (AuditLog & { _stageName: string; _stageOrder: number; _stageId: string })[] = [];
    stageExecutions.forEach((exec) => {
      const snap = snapshotStages.find(s => s.stageId === exec.stageId);
      (exec.auditLogs || []).forEach((log) => {
        logs.push({
          ...log,
          _stageName: log.stageName || snap?.name || 'Etapa desconhecida',
          _stageOrder: snap?.order ?? exec.stageOrder ?? 0,
          _stageId: exec.stageId,
        });
      });
    });
    return logs.sort((a, b) => a.performedAt > b.performedAt ? 1 : -1);
  }, [stageExecutions, snapshotStages]);

  const totalItems = allLogs.length;
  const totalPages = Math.ceil(totalItems / limit);
  const paginated = allLogs.slice((page - 1) * limit, page * limit);

  return (
    <Box sx={{ mb: 6 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <HistoryIcon sx={{ color: '#64748b' }} />
          <Typography variant='h6' sx={{ fontWeight: 800, color: '#0f172a' }}>Histórico de Ações</Typography>
          {totalItems > 0 && <Chip label={totalItems} size='small' sx={{ bgcolor: '#F1F5F9', color: '#64748b', fontWeight: 700, fontSize: '0.75rem', height: 22 }} />}
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {totalItems > 0 && (
            <Button
              variant='outlined'
              onClick={handleExportAudit}
              disabled={exportLoading}
              startIcon={exportLoading ? <CircularProgress size={16} /> : <PdfIcon sx={{ color: '#DC2626' }} />}
              sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 2, borderColor: '#E4E6EB', color: '#64748b', '&:hover': { borderColor: '#DC2626', color: '#DC2626', bgcolor: '#FEF2F2' } }}
            >
              {exportLoading ? 'Gerando PDF...' : 'Exportar auditoria'}
            </Button>
          )}
          <IconButton size='small' onClick={() => setCollapsed(v => !v)} sx={{ color: '#64748b' }}>
            {collapsed ? <ExpandMoreIcon fontSize='small' /> : <ExpandLessIcon fontSize='small' />}
          </IconButton>
        </Box>
      </Box>

      <Collapse in={!collapsed}>
        {totalItems === 0 ? (
          <Box sx={{ bgcolor: '#FAFBFC', border: '1px dashed #E4E6EB', borderRadius: 3, p: 6, textAlign: 'center' }}>
            <Typography variant='body1' sx={{ color: '#64748b', fontWeight: 500 }}>Nenhuma ação realizada no processo ainda.</Typography>
          </Box>
        ) : (
          <Box sx={{ bgcolor: '#fff', border: '1px solid #E4E6EB', borderRadius: 3, overflow: 'hidden' }}>
            <Box sx={{ p: 2.5 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                {paginated.map((log, idx) => {
                  const cfg = actionConfig[log.action];
                  const isLast = idx === paginated.length - 1;
                  const performer = getPerformedBy(log.performedBy);
                  const { title, detail } = buildDescription(log);
                  if (!cfg) return null;

                  // avatarMap para menções no comentário
                  const mentionAvatarMap = (log.commentMentions || []).reduce<Record<string, string | null>>((acc, m) => {
                    // performedBy pode ter o avatar do autor; para outros mencionados não temos aqui
                    if (typeof log.performedBy === 'object' && log.performedBy?._id === m.userId) {
                      acc[m.userId] = log.performedBy.avatarUrl ?? null;
                    }
                    return acc;
                  }, {});

                  return (
                    <Box key={idx} sx={{ display: 'flex', gap: 0, cursor: 'pointer', borderRadius: 2, p: 0.5, mx: -0.5, '&:hover': { bgcolor: '#F8FAFC' }, transition: 'background 0.15s' }}
                      onClick={() => handleLogClick(log._stageId)}>
                      {/* Linha do tempo */}
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mr: 2, flexShrink: 0 }}>
                        <Box sx={{ width: 32, height: 32, borderRadius: '50%', bgcolor: cfg.bg, border: `2px solid ${cfg.color}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {cfg.icon}
                        </Box>
                        {!isLast && <Box sx={{ width: 2, flex: 1, bgcolor: '#E4E6EB', my: 0.5, minHeight: 24 }} />}
                      </Box>

                      {/* Conteúdo */}
                      <Box sx={{ flex: 1, pb: isLast ? 0 : 3, pt: 0.25, minWidth: 0 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', mb: 0.5 }}>
                          <Typography sx={{ fontWeight: 700, color: cfg.color, fontSize: '0.875rem' }}>{title}</Typography>
                          <Chip label={log._stageName} size='small' sx={{ bgcolor: '#F1F5F9', color: '#475569', fontWeight: 600, fontSize: '0.7rem', height: 18 }} />
                        </Box>

                        {/* Comentário com menções */}
                        {log.action === 'COMMENT_ADDED' && log.commentText && (
                          <Typography component='div' sx={{ fontSize: '0.8rem', color: '#475569', mb: 0.5, wordBreak: 'break-word', whiteSpace: 'pre-wrap' }}>
                            <Box component='span' sx={{ fontWeight: 700, color: '#0f172a' }}>Comentário: </Box>
                            {renderCommentText(log.commentText, log.commentMentions, mentionAvatarMap)}
                          </Typography>
                        )}

                        {/* Anexo do comentário */}
                        {log.action === 'COMMENT_ADDED' && log.commentAttachmentFileName && (
                          <CommentAttachment
                            fileName={log.commentAttachmentFileName}
                            fileId={log.commentAttachmentFileId}
                            mimeType={log.commentAttachmentMimeType}
                            directUrl={log.commentAttachmentUrl}
                          />
                        )}

                        {/* Detalhe para outras ações */}
                        {log.action !== 'COMMENT_ADDED' && detail && (
                          <Typography sx={{ fontSize: '0.8rem', color: '#475569', mb: 0.5, wordBreak: 'break-word', whiteSpace: 'pre-wrap' }}>
                            {detail}
                          </Typography>
                        )}

                        {/* Autor + data */}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                          {performer && (
                            <>
                              <Avatar src={performer.avatarUrl} sx={{ width: 18, height: 18, bgcolor: '#1877F2', fontSize: '0.6rem', fontWeight: 700 }}>
                                {!performer.avatarUrl && performer.initials}
                              </Avatar>
                              <Typography variant='caption' sx={{ color: '#475569', fontWeight: 600 }}>{performer.name}</Typography>
                              <Typography variant='caption' sx={{ color: '#94a3b8' }}>•</Typography>
                            </>
                          )}
                          <Typography variant='caption' sx={{ color: '#94a3b8' }}>{formatDate(log.performedAt)}</Typography>
                        </Box>
                      </Box>
                    </Box>
                  );
                })}
              </Box>
            </Box>

            {/* Paginação */}
            <Box sx={{ px: 2.5, py: 1.5, borderTop: '1px solid #E4E6EB', bgcolor: '#F8FAFC', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
              <Typography variant='body2' sx={{ color: '#64748b', fontSize: '0.8rem' }}>
                {(page - 1) * limit + 1}–{Math.min(page * limit, totalItems)} de {totalItems}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Select value={limit} size='small' onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }} sx={{ fontSize: '0.8rem', height: 30 }}>
                  {[10, 25, 50].map(l => <MenuItem key={l} value={l}>{l} por página</MenuItem>)}
                </Select>
                <Box sx={{ display: 'flex', gap: 0.5 }}>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                    <Box key={p} onClick={() => setPage(p)}
                      sx={{ width: 28, height: 28, borderRadius: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontWeight: 700, fontSize: '0.8rem', bgcolor: p === page ? '#1877F2' : '#fff', color: p === page ? '#fff' : '#64748b', border: '1px solid', borderColor: p === page ? '#1877F2' : '#E4E6EB', '&:hover': { borderColor: '#1877F2', color: p === page ? '#fff' : '#1877F2' } }}>
                      {p}
                    </Box>
                  ))}
                </Box>
              </Box>
            </Box>
          </Box>
        )}
      </Collapse>

      <ProcessStageModal
        isOpen={!!modalStage}
        onClose={() => setModalStage(null)}
        stage={modalStage}
        processId={processId}
        instanceId={instanceId}
        stageStatus={modalStage?.status}
        canManage={false}
      />
    </Box>
  );
};
