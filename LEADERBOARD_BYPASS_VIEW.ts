// ============================================
// LEADERBOARD SERVICE - BYPASS VIEW VERSION
// ============================================
// Use this if RLS fixes don't work
// This completely bypasses the leaderboard_view and queries tables directly
// 
// Replace the getLeaderboard() method in src/services/leaderboardService.ts with this

import { getSupabase } from '../lib/supabase';

/**
 * Fetch leaderboard entries - DIRECT TABLE QUERIES (no view)
 * Most reliable method: avoids RLS issues on joined tables
 */
async getLeaderboard(limit: number = 100): Promise<LeaderboardEntry[]> {
  try {
    const supabase = await getSupabase();
    if (!supabase) {
      throw new Error('Supabase client not available');
    }

    console.log('[leaderboardService] ===== LEADERBOARD FETCH (DIRECT QUERY) =====');

    // Step 1: Get leaderboard scores directly (no view to avoid RLS issues)
    console.log('[leaderboardService] Step 1: Fetching from leaderboard_scores table...');
    
    const { data: scoreData, error: scoreError } = await supabase
      .from('leaderboard_scores')
      .select(`
        id, 
        user_id, 
        username, 
        total_score, 
        ctf_score, 
        phish_score, 
        code_score, 
        quiz_score, 
        firewall_score, 
        last_updated,
        ctf_solved_count,
        phish_solved_count,
        code_solved_count,
        quiz_answered,
        quiz_correct,
        firewall_best_score,
        badges
      `)
      .order('total_score', { ascending: false })
      .limit(limit);

    if (scoreError) {
      console.error('[leaderboardService] ✗ Score fetch failed:', {
        message: scoreError.message,
        code: (scoreError as any).code,
        hint: (scoreError as any).hint
      });
      throw scoreError;
    }

    if (!scoreData || scoreData.length === 0) {
      console.log('[leaderboardService] ℹ No leaderboard entries found');
      return [];
    }

    console.log('[leaderboardService] ✓ Got', scoreData.length, 'score entries');

    // Step 2: Get profile data (names and avatars) - separate query
    console.log('[leaderboardService] Step 2: Fetching profiles...');
    
    const userIds = scoreData.map((s: any) => s.user_id);
    const { data: profiles, error: profileError } = await supabase
      .from('user_profiles')
      .select('id, name, avatar_url')
      .in('id', userIds);

    if (profileError) {
      console.warn('[leaderboardService] ⚠ Profile fetch failed:', profileError.message);
    } else {
      console.log('[leaderboardService] ✓ Got', profiles?.length || 0, 'profiles');
    }

    const profileMap = new Map(profiles?.map((p: any) => [p.id, p]) || []);

    // Step 3: Transform to LeaderboardEntry objects
    console.log('[leaderboardService] Step 3: Transforming data...');
    
    const result: LeaderboardEntry[] = scoreData.map((score: any, idx: number) => {
      const profile = profileMap.get(score.user_id);

      return {
        id: score.id,
        user_id: score.user_id,
        username: score.username,
        name: profile?.name || null,
        avatar_url: profile?.avatar_url || null,
        total_score: score.total_score || 0,
        ctf_score: score.ctf_score || 0,
        phish_score: score.phish_score || 0,
        code_score: score.code_score || 0,
        quiz_score: score.quiz_score || 0,
        firewall_score: score.firewall_score || 0,
        last_updated: score.last_updated,
        ctf_solved_count: score.ctf_solved_count || 0,
        phish_solved_count: score.phish_solved_count || 0,
        code_solved_count: score.code_solved_count || 0,
        quiz_answered: score.quiz_answered || 0,
        quiz_correct: score.quiz_correct || 0,
        firewall_best_score: score.firewall_best_score || 0,
        badges: score.badges || [],
        rank: idx + 1,
      };
    });

    // Log sample data
    if (result.length > 0) {
      console.log('[leaderboardService] === First 3 entries: ===');
      result.slice(0, 3).forEach((entry, i) => {
        console.log(`[leaderboardService] ${i + 1}. ${entry.username} - Score: ${entry.total_score}`);
      });
    }

    console.log('[leaderboardService] ✓ Transform complete');
    this.cacheLeaderboard(result);
    return result;

  } catch (error) {
    console.error('[leaderboardService] ✗ Fetch failed:', error);
    throw error;
  }
}

// ============================================
// NOTES
// ============================================
// This method:
// 1. Queries leaderboard_scores directly (bypasses leaderboard_view)
// 2. Fetches profiles separately in a second query
// 3. Joins results in JavaScript (avoids SQL RLS issues)
// 
// Why this works:
// - leaderboard_scores has permissive RLS: USING (true)
// - user_profiles has permissive RLS: USING (true) after fix
// - No join to restrictive user_progress table
// 
// If this still doesn't work:
// - Check that leaderboard_scores has SELECT policy TO authenticated
// - Check that user_profiles has SELECT policy TO authenticated
// - Run: SELECT COUNT(*) FROM leaderboard_scores; in Supabase
// - If 0, data doesn't exist - run population SQL
