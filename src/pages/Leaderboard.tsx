import { useState, useEffect, useMemo } from 'react';
import { useProgress } from '../lib/progress';
import { useAuth } from '../contexts/AuthContext';
import leaderboardService, { LeaderboardEntry } from '../services/leaderboardService';
import { Trophy, Medal, Award, Loader2 } from 'lucide-react';

export default function Leaderboard() {
  const { state } = useProgress();
  const { user } = useAuth();
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [syncStatus, setSyncStatus] = useState<string>('');

  // ===== CORRECT MAX VALUES from actual data =====
  const MAX_CTF = 67;
  const MAX_PHISH = 145;
  const MAX_CODE = 50;
  const MAX_QUIZ = 79;
  const MAX_FIREWALL = 100;

  // Calculate current user's actual progress counts for sync
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

  // Calculate current user's scores CORRECTLY using actual counts
  const userScores = useMemo(() => {
    if (!state || !userProgress) return null;
    
    const ctfPercent = Math.min(100, (userProgress.ctf_solved_count / MAX_CTF) * 100);
    const phishPercent = Math.min(100, (userProgress.phish_solved_count / MAX_PHISH) * 100);
    const codePercent = Math.min(100, (userProgress.code_solved_count / MAX_CODE) * 100);
    const quizPercent = Math.min(100, (userProgress.quiz_correct / MAX_QUIZ) * 100);
    const firewallPercent = Math.min(100, (userProgress.firewall_best_score / MAX_FIREWALL) * 100);
    
    const overallPercent = (ctfPercent + phishPercent + codePercent + quizPercent + firewallPercent) / 5;
    const totalScore = Math.round(overallPercent * 10);

    const scores = {
      total: totalScore,
      ctf: Math.round(ctfPercent * 10),
      phish: Math.round(phishPercent * 10),
      code: Math.round(codePercent * 10),
      quiz: Math.round(quizPercent * 10),
      firewall: Math.round(firewallPercent * 10),
    };
    console.log('[Leaderboard] userScores computed (CORRECT):', scores);
    return scores;
  }, [state, userProgress]);

  // Force sync button handler
  const handleForceSyncClick = async () => {
    if (!user || !userScores || !state || !userProgress) {
      setSyncStatus('❌ Missing user or progress data');
      return;
    }

    setSyncStatus('⏳ Syncing...');
    console.log('[Leaderboard] ╔════════════════════════════════════════╗');
    console.log('[Leaderboard] ║      FORCE SYNC - ACTUAL PROGRESS       ║');
    console.log('[Leaderboard] ╚════════════════════════════════════════╝');
    console.log('[Leaderboard] User ID:', user.id);
    console.log('[Leaderboard] Username:', user.username);
    console.log('[Leaderboard] ');
    console.log('[Leaderboard] ╔═══ REAL COUNTS FROM APP STATE ═══╗');
    console.log('[Leaderboard] ║ CTF Solved:', userProgress.ctf_solved_count);
    console.log('[Leaderboard] ║ Phish Solved:', userProgress.phish_solved_count);
    console.log('[Leaderboard] ║ Code Solved:', userProgress.code_solved_count);
    console.log('[Leaderboard] ║ Quiz Correct:', userProgress.quiz_correct, '/', userProgress.quiz_answered);
    console.log('[Leaderboard] ║ Firewall Score:', userProgress.firewall_best_score);
    console.log('[Leaderboard] ╚════════════════════════════════════════╝');
    
    try {
      console.log('[Leaderboard] Sending to database:', userProgress);
      
      await leaderboardService.syncUserScore(
        user.id,
        user.username,
        userScores,
        userProgress
      );

      setSyncStatus('✅ Synced! Refreshing leaderboard...');
      console.log('[Leaderboard] ✅ SYNC SUCCESS - Data sent to database');

      // Refresh leaderboard after sync
      setTimeout(async () => {
        const data = await leaderboardService.getLeaderboard(100);
        setEntries(data);
        setSyncStatus('✅ Leaderboard updated with your real progress!');
        console.log('[Leaderboard] Leaderboard refreshed with', data.length, 'entries');
        setTimeout(() => setSyncStatus(''), 3000);
      }, 500);
    } catch (err) {
      setSyncStatus('❌ Sync failed: ' + (err instanceof Error ? err.message : String(err)));
      console.error('[Leaderboard] ❌ FORCE SYNC ERROR:', err);
    }
  };

  // Refresh leaderboard data
  const handleRefreshClick = async () => {
    setSyncStatus('⏳ Refreshing leaderboard...');
    try {
      console.log('[Leaderboard] MANUAL REFRESH: Loading latest leaderboard data');
      const data = await leaderboardService.getLeaderboard(100);
      setEntries(data);
      setSyncStatus('✅ Leaderboard refreshed!');
      console.log('[Leaderboard] Leaderboard refreshed with', data.length, 'entries');
      setTimeout(() => setSyncStatus(''), 2000);
    } catch (err) {
      setSyncStatus('❌ Refresh failed: ' + (err instanceof Error ? err.message : String(err)));
      console.error('[Leaderboard] ❌ REFRESH ERROR:', err);
    }
  }

  // Sync user's score to database when it changes - AGGRESSIVE real-time syncing
  // This runs frequently as progress updates, but doesn't reload the entire leaderboard
  useEffect(() => {
    if (!user || !userScores || !userProgress) {
      console.log('[Leaderboard] Score sync skipped: user or userScores missing', { user: !!user, userScores: !!userScores });
      return;
    }

    const syncScore = async () => {
      try {
        console.log('[Leaderboard] BACKGROUND SYNC: Real counts - CTF:', userProgress.ctf_solved_count, 'Phish:', userProgress.phish_solved_count, 'Code:', userProgress.code_solved_count, 'Quiz:', userProgress.quiz_correct);
        
        await leaderboardService.syncUserScore(
          user.id,
          user.username,
          userScores,
          userProgress
        );
        console.log('[Leaderboard] BACKGROUND SYNC SUCCESS: Synced counts to database');
      } catch (err) {
        console.error('[Leaderboard] BACKGROUND SYNC ERROR: Failed to sync:', err);
      }
    };

    // Sync with debounce (50ms) for real-time updates
    const timeoutId = setTimeout(syncScore, 50);
    return () => clearTimeout(timeoutId);
  }, [user, userScores, userProgress]);

  // Load leaderboard - SIMPLE AND DIRECT
  useEffect(() => {
    setLoading(true);
    setError(null);

    console.log('[Leaderboard] ====== PAGE LOAD START ======');
    console.log('[Leaderboard] User:', user?.username || 'not logged in');
    console.log('[Leaderboard] State loaded:', !!state);
    console.log('[Leaderboard] userProgress:', userProgress);
    console.log('[Leaderboard] userScores:', userScores);

    const loadLeaderboard = async () => {
      try {
        // Step 1: Sync CURRENT USER'S PROGRESS FIRST with immediate force
        if (user && userScores && userProgress) {
          try {
            console.log('[Leaderboard] ====== IMMEDIATE SYNC START ======');
            console.log('[Leaderboard] Forcing sync of current user progress BEFORE loading leaderboard');
            console.log('[Leaderboard] User ID:', user.id);
            console.log('[Leaderboard] Username:', user.username);
            console.log('[Leaderboard] Progress data:', {
              ctf: userProgress.ctf_solved_count,
              phish: userProgress.phish_solved_count,
              code: userProgress.code_solved_count,
              quiz_correct: userProgress.quiz_correct,
              firewall: userProgress.firewall_best_score,
            });
            console.log('[Leaderboard] Calculated scores:', userScores);
            
            await leaderboardService.syncUserScore(
              user.id,
              user.username,
              userScores,
              userProgress
            );
            console.log('[Leaderboard] ✅ User progress synced successfully');
            console.log('[Leaderboard] ====== IMMEDIATE SYNC COMPLETE ======');

            // Force a small delay to ensure database write completes
            await new Promise(resolve => setTimeout(resolve, 200));
          } catch (syncErr) {
            console.error('[Leaderboard] ❌ IMMEDIATE SYNC FAILED:', syncErr);
            if (syncErr instanceof Error) {
              console.error('[Leaderboard] Error message:', syncErr.message);
              console.error('[Leaderboard] Error stack:', syncErr.stack);
            }
            console.warn('[Leaderboard] ⚠️  Will continue loading leaderboard anyway...');
          }
        } else {
          console.log('[Leaderboard] ⚠️  Cannot sync: user=' + !!user + ', userScores=' + !!userScores + ', userProgress=' + !!userProgress);
        }

        // Step 2: Load the leaderboard data
        console.log('[Leaderboard] ====== FETCH START ======');
        console.log('[Leaderboard] Fetching leaderboard from database...');
        const data = await leaderboardService.getLeaderboard(100);
        
        console.log('[Leaderboard] Fetch complete. Details:');
        console.log('[Leaderboard] - Total entries:', data?.length || 0);
        console.log('[Leaderboard] - Empty result:', !data || data.length === 0);

        if (data && data.length > 0) {
          console.log('[Leaderboard] ✓ Success! Loaded', data.length, 'entries');
          console.log('[Leaderboard] ✓ ENTRIES FROM DATABASE:');
          data.slice(0, 5).forEach((entry, idx) => {
            console.log(`  [${idx + 1}] ${entry.username}: CTF=${entry.ctf_solved_count}, Phish=${entry.phish_solved_count}, Code=${entry.code_solved_count}, Quiz=${entry.quiz_correct}, Score=${entry.total_score}`);
          });
          console.log('[Leaderboard] ====== FETCH COMPLETE ======');
          setEntries(data);
        } else {
          console.log('[Leaderboard] ⚠️  No leaderboard entries returned');
          console.log('[Leaderboard] ====== FETCH COMPLETE (EMPTY) ======');
          setError('No leaderboard data available');
        }
      } catch (err) {
        console.error('[Leaderboard] Error during load:', err);
        setError('Failed to load leaderboard: ' + (err instanceof Error ? err.message : String(err)));
      } finally {
        setLoading(false);
      }
    };

    loadLeaderboard();
  }, [user, userScores, userProgress]);

  // Find current user's entry
  const currentUserEntry = useMemo(() => {
    if (!user) return null;
    return entries.find((entry) => entry.user_id === user.id);
  }, [entries, user]);

  // Merge local progress into the entries for real-time updates
  // SIMPLIFIED: Only show data from database, don't merge unless user requests it
  useEffect(() => {
    if (!user | !entries || entries.length === 0) {
      return;
    }

    console.log('[Leaderboard] Checking for real-time score updates...');
    console.log('[Leaderboard] Current entries:', entries.length, 'User in list:', !!entries.find(e => e.user_id === user.id));

  }, [entries, user]);

  // Get rank icon
  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="text-yellow-400" size={20} />;
    if (rank === 2) return <Medal className="text-gray-300" size={20} />;
    if (rank === 3) return <Award className="text-amber-600" size={20} />;
    return <span className="text-slate-400 text-sm font-medium">#{rank}</span>;
  };

  // Get display name
  const getDisplayName = (entry: LeaderboardEntry) => {
    return entry.name || entry.username;
  };

  // Compute total score for an entry, falling back to individual parts if total_score missing
  const getEntryTotal = (entry: LeaderboardEntry) => {
    if (!entry) return 0;
    if (entry.total_score !== undefined && entry.total_score !== null) return entry.total_score;
    const sum = (entry.ctf_score || 0) + (entry.phish_score || 0) + (entry.code_score || 0) + (entry.quiz_score || 0) + (entry.firewall_score || 0);
    return sum;
  };

  // Calculate overall progress percentage based on entry data
  // Uses the CORRECT max values from actual data files
  const getEntryProgressPercent = (entry: LeaderboardEntry) => {
    if (!entry) return 0;
    
    const ctfPercent = Math.min(100, ((entry.ctf_solved_count || 0) / MAX_CTF) * 100);
    const phishPercent = Math.min(100, ((entry.phish_solved_count || 0) / MAX_PHISH) * 100);
    const codePercent = Math.min(100, ((entry.code_solved_count || 0) / MAX_CODE) * 100);
    const quizPercent = Math.min(100, ((entry.quiz_correct || 0) / MAX_QUIZ) * 100);
    const firewallPercent = Math.min(100, ((entry.firewall_best_score || 0) / MAX_FIREWALL) * 100);
    
    const overall = (ctfPercent + phishPercent + codePercent + quizPercent + firewallPercent) / 5;
    return Math.round(overall);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold score-glow mb-2">Leaderboard</h1>
        <p className="text-slate-400">Top players ranked by total score</p>
        {syncStatus && (
          <p className="text-sm mt-2 px-3 py-2 rounded bg-[#8B5CF6]/10 border border-[#8B5CF6]/30 text-[#8B5CF6]">
            {syncStatus}
          </p>
        )}
        {user && userScores && (
          <div className="mt-3 flex gap-2">
            <button
              onClick={handleForceSyncClick}
              className="px-4 py-2 text-sm bg-[#8B5CF6]/20 hover:bg-[#8B5CF6]/30 border border-[#8B5CF6]/50 rounded text-[#8B5CF6] transition-colors"
            >
              🔄 Force Sync My Progress
            </button>
            <button
              onClick={handleRefreshClick}
              className="px-4 py-2 text-sm bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/50 rounded text-blue-400 transition-colors"
            >
              🔃 Refresh Leaderboard
            </button>
          </div>
        )}
      </div>

      {/* Current User's Position */}
      {currentUserEntry ? (
        <div className="leaderboard-glow border border-[#8B5CF6]/40 rounded-lg p-4 bg-[#8B5CF6]/5">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              {getRankIcon(currentUserEntry.rank)}
              <div>
                <p className="text-[#8B5CF6] font-semibold">Your Position</p>
                <p className="text-slate-400 text-sm">
                  {getDisplayName(currentUserEntry)} • Rank #{currentUserEntry.rank}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-right">
                <p className="text-2xl font-bold score-glow">{getEntryTotal(currentUserEntry)}</p>
                <p className="text-xs text-slate-500">Total Score</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-[#8B5CF6]">{getEntryProgressPercent(currentUserEntry)}%</p>
                <p className="text-xs text-slate-500">Overall Progress</p>
              </div>
              {(currentUserEntry.ctf_solved_count !== undefined && currentUserEntry.ctf_solved_count >= 0 || 
                currentUserEntry.phish_solved_count !== undefined && currentUserEntry.phish_solved_count >= 0 || 
                currentUserEntry.code_solved_count !== undefined && currentUserEntry.code_solved_count >= 0) && (
                <div className="hidden md:block border-l border-[#FF6F61]/20 pl-6">
                  <p className="text-xs text-slate-400 mb-2">Your Progress</p>
                  <div className="flex flex-col gap-1 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="text-[#8B5CF6]">CTF Solved:</span>
                      <span className="text-slate-300">{currentUserEntry.ctf_solved_count ?? 0}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-fuchsia-400">Phish Solved:</span>
                      <span className="text-slate-300">{currentUserEntry.phish_solved_count ?? 0}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-green-400">Code Solved:</span>
                      <span className="text-slate-300">{currentUserEntry.code_solved_count ?? 0}</span>
                    </div>
                    {currentUserEntry.quiz_answered !== undefined && currentUserEntry.quiz_answered > 0 && (
                      <div className="flex items-center gap-2">
                        <span className="text-yellow-400">Quiz:</span>
                        <span className="text-slate-300">{currentUserEntry.quiz_correct ?? 0}/{currentUserEntry.quiz_answered}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : user && userScores ? (
        <div className="leaderboard-glow border border-[#8B5CF6]/40 rounded-lg p-4 bg-[#8B5CF6]/5">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="text-slate-400 text-sm font-medium">Loading your position...</div>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-right">
                <p className="text-2xl font-bold score-glow">{userScores.total}</p>
                <p className="text-xs text-slate-500">Total Score</p>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="animate-spin text-[#8B5CF6]" size={32} />
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="p-4 rounded-lg bg-red-500/10 border border-red-400/30 text-red-300">
          {error}
        </div>
      )}

      {/* Leaderboard Table */}
      {!loading && !error && (
        <div className="leaderboard-glow border border-[#FF6F61]/30 rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-[#8B5CF6]/10">
              <tr className="text-left">
                <th className="px-4 py-3 text-[#8B5CF6] font-semibold">Rank</th>
                <th className="px-4 py-3 text-[#8B5CF6] font-semibold">Player</th>
                <th className="px-4 py-3 text-[#8B5CF6] font-semibold text-right">Score</th>
                <th className="px-4 py-3 text-[#8B5CF6] font-semibold text-right hidden md:table-cell">CTF</th>
                <th className="px-4 py-3 text-[#8B5CF6] font-semibold text-right hidden md:table-cell">Phish</th>
                <th className="px-4 py-3 text-[#8B5CF6] font-semibold text-right hidden md:table-cell">Code</th>
                <th className="px-4 py-3 text-[#8B5CF6] font-semibold text-right hidden md:table-cell">Quiz</th>
                <th className="px-4 py-3 text-[#8B5CF6] font-semibold text-right hidden lg:table-cell">Progress</th>
              </tr>
            </thead>
            <tbody>
              {entries.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-slate-400">
                    No players on the leaderboard yet. Be the first!
                  </td>
                </tr>
              ) : (
                entries.map((entry) => {
                  const isCurrentUser = user && entry.user_id === user.id;
                  return (
                    <tr
                      key={entry.id}
                      className={`border-t border-[#8B5CF6]/20 transition-colors ${
                        isCurrentUser
                          ? 'bg-[#8B5CF6]/10 hover:bg-[#8B5CF6]/15'
                          : 'hover:bg-white/[0.02]'
                      }`}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {getRankIcon(entry.rank)}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {entry.avatar_url ? (
                            <img
                              src={entry.avatar_url}
                              alt={getDisplayName(entry)}
                              className="w-8 h-8 rounded-full border border-[#8B5CF6]/30"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-[#8B5CF6]/20 flex items-center justify-center text-[#8B5CF6] text-xs font-bold border border-[#8B5CF6]/30">
                              {getDisplayName(entry).charAt(0).toUpperCase()}
                            </div>
                          )}
                          <p className={`font-medium ${isCurrentUser ? 'text-[#8B5CF6]' : 'text-slate-200'}`}>
                            {getDisplayName(entry)}
                            {isCurrentUser && <span className="ml-2 text-xs text-[#8B5CF6]">(You)</span>}
                          </p>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="font-bold score-glow">{getEntryTotal(entry).toLocaleString()}</span>
                      </td>
                      <td className="px-4 py-3 text-right hidden md:table-cell text-slate-400">
                        {entry.ctf_score}
                      </td>
                      <td className="px-4 py-3 text-right hidden md:table-cell text-slate-400">
                        {entry.phish_score}
                      </td>
                      <td className="px-4 py-3 text-right hidden md:table-cell text-slate-400">
                        {entry.code_score}
                      </td>
                      <td className="px-4 py-3 text-right hidden md:table-cell text-slate-400">
                        {entry.quiz_score}
                      </td>
                      <td className="px-4 py-3 text-right hidden lg:table-cell">
                        <div className="flex flex-col gap-2 text-xs text-slate-400">
                          <div className="font-bold text-[#8B5CF6] pb-1 border-b border-[#8B5CF6]/20">
                            Overall: {getEntryProgressPercent(entry)}%
                          </div>
                          <div className="flex items-center justify-end gap-2">
                            <span className="text-[#8B5CF6]">CTF:</span>
                            <span>
                              {entry.ctf_solved_count || 0}
                              <span className="ml-2 text-slate-500">({Math.round(((entry.ctf_solved_count || 0) / MAX_CTF) * 100)}%)</span>
                            </span>
                          </div>
                          <div className="flex items-center justify-end gap-2">
                            <span className="text-fuchsia-400">Phish:</span>
                            <span>{entry.phish_solved_count || 0}</span>
                          </div>
                          <div className="flex items-center justify-end gap-2">
                            <span className="text-green-400">Code:</span>
                            <span>{entry.code_solved_count || 0}</span>
                          </div>
                          {entry.quiz_answered !== undefined && entry.quiz_answered > 0 && (
                            <div className="flex items-center justify-end gap-2">
                              <span className="text-yellow-400">Quiz:</span>
                              <span>{entry.quiz_correct || 0}/{entry.quiz_answered}</span>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Stats Summary */}
      {!loading && entries.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-lg leaderboard-glow bg-[#06b6d4]/5 border border-[#06b6d4]/30">
            <p className="text-slate-400 text-xs mb-1">Total Players</p>
            <p className="text-2xl font-bold score-glow">{entries.length}</p>
          </div>
          <div className="p-4 rounded-lg leaderboard-glow bg-[#06b6d4]/5 border border-[#06b6d4]/30">
            <p className="text-slate-400 text-xs mb-1">Top Score</p>
            <p className="text-2xl font-bold score-glow">
              {getEntryTotal(entries[0] || ({} as LeaderboardEntry)).toLocaleString()}
            </p>
          </div>
          <div className="p-4 rounded-lg leaderboard-glow bg-[#06b6d4]/5 border border-[#06b6d4]/30">
            <p className="text-slate-400 text-xs mb-1">Average Score</p>
            <p className="text-2xl font-bold score-glow">
              {Math.round(entries.reduce((sum, e) => sum + getEntryTotal(e), 0) / entries.length).toLocaleString()}
            </p>
          </div>
          <div className="p-4 rounded-lg leaderboard-glow bg-[#06b6d4]/5 border border-[#06b6d4]/30">
            <p className="text-slate-400 text-xs mb-1">Your Rank</p>
            <p className="text-2xl font-bold score-glow">
              {currentUserEntry ? `#${currentUserEntry.rank}` : 'N/A'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
