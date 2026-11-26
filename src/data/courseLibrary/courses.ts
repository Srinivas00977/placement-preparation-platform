import { LANGUAGE_COURSES } from './coursesPart1';
import { TECHNICAL_COURSES } from './coursesPart2';
import { type CoursePriority, type SharedCourse } from './types';

export const SHARED_COURSES: SharedCourse[] = [...LANGUAGE_COURSES, ...TECHNICAL_COURSES];

export function getCoursePriorityForCareer(
  course: SharedCourse,
  careerId: string
): CoursePriority {
  return course.roleTags[careerId] || 'Optional';
}
