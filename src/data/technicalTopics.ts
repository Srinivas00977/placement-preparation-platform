export interface InterviewQA {
  question: string;
  answer: string;
  difficulty: 'Core' | 'Intermediate' | 'Advanced';
}

export interface CuratedResource {
  title: string;
  platform: 'YouTube' | 'Documentation' | 'Practice';
  url: string;
}

export interface TechnicalTopic {
  id: string;
  title: string;
  badge: string;
  companies?: string[];
  description: string;
  keyConcepts: string[];
  revisionNotes: {
    heading: string;
    content: string[];
  }[];
  interviewQA: InterviewQA[];
  curatedResources: CuratedResource[];
}

export const TECHNICAL_TOPICS: TechnicalTopic[] = [
  // 1. DATA STRUCTURES & ALGORITHMS
  {
    id: 'tech-dsa',
    title: 'Data Structures & Algorithms',
    badge: 'DSA',
    companies: ['Google', 'Amazon', 'Microsoft', 'Flipkart'],
    description: 'Foundational algorithmic thinking, linear and non-linear data structures, searching, sorting, and asymptotic Big-O bounds.',
    keyConcepts: ['Time & Space Complexity', 'Arrays & Hash Maps', 'Trees & Heaps', 'Graphs & Traversal (BFS/DFS)', 'Dynamic Programming'],
    revisionNotes: [
      {
        heading: 'Asymptotic Analysis & Big-O Notation',
        content: [
          'Big-O (O) represents the upper bound / worst-case runtime growth.',
          'Big-Omega (Ω) represents the lower bound / best-case performance.',
          'Big-Theta (Θ) represents tight bound behavior when upper and lower bounds match.',
          'Common complexities from fastest to slowest: O(1) < O(log N) < O(N) < O(N log N) < O(N²) < O(2^N) < O(N!).',
        ],
      },
      {
        heading: 'Essential Data Structures Overview',
        content: [
          'Array / Vector: Contiguous memory, O(1) random index access, O(N) insert/delete in middle.',
          'Linked List: Non-contiguous nodes connected by pointers. O(1) prepend/append when tail is known, O(N) search.',
          'Hash Table / Map: Key-value pair with hashing function. Average O(1) search/insert, worst-case O(N) upon collisions (resolved by chaining or open addressing).',
          'Binary Search Tree (BST): Left child < Root < Right child. Balanced BST (AVL, Red-Black) guarantees O(log N) operations.',
          'Heap / Priority Queue: Complete binary tree satisfying heap property (Max or Min). Peek O(1), Insert/Extract O(log N).',
        ],
      },
    ],
    interviewQA: [
      {
        question: 'Explain the difference between Quick Sort and Merge Sort. When would you prefer one over the other?',
        answer: 'Merge Sort guarantees O(N log N) time in all cases and is a stable sort, but requires O(N) extra auxiliary memory. Quick Sort has an average time of O(N log N) and works in-place with O(log N) stack space, but its worst case is O(N²) when pivot selection is poor (e.g., sorted array with first element as pivot). Merge Sort is favored for linked lists and external sorting; Quick Sort is generally faster in cache memory for arrays.',
        difficulty: 'Core',
      },
      {
        question: 'How do you detect a cycle in a linked list and find the start node of the cycle?',
        answer: 'Use Floyd’s Cycle-Finding Algorithm (Tortoise and Hare). Initialize slow and fast pointers at head. Move slow by 1 step and fast by 2 steps. If slow == fast, a cycle exists. To find the cycle entrance, reset slow to head while keeping fast at meeting point, then move both 1 step at a time; their intersection point is the start of the cycle.',
        difficulty: 'Intermediate',
      },
      {
        question: 'What is the difference between BFS and DFS in graph traversal?',
        answer: 'BFS (Breadth-First Search) uses a Queue and explores level-by-level, finding the shortest path in unweighted graphs. DFS (Depth-First Search) uses a Stack (or recursion) to explore as deep as possible down each branch before backtracking, commonly used in topological sorting and cycle detection.',
        difficulty: 'Core',
      },
    ],
    curatedResources: [
      { title: 'Striver A2Z DSA Sheet & Playlist', platform: 'YouTube', url: 'https://takeuforward.org/strivers-a2z-dsa-course/strivers-a2z-dsa-course-sheet-2/' },
      { title: 'NeetCode 150 Problem Roadmap', platform: 'Practice', url: 'https://neetcode.io/roadmap' },
      { title: 'VisuAlgo - Visualizing Data Structures', platform: 'Documentation', url: 'https://visualgo.net/' },
    ],
  },

  // 2. OPERATING SYSTEMS
  {
    id: 'tech-os',
    title: 'Operating Systems',
    badge: 'OS',
    companies: ['Microsoft', 'Oracle', 'TCS', 'Amazon'],
    description: 'Process management, thread concurrency, memory virtualization, CPU scheduling algorithms, and deadlock resolution.',
    keyConcepts: ['Process vs Thread', 'CPU Scheduling (FCFS, SJF, RR)', 'Synchronization & Semaphores', 'Deadlocks (Coffman Conditions)', 'Paging & Virtual Memory'],
    revisionNotes: [
      {
        heading: 'Process vs Thread',
        content: [
          'A process is an executing program with its own dedicated memory space (Text, Data, Heap, Stack).',
          'A thread is a lightweight unit of execution within a process that shares Code, Data, and OS resources, but retains its own register state and Stack.',
          'Inter-process communication (IPC) requires mechanisms like Pipes, Sockets, Message Queues, or Shared Memory.',
        ],
      },
      {
        heading: 'Deadlock & Prevention',
        content: [
          'Deadlock occurs when processes are unable to proceed because each holds a resource needed by another in a circular wait.',
          'Coffman Conditions: 1. Mutual Exclusion, 2. Hold and Wait, 3. No Preemption, 4. Circular Wait.',
          'Deadlock Avoidance: Banker\'s Algorithm uses resource allocation matrices to ensure the system remains in a safe state.',
        ],
      },
    ],
    interviewQA: [
      {
        question: 'What is Virtual Memory, and how does Paging work?',
        answer: 'Virtual memory creates the illusion of a vast contiguous memory space for processes by mapping logical addresses to physical RAM frames. The logical address space is divided into fixed-size Pages, and physical memory is divided into Frames. The MMU (Memory Management Unit) uses a Page Table (accelerated by the TLB cache) to translate virtual page numbers to physical frame numbers. If an accessed page is not in RAM, a Page Fault interrupt triggers loading from disk.',
        difficulty: 'Core',
      },
      {
        question: 'Explain Mutex vs Semaphore.',
        answer: 'A Mutex (Mutual Exclusion) is a locking mechanism with ownership: only the thread that acquired the mutex can release it. A Semaphore is a signaling mechanism with a counter: a Counting Semaphore allows up to N threads access, while a Binary Semaphore can be signaled and released by any thread, not strictly the acquirer.',
        difficulty: 'Intermediate',
      },
    ],
    curatedResources: [
      { title: 'GateSmashers Operating Systems Playlist', platform: 'YouTube', url: 'https://www.youtube.com/playlist?list=PLxCzCOWd7aiGz9donHRrE9I3Mwn6XdP8p' },
      { title: 'OS Three Easy Pieces (OSTEP Book)', platform: 'Documentation', url: 'https://pages.cs.wisc.edu/~remzi/OSTEP/' },
    ],
  },

  // 3. DATABASE MANAGEMENT SYSTEMS (DBMS)
  {
    id: 'tech-dbms',
    title: 'Database Management Systems',
    badge: 'DBMS',
    companies: ['Oracle', 'Amazon', 'Zoho', 'Deloitte'],
    description: 'Relational data modeling, ACID transactions, Normalization (1NF to BCNF), indexing (B-Trees), and SQL optimization.',
    keyConcepts: ['ACID Properties', 'Normalization & Normal Forms', 'B-Tree & Hash Indexing', 'Joins & Query Optimization', 'SQL vs NoSQL'],
    revisionNotes: [
      {
        heading: 'ACID Properties of Transactions',
        content: [
          'Atomicity: All operations in a transaction succeed completely, or all roll back (all-or-nothing).',
          'Consistency: The database transitions from one valid state to another valid state preserving all integrity constraints.',
          'Isolation: Concurrent transactions execute independently without interference, configured via isolation levels (Read Uncommitted, Read Committed, Repeatable Read, Serializable).',
          'Durability: Once committed, data changes survive system crashes and power outages via Write-Ahead Logging (WAL).',
        ],
      },
      {
        heading: 'Normalization Forms',
        content: [
          '1NF: Eliminates repeating groups and ensures atomic column values with unique primary keys.',
          '2NF: Satisfies 1NF and removes partial dependencies (non-prime attributes must depend on the whole candidate key).',
          '3NF: Satisfies 2NF and eliminates transitive dependencies (non-prime attributes cannot depend on other non-prime attributes).',
          'BCNF: Stricter 3NF where for every functional dependency X -> Y, X must be a super key.',
        ],
      },
    ],
    interviewQA: [
      {
        question: 'How does database Indexing improve query performance, and what are its trade-offs?',
        answer: 'Indexes (typically structured as balanced B+ Trees) allow the database engine to find specific rows in O(log N) lookups instead of scanning every block in the table (Full Table Scan O(N)). The trade-off is additional storage overhead and slower write performance (INSERT, UPDATE, DELETE) because every mutation requires updating all associated index trees.',
        difficulty: 'Core',
      },
      {
        question: 'Differentiate between Clustered and Non-Clustered Indexes.',
        answer: 'A Clustered Index dictates the physical sorting order of data rows on disk; therefore, a table can have only ONE clustered index (usually the Primary Key). A Non-Clustered Index is stored separately from data rows and holds pointers (RowIDs or clustered key values) back to the actual data; a table can have multiple non-clustered indexes.',
        difficulty: 'Core',
      },
    ],
    curatedResources: [
      { title: 'Kunal Kushwaha / GateSmashers DBMS Complete Course', platform: 'YouTube', url: 'https://www.youtube.com/playlist?list=PLxCzCOWd7aiFAN6I8C9azFc3OmNpuZK-c' },
      { title: 'Use The Index, Luke (SQL Indexing Guide)', platform: 'Documentation', url: 'https://use-the-index-luke.com/' },
    ],
  },

  // 4. COMPUTER NETWORKS
  {
    id: 'tech-cn',
    title: 'Computer Networks',
    badge: 'CN',
    companies: ['Google', 'Infosys', 'Wipro', 'Microsoft'],
    description: 'OSI 7-layer model, TCP/IP stack, TCP 3-way handshake, HTTP/HTTPS, DNS resolution, and routing fundamentals.',
    keyConcepts: ['OSI 7-Layer vs TCP/IP', 'TCP vs UDP', 'TCP 3-Way Handshake & Flow Control', 'DNS Resolution Process', 'HTTPS & TLS/SSL Handshake'],
    revisionNotes: [
      {
        heading: 'OSI 7-Layer Reference Model',
        content: [
          '7. Application: User network interfaces (HTTP, FTP, SMTP, DNS).',
          '6. Presentation: Encryption, data compression, serialization (TLS, JPEG).',
          '5. Session: Connection sessions establishment & maintenance.',
          '4. Transport: End-to-end delivery, segmentation, ports (TCP, UDP).',
          '3. Network: Logical addressing, packet routing (IP, ICMP, Routers).',
          '2. Data Link: Physical addressing, frames, MAC addresses, switches.',
          '1. Physical: Raw binary transmission across cables, optical fibers, radio.',
        ],
      },
      {
        heading: 'TCP vs UDP',
        content: [
          'TCP: Connection-oriented, reliable transmission with acknowledgments, retransmissions, flow control (sliding window), and congestion control.',
          'UDP: Connectionless, lightweight, low-latency, best-effort delivery without ordering guarantees (ideal for video streaming, VoIP, gaming).',
        ],
      },
    ],
    interviewQA: [
      {
        question: 'What happens behind the scenes when you enter a URL like https://www.google.com in a browser and press Enter?',
        answer: '1. Browser checks cache (Browser, OS, Router, ISP). 2. If not found, recursive DNS resolution queries Root, TLD (.com), and Authoritative servers to obtain the server IP address. 3. TCP 3-Way Handshake (SYN, SYN-ACK, ACK) establishes connection over port 443. 4. TLS/SSL Handshake verifies server certificate and negotiates symmetric encryption keys. 5. Browser sends HTTP GET request. 6. Server processes request and responds with HTML/CSS/JS payload. 7. Browser renders DOM and paints webpage.',
        difficulty: 'Core',
      },
      {
        question: 'Explain the TCP 3-way handshake and 4-way termination handshake.',
        answer: 'Connection Establishment (3-way): Client sends SYN with random sequence number x. Server responds with SYN-ACK with acknowledgment x+1 and sequence number y. Client sends ACK with y+1. Connection Termination (4-way): Initiating side sends FIN. Receiving side responds with ACK. When ready to close, receiving side sends its own FIN. Initiating side sends ACK and enters TIME_WAIT state before completely terminating.',
        difficulty: 'Intermediate',
      },
    ],
    curatedResources: [
      { title: 'Computer Networks - GateSmashers Course', platform: 'YouTube', url: 'https://www.youtube.com/playlist?list=PLxCzCOWd7aiGFBD2-2joCpWOLUrDLvVV_' },
      { title: 'High Performance Browser Networking (Ilya Grigorik)', platform: 'Documentation', url: 'https://hpbn.co/' },
    ],
  },

  // 5. OBJECT-ORIENTED PROGRAMMING (OOPS)
  {
    id: 'tech-oops',
    title: 'Object-Oriented Programming & System Design',
    badge: 'OOP',
    companies: ['Zoho', 'TCS', 'Accenture', 'Cognizant'],
    description: 'Core OOP pillars (Encapsulation, Abstraction, Inheritance, Polymorphism), SOLID design principles, and essential design patterns.',
    keyConcepts: ['4 Pillars of OOP', 'SOLID Principles', 'Method Overloading vs Overriding', 'Design Patterns (Singleton, Factory, Observer)', 'Composition vs Inheritance'],
    revisionNotes: [
      {
        heading: 'The 4 Pillars of OOP',
        content: [
          'Encapsulation: Bundling data and methods operating on that data within a class while restricting direct access via access specifiers (private, protected, public).',
          'Abstraction: Hiding complex implementation details and presenting only clean essential features via Interfaces and Abstract Classes.',
          'Inheritance: Mechanism where a child class acquires attributes and behavior from a parent class, promoting code reusability.',
          'Polymorphism: Ability to take many forms. Compile-time polymorphism (Method Overloading) vs Run-time polymorphism (Method Overriding via virtual functions).',
        ],
      },
      {
        heading: 'SOLID Design Principles',
        content: [
          'S - Single Responsibility Principle: A class should have only one reason to change.',
          'O - Open/Closed Principle: Software entities should be open for extension but closed for modification.',
          'L - Liskov Substitution Principle: Objects of a superclass should be replaceable with objects of its subclasses without breaking program correctness.',
          'I - Interface Segregation Principle: Many client-specific interfaces are better than one bloated general-purpose interface.',
          'D - Dependency Inversion Principle: High-level modules should not depend on low-level modules; both should depend on abstractions.',
        ],
      },
    ],
    interviewQA: [
      {
        question: 'What is the Diamond Problem in multiple inheritance, and how is it resolved?',
        answer: 'The Diamond Problem occurs when two superclasses inherit from a single base class, and a child class inherits from both superclasses. If both superclasses override a method from the base class, the compiler cannot determine which version the child class inherits. In C++, this is resolved using Virtual Base Classes (virtual inheritance). In Java and C#, multiple inheritance of classes is prohibited; classes implement multiple Interfaces with explicit default method resolutions.',
        difficulty: 'Core',
      },
      {
        question: 'Explain the Singleton pattern and how to make it thread-safe.',
        answer: 'The Singleton pattern restricts class instantiation to a single instance across the entire application lifecycle with a global point of access. In multi-threaded environments, race conditions can instantiate multiple copies. It is made thread-safe using Double-Checked Locking with a volatile variable or using Java’s Bill Pugh static inner helper class (lazy initialization on class load without synchronization overhead).',
        difficulty: 'Intermediate',
      },
    ],
    curatedResources: [
      { title: 'Refactoring.Guru - Design Patterns & Principles', platform: 'Documentation', url: 'https://refactoring.guru/design-patterns' },
      { title: 'OOPs Concepts Complete Video Lecture', platform: 'YouTube', url: 'https://www.youtube.com/watch?v=bSrm9RXwBaI' },
    ],
  },
];
