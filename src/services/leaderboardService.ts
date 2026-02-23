import { getSupabase } from '../lib/supabase';

export interface LeaderboardEntry {
  id: string;
  user_id: string;
  username: string;
  name: string | null;
  avatar_url: string | null;
  total_score: number;
  ctf_score: number;
  phish_score: number;
  code_score: number;
  quiz_score: number;
  firewall_score: number;
  rank: number;
  last_updated: string;
  // Progress data
  ctf_solved_count?: number;
  phish_solved_count?: number;
  code_solved_count?: number;
  quiz_answered?: number;
  quiz_correct?: number;
  firewall_best_score?: number;
  badges?: string[];
}

class LeaderboardService {

  /**
   * Fetch leaderboard entries from database using direct table queries
   * Most reliable method: direct query with explicit joins
   */
  async getLeaderboard(limit: number = 100): Promise<LeaderboardEntry[]> {
    try {
      const supabase = await getSupabase();
      if (!supabase) {
        throw new Error('Supabase client not available');
      }

      console.log('[leaderboardService] ===== LEADERBOARD FETCH START =====');

      // Try fetching from view first
      console.log('[leaderboardService] Step 1: Attempting to fetch from leaderboard_view...');
      let { data: viewData, error: viewError } = await supabase
        .from('leaderboard_view')
        .select('*')
        .order('total_score', { ascending: false })
        .limit(limit);

      if (!viewError && viewData && viewData.length > 0) {
        console.log('[leaderboardService] ✓ View fetch successful:', viewData.length, 'entries');
        const result = this.transformViewData(viewData);
        this.cacheLeaderboard(result);
        return result;
      }

      if (viewError) {
        console.warn('[leaderboardService] ✗ View fetch failed:', viewError.message);
      }

      // Fallback: Fetch from score table directly (simpler, avoids RLS on user_progress)
      // NOW includes progress columns that we store in leaderboard_scores
      console.log('[leaderboardService] Step 2: Fallback - fetch from leaderboard_scores + user_profiles...');
      
      const { data: scoreData, error: scoreError } = await supabase
        .from('leaderboard_scores')
        .select(`
          id, 
          user_id, 
          username, 
          total_score, 
          ctf_solved_count,
          phish_solved_count,
          code_solved_count,
          quiz_correct,
          firewall_best_score
        `)
        .order('total_score', { ascending: false })
        .limit(limit);

      if (scoreError) {
        console.error('[leaderboardService] ✗ Score fetch failed:', scoreError);
        console.error('[leaderboardService] Error details:', {
          message: scoreError.message,
          code: (scoreError as any).code,
          hint: (scoreError as any).hint
        });
        throw scoreError;
      }

      if (!scoreData || scoreData.length === 0) {
        console.log('[leaderboardService] ℹ No leaderboard entries found in database');
        return [];
      }

      console.log('[leaderboardService] ✓ Got', scoreData.length, 'score entries from leaderboard_scores');

      // Get profile data (names and avatars)
      const userIds = scoreData.map((s: any) => s.user_id);
      console.log('[leaderboardService] Fetching profiles for', userIds.length, 'users...');
      
      const { data: profiles, error: profileError } = await supabase
        .from('user_profiles')
        .select('id, name, avatar_url')
        .in('id', userIds);

      if (profileError) {
        console.warn('[leaderboardService] ⚠ Could not fetch profiles:', profileError);
      } else {
        console.log('[leaderboardService] ✓ Got profiles for', profiles?.length || 0, 'users');
      }

      const profileMap = new Map(profiles?.map((p: any) => [p.id, p]) || []);

      // Transform to leaderboard entries - now includes progress details from leaderboard_scores table
      const result = scoreData.map((score: any, idx: number) => {
        const profile = profileMap.get(score.user_id);

        const entry = {
          id: score.id,
          user_id: score.user_id,
          username: score.username,
          name: profile?.name || null,
          avatar_url: profile?.avatar_url || null,
          total_score: score.total_score || 0,
          ctf_score: 0,
          phish_score: 0,
          code_score: 0,
          quiz_score: 0,
          firewall_score: 0,
          last_updated: new Date().toISOString(),
          ctf_solved_count: score.ctf_solved_count || 0,
          phish_solved_count: score.phish_solved_count || 0,
          code_solved_count: score.code_solved_count || 0,
          quiz_answered: 0,
          quiz_correct: score.quiz_correct || 0,
          firewall_best_score: score.firewall_best_score || 0,
          badges: [],
          rank: idx + 1,
        } as LeaderboardEntry;

        if (idx < 3) {
          console.log('[leaderboardService] Entry', idx + 1, ':', {
            username: entry.username,
            score: entry.total_score,
            name: entry.name,
            hasProfile: !!profile
          });
        }

        return entry;
      });

      console.log('[leaderboardService] ✓ Leaderboard constructed:', result.length, 'entries');
      if (result.length > 0) {
        console.log('[leaderboardService] Sample entries:');
        result.slice(0, 5).forEach((e, i) => {
          console.log(`  [${i + 1}] ${e.name || e.username}: ${e.total_score} points (${e.ctf_solved_count} CTF)`);
        });
      }

      this.cacheLeaderboard(result);
      console.log('[leaderboardService] ===== LEADERBOARD FETCH COMPLETE =====');
      return result;

      console.log('[leaderboardService] ✓ Leaderboard constructed:', result.length, 'entries');
      if (result.length > 0) {
        console.log('[leaderboardService] Sample entries:');
        result.slice(0, 3).forEach((e, i) => {
          console.log(`  [${i + 1}] ${e.name || e.username}: ${e.total_score} points`);
        });
      }

      this.cacheLeaderboard(result);
      console.log('[leaderboardService] ===== LEADERBOARD FETCH COMPLETE =====');
      return result;

    } catch (error) {
      console.error('[leaderboardService] ✗ Fatal error in getLeaderboard:', error);
      const cached = this.getCachedLeaderboard();
      if (cached?.length) {
        console.log('[leaderboardService] Returning', cached.length, 'cached entries as fallback');
        return cached;
      }
      return [];
    }
  }

  /**
   * Helper to transform view data to leaderboard entries
   */
  private transformViewData(viewData: any[]): LeaderboardEntry[] {
    return viewData.map((row, idx) => {
      const entry = {
        id: row.id,
        user_id: row.user_id,
        username: row.username,
        name: row.name || null,
        avatar_url: row.avatar_url || null,
        total_score: row.total_score || 0,
        ctf_score: row.ctf_score || 0,
        phish_score: row.phish_score || 0,
        code_score: row.code_score || 0,
        quiz_score: row.quiz_score || 0,
        firewall_score: row.firewall_score || 0,
        last_updated: row.last_updated,
        ctf_solved_count: row.ctf_solved_count ?? 0,
        phish_solved_count: row.phish_solved_count ?? 0,
        code_solved_count: row.code_solved_count ?? 0,
        quiz_answered: row.quiz_answered ?? 0,
        quiz_correct: row.quiz_correct ?? 0,
        firewall_best_score: row.firewall_best_score ?? 0,
        badges: row.badges || [],
        rank: row.rank || idx + 1,
      } as LeaderboardEntry;

      if (idx < 3) {
        console.log(`[leaderboardService] View entry ${idx + 1}: ${entry.name || entry.username} - Score: ${entry.total_score}`);
      }

      return entry;
    });
  }

  /**
   * Cache leaderboard to localStorage for offline availability
   */
  private cacheLeaderboard(entries: LeaderboardEntry[]): void {
    try {
      const cacheKey = 'leaderboard_cache_v1';
      const lite = entries.map(e => ({
        id: e.id,
        user_id: e.user_id,
        username: e.username,
        name: e.name,
        avatar_url: e.avatar_url,
        total_score: e.total_score,
        ctf_score: e.ctf_score,
        phish_score: e.phish_score,
        code_score: e.code_score,
        quiz_score: e.quiz_score,
        firewall_score: e.firewall_score,
        rank: e.rank,
        ctf_solved_count: e.ctf_solved_count,
        phish_solved_count: e.phish_solved_count,
        code_solved_count: e.code_solved_count,
        quiz_answered: e.quiz_answered,
        quiz_correct: e.quiz_correct,
        firewall_best_score: e.firewall_best_score,
        badges: e.badges,
        last_updated: e.last_updated,
      }));
      localStorage.setItem(cacheKey, JSON.stringify({ ts: Date.now(), entries: lite }));
      console.log('[leaderboardService] Cached', lite.length, 'entries to localStorage');
      console.log('[leaderboardService] Cache sample entry:', lite[0] || 'EMPTY');
    } catch (err) {
      // Ignore storage errors (private mode, quota exceeded)
      console.warn('[leaderboardService] Failed to cache leaderboard:', err);
    }
  }

  /**
   * Get cached leaderboard from localStorage - PUBLIC METHOD for UI use
   */
  getCachedLeaderboard(): LeaderboardEntry[] | null {
    try {
      const cacheKey = 'leaderboard_cache_v1';
      const cacheRaw = localStorage.getItem(cacheKey);
      if (!cacheRaw) {
        console.log('[leaderboardService] No cache found');
        return null;
      }

      const parsed = JSON.parse(cacheRaw);
      if (!parsed?.entries || !Array.isArray(parsed.entries)) {
        console.log('[leaderboardService] Cache entries invalid or missing');
        return null;
      }

      console.log('[leaderboardService] Cache found with', parsed.entries.length, 'entries. Sample:', parsed.entries[0]);

      // Convert lite cache entries back to full entries
      const cachedEntries = (parsed.entries as any[]).map((e) => ({
        id: e.id,
        user_id: e.user_id,
        username: e.username,
        name: e.name || null,
        avatar_url: e.avatar_url || null,
        total_score: e.total_score || 0,
        ctf_score: e.ctf_score || 0,
        phish_score: e.phish_score || 0,
        code_score: e.code_score || 0,
        quiz_score: e.quiz_score || 0,
        firewall_score: e.firewall_score || 0,
        last_updated: e.last_updated,
        rank: e.rank || 0,
        ctf_solved_count: e.ctf_solved_count || 0,
        phish_solved_count: e.phish_solved_count || 0,
        code_solved_count: e.code_solved_count || 0,
        quiz_answered: e.quiz_answered || 0,
        quiz_correct: e.quiz_correct || 0,
        firewall_best_score: e.firewall_best_score || 0,
        badges: e.badges || [],
      } as LeaderboardEntry));

      console.log('[leaderboardService] Retrieved', cachedEntries.length, 'entries from cache. Sample reconstructed:', cachedEntries[0]);
      return cachedEntries.length > 0 ? cachedEntries : null;
    } catch (err) {
      console.warn('[leaderboardService] Failed to read cache:', err);
      return null;
    }
  }

  /**
   * Diagnostic method to check leaderboard database state
   */
  async diagnoseDatabaseState(): Promise<void> {
    try {
      const supabase = await getSupabase();
      if (!supabase) {
        console.error('[leaderboardService] Cannot diagnose: Supabase not available');
        return;
      }

      console.log('[leaderboardService] ===== DATABASE DIAGNOSTIC =====');

      // Check user_profiles count
      const { count: profileCount, error: profileErr } = await supabase
        .from('user_profiles')
        .select('*', { count: 'exact', head: true });

      console.log('[leaderboardService] user_profiles count:', profileCount, profileErr ? '(ERROR: ' + profileErr.message + ')' : '');

      // Check leaderboard_scores count
      const { count: scoreCount, error: scoreErr } = await supabase
        .from('leaderboard_scores')
        .select('*', { count: 'exact', head: true });

      console.log('[leaderboardService] leaderboard_scores count:', scoreCount, scoreErr ? '(ERROR: ' + scoreErr.message + ')' : '');

      // Check first few records in leaderboard_scores
      const { data: sampleScores, error: sampleErr } = await supabase
        .from('leaderboard_scores')
        .select('user_id, username, total_score, ctf_score, phish_score')
        .order('total_score', { ascending: false })
        .limit(3);

      console.log('[leaderboardService] Sample scores:', sampleScores, sampleErr ? '(ERROR: ' + sampleErr.message + ')' : '');

      // Check if view is accessible
      const { data: viewData, error: viewErr } = await supabase
        .from('leaderboard_view')
        .select('*', { head: true })
        .limit(1);

      console.log('[leaderboardService] leaderboard_view accessible:', !viewErr, viewErr ? '(ERROR: ' + viewErr.message + ')' : '');

      console.log('[leaderboardService] ===== END DIAGNOSTIC =====');
    } catch (error) {
      console.error('[leaderboardService] Diagnostic error:', error);
    }
  }

  /**
   * Sync user's score to the leaderboard with retry logic
   * Only syncs for real authenticated users who have profiles
   * Retries up to 3 times with exponential backoff to ensure persistence
   */
  async syncUserScore(
    userId: string,
    username: string,
    scores: {
      total: number;
      ctf: number;
      phish: number;
      code: number;
      quiz: number;
      firewall: number;
    },
    progress?: {
      ctf_solved_count?: number;
      phish_solved_count?: number;
      code_solved_count?: number;
      quiz_answered?: number;
      quiz_correct?: number;
      firewall_best_score?: number;
      badges?: string[];
    }
  ): Promise<void> {
    const maxRetries = 3;
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        await this.performSync(userId, username, scores, progress);
        console.log('[leaderboardService] SYNC SUCCESS: Score saved on attempt', attempt);
        return; // Success - exit early
      } catch (error) {
        lastError = error as Error;
        console.warn(`[leaderboardService] SYNC FAILED (attempt ${attempt}/${maxRetries}):`, error);
        
        if (attempt < maxRetries) {
          // Exponential backoff: 500ms, 1000ms, 2000ms
          const delayMs = 500 * Math.pow(2, attempt - 1);
          console.log(`[leaderboardService] Retrying in ${delayMs}ms...`);
          await new Promise(resolve => setTimeout(resolve, delayMs));
        }
      }
    }

    // All retries exhausted
    console.error('[leaderboardService] SYNC FAILED: All retry attempts exhausted', lastError);
    throw lastError || new Error('Failed to sync user score after retries');
  }

  /**
   * Perform the actual sync operation
   */
  private async performSync(
    userId: string,
    username: string,
    scores: {
      total: number;
      ctf: number;
      phish: number;
      code: number;
      quiz: number;
      firewall: number;
    },
    progress?: {
      ctf_solved_count?: number;
      phish_solved_count?: number;
      code_solved_count?: number;
      quiz_answered?: number;
      quiz_correct?: number;
      firewall_best_score?: number;
      badges?: string[];
    }
  ): Promise<void> {
    try {
      const supabase = await getSupabase();
      if (!supabase) {
        console.warn('[leaderboardService] Supabase client not available, skipping score sync');
        return;
      }

      // Verify user has a profile (real user) before syncing
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('id, username')
        .eq('id', userId)
        .single();

      if (profileError || !profile) {
        console.warn('[leaderboardService] User profile not found, skipping leaderboard sync for user:', userId, profileError);
        return;
      }

      // Ensure username matches the profile
      const profileUsername = profile.username || username;
      if (!profileUsername || profileUsername.trim() === '') {
        console.warn('[leaderboardService] Invalid username, skipping leaderboard sync');
        return;
      }

      console.log('[leaderboardService] SYNC TRIGGERED: Syncing scores for user:', userId, 'username:', profileUsername, 'total_score:', scores.total);

      // Use upsert with proper conflict handling
      // Build payload including optional progress fields for richer realtime display
      // Calculate scores using CORRECT max values from actual data
      
      // Use actual max values from data files
      const MAX_CTF = 67;       // Actual CTF tasks in ctf.ts
      const MAX_PHISH = 145;    // Actual phishing tasks in phish.ts
      const MAX_CODE = 50;      // Actual code tasks in code.ts
      const MAX_QUIZ = 79;      // Actual quiz questions in quiz.ts
      const MAX_FIREWALL = 100;
      
      const progressData = progress || {
        ctf_solved_count: 0,
        phish_solved_count: 0,
        code_solved_count: 0,
        quiz_correct: 0,
        firewall_best_score: 0,
        badges: [],
      };

      // Calculate percentage components (0-100 each)
      const ctfPercent = Math.min(100, ((progressData.ctf_solved_count || 0) / MAX_CTF) * 100);
      const phishPercent = Math.min(100, ((progressData.phish_solved_count || 0) / MAX_PHISH) * 100);
      const codePercent = Math.min(100, ((progressData.code_solved_count || 0) / MAX_CODE) * 100);
      const quizPercent = Math.min(100, ((progressData.quiz_correct || 0) / MAX_QUIZ) * 100);
      const firewallPercent = Math.min(100, ((progressData.firewall_best_score || 0) / MAX_FIREWALL) * 100);
      
      // Overall progress percentage (0-100%)
      const overallProgressPercent = (ctfPercent + phishPercent + codePercent + quizPercent + firewallPercent) / 5;
      
      // Calculated total score: Overall % × 10 (0-1000 scale for leaderboard)
      const calculatedTotal = Math.round(overallProgressPercent * 10);
      
      const payload: any = {
        user_id: userId,
        username: profileUsername.toLowerCase(),
        total_score: calculatedTotal,  // 0-1000 based on overall progress %
        ctf_score: Math.round(ctfPercent * 10),      // Individual scores also 0-1000
        phish_score: Math.round(phishPercent * 10),
        code_score: Math.round(codePercent * 10),
        quiz_score: Math.round(quizPercent * 10),
        firewall_score: Math.round(firewallPercent * 10),
      };

      console.log('[leaderboardService] Payload to save:', JSON.stringify(payload, null, 2));
      console.log('[leaderboardService] Actual max values - CTF: ' + MAX_CTF + ', Phish: ' + MAX_PHISH + ', Code: ' + MAX_CODE + ', Quiz: ' + MAX_QUIZ);
      console.log('[leaderboardService] Percentages: CTF=' + ctfPercent.toFixed(1) + '%, Phish=' + phishPercent.toFixed(1) + '%, Code=' + codePercent.toFixed(1) + '%, Quiz=' + quizPercent.toFixed(1) + '%, Firewall=' + firewallPercent.toFixed(1) + '%');
      console.log('[leaderboardService] Overall Progress: ' + overallProgressPercent.toFixed(1) + '% → Score: ' + calculatedTotal);

      // Always include progress details when syncing
      if (progress) {
        if (progress.ctf_solved_count !== undefined) payload.ctf_solved_count = progress.ctf_solved_count;
        if (progress.phish_solved_count !== undefined) payload.phish_solved_count = progress.phish_solved_count;
        if (progress.code_solved_count !== undefined) payload.code_solved_count = progress.code_solved_count;
        if (progress.quiz_answered !== undefined) payload.quiz_answered = progress.quiz_answered;
        if (progress.quiz_correct !== undefined) payload.quiz_correct = progress.quiz_correct;
        if (progress.firewall_best_score !== undefined) payload.firewall_best_score = progress.firewall_best_score;
        if (progress.badges !== undefined) payload.badges = progress.badges;
      } else {
        // If no progress data provided, initialize with zeros
        payload.ctf_solved_count = 0;
        payload.phish_solved_count = 0;
        payload.code_solved_count = 0;
        payload.quiz_answered = 0;
        payload.quiz_correct = 0;
        payload.firewall_best_score = 0;
        payload.badges = [];
      }

      // Try upsert with onConflict
      console.log('[leaderboardService] ↳ Attempting UPSERT with onConflict: user_id');
      const { error: upsertError, data: upsertData } = await supabase
        .from('leaderboard_scores')
        .upsert(payload, {
          onConflict: 'user_id',
        });

      if (upsertError) {
        console.error('[leaderboardService] ❌ UPSERT FAILED:', {
          code: upsertError.code,
          message: upsertError.message,
          hint: (upsertError as any).hint,
          details: (upsertError as any).details,
        });
        
        console.log('[leaderboardService] ↳ Fallback 1: Attempting explicit UPDATE...');
        
        // Try to update first
        const { error: updateError } = await supabase
          .from('leaderboard_scores')
          .update(payload)
          .eq('user_id', userId);
        
        if (updateError) {
          console.error('[leaderboardService] ❌ UPDATE ALSO FAILED:', updateError);
          console.log('[leaderboardService] ↳ Fallback 2: Attempting direct INSERT...');
          
          // If update fails, try insert
          const { error: insertError } = await supabase
            .from('leaderboard_scores')
            .insert(payload);
          
          if (insertError) {
            console.error('[leaderboardService] ❌ INSERT ALSO FAILED:', {
              code: insertError.code,
              message: insertError.message,
              hint: (insertError as any).hint,
            });
            throw insertError;
          } else {
            console.log('[leaderboardService] ✅ INSERT succeeded');
          }
        } else {
          console.log('[leaderboardService] ✅ UPDATE succeeded');
        }
      } else {
        console.log('[leaderboardService] ✅ UPSERT succeeded');
      }

      console.log('[leaderboardService] ====== SYNC VERIFICATION ======');
      
      // VERIFY: Query back to confirm update actually happened
      const { data: verifyData, error: verifyError } = await supabase
        .from('leaderboard_scores')
        .select('*')
        .eq('user_id', userId)
        .single();
      
      if (verifyError) {
        console.error('[leaderboardService] ❌ VERIFICATION FAILED - Could not read back data:', verifyError);
        console.warn('[leaderboardService] Warning: Data may not have been saved properly');
      } else if (!verifyData) {
        console.error('[leaderboardService] ❌ VERIFICATION FAILED - No data found for user:', userId);
      } else {
        console.log('[leaderboardService] ✅ VERIFICATION SUCCESS: Data confirmed in database');
        console.log('[leaderboardService]    Saved counts: CTF=' + verifyData.ctf_solved_count + ', Phish=' + verifyData.phish_solved_count + ', Code=' + verifyData.code_solved_count + ', Quiz=' + verifyData.quiz_correct + ', Score=' + verifyData.total_score);
      }
      
      console.log('[leaderboardService] ====== SYNC COMPLETE ======');
    } catch (error) {
      console.error('[leaderboardService] SYNC FAILED in performSync:', error);
      throw error;
    }
  }

  /**
   * Sync all users' scores from user_progress to leaderboard_scores
   * This calls a PostgreSQL function to handle the sync server-side,
   * bypassing RLS policies that would prevent reading all user progress
   */
  async syncAllUsersScores(): Promise<{ synced: number; failed: number }> {
    try {
      const supabase = await getSupabase();
      if (!supabase) {
        console.error('[leaderboardService] Supabase not available for syncAllUsersScores');
        return { synced: 0, failed: 0 };
      }

      console.log('[leaderboardService] Calling sync_all_leaderboard_scores() function...');

      // Call the PostgreSQL function that syncs all scores
      const { data: result, error } = await supabase
        .rpc('sync_all_leaderboard_scores');

      if (error) {
        console.error('[leaderboardService] RPC function error:', error);
        return { synced: 0, failed: 0 };
      }

      console.log('[leaderboardService] RPC result:', result);

      if (result && result[0]) {
        const { synced_count, error_message } = result[0];
        console.log('[leaderboardService] Sync complete:', { synced: synced_count, message: error_message });
        return { synced: synced_count, failed: 0 };
      }

      console.log('[leaderboardService] No result from RPC');
      return { synced: 0, failed: 0 };
    } catch (error) {
      console.error('[leaderboardService] Fatal error in syncAllUsersScores:', error);
      return { synced: 0, failed: 0 };
    }
  }

  /**
   * Ensure all users have scores synced, then return leaderboard
   */
  async getLeaderboardWithFullSync(limit: number = 100): Promise<LeaderboardEntry[]> {
    try {
      // First sync all user scores from user_progress
      console.log('[leaderboardService] Enforcing full sync before returning leaderboard...');
      const syncResult = await this.syncAllUsersScores();
      console.log('[leaderboardService] Sync result:', syncResult);

      // Then fetch and return the leaderboard
      return await this.getLeaderboard(limit);
    } catch (error) {
      console.error('[leaderboardService] Error in getLeaderboardWithFullSync:', error);
      return await this.getLeaderboard(limit);
    }
  }


  subscribeToLeaderboard(
    callback: (entries: LeaderboardEntry[]) => void
  ): () => void {
    let isSubscribed = true;
    let refetchTimeout: NodeJS.Timeout | null = null;
    let currentEntries: LeaderboardEntry[] = [];

    const setupSubscription = async () => {
      try {
        const supabase = await getSupabase();
        if (!supabase) {
          console.error('[leaderboardService] Supabase client not available for subscriptions');
          return;
        }

        console.log('[leaderboardService] Setting up real-time subscriptions');

        // Initial fetch
        const entries = await this.getLeaderboard();
        if (isSubscribed) {
          currentEntries = entries;
          console.log('[leaderboardService] Initial leaderboard fetch:', entries.length, 'entries');
          callback(entries);
        }

        // Debounced refetch function - waits 300ms for multiple changes before refetching (faster real-time updates)
        const debouncedRefetch = () => {
          if (refetchTimeout) clearTimeout(refetchTimeout);
          refetchTimeout = setTimeout(async () => {
            console.log('[leaderboardService] Real-time update triggered, refetching leaderboard...');
            const updatedEntries = await this.getLeaderboard();
            if (isSubscribed) {
              currentEntries = updatedEntries;
              console.log('[leaderboardService] Broadcasting updated entries:', updatedEntries.length);
              callback(updatedEntries);
            }
          }, 300);  // Reduced debounce for faster real-time updates
        };

        // Immediately handle INSERT events (new users) for faster display
        const handleNewEntry = async (payload: any) => {
          console.log('[leaderboardService] leaderboard_scores INSERT detected:', payload.new);
          // Immediately fetch full entry with profile data
          if (payload.new?.user_id) {
            try {
              const { data: scores, error: scoresError } = await supabase
                .from('leaderboard_scores')
                .select('*')
                .eq('user_id', payload.new.user_id)
                .single();

              if (scoresError || !scores) {
                console.warn('[leaderboardService] Failed to fetch new entry details:', scoresError);
                debouncedRefetch();
                return;
              }

              // Get profile info
              const { data: profile } = await supabase
                .from('user_profiles')
                .select('id, name, avatar_url')
                .eq('id', payload.new.user_id)
                .single();

              // Create entry with profile data
              const newEntry: LeaderboardEntry = {
                id: scores.id,
                user_id: scores.user_id,
                username: scores.username,
                name: profile?.name || null,
                avatar_url: profile?.avatar_url || null,
                total_score: scores.total_score,
                ctf_score: scores.ctf_score,
                phish_score: scores.phish_score,
                code_score: scores.code_score,
                quiz_score: scores.quiz_score,
                firewall_score: scores.firewall_score,
                last_updated: scores.last_updated,
                rank: 0, // Will be recalculated on full refresh
              };

              if (isSubscribed) {
                // Check if this user already exists in our list
                const existingIndex = currentEntries.findIndex(e => e.user_id === newEntry.user_id);
                
                if (existingIndex === -1) {
                  // New user - add to list and re-sort
                  console.log('[leaderboardService] Adding new user entry:', newEntry.username);
                  currentEntries.push(newEntry);
                  currentEntries.sort((a, b) => b.total_score - a.total_score);
                  
                  // Recalculate ranks
                  currentEntries.forEach((entry, index) => {
                    entry.rank = index + 1;
                  });
                  
                  callback(currentEntries);
                } else {
                  // User already exists - update scores
                  console.log('[leaderboardService] Updating existing user:', newEntry.username);
                  currentEntries[existingIndex] = { ...newEntry, rank: existingIndex + 1 };
                  currentEntries.sort((a, b) => b.total_score - a.total_score);
                  callback(currentEntries);
                }
              }
            } catch (err) {
              console.error('[leaderboardService] Error handling new entry:', err);
              debouncedRefetch();
            }
          }
        };

        // Subscribe to leaderboard_scores changes
        supabase
          .channel('leaderboard_scores_changes')
          .on(
            'postgres_changes',
            {
              event: 'INSERT',
              schema: 'public',
              table: 'leaderboard_scores',
            },
            (payload) => {
              console.log('[leaderboardService] leaderboard_scores INSERT detected');
              handleNewEntry(payload);
            }
          )
          .on(
            'postgres_changes',
            {
              event: 'UPDATE',
              schema: 'public',
              table: 'leaderboard_scores',
            },
            (payload) => {
              console.log('[leaderboardService] leaderboard_scores UPDATE detected');
              debouncedRefetch();
            }
          )
          .subscribe((status) => {
            console.log('[leaderboardService] leaderboard_scores subscription status:', status);
          });

        // Subscribe to user_progress changes (score updates affect this)
        supabase
          .channel('leaderboard_progress_changes')
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'user_progress',
            },
            (payload) => {
              console.log('[leaderboardService] user_progress change detected:', payload.eventType);
              debouncedRefetch();
            }
          )
          .subscribe((status) => {
            console.log('[leaderboardService] user_progress subscription status:', status);
          });

        // Subscribe to user_profiles changes (new users or profile updates)
        supabase
          .channel('user_profiles_changes')
          .on(
            'postgres_changes',
            {
              event: 'INSERT',
              schema: 'public',
              table: 'user_profiles',
            },
            (payload) => {
              console.log('[leaderboardService] user_profiles INSERT detected - new user registered');
              // New user profile created - trigger a refresh to pick up their leaderboard entry
              debouncedRefetch();
            }
          )
          .on(
            'postgres_changes',
            {
              event: 'UPDATE',
              schema: 'public',
              table: 'user_profiles',
            },
            (payload) => {
              console.log('[leaderboardService] user_profiles UPDATE detected - user profile updated');
              // Profile updated (e.g., name or avatar) - refresh to show changes
              debouncedRefetch();
            }
          )
          .subscribe((status) => {
            console.log('[leaderboardService] user_profiles subscription status:', status);
          });

        console.log('[leaderboardService] Real-time subscriptions established');
      } catch (error) {
        console.error('[leaderboardService] Failed to setup subscriptions:', error);
      }
    };

    setupSubscription();

    // Return unsubscribe function
    return () => {
      isSubscribed = false;
      if (refetchTimeout) clearTimeout(refetchTimeout);
    };
  }

  /**
   * Get current user's rank
   */
  async getUserRank(userId: string): Promise<number | null> {
    try {
      const entries = await this.getLeaderboard();
      const userEntry = entries.find((entry) => entry.user_id === userId);
      return userEntry ? userEntry.rank : null;
    } catch (error) {
      console.error('Failed to get user rank:', error);
      return null;
    }
  }

  /**
   * Ensure a leaderboard entry exists for a user
   * This is useful for existing users who may not have a leaderboard entry yet
   */
  async ensureLeaderboardEntry(userId: string, username: string): Promise<void> {
    try {
      const supabase = await getSupabase();
      if (!supabase) {
        console.warn('Supabase client not available');
        return;
      }

      console.log('Ensuring leaderboard entry for user:', userId, username);

      // Try upsert - this is safer and simpler
      // Include progress columns to ensure they're initialized
      const { error } = await supabase
        .from('leaderboard_scores')
        .upsert(
          {
            user_id: userId,
            username: username.toLowerCase(),
            total_score: 0,
            ctf_score: 0,
            phish_score: 0,
            code_score: 0,
            quiz_score: 0,
            firewall_score: 0,
            ctf_solved_count: 0,
            phish_solved_count: 0,
            code_solved_count: 0,
            quiz_answered: 0,
            quiz_correct: 0,
            firewall_best_score: 0,
            badges: [],
          },
          {
            onConflict: 'user_id',
          }
        );

      if (error) {
        console.error('Error ensuring leaderboard entry:', error);
        return;
      }

      console.log('Leaderboard entry ensured for user:', userId);
    } catch (error) {
      console.error('Failed to ensure leaderboard entry:', error);
    }
  }
}

export default new LeaderboardService();

