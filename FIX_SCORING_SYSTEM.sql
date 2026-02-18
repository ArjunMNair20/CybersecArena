-- ============================================
-- FIX LEADERBOARD SCORING - USE PROGRESS %
-- ============================================
-- New scoring: Total Score = Overall Progress % × 1000
-- This makes scores comparable and reasonable (0-1000 max)

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

-- Step 2: Recalculate and fix all scores using proper scoring
-- Score = Overall Progress % × 10
-- Overall = Average of (CTF%, Phish%, Code%, Quiz%, Firewall%)
-- Where: CTF% = (count/100)*100, Phish% = (count/20)*100, etc.

UPDATE leaderboard_scores 
SET 
  -- Calculate individual percentage components (0-100% each, then × 10 for score)
  ctf_score = CAST(LEAST(100::numeric, (ctf_solved_count::numeric / 100) * 100) * 10 AS INTEGER),
  phish_score = CAST(LEAST(100::numeric, (phish_solved_count::numeric / 20) * 100) * 10 AS INTEGER),
  code_score = CAST(LEAST(100::numeric, (code_solved_count::numeric / 30) * 100) * 10 AS INTEGER),
  quiz_score = CAST(LEAST(100::numeric, (quiz_correct::numeric / 100) * 100) * 10 AS INTEGER),
  firewall_score = CAST(LEAST(100::numeric, (firewall_best_score::numeric / 100) * 100) * 10 AS INTEGER),
  -- Calculate overall as average of all percentages × 10
  total_score = CAST(
    (
      LEAST(100::numeric, (ctf_solved_count::numeric / 100) * 100) +
      LEAST(100::numeric, (phish_solved_count::numeric / 20) * 100) +
      LEAST(100::numeric, (code_solved_count::numeric / 30) * 100) +
      LEAST(100::numeric, (quiz_correct::numeric / 100) * 100) +
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
  phish_solved_count,
  code_solved_count,
  quiz_correct,
  firewall_best_score,
  -- Show the percentages
  CAST((ctf_solved_count::numeric / 100) * 100 AS DECIMAL(5,1)) as ctf_percent,
  CAST((phish_solved_count::numeric / 20) * 100 AS DECIMAL(5,1)) as phish_percent,
  CAST((code_solved_count::numeric / 30) * 100 AS DECIMAL(5,1)) as code_percent,
  CAST((quiz_correct::numeric / 100) * 100 AS DECIMAL(5,1)) as quiz_percent,
  CAST((firewall_best_score::numeric / 100) * 100 AS DECIMAL(5,1)) as firewall_percent,
  CAST(
    (
      LEAST(100::numeric, (ctf_solved_count::numeric / 100) * 100) +
      LEAST(100::numeric, (phish_solved_count::numeric / 20) * 100) +
      LEAST(100::numeric, (code_solved_count::numeric / 30) * 100) +
      LEAST(100::numeric, (quiz_correct::numeric / 100) * 100) +
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
  ctf_solved_count as "CTF",
  phish_solved_count as "Phish",
  code_solved_count as "Code",
  quiz_correct as "Quiz Correct",
  firewall_best_score as "Firewall"
FROM leaderboard_scores
ORDER BY total_score DESC;
