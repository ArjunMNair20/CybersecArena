# RLS Leaderboard Fix - Action Plan

## Issue Summary

Your leaderboard is not displaying data. **Root cause: RLS (Row Level Security) policies are blocking data access.**

### Why RLS Breaks It

The `leaderboard_view` joins THREE tables:
```
leaderboard_scores → joins → user_profiles → joins → user_progress
```

- ✅ `leaderboard_scores` has `SELECT TO authenticated USING (true)` - PERMISSIVE ✓
- ⚠️ `user_progress` has `SELECT USING (auth.uid() = user_id)` - **RESTRICTIVE** ❌

When a query joins to `user_progress`, it can only see the current user's progress, not all users' data. The view fails silently.

---

## Quick Fix (2 Minutes)

### Step 1: Open Supabase Console
1. Go to your Supabase Dashboard
2. Click "SQL Editor"
3. Create a new query

### Step 2: Run This SQL

Copy and paste the ENTIRE script from `IMMEDIATE_RLS_FIX.sql` into the SQL Editor and click "Run"

This will:
- ✅ Drop conflicting RLS policies
- ✅ Create permissive SELECT policies
- ✅ Test that data can be fetched
- ✅ Show you the leaderboard data

### Step 3: Check Results

After running, you should see:
```
leaderboard_count: 5
highest_score: [some number > 0]
view_count: 5
```

Plus 10 rows showing actual leaderboard data with rank, username, scores

### Step 4: Refresh Browser

Go to the leaderboard page and refresh (Ctrl+R or Cmd+R)

You should now see:
- ✅ All 5 users displayed
- ✅ Scores showing correctly
- ✅ No errors in browser console (F12)

---

## If That Doesn't Work

### Option A: Check Policies Are Actually Changed

Run this in SQL Editor:

```sql
SELECT tablename, policyname, roles, qual 
FROM pg_policies 
WHERE tablename IN ('leaderboard_scores', 'user_profiles')
ORDER BY tablename;
```

If you see policies with `"Only authenticated"` or `"USING (auth.uid() = ..."`, RLS is still restrictive.

Delete them manually:
```sql
DROP POLICY IF EXISTS "policy_name" ON table_name;
```

Then run `IMMEDIATE_RLS_FIX.sql` again.

### Option B: Bypass View Entirely

If the view keeps failing, use direct table queries instead.

Edit `src/services/leaderboardService.ts` - Replace the `getLeaderboard()` method with the code in `LEADERBOARD_BYPASS_VIEW.ts` (see below)

This skips the problematic view and queries the table directly.

---

## Reference: RLS Policies Explained

| What It Does | Code | Allows |
|---|---|---|
| Everyone access | `USING (true)` | ✅ Everyone |
| Only own user | `USING (auth.uid() = user_id)` | ❌ Only current user |
| Blocks all | `USING (false)` | ❌ Nobody |
| Owner can view | `USING (auth.uid() = id)` | ❌ Only owner |

Your problem: You have `USING (auth.uid() = user_id)` on sensitive tables, which blocks the view join.

---

## Diagnostic Commands

Run these one at a time to see what's happening:

### Check Table Data Exists
```sql
SELECT COUNT(*) FROM leaderboard_scores;
-- Should return: 5
```

### Check View Works
```sql
SELECT COUNT(*) FROM leaderboard_view;
-- Should return: 5
```

### Check RLS Policies
```sql
SELECT tablename, policyname FROM pg_policies 
WHERE tablename IN ('leaderboard_scores', 'user_profiles', 'user_progress');
```

### Check RLS Enabled/Disabled
```sql
SELECT tablename, rowsecurity FROM pg_tables 
WHERE tablename IN ('leaderboard_scores', 'user_profiles', 'user_progress');
-- rowsecurity=true means RLS is ENABLED
-- rowsecurity=false means RLS is DISABLED
```

### Test Direct Query
```sql
SELECT username, total_score FROM leaderboard_scores 
ORDER BY total_score DESC LIMIT 5;
-- If this returns data, RLS is working ✓
```

---

## Files You Have

1. **IMMEDIATE_RLS_FIX.sql** ← **RUN THIS FIRST**
   - One-click fix for RLS policies

2. **RLS_DIAGNOSTIC_FIX.sql**
   - Detailed diagnostics showing what's blocked

3. **RLS_ISSUES_GUIDE.md**
   - Full explanation of RLS and multiple fix options

4. **LEADERBOARD_BYPASS_VIEW.ts** (if needed)
   - Code to skip the view and query directly

---

## Expected Timeline

| Time | Action | Result |
|------|--------|--------|
| 1 min | Copy IMMEDIATE_RLS_FIX.sql | Policies fixed |
| 2 min | Run SQL in Supabase | See confirmation |
| 30 sec | Refresh browser | Leaderboard shows data |
| **Total: 3.5 minutes** | ✅ Done | Leaderboard working |

---

## Troubleshooting Checklist

- [ ] Ran IMMEDIATE_RLS_FIX.sql in Supabase SQL Editor
- [ ] Run final test queries and got numbers > 0
- [ ] Refreshed browser page (Ctrl+R / Cmd+R)
- [ ] Checked browser console (F12) for errors
- [ ] All 5 users showing in leaderboard
- [ ] Scores displaying correctly
- [ ] No red errors in console

If any of these fail, check the corresponding section in RLS_ISSUES_GUIDE.md

---

## Next Steps

1. ✅ **NOW:** Run IMMEDIATE_RLS_FIX.sql
2. ✅ **THEN:** Refresh leaderboard page
3. ✅ **CHECK:** See if data displays
4. 📝 **If fails:** Run RLS_DIAGNOSTIC_FIX.sql and share output

---

**Ready? Go to Supabase SQL Editor and run IMMEDIATE_RLS_FIX.sql! 🚀**
