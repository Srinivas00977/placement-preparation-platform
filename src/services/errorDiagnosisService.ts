/**
 * PlacePilot AI — Smart Error Diagnosis & Fix Helper
 * Instant rule-based analysis + Gemini AI deep diagnostic
 */

export interface ErrorDiagnosisResult {
  errorType: 'Syntax Error' | 'Runtime Error' | 'Wrong Answer' | 'Empty Implementation' | 'Time Limit Exceeded';
  summary: string;
  rootCause: string;
  fixSteps: string[];
  suggestedHint?: string;
}

export const errorDiagnosisService = {
  /**
   * Instant local rule-based diagnostic for common coding mistakes
   */
  diagnoseLocally(params: {
    code: string;
    language: string;
    functionName: string;
    error?: string | null;
    actualOutput?: string;
    expectedOutput?: string;
    problemHints?: string[];
  }): ErrorDiagnosisResult {
    const { code, language, functionName, error, actualOutput, expectedOutput, problemHints } = params;
    const trimmed = code.trim();

    // 1. Empty implementation check
    if (
      !trimmed ||
      (trimmed.includes('pass') && trimmed.includes('# Write your') && !trimmed.includes('return')) ||
      (trimmed.includes('// Write your') && !trimmed.includes('return'))
    ) {
      return {
        errorType: 'Empty Implementation',
        summary: 'No functional solution code detected.',
        rootCause: `The starter template was executed without defining the logic or returning a value for '${functionName}'.`,
        fixSteps: [
          'Replace the placeholder comment or pass statement with your algorithmic steps.',
          `Ensure you use the input arguments provided to '${functionName}'.`,
          'Add an explicit `return` statement that produces the expected data type.',
        ],
        suggestedHint: problemHints?.[0] || 'Start by understanding the input constraints and writing the simplest brute-force approach first.',
      };
    }

    // 2. Timeout check
    if (error && error.includes('Time Limit Exceeded')) {
      return {
        errorType: 'Time Limit Exceeded',
        summary: 'Execution took longer than 2.0s (possible infinite loop or deep recursion).',
        rootCause: 'A while loop without an increment, a recursive function lacking a proper base case, or an O(N^2) / O(2^N) loop with large inputs.',
        fixSteps: [
          'Check your loop conditions (while or for) to ensure loop variables strictly progress toward the termination condition.',
          'Verify that recursive calls have a valid base case before making the next call.',
          'Consider using a hash map or two-pointer approach to optimize time complexity to O(N).',
        ],
        suggestedHint: problemHints?.[0],
      };
    }

    // 3. Syntax / Definition / Indentation error
    if (
      error &&
      (error.toLowerCase().includes('syntax') ||
        error.toLowerCase().includes('indentation') ||
        error.toLowerCase().includes('is not defined') ||
        error.toLowerCase().includes('compileerror'))
    ) {
      return {
        errorType: 'Syntax Error',
        summary: 'Code failed to parse or compile.',
        rootCause: error,
        fixSteps: [
          language === 'python'
            ? 'Check indentation levels: ensure every block after a colon (`:`) is indented with 4 spaces.'
            : 'Check matching brackets, missing semicolons, or unclosed string quotes.',
          `Verify that the function name is spelled exactly as \`${functionName}\`.`,
          'Ensure all variables used are properly declared before accessing them.',
        ],
        suggestedHint: problemHints?.[0],
      };
    }

    // 4. Runtime errors (TypeError, NameError, IndexError, etc.)
    if (
      error &&
      (error.toLowerCase().includes('error') ||
        error.toLowerCase().includes('traceback') ||
        error.toLowerCase().includes('exception') ||
        actualOutput === 'RuntimeError')
    ) {
      return {
        errorType: 'Runtime Error',
        summary: 'Code crashed during execution on a test case.',
        rootCause: error || 'An unhandled exception was thrown during execution.',
        fixSteps: [
          'Check array boundary accesses (e.g. index out of range when `i >= len(nums)`).',
          'Guard against accessing properties or keys on `None` or `undefined` objects.',
          'Verify variable types: make sure you are not adding a string to an integer or calling length on a number.',
        ],
        suggestedHint: problemHints?.[0],
      };
    }

    // 5. Wrong Answer (Logic issue)
    return {
      errorType: 'Wrong Answer',
      summary: `Output mismatch: Expected ${expectedOutput || 'correct value'}, but your code returned ${actualOutput || 'wrong value'}.`,
      rootCause:
        actualOutput === 'None' || actualOutput === 'undefined'
          ? `Your function returned ${actualOutput}. Did you forget a \`return\` statement?`
          : `The algorithm produced a different result for this input. Possible off-by-one error or unhandled edge case.`,
      fixSteps: [
        'Trace your code with the sample input step-by-step on paper or in a dry run.',
        'Check edge cases: empty input, single element, negative numbers, or duplicates.',
        actualOutput === 'None' || actualOutput === 'undefined'
          ? 'Make sure every execution path terminates with an explicit `return` statement.'
          : 'Compare intermediate values before returning to see where your logic diverges from the expected result.',
      ],
      suggestedHint: problemHints?.[1] || problemHints?.[0],
    };
  },

  /**
   * Deep AI-Powered Error Diagnosis using Google Gemini API
   */
  async analyzeWithAI(params: {
    problemTitle: string;
    problemDescription: string;
    code: string;
    language: string;
    error?: string | null;
    failedCase?: {
      input: string;
      expected: string;
      actual: string;
      error?: string | null;
    };
  }): Promise<{ summary: string; rootCause: string; fixSteps: string[] }> {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey || apiKey.trim().length < 10 || apiKey.includes('your_gemini_api_key')) {
      throw new Error('Please configure VITE_GEMINI_API_KEY in your .env file to enable AI error analysis.');
    }

    const prompt = `You are PlacePilot AI, an elite university coding mentor.
A student is attempting the coding problem "${params.problemTitle}" in ${params.language}.
Their code produced an error or failed a test case.

Problem:
${params.problemDescription.slice(0, 300)}...

Student's Current Code:
\`\`\`${params.language}
${params.code}
\`\`\`

Test Case Failure / Error Info:
${params.failedCase ? `Input: ${params.failedCase.input}\nExpected: ${params.failedCase.expected}\nActual: ${params.failedCase.actual}` : ''}
${params.error ? `Error: ${params.error}` : ''}

Analyze the mistake concisely. DO NOT just rewrite the entire full solution code. Guide the student to learn and fix it themselves!
Return ONLY a valid JSON object matching this schema:
{
  "summary": "Short 1-sentence summary of the mistake",
  "rootCause": "Clear 2-sentence explanation of why their code failed or crashed",
  "fixSteps": [
    "Step 1: Specific line or variable to examine",
    "Step 2: Correct logic or data structure operation to use",
    "Step 3: Edge case or return value consideration"
  ]
}

DO NOT output any markdown backticks or explanation. Return raw JSON only.`;

    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 1024,
        },
      }),
    });

    if (!res.ok) {
      throw new Error(`Gemini API error: HTTP ${res.status}`);
    }

    const json = await res.json();
    const rawText = json?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawText) throw new Error('No response from Gemini API.');

    const cleaned = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleaned);
  },
};
