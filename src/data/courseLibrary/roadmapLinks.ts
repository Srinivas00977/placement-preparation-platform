export interface RoadmapShLink {
  url: string;
  label: string;
}

const COURSE_ROADMAP_SH: Record<string, RoadmapShLink> = {
  'course-dsa': { url: 'https://roadmap.sh/datastructures-and-algorithms', label: 'DSA Roadmap' },
  'course-java': { url: 'https://roadmap.sh/java', label: 'Java Roadmap' },
  'course-python': { url: 'https://roadmap.sh/python', label: 'Python Roadmap' },
  'course-sql': { url: 'https://roadmap.sh/sql', label: 'SQL Roadmap' },
  'course-javascript': { url: 'https://roadmap.sh/javascript', label: 'JavaScript Roadmap' },
  'course-typescript': { url: 'https://roadmap.sh/typescript', label: 'TypeScript Roadmap' },
  'course-cpp': { url: 'https://roadmap.sh/cpp', label: 'C++ Roadmap' },
  'course-c': { url: 'https://roadmap.sh/computer-science', label: 'Computer Science Roadmap' },
  'course-kotlin': { url: 'https://roadmap.sh/android', label: 'Android / Kotlin Roadmap' },
  'course-dart': { url: 'https://roadmap.sh/flutter', label: 'Flutter / Dart Roadmap' },
  'course-go': { url: 'https://roadmap.sh/golang', label: 'Go Roadmap' },
  'course-rust': { url: 'https://roadmap.sh/rust', label: 'Rust Roadmap' },
  'course-php': { url: 'https://roadmap.sh/php', label: 'PHP Roadmap' },
  'course-ruby': { url: 'https://roadmap.sh/backend', label: 'Backend / Ruby Roadmap' },
  'course-swift': { url: 'https://roadmap.sh/ios', label: 'iOS / Swift Roadmap' },
  'course-r': { url: 'https://roadmap.sh/ai-data-scientist', label: 'Data Science / R Roadmap' },
  'course-oop': { url: 'https://roadmap.sh/software-design-architecture', label: 'Software Design Roadmap' },
  'course-dbms': { url: 'https://roadmap.sh/postgresql-dba', label: 'Database & DBA Roadmap' },
  'course-os': { url: 'https://roadmap.sh/computer-science', label: 'CS Core / OS Roadmap' },
  'course-cn': { url: 'https://roadmap.sh/computer-science', label: 'CS Core / Networks Roadmap' },
  'course-sysdesign': { url: 'https://roadmap.sh/system-design', label: 'System Design Roadmap' },
  'course-git': { url: 'https://roadmap.sh/git-github', label: 'Git & GitHub Roadmap' },
  'course-linux': { url: 'https://roadmap.sh/linux', label: 'Linux Roadmap' },
  'course-frontend': { url: 'https://roadmap.sh/frontend', label: 'Frontend Roadmap' },
  'course-react': { url: 'https://roadmap.sh/react', label: 'React Roadmap' },
  'course-node': { url: 'https://roadmap.sh/nodejs', label: 'Node.js Roadmap' },
  'course-spring': { url: 'https://roadmap.sh/spring-boot', label: 'Spring Boot Roadmap' },
  'course-analytics': { url: 'https://roadmap.sh/data-analyst', label: 'Data Analyst Roadmap' },
  'course-ml': { url: 'https://roadmap.sh/machine-learning', label: 'Machine Learning Roadmap' },
  'course-genai': { url: 'https://roadmap.sh/ai-engineer', label: 'AI & RAG Engineer Roadmap' },
  'course-cloud': { url: 'https://roadmap.sh/devops', label: 'DevOps & Cloud Roadmap' },
  'course-security': { url: 'https://roadmap.sh/cyber-security', label: 'Cybersecurity Roadmap' },
  'course-qa': { url: 'https://roadmap.sh/qa', label: 'QA Engineer Roadmap' },
  'course-uiux': { url: 'https://roadmap.sh/ux-design', label: 'UX Design Roadmap' },
};

const CAREER_ROADMAP_SH: Record<string, RoadmapShLink> = {
  'career-sde': { url: 'https://roadmap.sh/computer-science', label: 'CS & SDE Roadmap' },
  'career-fullstack': { url: 'https://roadmap.sh/full-stack', label: 'Full Stack Roadmap' },
  'career-data-analyst': { url: 'https://roadmap.sh/data-analyst', label: 'Data Analyst Roadmap' },
  'career-aiml': { url: 'https://roadmap.sh/ai-engineer', label: 'AI & ML Engineer Roadmap' },
  'career-datascientist': { url: 'https://roadmap.sh/ai-data-scientist', label: 'Data Scientist Roadmap' },
  'career-frontend': { url: 'https://roadmap.sh/frontend', label: 'Frontend Developer Roadmap' },
  'career-backend': { url: 'https://roadmap.sh/backend', label: 'Backend Developer Roadmap' },
  'career-devops': { url: 'https://roadmap.sh/devops', label: 'DevOps Engineer Roadmap' },
  'career-security': { url: 'https://roadmap.sh/cyber-security', label: 'Cybersecurity Roadmap' },
  'career-mobile': { url: 'https://roadmap.sh/android', label: 'Mobile Developer Roadmap' },
  'career-qa': { url: 'https://roadmap.sh/qa', label: 'QA Engineer Roadmap' },
  'career-uiux': { url: 'https://roadmap.sh/ux-design', label: 'UX Design Roadmap' },
};

export function getRoadmapShLink(courseId?: string, careerId?: string): RoadmapShLink {
  if (courseId && COURSE_ROADMAP_SH[courseId]) {
    return COURSE_ROADMAP_SH[courseId];
  }
  if (careerId && CAREER_ROADMAP_SH[careerId]) {
    return CAREER_ROADMAP_SH[careerId];
  }
  return { url: 'https://roadmap.sh/roadmaps', label: 'Developer Roadmaps' };
}
