import { Clear as ClearIcon, FilterAlt as FilterAltIcon, Search as SearchIcon } from '@mui/icons-material';
import { Box, Button, Card, FormControl, Grid, MenuItem, Select, TextField, Typography, useTheme } from '@mui/material';
import { useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';

interface FiltersSectionProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  onClearSearch?: () => void;
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

export const FiltersSection = ({ searchValue, onSearchChange, onClearSearch }: FiltersSectionProps) => {
  const theme = useTheme();
  const [urlParams, setUrlParams] = useSearchParams();

  const handleFilterChange = useCallback(
    (field: string, value: string) => {
      const newParams = new URLSearchParams(urlParams);
      if (value === 'all' || value === '') {
        newParams.delete(field);
      } else {
        newParams.set(field, value);
      }
      setUrlParams(newParams, { replace: true });
    },
    [urlParams, setUrlParams]
  );

  const handleClearFilters = useCallback(() => {
    // Limpar o campo de busca
    if (onClearSearch) {
      onClearSearch();
    }

    const newParams = new URLSearchParams();
    setUrlParams(newParams, { replace: true });
  }, [setUrlParams, onClearSearch]);

  const hasActiveFilters =
    urlParams.get('priority') ||
    urlParams.get('modality') ||
    urlParams.get('currentStage') ||
    urlParams.get('status') ||
    searchValue;

  return (
    <Card
      sx={{
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'divider',
        boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        overflow: 'hidden',
        mb: 4,
        backgroundColor: 'background.paper'
      }}
    >
      <Box
        sx={{
          px: { xs: 2, sm: 2.5, md: 3 },
          py: { xs: 2, sm: 2.25, md: 2.5 },
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: { xs: 'wrap', sm: 'nowrap' },
          gap: { xs: 1.5, sm: 2 },
          borderBottom: '1px solid',
          borderColor: 'grey.100',
          backgroundColor: 'grey.50'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 1.5 } }}>
          <FilterAltIcon sx={{ color: 'primary.main', fontSize: { xs: 18, sm: 20 } }} />
          <Typography
            variant='subtitle1'
            sx={{
              fontWeight: 600,
              fontSize: { xs: '0.875rem', sm: '0.9375rem' },
              color: 'text.primary',
              letterSpacing: '-0.01em'
            }}
          >
            Filtros e Busca
          </Typography>
        </Box>
        {hasActiveFilters && (
          <Button
            variant='outlined'
            size='small'
            startIcon={<ClearIcon sx={{ fontSize: { xs: 14, sm: 16 } }} />}
            onClick={handleClearFilters}
            sx={{
              minWidth: 'auto',
              px: { xs: 1.5, sm: 2 },
              py: { xs: 0.75, sm: 0.875 },
              fontSize: { xs: '0.75rem', sm: '0.8125rem' },
              fontWeight: 600,
              color: 'text.secondary',
              borderColor: 'divider',
              textTransform: 'none',
              borderRadius: 2,
              backgroundColor: 'background.paper',
              transition: 'all 0.2s ease-in-out',
              '&:hover': {
                backgroundColor: 'grey.50',
                borderColor: 'text.disabled',
                color: 'text.secondary',
                boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
              }
            }}
          >
            Limpar filtros
          </Button>
        )}
      </Box>
      <Box sx={{ p: { xs: 2, sm: 2.5, md: 3 } }}>
        <Grid
          container
          spacing={{ xs: 2, sm: 2.5, md: 2.5 }}
        >
          {/* Campo de busca */}
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              placeholder='Buscar por número ou objeto...'
              value={searchValue}
              onChange={(e) => onSearchChange(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon sx={{ color: 'text.disabled', fontSize: 20, mr: 1.5 }} />
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  height: 42,
                  borderRadius: 2,
                  backgroundColor: 'background.paper',
                  fontSize: '0.875rem',
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'divider'
                    }
                  },
                  '&.Mui-focused': {
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: theme.palette.primary.main,
                      borderWidth: '1.5px'
                    }
                  }
                },
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'divider'
                },
                '& .MuiInputBase-input::placeholder': {
                  color: 'text.disabled',
                  opacity: 1,
                  fontSize: '0.875rem'
                }
              }}
            />
          </Grid>

          {/* Filtro de Prioridade */}
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <FormControl fullWidth>
              <Select
                value={urlParams.get('priority') || 'all'}
                onChange={(e) => handleFilterChange('priority', e.target.value)}
                sx={{
                  height: 42,
                  borderRadius: 2,
                  fontSize: '0.875rem',
                  backgroundColor: 'background.paper',
                  '&:hover': {
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'divider'
                    }
                  },
                  '&.Mui-focused': {
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: theme.palette.primary.main,
                      borderWidth: '1.5px'
                    }
                  },
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'divider'
                  },
                  '& .MuiSelect-select': {
                    display: 'flex',
                    alignItems: 'center',
                    py: 1.25,
                    px: 1.5
                  }
                }}
              >
                <MenuItem
                  value='all'
                  sx={{
                    fontSize: '0.875rem',
                    '&:hover': {
                      backgroundColor: 'grey.50'
                    },
                    '&.Mui-selected': {
                      backgroundColor: 'grey.100',
                      '&:hover': {
                        backgroundColor: 'grey.100'
                      }
                    }
                  }}
                >
                  Todas as prioridades
                </MenuItem>
                {PRIORITIES.map((priority) => (
                  <MenuItem
                    key={priority}
                    value={priority}
                    sx={{
                      fontSize: '0.875rem',
                      '&:hover': {
                        backgroundColor: 'grey.50'
                      },
                      '&.Mui-selected': {
                        backgroundColor: 'grey.100',
                        '&:hover': {
                          backgroundColor: 'grey.100'
                        }
                      }
                    }}
                  >
                    {priority}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Filtro de Modalidade */}
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <FormControl fullWidth>
              <Select
                value={urlParams.get('modality') || 'all'}
                onChange={(e) => handleFilterChange('modality', e.target.value)}
                sx={{
                  height: 42,
                  borderRadius: 2,
                  fontSize: '0.875rem',
                  backgroundColor: 'background.paper',
                  '&:hover': {
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'divider'
                    }
                  },
                  '&.Mui-focused': {
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: theme.palette.primary.main,
                      borderWidth: '1.5px'
                    }
                  },
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'divider'
                  },
                  '& .MuiSelect-select': {
                    display: 'flex',
                    alignItems: 'center',
                    py: 1.25,
                    px: 1.5
                  }
                }}
              >
                <MenuItem
                  value='all'
                  sx={{
                    fontSize: '0.875rem',
                    '&:hover': {
                      backgroundColor: 'grey.50'
                    },
                    '&.Mui-selected': {
                      backgroundColor: 'grey.100',
                      '&:hover': {
                        backgroundColor: 'grey.100'
                      }
                    }
                  }}
                >
                  Todas as modalidades
                </MenuItem>
                {MODALITIES.map((modality) => (
                  <MenuItem
                    key={modality}
                    value={modality}
                    sx={{
                      fontSize: '0.875rem',
                      '&:hover': {
                        backgroundColor: 'grey.50'
                      },
                      '&.Mui-selected': {
                        backgroundColor: 'grey.100',
                        '&:hover': {
                          backgroundColor: 'grey.100'
                        }
                      }
                    }}
                  >
                    {modality}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Filtro de Etapa Atual */}
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <FormControl fullWidth>
              <Select
                value={urlParams.get('currentStage') || 'all'}
                onChange={(e) => handleFilterChange('currentStage', e.target.value)}
                sx={{
                  height: 42,
                  borderRadius: 2,
                  fontSize: '0.875rem',
                  backgroundColor: 'background.paper',
                  '&:hover': {
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'divider'
                    }
                  },
                  '&.Mui-focused': {
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: theme.palette.primary.main,
                      borderWidth: '1.5px'
                    }
                  },
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'divider'
                  },
                  '& .MuiSelect-select': {
                    display: 'flex',
                    alignItems: 'center',
                    py: 1.25,
                    px: 1.5
                  }
                }}
              >
                <MenuItem
                  value='all'
                  sx={{
                    fontSize: '0.875rem',
                    '&:hover': {
                      backgroundColor: 'grey.50'
                    },
                    '&.Mui-selected': {
                      backgroundColor: 'grey.100',
                      '&:hover': {
                        backgroundColor: 'grey.100'
                      }
                    }
                  }}
                >
                  Todas as etapas
                </MenuItem>
                {STAGES.map((stage) => (
                  <MenuItem
                    key={stage}
                    value={stage}
                    sx={{
                      fontSize: '0.875rem',
                      '&:hover': {
                        backgroundColor: 'grey.50'
                      },
                      '&.Mui-selected': {
                        backgroundColor: 'grey.100',
                        '&:hover': {
                          backgroundColor: 'grey.100'
                        }
                      }
                    }}
                  >
                    {stage}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Filtro de Situação */}
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <FormControl fullWidth>
              <Select
                value={urlParams.get('status') || 'all'}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                sx={{
                  height: 42,
                  borderRadius: 2,
                  fontSize: '0.875rem',
                  backgroundColor: 'background.paper',
                  '&:hover': {
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'divider'
                    }
                  },
                  '&.Mui-focused': {
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: theme.palette.primary.main,
                      borderWidth: '1.5px'
                    }
                  },
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'divider'
                  },
                  '& .MuiSelect-select': {
                    display: 'flex',
                    alignItems: 'center',
                    py: 1.25,
                    px: 1.5
                  }
                }}
              >
                <MenuItem
                  value='all'
                  sx={{
                    fontSize: '0.875rem',
                    '&:hover': {
                      backgroundColor: 'grey.50'
                    },
                    '&.Mui-selected': {
                      backgroundColor: 'grey.100',
                      '&:hover': {
                        backgroundColor: 'grey.100'
                      }
                    }
                  }}
                >
                  Todas as situações
                </MenuItem>
                {STATUSES.map((status) => (
                  <MenuItem
                    key={status}
                    value={status}
                    sx={{
                      fontSize: '0.875rem',
                      '&:hover': {
                        backgroundColor: 'grey.50'
                      },
                      '&.Mui-selected': {
                        backgroundColor: 'grey.100',
                        '&:hover': {
                          backgroundColor: 'grey.100'
                        }
                      }
                    }}
                  >
                    {status}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Box>
    </Card>
  );
};
