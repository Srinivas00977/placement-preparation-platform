import { type CourseDay, type CourseDocLink, type CourseYouTubeResource } from './types';

function ytUrl(q: string): string {
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(q)}`;
}

export interface DayTopicSeed {
  title: string;
  subtopics: string[];
  codeExample?: string;
}

/**
 * Generates a realistic, structured multi-day syllabus (e.g. 14, 15, 21, 25, 30, 45 Days)
 * directly from domain module seeds + weekly revision checkpoints + capstone build day,
 * with zero fabricated YouTube video IDs.
 */
export function buildDayWiseSyllabus(opts: {
  courseId: string;
  courseTitle: string;
  totalDays: number;
  channelEng: string;
  channelHindi: string;
  playlistUrl: string;
  playlistVerified: 'Verified Playlist' | 'Topic Search';
  docs: CourseDocLink[];
  seeds: DayTopicSeed[];
}): CourseDay[] {
  const days: CourseDay[] = [];
  const { totalDays, seeds, courseTitle, channelEng, channelHindi, playlistUrl, playlistVerified, docs } = opts;

  for (let d = 1; d <= totalDays; d++) {
    const isCapstone = d === totalDays && totalDays >= 10;
    const isWeeklyReview = !isCapstone && d % 7 === 0;

    let dayTitle = '';
    let daySubs: string[] = [];
    let code = '';
    let mins = 45;
    let level: 'Beginner' | 'Intermediate' | 'Advanced' =
      d <= Math.ceil(totalDays * 0.35)
        ? 'Beginner'
        : d <= Math.ceil(totalDays * 0.75)
        ? 'Intermediate'
        : 'Advanced';

    if (isCapstone) {
      dayTitle = `Final Capstone Mini-Project & Interview Review (${courseTitle})`;
      daySubs = [
        `Integrate all core ${courseTitle} modules into a clean portfolio deliverable`,
        'Write edge-case tests / verification checks & README documentation',
        'Practice 60-second architecture pitch & top interview Q&A',
      ];
      code = `// Day ${d}: Final ${courseTitle} Verification Checklist\n// 1. Happy path verified  2. Boundary/Error cases covered  3. Clean README pushed to GitHub`;
      mins = 75;
    } else if (isWeeklyReview) {
      const weekNum = d / 7;
      dayTitle = `Week ${weekNum} Revision, Timed Practice & Mock Check`;
      const prevSlice = seeds.slice(Math.max(0, (weekNum - 1) * 5), weekNum * 5);
      daySubs = [
        `Spaced-repetition review of Week ${weekNum} core concepts`,
        ...prevSlice.slice(0, 2).map((s) => `Timed recall & coding drill on: ${s.title}`),
      ];
      code = `// Week ${weekNum} Self-Check: Close notes and rebuild 2 key patterns from scratch in 25 mins.`;
      mins = 60;
    } else {
      const seedIdx = (d - 1) % seeds.length;
      const cycleNum = Math.floor((d - 1) / seeds.length) + 1;
      const seed = seeds[seedIdx];
      dayTitle = cycleNum === 1 ? seed.title : `${seed.title} — Deep Practice Round #${cycleNum}`;
      daySubs = seed.subtopics;
      code =
        seed.codeExample ||
        `// Day ${d}: ${dayTitle}\n// Focus subtopics: ${daySubs.slice(0, 2).join(', ')}`;
      mins = level === 'Advanced' ? 60 : 45;
    }

    const tutorialRes: CourseYouTubeResource = {
      title: `${dayTitle} (${channelEng})`,
      channel: channelEng,
      language: 'English',
      level,
      url: ytUrl(`${courseTitle} ${dayTitle} ${channelEng} tutorial`),
      verifiedStatus: 'Topic Search',
      kind: 'tutorial',
    };

    const examplesRes: CourseYouTubeResource = {
      title: `${dayTitle} Practical Examples (${channelHindi})`,
      channel: channelHindi,
      language: 'Hindi',
      level,
      url: ytUrl(`${courseTitle} ${dayTitle} examples ${channelHindi}`),
      verifiedStatus: 'Topic Search',
      kind: 'examples',
    };

    const playlistRes: CourseYouTubeResource = {
      title: `${courseTitle} Complete Playlist`,
      channel: `${channelEng} / ${channelHindi}`,
      language: 'English / Hindi',
      level,
      url: playlistUrl,
      verifiedStatus: playlistVerified,
      kind: 'playlist',
    };

    days.push({
      dayNumber: d,
      title: dayTitle,
      objectives: [
        `Master ${daySubs[0] || dayTitle} with clean intuition`,
        `Practice 2–3 interview-style problems or hands-on examples cleanly`,
      ],
      subtopics: daySubs,
      simpleExplanation: `Day ${d} focuses on ${dayTitle}. Understand why this pattern exists, trace step-by-step inputs by hand, and verify edge-case behavior.`,
      codeExample: code,
      estimatedMinutes: mins,
      dailyAssignment: isCapstone
        ? `Build and push a clean ${courseTitle} mini-project summarizing Weeks 1–${Math.max(1, Math.floor(totalDays / 7))} onto GitHub.`
        : isWeeklyReview
        ? `Re-solve your 3 hardest missed exercises from Days ${d - 6}–${d - 1} without peeking at solutions.`
        : `Implement 2 focused exercises on "${dayTitle}" from official docs or interactive sandbox and write down 2 common pitfalls.`,
      completionCriteria: `Complete coding/reading for Day ${d}, pass your self-check, and mark Day ${d} Completed.`,
      youtube: {
        tutorial: tutorialRes,
        examples: examplesRes,
        playlist: playlistRes,
      },
      docs,
    });
  }

  return days;
}
