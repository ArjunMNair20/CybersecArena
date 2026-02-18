-- QUICK DIAGNOSIS (30 seconds)
-- Run this in Supabase SQL Editor to see exactly what's happening

-- Question 1: Do all 5 users exist?
SELECT 'How many auth users?' as question, COUNT(*) as answer FROM auth.users;

-- Question 2: Do all 5 have leaderboard entries?
SELECT 'Users in leaderboard_scores?' as question, COUNT(*) as answer FROM leaderboard_scores;

-- Question 3: Why are only 3 showing? (Missing users breakdown)
SELECT 'MISSING USERS - not in leaderboard_scores:' as analysis, COUNT(*) as count
FROM auth.users au
WHERE au.id NOT IN (SELECT user_id FROM leaderboard_scores);

-- Question 4: Show exactly which users are missing
SELECT 
  'Missing User Details' as type,
  au.id,
  au.email,
  up.username
FROM auth.users au
LEFT JOIN user_profiles up ON au.id = up.id
WHERE au.id NOT IN (SELECT user_id FROM leaderboard_scores);

-- Question 5: The 3 that ARE showing - what's in leaderboard for them?
SELECT 
  'Users IN leaderboard_scores' as type,
  user_id,
  username,
  total_score,
  ctf_solved_count,
  phish_solved_count
FROM leaderboard_scores
ORDER BY total_score DESC;
