-- ============================================
-- SYNC REAL USER PROGRESS TO LEADERBOARD
-- ============================================
-- This script syncs actual user progress to the database
-- Update the values below based on your Dashboard "Your Progress" display

-- STEP 1: First, check your current leaderboard_scores
SELECT 'CURRENT DATABASE STATE:' as info;
SELECT username, total_score, ctf_solved_count, phish_solved_count, 
       code_solved_count, quiz_correct, firewall_best_score 
FROM leaderboard_scores 
ORDER BY username;

-- STEP 2: Update with YOUR REAL progress values
-- FROM YOUR DASHBOARD, REPLACE THESE VALUES:
-- If your dashboard shows: CTF: 9, Phish: 2, Code: 3, Quiz: 9, Firewall: 50
-- Then the UPDATE below should use those exact numbers

-- UPDATE FOR YOUR USER (find your username and update this):
UPDATE leaderboard_scores 
SET 
  ctf_solved_count = 9,           -- YOUR CTF count from dashboard
  phish_solved_count = 2,         -- YOUR Phish count from dashboard
  code_solved_count = 3,          -- YOUR Code count from dashboard
  quiz_answered = 80,             -- YOUR Quiz answered from dashboard
  quiz_correct = 9,               -- YOUR Quiz correct from dashboard
  firewall_best_score = 50,       -- YOUR Firewall score from dashboard
  -- Calculate scores based on these counts
  ctf_score = 9 * 100,            -- 900
  phish_score = 2 * 150,          -- 300
  code_score = 3 * 150,           -- 450
  quiz_score = 9 * 80,            -- 720
  firewall_score = 50 * 20,       -- 1000
  total_score = (9 * 100) + (2 * 150) + (3 * 150) + (9 * 80) + (50 * 20),  -- 3370
  last_updated = NOW()
WHERE username = 'YOUR_USERNAME_HERE';  -- CHANGE THIS TO YOUR USERNAME

-- STEP 3: Verify it updated
SELECT 'AFTER UPDATE:' as info;
SELECT username, total_score, ctf_solved_count, phish_solved_count, 
       code_solved_count, quiz_correct, firewall_best_score 
FROM leaderboard_scores 
ORDER BY username;

-- STEP 4: View in leaderboard format
SELECT 'LEADERBOARD VIEW:' as info;
SELECT rank, username, name, total_score, ctf_solved_count, phish_solved_count, 
       code_solved_count, quiz_correct 
FROM leaderboard_view 
ORDER BY rank;
