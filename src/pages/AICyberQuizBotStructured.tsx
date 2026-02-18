import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProgress, useSyncProgressToLeaderboard } from '../lib/progress';
import { useAuth } from '../contexts/AuthContext';
import { STRUCTURED_QUIZZES, QuizLevel, QuizTopic, QuizQuestion } from '../data/quiz-structured';
import { ChevronRight, CheckCircle2, RotateCcw } from 'lucide-react';

type ViewState = 'level-select' | 'topics' | 'questions' | 'results';

function shuffleQuestions<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function getMotivationMessage(scorePct: number): string {
  if (scorePct === 100) return 'Perfect score! You are a cyber defender legend. Keep pushing the limits.';
  if (scorePct >= 80) return 'Awesome work! You have strong fundamentals—keep sharpening those skills.';
  if (scorePct >= 60) return 'Nice job! You are on the right track. Review the explanations to level up even more.';
  if (scorePct >= 40) return 'Good effort! Focus on the questions you missed and try another run.';
  return 'Every pro starts somewhere. Study the explanations and try again—you\'re building real skills.';
}

export default function AICyberQuizBotStructured() {
  const { recordQuiz } = useProgress();
  const syncToLeaderboard = useSyncProgressToLeaderboard();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [viewState, setViewState] = useState<ViewState>('level-select');
  const [selectedLevel, setSelectedLevel] = useState<QuizLevel | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<QuizTopic | null>(null);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [checked, setChecked] = useState<boolean[]>([]);
  const [hasSubmittedTopic, setHasSubmittedTopic] = useState(false);
  const [topicResults, setTopicResults] = useState<Map<string, { score: number; total: number }>>(new Map());

  const topicQuestions = useMemo(() => {
    if (!selectedTopic) return [];
    return shuffleQuestions(selectedTopic.questions);
  }, [selectedTopic]);

  const currentQuestion = topicQuestions[currentQuestionIdx];
  const selected = answers[currentQuestionIdx];
  const isChecked = checked[currentQuestionIdx];
  const answeredCount = answers.filter(a => a !== null).length;
  const canSubmitTopic = answeredCount === topicQuestions.length && !hasSubmittedTopic;

  const handleSelectLevel = (level: QuizLevel) => {
    setSelectedLevel(level);
    setViewState('topics');
  };

  const handleSelectTopic = (topic: QuizTopic) => {
    setSelectedTopic(topic);
    setCurrentQuestionIdx(0);
    setAnswers(Array(topic.questions.length).fill(null));
    setChecked(Array(topic.questions.length).fill(false));
    setHasSubmittedTopic(false);
    setViewState('questions');
  };

  const handleSelect = (idx: number) => {
    if (hasSubmittedTopic) return;
    setAnswers(prev => {
      const next = [...prev];
      next[currentQuestionIdx] = idx;
      return next;
    });
  };

  const handleCheck = () => {
    if (selected == null) return;
    setChecked(prev => {
      const next = [...prev];
      next[currentQuestionIdx] = true;
      return next;
    });
  };

  const handlePrev = () => {
    if (currentQuestionIdx > 0) {
      setCurrentQuestionIdx(currentQuestionIdx - 1);
    }
  };

  const handleNext = () => {
    if (currentQuestionIdx < topicQuestions.length - 1) {
      setCurrentQuestionIdx(currentQuestionIdx + 1);
    }
  };

  const handleSubmitTopic = () => {
    if (!canSubmitTopic || !selectedTopic) return;

    let correctCount = 0;
    topicQuestions.forEach((q, i) => {
      const isCorrect = answers[i] === q.answer;
      if (isCorrect) correctCount += 1;
      recordQuiz(isCorrect);
    });

    try {
      syncToLeaderboard(user || null);
    } catch (_) {}

    const topicKey = selectedTopic.name;
    const newResults = new Map(topicResults);
    newResults.set(topicKey, { score: correctCount, total: topicQuestions.length });
    setTopicResults(newResults);

    setHasSubmittedTopic(true);
    setViewState('results');
  };

  const handleRetakeTopic = () => {
    if (!selectedTopic) return;
    setCurrentQuestionIdx(0);
    setAnswers(Array(selectedTopic.questions.length).fill(null));
    setChecked(Array(selectedTopic.questions.length).fill(false));
    setHasSubmittedTopic(false);
    setViewState('questions');
  };

  const handleBackToTopics = () => {
    setSelectedTopic(null);
    setViewState('topics');
  };

  const handleBackToLevels = () => {
    setSelectedLevel(null);
    setSelectedTopic(null);
    setTopicResults(new Map());
    setViewState('level-select');
  };

  if (viewState === 'level-select') {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/ai-quizbot')}
            className="text-slate-400 hover:text-cyan-300 transition-colors"
            title="Back to Quiz Landing"
          >
            <ChevronRight size={20} className="rotate-180" />
          </button>
        </div>

        <h1 className="text-3xl font-bold text-purple-400">Cyber Quiz Lab</h1>
        <p className="text-slate-400">
          Select a difficulty level to explore cybersecurity topics and test your knowledge. Each topic contains focused questions you can submit separately.
        </p>

        <div className="grid md:grid-cols-3 gap-4">
          {STRUCTURED_QUIZZES.map(level => (
            <button
              key={level.level}
              onClick={() => handleSelectLevel(level)}
              className="text-left border border-slate-800 rounded-lg p-6 hover:border-purple-400/50 hover:bg-white/[0.05] transition-all"
            >
              <h2 className="text-xl font-semibold text-purple-400 mb-2">
                {level.level === 'beginner' ? '🌱' : level.level === 'intermediate' ? '🎯' : '⭐'} {level.title}
              </h2>
              <p className="text-sm text-slate-400 mb-4">{level.description}</p>
              <div className="flex items-center justify-between text-sm">
                <span className="text-cyan-300">{level.topics.length} topics</span>
                <ChevronRight size={16} className="text-purple-400" />
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (viewState === 'topics' && selectedLevel) {
    const completedTopics = selectedLevel.topics.filter(t => topicResults.has(t.name));
    
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <button
            onClick={handleBackToLevels}
            className="text-sm text-purple-400 hover:text-purple-300"
          >
            ← Back to Levels
          </button>
        </div>

        <div>
          <h1 className="text-3xl font-bold text-purple-400 mb-2">{selectedLevel.title}</h1>
          <p className="text-slate-400">{selectedLevel.description}</p>
          {completedTopics.length > 0 && (
            <p className="text-sm text-emerald-400 mt-2">
              ✓ {completedTopics.length}/{selectedLevel.topics.length} topics completed
            </p>
          )}
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {selectedLevel.topics.map(topic => {
            const result = topicResults.get(topic.name);
            const percentage = result ? Math.round((result.score / result.total) * 100) : null;
            
            return (
              <button
                key={topic.name}
                onClick={() => handleSelectTopic(topic)}
                className={`text-left border rounded-lg p-5 transition-all ${
                  result
                    ? 'border-emerald-400/50 bg-emerald-500/5'
                    : 'border-slate-800 hover:border-purple-400/50 hover:bg-white/[0.05]'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="text-lg font-semibold text-purple-400 flex items-center gap-2">
                      {topic.icon} {topic.name}
                    </h3>
                    <p className="text-sm text-slate-400 mt-1">{topic.description}</p>
                  </div>
                  {result && <CheckCircle2 size={20} className="text-emerald-400 flex-shrink-0" />}
                </div>
                <div className="flex items-center justify-between text-sm mt-3">
                  <span className="text-cyan-300">{topic.questions.length} questions</span>
                  {result && (
                    <span className={percentage === 100 ? 'text-emerald-300' : 'text-cyan-300'}>
                      {percentage}%
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  if (viewState === 'questions' && selectedTopic && selectedLevel && currentQuestion) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <button
            onClick={handleBackToTopics}
            className="text-sm text-purple-400 hover:text-purple-300"
          >
            ← Back to {selectedLevel.title}
          </button>
        </div>

        <div className="border border-slate-800 rounded-lg p-6 bg-white/[0.03] space-y-4">
          <div className="flex items-center justify-between text-sm text-slate-400">
            <div className="flex items-center gap-2">
              <span>{selectedTopic.icon}</span>
              <span className="font-medium text-purple-300">{selectedTopic.name}</span>
            </div>
            <div>
              <span className="text-cyan-300">
                {currentQuestionIdx + 1}/{topicQuestions.length}
              </span>
              {' '} • Answered{' '}
              <span className="text-fuchsia-300">{answeredCount}/{topicQuestions.length}</span>
            </div>
          </div>

          <div className="font-semibold text-lg text-fuchsia-300">{currentQuestion.prompt}</div>

          <div className="grid sm:grid-cols-2 gap-2">
            {currentQuestion.choices.map((choice, idx) => {
              const isSelected = selected === idx;
              const isCorrect = currentQuestion.answer === idx;
              const showCorrect = isChecked && isCorrect;
              const showIncorrect = isChecked && isSelected && !isCorrect;

              let borderClass = 'border-slate-800';
              let bgClass = 'bg-black/30';
              if (isSelected && !isChecked) {
                borderClass = 'border-cyan-400/40';
                bgClass = 'bg-cyan-500/10';
              }
              if (showCorrect) {
                borderClass = 'border-emerald-400/60';
                bgClass = 'bg-emerald-500/10';
              } else if (showIncorrect) {
                borderClass = 'border-red-400/60';
                bgClass = 'bg-red-500/10';
              }

              return (
                <label
                  key={idx}
                  className={`flex items-center gap-2 p-3 rounded border ${borderClass} ${bgClass} cursor-pointer`}
                >
                  <input
                    type="radio"
                    name={`quiz-${currentQuestionIdx}`}
                    checked={isSelected}
                    onChange={() => handleSelect(idx)}
                    disabled={hasSubmittedTopic}
                  />
                  <span className="text-sm">{choice}</span>
                </label>
              );
            })}
          </div>

          <div className="flex flex-wrap gap-2 items-center pt-2">
            <button
              onClick={handleCheck}
              disabled={selected == null || hasSubmittedTopic}
              className="px-3 py-2 text-sm rounded bg-cyan-500/10 text-cyan-300 border border-cyan-400/30 hover:bg-cyan-500/20 disabled:opacity-50 transition-colors"
            >
              Check Answer
            </button>
            <button
              onClick={handlePrev}
              disabled={currentQuestionIdx === 0}
              className="px-3 py-2 text-sm rounded bg-slate-800/60 text-slate-200 border border-slate-600 hover:bg-slate-700 disabled:opacity-50 transition-colors"
            >
              Previous
            </button>
            <button
              onClick={handleNext}
              disabled={currentQuestionIdx === topicQuestions.length - 1}
              className="px-3 py-2 text-sm rounded bg-fuchsia-500/10 text-fuchsia-300 border border-fuchsia-400/30 hover:bg-fuchsia-500/20 disabled:opacity-50 transition-colors"
            >
              Next
            </button>
          </div>

          {isChecked && (
            <div className="text-sm text-slate-400 bg-slate-800/30 p-3 rounded">
              <span className="font-semibold text-cyan-300">Explanation: </span>
              {currentQuestion.explain}
            </div>
          )}

          <div className="border-t border-slate-800 pt-4 mt-2 flex gap-2">
            <button
              onClick={handleSubmitTopic}
              disabled={!canSubmitTopic}
              className="flex-1 px-4 py-2 text-sm rounded bg-emerald-500/15 text-emerald-300 border border-emerald-400/40 hover:bg-emerald-500/25 disabled:opacity-50 transition-colors"
            >
              {hasSubmittedTopic ? 'Submitted ✓' : `Submit Topic (${answeredCount}/${topicQuestions.length})`}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (viewState === 'results' && selectedTopic && selectedLevel) {
    const result = topicResults.get(selectedTopic.name);
    if (!result) return null;

    const percentage = Math.round((result.score / result.total) * 100);

    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <button
            onClick={handleBackToTopics}
            className="text-sm text-purple-400 hover:text-purple-300"
          >
            ← Back to Topics
          </button>
        </div>

        <div className="border border-slate-800 rounded-lg p-6 bg-white/[0.03] space-y-4">
          <div className="flex items-center gap-3">
            <div className="text-4xl">{selectedTopic.icon}</div>
            <div>
              <h2 className="text-2xl font-semibold text-purple-400">{selectedTopic.name}</h2>
              <p className="text-sm text-slate-400">Topic completed!</p>
            </div>
          </div>

          <div className="border-t border-slate-800 pt-4">
            <div className="text-center mb-4">
              <div className={`text-5xl font-bold mb-2 ${
                percentage === 100 ? 'text-emerald-400' : percentage >= 80 ? 'text-cyan-400' : percentage >= 60 ? 'text-yellow-400' : 'text-orange-400'
              }`}>
                {percentage}%
              </div>
              <div className="text-lg font-semibold text-slate-200">
                {result.score} of {result.total} correct
              </div>
            </div>

            <div className="bg-slate-800/40 p-4 rounded mt-4">
              <p className="text-sm text-slate-300">{getMotivationMessage(percentage)}</p>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleRetakeTopic}
                className="flex-1 px-4 py-2 rounded bg-fuchsia-500/15 text-fuchsia-300 border border-fuchsia-400/40 hover:bg-fuchsia-500/25 transition-colors flex items-center justify-center gap-2"
              >
                <RotateCcw size={16} />
                Try Again
              </button>
              <button
                onClick={handleBackToTopics}
                className="flex-1 px-4 py-2 rounded bg-cyan-500/15 text-cyan-300 border border-cyan-400/40 hover:bg-cyan-500/25 transition-colors flex items-center justify-center gap-2"
              >
                <ChevronRight size={16} />
                Next Topic
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
