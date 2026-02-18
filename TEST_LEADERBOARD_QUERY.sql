-- Test the actual leaderboard_scores query
-- Run this in Supabase SQL Editor to see what data exists

-- Check 1: Can we read from leaderboard_scores?
SELECT COUNT(*) as total_count FROM leaderboard_scores;

-- Check 2: What's actually in leaderboard_scores?
SELECT 
  id,
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
  quiz_correct
FROM leaderboard_scores
ORDER BY total_score DESC
LIMIT 10;

-- Check 3: Can we read from user_profiles?
SELECT COUNT(*) as profile_count FROM user_profiles;

-- Check 4: Join test - does the join work?
SELECT 
  ls.user_id,
  ls.username,
  ls.total_score,
  up.name,
  up.avatar_url
FROM leaderboard_scores ls
LEFT JOIN user_profiles up ON ls.user_id = up.id
ORDER BY ls.total_score DESC
LIMIT 10;

-- Check 5: Check RLS policies  
SELECT 
  schemaname,
  tablename,
  permissive,
  pol_name,
  qual
FROM pg_policies
WHERE tablename IN ('leaderboard_scores', 'user_profiles')
ORDER BY tablename;
