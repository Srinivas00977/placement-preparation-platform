export type CourseCategory =
  | 'Languages'
  | 'CS Core'
  | 'Web'
  | 'Data & AI'
  | 'Cloud & Security'
  | 'Mobile / QA / UX';

export type CoursePriority = 'Essential' | 'Recommended' | 'Optional';

export interface CourseYouTubeResource {
  title: string;
  channel: string;
  language: 'English' | 'Hindi' | 'English / Hindi';
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  url: string;
  verifiedStatus: 'Verified Playlist' | 'Topic Search';
  kind: 'tutorial' | 'examples' | 'playlist';
}

export interface CourseDocLink {
  title: string;
  url: string;
  type: 'Docs' | 'Interactive' | 'Tutorial';
}

export interface CourseDay {
  dayNumber: number;
  title: string;
  objectives: string[];
  subtopics: string[];
  simpleExplanation: string;
  codeExample: string;
  estimatedMinutes: number;
  dailyAssignment: string;
  completionCriteria: string;
  youtube: {
    tutorial: CourseYouTubeResource;
    examples: CourseYouTubeResource;
    playlist: CourseYouTubeResource;
  };
  docs: CourseDocLink[];
}

export interface SharedCourse {
  id: string;
  title: string;
  category: CourseCategory;
  durationDays: number;
  shortSummary: string;
  primaryChannel: string;
  primaryLanguage: 'English' | 'Hindi' | 'English / Hindi';
  playlistUrl: string;
  playlistVerified: 'Verified Playlist' | 'Topic Search';
  officialDocsUrl: string;
  docsLabel: string;
  roleTags: Partial<Record<string, CoursePriority>>;
  days: CourseDay[];
}
