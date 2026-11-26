import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calculator,
  Clock,
  CheckCircle2,
  XCircle,
  RotateCcw,
  ArrowRight,
  ArrowLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  TrendingUp,
  Award,
  Building2,
  Target,
  Search,
  Layers,
  Terminal,
  Lightbulb,
  Loader2,
  X,
  Play,
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import {
  APTITUDE_SYLLABUS,
  RECOMMENDED_PHASES,
  type AptitudeCategory,
  type AptitudeQuestion,
  type AptitudeSyllabusTopic,
} from '@/data/aptitudeSyllabus';
import { aptitudeService } from '@/services/aptitudeService';
import { progressService, type AptitudeAttempt } from '@/services/progressService';
import { Button } from '@/components/ui/button';

type CategoryFilter = 'All' | AptitudeCategory;

const COMPANY_FILTERS = [
  'All Companies',
  'My Target Companies',
  'TCS',
  'Infosys',
  'Wipro',
  'Cognizant',
  'Deloitte',
  'Accenture',
  'Amazon',
];

const GENERATOR_COMPANIES = [
  'Any Company',
  'TCS',
  'Infosys',
  'Wipro',
  'Cognizant',
  'Deloitte',
  'Accenture',
  'Amazon',
];

export const AptitudePage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedCompany, setSelectedCompany] = useState<string>('All Companies');
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'catalog' | 'recommended'>('catalog');
  const [userProfile, setUserProfile] = useState(() => progressService.getUserProgress().profile);
  const [history, setHistory] = useState<AptitudeAttempt[]>(
    () => progressService.getUserProgress().aptitudeAttempts
  );

  // Fresh AI Practice Set Drawer state
  const [isGenDrawerOpen, setIsGenDrawerOpen] = useState(false);
  const [genTopicId, setGenTopicId] = useState<string>(APTITUDE_SYLLABUS[0].id);
  const [genDifficulty, setGenDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>('Medium');
  const [genCompany, setGenCompany] = useState<string>('Any Company');
  const [genCount, setGenCount] = useState<15 | 20 | 30 | 40 | 50>(20);

  // Active Test state
  const [activeTopic, setActiveTopic] = useState<AptitudeSyllabusTopic | null>(null);
  const [activeQuestions, setActiveQuestions] = useState<AptitudeQuestion[]>([]);
  const [activeSource, setActiveSource] = useState<string>('sqlite');
  const [isLoadingTest, setIsLoadingTest] = useState(false);
  const [loadingTopicId, setLoadingTopicId] = useState<string | null>(null);
  const [seenQuestionIds, setSeenQuestionIds] = useState<Record<string, string[]>>({});
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, number>>({});
  const [secondsLeft, setSecondsLeft] = useState(360);
  const [isFinished, setIsFinished] = useState(false);
  const [lastAttempt, setLastAttempt] = useState<AptitudeAttempt | null>(null);

  useEffect(() => {
    const topicIdParam = searchParams.get('topic');
    if (!topicIdParam) return;
    const topicObj = APTITUDE_SYLLABUS.find((t) => t.id === topicIdParam);
    const countParam = parseInt(searchParams.get('count') || '20', 10);
    if (topicObj && !activeTopic && !isLoadingTest) {
      const reqCount = Number.isFinite(countParam) ? Math.max(15, Math.min(50, countParam)) : 20;
      setSearchParams({}, { replace: true });
      handleStartTopic(topicObj, { count: reqCount });
    }
  }, [searchParams]);

  useEffect(() => {
    const unsub = progressService.subscribe(() => {
      const data = progressService.getUserProgress();
      setHistory(data.aptitudeAttempts);
      setUserProfile(data.profile);
    });
    return () => unsub();
  }, []);

  // Category counts
  const categoryCounts = useMemo(() => {
    return {
      All: APTITUDE_SYLLABUS.length,
      Quantitative: APTITUDE_SYLLABUS.filter((t) => t.category === 'Quantitative').length,
      Logical: APTITUDE_SYLLABUS.filter((t) => t.category === 'Logical').length,
      Verbal: APTITUDE_SYLLABUS.filter((t) => t.category === 'Verbal').length,
      'Data Interpretation': APTITUDE_SYLLABUS.filter((t) => t.category === 'Data Interpretation')
        .length,
    };
  }, []);

  // Best score lookup per topicId
  const bestScoreMap = useMemo(() => {
    const map: Record<string, number> = {};
    for (const att of history) {
      if (map[att.topicId] === undefined || att.percentage > map[att.topicId]) {
        map[att.topicId] = att.percentage;
      }
    }
    return map;
  }, [history]);

  // Unique practiced topic count
  const practicedTopicCount = Object.keys(bestScoreMap).length;

  // Timer countdown
  useEffect(() => {
    if (!activeTopic || isFinished || activeQuestions.length === 0) return;
    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmitTest();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [activeTopic, isFinished, activeQuestions]);

  const handleStartTopic = async (
    topic: AptitudeSyllabusTopic,
    options?: {
      difficulty?: 'Easy' | 'Medium' | 'Hard';
      company?: string;
      count?: number;
      forceFreshAI?: boolean;
    }
  ) => {
    setIsLoadingTest(true);
    setLoadingTopicId(topic.id);

    const prevSeen = seenQuestionIds[topic.id] || [];
    const reqCount = options?.count || 20;

    try {
      const result = await aptitudeService.generatePracticeSet({
        topicId: topic.id,
        topic: topic.title,
        category: topic.category,
        difficulty: options?.difficulty || topic.difficulty,
        company:
          options?.company ||
          (selectedCompany !== 'All Companies' && selectedCompany !== 'My Target Companies'
            ? selectedCompany
            : 'Any Company'),
        count: reqCount,
        forceFreshAI: Boolean(options?.forceFreshAI),
        excludeIds: prevSeen,
      });

      const fetchedIds = result.questions.map((q) => q.id);
      setSeenQuestionIds((prev) => ({
        ...prev,
        [topic.id]: [...prevSeen, ...fetchedIds].slice(-30),
      }));

      setActiveTopic(topic);
      setActiveQuestions(result.questions);
      setActiveSource(result.source);
      setCurrentQIndex(0);
      setUserAnswers({});
      setSecondsLeft(reqCount * 60);
      setIsFinished(false);
      setLastAttempt(null);
      setIsGenDrawerOpen(false);
    } finally {
      setIsLoadingTest(false);
      setLoadingTopicId(null);
    }
  };

  const handleGenerateFreshSet = async (e: React.FormEvent) => {
    e.preventDefault();
    const topicObj = APTITUDE_SYLLABUS.find((t) => t.id === genTopicId) || APTITUDE_SYLLABUS[0];
    await handleStartTopic(topicObj, {
      difficulty: genDifficulty,
      company: genCompany,
      count: genCount,
      forceFreshAI: true,
    });
  };

  const handleSelectOption = (questionId: string, optionIndex: number) => {
    if (isFinished) return;
    setUserAnswers((prev) => ({
      ...prev,
      [questionId]: optionIndex,
    }));
  };

  const handleSubmitTest = () => {
    if (!activeTopic || activeQuestions.length === 0) return;
    let correctCount = 0;
    activeQuestions.forEach((q) => {
      if (userAnswers[q.id] === q.correctAnswer) {
        correctCount++;
      }
    });

    const total = activeQuestions.length;
    const percentage = Math.round((correctCount / total) * 100);

    const attemptData = {
      topicId: activeTopic.id,
      topicTitle: activeTopic.title,
      category: activeTopic.category,
      score: correctCount,
      total,
      percentage,
    };

    progressService.recordAptitudeAttempt(attemptData);

    const recorded: AptitudeAttempt = {
      ...attemptData,
      id: 'apt_local_' + Date.now(),
      date: new Date().toISOString(),
    };

    setLastAttempt(recorded);
    setIsFinished(true);
  };

  const filteredTopics = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return APTITUDE_SYLLABUS.filter((t) => {
      const matchCat = selectedCategory === 'All' ? true : t.category === selectedCategory;
      let matchCompany = true;
      if (selectedCompany === 'My Target Companies') {
        const targets = userProfile.targetCompanies || ['TCS', 'Amazon', 'Google'];
        matchCompany = Boolean(
          t.companies?.some((c) =>
            targets.some((target) => c.toLowerCase().includes(target.toLowerCase()))
          )
        );
      } else if (selectedCompany !== 'All Companies') {
        matchCompany = Boolean(
          t.companies?.some((c) => c.toLowerCase().includes(selectedCompany.toLowerCase()))
        );
      }
      const matchSearch =
        !q ||
        t.title.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q);
      return matchCat && matchCompany && matchSearch;
    });
  }, [selectedCategory, selectedCompany, searchQuery, userProfile]);

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const getCategoryStyle = (cat: AptitudeCategory) => {
    switch (cat) {
      case 'Quantitative':
        return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
      case 'Logical':
        return 'text-teal-400 bg-teal-500/10 border-teal-500/20';
      case 'Verbal':
        return 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20';
      case 'Data Interpretation':
        return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
    }
  };

  return (
    <DashboardLayout
      pageTitle="Aptitude Preparation — 71-Topic Placement Syllabus"
      pageSubtitle="Complete 4-pillar Quantitative, Logical Reasoning, Verbal Ability & Data Interpretation practice with AI question generation."
    >
      <div className="space-y-6 max-w-6xl mx-auto">
        {!activeTopic && (
          <div className="space-y-5">
            {/* COMPANY FILTER BAR */}
            <div className="p-4 rounded-3xl border border-neutral-800 bg-neutral-950/70 backdrop-blur-xl shadow-lg space-y-2">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <span className="text-xs font-semibold text-neutral-300 flex items-center space-x-1.5 font-mono">
                  <Building2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Filter by Target Company:</span>
                </span>
                <div className="flex items-center gap-3 text-[11px] font-mono text-neutral-400">
                  <span>
                    Topics Covered:{' '}
                    <strong className="text-emerald-400">
                      {practicedTopicCount} / {APTITUDE_SYLLABUS.length}
                    </strong>
                  </span>
                  <span>•</span>
                  <span>
                    Completed Sets: <strong className="text-white">{history.length}</strong>
                  </span>
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {COMPANY_FILTERS.map((comp) => {
                  const isActive = selectedCompany === comp;
                  return (
                    <button
                      key={comp}
                      type="button"
                      onClick={() => setSelectedCompany(comp)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all duration-200 cursor-pointer border flex items-center space-x-1.5 ${
                        isActive
                          ? comp === 'My Target Companies'
                            ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 shadow-sm shadow-cyan-500/20'
                            : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-sm shadow-emerald-500/10'
                          : 'bg-neutral-900/60 text-neutral-400 border-neutral-800 hover:border-neutral-700 hover:text-white'
                      }`}
                    >
                      {comp === 'My Target Companies' && (
                        <Target className="w-3.5 h-3.5 text-cyan-400" />
                      )}
                      <span>{comp}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* CATEGORY TABS, SEARCH, RECOMMENDED ORDER TOGGLE & AI GENERATOR TRIGGER */}
            <div className="p-4 sm:p-5 rounded-3xl border border-neutral-800 bg-neutral-950/80 backdrop-blur-xl space-y-4">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                {/* Category Tabs with Exact Counts */}
                <div className="flex flex-wrap items-center gap-1.5">
                  {(
                    [
                      { key: 'All', label: `All (${categoryCounts.All})` },
                      { key: 'Quantitative', label: `Quantitative (${categoryCounts.Quantitative})` },
                      { key: 'Logical', label: `Logical (${categoryCounts.Logical})` },
                      { key: 'Verbal', label: `Verbal (${categoryCounts.Verbal})` },
                      {
                        key: 'Data Interpretation',
                        label: `Data Interpretation (${categoryCounts['Data Interpretation']})`,
                      },
                    ] as const
                  ).map((tab) => (
                    <button
                      key={tab.key}
                      type="button"
                      onClick={() => {
                        setSelectedCategory(tab.key);
                        setViewMode('catalog');
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                        viewMode === 'catalog' && selectedCategory === tab.key
                          ? 'bg-white text-black font-semibold shadow-sm'
                          : 'bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}

                  {/* Recommended Order Toggle */}
                  <button
                    type="button"
                    onClick={() =>
                      setViewMode((prev) => (prev === 'recommended' ? 'catalog' : 'recommended'))
                    }
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer border inline-flex items-center gap-1.5 ${
                      viewMode === 'recommended'
                        ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 shadow-sm'
                        : 'bg-neutral-900 border-neutral-800 text-neutral-300 hover:text-white hover:border-neutral-700'
                    }`}
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>Recommended Order</span>
                  </button>
                </div>

                {/* Search + Generate AI Set Trigger */}
                <div className="flex flex-wrap items-center gap-2.5">
                  <div className="relative flex-1 sm:w-56">
                    <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        if (viewMode === 'recommended') setViewMode('catalog');
                      }}
                      placeholder="Search 71 topics..."
                      className="w-full bg-neutral-900 border border-neutral-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-neutral-600"
                    />
                  </div>

                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => setIsGenDrawerOpen((prev) => !prev)}
                    className="text-xs cursor-pointer bg-gradient-to-r from-emerald-400 to-teal-400 text-black font-bold hover:brightness-110 shadow-lg shadow-emerald-500/20 inline-flex items-center gap-1.5"
                  >
                    <Terminal className="w-3.5 h-3.5" />
                    <span>Generate Fresh AI Practice Set</span>
                    {isGenDrawerOpen ? (
                      <ChevronUp className="w-3.5 h-3.5" />
                    ) : (
                      <ChevronDown className="w-3.5 h-3.5" />
                    )}
                  </Button>
                </div>
              </div>
            </div>

            {/* TOP EXPANDABLE AI APTITUDE GENERATOR PANEL */}
            <AnimatePresence>
              {isGenDrawerOpen && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.22, ease: 'easeOut' }}
                  className="overflow-hidden"
                >
                  <div className="rounded-3xl border border-emerald-500/30 bg-neutral-950/90 p-5 sm:p-6 shadow-2xl backdrop-blur-2xl space-y-4 text-white">
                    <div className="flex items-center justify-between pb-3 border-b border-white/10">
                      <div className="flex items-center space-x-2.5">
                        <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                          <Terminal className="w-4 h-4" />
                        </div>
                        <div>
                          <h3 className="text-sm sm:text-base font-bold text-white">
                            Generate Fresh AI Practice Set
                          </h3>
                          <p className="text-xs text-neutral-400">
                            Fetches non-repeating questions from SQLite and synthesizes fresh exam-grade MCQs with shortcut formulas.
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsGenDrawerOpen(false)}
                        className="p-1.5 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-900 cursor-pointer"
                        aria-label="Close"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    <form onSubmit={handleGenerateFreshSet} className="space-y-4 text-xs">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                        {/* Topic Selector (all 71) */}
                        <div className="md:col-span-2 space-y-1.5">
                          <label className="text-neutral-300 font-semibold block">
                            Select Syllabus Topic (71 Topics)
                          </label>
                          <select
                            value={genTopicId}
                            onChange={(e) => setGenTopicId(e.target.value)}
                            className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none cursor-pointer"
                          >
                            {(['Quantitative', 'Logical', 'Verbal', 'Data Interpretation'] as const).map(
                              (cat) => (
                                <optgroup key={cat} label={cat}>
                                  {APTITUDE_SYLLABUS.filter((t) => t.category === cat).map((t) => (
                                    <option key={t.id} value={t.id}>
                                      {t.number}. {t.title}
                                    </option>
                                  ))}
                                </optgroup>
                              )
                            )}
                          </select>
                        </div>

                        {/* Difficulty */}
                        <div className="space-y-1.5">
                          <label className="text-neutral-300 font-semibold block">Difficulty</label>
                          <div className="grid grid-cols-3 gap-1.5">
                            {(['Easy', 'Medium', 'Hard'] as const).map((diff) => (
                              <button
                                key={diff}
                                type="button"
                                onClick={() => setGenDifficulty(diff)}
                                className={`py-2 rounded-xl font-mono text-center border cursor-pointer ${
                                  genDifficulty === diff
                                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 font-bold'
                                    : 'bg-neutral-900 text-neutral-400 border-neutral-800 hover:text-white'
                                }`}
                              >
                                {diff}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Company & Count */}
                        <div className="space-y-1.5">
                          <label className="text-neutral-300 font-semibold block">
                            Target Company & Size
                          </label>
                          <div className="flex gap-1.5">
                            <select
                              value={genCompany}
                              onChange={(e) => setGenCompany(e.target.value)}
                              className="flex-1 bg-neutral-900 border border-neutral-800 rounded-xl px-2.5 py-2 text-xs text-white focus:outline-none cursor-pointer"
                            >
                              {GENERATOR_COMPANIES.map((c) => (
                                <option key={c} value={c}>
                                  {c}
                                </option>
                              ))}
                            </select>
                            <select
                              aria-label="Select question count"
                              value={genCount}
                              onChange={(e) =>
                                setGenCount(Number(e.target.value) as 15 | 20 | 30 | 40 | 50)
                              }
                              className="w-24 bg-neutral-900 border border-neutral-800 rounded-xl px-2 py-2 text-xs text-white focus:outline-none cursor-pointer font-mono"
                            >
                              <option value={15}>15 Qs</option>
                              <option value={20}>20 Qs</option>
                              <option value={30}>30 Qs</option>
                              <option value={40}>40 Qs</option>
                              <option value={50}>50 Qs</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/10">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setIsGenDrawerOpen(false)}
                          className="text-neutral-400 hover:text-white text-xs cursor-pointer"
                        >
                          Close
                        </Button>
                        <Button
                          type="submit"
                          variant="primary"
                          size="sm"
                          isLoading={isLoadingTest}
                          disabled={isLoadingTest}
                          className="bg-gradient-to-r from-emerald-400 to-teal-400 text-black font-bold px-5 py-2 rounded-xl text-xs cursor-pointer inline-flex items-center gap-1.5"
                        >
                          {isLoadingTest ? (
                            <>
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              <span>Generating {genCount} {genDifficulty} Questions...</span>
                            </>
                          ) : (
                            <>
                              <Play className="w-3.5 h-3.5" />
                              <span>Generate & Start Practice Set</span>
                            </>
                          )}
                        </Button>
                      </div>
                    </form>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* VIEW MODE 1: RECOMMENDED 4-PHASE PREPARATION ORDER */}
            {viewMode === 'recommended' ? (
              <div className="space-y-5">
                <div className="rounded-3xl border border-cyan-500/30 bg-gradient-to-r from-cyan-500/10 via-neutral-950 to-neutral-900 p-6 backdrop-blur-xl shadow-xl">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h2 className="text-lg sm:text-xl font-extrabold text-white tracking-tight">
                        Recommended Preparation Order (Beginner to Pro)
                      </h2>
                      <p className="text-xs text-neutral-300 mt-1">
                        Follow these 4 structured phases sequentially to build speed from core arithmetic up to Data Interpretation.
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setViewMode('catalog')}
                      className="text-xs border-neutral-700 hover:bg-neutral-900 cursor-pointer shrink-0"
                    >
                      View All 71 Topics
                    </Button>
                  </div>
                </div>

                <div className="space-y-5">
                  {RECOMMENDED_PHASES.map((phaseBlock) => {
                    const phaseTopics = phaseBlock.topicIds
                      .map((id) => APTITUDE_SYLLABUS.find((t) => t.id === id))
                      .filter((t): t is AptitudeSyllabusTopic => Boolean(t));
                    const completedInPhase = phaseTopics.filter(
                      (t) => bestScoreMap[t.id] !== undefined
                    ).length;

                    return (
                      <div
                        key={phaseBlock.phase}
                        className="rounded-3xl border border-neutral-800 bg-neutral-950/75 p-5 sm:p-6 backdrop-blur-xl shadow-xl space-y-4"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-neutral-800/80">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                                {phaseBlock.subtitle}
                              </span>
                              <span className="text-xs font-mono text-neutral-400">
                                {completedInPhase} / {phaseTopics.length} Practiced
                              </span>
                            </div>
                            <h3 className="text-base font-bold text-white mt-1.5">
                              {phaseBlock.title}
                            </h3>
                            <p className="text-xs text-neutral-400">{phaseBlock.description}</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {phaseTopics.map((topic) => {
                            const bestScore = bestScoreMap[topic.id] ?? null;
                            const isThisLoading = isLoadingTest && loadingTopicId === topic.id;
                            return (
                              <div
                                key={topic.id}
                                className="p-4 rounded-2xl border border-neutral-800/80 bg-neutral-900/50 hover:border-neutral-700 transition-all flex flex-col justify-between space-y-3"
                              >
                                <div className="space-y-1.5">
                                  <div className="flex items-center justify-between">
                                    <span
                                      className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full border ${getCategoryStyle(
                                        topic.category
                                      )}`}
                                    >
                                      {topic.category}
                                    </span>
                                    {bestScore !== null && (
                                      <span className="text-[11px] font-mono font-bold text-emerald-400 flex items-center gap-1">
                                        <CheckCircle2 className="w-3.5 h-3.5" />
                                        {bestScore}%
                                      </span>
                                    )}
                                  </div>
                                  <h4 className="text-sm font-bold text-white">{topic.title}</h4>
                                  <p className="text-[11px] text-neutral-400">{topic.description}</p>
                                </div>

                                <div className="flex items-center justify-between pt-2 border-t border-neutral-800/60">
                                  <span className="text-[10px] font-mono text-neutral-500">
                                    {bestScore !== null ? `Best: ${bestScore}%` : 'Not attempted'}
                                  </span>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={isLoadingTest}
                                    onClick={() => handleStartTopic(topic)}
                                    className="text-xs cursor-pointer rounded-xl border-neutral-700 hover:bg-white hover:text-black font-semibold"
                                  >
                                    {isThisLoading ? (
                                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                    ) : (
                                      <>
                                        Start Test <ChevronRight className="w-3.5 h-3.5 ml-1" />
                                      </>
                                    )}
                                  </Button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              /* VIEW MODE 2: COMPLETE 71-TOPIC CATALOG GRID */
              <div className="space-y-4">
                <div className="flex items-center justify-between px-1 text-xs font-mono text-neutral-400">
                  <span>
                    Showing <strong className="text-white">{filteredTopics.length}</strong> of{' '}
                    {APTITUDE_SYLLABUS.length} syllabus topics
                  </span>
                  {selectedCategory !== 'All' && (
                    <span>
                      Category: <strong className="text-emerald-400">{selectedCategory}</strong>
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredTopics.map((topic) => {
                    const bestScore = bestScoreMap[topic.id] ?? null;
                    const isThisLoading = isLoadingTest && loadingTopicId === topic.id;

                    return (
                      <motion.div
                        key={topic.id}
                        whileHover={{ y: -3 }}
                        className="rounded-3xl border border-neutral-800/80 bg-neutral-950/70 p-5 backdrop-blur-xl shadow-xl flex flex-col justify-between hover:border-neutral-700 transition-all group"
                      >
                        <div className="space-y-3.5">
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span
                                className={`text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full border ${getCategoryStyle(
                                  topic.category
                                )}`}
                              >
                                {topic.category}
                              </span>
                              {topic.priority === 'High' && (
                                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-neutral-300">
                                  High Priority
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] font-mono text-neutral-400 flex items-center gap-1 shrink-0">
                              <Clock className="w-3 h-3" />
                              {topic.estimatedMinutes}m
                            </span>
                          </div>

                          <div className="space-y-1">
                            <h3 className="text-base font-bold text-white tracking-tight group-hover:text-emerald-300 transition-colors">
                              {topic.number}. {topic.title}
                            </h3>
                            <p className="text-xs text-neutral-400 leading-relaxed">
                              {topic.description}
                            </p>
                          </div>

                          {topic.companies && topic.companies.length > 0 && (
                            <div className="flex flex-wrap gap-1 pt-0.5">
                              {topic.companies.map((c) => (
                                <span
                                  key={c}
                                  className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-neutral-900 border border-neutral-800 text-neutral-300"
                                >
                                  {c}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="pt-4 mt-4 border-t border-neutral-800/60 flex items-center justify-between">
                          <div className="text-[11px] text-neutral-400 font-mono">
                            {bestScore !== null ? (
                              <span>
                                Best: <strong className="text-emerald-400">{bestScore}%</strong>
                              </span>
                            ) : (
                              <span className="italic">Not attempted</span>
                            )}
                          </div>

                          <Button
                            variant="outline"
                            size="sm"
                            disabled={isLoadingTest}
                            onClick={() => handleStartTopic(topic)}
                            className="text-xs cursor-pointer rounded-xl border-neutral-700 group-hover:bg-white group-hover:text-black group-hover:border-white transition-all font-semibold"
                          >
                            {isThisLoading ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <>
                                Start Test <ChevronRight className="w-3.5 h-3.5 ml-1" />
                              </>
                            )}
                          </Button>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* PAST ATTEMPTS TABLE */}
            {history.length > 0 && (
              <div className="rounded-3xl border border-neutral-800 bg-neutral-950/80 p-6 backdrop-blur-xl space-y-4 shadow-xl">
                <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                  Recent Aptitude Practice History
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-neutral-800/80 text-neutral-400 font-mono">
                        <th className="pb-3 font-medium">Topic</th>
                        <th className="pb-3 font-medium">Category</th>
                        <th className="pb-3 font-medium">Score</th>
                        <th className="pb-3 font-medium">Percentage</th>
                        <th className="pb-3 font-medium">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-800/50">
                      {history.slice(0, 8).map((att) => (
                        <tr key={att.id} className="text-neutral-200">
                          <td className="py-2.5 font-medium text-white">{att.topicTitle}</td>
                          <td className="py-2.5">
                            <span className="px-2 py-0.5 rounded bg-white/5 font-mono text-[10px]">
                              {att.category}
                            </span>
                          </td>
                          <td className="py-2.5 font-mono">
                            {att.score} / {att.total}
                          </td>
                          <td className="py-2.5">
                            <span
                              className={`font-mono font-bold ${
                                att.percentage >= 70 ? 'text-emerald-400' : 'text-amber-400'
                              }`}
                            >
                              {att.percentage}%
                            </span>
                          </td>
                          <td className="py-2.5 text-neutral-400 font-mono text-[11px]">
                            {new Date(att.date).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ACTIVE TEST / PRACTICE SET */}
        {activeTopic && !isFinished && activeQuestions.length > 0 && (
          <div className="space-y-6">
            {/* TEST HEADER */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-5 rounded-2xl border border-neutral-800 bg-neutral-950/80 backdrop-blur-xl">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase font-bold text-emerald-400 font-mono tracking-wider">
                    {activeTopic.category} Drill
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 border border-white/10 text-neutral-300">
                    Source: {activeSource === 'gemini' ? 'Gemini AI' : activeSource === 'procedural' ? 'Dynamic Generator' : 'Placement Bank'}
                  </span>
                </div>
                <h2 className="text-base font-bold text-white mt-0.5">{activeTopic.title}</h2>
              </div>

              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-neutral-900 border border-neutral-800 font-mono text-xs text-neutral-300">
                  <Clock className="w-4 h-4 text-emerald-400" />
                  <span>Time Left: {formatTimer(secondsLeft)}</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setActiveTopic(null)}
                  className="text-xs text-neutral-400 cursor-pointer"
                >
                  Exit Drill
                </Button>
              </div>
            </div>

            {/* QUESTION CARD */}
            {(() => {
              const q = activeQuestions[currentQIndex];
              const totalQ = activeQuestions.length;
              return (
                <motion.div
                  key={q.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-3xl border border-neutral-800 bg-neutral-950/90 p-6 sm:p-8 backdrop-blur-xl shadow-2xl space-y-6"
                >
                  <div className="flex items-center justify-between pb-3 border-b border-neutral-800/80 text-xs text-neutral-400 flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-white">
                        Question {currentQIndex + 1} of {totalQ}
                      </span>
                      {q.difficulty && (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-neutral-900 border border-neutral-800 text-neutral-300">
                          {q.difficulty}
                        </span>
                      )}
                      {q.company && (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-teal-500/10 border border-teal-500/20 text-teal-300">
                          {q.company}
                        </span>
                      )}
                    </div>
                    <span className="font-mono text-emerald-400">
                      {Object.keys(userAnswers).length} / {totalQ} Answered
                    </span>
                  </div>

                  <h3 className="text-base sm:text-lg font-medium text-white leading-relaxed whitespace-pre-line">
                    {q.question}
                  </h3>

                  <div className="space-y-3 pt-2">
                    {q.options.map((opt, optIndex) => {
                      const isSelected = userAnswers[q.id] === optIndex;
                      const letters = ['A', 'B', 'C', 'D'];
                      return (
                        <button
                          key={optIndex}
                          type="button"
                          onClick={() => handleSelectOption(q.id, optIndex)}
                          className={`w-full text-left p-4 rounded-2xl border transition-all flex items-center space-x-3.5 cursor-pointer ${
                            isSelected
                              ? 'bg-white/10 border-emerald-400 text-white shadow-[0_0_15px_rgba(52,211,153,0.15)]'
                              : 'bg-neutral-900/60 border-neutral-800/80 hover:border-neutral-700 text-neutral-200'
                          }`}
                        >
                          <div
                            className={`h-7 w-7 rounded-xl flex items-center justify-center font-mono text-xs font-bold shrink-0 ${
                              isSelected ? 'bg-emerald-400 text-black' : 'bg-neutral-800 text-neutral-300'
                            }`}
                          >
                            {letters[optIndex]}
                          </div>
                          <span className="text-sm font-medium">{opt}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-6 border-t border-neutral-800/80">
                    <Button
                      variant="outline"
                      size="md"
                      onClick={() => setCurrentQIndex((prev) => Math.max(0, prev - 1))}
                      disabled={currentQIndex === 0}
                      className="text-xs cursor-pointer border-neutral-800"
                    >
                      <ArrowLeft className="w-4 h-4 mr-1.5" /> Previous
                    </Button>

                    {currentQIndex < totalQ - 1 ? (
                      <Button
                        variant="primary"
                        size="md"
                        onClick={() => setCurrentQIndex((prev) => prev + 1)}
                        className="text-xs cursor-pointer"
                      >
                        Next <ArrowRight className="w-4 h-4 ml-1.5" />
                      </Button>
                    ) : (
                      <Button
                        variant="primary"
                        size="md"
                        onClick={handleSubmitTest}
                        className="text-xs cursor-pointer bg-emerald-400 text-black hover:bg-emerald-300 font-bold"
                      >
                        Submit Practice Set <CheckCircle2 className="w-4 h-4 ml-1.5" />
                      </Button>
                    )}
                  </div>
                </motion.div>
              );
            })()}
          </div>
        )}

        {/* RESULTS SCREEN WITH SHORTCUT FORMULAS & EXPLANATIONS */}
        {activeTopic && isFinished && lastAttempt && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-6"
          >
            {/* SCORE BANNER */}
            <div className="rounded-3xl border border-neutral-800 bg-gradient-to-r from-neutral-950 via-neutral-900 to-neutral-950 p-6 sm:p-8 backdrop-blur-xl shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="space-y-2 text-center md:text-left">
                <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-mono text-emerald-400">
                  <Award className="w-3.5 h-3.5" />
                  <span>Practice Attempt Saved ({activeTopic.title})</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  Score: {lastAttempt.score} / {lastAttempt.total} ({lastAttempt.percentage}%)
                </h2>
                <p className="text-sm text-neutral-400">
                  {lastAttempt.percentage >= 75
                    ? 'Strong mastery! Try generating a fresh AI set or advance to the next preparation phase.'
                    : 'Review the shortcut formulas and step-by-step solutions below, then try another fresh set.'}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <Button
                  variant="primary"
                  size="md"
                  disabled={isLoadingTest}
                  onClick={() => handleStartTopic(activeTopic, { forceFreshAI: true })}
                  className="cursor-pointer text-xs sm:text-sm font-semibold bg-emerald-400 text-black hover:bg-emerald-300"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  New Practice Set
                </Button>
                <Button
                  variant="outline"
                  size="md"
                  onClick={() => setActiveTopic(null)}
                  className="cursor-pointer text-xs sm:text-sm border-neutral-700"
                >
                  All 71 Topics
                </Button>
              </div>
            </div>

            {/* DETAILED SHORTCUT FORMULAS & EXPLANATIONS */}
            <div className="rounded-3xl border border-neutral-800 bg-neutral-950/80 p-6 sm:p-8 backdrop-blur-xl shadow-xl space-y-4">
              <h3 className="text-base font-bold text-white tracking-tight">
                Shortcut Formulas &amp; Step-by-Step Solutions
              </h3>
              <div className="space-y-4">
                {activeQuestions.map((q, idx) => {
                  const userChoice = userAnswers[q.id];
                  const isCorrect = userChoice === q.correctAnswer;
                  return (
                    <div
                      key={q.id}
                      className={`p-5 rounded-2xl border ${
                        isCorrect
                          ? 'bg-neutral-900/40 border-neutral-800'
                          : 'bg-rose-950/15 border-rose-900/30'
                      } space-y-3`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono font-bold text-neutral-400">
                          Q{idx + 1}.
                        </span>
                        <span
                          className={`text-xs px-2.5 py-0.5 rounded-full font-mono font-bold flex items-center gap-1 ${
                            isCorrect
                              ? 'text-emerald-400 bg-emerald-500/10'
                              : 'text-rose-400 bg-rose-500/10'
                          }`}
                        >
                          {isCorrect ? (
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          ) : (
                            <XCircle className="w-3.5 h-3.5" />
                          )}
                          {isCorrect ? 'Correct' : 'Incorrect'}
                        </span>
                      </div>

                      <p className="text-sm font-medium text-white whitespace-pre-line">
                        {q.question}
                      </p>

                      <div className="text-xs space-y-1.5 text-neutral-300 pt-1">
                        <div>
                          <span className="text-neutral-400">Correct Answer:</span>{' '}
                          <span className="font-semibold text-emerald-400">
                            {q.options[q.correctAnswer]}
                          </span>
                        </div>
                        {userChoice !== undefined && !isCorrect && (
                          <div>
                            <span className="text-neutral-400">Your Selection:</span>{' '}
                            <span className="font-semibold text-rose-400">
                              {q.options[userChoice]}
                            </span>
                          </div>
                        )}

                        {q.shortcutFormula && (
                          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/25 text-[11px] text-amber-200 mt-2 flex items-start gap-2">
                            <Lightbulb className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                            <div>
                              <strong className="text-amber-300 block mb-0.5">
                                Shortcut Formula / Rule:
                              </strong>
                              {q.shortcutFormula}
                            </div>
                          </div>
                        )}

                        <div className="p-3 rounded-xl bg-neutral-900/80 border border-neutral-800 text-[11px] text-neutral-300 font-sans">
                          <strong className="text-white block mb-0.5">Solution Explanation:</strong>
                          {q.explanation}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AptitudePage;
