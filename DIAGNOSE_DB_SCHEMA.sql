-- ======================================================
-- DIAGNOSE DATABASE SCHEMA
-- Find out what tables exist and what data we have
-- ======================================================

-- STEP 1: List all tables in public schema
SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;

-- STEP 2: Check if user_progress exists
SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'user_progress') as user_progress_exists;

-- STEP 3: Check if user_profiles exists
SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'user_profiles') as user_profiles_exists;

-- STEP 4: List all columns in leaderboard_scores
SELECT column_name, data_type FROM information_schema.columns 
WHERE table_name = 'leaderboard_scores' ORDER BY ordinal_position;

-- STEP 5: Show current leaderboard_scores data
SELECT * FROM leaderboard_scores LIMIT 5;

-- STEP 6: Count leaderboard_scores entries
SELECT COUNT(*) as total_users FROM leaderboard_scores;

-- STEP 7: Check for any users with non-zero progress counts
SELECT 
  username,
  ctf_solved_count,
  phish_solved_count,
  code_solved_count,
  quiz_correct,
  total_score
FROM leaderboard_scores
WHERE ctf_solved_count > 0 
   OR phish_solved_count > 0 
   OR code_solved_count > 0 
   OR quiz_correct > 0
LIMIT 10;

-- STEP 8: Show the schema for user_profiles if it exists
SELECT column_name, data_type FROM information_schema.columns 
WHERE table_name = 'user_profiles' ORDER BY ordinal_position;
