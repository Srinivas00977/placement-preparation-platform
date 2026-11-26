import { authService } from './authService';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
const STORAGE_KEY_PREFIX = 'placepilot_course_progress_v1_';
const COURSE_PROGRESS_EVENT = 'placepilot_course_progress_updated';

export interface CourseProgressState {
  courses: Record<string, number[]>;
  targetDaysByCourse: Record<string, number>;
  activeCourseId?: string;
  lastStudiedDate?: string;
  streakDays: number;
}

function getStorageKey(): string {
  const email = authService.getCurrentUser()?.email || 'guest@placepilot.ai';
  return `${STORAGE_KEY_PREFIX}${email.toLowerCase()}`;
}

function notifyCourseListeners(): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(COURSE_PROGRESS_EVENT));
  }
}

function todayDateStr(): string {
  return new Date().toISOString().split('T')[0];
}

export const courseService = {
  subscribe(callback: () => void): () => void {
    const handler = () => callback();
    window.addEventListener(COURSE_PROGRESS_EVENT, handler);
    window.addEventListener('storage', handler);
    return () => {
      window.removeEventListener(COURSE_PROGRESS_EVENT, handler);
      window.removeEventListener('storage', handler);
    };
  },

  getLocalProgress(): CourseProgressState {
    try {
      const raw = localStorage.getItem(getStorageKey());
      if (raw) {
        const parsed = JSON.parse(raw);
        return {
          courses: parsed.courses && typeof parsed.courses === 'object' ? parsed.courses : {},
          targetDaysByCourse:
            parsed.targetDaysByCourse && typeof parsed.targetDaysByCourse === 'object'
              ? parsed.targetDaysByCourse
              : {},
          activeCourseId:
            typeof parsed.activeCourseId === 'string' ? parsed.activeCourseId : undefined,
          lastStudiedDate:
            typeof parsed.lastStudiedDate === 'string' ? parsed.lastStudiedDate : undefined,
          streakDays: typeof parsed.streakDays === 'number' ? parsed.streakDays : 0,
        };
      }
    } catch {
      // ignore storage errors
    }
    return { courses: {}, targetDaysByCourse: {}, streakDays: 0 };
  },

  saveLocalProgress(state: CourseProgressState) {
    try {
      localStorage.setItem(getStorageKey(), JSON.stringify(state));
      notifyCourseListeners();
    } catch {
      // ignore quota errors
    }
  },

  async fetchRemoteProgress(): Promise<CourseProgressState> {
    const email = authService.getCurrentUser()?.email || 'guest@placepilot.ai';
    const local = this.getLocalProgress();
    try {
      const res = await fetch(`${API_BASE_URL}/courses/progress?email=${encodeURIComponent(email)}`, {
        signal: AbortSignal.timeout(2500),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.courses) {
          const state: CourseProgressState = {
            courses: json.courses,
            targetDaysByCourse: {
              ...local.targetDaysByCourse,
              ...(json.targetDaysByCourse || {}),
            },
            activeCourseId: local.activeCourseId,
            lastStudiedDate:
              json.lastUpdatedAt && String(json.lastUpdatedAt).startsWith(todayDateStr())
                ? todayDateStr()
                : local.lastStudiedDate,
            streakDays: json.streakDays ?? local.streakDays ?? 0,
          };
          this.saveLocalProgress(state);
          return state;
        }
      }
    } catch {
      // fallback to local
    }
    return local;
  },

  async setActiveCourse(courseId: string): Promise<CourseProgressState> {
    const cur = this.getLocalProgress();
    const nextState: CourseProgressState = {
      ...cur,
      activeCourseId: courseId,
    };
    this.saveLocalProgress(nextState);
    return nextState;
  },

  async setTargetDays(courseId: string, targetDays: number): Promise<CourseProgressState> {
    const clamped = Math.max(7, Math.min(90, Math.round(targetDays)));
    const cur = this.getLocalProgress();
    const existingCompleted = (cur.courses[courseId] || []).filter((d) => d <= clamped);
    const nextState: CourseProgressState = {
      ...cur,
      activeCourseId: courseId,
      courses: { ...cur.courses, [courseId]: existingCompleted },
      targetDaysByCourse: { ...cur.targetDaysByCourse, [courseId]: clamped },
    };
    this.saveLocalProgress(nextState);

    const email = authService.getCurrentUser()?.email || 'guest@placepilot.ai';
    try {
      await fetch(`${API_BASE_URL}/courses/progress`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          courseId,
          completedDays: existingCompleted,
          targetDays: clamped,
          streakDays: nextState.streakDays || 1,
        }),
        signal: AbortSignal.timeout(2500),
      });
    } catch {
      // offline persistence preserved in localStorage
    }
    return nextState;
  },

  async toggleDay(courseId: string, dayNumber: number): Promise<CourseProgressState> {
    const cur = this.getLocalProgress();
    const existing = new Set<number>(cur.courses[courseId] || []);
    const wasDone = existing.has(dayNumber);
    if (wasDone) {
      existing.delete(dayNumber);
    } else {
      existing.add(dayNumber);
    }
    const updatedDays = Array.from(existing).sort((a, b) => a - b);
    const nextState: CourseProgressState = {
      ...cur,
      activeCourseId: courseId,
      courses: { ...cur.courses, [courseId]: updatedDays },
      lastStudiedDate: !wasDone ? todayDateStr() : cur.lastStudiedDate,
      streakDays: Math.max(cur.streakDays, updatedDays.length > 0 ? 1 : cur.streakDays),
    };
    this.saveLocalProgress(nextState);

    const email = authService.getCurrentUser()?.email || 'guest@placepilot.ai';
    try {
      await fetch(`${API_BASE_URL}/courses/progress`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          courseId,
          completedDays: updatedDays,
          targetDays: nextState.targetDaysByCourse[courseId],
          streakDays: nextState.streakDays || 1,
        }),
        signal: AbortSignal.timeout(2500),
      });
    } catch {
      // offline persistence preserved in localStorage
    }
    return nextState;
  },

  async resetCourse(courseId: string): Promise<CourseProgressState> {
    const cur = this.getLocalProgress();
    const nextState: CourseProgressState = {
      ...cur,
      activeCourseId: courseId,
      courses: { ...cur.courses, [courseId]: [] },
    };
    this.saveLocalProgress(nextState);

    const email = authService.getCurrentUser()?.email || 'guest@placepilot.ai';
    try {
      await fetch(`${API_BASE_URL}/courses/progress`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          courseId,
          completedDays: [],
          targetDays: nextState.targetDaysByCourse[courseId],
          streakDays: nextState.streakDays || 1,
        }),
        signal: AbortSignal.timeout(2500),
      });
    } catch {
      // ignore
    }
    return nextState;
  },
};
