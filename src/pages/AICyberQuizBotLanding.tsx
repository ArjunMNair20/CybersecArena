import { Difficulty } from '../lib/progress';
import { useNavigate } from 'react-router-dom';

const difficultyCards: { value: Difficulty; label: string; tagline: string; highlight: string }[] = [
  {
    value: 'easy',
    label: 'Beginner',
    tagline: 'Passwords, phishing basics, safe browsing, everyday cyber hygiene.',
    highlight: 'from-emerald-500/10 border-emerald-400/30 text-emerald-300',
  },
  {
    value: 'medium',
    label: 'Intermediate',
    tagline: 'Web attacks, auth & sessions, logging, network defenses, incident basics.',
    highlight: 'from-cyan-500/10 border-cyan-400/30 text-cyan-300',
  },
  {
    value: 'hard',
    label: 'Expert',
    tagline: 'Crypto, zero trust, supply chain, tokens, side-channels, advanced defenses.',
    highlight: 'from-fuchsia-500/10 border-fuchsia-400/30 text-fuchsia-300',
  },
];

export default function AICyberQuizBotLanding() {
  const navigate = useNavigate();

  const goToLevel = (difficulty: Difficulty) => {
    navigate(`/ai-quizbot/${difficulty}`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-purple-400">Cyber Quiz Lab</h1>
        <p className="text-slate-400 mt-2">
          Test your cybersecurity knowledge with our comprehensive quiz system.
        </p>
      </div>

      {/* New Topic-Based Quiz */}
      <div className="border border-cyan-400/40 rounded-lg p-6 bg-cyan-500/5">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-semibold text-cyan-300 mb-2">✨ New: Topic-Based Quiz</h2>
            <p className="text-sm text-slate-400 mb-4">
              Dive deeper with organized topics! Select a difficulty level, choose specific topics, and complete quizzes for each topic separately.
            </p>
          </div>
        </div>
        <button
          onClick={() => navigate('/ai-quiz')}
          className="px-4 py-2 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 hover:bg-cyan-500/30 transition-colors text-sm font-medium"
        >
          Try Topic-Based Quiz →
        </button>
      </div>

      {/* Original Level-Based Quiz */}
      <div>
        <h2 className="text-lg font-semibold text-slate-300 mb-4">Quick Level Quiz (Original)</h2>
        <p className="text-sm text-slate-500 mb-4">
          Choose your level and tackle a 25-question cybersecurity quiz covering real-world security topics.
        </p>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {difficultyCards.map((option) => (
            <button
              key={option.value}
              onClick={() => goToLevel(option.value)}
              className={`text-left rounded-lg border bg-gradient-to-br p-4 transition hover:scale-[1.02] hover:border-cyan-400/60 hover:shadow-[0_0_20px_rgba(8,247,254,0.25)] ${option.highlight}`}
            >
              <div className="flex items-center justify-between">
                <div className="text-lg font-semibold">{option.label}</div>
                <span className="text-xs uppercase tracking-wide text-slate-400">
                  {option.value === 'easy' ? 'Warm-up' : option.value === 'medium' ? 'Challenge' : 'Expert Mode'}
                </span>
              </div>
              <p className="mt-1 text-sm text-slate-300">{option.tagline}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}


