-- ============================================
-- MANUAL DIRECT SYNC - TEST IF DATABASE UPDATES WORK
-- ============================================
-- This script directly updates leaderboard_scores
-- to test if the UPDATE/UPSERT operations work at all

-- Step 1: Check current user IDs
SELECT '=== STEP 1: List all users ===' as step;
SELECT id, username, name FROM user_profiles ORDER BY username;

-- Step 2: Manually set test scores for first user in leaderboard_scores
-- Change the scores to some test values to see if they update
UPDATE leaderboard_scores 
SET 
  ctf_solved_count = 9,
  phish_solved_count = 2,
  code_solved_count = 3,
  quiz_answered = 80,
  quiz_correct = 9,
  firewall_best_score = 50,
  ctf_score = 9 * 100,      -- 900
  phish_score = 2 * 150,    -- 300
  code_score = 3 * 150,     -- 450
  quiz_score = 9 * 80,      -- 720
  firewall_score = 50 * 20, -- 1000
  total_score = (9 * 100) + (2 * 150) + (3 * 150) + (9 * 80) + (50 * 20)  -- 3,370
WHERE username = (SELECT username FROM leaderboard_scores ORDER BY username LIMIT 1);

-- Step 3: Verify the update worked
SELECT '=== STEP 3: After manual update ===' as step;
SELECT 
  username,
  total_score,
  ctf_solved_count,
  phish_solved_count,
  code_solved_count,
  quiz_correct,
  firewall_best_score
FROM leaderboard_scores
ORDER BY username;

-- Step 4: Populate all remaining users with test data
UPDATE leaderboard_scores 
SET 
  ctf_solved_count = 60,
  phish_solved_count = 12,
  code_solved_count = 18,
  quiz_answered = 100,
  quiz_correct = 60,
  firewall_best_score = 70,
  ctf_score = 60 * 100,
  phish_score = 12 * 150,
  code_score = 18 * 150,
  quiz_score = 60 * 80,
  firewall_score = 70 * 20,
  total_score = (60 * 100) + (12 * 150) + (18 * 150) + (60 * 80) + (70 * 20)
WHERE username != (SELECT username FROM leaderboard_scores ORDER BY username LIMIT 1);

-- Step 5: Final check - should now show non-zero scores
SELECT '=== STEP 5: Final leaderboard state ===' as step;
SELECT 
  username,
  total_score,
  ctf_solved_count,
  phish_solved_count,
  code_solved_count,
  quiz_correct,
  firewall_best_score
FROM leaderboard_scores
ORDER BY total_score DESC;

-- Step 6: Test leaderboard_view displays correctly
SELECT '=== STEP 6: Leaderboard view test ===' as step;
SELECT 
  rank,
  username,
  name,
  total_score,
  ctf_solved_count,
  phish_solved_count,
  code_solved_count,
  quiz_correct
FROM leaderboard_view
ORDER BY rank;
