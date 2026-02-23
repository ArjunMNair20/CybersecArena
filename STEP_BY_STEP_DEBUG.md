# Leaderboard Sync - Step-by-Step Debug Guide

Your sync code is correct. The problem is likely in the **database layer** (RLS policies). Let's find it.

---

## 🟡 CRITICAL: Are you logged in?

**On ANY page:**
1. F12 → Console tab
2. Paste this:
```javascript
const { data: { user } } = await window.supabase.auth.getUser();
console.log("Logged in as:", user?.email);
console.log("User ID:", user?.id);
```
3. You should see your email and a UUID
4. **If you see "null" → YOU'RE NOT LOGGED IN** ⚠️

---

## ✅ TEST 1: Database Reads (Should work - leaderboard displays)

**Purpose:** Verify you can READ from database

**In Supabase SQL Editor:**
```sql
SELECT user_id, username, total_score, ctf_solved_count 
FROM leaderboard_scores 
LIMIT 5;
```

**Expected Result:**
- ✅ See 5 users with their scores (any scores, even 0s)
- ❌ "permission denied" → RLS is blocking reads (shouldn't happen)
- ❌ "relation does not exist" → Table is missing

**Comment:**
□ Reads work
□ Reads fail (error: _______________)

---

## ✅ TEST 2: Can Supabase see you as authenticated?

**On Leaderboard page, in F12 Console:**
```javascript
// Copy ONE of these commands and run it:

// Option A: Check Supabase session
const session = await window.supabase.auth.getSession();
console.log("Session:", session.data.session?.user?.email);

// Option B: Get auth header
const token = (await window.supabase.auth.getSession()).data?.session?.access_token;
console.log("Auth token exists:", !!token);

// Option C: Check if you're in JWT
const claims = window.supabase.auth.getUser().then(u => {
  console.log("Email:", u.data.user?.email);
  console.log("User ID:", u.data.user?.id);
  console.log("Created:", u.data.user?.created_at);
});
```

**Expected Result:**
- ✅ See your email and a token/user ID
- ❌ "null" or empty → NOT authenticated

**Comment:**
□ Auth token/session exists
□ Auth missing (not logged in?)

---

## ✅ TEST 3: Client-Side Database Write Test

**On Leaderboard page, F12 Console, run this:**
```javascript
const { data: { user } } = await window.supabase.auth.getUser();
const testData = {
  user_id: user.id,
  username: 'test_' + Date.now(),
  total_score: 777,
  ctf_solved_count: 7,
  phish_solved_count: 7,
  code_solved_count: 7,
  quiz_correct: 7,
  firewall_best_score: 77,
  last_updated: new Date().toISOString()
};

console.log("🔷 Testing UPSERT with data:", testData);

const { error } = await window.supabase
  .from('leaderboard_scores')
  .upsert(testData, { onConflict: 'user_id' });

if (error) {
  console.error("❌ UPSERT FAILED:", error.message);
  console.error("   Code:", error.code);
  console.error("   Details:", error.details);
} else {
  console.log("✅ UPSERT SUCCESS!");
}

// Now verify it was saved
const { data: verify, error: verifyError } = await window.supabase
  .from('leaderboard_scores')
  .select('total_score')
  .eq('user_id', user.id)
  .single();

if (verify) {
  console.log("✅ VERIFIED IN DB:", verify.total_score);
} else {
  console.log("❌ NOT IN DB:", verifyError?.message);
}
```

**Expected Result:**
- ✅ `UPSERT SUCCESS!` and score shows as 777
- ❌ `policy` in error message → **RLS policies are blocking writes**
- ❌ `relation does not exist` → Table columns missing
- ❌ `permission denied for table` → RLS denying access

**Comment:**
□ Write succeeded (score: ______)
□ Write failed (error: _______________)

---

## 🚨 IF TEST 3 FAILED with "policy" error:

**Run this in Supabase SQL Editor IMMEDIATELY:**
```sql
-- Check current RLS policies
SELECT 
  tablename,
  policyname,
  permissive,
  roles,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'leaderboard_scores'
ORDER BY policyname;
```

**Report:**
How many policies show up? ______
What are their names?
1. ___________________
2. ___________________
3. ___________________

**Then run this:**
```sql
-- Fix RLS - CREATE OPEN POLICIES FOR TEST
DROP POLICY IF EXISTS "public_read" ON leaderboard_scores;
DROP POLICY IF EXISTS "authenticated_update" ON leaderboard_scores;
DROP POLICY IF EXISTS "authenticated_insert" ON leaderboard_scores;

CREATE POLICY "public_read" ON leaderboard_scores
  FOR SELECT USING (true);

CREATE POLICY "authenticated_update" ON leaderboard_scores
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "authenticated_insert" ON leaderboard_scores
  FOR INSERT WITH CHECK (auth.uid() = user_id);

SELECT 'Policies created' as result;
```

**Expected Result:**
- ✅ See "Policies created"

**Then retry Test 3 above** → Should now work ✅

---

## ✅ TEST 4: Check Force Sync Button

**On Leaderboard page:**
1. Solve ONE question (any CTF, Phish, etc.)
2. Click **"🔄 Sync My Progress"** button
3. F12 → Console → Look for lines starting with `[Leaderboard]` or `[leaderboardService]`

**Share:**
- First console line after clicking Sync:
  
  ___________________
  
- Last console line (success or error?):

  ___________________

---

## ✅ TEST 5: Manual Score Update

**If all tests pass but scores still show 0 on leaderboard:**

In Supabase SQL Editor:
```sql
-- Update with REAL numbers
UPDATE leaderboard_scores 
SET 
  total_score = 450,
  ctf_solved_count = 9,
  phish_solved_count = 2,
  code_solved_count = 3,
  quiz_correct = 9,
  last_updated = NOW()
WHERE user_id = (SELECT id FROM auth.users LIMIT 1);

SELECT user_id, total_score, ctf_solved_count FROM leaderboard_scores 
WHERE total_score = 450;
```

**Expected Result:**
- ✅ See your user_id and score=450 returned
- ❌ No rows → data not updated

**Then:**
1. Go back to Leaderboard page
2. Click **Refresh** button
3. **Do you see score = 450 now?**
   - YES ✅ → Display works, issue is sync
   - NO ❌ → Display is broken

---

## 📋 FINAL CHECKLIST

When reporting back, include:

### Part 1: Authentication
- [ ] You logged in successfully? (YES / NO)
- [ ] Auth token exists? (YES / NO)

### Part 2: Database Access
- [ ] TEST 1 - Reads work? (YES / NO)
  - Error if NO: _______________
- [ ] TEST 3 - Writes work? (YES / NO)
  - Error if NO: _______________
- [ ] RLS policy names if TEST 3 Failed:
  1. _______________
  2. _______________
  3. _______________

### Part 3: Sync Function
- [ ] Force Sync button clicked? (YES / NO)
- [ ] Console shows "SYNC SUCCESS"? (YES / NO)
- [ ] Score in database changed? (YES / NO)

### Part 4: Manual Test (if needed)
- [ ] Manual UPDATE to score=450 worked? (YES / NO)
- [ ] Refresh shows 450? (YES / NO)

---

## 🎯 What Each Test Result Means

| Test | Result | Issue | Fix |
|------|--------|-------|-----|
| Auth | Failed | Not logged in | Login page error |
| Test 1 | Failed | RLS blocks reads | (Shouldn't happen) |
| Test 3 | Failed | RLS blocks writes | Run RLS SQL above |
| Force Sync | Failed | Service not calling | Check browser error |
| Manual UPDATE | Works but doesn't display | Frontend cache | Hard refresh Ctrl+Shift+R |
| All pass but score is 0 | ??? | Calculation error | Check console logs |

---

## 🚨 MOST LIKELY ISSUE

Based on previous conversation, your RLS policies ARE NOT allowing writes.

**Run this RIGHT NOW in Supabase SQL Editor:**

```sql
-- STEP 1: Check current policies
SELECT policyname FROM pg_policies 
WHERE tablename = 'leaderboard_scores';

-- STEP 2: If you see policies, run this to fix
DROP POLICY IF EXISTS "public_read" ON leaderboard_scores;
DROP POLICY IF EXISTS "authenticated_update" ON leaderboard_scores;
DROP POLICY IF EXISTS "authenticated_insert" ON leaderboard_scores;

-- STEP 3: Create new policies
CREATE POLICY "public_read" ON leaderboard_scores
  FOR SELECT USING (true);

CREATE POLICY "authenticated_update" ON leaderboard_scores
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "authenticated_insert" ON leaderboard_scores
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- STEP 4: Verify
SELECT COUNT(*) as policy_count FROM pg_policies 
WHERE tablename = 'leaderboard_scores';
```

Then try Force Sync again → Should work! ✅
