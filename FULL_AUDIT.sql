-- ============================================
-- FULL DATABASE AUDIT & DIAGNOSTIC
-- ============================================

SELECT '=== ROW COUNT ===' as step;
SELECT COUNT(*) as total_users FROM leaderboard_scores;

SELECT '=== ALL DATA IN DATABASE ===' as step;
SELECT 
  user_id,
  username,
  ctf_solved_count,
  phish_solved_count,
  code_solved_count,
  quiz_correct,
  total_score
FROM leaderboard_scores
ORDER BY total_score DESC;

SELECT '=== CHECK IF DATA EXISTS ===' as step;
SELECT 
  CASE 
    WHEN COUNT(*) = 0 THEN '❌ NO DATA IN DATABASE'
    WHEN COUNT(*) > 0 THEN '✅ ' || COUNT(*) || ' USERS FOUND'
  END as status
FROM leaderboard_scores;

SELECT '=== RLS POLICIES FOR leaderboard_scores ===' as step;
SELECT 
  policyname,
  permissive,
  roles,
  cmd as operation,
  qual::TEXT as rule,
  with_check::TEXT as with_check
FROM pg_policies
WHERE tablename = 'leaderboard_scores'
ORDER BY policyname;

SELECT '=== RLS ENABLED? ===' as step;
SELECT 
  tablename,
  rowsecurity as "RLS_Enabled"
FROM pg_tables
WHERE tablename = 'leaderboard_scores';

SELECT '✅ DIAGNOSTIC COMPLETE' as done;
