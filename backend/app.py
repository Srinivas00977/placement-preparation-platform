"""
PlacePilot AI — Backend Server
Flask + Flask-CORS + Werkzeug Password Hashing + Persistent File Storage (users.json)
"""

import os
import re
import json
import uuid
import urllib.request
from datetime import datetime, timezone
from flask import Flask, request, jsonify
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
import backend.db as db

ALLOWED_ORIGINS: list[str | re.Pattern[str]] = [
    "http://localhost:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:5174",
    re.compile(r"^https://.*\.vercel\.app$"),
]
env_frontend = os.environ.get("FRONTEND_URL", "").strip()

app = Flask(__name__)
# Enable CORS with allowed local/Vercel frontend origins or FRONTEND_URL override
if env_frontend == "*":
    CORS(app, resources={r"/api/*": {"origins": "*"}}, supports_credentials=True)
else:
    for origin in env_frontend.split(","):
        cleaned = origin.strip().rstrip("/")
        if cleaned and cleaned not in ALLOWED_ORIGINS:
            ALLOWED_ORIGINS.append(cleaned)
    CORS(app, resources={r"/api/*": {"origins": ALLOWED_ORIGINS}}, supports_credentials=True)

@app.after_request
def add_security_headers(response):
    """Inject industry-standard HTTP security headers."""
    response.headers['X-Content-Type-Options'] = 'nosniff'
    response.headers['X-Frame-Options'] = 'DENY'
    response.headers['Referrer-Policy'] = 'strict-origin-when-cross-origin'
    return response

# In-memory sliding-window rate limiter for sensitive authentication endpoints
login_attempts: dict[str, list[float]] = {}

def is_login_rate_limited(ip: str, max_attempts: int = 10, window_seconds: int = 300) -> bool:
    """Sliding-window IP rate limiter: max_attempts within window_seconds (default: 10 per 5 min)."""
    now = datetime.now(timezone.utc).timestamp()
    attempts = login_attempts.get(ip, [])
    # Filter attempts within the current sliding window
    recent_attempts = [t for t in attempts if now - t < window_seconds]
    if len(recent_attempts) >= max_attempts:
        login_attempts[ip] = recent_attempts
        return True
    recent_attempts.append(now)
    login_attempts[ip] = recent_attempts
    return False

# Initialize SQLite database and seed tables on startup
db.init_db()

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, 'data')
USERS_FILE = os.path.join(DATA_DIR, 'users.json')

# Ensure data directory exists
os.makedirs(DATA_DIR, exist_ok=True)

def load_data():
    """Load users and session records from persistent users.json file."""
    if not os.path.exists(USERS_FILE):
        initial = {"users": {}, "sessions": {}}
        save_data(initial)
        return initial
    try:
        with open(USERS_FILE, 'r', encoding='utf-8') as f:
            data = json.load(f)
            if not isinstance(data, dict):
                data = {"users": {}, "sessions": {}}
            if "users" not in data:
                data["users"] = {}
            if "sessions" not in data:
                data["sessions"] = {}
            return data
    except Exception as e:
        app.logger.error(f"Error reading users.json: {e}")
        return {"users": {}, "sessions": {}}

def save_data(data):
    """Save users and session records atomically to users.json file."""
    try:
        temp_file = USERS_FILE + '.tmp'
        with open(temp_file, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        os.replace(temp_file, USERS_FILE)
    except Exception as e:
        app.logger.error(f"Error saving users.json: {e}")

def get_default_user_state(name):
    """Default initialized state for fresh accounts."""
    now_iso = datetime.now(timezone.utc).isoformat()
    today_str = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    return {
        "profile": {
            "targetRole": "Software Engineer",
            "dailyGoalHours": 3,
            "preparationStage": "Intermediate",
            "preferredDifficulty": "Medium",
            "targetCompanyType": "Top Product Companies & MNCs",
            "targetCompanies": ["TCS", "Amazon", "Google"]
        },
        "assessment": None,
        "aptitudeAttempts": [],
        "solvedCodingProblemIds": [],
        "codingSubmissions": [],
        "completedTechnicalTopicIds": [],
        "hrAnswers": [],
        "latestResumeAnalysis": None,
        "goals": [
            {
                "id": "g_default_1",
                "title": "Complete First Diagnostic Skill Assessment",
                "category": "General",
                "targetDate": today_str,
                "reminderNote": "Establish baseline performance metrics before campus placement drives.",
                "completed": False,
                "createdAt": now_iso
            },
            {
                "id": "g_default_2",
                "title": "Solve 5 Placement DSA Problems (Arrays & Strings)",
                "category": "Coding",
                "targetDate": today_str,
                "reminderNote": "Practice Two Sum, Valid Anagram, and Maximum Subarray in browser runner.",
                "completed": False,
                "createdAt": now_iso
            }
        ],
        "roadmap": None,
        "overallReadiness": 0
    }

def get_authenticated_user():
    """Extract user record based on Bearer token or email query/body."""
    auth_header = request.headers.get("Authorization", "")
    token = None
    if auth_header.startswith("Bearer "):
        token = auth_header[7:].strip()
    
    data = load_data()
    email = None
    if token and token in data.get("sessions", {}):
        email = data["sessions"][token]
    
    if not email:
        # Fallback to query param or JSON payload if provided
        req_json = request.get_json(silent=True) or {}
        email = request.args.get("email") or req_json.get("email")
        if email:
            email = email.strip().lower()

    if email and email in data.get("users", {}):
        return data["users"][email], data, email
    return None, data, None

# ---------------------------------------------------------------------------
# API ROUTES
# ---------------------------------------------------------------------------

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint to verify backend connectivity."""
    data = load_data()
    return jsonify({
        "status": "healthy",
        "service": "PlacePilot AI Auth & Storage Backend",
        "registered_users": len(data.get("users", {})),
        "timestamp": datetime.now(timezone.utc).isoformat()
    }), 200

@app.route('/api/auth/register', methods=['POST'])
def register():
    """
    Register a new user account.
    Saves full name, email, and securely hashed password.
    Rejects duplicate emails.
    Does NOT auto-login (client redirects to /login).
    """
    body = request.get_json(silent=True) or {}
    full_name = (body.get("fullName") or "").strip()
    email = (body.get("email") or "").strip().lower()
    password = body.get("password") or ""

    if not full_name or not email or not password:
        return jsonify({
            "success": False,
            "message": "Full name, email address, and password are required."
        }), 400

    if "@" not in email or "." not in email or len(email) > 254:
        return jsonify({
            "success": False,
            "message": "Please enter a valid email address."
        }), 400

    if len(password) < 6:
        return jsonify({
            "success": False,
            "message": "Password must be at least 6 characters."
        }), 400

    data = load_data()
    if email in data.get("users", {}):
        return jsonify({
            "success": False,
            "message": "An account with this email address already exists. Please sign in."
        }), 400

    # Generate secure password hash using Werkzeug (scrypt/pbkdf2)
    pwd_hash = generate_password_hash(password)
    user_id = f"usr_{uuid.uuid4().hex[:10]}"
    now_iso = datetime.now(timezone.utc).isoformat()

    new_user = {
        "id": user_id,
        "name": full_name,
        "email": email,
        "password_hash": pwd_hash,
        "provider": "email",
        "created_at": now_iso,
        "last_login": None,
        "state": get_default_user_state(full_name)
    }

    data["users"][email] = new_user
    save_data(data)

    app.logger.info(f"Registered new user: {email} ({user_id})")

    return jsonify({
        "success": True,
        "message": "Account created successfully. Please sign in."
    }), 201

@app.route('/api/auth/login', methods=['POST'])
def login():
    """
    Authenticate user via email and password against stored Werkzeug hash.
    Generates session token and returns saved state.
    Protected with sliding-window IP rate limiting (10 attempts / 5 mins).
    """
    client_ip = request.headers.get("X-Forwarded-For", request.remote_addr or "unknown").split(",")[0].strip()
    if is_login_rate_limited(client_ip, max_attempts=10, window_seconds=300):
        return jsonify({
            "success": False,
            "message": "Too many login attempts. Please wait 5 minutes before trying again."
        }), 429

    body = request.get_json(silent=True) or {}
    email = (body.get("email") or "").strip().lower()
    password = body.get("password") or ""

    if not email or not password or "@" not in email or "." not in email:
        return jsonify({
            "success": False,
            "message": "Invalid email or password."
        }), 400

    data = load_data()
    user = data.get("users", {}).get(email)

    if not user:
        return jsonify({
            "success": False,
            "message": "Invalid email or password."
        }), 401

    # Verify password hash
    stored_hash = user.get("password_hash")
    if not stored_hash or not check_password_hash(stored_hash, password):
        return jsonify({
            "success": False,
            "message": "Invalid email or password."
        }), 401

    # Issue session token
    token = f"pp_jwt_{uuid.uuid4().hex}"
    data["sessions"][token] = email
    user["last_login"] = datetime.now(timezone.utc).isoformat()
    save_data(data)

    app.logger.info(f"User signed in: {email}")

    return jsonify({
        "success": True,
        "user": {
            "id": user["id"],
            "name": user["name"],
            "email": user["email"],
            "picture": user.get("picture"),
            "provider": user.get("provider", "email")
        },
        "token": token,
        "state": user.get("state")
    }), 200

@app.route('/api/auth/google', methods=['POST'])
def google_auth():
    """
    Process verified Google account information.
    Creates account in users.json if first time, or loads existing saved account & state.
    """
    body = request.get_json(silent=True) or {}
    email = (body.get("email") or "").strip().lower()
    name = (body.get("name") or "").strip()
    sub = (body.get("sub") or "").strip()
    picture = body.get("picture")

    if not email:
        return jsonify({
            "success": False,
            "message": "Valid Google account email is required."
        }), 400

    data = load_data()
    user = data.get("users", {}).get(email)
    now_iso = datetime.now(timezone.utc).isoformat()

    if not user:
        # Create fresh account for first-time Google sign-in
        user_id = f"usr_g_{sub[:10] if sub else uuid.uuid4().hex[:10]}"
        user = {
            "id": user_id,
            "name": name or email.split('@')[0],
            "email": email,
            "password_hash": "google_oauth_protected",
            "picture": picture,
            "provider": "google",
            "created_at": now_iso,
            "last_login": now_iso,
            "state": get_default_user_state(name or email.split('@')[0])
        }
        data["users"][email] = user
        app.logger.info(f"Created new Google user: {email} ({user_id})")
    else:
        # Update name and avatar if provided
        if name:
            user["name"] = name
        if picture:
            user["picture"] = picture
        user["last_login"] = now_iso
        app.logger.info(f"Existing Google user signed in: {email}")

    # Generate session token
    token = f"pp_jwt_google_{uuid.uuid4().hex}"
    data["sessions"][token] = email
    save_data(data)

    return jsonify({
        "success": True,
        "user": {
            "id": user["id"],
            "name": user["name"],
            "email": user["email"],
            "picture": user.get("picture"),
            "provider": user.get("provider", "google")
        },
        "token": token,
        "state": user.get("state")
    }), 200

@app.route('/api/auth/reset-password', methods=['POST'])
def reset_password():
    """
    Update password hash for a registered user account.
    New password becomes active immediately, old password stops working.
    """
    body = request.get_json(silent=True) or {}
    email = (body.get("email") or "").strip().lower()
    new_password = body.get("newPassword") or ""

    if not email or not new_password:
        return jsonify({
            "success": False,
            "message": "Email and new password are required."
        }), 400

    if len(new_password) < 6:
        return jsonify({
            "success": False,
            "message": "Password must be at least 6 characters."
        }), 400

    data = load_data()
    user = data.get("users", {}).get(email)

    if not user:
        # If user was not yet in users.json (e.g. registered locally in mock mode),
        # create their server account so password reset still succeeds smoothly
        user_id = f"usr_{uuid.uuid4().hex[:10]}"
        now_iso = datetime.now(timezone.utc).isoformat()
        user = {
            "id": user_id,
            "name": email.split('@')[0],
            "email": email,
            "password_hash": generate_password_hash(new_password),
            "provider": "email",
            "created_at": now_iso,
            "last_login": None,
            "state": get_default_user_state(email.split('@')[0])
        }
        data["users"][email] = user
    else:
        user["password_hash"] = generate_password_hash(new_password)

    save_data(data)
    app.logger.info(f"Password reset completed for: {email}")

    return jsonify({
        "success": True,
        "message": "Password updated successfully. You can now sign in with your new password."
    }), 200

@app.route('/api/user/state', methods=['GET'])
def get_user_state():
    """Retrieve saved dashboard progress, skill assessment, and stats for active user."""
    user, _, email = get_authenticated_user()
    if not user:
        return jsonify({
            "success": False,
            "message": "User session not found or unauthorized."
        }), 401

    return jsonify({
        "success": True,
        "email": email,
        "state": user.get("state")
    }), 200

@app.route('/api/user/state', methods=['POST'])
def save_user_state():
    """Save/update dashboard progress, skill assessment, and stats for active user."""
    user, data, email = get_authenticated_user()
    if not user or not email:
        return jsonify({
            "success": False,
            "message": "User session not found or unauthorized."
        }), 401

    body = request.get_json(silent=True) or {}
    new_state = body.get("state")

    if new_state and isinstance(new_state, dict):
        user["state"] = new_state
        save_data(data)
        return jsonify({
            "success": True,
            "message": "User state updated successfully."
        }), 200

    return jsonify({
        "success": False,
        "message": "Invalid state payload."
    }), 400

@app.route('/api/auth/logout', methods=['POST'])
def logout():
    """Invalidate session token on server."""
    auth_header = request.headers.get("Authorization", "")
    token = None
    if auth_header.startswith("Bearer "):
        token = auth_header[7:].strip()

    if token:
        data = load_data()
        if token in data.get("sessions", {}):
            del data["sessions"][token]
            save_data(data)

    return jsonify({"success": True}), 200

# ---------------------------------------------------------------------------
# DAILY SKILL ASSESSMENT & SQLITE ENDPOINTS
# ---------------------------------------------------------------------------

@app.route('/api/assessment/status', methods=['GET'])
def assessment_status():
    """
    Check if user completed today's assessment, fetch daily streak,
    and generate bell notification alert.
    """
    email = (request.args.get("email") or "").strip().lower()
    today_str = datetime.now(timezone.utc).strftime("%Y-%m-%d")

    status = db.get_assessment_status(email, today_str)
    return jsonify({
        "success": True,
        "date": today_str,
        **status
    }), 200

@app.route('/api/assessment/daily', methods=['GET'])
def get_daily_assessment_set():
    """
    Return today's role-matched assessment set with dynamic length (20 to 35 questions):
    - Base: 20 questions (Aptitude, Logical, Technical, Coding, HR)
    - Missed day penalty: +5 questions per missed day up to 35 max.
    """
    email = (request.args.get("email") or "").strip().lower()
    role = (request.args.get("role") or "Software Engineer (SDE)").strip()
    today_str = datetime.now(timezone.utc).strftime("%Y-%m-%d")

    status = db.get_assessment_status(email, today_str)
    history = db.get_assessment_history(email, limit=7)
    required_count = status.get("requiredQuestions", 20)
    questions = db.get_daily_questions(email, role, today_str, total_count=required_count)

    return jsonify({
        "success": True,
        "date": today_str,
        "role": role,
        "completedToday": status["completedToday"],
        "dailyStreak": status["dailyStreak"],
        "requiredQuestions": required_count,
        "penaltyQuestions": status.get("penaltyQuestions", 0),
        "missedDays": status.get("missedDays", 0),
        "notificationMessage": status.get("notificationMessage"),
        "history": history,
        "questions": questions,
        "todayAssessment": status.get("todayAssessment")
    }), 200

@app.route('/api/assessment/submit', methods=['POST'])
def submit_daily_assessment():
    """
    Save submitted assessment into SQLite daily_assessments table
    and sync with user state in users.json.
    """
    body = request.get_json(silent=True) or {}
    email = (body.get("email") or "").strip().lower()
    role = (body.get("role") or "Software Engineer (SDE)").strip()
    today_str = body.get("date") or datetime.now(timezone.utc).strftime("%Y-%m-%d")

    if not email:
        return jsonify({
            "success": False,
            "message": "User email is required to record assessment."
        }), 400

    record_res = db.record_assessment(body)

    # Sync state in users.json if user exists
    data = load_data()
    if email in data.get("users", {}):
        user = data["users"][email]
        if "state" not in user or not isinstance(user["state"], dict):
            user["state"] = get_default_user_state(user.get("name", "Candidate"))

        # Update assessment object
        user["state"]["assessment"] = {
            "scores": {
                "aptitude": float(body.get("aptitudeScore", 0)),
                "coding": float(body.get("codingScore", 0)),
                "technical": float(body.get("technicalScore", 0)),
                "hr": float(body.get("hrScore", 0)),
                "overall": float(body.get("overallScore", 0))
            },
            "targetRole": role,
            "strengths": body.get("strengths", []),
            "weaknesses": body.get("weaknesses", []),
            "skillGaps": body.get("skillGaps", []),
            "completedAt": datetime.now(timezone.utc).isoformat(),
            "wrongQuestions": body.get("wrongQuestions", [])
        }
        user["state"]["overallReadiness"] = float(body.get("overallScore", 0))
        save_data(data)

    return jsonify({
        "success": True,
        "message": "Daily assessment recorded successfully!",
        **record_res
    }), 200

@app.route('/api/assessment/history', methods=['GET'])
def get_history():
    """Get history of past daily assessments for the user."""
    email = (request.args.get("email") or "").strip().lower()
    limit = int(request.args.get("limit", 10))
    history = db.get_assessment_history(email, limit=limit)
    return jsonify({
        "success": True,
        "history": history
    }), 200

# ---------------------------------------------------------------------------
# AI CODING QUESTION GENERATOR ENDPOINT
# ---------------------------------------------------------------------------

@app.route('/api/coding/generate', methods=['POST'])
def generate_coding_problem():
    """
    Synthesize an authentic interview coding challenge for campus placements.
    Uses Gemini API if key is present, otherwise falls back to dynamic procedural catalog.
    Always returns strict JSON with empty starter boilerplate and 4 runnable test cases.
    """
    body = request.get_json(silent=True) or {}
    company_input = body.get("company") or "Any Company"
    topic = (body.get("topic") or "Arrays & Hashing").strip()
    difficulty = body.get("difficulty") or "Medium"

    comp_label = "Top Tech MNC (such as Amazon, Google, Microsoft)" if company_input == "Any Company" else company_input
    comp_tag = "Top Tech" if company_input == "Any Company" else company_input

    api_key = os.environ.get("VITE_GEMINI_API_KEY") or os.environ.get("GEMINI_API_KEY")

    if api_key and len(api_key.strip()) > 10 and "your_gemini_api_key" not in api_key:
        try:
            prompt = f"""You are PlacePilot AI's elite DSA question generator for campus recruitment drives.
Create a real, authentic technical interview coding problem asked during {comp_label} campus placements.
Topic: {topic}
Difficulty: {difficulty}

STRICT REQUIREMENTS:
1. Provide a realistic title, clear problem description, constraints, and 2 concrete examples.
2. Starter boilerplate ONLY (function signature with comment "// Write your code here" or "# Write your code here / pass"). NEVER INCLUDE THE WORKING SOLUTION CODE!
3. Provide an exact functionName (e.g. solve, countSubstrings, findTarget, etc.).
4. Provide at least 4 runnable testCases with inputs format (e.g. "[1, 2, 3], 4" or ""abc", "bcd"") and expectedOutput.
5. Return ONLY a valid JSON object matching this schema:
{{
  "id": "p_ai_{int(datetime.now(timezone.utc).timestamp())}",
  "title": "Problem Title",
  "category": "{topic}",
  "difficulty": "{difficulty}",
  "acceptance": "55%",
  "companies": ["{comp_tag}"],
  "functionName": "exampleFunc",
  "hints": ["Hint 1", "Hint 2"],
  "description": "Markdown description",
  "constraints": ["1 <= n <= 10^5"],
  "examples": [
    {{ "input": "nums = [1, 2]", "output": "3", "explanation": "..." }}
  ],
  "starterCode": {{
    "javascript": "function exampleFunc(...) {{\\n  // Write your code here\\n}}",
    "python": "def exampleFunc(...):\\n    # Write your code here\\n    pass",
    "cpp": "#include <vector>\\nusing namespace std;\\n\\nint exampleFunc(...) {{\\n    // Write your code here\\n    return 0;\\n}}",
    "java": "class Solution {{\\n    public int exampleFunc(...) {{\\n        // Write your code here\\n        return 0;\\n    }}\\n}}",
    "c": "#include <stdio.h>\\n\\nint exampleFunc(...) {{\\n    // Write your code here\\n    return 0;\\n}}"
  }},
  "testCases": [
    {{ "input": "...", "expectedOutput": "..." }},
    {{ "input": "...", "expectedOutput": "..." }},
    {{ "input": "...", "expectedOutput": "..." }},
    {{ "input": "...", "expectedOutput": "..." }}
  ]
}}
Raw JSON only without markdown fences."""
            req_data = json.dumps({
                "contents": [{"parts": [{"text": prompt}]}],
                "generationConfig": {"temperature": 0.3, "maxOutputTokens": 2500}
            }).encode('utf-8')

            url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={api_key}"
            req = urllib.request.Request(url, data=req_data, headers={'Content-Type': 'application/json'})
            with urllib.request.urlopen(req, timeout=10) as resp:
                res_body = json.loads(resp.read().decode('utf-8'))
                raw_text = res_body.get('candidates', [{}])[0].get('content', {}).get('parts', [{}])[0].get('text', '')
                clean_json = raw_text.replace("```json", "").replace("```", "").strip()
                problem = json.loads(clean_json)
                return jsonify({"success": True, "source": "gemini", "problem": problem}), 200
        except Exception as e:
            app.logger.warning(f"Gemini generation failed: {e}. Falling back to procedural generator.")

    # High-quality procedural generator fallback
    ts = int(datetime.now(timezone.utc).timestamp())
    company = comp_tag
    templates = {
        "Arrays": {
            "title": f"{company} Drive: Subarray Product Less Than K",
            "fn": "numSubarrayProductLessThanK",
            "desc": f"Asked in {company} Technical Interviews.\n\nGiven an array of integers `nums` and an integer `k`, return the number of contiguous subarrays where the product of all the elements in the subarray is strictly less than `k`.",
            "constraints": ["1 <= nums.length <= 3 * 10^4", "1 <= nums[i] <= 1000", "0 <= k <= 10^6"],
            "examples": [
                {"input": "nums = [10,5,2,6], k = 100", "output": "8", "explanation": "The 8 subarrays are: [10], [5], [2], [6], [10,5], [5,2], [2,6], [5,2,6]."},
                {"input": "nums = [1,2,3], k = 0", "output": "0", "explanation": "No positive integer subarray has product < 0."}
            ],
            "starter": {
                "python": "def numSubarrayProductLessThanK(nums: list[int], k: int) -> int:\n    # Write your solution here\n    pass\n",
                "javascript": "function numSubarrayProductLessThanK(nums, k) {\n  // Write your solution here\n}\n",
                "cpp": "#include <vector>\nusing namespace std;\n\nint numSubarrayProductLessThanK(vector<int>& nums, int k) {\n    // Write your code here\n    return 0;\n}\n",
                "java": "class Solution {\n    public int numSubarrayProductLessThanK(int[] nums, int k) {\n        // Write your code here\n        return 0;\n    }\n}\n",
                "c": "#include <stdio.h>\n\nint numSubarrayProductLessThanK(int* nums, int numsSize, int k) {\n    // Write your code here\n    return 0;\n}\n"
            },
            "cases": [
                {"input": "[10, 5, 2, 6], 100", "expectedOutput": "8"},
                {"input": "[1, 2, 3], 0", "expectedOutput": "0"},
                {"input": "[1, 1, 1], 1", "expectedOutput": "0"},
                {"input": "[1, 2, 3, 4], 10", "expectedOutput": "7"}
            ]
        },
        "Strings": {
            "title": f"{company} Special: Longest Common Prefix",
            "fn": "longestCommonPrefix",
            "desc": f"Frequently tested during {company} Campus Hiring.\n\nWrite a function to find the longest common prefix string amongst an array of strings. If there is no common prefix, return an empty string `\"\"`.",
            "constraints": ["1 <= strs.length <= 200", "0 <= strs[i].length <= 200", "strs[i] consists of only lowercase English letters."],
            "examples": [
                {"input": "strs = [\"flower\",\"flow\",\"flight\"]", "output": "\"fl\""},
                {"input": "strs = [\"dog\",\"racecar\",\"car\"]", "output": "\"\""}
            ],
            "starter": {
                "python": "def longestCommonPrefix(strs: list[str]) -> str:\n    # Write your solution here\n    pass\n",
                "javascript": "function longestCommonPrefix(strs) {\n  // Write your solution here\n}\n",
                "cpp": "#include <vector>\n#include <string>\nusing namespace std;\n\nstring longestCommonPrefix(vector<string>& strs) {\n    // Write your code here\n    return \"\";\n}\n",
                "java": "class Solution {\n    public String longestCommonPrefix(String[] strs) {\n        // Write your code here\n        return \"\";\n    }\n}\n",
                "c": "#include <stdio.h>\n\nchar* longestCommonPrefix(char** strs, int strsSize) {\n    // Write your code here\n    return \"\";\n}\n"
            },
            "cases": [
                {"input": "[\"flower\", \"flow\", \"flight\"]", "expectedOutput": "\"fl\""},
                {"input": "[\"dog\", \"racecar\", \"car\"]", "expectedOutput": "\"\""},
                {"input": "[\"interspecies\", \"interstellar\", \"interstate\"]", "expectedOutput": "\"inters\""},
                {"input": "[\"throne\", \"throne\"]", "expectedOutput": "\"throne\""}
            ]
        },
        "Dynamic Programming": {
            "title": f"{company} Interview: Minimum Path Sum",
            "fn": "minPathSum",
            "desc": f"Tested in {company} Advanced Coding Rounds.\n\nGiven a `m x n` grid filled with non-negative numbers, find a path from top left to bottom right, which minimizes the sum of all numbers along its path. You can only move either down or right at any point in time.",
            "constraints": ["m == grid.length", "n == grid[i].length", "1 <= m, n <= 200", "0 <= grid[i][j] <= 200"],
            "examples": [
                {"input": "grid = [[1,3,1],[1,5,1],[4,2,1]]", "output": "7", "explanation": "Because the path 1 -> 3 -> 1 -> 1 -> 1 minimizes the sum."},
                {"input": "grid = [[1,2,3],[4,5,6]]", "output": "12"}
            ],
            "starter": {
                "python": "def minPathSum(grid: list[list[int]]) -> int:\n    # Write your solution here\n    pass\n",
                "javascript": "function minPathSum(grid) {\n  // Write your solution here\n}\n",
                "cpp": "#include <vector>\nusing namespace std;\n\nint minPathSum(vector<vector<int>>& grid) {\n    // Write your code here\n    return 0;\n}\n",
                "java": "class Solution {\n    public int minPathSum(int[][] grid) {\n        // Write your code here\n        return 0;\n    }\n}\n",
                "c": "#include <stdio.h>\n\nint minPathSum(int** grid, int gridSize, int* gridColSize) {\n    // Write your code here\n    return 0;\n}\n"
            },
            "cases": [
                {"input": "[[1, 3, 1], [1, 5, 1], [4, 2, 1]]", "expectedOutput": "7"},
                {"input": "[[1, 2, 3], [4, 5, 6]]", "expectedOutput": "12"},
                {"input": "[[5]]", "expectedOutput": "5"},
                {"input": "[[1, 2], [1, 1]]", "expectedOutput": "3"}
            ]
        }
    }

    t = templates.get(topic)
    if not t:
        # Check if topic matches any known category
        matched_key = next((k for k in templates if k.lower() in topic.lower() or topic.lower() in k.lower()), None)
        base = templates[matched_key].copy() if matched_key else templates["Arrays"].copy()
        t = {
            "title": f"{comp_tag} Drive: {topic} Challenge",
            "fn": base["fn"],
            "desc": f"Tested in {comp_tag} Technical Placement Rounds.\n\nImplement an optimal solution for {topic}. Ensure your algorithm meets the required time and space complexity constraints.",
            "constraints": base["constraints"],
            "examples": base["examples"],
            "starter": base["starter"],
            "cases": base["cases"],
        }
    else:
        t = {
            **t,
            "title": t["title"].replace(company_input, comp_tag) if company_input != comp_tag else t["title"]
        }

    problem = {
        "id": f"p_ai_{ts}",
        "title": t["title"],
        "category": topic,
        "difficulty": difficulty,
        "acceptance": "58.6%",
        "companies": [comp_tag],
        "functionName": t["fn"],
        "hints": [
            f"Analyze the problem using {topic} core principles.",
            "Consider boundary conditions, empty inputs, and large constraint sizes."
        ],
        "description": t["desc"],
        "constraints": t["constraints"],
        "examples": t["examples"],
        "starterCode": t["starter"],
        "testCases": t["cases"],
        "hiddenTestCases": t["cases"][:2]
    }

    return jsonify({"success": True, "source": "procedural", "problem": problem}), 200


# ---------------------------------------------------------------------------
# DYNAMIC APTITUDE QUESTION GENERATOR & SQLITE BANK ENDPOINTS
# ---------------------------------------------------------------------------

@app.route('/api/aptitude/stats', methods=['GET'])
def aptitude_bank_stats():
    """Return total seeded & cached aptitude question counts from SQLite."""
    stats = db.get_aptitude_bank_stats()
    return jsonify({"success": True, **stats}), 200


def _call_gemini_mcq_batch(prompt_text):
    """Shared helper to invoke Gemini Flash and parse a raw JSON array of MCQs cleanly."""
    api_key = os.environ.get("VITE_GEMINI_API_KEY") or os.environ.get("GEMINI_API_KEY")
    if not api_key or len(api_key.strip()) <= 10 or "your_gemini_api_key" in api_key:
        return []
    try:
        req_data = json.dumps({
            "contents": [{"parts": [{"text": prompt_text}]}],
            "generationConfig": {"temperature": 0.35, "maxOutputTokens": 4096}
        }).encode('utf-8')
        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={api_key}"
        req = urllib.request.Request(url, data=req_data, headers={'Content-Type': 'application/json'})
        with urllib.request.urlopen(req, timeout=12) as resp:
            res_body = json.loads(resp.read().decode('utf-8'))
            raw_text = res_body.get('candidates', [{}])[0].get('content', {}).get('parts', [{}])[0].get('text', '')
            clean_json = raw_text.replace("```json", "").replace("```", "").strip()
            parsed = json.loads(clean_json)
            return parsed if isinstance(parsed, list) else []
    except Exception as e:
        app.logger.warning(f"Gemini MCQ generation failed: {e}")
        return []


@app.route('/api/aptitude/generate', methods=['POST'])
def generate_aptitude_questions():
    """
    Fetch non-repeating placement MCQs for any of the 71 Aptitude syllabus topics.
    Accepts count in 15..50 (default 20). Always returns exact requested count.
    """
    body = request.get_json(silent=True) or {}
    topic_id = (body.get("topicId") or "quant-number-system").strip()
    topic = (body.get("topic") or "Number System").strip()
    category = (body.get("category") or "Quantitative").strip()
    difficulty = (body.get("difficulty") or "Medium").strip()
    company = (body.get("company") or "Any Company").strip()
    count = max(15, min(50, int(body.get("count") or 20)))
    force_fresh_ai = bool(body.get("forceFreshAI", False))
    exclude_ids = body.get("excludeIds") or []

    comp_label = "Top Tech MNCs (TCS, Infosys, Wipro, Accenture, Amazon, Deloitte)" if company in ("Any Company", "All Companies", "") else company
    comp_tag = "TCS" if company in ("Any Company", "All Companies", "") else company

    # 1. Fetch SQLite bank questions first (filtered by excludeIds when unseen exist)
    sqlite_qs = db.get_aptitude_questions(
        topic_id=topic_id,
        topic=topic,
        difficulty=difficulty,
        company=company,
        limit=count,
        exclude_ids=exclude_ids,
    )

    api_key = os.environ.get("VITE_GEMINI_API_KEY") or os.environ.get("GEMINI_API_KEY")
    has_valid_key = bool(api_key and len(api_key.strip()) > 10 and "your_gemini_api_key" not in api_key)

    need_ai = has_valid_key and (force_fresh_ai or len(sqlite_qs) < count)
    ai_qs = []
    source_used = "sqlite"

    if need_ai:
        ai_batch_size = min(20, count if force_fresh_ai else max(5, count - len(sqlite_qs)))
        prompt = f"""You are PlacePilot AI's Campus Placement Aptitude Question Generator.
Generate {ai_batch_size} authentic, exam-standard MCQ questions for Indian campus placements ({comp_label}).

Topic: {topic}
Category: {category}
Difficulty: {difficulty}

STRICT REQUIREMENTS:
1. Every math calculation, logical rule, grammar rule, or data interpretation calculation MUST be 100% mathematically accurate.
2. Provide 4 distinct answer choices per question in "options".
3. "correctAnswer" must be the 0-based integer index (0, 1, 2, or 3) of the right option.
4. Provide a concise "shortcutFormula" (trick or rule) AND a clear step-by-step "explanation".
5. Return ONLY a raw JSON array of objects (no markdown fences):
[
  {{
    "question": "...",
    "options": ["...", "...", "...", "..."],
    "correctAnswer": 0,
    "shortcutFormula": "...",
    "explanation": "..."
  }}
]"""
        parsed = _call_gemini_mcq_batch(prompt)
        for item in parsed:
            opts = item.get("options") or []
            ans = item.get("correctAnswer")
            if item.get("question") and len(opts) == 4 and isinstance(ans, int) and 0 <= ans <= 3:
                ai_qs.append({
                    "id": f"apt_ai_{uuid.uuid4().hex[:8]}",
                    "topicId": topic_id,
                    "topic": topic,
                    "category": category,
                    "difficulty": difficulty,
                    "company": comp_tag,
                    "question": item["question"],
                    "options": [str(o) for o in opts],
                    "correctAnswer": ans,
                    "shortcutFormula": item.get("shortcutFormula") or "Apply standard placement shortcut.",
                    "explanation": item.get("explanation") or "Review step-by-step derivation.",
                    "source": "gemini"
                })
        if ai_qs:
            db.save_generated_aptitude_questions(ai_qs)
            source_used = "gemini"

    # 2. Build final list prioritizing AI -> topic SQLite -> parameterized -> category pool
    final_qs = []
    seen_ids = set()
    for q in ai_qs:
        if len(final_qs) >= count:
            break
        final_qs.append(q)
        seen_ids.add(q["id"])

    if len(final_qs) < count:
        param_qs = db.generate_parameterized_aptitude_questions(
            topic_id=topic_id,
            topic=topic,
            category=category,
            difficulty=difficulty,
            company=comp_tag,
            count=max(0, count - len(final_qs)),
        )
        for pq in param_qs:
            if len(final_qs) >= count:
                break
            final_qs.append(pq)
            seen_ids.add(pq["id"])
            if source_used == "sqlite":
                source_used = "procedural"

    for sq in sqlite_qs:
        if len(final_qs) >= count:
            break
        if sq["id"] not in seen_ids:
            final_qs.append(sq)
            seen_ids.add(sq["id"])

    # Fill remainder from same category in SQLite, then overall pool if needed so count is exact
    if len(final_qs) < count:
        conn = db.get_connection()
        cursor = conn.cursor()
        cursor.execute(
            "SELECT * FROM aptitude_questions WHERE category = ? ORDER BY RANDOM();",
            (category,)
        )
        cat_rows = [dict(r) for r in cursor.fetchall()]
        cursor.execute("SELECT * FROM aptitude_questions ORDER BY RANDOM() LIMIT 60;")
        all_rows = [dict(r) for r in cursor.fetchall()]
        conn.close()

        for er in cat_rows + all_rows:
            if len(final_qs) >= count:
                break
            if er["id"] not in seen_ids:
                final_qs.append(db._format_aptitude_row(er))
                seen_ids.add(er["id"])

    return jsonify({
        "success": True,
        "source": source_used,
        "topicId": topic_id,
        "topic": topic,
        "category": category,
        "count": len(final_qs),
        "questions": final_qs[:count]
    }), 200


# ---------------------------------------------------------------------------
# 12-CAREER TECHNICAL PREP GENERATOR, PROGRESS & HR QUIZ ENDPOINTS
# ---------------------------------------------------------------------------

@app.route('/api/technical/progress', methods=['GET'])
def get_tech_progress():
    """Fetch user's completed subtopic IDs from SQLite technical_progress."""
    email = (request.args.get("email") or "guest@placepilot.ai").strip().lower()
    career = request.args.get("career")
    ids = db.get_technical_progress(email, career=career)
    return jsonify({"success": True, "completedSubtopicIds": ids}), 200


@app.route('/api/technical/progress/toggle', methods=['POST'])
def toggle_tech_progress():
    """Toggle completion status of a subtopic for a user and career in SQLite."""
    body = request.get_json(silent=True) or {}
    email = (body.get("email") or "guest@placepilot.ai").strip().lower()
    career = (body.get("career") or "Software Engineer (SDE)").strip()
    subtopic_id = (body.get("subtopicId") or "").strip()
    if not subtopic_id:
        return jsonify({"success": False, "message": "subtopicId is required."}), 400
    completed = db.toggle_technical_progress(email, career, subtopic_id)
    all_ids = db.get_technical_progress(email)
    return jsonify({"success": True, "completed": completed, "completedSubtopicIds": all_ids}), 200


@app.route('/api/technical/generate', methods=['POST'])
def generate_technical_quiz():
    """
    Generate a strict career-filtered technical MCQ quiz (15 / 20 / 30 / 40 / 50 questions).
    ONLY pulls/generates questions belonging to the specified career/role.
    """
    body = request.get_json(silent=True) or {}
    career = (body.get("career") or body.get("role") or "Software Engineer (SDE)").strip()
    company = (body.get("company") or "All Companies").strip()
    topic = (body.get("topic") or "Core Concepts").strip()
    difficulty = (body.get("difficulty") or "Medium").strip()
    count = max(15, min(50, int(body.get("count") or 20)))
    force_fresh_ai = bool(body.get("forceFreshAI", False))
    exclude_ids = body.get("excludeIds") or []

    sqlite_qs = db.get_technical_questions(career, difficulty=difficulty, limit=count, exclude_ids=exclude_ids)
    ai_qs = []
    source_used = "sqlite"

    api_key = os.environ.get("VITE_GEMINI_API_KEY") or os.environ.get("GEMINI_API_KEY")
    has_valid_key = bool(api_key and len(api_key.strip()) > 10 and "your_gemini_api_key" not in api_key)

    company_clause = f" tailored for target company '{company}' hiring pattern" if company and company != "All Companies" else ""

    if has_valid_key and (force_fresh_ai or len(sqlite_qs) < count):
        batch_sz = min(20, count if force_fresh_ai else max(5, count - len(sqlite_qs)))
        prompt = f"""You are PlacePilot AI's Senior Technical Interviewer.
Generate {batch_sz} rigorous technical interview MCQ questions STRICTLY scoped to the career "{career}"{company_clause} (Topic focus: {topic}, Difficulty: {difficulty}).
DO NOT include questions from unrelated careers.

Return ONLY a raw JSON array:
[
  {{
    "topic": "{topic}",
    "question": "...",
    "options": ["...", "...", "...", "..."],
    "correctAnswer": 0,
    "explanation": "..."
  }}
]"""
        parsed = _call_gemini_mcq_batch(prompt)
        for item in parsed:
            opts = item.get("options") or []
            ans = item.get("correctAnswer")
            if item.get("question") and len(opts) == 4 and isinstance(ans, int) and 0 <= ans <= 3:
                ai_qs.append({
                    "id": f"tech_ai_{uuid.uuid4().hex[:8]}",
                    "career": career,
                    "topic": item.get("topic") or topic,
                    "difficulty": difficulty,
                    "question": item["question"],
                    "options": [str(o) for o in opts],
                    "correctAnswer": ans,
                    "explanation": item.get("explanation") or "Review core career documentation.",
                    "source": "gemini"
                })
        if ai_qs:
            db.save_generated_technical_questions(ai_qs)
            source_used = "gemini"

    final_qs = []
    seen_q_texts = set()
    for q in ai_qs + sqlite_qs:
        if len(final_qs) >= count:
            break
        final_qs.append(q)
        seen_q_texts.add(q["question"])

    # If still fewer than requested count (offline without API key), expand cleanly with
    # role-scoped scenario practice frames so exact count is always met strictly within this career!
    base_pool = list(final_qs) or db.get_technical_questions(career, limit=20)
    idx_cycle = 0
    while len(final_qs) < count and base_pool:
        src = base_pool[idx_cycle % len(base_pool)]
        round_num = (idx_cycle // len(base_pool)) + 2
        idx_cycle += 1
        company_tag = f" • {company}" if company and company != "All Companies" else ""
        final_qs.append({
            **src,
            "id": f"tech_var_{uuid.uuid4().hex[:8]}",
            "question": f"[{career}{company_tag} Set #{round_num} — {src['topic']}] {src['question']}",
            "source": "procedural" if source_used != "gemini" else source_used
        })

    return jsonify({
        "success": True,
        "source": source_used,
        "career": career,
        "company": company,
        "count": len(final_qs),
        "questions": final_qs[:count]
    }), 200


@app.route('/api/technical/subtopic-detail', methods=['POST'])
def get_technical_subtopic_detail():
    """
    On-demand placement-grade subtopic explanation, code sample, and quick check.
    Checks SQLite subtopic_details_cache first, calls Gemini API if online with key,
    or falls back cleanly to structured topic metadata.
    """
    body = request.get_json(silent=True) or {}
    career = (body.get("career") or "Software Engineer (SDE)").strip()
    topic = (body.get("topic") or "Core Concepts").strip()
    subtopic = (body.get("subtopic") or "Overview").strip()
    level = (body.get("level") or "Intermediate").strip()
    fallback = body.get("localFallback") or {}

    cached = db.get_cached_subtopic_detail(career, topic, subtopic)
    if cached:
        return jsonify({"success": True, "source": "sqlite", "detail": cached["detail"]}), 200

    api_key = os.environ.get("VITE_GEMINI_API_KEY") or os.environ.get("GEMINI_API_KEY")
    has_valid_key = bool(api_key and len(api_key.strip()) > 10 and "your_gemini_api_key" not in api_key)

    if has_valid_key:
        prompt = f"""You are PlacePilot AI's Principal Technical Interview Coach.
Generate deep placement preparation notes for:
- Career: {career}
- Main Topic: {topic}
- Subtopic: {subtopic}
- Level: {level}

Return ONLY raw JSON (no markdown fences) with exact keys:
{{
  "simpleExplanation": "2-3 crisp beginner-friendly sentences explaining the intuition clearly.",
  "whyRecruitersAsk": "Why technical interviewers test this concept in placement rounds.",
  "conceptChecklist": ["item 1", "item 2", "item 3", "item 4"],
  "codeExample": "short realistic 3-8 line runnable snippet or syntax pattern",
  "quickPracticeQuestion": {{
    "question": "1 crisp interview check MCQ for {subtopic}",
    "options": ["option A", "option B", "option C", "option D"],
    "correctIndex": 0,
    "explanation": "1 concise sentence explaining the correct answer."
  }},
  "completionCriteria": "clear hands-on milestone proving mastery"
}}"""
        try:
            req_data = json.dumps({
                "contents": [{"parts": [{"text": prompt}]}],
                "generationConfig": {"temperature": 0.25, "maxOutputTokens": 1800}
            }).encode('utf-8')
            url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={api_key}"
            req = urllib.request.Request(url, data=req_data, headers={'Content-Type': 'application/json'})
            with urllib.request.urlopen(req, timeout=10) as resp:
                res_body = json.loads(resp.read().decode('utf-8'))
                raw_text = res_body.get('candidates', [{}])[0].get('content', {}).get('parts', [{}])[0].get('text', '')
                clean_json = raw_text.replace("```json", "").replace("```", "").strip()
                parsed = json.loads(clean_json)
                if isinstance(parsed, dict) and parsed.get("simpleExplanation"):
                    qp = parsed.get("quickPracticeQuestion") or {}
                    opts = qp.get("options") if isinstance(qp.get("options"), list) and len(qp.get("options")) == 4 else [
                        f"Applying {subtopic} trade-offs accurately in production scenarios",
                        "Hardcoding static values without edge-case handling",
                        "Skipping validation and ignoring time/space impact",
                        "Mixing unrelated UI layers into storage internals",
                    ]
                    detail_payload = {
                        "simpleExplanation": str(parsed.get("simpleExplanation")),
                        "whyRecruitersAsk": str(parsed.get("whyRecruitersAsk") or fallback.get("whyImportant") or "Evaluates practical engineering depth."),
                        "conceptChecklist": [str(x) for x in (parsed.get("conceptChecklist") or fallback.get("whatToLearn") or [])][:5],
                        "codeExample": str(parsed.get("codeExample") or fallback.get("codeExample") or ""),
                        "quickPracticeQuestion": {
                            "question": str(qp.get("question") or f"Which statement best reflects strong mastery of {subtopic}?"),
                            "options": [str(o) for o in opts],
                            "correctIndex": int(qp.get("correctIndex", 0)) if str(qp.get("correctIndex", 0)).isdigit() and 0 <= int(qp.get("correctIndex", 0)) <= 3 else 0,
                            "explanation": str(qp.get("explanation") or f"Review core edge cases and performance trade-offs of {subtopic}."),
                        },
                        "completionCriteria": str(parsed.get("completionCriteria") or fallback.get("completionCriteria") or f"Implement and test {subtopic} cleanly."),
                    }
                    db.save_cached_subtopic_detail(career, topic, subtopic, level, detail_payload, source="gemini")
                    return jsonify({"success": True, "source": "gemini", "detail": detail_payload}), 200
        except Exception as e:
            app.logger.warning(f"Gemini subtopic detail fetch failed: {e}")

    # Deterministic Local Structured Fallback
    checklist = fallback.get("whatToLearn") or [
        f"Core intuition and syntax of {subtopic}",
        f"Time, space, or architectural trade-offs for {career}",
        f"Common placement edge cases & debugging pitfalls",
    ]
    local_detail = {
        "simpleExplanation": fallback.get("simpleExplanation") or f"{subtopic} is a high-yield {level.lower()} concept inside {topic} for {career} interviews.",
        "whyRecruitersAsk": fallback.get("whyImportant") or f"Recruiters ask about {subtopic} to verify hands-on problem-solving clarity rather than rote memorization.",
        "conceptChecklist": checklist,
        "codeExample": fallback.get("codeExample") or "",
        "quickPracticeQuestion": fallback.get("quickCheck") or {
            "question": f"In a {career} interview on \"{subtopic}\", what should you prioritize explaining first?",
            "options": [
                f"Clear real-world intuition, complexity/trade-offs, and key invariant rules of {subtopic}",
                "Memorized textbook history dates without practical constraints",
                "Bypassing validation checks and ignoring failure modes",
                "Replacing modular design with global mutable variables",
            ],
            "correctIndex": 0,
            "explanation": f"Interviewers award top marks when you pair clean intuition of {subtopic} with concrete edge cases and trade-offs.",
        },
        "completionCriteria": fallback.get("completionCriteria") or f"Practice applying {subtopic} in 2 interview scenarios without hints.",
    }
    return jsonify({"success": True, "source": "local", "detail": local_detail}), 200



@app.route('/api/courses/progress', methods=['GET', 'POST'])
def handle_course_progress():
    """Fetch or persist day-wise completed course progress and study streak in SQLite."""
    if request.method == 'GET':
        email = (request.args.get("email") or "guest@placepilot.ai").strip().lower()
        data = db.get_course_progress(email)
        return jsonify({"success": True, **data}), 200

    body = request.get_json(silent=True) or {}
    email = (body.get("email") or "guest@placepilot.ai").strip().lower()
    course_id = (body.get("courseId") or "").strip()
    completed_days = body.get("completedDays") if "completedDays" in body else None
    target_days = body.get("targetDays") if body.get("targetDays") is not None else None
    streak_days = int(body.get("streakDays") or 1)
    if not course_id:
        return jsonify({"success": False, "message": "courseId is required."}), 400
    saved = db.save_course_progress(
        email,
        course_id,
        completed_days=completed_days,
        streak_days=streak_days,
        target_days=target_days,
    )
    return jsonify({"success": True, **saved}), 200


@app.route('/api/hr/generate', methods=['POST'])
def generate_hr_quiz():
    """
    Generate HR behavioral & situational MCQ assessment (default 20 questions, 15..50).
    """
    body = request.get_json(silent=True) or {}
    category = (body.get("category") or "All").strip()
    difficulty = (body.get("difficulty") or "Medium").strip()
    count = max(15, min(50, int(body.get("count") or 20)))
    force_fresh_ai = bool(body.get("forceFreshAI", False))
    exclude_ids = body.get("excludeIds") or []

    sqlite_qs = db.get_hr_mcq_questions(category=category, difficulty=difficulty, limit=count, exclude_ids=exclude_ids)
    ai_qs = []
    source_used = "sqlite"

    api_key = os.environ.get("VITE_GEMINI_API_KEY") or os.environ.get("GEMINI_API_KEY")
    has_valid_key = bool(api_key and len(api_key.strip()) > 10 and "your_gemini_api_key" not in api_key)

    if has_valid_key and (force_fresh_ai or len(sqlite_qs) < count):
        batch_sz = min(20, count if force_fresh_ai else max(5, count - len(sqlite_qs)))
        prompt = f"""You are PlacePilot AI's Campus Hiring HR Panel Lead.
Generate {batch_sz} realistic behavioral and situational HR interview MCQ questions (Category: {category}, Difficulty: {difficulty}).

Return ONLY a raw JSON array:
[
  {{
    "category": "Behavioral",
    "question": "...",
    "options": ["...", "...", "...", "..."],
    "correctAnswer": 0,
    "explanation": "..."
  }}
]"""
        parsed = _call_gemini_mcq_batch(prompt)
        for item in parsed:
            opts = item.get("options") or []
            ans = item.get("correctAnswer")
            if item.get("question") and len(opts) == 4 and isinstance(ans, int) and 0 <= ans <= 3:
                ai_qs.append({
                    "id": f"hr_ai_{uuid.uuid4().hex[:8]}",
                    "category": item.get("category") or "Behavioral",
                    "difficulty": difficulty,
                    "question": item["question"],
                    "options": [str(o) for o in opts],
                    "correctAnswer": ans,
                    "explanation": item.get("explanation") or "Apply STAR structured ownership.",
                    "source": "gemini"
                })
        if ai_qs:
            db.save_generated_hr_questions(ai_qs)
            source_used = "gemini"

    final_qs = []
    seen_ids = set()
    for q in ai_qs + sqlite_qs:
        if len(final_qs) >= count:
            break
        if q["id"] not in seen_ids:
            final_qs.append(q)
            seen_ids.add(q["id"])

    # Pull remaining from all HR rows in SQLite if category filtered < count
    if len(final_qs) < count:
        extra = db.get_hr_mcq_questions(category="All", limit=count)
        for q in extra:
            if len(final_qs) >= count:
                break
            if q["id"] not in seen_ids:
                final_qs.append(q)
                seen_ids.add(q["id"])

    base_pool = list(final_qs)
    idx_cycle = 0
    while len(final_qs) < count and base_pool:
        src = base_pool[idx_cycle % len(base_pool)]
        round_num = (idx_cycle // len(base_pool)) + 2
        idx_cycle += 1
        final_qs.append({
            **src,
            "id": f"hr_var_{uuid.uuid4().hex[:8]}",
            "question": f"[Scenario Practice #{round_num}] {src['question']}",
            "source": "procedural" if source_used != "gemini" else source_used
        })

    return jsonify({
        "success": True,
        "source": source_used,
        "category": category,
        "count": len(final_qs),
        "questions": final_qs[:count]
    }), 200


if __name__ == '__main__':
    port = int(os.environ.get("PORT", 5000))
    print(f"PlacePilot AI Backend server listening on http://localhost:{port}")
    app.run(host='0.0.0.0', port=port, debug=True)
