import { createTheme, type ThemeOptions } from '@mui/material';

const themeOptions: ThemeOptions = {
  palette: {
    mode: 'light',
    primary: {
      main: 'rgb(28, 77, 150)',
      light: 'rgb(96, 126, 200)',
      dark: 'rgb(6, 40, 99)'
    },
    secondary: {
      dark: 'rgb(122, 98, 21)',
      main: 'rgb(160, 129, 29)',
      light: 'rgb(212, 175, 55)'
    }
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
          scrollbarColor: 'rgb(136, 136, 136) rgb(40, 40, 40)'
        },
        body: {
          margin: 0,
          padding: 0,
          display: 'flex',
          placeItems: 'center',
          backgroundColor: 'rgb(245, 245, 245)',
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
          background: 'rgba(245, 245, 245, 0.25)'
        },
        '::-webkit-scrollbar-thumb': {
          background: 'rgb(119, 119, 119)',
          borderRadius: '6px'
        },
        '::-webkit-scrollbar-thumb:hover': {
          background: 'rgb(85, 85, 85)'
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
