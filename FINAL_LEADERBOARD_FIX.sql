-- ============================================
-- LEADERBOARD FIX - SIMPLIFIED VERSION
-- ============================================

-- Step 1: Add progress columns if they don't exist
ALTER TABLE leaderboard_scores ADD COLUMN IF NOT EXISTS ctf_solved_count integer DEFAULT 0;
ALTER TABLE leaderboard_scores ADD COLUMN IF NOT EXISTS phish_solved_count integer DEFAULT 0;
ALTER TABLE leaderboard_scores ADD COLUMN IF NOT EXISTS code_solved_count integer DEFAULT 0;
ALTER TABLE leaderboard_scores ADD COLUMN IF NOT EXISTS quiz_answered integer DEFAULT 0;
ALTER TABLE leaderboard_scores ADD COLUMN IF NOT EXISTS quiz_correct integer DEFAULT 0;
ALTER TABLE leaderboard_scores ADD COLUMN IF NOT EXISTS firewall_best_score integer DEFAULT 0;
ALTER TABLE leaderboard_scores ADD COLUMN IF NOT EXISTS badges text[] DEFAULT '{}';

-- Step 2: Create view
CREATE OR REPLACE VIEW leaderboard_view AS
SELECT 
  ls.user_id,
  ls.username,
  up.name,
  up.avatar_url,
  ls.total_score,
  ls.ctf_score,
  ls.phish_score,
  ls.code_score,
  ls.quiz_score,
  ls.firewall_score,
  COALESCE(ls.ctf_solved_count, 0) as ctf_solved_count,
  COALESCE(ls.phish_solved_count, 0) as phish_solved_count,
  COALESCE(ls.code_solved_count, 0) as code_solved_count,
  COALESCE(ls.quiz_answered, 0) as quiz_answered,
  COALESCE(ls.quiz_correct, 0) as quiz_correct,
  COALESCE(ls.firewall_best_score, 0) as firewall_best_score,
  COALESCE(ls.badges, '{}') as badges,
  ROW_NUMBER() OVER (ORDER BY ls.total_score DESC) as rank
FROM leaderboard_scores ls
LEFT JOIN user_profiles up ON ls.user_id = up.id
WHERE up.id IS NOT NULL
ORDER BY ls.total_score DESC;

GRANT SELECT ON leaderboard_view TO authenticated;

-- Step 3: Fix RLS policy on leaderboard_scores
DROP POLICY IF EXISTS "Only authenticated users can view leaderboard" ON leaderboard_scores;
DROP POLICY IF EXISTS "Leaderboard is read-only" ON leaderboard_scores;
DROP POLICY IF EXISTS "Read all leaderboard" ON leaderboard_scores;
DROP POLICY IF EXISTS "Anyone can view leaderboard" ON leaderboard_scores;
DROP POLICY IF EXISTS "Users can update their leaderboard" ON leaderboard_scores;
DROP POLICY IF EXISTS "Users can insert leaderboard entries" ON leaderboard_scores;

CREATE POLICY "Anyone can view leaderboard"
  ON leaderboard_scores FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update their leaderboard"
  ON leaderboard_scores FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Step 4: Fix user_profiles RLS
DROP POLICY IF EXISTS "Authenticated users can view public profiles" ON user_profiles;
DROP POLICY IF EXISTS "Public read profiles" ON user_profiles;
DROP POLICY IF EXISTS "Authenticated users can view all profiles" ON user_profiles;

CREATE POLICY "Authenticated users can view all profiles"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (true);

-- Step 5: Verify columns were added
SELECT '=== LEADERBOARD_SCORES COLUMNS ===' as info;
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'leaderboard_scores'
ORDER BY ordinal_position;

-- Step 6: Check RLS policies
SELECT '=== RLS POLICIES ===' as info;
SELECT tablename, policyname 
FROM pg_policies 
WHERE tablename IN ('leaderboard_scores', 'user_profiles') 
ORDER BY tablename, policyname;

-- Step 7: Count data
SELECT '=== DATA COUNT ===' as info;
SELECT COUNT(*) as leaderboard_entries FROM leaderboard_scores;

-- Step 8: Test view
SELECT '=== VIEW TEST ===' as info;
SELECT COUNT(*) as view_entries FROM leaderboard_view;

-- Step 9: Show leaderboard data
SELECT '=== LEADERBOARD (Top 10) ===' as info;
SELECT 
  rank,
  username,
  COALESCE(name, 'N/A') as name,
  total_score,
  ctf_solved_count,
  phish_solved_count,
  code_solved_count,
  quiz_correct,
  firewall_best_score
FROM leaderboard_view
ORDER BY rank
LIMIT 10;
