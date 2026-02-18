-- ============================================
-- RESET TEST DATA - Remove 999 from amal123
-- ============================================

-- Check current state
SELECT '=== BEFORE RESET ===' as step;
SELECT 
  user_id,
  username,
  ctf_solved_count,
  total_score
FROM leaderboard_scores
WHERE username = 'amal123'
LIMIT 1;

-- Reset amal123 to 0 (she has no real progress yet)
UPDATE leaderboard_scores
SET 
  ctf_solved_count = 0,
  phish_solved_count = 0,
  code_solved_count = 0,
  quiz_answered = 0,
  quiz_correct = 0,
  firewall_best_score = 0,
  total_score = 0,
  ctf_score = 0,
  phish_score = 0,
  code_score = 0,
  quiz_score = 0,
  firewall_score = 0
WHERE username = 'amal123';

-- Verify reset worked
SELECT '=== AFTER RESET ===' as step;
SELECT 
  user_id,
  username,
  ctf_solved_count,
  total_score
FROM leaderboard_scores
WHERE username = 'amal123'
LIMIT 1;

-- Show all users now
SELECT '=== ALL USERS ===' as step;
SELECT 
  username,
  ctf_solved_count,
  phish_solved_count,
  code_solved_count,
  quiz_correct,
  total_score
FROM leaderboard_scores
ORDER BY total_score DESC;
