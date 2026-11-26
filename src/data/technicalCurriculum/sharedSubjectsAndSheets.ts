import {
  type CareerSubtopic,
  type CheatSheetCard,
  type CoreSubjectModule,
  type SubtopicResource,
} from './types';

const SQL_RESOURCES: SubtopicResource[] = [
  { title: 'SQLBolt Interactive SQL Exercises', url: 'https://sqlbolt.com/', type: 'Interactive Practice', pricing: 'Free', level: 'Beginner' },
  { title: 'W3Schools SQL Tutorial & Reference', url: 'https://www.w3schools.com/sql/', type: 'Interactive Practice', pricing: 'Free', level: 'Beginner' },
  { title: 'PostgreSQL Official Documentation', url: 'https://www.postgresql.org/docs/current/tutorial.html', type: 'Official Docs', pricing: 'Free', level: 'Intermediate' },
  { title: 'MySQL 8 Official Reference Manual', url: 'https://dev.mysql.com/doc/refman/8.0/en/', type: 'Official Docs', pricing: 'Free', level: 'Intermediate' },
  { title: 'LeetCode Top SQL 50 Study Plan', url: 'https://leetcode.com/studyplan/top-sql-50/', type: 'Interactive Practice', pricing: 'Freemium', level: 'Intermediate' },
];

function makeSqlSubtopic(
  slug: string,
  title: string,
  level: CareerSubtopic['level'],
  time: string,
  simpleExplanation: string,
  whyImportant: string,
  whatToLearn: string[],
  codeExample: string
): CareerSubtopic {
  return {
    id: `subj-sql-${slug}`,
    title,
    level,
    estimatedTime: time,
    simpleExplanation,
    whyImportant,
    whatToLearn,
    prerequisites: ['Basic tabular data awareness'],
    codeExample,
    completionCriteria: `Write and test 3 queries practicing ${title} on SQLBolt or LeetCode SQL 50.`,
    resources: SQL_RESOURCES,
  };
}

// COMPLETE 17-SUBTOPIC SQL MODULE
export const SUBJECT_SQL_17: CoreSubjectModule = {
  id: 'mod-sql-17',
  title: 'SQL Mastery (17 Placement Subtopics)',
  badge: 'SQL',
  kind: 'Core Subject',
  summary: 'End-to-end relational querying from DDL/DML fundamentals up to Joins, Window Functions, Indexing, Normalization, Transactions & Stored Procedures.',
  subtopics: [
    makeSqlSubtopic('ddl', '1. DDL (CREATE, ALTER, DROP, TRUNCATE)', 'Beginner', '35 mins',
      'Data Definition Language defines and modifies table structures, columns, and schema layouts.',
      'Asked in SQL viva rounds (especially TRUNCATE vs DELETE vs DROP).',
      ['CREATE TABLE with data types', 'ALTER TABLE ADD/MODIFY', 'DROP vs TRUNCATE rollback behavior'],
      `CREATE TABLE candidates (\n  id INT PRIMARY KEY,\n  name VARCHAR(100) NOT NULL,\n  score INT DEFAULT 0\n);\nTRUNCATE TABLE temp_logs;`),
    makeSqlSubtopic('dml', '2. DML (INSERT, UPDATE, DELETE)', 'Beginner', '35 mins',
      'Data Manipulation Language inserts, updates, and deletes individual table rows safely inside transactions.',
      'Tests safe WHERE filtering so UPDATE/DELETE never corrupts an entire table.',
      ['INSERT INTO multi-row values', 'UPDATE ... SET ... WHERE', 'DELETE FROM vs TRUNCATE'],
      `UPDATE candidates\nSET score = score + 5\nWHERE id = 101;`),
    makeSqlSubtopic('dql', '3. DQL & SELECT Projections', 'Beginner', '30 mins',
      'Data Query Language retrieves computed columns, DISTINCT records, and aliases via SELECT.',
      'Foundation of every analytical and backend query.',
      ['SELECT DISTINCT deduplication', 'Column aliases (AS)', 'CASE WHEN conditional expressions'],
      `SELECT DISTINCT department,\n  CASE WHEN score >= 65 THEN 'Pass' ELSE 'Retake' END AS status\nFROM assessments;`),
    makeSqlSubtopic('where-order', '4. WHERE, LIKE, IN, BETWEEN & ORDER BY', 'Beginner', '40 mins',
      'Filters qualifying rows cleanly before sorting results and limiting top-K records.',
      'Core clause for Top-N queries and range filtering.',
      ['Logical AND/OR precedence', 'LIKE wildcard patterns (% and _)', 'ORDER BY DESC LIMIT/OFFSET'],
      `SELECT name, ctc FROM offers\nWHERE role LIKE '%Engineer%' AND ctc BETWEEN 8 AND 24\nORDER BY ctc DESC LIMIT 5;`),
    makeSqlSubtopic('aggregates', '5. Aggregate Functions (COUNT, SUM, AVG, MIN, MAX)', 'Beginner', '35 mins',
      'Summarizes multi-row sets into single metric values while ignoring NULLs appropriately.',
      'Essential for KPI reporting and SQL Round 1 coding questions.',
      ['COUNT(*) vs COUNT(col)', 'COALESCE null handling in AVG/SUM', 'MIN/MAX across numeric/date columns'],
      `SELECT COUNT(*) AS total_apps, AVG(COALESCE(score, 0)) AS avg_score\nFROM submissions;`),
    makeSqlSubtopic('groupby-having', '6. GROUP BY & HAVING Filtering', 'Intermediate', '45 mins',
      'Groups rows sharing key attributes and filters aggregated buckets via HAVING.',
      'Classic interview question: WHERE vs HAVING execution order.',
      ['Multi-column GROUP BY', 'WHERE before grouping vs HAVING after grouping', 'Rollup summaries'],
      `SELECT role, COUNT(*) AS hires\nFROM placements\nWHERE year = 2026\nGROUP BY role\nHAVING COUNT(*) >= 10;`),
    makeSqlSubtopic('joins', '7. SQL Joins (INNER, LEFT, RIGHT, FULL, SELF)', 'Intermediate', '60 mins',
      'Combines normalized tables using matching foreign/primary key columns cleanly.',
      'Tested in practically every SDE, Backend, and Data Analyst SQL interview.',
      ['INNER vs LEFT OUTER Join NULL preservation', 'SELF Join for manager-employee hierarchies', 'CROSS Join Cartesian caution'],
      `SELECT e.name AS employee, m.name AS manager\nFROM employees e\nLEFT JOIN employees m ON e.manager_id = m.id;`),
    makeSqlSubtopic('subqueries', '8. Subqueries & CTEs (WITH Clauses)', 'Intermediate', '55 mins',
      'Nests queries or names readable Common Table Expressions (WITH) for multi-step logic.',
      'Makes 2nd-highest salary and multi-stage cohort queries clean.',
      ['Scalar vs Correlated Subqueries', 'EXISTS vs IN performance', 'Modular CTE WITH chains'],
      `WITH ranked AS (\n  SELECT name, salary, DENSE_RANK() OVER (ORDER BY salary DESC) AS rnk FROM emp\n)\nSELECT name, salary FROM ranked WHERE rnk = 2;`),
    makeSqlSubtopic('views', '9. Views & Materialized Views', 'Intermediate', '35 mins',
      'Virtual saved SELECT queries restricting column exposure or precomputing heavy analytics.',
      'Improves query encapsulation and read security in production databases.',
      ['CREATE VIEW read abstractions', 'Updatable view limits', 'Standard View vs Materialized View refresh'],
      `CREATE VIEW active_high_scorers AS\nSELECT user_email, overall_score FROM daily_assessments\nWHERE overall_score >= 65;`),
    makeSqlSubtopic('indexes', '10. Indexes (Clustered, Non-Clustered & Composite)', 'Advanced', '60 mins',
      'Balanced B+ Tree structures accelerating WHERE/JOIN lookups from O(N) table scans to O(log N).',
      'Top backend and DB performance tuning topic.',
      ['Clustered vs Non-Clustered B+ Tree indexes', 'Leftmost-prefix rule on composite indexes', 'Write amplification trade-off'],
      `CREATE INDEX idx_assess_user_date\nON daily_assessments(user_email, assessment_date DESC);`),
    makeSqlSubtopic('keys', '11. Keys (Primary, Foreign, Candidate, Super, Composite)', 'Beginner', '35 mins',
      'Identifies rows uniquely and enforces referential integrity across parent-child tables.',
      'Core DBMS theory question in campus technical interviews.',
      ['Super vs Candidate vs Primary Key', 'Surrogate UUID vs Natural Keys', 'Foreign Key ON DELETE CASCADE'],
      `ALTER TABLE orders\nADD CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;`),
    makeSqlSubtopic('constraints', '12. Integrity Constraints (NOT NULL, UNIQUE, CHECK, DEFAULT)', 'Beginner', '30 mins',
      'Guarantees valid data domain rules directly at the storage engine layer.',
      'Prevents invalid corrupt rows even when bugs hit application code.',
      ['UNIQUE vs PRIMARY KEY null behavior', 'CHECK domain predicates', 'DEFAULT values'],
      `CREATE TABLE coupons (\n  code VARCHAR(20) UNIQUE NOT NULL,\n  discount_pct INT CHECK (discount_pct BETWEEN 1 AND 90)\n);`),
    makeSqlSubtopic('normalization', '13. Normalization (1NF, 2NF, 3NF & BCNF)', 'Intermediate', '50 mins',
      'Decomposes tables systematically to remove redundant duplication and update/delete anomalies.',
      'Tested heavily in DBMS system modeling and conceptual MCQs.',
      ['1NF atomic values', '2NF partial dependency removal', '3NF transitive dependency & BCNF superkey rules'],
      `-- Separate OrderItems(order_id, product_id, qty) from Products(product_id, name, price)\n-- to eliminate partial and transitive update anomalies.`),
    makeSqlSubtopic('transactions', '14. ACID Transactions & Concurrency Isolation', 'Advanced', '60 mins',
      'Wraps multi-step updates atomically with locking or MVCC preventing dirty/phantom reads.',
      'Critical for payment, inventory, and ticket booking systems.',
      ['COMMIT, ROLLBACK & SAVEPOINT', 'ACID guarantees', 'Read Committed vs Repeatable Read vs Serializable'],
      `BEGIN;\nUPDATE accounts SET bal = bal - 500 WHERE id = 1;\nUPDATE accounts SET bal = bal + 500 WHERE id = 2;\nCOMMIT;`),
    makeSqlSubtopic('stored-procs', '15. Stored Procedures, Functions & Triggers', 'Intermediate', '45 mins',
      'Pre-compiled SQL routines and event-driven triggers executed directly inside the database server.',
      'Commonly tested in enterprise Java/Oracle/TCS/Infosys drives.',
      ['IN / OUT parameters in Stored Procedures', 'Functions vs Procedures', 'BEFORE/AFTER INSERT Triggers'],
      `CREATE TRIGGER trg_audit AFTER UPDATE ON users\nFOR EACH ROW INSERT INTO audit_log(user_id, changed_at) VALUES (NEW.id, NOW());`),
    makeSqlSubtopic('triggers-cte', '16. Set Operations (UNION, UNION ALL, INTERSECT, EXCEPT)', 'Beginner', '30 mins',
      'Combines compatible SELECT result sets vertically with or without deduplication.',
      'Checks UNION vs UNION ALL performance distinction.',
      ['UNION deduplication sort vs UNION ALL speed', 'Column count/type alignment rules', 'EXCEPT set difference'],
      `SELECT email FROM campus_2025\nUNION ALL\nSELECT email FROM campus_2026;`),
    makeSqlSubtopic('window-fns', '17. Window Functions (RANK, DENSE_RANK, ROW_NUMBER, LAG/LEAD)', 'Advanced', '60 mins',
      'Performs running totals and intra-group rankings across partitions WITHOUT collapsing rows.',
      'Must-know advanced SQL topic for Data Analyst, Data Scientist, and top Product companies.',
      ['OVER (PARTITION BY ... ORDER BY ...)', 'ROW_NUMBER vs RANK vs DENSE_RANK', 'LAG/LEAD month-over-month deltas'],
      `SELECT dept, name, salary,\n  RANK() OVER (PARTITION BY dept ORDER BY salary DESC) AS dept_rank\nFROM employees;`),
  ],
};

export const SUBJECT_DBMS: CoreSubjectModule = {
  id: 'mod-dbms',
  title: 'Database Management Systems (DBMS)',
  badge: 'DBMS',
  kind: 'Core Subject',
  summary: 'Relational algebra, ER modeling, B+ Tree storage internals, concurrency locking, and WAL crash recovery.',
  subtopics: [
    {
      id: 'subj-dbms-internals',
      title: 'ER Diagrams, B+ Tree Storage & Crash Recovery (WAL)',
      level: 'Intermediate',
      estimatedTime: '2.5 hours',
      simpleExplanation: 'DBMS engines use Write-Ahead Logging (WAL) before disk commits so crashes never lose committed transactions, and B+ Trees keep disk seeks shallow.',
      whyImportant: 'Core CS interview staple alongside SQL queries.',
      whatToLearn: ['ER Cardinality mapping (1:1, 1:N, M:N tables)', 'Why B+ Trees beat Binary Search Trees on disk blocks', 'Two-Phase Locking (2PL) & Deadlock Prevention'],
      prerequisites: ['Basic SQL tables'],
      completionCriteria: 'Map a multi-entity University schema from ER diagram to 3NF tables.',
      resources: [
        { title: 'GeeksforGeeks Complete DBMS Notes', url: 'https://www.geeksforgeeks.org/dbms/', type: 'Tutorial', pricing: 'Free', level: 'Intermediate' },
        { title: 'Gate Smashers DBMS Full Playlist (YouTube)', url: 'https://www.youtube.com/playlist?list=PLxCzCOWd7aiFAN6I8CuViBuCdJgiOkT2Y', type: 'Sheet / Playlist', pricing: 'Free', level: 'Beginner' },
        { title: 'PostgreSQL Internals & Indexing Docs', url: 'https://www.postgresql.org/docs/current/indexes.html', type: 'Official Docs', pricing: 'Free', level: 'Advanced' },
        { title: 'SQLBolt Practice Playground', url: 'https://sqlbolt.com/', type: 'Interactive Practice', pricing: 'Free', level: 'Beginner' },
      ],
    },
  ],
};

export const SUBJECT_OS: CoreSubjectModule = {
  id: 'mod-os',
  title: 'Operating Systems (OS)',
  badge: 'OS',
  kind: 'Core Subject',
  summary: 'Processes, thread synchronization, CPU scheduling algorithms, virtual memory paging, and deadlock handling.',
  subtopics: [
    {
      id: 'subj-os-proc-mem',
      title: 'Processes, Threads, Deadlocks & Paging',
      level: 'Intermediate',
      estimatedTime: '3 hours',
      simpleExplanation: 'Threads share process memory for fast concurrency while virtual memory pages let programs safely exceed physical RAM via page tables & TLBs.',
      whyImportant: 'Top-3 CS Core round topic at Microsoft, Amazon, Oracle, and Cisco.',
      whatToLearn: ['Process states & Context Switching', 'FCFS, SJF, SRTF, Round Robin scheduling', 'Mutex vs Semaphore & Dining Philosophers', 'Page Faults, Thrashing & LRU Replacement'],
      prerequisites: ['Basic C/Java/Python execution model'],
      completionCriteria: 'Walk through TLB hit/miss translation and Banker’s safe-sequence detection.',
      resources: [
        { title: 'GeeksforGeeks Operating Systems Archive', url: 'https://www.geeksforgeeks.org/operating-systems/', type: 'Tutorial', pricing: 'Free', level: 'Intermediate' },
        { title: 'Gate Smashers Operating Systems Playlist (YouTube)', url: 'https://www.youtube.com/playlist?list=PLxCzCOWd7aiGz9donHRrE9I3Mwn6XdP8p', type: 'Sheet / Playlist', pricing: 'Free', level: 'Beginner' },
        { title: 'roadmap.sh Computer Science Core', url: 'https://roadmap.sh/computer-science', type: 'Tutorial', pricing: 'Free', level: 'Intermediate' },
      ],
    },
  ],
};

export const SUBJECT_CN: CoreSubjectModule = {
  id: 'mod-cn',
  title: 'Computer Networks (CN)',
  badge: 'CN',
  kind: 'Core Subject',
  summary: 'OSI vs TCP/IP models, TCP 3-way handshake, congestion control, DNS resolution, HTTP/2 & TLS.',
  subtopics: [
    {
      id: 'subj-cn-tcp-http',
      title: 'OSI Layers, TCP Handshake, DNS & HTTPS/TLS',
      level: 'Intermediate',
      estimatedTime: '2.5 hours',
      simpleExplanation: 'Typing a URL triggers DNS lookup -> TCP SYN/SYN-ACK/ACK handshake -> TLS encryption -> HTTP request/response streaming reliably across IP routers.',
      whyImportant: '"What happens when you type google.com in your browser?" is a classic SDE/Backend/Cloud interview prompt.',
      whatToLearn: ['OSI 7-Layer responsibilities', 'TCP vs UDP header & congestion control', 'IPv4 CIDR subnetting & NAT', 'HTTP methods, status codes, CORS & TLS 1.3'],
      prerequisites: ['Basic web browser usage'],
      completionCriteria: 'Explain full DNS -> TCP -> TLS -> HTTP lifecycle in under 2 minutes cleanly.',
      resources: [
        { title: 'MDN HTTP & Web Networking Docs', url: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Overview', type: 'Official Docs', pricing: 'Free', level: 'Beginner' },
        { title: 'Gate Smashers Computer Networks Playlist (YouTube)', url: 'https://www.youtube.com/playlist?list=PLxCzCOWd7aiGFBD2-2joCpWOLUrDLvVV_', type: 'Sheet / Playlist', pricing: 'Free', level: 'Beginner' },
        { title: 'GeeksforGeeks Computer Networks Guide', url: 'https://www.geeksforgeeks.org/computer-network-tutorials/', type: 'Tutorial', pricing: 'Free', level: 'Intermediate' },
      ],
    },
  ],
};

export const SUBJECT_OOP: CoreSubjectModule = {
  id: 'mod-oop',
  title: 'Object-Oriented Programming (OOP & SOLID)',
  badge: 'OOP',
  kind: 'Core Subject',
  summary: 'Encapsulation, Abstraction, Inheritance, Polymorphism, Interfaces, and Clean SOLID Patterns.',
  subtopics: [
    {
      id: 'subj-oop-pillars',
      title: 'OOP 4 Pillars, Abstract vs Interface & Design Patterns',
      level: 'Beginner',
      estimatedTime: '2 hours',
      simpleExplanation: 'OOP models real domain entities cleanly, hiding mutable internals while enabling plug-and-play extensions via interfaces.',
      whyImportant: 'Tested in almost every Java/C++/Python technical round and LLD coding prompt.',
      whatToLearn: ['Compile-time vs Runtime Polymorphism', 'Abstract Class vs Interface', 'Singleton, Factory, Observer & Strategy Patterns'],
      prerequisites: ['Basic functions & variables'],
      codeExample: `interface Notifier { void send(String msg); }\nclass EmailNotifier implements Notifier {\n  public void send(String msg) { System.out.println("Email: " + msg); }\n}`,
      completionCriteria: 'Design a clean Notification Dispatcher supporting Email, SMS & Push via an interface.',
      resources: [
        { title: 'Oracle Dev.java OOP Learning Path', url: 'https://dev.java/learn/oop/', type: 'Official Docs', pricing: 'Free', level: 'Beginner' },
        { title: 'Python Official Classes & OOP', url: 'https://docs.python.org/3/tutorial/classes.html', type: 'Official Docs', pricing: 'Free', level: 'Beginner' },
        { title: 'GeeksforGeeks OOP Concepts', url: 'https://www.geeksforgeeks.org/object-oriented-programming-oops-concept-in-java/', type: 'Tutorial', pricing: 'Free', level: 'Beginner' },
      ],
    },
  ],
};

export const SUBJECT_GIT_LINUX: CoreSubjectModule = {
  id: 'mod-git-linux',
  title: 'Git, GitHub & Linux CLI Essentials',
  badge: 'Tools',
  kind: 'Industry Tool',
  summary: 'Branching, rebasing, resolving conflicts, SSH keys, pipes, grep, process checks, and shell automation.',
  subtopics: [
    {
      id: 'subj-tool-git-linux',
      title: 'Git PR Workflows & Essential Linux Troubleshooting CLI',
      level: 'Beginner',
      estimatedTime: '90 mins',
      simpleExplanation: 'Clean Git commits + Linux text processing (grep, tail, ps, curl) let engineers debug servers and ship team PRs effortlessly.',
      whyImportant: 'Mandatory day-one developer tooling expected across every engineering role.',
      whatToLearn: ['git branch, checkout -b, rebase, stash, cherry-pick', 'chmod, ps aux, grep -rn, tail -f, curl -i', 'SSH key auth & .env security hygiene'],
      prerequisites: ['None'],
      codeExample: `git checkout -b fix/rate-limit\ngrep -rn "ERROR" logs/app.log | tail -n 20`,
      completionCriteria: 'Fork, branch, resolve a conflict, and grep error timestamps from a sample log file.',
      resources: [
        { title: 'roadmap.sh Git & GitHub Guide', url: 'https://roadmap.sh/git-github', type: 'Tutorial', pricing: 'Free', level: 'Beginner' },
        { title: 'W3Schools Git Interactive Tutorial', url: 'https://www.w3schools.com/git/', type: 'Interactive Practice', pricing: 'Free', level: 'Beginner' },
        { title: 'freeCodeCamp Linux Commands Handbook', url: 'https://www.freecodecamp.org/news/the-linux-commands-handbook/', type: 'Tutorial', pricing: 'Free', level: 'Beginner' },
      ],
    },
  ],
};

export const SUBJECT_SYSTEM_DESIGN: CoreSubjectModule = {
  id: 'mod-sysdesign',
  title: 'System Design & Scalability',
  badge: 'HLD/LLD',
  kind: 'Core Subject',
  summary: 'Load balancing, caching, sharding, consistent hashing, message queues, and rate limiting.',
  subtopics: [
    {
      id: 'subj-sysdesign-scale',
      title: 'Load Balancers, Redis Caching, Sharding & Rate Limiters',
      level: 'Advanced',
      estimatedTime: '3 hours',
      simpleExplanation: 'Horizontally scale web tiers behind stateless load balancers, speed reads with Redis caches, and buffer writes cleanly via message queues.',
      whyImportant: 'Tested in product company SDE, Backend, and Cloud architecture rounds.',
      whatToLearn: ['Vertical vs Horizontal Scaling', 'CDN, Reverse Proxy & L4/L7 Load Balancers', 'CAP Theorem, Replication & Sharding', 'Token Bucket vs Sliding Window Rate Limiting'],
      prerequisites: ['REST APIs & Database Indexing'],
      completionCriteria: 'Walk through designing Bitly / URL Shortener or Instagram Feed with capacity math.',
      resources: [
        { title: 'roadmap.sh System Design Guide', url: 'https://roadmap.sh/system-design', type: 'Tutorial', pricing: 'Free', level: 'Advanced' },
        { title: 'GeeksforGeeks System Design Tutorial', url: 'https://www.geeksforgeeks.org/system-design-tutorial/', type: 'Tutorial', pricing: 'Free', level: 'Intermediate' },
        { title: 'NeetCode System Design Path', url: 'https://neetcode.io/courses', type: 'Interactive Practice', pricing: 'Freemium', level: 'Advanced' },
      ],
    },
  ],
};

export const SUBJECT_EXCEL_BI: CoreSubjectModule = {
  id: 'mod-excel-bi',
  title: 'Excel, Power BI & Analytical Dashboards',
  badge: 'BI Tools',
  kind: 'Industry Tool',
  summary: 'Pivot tables, XLOOKUP, Power Query cleanup, DAX measures, and executive KPI visual storytelling.',
  subtopics: [
    {
      id: 'subj-bi-excel',
      title: 'Excel XLOOKUP, Pivot Tables & Power BI DAX Basics',
      level: 'Beginner',
      estimatedTime: '2 hours',
      simpleExplanation: 'Excel Pivot Tables & Power BI DAX let analysts slice millions of sales rows interactively by region, quarter, and product tier.',
      whyImportant: 'Directly tested in Deloitte, ZS, EY, and Business Analyst interviews.',
      whatToLearn: ['XLOOKUP & INDEX-MATCH over VLOOKUP', 'Pivot Tables & Calculated Fields', 'DAX CALCULATE, SUMX & Star Schema Modeling'],
      prerequisites: ['Basic spreadsheet familiarity'],
      completionCriteria: 'Build an interactive regional sales & margin slicer workbook.',
      resources: [
        { title: 'W3Schools Excel Interactive Tutorial', url: 'https://www.w3schools.com/excel/', type: 'Interactive Practice', pricing: 'Free', level: 'Beginner' },
        { title: 'roadmap.sh Data Analyst BI Path', url: 'https://roadmap.sh/data-analyst', type: 'Tutorial', pricing: 'Free', level: 'Beginner' },
        { title: 'Kaggle Learn Data Visualization', url: 'https://www.kaggle.com/learn/data-visualization', type: 'Interactive Practice', pricing: 'Free', level: 'Beginner' },
      ],
    },
  ],
};

export const SUBJECT_PYTHON_PANDAS_STATS: CoreSubjectModule = {
  id: 'mod-pandas-stats',
  title: 'Python, Pandas & Applied Statistics',
  badge: 'Data Core',
  kind: 'Core Subject',
  summary: 'DataFrame cleaning, groupby aggregations, probability distributions, p-values, and regression diagnostics.',
  subtopics: [
    {
      id: 'subj-pandas-core',
      title: 'Pandas Vectorized Cleaning & Hypothesis Testing',
      level: 'Intermediate',
      estimatedTime: '3 hours',
      simpleExplanation: 'Pandas filters/merges messy CSVs cleanly while t-tests and confidence intervals verify whether observed metric lifts are statistically real.',
      whyImportant: 'Core daily workflow for Data Analysts, ML Engineers, and Data Scientists.',
      whatToLearn: ['fillna, drop_duplicates, merge, pivot_table', 'Mean vs Median vs IQR outliers', 'p-value, Alpha = 0.05, Type I/II errors'],
      prerequisites: ['Basic Python syntax'],
      completionCriteria: 'Run an end-to-end EDA + two-sample significance test in a Jupyter notebook.',
      resources: [
        { title: 'Pandas Official 10-Minute Guide', url: 'https://pandas.pydata.org/docs/user_guide/10min.html', type: 'Official Docs', pricing: 'Free', level: 'Beginner' },
        { title: 'Kaggle Learn — Pandas Micro-Course', url: 'https://www.kaggle.com/learn/pandas', type: 'Interactive Practice', pricing: 'Free', level: 'Beginner' },
        { title: 'Python Official Tutorial', url: 'https://docs.python.org/3/tutorial/', type: 'Official Docs', pricing: 'Free', level: 'Beginner' },
      ],
    },
  ],
};

export const SUBJECT_WEB_REACT_NODE: CoreSubjectModule = {
  id: 'mod-web-react',
  title: 'HTML5, CSS3, TypeScript, React & Node.js',
  badge: 'Web Stack',
  kind: 'Core Subject',
  summary: 'Modern responsive CSS layouts, JS Event Loop, React Hooks architecture, and Node.js REST middleware.',
  subtopics: [
    {
      id: 'subj-web-react-hooks',
      title: 'React Lifecycle, Custom Hooks, CSS Grid & REST Integration',
      level: 'Intermediate',
      estimatedTime: '3 hours',
      simpleExplanation: 'React binds component state cleanly to modular UI trees while TypeScript catches API payload shape mismatches before runtime.',
      whyImportant: 'Standard engineering stack for Frontend and Full Stack campus hiring.',
      whatToLearn: ['Flexbox & CSS Grid layout patterns', 'useEffect cleanup & useMemo/useCallback', 'Fetch error states, JWT HttpOnly auth & CORS'],
      prerequisites: ['ES6 JavaScript basics'],
      completionCriteria: 'Build a typed CRUD interface communicating with an authenticated REST endpoint.',
      resources: [
        { title: 'React Official Documentation', url: 'https://react.dev/learn', type: 'Official Docs', pricing: 'Free', level: 'Intermediate' },
        { title: 'MDN Web Development Curriculum', url: 'https://developer.mozilla.org/en-US/curriculum/', type: 'Official Docs', pricing: 'Free', level: 'Beginner' },
        { title: 'Node.js Official Learn Portal', url: 'https://nodejs.org/en/learn/getting-started/introduction-to-nodejs', type: 'Official Docs', pricing: 'Free', level: 'Beginner' },
      ],
    },
  ],
};

export const SUBJECT_DOCKER_K8S: CoreSubjectModule = {
  id: 'mod-docker-k8s',
  title: 'Docker, Kubernetes & Terraform IaC',
  badge: 'Cloud/Infra',
  kind: 'Industry Tool',
  summary: 'Container isolation, multi-stage builds, Kubernetes Deployments/Services/Probes, and Terraform plans.',
  subtopics: [
    {
      id: 'subj-k8s-iac',
      title: 'Containers, Kubernetes Scheduling & Infrastructure-as-Code',
      level: 'Intermediate',
      estimatedTime: '3 hours',
      simpleExplanation: 'Docker packages deterministic apps, Kubernetes keeps pods healthy across nodes, and Terraform provisions cloud networks declaratively.',
      whyImportant: 'Key architecture skills for Cloud/DevOps and scalable Backend roles.',
      whatToLearn: ['Docker layers & multi-stage Alpine images', 'K8s Pod, Deployment, Service, DaemonSet & HPA', 'Terraform init / plan / apply state safety'],
      prerequisites: ['Linux CLI basics'],
      completionCriteria: 'Write valid Dockerfile + Kubernetes Deployment YAML with Readiness probe.',
      resources: [
        { title: 'Docker Official Documentation', url: 'https://docs.docker.com/get-started/', type: 'Official Docs', pricing: 'Free', level: 'Beginner' },
        { title: 'Kubernetes Official Basics', url: 'https://kubernetes.io/docs/tutorials/kubernetes-basics/', type: 'Official Docs', pricing: 'Free', level: 'Intermediate' },
        { title: 'roadmap.sh DevOps & Cloud Path', url: 'https://roadmap.sh/devops', type: 'Tutorial', pricing: 'Free', level: 'Intermediate' },
      ],
    },
  ],
};

// =============================================================================
// HIGH-YIELD CHEAT SHEETS LIBRARY (SCOPED BY CAREER)
// =============================================================================

export const CHEAT_DSA_COMPLEXITY: CheatSheetCard = {
  id: 'cs-dsa-bigo',
  title: 'DSA Time & Space Complexity Cheat Sheet',
  badge: 'Algorithms',
  description: 'Instant Big-O reference for arrays, trees, hashing, sorting, and graph traversals.',
  rows: [
    { item: 'HashMap / HashSet Lookup', syntaxOrRule: 'O(1) avg / O(N) worst', note: 'Use for Two Sum, frequency maps, deduplication' },
    { item: 'Binary Search / Balanced BST', syntaxOrRule: 'O(log N) time, O(1) iter', note: 'Requires monotonic or sorted search space' },
    { item: 'Merge Sort / Quick Sort', syntaxOrRule: 'O(N log N) avg', note: 'Merge is stable O(N) space; Quick is in-place O(N^2) worst' },
    { item: 'BFS / DFS Graph Traversal', syntaxOrRule: 'O(V + E) time, O(V) space', note: 'BFS gives unweighted shortest path via Queue' },
    { item: 'Heap (Push / Pop / Peek)', syntaxOrRule: 'O(log N) push/pop, O(1) peek', note: 'Use for Top-K elements and Dijkstra priority queue' },
  ],
};

export const CHEAT_SQL_JOINS: CheatSheetCard = {
  id: 'cs-sql-exec',
  title: 'SQL Execution Order & Window Functions Cheat Sheet',
  badge: 'SQL',
  description: 'Never mix up WHERE vs HAVING or RANK vs DENSE_RANK in SQL rounds.',
  bullets: [
    'Logical Execution Order: FROM -> JOIN -> WHERE -> GROUP BY -> HAVING -> SELECT -> DISTINCT -> ORDER BY -> LIMIT',
    'INNER JOIN matches intersecting keys; LEFT JOIN keeps all left rows (unmatched right cols = NULL).',
    'ROW_NUMBER() = 1,2,3,4 | RANK() = 1,2,2,4 (skips 3) | DENSE_RANK() = 1,2,2,3 (no gaps).',
    'WHERE filters individual rows BEFORE grouping; HAVING filters aggregated buckets AFTER GROUP BY.',
  ],
  codeSnippet: `SELECT dept, salary,
  DENSE_RANK() OVER (PARTITION BY dept ORDER BY salary DESC) AS rnk
FROM employees WHERE active = 1;`,
};

export const CHEAT_OOP_SOLID: CheatSheetCard = {
  id: 'cs-oop-solid',
  title: 'OOP 4 Pillars & SOLID Quick Reference',
  badge: 'Design',
  description: 'Crisp interview definitions and design rule triggers for SDE & Backend rounds.',
  rows: [
    { item: 'Encapsulation', syntaxOrRule: 'private fields + validated getters/setters', note: 'Protects internal invariant state' },
    { item: 'Polymorphism', syntaxOrRule: 'Overloading (compile) / Overriding (runtime)', note: 'Enables clean interface extensibility' },
    { item: 'S / O in SOLID', syntaxOrRule: 'Single Responsibility + Open/Closed', note: 'Extend via interfaces instead of editing tested core' },
    { item: 'D in SOLID', syntaxOrRule: 'Dependency Inversion', note: 'Depend on abstractions, inject implementations' },
  ],
};

export const CHEAT_HTTP_REST: CheatSheetCard = {
  id: 'cs-http-rest',
  title: 'HTTP Status Codes & REST Semantics',
  badge: 'Web / API',
  description: 'Exact HTTP response status mappings tested in Full Stack, Backend, and QA interviews.',
  rows: [
    { item: '200 OK / 201 Created / 204', syntaxOrRule: 'Success / New Resource / No Content', note: 'Return 201 on POST creation; 204 on DELETE' },
    { item: '400 / 401 / 403 / 404 / 429', syntaxOrRule: 'Bad Input / Unauth / Forbidden / Missing / RateLimit', note: '401 = login needed; 403 = valid login, lacks role' },
    { item: '500 / 502 / 503', syntaxOrRule: 'Server Crash / Bad Gateway / Unavailable', note: 'Server-side faults requiring alerts/retries' },
    { item: 'Idempotent Methods', syntaxOrRule: 'GET, PUT, DELETE (NOT POST)', note: 'Safe retries without duplicate side effects' },
  ],
};

export const CHEAT_GIT_LINUX: CheatSheetCard = {
  id: 'cs-git-linux',
  title: 'Git & Linux Essential CLI Reference',
  badge: 'CLI',
  description: 'Daily workflow commands for branching, debugging logs, and inspecting processes.',
  codeSnippet: `git checkout -b feat/new-module      # Create & switch branch
git rebase main                    # Linear replay onto main
git stash push -m "wip"            # Temporarily shelve edits
grep -rn "Timeout" ./logs          # Recursive text search
lsof -i :5000                      # Check process on port 5000`,
};

export const CHEAT_OS_CN: CheatSheetCard = {
  id: 'cs-os-cn',
  title: 'Operating Systems & Computer Networks Rapid Card',
  badge: 'CS Core',
  description: 'High-frequency deadlock, paging, and TCP/UDP exam triggers.',
  bullets: [
    '4 Coffman Deadlock Conditions: Mutual Exclusion, Hold & Wait, No Preemption, Circular Wait.',
    'Mutex (single owner lock) vs Semaphore (signaling counter; binary or counting N slots).',
    'TCP (3-way SYN / SYN-ACK / ACK, reliable, ordered) vs UDP (connectionless, low-latency streaming).',
    'OSI Stack: Physical -> Data Link (MAC) -> Network (IP) -> Transport (TCP/UDP) -> Session -> Presentation (TLS) -> Application (HTTP/DNS).',
  ],
};

export const CHEAT_PANDAS_STATS: CheatSheetCard = {
  id: 'cs-pandas-stats',
  title: 'Pandas Cleaning & Applied Statistics Reference',
  badge: 'Analytics',
  description: 'Quick DataFrame formulas, chart choice rules, and p-value interpretations.',
  bullets: [
    'df.describe() -> count, mean, std, quartiles | df.isna().sum() -> null count per column.',
    'Use Median instead of Mean when distributions are heavily skewed by extreme outliers.',
    'p-value < alpha (0.05) -> Reject Null Hypothesis H0 (statistically significant lift).',
    'Box Plot = quartiles + outliers | Histogram = distribution | Scatter = 2-var correlation | Line = time trend.',
  ],
};

export const CHEAT_ML_ALGORITHMS: CheatSheetCard = {
  id: 'cs-ml-algos',
  title: 'ML Algorithms, Regularization & Metrics Comparison',
  badge: 'AI / ML',
  description: 'Model trade-offs, L1/L2 penalties, and Transformer attention equations.',
  rows: [
    { item: 'L1 (Lasso) vs L2 (Ridge)', syntaxOrRule: 'Sum|w| (sparse 0s) vs Sum w^2 (small weights)', note: 'Use L1 for feature selection' },
    { item: 'Bagging vs Boosting', syntaxOrRule: 'Random Forest (parallel, cuts variance) vs XGBoost (seq, cuts bias)', note: 'Trees require no feature scaling' },
    { item: 'Adam Optimizer', syntaxOrRule: 'Momentum + RMSProp adaptive LR', note: 'Default go-to optimizer for PyTorch/LLMs' },
    { item: 'Scaled Dot Attention', syntaxOrRule: 'softmax(QK^T / sqrt(d_k)) V', note: '1/sqrt(d_k) stops softmax saturation' },
  ],
};

export const CHEAT_FRONTEND_REACT: CheatSheetCard = {
  id: 'cs-fe-react',
  title: 'JavaScript Event Loop, React & CSS Grid Cheat Sheet',
  badge: 'Frontend',
  description: 'Essential browser execution order, React hook rules, and CSS responsive snippets.',
  bullets: [
    'Execution Order: Call Stack (Sync) -> Microtask Queue (Promise.then) -> Render Paint -> Macrotask Queue (setTimeout).',
    'Flexbox main axis = justify-content | cross axis = align-items. CSS Grid 2D = grid-template-columns.',
    'Never use array index as React key on sortable/mutable lists; stabilize callback props with useCallback for React.memo.',
    'Core Web Vitals: LCP < 2.5s (load), INP < 200ms (responsiveness), CLS < 0.1 (layout stability).',
  ],
};

export const CHEAT_DOCKER_K8S: CheatSheetCard = {
  id: 'cs-docker-k8s',
  title: 'Docker, Kubernetes & Terraform CLI Cheat Sheet',
  badge: 'DevOps',
  description: 'Container debugging, K8s inspection, and safe IaC workflow commands.',
  codeSnippet: `docker build -t app:v1 . && docker compose up -d
kubectl get pods -A && kubectl logs -f deploy/api
kubectl rollout undo deployment/api   # Instant rollback
terraform init && terraform plan      # Dry-run diff before apply`,
};

export const CHEAT_SECURITY_OWASP: CheatSheetCard = {
  id: 'cs-sec-owasp',
  title: 'OWASP Top 10 & Cryptography Quick Defense Card',
  badge: 'Security',
  description: 'Vulnerability -> exact code/header mitigation mapping for AppSec interviews.',
  rows: [
    { item: 'SQL Injection (SQLi)', syntaxOrRule: 'Parameterized Queries / Prepared Statements', note: 'Never string-interpolate user input into SQL' },
    { item: 'Stored / Reflected XSS', syntaxOrRule: 'Contextual HTML Escaping + strict CSP', note: 'Avoid raw dangerouslySetInnerHTML / innerHTML' },
    { item: 'CSRF', syntaxOrRule: 'Anti-CSRF Tokens + SameSite=Strict/Lax Cookies', note: 'Protects state-changing POST/PUT endpoints' },
    { item: 'Password Storage', syntaxOrRule: 'Argon2id / bcrypt (salted slow hash)', note: 'Never use fast MD5/SHA-1 or reversible encryption' },
  ],
};

export const CHEAT_MOBILE_QA_UX: Record<'mobile' | 'qa' | 'ux', CheatSheetCard> = {
  mobile: {
    id: 'cs-mobile-ref',
    title: 'Android Lifecycle & Flutter State Quick Reference',
    badge: 'Mobile',
    description: 'Lifecycle callbacks, threading safety, and secure credential rules.',
    bullets: [
      'Android Order: onCreate -> onStart -> onResume (Interactive) -> onPause -> onStop -> onDestroy.',
      'Never run blocking HTTP/SQL on the Main/UI thread (causes >5s ANR freeze). Offload to Dispatchers.IO / Isolates.',
      'Flutter StatelessWidget = immutable UI; StatefulWidget holds mutable State surviving rebuilds via Key.',
      'Use EncryptedSharedPreferences / iOS Keychain for JWT tokens; WebP format for lean mobile assets.',
    ],
  },
  qa: {
    id: 'cs-qa-ref',
    title: 'Playwright / Selenium Locators & Test Pyramid Card',
    badge: 'QA / SDET',
    description: 'Non-flaky automation selectors and boundary testing rules.',
    bullets: [
      'Agile Test Pyramid: Broad fast Unit Tests -> Integration / API Contract Tests -> Lean critical E2E UI Tests.',
      'Prefer getByRole() / getByTestId() over brittle XPath or CSS chains; NEVER use fixed Thread.sleep() pauses.',
      'Boundary Value Analysis: For valid range [1..100], explicitly test 0, 1, 2, 99, 100, 101.',
      'Defect Flow: New -> Assigned -> Fixed -> Retest -> Verified Closed (or Reopened if reproduced).',
    ],
  },
  ux: {
    id: 'cs-ux-ref',
    title: 'WCAG Accessibility, Gestalt & UX Laws Cheat Sheet',
    badge: 'UI / UX',
    description: 'Scannable visual design heuristics and accessibility contrast benchmarks.',
    bullets: [
      'WCAG 2.1 AA Contrast: >= 4.5:1 for normal body text; >= 3.0:1 for large text (18pt+) and UI icons.',
      'Gestalt Laws: Proximity (spacing groups items), Similarity (consistent styling), Closure, Continuity.',
      'Fitts’s Law: Larger CTA buttons placed closer to thumb/cursor reduce tap time and misclicks.',
      'Hick’s Law: Fewer top-level menu choices speed up user decisions; progressive disclosure hides noise.',
    ],
  },
};

export const SUBJECT_SECURITY_APPSEC: CoreSubjectModule = {
  id: 'mod-security-appsec',
  title: 'OWASP AppSec, Burp Suite & Cryptography',
  badge: 'Security',
  kind: 'Core Subject',
  summary: 'Web vulnerability exploitation & remediation, PKI certificates, TLS handshakes, and SOC log triage.',
  subtopics: [
    {
      id: 'subj-sec-owasp',
      title: 'OWASP Top 10 & Defensive Coding Patterns',
      level: 'Intermediate',
      estimatedTime: '3 hours',
      simpleExplanation: 'Master root causes and code-level remediations for Broken Access Control (IDOR), Injection, XSS, and SSRF.',
      whyImportant: 'Directly tested in AppSec, SOC, and Cloud Security interviews.',
      whatToLearn: ['Parameterized Queries vs string SQL', 'Content-Security-Policy & HttpOnly Cookies', 'Ownership checks against session IDOR'],
      prerequisites: ['HTTP Requests & Status Codes'],
      completionCriteria: 'Exploit and patch IDOR + SQLi inside OWASP Juice Shop.',
      resources: [
        { title: 'OWASP Top 10 Official Project', url: 'https://owasp.org/www-project-top-ten/', type: 'Official Docs', pricing: 'Free', level: 'Intermediate' },
        { title: 'PortSwigger Web Security Academy', url: 'https://portswigger.net/web-security', type: 'Interactive Practice', pricing: 'Free', level: 'Intermediate' },
        { title: 'OWASP Cheat Sheet Series', url: 'https://cheatsheetseries.owasp.org/', type: 'Official Docs', pricing: 'Free', level: 'Intermediate' },
      ],
    },
  ],
};

export const SUBJECT_MOBILE_ANDROID_FLUTTER: CoreSubjectModule = {
  id: 'mod-mobile-platforms',
  title: 'Android Jetpack, Flutter Widgets & Mobile Architecture',
  badge: 'Mobile',
  kind: 'Industry Tool',
  summary: 'Activity lifecycles, ViewModel MVVM state survival, Coroutines/Isolates threading, and offline Room/SQLite sync.',
  subtopics: [
    {
      id: 'subj-mobile-arch',
      title: 'MVVM Architecture, Lifecycle & Non-Blocking Threads',
      level: 'Intermediate',
      estimatedTime: '2.5 hours',
      simpleExplanation: 'Separate UI screens from ViewModels and Repository layers while offloading HTTP and SQLite onto background IO threads.',
      whyImportant: 'Prevents UI jank, ANR crashes, and state loss on rotation.',
      whatToLearn: ['Activity & Widget Lifecycles', 'StateFlow / Provider / Riverpod state', 'EncryptedSharedPreferences & Keychain'],
      prerequisites: ['Kotlin or Dart OOP basics'],
      completionCriteria: 'Build an offline-first cached feed surviving airplane mode and device rotation.',
      resources: [
        { title: 'Android Guide to App Architecture', url: 'https://developer.android.com/topic/architecture', type: 'Official Docs', pricing: 'Free', level: 'Intermediate' },
        { title: 'Flutter State Management Docs', url: 'https://docs.flutter.dev/data-and-backend/state-mgmt/intro', type: 'Official Docs', pricing: 'Free', level: 'Beginner' },
        { title: 'Kotlin Coroutines Official Guide', url: 'https://kotlinlang.org/docs/coroutines-guide.html', type: 'Official Docs', pricing: 'Free', level: 'Intermediate' },
      ],
    },
  ],
};

export const SUBJECT_QA_AUTOMATION: CoreSubjectModule = {
  id: 'mod-qa-automation',
  title: 'Playwright / Selenium E2E, Postman API & CI Gates',
  badge: 'QA / SDET',
  kind: 'Industry Tool',
  summary: 'Page Object Model frameworks, deterministic auto-wait locators, contract assertions, and GitHub Actions test pipelines.',
  subtopics: [
    {
      id: 'subj-qa-pom',
      title: 'Page Object Model & Deterministic Auto-Wait Locators',
      level: 'Intermediate',
      estimatedTime: '2.5 hours',
      simpleExplanation: 'Encapsulate screen selectors and user actions inside reusable Page classes using semantic role/test-id locators instead of sleeps.',
      whyImportant: 'Maintains zero-flakiness suites as frontend layouts evolve.',
      whatToLearn: ['getByRole & data-testid selection', 'Intercepting flaky backend APIs in E2E', 'JUnit / Allure CI HTML Reports'],
      prerequisites: ['HTML/CSS selectors & basic TypeScript/Java/Python'],
      completionCriteria: 'Write a 5-spec POM checkout suite passing cleanly 5 consecutive CI runs.',
      resources: [
        { title: 'Playwright Best Practices', url: 'https://playwright.dev/docs/best-practices', type: 'Official Docs', pricing: 'Free', level: 'Intermediate' },
        { title: 'Selenium Page Object Models', url: 'https://www.selenium.dev/documentation/test_practices/encouraged/page_object_models/', type: 'Official Docs', pricing: 'Free', level: 'Intermediate' },
        { title: 'Postman Test Scripts Docs', url: 'https://learning.postman.com/docs/writing-scripts/test-scripts/', type: 'Official Docs', pricing: 'Free', level: 'Beginner' },
      ],
    },
  ],
};

export { SUBJECT_DSA_MASTER, SUBJECT_GENAI_APIS } from './dsaAndGenAiModules';

export const SUBJECT_UIUX_FIGMA: CoreSubjectModule = {
  id: 'mod-uiux-figma',
  title: 'Figma Design Systems, Tokens & UX Research',
  badge: 'Figma & UX',
  kind: 'Industry Tool',
  summary: 'Auto Layout responsive frames, Figma Variables design tokens, WCAG AA audits, and moderated usability testing.',
  subtopics: [
    {
      id: 'subj-uiux-tokens',
      title: 'Figma Auto Layout, Components & Semantic Design Tokens',
      level: 'Intermediate',
      estimatedTime: '2.5 hours',
      simpleExplanation: 'Build scalable component libraries using nested Auto Layout frames and Variable tokens that map 1:1 to frontend CSS variables.',
      whyImportant: 'Separates production product designers from static mockup creators.',
      whatToLearn: ['Responsive Auto Layout constraints', 'Component Variants & Properties', 'Semantic Light/Dark Color Tokens'],
      prerequisites: ['Typography & 8pt Grid basics'],
      completionCriteria: 'Publish a responsive card + navbar component set with interactive prototype states.',
      resources: [
        { title: 'Figma Official Learn Design Library', url: 'https://help.figma.com/hc/en-us/categories/360002051613', type: 'Official Docs', pricing: 'Free', level: 'Beginner' },
        { title: 'Nielsen Norman Group UX Articles', url: 'https://www.nngroup.com/articles/', type: 'Tutorial', pricing: 'Free', level: 'Intermediate' },
        { title: 'Laws of UX Interactive Reference', url: 'https://lawsofux.com/', type: 'Tutorial', pricing: 'Free', level: 'Beginner' },
      ],
    },
  ],
};
