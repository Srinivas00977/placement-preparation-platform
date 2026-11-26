import { jsPDF } from 'jspdf';
import { type CourseDay, type SharedCourse } from '@/data/courseLibrary/types';
import {
  type CareerSubtopic,
  type CareerTrack,
  type CheatSheetCard,
  type CoreSubjectModule,
} from '@/data/technicalCurriculum/types';

function sanitizeAscii(text: string): string {
  return String(text || '')
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[\u2013\u2014]/g, '-')
    .replace(/\u2192/g, '->')
    .replace(/\u2022/g, '*')
    .replace(/[^\x09\x0A\x0D\x20-\x7E]/g, ' ');
}

function slugifyFilename(name: string): string {
  return (
    name
      .replace(/[^a-zA-Z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '')
      .slice(0, 64) || 'Study_Material'
  );
}

function triggerTextDownload(filename: string, content: string, mime = 'text/markdown;charset=utf-8') {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

interface PdfSection {
  heading?: string;
  paragraphs?: string[];
  bullets?: string[];
  code?: string;
}

function renderPdfDocument(title: string, subtitle: string, sections: PdfSection[], filename: string) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 44;
  const maxWidth = pageWidth - margin * 2;
  let y = 52;

  const ensureSpace = (needed: number) => {
    if (y + needed > pageHeight - 48) {
      doc.addPage();
      y = 52;
    }
  };

  const writeWrapped = (
    text: string,
    opts: { size: number; bold?: boolean; mono?: boolean; color?: [number, number, number]; indent?: number; lineGap?: number }
  ) => {
    const clean = sanitizeAscii(text);
    doc.setFont(opts.mono ? 'courier' : 'helvetica', opts.bold ? 'bold' : 'normal');
    doc.setFontSize(opts.size);
    const [r, g, b] = opts.color || [30, 41, 59];
    doc.setTextColor(r, g, b);

    const indent = opts.indent || 0;
    const lines = doc.splitTextToSize(clean, maxWidth - indent) as string[];
    const step = opts.lineGap || Math.round(opts.size * 1.42);
    for (const line of lines) {
      ensureSpace(step + 2);
      doc.text(line, margin + indent, y);
      y += step;
    }
  };

  // Document Header Banner
  doc.setFillColor(12, 18, 28);
  doc.rect(margin, y - 22, maxWidth, 56, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(34, 211, 238);
  doc.text('PLACEPILOT AI — TECHNICAL STUDY PACK', margin + 12, y - 3);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(255, 255, 255);
  doc.text(sanitizeAscii(title).slice(0, 74), margin + 12, y + 16);
  y += 46;

  if (subtitle) {
    writeWrapped(subtitle, { size: 9.5, color: [71, 85, 105] });
    y += 8;
  }

  for (const sec of sections) {
    if (sec.heading) {
      ensureSpace(26);
      y += 6;
      doc.setDrawColor(203, 213, 225);
      doc.line(margin, y - 4, pageWidth - margin, y - 4);
      writeWrapped(sec.heading, { size: 11.5, bold: true, color: [15, 23, 42] });
      y += 3;
    }
    for (const p of sec.paragraphs || []) {
      writeWrapped(p, { size: 9.5, color: [51, 65, 85] });
      y += 4;
    }
    for (const b of sec.bullets || []) {
      writeWrapped(`* ${b}`, { size: 9.2, indent: 8, color: [30, 41, 59] });
    }
    if (sec.code) {
      y += 3;
      writeWrapped(sec.code, { size: 8.4, mono: true, indent: 8, color: [6, 95, 70], lineGap: 11 });
      y += 4;
    }
    y += 4;
  }

  // Footer page numbering
  const totalPages = doc.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text(
      `PlacePilot AI Placement Revision Notes • Page ${p} of ${totalPages}`,
      margin,
      pageHeight - 24
    );
  }

  doc.save(filename);
}

// ---------------------------------------------------------------------------
// 1. EXPORT COMPLETE CAREER STUDY PACK
// ---------------------------------------------------------------------------
export function exportCareerStudyPack(career: CareerTrack, format: 'pdf' | 'md') {
  const safeName = slugifyFilename(career.name);
  if (format === 'md') {
    const lines: string[] = [
      `# ${career.name} — Complete Placement Study Pack`,
      `> ${career.overview}`,
      '',
      `- **Languages:** ${career.languages.join(', ')}`,
      `- **Core Skills:** ${career.coreSkills.join(', ')}`,
      `- **Industry Tools:** ${career.tools.join(', ')}`,
      '',
      '## 1. Phased Learning Roadmap',
    ];
    for (const ph of career.phases) {
      lines.push(`\n### Phase ${ph.phaseNumber}: ${ph.title} (${ph.level})`);
      for (const tp of ph.topics) {
        lines.push(`#### ${tp.title}`);
        for (const sub of tp.subtopics) {
          lines.push(`- **${sub.title}** (${sub.estimatedTime}): ${sub.simpleExplanation}`);
        }
      }
    }
    lines.push('\n## 2. Core Subjects & Tools');
    for (const mod of career.coreSubjects) {
      lines.push(`\n### ${mod.title} [${mod.badge}]`);
      for (const sub of mod.subtopics) {
        lines.push(`- **${sub.title}**: ${sub.simpleExplanation}`);
        if (sub.codeExample) {
          lines.push('```text\n' + sub.codeExample + '\n```');
        }
      }
    }
    lines.push('\n## 3. Quick Cheat Sheets');
    for (const cs of career.cheatSheets) {
      lines.push(`\n### ${cs.title}`);
      cs.rows?.forEach((r) => lines.push(`- **${r.item}** (\`${r.syntaxOrRule}\`): ${r.note}`));
      cs.bullets?.forEach((b) => lines.push(`- ${b}`));
    }
    lines.push('\n## 4. Top Interview Q&A');
    for (const qa of career.interviewQA) {
      lines.push(`\n**Q (${qa.level} • ${qa.topic}): ${qa.question}**`);
      lines.push(`${qa.answer}`);
      if (qa.talkingPoints?.length) {
        lines.push(`_Key Points:_ ${qa.talkingPoints.join(' | ')}`);
      }
    }
    triggerTextDownload(`PlacePilot_${safeName}_Study_Pack.md`, lines.join('\n'));
    return;
  }

  const sections: PdfSection[] = [
    {
      heading: 'Career Overview & Core Stack',
      paragraphs: [career.overview],
      bullets: [
        `Primary Languages: ${career.languages.join(', ')}`,
        `Core Skills: ${career.coreSkills.join(', ')}`,
        `Industry Tools: ${career.tools.join(', ')}`,
      ],
    },
    {
      heading: 'Phased Learning Roadmap',
      bullets: career.phases.flatMap((ph) =>
        ph.topics.flatMap((t) =>
          t.subtopics.map((s) => `[Phase ${ph.phaseNumber} ${ph.level}] ${s.title} (${s.estimatedTime}) - ${s.simpleExplanation}`)
        )
      ),
    },
  ];

  for (const mod of career.coreSubjects) {
    sections.push({
      heading: `Core Module: ${mod.title}`,
      paragraphs: [mod.summary],
      bullets: mod.subtopics.map((s) => `${s.title} (${s.level}) - ${s.simpleExplanation}`),
    });
  }

  for (const cs of career.cheatSheets) {
    sections.push({
      heading: `Cheat Sheet: ${cs.title}`,
      paragraphs: [cs.description],
      bullets: [
        ...(cs.rows?.map((r) => `${r.item} [${r.syntaxOrRule}]: ${r.note}`) || []),
        ...(cs.bullets || []),
      ],
      code: cs.codeSnippet,
    });
  }

  sections.push({
    heading: 'High-Frequency Interview Q&A',
    bullets: career.interviewQA.map(
      (qa) => `[${qa.level} | ${qa.topic}] ${qa.question} => ${qa.answer}`
    ),
  });

  renderPdfDocument(
    career.name,
    'Complete Career Study Pack (Roadmap, Core Subjects, Cheat Sheets & Interview Q&A)',
    sections,
    `PlacePilot_${safeName}_Complete_Guide.pdf`
  );
}

// ---------------------------------------------------------------------------
// 2. EXPORT SINGLE CORE SUBJECT MODULE
// ---------------------------------------------------------------------------
export function exportSubjectModule(
  careerName: string,
  mod: CoreSubjectModule,
  format: 'pdf' | 'md'
) {
  const safeBadge = slugifyFilename(mod.badge || mod.title);
  if (format === 'md') {
    const lines: string[] = [
      `# ${mod.title}`,
      `> Track: ${careerName} | Type: ${mod.kind}`,
      `> ${mod.summary}`,
      '',
    ];
    for (const s of mod.subtopics) {
      lines.push(`## ${s.title} (${s.level} • ${s.estimatedTime})`);
      lines.push(s.simpleExplanation);
      lines.push(`\n**Why It Matters:** ${s.whyImportant}`);
      lines.push('\n**Checklist:**');
      s.whatToLearn.forEach((w) => lines.push(`- ${w}`));
      if (s.codeExample) {
        lines.push('\n```text\n' + s.codeExample + '\n```');
      }
      lines.push(`\n**Completion Criteria:** ${s.completionCriteria}`);
      lines.push('**Verified Study Links:**');
      s.resources.forEach((r) => lines.push(`- [${r.title}](${r.url}) (${r.type})`));
      lines.push('');
    }
    triggerTextDownload(`PlacePilot_${safeBadge}_Notes.md`, lines.join('\n'));
    return;
  }

  const sections: PdfSection[] = mod.subtopics.map((s) => ({
    heading: `${s.title} (${s.level} | ${s.estimatedTime})`,
    paragraphs: [s.simpleExplanation, `Why It Matters: ${s.whyImportant}`],
    bullets: [
      ...s.whatToLearn,
      `Completion Criteria: ${s.completionCriteria}`,
      `Resources: ${s.resources.map((r) => `${r.title} (${r.url})`).join(' | ')}`,
    ],
    code: s.codeExample,
  }));

  renderPdfDocument(
    mod.title,
    `Role Scope: ${careerName} • ${mod.subtopics.length} Revision Subtopics`,
    sections,
    `PlacePilot_${safeBadge}_Study_Notes.pdf`
  );
}

// ---------------------------------------------------------------------------
// 3. EXPORT SINGLE SUBTOPIC NOTES
// ---------------------------------------------------------------------------
export function exportSubtopicNotes(
  careerName: string,
  sub: CareerSubtopic,
  format: 'pdf' | 'md'
) {
  const safeSlug = slugifyFilename(sub.title);
  if (format === 'md') {
    const lines = [
      `# ${sub.title}`,
      `> ${careerName} • ${sub.level} • Est. ${sub.estimatedTime}`,
      '',
      '## Simple Explanation',
      sub.simpleExplanation,
      '',
      '## Why This Matters in Placements',
      sub.whyImportant,
      '',
      '## What to Learn',
      ...sub.whatToLearn.map((w) => `- ${w}`),
      '',
      '## Prerequisites',
      ...sub.prerequisites.map((p) => `- ${p}`),
      '',
      sub.codeExample ? '## Practical Code Example\n```text\n' + sub.codeExample + '\n```\n' : '',
      '## Completion Criteria',
      sub.completionCriteria,
      '',
      '## Verified Learning Links & Playlists',
      ...sub.resources.map((r) => `- [${r.title}](${r.url}) (${r.type}, ${r.pricing})`),
    ];
    triggerTextDownload(`PlacePilot_${safeSlug}.md`, lines.join('\n'));
    return;
  }

  const sections: PdfSection[] = [
    {
      heading: 'Simple Explanation',
      paragraphs: [sub.simpleExplanation],
    },
    {
      heading: 'Why This Matters in Placements',
      paragraphs: [sub.whyImportant],
    },
    {
      heading: 'Concept Checklist & Prerequisites',
      bullets: [...sub.whatToLearn, ...sub.prerequisites.map((p) => `Prereq: ${p}`)],
    },
    ...(sub.codeExample
      ? [
          {
            heading: 'Practical Pattern Example',
            code: sub.codeExample,
          },
        ]
      : []),
    {
      heading: 'Practice & Verified Study Links',
      paragraphs: [`Completion Criteria: ${sub.completionCriteria}`],
      bullets: sub.resources.map((r) => `${r.title} (${r.type} • ${r.pricing}) -> ${r.url}`),
    },
  ];

  renderPdfDocument(
    sub.title,
    `${careerName} • ${sub.level} • Est. ${sub.estimatedTime}`,
    sections,
    `PlacePilot_${safeSlug}.pdf`
  );
}

// ---------------------------------------------------------------------------
// 4. EXPORT SINGLE CHEAT SHEET CARD
// ---------------------------------------------------------------------------
export function exportCheatSheetCard(
  careerName: string,
  sheet: CheatSheetCard,
  format: 'pdf' | 'md'
) {
  const safeSlug = slugifyFilename(sheet.title);
  if (format === 'md') {
    const lines = [
      `# ${sheet.title}`,
      `> ${careerName} • ${sheet.badge} Quick Reference`,
      sheet.description,
      '',
      ...(sheet.rows?.map((r) => `- **${r.item}** | \`${r.syntaxOrRule}\` — ${r.note}`) || []),
      ...(sheet.bullets?.map((b) => `- ${b}`) || []),
      sheet.codeSnippet ? '\n```text\n' + sheet.codeSnippet + '\n```' : '',
    ];
    triggerTextDownload(`PlacePilot_CheatSheet_${safeSlug}.md`, lines.join('\n'));
    return;
  }

  const sections: PdfSection[] = [
    {
      heading: sheet.title,
      paragraphs: [sheet.description],
      bullets: [
        ...(sheet.rows?.map((r) => `${r.item}  |  ${r.syntaxOrRule}  ->  ${r.note}`) || []),
        ...(sheet.bullets || []),
      ],
      code: sheet.codeSnippet,
    },
  ];

  renderPdfDocument(
    `Cheat Sheet: ${sheet.title}`,
    `${careerName} • ${sheet.badge} Quick Exam-Night Reference`,
    sections,
    `PlacePilot_CheatSheet_${safeSlug}.pdf`
  );
}

// ---------------------------------------------------------------------------
// 5. EXPORT FULL DAY-WISE COURSE STUDY PLAN PDF
// ---------------------------------------------------------------------------
export function downloadCourseStudyPlanPDF(
  course: SharedCourse,
  customDays?: CourseDay[],
  targetDaysOverride?: number
) {
  const safeSlug = slugifyFilename(course.title);
  const daysToExport = customDays && customDays.length > 0 ? customDays : course.days;
  const effectiveDays = targetDaysOverride || daysToExport.length || course.durationDays;

  const sections: PdfSection[] = [
    {
      heading: `${course.title} (${effectiveDays}-Day Study Plan)`,
      paragraphs: [course.shortSummary],
      bullets: [
        `Category: ${course.category}`,
        `Active Study Duration: ${effectiveDays} Days`,
        `Primary YouTube Channel: ${course.primaryChannel} (${course.primaryLanguage})`,
        `Playlist / Series URL: ${course.playlistUrl}`,
        `Official Documentation: ${course.officialDocsUrl}`,
      ],
    },
    ...daysToExport.map((d) => ({
      heading: `Day ${d.dayNumber}: ${d.title} (~${d.estimatedMinutes} mins)`,
      paragraphs: [d.simpleExplanation, `Assignment: ${d.dailyAssignment}`],
      bullets: [
        `Subtopics: ${d.subtopics.join(', ')}`,
        `Tutorial (${d.youtube.tutorial.language}): ${d.youtube.tutorial.url}`,
        `Docs: ${d.docs.map((doc) => `${doc.title} (${doc.url})`).join(' | ')}`,
      ],
      code: d.codeExample,
    })),
  ];

  renderPdfDocument(
    `${course.title} — ${effectiveDays}-Day Course Plan`,
    `PlacePilot AI Course Library • Category: ${course.category}`,
    sections,
    `PlacePilot_${safeSlug}_${effectiveDays}Day_Course_Plan.pdf`
  );
}
