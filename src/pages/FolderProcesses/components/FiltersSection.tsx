import {
  Box,
  Card,
  Chip,
  FormControl,
  Grid,
  MenuItem,
  Select,
  TextField,
  Typography
} from '@mui/material';
import {
  FilterList as FilterListIcon,
  Search as SearchIcon,
  Clear as ClearIcon
} from '@mui/icons-material';
import { useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';

interface FiltersSectionProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
}

const PRIORITIES = ['Baixa', 'Média', 'Alta'];
const MODALITIES = ['Concorrência', 'Dispensa', 'Inexigibilidade', 'Pregão', 'Tomada de Preços'];
const STATUSES = ['Em Andamento', 'Em Atraso', 'Concluído'];
const STAGES = [
  'Aprovação do DFD',
  'Elaboração do ETP',
  'Elaboração do Termo de Referência (TR)',
  'Publicação do Edital',
  'Abertura de Propostas',
  'Análise de Propostas',
  'Homologação'
];

export const FiltersSection = ({
  searchValue,
  onSearchChange
}: FiltersSectionProps) => {
  const [urlParams, setUrlParams] = useSearchParams();

  const handleFilterChange = useCallback((field: string, value: string) => {
    const newParams = new URLSearchParams(urlParams);
    if (value === 'all' || value === '') {
      newParams.delete(field);
    } else {
      newParams.set(field, value);
    }
    setUrlParams(newParams, { replace: true });
  }, [urlParams, setUrlParams]);

  const handleClearFilters = useCallback(() => {
    const newParams = new URLSearchParams();
    setUrlParams(newParams, { replace: true });
  }, [setUrlParams]);

  const hasActiveFilters =
    urlParams.get('priority') ||
    urlParams.get('modality') ||
    urlParams.get('currentStage') ||
    urlParams.get('status') ||
    searchValue;

  return (
    <Card
      sx={{
        borderRadius: 3,
        border: '1px solid',
        borderColor: '#e2e8f0',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)',
        overflow: 'hidden',
        mb: 4
      }}
    >
      <Box
        sx={{
          p: 3,
          background: 'linear-gradient(135deg, rgba(248, 250, 252, 1) 0%, rgba(255, 255, 255, 1) 100%)',
          borderBottom: '1px solid',
          borderColor: '#e2e8f0'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 44,
                height: 44,
                borderRadius: 2.5,
                background: 'linear-gradient(135deg, #1877F2 0%, #166fe5 100%)',
                boxShadow: '0 2px 8px rgba(24, 119, 242, 0.3)'
              }}
            >
              <FilterListIcon sx={{ color: '#ffffff', fontSize: 22 }} />
            </Box>
            <Typography
              variant='h6'
              sx={{
                fontWeight: 600,
                fontSize: '1.125rem',
                color: '#0f172a',
                letterSpacing: '-0.01em',
                lineHeight: 1.4
              }}
            >
              Filtros e Busca
            </Typography>
          </Box>
          {hasActiveFilters && (
            <Chip
              icon={<ClearIcon sx={{ fontSize: 16 }} />}
              label='Limpar'
              onClick={handleClearFilters}
              sx={{
                height: 32,
                fontWeight: 600,
                fontSize: '0.8125rem',
                borderRadius: 2.5,
                backgroundColor: '#fef2f2',
                color: '#dc2626',
                border: '1px solid #fecaca',
                cursor: 'pointer',
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  backgroundColor: '#fee2e2',
                  borderColor: '#fca5a5',
                  transform: 'translateY(-1px)'
                },
                '& .MuiChip-icon': {
                  color: '#dc2626',
                  marginLeft: '6px'
                }
              }}
            />
          )}
        </Box>
      </Box>
      <Box sx={{ p: 3, pt: 2.5 }}>
        <Grid
          container
          spacing={2.5}
        >
          {/* Campo de busca */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Box>
              <Typography
                variant='caption'
                sx={{
                  display: 'block',
                  mb: 1.5,
                  fontWeight: 600,
                  color: '#475569',
                  fontSize: '0.6875rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em'
                }}
              >
                Buscar
              </Typography>
              <TextField
                fullWidth
                placeholder='Buscar por número ou objeto...'
                value={searchValue}
                onChange={(e) => onSearchChange(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mr: 1.25,
                        width: 20,
                        height: 20
                      }}
                    >
                      <SearchIcon sx={{ color: '#94a3b8', fontSize: '1.25rem' }} />
                    </Box>
                  ),
                  sx: { height: 44 }
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2.5,
                    backgroundColor: '#ffffff',
                    border: '1px solid #e2e8f0',
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                      borderColor: '#cbd5e1'
                    },
                    '&.Mui-focused': {
                      borderColor: '#1877F2',
                      boxShadow: '0 0 0 3px rgba(24, 119, 242, 0.15)',
                      backgroundColor: '#ffffff'
                    }
                  },
                  '& .MuiInputBase-input::placeholder': {
                    color: '#94a3b8',
                    opacity: 1,
                    fontWeight: 400
                  }
                }}
              />
            </Box>
          </Grid>

          {/* Filtro de Prioridade */}
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Box>
              <Typography
                variant='caption'
                sx={{
                  display: 'block',
                  mb: 1.5,
                  fontWeight: 600,
                  color: '#475569',
                  fontSize: '0.6875rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em'
                }}
              >
                Prioridade
              </Typography>
              <FormControl fullWidth>
                <Select
                  value={urlParams.get('priority') || 'all'}
                  onChange={(e) => handleFilterChange('priority', e.target.value)}
                  sx={{
                    height: 44,
                    borderRadius: 2.5,
                    backgroundColor: '#ffffff',
                    border: '1px solid #e2e8f0',
                    '&.Mui-focused': {
                      borderColor: '#1877F2',
                      boxShadow: '0 0 0 3px rgba(24, 119, 242, 0.15)'
                    }
                  }}
                >
                  <MenuItem value='all'>Todas as prioridades</MenuItem>
                  {PRIORITIES.map((priority) => (
                    <MenuItem key={priority} value={priority}>
                      {priority}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          </Grid>

          {/* Filtro de Modalidade */}
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Box>
              <Typography
                variant='caption'
                sx={{
                  display: 'block',
                  mb: 1.5,
                  fontWeight: 600,
                  color: '#475569',
                  fontSize: '0.6875rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em'
                }}
              >
                Modalidade
              </Typography>
              <FormControl fullWidth>
                <Select
                  value={urlParams.get('modality') || 'all'}
                  onChange={(e) => handleFilterChange('modality', e.target.value)}
                  sx={{
                    height: 44,
                    borderRadius: 2.5,
                    backgroundColor: '#ffffff',
                    border: '1px solid #e2e8f0',
                    '&.Mui-focused': {
                      borderColor: '#1877F2',
                      boxShadow: '0 0 0 3px rgba(24, 119, 242, 0.15)'
                    }
                  }}
                >
                  <MenuItem value='all'>Todas as modalidades</MenuItem>
                  {MODALITIES.map((modality) => (
                    <MenuItem key={modality} value={modality}>
                      {modality}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          </Grid>

          {/* Filtro de Etapa Atual */}
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Box>
              <Typography
                variant='caption'
                sx={{
                  display: 'block',
                  mb: 1.5,
                  fontWeight: 600,
                  color: '#475569',
                  fontSize: '0.6875rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em'
                }}
              >
                Etapa Atual
              </Typography>
              <FormControl fullWidth>
                <Select
                  value={urlParams.get('currentStage') || 'all'}
                  onChange={(e) => handleFilterChange('currentStage', e.target.value)}
                  sx={{
                    height: 44,
                    borderRadius: 2.5,
                    backgroundColor: '#ffffff',
                    border: '1px solid #e2e8f0',
                    '&.Mui-focused': {
                      borderColor: '#1877F2',
                      boxShadow: '0 0 0 3px rgba(24, 119, 242, 0.15)'
                    }
                  }}
                >
                  <MenuItem value='all'>Todas as etapas</MenuItem>
                  {STAGES.map((stage) => (
                    <MenuItem key={stage} value={stage}>
                      {stage}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          </Grid>

          {/* Filtro de Situação */}
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Box>
              <Typography
                variant='caption'
                sx={{
                  display: 'block',
                  mb: 1.5,
                  fontWeight: 600,
                  color: '#475569',
                  fontSize: '0.6875rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em'
                }}
              >
                Situação
              </Typography>
              <FormControl fullWidth>
                <Select
                  value={urlParams.get('status') || 'all'}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  sx={{
                    height: 44,
                    borderRadius: 2.5,
                    backgroundColor: '#ffffff',
                    border: '1px solid #e2e8f0',
                    '&.Mui-focused': {
                      borderColor: '#1877F2',
                      boxShadow: '0 0 0 3px rgba(24, 119, 242, 0.15)'
                    }
                  }}
                >
                  <MenuItem value='all'>Todas as situações</MenuItem>
                  {STATUSES.map((status) => (
                    <MenuItem key={status} value={status}>
                      {status}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </Card>
  );
};
