-- ============================================
-- TEST: Can database accept direct writes?
-- ============================================

-- Test data for a known user (Arjun)
-- You'll need to find the exact user_id from your app console

SELECT '=== TEST INSERT ===' as step;

-- INSERT TEST (replace the ID with your actual user ID from console)
-- Your User ID should show in browser console as [Leaderboard] User ID: <value>
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
)
VALUES (
  '12345678-1234-1234-1234-123456789abc',  -- REPLACE WITH YOUR USER ID
  'test_user',
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
  '[]'::jsonb
)
ON CONFLICT (user_id) DO UPDATE SET
  ctf_solved_count = 5,
  phish_solved_count = 2,
  code_solved_count = 3,
  quiz_correct = 9,
  total_score = 18;

SELECT '=== VERIFY INSERT ===' as step;
SELECT 
  username,
  ctf_solved_count,
  phish_solved_count,
  code_solved_count,
  quiz_correct,
  total_score
FROM leaderboard_scores
WHERE username = 'test_user' OR ctf_solved_count = 5;

SELECT '✅ TEST COMPLETE' as done;
