import React from 'react';
import { motion } from 'framer-motion';
import { Terminal, UserCheck, Code2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface OverviewViewProps {
  onSelectTab: (tab: 'how-it-works' | 'features' | 'preparation' | 'about') => void;
}

export const OverviewView: React.FC<OverviewViewProps> = ({ onSelectTab }) => {
  const navigate = useNavigate();

  return (
    <div className="w-full flex flex-col items-center justify-center space-y-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="max-w-xl w-full rounded-3xl border border-neutral-800 bg-neutral-950/80 p-8 sm:p-10 text-center shadow-2xl backdrop-blur-xl space-y-6"
      >
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-neutral-900 border border-neutral-800 text-white shadow-inner">
          <Terminal className="h-8 w-8 text-neutral-300 animate-pulse" />
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-extrabold tracking-tight text-white">
            Dashboard Coming Next
          </h1>
          <p className="text-sm text-neutral-400 max-w-md mx-auto leading-relaxed">
            Authentication foundation is successfully complete. The comprehensive AI-powered placement preparation modules will be integrated in upcoming development phases.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 text-left pt-2">
          <div className="p-3.5 rounded-xl bg-neutral-900/60 border border-neutral-800/80 space-y-1">
            <div className="flex items-center space-x-2 text-xs font-semibold text-white">
              <UserCheck className="h-4 w-4 text-neutral-400" />
              <span>Skill Assessment</span>
            </div>
            <p className="text-[11px] text-neutral-500">Upcoming in Phase 2</p>
          </div>

          <div className="p-3.5 rounded-xl bg-neutral-900/60 border border-neutral-800/80 space-y-1">
            <div className="flex items-center space-x-2 text-xs font-semibold text-white">
              <Code2 className="h-4 w-4 text-neutral-400" />
              <span>Coding & Aptitude</span>
            </div>
            <p className="text-[11px] text-neutral-500">Upcoming in Phase 3</p>
          </div>
        </div>

        {/* Quick access to information options */}
        <div className="pt-2">
          <p className="text-xs text-neutral-400 mb-3 font-medium">Explore Information Modules:</p>
          <div className="flex flex-wrap items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => onSelectTab('how-it-works')}
              className="px-3 py-1.5 rounded-lg bg-neutral-900 border border-neutral-800 text-xs font-medium text-neutral-300 hover:text-white hover:border-neutral-700 transition-colors cursor-pointer"
            >
              How It Works
            </button>
            <button
              type="button"
              onClick={() => onSelectTab('features')}
              className="px-3 py-1.5 rounded-lg bg-neutral-900 border border-neutral-800 text-xs font-medium text-neutral-300 hover:text-white hover:border-neutral-700 transition-colors cursor-pointer"
            >
              Features
            </button>
            <button
              type="button"
              onClick={() => onSelectTab('preparation')}
              className="px-3 py-1.5 rounded-lg bg-neutral-900 border border-neutral-800 text-xs font-medium text-neutral-300 hover:text-white hover:border-neutral-700 transition-colors cursor-pointer"
            >
              Preparation
            </button>
            <button
              type="button"
              onClick={() => onSelectTab('about')}
              className="px-3 py-1.5 rounded-lg bg-neutral-900 border border-neutral-800 text-xs font-medium text-neutral-300 hover:text-white hover:border-neutral-700 transition-colors cursor-pointer"
            >
              About
            </button>
          </div>
        </div>

        <div className="pt-4 border-t border-neutral-800/60">
          <Button
            variant="outline"
            size="md"
            onClick={() => navigate('/login')}
            className="text-xs"
          >
            Back to Auth Experience
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export default OverviewView;
