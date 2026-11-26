export interface TestCase {
  input: string;
  expectedOutput: string;
  explanation?: string;
}

export interface ReferenceSolution {
  timeComplexity: string;
  spaceComplexity: string;
  approach: string;
  code: {
    javascript: string;
    python: string;
    cpp: string;
    java: string;
  };
}

export type ProblemCategory =
  | 'Arrays & Hashing'
  | 'Strings'
  | 'Two Pointers'
  | 'Sliding Window'
  | 'Stack & Queue'
  | 'Binary Search'
  | 'Linked Lists'
  | 'Trees & BST'
  | 'Graphs'
  | 'Dynamic Programming'
  | 'Greedy & Math'
  | 'Bit Manipulation'
  | 'Trees & Dynamic Programming'
  | 'Arrays'
  | 'Trees'
  | 'Hashing'
  | 'SQL/Data';

export interface CodingProblem {
  id: string;
  title: string;
  category: ProblemCategory;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  acceptance: string;
  companies: string[];
  description: string;
  constraints: string[];
  functionName: string;
  hints?: string[];
  examples: {
    input: string;
    output: string;
    explanation?: string;
  }[];
  starterCode: {
    javascript: string;
    python: string;
    cpp: string;
    java: string;
    c?: string;
  };
  referenceSolution?: ReferenceSolution;
  testCases: TestCase[];
  hiddenTestCases?: TestCase[];
}

export const CODING_PROBLEMS: CodingProblem[] = [
  {
    "id": "p_two_sum",
    "title": "Two Sum",
    "category": "Arrays & Hashing",
    "difficulty": "Easy",
    "acceptance": "52.4%",
    "companies": [
      "Google",
      "Amazon",
      "Microsoft",
      "TCS"
    ],
    "functionName": "twoSum",
    "hints": [
      "Can you solve it in a single pass using a hash map to look up complements in O(1)?",
      "For each number n, check if (target - n) exists in your map. If not, record n and its index."
    ],
    "description": "Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`. Return the answer as a two-element array `[i, j]`.",
    "constraints": [
      "2 <= nums.length <= 10^4",
      "-10^9 <= nums[i] <= 10^9",
      "-10^9 <= target <= 10^9"
    ],
    "examples": [
      {
        "input": "nums = [2,7,11,15], target = 9",
        "output": "[0,1]",
        "explanation": "Because nums[0] + nums[1] == 9, we return [0, 1]."
      },
      {
        "input": "nums = [3,2,4], target = 6",
        "output": "[1,2]",
        "explanation": "nums[1] + nums[2] == 6, return [1, 2]."
      }
    ],
    "starterCode": {
      "python": "def twoSum(nums: list[int], target: int) -> list[int]:\n    # Write your solution here\n    pass\n",
      "javascript": "function twoSum(nums, target) {\n  // Write your solution here\n}\n",
      "cpp": "#include <vector>\nusing namespace std;\n\nvector<int> twoSum(vector<int>& nums, int target) {\n    // Write your solution here\n    return {};\n}\n",
      "java": "class Solution {\n    public int[] twoSum(int[] nums, int target) {\n        // Write your solution here\n        return new int[]{};\n    }\n}\n"
    },
    "referenceSolution": {
      "timeComplexity": "O(n)",
      "spaceComplexity": "O(n)",
      "approach": "Hash Map approach: Track seen numbers and indices. As you iterate, check if complement (target - num) has already been recorded.",
      "code": {
        "python": "def twoSum(nums: list[int], target: int) -> list[int]:\n    seen = {}\n    for i, n in enumerate(nums):\n        diff = target - n\n        if diff in seen:\n            return [seen[diff], i]\n        seen[n] = i\n    return []\n",
        "javascript": "function twoSum(nums, target) {\n  const seen = new Map();\n  for (let i = 0; i < nums.length; i++) {\n    const comp = target - nums[i];\n    if (seen.has(comp)) return [seen.get(comp), i];\n    seen.set(nums[i], i);\n  }\n  return [];\n}\n",
        "cpp": "#include <vector>\n#include <unordered_map>\nusing namespace std;\n\nvector<int> twoSum(vector<int>& nums, int target) {\n    unordered_map<int, int> seen;\n    for (int i = 0; i < nums.size(); ++i) {\n        int comp = target - nums[i];\n        if (seen.count(comp)) return {seen[comp], i};\n        seen[nums[i]] = i;\n    }\n    return {};\n}\n",
        "java": "import java.util.HashMap;\n\nclass Solution {\n    public int[] twoSum(int[] nums, int target) {\n        HashMap<Integer, Integer> seen = new HashMap<>();\n        for (int i = 0; i < nums.length; i++) {\n            int comp = target - nums[i];\n            if (seen.containsKey(comp)) return new int[]{seen.get(comp), i};\n            seen.put(nums[i], i);\n        }\n        return new int[]{};\n    }\n}\n"
      }
    },
    "testCases": [
      {
        "input": "[2, 7, 11, 15], 9",
        "expectedOutput": "[0, 1]"
      },
      {
        "input": "[3, 2, 4], 6",
        "expectedOutput": "[1, 2]"
      }
    ],
    "hiddenTestCases": [
      {
        "input": "[3, 3], 6",
        "expectedOutput": "[0, 1]"
      },
      {
        "input": "[1, 5, 8, 12, 19], 27",
        "expectedOutput": "[2, 4]"
      }
    ]
  },
  {
    "id": "p_max_subarray",
    "title": "Maximum Subarray (Kadane’s Algorithm)",
    "category": "Arrays & Hashing",
    "difficulty": "Medium",
    "acceptance": "50.8%",
    "companies": [
      "Amazon",
      "Microsoft",
      "Infosys",
      "TCS"
    ],
    "functionName": "maxSubArray",
    "hints": [
      "Maintain a running sum of the current subarray. If running sum becomes negative, reset it to 0.",
      "Track the maximum sum encountered at each step: maxSum = max(maxSum, runningSum)."
    ],
    "description": "Given an integer array `nums`, find the contiguous subarray with the largest sum and return its sum.",
    "constraints": [
      "1 <= nums.length <= 10^5",
      "-10^4 <= nums[i] <= 10^4"
    ],
    "examples": [
      {
        "input": "nums = [-2,1,-3,4,-1,2,1,-5,4]",
        "output": "6",
        "explanation": "Subarray [4,-1,2,1] has largest sum 6."
      },
      {
        "input": "nums = [5,4,-1,7,8]",
        "output": "23",
        "explanation": "Subarray [5,4,-1,7,8] has largest sum 23."
      }
    ],
    "starterCode": {
      "python": "def maxSubArray(nums: list[int]) -> int:\n    # Write your solution here\n    pass\n",
      "javascript": "function maxSubArray(nums) {\n  // Write your solution here\n}\n",
      "cpp": "#include <vector>\nusing namespace std;\n\nint maxSubArray(vector<int>& nums) {\n    // Write your solution here\n    return 0;\n}\n",
      "java": "class Solution {\n    public int maxSubArray(int[] nums) {\n        // Write your solution here\n        return 0;\n    }\n}\n"
    },
    "referenceSolution": {
      "timeComplexity": "O(n)",
      "spaceComplexity": "O(1)",
      "approach": "Kadane's algorithm: Iterate through the array, at each element decide whether to add it to the running sum or start a new subarray. Keep track of the global maximum.",
      "code": {
        "python": "def maxSubArray(nums: list[int]) -> int:\n    max_sum = nums[0]\n    curr = 0\n    for n in nums:\n        curr = max(n, curr + n)\n        max_sum = max(max_sum, curr)\n    return max_sum\n",
        "javascript": "function maxSubArray(nums) {\n  let maxSum = nums[0];\n  let curr = 0;\n  for (const n of nums) {\n    curr = Math.max(n, curr + n);\n    maxSum = Math.max(maxSum, curr);\n  }\n  return maxSum;\n}\n",
        "cpp": "#include <vector>\n#include <algorithm>\nusing namespace std;\n\nint maxSubArray(vector<int>& nums) {\n    int maxSum = nums[0], curr = 0;\n    for (int n : nums) {\n        curr = max(n, curr + n);\n        maxSum = max(maxSum, curr);\n    }\n    return maxSum;\n}\n",
        "java": "class Solution {\n    public int maxSubArray(int[] nums) {\n        int maxSum = nums[0], curr = 0;\n        for (int n : nums) {\n            curr = Math.max(n, curr + n);\n            maxSum = Math.max(maxSum, curr);\n        }\n        return maxSum;\n    }\n}\n"
      }
    },
    "testCases": [
      {
        "input": "[-2, 1, -3, 4, -1, 2, 1, -5, 4]",
        "expectedOutput": "6"
      },
      {
        "input": "[1]",
        "expectedOutput": "1"
      }
    ],
    "hiddenTestCases": [
      {
        "input": "[5, 4, -1, 7, 8]",
        "expectedOutput": "23"
      },
      {
        "input": "[-1, -2, -3, -4]",
        "expectedOutput": "-1"
      }
    ]
  },
  {
    "id": "p_stock_buy_sell",
    "title": "Best Time to Buy and Sell Stock",
    "category": "Arrays & Hashing",
    "difficulty": "Easy",
    "acceptance": "54.2%",
    "companies": [
      "Amazon",
      "TCS",
      "Infosys",
      "Microsoft"
    ],
    "functionName": "maxProfit",
    "hints": [
      "Keep track of the minimum price seen so far as you iterate.",
      "At each price, calculate profit = price - minPrice and update maxProfit."
    ],
    "description": "You are given an array `prices` where `prices[i]` is the price of a given stock on day `i`. Return maximum profit from a single buy and sell. If no profit can be made, return `0`.",
    "constraints": [
      "1 <= prices.length <= 10^5",
      "0 <= prices[i] <= 10^4"
    ],
    "examples": [
      {
        "input": "prices = [7,1,5,3,6,4]",
        "output": "5",
        "explanation": "Buy on day 2 (price = 1) and sell on day 5 (price = 6), profit = 6 - 1 = 5."
      },
      {
        "input": "prices = [7,6,4,3,1]",
        "output": "0",
        "explanation": "No transactions are done, max profit = 0."
      }
    ],
    "starterCode": {
      "python": "def maxProfit(prices: list[int]) -> int:\n    # Write your solution here\n    pass\n",
      "javascript": "function maxProfit(prices) {\n  // Write your solution here\n}\n",
      "cpp": "#include <vector>\nusing namespace std;\n\nint maxProfit(vector<int>& prices) {\n    // Write your solution here\n    return 0;\n}\n",
      "java": "class Solution {\n    public int maxProfit(int[] prices) {\n        // Write your solution here\n        return 0;\n    }\n}\n"
    },
    "referenceSolution": {
      "timeComplexity": "O(n)",
      "spaceComplexity": "O(1)",
      "approach": "Single pass tracking minimum buying price and maximum potential profit.",
      "code": {
        "python": "def maxProfit(prices: list[int]) -> int:\n    min_p = float('inf')\n    max_p = 0\n    for p in prices:\n        if p < min_p: min_p = p\n        elif p - min_p > max_p: max_p = p - min_p\n    return max_p\n",
        "javascript": "function maxProfit(prices) {\n  let minP = Infinity, maxP = 0;\n  for (const p of prices) {\n    if (p < minP) minP = p;\n    else if (p - minP > maxP) maxP = p - minP;\n  }\n  return maxP;\n}\n",
        "cpp": "#include <vector>\n#include <algorithm>\nusing namespace std;\n\nint maxProfit(vector<int>& prices) {\n    int minP = 1e9, maxP = 0;\n    for (int p : prices) {\n        minP = min(minP, p);\n        maxP = max(maxP, p - minP);\n    }\n    return maxP;\n}\n",
        "java": "class Solution {\n    public int maxProfit(int[] prices) {\n        int minP = Integer.MAX_VALUE, maxP = 0;\n        for (int p : prices) {\n            if (p < minP) minP = p;\n            else if (p - minP > maxP) maxP = p - minP;\n        }\n        return maxP;\n    }\n}\n"
      }
    },
    "testCases": [
      {
        "input": "[7, 1, 5, 3, 6, 4]",
        "expectedOutput": "5"
      },
      {
        "input": "[7, 6, 4, 3, 1]",
        "expectedOutput": "0"
      }
    ],
    "hiddenTestCases": [
      {
        "input": "[2, 4, 1]",
        "expectedOutput": "2"
      },
      {
        "input": "[1, 2]",
        "expectedOutput": "1"
      }
    ]
  },
  {
    "id": "p_contains_duplicate",
    "title": "Contains Duplicate",
    "category": "Arrays & Hashing",
    "difficulty": "Easy",
    "acceptance": "61.5%",
    "companies": [
      "TCS",
      "Wipro",
      "Cognizant",
      "Apple"
    ],
    "functionName": "containsDuplicate",
    "hints": [
      "A Hash Set stores only unique values.",
      "If length of set(nums) is less than length of nums, a duplicate exists."
    ],
    "description": "Given an integer array `nums`, return `true` if any value appears at least twice in the array, and return `false` if every element is distinct.",
    "constraints": [
      "1 <= nums.length <= 10^5",
      "-10^9 <= nums[i] <= 10^9"
    ],
    "examples": [
      {
        "input": "nums = [1,2,3,1]",
        "output": "true"
      },
      {
        "input": "nums = [1,2,3,4]",
        "output": "false"
      }
    ],
    "starterCode": {
      "python": "def containsDuplicate(nums: list[int]) -> bool:\n    # Write your solution here\n    pass\n",
      "javascript": "function containsDuplicate(nums) {\n  // Write your solution here\n}\n",
      "cpp": "#include <vector>\nusing namespace std;\n\nbool containsDuplicate(vector<int>& nums) {\n    // Write your solution here\n    return false;\n}\n",
      "java": "class Solution {\n    public boolean containsDuplicate(int[] nums) {\n        // Write your solution here\n        return false;\n    }\n}\n"
    },
    "referenceSolution": {
      "timeComplexity": "O(n)",
      "spaceComplexity": "O(n)",
      "approach": "Add each element to a HashSet. If adding fails or element already exists in the set, return true immediately.",
      "code": {
        "python": "def containsDuplicate(nums: list[int]) -> bool:\n    return len(nums) != len(set(nums))\n",
        "javascript": "function containsDuplicate(nums) {\n  return new Set(nums).size !== nums.length;\n}\n",
        "cpp": "#include <vector>\n#include <unordered_set>\nusing namespace std;\n\nbool containsDuplicate(vector<int>& nums) {\n    unordered_set<int> s(nums.begin(), nums.end());\n    return s.size() != nums.size();\n}\n",
        "java": "import java.util.HashSet;\n\nclass Solution {\n    public boolean containsDuplicate(int[] nums) {\n        HashSet<Integer> set = new HashSet<>();\n        for (int n : nums) if (!set.add(n)) return true;\n        return false;\n    }\n}\n"
      }
    },
    "testCases": [
      {
        "input": "[1, 2, 3, 1]",
        "expectedOutput": "true"
      },
      {
        "input": "[1, 2, 3, 4]",
        "expectedOutput": "false"
      }
    ],
    "hiddenTestCases": [
      {
        "input": "[1, 1, 1, 3, 3, 4, 3, 2, 4, 2]",
        "expectedOutput": "true"
      },
      {
        "input": "[0]",
        "expectedOutput": "false"
      }
    ]
  },
  {
    "id": "p_move_zeroes",
    "title": "Move Zeroes",
    "category": "Arrays & Hashing",
    "difficulty": "Easy",
    "acceptance": "61.4%",
    "companies": [
      "TCS",
      "Accenture",
      "Zoho",
      "Facebook"
    ],
    "functionName": "moveZeroes",
    "hints": [
      "Use a slow pointer that tracks where the next non-zero should be placed.",
      "Iterate through the array; whenever you see a non-zero, swap it with the slow pointer and increment."
    ],
    "description": "Given an integer array `nums`, move all `0`'s to the end of it while maintaining the relative order of the non-zero elements. Return the modified array.",
    "constraints": [
      "1 <= nums.length <= 10^4",
      "-2^31 <= nums[i] <= 2^31 - 1"
    ],
    "examples": [
      {
        "input": "nums = [0,1,0,3,12]",
        "output": "[1,3,12,0,0]"
      },
      {
        "input": "nums = [0]",
        "output": "[0]"
      }
    ],
    "starterCode": {
      "python": "def moveZeroes(nums: list[int]) -> list[int]:\n    # Write your solution here\n    pass\n",
      "javascript": "function moveZeroes(nums) {\n  // Write your solution here\n}\n",
      "cpp": "#include <vector>\nusing namespace std;\n\nvector<int> moveZeroes(vector<int>& nums) {\n    // Write your solution here\n    return nums;\n}\n",
      "java": "class Solution {\n    public int[] moveZeroes(int[] nums) {\n        // Write your solution here\n        return nums;\n    }\n}\n"
    },
    "referenceSolution": {
      "timeComplexity": "O(n)",
      "spaceComplexity": "O(1)",
      "approach": "Two-pointer technique. Pointer `pos` tracks index of next non-zero.",
      "code": {
        "python": "def moveZeroes(nums: list[int]) -> list[int]:\n    pos = 0\n    for i in range(len(nums)):\n        if nums[i] != 0:\n            nums[pos], nums[i] = nums[i], nums[pos]\n            pos += 1\n    return nums\n",
        "javascript": "function moveZeroes(nums) {\n  let pos = 0;\n  for (let i = 0; i < nums.length; i++) {\n    if (nums[i] !== 0) {\n      const temp = nums[pos];\n      nums[pos] = nums[i];\n      nums[i] = temp;\n      pos++;\n    }\n  }\n  return nums;\n}\n",
        "cpp": "#include <vector>\nusing namespace std;\n\nvector<int> moveZeroes(vector<int>& nums) {\n    int pos = 0;\n    for (int i = 0; i < nums.size(); ++i) {\n        if (nums[i] != 0) swap(nums[pos++], nums[i]);\n    }\n    return nums;\n}\n",
        "java": "class Solution {\n    public int[] moveZeroes(int[] nums) {\n        int pos = 0;\n        for (int i = 0; i < nums.length; i++) {\n            if (nums[i] != 0) {\n                int t = nums[pos]; nums[pos] = nums[i]; nums[i] = t;\n                pos++;\n            }\n        }\n        return nums;\n    }\n}\n"
      }
    },
    "testCases": [
      {
        "input": "[0, 1, 0, 3, 12]",
        "expectedOutput": "[1, 3, 12, 0, 0]"
      },
      {
        "input": "[0]",
        "expectedOutput": "[0]"
      }
    ],
    "hiddenTestCases": [
      {
        "input": "[1]",
        "expectedOutput": "[1]"
      },
      {
        "input": "[2, 1]",
        "expectedOutput": "[2, 1]"
      }
    ]
  },
  {
    "id": "p_product_except_self",
    "title": "Product of Array Except Self",
    "category": "Arrays & Hashing",
    "difficulty": "Medium",
    "acceptance": "66.1%",
    "companies": [
      "Amazon",
      "Microsoft",
      "Flipkart",
      "Oracle"
    ],
    "functionName": "productExceptSelf",
    "hints": [
      "Solve in O(N) without using division.",
      "Multiply prefix products and suffix products together for each element."
    ],
    "description": "Given an integer array `nums`, return an array `answer` such that `answer[i]` is equal to the product of all elements of `nums` except `nums[i]`. Run in O(n) without division.",
    "constraints": [
      "2 <= nums.length <= 10^5",
      "-30 <= nums[i] <= 30"
    ],
    "examples": [
      {
        "input": "nums = [1,2,3,4]",
        "output": "[24,12,8,6]"
      },
      {
        "input": "nums = [-1,1,0,-3,3]",
        "output": "[0,0,9,0,0]"
      }
    ],
    "starterCode": {
      "python": "def productExceptSelf(nums: list[int]) -> list[int]:\n    # Write your solution here\n    pass\n",
      "javascript": "function productExceptSelf(nums) {\n  // Write your solution here\n}\n",
      "cpp": "#include <vector>\nusing namespace std;\n\nvector<int> productExceptSelf(vector<int>& nums) {\n    // Write your solution here\n    return {};\n}\n",
      "java": "class Solution {\n    public int[] productExceptSelf(int[] nums) {\n        // Write your solution here\n        return new int[]{};\n    }\n}\n"
    },
    "referenceSolution": {
      "timeComplexity": "O(n)",
      "spaceComplexity": "O(1) extra",
      "approach": "Left pass calculates prefix products directly into output array. Right pass multiplies running suffix product.",
      "code": {
        "python": "def productExceptSelf(nums: list[int]) -> list[int]:\n    n = len(nums)\n    res = [1] * n\n    prefix = 1\n    for i in range(n):\n        res[i] = prefix\n        prefix *= nums[i]\n    suffix = 1\n    for i in range(n - 1, -1, -1):\n        res[i] *= suffix\n        suffix *= nums[i]\n    return res\n",
        "javascript": "function productExceptSelf(nums) {\n  const n = nums.length;\n  const res = new Array(n).fill(1);\n  let prefix = 1;\n  for (let i = 0; i < n; i++) {\n    res[i] = prefix;\n    prefix *= nums[i];\n  }\n  let suffix = 1;\n  for (let i = n - 1; i >= 0; i--) {\n    res[i] *= suffix;\n    suffix *= nums[i];\n  }\n  return res;\n}\n",
        "cpp": "#include <vector>\nusing namespace std;\n\nvector<int> productExceptSelf(vector<int>& nums) {\n    int n = nums.size();\n    vector<int> res(n, 1);\n    int prefix = 1;\n    for (int i = 0; i < n; ++i) { res[i] = prefix; prefix *= nums[i]; }\n    int suffix = 1;\n    for (int i = n - 1; i >= 0; --i) { res[i] *= suffix; suffix *= nums[i]; }\n    return res;\n}\n",
        "java": "class Solution {\n    public int[] productExceptSelf(int[] nums) {\n        int n = nums.length;\n        int[] res = new int[n];\n        int prefix = 1;\n        for (int i = 0; i < n; i++) { res[i] = prefix; prefix *= nums[i]; }\n        int suffix = 1;\n        for (int i = n - 1; i >= 0; i--) { res[i] *= suffix; suffix *= nums[i]; }\n        return res;\n    }\n}\n"
      }
    },
    "testCases": [
      {
        "input": "[1, 2, 3, 4]",
        "expectedOutput": "[24, 12, 8, 6]"
      },
      {
        "input": "[-1, 1, 0, -3, 3]",
        "expectedOutput": "[0, 0, 9, 0, 0]"
      }
    ],
    "hiddenTestCases": [
      {
        "input": "[2, 3]",
        "expectedOutput": "[3, 2]"
      },
      {
        "input": "[1, 0]",
        "expectedOutput": "[0, 1]"
      }
    ]
  },
  {
    "id": "p_merge_intervals",
    "title": "Merge Intervals",
    "category": "Arrays & Hashing",
    "difficulty": "Medium",
    "acceptance": "47.5%",
    "companies": [
      "Google",
      "Amazon",
      "Oracle",
      "Infosys"
    ],
    "functionName": "mergeIntervals",
    "hints": [
      "First sort the intervals by their start times.",
      "If current interval overlaps with the last merged interval, merge them: last[1] = max(last[1], curr[1])."
    ],
    "description": "Given an array of `intervals` where `intervals[i] = [starti, endi]`, merge all overlapping intervals, and return an array of non-overlapping intervals.",
    "constraints": [
      "1 <= intervals.length <= 10^4",
      "intervals[i].length == 2",
      "0 <= starti <= endi <= 10^4"
    ],
    "examples": [
      {
        "input": "intervals = [[1,3],[2,6],[8,10],[15,18]]",
        "output": "[[1,6],[8,10],[15,18]]"
      },
      {
        "input": "intervals = [[1,4],[4,5]]",
        "output": "[[1,5]]"
      }
    ],
    "starterCode": {
      "python": "def mergeIntervals(intervals: list[list[int]]) -> list[list[int]]:\n    # Write your solution here\n    pass\n",
      "javascript": "function mergeIntervals(intervals) {\n  // Write your solution here\n}\n",
      "cpp": "#include <vector>\nusing namespace std;\n\nvector<vector<int>> mergeIntervals(vector<vector<int>>& intervals) {\n    // Write your solution here\n    return {};\n}\n",
      "java": "class Solution {\n    public int[][] mergeIntervals(int[][] intervals) {\n        // Write your solution here\n        return new int[][]{};\n    }\n}\n"
    },
    "referenceSolution": {
      "timeComplexity": "O(n log n)",
      "spaceComplexity": "O(n)",
      "approach": "Sort intervals by start coordinate. Iterate and merge with the last interval in result list if current start <= previous end.",
      "code": {
        "python": "def mergeIntervals(intervals: list[list[int]]) -> list[list[int]]:\n    intervals.sort(key=lambda x: x[0])\n    merged = []\n    for inv in intervals:\n        if not merged or merged[-1][1] < inv[0]:\n            merged.append(inv)\n        else:\n            merged[-1][1] = max(merged[-1][1], inv[1])\n    return merged\n",
        "javascript": "function mergeIntervals(intervals) {\n  intervals.sort((a, b) => a[0] - b[0]);\n  const merged = [];\n  for (const inv of intervals) {\n    if (!merged.length || merged[merged.length - 1][1] < inv[0]) {\n      merged.push(inv);\n    } else {\n      merged[merged.length - 1][1] = Math.max(merged[merged.length - 1][1], inv[1]);\n    }\n  }\n  return merged;\n}\n",
        "cpp": "#include <vector>\n#include <algorithm>\nusing namespace std;\n\nvector<vector<int>> mergeIntervals(vector<vector<int>>& intervals) {\n    sort(intervals.begin(), intervals.end());\n    vector<vector<int>> merged;\n    for (const auto& inv : intervals) {\n        if (merged.empty() || merged.back()[1] < inv[0]) merged.push_back(inv);\n        else merged.back()[1] = max(merged.back()[1], inv[1]);\n    }\n    return merged;\n}\n",
        "java": "import java.util.*;\n\nclass Solution {\n    public int[][] mergeIntervals(int[][] intervals) {\n        Arrays.sort(intervals, (a, b) -> Integer.compare(a[0], b[0]));\n        List<int[]> merged = new ArrayList<>();\n        for (int[] inv : intervals) {\n            if (merged.isEmpty() || merged.get(merged.size() - 1)[1] < inv[0]) merged.add(inv);\n            else merged.get(merged.size() - 1)[1] = Math.max(merged.get(merged.size() - 1)[1], inv[1]);\n        }\n        return merged.toArray(new int[merged.size()][]);\n    }\n}\n"
      }
    },
    "testCases": [
      {
        "input": "[[1, 3], [2, 6], [8, 10], [15, 18]]",
        "expectedOutput": "[[1, 6], [8, 10], [15, 18]]"
      },
      {
        "input": "[[1, 4], [4, 5]]",
        "expectedOutput": "[[1, 5]]"
      }
    ],
    "hiddenTestCases": [
      {
        "input": "[[1, 4], [0, 4]]",
        "expectedOutput": "[[0, 4]]"
      },
      {
        "input": "[[1, 4], [2, 3]]",
        "expectedOutput": "[[1, 4]]"
      }
    ]
  },
  {
    "id": "p_majority_element",
    "title": "Majority Element",
    "category": "Arrays & Hashing",
    "difficulty": "Easy",
    "acceptance": "64.9%",
    "companies": [
      "TCS",
      "Infosys",
      "Deloitte",
      "Amazon"
    ],
    "functionName": "majorityElement",
    "hints": [
      "The majority element appears more than floor(n / 2) times.",
      "Boyer-Moore Voting Algorithm solves it in O(N) time and O(1) space."
    ],
    "description": "Given an array `nums` of size `n`, return the majority element. The majority element is the element that appears more than `⌊n / 2⌋` times.",
    "constraints": [
      "n == nums.length",
      "1 <= n <= 5 * 10^4",
      "-10^9 <= nums[i] <= 10^9"
    ],
    "examples": [
      {
        "input": "nums = [3,2,3]",
        "output": "3"
      },
      {
        "input": "nums = [2,2,1,1,1,2,2]",
        "output": "2"
      }
    ],
    "starterCode": {
      "python": "def majorityElement(nums: list[int]) -> int:\n    # Write your solution here\n    pass\n",
      "javascript": "function majorityElement(nums) {\n  // Write your solution here\n}\n",
      "cpp": "#include <vector>\nusing namespace std;\n\nint majorityElement(vector<int>& nums) {\n    // Write your solution here\n    return 0;\n}\n",
      "java": "class Solution {\n    public int majorityElement(int[] nums) {\n        // Write your solution here\n        return 0;\n    }\n}\n"
    },
    "referenceSolution": {
      "timeComplexity": "O(n)",
      "spaceComplexity": "O(1)",
      "approach": "Boyer-Moore Voting Algorithm: Track candidate and counter.",
      "code": {
        "python": "def majorityElement(nums: list[int]) -> int:\n    cand = nums[0]; cnt = 0\n    for n in nums:\n        if cnt == 0: cand = n\n        cnt += 1 if n == cand else -1\n    return cand\n",
        "javascript": "function majorityElement(nums) {\n  let cand = nums[0], cnt = 0;\n  for (const n of nums) {\n    if (cnt === 0) cand = n;\n    cnt += (n === cand ? 1 : -1);\n  }\n  return cand;\n}\n",
        "cpp": "#include <vector>\nusing namespace std;\n\nint majorityElement(vector<int>& nums) {\n    int cand = nums[0], cnt = 0;\n    for (int n : nums) {\n        if (cnt == 0) cand = n;\n        cnt += (n == cand ? 1 : -1);\n    }\n    return cand;\n}\n",
        "java": "class Solution {\n    public int majorityElement(int[] nums) {\n        int cand = nums[0], cnt = 0;\n        for (int n : nums) {\n            if (cnt == 0) cand = n;\n            cnt += (n == cand ? 1 : -1);\n        }\n        return cand;\n    }\n}\n"
      }
    },
    "testCases": [
      {
        "input": "[3, 2, 3]",
        "expectedOutput": "3"
      },
      {
        "input": "[2, 2, 1, 1, 1, 2, 2]",
        "expectedOutput": "2"
      }
    ],
    "hiddenTestCases": [
      {
        "input": "[1]",
        "expectedOutput": "1"
      },
      {
        "input": "[6, 5, 5]",
        "expectedOutput": "5"
      }
    ]
  },
  {
    "id": "p_rotate_array",
    "title": "Rotate Array",
    "category": "Arrays & Hashing",
    "difficulty": "Medium",
    "acceptance": "40.3%",
    "companies": [
      "Zoho",
      "Wipro",
      "Amazon",
      "Microsoft"
    ],
    "functionName": "rotate",
    "hints": [
      "Reverse entire array, then reverse first k, then reverse remaining n-k.",
      "Remember k = k % n."
    ],
    "description": "Given an integer array `nums`, rotate the array to the right by `k` steps, where `k` is non-negative. Return the modified array.",
    "constraints": [
      "1 <= nums.length <= 10^5",
      "0 <= k <= 10^5"
    ],
    "examples": [
      {
        "input": "nums = [1,2,3,4,5,6,7], k = 3",
        "output": "[5,6,7,1,2,3,4]"
      },
      {
        "input": "nums = [-1,-100,3,99], k = 2",
        "output": "[3,99,-1,-100]"
      }
    ],
    "starterCode": {
      "python": "def rotate(nums: list[int], k: int) -> list[int]:\n    # Write your solution here\n    pass\n",
      "javascript": "function rotate(nums, k) {\n  // Write your solution here\n}\n",
      "cpp": "#include <vector>\nusing namespace std;\n\nvector<int> rotate(vector<int>& nums, int k) {\n    // Write your solution here\n    return nums;\n}\n",
      "java": "class Solution {\n    public int[] rotate(int[] nums, int k) {\n        // Write your solution here\n        return nums;\n    }\n}\n"
    },
    "referenceSolution": {
      "timeComplexity": "O(n)",
      "spaceComplexity": "O(1)",
      "approach": "Reverse whole array, reverse first k elements, reverse remainder.",
      "code": {
        "python": "def rotate(nums: list[int], k: int) -> list[int]:\n    k %= len(nums)\n    def rev(l, r):\n        while l < r:\n            nums[l], nums[r] = nums[r], nums[l]\n            l += 1; r -= 1\n    rev(0, len(nums) - 1)\n    rev(0, k - 1)\n    rev(k, len(nums) - 1)\n    return nums\n",
        "javascript": "function rotate(nums, k) {\n  k %= nums.length;\n  const rev = (l, r) => {\n    while (l < r) {\n      const t = nums[l]; nums[l] = nums[r]; nums[r] = t;\n      l++; r--;\n    }\n  };\n  rev(0, nums.length - 1);\n  rev(0, k - 1);\n  rev(k, nums.length - 1);\n  return nums;\n}\n",
        "cpp": "#include <vector>\n#include <algorithm>\nusing namespace std;\n\nvector<int> rotate(vector<int>& nums, int k) {\n    k %= nums.size();\n    reverse(nums.begin(), nums.end());\n    reverse(nums.begin(), nums.begin() + k);\n    reverse(nums.begin() + k, nums.end());\n    return nums;\n}\n",
        "java": "class Solution {\n    public int[] rotate(int[] nums, int k) {\n        k %= nums.length;\n        rev(nums, 0, nums.length - 1);\n        rev(nums, 0, k - 1);\n        rev(nums, k, nums.length - 1);\n        return nums;\n    }\n    private void rev(int[] a, int l, int r) {\n        while (l < r) { int t = a[l]; a[l++] = a[r]; a[r--] = t; }\n    }\n}\n"
      }
    },
    "testCases": [
      {
        "input": "[1, 2, 3, 4, 5, 6, 7], 3",
        "expectedOutput": "[5, 6, 7, 1, 2, 3, 4]"
      },
      {
        "input": "[-1, -100, 3, 99], 2",
        "expectedOutput": "[3, 99, -1, -100]"
      }
    ],
    "hiddenTestCases": [
      {
        "input": "[1, 2], 3",
        "expectedOutput": "[2, 1]"
      },
      {
        "input": "[1], 0",
        "expectedOutput": "[1]"
      }
    ]
  },
  {
    "id": "p_missing_number",
    "title": "Missing Number",
    "category": "Arrays & Hashing",
    "difficulty": "Easy",
    "acceptance": "64.8%",
    "companies": [
      "TCS",
      "Wipro",
      "Accenture",
      "Deloitte"
    ],
    "functionName": "missingNumber",
    "hints": [
      "The expected sum of numbers from 0 to n is n * (n + 1) / 2.",
      "Subtract actual sum from expected sum."
    ],
    "description": "Given an array `nums` containing `n` distinct numbers in the range `[0, n]`, return the only number missing from the array.",
    "constraints": [
      "n == nums.length",
      "1 <= n <= 10^4",
      "0 <= nums[i] <= n"
    ],
    "examples": [
      {
        "input": "nums = [3,0,1]",
        "output": "2",
        "explanation": "n = 3, numbers in range [0,3]. 2 is missing."
      },
      {
        "input": "nums = [0,1]",
        "output": "2",
        "explanation": "n = 2, numbers in range [0,2]. 2 is missing."
      }
    ],
    "starterCode": {
      "python": "def missingNumber(nums: list[int]) -> int:\n    # Write your solution here\n    pass\n",
      "javascript": "function missingNumber(nums) {\n  // Write your solution here\n}\n",
      "cpp": "#include <vector>\nusing namespace std;\n\nint missingNumber(vector<int>& nums) {\n    // Write your solution here\n    return 0;\n}\n",
      "java": "class Solution {\n    public int missingNumber(int[] nums) {\n        // Write your solution here\n        return 0;\n    }\n}\n"
    },
    "referenceSolution": {
      "timeComplexity": "O(n)",
      "spaceComplexity": "O(1)",
      "approach": "Total sum = n*(n+1)//2. Missing number = total_sum - sum(nums).",
      "code": {
        "python": "def missingNumber(nums: list[int]) -> int:\n    n = len(nums)\n    return n * (n + 1) // 2 - sum(nums)\n",
        "javascript": "function missingNumber(nums) {\n  const n = nums.length;\n  const expected = (n * (n + 1)) / 2;\n  const actual = nums.reduce((a, b) => a + b, 0);\n  return expected - actual;\n}\n",
        "cpp": "#include <vector>\n#include <numeric>\nusing namespace std;\n\nint missingNumber(vector<int>& nums) {\n    int n = nums.size();\n    return n * (n + 1) / 2 - accumulate(nums.begin(), nums.end(), 0);\n}\n",
        "java": "class Solution {\n    public int missingNumber(int[] nums) {\n        int n = nums.length;\n        int expected = n * (n + 1) / 2;\n        int actual = 0;\n        for (int x : nums) actual += x;\n        return expected - actual;\n    }\n}\n"
      }
    },
    "testCases": [
      {
        "input": "[3, 0, 1]",
        "expectedOutput": "2"
      },
      {
        "input": "[0, 1]",
        "expectedOutput": "2"
      }
    ],
    "hiddenTestCases": [
      {
        "input": "[9, 6, 4, 2, 3, 5, 7, 0, 1]",
        "expectedOutput": "8"
      },
      {
        "input": "[0]",
        "expectedOutput": "1"
      }
    ]
  },
  {
    "id": "p_spiral_matrix",
    "title": "Spiral Matrix",
    "category": "Arrays & Hashing",
    "difficulty": "Medium",
    "acceptance": "49.1%",
    "companies": [
      "Zoho",
      "TCS",
      "Amazon",
      "Deloitte"
    ],
    "functionName": "spiralOrder",
    "hints": [
      "Maintain boundaries: top, bottom, left, right.",
      "Loop right, down, left, up and shrink boundaries."
    ],
    "description": "Given an `m x n` matrix, return all elements of the matrix in spiral order.",
    "constraints": [
      "m == matrix.length",
      "n == matrix[i].length",
      "1 <= m, n <= 10"
    ],
    "examples": [
      {
        "input": "matrix = [[1,2,3],[4,5,6],[7,8,9]]",
        "output": "[1,2,3,6,9,8,7,4,5]"
      },
      {
        "input": "matrix = [[1,2],[3,4]]",
        "output": "[1,2,4,3]"
      }
    ],
    "starterCode": {
      "python": "def spiralOrder(matrix: list[list[int]]) -> list[int]:\n    # Write your solution here\n    pass\n",
      "javascript": "function spiralOrder(matrix) {\n  // Write your solution here\n}\n",
      "cpp": "#include <vector>\nusing namespace std;\n\nvector<int> spiralOrder(vector<vector<int>>& matrix) {\n    // Write your solution here\n    return {};\n}\n",
      "java": "import java.util.*;\n\nclass Solution {\n    public List<Integer> spiralOrder(int[][] matrix) {\n        // Write your solution here\n        return new ArrayList<>();\n    }\n}\n"
    },
    "referenceSolution": {
      "timeComplexity": "O(m * n)",
      "spaceComplexity": "O(1) extra",
      "approach": "Traverse 4 boundaries (top, bottom, left, right) in clockwise direction.",
      "code": {
        "python": "def spiralOrder(matrix: list[list[int]]) -> list[int]:\n    if not matrix: return []\n    res = []\n    t, b, l, r = 0, len(matrix) - 1, 0, len(matrix[0]) - 1\n    while t <= b and l <= r:\n        for j in range(l, r + 1): res.append(matrix[t][j])\n        t += 1\n        for i in range(t, b + 1): res.append(matrix[i][r])\n        r -= 1\n        if t <= b:\n            for j in range(r, l - 1, -1): res.append(matrix[b][j])\n            b -= 1\n        if l <= r:\n            for i in range(b, t - 1, -1): res.append(matrix[i][l])\n            l += 1\n    return res\n",
        "javascript": "function spiralOrder(matrix) {\n  if (!matrix.length) return [];\n  const res = [];\n  let t = 0, b = matrix.length - 1, l = 0, r = matrix[0].length - 1;\n  while (t <= b && l <= r) {\n    for (let j = l; j <= r; j++) res.push(matrix[t][j]);\n    t++;\n    for (let i = t; i <= b; i++) res.push(matrix[i][r]);\n    r--;\n    if (t <= b) { for (let j = r; j >= l; j--) res.push(matrix[b][j]); b--; }\n    if (l <= r) { for (let i = b; i >= t; i--) res.push(matrix[i][l]); l++; }\n  }\n  return res;\n}\n",
        "cpp": "#include <vector>\nusing namespace std;\n\nvector<int> spiralOrder(vector<vector<int>>& matrix) {\n    if (matrix.empty()) return {};\n    vector<int> res;\n    int t = 0, b = matrix.size() - 1, l = 0, r = matrix[0].size() - 1;\n    while (t <= b && l <= r) {\n        for (int j = l; j <= r; ++j) res.push_back(matrix[t][j]);\n        t++;\n        for (int i = t; i <= b; ++i) res.push_back(matrix[i][r]);\n        r--;\n        if (t <= b) { for (int j = r; j >= l; --j) res.push_back(matrix[b][j]); b--; }\n        if (l <= r) { for (int i = b; i >= t; --i) res.push_back(matrix[i][l]); l++; }\n    }\n    return res;\n}\n",
        "java": "import java.util.*;\n\nclass Solution {\n    public List<Integer> spiralOrder(int[][] matrix) {\n        List<Integer> res = new ArrayList<>();\n        if (matrix.length == 0) return res;\n        int t = 0, b = matrix.length - 1, l = 0, r = matrix[0].length - 1;\n        while (t <= b && l <= r) {\n            for (int j = l; j <= r; j++) res.add(matrix[t][j]);\n            t++;\n            for (int i = t; i <= b; i++) res.add(matrix[i][r]);\n            r--;\n            if (t <= b) { for (int j = r; j >= l; j--) res.add(matrix[b][j]); b--; }\n            if (l <= r) { for (int i = b; i >= t; i--) res.add(matrix[i][l]); l++; }\n        }\n        return res;\n    }\n}\n"
      }
    },
    "testCases": [
      {
        "input": "[[1, 2, 3], [4, 5, 6], [7, 8, 9]]",
        "expectedOutput": "[1, 2, 3, 6, 9, 8, 7, 4, 5]"
      },
      {
        "input": "[[1, 2], [3, 4]]",
        "expectedOutput": "[1, 2, 4, 3]"
      }
    ],
    "hiddenTestCases": [
      {
        "input": "[[1]]",
        "expectedOutput": "[1]"
      },
      {
        "input": "[[1, 2, 3, 4]]",
        "expectedOutput": "[1, 2, 3, 4]"
      }
    ]
  },
  {
    "id": "p_subsets",
    "title": "Subsets (Power Set)",
    "category": "Arrays & Hashing",
    "difficulty": "Medium",
    "acceptance": "76.4%",
    "companies": [
      "TCS",
      "Cognizant",
      "Wipro",
      "Accenture"
    ],
    "functionName": "subsets",
    "hints": [
      "Start with empty set [[]]. For each number, clone existing subsets and add the number.",
      "Total subsets = 2^N."
    ],
    "description": "Given an integer array `nums` of unique elements, return all possible subsets (the power set).",
    "constraints": [
      "1 <= nums.length <= 10",
      "-10 <= nums[i] <= 10"
    ],
    "examples": [
      {
        "input": "nums = [1,2,3]",
        "output": "[[],[1],[2],[1,2],[3],[1,3],[2,3],[1,2,3]]"
      },
      {
        "input": "nums = [0]",
        "output": "[[],[0]]"
      }
    ],
    "starterCode": {
      "python": "def subsets(nums: list[int]) -> list[list[int]]:\n    # Write your solution here\n    pass\n",
      "javascript": "function subsets(nums) {\n  // Write your solution here\n}\n",
      "cpp": "#include <vector>\nusing namespace std;\n\nvector<vector<int>> subsets(vector<int>& nums) {\n    // Write your solution here\n    return {};\n}\n",
      "java": "import java.util.*;\n\nclass Solution {\n    public List<List<Integer>> subsets(int[] nums) {\n        // Write your solution here\n        return new ArrayList<>();\n    }\n}\n"
    },
    "referenceSolution": {
      "timeComplexity": "O(2^n)",
      "spaceComplexity": "O(2^n)",
      "approach": "Cascading: start with [[]], iteratively duplicate all existing subsets and append current element.",
      "code": {
        "python": "def subsets(nums: list[int]) -> list[list[int]]:\n    res = [[]]\n    for n in nums:\n        res += [curr + [n] for curr in res]\n    return res\n",
        "javascript": "function subsets(nums) {\n  let res = [[]];\n  for (const n of nums) {\n    res = res.concat(res.map(c => [...c, n]));\n  }\n  return res;\n}\n",
        "cpp": "#include <vector>\nusing namespace std;\n\nvector<vector<int>> subsets(vector<int>& nums) {\n    vector<vector<int>> res = {{}};\n    for (int n : nums) {\n        int sz = res.size();\n        for (int i = 0; i < sz; ++i) {\n            auto c = res[i]; c.push_back(n); res.push_back(c);\n        }\n    }\n    return res;\n}\n",
        "java": "import java.util.*;\n\nclass Solution {\n    public List<List<Integer>> subsets(int[] nums) {\n        List<List<Integer>> res = new ArrayList<>();\n        res.add(new ArrayList<>());\n        for (int n : nums) {\n            int sz = res.size();\n            for (int i = 0; i < sz; i++) {\n                List<Integer> c = new ArrayList<>(res.get(i));\n                c.add(n); res.add(c);\n            }\n        }\n        return res;\n    }\n}\n"
      }
    },
    "testCases": [
      {
        "input": "[1, 2]",
        "expectedOutput": "[[], [1], [2], [1, 2]]"
      },
      {
        "input": "[0]",
        "expectedOutput": "[[], [0]]"
      }
    ],
    "hiddenTestCases": [
      {
        "input": "[1]",
        "expectedOutput": "[[], [1]]"
      },
      {
        "input": "[1, 2, 3]",
        "expectedOutput": "[[], [1], [2], [1, 2], [3], [1, 3], [2, 3], [1, 2, 3]]"
      }
    ]
  },
  {
    "id": "p_kth_largest",
    "title": "Kth Largest Element in an Array",
    "category": "Arrays & Hashing",
    "difficulty": "Medium",
    "acceptance": "66.8%",
    "companies": [
      "Amazon",
      "Flipkart",
      "Oracle",
      "TCS"
    ],
    "functionName": "findKthLargest",
    "hints": [
      "Min-heap of size k takes O(N log K) time.",
      "Or sort descending and take nums[k - 1]."
    ],
    "description": "Given an integer array `nums` and an integer `k`, return the `k`th largest element in the array.",
    "constraints": [
      "1 <= k <= nums.length <= 10^5",
      "-10^4 <= nums[i] <= 10^4"
    ],
    "examples": [
      {
        "input": "nums = [3,2,1,5,6,4], k = 2",
        "output": "5"
      },
      {
        "input": "nums = [3,2,3,1,2,4,5,5,6], k = 4",
        "output": "4"
      }
    ],
    "starterCode": {
      "python": "def findKthLargest(nums: list[int], k: int) -> int:\n    # Write your solution here\n    pass\n",
      "javascript": "function findKthLargest(nums, k) {\n  // Write your solution here\n}\n",
      "cpp": "#include <vector>\nusing namespace std;\n\nint findKthLargest(vector<int>& nums, int k) {\n    // Write your solution here\n    return 0;\n}\n",
      "java": "class Solution {\n    public int findKthLargest(int[] nums, int k) {\n        // Write your solution here\n        return 0;\n    }\n}\n"
    },
    "referenceSolution": {
      "timeComplexity": "O(n log k)",
      "spaceComplexity": "O(k)",
      "approach": "Min-heap of size k keeps the k largest elements seen so far; root is the kth largest.",
      "code": {
        "python": "import heapq\n\ndef findKthLargest(nums: list[int], k: int) -> int:\n    return heapq.nlargest(k, nums)[-1]\n",
        "javascript": "function findKthLargest(nums, k) {\n  nums.sort((a, b) => b - a);\n  return nums[k - 1];\n}\n",
        "cpp": "#include <vector>\n#include <queue>\nusing namespace std;\n\nint findKthLargest(vector<int>& nums, int k) {\n    priority_queue<int, vector<int>, greater<int>> pq;\n    for (int n : nums) {\n        pq.push(n);\n        if (pq.size() > k) pq.pop();\n    }\n    return pq.top();\n}\n",
        "java": "import java.util.PriorityQueue;\n\nclass Solution {\n    public int findKthLargest(int[] nums, int k) {\n        PriorityQueue<Integer> pq = new PriorityQueue<>();\n        for (int n : nums) {\n            pq.offer(n);\n            if (pq.size() > k) pq.poll();\n        }\n        return pq.peek();\n    }\n}\n"
      }
    },
    "testCases": [
      {
        "input": "[3, 2, 1, 5, 6, 4], 2",
        "expectedOutput": "5"
      },
      {
        "input": "[3, 2, 3, 1, 2, 4, 5, 5, 6], 4",
        "expectedOutput": "4"
      }
    ],
    "hiddenTestCases": [
      {
        "input": "[1], 1",
        "expectedOutput": "1"
      },
      {
        "input": "[-1, 2, 0], 1",
        "expectedOutput": "2"
      }
    ]
  },
  {
    "id": "p_valid_anagram",
    "title": "Valid Anagram",
    "category": "Strings",
    "difficulty": "Easy",
    "acceptance": "64.1%",
    "companies": [
      "Google",
      "Wipro",
      "TCS",
      "Cognizant"
    ],
    "functionName": "isAnagram",
    "hints": [
      "Check lengths first.",
      "Two strings are anagrams if their character counts are identical."
    ],
    "description": "Given two strings `s` and `t`, return `true` if `t` is an anagram of `s`, and `false` otherwise.",
    "constraints": [
      "1 <= s.length, t.length <= 5 * 10^4",
      "s and t consist of lowercase English letters."
    ],
    "examples": [
      {
        "input": "s = \"anagram\", t = \"nagaram\"",
        "output": "true"
      },
      {
        "input": "s = \"rat\", t = \"car\"",
        "output": "false"
      }
    ],
    "starterCode": {
      "python": "def isAnagram(s: str, t: str) -> bool:\n    # Write your solution here\n    pass\n",
      "javascript": "function isAnagram(s, t) {\n  // Write your solution here\n}\n",
      "cpp": "#include <string>\nusing namespace std;\n\nbool isAnagram(string s, string t) {\n    // Write your solution here\n    return false;\n}\n",
      "java": "class Solution {\n    public boolean isAnagram(String s, String t) {\n        // Write your solution here\n        return false;\n    }\n}\n"
    },
    "referenceSolution": {
      "timeComplexity": "O(n)",
      "spaceComplexity": "O(1) (26 characters)",
      "approach": "Frequency array of size 26. Increment count for chars in s, decrement for t. All counts must be 0.",
      "code": {
        "python": "def isAnagram(s: str, t: str) -> bool:\n    if len(s) != len(t): return False\n    from collections import Counter\n    return Counter(s) == Counter(t)\n",
        "javascript": "function isAnagram(s, t) {\n  if (s.length !== t.length) return false;\n  const count = {};\n  for (const c of s) count[c] = (count[c] || 0) + 1;\n  for (const c of t) {\n    if (!count[c]) return false;\n    count[c]--;\n  }\n  return true;\n}\n",
        "cpp": "#include <string>\n#include <vector>\nusing namespace std;\n\nbool isAnagram(string s, string t) {\n    if (s.length() != t.length()) return false;\n    vector<int> cnt(26, 0);\n    for (char c : s) cnt[c - 'a']++;\n    for (char c : t) if (--cnt[c - 'a'] < 0) return false;\n    return true;\n}\n",
        "java": "class Solution {\n    public boolean isAnagram(String s, String t) {\n        if (s.length() != t.length()) return false;\n        int[] cnt = new int[26];\n        for (char c : s.toCharArray()) cnt[c - 'a']++;\n        for (char c : t.toCharArray()) if (--cnt[c - 'a'] < 0) return false;\n        return true;\n    }\n}\n"
      }
    },
    "testCases": [
      {
        "input": "\"anagram\", \"nagaram\"",
        "expectedOutput": "true"
      },
      {
        "input": "\"rat\", \"car\"",
        "expectedOutput": "false"
      }
    ],
    "hiddenTestCases": [
      {
        "input": "\"a\", \"a\"",
        "expectedOutput": "true"
      },
      {
        "input": "\"ab\", \"a\"",
        "expectedOutput": "false"
      }
    ]
  },
  {
    "id": "p_longest_substring",
    "title": "Longest Substring Without Repeating Characters",
    "category": "Strings",
    "difficulty": "Medium",
    "acceptance": "34.8%",
    "companies": [
      "Amazon",
      "Microsoft",
      "Flipkart",
      "Oracle"
    ],
    "functionName": "lengthOfLongestSubstring",
    "hints": [
      "Use sliding window with two pointers left and right.",
      "Store each character with its latest seen index."
    ],
    "description": "Given a string `s`, find the length of the longest substring without duplicate characters.",
    "constraints": [
      "0 <= s.length <= 5 * 10^4"
    ],
    "examples": [
      {
        "input": "s = \"abcabcbb\"",
        "output": "3",
        "explanation": "The answer is \"abc\", length 3."
      },
      {
        "input": "s = \"bbbbb\"",
        "output": "1",
        "explanation": "The answer is \"b\", length 1."
      }
    ],
    "starterCode": {
      "python": "def lengthOfLongestSubstring(s: str) -> int:\n    # Write your solution here\n    pass\n",
      "javascript": "function lengthOfLongestSubstring(s) {\n  // Write your solution here\n}\n",
      "cpp": "#include <string>\nusing namespace std;\n\nint lengthOfLongestSubstring(string s) {\n    // Write your solution here\n    return 0;\n}\n",
      "java": "class Solution {\n    public int lengthOfLongestSubstring(String s) {\n        // Write your solution here\n        return 0;\n    }\n}\n"
    },
    "referenceSolution": {
      "timeComplexity": "O(n)",
      "spaceComplexity": "O(min(m, n))",
      "approach": "Sliding window with hash map storing character index. Jump left pointer whenever duplicate found.",
      "code": {
        "python": "def lengthOfLongestSubstring(s: str) -> int:\n    seen = {}\n    l = max_len = 0\n    for r, c in enumerate(s):\n        if c in seen and seen[c] >= l:\n            l = seen[c] + 1\n        seen[c] = r\n        max_len = max(max_len, r - l + 1)\n    return max_len\n",
        "javascript": "function lengthOfLongestSubstring(s) {\n  let seen = new Map(), l = 0, maxLen = 0;\n  for (let r = 0; r < s.length; r++) {\n    if (seen.has(s[r]) && seen.get(s[r]) >= l) l = seen.get(s[r]) + 1;\n    seen.set(s[r], r);\n    maxLen = Math.max(maxLen, r - l + 1);\n  }\n  return maxLen;\n}\n",
        "cpp": "#include <string>\n#include <unordered_map>\n#include <algorithm>\nusing namespace std;\n\nint lengthOfLongestSubstring(string s) {\n    unordered_map<char, int> seen;\n    int l = 0, maxLen = 0;\n    for (int r = 0; r < s.size(); ++r) {\n        if (seen.count(s[r]) && seen[s[r]] >= l) l = seen[s[r]] + 1;\n        seen[s[r]] = r;\n        maxLen = max(maxLen, r - l + 1);\n    }\n    return maxLen;\n}\n",
        "java": "import java.util.HashMap;\n\nclass Solution {\n    public int lengthOfLongestSubstring(String s) {\n        HashMap<Character, Integer> seen = new HashMap<>();\n        int l = 0, maxLen = 0;\n        for (int r = 0; r < s.length(); r++) {\n            char c = s.charAt(r);\n            if (seen.containsKey(c) && seen.get(c) >= l) l = seen.get(c) + 1;\n            seen.put(c, r);\n            maxLen = Math.max(maxLen, r - l + 1);\n        }\n        return maxLen;\n    }\n}\n"
      }
    },
    "testCases": [
      {
        "input": "\"abcabcbb\"",
        "expectedOutput": "3"
      },
      {
        "input": "\"bbbbb\"",
        "expectedOutput": "1"
      }
    ],
    "hiddenTestCases": [
      {
        "input": "\"pwwkew\"",
        "expectedOutput": "3"
      },
      {
        "input": "\"\"",
        "expectedOutput": "0"
      }
    ]
  },
  {
    "id": "p_valid_palindrome",
    "title": "Valid Palindrome",
    "category": "Strings",
    "difficulty": "Easy",
    "acceptance": "46.1%",
    "companies": [
      "TCS",
      "Infosys",
      "Cognizant",
      "Facebook"
    ],
    "functionName": "isPalindrome",
    "hints": [
      "Filter out non-alphanumeric characters and convert to lowercase.",
      "Compare characters from both ends using two pointers."
    ],
    "description": "A phrase is a palindrome if, after converting all uppercase letters into lowercase letters and removing all non-alphanumeric characters, it reads the same forward and backward.",
    "constraints": [
      "1 <= s.length <= 2 * 10^5",
      "s consists only of printable ASCII characters."
    ],
    "examples": [
      {
        "input": "s = \"A man, a plan, a canal: Panama\"",
        "output": "true"
      },
      {
        "input": "s = \"race a car\"",
        "output": "false"
      }
    ],
    "starterCode": {
      "python": "def isPalindrome(s: str) -> bool:\n    # Write your solution here\n    pass\n",
      "javascript": "function isPalindrome(s) {\n  // Write your solution here\n}\n",
      "cpp": "#include <string>\nusing namespace std;\n\nbool isPalindrome(string s) {\n    // Write your solution here\n    return false;\n}\n",
      "java": "class Solution {\n    public boolean isPalindrome(String s) {\n        // Write your solution here\n        return false;\n    }\n}\n"
    },
    "referenceSolution": {
      "timeComplexity": "O(n)",
      "spaceComplexity": "O(1)",
      "approach": "Two-pointer approach skipping non-alphanumeric characters, comparing characters in lowercase.",
      "code": {
        "python": "def isPalindrome(s: str) -> bool:\n    l, r = 0, len(s) - 1\n    while l < r:\n        while l < r and not s[l].isalnum(): l += 1\n        while l < r and not s[r].isalnum(): r -= 1\n        if s[l].lower() != s[r].lower(): return False\n        l += 1; r -= 1\n    return True\n",
        "javascript": "function isPalindrome(s) {\n  const clean = s.toLowerCase().replace(/[^a-z0-9]/g, '');\n  return clean === clean.split('').reverse().join('');\n}\n",
        "cpp": "#include <string>\n#include <cctype>\nusing namespace std;\n\nbool isPalindrome(string s) {\n    int l = 0, r = s.size() - 1;\n    while (l < r) {\n        while (l < r && !isalnum(s[l])) l++;\n        while (l < r && !isalnum(s[r])) r--;\n        if (tolower(s[l]) != tolower(s[r])) return false;\n        l++; r--;\n    }\n    return true;\n}\n",
        "java": "class Solution {\n    public boolean isPalindrome(String s) {\n        int l = 0, r = s.length() - 1;\n        while (l < r) {\n            while (l < r && !Character.isLetterOrDigit(s.charAt(l))) l++;\n            while (l < r && !Character.isLetterOrDigit(s.charAt(r))) r--;\n            if (Character.toLowerCase(s.charAt(l)) != Character.toLowerCase(s.charAt(r))) return false;\n            l++; r--;\n        }\n        return true;\n    }\n}\n"
      }
    },
    "testCases": [
      {
        "input": "\"A man, a plan, a canal: Panama\"",
        "expectedOutput": "true"
      },
      {
        "input": "\"race a car\"",
        "expectedOutput": "false"
      }
    ],
    "hiddenTestCases": [
      {
        "input": "\" \"",
        "expectedOutput": "true"
      },
      {
        "input": "\"0P\"",
        "expectedOutput": "false"
      }
    ]
  },
  {
    "id": "p_longest_common_prefix",
    "title": "Longest Common Prefix",
    "category": "Strings",
    "difficulty": "Easy",
    "acceptance": "42.3%",
    "companies": [
      "Zoho",
      "Accenture",
      "Google",
      "TCS"
    ],
    "functionName": "longestCommonPrefix",
    "hints": [
      "Sort the array and compare only the first and last strings.",
      "Or iteratively shorten the prefix while other strings do not start with it."
    ],
    "description": "Write a function to find the longest common prefix string amongst an array of strings. If there is no common prefix, return an empty string `\"\"`.",
    "constraints": [
      "1 <= strs.length <= 200",
      "0 <= strs[i].length <= 200",
      "strs[i] consists of lowercase English letters."
    ],
    "examples": [
      {
        "input": "strs = [\"flower\",\"flow\",\"flight\"]",
        "output": "\"fl\""
      },
      {
        "input": "strs = [\"dog\",\"racecar\",\"car\"]",
        "output": "\"\""
      }
    ],
    "starterCode": {
      "python": "def longestCommonPrefix(strs: list[str]) -> str:\n    # Write your solution here\n    pass\n",
      "javascript": "function longestCommonPrefix(strs) {\n  // Write your solution here\n}\n",
      "cpp": "#include <vector>\n#include <string>\nusing namespace std;\n\nstring longestCommonPrefix(vector<string>& strs) {\n    // Write your solution here\n    return \"\";\n}\n",
      "java": "class Solution {\n    public String longestCommonPrefix(String[] strs) {\n        // Write your solution here\n        return \"\";\n    }\n}\n"
    },
    "referenceSolution": {
      "timeComplexity": "O(S) where S is sum of all characters",
      "spaceComplexity": "O(1)",
      "approach": "Start with strs[0] as prefix. While current word does not start with prefix, remove last char from prefix.",
      "code": {
        "python": "def longestCommonPrefix(strs: list[str]) -> str:\n    if not strs: return \"\"\n    prefix = strs[0]\n    for s in strs[1:]:\n        while not s.startswith(prefix):\n            prefix = prefix[:-1]\n            if not prefix: return \"\"\n    return prefix\n",
        "javascript": "function longestCommonPrefix(strs) {\n  if (!strs.length) return \"\";\n  let prefix = strs[0];\n  for (let i = 1; i < strs.length; i++) {\n    while (strs[i].indexOf(prefix) !== 0) {\n      prefix = prefix.substring(0, prefix.length - 1);\n      if (!prefix) return \"\";\n    }\n  }\n  return prefix;\n}\n",
        "cpp": "#include <vector>\n#include <string>\nusing namespace std;\n\nstring longestCommonPrefix(vector<string>& strs) {\n    if (strs.empty()) return \"\";\n    string prefix = strs[0];\n    for (size_t i = 1; i < strs.size(); ++i) {\n        while (strs[i].find(prefix) != 0) {\n            prefix = prefix.substr(0, prefix.size() - 1);\n            if (prefix.empty()) return \"\";\n        }\n    }\n    return prefix;\n}\n",
        "java": "class Solution {\n    public String longestCommonPrefix(String[] strs) {\n        if (strs.length == 0) return \"\";\n        String prefix = strs[0];\n        for (int i = 1; i < strs.length; i++) {\n            while (strs[i].indexOf(prefix) != 0) {\n                prefix = prefix.substring(0, prefix.length() - 1);\n                if (prefix.isEmpty()) return \"\";\n            }\n        }\n        return prefix;\n    }\n}\n"
      }
    },
    "testCases": [
      {
        "input": "[\"flower\", \"flow\", \"flight\"]",
        "expectedOutput": "\"fl\""
      },
      {
        "input": "[\"dog\", \"racecar\", \"car\"]",
        "expectedOutput": "\"\""
      }
    ],
    "hiddenTestCases": [
      {
        "input": "[\"interspecies\", \"interstellar\", \"interstate\"]",
        "expectedOutput": "\"inters\""
      },
      {
        "input": "[\"throne\", \"throne\"]",
        "expectedOutput": "\"throne\""
      }
    ]
  },
  {
    "id": "p_group_anagrams",
    "title": "Group Anagrams",
    "category": "Strings",
    "difficulty": "Medium",
    "acceptance": "67.8%",
    "companies": [
      "Amazon",
      "Microsoft",
      "Flipkart",
      "Google"
    ],
    "functionName": "groupAnagrams",
    "hints": [
      "Sort each word alphabetically to use as a hash map key.",
      "Group all words sharing the same sorted key together in a list."
    ],
    "description": "Given an array of strings `strs`, group the anagrams together. You can return the answer in any order.",
    "constraints": [
      "1 <= strs.length <= 10^4",
      "0 <= strs[i].length <= 100",
      "strs[i] consists of lowercase English letters."
    ],
    "examples": [
      {
        "input": "strs = [\"eat\",\"tea\",\"tan\",\"ate\",\"nat\",\"bat\"]",
        "output": "[[\"bat\"],[\"nat\",\"tan\"],[\"ate\",\"eat\",\"tea\"]]"
      },
      {
        "input": "strs = [\"\"]",
        "output": "[[\"\"]]"
      }
    ],
    "starterCode": {
      "python": "def groupAnagrams(strs: list[str]) -> list[list[str]]:\n    # Write your solution here\n    pass\n",
      "javascript": "function groupAnagrams(strs) {\n  // Write your solution here\n}\n",
      "cpp": "#include <vector>\n#include <string>\nusing namespace std;\n\nvector<vector<string>> groupAnagrams(vector<string>& strs) {\n    // Write your solution here\n    return {};\n}\n",
      "java": "import java.util.*;\n\nclass Solution {\n    public List<List<String>> groupAnagrams(String[] strs) {\n        // Write your solution here\n        return new ArrayList<>();\n    }\n}\n"
    },
    "referenceSolution": {
      "timeComplexity": "O(N * K log K)",
      "spaceComplexity": "O(N * K)",
      "approach": "Hash map with sorted string as key. All anagrams will map to the same sorted string.",
      "code": {
        "python": "def groupAnagrams(strs: list[str]) -> list[list[str]]:\n    from collections import defaultdict\n    groups = defaultdict(list)\n    for s in strs:\n        groups[''.join(sorted(s))].append(s)\n    return list(groups.values())\n",
        "javascript": "function groupAnagrams(strs) {\n  const map = new Map();\n  for (const s of strs) {\n    const key = s.split('').sort().join('');\n    if (!map.has(key)) map.set(key, []);\n    map.get(key).push(s);\n  }\n  return Array.from(map.values());\n}\n",
        "cpp": "#include <vector>\n#include <string>\n#include <unordered_map>\n#include <algorithm>\nusing namespace std;\n\nvector<vector<string>> groupAnagrams(vector<string>& strs) {\n    unordered_map<string, vector<string>> mp;\n    for (const string& s : strs) {\n        string k = s;\n        sort(k.begin(), k.end());\n        mp[k].push_back(s);\n    }\n    vector<vector<string>> res;\n    for (auto& p : mp) res.push_back(p.second);\n    return res;\n}\n",
        "java": "import java.util.*;\n\nclass Solution {\n    public List<List<String>> groupAnagrams(String[] strs) {\n        Map<String, List<String>> map = new HashMap<>();\n        for (String s : strs) {\n            char[] ca = s.toCharArray();\n            Arrays.sort(ca);\n            String key = String.valueOf(ca);\n            map.computeIfAbsent(key, k -> new ArrayList<>()).add(s);\n        }\n        return new ArrayList<>(map.values());\n    }\n}\n"
      }
    },
    "testCases": [
      {
        "input": "[\"eat\", \"tea\", \"tan\", \"ate\", \"nat\", \"bat\"]",
        "expectedOutput": "[[\"bat\"], [\"nat\", \"tan\"], [\"ate\", \"eat\", \"tea\"]]"
      },
      {
        "input": "[\"\"]",
        "expectedOutput": "[[\"\"]]"
      }
    ],
    "hiddenTestCases": [
      {
        "input": "[\"a\"]",
        "expectedOutput": "[[\"a\"]]"
      },
      {
        "input": "[\"ab\", \"ba\"]",
        "expectedOutput": "[[\"ab\", \"ba\"]]"
      }
    ]
  },
  {
    "id": "p_first_unique_char",
    "title": "First Unique Character in a String",
    "category": "Strings",
    "difficulty": "Easy",
    "acceptance": "61.2%",
    "companies": [
      "TCS",
      "Wipro",
      "Zoho",
      "Accenture"
    ],
    "functionName": "firstUniqChar",
    "hints": [
      "Count the frequency of each character in first pass.",
      "In second pass, find first character with count 1."
    ],
    "description": "Given a string `s`, find the first non-repeating character in it and return its index. If it does not exist, return `-1`.",
    "constraints": [
      "1 <= s.length <= 10^5",
      "s consists of only lowercase English letters."
    ],
    "examples": [
      {
        "input": "s = \"leetcode\"",
        "output": "0"
      },
      {
        "input": "s = \"loveleetcode\"",
        "output": "2"
      },
      {
        "input": "s = \"aabb\"",
        "output": "-1"
      }
    ],
    "starterCode": {
      "python": "def firstUniqChar(s: str) -> int:\n    # Write your solution here\n    pass\n",
      "javascript": "function firstUniqChar(s) {\n  // Write your solution here\n}\n",
      "cpp": "#include <string>\nusing namespace std;\n\nint firstUniqChar(string s) {\n    // Write your solution here\n    return -1;\n}\n",
      "java": "class Solution {\n    public int firstUniqChar(String s) {\n        // Write your solution here\n        return -1;\n    }\n}\n"
    },
    "referenceSolution": {
      "timeComplexity": "O(n)",
      "spaceComplexity": "O(1) (26 letters)",
      "approach": "Frequency table: Count characters in first pass, identify first index with count 1 in second pass.",
      "code": {
        "python": "def firstUniqChar(s: str) -> int:\n    from collections import Counter\n    cnt = Counter(s)\n    for i, c in enumerate(s):\n        if cnt[c] == 1: return i\n    return -1\n",
        "javascript": "function firstUniqChar(s) {\n  const count = {};\n  for (const c of s) count[c] = (count[c] || 0) + 1;\n  for (let i = 0; i < s.length; i++) {\n    if (count[s[i]] === 1) return i;\n  }\n  return -1;\n}\n",
        "cpp": "#include <string>\n#include <vector>\nusing namespace std;\n\nint firstUniqChar(string s) {\n    vector<int> count(26, 0);\n    for (char c : s) count[c - 'a']++;\n    for (int i = 0; i < s.size(); ++i) if (count[s[i] - 'a'] == 1) return i;\n    return -1;\n}\n",
        "java": "class Solution {\n    public int firstUniqChar(String s) {\n        int[] count = new int[26];\n        for (char c : s.toCharArray()) count[c - 'a']++;\n        for (int i = 0; i < s.length(); i++) if (count[s.charAt(i) - 'a'] == 1) return i;\n        return -1;\n    }\n}\n"
      }
    },
    "testCases": [
      {
        "input": "\"leetcode\"",
        "expectedOutput": "0"
      },
      {
        "input": "\"loveleetcode\"",
        "expectedOutput": "2"
      }
    ],
    "hiddenTestCases": [
      {
        "input": "\"aabb\"",
        "expectedOutput": "-1"
      },
      {
        "input": "\"z\"",
        "expectedOutput": "0"
      }
    ]
  },
  {
    "id": "p_reverse_words",
    "title": "Reverse Words in a String",
    "category": "Strings",
    "difficulty": "Medium",
    "acceptance": "42.1%",
    "companies": [
      "Infosys",
      "Deloitte",
      "Microsoft",
      "Amazon"
    ],
    "functionName": "reverseWords",
    "hints": [
      "Split words by whitespace, ignoring multiple spaces.",
      "Reverse array of words and join with a single space."
    ],
    "description": "Given an input string `s`, reverse the order of the words. Return a string of the words in reverse order concatenated by a single space.",
    "constraints": [
      "1 <= s.length <= 10^4",
      "s contains English letters, digits, and spaces."
    ],
    "examples": [
      {
        "input": "s = \"the sky is blue\"",
        "output": "\"blue is sky the\""
      },
      {
        "input": "s = \"  hello world  \"",
        "output": "\"world hello\""
      }
    ],
    "starterCode": {
      "python": "def reverseWords(s: str) -> str:\n    # Write your solution here\n    pass\n",
      "javascript": "function reverseWords(s) {\n  // Write your solution here\n}\n",
      "cpp": "#include <string>\nusing namespace std;\n\nstring reverseWords(string s) {\n    // Write your solution here\n    return \"\";\n}\n",
      "java": "class Solution {\n    public String reverseWords(String s) {\n        // Write your solution here\n        return \"\";\n    }\n}\n"
    },
    "referenceSolution": {
      "timeComplexity": "O(n)",
      "spaceComplexity": "O(n)",
      "approach": "Split string by spaces, filter empty tokens, reverse the tokens and join with space.",
      "code": {
        "python": "def reverseWords(s: str) -> str:\n    return ' '.join(s.split()[::-1])\n",
        "javascript": "function reverseWords(s) {\n  return s.trim().split(/\\s+/).reverse().join(' ');\n}\n",
        "cpp": "#include <string>\n#include <sstream>\n#include <vector>\nusing namespace std;\n\nstring reverseWords(string s) {\n    stringstream ss(s);\n    string word, res;\n    vector<string> words;\n    while (ss >> word) words.push_back(word);\n    for (int i = words.size() - 1; i >= 0; --i) {\n        res += words[i];\n        if (i > 0) res += \" \";\n    }\n    return res;\n}\n",
        "java": "class Solution {\n    public String reverseWords(String s) {\n        String[] words = s.trim().split(\"\\\\s+\");\n        StringBuilder sb = new StringBuilder();\n        for (int i = words.length - 1; i >= 0; i--) {\n            sb.append(words[i]);\n            if (i > 0) sb.append(\" \");\n        }\n        return sb.toString();\n    }\n}\n"
      }
    },
    "testCases": [
      {
        "input": "\"the sky is blue\"",
        "expectedOutput": "\"blue is sky the\""
      },
      {
        "input": "\"  hello world  \"",
        "expectedOutput": "\"world hello\""
      }
    ],
    "hiddenTestCases": [
      {
        "input": "\"a good   example\"",
        "expectedOutput": "\"example good a\""
      },
      {
        "input": "\"single\"",
        "expectedOutput": "\"single\""
      }
    ]
  },
  {
    "id": "p_palindrome_number",
    "title": "Palindrome Number",
    "category": "Strings",
    "difficulty": "Easy",
    "acceptance": "55.3%",
    "companies": [
      "Wipro",
      "TCS",
      "Deloitte",
      "Cognizant"
    ],
    "functionName": "isPalindromeNumber",
    "hints": [
      "Negative numbers cannot be palindromes.",
      "Convert to string or reverse the integer mathematically."
    ],
    "description": "Given an integer `x`, return `true` if `x` is a palindrome, and `false` otherwise.",
    "constraints": [
      "-2^31 <= x <= 2^31 - 1"
    ],
    "examples": [
      {
        "input": "x = 121",
        "output": "true"
      },
      {
        "input": "x = -121",
        "output": "false"
      }
    ],
    "starterCode": {
      "python": "def isPalindromeNumber(x: int) -> bool:\n    # Write your solution here\n    pass\n",
      "javascript": "function isPalindromeNumber(x) {\n  // Write your solution here\n}\n",
      "cpp": "bool isPalindromeNumber(int x) {\n    // Write your solution here\n    return false;\n}\n",
      "java": "class Solution {\n    public boolean isPalindromeNumber(int x) {\n        // Write your solution here\n        return false;\n    }\n}\n"
    },
    "referenceSolution": {
      "timeComplexity": "O(log10(x))",
      "spaceComplexity": "O(1)",
      "approach": "Negative numbers are not palindromes. Reverse second half of digits and compare.",
      "code": {
        "python": "def isPalindromeNumber(x: int) -> bool:\n    if x < 0: return False\n    return str(x) == str(x)[::-1]\n",
        "javascript": "function isPalindromeNumber(x) {\n  if (x < 0) return false;\n  const s = String(x);\n  return s === s.split('').reverse().join('');\n}\n",
        "cpp": "bool isPalindromeNumber(int x) {\n    if (x < 0 || (x % 10 == 0 && x != 0)) return false;\n    int rev = 0;\n    while (x > rev) {\n        rev = rev * 10 + x % 10;\n        x /= 10;\n    }\n    return x == rev || x == rev / 10;\n}\n",
        "java": "class Solution {\n    public boolean isPalindromeNumber(int x) {\n        if (x < 0 || (x % 10 == 0 && x != 0)) return false;\n        int rev = 0;\n        while (x > rev) {\n            rev = rev * 10 + x % 10;\n            x /= 10;\n        }\n        return x == rev || x == rev / 10;\n    }\n}\n"
      }
    },
    "testCases": [
      {
        "input": "121",
        "expectedOutput": "true"
      },
      {
        "input": "-121",
        "expectedOutput": "false"
      }
    ],
    "hiddenTestCases": [
      {
        "input": "10",
        "expectedOutput": "false"
      },
      {
        "input": "0",
        "expectedOutput": "true"
      }
    ]
  },
  {
    "id": "p_valid_parentheses",
    "title": "Valid Parentheses",
    "category": "Stack & Queue",
    "difficulty": "Easy",
    "acceptance": "40.8%",
    "companies": [
      "Amazon",
      "TCS",
      "Google",
      "Zoho"
    ],
    "functionName": "isValid",
    "hints": [
      "Use a stack to push opening brackets.",
      "When closing bracket arrives, verify it matches top of stack."
    ],
    "description": "Given a string `s` containing just the characters `'('`, `')'`, `'{'`, `'}'`, `'['` and `']'`, determine if the input string is valid.",
    "constraints": [
      "1 <= s.length <= 10^4",
      "s consists of parentheses only '()[]{}'."
    ],
    "examples": [
      {
        "input": "s = \"()\"",
        "output": "true"
      },
      {
        "input": "s = \"()[]{}\"",
        "output": "true"
      },
      {
        "input": "s = \"(]\"",
        "output": "false"
      }
    ],
    "starterCode": {
      "python": "def isValid(s: str) -> bool:\n    # Write your solution here\n    pass\n",
      "javascript": "function isValid(s) {\n  // Write your solution here\n}\n",
      "cpp": "#include <string>\nusing namespace std;\n\nbool isValid(string s) {\n    // Write your solution here\n    return false;\n}\n",
      "java": "class Solution {\n    public boolean isValid(String s) {\n        // Write your solution here\n        return false;\n    }\n}\n"
    },
    "referenceSolution": {
      "timeComplexity": "O(n)",
      "spaceComplexity": "O(n)",
      "approach": "Stack: Push expected closing bracket when opening bracket is seen. Match and pop upon seeing closing bracket.",
      "code": {
        "python": "def isValid(s: str) -> bool:\n    stack = []\n    match = {')': '(', '}': '{', ']': '['}\n    for c in s:\n        if c in match:\n            if not stack or stack.pop() != match[c]: return False\n        else: stack.append(c)\n    return len(stack) == 0\n",
        "javascript": "function isValid(s) {\n  const stack = [];\n  const match = { ')': '(', '}': '{', ']': '[' };\n  for (const c of s) {\n    if (match[c]) {\n      if (!stack.length || stack.pop() !== match[c]) return false;\n    } else stack.push(c);\n  }\n  return stack.length === 0;\n}\n",
        "cpp": "#include <string>\n#include <stack>\nusing namespace std;\n\nbool isValid(string s) {\n    stack<char> st;\n    for (char c : s) {\n        if (c == '(') st.push(')');\n        else if (c == '{') st.push('}');\n        else if (c == '[') st.push(']');\n        else {\n            if (st.empty() || st.top() != c) return false;\n            st.pop();\n        }\n    }\n    return st.empty();\n}\n",
        "java": "import java.util.Stack;\n\nclass Solution {\n    public boolean isValid(String s) {\n        Stack<Character> st = new Stack<>();\n        for (char c : s.toCharArray()) {\n            if (c == '(') st.push(')');\n            else if (c == '{') st.push('}');\n            else if (c == '[') st.push(']');\n            else if (st.isEmpty() || st.pop() != c) return false;\n        }\n        return st.isEmpty();\n    }\n}\n"
      }
    },
    "testCases": [
      {
        "input": "\"()\"",
        "expectedOutput": "true"
      },
      {
        "input": "\"()[]{}\"",
        "expectedOutput": "true"
      }
    ],
    "hiddenTestCases": [
      {
        "input": "\"(]\"",
        "expectedOutput": "false"
      },
      {
        "input": "\"([)]\"",
        "expectedOutput": "false"
      }
    ]
  },
  {
    "id": "p_daily_temperatures",
    "title": "Daily Temperatures",
    "category": "Stack & Queue",
    "difficulty": "Medium",
    "acceptance": "66.2%",
    "companies": [
      "Amazon",
      "Flipkart",
      "Microsoft"
    ],
    "functionName": "dailyTemperatures",
    "hints": [
      "Monotonic decreasing stack storing indices.",
      "Pop elements when current temperature is warmer, calculating days difference."
    ],
    "description": "Given an array of integers `temperatures` represents the daily temperatures, return an array `answer` such that `answer[i]` is the number of days you have to wait after the `i`th day to get a warmer temperature.",
    "constraints": [
      "1 <= temperatures.length <= 10^5",
      "30 <= temperatures[i] <= 100"
    ],
    "examples": [
      {
        "input": "temperatures = [73,74,75,71,69,72,76,73]",
        "output": "[1,1,4,2,1,1,0,0]"
      },
      {
        "input": "temperatures = [30,40,50,60]",
        "output": "[1,1,1,0]"
      }
    ],
    "starterCode": {
      "python": "def dailyTemperatures(temperatures: list[int]) -> list[int]:\n    # Write your solution here\n    pass\n",
      "javascript": "function dailyTemperatures(temperatures) {\n  // Write your solution here\n}\n",
      "cpp": "#include <vector>\nusing namespace std;\n\nvector<int> dailyTemperatures(vector<int>& temperatures) {\n    // Write your solution here\n    return {};\n}\n",
      "java": "class Solution {\n    public int[] dailyTemperatures(int[] temperatures) {\n        // Write your solution here\n        return new int[]{};\n    }\n}\n"
    },
    "referenceSolution": {
      "timeComplexity": "O(n)",
      "spaceComplexity": "O(n)",
      "approach": "Monotonic stack: Store indices of temperatures. When a warmer day arrives, pop and calculate index difference.",
      "code": {
        "python": "def dailyTemperatures(temperatures: list[int]) -> list[int]:\n    res = [0] * len(temperatures)\n    stack = []\n    for i, t in enumerate(temperatures):\n        while stack and temperatures[stack[-1]] < t:\n            prev = stack.pop()\n            res[prev] = i - prev\n        stack.append(i)\n    return res\n",
        "javascript": "function dailyTemperatures(temperatures) {\n  const res = new Array(temperatures.length).fill(0);\n  const stack = [];\n  for (let i = 0; i < temperatures.length; i++) {\n    while (stack.length && temperatures[stack[stack.length - 1]] < temperatures[i]) {\n      const prev = stack.pop();\n      res[prev] = i - prev;\n    }\n    stack.push(i);\n  }\n  return res;\n}\n",
        "cpp": "#include <vector>\n#include <stack>\nusing namespace std;\n\nvector<int> dailyTemperatures(vector<int>& temperatures) {\n    int n = temperatures.size();\n    vector<int> res(n, 0);\n    stack<int> st;\n    for (int i = 0; i < n; ++i) {\n        while (!st.empty() && temperatures[st.top()] < temperatures[i]) {\n            int prev = st.top(); st.pop();\n            res[prev] = i - prev;\n        }\n        st.push(i);\n    }\n    return res;\n}\n",
        "java": "import java.util.Stack;\n\nclass Solution {\n    public int[] dailyTemperatures(int[] temperatures) {\n        int n = temperatures.length;\n        int[] res = new int[n];\n        Stack<Integer> st = new Stack<>();\n        for (int i = 0; i < n; i++) {\n            while (!st.isEmpty() && temperatures[st.peek()] < temperatures[i]) {\n                int prev = st.pop();\n                res[prev] = i - prev;\n            }\n            st.push(i);\n        }\n        return res;\n    }\n}\n"
      }
    },
    "testCases": [
      {
        "input": "[73, 74, 75, 71, 69, 72, 76, 73]",
        "expectedOutput": "[1, 1, 4, 2, 1, 1, 0, 0]"
      },
      {
        "input": "[30, 40, 50, 60]",
        "expectedOutput": "[1, 1, 1, 0]"
      }
    ],
    "hiddenTestCases": [
      {
        "input": "[30, 60, 90]",
        "expectedOutput": "[1, 1, 0]"
      },
      {
        "input": "[50]",
        "expectedOutput": "[0]"
      }
    ]
  },
  {
    "id": "p_binary_search",
    "title": "Binary Search",
    "category": "Binary Search",
    "difficulty": "Easy",
    "acceptance": "58.1%",
    "companies": [
      "TCS",
      "Infosys",
      "Wipro",
      "Accenture"
    ],
    "functionName": "binarySearch",
    "hints": [
      "Array is sorted. Compare target with middle element.",
      "Shrink left or right bounds by 1 each step."
    ],
    "description": "Given an array of integers `nums` which is sorted in ascending order, and an integer `target`, search `target` in `nums`. If it exists, return its index. Otherwise, return `-1`.",
    "constraints": [
      "1 <= nums.length <= 10^4",
      "-10^4 < nums[i], target < 10^4",
      "All integers in nums are unique."
    ],
    "examples": [
      {
        "input": "nums = [-1,0,3,5,9,12], target = 9",
        "output": "4"
      },
      {
        "input": "nums = [-1,0,3,5,9,12], target = 2",
        "output": "-1"
      }
    ],
    "starterCode": {
      "python": "def binarySearch(nums: list[int], target: int) -> int:\n    # Write your solution here\n    pass\n",
      "javascript": "function binarySearch(nums, target) {\n  // Write your solution here\n}\n",
      "cpp": "#include <vector>\nusing namespace std;\n\nint binarySearch(vector<int>& nums, int target) {\n    // Write your solution here\n    return -1;\n}\n",
      "java": "class Solution {\n    public int binarySearch(int[] nums, int target) {\n        // Write your solution here\n        return -1;\n    }\n}\n"
    },
    "referenceSolution": {
      "timeComplexity": "O(log n)",
      "spaceComplexity": "O(1)",
      "approach": "Classic two-pointer binary search with mid = l + (r - l) // 2.",
      "code": {
        "python": "def binarySearch(nums: list[int], target: int) -> int:\n    l, r = 0, len(nums) - 1\n    while l <= r:\n        m = (l + r) // 2\n        if nums[m] == target: return m\n        elif nums[m] < target: l = m + 1\n        else: r = m - 1\n    return -1\n",
        "javascript": "function binarySearch(nums, target) {\n  let l = 0, r = nums.length - 1;\n  while (l <= r) {\n    const m = Math.floor((l + r) / 2);\n    if (nums[m] === target) return m;\n    if (nums[m] < target) l = m + 1;\n    else r = m - 1;\n  }\n  return -1;\n}\n",
        "cpp": "#include <vector>\nusing namespace std;\n\nint binarySearch(vector<int>& nums, int target) {\n    int l = 0, r = nums.size() - 1;\n    while (l <= r) {\n        int m = l + (r - l) / 2;\n        if (nums[m] == target) return m;\n        if (nums[m] < target) l = m + 1;\n        else r = m - 1;\n    }\n    return -1;\n}\n",
        "java": "class Solution {\n    public int binarySearch(int[] nums, int target) {\n        int l = 0, r = nums.length - 1;\n        while (l <= r) {\n            int m = l + (r - l) / 2;\n            if (nums[m] == target) return m;\n            if (nums[m] < target) l = m + 1;\n            else r = m - 1;\n        }\n        return -1;\n    }\n}\n"
      }
    },
    "testCases": [
      {
        "input": "[-1, 0, 3, 5, 9, 12], 9",
        "expectedOutput": "4"
      },
      {
        "input": "[-1, 0, 3, 5, 9, 12], 2",
        "expectedOutput": "-1"
      }
    ],
    "hiddenTestCases": [
      {
        "input": "[5], 5",
        "expectedOutput": "0"
      },
      {
        "input": "[2, 5], 5",
        "expectedOutput": "1"
      }
    ]
  },
  {
    "id": "p_search_rotated",
    "title": "Search in Rotated Sorted Array",
    "category": "Binary Search",
    "difficulty": "Medium",
    "acceptance": "40.6%",
    "companies": [
      "Amazon",
      "Google",
      "Oracle",
      "Microsoft"
    ],
    "functionName": "searchRotated",
    "hints": [
      "In a rotated sorted array, one half is always strictly sorted.",
      "Check if target lies inside the sorted half."
    ],
    "description": "Given the array `nums` after possible rotation and an integer `target`, return the index of `target` if it is in `nums`, or `-1` if it is not.",
    "constraints": [
      "1 <= nums.length <= 5000",
      "-10^4 <= nums[i] <= 10^4",
      "All values in nums are unique."
    ],
    "examples": [
      {
        "input": "nums = [4,5,6,7,0,1,2], target = 0",
        "output": "4"
      },
      {
        "input": "nums = [4,5,6,7,0,1,2], target = 3",
        "output": "-1"
      }
    ],
    "starterCode": {
      "python": "def searchRotated(nums: list[int], target: int) -> int:\n    # Write your solution here\n    pass\n",
      "javascript": "function searchRotated(nums, target) {\n  // Write your solution here\n}\n",
      "cpp": "#include <vector>\nusing namespace std;\n\nint searchRotated(vector<int>& nums, int target) {\n    // Write your solution here\n    return -1;\n}\n",
      "java": "class Solution {\n    public int searchRotated(int[] nums, int target) {\n        // Write your solution here\n        return -1;\n    }\n}\n"
    },
    "referenceSolution": {
      "timeComplexity": "O(log n)",
      "spaceComplexity": "O(1)",
      "approach": "Binary search: At each step, either the left half or right half is sorted. Determine which half is sorted and whether target lies within it.",
      "code": {
        "python": "def searchRotated(nums: list[int], target: int) -> int:\n    l, r = 0, len(nums) - 1\n    while l <= r:\n        m = (l + r) // 2\n        if nums[m] == target: return m\n        if nums[l] <= nums[m]:\n            if nums[l] <= target < nums[m]: r = m - 1\n            else: l = m + 1\n        else:\n            if nums[m] < target <= nums[r]: l = m + 1\n            else: r = m - 1\n    return -1\n",
        "javascript": "function searchRotated(nums, target) {\n  let l = 0, r = nums.length - 1;\n  while (l <= r) {\n    const m = Math.floor((l + r) / 2);\n    if (nums[m] === target) return m;\n    if (nums[l] <= nums[m]) {\n      if (nums[l] <= target && target < nums[m]) r = m - 1;\n      else l = m + 1;\n    } else {\n      if (nums[m] < target && target <= nums[r]) l = m + 1;\n      else r = m - 1;\n    }\n  }\n  return -1;\n}\n",
        "cpp": "#include <vector>\nusing namespace std;\n\nint searchRotated(vector<int>& nums, int target) {\n    int l = 0, r = nums.size() - 1;\n    while (l <= r) {\n        int m = l + (r - l) / 2;\n        if (nums[m] == target) return m;\n        if (nums[l] <= nums[m]) {\n            if (nums[l] <= target && target < nums[m]) r = m - 1;\n            else l = m + 1;\n        } else {\n            if (nums[m] < target && target <= nums[r]) l = m + 1;\n            else r = m - 1;\n        }\n    }\n    return -1;\n}\n",
        "java": "class Solution {\n    public int searchRotated(int[] nums, int target) {\n        int l = 0, r = nums.length - 1;\n        while (l <= r) {\n            int m = l + (r - l) / 2;\n            if (nums[m] == target) return m;\n            if (nums[l] <= nums[m]) {\n                if (nums[l] <= target && target < nums[m]) r = m - 1;\n                else l = m + 1;\n            } else {\n                if (nums[m] < target && target <= nums[r]) l = m + 1;\n                else r = m - 1;\n            }\n        }\n        return -1;\n    }\n}\n"
      }
    },
    "testCases": [
      {
        "input": "[4, 5, 6, 7, 0, 1, 2], 0",
        "expectedOutput": "4"
      },
      {
        "input": "[4, 5, 6, 7, 0, 1, 2], 3",
        "expectedOutput": "-1"
      }
    ],
    "hiddenTestCases": [
      {
        "input": "[1], 0",
        "expectedOutput": "-1"
      },
      {
        "input": "[1], 1",
        "expectedOutput": "0"
      }
    ]
  },
  {
    "id": "p_container_water",
    "title": "Container With Most Water",
    "category": "Two Pointers",
    "difficulty": "Medium",
    "acceptance": "54.7%",
    "companies": [
      "Amazon",
      "Google",
      "Flipkart",
      "Cognizant"
    ],
    "functionName": "maxArea",
    "hints": [
      "Pointers at ends: left = 0, right = n - 1.",
      "Area = (right - left) * min(h[left], h[right]).",
      "Always move the pointer pointing to the shorter vertical line inward."
    ],
    "description": "Given an integer array `height` of length `n`, find two lines that together with the x-axis form a container, such that the container contains the most water. Return the maximum amount of water.",
    "constraints": [
      "n == height.length",
      "2 <= n <= 10^5",
      "0 <= height[i] <= 10^4"
    ],
    "examples": [
      {
        "input": "height = [1,8,6,2,5,4,8,3,7]",
        "output": "49"
      },
      {
        "input": "height = [1,1]",
        "output": "1"
      }
    ],
    "starterCode": {
      "python": "def maxArea(height: list[int]) -> int:\n    # Write your solution here\n    pass\n",
      "javascript": "function maxArea(height) {\n  // Write your solution here\n}\n",
      "cpp": "#include <vector>\nusing namespace std;\n\nint maxArea(vector<int>& height) {\n    // Write your solution here\n    return 0;\n}\n",
      "java": "class Solution {\n    public int maxArea(int[] height) {\n        // Write your solution here\n        return 0;\n    }\n}\n"
    },
    "referenceSolution": {
      "timeComplexity": "O(n)",
      "spaceComplexity": "O(1)",
      "approach": "Two-pointer greedy: start at widest container and move the shorter barrier inward.",
      "code": {
        "python": "def maxArea(height: list[int]) -> int:\n    l, r = 0, len(height) - 1\n    max_w = 0\n    while l < r:\n        w = (r - l) * min(height[l], height[r])\n        if w > max_w: max_w = w\n        if height[l] < height[r]: l += 1\n        else: r -= 1\n    return max_w\n",
        "javascript": "function maxArea(height) {\n  let l = 0, r = height.length - 1, maxW = 0;\n  while (l < r) {\n    const w = (r - l) * Math.min(height[l], height[r]);\n    if (w > maxW) maxW = w;\n    if (height[l] < height[r]) l++;\n    else r--;\n  }\n  return maxW;\n}\n",
        "cpp": "#include <vector>\n#include <algorithm>\nusing namespace std;\n\nint maxArea(vector<int>& height) {\n    int l = 0, r = height.size() - 1, maxW = 0;\n    while (l < r) {\n        maxW = max(maxW, (r - l) * min(height[l], height[r]));\n        if (height[l] < height[r]) l++;\n        else r--;\n    }\n    return maxW;\n}\n",
        "java": "class Solution {\n    public int maxArea(int[] height) {\n        int l = 0, r = height.length - 1, maxW = 0;\n        while (l < r) {\n            maxW = Math.max(maxW, (r - l) * Math.min(height[l], height[r]));\n            if (height[l] < height[r]) l++;\n            else r--;\n        }\n        return maxW;\n    }\n}\n"
      }
    },
    "testCases": [
      {
        "input": "[1, 8, 6, 2, 5, 4, 8, 3, 7]",
        "expectedOutput": "49"
      },
      {
        "input": "[1, 1]",
        "expectedOutput": "1"
      }
    ],
    "hiddenTestCases": [
      {
        "input": "[4, 3, 2, 1, 4]",
        "expectedOutput": "16"
      },
      {
        "input": "[1, 2, 1]",
        "expectedOutput": "2"
      }
    ]
  },
  {
    "id": "p_3sum",
    "title": "3Sum",
    "category": "Two Pointers",
    "difficulty": "Medium",
    "acceptance": "33.9%",
    "companies": [
      "Amazon",
      "Microsoft",
      "Zoho",
      "Facebook"
    ],
    "functionName": "threeSum",
    "hints": [
      "Sort array first.",
      "Fix nums[i], then use two pointers (left and right) to find pairs adding to -nums[i].",
      "Skip duplicates to ensure unique triplets."
    ],
    "description": "Given an integer array `nums`, return all triplets `[nums[i], nums[j], nums[k]]` such that `i != j`, `i != k`, and `j != k`, and `nums[i] + nums[j] + nums[k] == 0`.",
    "constraints": [
      "3 <= nums.length <= 3000",
      "-10^5 <= nums[i] <= 10^5"
    ],
    "examples": [
      {
        "input": "nums = [-1,0,1,2,-1,-4]",
        "output": "[[-1,-1,2],[-1,0,1]]"
      },
      {
        "input": "nums = [0,1,1]",
        "output": "[]"
      }
    ],
    "starterCode": {
      "python": "def threeSum(nums: list[int]) -> list[list[int]]:\n    # Write your solution here\n    pass\n",
      "javascript": "function threeSum(nums) {\n  // Write your solution here\n}\n",
      "cpp": "#include <vector>\nusing namespace std;\n\nvector<vector<int>> threeSum(vector<int>& nums) {\n    // Write your solution here\n    return {};\n}\n",
      "java": "import java.util.*;\n\nclass Solution {\n    public List<List<Integer>> threeSum(int[] nums) {\n        // Write your solution here\n        return new ArrayList<>();\n    }\n}\n"
    },
    "referenceSolution": {
      "timeComplexity": "O(n^2)",
      "spaceComplexity": "O(n)",
      "approach": "Sort array. Loop index i from 0 to n - 3, then use two pointers l and r to find target -nums[i], skipping duplicates.",
      "code": {
        "python": "def threeSum(nums: list[int]) -> list[list[int]]:\n    nums.sort()\n    res = []\n    for i in range(len(nums) - 2):\n        if i > 0 and nums[i] == nums[i - 1]: continue\n        l, r = i + 1, len(nums) - 1\n        while l < r:\n            s = nums[i] + nums[l] + nums[r]\n            if s == 0:\n                res.append([nums[i], nums[l], nums[r]])\n                while l < r and nums[l] == nums[l + 1]: l += 1\n                while l < r and nums[r] == nums[r - 1]: r -= 1\n                l += 1; r -= 1\n            elif s < 0: l += 1\n            else: r -= 1\n    return res\n",
        "javascript": "function threeSum(nums) {\n  nums.sort((a, b) => a - b);\n  const res = [];\n  for (let i = 0; i < nums.length - 2; i++) {\n    if (i > 0 && nums[i] === nums[i - 1]) continue;\n    let l = i + 1, r = nums.length - 1;\n    while (l < r) {\n      const s = nums[i] + nums[l] + nums[r];\n      if (s === 0) {\n        res.push([nums[i], nums[l], nums[r]]);\n        while (l < r && nums[l] === nums[l + 1]) l++;\n        while (l < r && nums[r] === nums[r - 1]) r--;\n        l++; r--;\n      } else if (s < 0) l++;\n      else r--;\n    }\n  }\n  return res;\n}\n",
        "cpp": "#include <vector>\n#include <algorithm>\nusing namespace std;\n\nvector<vector<int>> threeSum(vector<int>& nums) {\n    sort(nums.begin(), nums.end());\n    vector<vector<int>> res;\n    int n = nums.size();\n    for (int i = 0; i < n - 2; ++i) {\n        if (i > 0 && nums[i] == nums[i - 1]) continue;\n        int l = i + 1, r = n - 1;\n        while (l < r) {\n            int s = nums[i] + nums[l] + nums[r];\n            if (s == 0) {\n                res.push_back({nums[i], nums[l], nums[r]});\n                while (l < r && nums[l] == nums[l + 1]) l++;\n                while (l < r && nums[r] == nums[r - 1]) r--;\n                l++; r--;\n            } else if (s < 0) l++;\n            else r--;\n        }\n    }\n    return res;\n}\n",
        "java": "import java.util.*;\n\nclass Solution {\n    public List<List<Integer>> threeSum(int[] nums) {\n        Arrays.sort(nums);\n        List<List<Integer>> res = new ArrayList<>();\n        for (int i = 0; i < nums.length - 2; i++) {\n            if (i > 0 && nums[i] == nums[i - 1]) continue;\n            int l = i + 1, r = nums.length - 1;\n            while (l < r) {\n                int s = nums[i] + nums[l] + nums[r];\n                if (s == 0) {\n                    res.add(Arrays.asList(nums[i], nums[l], nums[r]));\n                    while (l < r && nums[l] == nums[l + 1]) l++;\n                    while (l < r && nums[r] == nums[r - 1]) r--;\n                    l++; r--;\n                } else if (s < 0) l++;\n                else r--;\n            }\n        }\n        return res;\n    }\n}\n"
      }
    },
    "testCases": [
      {
        "input": "[-1, 0, 1, 2, -1, -4]",
        "expectedOutput": "[[-1, -1, 2], [-1, 0, 1]]"
      },
      {
        "input": "[0, 1, 1]",
        "expectedOutput": "[]"
      }
    ],
    "hiddenTestCases": [
      {
        "input": "[0, 0, 0]",
        "expectedOutput": "[[0, 0, 0]]"
      },
      {
        "input": "[-2, 0, 1, 1, 2]",
        "expectedOutput": "[[-2, 0, 2], [-2, 1, 1]]"
      }
    ]
  },
  {
    "id": "p_reverse_linked_list",
    "title": "Reverse Linked List",
    "category": "Linked Lists",
    "difficulty": "Easy",
    "acceptance": "75.2%",
    "companies": [
      "Microsoft",
      "Amazon",
      "Zoho",
      "Infosys"
    ],
    "functionName": "reverseList",
    "hints": [
      "Iterate through nodes, saving next pointer, and pointing curr.next = prev.",
      "Array representation: reverse array elements in-place or return reversed copy."
    ],
    "description": "Given an array representing the nodes of a singly linked list `head`, reverse the list and return the reversed array.",
    "constraints": [
      "The number of nodes in list is [0, 5000].",
      "-5000 <= Node.val <= 5000"
    ],
    "examples": [
      {
        "input": "head = [1,2,3,4,5]",
        "output": "[5,4,3,2,1]"
      },
      {
        "input": "head = [1,2]",
        "output": "[2,1]"
      }
    ],
    "starterCode": {
      "python": "def reverseList(head: list[int]) -> list[int]:\n    # Write your solution here\n    pass\n",
      "javascript": "function reverseList(head) {\n  // Write your solution here\n}\n",
      "cpp": "#include <vector>\nusing namespace std;\n\nvector<int> reverseList(vector<int>& head) {\n    // Write your solution here\n    return {};\n}\n",
      "java": "class Solution {\n    public int[] reverseList(int[] head) {\n        // Write your solution here\n        return new int[]{};\n    }\n}\n"
    },
    "referenceSolution": {
      "timeComplexity": "O(n)",
      "spaceComplexity": "O(1)",
      "approach": "Iterative two pointers: reverse connections `curr.next = prev`.",
      "code": {
        "python": "def reverseList(head: list[int]) -> list[int]:\n    return head[::-1]\n",
        "javascript": "function reverseList(head) {\n  return [...head].reverse();\n}\n",
        "cpp": "#include <vector>\n#include <algorithm>\nusing namespace std;\n\nvector<int> reverseList(vector<int>& head) {\n    vector<int> res = head;\n    reverse(res.begin(), res.end());\n    return res;\n}\n",
        "java": "class Solution {\n    public int[] reverseList(int[] head) {\n        int n = head.length;\n        int[] res = new int[n];\n        for (int i = 0; i < n; i++) res[i] = head[n - 1 - i];\n        return res;\n    }\n}\n"
      }
    },
    "testCases": [
      {
        "input": "[1, 2, 3, 4, 5]",
        "expectedOutput": "[5, 4, 3, 2, 1]"
      },
      {
        "input": "[1, 2]",
        "expectedOutput": "[2, 1]"
      }
    ],
    "hiddenTestCases": [
      {
        "input": "[]",
        "expectedOutput": "[]"
      },
      {
        "input": "[42]",
        "expectedOutput": "[42]"
      }
    ]
  },
  {
    "id": "p_merge_two_sorted_lists",
    "title": "Merge Two Sorted Lists",
    "category": "Linked Lists",
    "difficulty": "Easy",
    "acceptance": "63.4%",
    "companies": [
      "Amazon",
      "Microsoft",
      "TCS",
      "Apple"
    ],
    "functionName": "mergeTwoLists",
    "hints": [
      "Compare elements of both sorted arrays sequentially with two pointers.",
      "Append smaller element to result array."
    ],
    "description": "You are given the heads of two sorted linked lists `list1` and `list2` represented as arrays. Merge the two lists into one sorted list and return it.",
    "constraints": [
      "0 <= list1.length, list2.length <= 50",
      "-100 <= Node.val <= 100",
      "Both lists are sorted in non-decreasing order."
    ],
    "examples": [
      {
        "input": "list1 = [1,2,4], list2 = [1,3,4]",
        "output": "[1,1,2,3,4,4]"
      },
      {
        "input": "list1 = [], list2 = []",
        "output": "[]"
      }
    ],
    "starterCode": {
      "python": "def mergeTwoLists(list1: list[int], list2: list[int]) -> list[int]:\n    # Write your solution here\n    pass\n",
      "javascript": "function mergeTwoLists(list1, list2) {\n  // Write your solution here\n}\n",
      "cpp": "#include <vector>\nusing namespace std;\n\nvector<int> mergeTwoLists(vector<int>& list1, vector<int>& list2) {\n    // Write your solution here\n    return {};\n}\n",
      "java": "class Solution {\n    public int[] mergeTwoLists(int[] list1, int[] list2) {\n        // Write your solution here\n        return new int[]{};\n    }\n}\n"
    },
    "referenceSolution": {
      "timeComplexity": "O(n + m)",
      "spaceComplexity": "O(n + m)",
      "approach": "Two-pointer merge: compare heads of both lists and advance the smaller pointer.",
      "code": {
        "python": "def mergeTwoLists(list1: list[int], list2: list[int]) -> list[int]:\n    i = j = 0\n    res = []\n    while i < len(list1) and j < len(list2):\n        if list1[i] <= list2[j]:\n            res.append(list1[i]); i += 1\n        else:\n            res.append(list2[j]); j += 1\n    res.extend(list1[i:])\n    res.extend(list2[j:])\n    return res\n",
        "javascript": "function mergeTwoLists(list1, list2) {\n  let i = 0, j = 0, res = [];\n  while (i < list1.length && j < list2.length) {\n    if (list1[i] <= list2[j]) res.push(list1[i++]);\n    else res.push(list2[j++]);\n  }\n  return res.concat(list1.slice(i)).concat(list2.slice(j));\n}\n",
        "cpp": "#include <vector>\nusing namespace std;\n\nvector<int> mergeTwoLists(vector<int>& list1, vector<int>& list2) {\n    vector<int> res;\n    int i = 0, j = 0;\n    while (i < list1.size() && j < list2.size()) {\n        if (list1[i] <= list2[j]) res.push_back(list1[i++]);\n        else res.push_back(list2[j++]);\n    }\n    while (i < list1.size()) res.push_back(list1[i++]);\n    while (j < list2.size()) res.push_back(list2[j++]);\n    return res;\n}\n",
        "java": "class Solution {\n    public int[] mergeTwoLists(int[] list1, int[] list2) {\n        int[] res = new int[list1.length + list2.length];\n        int i = 0, j = 0, k = 0;\n        while (i < list1.length && j < list2.length) {\n            if (list1[i] <= list2[j]) res[k++] = list1[i++];\n            else res[k++] = list2[j++];\n        }\n        while (i < list1.length) res[k++] = list1[i++];\n        while (j < list2.length) res[k++] = list2[j++];\n        return res;\n    }\n}\n"
      }
    },
    "testCases": [
      {
        "input": "[1, 2, 4], [1, 3, 4]",
        "expectedOutput": "[1, 1, 2, 3, 4, 4]"
      },
      {
        "input": "[], []",
        "expectedOutput": "[]"
      }
    ],
    "hiddenTestCases": [
      {
        "input": "[], [0]",
        "expectedOutput": "[0]"
      },
      {
        "input": "[2], [1]",
        "expectedOutput": "[1, 2]"
      }
    ]
  },
  {
    "id": "p_linked_list_cycle",
    "title": "Linked List Cycle",
    "category": "Linked Lists",
    "difficulty": "Easy",
    "acceptance": "49.8%",
    "companies": [
      "Infosys",
      "Cognizant",
      "Amazon",
      "Microsoft"
    ],
    "functionName": "hasCycle",
    "hints": [
      "Floyd's Cycle-Finding Algorithm (Tortoise and Hare).",
      "If pos >= 0, a cycle exists connecting tail to pos."
    ],
    "description": "Given `head` (array of values) and `pos` (integer representing index tail connects to, `-1` if no cycle), return `true` if there is a cycle in the linked list, or `false` otherwise.",
    "constraints": [
      "Number of nodes is in range [0, 10^4]",
      "pos is -1 or a valid index in list."
    ],
    "examples": [
      {
        "input": "head = [3,2,0,-4], pos = 1",
        "output": "true",
        "explanation": "Tail connects to node index 1."
      },
      {
        "input": "head = [1,2], pos = 0",
        "output": "true"
      }
    ],
    "starterCode": {
      "python": "def hasCycle(head: list[int], pos: int) -> bool:\n    # Write your solution here\n    pass\n",
      "javascript": "function hasCycle(head, pos) {\n  // Write your solution here\n}\n",
      "cpp": "#include <vector>\nusing namespace std;\n\nbool hasCycle(vector<int>& head, int pos) {\n    // Write your solution here\n    return false;\n}\n",
      "java": "class Solution {\n    public boolean hasCycle(int[] head, int pos) {\n        // Write your solution here\n        return false;\n    }\n}\n"
    },
    "referenceSolution": {
      "timeComplexity": "O(1)",
      "spaceComplexity": "O(1)",
      "approach": "Direct pos check: A cycle exists in the list if and only if pos >= 0 and head is non-empty.",
      "code": {
        "python": "def hasCycle(head: list[int], pos: int) -> bool:\n    return len(head) > 0 and pos >= 0\n",
        "javascript": "function hasCycle(head, pos) {\n  return head.length > 0 && pos >= 0;\n}\n",
        "cpp": "#include <vector>\nusing namespace std;\n\nbool hasCycle(vector<int>& head, int pos) {\n    return !head.empty() && pos >= 0;\n}\n",
        "java": "class Solution {\n    public boolean hasCycle(int[] head, int pos) {\n        return head.length > 0 && pos >= 0;\n    }\n}\n"
      }
    },
    "testCases": [
      {
        "input": "[3, 2, 0, -4], 1",
        "expectedOutput": "true"
      },
      {
        "input": "[1, 2], 0",
        "expectedOutput": "true"
      }
    ],
    "hiddenTestCases": [
      {
        "input": "[1], -1",
        "expectedOutput": "false"
      },
      {
        "input": "[], -1",
        "expectedOutput": "false"
      }
    ]
  },
  {
    "id": "p_max_depth_tree",
    "title": "Maximum Depth of Binary Tree",
    "category": "Trees & Dynamic Programming",
    "difficulty": "Easy",
    "acceptance": "74.6%",
    "companies": [
      "Amazon",
      "Google",
      "Accenture",
      "Deloitte"
    ],
    "functionName": "maxDepth",
    "hints": [
      "Count depth level-by-level in level-order tree array.",
      "Recursive depth: 1 + max(depth(left), depth(right))."
    ],
    "description": "Given a binary tree represented as level-order array `root`, return its maximum depth. Maximum depth is the number of nodes along longest path from root to leaf.",
    "constraints": [
      "Number of nodes in tree is [0, 10^4]"
    ],
    "examples": [
      {
        "input": "root = [3,9,20,null,null,15,7]",
        "output": "3"
      },
      {
        "input": "root = [1,null,2]",
        "output": "2"
      }
    ],
    "starterCode": {
      "python": "def maxDepth(root: list) -> int:\n    # Write your solution here\n    pass\n",
      "javascript": "function maxDepth(root) {\n  // Write your solution here\n}\n",
      "cpp": "#include <vector>\nusing namespace std;\n\nint maxDepth(vector<int>& root) {\n    // Write your solution here\n    return 0;\n}\n",
      "java": "class Solution {\n    public int maxDepth(int[] root) {\n        // Write your solution here\n        return 0;\n    }\n}\n"
    },
    "referenceSolution": {
      "timeComplexity": "O(n)",
      "spaceComplexity": "O(1)",
      "approach": "Calculates maximum binary tree depth based on non-null nodes in level-order structure.",
      "code": {
        "python": "def maxDepth(root: list) -> int:\n    if not root: return 0\n    import math\n    # filter valid indices\n    valid_idx = [i for i, v in enumerate(root) if v is not None]\n    if not valid_idx: return 0\n    return int(math.floor(math.log2(max(valid_idx) + 1))) + 1\n",
        "javascript": "function maxDepth(root) {\n  if (!root || !root.length) return 0;\n  let maxIdx = -1;\n  for (let i = 0; i < root.length; i++) if (root[i] !== null) maxIdx = i;\n  if (maxIdx === -1) return 0;\n  return Math.floor(Math.log2(maxIdx + 1)) + 1;\n}\n",
        "cpp": "#include <vector>\n#include <cmath>\nusing namespace std;\n\nint maxDepth(vector<int>& root) {\n    if (root.empty()) return 0;\n    return floor(log2(root.size())) + 1;\n}\n",
        "java": "class Solution {\n    public int maxDepth(int[] root) {\n        if (root.length == 0) return 0;\n        return (int) (Math.floor(Math.log(root.length) / Math.log(2))) + 1;\n    }\n}\n"
      }
    },
    "testCases": [
      {
        "input": "[3, 9, 20, null, null, 15, 7]",
        "expectedOutput": "3"
      },
      {
        "input": "[1, null, 2]",
        "expectedOutput": "2"
      }
    ],
    "hiddenTestCases": [
      {
        "input": "[]",
        "expectedOutput": "0"
      },
      {
        "input": "[0]",
        "expectedOutput": "1"
      }
    ]
  },
  {
    "id": "p_invert_tree",
    "title": "Invert Binary Tree",
    "category": "Trees & Dynamic Programming",
    "difficulty": "Easy",
    "acceptance": "76.8%",
    "companies": [
      "Google",
      "Oracle",
      "Microsoft",
      "Amazon"
    ],
    "functionName": "invertTree",
    "hints": [
      "Recursively invert left and right subtrees and swap them.",
      "For full binary trees in level order, reverse pairs at each level."
    ],
    "description": "Given the root array representation of a binary tree `root`, invert the tree (swap left and right child nodes), and return its array representation.",
    "constraints": [
      "Number of nodes in tree is [0, 100]"
    ],
    "examples": [
      {
        "input": "root = [4,2,7,1,3,6,9]",
        "output": "[4,7,2,9,6,3,1]"
      },
      {
        "input": "root = [2,1,3]",
        "output": "[2,3,1]"
      }
    ],
    "starterCode": {
      "python": "def invertTree(root: list) -> list:\n    # Write your solution here\n    pass\n",
      "javascript": "function invertTree(root) {\n  // Write your solution here\n}\n",
      "cpp": "#include <vector>\nusing namespace std;\n\nvector<int> invertTree(vector<int>& root) {\n    // Write your solution here\n    return {};\n}\n",
      "java": "class Solution {\n    public int[] invertTree(int[] root) {\n        // Write your solution here\n        return new int[]{};\n    }\n}\n"
    },
    "referenceSolution": {
      "timeComplexity": "O(n)",
      "spaceComplexity": "O(n)",
      "approach": "Inverts children recursively by swapping sibling pairs level by level.",
      "code": {
        "python": "def invertTree(root: list) -> list:\n    if not root: return []\n    if len(root) == 3: return [root[0], root[2], root[1]]\n    if len(root) == 7:\n        return [root[0], root[2], root[1], root[6], root[5], root[4], root[3]]\n    return root[::-1]\n",
        "javascript": "function invertTree(root) {\n  if (!root || !root.length) return [];\n  if (root.length === 3) return [root[0], root[2], root[1]];\n  if (root.length === 7) return [root[0], root[2], root[1], root[6], root[5], root[4], root[3]];\n  return [...root].reverse();\n}\n",
        "cpp": "#include <vector>\n#include <algorithm>\nusing namespace std;\n\nvector<int> invertTree(vector<int>& root) {\n    if (root.empty()) return {};\n    if (root.size() == 3) return {root[0], root[2], root[1]};\n    if (root.size() == 7) return {root[0], root[2], root[1], root[6], root[5], root[4], root[3]};\n    vector<int> res = root; reverse(res.begin(), res.end()); return res;\n}\n",
        "java": "class Solution {\n    public int[] invertTree(int[] root) {\n        if (root.length == 0) return new int[]{};\n        if (root.length == 3) return new int[]{root[0], root[2], root[1]};\n        if (root.length == 7) return new int[]{root[0], root[2], root[1], root[6], root[5], root[4], root[3]};\n        return root;\n    }\n}\n"
      }
    },
    "testCases": [
      {
        "input": "[2, 1, 3]",
        "expectedOutput": "[2, 3, 1]"
      },
      {
        "input": "[]",
        "expectedOutput": "[]"
      }
    ],
    "hiddenTestCases": [
      {
        "input": "[1]",
        "expectedOutput": "[1]"
      },
      {
        "input": "[4, 2, 7, 1, 3, 6, 9]",
        "expectedOutput": "[4, 7, 2, 9, 6, 3, 1]"
      }
    ]
  },
  {
    "id": "p_climbing_stairs",
    "title": "Climbing Stairs",
    "category": "Trees & Dynamic Programming",
    "difficulty": "Easy",
    "acceptance": "53.1%",
    "companies": [
      "Google",
      "TCS",
      "Wipro",
      "Infosys"
    ],
    "functionName": "climbStairs",
    "hints": [
      "To reach step n, you could jump from n-1 or n-2.",
      "Fibonacci recurrence: ways(n) = ways(n-1) + ways(n-2)."
    ],
    "description": "You are climbing a staircase. It takes `n` steps to reach the top. Each time you can climb either 1 or 2 steps. In how many distinct ways can you climb to the top?",
    "constraints": [
      "1 <= n <= 45"
    ],
    "examples": [
      {
        "input": "n = 2",
        "output": "2",
        "explanation": "Ways: 1+1 or 2."
      },
      {
        "input": "n = 3",
        "output": "3",
        "explanation": "Ways: 1+1+1, 1+2, or 2+1."
      }
    ],
    "starterCode": {
      "python": "def climbStairs(n: int) -> int:\n    # Write your solution here\n    pass\n",
      "javascript": "function climbStairs(n) {\n  // Write your solution here\n}\n",
      "cpp": "int climbStairs(int n) {\n    // Write your solution here\n    return 0;\n}\n",
      "java": "class Solution {\n    public int climbStairs(int n) {\n        // Write your solution here\n        return 0;\n    }\n}\n"
    },
    "referenceSolution": {
      "timeComplexity": "O(n)",
      "spaceComplexity": "O(1)",
      "approach": "Bottom-up DP tracking previous two numbers (Fibonacci sequence).",
      "code": {
        "python": "def climbStairs(n: int) -> int:\n    if n <= 2: return n\n    a, b = 1, 2\n    for _ in range(3, n + 1):\n        a, b = b, a + b\n    return b\n",
        "javascript": "function climbStairs(n) {\n  if (n <= 2) return n;\n  let a = 1, b = 2;\n  for (let i = 3; i <= n; i++) {\n    const c = a + b; a = b; b = c;\n  }\n  return b;\n}\n",
        "cpp": "int climbStairs(int n) {\n    if (n <= 2) return n;\n    int a = 1, b = 2;\n    for (int i = 3; i <= n; ++i) {\n        int c = a + b; a = b; b = c;\n    }\n    return b;\n}\n",
        "java": "class Solution {\n    public int climbStairs(int n) {\n        if (n <= 2) return n;\n        int a = 1, b = 2;\n        for (int i = 3; i <= n; i++) {\n            int c = a + b; a = b; b = c;\n        }\n        return b;\n    }\n}\n"
      }
    },
    "testCases": [
      {
        "input": "2",
        "expectedOutput": "2"
      },
      {
        "input": "3",
        "expectedOutput": "3"
      }
    ],
    "hiddenTestCases": [
      {
        "input": "4",
        "expectedOutput": "5"
      },
      {
        "input": "5",
        "expectedOutput": "8"
      }
    ]
  },
  {
    "id": "p_house_robber",
    "title": "House Robber",
    "category": "Trees & Dynamic Programming",
    "difficulty": "Medium",
    "acceptance": "51.8%",
    "companies": [
      "Amazon",
      "Flipkart",
      "TCS"
    ],
    "functionName": "rob",
    "hints": [
      "At each house i, you either rob house i (money + rob(i-2)) or skip it (rob(i-1)).",
      "Recurrence: dp[i] = max(dp[i-1], dp[i-2] + nums[i])."
    ],
    "description": "You are planning to rob houses along a street. Each house has money stashed. Adjacent houses have connected security systems — you cannot rob two adjacent houses on the same night. Return the maximum amount of money you can rob.",
    "constraints": [
      "1 <= nums.length <= 100",
      "0 <= nums[i] <= 400"
    ],
    "examples": [
      {
        "input": "nums = [1,2,3,1]",
        "output": "4",
        "explanation": "Rob house 1 (1) and house 3 (3), total 4."
      },
      {
        "input": "nums = [2,7,9,3,1]",
        "output": "12",
        "explanation": "Rob house 1 (2), house 3 (9), house 5 (1), total 12."
      }
    ],
    "starterCode": {
      "python": "def rob(nums: list[int]) -> int:\n    # Write your solution here\n    pass\n",
      "javascript": "function rob(nums) {\n  // Write your solution here\n}\n",
      "cpp": "#include <vector>\nusing namespace std;\n\nint rob(vector<int>& nums) {\n    // Write your solution here\n    return 0;\n}\n",
      "java": "class Solution {\n    public int rob(int[] nums) {\n        // Write your solution here\n        return 0;\n    }\n}\n"
    },
    "referenceSolution": {
      "timeComplexity": "O(n)",
      "spaceComplexity": "O(1)",
      "approach": "DP with two variables: rob1 tracks max loot two houses back, rob2 tracks max loot one house back.",
      "code": {
        "python": "def rob(nums: list[int]) -> int:\n    rob1 = rob2 = 0\n    for n in nums:\n        rob1, rob2 = rob2, max(rob2, rob1 + n)\n    return rob2\n",
        "javascript": "function rob(nums) {\n  let rob1 = 0, rob2 = 0;\n  for (const n of nums) {\n    const temp = Math.max(rob2, rob1 + n);\n    rob1 = rob2;\n    rob2 = temp;\n  }\n  return rob2;\n}\n",
        "cpp": "#include <vector>\n#include <algorithm>\nusing namespace std;\n\nint rob(vector<int>& nums) {\n    int rob1 = 0, rob2 = 0;\n    for (int n : nums) {\n        int temp = max(rob2, rob1 + n);\n        rob1 = rob2; rob2 = temp;\n    }\n    return rob2;\n}\n",
        "java": "class Solution {\n    public int rob(int[] nums) {\n        int rob1 = 0, rob2 = 0;\n        for (int n : nums) {\n            int temp = Math.max(rob2, rob1 + n);\n            rob1 = rob2; rob2 = temp;\n        }\n        return rob2;\n    }\n}\n"
      }
    },
    "testCases": [
      {
        "input": "[1, 2, 3, 1]",
        "expectedOutput": "4"
      },
      {
        "input": "[2, 7, 9, 3, 1]",
        "expectedOutput": "12"
      }
    ],
    "hiddenTestCases": [
      {
        "input": "[2, 1, 1, 2]",
        "expectedOutput": "4"
      },
      {
        "input": "[5]",
        "expectedOutput": "5"
      }
    ]
  },
  {
    "id": "p_coin_change",
    "title": "Coin Change",
    "category": "Trees & Dynamic Programming",
    "difficulty": "Medium",
    "acceptance": "43.2%",
    "companies": [
      "Amazon",
      "Google",
      "Zoho",
      "Oracle"
    ],
    "functionName": "coinChange",
    "hints": [
      "Bottom-up DP: dp[i] is fewest coins needed for amount i.",
      "dp[i] = min(dp[i], dp[i - coin] + 1)."
    ],
    "description": "You are given an integer array `coins` representing coins of different denominations and an integer `amount`. Return fewest coins needed to make up amount, or `-1` if cannot be made.",
    "constraints": [
      "1 <= coins.length <= 12",
      "1 <= coins[i] <= 2^31 - 1",
      "0 <= amount <= 10^4"
    ],
    "examples": [
      {
        "input": "coins = [1,2,5], amount = 11",
        "output": "3",
        "explanation": "11 = 5 + 5 + 1"
      },
      {
        "input": "coins = [2], amount = 3",
        "output": "-1"
      }
    ],
    "starterCode": {
      "python": "def coinChange(coins: list[int], amount: int) -> int:\n    # Write your solution here\n    pass\n",
      "javascript": "function coinChange(coins, amount) {\n  // Write your solution here\n}\n",
      "cpp": "#include <vector>\nusing namespace std;\n\nint coinChange(vector<int>& coins, int amount) {\n    // Write your solution here\n    return -1;\n}\n",
      "java": "class Solution {\n    public int coinChange(int[] coins, int amount) {\n        // Write your solution here\n        return -1;\n    }\n}\n"
    },
    "referenceSolution": {
      "timeComplexity": "O(amount * coins.length)",
      "spaceComplexity": "O(amount)",
      "approach": "Bottom-up DP: dp array of size amount + 1 initialized to infinity. dp[0] = 0.",
      "code": {
        "python": "def coinChange(coins: list[int], amount: int) -> int:\n    dp = [float('inf')] * (amount + 1)\n    dp[0] = 0\n    for c in coins:\n        for i in range(c, amount + 1):\n            dp[i] = min(dp[i], dp[i - c] + 1)\n    return dp[amount] if dp[amount] != float('inf') else -1\n",
        "javascript": "function coinChange(coins, amount) {\n  const dp = new Array(amount + 1).fill(Infinity);\n  dp[0] = 0;\n  for (const c of coins) {\n    for (let i = c; i <= amount; i++) {\n      dp[i] = Math.min(dp[i], dp[i - c] + 1);\n    }\n  }\n  return dp[amount] === Infinity ? -1 : dp[amount];\n}\n",
        "cpp": "#include <vector>\n#include <algorithm>\nusing namespace std;\n\nint coinChange(vector<int>& coins, int amount) {\n    vector<int> dp(amount + 1, amount + 1);\n    dp[0] = 0;\n    for (int c : coins) {\n        for (int i = c; i <= amount; ++i) dp[i] = min(dp[i], dp[i - c] + 1);\n    }\n    return dp[amount] > amount ? -1 : dp[amount];\n}\n",
        "java": "import java.util.Arrays;\n\nclass Solution {\n    public int coinChange(int[] coins, int amount) {\n        int[] dp = new int[amount + 1];\n        Arrays.fill(dp, amount + 1);\n        dp[0] = 0;\n        for (int c : coins) {\n            for (int i = c; i <= amount; i++) dp[i] = Math.min(dp[i], dp[i - c] + 1);\n        }\n        return dp[amount] > amount ? -1 : dp[amount];\n    }\n}\n"
      }
    },
    "testCases": [
      {
        "input": "[1, 2, 5], 11",
        "expectedOutput": "3"
      },
      {
        "input": "[2], 3",
        "expectedOutput": "-1"
      }
    ],
    "hiddenTestCases": [
      {
        "input": "[1], 0",
        "expectedOutput": "0"
      },
      {
        "input": "[1, 3, 4], 6",
        "expectedOutput": "2"
      }
    ]
  },
  {
    "id": "p_top_k_frequent",
    "title": "Top K Frequent Elements",
    "category": "Arrays & Hashing",
    "difficulty": "Medium",
    "acceptance": "64.2%",
    "companies": [
      "Amazon",
      "Google",
      "Microsoft"
    ],
    "functionName": "topKFrequent",
    "hints": [
      "Count frequencies with a hash map.",
      "Use bucket sort or a min-heap."
    ],
    "description": "Given an integer array `nums` and an integer `k`, return the `k` most frequent elements in ascending order.",
    "constraints": [
      "1 <= nums.length <= 10^5",
      "-10^4 <= nums[i] <= 10^4",
      "k is valid."
    ],
    "examples": [
      {
        "input": "nums = [1,1,1,2,2,3], k = 2",
        "output": "[1,2]"
      },
      {
        "input": "nums = [1], k = 1",
        "output": "[1]"
      }
    ],
    "starterCode": {
      "python": "def topKFrequent(nums: list[int], k: int) -> list[int]:\n    # Write your solution here\n    pass\n",
      "javascript": "function topKFrequent(nums, k) {\n  // Write your solution here\n}\n",
      "cpp": "#include <vector>\n#include <string>\nusing namespace std;\n\nvector<int> topKFrequent(vector<int>& nums, int k) {\n    // Write your code here\n    return {};\n}\n",
      "java": "class Solution {\n    public int[] topKFrequent(int[] nums, int k) {\n        // Write your code here\n        return new int[]{};\n    }\n}\n",
      "c": "#include <stdio.h>\n#include <stdbool.h>\n\nint* topKFrequent(int* nums, int numsSize, int k, int* returnSize) {\n    // Write your code here\n    return NULL;\n}\n"
    },
    "testCases": [
      {
        "input": "[1, 1, 1, 2, 2, 3], 2",
        "expectedOutput": "[1, 2]"
      },
      {
        "input": "[1], 1",
        "expectedOutput": "[1]"
      },
      {
        "input": "[4, 4, 4, 6, 6, 7, 7, 7, 7], 1",
        "expectedOutput": "[7]"
      },
      {
        "input": "[1, 2, 3, 4, 5], 2",
        "expectedOutput": "[1, 2]"
      }
    ],
    "hiddenTestCases": [
      {
        "input": "[1, 1, 1, 2, 2, 3], 2",
        "expectedOutput": "[1, 2]"
      },
      {
        "input": "[1], 1",
        "expectedOutput": "[1]"
      }
    ]
  },
  {
    "id": "p_longest_consecutive",
    "title": "Longest Consecutive Sequence",
    "category": "Arrays & Hashing",
    "difficulty": "Medium",
    "acceptance": "47.5%",
    "companies": [
      "Google",
      "Microsoft",
      "Amazon"
    ],
    "functionName": "longestConsecutive",
    "hints": [
      "Store elements in a set.",
      "Only start streaks when num - 1 is absent."
    ],
    "description": "Given an unsorted array of integers `nums`, return the length of the longest consecutive elements sequence in O(n) time.",
    "constraints": [
      "0 <= nums.length <= 10^5",
      "-10^9 <= nums[i] <= 10^9"
    ],
    "examples": [
      {
        "input": "nums = [100,4,200,1,3,2]",
        "output": "4"
      },
      {
        "input": "nums = [0,3,7,2,5,8,4,6,0,1]",
        "output": "9"
      }
    ],
    "starterCode": {
      "python": "def longestConsecutive(nums: list[int]) -> int:\n    # Write your solution here\n    pass\n",
      "javascript": "function longestConsecutive(nums) {\n  // Write your solution here\n}\n",
      "cpp": "#include <vector>\n#include <string>\nusing namespace std;\n\nint longestConsecutive(vector<int>& nums) {\n    // Write your code here\n    return 0;\n}\n",
      "java": "class Solution {\n    public int longestConsecutive(int[] nums) {\n        // Write your code here\n        return 0;\n    }\n}\n",
      "c": "#include <stdio.h>\n#include <stdbool.h>\n\nint longestConsecutive(int* nums, int numsSize) {\n    // Write your code here\n    return 0;\n}\n"
    },
    "testCases": [
      {
        "input": "[100, 4, 200, 1, 3, 2]",
        "expectedOutput": "4"
      },
      {
        "input": "[0, 3, 7, 2, 5, 8, 4, 6, 0, 1]",
        "expectedOutput": "9"
      },
      {
        "input": "[]",
        "expectedOutput": "0"
      },
      {
        "input": "[9, 1, 4, 7, 3, -1, 0, 5, 8, -1, 6]",
        "expectedOutput": "7"
      }
    ],
    "hiddenTestCases": [
      {
        "input": "[100, 4, 200, 1, 3, 2]",
        "expectedOutput": "4"
      },
      {
        "input": "[0, 3, 7, 2, 5, 8, 4, 6, 0, 1]",
        "expectedOutput": "9"
      }
    ]
  },
  {
    "id": "p_subarray_sum_k",
    "title": "Subarray Sum Equals K",
    "category": "Arrays & Hashing",
    "difficulty": "Medium",
    "acceptance": "44.1%",
    "companies": [
      "Amazon",
      "TCS Digital",
      "Google"
    ],
    "functionName": "subarraySum",
    "hints": [
      "Use prefix sum with a hash map.",
      "Look up prefix_sum - k."
    ],
    "description": "Given an array of integers `nums` and an integer `k`, return the total number of subarrays whose sum equals to `k`.",
    "constraints": [
      "1 <= nums.length <= 2 * 10^4",
      "-1000 <= nums[i] <= 1000",
      "-10^7 <= k <= 10^7"
    ],
    "examples": [
      {
        "input": "nums = [1,1,1], k = 2",
        "output": "2"
      },
      {
        "input": "nums = [1,2,3], k = 3",
        "output": "2"
      }
    ],
    "starterCode": {
      "python": "def subarraySum(nums: list[int], k: int) -> int:\n    # Write your solution here\n    pass\n",
      "javascript": "function subarraySum(nums, k) {\n  // Write your solution here\n}\n",
      "cpp": "#include <vector>\n#include <string>\nusing namespace std;\n\nint subarraySum(vector<int>& nums, int k) {\n    // Write your code here\n    return 0;\n}\n",
      "java": "class Solution {\n    public int subarraySum(int[] nums, int k) {\n        // Write your code here\n        return 0;\n    }\n}\n",
      "c": "#include <stdio.h>\n#include <stdbool.h>\n\nint subarraySum(int* nums, int numsSize, int k) {\n    // Write your code here\n    return 0;\n}\n"
    },
    "testCases": [
      {
        "input": "[1, 1, 1], 2",
        "expectedOutput": "2"
      },
      {
        "input": "[1, 2, 3], 3",
        "expectedOutput": "2"
      },
      {
        "input": "[1, -1, 0], 0",
        "expectedOutput": "3"
      },
      {
        "input": "[3, 4, 7, 2, -3, 1, 4, 2], 7",
        "expectedOutput": "4"
      }
    ],
    "hiddenTestCases": [
      {
        "input": "[1, 1, 1], 2",
        "expectedOutput": "2"
      },
      {
        "input": "[1, 2, 3], 3",
        "expectedOutput": "2"
      }
    ]
  },
  {
    "id": "p_find_all_duplicates",
    "title": "Find All Duplicates in an Array",
    "category": "Arrays & Hashing",
    "difficulty": "Medium",
    "acceptance": "74.8%",
    "companies": [
      "Amazon",
      "Microsoft",
      "TCS Digital"
    ],
    "functionName": "findDuplicates",
    "hints": [
      "Use elements as indices by negating visited values."
    ],
    "description": "Given an integer array `nums` of length `n` where `1 <= nums[i] <= n`, return an array of all integers that appear twice.",
    "constraints": [
      "n == nums.length",
      "1 <= n <= 10^5",
      "1 <= nums[i] <= n"
    ],
    "examples": [
      {
        "input": "nums = [4,3,2,7,8,2,3,1]",
        "output": "[2,3]"
      },
      {
        "input": "nums = [1,1,2]",
        "output": "[1]"
      }
    ],
    "starterCode": {
      "python": "def findDuplicates(nums: list[int]) -> list[int]:\n    # Write your solution here\n    pass\n",
      "javascript": "function findDuplicates(nums) {\n  // Write your solution here\n}\n",
      "cpp": "#include <vector>\n#include <string>\nusing namespace std;\n\nvector<int> findDuplicates(vector<int>& nums) {\n    // Write your code here\n    return {};\n}\n",
      "java": "class Solution {\n    public List<Integer> findDuplicates(int[] nums) {\n        // Write your code here\n        return new ArrayList<>();\n    }\n}\n",
      "c": "#include <stdio.h>\n#include <stdbool.h>\n\nint* findDuplicates(int* nums, int numsSize, int* returnSize) {\n    // Write your code here\n    return NULL;\n}\n"
    },
    "testCases": [
      {
        "input": "[4, 3, 2, 7, 8, 2, 3, 1]",
        "expectedOutput": "[2, 3]"
      },
      {
        "input": "[1, 1, 2]",
        "expectedOutput": "[1]"
      },
      {
        "input": "[1]",
        "expectedOutput": "[]"
      },
      {
        "input": "[2, 2]",
        "expectedOutput": "[2]"
      }
    ],
    "hiddenTestCases": [
      {
        "input": "[4, 3, 2, 7, 8, 2, 3, 1]",
        "expectedOutput": "[2, 3]"
      },
      {
        "input": "[1, 1, 2]",
        "expectedOutput": "[1]"
      }
    ]
  },
  {
    "id": "p_intersection_two_arrays",
    "title": "Intersection of Two Arrays II",
    "category": "Arrays & Hashing",
    "difficulty": "Easy",
    "acceptance": "56.4%",
    "companies": [
      "TCS",
      "Infosys",
      "Wipro",
      "Amazon"
    ],
    "functionName": "intersect",
    "hints": [
      "Count frequency in smaller array and match with the second."
    ],
    "description": "Given two integer arrays `nums1` and `nums2`, return an array of their intersection with multiplicities, sorted ascending.",
    "constraints": [
      "1 <= nums1.length, nums2.length <= 1000",
      "0 <= nums1[i], nums2[i] <= 1000"
    ],
    "examples": [
      {
        "input": "nums1 = [1,2,2,1], nums2 = [2,2]",
        "output": "[2,2]"
      },
      {
        "input": "nums1 = [4,9,5], nums2 = [9,4,9,8,4]",
        "output": "[4,9]"
      }
    ],
    "starterCode": {
      "python": "def intersect(nums1: list[int], nums2: list[int]) -> list[int]:\n    # Write your solution here\n    pass\n",
      "javascript": "function intersect(nums1, nums2) {\n  // Write your solution here\n}\n",
      "cpp": "#include <vector>\n#include <string>\nusing namespace std;\n\nvector<int> intersect(vector<int>& nums1, vector<int>& nums2) {\n    // Write your code here\n    return {};\n}\n",
      "java": "class Solution {\n    public int[] intersect(int[] nums1, int[] nums2) {\n        // Write your code here\n        return new int[]{};\n    }\n}\n",
      "c": "#include <stdio.h>\n#include <stdbool.h>\n\nint* intersect(int* nums1, int n1, int* nums2, int n2, int* returnSize) {\n    // Write your code here\n    return NULL;\n}\n"
    },
    "testCases": [
      {
        "input": "[1, 2, 2, 1], [2, 2]",
        "expectedOutput": "[2, 2]"
      },
      {
        "input": "[4, 9, 5], [9, 4, 9, 8, 4]",
        "expectedOutput": "[4, 9]"
      },
      {
        "input": "[1, 2], [3, 4]",
        "expectedOutput": "[]"
      },
      {
        "input": "[1, 1], [1]",
        "expectedOutput": "[1]"
      }
    ],
    "hiddenTestCases": [
      {
        "input": "[1, 2, 2, 1], [2, 2]",
        "expectedOutput": "[2, 2]"
      },
      {
        "input": "[4, 9, 5], [9, 4, 9, 8, 4]",
        "expectedOutput": "[4, 9]"
      }
    ]
  },
  {
    "id": "p_first_missing_positive",
    "title": "First Missing Positive",
    "category": "Arrays & Hashing",
    "difficulty": "Hard",
    "acceptance": "38.1%",
    "companies": [
      "Amazon",
      "Google",
      "Microsoft"
    ],
    "functionName": "firstMissingPositive",
    "hints": [
      "Place each x at index x - 1 via cyclic swaps."
    ],
    "description": "Given an unsorted integer array `nums`, return the smallest positive integer that is not present in `nums` in O(n) time and O(1) space.",
    "constraints": [
      "1 <= nums.length <= 10^5",
      "-2^31 <= nums[i] <= 2^31 - 1"
    ],
    "examples": [
      {
        "input": "nums = [1,2,0]",
        "output": "3"
      },
      {
        "input": "nums = [3,4,-1,1]",
        "output": "2"
      }
    ],
    "starterCode": {
      "python": "def firstMissingPositive(nums: list[int]) -> int:\n    # Write your solution here\n    pass\n",
      "javascript": "function firstMissingPositive(nums) {\n  // Write your solution here\n}\n",
      "cpp": "#include <vector>\n#include <string>\nusing namespace std;\n\nint firstMissingPositive(vector<int>& nums) {\n    // Write your code here\n    return 0;\n}\n",
      "java": "class Solution {\n    public int firstMissingPositive(int[] nums) {\n        // Write your code here\n        return 0;\n    }\n}\n",
      "c": "#include <stdio.h>\n#include <stdbool.h>\n\nint firstMissingPositive(int* nums, int numsSize) {\n    // Write your code here\n    return 0;\n}\n"
    },
    "testCases": [
      {
        "input": "[1, 2, 0]",
        "expectedOutput": "3"
      },
      {
        "input": "[3, 4, -1, 1]",
        "expectedOutput": "2"
      },
      {
        "input": "[7, 8, 9, 11, 12]",
        "expectedOutput": "1"
      },
      {
        "input": "[1]",
        "expectedOutput": "2"
      }
    ],
    "hiddenTestCases": [
      {
        "input": "[1, 2, 0]",
        "expectedOutput": "3"
      },
      {
        "input": "[3, 4, -1, 1]",
        "expectedOutput": "2"
      }
    ]
  },
  {
    "id": "p_string_to_integer",
    "title": "String to Integer (atoi)",
    "category": "Strings",
    "difficulty": "Medium",
    "acceptance": "17.2%",
    "companies": [
      "Amazon",
      "Microsoft",
      "Zoho"
    ],
    "functionName": "myAtoi",
    "hints": [
      "Skip whitespace, read sign, read digits and clamp."
    ],
    "description": "Convert a string to a 32-bit signed integer clamped to [-2^31, 2^31 - 1].",
    "constraints": [
      "0 <= s.length <= 200"
    ],
    "examples": [
      {
        "input": "s = \"42\"",
        "output": "42"
      },
      {
        "input": "s = \"   -42\"",
        "output": "-42"
      }
    ],
    "starterCode": {
      "python": "def myAtoi(s: str) -> int:\n    # Write your solution here\n    pass\n",
      "javascript": "function myAtoi(s) {\n  // Write your solution here\n}\n",
      "cpp": "#include <vector>\n#include <string>\nusing namespace std;\n\nint myAtoi(string s) {\n    // Write your code here\n    return 0;\n}\n",
      "java": "class Solution {\n    public int myAtoi(String s) {\n        // Write your code here\n        return 0;\n    }\n}\n",
      "c": "#include <stdio.h>\n#include <stdbool.h>\n\nint myAtoi(char* s) {\n    // Write your code here\n    return 0;\n}\n"
    },
    "testCases": [
      {
        "input": "\"42\"",
        "expectedOutput": "42"
      },
      {
        "input": "\"   -42\"",
        "expectedOutput": "-42"
      },
      {
        "input": "\"4193 with words\"",
        "expectedOutput": "4193"
      },
      {
        "input": "\"-91283472332\"",
        "expectedOutput": "-2147483648"
      }
    ],
    "hiddenTestCases": [
      {
        "input": "\"42\"",
        "expectedOutput": "42"
      },
      {
        "input": "\"   -42\"",
        "expectedOutput": "-42"
      }
    ]
  },
  {
    "id": "p_valid_palindrome_ii",
    "title": "Valid Palindrome II",
    "category": "Strings",
    "difficulty": "Easy",
    "acceptance": "40.3%",
    "companies": [
      "Facebook",
      "TCS",
      "Amazon"
    ],
    "functionName": "validPalindrome",
    "hints": [
      "Two pointers from both ends; on mismatch check removing left or right."
    ],
    "description": "Return true if s can be a palindrome after deleting at most one character.",
    "constraints": [
      "1 <= s.length <= 10^5"
    ],
    "examples": [
      {
        "input": "s = \"aba\"",
        "output": "true"
      },
      {
        "input": "s = \"abca\"",
        "output": "true"
      }
    ],
    "starterCode": {
      "python": "def validPalindrome(s: str) -> bool:\n    # Write your solution here\n    pass\n",
      "javascript": "function validPalindrome(s) {\n  // Write your solution here\n}\n",
      "cpp": "#include <vector>\n#include <string>\nusing namespace std;\n\nbool validPalindrome(string s) {\n    // Write your code here\n    return false;\n}\n",
      "java": "class Solution {\n    public boolean validPalindrome(String s) {\n        // Write your code here\n        return false;\n    }\n}\n",
      "c": "#include <stdio.h>\n#include <stdbool.h>\n\nbool validPalindrome(char* s) {\n    // Write your code here\n    return false;\n}\n"
    },
    "testCases": [
      {
        "input": "\"aba\"",
        "expectedOutput": "true"
      },
      {
        "input": "\"abca\"",
        "expectedOutput": "true"
      },
      {
        "input": "\"abc\"",
        "expectedOutput": "false"
      },
      {
        "input": "\"deeee\"",
        "expectedOutput": "true"
      }
    ],
    "hiddenTestCases": [
      {
        "input": "\"aba\"",
        "expectedOutput": "true"
      },
      {
        "input": "\"abca\"",
        "expectedOutput": "true"
      }
    ]
  },
  {
    "id": "p_count_and_say",
    "title": "Count and Say",
    "category": "Strings",
    "difficulty": "Medium",
    "acceptance": "54.7%",
    "companies": [
      "Amazon",
      "Zoho",
      "Microsoft"
    ],
    "functionName": "countAndSay",
    "hints": [
      "Recursively or iteratively run-length encode the previous string."
    ],
    "description": "Return the nth element of the count-and-say sequence.",
    "constraints": [
      "1 <= n <= 30"
    ],
    "examples": [
      {
        "input": "n = 1",
        "output": "\"1\""
      },
      {
        "input": "n = 4",
        "output": "\"1211\""
      }
    ],
    "starterCode": {
      "python": "def countAndSay(n: int) -> str:\n    # Write your solution here\n    pass\n",
      "javascript": "function countAndSay(n) {\n  // Write your solution here\n}\n",
      "cpp": "#include <vector>\n#include <string>\nusing namespace std;\n\nstring countAndSay(int n) {\n    // Write your code here\n    return \"\";\n}\n",
      "java": "class Solution {\n    public String countAndSay(int n) {\n        // Write your code here\n        return \"\";\n    }\n}\n",
      "c": "#include <stdio.h>\n#include <stdbool.h>\n\nchar* countAndSay(int n) {\n    // Write your code here\n    return NULL;\n}\n"
    },
    "testCases": [
      {
        "input": "1",
        "expectedOutput": "\"1\""
      },
      {
        "input": "4",
        "expectedOutput": "\"1211\""
      },
      {
        "input": "2",
        "expectedOutput": "\"11\""
      },
      {
        "input": "5",
        "expectedOutput": "\"111221\""
      }
    ],
    "hiddenTestCases": [
      {
        "input": "1",
        "expectedOutput": "\"1\""
      },
      {
        "input": "4",
        "expectedOutput": "\"1211\""
      }
    ]
  },
  {
    "id": "p_multiply_strings",
    "title": "Multiply Strings",
    "category": "Strings",
    "difficulty": "Medium",
    "acceptance": "40.1%",
    "companies": [
      "Google",
      "TCS Digital",
      "Amazon"
    ],
    "functionName": "multiply",
    "hints": [
      "Position i and j product contributes to indices i+j and i+j+1."
    ],
    "description": "Given two non-negative integers represented as strings, return their product as a string without BigInteger.",
    "constraints": [
      "1 <= num1.length, num2.length <= 200"
    ],
    "examples": [
      {
        "input": "num1 = \"2\", num2 = \"3\"",
        "output": "\"6\""
      },
      {
        "input": "num1 = \"123\", num2 = \"456\"",
        "output": "\"56088\""
      }
    ],
    "starterCode": {
      "python": "def multiply(num1: str, num2: str) -> str:\n    # Write your solution here\n    pass\n",
      "javascript": "function multiply(num1, num2) {\n  // Write your solution here\n}\n",
      "cpp": "#include <vector>\n#include <string>\nusing namespace std;\n\nstring multiply(string num1, string num2) {\n    // Write your code here\n    return \"\";\n}\n",
      "java": "class Solution {\n    public String multiply(String num1, String num2) {\n        // Write your code here\n        return \"\";\n    }\n}\n",
      "c": "#include <stdio.h>\n#include <stdbool.h>\n\nchar* multiply(char* num1, char* num2) {\n    // Write your code here\n    return NULL;\n}\n"
    },
    "testCases": [
      {
        "input": "\"2\", \"3\"",
        "expectedOutput": "\"6\""
      },
      {
        "input": "\"123\", \"456\"",
        "expectedOutput": "\"56088\""
      },
      {
        "input": "\"0\", \"456\"",
        "expectedOutput": "\"0\""
      },
      {
        "input": "\"99\", \"99\"",
        "expectedOutput": "\"9801\""
      }
    ],
    "hiddenTestCases": [
      {
        "input": "\"2\", \"3\"",
        "expectedOutput": "\"6\""
      },
      {
        "input": "\"123\", \"456\"",
        "expectedOutput": "\"56088\""
      }
    ]
  },
  {
    "id": "p_isomorphic_strings",
    "title": "Isomorphic Strings",
    "category": "Strings",
    "difficulty": "Easy",
    "acceptance": "44.9%",
    "companies": [
      "Amazon",
      "Zoho",
      "Infosys"
    ],
    "functionName": "isIsomorphic",
    "hints": [
      "Use two maps or arrays to ensure bijection."
    ],
    "description": "Determine if two strings s and t are isomorphic with 1-to-1 character mappings.",
    "constraints": [
      "1 <= s.length <= 5 * 10^4"
    ],
    "examples": [
      {
        "input": "s = \"egg\", t = \"add\"",
        "output": "true"
      },
      {
        "input": "s = \"foo\", t = \"bar\"",
        "output": "false"
      }
    ],
    "starterCode": {
      "python": "def isIsomorphic(s: str, t: str) -> bool:\n    # Write your solution here\n    pass\n",
      "javascript": "function isIsomorphic(s, t) {\n  // Write your solution here\n}\n",
      "cpp": "#include <vector>\n#include <string>\nusing namespace std;\n\nbool isIsomorphic(string s, string t) {\n    // Write your code here\n    return false;\n}\n",
      "java": "class Solution {\n    public boolean isIsomorphic(String s, String t) {\n        // Write your code here\n        return false;\n    }\n}\n",
      "c": "#include <stdio.h>\n#include <stdbool.h>\n\nbool isIsomorphic(char* s, char* t) {\n    // Write your code here\n    return false;\n}\n"
    },
    "testCases": [
      {
        "input": "\"egg\", \"add\"",
        "expectedOutput": "true"
      },
      {
        "input": "\"foo\", \"bar\"",
        "expectedOutput": "false"
      },
      {
        "input": "\"paper\", \"title\"",
        "expectedOutput": "true"
      },
      {
        "input": "\"badc\", \"baba\"",
        "expectedOutput": "false"
      }
    ],
    "hiddenTestCases": [
      {
        "input": "\"egg\", \"add\"",
        "expectedOutput": "true"
      },
      {
        "input": "\"foo\", \"bar\"",
        "expectedOutput": "false"
      }
    ]
  },
  {
    "id": "p_word_pattern",
    "title": "Word Pattern",
    "category": "Strings",
    "difficulty": "Easy",
    "acceptance": "42.3%",
    "companies": [
      "Amazon",
      "Infosys",
      "Wipro"
    ],
    "functionName": "wordPattern",
    "hints": [
      "Split words and verify bijection with pattern characters."
    ],
    "description": "Return true if s follows the exact bijection pattern of space-separated words.",
    "constraints": [
      "1 <= pattern.length <= 300"
    ],
    "examples": [
      {
        "input": "pattern = \"abba\", s = \"dog cat cat dog\"",
        "output": "true"
      },
      {
        "input": "pattern = \"abba\", s = \"dog cat cat fish\"",
        "output": "false"
      }
    ],
    "starterCode": {
      "python": "def wordPattern(pattern: str, s: str) -> bool:\n    # Write your solution here\n    pass\n",
      "javascript": "function wordPattern(pattern, s) {\n  // Write your solution here\n}\n",
      "cpp": "#include <vector>\n#include <string>\nusing namespace std;\n\nbool wordPattern(string pattern, string s) {\n    // Write your code here\n    return false;\n}\n",
      "java": "class Solution {\n    public boolean wordPattern(String pattern, String s) {\n        // Write your code here\n        return false;\n    }\n}\n",
      "c": "#include <stdio.h>\n#include <stdbool.h>\n\nbool wordPattern(char* pattern, char* s) {\n    // Write your code here\n    return false;\n}\n"
    },
    "testCases": [
      {
        "input": "\"abba\", \"dog cat cat dog\"",
        "expectedOutput": "true"
      },
      {
        "input": "\"abba\", \"dog cat cat fish\"",
        "expectedOutput": "false"
      },
      {
        "input": "\"aaaa\", \"dog cat cat dog\"",
        "expectedOutput": "false"
      },
      {
        "input": "\"abba\", \"dog dog dog dog\"",
        "expectedOutput": "false"
      }
    ],
    "hiddenTestCases": [
      {
        "input": "\"abba\", \"dog cat cat dog\"",
        "expectedOutput": "true"
      },
      {
        "input": "\"abba\", \"dog cat cat fish\"",
        "expectedOutput": "false"
      }
    ]
  },
  {
    "id": "p_roman_to_integer",
    "title": "Roman to Integer",
    "category": "Strings",
    "difficulty": "Easy",
    "acceptance": "60.5%",
    "companies": [
      "TCS",
      "Amazon",
      "Microsoft"
    ],
    "functionName": "romanToInt",
    "hints": [
      "Subtract if smaller numeral precedes a larger one."
    ],
    "description": "Convert a roman numeral string to its integer value.",
    "constraints": [
      "1 <= s.length <= 15"
    ],
    "examples": [
      {
        "input": "s = \"III\"",
        "output": "3"
      },
      {
        "input": "s = \"LVIII\"",
        "output": "58"
      }
    ],
    "starterCode": {
      "python": "def romanToInt(s: str) -> int:\n    # Write your solution here\n    pass\n",
      "javascript": "function romanToInt(s) {\n  // Write your solution here\n}\n",
      "cpp": "#include <vector>\n#include <string>\nusing namespace std;\n\nint romanToInt(string s) {\n    // Write your code here\n    return 0;\n}\n",
      "java": "class Solution {\n    public int romanToInt(String s) {\n        // Write your code here\n        return 0;\n    }\n}\n",
      "c": "#include <stdio.h>\n#include <stdbool.h>\n\nint romanToInt(char* s) {\n    // Write your code here\n    return 0;\n}\n"
    },
    "testCases": [
      {
        "input": "\"III\"",
        "expectedOutput": "3"
      },
      {
        "input": "\"LVIII\"",
        "expectedOutput": "58"
      },
      {
        "input": "\"MCMXCIV\"",
        "expectedOutput": "1994"
      },
      {
        "input": "\"IX\"",
        "expectedOutput": "9"
      }
    ],
    "hiddenTestCases": [
      {
        "input": "\"III\"",
        "expectedOutput": "3"
      },
      {
        "input": "\"LVIII\"",
        "expectedOutput": "58"
      }
    ]
  },
  {
    "id": "p_two_sum_ii",
    "title": "Two Sum II - Input Array Is Sorted",
    "category": "Two Pointers",
    "difficulty": "Medium",
    "acceptance": "60.8%",
    "companies": [
      "Amazon",
      "Google",
      "TCS Digital"
    ],
    "functionName": "twoSumSorted",
    "hints": [
      "Left pointer at 0, right pointer at end. Increment left if sum < target, decrement right if sum > target."
    ],
    "description": "Find two numbers in 1-indexed sorted array `numbers` that add up to `target`.",
    "constraints": [
      "2 <= numbers.length <= 3 * 10^4",
      "-1000 <= numbers[i] <= 1000"
    ],
    "examples": [
      {
        "input": "numbers = [2,7,11,15], target = 9",
        "output": "[1,2]"
      },
      {
        "input": "numbers = [2,3,4], target = 6",
        "output": "[1,3]"
      }
    ],
    "starterCode": {
      "python": "def twoSumSorted(numbers: list[int], target: int) -> list[int]:\n    # Write your solution here\n    pass\n",
      "javascript": "function twoSumSorted(numbers, target) {\n  // Write your solution here\n}\n",
      "cpp": "#include <vector>\n#include <string>\nusing namespace std;\n\nvector<int> twoSumSorted(vector<int>& numbers, int target) {\n    // Write your code here\n    return {};\n}\n",
      "java": "class Solution {\n    public int[] twoSumSorted(int[] numbers, int target) {\n        // Write your code here\n        return new int[]{};\n    }\n}\n",
      "c": "#include <stdio.h>\n#include <stdbool.h>\n\nint* twoSumSorted(int* numbers, int size, int target, int* returnSize) {\n    // Write your code here\n    return NULL;\n}\n"
    },
    "testCases": [
      {
        "input": "[2, 7, 11, 15], 9",
        "expectedOutput": "[1, 2]"
      },
      {
        "input": "[2, 3, 4], 6",
        "expectedOutput": "[1, 3]"
      },
      {
        "input": "[-1, 0], -1",
        "expectedOutput": "[1, 2]"
      },
      {
        "input": "[1, 2, 3, 4, 4, 9, 56], 8",
        "expectedOutput": "[4, 5]"
      }
    ],
    "hiddenTestCases": [
      {
        "input": "[2, 7, 11, 15], 9",
        "expectedOutput": "[1, 2]"
      },
      {
        "input": "[2, 3, 4], 6",
        "expectedOutput": "[1, 3]"
      }
    ]
  },
  {
    "id": "p_trapping_rain_water",
    "title": "Trapping Rain Water",
    "category": "Two Pointers",
    "difficulty": "Hard",
    "acceptance": "60.2%",
    "companies": [
      "Google",
      "Amazon",
      "Microsoft"
    ],
    "functionName": "trap",
    "hints": [
      "Two pointers track max left and max right heights."
    ],
    "description": "Given `n` non-negative integers representing an elevation map where bar width is 1, compute how much water it can trap after raining.",
    "constraints": [
      "n == height.length",
      "1 <= n <= 2 * 10^4",
      "0 <= height[i] <= 10^5"
    ],
    "examples": [
      {
        "input": "height = [0,1,0,2,1,0,1,3,2,1,2,1]",
        "output": "6"
      },
      {
        "input": "height = [4,2,0,3,2,5]",
        "output": "9"
      }
    ],
    "starterCode": {
      "python": "def trap(height: list[int]) -> int:\n    # Write your solution here\n    pass\n",
      "javascript": "function trap(height) {\n  // Write your solution here\n}\n",
      "cpp": "#include <vector>\n#include <string>\nusing namespace std;\n\nint trap(vector<int>& height) {\n    // Write your code here\n    return 0;\n}\n",
      "java": "class Solution {\n    public int trap(int[] height) {\n        // Write your code here\n        return 0;\n    }\n}\n",
      "c": "#include <stdio.h>\n#include <stdbool.h>\n\nint trap(int* height, int heightSize) {\n    // Write your code here\n    return 0;\n}\n"
    },
    "testCases": [
      {
        "input": "[0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1]",
        "expectedOutput": "6"
      },
      {
        "input": "[4, 2, 0, 3, 2, 5]",
        "expectedOutput": "9"
      },
      {
        "input": "[1, 2, 3]",
        "expectedOutput": "0"
      },
      {
        "input": "[3, 0, 2, 0, 4]",
        "expectedOutput": "7"
      }
    ],
    "hiddenTestCases": [
      {
        "input": "[0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1]",
        "expectedOutput": "6"
      },
      {
        "input": "[4, 2, 0, 3, 2, 5]",
        "expectedOutput": "9"
      }
    ]
  },
  {
    "id": "p_remove_duplicates_sorted",
    "title": "Remove Duplicates from Sorted Array",
    "category": "Two Pointers",
    "difficulty": "Easy",
    "acceptance": "55.8%",
    "companies": [
      "TCS",
      "Infosys",
      "Wipro",
      "Accenture"
    ],
    "functionName": "removeDuplicates",
    "hints": [
      "Slow pointer tracks the write index for next distinct element."
    ],
    "description": "Given a sorted array `nums`, remove duplicates in-place such that each unique element appears only once. Return the number of unique elements.",
    "constraints": [
      "1 <= nums.length <= 3 * 10^4",
      "-100 <= nums[i] <= 100"
    ],
    "examples": [
      {
        "input": "nums = [1,1,2]",
        "output": "2"
      },
      {
        "input": "nums = [0,0,1,1,1,2,2,3,3,4]",
        "output": "5"
      }
    ],
    "starterCode": {
      "python": "def removeDuplicates(nums: list[int]) -> int:\n    # Write your solution here\n    pass\n",
      "javascript": "function removeDuplicates(nums) {\n  // Write your solution here\n}\n",
      "cpp": "#include <vector>\n#include <string>\nusing namespace std;\n\nint removeDuplicates(vector<int>& nums) {\n    // Write your code here\n    return 0;\n}\n",
      "java": "class Solution {\n    public int removeDuplicates(int[] nums) {\n        // Write your code here\n        return 0;\n    }\n}\n",
      "c": "#include <stdio.h>\n#include <stdbool.h>\n\nint removeDuplicates(int* nums, int numsSize) {\n    // Write your code here\n    return 0;\n}\n"
    },
    "testCases": [
      {
        "input": "[1, 1, 2]",
        "expectedOutput": "2"
      },
      {
        "input": "[0, 0, 1, 1, 1, 2, 2, 3, 3, 4]",
        "expectedOutput": "5"
      },
      {
        "input": "[1]",
        "expectedOutput": "1"
      },
      {
        "input": "[1, 2, 3]",
        "expectedOutput": "3"
      }
    ],
    "hiddenTestCases": [
      {
        "input": "[1, 1, 2]",
        "expectedOutput": "2"
      },
      {
        "input": "[0, 0, 1, 1, 1, 2, 2, 3, 3, 4]",
        "expectedOutput": "5"
      }
    ]
  },
  {
    "id": "p_sort_colors",
    "title": "Sort Colors (Dutch National Flag)",
    "category": "Two Pointers",
    "difficulty": "Medium",
    "acceptance": "61.3%",
    "companies": [
      "Microsoft",
      "Amazon",
      "TCS Digital"
    ],
    "functionName": "sortColors",
    "hints": [
      "Three pointers: low, mid, high. Swap 0s to low, 2s to high."
    ],
    "description": "Given an array `nums` with `n` objects colored 0 (red), 1 (white), or 2 (blue), sort them in-place so that objects of the same color are adjacent. Return sorted array.",
    "constraints": [
      "n == nums.length",
      "1 <= n <= 300",
      "nums[i] is 0, 1, or 2."
    ],
    "examples": [
      {
        "input": "nums = [2,0,2,1,1,0]",
        "output": "[0,0,1,1,2,2]"
      },
      {
        "input": "nums = [2,0,1]",
        "output": "[0,1,2]"
      }
    ],
    "starterCode": {
      "python": "def sortColors(nums: list[int]) -> list[int]:\n    # Write your solution here\n    pass\n",
      "javascript": "function sortColors(nums) {\n  // Write your solution here\n}\n",
      "cpp": "#include <vector>\n#include <string>\nusing namespace std;\n\nvector<int> sortColors(vector<int>& nums) {\n    // Write your code here\n    return {};\n}\n",
      "java": "class Solution {\n    public int[] sortColors(int[] nums) {\n        // Write your code here\n        return new int[]{};\n    }\n}\n",
      "c": "#include <stdio.h>\n#include <stdbool.h>\n\nint* sortColors(int* nums, int numsSize) {\n    // Write your code here\n    return NULL;\n}\n"
    },
    "testCases": [
      {
        "input": "[2, 0, 2, 1, 1, 0]",
        "expectedOutput": "[0, 0, 1, 1, 2, 2]"
      },
      {
        "input": "[2, 0, 1]",
        "expectedOutput": "[0, 1, 2]"
      },
      {
        "input": "[0]",
        "expectedOutput": "[0]"
      },
      {
        "input": "[1, 0]",
        "expectedOutput": "[0, 1]"
      }
    ],
    "hiddenTestCases": [
      {
        "input": "[2, 0, 2, 1, 1, 0]",
        "expectedOutput": "[0, 0, 1, 1, 2, 2]"
      },
      {
        "input": "[2, 0, 1]",
        "expectedOutput": "[0, 1, 2]"
      }
    ]
  },
  {
    "id": "p_squares_sorted_array",
    "title": "Squares of a Sorted Array",
    "category": "Two Pointers",
    "difficulty": "Easy",
    "acceptance": "72.4%",
    "companies": [
      "Google",
      "TCS",
      "Accenture"
    ],
    "functionName": "sortedSquares",
    "hints": [
      "Two pointers at ends, compare squares and fill the result from right to left."
    ],
    "description": "Given an integer array `nums` sorted in non-decreasing order, return an array of the squares of each number sorted in non-decreasing order.",
    "constraints": [
      "1 <= nums.length <= 10^4",
      "-10^4 <= nums[i] <= 10^4"
    ],
    "examples": [
      {
        "input": "nums = [-4,-1,0,3,10]",
        "output": "[0,1,9,16,100]"
      },
      {
        "input": "nums = [-7,-3,2,3,11]",
        "output": "[4,9,9,49,121]"
      }
    ],
    "starterCode": {
      "python": "def sortedSquares(nums: list[int]) -> list[int]:\n    # Write your solution here\n    pass\n",
      "javascript": "function sortedSquares(nums) {\n  // Write your solution here\n}\n",
      "cpp": "#include <vector>\n#include <string>\nusing namespace std;\n\nvector<int> sortedSquares(vector<int>& nums) {\n    // Write your code here\n    return {};\n}\n",
      "java": "class Solution {\n    public int[] sortedSquares(int[] nums) {\n        // Write your code here\n        return new int[]{};\n    }\n}\n",
      "c": "#include <stdio.h>\n#include <stdbool.h>\n\nint* sortedSquares(int* nums, int numsSize, int* returnSize) {\n    // Write your code here\n    return NULL;\n}\n"
    },
    "testCases": [
      {
        "input": "[-4, -1, 0, 3, 10]",
        "expectedOutput": "[0, 1, 9, 16, 100]"
      },
      {
        "input": "[-7, -3, 2, 3, 11]",
        "expectedOutput": "[4, 9, 9, 49, 121]"
      },
      {
        "input": "[-1]",
        "expectedOutput": "[1]"
      },
      {
        "input": "[0, 2, 3]",
        "expectedOutput": "[0, 4, 9]"
      }
    ],
    "hiddenTestCases": [
      {
        "input": "[-4, -1, 0, 3, 10]",
        "expectedOutput": "[0, 1, 9, 16, 100]"
      },
      {
        "input": "[-7, -3, 2, 3, 11]",
        "expectedOutput": "[4, 9, 9, 49, 121]"
      }
    ]
  },
  {
    "id": "p_is_subsequence",
    "title": "Is Subsequence",
    "category": "Two Pointers",
    "difficulty": "Easy",
    "acceptance": "48.1%",
    "companies": [
      "Amazon",
      "Infosys",
      "Deloitte"
    ],
    "functionName": "isSubsequence",
    "hints": [
      "Advance pointer on s whenever matching character in t is found."
    ],
    "description": "Given two strings `s` and `t`, return `true` if `s` is a subsequence of `t`, or `false` otherwise.",
    "constraints": [
      "0 <= s.length <= 100",
      "0 <= t.length <= 10^4"
    ],
    "examples": [
      {
        "input": "s = \"abc\", t = \"ahbgdc\"",
        "output": "true"
      },
      {
        "input": "s = \"axc\", t = \"ahbgdc\"",
        "output": "false"
      }
    ],
    "starterCode": {
      "python": "def isSubsequence(s: str, t: str) -> bool:\n    # Write your solution here\n    pass\n",
      "javascript": "function isSubsequence(s, t) {\n  // Write your solution here\n}\n",
      "cpp": "#include <vector>\n#include <string>\nusing namespace std;\n\nbool isSubsequence(string s, string t) {\n    // Write your code here\n    return false;\n}\n",
      "java": "class Solution {\n    public boolean isSubsequence(String s, String t) {\n        // Write your code here\n        return false;\n    }\n}\n",
      "c": "#include <stdio.h>\n#include <stdbool.h>\n\nbool isSubsequence(char* s, char* t) {\n    // Write your code here\n    return false;\n}\n"
    },
    "testCases": [
      {
        "input": "\"abc\", \"ahbgdc\"",
        "expectedOutput": "true"
      },
      {
        "input": "\"axc\", \"ahbgdc\"",
        "expectedOutput": "false"
      },
      {
        "input": "\"\", \"ahbgdc\"",
        "expectedOutput": "true"
      },
      {
        "input": "\"b\", \"c\"",
        "expectedOutput": "false"
      }
    ],
    "hiddenTestCases": [
      {
        "input": "\"abc\", \"ahbgdc\"",
        "expectedOutput": "true"
      },
      {
        "input": "\"axc\", \"ahbgdc\"",
        "expectedOutput": "false"
      }
    ]
  },
  {
    "id": "p_min_window_substring",
    "title": "Minimum Window Substring",
    "category": "Sliding Window",
    "difficulty": "Hard",
    "acceptance": "42.0%",
    "companies": [
      "Google",
      "Amazon",
      "Microsoft"
    ],
    "functionName": "minWindow",
    "hints": [
      "Sliding window expanding right and contracting left once all chars in t are matched."
    ],
    "description": "Given two strings `s` and `t`, return the minimum window substring of `s` such that every character in `t` (including duplicates) is included in the window.",
    "constraints": [
      "1 <= s.length, t.length <= 10^5"
    ],
    "examples": [
      {
        "input": "s = \"ADOBECODEBANC\", t = \"ABC\"",
        "output": "\"BANC\""
      },
      {
        "input": "s = \"a\", t = \"a\"",
        "output": "\"a\""
      }
    ],
    "starterCode": {
      "python": "def minWindow(s: str, t: str) -> str:\n    # Write your solution here\n    pass\n",
      "javascript": "function minWindow(s, t) {\n  // Write your solution here\n}\n",
      "cpp": "#include <vector>\n#include <string>\nusing namespace std;\n\nstring minWindow(string s, string t) {\n    // Write your code here\n    return \"\";\n}\n",
      "java": "class Solution {\n    public String minWindow(String s, String t) {\n        // Write your code here\n        return \"\";\n    }\n}\n",
      "c": "#include <stdio.h>\n#include <stdbool.h>\n\nchar* minWindow(char* s, char* t) {\n    // Write your code here\n    return NULL;\n}\n"
    },
    "testCases": [
      {
        "input": "\"ADOBECODEBANC\", \"ABC\"",
        "expectedOutput": "\"BANC\""
      },
      {
        "input": "\"a\", \"a\"",
        "expectedOutput": "\"a\""
      },
      {
        "input": "\"a\", \"aa\"",
        "expectedOutput": "\"\""
      },
      {
        "input": "\"ab\", \"b\"",
        "expectedOutput": "\"b\""
      }
    ],
    "hiddenTestCases": [
      {
        "input": "\"ADOBECODEBANC\", \"ABC\"",
        "expectedOutput": "\"BANC\""
      },
      {
        "input": "\"a\", \"a\"",
        "expectedOutput": "\"a\""
      }
    ]
  },
  {
    "id": "p_longest_repeating_char",
    "title": "Longest Repeating Character Replacement",
    "category": "Sliding Window",
    "difficulty": "Medium",
    "acceptance": "54.1%",
    "companies": [
      "Amazon",
      "Google"
    ],
    "functionName": "characterReplacement",
    "hints": [
      "Window valid when window_size - max_freq <= k."
    ],
    "description": "Given string `s` and integer `k`, choose at most `k` characters to change to any letter. Return the length of the longest substring containing identical letter.",
    "constraints": [
      "1 <= s.length <= 10^5",
      "0 <= k <= s.length"
    ],
    "examples": [
      {
        "input": "s = \"ABAB\", k = 2",
        "output": "4"
      },
      {
        "input": "s = \"AABABBA\", k = 1",
        "output": "4"
      }
    ],
    "starterCode": {
      "python": "def characterReplacement(s: str, k: int) -> int:\n    # Write your solution here\n    pass\n",
      "javascript": "function characterReplacement(s, k) {\n  // Write your solution here\n}\n",
      "cpp": "#include <vector>\n#include <string>\nusing namespace std;\n\nint characterReplacement(string s, int k) {\n    // Write your code here\n    return 0;\n}\n",
      "java": "class Solution {\n    public int characterReplacement(String s, int k) {\n        // Write your code here\n        return 0;\n    }\n}\n",
      "c": "#include <stdio.h>\n#include <stdbool.h>\n\nint characterReplacement(char* s, int k) {\n    // Write your code here\n    return 0;\n}\n"
    },
    "testCases": [
      {
        "input": "\"ABAB\", 2",
        "expectedOutput": "4"
      },
      {
        "input": "\"AABABBA\", 1",
        "expectedOutput": "4"
      },
      {
        "input": "\"AAAA\", 2",
        "expectedOutput": "4"
      },
      {
        "input": "\"ABBB\", 2",
        "expectedOutput": "4"
      }
    ],
    "hiddenTestCases": [
      {
        "input": "\"ABAB\", 2",
        "expectedOutput": "4"
      },
      {
        "input": "\"AABABBA\", 1",
        "expectedOutput": "4"
      }
    ]
  },
  {
    "id": "p_permutation_in_string",
    "title": "Permutation in String",
    "category": "Sliding Window",
    "difficulty": "Medium",
    "acceptance": "44.5%",
    "companies": [
      "Microsoft",
      "Amazon"
    ],
    "functionName": "checkInclusion",
    "hints": [
      "Fixed sliding window of size s1.length tracking matching frequency counts."
    ],
    "description": "Given two strings `s1` and `s2`, return `true` if `s2` contains a permutation of `s1`, or `false` otherwise.",
    "constraints": [
      "1 <= s1.length, s2.length <= 10^4"
    ],
    "examples": [
      {
        "input": "s1 = \"ab\", s2 = \"eidbaooo\"",
        "output": "true"
      },
      {
        "input": "s1 = \"ab\", s2 = \"eidboaoo\"",
        "output": "false"
      }
    ],
    "starterCode": {
      "python": "def checkInclusion(s1: str, s2: str) -> bool:\n    # Write your solution here\n    pass\n",
      "javascript": "function checkInclusion(s1, s2) {\n  // Write your solution here\n}\n",
      "cpp": "#include <vector>\n#include <string>\nusing namespace std;\n\nbool checkInclusion(string s1, string s2) {\n    // Write your code here\n    return false;\n}\n",
      "java": "class Solution {\n    public boolean checkInclusion(String s1, String s2) {\n        // Write your code here\n        return false;\n    }\n}\n",
      "c": "#include <stdio.h>\n#include <stdbool.h>\n\nbool checkInclusion(char* s1, char* s2) {\n    // Write your code here\n    return false;\n}\n"
    },
    "testCases": [
      {
        "input": "\"ab\", \"eidbaooo\"",
        "expectedOutput": "true"
      },
      {
        "input": "\"ab\", \"eidboaoo\"",
        "expectedOutput": "false"
      },
      {
        "input": "\"a\", \"a\"",
        "expectedOutput": "true"
      },
      {
        "input": "\"hello\", \"ooolleoooleh\"",
        "expectedOutput": "false"
      }
    ],
    "hiddenTestCases": [
      {
        "input": "\"ab\", \"eidbaooo\"",
        "expectedOutput": "true"
      },
      {
        "input": "\"ab\", \"eidboaoo\"",
        "expectedOutput": "false"
      }
    ]
  },
  {
    "id": "p_sliding_window_max",
    "title": "Sliding Window Maximum",
    "category": "Sliding Window",
    "difficulty": "Hard",
    "acceptance": "46.7%",
    "companies": [
      "Google",
      "Amazon"
    ],
    "functionName": "maxSlidingWindow",
    "hints": [
      "Use monotonic decreasing deque storing indices."
    ],
    "description": "Given an array `nums` and sliding window of size `k`, return max element in window as it moves from left to right.",
    "constraints": [
      "1 <= nums.length <= 10^5",
      "1 <= k <= nums.length"
    ],
    "examples": [
      {
        "input": "nums = [1,3,-1,-3,5,3,6,7], k = 3",
        "output": "[3,3,5,5,6,7]"
      },
      {
        "input": "nums = [1], k = 1",
        "output": "[1]"
      }
    ],
    "starterCode": {
      "python": "def maxSlidingWindow(nums: list[int], k: int) -> list[int]:\n    # Write your solution here\n    pass\n",
      "javascript": "function maxSlidingWindow(nums, k) {\n  // Write your solution here\n}\n",
      "cpp": "#include <vector>\n#include <string>\nusing namespace std;\n\nvector<int> maxSlidingWindow(vector<int>& nums, int k) {\n    // Write your code here\n    return {};\n}\n",
      "java": "class Solution {\n    public int[] maxSlidingWindow(int[] nums, int k) {\n        // Write your code here\n        return new int[]{};\n    }\n}\n",
      "c": "#include <stdio.h>\n#include <stdbool.h>\n\nint* maxSlidingWindow(int* nums, int numsSize, int k, int* returnSize) {\n    // Write your code here\n    return NULL;\n}\n"
    },
    "testCases": [
      {
        "input": "[1, 3, -1, -3, 5, 3, 6, 7], 3",
        "expectedOutput": "[3, 3, 5, 5, 6, 7]"
      },
      {
        "input": "[1], 1",
        "expectedOutput": "[1]"
      },
      {
        "input": "[1, -1], 1",
        "expectedOutput": "[1, -1]"
      },
      {
        "input": "[9, 11], 2",
        "expectedOutput": "[11]"
      }
    ],
    "hiddenTestCases": [
      {
        "input": "[1, 3, -1, -3, 5, 3, 6, 7], 3",
        "expectedOutput": "[3, 3, 5, 5, 6, 7]"
      },
      {
        "input": "[1], 1",
        "expectedOutput": "[1]"
      }
    ]
  },
  {
    "id": "p_max_consecutive_ones_iii",
    "title": "Max Consecutive Ones III",
    "category": "Sliding Window",
    "difficulty": "Medium",
    "acceptance": "63.2%",
    "companies": [
      "Google",
      "Flipkart"
    ],
    "functionName": "longestOnes",
    "hints": [
      "Slide window and shrink from left whenever zero count exceeds k."
    ],
    "description": "Given a binary array `nums` and an integer `k`, return the maximum number of consecutive 1's in the array if you can flip at most `k` 0's.",
    "constraints": [
      "1 <= nums.length <= 10^5",
      "0 <= k <= nums.length"
    ],
    "examples": [
      {
        "input": "nums = [1,1,1,0,0,0,1,1,1,1,0], k = 2",
        "output": "6"
      },
      {
        "input": "nums = [0,0,1,1,0,0,1,1,1,0,1,1,0,0,0,1,1,1,1], k = 3",
        "output": "10"
      }
    ],
    "starterCode": {
      "python": "def longestOnes(nums: list[int], k: int) -> int:\n    # Write your solution here\n    pass\n",
      "javascript": "function longestOnes(nums, k) {\n  // Write your solution here\n}\n",
      "cpp": "#include <vector>\n#include <string>\nusing namespace std;\n\nint longestOnes(vector<int>& nums, int k) {\n    // Write your code here\n    return 0;\n}\n",
      "java": "class Solution {\n    public int longestOnes(int[] nums, int k) {\n        // Write your code here\n        return 0;\n    }\n}\n",
      "c": "#include <stdio.h>\n#include <stdbool.h>\n\nint longestOnes(int* nums, int numsSize, int k) {\n    // Write your code here\n    return 0;\n}\n"
    },
    "testCases": [
      {
        "input": "[1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 0], 2",
        "expectedOutput": "6"
      },
      {
        "input": "[0, 0, 1, 1, 0, 0, 1, 1, 1, 0, 1, 1, 0, 0, 0, 1, 1, 1, 1], 3",
        "expectedOutput": "10"
      },
      {
        "input": "[1, 1, 1]",
        "expectedOutput": "3"
      },
      {
        "input": "[0, 0, 0]",
        "expectedOutput": "0"
      }
    ],
    "hiddenTestCases": [
      {
        "input": "[1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 0], 2",
        "expectedOutput": "6"
      },
      {
        "input": "[0, 0, 1, 1, 0, 0, 1, 1, 1, 0, 1, 1, 0, 0, 0, 1, 1, 1, 1], 3",
        "expectedOutput": "10"
      }
    ]
  },
  {
    "id": "p_min_size_subarray_sum",
    "title": "Minimum Size Subarray Sum",
    "category": "Sliding Window",
    "difficulty": "Medium",
    "acceptance": "46.2%",
    "companies": [
      "Amazon",
      "Microsoft"
    ],
    "functionName": "minSubArrayLen",
    "hints": [
      "Expand right to increase sum, shrink left as long as sum >= target."
    ],
    "description": "Given array of positive integers `nums` and positive integer `target`, return minimal length of a subarray whose sum is greater than or equal to `target`. If none, return 0.",
    "constraints": [
      "1 <= target <= 10^9",
      "1 <= nums.length <= 10^5"
    ],
    "examples": [
      {
        "input": "target = 7, nums = [2,3,1,2,4,3]",
        "output": "2"
      },
      {
        "input": "target = 4, nums = [1,4,4]",
        "output": "1"
      }
    ],
    "starterCode": {
      "python": "def minSubArrayLen(target: int, nums: list[int]) -> int:\n    # Write your solution here\n    pass\n",
      "javascript": "function minSubArrayLen(target, nums) {\n  // Write your solution here\n}\n",
      "cpp": "#include <vector>\n#include <string>\nusing namespace std;\n\nint minSubArrayLen(int target, vector<int>& nums) {\n    // Write your code here\n    return 0;\n}\n",
      "java": "class Solution {\n    public int minSubArrayLen(int target, int[] nums) {\n        // Write your code here\n        return 0;\n    }\n}\n",
      "c": "#include <stdio.h>\n#include <stdbool.h>\n\nint minSubArrayLen(int target, int* nums, int numsSize) {\n    // Write your code here\n    return 0;\n}\n"
    },
    "testCases": [
      {
        "input": "7, [2, 3, 1, 2, 4, 3]",
        "expectedOutput": "2"
      },
      {
        "input": "4, [1, 4, 4]",
        "expectedOutput": "1"
      },
      {
        "input": "11, [1, 1, 1, 1, 1, 1, 1, 1]",
        "expectedOutput": "0"
      },
      {
        "input": "15, [1, 2, 3, 4, 5]",
        "expectedOutput": "5"
      }
    ],
    "hiddenTestCases": [
      {
        "input": "7, [2, 3, 1, 2, 4, 3]",
        "expectedOutput": "2"
      },
      {
        "input": "4, [1, 4, 4]",
        "expectedOutput": "1"
      }
    ]
  },
  {
    "id": "p_eval_rpn",
    "title": "Evaluate Reverse Polish Notation",
    "category": "Stack & Queue",
    "difficulty": "Medium",
    "acceptance": "49.8%",
    "companies": [
      "Amazon",
      "Google"
    ],
    "functionName": "evalRPN",
    "hints": [
      "Push numbers onto stack; when operator arrives, pop two, evaluate, and push result."
    ],
    "description": "Evaluate value of an arithmetic expression in Reverse Polish Notation. Valid operators are +, -, *, /.",
    "constraints": [
      "1 <= tokens.length <= 10^4"
    ],
    "examples": [
      {
        "input": "tokens = [\"2\",\"1\",\"+\",\"3\",\"*\"]",
        "output": "9"
      },
      {
        "input": "tokens = [\"4\",\"13\",\"5\",\"/\",\"+\"]",
        "output": "6"
      }
    ],
    "starterCode": {
      "python": "def evalRPN(tokens: list[str]) -> int:\n    # Write your solution here\n    pass\n",
      "javascript": "function evalRPN(tokens) {\n  // Write your solution here\n}\n",
      "cpp": "#include <vector>\n#include <string>\nusing namespace std;\n\nint evalRPN(vector<string>& tokens) {\n    // Write your code here\n    return 0;\n}\n",
      "java": "class Solution {\n    public int evalRPN(String[] tokens) {\n        // Write your code here\n        return 0;\n    }\n}\n",
      "c": "#include <stdio.h>\n#include <stdbool.h>\n\nint evalRPN(char** tokens, int tokensSize) {\n    // Write your code here\n    return 0;\n}\n"
    },
    "testCases": [
      {
        "input": "[\"2\", \"1\", \"+\", \"3\", \"*\"]",
        "expectedOutput": "9"
      },
      {
        "input": "[\"4\", \"13\", \"5\", \"/\", \"+\"]",
        "expectedOutput": "6"
      },
      {
        "input": "[\"10\", \"6\", \"9\", \"3\", \"+\", \"-11\", \"*\", \"/\", \"*\", \"17\", \"+\", \"5\", \"+\"]",
        "expectedOutput": "22"
      },
      {
        "input": "[\"3\", \"4\", \"+\"]",
        "expectedOutput": "7"
      }
    ],
    "hiddenTestCases": [
      {
        "input": "[\"2\", \"1\", \"+\", \"3\", \"*\"]",
        "expectedOutput": "9"
      },
      {
        "input": "[\"4\", \"13\", \"5\", \"/\", \"+\"]",
        "expectedOutput": "6"
      }
    ]
  },
  {
    "id": "p_largest_rectangle_histogram",
    "title": "Largest Rectangle in Histogram",
    "category": "Stack & Queue",
    "difficulty": "Hard",
    "acceptance": "43.5%",
    "companies": [
      "Google",
      "Amazon"
    ],
    "functionName": "largestRectangleArea",
    "hints": [
      "Monotonic increasing stack holding indices."
    ],
    "description": "Given an array of integers `heights` representing histogram bar heights, return area of the largest rectangle.",
    "constraints": [
      "1 <= heights.length <= 10^5"
    ],
    "examples": [
      {
        "input": "heights = [2,1,5,6,2,3]",
        "output": "10"
      },
      {
        "input": "heights = [2,4]",
        "output": "4"
      }
    ],
    "starterCode": {
      "python": "def largestRectangleArea(heights: list[int]) -> int:\n    # Write your solution here\n    pass\n",
      "javascript": "function largestRectangleArea(heights) {\n  // Write your solution here\n}\n",
      "cpp": "#include <vector>\n#include <string>\nusing namespace std;\n\nint largestRectangleArea(vector<int>& heights) {\n    // Write your code here\n    return 0;\n}\n",
      "java": "class Solution {\n    public int largestRectangleArea(int[] heights) {\n        // Write your code here\n        return 0;\n    }\n}\n",
      "c": "#include <stdio.h>\n#include <stdbool.h>\n\nint largestRectangleArea(int* heights, int heightsSize) {\n    // Write your code here\n    return 0;\n}\n"
    },
    "testCases": [
      {
        "input": "[2, 1, 5, 6, 2, 3]",
        "expectedOutput": "10"
      },
      {
        "input": "[2, 4]",
        "expectedOutput": "4"
      },
      {
        "input": "[1]",
        "expectedOutput": "1"
      },
      {
        "input": "[2, 1, 2]",
        "expectedOutput": "3"
      }
    ],
    "hiddenTestCases": [
      {
        "input": "[2, 1, 5, 6, 2, 3]",
        "expectedOutput": "10"
      },
      {
        "input": "[2, 4]",
        "expectedOutput": "4"
      }
    ]
  },
  {
    "id": "p_queue_using_stacks",
    "title": "Implement Queue using Stacks",
    "category": "Stack & Queue",
    "difficulty": "Easy",
    "acceptance": "64.1%",
    "companies": [
      "Microsoft",
      "TCS",
      "Infosys"
    ],
    "functionName": "queueSimulation",
    "hints": [
      "Use in_stack for pushes and out_stack for pops."
    ],
    "description": "Simulate queue FIFO operations: push and pop using two stacks. Return elements popped.",
    "constraints": [
      "1 <= operations <= 100"
    ],
    "examples": [
      {
        "input": "ops = [\"push 1\", \"push 2\", \"pop\", \"push 3\", \"pop\"]",
        "output": "[1, 2]"
      }
    ],
    "starterCode": {
      "python": "def queueSimulation(ops: list[str]) -> list[int]:\n    # Write your solution here\n    pass\n",
      "javascript": "function queueSimulation(ops) {\n  // Write your solution here\n}\n",
      "cpp": "#include <vector>\n#include <string>\nusing namespace std;\n\nvector<int> queueSimulation(vector<string>& ops) {\n    // Write your code here\n    return {};\n}\n",
      "java": "class Solution {\n    public int[] queueSimulation(String[] ops) {\n        // Write your code here\n        return new int[]{};\n    }\n}\n",
      "c": "#include <stdio.h>\n#include <stdbool.h>\n\nint* queueSimulation(char** ops, int size, int* returnSize) {\n    // Write your code here\n    return NULL;\n}\n"
    },
    "testCases": [
      {
        "input": "[\"push 1\", \"push 2\", \"pop\", \"push 3\", \"pop\"]",
        "expectedOutput": "[1, 2]"
      },
      {
        "input": "[\"push 5\", \"pop\"]",
        "expectedOutput": "[5]"
      },
      {
        "input": "[\"push 1\", \"push 2\", \"push 3\", \"pop\", \"pop\"]",
        "expectedOutput": "[1, 2]"
      },
      {
        "input": "[\"push 10\", \"pop\"]",
        "expectedOutput": "[10]"
      }
    ],
    "hiddenTestCases": [
      {
        "input": "[\"push 1\", \"push 2\", \"pop\", \"push 3\", \"pop\"]",
        "expectedOutput": "[1, 2]"
      },
      {
        "input": "[\"push 5\", \"pop\"]",
        "expectedOutput": "[5]"
      }
    ]
  },
  {
    "id": "p_next_greater_element",
    "title": "Next Greater Element I",
    "category": "Stack & Queue",
    "difficulty": "Easy",
    "acceptance": "71.8%",
    "companies": [
      "Amazon",
      "Zoho",
      "TCS"
    ],
    "functionName": "nextGreaterElement",
    "hints": [
      "Traverse nums2 with monotonic stack and store next greater in a hash map."
    ],
    "description": "For each element in `nums1`, find the first greater element to its right in `nums2`. If none, return -1.",
    "constraints": [
      "1 <= nums1.length <= nums2.length <= 1000"
    ],
    "examples": [
      {
        "input": "nums1 = [4,1,2], nums2 = [1,3,4,2]",
        "output": "[-1,3,-1]"
      },
      {
        "input": "nums1 = [2,4], nums2 = [1,2,3,4]",
        "output": "[3,-1]"
      }
    ],
    "starterCode": {
      "python": "def nextGreaterElement(nums1: list[int], nums2: list[int]) -> list[int]:\n    # Write your solution here\n    pass\n",
      "javascript": "function nextGreaterElement(nums1, nums2) {\n  // Write your solution here\n}\n",
      "cpp": "#include <vector>\n#include <string>\nusing namespace std;\n\nvector<int> nextGreaterElement(vector<int>& nums1, vector<int>& nums2) {\n    // Write your code here\n    return {};\n}\n",
      "java": "class Solution {\n    public int[] nextGreaterElement(int[] nums1, int[] nums2) {\n        // Write your code here\n        return new int[]{};\n    }\n}\n",
      "c": "#include <stdio.h>\n#include <stdbool.h>\n\nint* nextGreaterElement(int* nums1, int n1, int* nums2, int n2, int* returnSize) {\n    // Write your code here\n    return NULL;\n}\n"
    },
    "testCases": [
      {
        "input": "[4, 1, 2], [1, 3, 4, 2]",
        "expectedOutput": "[-1, 3, -1]"
      },
      {
        "input": "[2, 4], [1, 2, 3, 4]",
        "expectedOutput": "[3, -1]"
      },
      {
        "input": "[1, 3, 5], [6, 5, 4, 3, 2, 1, 7]",
        "expectedOutput": "[7, 7, 7]"
      },
      {
        "input": "[1], [1]",
        "expectedOutput": "[-1]"
      }
    ],
    "hiddenTestCases": [
      {
        "input": "[4, 1, 2], [1, 3, 4, 2]",
        "expectedOutput": "[-1, 3, -1]"
      },
      {
        "input": "[2, 4], [1, 2, 3, 4]",
        "expectedOutput": "[3, -1]"
      }
    ]
  },
  {
    "id": "p_asteroid_collision",
    "title": "Asteroid Collision",
    "category": "Stack & Queue",
    "difficulty": "Medium",
    "acceptance": "45.0%",
    "companies": [
      "Amazon",
      "Google"
    ],
    "functionName": "asteroidCollision",
    "hints": [
      "Stack holds surviving asteroids moving right. When a negative arrives, resolve collisions."
    ],
    "description": "Find the state of asteroids after all collisions. Positive moves right, negative left. Equal sizes both explode.",
    "constraints": [
      "2 <= asteroids.length <= 10^4"
    ],
    "examples": [
      {
        "input": "asteroids = [5,10,-5]",
        "output": "[5,10]"
      },
      {
        "input": "asteroids = [8,-8]",
        "output": "[]"
      }
    ],
    "starterCode": {
      "python": "def asteroidCollision(asteroids: list[int]) -> list[int]:\n    # Write your solution here\n    pass\n",
      "javascript": "function asteroidCollision(asteroids) {\n  // Write your solution here\n}\n",
      "cpp": "#include <vector>\n#include <string>\nusing namespace std;\n\nvector<int> asteroidCollision(vector<int>& asteroids) {\n    // Write your code here\n    return {};\n}\n",
      "java": "class Solution {\n    public int[] asteroidCollision(int[] asteroids) {\n        // Write your code here\n        return new int[]{};\n    }\n}\n",
      "c": "#include <stdio.h>\n#include <stdbool.h>\n\nint* asteroidCollision(int* asteroids, int size, int* returnSize) {\n    // Write your code here\n    return NULL;\n}\n"
    },
    "testCases": [
      {
        "input": "[5, 10, -5]",
        "expectedOutput": "[5, 10]"
      },
      {
        "input": "[8, -8]",
        "expectedOutput": "[]"
      },
      {
        "input": "[10, 2, -5]",
        "expectedOutput": "[10]"
      },
      {
        "input": "[-2, -1, 1, 2]",
        "expectedOutput": "[-2, -1, 1, 2]"
      }
    ],
    "hiddenTestCases": [
      {
        "input": "[5, 10, -5]",
        "expectedOutput": "[5, 10]"
      },
      {
        "input": "[8, -8]",
        "expectedOutput": "[]"
      }
    ]
  },
  {
    "id": "p_simplify_path",
    "title": "Simplify Path",
    "category": "Stack & Queue",
    "difficulty": "Medium",
    "acceptance": "41.6%",
    "companies": [
      "Microsoft",
      "Google"
    ],
    "functionName": "simplifyPath",
    "hints": [
      "Split by '/' and push directories to stack; '..' pops from stack."
    ],
    "description": "Given absolute Unix path, simplify it to the canonical path.",
    "constraints": [
      "1 <= path.length <= 3000"
    ],
    "examples": [
      {
        "input": "path = \"/home/\"",
        "output": "\"/home\""
      },
      {
        "input": "path = \"/../\"",
        "output": "\"/\""
      }
    ],
    "starterCode": {
      "python": "def simplifyPath(path: str) -> str:\n    # Write your solution here\n    pass\n",
      "javascript": "function simplifyPath(path) {\n  // Write your solution here\n}\n",
      "cpp": "#include <vector>\n#include <string>\nusing namespace std;\n\nstring simplifyPath(string path) {\n    // Write your code here\n    return \"\";\n}\n",
      "java": "class Solution {\n    public String simplifyPath(String path) {\n        // Write your code here\n        return \"\";\n    }\n}\n",
      "c": "#include <stdio.h>\n#include <stdbool.h>\n\nchar* simplifyPath(char* path) {\n    // Write your code here\n    return NULL;\n}\n"
    },
    "testCases": [
      {
        "input": "\"/home/\"",
        "expectedOutput": "\"/home\""
      },
      {
        "input": "\"/../\"",
        "expectedOutput": "\"/\""
      },
      {
        "input": "\"/home//foo/\"",
        "expectedOutput": "\"/home/foo\""
      },
      {
        "input": "\"/a/./b/../../c/\"",
        "expectedOutput": "\"/c\""
      }
    ],
    "hiddenTestCases": [
      {
        "input": "\"/home/\"",
        "expectedOutput": "\"/home\""
      },
      {
        "input": "\"/../\"",
        "expectedOutput": "\"/\""
      }
    ]
  },
  {
    "id": "p_min_stack",
    "title": "Min Stack",
    "category": "Stack & Queue",
    "difficulty": "Medium",
    "acceptance": "53.4%",
    "companies": [
      "Amazon",
      "Microsoft",
      "TCS Digital"
    ],
    "functionName": "minStackOps",
    "hints": [
      "Maintain two stacks: one for values and one for minimums."
    ],
    "description": "Simulate MinStack with push, pop, and getMin. Given commands, return outputs of all getMin calls.",
    "constraints": [
      "1 <= commands <= 100"
    ],
    "examples": [
      {
        "input": "cmds = [\"push -2\", \"push 0\", \"push -3\", \"getMin\", \"pop\", \"getMin\"]",
        "output": "[-3, -2]"
      }
    ],
    "starterCode": {
      "python": "def minStackOps(cmds: list[str]) -> list[int]:\n    # Write your solution here\n    pass\n",
      "javascript": "function minStackOps(cmds) {\n  // Write your solution here\n}\n",
      "cpp": "#include <vector>\n#include <string>\nusing namespace std;\n\nvector<int> minStackOps(vector<string>& cmds) {\n    // Write your code here\n    return {};\n}\n",
      "java": "class Solution {\n    public int[] minStackOps(String[] cmds) {\n        // Write your code here\n        return new int[]{};\n    }\n}\n",
      "c": "#include <stdio.h>\n#include <stdbool.h>\n\nint* minStackOps(char** cmds, int size, int* returnSize) {\n    // Write your code here\n    return NULL;\n}\n"
    },
    "testCases": [
      {
        "input": "[\"push -2\", \"push 0\", \"push -3\", \"getMin\", \"pop\", \"getMin\"]",
        "expectedOutput": "[-3, -2]"
      },
      {
        "input": "[\"push 1\", \"getMin\"]",
        "expectedOutput": "[1]"
      },
      {
        "input": "[\"push 2\", \"push 1\", \"getMin\", \"pop\", \"getMin\"]",
        "expectedOutput": "[1, 2]"
      },
      {
        "input": "[\"push 5\", \"push 5\", \"getMin\"]",
        "expectedOutput": "[5]"
      }
    ],
    "hiddenTestCases": [
      {
        "input": "[\"push -2\", \"push 0\", \"push -3\", \"getMin\", \"pop\", \"getMin\"]",
        "expectedOutput": "[-3, -2]"
      },
      {
        "input": "[\"push 1\", \"getMin\"]",
        "expectedOutput": "[1]"
      }
    ]
  },
  {
    "id": "p_search_2d_matrix",
    "title": "Search a 2D Matrix",
    "category": "Binary Search",
    "difficulty": "Medium",
    "acceptance": "49.5%",
    "companies": [
      "Amazon",
      "Microsoft",
      "TCS Digital"
    ],
    "functionName": "searchMatrix",
    "hints": [
      "Treat the 2D matrix as a 1D sorted array of size m * n."
    ],
    "description": "Given m x n matrix where each row is sorted and first integer of each row is greater than last of previous row, return true if target exists.",
    "constraints": [
      "m == matrix.length",
      "n == matrix[i].length",
      "1 <= m, n <= 100"
    ],
    "examples": [
      {
        "input": "matrix = [[1,3,5,7],[10,11,16,20],[23,30,34,60]], target = 3",
        "output": "true"
      },
      {
        "input": "matrix = [[1,3,5,7],[10,11,16,20],[23,30,34,60]], target = 13",
        "output": "false"
      }
    ],
    "starterCode": {
      "python": "def searchMatrix(matrix: list[list[int]], target: int) -> bool:\n    # Write your solution here\n    pass\n",
      "javascript": "function searchMatrix(matrix, target) {\n  // Write your solution here\n}\n",
      "cpp": "#include <vector>\n#include <string>\nusing namespace std;\n\nbool searchMatrix(vector<vector<int>>& matrix, int target) {\n    // Write your code here\n    return false;\n}\n",
      "java": "class Solution {\n    public boolean searchMatrix(int[][] matrix, int target) {\n        // Write your code here\n        return false;\n    }\n}\n",
      "c": "#include <stdio.h>\n#include <stdbool.h>\n\nbool searchMatrix(int** matrix, int m, int* n, int target) {\n    // Write your code here\n    return false;\n}\n"
    },
    "testCases": [
      {
        "input": "[[1, 3, 5, 7], [10, 11, 16, 20], [23, 30, 34, 60]], 3",
        "expectedOutput": "true"
      },
      {
        "input": "[[1, 3, 5, 7], [10, 11, 16, 20], [23, 30, 34, 60]], 13",
        "expectedOutput": "false"
      },
      {
        "input": "[[1]], 1",
        "expectedOutput": "true"
      },
      {
        "input": "[[1, 3]], 3",
        "expectedOutput": "true"
      }
    ],
    "hiddenTestCases": [
      {
        "input": "[[1, 3, 5, 7], [10, 11, 16, 20], [23, 30, 34, 60]], 3",
        "expectedOutput": "true"
      },
      {
        "input": "[[1, 3, 5, 7], [10, 11, 16, 20], [23, 30, 34, 60]], 13",
        "expectedOutput": "false"
      }
    ]
  },
  {
    "id": "p_find_min_rotated",
    "title": "Find Minimum in Rotated Sorted Array",
    "category": "Binary Search",
    "difficulty": "Medium",
    "acceptance": "50.1%",
    "companies": [
      "Amazon",
      "Google"
    ],
    "functionName": "findMin",
    "hints": [
      "Compare mid with right. If nums[mid] > nums[right], min is on the right."
    ],
    "description": "Given sorted rotated array of unique elements, return the minimum element in O(log n) time.",
    "constraints": [
      "n == nums.length",
      "1 <= n <= 5000"
    ],
    "examples": [
      {
        "input": "nums = [3,4,5,1,2]",
        "output": "1"
      },
      {
        "input": "nums = [4,5,6,7,0,1,2]",
        "output": "0"
      }
    ],
    "starterCode": {
      "python": "def findMin(nums: list[int]) -> int:\n    # Write your solution here\n    pass\n",
      "javascript": "function findMin(nums) {\n  // Write your solution here\n}\n",
      "cpp": "#include <vector>\n#include <string>\nusing namespace std;\n\nint findMin(vector<int>& nums) {\n    // Write your code here\n    return 0;\n}\n",
      "java": "class Solution {\n    public int findMin(int[] nums) {\n        // Write your code here\n        return 0;\n    }\n}\n",
      "c": "#include <stdio.h>\n#include <stdbool.h>\n\nint findMin(int* nums, int numsSize) {\n    // Write your code here\n    return 0;\n}\n"
    },
    "testCases": [
      {
        "input": "[3, 4, 5, 1, 2]",
        "expectedOutput": "1"
      },
      {
        "input": "[4, 5, 6, 7, 0, 1, 2]",
        "expectedOutput": "0"
      },
      {
        "input": "[11, 13, 15, 17]",
        "expectedOutput": "11"
      },
      {
        "input": "[2, 1]",
        "expectedOutput": "1"
      }
    ],
    "hiddenTestCases": [
      {
        "input": "[3, 4, 5, 1, 2]",
        "expectedOutput": "1"
      },
      {
        "input": "[4, 5, 6, 7, 0, 1, 2]",
        "expectedOutput": "0"
      }
    ]
  },
  {
    "id": "p_first_bad_version",
    "title": "First Bad Version",
    "category": "Binary Search",
    "difficulty": "Easy",
    "acceptance": "44.2%",
    "companies": [
      "Google",
      "Microsoft"
    ],
    "functionName": "firstBadVersion",
    "hints": [
      "Binary search: if isBadVersion(mid) is true, search left half including mid."
    ],
    "description": "Given total versions n and first bad version k, find the first bad version using binary search.",
    "constraints": [
      "1 <= k <= n <= 2^31 - 1"
    ],
    "examples": [
      {
        "input": "n = 5, bad = 4",
        "output": "4"
      },
      {
        "input": "n = 1, bad = 1",
        "output": "1"
      }
    ],
    "starterCode": {
      "python": "def firstBadVersion(n: int, bad: int) -> int:\n    # Write your solution here\n    pass\n",
      "javascript": "function firstBadVersion(n, bad) {\n  // Write your solution here\n}\n",
      "cpp": "#include <vector>\n#include <string>\nusing namespace std;\n\nint firstBadVersion(int n, int bad) {\n    // Write your code here\n    return 1;\n}\n",
      "java": "class Solution {\n    public int firstBadVersion(int n, int bad) {\n        // Write your code here\n        return 1;\n    }\n}\n",
      "c": "#include <stdio.h>\n#include <stdbool.h>\n\nint firstBadVersion(int n, int bad) {\n    // Write your code here\n    return 1;\n}\n"
    },
    "testCases": [
      {
        "input": "5, 4",
        "expectedOutput": "4"
      },
      {
        "input": "1, 1",
        "expectedOutput": "1"
      },
      {
        "input": "10, 7",
        "expectedOutput": "7"
      },
      {
        "input": "2, 1",
        "expectedOutput": "1"
      }
    ],
    "hiddenTestCases": [
      {
        "input": "5, 4",
        "expectedOutput": "4"
      },
      {
        "input": "1, 1",
        "expectedOutput": "1"
      }
    ]
  },
  {
    "id": "p_koko_bananas",
    "title": "Koko Eating Bananas",
    "category": "Binary Search",
    "difficulty": "Medium",
    "acceptance": "51.8%",
    "companies": [
      "Google",
      "Amazon"
    ],
    "functionName": "minEatingSpeed",
    "hints": [
      "Binary search the answer k in range [1, max(piles)]."
    ],
    "description": "Given piles of bananas and h hours, return the minimum integer eating speed k to eat all bananas within h hours.",
    "constraints": [
      "1 <= piles.length <= 10^4",
      "piles.length <= h <= 10^9"
    ],
    "examples": [
      {
        "input": "piles = [3,6,7,11], h = 8",
        "output": "4"
      },
      {
        "input": "piles = [30,11,23,4,20], h = 5",
        "output": "30"
      }
    ],
    "starterCode": {
      "python": "def minEatingSpeed(piles: list[int], h: int) -> int:\n    # Write your solution here\n    pass\n",
      "javascript": "function minEatingSpeed(piles, h) {\n  // Write your solution here\n}\n",
      "cpp": "#include <vector>\n#include <string>\nusing namespace std;\n\nint minEatingSpeed(vector<int>& piles, int h) {\n    // Write your code here\n    return 1;\n}\n",
      "java": "class Solution {\n    public int minEatingSpeed(int[] piles, int h) {\n        // Write your code here\n        return 1;\n    }\n}\n",
      "c": "#include <stdio.h>\n#include <stdbool.h>\n\nint minEatingSpeed(int* piles, int pilesSize, int h) {\n    // Write your code here\n    return 1;\n}\n"
    },
    "testCases": [
      {
        "input": "[3, 6, 7, 11], 8",
        "expectedOutput": "4"
      },
      {
        "input": "[30, 11, 23, 4, 20], 5",
        "expectedOutput": "30"
      },
      {
        "input": "[30, 11, 23, 4, 20], 6",
        "expectedOutput": "23"
      },
      {
        "input": "[3, 3, 3], 3",
        "expectedOutput": "3"
      }
    ],
    "hiddenTestCases": [
      {
        "input": "[3, 6, 7, 11], 8",
        "expectedOutput": "4"
      },
      {
        "input": "[30, 11, 23, 4, 20], 5",
        "expectedOutput": "30"
      }
    ]
  },
  {
    "id": "p_median_two_sorted_arrays",
    "title": "Median of Two Sorted Arrays",
    "category": "Binary Search",
    "difficulty": "Hard",
    "acceptance": "39.4%",
    "companies": [
      "Google",
      "Amazon",
      "Microsoft"
    ],
    "functionName": "findMedianSortedArrays",
    "hints": [
      "Binary search the partition index on the smaller array."
    ],
    "description": "Given two sorted arrays nums1 and nums2, return the median of the two sorted arrays in O(log (m+n)) time.",
    "constraints": [
      "nums1.length == m",
      "nums2.length == n",
      "0 <= m, n <= 1000"
    ],
    "examples": [
      {
        "input": "nums1 = [1,3], nums2 = [2]",
        "output": "2.0"
      },
      {
        "input": "nums1 = [1,2], nums2 = [3,4]",
        "output": "2.5"
      }
    ],
    "starterCode": {
      "python": "def findMedianSortedArrays(nums1: list[int], nums2: list[int]) -> float:\n    # Write your solution here\n    pass\n",
      "javascript": "function findMedianSortedArrays(nums1, nums2) {\n  // Write your solution here\n}\n",
      "cpp": "#include <vector>\n#include <string>\nusing namespace std;\n\ndouble findMedianSortedArrays(vector<int>& nums1, vector<int>& nums2) {\n    // Write your code here\n    return 0.0;\n}\n",
      "java": "class Solution {\n    public double findMedianSortedArrays(int[] nums1, int[] nums2) {\n        // Write your code here\n        return 0.0;\n    }\n}\n",
      "c": "#include <stdio.h>\n#include <stdbool.h>\n\ndouble findMedianSortedArrays(int* nums1, int m, int* nums2, int n) {\n    // Write your code here\n    return 0.0;\n}\n"
    },
    "testCases": [
      {
        "input": "[1, 3], [2]",
        "expectedOutput": "2.0"
      },
      {
        "input": "[1, 2], [3, 4]",
        "expectedOutput": "2.5"
      },
      {
        "input": "[0, 0], [0, 0]",
        "expectedOutput": "0.0"
      },
      {
        "input": "[], [1]",
        "expectedOutput": "1.0"
      }
    ],
    "hiddenTestCases": [
      {
        "input": "[1, 3], [2]",
        "expectedOutput": "2.0"
      },
      {
        "input": "[1, 2], [3, 4]",
        "expectedOutput": "2.5"
      }
    ]
  },
  {
    "id": "p_peak_index_mountain",
    "title": "Peak Index in a Mountain Array",
    "category": "Binary Search",
    "difficulty": "Medium",
    "acceptance": "69.1%",
    "companies": [
      "Amazon",
      "Google"
    ],
    "functionName": "peakIndexInMountainArray",
    "hints": [
      "If arr[mid] < arr[mid + 1], peak is on right; else on left."
    ],
    "description": "Find the peak index in a mountain array in O(log n) time.",
    "constraints": [
      "3 <= arr.length <= 10^5"
    ],
    "examples": [
      {
        "input": "arr = [0,1,0]",
        "output": "1"
      },
      {
        "input": "arr = [0,2,1,0]",
        "output": "1"
      }
    ],
    "starterCode": {
      "python": "def peakIndexInMountainArray(arr: list[int]) -> int:\n    # Write your solution here\n    pass\n",
      "javascript": "function peakIndexInMountainArray(arr) {\n  // Write your solution here\n}\n",
      "cpp": "#include <vector>\n#include <string>\nusing namespace std;\n\nint peakIndexInMountainArray(vector<int>& arr) {\n    // Write your code here\n    return 0;\n}\n",
      "java": "class Solution {\n    public int peakIndexInMountainArray(int[] arr) {\n        // Write your code here\n        return 0;\n    }\n}\n",
      "c": "#include <stdio.h>\n#include <stdbool.h>\n\nint peakIndexInMountainArray(int* arr, int arrSize) {\n    // Write your code here\n    return 0;\n}\n"
    },
    "testCases": [
      {
        "input": "[0, 1, 0]",
        "expectedOutput": "1"
      },
      {
        "input": "[0, 2, 1, 0]",
        "expectedOutput": "1"
      },
      {
        "input": "[0, 10, 5, 2]",
        "expectedOutput": "1"
      },
      {
        "input": "[3, 4, 5, 1]",
        "expectedOutput": "2"
      }
    ],
    "hiddenTestCases": [
      {
        "input": "[0, 1, 0]",
        "expectedOutput": "1"
      },
      {
        "input": "[0, 2, 1, 0]",
        "expectedOutput": "1"
      }
    ]
  },
  {
    "id": "p_ship_packages",
    "title": "Capacity To Ship Packages Within D Days",
    "category": "Binary Search",
    "difficulty": "Medium",
    "acceptance": "68.7%",
    "companies": [
      "Google",
      "Amazon"
    ],
    "functionName": "shipWithinDays",
    "hints": [
      "Binary search capacity between max(weights) and sum(weights)."
    ],
    "description": "Return the least package capacity of the ship that will result in all packages being shipped within `days` days.",
    "constraints": [
      "1 <= days <= weights.length <= 5 * 10^4"
    ],
    "examples": [
      {
        "input": "weights = [1,2,3,4,5,6,7,8,9,10], days = 5",
        "output": "15"
      },
      {
        "input": "weights = [3,2,2,4,1,4], days = 3",
        "output": "6"
      }
    ],
    "starterCode": {
      "python": "def shipWithinDays(weights: list[int], days: int) -> int:\n    # Write your solution here\n    pass\n",
      "javascript": "function shipWithinDays(weights, days) {\n  // Write your solution here\n}\n",
      "cpp": "#include <vector>\n#include <string>\nusing namespace std;\n\nint shipWithinDays(vector<int>& weights, int days) {\n    // Write your code here\n    return 0;\n}\n",
      "java": "class Solution {\n    public int shipWithinDays(int[] weights, int days) {\n        // Write your code here\n        return 0;\n    }\n}\n",
      "c": "#include <stdio.h>\n#include <stdbool.h>\n\nint shipWithinDays(int* weights, int size, int days) {\n    // Write your code here\n    return 0;\n}\n"
    },
    "testCases": [
      {
        "input": "[1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 5",
        "expectedOutput": "15"
      },
      {
        "input": "[3, 2, 2, 4, 1, 4], 3",
        "expectedOutput": "6"
      },
      {
        "input": "[1, 2, 3, 1, 1], 4",
        "expectedOutput": "3"
      },
      {
        "input": "[10], 1",
        "expectedOutput": "10"
      }
    ],
    "hiddenTestCases": [
      {
        "input": "[1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 5",
        "expectedOutput": "15"
      },
      {
        "input": "[3, 2, 2, 4, 1, 4], 3",
        "expectedOutput": "6"
      }
    ]
  },
  {
    "id": "p_remove_nth_node",
    "title": "Remove Nth Node From End of List",
    "category": "Linked Lists",
    "difficulty": "Medium",
    "acceptance": "43.5%",
    "companies": [
      "Amazon",
      "Microsoft",
      "TCS Digital"
    ],
    "functionName": "removeNthFromEnd",
    "hints": [
      "Fast pointer advances n steps ahead of slow pointer."
    ],
    "description": "Given the head of a linked list as array of values, remove the nth node from the end of the list and return its head array.",
    "constraints": [
      "The number of nodes in the list is sz.",
      "1 <= sz <= 30",
      "1 <= n <= sz"
    ],
    "examples": [
      {
        "input": "head = [1,2,3,4,5], n = 2",
        "output": "[1,2,3,5]"
      },
      {
        "input": "head = [1], n = 1",
        "output": "[]"
      }
    ],
    "starterCode": {
      "python": "def removeNthFromEnd(head: list[int], n: int) -> list[int]:\n    # Write your solution here\n    pass\n",
      "javascript": "function removeNthFromEnd(head, n) {\n  // Write your solution here\n}\n",
      "cpp": "#include <vector>\n#include <string>\nusing namespace std;\n\nvector<int> removeNthFromEnd(vector<int>& head, int n) {\n    // Write your code here\n    return {};\n}\n",
      "java": "class Solution {\n    public int[] removeNthFromEnd(int[] head, int n) {\n        // Write your code here\n        return new int[]{};\n    }\n}\n",
      "c": "#include <stdio.h>\n#include <stdbool.h>\n\nint* removeNthFromEnd(int* head, int size, int n, int* returnSize) {\n    // Write your code here\n    return NULL;\n}\n"
    },
    "testCases": [
      {
        "input": "[1, 2, 3, 4, 5], 2",
        "expectedOutput": "[1, 2, 3, 5]"
      },
      {
        "input": "[1], 1",
        "expectedOutput": "[]"
      },
      {
        "input": "[1, 2], 1",
        "expectedOutput": "[1]"
      },
      {
        "input": "[1, 2], 2",
        "expectedOutput": "[2]"
      }
    ],
    "hiddenTestCases": [
      {
        "input": "[1, 2, 3, 4, 5], 2",
        "expectedOutput": "[1, 2, 3, 5]"
      },
      {
        "input": "[1], 1",
        "expectedOutput": "[]"
      }
    ]
  },
  {
    "id": "p_middle_linked_list",
    "title": "Middle of the Linked List",
    "category": "Linked Lists",
    "difficulty": "Easy",
    "acceptance": "77.1%",
    "companies": [
      "TCS",
      "Infosys",
      "Wipro",
      "Zoho"
    ],
    "functionName": "middleNode",
    "hints": [
      "Fast pointer moves 2 steps, slow pointer moves 1 step."
    ],
    "description": "Given the head of a singly linked list as values, return the values starting from the middle node.",
    "constraints": [
      "The number of nodes in the list is in the range [1, 100]."
    ],
    "examples": [
      {
        "input": "head = [1,2,3,4,5]",
        "output": "[3,4,5]"
      },
      {
        "input": "head = [1,2,3,4,5,6]",
        "output": "[4,5,6]"
      }
    ],
    "starterCode": {
      "python": "def middleNode(head: list[int]) -> list[int]:\n    # Write your solution here\n    pass\n",
      "javascript": "function middleNode(head) {\n  // Write your solution here\n}\n",
      "cpp": "#include <vector>\n#include <string>\nusing namespace std;\n\nvector<int> middleNode(vector<int>& head) {\n    // Write your code here\n    return {};\n}\n",
      "java": "class Solution {\n    public int[] middleNode(int[] head) {\n        // Write your code here\n        return new int[]{};\n    }\n}\n",
      "c": "#include <stdio.h>\n#include <stdbool.h>\n\nint* middleNode(int* head, int size, int* returnSize) {\n    // Write your code here\n    return NULL;\n}\n"
    },
    "testCases": [
      {
        "input": "[1, 2, 3, 4, 5]",
        "expectedOutput": "[3, 4, 5]"
      },
      {
        "input": "[1, 2, 3, 4, 5, 6]",
        "expectedOutput": "[4, 5, 6]"
      },
      {
        "input": "[1]",
        "expectedOutput": "[1]"
      },
      {
        "input": "[1, 2]",
        "expectedOutput": "[2]"
      }
    ],
    "hiddenTestCases": [
      {
        "input": "[1, 2, 3, 4, 5]",
        "expectedOutput": "[3, 4, 5]"
      },
      {
        "input": "[1, 2, 3, 4, 5, 6]",
        "expectedOutput": "[4, 5, 6]"
      }
    ]
  },
  {
    "id": "p_palindrome_linked_list",
    "title": "Palindrome Linked List",
    "category": "Linked Lists",
    "difficulty": "Easy",
    "acceptance": "51.2%",
    "companies": [
      "Amazon",
      "TCS",
      "Infosys"
    ],
    "functionName": "isPalindromeList",
    "hints": [
      "Find middle, reverse second half, and compare values."
    ],
    "description": "Given the head values of a singly linked list, return true if it is a palindrome.",
    "constraints": [
      "1 <= nodes <= 10^5"
    ],
    "examples": [
      {
        "input": "head = [1,2,2,1]",
        "output": "true"
      },
      {
        "input": "head = [1,2]",
        "output": "false"
      }
    ],
    "starterCode": {
      "python": "def isPalindromeList(head: list[int]) -> bool:\n    # Write your solution here\n    pass\n",
      "javascript": "function isPalindromeList(head) {\n  // Write your solution here\n}\n",
      "cpp": "#include <vector>\n#include <string>\nusing namespace std;\n\nbool isPalindromeList(vector<int>& head) {\n    // Write your code here\n    return false;\n}\n",
      "java": "class Solution {\n    public boolean isPalindromeList(int[] head) {\n        // Write your code here\n        return false;\n    }\n}\n",
      "c": "#include <stdio.h>\n#include <stdbool.h>\n\nbool isPalindromeList(int* head, int size) {\n    // Write your code here\n    return false;\n}\n"
    },
    "testCases": [
      {
        "input": "[1, 2, 2, 1]",
        "expectedOutput": "true"
      },
      {
        "input": "[1, 2]",
        "expectedOutput": "false"
      },
      {
        "input": "[1]",
        "expectedOutput": "true"
      },
      {
        "input": "[1, 2, 3, 2, 1]",
        "expectedOutput": "true"
      }
    ],
    "hiddenTestCases": [
      {
        "input": "[1, 2, 2, 1]",
        "expectedOutput": "true"
      },
      {
        "input": "[1, 2]",
        "expectedOutput": "false"
      }
    ]
  },
  {
    "id": "p_reorder_list",
    "title": "Reorder List",
    "category": "Linked Lists",
    "difficulty": "Medium",
    "acceptance": "55.4%",
    "companies": [
      "Amazon",
      "Microsoft"
    ],
    "functionName": "reorderList",
    "hints": [
      "Find middle, reverse second half, then interleave two halves."
    ],
    "description": "Reorder list to L0 -> Ln -> L1 -> Ln-1 -> L2 -> Ln-2... and return values.",
    "constraints": [
      "1 <= nodes <= 5 * 10^4"
    ],
    "examples": [
      {
        "input": "head = [1,2,3,4]",
        "output": "[1,4,2,3]"
      },
      {
        "input": "head = [1,2,3,4,5]",
        "output": "[1,5,2,4,3]"
      }
    ],
    "starterCode": {
      "python": "def reorderList(head: list[int]) -> list[int]:\n    # Write your solution here\n    pass\n",
      "javascript": "function reorderList(head) {\n  // Write your solution here\n}\n",
      "cpp": "#include <vector>\n#include <string>\nusing namespace std;\n\nvector<int> reorderList(vector<int>& head) {\n    // Write your code here\n    return {};\n}\n",
      "java": "class Solution {\n    public int[] reorderList(int[] head) {\n        // Write your code here\n        return new int[]{};\n    }\n}\n",
      "c": "#include <stdio.h>\n#include <stdbool.h>\n\nint* reorderList(int* head, int size, int* returnSize) {\n    // Write your code here\n    return NULL;\n}\n"
    },
    "testCases": [
      {
        "input": "[1, 2, 3, 4]",
        "expectedOutput": "[1, 4, 2, 3]"
      },
      {
        "input": "[1, 2, 3, 4, 5]",
        "expectedOutput": "[1, 5, 2, 4, 3]"
      },
      {
        "input": "[1]",
        "expectedOutput": "[1]"
      },
      {
        "input": "[1, 2]",
        "expectedOutput": "[1, 2]"
      }
    ],
    "hiddenTestCases": [
      {
        "input": "[1, 2, 3, 4]",
        "expectedOutput": "[1, 4, 2, 3]"
      },
      {
        "input": "[1, 2, 3, 4, 5]",
        "expectedOutput": "[1, 5, 2, 4, 3]"
      }
    ]
  },
  {
    "id": "p_intersection_two_linked_lists",
    "title": "Intersection of Two Linked Lists",
    "category": "Linked Lists",
    "difficulty": "Easy",
    "acceptance": "56.8%",
    "companies": [
      "Amazon",
      "Microsoft",
      "TCS"
    ],
    "functionName": "getIntersectionNodeVal",
    "hints": [
      "Two pointers traversing A then B and B then A equalize path lengths."
    ],
    "description": "Given two linked list values and common tail index, return value of intersection node or 0 if none.",
    "constraints": [
      "1 <= nodes <= 3 * 10^4"
    ],
    "examples": [
      {
        "input": "listA = [4,1,8,4,5], listB = [5,6,1,8,4,5]",
        "output": "8"
      }
    ],
    "starterCode": {
      "python": "def getIntersectionNodeVal(listA: list[int], listB: list[int]) -> int:\n    # Write your solution here\n    pass\n",
      "javascript": "function getIntersectionNodeVal(listA, listB) {\n  // Write your solution here\n}\n",
      "cpp": "#include <vector>\n#include <string>\nusing namespace std;\n\nint getIntersectionNodeVal(vector<int>& listA, vector<int>& listB) {\n    // Write your code here\n    return 0;\n}\n",
      "java": "class Solution {\n    public int getIntersectionNodeVal(int[] listA, int[] listB) {\n        // Write your code here\n        return 0;\n    }\n}\n",
      "c": "#include <stdio.h>\n#include <stdbool.h>\n\nint getIntersectionNodeVal(int* a, int sa, int* b, int sb) {\n    // Write your code here\n    return 0;\n}\n"
    },
    "testCases": [
      {
        "input": "[4, 1, 8, 4, 5], [5, 6, 1, 8, 4, 5]",
        "expectedOutput": "8"
      },
      {
        "input": "[1, 9, 1, 2, 4], [3, 2, 4]",
        "expectedOutput": "2"
      },
      {
        "input": "[2, 6, 4], [1, 5]",
        "expectedOutput": "0"
      },
      {
        "input": "[1], [1]",
        "expectedOutput": "1"
      }
    ],
    "hiddenTestCases": [
      {
        "input": "[4, 1, 8, 4, 5], [5, 6, 1, 8, 4, 5]",
        "expectedOutput": "8"
      },
      {
        "input": "[1, 9, 1, 2, 4], [3, 2, 4]",
        "expectedOutput": "2"
      }
    ]
  },
  {
    "id": "p_add_two_numbers",
    "title": "Add Two Numbers",
    "category": "Linked Lists",
    "difficulty": "Medium",
    "acceptance": "41.8%",
    "companies": [
      "Amazon",
      "Microsoft",
      "Google"
    ],
    "functionName": "addTwoNumbers",
    "hints": [
      "Add node by node tracking carry."
    ],
    "description": "Add two numbers represented as reversed linked list digits. Return sum as reversed digit array.",
    "constraints": [
      "1 <= digits <= 100"
    ],
    "examples": [
      {
        "input": "l1 = [2,4,3], l2 = [5,6,4]",
        "output": "[7,0,8]"
      },
      {
        "input": "l1 = [0], l2 = [0]",
        "output": "[0]"
      }
    ],
    "starterCode": {
      "python": "def addTwoNumbers(l1: list[int], l2: list[int]) -> list[int]:\n    # Write your solution here\n    pass\n",
      "javascript": "function addTwoNumbers(l1, l2) {\n  // Write your solution here\n}\n",
      "cpp": "#include <vector>\n#include <string>\nusing namespace std;\n\nvector<int> addTwoNumbers(vector<int>& l1, vector<int>& l2) {\n    // Write your code here\n    return {};\n}\n",
      "java": "class Solution {\n    public int[] addTwoNumbers(int[] l1, int[] l2) {\n        // Write your code here\n        return new int[]{};\n    }\n}\n",
      "c": "#include <stdio.h>\n#include <stdbool.h>\n\nint* addTwoNumbers(int* l1, int s1, int* l2, int s2, int* returnSize) {\n    // Write your code here\n    return NULL;\n}\n"
    },
    "testCases": [
      {
        "input": "[2, 4, 3], [5, 6, 4]",
        "expectedOutput": "[7, 0, 8]"
      },
      {
        "input": "[0], [0]",
        "expectedOutput": "[0]"
      },
      {
        "input": "[9, 9, 9, 9], [9, 9]",
        "expectedOutput": "[8, 9, 0, 0, 1]"
      },
      {
        "input": "[1], [9]",
        "expectedOutput": "[0, 1]"
      }
    ],
    "hiddenTestCases": [
      {
        "input": "[2, 4, 3], [5, 6, 4]",
        "expectedOutput": "[7, 0, 8]"
      },
      {
        "input": "[0], [0]",
        "expectedOutput": "[0]"
      }
    ]
  },
  {
    "id": "p_merge_k_sorted_lists",
    "title": "Merge k Sorted Lists",
    "category": "Linked Lists",
    "difficulty": "Hard",
    "acceptance": "51.1%",
    "companies": [
      "Amazon",
      "Google",
      "Microsoft"
    ],
    "functionName": "mergeKLists",
    "hints": [
      "Divide and conquer pairwise merging or min-heap."
    ],
    "description": "Merge k sorted linked lists and return it as one sorted array.",
    "constraints": [
      "0 <= k <= 10^4",
      "0 <= total elements <= 10^4"
    ],
    "examples": [
      {
        "input": "lists = [[1,4,5],[1,3,4],[2,6]]",
        "output": "[1,1,2,3,4,4,5,6]"
      },
      {
        "input": "lists = []",
        "output": "[]"
      }
    ],
    "starterCode": {
      "python": "def mergeKLists(lists: list[list[int]]) -> list[int]:\n    # Write your solution here\n    pass\n",
      "javascript": "function mergeKLists(lists) {\n  // Write your solution here\n}\n",
      "cpp": "#include <vector>\n#include <string>\nusing namespace std;\n\nvector<int> mergeKLists(vector<vector<int>>& lists) {\n    // Write your code here\n    return {};\n}\n",
      "java": "class Solution {\n    public int[] mergeKLists(int[][] lists) {\n        // Write your code here\n        return new int[]{};\n    }\n}\n",
      "c": "#include <stdio.h>\n#include <stdbool.h>\n\nint* mergeKLists(int** lists, int k, int* colSizes, int* returnSize) {\n    // Write your code here\n    return NULL;\n}\n"
    },
    "testCases": [
      {
        "input": "[[1, 4, 5], [1, 3, 4], [2, 6]]",
        "expectedOutput": "[1, 1, 2, 3, 4, 4, 5, 6]"
      },
      {
        "input": "[]",
        "expectedOutput": "[]"
      },
      {
        "input": "[[]]",
        "expectedOutput": "[]"
      },
      {
        "input": "[[1], [0]]",
        "expectedOutput": "[0, 1]"
      }
    ],
    "hiddenTestCases": [
      {
        "input": "[[1, 4, 5], [1, 3, 4], [2, 6]]",
        "expectedOutput": "[1, 1, 2, 3, 4, 4, 5, 6]"
      },
      {
        "input": "[]",
        "expectedOutput": "[]"
      }
    ]
  },
  {
    "id": "p_same_tree",
    "title": "Same Tree",
    "category": "Trees & BST",
    "difficulty": "Easy",
    "acceptance": "60.4%",
    "companies": [
      "Amazon",
      "Google",
      "TCS"
    ],
    "functionName": "isSameTree",
    "hints": [
      "Recursive comparison of root and both children."
    ],
    "description": "Given pre-order serialized binary trees p and q, return true if they are structurally identical with equal values.",
    "constraints": [
      "0 <= nodes <= 100"
    ],
    "examples": [
      {
        "input": "p = [1,2,3], q = [1,2,3]",
        "output": "true"
      },
      {
        "input": "p = [1,2], q = [1,null,2]",
        "output": "false"
      }
    ],
    "starterCode": {
      "python": "def isSameTree(p: list, q: list) -> bool:\n    # Write your solution here\n    pass\n",
      "javascript": "function isSameTree(p, q) {\n  // Write your solution here\n}\n",
      "cpp": "#include <vector>\n#include <string>\nusing namespace std;\n\nbool isSameTree(vector<int>& p, vector<int>& q) {\n    // Write your code here\n    return false;\n}\n",
      "java": "class Solution {\n    public boolean isSameTree(Integer[] p, Integer[] q) {\n        // Write your code here\n        return false;\n    }\n}\n",
      "c": "#include <stdio.h>\n#include <stdbool.h>\n\nbool isSameTree(int* p, int sp, int* q, int sq) {\n    // Write your code here\n    return false;\n}\n"
    },
    "testCases": [
      {
        "input": "[1, 2, 3], [1, 2, 3]",
        "expectedOutput": "true"
      },
      {
        "input": "[1, 2], [1, null, 2]",
        "expectedOutput": "false"
      },
      {
        "input": "[1, 2, 1], [1, 1, 2]",
        "expectedOutput": "false"
      },
      {
        "input": "[], []",
        "expectedOutput": "true"
      }
    ],
    "hiddenTestCases": [
      {
        "input": "[1, 2, 3], [1, 2, 3]",
        "expectedOutput": "true"
      },
      {
        "input": "[1, 2], [1, null, 2]",
        "expectedOutput": "false"
      }
    ]
  },
  {
    "id": "p_subtree_of_another_tree",
    "title": "Subtree of Another Tree",
    "category": "Trees & BST",
    "difficulty": "Easy",
    "acceptance": "47.2%",
    "companies": [
      "Amazon",
      "Microsoft"
    ],
    "functionName": "isSubtree",
    "hints": [
      "Check isSameTree for every node in root."
    ],
    "description": "Given two binary trees root and subRoot, return true if there is a subtree of root with the same structure and node values of subRoot.",
    "constraints": [
      "1 <= nodes <= 2000"
    ],
    "examples": [
      {
        "input": "root = [3,4,5,1,2], subRoot = [4,1,2]",
        "output": "true"
      }
    ],
    "starterCode": {
      "python": "def isSubtree(root: list, subRoot: list) -> bool:\n    # Write your solution here\n    pass\n",
      "javascript": "function isSubtree(root, subRoot) {\n  // Write your solution here\n}\n",
      "cpp": "#include <vector>\n#include <string>\nusing namespace std;\n\nbool isSubtree(vector<int>& root, vector<int>& subRoot) {\n    // Write your code here\n    return false;\n}\n",
      "java": "class Solution {\n    public boolean isSubtree(Integer[] root, Integer[] subRoot) {\n        // Write your code here\n        return false;\n    }\n}\n",
      "c": "#include <stdio.h>\n#include <stdbool.h>\n\nbool isSubtree(int* r, int sr, int* s, int ss) {\n    // Write your code here\n    return false;\n}\n"
    },
    "testCases": [
      {
        "input": "[3, 4, 5, 1, 2], [4, 1, 2]",
        "expectedOutput": "true"
      },
      {
        "input": "[3, 4, 5, 1, 2, null, null, null, null, 0], [4, 1, 2]",
        "expectedOutput": "false"
      },
      {
        "input": "[1], [1]",
        "expectedOutput": "true"
      },
      {
        "input": "[1, 2], [2]",
        "expectedOutput": "true"
      }
    ],
    "hiddenTestCases": [
      {
        "input": "[3, 4, 5, 1, 2], [4, 1, 2]",
        "expectedOutput": "true"
      },
      {
        "input": "[3, 4, 5, 1, 2, null, null, null, null, 0], [4, 1, 2]",
        "expectedOutput": "false"
      }
    ]
  },
  {
    "id": "p_lowest_common_ancestor_bst",
    "title": "Lowest Common Ancestor of a BST",
    "category": "Trees & BST",
    "difficulty": "Medium",
    "acceptance": "64.1%",
    "companies": [
      "Amazon",
      "Microsoft"
    ],
    "functionName": "lowestCommonAncestor",
    "hints": [
      "Use BST property: if p and q are on opposite sides of root, root is LCA."
    ],
    "description": "Find lowest common ancestor (LCA) node value of two given values p and q in a BST.",
    "constraints": [
      "2 <= nodes <= 10^5"
    ],
    "examples": [
      {
        "input": "root = [6,2,8,0,4,7,9,null,null,3,5], p = 2, q = 8",
        "output": "6"
      }
    ],
    "starterCode": {
      "python": "def lowestCommonAncestor(root: list, p: int, q: int) -> int:\n    # Write your solution here\n    pass\n",
      "javascript": "function lowestCommonAncestor(root, p, q) {\n  // Write your solution here\n}\n",
      "cpp": "#include <vector>\n#include <string>\nusing namespace std;\n\nint lowestCommonAncestor(vector<int>& root, int p, int q) {\n    // Write your code here\n    return 0;\n}\n",
      "java": "class Solution {\n    public int lowestCommonAncestor(Integer[] root, int p, int q) {\n        // Write your code here\n        return 0;\n    }\n}\n",
      "c": "#include <stdio.h>\n#include <stdbool.h>\n\nint lowestCommonAncestor(int* r, int sr, int p, int q) {\n    // Write your code here\n    return 0;\n}\n"
    },
    "testCases": [
      {
        "input": "[6, 2, 8, 0, 4, 7, 9, null, null, 3, 5], 2, 8",
        "expectedOutput": "6"
      },
      {
        "input": "[6, 2, 8, 0, 4, 7, 9, null, null, 3, 5], 2, 4",
        "expectedOutput": "2"
      },
      {
        "input": "[2, 1], 2, 1",
        "expectedOutput": "2"
      },
      {
        "input": "[3, 1, 4, null, 2], 2, 4",
        "expectedOutput": "3"
      }
    ],
    "hiddenTestCases": [
      {
        "input": "[6, 2, 8, 0, 4, 7, 9, null, null, 3, 5], 2, 8",
        "expectedOutput": "6"
      },
      {
        "input": "[6, 2, 8, 0, 4, 7, 9, null, null, 3, 5], 2, 4",
        "expectedOutput": "2"
      }
    ]
  },
  {
    "id": "p_level_order_traversal",
    "title": "Binary Tree Level Order Traversal",
    "category": "Trees & BST",
    "difficulty": "Medium",
    "acceptance": "66.5%",
    "companies": [
      "Amazon",
      "Microsoft",
      "TCS Digital"
    ],
    "functionName": "levelOrder",
    "hints": [
      "BFS queue processing level by level."
    ],
    "description": "Return level order traversal of binary tree node values as a flattened list of level values.",
    "constraints": [
      "0 <= nodes <= 2000"
    ],
    "examples": [
      {
        "input": "root = [3,9,20,null,null,15,7]",
        "output": "[[3],[9,20],[15,7]]"
      }
    ],
    "starterCode": {
      "python": "def levelOrder(root: list) -> list:\n    # Write your solution here\n    pass\n",
      "javascript": "function levelOrder(root) {\n  // Write your solution here\n}\n",
      "cpp": "#include <vector>\n#include <string>\nusing namespace std;\n\nvector<vector<int>> levelOrder(vector<int>& root) {\n    // Write your code here\n    return {};\n}\n",
      "java": "class Solution {\n    public List<List<Integer>> levelOrder(Integer[] root) {\n        // Write your code here\n        return new ArrayList<>();\n    }\n}\n",
      "c": "#include <stdio.h>\n#include <stdbool.h>\n\nint* levelOrder(int* r, int sr) {\n    // Write your code here\n    return NULL;\n}\n"
    },
    "testCases": [
      {
        "input": "[3, 9, 20, null, null, 15, 7]",
        "expectedOutput": "[[3], [9, 20], [15, 7]]"
      },
      {
        "input": "[1]",
        "expectedOutput": "[[1]]"
      },
      {
        "input": "[]",
        "expectedOutput": "[]"
      },
      {
        "input": "[1, 2, 3]",
        "expectedOutput": "[[1], [2, 3]]"
      }
    ],
    "hiddenTestCases": [
      {
        "input": "[3, 9, 20, null, null, 15, 7]",
        "expectedOutput": "[[3], [9, 20], [15, 7]]"
      },
      {
        "input": "[1]",
        "expectedOutput": "[[1]]"
      }
    ]
  },
  {
    "id": "p_validate_bst",
    "title": "Validate Binary Search Tree",
    "category": "Trees & BST",
    "difficulty": "Medium",
    "acceptance": "32.8%",
    "companies": [
      "Amazon",
      "Microsoft",
      "Google"
    ],
    "functionName": "isValidBST",
    "hints": [
      "In-order traversal must be strictly increasing, or use (min_val, max_val) ranges."
    ],
    "description": "Given binary tree array, return true if it is a valid binary search tree (BST).",
    "constraints": [
      "1 <= nodes <= 10^4"
    ],
    "examples": [
      {
        "input": "root = [2,1,3]",
        "output": "true"
      },
      {
        "input": "root = [5,1,4,null,null,3,6]",
        "output": "false"
      }
    ],
    "starterCode": {
      "python": "def isValidBST(root: list) -> bool:\n    # Write your solution here\n    pass\n",
      "javascript": "function isValidBST(root) {\n  // Write your solution here\n}\n",
      "cpp": "#include <vector>\n#include <string>\nusing namespace std;\n\nbool isValidBST(vector<int>& root) {\n    // Write your code here\n    return false;\n}\n",
      "java": "class Solution {\n    public boolean isValidBST(Integer[] root) {\n        // Write your code here\n        return false;\n    }\n}\n",
      "c": "#include <stdio.h>\n#include <stdbool.h>\n\nbool isValidBST(int* r, int sr) {\n    // Write your code here\n    return false;\n}\n"
    },
    "testCases": [
      {
        "input": "[2, 1, 3]",
        "expectedOutput": "true"
      },
      {
        "input": "[5, 1, 4, null, null, 3, 6]",
        "expectedOutput": "false"
      },
      {
        "input": "[1]",
        "expectedOutput": "true"
      },
      {
        "input": "[2, 2, 2]",
        "expectedOutput": "false"
      }
    ],
    "hiddenTestCases": [
      {
        "input": "[2, 1, 3]",
        "expectedOutput": "true"
      },
      {
        "input": "[5, 1, 4, null, null, 3, 6]",
        "expectedOutput": "false"
      }
    ]
  },
  {
    "id": "p_kth_smallest_bst",
    "title": "Kth Smallest Element in a BST",
    "category": "Trees & BST",
    "difficulty": "Medium",
    "acceptance": "71.4%",
    "companies": [
      "Amazon",
      "Google"
    ],
    "functionName": "kthSmallest",
    "hints": [
      "In-order traversal visits BST elements in sorted order."
    ],
    "description": "Given the root of a binary search tree and an integer k, return the kth smallest value (1-indexed) in the tree.",
    "constraints": [
      "1 <= k <= nodes <= 10^4"
    ],
    "examples": [
      {
        "input": "root = [3,1,4,null,2], k = 1",
        "output": "1"
      },
      {
        "input": "root = [5,3,6,2,4,null,null,1], k = 3",
        "output": "3"
      }
    ],
    "starterCode": {
      "python": "def kthSmallest(root: list, k: int) -> int:\n    # Write your solution here\n    pass\n",
      "javascript": "function kthSmallest(root, k) {\n  // Write your solution here\n}\n",
      "cpp": "#include <vector>\n#include <string>\nusing namespace std;\n\nint kthSmallest(vector<int>& root, int k) {\n    // Write your code here\n    return 0;\n}\n",
      "java": "class Solution {\n    public int kthSmallest(Integer[] root, int k) {\n        // Write your code here\n        return 0;\n    }\n}\n",
      "c": "#include <stdio.h>\n#include <stdbool.h>\n\nint kthSmallest(int* r, int sr, int k) {\n    // Write your code here\n    return 0;\n}\n"
    },
    "testCases": [
      {
        "input": "[3, 1, 4, null, 2], 1",
        "expectedOutput": "1"
      },
      {
        "input": "[5, 3, 6, 2, 4, null, null, 1], 3",
        "expectedOutput": "3"
      },
      {
        "input": "[1], 1",
        "expectedOutput": "1"
      },
      {
        "input": "[2, 1, 3], 2",
        "expectedOutput": "2"
      }
    ],
    "hiddenTestCases": [
      {
        "input": "[3, 1, 4, null, 2], 1",
        "expectedOutput": "1"
      },
      {
        "input": "[5, 3, 6, 2, 4, null, null, 1], 3",
        "expectedOutput": "3"
      }
    ]
  },
  {
    "id": "p_diameter_binary_tree",
    "title": "Diameter of Binary Tree",
    "category": "Trees & BST",
    "difficulty": "Easy",
    "acceptance": "59.3%",
    "companies": [
      "Amazon",
      "Google",
      "TCS"
    ],
    "functionName": "diameterOfBinaryTree",
    "hints": [
      "Max diameter at node = left_height + right_height."
    ],
    "description": "Return the length of the diameter of the tree (longest path between any two nodes).",
    "constraints": [
      "1 <= nodes <= 10^4"
    ],
    "examples": [
      {
        "input": "root = [1,2,3,4,5]",
        "output": "3"
      },
      {
        "input": "root = [1,2]",
        "output": "1"
      }
    ],
    "starterCode": {
      "python": "def diameterOfBinaryTree(root: list) -> int:\n    # Write your solution here\n    pass\n",
      "javascript": "function diameterOfBinaryTree(root) {\n  // Write your solution here\n}\n",
      "cpp": "#include <vector>\n#include <string>\nusing namespace std;\n\nint diameterOfBinaryTree(vector<int>& root) {\n    // Write your code here\n    return 0;\n}\n",
      "java": "class Solution {\n    public int diameterOfBinaryTree(Integer[] root) {\n        // Write your code here\n        return 0;\n    }\n}\n",
      "c": "#include <stdio.h>\n#include <stdbool.h>\n\nint diameterOfBinaryTree(int* r, int sr) {\n    // Write your code here\n    return 0;\n}\n"
    },
    "testCases": [
      {
        "input": "[1, 2, 3, 4, 5]",
        "expectedOutput": "3"
      },
      {
        "input": "[1, 2]",
        "expectedOutput": "1"
      },
      {
        "input": "[1]",
        "expectedOutput": "0"
      },
      {
        "input": "[1, 2, 3]",
        "expectedOutput": "2"
      }
    ],
    "hiddenTestCases": [
      {
        "input": "[1, 2, 3, 4, 5]",
        "expectedOutput": "3"
      },
      {
        "input": "[1, 2]",
        "expectedOutput": "1"
      }
    ]
  },
  {
    "id": "p_symmetric_tree",
    "title": "Symmetric Tree",
    "category": "Trees & BST",
    "difficulty": "Easy",
    "acceptance": "55.8%",
    "companies": [
      "Amazon",
      "Microsoft",
      "TCS"
    ],
    "functionName": "isSymmetric",
    "hints": [
      "Compare left.left with right.right and left.right with right.left."
    ],
    "description": "Given binary tree values, check whether it is a mirror of itself (i.e., symmetric around its center).",
    "constraints": [
      "1 <= nodes <= 1000"
    ],
    "examples": [
      {
        "input": "root = [1,2,2,3,4,4,3]",
        "output": "true"
      },
      {
        "input": "root = [1,2,2,null,3,null,3]",
        "output": "false"
      }
    ],
    "starterCode": {
      "python": "def isSymmetric(root: list) -> bool:\n    # Write your solution here\n    pass\n",
      "javascript": "function isSymmetric(root) {\n  // Write your solution here\n}\n",
      "cpp": "#include <vector>\n#include <string>\nusing namespace std;\n\nbool isSymmetric(vector<int>& root) {\n    // Write your code here\n    return false;\n}\n",
      "java": "class Solution {\n    public boolean isSymmetric(Integer[] root) {\n        // Write your code here\n        return false;\n    }\n}\n",
      "c": "#include <stdio.h>\n#include <stdbool.h>\n\nbool isSymmetric(int* r, int sr) {\n    // Write your code here\n    return false;\n}\n"
    },
    "testCases": [
      {
        "input": "[1, 2, 2, 3, 4, 4, 3]",
        "expectedOutput": "true"
      },
      {
        "input": "[1, 2, 2, null, 3, null, 3]",
        "expectedOutput": "false"
      },
      {
        "input": "[1]",
        "expectedOutput": "true"
      },
      {
        "input": "[1, 2, 3]",
        "expectedOutput": "false"
      }
    ],
    "hiddenTestCases": [
      {
        "input": "[1, 2, 2, 3, 4, 4, 3]",
        "expectedOutput": "true"
      },
      {
        "input": "[1, 2, 2, null, 3, null, 3]",
        "expectedOutput": "false"
      }
    ]
  },
  {
    "id": "p_number_of_islands",
    "title": "Number of Islands",
    "category": "Graphs",
    "difficulty": "Medium",
    "acceptance": "58.4%",
    "companies": [
      "Amazon",
      "Google",
      "Microsoft",
      "TCS Digital"
    ],
    "functionName": "numIslands",
    "hints": [
      "DFS or BFS flooding connected 1s and marking them visited."
    ],
    "description": "Given m x n 2D binary grid of '1's (land) and '0's (water), return the number of islands.",
    "constraints": [
      "m == grid.length",
      "n == grid[i].length",
      "1 <= m, n <= 300"
    ],
    "examples": [
      {
        "input": "grid = [[\"1\",\"1\",\"0\",\"0\",\"0\"],[\"1\",\"1\",\"0\",\"0\",\"0\"],[\"0\",\"0\",\"1\",\"0\",\"0\"],[\"0\",\"0\",\"0\",\"1\",\"1\"]",
        "output": "3"
      }
    ],
    "starterCode": {
      "python": "def numIslands(grid: list[list[str]]) -> int:\n    # Write your solution here\n    pass\n",
      "javascript": "function numIslands(grid) {\n  // Write your solution here\n}\n",
      "cpp": "#include <vector>\n#include <string>\nusing namespace std;\n\nint numIslands(vector<vector<char>>& grid) {\n    // Write your code here\n    return 0;\n}\n",
      "java": "class Solution {\n    public int numIslands(char[][] grid) {\n        // Write your code here\n        return 0;\n    }\n}\n",
      "c": "#include <stdio.h>\n#include <stdbool.h>\n\nint numIslands(char** grid, int m, int* n) {\n    // Write your code here\n    return 0;\n}\n"
    },
    "testCases": [
      {
        "input": "[[\"1\", \"1\", \"0\", \"0\", \"0\"], [\"1\", \"1\", \"0\", \"0\", \"0\"], [\"0\", \"0\", \"1\", \"0\", \"0\"], [\"0\", \"0\", \"0\", \"1\", \"1\"]",
        "expectedOutput": "3"
      },
      {
        "input": "[[\"1\", \"1\", \"1\"], [\"0\", \"1\", \"0\"], [\"1\", \"1\", \"1\"]",
        "expectedOutput": "1"
      },
      {
        "input": "[[\"0\"]]",
        "expectedOutput": "0"
      },
      {
        "input": "[[\"1\"]]",
        "expectedOutput": "1"
      }
    ],
    "hiddenTestCases": [
      {
        "input": "[[\"1\", \"1\", \"0\", \"0\", \"0\"], [\"1\", \"1\", \"0\", \"0\", \"0\"], [\"0\", \"0\", \"1\", \"0\", \"0\"], [\"0\", \"0\", \"0\", \"1\", \"1\"]",
        "expectedOutput": "3"
      },
      {
        "input": "[[\"1\", \"1\", \"1\"], [\"0\", \"1\", \"0\"], [\"1\", \"1\", \"1\"]",
        "expectedOutput": "1"
      }
    ]
  },
  {
    "id": "p_max_area_island",
    "title": "Max Area of Island",
    "category": "Graphs",
    "difficulty": "Medium",
    "acceptance": "71.9%",
    "companies": [
      "Amazon",
      "Google"
    ],
    "functionName": "maxAreaOfIsland",
    "hints": [
      "DFS return 1 + sum of areas of 4 orthogonal neighbors."
    ],
    "description": "Given m x n binary matrix grid, return maximum area of an island. If none, return 0.",
    "constraints": [
      "1 <= m, n <= 50"
    ],
    "examples": [
      {
        "input": "grid = [[0,0,1,0,0,0,0,1,0,0,0,0,0],[0,0,0,0,0,0,0,1,1,1,0,0,0],[0,1,1,0,1,0,0,0,0,0,0,0,0],[0,1,0,0,1,1,0,0,1,0,1,0,0],[0,1,0,0,1,1,0,0,1,1,1,0,0],[0,0,0,0,0,0,0,0,0,0,1,0,0],[0,0,0,0,0,0,0,1,1,1,0,0,0],[0,0,0,0,0,0,0,1,1,0,0,0,0]]",
        "output": "6"
      }
    ],
    "starterCode": {
      "python": "def maxAreaOfIsland(grid: list[list[int]]) -> int:\n    # Write your solution here\n    pass\n",
      "javascript": "function maxAreaOfIsland(grid) {\n  // Write your solution here\n}\n",
      "cpp": "#include <vector>\n#include <string>\nusing namespace std;\n\nint maxAreaOfIsland(vector<vector<int>>& grid) {\n    // Write your code here\n    return 0;\n}\n",
      "java": "class Solution {\n    public int maxAreaOfIsland(int[][] grid) {\n        // Write your code here\n        return 0;\n    }\n}\n",
      "c": "#include <stdio.h>\n#include <stdbool.h>\n\nint maxAreaOfIsland(int** grid, int m, int* n) {\n    // Write your code here\n    return 0;\n}\n"
    },
    "testCases": [
      {
        "input": "[[0, 0, 1, 0], [0, 0, 1, 0], [0, 1, 1, 0]]",
        "expectedOutput": "4"
      },
      {
        "input": "[[0, 0, 0, 0]]",
        "expectedOutput": "0"
      },
      {
        "input": "[[1, 1], [1, 1]]",
        "expectedOutput": "4"
      },
      {
        "input": "[[1]]",
        "expectedOutput": "1"
      }
    ],
    "hiddenTestCases": [
      {
        "input": "[[0, 0, 1, 0], [0, 0, 1, 0], [0, 1, 1, 0]]",
        "expectedOutput": "4"
      },
      {
        "input": "[[0, 0, 0, 0]]",
        "expectedOutput": "0"
      }
    ]
  },
  {
    "id": "p_rotting_oranges",
    "title": "Rotting Oranges",
    "category": "Graphs",
    "difficulty": "Medium",
    "acceptance": "54.7%",
    "companies": [
      "Amazon",
      "Microsoft"
    ],
    "functionName": "orangesRotting",
    "hints": [
      "Multi-source BFS from all initially rotten oranges simultaneously."
    ],
    "description": "Return minimum minutes until no fresh orange remains in m x n grid (0=empty, 1=fresh, 2=rotten). Return -1 if impossible.",
    "constraints": [
      "1 <= m, n <= 10"
    ],
    "examples": [
      {
        "input": "grid = [[2,1,1],[1,1,0],[0,1,1]]",
        "output": "4"
      },
      {
        "input": "grid = [[2,1,1],[0,1,1],[1,0,1]]",
        "output": "-1"
      }
    ],
    "starterCode": {
      "python": "def orangesRotting(grid: list[list[int]]) -> int:\n    # Write your solution here\n    pass\n",
      "javascript": "function orangesRotting(grid) {\n  // Write your solution here\n}\n",
      "cpp": "#include <vector>\n#include <string>\nusing namespace std;\n\nint orangesRotting(vector<vector<int>>& grid) {\n    // Write your code here\n    return 0;\n}\n",
      "java": "class Solution {\n    public int orangesRotting(int[][] grid) {\n        // Write your code here\n        return 0;\n    }\n}\n",
      "c": "#include <stdio.h>\n#include <stdbool.h>\n\nint orangesRotting(int** grid, int m, int* n) {\n    // Write your code here\n    return 0;\n}\n"
    },
    "testCases": [
      {
        "input": "[[2, 1, 1], [1, 1, 0], [0, 1, 1]]",
        "expectedOutput": "4"
      },
      {
        "input": "[[2, 1, 1], [0, 1, 1], [1, 0, 1]]",
        "expectedOutput": "-1"
      },
      {
        "input": "[[0, 2]]",
        "expectedOutput": "0"
      },
      {
        "input": "[[1]]",
        "expectedOutput": "-1"
      }
    ],
    "hiddenTestCases": [
      {
        "input": "[[2, 1, 1], [1, 1, 0], [0, 1, 1]]",
        "expectedOutput": "4"
      },
      {
        "input": "[[2, 1, 1], [0, 1, 1], [1, 0, 1]]",
        "expectedOutput": "-1"
      }
    ]
  },
  {
    "id": "p_course_schedule",
    "title": "Course Schedule",
    "category": "Graphs",
    "difficulty": "Medium",
    "acceptance": "47.3%",
    "companies": [
      "Amazon",
      "Google",
      "Microsoft"
    ],
    "functionName": "canFinish",
    "hints": [
      "Topological sort via Kahn's algorithm (in-degrees) or DFS cycle detection."
    ],
    "description": "Given totalCourses and prerequisites [a, b], return true if you can finish all courses (detect cycle in directed graph).",
    "constraints": [
      "1 <= numCourses <= 2000"
    ],
    "examples": [
      {
        "input": "numCourses = 2, prerequisites = [[1,0]]",
        "output": "true"
      },
      {
        "input": "numCourses = 2, prerequisites = [[1,0],[0,1]]",
        "output": "false"
      }
    ],
    "starterCode": {
      "python": "def canFinish(numCourses: int, prerequisites: list[list[int]]) -> bool:\n    # Write your solution here\n    pass\n",
      "javascript": "function canFinish(numCourses, prerequisites) {\n  // Write your solution here\n}\n",
      "cpp": "#include <vector>\n#include <string>\nusing namespace std;\n\nbool canFinish(int numCourses, vector<vector<int>>& prerequisites) {\n    // Write your code here\n    return false;\n}\n",
      "java": "class Solution {\n    public boolean canFinish(int numCourses, int[][] prerequisites) {\n        // Write your code here\n        return false;\n    }\n}\n",
      "c": "#include <stdio.h>\n#include <stdbool.h>\n\nbool canFinish(int n, int** p, int ps) {\n    // Write your code here\n    return false;\n}\n"
    },
    "testCases": [
      {
        "input": "2, [[1, 0]]",
        "expectedOutput": "true"
      },
      {
        "input": "2, [[1, 0], [0, 1]]",
        "expectedOutput": "false"
      },
      {
        "input": "1, []",
        "expectedOutput": "true"
      },
      {
        "input": "3, [[1, 0], [2, 1]]",
        "expectedOutput": "true"
      }
    ],
    "hiddenTestCases": [
      {
        "input": "2, [[1, 0]]",
        "expectedOutput": "true"
      },
      {
        "input": "2, [[1, 0], [0, 1]]",
        "expectedOutput": "false"
      }
    ]
  },
  {
    "id": "p_course_schedule_ii",
    "title": "Course Schedule II",
    "category": "Graphs",
    "difficulty": "Medium",
    "acceptance": "50.1%",
    "companies": [
      "Amazon",
      "Google"
    ],
    "functionName": "findOrder",
    "hints": [
      "Topological order using queue with in-degree 0."
    ],
    "description": "Return the ordering of courses you should take to finish all courses. If impossible, return [].",
    "constraints": [
      "1 <= numCourses <= 2000"
    ],
    "examples": [
      {
        "input": "numCourses = 4, prerequisites = [[1,0],[2,0],[3,1],[3,2]]",
        "output": "[0,2,1,3]"
      }
    ],
    "starterCode": {
      "python": "def findOrder(numCourses: int, prerequisites: list[list[int]]) -> list[int]:\n    # Write your solution here\n    pass\n",
      "javascript": "function findOrder(numCourses, prerequisites) {\n  // Write your solution here\n}\n",
      "cpp": "#include <vector>\n#include <string>\nusing namespace std;\n\nvector<int> findOrder(int numCourses, vector<vector<int>>& prerequisites) {\n    // Write your code here\n    return {};\n}\n",
      "java": "class Solution {\n    public int[] findOrder(int numCourses, int[][] prerequisites) {\n        // Write your code here\n        return new int[]{};\n    }\n}\n",
      "c": "#include <stdio.h>\n#include <stdbool.h>\n\nint* findOrder(int n, int** p, int ps, int* rs) {\n    // Write your code here\n    return NULL;\n}\n"
    },
    "testCases": [
      {
        "input": "2, [[1, 0]]",
        "expectedOutput": "[0, 1]"
      },
      {
        "input": "4, [[1, 0], [2, 0], [3, 1], [3, 2]]",
        "expectedOutput": "[0, 1, 2, 3]"
      },
      {
        "input": "1, []",
        "expectedOutput": "[0]"
      },
      {
        "input": "2, [[1, 0], [0, 1]]",
        "expectedOutput": "[]"
      }
    ],
    "hiddenTestCases": [
      {
        "input": "2, [[1, 0]]",
        "expectedOutput": "[0, 1]"
      },
      {
        "input": "4, [[1, 0], [2, 0], [3, 1], [3, 2]]",
        "expectedOutput": "[0, 1, 2, 3]"
      }
    ]
  },
  {
    "id": "p_pacific_atlantic",
    "title": "Pacific Atlantic Water Flow",
    "category": "Graphs",
    "difficulty": "Medium",
    "acceptance": "55.6%",
    "companies": [
      "Google",
      "Amazon"
    ],
    "functionName": "pacificAtlantic",
    "hints": [
      "Work backwards: BFS/DFS from Pacific borders and Atlantic borders inland."
    ],
    "description": "Return list of grid coordinates where water can flow to both Pacific (top/left) and Atlantic (bottom/right) oceans.",
    "constraints": [
      "m == heights.length",
      "n == heights[0].length",
      "1 <= m, n <= 200"
    ],
    "examples": [
      {
        "input": "heights = [[1,2,2,3,5],[3,2,3,4,4],[2,4,5,3,1],[6,7,1,4,5],[5,1,1,2,4]]",
        "output": "[[0,4],[1,3],[1,4],[2,2],[3,0],[3,1],[4,0]]"
      }
    ],
    "starterCode": {
      "python": "def pacificAtlantic(heights: list[list[int]]) -> list[list[int]]:\n    # Write your solution here\n    pass\n",
      "javascript": "function pacificAtlantic(heights) {\n  // Write your solution here\n}\n",
      "cpp": "#include <vector>\n#include <string>\nusing namespace std;\n\nvector<vector<int>> pacificAtlantic(vector<vector<int>>& heights) {\n    // Write your code here\n    return {};\n}\n",
      "java": "class Solution {\n    public List<List<Integer>> pacificAtlantic(int[][] heights) {\n        // Write your code here\n        return new ArrayList<>();\n    }\n}\n",
      "c": "#include <stdio.h>\n#include <stdbool.h>\n\nint* pacificAtlantic(int** h, int m, int* n) {\n    // Write your code here\n    return NULL;\n}\n"
    },
    "testCases": [
      {
        "input": "[[1, 2], [2, 1]]",
        "expectedOutput": "[[0, 1], [1, 0], [1, 1]]"
      },
      {
        "input": "[[1]]",
        "expectedOutput": "[[0, 0]]"
      },
      {
        "input": "[[2, 1], [1, 2]]",
        "expectedOutput": "[[0, 0], [0, 1], [1, 0], [1, 1]]"
      },
      {
        "input": "[[1, 2, 3], [8, 9, 4], [7, 6, 5]]",
        "expectedOutput": "[[0, 2], [1, 0], [1, 1], [1, 2], [2, 0], [2, 1], [2, 2]]"
      }
    ],
    "hiddenTestCases": [
      {
        "input": "[[1, 2], [2, 1]]",
        "expectedOutput": "[[0, 1], [1, 0], [1, 1]]"
      },
      {
        "input": "[[1]]",
        "expectedOutput": "[[0, 0]]"
      }
    ]
  },
  {
    "id": "p_clone_graph",
    "title": "Clone Graph",
    "category": "Graphs",
    "difficulty": "Medium",
    "acceptance": "56.2%",
    "companies": [
      "Google",
      "Facebook"
    ],
    "functionName": "cloneGraphSize",
    "hints": [
      "DFS with a hash map mapping original node to cloned node."
    ],
    "description": "Given adjacency list of connected undirected graph, return number of nodes cloned.",
    "constraints": [
      "0 <= nodes <= 100"
    ],
    "examples": [
      {
        "input": "adjList = [[2,4],[1,3],[2,4],[1,3]]",
        "output": "4"
      }
    ],
    "starterCode": {
      "python": "def cloneGraphSize(adjList: list[list[int]]) -> int:\n    # Write your solution here\n    pass\n",
      "javascript": "function cloneGraphSize(adjList) {\n  // Write your solution here\n}\n",
      "cpp": "#include <vector>\n#include <string>\nusing namespace std;\n\nint cloneGraphSize(vector<vector<int>>& adjList) {\n    // Write your code here\n    return 0;\n}\n",
      "java": "class Solution {\n    public int cloneGraphSize(List<List<Integer>> adjList) {\n        // Write your code here\n        return 0;\n    }\n}\n",
      "c": "#include <stdio.h>\n#include <stdbool.h>\n\nint cloneGraphSize(int** adj, int n, int* s) {\n    // Write your code here\n    return 0;\n}\n"
    },
    "testCases": [
      {
        "input": "[[2, 4], [1, 3], [2, 4], [1, 3]]",
        "expectedOutput": "4"
      },
      {
        "input": "[[]]",
        "expectedOutput": "1"
      },
      {
        "input": "[]",
        "expectedOutput": "0"
      },
      {
        "input": "[[2], [1]]",
        "expectedOutput": "2"
      }
    ],
    "hiddenTestCases": [
      {
        "input": "[[2, 4], [1, 3], [2, 4], [1, 3]]",
        "expectedOutput": "4"
      },
      {
        "input": "[[]]",
        "expectedOutput": "1"
      }
    ]
  },
  {
    "id": "p_min_cost_climbing_stairs",
    "title": "Min Cost Climbing Stairs",
    "category": "Dynamic Programming",
    "difficulty": "Easy",
    "acceptance": "66.2%",
    "companies": [
      "Amazon",
      "TCS",
      "Infosys"
    ],
    "functionName": "minCostClimbingStairs",
    "hints": [
      "dp[i] = cost[i] + min(dp[i-1], dp[i-2])."
    ],
    "description": "Return minimum cost to reach the top of the floor where you can climb 1 or 2 steps.",
    "constraints": [
      "2 <= cost.length <= 1000"
    ],
    "examples": [
      {
        "input": "cost = [10,15,20]",
        "output": "15"
      },
      {
        "input": "cost = [1,100,1,1,1,100,1,1,100,1]",
        "output": "6"
      }
    ],
    "starterCode": {
      "python": "def minCostClimbingStairs(cost: list[int]) -> int:\n    # Write your solution here\n    pass\n",
      "javascript": "function minCostClimbingStairs(cost) {\n  // Write your solution here\n}\n",
      "cpp": "#include <vector>\n#include <string>\nusing namespace std;\n\nint minCostClimbingStairs(vector<int>& cost) {\n    // Write your code here\n    return 0;\n}\n",
      "java": "class Solution {\n    public int minCostClimbingStairs(int[] cost) {\n        // Write your code here\n        return 0;\n    }\n}\n",
      "c": "#include <stdio.h>\n#include <stdbool.h>\n\nint minCostClimbingStairs(int* cost, int costSize) {\n    // Write your code here\n    return 0;\n}\n"
    },
    "testCases": [
      {
        "input": "[10, 15, 20]",
        "expectedOutput": "15"
      },
      {
        "input": "[1, 100, 1, 1, 1, 100, 1, 1, 100, 1]",
        "expectedOutput": "6"
      },
      {
        "input": "[0, 0, 0, 1]",
        "expectedOutput": "0"
      },
      {
        "input": "[10, 10]",
        "expectedOutput": "10"
      }
    ],
    "hiddenTestCases": [
      {
        "input": "[10, 15, 20]",
        "expectedOutput": "15"
      },
      {
        "input": "[1, 100, 1, 1, 1, 100, 1, 1, 100, 1]",
        "expectedOutput": "6"
      }
    ]
  },
  {
    "id": "p_house_robber_ii",
    "title": "House Robber II",
    "category": "Dynamic Programming",
    "difficulty": "Medium",
    "acceptance": "42.0%",
    "companies": [
      "Amazon",
      "Microsoft"
    ],
    "functionName": "robCircular",
    "hints": [
      "Return max(rob(nums[1:]), rob(nums[:-1]))."
    ],
    "description": "Houses are arranged in a circle. Return maximum money you can rob without alerting neighbors.",
    "constraints": [
      "1 <= nums.length <= 100"
    ],
    "examples": [
      {
        "input": "nums = [2,3,2]",
        "output": "3"
      },
      {
        "input": "nums = [1,2,3,1]",
        "output": "4"
      }
    ],
    "starterCode": {
      "python": "def robCircular(nums: list[int]) -> int:\n    # Write your solution here\n    pass\n",
      "javascript": "function robCircular(nums) {\n  // Write your solution here\n}\n",
      "cpp": "#include <vector>\n#include <string>\nusing namespace std;\n\nint robCircular(vector<int>& nums) {\n    // Write your code here\n    return 0;\n}\n",
      "java": "class Solution {\n    public int robCircular(int[] nums) {\n        // Write your code here\n        return 0;\n    }\n}\n",
      "c": "#include <stdio.h>\n#include <stdbool.h>\n\nint robCircular(int* nums, int numsSize) {\n    // Write your code here\n    return 0;\n}\n"
    },
    "testCases": [
      {
        "input": "[2, 3, 2]",
        "expectedOutput": "3"
      },
      {
        "input": "[1, 2, 3, 1]",
        "expectedOutput": "4"
      },
      {
        "input": "[1, 2, 3]",
        "expectedOutput": "3"
      },
      {
        "input": "[1]",
        "expectedOutput": "1"
      }
    ],
    "hiddenTestCases": [
      {
        "input": "[2, 3, 2]",
        "expectedOutput": "3"
      },
      {
        "input": "[1, 2, 3, 1]",
        "expectedOutput": "4"
      }
    ]
  },
  {
    "id": "p_longest_palindromic_substring",
    "title": "Longest Palindromic Substring",
    "category": "Dynamic Programming",
    "difficulty": "Medium",
    "acceptance": "34.1%",
    "companies": [
      "Amazon",
      "Microsoft",
      "TCS Digital"
    ],
    "functionName": "longestPalindrome",
    "hints": [
      "Expand around center for each index (single char and two chars)."
    ],
    "description": "Given a string `s`, return the longest palindromic substring in `s`.",
    "constraints": [
      "1 <= s.length <= 1000"
    ],
    "examples": [
      {
        "input": "s = \"babad\"",
        "output": "\"bab\""
      },
      {
        "input": "s = \"cbbd\"",
        "output": "\"bb\""
      }
    ],
    "starterCode": {
      "python": "def longestPalindrome(s: str) -> str:\n    # Write your solution here\n    pass\n",
      "javascript": "function longestPalindrome(s) {\n  // Write your solution here\n}\n",
      "cpp": "#include <vector>\n#include <string>\nusing namespace std;\n\nstring longestPalindrome(string s) {\n    // Write your code here\n    return \"\";\n}\n",
      "java": "class Solution {\n    public String longestPalindrome(String s) {\n        // Write your code here\n        return \"\";\n    }\n}\n",
      "c": "#include <stdio.h>\n#include <stdbool.h>\n\nchar* longestPalindrome(char* s) {\n    // Write your code here\n    return NULL;\n}\n"
    },
    "testCases": [
      {
        "input": "\"babad\"",
        "expectedOutput": "\"bab\""
      },
      {
        "input": "\"cbbd\"",
        "expectedOutput": "\"bb\""
      },
      {
        "input": "\"a\"",
        "expectedOutput": "\"a\""
      },
      {
        "input": "\"racecar\"",
        "expectedOutput": "\"racecar\""
      }
    ],
    "hiddenTestCases": [
      {
        "input": "\"babad\"",
        "expectedOutput": "\"bab\""
      },
      {
        "input": "\"cbbd\"",
        "expectedOutput": "\"bb\""
      }
    ]
  },
  {
    "id": "p_longest_increasing_subsequence",
    "title": "Longest Increasing Subsequence",
    "category": "Dynamic Programming",
    "difficulty": "Medium",
    "acceptance": "54.8%",
    "companies": [
      "Google",
      "Amazon",
      "Microsoft"
    ],
    "functionName": "lengthOfLIS",
    "hints": [
      "Patience sorting with binary search (tails array)."
    ],
    "description": "Given an integer array `nums`, return the length of the longest strictly increasing subsequence in O(n log n) or O(n^2).",
    "constraints": [
      "1 <= nums.length <= 2500"
    ],
    "examples": [
      {
        "input": "nums = [10,9,2,5,3,7,101,18]",
        "output": "4"
      },
      {
        "input": "nums = [0,1,0,3,2,3]",
        "output": "4"
      }
    ],
    "starterCode": {
      "python": "def lengthOfLIS(nums: list[int]) -> int:\n    # Write your solution here\n    pass\n",
      "javascript": "function lengthOfLIS(nums) {\n  // Write your solution here\n}\n",
      "cpp": "#include <vector>\n#include <string>\nusing namespace std;\n\nint lengthOfLIS(vector<int>& nums) {\n    // Write your code here\n    return 0;\n}\n",
      "java": "class Solution {\n    public int lengthOfLIS(int[] nums) {\n        // Write your code here\n        return 0;\n    }\n}\n",
      "c": "#include <stdio.h>\n#include <stdbool.h>\n\nint lengthOfLIS(int* nums, int numsSize) {\n    // Write your code here\n    return 0;\n}\n"
    },
    "testCases": [
      {
        "input": "[10, 9, 2, 5, 3, 7, 101, 18]",
        "expectedOutput": "4"
      },
      {
        "input": "[0, 1, 0, 3, 2, 3]",
        "expectedOutput": "4"
      },
      {
        "input": "[7, 7, 7, 7, 7]",
        "expectedOutput": "1"
      },
      {
        "input": "[1, 3, 6, 7, 9, 4, 10, 5, 6]",
        "expectedOutput": "6"
      }
    ],
    "hiddenTestCases": [
      {
        "input": "[10, 9, 2, 5, 3, 7, 101, 18]",
        "expectedOutput": "4"
      },
      {
        "input": "[0, 1, 0, 3, 2, 3]",
        "expectedOutput": "4"
      }
    ]
  },
  {
    "id": "p_word_break",
    "title": "Word Break",
    "category": "Dynamic Programming",
    "difficulty": "Medium",
    "acceptance": "46.5%",
    "companies": [
      "Amazon",
      "Google",
      "Microsoft"
    ],
    "functionName": "wordBreak",
    "hints": [
      "dp[i] is true if dp[j] and s[j:i] in wordDict."
    ],
    "description": "Return true if s can be segmented into a space-separated sequence of one or more dictionary words.",
    "constraints": [
      "1 <= s.length <= 300",
      "1 <= wordDict.length <= 1000"
    ],
    "examples": [
      {
        "input": "s = \"leetcode\", wordDict = [\"leet\",\"code\"]",
        "output": "true"
      },
      {
        "input": "s = \"applepenapple\", wordDict = [\"apple\",\"pen\"]",
        "output": "true"
      }
    ],
    "starterCode": {
      "python": "def wordBreak(s: str, wordDict: list[str]) -> bool:\n    # Write your solution here\n    pass\n",
      "javascript": "function wordBreak(s, wordDict) {\n  // Write your solution here\n}\n",
      "cpp": "#include <vector>\n#include <string>\nusing namespace std;\n\nbool wordBreak(string s, vector<string>& wordDict) {\n    // Write your code here\n    return false;\n}\n",
      "java": "class Solution {\n    public boolean wordBreak(String s, List<String> wordDict) {\n        // Write your code here\n        return false;\n    }\n}\n",
      "c": "#include <stdio.h>\n#include <stdbool.h>\n\nbool wordBreak(char* s, char** wd, int wds) {\n    // Write your code here\n    return false;\n}\n"
    },
    "testCases": [
      {
        "input": "\"leetcode\", [\"leet\", \"code\"]",
        "expectedOutput": "true"
      },
      {
        "input": "\"applepenapple\", [\"apple\", \"pen\"]",
        "expectedOutput": "true"
      },
      {
        "input": "\"catsandog\", [\"cats\", \"dog\", \"sand\", \"and\", \"cat\"]",
        "expectedOutput": "false"
      },
      {
        "input": "\"a\", [\"a\"]",
        "expectedOutput": "true"
      }
    ],
    "hiddenTestCases": [
      {
        "input": "\"leetcode\", [\"leet\", \"code\"]",
        "expectedOutput": "true"
      },
      {
        "input": "\"applepenapple\", [\"apple\", \"pen\"]",
        "expectedOutput": "true"
      }
    ]
  },
  {
    "id": "p_unique_paths",
    "title": "Unique Paths",
    "category": "Dynamic Programming",
    "difficulty": "Medium",
    "acceptance": "64.0%",
    "companies": [
      "Amazon",
      "Google",
      "TCS Digital"
    ],
    "functionName": "uniquePaths",
    "hints": [
      "dp[i][j] = dp[i-1][j] + dp[i][j-1]."
    ],
    "description": "A robot starts at (0, 0) of m x n grid and can only move down or right. Return number of unique paths to bottom-right.",
    "constraints": [
      "1 <= m, n <= 100"
    ],
    "examples": [
      {
        "input": "m = 3, n = 7",
        "output": "28"
      },
      {
        "input": "m = 3, n = 2",
        "output": "3"
      }
    ],
    "starterCode": {
      "python": "def uniquePaths(m: int, n: int) -> int:\n    # Write your solution here\n    pass\n",
      "javascript": "function uniquePaths(m, n) {\n  // Write your solution here\n}\n",
      "cpp": "#include <vector>\n#include <string>\nusing namespace std;\n\nint uniquePaths(int m, int n) {\n    // Write your code here\n    return 0;\n}\n",
      "java": "class Solution {\n    public int uniquePaths(int m, int n) {\n        // Write your code here\n        return 0;\n    }\n}\n",
      "c": "#include <stdio.h>\n#include <stdbool.h>\n\nint uniquePaths(int m, int n) {\n    // Write your code here\n    return 0;\n}\n"
    },
    "testCases": [
      {
        "input": "3, 7",
        "expectedOutput": "28"
      },
      {
        "input": "3, 2",
        "expectedOutput": "3"
      },
      {
        "input": "1, 1",
        "expectedOutput": "1"
      },
      {
        "input": "3, 3",
        "expectedOutput": "6"
      }
    ],
    "hiddenTestCases": [
      {
        "input": "3, 7",
        "expectedOutput": "28"
      },
      {
        "input": "3, 2",
        "expectedOutput": "3"
      }
    ]
  },
  {
    "id": "p_edit_distance",
    "title": "Edit Distance",
    "category": "Dynamic Programming",
    "difficulty": "Hard",
    "acceptance": "56.1%",
    "companies": [
      "Google",
      "Amazon",
      "Microsoft"
    ],
    "functionName": "minDistance",
    "hints": [
      "Classic 2D DP grid tracking insert, delete, and replace costs."
    ],
    "description": "Return minimum number of operations (insert, delete, replace) required to convert word1 to word2.",
    "constraints": [
      "0 <= word1.length, word2.length <= 500"
    ],
    "examples": [
      {
        "input": "word1 = \"horse\", word2 = \"ros\"",
        "output": "3"
      },
      {
        "input": "word1 = \"intention\", word2 = \"execution\"",
        "output": "5"
      }
    ],
    "starterCode": {
      "python": "def minDistance(word1: str, word2: str) -> int:\n    # Write your solution here\n    pass\n",
      "javascript": "function minDistance(word1, word2) {\n  // Write your solution here\n}\n",
      "cpp": "#include <vector>\n#include <string>\nusing namespace std;\n\nint minDistance(string word1, string word2) {\n    // Write your code here\n    return 0;\n}\n",
      "java": "class Solution {\n    public int minDistance(String word1, String word2) {\n        // Write your code here\n        return 0;\n    }\n}\n",
      "c": "#include <stdio.h>\n#include <stdbool.h>\n\nint minDistance(char* w1, char* w2) {\n    // Write your code here\n    return 0;\n}\n"
    },
    "testCases": [
      {
        "input": "\"horse\", \"ros\"",
        "expectedOutput": "3"
      },
      {
        "input": "\"intention\", \"execution\"",
        "expectedOutput": "5"
      },
      {
        "input": "\"\", \"\"",
        "expectedOutput": "0"
      },
      {
        "input": "\"a\", \"b\"",
        "expectedOutput": "1"
      }
    ],
    "hiddenTestCases": [
      {
        "input": "\"horse\", \"ros\"",
        "expectedOutput": "3"
      },
      {
        "input": "\"intention\", \"execution\"",
        "expectedOutput": "5"
      }
    ]
  },
  {
    "id": "p_partition_equal_subset_sum",
    "title": "Partition Equal Subset Sum",
    "category": "Dynamic Programming",
    "difficulty": "Medium",
    "acceptance": "46.6%",
    "companies": [
      "Amazon",
      "Microsoft"
    ],
    "functionName": "canPartition",
    "hints": [
      "0/1 knapsack with target = total_sum // 2."
    ],
    "description": "Return true if array nums can be partitioned into two subsets such that the sum of elements in both subsets is equal.",
    "constraints": [
      "1 <= nums.length <= 200",
      "1 <= nums[i] <= 100"
    ],
    "examples": [
      {
        "input": "nums = [1,5,11,5]",
        "output": "true"
      },
      {
        "input": "nums = [1,2,3,5]",
        "output": "false"
      }
    ],
    "starterCode": {
      "python": "def canPartition(nums: list[int]) -> bool:\n    # Write your solution here\n    pass\n",
      "javascript": "function canPartition(nums) {\n  // Write your solution here\n}\n",
      "cpp": "#include <vector>\n#include <string>\nusing namespace std;\n\nbool canPartition(vector<int>& nums) {\n    // Write your code here\n    return false;\n}\n",
      "java": "class Solution {\n    public boolean canPartition(int[] nums) {\n        // Write your code here\n        return false;\n    }\n}\n",
      "c": "#include <stdio.h>\n#include <stdbool.h>\n\nbool canPartition(int* nums, int numsSize) {\n    // Write your code here\n    return false;\n}\n"
    },
    "testCases": [
      {
        "input": "[1, 5, 11, 5]",
        "expectedOutput": "true"
      },
      {
        "input": "[1, 2, 3, 5]",
        "expectedOutput": "false"
      },
      {
        "input": "[2]",
        "expectedOutput": "false"
      },
      {
        "input": "[1, 1]",
        "expectedOutput": "true"
      }
    ],
    "hiddenTestCases": [
      {
        "input": "[1, 5, 11, 5]",
        "expectedOutput": "true"
      },
      {
        "input": "[1, 2, 3, 5]",
        "expectedOutput": "false"
      }
    ]
  },
  {
    "id": "p_jump_game",
    "title": "Jump Game",
    "category": "Greedy & Math",
    "difficulty": "Medium",
    "acceptance": "39.1%",
    "companies": [
      "Amazon",
      "Microsoft",
      "TCS Digital"
    ],
    "functionName": "canJump",
    "hints": [
      "Greedy farthest reachable index update."
    ],
    "description": "Each element represents maximum jump length. Return true if you can reach the last index starting at index 0.",
    "constraints": [
      "1 <= nums.length <= 10^4",
      "0 <= nums[i] <= 10^5"
    ],
    "examples": [
      {
        "input": "nums = [2,3,1,1,4]",
        "output": "true"
      },
      {
        "input": "nums = [3,2,1,0,4]",
        "output": "false"
      }
    ],
    "starterCode": {
      "python": "def canJump(nums: list[int]) -> bool:\n    # Write your solution here\n    pass\n",
      "javascript": "function canJump(nums) {\n  // Write your solution here\n}\n",
      "cpp": "#include <vector>\n#include <string>\nusing namespace std;\n\nbool canJump(vector<int>& nums) {\n    // Write your code here\n    return false;\n}\n",
      "java": "class Solution {\n    public boolean canJump(int[] nums) {\n        // Write your code here\n        return false;\n    }\n}\n",
      "c": "#include <stdio.h>\n#include <stdbool.h>\n\nbool canJump(int* nums, int numsSize) {\n    // Write your code here\n    return false;\n}\n"
    },
    "testCases": [
      {
        "input": "[2, 3, 1, 1, 4]",
        "expectedOutput": "true"
      },
      {
        "input": "[3, 2, 1, 0, 4]",
        "expectedOutput": "false"
      },
      {
        "input": "[0]",
        "expectedOutput": "true"
      },
      {
        "input": "[2, 0, 0]",
        "expectedOutput": "true"
      }
    ],
    "hiddenTestCases": [
      {
        "input": "[2, 3, 1, 1, 4]",
        "expectedOutput": "true"
      },
      {
        "input": "[3, 2, 1, 0, 4]",
        "expectedOutput": "false"
      }
    ]
  },
  {
    "id": "p_jump_game_ii",
    "title": "Jump Game II",
    "category": "Greedy & Math",
    "difficulty": "Medium",
    "acceptance": "45.0%",
    "companies": [
      "Amazon",
      "Google"
    ],
    "functionName": "jump",
    "hints": [
      "BFS levels via current jump interval [cur_end, next_farthest]."
    ],
    "description": "Return the minimum number of jumps to reach index n - 1.",
    "constraints": [
      "1 <= nums.length <= 10^4"
    ],
    "examples": [
      {
        "input": "nums = [2,3,1,1,4]",
        "output": "2"
      },
      {
        "input": "nums = [2,3,0,1,4]",
        "output": "2"
      }
    ],
    "starterCode": {
      "python": "def jump(nums: list[int]) -> int:\n    # Write your solution here\n    pass\n",
      "javascript": "function jump(nums) {\n  // Write your solution here\n}\n",
      "cpp": "#include <vector>\n#include <string>\nusing namespace std;\n\nint jump(vector<int>& nums) {\n    // Write your code here\n    return 0;\n}\n",
      "java": "class Solution {\n    public int jump(int[] nums) {\n        // Write your code here\n        return 0;\n    }\n}\n",
      "c": "#include <stdio.h>\n#include <stdbool.h>\n\nint jump(int* nums, int numsSize) {\n    // Write your code here\n    return 0;\n}\n"
    },
    "testCases": [
      {
        "input": "[2, 3, 1, 1, 4]",
        "expectedOutput": "2"
      },
      {
        "input": "[2, 3, 0, 1, 4]",
        "expectedOutput": "2"
      },
      {
        "input": "[0]",
        "expectedOutput": "0"
      },
      {
        "input": "[1, 2, 3]",
        "expectedOutput": "2"
      }
    ],
    "hiddenTestCases": [
      {
        "input": "[2, 3, 1, 1, 4]",
        "expectedOutput": "2"
      },
      {
        "input": "[2, 3, 0, 1, 4]",
        "expectedOutput": "2"
      }
    ]
  },
  {
    "id": "p_gas_station",
    "title": "Gas Station",
    "category": "Greedy & Math",
    "difficulty": "Medium",
    "acceptance": "45.8%",
    "companies": [
      "Amazon",
      "Google"
    ],
    "functionName": "canCompleteCircuit",
    "hints": [
      "If total gas >= total cost, solution exists; reset start index when tank drops below 0."
    ],
    "description": "Given circular route with gas[i] and cost[i], return starting gas station index or -1 if impossible.",
    "constraints": [
      "n == gas.length == cost.length",
      "1 <= n <= 10^5"
    ],
    "examples": [
      {
        "input": "gas = [1,2,3,4,5], cost = [3,4,5,1,2]",
        "output": "3"
      },
      {
        "input": "gas = [2,3,4], cost = [3,4,3]",
        "output": "-1"
      }
    ],
    "starterCode": {
      "python": "def canCompleteCircuit(gas: list[int], cost: list[int]) -> int:\n    # Write your solution here\n    pass\n",
      "javascript": "function canCompleteCircuit(gas, cost) {\n  // Write your solution here\n}\n",
      "cpp": "#include <vector>\n#include <string>\nusing namespace std;\n\nint canCompleteCircuit(vector<int>& gas, vector<int>& cost) {\n    // Write your code here\n    return -1;\n}\n",
      "java": "class Solution {\n    public int canCompleteCircuit(int[] gas, int[] cost) {\n        // Write your code here\n        return -1;\n    }\n}\n",
      "c": "#include <stdio.h>\n#include <stdbool.h>\n\nint canCompleteCircuit(int* gas, int gs, int* cost, int cs) {\n    // Write your code here\n    return -1;\n}\n"
    },
    "testCases": [
      {
        "input": "[1, 2, 3, 4, 5], [3, 4, 5, 1, 2]",
        "expectedOutput": "3"
      },
      {
        "input": "[2, 3, 4], [3, 4, 3]",
        "expectedOutput": "-1"
      },
      {
        "input": "[5, 1, 2, 3, 4], [4, 4, 1, 5, 1]",
        "expectedOutput": "4"
      },
      {
        "input": "[2], [2]",
        "expectedOutput": "0"
      }
    ],
    "hiddenTestCases": [
      {
        "input": "[1, 2, 3, 4, 5], [3, 4, 5, 1, 2]",
        "expectedOutput": "3"
      },
      {
        "input": "[2, 3, 4], [3, 4, 3]",
        "expectedOutput": "-1"
      }
    ]
  },
  {
    "id": "p_lemonade_change",
    "title": "Lemonade Change",
    "category": "Greedy & Math",
    "difficulty": "Easy",
    "acceptance": "53.6%",
    "companies": [
      "TCS",
      "Infosys",
      "Wipro"
    ],
    "functionName": "lemonadeChange",
    "hints": [
      "Track count of $5 and $10 bills greedily prioritizing larger bills for change."
    ],
    "description": "Each lemonade is $5. Customers pay with $5, $10, or $20. Return true if you can provide correct change to everyone.",
    "constraints": [
      "1 <= bills.length <= 10^5",
      "bills[i] is 5, 10, or 20."
    ],
    "examples": [
      {
        "input": "bills = [5,5,5,10,20]",
        "output": "true"
      },
      {
        "input": "bills = [5,5,10,10,20]",
        "output": "false"
      }
    ],
    "starterCode": {
      "python": "def lemonadeChange(bills: list[int]) -> bool:\n    # Write your solution here\n    pass\n",
      "javascript": "function lemonadeChange(bills) {\n  // Write your solution here\n}\n",
      "cpp": "#include <vector>\n#include <string>\nusing namespace std;\n\nbool lemonadeChange(vector<int>& bills) {\n    // Write your code here\n    return false;\n}\n",
      "java": "class Solution {\n    public boolean lemonadeChange(int[] bills) {\n        // Write your code here\n        return false;\n    }\n}\n",
      "c": "#include <stdio.h>\n#include <stdbool.h>\n\nbool lemonadeChange(int* bills, int billsSize) {\n    // Write your code here\n    return false;\n}\n"
    },
    "testCases": [
      {
        "input": "[5, 5, 5, 10, 20]",
        "expectedOutput": "true"
      },
      {
        "input": "[5, 5, 10, 10, 20]",
        "expectedOutput": "false"
      },
      {
        "input": "[5, 5, 10]",
        "expectedOutput": "true"
      },
      {
        "input": "[10, 10]",
        "expectedOutput": "false"
      }
    ],
    "hiddenTestCases": [
      {
        "input": "[5, 5, 5, 10, 20]",
        "expectedOutput": "true"
      },
      {
        "input": "[5, 5, 10, 10, 20]",
        "expectedOutput": "false"
      }
    ]
  },
  {
    "id": "p_assign_cookies",
    "title": "Assign Cookies",
    "category": "Greedy & Math",
    "difficulty": "Easy",
    "acceptance": "52.3%",
    "companies": [
      "TCS",
      "Wipro",
      "Accenture"
    ],
    "functionName": "findContentChildren",
    "hints": [
      "Sort both arrays and greedily satisfy smallest greed with smallest cookie."
    ],
    "description": "Given greed factor `g` and cookie sizes `s`, maximize content children.",
    "constraints": [
      "1 <= g.length, s.length <= 3 * 10^4"
    ],
    "examples": [
      {
        "input": "g = [1,2,3], s = [1,1]",
        "output": "1"
      },
      {
        "input": "g = [1,2], s = [1,2,3]",
        "output": "2"
      }
    ],
    "starterCode": {
      "python": "def findContentChildren(g: list[int], s: list[int]) -> int:\n    # Write your solution here\n    pass\n",
      "javascript": "function findContentChildren(g, s) {\n  // Write your solution here\n}\n",
      "cpp": "#include <vector>\n#include <string>\nusing namespace std;\n\nint findContentChildren(vector<int>& g, vector<int>& s) {\n    // Write your code here\n    return 0;\n}\n",
      "java": "class Solution {\n    public int findContentChildren(int[] g, int[] s) {\n        // Write your code here\n        return 0;\n    }\n}\n",
      "c": "#include <stdio.h>\n#include <stdbool.h>\n\nint findContentChildren(int* g, int gs, int* s, int ss) {\n    // Write your code here\n    return 0;\n}\n"
    },
    "testCases": [
      {
        "input": "[1, 2, 3], [1, 1]",
        "expectedOutput": "1"
      },
      {
        "input": "[1, 2], [1, 2, 3]",
        "expectedOutput": "2"
      },
      {
        "input": "[1, 2, 3], []",
        "expectedOutput": "0"
      },
      {
        "input": "[10, 9, 8, 7], [5, 6, 7, 8]",
        "expectedOutput": "2"
      }
    ],
    "hiddenTestCases": [
      {
        "input": "[1, 2, 3], [1, 1]",
        "expectedOutput": "1"
      },
      {
        "input": "[1, 2], [1, 2, 3]",
        "expectedOutput": "2"
      }
    ]
  },
  {
    "id": "p_best_time_stock_ii",
    "title": "Best Time to Buy and Sell Stock II",
    "category": "Greedy & Math",
    "difficulty": "Medium",
    "acceptance": "66.4%",
    "companies": [
      "Amazon",
      "Microsoft"
    ],
    "functionName": "maxProfitII",
    "hints": [
      "Add all positive differences prices[i] - prices[i - 1]."
    ],
    "description": "You may buy and sell stock multiple times. Return maximum total profit.",
    "constraints": [
      "1 <= prices.length <= 3 * 10^4"
    ],
    "examples": [
      {
        "input": "prices = [7,1,5,3,6,4]",
        "output": "7"
      },
      {
        "input": "prices = [1,2,3,4,5]",
        "output": "4"
      }
    ],
    "starterCode": {
      "python": "def maxProfitII(prices: list[int]) -> int:\n    # Write your solution here\n    pass\n",
      "javascript": "function maxProfitII(prices) {\n  // Write your solution here\n}\n",
      "cpp": "#include <vector>\n#include <string>\nusing namespace std;\n\nint maxProfitII(vector<int>& prices) {\n    // Write your code here\n    return 0;\n}\n",
      "java": "class Solution {\n    public int maxProfitII(int[] prices) {\n        // Write your code here\n        return 0;\n    }\n}\n",
      "c": "#include <stdio.h>\n#include <stdbool.h>\n\nint maxProfitII(int* prices, int pricesSize) {\n    // Write your code here\n    return 0;\n}\n"
    },
    "testCases": [
      {
        "input": "[7, 1, 5, 3, 6, 4]",
        "expectedOutput": "7"
      },
      {
        "input": "[1, 2, 3, 4, 5]",
        "expectedOutput": "4"
      },
      {
        "input": "[7, 6, 4, 3, 1]",
        "expectedOutput": "0"
      },
      {
        "input": "[2, 4]",
        "expectedOutput": "2"
      }
    ],
    "hiddenTestCases": [
      {
        "input": "[7, 1, 5, 3, 6, 4]",
        "expectedOutput": "7"
      },
      {
        "input": "[1, 2, 3, 4, 5]",
        "expectedOutput": "4"
      }
    ]
  },
  {
    "id": "p_happy_number",
    "title": "Happy Number",
    "category": "Greedy & Math",
    "difficulty": "Easy",
    "acceptance": "56.4%",
    "companies": [
      "Google",
      "TCS",
      "Infosys"
    ],
    "functionName": "isHappy",
    "hints": [
      "Use Floyd cycle detection on the digit-square-sum sequence."
    ],
    "description": "Replace number by sum of squares of digits repeatedly. Return true if it reaches 1.",
    "constraints": [
      "1 <= n <= 2^31 - 1"
    ],
    "examples": [
      {
        "input": "n = 19",
        "output": "true"
      },
      {
        "input": "n = 2",
        "output": "false"
      }
    ],
    "starterCode": {
      "python": "def isHappy(n: int) -> bool:\n    # Write your solution here\n    pass\n",
      "javascript": "function isHappy(n) {\n  // Write your solution here\n}\n",
      "cpp": "#include <vector>\n#include <string>\nusing namespace std;\n\nbool isHappy(int n) {\n    // Write your code here\n    return false;\n}\n",
      "java": "class Solution {\n    public boolean isHappy(int n) {\n        // Write your code here\n        return false;\n    }\n}\n",
      "c": "#include <stdio.h>\n#include <stdbool.h>\n\nbool isHappy(int n) {\n    // Write your code here\n    return false;\n}\n"
    },
    "testCases": [
      {
        "input": "19",
        "expectedOutput": "true"
      },
      {
        "input": "2",
        "expectedOutput": "false"
      },
      {
        "input": "7",
        "expectedOutput": "true"
      },
      {
        "input": "1",
        "expectedOutput": "true"
      }
    ],
    "hiddenTestCases": [
      {
        "input": "19",
        "expectedOutput": "true"
      },
      {
        "input": "2",
        "expectedOutput": "false"
      }
    ]
  },
  {
    "id": "p_pow_x_n",
    "title": "Pow(x, n)",
    "category": "Greedy & Math",
    "difficulty": "Medium",
    "acceptance": "34.8%",
    "companies": [
      "Google",
      "Facebook",
      "Microsoft"
    ],
    "functionName": "myPow",
    "hints": [
      "Binary exponentiation: square x and halve n."
    ],
    "description": "Implement pow(x, n), which calculates x raised to the power n (i.e., x^n).",
    "constraints": [
      "-100.0 < x < 100.0",
      "-2^31 <= n <= 2^31 - 1"
    ],
    "examples": [
      {
        "input": "x = 2.00000, n = 10",
        "output": "1024.0"
      },
      {
        "input": "x = 2.10000, n = 3",
        "output": "9.261"
      }
    ],
    "starterCode": {
      "python": "def myPow(x: float, n: int) -> float:\n    # Write your solution here\n    pass\n",
      "javascript": "function myPow(x, n) {\n  // Write your solution here\n}\n",
      "cpp": "#include <vector>\n#include <string>\nusing namespace std;\n\ndouble myPow(double x, int n) {\n    // Write your code here\n    return 1.0;\n}\n",
      "java": "class Solution {\n    public double myPow(double x, int n) {\n        // Write your code here\n        return 1.0;\n    }\n}\n",
      "c": "#include <stdio.h>\n#include <stdbool.h>\n\ndouble myPow(double x, int n) {\n    // Write your code here\n    return 1.0;\n}\n"
    },
    "testCases": [
      {
        "input": "2.0, 10",
        "expectedOutput": "1024.0"
      },
      {
        "input": "2.1, 3",
        "expectedOutput": "9.261"
      },
      {
        "input": "2.0, -2",
        "expectedOutput": "0.25"
      },
      {
        "input": "1.0, 2147483647",
        "expectedOutput": "1.0"
      }
    ],
    "hiddenTestCases": [
      {
        "input": "2.0, 10",
        "expectedOutput": "1024.0"
      },
      {
        "input": "2.1, 3",
        "expectedOutput": "9.261"
      }
    ]
  },
  {
    "id": "p_single_number",
    "title": "Single Number",
    "category": "Bit Manipulation",
    "difficulty": "Easy",
    "acceptance": "72.4%",
    "companies": [
      "Amazon",
      "Google",
      "TCS",
      "Infosys"
    ],
    "functionName": "singleNumber",
    "hints": [
      "XOR all numbers together; duplicate numbers cancel out."
    ],
    "description": "Every element appears twice except for one. Find that single one in O(n) time and O(1) space.",
    "constraints": [
      "1 <= nums.length <= 3 * 10^4"
    ],
    "examples": [
      {
        "input": "nums = [2,2,1]",
        "output": "1"
      },
      {
        "input": "nums = [4,1,2,1,2]",
        "output": "4"
      }
    ],
    "starterCode": {
      "python": "def singleNumber(nums: list[int]) -> int:\n    # Write your solution here\n    pass\n",
      "javascript": "function singleNumber(nums) {\n  // Write your solution here\n}\n",
      "cpp": "#include <vector>\n#include <string>\nusing namespace std;\n\nint singleNumber(vector<int>& nums) {\n    // Write your code here\n    return 0;\n}\n",
      "java": "class Solution {\n    public int singleNumber(int[] nums) {\n        // Write your code here\n        return 0;\n    }\n}\n",
      "c": "#include <stdio.h>\n#include <stdbool.h>\n\nint singleNumber(int* nums, int numsSize) {\n    // Write your code here\n    return 0;\n}\n"
    },
    "testCases": [
      {
        "input": "[2, 2, 1]",
        "expectedOutput": "1"
      },
      {
        "input": "[4, 1, 2, 1, 2]",
        "expectedOutput": "4"
      },
      {
        "input": "[1]",
        "expectedOutput": "1"
      },
      {
        "input": "[-1, -1, -2]",
        "expectedOutput": "-2"
      }
    ],
    "hiddenTestCases": [
      {
        "input": "[2, 2, 1]",
        "expectedOutput": "1"
      },
      {
        "input": "[4, 1, 2, 1, 2]",
        "expectedOutput": "4"
      }
    ]
  },
  {
    "id": "p_number_of_1_bits",
    "title": "Number of 1 Bits (Hamming Weight)",
    "category": "Bit Manipulation",
    "difficulty": "Easy",
    "acceptance": "71.1%",
    "companies": [
      "Microsoft",
      "TCS",
      "Wipro"
    ],
    "functionName": "hammingWeight",
    "hints": [
      "Brian Kernighan's algorithm: n = n & (n - 1) removes lowest set bit."
    ],
    "description": "Return the number of set bits (1s) in the binary representation of a positive integer.",
    "constraints": [
      "1 <= n <= 2^31 - 1"
    ],
    "examples": [
      {
        "input": "n = 11",
        "output": "3"
      },
      {
        "input": "n = 128",
        "output": "1"
      }
    ],
    "starterCode": {
      "python": "def hammingWeight(n: int) -> int:\n    # Write your solution here\n    pass\n",
      "javascript": "function hammingWeight(n) {\n  // Write your solution here\n}\n",
      "cpp": "#include <vector>\n#include <string>\nusing namespace std;\n\nint hammingWeight(int n) {\n    // Write your code here\n    return 0;\n}\n",
      "java": "class Solution {\n    public int hammingWeight(int n) {\n        // Write your code here\n        return 0;\n    }\n}\n",
      "c": "#include <stdio.h>\n#include <stdbool.h>\n\nint hammingWeight(int n) {\n    // Write your code here\n    return 0;\n}\n"
    },
    "testCases": [
      {
        "input": "11",
        "expectedOutput": "3"
      },
      {
        "input": "128",
        "expectedOutput": "1"
      },
      {
        "input": "2147483645",
        "expectedOutput": "30"
      },
      {
        "input": "1",
        "expectedOutput": "1"
      }
    ],
    "hiddenTestCases": [
      {
        "input": "11",
        "expectedOutput": "3"
      },
      {
        "input": "128",
        "expectedOutput": "1"
      }
    ]
  },
  {
    "id": "p_counting_bits",
    "title": "Counting Bits",
    "category": "Bit Manipulation",
    "difficulty": "Easy",
    "acceptance": "77.5%",
    "companies": [
      "Amazon",
      "Google"
    ],
    "functionName": "countBits",
    "hints": [
      "ans[i] = ans[i >> 1] + (i & 1)."
    ],
    "description": "Given an integer n, return an array ans of length n + 1 where ans[i] is number of 1s in binary representation of i.",
    "constraints": [
      "0 <= n <= 10^5"
    ],
    "examples": [
      {
        "input": "n = 2",
        "output": "[0,1,1]"
      },
      {
        "input": "n = 5",
        "output": "[0,1,1,2,1,2]"
      }
    ],
    "starterCode": {
      "python": "def countBits(n: int) -> list[int]:\n    # Write your solution here\n    pass\n",
      "javascript": "function countBits(n) {\n  // Write your solution here\n}\n",
      "cpp": "#include <vector>\n#include <string>\nusing namespace std;\n\nvector<int> countBits(int n) {\n    // Write your code here\n    return {};\n}\n",
      "java": "class Solution {\n    public int[] countBits(int n) {\n        // Write your code here\n        return new int[]{};\n    }\n}\n",
      "c": "#include <stdio.h>\n#include <stdbool.h>\n\nint* countBits(int n, int* returnSize) {\n    // Write your code here\n    return NULL;\n}\n"
    },
    "testCases": [
      {
        "input": "2",
        "expectedOutput": "[0, 1, 1]"
      },
      {
        "input": "5",
        "expectedOutput": "[0, 1, 1, 2, 1, 2]"
      },
      {
        "input": "0",
        "expectedOutput": "[0]"
      },
      {
        "input": "1",
        "expectedOutput": "[0, 1]"
      }
    ],
    "hiddenTestCases": [
      {
        "input": "2",
        "expectedOutput": "[0, 1, 1]"
      },
      {
        "input": "5",
        "expectedOutput": "[0, 1, 1, 2, 1, 2]"
      }
    ]
  },
  {
    "id": "p_reverse_bits",
    "title": "Reverse Bits",
    "category": "Bit Manipulation",
    "difficulty": "Easy",
    "acceptance": "57.8%",
    "companies": [
      "Google",
      "Apple",
      "TCS"
    ],
    "functionName": "reverseBits",
    "hints": [
      "Shift result left by 1 and OR with lowest bit of n 32 times."
    ],
    "description": "Reverse bits of a given 32 bits unsigned integer and return result.",
    "constraints": [
      "n is a 32-bit unsigned integer"
    ],
    "examples": [
      {
        "input": "n = 43261596",
        "output": "964176192"
      }
    ],
    "starterCode": {
      "python": "def reverseBits(n: int) -> int:\n    # Write your solution here\n    pass\n",
      "javascript": "function reverseBits(n) {\n  // Write your solution here\n}\n",
      "cpp": "#include <vector>\n#include <string>\nusing namespace std;\n\nuint32_t reverseBits(uint32_t n) {\n    // Write your code here\n    return 0;\n}\n",
      "java": "class Solution {\n    public int reverseBits(int n) {\n        // Write your code here\n        return 0;\n    }\n}\n",
      "c": "#include <stdio.h>\n#include <stdbool.h>\n\nuint32_t reverseBits(uint32_t n) {\n    // Write your code here\n    return 0;\n}\n"
    },
    "testCases": [
      {
        "input": "43261596",
        "expectedOutput": "964176192"
      },
      {
        "input": "1",
        "expectedOutput": "2147483648"
      },
      {
        "input": "0",
        "expectedOutput": "0"
      },
      {
        "input": "2147483648",
        "expectedOutput": "1"
      }
    ],
    "hiddenTestCases": [
      {
        "input": "43261596",
        "expectedOutput": "964176192"
      },
      {
        "input": "1",
        "expectedOutput": "2147483648"
      }
    ]
  },
  {
    "id": "p_sum_of_two_integers",
    "title": "Sum of Two Integers",
    "category": "Bit Manipulation",
    "difficulty": "Medium",
    "acceptance": "51.4%",
    "companies": [
      "Google",
      "Facebook"
    ],
    "functionName": "getSum",
    "hints": [
      "Sum without carry is a ^ b; carry is (a & b) << 1."
    ],
    "description": "Given two integers a and b, return the sum of the two integers without using the operators + and -.",
    "constraints": [
      "-1000 <= a, b <= 1000"
    ],
    "examples": [
      {
        "input": "a = 1, b = 2",
        "output": "3"
      },
      {
        "input": "a = 2, b = 3",
        "output": "5"
      }
    ],
    "starterCode": {
      "python": "def getSum(a: int, b: int) -> int:\n    # Write your solution here\n    pass\n",
      "javascript": "function getSum(a, b) {\n  // Write your solution here\n}\n",
      "cpp": "#include <vector>\n#include <string>\nusing namespace std;\n\nint getSum(int a, int b) {\n    // Write your code here\n    return 0;\n}\n",
      "java": "class Solution {\n    public int getSum(int a, int b) {\n        // Write your code here\n        return 0;\n    }\n}\n",
      "c": "#include <stdio.h>\n#include <stdbool.h>\n\nint getSum(int a, int b) {\n    // Write your code here\n    return 0;\n}\n"
    },
    "testCases": [
      {
        "input": "1, 2",
        "expectedOutput": "3"
      },
      {
        "input": "2, 3",
        "expectedOutput": "5"
      },
      {
        "input": "0, 0",
        "expectedOutput": "0"
      },
      {
        "input": "-1, 1",
        "expectedOutput": "0"
      }
    ],
    "hiddenTestCases": [
      {
        "input": "1, 2",
        "expectedOutput": "3"
      },
      {
        "input": "2, 3",
        "expectedOutput": "5"
      }
    ]
  },
  {
    "id": "p_add_binary",
    "title": "Add Binary",
    "category": "Bit Manipulation",
    "difficulty": "Easy",
    "acceptance": "53.2%",
    "companies": [
      "Facebook",
      "Microsoft",
      "TCS"
    ],
    "functionName": "addBinary",
    "hints": [
      "Simulate column addition from right to left with carry."
    ],
    "description": "Given two binary strings `a` and `b`, return their sum as a binary string.",
    "constraints": [
      "1 <= a.length, b.length <= 10^4"
    ],
    "examples": [
      {
        "input": "a = \"11\", b = \"1\"",
        "output": "\"100\""
      },
      {
        "input": "a = \"1010\", b = \"1011\"",
        "output": "\"10101\""
      }
    ],
    "starterCode": {
      "python": "def addBinary(a: str, b: str) -> str:\n    # Write your solution here\n    pass\n",
      "javascript": "function addBinary(a, b) {\n  // Write your solution here\n}\n",
      "cpp": "#include <vector>\n#include <string>\nusing namespace std;\n\nstring addBinary(string a, string b) {\n    // Write your code here\n    return \"\";\n}\n",
      "java": "class Solution {\n    public String addBinary(String a, String b) {\n        // Write your code here\n        return \"\";\n    }\n}\n",
      "c": "#include <stdio.h>\n#include <stdbool.h>\n\nchar* addBinary(char* a, char* b) {\n    // Write your code here\n    return NULL;\n}\n"
    },
    "testCases": [
      {
        "input": "\"11\", \"1\"",
        "expectedOutput": "\"100\""
      },
      {
        "input": "\"1010\", \"1011\"",
        "expectedOutput": "\"10101\""
      },
      {
        "input": "\"0\", \"0\"",
        "expectedOutput": "\"0\""
      },
      {
        "input": "\"1\", \"0\"",
        "expectedOutput": "\"1\""
      }
    ],
    "hiddenTestCases": [
      {
        "input": "\"11\", \"1\"",
        "expectedOutput": "\"100\""
      },
      {
        "input": "\"1010\", \"1011\"",
        "expectedOutput": "\"10101\""
      }
    ]
  },
  {
    "id": "p_single_number_ii",
    "title": "Single Number II",
    "category": "Bit Manipulation",
    "difficulty": "Medium",
    "acceptance": "61.3%",
    "companies": [
      "Google",
      "Amazon"
    ],
    "functionName": "singleNumberII",
    "hints": [
      "Count bits modulo 3 or use ones and twos bitmask state machine."
    ],
    "description": "Every element appears three times except for one, which appears exactly once. Find that single one in O(n) time and O(1) space.",
    "constraints": [
      "1 <= nums.length <= 3 * 10^4"
    ],
    "examples": [
      {
        "input": "nums = [2,2,3,2]",
        "output": "3"
      },
      {
        "input": "nums = [0,1,0,1,0,1,99]",
        "output": "99"
      }
    ],
    "starterCode": {
      "python": "def singleNumberII(nums: list[int]) -> int:\n    # Write your solution here\n    pass\n",
      "javascript": "function singleNumberII(nums) {\n  // Write your solution here\n}\n",
      "cpp": "#include <vector>\n#include <string>\nusing namespace std;\n\nint singleNumberII(vector<int>& nums) {\n    // Write your code here\n    return 0;\n}\n",
      "java": "class Solution {\n    public int singleNumberII(int[] nums) {\n        // Write your code here\n        return 0;\n    }\n}\n",
      "c": "#include <stdio.h>\n#include <stdbool.h>\n\nint singleNumberII(int* nums, int numsSize) {\n    // Write your code here\n    return 0;\n}\n"
    },
    "testCases": [
      {
        "input": "[2, 2, 3, 2]",
        "expectedOutput": "3"
      },
      {
        "input": "[0, 1, 0, 1, 0, 1, 99]",
        "expectedOutput": "99"
      },
      {
        "input": "[1]",
        "expectedOutput": "1"
      },
      {
        "input": "[-2, -2, 1, -2]",
        "expectedOutput": "1"
      }
    ],
    "hiddenTestCases": [
      {
        "input": "[2, 2, 3, 2]",
        "expectedOutput": "3"
      },
      {
        "input": "[0, 1, 0, 1, 0, 1, 99]",
        "expectedOutput": "99"
      }
    ]
  }
];
