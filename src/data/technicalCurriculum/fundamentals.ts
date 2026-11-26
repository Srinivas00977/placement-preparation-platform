import { type CareerTopicGroup } from './types';

export const COMMON_FUNDAMENTALS: CareerTopicGroup[] = [
  {
    id: 'fund-prog-basics',
    title: 'Programming & Language Core',
    summary: 'Variables, control flow, functions, recursion, memory stack vs heap, and clean coding habits.',
    subtopics: [
      {
        id: 'fund-sub-oop',
        title: 'Object-Oriented Programming (OOP) Pillars',
        level: 'Beginner',
        estimatedTime: '2 hours',
        simpleExplanation:
          'OOP organizes code around reusable objects bundling data (fields) and behavior (methods) through Encapsulation, Abstraction, Inheritance, and Polymorphism.',
        whyImportant:
          'Asked in almost every campus Round 1 and Technical Interview across SDE, Full Stack, Backend, and Mobile roles.',
        whatToLearn: [
          'Classes vs Objects & Constructors',
          'Encapsulation & Access Modifiers (private, protected, public)',
          'Compile-time (Overloading) vs Runtime (Overriding) Polymorphism',
          'Interfaces vs Abstract Classes & Composition over Inheritance',
        ],
        prerequisites: ['Basic syntax in Java, Python, or C++'],
        codeExample: `class PaymentGateway {
  public void process(double amount) { System.out.println("Base: " + amount); }
}
class UpiGateway extends PaymentGateway {
  @Override
  public void process(double amount) { System.out.println("UPI instant: " + amount); }
}`,
        completionCriteria: 'Design 2 class hierarchies (e.g., Library System & Payment Processor) using polymorphism.',
        resources: [
          { title: 'Oracle Dev.java — OOP Concepts', url: 'https://dev.java/learn/oop/', type: 'Official Docs', pricing: 'Free', level: 'Beginner' },
          { title: 'Python Official Classes Tutorial', url: 'https://docs.python.org/3/tutorial/classes.html', type: 'Official Docs', pricing: 'Free', level: 'Beginner' },
          { title: 'GeeksforGeeks OOP in Java/C++', url: 'https://www.geeksforgeeks.org/object-oriented-programming-oops-concept-in-java/', type: 'Tutorial', pricing: 'Free', level: 'Beginner' },
          { title: 'W3Schools OOP Guide', url: 'https://www.w3schools.com/java/java_oop.asp', type: 'Interactive Practice', pricing: 'Free', level: 'Beginner' },
        ],
      },
      {
        id: 'fund-sub-git',
        title: 'Git Version Control & Collaborative Workflows',
        level: 'Beginner',
        estimatedTime: '90 mins',
        simpleExplanation:
          'Git snapshots source code history locally and remotely so multiple engineers can branch, merge, review, and roll back safely.',
        whyImportant:
          'Essential daily workflow skill expected during internship onboarding and team coding projects.',
        whatToLearn: [
          'init, clone, status, add, commit, push, pull',
          'Branching strategies (feature branches, PRs)',
          'git merge vs git rebase & resolving merge conflicts',
          'git stash, reset (--soft vs --hard), and revert',
        ],
        prerequisites: ['Basic terminal / CLI commands'],
        codeExample: `git checkout -b feat/auth-refresh
git add src/services/authService.ts
git commit -m "feat: handle JWT refresh cleanly"
git rebase main`,
        completionCriteria: 'Create a feature branch, simulate & resolve a merge conflict cleanly.',
        resources: [
          { title: 'roadmap.sh — Git & GitHub Guide', url: 'https://roadmap.sh/git-github', type: 'Tutorial', pricing: 'Free', level: 'Beginner' },
          { title: 'freeCodeCamp Git & GitHub Crash Course', url: 'https://www.freecodecamp.org/news/git-and-github-for-beginners/', type: 'Tutorial', pricing: 'Free', level: 'Beginner' },
          { title: 'W3Schools Interactive Git Tutorial', url: 'https://www.w3schools.com/git/', type: 'Interactive Practice', pricing: 'Free', level: 'Beginner' },
        ],
      },
    ],
  },
  {
    id: 'fund-cs-core',
    title: 'Core Computer Science Foundations',
    summary: 'Operating Systems, Relational Databases (DBMS/SQL), Computer Networks, and Big-O Analysis.',
    subtopics: [
      {
        id: 'fund-sub-os',
        title: 'Operating Systems: Processes, Threads & Deadlocks',
        level: 'Intermediate',
        estimatedTime: '3 hours',
        simpleExplanation:
          'An OS schedules CPU threads, virtualizes RAM with Paging, and prevents deadlocks among competing processes.',
        whyImportant:
          'Top-3 interview subject at Microsoft, Amazon, Oracle, TCS Digital, and Core Backend teams.',
        whatToLearn: [
          'Process PCB vs Lightweight Threads & Context Switching',
          'CPU Scheduling (FCFS, SJF, Round Robin, Priority)',
          'Mutex vs Semaphore & Producer-Consumer Problem',
          'Deadlock Coffman Conditions, Prevention & Paging/TLB',
        ],
        prerequisites: ['Basic computer architecture understanding'],
        completionCriteria: 'Explain virtual memory page faults and all 4 Coffman deadlock conditions without notes.',
        resources: [
          { title: 'GeeksforGeeks Operating Systems Notes', url: 'https://www.geeksforgeeks.org/operating-systems/', type: 'Tutorial', pricing: 'Free', level: 'Intermediate' },
          { title: 'roadmap.sh Computer Science Path', url: 'https://roadmap.sh/computer-science', type: 'Tutorial', pricing: 'Free', level: 'Beginner' },
          { title: 'VisuAlgo Process / Scheduling Concepts', url: 'https://visualgo.net/en', type: 'Interactive Practice', pricing: 'Free', level: 'Intermediate' },
        ],
      },
      {
        id: 'fund-sub-dbms',
        title: 'DBMS, SQL Joins, ACID & Normalization',
        level: 'Intermediate',
        estimatedTime: '3 hours',
        simpleExplanation:
          'Relational databases structure connected tables safely using primary/foreign keys, B+ Tree indexes, and ACID transactions.',
        whyImportant:
          'Tested across Software Engineering, Data Analyst, Backend, and Full Stack placement rounds.',
        whatToLearn: [
          'INNER, LEFT, RIGHT, SELF Joins & Subqueries',
          'Normalization (1NF, 2NF, 3NF, BCNF)',
          'ACID Properties & Isolation Levels',
          'Clustered vs Non-Clustered B+ Tree Indexes',
        ],
        prerequisites: ['Basic relational table awareness'],
        codeExample: `SELECT d.name, COUNT(e.id) AS headcount
FROM departments d
LEFT JOIN employees e ON e.dept_id = d.id
GROUP BY d.name
HAVING COUNT(e.id) >= 5;`,
        completionCriteria: 'Complete all interactive join & aggregation lessons on SQLBolt cleanly.',
        resources: [
          { title: 'SQLBolt Interactive SQL Lessons', url: 'https://sqlbolt.com/', type: 'Interactive Practice', pricing: 'Free', level: 'Beginner' },
          { title: 'W3Schools SQL Tutorial', url: 'https://www.w3schools.com/sql/', type: 'Interactive Practice', pricing: 'Free', level: 'Beginner' },
          { title: 'GeeksforGeeks DBMS & Normalization', url: 'https://www.geeksforgeeks.org/dbms/', type: 'Tutorial', pricing: 'Free', level: 'Intermediate' },
        ],
      },
    ],
  },
];
