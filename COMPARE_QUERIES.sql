-- DIAGNOSTIC: Check if the VIEW is filtering out users
-- This compares different query approaches

-- ============================================
-- Query 1: Direct from leaderboard_scores table (no view)
-- ============================================
SELECT 
  'Direct Query' as source,
  ROW_NUMBER() OVER (ORDER BY total_score DESC) as rank,
  user_id,
  username,
  total_score,
  ctf_solved_count,
  phish_solved_count,
  code_solved_count
FROM leaderboard_scores
ORDER BY total_score DESC;

-- Count: Should be 5
SELECT 'Direct Count' as check, COUNT(*) as count FROM leaderboard_scores;

-- ============================================
-- Query 2: With LEFT JOIN to profiles (no view)
-- ============================================
SELECT 
  'With Profiles JOIN' as source,
  ROW_NUMBER() OVER (ORDER BY ls.total_score DESC) as rank,
  ls.user_id,
  ls.username,
  up.name,
  ls.total_score,
  up.username as profile_username
FROM leaderboard_scores ls
LEFT JOIN user_profiles up ON ls.user_id = up.id
ORDER BY ls.total_score DESC;

-- ============================================
-- Query 3: Using the view (what the app uses)
-- ============================================
SELECT 
  'From View' as source,
  rank,
  user_id,
  username,
  name,
  total_score
FROM leaderboard_view;

-- Count: What does the view return?
SELECT 'View Count' as check, COUNT(*) as count FROM leaderboard_view;

-- ============================================
-- Query 4: Check for problematic data
-- ============================================

-- Users with NULL or empty username
SELECT 
  'NULL Username' as issue,
  user_id,
  username,
  total_score
FROM leaderboard_scores
WHERE username IS NULL OR username = '';

-- Users with NULL profile
SELECT 
  'NULL Profile' as issue,
  ls.user_id,
  ls.username,
  up.id as profile_id
FROM leaderboard_scores ls
LEFT JOIN user_profiles up ON ls.user_id = up.id
WHERE up.id IS NULL;

-- ============================================
-- Query 5: Show ALL data about all users
-- ============================================
SELECT 
  au.id as user_id,
  au.email,
  up.username,
  up.name,
  ls.user_id as in_leaderboard,
  ls.total_score,
  up_prog.user_id as has_progress
FROM auth.users au
LEFT JOIN user_profiles up ON au.id = up.id
LEFT JOIN leaderboard_scores ls ON au.id = ls.user_id
LEFT JOIN user_progress up_prog ON au.id = up_prog.user_id
ORDER BY au.created_at;
