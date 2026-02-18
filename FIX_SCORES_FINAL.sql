-- ============================================
-- FIX LEADERBOARD WITH CORRECT MAX VALUES
-- ============================================
-- Actual max values from data files:
-- CTF: 67 tasks
-- Phish: 145 tasks  
-- Code: 50 tasks
-- Quiz: 79 questions
-- Firewall: 100 score

-- Step 1: Check current state
SELECT '=== CURRENT STATE ===' as step;
SELECT 
  username,
  ctf_solved_count,
  phish_solved_count,
  code_solved_count,
  quiz_correct,
  firewall_best_score,
  total_score
FROM leaderboard_scores
ORDER BY username;

-- Step 2: Recalculate scores with CORRECT max values
UPDATE leaderboard_scores 
SET 
  -- Use actual max values from data files
  ctf_score = CAST(LEAST(100::numeric, (ctf_solved_count::numeric / 67) * 100) * 10 AS INTEGER),
  phish_score = CAST(LEAST(100::numeric, (phish_solved_count::numeric / 145) * 100) * 10 AS INTEGER),
  code_score = CAST(LEAST(100::numeric, (code_solved_count::numeric / 50) * 100) * 10 AS INTEGER),
  quiz_score = CAST(LEAST(100::numeric, (quiz_correct::numeric / 79) * 100) * 10 AS INTEGER),
  firewall_score = CAST(LEAST(100::numeric, (firewall_best_score::numeric / 100) * 100) * 10 AS INTEGER),
  -- Calculate overall as average of all percentages × 10
  total_score = CAST(
    (
      LEAST(100::numeric, (ctf_solved_count::numeric / 67) * 100) +
      LEAST(100::numeric, (phish_solved_count::numeric / 145) * 100) +
      LEAST(100::numeric, (code_solved_count::numeric / 50) * 100) +
      LEAST(100::numeric, (quiz_correct::numeric / 79) * 100) +
      LEAST(100::numeric, (firewall_best_score::numeric / 100) * 100)
    ) / 5 * 10 AS INTEGER
  )
WHERE user_id IS NOT NULL;

-- Step 3: Verify the corrected scores
SELECT '=== FIXED STATE ===' as step;
SELECT 
  username,
  total_score as overall_score,
  ctf_solved_count,
  CAST((ctf_solved_count::numeric / 67) * 100 AS DECIMAL(5,1)) as ctf_percent,
  phish_solved_count,
  CAST((phish_solved_count::numeric / 145) * 100 AS DECIMAL(5,1)) as phish_percent,
  code_solved_count,
  CAST((code_solved_count::numeric / 50) * 100 AS DECIMAL(5,1)) as code_percent,
  quiz_correct,
  CAST((quiz_correct::numeric / 79) * 100 AS DECIMAL(5,1)) as quiz_percent,
  firewall_best_score,
  CAST((firewall_best_score::numeric / 100) * 100 AS DECIMAL(5,1)) as firewall_percent,
  CAST(
    (
      LEAST(100::numeric, (ctf_solved_count::numeric / 67) * 100) +
      LEAST(100::numeric, (phish_solved_count::numeric / 145) * 100) +
      LEAST(100::numeric, (code_solved_count::numeric / 50) * 100) +
      LEAST(100::numeric, (quiz_correct::numeric / 79) * 100) +
      LEAST(100::numeric, (firewall_best_score::numeric / 100) * 100)
    ) / 5 AS DECIMAL(5,1)
  ) as overall_progress_percent
FROM leaderboard_scores
ORDER BY total_score DESC;

-- Step 4: View in leaderboard format (ranked)
SELECT '=== LEADERBOARD RANKING ===' as step;
SELECT 
  ROW_NUMBER() OVER (ORDER BY total_score DESC) as rank,
  username,
  total_score as score,
  CAST((ctf_solved_count::numeric / 67) * 100 AS DECIMAL(5,1)) as ctf_percent,
  phish_solved_count,
  code_solved_count,
  quiz_correct,
  firewall_best_score
FROM leaderboard_scores
ORDER BY total_score DESC;
