import { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { themes } from '../constants/theme';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [themeName, setThemeName] = useState('dark');
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const saved = await AsyncStorage.getItem('theme');
        if (saved === 'light' || saved === 'dark') {
          setThemeName(saved);
        }
      } catch (e) {
        console.warn('Failed to load theme:', e);
      } finally {
        setIsReady(true);
      }
    })();
  }, []);

  const toggleTheme = async () => {
    const newTheme = themeName === 'light' ? 'dark' : 'light';
    setThemeName(newTheme);
    try {
      await AsyncStorage.setItem('theme', newTheme);
    } catch (e) {
      console.warn('Failed to save theme:', e);
    }
  };

  const theme = themes[themeName];

  return (
    <ThemeContext.Provider
      value={{
        theme,
        themeName,
        isDark: themeName === 'dark',
        toggleTheme,
        isReady,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme must be used inside ThemeProvider');
  }
  return ctx;
}