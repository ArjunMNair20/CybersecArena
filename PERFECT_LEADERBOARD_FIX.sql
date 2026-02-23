-- ======================================================
-- COMPLETE LEADERBOARD DIAGNOSTIC & FIX
-- Find and fix all issues
-- ======================================================

-- STEP 1: Check database state
SELECT 'DATABASE STATE CHECK' as section;

-- How many users total?
SELECT COUNT(*) as total_users_leaderboard FROM leaderboard_scores;
SELECT COUNT(*) as total_users_progress FROM user_progress;

-- Do users exist in auth?
SELECT COUNT(*) as total_auth_users FROM auth.users;

-- STEP 2: Compare data between tables
SELECT 'COMPARISON: leaderboard_scores vs user_progress' as section;

SELECT 
  ls.username,
  ls.total_score as lb_score,
  ls.ctf_solved_count as lb_ctf,
  ls.phish_solved_count as lb_phish,
  ls.code_solved_count as lb_code,
  ls.quiz_correct as lb_quiz,
  COALESCE(array_length(up.ctf_solved_ids, 1), 0) as up_ctf,
  COALESCE(array_length(up.phish_solved_ids, 1), 0) as up_phish,
  COALESCE(array_length(up.code_solved_ids, 1), 0) as up_code,
  up.quiz_correct as up_quiz
FROM leaderboard_scores ls
LEFT JOIN user_progress up ON ls.user_id = up.user_id
ORDER BY ls.username;

-- STEP 3: Show users with mismatched data
SELECT 'MISMATCHED DATA' as section;

SELECT 
  ls.username,
  'Leaderboard has: CTF=' || COALESCE(ls.ctf_solved_count, 0) || 
  ', Phish=' || COALESCE(ls.phish_solved_count, 0) || 
  ', Code=' || COALESCE(ls.code_solved_count, 0) || 
  ', Quiz=' || COALESCE(ls.quiz_correct, 0) as leaderboard_data,
  'Progress has: CTF=' || COALESCE(array_length(up.ctf_solved_ids, 1), 0) || 
  ', Phish=' || COALESCE(array_length(up.phish_solved_ids, 1), 0) || 
  ', Code=' || COALESCE(array_length(up.code_solved_ids, 1), 0) || 
  ', Quiz=' || up.quiz_correct as progress_data
FROM leaderboard_scores ls
LEFT JOIN user_progress up ON ls.user_id = up.user_id
WHERE ls.ctf_solved_count != COALESCE(array_length(up.ctf_solved_ids, 1), 0)
   OR ls.phish_solved_count != COALESCE(array_length(up.phish_solved_ids, 1), 0)
   OR ls.code_solved_count != COALESCE(array_length(up.code_solved_ids, 1), 0)
   OR ls.quiz_correct != up.quiz_correct;

-- STEP 4: Full reset - sync from user_progress to leaderboard_scores
SELECT 'PERFORMING FULL SYNC' as section;

UPDATE leaderboard_scores ls
SET 
  ctf_solved_count = COALESCE(array_length(up.ctf_solved_ids, 1), 0),
  phish_solved_count = COALESCE(array_length(up.phish_solved_ids, 1), 0),
  code_solved_count = COALESCE(array_length(up.code_solved_ids, 1), 0),
  quiz_answered = COALESCE(up.quiz_answered, 0),
  quiz_correct = COALESCE(up.quiz_correct, 0),
  firewall_best_score = COALESCE(up.firewall_best_score, 0)
FROM user_progress up
WHERE ls.user_id = up.user_id;

SELECT 'Progress counts synced from user_progress' as status;

-- STEP 5: Recalculate all scores with CORRECT formula
-- CTF max=67, Phish max=145, Code max=50, Quiz max=79, Firewall max=100
SELECT 'RECALCULATING SCORES' as section;

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

SELECT 'All scores recalculated' as status;

-- STEP 6: PERFECT LEADERBOARD - Final Display
SELECT 'PERFECT LEADERBOARD' as section;

SELECT 
  ROW_NUMBER() OVER (ORDER BY total_score DESC, username ASC) as "Rank",
  username as "Player",
  total_score as "Score",
  ROUND(
    (LEAST(100, (ctf_solved_count::float / 67) * 100) +
     LEAST(100, (phish_solved_count::float / 145) * 100) +
     LEAST(100, (code_solved_count::float / 50) * 100) +
     LEAST(100, (quiz_correct::float / 79) * 100) +
     LEAST(100, (firewall_best_score::float / 100) * 100)) / 5
  )::int as "Progress %",
  ctf_solved_count as "CTF",
  phish_solved_count as "Phish",
  code_solved_count as "Code",
  quiz_correct as "Quiz",
  firewall_best_score as "Firewall"
FROM leaderboard_scores
ORDER BY total_score DESC, username ASC;

-- STEP 7: Detailed breakdown for each user
SELECT 'DETAILED USER BREAKDOWN' as section;

SELECT 
  username,
  total_score,
  'CTF: ' || ctf_solved_count || '/67 (' || ROUND((ctf_solved_count::float/67)*100)::int || '%) = ' || ctf_score || '/1000' as ctf_breakdown,
  'Phish: ' || phish_solved_count || '/145 (' || ROUND((phish_solved_count::float/145)*100)::int || '%) = ' || phish_score || '/1000' as phish_breakdown,
  'Code: ' || code_solved_count || '/50 (' || ROUND((code_solved_count::float/50)*100)::int || '%) = ' || code_score || '/1000' as code_breakdown,
  'Quiz: ' || quiz_correct || '/79 (' || ROUND((quiz_correct::float/79)*100)::int || '%) = ' || quiz_score || '/1000' as quiz_breakdown,
  'Firewall: ' || firewall_best_score || '/100 (' || firewall_best_score || '%) = ' || firewall_score || '/1000' as firewall_breakdown
FROM leaderboard_scores
ORDER BY total_score DESC;

-- STEP 8: Summary statistics
SELECT 'LEADERBOARD SUMMARY' as section;

SELECT 
  COUNT(*) as "Total Users",
  COUNT(CASE WHEN total_score > 0 THEN 1 END) as "Users with Progress",
  ROUND(AVG(total_score)::numeric, 2) as "Average Score",
  MAX(total_score) as "Highest Score",
  MIN(total_score) as "Lowest Score",
  ROUND(AVG(
    ((LEAST(100, (ctf_solved_count::float / 67) * 100) +
     LEAST(100, (phish_solved_count::float / 145) * 100) +
     LEAST(100, (code_solved_count::float / 50) * 100) +
     LEAST(100, (quiz_correct::float / 79) * 100) +
     LEAST(100, (firewall_best_score::float / 100) * 100)) / 5)
  )::numeric, 2) as "Average Progress %"
FROM leaderboard_scores;

SELECT '✅ LEADERBOARD FIXED AND PERFECTED!' as result;
