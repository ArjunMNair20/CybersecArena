-- ============================================
-- MANUAL POPULATE TEST DATA (if needed)
-- ============================================
-- If auto-sync isn't working, use this to manually add your actual progress

-- First, check your actual username
SELECT '=== YOUR USERNAME ===' as step;
SELECT 
  username,
  user_id,
  ctf_solved_count,
  phish_solved_count,
  code_solved_count,
  quiz_correct,
  total_score
FROM leaderboard_scores
WHERE username ILIKE '%arjun%'
ORDER BY username;

-- If you want to manually update your scores, copy your exact username from above
-- and run this (replace with YOUR actual progress counts):
SELECT '=== MANUAL UPDATE TEMPLATE ===' as step;

-- EXAMPLE - Replace counts with YOUR actual values:
-- UPDATE leaderboard_scores
-- SET 
--   ctf_solved_count = 9,
--   phish_solved_count = 2,
--   code_solved_count = 3,
--   quiz_correct = 9,
--   firewall_best_score = 50,
--   ctf_score = 13,
--   phish_score = 1,
--   code_score = 6,
--   quiz_score = 11,
--   firewall_score = 5,
--   total_score = 7
-- WHERE username = 'arjun_m_nair';

-- Verify update happened
SELECT '=== VERIFY ===' as step;
SELECT 
  username,
  ctf_solved_count,
  phish_solved_count,
  code_solved_count,
  quiz_correct,
  total_score
FROM leaderboard_scores
ORDER BY total_score DESC;
