import { Box, Typography } from '@mui/material';
import { useCallback } from 'react';

interface CustomSwitchProps {
  checked: boolean;
  onChange: () => void;
  disabled?: boolean;
  label?: string;
}

export const CustomSwitch = ({ checked, onChange, disabled = false, label }: CustomSwitchProps) => {
  const handleChange = useCallback(() => {
    if (!disabled) {
      onChange();
    }
  }, [disabled, onChange]);

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <Box
        component="label"
        sx={{
          position: 'relative',
          display: 'inline-block',
          width: 48,
          height: 24,
          cursor: disabled ? 'not-allowed' : 'pointer',
          opacity: disabled ? 0.6 : 1
        }}
      >
        <input
          type="checkbox"
          className="sr-only peer"
          checked={checked}
          onChange={handleChange}
          disabled={disabled}
        />
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: checked ? '#1976d2' : '#ccc',
            borderRadius: '24px',
            transition: 'background-color 0.2s ease-in-out',
            cursor: disabled ? 'not-allowed' : 'pointer'
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: '2px',
            left: checked ? '26px' : '2px',
            width: '20px',
            height: '20px',
            backgroundColor: 'white',
            borderRadius: '50%',
            transition: 'left 0.2s ease-in-out',
            boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
          }}
        />
      </Box>
      {label && (
        <Typography
          variant="body2"
          sx={{
            color: checked ? 'primary.main' : 'text.secondary',
            fontWeight: checked ? 600 : 400,
            transition: 'color 0.2s ease-in-out'
          }}
        >
          {label}
        </Typography>
      )}
    </Box>
  );
};
