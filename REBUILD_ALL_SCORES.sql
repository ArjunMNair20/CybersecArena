-- ======================================================
-- REBUILD ALL USER SCORES WITH CORRECT PROGRESS DATA
-- This script populates all missing progress data
-- ======================================================

-- IMPORTANT: If user_progress table doesn't exist, use CREATE_AND_REBUILD_SCORES.sql instead!

-- STEP 1: Add columns if missing
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

SELECT 'Columns verified/added' as status;

-- STEP 2: Try to update from user_progress
-- If user_progress table doesn't exist, run CREATE_AND_REBUILD_SCORES.sql instead
UPDATE leaderboard_scores ls
SET 
  ctf_solved_count = COALESCE((SELECT array_length(ctf_solved_ids, 1) FROM user_progress WHERE user_id = ls.user_id), 0),
  phish_solved_count = COALESCE((SELECT array_length(phish_solved_ids, 1) FROM user_progress WHERE user_id = ls.user_id), 0),
  code_solved_count = COALESCE((SELECT array_length(code_solved_ids, 1) FROM user_progress WHERE user_id = ls.user_id), 0),
  quiz_answered = COALESCE((SELECT quiz_answered FROM user_progress WHERE user_id = ls.user_id), 0),
  quiz_correct = COALESCE((SELECT quiz_correct FROM user_progress WHERE user_id = ls.user_id), 0),
  firewall_best_score = COALESCE((SELECT firewall_best_score FROM user_progress WHERE user_id = ls.user_id), 0)
WHERE EXISTS (SELECT 1 FROM user_progress WHERE user_id = ls.user_id);

SELECT 'Progress data synced from user_progress (counts from array lengths)' as status;

-- STEP 3: Recalculate ALL scores using correct formula
-- Formula: (Overall % × 10) where Overall % = average of 5 categories
-- Each category % = (solved / max) × 100, capped at 100%
UPDATE leaderboard_scores
SET 
  total_score = ROUND(
    (
      (LEAST(100, (ctf_solved_count::float / 67) * 100) +
       LEAST(100, (phish_solved_count::float / 145) * 100) +
       LEAST(100, (code_solved_count::float / 50) * 100) +
       LEAST(100, (quiz_correct::float / 79) * 100) +
       LEAST(100, (firewall_best_score::float / 100) * 100)) / 5
    ) * 10
  ),
  ctf_score = ROUND((LEAST(100, (ctf_solved_count::float / 67) * 100)) * 10),
  phish_score = ROUND((LEAST(100, (phish_solved_count::float / 145) * 100)) * 10),
  code_score = ROUND((LEAST(100, (code_solved_count::float / 50) * 100)) * 10),
  quiz_score = ROUND((LEAST(100, (quiz_correct::float / 79) * 100)) * 10),
  firewall_score = ROUND((LEAST(100, (firewall_best_score::float / 100) * 100)) * 10);

SELECT 'All user scores recalculated' as status;

-- STEP 4: Verify the recalculation worked
SELECT 
  username,
  ctf_solved_count,
  phish_solved_count,
  code_solved_count,
  quiz_correct,
  firewall_best_score,
  ROUND((LEAST(100, (ctf_solved_count::float / 67) * 100) +
         LEAST(100, (phish_solved_count::float / 145) * 100) +
         LEAST(100, (code_solved_count::float / 50) * 100) +
         LEAST(100, (quiz_correct::float / 79) * 100) +
         LEAST(100, (firewall_best_score::float / 100) * 100)) / 5) as progress_percent,
  total_score
FROM leaderboard_scores
WHERE ctf_solved_count > 0 OR phish_solved_count > 0 OR code_solved_count > 0 OR quiz_correct > 0
ORDER BY total_score DESC
LIMIT 20;

-- STEP 5: Show final leaderboard
SELECT 
  username,
  total_score,
  ROUND((LEAST(100, (ctf_solved_count::float / 67) * 100) +
         LEAST(100, (phish_solved_count::float / 145) * 100) +
         LEAST(100, (code_solved_count::float / 50) * 100) +
         LEAST(100, (quiz_correct::float / 79) * 100) +
         LEAST(100, (firewall_best_score::float / 100) * 100)) / 5) as progress_percent,
  ctf_solved_count,
  phish_solved_count,
  code_solved_count,
  quiz_correct
FROM leaderboard_scores
ORDER BY total_score DESC;

SELECT '✅ All users rescored successfully!' as result;
