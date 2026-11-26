import {
  type CareerSubtopic,
  type CareerTopicGroup,
  type CoreSubjectModule,
  type SubtopicResource,
} from './types';
import { SUBJECT_DSA_MASTER, SUBJECT_GENAI_APIS } from './dsaAndGenAiModules';
import { SUBJECT_SQL_17 } from './sharedSubjectsAndSheets';

type SubtopicSpec = [
  slug: string,
  title: string,
  level: CareerSubtopic['level'],
  estimatedTime: string,
  simpleExplanation: string,
  whyImportant: string,
  whatToLearn: string[],
  codeExample: string
];

export function buildSubtopicsFromSpecs(
  prefix: string,
  prerequisites: string[],
  resources: SubtopicResource[],
  specs: SubtopicSpec[]
): CareerSubtopic[] {
  return specs.map(([slug, title, level, estimatedTime, simpleExplanation, whyImportant, whatToLearn, codeExample]) => ({
    id: `${prefix}-${slug}`,
    title,
    level,
    estimatedTime,
    simpleExplanation,
    whyImportant,
    whatToLearn,
    prerequisites,
    codeExample,
    completionCriteria: `Explain ${title} clearly and solve 2 practical coding or interview checks on this concept.`,
    resources,
  }));
}

export function moduleToTopicGroup(mod: CoreSubjectModule, customId?: string): CareerTopicGroup {
  return {
    id: customId || mod.id,
    title: mod.title,
    summary: mod.summary,
    subtopics: mod.subtopics,
  };
}

// ============================================================================
// VERIFIED LINK POOLS (Official Docs, Interactive Practice & Curated Playlists)
// ============================================================================
const JAVA_LINKS: SubtopicResource[] = [
  { title: 'Dev.java Official Java Tutorials', url: 'https://dev.java/learn/', type: 'Official Docs', pricing: 'Free', level: 'Beginner' },
  { title: 'Oracle Java SE Documentation', url: 'https://docs.oracle.com/en/java/', type: 'Official Docs', pricing: 'Free', level: 'Intermediate' },
  { title: 'W3Schools Java Interactive Reference', url: 'https://www.w3schools.com/java/', type: 'Interactive Practice', pricing: 'Free', level: 'Beginner' },
  { title: 'GeeksforGeeks Java Archive', url: 'https://www.geeksforgeeks.org/java/', type: 'Tutorial', pricing: 'Free', level: 'Intermediate' },
];

const PYTHON_LINKS: SubtopicResource[] = [
  { title: 'Official Python 3 Tutorial', url: 'https://docs.python.org/3/tutorial/', type: 'Official Docs', pricing: 'Free', level: 'Beginner' },
  { title: 'W3Schools Python Playground', url: 'https://www.w3schools.com/python/', type: 'Interactive Practice', pricing: 'Free', level: 'Beginner' },
  { title: 'GeeksforGeeks Python Programming', url: 'https://www.geeksforgeeks.org/python-programming-language/', type: 'Tutorial', pricing: 'Free', level: 'Intermediate' },
];

const DBMS_LINKS: SubtopicResource[] = [
  { title: 'GeeksforGeeks Complete DBMS Notes', url: 'https://www.geeksforgeeks.org/dbms/', type: 'Tutorial', pricing: 'Free', level: 'Intermediate' },
  { title: 'Gate Smashers DBMS Playlist (YouTube)', url: 'https://www.youtube.com/playlist?list=PLxCzCOWd7aiFAN6I8CuViBuCdJgiOkT2Y', type: 'Sheet / Playlist', pricing: 'Free', level: 'Beginner' },
  { title: 'PostgreSQL Internals & Indexing Docs', url: 'https://www.postgresql.org/docs/current/indexes.html', type: 'Official Docs', pricing: 'Free', level: 'Advanced' },
  { title: 'SQLBolt Interactive SQL Practice', url: 'https://sqlbolt.com/', type: 'Interactive Practice', pricing: 'Free', level: 'Beginner' },
];

const OS_LINKS: SubtopicResource[] = [
  { title: 'GeeksforGeeks Operating Systems', url: 'https://www.geeksforgeeks.org/operating-systems/', type: 'Tutorial', pricing: 'Free', level: 'Intermediate' },
  { title: 'Gate Smashers OS Playlist (YouTube)', url: 'https://www.youtube.com/playlist?list=PLxCzCOWd7aiGz9donHRrE9I3Mwn6XdP8p', type: 'Sheet / Playlist', pricing: 'Free', level: 'Beginner' },
  { title: 'roadmap.sh Computer Science Core', url: 'https://roadmap.sh/computer-science', type: 'Tutorial', pricing: 'Free', level: 'Intermediate' },
];

const CN_LINKS: SubtopicResource[] = [
  { title: 'MDN HTTP & Web Networking Overview', url: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Overview', type: 'Official Docs', pricing: 'Free', level: 'Beginner' },
  { title: 'Gate Smashers CN Playlist (YouTube)', url: 'https://www.youtube.com/playlist?list=PLxCzCOWd7aiGFBD2-2joCpWOLUrDLvVV_', type: 'Sheet / Playlist', pricing: 'Free', level: 'Beginner' },
  { title: 'GeeksforGeeks Computer Networks', url: 'https://www.geeksforgeeks.org/computer-network-tutorials/', type: 'Tutorial', pricing: 'Free', level: 'Intermediate' },
];

const OOP_LINKS: SubtopicResource[] = [
  { title: 'GeeksforGeeks OOP Concepts', url: 'https://www.geeksforgeeks.org/object-oriented-programming-oops-concept-in-java/', type: 'Tutorial', pricing: 'Free', level: 'Beginner' },
  { title: 'roadmap.sh System Design & LLD', url: 'https://roadmap.sh/system-design', type: 'Tutorial', pricing: 'Free', level: 'Intermediate' },
  { title: 'Dev.java OOP Guide', url: 'https://dev.java/learn/oop/', type: 'Official Docs', pricing: 'Free', level: 'Beginner' },
];

const SYSDESIGN_LINKS: SubtopicResource[] = [
  { title: 'roadmap.sh System Design Roadmap', url: 'https://roadmap.sh/system-design', type: 'Tutorial', pricing: 'Free', level: 'Intermediate' },
  { title: 'GeeksforGeeks System Design Tutorial', url: 'https://www.geeksforgeeks.org/system-design-tutorial/', type: 'Tutorial', pricing: 'Free', level: 'Intermediate' },
  { title: 'PostgreSQL Partitioning & Replication Docs', url: 'https://www.postgresql.org/docs/current/ddl-partitioning.html', type: 'Official Docs', pricing: 'Free', level: 'Advanced' },
];

const GIT_LINKS: SubtopicResource[] = [
  { title: 'Official Git Pro Book (Free)', url: 'https://git-scm.com/book/en/v2', type: 'Official Docs', pricing: 'Free', level: 'Beginner' },
  { title: 'roadmap.sh Git & GitHub Guide', url: 'https://roadmap.sh/git-github', type: 'Tutorial', pricing: 'Free', level: 'Beginner' },
  { title: 'W3Schools Git Interactive Tutorial', url: 'https://www.w3schools.com/git/', type: 'Interactive Practice', pricing: 'Free', level: 'Beginner' },
];

const LINUX_LINKS: SubtopicResource[] = [
  { title: 'roadmap.sh Linux Roadmap', url: 'https://roadmap.sh/linux', type: 'Tutorial', pricing: 'Free', level: 'Beginner' },
  { title: 'GeeksforGeeks Linux Commands & Shell', url: 'https://www.geeksforgeeks.org/linux-commands/', type: 'Tutorial', pricing: 'Free', level: 'Beginner' },
  { title: 'W3Schools Bash & CLI Basics', url: 'https://www.w3schools.com/bash/', type: 'Interactive Practice', pricing: 'Free', level: 'Beginner' },
];

// ============================================================================
// 12 SHARED CORE SUBJECTS (BUILT ONCE, LINKED ACROSS ROLES)
// ============================================================================

// 1. JAVA PROGRAMMING (10 Subtopics)
export const CORE_JAVA: CoreSubjectModule = {
  id: 'core-java',
  title: 'Java Programming (10 Core Topics)',
  badge: 'Java',
  kind: 'Core Subject',
  summary: 'Strong static typing, JVM internals, OOP contracts, Collections internals, Streams, Exceptions, and Multithreading.',
  subtopics: buildSubtopicsFromSpecs('core-java', ['Programming fundamentals'], JAVA_LINKS, [
    ['syntax-types', '1. Java Basics, Primitives & String Pool', 'Beginner', '45 mins', 'Understand primitive vs wrapper types, immutability of String, and StringBuilder performance.', 'Frequently checked in round-1 output MCQs (== vs .equals()).', ['String Constant Pool vs Heap objects', 'Autoboxing/Unboxing', 'StringBuilder vs StringBuffer'], 'String a = "hi"; String b = new String("hi"); // a == b is false, a.equals(b) is true'],
    ['jvm-jre', '2. JVM, JRE, JDK & Bytecode Architecture', 'Beginner', '40 mins', 'Java compiles source to platform-independent bytecode executed by JVM classloaders, JIT, and GC.', 'Classic campus placement viva starter question.', ['JDK vs JRE vs JVM boundaries', 'Stack vs Heap memory regions', 'Mark-and-Sweep Garbage Collection'], '// Stack holds local frames; Heap stores object instances managed by GC.'],
    ['oop-contracts', '3. Classes, Records, Interfaces & Abstract Classes', 'Beginner', '50 mins', 'Design modular Java types separating contract interfaces from concrete implementations cleanly.', 'Directly tested in Java LLD & Zoho/TCS interviews.', ['Abstract Class vs Interface default methods', 'final keyword on class/method/variable', 'Composition over Inheritance'], 'public interface Payment { boolean pay(int cents); }'],
    ['exceptions', '4. Checked vs Unchecked Exceptions & Try-With-Resources', 'Beginner', '40 mins', 'Differentiate compile-time checked exceptions from runtime exceptions and prevent resource leaks.', 'Verifies defensive Java error handling.', ['throw vs throws vs try-with-resources', 'Custom domain exceptions', 'NullPointerException prevention'], 'try (BufferedReader br = new BufferedReader(fr)) { return br.readLine(); }'],
    ['collections', '5. Collections Framework (List, Set, Queue, Map)', 'Intermediate', '60 mins', 'Pick optimal structures: ArrayList vs LinkedList, HashSet vs TreeSet, ArrayDeque, and PriorityQueue.', 'Crucial for writing fast Java DSA solutions.', ['ArrayList O(1) random read vs LinkedList', 'PriorityQueue min/max heap comparators', 'Fail-fast iterators & ConcurrentModificationException'], 'PriorityQueue<Integer> pq = new PriorityQueue<>((x, y) -> y - x);'],
    ['hashmap-internals', '6. HashMap Internals, equals() & hashCode()', 'Intermediate', '50 mins', 'HashMap maps keys via hashCode() buckets -> linked chains -> Java 8 Red-Black trees above threshold 8.', 'One of the single most common Java SDE interview questions.', ['Load factor 0.75 & resize doubling', 'Why overriding equals requires overriding hashCode', 'ConcurrentHashMap bucket-level locking'], 'if (a.equals(b)) assert a.hashCode() == b.hashCode();'],
    ['streams-lambdas', '7. Java 8+ Streams, Lambdas & Optional', 'Intermediate', '55 mins', 'Process collections declaratively via filter/map/collect pipelines and avoid null traps with Optional.', 'Standard in enterprise Spring Boot interviews.', ['map vs flatMap transformations', 'Collectors.groupingBy()', 'Optional.orElse vs orElseGet'], 'List<String> upper = names.stream().filter(n -> n.length() > 3).map(String::toUpperCase).toList();'],
    ['generics', '8. Generics, Wildcards & Comparable/Comparator', 'Intermediate', '45 mins', 'Write type-safe reusable containers using <T>, ? extends T, ? super T, and custom sorting logic.', 'Demonstrates solid Java API literacy.', ['Comparable natural order vs Comparator', 'Upper/Lower bounded wildcards (PECS)', 'Type erasure at runtime'], 'Collections.sort(users, Comparator.comparingInt(User::score).reversed());'],
    ['threads', '9. Multithreading, Runnable & ExecutorService', 'Advanced', '60 mins', 'Run concurrent workloads via thread pools rather than spawning unbounded raw Thread objects.', 'Important for backend latency & concurrency questions.', ['Thread lifecycle states', 'Runnable vs Callable<V> Future', 'FixedThreadPool & CompletableFuture'], 'ExecutorService pool = Executors.newFixedThreadPool(4);'],
    ['synchronization', '10. Synchronization, volatile & Deadlock Safety', 'Advanced', '55 mins', 'Coordinate shared state safely using synchronized blocks, atomic counters, and consistent lock ordering.', 'Key differentiator for intermediate Java roles.', ['volatile visibility vs AtomicInteger CAS', 'synchronized method vs block locks', 'Avoiding circular lock acquisition'], 'private final AtomicInteger hits = new AtomicInteger(0);'],
  ]),
};

// 2. PYTHON PROGRAMMING (10 Subtopics)
export const CORE_PYTHON: CoreSubjectModule = {
  id: 'core-python',
  title: 'Python Programming (10 Core Topics)',
  badge: 'Python',
  kind: 'Core Subject',
  summary: 'Idiomatic Python data structures, comprehensions, OOP dunders, decorators, context managers, and stdlib mastery.',
  subtopics: buildSubtopicsFromSpecs('core-py', ['Programming fundamentals'], PYTHON_LINKS, [
    ['types-mutability', '1. Dynamic Typing, Mutable vs Immutable Types', 'Beginner', '35 mins', 'Strings/Tuples/Ints are immutable; Lists/Dicts/Sets mutate in place—never pass [] as default arguments.', 'Classic Python gotcha tested in almost every screening round.', ['int/str/tuple vs list/dict/set', 'Default mutable argument trap (def f(a=None))', 'is identity vs == equality'], 'def append_item(val, target=None):\n    target = [] if target is None else target\n    target.append(val); return target'],
    ['functions-args', '2. Functions, *args, **kwargs & LEGB Scope', 'Beginner', '40 mins', 'Pass variable positional and keyword arguments flexibly and understand Local/Enclosing/Global/Built-in lookup.', 'Core Python syntax checked in backend & data scripts.', ['Unpacking *list and **dict', 'Closures & nonlocal binding', 'Lambda one-liners'], 'def log_event(event, *tags, **meta):\n    return {"event": event, "tags": tags, "meta": meta}'],
    ['containers', '3. Lists, Tuples, Sets & Dictionaries Internals', 'Beginner', '50 mins', 'Use O(1) dict/set hash tables instead of linear O(N) list membership checks.', 'Directly determines whether your Python OA code avoids TLE.', ['Dict insertion order & O(1) lookup', 'collections.Counter & defaultdict', 'List slicing [::-1] & copy() vs deepcopy()'], 'from collections import Counter\nfreq = Counter("placepilot")'],
    ['comprehensions', '4. Comprehensions & Lazy Generators (yield)', 'Intermediate', '45 mins', 'Construct transformed lists/dicts cleanly and stream gigabyte datasets lazily using yield without RAM blowups.', 'Separates Pythonic developers from Java-style loopers.', ['List / Dict / Set comprehensions', 'Generator expressions (x*x for x in range(N))', 'yield state suspension'], 'squares_map = {n: n * n for n in range(1, 6) if n % 2 == 1}'],
    ['python-oop', '5. Python OOP, @dataclass & Dunder Methods', 'Intermediate', '50 mins', 'Model clean domain classes with __init__, __repr__, properties, and concise @dataclass boilerplate.', 'Tested in Python backend and ML engineering interviews.', ['self binding & @classmethod / @staticmethod', '__repr__ vs __str__', '@dataclass clean DTOs'], 'from dataclasses import dataclass\n@dataclass\nclass Job: id: str; retries: int = 0'],
    ['decorators', '6. Decorators & Higher-Order Wrappers', 'Intermediate', '45 mins', 'Wrap functions cleanly with timing, logging, auth checks, or memoization (@functools.lru_cache).', 'Used heavily across Flask/FastAPI route decorators.', ['functools.wraps preserving metadata', 'Parameterized decorators', '@lru_cache DP memoization'], 'from functools import lru_cache\n@lru_cache(None)\ndef fib(n): return n if n < 2 else fib(n-1) + fib(n-2)'],
    ['exceptions-ctx', '7. Exception Handling & Context Managers (with)', 'Beginner', '35 mins', 'Catch specific exception types cleanly and guarantee resource cleanup via with blocks.', 'Prevents silent bug swallowing and unclosed file handles.', ['try / except / else / finally', 'Never bare except:', 'Custom __enter__ / __exit__ context managers'], 'with open("data.json", "r", encoding="utf-8") as f:\n    payload = f.read()'],
    ['file-json', '8. File I/O, CSV, JSON & Regex Parsing', 'Beginner', '40 mins', 'Parse structured JSON payloads, CSV datasets, and extract text tokens safely via Python standard modules.', 'Everyday requirement in Automation, Backend, and Data roles.', ['json.loads / json.dumps', 'csv.DictReader streaming', 're.compile regex matching'], 'import json\ndata = json.loads(\'{"role":"SDE","score":92}\')'],
    ['modules-venv', '9. Packages, Virtual Environments & pip', 'Beginner', '35 mins', 'Isolate per-project dependency versions cleanly using python -m venv and requirements.txt.', 'Prevents dependency conflicts across real engineering teams.', ['__name__ == "__main__" import guard', 'Creating & activating .venv', 'requirements.txt pinning'], 'python -m venv .venv && pip install -r requirements.txt'],
    ['typing-stdlib', '10. Type Hints, heapq, bisect & itertools', 'Intermediate', '45 mins', 'Leverage typing annotations for maintainability plus stdlib heapq, bisect, and itertools for concise algorithms.', 'Power tools for clean Python interviews.', ['Type annotations List / Dict / Optional', 'heapq min-heap & bisect binary search', 'itertools combinations / permutations'], 'import bisect\npos = bisect.bisect_left([10, 20, 30, 40], 25)  # returns 2'],
  ]),
};

// 3. DSA MASTERY (16 Patterns)
export const CORE_DSA: CoreSubjectModule = SUBJECT_DSA_MASTER;

// 4. SQL MASTERY (17 Topics)
export const CORE_SQL: CoreSubjectModule = SUBJECT_SQL_17;

// 5. DBMS INTERNALS (5 Subtopics)
export const CORE_DBMS: CoreSubjectModule = {
  id: 'core-dbms',
  title: 'DBMS Internals (5 Core Topics)',
  badge: 'DBMS',
  kind: 'Core Subject',
  summary: 'Relational ER schema design, ACID transaction semantics, B+ Tree storage, concurrency locking, and WAL recovery.',
  subtopics: buildSubtopicsFromSpecs('core-dbms', ['Basic tabular data awareness'], DBMS_LINKS, [
    ['er-model', '1. ER Modeling & Relational Schema Mapping', 'Beginner', '45 mins', 'Translate Entities, Attributes, and 1:1 / 1:N / M:N relationships cleanly into normalized foreign-key tables.', 'Asked in system design and DBMS viva rounds.', ['Strong vs Weak Entities', 'M:N junction table mapping', 'Identifying Candidate & Foreign Keys'], '-- M:N Students <-> Courses maps to Enrollments(student_id, course_id, enrolled_at)'],
    ['acid-states', '2. ACID Properties & Transaction States', 'Intermediate', '50 mins', 'Guarantee all-or-nothing Atomicity, valid invariants, concurrent Isolation, and crash-safe Durability.', 'Standard interview checkpoint across SDE, Backend, and Analyst tracks.', ['Active -> Partially Committed -> Committed / Aborted', 'Atomicity via Undo logs', 'Durability via Write-Ahead Logging (WAL)'], 'BEGIN; UPDATE wallet SET bal = bal - 100 WHERE id = 1; COMMIT;'],
    ['bplus-trees', '3. B+ Tree Indexing & Storage Engine Pages', 'Intermediate', '55 mins', 'Database indexes use high-fanout B+ Trees so range scans stay fast in leaf-linked disk pages.', 'Explains WHY indexing speeds reads and slows writes.', ['Why B+ Tree beats Binary Search Tree on disk', 'Data only in linked leaf nodes', 'Clustered vs Secondary index lookups'], '-- B+ Tree of order 100 reaches 100M rows in <= 4 page seeks!'],
    ['concurrency-locks', '4. Concurrency Control (2PL & MVCC)', 'Advanced', '55 mins', 'Coordinate parallel readers/writers without dirty, non-repeatable, or phantom reads using Locks or MVCC snapshots.', 'Favorite Backend & Product Engineering DBMS depth check.', ['Shared (S) vs Exclusive (X) Locks', 'Strict Two-Phase Locking (2PL)', 'PostgreSQL MVCC Snapshot Isolation'], '-- MVCC lets readers query consistent snapshots without blocking writers.'],
    ['deadlocks-recovery', '5. Database Deadlocks & Crash Recovery (WAL)', 'Advanced', '50 mins', 'Detect cyclic lock wait-for graphs cleanly and replay WAL logs forward/backward after power failures.', 'Tests production database resilience thinking.', ['Wait-Die & Wound-Wait deadlock schemes', 'Checkpoint + Redo/Undo recovery', 'Consistent lock acquisition order'], '-- Always lock account_id = MIN(a, b) before MAX(a, b) to stop transfer deadlocks!'],
  ]),
};

// 6. OPERATING SYSTEMS (5 Subtopics)
export const CORE_OS: CoreSubjectModule = {
  id: 'core-os',
  title: 'Operating Systems (5 Core Topics)',
  badge: 'OS',
  kind: 'Core Subject',
  summary: 'Processes vs threads, CPU scheduling, synchronization primitives, deadlocks, and virtual memory paging.',
  subtopics: buildSubtopicsFromSpecs('core-os', ['Basic computer architecture'], OS_LINKS, [
    ['proc-threads', '1. Processes, Threads & Context Switching', 'Beginner', '50 mins', 'Processes isolate virtual memory via PCBs; threads share heap memory via lightweight TCBs for cheaper switches.', 'Most frequently asked OS fundamental in placements.', ['PCB vs TCB fields', 'User-level vs Kernel-level threads', 'Why process switching flushes TLBs'], '// Threads share: Code, Data, Heap, Open Files | Own: Stack, Registers, PC'],
    ['cpu-scheduling', '2. CPU Scheduling (FCFS, SJF, SRTF, Round Robin)', 'Intermediate', '55 mins', 'Balance throughput, turnaround time, and response latency using preemptive time-quantum or priority queues.', 'Frequently tested numerically in OAs and interviews.', ['Convoy effect in FCFS', 'Starvation & Aging in SJF/Priority', 'Round Robin quantum trade-offs'], '// Turnaround = Completion - Arrival | Waiting = Turnaround - Burst'],
    ['sync', '3. Synchronization (Mutex, Semaphore, Monitors)', 'Intermediate', '55 mins', 'Guard critical sections cleanly against race conditions using ownership-bound Mutexes or counting Semaphores.', 'Core concurrency concept for SDE and Backend roles.', ['Binary Semaphore vs Mutex ownership', 'Producer-Consumer & Dining Philosophers', 'Busy waiting Spinlocks vs blocking sleep'], 'sem_wait(&empty); pthread_mutex_lock(&mtx); /* critical */ pthread_mutex_unlock(&mtx);'],
    ['deadlocks', '4. Deadlocks (Coffman Conditions & Banker Algorithm)', 'Intermediate', '45 mins', 'All 4 Coffman conditions—Mutual Exclusion, Hold & Wait, No Preemption, Circular Wait—must hold for deadlock.', 'Classic round-1 MCQ and technical viva staple.', ['4 necessary Coffman conditions', 'Break Circular Wait via resource ordering', 'Banker Safety State check'], '// Need[i] = Max[i] - Allocation[i]; grant only if Need[i] <= Available'],
    ['virtual-memory', '5. Virtual Memory, Demand Paging & TLB', 'Advanced', '60 mins', 'Translate virtual addresses to physical frames via Page Tables + hardware TLB caches, swapping pages on faults.', 'High-signal question for Microsoft, Cisco, and Amazon.', ['Internal vs External Fragmentation', 'TLB Hit Ratio & Effective Access Time', 'LRU Page Replacement & Thrashing'], '// EAT = hit_ratio*(tlb + mem) + (1 - hit_ratio)*(tlb + 2*mem)'],
  ]),
};

// 7. COMPUTER NETWORKS (6 Subtopics)
export const CORE_CN: CoreSubjectModule = {
  id: 'core-cn',
  title: 'Computer Networks (6 Core Topics)',
  badge: 'CN',
  kind: 'Core Subject',
  summary: 'OSI vs TCP/IP models, HTTP/TLS, DNS lifecycle, TCP handshake vs UDP, CIDR routing, and WebSockets.',
  subtopics: buildSubtopicsFromSpecs('core-cn', ['Basic web usage'], CN_LINKS, [
    ['osi-tcpip', '1. OSI 7-Layer vs TCP/IP 4-Layer Architecture', 'Beginner', '45 mins', 'Encapsulate payloads down Application -> Transport -> Network -> Data Link -> Physical hardware frames.', 'Classic foundation question in networking and DevOps tracks.', ['Layer PDUs: Segment / Packet / Frame', 'Switch (L2) vs Router (L3)', 'Encapsulation headers overhead'], '// App -> Transport(TCP/UDP port) -> Network(IP) -> Link(MAC) -> Wire'],
    ['http-tls', '2. HTTP/1.1 vs HTTP/2, REST & HTTPS TLS Handshake', 'Intermediate', '50 mins', 'Authenticate servers with X.509 certificates and negotiate symmetric AES-GCM session keys over TLS 1.3.', 'Central to full-stack, backend, and cybersecurity rounds.', ['TLS Asymmetric Auth -> Symmetric Session Key', 'HTTP/2 Multiplexing vs Head-of-Line', 'Idempotent methods & status codes'], 'GET /api/users/42 HTTP/2  -->  200 OK (Cache-Control: max-age=60)'],
    ['dns', '3. DNS Resolution Lifecycle & Record Types', 'Beginner', '35 mins', 'Resolve human domains through Local Cache -> Recursive Resolver -> Root -> TLD -> Authoritative NS.', 'Key piece of "what happens when you enter a URL?" interviews.', ['A, AAAA, CNAME, MX, TXT records', 'DNS TTL caching & propagation', 'Round-Robin DNS load distribution'], 'dig +short api.placepilot.ai  # A -> 104.18.x.x'],
    ['tcp-udp', '4. TCP 3-Way Handshake, Flow & Congestion Control vs UDP', 'Intermediate', '55 mins', 'TCP guarantees ordered acknowledged byte streams (SYN -> SYN-ACK -> ACK); UDP trades reliability for low latency.', 'Core interview contrast (Streaming Video vs File Transfer).', ['SYN / SYN-ACK / ACK & TIME_WAIT teardown', 'Sliding Window flow control vs Slow Start AIMD', 'QUIC (HTTP/3) over UDP'], '// Client --SYN(seq=x)--> Server --SYN-ACK(y, x+1)--> Client --ACK(y+1)--> Open'],
    ['ip-subnet', '5. IPv4 Subnetting, CIDR Masks & NAT', 'Intermediate', '50 mins', 'Divide networks efficiently with /24 CIDR bitmasks while NAT translates private LAN IPs to public endpoints.', 'Tested in Cloud, DevOps, and Security interviews.', ['CIDR host count (2^(32-prefix) - 2)', 'Private RFC1918 ranges (10.x, 192.168.x)', 'NAT & Gateway Port Forwarding'], '// 192.168.1.0/26 => 64 addresses (62 usable hosts), mask 255.255.255.192'],
    ['sockets', '6. Sockets, Long Polling, SSE & WebSockets', 'Intermediate', '45 mins', 'Keep persistent full-duplex TCP connections open via HTTP 101 Upgrade for real-time chat and live tickers.', 'Directly applicable to collaborative web apps & backend APIs.', ['Short Polling vs Long Polling vs SSE vs WebSockets', 'HTTP Upgrade: websocket header', 'Heartbeat ping/pong frames'], 'Connection: Upgrade\nUpgrade: websocket  // -> 101 Switching Protocols'],
  ]),
};

// 8. OBJECT-ORIENTED DESIGN (5 Subtopics)
export const CORE_OOP: CoreSubjectModule = {
  id: 'core-oop',
  title: 'Object-Oriented Design & SOLID (5 Core Topics)',
  badge: 'OOP',
  kind: 'Core Subject',
  summary: 'Encapsulation, Abstraction, Inheritance, Polymorphism, SOLID design rules, and UML class relationships.',
  subtopics: buildSubtopicsFromSpecs('core-oop', ['Basic functions & variables'], OOP_LINKS, [
    ['encapsulation', '1. Encapsulation & Invariant Protection', 'Beginner', '30 mins', 'Bundle state with methods controlling mutations via private fields and validated setters.', 'Ensures objects never enter invalid business states.', ['private fields & invariant validation', 'Immutability benefits in concurrency', 'Getter leakage pitfalls'], 'if (amount <= 0) throw new IllegalArgumentException("Positive amount required");'],
    ['abstraction', '2. Abstraction & Programming to Interfaces', 'Beginner', '35 mins', 'Hide transport/storage complexity behind clean interfaces so callers swap implementations effortlessly.', 'Core prerequisite for maintainable LLD.', ['Abstract class shared base vs pure interface contract', 'Hiding SQL/HTTP details in Repositories', 'Dependency Inversion intro'], 'interface Notifier { void send(String msg); }'],
    ['inheritance-comp', '3. Inheritance vs Composition Rules', 'Intermediate', '40 mins', 'Prefer Has-A composition over brittle deep Is-A inheritance chains unless true Liskov substitutability holds.', 'Favorite senior design sanity check.', ['Fragile base class problem', 'Composition Strategy injection', 'Method super() chaining'], 'class OrderService { private final Notifier notifier; /* Composition */ }'],
    ['polymorphism', '4. Polymorphism (Compile-Time vs Runtime Dispatch)', 'Beginner', '35 mins', 'Use method overloading for convenience signatures and dynamic overriding for extensible runtime behavior.', 'Asked in nearly every campus Java/C++/Python viva.', ['Overloading static binding', 'Overriding dynamic vtable binding', 'Covariant return types'], 'Notifier n = new EmailNotifier(); n.send("Offer!"); // dispatches dynamically'],
    ['solid-uml', '5. SOLID Principles & UML Class Diagrams', 'Intermediate', '55 mins', 'Apply SRP, OCP, LSP, ISP, DIP alongside Association, Aggregation, and Composition UML arrows.', 'Crucial foundation for Parking Lot / Splitwise LLD rounds.', ['Single Responsibility & Open-Closed Strategy pattern', 'Liskov Substitution & Interface Segregation', 'Dependency Inversion wiring'], '// Aggregation (hollow diamond: independent lifecycle) vs Composition (filled: owned)'],
  ]),
};

// 9. SYSTEM DESIGN (6 Subtopics)
export const CORE_SYSTEM_DESIGN: CoreSubjectModule = {
  id: 'core-sysdesign',
  title: 'System Design & Scalability (6 Core Topics)',
  badge: 'SysDesign',
  kind: 'Core Subject',
  summary: 'Scaling read/write loads, Load Balancers, Caching policies, DB Sharding, CAP Theorem, and HLD/LLD blueprints.',
  subtopics: buildSubtopicsFromSpecs('core-sd', ['REST APIs & SQL Databases'], SYSDESIGN_LINKS, [
    ['scalability', '1. Horizontal vs Vertical Scaling & Back-of-Envelope Math', 'Intermediate', '45 mins', 'Estimate QPS, storage, and bandwidth early, then scale stateless app servers horizontally behind proxies.', 'Opening step in every HLD interview.', ['Vertical upgrade limits vs Horizontal statelessness', 'Peak QPS = 2x..3x Avg QPS', 'Read-heavy vs Write-heavy bottlenecks'], '// 10M DAU * 10 req/day = 100M/86400 ~= 1,150 QPS avg (~3.5k peak)'],
    ['load-balancing', '2. Load Balancing, L4 vs L7 & Health Checks', 'Intermediate', '45 mins', 'Distribute traffic cleanly across healthy replicas using Round Robin, Least Connections, or Consistent Hashing.', 'Ensures high availability during deployments or node crashes.', ['Nginx/HAProxy Reverse Proxy', 'L4 TCP forwarding vs L7 URL/Cookie routing', 'Active health checks & Sticky Sessions caution'], '// Prefer stateless JWTs so any app pod handles any request without sticky affinity.'],
    ['caching-cdn', '3. Caching (Redis, Cache-Aside, Write-Through & CDNs)', 'Intermediate', '55 mins', 'Serve hot reads in <2ms from RAM (Redis) or edge PoPs (CDN) while preventing Cache Stampede thundering herds.', 'High-yield system design leverage point.', ['Cache-Aside vs Write-Through vs Write-Behind', 'LRU eviction + TTL jitter', 'Preventing Cache Penetration with Bloom Filters'], 'val = redis.get(k); if not val: val = db.query(k); redis.setex(k, 300, val)'],
    ['sharding-rep', '4. Database Replication & Horizontal Sharding', 'Advanced', '60 mins', 'Scale read replicas asynchronously and partition huge datasets across shards using consistent shard keys.', 'Directly evaluates data-tier scaling maturity.', ['Primary-Replica lag & read-your-own-writes', 'Hash vs Range Sharding & Hotspot keys', 'Consistent Hashing virtual nodes'], '-- Hash shard_key = murmur3(user_id) % shard_count; use consistent ring to minimize resharding!'],
    ['cap-theorem', '5. CAP Theorem, PACELC & Eventual Consistency', 'Advanced', '45 mins', 'During a network Partition (P), distributed data stores trade Consistency (CP, reject stale reads) against Availability (AP).', 'Essential distributed systems trade-off question.', ['Why P cannot be ignored in real networks', 'CP (ZooKeeper/Etcd/Spanner) vs AP (Dynamo/Cassandra)', 'Quorum R + W > N formula'], '// Quorum N=3, W=2, R=2 guarantees strong intersection overlap on reads!'],
    ['hld-lld-blueprint', '6. HLD & LLD Case Studies (URL Shortener & Rate Limiter)', 'Advanced', '65 mins', 'Combine Base62 IDs, Redis Token Buckets, Async Kafka Analytics, and DB schemas into clean 30-minute designs.', 'Standard Amazon, Google, Microsoft & startup system round test.', ['Base62 URL Shortener schema + cache', 'Token Bucket vs Sliding Window Rate Limiter', 'Dead-letter async event decoupling'], '// Base62 of 7 chars = 62^7 ~= 3.5 Trillion unique short URLs!'],
  ]),
};

// 10. GIT & GITHUB (5 Subtopics)
export const CORE_GIT: CoreSubjectModule = {
  id: 'core-git',
  title: 'Git & GitHub Collaboration (5 Core Topics)',
  badge: 'Git',
  kind: 'Core Subject',
  summary: 'Staging snapshots, branching workflows, merge vs rebase semantics, clean PRs, and conflict resolution.',
  subtopics: buildSubtopicsFromSpecs('core-git', ['Terminal basics'], GIT_LINKS, [
    ['staging-history', '1. Working Tree, Staging Index & Commit Snapshots', 'Beginner', '30 mins', 'Track content hashes cleanly across Working Directory -> git add Staging -> git commit local DAG.', 'Prevents messy WIP commits and broken repo history.', ['git status, git diff --staged, git log --oneline', 'git restore vs git reset (--soft / --hard)', '.gitignore hygiene for secrets & build artifacts'], 'git add src/ && git commit -m "feat: add company pattern filter"'],
    ['branching', '2. Feature Branching & GitHub Flow', 'Beginner', '30 mins', 'Isolate every feature or bugfix cleanly on lightweight branches off main without stalling teammates.', 'Tested in collaborative engineering interviews.', ['git switch -c feat/auth', 'Short-lived feature branches vs main protection', 'Tagging immutable releases'], 'git switch -c feat/rate-limiter && git push -u origin feat/rate-limiter'],
    ['merge-rebase', '3. Merging vs Interactive Rebase & Squash', 'Intermediate', '40 mins', 'Merge preserves branching history; Rebase replays commits cleanly on top of latest main (never rebase shared public main!).', 'Classic DevOps / SWE practical question.', ['Fast-forward vs 3-way merge commits', 'git rebase main for linear history', 'Golden rule: never rebase pushed shared branches'], 'git fetch origin && git rebase origin/main'],
    ['pr-workflow', '4. Pull Requests, Code Reviews & Cherry-Pick', 'Beginner', '30 mins', 'Write focused PRs, respond cleanly to review diffs, and cherry-pick urgent hotfixes between release branches.', 'Day-1 internship expectation.', ['Atomic PR sizing & clear descriptions', 'git cherry-pick <sha> for hotfixes', 'Protected status checks before merge'], 'git cherry-pick a1b2c3d  # cleanly ports hotfix commit to release branch'],
    ['conflicts', '5. Resolving Merge Conflicts & Git Bisect Safely', 'Intermediate', '35 mins', 'Inspect <<<<<<< HEAD vs ======= conflict markers calmly, re-run tests, and use git bisect to pinpoint regressions in O(log N).', 'Shows calm engineering maturity.', ['Resolving markers -> git add -> git commit', 'git stash push/pop for urgent context switches', 'git bisect binary search across commits'], 'git bisect start HEAD v1.2.0  # finds exact offending commit cleanly'],
  ]),
};

// 11. LINUX & CLI (5 Subtopics)
export const CORE_LINUX: CoreSubjectModule = {
  id: 'core-linux',
  title: 'Linux & CLI Essentials (5 Core Topics)',
  badge: 'Linux',
  kind: 'Core Subject',
  summary: 'Permissions & chmod/chown, process & systemd inspection, bash pipelines, SSH tunnels, and network debugging.',
  subtopics: buildSubtopicsFromSpecs('core-linux', ['Basic terminal navigation'], LINUX_LINKS, [
    ['permissions', '1. Filesystem Tree & chmod/chown Permissions', 'Beginner', '35 mins', 'Control Read (4), Write (2), and Execute (1) bits across Owner, Group, and Others safely.', 'Baseline DevOps, Backend, and Cybersecurity fluency.', ['/etc, /var/log, /home, /tmp roles', 'chmod 755 vs 600 for private SSH keys', 'Symlinks ln -s & df -h disk checks'], 'chmod 600 ~/.ssh/id_ed25519 && chown deploy:deploy /var/app'],
    ['processes', '2. Processes, Signals, top/ps & systemd', 'Beginner', '35 mins', 'Monitor CPU/RAM hogs, gracefully terminate stuck daemons with SIGTERM (15) before SIGKILL (9), and inspect journalctl.', 'Essential for diagnosing production server hang-ups.', ['ps aux | grep, htop, lsof', 'SIGTERM (graceful) vs SIGKILL (-9)', 'systemctl status / journalctl -u'], 'kill -15 <pid>  # allow graceful cleanup before escalating to -9'],
    ['bash-pipes', '3. Bash Scripting, Pipes & grep/awk/sed', 'Intermediate', '45 mins', 'Chain stdout/stderr streams cleanly with |, >, find, grep, and awk to triage massive server logs in seconds.', 'Huge productivity multiplier tested in DevOps & SRE rounds.', ['exit codes $? & set -euo pipefail', 'grep -rn, awk "{print $1}", sort | uniq -c', 'cron job automation basics'], 'grep " 500 " access.log | awk \'{print $7}\' | sort | uniq -c | sort -nr | head'],
    ['ssh-scp', '4. SSH Keys, Port Forwarding & Secure Copy', 'Beginner', '35 mins', 'Authenticate passwordlessly via Ed25519 keypairs and inspect internal ports safely over SSH tunnels.', 'Daily workflow for cloud servers and bastion hosts.', ['ssh-keygen -t ed25519', 'Local SSH port tunnel -L 5432:db:5432', 'scp / rsync incremental file sync'], 'ssh -i ~/.ssh/deploy.pem -L 5432:internal-db:5432 ubuntu@bastion'],
    ['net-debug', '5. Network Diagnostics (curl, ss, ping, dig)', 'Intermediate', '40 mins', 'Pinpoint DNS vs TCP port vs TLS vs HTTP status issues systematically from CLI without guessing.', 'Tested heavily in Backend, Cloud, and SRE debugging scenarios.', ['curl -Iv to inspect TLS & headers', 'ss -tulpn listening socket check', 'dig / traceroute / nc -zv port probing'], 'ss -tulpn | grep 5000 && curl -Iv http://localhost:5000/api/health'],
  ]),
};

// 12. GENAI & MODERN APIs (5 Subtopics)
export const CORE_GENAI_APIS: CoreSubjectModule = SUBJECT_GENAI_APIS;

export const SHARED_CORE_MODULES: CoreSubjectModule[] = [
  CORE_JAVA,
  CORE_PYTHON,
  CORE_DSA,
  CORE_SQL,
  CORE_DBMS,
  CORE_OS,
  CORE_CN,
  CORE_OOP,
  CORE_SYSTEM_DESIGN,
  CORE_GIT,
  CORE_LINUX,
  CORE_GENAI_APIS,
];
