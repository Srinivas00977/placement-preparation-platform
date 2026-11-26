import React, { useState, useEffect, useRef, useMemo } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import {
  Compass,
  TrendingUp,
  Award,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Code2,
  Calculator,
  Cpu,
  Users,
  FileText,
  Target,
  Clock,
  Zap,
  Activity,
  Plus,
  ArrowUpRight,
  Filter,
  Search,
  Flame,
  X,
  BookOpen,
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { authService } from '@/services/authService';
import { progressService, type UserProgressData } from '@/services/progressService';
import { assessmentService, type DailyAssessmentStatus } from '@/services/assessmentService';
import { courseService, type CourseProgressState } from '@/services/courseService';
import { getUnifiedDailyReminders } from '@/lib/dailyReminders';
import { CODING_PROBLEMS } from '@/data/codingProblems';
import { TECHNICAL_TOPICS } from '@/data/technicalTopics';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const [user, setUser] = useState(() => authService.getCurrentUser());
  const [progress, setProgress] = useState<UserProgressData>(() => progressService.getUserProgress());
  const [dailyStatus, setDailyStatus] = useState<DailyAssessmentStatus | null>(null);
  const [courseProgress, setCourseProgress] = useState<CourseProgressState>(() =>
    courseService.getLocalProgress()
  );
  const [bannerDismissed, setBannerDismissed] = useState<boolean>(() => {
    try {
      const today = new Date().toISOString().split('T')[0];
      return sessionStorage.getItem(`placepilot_dismiss_assessment_banner_${today}`) === 'true';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    let isMounted = true;
    assessmentService.getStatus().then((status) => {
      if (isMounted) setDailyStatus(status);
    });
    courseService.fetchRemoteProgress().then((cp) => {
      if (isMounted) setCourseProgress(cp);
    });
    const unsubCourse = courseService.subscribe(() => {
      setCourseProgress(courseService.getLocalProgress());
    });
    return () => {
      isMounted = false;
      unsubCourse();
    };
  }, []);

  const handleDismissBanner = () => {
    setBannerDismissed(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      sessionStorage.setItem(`placepilot_dismiss_assessment_banner_${today}`, 'true');
    } catch {
      // ignore
    }
  };

  // Recent Activity Search & Filter
  const [activitySearch, setActivitySearch] = useState('');
  const [activityCategoryFilter, setActivityCategoryFilter] = useState<string>('All');

  useEffect(() => {
    const unsubscribe = progressService.subscribe(() => {
      setProgress(progressService.getUserProgress());
      setUser(authService.getCurrentUser());
    });
    return () => unsubscribe();
  }, []);

  const readiness = progressService.calculateReadinessWithData(progress);
  const dailyReminders = getUnifiedDailyReminders(progress, dailyStatus, courseProgress);

  const handleToggleGoal = (id: string) => {
    progressService.toggleGoalCompleted(id);
  };

  const getReadinessLevel = (score: number) => {
    if (score >= 75) return { label: 'Placement Ready', color: 'text-[var(--gd-teal)] bg-[var(--gd-inner)] border-[var(--gd-rim)]' };
    if (score >= 45) return { label: 'In Progress / On Track', color: 'text-[var(--gd-ochre)] bg-[var(--gd-inner)] border-[var(--gd-rim)]' };
    return { label: 'Needs Initial Focus', color: 'text-[var(--gd-coral)] bg-[var(--gd-inner)] border-[var(--gd-rim)]' };
  };

  const readinessStatus = getReadinessLevel(readiness.overall);

  // Active goals (up to 4)
  const activeGoals = progress.goals.slice(0, 4);

  // Unified Recent Activities List
  const recentActivities = useMemo(() => {
    const list: Array<{
      id: string;
      title: string;
      category: 'Coding' | 'Aptitude' | 'Technical' | 'Resume' | 'Assessment' | 'Goals';
      date: string;
      status: 'Completed' | 'Analyzed' | 'Passed';
      score?: string;
    }> = [];

    // Diagnostic Assessment
    if (progress.assessment) {
      list.push({
        id: 'act-assessment',
        title: `Full Skill Diagnostic Test (${progress.assessment.targetRole})`,
        category: 'Assessment',
        date: new Date(progress.assessment.completedAt).toLocaleDateString(),
        status: 'Completed',
        score: `${progress.assessment.scores.overall}%`,
      });
    }

    // Coding problems solved
    progress.solvedCodingProblemIds.forEach((pid) => {
      const prob = CODING_PROBLEMS.find((p) => p.id === pid);
      list.push({
        id: `act-code-${pid}`,
        title: prob ? `${prob.title} [${prob.difficulty}]` : `Problem #${pid}`,
        category: 'Coding',
        date: 'Recent',
        status: 'Completed',
        score: '100% Tests',
      });
    });

    // Technical topics completed
    progress.completedTechnicalTopicIds.forEach((tid) => {
      const topic = TECHNICAL_TOPICS.find((t) => t.id === tid);
      list.push({
        id: `act-tech-${tid}`,
        title: topic ? `${topic.title} Core Revision` : `Topic #${tid}`,
        category: 'Technical',
        date: 'Recent',
        status: 'Completed',
        score: 'Mastered',
      });
    });

    // Aptitude attempts
    progress.aptitudeAttempts.slice(0, 3).forEach((attempt, idx) => {
      list.push({
        id: `act-apt-${idx}`,
        title: `${attempt.topicId.toUpperCase()} Practice Set`,
        category: 'Aptitude',
        date: new Date(attempt.date).toLocaleDateString(),
        status: 'Passed',
        score: `${Math.round((attempt.score / attempt.total) * 100)}%`,
      });
    });

    // Resume Scan
    if (progress.latestResumeAnalysis) {
      list.push({
        id: 'act-resume',
        title: `Resume ATS Scan (${progress.latestResumeAnalysis.targetRole})`,
        category: 'Resume',
        date: new Date(progress.latestResumeAnalysis.analyzedAt).toLocaleDateString(),
        status: 'Analyzed',
        score: `${progress.latestResumeAnalysis.atsScore}% ATS`,
      });
    }

    // Completed goals
    progress.goals.filter((g) => g.completed).forEach((g) => {
      list.push({
        id: `act-goal-${g.id}`,
        title: `Goal: ${g.title}`,
        category: 'Goals',
        date: g.targetDate,
        status: 'Completed',
      });
    });

    return list;
  }, [progress]);

  // Filtered recent activities
  const filteredActivities = recentActivities.filter((act) => {
    const matchesCategory = activityCategoryFilter === 'All' || act.category === activityCategoryFilter;
    const matchesQuery = act.title.toLowerCase().includes(activitySearch.toLowerCase()) ||
                         act.category.toLowerCase().includes(activitySearch.toLowerCase());
    return matchesCategory && matchesQuery;
  });

  // GSAP Smooth Animations: Staggered Entrance, Counters, Progress Bars
  useGSAP(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;

    // 1. Staggered Entrance for panels with data-gd-enter
    gsap.fromTo(
      '[data-gd-enter]',
      { y: 16, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        stagger: 0.05,
        duration: 0.45,
        ease: 'power2.out',
      }
    );

    // 2. Animated Number Counters
    const counters = document.querySelectorAll<HTMLElement>('[data-counter-val]');
    counters.forEach((el) => {
      const targetVal = parseFloat(el.getAttribute('data-counter-val') || '0');
      const isPercent = el.getAttribute('data-counter-percent') === 'true';
      const obj = { val: 0 };
      gsap.to(obj, {
        val: targetVal,
        duration: 1.15,
        ease: 'power2.out',
        onUpdate: () => {
          el.textContent = Math.round(obj.val) + (isPercent ? '%' : '');
        },
      });
    });

    // 3. Progress bars scaleX entrance
    const bars = document.querySelectorAll<HTMLElement>('[data-progress-bar]');
    bars.forEach((bar) => {
      gsap.fromTo(
        bar,
        { scaleX: 0, transformOrigin: 'left center' },
        { scaleX: 1, duration: 1.2, ease: 'power2.out', delay: 0.1 }
      );
    });
  }, { scope: containerRef, dependencies: [readiness.overall, progress] });

  return (
    <DashboardLayout
      pageTitle="Placement Readiness Dashboard"
      pageSubtitle="Live AI analysis of your preparation performance, gaps, and milestones."
    >
      <div ref={containerRef} className="space-y-6 sm:space-y-8 min-w-0 bg-transparent">
        {/* UNIFIED DAILY REMINDER STRIP (ASSESSMENT + ACTIVE COURSE + PRACTICE) */}
        {dailyReminders.length > 0 && !bannerDismissed && (
          <div
            data-gd-enter
            className="relative overflow-hidden rounded-3xl p-5 sm:p-6 gd-panel border border-rose-500/30 bg-gradient-to-r from-rose-500/10 via-cyan-500/5 to-transparent shadow-xl min-w-0 space-y-4"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 flex-wrap">
                <div className="p-2 rounded-xl bg-rose-500/15 text-rose-400 border border-rose-500/30 shrink-0">
                  <Flame className="w-4 h-4 text-rose-400" />
                </div>
                <h3 className="text-sm sm:text-base font-bold text-[var(--gd-ink)]">
                  Today&apos;s Daily Preparation Checklist ({dailyReminders.length} Pending)
                </h3>
                {dailyStatus && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                    {dailyStatus.dailyStreak} Day Streak
                  </span>
                )}
              </div>

              <button
                type="button"
                onClick={handleDismissBanner}
                className="p-1.5 rounded-full hover:bg-[var(--gd-card)] text-[var(--gd-muted)] hover:text-[var(--gd-ink)] transition-colors cursor-pointer shrink-0"
                title="Dismiss reminder strip for today"
                aria-label="Dismiss banner"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {dailyReminders.map((rem) => (
                <div
                  key={rem.id}
                  className="p-3.5 rounded-2xl bg-[var(--gd-inner)] border border-[var(--gd-rim)] flex flex-col justify-between gap-2.5"
                >
                  <div className="space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] font-bold text-[var(--gd-ink)] flex items-center gap-1.5">
                        {rem.id === 'assessment' ? (
                          <Award className="w-3.5 h-3.5 text-rose-400" />
                        ) : rem.id === 'course' ? (
                          <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
                        ) : (
                          <Code2 className="w-3.5 h-3.5 text-emerald-400" />
                        )}
                        <span>{rem.title}</span>
                      </span>
                      {rem.badgeText && (
                        <span className="text-[10px] font-mono text-[var(--gd-teal)]">
                          {rem.badgeText}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[var(--gd-muted)] leading-relaxed">
                      {rem.message}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => navigate(rem.route)}
                    className="w-full px-3 py-1.5 rounded-xl bg-[var(--gd-card)] hover:bg-[var(--gd-raised)] border border-[var(--gd-rim)] hover:border-[var(--gd-teal)] text-xs font-semibold text-[var(--gd-ink)] inline-flex items-center justify-center gap-1 transition-all cursor-pointer"
                  >
                    <span>{rem.ctaLabel}</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 1. WELCOME BANNER (SPATIAL GLASS) */}
        <div
          data-gd-enter
          className="relative overflow-hidden rounded-3xl gd-panel p-6 sm:p-7 shadow-2xl min-w-0"
        >
          {/* Subtle Ambient Light Reflections */}
          <div className="absolute -right-8 -top-8 w-60 h-60 bg-[var(--gd-teal)]/15 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6 min-w-0">
            <div className="space-y-2 max-w-2xl min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[var(--gd-inner)] border border-[var(--gd-rim)] text-xs font-mono text-[var(--gd-teal)]">
                  <Target className="w-3.5 h-3.5" />
                  <span>Targeting: {progress.profile.targetRole || 'Software Engineer'}</span>
                </div>
                {progress.profile.targetCompanies && progress.profile.targetCompanies.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-[11px] font-mono text-[var(--gd-muted)] ml-1">Target Companies:</span>
                    {progress.profile.targetCompanies.map((comp) => (
                      <span
                        key={comp}
                        className="px-2.5 py-0.5 rounded-full text-[11px] font-mono bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 font-medium"
                      >
                        {comp}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--gd-ink)] truncate">
                Welcome back, {user?.name || 'Candidate'}!
              </h2>
              <p className="text-xs sm:text-sm text-[var(--gd-muted)] leading-relaxed">
                {progress.assessment
                  ? 'Your placement diagnostic profile is active. Target your identified weak topics below to maximize your interview conversion rate.'
                  : 'Start by completing the comprehensive Skill Assessment to diagnose your strengths, weaknesses, and personalized roadmap.'}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <button
                type="button"
                onClick={() => navigate('/roadmap')}
                className="px-5 py-2.5 rounded-full bg-[var(--gd-primary)] text-[var(--gd-primary-ink)] font-semibold text-xs sm:text-sm hover:opacity-90 transition-opacity inline-flex items-center gap-2 cursor-pointer shadow-lg"
              >
                <Compass className="w-4 h-4 text-[var(--gd-teal)]" />
                View AI Roadmap
              </button>
              <button
                type="button"
                onClick={() => navigate('/assessment')}
                className="px-5 py-2.5 rounded-full bg-[var(--gd-inner)] hover:bg-[var(--gd-card)] border border-[var(--gd-rim)] text-[var(--gd-ink)] font-medium text-xs sm:text-sm transition-colors inline-flex items-center gap-2 cursor-pointer"
              >
                <Award className="w-4 h-4 text-[var(--gd-teal)]" />
                Take Assessment
              </button>
            </div>
          </div>
        </div>

        {/* 2. PRIMARY HERO CARDS: LEFT (OVERALL READINESS) + RIGHT (RECESSED SUMMARY TRAY) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 min-w-0">
          {/* LEFT: Overall Placement Readiness (7 cols) */}
          <div
            data-gd-enter
            className="lg:col-span-7 rounded-3xl gd-panel p-6 sm:p-7 shadow-2xl flex flex-col justify-between min-w-0"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center space-x-2.5">
                  <div className="p-2 rounded-2xl bg-[var(--gd-inner)] border border-[var(--gd-rim)] text-[var(--gd-teal)] shadow-inner">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-[var(--gd-ink)] tracking-tight">
                      Overall Placement Readiness
                    </h3>
                    <p className="text-xs text-[var(--gd-muted)]">
                      Weighted score across DSA, Aptitude, CS Core, HR, and ATS Resume
                    </p>
                  </div>
                </div>

                <span className={`text-xs px-3 py-1 rounded-full font-medium border ${readinessStatus.color}`}>
                  {readinessStatus.label}
                </span>
              </div>

              {/* Progress bar and large tabular metrics */}
              <div className="space-y-2 pt-2">
                <div className="flex items-baseline justify-between">
                  <div className="flex items-baseline space-x-1.5">
                    <span
                      data-counter-val={readiness.overall}
                      className="text-4xl sm:text-5xl font-black text-[var(--gd-ink)] font-mono tracking-tight tabular-nums"
                    >
                      {readiness.overall}
                    </span>
                    <span className="text-xl text-[var(--gd-muted)] font-mono font-bold">%</span>
                    <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-[var(--gd-inner)] border border-[var(--gd-rim)] text-[var(--gd-teal)] font-mono">
                      +Diagnostic
                    </span>
                  </div>
                  <span className="text-xs text-[var(--gd-muted)] font-medium">Target: 85%+</span>
                </div>

                <div className="w-full h-3 rounded-full bg-[var(--gd-track)] border border-[var(--gd-rim)] overflow-hidden p-0.5 shadow-inner">
                  <div
                    data-progress-bar
                    className="h-full rounded-full bg-gradient-to-r from-[var(--gd-teal)] to-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.6)]"
                    style={{ width: `${readiness.overall}%` }}
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => navigate('/roadmap')}
                  className="px-4 py-2 rounded-full bg-[var(--gd-primary)] text-[var(--gd-primary-ink)] font-semibold text-xs hover:opacity-90 transition-opacity inline-flex items-center gap-1.5 cursor-pointer shadow-md"
                >
                  <span>View AI Roadmap</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/assessment')}
                  className="px-4 py-2 rounded-full bg-[var(--gd-inner)] hover:bg-[var(--gd-card)] border border-[var(--gd-rim)] text-[var(--gd-ink)] font-medium text-xs transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Take Assessment</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[var(--gd-muted)]" />
                </button>
              </div>
            </div>

            {/* 3-Column Inner Glass Strip */}
            <div className="pt-5 border-t border-[var(--gd-line)] mt-5 grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-2xl bg-[var(--gd-inner)] border border-[var(--gd-rim)] shadow-inner">
                <span className="text-[var(--gd-muted)] block text-[11px]">Assessment Baseline</span>
                <span className="font-semibold text-[var(--gd-ink)]">
                  {progress.assessment ? `${progress.assessment.scores.overall}% Diagnostic` : 'Not Taken'}
                </span>
              </div>
              <div className="p-3 rounded-2xl bg-[var(--gd-inner)] border border-[var(--gd-rim)] shadow-inner">
                <span className="text-[var(--gd-muted)] block text-[11px]">Completed Activities</span>
                <span className="font-semibold text-[var(--gd-ink)]">
                  {readiness.completedActivities} Milestones
                </span>
              </div>
              <div className="p-3 rounded-2xl bg-[var(--gd-inner)] border border-[var(--gd-rim)] shadow-inner col-span-2 sm:col-span-1">
                <span className="text-[var(--gd-muted)] block text-[11px]">Daily Prep Goal</span>
                <span className="font-semibold text-[var(--gd-ink)]">
                  {progress.profile.dailyGoalHours} Hours / Day
                </span>
              </div>
            </div>
          </div>

          {/* RIGHT: Recessed Translucent Tray (2x2 Grid) */}
          <div
            data-gd-enter
            className="lg:col-span-5 p-3 rounded-3xl border border-[var(--gd-rim)] bg-black/15 backdrop-blur-xl shadow-inner grid grid-cols-2 gap-3 min-w-0"
          >
            {/* Top-Left: Signature Rich Emerald-Teal Glowing Glass Card (Coding Solved) */}
            <div className="gd-metric-teal p-4.5 flex flex-col justify-between shadow-xl min-w-0 relative overflow-hidden group">
              <div className="flex items-center justify-between">
                <span className="text-xs text-white/95 font-medium">Coding Solved</span>
                <div className="p-2 rounded-xl bg-white/20 text-white shadow-inner">
                  <Code2 className="w-4 h-4" />
                </div>
              </div>

              <div className="space-y-1 pt-3">
                <div
                  data-counter-val={progress.solvedCodingProblemIds.length}
                  className="text-3xl font-extrabold text-white font-mono tracking-tight tabular-nums"
                >
                  {progress.solvedCodingProblemIds.length}
                </div>
                <NavLink
                  to="/coding"
                  className="text-[11px] text-teal-100 hover:text-white inline-flex items-center gap-1 font-medium group-hover:underline"
                >
                  Practice DSA <ArrowRight className="w-3 h-3" />
                </NavLink>
              </div>
            </div>

            {/* Top-Right: Aptitude Sets Card */}
            <div className="gd-metric p-4.5 flex flex-col justify-between transition-all min-w-0 group hover:border-[var(--gd-edge-light)]">
              <div className="flex items-center justify-between">
                <span className="text-xs text-[var(--gd-muted)] font-medium">Aptitude Sets</span>
                <div className="p-2 rounded-xl bg-[var(--gd-inner)] text-[var(--gd-teal)]">
                  <Calculator className="w-4 h-4" />
                </div>
              </div>

              <div className="space-y-1 pt-3">
                <div className="text-3xl font-extrabold text-[var(--gd-ink)] font-mono tracking-tight tabular-nums flex items-baseline">
                  <span data-counter-val={progress.aptitudeAttempts.length}>
                    {progress.aptitudeAttempts.length}
                  </span>
                  <span className="text-[11px] text-[var(--gd-muted)] font-normal ml-1.5">
                    ({new Set(progress.aptitudeAttempts.map((a) => a.topicId)).size}/71 topics)
                  </span>
                </div>
                <NavLink
                  to="/aptitude"
                  className="text-[11px] text-[var(--gd-teal)] inline-flex items-center gap-1 font-medium group-hover:underline"
                >
                  71-Topic Drills <ArrowRight className="w-3 h-3" />
                </NavLink>
              </div>
            </div>

            {/* Bottom-Left: Tech Topics Card */}
            <div className="gd-metric p-4.5 flex flex-col justify-between transition-all min-w-0 group hover:border-[var(--gd-edge-light)]">
              <div className="flex items-center justify-between">
                <span className="text-xs text-[var(--gd-muted)] font-medium">Tech Topics</span>
                <div className="p-2 rounded-xl bg-[var(--gd-inner)] text-[var(--gd-teal)]">
                  <Cpu className="w-4 h-4" />
                </div>
              </div>

              <div className="space-y-1 pt-3">
                <div className="text-3xl font-extrabold text-[var(--gd-ink)] font-mono tracking-tight tabular-nums flex items-baseline">
                  <span data-counter-val={progress.completedTechnicalTopicIds.length}>
                    {progress.completedTechnicalTopicIds.length}
                  </span>
                  <span className="text-[11px] text-[var(--gd-muted)] font-normal ml-1.5">
                    subtopics completed
                  </span>
                </div>
                <NavLink
                  to="/technical"
                  className="text-[11px] text-[var(--gd-teal)] inline-flex items-center gap-1 font-medium group-hover:underline"
                >
                  12-Career Hub <ArrowRight className="w-3 h-3" />
                </NavLink>
              </div>
            </div>

            {/* Bottom-Right: Goals Met Card */}
            <div className="gd-metric p-4.5 flex flex-col justify-between transition-all min-w-0 group hover:border-[var(--gd-edge-light)]">
              <div className="flex items-center justify-between">
                <span className="text-xs text-[var(--gd-muted)] font-medium">Goals Met</span>
                <div className="p-2 rounded-xl bg-[var(--gd-inner)] text-[var(--gd-coral)]">
                  <Target className="w-4 h-4" />
                </div>
              </div>

              <div className="space-y-1 pt-3">
                <div className="text-3xl font-extrabold text-[var(--gd-ink)] font-mono tracking-tight tabular-nums flex items-baseline">
                  <span data-counter-val={progress.goals.filter((g) => g.completed).length}>
                    {progress.goals.filter((g) => g.completed).length}
                  </span>
                  <span className="text-sm text-[var(--gd-muted)] font-normal ml-1">/ {progress.goals.length}</span>
                </div>
                <NavLink
                  to="/goals"
                  className="text-[11px] text-[var(--gd-coral)] inline-flex items-center gap-1 font-medium group-hover:underline"
                >
                  Active Goals <ArrowRight className="w-3 h-3" />
                </NavLink>
              </div>
            </div>
          </div>
        </div>

        {/* 3. CATEGORY PREPARATION BREAKDOWN (5 FROSTED CARDS) */}
        <div data-gd-enter className="space-y-3.5 min-w-0">
          <div className="flex items-center justify-between">
            <h3 className="text-base sm:text-lg font-bold text-[var(--gd-ink)] tracking-tight flex items-center gap-2">
              <Activity className="w-4 h-4 text-[var(--gd-teal)]" />
              Category Preparation Breakdown
            </h3>
            <span className="text-xs text-[var(--gd-muted)]">Real-time weighted metrics</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3.5 sm:gap-4 min-w-0">
            {/* Aptitude */}
            <div className="rounded-2xl gd-panel p-4.5 flex flex-col justify-between transition-all group min-w-0 shadow-lg hover:border-[var(--gd-edge-light)]">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="p-2 rounded-xl bg-[var(--gd-inner)] text-[var(--gd-teal)] border border-[var(--gd-rim)]">
                    <Calculator className="w-4 h-4" />
                  </div>
                  <span
                    data-counter-val={readiness.categories.aptitude}
                    data-counter-percent="true"
                    className="text-xs font-mono font-bold text-[var(--gd-ink)] tabular-nums"
                  >
                    {readiness.categories.aptitude}%
                  </span>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-[var(--gd-ink)]">Aptitude Prep</h4>
                  <p className="text-[11px] text-[var(--gd-muted)]">
                    Quant, Logical, Verbal &amp; DI ({new Set(progress.aptitudeAttempts.map((a) => a.topicId)).size}/71)
                  </p>
                </div>
                <div className="w-full bg-[var(--gd-track)] h-1.5 rounded-full overflow-hidden">
                  <div
                    data-progress-bar
                    className="bg-[var(--gd-teal)] h-full rounded-full"
                    style={{ width: `${readiness.categories.aptitude}%` }}
                  />
                </div>
              </div>
              <NavLink
                to="/aptitude"
                className="pt-3 text-[11px] text-[var(--gd-teal)] font-medium inline-flex items-center gap-1 group-hover:underline"
              >
                Practice sets <ArrowRight className="w-3 h-3" />
              </NavLink>
            </div>

            {/* Coding */}
            <div className="rounded-2xl gd-panel p-4.5 flex flex-col justify-between transition-all group min-w-0 shadow-lg hover:border-[var(--gd-edge-light)]">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="p-2 rounded-xl bg-[var(--gd-inner)] text-[var(--gd-teal)] border border-[var(--gd-rim)]">
                    <Code2 className="w-4 h-4" />
                  </div>
                  <span
                    data-counter-val={readiness.categories.coding}
                    data-counter-percent="true"
                    className="text-xs font-mono font-bold text-[var(--gd-ink)] tabular-nums"
                  >
                    {readiness.categories.coding}%
                  </span>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-[var(--gd-ink)]">Coding Practice</h4>
                  <p className="text-[11px] text-[var(--gd-muted)]">
                    {progress.solvedCodingProblemIds.length} solved problems
                  </p>
                </div>
                <div className="w-full bg-[var(--gd-track)] h-1.5 rounded-full overflow-hidden">
                  <div
                    data-progress-bar
                    className="bg-emerald-400 h-full rounded-full"
                    style={{ width: `${readiness.categories.coding}%` }}
                  />
                </div>
              </div>
              <NavLink
                to="/coding"
                className="pt-3 text-[11px] text-[var(--gd-teal)] font-medium inline-flex items-center gap-1 group-hover:underline"
              >
                Open Code Editor <ArrowRight className="w-3 h-3" />
              </NavLink>
            </div>

            {/* Technical */}
            <div className="rounded-2xl gd-panel p-4.5 flex flex-col justify-between transition-all group min-w-0 shadow-lg hover:border-[var(--gd-edge-light)]">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="p-2 rounded-xl bg-[var(--gd-inner)] text-[var(--gd-teal)] border border-[var(--gd-rim)]">
                    <Cpu className="w-4 h-4" />
                  </div>
                  <span
                    data-counter-val={readiness.categories.technical}
                    data-counter-percent="true"
                    className="text-xs font-mono font-bold text-[var(--gd-ink)] tabular-nums"
                  >
                    {readiness.categories.technical}%
                  </span>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-[var(--gd-ink)]">Technical Core</h4>
                  <p className="text-[11px] text-[var(--gd-muted)]">OS, DBMS, CN, OOPs</p>
                </div>
                <div className="w-full bg-[var(--gd-track)] h-1.5 rounded-full overflow-hidden">
                  <div
                    data-progress-bar
                    className="bg-teal-400 h-full rounded-full"
                    style={{ width: `${readiness.categories.technical}%` }}
                  />
                </div>
              </div>
              <NavLink
                to="/technical"
                className="pt-3 text-[11px] text-[var(--gd-teal)] font-medium inline-flex items-center gap-1 group-hover:underline"
              >
                Review Topics <ArrowRight className="w-3 h-3" />
              </NavLink>
            </div>

            {/* HR */}
            <div className="rounded-2xl gd-panel p-4.5 flex flex-col justify-between transition-all group min-w-0 shadow-lg hover:border-[var(--gd-edge-light)]">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="p-2 rounded-xl bg-[var(--gd-inner)] text-[var(--gd-coral)] border border-[var(--gd-rim)]">
                    <Users className="w-4 h-4" />
                  </div>
                  <span
                    data-counter-val={readiness.categories.hr}
                    data-counter-percent="true"
                    className="text-xs font-mono font-bold text-[var(--gd-ink)] tabular-nums"
                  >
                    {readiness.categories.hr}%
                  </span>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-[var(--gd-ink)]">HR Interview</h4>
                  <p className="text-[11px] text-[var(--gd-muted)]">STAR method feedback</p>
                </div>
                <div className="w-full bg-[var(--gd-track)] h-1.5 rounded-full overflow-hidden">
                  <div
                    data-progress-bar
                    className="bg-[var(--gd-coral)] h-full rounded-full"
                    style={{ width: `${readiness.categories.hr}%` }}
                  />
                </div>
              </div>
              <NavLink
                to="/hr-prep"
                className="pt-3 text-[11px] text-[var(--gd-coral)] font-medium inline-flex items-center gap-1 group-hover:underline"
              >
                Mock Questions <ArrowRight className="w-3 h-3" />
              </NavLink>
            </div>

            {/* Resume */}
            <div className="rounded-2xl gd-panel p-4.5 flex flex-col justify-between transition-all group min-w-0 shadow-lg hover:border-[var(--gd-edge-light)]">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="p-2 rounded-xl bg-[var(--gd-inner)] text-[var(--gd-ochre)] border border-[var(--gd-rim)]">
                    <FileText className="w-4 h-4" />
                  </div>
                  <span
                    data-counter-val={readiness.categories.resume}
                    data-counter-percent="true"
                    className="text-xs font-mono font-bold text-[var(--gd-ink)] tabular-nums"
                  >
                    {readiness.categories.resume}%
                  </span>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-[var(--gd-ink)]">Resume ATS</h4>
                  <p className="text-[11px] text-[var(--gd-muted)]">
                    {progress.latestResumeAnalysis
                      ? `${progress.latestResumeAnalysis.atsScore}% ATS Match`
                      : 'Scan Required'}
                  </p>
                </div>
                <div className="w-full bg-[var(--gd-track)] h-1.5 rounded-full overflow-hidden">
                  <div
                    data-progress-bar
                    className="bg-[var(--gd-ochre)] h-full rounded-full"
                    style={{ width: `${readiness.categories.resume}%` }}
                  />
                </div>
              </div>
              <NavLink
                to="/resume"
                className="pt-3 text-[11px] text-[var(--gd-ochre)] font-medium inline-flex items-center gap-1 group-hover:underline"
              >
                Analyze Resume <ArrowRight className="w-3 h-3" />
              </NavLink>
            </div>
          </div>
        </div>

        {/* 4. RECENT ACTIVITY GLASS TABLE WITH SEARCH & STATUS FILTER */}
        <div data-gd-enter className="rounded-3xl gd-panel p-6 sm:p-7 shadow-2xl space-y-4 min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-[var(--gd-ink)] tracking-tight flex items-center gap-2">
                <Clock className="w-4 h-4 text-[var(--gd-teal)]" />
                Recent Preparation Activity
              </h3>
              <p className="text-xs text-[var(--gd-muted)]">
                Log of completed quizzes, coding problems, technical topics, and resume scans.
              </p>
            </div>

            {/* Filter and Search controls */}
            <div className="flex items-center gap-2.5 flex-wrap">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-[var(--gd-muted)] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={activitySearch}
                  onChange={(e) => setActivitySearch(e.target.value)}
                  placeholder="Search activities..."
                  className="pl-8 pr-3 py-1.5 rounded-xl bg-[var(--gd-inner)] border border-[var(--gd-rim)] text-xs text-[var(--gd-ink)] placeholder-[var(--gd-muted)] focus:outline-none focus:border-[var(--gd-teal)] w-36 sm:w-44"
                />
              </div>

              <div className="flex items-center space-x-1 p-1 rounded-xl bg-[var(--gd-inner)] border border-[var(--gd-rim)] text-xs">
                <Filter className="w-3 h-3 text-[var(--gd-muted)] ml-1.5" />
                {['All', 'Coding', 'Aptitude', 'Technical', 'Resume'].map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setActivityCategoryFilter(cat)}
                    className={`px-2 py-0.5 rounded-lg text-[11px] font-medium transition-all ${
                      activityCategoryFilter === cat
                        ? 'bg-[var(--gd-raised)] text-[var(--gd-pick-ink)] font-semibold shadow-inner'
                        : 'text-[var(--gd-muted)] hover:text-[var(--gd-ink)]'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto rounded-2xl border border-[var(--gd-line)]">
            <table className="w-full text-left text-xs">
              <thead className="bg-[var(--gd-inner)] text-[var(--gd-muted)] uppercase font-mono text-[10px] tracking-wider border-b border-[var(--gd-line)]">
                <tr>
                  <th className="py-3 px-4">Activity Title</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Result / Metric</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--gd-line)]">
                {filteredActivities.length > 0 ? (
                  filteredActivities.map((act) => (
                    <tr key={act.id} className="hover:bg-[var(--gd-card-light)] transition-colors">
                      <td className="py-3 px-4 font-medium text-[var(--gd-ink)] truncate max-w-[240px]">
                        {act.title}
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-[var(--gd-inner)] border border-[var(--gd-rim)] text-[var(--gd-ink)]">
                          {act.category}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono text-[var(--gd-teal)] font-semibold">
                        {act.score || '—'}
                      </td>
                      <td className="py-3 px-4 text-[var(--gd-muted)] font-mono text-[11px]">
                        {act.date}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[var(--gd-inner)] text-[var(--gd-teal)] border border-[var(--gd-rim)]">
                          <CheckCircle2 className="w-3 h-3" />
                          {act.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-[var(--gd-muted)] text-xs">
                      No matching activity logged yet. Complete assessments or practice drills to build your preparation log!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* 5. STRENGTHS, WEAKNESSES & SKILL GAPS SUMMARY + ACTIVE GOALS */}
        <div data-gd-enter className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 min-w-0">
          <div className="lg:col-span-8 rounded-3xl gd-panel p-6 sm:p-7 shadow-2xl space-y-6 min-w-0">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <h3 className="text-base font-bold text-[var(--gd-ink)] tracking-tight flex items-center gap-2">
                  <Zap className="w-4 h-4 text-[var(--gd-ochre)]" />
                  Strengths, Weaknesses & Identified Skill Gaps
                </h3>
                <p className="text-xs text-[var(--gd-muted)]">
                  Derived from your diagnostic assessment results and ongoing preparation activities.
                </p>
              </div>

              <NavLink
                to="/assessment"
                className="text-xs font-medium text-[var(--gd-teal)] hover:underline shrink-0"
              >
                {progress.assessment ? 'Retake Assessment' : 'Take Diagnostic'}
              </NavLink>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 min-w-0">
              {/* STRENGTHS */}
              <div className="p-4 rounded-2xl bg-[var(--gd-inner)] border border-[var(--gd-rim)] space-y-3 min-w-0 shadow-inner">
                <div className="flex items-center space-x-2 text-xs font-bold text-[var(--gd-teal)]">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Strengths</span>
                </div>
                {readiness.strengths.length > 0 ? (
                  <div className="space-y-1.5">
                    {readiness.strengths.map((item, i) => (
                      <div
                        key={i}
                        className="text-xs text-[var(--gd-ink)] bg-[var(--gd-raised)] border border-[var(--gd-rim)] px-2.5 py-1.5 rounded-lg font-medium break-words"
                      >
                        {item}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-[var(--gd-muted)] italic">Complete assessment to reveal strengths.</p>
                )}
              </div>

              {/* WEAKNESSES */}
              <div className="p-4 rounded-2xl bg-[var(--gd-inner)] border border-[var(--gd-rim)] space-y-3 min-w-0 shadow-inner">
                <div className="flex items-center space-x-2 text-xs font-bold text-[var(--gd-ochre)]">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Weaknesses</span>
                </div>
                {readiness.weaknesses.length > 0 ? (
                  <div className="space-y-1.5">
                    {readiness.weaknesses.map((item, i) => (
                      <div
                        key={i}
                        className="text-xs text-[var(--gd-ink)] bg-[var(--gd-raised)] border border-[var(--gd-rim)] px-2.5 py-1.5 rounded-lg font-medium break-words"
                      >
                        {item}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-[var(--gd-muted)] italic">None detected yet.</p>
                )}
              </div>

              {/* SKILL GAPS */}
              <div className="p-4 rounded-2xl bg-[var(--gd-inner)] border border-[var(--gd-rim)] space-y-3 min-w-0 shadow-inner">
                <div className="flex items-center space-x-2 text-xs font-bold text-[var(--gd-coral)]">
                  <Target className="w-4 h-4" />
                  <span className="truncate">Skill Gaps ({progress.profile.targetRole})</span>
                </div>
                {readiness.skillGaps.length > 0 ? (
                  <div className="space-y-1.5">
                    {readiness.skillGaps.map((item, i) => (
                      <div
                        key={i}
                        className="text-xs text-[var(--gd-ink)] bg-[var(--gd-raised)] border border-[var(--gd-rim)] px-2.5 py-1.5 rounded-lg font-medium break-words"
                      >
                        {item}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-[var(--gd-muted)] italic">No critical gaps recorded.</p>
                )}
              </div>
            </div>

            {/* QUICK ACTIONS: JUMP INTO WEAK AREAS */}
            <div className="pt-2 border-t border-[var(--gd-line)]">
              <div className="text-xs font-bold text-[var(--gd-ink)] mb-2 flex items-center gap-1.5">
                <span>Quick-Action Recommendations:</span>
              </div>
              <div className="flex flex-wrap gap-2">
                <NavLink
                  to="/coding"
                  className="px-3.5 py-1.5 rounded-full bg-[var(--gd-inner)] border border-[var(--gd-rim)] hover:border-[var(--gd-teal)] text-xs text-[var(--gd-ink)] transition-all inline-flex items-center gap-1.5 shadow-sm"
                >
                  <Code2 className="w-3.5 h-3.5 text-[var(--gd-teal)]" />
                  <span>Solve Array & DP Problems</span>
                </NavLink>
                <NavLink
                  to="/aptitude"
                  className="px-3.5 py-1.5 rounded-full bg-[var(--gd-inner)] border border-[var(--gd-rim)] hover:border-[var(--gd-teal)] text-xs text-[var(--gd-ink)] transition-all inline-flex items-center gap-1.5 shadow-sm"
                >
                  <Calculator className="w-3.5 h-3.5 text-[var(--gd-teal)]" />
                  <span>Quant Aptitude Drill (Time & Work)</span>
                </NavLink>
                <NavLink
                  to="/resume"
                  className="px-3.5 py-1.5 rounded-full bg-[var(--gd-inner)] border border-[var(--gd-rim)] hover:border-[var(--gd-coral)] text-xs text-[var(--gd-ink)] transition-all inline-flex items-center gap-1.5 shadow-sm"
                >
                  <FileText className="w-3.5 h-3.5 text-[var(--gd-coral)]" />
                  <span>Optimize Resume ATS Score</span>
                </NavLink>
                <NavLink
                  to="/roadmap"
                  className="px-3.5 py-1.5 rounded-full bg-[var(--gd-inner)] border border-[var(--gd-rim)] hover:border-[var(--gd-ochre)] text-xs text-[var(--gd-ink)] transition-all inline-flex items-center gap-1.5 shadow-sm"
                >
                  <Compass className="w-3.5 h-3.5 text-[var(--gd-ochre)]" />
                  <span>Generate Full AI Roadmap</span>
                </NavLink>
              </div>
            </div>
          </div>

          {/* ACTIVE GOALS & UPCOMING REMINDERS LIST (4 cols) */}
          <div className="lg:col-span-4 rounded-3xl gd-panel p-6 sm:p-7 shadow-2xl flex flex-col justify-between space-y-4 min-w-0">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="p-2 rounded-2xl bg-[var(--gd-inner)] border border-[var(--gd-rim)] text-[var(--gd-coral)] shadow-inner">
                    <Target className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-[var(--gd-ink)] tracking-tight">Active Goals</h3>
                    <p className="text-[11px] text-[var(--gd-muted)]">Upcoming tasks & reminders</p>
                  </div>
                </div>

                <NavLink
                  to="/goals"
                  className="p-1.5 rounded-xl bg-[var(--gd-inner)] hover:bg-[var(--gd-card)] border border-[var(--gd-rim)] text-[var(--gd-ink)] cursor-pointer"
                  title="Add / View All Goals"
                >
                  <Plus className="w-4 h-4" />
                </NavLink>
              </div>

              {/* Goals list */}
              <div className="space-y-2.5">
                {activeGoals.map((goal) => (
                  <div
                    key={goal.id}
                    className={`p-3 rounded-2xl border transition-all flex items-start justify-between gap-3 ${
                      goal.completed
                        ? 'bg-[var(--gd-inner)] border-[var(--gd-line)] opacity-60'
                        : 'bg-[var(--gd-inner)] border-[var(--gd-rim)] hover:border-[var(--gd-edge-light)]'
                    }`}
                  >
                    <div className="flex items-start space-x-2.5 min-w-0">
                      <button
                        type="button"
                        onClick={() => handleToggleGoal(goal.id)}
                        className={`mt-0.5 h-4 w-4 rounded-md border flex items-center justify-center shrink-0 transition-colors cursor-pointer ${
                          goal.completed
                            ? 'bg-[var(--gd-teal)] border-[var(--gd-teal)] text-[var(--gd-pick-ink)]'
                            : 'border-neutral-500 hover:border-[var(--gd-teal)]'
                        }`}
                      >
                        {goal.completed && <CheckCircle2 className="w-3.5 h-3.5 stroke-[3]" />}
                      </button>
                      <div className="min-w-0">
                        <div
                          className={`text-xs font-medium text-[var(--gd-ink)] truncate ${
                            goal.completed ? 'line-through text-[var(--gd-muted)]' : ''
                          }`}
                        >
                          {goal.title}
                        </div>
                        <div className="flex items-center space-x-2 text-[10px] text-[var(--gd-muted)] mt-1">
                          <span className="px-1.5 py-0.5 rounded bg-[var(--gd-card)] font-mono">
                            {goal.category}
                          </span>
                          <span className="flex items-center gap-1 font-mono">
                            <Clock className="w-3 h-3 text-[var(--gd-ochre)]" />
                            {goal.targetDate}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2 border-t border-[var(--gd-line)] text-center">
              <NavLink
                to="/goals"
                className="text-xs font-medium text-[var(--gd-muted)] hover:text-[var(--gd-ink)] inline-flex items-center gap-1"
              >
                Manage all preparation goals <ArrowRight className="w-3 h-3" />
              </NavLink>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
