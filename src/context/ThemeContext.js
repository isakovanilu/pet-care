import React, { createContext, useState, useEffect, useContext } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ThemeContext = createContext();

const lightTheme = {
  mode: 'light',
  colors: {
    primary: '#4A90E2',
    background: '#FFFFFF',
    surface: '#F5F5F5',
    text: '#333333',
    textSecondary: '#666666',
    textLight: '#999999',
    border: '#E0E0E0',
    card: '#FFFFFF',
    error: '#FF6B6B',
    success: '#4ECDC4',
    warning: '#FFD93D',
    icon: '#666666',
    placeholder: '#CCCCCC',
  },
};

const darkTheme = {
  mode: 'dark',
  colors: {
    primary: '#5BA3F5',
    background: '#121212',
    surface: '#1E1E1E',
    text: '#FFFFFF',
    textSecondary: '#CCCCCC',
    textLight: '#999999',
    border: '#333333',
    card: '#2C2C2C',
    error: '#FF6B6B',
    success: '#4ECDC4',
    warning: '#FFD93D',
    icon: '#CCCCCC',
    placeholder: '#666666',
  },
};

export const ThemeProvider = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [themeMode, setThemeMode] = useState('system'); // 'light', 'dark', 'system'
  const [currentTheme, setCurrentTheme] = useState(lightTheme);

  useEffect(() => {
    loadThemePreference();
  }, []);

  useEffect(() => {
    updateTheme();
  }, [themeMode, systemColorScheme]);

  const loadThemePreference = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem('themeMode');
      if (savedTheme) {
        setThemeMode(savedTheme);
      }
    } catch (error) {
      console.error('Error loading theme preference:', error);
    }
  };

  const updateTheme = () => {
    let mode = themeMode;
    if (mode === 'system') {
      mode = systemColorScheme || 'light';
    }
    const newTheme = mode === 'dark' ? darkTheme : lightTheme;
    setCurrentTheme(newTheme);
  };

  const toggleTheme = async (mode) => {
    try {
      setThemeMode(mode);
      await AsyncStorage.setItem('themeMode', mode);
    } catch (error) {
      console.error('Error saving theme preference:', error);
    }
  };

  return (
    <ThemeContext.Provider value={{ theme: currentTheme, themeMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};

