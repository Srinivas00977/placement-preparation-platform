export type SkillLevel = 'Beginner' | 'Intermediate' | 'Advanced';

export interface SubtopicResource {
  title: string;
  url: string;
  type: 'Official Docs' | 'Tutorial' | 'Interactive Practice' | 'Sheet / Playlist';
  pricing: 'Free' | 'Freemium';
  level: SkillLevel;
}

export interface SubtopicQuickCheck {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface CareerSubtopic {
  id: string;
  title: string;
  level: SkillLevel;
  estimatedTime: string;
  simpleExplanation: string;
  whyImportant: string;
  whatToLearn: string[];
  prerequisites: string[];
  codeExample?: string;
  completionCriteria: string;
  resources: SubtopicResource[];
  quickCheck?: SubtopicQuickCheck;
}

export interface CareerTopicGroup {
  id: string;
  title: string;
  summary: string;
  subtopics: CareerSubtopic[];
}

export interface CareerPhase {
  phaseNumber: 1 | 2 | 3;
  level: SkillLevel;
  title: string;
  description: string;
  topics: CareerTopicGroup[];
}

export interface CoreSubjectModule {
  id: string;
  title: string;
  badge: string;
  kind: 'Core Subject' | 'Industry Tool';
  summary: string;
  subtopics: CareerSubtopic[];
}

export interface CheatSheetRow {
  item: string;
  syntaxOrRule: string;
  note: string;
}

export interface CheatSheetCard {
  id: string;
  title: string;
  badge: string;
  description: string;
  rows?: CheatSheetRow[];
  codeSnippet?: string;
  bullets?: string[];
}

export interface ProjectDefenseGuide {
  pitch60Sec: string;
  likelyGrillQuestions: string[];
}

export interface CareerProject {
  id: string;
  title: string;
  level: SkillLevel;
  problemStatement: string;
  techStack: string[];
  keyFeatures: string[];
  skillsLearned: string[];
  expectedOutcome: string;
  interviewDefense?: ProjectDefenseGuide;
}

export interface CareerInterviewQA {
  id: string;
  level: 'Basic' | 'Intermediate' | 'Advanced';
  topic: string;
  question: string;
  answer: string;
  talkingPoints?: string[];
  companies?: string[];
}

export interface CareerQuizQuestion {
  id: string;
  career: string;
  topic: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  source?: string;
}

export interface CareerTrack {
  id: string;
  name: string;
  shortTag: string;
  overview: string;
  languages: string[];
  coreSkills: string[];
  tools: string[];
  phases: CareerPhase[];
  coreSubjects: CoreSubjectModule[];
  cheatSheets: CheatSheetCard[];
  projects: CareerProject[];
  interviewQA: CareerInterviewQA[];
  quizBank: CareerQuizQuestion[];
}
