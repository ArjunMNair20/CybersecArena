export type Difficulty = 'easy' | 'medium' | 'hard';

export type ProgressState = {
  ctf: { solvedIds: string[] };
  phish: { solvedIds: string[] };
  code: { solvedIds: string[] };
  quiz: { answered: number; correct: number; difficulty: Difficulty };
  firewall: { bestScore: number };
  badges: string[];
  weekly: { weekNumber: number; solvedIds: string[] };
};

export const defaultProgress: ProgressState = {
  ctf: { solvedIds: [] },
  phish: { solvedIds: [] },
  code: { solvedIds: [] },
  quiz: { answered: 0, correct: 0, difficulty: 'easy' },
  firewall: { bestScore: 0 },
  badges: [],
  weekly: { weekNumber: 0, solvedIds: [] },
};
