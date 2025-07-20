import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const lightTheme = {
  mode: 'light',
  background: '#fff',
  text: '#191414',
  secondaryText: '#444',
  accent: '#1DB954',
  card: '#f2f2f2',
  border: '#e0e0e0',
  scrubberBg: '#e0e0e0',
  scrubberFill: '#1DB954',
  header: '#f9f9f9',
};

const darkTheme = {
  mode: 'dark',
  background: '#191414',
  text: '#fff',
  secondaryText: '#b3b3b3',
  accent: '#1DB954',
  card: '#222',
  border: 'rgba(255,255,255,0.1)',
  scrubberBg: '#444',
  scrubberFill: '#1DB954',
  header: '#121212',
};

const ThemeContext = createContext({
  theme: darkTheme,
  toggleTheme: () => {},
});

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(darkTheme);

  useEffect(() => {
    (async () => {
      const stored = await AsyncStorage.getItem('theme');
      if (stored === 'light') setTheme(lightTheme);
      else setTheme(darkTheme);
    })();
  }, []);

  const toggleTheme = async () => {
    const newTheme = theme.mode === 'dark' ? lightTheme : darkTheme;
    setTheme(newTheme);
    await AsyncStorage.setItem('theme', newTheme.mode);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}; 