export interface RoleKeywords {
  role: string;
  requiredSkills: string[];
  recommendedFrameworks: string[];
  coreTools: string[];
  softSkills: string[];
}

export const ROLE_KEYWORD_DICTIONARIES: Record<string, RoleKeywords> = {
  'Software Engineer': {
    role: 'Software Engineer',
    requiredSkills: [
      'Data Structures',
      'Algorithms',
      'Object-Oriented Programming',
      'Operating Systems',
      'DBMS',
      'Computer Networks',
      'System Design',
      'Problem Solving',
      'Code Optimization',
    ],
    recommendedFrameworks: ['Java', 'C++', 'Python', 'Go', 'Spring Boot', 'Node.js', 'REST API', 'GraphQL'],
    coreTools: ['Git', 'GitHub', 'Docker', 'Linux', 'SQL', 'PostgreSQL', 'CI/CD', 'Unit Testing', 'JUnit'],
    softSkills: ['Agile / Scrum', 'Collaboration', 'Analytical Thinking', 'Code Review', 'Communication'],
  },
  'Full Stack Developer': {
    role: 'Full Stack Developer',
    requiredSkills: [
      'JavaScript',
      'TypeScript',
      'HTML5',
      'CSS3',
      'REST APIs',
      'Frontend Architecture',
      'Backend Architecture',
      'Database Modeling',
      'Authentication & Authorization',
    ],
    recommendedFrameworks: [
      'React',
      'Next.js',
      'Node.js',
      'Express',
      'Tailwind CSS',
      'Redux',
      'Prisma',
      'MongoDB',
      'PostgreSQL',
    ],
    coreTools: ['Git', 'Docker', 'Vite', 'Postman', 'Webpack', 'AWS / Vercel', 'Jest', 'NPM'],
    softSkills: ['Product Mindset', 'Cross-functional Collaboration', 'Responsiveness', 'UI/UX Sensitivity'],
  },
  'Data Analyst': {
    role: 'Data Analyst',
    requiredSkills: [
      'SQL',
      'Python',
      'Data Cleaning',
      'Exploratory Data Analysis',
      'Statistical Analysis',
      'Data Visualization',
      'Business Intelligence',
      'Metrics & KPIs',
    ],
    recommendedFrameworks: ['Pandas', 'NumPy', 'Matplotlib', 'Seaborn', 'Power BI', 'Tableau', 'Excel (VLOOKUP, Pivot Tables)'],
    coreTools: ['Jupyter Notebooks', 'Git', 'MySQL', 'Snowflake', 'BigQuery', 'Google Analytics'],
    softSkills: ['Data Storytelling', 'Critical Thinking', 'Business Acumen', 'Stakeholder Presentation'],
  },
  'AI / Machine Learning Engineer': {
    role: 'AI / Machine Learning Engineer',
    requiredSkills: [
      'Machine Learning',
      'Deep Learning',
      'Python',
      'Linear Algebra & Calculus',
      'Natural Language Processing',
      'Computer Vision',
      'Model Evaluation',
      'Feature Engineering',
    ],
    recommendedFrameworks: [
      'PyTorch',
      'TensorFlow',
      'Scikit-Learn',
      'Hugging Face',
      'LangChain',
      'OpenCV',
      'Keras',
      'FastAPI',
    ],
    coreTools: ['CUDA / GPU', 'Jupyter', 'MLflow', 'Docker', 'Weights & Biases', 'ONNX', 'Git'],
    softSkills: ['Research Rigor', 'Experimental Mindset', 'Algorithmic Problem Solving', 'Model Ethics'],
  },
  'Frontend Developer': {
    role: 'Frontend Developer',
    requiredSkills: [
      'JavaScript (ES6+)',
      'TypeScript',
      'HTML5 Semantics',
      'Responsive Web Design',
      'CSS / CSS-in-JS',
      'State Management',
      'Web Performance & Web Vitals',
      'Accessibility (a11y)',
    ],
    recommendedFrameworks: ['React', 'Vue', 'Next.js', 'Tailwind CSS', 'Redux Toolkit', 'Zustand', 'Framer Motion'],
    coreTools: ['Vite', 'Webpack', 'Git', 'Figma', 'Chrome DevTools', 'Jest', 'Playwright'],
    softSkills: ['Design Systems', 'Attention to Detail', 'User Empathy', 'Collaboration'],
  },
  'Backend Developer': {
    role: 'Backend Developer',
    requiredSkills: [
      'RESTful APIs',
      'Microservices',
      'Database Design',
      'Caching & In-Memory Stores',
      'Message Queues',
      'System Architecture',
      'API Security (JWT, OAuth)',
      'Concurrency & Multi-threading',
    ],
    recommendedFrameworks: ['Node.js', 'Express', 'Spring Boot', 'Django / FastAPI', 'Go Gin', 'Redis', 'PostgreSQL', 'Kafka'],
    coreTools: ['Docker', 'Kubernetes', 'Linux', 'Git', 'Postman', 'CI/CD Pipelines', 'AWS / GCP'],
    softSkills: ['System Reliability', 'Scalability Focus', 'Root Cause Analysis', 'Security Mindset'],
  },
  'Cloud & DevOps Engineer': {
    role: 'Cloud & DevOps Engineer',
    requiredSkills: [
      'Cloud Architecture',
      'Infrastructure as Code (IaC)',
      'Containerization',
      'CI/CD Pipelines',
      'Site Reliability Engineering (SRE)',
      'Monitoring & Logging',
      'Linux Administration',
      'Network Security',
    ],
    recommendedFrameworks: ['Terraform', 'Kubernetes (K8s)', 'Docker', 'Ansible', 'Prometheus', 'Grafana', 'ELK Stack'],
    coreTools: ['AWS / Azure / GCP', 'GitLab CI / GitHub Actions', 'Bash Scripting', 'Python', 'Helm', 'Nginx'],
    softSkills: ['Incident Management', 'Automation Mindset', 'Proactive Communication', 'Resilience'],
  },
};

export const STRONG_ACTION_VERBS = [
  'developed',
  'engineered',
  'architected',
  'implemented',
  'optimized',
  'reduced',
  'accelerated',
  'spearheaded',
  'automated',
  'designed',
  'scaled',
  'delivered',
  'migrated',
  'integrated',
  'orchestrated',
];

export interface ATSAnalysisResult {
  targetRole: string;
  atsScore: number;
  matchedKeywords: string[];
  missingKeywords: string[];
  suggestions: string[];
  summary: string;
  sectionBreakdown: {
    skillsMatchPercent: number;
    actionVerbsScore: number;
    quantifiableImpactScore: number;
    formattingScore: number;
  };
}

export function analyzeResumeATS(resumeText: string, targetRole: string): ATSAnalysisResult {
  const normalizedText = (resumeText || '').toLowerCase();
  const dict = ROLE_KEYWORD_DICTIONARIES[targetRole] || ROLE_KEYWORD_DICTIONARIES['Software Engineer'];

  const allTargetKeywords = [
    ...dict.requiredSkills,
    ...dict.recommendedFrameworks,
    ...dict.coreTools,
    ...dict.softSkills,
  ];

  const matchedKeywords: string[] = [];
  const missingKeywords: string[] = [];

  allTargetKeywords.forEach((keyword) => {
    const escaped = keyword.toLowerCase().replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
    const regex = new RegExp(`\\b${escaped}\\b`, 'i');
    if (regex.test(normalizedText) || normalizedText.includes(keyword.toLowerCase())) {
      matchedKeywords.push(keyword);
    } else {
      missingKeywords.push(keyword);
    }
  });

  // Calculate Action Verb Usage
  let actionVerbCount = 0;
  STRONG_ACTION_VERBS.forEach((verb) => {
    if (normalizedText.includes(verb)) {
      actionVerbCount++;
    }
  });
  const actionVerbsScore = Math.min(100, Math.round((actionVerbCount / 6) * 100));

  // Check for quantifiable impact (numbers, percentages, metrics like 40%, 2x, $500, 100ms)
  const numbersCount = (resumeText.match(/\b\d+(\.\d+)?%?|\b\d+x\b/gi) || []).length;
  const quantifiableImpactScore = Math.min(100, Math.round((numbersCount / 5) * 100));

  // Check section presence
  const hasEducation = /education|degree|bachelor|university|college/i.test(resumeText);
  const hasProjects = /projects|portfolio|built|github/i.test(resumeText);
  const hasSkills = /skills|technical skills|proficiencies|technologies/i.test(resumeText);
  const hasExperience = /experience|internship|work|employment/i.test(resumeText);
  let sectionsFound = 0;
  if (hasEducation) sectionsFound++;
  if (hasProjects) sectionsFound++;
  if (hasSkills) sectionsFound++;
  if (hasExperience) sectionsFound++;
  const formattingScore = Math.round((sectionsFound / 4) * 100);

  // Keyword match percentage
  const totalKeywords = allTargetKeywords.length;
  const skillsMatchPercent = totalKeywords > 0 ? Math.round((matchedKeywords.length / totalKeywords) * 100) : 50;

  // Weighted overall ATS score
  // Skills match (50%), Quantifiable Impact (20%), Action Verbs (15%), Formatting & Structure (15%)
  const atsScore = Math.min(
    100,
    Math.max(
      15,
      Math.round(
        skillsMatchPercent * 0.5 +
        quantifiableImpactScore * 0.2 +
        actionVerbsScore * 0.15 +
        formattingScore * 0.15
      )
    )
  );

  // Generate actionable suggestions
  const suggestions: string[] = [];

  if (skillsMatchPercent < 60) {
    suggestions.push(
      `Incorporate essential missing keywords for ${targetRole}: ${missingKeywords.slice(0, 5).join(', ')}.`
    );
  }

  if (quantifiableImpactScore < 60) {
    suggestions.push(
      'Add quantifiable metric outcomes to project bullet points (e.g., "improved latency by 35%", "handled 1,000+ concurrent requests").'
    );
  }

  if (actionVerbsScore < 60) {
    suggestions.push(
      'Begin bullet points with strong power action verbs (e.g., Engineered, Optimized, Architected, Automated) instead of passive descriptions.'
    );
  }

  if (!hasProjects) {
    suggestions.push('Highlight a dedicated "Technical Projects" section featuring links to live deployments and GitHub repositories.');
  }

  if (suggestions.length === 0) {
    suggestions.push('Excellent resume! Ensure font hierarchy is clean and bullet points remain under 2 lines for human recruiters.');
  }

  return {
    targetRole,
    atsScore,
    matchedKeywords,
    missingKeywords,
    suggestions,
    summary:
      atsScore >= 75
        ? `Strong match for ${targetRole} positions with healthy ATS parsing capability.`
        : atsScore >= 50
        ? `Moderate match. Enhancing missing keywords and metric impacts will boost recruiter screening rates.`
        : `Needs immediate optimization to pass automated enterprise ATS applicant tracking filters for ${targetRole}.`,
    sectionBreakdown: {
      skillsMatchPercent,
      actionVerbsScore,
      quantifiableImpactScore,
      formattingScore,
    },
  };
}
