import { type CourseDay, type SharedCourse } from '@/data/courseLibrary/types';

export interface PaceBadgeInfo {
  label: string;
  description: string;
  badgeClass: string;
}

export function getPaceBadge(targetDays: number): PaceBadgeInfo {
  const days = Math.max(7, Math.min(90, Math.round(targetDays || 30)));
  if (days <= 20) {
    return {
      label: 'Fast-Track Sprint',
      description: 'Compressed high-yield fundamentals & core placement essentials.',
      badgeClass: 'bg-rose-500/15 text-rose-300 border-rose-500/35',
    };
  }
  if (days <= 35) {
    return {
      label: 'Balanced Placement Pace',
      description: 'Ideal daily cadence balancing concept depth, docs & coding practice.',
      badgeClass: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/35',
    };
  }
  return {
    label: 'Deep Mastery + Labs & Projects',
    description: 'Extended schedule with weekly checkpoints, labs, Q&A drills & capstone.',
    badgeClass: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/35',
  };
}

function ytSearchUrl(query: string): string {
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
}

function mergeDayBucket(
  course: SharedCourse,
  bucket: CourseDay[],
  dayNumber: number,
  targetDays: number
): CourseDay {
  if (bucket.length === 1) {
    const base = bucket[0];
    const level: 'Beginner' | 'Intermediate' | 'Advanced' =
      dayNumber <= Math.ceil(targetDays * 0.35)
        ? 'Beginner'
        : dayNumber <= Math.ceil(targetDays * 0.75)
        ? 'Intermediate'
        : 'Advanced';
    return {
      ...base,
      dayNumber,
      youtube: {
        ...base.youtube,
        tutorial: { ...base.youtube.tutorial, level },
        examples: { ...base.youtube.examples, level },
        playlist: { ...base.youtube.playlist, level },
      },
    };
  }

  const primary = bucket[0];
  const titles = bucket.map((d) => d.title);
  const combinedTitle =
    titles.length <= 2
      ? titles.join(' + ')
      : `${titles[0]} + ${titles[titles.length - 1]} (${bucket.length} Modules)`;

  const mergedSubtopics = Array.from(new Set(bucket.flatMap((d) => d.subtopics))).slice(0, 6);
  const mergedObjectives = Array.from(new Set(bucket.flatMap((d) => d.objectives))).slice(0, 4);
  const totalMinutes = Math.min(
    120,
    bucket.reduce((sum, d) => sum + (d.estimatedMinutes || 45), 0)
  );
  const combinedExplanation = bucket
    .map((d) => `${d.title}: ${d.simpleExplanation}`)
    .slice(0, 2)
    .join(' ');
  const combinedAssignment =
    bucket.length > 1
      ? `${bucket[0].dailyAssignment} Also complete: ${bucket[bucket.length - 1].dailyAssignment}`
      : bucket[0].dailyAssignment;

  const level: 'Beginner' | 'Intermediate' | 'Advanced' =
    dayNumber <= Math.ceil(targetDays * 0.35)
      ? 'Beginner'
      : dayNumber <= Math.ceil(targetDays * 0.75)
      ? 'Intermediate'
      : 'Advanced';

  return {
    dayNumber,
    title: combinedTitle,
    objectives: mergedObjectives,
    subtopics: mergedSubtopics,
    simpleExplanation: combinedExplanation,
    codeExample: bucket.find((d) => d.codeExample)?.codeExample || primary.codeExample,
    estimatedMinutes: totalMinutes,
    dailyAssignment: combinedAssignment,
    completionCriteria: bucket[bucket.length - 1].completionCriteria,
    youtube: {
      tutorial: {
        ...primary.youtube.tutorial,
        title: `${combinedTitle} (${primary.youtube.tutorial.channel})`,
        level,
        url: ytSearchUrl(`${course.title} ${titles[0]} ${primary.youtube.tutorial.channel} tutorial`),
      },
      examples: {
        ...primary.youtube.examples,
        title: `${combinedTitle} Practical Examples (${primary.youtube.examples.channel})`,
        level,
        url: ytSearchUrl(`${course.title} ${titles[0]} ${primary.youtube.examples.channel} examples`),
      },
      playlist: {
        ...primary.youtube.playlist,
        level,
      },
    },
    docs: primary.docs,
  };
}

function buildExpansionSlot(
  course: SharedCourse,
  template: CourseDay,
  kind: 'weekly' | 'lab' | 'qa' | 'capstone' | 'assessment',
  dayNumber: number,
  targetDays: number
): CourseDay {
  const level: 'Beginner' | 'Intermediate' | 'Advanced' =
    dayNumber <= Math.ceil(targetDays * 0.35)
      ? 'Beginner'
      : dayNumber <= Math.ceil(targetDays * 0.75)
      ? 'Intermediate'
      : 'Advanced';

  const shortCourse = course.title.replace(/\s*\(.*?\)\s*/g, '').trim();

  if (kind === 'weekly') {
    const weekNum = Math.max(1, Math.round(dayNumber / 7));
    return {
      ...template,
      dayNumber,
      title: `Week ${weekNum} Revision & Checkpoint (${shortCourse})`,
      objectives: [
        `Consolidate Week ${weekNum} patterns covered up to Day ${dayNumber - 1}`,
        'Solve 3 timed recall problems without looking at notes',
      ],
      subtopics: [
        `Active recall summary of ${template.title}`,
        'Mistake log review & complexity sanity check',
        'Timed 25-minute checkpoint drill',
      ],
      simpleExplanation: `Day ${dayNumber} is your structured Week ${weekNum} Revision & Checkpoint for ${course.title}. Revisit recent concepts, close weak spots, and lock formulas into long-term memory.`,
      estimatedMinutes: 60,
      dailyAssignment: `Write a concise 1-page cheat note summarizing Week ${weekNum} of ${course.title} and re-solve 2 tricky exercises from scratch.`,
      completionCriteria: `Week ${weekNum} revision notes written and 3 checkpoint drills completed under timed conditions.`,
      youtube: {
        tutorial: {
          ...template.youtube.tutorial,
          title: `${shortCourse} Week ${weekNum} Revision & Practice (${template.youtube.tutorial.channel})`,
          level,
          url: ytSearchUrl(`${shortCourse} revision one shot ${template.youtube.tutorial.channel}`),
        },
        examples: {
          ...template.youtube.examples,
          title: `${shortCourse} Practice Drill (${template.youtube.examples.channel})`,
          level,
        },
        playlist: { ...template.youtube.playlist, level },
      },
    };
  }

  if (kind === 'lab') {
    return {
      ...template,
      dayNumber,
      title: `Hands-On Coding Lab: ${template.title}`,
      objectives: [
        `Implement ${template.title} cleanly in code with edge-case tests`,
        'Benchmark time/space or runtime behavior on realistic inputs',
      ],
      subtopics: [
        ...(template.subtopics.slice(0, 2)),
        'Hands-on debugging & edge-case verification',
      ],
      simpleExplanation: `Dedicated lab day to turn theory from "${template.title}" into runnable, bug-free implementation in your editor.`,
      estimatedMinutes: 65,
      dailyAssignment: `Build and verify a standalone practice exercise for "${template.title}" covering empty, boundary, and large inputs.`,
      completionCriteria: 'Implementation compiles/runs cleanly and passes self-written boundary test cases.',
    };
  }

  if (kind === 'qa') {
    return {
      ...template,
      dayNumber,
      title: `Interview Q&A Drill: ${template.title}`,
      objectives: [
        `Answer common technical interview follow-ups on ${template.title}`,
        'Explain trade-offs clearly in under 90 seconds',
      ],
      subtopics: [
        `Top interview questions on ${template.title}`,
        'Why/when trade-offs & common pitfalls',
        'Whiteboard explanation walkthrough',
      ],
      simpleExplanation: `Simulated technical interview drill targeting how interviewers probe "${template.title}" during campus and lateral rounds.`,
      estimatedMinutes: 50,
      dailyAssignment: `Record or write crisp 60-second answers to 5 interview questions covering ${template.title} and related internals.`,
      completionCriteria: 'Completed 5 interview-style Q&A prompts aloud with clear complexity/trade-off reasoning.',
      youtube: {
        tutorial: {
          ...template.youtube.tutorial,
          title: `${shortCourse} Interview Questions on ${template.title}`,
          level,
          url: ytSearchUrl(`${shortCourse} ${template.title} interview questions`),
        },
        examples: template.youtube.examples,
        playlist: { ...template.youtube.playlist, level },
      },
    };
  }

  if (kind === 'capstone') {
    return {
      ...template,
      dayNumber,
      title: `Capstone Mini-Project Build (${shortCourse})`,
      objectives: [
        `Combine core ${course.title} concepts into one portfolio-ready build`,
        'Document architecture decisions cleanly in a GitHub README',
      ],
      subtopics: [
        'System / module architecture planning',
        'End-to-end feature implementation & testing',
        'Clean GitHub README & 60-second project pitch',
      ],
      simpleExplanation: `Bring together everything learned across ${course.title} into a tangible mini-project you can showcase on your resume and defend in interviews.`,
      estimatedMinutes: 80,
      dailyAssignment: `Ship your ${course.title} Capstone Mini-Project with clean structure, sample screenshots/output, and a well-documented README.`,
      completionCriteria: 'Capstone project runs end-to-end and architecture pitch is ready.',
    };
  }

  return {
    ...template,
    dayNumber,
    title: `Final Assessment & Mock Readiness Review (${shortCourse})`,
    objectives: [
      `Validate full ${targetDays}-Day ${course.title} syllabus mastery`,
      'Identify final 2–3 weak spots before placement interviews',
    ],
    subtopics: [
      'Full syllabus mock quiz & coding check',
      'Time-boxed problem solving under interview pressure',
      'Final readiness gap audit',
    ],
    simpleExplanation: `Final Assessment Day! Test your complete understanding across the ${targetDays}-day ${course.title} track and lock in placement readiness.`,
    estimatedMinutes: 60,
    dailyAssignment: `Complete the Skill Assessment tab check for ${course.title} aiming for >= 75% accuracy and review any missed explanations.`,
    completionCriteria: `Final mock assessment completed and all weak concepts logged for rapid review.`,
  };
}

/**
 * Dynamically scales any SharedCourse syllabus to 20 / 30 / 40 / 50 / Custom (7-90) days:
 * - Preserves 100% of original subtopics when targetDays < baseDays by merging consecutive modules cleanly.
 * - Inserts Weekly Revision & Checkpoints (every 7th day), Hands-On Coding Labs,
 *   Interview Q&A Drills, Capstone Mini-Project & Final Assessment when targetDays > baseDays.
 */
export function buildDynamicDayPlan(course: SharedCourse, targetDaysInput: number): CourseDay[] {
  const targetDays = Math.max(7, Math.min(90, Math.round(targetDaysInput || course.durationDays)));
  const baseDays = course.days;

  if (!baseDays || baseDays.length === 0) return [];
  if (targetDays === baseDays.length) return baseDays;

  // Compression case: distribute baseDays evenly across targetDays buckets (no syllabus dropped!)
  if (targetDays < baseDays.length) {
    const result: CourseDay[] = [];
    for (let i = 0; i < targetDays; i++) {
      const start = Math.floor((i * baseDays.length) / targetDays);
      const end = Math.floor(((i + 1) * baseDays.length) / targetDays);
      const slice = baseDays.slice(start, Math.max(start + 1, end));
      result.push(mergeDayBucket(course, slice, i + 1, targetDays));
    }
    return result;
  }

  // Expansion case: keep every base lesson cleanly and fill extra days with structured labs, weekly reviews, Q&A, capstone, final assessment
  const finalSlotsCount = targetDays >= 10 ? 2 : 1; // capstone + final assessment
  const weeklyDays: number[] = [];
  for (let d = 7; d <= targetDays - finalSlotsCount; d += 7) {
    weeklyDays.push(d);
  }

  const lessonSlotIndices: number[] = [];
  for (let d = 1; d <= targetDays - finalSlotsCount; d++) {
    if (!weeklyDays.includes(d)) {
      lessonSlotIndices.push(d);
    }
  }

  const coreBase = baseDays.filter(
    (d) => !d.title.includes('Revision') && !d.title.includes('Final Capstone')
  );
  const usableBase = coreBase.length > 0 ? coreBase : baseDays;

  // Place core base days evenly into available lesson slots; remaining lesson slots become Labs / Interview Q&A drills
  const assignedMap = new Map<number, CourseDay>();

  // Reserve positions for core base days sequentially from the start or spread smoothly
  const extraSlotsCount = Math.max(0, lessonSlotIndices.length - usableBase.length);
  const extraSlotSet = new Set<number>();
  if (extraSlotsCount > 0 && lessonSlotIndices.length > usableBase.length) {
    for (let k = 1; k <= extraSlotsCount; k++) {
      const idx = Math.min(
        lessonSlotIndices.length - 1,
        Math.floor((k * lessonSlotIndices.length) / (extraSlotsCount + 1))
      );
      let candidate = lessonSlotIndices[idx];
      while (extraSlotSet.has(candidate)) {
        const nextIdx = (lessonSlotIndices.indexOf(candidate) + 1) % lessonSlotIndices.length;
        candidate = lessonSlotIndices[nextIdx];
      }
      extraSlotSet.add(candidate);
    }
  }

  let baseCursor = 0;
  let lastUsedTemplate = usableBase[0];
  let extraCounter = 0;

  for (const dayNum of lessonSlotIndices) {
    if (!extraSlotSet.has(dayNum) && baseCursor < usableBase.length) {
      const tpl = usableBase[baseCursor++];
      lastUsedTemplate = tpl;
      assignedMap.set(dayNum, mergeDayBucket(course, [tpl], dayNum, targetDays));
    } else {
      const tpl = usableBase[Math.min(usableBase.length - 1, Math.max(0, baseCursor - 1))] || lastUsedTemplate;
      const kind = extraCounter % 2 === 0 ? 'lab' : 'qa';
      extraCounter++;
      assignedMap.set(dayNum, buildExpansionSlot(course, tpl, kind, dayNum, targetDays));
    }
  }

  for (const wDay of weeklyDays) {
    const refDay = assignedMap.get(wDay - 1) || lastUsedTemplate;
    assignedMap.set(wDay, buildExpansionSlot(course, refDay, 'weekly', wDay, targetDays));
  }

  const tailTemplate = baseDays[baseDays.length - 1] || lastUsedTemplate;
  if (finalSlotsCount === 2) {
    assignedMap.set(
      targetDays - 1,
      buildExpansionSlot(course, tailTemplate, 'capstone', targetDays - 1, targetDays)
    );
    assignedMap.set(
      targetDays,
      buildExpansionSlot(course, tailTemplate, 'assessment', targetDays, targetDays)
    );
  } else {
    assignedMap.set(
      targetDays,
      buildExpansionSlot(course, tailTemplate, 'assessment', targetDays, targetDays)
    );
  }

  const ordered: CourseDay[] = [];
  for (let d = 1; d <= targetDays; d++) {
    ordered.push(
      assignedMap.get(d) || buildExpansionSlot(course, lastUsedTemplate, 'lab', d, targetDays)
    );
  }
  return ordered;
}
