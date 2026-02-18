    -- ============================================
-- RESET DATABASE AND CLEAR TEST DATA
-- ============================================
-- Reset all leaderboard_scores to 0 to prepare for fresh sync

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

-- Verify reset worked
SELECT '=== RESET COMPLETE ===' as step;
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
