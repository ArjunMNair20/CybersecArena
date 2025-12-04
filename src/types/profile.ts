export interface UserProfile {
  id: string;
  name: string;
  username: string;
  avatar: string; // URL or base64 data URL
  email?: string;
  bio?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AppSettings {
  theme: 'dark' | 'light' | 'auto';
  soundEnabled: boolean;
  soundVolume: number;
  notificationsEnabled: boolean;
  language: string;
  autoSave: boolean;
  showHints: boolean;
  difficulty: 'easy' | 'medium' | 'hard' | 'adaptive';
  privacy: {
    showOnLeaderboard: boolean;
    shareProgress: boolean;
    allowAnalytics: boolean;
  };
  accessibility: {
    highContrast: boolean;
    reduceMotion: boolean;
    fontSize: 'small' | 'medium' | 'large';
  };
}

export const defaultProfile: UserProfile = {
  id: `user_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
  name: '',
  username: `user_${Math.random().toString(36).substring(2, 10)}`,
  avatar: '',
  bio: '',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

export const defaultSettings: AppSettings = {
  theme: 'dark',
  soundEnabled: true,
  soundVolume: 0.5,
  notificationsEnabled: true,
  language: 'en',
  autoSave: true,
  showHints: true,
  difficulty: 'adaptive',
  privacy: {
    showOnLeaderboard: true,
    shareProgress: false,
    allowAnalytics: false,
  },
  accessibility: {
    highContrast: false,
    reduceMotion: false,
    fontSize: 'medium',
  },
};

