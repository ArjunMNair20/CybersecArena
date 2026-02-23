/**
 * Normalize option lengths to prevent answer prediction based on text size
 * Pads shorter options with relevant context while keeping meaning intact
 */

/**
 * Normalize lengths by adding padding to shorter options
 * Keeps the original content and adds context filler phrases
 */
function normalizeLength(text: string, targetLength: number): string {
  if (text.length >= targetLength * 0.8) return text; // Already close enough
  
  // Add context-neutral padding by extending with relevant details
  const paddings = [
    ' in the context of security',
    ' or related approaches',
    ' according to best practices',
    ' for system protection',
    ' in modern systems',
    ' to ensure safety',
    ' for data protection',
    ' to prevent attacks',
    ' in cybersecurity',
    ' or similar methods',
    ' and related practices',
    ' to enhance security',
  ];
  
  let padded = text;
  let paddingIndex = 0;
  
  while (padded.length < targetLength * 0.75 && paddingIndex < paddings.length) {
    padded += paddings[paddingIndex % paddings.length];
    paddingIndex++;
  }
  
  return padded;
}

/**
 * Process quiz questions to normalize choice lengths
 */
export function normalizeQuizChoices<T extends { choices: string[]; answer: number }>(
  questions: T[]
): T[] {
  return questions.map((question) => {
    // Find max length option
    const maxLength = Math.max(...question.choices.map(c => c.length));
    const targetLength = Math.ceil(maxLength * 0.9); // Target 90% of max
    
    const normalizedChoices = question.choices.map((choice) =>
      normalizeLength(choice, targetLength)
    );
    
    return {
      ...question,
      choices: normalizedChoices,
    };
  });
}

/**
 * Process code challenges to normalize option lengths
 */
export function normalizeChallengeOptions<T extends { options: string[]; answer: number }>(
  challenges: T[]
): T[] {
  return challenges.map((challenge) => {
    // Find max length option
    const maxLength = Math.max(...challenge.options.map(o => o.length));
    const targetLength = Math.ceil(maxLength * 0.9); // Target 90% of max
    
    const normalizedOptions = challenge.options.map((option) =>
      normalizeLength(option, targetLength)
    );
    
    return {
      ...challenge,
      options: normalizedOptions,
    };
  });
}
