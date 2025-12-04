import { User, LoginCredentials, SignupCredentials } from '../types/auth';
import { supabase } from '../lib/supabase';

class AuthService {
  // -------------------- Helpers --------------------
  private ensureSupabase() {
    if (!supabase) {
      throw new Error(
        'Supabase is not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file',
      );
    }

    return supabase;
  }

  private normalizeEmail(rawEmail: string): string {
    return rawEmail.trim().toLowerCase();
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

    const s = this.ensureSupabase();

    const email = this.normalizeEmail(credentials.email);
    const username = credentials.username.trim();
    const name = credentials.name;

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

    // Create user profile in database
    const { error: profileError } = await s.from('user_profiles').insert({
      id: authData.user.id,
      username: username.toLowerCase(),
      name: name || null,
      email,
    });

    if (profileError) {
      // If profile creation fails, we still have the auth user.
      // The profile might be created later or already exist.
      console.error('Failed to create user profile:', profileError);
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

    const s = this.ensureSupabase();
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
      return {
        id: authData.user.id,
        email: authData.user.email || normalizedEmail,
        username: authData.user.user_metadata?.username || 'user',
        name: authData.user.user_metadata?.name,
        createdAt: authData.user.created_at || new Date().toISOString(),
      };
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
    const s = this.ensureSupabase();

    const { error } = await s.auth.signOut();
    if (error) {
      throw error;
    }
  }

  async getCurrentUser(): Promise<User | null> {
    const s = this.ensureSupabase();

    const {
      data: { user: authUser },
      error,
    } = await s.auth.getUser();

    if (error || !authUser) {
      return null;
    }

    // Get user profile
    const { data: profile } = await s
      .from('user_profiles')
      .select('username, name, email')
      .eq('id', authUser.id)
      .single();

    if (!profile) {
      // Return basic user info from auth
      return {
        id: authUser.id,
        email: authUser.email || '',
        username: authUser.user_metadata?.username || 'user',
        name: authUser.user_metadata?.name,
        createdAt: authUser.created_at || new Date().toISOString(),
      };
    }

    return {
      id: authUser.id,
      email: profile.email || authUser.email || '',
      username: profile.username,
      name: profile.name || undefined,
      createdAt: authUser.created_at || new Date().toISOString(),
    };
  }

  async isAuthenticated(): Promise<boolean> {
    const s = this.ensureSupabase();

    const {
      data: { session },
    } = await s.auth.getSession();
    return !!session;
  }

  async resendConfirmationEmail(email: string): Promise<void> {
    const s = this.ensureSupabase();
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
    const s = this.ensureSupabase();

    const { error } = await s.auth.verifyOtp({
      token_hash: token,
      type: type as any,
    });

    if (error) {
      throw new Error(error.message || 'Failed to confirm email');
    }
  }
}

export default new AuthService();
