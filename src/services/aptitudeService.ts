import aptitudeBankRaw from '@/data/aptitudeBank.json';
import {
  APTITUDE_SYLLABUS,
  type AptitudeCategory,
  type AptitudeQuestion,
} from '@/data/aptitudeSyllabus';

export interface GenerateAptitudeRequest {
  topicId: string;
  topic: string;
  category: AptitudeCategory;
  difficulty?: 'Easy' | 'Medium' | 'Hard';
  company?: string;
  count?: number;
  forceFreshAI?: boolean;
  excludeIds?: string[];
}

export interface GenerateAptitudeResponse {
  questions: AptitudeQuestion[];
  source: 'sqlite' | 'gemini' | 'procedural' | 'local';
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
const LOCAL_AI_CACHE_KEY = 'placepilot_aptitude_ai_cache_v1';

const BANK_QUESTIONS: AptitudeQuestion[] = aptitudeBankRaw as AptitudeQuestion[];

function getLocalCachedQuestions(topicId: string): AptitudeQuestion[] {
  try {
    const raw = localStorage.getItem(LOCAL_AI_CACHE_KEY);
    if (!raw) return [];
    const parsed: AptitudeQuestion[] = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((q) => q.topicId === topicId) : [];
  } catch {
    return [];
  }
}

function saveLocalCachedQuestions(questions: AptitudeQuestion[]): void {
  try {
    const raw = localStorage.getItem(LOCAL_AI_CACHE_KEY);
    const existing: AptitudeQuestion[] = raw ? JSON.parse(raw) : [];
    const seen = new Set(existing.map((q) => q.id));
    const merged = [...questions.filter((q) => !seen.has(q.id)), ...existing].slice(0, 300);
    localStorage.setItem(LOCAL_AI_CACHE_KEY, JSON.stringify(merged));
  } catch {
    // ignore storage quota errors
  }
}

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function makeNumericOptions(ansVal: number, suffix = ''): { options: string[]; correctAnswer: number } {
  const deltas = [2, 4, -2, 5, -3, 8];
  const vals = new Set<number>([ansVal]);
  for (const d of deltas) {
    if (vals.size >= 4) break;
    const candidate = Math.max(1, Number((ansVal + d).toFixed(2)));
    vals.add(candidate);
  }
  let extra = 10;
  while (vals.size < 4) {
    vals.add(ansVal + extra);
    extra += 3;
  }
  const items = shuffle(Array.from(vals)).map((v) => ({
    isAns: v === ansVal,
    label: `${v}${suffix}`,
  }));
  return {
    options: items.map((i) => i.label),
    correctAnswer: items.findIndex((i) => i.isAns),
  };
}

function generateLocalParameterizedSet(req: GenerateAptitudeRequest): AptitudeQuestion[] {
  const pick = <T,>(items: T[]): T => items[Math.floor(Math.random() * items.length)];
  const comp = req.company && req.company !== 'Any Company' ? req.company : 'TCS';
  const difficulty = req.difficulty || 'Medium';
  const out: AptitudeQuestion[] = [];

  if (req.topicId === 'quant-percentage') {
    const r = pick([10, 20, 25, 50, 60]);
    const ans = Number(((r / (100 + r)) * 100).toFixed(2));
    const { options, correctAnswer } = makeNumericOptions(ans, '%');
    out.push({
      id: `apt_loc_pct_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      topicId: req.topicId,
      topic: req.topic,
      category: req.category,
      difficulty,
      company: comp,
      question: `If the price of an item increases by ${r}%, by what percent must consumption decrease to keep total spending constant?`,
      options,
      correctAnswer,
      shortcutFormula: 'Reduction % = [r / (100 + r)] × 100',
      explanation: `Reduction = (${r} / ${100 + r}) × 100 = ${ans}%.`,
      source: 'procedural',
    });
  } else if (req.topicId === 'quant-profit-loss') {
    const m = pick([20, 30, 40, 50]);
    const d = pick([10, 15, 20, 25]);
    const ans = Number((m - d - (m * d) / 100).toFixed(2));
    const { options, correctAnswer } = makeNumericOptions(ans, '%');
    out.push({
      id: `apt_loc_pl_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      topicId: req.topicId,
      topic: req.topic,
      category: req.category,
      difficulty,
      company: comp,
      question: `A seller marks an article ${m}% above cost price and allows a ${d}% discount. Find the net profit percentage.`,
      options,
      correctAnswer,
      shortcutFormula: 'Net % = m - d - (m × d) / 100',
      explanation: `${m} - ${d} - (${m} × ${d}) / 100 = ${ans}%.`,
      source: 'procedural',
    });
  } else if (req.topicId === 'quant-time-work') {
    const [a, b] = pick([
      [6, 12],
      [10, 15],
      [12, 24],
      [15, 30],
      [20, 30],
    ]);
    const ans = Math.round((a * b) / (a + b));
    const { options, correctAnswer } = makeNumericOptions(ans, ' days');
    out.push({
      id: `apt_loc_tw_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      topicId: req.topicId,
      topic: req.topic,
      category: req.category,
      difficulty,
      company: comp,
      question: `A can complete a job in ${a} days and B in ${b} days. Together, how many days will they take?`,
      options,
      correctAnswer,
      shortcutFormula: 'Combined Time = (A × B) / (A + B)',
      explanation: `(${a} × ${b}) / (${a} + ${b}) = ${ans} days.`,
      source: 'procedural',
    });
  }

  return out;
}

export const aptitudeService = {
  getSeedQuestionsForTopic(topicId: string): AptitudeQuestion[] {
    return BANK_QUESTIONS.filter((q) => q.topicId === topicId);
  },

  getTotalSeedCount(): number {
    return BANK_QUESTIONS.length;
  },

  async generatePracticeSet(req: GenerateAptitudeRequest): Promise<GenerateAptitudeResponse> {
    const count = Math.max(15, Math.min(50, req.count || 20));

    // 1. Try Flask SQLite + Gemini Backend Endpoint
    try {
      const timeoutMs = req.forceFreshAI ? 9000 : 3000;
      const res = await fetch(`${API_BASE_URL}/aptitude/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...req, count }),
        signal: AbortSignal.timeout(timeoutMs),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.questions) && json.questions.length > 0) {
          if (json.source === 'gemini') {
            saveLocalCachedQuestions(json.questions);
          }
          return {
            questions: json.questions,
            source: json.source || 'sqlite',
          };
        }
      }
    } catch {
      // Offline / backend unavailable; continue seamlessly to local bank / direct Gemini
    }

    // 2. If offline from Flask and forceFreshAI is requested with client VITE_GEMINI_API_KEY
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (
      req.forceFreshAI &&
      apiKey &&
      apiKey.trim().length > 10 &&
      !apiKey.includes('your_gemini_api_key')
    ) {
      try {
        const compLabel =
          !req.company || req.company === 'Any Company'
            ? 'Top Tech MNCs (TCS, Infosys, Wipro, Amazon, Deloitte)'
            : req.company;
        const prompt = `Generate ${count} authentic Indian campus placement MCQ questions for ${compLabel}.
Topic: ${req.topic} (${req.category})
Difficulty: ${req.difficulty || 'Medium'}

Return ONLY a raw JSON array of objects (no markdown fences):
[
  {
    "question": "...",
    "options": ["...", "...", "...", "..."],
    "correctAnswer": 0,
    "shortcutFormula": "...",
    "explanation": "..."
  }
]`;
        const gemRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
              generationConfig: { temperature: 0.35, maxOutputTokens: 2500 },
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
            const formatted: AptitudeQuestion[] = parsed
              .filter(
                (q) =>
                  q?.question &&
                  Array.isArray(q?.options) &&
                  q.options.length === 4 &&
                  typeof q.correctAnswer === 'number' &&
                  q.correctAnswer >= 0 &&
                  q.correctAnswer <= 3
              )
              .map((q, idx) => ({
                id: `apt_gem_${Date.now()}_${idx}`,
                topicId: req.topicId,
                topic: req.topic,
                category: req.category,
                difficulty: req.difficulty || 'Medium',
                company: req.company || 'TCS',
                question: q.question,
                options: q.options.map(String),
                correctAnswer: q.correctAnswer,
                shortcutFormula: q.shortcutFormula || 'Apply core formula.',
                explanation: q.explanation || 'Review calculation steps.',
                source: 'gemini',
              }));
            if (formatted.length > 0) {
              saveLocalCachedQuestions(formatted);
              return { questions: formatted.slice(0, count), source: 'gemini' };
            }
          }
        }
      } catch {
        // fallback cleanly to local bank
      }
    }

    // 3. Offline Local Fallback (Parameterized + Local AI Cache + 355-Question Built-in Bank)
    const excludeSet = new Set(req.excludeIds || []);
    const cachedForTopic = getLocalCachedQuestions(req.topicId);
    const seedForTopic = BANK_QUESTIONS.filter((q) => q.topicId === req.topicId);

    const paramQs = req.forceFreshAI ? generateLocalParameterizedSet(req) : [];
    const combinedPool = shuffle([...paramQs, ...cachedForTopic, ...seedForTopic]);
    const unseen = combinedPool.filter((q) => !excludeSet.has(q.id));
    const selected = (unseen.length >= count ? unseen : combinedPool).slice(0, count);

    // Top-up from same category, then broader placement bank if user requested 15–50 questions
    if (selected.length < count) {
      const seen = new Set(selected.map((q) => q.id));
      const sameCategory = shuffle(
        BANK_QUESTIONS.filter((q) => q.category === req.category && !seen.has(q.id))
      );
      for (const extra of sameCategory) {
        if (selected.length >= count) break;
        selected.push(extra);
        seen.add(extra.id);
      }
      if (selected.length < count) {
        const broaderPool = shuffle(BANK_QUESTIONS.filter((q) => !seen.has(q.id)));
        for (const extra of broaderPool) {
          if (selected.length >= count) break;
          selected.push(extra);
          seen.add(extra.id);
        }
      }
    }

    return {
      questions: selected,
      source: paramQs.length > 0 ? 'procedural' : 'local',
    };
  },

  getTopicById(topicId: string) {
    return APTITUDE_SYLLABUS.find((t) => t.id === topicId);
  },
};
