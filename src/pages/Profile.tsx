import { useState, useEffect } from 'react';
import { 
  User, Edit2, Save, X, Camera, Upload, Settings, 
  Bell, Volume2, VolumeX, Globe, Moon, Sun, Monitor,
  Eye, EyeOff, Shield, Lock, Unlock, Palette, 
  Type, Zap, Download, Upload as UploadIcon, RotateCcw,
  CheckCircle, AlertCircle, Info
} from 'lucide-react';
import { useProgress, defaultProgress } from '../lib/progress';
import profileService from '../services/profileService';
import settingsService from '../services/settingsService';
import { UserProfile } from '../types/profile';
import { AppSettings } from '../types/profile';

export default function Profile() {
  const { state, reset, setState } = useProgress();
  const [activeTab, setActiveTab] = useState<'profile' | 'settings'>('profile');
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [nameValue, setNameValue] = useState('');
  const [usernameValue, setUsernameValue] = useState('');
  const [bioValue, setBioValue] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>('');
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadProfile();
    loadSettings();
    settingsService.initialize();
  }, []);

  const loadProfile = async () => {
    const loaded = await profileService.getProfile();
    setProfile(loaded);
    setNameValue(loaded.name);
    setUsernameValue(loaded.username);
    setBioValue(loaded.bio || '');
    setAvatarPreview(loaded.avatar || profileService.generateAvatarSVG(loaded.name, loaded.username));
  };

  const loadSettings = async () => {
    const loaded = await settingsService.getSettings();
    setSettings(loaded);
  };

  const handleSaveName = async () => {
    if (!profile) return;
    try {
      const updated = await profileService.updateName(nameValue);
      setProfile(updated);
      setIsEditingName(false);
      showMessage('success', 'Name updated successfully');
    } catch (error) {
      showMessage('error', 'Failed to update name');
    }
  };

  const handleSaveUsername = async () => {
    if (!profile) return;
    try {
      const updated = await profileService.updateUsername(usernameValue);
      setProfile(updated);
      setIsEditingUsername(false);
      setAvatarPreview(profileService.generateAvatarSVG(updated.name, updated.username));
      showMessage('success', 'Username updated successfully');
    } catch (error: any) {
      showMessage('error', error.message || 'Failed to update username');
    }
  };

  const handleSaveBio = async () => {
    if (!profile) return;
    try {
      const updated = await profileService.updateBio(bioValue);
      setProfile(updated);
      setIsEditingBio(false);
      showMessage('success', 'Bio updated successfully');
    } catch (error) {
      showMessage('error', 'Failed to update bio');
    }
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        showMessage('error', 'Image size must be less than 2MB');
        return;
      }
      if (!file.type.startsWith('image/')) {
        showMessage('error', 'Please select an image file');
        return;
      }
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        setAvatarPreview(dataUrl);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveAvatar = async () => {
    if (!profile || !avatarPreview) return;
    try {
      const updated = await profileService.updateAvatar(avatarPreview);
      setProfile(updated);
      setAvatarFile(null);
      showMessage('success', 'Avatar updated successfully');
    } catch (error) {
      showMessage('error', 'Failed to update avatar');
    }
  };

  const handleGenerateAvatar = () => {
    if (!profile) return;
    const generated = profileService.generateAvatarSVG(profile.name, profile.username);
    setAvatarPreview(generated);
    setAvatarFile(null);
  };

  const handleSettingChange = async <K extends keyof AppSettings>(
    key: K,
    value: AppSettings[K]
  ) => {
    if (!settings) return;
    try {
      const updated = await settingsService.updateSetting(key, value);
      setSettings(updated);
      showMessage('success', 'Settings updated');
    } catch (error) {
      showMessage('error', 'Failed to update settings');
    }
  };

  const handleNestedSettingChange = async (
    category: keyof AppSettings,
    key: string,
    value: any
  ) => {
    if (!settings) return;
    try {
      const updated = {
        ...settings,
        [category]: {
          ...(settings[category] as any),
          [key]: value,
        },
      };
      const saved = await settingsService.saveSettings(updated);
      setSettings(saved);
      showMessage('success', 'Settings updated');
    } catch (error) {
      showMessage('error', 'Failed to update settings');
    }
  };

  const handleResetSettings = async () => {
    if (confirm('Are you sure you want to reset all settings to default?')) {
      try {
        const reset = await settingsService.resetSettings();
        setSettings(reset);
        showMessage('success', 'Settings reset to default');
      } catch (error) {
        showMessage('error', 'Failed to reset settings');
      }
    }
  };

  const showMessage = (type: 'success' | 'error', text: string) => {
    setSaveMessage({ type, text });
    setTimeout(() => setSaveMessage(null), 3000);
  };

  const exportData = () => {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'cybersec-arena-progress.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const importData = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result));
        setState({ ...defaultProgress, ...parsed });
        showMessage('success', 'Progress imported successfully');
      } catch {
        showMessage('error', 'Invalid progress file');
      }
    };
    reader.readAsText(file);
  };

  if (!profile || !settings) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin text-cyan-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-cyan-300 mb-2">Profile & Settings</h1>
        <p className="text-slate-400">Manage your profile information and application settings</p>
      </div>

      {/* Success/Error Message */}
      {saveMessage && (
        <div
          className={`p-4 rounded-lg border flex items-center gap-2 ${
            saveMessage.type === 'success'
              ? 'bg-green-500/10 border-green-400/30 text-green-300'
              : 'bg-red-500/10 border-red-400/30 text-red-300'
          }`}
        >
          {saveMessage.type === 'success' ? (
            <CheckCircle size={20} />
          ) : (
            <AlertCircle size={20} />
          )}
          <span>{saveMessage.text}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-800">
        <button
          onClick={() => setActiveTab('profile')}
          className={`px-4 py-2 font-medium transition-colors border-b-2 ${
            activeTab === 'profile'
              ? 'border-cyan-400 text-cyan-300'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <User size={18} className="inline mr-2" />
          Profile
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`px-4 py-2 font-medium transition-colors border-b-2 ${
            activeTab === 'settings'
              ? 'border-cyan-400 text-cyan-300'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Settings size={18} className="inline mr-2" />
          Settings
        </button>
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div className="space-y-6">
          {/* Avatar Section */}
          <div className="border border-slate-800 rounded-lg p-6 bg-gradient-to-br from-white/[0.03] to-white/[0.01]">
            <h2 className="text-xl font-semibold text-cyan-300 mb-4">Avatar</h2>
            <div className="flex flex-col md:flex-row gap-6 items-start">
              <div className="flex-shrink-0">
                <div className="w-32 h-32 rounded-full border-2 border-cyan-400/30 overflow-hidden bg-slate-800 flex items-center justify-center">
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <User className="text-slate-400" size={48} />
                  )}
                </div>
              </div>
              <div className="flex-1 space-y-3">
                <div className="flex flex-wrap gap-2">
                  <label className="px-4 py-2 rounded-lg bg-cyan-500/20 border border-cyan-400/30 text-cyan-300 hover:bg-cyan-500/30 cursor-pointer transition-colors flex items-center gap-2">
                    <Upload size={16} />
                    Upload Image
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleAvatarUpload}
                    />
                  </label>
                  <button
                    onClick={handleGenerateAvatar}
                    className="px-4 py-2 rounded-lg bg-fuchsia-500/20 border border-fuchsia-400/30 text-fuchsia-300 hover:bg-fuchsia-500/30 transition-colors flex items-center gap-2"
                  >
                    <Palette size={16} />
                    Generate Avatar
                  </button>
                  {avatarFile && (
                    <button
                      onClick={handleSaveAvatar}
                      className="px-4 py-2 rounded-lg bg-green-500/20 border border-green-400/30 text-green-300 hover:bg-green-500/30 transition-colors flex items-center gap-2"
                    >
                      <Save size={16} />
                      Save Avatar
                    </button>
                  )}
                </div>
                <p className="text-xs text-slate-500">
                  Upload an image (max 2MB) or generate an avatar with your initials
                </p>
              </div>
            </div>
          </div>

          {/* Name Section */}
          <div className="border border-slate-800 rounded-lg p-6 bg-gradient-to-br from-white/[0.03] to-white/[0.01]">
            <h2 className="text-xl font-semibold text-cyan-300 mb-4">Name</h2>
            {isEditingName ? (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={nameValue}
                  onChange={(e) => setNameValue(e.target.value)}
                  placeholder="Enter your name"
                  className="flex-1 px-4 py-2 rounded-lg bg-black/40 border border-slate-800 text-slate-200 focus:outline-none focus:border-cyan-400/50 focus:ring-1 focus:ring-cyan-400/30"
                />
                <button
                  onClick={handleSaveName}
                  className="px-4 py-2 rounded-lg bg-green-500/20 border border-green-400/30 text-green-300 hover:bg-green-500/30 transition-colors"
                >
                  <Save size={18} />
                </button>
                <button
                  onClick={() => {
                    setIsEditingName(false);
                    setNameValue(profile.name);
                  }}
                  className="px-4 py-2 rounded-lg bg-slate-700/50 border border-slate-600 text-slate-300 hover:bg-slate-700 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <p className="text-slate-300">{profile.name || 'Not set'}</p>
                <button
                  onClick={() => setIsEditingName(true)}
                  className="px-4 py-2 rounded-lg bg-cyan-500/20 border border-cyan-400/30 text-cyan-300 hover:bg-cyan-500/30 transition-colors flex items-center gap-2"
                >
                  <Edit2 size={16} />
                  Edit
                </button>
              </div>
            )}
          </div>

          {/* Username Section */}
          <div className="border border-slate-800 rounded-lg p-6 bg-gradient-to-br from-white/[0.03] to-white/[0.01]">
            <h2 className="text-xl font-semibold text-cyan-300 mb-4">Username</h2>
            {isEditingUsername ? (
              <div className="space-y-2">
                <input
                  type="text"
                  value={usernameValue}
                  onChange={(e) => setUsernameValue(e.target.value)}
                  placeholder="Enter username"
                  className="w-full px-4 py-2 rounded-lg bg-black/40 border border-slate-800 text-slate-200 focus:outline-none focus:border-cyan-400/50 focus:ring-1 focus:ring-cyan-400/30"
                />
                <p className="text-xs text-slate-500">
                  Username must be at least 3 characters and can only contain letters, numbers, and underscores
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={handleSaveUsername}
                    className="px-4 py-2 rounded-lg bg-green-500/20 border border-green-400/30 text-green-300 hover:bg-green-500/30 transition-colors"
                  >
                    <Save size={18} />
                  </button>
                  <button
                    onClick={() => {
                      setIsEditingUsername(false);
                      setUsernameValue(profile.username);
                    }}
                    className="px-4 py-2 rounded-lg bg-slate-700/50 border border-slate-600 text-slate-300 hover:bg-slate-700 transition-colors"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <p className="text-slate-300 font-mono">@{profile.username}</p>
                <button
                  onClick={() => setIsEditingUsername(true)}
                  className="px-4 py-2 rounded-lg bg-cyan-500/20 border border-cyan-400/30 text-cyan-300 hover:bg-cyan-500/30 transition-colors flex items-center gap-2"
                >
                  <Edit2 size={16} />
                  Edit
                </button>
              </div>
            )}
          </div>

          {/* Bio Section */}
          <div className="border border-slate-800 rounded-lg p-6 bg-gradient-to-br from-white/[0.03] to-white/[0.01]">
            <h2 className="text-xl font-semibold text-cyan-300 mb-4">Bio</h2>
            {isEditingBio ? (
              <div className="space-y-2">
                <textarea
                  value={bioValue}
                  onChange={(e) => setBioValue(e.target.value)}
                  placeholder="Tell us about yourself..."
                  rows={4}
                  className="w-full px-4 py-2 rounded-lg bg-black/40 border border-slate-800 text-slate-200 focus:outline-none focus:border-cyan-400/50 focus:ring-1 focus:ring-cyan-400/30 resize-none"
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleSaveBio}
                    className="px-4 py-2 rounded-lg bg-green-500/20 border border-green-400/30 text-green-300 hover:bg-green-500/30 transition-colors"
                  >
                    <Save size={18} />
                  </button>
                  <button
                    onClick={() => {
                      setIsEditingBio(false);
                      setBioValue(profile.bio || '');
                    }}
                    className="px-4 py-2 rounded-lg bg-slate-700/50 border border-slate-600 text-slate-300 hover:bg-slate-700 transition-colors"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-slate-300">{profile.bio || 'No bio set'}</p>
                <button
                  onClick={() => setIsEditingBio(true)}
                  className="px-4 py-2 rounded-lg bg-cyan-500/20 border border-cyan-400/30 text-cyan-300 hover:bg-cyan-500/30 transition-colors flex items-center gap-2"
                >
                  <Edit2 size={16} />
                  {profile.bio ? 'Edit Bio' : 'Add Bio'}
                </button>
              </div>
            )}
          </div>

          {/* Progress Management */}
          <div className="border border-slate-800 rounded-lg p-6 bg-gradient-to-br from-white/[0.03] to-white/[0.01]">
            <h2 className="text-xl font-semibold text-cyan-300 mb-4">Progress Management</h2>
            <p className="text-sm text-slate-400 mb-4">Export or import your game progress</p>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={reset}
                className="px-4 py-2 rounded-lg bg-fuchsia-500/20 border border-fuchsia-400/30 text-fuchsia-300 hover:bg-fuchsia-500/30 transition-colors flex items-center gap-2"
              >
                <RotateCcw size={16} />
                Reset Progress
              </button>
              <button
                onClick={exportData}
                className="px-4 py-2 rounded-lg bg-cyan-500/20 border border-cyan-400/30 text-cyan-300 hover:bg-cyan-500/30 transition-colors flex items-center gap-2"
              >
                <Download size={16} />
                Export Progress
              </button>
              <label className="px-4 py-2 rounded-lg bg-white/5 border border-slate-800 cursor-pointer hover:bg-white/10 transition-colors flex items-center gap-2">
                <UploadIcon size={16} />
                Import Progress
                <input
                  type="file"
                  accept="application/json"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) importData(f);
                  }}
                />
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Settings Tab */}
      {activeTab === 'settings' && (
        <div className="space-y-6">
          {/* Appearance Settings */}
          <div className="border border-slate-800 rounded-lg p-6 bg-gradient-to-br from-white/[0.03] to-white/[0.01]">
            <h2 className="text-xl font-semibold text-cyan-300 mb-4 flex items-center gap-2">
              <Palette size={20} />
              Appearance
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-slate-200 font-medium">Theme</label>
                  <p className="text-xs text-slate-500">Choose your preferred color theme</p>
                </div>
                <div className="flex gap-2">
                  {(['dark', 'light', 'auto'] as const).map((theme) => (
                    <button
                      key={theme}
                      onClick={() => handleSettingChange('theme', theme)}
                      className={`px-3 py-2 rounded-lg border transition-colors ${
                        settings.theme === theme
                          ? 'bg-cyan-500/20 border-cyan-400/30 text-cyan-300'
                          : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:bg-slate-700'
                      }`}
                    >
                      {theme === 'dark' && <Moon size={16} />}
                      {theme === 'light' && <Sun size={16} />}
                      {theme === 'auto' && <Monitor size={16} />}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Audio Settings */}
          <div className="border border-slate-800 rounded-lg p-6 bg-gradient-to-br from-white/[0.03] to-white/[0.01]">
            <h2 className="text-xl font-semibold text-cyan-300 mb-4 flex items-center gap-2">
              <Volume2 size={20} />
              Audio
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-slate-200 font-medium">Sound Effects</label>
                  <p className="text-xs text-slate-500">Enable or disable sound effects</p>
                </div>
                <button
                  onClick={() => handleSettingChange('soundEnabled', !settings.soundEnabled)}
                  className={`px-4 py-2 rounded-lg border transition-colors flex items-center gap-2 ${
                    settings.soundEnabled
                      ? 'bg-green-500/20 border-green-400/30 text-green-300'
                      : 'bg-slate-800/50 border-slate-700 text-slate-400'
                  }`}
                >
                  {settings.soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
                  {settings.soundEnabled ? 'Enabled' : 'Disabled'}
                </button>
              </div>
              {settings.soundEnabled && (
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-slate-200 font-medium">Volume</label>
                    <p className="text-xs text-slate-500">Adjust sound volume</p>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={settings.soundVolume}
                    onChange={(e) => handleSettingChange('soundVolume', parseFloat(e.target.value))}
                    className="w-32"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Notifications */}
          <div className="border border-slate-800 rounded-lg p-6 bg-gradient-to-br from-white/[0.03] to-white/[0.01]">
            <h2 className="text-xl font-semibold text-cyan-300 mb-4 flex items-center gap-2">
              <Bell size={20} />
              Notifications
            </h2>
            <div className="flex items-center justify-between">
              <div>
                <label className="text-slate-200 font-medium">Enable Notifications</label>
                <p className="text-xs text-slate-500">Receive notifications for achievements and updates</p>
              </div>
              <button
                onClick={() => handleSettingChange('notificationsEnabled', !settings.notificationsEnabled)}
                className={`px-4 py-2 rounded-lg border transition-colors flex items-center gap-2 ${
                  settings.notificationsEnabled
                    ? 'bg-green-500/20 border-green-400/30 text-green-300'
                    : 'bg-slate-800/50 border-slate-700 text-slate-400'
                }`}
              >
                {settings.notificationsEnabled ? <Bell size={16} /> : <Bell size={16} className="opacity-50" />}
                {settings.notificationsEnabled ? 'Enabled' : 'Disabled'}
              </button>
            </div>
          </div>

          {/* Gameplay Settings */}
          <div className="border border-slate-800 rounded-lg p-6 bg-gradient-to-br from-white/[0.03] to-white/[0.01]">
            <h2 className="text-xl font-semibold text-cyan-300 mb-4 flex items-center gap-2">
              <Zap size={20} />
              Gameplay
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-slate-200 font-medium">Auto Save</label>
                  <p className="text-xs text-slate-500">Automatically save your progress</p>
                </div>
                <button
                  onClick={() => handleSettingChange('autoSave', !settings.autoSave)}
                  className={`px-4 py-2 rounded-lg border transition-colors ${
                    settings.autoSave
                      ? 'bg-green-500/20 border-green-400/30 text-green-300'
                      : 'bg-slate-800/50 border-slate-700 text-slate-400'
                  }`}
                >
                  {settings.autoSave ? 'On' : 'Off'}
                </button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-slate-200 font-medium">Show Hints</label>
                  <p className="text-xs text-slate-500">Display helpful hints during challenges</p>
                </div>
                <button
                  onClick={() => handleSettingChange('showHints', !settings.showHints)}
                  className={`px-4 py-2 rounded-lg border transition-colors flex items-center gap-2 ${
                    settings.showHints
                      ? 'bg-green-500/20 border-green-400/30 text-green-300'
                      : 'bg-slate-800/50 border-slate-700 text-slate-400'
                  }`}
                >
                  {settings.showHints ? <Eye size={16} /> : <EyeOff size={16} />}
                  {settings.showHints ? 'On' : 'Off'}
                </button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-slate-200 font-medium">Difficulty</label>
                  <p className="text-xs text-slate-500">Default difficulty level</p>
                </div>
                <select
                  value={settings.difficulty}
                  onChange={(e) => handleSettingChange('difficulty', e.target.value as any)}
                  className="px-4 py-2 rounded-lg bg-black/40 border border-slate-800 text-slate-200 focus:outline-none focus:border-cyan-400/50"
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                  <option value="adaptive">Adaptive</option>
                </select>
              </div>
            </div>
          </div>

          {/* Privacy Settings */}
          <div className="border border-slate-800 rounded-lg p-6 bg-gradient-to-br from-white/[0.03] to-white/[0.01]">
            <h2 className="text-xl font-semibold text-cyan-300 mb-4 flex items-center gap-2">
              <Shield size={20} />
              Privacy
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-slate-200 font-medium">Show on Leaderboard</label>
                  <p className="text-xs text-slate-500">Display your username on the public leaderboard</p>
                </div>
                <button
                  onClick={() => handleNestedSettingChange('privacy', 'showOnLeaderboard', !settings.privacy.showOnLeaderboard)}
                  className={`px-4 py-2 rounded-lg border transition-colors ${
                    settings.privacy.showOnLeaderboard
                      ? 'bg-green-500/20 border-green-400/30 text-green-300'
                      : 'bg-slate-800/50 border-slate-700 text-slate-400'
                  }`}
                >
                  {settings.privacy.showOnLeaderboard ? <Eye size={16} /> : <EyeOff size={16} />}
                </button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-slate-200 font-medium">Share Progress</label>
                  <p className="text-xs text-slate-500">Allow sharing your progress with others</p>
                </div>
                <button
                  onClick={() => handleNestedSettingChange('privacy', 'shareProgress', !settings.privacy.shareProgress)}
                  className={`px-4 py-2 rounded-lg border transition-colors ${
                    settings.privacy.shareProgress
                      ? 'bg-green-500/20 border-green-400/30 text-green-300'
                      : 'bg-slate-800/50 border-slate-700 text-slate-400'
                  }`}
                >
                  {settings.privacy.shareProgress ? <Unlock size={16} /> : <Lock size={16} />}
                </button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-slate-200 font-medium">Analytics</label>
                  <p className="text-xs text-slate-500">Help improve the app by sharing usage data</p>
                </div>
                <button
                  onClick={() => handleNestedSettingChange('privacy', 'allowAnalytics', !settings.privacy.allowAnalytics)}
                  className={`px-4 py-2 rounded-lg border transition-colors ${
                    settings.privacy.allowAnalytics
                      ? 'bg-green-500/20 border-green-400/30 text-green-300'
                      : 'bg-slate-800/50 border-slate-700 text-slate-400'
                  }`}
                >
                  {settings.privacy.allowAnalytics ? 'On' : 'Off'}
                </button>
              </div>
            </div>
          </div>

          {/* Accessibility Settings */}
          <div className="border border-slate-800 rounded-lg p-6 bg-gradient-to-br from-white/[0.03] to-white/[0.01]">
            <h2 className="text-xl font-semibold text-cyan-300 mb-4 flex items-center gap-2">
              <Type size={20} />
              Accessibility
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-slate-200 font-medium">High Contrast</label>
                  <p className="text-xs text-slate-500">Increase contrast for better visibility</p>
                </div>
                <button
                  onClick={() => handleNestedSettingChange('accessibility', 'highContrast', !settings.accessibility.highContrast)}
                  className={`px-4 py-2 rounded-lg border transition-colors ${
                    settings.accessibility.highContrast
                      ? 'bg-green-500/20 border-green-400/30 text-green-300'
                      : 'bg-slate-800/50 border-slate-700 text-slate-400'
                  }`}
                >
                  {settings.accessibility.highContrast ? 'On' : 'Off'}
                </button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-slate-200 font-medium">Reduce Motion</label>
                  <p className="text-xs text-slate-500">Minimize animations and transitions</p>
                </div>
                <button
                  onClick={() => handleNestedSettingChange('accessibility', 'reduceMotion', !settings.accessibility.reduceMotion)}
                  className={`px-4 py-2 rounded-lg border transition-colors ${
                    settings.accessibility.reduceMotion
                      ? 'bg-green-500/20 border-green-400/30 text-green-300'
                      : 'bg-slate-800/50 border-slate-700 text-slate-400'
                  }`}
                >
                  {settings.accessibility.reduceMotion ? 'On' : 'Off'}
                </button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-slate-200 font-medium">Font Size</label>
                  <p className="text-xs text-slate-500">Adjust text size for readability</p>
                </div>
                <select
                  value={settings.accessibility.fontSize}
                  onChange={(e) => handleNestedSettingChange('accessibility', 'fontSize', e.target.value)}
                  className="px-4 py-2 rounded-lg bg-black/40 border border-slate-800 text-slate-200 focus:outline-none focus:border-cyan-400/50"
                >
                  <option value="small">Small</option>
                  <option value="medium">Medium</option>
                  <option value="large">Large</option>
                </select>
              </div>
            </div>
          </div>

          {/* Reset Settings */}
          <div className="border border-slate-800 rounded-lg p-6 bg-gradient-to-br from-white/[0.03] to-white/[0.01]">
            <h2 className="text-xl font-semibold text-red-300 mb-4">Danger Zone</h2>
            <div className="flex items-center justify-between">
              <div>
                <label className="text-slate-200 font-medium">Reset All Settings</label>
                <p className="text-xs text-slate-500">Restore all settings to their default values</p>
              </div>
              <button
                onClick={handleResetSettings}
                className="px-4 py-2 rounded-lg bg-red-500/20 border border-red-400/30 text-red-300 hover:bg-red-500/30 transition-colors flex items-center gap-2"
              >
                <RotateCcw size={16} />
                Reset Settings
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
