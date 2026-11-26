import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Compass,
  CheckCircle2,
  Clock,
  ExternalLink,
  RotateCcw,
  Video,
  BookOpen,
  Code2,
  ArrowRight,
  Layers,
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { resolveCareerTrack } from '@/data/technicalCurriculum/careers';
import { progressService, type RoadmapStep, type UserProgressData } from '@/services/progressService';
import { roadmapService } from '@/services/roadmapService';
import { Button } from '@/components/ui/button';

export const RoadmapPage: React.FC = () => {
  const navigate = useNavigate();
  const [progress, setProgress] = useState<UserProgressData>(() => progressService.getUserProgress());
  const [isGenerating, setIsGenerating] = useState(false);
  const [steps, setSteps] = useState<RoadmapStep[]>(() => progressService.getUserProgress().roadmap || []);

  useEffect(() => {
    const unsub = progressService.subscribe(() => {
      const data = progressService.getUserProgress();
      setProgress(data);
      if (data.roadmap) setSteps(data.roadmap);
    });
    return () => unsub();
  }, []);

  // Generate on first mount if none exists
  useEffect(() => {
    if (steps.length === 0) {
      handleGenerate();
    }
  }, []);

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const currentData = progressService.getUserProgress();
      const generated = await roadmapService.generatePersonalizedRoadmap(currentData);
      setSteps(generated);
    } catch (err) {
      console.error('Roadmap generation failed:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleToggleStep = (stepId: string) => {
    progressService.toggleRoadmapStepStatus(stepId);
  };

  const readiness = progressService.calculateReadinessWithData(progress);
  const apiKeyPresent = Boolean(
    import.meta.env.VITE_GEMINI_API_KEY &&
    !import.meta.env.VITE_GEMINI_API_KEY.includes('your_gemini_api_key')
  );

  return (
    <DashboardLayout
      pageTitle="AI Personalized Roadmap & Recommendations"
      pageSubtitle="Step-by-step preparation timeline with curated learning resources tailored to your weaknesses and target role."
    >
      <div className="space-y-6 max-w-6xl mx-auto">
        {/* TOP STATUS BANNER */}
        <div className="rounded-3xl border border-neutral-800 bg-gradient-to-r from-neutral-950 via-neutral-900 to-neutral-950 p-6 sm:p-8 backdrop-blur-xl shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-mono text-emerald-400">
                <Compass className="w-3.5 h-3.5" />
                <span>Personalized for {progress.profile.targetRole || 'Software Engineer'}</span>
              </div>
              {progress.profile.targetCompanies && progress.profile.targetCompanies.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-[11px] font-mono text-neutral-400 ml-1">Focus:</span>
                  {progress.profile.targetCompanies.map((comp) => (
                    <span
                      key={comp}
                      className="px-2.5 py-0.5 rounded-full text-[11px] font-mono bg-cyan-500/10 border border-cyan-500/25 text-cyan-300 font-medium"
                    >
                      {comp}
                    </span>
                  ))}
                </div>
              )}
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Placement Preparation Roadmap
            </h2>
            <p className="text-xs sm:text-sm text-neutral-400 max-w-2xl leading-relaxed">
              Dynamically generated based on your diagnostic baseline ({readiness.overall}% readiness), identified skill gaps (
              {readiness.weaknesses.slice(0, 2).join(', ') || 'Core DSA'}), and daily study goal (
              {progress.profile.dailyGoalHours}h/day).
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
            <Button
              variant="primary"
              size="md"
              onClick={handleGenerate}
              isLoading={isGenerating}
              className="text-xs cursor-pointer bg-white text-black hover:bg-neutral-200 font-bold shadow-lg shadow-white/5"
            >
              <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
              Regenerate Roadmap
            </Button>
          </div>
        </div>

        {/* ENGINE STATUS BADGE */}
        <div className="flex items-center justify-between px-5 py-3 rounded-2xl border border-neutral-800 bg-neutral-950/60 backdrop-blur-md text-xs font-mono text-neutral-400">
          <div className="flex items-center space-x-2">
            <div className={`h-2 w-2 rounded-full ${apiKeyPresent ? 'bg-emerald-400 animate-pulse' : 'bg-cyan-400'}`} />
            <span>
              Engine:{' '}
              <strong className="text-white">
                {apiKeyPresent ? 'Google Gemini AI Powered' : 'Smart Rule-Based Curriculum Engine'}
              </strong>
            </span>
          </div>
          <span>
            {steps.filter((s) => s.status === 'completed').length} of {steps.length} Phases Done
          </span>
        </div>

        {/* COMPACT TECHNICAL VISUAL NODE PREVIEW (SYNCED WITH /technical) */}
        {(() => {
          const roleTrack = resolveCareerTrack(progress.profile.targetRole);
          const doneIds = progress.completedTechnicalTopicIds || [];
          const previewNodes = roleTrack.phases.map((ph) => {
            const subs = ph.topics.flatMap((t) => t.subtopics);
            const done = subs.filter((s) => doneIds.includes(s.id)).length;
            const status =
              done >= subs.length && subs.length > 0
                ? '✓ Completed'
                : done > 0
                ? '● In Progress'
                : '○ Pending';
            return { phase: ph, total: subs.length, done, status };
          });
          return (
            <div className="rounded-3xl border border-cyan-500/25 bg-neutral-950/75 p-5 sm:p-6 backdrop-blur-xl space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <span className="text-[11px] font-mono text-cyan-400 uppercase font-bold inline-flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5" /> Interactive Technical Node Track Preview
                  </span>
                  <h3 className="text-base font-bold text-white">
                    {roleTrack.name} — Live Milestone Graph
                  </h3>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/technical')}
                  className="text-xs rounded-xl border-cyan-500/40 text-cyan-300 hover:bg-cyan-500/15 cursor-pointer shrink-0"
                >
                  Open Full Visual Roadmap &amp; Day-Wise Courses <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 relative">
                {previewNodes.map(({ phase, total, done, status }) => (
                  <button
                    key={phase.phaseNumber}
                    type="button"
                    onClick={() => navigate('/technical')}
                    className="text-left p-4 rounded-2xl border border-neutral-800 bg-neutral-900/60 hover:border-cyan-500/40 transition-all cursor-pointer space-y-2"
                  >
                    <div className="flex items-center justify-between text-[11px] font-mono">
                      <span className="text-neutral-400">Phase {phase.phaseNumber} ({phase.level})</span>
                      <span
                        className={
                          status.startsWith('✓')
                            ? 'text-emerald-400 font-bold'
                            : status.startsWith('●')
                            ? 'text-amber-300 font-bold'
                            : 'text-neutral-400'
                        }
                      >
                        {status}
                      </span>
                    </div>
                    <div className="text-xs font-bold text-white line-clamp-1">{phase.title}</div>
                    <div className="text-[11px] font-mono text-cyan-300">
                      {done} / {total} subtopics completed ({phase.topics.length} nodes)
                    </div>
                  </button>
                ))}
              </div>
            </div>
          );
        })()}

        {/* ROADMAP TIMELINE PHASES */}
        <div className="space-y-6 relative">
          {/* Subtle connecting vertical line on desktop */}
          <div className="hidden lg:block absolute left-8 top-10 bottom-10 w-0.5 bg-neutral-800 pointer-events-none" />

          {steps.map((step, idx) => {
            const isCompleted = step.status === 'completed';
            const isInProgress = step.status === 'in_progress';

            const statusStyle = isCompleted
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
              : isInProgress
              ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
              : 'bg-neutral-800/80 text-neutral-400 border-neutral-700';

            return (
              <motion.div
                key={step.id || idx}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: idx * 0.08 }}
                className={`relative rounded-3xl border transition-all p-6 sm:p-7 backdrop-blur-xl shadow-xl flex flex-col justify-between space-y-5 ${
                  isCompleted
                    ? 'bg-neutral-950/60 border-neutral-800/60 opacity-80'
                    : isInProgress
                    ? 'bg-neutral-950/90 border-emerald-500/30 shadow-[0_0_25px_rgba(52,211,153,0.06)]'
                    : 'bg-neutral-950/80 border-neutral-800/80'
                }`}
              >
                {/* Header: Phase & Duration & Status */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-neutral-800/80">
                  <div className="space-y-1">
                    <span className="text-xs font-mono font-bold text-emerald-400">
                      {step.phase}
                    </span>
                    <h3 className="text-lg font-bold text-white tracking-tight">
                      {step.title}
                    </h3>
                  </div>

                  <div className="flex items-center space-x-3">
                    <span className="text-xs px-2.5 py-1 rounded-full font-mono bg-white/5 border border-white/10 text-neutral-300">
                      {step.duration}
                    </span>

                    <button
                      type="button"
                      onClick={() => handleToggleStep(step.id)}
                      className={`text-xs px-3 py-1 rounded-full font-semibold border cursor-pointer flex items-center gap-1.5 transition-all ${statusStyle}`}
                    >
                      {isCompleted && <CheckCircle2 className="w-3.5 h-3.5" />}
                      {isInProgress && <Clock className="w-3.5 h-3.5" />}
                      <span className="capitalize">{step.status.replace('_', ' ')}</span>
                    </button>
                  </div>
                </div>

                {/* Description */}
                <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed font-sans">
                  {step.description}
                </p>

                {/* Recommended Curated Learning Resources */}
                {step.resources && step.resources.length > 0 && (
                  <div className="space-y-2.5 pt-2 border-t border-neutral-800/60">
                    <span className="text-xs font-bold text-neutral-400 uppercase font-mono tracking-wider block">
                      Recommended Learning Resources:
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {step.resources.map((res, rIdx) => {
                        const Icon =
                          res.type === 'youtube'
                            ? Video
                            : res.type === 'practice'
                            ? Code2
                            : BookOpen;

                        return (
                          <a
                            key={rIdx}
                            href={res.url}
                            target={res.url.startsWith('http') ? '_blank' : '_self'}
                            rel="noopener noreferrer"
                            className="p-3 rounded-2xl bg-neutral-900/60 border border-neutral-800 hover:border-neutral-700 hover:bg-neutral-900 transition-all flex items-center justify-between group"
                          >
                            <div className="flex items-center space-x-2.5 min-w-0">
                              <div className="p-1.5 rounded-lg bg-white/5 text-emerald-400 group-hover:scale-110 transition-transform">
                                <Icon className="w-3.5 h-3.5" />
                              </div>
                              <span className="text-xs font-semibold text-white truncate group-hover:text-emerald-300 transition-colors">
                                {res.name}
                              </span>
                            </div>
                            <ExternalLink className="w-3.5 h-3.5 text-neutral-500 group-hover:text-white shrink-0 ml-1.5" />
                          </a>
                        );
                      })}
                    </div>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default RoadmapPage;
