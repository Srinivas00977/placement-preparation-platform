import React from 'react';
import { motion, type Variants } from 'framer-motion';
import {
  Calculator,
  Code2,
  Cpu,
  Users,
  FileText,
  GraduationCap,
} from 'lucide-react';

const preparationAreas = [
  {
    number: '01',
    title: 'Aptitude',
    description: 'Practice quantitative, logical, verbal, and placement-oriented aptitude topics.',
    icon: Calculator,
  },
  {
    number: '02',
    title: 'Coding & DSA',
    description: 'Build problem-solving skills through structured coding and data-structures-and-algorithms practice.',
    icon: Code2,
  },
  {
    number: '03',
    title: 'Technical Interview',
    description: 'Prepare important technical concepts and interview-oriented topics.',
    icon: Cpu,
  },
  {
    number: '04',
    title: 'HR Interview',
    description: 'Practice HR questions and prepare for interview conversations.',
    icon: Users,
  },
  {
    number: '05',
    title: 'Resume',
    description: 'Improve resume quality and prepare for placement opportunities.',
    icon: FileText,
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

export const PreparationView: React.FC = () => {
  return (
    <div className="w-full max-w-6xl mx-auto space-y-8 sm:space-y-10">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-emerald-400">
          <GraduationCap className="w-3.5 h-3.5" />
          <span>Preparation Areas</span>
        </div>
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-white">
          Preparation
        </h2>
        <p className="text-sm sm:text-base text-neutral-400 max-w-xl mx-auto">
          Main placement preparation areas covering core placement requirements.
        </p>
      </div>

      {/* Preparation Cards Grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"
      >
        {preparationAreas.map((item) => {
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

export default PreparationView;
