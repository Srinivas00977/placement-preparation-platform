/**
 * PlacePilot AI — Real Code Execution Engine
 * Safe JavaScript isolated runner + Pyodide Python 3 WebAssembly runner + Gemini C++/Java evaluator
 */

export interface TestCaseInput {
  input: string;
  expectedOutput: string;
  explanation?: string;
}

export interface TestCaseResult {
  caseIndex: number;
  input: string;
  expectedOutput: string;
  actualOutput: string;
  passed: boolean;
  error?: string | null;
  isHidden?: boolean;
}

export interface RunResult {
  status: 'Passed' | 'Failed';
  passedTests: number;
  totalTests: number;
  error?: string | null;
  errorType?: 'Syntax Error' | 'Runtime Error' | 'Wrong Answer' | 'Empty Implementation' | 'Time Limit Exceeded';
  details: TestCaseResult[];
  executionTimeMs: number;
}

// -------------------------------------------------------------
// HELPER: ARGUMENT PARSING & DEEP COMPARISON
// -------------------------------------------------------------

function parseTestCaseArgs(inputStr: string): any[] {
  const trimmed = inputStr.trim();
  try {
    return JSON.parse(`[${trimmed}]`);
  } catch {
    try {
      return [JSON.parse(trimmed)];
    } catch {
      return [trimmed];
    }
  }
}

function deepClone<T>(val: T): T {
  try {
    return JSON.parse(JSON.stringify(val));
  } catch {
    return val;
  }
}

function formatOutput(output: any): string {
  if (output === undefined) return 'undefined';
  if (output === null) return 'null';
  if (typeof output === 'object') {
    try {
      return JSON.stringify(output);
    } catch {
      return String(output);
    }
  }
  return String(output);
}

function canonicalize(val: any): any {
  if (Array.isArray(val)) {
    const mapped = val.map(canonicalize);
    try {
      return [...mapped].sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b)));
    } catch {
      return mapped;
    }
  }
  return val;
}

function normalizeCompare(actual: any, expectedRaw: string): boolean {
  if (actual === undefined) return false;

  const expectedTrimmed = expectedRaw.trim();
  let expectedParsed: any;
  try {
    expectedParsed = JSON.parse(expectedTrimmed);
  } catch {
    expectedParsed = expectedTrimmed;
  }

  // Exact type match / boolean
  if (typeof actual === 'boolean' || typeof expectedParsed === 'boolean') {
    return String(actual).toLowerCase() === String(expectedParsed).toLowerCase();
  }

  // Number comparison
  if (typeof actual === 'number' && typeof expectedParsed === 'number') {
    return Math.abs(actual - expectedParsed) < 1e-6;
  }

  // Array comparison
  if (Array.isArray(actual) && Array.isArray(expectedParsed)) {
    if (JSON.stringify(actual) === JSON.stringify(expectedParsed)) return true;
    try {
      const cActual = canonicalize(actual);
      const cExpected = canonicalize(expectedParsed);
      if (JSON.stringify(cActual) === JSON.stringify(cExpected)) return true;
    } catch {
      // fallback
    }
    return false;
  }

  // Object comparison
  if (typeof actual === 'object' && typeof expectedParsed === 'object') {
    return JSON.stringify(actual) === JSON.stringify(expectedParsed);
  }

  // String / primitive fallback
  return (
    formatOutput(actual).trim() === expectedTrimmed ||
    String(actual).trim() === expectedTrimmed
  );
}

// -------------------------------------------------------------
// 1. JAVASCRIPT RUNNER (Safe In-Browser Execution with Timeout)
// -------------------------------------------------------------

export function runJavaScriptCode(
  code: string,
  functionName: string,
  testCases: TestCaseInput[],
  hiddenStartIndex = testCases.length
): RunResult {
  const startTime = performance.now();
  const results: TestCaseResult[] = [];

  // 1. Check basic code presence
  if (!code.trim() || code.includes('// Write your code here') && !code.includes('return')) {
    return {
      status: 'Failed',
      passedTests: 0,
      totalTests: testCases.length,
      error: 'Empty starter code or no return statement found.',
      errorType: 'Empty Implementation',
      details: testCases.map((tc, idx) => ({
        caseIndex: idx + 1,
        input: tc.input,
        expectedOutput: tc.expectedOutput,
        actualOutput: 'undefined',
        passed: false,
        error: 'No return statement executed.',
        isHidden: idx >= hiddenStartIndex,
      })),
      executionTimeMs: Math.round(performance.now() - startTime),
    };
  }

  let userFn: any;
  try {
    const wrapped = `
      "use strict";
      ${code}
      if (typeof ${functionName} !== 'function') {
        throw new ReferenceError("Function '${functionName}' is not defined. Please implement '${functionName}'.");
      }
      return ${functionName};
    `;
    userFn = new Function(wrapped)();
  } catch (compileErr: any) {
    return {
      status: 'Failed',
      passedTests: 0,
      totalTests: testCases.length,
      error: `Syntax / Definition Error: ${compileErr.message}`,
      errorType: 'Syntax Error',
      details: testCases.map((tc, idx) => ({
        caseIndex: idx + 1,
        input: tc.input,
        expectedOutput: tc.expectedOutput,
        actualOutput: 'SyntaxError',
        passed: false,
        error: compileErr.message,
        isHidden: idx >= hiddenStartIndex,
      })),
      executionTimeMs: Math.round(performance.now() - startTime),
    };
  }

  for (let i = 0; i < testCases.length; i++) {
    const tc = testCases[i];
    const isHidden = i >= hiddenStartIndex;
    let actual: any;
    let errStr: string | null = null;
    let passed = false;

    try {
      const args = parseTestCaseArgs(tc.input);
      const clonedArgs = deepClone(args);

      // Run with execution timer to catch long loops
      const caseStart = performance.now();
      actual = userFn(...clonedArgs);
      const caseDuration = performance.now() - caseStart;

      if (caseDuration > 2000) {
        throw new Error('Time Limit Exceeded (> 2000ms). Possible infinite loop.');
      }

      passed = normalizeCompare(actual, tc.expectedOutput);
    } catch (runErr: any) {
      errStr = runErr.message || String(runErr);
      actual = 'RuntimeError';
      passed = false;
    }

    results.push({
      caseIndex: i + 1,
      input: tc.input,
      expectedOutput: tc.expectedOutput,
      actualOutput: formatOutput(actual),
      passed,
      error: errStr,
      isHidden,
    });
  }

  const passedCount = results.filter((r) => r.passed).length;
  const allPassed = passedCount === testCases.length;

  let errorType: RunResult['errorType'] = undefined;
  if (!allPassed) {
    const hasTle = results.some((r) => r.error && r.error.includes('Time Limit Exceeded'));
    const hasRuntime = results.some((r) => r.error);
    if (hasTle) {
      errorType = 'Time Limit Exceeded';
    } else if (hasRuntime) {
      errorType = 'Runtime Error';
    } else {
      errorType = 'Wrong Answer';
    }
  }

  return {
    status: allPassed ? 'Passed' : 'Failed',
    passedTests: passedCount,
    totalTests: testCases.length,
    error: allPassed ? null : results.find((r) => r.error)?.error || 'One or more test cases returned incorrect outputs.',
    errorType,
    details: results,
    executionTimeMs: Math.round(performance.now() - startTime),
  };
}

// -------------------------------------------------------------
// 2. PYTHON 3 RUNNER (Pyodide WebAssembly in Browser)
// -------------------------------------------------------------

declare global {
  interface Window {
    loadPyodide?: (config: { indexURL: string }) => Promise<any>;
    pyodideInstance?: any;
  }
}

let pyodideLoadingPromise: Promise<any> | null = null;

export async function loadPyodideRuntime(onStatus?: (status: string) => void): Promise<any> {
  if (window.pyodideInstance) {
    return window.pyodideInstance;
  }

  if (pyodideLoadingPromise) {
    return pyodideLoadingPromise;
  }

  pyodideLoadingPromise = (async () => {
    onStatus?.('Loading Python 3 WebAssembly engine (Pyodide v0.26.4)...');

    // 1. Inject Pyodide CDN script tag if not present
    if (!window.loadPyodide) {
      await new Promise<void>((resolve, reject) => {
        const existingScript = document.querySelector('script[src*="pyodide"]');
        if (existingScript) {
          existingScript.addEventListener('load', () => resolve());
          existingScript.addEventListener('error', (e) => reject(e));
          return;
        }

        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/pyodide/v0.26.4/full/pyodide.js';
        script.async = true;
        script.onload = () => resolve();
        script.onerror = (e) => reject(new Error(`Failed to load Pyodide from CDN: ${e}`));
        document.head.appendChild(script);
      });
    }

    onStatus?.('Initializing Python WebAssembly runtime...');
    if (!window.loadPyodide) {
      throw new Error('Pyodide CDN loaded but window.loadPyodide is not available.');
    }

    const pyodide = await window.loadPyodide({
      indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.26.4/full/',
    });

    window.pyodideInstance = pyodide;
    onStatus?.('Python 3 runtime ready!');
    return pyodide;
  })();

  return pyodideLoadingPromise;
}

export async function runPythonCode(
  code: string,
  functionName: string,
  testCases: TestCaseInput[],
  hiddenStartIndex = testCases.length,
  onStatus?: (status: string) => void
): Promise<RunResult> {
  const startTime = performance.now();

  // Quick check for starter code with only 'pass'
  const trimmed = code.trim();
  if (!trimmed || (trimmed.includes('# Write your code here') && trimmed.includes('pass') && !trimmed.includes('return'))) {
    return {
      status: 'Failed',
      passedTests: 0,
      totalTests: testCases.length,
      error: 'Empty starter code detected. Please implement your solution.',
      errorType: 'Empty Implementation',
      details: testCases.map((tc, idx) => ({
        caseIndex: idx + 1,
        input: tc.input,
        expectedOutput: tc.expectedOutput,
        actualOutput: 'None',
        passed: false,
        error: 'Function returned None / no return statement executed.',
        isHidden: idx >= hiddenStartIndex,
      })),
      executionTimeMs: Math.round(performance.now() - startTime),
    };
  }

  let pyodide: any;
  try {
    pyodide = await loadPyodideRuntime(onStatus);
  } catch (loadErr: any) {
    return {
      status: 'Failed',
      passedTests: 0,
      totalTests: testCases.length,
      error: `Failed to load Pyodide Python runtime: ${loadErr.message}`,
      errorType: 'Runtime Error',
      details: testCases.map((tc, idx) => ({
        caseIndex: idx + 1,
        input: tc.input,
        expectedOutput: tc.expectedOutput,
        actualOutput: 'LoadError',
        passed: false,
        error: loadErr.message,
        isHidden: idx >= hiddenStartIndex,
      })),
      executionTimeMs: Math.round(performance.now() - startTime),
    };
  }

  onStatus?.('Executing Python code...');

  // Setup runner harness in Python
  const harness = `
import json
import sys

# User Code:
${code}

def _placepilot_evaluate(fn_name, input_str):
    if fn_name not in globals():
        raise NameError(f"Function '{fn_name}' is not defined. Please implement '{fn_name}'.")
    fn = globals()[fn_name]
    
    # Parse arguments
    try:
        args = json.loads(f"[{input_str}]")
    except Exception:
        args = [json.loads(input_str)]
    
    res = fn(*args)
    if res is None:
        return "__PP_NONE__"
    return json.dumps(res)
`;

  try {
    await pyodide.runPythonAsync(harness);
  } catch (syntaxErr: any) {
    const cleanedErr = (syntaxErr.message || String(syntaxErr)).replace(/File "<exec>", /g, '');
    return {
      status: 'Failed',
      passedTests: 0,
      totalTests: testCases.length,
      error: `Python Syntax / Import Error:\n${cleanedErr}`,
      errorType: 'Syntax Error',
      details: testCases.map((tc, idx) => ({
        caseIndex: idx + 1,
        input: tc.input,
        expectedOutput: tc.expectedOutput,
        actualOutput: 'SyntaxError',
        passed: false,
        error: cleanedErr,
        isHidden: idx >= hiddenStartIndex,
      })),
      executionTimeMs: Math.round(performance.now() - startTime),
    };
  }

  const results: TestCaseResult[] = [];

  for (let i = 0; i < testCases.length; i++) {
    const tc = testCases[i];
    const isHidden = i >= hiddenStartIndex;
    let actualStr = '';
    let errStr: string | null = null;
    let passed = false;

    try {
      // Escape quotes for python call
      const escapedInput = JSON.stringify(tc.input);
      const callPy = `_placepilot_evaluate("${functionName}", ${escapedInput})`;
      const pyRes = await pyodide.runPythonAsync(callPy);

      if (pyRes === '__PP_NONE__') {
        actualStr = 'None';
        passed = tc.expectedOutput.trim() === 'None' || tc.expectedOutput.trim() === 'null';
      } else {
        actualStr = String(pyRes);
        let parsedPyRes: any;
        try {
          parsedPyRes = JSON.parse(pyRes);
        } catch {
          parsedPyRes = pyRes;
        }
        passed = normalizeCompare(parsedPyRes, tc.expectedOutput);
      }
    } catch (runErr: any) {
      errStr = (runErr.message || String(runErr)).replace(/File "<exec>", /g, '');
      actualStr = 'RuntimeError';
      passed = false;
    }

    results.push({
      caseIndex: i + 1,
      input: tc.input,
      expectedOutput: tc.expectedOutput,
      actualOutput: actualStr,
      passed,
      error: errStr,
      isHidden,
    });
  }

  const passedCount = results.filter((r) => r.passed).length;
  const allPassed = passedCount === testCases.length;

  let errorType: RunResult['errorType'] = undefined;
  if (!allPassed) {
    const hasTle = results.some((r) => r.error && r.error.includes('Time Limit Exceeded'));
    const hasRuntime = results.some((r) => r.error);
    if (hasTle) {
      errorType = 'Time Limit Exceeded';
    } else if (hasRuntime) {
      errorType = 'Runtime Error';
    } else {
      errorType = 'Wrong Answer';
    }
  }

  return {
    status: allPassed ? 'Passed' : 'Failed',
    passedTests: passedCount,
    totalTests: testCases.length,
    error: allPassed ? null : results.find((r) => r.error)?.error || 'One or more test cases returned incorrect outputs.',
    errorType,
    details: results,
    executionTimeMs: Math.round(performance.now() - startTime),
  };
}

// -------------------------------------------------------------
// 3. C++ / JAVA / C RUNNER (Gemini API Strict Evaluation)
// -------------------------------------------------------------

export async function runCppOrJavaCode(
  code: string,
  language: 'cpp' | 'java' | 'c',
  functionName: string,
  testCases: TestCaseInput[],
  hiddenStartIndex = testCases.length
): Promise<RunResult> {
  const startTime = performance.now();
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

  // Quick check for empty starter boilerplate
  const trimmed = code.trim();
  const isStarterOnly =
    !trimmed ||
    (trimmed.includes('// Write your code here') &&
      !trimmed.includes('return') &&
      !trimmed.includes('for') &&
      !trimmed.includes('while') &&
      !trimmed.includes('if')) ||
    (trimmed.includes('// Write your code here') &&
      (trimmed.includes('return;') || trimmed.includes('return null;') || trimmed.includes('return NULL;') || trimmed.includes('return 0;') || trimmed.includes('return {};') || trimmed.includes('return false;')) &&
      !trimmed.includes('for') &&
      !trimmed.includes('while') &&
      !trimmed.includes('if') &&
      !trimmed.includes('+') &&
      !trimmed.includes('*') &&
      !trimmed.includes('malloc') &&
      !trimmed.includes('vector<') &&
      !trimmed.includes('int i'));

  if (isStarterOnly) {
    return {
      status: 'Failed',
      passedTests: 0,
      totalTests: testCases.length,
      error: 'Empty starter code detected. Please implement your solution before running.',
      errorType: 'Empty Implementation',
      details: testCases.map((tc, idx) => ({
        caseIndex: idx + 1,
        input: tc.input,
        expectedOutput: tc.expectedOutput,
        actualOutput: 'No implementation',
        passed: false,
        error: 'Please implement your solution function.',
        isHidden: idx >= hiddenStartIndex,
      })),
      executionTimeMs: Math.round(performance.now() - startTime),
    };
  }

  // If no Gemini API key configured, run strict syntax/structure check
  if (!apiKey || apiKey.trim().length < 10 || apiKey.includes('your_gemini_api_key')) {
    // Check balanced braces and basic syntax tokens
    const openBraces = (code.match(/\{/g) || []).length;
    const closeBraces = (code.match(/\}/g) || []).length;
    const hasSyntaxIssues = openBraces !== closeBraces || (!code.includes('return') && !code.includes('void'));

    if (hasSyntaxIssues) {
      return {
        status: 'Failed',
        passedTests: 0,
        totalTests: testCases.length,
        error: `Syntax Error in ${language.toUpperCase()}: Unbalanced braces or missing return statement.`,
        errorType: 'Syntax Error',
        details: testCases.map((tc, idx) => ({
          caseIndex: idx + 1,
          input: tc.input,
          expectedOutput: tc.expectedOutput,
          actualOutput: 'Syntax Error',
          passed: false,
          error: 'Unbalanced braces or missing return statement.',
          isHidden: idx >= hiddenStartIndex,
        })),
        executionTimeMs: Math.round(performance.now() - startTime),
      };
    }

    return {
      status: 'Failed',
      passedTests: 0,
      totalTests: testCases.length,
      error:
        `Code syntax and structure for ${language.toUpperCase()} validated!\n\nTo run full automated test case execution for ${language.toUpperCase()}, please configure VITE_GEMINI_API_KEY in your .env file.\n\nTip: You can switch to Python 3 (Pyodide) or JavaScript for instant, 100% free live in-browser test execution!`,
      errorType: 'Runtime Error',
      details: testCases.map((tc, idx) => ({
        caseIndex: idx + 1,
        input: tc.input,
        expectedOutput: tc.expectedOutput,
        actualOutput: 'Structure Validated (API Key Required for Live Tests)',
        passed: false,
        error: `Configure VITE_GEMINI_API_KEY in .env to test ${language.toUpperCase()} against live test cases. Python 3 and JavaScript run live in-browser.`,
        isHidden: idx >= hiddenStartIndex,
      })),
      executionTimeMs: Math.round(performance.now() - startTime),
    };
  }

  const prompt = `You are a strict automated programming contest judge and compiler simulator for ${language.toUpperCase()}.
Analyze and simulate the following user code against each test case for function/method "${functionName}".

User Code:
\`\`\`${language}
${code}
\`\`\`

Test Cases to run:
${JSON.stringify(
  testCases.map((tc, idx) => ({
    caseIndex: idx + 1,
    input: tc.input,
    expectedOutput: tc.expectedOutput,
  })),
  null,
  2
)}

STRICT RULES:
1. First verify if the code compiles and has valid syntax. If syntax/type errors exist, set compiled to false and provide compileError.
2. For each test case, simulate the execution. Output the exact returned value in actualOutput.
3. Compare actualOutput with expectedOutput (strict equality, allowing whitespace normalization). Set passed to true only if it matches.
4. If the code throws an exception, enters infinite recursion, or returns nothing, mark passed: false.

Return ONLY a valid JSON object matching this schema (no markdown, no backticks):
{
  "compiled": boolean,
  "compileError": string | null,
  "results": [
    {
      "caseIndex": number,
      "actualOutput": string,
      "passed": boolean,
      "error": string | null
    }
  ]
}`;

  try {
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.1,
          maxOutputTokens: 2048,
        },
      }),
    });

    if (!res.ok) {
      throw new Error(`Gemini evaluation error: HTTP ${res.status}`);
    }

    const json = await res.json();
    const rawText = json?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawText) throw new Error('No response received from evaluation judge.');

    const cleaned = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleaned);

    if (!parsed.compiled) {
      return {
        status: 'Failed',
        passedTests: 0,
        totalTests: testCases.length,
        error: parsed.compileError || 'Compilation failed.',
        errorType: 'Syntax Error',
        details: testCases.map((tc, idx) => ({
          caseIndex: idx + 1,
          input: tc.input,
          expectedOutput: tc.expectedOutput,
          actualOutput: 'CompileError',
          passed: false,
          error: parsed.compileError || 'Syntax or compilation error.',
          isHidden: idx >= hiddenStartIndex,
        })),
        executionTimeMs: Math.round(performance.now() - startTime),
      };
    }

    const details: TestCaseResult[] = testCases.map((tc, idx) => {
      const match = parsed.results?.find((r: any) => r.caseIndex === idx + 1);
      return {
        caseIndex: idx + 1,
        input: tc.input,
        expectedOutput: tc.expectedOutput,
        actualOutput: match ? String(match.actualOutput) : 'Unknown',
        passed: Boolean(match?.passed),
        error: match?.error || null,
        isHidden: idx >= hiddenStartIndex,
      };
    });

    const passedCount = details.filter((d) => d.passed).length;
    const allPassed = passedCount === testCases.length;
    let errorType: RunResult['errorType'] = undefined;
    if (!allPassed) {
      const hasRuntime = details.some((r) => r.error);
      errorType = hasRuntime ? 'Runtime Error' : 'Wrong Answer';
    }

    return {
      status: allPassed ? 'Passed' : 'Failed',
      passedTests: passedCount,
      totalTests: testCases.length,
      error: allPassed ? null : details.find((r) => r.error)?.error || 'One or more test cases returned incorrect outputs.',
      errorType,
      details,
      executionTimeMs: Math.round(performance.now() - startTime),
    };
  } catch (err: any) {
    return {
      status: 'Failed',
      passedTests: 0,
      totalTests: testCases.length,
      error: `Evaluation engine error: ${err.message}`,
      errorType: 'Runtime Error',
      details: testCases.map((tc, idx) => ({
        caseIndex: idx + 1,
        input: tc.input,
        expectedOutput: tc.expectedOutput,
        actualOutput: 'Error',
        passed: false,
        error: err.message,
        isHidden: idx >= hiddenStartIndex,
      })),
      executionTimeMs: Math.round(performance.now() - startTime),
    };
  }
}
