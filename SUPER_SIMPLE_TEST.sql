-- ======================================================
-- 🛠️ SUPER SIMPLE TEST
-- Copy and run EACH section separately in Supabase SQL Editor
-- Report the results!
-- ======================================================

-- ✅ TEST 1: Can you READ from leaderboard?
-- Expected: See 1 row
SELECT COUNT(*) as "Users in leaderboard:" FROM leaderboard_scores LIMIT 1;

-- ✅ TEST 2: What RLS policies exist?
-- Expected: Should see 3 policies (read, update, insert)
SELECT policyname FROM pg_policies 
WHERE tablename = 'leaderboard_scores';

-- ✅ TEST 3: Is RLS actually enabled?
-- Expected: rowsecurity = true
SELECT rowsecurity FROM pg_tables 
WHERE tablename = 'leaderboard_scores';

-- ✅ TEST 4: Get your User ID
-- Expected: A long UUID string
SELECT id FROM auth.users LIMIT 1;

-- ✅ TEST 5: Try to READ your row (as authenticated user)
-- Expected: See one row with your data
-- If fails: "permission denied" → RLS blocking reads (shouldn't happen)
SELECT user_id, username, total_score FROM leaderboard_scores 
WHERE user_id = (SELECT id FROM auth.users LIMIT 1);

-- ✅ TEST 6: Try to UPDATE your row
-- If this works → Problem is elsewhere
-- If fails with "policy": → RLS policies wrong
UPDATE leaderboard_scores 
SET total_score = 123
WHERE user_id = (SELECT id FROM auth.users LIMIT 1);

-- Check if it worked
SELECT user_id, total_score FROM leaderboard_scores 
WHERE user_id = (SELECT id FROM auth.users LIMIT 1);

-- ✅ TEST 7: Check what columns actually exist
-- This tells us what columns the table has
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'leaderboard_scores'
ORDER BY ordinal_position;

-- ======================================================
-- 📋 REPORT BACK WITH:
-- ======================================================
-- TEST 1 result: (should see 1)
--
-- TEST 2 result: (policy names)
--
-- TEST 3 result: (true or false?)
--
-- TEST 4 result: (your user ID - a long string)
--
-- TEST 5 result: (see your row or error?)
--
-- TEST 6 result: (update successful or error?)
--
-- ======================================================
