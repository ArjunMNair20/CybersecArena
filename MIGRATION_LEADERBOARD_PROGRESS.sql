-- LEADERBOARD FIX - SQL MIGRATION
-- Run this entire script in your Supabase SQL Editor
-- Time to execute: ~30 seconds
-- Impact: No downtime, all changes are backward compatible

-- ============================================
-- STEP 1: Add Progress Columns to leaderboard_scores
-- ============================================

ALTER TABLE leaderboard_scores ADD COLUMN IF NOT EXISTS ctf_solved_count integer DEFAULT 0;
ALTER TABLE leaderboard_scores ADD COLUMN IF NOT EXISTS phish_solved_count integer DEFAULT 0;
ALTER TABLE leaderboard_scores ADD COLUMN IF NOT EXISTS code_solved_count integer DEFAULT 0;
ALTER TABLE leaderboard_scores ADD COLUMN IF NOT EXISTS quiz_answered integer DEFAULT 0;
ALTER TABLE leaderboard_scores ADD COLUMN IF NOT EXISTS quiz_correct integer DEFAULT 0;
ALTER TABLE leaderboard_scores ADD COLUMN IF NOT EXISTS firewall_best_score integer DEFAULT 0;
ALTER TABLE leaderboard_scores ADD COLUMN IF NOT EXISTS badges text[] DEFAULT '{}';

-- ============================================
-- STEP 2: Verify Columns Were Added
-- ============================================

-- Optional: Verify the columns exist
-- SELECT column_name FROM information_schema.columns 
-- WHERE table_name = 'leaderboard_scores' 
-- AND column_name IN ('ctf_solved_count', 'phish_solved_count', 'code_solved_count')
-- ORDER BY column_name;

-- ============================================
-- STEP 3: Update Leaderboard View
-- ============================================

-- Drop existing view to recreate it with new columns
DROP VIEW IF EXISTS leaderboard_view CASCADE;

-- Create updated view that includes progress data from leaderboard_scores
CREATE OR REPLACE VIEW leaderboard_view AS
SELECT 
  ls.id,
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
  -- Progress data - prefer leaderboard_scores, fallback to user_progress for backward compatibility
  COALESCE(ls.ctf_solved_count, COALESCE(array_length(up_progress.ctf_solved_ids, 1), 0)) as ctf_solved_count,
  COALESCE(ls.phish_solved_count, COALESCE(array_length(up_progress.phish_solved_ids, 1), 0)) as phish_solved_count,
  COALESCE(ls.code_solved_count, COALESCE(array_length(up_progress.code_solved_ids, 1), 0)) as code_solved_count,
  COALESCE(ls.quiz_answered, up_progress.quiz_answered, 0) as quiz_answered,
  COALESCE(ls.quiz_correct, up_progress.quiz_correct, 0) as quiz_correct,
  COALESCE(ls.firewall_best_score, up_progress.firewall_best_score, 0) as firewall_best_score,
  COALESCE(ls.badges, up_progress.badges, '{}') as badges,
  ROW_NUMBER() OVER (ORDER BY ls.total_score DESC, ls.last_updated ASC) as rank
FROM leaderboard_scores ls
INNER JOIN user_profiles up ON ls.user_id = up.id
LEFT JOIN user_progress up_progress ON ls.user_id = up_progress.user_id
WHERE up.id IS NOT NULL AND up.username IS NOT NULL
ORDER BY ls.total_score DESC, ls.last_updated ASC;

-- ============================================
-- STEP 4: Grant Permissions
-- ============================================

-- Grant select permission on the view to authenticated users
GRANT SELECT ON leaderboard_view TO authenticated;

-- ============================================
-- MIGRATION COMPLETE
-- ============================================
-- All columns have been added and the view has been updated.
-- 
-- What happens next:
-- 1. Frontend code will start storing progress data in leaderboard_scores
-- 2. Existing users' data will be synced automatically when they open the app
-- 3. New users will have their data synced on first leaderboard view
--
-- To verify the migration worked, run:
-- SELECT * FROM leaderboard_scores LIMIT 1;
-- 
-- You should see the new columns (ctf_solved_count, phish_solved_count, etc.)

-- ============================================
-- OPTIONAL: Manual Data Sync (if needed)
-- ============================================
-- If you want to immediately sync all existing leaderboard data from user_progress:
--
-- UPDATE leaderboard_scores ls
-- SET 
--   ctf_solved_count = COALESCE(array_length(up.ctf_solved_ids, 1), 0),
--   phish_solved_count = COALESCE(array_length(up.phish_solved_ids, 1), 0),
--   code_solved_count = COALESCE(array_length(up.code_solved_ids, 1), 0),
--   quiz_answered = COALESCE(up.quiz_answered, 0),
--   quiz_correct = COALESCE(up.quiz_correct, 0),
--   firewall_best_score = COALESCE(up.firewall_best_score, 0),
--   badges = COALESCE(up.badges, '{}')
-- FROM user_progress up
-- WHERE up.user_id = ls.user_id;
--
-- Uncomment and run the above if you want immediate data sync instead of waiting for users to trigger it.
