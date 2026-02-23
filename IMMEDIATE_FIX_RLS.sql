-- ======================================================
-- IMMEDIATE FIX: RLS Policies for Leaderboard Sync
-- ======================================================
-- Run this in Supabase SQL Editor RIGHT NOW
-- This will enable authenticated users to write to leaderboard_scores
-- ======================================================

-- STEP 1: Disable RLS temporarily to check policies
ALTER TABLE leaderboard_scores DISABLE ROW LEVEL SECURITY;

-- STEP 2: Drop all existing policies (clean slate)
DROP POLICY IF EXISTS "public_read_leaderboard" ON leaderboard_scores;
DROP POLICY IF EXISTS "public_read" ON leaderboard_scores;
DROP POLICY IF EXISTS "leaderboard_read_policy" ON leaderboard_scores;
DROP POLICY IF EXISTS "leaderboard_update_own_policy" ON leaderboard_scores;
DROP POLICY IF EXISTS "leaderboard_insert_own_policy" ON leaderboard_scores;
DROP POLICY IF EXISTS "authenticated_read" ON leaderboard_scores;
DROP POLICY IF EXISTS "authenticated_update" ON leaderboard_scores;
DROP POLICY IF EXISTS "authenticated_insert" ON leaderboard_scores;
DROP POLICY IF EXISTS "update_own_score" ON leaderboard_scores;
DROP POLICY IF EXISTS "insert_own_score" ON leaderboard_scores;

SELECT 'All policies dropped' as status;

-- STEP 3: Re-enable RLS
ALTER TABLE leaderboard_scores ENABLE ROW LEVEL SECURITY;

SELECT 'RLS enabled' as status;

-- STEP 4: Create new, working policies
-- Policy 1: Anyone authenticated can READ all scores
CREATE POLICY "allow_read_all" ON leaderboard_scores
  FOR SELECT
  USING (true);  -- Allow all authenticated users to read

SELECT 'Policy 1: allow_read_all created' as status;

-- Policy 2: Users can UPDATE only their own score
CREATE POLICY "allow_update_own" ON leaderboard_scores
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

SELECT 'Policy 2: allow_update_own created' as status;

-- Policy 3: Users can INSERT their own score
CREATE POLICY "allow_insert_own" ON leaderboard_scores
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

SELECT 'Policy 3: allow_insert_own created' as status;

-- STEP 5: Verify all policies are created
SELECT 
  policyname,
  permissive,
  roles,
  qual as "SELECT USING",
  with_check as "WITH CHECK"
FROM pg_policies 
WHERE tablename = 'leaderboard_scores'
ORDER BY policyname;

-- ======================================================
-- FINAL VERIFICATION
-- ======================================================
-- Count total policies
SELECT COUNT(*) as "Total Policies for leaderboard_scores" FROM pg_policies 
WHERE tablename = 'leaderboard_scores';

-- Check RLS is enabled
SELECT 
  schemaname,
  tablename,
  rowsecurity as "RLS Enabled?"
FROM pg_tables 
WHERE tablename = 'leaderboard_scores';

-- ======================================================
-- SUCCESS MESSAGE
-- ======================================================
-- If you see:
-- ✅ 3 policies listed
-- ✅ RLS Enabled? = true
-- 
-- Then the fix is complete!
-- Now go to Leaderboard and click "Sync My Progress"
-- Your scores should now save!
-- ======================================================
