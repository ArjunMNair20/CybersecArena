-- ============================================
-- SIMPLE LEADERBOARD DIAGNOSTIC
-- ============================================

-- Check table schema
SELECT '=== LEADERBOARD_SCORES COLUMNS ===' as step;
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'leaderboard_scores'
ORDER BY ordinal_position;

-- Check RLS status
SELECT '=== TABLE RLS STATUS ===' as step;
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE tablename = 'leaderboard_scores';

-- Check RLS policies
SELECT '=== ACTIVE RLS POLICIES ===' as step;
SELECT 
  policyname,
  permissive,
  roles,
  cmd as operation,
  qual::TEXT as rule
FROM pg_policies
WHERE tablename = 'leaderboard_scores'
ORDER BY policyname;

-- Check current data
SELECT '=== ALL USERS IN LEADERBOARD ===' as step;
SELECT 
  username,
  ctf_solved_count,
  phish_solved_count,
  code_solved_count,
  quiz_correct,
  total_score
FROM leaderboard_scores
ORDER BY total_score DESC;

SELECT '=== DONE ===' as step;
