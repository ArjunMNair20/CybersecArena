-- ============================================
-- CHECK WHAT'S ACTUALLY IN THE DATABASE
-- ============================================

SELECT '=== ALL USERS AND THEIR SCORES ===' as step;
SELECT 
  username,
  ctf_solved_count,
  phish_solved_count,
  code_solved_count,
  quiz_correct,
  total_score
FROM leaderboard_scores
ORDER BY total_score DESC;

SELECT '=== CHECK FOR YOUR SPECIFIC USER ===' as step;
SELECT 
  user_id,
  username,
  ctf_solved_count,
  phish_solved_count,
  code_solved_count,
  quiz_correct,
  quiz_answered,
  firewall_best_score,
  total_score
FROM leaderboard_scores
WHERE username ILIKE '%arjun%'
ORDER BY username;

SELECT '=== SUMMARY ===' as step;
SELECT 
  COUNT(*) as total_users,
  COUNT(CASE WHEN total_score > 0 THEN 1 END) as users_with_scores,
  MAX(total_score) as highest_score,
  AVG(total_score)::INT as average_score
FROM leaderboard_scores;
