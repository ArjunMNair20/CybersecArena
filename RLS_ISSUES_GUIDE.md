# RLS Issues - Leaderboard Data Not Loading

## The Problem

Your leaderboard isn't fetching data, and **RLS (Row Level Security)** is likely the culprit.

### What is RLS?
RLS allows you to control which rows users can see. While good for security, it can silently block queries if policies aren't set correctly.

---

## RLS Issues Found

### ❌ Issue #1: View Joins Inherit RLS Restrictions

**Your leaderboard_view joins THREE tables:**
```sql
leaderboard_scores 
  ← JOINS → user_profiles 
  ← JOINS → user_progress
```

Even if `leaderboard_scores` allows SELECT, the other tables might block it:

- ✅ `leaderboard_scores` - Has `SELECT TO authenticated USING (true)`
- ⚠️ `user_profiles` - May have restrictive SELECT policy  
- ⚠️ `user_progress` - Has `SELECT USING (auth.uid() = user_id)` → **Only own data!**

**Result:** View query fails because `user_progress` join restricts to current user only

---

### ❌ Issue #2: Service Uses View THEN Fallback

Your service tries:
```typescript
// Step 1: Try view (FAILS due to user_progress RLS)
SELECT FROM leaderboard_view ...

// Step 2: Try direct table (WORKS if RLS is open)
SELECT FROM leaderboard_scores ...
```

If Step 1 silently fails, Step 2 should work, BUT logging might not show why.

---

## Quick Fixes (3 Options)

### Option A: Make Leaderboard Super Accessible ✅ RECOMMENDED

Run this in Supabase SQL Editor:

```sql
-- 1. Drop all existing leaderboard_scores SELECT policies
DROP POLICY IF EXISTS "Anyone can view leaderboard" ON leaderboard_scores;
DROP POLICY IF EXISTS "Public read leaderboard" ON leaderboard_scores;
DROP POLICY IF EXISTS "Read all leaderboard" ON leaderboard_scores;

-- 2. Create one simple open policy
CREATE POLICY "Open read access" 
  ON leaderboard_scores FOR SELECT 
  TO authenticated
  USING (true);

-- 3. Make sure user_profiles is also readable
DROP POLICY IF EXISTS "Authenticated users can view public profiles" ON user_profiles;
DROP POLICY IF EXISTS "Read all profiles" ON user_profiles;

CREATE POLICY "Open read profiles" 
  ON user_profiles FOR SELECT 
  TO authenticated
  USING (true);

-- 4. Verify no conflicting policies
SELECT tablename, policyname FROM pg_policies 
WHERE tablename IN ('leaderboard_scores', 'user_profiles');

-- 5. Test the query direct
SELECT COUNT(*) FROM leaderboard_scores;
SELECT COUNT(*) FROM leaderboard_view;
```

---

### Option B: Bypass View Entirely - Direct Query Only

Edit `src/services/leaderboardService.ts` and replace the `getLeaderboard()` method:

```typescript
async getLeaderboard(limit: number = 100): Promise<LeaderboardEntry[]> {
  try {
    const supabase = await getSupabase();
    if (!supabase) throw new Error('Supabase client not available');

    console.log('[leaderboardService] Fetching direct from leaderboard_scores...');
    
    // Skip view entirely - go straight to table
    const { data: scoreData, error: scoreError } = await supabase
      .from('leaderboard_scores')
      .select(`
        id, 
        user_id, 
        username, 
        total_score, 
        ctf_score, 
        phish_score, 
        code_score, 
        quiz_score, 
        firewall_score, 
        last_updated,
        ctf_solved_count,
        phish_solved_count,
        code_solved_count,
        quiz_answered,
        quiz_correct,
        firewall_best_score,
        badges
      `)
      .order('total_score', { ascending: false })
      .limit(limit);

    if (scoreError) {
      console.error('[leaderboardService] ✗ Direct query failed:', scoreError);
      throw scoreError;
    }

    if (!scoreData || scoreData.length === 0) {
      console.log('[leaderboardService] No data from direct query');
      return [];
    }

    console.log('[leaderboardService] ✓ Got', scoreData.length, 'entries');
    
    // Join with user_profiles manually
    const profileIds = scoreData.map(s => s.user_id);
    const { data: profiles } = await supabase
      .from('user_profiles')
      .select('id, name, avatar_url')
      .in('id', profileIds);

    const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);

    return scoreData.map((score, idx) => ({
      id: score.id,
      user_id: score.user_id,
      username: score.username,
      name: profileMap.get(score.user_id)?.name || null,
      avatar_url: profileMap.get(score.user_id)?.avatar_url || null,
      total_score: score.total_score,
      ctf_score: score.ctf_score,
      phish_score: score.phish_score,
      code_score: score.code_score,
      quiz_score: score.quiz_score,
      firewall_score: score.firewall_score,
      rank: idx + 1,
      last_updated: score.last_updated,
      ctf_solved_count: score.ctf_solved_count,
      phish_solved_count: score.phish_solved_count,
      code_solved_count: score.code_solved_count,
      quiz_answered: score.quiz_answered,
      quiz_correct: score.quiz_correct,
      firewall_best_score: score.firewall_best_score,
      badges: score.badges || [],
    }));
  } catch (error) {
    console.error('[leaderboardService] Error:', error);
    throw error;
  }
}
```

This avoids the view entirely and makes separate controlled queries.

---

### Option C: Disable RLS Temporarily (Testing Only)

⚠️ **Not recommended for production** but good for debugging:

```sql
-- Disable RLS on all tables (dangerous!)
ALTER TABLE leaderboard_scores DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress DISABLE ROW LEVEL SECURITY;

-- Test if leaderboard works
SELECT COUNT(*) FROM leaderboard_view;

-- If it works, re-enable and fix policies
ALTER TABLE leaderboard_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
```

---

## Testing Strategy

### 1️⃣ Run RLS Diagnostic
Copy all SQL from `RLS_DIAGNOSTIC_FIX.sql` into Supabase SQL Editor
Run it and note:
- Does view return data? 
- Does direct table return data?
- What are the policies?

### 2️⃣ Apply Option A (Recommended)
This creates permissive SELECT policies

### 3️⃣ Test in Browser
- F12 → Console
- Refresh leaderboard page  
- Check for errors or success logs

### 4️⃣ If Still Failing
Try Option B (bypass view, direct queries)

---

## Expected Results ✅

**After fix applied:**

Supabase console shows:
```
leaderboard_scores | total_entries: 5
leaderboard_view   | view_entries: 5
```

Browser console shows:
```
[leaderboardService] Fetching direct from leaderboard_scores...
[leaderboardService] ✓ Got 5 entries
[Leaderboard] Success! Loaded 5 entries
```

Leaderboard page shows:
- **5 users** in the table
- **All scores displaying**
- **No 403 Forbidden errors**

---

## RLS Quick Reference

| Policy | Allows | Auth? |
|--------|--------|-------|
| `USING (true)` | Everyone | ✅ Permissive |
| `USING (auth.uid() = user_id)` | Only own user | ❌ Restrictive |
| `USING (false)` | Nobody | ❌ Blocks everything |
| No policy | Blocks by default | ❌ Restrictive |

---

## Still Not Working?

Check these in order:

1. ✅ Is `leaderboard_scores` table NOT EMPTY?
   ```sql
   SELECT COUNT(*) FROM leaderboard_scores;
   ```

2. ✅ Are there RLS policies BLOCKING SELECT?
   ```sql
   SELECT policyname FROM pg_policies WHERE tablename='leaderboard_scores';
   ```

3. ✅ Are you LOGGED IN to test? (Unauthenticated users can't access `TO authenticated` policies)

4. ✅ Did you RELOAD page after SQL changes? (Cache might block it)

---

**Next: Run RLS_DIAGNOSTIC_FIX.sql and report results!**
