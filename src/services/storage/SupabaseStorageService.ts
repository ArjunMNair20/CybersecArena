import { IProgressStorage } from './IProgressStorage';
import { ProgressState, Difficulty } from '../../types/progress';
import { getSupabase } from '../../lib/supabase';
import { LocalStorageService } from './LocalStorageService';

/**
 * Hybrid Storage Service - Saves to both Supabase and LocalStorage
 * 
 * This ensures progress is ALWAYS persisted:
 * - When logged in: Saves to both Supabase (database) and localStorage (client)
 * - When logged out: Falls back to localStorage automatically
 * - On refresh: Loads from localStorage first (instant), then syncs with Supabase
 * - On login: Loads from Supabase and updates localStorage
 * 
 * This guarantees no progress is ever lost, even across logout/login cycles
 */
export class SupabaseStorageService implements IProgressStorage {
  private localStorageService: LocalStorageService;

  constructor(localStorageKey: string = 'cybersec_arena_progress_v1') {
    this.localStorageService = new LocalStorageService(localStorageKey);
  }

  private async client() {
    const s = await getSupabase();
    if (!s) throw new Error('Supabase is not configured');
    return s;
  }

  private async isUserAuthenticated(): Promise<boolean> {
    try {
      const supabase = await this.client();
      const { data: { user } } = await supabase.auth.getUser();
      return !!user;
    } catch {
      return false;
    }
  }

  async load(): Promise<ProgressState | null> {
    try {
      // Always load from localStorage first for instant availability
      const localProgress = await this.localStorageService.load();

      // Try to load from Supabase if user is authenticated
      const isAuthenticated = await this.isUserAuthenticated();
      if (isAuthenticated) {
        try {
          const supabase = await this.client();
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            const { data, error } = await supabase
              .from('user_progress')
              .select(
                'ctf_solved_ids, phish_solved_ids, code_solved_ids, quiz_answered, quiz_correct, quiz_difficulty, firewall_best_score, badges',
              )
              .eq('user_id', user.id)
              .maybeSingle();

            if (!error && data) {
              const supabaseProgress = {
                ctf: { solvedIds: data.ctf_solved_ids || [] },
                phish: { solvedIds: data.phish_solved_ids || [] },
                code: { solvedIds: data.code_solved_ids || [] },
                quiz: {
                  answered: data.quiz_answered || 0,
                  correct: data.quiz_correct || 0,
                  difficulty: (data.quiz_difficulty || 'easy') as Difficulty,
                },
                firewall: { bestScore: data.firewall_best_score || 0 },
                badges: data.badges || [],
                // IMPORTANT: Preserve weekly data from localStorage (not stored in Supabase)
                weekly: localProgress?.weekly || { weekNumber: 0, solvedIds: [] },
              };

              // Sync Supabase data to localStorage to keep them in sync
              await this.localStorageService.save(supabaseProgress);
              return supabaseProgress;
            }
          }
        } catch (error) {
          console.error('Failed to load from Supabase, using localStorage:', error);
        }
      }

      // Return localStorage data or null
      return localProgress;
    } catch (error) {
      console.error('Failed to load progress:', error);
      return null;
    }
  }

  async save(state: ProgressState): Promise<void> {
    try {
      // ALWAYS save to localStorage first - this is the guarantee
      await this.localStorageService.save(state);

      // Try to save to Supabase if user is authenticated
      const isAuthenticated = await this.isUserAuthenticated();
      if (isAuthenticated) {
        try {
          const supabase = await this.client();
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            const progressData = {
              user_id: user.id,
              ctf_solved_ids: state.ctf.solvedIds,
              phish_solved_ids: state.phish.solvedIds,
              code_solved_ids: state.code.solvedIds,
              quiz_answered: state.quiz.answered,
              quiz_correct: state.quiz.correct,
              quiz_difficulty: state.quiz.difficulty,
              firewall_best_score: state.firewall.bestScore,
              badges: state.badges,
              // Note: weekly data is NOT synced to Supabase (ephemeral, resets each week)
            };

            const { error } = await supabase
              .from('user_progress')
              .upsert(progressData, { onConflict: 'user_id' });

            if (error) {
              console.error('Failed to save to Supabase (but localStorage was saved):', error);
            }
          }
        } catch (error) {
          console.error('Failed to save to Supabase (but localStorage was saved):', error);
        }
      } else {
        console.debug('User not authenticated - progress saved to localStorage only');
      }
    } catch (error) {
      console.error('Failed to save progress to localStorage:', error);
      throw error;
    }
  }

  async clear(): Promise<void> {
    try {
      // ALWAYS clear localStorage
      await this.localStorageService.clear();

      // Try to clear from Supabase if user is authenticated
      const isAuthenticated = await this.isUserAuthenticated();
      if (isAuthenticated) {
        try {
          const supabase = await this.client();
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            const { error } = await supabase
              .from('user_progress')
              .delete()
              .eq('user_id', user.id);

            if (error) {
              console.error('Failed to clear from Supabase (but localStorage was cleared):', error);
            }
          }
        } catch (error) {
          console.error('Failed to clear from Supabase (but localStorage was cleared):', error);
        }
      }
    } catch (error) {
      console.error('Failed to clear progress from localStorage:', error);
      throw error;
    }
  }
}
