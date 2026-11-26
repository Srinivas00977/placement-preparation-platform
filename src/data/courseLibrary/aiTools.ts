export type AISubjectFilter =
  | 'All'
  | 'Java'
  | 'Python'
  | 'DSA'
  | 'SQL'
  | 'Web Dev'
  | 'Data & ML'
  | 'Cloud'
  | 'UI/UX';

export interface AILearningTool {
  id: string;
  name: string;
  officialUrl: string;
  tier: string;
  purpose: string;
  bestCourses: string[];
  responsibleUseRule: string;
  accentColor: string;
}

export interface AIStudyPromptTemplate {
  id: string;
  subject: Exclude<AISubjectFilter, 'All'>;
  recommendedTool: string;
  title: string;
  prompt: string;
}

export const AI_LEARNING_TOOLS: AILearningTool[] = [
  {
    id: 'ai-chatgpt',
    name: 'ChatGPT (OpenAI)',
    officialUrl: 'https://chatgpt.com',
    tier: 'Free Tier Available',
    purpose: 'Interactive step-by-step concept tutor, code line-by-line walkthroughs, and Socratic interview mock drills.',
    bestCourses: ['DSA Mastery', 'Python', 'Java', 'JavaScript / React', 'SQL'],
    responsibleUseRule: 'Ask ChatGPT to explain WHY an approach fails a boundary case or trace dry-runs rather than pasting full OA solutions blindly.',
    accentColor: 'emerald',
  },
  {
    id: 'ai-gemini',
    name: 'Google Gemini',
    officialUrl: 'https://gemini.google.com',
    tier: 'Free Tier Available',
    purpose: 'Long-context PDF/syllabus breakdown, Google Workspace/Docs note synthesis, and multimodal diagram explanation.',
    bestCourses: ['System Design', 'Generative AI & LLMs', 'Cloud & DevOps', 'OS / DBMS / CN'],
    responsibleUseRule: 'Verify API syntax or cloud IAM snippet suggestions directly against official documentation links before deploying.',
    accentColor: 'cyan',
  },
  {
    id: 'ai-claude',
    name: 'Claude (Anthropic)',
    officialUrl: 'https://claude.ai',
    tier: 'Free Tier Available',
    purpose: 'Clean architecture critique, UI component refactoring, TypeScript type debugging, and technical design trade-off reviews.',
    bestCourses: ['TypeScript & React', 'Node.js & Express', 'Spring Boot', 'System Design'],
    responsibleUseRule: 'Use Claude to critique modularity, race conditions, and security edge cases on code YOU wrote first.',
    accentColor: 'amber',
  },
  {
    id: 'ai-perplexity',
    name: 'Perplexity AI',
    officialUrl: 'https://www.perplexity.ai',
    tier: 'Free Tier Available',
    purpose: 'Citation-backed technical search with direct clickable documentation sources for current frameworks and CVEs.',
    bestCourses: ['Cybersecurity', 'Cloud & DevOps', 'Software Testing', 'ML & Deep Learning'],
    responsibleUseRule: 'Always click through the numbered web citations to confirm version-specific flags in official docs.',
    accentColor: 'cyan',
  },
  {
    id: 'ai-copilot',
    name: 'GitHub Copilot',
    officialUrl: 'https://github.com/features/copilot',
    tier: 'Free Student Pack / Free Tier',
    purpose: 'In-editor autocomplete for repetitive unit tests, boilerplate interfaces, and inline regex/SQL explanations.',
    bestCourses: ['Full Stack Web', 'Java', 'Python', 'Selenium / Playwright'],
    responsibleUseRule: 'Audit every suggested SQL/auth line for injection flaws or off-by-one loops before accepting.',
    accentColor: 'emerald',
  },
  {
    id: 'ai-notebooklm',
    name: 'Google NotebookLM',
    officialUrl: 'https://notebooklm.google.com',
    tier: '100% Free',
    purpose: 'Upload your PlacePilot downloaded PDFs or lecture notes cleanly to generate grounded flashcards, audio overviews, and study guides.',
    bestCourses: ['DBMS', 'Operating Systems', 'Computer Networks', 'Complete Career Packs'],
    responsibleUseRule: 'Best used atop exported PlacePilot PDF packs so answers stay strictly grounded in your verified syllabus.',
    accentColor: 'amber',
  },
  {
    id: 'ai-cursor',
    name: 'Cursor AI Editor',
    officialUrl: 'https://www.cursor.com',
    tier: 'Freemium IDE',
    purpose: 'Multi-file codebase understanding, architectural refactors, and debugging compiler/test failures across project repos.',
    bestCourses: ['React & TypeScript', 'Node.js & Express', 'Spring Boot', 'MLOps'],
    responsibleUseRule: 'Inspect git diffs carefully hunk-by-hunk and write automated tests verifying every generated change.',
    accentColor: 'cyan',
  },
];

export const AI_STUDY_PROMPTS: AIStudyPromptTemplate[] = [
  {
    id: 'pr-java',
    subject: 'Java',
    recommendedTool: 'ChatGPT / Gemini',
    title: 'Trace Java Collections & Memory Internals',
    prompt: 'Act as a Senior Java Interviewer. Explain [TOPIC, e.g., HashMap resize + equals/hashCode contract] with a visual memory example, 1 tricky output prediction question, and 2 common campus interview follow-ups. Wait for my answer before showing solutions.',
  },
  {
    id: 'pr-python',
    subject: 'Python',
    recommendedTool: 'ChatGPT / Claude',
    title: 'Spot Pythonic Mistakes & Complexity',
    prompt: 'Review my Python function below for [TOPIC]. Point out hidden mutability bugs, O(N) vs O(1) lookup improvements using collections/sets, and show a clean @dataclass or generator refactor without changing external behavior:\n[PASTE YOUR CODE]',
  },
  {
    id: 'pr-dsa',
    subject: 'DSA',
    recommendedTool: 'ChatGPT / Gemini',
    title: 'Socratic DSA Pattern Coach (Hints First, No Spoilers)',
    prompt: 'I am practicing the [PATTERN, e.g., Sliding Window / Binary Search on Answer] pattern for interviews. Give me a Medium placement problem description and 3 progressive hints ONLY. Wait for me to explain my approach and time complexity before reviewing my code.',
  },
  {
    id: 'pr-sql',
    subject: 'SQL',
    recommendedTool: 'ChatGPT / Perplexity',
    title: 'SQL Window Function & Execution Order Drill',
    prompt: 'Create a realistic sample schema with 2 small tables (5 rows each) and give me 3 progressive SQL challenges testing [TOPIC, e.g., LEFT JOIN + GROUP BY/HAVING + DENSE_RANK]. Do NOT print answers until I submit my queries for review.',
  },
  {
    id: 'pr-web',
    subject: 'Web Dev',
    recommendedTool: 'Claude / Cursor',
    title: 'Debug React Re-Renders, Async Race & Auth Security',
    prompt: 'Act as a Staff Frontend/Full-Stack Engineer. Review this React + TypeScript snippet for stale closures, missing useEffect cleanups, unnecessary re-renders, accessibility (ARIA), and XSS/CSRF flaws:\n[PASTE COMPONENT]',
  },
  {
    id: 'pr-ml',
    subject: 'Data & ML',
    recommendedTool: 'Gemini / Perplexity',
    title: 'Audit Data Leakage & Metric Choice',
    prompt: 'Evaluate my ML/Analytics pipeline idea for [PROJECT / TOPIC]: check for train-test leakage, temporal validation mistakes, class-imbalance metric traps (Accuracy vs PR-AUC), and ask me 3 tough Data Science interview grill questions.',
  },
  {
    id: 'pr-cloud',
    subject: 'Cloud',
    recommendedTool: 'Perplexity / Gemini',
    title: 'Troubleshoot Docker, K8s & IAM Least-Privilege',
    prompt: 'Give me a realistic production failure scenario on [TOPIC, e.g., Kubernetes CrashLoopBackOff / Readiness Probe / AWS VPC private subnet 502] and walk me step-by-step through CLI diagnostic commands (`kubectl describe`, `logs`, `ss`, `curl`) to find the root cause.',
  },
  {
    id: 'pr-ux',
    subject: 'UI/UX',
    recommendedTool: 'Claude / Gemini',
    title: 'WCAG Accessibility & UX Law Critique',
    prompt: 'Critique my screen design flow for [SCREEN, e.g., Mobile Checkout / SaaS Onboarding] against WCAG 2.1 AA contrast rules, Hick’s Law, Fitts’s Law, and missing UI states (Empty, Loading, Error, Long-Text truncation). Suggest 3 concrete improvements.',
  },
];

export function buildSubtopicAIPrompt(career: string, topic: string, subtopic: string): string {
  return `Act as a senior ${career} interviewer. Explain "${subtopic}" (under ${topic}) in simple intuition first, give 1 realistic interview edge case, and quiz me with 1 question without giving away the answer immediately.`;
}
