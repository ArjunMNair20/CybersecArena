-- IMMEDIATE COMPLETE FIX - Run this NOW
-- This will show what's wrong and fix it immediately
-- Copy-paste entire script into Supabase SQL Editor and run

-- ============================================
-- CHECK 1: Assess the current situation
-- ============================================
WITH user_summary AS (
  SELECT 
    (SELECT COUNT(*) FROM auth.users) as total_users,
    (SELECT COUNT(*) FROM user_profiles) as users_with_profiles,
    (SELECT COUNT(*) FROM leaderboard_scores) as users_in_leaderboard,
    (SELECT COUNT(*) FROM leaderboard_view) as users_in_view
)
SELECT 
  'Current State' as status,
  total_users, 
  users_with_profiles, 
  users_in_leaderboard, 
  users_in_view
FROM user_summary;

-- ============================================
-- CHECK 2: List user status
-- ============================================
SELECT 
  ROW_NUMBER() OVER (ORDER BY au.created_at) as user_num,
  au.id,
  SUBSTRING(au.email, 1, 20) as email,
  up.username,
  CASE 
    WHEN ls.user_id IS NOT NULL THEN '✓ In Leaderboard'
    ELSE '✗ MISSING from Leaderboard'
  END as status
FROM auth.users au
LEFT JOIN user_profiles up ON au.id = up.id
LEFT JOIN leaderboard_scores ls ON au.id = ls.user_id
ORDER BY au.created_at;

-- ============================================
-- FIX STEP 1: Ensure all users have profiles
-- ============================================
-- Create profiles for any auth users without them
INSERT INTO user_profiles (id, username, email, name)
SELECT 
  au.id,
  COALESCE('user_' || substr(au.id::text, 1, 8), 'user_unknown'),
  au.email,
  au.raw_user_meta_data->>'name'
FROM auth.users au
LEFT JOIN user_profiles up ON au.id = up.id
WHERE up.id IS NULL
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- FIX STEP 2: Create leaderboard entries for ALL users
-- ============================================
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
ON CONFLICT (user_id) DO NOTHING;

-- ============================================
-- VERIFY FIX: Check the results
-- ============================================
WITH fixed_state AS (
  SELECT 
    (SELECT COUNT(*) FROM leaderboard_scores) as leaderboard_count,
    (SELECT COUNT(*) FROM leaderboard_view) as view_count
)
SELECT 
  'After Fix' as status,
  leaderboard_count,
  view_count,
  CASE 
    WHEN leaderboard_count = 5 THEN '✓ All 5 users in leaderboard'
    WHEN view_count = 5 THEN '✓ All 5 users visible in view'
    ELSE '⚠ Still missing users - see detailed list below'
  END as result
FROM fixed_state;

-- ============================================
-- SHOW ALL 5 USERS FROM LEADERBOARD TABLE
-- ============================================
SELECT 
  '=== LEADERBOARD_SCORES TABLE ===' as section,
  ROW_NUMBER() OVER (ORDER BY total_score DESC) as rank,
  user_id,
  username,
  total_score,
  ctf_solved_count,
  phish_solved_count
FROM leaderboard_scores
ORDER BY total_score DESC;

-- ============================================
-- SHOW ALL 5 USERS FROM VIEW
-- ============================================
SELECT 
  '=== LEADERBOARD_VIEW ===' as section,
  rank,
  user_id,
  username,
  name,
  total_score
FROM leaderboard_view;

-- ============================================
-- FINAL CHECK: Direct counts
-- ============================================
SELECT 'leaderboard_scores count' as check_name, COUNT(*) as count FROM leaderboard_scores
UNION ALL
SELECT 'leaderboard_view count', COUNT(*) FROM leaderboard_view
UNION ALL
SELECT 'auth.users count', COUNT(*) FROM auth.users
UNION ALL
SELECT 'user_profiles count', COUNT(*) FROM user_profiles;
