-- ============================================
-- RESET LEADERBOARD AND PREP FOR FRESH SYNC
-- ============================================

-- Step 1: Clear all test data from leaderboard_scores
-- Reset all scores and progress counts to 0
UPDATE leaderboard_scores
SET 
  total_score = 0,
  ctf_score = 0,
  phish_score = 0,
  code_score = 0,
  quiz_score = 0,
  firewall_score = 0,
  ctf_solved_count = 0,
  phish_solved_count = 0,
  code_solved_count = 0,
  quiz_answered = 0,
  quiz_correct = 0,
  firewall_best_score = 0,
  badges = '[]'::jsonb;

-- Step 2: Verify all scores are reset to 0
SELECT '=== LEADERBOARD RESET TO ZERO ===' as info;
SELECT 
  username,
  total_score,
  ctf_solved_count,
  phish_solved_count,
  code_solved_count,
  quiz_correct,
  firewall_best_score
FROM leaderboard_scores
ORDER BY username;

-- Step 3: Show current state
SELECT '=== SUMMARY ===' as info;
SELECT 
  COUNT(*) as total_users,
  SUM(total_score) as combined_score,
  MAX(total_score) as max_score,
  AVG(total_score) as avg_score
FROM leaderboard_scores;
