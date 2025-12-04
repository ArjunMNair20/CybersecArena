import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { ProgressState, defaultProgress } from '../types/progress';
import { IProgressStorage } from '../services/storage/IProgressStorage';
import { BadgeService } from '../services/BadgeService';
import { ProgressCalculationService } from '../services/ProgressCalculationService';
import { createStorageService } from '../config/storage';

export type { Difficulty } from '../types/progress';
export { defaultProgress, type ProgressState } from '../types/progress';

export type ProgressContextType = {
  state: ProgressState;
  setState: React.Dispatch<React.SetStateAction<ProgressState>>;
  markCTFSolved: (id: string) => void;
  markPhishSolved: (id: string) => void;
  markCodeSolved: (id: string) => void;
  recordQuiz: (correct: boolean) => void;
  setQuizDifficulty: (difficulty: Difficulty) => void;
  setFirewallBest: (score: number) => void;
  reset: () => void;
};

const ProgressContext = createContext<ProgressContextType | null>(null);

export function overallPercent(state: ProgressState): number {
  const service = new ProgressCalculationService();
  return service.calculateOverallPercent(state);
}

export function overallScore(state: ProgressState): number {
  const service = new ProgressCalculationService();
  return service.calculateOverallScore(state);
}

interface ProgressProviderProps {
  children: React.ReactNode;
  storage?: IProgressStorage;
}

export function ProgressProvider({ children, storage }: ProgressProviderProps) {
  const storageService = useMemo<IProgressStorage>(() => storage || createStorageService(), [storage]);
  const badgeService = useMemo(() => new BadgeService(), []);

  const [state, setState] = useState<ProgressState>(() => defaultProgress);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const loadProgress = async () => {
      const loaded = await storageService.load();
      if (loaded) {
        setState(loaded);
      }
      setIsLoaded(true);
    };
    loadProgress();
  }, [storageService]);

  useEffect(() => {
    if (!isLoaded) return;

    const saveProgress = async () => {
      const stateWithBadges = {
        ...state,
        badges: badgeService.computeBadges(state, state.badges),
      };

      if (JSON.stringify(stateWithBadges) !== JSON.stringify(state)) {
        setState(stateWithBadges);
      }

      await storageService.save(stateWithBadges);
    };

    saveProgress();
  }, [state, isLoaded, storageService, badgeService]);

  const api = useMemo<ProgressContextType>(
    () => ({
      state,
      setState,
      markCTFSolved: (id) =>
        setState((s) => ({
          ...s,
          ctf: { solvedIds: Array.from(new Set([...s.ctf.solvedIds, id])) },
        })),
      markPhishSolved: (id) =>
        setState((s) => ({
          ...s,
          phish: { solvedIds: Array.from(new Set([...s.phish.solvedIds, id])) },
        })),
      markCodeSolved: (id) =>
        setState((s) => ({
          ...s,
          code: { solvedIds: Array.from(new Set([...s.code.solvedIds, id])) },
        })),
      recordQuiz: (correct) =>
        setState((s) => {
          const answered = s.quiz.answered + 1;
          const correctCount = s.quiz.correct + (correct ? 1 : 0);
          return {
            ...s,
            quiz: { ...s.quiz, answered, correct: correctCount },
          };
        }),
      setQuizDifficulty: (difficulty) =>
        setState((s) => ({
          ...s,
          quiz: { ...s.quiz, difficulty },
        })),
      setFirewallBest: (score) =>
        setState((s) => ({
          ...s,
          firewall: { bestScore: Math.max(s.firewall.bestScore, score) },
        })),
      reset: () => {
        setState(defaultProgress);
        storageService.clear();
      },
    }),
    [state, storageService]
  );

  return <ProgressContext.Provider value={api}>{children}</ProgressContext.Provider>;
}

export function useProgress() {
  const ctx = useContext(ProgressContext);
  if (!ctx) throw new Error('useProgress must be used within ProgressProvider');
  return ctx;
}
