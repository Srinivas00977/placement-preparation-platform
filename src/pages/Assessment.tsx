import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  GraduationCap,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  Compass,
  Award,
  Target,
  Calculator,
  Code2,
  Cpu,
  Users,
  Play,
  Terminal,
  Calendar,
  Flame,
  Check,
  History,
  Send,
  Loader2,
  ChevronDown,
  ChevronUp,
  XCircle,
  HelpCircle,
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import {
  TARGET_JOB_ROLES,
  type AssessmentQuestion,
} from '@/data/assessmentQuestions';
import { progressService, type SkillAssessmentResult } from '@/services/progressService';
import { authService } from '@/services/authService';
import {
  assessmentService,
  type DailyAssessmentStatus,
  type AssessmentHistoryItem,
  type WrongQuestionReviewItem,
} from '@/services/assessmentService';
import {
  runJavaScriptCode,
  runPythonCode,
  runCppOrJavaCode,
  type RunResult,
  type TestCaseInput,
} from '@/services/codeRunnerService';
import { Button } from '@/components/ui/button';

export type AssessmentLanguage = 'python' | 'javascript' | 'cpp' | 'java' | 'c';

const LANGUAGE_OPTIONS: { id: AssessmentLanguage; label: string }[] = [
  { id: 'python', label: 'Python 3' },
  { id: 'javascript', label: 'JavaScript' },
  { id: 'cpp', label: 'C++' },
  { id: 'java', label: 'Java' },
  { id: 'c', label: 'C' },
];

function getStarterBoilerplate(q: AssessmentQuestion, lang: AssessmentLanguage): string {
  if (q.starterCode && q.starterCode[lang]) {
    return q.starterCode[lang]!;
  }
  const pyCode = q.starterCode?.python || '';
  const match = pyCode.match(/def\s+([a-zA-Z0-9_]+)\s*\(/);
  const fnName = match ? match[1] : 'solution';

  switch (lang) {
    case 'python':
      return `def ${fnName}(*args):\n    # Write your solution here\n    pass`;
    case 'javascript':
      return `function ${fnName}(...args) {\n  // Write your solution here\n}`;
    case 'cpp':
      return `#include <iostream>\n#include <vector>\nusing namespace std;\n\nclass Solution {\npublic:\n    auto ${fnName}() {\n        // Write your code here\n    }\n};`;
    case 'java':
      return `import java.util.*;\n\npublic class Solution {\n    public static Object ${fnName}() {\n        // Write your code here\n        return null;\n    }\n}`;
    case 'c':
      return `#include <stdio.h>\n#include <stdbool.h>\n\n// Implement ${fnName}\nint ${fnName}() {\n    // Write your code here\n    return 0;\n}`;
  }
}

export const AssessmentPage: React.FC = () => {
  const navigate = useNavigate();
  const currentUser = authService.getCurrentUser();
  const currentProgress = progressService.getUserProgress();

  const [targetRole, setTargetRole] = useState<string>(
    () => currentProgress.profile.targetRole || TARGET_JOB_ROLES[0]
  );

  // 2-Mode Flow: 'overview' (default) -> 'active' (test in progress)
  const [testMode, setTestMode] = useState<'overview' | 'active'>('overview');

  // Daily Assessment Meta & History
  const [dailyStatus, setDailyStatus] = useState<DailyAssessmentStatus | null>(null);
  const [history, setHistory] = useState<AssessmentHistoryItem[]>([]);
  const [isLoadingDaily, setIsLoadingDaily] = useState<boolean>(true);

  // Active Questions State
  const [questions, setQuestions] = useState<AssessmentQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  // Answers State
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});

  // Coding Questions State
  const [codeSolutions, setCodeSolutions] = useState<Record<string, string>>({});
  const [codeLanguages, setCodeLanguages] = useState<Record<string, AssessmentLanguage>>({});
  const [codeRunResults, setCodeRunResults] = useState<Record<string, RunResult>>({});
  const [isEvaluatingCode, setIsEvaluatingCode] = useState<Record<string, boolean>>({});
  const [pythonStatuses, setPythonStatuses] = useState<Record<string, string | null>>({});

  // Submission & Results
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [result, setResult] = useState<SkillAssessmentResult | null>(() => currentProgress.assessment);
  const [secondsRemaining, setSecondsRemaining] = useState(25 * 60); // 25 minutes
  const [isMistakesOpen, setIsMistakesOpen] = useState(true);

  // Load daily assessment status and questions
  const loadDailyAssessment = async (roleToLoad: string) => {
    setIsLoadingDaily(true);
    try {
      const [statusData, dailyData] = await Promise.all([
        assessmentService.getStatus(),
        assessmentService.getDailyQuestions(roleToLoad),
      ]);

      setDailyStatus(statusData);
      setHistory(dailyData.history || []);

      const allQs = dailyData.questions.all;
      setQuestions(allQs);

      // Initialize empty starter code for coding questions
      const initialCodes: Record<string, string> = {};
      const initialLangs: Record<string, AssessmentLanguage> = {};

      allQs.forEach((q) => {
        if (q.questionType === 'coding') {
          initialLangs[q.id] = 'python';
          initialCodes[q.id] = getStarterBoilerplate(q, 'python');
        }
      });

      setCodeSolutions(initialCodes);
      setCodeLanguages(initialLangs);
    } catch (e) {
      console.error('Failed to load daily assessment:', e);
    } finally {
      setIsLoadingDaily(false);
    }
  };

  useEffect(() => {
    loadDailyAssessment(targetRole);
  }, [targetRole]);

  // Timer: Only counts down when in 'active' test mode
  useEffect(() => {
    if (testMode !== 'active' || isSubmitted) return;
    const interval = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [testMode, isSubmitted]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleSelectOption = (questionId: string, optionIndex: number) => {
    if (testMode !== 'active') return;
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: optionIndex,
    }));
  };

  const handleLanguageChange = (qId: string, lang: AssessmentLanguage) => {
    setCodeLanguages((prev) => ({ ...prev, [qId]: lang }));
    const targetQ = questions.find((q) => q.id === qId);
    if (targetQ) {
      setCodeSolutions((prev) => ({
        ...prev,
        [qId]: getStarterBoilerplate(targetQ, lang),
      }));
    }
  };

  const handleRunCodingTest = async (q: AssessmentQuestion) => {
    const qId = q.id;
    const lang = codeLanguages[qId] || 'python';
    const code = codeSolutions[qId] || '';
    const testCases: TestCaseInput[] = (q.testCases || []).map((tc) => ({
      input: tc.input,
      expectedOutput: tc.expectedOutput,
    }));

    if (!testCases.length) return;

    setIsEvaluatingCode((prev) => ({ ...prev, [qId]: true }));
    if (lang === 'python') {
      setPythonStatuses((prev) => ({ ...prev, [qId]: 'Initializing Python 3 runtime...' }));
    } else if (lang === 'cpp' || lang === 'java' || lang === 'c') {
      setPythonStatuses((prev) => ({ ...prev, [qId]: `Evaluating ${lang.toUpperCase()} code...` }));
    }

    const fnMatch =
      (q.starterCode?.[lang] || code).match(/(?:def|function)\s+([a-zA-Z0-9_]+)\s*\(/) ||
      (q.starterCode?.python || '').match(/def\s+([a-zA-Z0-9_]+)\s*\(/);
    const fnName = fnMatch ? fnMatch[1] : 'solution';

    try {
      let runRes: RunResult;
      if (lang === 'python') {
        runRes = await runPythonCode(
          code,
          fnName,
          testCases,
          testCases.length,
          (status: string) => {
            setPythonStatuses((prev) => ({ ...prev, [qId]: status }));
          }
        );
      } else if (lang === 'javascript') {
        runRes = runJavaScriptCode(code, fnName, testCases);
      } else {
        runRes = await runCppOrJavaCode(code, lang, fnName, testCases);
      }
      setCodeRunResults((prev) => ({ ...prev, [qId]: runRes }));
    } catch (err: any) {
      setCodeRunResults((prev) => ({
        ...prev,
        [qId]: {
          status: 'Failed',
          passedTests: 0,
          totalTests: testCases.length,
          output: err.message || 'Execution Error',
          executionTimeMs: 0,
          details: testCases.map((tc, idx) => ({
            caseIndex: idx + 1,
            passed: false,
            input: tc.input,
            expectedOutput: tc.expectedOutput,
            actualOutput: 'Error occurred',
          })),
        },
      }));
    } finally {
      setIsEvaluatingCode((prev) => ({ ...prev, [qId]: false }));
      setPythonStatuses((prev) => ({ ...prev, [qId]: null }));
    }
  };

  // Submit assessment calculation
  const handleSubmit = async () => {
    // 1. Aptitude Score %
    const aptitudeQs = questions.filter((q) => q.section === 'aptitude');
    const technicalQs = questions.filter((q) => q.section === 'technical');
    const codingQs = questions.filter((q) => q.section === 'coding');
    const hrQs = questions.filter((q) => q.section === 'hr');

    let aptCorrect = 0;
    aptitudeQs.forEach((q) => {
      if (selectedAnswers[q.id] === q.correctAnswer) aptCorrect++;
    });
    const aptScore = Math.round((aptCorrect / Math.max(1, aptitudeQs.length)) * 100);

    // 2. Technical Score %
    let techCorrect = 0;
    const techMistakes: string[] = [];
    technicalQs.forEach((q) => {
      if (selectedAnswers[q.id] === q.correctAnswer) {
        techCorrect++;
      } else {
        techMistakes.push(q.topic);
      }
    });
    const techScore = Math.round((techCorrect / Math.max(1, technicalQs.length)) * 100);

    // 3. Coding & DSA Score % (STRICT TEST CASE EVALUATION)
    let totalCodingCases = 0;
    let passedCodingCases = 0;
    codingQs.forEach((q) => {
      const tcCount = q.testCases?.length || 2;
      totalCodingCases += tcCount;
      const res = codeRunResults[q.id];
      if (res && res.status === 'Passed') {
        passedCodingCases += res.passedTests;
      } else if (res && res.details) {
        passedCodingCases += res.details.filter((d) => d.passed).length;
      }
    });
    const codeScore = totalCodingCases > 0 ? Math.round((passedCodingCases / totalCodingCases) * 100) : 0;

    // 4. HR Score %
    let hrCorrect = 0;
    hrQs.forEach((q) => {
      if (selectedAnswers[q.id] === q.correctAnswer) hrCorrect++;
    });
    const hrScore = Math.round((hrCorrect / Math.max(1, hrQs.length)) * 100);

    // Weighted Overall Score
    const overallScore = Math.round(
      aptScore * 0.25 + techScore * 0.25 + codeScore * 0.35 + hrScore * 0.15
    );

    // Strengths (>= 70%) & Weaknesses (< 70%)
    const strengths: string[] = [];
    const weaknesses: string[] = [];
    const skillGaps: string[] = [];

    if (aptScore >= 70) strengths.push('Quantitative Aptitude & Logic');
    else weaknesses.push('Quantitative Aptitude & Logic');

    if (techScore >= 70) strengths.push(`Role Core Foundations (${targetRole})`);
    else weaknesses.push(`Role Core Foundations (${targetRole})`);

    if (codeScore >= 70) strengths.push('Live Coding & Algorithmic Problem Solving');
    else weaknesses.push('Live Coding & Algorithmic Problem Solving');

    if (hrScore >= 70) strengths.push('Behavioral STAR Communication');
    else weaknesses.push('Behavioral STAR Communication');

    if (techMistakes.length > 0) {
      skillGaps.push(...techMistakes.slice(0, 3));
    }
    if (codeScore < 70) {
      skillGaps.push('Edge Case Handling & Test Case Validation');
    }

    // Build Question-by-Question Mistake Review items
    const wrongQuestions: WrongQuestionReviewItem[] = [];

    // Aptitude mistakes
    aptitudeQs.forEach((q) => {
      const userAnsIdx = selectedAnswers[q.id];
      const isCorrect = userAnsIdx === q.correctAnswer;
      if (!isCorrect) {
        const userChoiceText = userAnsIdx !== undefined && q.options && q.options[userAnsIdx]
          ? q.options[userAnsIdx]
          : '[Skipped / Unanswered]';
        const correctChoiceText = (q.options && q.correctAnswer !== undefined && q.options[q.correctAnswer])
          ? q.options[q.correctAnswer]
          : `Option ${(q.correctAnswer ?? 0) + 1}`;
        wrongQuestions.push({
          id: q.id,
          category: 'Aptitude',
          topic: q.topic || 'Quantitative Aptitude',
          question: q.question,
          userAnswer: userChoiceText,
          correctAnswer: correctChoiceText,
          explanation: q.explanation || 'Review fundamental formulas and solve similar pattern questions.',
        });
      }
    });

    // Technical mistakes
    technicalQs.forEach((q) => {
      const userAnsIdx = selectedAnswers[q.id];
      const isCorrect = userAnsIdx === q.correctAnswer;
      if (!isCorrect) {
        const userChoiceText = userAnsIdx !== undefined && q.options && q.options[userAnsIdx]
          ? q.options[userAnsIdx]
          : '[Skipped / Unanswered]';
        const correctChoiceText = (q.options && q.correctAnswer !== undefined && q.options[q.correctAnswer])
          ? q.options[q.correctAnswer]
          : `Option ${(q.correctAnswer ?? 0) + 1}`;
        wrongQuestions.push({
          id: q.id,
          category: 'Technical',
          topic: q.topic || 'Role Core Concepts',
          question: q.question,
          userAnswer: userChoiceText,
          correctAnswer: correctChoiceText,
          explanation: q.explanation || `Study key foundational topics for ${targetRole}.`,
        });
      }
    });

    // Coding mistakes
    codingQs.forEach((q) => {
      const res = codeRunResults[q.id];
      const total = q.testCases?.length || 2;
      const passed = res?.passedTests || 0;
      const allPassed = res && res.status === 'Passed' && passed === total;
      if (!allPassed) {
        wrongQuestions.push({
          id: q.id,
          category: 'Coding',
          topic: q.topic || 'DSA & Coding',
          question: q.question,
          userAnswer: res ? `${passed}/${total} Test Cases Passed` : '[Code Not Run / Skipped]',
          correctAnswer: `All ${total} Test Cases Must Pass`,
          explanation: q.explanation || 'Double check edge cases (empty lists, 0 values, negative indices) and time complexity.',
        });
      }
    });

    // HR mistakes
    hrQs.forEach((q) => {
      const userAnsIdx = selectedAnswers[q.id];
      const isCorrect = userAnsIdx === q.correctAnswer;
      if (!isCorrect) {
        const userChoiceText = userAnsIdx !== undefined && q.options && q.options[userAnsIdx]
          ? q.options[userAnsIdx]
          : '[Skipped / Unanswered]';
        const correctChoiceText = (q.options && q.correctAnswer !== undefined && q.options[q.correctAnswer])
          ? q.options[q.correctAnswer]
          : `Option ${(q.correctAnswer ?? 0) + 1}`;
        wrongQuestions.push({
          id: q.id,
          category: 'HR',
          topic: q.topic || 'Behavioral HR',
          question: q.question,
          userAnswer: userChoiceText,
          correctAnswer: correctChoiceText,
          explanation: q.explanation || 'Structure your responses using the STAR method (Situation, Task, Action, Result).',
        });
      }
    });

    const payload = {
      email: currentUser?.email || 'guest@placepilot.ai',
      role: targetRole,
      date: assessmentService.getTodayDateString(),
      overallScore,
      aptitudeScore: aptScore,
      codingScore: codeScore,
      technicalScore: techScore,
      hrScore,
      strengths,
      weaknesses,
      skillGaps,
      wrongQuestions,
    };

    const submitRes = await assessmentService.submitAssessment(payload);

    const assessmentResult: SkillAssessmentResult = {
      scores: {
        aptitude: aptScore,
        coding: codeScore,
        technical: techScore,
        hr: hrScore,
        overall: overallScore,
      },
      targetRole,
      strengths,
      weaknesses,
      skillGaps,
      completedAt: new Date().toISOString(),
      wrongQuestions,
    };

    setResult(assessmentResult);
    setIsSubmitted(true);
    setTestMode('overview');

    // Refresh daily status & history from backend
    setDailyStatus({
      completedToday: true,
      dailyStreak: submitRes.dailyStreak,
      lastCompletedDate: payload.date,
      totalAssessments: (dailyStatus?.totalAssessments || 0) + 1,
      notificationMessage: null,
    });
    setHistory(submitRes.history);
  };

  // Start Today's Assessment Handler
  const handleStartTodayAssessment = () => {
    setSelectedAnswers({});
    setCodeRunResults({});
    setIsSubmitted(false);
    setCurrentQuestionIndex(0);
    setSecondsRemaining(25 * 60);
    setTestMode('active');
  };

  // Reset & Retake Assessment Handler (< 65% Rule or Manual Retry)
  const handleResetAndRetake = () => {
    setSelectedAnswers({});
    setCodeRunResults({});
    setIsSubmitted(false);
    setCurrentQuestionIndex(0);
    setSecondsRemaining(25 * 60);
    setTestMode('active');
  };

  const handleBackToOverview = () => {
    setTestMode('overview');
  };

  const currentQ = questions[currentQuestionIndex];
  const answeredCount = Object.keys(selectedAnswers).length + Object.keys(codeRunResults).length;

  // Formatted date string
  const todayFormatted = useMemo(() => {
    return new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }, []);

  // Check if user has EVER completed at least one assessment
  const hasCompletedAnyAssessment = useMemo(() => {
    return (
      (history && history.length > 0) ||
      Boolean(dailyStatus?.completedToday) ||
      (dailyStatus?.totalAssessments ?? 0) > 0 ||
      (dailyStatus?.dailyStreak ?? 0) > 0
    );
  }, [history, dailyStatus]);

  // Most recent completed assessment (only valid when user has completed at least one)
  const lastAssessment = useMemo(() => {
    if (!hasCompletedAnyAssessment) return null;

    if (history && history.length > 0) {
      const item = history[0];
      let wrongQs: WrongQuestionReviewItem[] = [];
      if (item.wrong_questions_json) {
        try {
          wrongQs = JSON.parse(item.wrong_questions_json);
        } catch {
          wrongQs = [];
        }
      }
      return {
        id: item.id,
        date: item.assessment_date,
        role: item.role,
        overallScore: Math.round(item.overall_score),
        aptitudeScore: Math.round(item.aptitude_score),
        codingScore: Math.round(item.coding_score),
        technicalScore: Math.round(item.technical_score),
        hrScore: Math.round(item.hr_score),
        strengths: item.strengths_json ? JSON.parse(item.strengths_json) : [],
        weaknesses: item.weaknesses_json ? JSON.parse(item.weaknesses_json) : [],
        skillGaps: item.skill_gaps_json ? JSON.parse(item.skill_gaps_json) : [],
        completedAt: item.completed_at,
        wrongQuestions: wrongQs,
      };
    }
    if (result && hasCompletedAnyAssessment) {
      return {
        id: 'local_current',
        date: result.completedAt ? result.completedAt.split('T')[0] : 'Recent',
        role: result.targetRole,
        overallScore: Math.round(result.scores.overall),
        aptitudeScore: Math.round(result.scores.aptitude),
        codingScore: Math.round(result.scores.coding),
        technicalScore: Math.round(result.scores.technical),
        hrScore: Math.round(result.scores.hr),
        strengths: result.strengths || [],
        weaknesses: result.weaknesses || [],
        skillGaps: result.skillGaps || [],
        completedAt: result.completedAt,
        wrongQuestions: result.wrongQuestions || [],
      };
    }
    return null;
  }, [hasCompletedAnyAssessment, history, result]);

  // Recommended Study Plan & Topics to Improve (Triggered whenever any category or overall score < 65%)
  const weakCategoriesPlan = useMemo(() => {
    if (!lastAssessment) return [];
    const list: Array<{
      category: string;
      score: number;
      topics: string[];
      link: string;
      linkLabel: string;
      icon: 'calc' | 'code' | 'cpu' | 'users';
    }> = [];

    if (lastAssessment.aptitudeScore < 65) {
      const wrongAptTopics = Array.from(
        new Set(
          (lastAssessment.wrongQuestions || [])
            .filter((wq) => wq.category === 'Aptitude' && wq.topic)
            .map((wq) => wq.topic)
        )
      );
      const orderedPhasesTopics = [
        'Phase 1: Number System, Percentage & Profit/Loss',
        'Phase 2: Time & Work, Time Speed & Distance',
        'Phase 3: Number Series, Blood Relations & Syllogism',
        'Phase 4: Error Spotting, Reading Comp., Tables & Pie Charts',
      ];
      list.push({
        category: '4-Pillar Aptitude (Quant, Logical, Verbal & DI)',
        score: lastAssessment.aptitudeScore,
        topics: wrongAptTopics.length > 0 ? [...wrongAptTopics.slice(0, 3), ...orderedPhasesTopics.slice(0, 2)] : orderedPhasesTopics,
        link: '/aptitude',
        linkLabel: 'Open 71-Topic Aptitude Roadmap →',
        icon: 'calc',
      });
    }

    if (lastAssessment.codingScore < 65) {
      list.push({
        category: 'Coding & Data Structures (DSA)',
        score: lastAssessment.codingScore,
        topics: ['Arrays & Hashing (Two Sum, Prefix Sum)', 'Two Pointers & Sliding Window', 'Stack & Queue Fundamentals', 'Dynamic Programming Patterns'],
        link: '/coding',
        linkLabel: 'Practice Coding →',
        icon: 'code',
      });
    }

    if (lastAssessment.technicalScore < 65) {
      const techTopics = targetRole.includes('Data')
        ? ['SQL Joins & Grouping', 'Data Aggregation & Pandas', 'DBMS Indexing', 'Statistics & Probability']
        : targetRole.includes('Frontend')
          ? ['DOM & Virtual DOM', 'CSS Flexbox & Grid', 'JavaScript Async/Await & Event Loop', 'React State Management']
          : targetRole.includes('Cloud') || targetRole.includes('DevOps')
            ? ['Docker Containerization', 'CI/CD Pipelines', 'Linux Shell & Networking', 'Kubernetes Basics']
            : ['OS CPU Scheduling & Deadlocks', 'DBMS Normalization & ACID Properties', 'Computer Networks (TCP/UDP, DNS)', 'Object-Oriented Programming (OOP)'];

      list.push({
        category: `CS Technical Core (${targetRole})`,
        score: lastAssessment.technicalScore,
        topics: techTopics,
        link: '/technical',
        linkLabel: 'Practice Technical →',
        icon: 'cpu',
      });
    }

    if (lastAssessment.hrScore < 65) {
      list.push({
        category: 'HR & Behavioral Communication',
        score: lastAssessment.hrScore,
        topics: ['STAR Method (Situation, Task, Action, Result)', 'Handling Workplace Conflicts & Criticism', 'Explaining Project Trade-offs', 'Leadership & Team Collaboration Scenarios'],
        link: '/hr-prep',
        linkLabel: 'Practice HR →',
        icon: 'users',
      });
    }

    return list;
  }, [lastAssessment, targetRole]);

  // Adaptive mistake section title
  const mistakeSectionTitle = useMemo(() => {
    if (!lastAssessment) return "Review Yesterday's Mistakes (Wrong & Skipped Questions)";
    const today = new Date().toISOString().split('T')[0];
    const yest = new Date();
    yest.setDate(yest.getDate() - 1);
    const yestStr = yest.toISOString().split('T')[0];

    if (lastAssessment.date === yestStr) {
      return "Review Yesterday's Mistakes (Wrong & Skipped Questions)";
    }
    if (lastAssessment.date === today) {
      return "Review Today's Mistakes (Wrong & Skipped Questions)";
    }
    return `Review Last Assessment's Mistakes (${lastAssessment.date})`;
  }, [lastAssessment]);

  return (
    <DashboardLayout
      pageTitle="Daily Placement Skill Assessment"
      pageSubtitle="Adaptive daily technical assessment with real in-browser coding runner, role-specific questions, and SQLite performance tracking."
    >
      <div className="space-y-6 max-w-5xl mx-auto min-w-0">
        {/* ================================================================= */}
        {/* 1. TOP HEADER BAR (ALWAYS VISIBLE IN BOTH MODES)                 */}
        {/* ================================================================= */}
        <div className="rounded-3xl border border-neutral-800 bg-neutral-950/80 p-5 sm:p-6 backdrop-blur-xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-3.5">
            <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 shrink-0">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2 flex-wrap">
                <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  Daily Skill Assessment
                </h2>
                {dailyStatus?.completedToday ? (
                  <span className="text-[11px] px-2.5 py-0.5 rounded-full font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Completed Today
                  </span>
                ) : (
                  <span className="text-[11px] px-2.5 py-0.5 rounded-full font-mono font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center gap-1 animate-pulse">
                    <Clock className="w-3.5 h-3.5" /> Today&apos;s Assessment Pending
                  </span>
                )}
                {/* Dynamic Question Count Badge (20–35) with Missed Day Penalty */}
                {dailyStatus?.penaltyQuestions && dailyStatus.penaltyQuestions > 0 ? (
                  <span className="text-[11px] px-2.5 py-0.5 rounded-full font-mono font-bold bg-rose-500/15 text-rose-300 border border-rose-500/30 flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                    {questions.length || dailyStatus.requiredQuestions || 20} Questions (+{dailyStatus.penaltyQuestions} Missed Day Penalty)
                  </span>
                ) : (
                  <span className="text-[11px] px-2.5 py-0.5 rounded-full font-mono font-bold bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                    {questions.length || dailyStatus?.requiredQuestions || 20} Questions
                  </span>
                )}
              </div>
              <div className="flex items-center space-x-3 text-xs text-neutral-400 mt-1 font-mono">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-neutral-500" />
                  {todayFormatted}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1 text-amber-400 font-bold">
                  <Flame className="w-3.5 h-3.5" />
                  {dailyStatus?.dailyStreak || 0} Day Streak
                </span>
              </div>
            </div>
          </div>

          {/* Role Selector & Top Actions */}
          <div className="flex items-center space-x-3 flex-wrap gap-y-2">
            <div className="space-y-0.5">
              <span className="text-[10px] text-neutral-400 font-mono block">Target Placement Role:</span>
              <select
                aria-label="Select Target Placement Role"
                value={targetRole}
                onChange={(e) => {
                  setTargetRole(e.target.value);
                  progressService.updateProfile({ targetRole: e.target.value });
                }}
                disabled={testMode === 'active'}
                className="bg-neutral-900 text-xs font-semibold text-white border border-neutral-800 rounded-xl px-3 py-1.5 focus:outline-none cursor-pointer max-w-[220px] truncate"
              >
                {TARGET_JOB_ROLES.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
            </div>

            {testMode === 'active' ? (
              <Button
                variant="outline"
                size="sm"
                onClick={handleBackToOverview}
                className="text-xs border-neutral-800 hover:bg-neutral-900 cursor-pointer text-neutral-300"
              >
                <ArrowLeft className="w-3.5 h-3.5 mr-1" />
                Exit to Overview
              </Button>
            ) : null}
          </div>
        </div>

        {/* LOADING STATE */}
        {isLoadingDaily ? (
          <div className="p-12 text-center text-neutral-400 font-mono text-xs flex flex-col items-center justify-center space-y-2">
            <Loader2 className="w-6 h-6 animate-spin text-emerald-400" />
            <span>Loading today&apos;s role-matched placement questions...</span>
          </div>
        ) : testMode === 'overview' ? (
          /* ================================================================= */
          /* 2. OVERVIEW MODE (DEFAULT VIEW SHOWN FIRST)                       */
          /* ================================================================= */
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="space-y-6"
          >
            {/* LAST / YESTERDAY'S PERFORMANCE HERO CARD (WHEN USER HAS COMPLETED ASSESSMENTS) */}
            {hasCompletedAnyAssessment && lastAssessment ? (
              <div className="rounded-3xl border border-neutral-800 bg-gradient-to-r from-neutral-950 via-neutral-900 to-neutral-950 p-6 sm:p-8 backdrop-blur-xl shadow-2xl space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="space-y-2 text-center md:text-left">
                    <div className="flex flex-wrap items-center gap-2 justify-center md:justify-start">
                      <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-mono text-emerald-400">
                        <Award className="w-3.5 h-3.5" />
                        <span>Last Assessment Benchmark</span>
                      </div>

                      {/* PROMINENT TARGET GOAL BADGE */}
                      <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-xs font-mono font-bold text-cyan-300">
                        <Target className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Target Goal: 65%+ Score Required</span>
                      </div>

                      {/* CONDITIONAL BENCHMARK BADGE (< 65% RULE) */}
                      {lastAssessment.overallScore < 65 ? (
                        <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-rose-500/15 border border-rose-500/30 text-xs font-mono font-bold text-rose-400 animate-pulse">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          <span>Below 65% Target — Retake Recommended</span>
                        </div>
                      ) : (
                        <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-xs font-mono font-bold text-emerald-400">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Benchmark Passed (65%+)</span>
                        </div>
                      )}
                    </div>

                    <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                      Last Score: <span className={lastAssessment.overallScore >= 65 ? 'text-emerald-400' : 'text-rose-400'}>{lastAssessment.overallScore}%</span>
                    </h2>
                    <p className="text-xs sm:text-sm text-neutral-400 max-w-xl">
                      Performance evaluation for <span className="text-white font-semibold">{lastAssessment.role}</span> recorded on{' '}
                      <span className="font-mono text-neutral-300 font-medium">{lastAssessment.date}</span>.
                    </p>
                  </div>

                  {/* ACTION BUTTONS */}
                  <div className="flex flex-wrap items-center justify-center md:justify-end gap-3 shrink-0">
                    {/* Primary Button: "Reset & Retake Assessment" if completed today, else "Start Today's Assessment →" */}
                    {dailyStatus?.completedToday ? (
                      <Button
                        variant="primary"
                        size="md"
                        onClick={handleResetAndRetake}
                        className="cursor-pointer text-xs sm:text-sm font-extrabold bg-gradient-to-r from-emerald-400 to-teal-400 text-black hover:from-emerald-300 hover:to-teal-300 shadow-lg shadow-emerald-500/25 px-5 py-2.5 rounded-full inline-flex items-center gap-2 hover:scale-[1.02] transition-all"
                      >
                        <RotateCcw className="w-4 h-4" />
                        <span>Reset & Retake Assessment</span>
                      </Button>
                    ) : (
                      <>
                        <Button
                          variant="primary"
                          size="md"
                          onClick={handleStartTodayAssessment}
                          className="cursor-pointer text-xs sm:text-sm font-extrabold bg-gradient-to-r from-emerald-400 to-teal-400 text-black hover:from-emerald-300 hover:to-teal-300 shadow-lg shadow-emerald-500/25 px-5 py-2.5 rounded-full inline-flex items-center gap-2 hover:scale-[1.02] transition-all"
                        >
                          <span>Start Today&apos;s Assessment →</span>
                        </Button>

                        {/* Reset & Retake Option: Displayed when score < 65% and assessment pending */}
                        {lastAssessment.overallScore < 65 && (
                          <Button
                            variant="outline"
                            size="md"
                            onClick={handleResetAndRetake}
                            className="cursor-pointer text-xs sm:text-sm font-bold border-amber-500/40 text-amber-300 hover:bg-amber-500/10 px-4 py-2.5 rounded-full inline-flex items-center gap-2 transition-all"
                            title="Clear failed score and retake assessment"
                          >
                            <RotateCcw className="w-4 h-4 text-amber-400" />
                            <span>Reset & Retake Assessment</span>
                          </Button>
                        )}
                      </>
                    )}

                    {/* Generate AI Roadmap Button */}
                    <Button
                      variant="outline"
                      size="md"
                      onClick={() => navigate('/roadmap')}
                      className="cursor-pointer text-xs sm:text-sm border-neutral-700 hover:bg-neutral-900 px-4 py-2.5 rounded-full inline-flex items-center gap-2"
                    >
                      <Compass className="w-4 h-4 text-emerald-400" />
                      <span>Generate AI Roadmap</span>
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              /* CLEAN FRESH START HERO CARD (WHEN USER HAS NEVER COMPLETED AN ASSESSMENT) */
              <div className="rounded-3xl border border-neutral-800 bg-gradient-to-r from-neutral-950 via-neutral-900 to-neutral-950 p-6 sm:p-8 backdrop-blur-xl shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="space-y-2.5 text-center md:text-left">
                  <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-mono text-emerald-400">
                    <Target className="w-3.5 h-3.5" />
                    <span>Placement Diagnostic Benchmark</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                    Placement Readiness Assessment
                  </h2>
                  <p className="text-xs sm:text-sm text-neutral-300 max-w-xl font-medium">
                    Target Benchmark: Score 65% or above to unlock full placement readiness.
                  </p>
                  <p className="text-xs text-neutral-400 max-w-xl leading-relaxed">
                    Test your Aptitude, <span className="text-emerald-400 font-semibold">{targetRole}</span> Technical Core, 3 Live Coding Problems with real in-browser execution, and Behavioral HR.
                  </p>
                </div>

                <Button
                  variant="primary"
                  size="md"
                  onClick={handleStartTodayAssessment}
                  className="cursor-pointer text-xs sm:text-sm font-extrabold bg-gradient-to-r from-emerald-400 to-teal-400 text-black hover:from-emerald-300 hover:to-teal-300 shadow-lg shadow-emerald-500/25 px-6 py-3.5 rounded-full inline-flex items-center gap-2 shrink-0 hover:scale-[1.02] transition-all"
                >
                  <span>Start Today&apos;s Assessment →</span>
                </Button>
              </div>
            )}

            {/* RECOMMENDED STUDY PLAN & TOPICS TO IMPROVE (< 65% BENCHMARK) */}
            {hasCompletedAnyAssessment && lastAssessment && weakCategoriesPlan.length > 0 && (
              <div className="rounded-3xl border border-amber-500/30 bg-gradient-to-r from-amber-500/10 via-neutral-950 to-neutral-900 p-6 sm:p-7 backdrop-blur-xl shadow-xl space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
                  <div className="flex items-center space-x-3">
                    <div className="p-2.5 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400">
                      <AlertTriangle className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2 flex-wrap">
                        <span>What to Study &amp; Topics to Improve (Phase 1 → Phase 4)</span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          Score &lt; 65% Target
                        </span>
                      </h3>
                      <p className="text-xs text-neutral-400">
                        Targeted curriculum based on your diagnostic results for <span className="text-white font-medium">{lastAssessment.role}</span>.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                  {weakCategoriesPlan.map((plan, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-2xl bg-neutral-950/70 border border-neutral-800 space-y-3 flex flex-col justify-between"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-white">
                            {plan.category}
                          </span>
                          <span className="font-mono text-xs font-extrabold px-2 py-0.5 rounded-md bg-rose-500/15 text-rose-400 border border-rose-500/30">
                            {plan.score}%
                          </span>
                        </div>
                        <div className="space-y-1">
                          <span className="text-[10px] font-mono uppercase text-neutral-400 font-semibold block">
                            Recommended Focus Topics:
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {plan.topics.map((t, tIdx) => (
                              <span
                                key={tIdx}
                                className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-[11px] text-neutral-300"
                              >
                                {t}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="pt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(plan.link)}
                          className="w-full text-xs font-bold border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 cursor-pointer justify-center"
                        >
                          {plan.linkLabel}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 4-CATEGORY SCORE BREAKDOWN CARDS */}
            {lastAssessment && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* 1. Aptitude & Logic */}
                <div className="p-5 rounded-2xl border border-neutral-800 bg-neutral-950/80 backdrop-blur-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="p-2 rounded-xl bg-white/5 text-emerald-400">
                      <Calculator className="w-4 h-4" />
                    </div>
                    <span className="font-mono text-xl font-extrabold text-white">
                      {lastAssessment.aptitudeScore}%
                    </span>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Aptitude &amp; Reasoning</h4>
                    <p className="text-[11px] text-neutral-400">Quant, Logical, Verbal &amp; DI</p>
                  </div>
                  <div className="w-full bg-neutral-900 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-emerald-400 h-full rounded-full transition-all duration-500"
                      style={{ width: `${lastAssessment.aptitudeScore}%` }}
                    />
                  </div>
                </div>

                {/* 2. Coding & DSA */}
                <div className="p-5 rounded-2xl border border-neutral-800 bg-neutral-950/80 backdrop-blur-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="p-2 rounded-xl bg-white/5 text-teal-400">
                      <Code2 className="w-4 h-4" />
                    </div>
                    <span className="font-mono text-xl font-extrabold text-white">
                      {lastAssessment.codingScore}%
                    </span>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Coding & DSA</h4>
                    <p className="text-[11px] text-neutral-400">Live Browser Test-Case Scoring</p>
                  </div>
                  <div className="w-full bg-neutral-900 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-teal-400 h-full rounded-full transition-all duration-500"
                      style={{ width: `${lastAssessment.codingScore}%` }}
                    />
                  </div>
                </div>

                {/* 3. CS Technical Core */}
                <div className="p-5 rounded-2xl border border-neutral-800 bg-neutral-950/80 backdrop-blur-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="p-2 rounded-xl bg-white/5 text-cyan-400">
                      <Cpu className="w-4 h-4" />
                    </div>
                    <span className="font-mono text-xl font-extrabold text-white">
                      {lastAssessment.technicalScore}%
                    </span>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">CS Technical Core</h4>
                    <p className="text-[11px] text-neutral-400 truncate max-w-[180px]">{lastAssessment.role}</p>
                  </div>
                  <div className="w-full bg-neutral-900 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-cyan-400 h-full rounded-full transition-all duration-500"
                      style={{ width: `${lastAssessment.technicalScore}%` }}
                    />
                  </div>
                </div>

                {/* 4. HR & Communication */}
                <div className="p-5 rounded-2xl border border-neutral-800 bg-neutral-950/80 backdrop-blur-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="p-2 rounded-xl bg-white/5 text-indigo-400">
                      <Users className="w-4 h-4" />
                    </div>
                    <span className="font-mono text-xl font-extrabold text-white">
                      {lastAssessment.hrScore}%
                    </span>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">HR & Communication</h4>
                    <p className="text-[11px] text-neutral-400">STAR Behavioral Scenarios</p>
                  </div>
                  <div className="w-full bg-neutral-900 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-indigo-400 h-full rounded-full transition-all duration-500"
                      style={{ width: `${lastAssessment.hrScore}%` }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* =============================================================== */}
            {/* "WHAT WENT WRONG" — DETAILED MISTAKE REVIEW SECTION              */}
            {/* =============================================================== */}
            {lastAssessment && (
              <div className="rounded-3xl border border-neutral-800 bg-neutral-950/80 p-5 sm:p-7 backdrop-blur-xl shadow-xl space-y-4">
                <div
                  onClick={() => setIsMistakesOpen((prev) => !prev)}
                  className="flex items-center justify-between cursor-pointer select-none pb-2 border-b border-neutral-800/80"
                >
                  <div className="flex items-center space-x-2.5">
                    <div className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400">
                      <XCircle className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm sm:text-base font-bold text-white tracking-tight flex items-center gap-2">
                        <span>{mistakeSectionTitle}</span>
                        {lastAssessment.wrongQuestions && lastAssessment.wrongQuestions.length > 0 && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-rose-500/20 text-rose-300 font-bold border border-rose-500/30">
                            {lastAssessment.wrongQuestions.length} Questions
                          </span>
                        )}
                      </h3>
                      <p className="text-[11px] text-neutral-400">
                        Review exact question errors, correct choices, and coding fixes before taking today&apos;s test.
                      </p>
                    </div>
                  </div>

                  <div className="p-1.5 rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white transition-colors">
                    {isMistakesOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </div>

                <AnimatePresence>
                  {isMistakesOpen && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-3.5 pt-2 max-h-[460px] overflow-y-auto pr-1 no-scrollbar"
                    >
                      {lastAssessment.wrongQuestions && lastAssessment.wrongQuestions.length > 0 ? (
                        lastAssessment.wrongQuestions.map((item, idx) => (
                          <div
                            key={item.id || idx}
                            className="p-4 rounded-2xl border border-neutral-800/80 bg-neutral-900/60 backdrop-blur-md space-y-3 text-xs"
                          >
                            <div className="flex items-center justify-between gap-2 flex-wrap">
                              <div className="flex items-center space-x-2">
                                <span
                                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase border ${item.category === 'Aptitude'
                                    ? 'bg-amber-500/10 text-amber-300 border-amber-500/25'
                                    : item.category === 'Technical'
                                      ? 'bg-cyan-500/10 text-cyan-300 border-cyan-500/25'
                                      : item.category === 'Coding'
                                        ? 'bg-teal-500/10 text-teal-300 border-teal-500/25'
                                        : 'bg-indigo-500/10 text-indigo-300 border-indigo-500/25'
                                    }`}
                                >
                                  {item.category}
                                </span>
                                <span className="font-mono text-neutral-300 text-[11px] font-semibold">
                                  {item.topic}
                                </span>
                              </div>
                              <span className="text-[10px] text-neutral-500 font-mono">
                                Question #{idx + 1}
                              </span>
                            </div>

                            {/* Question Prompt */}
                            <p className="text-white font-medium leading-relaxed text-xs sm:text-sm">
                              {item.question}
                            </p>

                            {/* Answer Comparison */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 font-mono text-[11px]">
                              <div className="p-2.5 rounded-xl bg-rose-950/20 border border-rose-500/30 text-rose-300 space-y-0.5">
                                <span className="text-[10px] text-rose-400 font-bold block uppercase tracking-wider">
                                  Your Answer:
                                </span>
                                <span className="block truncate font-semibold">{item.userAnswer}</span>
                              </div>

                              <div className="p-2.5 rounded-xl bg-emerald-950/20 border border-emerald-500/30 text-emerald-300 space-y-0.5">
                                <span className="text-[10px] text-emerald-400 font-bold block uppercase tracking-wider">
                                  Correct Answer:
                                </span>
                                <span className="block truncate font-semibold">{item.correctAnswer}</span>
                              </div>
                            </div>

                            {/* Explanation Strategy */}
                            {item.explanation && (
                              <div className="p-3 rounded-xl bg-neutral-950/70 border border-neutral-800/80 text-[11px] text-neutral-300 leading-relaxed space-y-1">
                                <span className="text-amber-400 font-bold block text-[10px] uppercase tracking-wider">
                                  💡 Key Fix & Explanation:
                                </span>
                                <p>{item.explanation}</p>
                              </div>
                            )}
                          </div>
                        ))
                      ) : lastAssessment.overallScore === 100 ? (
                        <div className="py-8 text-center text-xs text-neutral-400 space-y-2">
                          <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
                          <p className="font-semibold text-white">Outstanding! 100% Benchmark Score</p>
                          <p className="text-neutral-500">Zero mistakes recorded on your last assessment.</p>
                        </div>
                      ) : (
                        <div className="py-6 text-center text-xs text-neutral-400 space-y-1">
                          <HelpCircle className="w-6 h-6 text-neutral-500 mx-auto" />
                          <p className="text-neutral-300">
                            Detailed question-by-question mistake breakdown will be logged on your next completed daily test.
                          </p>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* STRENGTHS, WEAKNESSES & SKILL GAPS */}
            {lastAssessment && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Strengths */}
                <div className="rounded-2xl border border-neutral-800 bg-neutral-950/80 p-5 backdrop-blur-xl space-y-4">
                  <div className="flex items-center space-x-2 text-sm font-bold text-emerald-400">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Identified Strengths (&ge; 70%)</span>
                  </div>
                  <div className="space-y-2">
                    {lastAssessment.strengths && lastAssessment.strengths.length > 0 ? (
                      lastAssessment.strengths.map((item: string, idx: number) => (
                        <div
                          key={idx}
                          className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-neutral-200 font-medium"
                        >
                          {item}
                        </div>
                      ))
                    ) : (
                      <div className="text-xs text-neutral-500">Focus on daily tests to build core strengths.</div>
                    )}
                  </div>
                </div>

                {/* Areas Needing Work */}
                <div className="rounded-2xl border border-neutral-800 bg-neutral-950/80 p-5 backdrop-blur-xl space-y-4">
                  <div className="flex items-center space-x-2 text-sm font-bold text-amber-400">
                    <AlertTriangle className="w-4 h-4" />
                    <span>Areas Needing Work (&lt; 70%)</span>
                  </div>
                  <div className="space-y-2">
                    {lastAssessment.weaknesses && lastAssessment.weaknesses.length > 0 ? (
                      lastAssessment.weaknesses.map((item: string, idx: number) => (
                        <div
                          key={idx}
                          className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-neutral-200 font-medium"
                        >
                          {item}
                        </div>
                      ))
                    ) : (
                      <div className="text-xs text-emerald-400">All sections performed above 70%!</div>
                    )}
                  </div>
                </div>

                {/* Role Skill Gaps */}
                <div className="rounded-2xl border border-neutral-800 bg-neutral-950/80 p-5 backdrop-blur-xl space-y-4">
                  <div className="flex items-center space-x-2 text-sm font-bold text-rose-400">
                    <Target className="w-4 h-4" />
                    <span>Role Skill Gaps ({lastAssessment.role})</span>
                  </div>
                  <div className="space-y-2">
                    {lastAssessment.skillGaps && lastAssessment.skillGaps.length > 0 ? (
                      lastAssessment.skillGaps.map((item: string, idx: number) => (
                        <div
                          key={idx}
                          className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-neutral-200 font-medium"
                        >
                          {item}
                        </div>
                      ))
                    ) : (
                      <div className="text-xs text-neutral-500">No major critical skill gaps detected.</div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* DAILY ASSESSMENT HISTORY (SQLITE PERSISTED) */}
            <div className="rounded-3xl border border-neutral-800 bg-neutral-950/80 p-6 sm:p-8 backdrop-blur-xl shadow-xl space-y-4">
              <div className="flex items-center space-x-2.5 pb-2 border-b border-neutral-800">
                <h3 className="text-base font-bold text-white tracking-tight">
                  Daily Assessment History
                </h3>
              </div>

              {history.length === 0 ? (
                <div className="text-center py-6 text-neutral-500 text-xs font-mono">
                  No previous assessment records found in database. Complete today&apos;s assessment to log your first record!
                </div>
              ) : (
                <div className="divide-y divide-neutral-800/80">
                  {history.map((item) => (
                    <div
                      key={item.id}
                      className="py-3.5 flex items-center justify-between gap-4 flex-wrap text-xs"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2 font-mono">
                          <span className="font-bold text-white">{item.assessment_date}</span>
                          <span className="text-neutral-500">•</span>
                          <span className="text-emerald-400 font-medium">{item.role}</span>
                        </div>
                        <div className="text-[11px] text-neutral-400 flex items-center space-x-3 font-mono">
                          <span>Apt: {Math.round(item.aptitude_score)}%</span>
                          <span>Code: {Math.round(item.coding_score)}%</span>
                          <span>Tech: {Math.round(item.technical_score)}%</span>
                          <span>HR: {Math.round(item.hr_score)}%</span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3 shrink-0">
                        <div className="text-right">
                          <span className="text-base font-extrabold text-white font-mono">
                            {Math.round(item.overall_score)}%
                          </span>
                          <span className="text-[10px] text-neutral-500 block">Overall Score</span>
                        </div>
                        <span
                          className={`px-2.5 py-1 rounded-full text-[11px] font-mono font-bold border ${item.overall_score >= 65
                            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                            : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
                            }`}
                        >
                          {item.overall_score >= 65 ? 'Passed' : 'Below 65%'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        ) : (
          /* ================================================================= */
          /* 3. ACTIVE TEST MODE (COUNTDOWN TIMER & 12 UNIFORM BUTTONS)        */
          /* ================================================================= */
          questions.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className="space-y-6"
            >
              {/* QUESTION STEPPER PALETTE */}
              <div className="p-5 rounded-3xl border border-neutral-800 bg-neutral-950/80 backdrop-blur-xl shadow-xl space-y-4">
                <div className="flex items-center justify-between text-xs text-neutral-400 flex-wrap gap-2">
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={handleBackToOverview}
                      className="px-3 py-1 rounded-xl border border-neutral-800 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 text-xs flex items-center gap-1 cursor-pointer transition-colors"
                      title="Return to Assessment Overview"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Overview</span>
                    </button>
                    <span>
                      Question {currentQuestionIndex + 1} of {questions.length} (
                      <span className="text-emerald-400 font-bold uppercase">{currentQ?.section}</span>)
                    </span>
                  </div>

                  <div className="flex items-center space-x-3 font-mono">
                    <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-neutral-900 border border-neutral-800 text-amber-400 font-bold">
                      <Clock className="w-4 h-4 text-emerald-400 animate-pulse" />
                      <span>{formatTime(secondsRemaining)}</span>
                    </div>
                    <span className="text-emerald-400 font-semibold hidden sm:inline">
                      {answeredCount} / {questions.length} Completed
                    </span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-neutral-900 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-300"
                    style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
                  />
                </div>

                {/* UNIFORM FIXED SQUARE QUESTION NUMBER PALETTE (w-9 h-9) */}
                <div className="flex flex-wrap gap-2 pt-1 items-center">
                  {questions.map((q, idx) => {
                    const isCurrent = idx === currentQuestionIndex;
                    const isAnswered =
                      q.questionType === 'coding'
                        ? Boolean(codeRunResults[q.id])
                        : selectedAnswers[q.id] !== undefined;

                    return (
                      <button
                        key={q.id}
                        type="button"
                        onClick={() => setCurrentQuestionIndex(idx)}
                        className={`w-9 h-9 flex items-center justify-center rounded-lg text-xs font-mono font-bold shrink-0 transition-all cursor-pointer ${isCurrent
                          ? 'bg-white text-black ring-2 ring-emerald-400 shadow-lg scale-105'
                          : isAnswered
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30'
                            : 'bg-neutral-900 text-neutral-400 border border-neutral-800 hover:border-neutral-700 hover:text-white'
                          }`}
                      >
                        {idx + 1}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* CURRENT QUESTION CARD */}
              {currentQ && (
                <motion.div
                  key={currentQ.id}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2 }}
                  className="rounded-3xl border border-neutral-800 bg-neutral-950/80 p-6 sm:p-8 backdrop-blur-xl shadow-xl space-y-6"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono px-2.5 py-1 rounded-full bg-neutral-900 border border-neutral-800 text-neutral-300 font-semibold uppercase">
                      {currentQ.sectionTitle || currentQ.section} • {currentQ.topic}
                    </span>
                    <span className="text-xs text-neutral-500 font-mono">
                      Q{currentQuestionIndex + 1} of {questions.length}
                    </span>
                  </div>

                  <h3 className="text-base sm:text-lg font-semibold text-white leading-relaxed">
                    {currentQ.question}
                  </h3>

                  {/* 1. MCQ OPTIONS (Aptitude, Technical, HR) */}
                  {currentQ.questionType === 'mcq' && currentQ.options && (
                    <div className="space-y-3 pt-2">
                      {currentQ.options.map((opt, optIdx) => {
                        const isSelected = selectedAnswers[currentQ.id] === optIdx;

                        return (
                          <div
                            key={optIdx}
                            onClick={() => handleSelectOption(currentQ.id, optIdx)}
                            className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between text-xs sm:text-sm ${isSelected
                              ? 'bg-emerald-500/15 border-emerald-500/50 text-white font-medium shadow-md'
                              : 'bg-neutral-900/60 border-neutral-800 text-neutral-300 hover:bg-neutral-900 hover:border-neutral-700'
                              }`}
                          >
                            <div className="flex items-center space-x-3">
                              <span
                                className={`w-6 h-6 rounded-lg text-xs font-mono font-bold flex items-center justify-center shrink-0 ${isSelected
                                  ? 'bg-emerald-400 text-black'
                                  : 'bg-neutral-800 text-neutral-400'
                                  }`}
                              >
                                {String.fromCharCode(65 + optIdx)}
                              </span>
                              <span>{opt}</span>
                            </div>

                            {isSelected && <Check className="w-4 h-4 text-emerald-400 shrink-0" />}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* 2. LIVE CODING RUNNER (5 Languages) */}
                  {currentQ.questionType === 'coding' && (
                    <div className="space-y-4 pt-2">
                      <div className="flex items-center justify-between flex-wrap gap-2 pb-2 border-b border-neutral-800">
                        <div className="flex items-center space-x-2">
                          <Terminal className="w-4 h-4 text-emerald-400" />
                          <span className="text-xs font-mono text-neutral-300">
                            {(codeLanguages[currentQ.id] === 'python' || codeLanguages[currentQ.id] === 'javascript' || !codeLanguages[currentQ.id])
                              ? 'Live Browser Runner'
                              : 'Online Compiler Judge'}
                          </span>
                        </div>

                        {/* 5-Language Selector */}
                        <div className="flex items-center space-x-1.5 bg-neutral-900 p-1 rounded-xl border border-neutral-800 text-xs flex-wrap">
                          {LANGUAGE_OPTIONS.map((lang) => {
                            const isSelected = (codeLanguages[currentQ.id] || 'python') === lang.id;
                            return (
                              <button
                                key={lang.id}
                                type="button"
                                onClick={() => handleLanguageChange(currentQ.id, lang.id)}
                                className={`px-2.5 py-1 rounded-lg font-mono transition-colors cursor-pointer text-xs ${isSelected
                                  ? 'bg-emerald-400 text-black font-bold shadow-xs'
                                  : 'text-neutral-400 hover:text-white'
                                  }`}
                              >
                                {lang.label}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Code Area */}
                      <div className="relative rounded-2xl overflow-hidden border border-neutral-800 bg-neutral-950">
                        <textarea
                          value={codeSolutions[currentQ.id] || ''}
                          onChange={(e) =>
                            setCodeSolutions((prev) => ({
                              ...prev,
                              [currentQ.id]: e.target.value,
                            }))
                          }
                          rows={8}
                          spellCheck={false}
                          className="w-full bg-transparent text-emerald-300 font-mono text-xs sm:text-sm p-4 focus:outline-none resize-y leading-relaxed"
                          placeholder="// Write your solution function here..."
                        />
                      </div>

                      {/* Action Bar: Run Test Cases */}
                      <div className="flex items-center justify-between flex-wrap gap-3">
                        <div className="text-xs font-mono text-neutral-400">
                          {pythonStatuses[currentQ.id] && (
                            <span className="text-amber-400 animate-pulse flex items-center gap-1.5">
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              {pythonStatuses[currentQ.id]}
                            </span>
                          )}
                        </div>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRunCodingTest(currentQ)}
                          disabled={isEvaluatingCode[currentQ.id]}
                          className="cursor-pointer border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/10 text-xs font-bold"
                        >
                          {isEvaluatingCode[currentQ.id] ? (
                            <>
                              <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                              Running Test Cases...
                            </>
                          ) : (
                            <>
                              <Play className="w-3.5 h-3.5 mr-1.5 text-emerald-400 fill-emerald-400" />
                              Run Test Cases
                            </>
                          )}
                        </Button>
                      </div>

                      {/* Live Output Feedback */}
                      {codeRunResults[currentQ.id] && (
                        <div className="mt-3 p-4 rounded-2xl bg-neutral-900/80 border border-neutral-800 space-y-3 font-mono text-xs">
                          <div className="flex items-center justify-between">
                            <span className="flex items-center space-x-2">
                              <span
                                className={`h-2.5 w-2.5 rounded-full ${codeRunResults[currentQ.id].status === 'Passed'
                                  ? 'bg-emerald-400'
                                  : 'bg-rose-400'
                                  }`}
                              />
                              <span className="font-bold text-white">
                                {codeRunResults[currentQ.id].status === 'Passed'
                                  ? 'All Test Cases Passed!'
                                  : 'Test Cases Failed / Output Mismatch'}
                              </span>
                            </span>
                            <span className="text-xs font-bold text-white">
                              {codeRunResults[currentQ.id].passedTests} / {codeRunResults[currentQ.id].totalTests} Passed
                            </span>
                          </div>

                          {/* Test Cases Details */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                            {codeRunResults[currentQ.id].details.map((d, idx) => (
                              <div
                                key={idx}
                                className={`p-3 rounded-xl border text-[11px] space-y-1 ${d.passed
                                  ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-300'
                                  : 'bg-rose-950/20 border-rose-500/30 text-rose-300'
                                  }`}
                              >
                                <div className="flex items-center justify-between font-bold">
                                  <span>Case {d.caseIndex}</span>
                                  <span>{d.passed ? '✓ Passed' : '✗ Failed'}</span>
                                </div>
                                <div className="text-neutral-400 truncate">Input: {d.input}</div>
                                <div className="truncate">Expected: {d.expectedOutput}</div>
                                <div className="truncate">Actual: {d.actualOutput}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* BOTTOM NAVIGATION ACTIONS */}
                  <div className="flex items-center justify-between pt-6 border-t border-neutral-800/80">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))}
                      disabled={currentQuestionIndex === 0}
                      className="text-xs border-neutral-800 hover:bg-neutral-900 cursor-pointer"
                    >
                      <ArrowLeft className="w-3.5 h-3.5 mr-1" />
                      Previous
                    </Button>

                    {currentQuestionIndex < questions.length - 1 ? (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => setCurrentQuestionIndex((prev) => Math.min(questions.length - 1, prev + 1))}
                        className="text-xs bg-emerald-400 text-black hover:bg-emerald-300 font-bold cursor-pointer"
                      >
                        Next Question
                        <ArrowRight className="w-3.5 h-3.5 ml-1" />
                      </Button>
                    ) : (
                      <Button
                        variant="primary"
                        size="md"
                        onClick={handleSubmit}
                        className="text-xs sm:text-sm bg-gradient-to-r from-emerald-400 to-teal-400 text-black font-extrabold cursor-pointer shadow-lg shadow-emerald-500/20"
                      >
                        <Send className="w-4 h-4 mr-1.5" />
                        Submit Daily Assessment
                      </Button>
                    )}
                  </div>
                </motion.div>
              )}
            </motion.div>
          )
        )}
      </div>
    </DashboardLayout>
  );
};

export default AssessmentPage;
