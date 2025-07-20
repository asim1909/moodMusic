import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../ThemeContext';
import { Sun, Moon } from 'lucide-react-native';

const ThemeToggleButton = () => {
  const { theme, toggleTheme } = useTheme();
  return (
    <TouchableOpacity
      onPress={toggleTheme}
      style={[styles.button, { backgroundColor: theme.accent }]}
      accessibilityLabel="Toggle theme"
    >
      {theme.mode === 'dark' ? (
        <Sun color={theme.mode === 'dark' ? 'black' : 'white'} size={20} />
      ) : (
        <Moon color={theme.mode === 'dark' ? 'black' : 'white'} size={20} />
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
    marginRight: 0,
    elevation: 2,
  },
});

export default ThemeToggleButton; 