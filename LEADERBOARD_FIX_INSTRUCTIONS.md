# Leaderboard User Data & Score Display Fix

## Problem
The leaderboard was not displaying user data and progress details (solved counts, quiz answers, etc.) properly. Users' positions and scores weren't showing up correctly, and progress information was missing from the leaderboard view.

## Root Cause
The `leaderboard_scores` table was missing progress detail columns, and when the view-based query failed, the fallback query didn't have access to completed challenge counts and other progress metrics.

## Solution Overview

### 1. Database Schema Update
Added the following columns to the `leaderboard_scores` table to store progress details alongside scores:
- `ctf_solved_count` - number of CTF challenges solved
- `phish_solved_count` - number of phishing emails identified
- `code_solved_count` - number of code challenges solved  
- `quiz_answered` - number of quiz questions answered
- `quiz_correct` - number of quiz questions answered correctly
- `firewall_best_score` - best firewall score
- `badges` - array of earned badges

This solves the RLS (Row Level Security) issue where the leaderboard couldn't fetch progress data without bypassing security policies.

### 2. Service Updates (`leaderboardService.ts`)
- Updated `getLeaderboard()` to fetch the new progress columns from `leaderboard_scores`
- Updated `performSync()` to always store progress details in the leaderboard_scores table
- Updated `ensureLeaderboardEntry()` to initialize progress columns
- Updated cache methods to include all fields for offline support
- Updated `transformViewData()` to handle progress fields from the view

### 3. UI Updates (`Leaderboard.tsx`)
- Enhanced the "Your Position" section to show user score even while loading full leaderboard entry
- Improved conditional rendering for progress details
- Better handling of undefined values with proper null coalescing

### 4. Leaderboard View Update
Updated the `leaderboard_view` to prefer stored progress columns, with fallback to user_progress table for backward compatibility.

## Migration Steps

### Step 1: Apply Database Migration
Run the SQL migration file to add progress columns:

```sql
-- File: supabase/leaderboard_progress_columns.sql
-- Run this in your Supabase SQL Editor to add the progress columns
```

Go to your Supabase dashboard:
1. Click "SQL Editor" in the left sidebar
2. Create a new query
3. Copy and paste the contents of `supabase/leaderboard_progress_columns.sql`
4. Run the query

The migration will:
- Add progress columns to `leaderboard_scores` table
- Update the `leaderboard_view` to use stored progress data
- Ensure backward compatibility with existing user_progress data

### Step 2: Redeploy Frontend
The frontend changes have been made to:
- `src/services/leaderboardService.ts` - Enhanced data fetching and syncing
- `src/pages/Leaderboard.tsx` - Better display of user data

Just rebuild and deploy:
```bash
npm run build
# Deploy to your hosting platform
```

### Step 3: Sync Existing Data
When users open the leaderboard after the update, their scores will automatically be synced with the new progress columns. The first sync on component mount will populate all the new fields.

To manually trigger a full sync of all users (optional):
1. Open browser DevTools
2. Go to the leaderboard page
3. The service will perform a full sync on mount via `getLeaderboardWithFullSync()`

## Data Flow After Fix

```
User completes challenge
    ↓
Progress stored locally
    ↓
syncUserScore() called
    ↓
All progress details + scores sent to leaderboard_scores
    ↓
leaderboard_scores table updated with:
  - Scores (ctf_score, phish_score, etc.)
  - Progress counts (ctf_solved_count, phish_solved_count, etc.)
    ↓
getLeaderboard() fetches from leaderboard_scores
    ↓
User position card shows: Name + Score + Progress
```

## Verification

After migration and deployment:

1. **Check Databases**: Open Supabase SQL Editor
   ```sql
   SELECT * FROM leaderboard_scores LIMIT 1;
   ```
   You should see the new columns with data populated.

2. **Check Leaderboard Display**:
   - Open the leaderboard page
   - Verify your user position shows: Name, Score, Rank, and Progress
   - Confirm progress details show solved counts for CTF, Phish, Code, etc.

3. **Check Browser Console**:
   Look for logs like:
   ```
   [leaderboardService] ✓ Got X score entries from leaderboard_scores
   [leaderboardService] ✓ Leaderboard constructed: X entries
   [Leaderboard] Step 3 SUCCESS: Fresh leaderboard loaded with X entries
   ```

## Rollback (if needed)

If you need to revert the changes:

1. **Database**: Run the rollback migration in Supabase SQL Editor
2. **Frontend**: Redeploy the previous version from git

## Performance Improvements

- Eliminates RLS policy conflicts by storing all needed data in one table
- Reduces database queries by fetching all data in one call
- Improves caching efficiency with complete data in localStorage
- Faster fallback when view is unavailable

## What Gets Displayed Now

For each leaderboard entry:
- ✅ Player name (from user_profiles)
- ✅ Avatar URL (from user_profiles)
- ✅ Total score
- ✅ Score breakdown (CTF, Phish, Code, Quiz, Firewall)
- ✅ Progress breakdown (solved counts for each type)
- ✅ Quiz details (answered/correct)
- ✅ Badges earned
- ✅ Rank
- ✅ Last updated timestamp

## Troubleshooting

**Problem**: Progress columns show as 0 for everyone
- **Solution**: Users need to open the app again to trigger the sync. Progress data syncs on first activity after migration.

**Problem**: Still seeing "Loading your position..."
- **Solution**: Check browser console for errors. Look for 403 Forbidden or permission errors in network tab.

**Problem**: Leaderboard still empty
- **Solution**: Ensure the migration ran successfully. Check:
  ```sql
  SELECT column_name FROM information_schema.columns 
  WHERE table_name = 'leaderboard_scores' 
  AND column_name = 'ctf_solved_count';
  ```
  If no results, the migration didn't apply correctly.

## Files Modified

1. `supabase/leaderboard_progress_columns.sql` - Migration file (NEW)
2. `src/services/leaderboardService.ts` - Fixed data fetching and syncing
3. `src/pages/Leaderboard.tsx` - Enhanced display logic

---

**Status**: Ready for deployment
**Impact**: Medium - Database schema change with backward compatibility
**Risk**: Low - Fully reversible migration
  )
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### Step 3: For Existing Users - Run This Cleanup Query

This will create leaderboard entries for any users who signed up before the trigger was updated:

```sql
INSERT INTO leaderboard_scores (user_id, username, total_score, ctf_score, phish_score, code_score, quiz_score, firewall_score)
SELECT 
  up.id,
  up.username,
  0,
  0,
  0,
  0,
  0,
  0
FROM user_profiles up
WHERE NOT EXISTS (
  SELECT 1 FROM leaderboard_scores ls WHERE ls.user_id = up.id
)
ON CONFLICT (user_id) DO NOTHING;
```

## Code Changes Applied

### 1. leaderboardService.ts
- ✅ Simplified `getLeaderboard()` query to avoid RLS issues
- ✅ Query `leaderboard_scores` directly with simple profile joins
- ✅ Added console logging for debugging
- ✅ Improved `ensureLeaderboardEntry()` to use upsert

### 2. Leaderboard.tsx
- ✅ Added console logs to track loading

### 3. authService.ts
- ✅ Adds leaderboard entry on signup (already done)

### 4. schema.sql
- ✅ Updated trigger function
- ✅ Added new RLS policy

## Testing Steps

### After Running the SQL:

1. **Sign up a new user** (or use your current user)
2. **Open browser console** (F12 → Console tab)
3. **Go to Leaderboard** page
4. **Check console for these logs:**
   ```
   Loading leaderboard for user: [your-user-id]
   Fetching leaderboard...
   Found X leaderboard entries
   Leaderboard loaded with X entries
   Leaderboard data received: [array with users]
   ```

5. **You should see:**
   - Your name and username on the leaderboard
   - Score of 0
   - Rank #1 (or whatever your position is)

### Test with Multiple Users:
1. Create 2-3 test accounts
2. Each user should appear on all leaderboards immediately
3. Score changes should update in real-time

## If Still Not Working

### Check these in Supabase Dashboard:

**In SQL Editor, run:**
```sql
-- Check how many leaderboard entries exist
SELECT COUNT(*) as total_entries FROM leaderboard_scores;

-- Check all entries
SELECT user_id, username, total_score FROM leaderboard_scores LIMIT 10;

-- Check user profiles
SELECT id, username, name FROM user_profiles LIMIT 10;
```

### Check Browser Console for Errors:
- Open DevTools (F12)
- Look for any red error messages
- Copy the exact error and check if it's an RLS issue

### If you see RLS errors:
- The policies haven't been updated in Supabase yet
- Re-run Step 1 SQL

## Quick Checklist

- [ ] Step 1 SQL executed (new RLS policies)
- [ ] Step 2 SQL executed (updated trigger function)
- [ ] Step 3 SQL executed (backfill existing users)
- [ ] Signed up a new test user
- [ ] Checked browser console for success logs
- [ ] See user on leaderboard with name and score

## Expected Behavior After Fix

✅ New user signs up → Automatically added to leaderboard  
✅ User sees their name and 0 score on leaderboard  
✅ All users see each other on leaderboard  
✅ Scores update in real-time  
✅ Rankings update automatically  

## Support

If still having issues:
1. Check console logs (F12)
2. Verify SQL was actually executed in Supabase
3. Check leaderboard_scores table directly in Supabase dashboard
4. Confirm user_profiles exist for users

