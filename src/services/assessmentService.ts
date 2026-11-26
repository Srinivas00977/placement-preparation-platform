/**
 * Assessment Service for PlacePilot AI
 * Connects to Flask SQLite API (/api/assessment/*) with seamless offline fallback.
 */

import { authService } from './authService';
import { progressService, type SkillAssessmentResult, type WrongQuestionReviewItem } from './progressService';
import {
  getDailyAssessmentQuestions,
  type AssessmentQuestion,
} from '@/data/assessmentQuestions';

export type { WrongQuestionReviewItem };

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
const ASSESSMENT_HISTORY_KEY = 'placepilot_daily_assessment_history';

export interface DailyAssessmentStatus {
  completedToday: boolean;
  dailyStreak: number;
  lastCompletedDate: string | null;
  totalAssessments: number;
  notificationMessage: string | null;
  requiredQuestions?: number;
  penaltyQuestions?: number;
  missedDays?: number;
  todayAssessment?: any;
}

export interface DailyAssessmentPayload {
  email: string;
  role: string;
  date: string;
  overallScore: number;
  aptitudeScore: number;
  codingScore: number;
  technicalScore: number;
  hrScore: number;
  strengths: string[];
  weaknesses: string[];
  skillGaps: string[];
  wrongQuestions?: WrongQuestionReviewItem[];
}

export interface AssessmentHistoryItem {
  id: string;
  user_email: string;
  assessment_date: string;
  role: string;
  overall_score: number;
  aptitude_score: number;
  coding_score: number;
  technical_score: number;
  hr_score: number;
  strengths_json: string;
  weaknesses_json: string;
  skill_gaps_json: string;
  completed_at: string;
  wrong_questions_json?: string;
}

export const assessmentService = {
  getTodayDateString(): string {
    return new Date().toISOString().split('T')[0];
  },

  /**
   * Fetch daily status (completedToday, streak, notification message)
   */
  async getStatus(): Promise<DailyAssessmentStatus> {
    const user = authService.getCurrentUser();
    const email = user?.email || 'guest@placepilot.ai';
    const todayStr = this.getTodayDateString();

    try {
      const res = await fetch(`${API_BASE_URL}/assessment/status?email=${encodeURIComponent(email)}`, {
        signal: AbortSignal.timeout(2000),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          return {
            completedToday: json.completedToday,
            dailyStreak: json.dailyStreak,
            lastCompletedDate: json.lastCompletedDate,
            totalAssessments: json.totalAssessments,
            notificationMessage: json.notificationMessage,
            requiredQuestions: json.requiredQuestions || 20,
            penaltyQuestions: json.penaltyQuestions || 0,
            missedDays: json.missedDays || 0,
            todayAssessment: json.todayAssessment,
          };
        }
      }
    } catch {
      // Offline fallback
    }

    // Local Fallback Calculation
    const localHistory = this.getLocalHistory();
    const todayItem = localHistory.find((h) => h.assessment_date === todayStr);
    const completedToday = Boolean(todayItem);
    const streak = this.calculateLocalStreak(localHistory, todayStr);
    const lastDate = localHistory[0]?.assessment_date || null;

    let missedDays = 0;
    if (lastDate) {
      try {
        const lastDt = new Date(lastDate);
        const todayDt = new Date(todayStr);
        const diffDays = Math.floor((todayDt.getTime() - lastDt.getTime()) / (1000 * 60 * 60 * 24));
        missedDays = Math.max(0, diffDays - 1);
      } catch {
        missedDays = 0;
      }
    }

    const penaltyQuestions = completedToday ? 0 : Math.min(15, missedDays * 5);
    const requiredQuestions = 20 + penaltyQuestions;
    const notificationMessage = completedToday
      ? null
      : `Daily Assessment Pending — Today's test has ${requiredQuestions} questions (including 3 coding problems). Complete it now to keep your streak!`;

    return {
      completedToday,
      dailyStreak: streak,
      lastCompletedDate: lastDate,
      totalAssessments: localHistory.length,
      notificationMessage,
      requiredQuestions,
      penaltyQuestions,
      missedDays,
      todayAssessment: todayItem || null,
    };
  },

  /**
   * Load today's questions for the selected role
   */
  async getDailyQuestions(role: string): Promise<{
    date: string;
    role: string;
    completedToday: boolean;
    dailyStreak: number;
    history: AssessmentHistoryItem[];
    questions: {
      aptitude: AssessmentQuestion[];
      technical: AssessmentQuestion[];
      coding: AssessmentQuestion[];
      hr: AssessmentQuestion[];
      all: AssessmentQuestion[];
    };
  }> {
    const user = authService.getCurrentUser();
    const email = user?.email || 'guest@placepilot.ai';
    const todayStr = this.getTodayDateString();

    try {
      const res = await fetch(
        `${API_BASE_URL}/assessment/daily?email=${encodeURIComponent(email)}&role=${encodeURIComponent(role)}`,
        { signal: AbortSignal.timeout(2500) }
      );
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.questions) {
          const allQs = [
            ...(json.questions.aptitude || []),
            ...(json.questions.technical || []),
            ...(json.questions.coding || []),
            ...(json.questions.hr || []),
          ];

          return {
            date: json.date || todayStr,
            role: json.role || role,
            completedToday: json.completedToday,
            dailyStreak: json.dailyStreak,
            history: json.history || [],
            questions: {
              aptitude: json.questions.aptitude || [],
              technical: json.questions.technical || [],
              coding: json.questions.coding || [],
              hr: json.questions.hr || [],
              all: allQs,
            },
          };
        }
      }
    } catch {
      // Offline fallback
    }

    // Local Fallback
    const localHistory = this.getLocalHistory();
    const completedToday = localHistory.some((h) => h.assessment_date === todayStr);
    const streak = this.calculateLocalStreak(localHistory, todayStr);
    const lastDate = localHistory[0]?.assessment_date || null;
    let missedDays = 0;
    if (lastDate && !completedToday) {
      try {
        const diffDays = Math.floor((new Date(todayStr).getTime() - new Date(lastDate).getTime()) / (1000 * 60 * 60 * 24));
        missedDays = Math.max(0, diffDays - 1);
      } catch {
        missedDays = 0;
      }
    }
    const reqCount = completedToday ? 20 : 20 + Math.min(15, missedDays * 5);
    const localDaily = getDailyAssessmentQuestions(role, todayStr, reqCount);

    return {
      date: todayStr,
      role,
      completedToday,
      dailyStreak: streak,
      history: localHistory,
      questions: localDaily,
    };
  },

  /**
   * Submit calculated assessment scores
   */
  async submitAssessment(payload: DailyAssessmentPayload): Promise<{
    success: boolean;
    completedToday: boolean;
    dailyStreak: number;
    history: AssessmentHistoryItem[];
  }> {
    const todayStr = payload.date || this.getTodayDateString();

    // 1. Save in progressService (so Dashboard & Roadmap update instantly)
    const assessmentResult: SkillAssessmentResult = {
      scores: {
        aptitude: payload.aptitudeScore,
        coding: payload.codingScore,
        technical: payload.technicalScore,
        hr: payload.hrScore,
        overall: payload.overallScore,
      },
      targetRole: payload.role,
      strengths: payload.strengths,
      weaknesses: payload.weaknesses,
      skillGaps: payload.skillGaps,
      completedAt: new Date().toISOString(),
      wrongQuestions: payload.wrongQuestions || [],
    };
    progressService.saveAssessmentResult(assessmentResult);

    // 2. Also save to local assessment history
    const historyItem: AssessmentHistoryItem = {
      id: `ass_${Date.now()}`,
      user_email: payload.email,
      assessment_date: todayStr,
      role: payload.role,
      overall_score: payload.overallScore,
      aptitude_score: payload.aptitudeScore,
      coding_score: payload.codingScore,
      technical_score: payload.technicalScore,
      hr_score: payload.hrScore,
      strengths_json: JSON.stringify(payload.strengths),
      weaknesses_json: JSON.stringify(payload.weaknesses),
      skill_gaps_json: JSON.stringify(payload.skillGaps),
      completed_at: new Date().toISOString(),
      wrong_questions_json: JSON.stringify(payload.wrongQuestions || []),
    };
    this.saveLocalHistoryItem(historyItem);

    // 3. Post to Flask SQLite Backend
    try {
      const res = await fetch(`${API_BASE_URL}/assessment/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(3000),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          return {
            success: true,
            completedToday: true,
            dailyStreak: json.dailyStreak,
            history: json.history || this.getLocalHistory(),
          };
        }
      }
    } catch {
      // Offline fallback succeeds with local history & streak
    }

    const localHistory = this.getLocalHistory();
    const streak = this.calculateLocalStreak(localHistory, todayStr);

    return {
      success: true,
      completedToday: true,
      dailyStreak: streak,
      history: localHistory,
    };
  },

  getLocalHistory(): AssessmentHistoryItem[] {
    try {
      const raw = localStorage.getItem(ASSESSMENT_HISTORY_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // ignore
    }
    return [];
  },

  saveLocalHistoryItem(item: AssessmentHistoryItem): void {
    const list = this.getLocalHistory().filter((h) => h.assessment_date !== item.assessment_date);
    list.unshift(item);
    localStorage.setItem(ASSESSMENT_HISTORY_KEY, JSON.stringify(list.slice(0, 15)));
  },

  calculateLocalStreak(history: AssessmentHistoryItem[], todayStr: string): number {
    if (!history.length) return 0;
    const dates = new Set(history.map((h) => h.assessment_date));

    let curr = new Date(todayStr);
    let streak = 0;

    // If today is not done, check if yesterday was done
    const currStr = curr.toISOString().split('T')[0];
    if (!dates.has(currStr)) {
      curr.setDate(curr.getDate() - 1);
      const yestStr = curr.toISOString().split('T')[0];
      if (!dates.has(yestStr)) {
        return 0;
      }
    }

    while (true) {
      const dStr = curr.toISOString().split('T')[0];
      if (dates.has(dStr)) {
        streak++;
        curr.setDate(curr.getDate() - 1);
      } else {
        break;
      }
    }

    return streak;
  },
};
