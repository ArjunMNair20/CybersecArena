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
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [weeklyInitialized, setWeeklyInitialized] = useState<boolean>(false);

  // Wrap entire component logic in error handler
  const handleError = (err: any, context: string) => {
    console.error(`[WeeklyChallenge] Error in ${context}:`, err);
    const message = err instanceof Error ? err.message : String(err);
    setError(`Error: ${message}`);
  };

  // Calculate week number based on user's signup date
  let currentWeek: number;
  let weekInfo: any;
  let challenges: WeeklyChallenge[];

  try {
    currentWeek = user && user.createdAt ? getUserWeekNumber(user.createdAt) : getCurrentWeekNumber();
    weekInfo = user && user.createdAt ? getWeekInfo(user.createdAt) : getWeekInfo(currentWeek);
    challenges = user && user.createdAt ? getCurrentWeeklyChallenges(user.createdAt) : getCurrentWeeklyChallenges();
  } catch (err) {
    console.error('[WeeklyChallenge] Error calculating week/challenges:', err);
    currentWeek = 1;
    weekInfo = { startDate: new Date(), endDate: new Date() };
    challenges = [];
  }

  // Initialize weekly state - only run once when component mounts
  useEffect(() => {
    try {
      console.log('[WeeklyChallenge] Component mounted, setting challenges');
      console.log('[WeeklyChallenge] Current state.weekly:', state?.weekly);
      console.log('[WeeklyChallenge] solvedIds from state:', state?.weekly?.solvedIds);
      setWeeklyChallenges(challenges || []);
      setIsLoading(false);
    } catch (err) {
      console.error('[WeeklyChallenge] Error initializing challenges:', err);
      setError(String(err instanceof Error ? err.message : err));
      setIsLoading(false);
    }
  }, [challenges]);

  // Manage weekly state - ensure proper week initialization
  useEffect(() => {
    if (weeklyInitialized) return; // Only run once
    
    try {
      console.log('[WeeklyChallenge] Initializing weekly state for week:', currentWeek);
      console.log('[WeeklyChallenge] Current state.weekly:', state?.weekly);

      if (!state?.weekly) {
        console.log('[WeeklyChallenge] No weekly state found. Initializing...');
        dispatch({
          type: 'UPDATE_WEEKLY',
          payload: { weekNumber: currentWeek, solvedIds: [] },
        });
      } else if (state.weekly.solvedIds && state.weekly.solvedIds.length > 0) {
        // HAS SOLVED DATA - ALWAYS PRESERVE (never clear existing progress)
        console.log('[WeeklyChallenge] Found existing solved data, preserving:', state.weekly.solvedIds.length, 'challenges');
        
        // Update week number if needed, but preserve solvedIds
        if (state.weekly.weekNumber !== currentWeek) {
          console.log('[WeeklyChallenge] Updating week number while preserving solved challenges:', state.weekly.weekNumber, '→', currentWeek);
          dispatch({
            type: 'UPDATE_WEEKLY',
            payload: { weekNumber: currentWeek, solvedIds: state.weekly.solvedIds },
          });
        }
      } else if (state.weekly.weekNumber < currentWeek) {
        // NEW WEEK - Reset only if there's no existing solved data
        console.log('[WeeklyChallenge] New week detected! Resetting progress.', state.weekly.weekNumber, '→', currentWeek);
        dispatch({
          type: 'UPDATE_WEEKLY',
          payload: { weekNumber: currentWeek, solvedIds: [] },
        });
      } else if (state.weekly.weekNumber === currentWeek) {
        // SAME WEEK - PRESERVE PROGRESS
        console.log('[WeeklyChallenge] Same week - preserving solved count:', state.weekly.solvedIds.length);
      } else {
        // Future week on stored data (shouldn't happen, but handle it)
        console.log('[WeeklyChallenge] Stored week is ahead of current. Resetting to current week.');
        dispatch({
          type: 'UPDATE_WEEKLY',
          payload: { weekNumber: currentWeek, solvedIds: [] },
        });
      }

      setWeeklyInitialized(true);
    } catch (err) {
      console.error('[WeeklyChallenge] Error initializing weekly state:', err);
      setWeeklyInitialized(true); // Mark as initialized even on error to avoid infinite loops
    }
  }, [state?.weekly?.weekNumber, currentWeek, weeklyInitialized, dispatch]);

  const handleCTFSubmit = (challengeId: string, userAnswer: string, correctAnswer: string) => {
    try {
      console.log('[WeeklyChallenge] CTF Submit:', { challengeId });
      
      const userContent = userAnswer.replace(/^[Cc][Ss][Aa]\{|\}$/g, '').trim();
      const correctContent = correctAnswer.replace(/^[Cc][Ss][Aa]\{|\}$/g, '').trim();
      const isCorrect =
        userAnswer === correctContent ||
        userAnswer.toLowerCase() === correctContent.toLowerCase() ||
        userContent === correctContent;

      console.log('[WeeklyChallenge] Setting feedback for', challengeId, ':', { isCorrect });
      
      // Always update feedback first
      setFeedback((f) => {
        const updated = {
          ...f,
          [challengeId]: {
            isCorrect,
            message: isCorrect ? '✓ Correct! Well done!' : '✗ Incorrect. Try again or view hint.',
          },
        };
        console.log('[WeeklyChallenge] Updated feedback:', updated);
        return updated;
      });

      // Mark solved if correct (but only if not already solved)
      if (isCorrect && !state?.weekly?.solvedIds?.includes(challengeId)) {
        console.log('[WeeklyChallenge] Correct answer, marking as solved:', challengeId);
        markWeeklySolved(challengeId);
        
        // Move to next question after delay (don't sync to leaderboard to avoid white screen)
        setTimeout(() => {
          console.log('[WeeklyChallenge] Moving to next question');
          if (selectedQuestion < totalCount) {
            setSelectedQuestion(selectedQuestion + 1);
          }
        }, 1200);
      }
    } catch (error) {
      handleError(error, 'handleCTFSubmit');
    }
  };

  const handlePhishSubmit = (challengeId: string, userGuess: boolean, isPhish: boolean) => {
    try {
      console.log('[WeeklyChallenge] Phish Submit:', { challengeId });
      
      const isCorrect = userGuess === isPhish;
      setFeedback((f) => ({
        ...f,
        [challengeId]: {
          isCorrect,
          message: isCorrect ? '✓ Correct! Good eye!' : `✗ Incorrect. This ${isPhish ? 'is' : 'is not'} a phishing email.`,
        },
      }));

      if (isCorrect && !state?.weekly?.solvedIds?.includes(challengeId)) {
        console.log('[WeeklyChallenge] Marking as solved:', challengeId);
        markWeeklySolved(challengeId);
        
        setTimeout(() => {
          if (selectedQuestion < totalCount) {
            setSelectedQuestion(selectedQuestion + 1);
          }
        }, 1200);
      }
    } catch (error) {
      handleError(error, 'handlePhishSubmit');
    }
  };

  const handleCodeSubmit = (challengeId: string, userAnswer: number, correctAnswer: number) => {
    try {
      console.log('[WeeklyChallenge] Code Submit:', { challengeId });
      
      const isCorrect = userAnswer === correctAnswer;
      setFeedback((f) => ({
        ...f,
        [challengeId]: {
          isCorrect,
          message: isCorrect ? '✓ Correct! Great security knowledge!' : '✗ Incorrect. Review the explanation.',
        },
      }));

      if (isCorrect && !state?.weekly?.solvedIds?.includes(challengeId)) {
        console.log('[WeeklyChallenge] Marking as solved:', challengeId);
        markWeeklySolved(challengeId);
        
        setTimeout(() => {
          if (selectedQuestion < totalCount) {
            setSelectedQuestion(selectedQuestion + 1);
          }
        }, 1200);
      }
    } catch (error) {
      handleError(error, 'handleCodeSubmit');
    }
  };

  const handleQuizSubmit = (challengeId: string, userAnswer: number, correctAnswer: number) => {
    try {
      console.log('[WeeklyChallenge] Quiz Submit:', { challengeId });
      
      const isCorrect = userAnswer === correctAnswer;
      setFeedback((f) => ({
        ...f,
        [challengeId]: {
          isCorrect,
          message: isCorrect ? '✓ Correct! Well done!' : '✗ Incorrect. Study the explanation.',
        },
      }));

      if (isCorrect && !state?.weekly?.solvedIds?.includes(challengeId)) {
        console.log('[WeeklyChallenge] Marking as solved:', challengeId);
        markWeeklySolved(challengeId);
        
        setTimeout(() => {
          if (selectedQuestion < totalCount) {
            setSelectedQuestion(selectedQuestion + 1);
          }
        }, 1200);
      }
    } catch (error) {
      handleError(error, 'handleQuizSubmit');
    }
  };

  const solvedCount = state && state.weekly ? state.weekly.solvedIds.length : 0;
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
  console.log('[WeeklyChallenge] render:', { isLoading, error, currentWeek, weeklyChallengesCount: weeklyChallenges.length, currentChallenge: currentChallenge?.id });

  return (
    <>
      {error && (
        <div className="p-6 bg-red-500/10 border border-red-500/30 rounded-lg">
          <h2 className="text-lg font-bold text-red-400 mb-2">Error Loading Weekly Challenge</h2>
          <p className="text-red-300 text-sm">{error}</p>
          <p className="text-red-300 text-xs mt-2">Check browser console for more details</p>
        </div>
      )}

      {isLoading && !error && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-purple-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-slate-400">Loading weekly challenges...</p>
          </div>
        </div>
      )}
      
      {!isLoading && !error && weeklyChallenges.length > 0 && (
      <>
        {/* Completion splash temporarily disabled while debugging white screen */}
        {false && showCompletionSplash && (
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
            const isSolved = state && state.weekly ? state.weekly.solvedIds.includes(challenge?.id) : false;
            if (num === 1) {
              console.log('[WeeklyChallenge Nav] Challenge 1:', { id: challenge?.id, isSolved, state: state?.weekly });
            }
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
      {currentChallenge ? (
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
                  disabled={state?.weekly?.solvedIds?.includes(currentChallenge.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !state?.weekly?.solvedIds?.includes(currentChallenge.id)) {
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
                  className={`w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 ${
                    state?.weekly?.solvedIds?.includes(currentChallenge.id)
                      ? 'opacity-50 cursor-not-allowed'
                      : ''
                  }`}
                />
                <button
                  onClick={() => {
                    const answer = answers[currentChallenge.id]?.answer as string || '';
                    handleCTFSubmit(currentChallenge.id, answer, (currentChallenge.data as any).flag);
                  }}
                  disabled={state?.weekly?.solvedIds?.includes(currentChallenge.id)}
                  className={`w-full px-4 py-2 rounded font-medium transition-all ${
                    state?.weekly?.solvedIds?.includes(currentChallenge.id)
                      ? 'bg-green-600/30 text-green-300 border border-green-400/50 opacity-50 cursor-not-allowed'
                      : 'bg-purple-600/30 text-purple-300 border border-purple-400/50 hover:bg-purple-600/50'
                  }`}
                >
                  {state?.weekly?.solvedIds?.includes(currentChallenge.id) ? '✓ Completed' : 'Submit Flag'}
                </button>
              </div>
            )}

            {currentChallenge.type === 'phish' && (
              <div className="space-y-3">
                <p className="text-slate-400 text-sm">Is this email phishing?</p>
                <div className="flex gap-3">
                  <button
                    onClick={() => handlePhishSubmit(currentChallenge.id, true, (currentChallenge.data as any).isPhish)}
                    disabled={state?.weekly?.solvedIds?.includes(currentChallenge.id)}
                    className={`flex-1 px-4 py-3 rounded font-medium transition-all ${
                      state?.weekly?.solvedIds?.includes(currentChallenge.id)
                        ? 'bg-red-600/20 text-red-300 border border-red-400/50 opacity-50 cursor-not-allowed'
                        : 'bg-red-600/20 text-red-300 border border-red-400/50 hover:bg-red-600/40'
                    }`}
                  >
                    🚨 Phishing
                  </button>
                  <button
                    onClick={() => handlePhishSubmit(currentChallenge.id, false, (currentChallenge.data as any).isPhish)}
                    disabled={state?.weekly?.solvedIds?.includes(currentChallenge.id)}
                    className={`flex-1 px-4 py-3 rounded font-medium transition-all ${
                      state?.weekly?.solvedIds?.includes(currentChallenge.id)
                        ? 'bg-green-600/20 text-green-300 border border-green-400/50 opacity-50 cursor-not-allowed'
                        : 'bg-green-600/20 text-green-300 border border-green-400/50 hover:bg-green-600/40'
                    }`}
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
                      disabled={state?.weekly?.solvedIds?.includes(currentChallenge.id)}
                      className={`w-full text-left px-4 py-3 rounded transition-all ${
                        state?.weekly?.solvedIds?.includes(currentChallenge.id)
                          ? 'bg-blue-600/20 text-blue-300 border border-blue-400/50 opacity-50 cursor-not-allowed'
                          : 'bg-slate-700/50 border border-slate-600 hover:bg-blue-600/30 hover:border-blue-400/50 text-slate-300'
                      }`}
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
                      disabled={state?.weekly?.solvedIds?.includes(currentChallenge.id)}
                      className={`w-full text-left px-4 py-3 rounded transition-all ${
                        state?.weekly?.solvedIds?.includes(currentChallenge.id)
                          ? 'bg-green-600/20 text-green-300 border border-green-400/50 opacity-50 cursor-not-allowed'
                          : 'bg-slate-700/50 border border-slate-600 hover:bg-green-600/30 hover:border-green-400/50 text-slate-300'
                      }`}
                    >
                      <span className="font-semibold">{String.fromCharCode(65 + idx)}.</span> {choice}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Feedback - Show if user submitted OR if challenge is in solvedIds */}
          {(feedback[currentChallenge.id] || state?.weekly?.solvedIds?.includes(currentChallenge.id)) && (
            <div
              className={`p-4 rounded-lg border mt-4 ${
                (feedback[currentChallenge.id]?.isCorrect ?? true)
                  ? 'bg-green-500/10 border-green-400/50 text-green-300'
                  : 'bg-red-500/10 border-red-400/50 text-red-300'
              }`}
            >
              {feedback[currentChallenge.id]?.message ?? '✓ Completed! Great job!'}
            </div>
          )}

          {/* Explanation - Show if user submitted OR if challenge is in solvedIds */}
          {(feedback[currentChallenge.id] || state?.weekly?.solvedIds?.includes(currentChallenge.id)) && (
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
        </>
      )}

      {!isLoading && !error && weeklyChallenges.length === 0 && (
        <div className="p-6 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
          <h2 className="text-lg font-bold text-yellow-400 mb-2">No Challenges Available</h2>
          <p className="text-yellow-300 text-sm">Weekly challenges failed to load. Please refresh the page.</p>
        </div>
      )}
    </>
  );
}
