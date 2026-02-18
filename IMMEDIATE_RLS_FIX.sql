-- ============================================
-- IMMEDIATE RLS FIX FOR LEADERBOARD
-- ============================================
-- Run this entire script in Supabase SQL Editor to fix RLS issues

-- Step 1: Remove any conflicting restrictions
-- ============================================
DROP POLICY IF EXISTS "Only authenticated users can view leaderboard" ON leaderboard_scores;
DROP POLICY IF EXISTS "Leaderboard is read-only" ON leaderboard_scores;
DROP POLICY IF EXISTS "Read all leaderboard" ON leaderboard_scores;

-- Step 2: Create permissive SELECT policy for leaderboard_scores
-- ============================================
DROP POLICY IF EXISTS "Anyone can view leaderboard" ON leaderboard_scores;

CREATE POLICY "Anyone can view leaderboard"
  ON leaderboard_scores FOR SELECT
  TO authenticated
  USING (true);

-- Step 3: Ensure user_profiles is also readable
-- ============================================
DROP POLICY IF EXISTS "Authenticated users can view public profiles" ON user_profiles;
DROP POLICY IF EXISTS "Public read profiles" ON user_profiles;

CREATE POLICY "Authenticated users can view all profiles"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (true);

-- Step 4: Verify policies are set correctly
-- ============================================
SELECT 
  tablename,
  policyname,
  permissive,
  roles
FROM pg_policies 
WHERE tablename IN ('leaderboard_scores', 'user_profiles')
ORDER BY tablename, policyname;

-- Step 5: Test that data can be fetched
-- ============================================
-- This should return a number > 0
SELECT 
  COUNT(*) as leaderboard_count,
  MAX(total_score) as highest_score
FROM leaderboard_scores;

-- Step 6: Test the view works
-- ============================================
-- This should also return > 0
SELECT 
  COUNT(*) as view_count,
  MAX(total_score) as highest_view_score
FROM leaderboard_view;

-- Step 7: Show actual data
-- ============================================
SELECT 
  rank() OVER (ORDER BY total_score DESC) as rank,
  username,
  total_score,
  ctf_score,
  phish_score,
  code_score,
  quiz_score
FROM leaderboard_view
ORDER BY total_score DESC
LIMIT 10;

-- ============================================
-- ALTERNATIVE FIX: If above doesn't work, try this
-- ============================================
-- Some Supabase versions need explicit grants
-- GRANT SELECT ON leaderboard_scores TO authenticated;
-- GRANT SELECT ON user_profiles TO authenticated;
-- GRANT SELECT ON leaderboard_view TO authenticated;
