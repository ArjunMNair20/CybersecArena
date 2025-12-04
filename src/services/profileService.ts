import { UserProfile, defaultProfile } from '../types/profile';

const PROFILE_STORAGE_KEY = 'cybersec_arena_profile_v1';

class ProfileService {
  async getProfile(): Promise<UserProfile> {
    try {
      const stored = localStorage.getItem(PROFILE_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return { ...defaultProfile, ...parsed };
      }
      return defaultProfile;
    } catch (error) {
      console.error('Failed to load profile:', error);
      return defaultProfile;
    }
  }

  async saveProfile(profile: Partial<UserProfile>): Promise<UserProfile> {
    try {
      const current = await this.getProfile();
      const updated: UserProfile = {
        ...current,
        ...profile,
        updatedAt: new Date().toISOString(),
      };
      localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(updated));
      return updated;
    } catch (error) {
      console.error('Failed to save profile:', error);
      throw error;
    }
  }

  async updateName(name: string): Promise<UserProfile> {
    return this.saveProfile({ name });
  }

  async updateUsername(username: string): Promise<UserProfile> {
    // Validate username
    if (!username || username.length < 3) {
      throw new Error('Username must be at least 3 characters long');
    }
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      throw new Error('Username can only contain letters, numbers, and underscores');
    }
    return this.saveProfile({ username });
  }

  async updateAvatar(avatar: string): Promise<UserProfile> {
    return this.saveProfile({ avatar });
  }

  async updateBio(bio: string): Promise<UserProfile> {
    return this.saveProfile({ bio });
  }

  async deleteProfile(): Promise<void> {
    try {
      localStorage.removeItem(PROFILE_STORAGE_KEY);
    } catch (error) {
      console.error('Failed to delete profile:', error);
      throw error;
    }
  }

  // Generate avatar from username/name
  generateAvatarInitials(name: string, username: string): string {
    const displayName = name || username;
    const initials = displayName
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
    return initials || 'U';
  }

  // Generate a colored avatar based on username
  generateAvatarSVG(name: string, username: string): string {
    const initials = this.generateAvatarInitials(name, username);
    const colors = [
      '#08f7fe', '#f608f7', '#00ff88', '#ff6b00', '#ffd700',
      '#ff1493', '#00ced1', '#9370db', '#ff6347', '#20b2aa',
    ];
    const colorIndex = username.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
    const color = colors[colorIndex];

    const svg = `
      <svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
        <rect width="200" height="200" fill="${color}" opacity="0.2"/>
        <circle cx="100" cy="100" r="80" fill="${color}" opacity="0.3"/>
        <text x="100" y="100" font-family="Arial, sans-serif" font-size="72" font-weight="bold" 
              fill="${color}" text-anchor="middle" dominant-baseline="central">${initials}</text>
      </svg>
    `.trim();

    return `data:image/svg+xml;base64,${btoa(svg)}`;
  }
}

export default new ProfileService();

