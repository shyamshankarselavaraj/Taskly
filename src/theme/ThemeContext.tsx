import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const DARK_MODE_KEY = '@taskly_dark_mode';

export type AppTheme = {
  bg: string;
  card: string;
  cardAlt: string;
  text: string;
  subText: string;
  border: string;
  accent: string;
  accentLight: string;
  tabBar: string;
  inputBg: string;
  isDark: boolean;
};

export const lightTheme: AppTheme = {
  bg: '#eef5ff',
  card: '#ffffff',
  cardAlt: '#f8fafc',
  text: '#0f172a',
  subText: '#64748b',
  border: '#e2e8f0',
  accent: '#4338ca',
  accentLight: '#eef2ff',
  tabBar: '#ffffff',
  inputBg: '#f8fafc',
  isDark: false,
};

export const darkTheme: AppTheme = {
  bg: '#0f172a',
  card: '#1e293b',
  cardAlt: '#1e293b',
  text: '#f1f5f9',
  subText: '#94a3b8',
  border: '#334155',
  accent: '#818cf8',
  accentLight: '#1e1b4b',
  tabBar: '#1e293b',
  inputBg: '#0f172a',
  isDark: true,
};

type ThemeContextType = {
  theme: AppTheme;
  darkMode: boolean;
  setDarkMode: (value: boolean) => void;
};

const ThemeContext = createContext<ThemeContextType>({
  theme: lightTheme,
  darkMode: false,
  setDarkMode: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [darkMode, setDarkModeState] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(DARK_MODE_KEY).then(val => {
      if (val === 'true') setDarkModeState(true);
    });
  }, []);

  const setDarkMode = (value: boolean) => {
    setDarkModeState(value);
    AsyncStorage.setItem(DARK_MODE_KEY, String(value));
  };

  return (
    <ThemeContext.Provider value={{ theme: darkMode ? darkTheme : lightTheme, darkMode, setDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
