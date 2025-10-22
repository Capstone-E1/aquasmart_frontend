import { useEffect } from 'react';
import { useSettings } from '../contexts/SettingsContext';

const accentColorMap = {
  blue: {
    primary: '#3b82f6',
    hover: '#2563eb',
    light: '#60a5fa',
    dark: '#1d4ed8',
  },
  green: {
    primary: '#10b981',
    hover: '#059669',
    light: '#34d399',
    dark: '#047857',
  },
  purple: {
    primary: '#a855f7',
    hover: '#9333ea',
    light: '#c084fc',
    dark: '#7e22ce',
  },
};

export function useAccentColor() {
  const { settings } = useSettings();

  useEffect(() => {
    const colors = accentColorMap[settings.appearance.accentColor];
    const root = document.documentElement;

    root.style.setProperty('--accent-primary', colors.primary);
    root.style.setProperty('--accent-hover', colors.hover);
    root.style.setProperty('--accent-light', colors.light);
    root.style.setProperty('--accent-dark', colors.dark);
  }, [settings.appearance.accentColor]);

  return settings.appearance.accentColor;
}
