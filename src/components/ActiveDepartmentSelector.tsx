import { Business, ExpandMore } from '@mui/icons-material';
import {
  Box,
  Chip,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  type SelectChangeEvent,
  Typography
} from '@mui/material';
import { useId } from 'react';
import { useActiveDepartment } from '@/contexts';
import { Loading } from './Loading';

interface ActiveDepartmentSelectorProps {
  variant?: 'full' | 'compact';
  showLabel?: boolean;
}

export const ActiveDepartmentSelector = ({ variant = 'full', showLabel = true }: ActiveDepartmentSelectorProps) => {
  const { activeDepartment, setActiveDepartment, availableDepartments, isLoading } = useActiveDepartment();
  const selectLabelId = useId();

  const handleDepartmentChange = (event: SelectChangeEvent<string>) => {
    const selectedId = event.target.value;
    const selectedDepartment = availableDepartments.find((dept) => dept._id === selectedId);
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
        <Typography
          variant='body2'
          color='text.secondary'
        >
          Nenhuma gerência disponível
        </Typography>
      </Box>
    );
  }

  if (availableDepartments.length === 1) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Business sx={{ fontSize: 20, color: 'primary.main' }} />
        <Typography
          variant='body2'
          fontWeight={500}
        >
          {availableDepartments[0].department_name}
        </Typography>
        <Chip
          label={availableDepartments[0].department_acronym}
          size='small'
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
          <Typography
            variant='body2'
            fontWeight={500}
            color='text.secondary'
          >
            Gerência Ativa:
          </Typography>
        )}
      </Box>

      <FormControl
        size='small'
        sx={{
          minWidth: variant === 'full' ? 250 : 200,
          '& .MuiOutlinedInput-root': {
            borderRadius: 2,
            backgroundColor: 'background.paper',
            border: '1px solid',
            borderColor: 'divider',
            '&:hover': {
              borderColor: 'primary.main'
            },
            '&.Mui-focused': {
              borderColor: 'primary.main',
              boxShadow: '0 0 0 2px rgba(25, 118, 210, 0.2)'
            }
          }
        }}
      >
        <InputLabel
          id={selectLabelId}
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
          labelId={selectLabelId}
          value={activeDepartment?._id || ''}
          onChange={handleDepartmentChange}
          label='Selecione a gerência'
          IconComponent={ExpandMore}
          sx={{
            fontSize: '0.875rem',
            '& .MuiSelect-select': {
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              py: 1
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
                '&.Mui-selected': {
                  backgroundColor: '#f1f5f9',
                  '&:hover': {
                    backgroundColor: '#f1f5f9'
                  }
                }
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1 }}>
                <Typography
                  variant='body2'
                  fontWeight={500}
                >
                  {department.department_name}
                </Typography>
                <Chip
                  label={department.department_acronym}
                  size='small'
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
