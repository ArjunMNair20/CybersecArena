# Supabase Integration Setup

The application is now architected with SOLID principles and is ready to use Supabase for data persistence. Currently, it uses localStorage by default and will automatically switch to Supabase when properly configured.

## Current Status

- ✅ SOLID architecture implemented
- ✅ Storage abstraction layer created
- ✅ LocalStorageService (active)
- ✅ SupabaseStorageService (ready for use)
- ⏸️ Supabase database setup (pending configuration)

## Database Schema Required

When Supabase is configured, you'll need to create these tables:

### 1. user_profiles
```sql
CREATE TABLE user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username text UNIQUE NOT NULL,
  name text,
  email text NOT NULL,
  avatar_url text,
  bio text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT username_length CHECK (char_length(username) >= 3),
  CONSTRAINT username_format CHECK (username ~ '^[a-zA-Z0-9_]+$')
);
```

### 2. user_progress
```sql
CREATE TABLE user_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  ctf_solved_ids text[] DEFAULT '{}',
  phish_solved_ids text[] DEFAULT '{}',
  code_solved_ids text[] DEFAULT '{}',
  quiz_answered integer DEFAULT 0,
  quiz_correct integer DEFAULT 0,
  quiz_difficulty text DEFAULT 'easy',
  firewall_best_score integer DEFAULT 0,
  badges text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

### 3. leaderboard_scores
```sql
CREATE TABLE leaderboard_scores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  username text NOT NULL,
  total_score integer DEFAULT 0,
  last_updated timestamptz DEFAULT now()
);
```

## Row Level Security Policies

Enable RLS and create policies for each table to ensure users can only access their own data.

## How It Works

The application uses a factory pattern in `src/config/storage.ts`:

```typescript
export function createStorageService(): IProgressStorage {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  // If Supabase is configured, use it
  if (supabaseUrl && supabaseKey && supabaseKey !== 'undefined') {
    return new SupabaseStorageService(supabaseUrl, supabaseKey);
  }

  // Otherwise, use localStorage
  return new LocalStorageService();
}
```

## To Enable Supabase

1. Set up a Supabase project
2. Configure the `.env` file with valid credentials:
   ```
   VITE_SUPABASE_URL=your-project-url
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```
3. Run the migration to create tables and RLS policies
4. The app will automatically switch to using Supabase

## Benefits of This Architecture

- **No code changes needed** to switch storage backends
- **Guest mode supported**: Users can play without authentication (uses localStorage)
- **Seamless migration**: When users sign up, their progress can be synced to Supabase
- **Easy testing**: Can mock storage for unit tests
- **Type-safe**: Full TypeScript support throughout

## SOLID Principles Applied

1. **Single Responsibility**: Each service has one job
2. **Open/Closed**: Open for extension (new storage types), closed for modification
3. **Liskov Substitution**: Any IProgressStorage implementation works
4. **Interface Segregation**: Focused interfaces
5. **Dependency Inversion**: Depends on abstractions, not concrete implementations

See `src/services/README.md` for more details on the architecture.
