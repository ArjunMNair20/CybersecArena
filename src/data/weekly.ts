import { CTF_TASKS, CTFTask } from './ctf';
import { PHISH_EMAILS, PhishEmail } from './phish';
import { CODE_CHALLENGES, CodeChallenge } from './code';
import { QUIZ_QUESTIONS, QuizQuestion } from './quiz';

export type WeeklyChallenge = {
  id: string;
  type: 'ctf' | 'phish' | 'code' | 'quiz';
  questionNumber: number;
  originalId: string;
  data: CTFTask | PhishEmail | CodeChallenge | QuizQuestion;
};

/**
 * Validate that a CTF task is complete and answerable
 */
function isCompleteCTF(task: CTFTask): boolean {
  return !!(
    task &&
    task.id &&
    task.title &&
    task.prompt &&
    task.flag &&
    task.hints &&
    task.hints.length > 0 &&
    task.category &&
    task.difficulty
  );
}

/**
 * Validate that a phishing email is complete and answerable
 */
function isCompletePhish(email: PhishEmail): boolean {
  return !!(
    email &&
    email.id &&
    email.from &&
    email.subject &&
    email.body &&
    email.body.trim().length > 0 &&
    email.isPhish !== undefined &&
    email.hint &&
    email.hint.trim().length > 0
  );
}

/**
 * Validate that a code challenge is complete and answerable
 */
function isCompleteCode(challenge: CodeChallenge): boolean {
  return !!(
    challenge &&
    challenge.id &&
    challenge.title &&
    challenge.snippet &&
    challenge.snippet.trim().length > 0 &&
    challenge.question &&
    challenge.question.trim().length > 0 &&
    challenge.options &&
    challenge.options.length >= 2 &&
    challenge.options.every((opt: string) => opt && opt.trim().length > 0) &&
    challenge.answer !== undefined &&
    challenge.answer >= 0 &&
    challenge.answer < challenge.options.length &&
    challenge.explanation &&
    challenge.explanation.trim().length > 0 &&
    challenge.difficulty
  );
}

/**
 * Validate that a quiz question is complete and answerable
 */
function isCompleteQuiz(question: QuizQuestion): boolean {
  return !!(
    question &&
    question.id &&
    question.prompt &&
    question.prompt.trim().length > 0 &&
    question.choices &&
    question.choices.length >= 2 &&
    question.choices.every((choice: string) => choice && choice.trim().length > 0) &&
    question.answer !== undefined &&
    question.answer >= 0 &&
    question.answer < question.choices.length &&
    question.explain &&
    question.explain.trim().length > 0 &&
    question.difficulty
  );
}

/**
 * Filter question pool to only include complete, answerable questions
 */
function getFilteredCTFTasks(): CTFTask[] {
  return CTF_TASKS.filter(isCompleteCTF);
}

function getFilteredPhishEmails(): PhishEmail[] {
  return PHISH_EMAILS.filter(isCompletePhish);
}

function getFilteredCodeChallenges(): CodeChallenge[] {
  return CODE_CHALLENGES.filter(isCompleteCode);
}

function getFilteredQuizQuestions(): QuizQuestion[] {
  return QUIZ_QUESTIONS.filter(isCompleteQuiz);
}

// Get ISO week number from date
function getISOWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}

// Get current week number (default to today's date)
export function getCurrentWeekNumber(): number {
  return getISOWeekNumber(new Date());
}

// Get user week number based on their signup date
// Week 1 starts on signup date, Week 2 starts 7 days after signup, etc.
export function getUserWeekNumber(signupDateInput: Date | string): number {
  const signupDate = typeof signupDateInput === 'string' ? new Date(signupDateInput) : signupDateInput;
  const today = new Date();
  
  // Normalize both dates to start of day (UTC)
  const signupStart = new Date(Date.UTC(signupDate.getUTCFullYear(), signupDate.getUTCMonth(), signupDate.getUTCDate()));
  const todayStart = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));
  
  // Calculate days elapsed since signup
  const daysElapsed = Math.floor((todayStart.getTime() - signupStart.getTime()) / (1000 * 60 * 60 * 24));
  
  // Calculate week number (Week 1 = days 0-6, Week 2 = days 7-13, etc.)
  const weekNumber = Math.floor(daysElapsed / 7) + 1;
  
  return Math.max(1, weekNumber); // Ensure at least week 1
}

// Seeded random number generator (deterministic)
function seededRandom(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

// Shuffle array with seed for week consistency
function shuffleWithSeed<T>(array: T[], seed: number): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(seededRandom(seed + i) * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// Generate weekly challenges for a specific week
export function generateWeeklyChallenges(weekNumber: number): WeeklyChallenge[] {
  const seed = weekNumber * 12345; // Use week number as seed base

  // Get filtered arrays (only complete, answerable questions) and shuffle them
  const ctfShuffled = shuffleWithSeed(getFilteredCTFTasks(), seed);
  const phishShuffled = shuffleWithSeed(getFilteredPhishEmails(), seed + 1);
  const codeShuffled = shuffleWithSeed(getFilteredCodeChallenges(), seed + 2);
  const quizShuffled = shuffleWithSeed(getFilteredQuizQuestions(), seed + 3);

  // Define type groups for round-robin distribution
  interface TypeGroup {
    type: 'ctf' | 'phish' | 'code' | 'quiz';
    items: (CTFTask | PhishEmail | CodeChallenge | QuizQuestion)[];
    prefix: string;
  }

  const types: TypeGroup[] = [
    { type: 'ctf', items: ctfShuffled, prefix: 'ctf' },
    { type: 'phish', items: phishShuffled, prefix: 'phish' },
    { type: 'code', items: codeShuffled, prefix: 'code' },
    { type: 'quiz', items: quizShuffled, prefix: 'quiz' },
  ];

  // Verify we have enough questions of each type
  const minQuestions = 5; // We need at least 5 of each type for 20 total questions
  for (const typeGroup of types) {
    if (typeGroup.items.length < minQuestions) {
      console.warn(`[Weekly] Warning: Only ${typeGroup.items.length} complete ${typeGroup.type} questions available, need at least ${minQuestions}`);
    }
  }

  // Round-robin distribution to ensure no two consecutive questions are from same type
  // This ensures questions are mixed: CTF, Phish, Code, Quiz, CTF, Phish, Code, Quiz, ...
  const challenges: WeeklyChallenge[] = [];
  const indices = [0, 0, 0, 0]; // Track current index for each type
  const usedQuizIds = new Set<string>(); // Track which quiz questions have been used

  for (let pos = 0; pos < 20; pos++) {
    // Special case: pin firewall question (q-easy-27) to position 13 (1-indexed)
    if (pos === 12) {
      const firewallQuiz = quizShuffled.find((q) => q.id === 'q-easy-27');
      if (firewallQuiz) {
        challenges.push({
          id: `w${weekNumber}-quiz-firewall`,
          type: 'quiz',
          questionNumber: pos + 1,
          originalId: firewallQuiz.id,
          data: firewallQuiz,
        });
        usedQuizIds.add('q-easy-27'); // Mark as used so it won't be added again
        continue;
      }
    }

    // Special case: pin encryption question (q-easy-28) to position 17 (1-indexed)
    if (pos === 16) {
      const encryptionQuiz = quizShuffled.find((q) => q.id === 'q-easy-28');
      if (encryptionQuiz) {
        challenges.push({
          id: `w${weekNumber}-quiz-encryption`,
          type: 'quiz',
          questionNumber: pos + 1,
          originalId: encryptionQuiz.id,
          data: encryptionQuiz,
        });
        usedQuizIds.add('q-easy-28'); // Mark as used so it won't be added again
        continue;
      }
    }

    const typeIdx = pos % 4; // Cycle through types (0=CTF, 1=Phish, 2=Code, 3=Quiz)
    const typeInfo = types[typeIdx];
    const currentIdx = indices[typeIdx];
    
    // Handle case where we run out of questions - cycle back to beginning
    let safeIdx = currentIdx % Math.max(1, typeInfo.items.length);
    let item = typeInfo.items[safeIdx];

    // If this is a quiz and we've already used this question (pinned), skip to next available
    if (typeInfo.type === 'quiz' && item) {
      let attempts = 0;
      while (usedQuizIds.has((item as QuizQuestion).id) && attempts < typeInfo.items.length) {
        safeIdx = (safeIdx + 1) % Math.max(1, typeInfo.items.length);
        item = typeInfo.items[safeIdx];
        attempts++;
      }
      if (item) {
        usedQuizIds.add((item as QuizQuestion).id);
      }
    }

    if (item) {
      challenges.push({
        id: `w${weekNumber}-${typeInfo.prefix}-${safeIdx}`,
        type: typeInfo.type,
        questionNumber: pos + 1,
        originalId: item.id,
        data: item,
      });
    }

    indices[typeIdx]++;
  }

  console.log(`[Weekly] Generated ${challenges.length} weekly challenges for week ${weekNumber}`);
  if (challenges.length < 20) {
    console.warn(`[Weekly] Only generated ${challenges.length} challenges, expected 20`);
  }

  return challenges;
}

// Get current week's challenges (with optional signup date for user-relative calculation)
export function getCurrentWeeklyChallenges(signupDate?: Date | string): WeeklyChallenge[] {
  const weekNumber = signupDate ? getUserWeekNumber(signupDate) : getCurrentWeekNumber();
  return generateWeeklyChallenges(weekNumber);
}

/**
 * Get statistics about question completeness
 * Useful for debugging/monitoring which questions are valid
 */
export function getQuestionCompletenessStats() {
  const ctfTotal = CTF_TASKS.length;
  const ctfValid = getFilteredCTFTasks().length;
  const ctfInvalid = ctfTotal - ctfValid;

  const phishTotal = PHISH_EMAILS.length;
  const phishValid = getFilteredPhishEmails().length;
  const phishInvalid = phishTotal - phishValid;

  const codeTotal = CODE_CHALLENGES.length;
  const codeValid = getFilteredCodeChallenges().length;
  const codeInvalid = codeTotal - codeValid;

  const quizTotal = QUIZ_QUESTIONS.length;
  const quizValid = getFilteredQuizQuestions().length;
  const quizInvalid = quizTotal - quizValid;

  return {
    ctf: { total: ctfTotal, valid: ctfValid, invalid: ctfInvalid, validPercent: Math.round((ctfValid / ctfTotal) * 100) },
    phish: { total: phishTotal, valid: phishValid, invalid: phishInvalid, validPercent: Math.round((phishValid / phishTotal) * 100) },
    code: { total: codeTotal, valid: codeValid, invalid: codeInvalid, validPercent: Math.round((codeValid / codeTotal) * 100) },
    quiz: { total: quizTotal, valid: quizValid, invalid: quizInvalid, validPercent: Math.round((quizValid / quizTotal) * 100) },
    totalQuestions: ctfTotal + phishTotal + codeTotal + quizTotal,
    totalValid: ctfValid + phishValid + codeValid + quizValid,
    totalInvalid: ctfInvalid + phishInvalid + codeInvalid + quizInvalid,
  };
}

// Get week info for display (with optional signup date)
export function getWeekInfo(weekNumberOrSignup?: number | Date | string): {
  weekNumber: number;
  startDate: Date;
  endDate: Date;
} {
  let weekNumber: number;
  let startDate: Date;

  if (typeof weekNumberOrSignup === 'number') {
    // If a specific week number is provided
    weekNumber = weekNumberOrSignup;
    // Calculate dates based on current ISO week (fallback behavior)
    const year = new Date().getFullYear();
    const simple = new Date(year, 0, 1 + (weekNumber - 1) * 7);
    const dow = simple.getDay();
    startDate = new Date(simple);
    if (dow <= 4) {
      startDate.setDate(simple.getDate() - simple.getDay() + 1);
    } else {
      startDate.setDate(simple.getDate() + 8 - simple.getDay());
    }
  } else {
    // If signup date is provided or calculate from current user
    const signupInput = weekNumberOrSignup || new Date();
    const signupDateObj =
      typeof signupInput === 'string' ? new Date(signupInput) : signupInput;
    weekNumber = getUserWeekNumber(signupDateObj);
    
    // Calculate start date based on signup date
    const signupStart = new Date(
      Date.UTC(
        signupDateObj.getUTCFullYear(),
        signupDateObj.getUTCMonth(),
        signupDateObj.getUTCDate()
      )
    );
    const daysElapsed = Math.floor(
      (new Date().getTime() - signupStart.getTime()) / (1000 * 60 * 60 * 24)
    );
    const weeksElapsed = Math.floor(daysElapsed / 7);
    startDate = new Date(signupStart);
    startDate.setDate(startDate.getDate() + weeksElapsed * 7);
  }

  // End date is 6 days after start (Sunday of the week)
  const endDate = new Date(startDate);
  endDate.setDate(startDate.getDate() + 6);

  return {
    weekNumber,
    startDate,
    endDate,
  };
}
