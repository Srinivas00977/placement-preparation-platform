import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Code2,
  CheckCircle2,
  XCircle,
  Play,
  Check,
  RotateCcw,
  Search,
  ArrowLeft,
  ChevronRight,
  Terminal,
  Building2,
  Target,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Send,
  Loader2,
  X,
  Lock,
  Unlock,
  AlertTriangle,
  Cpu,
  FileCode2,
  Copy,
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { type CodingProblem } from '@/data/codingProblems';
import { codingProblemService } from '@/services/codingProblemService';
import {
  runJavaScriptCode,
  runPythonCode,
  runCppOrJavaCode,
  type RunResult,
  type TestCaseInput,
} from '@/services/codeRunnerService';
import { errorDiagnosisService, type ErrorDiagnosisResult } from '@/services/errorDiagnosisService';
import { progressService, type CodingSubmission } from '@/services/progressService';
import { Button } from '@/components/ui/button';

const COMPANY_LIST = [
  'All Companies',
  'My Target Companies',
  'TCS',
  'Amazon',
  'Google',
  'Microsoft',
  'Infosys',
  'Wipro',
  'Zoho',
  'Cognizant',
  'Accenture',
  'Flipkart',
  'Deloitte',
  'Oracle',
];

const CATEGORY_LIST = [
  'All',
  'Arrays & Hashing',
  'Strings',
  'Two Pointers',
  'Sliding Window',
  'Stack & Queue',
  'Binary Search',
  'Linked Lists',
  'Trees & BST',
  'Graphs',
  'Dynamic Programming',
  'Greedy & Math',
  'Bit Manipulation',
];

const AI_TOPIC_PRESETS = [
  'Arrays & Hashing',
  'Strings',
  'Two Pointers',
  'Sliding Window',
  'Stack & Queue',
  'Binary Search',
  'Linked Lists',
  'Trees & BST',
  'Graphs',
  'Dynamic Programming',
  'Greedy & Math',
  'Bit Manipulation',
];

const AI_COMPANY_PRESETS = [
  'Any Company',
  'TCS',
  'Amazon',
  'Google',
  'Microsoft',
  'Zoho',
  'Infosys',
  'Wipro',
  'Accenture',
  'Cognizant',
  'Flipkart',
];

type ConsoleTab = 'testcases' | 'error_guide' | 'optimal_solution';

export const CodingPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [problems, setProblems] = useState<CodingProblem[]>(() => codingProblemService.getAllProblems());
  const [selectedCompany, setSelectedCompany] = useState<string>('All Companies');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeProblem, setActiveProblem] = useState<CodingProblem | null>(null);

  // Editor states
  const [selectedLanguage, setSelectedLanguage] = useState<'javascript' | 'python' | 'cpp' | 'java'>('python');
  const [code, setCode] = useState('');
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluationType, setEvaluationType] = useState<'run' | 'submit'>('run');
  const [pythonStatus, setPythonStatus] = useState<string | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [revealedHintIndex, setRevealedHintIndex] = useState(0);

  // Results panel state
  const [consoleTab, setConsoleTab] = useState<ConsoleTab>('testcases');
  const [runResult, setRunResult] = useState<RunResult | null>(null);
  const [activeCaseTab, setActiveCaseTab] = useState<number>(0);

  // Optimal Solution tab state
  const [isSolutionRevealed, setIsSolutionRevealed] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  // AI Error Diagnosis state
  const [isAiDiagnosing, setIsAiDiagnosing] = useState(false);
  const [aiDiagnosis, setAiDiagnosis] = useState<{ summary: string; rootCause: string; fixSteps: string[] } | null>(null);
  const [aiDiagError, setAiDiagError] = useState<string | null>(null);

  // AI Question Generation Modal
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const [genCompany, setGenCompany] = useState('Any Company');
  const [selectedTopicPreset, setSelectedTopicPreset] = useState<string>('Arrays & Hashing');
  const [customTopicInput, setCustomTopicInput] = useState<string>('');
  const [genDifficulty, setGenDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>('Medium');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generateError, setGenerateError] = useState<string | null>(null);

  const [userProfile, setUserProfile] = useState(() => progressService.getUserProgress().profile);
  const [solvedIds, setSolvedIds] = useState<string[]>(
    () => progressService.getUserProgress().solvedCodingProblemIds
  );

  useEffect(() => {
    const unsubProgress = progressService.subscribe(() => {
      const data = progressService.getUserProgress();
      setSolvedIds(data.solvedCodingProblemIds);
      setUserProfile(data.profile);
    });

    const unsubProblems = codingProblemService.subscribe(() => {
      setProblems(codingProblemService.getAllProblems());
    });

    return () => {
      unsubProgress();
      unsubProblems();
    };
  }, []);

  const handleSelectProblem = (problem: CodingProblem) => {
    setActiveProblem(problem);
    setSelectedLanguage('python');
    setCode(problem.starterCode.python);
    setRunResult(null);
    setShowHint(false);
    setRevealedHintIndex(0);
    setConsoleTab('testcases');
    setActiveCaseTab(0);
    setIsSolutionRevealed(false);
    setAiDiagnosis(null);
    setAiDiagError(null);
  };

  useEffect(() => {
    const problemIdParam = searchParams.get('problem');
    if (problemIdParam) {
      const target = problems.find((p) => p.id === problemIdParam);
      if (target) {
        handleSelectProblem(target);
      }
    }
  }, [searchParams, problems]);

  const handleLanguageChange = (lang: 'javascript' | 'python' | 'cpp' | 'java') => {
    setSelectedLanguage(lang);
    if (activeProblem) {
      setCode(activeProblem.starterCode[lang]);
    }
    setRunResult(null);
    setAiDiagnosis(null);
    setAiDiagError(null);
  };

  const handleResetCode = () => {
    if (activeProblem) {
      setCode(activeProblem.starterCode[selectedLanguage]);
      setRunResult(null);
      setAiDiagnosis(null);
      setAiDiagError(null);
    }
  };

  // 1. RUN CODE (Sample test cases only, does NOT mark as Solved)
  const handleRunCode = async () => {
    if (!activeProblem) return;
    setIsEvaluating(true);
    setEvaluationType('run');
    setRunResult(null);
    setPythonStatus(null);
    setAiDiagnosis(null);
    setAiDiagError(null);

    const sampleCases: TestCaseInput[] = activeProblem.testCases;

    try {
      let result: RunResult;
      if (selectedLanguage === 'javascript') {
        result = runJavaScriptCode(code, activeProblem.functionName, sampleCases);
      } else if (selectedLanguage === 'python') {
        result = await runPythonCode(
          code,
          activeProblem.functionName,
          sampleCases,
          sampleCases.length,
          (status) => setPythonStatus(status)
        );
      } else {
        result = await runCppOrJavaCode(
          code,
          selectedLanguage,
          activeProblem.functionName,
          sampleCases
        );
      }

      setRunResult(result);
      setActiveCaseTab(0);

      // Auto-navigate to Error Guide on failure, else stay on Test Cases
      if (result.status === 'Failed') {
        setConsoleTab('error_guide');
      } else {
        setConsoleTab('testcases');
      }
    } catch (err: any) {
      setRunResult({
        status: 'Failed',
        passedTests: 0,
        totalTests: sampleCases.length,
        error: err.message || 'Execution error occurred.',
        errorType: 'Runtime Error',
        details: sampleCases.map((tc, idx) => ({
          caseIndex: idx + 1,
          input: tc.input,
          expectedOutput: tc.expectedOutput,
          actualOutput: 'Error',
          passed: false,
          error: err.message,
        })),
        executionTimeMs: 0,
      });
      setConsoleTab('error_guide');
    } finally {
      setIsEvaluating(false);
      setPythonStatus(null);
    }
  };

  // 2. SUBMIT SOLUTION (Runs against Sample + Hidden test cases; marks Solved ONLY if 100% pass)
  const handleSubmitSolution = async () => {
    if (!activeProblem) return;
    setIsEvaluating(true);
    setEvaluationType('submit');
    setRunResult(null);
    setPythonStatus(null);
    setAiDiagnosis(null);
    setAiDiagError(null);

    const allCases: TestCaseInput[] = [
      ...activeProblem.testCases,
      ...(activeProblem.hiddenTestCases || []),
    ];
    const hiddenStartIndex = activeProblem.testCases.length;

    try {
      let result: RunResult;
      if (selectedLanguage === 'javascript') {
        result = runJavaScriptCode(
          code,
          activeProblem.functionName,
          allCases,
          hiddenStartIndex
        );
      } else if (selectedLanguage === 'python') {
        result = await runPythonCode(
          code,
          activeProblem.functionName,
          allCases,
          hiddenStartIndex,
          (status) => setPythonStatus(status)
        );
      } else {
        result = await runCppOrJavaCode(
          code,
          selectedLanguage,
          activeProblem.functionName,
          allCases,
          hiddenStartIndex
        );
      }

      setRunResult(result);
      setActiveCaseTab(0);

      const isSuccess = result.status === 'Passed' && result.passedTests === allCases.length;

      const submission: CodingSubmission = {
        problemId: activeProblem.id,
        problemTitle: activeProblem.title,
        language: selectedLanguage,
        code,
        status: isSuccess ? 'Passed' : 'Failed',
        passedTests: result.passedTests,
        totalTests: allCases.length,
        date: new Date().toISOString(),
      };

      progressService.recordCodingSubmission(submission);

      if (result.status === 'Failed') {
        setConsoleTab('error_guide');
      } else {
        setConsoleTab('testcases');
      }
    } catch (err: any) {
      setRunResult({
        status: 'Failed',
        passedTests: 0,
        totalTests: allCases.length,
        error: err.message || 'Execution crashed during submission.',
        errorType: 'Runtime Error',
        details: allCases.map((tc, idx) => ({
          caseIndex: idx + 1,
          input: tc.input,
          expectedOutput: tc.expectedOutput,
          actualOutput: 'Crash',
          passed: false,
          error: err.message,
          isHidden: idx >= hiddenStartIndex,
        })),
        executionTimeMs: 0,
      });
      setConsoleTab('error_guide');
    } finally {
      setIsEvaluating(false);
      setPythonStatus(null);
    }
  };

  // 3. AI ERROR DIAGNOSIS HANDLER
  const handleAnalyzeErrorWithAI = async () => {
    if (!activeProblem || !runResult) return;
    setIsAiDiagnosing(true);
    setAiDiagError(null);

    const failedCase = runResult.details.find((d) => !d.passed);

    try {
      const diag = await errorDiagnosisService.analyzeWithAI({
        problemTitle: activeProblem.title,
        problemDescription: activeProblem.description,
        code,
        language: selectedLanguage,
        error: failedCase?.error || runResult.error,
        failedCase: failedCase
          ? {
              input: failedCase.input,
              expected: failedCase.expectedOutput,
              actual: failedCase.actualOutput,
              error: failedCase.error,
            }
          : undefined,
      });
      setAiDiagnosis(diag);
    } catch (err: any) {
      setAiDiagError(
        err.message ||
          'Failed to connect to Gemini AI. Ensure VITE_GEMINI_API_KEY is configured in your .env file.'
      );
    } finally {
      setIsAiDiagnosing(false);
    }
  };

  // Local Rule-Based Diagnostic computation
  const localDiagnosis: ErrorDiagnosisResult | null = useMemo(() => {
    if (!activeProblem || !runResult || runResult.status === 'Passed') return null;
    const failedCase = runResult.details.find((d) => !d.passed);
    return errorDiagnosisService.diagnoseLocally({
      code,
      language: selectedLanguage,
      functionName: activeProblem.functionName,
      error: failedCase?.error || runResult.error,
      actualOutput: failedCase?.actualOutput,
      expectedOutput: failedCase?.expectedOutput,
      problemHints: activeProblem.hints,
    });
  }, [activeProblem, runResult, code, selectedLanguage]);

  // 4. LOAD OPTIMAL REFERENCE SOLUTION INTO EDITOR
  const handleLoadSolutionIntoEditor = () => {
    if (!activeProblem?.referenceSolution) return;
    const refCode = activeProblem.referenceSolution.code[selectedLanguage];
    if (refCode) {
      setCode(refCode);
      setRunResult(null);
      setAiDiagnosis(null);
    }
  };

  const handleCopySolution = () => {
    if (!activeProblem?.referenceSolution) return;
    const refCode = activeProblem.referenceSolution.code[selectedLanguage];
    if (refCode) {
      navigator.clipboard.writeText(refCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  // 5. AI QUESTION GENERATOR HANDLER
  const handleGenerateAIQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    setGenerateError(null);

    const topicToUse = customTopicInput.trim() || selectedTopicPreset;

    try {
      const newProblem = await codingProblemService.generateAIQuestion({
        company: genCompany,
        topic: topicToUse,
        difficulty: genDifficulty,
      });

      setIsGenerateModalOpen(false);
      setCustomTopicInput('');
      handleSelectProblem(newProblem);
    } catch (err: any) {
      setGenerateError(err.message || 'Failed to generate question. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Filter problems based on company, category, difficulty, and search query
  const filteredProblems = useMemo(() => {
    return problems.filter((p) => {
      const matchCat =
        selectedCategory === 'All' ||
        p.category === selectedCategory ||
        p.category.toLowerCase().includes(selectedCategory.toLowerCase()) ||
        selectedCategory.toLowerCase().includes(p.category.toLowerCase());

      const matchDiff = selectedDifficulty === 'All' || p.difficulty === selectedDifficulty;
      const matchSearch =
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.companies.some((c) => c.toLowerCase().includes(searchQuery.toLowerCase()));

      let matchCompany = true;
      if (selectedCompany === 'My Target Companies') {
        const userTargets = userProfile.targetCompanies || ['TCS', 'Amazon', 'Google'];
        matchCompany = p.companies.some((c) =>
          userTargets.some((target) => c.toLowerCase().includes(target.toLowerCase()))
        );
      } else if (selectedCompany !== 'All Companies') {
        matchCompany = p.companies.some((c) =>
          c.toLowerCase().includes(selectedCompany.toLowerCase())
        );
      }

      return matchCat && matchDiff && matchSearch && matchCompany;
    });
  }, [problems, selectedCategory, selectedDifficulty, searchQuery, selectedCompany, userProfile]);

  return (
    <DashboardLayout
      pageTitle="Coding Practice & DSA Problem Bank"
      pageSubtitle="Campus recruitment coding challenges with live in-browser Python 3 & JavaScript execution and strict test evaluation."
    >
      <div className="space-y-6 max-w-7xl mx-auto min-w-0">
        {/* VIEW 1: PROBLEM BROWSER & LIST */}
        {!activeProblem ? (
          <div className="space-y-6 min-w-0">
            {/* HERO OVERVIEW CARD: Dynamic Problem Count & Solved Progress */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-3xl border border-neutral-800 bg-neutral-950/70 backdrop-blur-xl shadow-lg">
              <div>
                <div className="flex items-center space-x-2.5">
                  <div className="h-9 w-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                    <Code2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                      Placement Coding Problem Set (100+)
                    </h2>
                    <p className="text-xs text-neutral-400">
                      Standard university campus drive questions with empty starter code and strict evaluation ({problems.length} total problems).
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-4 bg-neutral-900/80 border border-neutral-800 rounded-2xl px-4 py-2.5 shrink-0">
                <div className="space-y-1">
                  <div className="flex items-center justify-between space-x-4 text-xs font-mono">
                    <span className="text-neutral-400">Placement Solved:</span>
                    <span className="font-bold text-emerald-400">
                      Solved: {solvedIds.length} / 100+
                    </span>
                  </div>
                  <div className="w-40 sm:w-48 h-1.5 rounded-full bg-neutral-800 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.min(
                          100,
                          Math.round((solvedIds.length / Math.max(1, problems.length)) * 100)
                        )}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* COMPANY FILTER CHIPS BAR */}
            <div className="p-4 rounded-3xl border border-neutral-800 bg-neutral-950/70 backdrop-blur-xl shadow-lg space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-neutral-300 flex items-center space-x-1.5 font-mono">
                  <Building2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Filter by Placement Company:</span>
                </span>
                <span className="text-[11px] font-mono text-neutral-500">
                  Showing {filteredProblems.length} of {problems.length} problems
                </span>
              </div>

              <div className="flex flex-wrap gap-1.5 pt-1">
                {COMPANY_LIST.map((comp) => {
                  const isActive = selectedCompany === comp;
                  const isMyTargets = comp === 'My Target Companies';
                  return (
                    <button
                      key={comp}
                      type="button"
                      onClick={() => setSelectedCompany(comp)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all duration-200 cursor-pointer border flex items-center space-x-1.5 ${
                        isActive
                          ? isMyTargets
                            ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 shadow-sm shadow-cyan-500/20'
                            : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-sm shadow-emerald-500/10'
                          : 'bg-neutral-900/60 text-neutral-400 border-neutral-800 hover:border-neutral-700 hover:text-white'
                      }`}
                    >
                      {isMyTargets && <Target className="w-3.5 h-3.5 text-cyan-400" />}
                      <span>{comp}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* SEARCH & FILTERS BAR */}
            <div className="p-5 rounded-2xl border border-neutral-800 bg-neutral-950/80 backdrop-blur-xl flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="flex-1 max-w-md relative">
                <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search problem name, company, or concept..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-neutral-600"
                />
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {/* Category selector */}
                <div className="flex items-center space-x-1.5 text-xs text-neutral-400">
                  <span className="font-medium hidden sm:inline">Category:</span>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="bg-neutral-900 text-xs text-white border border-neutral-800 rounded-xl px-2.5 py-1.5 focus:outline-none cursor-pointer"
                  >
                    {CATEGORY_LIST.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat === 'All' ? 'All Categories' : cat}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Difficulty selector */}
                <div className="flex items-center space-x-1.5 text-xs text-neutral-400">
                  <span className="font-medium hidden sm:inline">Difficulty:</span>
                  <select
                    value={selectedDifficulty}
                    onChange={(e) => setSelectedDifficulty(e.target.value)}
                    className="bg-neutral-900 text-xs text-white border border-neutral-800 rounded-xl px-2.5 py-1.5 focus:outline-none cursor-pointer"
                  >
                    <option value="All">All Levels</option>
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>

                {/* GENERATE AI QUESTION BUTTON */}
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setIsGenerateModalOpen((prev) => !prev)}
                  className="text-xs cursor-pointer bg-gradient-to-r from-emerald-400 to-teal-400 text-black font-bold hover:brightness-110 shadow-lg shadow-emerald-500/20 inline-flex items-center gap-1.5"
                >
                  <Code2 className="w-3.5 h-3.5" />
                  <span>Generate AI Question</span>
                  {isGenerateModalOpen ? (
                    <ChevronUp className="w-3.5 h-3.5" />
                  ) : (
                    <ChevronDown className="w-3.5 h-3.5" />
                  )}
                </Button>
              </div>
            </div>

            {/* TOP EXPANDABLE GLASS FORM PANEL (INLINE DRAWER) */}
            <AnimatePresence>
              {isGenerateModalOpen && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.25, ease: 'easeOut' }}
                  className="overflow-hidden"
                >
                  <div className="rounded-3xl border border-emerald-500/30 bg-neutral-950/90 p-5 sm:p-6 shadow-2xl backdrop-blur-2xl space-y-5 text-white">
                    {/* Drawer Header */}
                    <div className="flex items-center justify-between pb-3.5 border-b border-white/10">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                          <Code2 className="w-4 h-4" />
                        </div>
                        <div>
                          <h3 className="text-sm sm:text-base font-bold text-white tracking-tight">
                            Generate AI Question
                          </h3>
                          <p className="text-xs text-neutral-400">
                            Synthesizes authentic placement problems with boilerplate starter code and runnable test cases.
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsGenerateModalOpen(false)}
                        className="p-1.5 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-900 transition-colors cursor-pointer"
                        aria-label="Close generator drawer"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    <form onSubmit={handleGenerateAIQuestion} className="space-y-4 text-xs">
                      {/* Topic Selection */}
                      <div className="space-y-2">
                        <label className="text-neutral-300 font-semibold text-xs flex items-center justify-between">
                          <span>Topic / DSA Domain</span>
                          {customTopicInput.trim() && (
                            <span className="text-[11px] text-emerald-400 font-normal">Custom topic active</span>
                          )}
                        </label>
                        <div className="flex flex-wrap gap-1.5">
                          {AI_TOPIC_PRESETS.map((preset) => {
                            const isSelected = !customTopicInput.trim() && selectedTopicPreset === preset;
                            return (
                              <button
                                key={preset}
                                type="button"
                                onClick={() => {
                                  setSelectedTopicPreset(preset);
                                  setCustomTopicInput('');
                                }}
                                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer border ${
                                  isSelected
                                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 font-semibold shadow-sm shadow-emerald-500/20'
                                    : 'bg-neutral-900/80 text-neutral-400 border-neutral-800 hover:text-neutral-200 hover:bg-neutral-800/60'
                                }`}
                              >
                                {preset}
                              </button>
                            );
                          })}
                        </div>
                        <input
                          type="text"
                          value={customTopicInput}
                          onChange={(e) => setCustomTopicInput(e.target.value)}
                          placeholder="Or enter custom topic (e.g., Kadane's Algorithm, Dijkstra, Matrix)..."
                          className="w-full bg-neutral-900/90 border border-neutral-800 focus:border-emerald-500/50 rounded-xl px-3.5 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none transition-colors"
                        />
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                        {/* Difficulty Selection */}
                        <div className="lg:col-span-4 space-y-2">
                          <label className="text-neutral-300 font-semibold text-xs block">
                            Difficulty Level
                          </label>
                          <div className="grid grid-cols-3 gap-2">
                            {(['Easy', 'Medium', 'Hard'] as const).map((diff) => {
                              const isSelected = genDifficulty === diff;
                              const activeColor =
                                diff === 'Easy'
                                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                                  : diff === 'Medium'
                                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                                  : 'bg-rose-500/20 text-rose-300 border-rose-500/40';
                              return (
                                <button
                                  key={diff}
                                  type="button"
                                  onClick={() => setGenDifficulty(diff)}
                                  className={`py-2 px-3 rounded-xl font-mono text-center text-xs font-semibold border transition-all cursor-pointer ${
                                    isSelected
                                      ? `${activeColor} shadow-sm`
                                      : 'bg-neutral-900/80 text-neutral-400 border-neutral-800 hover:text-white hover:bg-neutral-800/60'
                                  }`}
                                >
                                  {diff}
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Target Company Selection */}
                        <div className="lg:col-span-8 space-y-2">
                          <label className="text-neutral-300 font-semibold text-xs block">
                            Target Company Drive
                          </label>
                          <div className="flex flex-wrap gap-1.5">
                            {AI_COMPANY_PRESETS.map((comp) => {
                              const isSelected = genCompany === comp;
                              return (
                                <button
                                  key={comp}
                                  type="button"
                                  onClick={() => setGenCompany(comp)}
                                  className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer border ${
                                    isSelected
                                      ? 'bg-teal-500/20 text-teal-300 border-teal-500/40 font-semibold shadow-sm shadow-teal-500/20'
                                      : 'bg-neutral-900/80 text-neutral-400 border-neutral-800 hover:text-neutral-200 hover:bg-neutral-800/60'
                                  }`}
                                >
                                  {comp}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>

                      {generateError && (
                        <div className="p-3 rounded-xl bg-rose-950/30 border border-rose-500/30 text-rose-300 text-xs">
                          {generateError}
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex items-center justify-end space-x-2 pt-3 border-t border-white/10">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setIsGenerateModalOpen(false)}
                          className="text-neutral-400 hover:text-white text-xs cursor-pointer"
                        >
                          Close
                        </Button>
                        <Button
                          type="submit"
                          variant="primary"
                          size="md"
                          isLoading={isGenerating}
                          disabled={isGenerating}
                          className="bg-gradient-to-r from-emerald-400 to-teal-400 text-black hover:from-emerald-300 hover:to-teal-300 font-bold shadow-lg shadow-emerald-500/20 px-5 py-2 rounded-xl text-xs cursor-pointer inline-flex items-center"
                        >
                          {isGenerating ? (
                            <>
                              <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                              <span>Generating {genDifficulty} problem on {customTopicInput.trim() || selectedTopicPreset}...</span>
                            </>
                          ) : (
                            <span>Create Coding Problem</span>
                          )}
                        </Button>
                      </div>
                    </form>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* PROBLEM LIST */}
            <div className="rounded-3xl border border-neutral-800 bg-neutral-950/70 p-5 backdrop-blur-xl shadow-2xl">
              <div className="divide-y divide-neutral-850">
                {filteredProblems.length === 0 ? (
                  <div className="text-center py-12 text-neutral-400 text-xs font-mono">
                    No coding challenges found matching the selected filters.
                  </div>
                ) : (
                  filteredProblems.map((prob) => {
                    const isSolved = solvedIds.includes(prob.id);
                    return (
                      <div
                        key={prob.id}
                        onClick={() => handleSelectProblem(prob)}
                        className="py-4 px-3 sm:px-4 rounded-2xl hover:bg-neutral-900/50 transition-colors flex items-center justify-between gap-4 cursor-pointer group"
                      >
                        <div className="flex items-center space-x-3.5 min-w-0">
                          <div
                            className={`h-9 w-9 rounded-xl flex items-center justify-center shrink-0 border ${
                              isSolved
                                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                                : 'bg-neutral-900 border-neutral-800 text-neutral-400 group-hover:border-neutral-700'
                            }`}
                          >
                            <Code2 className="w-4 h-4" />
                          </div>

                          <div className="min-w-0 space-y-1">
                            <div className="flex items-center space-x-2 flex-wrap">
                              <h4 className="text-sm font-semibold text-white group-hover:text-emerald-400 transition-colors truncate">
                                {prob.title}
                              </h4>
                              <span
                                className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold border ${
                                  prob.difficulty === 'Easy'
                                    ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
                                    : prob.difficulty === 'Medium'
                                    ? 'text-amber-400 bg-amber-500/10 border-amber-500/20'
                                    : 'text-rose-400 bg-rose-500/10 border-rose-500/20'
                                }`}
                              >
                                {prob.difficulty}
                              </span>
                            </div>

                            <div className="flex items-center space-x-2 text-xs text-neutral-500 flex-wrap gap-y-1">
                              <span className="font-mono text-neutral-400">{prob.category}</span>
                              <span className="text-neutral-500">•</span>
                              <span className="text-[11px] font-mono">Acceptance: {prob.acceptance}</span>
                              <span className="text-neutral-500">•</span>
                              <div className="flex items-center gap-1.5 flex-wrap">
                                {prob.companies.map((c) => (
                                  <span
                                    key={c}
                                    className="px-2 py-0.5 rounded-md text-[10px] font-mono bg-neutral-900 border border-neutral-800 text-neutral-300"
                                  >
                                    {c}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-3 shrink-0">
                          {isSolved && (
                            <span className="text-xs text-emerald-400 font-mono font-medium flex items-center gap-1">
                              <Check className="w-3.5 h-3.5" /> Solved
                            </span>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-xs rounded-xl border-neutral-800 group-hover:border-neutral-700 cursor-pointer"
                          >
                            Code <ChevronRight className="w-3.5 h-3.5 ml-1" />
                          </Button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        ) : (
          /* VIEW 2: TWO-PANE PROBLEM DETAIL & CODE EDITOR */
          <div className="space-y-4 min-w-0">
            {/* Top Toolbar */}
            <div className="flex items-center justify-between p-4 rounded-2xl border border-neutral-800 bg-neutral-950/80 backdrop-blur-xl">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setActiveProblem(null)}
                className="text-xs text-neutral-400 hover:text-white cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4 mr-1.5" />
                Back to Problem List
              </Button>

              <div className="flex items-center space-x-3">
                {solvedIds.includes(activeProblem.id) && (
                  <span className="text-xs font-mono font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Solved
                  </span>
                )}
                <span className="text-xs text-neutral-400 font-mono bg-neutral-900 px-2.5 py-1 rounded-lg border border-neutral-800">
                  {activeProblem.category}
                </span>
              </div>
            </div>

            {/* Split Grid: Left Details, Right Editor */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-w-0">
              {/* LEFT PANE: Problem Description (5 cols) */}
              <div className="lg:col-span-5 rounded-3xl border border-neutral-800 bg-neutral-950/70 p-6 backdrop-blur-xl shadow-xl space-y-6 overflow-y-auto max-h-[85vh] min-w-0">
                <div className="space-y-2 pb-4 border-b border-neutral-800/80">
                  <div className="flex items-center space-x-2">
                    <h2 className="text-xl font-bold text-white tracking-tight">
                      {activeProblem.title}
                    </h2>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span
                      className={`text-xs px-2.5 py-0.5 rounded-full font-mono font-bold border ${
                        activeProblem.difficulty === 'Easy'
                          ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
                          : activeProblem.difficulty === 'Medium'
                          ? 'text-amber-400 bg-amber-500/10 border-amber-500/20'
                          : 'text-rose-400 bg-rose-500/10 border-rose-500/20'
                      }`}
                    >
                      {activeProblem.difficulty}
                    </span>
                    <span className="text-xs text-neutral-400 font-mono">
                      Acceptance: {activeProblem.acceptance}
                    </span>
                  </div>
                </div>

                {/* Companies tag */}
                <div className="space-y-1.5">
                  <span className="text-[11px] text-neutral-400 font-mono block">Target Campus Drives:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {activeProblem.companies.map((c) => (
                      <span
                        key={c}
                        className="text-xs px-2.5 py-1 rounded-lg bg-neutral-900 border border-neutral-800 text-neutral-200 font-mono"
                      >
                        {c}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400 font-mono">
                    Problem Description
                  </h4>
                  <div className="text-xs text-neutral-300 leading-relaxed whitespace-pre-line font-mono">
                    {activeProblem.description}
                  </div>
                </div>

                {/* Progressive Hints Button */}
                {activeProblem.hints && activeProblem.hints.length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-neutral-800/60">
                    <div className="flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => setShowHint(!showHint)}
                        className="inline-flex items-center space-x-1.5 text-xs text-cyan-400 hover:text-cyan-300 font-medium cursor-pointer"
                      >
                        <HelpCircle className="w-3.5 h-3.5" />
                        <span>{showHint ? 'Hide Hints' : 'Need a Hint? (Step-by-step guidance)'}</span>
                        {showHint ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      </button>
                    </div>

                    <AnimatePresence>
                      {showHint && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="p-3.5 rounded-xl bg-cyan-950/20 border border-cyan-500/30 text-xs text-cyan-200/90 space-y-2 font-mono"
                        >
                          {activeProblem.hints.slice(0, revealedHintIndex + 1).map((hint, idx) => (
                            <div key={idx} className="space-y-1">
                              <span className="font-bold text-cyan-400 block">Hint {idx + 1}:</span>
                              <p className="leading-relaxed text-[11px]">{hint}</p>
                            </div>
                          ))}
                          {revealedHintIndex < activeProblem.hints.length - 1 && (
                            <button
                              type="button"
                              onClick={() => setRevealedHintIndex((prev) => prev + 1)}
                              className="text-[11px] underline text-cyan-400 hover:text-white pt-1 block cursor-pointer"
                            >
                              Show Next Hint ({revealedHintIndex + 2} of {activeProblem.hints.length})
                            </button>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}

                {/* Examples */}
                <div className="space-y-3 pt-2 border-t border-neutral-800/60">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400 font-mono">
                    Sample Examples
                  </h4>
                  <div className="space-y-2.5">
                    {activeProblem.examples.map((ex, i) => (
                      <div key={i} className="p-3 rounded-xl bg-neutral-900/60 border border-neutral-800 text-xs font-mono space-y-1.5">
                        <div className="text-neutral-400">
                          <strong className="text-neutral-300">Input:</strong> {ex.input}
                        </div>
                        <div className="text-emerald-400">
                          <strong className="text-neutral-300">Output:</strong> {ex.output}
                        </div>
                        {ex.explanation && (
                          <div className="text-neutral-400 text-[11px] pt-1 border-t border-neutral-800/60">
                            {ex.explanation}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Constraints */}
                <div className="space-y-2 pt-2 border-t border-neutral-800/60">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400 font-mono">
                    Constraints
                  </h4>
                  <ul className="list-disc list-inside text-xs text-neutral-400 space-y-1 font-mono">
                    {activeProblem.constraints.map((c, i) => (
                      <li key={i}>{c}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* RIGHT PANE: Code Editor & 3-Tab Console (7 cols) */}
              <div className="lg:col-span-7 rounded-3xl border border-neutral-800 bg-neutral-950/70 p-5 backdrop-blur-xl shadow-2xl flex flex-col justify-between space-y-4 min-w-0">
                {/* Editor Top Bar */}
                <div className="flex items-center justify-between pb-3 border-b border-neutral-800/80 flex-wrap gap-2">
                  <div className="flex items-center space-x-2">
                    <Terminal className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-bold text-white">Solution Editor (Empty Starter Code)</span>
                  </div>

                  <div className="flex items-center space-x-2">
                    {/* Language selector */}
                    <select
                      value={selectedLanguage}
                      onChange={(e) =>
                        handleLanguageChange(
                          e.target.value as 'javascript' | 'python' | 'cpp' | 'java'
                        )
                      }
                      className="bg-neutral-900 border border-neutral-800 rounded-xl px-2.5 py-1 text-xs text-white font-mono focus:outline-none cursor-pointer"
                    >
                      <option value="python">Python 3 (Pyodide WebAssembly)</option>
                      <option value="javascript">JavaScript (Browser Isolated)</option>
                      <option value="cpp">C++ (Gemini Evaluated)</option>
                      <option value="java">Java (Gemini Evaluated)</option>
                    </select>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleResetCode}
                      title="Reset Code Boilerplate"
                      className="h-8 px-2 text-xs text-neutral-400 hover:text-white cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5 mr-1" />
                      <span className="hidden sm:inline">Reset</span>
                    </Button>
                  </div>
                </div>

                {/* Pyodide status indicator */}
                {pythonStatus && (
                  <div className="px-3.5 py-1.5 rounded-xl bg-cyan-950/30 border border-cyan-500/30 text-cyan-300 text-[11px] font-mono flex items-center space-x-2">
                    <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" />
                    <span>{pythonStatus}</span>
                  </div>
                )}

                {/* Code Textarea Editor */}
                <div className="relative rounded-2xl border border-neutral-800/90 bg-[#0d0d10] p-3 font-mono text-xs overflow-hidden">
                  <textarea
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    rows={14}
                    spellCheck={false}
                    className="w-full bg-transparent text-neutral-200 resize-y focus:outline-none font-mono leading-relaxed selection:bg-neutral-700"
                    placeholder="// Write your placement solution here..."
                  />
                </div>

                {/* Action Buttons: Run Code + Submit Solution */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                  <span className="text-[11px] font-mono text-neutral-400">
                    Function to Implement: <code className="text-emerald-400 font-bold">{activeProblem.functionName}</code>
                  </span>

                  <div className="flex items-center space-x-2">
                    {/* RUN CODE BUTTON (Sample cases only) */}
                    <Button
                      variant="outline"
                      size="md"
                      onClick={handleRunCode}
                      isLoading={isEvaluating && evaluationType === 'run'}
                      className="text-xs cursor-pointer border-neutral-700 hover:bg-neutral-800 text-white font-semibold"
                    >
                      <Play className="w-3.5 h-3.5 mr-1.5" />
                      Run Code
                    </Button>

                    {/* SUBMIT SOLUTION BUTTON (Sample + Hidden cases) */}
                    <Button
                      variant="primary"
                      size="md"
                      onClick={handleSubmitSolution}
                      isLoading={isEvaluating && evaluationType === 'submit'}
                      className="text-xs cursor-pointer bg-emerald-400 text-black hover:bg-emerald-300 font-bold shadow-lg shadow-emerald-500/20"
                    >
                      <Send className="w-3.5 h-3.5 mr-1.5" />
                      Submit Solution
                    </Button>
                  </div>
                </div>

                {/* UPGRADED 3-TAB CONSOLE & EVALUATION PANEL */}
                <div className="rounded-2xl border border-neutral-800 bg-neutral-900/50 p-4 space-y-3 font-mono text-xs">
                  {/* Console Header Tabs */}
                  <div className="flex items-center justify-between border-b border-neutral-800 pb-2 flex-wrap gap-2">
                    <div className="flex items-center space-x-2">
                      {/* Tab 1: Test Cases */}
                      <button
                        type="button"
                        onClick={() => setConsoleTab('testcases')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors flex items-center space-x-1.5 ${
                          consoleTab === 'testcases'
                            ? 'bg-neutral-800 text-white shadow-sm'
                            : 'text-neutral-400 hover:text-white'
                        }`}
                      >
                        <Terminal className="w-3.5 h-3.5" />
                        <span>Test Cases</span>
                        {runResult && (
                          <span
                            className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                              runResult.status === 'Passed'
                                ? 'bg-emerald-500/20 text-emerald-400'
                                : 'bg-rose-500/20 text-rose-400'
                            }`}
                          >
                            {runResult.passedTests}/{runResult.totalTests}
                          </span>
                        )}
                      </button>

                      {/* Tab 2: Error & Fix Guide (auto-alerts on failure) */}
                      <button
                        type="button"
                        onClick={() => setConsoleTab('error_guide')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors flex items-center space-x-1.5 ${
                          consoleTab === 'error_guide'
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            : runResult && runResult.status === 'Failed'
                            ? 'text-rose-400 animate-pulse hover:text-rose-300'
                            : 'text-neutral-400 hover:text-white'
                        }`}
                      >
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>Error & Fix Guide</span>
                        {runResult && runResult.status === 'Failed' && (
                          <span className="w-2 h-2 rounded-full bg-rose-500" />
                        )}
                      </button>

                      {/* Tab 3: Optimal Solution (locked reference) */}
                      <button
                        type="button"
                        onClick={() => setConsoleTab('optimal_solution')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors flex items-center space-x-1.5 ${
                          consoleTab === 'optimal_solution'
                            ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                            : 'text-neutral-400 hover:text-white'
                        }`}
                      >
                        {isSolutionRevealed ? (
                          <Unlock className="w-3.5 h-3.5 text-cyan-400" />
                        ) : (
                          <Lock className="w-3.5 h-3.5" />
                        )}
                        <span>Optimal Solution</span>
                      </button>
                    </div>

                    {runResult && (
                      <span className="text-[11px] text-neutral-400 font-mono">
                        {runResult.executionTimeMs}ms
                      </span>
                    )}
                  </div>

                  {/* TAB 1 CONTENT: TEST CASES */}
                  {consoleTab === 'testcases' && (
                    <div className="space-y-3">
                      {!runResult ? (
                        /* Pre-Run State: Showing sample test cases */
                        <div className="space-y-3">
                          <div className="flex items-center space-x-2">
                            {activeProblem.testCases.map((_, idx) => (
                              <button
                                key={idx}
                                type="button"
                                onClick={() => setActiveCaseTab(idx)}
                                className={`px-3 py-1 rounded-lg text-xs font-medium cursor-pointer ${
                                  activeCaseTab === idx
                                    ? 'bg-neutral-800 text-white font-bold'
                                    : 'text-neutral-400 hover:text-neutral-200'
                                }`}
                              >
                                Case {idx + 1}
                              </button>
                            ))}
                          </div>

                          {activeProblem.testCases[activeCaseTab] && (
                            <div className="p-3 rounded-xl bg-black/40 border border-neutral-800 space-y-2">
                              <div>
                                <span className="text-neutral-500 block text-[11px]">Input:</span>
                                <pre className="text-neutral-200 text-xs mt-0.5">
                                  {activeProblem.testCases[activeCaseTab].input}
                                </pre>
                              </div>
                              <div>
                                <span className="text-neutral-500 block text-[11px]">Expected Output:</span>
                                <pre className="text-emerald-400 text-xs mt-0.5 font-bold">
                                  {activeProblem.testCases[activeCaseTab].expectedOutput}
                                </pre>
                              </div>
                            </div>
                          )}
                          <p className="text-[11px] text-neutral-500 font-mono pt-1">
                            Click <strong>Run Code</strong> to test sample cases, or <strong>Submit Solution</strong> to evaluate sample + hidden test cases.
                          </p>
                        </div>
                      ) : (
                        /* Post-Run State: Results with Pass / Fail verification */
                        <div className="space-y-3">
                          {/* OVERALL BANNER */}
                          <div
                            className={`p-3 rounded-xl border flex items-center justify-between ${
                              runResult.status === 'Passed'
                                ? 'bg-emerald-950/25 border-emerald-500/40 text-emerald-400'
                                : 'bg-rose-950/25 border-rose-500/40 text-rose-400'
                            }`}
                          >
                            <div className="flex items-center space-x-2">
                              {runResult.status === 'Passed' ? (
                                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                              ) : (
                                <XCircle className="w-4 h-4 shrink-0 text-rose-400" />
                              )}
                              <span className="font-bold text-xs">
                                {runResult.status === 'Passed'
                                  ? evaluationType === 'submit'
                                    ? 'Accepted — All Test Cases Passed! Problem Solved.'
                                    : 'Sample Test Cases Passed!'
                                  : 'Wrong Answer / Test Cases Failed'}
                              </span>
                            </div>
                            <span className="text-xs font-mono font-bold">
                              {runResult.passedTests} / {runResult.totalTests} Passed
                            </span>
                          </div>

                          {/* CASE TABS */}
                          <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                            {runResult.details.map((d, idx) => (
                              <button
                                key={idx}
                                type="button"
                                onClick={() => setActiveCaseTab(idx)}
                                className={`px-2.5 py-1 rounded-lg text-xs font-mono cursor-pointer flex items-center space-x-1 ${
                                  activeCaseTab === idx
                                    ? d.passed
                                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold'
                                      : 'bg-rose-500/20 text-rose-300 border border-rose-500/40 font-bold'
                                    : d.passed
                                    ? 'text-emerald-400 hover:text-emerald-300'
                                    : 'text-rose-400 hover:text-rose-300'
                                }`}
                              >
                                <span>{d.isHidden ? `Hidden ${d.caseIndex}` : `Case ${d.caseIndex}`}</span>
                                {d.passed ? (
                                  <Check className="w-3 h-3 text-emerald-400" />
                                ) : (
                                  <X className="w-3 h-3 text-rose-400" />
                                )}
                              </button>
                            ))}
                          </div>

                          {/* ACTIVE CASE DETAILS */}
                          {runResult.details[activeCaseTab] && (
                            <div className="p-3.5 rounded-xl bg-black/50 border border-neutral-800 space-y-2">
                              <div>
                                <span className="text-neutral-500 block text-[11px]">Input:</span>
                                <pre className="text-neutral-200 text-xs mt-0.5 whitespace-pre-wrap">
                                  {runResult.details[activeCaseTab].input}
                                </pre>
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 border-t border-neutral-800/60">
                                <div>
                                  <span className="text-neutral-500 block text-[11px]">Expected Output:</span>
                                  <pre className="text-emerald-400 text-xs mt-0.5 font-bold whitespace-pre-wrap">
                                    {runResult.details[activeCaseTab].expectedOutput}
                                  </pre>
                                </div>
                                <div>
                                  <span className="text-neutral-500 block text-[11px]">Your Actual Output:</span>
                                  <pre
                                    className={`text-xs mt-0.5 font-bold whitespace-pre-wrap ${
                                      runResult.details[activeCaseTab].passed
                                        ? 'text-emerald-400'
                                        : 'text-rose-400'
                                    }`}
                                  >
                                    {runResult.details[activeCaseTab].actualOutput}
                                  </pre>
                                </div>
                              </div>

                              {runResult.details[activeCaseTab].error && (
                                <div className="p-2.5 rounded-lg bg-rose-950/40 border border-rose-500/30 text-rose-300 text-[11px] whitespace-pre-wrap">
                                  <strong>Compiler / Runtime Error:</strong>
                                  <div className="mt-1 font-mono">{runResult.details[activeCaseTab].error}</div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* TAB 2 CONTENT: ERROR & FIX GUIDE */}
                  {consoleTab === 'error_guide' && (
                    <div className="space-y-3">
                      {!runResult ? (
                        <div className="text-center py-6 text-neutral-500 text-xs font-mono">
                          No errors detected yet. Run or submit your code to trigger automatic diagnostic analysis.
                        </div>
                      ) : runResult.status === 'Passed' ? (
                        <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/30 text-emerald-300 space-y-1">
                          <div className="flex items-center space-x-2 font-bold text-xs">
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                            <span>No Errors Detected!</span>
                          </div>
                          <p className="text-[11px] text-neutral-400">
                            Your algorithm passed all evaluated test cases with correct syntax, runtime execution, and output matching.
                          </p>
                        </div>
                      ) : (
                        /* FAILURE DIAGNOSTIC */
                        <div className="space-y-3.5">
                          {/* Error Type Badge & Summary */}
                          <div className="p-3.5 rounded-xl bg-rose-950/30 border border-rose-500/40 space-y-2">
                            <div className="flex items-center justify-between flex-wrap gap-2">
                              <div className="flex items-center space-x-2">
                                <span
                                  className={`px-2.5 py-0.5 rounded-md text-[11px] font-bold font-mono border ${
                                    runResult.errorType === 'Syntax Error'
                                      ? 'bg-rose-500/20 text-rose-300 border-rose-500/50'
                                      : runResult.errorType === 'Runtime Error'
                                      ? 'bg-purple-500/20 text-purple-300 border-purple-500/50'
                                      : runResult.errorType === 'Time Limit Exceeded'
                                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                                      : runResult.errorType === 'Empty Implementation'
                                      ? 'bg-orange-500/20 text-orange-300 border-orange-500/50'
                                      : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                                  }`}
                                >
                                  {runResult.errorType || localDiagnosis?.errorType || 'Wrong Answer'}
                                </span>
                                <span className="text-xs font-bold text-white">
                                  {localDiagnosis?.summary || 'Code failed test case validation.'}
                                </span>
                              </div>
                            </div>

                            {/* Exact Traceback / Error Message */}
                            {(runResult.error || runResult.details.find((d) => d.error)?.error) && (
                              <div className="p-2.5 rounded-lg bg-black/60 border border-neutral-800 text-rose-300/90 text-[11px] font-mono whitespace-pre-wrap max-h-32 overflow-y-auto">
                                {runResult.error || runResult.details.find((d) => d.error)?.error}
                              </div>
                            )}
                          </div>

                          {/* Rule-Based Local 3-Step Fix Guide */}
                          {localDiagnosis && (
                            <div className="p-4 rounded-xl bg-neutral-900/80 border border-neutral-800 space-y-3">
                              <div>
                                <span className="text-[11px] font-bold text-neutral-400 block uppercase tracking-wider">
                                  Root Cause:
                                </span>
                                <p className="text-xs text-neutral-200 mt-1 leading-relaxed">
                                  {localDiagnosis.rootCause}
                                </p>
                              </div>

                              <div className="pt-2 border-t border-neutral-800 space-y-1.5">
                                <span className="text-[11px] font-bold text-neutral-400 block uppercase tracking-wider">
                                  3-Step Actionable Fix Guide:
                                </span>
                                <ul className="space-y-1.5 text-xs text-neutral-300 list-decimal list-inside font-mono">
                                  {localDiagnosis.fixSteps.map((step, idx) => (
                                    <li key={idx} className="leading-relaxed">
                                      {step}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          )}

                          {/* AI Error Diagnosis Section */}
                          <div className="pt-1">
                            {!aiDiagnosis ? (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={handleAnalyzeErrorWithAI}
                                isLoading={isAiDiagnosing}
                                className="w-full text-xs font-semibold cursor-pointer border-cyan-500/40 text-cyan-300 hover:bg-cyan-500/10 flex items-center justify-center space-x-1.5"
                              >
                                <Terminal className="w-3.5 h-3.5" />
                                <span>Analyze My Error with AI (Root Cause & Guidance)</span>
                              </Button>
                            ) : (
                              /* AI Analysis Display */
                              <div className="p-4 rounded-xl bg-cyan-950/25 border border-cyan-500/40 space-y-3 text-cyan-200">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center space-x-2">
                                    <Terminal className="w-4 h-4 text-cyan-400" />
                                    <span className="font-bold text-xs text-white">
                                      Gemini AI Error Diagnosis:
                                    </span>
                                  </div>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleAnalyzeErrorWithAI}
                                    isLoading={isAiDiagnosing}
                                    className="text-[11px] h-7 px-2 text-cyan-400 hover:text-cyan-200 cursor-pointer"
                                  >
                                    Re-analyze
                                  </Button>
                                </div>

                                <div className="space-y-1 text-xs">
                                  <span className="font-bold text-cyan-300">Analysis:</span>
                                  <p className="leading-relaxed text-neutral-200">{aiDiagnosis.summary}</p>
                                  <p className="text-neutral-300 text-[11px] leading-relaxed pt-1">
                                    {aiDiagnosis.rootCause}
                                  </p>
                                </div>

                                <div className="space-y-1.5 pt-2 border-t border-cyan-900/50">
                                  <span className="font-bold text-cyan-300 text-xs">
                                    AI Step-by-Step Fix Steps:
                                  </span>
                                  <ul className="space-y-1 text-xs text-neutral-200 list-decimal list-inside font-mono">
                                    {aiDiagnosis.fixSteps.map((step, idx) => (
                                      <li key={idx}>{step}</li>
                                    ))}
                                  </ul>
                                </div>
                              </div>
                            )}

                            {aiDiagError && (
                              <div className="p-2.5 rounded-lg bg-rose-950/40 border border-rose-500/30 text-rose-300 text-[11px] mt-2 font-mono">
                                {aiDiagError}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* TAB 3 CONTENT: OPTIMAL REFERENCE SOLUTION */}
                  {consoleTab === 'optimal_solution' && (
                    <div className="space-y-3">
                      {!activeProblem.referenceSolution ? (
                        <div className="text-center py-6 text-neutral-400 text-xs font-mono">
                          This is a custom generated question. You can use hints or click &ldquo;Analyze My Error with AI&rdquo; for solution guidance.
                        </div>
                      ) : !isSolutionRevealed ? (
                        /* LOCKED STATE */
                        <div className="p-6 rounded-2xl bg-neutral-900/60 border border-neutral-800 text-center space-y-4">
                          <div className="h-12 w-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mx-auto">
                            <Lock className="w-6 h-6" />
                          </div>
                          <div className="space-y-1.5 max-w-md mx-auto">
                            <h4 className="text-sm font-bold text-white">
                              Optimal Reference Solution Locked
                            </h4>
                            <p className="text-xs text-neutral-400 leading-relaxed font-sans">
                              Placement interviewers expect you to develop the algorithm on your own. Try writing and debugging your code first before viewing the optimal implementation.
                            </p>
                          </div>
                          <Button
                            variant="primary"
                            size="md"
                            onClick={() => setIsSolutionRevealed(true)}
                            className="text-xs font-bold bg-amber-400 hover:bg-amber-300 text-black cursor-pointer shadow-lg shadow-amber-500/20"
                          >
                            <Unlock className="w-3.5 h-3.5 mr-1.5" />
                            Reveal Reference Solution
                          </Button>
                        </div>
                      ) : (
                        /* REVEALED STATE */
                        <div className="space-y-3">
                          {/* Header with Complexities & Actions */}
                          <div className="flex items-center justify-between flex-wrap gap-2 p-3 rounded-xl bg-cyan-950/20 border border-cyan-500/30">
                            <div className="flex items-center space-x-2">
                              <span className="text-xs font-bold text-white flex items-center space-x-1.5">
                                <Cpu className="w-3.5 h-3.5 text-cyan-400" />
                                <span>Optimal Solution ({selectedLanguage.toUpperCase()})</span>
                              </span>
                              {activeProblem.referenceSolution.timeComplexity && (
                                <span className="px-2 py-0.5 rounded-md text-[10px] font-mono bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                                  Time: {activeProblem.referenceSolution.timeComplexity}
                                </span>
                              )}
                              {activeProblem.referenceSolution.spaceComplexity && (
                                <span className="px-2 py-0.5 rounded-md text-[10px] font-mono bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                                  Space: {activeProblem.referenceSolution.spaceComplexity}
                                </span>
                              )}
                            </div>

                            <div className="flex items-center space-x-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleCopySolution}
                                className="h-7 px-2 text-[11px] text-neutral-300 hover:text-white cursor-pointer"
                              >
                                {copiedCode ? (
                                  <>
                                    <Check className="w-3 h-3 mr-1 text-emerald-400" /> Copied
                                  </>
                                ) : (
                                  <>
                                    <Copy className="w-3 h-3 mr-1" /> Copy
                                  </>
                                )}
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setIsSolutionRevealed(false)}
                                className="h-7 px-2 text-[11px] text-neutral-400 hover:text-white cursor-pointer"
                              >
                                <Lock className="w-3 h-3 mr-1" /> Hide
                              </Button>
                            </div>
                          </div>

                          {/* Approach Explanation */}
                          {activeProblem.referenceSolution.approach && (
                            <div className="p-3 rounded-xl bg-black/40 border border-neutral-800 text-xs text-neutral-300 leading-relaxed font-sans">
                              <strong className="text-cyan-400 block mb-1 font-mono text-[11px] uppercase tracking-wider">
                                Algorithmic Approach:
                              </strong>
                              {activeProblem.referenceSolution.approach}
                            </div>
                          )}

                          {/* Code Display */}
                          <div className="relative rounded-xl border border-neutral-800 bg-[#0a0a0d] p-3 text-xs font-mono overflow-x-auto max-h-56">
                            <pre className="text-emerald-300/90 leading-relaxed">
                              {activeProblem.referenceSolution.code[selectedLanguage] ||
                                '// Reference solution not available for this language.'}
                            </pre>
                          </div>

                          {/* Load into Editor Button */}
                          <div className="flex items-center justify-between pt-1">
                            <span className="text-[11px] text-neutral-500 font-mono">
                              Want to execute and step through this reference solution?
                            </span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={handleLoadSolutionIntoEditor}
                              className="text-xs border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/10 cursor-pointer font-semibold"
                            >
                              <FileCode2 className="w-3.5 h-3.5 mr-1.5" />
                              Load into Editor
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* AI QUESTION GENERATION MODAL */}
      </div>
    </DashboardLayout>
  );
};

export default CodingPage;
