import { useState, useEffect } from 'react';
import { getCurrentWeeklyChallenges, getWeekInfo, getCurrentWeekNumber, getUserWeekNumber, WeeklyChallenge } from '../data/weekly';
import { useProgress, useSyncProgressToLeaderboard } from '../lib/progress';
import { useAuth } from '../contexts/AuthContext';
import { Trophy, Calendar, Target, CheckCircle, Zap } from 'lucide-react';
import { WeeklyCompletionSplash } from '../components/WeeklyCompletionSplash';

type WeeklyChallengeAnswer = {
  type: 'ctf' | 'phish' | 'code' | 'quiz';
  questionId: string;
  answer: string | number | boolean;
};

export default function WeeklyChallengeComponent() {
  const { state, markWeeklySolved, dispatch } = useProgress();
  const syncToLeaderboard = useSyncProgressToLeaderboard();
  const { user } = useAuth();
  const [weeklyChallenges, setWeeklyChallenges] = useState<WeeklyChallenge[]>([]);
  const [answers, setAnswers] = useState<Record<string, WeeklyChallengeAnswer>>({});
  const [feedback, setFeedback] = useState<Record<string, { isCorrect: boolean; message: string }>>({});
  const [selectedQuestion, setSelectedQuestion] = useState<number>(1);
  const [showCompletionSplash, setShowCompletionSplash] = useState<boolean>(false);

  // Calculate week number based on user's signup date
  const currentWeek = user && user.createdAt ? getUserWeekNumber(user.createdAt) : getCurrentWeekNumber();
  const weekInfo = user && user.createdAt ? getWeekInfo(user.createdAt) : getWeekInfo(currentWeek);
  const challenges = user && user.createdAt ? getCurrentWeeklyChallenges(user.createdAt) : getCurrentWeeklyChallenges();

  useEffect(() => {
    setWeeklyChallenges(challenges);
    // Initialize new weekly challenge if week changed
    if (state.weekly.weekNumber !== currentWeek) {
      dispatch({
        type: 'UPDATE_WEEKLY',
        payload: { weekNumber: currentWeek, solvedIds: [] },
      });
    }
  }, [currentWeek, state.weekly.weekNumber, challenges, dispatch]);

  const handleCTFSubmit = (challengeId: string, userAnswer: string, correctAnswer: string) => {
    const userContent = userAnswer.replace(/^[Cc][Ss][Aa]\{|\}$/g, '').trim();
    const correctContent = correctAnswer.replace(/^[Cc][Ss][Aa]\{|\}$/g, '').trim();
    const isCorrect =
      userAnswer === correctContent ||
      userAnswer.toLowerCase() === correctContent.toLowerCase() ||
      userContent === correctContent;

    setFeedback((f) => ({
      ...f,
      [challengeId]: {
        isCorrect,
        message: isCorrect ? '✓ Correct! Well done!' : '✗ Incorrect. Try again or view hint.',
      },
    }));

    if (isCorrect && !state.weekly.solvedIds.includes(challengeId)) {
      markWeeklySolved(challengeId);
      syncToLeaderboard(user || null);
      // Auto-advance to next question after a short delay
      setTimeout(() => {
        if (selectedQuestion < totalCount) {
          setSelectedQuestion(selectedQuestion + 1);
        }
      }, 1000);
    }
  };

  const handlePhishSubmit = (challengeId: string, userGuess: boolean, isPhish: boolean) => {
    const isCorrect = userGuess === isPhish;
    setFeedback((f) => ({
      ...f,
      [challengeId]: {
        isCorrect,
        message: isCorrect ? '✓ Correct! Good eye!' : `✗ Incorrect. This ${isPhish ? 'is' : 'is not'} a phishing email.`,
      },
    }));

    if (isCorrect && !state.weekly.solvedIds.includes(challengeId)) {
      markWeeklySolved(challengeId);
      syncToLeaderboard(user || null);
      // Auto-advance to next question after a short delay
      setTimeout(() => {
        if (selectedQuestion < totalCount) {
          setSelectedQuestion(selectedQuestion + 1);
        }
      }, 1000);
    }
  };

  const handleCodeSubmit = (challengeId: string, userAnswer: number, correctAnswer: number) => {
    const isCorrect = userAnswer === correctAnswer;
    setFeedback((f) => ({
      ...f,
      [challengeId]: {
        isCorrect,
        message: isCorrect ? '✓ Correct! Great security knowledge!' : '✗ Incorrect. Review the explanation.',
      },
    }));

    if (isCorrect && !state.weekly.solvedIds.includes(challengeId)) {
      markWeeklySolved(challengeId);
      syncToLeaderboard(user || null);
      // Auto-advance to next question after a short delay
      setTimeout(() => {
        if (selectedQuestion < totalCount) {
          setSelectedQuestion(selectedQuestion + 1);
        }
      }, 1000);
    }
  };

  const handleQuizSubmit = (challengeId: string, userAnswer: number, correctAnswer: number) => {
    const isCorrect = userAnswer === correctAnswer;
    setFeedback((f) => ({
      ...f,
      [challengeId]: {
        isCorrect,
        message: isCorrect ? '✓ Correct! Well done!' : '✗ Incorrect. Study the explanation.',
      },
    }));

    if (isCorrect && !state.weekly.solvedIds.includes(challengeId)) {
      markWeeklySolved(challengeId);
      syncToLeaderboard(user || null);
      // Auto-advance to next question after a short delay
      setTimeout(() => {
        if (selectedQuestion < totalCount) {
          setSelectedQuestion(selectedQuestion + 1);
        }
      }, 1000);
    }
  };

  const solvedCount = state.weekly.solvedIds.length;
  const totalCount = 20;
  const progress = Math.round((solvedCount / totalCount) * 100);
  const currentChallenge = weeklyChallenges[selectedQuestion - 1];

  // Check if all challenges are solved and show splash
  useEffect(() => {
    if (solvedCount === totalCount && totalCount > 0) {
      setShowCompletionSplash(true);
    }
  }, [solvedCount, totalCount]);

  // Calculate next week's date
  const getNextWeekDate = () => {
    const today = new Date();
    const daysUntilMonday = (1 - today.getDay() + 7) % 7 || 7;
    const nextMonday = new Date(today);
    nextMonday.setDate(today.getDate() + daysUntilMonday);
    return nextMonday.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <>
      {showCompletionSplash && (
        <WeeklyCompletionSplash
          weekNumber={currentWeek}
          nextWeekDate={getNextWeekDate()}
          onDismiss={() => setShowCompletionSplash(false)}
        />
      )}
      <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-purple-400 mb-2 flex items-center gap-2">
          <Trophy className="text-purple-400" size={32} />
          Weekly Challenge
        </h1>
        <p className="text-slate-400 mb-4">
          Complete this week's 20-question challenge spanning all security domains. Resets every Monday!
        </p>

        {/* Week Info */}
        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
            <div className="flex items-center gap-2 text-slate-400 mb-2">
              <Calendar size={18} />
              <span className="text-sm font-medium">This Week</span>
            </div>
            <div className="text-lg font-bold text-purple-400">
              Week {currentWeek}
            </div>
            <div className="text-xs text-slate-500 mt-1">
              {weekInfo.startDate.toLocaleDateString()} - {weekInfo.endDate.toLocaleDateString()}
            </div>
          </div>

          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
            <div className="flex items-center gap-2 text-slate-400 mb-2">
              <Target size={18} />
              <span className="text-sm font-medium">Questions Solved</span>
            </div>
            <div className="text-lg font-bold text-purple-400">{solvedCount} / {totalCount}</div>
            <div className="text-xs text-slate-500 mt-1">{progress}% Complete</div>
          </div>

          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
            <div className="flex items-center gap-2 text-slate-400 mb-2">
              <Zap size={18} />
              <span className="text-sm font-medium">Bonus XP Available</span>
            </div>
            <div className="text-lg font-bold text-fuchsia-300">
              {Math.max(0, (totalCount - solvedCount) * 10)}
            </div>
            <div className="text-xs text-slate-500 mt-1">Complete all for +50 XP bonus</div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden">
            <div
              className="bg-gradient-to-r from-purple-500 to-fuchsia-500 h-3 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Question Navigation */}
      <div className="bg-slate-800/30 border border-slate-700/50 rounded-lg p-4">
        <div className="text-sm font-semibold text-slate-400 mb-3">Question Navigation</div>
        <div className="grid grid-cols-4 gap-2 sm:grid-cols-5 md:grid-cols-10">
          {Array.from({ length: totalCount }, (_, i) => i + 1).map((num) => {
            const challenge = weeklyChallenges[num - 1];
            const isSolved = state.weekly.solvedIds.includes(challenge?.id);
            const typeColors: Record<string, string> = {
              ctf: 'bg-purple-600 text-purple-100',
              phish: 'bg-red-600 text-red-100',
              code: 'bg-blue-600 text-blue-100',
              quiz: 'bg-green-600 text-green-100',
            };

            return (
              <button
                key={num}
                onClick={() => setSelectedQuestion(num)}
                title={`Q${num} (${challenge?.type || '?'})`}
                className={`relative aspect-square rounded-lg font-semibold text-sm transition-all ${
                  selectedQuestion === num
                    ? `${typeColors[challenge?.type || 'ctf']} scale-110 shadow-lg`
                    : isSolved
                    ? 'bg-green-600/30 text-green-300 border border-green-400/50'
                    : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {num}
                {isSolved && <CheckCircle className="absolute -top-2 -right-2" size={14} />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Current Question Display */}
      {currentChallenge && (
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 rounded-lg p-6">
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <div>
                <span className="text-sm text-slate-400">Question {selectedQuestion} / {totalCount}</span>
                <h2 className="text-xl font-bold text-white mt-1">
                  {currentChallenge.type === 'ctf' ? (currentChallenge.data as any).title :
                   currentChallenge.type === 'phish' ? (currentChallenge.data as any).subject :
                   currentChallenge.type === 'code' ? (currentChallenge.data as any).title :
                   (currentChallenge.data as any).prompt}
                </h2>
              </div>
              <div className={`px-3 py-1 rounded text-sm font-semibold ${
                currentChallenge.type === 'ctf' ? 'bg-purple-600/30 text-purple-300' :
                currentChallenge.type === 'phish' ? 'bg-red-600/30 text-red-300' :
                currentChallenge.type === 'code' ? 'bg-blue-600/30 text-blue-300' :
                'bg-green-600/30 text-green-300'
              }`}>
                {currentChallenge.type === 'ctf' && '🚩 CTF'}
                {currentChallenge.type === 'phish' && '🎣 PhishHunt'}
                {currentChallenge.type === 'code' && '💻 Code & Secure'}
                {currentChallenge.type === 'quiz' && '📚 Quiz'}
              </div>
            </div>

            {currentChallenge.type === 'code' && (currentChallenge.data as any).snippet && (
              <div className="bg-slate-900/50 border border-slate-700 rounded p-4 mb-4 font-mono text-sm text-slate-300 overflow-x-auto">
                <pre>{(currentChallenge.data as any).snippet}</pre>
              </div>
            )}

            {currentChallenge.type === 'phish' && (currentChallenge.data as any).body && (
              <div className="bg-slate-700/20 border border-slate-700 rounded p-4 mb-4">
                <p className="text-slate-300 whitespace-pre-wrap">{(currentChallenge.data as any).body}</p>
              </div>
            )}

            {(currentChallenge.type === 'code' || currentChallenge.type === 'quiz') && (currentChallenge.data as any).question && (
              <p className="text-slate-300 mb-4">{(currentChallenge.data as any).question}</p>
            )}

            {currentChallenge.type === 'quiz' && (currentChallenge.data as any).prompt && (
              <p className="text-slate-300 mb-4">{(currentChallenge.data as any).prompt}</p>
            )}

            {currentChallenge.type === 'ctf' && (
              <p className="text-slate-300 mb-4">{(currentChallenge.data as any).prompt}</p>
            )}

            {/* Options/Answer Input */}
            {currentChallenge.type === 'ctf' && (
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Enter the flag"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      const answer = answers[currentChallenge.id]?.answer as string || '';
                      handleCTFSubmit(currentChallenge.id, answer, (currentChallenge.data as any).flag);
                    }
                  }}
                  onChange={(e) =>
                    setAnswers((a) => ({
                      ...a,
                      [currentChallenge.id]: {
                        type: 'ctf',
                        questionId: currentChallenge.id,
                        answer: e.target.value,
                      },
                    }))
                  }
                  className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                />
                <button
                  onClick={() => {
                    const answer = answers[currentChallenge.id]?.answer as string || '';
                    handleCTFSubmit(currentChallenge.id, answer, (currentChallenge.data as any).flag);
                  }}
                  className="w-full px-4 py-2 bg-purple-600/30 text-purple-300 border border-purple-400/50 rounded hover:bg-purple-600/50 font-medium transition-all"
                >
                  Submit Flag
                </button>
              </div>
            )}

            {currentChallenge.type === 'phish' && (
              <div className="space-y-3">
                <p className="text-slate-400 text-sm">Is this email phishing?</p>
                <div className="flex gap-3">
                  <button
                    onClick={() => handlePhishSubmit(currentChallenge.id, true, (currentChallenge.data as any).isPhish)}
                    className="flex-1 px-4 py-3 bg-red-600/20 text-red-300 border border-red-400/50 rounded hover:bg-red-600/40 font-medium transition-all"
                  >
                    🚨 Phishing
                  </button>
                  <button
                    onClick={() => handlePhishSubmit(currentChallenge.id, false, (currentChallenge.data as any).isPhish)}
                    className="flex-1 px-4 py-3 bg-green-600/20 text-green-300 border border-green-400/50 rounded hover:bg-green-600/40 font-medium transition-all"
                  >
                    ✅ Legitimate
                  </button>
                </div>
              </div>
            )}

            {currentChallenge.type === 'code' && (
              <div className="space-y-3">
                <p className="text-slate-400 text-sm">{(currentChallenge.data as any).question}</p>
                <div className="space-y-2">
                  {(currentChallenge.data as any).options.map((option: string, idx: number) => (
                    <button
                      key={idx}
                      onClick={() => handleCodeSubmit(currentChallenge.id, idx, (currentChallenge.data as any).answer)}
                      className="w-full text-left px-4 py-3 bg-slate-700/50 border border-slate-600 rounded hover:bg-blue-600/30 hover:border-blue-400/50 text-slate-300 transition-all"
                    >
                      <span className="font-semibold">{String.fromCharCode(65 + idx)}.</span> {option}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {currentChallenge.type === 'quiz' && (
              <div className="space-y-3">
                <p className="text-slate-400 text-sm">{(currentChallenge.data as any).prompt}</p>
                <div className="space-y-2">
                  {(currentChallenge.data as any).choices.map((choice: string, idx: number) => (
                    <button
                      key={idx}
                      onClick={() => handleQuizSubmit(currentChallenge.id, idx, (currentChallenge.data as any).answer)}
                      className="w-full text-left px-4 py-3 bg-slate-700/50 border border-slate-600 rounded hover:bg-green-600/30 hover:border-green-400/50 text-slate-300 transition-all"
                    >
                      <span className="font-semibold">{String.fromCharCode(65 + idx)}.</span> {choice}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Feedback */}
          {feedback[currentChallenge.id] && (
            <div
              className={`p-4 rounded-lg border ${
                feedback[currentChallenge.id].isCorrect
                  ? 'bg-green-500/10 border-green-400/50 text-green-300'
                  : 'bg-red-500/10 border-red-400/50 text-red-300'
              }`}
            >
              {feedback[currentChallenge.id].message}
            </div>
          )}

          {/* Explanation */}
          {feedback[currentChallenge.id] && (
            <div className="mt-4 p-4 bg-slate-800/50 border border-slate-700 rounded">
              <p className="text-slate-300 text-sm">
                {currentChallenge.type === 'code' && (currentChallenge.data as any).explanation ||
                 currentChallenge.type === 'quiz' && (currentChallenge.data as any).explain ||
                 currentChallenge.type === 'ctf' && 'Check the hint or try another format.' ||
                 currentChallenge.type === 'phish' && (currentChallenge.data as any).hint ||
                 'See the question details for more information.'}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
    </>
  );
}
