-- ============================================
-- LEADERBOARD RLS DIAGNOSTIC & FIX
-- ============================================
-- This script identifies RLS issues preventing leaderboard data from being fetched

-- 1. CHECK RLS POLICIES ON LEADERBOARD TABLES
-- ============================================
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  qual,
  with_check
FROM pg_policies 
WHERE tablename IN ('leaderboard_scores', 'user_profiles', 'user_progress', 'leaderboard_view')
ORDER BY tablename, policyname;

-- 2. CHECK RLS ENABLED/DISABLED
-- ============================================
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE tablename IN ('leaderboard_scores', 'user_profiles', 'user_progress')
ORDER BY tablename;

-- 3. TEST LEADERBOARD QUERY - Check if it returns data
-- ============================================
SELECT 
  COUNT(*) as total_entries,
  COUNT(CASE WHEN total_score > 0 THEN 1 END) as entries_with_score
FROM leaderboard_scores;

-- 4. TEST LEADERBOARD VIEW - Check if view works
-- ============================================
SELECT 
  COUNT(*) as view_entries,
  COUNT(CASE WHEN total_score > 0 THEN 1 END) as view_entries_with_score
FROM leaderboard_view;

-- 5. DETAILED LEADERBOARD DATA CHECK
-- ============================================
SELECT 
  user_id,
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
ORDER BY total_score DESC
LIMIT 10;

-- 6. CHECK USER_PROFILES RLS (might block view)
-- ============================================
-- If user_profiles has restrictive RLS, it might block the view
SELECT 
  schemaname,
  tablename,
  policyname,
  qual
FROM pg_policies 
WHERE tablename = 'user_profiles'
ORDER BY policyname;

-- 7. FIX: Ensure leaderboard_scores SELECT policy is permissive
-- ============================================
-- Drop overly restrictive policies (if they exist)
DROP POLICY IF EXISTS "Only authenticated users can view leaderboard" ON leaderboard_scores;
DROP POLICY IF EXISTS "Leaderboard is read-only" ON leaderboard_scores;

-- Ensure proper permissive SELECT policy exists
DO $$
BEGIN
  -- Drop if exists to recreate
  DROP POLICY IF EXISTS "Anyone can view leaderboard" ON leaderboard_scores;
  
  -- Create permissive SELECT policy
  CREATE POLICY "Anyone can view leaderboard"
    ON leaderboard_scores FOR SELECT
    TO authenticated
    USING (true);
    
  RAISE NOTICE 'Created permissive SELECT policy on leaderboard_scores';
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Policy creation failed: %', SQLERRM;
END $$;

-- 8. FIX: Ensure user_profiles doesn't block public viewing
-- ============================================
-- The view joins user_profiles, so we need public SELECT there too
DO $$
BEGIN
  -- Check existing policies
  RAISE NOTICE 'Checking user_profiles RLS policies...';
  
  -- Make sure there's a policy allowing authenticated SELECT
  DROP POLICY IF EXISTS "Public profiles readable by authenticated" ON user_profiles;
  
  CREATE POLICY "Public profiles readable by authenticated"
    ON user_profiles FOR SELECT
    TO authenticated
    USING (true);
    
  RAISE NOTICE 'Created permissive SELECT policy on user_profiles';
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Policy creation failed: %', SQLERRM;
END $$;

-- 9. TEST: Direct leaderboard_scores query (should work)
-- ============================================
-- This tests if basic RLS is working
SELECT 
  user_id,
  username,
  total_score
FROM leaderboard_scores
ORDER BY total_score DESC
LIMIT 5;

-- 10. FINAL VERIFICATION
-- ============================================
SELECT 
  'leaderboard_scores' as table_name,
  COUNT(*) as row_count,
  MAX(total_score) as max_score,
  COUNT(DISTINCT user_id) as unique_users
FROM leaderboard_scores

UNION ALL

SELECT 
  'leaderboard_view' as table_name,
  COUNT(*) as row_count,
  MAX(total_score) as max_score,
  COUNT(DISTINCT user_id) as unique_users
FROM leaderboard_view;
