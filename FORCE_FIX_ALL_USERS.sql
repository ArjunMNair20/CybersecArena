-- IMMEDIATE FIX: Force create all missing users in leaderboard
-- Run this NOW in Supabase SQL Editor

-- ============================================
-- STEP 1: Check current state
-- ============================================

-- How many users should there be?
SELECT 'Total Auth Users' as check_type, COUNT(*) as count FROM auth.users;

-- How many have profiles?
SELECT 'Users with Profiles' as check_type, COUNT(*) as count FROM user_profiles;

-- How many in leaderboard?
SELECT 'Users in Leaderboard' as check_type, COUNT(*) as count FROM leaderboard_scores;

-- ============================================
-- STEP 2: Show which users are MISSING from leaderboard
-- ============================================

SELECT 
  'MISSING USERS' as status,
  au.id,
  au.email,
  up.username,
  up.name
FROM auth.users au
LEFT JOIN user_profiles up ON au.id = up.id
LEFT JOIN leaderboard_scores ls ON au.id = ls.user_id
WHERE ls.user_id IS NULL
ORDER BY au.created_at;

-- ============================================
-- STEP 3: FORCE CREATE missing entries
-- ============================================

-- Delete any incomplete entries first
DELETE FROM leaderboard_scores 
WHERE user_id IN (
  SELECT au.id FROM auth.users au 
  LEFT JOIN user_profiles up ON au.id = up.id
  WHERE up.username IS NULL OR up.username = ''
);

-- Now create ALL users in leaderboard from scratch if needed
INSERT INTO leaderboard_scores (
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
  quiz_correct,
  firewall_best_score,
  badges
)
SELECT 
  au.id,
  COALESCE(up.username, 'user_' || substr(au.id::text, 1, 8)),
  0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0,
  '{}'
FROM auth.users au
LEFT JOIN user_profiles up ON au.id = up.id
LEFT JOIN leaderboard_scores ls ON au.id = ls.user_id
WHERE ls.user_id IS NULL
  AND (up.id IS NOT NULL OR up.id IS NULL)  -- Include all users, even without confirmed profile
ON CONFLICT (user_id) DO NOTHING;

-- ============================================
-- STEP 4: Verify all users now exist
-- ============================================

SELECT COUNT(*) as total_in_leaderboard FROM leaderboard_scores;

-- Show all 5 users
SELECT 
  ROW_NUMBER() OVER (ORDER BY ls.total_score DESC) as rank,
  ls.user_id,
  ls.username,
  COALESCE(up.name, ls.username) as display_name,
  ls.total_score
FROM leaderboard_scores ls
LEFT JOIN user_profiles up ON ls.user_id = up.id
ORDER BY ls.total_score DESC;

-- ============================================
-- STEP 5: Check the view - does it return all 5?
-- ============================================

SELECT COUNT(*) as view_count FROM leaderboard_view;

SELECT 
  rank,
  user_id,
  username,
  name,
  total_score
FROM leaderboard_view;
