import { useState, useEffect } from 'react';
import {
  Autocomplete, Box, Button, Chip, CircularProgress, Dialog, Divider,
  IconButton, Tab, Tabs, TextField, Tooltip, Typography, MenuItem, Avatar,
} from '@mui/material';
import {
  Close as CloseIcon,
  Business as DeptIcon,
  Add as AddIcon,
  Check as CheckIcon,
  LayersOutlined as StagesIcon,
  EditNote as InfoIcon,
  DragIndicator as DragIcon,
  Save as SaveIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import type { FlowInstance } from '@/hooks/useFlowInstance';
import {
  useUpdateProcess,
  useUpdateStageResponsibleDepartments,
  useAddOptionalStage,
  useRemoveOptionalStage,
  useReorderStages,
} from '@/hooks/useFlowInstance';
import { useNotification } from '@/components/NotificationProvider';
import { useUsers } from '@/hooks/useUsers';
import { useDepartments } from '@/hooks';

type Dept = { _id: string; department_name: string; department_acronym: string };
type User = { _id: string; firstName: string; lastName: string; email: string };

const getDept = (d: any): Dept | null => typeof d === 'object' && d !== null ? d as Dept : null;
const getUser = (u: any): User | null => typeof u === 'object' && u !== null ? u as User : null;

type Props = {
  open: boolean;
  onClose: () => void;
  flowInstance: FlowInstance;
  initialTab?: number;
};

const MODALITIES = [
  'Pregão Eletrônico', 'Pregão Presencial', 'Concorrência', 'Tomada de Preços',
  'Convite', 'Concurso', 'Leilão', 'Dispensa de Licitação', 'Inexigibilidade',
];

export const EditProcessModal = ({ open, onClose, flowInstance, initialTab = 0 }: Props) => {
  const [tab, setTab] = useState(initialTab);
  const { showNotification } = useNotification();
  const updateProcessMutation = useUpdateProcess();
  const updateDeptsMutation = useUpdateStageResponsibleDepartments();
  const addOptionalMutation = useAddOptionalStage();
  const removeOptionalMutation = useRemoveOptionalStage();
  const reorderMutation = useReorderStages();
  const { users, fetchUsers } = useUsers();
  const { departments, fetchDepartments } = useDepartments();

  const p = flowInstance.process;

  // ── Aba Informações ──────────────────────────────────────────────
  const [form, setForm] = useState({
    processNumber: '', object: '', dueDate: '', priority: 'Média', modality: '', estimatedValue: '', situation: '',
  });
  const [selectedManagers, setSelectedManagers] = useState<User[]>([]);
  const [selectedParticipating, setSelectedParticipating] = useState<Dept[]>([]);

  useEffect(() => {
    if (!open) return;
    setTab(initialTab);
    setForm({
      processNumber: p.processNumber ?? '',
      object: p.object ?? '',
      dueDate: p.dueDate ? p.dueDate.slice(0, 10) : '',
      priority: p.priority ?? 'Média',
      modality: p.modality ?? '',
      estimatedValue: p.estimatedValue != null ? moneyFromValue(p.estimatedValue) : '',
      situation: p.situation ?? '',
    });
    // Carrega users e departments para popular os autocompletes
    fetchUsers({ limit: 100 });
    fetchDepartments();
    setSelectedManagers((p.managers || []).map(getUser).filter(Boolean) as User[]);
    setSelectedParticipating(p.participatingDepartments.map(getDept).filter(Boolean) as Dept[]);
  }, [open, initialTab]);

  // Máscara BRL — recebe string de dígitos (centavos) ou valor em reais
  const formatMoney = (raw: string) => {
    const digits = raw.replace(/\D/g, '');
    if (!digits) return '';
    const num = Number(digits) / 100;
    return num.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  // Converte valor em reais para string de centavos para o formatMoney
  const moneyFromValue = (val: number) =>
    formatMoney(String(Math.round(val * 100)));

  const parseMoney = (masked: string) =>
    Number(masked.replace(/\./g, '').replace(',', '.')) || undefined;

  const handleMoneyChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, estimatedValue: formatMoney(e.target.value) }));

  const [confirmOpen, setConfirmOpen] = useState(false);

  const handleSaveInfo = () => setConfirmOpen(true);

  const handleConfirmSave = () => {
    setConfirmOpen(false);
    updateProcessMutation.mutate({
      processId: p._id,
      data: {
        ...form,
        estimatedValue: parseMoney(form.estimatedValue),
        managers: selectedManagers.map(u => u._id),
        participatingDepartments: selectedParticipating.map(d => d._id),
      },
    }, {
      onSuccess: () => showNotification('Processo atualizado!', 'success'),
      onError: (e: any) => showNotification(e?.message || 'Erro ao atualizar', 'error'),
    });
  };

  // Gerências disponíveis = criadora + participantes salvas + selecionadas + já atribuídas em etapas
  const availableDepts: Dept[] = [];
  const creator = getDept(p.creatorDepartment);
  if (creator) availableDepts.push(creator);
  [
    ...p.participatingDepartments.map(getDept),
    ...selectedParticipating,
    ...flowInstance.snapshotStages.flatMap(s => (s.responsibleDepartments || []).map(getDept)),
  ]
    .filter(Boolean)
    .forEach(dept => {
      if (dept && !availableDepts.find(a => a._id === dept._id)) availableDepts.push(dept);
    });

  const getSelectedDepts = (stage: FlowInstance['snapshotStages'][0]) =>
    (stage.responsibleDepartments || []).map(d => typeof d === 'object' ? d._id : d);

  const handleToggleDept = (stageId: string, deptId: string, current: string[]) => {
    const next = current.includes(deptId) ? current.filter(id => id !== deptId) : [...current, deptId];
    updateDeptsMutation.mutate(
      { instanceId: flowInstance._id, stageId, departmentIds: next },
      {
        onSuccess: () => showNotification('Gerência atualizada!', 'success'),
        onError: () => showNotification('Erro ao atualizar gerência', 'error'),
      }
    );
  };

  // ── Aba Fluxo ────────────────────────────────────────────────────
  const activeStageIds = new Set(flowInstance.stageExecutions.map(e => e.stageId));
  const activeStages = flowInstance.snapshotStages
    .filter(s => !s.isOptional || activeStageIds.has(s.stageId))
    .sort((a, b) => a.order - b.order);
  const optionalStages = flowInstance.snapshotStages.filter(s => s.isOptional && !activeStageIds.has(s.stageId));

  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const [stageOrder, setStageOrder] = useState<string[]>([]);
  const [orderChanged, setOrderChanged] = useState(false);

  useEffect(() => {
    if (open) { setStageOrder(activeStages.map(s => s.stageId)); setOrderChanged(false); }
  }, [open, flowInstance]);

  const orderedStages = stageOrder
    .map(id => activeStages.find(s => s.stageId === id))
    .filter(Boolean) as typeof activeStages;

  const handleDrop = (targetId: string) => {
    if (!draggedId || draggedId === targetId) { setDraggedId(null); setDragOverId(null); return; }

    // Impede mover etapas concluídas ou em andamento
    const draggedStage = activeStages.find(s => s.stageId === draggedId);
    const execution = flowInstance.stageExecutions.find(e => e.stageId === draggedId);
    if (execution?.status === 'COMPLETED' || execution?.status === 'IN_PROGRESS' || execution?.status === 'APPROVED') {
      setDraggedId(null); setDragOverId(null); return;
    }

    // Impede soltar antes de etapa concluída ou em andamento
    const targetExecution = flowInstance.stageExecutions.find(e => e.stageId === targetId);
    const targetIdx = stageOrder.indexOf(targetId);
    const lastLockedIdx = stageOrder.reduce((max, id, idx) => {
      const exec = flowInstance.stageExecutions.find(e => e.stageId === id);
      return (exec?.status === 'COMPLETED' || exec?.status === 'IN_PROGRESS' || exec?.status === 'APPROVED') ? idx : max;
    }, -1);
    if (targetIdx <= lastLockedIdx) { setDraggedId(null); setDragOverId(null); return; }

    setStageOrder(prev => {
      const arr = [...prev];
      const from = arr.indexOf(draggedId);
      const to = arr.indexOf(targetId);
      arr.splice(from, 1);
      arr.splice(to, 0, draggedId);
      return arr;
    });
    setOrderChanged(true);
    setDraggedId(null);
    setDragOverId(null);
  };

  const handleSaveOrder = () => {
    const stageOrders = stageOrder.map((id, idx) => ({ stageId: id, order: idx + 1 }));
    reorderMutation.mutate(
      { instanceId: flowInstance._id, stageOrders },
      {
        onSuccess: () => { showNotification('Ordem salva!', 'success'); setOrderChanged(false); },
        onError: (e: any) => showNotification(e?.message || 'Erro ao salvar ordem', 'error'),
      }
    );
  };

  const handleRemoveOptional = (stageId: string) => {
    removeOptionalMutation.mutate(
      { instanceId: flowInstance._id, stageId },
      {
        onSuccess: () => showNotification('Etapa removida!', 'success'),
        onError: (e: any) => showNotification(e?.message || 'Erro ao remover etapa', 'error'),
      }
    );
  };

  const handleActivateOptional = (stageId: string) => {
    addOptionalMutation.mutate(
      { instanceId: flowInstance._id, stageId },
      {
        onSuccess: async () => {
          showNotification('Etapa ativada!', 'success');
          // Após ativar, reordena colocando a nova etapa no final
          const currentStages = flowInstance.snapshotStages
            .filter(s => !s.isOptional || activeStageIds.has(s.stageId) || s.stageId === stageId)
            .sort((a, b) => a.order - b.order);
          const maxOrder = Math.max(...currentStages.map(s => s.order), 0);
          reorderMutation.mutate({
            instanceId: flowInstance._id,
            stageOrders: [{ stageId, order: maxOrder + 1 }],
          });
        },
        onError: () => showNotification('Erro ao ativar etapa', 'error'),
      }
    );
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth='md'
      PaperProps={{ sx: { borderRadius: 3, maxHeight: '90vh', display: 'flex', flexDirection: 'column' } }}>

      {/* Header */}
      <Box sx={{ px: 3, py: 2.5, borderBottom: '1px solid #E4E6EB', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <Box>
          <Typography sx={{ fontWeight: 800, color: '#0f172a', fontSize: '1.1rem' }}>Editar Processo</Typography>
          <Typography variant='caption' sx={{ color: '#64748b' }}>{p.processNumber} — {p.object}</Typography>
        </Box>
        <IconButton onClick={onClose} size='small'><CloseIcon /></IconButton>
      </Box>

      {/* Tabs */}
      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ px: 3, borderBottom: '1px solid #E4E6EB', flexShrink: 0, '& .MuiTab-root': { textTransform: 'none', fontWeight: 700, minHeight: 48 }, '& .MuiTabs-indicator': { bgcolor: '#1877F2' } }}>
        <Tab icon={<InfoIcon sx={{ fontSize: 18 }} />} iconPosition='start' label='Informações' />
        <Tab icon={<DeptIcon sx={{ fontSize: 18 }} />} iconPosition='start' label='Gerências por Etapa' />
        <Tab icon={<StagesIcon sx={{ fontSize: 18 }} />} iconPosition='start' label={`Fluxo${optionalStages.length > 0 ? ` (+${optionalStages.length})` : ''}`} />
      </Tabs>

      <Box sx={{ flex: 1, overflow: 'auto', p: 3 }}>

        {/* ── Informações ── */}
        {tab === 0 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
              <TextField label='Número do Processo' value={form.processNumber} onChange={e => setForm(f => ({ ...f, processNumber: e.target.value }))} fullWidth />
              <TextField label='Modalidade' select value={form.modality} onChange={e => setForm(f => ({ ...f, modality: e.target.value }))} fullWidth>
                {MODALITIES.map(m => <MenuItem key={m} value={m}>{m}</MenuItem>)}
              </TextField>
            </Box>

            <TextField label='Objeto' value={form.object} onChange={e => setForm(f => ({ ...f, object: e.target.value }))} fullWidth multiline rows={2} />

            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 2 }}>
              <TextField label='Prazo Final' type='date' value={form.dueDate} onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))} InputLabelProps={{ shrink: true }} fullWidth />
              <TextField label='Prioridade' select value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))} fullWidth>
                {['Baixa', 'Média', 'Alta'].map(pr => <MenuItem key={pr} value={pr}>{pr}</MenuItem>)}
              </TextField>
              <TextField label='Valor Estimado' value={form.estimatedValue ? `R$ ${form.estimatedValue}` : ''}
                onChange={handleMoneyChange} fullWidth
                InputProps={{ inputProps: { inputMode: 'numeric' } }}
                placeholder='R$ 0,00' />
            </Box>

            {/* Gerências participantes - exclui a criadora */}
            <Autocomplete
              multiple
              options={(departments as Dept[]).filter(d => {
                const creatorId = typeof p.creatorDepartment === 'object' ? p.creatorDepartment._id : p.creatorDepartment;
                return d._id !== creatorId;
              })}
              getOptionLabel={d => `${d.department_acronym} - ${d.department_name}`}
              value={selectedParticipating}
              onChange={(_, v) => setSelectedParticipating(v as Dept[])}
              onOpen={() => { if (departments.length === 0) fetchDepartments(); }}
              isOptionEqualToValue={(a, b) => (a as Dept)._id === (b as Dept)._id}
              renderOption={({ key, ...props }, option) => (
                <Box key={key} component='li' {...props}>
                  <Typography sx={{ fontWeight: 700, fontSize: '0.875rem' }}>{(option as Dept).department_acronym}</Typography>
                  <Typography sx={{ fontSize: '0.8rem', color: '#64748b', ml: 1 }}>{(option as Dept).department_name}</Typography>
                </Box>
              )}
              renderInput={params => <TextField {...params} label='Gerências Participantes' placeholder='Selecione gerências...' />}
            />

            {/* Gestores - exclui o criador */}
            <Autocomplete
              multiple
              options={users.filter(u => {
                const createdById = typeof p.createdBy === 'object' ? p.createdBy._id : p.createdBy;
                return u._id !== createdById;
              })}
              getOptionLabel={u => `${u.firstName} ${u.lastName}`}
              value={selectedManagers}
              onChange={(_, v) => setSelectedManagers(v as User[])}
              onOpen={() => { if (users.length === 0) fetchUsers({ limit: 100 }); }}
              isOptionEqualToValue={(a, b) => a._id === b._id}
              renderOption={({ key, ...props }, option) => (
                <Box key={key} component='li' {...props} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Avatar sx={{ width: 28, height: 28, bgcolor: '#1877F2', fontSize: '0.75rem', fontWeight: 700 }}>
                    {`${option.firstName?.charAt(0) || ''}${option.lastName?.charAt(0) || ''}`.toUpperCase()}
                  </Avatar>
                  <Box>
                    <Typography sx={{ fontWeight: 700, fontSize: '0.875rem' }}>{option.firstName} {option.lastName}</Typography>
                    <Typography sx={{ fontSize: '0.75rem', color: '#64748b' }}>{option.email}</Typography>
                  </Box>
                </Box>
              )}
              renderInput={params => <TextField {...params} label='Gestores do Processo' placeholder='Selecione gestores...' />}
            />
          </Box>
        )}

        {/* ── Gerências por Etapa ── */}
        {tab === 1 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography variant='body2' sx={{ color: '#64748b' }}>
              Defina quais gerências são responsáveis por cada etapa. Apenas membros dessas gerências poderão modificar os dados da etapa, elas devem ser participantes do processo (definidos na aba Informações) ou a gerência criadora do processo.
            </Typography>
            {availableDepts.length === 0 && (
              <Box sx={{ p: 3, bgcolor: '#FEF3C7', borderRadius: 2, border: '1px solid #FDE68A' }}>
                <Typography variant='body2' sx={{ color: '#92400E', fontWeight: 600 }}>
                  Nenhuma gerência participante definida. Adicione gerências na aba Informações primeiro.
                </Typography>
              </Box>
            )}
            {activeStages.map(stage => {
              const selected = getSelectedDepts(stage);
              return (
                <Box key={stage.stageId} sx={{ border: '1px solid #E4E6EB', borderRadius: 2, overflow: 'hidden' }}>
                  <Box sx={{ px: 2.5, py: 1.5, bgcolor: '#F8FAFC', borderBottom: '1px solid #E4E6EB', display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box sx={{ width: 26, height: 26, borderRadius: '50%', bgcolor: '#1877F2', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.78rem', flexShrink: 0 }}>
                      {stage.order}
                    </Box>
                    <Typography sx={{ fontWeight: 700, color: '#0f172a', fontSize: '0.9rem' }}>{stage.name}</Typography>
                    {selected.length > 0 && (
                      <Chip label={`${selected.length} gerência${selected.length > 1 ? 's' : ''}`} size='small'
                        sx={{ bgcolor: '#E7F3FF', color: '#1877F2', fontWeight: 700, fontSize: '0.7rem', height: 20, ml: 'auto' }} />
                    )}
                  </Box>
                  <Box sx={{ p: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {availableDepts.length === 0
                      ? <Typography variant='caption' sx={{ color: '#94a3b8' }}>Nenhuma gerência disponível</Typography>
                      : availableDepts.map(dept => {
                          const isSelected = selected.includes(dept._id);
                          return (
                            <Tooltip key={dept._id} title={dept.department_name} arrow>
                              <Chip
                                label={dept.department_acronym}
                                onClick={() => !updateDeptsMutation.isPending && handleToggleDept(stage.stageId, dept._id, selected)}
                                icon={isSelected ? <CheckIcon sx={{ fontSize: 14 }} /> : undefined}
                                size='small'
                                sx={{ cursor: 'pointer', bgcolor: isSelected ? '#1877F2' : '#F1F5F9', color: isSelected ? '#fff' : '#475569', fontWeight: 700, fontSize: '0.8rem', height: 28, '& .MuiChip-icon': { color: '#fff' }, '&:hover': { bgcolor: isSelected ? '#166FE5' : '#E2E8F0' } }}
                              />
                            </Tooltip>
                          );
                        })}
                  </Box>
                </Box>
              );
            })}
          </Box>
        )}

        {/* ── Fluxo ── */}
        {tab === 2 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography variant='body2' sx={{ color: '#64748b' }}>
              Reordene as etapas arrastando. Ative etapas opcionais do modelo de fluxo.
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {orderedStages.map((stage, idx) => {
                const isDragging = draggedId === stage.stageId;
                const isDragOver = dragOverId === stage.stageId;
                const exec = flowInstance.stageExecutions.find(e => e.stageId === stage.stageId);
                const isLocked = exec?.status === 'COMPLETED' || exec?.status === 'IN_PROGRESS' || exec?.status === 'APPROVED';
                return (
                  <Box key={stage.stageId} draggable={!isLocked}
                    onDragStart={() => !isLocked && setDraggedId(stage.stageId)}
                    onDragEnd={() => { setDraggedId(null); setDragOverId(null); }}
                    onDragOver={e => { e.preventDefault(); setDragOverId(stage.stageId); }}
                    onDrop={() => handleDrop(stage.stageId)}
                    sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: 1.5, border: `2px solid ${isDragOver ? '#1877F2' : isLocked ? '#E4E6EB' : '#E4E6EB'}`, borderRadius: 2, bgcolor: isDragging ? '#F0F9FF' : isDragOver ? '#EFF6FF' : isLocked ? '#F8FAFC' : '#fff', cursor: isLocked ? 'not-allowed' : 'grab', opacity: isDragging ? 0.5 : 1, transition: 'all 0.15s', '&:active': { cursor: isLocked ? 'not-allowed' : 'grabbing' } }}>
                    <DragIcon sx={{ color: isLocked ? '#CBD5E1' : '#94a3b8', fontSize: 20, flexShrink: 0 }} />
                    <Box sx={{ width: 26, height: 26, borderRadius: '50%', bgcolor: stage.isOptional ? '#9333EA' : '#1877F2', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.78rem', flexShrink: 0 }}>
                      {idx + 1}
                    </Box>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography sx={{ fontWeight: 700, color: '#0f172a', fontSize: '0.875rem' }}>{stage.name}</Typography>
                      {stage.description && <Typography variant='caption' sx={{ color: '#64748b' }}>{stage.description}</Typography>}
                    </Box>
                    <Box sx={{ display: 'flex', gap: 0.75, flexShrink: 0 }}>
                      {isLocked && <Chip label={exec?.status === 'IN_PROGRESS' ? 'Em Andamento' : 'Concluída'} size='small' sx={{ bgcolor: exec?.status === 'IN_PROGRESS' ? '#E7F3FF' : '#DCFCE7', color: exec?.status === 'IN_PROGRESS' ? '#1877F2' : '#16A34A', fontWeight: 700, fontSize: '0.65rem', height: 18 }} />}
                      {stage.isOptional && !isLocked && (
                        <IconButton size='small' onClick={e => { e.stopPropagation(); handleRemoveOptional(stage.stageId); }}
                          disabled={removeOptionalMutation.isPending}
                          sx={{ color: '#F02849', border: '1px solid #FECACA', borderRadius: 1, p: 0.25, '&:hover': { bgcolor: '#FFF1F2' } }}>
                          <DeleteIcon sx={{ fontSize: 14 }} />
                        </IconButton>
                      )}
                      <Chip label={`${stage.components?.length || 0} comp.`} size='small' sx={{ bgcolor: '#F1F5F9', color: '#64748b', fontWeight: 600, fontSize: '0.7rem', height: 18 }} />
                      {stage.businessDaysDuration ? <Chip label={`${stage.businessDaysDuration}d`} size='small' sx={{ bgcolor: '#F5F3FF', color: '#7C3AED', fontWeight: 600, fontSize: '0.7rem', height: 18 }} /> : null}
                    </Box>
                  </Box>
                );
              })}
            </Box>

            {optionalStages.length > 0 && (
              <>
                <Divider sx={{ my: 1 }}>
                  <Typography variant='caption' sx={{ color: '#94a3b8', fontWeight: 700 }}>ETAPAS OPCIONAIS DISPONÍVEIS</Typography>
                </Divider>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {optionalStages.map(stage => (
                    <Box key={stage.stageId} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: 1.5, border: '2px dashed #DDD6FE', borderRadius: 2, bgcolor: '#FAFAFA' }}>
                      <Box sx={{ width: 26, height: 26, borderRadius: '50%', bgcolor: '#9333EA', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.78rem', flexShrink: 0 }}>?</Box>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography sx={{ fontWeight: 700, color: '#0f172a', fontSize: '0.875rem' }}>{stage.name}</Typography>
                        {stage.description && <Typography variant='caption' sx={{ color: '#64748b' }}>{stage.description}</Typography>}
                        <Box sx={{ display: 'flex', gap: 0.75, mt: 0.5 }}>
                          <Chip label={`${stage.components?.length || 0} componentes`} size='small' sx={{ bgcolor: '#F1F5F9', color: '#64748b', fontWeight: 600, fontSize: '0.7rem', height: 18 }} />
                          {stage.businessDaysDuration ? <Chip label={`${stage.businessDaysDuration} dias úteis`} size='small' sx={{ bgcolor: '#F5F3FF', color: '#7C3AED', fontWeight: 600, fontSize: '0.7rem', height: 18 }} /> : null}
                        </Box>
                      </Box>
                      <Button variant='contained' size='small'
                        startIcon={addOptionalMutation.isPending ? <CircularProgress size={12} sx={{ color: '#fff' }} /> : <AddIcon />}
                        onClick={() => handleActivateOptional(stage.stageId)}
                        disabled={addOptionalMutation.isPending}
                        sx={{ bgcolor: '#9333EA', textTransform: 'none', fontWeight: 700, borderRadius: 2, flexShrink: 0, '&:hover': { bgcolor: '#7C3AED' } }}>
                        Ativar
                      </Button>
                    </Box>
                  ))}
                </Box>
              </>
            )}
          </Box>
        )}
      </Box>

      {/* Footer */}
      <Box sx={{ px: 3, py: 2, borderTop: '1px solid #E4E6EB', display: 'flex', justifyContent: 'flex-end', gap: 1, flexShrink: 0 }}>
        <Button onClick={onClose} variant='outlined' sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 2 }}>Fechar</Button>
        {tab === 0 && (
          <Button onClick={handleSaveInfo} variant='contained' disabled={updateProcessMutation.isPending}
            startIcon={updateProcessMutation.isPending ? <CircularProgress size={16} sx={{ color: '#fff' }} /> : <SaveIcon />}
            sx={{ bgcolor: '#1877F2', textTransform: 'none', fontWeight: 700, borderRadius: 2, '&:hover': { bgcolor: '#166FE5' } }}>
            {updateProcessMutation.isPending ? 'Salvando...' : 'Salvar'}
          </Button>
        )}
        {tab === 2 && orderChanged && (
          <Button onClick={handleSaveOrder} variant='contained' disabled={reorderMutation.isPending}
            startIcon={reorderMutation.isPending ? <CircularProgress size={16} sx={{ color: '#fff' }} /> : <SaveIcon />}
            sx={{ bgcolor: '#1877F2', textTransform: 'none', fontWeight: 700, borderRadius: 2, '&:hover': { bgcolor: '#166FE5' } }}>
            {reorderMutation.isPending ? 'Salvando...' : 'Salvar Ordem'}
          </Button>
        )}
      </Box>

      {/* Confirmão */}
      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)} maxWidth='xs' fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <Box sx={{ px: 3, py: 2.5, borderBottom: '1px solid #E4E6EB' }}>
          <Typography sx={{ fontWeight: 800, color: '#0f172a', fontSize: '1rem' }}>Confirmar alterações</Typography>
          <Typography variant='body2' sx={{ color: '#64748b', mt: 0.5 }}>Deseja salvar as alterações do processo <strong>{p.processNumber}</strong>?</Typography>
        </Box>
        <Box sx={{ px: 3, py: 2, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
          <Button onClick={() => setConfirmOpen(false)} variant='outlined' sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 2 }}>Cancelar</Button>
          <Button onClick={handleConfirmSave} variant='contained' disabled={updateProcessMutation.isPending}
            startIcon={updateProcessMutation.isPending ? <CircularProgress size={16} sx={{ color: '#fff' }} /> : <SaveIcon />}
            sx={{ bgcolor: '#1877F2', textTransform: 'none', fontWeight: 700, borderRadius: 2, '&:hover': { bgcolor: '#166FE5' } }}>
            {updateProcessMutation.isPending ? 'Salvando...' : 'Confirmar'}
          </Button>
        </Box>
      </Dialog>
    </Dialog>
  );
};
