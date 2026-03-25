import { useState, useMemo, useEffect } from 'react';
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
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import { Avatar, Box, Chip, Collapse, IconButton, MenuItem, Select, Typography } from '@mui/material';
import { useUsers } from '@/hooks/useUsers';

type AuditLog = {
  action: string;
  performedBy: string;
  performedAt: string;
  stageName?: string;
  componentKey?: string;
  componentLabel?: string;
  reason?: string;
  fileName?: string;
  fileId?: string;
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
};

const actionMap: Record<string, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  FORM_SUBMITTED:           { label: 'Formulário enviado',        color: '#1D4ED8', bg: '#EFF6FF', icon: <FormIcon sx={{ fontSize: 14 }} /> },
  FORM_UPDATED:             { label: 'Formulário atualizado',     color: '#1D4ED8', bg: '#EFF6FF', icon: <FormIcon sx={{ fontSize: 14 }} /> },
  FILE_UPLOADED:            { label: 'Arquivo enviado',           color: '#7C3AED', bg: '#F5F3FF', icon: <UploadIcon sx={{ fontSize: 14 }} /> },
  FILE_SENT_TO_APPROVAL:    { label: 'Enviado para análise',      color: '#92400E', bg: '#FEF3C7', icon: <SendIcon sx={{ fontSize: 14 }} /> },
  FILE_APPROVED:            { label: 'Arquivo aprovado',          color: '#065F46', bg: '#ECFDF3', icon: <CheckCircleIcon sx={{ fontSize: 14 }} /> },
  FILE_REJECTED:            { label: 'Correções solicitadas',     color: '#B91C1C', bg: '#FEE2E2', icon: <CancelIcon sx={{ fontSize: 14 }} /> },
  COMMENT_ADDED:            { label: 'Comentário adicionado',     color: '#0369A1', bg: '#E0F2FE', icon: <CommentIcon sx={{ fontSize: 14 }} /> },
  CHECKLIST_ITEM_CREATED:   { label: 'Tarefa criada',             color: '#065F46', bg: '#ECFDF3', icon: <ChecklistIcon sx={{ fontSize: 14 }} /> },
  CHECKLIST_ITEM_COMPLETED: { label: 'Tarefa concluída',          color: '#065F46', bg: '#ECFDF3', icon: <CheckCircleIcon sx={{ fontSize: 14 }} /> },
  CHECKLIST_ITEM_UNCOMPLETED:{ label: 'Tarefa desmarcada',        color: '#92400E', bg: '#FEF3C7', icon: <ScheduleIcon sx={{ fontSize: 14 }} /> },
  CHECKLIST_ITEM_UPDATED:   { label: 'Tarefa atualizada',         color: '#1D4ED8', bg: '#EFF6FF', icon: <ChecklistIcon sx={{ fontSize: 14 }} /> },
  TIMELINE_EVENT_CREATED:   { label: 'Evento criado',             color: '#7C3AED', bg: '#F5F3FF', icon: <TimelineIcon sx={{ fontSize: 14 }} /> },
  TIMELINE_EVENT_UPDATED:   { label: 'Evento atualizado',         color: '#7C3AED', bg: '#F5F3FF', icon: <TimelineIcon sx={{ fontSize: 14 }} /> },
  TIMELINE_EVENT_DELETED:   { label: 'Evento removido',           color: '#B91C1C', bg: '#FEE2E2', icon: <TimelineIcon sx={{ fontSize: 14 }} /> },
  SIGNATURE_SIGNED:         { label: 'Documento assinado',        color: '#065F46', bg: '#ECFDF3', icon: <SignatureIcon sx={{ fontSize: 14 }} /> },
  SIGNATURE_SIGNATORIES_SET:{ label: 'Signatários definidos',     color: '#1D4ED8', bg: '#EFF6FF', icon: <SignatureIcon sx={{ fontSize: 14 }} /> },
  ADVANCED:                 { label: 'Etapa avançada',            color: '#92400E', bg: '#FEF3C7', icon: <AdvancedIcon sx={{ fontSize: 14 }} /> },
  APPROVED:                 { label: 'Etapa aprovada',            color: '#065F46', bg: '#ECFDF3', icon: <CheckCircleIcon sx={{ fontSize: 14 }} /> },
};

const formatDate = (date: string) => {
  const d = new Date(date);
  return `${d.toLocaleDateString('pt-BR')} às ${d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
};

export const ActionHistory = ({ stageExecutions, snapshotStages }: ActionHistoryProps) => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [collapsed, setCollapsed] = useState(false);
  const { users, fetchUsers } = useUsers();

  useEffect(() => { fetchUsers({ limit: 100 }); }, [fetchUsers]);

  const userMap = useMemo(() => {
    const map: Record<string, { name: string; initials: string }> = {};
    users.forEach(u => {
      map[u._id!] = {
        name: `${u.firstName?.trim()} ${u.lastName?.trim()}`.trim(),
        initials: `${u.firstName?.charAt(0) || ''}${u.lastName?.charAt(0) || ''}`.toUpperCase(),
      };
    });
    return map;
  }, [users]);

  // Flatten todos os auditLogs de todas as etapas, enriquecendo com nome da etapa
  const allLogs = useMemo(() => {
    const logs: (AuditLog & { stageName: string; stageOrder: number })[] = [];
    stageExecutions.forEach((exec) => {
      const snap = snapshotStages.find(s => s.stageId === exec.stageId);
      (exec.auditLogs || []).forEach((log) => {
        logs.push({
          ...log,
          stageName: log.stageName || snap?.name || 'Etapa desconhecida',
          stageOrder: snap?.order ?? exec.stageOrder ?? 0,
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
          <Typography variant='h6' sx={{ fontWeight: 800, color: '#0f172a' }}>
            Histórico de Ações
          </Typography>
          {totalItems > 0 && (
            <Chip label={totalItems} size='small' sx={{ bgcolor: '#F1F5F9', color: '#64748b', fontWeight: 700, fontSize: '0.75rem', height: 22 }} />
          )}
        </Box>
        <IconButton size='small' onClick={() => setCollapsed(v => !v)} sx={{ color: '#64748b' }}>
          {collapsed ? <ExpandMoreIcon fontSize='small' /> : <ExpandLessIcon fontSize='small' />}
        </IconButton>
      </Box>

      <Collapse in={!collapsed}>
        {totalItems === 0 ? (
          <Box sx={{ bgcolor: '#FAFBFC', border: '1px dashed #E4E6EB', borderRadius: 3, p: 6, textAlign: 'center' }}>
            <Typography variant='body1' sx={{ color: '#64748b', fontWeight: 500 }}>
              Nenhuma ação realizada no processo ainda.
            </Typography>
          </Box>
        ) : (
          <Box sx={{ bgcolor: '#fff', border: '1px solid #E4E6EB', borderRadius: 3, overflow: 'hidden' }}>
            <Box sx={{ p: 2.5 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                {paginated.map((log, idx) => {
                  const cfg = actionMap[log.action];
                  const isLast = idx === paginated.length - 1;
                  if (!cfg) return null;
                  return (
                    <Box key={idx} sx={{ display: 'flex', gap: 0 }}>
                      {/* Linha do tempo */}
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mr: 2, flexShrink: 0 }}>
                        <Box sx={{ width: 30, height: 30, borderRadius: '50%', bgcolor: cfg.bg, border: `2px solid ${cfg.color}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {cfg.icon}
                        </Box>
                        {!isLast && <Box sx={{ width: 2, flex: 1, bgcolor: '#E4E6EB', my: 0.5, minHeight: 20 }} />}
                      </Box>
                      {/* Conteúdo */}
                      <Box sx={{ flex: 1, pb: isLast ? 0 : 2.5, pt: 0.25, minWidth: 0 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', mb: 0.25 }}>
                          <Typography sx={{ fontWeight: 700, color: cfg.color, fontSize: '0.85rem' }}>
                            {cfg.label}
                          </Typography>
                          <Chip label={log.stageName} size='small'
                            sx={{ bgcolor: '#F1F5F9', color: '#475569', fontWeight: 600, fontSize: '0.7rem', height: 18 }} />
                          {log.componentLabel && (
                            <Chip label={log.componentLabel} size='small'
                              sx={{ bgcolor: cfg.bg, color: cfg.color, fontWeight: 600, fontSize: '0.7rem', height: 18 }} />
                          )}
                        </Box>
                        {log.fileName && (
                          <Typography sx={{ fontSize: '0.78rem', color: '#475569', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', mb: 0.25 }}>
                            {log.fileName}
                          </Typography>
                        )}
                        {log.reason && (
                          <Typography variant='caption' sx={{ color: '#64748b', fontStyle: 'italic', display: 'block', mb: 0.25 }}>
                            "{log.reason.trim()}"
                          </Typography>
                        )}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mt: 0.5 }}>
                          {(() => {
                            const u = userMap[log.performedBy];
                            return u ? (
                              <>
                                <Avatar sx={{ width: 18, height: 18, bgcolor: '#1877F2', fontSize: '0.6rem', fontWeight: 700 }}>{u.initials}</Avatar>
                                <Typography variant='caption' sx={{ color: '#475569', fontWeight: 600 }}>{u.name}</Typography>
                                <Typography variant='caption' sx={{ color: '#94a3b8' }}>•</Typography>
                              </>
                            ) : (
                              <PersonIcon sx={{ fontSize: 14, color: '#94a3b8' }} />
                            );
                          })()}
                          <Typography variant='caption' sx={{ color: '#94a3b8' }}>
                            {formatDate(log.performedAt)}
                          </Typography>
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
                <Select value={limit} size='small' onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }}
                  sx={{ fontSize: '0.8rem', height: 30 }}>
                  {[10, 25, 50].map(l => <MenuItem key={l} value={l}>{l} por página</MenuItem>)}
                </Select>
                <Box sx={{ display: 'flex', gap: 0.5 }}>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                    <Box key={p} onClick={() => setPage(p)}
                      sx={{ width: 28, height: 28, borderRadius: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontWeight: 700, fontSize: '0.8rem',
                        bgcolor: p === page ? '#1877F2' : '#fff', color: p === page ? '#fff' : '#64748b',
                        border: '1px solid', borderColor: p === page ? '#1877F2' : '#E4E6EB',
                        '&:hover': { borderColor: '#1877F2', color: p === page ? '#fff' : '#1877F2' }
                      }}>
                      {p}
                    </Box>
                  ))}
                </Box>
              </Box>
            </Box>
          </Box>
        )}
      </Collapse>
    </Box>
  );
};
