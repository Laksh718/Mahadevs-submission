import React, { createContext, useContext, useState, useEffect } from 'react';

type Theme = 'light' | 'high-contrast';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>(() => {
    const saved = localStorage.getItem('theme') as Theme;
    return saved || 'light';
  });

  useEffect(() => {
    const root = document.documentElement;
    
    console.log('ThemeContext: Applying theme:', theme);
    
    // Remove all theme classes
    root.classList.remove('light', 'high-contrast');
    
    // Add current theme class
    root.classList.add(theme);
    
    console.log('ThemeContext: HTML classes:', root.className);
    
    // Save to localStorage
    localStorage.setItem('theme', theme);
  }, [theme]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };

  const toggleTheme = () => {
    setThemeState(current => {
      const newTheme = current === 'light' ? 'high-contrast' : 'light';
      console.log('ThemeContext: Toggling theme from', current, 'to', newTheme);
      return newTheme;
    });
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
