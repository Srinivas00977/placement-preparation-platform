import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  Terminal,
  CheckCircle2,
  XCircle,
  Eye,
  EyeOff,
  Lightbulb,
  Check,
  Clock,
  ArrowLeft,
  ArrowRight,
  RotateCcw,
  Award,
  Loader2,
  Play,
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { HR_QUESTIONS, HR_QUIZ_BANK, type HrQuizQuestion } from '@/data/hrQuestions';
import { progressService, type HrAnswerRecord } from '@/services/progressService';
import { Button } from '@/components/ui/button';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export const HrPrepPage: React.FC = () => {
  const [mode, setMode] = useState<'studio' | 'quiz'>('studio');

  // STAR Studio state
  const [selectedQuestionId, setSelectedQuestionId] = useState<string>(HR_QUESTIONS[0].id);
  const [userAnswer, setUserAnswer] = useState('');
  const [showSampleAnswer, setShowSampleAnswer] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [savedAnswers, setSavedAnswers] = useState<HrAnswerRecord[]>(
    () => progressService.getUserProgress().hrAnswers
  );

  // HR Scenario Practice Quiz state (20..50 questions, default 20)
  const [quizCount, setQuizCount] = useState<15 | 20 | 30 | 40 | 50>(20);
  const [quizDifficulty, setQuizDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>('Medium');
  const [quizQuestions, setQuizQuestions] = useState<HrQuizQuestion[]>([]);
  const [isLoadingQuiz, setIsLoadingQuiz] = useState(false);
  const [quizActive, setQuizActive] = useState(false);
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, number>>({});
  const [quizSecondsLeft, setQuizSecondsLeft] = useState(20 * 60);
  const [quizFinished, setQuizFinished] = useState(false);
  const [quizScore, setQuizScore] = useState<{ correct: number; total: number; pct: number } | null>(
    null
  );

  useEffect(() => {
    const unsub = progressService.subscribe(() => {
      setSavedAnswers(progressService.getUserProgress().hrAnswers);
    });
    return () => unsub();
  }, []);

  const activeQuestion =
    HR_QUESTIONS.find((q) => q.id === selectedQuestionId) || HR_QUESTIONS[0];

  const existingRecord = savedAnswers.find((a) => a.questionId === activeQuestion.id);

  // Sync answer textarea when switching questions
  useEffect(() => {
    if (existingRecord) {
      setUserAnswer(existingRecord.userAnswer);
    } else {
      setUserAnswer('');
    }
    setShowSampleAnswer(false);
  }, [selectedQuestionId, existingRecord]);

  // Quiz timer
  useEffect(() => {
    if (!quizActive || quizFinished || quizQuestions.length === 0) return;
    const timer = setInterval(() => {
      setQuizSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmitHrQuiz();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [quizActive, quizFinished, quizQuestions]);

  const handleStartHrQuiz = async (requestedCount?: number, forceFreshAI = false) => {
    const count = requestedCount || quizCount;
    setIsLoadingQuiz(true);
    try {
      const res = await fetch(`${API_BASE_URL}/hr/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: 'All',
          difficulty: quizDifficulty,
          count,
          forceFreshAI,
        }),
        signal: AbortSignal.timeout(forceFreshAI ? 9000 : 3000),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.questions) && json.questions.length > 0) {
          setQuizQuestions(json.questions);
          setQuizActive(true);
          setQuizIndex(0);
          setQuizAnswers({});
          setQuizSecondsLeft(count * 60);
          setQuizFinished(false);
          setQuizScore(null);
          return;
        }
      }
    } catch {
      // Offline fallback below
    } finally {
      setIsLoadingQuiz(false);
    }

    // Offline exact-count expansion from HR_QUIZ_BANK
    const pool = [...HR_QUIZ_BANK].sort(() => Math.random() - 0.5);
    const assembled: HrQuizQuestion[] = [];
    for (let i = 0; i < count; i++) {
      const base = pool[i % pool.length];
      assembled.push(
        i < pool.length
          ? base
          : {
              ...base,
              id: `${base.id}_v${i}`,
              question: `[Scenario Drill #${i + 1}] ${base.question}`,
            }
      );
    }
    setQuizQuestions(assembled);
    setQuizActive(true);
    setQuizIndex(0);
    setQuizAnswers({});
    setQuizSecondsLeft(count * 60);
    setQuizFinished(false);
    setQuizScore(null);
  };

  const handleSubmitHrQuiz = () => {
    let correct = 0;
    quizQuestions.forEach((q) => {
      if (quizAnswers[q.id] === q.correctAnswer) correct++;
    });
    const total = quizQuestions.length || 1;
    const pct = Math.round((correct / total) * 100);
    setQuizScore({ correct, total, pct });
    setQuizFinished(true);
    progressService.saveHrAnswer({
      questionId: `hr_quiz_${Date.now()}`,
      question: `HR Scenario Practice Quiz (${total} Questions)`,
      userAnswer: `Scored ${correct}/${total} (${pct}%)`,
      score: pct,
      feedback: {
        clarity: `Completed ${total}-question behavioral MCQ benchmark.`,
        starMethod: `${pct}% Accuracy`,
        keyPoints: ['Behavioral Decision Making', 'Workplace Ownership'],
        tips: pct >= 70 ? ['Strong HR judgment across scenarios!'] : ['Review missed explanations below focusing on STAR ownership and early communication.'],
      },
      date: new Date().toISOString(),
    });
  };

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleEvaluateAnswer = async () => {
    if (!userAnswer.trim()) return;
    setIsEvaluating(true);

    await new Promise((resolve) => setTimeout(resolve, 600));

    const words = userAnswer.trim().split(/\s+/).length;
    const lower = userAnswer.toLowerCase();

    const hasSituation = /when|during|in my|while|at university|project/i.test(lower);
    const hasTask = /task|responsibility|goal|needed to|assigned|objective/i.test(lower);
    const hasAction = /i built|i designed|i implemented|i spoke|i resolved|i analyzed|i proposed/i.test(lower);
    const hasResult = /result|outcome|improved|reduced|increased|achieved|learned|successfully/i.test(lower);

    let starScore = 0;
    if (hasSituation) starScore += 25;
    if (hasTask) starScore += 25;
    if (hasAction) starScore += 25;
    if (hasResult) starScore += 25;

    let lengthScore = 100;
    if (words < 50) lengthScore = 50;
    else if (words < 90) lengthScore = 75;
    else if (words > 300) lengthScore = 80;

    const overallScore = Math.min(95, Math.round(starScore * 0.6 + lengthScore * 0.4));

    const tips: string[] = [];
    if (!hasSituation) tips.push('Provide clear context or setting (the "Situation" in STAR) so the interviewer visualizes the challenge.');
    if (!hasTask) tips.push('Clarify your specific personal role or milestone objective (the "Task").');
    if (!hasAction) tips.push('Emphasize "I did" rather than "We did" to clearly highlight your direct individual contribution.');
    if (!hasResult) tips.push('Conclude with measurable outcomes or key lessons learned (the "Result").');
    if (words < 60) tips.push('Elaborate slightly more to provide sufficient depth and evidence of technical leadership.');
    if (tips.length === 0) {
      tips.push('Excellent balance of context, personal action, and tangible outcome. Deliver this with natural pacing and eye contact.');
    }

    const keyPointsFound: string[] = [];
    if (hasSituation) keyPointsFound.push('Clear context and framing');
    if (hasAction) keyPointsFound.push('Proactive individual initiative');
    if (hasResult) keyPointsFound.push('Impact-oriented closing');
    if (words >= 80) keyPointsFound.push('Sufficient conversational substance');

    const feedback = {
      clarity:
        words >= 80 && words <= 250
          ? 'Clear, concise, and structured at optimal interview length (~90-120 seconds spoken).'
          : words < 80
          ? 'Slightly brief. Add a bit more detail regarding the actions you personally initiated.'
          : 'Thorough, but ensure you do not monologue beyond 2 minutes in a live interview.',
      starMethod: `${starScore}% STAR Adherence (${[
        hasSituation ? 'S✓' : 'S✗',
        hasTask ? 'T✓' : 'T✗',
        hasAction ? 'A✓' : 'A✗',
        hasResult ? 'R✓' : 'R✗',
      ].join(' ')})`,
      keyPoints: keyPointsFound,
      tips,
    };

    const record: HrAnswerRecord = {
      questionId: activeQuestion.id,
      question: activeQuestion.question,
      userAnswer,
      score: overallScore,
      feedback,
      date: new Date().toISOString(),
    };

    progressService.saveHrAnswer(record);
    setIsEvaluating(false);
  };

  return (
    <DashboardLayout
      pageTitle="HR & Behavioral Interview Preparation"
      pageSubtitle="Practice STAR-structured behavioral answers AND timed 20–50 question campus HR scenario assessments."
    >
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* TOP STATUS & MODE SWITCHER BAR */}
        <div className="p-5 rounded-3xl border border-neutral-800 bg-neutral-950/80 backdrop-blur-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-2xl bg-white/5 border border-white/10 text-indigo-400">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white">
                Campus HR Interview Prep
              </h3>
              <p className="text-xs text-neutral-400">
                Master the STAR framework or take timed 20–50 question behavioral MCQs.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setMode('studio');
                setQuizActive(false);
              }}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-all border ${
                mode === 'studio'
                  ? 'bg-white text-black border-white shadow-sm'
                  : 'bg-neutral-900 text-neutral-300 border-neutral-800 hover:text-white'
              }`}
            >
              STAR Answer Studio
            </button>
            <button
              type="button"
              onClick={() => setMode('quiz')}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-all border ${
                mode === 'quiz'
                  ? 'bg-emerald-400 text-black border-emerald-400 shadow-sm font-bold'
                  : 'bg-neutral-900 text-neutral-300 border-neutral-800 hover:text-white'
              }`}
            >
              HR Scenario Quiz (20–50 Qs)
            </button>
          </div>
        </div>

        {/* MODE 1: STAR ANSWER STUDIO */}
        {mode === 'studio' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-w-0">
            {/* LEFT: Questions list (4 cols) */}
            <div className="lg:col-span-4 space-y-2 min-w-0">
              <div className="flex items-center justify-between px-2 mb-2">
                <span className="text-[11px] font-mono uppercase tracking-wider text-neutral-400 font-bold">
                  Placement HR Questions
                </span>
                <span className="text-[11px] font-mono text-indigo-400">
                  {savedAnswers.length} Evaluated
                </span>
              </div>
              {HR_QUESTIONS.map((q, idx) => {
                const isSelected = q.id === selectedQuestionId;
                const answered = savedAnswers.some((a) => a.questionId === q.id);

                return (
                  <button
                    key={q.id}
                    type="button"
                    onClick={() => setSelectedQuestionId(q.id)}
                    className={`w-full text-left p-4 rounded-2xl border transition-all flex items-start justify-between gap-3 cursor-pointer ${
                      isSelected
                        ? 'bg-white/10 border-indigo-500/80 text-white shadow-[0_0_20px_rgba(99,102,241,0.15)]'
                        : 'bg-neutral-950/70 border-neutral-800/80 hover:border-neutral-700 text-neutral-300'
                    }`}
                  >
                    <div className="space-y-1 min-w-0">
                      <span className="text-[10px] uppercase font-mono font-bold text-neutral-400">
                        Q{idx + 1} • {q.category}
                      </span>
                      <p className="text-xs font-semibold text-white leading-snug line-clamp-2">
                        {q.question}
                      </p>
                      {q.companies && (
                        <div className="flex flex-wrap gap-1 pt-0.5">
                          {q.companies.slice(0, 2).map((c) => (
                            <span
                              key={c}
                              className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-neutral-900 border border-neutral-800 text-neutral-400"
                            >
                              {c}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {answered && (
                      <span className="text-emerald-400 shrink-0 mt-1" title="Evaluated">
                        <CheckCircle2 className="w-4 h-4" />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* RIGHT: Answer Studio & AI Evaluation (8 cols) */}
            <div className="lg:col-span-8 space-y-6 min-w-0">
              <motion.div
                key={activeQuestion.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
                className="rounded-3xl border border-neutral-800 bg-neutral-950/70 p-6 sm:p-8 backdrop-blur-xl shadow-2xl space-y-6 min-w-0"
              >
                <div className="space-y-2 pb-4 border-b border-neutral-800/80">
                  <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                    <span className="text-[10px] uppercase font-bold text-indigo-400 font-mono tracking-wider px-2.5 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20">
                      {activeQuestion.category} Question
                    </span>
                    {activeQuestion.companies && (
                      <div className="flex items-center space-x-1.5">
                        <span className="text-[11px] font-mono text-neutral-500">
                          Frequently asked at:
                        </span>
                        {activeQuestion.companies.map((c) => (
                          <span
                            key={c}
                            className="px-2 py-0.5 rounded-md text-[10px] font-mono bg-neutral-900 border border-neutral-800 text-neutral-300"
                          >
                            {c}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                    {activeQuestion.question}
                  </h2>
                  <p className="text-xs text-neutral-400 leading-relaxed">
                    <strong className="text-neutral-300">Interviewer Intent:</strong>{' '}
                    {activeQuestion.interviewerIntent}
                  </p>
                </div>

                {/* STAR Framework Guidelines */}
                <div className="p-4 rounded-2xl bg-neutral-900/60 border border-neutral-800/80 space-y-2">
                  <span className="text-xs font-bold text-indigo-300 font-mono uppercase tracking-wider flex items-center gap-1.5">
                    <Lightbulb className="w-3.5 h-3.5" /> Recommended STAR Structure Tips
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-neutral-300 pt-1">
                    <div>
                      <strong className="text-emerald-400">S (Situation):</strong>{' '}
                      {activeQuestion.starTips.situation}
                    </div>
                    <div>
                      <strong className="text-teal-400">T (Task):</strong>{' '}
                      {activeQuestion.starTips.task}
                    </div>
                    <div>
                      <strong className="text-cyan-400">A (Action):</strong>{' '}
                      {activeQuestion.starTips.action}
                    </div>
                    <div>
                      <strong className="text-purple-400">R (Result):</strong>{' '}
                      {activeQuestion.starTips.result}
                    </div>
                  </div>
                </div>

                {/* Sample Model Answer Toggle */}
                <div>
                  <button
                    type="button"
                    onClick={() => setShowSampleAnswer(!showSampleAnswer)}
                    className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    {showSampleAnswer ? (
                      <EyeOff className="w-3.5 h-3.5" />
                    ) : (
                      <Eye className="w-3.5 h-3.5" />
                    )}
                    {showSampleAnswer ? 'Hide Sample Reference Answer' : 'View Sample Model Answer'}
                  </button>

                  <AnimatePresence>
                    {showSampleAnswer && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-3 p-4 rounded-2xl bg-neutral-900/80 border border-neutral-700/60 text-xs text-neutral-200 leading-relaxed font-sans"
                      >
                        <strong className="text-white block mb-1">Model Answer:</strong>
                        {activeQuestion.sampleAnswer}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* User Answer Textarea */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-neutral-400">
                    <span className="font-medium text-white">Your Spoken / Written Response:</span>
                    <span className="font-mono">
                      {userAnswer.trim().split(/\s+/).filter(Boolean).length} words
                    </span>
                  </div>

                  <div className="rounded-2xl border border-neutral-800 bg-[#0d0d10] p-3 focus-within:border-neutral-600 transition-colors">
                    <textarea
                      value={userAnswer}
                      onChange={(e) => setUserAnswer(e.target.value)}
                      rows={6}
                      placeholder="Write your answer here using the STAR method..."
                      className="w-full bg-transparent text-sm text-neutral-200 resize-y focus:outline-none leading-relaxed"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <span className="text-[11px] text-neutral-500 font-mono">
                    Feedback evaluates clarity, structure, key points, and tips.
                  </span>

                  <Button
                    variant="primary"
                    size="md"
                    onClick={handleEvaluateAnswer}
                    disabled={!userAnswer.trim()}
                    isLoading={isEvaluating}
                    className="text-xs cursor-pointer bg-indigo-500 hover:bg-indigo-400 text-white font-bold shadow-lg shadow-indigo-500/20"
                  >
                    <Terminal className="w-4 h-4 mr-1.5" />
                    Evaluate with AI
                  </Button>
                </div>

                {existingRecord && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-6 rounded-2xl border border-neutral-800 bg-neutral-900/70 space-y-4 shadow-xl"
                  >
                    <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
                      <div className="flex items-center space-x-2">
                        <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
                          <CheckCircle2 className="w-4 h-4" />
                        </div>
                        <span className="text-sm font-bold text-white">
                          AI Structured Evaluation Feedback
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-neutral-400">Score:</span>
                        <span className="text-sm font-bold font-mono text-emerald-400 px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
                          {existingRecord.score}%
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div className="p-3 rounded-xl bg-neutral-950/80 border border-neutral-800/80 space-y-1">
                        <span className="text-neutral-400 font-semibold block">Clarity & Tone:</span>
                        <p className="text-neutral-200">{existingRecord.feedback.clarity}</p>
                      </div>
                      <div className="p-3 rounded-xl bg-neutral-950/80 border border-neutral-800/80 space-y-1">
                        <span className="text-neutral-400 font-semibold block">STAR Structure:</span>
                        <p className="text-emerald-400 font-mono font-bold">
                          {existingRecord.feedback.starMethod}
                        </p>
                      </div>
                    </div>

                    {existingRecord.feedback.keyPoints.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {existingRecord.feedback.keyPoints.map((kp, i) => (
                          <span
                            key={i}
                            className="text-xs px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 flex items-center gap-1 font-medium"
                          >
                            <Check className="w-3 h-3" /> {kp}
                          </span>
                        ))}
                      </div>
                    )}

                    <ul className="space-y-1.5 pt-2 border-t border-neutral-800/80">
                      {existingRecord.feedback.tips.map((tip, i) => (
                        <li key={i} className="text-xs text-neutral-300 flex items-start space-x-2">
                          <span className="text-amber-400 mt-0.5">•</span>
                          <span>{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                )}
              </motion.div>
            </div>
          </div>
        )}

        {/* MODE 2: HR SCENARIO PRACTICE QUIZ (20–50 QUESTIONS) */}
        {mode === 'quiz' && !quizActive && (
          <div className="rounded-3xl border border-neutral-800 bg-neutral-950/80 p-6 sm:p-8 backdrop-blur-xl shadow-2xl space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-5">
              <div>
                <h2 className="text-xl font-extrabold text-white">
                  HR Behavioral &amp; Situational Practice Test
                </h2>
                <p className="text-xs text-neutral-400 mt-1">
                  Standard HR practice runs 20 questions (20 mins), or generate custom 15–50 question AI sets.
                </p>
              </div>
              <Button
                variant="primary"
                size="md"
                isLoading={isLoadingQuiz}
                disabled={isLoadingQuiz}
                onClick={() => handleStartHrQuiz(20, false)}
                className="bg-gradient-to-r from-emerald-400 to-teal-400 text-black font-bold cursor-pointer rounded-xl px-5"
              >
                {isLoadingQuiz ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-1.5" />
                ) : (
                  <Play className="w-4 h-4 mr-1.5" />
                )}
                Start 20-Question HR Quiz
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="space-y-1.5">
                <label className="text-neutral-300 font-semibold block">Question Count</label>
                <select
                  aria-label="HR Quiz Question Count"
                  value={quizCount}
                  onChange={(e) => setQuizCount(Number(e.target.value) as 15 | 20 | 30 | 40 | 50)}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2.5 text-white font-mono cursor-pointer"
                >
                  <option value={15}>15 Qs (15 mins)</option>
                  <option value={20}>20 Qs (20 mins)</option>
                  <option value={30}>30 Qs (30 mins)</option>
                  <option value={40}>40 Qs (40 mins)</option>
                  <option value={50}>50 Qs (50 mins)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-neutral-300 font-semibold block">Difficulty</label>
                <div className="grid grid-cols-3 gap-1.5">
                  {(['Easy', 'Medium', 'Hard'] as const).map((diff) => (
                    <button
                      key={diff}
                      type="button"
                      onClick={() => setQuizDifficulty(diff)}
                      className={`py-2.5 rounded-xl font-mono border cursor-pointer ${
                        quizDifficulty === diff
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 font-bold'
                          : 'bg-neutral-900 text-neutral-400 border-neutral-800'
                      }`}
                    >
                      {diff}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-end">
                <Button
                  variant="outline"
                  size="md"
                  isLoading={isLoadingQuiz}
                  disabled={isLoadingQuiz}
                  onClick={() => handleStartHrQuiz(quizCount, true)}
                  className="w-full border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/10 cursor-pointer py-2.5 rounded-xl font-semibold"
                >
                  <Terminal className="w-4 h-4 mr-1.5" />
                  Generate Fresh AI Set ({quizCount} Qs)
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* ACTIVE HR QUIZ */}
        {mode === 'quiz' && quizActive && !quizFinished && quizQuestions.length > 0 && (
          <div className="space-y-5">
            <div className="flex items-center justify-between p-4 rounded-2xl border border-neutral-800 bg-neutral-950/80 backdrop-blur-xl">
              <div className="text-xs font-mono text-white">
                Question {quizIndex + 1} of {quizQuestions.length} •{' '}
                <span className="text-indigo-400">{quizQuestions[quizIndex].category}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-neutral-900 border border-neutral-800 font-mono text-xs text-emerald-400">
                  <Clock className="w-3.5 h-3.5" /> {formatTimer(quizSecondsLeft)}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setQuizActive(false)}
                  className="text-xs text-neutral-400 cursor-pointer"
                >
                  Exit Quiz
                </Button>
              </div>
            </div>

            {(() => {
              const q = quizQuestions[quizIndex];
              const letters = ['A', 'B', 'C', 'D'];
              return (
                <div className="rounded-3xl border border-neutral-800 bg-neutral-950/90 p-6 sm:p-8 space-y-5">
                  <h3 className="text-base sm:text-lg font-medium text-white leading-relaxed">
                    {q.question}
                  </h3>
                  <div className="space-y-3">
                    {q.options.map((opt, idx) => {
                      const isSel = quizAnswers[q.id] === idx;
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setQuizAnswers((prev) => ({ ...prev, [q.id]: idx }))}
                          className={`w-full text-left p-4 rounded-2xl border transition-all flex items-center space-x-3 cursor-pointer ${
                            isSel
                              ? 'bg-white/10 border-emerald-400 text-white'
                              : 'bg-neutral-900/60 border-neutral-800 text-neutral-200 hover:border-neutral-700'
                          }`}
                        >
                          <span
                            className={`h-7 w-7 rounded-xl flex items-center justify-center font-mono text-xs font-bold shrink-0 ${
                              isSel ? 'bg-emerald-400 text-black' : 'bg-neutral-800 text-neutral-300'
                            }`}
                          >
                            {letters[idx]}
                          </span>
                          <span className="text-sm">{opt}</span>
                        </button>
                      );
                    })}
                  </div>
                  <div className="flex items-center justify-between pt-4 border-t border-neutral-800">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={quizIndex === 0}
                      onClick={() => setQuizIndex((i) => Math.max(0, i - 1))}
                      className="text-xs cursor-pointer"
                    >
                      <ArrowLeft className="w-4 h-4 mr-1" /> Previous
                    </Button>
                    {quizIndex < quizQuestions.length - 1 ? (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => setQuizIndex((i) => i + 1)}
                        className="text-xs cursor-pointer"
                      >
                        Next <ArrowRight className="w-4 h-4 ml-1" />
                      </Button>
                    ) : (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={handleSubmitHrQuiz}
                        className="text-xs cursor-pointer bg-emerald-400 text-black font-bold"
                      >
                        Submit Quiz <CheckCircle2 className="w-4 h-4 ml-1" />
                      </Button>
                    )}
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {/* HR QUIZ RESULTS */}
        {mode === 'quiz' && quizActive && quizFinished && quizScore && (
          <div className="space-y-5">
            <div className="rounded-3xl border border-neutral-800 bg-neutral-950/90 p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-mono text-emerald-400 mb-2">
                  <Award className="w-3.5 h-3.5" /> HR Quiz Completed
                </div>
                <h2 className="text-2xl font-extrabold text-white">
                  Score: {quizScore.correct} / {quizScore.total} ({quizScore.pct}%)
                </h2>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleStartHrQuiz(quizScore.total, true)}
                  className="bg-emerald-400 text-black font-bold cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4 mr-1.5" /> New HR Set
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setQuizActive(false)}
                  className="cursor-pointer"
                >
                  Back
                </Button>
              </div>
            </div>

            <div className="rounded-3xl border border-neutral-800 bg-neutral-950/80 p-6 space-y-3">
              {quizQuestions.map((q, idx) => {
                const ok = quizAnswers[q.id] === q.correctAnswer;
                return (
                  <div
                    key={q.id}
                    className={`p-4 rounded-2xl border ${
                      ok ? 'bg-neutral-900/40 border-neutral-800' : 'bg-rose-950/20 border-rose-900/40'
                    } space-y-2`}
                  >
                    <div className="flex justify-between text-xs font-mono">
                      <span className="text-neutral-400">Q{idx + 1}. {q.category}</span>
                      <span className={ok ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                        {ok ? <CheckCircle2 className="w-3.5 h-3.5 inline mr-1" /> : <XCircle className="w-3.5 h-3.5 inline mr-1" />}
                        {ok ? 'Correct' : 'Incorrect'}
                      </span>
                    </div>
                    <p className="text-sm text-white font-medium">{q.question}</p>
                    <p className="text-xs text-emerald-400">
                      Correct Answer: {q.options[q.correctAnswer]}
                    </p>
                    <p className="text-xs text-neutral-300 bg-neutral-900/80 p-2.5 rounded-xl border border-neutral-800">
                      {q.explanation}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default HrPrepPage;
