# Leaderboard Sync Debugging Guide

## Step 1: Check if Database Writes Work
1. Open Supabase SQL Editor
2. Run `TEST_DIRECT_WRITE.sql`
3. **Report what you see:**
   - ✅ If you see your data (CTF: 5, Phish: 2, Code: 3, Quiz: 9, Score: 18), database writes WORK
   - ❌ If you see an error, database writes are BLOCKED

---

## Step 2: Check App-Side Sync
1. Open your app's Leaderboard page
2. Open browser console (F12 or Ctrl+Shift+I)
3. Go to Console tab
4. **Look for messages starting with `[Leaderboard]` or `[leaderboardService]`**
5. **Copy the FIRST 20-30 lines and share them**

---

## Step 3: Force a Manual Sync
1. In browser console, you should see something like:
   ```
   [Leaderboard] ====== PAGE LOAD START ======
   [Leaderboard] User: your_username
   ```
2. Click the **"🔄 Force Sync My Progress"** button in the leaderboard
3. **Immediately copy ALL console output** (should show ✅ or ❌)
4. Share exactly what you see

---

## Step 4: Check Leaderboard Data
1. Run `SIMPLE_DIAGNOSTIC.sql` in Supabase
2. Share the output, specifically:
   - **RLS Status** - is it enabled?
   - **RLS Policies** - what operations are allowed?
   - **ALL USERS** - what scores are stored?

---

## What We're Looking For

### If database writes work (✅ from TEST_DIRECT_WRITE.sql):
- The issue is in the app code
- The sync is either not being called, or there's an error we need to see
- Share console output from Step 2 & 3

### If database writes don't work (❌ from TEST_DIRECT_WRITE.sql):
- RLS policies are blocking INSERT/UPDATE
- We need to fix the RLS configuration
- Share the exact error message

---

## What to Report
1. **Exact error message** from any failed SQL query
2. **First 30 lines of browser console output** (F12 → Console)
3. **Screenshot of Leaderboard page** showing the scores
4. **Results from SIMPLE_DIAGNOSTIC.sql** if you can copy it

---

## Things to Try
1. **Refresh page** (Ctrl+R or Cmd+R)
2. **Open in incognito/private mode** (to skip cache)
3. **Wait 2-3 seconds** after opening Leaderboard (sync takes time)
4. **Click "Force Sync" then "Refresh Leaderboard"** sequentially
