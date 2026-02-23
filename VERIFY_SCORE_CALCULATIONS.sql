-- Quick test to see if scores recalculate properly
-- Run this AFTER running REBUILD_ALL_SCORES.sql

-- Show calculations step by step for your user
SELECT 
  username,
  ctf_solved_count,
  phish_solved_count,
  code_solved_count,
  quiz_correct,
  firewall_best_score,
  -- Calculate each category percentage
  LEAST(100, (ctf_solved_count::float / 67) * 100)::int as ctf_percent,
  LEAST(100, (phish_solved_count::float / 145) * 100)::int as phish_percent,
  LEAST(100, (code_solved_count::float / 50) * 100)::int as code_percent,
  LEAST(100, (quiz_correct::float / 79) * 100)::int as quiz_percent,
  LEAST(100, (firewall_best_score::float / 100) * 100)::int as firewall_percent,
  -- Calculate average progress
  ROUND(
    (LEAST(100, (ctf_solved_count::float / 67) * 100) +
     LEAST(100, (phish_solved_count::float / 145) * 100) +
     LEAST(100, (code_solved_count::float / 50) * 100) +
     LEAST(100, (quiz_correct::float / 79) * 100) +
     LEAST(100, (firewall_best_score::float / 100) * 100)) / 5
  )::int as total_progress_percent,
  total_score,
  -- Verify: total_score should be (total_progress_percent × 10)
  (ROUND(
    (LEAST(100, (ctf_solved_count::float / 67) * 100) +
     LEAST(100, (phish_solved_count::float / 145) * 100) +
     LEAST(100, (code_solved_count::float / 50) * 100) +
     LEAST(100, (quiz_correct::float / 79) * 100) +
     LEAST(100, (firewall_best_score::float / 100) * 100)) / 5
  ) * 10)::int as expected_score,
  CASE 
    WHEN ROUND(
      (LEAST(100, (ctf_solved_count::float / 67) * 100) +
       LEAST(100, (phish_solved_count::float / 145) * 100) +
       LEAST(100, (code_solved_count::float / 50) * 100) +
       LEAST(100, (quiz_correct::float / 79) * 100) +
       LEAST(100, (firewall_best_score::float / 100) * 100)) / 5
    ) * 10 = total_score THEN '✅ CORRECT'
    ELSE '❌ MISMATCH'
  END as score_check
FROM leaderboard_scores
WHERE ctf_solved_count > 0 OR phish_solved_count > 0 OR code_solved_count > 0 OR quiz_correct > 0 OR firewall_best_score > 0
ORDER BY total_score DESC;

-- Show all users for final verification
SELECT 
  username,
  ROUND(
    (LEAST(100, (ctf_solved_count::float / 67) * 100) +
     LEAST(100, (phish_solved_count::float / 145) * 100) +
     LEAST(100, (code_solved_count::float / 50) * 100) +
     LEAST(100, (quiz_correct::float / 79) * 100) +
     LEAST(100, (firewall_best_score::float / 100) * 100)) / 5
  )::int as progress_percent,
  total_score,
  ctf_solved_count,
  phish_solved_count,
  code_solved_count,
  quiz_correct
FROM leaderboard_scores
ORDER BY total_score DESC;
