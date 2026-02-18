-- ============================================
-- LEADERBOARD SCHEMA FIX
-- Run this in Supabase SQL Editor to add missing score columns
-- ============================================

-- ALTER leaderboard_scores table to add individual score columns
ALTER TABLE leaderboard_scores
ADD COLUMN IF NOT EXISTS ctf_score integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS phish_score integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS code_score integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS quiz_score integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS firewall_score integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS ctf_solved_count integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS phish_solved_count integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS code_solved_count integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS quiz_answered integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS quiz_correct integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS firewall_best_score integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS badges jsonb DEFAULT '[]'::jsonb;

-- Verify the table structure
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'leaderboard_scores' 
ORDER BY ordinal_position;

-- Verify some entries exist
SELECT user_id, username, total_score, ctf_score, phish_score, code_score, quiz_score, firewall_score 
FROM leaderboard_scores 
LIMIT 10;
