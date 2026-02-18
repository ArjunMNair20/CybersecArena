-- Function to handle leaderboard score syncing for all users
-- This function bypasses RLS because it runs with SECURITY DEFINER
-- Can be called from client to trigger a full leaderboard sync

CREATE OR REPLACE FUNCTION sync_all_leaderboard_scores()
RETURNS TABLE(synced_count integer, error_message text) AS $$
DECLARE
  v_synced integer := 0;
  v_failed integer := 0;
  v_user_progress RECORD;
  v_ctf_score integer;
  v_phish_score integer;
  v_code_score integer;
  v_quiz_score integer;
  v_firewall_score integer;
  v_total_score integer;
  v_username text;
BEGIN
  -- Loop through all user progress records
  FOR v_user_progress IN
    SELECT user_id, ctf_solved_ids, phish_solved_ids, code_solved_ids, quiz_correct, firewall_best_score
    FROM user_progress
  LOOP
    BEGIN
      -- Get the username from user_profiles
      SELECT username INTO v_username
      FROM user_profiles
      WHERE id = v_user_progress.user_id;

      IF v_username IS NULL THEN
        -- Skip if no profile found
        CONTINUE;
      END IF;

      -- Calculate scores
      v_ctf_score := COALESCE(array_length(v_user_progress.ctf_solved_ids, 1), 0) * 100;
      v_phish_score := COALESCE(array_length(v_user_progress.phish_solved_ids, 1), 0) * 150;
      v_code_score := COALESCE(array_length(v_user_progress.code_solved_ids, 1), 0) * 150;
      v_quiz_score := COALESCE(v_user_progress.quiz_correct, 0) * 80;
      v_firewall_score := COALESCE(v_user_progress.firewall_best_score, 0) * 20;
      v_total_score := v_ctf_score + v_phish_score + v_code_score + v_quiz_score + v_firewall_score;

      -- Upsert into leaderboard_scores
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
        v_user_progress.user_id,
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

      v_synced := v_synced + 1;

    EXCEPTION WHEN OTHERS THEN
      v_failed := v_failed + 1;
      RAISE WARNING 'Failed to sync user %: %', v_user_progress.user_id, SQLERRM;
    END;
  END LOOP;

  RETURN QUERY SELECT v_synced, 'Synced ' || v_synced || ' users, failed: ' || v_failed;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permission to authenticated users
GRANT EXECUTE ON FUNCTION sync_all_leaderboard_scores() TO authenticated;

-- Test the function
-- SELECT * FROM sync_all_leaderboard_scores();
