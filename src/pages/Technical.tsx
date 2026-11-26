import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle2,
  XCircle,
  BookOpen,
  HelpCircle,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  Layers,
  FolderGit2,
  Terminal,
  Compass,
  Clock,
  Search,
  Play,
  PlayCircle,
  Video,
  Bot,
  Copy,
  ArrowLeft,
  ArrowRight,
  RotateCcw,
  Award,
  Loader2,
  X,
  Code2,
  Check,
  FileText,
  ListChecks,
  Download,
  Building2,
  ShieldCheck,
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { CAREER_TRACKS, resolveCareerTrack } from '@/data/technicalCurriculum/careers';
import { TARGET_COMPANIES } from '@/data/technicalCurriculum/companyPatterns';
import {
  SHARED_COURSES,
  getCoursePriorityForCareer,
} from '@/data/courseLibrary/courses';
import { type CourseCategory } from '@/data/courseLibrary/types';
import { getSubtopicYouTubeLessons } from '@/data/courseLibrary/youtubeHelper';
import {
  AI_LEARNING_TOOLS,
  AI_STUDY_PROMPTS,
  buildSubtopicAIPrompt,
  type AISubjectFilter,
} from '@/data/courseLibrary/aiTools';
import {
  type CareerQuizQuestion,
  type CareerSubtopic,
  type CareerTopicGroup,
  type SkillLevel,
} from '@/data/technicalCurriculum/types';
import {
  downloadCourseStudyPlanPDF,
  exportCareerStudyPack,
  exportCheatSheetCard,
  exportSubjectModule,
  exportSubtopicNotes,
} from '@/lib/studyMaterialExport';
import { technicalService, type SubtopicDetailResponse } from '@/services/technicalService';
import { courseService, type CourseProgressState } from '@/services/courseService';
import { progressService } from '@/services/progressService';
import { Button } from '@/components/ui/button';

type HubTab = 'roadmap' | 'courses' | 'subjects' | 'projects' | 'aitools' | 'quiz';
type LevelFilter = 'All' | SkillLevel;

const COURSE_CATEGORIES: Array<'All' | CourseCategory> = [
  'All',
  'Languages',
  'CS Core',
  'Web',
  'Data & AI',
  'Cloud & Security',
  'Mobile / QA / UX',
];

const AI_SUBJECT_FILTERS: AISubjectFilter[] = [
  'All',
  'Java',
  'Python',
  'DSA',
  'SQL',
  'Web Dev',
  'Data & ML',
  'Cloud',
  'UI/UX',
];

export const TechnicalPage: React.FC = () => {
  const [userProfile, setUserProfile] = useState(() => progressService.getUserProgress().profile);
  const [selectedCareerId, setSelectedCareerId] = useState<string>(() =>
    resolveCareerTrack(progressService.getUserProgress().profile.targetRole).id
  );
  const [activeTab, setActiveTab] = useState<HubTab>('roadmap');
  const [levelFilter, setLevelFilter] = useState<LevelFilter>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchAllCareers, setSearchAllCareers] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<string>('All Companies');

  const [completedIds, setCompletedIds] = useState<string[]>(
    () => progressService.getUserProgress().completedTechnicalTopicIds
  );

  // Visual Roadmap expanded node state
  const [expandedNodeId, setExpandedNodeId] = useState<string | null>(null);

  // Course Explorer (Day-Wise) state
  const [courseSearch, setCourseSearch] = useState('');
  const [courseCategory, setCourseCategory] = useState<'All' | CourseCategory>('All');
  const [onlyRoleCourses, setOnlyRoleCourses] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState<string>(SHARED_COURSES[0].id);
  const [selectedDayNum, setSelectedDayNum] = useState<number>(1);
  const [courseProgress, setCourseProgress] = useState<CourseProgressState>(() =>
    courseService.getLocalProgress()
  );
  const [confirmResetCourse, setConfirmResetCourse] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // AI Learning Tools filter state
  const [aiSubject, setAiSubject] = useState<AISubjectFilter>('All');

  // Slide-Over Learning Drawer state
  const [activeSubtopic, setActiveSubtopic] = useState<CareerSubtopic | null>(null);
  const [activeSubtopicTopic, setActiveSubtopicTopic] = useState<string>('');
  const [drawerDetail, setDrawerDetail] = useState<SubtopicDetailResponse['detail'] | null>(null);
  const [drawerSource, setDrawerSource] = useState<string>('local');
  const [drawerLoading, setDrawerLoading] = useState(false);
  const [quickCheckChoice, setQuickCheckChoice] = useState<number | null>(null);
  const [drawerYtLang, setDrawerYtLang] = useState<'English' | 'Hindi'>('English');

  // Accordions
  const [openModuleId, setOpenModuleId] = useState<string | null>(null);
  const [openQAId, setOpenQAId] = useState<string | null>(null);
  const [openDefenseId, setOpenDefenseId] = useState<string | null>(null);

  // Scoped Practice Quiz state (15 / 20 / 30 / 40 / 50 Qs; standard default 20)
  const [quizCount, setQuizCount] = useState<15 | 20 | 30 | 40 | 50>(20);
  const [quizDifficulty, setQuizDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>('Medium');
  const [quizFocusTopic, setQuizFocusTopic] = useState<string>('');
  const [isLoadingQuiz, setIsLoadingQuiz] = useState(false);
  const [quizActive, setQuizActive] = useState(false);
  const [quizQuestions, setQuizQuestions] = useState<CareerQuizQuestion[]>([]);
  const [quizSource, setQuizSource] = useState<string>('sqlite');
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, number>>({});
  const [quizSecondsLeft, setQuizSecondsLeft] = useState(20 * 60);
  const [quizFinished, setQuizFinished] = useState(false);
  const [quizScore, setQuizScore] = useState<{ correct: number; total: number; pct: number } | null>(
    null
  );

  useEffect(() => {
    const unsub = progressService.subscribe(() => {
      const data = progressService.getUserProgress();
      setCompletedIds(data.completedTechnicalTopicIds);
      setUserProfile(data.profile);
    });
    courseService.fetchRemoteProgress().then(setCourseProgress);
    return () => unsub();
  }, []);

  const activeCareer = useMemo(
    () => CAREER_TRACKS.find((c) => c.id === selectedCareerId) || CAREER_TRACKS[0],
    [selectedCareerId]
  );

  const activeCompanyMeta = useMemo(
    () => TARGET_COMPANIES.find((c) => c.name === selectedCompany) || TARGET_COMPANIES[0],
    [selectedCompany]
  );

  useEffect(() => {
    setOpenModuleId(activeCareer.coreSubjects[0]?.id ?? null);
    setQuizFocusTopic(activeCareer.coreSkills[0] || 'Core Concepts');
    setExpandedNodeId(activeCareer.phases[0]?.topics[0]?.id ?? null);
  }, [activeCareer]);

  const handleSelectCareer = (careerId: string) => {
    setSelectedCareerId(careerId);
    setActiveSubtopic(null);
    setQuizActive(false);
    setQuizFinished(false);
    setOpenQAId(null);
    setOpenDefenseId(null);
  };

  const handleCopyText = (key: string, text: string) => {
    navigator.clipboard?.writeText(text).catch(() => undefined);
    setCopiedId(key);
    setTimeout(() => setCopiedId((prev) => (prev === key ? null : prev)), 2000);
  };

  const openSubtopicDrawer = async (sub: CareerSubtopic, parentTopicTitle: string) => {
    setActiveSubtopic(sub);
    setActiveSubtopicTopic(parentTopicTitle);
    setQuickCheckChoice(null);
    setDrawerDetail(null);
    setDrawerLoading(true);
    try {
      const res = await technicalService.fetchSubtopicDetail({
        career: activeCareer.name,
        topic: parentTopicTitle,
        subtopic: sub.title,
        level: sub.level,
        localFallback: {
          simpleExplanation: sub.simpleExplanation,
          whyImportant: sub.whyImportant,
          whatToLearn: sub.whatToLearn,
          codeExample: sub.codeExample || '',
          completionCriteria: sub.completionCriteria,
          quickCheck: sub.quickCheck,
        },
      });
      setDrawerDetail(res.detail);
      setDrawerSource(res.source);
    } finally {
      setDrawerLoading(false);
    }
  };

  const handleToggleSubtopic = (subtopicId: string) => {
    progressService.toggleTechnicalTopicCompleted(subtopicId);
    technicalService.syncProgressToggle(activeCareer.name, subtopicId);
  };

  const handleDownloadTopicPdf = (topicGroup: CareerTopicGroup) => {
    exportSubjectModule(
      activeCareer.name,
      {
        id: topicGroup.id,
        title: topicGroup.title,
        badge: topicGroup.title.split('(')[0].trim().slice(0, 24),
        kind: 'Core Subject',
        summary: topicGroup.summary,
        subtopics: topicGroup.subtopics,
      },
      'pdf'
    );
  };

  // Career Subtopic Stats
  const careerSubtopics = useMemo(() => {
    const seen = new Map<string, CareerSubtopic>();
    for (const p of activeCareer.phases) {
      for (const t of p.topics) {
        for (const s of t.subtopics) seen.set(s.id, s);
      }
    }
    for (const mod of activeCareer.coreSubjects) {
      for (const s of mod.subtopics) {
        if (!seen.has(s.id)) seen.set(s.id, s);
      }
    }
    return Array.from(seen.values());
  }, [activeCareer]);

  const careerCompletedCount = useMemo(
    () => careerSubtopics.filter((s) => completedIds.includes(s.id)).length,
    [careerSubtopics, completedIds]
  );

  const careerCompletionPct =
    careerSubtopics.length > 0
      ? Math.round((careerCompletedCount / careerSubtopics.length) * 100)
      : 0;

  const careerTopicCount = useMemo(
    () => activeCareer.phases.reduce((sum, ph) => sum + ph.topics.length, 0),
    [activeCareer]
  );

  // Course Explorer Derived Data
  const filteredCourses = useMemo(() => {
    const qC = courseSearch.trim().toLowerCase();
    return SHARED_COURSES.filter((course) => {
      const matchCat = courseCategory === 'All' || course.category === courseCategory;
      const priority = getCoursePriorityForCareer(course, activeCareer.id);
      const matchRole = !onlyRoleCourses || priority === 'Essential' || priority === 'Recommended';
      const matchQ =
        !qC ||
        course.title.toLowerCase().includes(qC) ||
        course.shortSummary.toLowerCase().includes(qC) ||
        course.primaryChannel.toLowerCase().includes(qC);
      return matchCat && matchRole && matchQ;
    });
  }, [courseSearch, courseCategory, onlyRoleCourses, activeCareer.id]);

  const activeCourse = useMemo(
    () => SHARED_COURSES.find((c) => c.id === selectedCourseId) || SHARED_COURSES[0],
    [selectedCourseId]
  );

  const activeCourseCompletedDays = courseProgress.courses[activeCourse.id] || [];
  const activeCourseDay =
    activeCourse.days.find((d) => d.dayNumber === selectedDayNum) || activeCourse.days[0];
  const activeCoursePct = Math.round(
    (activeCourseCompletedDays.length / Math.max(1, activeCourse.durationDays)) * 100
  );

  const handleSelectCourse = (courseId: string) => {
    setSelectedCourseId(courseId);
    setConfirmResetCourse(false);
    const done = courseProgress.courses[courseId] || [];
    const targetCourse = SHARED_COURSES.find((c) => c.id === courseId);
    const firstPending = targetCourse?.days.find((d) => !done.includes(d.dayNumber))?.dayNumber || 1;
    setSelectedDayNum(firstPending);
  };

  const handleToggleCourseDay = async (dayNumber: number) => {
    const updated = await courseService.toggleDay(activeCourse.id, dayNumber);
    setCourseProgress(updated);
  };

  const handleResetCourseProgress = async () => {
    const updated = await courseService.resetCourse(activeCourse.id);
    setCourseProgress(updated);
    setConfirmResetCourse(false);
    setSelectedDayNum(1);
  };

  // Quiz Countdown Timer
  useEffect(() => {
    if (!quizActive || quizFinished || quizQuestions.length === 0) return;
    const timer = setInterval(() => {
      setQuizSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmitQuiz();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [quizActive, quizFinished, quizQuestions]);

  const handleLaunchCareerQuiz = async (
    requestedCount?: number,
    forceFreshAI = false,
    topicOverride?: string
  ) => {
    const count = requestedCount || quizCount;
    const chosenTopic = topicOverride || quizFocusTopic || activeCareer.coreSkills[0] || 'Core Concepts';
    setIsLoadingQuiz(true);
    try {
      const res = await technicalService.generateCareerQuiz({
        career: activeCareer.name,
        company: selectedCompany,
        topic: chosenTopic,
        difficulty: quizDifficulty,
        count,
        forceFreshAI,
      });
      setQuizQuestions(res.questions);
      setQuizSource(res.source);
      setQuizActive(true);
      setQuizIndex(0);
      setQuizAnswers({});
      setQuizSecondsLeft(count * 60);
      setQuizFinished(false);
      setQuizScore(null);
    } finally {
      setIsLoadingQuiz(false);
    }
  };

  const handlePracticeTopic = (topicLabel: string) => {
    setQuizFocusTopic(topicLabel);
    setActiveTab('quiz');
    setQuizActive(false);
    setQuizFinished(false);
    setActiveSubtopic(null);
  };

  const handleSubmitQuiz = () => {
    let correct = 0;
    quizQuestions.forEach((q) => {
      if (quizAnswers[q.id] === q.correctAnswer) correct++;
    });
    const total = quizQuestions.length || 1;
    const pct = Math.round((correct / total) * 100);
    setQuizScore({ correct, total, pct });
    setQuizFinished(true);
  };

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const qLower = searchQuery.trim().toLowerCase();

  const crossCareerSearchResults = useMemo(() => {
    if (!searchAllCareers || !qLower) return [];
    const results: Array<{
      careerId: string;
      careerName: string;
      topicTitle: string;
      subtopic: CareerSubtopic;
    }> = [];
    for (const c of CAREER_TRACKS) {
      const seenIds = new Set<string>();
      const pushIfMatch = (s: CareerSubtopic, parentTitle: string) => {
        if (seenIds.has(s.id)) return;
        const matchLevel = levelFilter === 'All' || s.level === levelFilter;
        const matchQuery =
          s.title.toLowerCase().includes(qLower) ||
          s.simpleExplanation.toLowerCase().includes(qLower) ||
          parentTitle.toLowerCase().includes(qLower);
        if (matchLevel && matchQuery) {
          seenIds.add(s.id);
          results.push({ careerId: c.id, careerName: c.name, topicTitle: parentTitle, subtopic: s });
        }
      };

      for (const p of c.phases) {
        for (const t of p.topics) {
          for (const s of t.subtopics) pushIfMatch(s, t.title);
        }
      }
      for (const mod of c.coreSubjects) {
        for (const s of mod.subtopics) pushIfMatch(s, mod.title);
      }
    }
    return results;
  }, [searchAllCareers, qLower, levelFilter]);

  const getLevelBadgeColor = (lvl: SkillLevel | 'Basic') => {
    if (lvl === 'Beginner' || lvl === 'Basic') {
      return 'text-emerald-300 bg-emerald-500/15 border-emerald-500/30';
    }
    if (lvl === 'Intermediate') {
      return 'text-amber-300 bg-amber-500/15 border-amber-500/30';
    }
    return 'text-rose-300 bg-rose-500/15 border-rose-500/30';
  };

  const getPriorityBadgeStyle = (priority: 'Essential' | 'Recommended' | 'Optional') => {
    if (priority === 'Essential') {
      return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';
    }
    if (priority === 'Recommended') {
      return 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30';
    }
    return 'bg-white/5 text-neutral-400 border-white/10';
  };

  const filteredQAList = useMemo(() => {
    const base = activeCareer.interviewQA.filter(
      (qa) =>
        (!qLower ||
          qa.question.toLowerCase().includes(qLower) ||
          qa.answer.toLowerCase().includes(qLower) ||
          qa.topic.toLowerCase().includes(qLower)) &&
        (levelFilter === 'All' ||
          (levelFilter === 'Beginner' && qa.level === 'Basic') ||
          qa.level === levelFilter)
    );

    if (selectedCompany === 'All Companies') {
      return base.map((qa) => ({ qa, matched: false }));
    }

    const keys = activeCompanyMeta.keywords;
    const tagged = base.map((qa) => {
      const hay = `${qa.topic} ${qa.question} ${qa.answer}`.toLowerCase();
      const matched =
        Boolean(qa.companies?.includes(selectedCompany)) || keys.some((kw) => hay.includes(kw));
      return { qa, matched };
    });

    tagged.sort((a, b) => Number(b.matched) - Number(a.matched));
    return tagged;
  }, [activeCareer, qLower, levelFilter, selectedCompany, activeCompanyMeta]);

  const renderCompanyFilterBar = () => (
    <div className="rounded-3xl border border-neutral-800 bg-neutral-950/80 p-5 backdrop-blur-xl space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <span className="text-xs font-mono font-bold text-neutral-300 flex items-center gap-2">
          <Building2 className="w-4 h-4 text-cyan-400" />
          <span>Target Company Pattern Filter:</span>
        </span>
        <span className="text-[11px] font-mono text-cyan-300">
          Active: <strong>{selectedCompany}</strong>
        </span>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {TARGET_COMPANIES.map((comp) => {
          const isSel = selectedCompany === comp.name;
          return (
            <button
              key={comp.id}
              type="button"
              onClick={() => setSelectedCompany(comp.name)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all cursor-pointer ${
                isSel
                  ? 'bg-emerald-500/20 text-emerald-200 border-emerald-400/60 font-bold'
                  : 'bg-neutral-900/70 text-neutral-400 border-neutral-800 hover:text-white hover:border-neutral-700'
              }`}
            >
              {comp.shortLabel}
            </button>
          );
        })}
      </div>

      <div className="p-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/25 text-xs text-cyan-100 flex items-center gap-2">
        <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0" />
        <span>
          <strong className="text-white">{selectedCompany}:</strong> {activeCompanyMeta.focusBanner}
        </span>
      </div>
    </div>
  );

  return (
    <DashboardLayout
      pageTitle="Technical Preparation Hub"
      pageSubtitle="Visual roadmaps, day-wise courses with YouTube & docs, AI study tools, PDF packs & quizzes."
    >
      <div className="space-y-5 max-w-7xl mx-auto">
        {/* ================================================================= */}
        {/* 1. TOP HEADER, 12-CAREER SELECTOR & PROGRESS BAR                  */}
        {/* ================================================================= */}
        <div className="p-5 sm:p-6 rounded-3xl border border-neutral-800 bg-neutral-950/80 backdrop-blur-xl shadow-2xl space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/10">
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                Technical Preparation Hub
              </h1>
              <p className="text-xs sm:text-sm text-neutral-400 mt-0.5">
                Interactive node roadmaps, 34 day-wise courses with verified playlists, AI study tutors &amp; PDF exports.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <Button
                variant="outline"
                size="sm"
                onClick={() => exportCareerStudyPack(activeCareer, 'pdf')}
                className="text-xs rounded-xl border-cyan-500/45 text-cyan-200 hover:bg-cyan-500/20 cursor-pointer font-semibold"
              >
                <Download className="w-3.5 h-3.5 mr-1.5" /> Download Career Pack PDF
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => exportCareerStudyPack(activeCareer, 'md')}
                className="text-xs rounded-xl border-neutral-700 text-neutral-200 hover:bg-white/10 cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5 mr-1.5" /> Notes (.md)
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 items-start">
            <div className="xl:col-span-8 space-y-2.5">
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
                <span className="text-neutral-300 font-bold inline-flex items-center gap-1.5">
                  <Compass className="w-4 h-4 text-cyan-400" /> Target Role Selector (12 Roles):
                </span>
                <span className="text-[11px] text-neutral-400">
                  Synced Target Role:{' '}
                  <strong className="text-emerald-400">
                    {userProfile.targetRole || 'Software Engineer (SDE)'}
                  </strong>
                </span>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {CAREER_TRACKS.map((career) => {
                  const isSelected = career.id === activeCareer.id;
                  return (
                    <button
                      key={career.id}
                      type="button"
                      onClick={() => handleSelectCareer(career.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer border ${
                        isSelected
                          ? 'bg-cyan-500/20 text-cyan-200 border-cyan-400/60 font-bold shadow-sm shadow-cyan-500/20'
                          : 'bg-neutral-900/70 text-neutral-400 border-neutral-800 hover:text-white hover:border-neutral-700'
                      }`}
                    >
                      {career.name}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="xl:col-span-4 p-4 rounded-2xl bg-neutral-900/75 border border-neutral-800 space-y-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-white font-bold">{activeCareer.name}</span>
                <span className="text-emerald-400 font-bold">{careerCompletionPct}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-neutral-800 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-emerald-400 transition-all duration-500"
                  style={{ width: `${careerCompletionPct}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[11px] font-mono text-neutral-400">
                <span>
                  Completed Subtopics: {careerCompletedCount} / {careerSubtopics.length}
                </span>
                <span>{careerTopicCount} Topics</span>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-white/10 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search topics, subtopics, projects or Q&A..."
                className="w-full bg-neutral-900 border border-neutral-800 rounded-xl pl-8 pr-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-cyan-500/50"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1 bg-neutral-900 p-1 rounded-xl border border-neutral-800">
                {(['All', 'Beginner', 'Intermediate', 'Advanced'] as const).map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setLevelFilter(lvl)}
                    className={`px-3 py-1 rounded-lg text-[11px] font-medium cursor-pointer transition-colors ${
                      levelFilter === lvl
                        ? 'bg-cyan-500/20 text-cyan-200 font-bold'
                        : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={() => setSearchAllCareers((prev) => !prev)}
                className={`px-3 py-1.5 rounded-xl text-[11px] font-mono border cursor-pointer transition-colors ${
                  searchAllCareers
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                    : 'bg-neutral-900 text-neutral-400 border-neutral-800 hover:text-white'
                }`}
              >
                {searchAllCareers ? 'Searching All 12 Roles' : 'Scope: Active Career Only'}
              </button>
            </div>
          </div>
        </div>

        {/* ================================================================= */}
        {/* 2. 6 LEARNING PLATFORM TABS                                       */}
        {/* ================================================================= */}
        <div className="p-2.5 rounded-2xl border border-neutral-800 bg-neutral-950/85 backdrop-blur-xl flex flex-wrap items-center gap-1.5">
          {(
            [
              { id: 'roadmap', label: 'Visual Roadmap', icon: Layers },
              { id: 'courses', label: 'Course Explorer (Day-Wise)', icon: PlayCircle },
              { id: 'subjects', label: 'Core Subjects & Cheat Sheets', icon: BookOpen },
              { id: 'projects', label: 'Projects & Interview Q&A', icon: FolderGit2 },
              { id: 'aitools', label: 'AI Learning Tools', icon: Bot },
              { id: 'quiz', label: 'Technical Quiz (15–50 Qs)', icon: Award },
            ] as const
          ).map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setActiveTab(tab.id);
                  if (tab.id !== 'quiz') setQuizActive(false);
                }}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer inline-flex items-center gap-1.5 border ${
                  isActive
                    ? 'bg-white text-black border-white shadow-sm'
                    : 'bg-neutral-900 border-neutral-800 text-neutral-300 hover:text-white'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* CROSS-CAREER SEARCH RESULTS */}
        {searchAllCareers && qLower && (
          <div className="rounded-3xl border border-amber-500/30 bg-neutral-950/85 p-6 space-y-4">
            <h3 className="text-sm font-bold text-amber-300 font-mono">
              Cross-Career Search Matches ({crossCareerSearchResults.length})
            </h3>
            {crossCareerSearchResults.length === 0 ? (
              <p className="text-xs text-neutral-400">No subtopics matched "{searchQuery}".</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {crossCareerSearchResults.slice(0, 24).map(({ careerId, careerName, topicTitle, subtopic }) => (
                  <button
                    key={`${careerId}-${subtopic.id}`}
                    type="button"
                    onClick={() => {
                      setSelectedCareerId(careerId);
                      openSubtopicDrawer(subtopic, topicTitle);
                    }}
                    className="p-4 rounded-2xl border border-neutral-800 bg-neutral-900/60 hover:border-cyan-500/40 text-left space-y-1.5 cursor-pointer"
                  >
                    <span className="text-[10px] font-mono text-cyan-400">{careerName}</span>
                    <div className="text-xs font-bold text-white">{subtopic.title}</div>
                    <p className="text-[11px] text-neutral-400 line-clamp-2">
                      {subtopic.simpleExplanation}
                    </p>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ================================================================= */}
        {/* TAB 1: VISUAL ROADMAP (CONNECTED INTERACTIVE NODE TIMELINE)       */}
        {/* ================================================================= */}
        {activeTab === 'roadmap' && (
          <div className="space-y-6">
            {activeCareer.phases
              .filter((p) => levelFilter === 'All' || p.level === levelFilter)
              .map((phase) => {
                const phaseAllSubs = phase.topics.flatMap((t) => t.subtopics);
                const phaseDoneSubs = phaseAllSubs.filter((s) => completedIds.includes(s.id)).length;
                const phaseHeading =
                  phase.phaseNumber === 1
                    ? 'Phase 1: Beginner (Foundation)'
                    : phase.phaseNumber === 2
                    ? 'Phase 2: Intermediate (Core Placement)'
                    : 'Phase 3: Advanced (Job-Ready)';

                const visibleTopics = phase.topics
                  .map((topic) => {
                    const filteredSubs = topic.subtopics.filter((s) => {
                      const matchLvl = levelFilter === 'All' || s.level === levelFilter;
                      const matchQ =
                        !qLower ||
                        s.title.toLowerCase().includes(qLower) ||
                        s.simpleExplanation.toLowerCase().includes(qLower) ||
                        topic.title.toLowerCase().includes(qLower);
                      return matchLvl && matchQ;
                    });
                    return { topic, filteredSubs };
                  })
                  .filter((entry) => entry.filteredSubs.length > 0);

                if (visibleTopics.length === 0) return null;

                return (
                  <div
                    key={phase.phaseNumber}
                    className="rounded-3xl border border-neutral-800 bg-neutral-950/75 p-5 sm:p-7 backdrop-blur-xl shadow-xl space-y-5"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-neutral-800/80">
                      <div>
                        <span
                          className={`text-[10px] uppercase font-mono font-bold px-2.5 py-0.5 rounded-full border ${getLevelBadgeColor(
                            phase.level
                          )}`}
                        >
                          {phaseHeading}
                        </span>
                        <h3 className="text-lg font-bold text-white mt-2">{phase.title}</h3>
                        <p className="text-xs text-neutral-400">{phase.description}</p>
                      </div>

                      <div className="px-3.5 py-2 rounded-2xl bg-neutral-900 border border-neutral-800 text-xs font-mono text-emerald-300 font-bold shrink-0">
                        {phaseDoneSubs} / {phaseAllSubs.length} Subtopics Done
                      </div>
                    </div>

                    {/* Connected Vertical Milestone Node Timeline */}
                    <div className="relative pl-6 sm:pl-9 space-y-4 border-l-2 border-neutral-800 ml-2 sm:ml-4">
                      {visibleTopics.map(({ topic, filteredSubs }, tIdx) => {
                        const topicDone = topic.subtopics.filter((s) => completedIds.includes(s.id)).length;
                        const totalSubs = topic.subtopics.length;
                        const nodeStatus =
                          topicDone >= totalSubs && totalSubs > 0
                            ? 'completed'
                            : topicDone > 0
                            ? 'in_progress'
                            : 'pending';
                        const isExpanded = expandedNodeId === topic.id || Boolean(qLower);
                        const firstNextSub =
                          filteredSubs.find((s) => !completedIds.includes(s.id)) || filteredSubs[0];

                        const markerRing =
                          nodeStatus === 'completed'
                            ? 'bg-emerald-400 border-emerald-200 text-black'
                            : nodeStatus === 'in_progress'
                            ? 'bg-amber-400 border-amber-200 text-black'
                            : 'bg-neutral-900 border-cyan-500/60 text-cyan-300';

                        const statusBadge =
                          nodeStatus === 'completed'
                            ? { text: '✓ Completed', cls: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' }
                            : nodeStatus === 'in_progress'
                            ? { text: '● In Progress', cls: 'bg-amber-500/20 text-amber-300 border-amber-500/40' }
                            : { text: '○ Pending', cls: 'bg-white/5 text-neutral-400 border-white/10' };

                        return (
                          <div key={topic.id} className="relative">
                            {/* Node Circle on Vertical Line */}
                            <div
                              className={`absolute -left-[33px] sm:-left-[45px] top-5 w-5 h-5 rounded-full border-2 flex items-center justify-center text-[10px] font-bold shadow-md ${markerRing}`}
                            >
                              {nodeStatus === 'completed' ? '✓' : tIdx + 1}
                            </div>

                            <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 overflow-hidden transition-all hover:border-cyan-500/40">
                              {/* Clickable Node Bar */}
                              <div
                                role="button"
                                tabIndex={0}
                                onClick={() => setExpandedNodeId(isExpanded ? null : topic.id)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter' || e.key === ' ') {
                                    e.preventDefault();
                                    setExpandedNodeId(isExpanded ? null : topic.id);
                                  }
                                }}
                                className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-3 cursor-pointer"
                              >
                                <div className="space-y-1.5 min-w-0">
                                  <div className="flex flex-wrap items-center gap-2">
                                    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${statusBadge.cls}`}>
                                      {statusBadge.text}
                                    </span>
                                    <span className="text-[11px] font-mono text-cyan-300">
                                      [ {topicDone} / {totalSubs} ]
                                    </span>
                                  </div>
                                  <h4 className="text-sm sm:text-base font-bold text-white">
                                    {topic.title}
                                  </h4>
                                  <p className="text-xs text-neutral-400 line-clamp-1">{topic.summary}</p>
                                </div>

                                <div className="flex flex-wrap items-center gap-1.5 shrink-0">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      if (firstNextSub) openSubtopicDrawer(firstNextSub, topic.title);
                                    }}
                                    className="text-xs cursor-pointer rounded-xl border-neutral-700 hover:bg-white hover:text-black font-semibold"
                                  >
                                    Learn <ChevronRight className="w-3.5 h-3.5 ml-1" />
                                  </Button>
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handlePracticeTopic(topic.title);
                                    }}
                                    className="px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-neutral-800 hover:bg-emerald-500/20 text-emerald-300 border border-neutral-700 cursor-pointer"
                                  >
                                    Practice
                                  </button>
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDownloadTopicPdf(topic);
                                    }}
                                    className="px-2.5 py-1.5 rounded-xl text-[11px] font-mono font-semibold bg-neutral-950 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/35 inline-flex items-center gap-1 cursor-pointer"
                                  >
                                    <Download className="w-3 h-3" /> PDF
                                  </button>
                                  {isExpanded ? (
                                    <ChevronUp className="w-4 h-4 text-cyan-400 ml-1" />
                                  ) : (
                                    <ChevronDown className="w-4 h-4 text-neutral-400 ml-1" />
                                  )}
                                </div>
                              </div>

                              {/* Expanded Node Subtopics Grid */}
                              <AnimatePresence>
                                {isExpanded && (
                                  <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="border-t border-neutral-800/80 p-4 bg-neutral-950/60"
                                  >
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                      {filteredSubs.map((sub) => {
                                        const isDone = completedIds.includes(sub.id);
                                        return (
                                          <div
                                            key={sub.id}
                                            className={`flex items-center justify-between gap-2 px-3 py-2 rounded-xl border text-xs transition-colors ${
                                              isDone
                                                ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-200'
                                                : 'bg-neutral-900/70 border-neutral-800 text-neutral-200 hover:border-cyan-500/40'
                                            }`}
                                          >
                                            <button
                                              type="button"
                                              onClick={() => handleToggleSubtopic(sub.id)}
                                              aria-label={`Toggle ${sub.title}`}
                                              className={`font-mono font-bold shrink-0 cursor-pointer ${
                                                isDone ? 'text-emerald-400' : 'text-neutral-500 hover:text-white'
                                              }`}
                                            >
                                              {isDone ? '[✓]' : '[ ]'}
                                            </button>
                                            <button
                                              type="button"
                                              onClick={() => openSubtopicDrawer(sub, topic.title)}
                                              className="flex-1 text-left truncate hover:text-cyan-300 cursor-pointer font-medium"
                                            >
                                              {sub.title}
                                            </button>
                                            <button
                                              type="button"
                                              onClick={() => openSubtopicDrawer(sub, topic.title)}
                                              className="text-neutral-400 hover:text-cyan-300 font-mono shrink-0 cursor-pointer"
                                            >
                                              [&gt;]
                                            </button>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
          </div>
        )}

        {/* ================================================================= */}
        {/* TAB 2: COURSE EXPLORER (DAY-WISE SPLIT WORKSPACE)                 */}
        {/* ================================================================= */}
        {activeTab === 'courses' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            {/* LEFT SEARCHABLE COURSE SIDEBAR */}
            <div className="lg:col-span-4 rounded-3xl border border-neutral-800 bg-neutral-950/85 p-5 backdrop-blur-xl shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-white">
                  Shared Course Library ({SHARED_COURSES.length})
                </h2>
                <span className="text-[11px] font-mono text-emerald-400">
                  {courseProgress.streakDays || 0}d Streak
                </span>
              </div>

              <div className="relative">
                <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={courseSearch}
                  onChange={(e) => setCourseSearch(e.target.value)}
                  placeholder="Search Java, Python, DSA, SQL, React..."
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-xl pl-8 pr-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-cyan-500/50"
                />
              </div>

              <div className="flex flex-wrap gap-1.5">
                {COURSE_CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCourseCategory(cat)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-medium border cursor-pointer transition-colors ${
                      courseCategory === cat
                        ? 'bg-cyan-500/20 text-cyan-200 border-cyan-500/40 font-bold'
                        : 'bg-neutral-900 text-neutral-400 border-neutral-800 hover:text-white'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={() => setOnlyRoleCourses((prev) => !prev)}
                className={`w-full px-3 py-2 rounded-xl text-xs font-mono border text-left flex items-center justify-between gap-2 cursor-pointer ${
                  onlyRoleCourses
                    ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40'
                    : 'bg-neutral-900 text-neutral-300 border-neutral-800 hover:border-neutral-700'
                }`}
              >
                <span className="font-semibold whitespace-nowrap">Recommended for Role</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/5 shrink-0">
                  {onlyRoleCourses ? 'Role Only' : 'All'}
                </span>
              </button>

              <div className="max-h-[540px] overflow-y-auto pr-1 space-y-2">
                {filteredCourses.map((course) => {
                  const isSel = course.id === activeCourse.id;
                  const priority = getCoursePriorityForCareer(course, activeCareer.id);
                  const doneCount = (courseProgress.courses[course.id] || []).length;

                  return (
                    <button
                      key={course.id}
                      type="button"
                      onClick={() => handleSelectCourse(course.id)}
                      className={`w-full text-left p-3.5 rounded-2xl border transition-all cursor-pointer space-y-1.5 ${
                        isSel
                          ? 'bg-cyan-500/15 border-cyan-400/60 shadow-sm'
                          : 'bg-neutral-900/60 border-neutral-800 hover:border-neutral-700'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span
                          className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${getPriorityBadgeStyle(
                            priority
                          )}`}
                        >
                          {priority}
                        </span>
                        <span className="text-[10px] font-mono text-neutral-400">
                          {course.durationDays} Days
                        </span>
                      </div>
                      <div className="text-xs font-bold text-white leading-snug">
                        {course.title}
                      </div>
                      <div className="flex items-center justify-between text-[10px] font-mono text-neutral-400">
                        <span>{course.category}</span>
                        <span className="text-emerald-400">
                          {doneCount}/{course.durationDays} Done
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* RIGHT DAY-WISE LEARNING WORKSPACE */}
            <div className="lg:col-span-8 space-y-4">
              {/* Course Header */}
              <div className="rounded-3xl border border-neutral-800 bg-neutral-950/85 p-6 backdrop-blur-xl shadow-xl space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                        {activeCourse.category}
                      </span>
                      <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-white/5 text-neutral-300 border border-white/10">
                        {activeCourse.durationDays}-Day Guided Plan
                      </span>
                      <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                        {activeCourse.playlistVerified}
                      </span>
                    </div>
                    <h2 className="text-xl font-extrabold text-white">{activeCourse.title}</h2>
                    <p className="text-xs text-neutral-300 leading-relaxed">
                      {activeCourse.shortSummary}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => downloadCourseStudyPlanPDF(activeCourse)}
                      className="text-xs rounded-xl border-cyan-500/40 text-cyan-300 hover:bg-cyan-500/15 cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5 mr-1.5" /> Download Course PDF
                    </Button>

                    {!confirmResetCourse ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setConfirmResetCourse(true)}
                        className="text-xs text-neutral-400 hover:text-rose-300 cursor-pointer"
                      >
                        <RotateCcw className="w-3.5 h-3.5 mr-1" /> Reset Progress
                      </Button>
                    ) : (
                      <div className="flex items-center gap-1.5 bg-rose-950/40 border border-rose-500/40 px-2.5 py-1 rounded-xl">
                        <span className="text-[11px] text-rose-200">Reset all days?</span>
                        <button
                          type="button"
                          onClick={handleResetCourseProgress}
                          className="text-[11px] font-bold text-rose-300 underline cursor-pointer"
                        >
                          Confirm
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmResetCourse(false)}
                          className="text-[11px] text-neutral-400 cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-neutral-400">
                      Day {activeCourseCompletedDays.length} / {activeCourse.durationDays} Completed
                    </span>
                    <span className="text-emerald-400 font-bold">{activeCoursePct}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-neutral-800 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-emerald-400 transition-all duration-300"
                      style={{ width: `${activeCoursePct}%` }}
                    />
                  </div>
                </div>

                {/* Interactive Day Selector Pills */}
                <div className="space-y-1.5 pt-2 border-t border-white/10">
                  <span className="text-[10px] font-mono uppercase text-neutral-400 font-bold block">
                    Select Study Day:
                  </span>
                  <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto pr-1">
                    {activeCourse.days.map((d) => {
                      const isDaySel = d.dayNumber === activeCourseDay.dayNumber;
                      const isDayDone = activeCourseCompletedDays.includes(d.dayNumber);
                      return (
                        <button
                          key={d.dayNumber}
                          type="button"
                          onClick={() => setSelectedDayNum(d.dayNumber)}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-mono border cursor-pointer transition-colors ${
                            isDaySel
                              ? 'bg-white text-black border-white font-bold'
                              : isDayDone
                              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                              : 'bg-neutral-900 text-neutral-400 border-neutral-800 hover:text-white'
                          }`}
                        >
                          Day {d.dayNumber} {isDayDone ? '✓' : ''}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Active Day Card */}
              <div className="rounded-3xl border border-neutral-800 bg-neutral-950/90 p-6 backdrop-blur-xl shadow-xl space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-white/10">
                  <div>
                    <span className="text-[11px] font-mono text-cyan-400 font-bold">
                      Day {activeCourseDay.dayNumber} of {activeCourse.durationDays} • Est.{' '}
                      {activeCourseDay.estimatedMinutes} mins
                    </span>
                    <h3 className="text-lg font-extrabold text-white mt-0.5">
                      {activeCourseDay.title}
                    </h3>
                  </div>
                  <span
                    className={`text-[10px] font-mono font-bold px-2.5 py-1 rounded-full border ${getLevelBadgeColor(
                      activeCourseDay.youtube.tutorial.level
                    )}`}
                  >
                    {activeCourseDay.youtube.tutorial.level}
                  </span>
                </div>

                {/* Explanation + Subtopics */}
                <div className="space-y-3">
                  <p className="text-xs sm:text-sm text-neutral-200 leading-relaxed">
                    {activeCourseDay.simpleExplanation}
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-3.5 rounded-2xl bg-neutral-900/60 border border-neutral-800 space-y-1.5">
                      <span className="text-[11px] font-bold text-white block">Today’s Subtopics</span>
                      <ul className="space-y-1 text-xs text-neutral-300">
                        {activeCourseDay.subtopics.map((st, idx) => (
                          <li key={idx} className="flex items-start gap-1.5">
                            <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                            <span>{st}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 space-y-1.5">
                      <span className="text-[11px] font-bold text-emerald-300 block">
                        Daily Hands-On Assignment
                      </span>
                      <p className="text-xs text-emerald-100 leading-relaxed">
                        {activeCourseDay.dailyAssignment}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Code Example */}
                {activeCourseDay.codeExample && (
                  <pre className="p-4 rounded-2xl bg-[#0d0d11] border border-neutral-800 text-xs font-mono text-emerald-300 overflow-x-auto leading-relaxed">
                    <code>{activeCourseDay.codeExample}</code>
                  </pre>
                )}

                {/* 4 Action Buttons + Hindi/Docs Secondary Links */}
                <div className="space-y-2.5 pt-2 border-t border-white/10">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <a
                      href={activeCourseDay.youtube.tutorial.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/35 text-rose-200 text-xs font-semibold flex items-center justify-between transition-colors"
                    >
                      <span className="inline-flex items-center gap-2">
                        <Video className="w-4 h-4 text-rose-400" />
                        <span>Watch YouTube Tutorial ({activeCourseDay.youtube.tutorial.language})</span>
                      </span>
                      <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                    </a>

                    <a
                      href={activeCourseDay.youtube.playlist.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-white text-xs font-semibold flex items-center justify-between transition-colors"
                    >
                      <span className="inline-flex items-center gap-2">
                        <PlayCircle className="w-4 h-4 text-cyan-400" />
                        <span>Watch Complete Playlist ({activeCourse.playlistVerified})</span>
                      </span>
                      <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                    </a>

                    <a
                      href={activeCourseDay.docs[0]?.url || activeCourse.officialDocsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2.5 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/35 text-cyan-200 text-xs font-semibold flex items-center justify-between transition-colors"
                    >
                      <span className="inline-flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-cyan-300" />
                        <span>Read Official Docs</span>
                      </span>
                      <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                    </a>

                    <button
                      type="button"
                      onClick={() =>
                        handleCopyText(
                          `day-${activeCourse.id}-${activeCourseDay.dayNumber}`,
                          buildSubtopicAIPrompt(
                            activeCareer.name,
                            activeCourse.title,
                            activeCourseDay.title
                          )
                        )
                      }
                      className="px-4 py-2.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/35 text-emerald-200 text-xs font-semibold flex items-center justify-between cursor-pointer transition-colors"
                    >
                      <span className="inline-flex items-center gap-2">
                        <Bot className="w-4 h-4 text-emerald-300" />
                        <span>
                          {copiedId === `day-${activeCourse.id}-${activeCourseDay.dayNumber}`
                            ? 'Copied Study Prompt!'
                            : 'Ask AI (Copy Study Prompt)'}
                        </span>
                      </span>
                      <Copy className="w-3.5 h-3.5 shrink-0" />
                    </button>
                  </div>

                  {/* Quick Hindi Video + Gemini/ChatGPT Launchers */}
                  <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono text-neutral-400 pt-1">
                    <a
                      href={activeCourseDay.youtube.examples.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-amber-300 hover:underline inline-flex items-center gap-1"
                    >
                      <Video className="w-3.5 h-3.5" /> Hindi Practical Examples (
                      {activeCourseDay.youtube.examples.channel}) ↗
                    </a>
                    <div className="flex items-center gap-3">
                      <a
                        href="https://gemini.google.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-cyan-300 hover:underline"
                      >
                        Open Gemini ↗
                      </a>
                      <a
                        href="https://chatgpt.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-emerald-300 hover:underline"
                      >
                        Open ChatGPT ↗
                      </a>
                      <a
                        href="https://claude.ai"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-neutral-200 hover:underline"
                      >
                        Open Claude ↗
                      </a>
                    </div>
                  </div>
                </div>

                {/* Footer Controls: Previous Day / Mark Day Completed / Next Day */}
                <div className="pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={activeCourseDay.dayNumber <= 1}
                    onClick={() => setSelectedDayNum((n) => Math.max(1, n - 1))}
                    className="text-xs cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Previous Day
                  </Button>

                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleToggleCourseDay(activeCourseDay.dayNumber)}
                    className={`text-xs font-bold cursor-pointer px-4 rounded-xl ${
                      activeCourseCompletedDays.includes(activeCourseDay.dayNumber)
                        ? 'bg-emerald-500/20 border border-emerald-500/50 text-emerald-300'
                        : 'bg-gradient-to-r from-cyan-400 to-emerald-400 text-black'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
                    {activeCourseCompletedDays.includes(activeCourseDay.dayNumber)
                      ? `Day ${activeCourseDay.dayNumber} Completed ✓ (Undo)`
                      : '✓ Mark Day Completed'}
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    disabled={activeCourseDay.dayNumber >= activeCourse.durationDays}
                    onClick={() =>
                      setSelectedDayNum((n) => Math.min(activeCourse.durationDays, n + 1))
                    }
                    className="text-xs cursor-pointer"
                  >
                    Next Day <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* TAB 3: CORE SUBJECTS & CHEAT SHEETS                               */}
        {/* ================================================================= */}
        {activeTab === 'subjects' && (
          <div className="space-y-8">
            {/* Core Subjects */}
            <div className="space-y-4">
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-cyan-400" />
                <span>{activeCareer.name} — Core Subjects &amp; Modules</span>
              </h2>
              {activeCareer.coreSubjects.map((mod) => {
                const filteredSubs = mod.subtopics.filter(
                  (s) =>
                    (levelFilter === 'All' || s.level === levelFilter) &&
                    (!qLower ||
                      s.title.toLowerCase().includes(qLower) ||
                      s.simpleExplanation.toLowerCase().includes(qLower) ||
                      mod.title.toLowerCase().includes(qLower))
                );
                if (qLower && filteredSubs.length === 0) return null;

                const isExpanded = openModuleId === mod.id || Boolean(qLower);
                const modDoneCount = mod.subtopics.filter((s) => completedIds.includes(s.id)).length;

                return (
                  <div
                    key={mod.id}
                    className="rounded-3xl border border-neutral-800 bg-neutral-950/80 backdrop-blur-xl shadow-xl overflow-hidden"
                  >
                    <div
                      role="button"
                      tabIndex={0}
                      onClick={() => setOpenModuleId(isExpanded ? null : mod.id)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          setOpenModuleId(isExpanded ? null : mod.id);
                        }
                      }}
                      className="w-full p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-3 text-left hover:bg-neutral-900/50 transition-colors cursor-pointer"
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[10px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                            {mod.kind}
                          </span>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/5 text-neutral-300 border border-white/10">
                            {mod.badge}
                          </span>
                          <span className="text-[11px] font-mono text-emerald-400">
                            {modDoneCount} / {mod.subtopics.length} mastered
                          </span>
                        </div>
                        <h3 className="text-base sm:text-lg font-bold text-white">{mod.title}</h3>
                        <p className="text-xs text-neutral-400">{mod.summary}</p>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            exportSubjectModule(activeCareer.name, mod, 'pdf');
                          }}
                          className="px-2.5 py-1.5 rounded-xl text-[11px] font-semibold bg-neutral-900 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/35 inline-flex items-center gap-1 cursor-pointer"
                        >
                          <Download className="w-3 h-3" /> Download PDF
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            exportSubjectModule(activeCareer.name, mod, 'md');
                          }}
                          className="px-2.5 py-1.5 rounded-xl text-[11px] font-semibold bg-neutral-900 hover:bg-white/10 text-neutral-200 border border-neutral-700 inline-flex items-center gap-1 cursor-pointer"
                        >
                          <FileText className="w-3 h-3" /> .md
                        </button>
                        <span className="text-xs font-mono text-neutral-400 ml-1 inline-flex items-center gap-1">
                          {mod.subtopics.length} Topics
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4 text-cyan-400" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-neutral-400" />
                          )}
                        </span>
                      </div>
                    </div>

                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="border-t border-neutral-800/80 p-5 sm:p-6 bg-neutral-950/60"
                        >
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                            {filteredSubs.map((sub, idx) => {
                              const isDone = completedIds.includes(sub.id);
                              return (
                                <div
                                  key={sub.id}
                                  className={`rounded-2xl border p-4 flex flex-col justify-between space-y-3 transition-all ${
                                    isDone
                                      ? 'bg-emerald-950/15 border-emerald-500/35'
                                      : 'bg-neutral-900/60 border-neutral-800 hover:border-cyan-500/40'
                                  }`}
                                >
                                  <div className="space-y-2">
                                    <div className="flex items-center justify-between gap-2">
                                      <span className="text-[10px] font-mono text-neutral-400">
                                        #{idx + 1} • {sub.estimatedTime}
                                      </span>
                                      <span
                                        className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${getLevelBadgeColor(
                                          sub.level
                                        )}`}
                                      >
                                        {sub.level}
                                      </span>
                                    </div>
                                    <h4 className="text-sm font-bold text-white leading-snug">
                                      {sub.title}
                                    </h4>
                                    <p className="text-xs text-neutral-400 line-clamp-2 leading-relaxed">
                                      {sub.simpleExplanation}
                                    </p>
                                  </div>

                                  <div className="pt-2.5 border-t border-white/10 flex items-center justify-between gap-2">
                                    <button
                                      type="button"
                                      onClick={() => handleToggleSubtopic(sub.id)}
                                      className={`text-[11px] font-mono font-semibold inline-flex items-center gap-1 cursor-pointer ${
                                        isDone
                                          ? 'text-emerald-400'
                                          : 'text-neutral-400 hover:text-white'
                                      }`}
                                    >
                                      <CheckCircle2 className="w-3.5 h-3.5" />
                                      <span>{isDone ? 'Completed' : 'Done'}</span>
                                    </button>
                                    <div className="flex items-center gap-1.5">
                                      <button
                                        type="button"
                                        onClick={() => handlePracticeTopic(sub.title)}
                                        className="px-2.5 py-1 rounded-xl text-[11px] font-semibold bg-neutral-800 hover:bg-emerald-500/20 text-emerald-300 border border-neutral-700 cursor-pointer"
                                      >
                                        Practice
                                      </button>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => openSubtopicDrawer(sub, mod.title)}
                                        className="text-xs cursor-pointer rounded-xl border-neutral-700 hover:bg-white hover:text-black font-semibold"
                                      >
                                        Learn <ChevronRight className="w-3.5 h-3.5 ml-1" />
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>

            {/* Quick Cheat Sheets Section */}
            <div className="space-y-4">
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-400" />
                <span>{activeCareer.name} — Quick Cheat Sheets</span>
              </h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {activeCareer.cheatSheets
                  .filter(
                    (cs) =>
                      !qLower ||
                      cs.title.toLowerCase().includes(qLower) ||
                      cs.description.toLowerCase().includes(qLower)
                  )
                  .map((sheet) => (
                    <div
                      key={sheet.id}
                      className="rounded-3xl border border-neutral-800 bg-neutral-950/80 p-6 backdrop-blur-xl shadow-xl space-y-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <span className="text-[10px] font-mono uppercase font-bold px-2.5 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                            {sheet.badge}
                          </span>
                          <h3 className="text-base sm:text-lg font-bold text-white mt-2">
                            {sheet.title}
                          </h3>
                          <p className="text-xs text-neutral-400 mt-0.5">{sheet.description}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => exportCheatSheetCard(activeCareer.name, sheet, 'pdf')}
                          className="px-2.5 py-1.5 rounded-xl text-[11px] font-semibold bg-neutral-900 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/35 inline-flex items-center gap-1 cursor-pointer shrink-0"
                        >
                          <Download className="w-3 h-3" /> Download PDF
                        </button>
                      </div>

                      {sheet.rows && sheet.rows.length > 0 && (
                        <div className="overflow-x-auto rounded-2xl border border-neutral-800">
                          <table className="w-full text-left text-xs">
                            <thead className="bg-neutral-900/90 text-neutral-300 font-mono text-[11px]">
                              <tr>
                                <th className="px-3.5 py-2.5">Concept / Command</th>
                                <th className="px-3.5 py-2.5">Metric / Syntax</th>
                                <th className="px-3.5 py-2.5">Key Takeaway</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-800/80">
                              {sheet.rows.map((r, i) => (
                                <tr key={i} className="hover:bg-white/[0.02]">
                                  <td className="px-3.5 py-2.5 font-semibold text-white whitespace-nowrap">
                                    {r.item}
                                  </td>
                                  <td className="px-3.5 py-2.5 font-mono text-cyan-300">
                                    {r.syntaxOrRule}
                                  </td>
                                  <td className="px-3.5 py-2.5 text-neutral-300">{r.note}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}

                      {sheet.bullets && sheet.bullets.length > 0 && (
                        <ul className="space-y-2 text-xs text-neutral-200 bg-neutral-900/50 p-4 rounded-2xl border border-neutral-800/80">
                          {sheet.bullets.map((b, idx) => (
                            <li key={idx} className="flex items-start gap-2 leading-relaxed">
                              <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                              <span>{b}</span>
                            </li>
                          ))}
                        </ul>
                      )}

                      {sheet.codeSnippet && (
                        <pre className="p-3.5 rounded-2xl bg-[#0d0d11] border border-neutral-800 text-xs font-mono text-emerald-300 overflow-x-auto">
                          <code>{sheet.codeSnippet}</code>
                        </pre>
                      )}
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* TAB 4: PROJECTS (6 PER ROLE) & COMPANY-FILTERED INTERVIEW Q&A     */}
        {/* ================================================================= */}
        {activeTab === 'projects' && (
          <div className="space-y-8">
            <div className="space-y-4">
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <FolderGit2 className="w-4 h-4 text-cyan-400" />
                <span>{activeCareer.name} — Portfolio Projects (6 Curated Builds)</span>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {activeCareer.projects
                  .filter(
                    (pr) =>
                      (levelFilter === 'All' || pr.level === levelFilter) &&
                      (!qLower ||
                        pr.title.toLowerCase().includes(qLower) ||
                        pr.problemStatement.toLowerCase().includes(qLower))
                  )
                  .map((proj) => {
                    const isDefOpen = openDefenseId === proj.id;
                    return (
                      <div
                        key={proj.id}
                        className="rounded-3xl border border-neutral-800 bg-neutral-950/80 p-6 backdrop-blur-xl shadow-xl flex flex-col justify-between space-y-4"
                      >
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span
                              className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full border ${getLevelBadgeColor(
                                proj.level
                              )}`}
                            >
                              {proj.level} Portfolio Project
                            </span>
                            <FolderGit2 className="w-4 h-4 text-cyan-400" />
                          </div>
                          <h3 className="text-base font-bold text-white leading-snug">{proj.title}</h3>
                          <p className="text-xs text-neutral-300 leading-relaxed">
                            <strong className="text-white block mb-0.5">Problem Statement:</strong>
                            {proj.problemStatement}
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            {proj.techStack.map((t) => (
                              <span
                                key={t}
                                className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-neutral-900 border border-neutral-800 text-cyan-300"
                              >
                                {t}
                              </span>
                            ))}
                          </div>
                          <ul className="space-y-1 text-xs text-neutral-300">
                            {proj.keyFeatures.map((f, i) => (
                              <li key={i} className="flex items-start gap-1.5">
                                <span className="text-emerald-400">•</span>
                                <span>{f}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div className="space-y-2.5">
                          <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-200">
                            <strong className="text-emerald-300 block mb-0.5">Expected Outcome:</strong>
                            {proj.expectedOutcome}
                          </div>

                          {proj.interviewDefense && (
                            <div className="rounded-2xl border border-cyan-500/30 bg-neutral-900/70 overflow-hidden">
                              <button
                                type="button"
                                onClick={() => setOpenDefenseId(isDefOpen ? null : proj.id)}
                                className="w-full px-3.5 py-2.5 flex items-center justify-between text-xs font-bold text-cyan-300 hover:bg-cyan-500/10 cursor-pointer transition-colors"
                              >
                                <span className="inline-flex items-center gap-1.5">
                                  <ShieldCheck className="w-3.5 h-3.5" />
                                  Interview Defense Guide
                                </span>
                                {isDefOpen ? (
                                  <ChevronUp className="w-3.5 h-3.5" />
                                ) : (
                                  <ChevronDown className="w-3.5 h-3.5" />
                                )}
                              </button>

                              <AnimatePresence>
                                {isDefOpen && (
                                  <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="px-3.5 pb-3.5 pt-2 border-t border-neutral-800 space-y-2.5 text-xs"
                                  >
                                    <div>
                                      <span className="text-[10px] font-mono uppercase text-emerald-400 font-bold block mb-0.5">
                                        60-Second Architecture Pitch
                                      </span>
                                      <p className="text-neutral-200 leading-relaxed">
                                        {proj.interviewDefense.pitch60Sec}
                                      </p>
                                    </div>
                                    <div>
                                      <span className="text-[10px] font-mono uppercase text-amber-300 font-bold block mb-1">
                                        Likely Follow-Up Questions
                                      </span>
                                      <ul className="space-y-1 text-neutral-300">
                                        {proj.interviewDefense.likelyGrillQuestions.map((gq, qIdx) => (
                                          <li key={qIdx} className="flex items-start gap-1.5">
                                            <span className="text-cyan-400 font-mono">{qIdx + 1}.</span>
                                            <span>{gq}</span>
                                          </li>
                                        ))}
                                      </ul>
                                    </div>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>

            {/* Company Pattern Filter + Interview Q&A */}
            {renderCompanyFilterBar()}

            <div className="rounded-3xl border border-neutral-800 bg-neutral-950/80 p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-emerald-400" />
                  <span>{activeCareer.name} — Interview Q&amp;A</span>
                </h3>
                <span className="text-[11px] font-mono text-neutral-400">
                  Expand any question for Model Answer &amp; Key Talking Points
                </span>
              </div>

              <div className="space-y-3">
                {filteredQAList.map(({ qa, matched }) => {
                  const isOpen = openQAId === qa.id;
                  return (
                    <div
                      key={qa.id}
                      className={`rounded-2xl border overflow-hidden ${
                        matched
                          ? 'border-emerald-500/40 bg-emerald-950/10'
                          : 'border-neutral-800 bg-neutral-900/50'
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => setOpenQAId(isOpen ? null : qa.id)}
                        className="w-full text-left p-4 sm:p-5 flex items-center justify-between gap-4 cursor-pointer hover:bg-neutral-900/80 transition-colors"
                      >
                        <div className="space-y-1.5">
                          <div className="flex flex-wrap items-center gap-2">
                            <span
                              className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${getLevelBadgeColor(
                                qa.level
                              )}`}
                            >
                              {qa.level}
                            </span>
                            <span className="text-[11px] font-mono text-cyan-400">{qa.topic}</span>
                            {matched && selectedCompany !== 'All Companies' && (
                              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/35">
                                High-Frequency at {selectedCompany}
                              </span>
                            )}
                          </div>
                          <p className="text-xs sm:text-sm font-semibold text-white">
                            {qa.question}
                          </p>
                        </div>
                        {isOpen ? (
                          <ChevronUp className="w-4 h-4 text-neutral-400 shrink-0" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-neutral-400 shrink-0" />
                        )}
                      </button>

                      <AnimatePresence>
                        {isOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="px-5 pb-5 border-t border-neutral-800/80 pt-4 bg-neutral-950/60 space-y-3"
                          >
                            <div className="space-y-1">
                              <span className="text-[10px] font-mono uppercase font-bold text-emerald-400">
                                Model Answer
                              </span>
                              <p className="text-xs sm:text-sm text-neutral-200 leading-relaxed">
                                {qa.answer}
                              </p>
                            </div>

                            {qa.talkingPoints && qa.talkingPoints.length > 0 && (
                              <div className="p-3 rounded-xl bg-neutral-900/80 border border-neutral-800 space-y-1.5">
                                <span className="text-[10px] font-mono uppercase font-bold text-cyan-300 flex items-center gap-1.5">
                                  <ListChecks className="w-3.5 h-3.5" /> Key Talking Points
                                </span>
                                <ul className="space-y-1 text-xs text-neutral-300">
                                  {qa.talkingPoints.map((pt, i) => (
                                    <li key={i} className="flex items-start gap-2">
                                      <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                                      <span>{pt}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* TAB 5: AI LEARNING TOOLS & 1-CLICK STUDY PROMPTS                  */}
        {/* ================================================================= */}
        {activeTab === 'aitools' && (
          <div className="space-y-6">
            <div className="rounded-3xl border border-cyan-500/30 bg-gradient-to-r from-cyan-500/10 via-neutral-950 to-neutral-900 p-6 backdrop-blur-xl space-y-2">
              <div className="inline-flex items-center gap-2 text-xs font-mono font-bold text-cyan-300">
                <Bot className="w-4 h-4" /> AI Study Co-Pilot Ecosystem (Learn Responsibly)
              </div>
              <h2 className="text-lg sm:text-xl font-extrabold text-white">
                Use AI Tools to Understand Deeply — Not Skip Fundamentals
              </h2>
              <p className="text-xs sm:text-sm text-neutral-300 max-w-3xl">
                Copy role-tuned study prompts to request hints first, critique your complexity, debug stack traces, or build flashcards atop exported PlacePilot PDFs.
              </p>
            </div>

            {/* 7 AI Learning Tools Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {AI_LEARNING_TOOLS.map((tool) => (
                <div
                  key={tool.id}
                  className="rounded-3xl border border-neutral-800 bg-neutral-950/85 p-6 backdrop-blur-xl shadow-xl flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                        {tool.tier}
                      </span>
                      <Bot className="w-4 h-4 text-cyan-400" />
                    </div>
                    <h3 className="text-base font-bold text-white">{tool.name}</h3>
                    <p className="text-xs text-neutral-300 leading-relaxed">{tool.purpose}</p>

                    <div className="flex flex-wrap gap-1.5">
                      {tool.bestCourses.map((c) => (
                        <span
                          key={c}
                          className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 border border-white/10 text-cyan-200"
                        >
                          {c}
                        </span>
                      ))}
                    </div>

                    <div className="p-3 rounded-2xl bg-neutral-900/75 border border-neutral-800 text-[11px] text-neutral-300 leading-relaxed">
                      <strong className="text-amber-300 block mb-0.5">Smart Usage Rule:</strong>
                      {tool.responsibleUseRule}
                    </div>
                  </div>

                  <a
                    href={tool.officialUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-neutral-200 text-black text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <span>Open Tool</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              ))}
            </div>

            {/* Subject-Filtered Ready-to-Copy Prompts */}
            <div className="rounded-3xl border border-neutral-800 bg-neutral-950/85 p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <h3 className="text-base sm:text-lg font-bold text-white">
                  1-Click Copy Study Prompts by Subject
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {AI_SUBJECT_FILTERS.map((subj) => (
                    <button
                      key={subj}
                      type="button"
                      onClick={() => setAiSubject(subj)}
                      className={`px-2.5 py-1 rounded-xl text-[11px] font-mono border cursor-pointer ${
                        aiSubject === subj
                          ? 'bg-cyan-500/20 text-cyan-200 border-cyan-500/40 font-bold'
                          : 'bg-neutral-900 text-neutral-400 border-neutral-800 hover:text-white'
                      }`}
                    >
                      {subj}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {AI_STUDY_PROMPTS.filter((p) => aiSubject === 'All' || p.subject === aiSubject).map(
                  (tpl) => {
                    const isCopied = copiedId === tpl.id;
                    return (
                      <div
                        key={tpl.id}
                        className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-4 flex flex-col justify-between space-y-3"
                      >
                        <div className="space-y-2">
                          <div className="flex items-center justify-between gap-2 text-[10px] font-mono">
                            <span className="px-2 py-0.5 rounded bg-cyan-500/15 text-cyan-300 border border-cyan-500/25 font-bold">
                              {tpl.subject}
                            </span>
                            <span className="text-neutral-400">Best in: {tpl.recommendedTool}</span>
                          </div>
                          <h4 className="text-sm font-bold text-white">{tpl.title}</h4>
                          <pre className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 text-[11px] font-mono text-neutral-300 whitespace-pre-wrap leading-relaxed">
                            {tpl.prompt}
                          </pre>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleCopyText(tpl.id, tpl.prompt)}
                          className={`w-full py-2 rounded-xl text-xs font-semibold border flex items-center justify-center gap-1.5 cursor-pointer transition-colors ${
                            isCopied
                              ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                              : 'bg-neutral-800 hover:bg-white hover:text-black border-neutral-700 text-white'
                          }`}
                        >
                          {isCopied ? (
                            <>
                              <Check className="w-3.5 h-3.5" /> Copied Prompt!
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" /> Copy Study Prompt
                            </>
                          )}
                        </button>
                      </div>
                    );
                  }
                )}
              </div>
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* TAB 6: TECHNICAL QUIZ (CAREER + COMPANY SCOPED 15-50 Qs)          */}
        {/* ================================================================= */}
        {activeTab === 'quiz' && (
          <div className="space-y-5">
            {!quizActive && renderCompanyFilterBar()}

            {!quizActive && (
              <div className="rounded-3xl border border-cyan-500/30 bg-gradient-to-r from-cyan-500/10 via-neutral-950 to-neutral-900 p-6 backdrop-blur-xl shadow-xl space-y-5">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[10px] font-mono uppercase font-bold px-2.5 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                        Scoped Technical Assessment
                      </span>
                      <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                        Target: {selectedCompany}
                      </span>
                    </div>
                    <h3 className="text-lg sm:text-xl font-extrabold text-white mt-2">
                      {activeCareer.name} — Role Practice Quiz
                    </h3>
                    <p className="text-xs text-neutral-300 mt-1">
                      Tailored for <strong className="text-white">{selectedCompany}</strong> on{' '}
                      <strong className="text-cyan-300">{quizFocusTopic}</strong> with 15 to 50 timed MCQs.
                    </p>
                  </div>

                  <Button
                    variant="primary"
                    size="md"
                    isLoading={isLoadingQuiz}
                    disabled={isLoadingQuiz}
                    onClick={() => handleLaunchCareerQuiz(20, false)}
                    className="bg-gradient-to-r from-cyan-400 to-emerald-400 text-black font-bold cursor-pointer rounded-xl px-5 shrink-0"
                  >
                    {isLoadingQuiz ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-1.5" />
                    ) : (
                      <Play className="w-4 h-4 mr-1.5" />
                    )}
                    Start Quiz (20 Qs)
                  </Button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-white/10 text-xs">
                  <div className="space-y-1">
                    <label className="text-neutral-300 font-semibold block">
                      AI Practice Set Size
                    </label>
                    <select
                      aria-label="Technical Quiz Question Count"
                      value={quizCount}
                      onChange={(e) =>
                        setQuizCount(Number(e.target.value) as 15 | 20 | 30 | 40 | 50)
                      }
                      className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-white font-mono cursor-pointer"
                    >
                      <option value={15}>15 Qs (15 mins)</option>
                      <option value={20}>20 Qs (20 mins)</option>
                      <option value={30}>30 Qs (30 mins)</option>
                      <option value={40}>40 Qs (40 mins)</option>
                      <option value={50}>50 Qs (50 mins)</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-neutral-300 font-semibold block">Difficulty</label>
                    <div className="grid grid-cols-3 gap-1.5">
                      {(['Easy', 'Medium', 'Hard'] as const).map((diff) => (
                        <button
                          key={diff}
                          type="button"
                          onClick={() => setQuizDifficulty(diff)}
                          className={`py-2 rounded-xl font-mono border cursor-pointer ${
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
                      onClick={() => handleLaunchCareerQuiz(quizCount, true)}
                      className="w-full border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/10 cursor-pointer py-2 rounded-xl font-semibold"
                    >
                      <Terminal className="w-4 h-4 mr-1.5" />
                      Generate Fresh AI Practice Set ({quizCount} Qs)
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Active Quiz Runner */}
            {quizActive && !quizFinished && quizQuestions.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-2xl border border-neutral-800 bg-neutral-950/90">
                  <div className="text-xs font-mono text-white">
                    {activeCareer.name}
                    {selectedCompany !== 'All Companies' ? ` • ${selectedCompany}` : ''} • Q
                    {quizIndex + 1} / {quizQuestions.length} ({quizSource})
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1 rounded-xl bg-neutral-900 border border-neutral-800 font-mono text-xs text-emerald-400 flex items-center gap-1.5">
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
                      <span className="text-[11px] font-mono text-cyan-400">{q.topic}</span>
                      <h4 className="text-base sm:text-lg font-medium text-white leading-relaxed">
                        {q.question}
                      </h4>
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
                                  ? 'bg-white/10 border-cyan-400 text-white'
                                  : 'bg-neutral-900/60 border-neutral-800 text-neutral-200 hover:border-neutral-700'
                              }`}
                            >
                              <span
                                className={`h-7 w-7 rounded-xl flex items-center justify-center font-mono text-xs font-bold shrink-0 ${
                                  isSel ? 'bg-cyan-400 text-black' : 'bg-neutral-800 text-neutral-300'
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
                            onClick={handleSubmitQuiz}
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

            {/* Quiz Results */}
            {quizActive && quizFinished && quizScore && (
              <div className="space-y-4">
                <div className="rounded-3xl border border-neutral-800 bg-neutral-950/90 p-6 flex flex-col md:flex-row items-center justify-between gap-4">
                  <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-mono text-emerald-400 mb-2">
                      <Award className="w-3.5 h-3.5" /> {activeCareer.name} Quiz Completed
                    </div>
                    <h3 className="text-2xl font-extrabold text-white">
                      Score: {quizScore.correct} / {quizScore.total} ({quizScore.pct}%)
                    </h3>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleLaunchCareerQuiz(quizScore.total, true)}
                      className="bg-emerald-400 text-black font-bold cursor-pointer"
                    >
                      <RotateCcw className="w-4 h-4 mr-1.5" /> New Quiz Set
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setQuizActive(false)}
                      className="cursor-pointer"
                    >
                      Back to Quiz Setup
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
                        } space-y-1.5`}
                      >
                        <div className="flex justify-between text-xs font-mono">
                          <span className="text-neutral-400">
                            Q{idx + 1}. {q.topic}
                          </span>
                          <span className={ok ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                            {ok ? (
                              <CheckCircle2 className="w-3.5 h-3.5 inline mr-1" />
                            ) : (
                              <XCircle className="w-3.5 h-3.5 inline mr-1" />
                            )}
                            {ok ? 'Correct' : 'Incorrect'}
                          </span>
                        </div>
                        <p className="text-sm text-white font-medium">{q.question}</p>
                        <p className="text-xs text-emerald-400">
                          Answer: {q.options[q.correctAnswer]}
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
        )}

        {/* ================================================================= */}
        {/* 3. SLIDE-OVER LEARNING DRAWER (YOUTUBE + DOCS + AI + PDF + CHECK) */}
        {/* ================================================================= */}
        <AnimatePresence>
          {activeSubtopic && (
            <div className="fixed inset-0 z-50 flex justify-end bg-black/65 backdrop-blur-sm">
              <div className="flex-1" onClick={() => setActiveSubtopic(null)} />
              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 28, stiffness: 280 }}
                className="w-full max-w-2xl h-full flex flex-col bg-neutral-950/95 border-l border-white/15 backdrop-blur-2xl shadow-2xl text-white"
              >
                {/* Header */}
                <div className="p-6 pb-4 border-b border-white/10 flex items-start justify-between gap-4 shrink-0">
                  <div className="space-y-1.5 min-w-0">
                    <div className="text-[11px] font-mono text-cyan-400 truncate">
                      {activeSubtopicTopic || activeCareer.name} &gt; Study Guide
                    </div>
                    <h3 className="text-lg sm:text-xl font-extrabold text-white tracking-tight">
                      {activeSubtopic.title}
                    </h3>
                    <div className="flex items-center gap-2 flex-wrap pt-1">
                      <span
                        className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full border ${getLevelBadgeColor(
                          activeSubtopic.level
                        )}`}
                      >
                        {activeSubtopic.level}
                      </span>
                      <span className="text-[11px] font-mono text-neutral-400 inline-flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" /> Est. {activeSubtopic.estimatedTime}
                      </span>
                      {drawerLoading ? (
                        <span className="text-[10px] font-mono text-cyan-300 inline-flex items-center gap-1">
                          <Loader2 className="w-3 h-3 animate-spin" /> syncing detail...
                        </span>
                      ) : (
                        <span className="text-[10px] font-mono text-neutral-400 px-2 py-0.5 rounded bg-white/5 border border-white/10">
                          source: {drawerSource}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => exportSubtopicNotes(activeCareer.name, activeSubtopic, 'pdf')}
                      className="px-2.5 py-1.5 rounded-xl text-[11px] font-mono font-semibold bg-neutral-900 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/35 inline-flex items-center gap-1 cursor-pointer"
                    >
                      <Download className="w-3 h-3" /> PDF
                    </button>
                    <button
                      type="button"
                      onClick={() => exportSubtopicNotes(activeCareer.name, activeSubtopic, 'md')}
                      className="px-2.5 py-1.5 rounded-xl text-[11px] font-mono font-semibold bg-neutral-900 hover:bg-white/10 text-neutral-200 border border-neutral-700 inline-flex items-center gap-1 cursor-pointer"
                    >
                      MD
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveSubtopic(null)}
                      className="p-2 rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white cursor-pointer"
                      aria-label="Close subtopic guide"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Scrollable Body */}
                <div className="flex-1 overflow-y-auto p-6 space-y-5">
                  {/* 1. Explanation & Why Recruiters Ask This + Checklist + Code */}
                  <div className="space-y-3">
                    <div className="p-4 rounded-2xl bg-neutral-900/75 border border-neutral-800 space-y-1.5">
                      <span className="text-[11px] font-mono uppercase text-cyan-400 font-bold">
                        1. Simple Explanation
                      </span>
                      <p className="text-xs sm:text-sm text-neutral-200 leading-relaxed">
                        {drawerDetail?.simpleExplanation || activeSubtopic.simpleExplanation}
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 space-y-1.5">
                      <span className="text-[11px] font-mono uppercase text-emerald-300 font-bold">
                        Why Recruiters Ask This
                      </span>
                      <p className="text-xs sm:text-sm text-emerald-100 leading-relaxed">
                        {drawerDetail?.whyRecruitersAsk || activeSubtopic.whyImportant}
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-neutral-900/60 border border-neutral-800 space-y-2">
                      <span className="text-xs font-bold text-white block">Concept Checklist</span>
                      <ul className="space-y-1.5 text-xs text-neutral-300">
                        {(drawerDetail?.conceptChecklist || activeSubtopic.whatToLearn).map(
                          (item, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                              <span>{item}</span>
                            </li>
                          )
                        )}
                      </ul>
                    </div>

                    {(drawerDetail?.codeExample || activeSubtopic.codeExample) && (
                      <div className="space-y-1.5">
                        <span className="text-xs font-bold text-white flex items-center gap-1.5">
                          <Code2 className="w-4 h-4 text-cyan-400" /> Code Example
                        </span>
                        <pre className="p-4 rounded-2xl bg-[#0d0d11] border border-neutral-800 text-xs text-emerald-300 font-mono overflow-x-auto leading-relaxed">
                          <code>{drawerDetail?.codeExample || activeSubtopic.codeExample}</code>
                        </pre>
                      </div>
                    )}
                  </div>

                  {/* 2. YouTube Video Lessons Section (English / Hindi + Complete Playlist) */}
                  {(() => {
                    const yt = getSubtopicYouTubeLessons(
                      activeSubtopicTopic || activeCareer.name,
                      activeSubtopic.title,
                      activeSubtopic.level
                    );
                    const chosenVideo =
                      drawerYtLang === 'English' ? yt.englishTutorial : yt.hindiTutorial;

                    return (
                      <div className="p-4 rounded-2xl border border-rose-500/30 bg-rose-950/15 space-y-3">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <span className="text-xs font-bold text-rose-200 flex items-center gap-1.5">
                            <Video className="w-4 h-4 text-rose-400" />
                            <span>2. YouTube Video Lessons</span>
                          </span>
                          <div className="flex items-center gap-1 bg-neutral-900 p-0.5 rounded-lg border border-neutral-800">
                            {(['English', 'Hindi'] as const).map((lang) => (
                              <button
                                key={lang}
                                type="button"
                                onClick={() => setDrawerYtLang(lang)}
                                className={`px-2 py-0.5 rounded text-[10px] font-mono cursor-pointer ${
                                  drawerYtLang === lang
                                    ? 'bg-rose-500/30 text-rose-200 font-bold'
                                    : 'text-neutral-400 hover:text-white'
                                }`}
                              >
                                {lang}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          <a
                            href={chosenVideo.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-3 rounded-xl bg-neutral-900/90 border border-neutral-800 hover:border-rose-400/50 transition-colors space-y-1.5 group"
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                                {chosenVideo.verifiedStatus}
                              </span>
                              <ExternalLink className="w-3.5 h-3.5 text-neutral-400 group-hover:text-rose-300" />
                            </div>
                            <div className="text-xs font-bold text-white">Watch Tutorial ({chosenVideo.language})</div>
                            <div className="text-[10px] font-mono text-neutral-400">
                              {chosenVideo.channel} • {chosenVideo.level}
                            </div>
                          </a>

                          <a
                            href={yt.completePlaylist.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-3 rounded-xl bg-neutral-900/90 border border-neutral-800 hover:border-cyan-400/50 transition-colors space-y-1.5 group"
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                                {yt.completePlaylist.verifiedStatus}
                              </span>
                              <ExternalLink className="w-3.5 h-3.5 text-neutral-400 group-hover:text-cyan-300" />
                            </div>
                            <div className="text-xs font-bold text-white">Watch Complete Playlist</div>
                            <div className="text-[10px] font-mono text-neutral-400">
                              {yt.completePlaylist.channel}
                            </div>
                          </a>
                        </div>
                      </div>
                    );
                  })()}

                  {/* 3. Multi-Website & Official Docs */}
                  <div className="space-y-2.5">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <ExternalLink className="w-4 h-4 text-cyan-400" />
                      <span>3. Official Docs &amp; Verified Websites</span>
                    </span>
                    <div className="space-y-2">
                      {activeSubtopic.resources.map((res, rIdx) => (
                        <a
                          key={rIdx}
                          href={res.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-3.5 rounded-2xl bg-neutral-900/75 border border-neutral-800 hover:border-cyan-400/50 transition-all flex items-center justify-between gap-3 group"
                        >
                          <div className="space-y-1">
                            <div className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors">
                              {res.title}
                            </div>
                            <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-mono">
                              <span className="px-2 py-0.5 rounded bg-cyan-500/15 text-cyan-300 border border-cyan-500/25">
                                {res.type}
                              </span>
                              <span className="px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/25">
                                {res.pricing}
                              </span>
                            </div>
                          </div>
                          <ExternalLink className="w-4 h-4 text-neutral-500 group-hover:text-cyan-300 shrink-0" />
                        </a>
                      ))}
                    </div>
                  </div>

                  {/* 4. AI Study Helper */}
                  <div className="p-4 rounded-2xl border border-emerald-500/25 bg-emerald-950/15 space-y-2.5">
                    <span className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                      <Bot className="w-4 h-4" /> 4. AI Study Helper (Doubt Solver)
                    </span>
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          handleCopyText(
                            `drawer-${activeSubtopic.id}`,
                            buildSubtopicAIPrompt(
                              activeCareer.name,
                              activeSubtopicTopic || activeCareer.name,
                              activeSubtopic.title
                            )
                          )
                        }
                        className="px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-200 text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        {copiedId === `drawer-${activeSubtopic.id}`
                          ? 'Copied Prompt!'
                          : 'Copy Doubt-Solving Prompt'}
                      </button>

                      <a
                        href="https://gemini.google.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 rounded-xl bg-neutral-900 border border-neutral-700 text-cyan-300 text-xs font-mono hover:border-cyan-400"
                      >
                        Launch Gemini ↗
                      </a>
                      <a
                        href="https://chatgpt.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 rounded-xl bg-neutral-900 border border-neutral-700 text-emerald-300 text-xs font-mono hover:border-emerald-400"
                      >
                        Launch ChatGPT ↗
                      </a>
                    </div>
                  </div>

                  {/* 5. Quick Practice Check + Completion Criteria */}
                  <div className="p-4 rounded-2xl bg-neutral-900/75 border border-cyan-500/25 space-y-3">
                    <span className="text-xs font-bold text-cyan-300 block">
                      5. Quick Practice Check &amp; Completion Criteria
                    </span>

                    {(() => {
                      const qc = drawerDetail?.quickPracticeQuestion || {
                        question: `Which practice shows true readiness on "${activeSubtopic.title}"?`,
                        options: [
                          `Explaining core intuition, trade-offs, and boundary edge cases clearly`,
                          `Skipping validation and memorizing one static snippet blindly`,
                          `Ignoring time/memory/security constraints in solutions`,
                          `Hardcoding test constants instead of clean modular logic`,
                        ],
                        correctIndex: 0,
                        explanation: `Recruiters look for clear mental models paired with edge-case awareness on ${activeSubtopic.title}.`,
                      };
                      return (
                        <div className="space-y-2.5">
                          <p className="text-xs font-medium text-white">{qc.question}</p>
                          <div className="space-y-1.5">
                            {qc.options.map((opt, idx) => {
                              const answered = quickCheckChoice !== null;
                              const isPicked = quickCheckChoice === idx;
                              const isRight = idx === qc.correctIndex;
                              let cls =
                                'bg-neutral-950/70 border-neutral-800 text-neutral-300 hover:border-cyan-500/40';
                              if (answered && isRight) {
                                cls = 'bg-emerald-500/20 border-emerald-500/50 text-emerald-200 font-semibold';
                              } else if (answered && isPicked && !isRight) {
                                cls = 'bg-rose-500/20 border-rose-500/50 text-rose-200';
                              }
                              return (
                                <button
                                  key={idx}
                                  type="button"
                                  onClick={() => setQuickCheckChoice(idx)}
                                  className={`w-full text-left px-3 py-2 rounded-xl border text-xs transition-all cursor-pointer ${cls}`}
                                >
                                  {opt}
                                </button>
                              );
                            })}
                          </div>
                          {quickCheckChoice !== null && (
                            <p className="text-[11px] text-emerald-300 bg-neutral-950/70 p-2.5 rounded-xl border border-neutral-800">
                              {qc.explanation}
                            </p>
                          )}
                        </div>
                      );
                    })()}

                    <div className="pt-2 border-t border-white/10">
                      <span className="text-[10px] font-mono uppercase text-amber-300 block mb-0.5">
                        Completion Criteria
                      </span>
                      <p className="text-[11px] text-neutral-300">
                        {drawerDetail?.completionCriteria || activeSubtopic.completionCriteria}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Sticky Completion Footer */}
                <div className="p-5 border-t border-white/10 bg-neutral-950 flex flex-wrap items-center justify-between gap-3 shrink-0">
                  <Button
                    variant="primary"
                    size="md"
                    onClick={() => handleToggleSubtopic(activeSubtopic.id)}
                    className={`text-xs font-bold cursor-pointer px-4 rounded-xl inline-flex items-center gap-1.5 ${
                      completedIds.includes(activeSubtopic.id)
                        ? 'bg-emerald-500/20 border border-emerald-500/50 text-emerald-300'
                        : 'bg-gradient-to-r from-cyan-400 to-emerald-400 text-black'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>
                      {completedIds.includes(activeSubtopic.id)
                        ? '✓ Subtopic Completed (Undo)'
                        : '✓ Mark Subtopic Completed'}
                    </span>
                  </Button>

                  <Button
                    variant="outline"
                    size="md"
                    onClick={() => handlePracticeTopic(activeSubtopicTopic || activeSubtopic.title)}
                    className="text-xs font-semibold border-neutral-700 text-white hover:bg-white hover:text-black cursor-pointer rounded-xl"
                  >
                    Practice Quiz <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                  </Button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </DashboardLayout>
  );
};

export default TechnicalPage;
