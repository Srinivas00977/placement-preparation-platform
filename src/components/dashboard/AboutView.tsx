import React from 'react';
import { motion, type Variants } from 'framer-motion';
import {
  Compass,
  CheckCircle2,
  Terminal,
} from 'lucide-react';

const pillars = [
  'Skill Assessment',
  'Skill Gap Identification',
  'Aptitude Preparation',
  'Coding & DSA',
  'Technical Interview Preparation',
  'HR Interview Preparation',
  'Resume Preparation',
  'AI-Assisted Recommendations',
  'Goals & Reminders',
  'Progress Tracking',
];

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.05,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: 'easeOut' },
  },
};

export const AboutView: React.FC = () => {
  return (
    <div className="w-full max-w-4xl mx-auto space-y-8 sm:space-y-10">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-emerald-400">
          <Compass className="w-3.5 h-3.5" />
          <span>Project Overview</span>
        </div>
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-white">
          About PlacePilot AI
        </h2>
        <p className="text-sm sm:text-base text-neutral-400 max-w-xl mx-auto">
          An AI-assisted placement preparation platform designed for college students.
        </p>
      </div>

      {/* Main Info Card */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="rounded-3xl border border-neutral-800 bg-neutral-950/70 p-6 sm:p-10 backdrop-blur-xl shadow-2xl space-y-8"
      >
        <div className="space-y-4 text-neutral-300 text-sm sm:text-base leading-relaxed">
          <p>
            PlacePilot AI is an AI-assisted placement preparation platform designed for college students.
          </p>
          <p className="text-neutral-400">
            The project focuses on making placement preparation more organized, focused, personalized, and goal-oriented.
          </p>
        </div>

        {/* What it brings together */}
        <div className="space-y-4 pt-4 border-t border-neutral-800/80">
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-neutral-400">
            <Terminal className="w-4 h-4 text-emerald-400" />
            <span>It brings together:</span>
          </div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 sm:grid-cols-2 gap-3"
          >
            {pillars.map((pillar) => (
              <motion.div
                key={pillar}
                variants={itemVariants}
                className="flex items-center gap-3 p-3 sm:p-3.5 rounded-xl bg-neutral-900/60 border border-neutral-800/80 text-sm text-neutral-200"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="font-medium">{pillar}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Purpose */}
        <div className="pt-4 border-t border-neutral-800/80 space-y-2">
          <h4 className="text-xs font-mono uppercase tracking-wider text-neutral-400">
            Purpose
          </h4>
          <p className="text-neutral-300 text-sm sm:text-base leading-relaxed">
            The purpose is to provide students with a structured environment where they can understand their preparation level, identify areas that need attention, follow relevant preparation activities, and monitor their progress.
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default AboutView;
