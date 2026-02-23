-- ============================================
-- COMPLETE LEADERBOARD SETUP
-- ============================================
-- This script sets up everything for a fully functional leaderboard

-- Step 1: Drop old problematic policies
SELECT 'Step 1: Dropping old policies' as step;
DROP POLICY IF EXISTS "public_read_leaderboard" ON public.leaderboard_scores;
DROP POLICY IF EXISTS "users_update_own_scores" ON public.leaderboard_scores;
DROP POLICY IF EXISTS "users_insert_own_scores" ON public.leaderboard_scores;
DROP POLICY IF EXISTS "Allow public read access" ON public.leaderboard_scores;
DROP POLICY IF EXISTS "Allow users to read leaderboard" ON public.leaderboard_scores;
DROP POLICY IF EXISTS "Allow users to update own leaderboard" ON public.leaderboard_scores;

-- Step 2: Ensure RLS is enabled
SELECT 'Step 2: Ensuring RLS is enabled' as step;
ALTER TABLE public.leaderboard_scores ENABLE ROW LEVEL SECURITY;

-- Step 3: Create comprehensive RLS policies
SELECT 'Step 3: Creating new RLS policies' as step;

-- Policy 1: Anyone can READ the leaderboard (needed for display)
CREATE POLICY "leaderboard_read_policy" ON public.leaderboard_scores
  FOR SELECT
  TO authenticated, anon
  USING (true);

-- Policy 2: Users can UPDATE their own scores
CREATE POLICY "leaderboard_update_own_policy" ON public.leaderboard_scores
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy 3: Users can INSERT their own row
CREATE POLICY "leaderboard_insert_own_policy" ON public.leaderboard_scores
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Step 4: Verify policies
SELECT 'Step 4: Verifying new policies' as step;
SELECT 
  policyname,
  cmd as operation,
  permissive,
  roles
FROM pg_policies
WHERE tablename = 'leaderboard_scores'
ORDER BY policyname;

-- Step 5: Test READ permission
SELECT 'Step 5: Testing READ' as step;
SELECT 
  COUNT(*) as readable_entries
FROM public.leaderboard_scores;

-- Step 6: Show all current leaderboard data
SELECT 'Step 6: Current leaderboard data' as step;
SELECT 
  username,
  ctf_solved_count,
  phish_solved_count,
  code_solved_count,
  quiz_correct,
  firewall_best_score,
  total_score
FROM public.leaderboard_scores
ORDER BY total_score DESC
LIMIT 20;

SELECT '✅ LEADERBOARD SETUP COMPLETE' as result;
