import { useEffect, useMemo, useState } from 'react';
import { Difficulty, useProgress } from '../lib/progress';
import { QUIZ_QUESTIONS } from '../data/quiz';

export default function AICyberQuizBot() {
  const { state, recordQuiz, setQuizDifficulty } = useProgress();
  const [selected, setSelected] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [qid, setQid] = useState<string>('');

  const pools = useMemo<Record<Difficulty, typeof QUIZ_QUESTIONS>>(
    () => ({
      easy: QUIZ_QUESTIONS.filter((q) => q.difficulty === 'easy'),
      medium: QUIZ_QUESTIONS.filter((q) => q.difficulty === 'medium'),
      hard: QUIZ_QUESTIONS.filter((q) => q.difficulty === 'hard'),
    }),
    []
  );

  const pool = pools[state.quiz.difficulty];

  const pickRandomQuestionId = (questions: typeof QUIZ_QUESTIONS): string | null => {
    if (!questions.length) return null;
    const idx = Math.floor(Math.random() * questions.length);
    return questions[idx]?.id ?? null;
  };

  useEffect(() => {
    // pick a question when entering or on difficulty change
    const nextId = pickRandomQuestionId(pool);
    if (nextId) setQid(nextId);
    setSelected(null);
    setSubmitted(false);
  }, [pool]);

  const q = useMemo(() => QUIZ_QUESTIONS.find((x) => x.id === qid), [qid]);

  const difficultyOptions: { value: Difficulty; label: string; tagline: string; highlight: string }[] = [
    { value: 'easy', label: 'Beginner', tagline: 'Fundamentals & best practices', highlight: 'from-emerald-500/10 border-emerald-400/30 text-emerald-300' },
    { value: 'medium', label: 'Intermediate', tagline: 'Defensive tactics & secure design', highlight: 'from-cyan-500/10 border-cyan-400/30 text-cyan-300' },
    { value: 'hard', label: 'Expert', tagline: 'Advanced attacks & cryptography', highlight: 'from-fuchsia-500/10 border-fuchsia-400/30 text-fuchsia-300' },
  ];

  const changeDifficulty = (difficulty: Difficulty) => {
    if (difficulty === state.quiz.difficulty) return;
    setQuizDifficulty(difficulty);
  };

  const submit = () => {
    if (!q || selected == null) return;
    const correct = selected === q.answer;
    recordQuiz(correct);
    setSubmitted(true);
  };

  const next = () => {
    const nextId = pickRandomQuestionId(pool);
    if (!nextId) return;
    setQid(nextId);
    setSelected(null);
    setSubmitted(false);
  };

  return (
    <div className="space-y-3">
      <h1 className="text-xl font-bold text-cyan-300">AI Cyber QuizBot</h1>
      <p className="text-slate-400">Pick a track, answer curated questions, and review instant explanations.</p>

      <div className="space-y-2">
        <h2 className="text-sm uppercase tracking-wide text-slate-500">Choose Difficulty</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {difficultyOptions.map((option) => {
            const isActive = option.value === state.quiz.difficulty;
            return (
              <button
                key={option.value}
                onClick={() => changeDifficulty(option.value)}
                className={`text-left rounded-lg border bg-gradient-to-br p-4 transition hover:scale-[1.01] ${
                  isActive ? option.highlight : 'from-white/0 border-slate-800 text-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="text-lg font-semibold">{option.label}</div>
                  <span className="text-xs uppercase tracking-wide text-slate-400">{
                    pools[option.value].length
                  } Qs</span>
                </div>
                <p className="mt-1 text-sm text-slate-400">{option.tagline}</p>
                <ul className="mt-3 text-xs text-slate-500">
                  <li>• Scenario-driven questions</li>
                  <li>• Instant feedback</li>
                  <li>• Switch anytime</li>
                </ul>
                {isActive && <div className="mt-3 text-xs text-slate-300">Currently Active</div>}
              </button>
            );
          })}
        </div>
      </div>

      <div className="border border-slate-800 rounded-lg p-4 bg-white/[0.03] space-y-2">
        <div className="text-xs text-slate-400">
          Difficulty: <span className="text-cyan-300 capitalize">{state.quiz.difficulty}</span> • Correct: {state.quiz.correct}/{state.quiz.answered}
        </div>
        {q ? (
          <>
            <div className="font-semibold text-fuchsia-300">{q.prompt}</div>
            <div className="grid sm:grid-cols-2 gap-2">
              {q.choices.map((c, idx) => (
                <label key={idx} className={`flex items-center gap-2 p-2 rounded border ${selected === idx ? 'border-cyan-400/40 bg-cyan-500/10' : 'border-slate-800 bg-black/30'}`}>
                  <input type="radio" name="quiz" checked={selected === idx} onChange={() => setSelected(idx)} />
                  <span className="text-sm">{c}</span>
                </label>
              ))}
            </div>
            <div className="flex gap-2">
              <button onClick={submit} disabled={submitted || selected == null} className="px-3 py-1 text-sm rounded bg-cyan-500/10 text-cyan-300 border border-cyan-400/30">Submit</button>
              <button onClick={next} className="px-3 py-1 text-sm rounded bg-fuchsia-500/10 text-fuchsia-300 border border-fuchsia-400/30">Next</button>
            </div>
            {submitted && (
              <div className="text-xs text-slate-400">Explanation: {q.explain}</div>
            )}
          </>
        ) : (
          <div className="text-sm text-slate-400">No questions found for this difficulty.</div>
        )}
      </div>
    </div>
  );
}
