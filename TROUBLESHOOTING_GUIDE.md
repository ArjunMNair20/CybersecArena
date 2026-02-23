# Leaderboard Sync Troubleshooting - Complete Guide

## STEP 1️⃣: Run Database Diagnostics

**In Supabase SQL Editor:**
1. Copy and run: `QUICK_DIAGNOSTIC.sql`
2. **Take a screenshot of ALL results**
3. **Report:**
   - How many total users?
   - How many users have scores > 0?
   - What are the RLS policies showing?
   - Can database be read? (Check step 5)

---

## STEP 2️⃣: Get Your User ID from Console

**In Browser:**
1. Go to Leaderboard page
2. Press **F12** → **Console** tab
3. Look for line: `[Leaderboard] User ID: <copy-this>`
4. **Copy your full user ID** (it's a long string like: `550e8400-e29b-41d4-a716-446655440000`)

---

## STEP 3️⃣: Check Sync Logs

**In Browser Console:**
1. Look for any lines starting with:
   - `[Leaderboard]` - app-side logs
   - `[leaderboardService]` - service logs  
2. Look for either:
   - ✅ `SYNC SUCCESS` 
   - ❌ `SYNC FAILED` or error messages
3. **Screenshot and share the logs**

---

## STEP 4️⃣: Test Database Write

**In Supabase SQL Editor:**
1. Open: `TEST_DATABASE_WRITE_SIMPLE.sql`
2. Replace `'12345678-1234-1234-1234-123456789abc'` with YOUR user ID (keep quotes)
3. Run it
4. **Results:**
   - ✅ If you see test data (CTF: 5, Phish: 2, etc.) → Database accepts writes ✓
   - ❌ If error → Database has issues ✗

---

## STEP 5️⃣: Run RLS Setup

**In Supabase SQL Editor:**
1. Run: `COMPLETE_LEADERBOARD_SETUP.sql`
2. Wait for completion
3. Copy step 4 results (the RLS policies list)

---

## STEP 6️⃣: Manual Test

**If all above works but sync still fails:**
1. Go back to `TEST_DATABASE_WRITE_SIMPLE.sql`
2. Change the INSERT values to YOUR actual progress:
   ```
   ctf_solved_count = 9,        -- Your actual CTF solved
   phish_solved_count = 2,      -- Your actual Phish solved
   code_solved_count = 3,       -- Your actual Code solved
   quiz_correct = 9,             -- Your actual Quiz correct
   ```
3. Run it
4. Refresh Leaderboard page → **Do you see your scores now?**

---

## REPORTING CHECKLIST

When you report back, include:

- [ ] Screenshot from QUICK_DIAGNOSTIC.sql results
- [ ] Your User ID (from console [Leaderboard] User ID: ...)
- [ ] Any error messages from browser console (F12 → Console)
- [ ] Result from TEST_DATABASE_WRITE_SIMPLE.sql (success or error?)
- [ ] Did `COMPLETE_LEADERBOARD_SETUP.sql` run successfully?
- [ ] After manual test, did scores appear in leaderboard?

---

## What Each Test Tells Us

| Test | Success | Failure |
|------|---------|---------|
| QUICK_DIAGNOSTIC | DB is readable | RLS blocking reads |
| TEST_DATABASE_WRITE_SIMPLE | DB accepts writes | RLS blocking writes |
| COMPLETE_LEADERBOARD_SETUP | RLS configured | RLS setup failed |
| Manual test | App displays data | Display layer broken |
| Browser console logs | Sync is called | Sync not being called |

---

## Common Issues & Fixes

**If Database shows 0 users:**
- Users haven't been created in leaderboard_scores yet
- Need manual INSERT or working sync

**If RLS policies missing:**
- Run COMPLETE_LEADERBOARD_SETUP.sql again
- Make sure to wait for completion

**If sync succeeds but data doesn't appear:**
- Might be a display/refresh issue
- Try hard refresh: Ctrl+Shift+R
- Check browser cache is cleared

**If error messages in console:**
- Share the exact error text
- We'll know what's broken

---

## NEXT ACTION

**Do ALL of these immediately:**

1. ✅ Run QUICK_DIAGNOSTIC.sql → Share results
2. ✅ Get your User ID from console → Share it
3. ✅ Run COMPLETE_LEADERBOARD_SETUP.sql → Confirm success
4. ✅ Run TEST_DATABASE_WRITE_SIMPLE.sql with YOUR ID → Share results
5. ✅ Share any errors from browser console

This will tell us exactly where the problem is!
