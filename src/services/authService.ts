import { User, LoginCredentials, SignupCredentials } from '../types/auth';
import { getSupabase } from '../lib/supabase';

class AuthService {
  // -------------------- Helpers --------------------
  private async ensureSupabase() {
    const s = await getSupabase();
    if (!s) {
      throw new Error(
        'Supabase is not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file',
      );
    }

    return s;
  }

  private normalizeEmail(rawEmail: string): string {
    return rawEmail.trim().toLowerCase();
  }

  async checkEmailExists(email: string): Promise<boolean> {
    try {
      const s = await this.ensureSupabase();
      const normalizedEmail = this.normalizeEmail(email);

      // Check in user_profiles table
      const { data: existingProfile, error } = await s
        .from('user_profiles')
        .select('id')
        .eq('email', normalizedEmail)
        .single();

      return !!existingProfile;
    } catch (error: any) {
      // If error is "no rows", email doesn't exist
      if (error?.code === 'PGRST116') {
        return false;
      }
      // For other errors, we can't determine, so return false to let signup attempt
      console.error('Error checking email existence:', error);
      return false;
    }
  }

  private validateSignupBasics(credentials: SignupCredentials) {
    const { email, password, username } = credentials;

    if (!email || !password || !username) {
      throw new Error('Email, password, and username are required');
    }

    if (password.length < 6) {
      throw new Error('Password must be at least 6 characters long');
    }

    if (username.length < 3) {
      throw new Error('Username must be at least 3 characters long');
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new Error('Invalid email format');
    }

    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      throw new Error('Username can only contain letters, numbers, and underscores');
    }
  }

  // -------------------- Public API --------------------
  async signup(credentials: SignupCredentials): Promise<{ user: User; needsConfirmation: boolean }> {
    this.validateSignupBasics(credentials);

    const s = await this.ensureSupabase();

    const email = this.normalizeEmail(credentials.email);
    const username = credentials.username.trim();
    const name = credentials.name;

    // Check if email already exists
    const emailExists = await this.checkEmailExists(email);
    if (emailExists) {
      throw new Error('Email already registered. Please sign in instead.');
    }

    // Check if username already exists in user_profiles
    const { data: existingProfile } = await s
      .from('user_profiles')
      .select('username')
      .eq('username', username.toLowerCase())
      .single();

    if (existingProfile) {
      throw new Error('Username already taken');
    }

    // Sign up with Supabase Auth (this will send confirmation email)
    const { data: authData, error: authError } = await s.auth.signUp({
      email,
      password: credentials.password,
      options: {
        emailRedirectTo: `${window.location.origin}/confirm-email`,
        data: {
          username,
          name: name || '',
        },
      },
    });

    if (authError) {
      if (authError.message.includes('already registered')) {
        throw new Error('Email already registered');
      }
      throw new Error(authError.message || 'Failed to create account');
    }

    if (!authData.user) {
      throw new Error('Failed to create account');
    }

    // Create or update user profile in database using upsert
    // This ensures the name is saved even if the trigger already created the profile
    const { error: profileError } = await s.from('user_profiles').upsert({
      id: authData.user.id,
      username: username.toLowerCase(),
      name: name || null,
      email,
    }, {
      onConflict: 'id',
    });

    if (profileError) {
      // If profile creation fails, we still have the auth user.
      // The profile might be created later or already exist.
      console.error('Failed to create or update user profile:', profileError);
    }

    // Create initial progress entry
    const { error: progressError } = await s.from('user_progress').insert({
      user_id: authData.user.id,
      ctf_solved_ids: [],
      phish_solved_ids: [],
      code_solved_ids: [],
      quiz_answered: 0,
      quiz_correct: 0,
      quiz_difficulty: 'easy',
      firewall_best_score: 0,
      badges: [],
    });

    if (progressError) {
      console.error('Failed to create user progress:', progressError);
    }

    // Create initial leaderboard entry
    const { error: leaderboardError } = await s.from('leaderboard_scores').insert({
      user_id: authData.user.id,
      username: username.toLowerCase(),
      total_score: 0,
      ctf_score: 0,
      phish_score: 0,
      code_score: 0,
      quiz_score: 0,
      firewall_score: 0,
    });

    if (leaderboardError) {
      console.error('Failed to create leaderboard entry:', leaderboardError);
    }

    const user: User = {
      id: authData.user.id,
      email,
      username,
      name: name || undefined,
      createdAt: authData.user.created_at || new Date().toISOString(),
    };

    // Check if email confirmation is needed
    const needsConfirmation = !authData.session;

    return { user, needsConfirmation };
  }

  async login(credentials: LoginCredentials): Promise<User> {
    const { email, password } = credentials;

    if (!email || !password) {
      throw new Error('Email and password are required');
    }

    const s = await this.ensureSupabase();
    const normalizedEmail = this.normalizeEmail(email);

    const { data: authData, error: authError } = await s.auth.signInWithPassword({
      email: normalizedEmail,
      password,
    });

    if (authError) {
      if (authError.message.includes('Invalid login credentials')) {
        throw new Error('Invalid email or password');
      }
      if (authError.message.includes('Email not confirmed')) {
        throw new Error(
          'Please confirm your email address before signing in. Check your inbox for the confirmation link.',
        );
      }
      throw new Error(authError.message || 'Failed to login');
    }

    if (!authData.user) {
      throw new Error('Failed to login');
    }

    // Get user profile
    const { data: profile, error: profileError } = await s
      .from('user_profiles')
      .select('username, name, email')
      .eq('id', authData.user.id)
      .single();

    if (profileError) {
      console.error('Failed to load user profile:', profileError);
      // Return basic user info from auth
      return this.buildUserFromAuth(authData.user);
    }

    return {
      id: authData.user.id,
      email: profile.email || authData.user.email || normalizedEmail,
      username: profile.username,
      name: profile.name || undefined,
      createdAt: authData.user.created_at || new Date().toISOString(),
    };
  }

  async logout(): Promise<void> {
    const s = await this.ensureSupabase();

    const { error } = await s.auth.signOut();
    if (error) {
      throw error;
    }
  }

  async getCurrentUser(): Promise<User | null> {
    const s = await this.ensureSupabase();

    // Use getSession first as it's faster and cached
    const { data: { session }, error: sessionError } = await s.auth.getSession();
    
    if (sessionError || !session?.user) {
      // Fallback to getUser if session is not available
      const {
        data: { user: authUser },
        error,
      } = await s.auth.getUser();

      if (error || !authUser) {
        return null;
      }

      return this.buildUserFromAuth(authUser);
    }

    const authUser = session.user;

    // Get user profile in parallel with session check
    try {
      const { data: profile } = await s
        .from('user_profiles')
        .select('username, name, email')
        .eq('id', authUser.id)
        .single();

      if (profile) {
        return {
          id: authUser.id,
          email: profile.email || authUser.email || '',
          username: profile.username,
          name: profile.name || undefined,
          createdAt: authUser.created_at || new Date().toISOString(),
        };
      }
    } catch (profileError) {
      console.warn('Failed to load profile, using auth data:', profileError);
    }

    return this.buildUserFromAuth(authUser);
  }

  private buildUserFromAuth(authUser: any): User {
    return {
      id: authUser.id,
      email: authUser.email || '',
      username: authUser.user_metadata?.username || 'user',
      name: authUser.user_metadata?.name,
      createdAt: authUser.created_at || new Date().toISOString(),
    };
  }

  async isAuthenticated(): Promise<boolean> {
    const s = await this.ensureSupabase();

    const {
      data: { session },
    } = await s.auth.getSession();
    return !!session;
  }

  async resendConfirmationEmail(email: string): Promise<void> {
    const s = await this.ensureSupabase();
    const normalizedEmail = this.normalizeEmail(email);

    const { error } = await s.auth.resend({
      type: 'signup',
      email: normalizedEmail,
      options: {
        emailRedirectTo: `${window.location.origin}/confirm-email`,
      },
    });

    if (error) {
      throw new Error(error.message || 'Failed to resend confirmation email');
    }
  }

  async confirmEmail(token: string, type: string): Promise<void> {
    const s = await this.ensureSupabase();

    const { error } = await s.auth.verifyOtp({
      token_hash: token,
      type: type as any,
    });

    if (error) {
      throw new Error(error.message || 'Failed to confirm email');
    }
  }

  async deleteAccount(password: string): Promise<void> {
    const s = await this.ensureSupabase();

    // Get current user
    const {
      data: { user: authUser },
      error: userError,
    } = await s.auth.getUser();

    if (userError || !authUser) {
      throw new Error('Unable to verify user identity');
    }

    const userId = authUser.id;
    const email = authUser.email;

    if (!email) {
      throw new Error('Unable to find user email');
    }

    // Verify password by attempting re-authentication
    const { error: authError } = await s.auth.signInWithPassword({
      email: this.normalizeEmail(email),
      password,
    });

    if (authError) {
      throw new Error('Invalid password. Account deletion cancelled.');
    }

    // Delete user progress data
    await s.from('user_progress').delete().eq('user_id', userId);

    // Delete user settings
    await s.from('user_settings').delete().eq('user_id', userId);

    // Delete user profile
    await s.from('user_profiles').delete().eq('id', userId);

    // Delete leaderboard entry
    await s.from('leaderboard_scores').delete().eq('user_id', userId);

    // Delete the auth user (this is the final step)
    // Note: In Supabase, deleting the auth user requires the admin API
    // For client-side deletion, we use signOut after the above deletions
    
    const { error: signOutError } = await s.auth.signOut();
    if (signOutError) {
      console.error('Error signing out during account deletion:', signOutError);
    }

    // After all data is deleted, attempt to delete the auth user
    // This requires an admin client, which we don't have access to from the client
    // The backend should handle final auth user deletion
  }
}

export default new AuthService();
