import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

type Mode = 'light' | 'dark';

const LandingThemeContext = createContext<{ mode: Mode; toggle: () => void }>({
  mode: 'light',
  toggle: () => {},
});

export const useLandingTheme = () => useContext(LandingThemeContext);

export const LandingThemeProvider = ({ children }: { children: ReactNode }) => {
  const [mode, setMode] = useState<Mode>(() => {
    const saved = localStorage.getItem('landing-theme');
    if (saved === 'dark' || saved === 'light') return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  useEffect(() => {
    localStorage.setItem('landing-theme', mode);
  }, [mode]);

  const toggle = () => setMode(m => (m === 'light' ? 'dark' : 'light'));

  return (
    <LandingThemeContext.Provider value={{ mode, toggle }}>
      {children}
    </LandingThemeContext.Provider>
  );
};
