import { useState } from 'react';
import {
  Description as DescriptionIcon,
  OpenInNew as OpenInNewIcon,
  Download as DownloadIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material';
import { Box, Chip, CircularProgress, Collapse, IconButton, Tooltip, Typography } from '@mui/material';
import { useFilesByProcess, useDownloadFile } from '@/hooks';

type RelatedDocumentsProps = {
  processId: string;
};

const getStatusChip = (status?: string) => {
  if (status === 'approved') return { label: 'Aprovado', bg: '#ECFDF3', color: '#065F46', icon: <CheckCircleIcon sx={{ fontSize: 14 }} /> };
  if (status === 'in_review' || status === 'pending_approval') return { label: 'Em análise', bg: '#FEF3C7', color: '#92400E', icon: <ScheduleIcon sx={{ fontSize: 14 }} /> };
  if (status === 'rejected') return { label: 'Rejeitado', bg: '#FEE2E2', color: '#B91C1C', icon: <CancelIcon sx={{ fontSize: 14 }} /> };
  return { label: 'Rascunho', bg: '#F1F5F9', color: '#64748b', icon: <DescriptionIcon sx={{ fontSize: 14 }} /> };
};

export const RelatedDocuments = ({ processId }: RelatedDocumentsProps) => {
  const { data, isLoading } = useFilesByProcess(processId);
  const downloadMutation = useDownloadFile();
  const [collapsed, setCollapsed] = useState(false);
  const [expandedStages, setExpandedStages] = useState<Record<string, boolean>>({});

  const handleDownload = async (fileId: string, inline: boolean) => {
    const result = await downloadMutation.mutateAsync({ fileId, inline });
    if (result?.signedUrl) window.open(result.signedUrl, '_blank');
  };

  const toggleStage = (stageId: string) => {
    setExpandedStages(prev => ({ ...prev, [stageId]: !prev[stageId] }));
  };

  // data é um array de grupos: [{ stageId, stageName, stageOrder, files: [...] }]
  const groups: any[] = Array.isArray(data) ? data : [];
  const totalFiles = groups.reduce((acc, g) => acc + (g.files?.length || 0), 0);

  return (
    <Box sx={{ mb: 6 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <DescriptionIcon sx={{ color: '#64748b' }} />
          <Typography variant='h6' sx={{ fontWeight: 800, color: '#0f172a' }}>
            Documentos Relacionados
          </Typography>
          {totalFiles > 0 && (
            <Chip label={totalFiles} size='small' sx={{ bgcolor: '#F1F5F9', color: '#64748b', fontWeight: 700, fontSize: '0.75rem', height: 22 }} />
          )}
        </Box>
        <IconButton size='small' onClick={() => setCollapsed(v => !v)} sx={{ color: '#64748b' }}>
          {collapsed ? <ExpandMoreIcon fontSize='small' /> : <ExpandLessIcon fontSize='small' />}
        </IconButton>
      </Box>

      <Collapse in={!collapsed}>
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress size={24} />
          </Box>
        ) : totalFiles === 0 ? (
          <Box sx={{ bgcolor: '#FAFBFC', border: '1px dashed #E4E6EB', borderRadius: 3, p: 6, textAlign: 'center' }}>
            <Typography variant='body1' sx={{ color: '#64748b', fontWeight: 500 }}>
              Nenhum documento encontrado.
            </Typography>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {groups
              .filter(g => g.files?.length > 0)
              .sort((a, b) => (a.stageOrder ?? 0) - (b.stageOrder ?? 0))
              .map((group) => {
                const isExpanded = expandedStages[group.stageId] !== false; // default aberto
                return (
                  <Box key={group.stageId} sx={{ border: '1px solid #E4E6EB', borderRadius: 2, overflow: 'hidden', bgcolor: '#fff' }}>
                    {/* Header do grupo */}
                    <Box
                      onClick={() => toggleStage(group.stageId)}
                      sx={{ px: 2.5, py: 1.5, bgcolor: '#F8FAFC', borderBottom: isExpanded ? '1px solid #E4E6EB' : 'none', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', '&:hover': { bgcolor: '#F1F5F9' } }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Typography sx={{ fontWeight: 700, color: '#0f172a', fontSize: '0.9rem' }}>
                          {group.stageName || `Etapa ${group.stageOrder}`}
                        </Typography>
                        <Chip label={`${group.files.length} arquivo${group.files.length !== 1 ? 's' : ''}`} size='small'
                          sx={{ bgcolor: '#E7F3FF', color: '#1877F2', fontWeight: 700, fontSize: '0.7rem', height: 20 }} />
                      </Box>
                      <IconButton size='small' sx={{ color: '#64748b' }}>
                        {isExpanded ? <ExpandLessIcon fontSize='small' /> : <ExpandMoreIcon fontSize='small' />}
                      </IconButton>
                    </Box>

                    {/* Arquivos */}
                    <Collapse in={isExpanded}>
                      <Box>
                        {group.files.map((file: any, idx: number) => {
                          const status = getStatusChip(file.status);
                          return (
                            <Box key={file._id}
                              sx={{ px: 2.5, py: 1.5, display: 'flex', alignItems: 'center', gap: 1.5, borderBottom: idx < group.files.length - 1 ? '1px solid #F1F5F9' : 'none', '&:hover': { bgcolor: '#F8FAFC' } }}>
                              <Box sx={{ width: 36, height: 36, borderRadius: 2, bgcolor: '#E7F3FF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                <DescriptionIcon sx={{ color: '#1877F2', fontSize: 20 }} />
                              </Box>
                              <Box sx={{ flex: 1, minWidth: 0 }}>
                                <Typography sx={{ fontWeight: 700, color: '#0f172a', fontSize: '0.875rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                  {file.fileName}
                                </Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5, flexWrap: 'wrap' }}>
                                  {file.version && <Chip label={`v${file.version}`} size='small' sx={{ bgcolor: '#E7F3FF', color: '#1877F2', fontWeight: 700, fontSize: '0.7rem', height: 18 }} />}
                                  {file.category && <Chip label={file.category} size='small' sx={{ bgcolor: '#ECFDF3', color: '#065F46', fontWeight: 700, fontSize: '0.7rem', height: 18 }} />}
                                  <Chip icon={status.icon as any} label={status.label} size='small'
                                    sx={{ bgcolor: status.bg, color: status.color, fontWeight: 700, fontSize: '0.7rem', height: 18, '& .MuiChip-icon': { color: status.color } }} />
                                  {file.uploadedBy && (
                                    <Typography variant='caption' sx={{ color: '#94a3b8' }}>
                                      {file.uploadedBy.firstName} {file.uploadedBy.lastName}
                                    </Typography>
                                  )}
                                </Box>
                              </Box>
                              <Box sx={{ display: 'flex', gap: 0.5, flexShrink: 0 }}>
                                <Tooltip title='Abrir em nova aba'>
                                  <IconButton size='small' onClick={() => handleDownload(file._id, true)}
                                    sx={{ border: '1px solid #E4E6EB', borderRadius: 1.5, '&:hover': { borderColor: '#1877F2', bgcolor: '#F0F9FF' } }}>
                                    <OpenInNewIcon sx={{ fontSize: 16, color: '#1877F2' }} />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title='Baixar'>
                                  <IconButton size='small' onClick={() => handleDownload(file._id, false)}
                                    sx={{ border: '1px solid #E4E6EB', borderRadius: 1.5, '&:hover': { borderColor: '#1877F2', bgcolor: '#F0F9FF' } }}>
                                    <DownloadIcon sx={{ fontSize: 16, color: '#1877F2' }} />
                                  </IconButton>
                                </Tooltip>
                              </Box>
                            </Box>
                          );
                        })}
                      </Box>
                    </Collapse>
                  </Box>
                );
              })}
          </Box>
        )}
      </Collapse>
    </Box>
  );
};
