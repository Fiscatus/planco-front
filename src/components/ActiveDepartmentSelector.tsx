import {
  Box,
  Chip,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  Typography
} from '@mui/material';
import { Business, ExpandMore } from '@mui/icons-material';

import type { Department } from '@/globals/types';
import { Loading } from './Loading';
import { useActiveDepartment } from '@/contexts';

interface ActiveDepartmentSelectorProps {
  variant?: 'full' | 'compact';
  showLabel?: boolean;
}

export const ActiveDepartmentSelector = ({ 
  variant = 'full', 
  showLabel = true 
}: ActiveDepartmentSelectorProps) => {
  const { 
    activeDepartment, 
    setActiveDepartment, 
    availableDepartments, 
    isLoading 
  } = useActiveDepartment();

  const handleDepartmentChange = (event: SelectChangeEvent<string>) => {
    const selectedId = event.target.value;
    const selectedDepartment = availableDepartments.find(dept => dept._id === selectedId);
    if (selectedDepartment) {
      setActiveDepartment(selectedDepartment);
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Business sx={{ fontSize: 20, color: 'text.secondary' }} />
        <Loading isLoading={true} />
      </Box>
    );
  }

  if (availableDepartments.length === 0) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Business sx={{ fontSize: 20, color: 'text.secondary' }} />
        <Typography variant="body2" color="text.secondary">
          Nenhuma gerência disponível
        </Typography>
      </Box>
    );
  }

  if (availableDepartments.length === 1) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Business sx={{ fontSize: 20, color: 'primary.main' }} />
        <Typography variant="body2" fontWeight={500}>
          {availableDepartments[0].department_name}
        </Typography>
        <Chip
          label={availableDepartments[0].department_acronym}
          size="small"
          sx={{
            fontSize: '0.75rem',
            fontFamily: 'monospace',
            bgcolor: 'grey.200',
            color: 'text.secondary',
            borderRadius: 1
          }}
        />
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Business sx={{ fontSize: 20, color: 'primary.main' }} />
        {showLabel && (
          <Typography variant="body2" fontWeight={500} color="text.secondary">
            Gerência Ativa:
          </Typography>
        )}
      </Box>
      
      <FormControl 
        size="small" 
          sx={{ 
            minWidth: variant === 'full' ? 250 : 200,
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
              backgroundColor: 'background.paper',
              border: '1px solid',
              borderColor: 'divider',
              '&:hover': {
                borderColor: 'primary.main',
                backgroundColor: 'background.paper'
              },
              '&.Mui-focused': {
                borderColor: 'primary.main',
                boxShadow: '0 0 0 2px rgba(25, 118, 210, 0.2)',
                backgroundColor: 'background.paper'
              }
            }
          }}
      >
        <InputLabel 
          id="active-department-select-label"
          sx={{ 
            fontSize: '0.875rem',
            color: 'text.secondary',
            '&.Mui-focused': {
              color: 'primary.main'
            }
          }}
        >
          Selecione a gerência
        </InputLabel>
        <Select
          labelId="active-department-select-label"
          value={activeDepartment?._id || ''}
          onChange={handleDepartmentChange}
          label="Selecione a gerência"
          IconComponent={ExpandMore}
          sx={{
            fontSize: '0.875rem',
            backgroundColor: '#ffffff',
            '& .MuiSelect-select': {
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              py: 1
            },
            '& .MuiSelect-icon': {
              color: '#64748b'
            }
          }}
        >
          {availableDepartments.map((department) => (
            <MenuItem 
              key={department._id} 
              value={department._id}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                py: 1.5,
                '&:hover': {
                  backgroundColor: '#f8fafc'
                },
                '&.Mui-selected': {
                  backgroundColor: '#f1f5f9',
                  '&:hover': {
                    backgroundColor: '#f1f5f9'
                  }
                }
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1 }}>
                <Typography variant="body2" fontWeight={500}>
                  {department.department_name}
                </Typography>
                <Chip
                  label={department.department_acronym}
                  size="small"
                  sx={{
                    fontSize: '0.75rem',
                    fontFamily: 'monospace',
                    bgcolor: 'grey.200',
                    color: 'text.secondary',
                    borderRadius: 1
                  }}
                />
              </Box>
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
};
