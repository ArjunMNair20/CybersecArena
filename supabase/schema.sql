-- CyberSec Arena Database Schema
-- Run this SQL in your Supabase SQL Editor

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. USER PROFILES TABLE
-- ============================================
-- Stores user profile information linked to Supabase Auth
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username text UNIQUE NOT NULL,
  name text,
  email text NOT NULL,
  avatar_url text,
  bio text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT username_length CHECK (char_length(username) >= 3),
  CONSTRAINT username_format CHECK (username ~ '^[a-zA-Z0-9_]+$')
);

-- Index for faster username lookups
CREATE INDEX IF NOT EXISTS idx_user_profiles_username ON user_profiles(username);
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);

-- ============================================
-- 2. USER PROGRESS TABLE
-- ============================================
-- Stores game progress for each user
CREATE TABLE IF NOT EXISTS user_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  ctf_solved_ids text[] DEFAULT '{}',
  phish_solved_ids text[] DEFAULT '{}',
  code_solved_ids text[] DEFAULT '{}',
  quiz_answered integer DEFAULT 0,
  quiz_correct integer DEFAULT 0,
  quiz_difficulty text DEFAULT 'easy' CHECK (quiz_difficulty IN ('easy', 'medium', 'hard', 'adaptive')),
  firewall_best_score integer DEFAULT 0,
  badges text[] DEFAULT '{}',
  total_score integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Index for faster user progress lookups
CREATE INDEX IF NOT EXISTS idx_user_progress_user_id ON user_progress(user_id);

-- ============================================
-- 3. LEADERBOARD SCORES TABLE
-- ============================================
-- Stores leaderboard information
CREATE TABLE IF NOT EXISTS leaderboard_scores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  username text NOT NULL,
  total_score integer DEFAULT 0,
  ctf_score integer DEFAULT 0,
  phish_score integer DEFAULT 0,
  code_score integer DEFAULT 0,
  quiz_score integer DEFAULT 0,
  firewall_score integer DEFAULT 0,
  last_updated timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Index for leaderboard queries (ordered by score)
CREATE INDEX IF NOT EXISTS idx_leaderboard_scores_total_score ON leaderboard_scores(total_score DESC);
CREATE INDEX IF NOT EXISTS idx_leaderboard_scores_user_id ON leaderboard_scores(user_id);

-- ============================================
-- 4. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE leaderboard_scores ENABLE ROW LEVEL SECURITY;

-- User Profiles Policies
-- Users can read their own profile
CREATE POLICY "Users can view their own profile"
  ON user_profiles FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update their own profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = id);

-- Users can insert their own profile
CREATE POLICY "Users can insert their own profile"
  ON user_profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Public profiles can be viewed by authenticated users (for leaderboard)
CREATE POLICY "Authenticated users can view public profiles"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (true);

-- User Progress Policies
-- Users can read their own progress
CREATE POLICY "Users can view their own progress"
  ON user_progress FOR SELECT
  USING (auth.uid() = user_id);

-- Users can update their own progress
CREATE POLICY "Users can update their own progress"
  ON user_progress FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can insert their own progress
CREATE POLICY "Users can insert their own progress"
  ON user_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Leaderboard Scores Policies
-- Anyone can read leaderboard (public)
CREATE POLICY "Anyone can view leaderboard"
  ON leaderboard_scores FOR SELECT
  TO authenticated
  USING (true);

-- Users can update their own leaderboard entry
CREATE POLICY "Users can update their own leaderboard entry"
  ON leaderboard_scores FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can insert their own leaderboard entry
CREATE POLICY "Users can insert their own leaderboard entry"
  ON leaderboard_scores FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ============================================
-- 5. FUNCTIONS AND TRIGGERS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers to automatically update updated_at
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_progress_updated_at
  BEFORE UPDATE ON user_progress
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_leaderboard_scores_updated_at
  BEFORE UPDATE ON leaderboard_scores
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to automatically create user profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_profiles (id, username, email, name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', 'user_' || substr(NEW.id::text, 1, 8)),
    NEW.email,
    NEW.raw_user_meta_data->>'name'
  )
  ON CONFLICT (id) DO NOTHING;
  
  INSERT INTO user_progress (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile when user signs up
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- Function to sync username to leaderboard
CREATE OR REPLACE FUNCTION sync_leaderboard_username()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE leaderboard_scores
  SET username = NEW.username
  WHERE user_id = NEW.id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update leaderboard username when profile username changes
CREATE TRIGGER sync_username_to_leaderboard
  AFTER UPDATE OF username ON user_profiles
  FOR EACH ROW
  WHEN (OLD.username IS DISTINCT FROM NEW.username)
  EXECUTE FUNCTION sync_leaderboard_username();

-- ============================================
-- 6. HELPER VIEWS
-- ============================================

-- View for leaderboard with user information
CREATE OR REPLACE VIEW leaderboard_view AS
SELECT 
  ls.id,
  ls.user_id,
  ls.username,
  up.name,
  up.avatar_url,
  ls.total_score,
  ls.ctf_score,
  ls.phish_score,
  ls.code_score,
  ls.quiz_score,
  ls.firewall_score,
  ls.last_updated,
  ROW_NUMBER() OVER (ORDER BY ls.total_score DESC, ls.last_updated ASC) as rank
FROM leaderboard_scores ls
LEFT JOIN user_profiles up ON ls.user_id = up.id
ORDER BY ls.total_score DESC, ls.last_updated ASC;

-- Grant access to the view
GRANT SELECT ON leaderboard_view TO authenticated;

-- ============================================
-- 7. INITIAL DATA (Optional)
-- ============================================

-- You can add any initial data here if needed

