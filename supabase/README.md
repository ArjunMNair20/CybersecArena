# Supabase Database Setup Guide

This guide will help you set up the CyberSec Arena database in Supabase.

## Prerequisites

1. A Supabase account (sign up at https://supabase.com)
2. A Supabase project created

## Setup Steps

### 1. Get Your Supabase Credentials

1. Go to your Supabase project dashboard
2. Navigate to **Settings** → **API**
3. Copy the following:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **anon/public key** (starts with `eyJ...`)

### 2. Configure Environment Variables

Create a `.env` file in the root of your project (if it doesn't exist):

```env
VITE_SUPABASE_URL=your-project-url-here
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

**Important:** Never commit the `.env` file to version control. It should already be in `.gitignore`.

### 3. Run the Database Schema

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Click **New Query**
4. Copy the entire contents of `supabase/schema.sql`
5. Paste it into the SQL Editor
6. Click **Run** (or press `Ctrl+Enter` / `Cmd+Enter`)

### 4. Configure Email Authentication

1. Go to **Authentication** → **Providers** in your Supabase dashboard
2. Ensure **Email** provider is enabled
3. Go to **Authentication** → **URL Configuration**
4. Set **Site URL** to your application URL (e.g., `http://localhost:5173` for development)
5. Add redirect URLs:
   - `http://localhost:5173/confirm-email` (for development)
   - `https://yourdomain.com/confirm-email` (for production)

### 5. Configure Email Templates (Optional)

1. Go to **Authentication** → **Email Templates**
2. Customize the **Confirm signup** template if desired
3. The default template will work fine

### 6. Enable Email Confirmation

1. Go to **Authentication** → **Settings**
2. Under **Email Auth**, ensure:
   - **Enable email confirmations** is checked
   - **Secure email change** is enabled (recommended)

### 7. Test the Setup

1. Start your development server: `npm run dev`
2. Try signing up with a new account
3. Check your email for the confirmation link
4. Click the confirmation link
5. Try logging in

## Database Schema Overview

### Tables

1. **user_profiles**
   - Stores user profile information (username, name, email, avatar, bio)
   - Linked to Supabase Auth users

2. **user_progress**
   - Stores game progress (CTF, Phish Hunt, Code & Secure, Quiz, Firewall)
   - Tracks badges and scores

3. **leaderboard_scores**
   - Stores leaderboard entries
   - Aggregated scores for ranking

### Security

- **Row Level Security (RLS)** is enabled on all tables
- Users can only access their own data
- Leaderboard is publicly readable by authenticated users
- All policies are defined in the schema

### Automatic Features

- **Auto-create profile**: When a user signs up, their profile and progress are automatically created
- **Auto-update timestamps**: `updated_at` fields are automatically updated
- **Username sync**: Leaderboard username is automatically synced when profile username changes

## Troubleshooting

### Issue: "Supabase is not configured" error

**Solution:** Make sure your `.env` file has the correct `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` values.

### Issue: Email confirmation not working

**Solution:**
1. Check that email confirmations are enabled in Supabase settings
2. Verify the redirect URL is correctly configured
3. Check your spam folder
4. Ensure the email template is properly configured

### Issue: "Permission denied" errors

**Solution:**
1. Verify RLS policies are created correctly
2. Check that the user is authenticated
3. Ensure the user's email is confirmed

### Issue: Tables not found

**Solution:**
1. Make sure you ran the entire `schema.sql` file
2. Check the SQL Editor for any errors
3. Verify tables exist in **Table Editor**

## Production Checklist

Before deploying to production:

- [ ] Update environment variables with production Supabase credentials
- [ ] Configure production redirect URLs
- [ ] Set up custom email domain (optional)
- [ ] Review and test RLS policies
- [ ] Set up database backups
- [ ] Configure rate limiting (if needed)
- [ ] Test email delivery

## Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Auth Guide](https://supabase.com/docs/guides/auth)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)

