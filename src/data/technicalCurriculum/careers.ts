import { CAREERS_PART_1 } from './careersPart1';
import { CAREERS_PART_2 } from './careersPart2';
import { type CareerTrack } from './types';

export const CAREER_TRACKS: CareerTrack[] = [...CAREERS_PART_1, ...CAREERS_PART_2];

export function resolveCareerTrack(roleName?: string): CareerTrack {
  if (!roleName) return CAREER_TRACKS[0];
  const lower = roleName.toLowerCase().trim();
  const exact = CAREER_TRACKS.find((c) => c.name.toLowerCase() === lower);
  if (exact) return exact;
  const partial = CAREER_TRACKS.find(
    (c) => c.name.toLowerCase().includes(lower) || lower.includes(c.name.toLowerCase())
  );
  return partial || CAREER_TRACKS[0];
}
