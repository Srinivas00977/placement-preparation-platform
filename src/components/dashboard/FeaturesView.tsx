import React from 'react';
import { motion, type Variants } from 'framer-motion';
import {
  ClipboardCheck,
  Search,
  Bot,
  CalendarCheck,
  LineChart,
  Layers,
} from 'lucide-react';

const features = [
  {
    number: '01',
    title: 'Skill Assessment',
    description: "Understand the student's current preparation level and identify strengths and weaknesses.",
    icon: ClipboardCheck,
  },
  {
    number: '02',
    title: 'Skill Gap Identification',
    description: 'Identify areas that require additional preparation and attention.',
    icon: Search,
  },
  {
    number: '03',
    title: 'AI-Assisted Recommendations',
    description: 'Receive preparation guidance based on assessment results and identified areas of need.',
    icon: Bot,
  },
  {
    number: '04',
    title: 'Goals & Reminders',
    description: 'Set preparation goals and keep track of important preparation activities.',
    icon: CalendarCheck,
  },
  {
    number: '05',
    title: 'Progress Tracking',
    description: 'Monitor preparation activities and overall progress from one place.',
    icon: LineChart,
  },
];

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.05,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: 'easeOut' },
  },
};

export const FeaturesView: React.FC = () => {
  return (
    <div className="w-full max-w-6xl mx-auto space-y-8 sm:space-y-10">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-emerald-400">
          <Layers className="w-3.5 h-3.5" />
          <span>Core Capabilities</span>
        </div>
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-white">
          Features
        </h2>
        <p className="text-sm sm:text-base text-neutral-400 max-w-xl mx-auto">
          The main capabilities of PlacePilot AI designed for organized and goal-oriented preparation.
        </p>
      </div>

      {/* Features Grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"
      >
        {features.map((item) => {
          const Icon = item.icon;
          return (
            <motion.div
              key={item.number}
              variants={itemVariants}
              className="group relative rounded-2xl border border-neutral-800 bg-neutral-950/70 p-6 sm:p-7 backdrop-blur-xl shadow-xl flex flex-col justify-between hover:border-neutral-700 transition-colors"
            >
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold tracking-wider text-neutral-400 px-2.5 py-1 rounded-md bg-white/5 border border-white/10">
                    {item.number}
                  </span>
                  <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-white group-hover:scale-105 transition-transform">
                    <Icon className="w-5 h-5 text-emerald-400" />
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-lg font-bold text-white tracking-tight leading-snug">
                    {item.title}
                  </h3>
                  <p className="text-sm text-neutral-400 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
};

export default FeaturesView;
