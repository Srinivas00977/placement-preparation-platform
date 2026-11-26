export interface HrQuestion {
  id: string;
  category: 'Introduction' | 'Behavioral' | 'Motivation' | 'Self-Awareness' | 'Situational';
  companies?: string[];
  question: string;
  interviewerIntent: string;
  starTips: {
    situation: string;
    task: string;
    action: string;
    result: string;
  };
  sampleAnswer: string;
  keyEvaluationCriteria: string[];
}

export const HR_QUESTIONS: HrQuestion[] = [
  {
    id: 'hr_1',
    category: 'Introduction',
    companies: ['Amazon', 'Google', 'TCS', 'Infosys'],
    question: 'Tell me about yourself and walk me through your background.',
    interviewerIntent:
      'Assesses verbal communication, conciseness, confidence, and how effectively you connect your academic/project journey to the role.',
    starTips: {
      situation: 'Briefly mention your degree, branch, and university.',
      task: 'Highlight what sparked your passion for software engineering or technical problem solving.',
      action: 'Summarize 1-2 key projects, internships, leadership roles, or technical competitions.',
      result: 'Conclude by expressing your excitement for this company and how your skills directly align with the open position.',
    },
    sampleAnswer:
      "I am currently a senior computer science student with a strong passion for scalable software development and distributed systems. Throughout my coursework, I've built hands-on full-stack applications, including a real-time collaborative workspace using React, Node.js, and WebSocket, which handled concurrent user edits with optimistic locking. During my summer internship, I helped optimize our API response latency by 35% using Redis caching. What excites me most about your team is your work on high-availability cloud platforms, and I look forward to contributing my problem-solving skills to build reliable products here.",
    keyEvaluationCriteria: ['Conciseness (under 90 seconds)', 'Clarity of communication', 'Technical project relevance', 'Energy and genuine enthusiasm'],
  },
  {
    id: 'hr_2',
    category: 'Self-Awareness',
    companies: ['Deloitte', 'Microsoft', 'Accenture', 'Wipro'],
    question: 'What are your greatest strengths and greatest areas for improvement (weaknesses)?',
    interviewerIntent:
      'Tests authentic self-awareness, emotional intelligence, and proactive commitment to personal and technical growth without giving cliché responses.',
    starTips: {
      situation: 'Pick one authentic technical or collaborative strength and one genuine non-fatal weakness.',
      task: 'Provide a quick concrete example showing your strength in action.',
      action: 'For the weakness, explain the explicit steps and systems you have implemented to tackle it.',
      result: 'Demonstrate measurable improvement in your ongoing projects.',
    },
    sampleAnswer:
      "My greatest strength is systematic debugging and breaking down ambiguous problems into manageable logical components, which helped our capstone team resolve complex state synchronization bugs. For an area of improvement, I used to struggle with public technical demonstrations and hesitating before presenting to large audiences. Recognizing this, I actively joined our university's toastmasters club and volunteered to present our sprint demos every two weeks. This has dramatically built my confidence in articulating technical architecture to both peers and non-technical stakeholders.",
    keyEvaluationCriteria: ['Honest reflection without being self-deprecating', 'Tangible examples', 'Concrete corrective action steps', 'Growth mindset'],
  },
  {
    id: 'hr_3',
    category: 'Behavioral',
    companies: ['Amazon', 'Flipkart', 'Zoho', 'Cognizant'],
    question: 'Describe a challenging situation or conflict with a team member and how you handled it.',
    interviewerIntent:
      'Measures teamwork, emotional maturity, active listening, conflict de-escalation, and collaborative problem-solving.',
    starTips: {
      situation: 'Describe a project team setting where conflicting technical viewpoints or deadline constraints arose.',
      task: 'Explain your shared responsibility to deliver a high-quality product on time.',
      action: 'Detail how you initiated a one-on-one conversation, listened without defensiveness, and evaluated objective trade-offs.',
      result: 'Share the agreed solution and the successful project outcome with intact team harmony.',
    },
    sampleAnswer:
      "During our third-year software engineering project, my teammate and I had a fundamental disagreement regarding whether to use a NoSQL database like MongoDB or a relational PostgreSQL schema. We were falling behind our sprint deadline because of this impasse. Instead of continuing an unproductive debate in team chat, I invited him for a whiteboarding session where we listed our specific query patterns, data relationship cardinality, and ACID requirements side-by-side. Seeing that our domain was strictly relational with heavy transaction dependencies, we mutually agreed on PostgreSQL, while agreeing to use JSONB columns for semi-structured metadata. We delivered the prototype on schedule with zero schema migration headaches, and our collaboration remained strong.",
    keyEvaluationCriteria: ['Objective de-escalation', 'Empathetic listening', 'Focus on product/team outcome over ego', 'Clear STAR adherence'],
  },
  {
    id: 'hr_4',
    category: 'Motivation',
    companies: ['Google', 'Microsoft', 'Oracle', 'Deloitte'],
    question: 'Why do you want to join our company specifically rather than other opportunities?',
    interviewerIntent:
      'Verifies whether you have researched the company deeply and understand their engineering culture, products, and competitive mission.',
    starTips: {
      situation: 'Reference a specific product, architectural milestone, tech stack, or engineering blog post from the company.',
      task: 'Connect that innovation to your personal engineering interests and values.',
      action: 'Explain how your current skill set allows you to ramp up quickly and make a tangible contribution.',
      result: 'Highlight your long-term commitment to growing within the company.',
    },
    sampleAnswer:
      "I have followed your engineering blog closely, particularly your recent post on migrating microservices to Kubernetes while maintaining 99.99% uptime. As someone who has spent the last year studying distributed computing and cloud-native architectures, the engineering rigor your team exhibits is exactly the environment I want to learn from. Furthermore, your product directly impacts millions of users daily, meaning every latency optimization and clean abstraction translates to real human value. I want to bring my strong foundational coding discipline and passion for distributed systems to help scale that mission.",
    keyEvaluationCriteria: ['Specific company knowledge (not generic flattery)', 'Alignment with engineering values', 'Value you can deliver in return', 'Long-term intent'],
  },
  {
    id: 'hr_5',
    category: 'Situational',
    companies: ['TCS', 'Infosys', 'Accenture', 'Zoho'],
    question: 'How do you handle working under tight deadlines or high-pressure situations?',
    interviewerIntent:
      'Assesses prioritization, stress resilience, communication transparency, and methodical execution when unexpected roadblocks happen.',
    starTips: {
      situation: 'Give an example of competing project deadlines, hackathons, or sudden production bugs.',
      task: 'Explain the stakes and the risk of burnout or missed deliverables.',
      action: 'Describe how you prioritized tasks (e.g. Eisenhower matrix), communicated proactively with stakeholders, and eliminated non-essential scope.',
      result: 'State the final deliverable and the lessons implemented for future planning.',
    },
    sampleAnswer:
      "When facing high pressure or compressed timelines, I remain calm by transforming anxiety into structured planning. During our final semester hackathon, an upstream third-party authentication API experienced an outage 4 hours before the submission deadline. Instead of panicking, I gathered the team, quickly scoped down to an internal mock authentication service for demonstration purposes, and divided the remaining testing tasks. By maintaining transparent communication and prioritizing core user flows over edge cases, we submitted on time and ended up winning second place. I carry this calm, structured prioritization into all high-stakes technical situations.",
    keyEvaluationCriteria: ['Stress regulation', 'Prioritization methodology', 'Proactive communication with team', 'Delivery under pressure'],
  },
];

export interface HrQuizQuestion {
  id: string;
  category: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  source?: string;
}

export const HR_QUIZ_BANK: HrQuizQuestion[] = [
  {
    id: 'hrq_1',
    category: 'STAR Method',
    difficulty: 'Easy',
    question: "What does the 'STAR' framework stand for in behavioral interviews?",
    options: ['Situation, Task, Action, Result', 'Summary, Timeline, Approach, Review', 'Strategy, Target, Execution, Result', 'Scope, Team, Analysis, Reflection'],
    correctAnswer: 0,
    explanation: 'STAR structures stories into clear context, goal, personal action, and measurable outcome.',
  },
  {
    id: 'hrq_2',
    category: 'Conflict Resolution',
    difficulty: 'Medium',
    question: 'A teammate disagrees strongly with your API schema during sprint crunch. What is the best action?',
    options: ['Escalate to HR immediately', 'Schedule a brief objective 1-on-1 comparing trade-offs using requirements/data', 'Silently overwrite their code', 'Agree without sharing concerns'],
    correctAnswer: 1,
    explanation: 'Constructive, data-driven 1-on-1 alignment resolves engineering conflicts cleanly.',
  },
  {
    id: 'hrq_3',
    category: 'Handling Deadlines',
    difficulty: 'Medium',
    question: 'Two days before release, you hit a complex blocker that will delay delivery. What should you do?',
    options: ['Hide it until launch day', 'Notify your lead early with root cause, revised ETA, and mitigation options', 'Skip all unit tests silently', 'Blame the requirements team'],
    correctAnswer: 1,
    explanation: 'Early proactive escalation with mitigation plans maintains stakeholder trust.',
  },
  {
    id: 'hrq_4',
    category: 'Self-Awareness',
    difficulty: 'Medium',
    question: "How should you answer 'What is your biggest weakness?' in a placement HR round?",
    options: ["Say 'I work too hard / I am a perfectionist'", 'Share a genuine non-fatal skill gap and concrete steps you use to improve it', 'List a critical core requirement you dislike', "Say 'I have no weaknesses'"],
    correctAnswer: 1,
    explanation: 'Honest self-awareness paired with deliberate improvement systems demonstrates maturity.',
  },
  {
    id: 'hrq_5',
    category: 'Ownership',
    difficulty: 'Medium',
    question: 'You accidentally push a bug that breaks staging right before a client demo. What is your immediate response?',
    options: ['Wait for QA to blame someone else', 'Acknowledge it promptly, revert/fix the commit, and add a regression test', 'Delete the chat message', 'Claim staging environment was faulty'],
    correctAnswer: 1,
    explanation: 'Accountability, fast remediation, and preventive testing reflect strong ownership.',
  },
  {
    id: 'hrq_6',
    category: 'Ethics',
    difficulty: 'Hard',
    question: 'You discover a hardcoded cloud API secret committed to a public repo by a colleague. What do you do?',
    options: ['Post it on social media', 'Alert the colleague and security team immediately, rotate the key, and scrub git history', 'Ignore it since it is not your module', 'Wait until next month'],
    correctAnswer: 1,
    explanation: 'Immediate credential rotation + git history purge prevents security breaches.',
  },
  {
    id: 'hrq_7',
    category: 'Motivation',
    difficulty: 'Easy',
    question: "What makes 'Why do you want to join our company?' answers stand out?",
    options: ['Mentioning salary and free snacks', 'Connecting specific company products/engineering blogs to your verified skills and career goals', "Saying 'My college placed me here'", 'Reading Wikipedia verbatim'],
    correctAnswer: 1,
    explanation: 'Specific engineering/product alignment shows genuine preparation and long-term fit.',
  },
  {
    id: 'hrq_8',
    category: 'Feedback',
    difficulty: 'Easy',
    question: 'Your tech lead notes that your PR code lacks modularity. How do you react?',
    options: ['Take it personally and argue', 'Thank them, ask for concrete refactoring pointers, and apply them consistently', 'Stop submitting PRs', 'Ask someone else to approve blindly'],
    correctAnswer: 1,
    explanation: 'Receptiveness to constructive feedback signals coachability and growth mindset.',
  },
  {
    id: 'hrq_9',
    category: 'Mentorship',
    difficulty: 'Easy',
    question: 'A junior intern struggles with Docker setup before their first ticket. How do you assist?',
    options: ['Tell them to read docs alone', 'Spend 15 minutes pairing with them to walk through the container workflow', 'Complete all their tickets silently', 'Complain to the manager'],
    correctAnswer: 1,
    explanation: 'Enabling teammates through focused pairing builds team velocity and trust.',
  },
  {
    id: 'hrq_10',
    category: 'Prioritization',
    difficulty: 'Medium',
    question: 'Three stakeholders assign urgent requests at the same time. How do you decide priority?',
    options: ['Pick the easiest task randomly', 'Evaluate business impact/deadlines, align with your lead, and set clear ETAs', 'Mute notifications', 'Work secretly on all three'],
    correctAnswer: 1,
    explanation: 'Impact-based triage + transparent alignment prevents misaligned effort.',
  },
  {
    id: 'hrq_11',
    category: 'Adaptability',
    difficulty: 'Medium',
    question: 'Mid-quarter, architecture shifts from REST to GraphQL. How do you respond?',
    options: ['Refuse to learn GraphQL', 'Understand business reasons, upskill quickly via docs/sandbox, and assist migration', 'Ask to transfer immediately', 'Keep building REST secretly'],
    correctAnswer: 1,
    explanation: 'Adaptability to evolving technical needs is critical in agile teams.',
  },
  {
    id: 'hrq_12',
    category: 'Leadership',
    difficulty: 'Medium',
    question: 'Before a team demo, slides look disjointed and teammates look anxious. What shows genuine leadership?',
    options: ['Speak over teammates', 'Organize a dry-run rehearsal, align transitions, and ensure balanced speaking time', 'Submit only your section', 'Tell judges your team failed'],
    correctAnswer: 1,
    explanation: 'Leadership elevates overall team cohesion and clarity.',
  },
  {
    id: 'hrq_13',
    category: 'Negotiation',
    difficulty: 'Hard',
    question: 'How should freshers answer compensation expectation questions gracefully?',
    options: ['Demand double market rate rudely', 'Express excitement for the role and inquire about standard band/growth structure', "Say 'Pay anything'", 'Refuse to answer'],
    correctAnswer: 1,
    explanation: 'Respectful curiosity around band and growth keeps dialogue professional.',
  },
  {
    id: 'hrq_14',
    category: 'Flexibility',
    difficulty: 'Easy',
    question: "How should you respond to 'Are you open to relocating or working hybrid?'",
    options: ['Respond honestly and enthusiastically if flexible, or state real constraints upfront', 'Say yes and quit immediately after joining', 'Ignore the question', 'Demand remote-only angrily'],
    correctAnswer: 0,
    explanation: 'Upfront honesty avoids post-offer friction.',
  },
  {
    id: 'hrq_15',
    category: 'Ambiguity',
    difficulty: 'Hard',
    question: 'A client shares vague specifications for a prototype due Friday. What is your first step?',
    options: ['Guess blindly until Friday', 'Draft clear wireframes/assumptions and schedule a brief confirmation check-in', 'Wait until Thursday night', 'Cancel the deliverable'],
    correctAnswer: 1,
    explanation: 'Proactive assumption validation turns ambiguity into clear scope.',
  },
  {
    id: 'hrq_16',
    category: 'Credibility',
    difficulty: 'Easy',
    question: "When claiming a strength like 'quick learner', what makes interviewers trust it?",
    options: ['Repeating the phrase multiple times', 'Supporting it with concrete project outcomes or quantified metrics', 'Comparing yourself over peers negatively', 'Quoting generic definitions'],
    correctAnswer: 1,
    explanation: 'Real outcomes and numbers back up soft-skill claims.',
  },
  {
    id: 'hrq_17',
    category: 'Failure Reflection',
    difficulty: 'Medium',
    question: "What do recruiters evaluate when asking 'Tell me about a time you failed'?",
    options: ['Zero mistakes ever', 'Honest ownership without blame and concrete habits changed afterward', 'Blaming teammates/professors', 'Trivial excuses'],
    correctAnswer: 1,
    explanation: 'Accountability + behavior improvement reflects maturity.',
  },
  {
    id: 'hrq_18',
    category: 'Stakeholder Communication',
    difficulty: 'Medium',
    question: 'How do you explain a production database outage to a non-technical Product Manager?',
    options: ['Read raw SQL stack traces aloud', 'Communicate customer impact, mitigation ETA, and prevention plan in clear language', 'Say it is too technical', 'Avoid replying'],
    correctAnswer: 1,
    explanation: 'Translating technical issues into user impact and ETA builds cross-team clarity.',
  },
  {
    id: 'hrq_19',
    category: 'Questions to Ask',
    difficulty: 'Easy',
    question: "When asked 'Do you have any questions for us?', what leaves the best impression?",
    options: ['Say everything is clear and leave', 'Ask thoughtful questions about engineering onboarding, team culture, or roadmap', 'Ask about leave days only', "Ask 'Did I get selected?'"],
    correctAnswer: 1,
    explanation: 'Thoughtful questions show curiosity and genuine interest in the team.',
  },
  {
    id: 'hrq_20',
    category: 'Initiative',
    difficulty: 'Medium',
    question: 'You notice your team spends 2 hours weekly manually formatting CSV exports. What shows initiative?',
    options: ['Complain weekly', 'Build and share an automated script saving hours for the whole team', 'Refuse the task', 'Do it manually slower'],
    correctAnswer: 1,
    explanation: 'Automating repetitive toil delivers lasting team leverage.',
  },
];
