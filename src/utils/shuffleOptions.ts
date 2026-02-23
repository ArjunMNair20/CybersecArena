/**
 * Utility to shuffle answer options while maintaining correct answer index
 */

/**
 * Fisher-Yates shuffle algorithm
 */
function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Shuffle options/choices and return new answer index
 * @param items - Array of options/choices
 * @param correctAnswerIndex - Original index of correct answer
 * @returns Object with shuffled items and new correct answer index
 */
export function shuffleWithAnswerTracking<T>(
  items: T[],
  correctAnswerIndex: number
): { items: T[]; newAnswerIndex: number } {
  if (!items || items.length === 0) {
    return { items, newAnswerIndex: correctAnswerIndex };
  }

  // Get the correct answer
  const correctAnswer = items[correctAnswerIndex];

  // Shuffle the array
  const shuffled = shuffleArray(items);

  // Find where the correct answer ended up
  const newAnswerIndex = shuffled.indexOf(correctAnswer);

  return {
    items: shuffled,
    newAnswerIndex: newAnswerIndex >= 0 ? newAnswerIndex : correctAnswerIndex,
  };
}

/**
 * Process quiz questions to shuffle choices
 */
export function processQuizQuestions<T extends { choices: string[]; answer: number }>(
  questions: T[]
): T[] {
  return questions.map((question) => {
    const { items: shuffledChoices, newAnswerIndex } = shuffleWithAnswerTracking(
      question.choices,
      question.answer
    );
    return {
      ...question,
      choices: shuffledChoices,
      answer: newAnswerIndex,
    };
  });
}

/**
 * Process code challenges to shuffle options
 */
export function processChallenges<T extends { options: string[]; answer: number }>(
  challenges: T[]
): T[] {
  return challenges.map((challenge) => {
    const { items: shuffledOptions, newAnswerIndex } = shuffleWithAnswerTracking(
      challenge.options,
      challenge.answer
    );
    return {
      ...challenge,
      options: shuffledOptions,
      answer: newAnswerIndex,
    };
  });
}
