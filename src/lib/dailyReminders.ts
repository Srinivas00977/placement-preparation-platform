import { SHARED_COURSES, getCoursePriorityForCareer } from '@/data/courseLibrary/courses';
import { resolveCareerTrack } from '@/data/technicalCurriculum/careers';
import { type DailyAssessmentStatus } from '@/services/assessmentService';
import { type CourseProgressState } from '@/services/courseService';
import { type UserProgressData } from '@/services/progressService';

export interface DailyHabitReminder {
  id: 'assessment' | 'course' | 'practice';
  title: string;
  message: string;
  ctaLabel: string;
  route: string;
  badgeText?: string;
}

/**
 * Computes live pending daily habits across:
 * 1. Daily Skill Assessment (20-35 Qs)
 * 2. Active Course Day-Wise Study
 * 3. Daily Practice (1 Coding problem OR 1 Aptitude set today)
 */
export function getUnifiedDailyReminders(
  progress: UserProgressData,
  dailyStatus: DailyAssessmentStatus | null,
  courseProgress: CourseProgressState
): DailyHabitReminder[] {
  const reminders: DailyHabitReminder[] = [];
  const todayStr = new Date().toISOString().split('T')[0];
  const targetRole = progress.profile.targetRole || 'Software Engineer';

  // 1. Daily Skill Assessment
  if (dailyStatus && !dailyStatus.completedToday) {
    const reqQs = dailyStatus.requiredQuestions || 20;
    reminders.push({
      id: 'assessment',
      title: 'Daily Skill Assessment',
      message: `Daily Assessment Pending — Complete today's ${reqQs}-question test for ${targetRole}.`,
      ctaLabel: 'Take Assessment →',
      route: '/assessment',
      badgeText: `${dailyStatus.dailyStreak || 0}d Streak`,
    });
  }

  // 2. Active Course Day-Wise Study
  const career = resolveCareerTrack(targetRole);
  const preferredCourse =
    (courseProgress.activeCourseId &&
      SHARED_COURSES.find((c) => c.id === courseProgress.activeCourseId)) ||
    SHARED_COURSES.find((c) => getCoursePriorityForCareer(c, career.id) === 'Essential') ||
    SHARED_COURSES[0];

  const targetDays =
    courseProgress.targetDaysByCourse?.[preferredCourse.id] || preferredCourse.durationDays;
  const completedDays = courseProgress.courses[preferredCourse.id] || [];
  let nextDay = 1;
  for (let d = 1; d <= targetDays; d++) {
    if (!completedDays.includes(d)) {
      nextDay = d;
      break;
    }
    if (d === targetDays) {
      nextDay = targetDays;
    }
  }
  const studiedToday = courseProgress.lastStudiedDate === todayStr;
  const courseFinished = completedDays.length >= targetDays;
  if (!studiedToday && !courseFinished) {
    reminders.push({
      id: 'course',
      title: 'Active Course Day-Wise Study',
      message: `Course Study Pending — Complete Day ${nextDay} of ${preferredCourse.title} (${targetDays}-Day Plan).`,
      ctaLabel: 'Continue Course →',
      route: '/courses',
      badgeText: `Day ${nextDay}/${targetDays}`,
    });
  }

  // 3. Daily Practice (Coding or Aptitude)
  const solvedCodingToday = (progress.codingSubmissions || []).some(
    (s) => s.date && s.date.startsWith(todayStr)
  );
  const attemptedAptitudeToday = (progress.aptitudeAttempts || []).some(
    (a) => a.date && a.date.startsWith(todayStr)
  );

  if (!solvedCodingToday && !attemptedAptitudeToday) {
    reminders.push({
      id: 'practice',
      title: 'Daily Practice (Coding / Aptitude)',
      message:
        'Daily Practice — Solve 1 coding problem or 1 aptitude set to boost Readiness Index.',
      ctaLabel: 'Practice Now →',
      route: '/coding',
      badgeText: '+Readiness',
    });
  }

  return reminders;
}
