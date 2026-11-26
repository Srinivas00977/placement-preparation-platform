import aptitudeBankRaw from './aptitudeBank.json';
import {
  APTITUDE_SYLLABUS,
  RECOMMENDED_PHASES,
  type AptitudeCategory,
  type AptitudeQuestion,
  type AptitudeSyllabusTopic,
  type AptitudeTopic,
  type PreparationPhase,
} from './aptitudeSyllabus';

export {
  APTITUDE_SYLLABUS,
  RECOMMENDED_PHASES,
  type AptitudeCategory,
  type AptitudeQuestion,
  type AptitudeSyllabusTopic,
  type AptitudeTopic,
  type PreparationPhase,
};

const BANK = aptitudeBankRaw as AptitudeQuestion[];

export const APTITUDE_TOPICS: AptitudeTopic[] = APTITUDE_SYLLABUS.map((topic) => ({
  ...topic,
  questions: BANK.filter((q) => q.topicId === topic.id),
}));
