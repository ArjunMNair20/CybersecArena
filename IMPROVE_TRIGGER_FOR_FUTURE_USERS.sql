-- BONUS: Improve the trigger to ensure all new users get leaderboard entries

-- Update the handle_new_user trigger function to be more robust
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_username text;
BEGIN
  -- Generate username if not provided
  v_username := COALESCE(
    NEW.raw_user_meta_data->>'username', 
    'user_' || substr(NEW.id::text, 1, 8)
  );
  
  -- Create user profile (most important - must succeed)
  INSERT INTO user_profiles (id, username, email, name)
  VALUES (
    NEW.id,
    v_username,
    NEW.email,
    NEW.raw_user_meta_data->>'name'
  )
  ON CONFLICT (id) DO NOTHING;
  
  -- Create user progress (optional)
  INSERT INTO user_progress (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  
  -- Create leaderboard entry (important for visibility)
  -- Initialize with 0 scores - will be populated as user plays
  INSERT INTO leaderboard_scores (
    user_id, 
    username, 
    total_score, 
    ctf_score, 
    phish_score, 
    code_score, 
    quiz_score, 
    firewall_score,
    ctf_solved_count,
    phish_solved_count,
    code_solved_count,
    quiz_answered,
    quiz_correct,
    firewall_best_score,
    badges
  )
  VALUES (
    NEW.id,
    v_username,
    0, 0, 0, 0, 0, 0,  -- scores
    0, 0, 0, 0, 0, 0,  -- progress counts
    '{}'                -- badges
  )
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Log the error but don't fail signup - profiles are most important
  RAISE WARNING 'Error in handle_new_user for %: %', NEW.id, SQLERRM;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- The trigger is already set, but let's make sure it exists and is correct
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- Note: This trigger will now initialize leaderboard entries for ALL future signups
-- and will include the new progress columns with default 0 values
