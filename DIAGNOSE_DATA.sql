-- ======================================================
-- DIAGNOSE: What data is actually in the database?
-- ======================================================

-- STEP 1: Check raw data in user_progress table
SELECT 'USER_PROGRESS TABLE DATA' as section;
SELECT 
  user_id,
  array_length(ctf_solved_ids, 1) as ctf_count,
  array_length(phish_solved_ids, 1) as phish_count,
  array_length(code_solved_ids, 1) as code_count,
  quiz_answered,
  quiz_correct,
  firewall_best_score,
  created_at,
  updated_at
FROM user_progress
ORDER BY updated_at DESC;

-- STEP 2: Check leaderboard_scores table
SELECT 'LEADERBOARD_SCORES TABLE DATA' as section;
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

-- STEP 3: Compare - do they match?
SELECT 'COMPARISON' as section;
SELECT 
  up.user_id,
  ls.username,
  'Progress: CTF=' || COALESCE(array_length(up.ctf_solved_ids, 1), 0) as progress_ctf,
  'Leaderboard: CTF=' || COALESCE(ls.ctf_solved_count, 0) as leaderboard_ctf,
  CASE 
    WHEN array_length(up.ctf_solved_ids, 1) = ls.ctf_solved_count THEN '✅ MATCH'
    ELSE '❌ MISMATCH'
  END as status
FROM user_progress up
LEFT JOIN leaderboard_scores ls ON up.user_id = ls.user_id;

-- STEP 4: Show total amounts
SELECT 'TOTALS' as section;
SELECT 
  'user_progress' as table_name,
  COUNT(*) as users,
  COALESCE(SUM(array_length(ctf_solved_ids, 1)), 0) as total_ctf,
  COALESCE(SUM(array_length(phish_solved_ids, 1)), 0) as total_phish,
  COALESCE(SUM(array_length(code_solved_ids, 1)), 0) as total_code,
  COALESCE(SUM(quiz_correct), 0) as total_quiz_correct
FROM user_progress

UNION ALL

SELECT 
  'leaderboard_scores' as table_name,
  COUNT(*) as users,
  COALESCE(SUM(ctf_solved_count), 0) as total_ctf,
  COALESCE(SUM(phish_solved_count), 0) as total_phish,
  COALESCE(SUM(code_solved_count), 0) as total_code,
  COALESCE(SUM(quiz_correct), 0) as total_quiz_correct
FROM leaderboard_scores;

-- STEP 5: Check specific user (your user) progress details
SELECT 'YOUR USER PROGRESS DETAILS' as section;
SELECT 
  up.user_id,
  ls.username,
  'CTF solved IDs: ' || array_to_string(up.ctf_solved_ids, ', ') as ctf_solved_ids,
  'Phish solved IDs: ' || array_to_string(up.phish_solved_ids, ', ') as phish_solved_ids,
  'Code solved IDs: ' || array_to_string(up.code_solved_ids, ', ') as code_solved_ids,
  'Quiz: ' || up.quiz_correct || ' / 79' as quiz_progress,
  'Firewall: ' || up.firewall_best_score || ' / 100' as firewall_progress
FROM user_progress up
LEFT JOIN leaderboard_scores ls ON up.user_id = ls.user_id
ORDER BY ls.total_score DESC;
