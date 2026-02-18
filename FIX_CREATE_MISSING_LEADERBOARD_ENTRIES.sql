-- FIX: Create missing leaderboard entries for all users

-- STEP 1: Create function to sync all users to leaderboard
CREATE OR REPLACE FUNCTION ensure_all_users_in_leaderboard()
RETURNS TABLE(created_count integer, updated_count integer) AS $$
DECLARE
  v_created_count integer := 0;
  v_updated_count integer := 0;
  v_user RECORD;
BEGIN
  -- Loop through all users with profiles and ensure they have leaderboard entries
  FOR v_user IN
    SELECT au.id, up.username
    FROM auth.users au
    INNER JOIN user_profiles up ON au.id = up.id
  LOOP
    -- Try to insert, on conflict do nothing (we'll count updates separately)
    INSERT INTO leaderboard_scores (user_id, username, total_score, ctf_score, phish_score, code_score, quiz_score, firewall_score)
    VALUES (v_user.id, v_user.username, 0, 0, 0, 0, 0, 0)
    ON CONFLICT (user_id) DO NOTHING;
    
    IF FOUND THEN
      v_created_count := v_created_count + 1;
    END IF;
  END LOOP;
  
  RETURN QUERY SELECT v_created_count, v_updated_count;
END;
$$ LANGUAGE plpgsql;

-- STEP 2: Run the function to sync existing users
SELECT * FROM ensure_all_users_in_leaderboard();

-- STEP 3: Verify - all users should now be in leaderboard
SELECT COUNT(*) as total_leaderboard_entries FROM leaderboard_scores;

-- STEP 4: Show the complete leaderboard
SELECT 
  ls.user_id,
  ls.username,
  COALESCE(up.name, ls.username) as display_name,
  ls.total_score,
  ROW_NUMBER() OVER (ORDER BY ls.total_score DESC) as rank
FROM leaderboard_scores ls
LEFT JOIN user_profiles up ON ls.user_id = up.id
ORDER BY ls.total_score DESC;

-- STEP 5: Double-check the view shows all users
SELECT COUNT(*) as view_user_count FROM leaderboard_view;

-- Show the exact 5 users from view
SELECT * FROM leaderboard_view LIMIT 100;
