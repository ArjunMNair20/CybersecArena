-- ============================================
-- URGENT DIAGNOSIS: FIND THE BLOCKING ISSUE
-- ============================================

-- 1. CHECK: Do users exist in all required tables?
SELECT '=== CHECKING USERS EXIST ===' as check_name;

SELECT 
  'signup' as table_name,
  COUNT(*) as count
FROM signup
UNION ALL
SELECT 
  'user_profiles' as table_name,
  COUNT(*) as count
FROM user_profiles
UNION ALL
SELECT 
  'leaderboard_scores' as table_name,
  COUNT(*) as count
FROM leaderboard_scores;

-- 2. CHECK: What's the current state of leaderboard_scores?
SELECT '=== LEADERBOARD_SCORES DATA ===' as check_name;
SELECT 
  id,
  user_id,
  username,
  total_score,
  ctf_solved_count,
  phish_solved_count,
  code_solved_count,
  quiz_correct,
  firewall_best_score,
  last_updated
FROM leaderboard_scores
ORDER BY username;

-- 3. CHECK: What users are in user_profiles?
SELECT '=== USER_PROFILES ===' as check_name;
SELECT 
  id,
  username,
  name,
  email,
  created_at
FROM user_profiles
ORDER BY username;

-- 4. CHECK: RLS Policies - are they blocking SELECT?
SELECT '=== RLS POLICIES STATUS ===' as check_name;
SELECT 
  tablename,
  policyname,
  permissive,
  roles,
  SUBSTRING(qual::text, 1, 50) as policy_condition
FROM pg_policies
WHERE tablename IN ('leaderboard_scores', 'user_profiles')
ORDER BY tablename, policyname;

-- 5. CHECK: Can we SELECT from leaderboard_scores without auth?
SELECT '=== ATTEMPTING RAW SELECT ===' as check_name;
SELECT * FROM leaderboard_scores LIMIT 5;

-- 6. CHECK: Does leaderboard_view exist and work?
SELECT '=== LEADERBOARD_VIEW TEST ===' as check_name;
SELECT * FROM leaderboard_view LIMIT 5;

-- 7. CHECK: User ID format - are they using UUID or something else?
SELECT '=== USER ID FORMAT ===' as check_name;

SELECT 
  'signup' as table_name,
  id,
  id::text as id_text,
  pg_typeof(id) as id_type
FROM signup
LIMIT 1
UNION ALL
SELECT 
  'user_profiles' as table_name,
  id,
  id::text as id_text,
  pg_typeof(id) as id_type
FROM user_profiles
LIMIT 1
UNION ALL
SELECT 
  'leaderboard_scores' as table_name,
  user_id,
  user_id::text as id_text,
  pg_typeof(user_id) as id_type
FROM leaderboard_scores
LIMIT 1;

-- 8. CHECK: Mismatch - compare IDs between tables
SELECT '=== CHECKING ID MISMATCHES ===' as check_name;
SELECT 
  p.id as profile_id,
  p.username as profile_username,
  l.user_id as leaderboard_user_id,
  l.username as leaderboard_username,
  CASE 
    WHEN p.id = l.user_id THEN 'MATCH'
    ELSE 'MISMATCH!'
  END as id_match
FROM user_profiles p
LEFT JOIN leaderboard_scores l ON p.id = l.user_id
ORDER BY p.username;
