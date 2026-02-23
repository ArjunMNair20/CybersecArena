-- ============================================
-- FIX: Enable public read access to leaderboard_scores
-- ============================================
-- Run this to allow the app to READ leaderboard data

SELECT '=== CURRENT RLS STATUS ===' as step;
SELECT 
  tablename,
  rowsecurity
FROM pg_tables
WHERE tablename = 'leaderboard_scores';

SELECT '=== CURRENT POLICIES ===' as step;
SELECT 
  policyname,
  cmd,
  roles,
  qual::TEXT as using_clause
FROM pg_policies
WHERE tablename = 'leaderboard_scores'
ORDER BY policyname;

-- Drop problematic policies if they exist
DROP POLICY IF EXISTS "Allow public read access" ON public.leaderboard_scores;
DROP POLICY IF EXISTS "Allow authenticated users to read all scores" ON public.leaderboard_scores;
DROP POLICY IF EXISTS "Allow users to read leaderboard" ON public.leaderboard_scores;

-- Create simple policies
-- 1. Allow ALL authenticated users to READ all scores (needed for leaderboard display)
CREATE POLICY "public_read_leaderboard" ON public.leaderboard_scores
  FOR SELECT
  USING (true);

-- 2. Allow authenticated users to UPDATE only their own scores
CREATE POLICY "users_update_own_scores" ON public.leaderboard_scores
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 3. Allow authenticated users to INSERT their own scores
CREATE POLICY "users_insert_own_scores" ON public.leaderboard_scores
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

SELECT '=== NEW POLICIES CREATED ===' as step;
SELECT 
  policyname,
  cmd,
  roles,
  qual::TEXT as using_clause
FROM pg_policies
WHERE tablename = 'leaderboard_scores'
ORDER BY policyname;

-- Test: Can we read?
SELECT '=== TEST READ ===' as step;
SELECT COUNT(*) as "Can_we_read_scores_now" FROM public.leaderboard_scores;

SELECT '✅ POLICIES UPDATED - APP SHOULD NOW SEE LEADERBOARD DATA' as result;
