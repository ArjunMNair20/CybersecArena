-- ======================================================
-- CREATE user_progress TABLE & REBUILD SCORES
-- This handles missing user_progress table
-- ======================================================

-- STEP 1: Create user_progress table if it doesn't exist
-- This is where actual progress is stored
CREATE TABLE IF NOT EXISTS user_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  ctf_solved_ids text[] DEFAULT '{}',
  phish_solved_ids text[] DEFAULT '{}',
  code_solved_ids text[] DEFAULT '{}',
  quiz_answered integer DEFAULT 0,
  quiz_correct integer DEFAULT 0,
  quiz_difficulty text DEFAULT 'easy',
  firewall_best_score integer DEFAULT 0,
  badges text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

SELECT 'user_progress table verified/created' as status;

-- STEP 2: Add missing columns to leaderboard_scores if needed
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

SELECT 'leaderboard_scores columns verified/added' as status;

-- STEP 3: For any users that DON'T have progress data, create user_progress entries
-- (This ensures every user in leaderboard_scores has a matching user_progress entry)
INSERT INTO user_progress (user_id, ctf_solved_ids, phish_solved_ids, code_solved_ids)
SELECT DISTINCT ls.user_id, ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[]
FROM leaderboard_scores ls
WHERE NOT EXISTS (SELECT 1 FROM user_progress WHERE user_id = ls.user_id);

SELECT 'Created user_progress entries for leaderboard users' as status;

-- STEP 4: Sync progress data FROM user_progress TO leaderboard_scores
-- Update counts based on array lengths
UPDATE leaderboard_scores ls
SET 
  ctf_solved_count = COALESCE((SELECT array_length(ctf_solved_ids, 1) FROM user_progress WHERE user_id = ls.user_id), 0),
  phish_solved_count = COALESCE((SELECT array_length(phish_solved_ids, 1) FROM user_progress WHERE user_id = ls.user_id), 0),
  code_solved_count = COALESCE((SELECT array_length(code_solved_ids, 1) FROM user_progress WHERE user_id = ls.user_id), 0),
  quiz_answered = COALESCE((SELECT quiz_answered FROM user_progress WHERE user_id = ls.user_id), 0),
  quiz_correct = COALESCE((SELECT quiz_correct FROM user_progress WHERE user_id = ls.user_id), 0),
  firewall_best_score = COALESCE((SELECT firewall_best_score FROM user_progress WHERE user_id = ls.user_id), 0)
WHERE EXISTS (SELECT 1 FROM user_progress WHERE user_id = ls.user_id);

SELECT 'Synced progress counts from user_progress to leaderboard_scores' as status;

-- STEP 5: Recalculate ALL scores using correct formula
-- Formula: (Overall % × 10) = (average of 5 category percentages) × 10
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

-- STEP 6: Show users with progress
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
WHERE ctf_solved_count > 0 OR phish_solved_count > 0 OR code_solved_count > 0 OR quiz_correct > 0 OR firewall_best_score > 0
ORDER BY total_score DESC
LIMIT 20;

-- STEP 7: Show final leaderboard (all users)
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
