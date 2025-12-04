import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { IProgressStorage } from './IProgressStorage';
import { ProgressState, Difficulty } from '../../types/progress';

export class SupabaseStorageService implements IProgressStorage {
  private supabase: SupabaseClient;

  constructor(supabaseUrl: string, supabaseKey: string) {
    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  async load(): Promise<ProgressState | null> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await this.supabase
        .from('user_progress')
        .select(
          'ctf_solved_ids, phish_solved_ids, code_solved_ids, quiz_answered, quiz_correct, quiz_difficulty, firewall_best_score, badges',
        )
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      if (!data) return null;

      return {
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
      };
    } catch (error) {
      console.error('Failed to load progress from Supabase:', error);
      return null;
    }
  }

  async save(state: ProgressState): Promise<void> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

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
      };

      const { error } = await this.supabase
        .from('user_progress')
        .upsert(progressData, { onConflict: 'user_id' });

      if (error) throw error;
    } catch (error) {
      console.error('Failed to save progress to Supabase:', error);
      throw error;
    }
  }

  async clear(): Promise<void> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser();
      if (!user) return;

      const { error } = await this.supabase
        .from('user_progress')
        .delete()
        .eq('user_id', user.id);

      if (error) throw error;
    } catch (error) {
      console.error('Failed to clear progress from Supabase:', error);
      throw error;
    }
  }
}
