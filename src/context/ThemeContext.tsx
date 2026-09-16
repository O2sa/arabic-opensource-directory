import React, { createContext, useContext, useState, useEffect } from 'react';
import { Theme } from '../types';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>(() => {
    // 1. Read early attribute already applied by the anti-FOUC script in <head>
    if (typeof document !== 'undefined') {
      const existing = document.documentElement.getAttribute('data-theme') as Theme;
      if (existing === 'dark' || existing === 'light') {
        return existing;
      }
    }

    // 2. Check localStorage
    try {
      const saved = localStorage.getItem('ar_dir_theme') as Theme;
      if (saved === 'dark' || saved === 'light') {
        return saved;
      }
    } catch {
      // Ignore localStorage errors
    }

    // 3. Fallback to system preference on first visit
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }

    return 'dark';
  });

  // Keep document attribute in sync with state
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Listen to OS-level dark/light mode toggles if user has not set an explicit override
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      try {
        const manual = localStorage.getItem('ar_dir_theme');
        if (!manual) {
          setThemeState(e.matches ? 'dark' : 'light');
        }
      } catch {
        // Ignore storage errors
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const toggleTheme = () => {
    setThemeState(prev => {
      const next = prev === 'dark' ? 'light' : 'dark';
      try {
        localStorage.setItem('ar_dir_theme', next);
      } catch {
        // Ignore
      }
      return next;
    });
  };

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    try {
      localStorage.setItem('ar_dir_theme', newTheme);
    } catch {
      // Ignore
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
