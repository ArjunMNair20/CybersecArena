-- ======================================================
-- 🔧 FIX DATABASE SCHEMA
-- Make sure leaderboard_scores has ALL required columns
-- ======================================================

-- STEP 1: Check current columns
SELECT 
  column_name, 
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'leaderboard_scores'
ORDER BY ordinal_position;

-- STEP 2: Add missing columns if they don't exist
-- These are all safe if columns already exist

ALTER TABLE leaderboard_scores
ADD COLUMN IF NOT EXISTS ctf_score integer DEFAULT 0;

ALTER TABLE leaderboard_scores
ADD COLUMN IF NOT EXISTS phish_score integer DEFAULT 0;

ALTER TABLE leaderboard_scores
ADD COLUMN IF NOT EXISTS code_score integer DEFAULT 0;

ALTER TABLE leaderboard_scores
ADD COLUMN IF NOT EXISTS quiz_score integer DEFAULT 0;

ALTER TABLE leaderboard_scores
ADD COLUMN IF NOT EXISTS firewall_score integer DEFAULT 0;

ALTER TABLE leaderboard_scores
ADD COLUMN IF NOT EXISTS ctf_solved_count integer DEFAULT 0;

ALTER TABLE leaderboard_scores
ADD COLUMN IF NOT EXISTS phish_solved_count integer DEFAULT 0;

ALTER TABLE leaderboard_scores
ADD COLUMN IF NOT EXISTS code_solved_count integer DEFAULT 0;

ALTER TABLE leaderboard_scores
ADD COLUMN IF NOT EXISTS quiz_answered integer DEFAULT 0;

ALTER TABLE leaderboard_scores
ADD COLUMN IF NOT EXISTS quiz_correct integer DEFAULT 0;

ALTER TABLE leaderboard_scores
ADD COLUMN IF NOT EXISTS firewall_best_score integer DEFAULT 0;

ALTER TABLE leaderboard_scores
ADD COLUMN IF NOT EXISTS badges text[] DEFAULT ARRAY[]::text[];

-- Remove last_updated if it exists (causing errors) OR keep it - add this line:
-- ALTER TABLE leaderboard_scores DROP COLUMN IF EXISTS last_updated;

-- STEP 3: Verify all columns exist now
SELECT 
  'Columns after fix:' as info,
  COUNT(*) as total_columns
FROM information_schema.columns 
WHERE table_name = 'leaderboard_scores';

-- List all columns
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'leaderboard_scores'
ORDER BY ordinal_position;

-- STEP 4: Verify table structure
SELECT 
  tablename,
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = 'leaderboard_scores') as column_count
FROM pg_tables
WHERE tablename = 'leaderboard_scores';

-- ======================================================
-- SUCCESS!
-- If no errors above, schema is fixed
-- ======================================================
