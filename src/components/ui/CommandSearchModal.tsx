import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  LayoutDashboard,
  GraduationCap,
  Calculator,
  Code2,
  Cpu,
  Users,
  FileText,
  Compass,
  Target,
  User,
  BookOpen,
  ArrowRight,
  X,
  Zap,
} from 'lucide-react';

interface CommandItem {
  id: string;
  title: string;
  category: 'Modules' | 'AI Quick Actions';
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  shortcut?: string;
}

const COMMAND_ITEMS: CommandItem[] = [
  { id: 'dash', title: 'Dashboard & Readiness Overview', category: 'Modules', path: '/dashboard', icon: LayoutDashboard },
  { id: 'assess', title: 'Skill Assessment & Diagnostic Quiz', category: 'Modules', path: '/assessment', icon: GraduationCap, badge: 'Diagnostic' },
  { id: 'apt', title: 'Aptitude Practice (71 Topics: Quant, Logical, Verbal & DI)', category: 'Modules', path: '/aptitude', icon: Calculator },
  { id: 'code', title: 'Coding Practice & DSA Problem Bank', category: 'Modules', path: '/coding', icon: Code2 },
  { id: 'tech', title: 'Technical Preparation (OS, DBMS, CN, OOPs)', category: 'Modules', path: '/technical', icon: Cpu },
  { id: 'hr', title: 'HR Interview Preparation & STAR Studio', category: 'Modules', path: '/hr-prep', icon: Users },
  { id: 'resume', title: 'Resume ATS Compatibility Scanner', category: 'Modules', path: '/resume', icon: FileText, badge: 'ATS' },
  { id: 'roadmap', title: 'AI Personalized Placement Roadmap', category: 'Modules', path: '/roadmap', icon: Compass, badge: 'AI' },
  { id: 'goals', title: 'Goals & Preparation Reminders', category: 'Modules', path: '/goals', icon: Target },
  { id: 'courses', title: 'Courses & Languages (34 Day-Wise Plans)', category: 'Modules', path: '/courses', icon: BookOpen },
  { id: 'profile', title: 'User Profile & Placement Preferences', category: 'Modules', path: '/profile', icon: User },
  { id: 'ai-gaps', title: 'AI Action: Diagnose My Core Skill Gaps', category: 'AI Quick Actions', path: '/assessment', icon: Zap },
  { id: 'ai-ats', title: 'AI Action: Check Resume Missing Keywords', category: 'AI Quick Actions', path: '/resume', icon: Zap },
  { id: 'ai-plan', title: 'AI Action: Regenerate Prep Roadmap', category: 'AI Quick Actions', path: '/roadmap', icon: Zap },
];

interface CommandSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CommandSearchModal: React.FC<CommandSearchModalProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const filteredItems = COMMAND_ITEMS.filter((item) =>
    item.title.toLowerCase().includes(query.toLowerCase()) ||
    item.category.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else onClose(); // parent will toggle
      }
      if (!isOpen) return;

      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % Math.max(1, filteredItems.length));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + filteredItems.length) % Math.max(1, filteredItems.length));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredItems[selectedIndex]) {
          navigate(filteredItems[selectedIndex].path);
          onClose();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredItems, selectedIndex, navigate, onClose]);

  const handleSelect = (item: CommandItem) => {
    navigate(item.path);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 sm:px-6">
          {/* Backdrop with frosted blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/70 backdrop-blur-md transition-opacity"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -10 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="relative w-full max-w-2xl rounded-3xl bg-neutral-950/90 border border-white/15 backdrop-blur-2xl shadow-[0_25px_70px_rgba(0,0,0,0.8),inset_0_1px_1px_rgba(255,255,255,0.2)] overflow-hidden z-10"
          >
            {/* Search Input Bar */}
            <div className="flex items-center px-4 py-3.5 border-b border-white/10 gap-3">
              <div className="h-6 w-6 rounded-full ai-orb-sphere flex items-center justify-center shrink-0 shadow-md" />
              <Search className="w-4 h-4 text-neutral-400 shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setSelectedIndex(0);
                }}
                placeholder="Ask PlacePilot AI or jump to any module..."
                className="w-full bg-transparent text-sm text-white placeholder-neutral-500 focus:outline-none"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  className="p-1 text-neutral-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              <kbd className="hidden sm:inline-flex items-center gap-0.5 px-2 py-0.5 text-[10px] font-mono text-neutral-400 bg-white/5 border border-white/10 rounded-md">
                ESC
              </kbd>
            </div>

            {/* Filtered Results */}
            <div className="max-h-[380px] overflow-y-auto p-2 space-y-1 no-scrollbar">
              {filteredItems.length > 0 ? (
                filteredItems.map((item, index) => {
                  const Icon = item.icon;
                  const isSelected = index === selectedIndex;
                  return (
                    <div
                      key={item.id}
                      onClick={() => handleSelect(item)}
                      onMouseEnter={() => setSelectedIndex(index)}
                      className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-emerald-500/15 text-white border border-emerald-500/30 shadow-inner'
                          : 'text-neutral-300 hover:bg-white/5 border border-transparent'
                      }`}
                    >
                      <div className="flex items-center space-x-3 truncate">
                        <div
                          className={`p-1.5 rounded-lg border ${
                            isSelected
                              ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                              : 'bg-white/5 border-white/10 text-neutral-400'
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                        </div>
                        <span className="truncate">{item.title}</span>
                      </div>

                      <div className="flex items-center space-x-2 shrink-0">
                        {item.badge && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono border border-emerald-500/30">
                            {item.badge}
                          </span>
                        )}
                        <span className="text-[10px] text-neutral-500 font-mono uppercase tracking-wider">
                          {item.category}
                        </span>
                        <ArrowRight className={`w-3.5 h-3.5 ${isSelected ? 'text-emerald-400' : 'text-neutral-500'}`} />
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="p-8 text-center text-xs text-neutral-500">
                  No matching module or action found for &quot;{query}&quot;.
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-4 py-2.5 bg-neutral-900/60 border-t border-white/5 flex items-center justify-between text-[11px] text-neutral-400">
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                PlacePilot AI Spatial Command Active
              </span>
              <div className="flex items-center gap-3">
                <span>Navigate: <kbd className="px-1 py-0.5 rounded bg-white/5 border border-white/10 font-mono text-[9px]">↑</kbd> <kbd className="px-1 py-0.5 rounded bg-white/5 border border-white/10 font-mono text-[9px]">↓</kbd></span>
                <span>Select: <kbd className="px-1 py-0.5 rounded bg-white/5 border border-white/10 font-mono text-[9px]">↵</kbd></span>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
