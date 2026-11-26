import { authService } from './authService';

export interface CategoryBreakdown {
  aptitude: number;
  coding: number;
  technical: number;
  hr: number;
  resume: number;
}

export interface WrongQuestionReviewItem {
  id: string;
  category: 'Aptitude' | 'Technical' | 'Coding' | 'HR';
  topic: string;
  question: string;
  userAnswer: string;
  correctAnswer: string;
  explanation: string;
}

export interface SkillAssessmentResult {
  scores: {
    aptitude: number;
    coding: number;
    technical: number;
    hr: number;
    overall: number;
  };
  targetRole: string;
  strengths: string[];
  weaknesses: string[];
  skillGaps: string[];
  completedAt: string;
  wrongQuestions?: WrongQuestionReviewItem[];
}

export interface AptitudeAttempt {
  id: string;
  topicId: string;
  topicTitle: string;
  category: 'Quantitative' | 'Logical' | 'Verbal' | 'Data Interpretation';
  score: number;
  total: number;
  percentage: number;
  date: string;
}

export interface CodingSubmission {
  problemId: string;
  problemTitle: string;
  language: string;
  code: string;
  status: 'Passed' | 'Failed';
  passedTests: number;
  totalTests: number;
  date: string;
}

export interface HrAnswerRecord {
  questionId: string;
  question: string;
  userAnswer: string;
  score: number;
  feedback: {
    clarity: string;
    starMethod: string;
    keyPoints: string[];
    tips: string[];
  };
  date: string;
}

export interface ResumeAnalysisRecord {
  targetRole: string;
  atsScore: number;
  matchedKeywords: string[];
  missingKeywords: string[];
  suggestions: string[];
  fileName?: string;
  analyzedAt: string;
}

export interface GoalItem {
  id: string;
  title: string;
  category: 'Aptitude' | 'Coding' | 'Technical' | 'HR' | 'Resume' | 'General';
  targetDate: string;
  reminderNote?: string;
  completed: boolean;
  createdAt: string;
}

export interface RoadmapResource {
  name: string;
  type: 'youtube' | 'practice' | 'doc';
  url: string;
}

export interface RoadmapStep {
  id: string;
  phase: string;
  title: string;
  description: string;
  duration: string;
  status: 'pending' | 'in_progress' | 'completed';
  category: string;
  resources: RoadmapResource[];
}

export interface UserProfileData {
  targetRole: string;
  dailyGoalHours: number;
  preparationStage: 'Beginner' | 'Intermediate' | 'Placement Ready';
  preferredDifficulty: 'Easy' | 'Medium' | 'Hard';
  targetCompanyType: string;
  targetCompanies: string[];
}

export interface UserProgressData {
  profile: UserProfileData;
  assessment: SkillAssessmentResult | null;
  aptitudeAttempts: AptitudeAttempt[];
  solvedCodingProblemIds: string[];
  codingSubmissions: CodingSubmission[];
  completedTechnicalTopicIds: string[];
  hrAnswers: HrAnswerRecord[];
  latestResumeAnalysis: ResumeAnalysisRecord | null;
  goals: GoalItem[];
  roadmap: RoadmapStep[] | null;
  overallReadiness: number;
}

const STORAGE_PREFIX = 'placepilot_user_data_';
const PROGRESS_UPDATE_EVENT = 'placepilot_progress_updated';

function getStorageKey(): string {
  const user = authService.getCurrentUser();
  return user ? `${STORAGE_PREFIX}${user.id}` : `${STORAGE_PREFIX}guest`;
}

const DEFAULT_PROFILE: UserProfileData = {
  targetRole: 'Software Engineer',
  dailyGoalHours: 3,
  preparationStage: 'Intermediate',
  preferredDifficulty: 'Medium',
  targetCompanyType: 'Top Product Companies & MNCs',
  targetCompanies: ['TCS', 'Amazon', 'Google'],
};

const DEFAULT_GOALS: GoalItem[] = [
  {
    id: 'g_default_1',
    title: 'Complete First Diagnostic Skill Assessment',
    category: 'General',
    targetDate: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
    reminderNote: 'Identify current baseline and gaps before campus drive starts.',
    completed: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'g_default_2',
    title: 'Solve 5 Dynamic Programming Placement Problems',
    category: 'Coding',
    targetDate: new Date(Date.now() + 86400000 * 4).toISOString().split('T')[0],
    reminderNote: 'Focus on 0/1 Knapsack, Coin Change, and Climbing Stairs.',
    completed: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'g_default_3',
    title: 'Revise Operating Systems: Deadlocks & Virtual Memory',
    category: 'Technical',
    targetDate: new Date(Date.now() + 86400000 * 6).toISOString().split('T')[0],
    reminderNote: 'Review page fault handling, Banker algorithm, and semaphores.',
    completed: false,
    createdAt: new Date().toISOString(),
  },
];

export const progressService = {
  subscribe(callback: () => void): () => void {
    const handler = () => callback();
    window.addEventListener(PROGRESS_UPDATE_EVENT, handler);
    window.addEventListener('storage', handler);
    return () => {
      window.removeEventListener(PROGRESS_UPDATE_EVENT, handler);
      window.removeEventListener('storage', handler);
    };
  },

  notifyListeners(): void {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event(PROGRESS_UPDATE_EVENT));
    }
  },

  getUserProgress(): UserProgressData {
    try {
      const raw = localStorage.getItem(getStorageKey());
      if (raw) {
        const data: UserProgressData = JSON.parse(raw);
        // Ensure default structure integrity
        if (!data.profile) data.profile = { ...DEFAULT_PROFILE };
        if (!Array.isArray(data.profile.targetCompanies)) data.profile.targetCompanies = ['TCS', 'Amazon', 'Google'];
        if (!Array.isArray(data.aptitudeAttempts)) data.aptitudeAttempts = [];
        if (!Array.isArray(data.solvedCodingProblemIds)) data.solvedCodingProblemIds = [];
        if (!Array.isArray(data.codingSubmissions)) data.codingSubmissions = [];
        if (!Array.isArray(data.completedTechnicalTopicIds)) data.completedTechnicalTopicIds = [];
        if (!Array.isArray(data.hrAnswers)) data.hrAnswers = [];
        if (!Array.isArray(data.goals)) data.goals = DEFAULT_GOALS;
        return data;
      }
    } catch (e) {
      console.error('Failed to parse user progress:', e);
    }

    const defaultData: UserProgressData = {
      profile: { ...DEFAULT_PROFILE },
      assessment: null,
      aptitudeAttempts: [],
      solvedCodingProblemIds: [],
      codingSubmissions: [],
      completedTechnicalTopicIds: [],
      hrAnswers: [],
      latestResumeAnalysis: null,
      goals: DEFAULT_GOALS,
      roadmap: null,
      overallReadiness: 0,
    };
    return defaultData;
  },

  saveUserProgress(data: UserProgressData): void {
    try {
      // Recalculate readiness
      data.overallReadiness = this.calculateReadinessWithData(data).overall;
      localStorage.setItem(getStorageKey(), JSON.stringify(data));
      this.notifyListeners();

      // Asynchronous background sync to Flask server
      const user = authService.getCurrentUser();
      const token = authService.getSessionToken();
      if (user && token) {
        const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
        fetch(`${apiBase}/user/state`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ state: data, email: user.email }),
        }).catch(() => {
          // Silent fallback when backend is offline
        });
      }
    } catch (e) {
      console.error('Failed to save user progress:', e);
    }
  },

  /**
   * Sync saved progress from server on mount
   */
  async syncWithServer(): Promise<void> {
    const user = authService.getCurrentUser();
    const token = authService.getSessionToken();
    if (!user || !token) return;

    const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
    try {
      const res = await fetch(`${apiBase}/user/state?email=${encodeURIComponent(user.email)}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.state) {
          localStorage.setItem(getStorageKey(), JSON.stringify(json.state));
          this.notifyListeners();
        }
      }
    } catch {
      // Silent fallback
    }
  },

  saveAssessmentResult(result: SkillAssessmentResult): void {
    const data = this.getUserProgress();
    data.assessment = result;
    if (result.targetRole) {
      data.profile.targetRole = result.targetRole;
    }
    // Also mark assessment goal as complete if present
    data.goals = data.goals.map((g) =>
      g.title.toLowerCase().includes('skill assessment') ? { ...g, completed: true } : g
    );
    this.saveUserProgress(data);
  },

  recordAptitudeAttempt(attempt: Omit<AptitudeAttempt, 'id' | 'date'>): void {
    const data = this.getUserProgress();
    const newAttempt: AptitudeAttempt = {
      ...attempt,
      id: 'apt_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      date: new Date().toISOString(),
    };
    data.aptitudeAttempts.unshift(newAttempt);
    this.saveUserProgress(data);
  },

  recordCodingSubmission(submission: CodingSubmission): void {
    const data = this.getUserProgress();
    data.codingSubmissions.unshift(submission);
    if (submission.status === 'Passed' && !data.solvedCodingProblemIds.includes(submission.problemId)) {
      data.solvedCodingProblemIds.push(submission.problemId);
    }
    this.saveUserProgress(data);
  },

  toggleTechnicalTopicCompleted(topicId: string): boolean {
    const data = this.getUserProgress();
    const exists = data.completedTechnicalTopicIds.includes(topicId);
    if (exists) {
      data.completedTechnicalTopicIds = data.completedTechnicalTopicIds.filter((id) => id !== topicId);
    } else {
      data.completedTechnicalTopicIds.push(topicId);
    }
    this.saveUserProgress(data);
    return !exists;
  },

  saveHrAnswer(record: HrAnswerRecord): void {
    const data = this.getUserProgress();
    const index = data.hrAnswers.findIndex((a) => a.questionId === record.questionId);
    if (index >= 0) {
      data.hrAnswers[index] = record;
    } else {
      data.hrAnswers.unshift(record);
    }
    this.saveUserProgress(data);
  },

  saveResumeAnalysis(analysis: ResumeAnalysisRecord): void {
    const data = this.getUserProgress();
    data.latestResumeAnalysis = analysis;
    this.saveUserProgress(data);
  },

  getGoals(): GoalItem[] {
    return this.getUserProgress().goals;
  },

  addGoal(goal: Omit<GoalItem, 'id' | 'createdAt' | 'completed'>): GoalItem {
    const data = this.getUserProgress();
    const newGoal: GoalItem = {
      ...goal,
      id: 'goal_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      completed: false,
      createdAt: new Date().toISOString(),
    };
    data.goals.unshift(newGoal);
    this.saveUserProgress(data);
    return newGoal;
  },

  updateGoal(id: string, updates: Partial<GoalItem>): void {
    const data = this.getUserProgress();
    data.goals = data.goals.map((g) => (g.id === id ? { ...g, ...updates } : g));
    this.saveUserProgress(data);
  },

  toggleGoalCompleted(id: string): void {
    const data = this.getUserProgress();
    data.goals = data.goals.map((g) => (g.id === id ? { ...g, ...completed(g) } : g));
    this.saveUserProgress(data);

    function completed(item: GoalItem) {
      return { completed: !item.completed };
    }
  },

  deleteGoal(id: string): void {
    const data = this.getUserProgress();
    data.goals = data.goals.filter((g) => g.id !== id);
    this.saveUserProgress(data);
  },

  saveRoadmap(steps: RoadmapStep[]): void {
    const data = this.getUserProgress();
    data.roadmap = steps;
    this.saveUserProgress(data);
  },

  toggleRoadmapStepStatus(stepId: string): void {
    const data = this.getUserProgress();
    if (!data.roadmap) return;
    data.roadmap = data.roadmap.map((step) => {
      if (step.id === stepId) {
        const nextStatus =
          step.status === 'completed'
            ? 'in_progress'
            : step.status === 'in_progress'
            ? 'completed'
            : 'in_progress';
        return { ...step, status: nextStatus };
      }
      return step;
    });
    this.saveUserProgress(data);
  },

  updateProfile(profile: Partial<UserProfileData>): void {
    const data = this.getUserProgress();
    data.profile = { ...data.profile, ...profile };
    this.saveUserProgress(data);
  },

  calculateReadinessWithData(data: UserProgressData): {
    overall: number;
    categories: CategoryBreakdown;
    completedActivities: number;
    strengths: string[];
    weaknesses: string[];
    skillGaps: string[];
  } {
    // 1. Aptitude Score (0 - 100)
    let aptitudeScore = 0;
    if (data.assessment) {
      aptitudeScore = data.assessment.scores.aptitude;
    }
    if (data.aptitudeAttempts.length > 0) {
      const avgAptitude =
        data.aptitudeAttempts.reduce((acc, curr) => acc + curr.percentage, 0) /
        data.aptitudeAttempts.length;
      aptitudeScore = data.assessment ? Math.round((aptitudeScore * 0.5) + (avgAptitude * 0.5)) : Math.round(avgAptitude);
    }

    // 2. Coding Score (0 - 100)
    let codingScore = 0;
    if (data.assessment) {
      codingScore = data.assessment.scores.coding;
    }
    // Baseline + solved problems credit (10 problems = 100%)
    const codingProblemCredit = Math.min(100, Math.round((data.solvedCodingProblemIds.length / 10) * 100));
    if (data.solvedCodingProblemIds.length > 0) {
      codingScore = data.assessment
        ? Math.round((codingScore * 0.4) + (codingProblemCredit * 0.6))
        : codingProblemCredit;
    }

    // 3. Technical Score (0 - 100)
    let technicalScore = 0;
    if (data.assessment) {
      technicalScore = data.assessment.scores.technical;
    }
    // 5 core technical topics = 100%
    const techTopicCredit = Math.min(100, Math.round((data.completedTechnicalTopicIds.length / 5) * 100));
    if (data.completedTechnicalTopicIds.length > 0) {
      technicalScore = data.assessment
        ? Math.round((technicalScore * 0.4) + (techTopicCredit * 0.6))
        : techTopicCredit;
    }

    // 4. HR Interview Score (0 - 100)
    let hrScore = 0;
    if (data.assessment) {
      hrScore = data.assessment.scores.hr;
    }
    if (data.hrAnswers.length > 0) {
      const avgHr =
        data.hrAnswers.reduce((acc, curr) => acc + curr.score, 0) / data.hrAnswers.length;
      hrScore = data.assessment ? Math.round((hrScore * 0.4) + (avgHr * 0.6)) : Math.round(avgHr);
    }

    // 5. Resume ATS Score (0 - 100)
    const resumeScore = data.latestResumeAnalysis ? data.latestResumeAnalysis.atsScore : 0;

    // Overall Weighted Calculation
    // Aptitude (20%), Coding (30%), Technical (25%), HR (15%), Resume (10%)
    let overall = Math.round(
      aptitudeScore * 0.2 +
      codingScore * 0.3 +
      technicalScore * 0.25 +
      hrScore * 0.15 +
      resumeScore * 0.1
    );

    // If no activities at all yet, show 0
    if (
      !data.assessment &&
      data.aptitudeAttempts.length === 0 &&
      data.solvedCodingProblemIds.length === 0 &&
      data.completedTechnicalTopicIds.length === 0 &&
      data.hrAnswers.length === 0 &&
      !data.latestResumeAnalysis
    ) {
      overall = 0;
    }

    // Total Completed Activities Counter
    const completedActivities =
      (data.assessment ? 1 : 0) +
      data.aptitudeAttempts.length +
      data.solvedCodingProblemIds.length +
      data.completedTechnicalTopicIds.length +
      data.hrAnswers.length +
      (data.latestResumeAnalysis ? 1 : 0);

    // Strengths, Weaknesses, Skill Gaps
    let strengths: string[] = [];
    let weaknesses: string[] = [];
    let skillGaps: string[] = [];

    if (data.assessment) {
      strengths = [...data.assessment.strengths];
      weaknesses = [...data.assessment.weaknesses];
      skillGaps = [...data.assessment.skillGaps];
    } else {
      // Default initial states based on activities
      if (codingScore >= 70) strengths.push('Data Structures & Algorithms');
      else weaknesses.push('Data Structures & Algorithms');

      if (aptitudeScore >= 70) strengths.push('Quantitative Problem Solving');
      else weaknesses.push('Aptitude & Speed Math');

      if (technicalScore >= 70) strengths.push('Core Computer Science Concepts');
      else weaknesses.push('System Fundamentals & DBMS');

      if (resumeScore < 60) skillGaps.push('Resume ATS Keyword Optimization');
      if (codingScore < 50) skillGaps.push('Dynamic Programming & Graph Problems');
      if (technicalScore < 50) skillGaps.push('Operating Systems & Computer Networks');
    }

    return {
      overall: Math.min(100, Math.max(0, overall)),
      categories: {
        aptitude: Math.min(100, Math.max(0, aptitudeScore)),
        coding: Math.min(100, Math.max(0, codingScore)),
        technical: Math.min(100, Math.max(0, technicalScore)),
        hr: Math.min(100, Math.max(0, hrScore)),
        resume: Math.min(100, Math.max(0, resumeScore)),
      },
      completedActivities,
      strengths,
      weaknesses,
      skillGaps,
    };
  },

  calculateReadiness() {
    return this.calculateReadinessWithData(this.getUserProgress());
  },

  resetAllData(): void {
    try {
      localStorage.removeItem(getStorageKey());
      this.notifyListeners();
    } catch (e) {
      console.error('Failed to reset data:', e);
    }
  },
};
