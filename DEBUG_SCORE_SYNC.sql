-- ============================================
-- VERIFY SYNC IS WORKING & DEBUG SCORES
-- ============================================

-- Step 1: Check if scoring is happening correctly
SELECT '=== LEADERBOARD CURRENT STATE ===' as info;
SELECT 
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
  quiz_correct,
  firewall_best_score
FROM leaderboard_scores
ORDER BY username;

-- Step 2: Check leaderboard_view
SELECT '=== LEADERBOARD VIEW ===' as info;
SELECT 
  rank,
  username,
  name,
  total_score,
  ctf_score,
  phish_score,
  code_score,
  quiz_score,
  firewall_score,
  ctf_solved_count,
  phish_solved_count,
  code_solved_count,
  quiz_correct
FROM leaderboard_view
ORDER BY rank;

-- Step 3: Check user_profiles to ensure all users are linked
SELECT '=== USER PROFILES ===' as info;
SELECT 
  id,
  username,
  name,
  email
FROM user_profiles
ORDER BY username;

-- Step 4: Verify RLS policies are permissive
SELECT '=== RLS POLICIES ===' as info;
SELECT 
  tablename,
  policyname,
  permissive,
  roles,
  qual
FROM pg_policies
WHERE tablename IN ('leaderboard_scores', 'user_profiles', 'leaderboard_view')
ORDER BY tablename, policyname;

-- Step 5: Check if any errors in data
SELECT '=== DATA INTEGRITY CHECK ===' as info;
SELECT 
  'leaderboard_scores' as table_name,
  COUNT(*) as total_rows,
  COUNT(CASE WHEN total_score > 0 THEN 1 END) as rows_with_score,
  COUNT(CASE WHEN total_score = 0 THEN 1 END) as rows_zero_score,
  COUNT(CASE WHEN user_id IS NULL THEN 1 END) as null_user_ids
FROM leaderboard_scores;
