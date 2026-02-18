-- Diagnostic: Find missing users from leaderboard
-- Run this in Supabase SQL Editor to see which users are missing

-- Check 1: How many authenticated users exist?
SELECT COUNT(*) as total_auth_users FROM auth.users;

-- Check 2: How many have profiles?
SELECT COUNT(*) as total_profiles FROM user_profiles;

-- Check 3: How many have leaderboard entries?
SELECT COUNT(*) as total_leaderboard_entries FROM leaderboard_scores;

-- Check 4: Find users who DON'T have leaderboard entries
SELECT 
  au.id,
  au.email,
  COALESCE(up.username, 'NO PROFILE') as username,
  CASE WHEN ls.user_id IS NULL THEN 'MISSING' ELSE 'EXISTS' END as leaderboard_status
FROM auth.users au
LEFT JOIN user_profiles up ON au.id = up.id
LEFT JOIN leaderboard_scores ls ON au.id = ls.user_id
WHERE ls.user_id IS NULL  -- Users WITHOUT leaderboard entries
ORDER BY au.created_at DESC;

-- Check 5: List all leaderboard entries (should show all 5)
SELECT 
  ls.user_id,
  ls.username,
  up.name,
  ls.total_score,
  ls.last_updated
FROM leaderboard_scores ls
LEFT JOIN user_profiles up ON ls.user_id = up.id
ORDER BY ls.total_score DESC;

-- Check 6: View data - what does leaderboard_view return?
SELECT 
  user_id,
  username,
  name,
  total_score,
  rank
FROM leaderboard_view
ORDER BY rank;
