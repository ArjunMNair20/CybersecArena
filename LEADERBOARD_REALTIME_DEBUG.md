# 🔴 Leaderboard Real-Time Syncing - Troubleshooting Guide

## Recent Changes Made ✅

### 1. **Aggressive Real-Time Syncing**
- Layout component: Sync debounce reduced from **500ms → 100ms**
- Leaderboard component: Sync debounce reduced from **300ms → 50ms**
- Subscription debounce: Reduced from **500ms → 300ms**

### 2. **Enhanced Logging**
- Added detailed logs prefixed with `[leaderboardService]` and `[Leaderboard]`
- Each sync logs: user ID, scores being saved, success/failure status

### 3. **Improved Error Handling**
- Better error messages in console
- Fallback mechanisms (upsert → update → insert)

---

## How to Verify It's Working

### Step 1: Open Browser DevTools
1. Press `F12` or right-click → Inspect
2. Go to **Console** tab
3. Keep console open while testing

### Step 2: Complete a Challenge
1. Go to **CTF**, **Phishing**, **Code**, or **Quiz** section
2. Complete a challenge
3. Look for these console messages:

```
✅ SUCCESS MESSAGES:
[Leaderboard] SYNC: Syncing scores immediately for user: [user-id]
[leaderboardService] SYNC TRIGGERED: Syncing scores for user: [user-id]
[leaderboardService] SYNC SUCCESS: Score saved to database for user: [user-id]
[leaderboardService] Real-time update triggered, refetching leaderboard...
[leaderboardService] Broadcasting updated entries: X
```

### Step 3: Check Leaderboard
1. Go to **Leaderboard** page
2. Your score should update within 1-2 seconds
3. You should see messages like:
```
[Leaderboard] SYNC SUCCESS: Score synced to Supabase
```

---

## Debugging Checklist

### ❌ If Scores Still Not Showing

**Check 1: Database Schema**
```
✓ Run this SQL in Supabase:
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'leaderboard_scores' 
ORDER BY ordinal_position;

Must include: ctf_score, phish_score, code_score, quiz_score, firewall_score
```

**Check 2: Console for Sync Errors**
Look for messages like:
```
❌ SYNC ERROR: Failed to sync score to Supabase
[leaderboardService] Upsert error: [error details]
[leaderboardService] User profile not found
[leaderboardService] Invalid username
```

**Check 3: RLS Policies**
If you see `permission denied` errors:
```sql
-- Run this in Supabase SQL Editor:
SELECT * FROM pg_policies WHERE tablename = 'leaderboard_scores';
```

Should show policies for SELECT, INSERT, UPDATE.

**Check 4: User Profile Exists**
```sql
-- Check if your user has a profile:
SELECT id, username, email FROM user_profiles WHERE username = 'your_username';
```

**Check 5: Leaderboard Entry Created**
```sql
-- Check if leaderboard entry exists:
SELECT user_id, username, total_score FROM leaderboard_scores 
WHERE username = 'your_username';
```

---

## Console Log Patterns

### When Everything Works ✅

1. **Completing a Challenge**
   ```
   [Leaderboard] SYNC: Syncing scores immediately for user: abc-123 total: 150
   [leaderboardService] SYNC TRIGGERED: Syncing scores for user: abc-123
   [leaderboardService] Payload to save: {total_score: 150, ctf: 100, ...}
   [leaderboardService] SYNC SUCCESS: Score saved to database
   ```

2. **Leaderboard Updates**
   ```
   [Leaderboard] Fresh leaderboard loaded: X entries
   [leaderboardService] Real-time update triggered
   [leaderboardService] Broadcasting updated entries: X
   ```

3. **Real-Time Subscription**
   ```
   [leaderboardService] leaderboard_scores change detected: INSERT/UPDATE
   [leaderboardService] Real-time update triggered, refetching leaderboard...
   ```

### When Something's Wrong ❌

Look for these error patterns:
```
[leaderboardService] Upsert error: {message: "..."}
[leaderboardService] SYNC FAILED: Failed to sync score
[leaderboardService] User profile not found
[leaderboardService] Invalid username
[Leaderboard] SYNC ERROR: Failed to sync score to Supabase
```

---

## Quick Recovery Steps

If scores aren't showing after 30 seconds:

1. **Force a Full Sync**
   - Close and reopen the Leaderboard page
   - Complete another challenge
   - Check console for sync messages

2. **Check Supabase Status**
   - Go to your Supabase dashboard
   - Check if tables are accessible (no errors)
   - Verify RLS policies are enabled correctly

3. **Verify Database Columns**
   - Run the schema check above
   - Run the migration SQL if columns missing: `LEADERBOARD_SCHEMA_FIX.sql`

4. **Clear Cache and Reload**
   ```javascript
   // In browser console:
   localStorage.removeItem('leaderboard_cache_v1');
   location.reload();
   ```

---

## Real-Time Sync Flow

```
User Completes Challenge
        ↓
Progress State Updates (local)
        ↓
[Leaderboard] SYNC triggered (50ms debounce)
        ↓
Calculate scores: CTF×100, Phish×150, Code×150, Quiz×80, Firewall×20
        ↓
Send to Supabase via syncUserScore()
        ↓
Database receives UPSERT
        ↓
[leaderboardService] Real-time subscription fires
        ↓
Refetch leaderboard from database (300ms debounce)
        ↓
Update UI with new leaderboard
        ↓
✅ User sees score updated (1-2 seconds total)
```

---

## Key Timing

- **Score sync on progress change**: 50ms debounce
- **Layout sync**: 100ms debounce  
- **Real-time refetch**: 300ms debounce
- **Total time to display**: ~500ms average

---

## Still Not Working?

1. Open browser console (F12)
2. Complete a challenge
3. **Screenshot console output** showing:
   - What SYNC messages appear
   - Any ERROR messages
4. Run this in console:
   ```javascript
   console.log('User:', localStorage.getItem('auth_user'));
   console.log('Progress:', localStorage.getItem('cybersec_arena_progress'));
   ```
5. Check Supabase dashboard:
   - Navigate to SQL Editor
   - Run: `SELECT * FROM leaderboard_scores LIMIT 5;`
   - Check if data exists

---

**Document created:** Feb 9, 2026
**Last updated:** After implementing 50ms → 300ms real-time sync improvements
