import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState('beige'); // Default to warm beige as requested

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('dark', 'theme-beige');
    
    if (theme === 'dark') {
      root.classList.add('dark');
    } else if (theme === 'beige') {
      root.classList.add('theme-beige');
    }
  }, [theme]);

  // Expose an array of available themes for the UI to cycle through
  const availableThemes = ['beige', 'dark'];

  const cycleTheme = () => {
    setTheme(prev => {
      const idx = availableThemes.indexOf(prev);
      return availableThemes[(idx + 1) % availableThemes.length];
    });
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, cycleTheme, availableThemes }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
