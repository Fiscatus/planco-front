import { createTheme, type ThemeOptions } from '@mui/material';

type ThemeMode = 'light' | 'dark';

const getThemeOptions = (mode: ThemeMode): ThemeOptions => {
  const isDark = mode === 'dark';

  return {
    palette: {
      mode,

      primary: {
        main: '#1877F2',
        dark: '#105BBE',
        light: '#66A5F7',
        contrastText: '#FFFFFF'
      },

      secondary: {
        main: '#166FE5',
        dark: '#105BBE',
        light: isDark ? '#1E3A5F' : '#E7F3FF',
        contrastText: '#FFFFFF'
      },

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
        contrastText: isDark ? '#FFFFFF' : '#1C1E21'
      },
      info: {
        main: '#1877F2',
        light: '#66A5F7',
        dark: '#105BBE',
        contrastText: '#FFFFFF'
      },

      background: {
        default: isDark ? '#121212' : '#f4f6f8',
        paper: isDark ? '#1E1E1E' : '#ffffff'
      },
      text: {
        primary: isDark ? '#E4E6EB' : '#212121',
        secondary: isDark ? '#B0B3B8' : '#616161',
        disabled: isDark ? '#65676B' : '#A0A4A8'
      },
      divider: isDark ? '#3A3B3C' : '#E4E6EB',

      grey: {
        50: isDark ? '#1C1E21' : '#F5F6F7',
        100: isDark ? '#3A3B3C' : '#F0F2F5',
        200: isDark ? '#4E4F50' : '#E4E6EB',
        300: isDark ? '#65676B' : '#D8DADF',
        400: isDark ? '#8A8D91' : '#CCD0D5',
        500: '#B0B3B8',
        600: isDark ? '#CCD0D5' : '#8A8D91',
        700: isDark ? '#D8DADF' : '#65676B',
        800: isDark ? '#E4E6EB' : '#3A3B3C',
        900: isDark ? '#F0F2F5' : '#1C1E21'
      },

      action: {
        hover: isDark ? 'rgba(24,119,242,0.16)' : 'rgba(24,119,242,0.08)',
        selected: isDark ? 'rgba(24,119,242,0.16)' : 'rgba(24,119,242,0.08)',
        active: '#105BBE',
        disabled: isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.26)',
        disabledBackground: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.12)',
        focus: 'rgba(24,119,242,0.24)',
        hoverOpacity: 0.08
      }
    },

    shape: { borderRadius: 12 },

    typography: {
      fontFamily: "'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica', 'Arial', sans-serif",
      fontWeightLight: 400,
      fontSize: 15,
      h1: { fontWeight: 700, fontSize: '2.75rem', lineHeight: 1.15 },
      h2: { fontWeight: 700, fontSize: '2rem' },
      h3: { fontWeight: 700, fontSize: '1.375rem' },
      h4: {
        fontFamily: "'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica', 'Arial', sans-serif",
        fontSize: 28,
        fontWeight: 700
      },
      h5: {
        fontFamily: "'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica', 'Arial', sans-serif",
        fontSize: 22
      },
      h6: {
        fontFamily: "'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica', 'Arial', sans-serif",
        fontSize: 18,
        fontWeight: 700
      },
      body1: { color: isDark ? '#B0B3B8' : '#616161' },
      overline: {
        fontFamily: "'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica', 'Arial', sans-serif",
        fontSize: 14,
        fontWeight: 400,
        letterSpacing: 1.1
      },
      subtitle1: {
        fontFamily: "'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica', 'Arial', sans-serif",
        fontSize: 13,
        fontWeight: 700
      }
    },

    components: {
      MuiCssBaseline: {
        styleOverrides: {
          html: {
            scrollbarWidth: 'thin',
            scrollbarColor: isDark ? '#65676B #1E1E1E' : '#A0A4A8 #EEF0F4'
          },
          body: {
            margin: 0,
            padding: 0,
            display: 'flex',
            placeItems: 'center',
            backgroundColor: isDark ? '#121212' : '#f4f6f8',
            width: '100%',
            transition: 'background-color 0.3s ease'
          },
          '#root': {
            width: '100%',
            height: '100%'
          },
          '::-webkit-scrollbar': { width: '8px' },
          '::-webkit-scrollbar-track': {
            background: isDark ? 'rgba(30, 30, 30, 0.6)' : 'rgba(240, 242, 245, 0.6)'
          },
          '::-webkit-scrollbar-thumb': {
            background: isDark ? '#65676B' : '#A0A4A8',
            borderRadius: '6px'
          },
          '::-webkit-scrollbar-thumb:hover': {
            background: isDark ? '#8A8D91' : '#787D82'
          }
        }
      },
      MuiButton: {
        defaultProps: { variant: 'contained', disableElevation: true },
        styleOverrides: {
          root: { textTransform: 'none', borderRadius: 10, fontWeight: 600 },
          containedPrimary: { ':hover': { backgroundColor: '#105BBE' } },
          outlinedPrimary: { ':hover': { backgroundColor: 'rgba(24,119,242,0.08)' } }
        }
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 16,
            boxShadow: isDark ? '0 1px 3px rgba(0,0,0,.24)' : '0 1px 3px rgba(16,24,40,.08)',
            backgroundColor: isDark ? '#1E1E1E' : '#ffffff',
            transition: 'background-color 0.3s ease, box-shadow 0.3s ease'
          }
        }
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundColor: isDark ? '#1E1E1E' : '#ffffff',
            transition: 'background-color 0.3s ease'
          }
        }
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundColor: isDark ? '#1E1E1E' : '#ffffff',
            transition: 'background-color 0.3s ease'
          }
        }
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            backgroundColor: isDark ? '#1E1E1E' : '#ffffff',
            transition: 'background-color 0.3s ease'
          }
        }
      },
      MuiMenu: {
        styleOverrides: {
          paper: {
            backgroundColor: isDark ? '#2D2D2D' : '#ffffff'
          }
        }
      },
      MuiDialog: {
        styleOverrides: {
          paper: {
            backgroundColor: isDark ? '#1E1E1E' : '#ffffff'
          }
        }
      },
      MuiTableCell: {
        styleOverrides: {
          root: {
            borderColor: isDark ? '#3A3B3C' : '#E4E6EB'
          }
        }
      },
      MuiDivider: {
        styleOverrides: {
          root: {
            borderColor: isDark ? '#3A3B3C' : '#E4E6EB'
          }
        }
      },
      MuiChip: {
        styleOverrides: {
          root: {
            backgroundColor: isDark ? '#3A3B3C' : '#F0F2F5'
          }
        }
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              backgroundColor: isDark ? '#2D2D2D' : '#ffffff',
              '& fieldset': {
                borderColor: isDark ? '#3A3B3C' : '#E4E6EB'
              },
              '&:hover fieldset': {
                borderColor: isDark ? '#65676B' : '#D8DADF'
              }
            }
          }
        }
      },
      MuiSelect: {
        styleOverrides: {
          root: {
            backgroundColor: isDark ? '#2D2D2D' : '#ffffff'
          }
        }
      },
      MuiInputBase: {
        styleOverrides: {
          root: {
            backgroundColor: isDark ? '#2D2D2D' : 'transparent'
          }
        }
      },
      MuiContainer: {
        defaultProps: {
          maxWidth: 'lg',
          style: { paddingLeft: 0, paddingRight: 0, margin: 0 }
        },
        styleOverrides: {
          root: { paddingLeft: 0, paddingRight: 0, margin: 0 }
        }
      }
    }
  };
};

const theme = createTheme(getThemeOptions('light'));

export { theme, getThemeOptions };
