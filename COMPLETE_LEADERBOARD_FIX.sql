-- ============================================
-- COMPLETE LEADERBOARD FIX - CREATE VIEW + RLS
-- ============================================
-- Run this ENTIRE script to fix everything

-- Step 1: Create leaderboard_view if it doesn't exist
-- ============================================
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
  -- Progress data - read directly from leaderboard_scores (no user_progress join)
  COALESCE(ls.ctf_solved_count, 0) as ctf_solved_count,
  COALESCE(ls.phish_solved_count, 0) as phish_solved_count,
  COALESCE(ls.code_solved_count, 0) as code_solved_count,
  COALESCE(ls.quiz_answered, 0) as quiz_answered,
  COALESCE(ls.quiz_correct, 0) as quiz_correct,
  COALESCE(ls.firewall_best_score, 0) as firewall_best_score,
  COALESCE(ls.badges, '{}') as badges,
  ROW_NUMBER() OVER (ORDER BY ls.total_score DESC, ls.last_updated ASC) as rank
FROM leaderboard_scores ls
LEFT JOIN user_profiles up ON ls.user_id = up.id
WHERE up.id IS NOT NULL
ORDER BY ls.total_score DESC, ls.last_updated ASC;

-- Grant access to the view
GRANT SELECT ON leaderboard_view TO authenticated;

-- Step 2: Remove any conflicting RLS policies
-- ============================================
DROP POLICY IF EXISTS "Only authenticated users can view leaderboard" ON leaderboard_scores;
DROP POLICY IF EXISTS "Leaderboard is read-only" ON leaderboard_scores;
DROP POLICY IF EXISTS "Read all leaderboard" ON leaderboard_scores;

-- Step 3: Create permissive SELECT policy for leaderboard_scores
-- ============================================
DROP POLICY IF EXISTS "Anyone can view leaderboard" ON leaderboard_scores;

CREATE POLICY "Anyone can view leaderboard"
  ON leaderboard_scores FOR SELECT
  TO authenticated
  USING (true);

-- Step 4: Ensure user_profiles is also readable
-- ============================================
DROP POLICY IF EXISTS "Authenticated users can view public profiles" ON user_profiles;
DROP POLICY IF EXISTS "Public read profiles" ON user_profiles;
DROP POLICY IF EXISTS "Authenticated users can view all profiles" ON user_profiles;

CREATE POLICY "Authenticated users can view all profiles"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (true);

-- Step 5: Verify policies are set correctly
-- ============================================
SELECT 
  tablename,
  policyname,
  permissive,
  roles
FROM pg_policies 
WHERE tablename IN ('leaderboard_scores', 'user_profiles')
ORDER BY tablename, policyname;

-- Step 6: Test that leaderboard_scores has data
-- ============================================
SELECT 
  COUNT(*) as leaderboard_count,
  MAX(total_score) as highest_score,
  MIN(total_score) as lowest_score,
  COUNT(CASE WHEN total_score > 0 THEN 1 END) as entries_with_score
FROM leaderboard_scores;

-- Step 7: Test the view works
-- ============================================
SELECT 
  COUNT(*) as view_count,
  MAX(total_score) as highest_view_score
FROM leaderboard_view;

-- Step 8: Show actual data
-- ============================================
SELECT 
  rank,
  username,
  COALESCE(name, 'No name') as name,
  total_score,
  ctf_solved_count,
  phish_solved_count,
  code_solved_count,
  quiz_correct,
  firewall_best_score
FROM leaderboard_view
ORDER BY rank
LIMIT 10;

-- Step 9: If no data in leaderboard_scores, populate it
-- ============================================
-- This will only insert if users don't have leaderboard entries
INSERT INTO leaderboard_scores (user_id, username, total_score, ctf_score, phish_score, code_score, quiz_score, firewall_score, ctf_solved_count, phish_solved_count, code_solved_count, quiz_answered, quiz_correct, firewall_best_score, badges)
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

-- Step 10: Final verification - show complete leaderboard
-- ============================================
SELECT 
  row_number() OVER (ORDER BY total_score DESC) as rank,
  username,
  COALESCE(name, 'N/A') as name,
  total_score,
  CONCAT(ctf_solved_count, ' CTF / ', phish_solved_count, ' Phish / ', code_solved_count, ' Code') as progress,
  quiz_correct,
  firewall_best_score
FROM leaderboard_view
ORDER BY total_score DESC;
