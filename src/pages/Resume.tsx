import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  Upload,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  Terminal,
  Zap,
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import {
  ROLE_KEYWORD_DICTIONARIES,
  analyzeResumeATS,
  type ATSAnalysisResult,
} from '@/data/resumeKeywords';
import { progressService, type ResumeAnalysisRecord } from '@/services/progressService';
import { Button } from '@/components/ui/button';

const SAMPLE_STUDENT_RESUME = `ALEX JOHNSON
Email: alex.johnson@university.edu | Phone: +1 555-0199 | GitHub: github.com/alexj | LinkedIn: linkedin.com/in/alexj

EDUCATION
Bachelor of Science in Computer Science, GPA: 3.8/4.0
XYZ University, Expected Graduation: May 2026

TECHNICAL SKILLS
Languages: Python, Java, JavaScript, TypeScript, C++, SQL
Frameworks & Libraries: React, Node.js, Express, Tailwind CSS, REST APIs
Databases & Cloud: PostgreSQL, MongoDB, Docker, Git, Linux
Core Fundamentals: Data Structures, Algorithms, Object-Oriented Programming, Operating Systems, DBMS

TECHNICAL PROJECTS
1. PlacePilot AI — Automated Placement Preparation Platform (React, TypeScript, Node.js, PostgreSQL)
- Engineered a real-time placement readiness analytics engine that calculates user readiness metrics across 5 domains.
- Implemented JWT authentication, role-based access control, and PostgreSQL schema migrations for 1,000+ mock users.
- Optimized REST API endpoints, reducing median query response latency by 32% using index optimization.

2. Distributed Task Scheduler (Python, Redis, Docker)
- Architected a distributed worker pool handling asynchronous job execution with retry backoffs.
- Integrated Redis for in-memory queue management, processing up to 5,000 tasks per minute with 99.9% uptime.

EXPERIENCE
Software Engineering Intern | TechNova Labs (June 2025 – August 2025)
- Developed and deployed 4 full-stack user management microservices using React and Spring Boot.
- Automated CI/CD pipelines in GitHub Actions, accelerating release cycles by 25%.
- Collaborated in daily Agile standups and conducted peer code reviews.`;

export const ResumePage: React.FC = () => {
  const currentProgress = progressService.getUserProgress();
  const [targetRole, setTargetRole] = useState(
    currentProgress.profile.targetRole || 'Software Engineer'
  );
  const [resumeText, setResumeText] = useState('');
  const [fileName, setFileName] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<ATSAnalysisResult | null>(null);

  // Load existing analysis if present
  useEffect(() => {
    const existing = currentProgress.latestResumeAnalysis;
    if (existing) {
      setAnalysisResult({
        targetRole: existing.targetRole,
        atsScore: existing.atsScore,
        matchedKeywords: existing.matchedKeywords,
        missingKeywords: existing.missingKeywords,
        suggestions: existing.suggestions,
        summary: `Latest saved ATS analysis score: ${existing.atsScore}%.`,
        sectionBreakdown: {
          skillsMatchPercent: existing.atsScore,
          actionVerbsScore: 75,
          quantifiableImpactScore: 80,
          formattingScore: 90,
        },
      });
      if (existing.fileName) setFileName(existing.fileName);
    }
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();

    reader.onload = (event) => {
      const content = event.target?.result as string;
      setResumeText(content || '');
    };

    reader.readAsText(file);
  };

  const handleLoadSample = () => {
    setResumeText(SAMPLE_STUDENT_RESUME);
    setFileName('Alex_Johnson_Resume.txt');
  };

  const handleRunAnalysis = async () => {
    if (!resumeText.trim()) return;
    setIsAnalyzing(true);

    // Simulate ATS scanning latency
    await new Promise((resolve) => setTimeout(resolve, 900));

    const result = analyzeResumeATS(resumeText, targetRole);
    setAnalysisResult(result);

    const record: ResumeAnalysisRecord = {
      targetRole: result.targetRole,
      atsScore: result.atsScore,
      matchedKeywords: result.matchedKeywords,
      missingKeywords: result.missingKeywords,
      suggestions: result.suggestions,
      fileName: fileName || 'Pasted_Resume_Text',
      analyzedAt: new Date().toISOString(),
    };

    progressService.saveResumeAnalysis(record);
    setIsAnalyzing(false);
  };

  return (
    <DashboardLayout
      pageTitle="Resume ATS Analysis & Keyword Scanner"
      pageSubtitle="Audit your resume against automated enterprise Applicant Tracking Systems (ATS) for your target role."
    >
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* TOP CONFIGURATION BAR */}
        <div className="p-5 rounded-2xl border border-neutral-800 bg-neutral-950/80 backdrop-blur-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-purple-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <label htmlFor="ats-target-role" className="text-xs text-neutral-400 block font-medium">Target Placement Role for ATS Matching</label>
              <select
                id="ats-target-role"
                aria-label="Target Placement Role for ATS Matching"
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                className="bg-transparent text-sm font-bold text-white focus:outline-none cursor-pointer border-b border-neutral-700 py-0.5"
              >
                {Object.keys(ROLE_KEYWORD_DICTIONARIES).map((role) => (
                  <option key={role} value={role} className="bg-neutral-900 text-white">
                    {role}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handleLoadSample}
              className="text-xs cursor-pointer border-neutral-700 hover:bg-neutral-900"
            >
              <Zap className="w-3.5 h-3.5 mr-1.5 text-amber-400" />
              Load Sample Resume
            </Button>
          </div>
        </div>

        {/* TWO COLUMN GRID: INPUT/UPLOAD & ATS RESULTS */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-w-0">
          {/* LEFT: Resume Input & Upload (5 cols) */}
          <div className="lg:col-span-5 rounded-3xl border border-neutral-800 bg-neutral-950/70 p-6 backdrop-blur-xl shadow-xl space-y-5 min-w-0">
            <div className="space-y-1">
              <h3 className="text-base font-bold text-white tracking-tight">Resume Input</h3>
              <p className="text-xs text-neutral-400">
                Paste your resume text or upload your text/PDF file.
              </p>
            </div>

            {/* File Upload Zone */}
            <div className="rounded-2xl border-2 border-dashed border-neutral-800 hover:border-neutral-700 p-5 text-center transition-colors">
              <input
                type="file"
                id="resume-file-input"
                accept=".txt,.pdf,.doc,.docx"
                onChange={handleFileUpload}
                className="hidden"
              />
              <label
                htmlFor="resume-file-input"
                className="cursor-pointer flex flex-col items-center space-y-2"
              >
                <div className="h-10 w-10 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center text-neutral-400">
                  <Upload className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <span className="text-xs font-semibold text-white">
                    {fileName ? fileName : 'Upload Resume File (.txt, .pdf)'}
                  </span>
                  <p className="text-[11px] text-neutral-500">
                    Click to browse or drag file here
                  </p>
                </div>
              </label>
            </div>

            {/* Resume Text Area */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs text-neutral-400">
                <span>Or Paste Resume Text:</span>
                <span className="font-mono">
                  {resumeText.trim().split(/\s+/).filter(Boolean).length} words
                </span>
              </div>
              <div className="rounded-2xl border border-neutral-800 bg-[#0d0d10] p-3">
                <textarea
                  value={resumeText}
                  onChange={(e) => setResumeText(e.target.value)}
                  rows={14}
                  placeholder="Paste your education, skills, projects, and work experience here..."
                  className="w-full bg-transparent text-xs text-neutral-200 resize-y focus:outline-none leading-relaxed font-mono"
                />
              </div>
            </div>

            {/* Analyze Button */}
            <Button
              variant="primary"
              size="md"
              onClick={handleRunAnalysis}
              disabled={!resumeText.trim()}
              isLoading={isAnalyzing}
              className="w-full text-xs cursor-pointer bg-purple-500 hover:bg-purple-400 text-white font-bold shadow-lg shadow-purple-500/20"
            >
              <Terminal className="w-4 h-4 mr-1.5" />
              Scan & Analyze ATS Score
            </Button>
          </div>

          {/* RIGHT: ATS Analysis Visual Breakdown (7 cols) */}
          <div className="lg:col-span-7 space-y-6 min-w-0">
            {analysisResult ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="rounded-3xl border border-neutral-800 bg-neutral-950/70 p-6 sm:p-8 backdrop-blur-xl shadow-2xl space-y-6 min-w-0"
              >
                {/* Score Banner */}
                <div className="flex items-center justify-between flex-wrap gap-4 pb-6 border-b border-neutral-800/80">
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-bold text-purple-400 font-mono tracking-wider">
                      Target Role: {analysisResult.targetRole}
                    </span>
                    <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                      ATS Compatibility Analysis
                    </h2>
                    <p className="text-xs text-neutral-400 max-w-md">
                      {analysisResult.summary}
                    </p>
                  </div>

                  {/* Circular/Metric Score Display */}
                  <div className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800 flex items-center space-x-3 shadow-inner">
                    <div className="text-right">
                      <div className="text-3xl font-black font-mono text-purple-400">
                        {analysisResult.atsScore}%
                      </div>
                      <span className="text-[10px] text-neutral-400 uppercase font-bold font-mono">
                        ATS Match
                      </span>
                    </div>
                  </div>
                </div>

                {/* 4 Dimension Breakdown */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-neutral-900/60 border border-neutral-800 space-y-1">
                    <span className="text-neutral-400 block text-[11px]">Keywords Match</span>
                    <span className="font-mono font-bold text-emerald-400">
                      {analysisResult.sectionBreakdown.skillsMatchPercent}%
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-neutral-900/60 border border-neutral-800 space-y-1">
                    <span className="text-neutral-400 block text-[11px]">Action Verbs</span>
                    <span className="font-mono font-bold text-teal-400">
                      {analysisResult.sectionBreakdown.actionVerbsScore}%
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-neutral-900/60 border border-neutral-800 space-y-1">
                    <span className="text-neutral-400 block text-[11px]">Metric Impact</span>
                    <span className="font-mono font-bold text-cyan-400">
                      {analysisResult.sectionBreakdown.quantifiableImpactScore}%
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-neutral-900/60 border border-neutral-800 space-y-1">
                    <span className="text-neutral-400 block text-[11px]">Formatting</span>
                    <span className="font-mono font-bold text-purple-400">
                      {analysisResult.sectionBreakdown.formattingScore}%
                    </span>
                  </div>
                </div>

                {/* MATCHED KEYWORDS */}
                <div className="space-y-2.5">
                  <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 font-mono uppercase tracking-wider">
                    <CheckCircle2 className="w-4 h-4" />
                    Matched Keywords ({analysisResult.matchedKeywords.length})
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {analysisResult.matchedKeywords.map((kw, idx) => (
                      <span
                        key={idx}
                        className="text-xs px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 font-medium"
                      >
                        {kw}
                      </span>
                    ))}
                  </div>
                </div>

                {/* MISSING KEYWORDS FOR TARGET ROLE */}
                <div className="space-y-2.5">
                  <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5 font-mono uppercase tracking-wider">
                    <AlertTriangle className="w-4 h-4" />
                    Missing Critical Keywords for {analysisResult.targetRole} ({analysisResult.missingKeywords.length})
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {analysisResult.missingKeywords.slice(0, 12).map((kw, idx) => (
                      <span
                        key={idx}
                        className="text-xs px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 font-medium"
                      >
                        + {kw}
                      </span>
                    ))}
                  </div>
                </div>

                {/* ACTIONABLE IMPROVEMENT SUGGESTIONS */}
                <div className="space-y-3 pt-4 border-t border-neutral-800/80">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5 font-mono uppercase tracking-wider">
                    <Lightbulb className="w-4 h-4 text-purple-400" />
                    Actionable Improvement Suggestions
                  </span>
                  <div className="space-y-2">
                    {analysisResult.suggestions.map((sug, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 rounded-2xl bg-neutral-900/50 border border-neutral-800 text-xs text-neutral-300 flex items-start space-x-2.5 leading-relaxed"
                      >
                        <span className="text-purple-400 font-bold shrink-0 mt-0.5">•</span>
                        <span>{sug}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="rounded-3xl border border-neutral-800 bg-neutral-950/70 p-12 text-center backdrop-blur-xl flex flex-col items-center justify-center space-y-4">
                <div className="h-16 w-16 rounded-2xl bg-neutral-900 border border-neutral-800 flex items-center justify-center text-neutral-500">
                  <FileText className="w-8 h-8 text-neutral-400" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-white">No Resume Analyzed Yet</h3>
                  <p className="text-xs text-neutral-400 max-w-sm">
                    Paste your resume or click "Load Sample Resume" and click "Scan & Analyze ATS Score" to view your match report.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ResumePage;
