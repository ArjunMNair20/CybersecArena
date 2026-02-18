-- ============================================
-- POPULATE LEADERBOARD WITH TEST DATA
-- ============================================
-- Since there's no user_progress table, populate leaderboard_scores directly

-- Step 1: Check current leaderboard_scores data
SELECT '=== CURRENT LEADERBOARD_SCORES ===' as info;
SELECT * FROM leaderboard_scores ORDER BY total_score DESC;

-- Step 2: Check user_profiles 
SELECT '=== USERS IN PROFILES ===' as info;
SELECT id, username, name FROM user_profiles;

-- Step 3: Update leaderboard_scores with sample score data
-- This assigns different scores to each user
UPDATE leaderboard_scores
SET 
  ctf_score = 500,
  phish_score = 450,
  code_score = 300,
  quiz_score = 160,
  firewall_score = 100,
  total_score = 500 + 450 + 300 + 160 + 100,
  ctf_solved_count = 5,
  phish_solved_count = 3,
  code_solved_count = 2,
  quiz_correct = 2,
  firewall_best_score = 5
WHERE user_id IN (SELECT id FROM user_profiles LIMIT 1);

UPDATE leaderboard_scores
SET 
  ctf_score = 400,
  phish_score = 300,
  code_score = 150,
  quiz_score = 240,
  firewall_score = 80,
  total_score = 400 + 300 + 150 + 240 + 80,
  ctf_solved_count = 4,
  phish_solved_count = 2,
  code_solved_count = 1,
  quiz_correct = 3,
  firewall_best_score = 4
WHERE user_id IN (SELECT id FROM user_profiles LIMIT 1 OFFSET 1);

UPDATE leaderboard_scores
SET 
  ctf_score = 300,
  phish_score = 225,
  code_score = 300,
  quiz_score = 80,
  firewall_score = 60,
  total_score = 300 + 225 + 300 + 80 + 60,
  ctf_solved_count = 3,
  phish_solved_count = 1.5,
  code_solved_count = 2,
  quiz_correct = 1,
  firewall_best_score = 3
WHERE user_id IN (SELECT id FROM user_profiles LIMIT 1 OFFSET 2);

UPDATE leaderboard_scores
SET 
  ctf_score = 200,
  phish_score = 150,
  code_score = 150,
  quiz_score = 160,
  firewall_score = 40,
  total_score = 200 + 150 + 150 + 160 + 40,
  ctf_solved_count = 2,
  phish_solved_count = 1,
  code_solved_count = 1,
  quiz_correct = 2,
  firewall_best_score = 2
WHERE user_id IN (SELECT id FROM user_profiles LIMIT 1 OFFSET 3);

UPDATE leaderboard_scores
SET 
  ctf_score = 100,
  phish_score = 150,
  code_score = 0,
  quiz_score = 80,
  firewall_score = 20,
  total_score = 100 + 150 + 0 + 80 + 20,
  ctf_solved_count = 1,
  phish_solved_count = 1,
  code_solved_count = 0,
  quiz_correct = 1,
  firewall_best_score = 1
WHERE user_id IN (SELECT id FROM user_profiles LIMIT 1 OFFSET 4);

-- Step 4: Verify leaderboard_scores is populated
SELECT '=== UPDATED LEADERBOARD_SCORES ===' as info;
SELECT 
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
  quiz_correct
FROM leaderboard_scores
ORDER BY total_score DESC;

-- Step 5: Test the view
SELECT '=== LEADERBOARD_VIEW ===' as info;
SELECT 
  rank,
  username,
  COALESCE(name, 'N/A') as name,
  total_score,
  ctf_solved_count,
  phish_solved_count,
  code_solved_count,
  quiz_correct,
  firewall_best_score
FROM leaderboard_view
ORDER BY rank
LIMIT 10;

-- Step 6: Count records
SELECT '=== SUMMARY ===' as info;
SELECT 
  COUNT(*) as total_users,
  SUM(total_score) as combined_score,
  MAX(total_score) as highest_score,
  MIN(total_score) as lowest_score
FROM leaderboard_scores;
