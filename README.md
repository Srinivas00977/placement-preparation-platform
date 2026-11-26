# PlacePilot AI — Placement Preparation Platform

**PlacePilot AI** is a full-stack, AI-assisted placement readiness and technical learning suite designed for engineering students targeting product companies and MNCs across **12 specialized placement roles**.

---

## Tech Stack

- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS v4, Framer Motion, GSAP (`@gsap/react`), Spline 3D (`@splinetool/react-spline`), Lucide Icons, `jspdf` (vector PDF exports), Pyodide (in-browser Python code execution)
- **Design System:** ATLAS Spatial Glassy UI (Dark Glass & Warm Light Glass themes, collapsible frosted sidebar, `Ctrl+K` Command Search, unified daily notifications)
- **Backend:** Python Flask (`backend/app.py`), SQLite (`backend/db.py`)
- **AI Integration:** Google Gemini API (`VITE_GEMINI_API_KEY`) with seamless deterministic/SQLite local fallbacks when offline or unconfigured
- **Authentication:** Email/Password + Google OAuth (`VITE_GOOGLE_CLIENT_ID`)

---

## All 11 Navigation Modules

1. **Dashboard (`/dashboard`)** — Placement Readiness Index, category radar/breakdown, unified daily checklist (Assessment + Active Course Study + Daily Practice), skill gaps, and recent activity feed.
2. **Skill Assessment (`/assessment`)** — Daily 20–35 question multi-domain diagnostic test (Aptitude, Technical, Multi-language Coding, HR) with streak tracking and mistake review persisted in SQLite.
3. **Aptitude Prep (`/aptitude`)** — Complete 71-topic syllabus across Quantitative, Logical, Verbal & Data Interpretation, 4-Phase Recommended Order, company filters, and AI practice set generator (15–50 Qs).
4. **Coding Practice (`/coding`)** — 119 curated DSA coding problems across 13 categories with company filters, live in-browser Python (Pyodide) + JavaScript/C++/Java runner, AI error diagnosis, and AI question generator.
5. **Technical Prep (`/technical`)** — 6-tab industry-standard preparation hub (Visual Node Roadmap, Shared Course Explorer, Core Subjects & Cheat Sheets, Projects Library + 60s Defense, AI Learning Tools, Technical Quiz 15–50 Qs) across all 12 placement roles.
6. **HR Interview Prep (`/hr-prep`)** — STAR framework studio, role-tailored behavioral questions, AI answer feedback, and HR MCQ rounds (15–50 Qs).
7. **Resume Analysis (`/resume`)** — ATS compatibility scanner, target-role keyword matching, missing keyword recommendations, and action bullets.
8. **AI Roadmap (`/roadmap`)** — Personalized phased preparation roadmap synced with Google Gemini / smart curriculum rules and interactive technical node preview.
9. **Goals & Reminders (`/goals`)** — Personal placement milestones, deadlines, category tagging, and live status sync.
10. **Courses & Languages (`/courses`)** — Standalone All-in-One workspace featuring **34 shared courses** (15 programming languages + 19 technical tracks), dynamic **20 / 30 / 40 / 50 / Custom (7–90 Days)** syllabus scaling, **Roadmap.sh-style visual tree**, embedded **Skill Assessment** readiness & quick diagnostic check, **4-Phase Aptitude Prep** launcher, **Course-Filtered Coding Practice**, YouTube/Docs/AI prompt helpers, and vector PDF study plan exports.
11. **Profile (`/profile`)** — Target placement role selection (12 roles), target companies, daily goal hours, preferred difficulty, and account controls.

---

## Local Setup & Run Instructions

### 1. Environment Configuration
Copy `.env.example` to `.env` and fill in your local credentials (never commit `.env` or `backend/data/*.db`):
```bash
cp .env.example .env
```

### 2. Start Backend (Python Flask + SQLite)
```bash
cd backend
python -m venv .venv
# Windows PowerShell: .venv\Scripts\Activate.ps1
# macOS/Linux: source .venv/bin/activate
pip install -r requirements.txt
python app.py
```
The Flask server initializes `backend/data/placepilot.db` automatically and runs at `http://localhost:5000`.

### 3. Start Frontend (Vite + React + TypeScript)
From the project root:
```bash
npm install
npm run dev
```
Open `http://localhost:5173` in your browser.

### 4. Production Build Verification
```bash
npm run build
```

---

## Security & Git Hygiene
- `.env`, `.env.local`, `backend/data/*.db`, `backend/data/users.json`, `.venv/`, `node_modules/`, and `dist/` are excluded via `.gitignore`.
- Only safe placeholder variable names exist in `.env.example`.
