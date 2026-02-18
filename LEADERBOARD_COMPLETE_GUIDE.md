# Complete Guide - Store & Display User Scores in Leaderboard

## Quick Overview

Your leaderboard needs THREE things working together:

1. **Database** - Scores stored in `leaderboard_scores` table
2. **API** - Service fetches and returns scores
3. **UI** - Component displays the scores

All three have been fixed. Now follow these steps:

---

## STEP 1: Sync All Current User Scores

The `leaderboard_scores` table might be empty or have 0 scores. Let's populate it with real scores from `user_progress`.

**Run this SQL in Supabase:**

Copy everything from [SYNC_USER_SCORES.sql](SYNC_USER_SCORES.sql) and run it in Supabase SQL Editor.

This will:
- ✅ Calculate scores from user progress data
- ✅ Update `leaderboard_scores` table with all user scores
- ✅ Display the updated leaderboard
- ✅ Verify RLS policies are correct

**Score Calculation:**
```
CTF Score       = (CTF solved count) × 100
Phishing Score  = (Phish solved count) × 150
Code Score      = (Code solved count) × 150
Quiz Score      = (Quiz correct count) × 80
Firewall Score  = (Firewall best score) × 20
─────────────────────────────────────────
TOTAL SCORE     = Sum of all above
```

---

## STEP 2: Verify Data in Database

After running `SYNC_USER_SCORES.sql`, you should see output showing:

```
=== LEADERBOARD (all users sorted by score) ===
rank | username | name      | total_score | ctf_count | phish_count
──────────────────────────────────────────────────────────────────
  1  | user1    | User One  |    1500    |    5     |    3
  2  | user2    | User Two  |     900    |    3     |    2
  ...
```

If you see this, **scores are now in the database!** ✅

---

## STEP 3: Check Frontend Components

The frontend components have already been updated to fetch and display scores.

**Component: [src/pages/Leaderboard.tsx](src/pages/Leaderboard.tsx)**
- Loads leaderboard data on mount
- Displays all users with scores
- Shows progress breakdown (CTF, Phishing, Code, Quiz, Firewall)
- Shows user's position in leaderboard

**Service: [src/services/leaderboardService.ts](src/services/leaderboardService.ts)**
- `getLeaderboard()` - Fetches all scores from database
- `syncUserScore()` - Updates user's score when progress changes
- Handles caching for offline support

---

## STEP 4: Test in Browser

1. **Open your Leaderboard page**
2. **Open DevTools (F12)** and go to **Console tab**
3. **Refresh the page** (Ctrl+R or Cmd+R)
4. **Check console logs:**

```
[Leaderboard] Starting leaderboard load...
[Leaderboard] Fetching leaderboard from database...
[leaderboardService] ===== LEADERBOARD FETCH START =====
[leaderboardService] Step 1: Attempting to fetch from leaderboard_view...
[leaderboardService] Step 2: Fallback - fetch from leaderboard_scores...
[leaderboardService] ✓ Got 5 score entries from leaderboard_scores
[leaderboard] Success! Loaded 5 entries
```

**Expected Result:**
- ✅ All 5 users visible in leaderboard table
- ✅ Each user shows their total score
- ✅ Score breakdown shown (CTF, Phishing, etc.)
- ✅ "Your Position" card shows current user's rank
- ✅ No red errors in console

---

## STEP 5: Real-Time Score Updates

When a user completes a task (solves CTF, takes quiz, etc.), their score should update:

**What happens:**
1. User completes task → Progress saved to `user_progress` table
2. React component recalculates score
3. Component calls `leaderboardService.syncUserScore()`
4. Service updates `leaderboard_scores` table
5. Next leaderboard refresh shows new score

**This happens automatically** - The component has a sync effect that runs when progress changes:

```tsx
// Auto-sync user's score to database when progress updates
useEffect(() => {
  if (!user || !userScores) return;
  
  const syncScore = async () => {
    await leaderboardService.syncUserScore(
      user.id,
      user.username,
      userScores,
      progressPayload
    );
  };
  
  const timeoutId = setTimeout(syncScore, 50);
  return () => clearTimeout(timeoutId);
}, [user, userScores, state]);
```

---

## STEP 6: Diagram of Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│                     USER COMPLETES TASK                     │
└────────────────────────────┬────────────────────────────────┘
                             │
                             ▼
                    ┌──────────────┐
                    │ user_progress│
                    │    TABLE     │
                    │              │
                    │ ctf_solved: 5│
                    │ quiz_correct:20
                    └──────────────┘
                             │
                             │ (Component reads)
                             ▼
                    ┌──────────────────────┐
                    │   React Component    │
                    │ Calculates Score:    │
                    │ 5*100 + 20*80 = 2600 │
                    └──────────────────────┘
                             │
                             │ (Syncs back)
                             ▼
                    ┌──────────────────────┐
                    │ leaderboard_scores   │
                    │      TABLE           │
                    │                      │
                    │ total_score: 2600    │
                    │ ctf_score: 500       │
                    │ quiz_score: 1600     │
                    └──────────────────────┘
                             │
                             │ (View displays)
                             ▼
                    ┌──────────────────────┐
                    │  leaderboard_view    │
                    │       VIRTUAL        │
                    │                      │
                    │ Rank 1: User A 2600  │
                    │ Rank 2: User B 1500  │
                    └──────────────────────┘
                             │
                             │ (Browser loads)
                             ▼
                ┌──────────────────────────────┐
                │   Leaderboard Page Displays  │
                │                              │
                │ 1. User A    2600 points     │
                │ 2. User B    1500 points     │
                │ 3. User C     900 points     │
                └──────────────────────────────┘
```

---

## Database Structure (Now Complete)

```sql
leaderboard_scores
├── user_id (PRIMARY KEY)  ──┐
├── username              │
├── total_score          │
├── ctf_score            ├─→ Scores
├── phish_score          │
├── code_score           │
├── quiz_score           │
├── firewall_score       │
├── ctf_solved_count     │
├── phish_solved_count   ├─→ Progress
├── code_solved_count    │   Details
├── quiz_correct         │
├── firewall_best_score  │
├── badges              │
└── created_at          │

user_profiles
├── id (PRIMARY KEY)
├── username
├── name
├── avatar_url
└── ...

user_progress
├── user_id (UNIQUE)
├── ctf_solved_ids[]
├── phish_solved_ids[]
├── code_solved_ids[]
├── quiz_correct
├── firewall_best_score
├── badges[]
└── ...
```

---

## Troubleshooting

### Issue: Leaderboard shows but all scores are 0
**Solution:** Run [SYNC_USER_SCORES.sql](SYNC_USER_SCORES.sql) to calculate and populate scores

### Issue: Only some users showing
**Solution:** Run this SQL to ensure all users have leaderboard entries:
```sql
INSERT INTO leaderboard_scores (user_id, username, total_score, ctf_score, phish_score, code_score, quiz_score, firewall_score)
SELECT 
  au.id,
  COALESCE(up.username, 'user_' || substr(au.id::text, 1, 8)),
  0, 0, 0, 0, 0, 0
FROM auth.users au
LEFT JOIN user_profiles up ON au.id = up.id
LEFT JOIN leaderboard_scores ls ON au.id = ls.user_id
WHERE ls.user_id IS NULL
ON CONFLICT (user_id) DO NOTHING;
```

### Issue: Scores not updating when user completes tasks
**Solution:** 
1. Open browser Console (F12)
2. Look for `[leaderboardService] SYNC SUCCESS` or `SYNC FAILED` messages
3. If failing, check:
   - Is user logged in?
   - Does user have a profile?
   - Are RLS policies correct?

### Issue: No data loading at all
**Solution:** 
1. Check if `leaderboard_view` exists: Run `SELECT * FROM leaderboard_view LIMIT 1;`
2. Check if `leaderboard_scores` has data: Run `SELECT COUNT(*) FROM leaderboard_scores;`
3. Check RLS policies: Run `SELECT * FROM pg_policies WHERE tablename IN ('leaderboard_scores', 'user_profiles');`

---

## Files Created/Updated

| File | Purpose |
|------|---------|
| [SYNC_USER_SCORES.sql](SYNC_USER_SCORES.sql) | Populate scores from user progress ✅ |
| [FINAL_LEADERBOARD_FIX.sql](FINAL_LEADERBOARD_FIX.sql) | Create view + fix RLS ✅ |
| [src/services/leaderboardService.ts](src/services/leaderboardService.ts) | Fetch & sync scores ✅ |
| [src/pages/Leaderboard.tsx](src/pages/Leaderboard.tsx) | Display leaderboard ✅ |

---

## Summary

✅ **Database:** leaderboard_scores table with full score data  
✅ **View:** leaderboard_view displays ranked users  
✅ **RLS:** Policies allow authenticated users to read leaderboard  
✅ **API:** Service fetches scores and syncs updates  
✅ **UI:** Component displays all users with scores  

**Ready to go! The leaderboard should now display all user scores properly.** 🚀
