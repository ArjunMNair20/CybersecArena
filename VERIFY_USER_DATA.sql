-- ============================================
-- VERIFY USER ID MATCHING & DATA INTEGRITY
-- ============================================

-- Step 1: Check if current user exists in both signup and user_profiles
SELECT '=== CHECK: Does current user have all required entries? ===' as info;

-- This will show if there's a mismatch between signup and user_profiles
SELECT 
  'signup' as table_name,
  COUNT(*) as user_count,
  COUNT(DISTINCT id) as unique_ids
FROM signup;

SELECT 
  'user_profiles' as table_name,
  COUNT(*) as user_count,
  COUNT(DISTINCT id) as unique_ids
FROM user_profiles;

-- Step 2: Check leaderboard_scores entries
SELECT 
  'leaderboard_scores' as table_name,
  COUNT(*) as user_count,
  COUNT(DISTINCT user_id) as unique_user_ids
FROM leaderboard_scores;

-- Step 3: Show all users with their entries in each table
SELECT '=== USER DISTRIBUTION ACROSS TABLES ===' as info;

SELECT 
  p.id,
  p.username,
  p.name,
  p.email,
  CASE WHEN s.id IS NOT NULL THEN 'YES' ELSE 'NO' END as in_signup,
  CASE WHEN l.user_id IS NOT NULL THEN 'YES' ELSE 'NO' END as in_leaderboard_scores,
  COALESCE(l.total_score, 0) as current_score
FROM user_profiles p
LEFT JOIN signup s ON p.id = s.id
LEFT JOIN leaderboard_scores l ON p.id = l.user_id
ORDER BY p.username;

-- Step 4: Check for orphaned leaderboard entries (user_id not in user_profiles)
SELECT '=== ORPHANED LEADERBOARD ENTRIES ===' as info;
SELECT 
  l.id,
  l.user_id,
  l.username,
  l.total_score,
  'WARNING: user_id not found in user_profiles' as issue
FROM leaderboard_scores l
LEFT JOIN user_profiles p ON l.user_id = p.id
WHERE p.id IS NULL;

-- Step 5: Ensure every user_profile has a leaderboard_scores entry
-- If not, we need to insert them
SELECT '=== USERS MISSING FROM LEADERBOARD ===' as info;
SELECT 
  p.id,
  p.username,
  p.name,
  'MISSING: No entry in leaderboard_scores' as issue
FROM user_profiles p
LEFT JOIN leaderboard_scores l ON p.id = l.user_id
WHERE l.id IS NULL;

-- Step 6: If there are missing leaderboard entries, insert them with 0 scores
-- We'll do this conditionally
INSERT INTO leaderboard_scores (user_id, username, total_score, ctf_score, phish_score, code_score, quiz_score, firewall_score, ctf_solved_count, phish_solved_count, code_solved_count, quiz_answered, quiz_correct, firewall_best_score, badges)
SELECT 
  p.id,
  LOWER(COALESCE(p.username, 'unknown')),
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  '[]'::jsonb
FROM user_profiles p
LEFT JOIN leaderboard_scores l ON p.id = l.user_id
WHERE l.id IS NULL
ON CONFLICT (user_id) DO NOTHING;

-- Step 7: Final verification - all users should now have leaderboard entries
SELECT '=== FINAL CHECK: All users with leaderboard entries ===' as info;
SELECT 
  p.id,
  p.username,
  p.name,
  COALESCE(l.total_score, 0) as leaderboard_score
FROM user_profiles p
LEFT JOIN leaderboard_scores l ON p.id = l.user_id
ORDER BY p.username;
