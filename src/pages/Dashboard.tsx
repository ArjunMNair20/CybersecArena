import { Link } from 'react-router-dom';
import { useProgress, overallPercent } from '../lib/progress';

const cards = [
  { to: '/ctf', title: 'CTF Challenges', desc: 'Web, Crypto, Forensics, Reverse, Binary' },
  { to: '/phish-hunt', title: 'Phish Hunt', desc: 'Investigate emails and links' },
  { to: '/code-and-secure', title: 'Code & Secure', desc: 'Fix vulnerable code and learn secure patterns' },
  { to: '/ai-quizbot', title: 'Cyber Quiz Lab', desc: 'Timed quiz on passwords, web attacks, crypto, and more' },
];

const tools = [
  { to: '/threat-radar', title: 'ThreatRadar', desc: 'Analyze & identify security threats in real-time' },
  { to: '/steganography', title: 'StegoStudio', desc: 'Hide & extract data inside images' },
];

export default function Dashboard() {
  const { state } = useProgress();
  const percent = overallPercent(state);
  return (
    <div className="space-y-8 w-full">
      {/* Header Section */}
      <div className="space-y-3 pb-4 border-b border-slate-700/50">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-wide">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600">Cybersec Arena</span>
          </h1>
          <p className="text-slate-300 text-sm font-medium">Master cybersecurity through interactive challenges</p>
        </div>
      </div>

      {/* Progress Card */}
      <div className="modern-card p-6 border-2 border-purple-500/20 bg-gradient-to-br from-slate-900/60 to-slate-800/40">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="font-bold text-purple-300 text-lg mb-0.5">Your Progress</h2>
              <p className="text-xs text-slate-400">Overall Completion</p>
            </div>
            <span className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-fuchsia-500">{percent}%</span>
          </div>
          <div className="h-3 bg-slate-700/50 rounded-full overflow-hidden shadow-inner">
            <div className="h-full bg-gradient-to-r from-purple-400 via-fuchsia-500 to-violet-500 rounded-full progress-smooth transition-all duration-500" style={{ width: `${percent}%` }} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700/50">
              <p className="text-xs text-slate-400 mb-1">Badges Earned</p>
              <p className="text-xl font-bold text-fuchsia-300">{state.badges.length}</p>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700/50">
              <p className="text-xs text-slate-400 mb-1">Current Rank</p>
              <p className="text-xl font-bold text-purple-400">Rookie</p>
            </div>
          </div>
          {state.badges.length > 0 && (
            <div className="pt-2 mt-2 border-t border-slate-700/30">
              <p className="text-xs text-slate-400 font-medium mb-2">Badges Unlocked</p>
              <div className="flex flex-wrap gap-2">
                {state.badges.map((b) => (
                  <span key={b} className="px-3 py-1.5 text-xs rounded-full border border-purple-400/40 text-purple-300 bg-purple-500/10 font-medium hover:bg-purple-500/20 transition-colors">{b}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Challenges Grid */}
      <section className="space-y-3">
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-white">Choose Your Challenge</h2>
          <p className="text-xs text-slate-400">Pick a challenge to start your cybersecurity journey</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-2 gap-4">
          {cards.map((c, idx) => (
            <Link
              key={c.to}
              to={c.to}
              className="group modern-card p-5 hover:scale-105 transform transition-all duration-300 border-2 border-slate-700/50 hover:border-purple-500/60 overflow-hidden relative bg-gradient-to-br from-slate-800/40 to-slate-900/20"
            >
              {/* Gradient background animation */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ background: `linear-gradient(135deg, rgba(167,139,250,0.06), rgba(236,72,153,0.06))` }} />
              
              {/* Glow effect */}
              <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full opacity-0 group-hover:opacity-30 blur-3xl transition-opacity duration-300" style={{ background: 'linear-gradient(135deg, #8B5CF6, #ec4899)' }} />
              
              <div className="relative z-10">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-bold text-base text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-fuchsia-400">{c.title}</h3>
                  </div>
                  <span className="text-2xl">
                    {idx === 0 ? '🚩' : idx === 1 ? '🎣' : idx === 2 ? '🔒' : '🧠'}
                  </span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed mb-3">{c.desc}</p>
                <div className="inline-flex items-center gap-2 text-purple-400 text-sm font-medium group-hover:gap-3 transition-all interactive btn-press focus-ring" tabIndex={0} role="button" aria-label={`Start ${c.title}`}>
                  Start Challenge <span className="text-lg">→</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Tools Section */}
      <section className="space-y-3">
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-white">Explore Tools</h2>
          <p className="text-xs text-slate-400">Powerful utilities to enhance your security skills</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-2 gap-4">
          {tools.map((tool, idx) => (
            <Link
              key={tool.to}
              to={tool.to}
              className="group modern-card p-5 hover:scale-105 transform transition-all duration-300 border-2 border-slate-700/50 hover:border-violet-500/60 overflow-hidden relative bg-gradient-to-br from-slate-800/40 to-slate-900/20"
            >
              {/* Gradient background animation */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ background: `linear-gradient(135deg, rgba(139,92,246,0.06), rgba(168,85,247,0.06))` }} />
              
              {/* Glow effect */}
              <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full opacity-0 group-hover:opacity-30 blur-3xl transition-opacity duration-300" style={{ background: 'linear-gradient(135deg, #8b5cf6, #a855f7)' }} />
              
              <div className="relative z-10">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-bold text-base text-transparent bg-clip-text bg-gradient-to-r from-violet-300 to-purple-400">{tool.title}</h3>
                  </div>
                  <span className="text-2xl">
                    {idx === 0 ? '🎯' : '🔐'}
                  </span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed mb-3">{tool.desc}</p>
                <div className="inline-flex items-center gap-2 text-violet-300 text-sm font-medium group-hover:gap-3 transition-all">
                  Open Tool <span className="text-lg">→</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
