import { useMemo, useState } from 'react';
import { useProgress } from '../lib/progress';
import { CTF_TASKS } from '../data/ctf';

export default function CTF() {
  const { state, markCTFSolved } = useProgress();
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [feedback, setFeedback] = useState<Record<string, 'correct' | 'wrong' | ''>>({});
  const [hintIndices, setHintIndices] = useState<Record<string, number>>({});

  const tasks = useMemo(() => CTF_TASKS, []);

  const submit = (id: string, expected: string) => {
    const val = (answers[id] || '').trim();
    const ok = val === expected;
    setFeedback((f) => ({ ...f, [id]: ok ? 'correct' : 'wrong' }));
    if (ok) markCTFSolved(id);
  };

  const showNextHint = (id: string, totalHints: number) => {
    setHintIndices((prev) => {
      const current = prev[id] || 0;
      if (current < totalHints) {
        return { ...prev, [id]: current + 1 };
      }
      return prev;
    });
  };

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-cyan-300">CTF Challenges</h1>
      <p className="text-slate-400">Practice Web, Cryptography, Forensics, Reverse Engineering, and Binary Exploitation.</p>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {tasks.map((t) => {
          const solved = state.ctf.solvedIds.includes(t.id);
          const currentHintIndex = hintIndices[t.id] || 0;
          const hintsShown = currentHintIndex > 0;
          const allHintsShown = currentHintIndex >= t.hints.length;
          
          return (
            <div key={t.id} className="border border-slate-800 rounded-lg p-4 bg-white/[0.03] space-y-2">
              <div className="text-xs text-slate-400">{t.category} • {t.difficulty}</div>
              <h3 className="font-semibold text-fuchsia-300">{t.title}</h3>
              <p className="text-sm text-slate-300">{t.prompt}</p>
              
              {/* Hints Section */}
              {hintsShown && (
                <div className="space-y-1 pt-2 border-t border-slate-800">
                  <div className="text-xs font-semibold text-cyan-300">Hints:</div>
                  {t.hints.slice(0, currentHintIndex).map((hint, idx) => (
                    <div key={idx} className="text-xs text-slate-400 bg-slate-900/50 p-2 rounded">
                      <span className="text-cyan-400">Hint {idx + 1}:</span> {hint}
                    </div>
                  ))}
                </div>
              )}
              
              {/* Hint Button */}
              <button
                disabled={allHintsShown}
                onClick={() => showNextHint(t.id, t.hints.length)}
                className="w-full px-2 py-1 text-xs rounded bg-fuchsia-500/10 text-fuchsia-300 border border-fuchsia-400/30 hover:bg-fuchsia-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {allHintsShown ? 'All hints shown' : `Show Hint ${currentHintIndex + 1}`}
              </button>
              
              <div className="flex items-center gap-2">
                <input
                  disabled={solved}
                  value={answers[t.id] || ''}
                  onChange={(e) => setAnswers((a) => ({ ...a, [t.id]: e.target.value }))}
                  placeholder="CSA{...}"
                  className="flex-1 px-2 py-1 rounded bg-black/30 border border-slate-800 text-sm"
                />
                <button
                  disabled={solved}
                  onClick={() => submit(t.id, t.flag)}
                  className="px-3 py-1 text-sm rounded bg-cyan-500/10 text-cyan-300 border border-cyan-400/30"
                >Submit</button>
              </div>
              {solved && <div className="text-xs text-cyan-300">Solved ✓</div>}
              {!solved && feedback[t.id] === 'wrong' && (
                <div className="text-xs text-fuchsia-300">Not quite. Keep trying!</div>
              )}
              {!solved && feedback[t.id] === 'correct' && (
                <div className="text-xs text-cyan-300">Correct!</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
