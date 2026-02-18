-- ============================================
-- DIAGNOSTIC: CHECK ACTUAL DATABASE STRUCTURE
-- ============================================
-- List all tables in the database

SELECT '=== ALL TABLES ===' as info;
SELECT tablename FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;

-- Check if user_progress exists
SELECT '=== USER_PROGRESS TABLE ===' as info;
SELECT EXISTS (
  SELECT 1 FROM information_schema.tables 
  WHERE table_name = 'user_progress'
) as user_progress_exists;

-- Check if leaderboard_scores exists
SELECT '=== LEADERBOARD_SCORES TABLE ===' as info;
SELECT EXISTS (
  SELECT 1 FROM information_schema.tables 
  WHERE table_name = 'leaderboard_scores'
) as leaderboard_scores_exists;

-- Show leaderboard_scores structure
SELECT '=== LEADERBOARD_SCORES COLUMNS ===' as info;
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'leaderboard_scores'
ORDER BY ordinal_position;

-- Show leaderboard_scores data
SELECT '=== LEADERBOARD_SCORES DATA ===' as info;
SELECT * FROM leaderboard_scores LIMIT 10;

-- Check user_profiles structure
SELECT '=== USER_PROFILES COLUMNS ===' as info;
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'user_profiles'
ORDER BY ordinal_position;

-- Show user_profiles data
SELECT '=== USER_PROFILES DATA ===' as info;
SELECT id, username, name FROM user_profiles LIMIT 10;

-- List all available tables to find progress data
SELECT '=== ALL AVAILABLE TABLES ===' as info;
SELECT table_schema, table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;
