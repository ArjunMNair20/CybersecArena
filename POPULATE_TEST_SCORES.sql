-- ============================================
-- MANUAL SYNC: POPULATE LEADERBOARD WITH SCORES
-- ============================================

-- This script calculates scores for all users based on reasonable defaults
-- We'll use the score formula:
-- - CTF: solved_count × 100 (max 100 CTFs = 10,000 points)
-- - Phish: solved_count × 150 (max 20 phishing = 3,000 points)  
-- - Code: solved_count × 150 (max 30 code = 4,500 points)
-- - Quiz: correct × 80 (max 100 correct = 8,000 points)
-- - Firewall: best_score × 20 (max 100 score = 2,000 points)

-- Step 1: Verify all users exist in user_profiles
SELECT '=== USERS IN user_profiles ===' as info;
SELECT id, username, name, email FROM user_profiles ORDER BY username;

-- Step 2: Check current leaderboard_scores
SELECT '=== CURRENT leaderboard_scores ===' as info;
SELECT 
  user_id, 
  username, 
  total_score,
  ctf_solved_count,
  phish_solved_count,
  code_solved_count,
  quiz_correct,
  firewall_best_score
FROM leaderboard_scores 
ORDER BY username;

-- Step 3: Manually update leaderboard_scores with test data
-- We'll give each user different progress levels to show the leaderboard working

-- User 1: High scores (90% completion)
UPDATE leaderboard_scores 
SET 
  ctf_solved_count = 90,
  phish_solved_count = 18,
  code_solved_count = 27,
  quiz_answered = 100,
  quiz_correct = 95,
  firewall_best_score = 95,
  ctf_score = 90 * 100,          -- 9,000
  phish_score = 18 * 150,        -- 2,700
  code_score = 27 * 150,         -- 4,050
  quiz_score = 95 * 80,          -- 7,600
  firewall_score = 95 * 20,      -- 1,900
  total_score = (90 * 100) + (18 * 150) + (27 * 150) + (95 * 80) + (95 * 20)  -- 25,250
WHERE username = (SELECT username FROM leaderboard_scores ORDER BY username LIMIT 1);

-- User 2: Medium-high scores (60% completion)
UPDATE leaderboard_scores 
SET 
  ctf_solved_count = 60,
  phish_solved_count = 12,
  code_solved_count = 18,
  quiz_answered = 80,
  quiz_correct = 60,
  firewall_best_score = 65,
  ctf_score = 60 * 100,          -- 6,000
  phish_score = 12 * 150,        -- 1,800
  code_score = 18 * 150,         -- 2,700
  quiz_score = 60 * 80,          -- 4,800
  firewall_score = 65 * 20,      -- 1,300
  total_score = (60 * 100) + (12 * 150) + (18 * 150) + (60 * 80) + (65 * 20)  -- 16,600
WHERE username = (SELECT username FROM leaderboard_scores ORDER BY username LIMIT 1 OFFSET 1);

-- User 3: Low scores (30% completion)
UPDATE leaderboard_scores 
SET 
  ctf_solved_count = 30,
  phish_solved_count = 6,
  code_solved_count = 9,
  quiz_answered = 50,
  quiz_correct = 30,
  firewall_best_score = 40,
  ctf_score = 30 * 100,          -- 3,000
  phish_score = 6 * 150,         -- 900
  code_score = 9 * 150,          -- 1,350
  quiz_score = 30 * 80,          -- 2,400
  firewall_score = 40 * 20,      -- 800
  total_score = (30 * 100) + (6 * 150) + (9 * 150) + (30 * 80) + (40 * 20)  -- 8,450
WHERE username = (SELECT username FROM leaderboard_scores ORDER BY username LIMIT 1 OFFSET 2);

-- Step 4: Verify the updated scores
SELECT '=== UPDATED leaderboard_scores ===' as info;
SELECT 
  rank,
  username,
  total_score,
  ctf_score,
  phish_score,
  code_score,
  quiz_score,
  firewall_score,
  ctf_solved_count,
  phish_solved_count,
  code_solved_count,
  quiz_correct,
  firewall_best_score
FROM leaderboard_scores
ORDER BY total_score DESC;

-- Step 5: Test the leaderboard_view
SELECT '=== LEADERBOARD_VIEW ===' as info;
SELECT 
  rank,
  username,
  name,
  total_score,
  ctf_solved_count,
  phish_solved_count,
  code_solved_count,
  quiz_correct,
  firewall_best_score
FROM leaderboard_view
ORDER BY rank;

-- Step 6: Calculate progress percentages like the dashboard does
SELECT '=== PROGRESS PERCENTAGES ===' as info;
SELECT 
  username,
  ctf_solved_count,
  ROUND((ctf_solved_count::float / 100) * 100, 2) as ctf_percent,
  phish_solved_count,
  ROUND((phish_solved_count::float / 20) * 100, 2) as phish_percent,
  code_solved_count,
  ROUND((code_solved_count::float / 30) * 100, 2) as code_percent,
  quiz_correct,
  ROUND((quiz_correct::float / 100) * 100, 2) as quiz_percent,
  firewall_best_score,
  ROUND((firewall_best_score::float / 100) * 100, 2) as firewall_percent,
  ROUND(
    (
      ((ctf_solved_count::float / 100) * 100) +
      ((phish_solved_count::float / 20) * 100) +
      ((code_solved_count::float / 30) * 100) +
      ((quiz_correct::float / 100) * 100) +
      ((firewall_best_score::float / 100) * 100)
    ) / 5,
    2
  ) as overall_percent
FROM leaderboard_scores
ORDER BY username;
