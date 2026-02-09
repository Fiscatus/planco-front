import { DarkMode, LightMode } from '@mui/icons-material';
import { IconButton, Tooltip } from '@mui/material';
import { useThemeMode } from '@/contexts';

const ThemeToggle = () => {
  const { mode, toggleTheme } = useThemeMode();
  const isDark = mode === 'dark';

  return (
    <Tooltip title={isDark ? 'Mudar para tema claro' : 'Mudar para tema escuro'}>
      <IconButton
        onClick={toggleTheme}
        sx={{
          width: 40,
          height: 40,
          color: 'text.secondary',
          borderRadius: '50%',
          transition: 'all 0.3s ease',
          '&:hover': {
            backgroundColor: 'action.hover',
            transform: 'rotate(180deg)'
          }
        }}
        aria-label={isDark ? 'Mudar para tema claro' : 'Mudar para tema escuro'}
      >
        {isDark ? <LightMode sx={{ fontSize: 24 }} /> : <DarkMode sx={{ fontSize: 24 }} />}
      </IconButton>
    </Tooltip>
  );
};

export { ThemeToggle };
