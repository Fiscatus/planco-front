// Landing page design tokens — exact values from Planco Landing.html
// Use these instead of theme.palette.* where the HTML value differs from the theme
export const BLUE_50 = '#E3F2FD';
export const BLUE_300 = '#64B5F6';
export const BLUE_500 = '#1976d2';
export const BLUE_600 = '#1565C0';
export const BLUE_700 = '#0D47A1';
export const INK_25 = '#FBFCFE';
export const INK_50 = '#F7F9FC';
export const INK_75 = '#F2F4F7';
export const INK_100 = '#EAECF0';
export const INK_200 = '#E4E7EC';
export const INK_300 = '#D0D5DD';
export const INK_400 = '#98A2B3';
export const INK_500 = '#667085';
export const INK_600 = '#475467';
export const INK_700 = '#2C3648';
export const INK_800 = '#1A2335';
export const INK_900 = '#0E1726';
export const GREEN_500 = '#12B76A';
export const AMBER_500 = '#F79009';
export const RED_500 = '#D92D20';

export const SHADOW_XS = '0 1px 2px rgba(16, 24, 40, 0.05)';
export const SHADOW_SM = '0 1px 3px rgba(16, 24, 40, 0.08), 0 1px 2px rgba(16, 24, 40, 0.04)';
export const SHADOW_MD = '0 4px 12px -2px rgba(16, 24, 40, 0.08), 0 2px 6px -2px rgba(16, 24, 40, 0.04)';
export const SHADOW_LG = '0 16px 40px -12px rgba(16, 24, 40, 0.18), 0 6px 16px -6px rgba(16, 24, 40, 0.08)';
export const SHADOW_XL = '0 32px 64px -16px rgba(16, 24, 40, 0.22), 0 12px 32px -8px rgba(16, 24, 40, 0.10)';

export const FONT_MONO = "'Roboto Mono', ui-monospace, SFMono-Regular, Menlo, monospace";

export const CONTAINER_SX = {
  width: '100%',
  maxWidth: '1200px',
  mx: 'auto',
  px: { xs: '20px', sm: '32px' },
} as const;

// Dark mode tokens
export const DARK = {
  bg: '#0B0F1A',
  surface: '#131825',
  surfaceAlt: '#1A2035',
  border: '#1E2A3D',
  text: '#E8ECF4',
  textMuted: '#8B95A8',
  textSubtle: '#5E6A7E',
} as const;
