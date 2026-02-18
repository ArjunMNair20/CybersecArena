-- Migration: Add progress detail columns to leaderboard_scores table
-- This allows the leaderboard to display solved counts without requiring RLS-restricted user_progress joins

-- Add progress columns to leaderboard_scores
ALTER TABLE leaderboard_scores ADD COLUMN IF NOT EXISTS ctf_solved_count integer DEFAULT 0;
ALTER TABLE leaderboard_scores ADD COLUMN IF NOT EXISTS phish_solved_count integer DEFAULT 0;
ALTER TABLE leaderboard_scores ADD COLUMN IF NOT EXISTS code_solved_count integer DEFAULT 0;
ALTER TABLE leaderboard_scores ADD COLUMN IF NOT EXISTS quiz_answered integer DEFAULT 0;
ALTER TABLE leaderboard_scores ADD COLUMN IF NOT EXISTS quiz_correct integer DEFAULT 0;
ALTER TABLE leaderboard_scores ADD COLUMN IF NOT EXISTS firewall_best_score integer DEFAULT 0;
ALTER TABLE leaderboard_scores ADD COLUMN IF NOT EXISTS badges text[] DEFAULT '{}';

-- Update the updated_at trigger to include the new columns in the check
-- (This happens automatically with existing trigger)

-- Grant access to authenticated users
GRANT UPDATE ON leaderboard_scores TO authenticated;

-- Update leaderboard_view to include progress columns from leaderboard_scores directly
DROP VIEW IF EXISTS leaderboard_view CASCADE;

CREATE OR REPLACE VIEW leaderboard_view AS
SELECT 
  ls.id,
  ls.user_id,
  ls.username,
  up.name,
  up.avatar_url,
  ls.total_score,
  ls.ctf_score,
  ls.phish_score,
  ls.code_score,
  ls.quiz_score,
  ls.firewall_score,
  ls.last_updated,
  -- Progress data - first try leaderboard_scores, then fallback to user_progress
  COALESCE(ls.ctf_solved_count, COALESCE(array_length(up_progress.ctf_solved_ids, 1), 0)) as ctf_solved_count,
  COALESCE(ls.phish_solved_count, COALESCE(array_length(up_progress.phish_solved_ids, 1), 0)) as phish_solved_count,
  COALESCE(ls.code_solved_count, COALESCE(array_length(up_progress.code_solved_ids, 1), 0)) as code_solved_count,
  COALESCE(ls.quiz_answered, up_progress.quiz_answered, 0) as quiz_answered,
  COALESCE(ls.quiz_correct, up_progress.quiz_correct, 0) as quiz_correct,
  COALESCE(ls.firewall_best_score, up_progress.firewall_best_score, 0) as firewall_best_score,
  COALESCE(ls.badges, up_progress.badges, '{}') as badges,
  ROW_NUMBER() OVER (ORDER BY ls.total_score DESC, ls.last_updated ASC) as rank
FROM leaderboard_scores ls
INNER JOIN user_profiles up ON ls.user_id = up.id
LEFT JOIN user_progress up_progress ON ls.user_id = up_progress.user_id
WHERE up.id IS NOT NULL AND up.username IS NOT NULL
ORDER BY ls.total_score DESC, ls.last_updated ASC;

-- Grant access to the view
GRANT SELECT ON leaderboard_view TO authenticated;

-- ============================================
-- Create RPC function to ensure all users have leaderboard entries
-- ============================================
CREATE OR REPLACE FUNCTION ensure_all_users_in_leaderboard()
RETURNS TABLE(created_count int, message text) AS $$
DECLARE
  v_created int := 0;
BEGIN
  -- Create leaderboard entries for all authenticated users who don't have them
  INSERT INTO leaderboard_scores (
    user_id, 
    username, 
    total_score, 
    ctf_score, 
    phish_score, 
    code_score, 
    quiz_score, 
    firewall_score,
    ctf_solved_count,
    phish_solved_count,
    code_solved_count,
    quiz_answered,
    quiz_correct,
    firewall_best_score,
    badges
  )
  SELECT 
    au.id,
    COALESCE(up.username, 'user_' || substr(au.id::text, 1, 8)),
    0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0,
    '{}'
  FROM auth.users au
  LEFT JOIN user_profiles up ON au.id = up.id
  LEFT JOIN leaderboard_scores ls ON au.id = ls.user_id
  WHERE ls.user_id IS NULL
  ON CONFLICT (user_id) DO NOTHING;

  GET DIAGNOSTICS v_created = ROW_COUNT;
  
  RETURN QUERY SELECT v_created, 'Successfully ensured all users in leaderboard'::text;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION ensure_all_users_in_leaderboard() TO authenticated;

-- ============================================
-- CRITICAL FIX: Create missing leaderboard entries for ANY users without them
-- ============================================
-- This ensures all existing users appear in the leaderboard
INSERT INTO leaderboard_scores (user_id, username, total_score, ctf_score, phish_score, code_score, quiz_score, firewall_score, ctf_solved_count, phish_solved_count, code_solved_count, quiz_answered, quiz_correct, firewall_best_score, badges)
SELECT 
  au.id,
  COALESCE(up.username, 'user_' || substr(au.id::text, 1, 8)),
  0, 0, 0, 0, 0, 0,  -- Initialize all scores to 0
  0, 0, 0, 0, 0, 0,  -- Initialize all progress counts to 0
  '{}'                -- Initialize badges to empty array
FROM auth.users au
LEFT JOIN user_profiles up ON au.id = up.id
LEFT JOIN leaderboard_scores ls ON au.id = ls.user_id
WHERE ls.user_id IS NULL  -- Only for users without leaderboard entries
ON CONFLICT (user_id) DO NOTHING;

-- ============================================
-- Verification - Count total users in leaderboard
-- ============================================
-- SELECT COUNT(*) as total_leaderboard_users FROM leaderboard_scores;
-- SELECT * FROM leaderboard_view ORDER BY rank;
