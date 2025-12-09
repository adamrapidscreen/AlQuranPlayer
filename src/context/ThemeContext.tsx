import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';

import { DEFAULT_THEME_MODE, ThemePalette, type ThemeColors, type ThemeMode } from '../constants/theme';

type ThemeContextValue = {
  mode: ThemeMode;
  colors: ThemeColors;
  toggleTheme: () => void;
  setTheme: (mode: ThemeMode) => void;
  isDark: boolean;
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<ThemeMode>(DEFAULT_THEME_MODE);

  const value = useMemo<ThemeContextValue>(() => {
    const colors = ThemePalette[mode];
    return {
      mode,
      colors,
      isDark: mode === 'dark',
      toggleTheme: () => setMode((prev) => (prev === 'light' ? 'dark' : 'light')),
      setTheme: setMode,
    };
  }, [mode]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

