import { resolveCareerTrack } from '@/data/technicalCurriculum/careers';
import { type CareerQuizQuestion } from '@/data/technicalCurriculum/types';
import { authService } from './authService';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export interface SubtopicDetailResponse {
  source: 'sqlite' | 'gemini' | 'local';
  detail: {
    simpleExplanation: string;
    whyRecruitersAsk: string;
    conceptChecklist: string[];
    codeExample: string;
    quickPracticeQuestion: {
      question: string;
      options: string[];
      correctIndex: number;
      explanation: string;
    };
    completionCriteria: string;
  };
}

export interface GenerateTechnicalQuizRequest {
  career: string;
  company?: string;
  topic?: string;
  difficulty?: 'Easy' | 'Medium' | 'Hard';
  count?: number;
  forceFreshAI?: boolean;
  excludeIds?: string[];
}

export interface GenerateTechnicalQuizResponse {
  questions: CareerQuizQuestion[];
  source: 'sqlite' | 'gemini' | 'procedural' | 'local';
}

export const technicalService = {
  async generateCareerQuiz(
    req: GenerateTechnicalQuizRequest
  ): Promise<GenerateTechnicalQuizResponse> {
    const count = Math.max(15, Math.min(50, req.count || 20));

    // 1. Try Flask SQLite + Gemini Backend Endpoint
    try {
      const res = await fetch(`${API_BASE_URL}/technical/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...req, count }),
        signal: AbortSignal.timeout(req.forceFreshAI ? 9000 : 3000),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.questions) && json.questions.length > 0) {
          return {
            questions: json.questions,
            source: json.source || 'sqlite',
          };
        }
      }
    } catch {
      // Backend offline; continue strictly within the selected career's offline bank
    }

    // 2. Direct Gemini fallback if online & VITE_GEMINI_API_KEY configured
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (
      req.forceFreshAI &&
      apiKey &&
      apiKey.trim().length > 10 &&
      !apiKey.includes('your_gemini_api_key')
    ) {
      try {
        const companyClause =
          req.company && req.company !== 'All Companies'
            ? ` tailored for target company "${req.company}" hiring pattern`
            : '';
        const prompt = `Generate ${Math.min(20, count)} technical interview MCQ questions STRICTLY scoped to the career "${req.career}"${companyClause} (Topic: ${req.topic || 'Core Concepts'}, Difficulty: ${req.difficulty || 'Medium'}). Do NOT mix unrelated roles. Return ONLY raw JSON array of { "topic", "question", "options", "correctAnswer", "explanation" }.`;
        const gemRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
              generationConfig: { temperature: 0.35, maxOutputTokens: 3500 },
            }),
            signal: AbortSignal.timeout(9000),
          }
        );
        if (gemRes.ok) {
          const payload = await gemRes.json();
          const rawText = payload?.candidates?.[0]?.content?.parts?.[0]?.text || '';
          const cleaned = rawText.replace(/```json/gi, '').replace(/```/g, '').trim();
          const parsed = JSON.parse(cleaned);
          if (Array.isArray(parsed)) {
            const formatted: CareerQuizQuestion[] = parsed
              .filter(
                (q) =>
                  q?.question &&
                  Array.isArray(q?.options) &&
                  q.options.length === 4 &&
                  typeof q.correctAnswer === 'number'
              )
              .map((q, idx) => ({
                id: `tech_gem_${Date.now()}_${idx}`,
                career: req.career,
                topic: q.topic || req.topic || 'Core',
                difficulty: req.difficulty || 'Medium',
                question: q.question,
                options: q.options.map(String),
                correctAnswer: q.correctAnswer,
                explanation: q.explanation || 'Review official technical documentation.',
                source: 'gemini',
              }));
            if (formatted.length >= count) {
              return { questions: formatted.slice(0, count), source: 'gemini' };
            }
          }
        }
      } catch {
        // fall back cleanly to career track bank
      }
    }

    // 3. Offline Role-Strict Fallback (ONLY from selected career's bank + Q&A variants)
    const track = resolveCareerTrack(req.career);
    const seedPool = [...track.quizBank].sort(() => Math.random() - 0.5);
    const assembled: CareerQuizQuestion[] = [];
    for (let i = 0; i < count; i++) {
      const base = seedPool[i % seedPool.length];
      assembled.push(
        i < seedPool.length
          ? base
          : {
              ...base,
              id: `${base.id}_v${i}_${Date.now()}`,
              question: `[${track.name} Practice Set #${Math.floor(i / seedPool.length) + 1} — ${base.topic}] ${base.question}`,
              source: 'local',
            }
      );
    }

    return {
      questions: assembled,
      source: 'local',
    };
  },

  async syncProgressToggle(career: string, subtopicId: string): Promise<void> {
    const user = authService.getCurrentUser();
    const email = user?.email || 'guest@placepilot.ai';
    try {
      await fetch(`${API_BASE_URL}/technical/progress/toggle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, career, subtopicId }),
        signal: AbortSignal.timeout(2500),
      });
    } catch {
      // localStorage already updated via progressService
    }
  },

  async fetchSubtopicDetail(params: {
    career: string;
    topic: string;
    subtopic: string;
    level: string;
    localFallback?: Record<string, unknown>;
  }): Promise<SubtopicDetailResponse> {
    try {
      const res = await fetch(`${API_BASE_URL}/technical/subtopic-detail`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
        signal: AbortSignal.timeout(4500),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.detail) {
          return {
            source: json.source || 'sqlite',
            detail: json.detail,
          };
        }
      }
    } catch {
      // Fall back cleanly to local structured payload
    }

    const fb = params.localFallback || {};
    return {
      source: 'local',
      detail: {
        simpleExplanation:
          (fb.simpleExplanation as string) ||
          `${params.subtopic} is a key ${params.level} placement concept in ${params.topic} for ${params.career}.`,
        whyRecruitersAsk:
          (fb.whyImportant as string) ||
          `Evaluates real-world engineering understanding and complexity trade-offs in ${params.subtopic}.`,
        conceptChecklist: Array.isArray(fb.whatToLearn)
          ? (fb.whatToLearn as string[])
          : [`Core syntax and mental model of ${params.subtopic}`, `Edge cases & failure modes`],
        codeExample: (fb.codeExample as string) || '',
        quickPracticeQuestion: (fb.quickCheck as SubtopicDetailResponse['detail']['quickPracticeQuestion']) || {
          question: `Which practice demonstrates strong placement readiness on "${params.subtopic}"?`,
          options: [
            `Explaining core intuition, constraints/trade-offs, and handling boundary edge cases clearly`,
            `Skipping validation and ignoring time/memory bottlenecks`,
            `Copying boilerplate without understanding invariants`,
            `Hardcoding magic constants for single test inputs`,
          ],
          correctIndex: 0,
          explanation: `Interviewers test whether you understand both core mechanics and real edge-case constraints of ${params.subtopic}.`,
        },
        completionCriteria:
          (fb.completionCriteria as string) ||
          `Practice and verify ${params.subtopic} using the curated study resources below.`,
      },
    };
  },
};
