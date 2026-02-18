import { memo, useMemo, useState, lazy, Suspense, useEffect } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { Trophy, Newspaper, User, Gamepad2, Brain, Code, Mail, Terminal, BookOpen, Sparkles, LogOut, Radar, Lock, Fingerprint } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useProgress, useSyncProgressToLeaderboard } from '../lib/progress';
import { useLogoutWithSync } from '../hooks/useLogoutWithSync';
import { AchievementQueue } from './AchievementNotification';

// Lazy load heavy components
const Matrix = lazy(() => import('./Matrix'));
const AICoach = lazy(() => import('./AICoach'));

type NavItem = {
  to: string;
  label: string;
  icon: JSX.Element;
};

// Grouped nav arrays so we can render visual separators between sections
const GAMES_NAV: NavItem[] = [
  { to: '/', label: 'Dashboard', icon: <Gamepad2 size={18} /> },
  { to: '/weekly-challenge', label: 'Weekly Challenge', icon: <Trophy size={18} /> },
  { to: '/ctf', label: 'CTF Challenges', icon: <Terminal size={18} /> },
  { to: '/phish-hunt', label: 'Phish Hunt', icon: <Mail size={18} /> },
  { to: '/code-and-secure', label: 'Code & Secure', icon: <Code size={18} /> },
  { to: '/ai-quizbot', label: 'Cyber Quiz Lab', icon: <Brain size={18} /> },
  
];

const TOOLS_NAV: NavItem[] = [
  { to: '/threat-radar', label: 'ThreatRadar', icon: <Radar size={18} /> },
  { to: '/steganography', label: 'StegoStudio', icon: <Lock size={18} /> },
];

const INFO_NAV: NavItem[] = [
  { to: '/news', label: 'News Feed', icon: <Newspaper size={18} /> },
  { to: '/tutorials', label: 'Tutorials', icon: <BookOpen size={18} /> },
  { to: '/leaderboard', label: 'Leaderboard', icon: <Trophy size={18} /> },
  { to: '/profile', label: 'Profile', icon: <User size={18} /> },
];

// Prefetch map: preloads route chunks on hover/focus to reduce perceived latency
const PREFETCH_MAP: Record<string, () => Promise<any>> = {
  '/': () => import('../pages/Dashboard'),
  '/weekly-challenge': () => import('../pages/WeeklyChallenge'),
  '/ctf': () => import('../pages/CTF'),
  '/phish-hunt': () => import('../pages/PhishHunt'),
  '/threat-radar': () => import('../pages/CyberHealthAnalyzer'),
  '/code-and-secure': () => import('../pages/CodeAndSecure'),
  '/ai-quizbot': () => import('../pages/AICyberQuizBotLanding'),
  '/leaderboard': () => import('../pages/Leaderboard'),
  '/steganography': () => import('../pages/Steganography'),
  '/news': () => import('../pages/NewsFeed'),
  '/profile': () => import('../pages/Profile'),
  '/tutorials': () => import('../pages/Tutorials'),
};

function Layout() {
  const [coachOpen, setCoachOpen] = useState(false);
  const [achievementQueue, setAchievementQueue] = useState<string[]>([]);
  const { user } = useAuth();
  const { state, newBadges } = useProgress();
  const { logout: logoutWithSync } = useLogoutWithSync();
  const syncToLeaderboard = useSyncProgressToLeaderboard();
  const navigate = useNavigate();

  // Handle new badges by adding them to the queue
  useEffect(() => {
    if (newBadges && newBadges.length > 0) {
      setAchievementQueue(prev => [...prev, ...newBadges]);
    }
  }, [newBadges]);

  // Sync progress to leaderboard in real-time with aggressive debouncing
  useEffect(() => {
    if (!user) return;

    let syncTimeout: NodeJS.Timeout;
    
    const sync = () => {
      clearTimeout(syncTimeout);
      // Sync immediately on first change, then debounce at 100ms for rapid changes
      syncTimeout = setTimeout(() => {
        console.log('[Layout] Real-time sync triggered for user:', user.username);
        syncToLeaderboard(user);
      }, 100);
    };

    sync();

    return () => clearTimeout(syncTimeout);
  }, [user, state, syncToLeaderboard]);

  const NAV_GROUPS = useMemo(
    () => [
      { title: 'Games', items: GAMES_NAV },
      { title: 'Tools', items: TOOLS_NAV },
      { title: 'Info', items: INFO_NAV },
    ],
    []
  );

  const handleLogout = async () => {
    try {
      await logoutWithSync();
      // Clear any cached data
      localStorage.removeItem('cybersec_arena_profile_v1');
      // Navigate to login page
      navigate('/login', { replace: true });
    } catch (error) {
      console.error('Failed to logout:', error);
      // Even if logout fails, try to navigate to login
      navigate('/login', { replace: true });
    }
  };

  const handleAchievementClose = (badge: string) => {
    setAchievementQueue(prev => prev.filter(b => b !== badge));
  };

  return (
    <div className="min-h-screen bg-[#0a0f1a] text-white">
      {/* Sidebar */}
      <aside className="hidden md:fixed md:left-0 md:top-0 md:h-screen md:w-[280px] md:flex flex-col border-r border-[#1e2a3f] bg-gradient-to-b from-[#0a0f1a] via-[#0f1628] to-[#0a0f1a] p-6 gap-6 backdrop-blur relative overflow-y-auto">
        {/* Background glow */}
        <div className="absolute -top-40 -left-40 w-80 h-80 rounded-full opacity-20 blur-3xl pointer-events-none" style={{ background: 'linear-gradient(135deg, #06b6d4, #0284c7)' }} />
        
        <div className="relative">
          <div className="sidebar-brand flex items-center gap-3">
            <div className="brand-icon p-2.5 rounded-lg bg-gradient-to-br from-[#06b6d4] via-[#0284c7] to-[#0ea5e9] shadow-lg shadow-[#06b6d4]/60 flex-shrink-0">
              <Fingerprint className="text-white" size={24} strokeWidth={2.5} />
            </div>
            <div className="font-bold tracking-tight min-w-0">
              <div className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-500 text-lg font-bold leading-tight">Cybersec Arena</div>
              <div className="sidebar-tagline text-xs text-slate-400 font-medium mt-0.5">Learn · Compete · Secure</div>
            </div>
          </div>
        </div>

        <nav className="relative">
          {NAV_GROUPS.map((group, gi) => (
            <div key={group.title} className="flex flex-col gap-2">
              <div className="sidebar-section-title">{group.title}</div>
              {group.items.map((n) => (
                <NavLink
                  key={n.to}
                  to={n.to}
                  end={n.to === '/'}
                  onMouseEnter={() => PREFETCH_MAP[n.to]?.()}
                  onFocus={() => PREFETCH_MAP[n.to]?.()}
                  className={({ isActive }) =>
                    `navlink-custom flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                      isActive
                        ? 'bg-gradient-to-r from-[#06b6d4]/20 to-[#0284c7]/20 text-[#0284c7] border border-[#06b6d4]/50 shadow-lg shadow-[#06b6d4]/20'
                        : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'
                    }`
                  }
                >
                  <span className={`flex-shrink-0 ${'navlink-icon-muted'}`}>{n.icon}</span>
                  <span className="text-sm font-medium">{n.label}</span>
                </NavLink>
              ))}

              {gi !== NAV_GROUPS.length - 1 && (
                <div className="mx-3 my-2 h-px bg-white/5 rounded" />
              )}
            </div>
          ))}
        </nav>
      </aside>

      {/* Main */}
      <main className="relative md:ml-[280px]">
        <header className="md:hidden flex items-center justify-between px-4 py-3 border-b border-[#1e2a3f] bg-gradient-to-r from-[#0a0f1a]/80 to-[#0f1628]/80 backdrop-blur">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-gradient-to-br from-[#06b6d4] via-[#0284c7] to-[#0ea5e9] shadow-sm">
              <Fingerprint className="text-white" size={20} strokeWidth={2.5} />
            </div>
            <div className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-500 text-sm">
              Cybersec Arena
            </div>
          </div>
          <div className="flex items-center gap-2">
            {user && (
              <div className="flex items-center gap-2 px-3 py-1.5 text-xs rounded bg-slate-800/60 border border-slate-700/50">
                <User size={14} className="text-cyan-400" />
                <span className="text-slate-300 truncate max-w-[80px]">{user.name || user.username}</span>
              </div>
            )}
            <button onClick={() => setCoachOpen(true)} className="px-3 py-1.5 text-xs rounded bg-fuchsia-500/10 text-fuchsia-300 border border-fuchsia-400/30 flex items-center gap-1 hover:bg-fuchsia-500/20 transition-colors">
              <Sparkles size={14} /> Coach
            </button>
          </div>
        </header>
        <div className="relative p-6">
          <Suspense fallback={null}>
            <Matrix />
          </Suspense>
          <div className="absolute inset-0 -z-10 opacity-[0.08]" style={{ background: 'radial-gradient(circle at 20% 10%, #08f7fe 0%, transparent 25%), radial-gradient(circle at 80% 30%, #f608f7 0%, transparent 25%)' }} />
          <Outlet />
        </div>
        {coachOpen && (
          <Suspense fallback={null}>
            <AICoach onClose={() => setCoachOpen(false)} />
          </Suspense>
        )}
        
        {/* Achievement Notifications Queue */}
        <AchievementQueue 
          achievements={achievementQueue}
          onAchievementClose={handleAchievementClose}
        />
      </main>
    </div>
  );
}

export default memo(Layout);
