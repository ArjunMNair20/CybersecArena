import { memo, useMemo, useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { Shield, Trophy, Newspaper, User, Gamepad2, ShieldAlert, Brain, Code, Mail, Terminal, BookOpen, Sparkles, MessageSquare, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import AudioControl from './AudioControl';
import Matrix from './Matrix';
import AICoach from './AICoach';

type NavItem = {
  to: string;
  label: string;
  icon: JSX.Element;
};

const NAV_ITEMS: NavItem[] = [
  { to: '/', label: 'Dashboard', icon: <Gamepad2 size={18} /> },
  { to: '/ctf', label: 'CTF Challenges', icon: <Terminal size={18} /> },
  { to: '/phish-hunt', label: 'Phish Hunt', icon: <Mail size={18} /> },
  { to: '/code-and-secure', label: 'Code & Secure', icon: <Code size={18} /> },
  { to: '/firewall-defender', label: 'Firewall Defender', icon: <ShieldAlert size={18} /> },
  { to: '/ai-quizbot', label: 'AI Cyber QuizBot', icon: <Brain size={18} /> },
  { to: '/chatbot', label: 'AI Chatbot', icon: <MessageSquare size={18} /> },
  { to: '/leaderboard', label: 'Leaderboard', icon: <Trophy size={18} /> },
  { to: '/news', label: 'News Feed', icon: <Newspaper size={18} /> },
  { to: '/tutorials', label: 'Tutorials', icon: <BookOpen size={18} /> },
  { to: '/profile', label: 'Profile', icon: <User size={18} /> },
];

function Layout() {
  const [coachOpen, setCoachOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const navItems = useMemo(() => NAV_ITEMS, []);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to logout:', error);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0f1a] text-slate-200 grid md:grid-cols-[260px_1fr]">
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col border-r border-slate-800 p-4 gap-4 bg-black/20 backdrop-blur relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: `linear-gradient(rgba(255,255,255,.035) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.035) 1px, transparent 1px)`, backgroundSize: '40px 40px' }} />
        <div className="relative flex items-center gap-2">
          <Shield className="text-cyan-400 drop-shadow-[0_0_8px_#08f7fe]" />
          <div className="font-extrabold tracking-wide">
            <span className="text-cyan-400">CyberSec</span> <span className="text-fuchsia-400">Arena</span>
          </div>
        </div>
        <nav className="relative flex flex-col gap-1">
          {navItems.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${
                  isActive
                    ? 'bg-cyan-500/10 text-cyan-300 border border-cyan-400/30'
                    : 'hover:bg-white/5 border border-transparent'
                }`
              }
            >
              <span className="opacity-90">{n.icon}</span>
              <span className="text-sm">{n.label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="relative mt-auto space-y-3">
          {/* User Info */}
          {user && (
            <div className="p-3 rounded-lg bg-slate-800/30 border border-slate-700/50">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-full bg-cyan-500/20 border border-cyan-400/30 flex items-center justify-center">
                  <User size={16} className="text-cyan-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-200 truncate">{user.name || user.username}</p>
                  <p className="text-xs text-slate-400 truncate">@{user.username}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="w-full px-3 py-2 rounded-lg bg-red-500/10 border border-red-400/30 text-red-300 hover:bg-red-500/20 transition-colors flex items-center justify-center gap-2 text-sm"
              >
                <LogOut size={14} />
                Logout
              </button>
            </div>
          )}
          <AudioControl />
        </div>
      </aside>

      {/* Main */}
      <main className="relative">
        <header className="md:hidden flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-black/30 backdrop-blur">
          <div className="flex items-center gap-2">
            <Shield className="text-cyan-400" />
            <div className="font-bold">
              <span className="text-cyan-400">CyberSec</span> <span className="text-fuchsia-400">Arena</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {user && (
              <div className="flex items-center gap-2 px-2 py-1 text-xs rounded bg-slate-800/50 border border-slate-700">
                <User size={14} className="text-cyan-400" />
                <span className="text-slate-300 truncate max-w-[100px]">{user.name || user.username}</span>
              </div>
            )}
            <button onClick={() => setCoachOpen(true)} className="px-2 py-1 text-xs rounded bg-fuchsia-500/10 text-fuchsia-300 border border-fuchsia-400/30 flex items-center gap-1">
              <Sparkles size={14} /> Coach
            </button>
            <AudioControl />
          </div>
        </header>
        <div className="relative p-6">
          <Matrix />
          <div className="absolute inset-0 -z-10 opacity-[0.08]" style={{ background: 'radial-gradient(circle at 20% 10%, #08f7fe 0%, transparent 25%), radial-gradient(circle at 80% 30%, #f608f7 0%, transparent 25%)' }} />
          <Outlet />
        </div>
        {coachOpen && <AICoach onClose={() => setCoachOpen(false)} />}
      </main>
    </div>
  );
}

export default memo(Layout);
