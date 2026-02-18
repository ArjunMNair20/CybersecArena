# 🔧 Fix: Scores Not Showing in Leaderboard

## Problem
The leaderboard is displaying users but scores are showing as 0 or blank.

## Root Cause
The `leaderboard_scores` table is missing individual score columns that the application code expects:
- `ctf_score`, `phish_score`, `code_score`, `quiz_score`, `firewall_score`
- Progress tracking columns: `ctf_solved_count`, `phish_solved_count`, `code_solved_count`, etc.

## Solution - Run This SQL Migration

### Step 1: Open Supabase SQL Editor
1. Go to your Supabase Project
2. Click on "SQL Editor" in the left menu
3. Click "New Query"

### Step 2: Copy and Paste This SQL
```sql
-- Add missing score columns to leaderboard_scores table
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
```

### Step 3: Click "Run"
- Wait for confirmation message
- You should see "✓ Success"

### Step 4: Verify the Changes
Copy and paste this verification query:
```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'leaderboard_scores' 
ORDER BY ordinal_position;
```
This should show all columns including the new score columns.

### Step 5: Test in Your App
1. Refresh your application in the browser
2. Go to Leaderboard
3. Complete a challenge (CTF, Phishing, Code, etc.)
4. Return to Leaderboard
5. Your score should now display!

## What This Does
- ✅ Adds individual score columns for each challenge type
- ✅ Adds progress tracking columns (solved counts, quiz answered, etc.)
- ✅ Uses `IF NOT EXISTS` so it's safe to run multiple times
- ✅ Sets default values to 0
- ✅ No data loss - existing data is preserved

## After Completing This
All users who complete challenges will have their scores properly recorded and displayed on the leaderboard in real-time.

---

**SQL File Location:** `LEADERBOARD_SCHEMA_FIX.sql` (also available in this project)
