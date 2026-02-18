-- ============================================
-- VERIFY AND FIX RLS POLICIES
-- ============================================

-- Check current RLS status
SELECT '=== RLS STATUS ===' as step;
SELECT 
  tablename,
  rowsecurity
FROM pg_tables
WHERE tablename IN ('leaderboard_scores', 'user_profiles')
ORDER BY tablename;

-- Check existing policies
SELECT '=== EXISTING POLICIES ===' as step;
SELECT 
  tablename,
  policyname,
  permissive,
  roles,
  qual::TEXT as rule,
  with_check::TEXT as with_check
FROM pg_policies
WHERE tablename = 'leaderboard_scores'
ORDER BY policyname;

-- Verify authenticated user can UPDATE
SELECT '=== TEST UPDATE PERMISSION ===' as step;
UPDATE leaderboard_scores
SET total_score = 0
WHERE user_id = auth.uid();

SELECT 'UPDATE TEST: If no error above, policy allows UPDATE' as result;

-- Verify authenticated user can INSERT
SELECT '=== TEST INSERT PERMISSION ===' as step;
-- This will fail if authenticated user already exists, which is expected
INSERT INTO leaderboard_scores (user_id, username, total_score)
VALUES (auth.uid(), 'test_user', 0)
ON CONFLICT (user_id) DO NOTHING;

SELECT 'INSERT TEST: If no error above, policy allows INSERT' as result;

-- Check if there's a policy issue preventing updates
SELECT '=== CHECKING FOR POLICY ISSUES ===' as step;
SELECT 
  tablename,
  policyname,
  permissive,
  roles,
  qual::TEXT as rule
FROM pg_policies
WHERE tablename = 'leaderboard_scores'
AND (policyname LIKE '%update%' OR policyname LIKE '%delete%');

SELECT '=== DONE ===' as step;
