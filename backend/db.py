"""
PlacePilot AI — SQLite Database Module
Manages questions bank, daily assessments, streak calculations, and seeding.
"""

import os
import json
import sqlite3
import uuid
import random
from datetime import datetime, timezone, timedelta

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, 'data')
DB_PATH = os.path.join(DATA_DIR, 'placepilot.db')

os.makedirs(DATA_DIR, exist_ok=True)

def get_connection():
    """Create SQLite database connection with row factory."""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    """Initialize database tables and seed if empty."""
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS questions (
        id TEXT PRIMARY KEY,
        role TEXT,
        category TEXT,
        topic TEXT,
        difficulty TEXT,
        question_type TEXT,
        prompt TEXT,
        options_json TEXT,
        correct_answer TEXT,
        explanation TEXT,
        starter_code_json TEXT,
        test_cases_json TEXT,
        source TEXT,
        created_date TEXT
    );
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS daily_assessments (
        id TEXT PRIMARY KEY,
        user_email TEXT,
        assessment_date TEXT,
        role TEXT,
        overall_score REAL,
        aptitude_score REAL,
        coding_score REAL,
        technical_score REAL,
        hr_score REAL,
        strengths_json TEXT,
        weaknesses_json TEXT,
        skill_gaps_json TEXT,
        completed_at TEXT,
        wrong_questions_json TEXT
    );
    """)

    # Safe migration for existing DB
    cursor.execute("PRAGMA table_info(daily_assessments);")
    existing_cols = [col[1] for col in cursor.fetchall()]
    if "wrong_questions_json" not in existing_cols:
        cursor.execute("ALTER TABLE daily_assessments ADD COLUMN wrong_questions_json TEXT;")

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS aptitude_questions (
        id TEXT PRIMARY KEY,
        category TEXT,
        topic_id TEXT,
        topic TEXT,
        difficulty TEXT,
        company TEXT,
        question TEXT,
        options_json TEXT,
        correct_answer INTEGER,
        shortcut_formula TEXT,
        explanation TEXT,
        source TEXT,
        created_at TEXT
    );
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS technical_questions (
        id TEXT PRIMARY KEY,
        career TEXT,
        topic TEXT,
        difficulty TEXT,
        question TEXT,
        options_json TEXT,
        correct_answer INTEGER,
        explanation TEXT,
        source TEXT,
        created_at TEXT
    );
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS technical_progress (
        user_email TEXT,
        career TEXT,
        subtopic_id TEXT,
        completed INTEGER,
        completed_at TEXT,
        PRIMARY KEY (user_email, career, subtopic_id)
    );
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS hr_questions (
        id TEXT PRIMARY KEY,
        category TEXT,
        difficulty TEXT,
        question TEXT,
        options_json TEXT,
        correct_answer INTEGER,
        explanation TEXT,
        source TEXT,
        created_at TEXT
    );
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS subtopic_details_cache (
        cache_key TEXT PRIMARY KEY,
        career TEXT,
        topic TEXT,
        subtopic TEXT,
        level TEXT,
        detail_json TEXT,
        source TEXT,
        created_at TEXT
    );
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS course_progress (
        user_email TEXT,
        course_id TEXT,
        completed_days_json TEXT,
        target_days INTEGER,
        streak_days INTEGER,
        updated_at TEXT,
        PRIMARY KEY (user_email, course_id)
    );
    """)

    # Ensure target_days column exists for previously created SQLite databases
    try:
        cursor.execute("ALTER TABLE course_progress ADD COLUMN target_days INTEGER;")
    except Exception:
        pass

    cursor.execute("CREATE INDEX IF NOT EXISTS idx_assessment_user_date ON daily_assessments(user_email, assessment_date);")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_questions_role_cat ON questions(role, category);")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_apt_topic_cat ON aptitude_questions(topic_id, category, difficulty);")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_tech_career ON technical_questions(career, difficulty);")

    # Check if questions need seeding
    cursor.execute("SELECT COUNT(*) AS cnt FROM questions;")
    count = cursor.fetchone()['cnt']
    if count == 0:
        seed_questions(conn)

    # Check if aptitude_questions need seeding
    cursor.execute("SELECT COUNT(*) AS cnt FROM aptitude_questions;")
    apt_count = cursor.fetchone()['cnt']
    if apt_count < 300:
        seed_aptitude_questions(conn)

    # Check if technical_questions & hr_questions need seeding
    cursor.execute("SELECT COUNT(*) AS cnt FROM technical_questions;")
    if cursor.fetchone()['cnt'] == 0:
        seed_technical_questions(conn)

    cursor.execute("SELECT COUNT(*) AS cnt FROM hr_questions;")
    if cursor.fetchone()['cnt'] == 0:
        seed_hr_questions(conn)

    conn.commit()
    conn.close()

def seed_questions(conn):
    """Seed the database with 60+ MCQs and 14 Coding problems."""
    cursor = conn.cursor()
    now_iso = datetime.now(timezone.utc).isoformat()

    questions = []

    # =========================================================================
    # 1. APTITUDE & LOGICAL MCQs (20 Questions)
    # =========================================================================
    aptitude_data = [
        ("Time and Work", "A can finish a task in 12 days and B in 24 days. Working together, in how many days will they finish?", ["6 days", "8 days", "10 days", "18 days"], "1", "1/12 + 1/24 = 3/24 = 1/8. Total = 8 days."),
        ("Profit and Loss", "An article is sold for $480 incurring a 20% loss. What selling price gives a 20% profit?", ["$600", "$640", "$720", "$750"], "2", "CP = 480 / 0.8 = $600. Target SP = 600 * 1.2 = $720."),
        ("Number Series", "Find the next number in series: 4, 9, 25, 49, 121, ?", ["144", "169", "196", "225"], "1", "Squares of consecutive primes: 2^2, 3^2, 5^2, 7^2, 11^2, so next is 13^2 = 169."),
        ("Blood Relations", "Pointing to a man, Ravi said, 'His only brother is the father of my daughter's father.' Who is the man to Ravi?", ["Father", "Uncle", "Grandfather", "Brother-in-law"], "1", "Daughter's father = Ravi. Ravi's father is the man's brother. So the man is Ravi's Uncle."),
        ("Speed and Distance", "A train traveling at 72 km/h crosses a 160m platform in 18 seconds. Find train length.", ["180m", "200m", "240m", "300m"], "1", "72 km/h = 20 m/s. Total distance = 20 * 18 = 360m. Train length = 360 - 160 = 200m."),
        ("Percentages", "If the price of sugar increases by 25%, by what percent must consumption decrease to keep expenditure constant?", ["15%", "20%", "25%", "30%"], "1", "Reduction = (25 / 125) * 100 = 20%."),
        ("Simple Interest", "A sum triples itself in 8 years at simple interest. What is the annual rate of interest?", ["15%", "20%", "25%", "30%"], "2", "SI = 2P in 8 years. R = (2P * 100) / (P * 8) = 25%."),
        ("Ratios & Proportions", "The ratio of ages of A and B is 3:4. Four years ago it was 2:3. What is A's present age?", ["12 years", "16 years", "18 years", "20 years"], "0", "Let ages be 3x and 4x. (3x-4)/(4x-4) = 2/3 => 9x - 12 = 8x - 8 => x = 4. A = 3 * 4 = 12."),
        ("Permutations & Combinations", "In how many ways can the letters of the word 'LEADER' be arranged?", ["120", "360", "720", "48"], "1", "Total letters = 6, E repeats twice. 6! / 2! = 720 / 2 = 360."),
        ("Probability", "Two dice are rolled simultaneously. What is the probability that the sum of the numbers is 8?", ["5/36", "1/6", "7/36", "1/9"], "0", "Pairs summing to 8: (2,6), (3,5), (4,4), (5,3), (6,2) = 5 outcomes. Total = 36. Prob = 5/36."),
        ("Pipes and Cisterns", "Pipe A fills a tank in 10 hours and Pipe B empties it in 15 hours. How long to fill together?", ["25 hours", "30 hours", "35 hours", "20 hours"], "1", "Net rate = 1/10 - 1/15 = 1/30. Time = 30 hours."),
        ("Coding-Decoding", "If 'LIGHT' is coded as 'MJHIU', how is 'FLAME' coded in that same pattern?", ["GMBNF", "GMBNF", "GMBOD", "GNBNF"], "0", "Each letter shifted forward by +1: F->G, L->M, A->B, M->N, E->F => GMBNF."),
        ("Syllogisms", "Statements: All cats are dogs. All dogs are birds. Conclusion: Are all cats birds?", ["Definitely True", "Definitely False", "Cannot be determined", "Partially True"], "0", "Since all cats are in dogs and all dogs are in birds, all cats are transitively birds."),
        ("Seating Arrangement", "Five people A, B, C, D, E are in a row. C is in the middle. A is to the immediate left of B. D is at the right end. Where is E?", ["Left end", "Right of C", "Immediate right of A", "Cannot determine"], "0", "Positions: 1: E, 2: A, 3: B or 1: A, 2: B, 3: C, 4: E, 5: D. If C is in middle (pos 3), positions must be E, A, B, C, D or A, B, C, E, D."),
        ("Mixtures & Alligation", "In what ratio must milk at $30/L be mixed with water (cost $0/L) to get a mixture worth $24/L?", ["3:1", "4:1", "5:2", "2:1"], "1", "Alligation: (24 - 0) : (30 - 24) = 24 : 6 = 4 : 1."),
        ("Clocks", "What is the angle between the hour hand and minute hand at 3:30?", ["70°", "75°", "80°", "90°"], "1", "Angle = |30*H - 5.5*M| = |30(3) - 5.5(30)| = |90 - 165| = 75°."),
        ("Calendars", "If Jan 1, 2024 was a Monday, what day of the week was Jan 1, 2025? (2024 is a leap year)", ["Tuesday", "Wednesday", "Thursday", "Friday"], "1", "Leap year has 366 days = 52 weeks + 2 odd days. Monday + 2 = Wednesday."),
        ("Venn Diagrams", "In a class of 50 students, 30 study Math, 25 study Physics, and 10 study both. How many study neither?", ["3", "5", "8", "10"], "1", "Total studying at least one = 30 + 25 - 10 = 45. Neither = 50 - 45 = 5."),
        ("Direction Sense", "A person walks 5 km North, turns right and walks 12 km. How far is he from his start point?", ["13 km", "17 km", "15 km", "10 km"], "0", "Pythagorean theorem: sqrt(5^2 + 12^2) = sqrt(25 + 144) = sqrt(169) = 13 km."),
        ("Statement & Assumptions", "Statement: 'Enroll in our placement crash course to double your coding confidence.' Assumption: Confidence helps in placements.", ["Implicit", "Not Implicit", "Irrelevant", "Contradictory"], "0", "The advertisement assumes that confidence is desirable and beneficial for placement drives.")
    ]

    for topic, prompt, opts, ans, exp in aptitude_data:
        questions.append((
            f"q_apt_{uuid.uuid4().hex[:8]}", "Common", "Aptitude", topic, "Medium", "mcq",
            prompt, json.dumps(opts), ans, exp, None, None, "seed", now_iso
        ))

    # =========================================================================
    # 2. ROLE-SPECIFIC TECHNICAL CORE MCQs (12 Roles x 4 Questions = 48 Questions)
    # =========================================================================
    roles_technical = {
        "Software Engineer (SDE)": [
            ("Operating Systems", "Which condition is NOT required for a deadlock to occur in an operating system?", ["Mutual Exclusion", "Hold and Wait", "Preemption", "Circular Wait"], "2", "Deadlock requires No Preemption. Preemption breaks deadlock."),
            ("Database Systems", "Which normal form removes transitive functional dependencies of non-prime attributes?", ["1NF", "2NF", "3NF", "BCNF"], "2", "3NF requires relation to be in 2NF and have no transitive dependencies."),
            ("Computer Networks", "Which protocol works at the Transport layer to provide reliable, ordered, and error-checked delivery?", ["UDP", "TCP", "IP", "ICMP"], "1", "TCP provides reliable connection-oriented byte stream delivery."),
            ("Data Structures", "What is the worst-case time complexity of quicksort when the pivot is always the maximum or minimum element?", ["O(N log N)", "O(N^2)", "O(N)", "O(log N)"], "1", "Unbalanced partitions yield recursion depth N resulting in O(N^2) complexity.")
        ],
        "Full Stack Developer": [
            ("REST APIs", "Which HTTP status code should be returned when a new resource is successfully created via POST?", ["200 OK", "201 Created", "204 No Content", "301 Moved"], "1", "201 Created indicates successful resource generation."),
            ("State Management", "In React, what hook should you use to run side-effects such as data fetching or subscriptions?", ["useState", "useEffect", "useMemo", "useCallback"], "1", "useEffect executes asynchronous side effects after rendering."),
            ("Authentication", "In JWT (JSON Web Tokens), which component contains the signature for verification?", ["Header", "Payload", "Signature", "Issuer"], "2", "The third part is the cryptographic signature guaranteeing authenticity."),
            ("WebSockets", "What header is used during the HTTP upgrade handshake to establish a full-duplex WebSocket connection?", ["Upgrade: websocket", "Connection: keep-alive", "Transfer-Encoding: chunked", "Accept: text/event-stream"], "0", "Upgrade: websocket requests protocol switch to RFC 6455.")
        ],
        "Data Analyst": [
            ("SQL Window Functions", "Which SQL function assigns consecutive integers starting from 1 to rows within a partition without gaps?", ["RANK()", "DENSE_RANK()", "ROW_NUMBER()", "NTILE()"], "2", "ROW_NUMBER() outputs strict sequential row integers."),
            ("Pandas & DataFrames", "In Python Pandas, which method returns summary statistics including count, mean, std, and quartiles?", ["df.info()", "df.describe()", "df.summary()", "df.stats()"], "1", "describe() calculates numerical statistical summaries."),
            ("Statistics", "What measure of central tendency is most resilient to extreme outliers in skewed distributions?", ["Mean", "Median", "Mode", "Variance"], "1", "Median represents the middle value and ignores outlier magnitude."),
            ("Data Visualization", "Which chart is most effective for visualizing the distribution and quartiles of a continuous variable?", ["Pie Chart", "Box Plot (Whisker Plot)", "Scatter Plot", "Bar Chart"], "1", "Box plots concisely display min, Q1, median, Q3, and max.")
        ],
        "AI / Machine Learning Engineer": [
            ("Model Optimization", "Which optimization algorithm adapts learning rates per-parameter using exponentially decaying average of past squared gradients?", ["Stochastic Gradient Descent", "Adam", "Momentum", "Newton-Raphson"], "1", "Adam combines AdaGrad and RMSProp with momentum."),
            ("Regularization", "What is the primary difference between L1 (Lasso) and L2 (Ridge) regularization?", ["L1 produces sparse feature weights", "L2 sets weights to zero", "L1 prevents underfitting", "L2 eliminates outliers"], "0", "L1 penalty shrinks non-essential weights to absolute zero."),
            ("Neural Networks", "Why is the ReLU activation function widely preferred over Sigmoid in deep hidden layers?", ["Mitigates vanishing gradient problem", "Bounded between 0 and 1", "Outputs negative values", "Guarantees zero mean"], "0", "ReLU has derivative 1 for positive inputs preventing vanishing gradients."),
            ("Evaluation Metrics", "For highly imbalanced fraud detection data, which metric is most meaningful?", ["Accuracy", "ROC-AUC / Precision-Recall AUC", "Mean Squared Error", "R-squared"], "1", "PR-AUC accurately captures precision trade-offs without skew.")
        ],
        "Data Scientist": [
            ("Hypothesis Testing", "What does a p-value less than alpha (e.g. 0.05) indicate in statistical hypothesis testing?", ["Accept the null hypothesis", "Reject the null hypothesis in favor of alternative", "The test was inconclusive", "Sample size is too small"], "1", "p < 0.05 provides statistically significant evidence to reject H0."),
            ("Regression Analysis", "Which assumption is violated if residuals in a linear regression model have non-constant variance?", ["Multicollinearity", "Heteroscedasticity", "Non-normality", "Autocorrelation"], "1", "Heteroscedasticity occurs when error variance changes across X."),
            ("Dimensionality Reduction", "In Principal Component Analysis (PCA), what do the eigenvectors of the covariance matrix represent?", ["Directions of maximum variance", "Cluster centroids", "Class boundaries", "Residual errors"], "0", "Eigenvectors define orthogonal axes of maximum data spread."),
            ("Ensemble Methods", "What technique does Random Forest use to combine multiple decision trees built on bootstrap samples?", ["Boosting", "Bagging (Bootstrap Aggregating)", "Stacking", "Cascading"], "1", "Random Forest applies bagging with random feature selection.")
        ],
        "Frontend Developer": [
            ("JavaScript Internals", "Which phase of the JavaScript Event Loop executes Promise .then() callbacks?", ["Macrotask Queue", "Microtask Queue", "Render Queue", "Call Stack directly"], "1", "Promise resolution microtasks execute before the next macrotask."),
            ("CSS Layouts", "In CSS Grid, what shorthand property defines both column and row track sizing?", ["grid-template", "grid-gap", "place-content", "grid-auto-flow"], "0", "grid-template specifies rows, columns, and areas."),
            ("React Performance", "Which React API prevents re-rendering a component if its incoming props have not changed?", ["React.memo", "useMemo", "useCallback", "useRef"], "0", "React.memo is a higher-order component for shallow prop comparison."),
            ("Browser DOM", "What is event bubbling in browser DOM event propagation?", ["Event travels from target up to window", "Event travels from window down to target", "Event triggers simultaneously", "Event triggers only on parent"], "0", "Bubbling propagates up the DOM hierarchy after target phase.")
        ],
        "Backend Developer": [
            ("Database Transactions", "What does the 'I' in database ACID properties stand for?", ["Integrity", "Isolation", "Immutability", "Indexing"], "1", "Isolation ensures concurrent transactions execute without interference."),
            ("System Caching", "Which cache eviction policy discards items that have not been accessed for the longest time?", ["FIFO", "LRU (Least Recently Used)", "LFU", "Random Eviction"], "1", "LRU evicts the least recently accessed keys first."),
            ("Microservices", "Which communication pattern uses an asynchronous broker to decouple message publishers from consumers?", ["Synchronous REST", "gRPC unary", "Message-Driven / Pub-Sub", "GraphQL query"], "2", "Pub-Sub decouples publishers and subscribers asynchronously."),
            ("Database Indexing", "What is the primary data structure used by relational databases (PostgreSQL/MySQL) for primary key indexes?", ["B+ Tree", "Binary Search Tree", "Linked List", "Trie"], "0", "B+ Trees provide O(log N) search and efficient contiguous range scans.")
        ],
        "Cloud & DevOps Engineer": [
            ("Containers", "What Linux kernel features provide process isolation and resource limitation for Docker containers?", ["Namespaces and cgroups", "Initd and systemd", "iptables and SELinux", "Cron and syslog"], "0", "Namespaces isolate processes; cgroups constrain CPU and memory."),
            ("Kubernetes", "Which Kubernetes resource guarantees that a copy of a Pod runs on all (or some) cluster nodes?", ["Deployment", "DaemonSet", "StatefulSet", "ReplicaSet"], "1", "DaemonSet deploys one pod per node automatically."),
            ("CI/CD", "In modern CI/CD pipelines, what is the key difference between Continuous Delivery and Continuous Deployment?", ["Delivery requires automated tests", "Deployment automatically deploys to production without manual approval", "Delivery is only for staging", "They are identical"], "1", "Continuous Deployment auto-promotes passed builds to production."),
            ("Infrastructure as Code", "Which declarative tool is widely used to provision multi-cloud infrastructure using HCL files?", ["Ansible", "Terraform", "Puppet", "Jenkins"], "1", "HashiCorp Terraform provisions infrastructure declaratively.")
        ],
        "Cybersecurity Analyst": [
            ("Web Security", "Which defense prevents Cross-Site Request Forgery (CSRF) vulnerabilities on state-changing endpoints?", ["Input HTML Sanitization", "Anti-CSRF Tokens & SameSite Cookies", "HTTPS/TLS", "Content Security Policy"], "1", "Anti-CSRF tokens validate intentional user origin."),
            ("SQL Injection", "What is the most effective architectural defense against SQL Injection attacks?", ["Sanitizing single quotes", "Parameterized Queries (Prepared Statements)", "Using GET requests", "Client-side regex validation"], "1", "Parameterized queries treat input strictly as literals, not executable code."),
            ("Cryptography", "Which algorithm is a secure asymmetric public-key cryptosystem used for key exchange?", ["AES-256", "RSA", "DES", "MD5"], "1", "RSA uses asymmetric key pairs for signatures and encryption."),
            ("Authentication", "What principle dictates that users and processes must be granted only the minimal privileges needed?", ["Defense in Depth", "Principle of Least Privilege", "Zero Trust", "Separation of Duties"], "1", "Least Privilege minimizes damage from compromised credentials.")
        ],
        "Mobile App Developer (Android / Flutter)": [
            ("Android Lifecycle", "In Android, which callback is invoked immediately before an Activity becomes visible to the user?", ["onCreate()", "onStart()", "onResume()", "onPause()"], "1", "onStart() makes the activity visible before onResume() provides focus."),
            ("Flutter Widgets", "In Flutter, what is the fundamental difference between StatelessWidget and StatefulWidget?", ["Stateless cannot rebuild", "Stateful maintains mutable state across rebuilds", "Stateless has no build method", "Stateful cannot accept constructor arguments"], "1", "StatefulWidget manages state through a companion State class."),
            ("Mobile Networking", "Why must network operations never be executed synchronously on the Android Main thread?", ["Causes NetworkOnMainThreadException / UI freeze", "OS terminates battery", "Data becomes corrupt", "Security firewall blocks it"], "0", "Blocking the main thread causes ANR (Application Not Responding)."),
            ("App Performance", "Which image format is optimized for mobile apps with high compression and transparency?", ["BMP", "WebP", "TIFF", "GIF"], "1", "WebP offers superior lossless and lossy compression for mobile.")
        ],
        "QA / Automation Test Engineer": [
            ("Test Strategy", "What test level verifies that individual functions, procedures, or classes operate correctly in isolation?", ["Integration Testing", "Unit Testing", "System Testing", "Acceptance Testing"], "1", "Unit tests validate isolated code components using mocks."),
            ("Automation Tools", "In Selenium WebDriver, which locator strategy is generally the fastest and most robust?", ["XPath", "ID", "Class Name", "Link Text"], "1", "IDs are unique in well-formed DOMs providing direct lookup."),
            ("Test Pyramid", "According to the Agile Test Pyramid, which layer should contain the largest quantity of automated tests?", ["End-to-End (UI) Tests", "Integration / API Tests", "Unit Tests", "Manual Exploratory Tests"], "2", "Unit tests provide the foundation due to speed and reliability."),
            ("Bug Lifecycle", "What status should an issue be moved to after a developer implements a fix and awaits tester validation?", ["Closed", "Resolved / Ready for Test", "Rejected", "Deferred"], "1", "Resolved signals the QA team to perform regression verification.")
        ],
        "UI / UX Designer": [
            ("Design Principles", "Which Gestalt principle states that elements placed close together are perceived as belonging to a group?", ["Continuity", "Proximity", "Similarity", "Closure"], "1", "Proximity groups visually adjacent items."),
            ("Accessibility", "According to WCAG 2.1 AA standards, what is the minimum contrast ratio required for normal body text?", ["3:1", "4.5:1", "7:1", "2:1"], "1", "WCAG AA mandates at least 4.5:1 contrast for normal text."),
            ("User Research", "What design artifact visually maps the chronological phases, thoughts, and emotions a user experiences?", ["User Journey Map", "Site Map", "Entity Diagram", "Style Guide"], "0", "User Journey Maps plot user interactions, friction, and emotions."),
            ("Usability Metrics", "Which standardized 10-item questionnaire is widely used to evaluate perceived system usability?", ["NPS", "SUS (System Usability Scale)", "CSAT", "HE (Heuristic Eval)"], "1", "SUS provides a reliable 0-100 composite usability score.")
        ]
    }

    for role_name, qs in roles_technical.items():
        for topic, prompt, opts, ans, exp in qs:
            questions.append((
                f"q_tech_{uuid.uuid4().hex[:8]}", role_name, "Technical", topic, "Medium", "mcq",
                prompt, json.dumps(opts), ans, exp, None, None, "seed", now_iso
            ))

    # =========================================================================
    # 3. HR & BEHAVIORAL SCENARIOS (10 Questions)
    # =========================================================================
    hr_data = [
        ("Conflict Resolution", "During a project sprint, a teammate disagrees with your architectural design choice. What is the most professional response?", ["Escalate immediately to manager", "Schedule a 1-on-1 to review trade-offs objectively using data", "Ignore their input and push your code", "Give in without discussing to avoid conflict"], "1", "Objective 1-on-1 discussion weighing data and trade-offs demonstrates maturity."),
        ("Handling Deadlines", "You realize a critical feature milestone will be delayed by two days due to an unforeseen dependency bug. What should you do?", ["Work silently and hope no one notices", "Notify the project lead early, provide a revised timeline, and present mitigation options", "Blame the dependency author", "Drop unit tests to make the original deadline"], "1", "Proactive communication with revised timelines and solutions builds trust."),
        ("STAR Method", "When answering 'Tell me about a time you handled a crisis', what structure provides the clearest delivery?", ["Situation, Task, Action, Result", "Summary, Timeline, Arguments, Review", "Story, Theme, Analysis, Recommendation", "Scope, Trial, Application, Retrospective"], "0", "The STAR method clearly outlines context, responsibility, action, and outcomes."),
        ("Feedback Reception", "In your performance review, your lead suggests your code review comments could be more constructive. How do you respond?", ["Take it defensively", "Thank them for the feedback, ask for concrete examples, and adjust your tone", "Stop commenting on PRs", "Argue that your technical feedback was accurate"], "1", "Welcoming feedback and seeking improvement reflects a growth mindset."),
        ("Ethical Dilemma", "You discover an insecure API key committed to a public repository by a colleague. What is your immediate action?", ["Secretly delete the repo", "Notify the colleague and security team immediately, rotate the key, and purge git history", "Post about it in a company public channel", "Wait until the next sprint planning"], "1", "Promptly rotating the credential and alerting security minimizes exposure."),
        ("Teamwork & Culture", "A junior intern joins your team and struggles with Git rebasing. How do you assist?", ["Tell them to read the documentation", "Offer a 20-minute pair-programming session to walk through an example", "Do the rebase for them without explanation", "Advise them to avoid rebasing"], "1", "Pair programming fosters knowledge sharing and team mentorship."),
        ("Prioritization", "You receive three urgent tasks simultaneously from different stakeholders. How do you prioritize?", ["First task that arrived", "Evaluate business impact and deadlines, consult lead, and set realistic expectations", "Work on the easiest one first", "Work overtime on all three without communicating"], "1", "Evaluating impact and aligning with leadership ensures optimal resource allocation."),
        ("Adaptability", "Your team decides to migrate a project from REST to GraphQL midway through the quarter. How do you approach this?", ["Resist the change", "Embrace the architectural benefits, upskill on GraphQL schema design, and help lead migration", "Complain about wasted effort", "Ask to transfer teams"], "1", "Adaptability and willingness to upskill are key traits sought in placement drives."),
        ("Leadership", "You notice your group presentation lacks cohesion the day before the campus placement final round. What do you do?", ["Proactively organize a quick dry-run rehearsal, align slide transitions, and ensure everyone has equal speaking time", "Leave it as is", "Speak for the entire team yourself", "Tell the panel your teammates were unprepared"], "0", "Organizing a rehearsal and elevating team cohesion demonstrates genuine leadership."),
        ("Company Alignment", "An interviewer asks 'Why do you want to join our organization specifically?' What is the strongest answer?", ["'I need a job and your salary is competitive'", "'I admire your recent engineering innovations in cloud infrastructure and want to contribute to high-scale problems'", "'My college training cell recommended you'", "'I heard work-from-home policy is flexible'"], "1", "Connecting company innovations with your technical passions shows thorough preparation.")
    ]

    for topic, prompt, opts, ans, exp in hr_data:
        questions.append((
            f"q_hr_{uuid.uuid4().hex[:8]}", "Common", "HR", topic, "Medium", "mcq",
            prompt, json.dumps(opts), ans, exp, None, None, "seed", now_iso
        ))

    # =========================================================================
    # 4. RUNNABLE CODING & DSA PROBLEMS (14 Problems with empty starter code)
    # =========================================================================
    coding_data = [
        (
            "Two Sum", "Arrays & Hashing", "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.\nAssume each input has exactly one solution.",
            "twoSum",
            {
                "python": "def twoSum(nums: list[int], target: int) -> list[int]:\n    # Write your solution here\n    pass",
                "javascript": "function twoSum(nums, target) {\n  // Write your solution here\n}"
            },
            [
                {"input": "[2, 7, 11, 15], 9", "expectedOutput": "[0, 1]"},
                {"input": "[3, 2, 4], 6", "expectedOutput": "[1, 2]"}
            ]
        ),
        (
            "Valid Anagram", "Strings", "Given two strings s and t, return true if t is an anagram of s, and false otherwise.\nAn anagram is formed by rearranging letters.",
            "isAnagram",
            {
                "python": "def isAnagram(s: str, t: str) -> bool:\n    # Write your solution here\n    pass",
                "javascript": "function isAnagram(s, t) {\n  // Write your solution here\n}"
            },
            [
                {"input": "\"anagram\", \"nagaram\"", "expectedOutput": "true"},
                {"input": "\"rat\", \"car\"", "expectedOutput": "false"}
            ]
        ),
        (
            "Maximum Subarray", "Arrays & Dynamic Programming", "Given an integer array nums, find the subarray with the largest sum, and return its sum (Kadane's Algorithm).",
            "maxSubArray",
            {
                "python": "def maxSubArray(nums: list[int]) -> int:\n    # Write your solution here\n    pass",
                "javascript": "function maxSubArray(nums) {\n  // Write your solution here\n}"
            },
            [
                {"input": "[-2, 1, -3, 4, -1, 2, 1, -5, 4]", "expectedOutput": "6"},
                {"input": "[1]", "expectedOutput": "1"}
            ]
        ),
        (
            "Contains Duplicate", "Arrays & Hashing", "Given an integer array nums, return true if any value appears at least twice in the array, and return false if every element is distinct.",
            "containsDuplicate",
            {
                "python": "def containsDuplicate(nums: list[int]) -> bool:\n    # Write your solution here\n    pass",
                "javascript": "function containsDuplicate(nums) {\n  // Write your solution here\n}"
            },
            [
                {"input": "[1, 2, 3, 1]", "expectedOutput": "true"},
                {"input": "[1, 2, 3, 4]", "expectedOutput": "false"}
            ]
        ),
        (
            "Palindrome Number", "Math & Logic", "Given an integer x, return true if x is a palindrome, and false otherwise. An integer is a palindrome when it reads the same forward and backward.",
            "isPalindrome",
            {
                "python": "def isPalindrome(x: int) -> bool:\n    # Write your solution here\n    pass",
                "javascript": "function isPalindrome(x) {\n  // Write your solution here\n}"
            },
            [
                {"input": "121", "expectedOutput": "true"},
                {"input": "-121", "expectedOutput": "false"},
                {"input": "10", "expectedOutput": "false"}
            ]
        ),
        (
            "Reverse String", "Two Pointers", "Write a function that reverses a string. Return the reversed string.",
            "reverseString",
            {
                "python": "def reverseString(s: str) -> str:\n    # Write your solution here\n    pass",
                "javascript": "function reverseString(s) {\n  // Write your solution here\n}"
            },
            [
                {"input": "\"hello\"", "expectedOutput": "\"olleh\""},
                {"input": "\"Campus\"", "expectedOutput": "\"supmaC\""}
            ]
        ),
        (
            "Move Zeroes", "Arrays & Two Pointers", "Given an integer array nums, move all 0's to the end of it while maintaining the relative order of the non-zero elements. Return the modified array.",
            "moveZeroes",
            {
                "python": "def moveZeroes(nums: list[int]) -> list[int]:\n    # Write your solution here\n    pass",
                "javascript": "function moveZeroes(nums) {\n  // Write your solution here\n}"
            },
            [
                {"input": "[0, 1, 0, 3, 12]", "expectedOutput": "[1, 3, 12, 0, 0]"},
                {"input": "[0]", "expectedOutput": "[0]"}
            ]
        ),
        (
            "Single Number", "Bit Manipulation", "Given a non-empty array of integers nums, every element appears twice except for one. Find that single one in O(N) time and O(1) space.",
            "singleNumber",
            {
                "python": "def singleNumber(nums: list[int]) -> int:\n    # Write your solution here\n    pass",
                "javascript": "function singleNumber(nums) {\n  // Write your solution here\n}"
            },
            [
                {"input": "[2, 2, 1]", "expectedOutput": "1"},
                {"input": "[4, 1, 2, 1, 2]", "expectedOutput": "4"}
            ]
        ),
        (
            "Fizz Buzz", "Conditionals & Logic", "Given an integer n, return a string array result where result[i] is 'FizzBuzz' if i is divisible by 3 and 5, 'Fizz' if divisible by 3, 'Buzz' if by 5, or the number as string.",
            "fizzBuzz",
            {
                "python": "def fizzBuzz(n: int) -> list[str]:\n    # Write your solution here\n    pass",
                "javascript": "function fizzBuzz(n) {\n  // Write your solution here\n}"
            },
            [
                {"input": "3", "expectedOutput": "[\"1\", \"2\", \"Fizz\"]"},
                {"input": "5", "expectedOutput": "[\"1\", \"2\", \"Fizz\", \"4\", \"Buzz\"]"}
            ]
        ),
        (
            "Binary Search", "Binary Search", "Given an array of integers nums which is sorted in ascending order, and an integer target, write a function to search target in nums. Return its index or -1 if not found.",
            "search",
            {
                "python": "def search(nums: list[int], target: int) -> int:\n    # Write your solution here\n    pass",
                "javascript": "function search(nums, target) {\n  // Write your solution here\n}"
            },
            [
                {"input": "[-1, 0, 3, 5, 9, 12], 9", "expectedOutput": "4"},
                {"input": "[-1, 0, 3, 5, 9, 12], 2", "expectedOutput": "-1"}
            ]
        ),
        (
            "Length of Last Word", "Strings", "Given a string s consisting of words and spaces, return the length of the last word in the string.",
            "lengthOfLastWord",
            {
                "python": "def lengthOfLastWord(s: str) -> int:\n    # Write your solution here\n    pass",
                "javascript": "function lengthOfLastWord(s) {\n  // Write your solution here\n}"
            },
            [
                {"input": "\"Hello World\"", "expectedOutput": "5"},
                {"input": "\"   fly me   to   the moon  \"", "expectedOutput": "4"}
            ]
        ),
        (
            "Count Vowels", "Strings & Sets", "Given a string s, return the count of vowels (a, e, i, o, u) regardless of case.",
            "countVowels",
            {
                "python": "def countVowels(s: str) -> int:\n    # Write your solution here\n    pass",
                "javascript": "function countVowels(s) {\n  // Write your solution here\n}"
            },
            [
                {"input": "\"PlacementDrive\"", "expectedOutput": "5"},
                {"input": "\"xyz\"", "expectedOutput": "0"}
            ]
        ),
        (
            "Power of Two", "Bit Manipulation & Math", "Given an integer n, return true if it is a power of two. Otherwise, return false.",
            "isPowerOfTwo",
            {
                "python": "def isPowerOfTwo(n: int) -> bool:\n    # Write your solution here\n    pass",
                "javascript": "function isPowerOfTwo(n) {\n  // Write your solution here\n}"
            },
            [
                {"input": "16", "expectedOutput": "true"},
                {"input": "3", "expectedOutput": "false"},
                {"input": "1", "expectedOutput": "true"}
            ]
        ),
        (
            "Climbing Stairs", "Dynamic Programming", "You are climbing a staircase. It takes n steps to reach the top. Each time you can climb 1 or 2 steps. In how many distinct ways can you climb to the top?",
            "climbStairs",
            {
                "python": "def climbStairs(n: int) -> int:\n    # Write your solution here\n    pass",
                "javascript": "function climbStairs(n) {\n  // Write your solution here\n}"
            },
            [
                {"input": "2", "expectedOutput": "2"},
                {"input": "3", "expectedOutput": "3"}
            ]
        )
    ]

    for title, topic, prompt, fn_name, starter_code, test_cases in coding_data:
        questions.append((
            f"q_code_{uuid.uuid4().hex[:8]}", "Common", "Coding", topic, "Medium", "coding",
            f"**{title}**\n\n{prompt}", None, None, f"Implement {fn_name} using standard algorithm.",
            json.dumps(starter_code), json.dumps(test_cases), "seed", now_iso
        ))

    cursor.executemany("""
    INSERT OR REPLACE INTO questions (
        id, role, category, topic, difficulty, question_type,
        prompt, options_json, correct_answer, explanation,
        starter_code_json, test_cases_json, source, created_date
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
    """, questions)

    print(f"Seeded {len(questions)} placement questions into SQLite database.")

def calculate_streak(conn, email, today_str):
    """
    Calculate consecutive daily assessment streak for user.
    """
    cursor = conn.cursor()
    cursor.execute("""
    SELECT DISTINCT assessment_date
    FROM daily_assessments
    WHERE user_email = ?
    ORDER BY assessment_date DESC;
    """, (email,))
    rows = cursor.fetchall()

    if not rows:
        return 0

    dates = [r['assessment_date'] for r in rows]
    today_dt = datetime.strptime(today_str, "%Y-%m-%d")
    yesterday_str = (today_dt - timedelta(days=1)).strftime("%Y-%m-%d")

    # If completed today, streak starts from today
    # If completed yesterday, streak starts from yesterday
    streak = 0
    curr_dt = today_dt

    if today_str not in dates:
        if yesterday_str not in dates:
            return 0
        curr_dt = today_dt - timedelta(days=1)

    while True:
        check_str = curr_dt.strftime("%Y-%m-%d")
        if check_str in dates:
            streak += 1
            curr_dt -= timedelta(days=1)
        else:
            break

    return streak

def get_assessment_status(email, today_str):
    """Return today's completion status, streak, and notification."""
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
    SELECT * FROM daily_assessments
    WHERE user_email = ? AND assessment_date = ?
    LIMIT 1;
    """, (email, today_str))
    today_row = cursor.fetchone()

    cursor.execute("""
    SELECT COUNT(*) AS total, MAX(assessment_date) AS last_date
    FROM daily_assessments
    WHERE user_email = ?;
    """, (email,))
    stat_row = cursor.fetchone()

    streak = calculate_streak(conn, email, today_str)
    completed_today = today_row is not None
    total_assessments = stat_row['total'] if stat_row else 0
    last_date = stat_row['last_date'] if stat_row else None

    # Calculate missed days and dynamic question count (15 to 35 max)
    missed_days = 0
    today_dt = datetime.strptime(today_str, "%Y-%m-%d").date()
    if last_date:
        try:
            last_dt = datetime.strptime(last_date, "%Y-%m-%d").date()
            diff_days = (today_dt - last_dt).days
            # If diff_days == 1, yesterday was completed, so 0 missed days.
            # If diff_days >= 2, diff_days - 1 days were missed.
            missed_days = max(0, diff_days - 1)
        except Exception:
            missed_days = 0
    else:
        # Check user account registration / creation date
        try:
            users_file = os.path.join(DATA_DIR, 'users.json')
            if os.path.exists(users_file):
                with open(users_file, 'r', encoding='utf-8') as f:
                    udata = json.load(f)
                    created_at_str = udata.get("users", {}).get(email, {}).get("created_at")
                    if created_at_str:
                        clean_created = created_at_str.replace("Z", "+00:00")
                        created_dt = datetime.fromisoformat(clean_created).date()
                        missed_days = max(0, (today_dt - created_dt).days)
        except Exception:
            missed_days = 0

    if completed_today:
        required_questions = 20
        penalty_questions = 0
    else:
        penalty_questions = min(15, missed_days * 5)
        required_questions = 20 + penalty_questions

    # Fetch user's target role from users.json if available
    target_role = "Software Engineer (SDE)"
    try:
        users_file = os.path.join(DATA_DIR, 'users.json')
        if os.path.exists(users_file):
            with open(users_file, 'r', encoding='utf-8') as f:
                udata = json.load(f)
                target_role = udata.get("users", {}).get(email, {}).get("state", {}).get("profile", {}).get("targetRole") or target_role
    except Exception:
        pass

    notification_msg = None
    if not completed_today:
        notification_msg = f"Daily Assessment Pending — Today's test has {required_questions} questions (including 3 coding problems). Complete it now to keep your streak!"

    conn.close()

    return {
        "completedToday": completed_today,
        "dailyStreak": streak,
        "lastCompletedDate": last_date,
        "totalAssessments": total_assessments,
        "notificationMessage": notification_msg,
        "requiredQuestions": required_questions,
        "penaltyQuestions": penalty_questions,
        "missedDays": missed_days,
        "todayAssessment": dict(today_row) if today_row else None
    }

def get_daily_questions(email, role, today_str, total_count=20):
    """
    Fetch today's assessment set for the role with dynamic length (20 to 35):
    - Base: 7 Aptitude (balanced across 4 pillars), 8 Technical, 3 Coding, 2 HR (20 questions)
    - Penalty escalation scales by +5 per missed day up to 35 questions max.
    """
    conn = get_connection()
    cursor = conn.cursor()

    # Deterministic rotation seed based on date string
    date_hash = sum(ord(c) for c in today_str)

    # Calculate question distribution matching total_count (min 20, max 35)
    total_count = max(20, min(35, total_count))
    coding_count = 3 if total_count < 30 else 4
    hr_count = 2 if total_count < 25 else (3 if total_count < 35 else 4)
    remaining = total_count - coding_count - hr_count
    apt_count = remaining // 2
    tech_count = remaining - apt_count

    # 1. Aptitude MCQs balanced across all 4 syllabus pillars (Quantitative, Logical, Verbal, Data Interpretation)
    pillars = ["Quantitative", "Logical", "Verbal", "Data Interpretation"]
    apt_selected = []
    pillar_buckets = {}
    for idx_p, pil in enumerate(pillars):
        cursor.execute("SELECT * FROM aptitude_questions WHERE category = ? ORDER BY id ASC;", (pil,))
        rows = [dict(r) for r in cursor.fetchall()]
        if rows:
            pillar_buckets[pil] = rows

    if len(pillar_buckets) > 0:
        for i in range(apt_count):
            pil = pillars[i % len(pillars)]
            bucket = pillar_buckets.get(pil) or next(iter(pillar_buckets.values()))
            offset = (date_hash * (i + 3)) % len(bucket)
            raw = bucket[offset]
            apt_selected.append({
                "id": raw["id"],
                "category": "Aptitude",
                "aptitudeCategory": raw["category"],
                "topic": f"{raw['topic']} ({raw['category']})",
                "prompt": raw["question"],
                "options_json": raw["options_json"],
                "correct_answer": str(raw["correct_answer"]),
                "explanation": f"Shortcut: {raw.get('shortcut_formula', '')}\n{raw.get('explanation', '')}".strip(),
                "question_type": "mcq",
                "starter_code_json": None,
                "test_cases_json": None,
            })
    else:
        cursor.execute("SELECT * FROM questions WHERE category = 'Aptitude' ORDER BY id ASC;")
        apt_all = [dict(r) for r in cursor.fetchall()]
        apt_total = len(apt_all)
        if apt_total > 0:
            offset = date_hash % apt_total
            for i in range(apt_count):
                apt_selected.append(apt_all[(offset + i) % apt_total])

    # 2. Technical MCQs (for specified role or fallback)
    cursor.execute("SELECT * FROM questions WHERE category = 'Technical' AND role = ? ORDER BY id ASC;", (role,))
    tech_all = [dict(r) for r in cursor.fetchall()]
    if len(tech_all) < tech_count:
        # Fallback to Software Engineer (SDE) if role has insufficient questions
        cursor.execute("SELECT * FROM questions WHERE category = 'Technical' AND role = 'Software Engineer (SDE)' ORDER BY id ASC;")
        tech_all = [dict(r) for r in cursor.fetchall()]
    
    tech_total = len(tech_all)
    tech_selected = []
    if tech_total > 0:
        offset = (date_hash * 3) % tech_total
        for i in range(tech_count):
            tech_selected.append(tech_all[(offset + i) % tech_total])

    # 3. Coding & DSA Live Problems (at least 3 problems)
    cursor.execute("SELECT * FROM questions WHERE category = 'Coding' ORDER BY id ASC;")
    code_all = [dict(r) for r in cursor.fetchall()]
    code_total = len(code_all)
    code_selected = []
    if code_total > 0:
        offset = (date_hash * 7) % code_total
        for i in range(coding_count):
            code_selected.append(code_all[(offset + i) % code_total])

    # 4. HR & Behavioral MCQs
    cursor.execute("SELECT * FROM questions WHERE category = 'HR' ORDER BY id ASC;")
    hr_all = [dict(r) for r in cursor.fetchall()]
    hr_total = len(hr_all)
    hr_selected = []
    if hr_total > 0:
        offset = (date_hash * 11) % hr_total
        for i in range(hr_count):
            hr_selected.append(hr_all[(offset + i) % hr_total])

    conn.close()

    # Format questions cleanly for client
    def format_q(q):
        opts = json.loads(q['options_json']) if q['options_json'] else []
        starter = json.loads(q['starter_code_json']) if q['starter_code_json'] else None
        test_cases = json.loads(q['test_cases_json']) if q['test_cases_json'] else None
        return {
            "id": q['id'],
            "section": q['category'].lower(),
            "sectionTitle": f"{q['category']} & Core",
            "topic": q['topic'],
            "question": q['prompt'],
            "options": opts,
            "correctAnswer": int(q['correct_answer']) if q['correct_answer'] and q['correct_answer'].isdigit() else 0,
            "explanation": q['explanation'],
            "questionType": q['question_type'],
            "starterCode": starter,
            "testCases": test_cases
        }

    return {
        "aptitude": [format_q(q) for q in apt_selected],
        "technical": [format_q(q) for q in tech_selected],
        "coding": [format_q(q) for q in code_selected],
        "hr": [format_q(q) for q in hr_selected]
    }

def record_assessment(data):
    """
    Save calculated daily assessment into SQLite daily_assessments table.
    """
    conn = get_connection()
    cursor = conn.cursor()

    email = data.get("email", "").strip().lower()
    role = data.get("role", "Software Engineer (SDE)")
    today_str = data.get("date") or datetime.now(timezone.utc).strftime("%Y-%m-%d")
    now_iso = datetime.now(timezone.utc).isoformat()

    assessment_id = f"ass_{uuid.uuid4().hex[:10]}"
    wrong_questions = data.get("wrongQuestions", [])

    # Remove previous attempt for today if retaken, so today's record is clean
    cursor.execute("""
    DELETE FROM daily_assessments
    WHERE user_email = ? AND assessment_date = ?;
    """, (email, today_str))

    cursor.execute("""
    INSERT INTO daily_assessments (
        id, user_email, assessment_date, role,
        overall_score, aptitude_score, coding_score, technical_score, hr_score,
        strengths_json, weaknesses_json, skill_gaps_json, completed_at, wrong_questions_json
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
    """, (
        assessment_id,
        email,
        today_str,
        role,
        float(data.get("overallScore", 0)),
        float(data.get("aptitudeScore", 0)),
        float(data.get("codingScore", 0)),
        float(data.get("technicalScore", 0)),
        float(data.get("hrScore", 0)),
        json.dumps(data.get("strengths", [])),
        json.dumps(data.get("weaknesses", [])),
        json.dumps(data.get("skillGaps", [])),
        now_iso,
        json.dumps(wrong_questions)
    ))

    conn.commit()

    # Calculate updated streak
    streak = calculate_streak(conn, email, today_str)

    # Fetch last 10 assessments for history
    cursor.execute("""
    SELECT * FROM daily_assessments
    WHERE user_email = ?
    ORDER BY assessment_date DESC, completed_at DESC
    LIMIT 10;
    """, (email,))
    history = [dict(r) for r in cursor.fetchall()]

    conn.close()

    return {
        "id": assessment_id,
        "completedToday": True,
        "dailyStreak": streak,
        "history": history
    }

def get_assessment_history(email, limit=10):
    """Get history of assessments for user."""
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
    SELECT * FROM daily_assessments
    WHERE user_email = ?
    ORDER BY assessment_date DESC, completed_at DESC
    LIMIT ?;
    """, (email, limit))
    rows = [dict(r) for r in cursor.fetchall()]
    conn.close()
    return rows


# =============================================================================
# 71-TOPIC APTITUDE SQLITE SEEDING, QUERYING & DYNAMIC PARAMETERIZED GENERATOR
# =============================================================================

def seed_aptitude_questions(conn):
    """Seed the aptitude_questions table from backend/data/aptitude_seed.json (all 71 topics)."""
    seed_path = os.path.join(DATA_DIR, 'aptitude_seed.json')
    if not os.path.exists(seed_path):
        print(f"Warning: {seed_path} not found; skipping aptitude_questions seed.")
        return

    with open(seed_path, 'r', encoding='utf-8') as f:
        items = json.load(f)

    now_iso = datetime.now(timezone.utc).isoformat()
    rows = []
    for item in items:
        rows.append((
            item["id"],
            item["category"],
            item["topicId"],
            item["topic"],
            item.get("difficulty", "Medium"),
            item.get("company", "TCS"),
            item["question"],
            json.dumps(item["options"]),
            int(item["correctAnswer"]),
            item.get("shortcutFormula", ""),
            item.get("explanation", ""),
            item.get("source", "seed"),
            now_iso
        ))

    cursor = conn.cursor()
    cursor.executemany("""
    INSERT OR IGNORE INTO aptitude_questions (
        id, category, topic_id, topic, difficulty, company,
        question, options_json, correct_answer, shortcut_formula,
        explanation, source, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
    """, rows)
    print(f"Seeded {len(rows)} aptitude questions across 71 topics into SQLite.")


def _format_aptitude_row(row):
    return {
        "id": row["id"],
        "topicId": row["topic_id"],
        "topic": row["topic"],
        "category": row["category"],
        "difficulty": row["difficulty"],
        "company": row["company"],
        "question": row["question"],
        "options": json.loads(row["options_json"]) if row["options_json"] else [],
        "correctAnswer": int(row["correct_answer"]),
        "shortcutFormula": row["shortcut_formula"] or "",
        "explanation": row["explanation"] or "",
        "source": row["source"] or "sqlite",
    }


def get_aptitude_questions(topic_id, topic=None, difficulty=None, company=None, limit=5, exclude_ids=None):
    """Fetch non-repeating placement MCQs from aptitude_questions matching topic_id/topic."""
    conn = get_connection()
    cursor = conn.cursor()

    exclude_set = set(exclude_ids or [])
    params = [topic_id]
    query = "SELECT * FROM aptitude_questions WHERE topic_id = ?"
    if topic:
        query = "SELECT * FROM aptitude_questions WHERE (topic_id = ? OR LOWER(topic) = LOWER(?))"
        params = [topic_id, topic]

    cursor.execute(query + " ORDER BY RANDOM();", params)
    all_rows = [dict(r) for r in cursor.fetchall()]
    conn.close()

    # Filter out already-seen IDs first; fallback to full pool if exhausted
    unseen = [r for r in all_rows if r["id"] not in exclude_set]
    pool = unseen if len(unseen) >= min(limit, len(all_rows)) else all_rows

    # Prioritize difficulty & company matches while preserving variety
    def score_row(r):
        s = 0
        if difficulty and difficulty != "All" and r["difficulty"] == difficulty:
            s += 2
        if company and company not in ("Any Company", "All Companies", "Top Tech") and company.lower() in (r["company"] or "").lower():
            s += 1
        return -s

    pool.sort(key=score_row)
    selected = pool[:limit]
    return [_format_aptitude_row(r) for r in selected]


def save_generated_aptitude_questions(questions_list):
    """Cache freshly generated Gemini/AI aptitude questions into SQLite so the question bank grows."""
    if not questions_list:
        return
    conn = get_connection()
    cursor = conn.cursor()
    now_iso = datetime.now(timezone.utc).isoformat()
    rows = []
    for q in questions_list:
        qid = q.get("id") or f"apt_ai_{uuid.uuid4().hex[:10]}"
        rows.append((
            qid,
            q.get("category", "Quantitative"),
            q.get("topicId", "quant-number-system"),
            q.get("topic", "General Aptitude"),
            q.get("difficulty", "Medium"),
            q.get("company", "Top Tech"),
            q["question"],
            json.dumps(q["options"]),
            int(q["correctAnswer"]),
            q.get("shortcutFormula", ""),
            q.get("explanation", ""),
            q.get("source", "gemini"),
            now_iso
        ))

    cursor.executemany("""
    INSERT OR IGNORE INTO aptitude_questions (
        id, category, topic_id, topic, difficulty, company,
        question, options_json, correct_answer, shortcut_formula,
        explanation, source, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
    """, rows)
    conn.commit()
    conn.close()


def get_aptitude_bank_stats():
    """Return total cached aptitude question counts per category and overall."""
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT category, COUNT(*) AS cnt FROM aptitude_questions GROUP BY category;")
    by_cat = {r["category"]: r["cnt"] for r in cursor.fetchall()}
    cursor.execute("SELECT COUNT(DISTINCT topic_id) AS topics, COUNT(*) AS total FROM aptitude_questions;")
    totals = cursor.fetchone()
    conn.close()
    return {
        "totalQuestions": totals["total"] if totals else 0,
        "coveredTopics": totals["topics"] if totals else 0,
        "byCategory": by_cat
    }


def generate_parameterized_aptitude_questions(topic_id, topic, category, difficulty="Medium", company="TCS", count=5):
    """
    Generate randomized placement-grade practice questions dynamically when fresh sets are requested offline
    or without an external API key.
    """
    generated = []
    comp_label = "Top Tech" if company in ("Any Company", "All Companies", "") else company

    generators = {
        "quant-percentage": lambda i: _gen_percentage(i, topic_id, topic, category, difficulty, comp_label),
        "quant-profit-loss": lambda i: _gen_profit_loss(i, topic_id, topic, category, difficulty, comp_label),
        "quant-simple-interest": lambda i: _gen_si(i, topic_id, topic, category, difficulty, comp_label),
        "quant-time-work": lambda i: _gen_time_work(i, topic_id, topic, category, difficulty, comp_label),
        "quant-trains": lambda i: _gen_trains(i, topic_id, topic, category, difficulty, comp_label),
        "quant-average": lambda i: _gen_average(i, topic_id, topic, category, difficulty, comp_label),
        "logic-number-series": lambda i: _gen_series(i, topic_id, topic, category, difficulty, comp_label),
    }

    gen_fn = generators.get(topic_id)
    if gen_fn:
        for i in range(count):
            generated.append(gen_fn(i))
    return generated


def _make_options(ans_val, fmt="{}"):
    deltas = random.choice([[1, 2, -1], [2, 5, -2], [3, 6, -3], [5, 10, -5]])
    raw_vals = [ans_val] + [max(1, ans_val + d) if isinstance(ans_val, int) else round(ans_val + d, 2) for d in deltas]
    # Ensure uniqueness
    while len(set(raw_vals)) < 4:
        raw_vals[-1] = raw_vals[-1] + random.randint(4, 9)
    pairs = [(v == ans_val, fmt.format(v)) for v in raw_vals]
    random.shuffle(pairs)
    correct_idx = next(idx for idx, (is_ans, _) in enumerate(pairs) if is_ans)
    return [text for _, text in pairs], correct_idx


def _gen_percentage(i, topic_id, topic, category, difficulty, company):
    r = random.choice([10, 20, 25, 50, 60])
    red = round((r / (100 + r)) * 100, 2)
    ans = int(red) if red == int(red) else red
    opts, idx = _make_options(ans, "{}%")
    return {
        "id": f"apt_param_{uuid.uuid4().hex[:8]}",
        "topicId": topic_id, "topic": topic, "category": category,
        "difficulty": difficulty, "company": company,
        "question": f"If the price of a commodity rises by {r}%, by what percent must consumption be reduced so total expenditure remains unchanged?",
        "options": opts, "correctAnswer": idx,
        "shortcutFormula": "Reduction % = [r / (100 + r)] × 100",
        "explanation": f"Using [{r} / (100 + {r})] × 100 = ({r} / {100+r}) × 100 = {ans}%.",
        "source": "procedural"
    }


def _gen_profit_loss(i, topic_id, topic, category, difficulty, company):
    m = random.choice([20, 30, 40, 50, 60])
    d = random.choice([10, 15, 20, 25])
    net = m - d - (m * d) / 100
    ans = int(net) if net == int(net) else round(net, 2)
    opts, idx = _make_options(ans, "{}%")
    return {
        "id": f"apt_param_{uuid.uuid4().hex[:8]}",
        "topicId": topic_id, "topic": topic, "category": category,
        "difficulty": difficulty, "company": company,
        "question": f"A merchant marks goods {m}% above cost price and grants a discount of {d}%. What is the net profit percentage?",
        "options": opts, "correctAnswer": idx,
        "shortcutFormula": "Net % = m - d - (m × d) / 100",
        "explanation": f"Net = {m} - {d} - ({m}×{d})/100 = {m-d} - {(m*d)/100} = {ans}%.",
        "source": "procedural"
    }


def _gen_si(i, topic_id, topic, category, difficulty, company):
    p = random.choice([2000, 3000, 4000, 5000, 6000])
    r = random.choice([5, 6, 8, 10, 12])
    t = random.choice([2, 3, 4, 5])
    si = int((p * r * t) / 100)
    opts, idx = _make_options(si, "Rs. {}")
    return {
        "id": f"apt_param_{uuid.uuid4().hex[:8]}",
        "topicId": topic_id, "topic": topic, "category": category,
        "difficulty": difficulty, "company": company,
        "question": f"Calculate the simple interest on Rs. {p} at {r}% per annum for {t} years.",
        "options": opts, "correctAnswer": idx,
        "shortcutFormula": "SI = (P × R × T) / 100",
        "explanation": f"SI = ({p} × {r} × {t}) / 100 = Rs. {si}.",
        "source": "procedural"
    }


def _gen_time_work(i, topic_id, topic, category, difficulty, company):
    a, b = random.choice([(6, 12), (10, 15), (12, 24), (15, 30), (20, 30), (12, 36)])
    comb = (a * b) // (a + b)
    opts, idx = _make_options(comb, "{} days")
    return {
        "id": f"apt_param_{uuid.uuid4().hex[:8]}",
        "topicId": topic_id, "topic": topic, "category": category,
        "difficulty": difficulty, "company": company,
        "question": f"Person A can complete a task in {a} days and Person B can complete the same task in {b} days. Working together, how many days will they take?",
        "options": opts, "correctAnswer": idx,
        "shortcutFormula": "Combined Days = (A × B) / (A + B)",
        "explanation": f"({a} × {b}) / ({a} + {b}) = {a*b} / {a+b} = {comb} days.",
        "source": "procedural"
    }


def _gen_trains(i, topic_id, topic, category, difficulty, company):
    speed_kmh = random.choice([54, 72, 90])
    speed_ms = int(speed_kmh * 5 / 18)
    time_s = random.choice([15, 18, 20, 24])
    total_dist = speed_ms * time_s
    valid_trains = [x for x in [120, 150, 180, 200] if x < total_dist - 50]
    train_len = random.choice(valid_trains) if valid_trains else total_dist // 2
    plat_len = total_dist - train_len
    opts, idx = _make_options(plat_len, "{} m")
    return {
        "id": f"apt_param_{uuid.uuid4().hex[:8]}",
        "topicId": topic_id, "topic": topic, "category": category,
        "difficulty": difficulty, "company": company,
        "question": f"A {train_len}m long train moving at {speed_kmh} km/h crosses a platform in {time_s} seconds. Find the length of the platform.",
        "options": opts, "correctAnswer": idx,
        "shortcutFormula": "Platform Length = (Speed_kmh × 5/18 × Time) - Train Length",
        "explanation": f"Speed = {speed_kmh} × 5/18 = {speed_ms} m/s. Total distance = {speed_ms} × {time_s} = {speed_ms*time_s}m. Platform = {speed_ms*time_s} - {train_len} = {plat_len}m.",
        "source": "procedural"
    }


def _gen_average(i, topic_id, topic, category, difficulty, company):
    n = random.choice([15, 19, 24, 29])
    old_avg = random.choice([30, 35, 40, 45])
    inc = random.choice([1, 2])
    new_val = old_avg + (n + 1) * inc
    opts, idx = _make_options(new_val, "{} kg")
    return {
        "id": f"apt_param_{uuid.uuid4().hex[:8]}",
        "topicId": topic_id, "topic": topic, "category": category,
        "difficulty": difficulty, "company": company,
        "question": f"The average weight of {n} students is {old_avg} kg. When a teacher joins, the average increases by {inc} kg. Find the teacher's weight.",
        "options": opts, "correctAnswer": idx,
        "shortcutFormula": "New Member Weight = Old Avg + (New Count × Increase)",
        "explanation": f"Teacher's weight = {old_avg} + ({n + 1} × {inc}) = {new_val} kg.",
        "source": "procedural"
    }


def _gen_series(i, topic_id, topic, category, difficulty, company):
    a = random.randint(2, 7)
    d1 = random.randint(2, 5)
    terms = [a]
    for step in range(4):
        terms.append(terms[-1] * 2 + d1 + step)
    ans = terms[-1] * 2 + d1 + 4
    opts, idx = _make_options(ans, "{}")
    seq_str = ", ".join(str(x) for x in terms)
    return {
        "id": f"apt_param_{uuid.uuid4().hex[:8]}",
        "topicId": topic_id, "topic": topic, "category": category,
        "difficulty": difficulty, "company": company,
        "question": f"Find the next number in the series: {seq_str}, ?",
        "options": opts, "correctAnswer": idx,
        "shortcutFormula": "Next Term = 2 × Current + Incremental Offset",
        "explanation": f"Each term follows ×2 + ({d1}, {d1+1}, {d1+2}, {d1+3}, {d1+4}). Thus {terms[-1]} × 2 + {d1+4} = {ans}.",
        "source": "procedural"
    }


# =============================================================================
# 12-CAREER TECHNICAL QUESTIONS, PROGRESS & HR QUIZ DATABASE FUNCTIONS
# =============================================================================

CAREER_NAMES = [
    "Software Engineer (SDE)",
    "Full Stack Developer",
    "Data Analyst",
    "AI / Machine Learning Engineer",
    "Data Scientist",
    "Frontend Developer",
    "Backend Developer",
    "Cloud & DevOps Engineer",
    "Cybersecurity Analyst",
    "Mobile App Developer (Android / Flutter)",
    "QA / Automation Test Engineer",
    "UI / UX Designer",
]


def seed_technical_questions(conn):
    """Seed role-strict technical MCQs across all 12 careers."""
    now_iso = datetime.now(timezone.utc).isoformat()
    cursor = conn.cursor()

    raw_bank = {
        "Software Engineer (SDE)": [
            ("DSA", "Medium", "What is the worst-case time complexity of searching in a height-balanced AVL Tree of N nodes?", ["O(1)", "O(log N)", "O(N)", "O(N log N)"], 1, "AVL trees enforce a height balance factor of -1, 0, or +1, guaranteeing O(log N) search."),
            ("Operating Systems", "Medium", "Which Coffman condition states that resources already allocated to a process cannot be forcibly taken away?", ["Mutual Exclusion", "Hold and Wait", "No Preemption", "Circular Wait"], 2, "No Preemption prevents the OS from forcibly reclaiming held resources until released voluntarily."),
            ("DBMS", "Medium", "Which normal form removes transitive functional dependencies of non-key attributes on a candidate key?", ["1NF", "2NF", "3NF", "BCNF"], 2, "3NF requires 2NF plus absence of transitive dependencies among non-prime attributes."),
            ("Computer Networks", "Easy", "Which Transport-layer protocol guarantees ordered, reliable, congestion-controlled byte delivery?", ["UDP", "TCP", "ICMP", "ARP"], 1, "TCP uses sequence numbers, ACKs, and sliding windows for reliable transmission."),
            ("OOP", "Medium", "Which C++ / Java concept allows the same method signature to exhibit different runtime behavior via inheritance?", ["Encapsulation", "Runtime Polymorphism (Overriding)", "Abstraction", "Static Binding"], 1, "Method overriding resolved via virtual dispatch (vtable) implements runtime polymorphism."),
            ("System Design", "Hard", "Which caching strategy writes updates to both the cache and underlying database synchronously?", ["Write-Behind (Write-Back)", "Write-Through", "Write-Around", "Cache-Aside"], 1, "Write-Through keeps cache and DB consistent synchronously at the cost of higher write latency."),
            ("DSA", "Medium", "Which data structure is primarily used to implement Breadth-First Search (BFS) on a graph?", ["Stack", "Queue", "Min-Heap", "Trie"], 1, "FIFO Queue processes graph nodes strictly level by level."),
            ("Git & Tooling", "Easy", "Which Git command reapplies commits on top of another base branch tip creating linear history?", ["git merge --no-ff", "git rebase", "git cherry-pick", "git reset --hard"], 1, "git rebase replays feature commits sequentially onto the target branch tip."),
        ],
        "Full Stack Developer": [
            ("REST APIs", "Easy", "Which HTTP status code specifically confirms a new resource was created by a POST endpoint?", ["200 OK", "201 Created", "204 No Content", "304 Not Modified"], 1, "201 Created indicates new server resource creation."),
            ("React", "Medium", "Which hook returns a memoized callback reference to prevent unnecessary child re-renders?", ["useEffect", "useRef", "useCallback", "useLayoutEffect"], 2, "useCallback stabilizes function identity across renders when dependencies are unchanged."),
            ("Auth & JWT", "Medium", "Which part of a JSON Web Token (JWT) carries verified user claims like userId and role?", ["Header", "Payload", "Signature", "Salt"], 1, "The middle Base64URL segment (Payload) carries claims signed by the third segment."),
            ("Node.js / Express", "Medium", "What is the role of Express middleware functions receiving (req, res, next)?", ["Compiling TypeScript", "Intercepting requests/responses before passing control via next()", "Directly managing SQL connections", "Rendering CSS grids"], 1, "Middleware inspects, mutates, or short-circuits HTTP requests before invoking next()."),
            ("Databases", "Medium", "Which PostgreSQL / MySQL command ensures multiple SQL statements execute atomically all-or-nothing?", ["JOIN", "BEGIN ... COMMIT / ROLLBACK", "GROUP BY", "EXPLAIN ANALYZE"], 1, "Transaction blocks group queries atomically with rollback safety."),
            ("WebSockets", "Hard", "Which HTTP header triggers the upgrade to a persistent full-duplex WebSocket connection?", ["Upgrade: websocket", "Content-Type: stream", "X-Socket-Mode: duplex", "Keep-Alive: socket"], 0, "The HTTP/1.1 101 Switching Protocols handshake requires Upgrade: websocket."),
        ],
        "Data Analyst": [
            ("SQL", "Medium", "Which SQL window function assigns consecutive ranks without gaps even when ties occur?", ["RANK()", "DENSE_RANK()", "ROW_NUMBER()", "NTILE(4)"], 1, "DENSE_RANK() increments by 1 without skipping numbers after tied rows."),
            ("SQL", "Easy", "Which SQL clause filters aggregated groups AFTER GROUP BY has executed?", ["WHERE", "HAVING", "DISTINCT", "ORDER BY"], 1, "WHERE filters rows before aggregation; HAVING filters grouped results."),
            ("Pandas", "Easy", "Which Pandas method summarizes count, mean, std, min, max, and quartiles of numeric columns?", ["df.info()", "df.describe()", "df.head()", "df.shape"], 1, "df.describe() outputs statistical summary tables."),
            ("Statistics", "Medium", "Which average metric is least affected by extreme salary outliers?", ["Arithmetic Mean", "Median", "Range", "Variance"], 1, "Median relies on middle rank position rather than magnitude."),
            ("Visualization", "Medium", "Which chart best displays median, quartiles (IQR), and outlier data points together?", ["Pie Chart", "Box Plot", "Line Chart", "Stacked Bar"], 1, "Box-and-whisker plots explicitly display Q1, median, Q3, and outlier fences."),
            ("Excel / BI", "Easy", "In Excel, which modern lookup function replaces VLOOKUP with left-lookup support and default exact matching?", ["HLOOKUP", "XLOOKUP", "INDEX", "COUNTIF"], 1, "XLOOKUP searches any direction and defaults to exact match."),
        ],
        "AI / Machine Learning Engineer": [
            ("Optimization", "Medium", "Which optimizer combines Momentum with RMSProp using exponentially decaying gradient averages?", ["SGD", "Adam", "AdaGrad", "L-BFGS"], 1, "Adam tracks first and second moments of gradients for adaptive learning rates."),
            ("Regularization", "Medium", "Which penalty shrinks irrelevant feature coefficients strictly to zero for feature selection?", ["L1 (Lasso)", "L2 (Ridge)", "Dropout", "BatchNorm"], 0, "L1 diamond constraint vertices force sparse weights at exact zero."),
            ("Deep Learning", "Medium", "Why is ReLU preferred over Sigmoid in deep hidden layers?", ["Bounds outputs in [0,1]", "Prevents vanishing gradients for positive activations", "Eliminates bias terms", "Is strictly linear everywhere"], 1, "ReLU has derivative 1 for x > 0 instead of saturating near 0 like Sigmoid."),
            ("Metrics", "Hard", "For a dataset with 99% legitimate transactions and 1% fraud, which evaluation metric is most informative?", ["Raw Accuracy", "Precision-Recall AUC / F1-Score", "Mean Squared Error", "R-Squared"], 1, "Precision-Recall AUC and F1 properly penalize false negatives on minority fraud classes."),
            ("Transformers / LLM", "Hard", "In Transformer Self-Attention, what matrices interact via scaled dot product?", ["Encoder, Decoder, Bias", "Query (Q), Key (K), Value (V)", "Weight, Bias, Loss", "Alpha, Beta, Gamma"], 1, "Attention(Q,K,V) = softmax(QK^T / sqrt(d_k)) V."),
            ("MLOps", "Medium", "What phenomenon happens when live production input distributions shift away from training data distributions?", ["Overfitting", "Data Drift / Covariate Shift", "Gradient Clipping", "Underfitting"], 1, "Data drift degrades live model accuracy as input distributions diverge over time."),
        ],
        "Data Scientist": [
            ("Hypothesis Testing", "Medium", "If p-value = 0.02 and significance level alpha = 0.05, what is the statistical decision?", ["Accept null hypothesis H0", "Reject null hypothesis H0", "Double sample size", "H0 is proven 98% true"], 1, "When p < alpha, results are statistically significant enough to reject H0."),
            ("Regression", "Hard", "What condition occurs when error residuals in linear regression exhibit non-constant variance across X?", ["Multicollinearity", "Heteroscedasticity", "Autocorrelation", "Stationarity"], 1, "Heteroscedasticity violates OLS homoscedasticity assumption of constant error variance."),
            ("Dimensionality Reduction", "Medium", "What do Principal Components represent in PCA?", ["Correlated target classes", "Orthogonal directions capturing maximum variance", "Random cluster centroids", "Outlier vectors"], 1, "PCA finds orthogonal eigenvectors of the covariance matrix ordered by explained variance."),
            ("Ensemble Learning", "Medium", "What variance-reduction method powers Random Forests across bootstrap samples?", ["Bagging (Bootstrap Aggregating)", "Adaboost", "Stacking", "K-Means"], 0, "Bagging averages independent trees trained on random bootstrap subsets and random features."),
            ("A/B Testing", "Medium", "Why must A/B test sample size be fixed in advance via power analysis?", ["Reduce SQL storage", "Prevent peeking/p-hacking false positives", "Eliminate CSS rendering bugs", "Speed up Python imports"], 1, "Stopping early whenever p < 0.05 inflates Type-I false discovery rate."),
        ],
        "Frontend Developer": [
            ("JavaScript", "Medium", "Which queue runs Promise .then() callbacks BEFORE the next setTimeout macrotask?", ["Event Stack", "Microtask Queue", "Render Pipeline", "Web Worker Pool"], 1, "The JS event loop drains the entire Microtask Queue immediately after each call stack turn."),
            ("React", "Medium", "What causes excessive unnecessary re-renders if an index (0, 1, 2) is passed as a React list key during sorting/insertions?", ["Syntax error", "Incorrect DOM/state reconciliation across shifted list items", "CSS modules failure", "Infinite network fetch"], 1, "React reconciler pairs component state by key; unstable array indices scramble state on reordering."),
            ("CSS", "Easy", "In CSS Flexbox, which property aligns flex items along the CROSS axis?", ["justify-content", "align-items", "flex-direction", "order"], 1, "justify-content controls the main axis; align-items aligns along the perpendicular cross axis."),
            ("DOM", "Easy", "What is Event Delegation in JavaScript?", ["Cloning listeners onto every button", "Attaching a single listener to a parent container relying on event bubbling", "Disabling capture phase", "Using inline onclick attributes"], 1, "Event delegation attaches one parent listener to handle bubbled events from dynamic children."),
            ("Web Performance", "Medium", "Which Core Web Vital measures visual layout stability as page elements load?", ["LCP", "CLS (Cumulative Layout Shift)", "TTFB", "FID"], 1, "CLS quantifies unexpected layout shifts during page lifecycle."),
        ],
        "Backend Developer": [
            ("Databases", "Easy", "What does the 'I' in database ACID transactions guarantee?", ["Integrity", "Isolation", "Indexing", "Idempotency"], 1, "Isolation prevents concurrent uncommitted transactions from corrupting each other."),
            ("Caching", "Medium", "Which cache eviction policy removes items not accessed for the longest period?", ["FIFO", "LRU (Least Recently Used)", "MRU", "Random"], 1, "LRU tracks recency via hashmap + doubly linked list for O(1) get/put/evict."),
            ("Indexing", "Hard", "Which tree structure backs primary B-tree indexes in PostgreSQL and InnoDB?", ["Binary Trie", "Balanced B+ Tree", "Red-Black Binary Tree", "Skip List"], 1, "B+ Trees minimize disk I/O with high fanout and linked leaf pages for range scans."),
            ("API Architecture", "Medium", "What property guarantees an HTTP PUT or payment retry request does not duplicate side effects?", ["Caching", "Idempotency", "Pagination", "Streaming"], 1, "Idempotent endpoints produce the same server state regardless of duplicate identical retries."),
            ("Messaging", "Medium", "Why introduce Kafka or RabbitMQ between API ingestion and email/PDF generation?", ["Convert JSON to XML", "Decouple slow background tasks for asynchronous spike buffering", "Replace HTTPS encryption", "Avoid unit testing"], 1, "Message queues absorb traffic spikes and isolate slow downstream workers."),
        ],
        "Cloud & DevOps Engineer": [
            ("Docker", "Medium", "Which Linux kernel primitives isolate container PIDs/networks and limit CPU/RAM respectively?", ["cron and systemd", "Namespaces and cgroups", "SELinux and iptables", "chroot and swap"], 1, "Namespaces provide isolated views; Control Groups (cgroups) meter hardware quotas."),
            ("Kubernetes", "Medium", "Which Kubernetes controller ensures a Pod copy runs on every cluster node (ideal for log agents)?", ["Deployment", "DaemonSet", "StatefulSet", "Job"], 1, "DaemonSets schedule one pod per matching cluster node automatically."),
            ("Terraform", "Easy", "Which Terraform command previews planned infrastructure additions, changes, and deletions safely before applying?", ["terraform init", "terraform plan", "terraform destroy", "terraform fmt"], 1, "terraform plan diffs configuration against state without mutating cloud resources."),
            ("CI/CD", "Medium", "What distinguishes Continuous Deployment from Continuous Delivery?", ["Delivery uses Docker", "Continuous Deployment automatically promotes passed builds to production without manual approval", "Deployment skips tests", "Delivery only targets dev"], 1, "Continuous Delivery waits on a manual release gate; Continuous Deployment ships automatically."),
            ("Networking / Cloud", "Easy", "In AWS / Cloud, which service resolves human domain names into IP addresses and load balancers?", ["S3", "Route 53 / Cloud DNS", "EC2", "CloudWatch"], 1, "Route 53 provides authoritative managed DNS routing."),
        ],
        "Cybersecurity Analyst": [
            ("Web Security", "Medium", "What is the strongest architectural defense against SQL Injection attacks?", ["Stripping spaces", "Parameterized Queries (Prepared Statements)", "Disabling HTTPS", "Client-side validation"], 1, "Parameterized queries keep user data strictly separate from compiled SQL syntax."),
            ("CSRF", "Medium", "How do Anti-CSRF tokens and SameSite cookies mitigate Cross-Site Request Forgery?", ["Encrypting CSS", "Verifying state-changing requests originated from the legitimate app session", "Blocking all POST calls", "Hiding API URLs"], 1, "Third-party forged forms cannot read secret CSRF tokens or send SameSite=Strict cookies."),
            ("XSS", "Easy", "Which header and practice mitigate Stored Cross-Site Scripting (XSS) execution?", ["Contextual output escaping + strict Content-Security-Policy (CSP)", "Storing passwords in localStorage", "Using GET instead of POST", "Returning 500 errors"], 0, "Escaping untrusted HTML and enforcing CSP blocks injected scripts."),
            ("Cryptography", "Medium", "Which encryption scheme uses separate public and private keys (asymmetric cryptography)?", ["AES-256", "RSA / ECDSA", "SHA-256", "ChaCha20"], 1, "RSA and Elliptic Curve use asymmetric public/private key pairs."),
            ("Access Control", "Easy", "What security principle grants processes and users ONLY the permissions strictly needed for their job?", ["Security by Obscurity", "Principle of Least Privilege", "Open Access", "Implicit Trust"], 1, "Least Privilege limits blast radius if an account is compromised."),
        ],
        "Mobile App Developer (Android / Flutter)": [
            ("Android", "Medium", "Which Android Activity callback fires right after the UI becomes visible and enters interactive user focus?", ["onCreate()", "onStart()", "onResume()", "onDestroy()"], 2, "onResume() puts the Activity into the foreground active state ready for input."),
            ("Flutter", "Easy", "In Flutter, what distinguishes StatefulWidget from StatelessWidget?", ["StatelessWidget has no build()", "StatefulWidget holds mutable State triggering rebuilds via setState()", "StatelessWidget runs on server", "StatefulWidget cannot take constructor args"], 1, "StatefulWidget delegates mutable data to a persistent State object."),
            ("Performance", "Medium", "What happens if synchronous HTTP requests execute directly on Android's UI / Main thread?", ["Faster battery charge", "UI freezes / NetworkOnMainThreadException & ANR crash", "Automatic SQLite sync", "Images sharpen"], 1, "Blocking the UI thread causes frame drops and Application Not Responding (ANR) dialogs."),
            ("Mobile Storage", "Easy", "Which Android/Flutter local storage option is best for sensitive auth tokens rather than plain SharedPreferences?", ["Plain text log", "EncryptedSharedPreferences / Keychain Secure Storage", "Public Downloads folder", "URL hash"], 1, "Secure hardware-backed keystore storage protects credentials from root extraction."),
            ("Architecture", "Medium", "In MVVM mobile architecture, what sits between the UI View and Repository data layer?", ["SQLite cursor", "ViewModel holding reactive UI state", "Gradle daemon", "XML manifest"], 1, "ViewModel survives configuration changes and exposes observable UI state to Views."),
        ],
        "QA / Automation Test Engineer": [
            ("Test Pyramid", "Easy", "According to the Agile Test Pyramid, which automated test layer should be largest and fastest?", ["End-to-End UI Tests", "Unit Tests", "Manual Exploratory Tests", "Load Tests"], 1, "Unit tests run in milliseconds with zero network fragility, forming the wide base."),
            ("Playwright / Selenium", "Medium", "Why do Playwright and modern frameworks encourage data-testid / role locators over deep CSS/XPath paths?", ["XPath is banned in Chrome", "Semantic locators resist brittle layout/styling changes", "CSS selectors cannot click buttons", "Role locators skip JS"], 1, "Semantic/test-id locators stay stable when visual CSS classes or DOM wrappers change."),
            ("API Testing", "Medium", "Which HTTP status code series indicates a client-side validation or auth error (e.g., 400, 401, 404)?", ["2xx", "3xx", "4xx", "5xx"], 2, "4xx denotes Client Errors; 5xx denotes Server Failures."),
            ("Testing Types", "Easy", "What testing confirms existing features still work properly after recent bug fixes or new code merges?", ["Smoke Testing", "Regression Testing", "Fuzz Testing", "Chaos Engineering"], 1, "Regression suites detect unintended breakage in previously working functionality."),
            ("Bug Lifecycle", "Medium", "When a tester rejects a developer's fix because the bug still reproduces on staging, what status is typically set?", ["Deferred", "Reopened", "Closed", "Duplicate"], 1, "Failing verification moves a Resolved defect to Reopened."),
        ],
        "UI / UX Designer": [
            ("Accessibility", "Medium", "Under WCAG 2.1 AA guidelines, what minimum contrast ratio is required for standard body text?", ["2.0 : 1", "3.0 : 1", "4.5 : 1", "7.5 : 1"], 2, "WCAG AA mandates 4.5:1 contrast for normal text (and 3:1 for large headings)."),
            ("Gestalt Principles", "Easy", "Which Gestalt law states that UI elements placed close together are perceived as a unified group?", ["Similarity", "Proximity", "Closure", "Symmetry"], 1, "Law of Proximity uses whitespace and spacing to communicate functional grouping."),
            ("Design Systems", "Medium", "Why do modern Figma design systems use semantic Design Tokens (e.g., color.bg.primary instead of #121212)?", ["Smaller PNG export", "Seamless multi-theme (Dark/Light) switching & engineering parity", "Prevents font licensing", "Removes grid layouts"], 1, "Design tokens abstract raw hex values into reusable semantic roles across themes and code."),
            ("UX Research", "Easy", "What artifact maps a user's chronological touchpoints, thoughts, and friction points end-to-end?", ["Entity Diagram", "User Journey Map", "Color Palette", "SQL Schema"], 1, "User Journey Maps uncover emotional friction across onboarding and workflows."),
            ("Usability", "Medium", "According to Fitts's Law in interaction design, how do you make primary CTA buttons faster to tap?", ["Hide them in submenus", "Make targets larger and closer to the user's current pointer/thumb zone", "Use low contrast colors", "Add 3 confirmation modals"], 1, "Fitts's Law relates movement time directly to target distance and inversely to target size."),
        ],
    }

    rows = []
    for career, items in raw_bank.items():
        for topic, diff, q_text, opts, ans, exp in items:
            rows.append((
                f"tech_seed_{uuid.uuid4().hex[:10]}",
                career,
                topic,
                diff,
                q_text,
                json.dumps(opts),
                ans,
                exp,
                "seed",
                now_iso
            ))

    cursor.executemany("""
    INSERT OR IGNORE INTO technical_questions (
        id, career, topic, difficulty, question, options_json,
        correct_answer, explanation, source, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
    """, rows)
    print(f"Seeded {len(rows)} role-specific technical questions across 12 careers.")


def seed_hr_questions(conn):
    """Seed 25 placement-grade behavioral & situational HR MCQs."""
    now_iso = datetime.now(timezone.utc).isoformat()
    cursor = conn.cursor()

    hr_items = [
        ("STAR Method", "Easy", "What does the 'STAR' framework stand for in behavioral interviews?", ["Situation, Task, Action, Result", "Summary, Timeline, Approach, Review", "Strategy, Target, Execution, Result", "Scope, Team, Analysis, Reflection"], 0, "STAR structures stories into clear context, goal, personal action, and measurable outcome."),
        ("Conflict Resolution", "Medium", "A teammate disagrees strongly with your API schema during sprint crunch. What is the best action?", ["Escalate to HR immediately", "Schedule a brief objective 1-on-1 comparing trade-offs using requirements/data", "Silently overwrite their code", "Agree without sharing concerns"], 1, "Constructive, data-driven 1-on-1 alignment resolves engineering conflicts cleanly."),
        ("Handling Deadlines", "Medium", "Two days before release, you hit a complex blocker that will delay delivery. What should you do?", ["Hide it until launch day", "Notify your lead early with root cause, revised ETA, and mitigation options", "Skip all unit tests silently", "Blame the requirements team"], 1, "Early proactive escalation with mitigation plans maintains stakeholder trust."),
        ("Weakness Question", "Medium", "How should you answer 'What is your biggest weakness?' in a placement HR round?", ["Say 'I work too hard / I am a perfectionist'", "Share a genuine non-fatal skill gap and the concrete steps you use to improve it", "List a critical core requirement you dislike", "Say 'I have no weaknesses'"], 1, "Honest self-awareness paired with deliberate improvement systems demonstrates maturity."),
        ("Ownership & Mistakes", "Medium", "You accidentally push a bug that breaks staging right before demo. What is your immediate response?", ["Wait for QA to blame someone else", "Acknowledge it promptly, revert/fix the commit, and add a regression test", "Delete the Slack thread", "Claim staging environment was faulty"], 1, "Accountability, fast remediation, and preventive testing reflect strong engineering ownership."),
        ("Ethical Dilemma", "Hard", "You spot a hardcoded cloud API secret committed to a public repo by a teammate. What do you do?", ["Post it on social media", "Alert the teammate and security team immediately, rotate the key, and scrub git history", "Ignore it because it isn't your module", "Wait until next month's audit"], 1, "Immediate rotation + git history purge prevents credential compromise."),
        ("Company Motivation", "Easy", "What makes 'Why do you want to join our company?' answers stand out?", ["Mentioning salary and free snacks", "Connecting specific company products/engineering blogs to your verified skills and career goals", "Saying 'My college placed me here'", "Reading their Wikipedia page verbatim"], 1, "Specific engineering/product alignment demonstrates genuine research and long-term fit."),
        ("Feedback Reception", "Easy", "Your tech lead gives sharp feedback that your PR code lacks modularity. How do you react?", ["Take it personally and argue", "Thank them, ask for concrete refactoring pointers, and apply them consistently", "Stop submitting PRs", "Ask another team to approve it"], 1, "Receptiveness to feedback signals coachability and growth mindset."),
        ("Teamwork & Mentorship", "Easy", "A new intern struggles with Docker setup before their first task. How do you help?", ["Tell them to figure it out alone", "Spend 15 minutes pairing with them to walk through the container setup cleanly", "Do all their assigned tickets for them", "Complain to the manager"], 1, "Enabling teammates through quick pairing scales team productivity."),
        ("Prioritization", "Medium", "Three managers assign 'urgent' requests at the exact same hour. How do you decide what to tackle first?", ["Work randomly on the easiest one", "Evaluate business impact/deadlines, align with your direct lead, and communicate realistic ETAs", "Mute notifications for the day", "Pull an all-nighter without asking"], 1, "Impact-based triage + transparent alignment avoids misaligned work."),
        ("Adaptability", "Medium", "Mid-quarter, architecture pivots from REST to GraphQL. How do you respond?", ["Refuse to learn GraphQL", "Understand the product motivation, upskill rapidly via docs/sandbox, and assist migration", "Ask to change departments", "Write REST endpoints anyway"], 1, "Adaptability to evolving business/tech needs is essential in fast-paced teams."),
        ("Leadership", "Medium", "Before a college capstone demo, your team slides look disjointed. What shows true leadership?", ["Speak over everyone during the demo", "Organize a quick rehearsal, standardize slide transitions, and empower each teammate", "Submit only your slides", "Tell judges your group failed"], 1, "Leadership elevates the whole team's clarity and preparation."),
        ("Salary / Offer Negotiation", "Hard", "How should freshers handle compensation questions when unsure of the exact band?", ["Demand double the market rate rudely", "Share excitement for the role, ask about total compensation band/growth, and stay respectful", "Say 'Pay me anything you want'", "Refuse to discuss role scope"], 1, "Professional, market-aware curiosity keeps dialogue collaborative."),
        ("Relocation & Flexibility", "Easy", "If asked 'Are you comfortable relocating or working hybrid?', what should you communicate?", ["Be honest, clear, and enthusiastic if open, or state constraints respectfully upfront", "Lie and resign after joining", "Laugh off the question", "Demand remote work aggressively"], 0, "Transparency avoids post-offer mismatches."),
        ("Handling Ambiguity", "Hard", "A client gives vague product specs for a prototype due Friday. What is your first step?", ["Guess everything and avoid talking to the client", "Draft wireframes/assumptions quickly and hold a brief clarification call to confirm scope", "Wait until Thursday to ask", "Cancel the sprint"], 1, "Proactive assumption-checking turns ambiguity into concrete scope."),
        ("Strengths Framing", "Easy", "When highlighting a strength like 'problem-solving', what proves credibility?", ["Repeating 'I am a fast learner' three times", "Backing it up with a quantified metric or real bug/project outcome", "Criticizing peers who solve slower", "Quoting dictionary definitions"], 1, "Evidence and metrics turn generic claims into believable proof."),
        ("Failure Story", "Medium", "What do interviewers look for when asking 'Tell me about a time you failed'?", ["Someone who never makes mistakes", "Honest reflection on what went wrong, ownership without blaming, and lasting lesson applied", "Blaming teammates or professors", "Trivial flaws like 'I missed a bus'"], 1, "Accountability + concrete behavioral change shows high emotional maturity."),
        ("Cross-Functional Communication", "Medium", "How should you explain a complex database index outage to a non-technical Product Manager?", ["Read raw SQL stack traces aloud", "Explain user impact, business risk, mitigation ETA, and prevention steps in plain English", "Tell them it's too technical to understand", "Ignore their messages"], 1, "Translating technical risk into business impact and ETA bridges engineering and product."),
        ("Work-Life Balance & Stress", "Easy", "How do you maintain high output during intense placement or hackathon sprints without burning out?", ["Skip sleep for 4 days", "Time-box milestones, take brief recharge breaks, and prioritize core MVP features first", "Quit mid-way", "Multitask 8 things simultaneously"], 1, "Sustainable pacing and MVP prioritization yield higher accuracy under pressure."),
        ("Post-Interview Questions", "Easy", "When the interviewer asks 'Do you have any questions for us?', what is the best choice?", ["Say 'No, everything is clear'", "Ask thoughtful questions about engineering onboarding, team culture, or upcoming roadmap", "Ask 'How many sick leaves do I get first?'", "Ask 'Did I pass?'"], 1, "Thoughtful curiosity signals genuine enthusiasm and product thinking."),
        ("Integrity", "Hard", "Your peer suggests copying open-source GPL code into a proprietary client project without attribution. What do you do?", ["Copy it silently", "Explain licensing compliance risk and build a clean-room implementation or MIT-licensed alternative", "Rename variables so nobody notices", "Tell the client directly without warning your team"], 1, "Respecting IP and software licensing protects the organization legally and ethically."),
        ("Active Listening", "Easy", "During a technical HR round, you only half-hear a two-part question. What should you do?", ["Guess what they meant", "Politely ask for clarification or paraphrase the prompt to confirm understanding before answering", "Change the subject to your favorite project", "Stay silent"], 1, "Confirming understanding prevents answering the wrong question."),
        ("Initiative", "Medium", "You notice your team spends 2 hours weekly manually formatting CSV reports. What shows ownership?", ["Complain every Friday", "Spend an afternoon building and sharing an automated Python/Node script saving team hours", "Refuse to prepare reports", "Hire a friend secretly"], 1, "Spotting friction and automating repetitive toil shows high-impact initiative."),
        ("Culture Fit", "Easy", "Which trait matters MOST to top product engineering cultures like Amazon/Google/Zoho?", ["Blindly following orders without questions", "Customer obsession, intellectual humility, bias for action, and strong engineering rigor", "Working strictly in isolation", "Memorizing slogans"], 1, "Customer obsession + humility + bias for action drive high-performing teams."),
        ("Continuous Learning", "Easy", "How do you demonstrate genuine passion for technology outside college grades?", ["Listing only exam percentages", "Sharing open-source PRs, side projects, hackathons, or technical blogs you built", "Buying expensive hardware", "Following tech memes"], 1, "Tangible side projects and hands-on building validate practical curiosity."),
    ]

    rows = []
    for cat, diff, q_text, opts, ans, exp in hr_items:
        rows.append((
            f"hr_seed_{uuid.uuid4().hex[:10]}",
            cat,
            diff,
            q_text,
            json.dumps(opts),
            ans,
            exp,
            "seed",
            now_iso
        ))

    cursor.executemany("""
    INSERT OR IGNORE INTO hr_questions (
        id, category, difficulty, question, options_json,
        correct_answer, explanation, source, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);
    """, rows)
    print(f"Seeded {len(rows)} behavioral & situational HR MCQs into SQLite.")


def _format_tech_row(r):
    return {
        "id": r["id"],
        "career": r["career"],
        "topic": r["topic"],
        "difficulty": r["difficulty"],
        "question": r["question"],
        "options": json.loads(r["options_json"]) if r["options_json"] else [],
        "correctAnswer": int(r["correct_answer"]),
        "explanation": r["explanation"] or "",
        "source": r["source"] or "sqlite",
    }


def get_technical_questions(career, difficulty=None, limit=20, exclude_ids=None):
    """Fetch strictly career-scoped technical MCQs from SQLite."""
    conn = get_connection()
    cursor = conn.cursor()
    exclude_set = set(exclude_ids or [])

    cursor.execute("SELECT * FROM technical_questions WHERE LOWER(career) = LOWER(?) ORDER BY RANDOM();", (career,))
    rows = [dict(r) for r in cursor.fetchall()]

    # Partial match fallback if user passed short role string like 'Software Engineer'
    if not rows:
        cursor.execute("SELECT * FROM technical_questions WHERE LOWER(career) LIKE ? ORDER BY RANDOM();", (f"%{career.lower()}%",))
        rows = [dict(r) for r in cursor.fetchall()]

    conn.close()
    unseen = [r for r in rows if r["id"] not in exclude_set]
    pool = unseen if unseen else rows
    if difficulty and difficulty != "All":
        pool.sort(key=lambda r: 0 if r["difficulty"] == difficulty else 1)

    return [_format_tech_row(r) for r in pool[:limit]]


def save_generated_technical_questions(questions_list):
    if not questions_list:
        return
    conn = get_connection()
    cursor = conn.cursor()
    now_iso = datetime.now(timezone.utc).isoformat()
    rows = []
    for q in questions_list:
        rows.append((
            q.get("id") or f"tech_ai_{uuid.uuid4().hex[:10]}",
            q.get("career", "Software Engineer (SDE)"),
            q.get("topic", "Core Concepts"),
            q.get("difficulty", "Medium"),
            q["question"],
            json.dumps(q["options"]),
            int(q["correctAnswer"]),
            q.get("explanation", ""),
            q.get("source", "gemini"),
            now_iso
        ))
    cursor.executemany("""
    INSERT OR IGNORE INTO technical_questions (
        id, career, topic, difficulty, question, options_json,
        correct_answer, explanation, source, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
    """, rows)
    conn.commit()
    conn.close()


def get_technical_progress(user_email, career=None):
    conn = get_connection()
    cursor = conn.cursor()
    if career:
        cursor.execute(
            "SELECT subtopic_id FROM technical_progress WHERE user_email = ? AND career = ? AND completed = 1;",
            (user_email, career)
        )
    else:
        cursor.execute(
            "SELECT subtopic_id FROM technical_progress WHERE user_email = ? AND completed = 1;",
            (user_email,)
        )
    ids = [r["subtopic_id"] for r in cursor.fetchall()]
    conn.close()
    return ids


def toggle_technical_progress(user_email, career, subtopic_id):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute(
        "SELECT completed FROM technical_progress WHERE user_email = ? AND career = ? AND subtopic_id = ?;",
        (user_email, career, subtopic_id)
    )
    row = cursor.fetchone()
    new_val = 0 if (row and row["completed"] == 1) else 1
    now_iso = datetime.now(timezone.utc).isoformat()
    cursor.execute("""
    INSERT INTO technical_progress (user_email, career, subtopic_id, completed, completed_at)
    VALUES (?, ?, ?, ?, ?)
    ON CONFLICT(user_email, career, subtopic_id) DO UPDATE SET
        completed = excluded.completed,
        completed_at = excluded.completed_at;
    """, (user_email, career, subtopic_id, new_val, now_iso))
    conn.commit()
    conn.close()
    return bool(new_val)


def get_hr_mcq_questions(category=None, difficulty=None, limit=20, exclude_ids=None):
    conn = get_connection()
    cursor = conn.cursor()
    exclude_set = set(exclude_ids or [])
    if category and category != "All":
        cursor.execute("SELECT * FROM hr_questions WHERE LOWER(category) = LOWER(?) ORDER BY RANDOM();", (category,))
        rows = [dict(r) for r in cursor.fetchall()]
        if not rows:
            cursor.execute("SELECT * FROM hr_questions ORDER BY RANDOM();")
            rows = [dict(r) for r in cursor.fetchall()]
    else:
        cursor.execute("SELECT * FROM hr_questions ORDER BY RANDOM();")
        rows = [dict(r) for r in cursor.fetchall()]
    conn.close()

    unseen = [r for r in rows if r["id"] not in exclude_set]
    pool = unseen if unseen else rows
    if difficulty and difficulty != "All":
        pool.sort(key=lambda r: 0 if r["difficulty"] == difficulty else 1)

    return [
        {
            "id": r["id"],
            "category": r["category"],
            "difficulty": r["difficulty"],
            "question": r["question"],
            "options": json.loads(r["options_json"]) if r["options_json"] else [],
            "correctAnswer": int(r["correct_answer"]),
            "explanation": r["explanation"] or "",
            "source": r["source"] or "sqlite",
        }
        for r in pool[:limit]
    ]


def save_generated_hr_questions(questions_list):
    if not questions_list:
        return
    conn = get_connection()
    cursor = conn.cursor()
    now_iso = datetime.now(timezone.utc).isoformat()
    rows = []
    for q in questions_list:
        rows.append((
            q.get("id") or f"hr_ai_{uuid.uuid4().hex[:10]}",
            q.get("category", "Behavioral"),
            q.get("difficulty", "Medium"),
            q["question"],
            json.dumps(q["options"]),
            int(q["correctAnswer"]),
            q.get("explanation", ""),
            q.get("source", "gemini"),
            now_iso
        ))
    cursor.executemany("""
    INSERT OR IGNORE INTO hr_questions (
        id, category, difficulty, question, options_json,
        correct_answer, explanation, source, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);
    """, rows)
    conn.commit()
    conn.close()


def get_cached_subtopic_detail(career, topic, subtopic):
    cache_key = f"{career.strip().lower()}::{topic.strip().lower()}::{subtopic.strip().lower()}"
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute(
        "SELECT detail_json, source FROM subtopic_details_cache WHERE cache_key = ?;",
        (cache_key,),
    )
    row = cursor.fetchone()
    conn.close()
    if not row:
        return None
    try:
        return {"detail": json.loads(row["detail_json"]), "source": row["source"] or "sqlite"}
    except Exception:
        return None


def save_cached_subtopic_detail(career, topic, subtopic, level, detail_dict, source="gemini"):
    cache_key = f"{career.strip().lower()}::{topic.strip().lower()}::{subtopic.strip().lower()}"
    conn = get_connection()
    cursor = conn.cursor()
    now_iso = datetime.now(timezone.utc).isoformat()
    cursor.execute(
        """
        INSERT INTO subtopic_details_cache (
            cache_key, career, topic, subtopic, level, detail_json, source, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(cache_key) DO UPDATE SET
            detail_json = excluded.detail_json,
            source = excluded.source,
            created_at = excluded.created_at;
        """,
        (cache_key, career, topic, subtopic, level, json.dumps(detail_dict), source, now_iso),
    )
    conn.commit()
    conn.close()


def get_course_progress(user_email):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute(
        "SELECT course_id, completed_days_json, target_days, streak_days, updated_at FROM course_progress WHERE user_email = ?;",
        (user_email,),
    )
    courses = {}
    target_days_by_course = {}
    max_streak = 0
    latest_updated_at = None
    for r in cursor.fetchall():
        cid = r["course_id"]
        try:
            courses[cid] = json.loads(r["completed_days_json"] or "[]")
        except Exception:
            courses[cid] = []
        if r["target_days"] is not None:
            target_days_by_course[cid] = int(r["target_days"])
        max_streak = max(max_streak, int(r["streak_days"] or 0))
        if r["updated_at"] and (latest_updated_at is None or r["updated_at"] > latest_updated_at):
            latest_updated_at = r["updated_at"]
    conn.close()
    return {
        "courses": courses,
        "targetDaysByCourse": target_days_by_course,
        "streakDays": max_streak,
        "lastUpdatedAt": latest_updated_at,
    }


def save_course_progress(user_email, course_id, completed_days=None, streak_days=1, target_days=None):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute(
        "SELECT completed_days_json, target_days FROM course_progress WHERE user_email = ? AND course_id = ?;",
        (user_email, course_id),
    )
    existing_row = cursor.fetchone()
    if completed_days is None:
        if existing_row:
            try:
                clean_days = json.loads(existing_row["completed_days_json"] or "[]")
            except Exception:
                clean_days = []
        else:
            clean_days = []
    else:
        clean_days = sorted({int(d) for d in (completed_days or []) if str(d).isdigit()})

    resolved_target = None
    if target_days is not None:
        resolved_target = max(7, min(90, int(target_days)))
    elif existing_row and existing_row["target_days"] is not None:
        resolved_target = int(existing_row["target_days"])

    now_iso = datetime.now(timezone.utc).isoformat()
    cursor.execute(
        """
        INSERT INTO course_progress (user_email, course_id, completed_days_json, target_days, streak_days, updated_at)
        VALUES (?, ?, ?, ?, ?, ?)
        ON CONFLICT(user_email, course_id) DO UPDATE SET
            completed_days_json = excluded.completed_days_json,
            target_days = COALESCE(excluded.target_days, course_progress.target_days),
            streak_days = excluded.streak_days,
            updated_at = excluded.updated_at;
        """,
        (user_email, course_id, json.dumps(clean_days), resolved_target, int(streak_days), now_iso),
    )
    conn.commit()
    conn.close()
    return get_course_progress(user_email)




