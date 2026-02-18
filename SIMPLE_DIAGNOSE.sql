-- LEADERBOARD DIAGNOSIS - RUN EACH QUERY SEPARATELY

-- 1. Check row counts in tables
SELECT 'signup' as table_name, COUNT(*) as row_count FROM signup
UNION ALL
SELECT 'user_profiles' as table_name, COUNT(*) as row_count FROM user_profiles
UNION ALL
SELECT 'leaderboard_scores' as table_name, COUNT(*) as row_count FROM leaderboard_scores;

-- 2. Show all leaderboard_scores data
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

-- 3. Show all user_profiles
SELECT 
  id,
  username,
  name,
  email
FROM user_profiles
ORDER BY username;

-- 4. Check RLS policies
SELECT 
  tablename,
  policyname,
  permissive,
  roles
FROM pg_policies
WHERE tablename IN ('leaderboard_scores', 'user_profiles')
ORDER BY tablename, policyname;

-- 5. Test raw SELECT from leaderboard_scores
SELECT * FROM leaderboard_scores LIMIT 5;

-- 6. Test leaderboard_view
SELECT * FROM leaderboard_view LIMIT 5;
