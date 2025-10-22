import { useState } from 'react';
import { 
  Palette, 
  Database, 
  Info,
  Moon,
  Sun,
  RefreshCw,
  Download,
  Save,
  RotateCcw,
  CheckCircle
} from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';
import { useTheme } from '../contexts/ThemeContext';

export function Settings() {
  const { settings, updateSettings, resetSettings } = useSettings();
  const { theme, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState<'appearance' | 'data' | 'about'>('appearance');
  const [saved, setSaved] = useState(false);

  const tabs = [
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'data', label: 'Data & Monitoring', icon: Database },
    { id: 'about', label: 'About', icon: Info },
  ] as const;

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleThemeChange = (newTheme: 'light' | 'dark') => {
    if (theme !== newTheme) {
      toggleTheme();
    }
    updateSettings({ 
      appearance: { ...settings.appearance, theme: newTheme } 
    });
  };

  return (
    <div className="space-y-4 lg:space-y-6">
      <div>
        <h1 className="text-xl lg:text-2xl font-bold text-slate-800 dark:text-white mb-2">Settings</h1>
        <p className="text-slate-600 dark:text-slate-400 text-sm lg:text-base">
          Customize your AquaSmart experience
        </p>
      </div>

      <div className="bg-white dark:bg-primary-light/50 rounded-xl border border-slate-300 dark:border-slate-600 overflow-hidden">
        <div className="flex flex-col lg:flex-row">
          <div className="lg:w-64 border-b lg:border-b-0 lg:border-r border-slate-300 dark:border-slate-600">
            <nav className="p-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                      activeTab === tab.id
                        ? 'bg-accent text-white'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/50'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="flex-1 p-6 max-h-[600px] overflow-y-auto">
            {activeTab === 'appearance' && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">Appearance Settings</h2>
                
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Theme
                  </label>
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleThemeChange('light')}
                      className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 transition-all ${
                        theme === 'light'
                          ? 'border-accent bg-accent/10 dark:bg-accent/20'
                          : 'border-slate-300 dark:border-slate-600 hover:border-accent-light'
                      }`}
                    >
                      <Sun className="w-5 h-5" />
                      <span className="font-medium">Light</span>
                    </button>
                    <button
                      onClick={() => handleThemeChange('dark')}
                      className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 transition-all ${
                        theme === 'dark'
                          ? 'border-accent bg-accent/10 dark:bg-accent/20'
                          : 'border-slate-300 dark:border-slate-600 hover:border-accent-light'
                      }`}
                    >
                      <Moon className="w-5 h-5" />
                      <span className="font-medium">Dark</span>
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Accent Color
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {(['blue', 'green', 'purple'] as const).map((color) => (
                      <button
                        key={color}
                        onClick={() => updateSettings({ 
                          appearance: { ...settings.appearance, accentColor: color } 
                        })}
                        className={`px-4 py-3 rounded-lg border-2 capitalize transition-all ${
                          settings.appearance.accentColor === color
                            ? 'border-accent bg-accent/10 dark:bg-accent/20'
                            : 'border-slate-300 dark:border-slate-600 hover:border-accent-light'
                        }`}
                      >
                        <div className={`w-6 h-6 rounded-full mx-auto mb-1 ${
                          color === 'blue' ? 'bg-blue-500' :
                          color === 'green' ? 'bg-green-500' :
                          'bg-purple-500'
                        }`}></div>
                        {color}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Chart Style
                  </label>
                  <select
                    value={settings.appearance.chartStyle}
                    onChange={(e) => updateSettings({ 
                      appearance: { ...settings.appearance, chartStyle: e.target.value as any } 
                    })}
                    className="w-full px-4 py-2 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-accent"
                  >
                    <option value="line">Line Chart</option>
                    <option value="area">Area Chart</option>
                    <option value="bar">Bar Chart</option>
                  </select>
                </div>
              </div>
            )}

            {activeTab === 'data' && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">Data & Monitoring Settings</h2>
                
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                    <RefreshCw className="w-4 h-4" />
                    Auto-refresh Interval
                  </label>
                  <select
                    value={settings.data.refreshInterval}
                    onChange={(e) => updateSettings({ 
                      data: { ...settings.data, refreshInterval: parseInt(e.target.value) } 
                    })}
                    className="w-full px-4 py-2 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-accent"
                  >
                    <option value="5000">5 seconds</option>
                    <option value="10000">10 seconds</option>
                    <option value="30000">30 seconds</option>
                    <option value="60000">1 minute</option>
                    <option value="0">Manual only</option>
                  </select>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Changes take effect immediately. Set to "Manual only" to disable auto-refresh.
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                    <Download className="w-4 h-4" />
                    Default Export Format
                  </label>
                  <select
                    value={settings.data.exportFormat}
                    onChange={(e) => updateSettings({ 
                      data: { ...settings.data, exportFormat: e.target.value as any } 
                    })}
                    className="w-full px-4 py-2 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-accent"
                  >
                    <option value="csv">CSV (Comma-separated)</option>
                    <option value="json">JSON</option>
                    <option value="excel">Excel (.xlsx)</option>
                  </select>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    This will be used as the default format when exporting data from History page.
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Default Dashboard View
                  </label>
                  <select
                    value={settings.data.defaultView}
                    onChange={(e) => updateSettings({ 
                      data: { ...settings.data, defaultView: e.target.value as any } 
                    })}
                    className="w-full px-4 py-2 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-accent"
                  >
                    <option value="dashboard">All Parameters</option>
                    <option value="ph">pH Level</option>
                    <option value="tds">TDS</option>
                    <option value="turbidity">Turbidity</option>
                  </select>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    This page will be shown when you first open the application.
                  </p>
                </div>
              </div>
            )}

            {activeTab === 'about' && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">About AquaSmart</h2>
                
                <div className="text-center py-8">
                  <div className="w-24 h-24 bg-accent rounded-full mx-auto mb-4 flex items-center justify-center">
                    <span className="text-4xl text-white font-bold">AS</span>
                  </div>
                  <h3 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">AquaSmart</h3>
                  <p className="text-slate-600 dark:text-slate-400 mb-4">Water Quality Monitoring System</p>
                  <div className="inline-block px-3 py-1 bg-accent/20 text-accent-dark dark:text-accent-light rounded-full text-sm font-medium">
                    Version 1.0.0
                  </div>
                </div>

                <div className="space-y-4 p-4 bg-slate-50 dark:bg-slate-700/30 rounded-lg">
                  <div>
                    <h4 className="font-semibold text-slate-800 dark:text-white mb-2">Capstone Project E-01</h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Smart Water Filtration and Quality Monitoring System
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-slate-800 dark:text-white mb-2">Team Members</h4>
                    <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
                      <li>• Frontend Development</li>
                      <li>• Backend Development</li>
                      <li>• Hardware Integration</li>
                      <li>• System Design</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold text-slate-800 dark:text-white mb-2">Technologies</h4>
                    <div className="flex flex-wrap gap-2">
                      {['React', 'TypeScript', 'Tailwind CSS', 'Go', 'PostgreSQL', 'Arduino'].map((tech) => (
                        <span key={tech} className="px-2 py-1 bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-300 rounded text-xs">
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-300 dark:border-slate-600">
                    <p className="text-xs text-slate-500 dark:text-slate-400 text-center">
                      © 2025 AquaSmart. All rights reserved.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-center gap-3 p-4 bg-white dark:bg-primary-light/50 rounded-xl border border-slate-300 dark:border-slate-600">
        <button
          onClick={resetSettings}
          className="w-full sm:w-auto px-4 py-2 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors flex items-center justify-center gap-2"
        >
          <RotateCcw className="w-4 h-4" />
          Reset to Defaults
        </button>
        
        <button
          onClick={handleSave}
          className="w-full sm:w-auto px-6 py-2 bg-accent hover:bg-accent-hover text-white rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          {saved ? (
            <>
              <CheckCircle className="w-4 h-4" />
              Saved!
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              Save Changes
            </>
          )}
        </button>
      </div>
    </div>
  );
}
