# Leaderboard Sync Debugging Guide

## Problem: Sync is not working (data not being saved to database)

---

## STEP 1: Verify Database Can Be Written To

1. **Run SQL Test**: `TEST_DATABASE_WRITE.sql`
   - This will test if the database accepts UPDATE operations
   - Should show: `=== AFTER UPDATE === ctf_solved_count: 999` 
   - If this fails or shows 0, then **RLS policies are blocking writes**

**Expected Output:**
```
=== BEFORE UPDATE ===
ctf_solved_count: 0

=== AFTER UPDATE ===
ctf_solved_count: 999

=== AFTER RESET ===
ctf_solved_count: 0
```

**If it doesn't change to 999:**
- RLS policies are blocking database writes
- Need to fix RLS policies to allow authenticated users to update

---

## STEP 2: Check App-Side Sync

1. **Refresh Leaderboard page** (Ctrl+R)
2. **Open F12 → Console**
3. **Click "🔄 Force Sync My Progress" button**
4. **Copy the console output** and look for:

### ✅ SUCCESS Signs:
```
[leaderboardService] ✅ UPSERT succeeded
[leaderboardService] ✅ VERIFICATION SUCCESS: Data confirmed in database
[leaderboardService]    Saved counts: CTF=9, Phish=2, Code=3, Quiz=9, Score=???
```

### ❌ FAILURE Signs:
```
[leaderboardService] ❌ UPSERT FAILED:
[leaderboardService] ❌ UPDATE ALSO FAILED:
[leaderboardService] ❌ VERIFICATION FAILED
```

If you see `❌ UPSERT FAILED`, copy the full error message

---

## STEP 3: What to Share With Me

Send me:

1. **Results from `TEST_DATABASE_WRITE.sql`**
   - Did ctf_solved_count change to 999?
   - Or did it stay 0?

2. **Console output from Force Sync** 
   - Copy the `[leaderboardService]` lines showing either:
     - `✅ SUCCESS messages`
     - `❌ FAILURE messages with error details`

3. **Error message from RLS policies section**

---

## Common Issues

### Issue 1: RLS Policies Blocking Writes
**Sign:** TEST_DATABASE_WRITE.sql shows `ctf_solved_count: 0` (no change)

**Fix:** Need to add UPDATE permission to RLS policy
```sql
CREATE POLICY "Update leaderboard scores" ON leaderboard_scores
  FOR UPDATE USING (true)
  WITH CHECK (true);
```

### Issue 2: Upsert Error with "column does not exist"
**Sign:** Console shows `undefined column` error

**Fix:** Make sure `onConflict: 'user_id'` is correct in the code

### Issue 3: Silent Failure (No error, but data not there)
**Sign:** SUCCESS messages but data doesn't appear in database

**Fix:** Check if row exists for the user or if we need INSERT instead of UPDATE

---

## Next Steps

1. Run `TEST_DATABASE_WRITE.sql` → Share results
2. If it fails, we need to fix RLS
3. If it succeeds, we need to debug why the app sync isn't working
4. Click Force Sync again and share console output

This will help us identify the exact problem! 🔍
