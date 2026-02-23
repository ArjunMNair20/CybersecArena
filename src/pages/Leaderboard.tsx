import { useState, useEffect, useMemo } from 'react';
import { useProgress } from '../lib/progress';
import { useAuth } from '../contexts/AuthContext';
import leaderboardService, { LeaderboardEntry } from '../services/leaderboardService';
import { Trophy, Medal, Award, Loader2, RefreshCw } from 'lucide-react';

export default function Leaderboard() {
  const { state } = useProgress();
  const { user } = useAuth();
  
  // UI States
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [syncStatus, setSyncStatus] = useState<string>('');
  const [syncing, setSyncing] = useState(false);

  // Constants for max values
  const MAX_CTF = 67;
  const MAX_PHISH = 145;
  const MAX_CODE = 50;
  const MAX_QUIZ = 79;
  const MAX_FIREWALL = 100;

  // Calculate user's current progress
  const userProgress = useMemo(() => {
    if (!state) return null;
    return {
      ctf_solved_count: state.ctf.solvedIds.length,
      phish_solved_count: state.phish.solvedIds.length,
      code_solved_count: state.code.solvedIds.length,
      quiz_answered: state.quiz.answered,
      quiz_correct: state.quiz.correct,
      firewall_best_score: state.firewall.bestScore,
      badges: state.badges,
    };
  }, [state]);

  // Calculate user's scores
  const userScores = useMemo(() => {
    if (!userProgress) return null;

    const ctfPercent = Math.min(100, (userProgress.ctf_solved_count / MAX_CTF) * 100);
    const phishPercent = Math.min(100, (userProgress.phish_solved_count / MAX_PHISH) * 100);
    const codePercent = Math.min(100, (userProgress.code_solved_count / MAX_CODE) * 100);
    const quizPercent = Math.min(100, (userProgress.quiz_correct / MAX_QUIZ) * 100);
    const firewallPercent = Math.min(100, (userProgress.firewall_best_score / MAX_FIREWALL) * 100);

    const overallPercent = (ctfPercent + phishPercent + codePercent + quizPercent + firewallPercent) / 5;

    return {
      total: Math.round(overallPercent * 10),
      ctf: Math.round(ctfPercent * 10),
      phish: Math.round(phishPercent * 10),
      code: Math.round(codePercent * 10),
      quiz: Math.round(quizPercent * 10),
      firewall: Math.round(firewallPercent * 10),
    };
  }, [userProgress]);

  // Load leaderboard on mount
  useEffect(() => {
    loadLeaderboard();
    
    // Set up auto-refresh every 10 seconds
    const refreshInterval = setInterval(() => {
      loadLeaderboard();
    }, 10000);
    
    return () => clearInterval(refreshInterval);
  }, []);

  // Sync user progress when it changes
  useEffect(() => {
    if (user && userScores && userProgress) {
      syncUserProgress();
    }
  }, [user, userScores, userProgress]);

  const syncUserProgress = async () => {
    if (!user || !userScores || !userProgress) return;

    try {
      console.log('[Leaderboard] Background sync triggered', {
        username: user.username,
        progress: userProgress,
        scores: userScores
      });
      
      await leaderboardService.syncUserScore(
        user.id,
        user.username,
        userScores,
        userProgress
      );
      
      console.log('[Leaderboard] Background sync successful - refreshing leaderboard data');
      
      // Small delay to ensure database update is written
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Refresh leaderboard entries with updated data
      await loadLeaderboard();
    } catch (err) {
      console.error('[Leaderboard] Background sync failed:', err);
    }
  };

  const loadLeaderboard = async () => {
    setLoading(true);
    setError(null);

    try {
      console.log('[Leaderboard] Loading leaderboard...');
      const data = await leaderboardService.getLeaderboard(100);
      
      if (data && data.length > 0) {
        console.log('[Leaderboard] Loaded', data.length, 'entries');
        setEntries(data);
      } else {
        console.warn('[Leaderboard] No entries returned');
        setError('No leaderboard data available');
      }
    } catch (err) {
      console.error('[Leaderboard] Error loading leaderboard:', err);
      setError('Failed to load leaderboard: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setLoading(false);
    }
  };

  const handleForceSync = async () => {
    if (!user || !userScores || !userProgress) {
      setSyncStatus('❌ Missing user data');
      return;
    }

    setSyncing(true);
    setSyncStatus('⏳ Syncing your progress...');

    try {
      console.log('[Leaderboard] Force sync initiated', {
        user: user.username,
        progress: userProgress,
        scores: userScores
      });

      await leaderboardService.syncUserScore(
        user.id,
        user.username,
        userScores,
        userProgress
      );

      setSyncStatus('✅ Sync successful! Refreshing...');
      
      // Refresh leaderboard
      await new Promise(resolve => setTimeout(resolve, 500));
      await loadLeaderboard();
      
      setSyncStatus('');
    } catch (err) {
      console.error('[Leaderboard] Force sync failed:', err);
      setSyncStatus('❌ Sync failed: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setSyncing(false);
    }
  };

  const handleRefresh = async () => {
    setSyncStatus('⏳ Refreshing...');
    try {
      await loadLeaderboard();
      setSyncStatus('✅ Refreshed');
      setTimeout(() => setSyncStatus(''), 2000);
    } catch (err) {
      setSyncStatus('❌ Refresh failed');
    }
  };

  const calculateProgress = (entry: LeaderboardEntry) => {
    const ctf = Math.min(100, ((entry.ctf_solved_count || 0) / MAX_CTF) * 100);
    const phish = Math.min(100, ((entry.phish_solved_count || 0) / MAX_PHISH) * 100);
    const code = Math.min(100, ((entry.code_solved_count || 0) / MAX_CODE) * 100);
    const quiz = Math.min(100, ((entry.quiz_correct || 0) / MAX_QUIZ) * 100);
    const firewall = Math.min(100, ((entry.firewall_best_score || 0) / MAX_FIREWALL) * 100);

    return Math.round((ctf + phish + code + quiz + firewall) / 5);
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="text-yellow-400" size={20} />;
    if (rank === 2) return <Medal className="text-gray-300" size={20} />;
    if (rank === 3) return <Award className="text-amber-600" size={20} />;
    return <span className="text-slate-400 text-sm font-medium">#{rank}</span>;
  };

  const currentUserEntry = useMemo(() => {
    if (!user) return null;
    return entries.find(e => e.user_id === user.id);
  }, [entries, user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="animate-spin text-[#8B5CF6]" size={40} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold score-glow mb-2">Leaderboard</h1>
        <p className="text-slate-400">Global rankings based on overall progress</p>

        {/* Status Message */}
        {syncStatus && (
          <div className="mt-3 px-3 py-2 rounded bg-[#8B5CF6]/10 border border-[#8B5CF6]/30 text-[#8B5CF6] text-sm">
            {syncStatus}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mt-3 px-3 py-2 rounded bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* Action Buttons */}
        {user && userProgress && (
          <div className="mt-3 flex gap-2">
            <button
              onClick={handleForceSync}
              disabled={syncing}
              className="px-4 py-2 text-sm bg-[#8B5CF6]/20 hover:bg-[#8B5CF6]/30 border border-[#8B5CF6]/50 rounded text-[#8B5CF6] transition-colors disabled:opacity-50"
            >
              {syncing ? '⏳ Syncing...' : '🔄 Sync My Progress'}
            </button>
            <button
              onClick={handleRefresh}
              className="px-4 py-2 text-sm bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/50 rounded text-blue-400 transition-colors"
            >
              <RefreshCw size={16} className="inline mr-1" />
              Refresh
            </button>
          </div>
        )}
      </div>

      {/* Your Position */}
      {currentUserEntry && (
        <div className="leaderboard-glow border border-[#8B5CF6]/40 rounded-lg p-4 bg-[#8B5CF6]/5">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              {getRankIcon(currentUserEntry.rank)}
              <div>
                <p className="text-[#8B5CF6] font-semibold">Your Position</p>
                <p className="text-slate-400 text-sm">
                  {currentUserEntry.name || currentUserEntry.username} • Rank #{currentUserEntry.rank}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-8">
              <div className="text-right">
                <p className="text-2xl font-bold score-glow">{currentUserEntry.total_score || 0}</p>
                <p className="text-xs text-slate-500">Score</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-[#8B5CF6]">{calculateProgress(currentUserEntry)}%</p>
                <p className="text-xs text-slate-500">Progress</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Leaderboard Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-700">
              <th className="text-left px-4 py-3 text-slate-400 font-medium">Rank</th>
              <th className="text-left px-4 py-3 text-slate-400 font-medium">Player</th>
              <th className="text-right px-4 py-3 text-slate-400 font-medium">Score</th>
              <th className="text-right px-4 py-3 text-slate-400 font-medium hidden md:table-cell">CTF</th>
              <th className="text-right px-4 py-3 text-slate-400 font-medium hidden md:table-cell">Phish</th>
              <th className="text-right px-4 py-3 text-slate-400 font-medium hidden md:table-cell">Code</th>
              <th className="text-right px-4 py-3 text-slate-400 font-medium hidden md:table-cell">Quiz</th>
              <th className="text-right px-4 py-3 text-slate-400 font-medium">Progress</th>
            </tr>
          </thead>
          <tbody>
            {entries.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-slate-400">
                  No leaderboard entries yet
                </td>
              </tr>
            ) : (
              entries.map((entry) => (
                <tr
                  key={entry.user_id}
                  className={`border-b border-slate-700/50 hover:bg-slate-800/30 transition ${
                    entry.user_id === user?.id ? 'bg-[#8B5CF6]/10' : ''
                  }`}
                >
                  <td className="px-4 py-3">
                    {getRankIcon(entry.rank)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {entry.avatar_url && (
                        <img
                          src={entry.avatar_url}
                          alt={entry.username}
                          className="w-8 h-8 rounded-full"
                        />
                      )}
                      <div>
                        <p className="font-medium">{entry.name || entry.username}</p>
                        {entry.user_id === user?.id && (
                          <p className="text-xs text-[#8B5CF6]">(You)</p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right font-bold score-glow">
                    {entry.total_score || 0}
                  </td>
                  <td className="px-4 py-3 text-right hidden md:table-cell text-slate-400">
                    {entry.ctf_solved_count || 0}
                  </td>
                  <td className="px-4 py-3 text-right hidden md:table-cell text-slate-400">
                    {entry.phish_solved_count || 0}
                  </td>
                  <td className="px-4 py-3 text-right hidden md:table-cell text-slate-400">
                    {entry.code_solved_count || 0}
                  </td>
                  <td className="px-4 py-3 text-right hidden md:table-cell text-slate-400">
                    {entry.quiz_correct || 0}
                  </td>
                  <td className="px-4 py-3 text-right text-[#8B5CF6] font-medium">
                    {calculateProgress(entry)}%
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
