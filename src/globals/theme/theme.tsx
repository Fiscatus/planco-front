import { createTheme, type ThemeOptions } from '@mui/material';

const themeOptions: ThemeOptions = {
  palette: {
    mode: 'light',

    // Meta / Facebook brand
    primary: {
      main: '#1877F2',     // Brand Blue
      dark: '#105BBE',     // Deep Blue (ativo/foco)
      light: '#66A5F7',    // Azul claro para estados/realces (calc. segura)
      contrastText: '#FFFFFF'
    },

    // Use secundária como apoio neutro/azulado quando precisar de ênfase secundária
    secondary: {
      main: '#166FE5',     // Hover Blue (link/hover)
      dark: '#105BBE',
      light: '#E7F3FF',    // Fundo azul bem claro (chips/badges)
      contrastText: '#FFFFFF'
    },

    // Feedbacks oficiais aproximados
    success: {
      main: '#31A24C',
      light: '#6FD389',
      dark: '#1F7A37',
      contrastText: '#FFFFFF'
    },
    error: {
      main: '#F02849',
      light: '#F56B7F',
      dark: '#B81E34',
      contrastText: '#FFFFFF'
    },
    warning: {
      main: '#F7B928',
      light: '#FFD666',
      dark: '#B38800',
      contrastText: '#1C1E21'
    },
    info: {
      main: '#1877F2',
      light: '#66A5F7',
      dark: '#105BBE',
      contrastText: '#FFFFFF'
    },

    // Neutros da interface do Facebook
    background: {
      default: '#f4f6f8',  // cinza claro padrão da UI
      paper: '#ffffff'
    },
    text: {
      primary: '#212121',   // texto principal
      secondary: '#616161', // texto secundário
      disabled: '#A0A4A8'   // desabilitado
    },
    divider: '#E4E6EB',

    // Escala de cinzas (útil para bordas/estados)
    grey: {
      50:  '#F5F6F7',
      100: '#F0F2F5',
      200: '#E4E6EB',
      300: '#D8DADF',
      400: '#CCD0D5',
      500: '#B0B3B8',
      600: '#8A8D91',
      700: '#65676B',
      800: '#3A3B3C',
      900: '#1C1E21'
    },

    // Estados de ação (hover/selected/active) alinhados à marca
    action: {
      hover: '#166FE5',              // azul de hover
      selected: 'rgba(24,119,242,0.08)',
      active: '#105BBE',
      disabled: 'rgba(0,0,0,0.26)',
      disabledBackground: 'rgba(0,0,0,0.12)',
      focus: 'rgba(24,119,242,0.24)',
      hoverOpacity: 0.08
    }
  },

  shape: { borderRadius: 12 },

  typography: {
    fontFamily: "'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica', 'Arial', sans-serif",
    fontWeightLight: 400,
    fontSize: 15,
    h1: { fontWeight: 700, fontSize: "2.75rem", lineHeight: 1.15 },
    h2: { fontWeight: 700, fontSize: "2rem" },
    h3: { fontWeight: 700, fontSize: "1.375rem" },
    h4: { fontFamily: "'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica', 'Arial', sans-serif", fontSize: 28, fontWeight: 700 },
    h5: { fontFamily: "'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica', 'Arial', sans-serif", fontSize: 22 },
    h6: { fontFamily: "'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica', 'Arial', sans-serif", fontSize: 18, fontWeight: 700 },
    body1: { color: "#616161" },
    overline: { fontFamily: "'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica', 'Arial', sans-serif", fontSize: 14, fontWeight: 400, letterSpacing: 1.1 },
    subtitle1: { fontFamily: "'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica', 'Arial', sans-serif", fontSize: 13, fontWeight: 700 }
  },

  components: {
    MuiCssBaseline: {
      styleOverrides: {
        html: {
          scrollbarWidth: 'thin',
          scrollbarColor: '#A0A4A8 #EEF0F4'
        },
        body: {
          margin: 0,
          padding: 0,
          display: 'flex',
          placeItems: 'center',
          backgroundColor: '#f4f6f8',
          width: '100%'
        },
        '#root': {
          width: '100%',
          height: '100%'
        },
        '::-webkit-scrollbar': { width: '8px' },
        '::-webkit-scrollbar-track': { background: 'rgba(240, 242, 245, 0.6)' },
        '::-webkit-scrollbar-thumb': {
          background: '#A0A4A8',
          borderRadius: '6px'
        },
        '::-webkit-scrollbar-thumb:hover': { background: '#787D82' }
      }
    },
    MuiButton: {
      defaultProps: { variant: "contained", disableElevation: true },
      styleOverrides: {
        root: { textTransform: "none", borderRadius: 10, fontWeight: 600 },
        containedPrimary: { ":hover": { backgroundColor: "#105BBE" } },
        outlinedPrimary: { ":hover": { backgroundColor: "rgba(24,119,242,0.08)" } },
      },
    },
    MuiCard: { 
      styleOverrides: { 
        root: { borderRadius: 16, boxShadow: "0 1px 3px rgba(16,24,40,.08)" } 
      } 
    },
    MuiContainer: {
      defaultProps: {
        maxWidth: "lg",
        style: { paddingLeft: 0, paddingRight: 0, margin: 0 }
      },
      styleOverrides: {
        root: { paddingLeft: 0, paddingRight: 0, margin: 0 }
      }
    }
  }
};

const theme = createTheme(themeOptions);

export { theme };
