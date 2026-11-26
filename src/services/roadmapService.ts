import { progressService, type RoadmapStep, type UserProgressData, type CategoryBreakdown } from './progressService';

export const roadmapService = {
  /**
   * Generate an intelligent roadmap.
   * If VITE_GEMINI_API_KEY is present, calls Google Gemini API.
   * Falls back cleanly to high-precision dynamic rule-based generator.
   */
  async generatePersonalizedRoadmap(progressData: UserProgressData): Promise<RoadmapStep[]> {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    const targetRole = progressData.profile.targetRole || 'Software Engineer';
    const targetCompanies =
      progressData.profile.targetCompanies && progressData.profile.targetCompanies.length > 0
        ? progressData.profile.targetCompanies
        : ['TCS', 'Amazon', 'Google'];
    const assessment = progressData.assessment;
    const weaknesses = assessment?.weaknesses || ['Data Structures & Algorithms', 'Operating Systems'];
    const skillGaps = assessment?.skillGaps || ['Dynamic Programming', 'System Fundamentals'];
    const readiness = progressService.calculateReadinessWithData(progressData);

    if (apiKey && apiKey.trim().length > 10 && !apiKey.includes('your_gemini_api_key')) {
      try {
        const geminiSteps = await this.callGeminiAPI(apiKey, {
          targetRole,
          targetCompanies,
          readiness: readiness.overall,
          categories: readiness.categories,
          weaknesses,
          skillGaps,
          dailyGoalHours: progressData.profile.dailyGoalHours,
        });
        if (geminiSteps && geminiSteps.length > 0) {
          progressService.saveRoadmap(geminiSteps);
          return geminiSteps;
        }
      } catch (err) {
        console.warn('Gemini API call failed or timed out. Falling back to dynamic rule-based roadmap generator.', err);
      }
    }

    // Dynamic Rule-Based Generator based on real user scores & gaps
    const fallbackSteps = this.generateRuleBasedRoadmap(targetRole, targetCompanies, readiness, weaknesses, skillGaps);
    progressService.saveRoadmap(fallbackSteps);
    return fallbackSteps;
  },

  async callGeminiAPI(
    apiKey: string,
    context: {
      targetRole: string;
      targetCompanies: string[];
      readiness: number;
      categories: CategoryBreakdown;
      weaknesses: string[];
      skillGaps: string[];
      dailyGoalHours: number;
    }
  ): Promise<RoadmapStep[] | null> {
    const prompt = `You are PlacePilot AI, an elite university campus placement coach.
Generate a structured, actionable 4-phase placement preparation roadmap for a student targeting the role "${context.targetRole}" and targeting placement at companies: ${context.targetCompanies.join(', ')}.
Current student baseline:
- Target Companies: ${context.targetCompanies.join(', ')}
- Overall Placement Readiness: ${context.readiness}%
- Category Scores: Aptitude: ${context.categories.aptitude}%, Coding: ${context.categories.coding}%, Technical: ${context.categories.technical}%, HR: ${context.categories.hr}%, Resume: ${context.categories.resume}%
- Identified Weaknesses: ${context.weaknesses.join(', ')}
- Skill Gaps: ${context.skillGaps.join(', ')}
- Daily Available Study Time: ${context.dailyGoalHours} hours/day

Emphasize specific rounds and preparation focus for their target companies (e.g. TCS NQT Aptitude + Advanced Coding, Amazon DSA & Leadership Principles, Zoho C/Logical rounds, Infosys DSE/SP rounds).

Return a JSON array containing 4 to 6 RoadmapStep objects with this exact structure:
[
  {
    "id": "step_1",
    "phase": "Phase 1: Diagnostic & Foundation",
    "title": "Topic Title",
    "description": "Specific actionable preparation milestones",
    "duration": "1-2 Weeks",
    "status": "in_progress",
    "category": "DSA",
    "resources": [
      { "name": "Resource Name", "type": "youtube", "url": "https://..." },
      { "name": "Practice Sheet", "type": "practice", "url": "https://..." }
    ]
  }
]
IMPORTANT: Return ONLY raw valid JSON array. No markdown code blocks, no explanation.`;

    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 2048,
        },
      }),
    });

    if (!res.ok) {
      throw new Error(`Gemini API HTTP Error: ${res.status}`);
    }

    const json = await res.json();
    const rawText = json?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawText) return null;

    const cleaned = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsed: RoadmapStep[] = JSON.parse(cleaned);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : null;
  },

  generateRuleBasedRoadmap(
    targetRole: string,
    targetCompanies: string[],
    readiness: {
      overall: number;
      categories: { aptitude: number; coding: number; technical: number; hr: number; resume: number };
    },
    weaknesses: string[],
    _skillGaps: string[]
  ): RoadmapStep[] {
    const isCodingWeak = readiness.categories.coding < 60;
    const isAptitudeWeak = readiness.categories.aptitude < 65;
    const isTechWeak = readiness.categories.technical < 60;
    const isResumeWeak = readiness.categories.resume < 70;
    const topCompanies = targetCompanies.slice(0, 3).join(', ') || 'TCS, Amazon, Google';

    const steps: RoadmapStep[] = [
      // PHASE 1
      {
        id: 'step_1_foundations',
        phase: 'Phase 1: Immediate Gap Correction & DSA',
        title: isCodingWeak
          ? `Master Core DSA for ${topCompanies}`
          : `Advanced Algorithmic Speed for ${topCompanies}`,
        description: `Targeting identified weaknesses (${weaknesses.slice(0, 2).join(', ') || 'Array & Hash Maps'}). Focus on two-pointer, sliding window, and recursion patterns frequently tested by ${topCompanies}.`,
        duration: 'Week 1 - 2',
        status: 'in_progress',
        category: 'Coding & DSA',
        resources: [
          { name: 'NeetCode 150 - Core Patterns', type: 'practice', url: 'https://neetcode.io/roadmap' },
          { name: 'Striver A2Z DSA Course', type: 'youtube', url: 'https://takeuforward.org/strivers-a2z-dsa-course/strivers-a2z-dsa-course-sheet-2/' },
          { name: 'Big-O CheatSheet', type: 'doc', url: 'https://www.bigocheatsheet.com/' },
        ],
      },

      // PHASE 2
      {
        id: 'step_2_technical_core',
        phase: 'Phase 2: CS Core & System Fundamentals',
        title: `${targetRole} Technical Mastery & DBMS/OS`,
        description: isTechWeak
          ? `Intensive revision on Operating Systems (Paging, Deadlocks), DBMS (ACID, Normalization, SQL), and Computer Networks (OSI, TCP) required for ${topCompanies} technical rounds.`
          : `Advanced CS Core revision and System Design architectural basics tailored for ${topCompanies}.`,
        duration: 'Week 3 - 4',
        status: 'pending',
        category: 'Technical',
        resources: [
          { name: 'GateSmashers Operating Systems', type: 'youtube', url: 'https://www.youtube.com/playlist?list=PLxCzCOWd7aiGz9donHRrE9I3Mwn6XdP8p' },
          { name: 'SQL Indexing & Architecture Guide', type: 'doc', url: 'https://use-the-index-luke.com/' },
          { name: 'GeeksforGeeks Top Interview Questions', type: 'practice', url: 'https://www.geeksforgeeks.org/' },
        ],
      },

      // PHASE 3
      {
        id: 'step_3_aptitude_drills',
        phase: 'Phase 3: Company-Specific Speed Aptitude & Screening',
        title: isAptitudeWeak ? `${topCompanies} Aptitude & Speed Tests` : `${topCompanies} High-Speed Aptitude Drills`,
        description: `Complete timed sets on Time & Work, Speed & Distance, Profit & Loss, Syllogisms, and Number Series tailored to clear campus screening tests for ${topCompanies}.`,
        duration: 'Week 5 - 6',
        status: 'pending',
        category: 'Aptitude',
        resources: [
          { name: 'IndiaBIX Quantitative Aptitude Practice', type: 'practice', url: 'https://www.indiabix.com/aptitude/questions-and-answers/' },
          { name: 'Campus Placement Aptitude Crash Course', type: 'youtube', url: 'https://www.youtube.com/' },
        ],
      },

      // PHASE 4
      {
        id: 'step_4_resume_hr',
        phase: 'Phase 4: Resume Tailoring & Behavioral STAR Prep',
        title: isResumeWeak ? `ATS Resume & STAR Prep for ${topCompanies}` : `Executive Interview Mock for ${topCompanies}`,
        description: `Optimize resume keywords specifically for ${targetRole} at ${topCompanies}. Script and practice behavioral questions using the STAR framework, including leadership principles.`,
        duration: 'Week 7 - 8',
        status: 'pending',
        category: 'HR & Resume',
        resources: [
          { name: 'Harvard Resume & Action Verbs Guide', type: 'doc', url: 'https://hwpi.harvard.edu/files/ocs/files/hes-resume-cover-letter-guide.pdf' },
          { name: 'STAR Method Interview Mastery Video', type: 'youtube', url: 'https://www.youtube.com/' },
          { name: 'PlacePilot Resume Analyzer Tool', type: 'practice', url: '/resume' },
        ],
      },
    ];

    return steps;
  },
};
