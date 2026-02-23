-- ============================================
-- FULL DIAGNOSTIC - CHECK EVERYTHING
-- ============================================

SELECT '=== 1. CHECK DATABASE STATE ===' as step;
SELECT 
  COUNT(*) as total_users,
  COUNT(CASE WHEN total_score > 0 THEN 1 END) as users_with_scores,
  SUM(CASE WHEN ctf_solved_count > 0 THEN 1 ELSE 0 END) as users_with_ctf,
  MAX(total_score) as max_score
FROM leaderboard_scores;

SELECT '=== 2. SHOW ALL DATA ===' as step;
SELECT 
  username,
  ctf_solved_count,
  phish_solved_count,
  code_solved_count,
  quiz_correct,
  total_score
FROM leaderboard_scores
ORDER BY total_score DESC;

SELECT '=== 3. CHECK RLS POLICIES ===' as step;
SELECT 
  policyname,
  cmd,
  CASE WHEN qual IS NULL THEN 'No restriction' ELSE qual::TEXT END as rule
FROM pg_policies
WHERE tablename = 'leaderboard_scores'
ORDER BY policyname;

SELECT '=== 4. CHECK RLS STATUS ===' as step;
SELECT 
  tablename,
  rowsecurity
FROM pg_tables
WHERE tablename = 'leaderboard_scores';

SELECT '=== 5. CAN WE READ? ===' as step;
SELECT COUNT(*) as "Records_readable" FROM public.leaderboard_scores;

SELECT '✅ DIAGNOSTIC COMPLETE' as done;
