-- ============================================
-- MANUAL TEST WRITE (without auth.uid())
-- ============================================
-- 
-- To use this:
-- 1. Go to your browser console (F12)
-- 2. Look for: [Leaderboard] User ID: <copy-this-value>
-- 3. Replace YOUR_USER_ID_HERE below with that value
-- 4. Run this script

SELECT '=== MANUAL TEST DATA INSERT ===' as step;

-- Replace 'YOUR_USER_ID_HERE' with your actual user ID from console
INSERT INTO leaderboard_scores (
  user_id,
  username,
  ctf_solved_count,
  phish_solved_count,
  code_solved_count,
  quiz_answered,
  quiz_correct,
  firewall_best_score,
  total_score,
  ctf_score,
  phish_score,
  code_score,
  quiz_score,
  firewall_score,
  badges
) VALUES (
  'YOUR_USER_ID_HERE',
  'arjun_m_nair',
  5,
  2,
  3,
  10,
  9,
  50,
  18,
  7,
  1,
  6,
  11,
  5,
  '[]'
)
ON CONFLICT (user_id) DO UPDATE SET
  ctf_solved_count = 5,
  phish_solved_count = 2,
  code_solved_count = 3,
  quiz_correct = 9,
  total_score = 18,
  ctf_score = 7,
  phish_score = 1,
  code_score = 6,
  quiz_score = 11,
  firewall_score = 5;

SELECT '=== VERIFY ===' as step;
SELECT 
  username,
  ctf_solved_count,
  phish_solved_count,
  code_solved_count,
  quiz_correct,
  total_score
FROM leaderboard_scores
WHERE username = 'arjun_m_nair';

SELECT '✅ If you see data above, the manual write worked!' as result;
