import { ProgressState } from '../types/progress';

export class ProgressCalculationService {
  // Maximum values from actual data files (for progress percentage calculation)
  private readonly MAX_CTF = 67;         // Actual CTF tasks in ctf.ts
  private readonly MAX_PHISH = 145;      // Actual Phishing tasks in phish.ts
  private readonly MAX_CODE = 50;        // Actual Code tasks in code.ts
  private readonly MAX_QUIZ = 79;        // Actual Quiz questions in quiz.ts
  private readonly MAX_FIREWALL = 100;   // Firewall score range (0-100)

  calculateOverallPercent(state: ProgressState): number {
    // Calculate progress as percentage of max expected items in each category
    const ctfPercent = Math.min(100, (state.ctf.solvedIds.length / this.MAX_CTF) * 100);
    const phishPercent = Math.min(100, (state.phish.solvedIds.length / this.MAX_PHISH) * 100);
    const codePercent = Math.min(100, (state.code.solvedIds.length / this.MAX_CODE) * 100);
    const quizPercent = Math.min(100, (state.quiz.correct / this.MAX_QUIZ) * 100);
    const firewallPercent = Math.min(100, (state.firewall.bestScore / this.MAX_FIREWALL) * 100);

    // Weight each category equally (20% each) for overall progress
    const overall = (ctfPercent + phishPercent + codePercent + quizPercent + firewallPercent) / 5;
    return Math.round(overall);
  }

  calculateOverallScore(state: ProgressState): number {
    // Overall score is calculated as: (overall progress %) * 10 for a 0-1000 scale
    const overallPercent = this.calculateOverallPercent(state);
    return Math.round(overallPercent * 10);
  }
}
