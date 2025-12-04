import { AppSettings, defaultSettings } from '../types/profile';

const SETTINGS_STORAGE_KEY = 'cybersec_arena_settings_v1';

class SettingsService {
  async getSettings(): Promise<AppSettings> {
    try {
      const stored = localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return { ...defaultSettings, ...parsed };
      }
      return defaultSettings;
    } catch (error) {
      console.error('Failed to load settings:', error);
      return defaultSettings;
    }
  }

  async saveSettings(settings: Partial<AppSettings>): Promise<AppSettings> {
    try {
      const current = await this.getSettings();
      const updated: AppSettings = {
        ...current,
        ...settings,
      };
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(updated));
      
      // Apply settings immediately
      this.applySettings(updated);
      
      return updated;
    } catch (error) {
      console.error('Failed to save settings:', error);
      throw error;
    }
  }

  async updateSetting<K extends keyof AppSettings>(
    key: K,
    value: AppSettings[K]
  ): Promise<AppSettings> {
    return this.saveSettings({ [key]: value });
  }

  async resetSettings(): Promise<AppSettings> {
    try {
      localStorage.removeItem(SETTINGS_STORAGE_KEY);
      const defaultSettings = await this.getSettings();
      this.applySettings(defaultSettings);
      return defaultSettings;
    } catch (error) {
      console.error('Failed to reset settings:', error);
      throw error;
    }
  }

  private mediaQueryListener: ((e: MediaQueryListEvent) => void) | null = null;

  private applySettings(settings: AppSettings): void {
    // Apply theme - set on both html and body for maximum compatibility
    const themeValue = settings.theme;
    document.documentElement.setAttribute('data-theme', themeValue);
    document.body.setAttribute('data-theme', themeValue);
    
    // Remove old theme classes
    document.documentElement.classList.remove('theme-dark', 'theme-light', 'theme-auto');
    document.body.classList.remove('theme-dark', 'theme-light', 'theme-auto');
    
    // Add current theme class
    document.documentElement.classList.add(`theme-${themeValue}`);
    document.body.classList.add(`theme-${themeValue}`);
    
    // Apply accessibility settings
    if (settings.accessibility.highContrast) {
      document.documentElement.classList.add('high-contrast');
      document.body.classList.add('high-contrast');
    } else {
      document.documentElement.classList.remove('high-contrast');
      document.body.classList.remove('high-contrast');
    }

    if (settings.accessibility.reduceMotion) {
      document.documentElement.classList.add('reduce-motion');
      document.body.classList.add('reduce-motion');
    } else {
      document.documentElement.classList.remove('reduce-motion');
      document.body.classList.remove('reduce-motion');
    }

    document.documentElement.setAttribute('data-font-size', settings.accessibility.fontSize);
    document.body.setAttribute('data-font-size', settings.accessibility.fontSize);
    
    // Handle auto theme listener
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    // Remove old listener if exists
    if (this.mediaQueryListener) {
      mediaQuery.removeEventListener('change', this.mediaQueryListener);
      this.mediaQueryListener = null;
    }
    
    // Add new listener if auto theme is enabled
    if (themeValue === 'auto') {
      this.mediaQueryListener = () => {
        // Force re-application of settings
        this.getSettings().then((currentSettings) => {
          this.applySettings(currentSettings);
        });
      };
      mediaQuery.addEventListener('change', this.mediaQueryListener);
    }
  }

  // Initialize settings on load
  async initialize(): Promise<void> {
    const settings = await this.getSettings();
    this.applySettings(settings);
  }
}

export default new SettingsService();

