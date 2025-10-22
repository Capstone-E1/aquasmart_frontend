import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

export interface NotificationSettings {
  soundEnabled: boolean;
  phThreshold: { min: number; max: number };
  tdsThreshold: { min: number; max: number };
  turbidityThreshold: number;
}

export interface DataSettings {
  refreshInterval: number; // in milliseconds
  exportFormat: 'csv' | 'json' | 'excel';
  defaultView: 'dashboard' | 'ph' | 'tds' | 'turbidity';
}

export interface AppearanceSettings {
  theme: 'dark' | 'light';
  accentColor: 'blue' | 'green' | 'purple';
  chartStyle: 'line' | 'area' | 'bar';
}

export interface AppSettings {
  appearance: AppearanceSettings;
  notifications: NotificationSettings;
  data: DataSettings;
}

const defaultSettings: AppSettings = {
  appearance: {
    theme: 'dark',
    accentColor: 'blue',
    chartStyle: 'line',
  },
  notifications: {
    soundEnabled: true,
    phThreshold: { min: 6.5, max: 8.5 },
    tdsThreshold: { min: 0, max: 500 },
    turbidityThreshold: 5,
  },
  data: {
    refreshInterval: 10000, // 10 seconds
    exportFormat: 'csv',
    defaultView: 'dashboard',
  },
};

interface SettingsContextType {
  settings: AppSettings;
  updateSettings: (updates: Partial<AppSettings>) => void;
  resetSettings: () => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem('aquasmart-settings');
    return saved ? { ...defaultSettings, ...JSON.parse(saved) } : defaultSettings;
  });

  useEffect(() => {
    localStorage.setItem('aquasmart-settings', JSON.stringify(settings));
  }, [settings]);

  const updateSettings = (updates: Partial<AppSettings>) => {
    setSettings((prev) => ({
      ...prev,
      ...updates,
      appearance: { ...prev.appearance, ...updates.appearance },
      notifications: { ...prev.notifications, ...updates.notifications },
      data: { ...prev.data, ...updates.data },
    }));
  };

  const resetSettings = () => {
    if (confirm('Are you sure you want to reset all settings to defaults?')) {
      setSettings(defaultSettings);
      localStorage.removeItem('aquasmart-settings');
    }
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, resetSettings }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within SettingsProvider');
  }
  return context;
}
