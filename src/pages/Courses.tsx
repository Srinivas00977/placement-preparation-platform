import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BookOpen,
  PlayCircle,
  Code2,
  Calculator,
  GraduationCap,
  Compass,
  Download,
  CheckCircle2,
  Search,
  ExternalLink,
  RotateCcw,
  Video,
  Bot,
  Copy,
  ArrowLeft,
  ArrowRight,
  Check,
  Flame,
  Clock,
  Target,
  Award,
  XCircle,
  Layers,
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { SHARED_COURSES, getCoursePriorityForCareer } from '@/data/courseLibrary/courses';
import { type CourseCategory, type CoursePriority } from '@/data/courseLibrary/types';
import { getRoadmapShLink } from '@/data/courseLibrary/roadmapLinks';
import { buildSubtopicAIPrompt } from '@/data/courseLibrary/aiTools';
import { CAREER_TRACKS, resolveCareerTrack } from '@/data/technicalCurriculum/careers';
import { type CareerQuizQuestion } from '@/data/technicalCurriculum/types';
import { APTITUDE_SYLLABUS, RECOMMENDED_PHASES } from '@/data/aptitudeSyllabus';
import { CODING_PROBLEMS, type CodingProblem } from '@/data/codingProblems';
import { buildDynamicDayPlan, getPaceBadge } from '@/lib/coursePlanScaler';
import { downloadCourseStudyPlanPDF } from '@/lib/studyMaterialExport';
import { courseService, type CourseProgressState } from '@/services/courseService';
import { assessmentService, type DailyAssessmentStatus } from '@/services/assessmentService';
import { progressService, type UserProgressData } from '@/services/progressService';
import { Button } from '@/components/ui/button';

type WorkspaceTab = 'schedule' | 'roadmap' | 'assessment' | 'aptitude' | 'coding';

const COURSE_CATEGORIES: Array<'All' | CourseCategory> = [
  'All',
  'Languages',
  'CS Core',
  'Web',
  'Data & AI',
  'Cloud & Security',
  'Mobile / QA / UX',
];

const DURATION_PRESETS = [20, 30, 40, 50] as const;

const COURSE_TO_CODING_CATEGORIES: Record<string, string[]> = {
  'course-dsa': ['Arrays & Hashing', 'Strings', 'Two Pointers', 'Sliding Window', 'Stack & Queue', 'Binary Search', 'Linked Lists', 'Trees & BST', 'Graphs', 'Dynamic Programming'],
  'course-java': ['Arrays & Hashing', 'Strings', 'Stack & Queue', 'Linked Lists', 'Trees & BST', 'Dynamic Programming'],
  'course-python': ['Arrays & Hashing', 'Strings', 'Sliding Window', 'Dynamic Programming', 'Graphs', 'Greedy & Math'],
  'course-cpp': ['Arrays & Hashing', 'Binary Search', 'Two Pointers', 'Graphs', 'Dynamic Programming', 'Bit Manipulation'],
  'course-c': ['Arrays & Hashing', 'Strings', 'Binary Search', 'Linked Lists', 'Bit Manipulation'],
  'course-javascript': ['Arrays & Hashing', 'Strings', 'Two Pointers', 'Sliding Window', 'Stack & Queue'],
  'course-typescript': ['Arrays & Hashing', 'Strings', 'Stack & Queue', 'Trees & BST'],
  'course-sql': ['Arrays & Hashing', 'Greedy & Math'],
  'course-react': ['Strings', 'Stack & Queue', 'Trees & BST'],
  'course-node': ['Arrays & Hashing', 'Strings', 'Graphs'],
  'course-spring': ['Arrays & Hashing', 'Stack & Queue', 'Graphs'],
  'course-analytics': ['Arrays & Hashing', 'Sliding Window', 'Greedy & Math'],
  'course-ml': ['Arrays & Hashing', 'Dynamic Programming', 'Graphs', 'Greedy & Math'],
  'course-genai': ['Strings', 'Trees & BST', 'Graphs'],
  'course-go': ['Arrays & Hashing', 'Stack & Queue', 'Graphs'],
  'course-rust': ['Arrays & Hashing', 'Binary Search', 'Bit Manipulation'],
  'course-kotlin': ['Arrays & Hashing', 'Strings', 'Linked Lists'],
  'course-dart': ['Arrays & Hashing', 'Strings', 'Trees & BST'],
  'course-oop': ['Linked Lists', 'Stack & Queue', 'Trees & BST'],
  'course-dbms': ['Arrays & Hashing', 'Binary Search', 'Trees & BST'],
  'course-os': ['Stack & Queue', 'Graphs', 'Greedy & Math'],
  'course-cn': ['Graphs', 'Bit Manipulation'],
  'course-sysdesign': ['Linked Lists', 'Graphs', 'Dynamic Programming'],
};

function getPriorityBadgeStyle(priority: CoursePriority): string {
  if (priority === 'Essential') {
    return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/35';
  }
  if (priority === 'Recommended') {
    return 'bg-cyan-500/15 text-cyan-300 border-cyan-500/35';
  }
  return 'bg-white/5 text-neutral-400 border-white/10';
}

function getCourseKeywords(courseId: string, courseTitle: string): string[] {
  const tokens = courseTitle
    .toLowerCase()
    .replace(/[^a-z0-9\s/+]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length >= 2 && !['and', 'the', 'for', 'day', 'mastery', 'programming'].includes(w));
  const extra: Record<string, string[]> = {
    'course-dsa': ['array', 'tree', 'graph', 'dp', 'dynamic', 'binary', 'stack', 'queue', 'hash', 'complexity', 'recursion'],
    'course-java': ['java', 'jvm', 'stream', 'collection', 'thread', 'oop', 'interface'],
    'course-python': ['python', 'list', 'dict', 'generator', 'async', 'decorator'],
    'course-sql': ['sql', 'join', 'index', 'query', 'group', 'window', 'acid', 'transaction'],
    'course-dbms': ['dbms', 'sql', 'acid', 'normalization', 'b-tree', 'index', 'lock', 'transaction'],
    'course-os': ['process', 'thread', 'deadlock', 'paging', 'virtual memory', 'mutex', 'semaphore'],
    'course-cn': ['tcp', 'udp', 'http', 'dns', 'tls', 'osi', 'ip', 'routing'],
    'course-sysdesign': ['cache', 'load', 'sharding', 'cdn', 'kafka', 'rate limit', 'cap'],
    'course-react': ['react', 'hook', 'state', 'effect', 'dom', 'render', 'memo'],
    'course-frontend': ['css', 'html', 'dom', 'flex', 'grid', 'accessibility', 'browser'],
    'course-node': ['node', 'express', 'event loop', 'jwt', 'middleware', 'rest'],
    'course-spring': ['spring', 'boot', 'jpa', 'hibernate', 'bean', 'rest'],
    'course-ml': ['regression', 'gradient', 'overfitting', 'precision', 'recall', 'tree', 'bias'],
    'course-genai': ['llm', 'rag', 'embedding', 'vector', 'prompt', 'transformer'],
    'course-analytics': ['sql', 'kpi', 'pandas', 'cohort', 'funnel', 'excel', 'tableau'],
    'course-cloud': ['docker', 'kubernetes', 'ci/cd', 'terraform', 'aws', 'nginx'],
    'course-security': ['xss', 'csrf', 'sql injection', 'owasp', 'tls', 'iam', 'auth'],
    'course-qa': ['playwright', 'selenium', 'test', 'api', 'assertion', 'regression'],
    'course-uiux': ['figma', 'wireframe', 'usability', 'heuristic', 'wcag', 'contrast'],
  };
  return Array.from(new Set([...tokens, ...(extra[courseId] || [])]));
}

export const CoursesPage: React.FC = () => {
  const navigate = useNavigate();

  const [progress, setProgress] = useState<UserProgressData>(() => progressService.getUserProgress());
  const [dailyStatus, setDailyStatus] = useState<DailyAssessmentStatus | null>(null);
  const [courseProgress, setCourseProgress] = useState<CourseProgressState>(() =>
    courseService.getLocalProgress()
  );

  const [selectedCareerId, setSelectedCareerId] = useState<string>(
    () => resolveCareerTrack(progressService.getUserProgress().profile.targetRole).id
  );
  const activeCareer = useMemo(
    () => CAREER_TRACKS.find((c) => c.id === selectedCareerId) || CAREER_TRACKS[0],
    [selectedCareerId]
  );

  // Left course library filters
  const [courseSearch, setCourseSearch] = useState('');
  const [courseCategory, setCourseCategory] = useState<'All' | CourseCategory>('All');
  const [onlyRoleCourses, setOnlyRoleCourses] = useState(false);

  // Selected course & active workspace tab
  const [selectedCourseId, setSelectedCourseId] = useState<string>(
    () => courseProgress.activeCourseId || SHARED_COURSES[0].id
  );
  const [activeTab, setActiveTab] = useState<WorkspaceTab>('schedule');
  const [selectedDayNum, setSelectedDayNum] = useState<number>(1);
  const [customDaysInput, setCustomDaysInput] = useState<string>('30');
  const [durationFeedback, setDurationFeedback] = useState<string | null>(null);
  const [confirmResetCourse, setConfirmResetCourse] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Embedded Assessment state (Tab 3)
  const [diagAnswers, setDiagAnswers] = useState<Record<string, number>>({});
  const [diagSubmitted, setDiagSubmitted] = useState(false);

  // Embedded Coding filter state (Tab 5)
  const [codingDiffFilter, setCodingDiffFilter] = useState<'All' | 'Easy' | 'Medium' | 'Hard'>('All');

  useEffect(() => {
    const unsubProgress = progressService.subscribe(() => {
      const next = progressService.getUserProgress();
      setProgress(next);
    });
    const unsubCourse = courseService.subscribe(() => {
      setCourseProgress(courseService.getLocalProgress());
    });
    courseService.fetchRemoteProgress().then(setCourseProgress);
    assessmentService.getStatus().then(setDailyStatus);

    return () => {
      unsubProgress();
      unsubCourse();
    };
  }, []);

  const filteredCourses = useMemo(() => {
    const q = courseSearch.trim().toLowerCase();
    return SHARED_COURSES.filter((c) => {
      const matchCat = courseCategory === 'All' || c.category === courseCategory;
      const priority = getCoursePriorityForCareer(c, activeCareer.id);
      const matchRole = !onlyRoleCourses || priority === 'Essential' || priority === 'Recommended';
      const matchQuery =
        !q ||
        c.title.toLowerCase().includes(q) ||
        c.shortSummary.toLowerCase().includes(q) ||
        c.primaryChannel.toLowerCase().includes(q);
      return matchCat && matchRole && matchQuery;
    });
  }, [courseSearch, courseCategory, onlyRoleCourses, activeCareer.id]);

  const activeCourse = useMemo(
    () => SHARED_COURSES.find((c) => c.id === selectedCourseId) || SHARED_COURSES[0],
    [selectedCourseId]
  );

  // Active targetDays (persisted per course, defaults to course.durationDays)
  const activeTargetDays = useMemo(() => {
    const saved = courseProgress.targetDaysByCourse?.[activeCourse.id];
    return saved && saved >= 7 && saved <= 90 ? saved : activeCourse.durationDays;
  }, [courseProgress.targetDaysByCourse, activeCourse]);

  useEffect(() => {
    setCustomDaysInput(String(activeTargetDays));
    setDiagAnswers({});
    setDiagSubmitted(false);
  }, [activeCourse.id, activeTargetDays]);

  const dynamicDays = useMemo(
    () => buildDynamicDayPlan(activeCourse, activeTargetDays),
    [activeCourse, activeTargetDays]
  );

  const activeCourseCompletedDays = useMemo(
    () => (courseProgress.courses[activeCourse.id] || []).filter((d) => d <= activeTargetDays),
    [courseProgress.courses, activeCourse.id, activeTargetDays]
  );

  const activeCourseDay = useMemo(
    () => dynamicDays.find((d) => d.dayNumber === selectedDayNum) || dynamicDays[0],
    [dynamicDays, selectedDayNum]
  );

  const activeCoursePct = Math.round(
    (activeCourseCompletedDays.length / Math.max(1, activeTargetDays)) * 100
  );

  const paceInfo = useMemo(() => getPaceBadge(activeTargetDays), [activeTargetDays]);
  const roadmapLink = useMemo(
    () => getRoadmapShLink(activeCourse.id, activeCareer.id),
    [activeCourse.id, activeCareer.id]
  );

  // Split dynamicDays into 3 Roadmap Phases
  const roadmapPhases = useMemo(() => {
    const total = dynamicDays.length;
    const p1End = Math.max(1, Math.ceil(total * 0.3));
    const p2End = Math.max(p1End + 1, Math.ceil(total * 0.72));
    return [
      {
        phaseNum: 1,
        title: 'Phase 1: Foundations',
        subtitle: 'Core syntax, mental models & fundamental mechanics',
        dayRange: `Days 1–${p1End}`,
        days: dynamicDays.slice(0, p1End),
      },
      {
        phaseNum: 2,
        title: 'Phase 2: Core Skills & Practice',
        subtitle: 'Applied patterns, labs & production-grade problem solving',
        dayRange: `Days ${Math.min(total, p1End + 1)}–${Math.min(total, p2End)}`,
        days: dynamicDays.slice(p1End, p2End),
      },
      {
        phaseNum: 3,
        title: 'Phase 3: Revision, Projects & Interview Prep',
        subtitle: 'Weekly reviews, capstone build, interview Q&A drills & readiness check',
        dayRange: p2End < total ? `Days ${p2End + 1}–${total}` : `Day ${total}`,
        days: dynamicDays.slice(p2End),
      },
    ].filter((ph) => ph.days.length > 0);
  }, [dynamicDays]);

  // First uncompleted day = active milestone in roadmap
  const nextActiveDayNum = useMemo(() => {
    for (let d = 1; d <= activeTargetDays; d++) {
      if (!activeCourseCompletedDays.includes(d)) return d;
    }
    return activeTargetDays;
  }, [activeCourseCompletedDays, activeTargetDays]);

  // Course-matched diagnostic MCQs (Tab 3: 10–15 questions)
  const courseDiagnosticQuestions = useMemo(() => {
    const keywords = getCourseKeywords(activeCourse.id, activeCourse.title);
    const seen = new Set<string>();
    const allPool: CareerQuizQuestion[] = [
      ...activeCareer.quizBank,
      ...CAREER_TRACKS.flatMap((c) => c.quizBank),
    ];

    const matched: CareerQuizQuestion[] = [];
    const fallback: CareerQuizQuestion[] = [];

    for (const q of allPool) {
      if (seen.has(q.id)) continue;
      seen.add(q.id);
      const hay = `${q.topic} ${q.question} ${q.career}`.toLowerCase();
      if (keywords.some((kw) => hay.includes(kw))) {
        matched.push(q);
      } else if (q.career === activeCareer.name) {
        fallback.push(q);
      }
    }

    const combined = [...matched, ...fallback];
    if (combined.length < 10) {
      for (const q of allPool) {
        if (!combined.some((x) => x.id === q.id)) {
          combined.push(q);
        }
        if (combined.length >= 12) break;
      }
    }
    return combined.slice(0, 12);
  }, [activeCourse.id, activeCourse.title, activeCareer]);

  // Tab 4: Aptitude Phase progress & recommended topics for active day
  const aptitudePhaseProgress = useMemo(() => {
    const attempts = progress.aptitudeAttempts || [];
    const bestByTopic = new Map<string, number>();
    attempts.forEach((a) => {
      bestByTopic.set(a.topicId, Math.max(bestByTopic.get(a.topicId) || 0, a.percentage));
    });

    return RECOMMENDED_PHASES.map((phase) => {
      const doneCount = phase.topicIds.filter((tid) => bestByTopic.has(tid)).length;
      const pct = Math.round((doneCount / Math.max(1, phase.topicIds.length)) * 100);
      return { ...phase, doneCount, totalCount: phase.topicIds.length, pct };
    });
  }, [progress.aptitudeAttempts]);

  const recommendedAptitudeTopics = useMemo(() => {
    const offset = ((selectedDayNum - 1) * 3) % APTITUDE_SYLLABUS.length;
    const picked = [];
    for (let i = 0; i < 6; i++) {
      picked.push(APTITUDE_SYLLABUS[(offset + i) % APTITUDE_SYLLABUS.length]);
    }
    return picked;
  }, [selectedDayNum]);

  // Tab 5: Matched Coding Problems (from 119 CODING_PROBLEMS bank)
  const matchedCodingProblems = useMemo(() => {
    const targetCats =
      COURSE_TO_CODING_CATEGORIES[activeCourse.id] || [
        'Arrays & Hashing',
        'Strings',
        'Two Pointers',
        'Dynamic Programming',
      ];

    const prioritized: CodingProblem[] = [];
    const rest: CodingProblem[] = [];
    for (const p of CODING_PROBLEMS) {
      if (codingDiffFilter !== 'All' && p.difficulty !== codingDiffFilter) continue;
      if (targetCats.includes(p.category)) {
        prioritized.push(p);
      } else {
        rest.push(p);
      }
    }
    const list = prioritized.length >= 6 ? prioritized : [...prioritized, ...rest];
    return list.slice(0, 18);
  }, [activeCourse.id, codingDiffFilter]);

  const readiness = useMemo(() => progressService.calculateReadinessWithData(progress), [progress]);

  // Handlers
  const handleSelectCourse = async (courseId: string) => {
    setSelectedCourseId(courseId);
    setConfirmResetCourse(false);
    setDurationFeedback(null);
    const updated = await courseService.setActiveCourse(courseId);
    setCourseProgress(updated);
    const course = SHARED_COURSES.find((c) => c.id === courseId) || SHARED_COURSES[0];
    const tDays = updated.targetDaysByCourse?.[courseId] || course.durationDays;
    const done = updated.courses[courseId] || [];
    let firstPending = 1;
    for (let d = 1; d <= tDays; d++) {
      if (!done.includes(d)) {
        firstPending = d;
        break;
      }
    }
    setSelectedDayNum(firstPending);
  };

  const handleApplyDuration = async (days: number) => {
    const clamped = Math.max(7, Math.min(90, Math.round(days)));
    setCustomDaysInput(String(clamped));
    const updated = await courseService.setTargetDays(activeCourse.id, clamped);
    setCourseProgress(updated);
    setSelectedDayNum((prev) => Math.min(prev, clamped));
    setDurationFeedback(`Updated ${activeCourse.title} to ${clamped}-Day Plan!`);
    setTimeout(() => setDurationFeedback(null), 2600);
  };

  const handleCustomDurationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseInt(customDaysInput, 10);
    if (!Number.isFinite(parsed) || parsed < 7 || parsed > 90) {
      setDurationFeedback('Enter between 7 and 90 days.');
      return;
    }
    handleApplyDuration(parsed);
  };

  const handleToggleDay = async (dayNumber: number) => {
    const updated = await courseService.toggleDay(activeCourse.id, dayNumber);
    setCourseProgress(updated);
  };

  const handleResetCourseProgress = async () => {
    const updated = await courseService.resetCourse(activeCourse.id);
    setCourseProgress(updated);
    setConfirmResetCourse(false);
    setSelectedDayNum(1);
  };

  const handleCopyText = (key: string, text: string) => {
    navigator.clipboard?.writeText(text).catch(() => undefined);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey((prev) => (prev === key ? null : prev)), 2000);
  };

  const handleJumpToDay = (dayNumber: number) => {
    setSelectedDayNum(dayNumber);
    setActiveTab('schedule');
  };

  const diagScore = useMemo(() => {
    let correct = 0;
    courseDiagnosticQuestions.forEach((q) => {
      if (diagAnswers[q.id] === q.correctAnswer) correct++;
    });
    return {
      correct,
      total: courseDiagnosticQuestions.length || 1,
      pct: Math.round((correct / Math.max(1, courseDiagnosticQuestions.length)) * 100),
    };
  }, [diagAnswers, courseDiagnosticQuestions]);

  return (
    <DashboardLayout
      pageTitle="Courses & Languages"
      pageSubtitle="All-in-one Day-Wise 20/30/40/50-Day study hub with Roadmap.sh tree, assessment, aptitude & live coding."
    >
      <div className="space-y-5 max-w-7xl mx-auto">
        {/* TOP PAGE HEADER BAR */}
        <div className="p-5 sm:p-6 rounded-3xl gd-panel shadow-2xl space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--gd-inner)] border border-[var(--gd-rim)] text-[11px] font-mono text-[var(--gd-teal)]">
                <BookOpen className="w-3.5 h-3.5" />
                <span>34 Shared Courses • 15 Languages + 19 Technical Tracks</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-[var(--gd-ink)] tracking-tight">
                Courses &amp; Languages Workspace
              </h1>
              <p className="text-xs sm:text-sm text-[var(--gd-muted)]">
                Choose your course duration (20 / 30 / 40 / 50 / Custom Days), follow the visual Roadmap.sh tree, take readiness checks, and launch linked aptitude &amp; coding practice.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <div className="px-3.5 py-2 rounded-2xl bg-[var(--gd-inner)] border border-[var(--gd-rim)] text-xs font-mono flex items-center gap-2">
                <Flame className="w-4 h-4 text-[var(--gd-coral)]" />
                <span className="text-[var(--gd-muted)]">Study Streak:</span>
                <strong className="text-[var(--gd-teal)]">{courseProgress.streakDays || 0}d</strong>
              </div>
              <select
                value={selectedCareerId}
                onChange={(e) => setSelectedCareerId(e.target.value)}
                aria-label="Target Career Role Filter"
                className="px-3 py-2 rounded-2xl bg-[var(--gd-inner)] border border-[var(--gd-rim)] text-xs font-medium text-[var(--gd-ink)] focus:outline-none focus:border-[var(--gd-teal)] cursor-pointer"
              >
                {CAREER_TRACKS.map((career) => (
                  <option key={career.id} value={career.id} className="bg-neutral-950 text-white">
                    Role: {career.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* MAIN SPLIT LAYOUT: LEFT COURSE LIBRARY (4 COLS) + RIGHT 5-TAB WORKSPACE (8 COLS) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* LEFT: SEARCHABLE 34-COURSE LIBRARY */}
          <div className="lg:col-span-4 rounded-3xl gd-panel p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-sm font-bold text-[var(--gd-ink)]">
                Course Library ({filteredCourses.length}/{SHARED_COURSES.length})
              </h2>
              <span className="text-[11px] font-mono text-[var(--gd-teal)]">
                15 Lang + 19 Tech
              </span>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-[var(--gd-muted)] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={courseSearch}
                onChange={(e) => setCourseSearch(e.target.value)}
                placeholder="Search Java, Python, DSA, SQL, React..."
                className="w-full bg-[var(--gd-inner)] border border-[var(--gd-rim)] rounded-xl pl-8 pr-3 py-2 text-xs text-[var(--gd-ink)] placeholder-[var(--gd-muted)] focus:outline-none focus:border-[var(--gd-teal)]"
              />
            </div>

            {/* Category Pills */}
            <div className="flex flex-wrap gap-1.5">
              {COURSE_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCourseCategory(cat)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-medium border cursor-pointer transition-colors ${
                    courseCategory === cat
                      ? 'bg-cyan-500/20 text-cyan-200 border-cyan-500/40 font-bold'
                      : 'bg-[var(--gd-inner)] text-[var(--gd-muted)] border-[var(--gd-rim)] hover:text-[var(--gd-ink)]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Role Filter Toggle — Clean "Recommended for Role" + "All" Toggle (Zero Truncation) */}
            <div className="space-y-1">
              <button
                type="button"
                onClick={() => setOnlyRoleCourses((prev) => !prev)}
                className={`w-full px-3 py-2 rounded-xl text-xs font-mono border flex items-center justify-between gap-2 cursor-pointer transition-colors ${
                  onlyRoleCourses
                    ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40'
                    : 'bg-[var(--gd-inner)] text-[var(--gd-ink)] border-[var(--gd-rim)] hover:border-[var(--gd-teal)]'
                }`}
              >
                <span className="font-semibold whitespace-nowrap">Recommended for Role</span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
                    onlyRoleCourses
                      ? 'bg-emerald-500/25 text-emerald-200'
                      : 'bg-[var(--gd-card)] text-[var(--gd-muted)]'
                  }`}
                >
                  {onlyRoleCourses ? 'Role Only' : 'All'}
                </span>
              </button>
              <div className="px-1 text-[10px] font-mono text-[var(--gd-muted)]">
                Active Role: <span className="text-[var(--gd-teal)]">{activeCareer.name}</span>
              </div>
            </div>

            {/* Course List */}
            <div className="max-h-[560px] overflow-y-auto pr-1 space-y-2">
              {filteredCourses.map((course) => {
                const isSel = course.id === activeCourse.id;
                const priority = getCoursePriorityForCareer(course, activeCareer.id);
                const tDays =
                  courseProgress.targetDaysByCourse?.[course.id] || course.durationDays;
                const doneCount = (courseProgress.courses[course.id] || []).filter(
                  (d) => d <= tDays
                ).length;

                return (
                  <button
                    key={course.id}
                    type="button"
                    onClick={() => handleSelectCourse(course.id)}
                    className={`w-full text-left p-3.5 rounded-2xl border transition-all cursor-pointer space-y-1.5 ${
                      isSel
                        ? 'bg-cyan-500/15 border-cyan-400/60 shadow-sm'
                        : 'bg-[var(--gd-inner)] border-[var(--gd-rim)] hover:border-[var(--gd-teal)]/50'
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
                      <span className="text-[10px] font-mono text-[var(--gd-muted)]">
                        {tDays} Days
                      </span>
                    </div>
                    <div className="text-xs font-bold text-[var(--gd-ink)] leading-snug">
                      {course.title}
                    </div>
                    <div className="flex items-center justify-between text-[10px] font-mono text-[var(--gd-muted)]">
                      <span>{course.category}</span>
                      <span className="text-[var(--gd-teal)] font-semibold">
                        {doneCount}/{tDays} Done
                      </span>
                    </div>
                  </button>
                );
              })}

              {filteredCourses.length === 0 && (
                <div className="p-6 text-center text-xs text-[var(--gd-muted)] rounded-2xl border border-[var(--gd-rim)] bg-[var(--gd-inner)]">
                  No courses match your search/filter. Reset filters to view all 34 courses.
                </div>
              )}
            </div>
          </div>

          {/* RIGHT: ALL-IN-ONE 5-TAB WORKSPACE */}
          <div className="lg:col-span-8 space-y-4 min-w-0">
            {/* Selected Course Summary + Study Plan Duration Bar + 5-Tab Switcher */}
            <div className="rounded-3xl gd-panel p-5 sm:p-6 shadow-xl space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="space-y-1.5 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                      {activeCourse.category}
                    </span>
                    <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-[var(--gd-inner)] text-[var(--gd-ink)] border border-[var(--gd-rim)]">
                      {activeTargetDays}-Day Guided Plan
                    </span>
                    <span
                      className={`text-[10px] font-mono font-semibold px-2.5 py-0.5 rounded-full border ${paceInfo.badgeClass}`}
                    >
                      {paceInfo.label}
                    </span>
                  </div>
                  <h2 className="text-xl font-extrabold text-[var(--gd-ink)]">
                    {activeCourse.title}
                  </h2>
                  <p className="text-xs text-[var(--gd-muted)] leading-relaxed">
                    {activeCourse.shortSummary}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  <a
                    href={roadmapLink.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 rounded-xl bg-[var(--gd-inner)] hover:bg-[var(--gd-card)] border border-[var(--gd-rim)] text-xs font-semibold text-[var(--gd-ink)] inline-flex items-center gap-1.5 transition-colors"
                  >
                    <Compass className="w-3.5 h-3.5 text-[var(--gd-teal)]" />
                    <span>Open Roadmap.sh</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      downloadCourseStudyPlanPDF(activeCourse, dynamicDays, activeTargetDays)
                    }
                    className="text-xs rounded-xl border-cyan-500/40 text-cyan-300 hover:bg-cyan-500/15 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5 mr-1.5" /> Download Course PDF
                  </Button>

                  {!confirmResetCourse ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setConfirmResetCourse(true)}
                      className="text-xs text-[var(--gd-muted)] hover:text-rose-300 cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5 mr-1" /> Reset Progress
                    </Button>
                  ) : (
                    <div className="flex items-center gap-1.5 bg-rose-950/40 border border-rose-500/40 px-2.5 py-1 rounded-xl">
                      <span className="text-[11px] text-rose-200">Reset?</span>
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

              {/* Study Plan Duration Selector Bar (20 / 30 / 40 / 50 / Custom 7-90 Days) */}
              <div className="p-3.5 rounded-2xl bg-[var(--gd-inner)] border border-[var(--gd-rim)] space-y-2.5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="text-xs font-mono font-bold text-[var(--gd-ink)] flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-[var(--gd-teal)]" />
                    <span>Study Plan Duration:</span>
                  </div>
                  <span className="text-[11px] text-[var(--gd-muted)]">{paceInfo.description}</span>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-1.5">
                    {DURATION_PRESETS.map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => handleApplyDuration(preset)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-mono font-semibold border cursor-pointer transition-all ${
                          activeTargetDays === preset
                            ? 'bg-white text-black border-white shadow-sm font-bold'
                            : 'bg-[var(--gd-card)] text-[var(--gd-ink)] border-[var(--gd-rim)] hover:border-[var(--gd-teal)]'
                        }`}
                      >
                        {preset} Days
                      </button>
                    ))}
                  </div>

                  <form
                    onSubmit={handleCustomDurationSubmit}
                    className="flex items-center gap-1.5"
                  >
                    <label htmlFor="custom-days-input" className="text-[11px] font-mono text-[var(--gd-muted)]">
                      Custom:
                    </label>
                    <input
                      id="custom-days-input"
                      type="number"
                      min={7}
                      max={90}
                      value={customDaysInput}
                      onChange={(e) => setCustomDaysInput(e.target.value)}
                      className="w-16 px-2.5 py-1 rounded-xl bg-[var(--gd-card)] border border-[var(--gd-rim)] text-xs font-mono text-[var(--gd-ink)] focus:outline-none focus:border-[var(--gd-teal)]"
                    />
                    <button
                      type="submit"
                      className="px-3 py-1 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 text-xs font-semibold cursor-pointer"
                    >
                      Apply
                    </button>
                  </form>
                </div>

                {durationFeedback && (
                  <div className="text-[11px] font-mono text-emerald-300">{durationFeedback}</div>
                )}
              </div>

              {/* Overall Course Progress Bar */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-[var(--gd-muted)]">
                    Day {activeCourseCompletedDays.length} / {activeTargetDays} Completed
                  </span>
                  <span className="text-emerald-400 font-bold">{activeCoursePct}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-[var(--gd-track)] overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-emerald-400 transition-all duration-300"
                    style={{ width: `${activeCoursePct}%` }}
                  />
                </div>
              </div>

              {/* 5 WORKSPACE TABS */}
              <div className="flex flex-wrap gap-1.5 pt-2 border-t border-[var(--gd-line)]">
                {(
                  [
                    { id: 'schedule', label: 'Day-Wise Schedule', icon: BookOpen },
                    { id: 'roadmap', label: 'Visual Roadmap', icon: Compass },
                    { id: 'assessment', label: 'Skill Assessment', icon: GraduationCap },
                    { id: 'aptitude', label: 'Aptitude Prep', icon: Calculator },
                    { id: 'coding', label: 'Coding Practice', icon: Code2 },
                  ] as const
                ).map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setActiveTab(tab.id)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-semibold inline-flex items-center gap-1.5 border cursor-pointer transition-all ${
                        isActive
                          ? 'bg-[var(--gd-raised)] text-[var(--gd-pick-ink)] border-cyan-400/60 shadow-sm font-bold'
                          : 'bg-[var(--gd-inner)] text-[var(--gd-muted)] border-[var(--gd-rim)] hover:text-[var(--gd-ink)]'
                      }`}
                    >
                      <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-cyan-400' : ''}`} />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ============================================================= */}
            {/* TAB 1: DAY-WISE SCHEDULE                                      */}
            {/* ============================================================= */}
            {activeTab === 'schedule' && activeCourseDay && (
              <div className="space-y-4">
                {/* Interactive Day Selector Pills */}
                <div className="rounded-3xl gd-panel p-5 shadow-lg space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-mono text-[var(--gd-muted)]">
                    <span className="uppercase font-bold">
                      Select Study Day ({activeTargetDays}-Day Plan):
                    </span>
                    <span className="text-[var(--gd-teal)]">
                      Next Pending: Day {nextActiveDayNum}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto pr-1">
                    {dynamicDays.map((d) => {
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
                              : 'bg-[var(--gd-inner)] text-[var(--gd-muted)] border-[var(--gd-rim)] hover:text-[var(--gd-ink)]'
                          }`}
                        >
                          Day {d.dayNumber} {isDayDone ? '✓' : ''}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Active Day Lesson Card */}
                <div className="rounded-3xl gd-panel p-6 shadow-xl space-y-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[var(--gd-line)]">
                    <div>
                      <span className="text-[11px] font-mono text-[var(--gd-teal)] font-bold">
                        Day {activeCourseDay.dayNumber} of {activeTargetDays} • Est.{' '}
                        {activeCourseDay.estimatedMinutes} mins
                      </span>
                      <h3 className="text-lg font-extrabold text-[var(--gd-ink)] mt-0.5">
                        {activeCourseDay.title}
                      </h3>
                    </div>
                    <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-full border border-cyan-500/35 bg-cyan-500/15 text-cyan-300 self-start sm:self-center">
                      {activeCourseDay.youtube.tutorial.level}
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm text-[var(--gd-ink)] leading-relaxed">
                    {activeCourseDay.simpleExplanation}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-3.5 rounded-2xl bg-[var(--gd-inner)] border border-[var(--gd-rim)] space-y-1.5">
                      <span className="text-[11px] font-bold text-[var(--gd-ink)] block">
                        Today&apos;s Subtopics &amp; Focus
                      </span>
                      <ul className="space-y-1 text-xs text-[var(--gd-muted)]">
                        {activeCourseDay.subtopics.map((st, idx) => (
                          <li key={idx} className="flex items-start gap-1.5">
                            <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                            <span>{st}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 space-y-1.5">
                      <span className="text-[11px] font-bold text-emerald-300 block">
                        Daily Hands-On Assignment
                      </span>
                      <p className="text-xs text-emerald-100 leading-relaxed">
                        {activeCourseDay.dailyAssignment}
                      </p>
                      <p className="text-[11px] font-mono text-emerald-300/90 pt-1 border-t border-emerald-500/20">
                        Done Criteria: {activeCourseDay.completionCriteria}
                      </p>
                    </div>
                  </div>

                  {activeCourseDay.codeExample && (
                    <pre className="p-4 rounded-2xl bg-[#0d0d11] border border-neutral-800 text-xs font-mono text-emerald-300 overflow-x-auto leading-relaxed">
                      <code>{activeCourseDay.codeExample}</code>
                    </pre>
                  )}

                  {/* YouTube, Playlist, Official Docs & AI Study Prompt */}
                  <div className="space-y-2.5 pt-2 border-t border-[var(--gd-line)]">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <a
                        href={activeCourseDay.youtube.tutorial.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/35 text-rose-200 text-xs font-semibold flex items-center justify-between transition-colors"
                      >
                        <span className="inline-flex items-center gap-2">
                          <Video className="w-4 h-4 text-rose-400" />
                          <span>
                            Watch YouTube Tutorial ({activeCourseDay.youtube.tutorial.language})
                          </span>
                        </span>
                        <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                      </a>

                      <a
                        href={activeCourseDay.youtube.playlist.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2.5 rounded-xl bg-[var(--gd-inner)] hover:bg-[var(--gd-card)] border border-[var(--gd-rim)] text-[var(--gd-ink)] text-xs font-semibold flex items-center justify-between transition-colors"
                      >
                        <span className="inline-flex items-center gap-2">
                          <PlayCircle className="w-4 h-4 text-cyan-400" />
                          <span>
                            Watch Complete Playlist ({activeCourse.playlistVerified})
                          </span>
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
                          <span>Read Official Docs ({activeCourse.docsLabel})</span>
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
                            {copiedKey === `day-${activeCourse.id}-${activeCourseDay.dayNumber}`
                              ? 'Copied AI Study Prompt!'
                              : 'Ask AI (Copy Study Prompt)'}
                          </span>
                        </span>
                        <Copy className="w-3.5 h-3.5 shrink-0" />
                      </button>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono text-[var(--gd-muted)] pt-1">
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
                      </div>
                    </div>
                  </div>

                  {/* Day Footer Actions */}
                  <div className="pt-4 border-t border-[var(--gd-line)] flex flex-wrap items-center justify-between gap-2">
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
                      onClick={() => handleToggleDay(activeCourseDay.dayNumber)}
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
                      disabled={activeCourseDay.dayNumber >= activeTargetDays}
                      onClick={() =>
                        setSelectedDayNum((n) => Math.min(activeTargetDays, n + 1))
                      }
                      className="text-xs cursor-pointer"
                    >
                      Next Day <ArrowRight className="w-3.5 h-3.5 ml-1" />
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* ============================================================= */}
            {/* TAB 2: VISUAL ROADMAP (ROADMAP.SH STYLE)                      */}
            {/* ============================================================= */}
            {activeTab === 'roadmap' && (
              <div className="rounded-3xl gd-panel p-6 shadow-xl space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[var(--gd-line)]">
                  <div>
                    <h3 className="text-lg font-extrabold text-[var(--gd-ink)] flex items-center gap-2">
                      <Compass className="w-5 h-5 text-[var(--gd-teal)]" />
                      <span>
                        {activeCourse.title} — {activeTargetDays}-Day Visual Node Roadmap
                      </span>
                    </h3>
                    <p className="text-xs text-[var(--gd-muted)] mt-0.5">
                      Connected Roadmap.sh-style phase tree. Click any day node to jump straight into that lesson.
                    </p>
                  </div>
                  <a
                    href={roadmapLink.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3.5 py-2 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/35 text-cyan-200 text-xs font-semibold inline-flex items-center gap-1.5 shrink-0"
                  >
                    <span>Open {roadmapLink.label}</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>

                {/* Connected Vertical Phase Tree */}
                <div className="space-y-6">
                  {roadmapPhases.map((phase) => {
                    const phaseDone = phase.days.filter((d) =>
                      activeCourseCompletedDays.includes(d.dayNumber)
                    ).length;
                    return (
                      <div
                        key={phase.phaseNum}
                        className="p-5 rounded-3xl bg-[var(--gd-inner)] border border-[var(--gd-rim)] space-y-4"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                                {phase.dayRange}
                              </span>
                              <h4 className="text-sm sm:text-base font-extrabold text-[var(--gd-ink)]">
                                {phase.title}
                              </h4>
                            </div>
                            <p className="text-xs text-[var(--gd-muted)] mt-0.5">
                              {phase.subtitle}
                            </p>
                          </div>
                          <span className="text-xs font-mono text-emerald-400 font-bold">
                            {phaseDone} / {phase.days.length} Nodes Done
                          </span>
                        </div>

                        {/* Vertical Connected Milestone Nodes */}
                        <div className="relative pl-6 border-l-2 border-cyan-500/30 space-y-2.5">
                          {phase.days.map((day) => {
                            const isDone = activeCourseCompletedDays.includes(day.dayNumber);
                            const isActive = !isDone && day.dayNumber === nextActiveDayNum;
                            return (
                              <button
                                key={day.dayNumber}
                                type="button"
                                onClick={() => handleJumpToDay(day.dayNumber)}
                                className={`relative w-full text-left p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-2 ${
                                  isDone
                                    ? 'bg-emerald-500/10 border-emerald-500/35 hover:border-emerald-400'
                                    : isActive
                                    ? 'bg-cyan-500/15 border-cyan-400/60 shadow-sm'
                                    : 'bg-[var(--gd-card)] border-[var(--gd-rim)] hover:border-cyan-500/40'
                                }`}
                              >
                                <span
                                  className={`absolute -left-[31px] top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full border-2 ${
                                    isDone
                                      ? 'bg-emerald-400 border-emerald-200'
                                      : isActive
                                      ? 'bg-cyan-400 border-white animate-pulse'
                                      : 'bg-neutral-900 border-neutral-500'
                                  }`}
                                />
                                <div className="space-y-0.5 min-w-0">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="text-[11px] font-mono font-bold text-cyan-300">
                                      Day {day.dayNumber}
                                    </span>
                                    <span className="text-xs font-bold text-[var(--gd-ink)] truncate">
                                      {day.title}
                                    </span>
                                  </div>
                                  <div className="text-[11px] text-[var(--gd-muted)] truncate">
                                    {day.subtopics.slice(0, 2).join(' • ')}
                                  </div>
                                </div>

                                <div className="flex items-center gap-2 shrink-0 text-[10px] font-mono">
                                  <span className="text-[var(--gd-muted)]">
                                    {day.estimatedMinutes}m
                                  </span>
                                  <span
                                    className={`px-2 py-0.5 rounded-full font-bold border ${
                                      isDone
                                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                                        : isActive
                                        ? 'bg-cyan-500/20 text-cyan-200 border-cyan-400/50'
                                        : 'bg-white/5 text-neutral-400 border-white/10'
                                    }`}
                                  >
                                    {isDone ? '✓ Done' : isActive ? '● Active Day' : '○ Upcoming'}
                                  </span>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ============================================================= */}
            {/* TAB 3: SKILL ASSESSMENT (EMBEDDED DIAGNOSTIC & FULL LINK)     */}
            {/* ============================================================= */}
            {activeTab === 'assessment' && (
              <div className="space-y-4">
                <div className="rounded-3xl gd-panel p-6 shadow-xl space-y-4">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <h3 className="text-lg font-extrabold text-[var(--gd-ink)] flex items-center gap-2">
                        <GraduationCap className="w-5 h-5 text-[var(--gd-teal)]" />
                        <span>Course &amp; Role Readiness Check</span>
                      </h3>
                      <p className="text-xs text-[var(--gd-muted)]">
                        Benchmark readiness for <strong className="text-[var(--gd-ink)]">{activeCareer.name}</strong> (Target: 65%+) or launch your full daily assessment.
                      </p>
                    </div>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => navigate('/assessment')}
                      className="text-xs font-bold bg-gradient-to-r from-cyan-400 to-emerald-400 text-black rounded-xl px-4 cursor-pointer shrink-0"
                    >
                      Open Full Daily Skill Assessment →
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="p-4 rounded-2xl bg-[var(--gd-inner)] border border-[var(--gd-rim)] space-y-1">
                      <span className="text-[11px] font-mono text-[var(--gd-muted)]">
                        Target Role Readiness
                      </span>
                      <div className="text-2xl font-extrabold text-[var(--gd-teal)] font-mono">
                        {readiness.overall}%
                      </div>
                      <span className="text-[11px] text-[var(--gd-muted)]">
                        {readiness.overall >= 65 ? 'Meets 65%+ benchmark' : 'Target 65%+ benchmark'}
                      </span>
                    </div>

                    <div className="p-4 rounded-2xl bg-[var(--gd-inner)] border border-[var(--gd-rim)] space-y-1">
                      <span className="text-[11px] font-mono text-[var(--gd-muted)]">
                        Assessment Streak
                      </span>
                      <div className="text-2xl font-extrabold text-[var(--gd-coral)] font-mono flex items-center gap-1.5">
                        <Flame className="w-5 h-5" />
                        <span>{dailyStatus?.dailyStreak ?? 0}d</span>
                      </div>
                      <span className="text-[11px] text-[var(--gd-muted)]">
                        Daily consistency score
                      </span>
                    </div>

                    <div className="p-4 rounded-2xl bg-[var(--gd-inner)] border border-[var(--gd-rim)] space-y-1">
                      <span className="text-[11px] font-mono text-[var(--gd-muted)]">
                        Today&apos;s Daily Status
                      </span>
                      <div
                        className={`text-sm font-bold ${
                          dailyStatus?.completedToday ? 'text-emerald-400' : 'text-amber-300'
                        }`}
                      >
                        {dailyStatus?.completedToday
                          ? 'Completed Today ✓'
                          : `Pending — ${dailyStatus?.requiredQuestions || 20} Questions`}
                      </div>
                      <span className="text-[11px] text-[var(--gd-muted)]">
                        SQLite Daily Tracking
                      </span>
                    </div>
                  </div>
                </div>

                {/* Embedded 12-Question Course-Matched Quick Diagnostic */}
                <div className="rounded-3xl gd-panel p-6 shadow-xl space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[var(--gd-line)]">
                    <div>
                      <h4 className="text-sm font-bold text-[var(--gd-ink)]">
                        Quick Course Diagnostic Check ({courseDiagnosticQuestions.length} MCQs)
                      </h4>
                      <p className="text-xs text-[var(--gd-muted)]">
                        Matched to {activeCourse.title} &amp; {activeCareer.name}
                      </p>
                    </div>
                    {diagSubmitted && (
                      <div className="px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-xs font-mono font-bold text-emerald-300">
                        Score: {diagScore.correct}/{diagScore.total} ({diagScore.pct}%)
                      </div>
                    )}
                  </div>

                  <div className="space-y-4">
                    {courseDiagnosticQuestions.map((q, qIdx) => {
                      const chosen = diagAnswers[q.id];
                      return (
                        <div
                          key={q.id}
                          className="p-4 rounded-2xl bg-[var(--gd-inner)] border border-[var(--gd-rim)] space-y-2.5"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="text-xs sm:text-sm font-semibold text-[var(--gd-ink)]">
                              <span className="font-mono text-[var(--gd-teal)] mr-1.5">
                                Q{qIdx + 1}.
                              </span>
                              {q.question}
                            </div>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[var(--gd-card)] text-[var(--gd-muted)] shrink-0">
                              {q.topic}
                            </span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {q.options.map((opt, oIdx) => {
                              const isChosen = chosen === oIdx;
                              const isCorrect = oIdx === q.correctAnswer;
                              let cls =
                                'bg-[var(--gd-card)] border-[var(--gd-rim)] text-[var(--gd-ink)] hover:border-cyan-500/40';
                              if (diagSubmitted) {
                                if (isCorrect) {
                                  cls = 'bg-emerald-500/20 border-emerald-400 text-emerald-200 font-semibold';
                                } else if (isChosen && !isCorrect) {
                                  cls = 'bg-rose-500/20 border-rose-400 text-rose-200';
                                }
                              } else if (isChosen) {
                                cls = 'bg-cyan-500/20 border-cyan-400 text-cyan-200 font-semibold';
                              }
                              return (
                                <button
                                  key={oIdx}
                                  type="button"
                                  disabled={diagSubmitted}
                                  onClick={() =>
                                    setDiagAnswers((prev) => ({ ...prev, [q.id]: oIdx }))
                                  }
                                  className={`p-2.5 rounded-xl border text-left text-xs transition-all cursor-pointer flex items-center justify-between gap-2 ${cls}`}
                                >
                                  <span>{opt}</span>
                                  {diagSubmitted && isCorrect && (
                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                                  )}
                                  {diagSubmitted && isChosen && !isCorrect && (
                                    <XCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                                  )}
                                </button>
                              );
                            })}
                          </div>

                          {diagSubmitted && (
                            <p className="text-[11px] text-emerald-300/90 font-mono pt-1 border-t border-[var(--gd-line)]">
                              Explanation: {q.explanation}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    {!diagSubmitted ? (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => setDiagSubmitted(true)}
                        className="text-xs font-bold bg-gradient-to-r from-cyan-400 to-emerald-400 text-black rounded-xl px-5 cursor-pointer"
                      >
                        Check Diagnostic Score
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setDiagAnswers({});
                          setDiagSubmitted(false);
                        }}
                        className="text-xs cursor-pointer"
                      >
                        <RotateCcw className="w-3.5 h-3.5 mr-1.5" /> Retake Quick Check
                      </Button>
                    )}

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate('/assessment')}
                      className="text-xs cursor-pointer"
                    >
                      Go to Full Daily Assessment →
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* ============================================================= */}
            {/* TAB 4: APTITUDE PREP (4-PHASE ROADMAP & 20-Q LAUNCHER)        */}
            {/* ============================================================= */}
            {activeTab === 'aptitude' && (
              <div className="space-y-4">
                <div className="rounded-3xl gd-panel p-6 shadow-xl space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-extrabold text-[var(--gd-ink)] flex items-center gap-2">
                        <Calculator className="w-5 h-5 text-[var(--gd-teal)]" />
                        <span>4-Phase Aptitude Roadmap Progress</span>
                      </h3>
                      <p className="text-xs text-[var(--gd-muted)]">
                        Round-1 screening readiness paired with your Day {selectedDayNum}{' '}
                        {activeCourse.title} schedule.
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate('/aptitude')}
                      className="text-xs cursor-pointer shrink-0"
                    >
                      Explore All 71 Topics →
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {aptitudePhaseProgress.map((ph) => (
                      <div
                        key={ph.phase}
                        className="p-4 rounded-2xl bg-[var(--gd-inner)] border border-[var(--gd-rim)] space-y-2"
                      >
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-[var(--gd-ink)]">{ph.title}</span>
                          <span className="font-mono text-emerald-400 font-bold">{ph.pct}%</span>
                        </div>
                        <p className="text-[11px] text-[var(--gd-muted)]">{ph.subtitle}</p>
                        <div className="w-full h-1.5 rounded-full bg-[var(--gd-track)] overflow-hidden">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-emerald-400"
                            style={{ width: `${ph.pct}%` }}
                          />
                        </div>
                        <div className="text-[10px] font-mono text-[var(--gd-muted)]">
                          {ph.doneCount} / {ph.totalCount} core phase topics practiced
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recommended Aptitude Topics for Today's Study Day */}
                <div className="rounded-3xl gd-panel p-6 shadow-xl space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-[var(--gd-ink)] flex items-center gap-2">
                      <Layers className="w-4 h-4 text-cyan-400" />
                      <span>Recommended Topics for Day {selectedDayNum}</span>
                    </h4>
                    <span className="text-[11px] font-mono text-[var(--gd-muted)]">
                      One-click launches 20-Q Timed Set
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {recommendedAptitudeTopics.map((topic) => (
                      <div
                        key={topic.id}
                        className="p-4 rounded-2xl bg-[var(--gd-inner)] border border-[var(--gd-rim)] flex flex-col justify-between gap-3"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                              {topic.category}
                            </span>
                            <span className="text-[10px] font-mono text-[var(--gd-muted)]">
                              {topic.difficulty} • {topic.estimatedMinutes}m
                            </span>
                          </div>
                          <div className="text-xs font-bold text-[var(--gd-ink)]">
                            {topic.title}
                          </div>
                          <p className="text-[11px] text-[var(--gd-muted)] line-clamp-2">
                            {topic.description}
                          </p>
                        </div>

                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() =>
                            navigate(`/aptitude?topic=${encodeURIComponent(topic.id)}&count=20`)
                          }
                          className="w-full text-xs font-bold bg-gradient-to-r from-cyan-400 to-emerald-400 text-black rounded-xl cursor-pointer"
                        >
                          Start 20-Q Aptitude Set →
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ============================================================= */}
            {/* TAB 5: CODING PRACTICE (COURSE-FILTERED PROBLEMS + LIVE IDE)  */}
            {/* ============================================================= */}
            {activeTab === 'coding' && (
              <div className="rounded-3xl gd-panel p-6 shadow-xl space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[var(--gd-line)]">
                  <div>
                    <h3 className="text-lg font-extrabold text-[var(--gd-ink)] flex items-center gap-2">
                      <Code2 className="w-5 h-5 text-[var(--gd-teal)]" />
                      <span>Hands-On Coding Labs for {activeCourse.title}</span>
                    </h3>
                    <p className="text-xs text-[var(--gd-muted)]">
                      Filtered from the {CODING_PROBLEMS.length}-problem placement bank. Click any problem to open the live Python / JS / C++ / Java editor.
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    {(['All', 'Easy', 'Medium', 'Hard'] as const).map((diff) => (
                      <button
                        key={diff}
                        type="button"
                        onClick={() => setCodingDiffFilter(diff)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-mono border cursor-pointer ${
                          codingDiffFilter === diff
                            ? 'bg-cyan-500/20 text-cyan-200 border-cyan-500/50 font-bold'
                            : 'bg-[var(--gd-inner)] text-[var(--gd-muted)] border-[var(--gd-rim)] hover:text-[var(--gd-ink)]'
                        }`}
                      >
                        {diff}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {matchedCodingProblems.map((problem) => {
                    const isSolved = progress.solvedCodingProblemIds.includes(problem.id);
                    const diffCls =
                      problem.difficulty === 'Easy'
                        ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                        : problem.difficulty === 'Medium'
                        ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                        : 'bg-rose-500/15 text-rose-300 border-rose-500/30';

                    return (
                      <div
                        key={problem.id}
                        className="p-4 rounded-2xl bg-[var(--gd-inner)] border border-[var(--gd-rim)] hover:border-cyan-500/40 transition-all flex flex-col justify-between gap-3"
                      >
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between gap-2">
                            <span
                              className={`text-[10px] font-mono px-2 py-0.5 rounded-full border font-bold ${diffCls}`}
                            >
                              {problem.difficulty}
                            </span>
                            <div className="flex items-center gap-1.5">
                              <span className="text-[10px] font-mono text-[var(--gd-muted)]">
                                {problem.category}
                              </span>
                              {isSolved && (
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                              )}
                            </div>
                          </div>

                          <div className="text-sm font-bold text-[var(--gd-ink)]">
                            {problem.title}
                          </div>

                          <div className="flex flex-wrap gap-1">
                            {problem.companies.slice(0, 3).map((comp) => (
                              <span
                                key={comp}
                                className="px-1.5 py-0.5 rounded bg-[var(--gd-card)] text-[10px] font-mono text-[var(--gd-muted)]"
                              >
                                {comp}
                              </span>
                            ))}
                          </div>
                        </div>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            navigate(`/coding?problem=${encodeURIComponent(problem.id)}`)
                          }
                          className="w-full text-xs font-semibold border-cyan-500/40 text-cyan-200 hover:bg-cyan-500/15 rounded-xl cursor-pointer"
                        >
                          Solve in Live Editor →
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CoursesPage;
