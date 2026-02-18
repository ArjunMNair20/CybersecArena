# Leaderboard Not Displaying Scores - Debug & Fix

## Status Check

The leaderboard component has been simplified to load data directly. However, scores might not be showing because:

1. **No data in leaderboard_scores table** - Users haven't been synced to it
2. **RLS (Row Level Security) permissions** - Can't read the data
3. **Data format issue** - Columns don't match what we're querying

## Step 1: Check if data exists (60 seconds)

Run this in Supabase SQL Editor (file: `TEST_LEADERBOARD_QUERY.sql`):

```sql
-- How many users in leaderboard_scores?
SELECT COUNT(*) as total_count FROM leaderboard_scores;

-- Show all users with their scores
SELECT 
  username,
  total_score,
  ctf_score,
  phish_score,
  code_score
FROM leaderboard_scores
ORDER BY total_score DESC;
```

**Expected output**: Should show all 5 users with their scores

---

## Step 2: Check browser console (Now)

1. Open your browser DevTools (F12)
2. Go to **Console** tab
3. **Clear** console
4. **Refresh** the leaderboard page
5. Look for logs starting with `[Leaderboard]` and `[leaderboardService]`

**What to look for:**

✅ **Good sign**:
```
[Leaderboard] Starting leaderboard load...
[Leaderboard] Fetching leaderboard from database...
[leaderboardService] ===== LEADERBOARD FETCH START =====
[leaderboardService] Step 1: Attempting to fetch from leaderboard_view...
[leaderboardService] ✓ Got X score entries from leaderboard_scores
[Leaderboard] Success! Loaded 5 entries
```

❌ **Bad sign**:
```
[leaderboardService] ✗ Score fetch failed: <ERROR MESSAGE>
[leaderboard] Error loading leaderboard: <ERROR>
[leaderboardService] ℹ No leaderboard entries found
```

---

## Step 3: If no data, sync users to leaderboard

If the query shows 0 users in leaderboard_scores, run this SQL:

```sql
-- Create leaderboard entry for every single user
INSERT INTO leaderboard_scores (
  user_id, 
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
  quiz_answered,
  quiz_correct,
  firewall_best_score,
  badges
)
SELECT 
  au.id,
  COALESCE(up.username, 'user_' || substr(au.id::text, 1, 8)),
  0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0,
  '{}'
FROM auth.users au
LEFT JOIN user_profiles up ON au.id = up.id
LEFT JOIN leaderboard_scores ls ON au.id = ls.user_id
WHERE ls.user_id IS NULL
ON CONFLICT (user_id) DO NOTHING;

-- Verify
SELECT COUNT(*) FROM leaderboard_scores;
```

---

## Step 4: Check RLS permissions

If you get a 403 Forbidden error, it's an RLS issue. Run this to fix:

```sql
-- Make sure leaderboard_scores is readable by authenticated users
ALTER TABLE leaderboard_scores DISABLE ROW LEVEL SECURITY;

-- Or create a permissive policy:
CREATE POLICY "Anyone can view leaderboard"
  ON leaderboard_scores FOR SELECT
  TO authenticated
  USING (true);
```

---

## Step 5: Deploy and test

After fixes, redeploy:

```bash
npm run build
# Deploy
```

Then refresh the leaderboard page and check the console logs again.

---

## Troubleshooting Matrix

| Symptom | Cause | Fix |
|---------|-------|-----|
| "No data to load" | leaderboard_scores empty | Run sync SQL in Step 3 |
| 403 Forbidden errors | RLS too strict | Run RLS fix in Step 4 |
| Loads 3/5 users | Missing leaderboard entries | Run sync SQL in Step 3 |
| Shows loading forever | Query throwing error | Check Step 2 console logs |
| Scores show as 0 | Data synced but empty | Complete challenges to populate |

---

## Files Updated

1. ✅ **Leaderboard.tsx** - Simplified loading logic
2. ✅ **leaderboardService.ts** - Better logging and error handling
3. 📄 **TEST_LEADERBOARD_QUERY.sql** - Verify data exists
4. 📄 **COMPLETE_FIX_NOW.sql** - One-click sync (from earlier)

---

## Next Steps

1. Run Step 1 query to check if data exists
2. Check console logs (Step 2)
3. If needed, run sync SQL (Step 3)
4. If permissions error, run RLS fix (Step 4)
5. Deploy and test

**After these steps, your leaderboard should display all 5 users with their scores!**
