import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  Mail,
  ShieldCheck,
  Save,
  CheckCircle2,
  Building2,
  Plus,
  X,
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { authService, type User as AuthUser } from '@/services/authService';
import { progressService, type UserProgressData, type UserProfileData } from '@/services/progressService';
import { TARGET_JOB_ROLES } from '@/data/assessmentQuestions';
import { Button } from '@/components/ui/button';

const PRESET_COMPANIES = [
  'TCS',
  'Amazon',
  'Google',
  'Microsoft',
  'Infosys',
  'Wipro',
  'Zoho',
  'Cognizant',
  'Accenture',
  'Flipkart',
  'Deloitte',
  'Oracle',
];

export const ProfilePage: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => authService.getCurrentUser());
  const [progress, setProgress] = useState<UserProgressData>(() => progressService.getUserProgress());

  // Form states
  const [name, setName] = useState(currentUser?.name || '');
  const [email] = useState(currentUser?.email || '');
  const [targetRole, setTargetRole] = useState(progress.profile.targetRole || 'Software Engineer');
  const [dailyGoalHours, setDailyGoalHours] = useState(progress.profile.dailyGoalHours || 3);
  const [preparationStage, setPreparationStage] = useState(progress.profile.preparationStage || 'Intermediate');
  const [preferredDifficulty, setPreferredDifficulty] = useState(progress.profile.preferredDifficulty || 'Medium');
  const [targetCompanyType, setTargetCompanyType] = useState(
    progress.profile.targetCompanyType || 'Top Product Companies & MNCs'
  );
  const [targetCompanies, setTargetCompanies] = useState<string[]>(
    progress.profile.targetCompanies || ['TCS', 'Amazon', 'Google']
  );
  const [customCompanyInput, setCustomCompanyInput] = useState('');

  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  useEffect(() => {
    const unsub = progressService.subscribe(() => {
      setProgress(progressService.getUserProgress());
      setCurrentUser(authService.getCurrentUser());
    });
    return () => unsub();
  }, []);

  const toggleCompany = (company: string) => {
    setTargetCompanies((prev) =>
      prev.includes(company) ? prev.filter((c) => c !== company) : [...prev, company]
    );
  };

  const handleAddCustomCompany = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = customCompanyInput.trim();
    if (trimmed && !targetCompanies.includes(trimmed)) {
      setTargetCompanies((prev) => [...prev, trimmed]);
      setCustomCompanyInput('');
    }
  };

  const handleRemoveCompany = (company: string) => {
    setTargetCompanies((prev) => prev.filter((c) => c !== company));
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Update Profile in progressService
    const updatedProfile: Partial<UserProfileData> = {
      targetRole,
      dailyGoalHours: Number(dailyGoalHours),
      preparationStage,
      preferredDifficulty,
      targetCompanyType,
      targetCompanies,
    };
    progressService.updateProfile(updatedProfile);

    // 2. Update user name in active auth session & stored accounts
    if (currentUser && name.trim() && name !== currentUser.name) {
      const accountsRaw = localStorage.getItem('placepilot_registered_accounts');
      if (accountsRaw) {
        try {
          const accounts = JSON.parse(accountsRaw);
          const idx = accounts.findIndex((a: any) => a.email === currentUser.email);
          if (idx >= 0) {
            accounts[idx].name = name.trim();
            localStorage.setItem('placepilot_registered_accounts', JSON.stringify(accounts));
          }
        } catch {}
      }

      const updatedUser = { ...currentUser, name: name.trim() };
      const sessionRaw =
        sessionStorage.getItem('placepilot_auth_session') ||
        localStorage.getItem('placepilot_auth_session');
      if (sessionRaw) {
        try {
          const session = JSON.parse(sessionRaw);
          session.user = updatedUser;
          if (sessionStorage.getItem('placepilot_auth_session')) {
            sessionStorage.setItem('placepilot_auth_session', JSON.stringify(session));
          } else {
            localStorage.setItem('placepilot_auth_session', JSON.stringify(session));
          }
        } catch {}
      }
      setCurrentUser(updatedUser);
    }

    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleResetData = () => {
    progressService.resetAllData();
    setShowResetConfirm(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const readiness = progressService.calculateReadinessWithData(progress);

  return (
    <DashboardLayout
      pageTitle="User Profile & Preparation Settings"
      pageSubtitle="Manage your target job role, study pace, and placement preferences."
    >
      <div className="space-y-6 max-w-4xl mx-auto">
        {/* SUCCESS BANNER */}
        <AnimatePresence>
          {saveSuccess && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center space-x-2"
            >
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>Profile preferences and data successfully saved!</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* PROFILE CARD & FORM */}
        <div className="rounded-3xl border border-neutral-800 bg-neutral-950/80 p-6 sm:p-8 backdrop-blur-xl shadow-xl space-y-6">
          <div className="flex items-center space-x-4 pb-6 border-b border-neutral-800/80">
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-tr from-neutral-800 to-neutral-700 border border-neutral-600 flex items-center justify-center font-bold text-2xl text-white shadow-inner">
              {name ? name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">{name || 'Candidate'}</h2>
              <div className="flex items-center space-x-2 text-xs text-neutral-400">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>{email}</span>
                <span>•</span>
                <span className="capitalize font-mono text-[11px]">
                  Provider: {currentUser?.provider || 'Email'}
                </span>
              </div>
            </div>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Full Name */}
              <div className="space-y-1.5">
                <label className="text-xs text-neutral-300 font-medium block">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-neutral-600"
                  />
                </div>
              </div>

              {/* Email (Readonly) */}
              <div className="space-y-1.5">
                <label className="text-xs text-neutral-300 font-medium block">
                  Registered Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    disabled
                    value={email}
                    className="w-full bg-neutral-900/60 border border-neutral-800/60 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-neutral-400 cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Target Job Role */}
              <div className="space-y-1.5">
                <label className="text-xs text-neutral-300 font-medium block">
                  Target Placement Role
                </label>
                <select
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none cursor-pointer"
                >
                  {TARGET_JOB_ROLES.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>

              {/* Daily Study Goal */}
              <div className="space-y-1.5">
                <label className="text-xs text-neutral-300 font-medium block">
                  Daily Study Goal (Hours / Day)
                </label>
                <select
                  value={dailyGoalHours}
                  onChange={(e) => setDailyGoalHours(Number(e.target.value))}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none cursor-pointer"
                >
                  <option value={1}>1 Hour / Day (Casual Pace)</option>
                  <option value={2}>2 Hours / Day (Consistent Pace)</option>
                  <option value={3}>3 Hours / Day (Recommended Campus Pace)</option>
                  <option value={4}>4 Hours / Day (Intensive Sprint)</option>
                  <option value={5}>5+ Hours / Day (Full-Time Immersion)</option>
                </select>
              </div>

              {/* Preparation Stage */}
              <div className="space-y-1.5">
                <label className="text-xs text-neutral-300 font-medium block">
                  Current Preparation Stage
                </label>
                <select
                  value={preparationStage}
                  onChange={(e) => setPreparationStage(e.target.value as any)}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none cursor-pointer"
                >
                  <option value="Beginner">Beginner (Starting preparation fundamentals)</option>
                  <option value="Intermediate">Intermediate (Building problem-solving speed)</option>
                  <option value="Placement Ready">Placement Ready (Mock interview polishing)</option>
                </select>
              </div>

              {/* Target Company Tier */}
              <div className="space-y-1.5">
                <label className="text-xs text-neutral-300 font-medium block">
                  Target Company Profile
                </label>
                <select
                  value={targetCompanyType}
                  onChange={(e) => setTargetCompanyType(e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none cursor-pointer"
                >
                  <option value="Top Product Companies & MNCs">Top Product Companies & FAANG</option>
                  <option value="High-Growth Tech Startups">High-Growth Tech Startups (Series A-C)</option>
                  <option value="Service & IT Consulting Leaders">Service & IT Consulting (TCS, Infosys, Wipro)</option>
                  <option value="Fintech & Quantitative Trading">Fintech & Quantitative Trading Firms</option>
                </select>
              </div>
            </div>

            {/* TARGET PLACEMENT COMPANIES MULTI-SELECT */}
            <div className="space-y-3 pt-4 border-t border-neutral-800/60">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-xs font-semibold text-white flex items-center space-x-1.5">
                    <Building2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Target Placement Companies</span>
                  </label>
                  <p className="text-[11px] text-neutral-400 mt-0.5">
                    Select companies you are targeting for upcoming campus placement drives. This customizes your DSA questions, aptitude sets, and AI roadmap.
                  </p>
                </div>
                <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                  {targetCompanies.length} selected
                </span>
              </div>

              {/* Clickable Glass Chips */}
              <div className="flex flex-wrap gap-2 pt-1">
                {PRESET_COMPANIES.map((company) => {
                  const isSelected = targetCompanies.includes(company);
                  return (
                    <button
                      key={company}
                      type="button"
                      onClick={() => toggleCompany(company)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all duration-200 cursor-pointer border flex items-center space-x-1.5 ${
                        isSelected
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-sm shadow-emerald-500/10'
                          : 'bg-neutral-900/70 text-neutral-400 border-neutral-800 hover:border-neutral-700 hover:text-white'
                      }`}
                    >
                      {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                      <span>{company}</span>
                    </button>
                  );
                })}

                {/* Custom Added Companies */}
                {targetCompanies
                  .filter((c) => !PRESET_COMPANIES.includes(c))
                  .map((customCompany) => (
                    <span
                      key={customCompany}
                      className="px-3 py-1.5 rounded-xl text-xs font-medium border bg-cyan-500/20 text-cyan-300 border-cyan-500/40 flex items-center space-x-1.5"
                    >
                      <span>{customCompany}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveCompany(customCompany)}
                        className="hover:text-white transition-colors cursor-pointer"
                        title="Remove"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
              </div>

              {/* Add Custom Company Input */}
              <div className="flex items-center space-x-2 pt-2 max-w-sm">
                <input
                  type="text"
                  placeholder="Add custom company (e.g. Atlassian, Cisco)..."
                  value={customCompanyInput}
                  onChange={(e) => setCustomCompanyInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddCustomCompany(e);
                    }
                  }}
                  className="flex-1 bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-neutral-600"
                />
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={handleAddCustomCompany}
                  className="text-xs px-3 py-2 border-neutral-700 hover:bg-neutral-800 text-neutral-200"
                >
                  <Plus className="w-3.5 h-3.5 mr-1" />
                  Add
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-end pt-4 border-t border-neutral-800/80">
              <Button
                type="submit"
                variant="primary"
                size="md"
                className="text-xs cursor-pointer bg-white text-black hover:bg-neutral-200 font-bold shadow-lg shadow-white/5"
              >
                <Save className="w-4 h-4 mr-1.5" />
                Save Profile Changes
              </Button>
            </div>
          </form>
        </div>

        {/* DATA PERSISTENCE & RESET UTILITY */}
        <div className="rounded-3xl border border-neutral-800 bg-neutral-950/70 p-6 backdrop-blur-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-white">Reset Local Preparation Data</h4>
            <p className="text-xs text-neutral-400">
              Clears saved assessment scores, solved problems, and goals to restart diagnostic testing from scratch.
            </p>
          </div>

          <div>
            {!showResetConfirm ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowResetConfirm(true)}
                className="text-xs text-rose-400 border-neutral-800 hover:border-rose-900 hover:bg-rose-950/20"
              >
                Reset Progress Data
              </Button>
            ) : (
              <div className="flex items-center space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowResetConfirm(false)}
                  className="text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  onClick={handleResetData}
                  className="text-xs bg-rose-500 hover:bg-rose-400 text-white font-bold"
                >
                  Confirm Reset
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ProfilePage;
