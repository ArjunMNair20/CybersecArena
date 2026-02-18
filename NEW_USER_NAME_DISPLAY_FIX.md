# Fix: New User Names Display on Leaderboard ✅

## Problem

**Issue**: "New users name are not showing properly on the leaderboard"

**Root Cause**: 
- When a new user signs up, the database trigger `handle_new_user()` creates the `user_profiles` record immediately
- The trigger extracts the name from Supabase auth's `raw_user_meta_data->>'name'` 
- Meanwhile, the `authService.signup()` tries to insert a profile with the explicit name value
- The authService insert **fails silently** because the profile already exists (created by trigger)
- Result: The trigger's record (with potentially empty/null name) persists instead of the authService's record (with the full name)

## Solution Implemented

**Changed**: `authService.ts` line 122 - Replaced `.insert()` with `.upsert()`

**What This Does**:
- Uses `upsert` with `onConflict: 'id'` to handle the race condition
- If the trigger already created the profile, upsert will **update** it with the correct name
- If the profile doesn't exist yet, upsert will create it
- Guarantees the full name is saved to `user_profiles.name` regardless of timing

## Code Change

**Before**:
```typescript
const { error: profileError } = await s.from('user_profiles').insert({
  id: authData.user.id,
  username: username.toLowerCase(),
  name: name || null,
  email,
});
```

**After**:
```typescript
const { error: profileError } = await s.from('user_profiles').upsert({
  id: authData.user.id,
  username: username.toLowerCase(),
  name: name || null,
  email,
}, {
  onConflict: 'id',
});
```

## How the Display Works Now

1. User signs up with name "John Doe"
2. Signup sends: `name: 'John Doe'` in auth meta data
3. Trigger runs (from auth.users insert):
   - Creates user_profiles with name extracted from raw_user_meta_data
4. AuthService runs (after auth.signUp completes):
   - Upserts user_profiles with explicit `name: 'John Doe'`
   - This **updates** the trigger's record to ensure name is correct
5. Leaderboard fetches the profile:
   - Gets user_profiles record with `name: 'John Doe'`
   - Displays "John Doe" instead of username ✓

## Files Modified

- `src/services/authService.ts` (Line 122-135)

## Testing

**Test Case 1: New User with Name**
1. Sign up with name: "Alice Smith", username: "alice123"
2. Go to Leaderboard
3. **Expected**: Shows "Alice Smith" (not "alice123")

**Test Case 2: New User without Name** 
1. Sign up with no name field (leave blank), username: "bob456"
2. Go to Leaderboard
3. **Expected**: Shows "bob456" (username as fallback - this is correct behavior)

**Test Case 3: Multiple Users**
1. Sign up multiple users with full names
2. All should display their full names on leaderboard, not usernames

## Related Components

- **authService.ts**: Handles signup and now ensures name is saved with upsert
- **Leaderboard.tsx**: Displays name via `getDisplayName()` which prefers name over username
- **leaderboardService.ts**: Fetches profiles from user_profiles to get name
- **schema.sql trigger**: handle_new_user() still creates initial profile, but now authService ensures it's updated with correct name

## Why This Works

The UPSERT approach uses the database principle of **"insert if not exists, update if exists"**:
- It's atomic and race-condition safe
- Handles both scenarios: trigger creating first, or no trigger
- Ensures the most complete data (explicit name) always wins
- No manual merge logic needed
