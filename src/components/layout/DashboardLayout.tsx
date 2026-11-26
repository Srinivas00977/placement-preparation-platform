import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  GraduationCap,
  Calculator,
  Code2,
  Cpu,
  Users,
  FileText,
  Compass,
  Target,
  User,
  LogOut,
  Bot,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Search,
  Bell,
  Sun,
  Moon,
  BookOpen,
} from 'lucide-react';
import { authService, type User as AuthUser } from '@/services/authService';
import { progressService, type UserProgressData } from '@/services/progressService';
import { assessmentService, type DailyAssessmentStatus } from '@/services/assessmentService';
import { courseService, type CourseProgressState } from '@/services/courseService';
import { getUnifiedDailyReminders } from '@/lib/dailyReminders';
import { CommandSearchModal } from '@/components/ui/CommandSearchModal';
import { NotificationsModal } from '@/components/ui/NotificationsModal';

interface NavItem {
  name: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

const NAV_ITEMS: NavItem[] = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Skill Assessment', path: '/assessment', icon: GraduationCap },
  { name: 'Aptitude Prep', path: '/aptitude', icon: Calculator },
  { name: 'Coding Practice', path: '/coding', icon: Code2 },
  { name: 'Technical Prep', path: '/technical', icon: Cpu },
  { name: 'HR Interview Prep', path: '/hr-prep', icon: Users },
  { name: 'Resume Analysis', path: '/resume', icon: FileText, badge: 'ATS' },
  { name: 'AI Roadmap', path: '/roadmap', icon: Compass, badge: 'AI' },
  { name: 'Goals & Reminders', path: '/goals', icon: Target },
  { name: 'Courses & Languages', path: '/courses', icon: BookOpen },
  { name: 'Profile', path: '/profile', icon: User },
];

const PROMPT_SUGGESTIONS = [
  'Ask PlacePilot: Show my skill gaps...',
  'Ask PlacePilot: Practice coding problems...',
  'Ask PlacePilot: Analyze my resume ATS score...',
  'Ask PlacePilot: Generate my AI placement roadmap...',
  'Ask PlacePilot: Revise DBMS & Operating Systems...',
];

interface DashboardLayoutProps {
  children: React.ReactNode;
  pageTitle?: string;
  pageSubtitle?: string;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => authService.getCurrentUser());
  const [progress, setProgress] = useState<UserProgressData>(() => progressService.getUserProgress());
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [commandModalOpen, setCommandModalOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [dailyStatus, setDailyStatus] = useState<DailyAssessmentStatus | null>(null);
  const [courseProgress, setCourseProgress] = useState<CourseProgressState>(() =>
    courseService.getLocalProgress()
  );

  useEffect(() => {
    let isMounted = true;
    assessmentService.getStatus().then((status) => {
      if (isMounted) setDailyStatus(status);
    });
    courseService.fetchRemoteProgress().then((cp) => {
      if (isMounted) setCourseProgress(cp);
    });
    return () => {
      isMounted = false;
    };
  }, [location.pathname]);

  useEffect(() => {
    const unsubCourse = courseService.subscribe(() => {
      setCourseProgress(courseService.getLocalProgress());
    });
    return () => unsubCourse();
  }, []);

  // Theme State: Dark Glass (default) vs Warm Light Glass
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    try {
      const saved = localStorage.getItem('placepilot_theme');
      return (saved === 'light' || saved === 'dark') ? saved : 'dark';
    } catch {
      return 'dark';
    }
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    try {
      localStorage.setItem('placepilot_theme', theme);
    } catch {
      // ignore
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Typewriter prompt index
  const [promptIndex, setPromptIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setPromptIndex((prev) => (prev + 1) % PROMPT_SUGGESTIONS.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  // Collapsible sidebar state persisted in localStorage
  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    try {
      return localStorage.getItem('placepilot_sidebar_collapsed') === 'true';
    } catch {
      return false;
    }
  });

  const toggleSidebar = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('placepilot_sidebar_collapsed', String(next));
      } catch {
        // ignore
      }
      return next;
    });
  };

  useEffect(() => {
    progressService.syncWithServer();
    const unsubscribe = progressService.subscribe(() => {
      setProgress(progressService.getUserProgress());
      setCurrentUser(authService.getCurrentUser());
    });
    return () => unsubscribe();
  }, []);

  // Listen for Global Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommandModalOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleLogout = async () => {
    await authService.logout();
    navigate('/login');
  };

  const readiness = progressService.calculateReadinessWithData(progress);
  const activeGoalsCount = progress.goals.filter((g) => !g.completed).length;
  const dailyReminders = getUnifiedDailyReminders(progress, dailyStatus, courseProgress);
  const unreadNotificationCount = dailyReminders.length + activeGoalsCount;

  return (
    <div className="gd-app" data-theme={theme}>
      {/* 1. DRIFTING ATLAS GLASS ARCHITECTURAL BACKGROUND (z-0) */}
      <img
        src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=2400&q=80"
        alt="Spatial Glassy Architecture Backdrop"
        className="gd-background"
      />

      {/* 2. GRADIENT TINT VIGNETTE (z-[1]) */}
      <div className="gd-bg-tint" />

      {/* Global Command Search Modal */}
      <CommandSearchModal
        isOpen={commandModalOpen}
        onClose={() => setCommandModalOpen(false)}
      />

      {/* Notifications Popover Modal */}
      <NotificationsModal
        isOpen={notificationsOpen}
        onClose={() => setNotificationsOpen(false)}
        goals={progress.goals}
        dailyStatus={dailyStatus}
        dailyReminders={dailyReminders}
        targetRole={progress.profile.targetRole}
      />

      {/* 3. ENTIRE UI LAYER (relative z-10) */}
      <div className="relative z-10 w-full min-h-screen flex flex-col p-2.5 sm:p-4 lg:p-5 selection:bg-white selection:text-black overflow-x-hidden">
        {/* FLOATING PILL TOP HEADER (ATLAS STYLE) */}
        <header className="gd-top sticky top-2 sm:top-3 z-40 w-full max-w-[1720px] mx-auto px-4 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between gap-3 rounded-full shadow-2xl min-w-0">
          {/* Left: PlacePilot Robot Badge & Brand Typography */}
          <div className="flex items-center space-x-3 shrink-0 min-w-0">
            <NavLink to="/dashboard" className="flex items-center space-x-2.5 group">
              <div className="h-9 w-9 rounded-2xl bg-black/25 border border-[var(--gd-rim)] group-hover:border-[var(--gd-teal)] flex items-center justify-center shadow-inner transition-all shrink-0">
                <Bot className="h-4.5 w-4.5 text-[var(--gd-teal)] group-hover:scale-110 transition-transform" />
              </div>
              <div className="hidden sm:block truncate">
                <div className="font-extrabold text-xs sm:text-sm tracking-wider uppercase flex items-center gap-1.5 text-[var(--gd-ink)]">
                  <span>PLACEPILOT AI</span>
                  <span className="h-1.5 w-1.5 rounded-full bg-[var(--gd-teal)]" />
                </div>
                <p className="text-[10px] text-[var(--gd-muted)] font-mono tracking-tight leading-none">
                  Placement Suite
                </p>
              </div>
            </NavLink>
          </div>

          {/* Center: Interactive AI Command Pill with Glowing Animated AI Orb */}
          <motion.button
            type="button"
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setCommandModalOpen(true)}
            className="flex-1 max-w-md mx-2 sm:mx-4 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-[var(--gd-card-light)] hover:bg-[var(--gd-card)] border border-[var(--gd-rim)] text-xs flex items-center justify-between gap-2.5 shadow-inner cursor-pointer transition-all min-w-0 group"
            title="Click or press Ctrl+K to open AI Command Search"
          >
            <div className="flex items-center space-x-2.5 min-w-0">
              {/* Iridescent Animated AI Orb */}
              <div className="gd-orb" />

              {/* Cycling animated prompt */}
              <div className="truncate text-left font-normal text-[var(--gd-ink)] text-[11px] sm:text-xs">
                <AnimatePresence mode="wait">
                  <motion.span
                    key={promptIndex}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    transition={{ duration: 0.25 }}
                    className="block truncate gd-prompt"
                  >
                    {PROMPT_SUGGESTIONS[promptIndex]}
                  </motion.span>
                </AnimatePresence>
              </div>
            </div>

            <div className="flex items-center space-x-1.5 shrink-0 text-[var(--gd-muted)] group-hover:text-[var(--gd-teal)]">
              <Search className="w-3.5 h-3.5" />
              <kbd className="hidden md:inline-flex items-center px-1.5 py-0.5 text-[9px] font-mono text-[var(--gd-muted)] bg-[var(--gd-inner)] border border-[var(--gd-rim)] rounded">
                ⌘K
              </kbd>
            </div>
          </motion.button>

          {/* Right: Target Role Pill, Theme Toggle, Notification Bell & Avatar */}
          <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
            {/* Target Role Pill */}
            <div className="hidden md:flex items-center space-x-1.5 px-3 py-1 rounded-full bg-[var(--gd-inner)] border border-[var(--gd-rim)] text-[11px] font-medium text-[var(--gd-ink)]">
              <span className="text-[var(--gd-muted)]">Target:</span>
              <span className="font-semibold text-[var(--gd-teal)] truncate max-w-[120px]">
                {progress.profile.targetRole || 'Software Engineer'}
              </span>
            </div>

            {/* Placement Readiness Badge */}
            <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-[var(--gd-inner)] border border-[var(--gd-rim)] text-[11px] font-mono font-bold text-[var(--gd-teal)]">
              <TrendingUp className="w-3 h-3" />
              <span>{readiness.overall}%</span>
            </div>

            {/* Theme Toggle (Dark Glass / Warm Light Glass) */}
            <motion.button
              type="button"
              whileTap={{ scale: 0.9 }}
              onClick={toggleTheme}
              className="p-2 rounded-full bg-[var(--gd-inner)] border border-[var(--gd-rim)] text-[var(--gd-ink)] hover:bg-[var(--gd-card)] transition-colors cursor-pointer"
              title={theme === 'dark' ? 'Switch to Warm Light Glass theme' : 'Switch to Dark Glass theme'}
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-[var(--gd-ochre)]" />
              ) : (
                <Moon className="w-4 h-4 text-[var(--gd-coral)]" />
              )}
            </motion.button>

            {/* Notifications Bell with live unread count */}
            <motion.button
              type="button"
              whileTap={{ scale: 0.9 }}
              onClick={() => setNotificationsOpen(true)}
              className="relative p-2 rounded-full bg-[var(--gd-inner)] border border-[var(--gd-rim)] text-[var(--gd-ink)] hover:bg-[var(--gd-card)] transition-colors cursor-pointer"
              title={
                unreadNotificationCount > 0
                  ? `${unreadNotificationCount} daily reminders & goals pending`
                  : 'All daily tasks & goals completed'
              }
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadNotificationCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-[var(--gd-coral)] text-white text-[10px] font-mono font-bold flex items-center justify-center ring-2 ring-[var(--gd-surface)]">
                  {unreadNotificationCount}
                </span>
              )}
            </motion.button>

            {/* User Profile Avatar Link */}
            <NavLink
              to="/profile"
              className="h-8 w-8 rounded-full bg-[var(--gd-inner)] border border-[var(--gd-rim)] flex items-center justify-center font-bold text-xs text-[var(--gd-ink)] hover:border-[var(--gd-teal)] transition-all shrink-0 shadow-inner"
              title={currentUser?.name ? `Profile: ${currentUser.name}` : 'Profile'}
            >
              {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
            </NavLink>

            {/* Mobile Menu Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-full bg-[var(--gd-inner)] border border-[var(--gd-rim)] text-[var(--gd-ink)] cursor-pointer"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </header>

        {/* MOBILE SLIDE-OUT DRAWER */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, x: -280 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -280 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              className="lg:hidden fixed inset-y-0 left-0 z-50 w-72 gd-stage p-5 flex flex-col justify-between shadow-2xl"
            >
              <div className="space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-[var(--gd-line)]">
                  <div className="flex items-center space-x-2.5">
                    <div className="h-9 w-9 rounded-2xl bg-black/25 border border-[var(--gd-rim)] flex items-center justify-center">
                      <Bot className="h-5 w-5 text-[var(--gd-teal)]" />
                    </div>
                    <div>
                      <h2 className="font-bold text-sm text-[var(--gd-ink)]">PlacePilot AI</h2>
                      <p className="text-[10px] text-[var(--gd-muted)]">Spatial Campus Suite</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-1.5 rounded-lg text-[var(--gd-muted)] hover:text-[var(--gd-ink)] cursor-pointer"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {/* Target Role & Readiness Pill */}
                <div className="p-3 rounded-2xl gd-panel space-y-1.5">
                  <div className="text-[10px] uppercase font-bold text-[var(--gd-muted)] tracking-wider">
                    Target Role
                  </div>
                  <div className="text-xs font-semibold text-[var(--gd-ink)] truncate">
                    {progress.profile.targetRole || 'Software Engineer'}
                  </div>
                  <div className="flex items-center justify-between text-[11px] pt-1 border-t border-[var(--gd-line)]">
                    <span className="text-[var(--gd-muted)]">Readiness:</span>
                    <span className="font-mono font-bold text-[var(--gd-teal)]">{readiness.overall}%</span>
                  </div>
                </div>

                {/* Nav links */}
                <nav className="space-y-1 overflow-y-auto max-h-[50vh] pr-1">
                  {NAV_ITEMS.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.path;
                    return (
                      <NavLink
                        key={item.path}
                        to={item.path}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                          isActive
                            ? 'bg-[var(--gd-raised)] text-[var(--gd-pick-ink)] font-semibold shadow-sm'
                            : 'text-[var(--gd-muted)] hover:text-[var(--gd-ink)] hover:bg-[var(--gd-card-light)]'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <Icon className={`h-4 w-4 ${isActive ? 'text-[var(--gd-teal)]' : 'text-[var(--gd-muted)]'}`} />
                          <span className={isActive ? 'font-bold text-[var(--gd-pick-ink)]' : ''}>{item.name}</span>
                        </div>
                        {item.badge && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-[var(--gd-inner)] text-[var(--gd-teal)] font-mono border border-[var(--gd-rim)]">
                            {item.badge}
                          </span>
                        )}
                      </NavLink>
                    );
                  })}
                </nav>
              </div>

              {/* Logout on mobile */}
              <div className="pt-4 border-t border-[var(--gd-line)]">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center space-x-2 py-2.5 rounded-xl text-xs font-medium text-[var(--gd-muted)] hover:text-[var(--gd-ink)] bg-[var(--gd-inner)] border border-[var(--gd-rim)] transition-colors cursor-pointer"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* MAIN SPATIAL WORKSPACE: FLOATING GLASS SIDEBAR + FROSTED GLASS STAGE */}
        <div className="flex-1 flex flex-col lg:flex-row gap-4 sm:gap-5 mt-3 sm:mt-4 max-w-[1720px] w-full mx-auto min-w-0">
          {/* DESKTOP FLOATING GLASS SIDEBAR (COLLAPSIBLE w-64 <=> w-20) */}
          <aside
            className={`gd-glass-rail hidden lg:flex flex-col justify-between shrink-0 sticky top-20 z-30 transition-[width] duration-300 ease-in-out h-[calc(100vh-6.5rem)] rounded-[28px] ${
              isCollapsed ? 'w-20 p-3' : 'w-64 p-4.5'
            }`}
          >
            <div className="space-y-4 flex-1 flex flex-col min-h-0">
              {/* Header: Collapse Toggle Arrow */}
              <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-between px-1'}`}>
                {!isCollapsed ? (
                  <div className="text-[11px] font-mono uppercase tracking-wider text-[var(--gd-muted)] font-semibold">
                    Navigation
                  </div>
                ) : null}

                {/* Sleek Circular Toggle Arrow Button */}
                <motion.button
                  type="button"
                  whileTap={{ scale: 0.9 }}
                  onClick={toggleSidebar}
                  title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                  aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                  className="h-7 w-7 rounded-full bg-[var(--gd-inner)] border border-[var(--gd-rim)] hover:border-[var(--gd-teal)] text-[var(--gd-ink)] flex items-center justify-center transition-all shadow-md cursor-pointer shrink-0"
                >
                  {isCollapsed ? (
                    <ChevronRight className="h-3.5 w-3.5" />
                  ) : (
                    <ChevronLeft className="h-3.5 w-3.5" />
                  )}
                </motion.button>
              </div>

              {/* Sidebar Placement Readiness Widget */}
              {!isCollapsed ? (
                <div className="rounded-2xl border border-[var(--gd-rim)] bg-[var(--gd-card)] p-3 space-y-2 backdrop-blur-md shadow-inner">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-[var(--gd-muted)] font-medium">Readiness Index</span>
                    <span className="font-mono font-bold text-[var(--gd-teal)]">{readiness.overall}%</span>
                  </div>
                  <div className="w-full bg-[var(--gd-track)] h-1.5 rounded-full overflow-hidden">
                    <motion.div
                      className="bg-gradient-to-r from-[var(--gd-teal)] to-emerald-400 h-full rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${readiness.overall}%` }}
                      transition={{ duration: 0.8, ease: 'easeOut' }}
                    />
                  </div>
                  <div className="flex items-center justify-between pt-0.5 text-[10px] text-[var(--gd-muted)] truncate">
                    <span className="truncate text-[var(--gd-ink)] font-medium">{progress.profile.targetRole}</span>
                    <NavLink to="/profile" className="text-[var(--gd-teal)] hover:underline shrink-0">
                      Edit
                    </NavLink>
                  </div>
                </div>
              ) : (
                /* Collapsed Readiness Badge */
                <div className="relative group flex justify-center py-0.5">
                  <div className="h-10 w-10 rounded-2xl bg-[var(--gd-card)] border border-[var(--gd-rim)] flex flex-col items-center justify-center shadow-inner cursor-pointer hover:border-[var(--gd-teal)] transition-colors">
                    <span className="text-[11px] font-mono font-bold text-[var(--gd-teal)] leading-none">
                      {readiness.overall}%
                    </span>
                    <span className="text-[7.5px] text-[var(--gd-muted)] uppercase tracking-tighter">Ready</span>
                  </div>
                  <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-xl gd-stage text-xs text-[var(--gd-ink)] whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-150 z-50 shadow-2xl">
                    <div className="font-semibold">Readiness: {readiness.overall}%</div>
                    <div className="text-[10px] text-[var(--gd-muted)] font-mono">Role: {progress.profile.targetRole}</div>
                  </div>
                </div>
              )}

              {/* Main Navigation List with Smooth Sliding Active Indicator Pill */}
              <nav className="flex-1 space-y-1 overflow-y-auto pr-0.5 no-scrollbar relative">
                {NAV_ITEMS.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;

                  return (
                    <div key={item.path} className="relative group">
                      <motion.div whileTap={{ scale: 0.97 }}>
                        <NavLink
                          to={item.path}
                          className={`relative flex items-center rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                            isCollapsed ? 'justify-center p-2.5' : 'justify-between px-3.5 py-2.5'
                          } ${
                            isActive
                              ? 'text-[var(--gd-pick-ink)] font-semibold'
                              : 'text-[var(--gd-muted)] hover:text-[var(--gd-ink)] hover:bg-[var(--gd-card-light)]'
                          }`}
                        >
                          {/* Smooth Sliding Active Pill Indicator */}
                          {isActive && (
                            <motion.div
                              layoutId="atlasActiveNavPill"
                              className="absolute inset-0 rounded-xl bg-[var(--gd-raised)] shadow-[0_4px_12px_rgb(var(--gd-dark-shadow)/14%),inset_0_1px_1px_var(--gd-edge-light)]"
                              transition={{
                                type: 'spring',
                                stiffness: 400,
                                damping: 32,
                              }}
                            />
                          )}

                          <div className={`flex items-center relative z-10 ${isCollapsed ? 'justify-center' : 'space-x-3'}`}>
                            <Icon
                              className={`h-4 w-4 shrink-0 transition-colors ${
                                isActive ? 'text-[var(--gd-teal)]' : 'text-[var(--gd-muted)] group-hover:text-[var(--gd-ink)]'
                              }`}
                            />
                            {!isCollapsed && (
                              <span className={`tracking-tight truncate ${isActive ? 'font-bold text-[var(--gd-pick-ink)]' : ''}`}>
                                {item.name}
                              </span>
                            )}
                          </div>

                          {!isCollapsed && (
                            <div className="flex items-center space-x-1.5 relative z-10 shrink-0">
                              {item.badge && (
                                <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-[var(--gd-inner)] text-[var(--gd-teal)] font-mono border border-[var(--gd-rim)]">
                                  {item.badge}
                                </span>
                              )}
                              {isActive && <ChevronRight className="h-3 w-3 text-[var(--gd-teal)]" />}
                            </div>
                          )}
                        </NavLink>
                      </motion.div>

                      {/* Collapsed Hover Tooltip */}
                      {isCollapsed && (
                        <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-xl gd-stage text-xs text-[var(--gd-ink)] whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-150 z-50 shadow-2xl flex items-center gap-2">
                          <span className="font-medium">{item.name}</span>
                          {item.badge && (
                            <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-[var(--gd-inner)] text-[var(--gd-teal)] font-mono border border-[var(--gd-rim)]">
                              {item.badge}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </nav>
            </div>

            {/* Desktop Sidebar Bottom Footer: User Info & Logout */}
            <div className={`pt-3 mt-2 border-t border-[var(--gd-line)] ${isCollapsed ? 'flex flex-col items-center gap-2.5' : 'flex items-center justify-between gap-2'}`}>
              {!isCollapsed ? (
                <>
                  <NavLink
                    to="/profile"
                    className="flex items-center space-x-2.5 truncate text-left hover:opacity-80 transition-opacity min-w-0"
                  >
                    <div className="h-8 w-8 rounded-full bg-[var(--gd-inner)] border border-[var(--gd-rim)] flex items-center justify-center font-bold text-xs text-[var(--gd-ink)] shrink-0 shadow-inner">
                      {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <div className="truncate min-w-0">
                      <div className="text-xs font-semibold text-[var(--gd-ink)] truncate">
                        {currentUser?.name || 'Candidate'}
                      </div>
                      <div className="text-[10px] text-[var(--gd-muted)] truncate">
                        {currentUser?.email || ''}
                      </div>
                    </div>
                  </NavLink>

                  <motion.button
                    type="button"
                    whileTap={{ scale: 0.95 }}
                    onClick={handleLogout}
                    title="Sign Out"
                    className="p-2 rounded-xl text-[var(--gd-muted)] hover:text-[var(--gd-ink)] hover:bg-[var(--gd-card-light)] border border-transparent hover:border-[var(--gd-rim)] transition-colors cursor-pointer shrink-0"
                  >
                    <LogOut className="h-4 w-4" />
                  </motion.button>
                </>
              ) : (
                <>
                  <div className="relative group">
                    <NavLink
                      to="/profile"
                      className="h-8 w-8 rounded-full bg-[var(--gd-inner)] border border-[var(--gd-rim)] flex items-center justify-center font-bold text-xs text-[var(--gd-ink)] hover:border-[var(--gd-teal)] transition-colors"
                    >
                      {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
                    </NavLink>
                    <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-xl gd-stage text-xs text-[var(--gd-ink)] whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-150 z-50 shadow-2xl">
                      <div className="font-semibold">{currentUser?.name || 'Candidate'}</div>
                      <div className="text-[10px] text-[var(--gd-muted)]">View Profile</div>
                    </div>
                  </div>

                  <div className="relative group">
                    <motion.button
                      type="button"
                      whileTap={{ scale: 0.95 }}
                      onClick={handleLogout}
                      className="p-2 rounded-xl text-[var(--gd-muted)] hover:text-[var(--gd-coral)] hover:bg-[var(--gd-card-light)] border border-[var(--gd-rim)] transition-colors cursor-pointer"
                    >
                      <LogOut className="h-4 w-4" />
                    </motion.button>
                    <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-xl gd-stage text-xs text-[var(--gd-coral)] whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-150 z-50 shadow-2xl">
                      Sign Out
                    </div>
                  </div>
                </>
              )}
            </div>
          </aside>

          {/* FLOATING FROSTED GLASS STAGE CONTAINER (CONTAINS CHILDREN OF ALL 10 PAGES) */}
          <main className="gd-stage flex-1 min-w-0 overflow-x-hidden p-4 sm:p-6 lg:p-8 relative rounded-[34px] bg-transparent">
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 12, filter: 'blur(8px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                exit={{ opacity: 0, y: -8, filter: 'blur(4px)' }}
                transition={{ duration: 0.28, ease: 'easeOut' }}
                className="w-full min-w-0 bg-transparent"
              >
                {children}
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;
