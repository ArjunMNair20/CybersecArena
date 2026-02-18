-- ============================================
-- TEST: Can we write to leaderboard_scores?
-- ============================================

-- Step 1: Check RLS policies
SELECT '=== RLS POLICIES ===' as step;
SELECT 
  tablename,
  policyname,
  permissive,
  roles,
  qual::TEXT as rule
FROM pg_policies
WHERE tablename = 'leaderboard_scores'
ORDER BY policyname;

-- Step 2: Try a test update (pick first user and change their score)
SELECT '=== BEFORE UPDATE ===' as step;
SELECT 
  user_id,
  username,
  total_score,
  ctf_solved_count
FROM leaderboard_scores
LIMIT 1;

-- Step 3: Test update
UPDATE leaderboard_scores
SET 
  ctf_solved_count = 999,
  total_score = 999
WHERE user_id = (SELECT user_id FROM leaderboard_scores LIMIT 1);

-- Step 4: Check if update worked
SELECT '=== AFTER UPDATE ===' as step;
SELECT 
  user_id,
  username,
  total_score,
  ctf_solved_count
FROM leaderboard_scores
LIMIT 1;

-- Step 5: Reset back to 0
UPDATE leaderboard_scores
SET 
  ctf_solved_count = 0,
  total_score = 0
WHERE user_id = (SELECT user_id FROM leaderboard_scores LIMIT 1);

-- Step 6: Verify reset
SELECT '=== AFTER RESET ===' as step;
SELECT 
  user_id,
  username,
  total_score,
  ctf_solved_count
FROM leaderboard_scores
LIMIT 1;
