-- Automatic leaderboard score sync trigger
-- Syncs scores to leaderboard_scores whenever user_progress is updated
-- This ensures all users' scores are updated immediately, not just the currently logged-in user

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS sync_user_progress_to_leaderboard ON user_progress;
DROP FUNCTION IF EXISTS sync_user_progress_to_leaderboard_func();

-- Function to sync user progress to leaderboard scores
CREATE OR REPLACE FUNCTION sync_user_progress_to_leaderboard_func()
RETURNS TRIGGER AS $$
DECLARE
  v_user_id uuid;
  v_username text;
  v_ctf_count integer;
  v_phish_count integer;
  v_code_count integer;
  v_quiz_correct integer;
  v_firewall_best integer;
  v_ctf_score integer;
  v_phish_score integer;
  v_code_score integer;
  v_quiz_score integer;
  v_firewall_score integer;
  v_total_score integer;
BEGIN
  -- Get the user_id from the trigger
  v_user_id := NEW.user_id;
  
  -- Get the username from user_profiles
  SELECT username INTO v_username
  FROM user_profiles
  WHERE id = v_user_id;
  
  -- If user profile doesn't exist, return without updating leaderboard
  IF v_username IS NULL OR v_username = '' THEN
    RETURN NEW;
  END IF;
  
  -- Calculate solved counts from arrays
  v_ctf_count := COALESCE(array_length(NEW.ctf_solved_ids, 1), 0);
  v_phish_count := COALESCE(array_length(NEW.phish_solved_ids, 1), 0);
  v_code_count := COALESCE(array_length(NEW.code_solved_ids, 1), 0);
  v_quiz_correct := COALESCE(NEW.quiz_correct, 0);
  v_firewall_best := COALESCE(NEW.firewall_best_score, 0);
  
  -- Calculate individual scores
  v_ctf_score := v_ctf_count * 100;
  v_phish_score := v_phish_count * 150;
  v_code_score := v_code_count * 150;
  v_quiz_score := v_quiz_correct * 80;
  v_firewall_score := v_firewall_best * 20;
  
  -- Calculate total score
  v_total_score := v_ctf_score + v_phish_score + v_code_score + v_quiz_score + v_firewall_score;
  
  -- Update or insert into leaderboard_scores
  INSERT INTO leaderboard_scores (
    user_id,
    username,
    total_score,
    ctf_score,
    phish_score,
    code_score,
    quiz_score,
    firewall_score,
    last_updated
  ) VALUES (
    v_user_id,
    LOWER(v_username),
    v_total_score,
    v_ctf_score,
    v_phish_score,
    v_code_score,
    v_quiz_score,
    v_firewall_score,
    now()
  )
  ON CONFLICT (user_id) DO UPDATE SET
    username = LOWER(v_username),
    total_score = v_total_score,
    ctf_score = v_ctf_score,
    phish_score = v_phish_score,
    code_score = v_code_score,
    quiz_score = v_quiz_score,
    firewall_score = v_firewall_score,
    last_updated = now();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger on user_progress table
-- This trigger fires AFTER any UPDATE to user_progress
-- It automatically syncs the user's latest progress to leaderboard_scores
CREATE TRIGGER sync_user_progress_to_leaderboard
  AFTER UPDATE ON user_progress
  FOR EACH ROW
  EXECUTE FUNCTION sync_user_progress_to_leaderboard_func();

-- Also create a trigger for INSERT to handle cases where progress is newly created
DROP TRIGGER IF EXISTS sync_new_user_progress_to_leaderboard ON user_progress;

CREATE TRIGGER sync_new_user_progress_to_leaderboard
  AFTER INSERT ON user_progress
  FOR EACH ROW
  EXECUTE FUNCTION sync_user_progress_to_leaderboard_func();

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION sync_user_progress_to_leaderboard_func() TO authenticated;
