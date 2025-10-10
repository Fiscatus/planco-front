import { createTheme, type ThemeOptions } from '@mui/material';

const themeOptions: ThemeOptions = {
  palette: {
    mode: 'light',
    // Azul padrão do Facebook
    primary: {
      main: 'rgb(24, 119, 242)',      // #1877F2 - Azul principal Facebook
      light: 'rgb(100, 164, 247)',    // Hover mais claro
      dark: 'rgb(16, 91, 186)'        // Foco/ativo
    },
    // Verde suave (para confirmações e ações positivas)
    secondary: {
      main: 'rgb(56, 203, 120)',      // #38CB78
      light: 'rgb(103, 220, 157)',    // Hover mais claro
      dark: 'rgb(33, 156, 91)'        // Foco
    },
    success: {
      main: 'rgb(56, 203, 120)',      // verde Facebook (confirmações)
      light: 'rgb(103, 220, 157)',
      dark: 'rgb(33, 156, 91)',
      contrastText: '#fff'
    },
    info: {
      main: 'rgb(24, 119, 242)',      // mesmo azul para consistência
      light: 'rgb(100, 164, 247)',
      dark: 'rgb(16, 91, 186)',
      contrastText: '#fff'
    },
    warning: {
      main: 'rgb(247, 188, 35)',      // #F7BC23 - amarelo alerta
      light: 'rgb(255, 214, 102)',
      dark: 'rgb(179, 136, 0)',
      contrastText: 'rgb(27, 31, 42)'
    },
    error: {
      main: 'rgb(235, 67, 53)',       // #EB4335 - vermelho usado em avisos
      light: 'rgb(245, 113, 104)',
      dark: 'rgb(170, 41, 32)',
      contrastText: '#fff'
    },
    background: {
      default: 'rgb(245, 246, 247)',  // fundo neutro e leve, inspirado no layout do Facebook
      paper: 'rgb(255, 255, 255)'     // cartões, painéis e modais
    },
    text: {
      primary: 'rgb(28, 30, 33)',     // texto principal (quase preto)
      secondary: 'rgb(101, 103, 107)',// texto secundário
      disabled: 'rgb(160, 164, 168)'  // texto desabilitado
    },
    divider: 'rgb(223, 225, 229)'     // linhas sutis e limpas
  },
  typography: {
    fontFamily: '"Source Sans Pro", sans-serif',
    fontWeightLight: 400,
    fontSize: 15,
    h1: {
      fontFamily: '"Source Sans Pro", sans-serif',
      fontSize: 56
    },
    h2: {
      fontFamily: '"Source Sans Pro", sans-serif',
      fontSize: 40
    },
    h3: {
      fontFamily: '"Source Sans Pro", sans-serif',
      fontSize: 32,
      fontWeight: 700
    },
    h4: {
      fontFamily: '"Source Sans Pro", sans-serif',
      fontSize: 28,
      fontWeight: 700
    },
    h5: {
      fontFamily: '"Source Sans Pro", sans-serif',
      fontSize: 22
    },
    h6: {
      fontFamily: '"Source Sans Pro", sans-serif',
      fontSize: 18,
      fontWeight: 700
    },
    overline: {
      fontFamily: '"Source Sans Pro", sans-serif',
      fontSize: 14,
      fontWeight: 400,
      letterSpacing: 1.1
    },
    subtitle1: {
      fontFamily: '"Source Sans Pro", sans-serif',
      fontSize: 13,
      fontWeight: 700
    }
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        html: {
          scrollbarWidth: 'thin',
          scrollbarColor: 'rgb(160, 164, 168) rgb(238, 240, 244)'
        },
        body: {
          margin: 0,
          padding: 0,
          display: 'flex',
          placeItems: 'center',
          backgroundColor: 'rgb(245, 246, 247)',
          width: '100%'
        },
        '#root': {
          width: '100%',
          height: '100%'
        },
        '::-webkit-scrollbar': {
          width: '8px'
        },
        '::-webkit-scrollbar-track': {
          background: 'rgba(240, 242, 245, 0.6)'
        },
        '::-webkit-scrollbar-thumb': {
          background: 'rgb(160, 164, 168)',
          borderRadius: '6px'
        },
        '::-webkit-scrollbar-thumb:hover': {
          background: 'rgb(120, 125, 130)'
        }
      }
    },
    MuiContainer: {
      defaultProps: {
        maxWidth: false,
        style: {
          paddingLeft: 0,
          paddingRight: 0,
          margin: 0
        }
      },
      styleOverrides: {
        root: {
          paddingLeft: 0,
          paddingRight: 0,
          margin: 0
        }
      }
    }
  }
};

const theme = createTheme(themeOptions);

export { theme };
