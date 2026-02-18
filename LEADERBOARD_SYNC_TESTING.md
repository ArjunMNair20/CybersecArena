# Leaderboard Score Sync - Testing & Debugging Guide

## What's Been Done

✅ **Enhanced Logging Added**: Leaderboard component now logs every step of sync and fetch process
✅ **Database Scripts Created**: Multiple SQL scripts to verify and populate data
✅ **Sync Logic Active**: Component syncs user's actual progress before loading leaderboard

---

## Step 1: Test Leaderboard Sync (Browser)

1. **Open the Leaderboard page** in your app (or refresh if already open)
2. **Press F12** to open Developer Tools
3. **Go to Console tab**
4. **Look for logs starting with `[Leaderboard]`** - you should see:

```
[Leaderboard] ====== SYNC START ======
[Leaderboard] User ID: <your-user-id>
[Leaderboard] Username: <your-username>
[Leaderboard] Current userScores: {
  total: <score>,
  ctf: <value>,
  phish: <value>,
  ...
}
[Leaderboard] Progress Payload: {
  ctf_solved_count: <number>,
  phish_solved_count: <number>,
  ...
}
[Leaderboard] ✓ User progress synced successfully
[Leaderboard] ====== SYNC COMPLETE ======

[Leaderboard] ====== FETCH START ======
[Leaderboard] Fetching leaderboard from database...
[Leaderboard] Fetch complete. Details:
[Leaderboard] - Total entries: 3
[Leaderboard] - Empty result: false
[Leaderboard] ✓ Success! Loaded 3 entries
[Leaderboard] Detailed scores:
  [Rank 1] <user>:
    • Total Score: <value>
    • Score breakdown: CTF=..., Phish=..., etc.
    • Progress counts: CTF=..., Phish=..., etc.
[Leaderboard] ====== FETCH COMPLETE ======
```

### If you see errors:
- **SYNC ERROR**: Note the error message - copy the full error output
- **FETCH ERROR**: Database query failed - check if view exists properly

---

## Step 2: Verify Database State

Run these SQL queries in Supabase SQL Editor to check the database:

### A. Check what's being stored:
```sql
SELECT 
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
  quiz_correct,
  firewall_best_score
FROM leaderboard_scores
ORDER BY username;
```

**Expected**: Should show at least one user with their actual scores

### B. Verify RLS policies:
```sql
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  qual
FROM pg_policies
WHERE tablename IN ('leaderboard_scores', 'user_profiles')
ORDER BY tablename, policyname;
```

**Expected**: Should show policies with `permissive = true` and `USING (true)`

### C. Check if user profiles exist:
```sql
SELECT id, username, name, email FROM user_profiles ORDER BY username;
```

**Expected**: Should show all registered users including yourself

---

## Step 3: Manual Score Population (If Needed)

If the database is empty or showing 0 scores, run this script to populate test data:

**File**: `POPULATE_TEST_SCORES.sql`

This will:
1. Give three users different score levels (90%, 60%, 30% completion)
2. Calculate their total scores correctly
3. Show what the leaderboard should display

---

## Step 4: Sync Current User's Progress

If your personal dashboard shows progress (e.g., 9%) but leaderboard shows 0:

1. **Refresh the Leaderboard page** (Ctrl+R or Cmd+R)
2. **Watch the console** for the sync process
3. **Check if your user appears** in the top 3 with matching score

---

## Debugging Checklist

- [ ] Console shows `✓ User progress synced successfully` (not an error)
- [ ] Leaderboard shows data (not empty)
- [ ] Your data appears in the list
- [ ] Scores are not 0 (unless you haven't completed any challenges)
- [ ] Dashboard progress % matches Leaderboard progress %
- [ ] All 3 users appear in leaderboard (not just your entry)

---

## If Scores Still Show 0

### Possible Cause 1: User ID Mismatch
- Dashboard and Leaderboard use different user ID formats
- **Fix**: Run `VERIFY_USER_DATA.sql` to check

### Possible Cause 2: Sync Not Running
- Component sync promise is failing silently
- **Evidence**: Console shows error in SYNC section
- **Fix**: Check error message and report it

### Possible Cause 3: Data Not Persisting
- Sync claims success but data doesn't appear in database
- **Evidence**: Console shows success but DB query returns no data
- **Fix**: Check RLS policies with verify script

### Possible Cause 4: Database Empty
- No users in leaderboard_scores table
- **Evidence**: "No leaderboard data available" message
- **Fix**: Run `POPULATE_TEST_SCORES.sql` to add test data

---

## Next Steps

1. **Refresh Leaderboard page** and check console
2. **Provide console output** (screenshot or copy-paste the `[Leaderboard]` logs)
3. **Run verification queries** and share results
4. If needed, run **POPULATE_TEST_SCORES.sql** and verify display works

---

## Expected Behavior

**Before**: Leaderboard shows 0 scores, Dashboard shows actual progress
**After**: Leaderboard shows actual scores matching Dashboard, sorted by total_score DESC

**The sync happens automatically when you visit the Leaderboard page.**
