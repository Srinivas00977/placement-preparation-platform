import aptitudeBankRaw from './aptitudeBank.json';

export interface TestCaseItem {
  input: string;
  expectedOutput: string;
}

export interface AssessmentQuestion {
  id: string;
  section: 'aptitude' | 'coding' | 'technical' | 'hr';
  sectionTitle: string;
  question: string;
  options?: string[];
  correctAnswer?: number; // 0-indexed for MCQ
  topic: string;
  explanation: string;
  questionType: 'mcq' | 'coding';
  role?: string;
  starterCode?: {
    python: string;
    javascript: string;
    cpp?: string;
    java?: string;
    c?: string;
  };
  testCases?: TestCaseItem[];
}

export const TARGET_JOB_ROLES = [
  'Software Engineer (SDE)',
  'Full Stack Developer',
  'Data Analyst',
  'AI / Machine Learning Engineer',
  'Data Scientist',
  'Frontend Developer',
  'Backend Developer',
  'Cloud & DevOps Engineer',
  'Cybersecurity Analyst',
  'Mobile App Developer (Android / Flutter)',
  'QA / Automation Test Engineer',
  'UI / UX Designer',
] as const;

export type TargetJobRole = (typeof TARGET_JOB_ROLES)[number];

// ============================================================================
// 1. APTITUDE & LOGICAL REASONING MCQs
// ============================================================================
export const APTITUDE_QUESTIONS: AssessmentQuestion[] = [
  {
    id: 'apt_1',
    section: 'aptitude',
    sectionTitle: 'Aptitude & Logic',
    topic: 'Time and Work',
    question: 'A can finish a task in 12 days and B in 24 days. Working together, in how many days will they finish the same task?',
    options: ['6 days', '8 days', '10 days', '18 days'],
    correctAnswer: 1,
    explanation: '1/12 + 1/24 = 3/24 = 1/8 work per day. Total required = 8 days.',
    questionType: 'mcq',
  },
  {
    id: 'apt_2',
    section: 'aptitude',
    sectionTitle: 'Aptitude & Logic',
    topic: 'Profit and Loss',
    question: 'A trader sells an article for $480 incurring a 20% loss. At what price must he sell it to gain 20% profit?',
    options: ['$600', '$640', '$720', '$750'],
    correctAnswer: 2,
    explanation: 'Cost Price = 480 / 0.8 = $600. For 20% profit, Selling Price = 600 * 1.2 = $720.',
    questionType: 'mcq',
  },
  {
    id: 'apt_3',
    section: 'aptitude',
    sectionTitle: 'Aptitude & Logic',
    topic: 'Number Series',
    question: 'Find the next number in the sequence: 4, 9, 25, 49, 121, ?',
    options: ['144', '169', '196', '225'],
    correctAnswer: 1,
    explanation: 'The sequence consists of squares of consecutive prime numbers: 2², 3², 5², 7², 11², so the next is 13² = 169.',
    questionType: 'mcq',
  },
  {
    id: 'apt_4',
    section: 'aptitude',
    sectionTitle: 'Aptitude & Logic',
    topic: 'Blood Relations',
    question: 'Pointing to a gentleman, Deepak said, "His only brother is the father of my daughter\'s father." How is the gentleman related to Deepak?',
    options: ['Father', 'Uncle', 'Grandfather', 'Brother-in-law'],
    correctAnswer: 1,
    explanation: "Deepak's daughter's father is Deepak himself. Deepak's father is the gentleman's brother. Thus, the gentleman is Deepak's Uncle.",
    questionType: 'mcq',
  },
  {
    id: 'apt_5',
    section: 'aptitude',
    sectionTitle: 'Aptitude & Logic',
    topic: 'Speed & Distance',
    question: 'A train 200m long traveling at 72 km/h crosses a bridge in 20 seconds. What is the length of the bridge?',
    options: ['180m', '200m', '220m', '250m'],
    correctAnswer: 1,
    explanation: '72 km/h = 20 m/s. Total distance in 20s = 20 * 20 = 400m. Bridge length = 400 - 200 = 200m.',
    questionType: 'mcq',
  },
  {
    id: 'apt_6',
    section: 'aptitude',
    sectionTitle: 'Aptitude & Logic',
    topic: 'Percentages',
    question: 'If the price of a commodity increases by 25%, by what percent must a family reduce consumption to keep expenditure constant?',
    options: ['15%', '20%', '25%', '30%'],
    correctAnswer: 1,
    explanation: 'Reduction % = [r / (100 + r)] * 100 = (25 / 125) * 100 = 20%.',
    questionType: 'mcq',
  },
  {
    id: 'apt_7',
    section: 'aptitude',
    sectionTitle: 'Aptitude & Logic',
    topic: 'Probability',
    question: 'Two unbiased dice are thrown together. What is the probability of getting a total score of 8?',
    options: ['5/36', '1/6', '7/36', '1/9'],
    correctAnswer: 0,
    explanation: 'Favorable pairs: (2,6), (3,5), (4,4), (5,3), (6,2) = 5 outcomes. Total = 36. Probability = 5/36.',
    questionType: 'mcq',
  },
  {
    id: 'apt_8',
    section: 'aptitude',
    sectionTitle: 'Aptitude & Logic',
    topic: 'Coding-Decoding',
    question: 'If "LIGHT" is coded as "MJHIU" in a certain language, how is "FRAME" coded in the same pattern?',
    options: ['GSBNF', 'GSBNF', 'GSBOD', 'GTBNF'],
    correctAnswer: 0,
    explanation: 'Each character is shifted by +1: F->G, R->S, A->B, M->N, E->F => GSBNF.',
    questionType: 'mcq',
  },
];

// ============================================================================
// 2. ROLE-SPECIFIC TECHNICAL MCQs (4 for each of the 12 Roles)
// ============================================================================
export const ROLE_TECHNICAL_QUESTIONS: Record<string, AssessmentQuestion[]> = {
  'Software Engineer (SDE)': [
    {
      id: 'sde_1',
      section: 'technical',
      sectionTitle: 'Technical Core',
      role: 'Software Engineer (SDE)',
      topic: 'Operating Systems',
      question: 'Which of the following conditions is NOT required for a deadlock to occur?',
      options: ['Mutual Exclusion', 'Hold and Wait', 'Preemption', 'Circular Wait'],
      correctAnswer: 2,
      explanation: 'Deadlock requires No Preemption. If preemption is allowed, deadlocks cannot persist.',
      questionType: 'mcq',
    },
    {
      id: 'sde_2',
      section: 'technical',
      sectionTitle: 'Technical Core',
      role: 'Software Engineer (SDE)',
      topic: 'Database Systems',
      question: 'Which normal form eliminates transitive functional dependencies of non-prime attributes?',
      options: ['1NF', '2NF', '3NF', 'BCNF'],
      correctAnswer: 2,
      explanation: '3NF requires that the relation is in 2NF and contains no transitive functional dependencies.',
      questionType: 'mcq',
    },
    {
      id: 'sde_3',
      section: 'technical',
      sectionTitle: 'Technical Core',
      role: 'Software Engineer (SDE)',
      topic: 'Computer Networks',
      question: 'Which protocol works at the Transport layer to provide reliable, ordered byte-stream delivery?',
      options: ['UDP', 'TCP', 'IP', 'ICMP'],
      correctAnswer: 1,
      explanation: 'TCP guarantees sequence ordering, retransmissions, and flow control.',
      questionType: 'mcq',
    },
    {
      id: 'sde_4',
      section: 'technical',
      sectionTitle: 'Technical Core',
      role: 'Software Engineer (SDE)',
      topic: 'Data Structures',
      question: 'What is the worst-case time complexity of searching in an AVL tree with N nodes?',
      options: ['O(1)', 'O(log N)', 'O(N)', 'O(N log N)'],
      correctAnswer: 1,
      explanation: 'AVL trees are strictly height-balanced, guaranteeing O(log N) worst-case height and search time.',
      questionType: 'mcq',
    },
  ],
  'Full Stack Developer': [
    {
      id: 'fs_1',
      section: 'technical',
      sectionTitle: 'Technical Core',
      role: 'Full Stack Developer',
      topic: 'REST APIs',
      question: 'Which HTTP status code should be returned after a new database record is created via POST?',
      options: ['200 OK', '201 Created', '204 No Content', '302 Found'],
      correctAnswer: 1,
      explanation: '201 Created signals successful generation of a new URI resource.',
      questionType: 'mcq',
    },
    {
      id: 'fs_2',
      section: 'technical',
      sectionTitle: 'Technical Core',
      role: 'Full Stack Developer',
      topic: 'State Management',
      question: 'Which React hook should you use to run asynchronous side effects such as data fetching?',
      options: ['useState', 'useEffect', 'useMemo', 'useCallback'],
      correctAnswer: 1,
      explanation: 'useEffect handles component lifecycle mutations, network calls, and subscriptions.',
      questionType: 'mcq',
    },
    {
      id: 'fs_3',
      section: 'technical',
      sectionTitle: 'Technical Core',
      role: 'Full Stack Developer',
      topic: 'Security & Auth',
      question: 'Where is the cryptographic verification signature stored in a JSON Web Token (JWT)?',
      options: ['Header', 'Payload', 'Third segment (Signature)', 'Cookie Domain'],
      correctAnswer: 2,
      explanation: 'A JWT is structured as header.payload.signature, where signature validates authenticity.',
      questionType: 'mcq',
    },
    {
      id: 'fs_4',
      section: 'technical',
      sectionTitle: 'Technical Core',
      role: 'Full Stack Developer',
      topic: 'WebSockets',
      question: 'Which header initiates protocol upgrade from HTTP to full-duplex WebSocket?',
      options: ['Upgrade: websocket', 'Connection: keep-alive', 'Content-Type: stream', 'Accept: binary'],
      correctAnswer: 0,
      explanation: 'The initial HTTP request contains Upgrade: websocket and Connection: Upgrade.',
      questionType: 'mcq',
    },
  ],
  'Data Analyst': [
    {
      id: 'da_1',
      section: 'technical',
      sectionTitle: 'Technical Core',
      role: 'Data Analyst',
      topic: 'SQL Window Functions',
      question: 'Which SQL function assigns continuous sequential integers from 1 without skipping numbers?',
      options: ['RANK()', 'DENSE_RANK()', 'ROW_NUMBER()', 'LEAD()'],
      correctAnswer: 2,
      explanation: 'ROW_NUMBER() produces strictly sequential numbers regardless of duplicate values.',
      questionType: 'mcq',
    },
    {
      id: 'da_2',
      section: 'technical',
      sectionTitle: 'Technical Core',
      role: 'Data Analyst',
      topic: 'Python Pandas',
      question: 'In Pandas, which method returns summary statistics (count, mean, standard deviation, quartiles)?',
      options: ['df.info()', 'df.describe()', 'df.summary()', 'df.stats()'],
      correctAnswer: 1,
      explanation: 'describe() generates descriptive statistics for numerical columns in a DataFrame.',
      questionType: 'mcq',
    },
    {
      id: 'da_3',
      section: 'technical',
      sectionTitle: 'Technical Core',
      role: 'Data Analyst',
      topic: 'Statistics',
      question: 'Which metric of central tendency is least distorted by extreme outliers in a heavily skewed dataset?',
      options: ['Mean', 'Median', 'Mode', 'Variance'],
      correctAnswer: 1,
      explanation: 'The Median represents the 50th percentile rank and is unaffected by high or low outliers.',
      questionType: 'mcq',
    },
    {
      id: 'da_4',
      section: 'technical',
      sectionTitle: 'Technical Core',
      role: 'Data Analyst',
      topic: 'Data Visualization',
      question: 'Which chart type is most effective for displaying the five-number summary and outliers of a continuous variable?',
      options: ['Pie Chart', 'Box Plot', 'Scatter Plot', 'Bar Chart'],
      correctAnswer: 1,
      explanation: 'Box plots display min, Q1, median, Q3, and max along with isolated outlier points.',
      questionType: 'mcq',
    },
  ],
  'AI / Machine Learning Engineer': [
    {
      id: 'aiml_1',
      section: 'technical',
      sectionTitle: 'Technical Core',
      role: 'AI / Machine Learning Engineer',
      topic: 'Optimization',
      question: 'Which optimizer computes adaptive learning rates using running averages of past gradients and squared gradients?',
      options: ['SGD', 'Adam', 'AdaGrad', 'RMSprop'],
      correctAnswer: 1,
      explanation: 'Adam combines the advantages of AdaGrad (scaling) and RMSProp (momentum).',
      questionType: 'mcq',
    },
    {
      id: 'aiml_2',
      section: 'technical',
      sectionTitle: 'Technical Core',
      role: 'AI / Machine Learning Engineer',
      topic: 'Regularization',
      question: 'What is the characteristic property of L1 (Lasso) regularization compared to L2 (Ridge)?',
      options: ['L1 produces sparse models by zeroing weights', 'L2 zeroes out features', 'L1 prevents underfitting', 'L2 increases variance'],
      correctAnswer: 0,
      explanation: 'L1 regularization applies an absolute penalty driving non-essential coefficients to zero.',
      questionType: 'mcq',
    },
    {
      id: 'aiml_3',
      section: 'technical',
      sectionTitle: 'Technical Core',
      role: 'AI / Machine Learning Engineer',
      topic: 'Neural Networks',
      question: 'Why is ReLU (Rectified Linear Unit) predominantly favored over Sigmoid in deep feedforward networks?',
      options: ['Prevents vanishing gradients for positive inputs', 'Outputs values between -1 and +1', 'Produces zero mean activations', 'Has non-linear derivative at zero'],
      correctAnswer: 0,
      explanation: 'ReLU gradient is constant 1 for positive activations, mitigating vanishing gradient issues during backprop.',
      questionType: 'mcq',
    },
    {
      id: 'aiml_4',
      section: 'technical',
      sectionTitle: 'Technical Core',
      role: 'AI / Machine Learning Engineer',
      topic: 'Evaluation Metrics',
      question: 'For severely imbalanced datasets (e.g. 99.8% negatives in fraud detection), which metric is most reliable?',
      options: ['Raw Accuracy', 'Precision-Recall AUC', 'Mean Absolute Error', 'Root Mean Squared Error'],
      correctAnswer: 1,
      explanation: 'PR-AUC focuses on minority class predictions without being inflated by true negatives.',
      questionType: 'mcq',
    },
  ],
  'Data Scientist': [
    {
      id: 'ds_1',
      section: 'technical',
      sectionTitle: 'Technical Core',
      role: 'Data Scientist',
      topic: 'Hypothesis Testing',
      question: 'What does a p-value of 0.01 indicate when tested against a significance threshold of alpha = 0.05?',
      options: ['Fail to reject null hypothesis', 'Statistically significant evidence to reject null hypothesis', 'Hypothesis is provably false', 'Sample size is insufficient'],
      correctAnswer: 1,
      explanation: 'p < 0.05 indicates the observed outcome is unlikely to have occurred under the null hypothesis by chance.',
      questionType: 'mcq',
    },
    {
      id: 'ds_2',
      section: 'technical',
      sectionTitle: 'Technical Core',
      role: 'Data Scientist',
      topic: 'Regression',
      question: 'Which violation occurs when the error terms of a linear regression exhibit non-constant variance?',
      options: ['Multicollinearity', 'Heteroscedasticity', 'Autocorrelation', 'Endogeneity'],
      correctAnswer: 1,
      explanation: 'Heteroscedasticity denotes unequal residual variance across range of independent variables.',
      questionType: 'mcq',
    },
    {
      id: 'ds_3',
      section: 'technical',
      sectionTitle: 'Technical Core',
      role: 'Data Scientist',
      topic: 'Dimensionality Reduction',
      question: 'In Principal Component Analysis (PCA), what do the eigenvectors of the data covariance matrix define?',
      options: ['Axes of maximum variance', 'Cluster centroids', 'Decision trees', 'Loss gradients'],
      correctAnswer: 0,
      explanation: 'Eigenvectors determine the principal orthogonal directions of maximal variance.',
      questionType: 'mcq',
    },
    {
      id: 'ds_4',
      section: 'technical',
      sectionTitle: 'Technical Core',
      role: 'Data Scientist',
      topic: 'Ensemble Learning',
      question: 'What bootstrap aggregation technique does Random Forest apply over individual decision trees?',
      options: ['Boosting', 'Bagging', 'Stacking', 'Cross-Validation'],
      correctAnswer: 1,
      explanation: 'Random Forest trains decision trees independently on bootstrap subsets (bagging) with random feature selection.',
      questionType: 'mcq',
    },
  ],
  'Frontend Developer': [
    {
      id: 'fe_1',
      section: 'technical',
      sectionTitle: 'Technical Core',
      role: 'Frontend Developer',
      topic: 'JavaScript Engine',
      question: 'Which queue handles Promise resolutions (.then / async await) in the JavaScript Event Loop?',
      options: ['Macrotask Queue', 'Microtask Queue', 'Animation Frame Queue', 'Direct Call Stack'],
      correctAnswer: 1,
      explanation: 'Promise callbacks execute in the Microtask queue immediately after the current script stack clears.',
      questionType: 'mcq',
    },
    {
      id: 'fe_2',
      section: 'technical',
      sectionTitle: 'Technical Core',
      role: 'Frontend Developer',
      topic: 'CSS Architecture',
      question: 'In CSS Flexbox, what property aligns items along the cross-axis?',
      options: ['justify-content', 'align-items', 'flex-direction', 'align-content'],
      correctAnswer: 1,
      explanation: 'justify-content aligns on the main axis; align-items aligns on the cross axis.',
      questionType: 'mcq',
    },
    {
      id: 'fe_3',
      section: 'technical',
      sectionTitle: 'Technical Core',
      role: 'Frontend Developer',
      topic: 'React Optimization',
      question: 'Which higher-order component memoizes a React component to prevent re-renders when props are shallowly equal?',
      options: ['React.memo', 'useMemo', 'useCallback', 'useRef'],
      correctAnswer: 0,
      explanation: 'React.memo skips rendering if incoming props have not changed between renders.',
      questionType: 'mcq',
    },
    {
      id: 'fe_4',
      section: 'technical',
      sectionTitle: 'Technical Core',
      role: 'Frontend Developer',
      topic: 'DOM Architecture',
      question: 'What is event delegation in client-side JavaScript?',
      options: ['Attaching one listener to a parent to catch bubbled events from children', 'Attaching listeners to every element individually', 'Canceling event bubbling with stopPropagation', 'Preventing default form submission'],
      correctAnswer: 0,
      explanation: 'Event delegation leverages event bubbling to handle child events efficiently at the parent level.',
      questionType: 'mcq',
    },
  ],
  'Backend Developer': [
    {
      id: 'be_1',
      section: 'technical',
      sectionTitle: 'Technical Core',
      role: 'Backend Developer',
      topic: 'Database Transactions',
      question: 'What does the "I" represent in database ACID transaction properties?',
      options: ['Integrity', 'Isolation', 'Immutability', 'Indexing'],
      correctAnswer: 1,
      explanation: 'Isolation guarantees concurrent transactions execute as if serialized.',
      questionType: 'mcq',
    },
    {
      id: 'be_2',
      section: 'technical',
      sectionTitle: 'Technical Core',
      role: 'Backend Developer',
      topic: 'Caching',
      question: 'Which cache eviction policy discards the element that has not been read for the longest period of time?',
      options: ['FIFO', 'LRU (Least Recently Used)', 'LFU', 'Random'],
      correctAnswer: 1,
      explanation: 'LRU tracks access timestamps and purges the oldest accessed entry.',
      questionType: 'mcq',
    },
    {
      id: 'be_3',
      section: 'technical',
      sectionTitle: 'Technical Core',
      role: 'Backend Developer',
      topic: 'Message Queues',
      question: 'Which architecture decouples producers from consumers using asynchronous topics and partitions?',
      options: ['Synchronous REST', 'Message Broker (e.g. Apache Kafka)', 'gRPC streaming', 'GraphQL subscription'],
      correctAnswer: 1,
      explanation: 'Distributed message brokers buffer events, allowing publishers and subscribers to scale independently.',
      questionType: 'mcq',
    },
    {
      id: 'be_4',
      section: 'technical',
      sectionTitle: 'Technical Core',
      role: 'Backend Developer',
      topic: 'Database Indexing',
      question: 'What tree data structure is most commonly employed for primary and secondary indexes in PostgreSQL and MySQL InnoDB?',
      options: ['B+ Tree', 'Binary Search Tree', 'Trie', 'Red-Black Tree'],
      correctAnswer: 0,
      explanation: 'B+ Trees provide balanced depth, high fan-out, and continuous leaf links for high-speed range queries.',
      questionType: 'mcq',
    },
  ],
  'Cloud & DevOps Engineer': [
    {
      id: 'cd_1',
      section: 'technical',
      sectionTitle: 'Technical Core',
      role: 'Cloud & DevOps Engineer',
      topic: 'Containerization',
      question: 'What Linux kernel subsystems provide process isolation and resource limits for Docker containers?',
      options: ['Namespaces and cgroups', 'Systemd and cron', 'Iptables and firewalld', 'Swap and chroot'],
      correctAnswer: 0,
      explanation: 'Namespaces isolate processes, network, and filesystems; cgroups control CPU and memory usage.',
      questionType: 'mcq',
    },
    {
      id: 'cd_2',
      section: 'technical',
      sectionTitle: 'Technical Core',
      role: 'Cloud & DevOps Engineer',
      topic: 'Kubernetes',
      question: 'Which Kubernetes controller ensures that all (or some) nodes run exactly one copy of a Pod?',
      options: ['Deployment', 'DaemonSet', 'StatefulSet', 'Job'],
      correctAnswer: 1,
      explanation: 'DaemonSets deploy monitor, logging, or proxy agents onto every cluster node.',
      questionType: 'mcq',
    },
    {
      id: 'cd_3',
      section: 'technical',
      sectionTitle: 'Technical Core',
      role: 'Cloud & DevOps Engineer',
      topic: 'CI/CD Pipelines',
      question: 'What differentiates Continuous Deployment from Continuous Delivery?',
      options: ['Continuous Deployment automatically releases passing changes directly to production without manual gate', 'Continuous Delivery does not run tests', 'Continuous Deployment requires manual sign-off', 'They are synonymous'],
      correctAnswer: 0,
      explanation: 'Deployment automates the final production release, whereas Delivery leaves production release to a manual approval.',
      questionType: 'mcq',
    },
    {
      id: 'cd_4',
      section: 'technical',
      sectionTitle: 'Technical Core',
      role: 'Cloud & DevOps Engineer',
      topic: 'Infrastructure as Code',
      question: 'Which HashiCorp tool uses declarative configuration files (HCL) to provision multi-cloud resources?',
      options: ['Ansible', 'Terraform', 'Puppet', 'Chef'],
      correctAnswer: 1,
      explanation: 'Terraform manages cloud infrastructure state and resource lifecycle declaratively.',
      questionType: 'mcq',
    },
  ],
  'Cybersecurity Analyst': [
    {
      id: 'sec_1',
      section: 'technical',
      sectionTitle: 'Technical Core',
      role: 'Cybersecurity Analyst',
      topic: 'Web App Security',
      question: 'Which defense strategy is most resilient against SQL Injection vulnerabilities?',
      options: ['Client-side regex checking', 'Parameterized Queries (Prepared Statements)', 'Blacklisting single quotes', 'HTTPS encryption'],
      correctAnswer: 1,
      explanation: 'Prepared statements treat incoming user parameters strictly as values rather than executable SQL syntax.',
      questionType: 'mcq',
    },
    {
      id: 'sec_2',
      section: 'technical',
      sectionTitle: 'Technical Core',
      role: 'Cybersecurity Analyst',
      topic: 'Session Security',
      question: 'Which cookie attribute prevents client-side scripts from reading session authentication cookies via XSS?',
      options: ['Secure', 'HttpOnly', 'SameSite', 'Path'],
      correctAnswer: 1,
      explanation: 'HttpOnly blocks document.cookie access from JavaScript, protecting session tokens from XSS theft.',
      questionType: 'mcq',
    },
    {
      id: 'sec_3',
      section: 'technical',
      sectionTitle: 'Technical Core',
      role: 'Cybersecurity Analyst',
      topic: 'Cryptography',
      question: 'Which encryption scheme uses paired public and private keys for digital signatures and secret exchange?',
      options: ['Symmetric (AES)', 'Asymmetric (RSA/ECC)', 'Hash functions (SHA-256)', 'Stream ciphers (RC4)'],
      correctAnswer: 1,
      explanation: 'Asymmetric encryption relies on mathematically coupled key pairs for non-repudiation and key exchange.',
      questionType: 'mcq',
    },
    {
      id: 'sec_4',
      section: 'technical',
      sectionTitle: 'Technical Core',
      role: 'Cybersecurity Analyst',
      topic: 'Access Control',
      question: 'What security principle dictates that each entity must be granted the minimum privileges necessary to execute its function?',
      options: ['Defense in Depth', 'Principle of Least Privilege', 'Zero Trust', 'Separation of Duties'],
      correctAnswer: 1,
      explanation: 'Least Privilege prevents unauthorized lateral movement in the event of an account compromise.',
      questionType: 'mcq',
    },
  ],
  'Mobile App Developer (Android / Flutter)': [
    {
      id: 'mob_1',
      section: 'technical',
      sectionTitle: 'Technical Core',
      role: 'Mobile App Developer (Android / Flutter)',
      topic: 'Android Lifecycle',
      question: 'Which Android Activity lifecycle method is invoked immediately before the Activity is visible to the user?',
      options: ['onCreate()', 'onStart()', 'onResume()', 'onPause()'],
      correctAnswer: 1,
      explanation: 'onStart() makes the activity visible, followed by onResume() when it enters the foreground interactive state.',
      questionType: 'mcq',
    },
    {
      id: 'mob_2',
      section: 'technical',
      sectionTitle: 'Technical Core',
      role: 'Mobile App Developer (Android / Flutter)',
      topic: 'Flutter Framework',
      question: 'In Flutter, why are StatelessWidget configurations immutable?',
      options: ['They recreate their render objects whenever properties change via new constructor calls', 'They have no state or context', 'They cannot be nested', 'They run on background threads'],
      correctAnswer: 0,
      explanation: 'Flutter rebuilds immutable widget trees rapidly; mutable state is delegated to StatefulWidget State objects.',
      questionType: 'mcq',
    },
    {
      id: 'mob_3',
      section: 'technical',
      sectionTitle: 'Technical Core',
      role: 'Mobile App Developer (Android / Flutter)',
      topic: 'Concurrency',
      question: 'Why must long network operations be executed off the mobile UI (Main) thread?',
      options: ['To avoid UI frame drops and ANR (Application Not Responding) crashes', 'To conserve battery', 'OS prevents socket creation on worker threads', 'Main thread lacks internet permissions'],
      correctAnswer: 0,
      explanation: 'Blocking the main thread freezes frame rendering at 60/120fps and triggers system ANR dialogs.',
      questionType: 'mcq',
    },
    {
      id: 'mob_4',
      section: 'technical',
      sectionTitle: 'Technical Core',
      role: 'Mobile App Developer (Android / Flutter)',
      topic: 'Mobile Asset Formats',
      question: 'Which modern image format provides high compression ratios and alpha channel transparency for mobile applications?',
      options: ['BMP', 'WebP', 'TIFF', 'EPS'],
      correctAnswer: 1,
      explanation: 'WebP reduces bundle size significantly compared to PNG and JPEG without quality loss.',
      questionType: 'mcq',
    },
  ],
  'QA / Automation Test Engineer': [
    {
      id: 'qa_1',
      section: 'technical',
      sectionTitle: 'Technical Core',
      role: 'QA / Automation Test Engineer',
      topic: 'Test Strategy',
      question: 'What testing type validates that newly added code or bug fixes have not adversely impacted existing functioning features?',
      options: ['Smoke Testing', 'Regression Testing', 'Sanity Testing', 'Exploratory Testing'],
      correctAnswer: 1,
      explanation: 'Regression testing re-runs test suites across unmodified features to detect side-effect bugs.',
      questionType: 'mcq',
    },
    {
      id: 'qa_2',
      section: 'technical',
      sectionTitle: 'Technical Core',
      role: 'QA / Automation Test Engineer',
      topic: 'Automation Frameworks',
      question: 'In Selenium WebDriver or Cypress, which locator strategy is generally the most stable and performant?',
      options: ['Dynamic absolute XPath', 'Unique ID / Data-testid attribute', 'Link Text', 'CSS Tag hierarchy'],
      correctAnswer: 1,
      explanation: 'Unique IDs or dedicated data-test attributes isolate tests from cosmetic styling changes.',
      questionType: 'mcq',
    },
    {
      id: 'qa_3',
      section: 'technical',
      sectionTitle: 'Technical Core',
      role: 'QA / Automation Test Engineer',
      topic: 'Test Pyramid',
      question: 'According to the Test Pyramid principle, which test category should form the broadest and largest volume of tests?',
      options: ['End-to-End (E2E) UI Tests', 'Integration Tests', 'Unit Tests', 'Manual Exploratory Tests'],
      correctAnswer: 2,
      explanation: 'Unit tests are fast, deterministic, and cost-effective to run in large volumes.',
      questionType: 'mcq',
    },
    {
      id: 'qa_4',
      section: 'technical',
      sectionTitle: 'Technical Core',
      role: 'QA / Automation Test Engineer',
      topic: 'Defect Lifecycle',
      question: 'What defect severity classification describes a catastrophic bug that crashes the core system with no workaround?',
      options: ['Minor', 'Major', 'Critical / Blocker', 'Trivial'],
      correctAnswer: 2,
      explanation: 'Blocker/Critical defects stop releases and prevent further testing of core workflows.',
      questionType: 'mcq',
    },
  ],
  'UI / UX Designer': [
    {
      id: 'ui_1',
      section: 'technical',
      sectionTitle: 'Technical Core',
      role: 'UI / UX Designer',
      topic: 'Design Principles',
      question: 'Which Gestalt principle dictates that elements arranged close to one another are perceived as a related group?',
      options: ['Similarity', 'Proximity', 'Closure', 'Continuity'],
      correctAnswer: 1,
      explanation: 'Proximity groups visually proximate elements into single semantic clusters.',
      questionType: 'mcq',
    },
    {
      id: 'ui_2',
      section: 'technical',
      sectionTitle: 'Technical Core',
      role: 'UI / UX Designer',
      topic: 'Accessibility',
      question: 'What is the minimum WCAG 2.1 Level AA color contrast ratio required for regular body text against its background?',
      options: ['3:1', '4.5:1', '7:1', '2:1'],
      correctAnswer: 1,
      explanation: 'WCAG AA requires at least 4.5:1 contrast for normal text and 3:1 for large text.',
      questionType: 'mcq',
    },
    {
      id: 'ui_3',
      section: 'technical',
      sectionTitle: 'Technical Core',
      role: 'UI / UX Designer',
      topic: 'Design Process',
      question: 'What is the primary objective of creating low-fidelity wireframes before high-fidelity visual mockups?',
      options: ['Choosing brand colors and typography', 'Testing layout structure, information hierarchy, and user flows without visual distraction', 'Writing production CSS', 'Conducting final stakeholder sign-off'],
      correctAnswer: 1,
      explanation: 'Low-fidelity wireframes focus on usability, content hierarchy, and navigation flow.',
      questionType: 'mcq',
    },
    {
      id: 'ui_4',
      section: 'technical',
      sectionTitle: 'Technical Core',
      role: 'UI / UX Designer',
      topic: 'Usability Metrics',
      question: 'Which standardized 10-item Likert scale questionnaire provides a composite score from 0 to 100 for system usability?',
      options: ['Net Promoter Score (NPS)', 'System Usability Scale (SUS)', 'Customer Effort Score (CES)', 'Single Ease Question (SEQ)'],
      correctAnswer: 1,
      explanation: 'The SUS is an industry standard questionnaire for quantifying product usability.',
      questionType: 'mcq',
    },
  ],
};

// ============================================================================
// 3. RUNNABLE LIVE CODING PROBLEMS (With Empty Starter Code & Test Cases)
// ============================================================================
export const CODING_ASSESSMENT_PROBLEMS: AssessmentQuestion[] = [
  {
    id: 'code_two_sum',
    section: 'coding',
    sectionTitle: 'Live Coding & DSA',
    topic: 'Arrays & Hashing',
    question: '**Two Sum**\n\nGiven an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`.\nAssume each input has exactly one valid solution.',
    questionType: 'coding',
    explanation: 'Solve in O(N) using a Hash Map tracking seen numbers and their indices.',
    starterCode: {
      python: 'def twoSum(nums: list[int], target: int) -> list[int]:\n    # Write your solution here\n    pass',
      javascript: 'function twoSum(nums, target) {\n  // Write your solution here\n}',
      cpp: '#include <vector>\nusing namespace std;\n\nclass Solution {\npublic:\n    vector<int> twoSum(vector<int>& nums, int target) {\n        // Write your code here\n        return {};\n    }\n};',
      java: 'class Solution {\n    public int[] twoSum(int[] nums, int target) {\n        // Write your code here\n        return new int[]{};\n    }\n}',
      c: 'int* twoSum(int* nums, int numsSize, int target, int* returnSize) {\n    // Write your code here\n    *returnSize = 2;\n    return NULL;\n}',
    },
    testCases: [
      { input: '[2, 7, 11, 15], 9', expectedOutput: '[0, 1]' },
      { input: '[3, 2, 4], 6', expectedOutput: '[1, 2]' },
    ],
  },
  {
    id: 'code_valid_anagram',
    section: 'coding',
    sectionTitle: 'Live Coding & DSA',
    topic: 'Strings & Hash Table',
    question: '**Valid Anagram**\n\nGiven two strings `s` and `t`, return `true` if `t` is an anagram of `s`, and `false` otherwise.\nAn anagram is formed by rearranging letters.',
    questionType: 'coding',
    explanation: 'Count letter frequencies or sort and compare both strings.',
    starterCode: {
      python: 'def isAnagram(s: str, t: str) -> bool:\n    # Write your solution here\n    pass',
      javascript: 'function isAnagram(s, t) {\n  // Write your solution here\n}',
      cpp: '#include <string>\nusing namespace std;\n\nclass Solution {\npublic:\n    bool isAnagram(string s, string t) {\n        // Write your code here\n        return false;\n    }\n};',
      java: 'class Solution {\n    public boolean isAnagram(String s, String t) {\n        // Write your code here\n        return false;\n    }\n}',
      c: '#include <stdbool.h>\n#include <string.h>\n\nbool isAnagram(char* s, char* t) {\n    // Write your code here\n    return false;\n}',
    },
    testCases: [
      { input: '"anagram", "nagaram"', expectedOutput: 'true' },
      { input: '"rat", "car"', expectedOutput: 'false' },
    ],
  },
  {
    id: 'code_max_subarray',
    section: 'coding',
    sectionTitle: 'Live Coding & DSA',
    topic: 'Dynamic Programming',
    question: '**Maximum Subarray**\n\nGiven an integer array `nums`, find the subarray with the largest sum, and return its sum (Kadane\'s Algorithm).',
    questionType: 'coding',
    explanation: 'Maintain running maximum sum ending at each position in O(N) time.',
    starterCode: {
      python: 'def maxSubArray(nums: list[int]) -> int:\n    # Write your solution here\n    pass',
      javascript: 'function maxSubArray(nums) {\n  // Write your solution here\n}',
      cpp: '#include <vector>\nusing namespace std;\n\nclass Solution {\npublic:\n    int maxSubArray(vector<int>& nums) {\n        // Write your code here\n        return 0;\n    }\n};',
      java: 'class Solution {\n    public int maxSubArray(int[] nums) {\n        // Write your code here\n        return 0;\n    }\n}',
      c: 'int maxSubArray(int* nums, int numsSize) {\n    // Write your code here\n    return 0;\n}',
    },
    testCases: [
      { input: '[-2, 1, -3, 4, -1, 2, 1, -5, 4]', expectedOutput: '6' },
      { input: '[1]', expectedOutput: '1' },
    ],
  },
  {
    id: 'code_reverse_string',
    section: 'coding',
    sectionTitle: 'Live Coding & DSA',
    topic: 'Two Pointers',
    question: '**Reverse String**\n\nWrite a function that reverses an input string. Return the reversed string.',
    questionType: 'coding',
    explanation: 'Swap characters from front and back or return slice in reverse.',
    starterCode: {
      python: 'def reverseString(s: str) -> str:\n    # Write your solution here\n    pass',
      javascript: 'function reverseString(s) {\n  // Write your solution here\n}',
      cpp: '#include <string>\nusing namespace std;\n\nclass Solution {\npublic:\n    string reverseString(string s) {\n        // Write your code here\n        return s;\n    }\n};',
      java: 'class Solution {\n    public String reverseString(String s) {\n        // Write your code here\n        return s;\n    }\n}',
      c: 'char* reverseString(char* s) {\n    // Write your code here\n    return s;\n}',
    },
    testCases: [
      { input: '"hello"', expectedOutput: '"olleh"' },
      { input: '"Campus"', expectedOutput: '"supmaC"' },
    ],
  },
  {
    id: 'code_palindrome_num',
    section: 'coding',
    sectionTitle: 'Live Coding & DSA',
    topic: 'Math & Logic',
    question: '**Palindrome Number**\n\nGiven an integer `x`, return `true` if `x` is a palindrome, and `false` otherwise.',
    questionType: 'coding',
    explanation: 'Negative numbers are not palindromes. Compare digits or string representation.',
    starterCode: {
      python: 'def isPalindrome(x: int) -> bool:\n    # Write your solution here\n    pass',
      javascript: 'function isPalindrome(x) {\n  // Write your solution here\n}',
      cpp: 'class Solution {\npublic:\n    bool isPalindrome(int x) {\n        // Write your code here\n        return false;\n    }\n};',
      java: 'class Solution {\n    public boolean isPalindrome(int x) {\n        // Write your code here\n        return false;\n    }\n}',
      c: '#include <stdbool.h>\n\nbool isPalindrome(int x) {\n    // Write your code here\n    return false;\n}',
    },
    testCases: [
      { input: '121', expectedOutput: 'true' },
      { input: '-121', expectedOutput: 'false' },
    ],
  },
  {
    id: 'code_move_zeroes',
    section: 'coding',
    sectionTitle: 'Live Coding & DSA',
    topic: 'Arrays & Two Pointers',
    question: '**Move Zeroes**\n\nGiven an integer array `nums`, move all `0`\'s to the end of it while maintaining the relative order of the non-zero elements.',
    questionType: 'coding',
    explanation: 'Two pointers: track insert position for non-zero items, then fill remaining with 0.',
    starterCode: {
      python: 'def moveZeroes(nums: list[int]) -> list[int]:\n    # Write your solution here\n    pass',
      javascript: 'function moveZeroes(nums) {\n  // Write your solution here\n}',
      cpp: '#include <vector>\nusing namespace std;\n\nclass Solution {\npublic:\n    vector<int> moveZeroes(vector<int>& nums) {\n        // Write your code here\n        return nums;\n    }\n};',
      java: 'class Solution {\n    public int[] moveZeroes(int[] nums) {\n        // Write your code here\n        return nums;\n    }\n}',
      c: 'int* moveZeroes(int* nums, int numsSize, int* returnSize) {\n    // Write your code here\n    *returnSize = numsSize;\n    return nums;\n}',
    },
    testCases: [
      { input: '[0, 1, 0, 3, 12]', expectedOutput: '[1, 3, 12, 0, 0]' },
      { input: '[0]', expectedOutput: '[0]' },
    ],
  },
];

// ============================================================================
// 4. HR & COMMUNICATION SCENARIOS
// ============================================================================
export const HR_QUESTIONS: AssessmentQuestion[] = [
  {
    id: 'hr_1',
    section: 'hr',
    sectionTitle: 'HR & Communication',
    topic: 'Conflict Resolution',
    question: 'During a sprint, a teammate strongly disagrees with your technical design proposal. What is the most constructive response?',
    options: [
      'Escalate immediately to the engineering manager',
      'Schedule a 1-on-1 to review architectural trade-offs objectively using data',
      'Ignore their critique and push your branch',
      'Abandon your proposal entirely without discussion',
    ],
    correctAnswer: 1,
    explanation: 'Collaborative technical discussion evaluating trade-offs demonstrates emotional intelligence and ownership.',
    questionType: 'mcq',
  },
  {
    id: 'hr_2',
    section: 'hr',
    sectionTitle: 'HR & Communication',
    topic: 'Deadline Management',
    question: 'You discover that an unforeseen third-party API outage will delay your feature by two days. What should you do?',
    options: [
      'Work quietly without mentioning it in standup',
      'Communicate the delay early to leads, present impact, and propose alternative mitigation options',
      'Blame the third-party provider publicly',
      'Ship without writing unit tests to save time',
    ],
    correctAnswer: 1,
    explanation: 'Proactive communication and presenting mitigation options builds leadership trust.',
    questionType: 'mcq',
  },
  {
    id: 'hr_3',
    section: 'hr',
    sectionTitle: 'HR & Communication',
    topic: 'Behavioral Interviews (STAR)',
    question: 'When answering behavioral interview questions ("Tell me about a time..."), what framework provides the clearest structure?',
    options: [
      'Situation, Task, Action, Result (STAR)',
      'Summary, Theory, Analysis, Review',
      'Story, Theme, Argument, Recommendation',
      'Scope, Trial, Application, Review',
    ],
    correctAnswer: 0,
    explanation: 'The STAR framework clearly structures context, personal responsibility, specific action, and measurable results.',
    questionType: 'mcq',
  },
  {
    id: 'hr_4',
    section: 'hr',
    sectionTitle: 'HR & Communication',
    topic: 'Constructive Feedback',
    question: 'Your team lead suggests in a review that your code review comments could be more empathetic. How do you respond?',
    options: [
      'Defend yourself by stating code correctness is all that matters',
      'Acknowledge the feedback, ask for specific examples to improve tone, and adapt communication',
      'Stop participating in code reviews',
      'File an HR grievance',
    ],
    correctAnswer: 1,
    explanation: 'Accepting feedback constructively and asking for actionable examples reflects professional maturity.',
    questionType: 'mcq',
  },
];

// Backwards compatibility array
export const ASSESSMENT_QUESTIONS: AssessmentQuestion[] = [
  ...APTITUDE_QUESTIONS.slice(0, 4),
  ...ROLE_TECHNICAL_QUESTIONS['Software Engineer (SDE)'].slice(0, 4),
  ...CODING_ASSESSMENT_PROBLEMS.slice(0, 2),
  ...HR_QUESTIONS.slice(0, 2),
];

/**
 * Deterministically select today's role-matched assessment set:
 * - Dynamic 20 to 35 questions (Base 20: 7 Aptitude across 4 pillars, 8 Technical, 3 Coding, 2 HR)
 * - Scales with missed day penalty (+5 per missed day) up to 35 questions max.
 */
export function getDailyAssessmentQuestions(
  role: string,
  dateStr: string = new Date().toISOString().split('T')[0],
  totalCount: number = 20
): {
  aptitude: AssessmentQuestion[];
  technical: AssessmentQuestion[];
  coding: AssessmentQuestion[];
  hr: AssessmentQuestion[];
  all: AssessmentQuestion[];
} {
  const seed = dateStr.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const count = Math.max(20, Math.min(35, totalCount));

  const codingCount = count < 30 ? 3 : 4;
  const hrCount = count < 25 ? 2 : (count < 35 ? 3 : 4);
  const remaining = count - codingCount - hrCount;
  const aptCount = Math.floor(remaining / 2);
  const techCount = remaining - aptCount;

  // 1. Aptitude balanced across all 4 syllabus pillars (Quantitative, Logical, Verbal, Data Interpretation)
  const pillars = ['Quantitative', 'Logical', 'Verbal', 'Data Interpretation'] as const;
  const bankQs = aptitudeBankRaw as Array<{
    id: string;
    topic: string;
    category: string;
    question: string;
    options: string[];
    correctAnswer: number;
    shortcutFormula?: string;
    explanation: string;
  }>;

  const aptitude: AssessmentQuestion[] = [];
  for (let i = 0; i < aptCount; i++) {
    const pil = pillars[i % pillars.length];
    const bucket = bankQs.filter((q) => q.category === pil);
    if (bucket.length > 0) {
      const picked = bucket[(seed * (i + 3)) % bucket.length];
      aptitude.push({
        id: picked.id,
        section: 'aptitude',
        sectionTitle: `Aptitude — ${pil}`,
        topic: `${picked.topic} (${pil})`,
        question: picked.question,
        options: picked.options,
        correctAnswer: picked.correctAnswer,
        explanation: picked.shortcutFormula
          ? `Shortcut: ${picked.shortcutFormula}\n${picked.explanation}`
          : picked.explanation,
        questionType: 'mcq',
      });
    } else {
      aptitude.push(APTITUDE_QUESTIONS[(seed + i) % APTITUDE_QUESTIONS.length]);
    }
  }

  // 2. Technical (for selected role)
  const roleList = ROLE_TECHNICAL_QUESTIONS[role] || ROLE_TECHNICAL_QUESTIONS['Software Engineer (SDE)'];
  const techOffset = (seed * 3) % roleList.length;
  const technical: AssessmentQuestion[] = [];
  for (let i = 0; i < techCount; i++) {
    technical.push(roleList[(techOffset + i) % roleList.length]);
  }

  // 3. Coding (at least 3 Live Problems)
  const codeOffset = (seed * 7) % CODING_ASSESSMENT_PROBLEMS.length;
  const coding: AssessmentQuestion[] = [];
  for (let i = 0; i < codingCount; i++) {
    coding.push(CODING_ASSESSMENT_PROBLEMS[(codeOffset + i) % CODING_ASSESSMENT_PROBLEMS.length]);
  }

  // 4. HR
  const hrOffset = (seed * 11) % HR_QUESTIONS.length;
  const hr: AssessmentQuestion[] = [];
  for (let i = 0; i < hrCount; i++) {
    hr.push(HR_QUESTIONS[(hrOffset + i) % HR_QUESTIONS.length]);
  }

  return {
    aptitude,
    technical,
    coding,
    hr,
    all: [...aptitude, ...technical, ...coding, ...hr],
  };
}
