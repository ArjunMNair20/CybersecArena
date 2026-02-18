-- Add missing columns to user_profiles table
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS avatar_url text,
ADD COLUMN IF NOT EXISTS bio text,
ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- Add comments to the columns
COMMENT ON COLUMN user_profiles.avatar_url IS 'URL of the user avatar image';
COMMENT ON COLUMN user_profiles.bio IS 'User biography or about text';
COMMENT ON COLUMN user_profiles.updated_at IS 'Last update timestamp';
