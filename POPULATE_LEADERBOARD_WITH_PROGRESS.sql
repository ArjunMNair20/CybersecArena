-- ======================================================
-- SYNC ALL USER PROGRESS & POPULATE LEADERBOARD
-- This pulls actual progress data and updates all scores
-- ======================================================

-- STEP 1: Check if user_progress has any data
SELECT 'Checking user_progress data...' as step;
SELECT COUNT(*) as total_users_with_progress FROM user_progress;

-- STEP 2: Show current progress data in user_progress
SELECT 
  user_id,
  array_length(ctf_solved_ids, 1) as ctf_solved_count,
  array_length(phish_solved_ids, 1) as phish_solved_count,
  array_length(code_solved_ids, 1) as code_solved_count,
  quiz_answered,
  quiz_correct,
  firewall_best_score
FROM user_progress
WHERE array_length(ctf_solved_ids, 1) > 0 
   OR array_length(phish_solved_ids, 1) > 0 
   OR array_length(code_solved_ids, 1) > 0 
   OR quiz_correct > 0
   OR firewall_best_score > 0
ORDER BY user_id;

-- STEP 3: Sync ALL progress data from user_progress TO leaderboard_scores
-- This updates the leaderboard_scores table with actual counts
UPDATE leaderboard_scores ls
SET 
  ctf_solved_count = COALESCE((SELECT array_length(ctf_solved_ids, 1) FROM user_progress WHERE user_id = ls.user_id), 0),
  phish_solved_count = COALESCE((SELECT array_length(phish_solved_ids, 1) FROM user_progress WHERE user_id = ls.user_id), 0),
  code_solved_count = COALESCE((SELECT array_length(code_solved_ids, 1) FROM user_progress WHERE user_id = ls.user_id), 0),
  quiz_answered = COALESCE((SELECT quiz_answered FROM user_progress WHERE user_id = ls.user_id), 0),
  quiz_correct = COALESCE((SELECT quiz_correct FROM user_progress WHERE user_id = ls.user_id), 0),
  firewall_best_score = COALESCE((SELECT firewall_best_score FROM user_progress WHERE user_id = ls.user_id), 0);

SELECT 'Progress data synced to leaderboard_scores' as step;

-- STEP 4: Recalculate ALL scores using correct formula
-- Max values: CTF=67, Phish=145, Code=50, Quiz=79, Firewall=100
-- Formula: Overall % = Average of 5 category percentages, Score = Overall % × 10
UPDATE leaderboard_scores
SET 
  total_score = ROUND(
    (
      (LEAST(100, (COALESCE(ctf_solved_count, 0)::float / 67) * 100) +
       LEAST(100, (COALESCE(phish_solved_count, 0)::float / 145) * 100) +
       LEAST(100, (COALESCE(code_solved_count, 0)::float / 50) * 100) +
       LEAST(100, (COALESCE(quiz_correct, 0)::float / 79) * 100) +
       LEAST(100, (COALESCE(firewall_best_score, 0)::float / 100) * 100)) / 5
    ) * 10
  ),
  ctf_score = ROUND((LEAST(100, (COALESCE(ctf_solved_count, 0)::float / 67) * 100)) * 10),
  phish_score = ROUND((LEAST(100, (COALESCE(phish_solved_count, 0)::float / 145) * 100)) * 10),
  code_score = ROUND((LEAST(100, (COALESCE(code_solved_count, 0)::float / 50) * 100)) * 10),
  quiz_score = ROUND((LEAST(100, (COALESCE(quiz_correct, 0)::float / 79) * 100)) * 10),
  firewall_score = ROUND((LEAST(100, (COALESCE(firewall_best_score, 0)::float / 100) * 100)) * 10);

SELECT 'All scores recalculated' as step;

-- STEP 5: Show final leaderboard with all users and their current progress
-- Sorted by score (highest first)
SELECT 
  ROW_NUMBER() OVER (ORDER BY total_score DESC, username ASC) as rank,
  username,
  total_score,
  ROUND(
    (LEAST(100, (COALESCE(ctf_solved_count, 0)::float / 67) * 100) +
     LEAST(100, (COALESCE(phish_solved_count, 0)::float / 145) * 100) +
     LEAST(100, (COALESCE(code_solved_count, 0)::float / 50) * 100) +
     LEAST(100, (COALESCE(quiz_correct, 0)::float / 79) * 100) +
     LEAST(100, (COALESCE(firewall_best_score, 0)::float / 100) * 100)) / 5
  )::int as progress_percent,
  COALESCE(ctf_solved_count, 0) as ctf,
  COALESCE(phish_solved_count, 0) as phish,
  COALESCE(code_solved_count, 0) as code,
  COALESCE(quiz_correct, 0) as quiz,
  COALESCE(firewall_best_score, 0) as firewall
FROM leaderboard_scores
ORDER BY total_score DESC, username ASC;

-- STEP 6: Summary statistics
SELECT 
  COUNT(*) as total_users,
  COUNT(CASE WHEN total_score > 0 THEN 1 END) as users_with_progress,
  ROUND(AVG(total_score), 2) as avg_score,
  MAX(total_score) as highest_score,
  MIN(total_score) as lowest_score
FROM leaderboard_scores;

SELECT '✅ Leaderboard populated with current user progress!' as result;
