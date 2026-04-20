import { useEffect, useState } from 'react';
import { Box, Button, Card, FormControl, MenuItem, Select, TextField, Typography } from '@mui/material';
import { ClearAll as ClearAllIcon, FilterAlt as FilterAltIcon, Search as SearchIcon } from '@mui/icons-material';
import type { ProcessFlowStageCard } from '@/globals/types';
import { useDebounce } from '@/hooks/useDebounce';
import { ProcessStageCard, type StageStatus } from './ProcessStageCard';
import { ProcessStageModal } from './ProcessStageModal';

type Department = { _id: string; department_name: string; department_acronym: string };

type ProcessStagesSectionProps = {
  stages: ProcessFlowStageCard[];
  processId: string;
  instanceId: string;
  canAdvance?: boolean;
  canRollback?: boolean;
  departments?: Department[];
  onFilterChange?: (filters: { stageName?: string; departmentId?: string; status?: string }) => void;
  filters?: { stageName?: string; departmentId?: string; status?: string };
};

const STATUS_OPTIONS = [
  { value: '', label: 'Todos os status' },
  { value: 'APPROVED', label: 'Aprovado' },
  { value: 'IN_PROGRESS', label: 'Em Andamento' },
  { value: 'OVERDUE', label: 'Atrasado' },
  { value: 'PENDING', label: 'Pendente' },
];

const selectSx = {
  height: 40, borderRadius: 2, fontSize: '0.875rem', backgroundColor: '#fff',
  '& .MuiOutlinedInput-notchedOutline': { borderColor: '#e2e8f0' },
  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#cbd5e1' },
  '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#1877F2', borderWidth: '1.5px' },
};

export const ProcessStagesSection = ({ stages, processId, instanceId, canAdvance, canRollback, departments = [], onFilterChange, filters = {} }: ProcessStagesSectionProps) => {
  const [selectedStage, setSelectedStage] = useState<ProcessFlowStageCard | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStageStatus, setSelectedStageStatus] = useState<'completed' | 'in_progress' | 'pending'>('pending');

  // Estado local do input — não dispara fetch a cada tecla
  const [stageNameInput, setStageNameInput] = useState(filters.stageName ?? '');
  const debouncedStageName = useDebounce(stageNameInput, 400);

  // Só propaga para o pai (e portanto para o fetch) quando o debounce estabilizar
  useEffect(() => {
    onFilterChange?.({ ...filters, stageName: debouncedStageName || undefined });
  }, [debouncedStageName]); // eslint-disable-line react-hooks/exhaustive-deps

  const hasActiveFilters = !!(stageNameInput || filters.departmentId || filters.status);

  const handleFilter = (patch: Partial<Omit<typeof filters, 'stageName'>>) => {
    onFilterChange?.({ ...filters, stageName: debouncedStageName || undefined, ...patch });
  };

  const handleClear = () => {
    setStageNameInput('');
    onFilterChange?.({});
  };

  const getStageStatus = (status: ProcessFlowStageCard['status']): StageStatus => {
    if (status === 'completed' || status === 'in_progress' || status === 'pending') return status;
    return 'pending';
  };

  const handleStageClick = (stage: ProcessFlowStageCard) => {
    setSelectedStage(stage);
    setSelectedStageStatus(getStageStatus(stage.status));
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedStage(null);
  };

  return (
    <Box sx={{ mb: 6 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant='h6' sx={{ fontWeight: 800, color: '#0f172a' }}>Fluxo Completo do Processo</Typography>
        <Typography variant='body2' sx={{ color: '#64748b', fontWeight: 600 }}>{stages.length} etapas</Typography>
      </Box>

      {/* Filtros */}
      <Card sx={{ border: '1px solid #e2e8f0', boxShadow: '0 1px 2px rgba(0,0,0,0.04)', borderRadius: 2, mb: 3, overflow: 'hidden' }}>
        <Box sx={{ px: 2.5, py: 1.75, borderBottom: '1px solid #f1f5f9', bgcolor: '#fafbfc', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <FilterAltIcon sx={{ color: '#1877F2', fontSize: 18 }} />
            <Typography sx={{ fontWeight: 600, fontSize: '0.875rem', color: '#0f172a' }}>Filtros</Typography>
          </Box>
          {hasActiveFilters && (
            <Button size='small' startIcon={<ClearAllIcon sx={{ fontSize: 16 }} />} onClick={handleClear}
              sx={{ textTransform: 'none', fontSize: '0.8125rem', fontWeight: 600, color: '#64748b', borderRadius: 2, '&:hover': { bgcolor: '#f1f5f9' } }}>
              Limpar
            </Button>
          )}
        </Box>
        <Box sx={{ p: 2, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          {/* Nome da etapa */}
          <TextField
            placeholder='Buscar por nome da etapa...'
            value={stageNameInput}
            onChange={e => setStageNameInput(e.target.value)}
            size='small'
            InputProps={{ startAdornment: <SearchIcon sx={{ color: '#94a3b8', fontSize: 18, mr: 1 }} /> }}
            sx={{
              flex: '1 1 220px', minWidth: 180,
              '& .MuiOutlinedInput-root': { height: 40, borderRadius: 2, fontSize: '0.875rem', bgcolor: '#fff', '& fieldset': { borderColor: '#e2e8f0' }, '&:hover fieldset': { borderColor: '#cbd5e1' }, '&.Mui-focused fieldset': { borderColor: '#1877F2' } }
            }}
          />

          {/* Gerência */}
          <FormControl sx={{ flex: '1 1 200px', minWidth: 180 }}>
            <Select
              value={filters.departmentId ?? ''}
              onChange={e => handleFilter({ departmentId: e.target.value || undefined })}
              displayEmpty
              sx={selectSx}
            >
              <MenuItem value=''>Todas as gerências</MenuItem>
              {departments.map(d => (
                <MenuItem key={d._id} value={d._id}>{d.department_acronym} — {d.department_name}</MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Status */}
          <FormControl sx={{ flex: '1 1 180px', minWidth: 160 }}>
            <Select
              value={filters.status ?? ''}
              onChange={e => handleFilter({ status: e.target.value || undefined })}
              displayEmpty
              sx={selectSx}
            >
              {STATUS_OPTIONS.map(o => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
            </Select>
          </FormControl>
        </Box>
      </Card>

      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 2 }}>
        {stages.map((stage) => (
          <ProcessStageCard
            key={stage.id}
            order={stage.order}
            title={stage.title}
            departments={stage.departments}
            status={getStageStatus(stage.status)}
            additionalInfo={stage.additionalInfo}
            onClick={() => handleStageClick(stage)}
            canAdvance={canAdvance}
            canRollback={canRollback}
            instanceId={instanceId}
            onAdvanced={handleCloseModal}
            wasAdvanced={stage.wasAdvanced}
            dueDate={stage.dueDate}
            startedAt={stage.startedAt}
            businessDaysDuration={stage.businessDaysDuration}
          />
        ))}
        {stages.length === 0 && (
          <Box sx={{ gridColumn: '1 / -1', py: 6, textAlign: 'center' }}>
            <Typography variant='body2' sx={{ color: '#94a3b8', fontWeight: 600 }}>Nenhuma etapa encontrada com os filtros aplicados.</Typography>
          </Box>
        )}
      </Box>

      <ProcessStageModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        stage={selectedStage}
        processId={processId}
        instanceId={instanceId}
        stageStatus={selectedStageStatus}
        canManage={canAdvance}
      />
    </Box>
  );
};
