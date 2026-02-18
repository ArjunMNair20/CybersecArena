-- ============================================
-- SYNC ALL USER SCORES TO LEADERBOARD
-- ============================================
-- This script calculates and stores scores for all users from their progress

-- Step 1: Update leaderboard_scores with calculated scores from user_progress
-- ============================================
UPDATE leaderboard_scores ls
SET 
  ctf_score = COALESCE(array_length(up.ctf_solved_ids, 1), 0) * 100,
  phish_score = COALESCE(array_length(up.phish_solved_ids, 1), 0) * 150,
  code_score = COALESCE(array_length(up.code_solved_ids, 1), 0) * 150,
  quiz_score = up.quiz_correct * 80,
  firewall_score = up.firewall_best_score * 20,
  total_score = (
    COALESCE(array_length(up.ctf_solved_ids, 1), 0) * 100 +
    COALESCE(array_length(up.phish_solved_ids, 1), 0) * 150 +
    COALESCE(array_length(up.code_solved_ids, 1), 0) * 150 +
    up.quiz_correct * 80 +
    up.firewall_best_score * 20
  ),
  ctf_solved_count = COALESCE(array_length(up.ctf_solved_ids, 1), 0),
  phish_solved_count = COALESCE(array_length(up.phish_solved_ids, 1), 0),
  code_solved_count = COALESCE(array_length(up.code_solved_ids, 1), 0),
  quiz_answered = up.quiz_answered,
  quiz_correct = up.quiz_correct,
  firewall_best_score = up.firewall_best_score,
  badges = COALESCE(up.badges, '{}')
FROM user_progress up
WHERE ls.user_id = up.user_id;

-- Step 2: Verify scores were updated
SELECT '=== SCORES UPDATED ===' as info;
SELECT 
  username,
  total_score,
  ctf_score,
  phish_score,
  code_score,
  quiz_score,
  firewall_score,
  ctf_solved_count,
  phish_solved_count,
  code_solved_count
FROM leaderboard_scores
ORDER BY total_score DESC;

-- Step 3: Display leaderboard with ranking
SELECT '=== LEADERBOARD VIEW ===' as info;
SELECT 
  rank,
  username,
  COALESCE(name, 'N/A') as name,
  total_score,
  ctf_solved_count,
  phish_solved_count,
  code_solved_count,
  quiz_correct
FROM leaderboard_view
ORDER BY rank;

-- Step 4: Verify RLS policies are correct
SELECT '=== RLS POLICIES ===' as info;
SELECT tablename, policyname, permissive
FROM pg_policies
WHERE tablename IN ('leaderboard_scores', 'user_profiles')
ORDER BY tablename, policyname;
