-- ============================================
-- LEADERBOARD FIX - STEP 1: CHECK TABLE STRUCTURE
-- ============================================
-- First, check what columns actually exist in leaderboard_scores

SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'leaderboard_scores'
ORDER BY ordinal_position;

-- If the above shows leaderboard_scores exists, note the columns
-- Then proceed to fix the view below

-- ============================================
-- STEP 2: FIX - Ensure leaderboard_scores has all needed columns
-- ============================================

-- Add id column if it doesn't exist
ALTER TABLE leaderboard_scores ADD COLUMN IF NOT EXISTS id uuid PRIMARY KEY DEFAULT gen_random_uuid();

-- Add progress columns if they don't exist
ALTER TABLE leaderboard_scores ADD COLUMN IF NOT EXISTS ctf_solved_count integer DEFAULT 0;
ALTER TABLE leaderboard_scores ADD COLUMN IF NOT EXISTS phish_solved_count integer DEFAULT 0;
ALTER TABLE leaderboard_scores ADD COLUMN IF NOT EXISTS code_solved_count integer DEFAULT 0;
ALTER TABLE leaderboard_scores ADD COLUMN IF NOT EXISTS quiz_answered integer DEFAULT 0;
ALTER TABLE leaderboard_scores ADD COLUMN IF NOT EXISTS quiz_correct integer DEFAULT 0;
ALTER TABLE leaderboard_scores ADD COLUMN IF NOT EXISTS firewall_best_score integer DEFAULT 0;
ALTER TABLE leaderboard_scores ADD COLUMN IF NOT EXISTS badges text[] DEFAULT '{}';

-- ============================================
-- STEP 3: CREATE VIEW (safe version)
-- ============================================
-- This uses only columns that definitely exist
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
  ls.last_updated,
  COALESCE(ls.ctf_solved_count, 0) as ctf_solved_count,
  COALESCE(ls.phish_solved_count, 0) as phish_solved_count,
  COALESCE(ls.code_solved_count, 0) as code_solved_count,
  COALESCE(ls.quiz_answered, 0) as quiz_answered,
  COALESCE(ls.quiz_correct, 0) as quiz_correct,
  COALESCE(ls.firewall_best_score, 0) as firewall_best_score,
  COALESCE(ls.badges, '{}') as badges,
  ROW_NUMBER() OVER (ORDER BY ls.total_score DESC, ls.last_updated ASC) as rank
FROM leaderboard_scores ls
LEFT JOIN user_profiles up ON ls.user_id = up.id
WHERE up.id IS NOT NULL
ORDER BY ls.total_score DESC, ls.last_updated ASC;

GRANT SELECT ON leaderboard_view TO authenticated;

-- ============================================
-- STEP 4: FIX RLS POLICIES
-- ============================================
DROP POLICY IF EXISTS "Only authenticated users can view leaderboard" ON leaderboard_scores;
DROP POLICY IF EXISTS "Leaderboard is read-only" ON leaderboard_scores;
DROP POLICY IF EXISTS "Read all leaderboard" ON leaderboard_scores;
DROP POLICY IF EXISTS "Anyone can view leaderboard" ON leaderboard_scores;

CREATE POLICY "Anyone can view leaderboard"
  ON leaderboard_scores FOR SELECT
  TO authenticated
  USING (true);

-- ============================================
-- STEP 5: FIX user_profiles RLS
-- ============================================
DROP POLICY IF EXISTS "Authenticated users can view public profiles" ON user_profiles;
DROP POLICY IF EXISTS "Public read profiles" ON user_profiles;
DROP POLICY IF EXISTS "Authenticated users can view all profiles" ON user_profiles;

CREATE POLICY "Authenticated users can view all profiles"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (true);

-- ============================================
-- STEP 6: VERIFY SETUP
-- ============================================

-- Show table structure
SELECT 'leaderboard_scores columns:' as info;
SELECT column_name FROM information_schema.columns WHERE table_name = 'leaderboard_scores' ORDER BY ordinal_position;

-- Show RLS policies
SELECT 'RLS policies:' as info;
SELECT tablename, policyname FROM pg_policies WHERE tablename IN ('leaderboard_scores', 'user_profiles') ORDER BY tablename;

-- ============================================
-- STEP 7: TEST DATA
-- ============================================

SELECT 'leaderboard_scores data:' as info;
SELECT COUNT(*) as row_count FROM leaderboard_scores;

SELECT 'leaderboard_view:' as info;
SELECT COUNT(*) as view_row_count FROM leaderboard_view;

-- ============================================
-- STEP 8: SHOW LEADERBOARD DATA
-- ============================================
SELECT 'Leaderboard Display:' as info;
SELECT 
  rank,
  username,
  COALESCE(name, 'N/A') as name,
  total_score,
  ctf_solved_count,
  phish_solved_count,
  code_solved_count
FROM leaderboard_view
ORDER BY rank
LIMIT 10;
