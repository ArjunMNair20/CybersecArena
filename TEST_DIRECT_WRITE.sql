-- ============================================
-- TEST DIRECT DATABASE WRITE
-- ============================================
-- This script will directly insert/update test data
-- to verify the database layer accepts writes

SELECT '=== STARTING TEST ===' as step;

-- Show current user
SELECT 
  auth.uid() as current_user_id,
  CASE WHEN auth.uid() IS NULL THEN 'NOT AUTHENTICATED' ELSE 'AUTHENTICATED' END as status;

-- Check if you exist in leaderboard_scores
SELECT '=== CHECK YOUR CURRENT DATA ===' as step;
SELECT 
  user_id,
  username,
  ctf_solved_count,
  phish_solved_count,
  code_solved_count,
  quiz_correct,
  total_score
FROM leaderboard_scores
WHERE user_id = auth.uid();

-- Try a direct INSERT or UPDATE
SELECT '=== ATTEMPTING UPSERT ===' as step;
INSERT INTO leaderboard_scores (
  user_id,
  username,
  ctf_solved_count,
  phish_solved_count,
  code_solved_count,
  quiz_answered,
  quiz_correct,
  firewall_best_score,
  total_score,
  ctf_score,
  phish_score,
  code_score,
  quiz_score,
  firewall_score
) VALUES (
  auth.uid(),
  'arjun_test',
  5,
  2,
  3,
  10,
  9,
  50,
  18,
  7,
  1,
  6,
  11,
  5
)
ON CONFLICT (user_id) DO UPDATE SET
  ctf_solved_count = 5,
  phish_solved_count = 2,
  code_solved_count = 3,
  quiz_correct = 9,
  total_score = 18;

SELECT '=== VERIFY WRITE ===' as step;
SELECT 
  user_id,
  username,
  ctf_solved_count,
  phish_solved_count,
  code_solved_count,
  quiz_correct,
  total_score
FROM leaderboard_scores
WHERE user_id = auth.uid();

SELECT '✅ TEST COMPLETE - If you see data above, database writes work!' as result;
