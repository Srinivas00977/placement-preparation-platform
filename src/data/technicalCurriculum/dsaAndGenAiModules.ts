import {
  type CareerSubtopic,
  type CoreSubjectModule,
  type SubtopicResource,
} from './types';

const DSA_RESOURCES: SubtopicResource[] = [
  { title: 'Striver A2Z DSA Sheet (takeUforward)', url: 'https://takeuforward.org/strivers-a2z-dsa-course/strivers-a2z-dsa-course-sheet-2/', type: 'Sheet / Playlist', pricing: 'Free', level: 'Beginner' },
  { title: 'NeetCode 150 Roadmap & Video Explanations', url: 'https://neetcode.io/roadmap', type: 'Sheet / Playlist', pricing: 'Free', level: 'Intermediate' },
  { title: 'VisuAlgo Algorithm Visualizations', url: 'https://visualgo.net/en', type: 'Interactive Practice', pricing: 'Free', level: 'Beginner' },
  { title: 'GeeksforGeeks DSA Topic Archive', url: 'https://www.geeksforgeeks.org/data-structures/', type: 'Tutorial', pricing: 'Free', level: 'Intermediate' },
  { title: 'LeetCode Top Interview 150', url: 'https://leetcode.com/studyplan/top-interview-150/', type: 'Interactive Practice', pricing: 'Freemium', level: 'Intermediate' },
];

function makeDsaSubtopic(
  slug: string,
  title: string,
  level: CareerSubtopic['level'],
  estimatedTime: string,
  simpleExplanation: string,
  whyImportant: string,
  whatToLearn: string[],
  codeExample: string
): CareerSubtopic {
  return {
    id: `subj-dsa-${slug}`,
    title,
    level,
    estimatedTime,
    simpleExplanation,
    whyImportant,
    whatToLearn,
    prerequisites: ['Variables, loops, functions & arrays in Java / Python / C++'],
    codeExample,
    completionCriteria: `Solve 3–5 curated placement problems on ${title} from Striver A2Z or NeetCode 150 without hints.`,
    resources: DSA_RESOURCES,
  };
}

export const SUBJECT_DSA_MASTER: CoreSubjectModule = {
  id: 'mod-dsa-master',
  title: 'Data Structures & Algorithms (DSA Mastery — 16 Patterns)',
  badge: 'DSA 16',
  kind: 'Core Subject',
  summary: 'Complete placement DSA playbook from Big-O complexity and Hashing through Trees, Graphs, Greedy, Dynamic Programming, and Bit Manipulation.',
  subtopics: [
    makeDsaSubtopic(
      'complexity',
      '1. Time & Space Complexity (Big-O, Recurrence)',
      'Beginner',
      '1.5 hours',
      'Measure worst-case operation growth O(1), O(log N), O(N), O(N log N), O(N^2) plus Master Theorem recursion cost so code never hits TLE.',
      'Every coding round tests whether you can analyze complexity immediately from input constraints (N <= 10^5 demands O(N log N) or better).',
      ['Asymptotic Big-O vs Omega/Theta', 'Recursion stack auxiliary space', 'Constraint-to-complexity rule of thumb (10^8 ops/sec)'],
      `// N <= 10^5 -> target O(N) or O(N log N)
// N <= 20   -> recursion / bitmask O(2^N) passes cleanly
// Nested loops halving i /= 2 -> O(N log N)`
    ),
    makeDsaSubtopic(
      'arrays-hashing',
      '2. Arrays & Hashing (Prefix Sum, Kadane, Frequency Maps)',
      'Beginner',
      '3 hours',
      'Use O(1) average hash maps/sets, running prefix sums, and Kadane state carry-over to collapse brute-force O(N^2) loops into linear O(N) scans.',
      'Highest-frequency Round 1 OA and screening question category across all companies.',
      ['Two Sum HashMap complement lookup', 'Prefix Sum + HashMap for Subarray Sum = K', 'Kadane Maximum Subarray & Dutch National Flag'],
      `def subarray_sum(nums, k):
    pref, seen = 0, {0: 1}
    ans = 0
    for x in nums:
        pref += x
        ans += seen.get(pref - k, 0)
        seen[pref] = seen.get(pref, 0) + 1
    return ans`
    ),
    makeDsaSubtopic(
      'two-pointers',
      '3. Two Pointers (Opposite Ends & Fast/Slow)',
      'Beginner',
      '2.5 hours',
      'Walk two indices inward or at staggered speeds across sorted arrays and sequences to eliminate nested inner loops.',
      'Classic optimization pattern for Container With Most Water, 3Sum, and In-Place Array Deduplication.',
      ['Sorted pair / 3Sum duplicate skipping', 'In-place read/write pointer compaction', 'Partitioning elements without extra arrays'],
      `def two_sum_sorted(arr, target):
    l, r = 0, len(arr) - 1
    while l < r:
        s = arr[l] + arr[r]
        if s == target: return [l, r]
        if s < target: l += 1
        else: r -= 1`
    ),
    makeDsaSubtopic(
      'sliding-window',
      '4. Sliding Window (Fixed & Variable Window)',
      'Intermediate',
      '3 hours',
      'Maintain a contiguous window [l..r] adding right elements and shrinking l only while an invariant (unique chars, sum <= K) breaks.',
      'Guarantees O(N) single-pass performance on substring and subarray optimization rounds.',
      ['Fixed-size window rolling sum/max', 'Variable window longest substring without repeating chars', 'At-most-K trick for exact K distinct counts'],
      `def longest_unique_substr(s):
    seen, l, best = {}, 0, 0
    for r, ch in enumerate(s):
        if ch in seen and seen[ch] >= l:
            l = seen[ch] + 1
        seen[ch] = r
        best = max(best, r - l + 1)
    return best`
    ),
    makeDsaSubtopic(
      'binary-search',
      '5. Binary Search & Search on Answer',
      'Intermediate',
      '3 hours',
      'Halve sorted arrays OR monotonic feasibility spaces ("minimum capacity K to ship within D days") in O(log N) iterations.',
      'Favorite Amazon, Google, and Microsoft problem pattern hiding behind non-sorted inputs.',
      ['Overflow-safe mid calculation & lower/upper bound', 'Rotated Sorted Array pivot conditions', 'Monotonic predicate Binary Search on Answer'],
      `def ship_within_days(weights, days):
    lo, hi = max(weights), sum(weights)
    while lo < hi:
        mid = lo + (hi - lo) // 2
        if feasible(weights, days, mid): hi = mid
        else: lo = mid + 1
    return lo`
    ),
    makeDsaSubtopic(
      'backtracking',
      '6. Recursion & Backtracking (Subsets, Permutations, N-Queens)',
      'Intermediate',
      '3.5 hours',
      'Build decision trees exploring Choose -> Recurse -> Undo (backtrack) states with pruning to enumerate valid combinations.',
      'Directly evaluates recursion mastery and clean state cleanup under constraints.',
      ['Subsets vs Combination Sum duplicate avoidance', 'Swap / used[] Permutation generation', 'Row/Diagonal pruning in N-Queens & Sudoku'],
      `def subsets(nums):
    res, path = [], []
    def dfs(i):
        if i == len(nums): res.append(path[:]); return
        path.append(nums[i]); dfs(i + 1)
        path.pop(); dfs(i + 1)
    dfs(0); return res`
    ),
    makeDsaSubtopic(
      'linked-lists',
      '7. Linked Lists (Reversal, Cycle Detection, Merge, LRU Cache)',
      'Beginner',
      '2.5 hours',
      'Manipulate next/prev pointer invariants using dummy head nodes, Floyd tortoise-hare cycles, and HashMap + Doubly Linked List for O(1) LRU Cache.',
      'Tests pointer discipline and edge cases (empty list, 1-node list, tail updates).',
      ['Iterative & Recursive List Reversal', 'Floyd Cycle Detection & Entry Node', 'Merge Sort on Linked Lists & LRU Cache Design'],
      `def reverse_list(head):
    prev, cur = None, head
    while cur:
        nxt = cur.next
        cur.next = prev
        prev, cur = cur, nxt
    return prev`
    ),
    makeDsaSubtopic(
      'stacks-queues',
      '8. Stacks & Queues (Monotonic Stack, Next Greater Element)',
      'Intermediate',
      '2.5 hours',
      'Keep strictly increasing/decreasing element indices on a stack or deque to find next greater/smaller boundaries in O(N) total amortized time.',
      'Essential for Valid Parentheses, Daily Temperatures, Largest Rectangle in Histogram, and Sliding Window Max.',
      ['Monotonic Decreasing/Increasing Stack invariants', 'Deque Sliding Window Maximum in O(N)', 'MinStack O(1) space state delta'],
      `def next_greater(nums):
    res, st = [-1] * len(nums), []
    for i, x in enumerate(nums):
        while st and nums[st[-1]] < x:
            res[st.pop()] = x
        st.append(i)
    return res`
    ),
    makeDsaSubtopic(
      'binary-trees',
      '9. Binary Trees (Traversals, Height, LCA, Views)',
      'Intermediate',
      '3.5 hours',
      'Process hierarchical tree structures recursively via DFS (Pre/In/Post) and level-by-level via BFS queue tracking depth or horizontal columns.',
      'Core SDE interview staple for checking tree recursion confidence and O(N) bottom-up aggregation.',
      ['BFS Level Order, Zigzag & Right/Top Views', 'Diameter & Max Path Sum bottom-up height passing', 'Lowest Common Ancestor (LCA) & Serialize/Deserialize'],
      `def max_depth(root):
    if not root: return 0
    return 1 + max(max_depth(root.left), max_depth(root.right))`
    ),
    makeDsaSubtopic(
      'bst',
      '10. Binary Search Trees (Validation, Kth Smallest, Deletion)',
      'Intermediate',
      '2 hours',
      'Leverage BST invariant (left < root < right) where Inorder traversal yields strictly sorted values for O(H) search, validation, and Kth lookup.',
      'Frequently paired with range constraints (min/max bounds) and iterator state questions.',
      ['Validate BST via min/max value intervals', 'Inorder Kth Smallest Element', 'BST Node Deletion with Inorder Successor swap'],
      `def is_valid_bst(node, lo=float('-inf'), hi=float('inf')):
    if not node: return True
    if not (lo < node.val < hi): return False
    return is_valid_bst(node.left, lo, node.val) and is_valid_bst(node.right, node.val, hi)`
    ),
    makeDsaSubtopic(
      'heaps',
      '11. Heaps & Priority Queues (Top-K, Merge K Lists, Median)',
      'Intermediate',
      '2.5 hours',
      'Maintain a partial min-heap or max-heap of size K to extract extrema in O(log K) without paying full O(N log N) global sorting cost.',
      'Key building block for Top-K Frequent, Task Scheduler, Median Data Stream, and Dijkstra.',
      ['Min-Heap size K for Kth Largest Element', 'Merge K Sorted Lists / Arrays', 'Two-Heap Running Median Data Stream'],
      `import heapq
def kth_largest(nums, k):
    h = []
    for x in nums:
        heapq.heappush(h, x)
        if len(h) > k: heapq.heappop(h)
    return h[0]`
    ),
    makeDsaSubtopic(
      'tries',
      '12. Tries (Prefix Tree & Word Search)',
      'Intermediate',
      '2 hours',
      'Share common string prefixes along character-indexed tree edges to support O(L) word/prefix lookup regardless of dictionary size.',
      'Powerhouse pattern for Autocomplete, Word Search II, and Bitwise Maximum XOR pairs.',
      ['TrieNode children + isEnd array/dict', 'Insert / Search / StartsWith O(L)', 'Grid DFS + Trie Pruning (Word Search II)'],
      `class TrieNode:
    def __init__(self):
        self.children = {}
        self.end = False`
    ),
    makeDsaSubtopic(
      'graphs',
      '13. Graphs (BFS, DFS, Topological Sort, Dijkstra, DSU/MST)',
      'Advanced',
      '5 hours',
      'Model networks, dependencies, and shortest paths using adjacency lists, visited states, Kahn Indegree queues, Priority Queues, and Union-Find DSU.',
      'Differentiates strong candidates in Amazon, Google, Microsoft, and Uber coding rounds.',
      ['Connected Components, Flood Fill & Bipartite Graph', 'Cycle Detection (Undirected & Directed DFS colors / Kahn BFS)', 'Dijkstra Shortest Path & Disjoint Set Union (Path Compression)'],
      `def find(parent, x):
    if parent[x] != x:
        parent[x] = find(parent, parent[x])
    return parent[x]`
    ),
    makeDsaSubtopic(
      'greedy',
      '14. Greedy Algorithms (Activity Selection, Intervals, Huffman)',
      'Intermediate',
      '2.5 hours',
      'Make provably optimal local choices—like sorting meetings by earliest end time—when greedy choice property avoids needing full DP state tables.',
      'High-yield for interval scheduling, Jump Game, Gas Station, and resource allocation rounds.',
      ['Merge & Non-Overlapping Intervals (sort by end/start)', 'Jump Game I & II farthest reach', 'Fractional Knapsack & Job Sequencing'],
      `def merge_intervals(iv):
    iv.sort(key=lambda x: x[0])
    out = [iv[0]]
    for s, e in iv[1:]:
        if s <= out[-1][1]: out[-1][1] = max(out[-1][1], e)
        else: out.append([s, e])
    return out`
    ),
    makeDsaSubtopic(
      'dp',
      '15. Dynamic Programming (1D, 2D Grid, Knapsack, LCS/LIS)',
      'Advanced',
      '6 hours',
      'Break overlapping subproblems into recurrence relations dp[state], starting with Memoization (Top-Down) and compressing to Tabulation / Rolling arrays.',
      'Most decisive round topic in Product Engineering OAs and final interviews.',
      ['1D DP: House Robber, Climbing Stairs, Coin Change', 'Subsequence DP: 0/1 Knapsack, Partition Equal Subset Sum', 'String & Grid DP: LCS, Edit Distance, Longest Increasing Subsequence'],
      `def coin_change(coins, amt):
    dp = [amt + 1] * (amt + 1)
    dp[0] = 0
    for a in range(1, amt + 1):
        for c in coins:
            if c <= a: dp[a] = min(dp[a], 1 + dp[a - c])
    return -1 if dp[amt] > amt else dp[amt]`
    ),
    makeDsaSubtopic(
      'bit-math',
      '16. Bit Manipulation & Math (XOR Tricks, Sieve, Modular Math)',
      'Intermediate',
      '2 hours',
      'Leverage O(1) bitwise masks (x & (x-1), XOR cancellation a ^ a = 0), Sieve of Eratosthenes primes, and fast modular exponentiation.',
      'Clears tricky constant-space constraint problems cleanly in OAs.',
      ['Single Number XOR & Brian Kernighan bit count', 'Subsets via Bitmask 0..(1<<N)-1', 'GCD (Euclidean) & Sieve of Eratosthenes'],
      `def single_number(nums):
    ans = 0
    for x in nums: ans ^= x
    return ans  # a ^ a == 0`
    ),
  ],
};

const GENAI_RESOURCES: SubtopicResource[] = [
  { title: 'Google Gemini API Official Docs', url: 'https://ai.google.dev/gemini-api/docs', type: 'Official Docs', pricing: 'Free', level: 'Beginner' },
  { title: 'MDN Web APIs & HTTP Guide', url: 'https://developer.mozilla.org/en-US/docs/Web/HTTP', type: 'Official Docs', pricing: 'Free', level: 'Beginner' },
  { title: 'JSON Schema Official Specification', url: 'https://json-schema.org/learn/getting-started-step-by-step', type: 'Official Docs', pricing: 'Free', level: 'Beginner' },
  { title: 'Prompt Engineering Guide', url: 'https://www.promptingguide.ai/', type: 'Tutorial', pricing: 'Free', level: 'Intermediate' },
  { title: 'roadmap.sh Prompt Engineering & AI Track', url: 'https://roadmap.sh/prompt-engineering', type: 'Tutorial', pricing: 'Free', level: 'Intermediate' },
];

export const SUBJECT_GENAI_APIS: CoreSubjectModule = {
  id: 'mod-genai-apis',
  title: 'Modern APIs & GenAI Engineering Basics',
  badge: 'GenAI & APIs',
  kind: 'Industry Tool',
  summary: 'Production REST & Auth integration paired with Structured LLM Outputs, RAG Vector Search pipelines, and safe AI code review practices.',
  subtopics: [
    {
      id: 'subj-genai-rest',
      title: '1. REST APIs & HTTP Methods/Status Codes',
      level: 'Beginner',
      estimatedTime: '1.5 hours',
      simpleExplanation: 'Design predictable resource endpoints using GET/POST/PUT/PATCH/DELETE and exact 2xx/4xx/5xx semantics with timeout & retry handling.',
      whyImportant: 'Every GenAI or web product relies on clean REST API orchestration.',
      whatToLearn: ['Idempotency of GET/PUT vs POST', '200/201/204 vs 400/401/403/404/429/503', 'Rate limiting & Exponential Backoff'],
      prerequisites: ['Basic JSON payloads'],
      codeExample: `fetch('/api/technical/generate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ career: 'Software Engineer (SDE)', count: 20 })
});`,
      completionCriteria: 'Inspect HTTP status codes and headers on 3 endpoints in Postman or DevTools.',
      resources: GENAI_RESOURCES,
    },
    {
      id: 'subj-genai-auth',
      title: '2. JSON Schema & API Authentication (JWT / OAuth)',
      level: 'Intermediate',
      estimatedTime: '2 hours',
      simpleExplanation: 'Validate external or LLM responses with strict JSON Schemas while protecting endpoints via signed JWT tokens and OAuth 2.0 scopes.',
      whyImportant: 'Untyped LLM responses and broken auth headers cause immediate production bugs.',
      whatToLearn: ['Header.Payload.Signature JWT anatomy', 'Authorization Code Flow + OAuth Scopes', 'Validating AI JSON payloads via Schema'],
      prerequisites: ['HTTP Headers'],
      codeExample: `{
  "type": "object",
  "required": ["topic", "options", "correctAnswer"],
  "properties": {
    "correctAnswer": { "type": "integer", "minimum": 0, "maximum": 3 }
  }
}`,
      completionCriteria: 'Decode a JWT header/payload cleanly and write a JSON Schema for an MCQ object.',
      resources: GENAI_RESOURCES,
    },
    {
      id: 'subj-genai-prompt',
      title: '3. Prompt Engineering & Structured LLM Outputs',
      level: 'Beginner',
      estimatedTime: '2 hours',
      simpleExplanation: 'Control LLM reliability using explicit System Instructions, Few-Shot examples, low temperature, and enforced JSON response schemas.',
      whyImportant: 'Key skill expected from 2025/2026 campus hires building AI-assisted features.',
      whatToLearn: ['Zero-Shot vs Few-Shot demonstrations', 'Temperature & Top-P trade-offs for deterministic JSON', 'Constraint prompting & defensive parsing'],
      prerequisites: ['REST API calls & JSON'],
      codeExample: `const config = {
  temperature: 0.2,
  responseMimeType: "application/json"
};`,
      completionCriteria: 'Prompt Gemini or an LLM endpoint to return strictly validated JSON arrays 5 runs straight.',
      resources: GENAI_RESOURCES,
    },
    {
      id: 'subj-genai-rag',
      title: '4. Retrieval-Augmented Generation (RAG) & Vector Search Basics',
      level: 'Intermediate',
      estimatedTime: '2.5 hours',
      simpleExplanation: 'Chunk private documents -> embed into dense vectors -> retrieve top-K matches via cosine similarity -> inject grounded chunks into the prompt.',
      whyImportant: 'Standard enterprise pattern for reducing LLM hallucinations without retraining model weights.',
      whatToLearn: ['Text chunk size & overlap trade-offs', 'Embedding cosine similarity search', 'Citation grounding & prompt context windows'],
      prerequisites: ['Vectors / Python / API basics'],
      codeExample: `# RAG Pipeline Flow:
# 1. docs -> chunk(500 chars) -> embed() -> Vector DB
# 2. query -> embed() -> top_k_cosine_matches
# 3. prompt = system + retrieved_chunks + user_query`,
      completionCriteria: 'Diagram the end-to-end Ingestion vs Query lifecycle of a RAG QA system.',
      resources: GENAI_RESOURCES,
    },
    {
      id: 'subj-genai-review',
      title: '5. Debugging & Reviewing AI-Generated Code Safely',
      level: 'Intermediate',
      estimatedTime: '1.5 hours',
      simpleExplanation: 'Treat AI-generated code like untrusted PRs: verify edge cases, SQL injection/XSS safety, dependency versions, and complexity before merging.',
      whyImportant: 'Interviewers now actively ask how candidates verify, test, and catch subtle bugs in AI coding output.',
      whatToLearn: ['Spotting hallucinated library methods or outdated APIs', 'Checking SQL parameterization & auth checks', 'Writing deterministic unit tests before shipping'],
      prerequisites: ['Git, unit testing & OWASP fundamentals'],
      codeExample: `// UNSAFE AI draft: cursor.execute(f"SELECT * FROM users WHERE id = {uid}")
// SAFE review fix: cursor.execute("SELECT * FROM users WHERE id = ?", (uid,))`,
      completionCriteria: 'Identify 3 security/edge-case flaws in an AI-written API snippet and patch them.',
      resources: GENAI_RESOURCES,
    },
  ],
};
