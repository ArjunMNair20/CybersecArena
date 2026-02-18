# RLS Issue Summary - What I Found

## The RLS Problem

Your leaderboard isn't displaying scores because of **Row Level Security (RLS) policies** in Supabase.

### The Issue

Your code tries to fetch from `leaderboard_view`, which joins 3 tables:

```sql
SELECT * FROM leaderboard_view
-- This internally does:
SELECT 
  ls.*, 
  up.name, up.avatar_url,
  up_progress.ctf_solved_ids,  ← ❌ PROBLEM HERE
  ...
FROM leaderboard_scores ls
JOIN user_profiles up ON ...
LEFT JOIN user_progress up_progress ON ...
```

**The problem:** `user_progress` table has restrictive RLS:
```sql
POLICY "Users can view their own progress"
  USING (auth.uid() = user_id)  -- Only current user's data!
```

When the view tries to join to `user_progress`, it can only return the **current user's** progress, not all users'. This silently fails.

---

## Files I Created

### 1. **IMMEDIATE_RLS_FIX.sql** ← **START HERE**
- Run this in Supabase SQL Editor
- Fixes RLS policies in 30 seconds
- Tests that data can be fetched

### 2. **RLS_ACTION_PLAN.md** 
- Step-by-step guide to fix it
- 3-minute solution time
- Troubleshooting checklist

### 3. **RLS_ISSUES_GUIDE.md**
- Full explanation of RLS
- Why your setup fails
- 3 different fix options
- Detailed reference guide

### 4. **RLS_DIAGNOSTIC_FIX.sql**
- Run this to diagnose the exact problem
- Shows policies, data, and errors
- Applies fixes automatically

### 5. **LEADERBOARD_BYPASS_VIEW.ts**
- Alternative code if RLS fixes don't work
- Queries tables directly, no view
- Avoids RLS issues entirely

---

## Quick Fix Summary

### The Problem
```
leaderboard_scores table RLS: ✅ OPEN (anyone can SELECT)
           ↓
leaderboard_view tries to JOIN to:
           ↓
user_progress table RLS: ❌ RESTRICTED (only own data)
           ↓
Result: View fails silently, no data loads
```

### The Solution
Change user_progress RLS from:
```sql
USING (auth.uid() = user_id)  -- Restrictive
```

To:
```sql
USING (true)  -- Allow all authenticated views
```

OR just don't read from `user_progress` in the view at all.

---

## What to Do Right Now

### Option 1: Quick Fix (Recommended)
1. Go to Supabase SQL Editor
2. Copy entire script from **IMMEDIATE_RLS_FIX.sql**
3. Run it
4. Refresh leaderboard page in browser
5. Data should now display

### Option 2: Detailed Diagnosis
1. Run **RLS_DIAGNOSTIC_FIX.sql** in Supabase
2. Note which test queries succeed/fail
3. Read **RLS_ISSUES_GUIDE.md** for full explanation
4. Apply appropriate fix

### Option 3: Bypass View Entirely
1. Replace `getLeaderboard()` method in leaderboardService.ts
2. Use code from **LEADERBOARD_BYPASS_VIEW.ts**
3. This queries tables directly, avoiding RLS issues

---

## Why This Happens

Supabase RLS is designed to:
- ✅ Protect user data (prevent user A from seeing user B's private info)
- ❌ But sometimes breaks aggregate views (like leaderboards)

Your setup has:
- ✅ Leaderboard table with open SELECT
- ❌ Progress table with restrictive SELECT only-own-data
- ✅ View trying to join them together
- ✗ View fails because of the restrictive join

---

## Expected Results After Fix

### In Supabase SQL Editor:
```sql
SELECT COUNT(*) FROM leaderboard_scores;
-- Returns: 5

SELECT COUNT(*) FROM leaderboard_view;
-- Returns: 5

SELECT * FROM leaderboard_view LIMIT 1;
-- Returns actual data rows
```

### In Browser Console:
```
[leaderboardService] ===== LEADERBOARD FETCH START =====
[leaderboardService] ✓ View fetch successful: 5 entries
[Leaderboard] Success! Loaded 5 entries
```

### On Leaderboard Page:
- ✅ All 5 users visible
- ✅ Scores displaying
- ✅ Progress columns showing values
- ✅ No errors in console

---

## Verification Commands

Run these in Supabase SQL Editor to verify the fix:

```sql
-- 1. Check RLS policies
SELECT tablename, policyname, qual 
FROM pg_policies 
WHERE tablename IN ('leaderboard_scores', 'user_profiles', 'user_progress')
ORDER BY tablename;

-- 2. Count data
SELECT COUNT(*) as leaderboard_count FROM leaderboard_scores;

-- 3. Test view
SELECT COUNT(*) as view_count FROM leaderboard_view;

-- 4. Show actual data
SELECT username, total_score, rank() OVER (ORDER BY total_score DESC) 
FROM leaderboard_view 
LIMIT 5;
```

---

## Key Takeaway

The issue is **RLS is too restrictive on user_progress**, and the view tries to join it. The fix is to either:
1. Make user_progress RLS more permissive (allow all authenticated users to read all progress for leaderboard)
2. Don't join user_progress in the view
3. Query tables separately and join in JavaScript

All three fixes are in the files above. **IMMEDIATE_RLS_FIX.sql** does option 1 (recommended).

---

## Files Quick Reference

| File | Purpose | Time |
|------|---------|------|
| IMMEDIATE_RLS_FIX.sql | One-click RLS fix | 30 sec |
| RLS_ACTION_PLAN.md | Step-by-step guide | 3 min |
| RLS_ISSUES_GUIDE.md | Full explanation | Read |
| RLS_DIAGNOSTIC_FIX.sql | Diagnose problems | 2 min |
| LEADERBOARD_BYPASS_VIEW.ts | Alternative code | If needed |

---

**Next Step: Run IMMEDIATE_RLS_FIX.sql in Supabase! 🚀**
