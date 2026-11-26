import React from 'react';
import { NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell,
  Target,
  Clock,
  CheckCircle2,
  ArrowRight,
  X,
  Flame,
  BookOpen,
  Code2,
} from 'lucide-react';
import { progressService, type GoalItem } from '@/services/progressService';
import { type DailyAssessmentStatus } from '@/services/assessmentService';
import { type DailyHabitReminder } from '@/lib/dailyReminders';

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  goals: GoalItem[];
  dailyStatus?: DailyAssessmentStatus | null;
  dailyReminders?: DailyHabitReminder[];
  targetRole?: string;
}

export const NotificationsModal: React.FC<NotificationsModalProps> = ({
  isOpen,
  onClose,
  goals,
  dailyStatus,
  dailyReminders = [],
  targetRole = 'Software Engineer (SDE)',
}) => {
  const activeGoals = goals.filter((g) => !g.completed);

  const fallbackReminders: DailyHabitReminder[] =
    dailyReminders.length > 0
      ? dailyReminders
      : dailyStatus && !dailyStatus.completedToday
      ? [
          {
            id: 'assessment',
            title: 'Daily Skill Assessment',
            message:
              dailyStatus.notificationMessage ||
              `Daily Assessment Pending — Complete today's ${dailyStatus.requiredQuestions || 20}-question test for ${targetRole}.`,
            ctaLabel: 'Take Assessment →',
            route: '/assessment',
            badgeText: `${dailyStatus.dailyStreak || 0}d Streak`,
          },
        ]
      : [];

  const totalPending = activeGoals.length + fallbackReminders.length;

  const handleToggle = (id: string) => {
    progressService.toggleGoalCompleted(id);
  };

  const getReminderVisual = (id: DailyHabitReminder['id']) => {
    if (id === 'assessment') {
      return {
        border: 'border-rose-500/30 bg-gradient-to-br from-rose-500/15 via-amber-500/10 to-transparent',
        icon: <Flame className="w-3.5 h-3.5 text-rose-400" />,
        badgeCls: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
        btnCls: 'bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 text-white',
      };
    }
    if (id === 'course') {
      return {
        border: 'border-cyan-500/30 bg-gradient-to-br from-cyan-500/15 via-emerald-500/10 to-transparent',
        icon: <BookOpen className="w-3.5 h-3.5 text-cyan-400" />,
        badgeCls: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
        btnCls: 'bg-gradient-to-r from-cyan-400 to-emerald-400 text-black font-bold',
      };
    }
    return {
      border: 'border-emerald-500/30 bg-gradient-to-br from-emerald-500/15 via-teal-500/10 to-transparent',
      icon: <Code2 className="w-3.5 h-3.5 text-emerald-400" />,
      badgeCls: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
      btnCls: 'bg-emerald-500/25 hover:bg-emerald-500/35 border border-emerald-400/50 text-emerald-200',
    };
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-end pt-16 pr-4 sm:pr-8">
          {/* Backdrop */}
          <div
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
          />

          {/* Popover Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -8 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="relative w-full max-w-sm rounded-3xl bg-neutral-950/95 border border-white/15 backdrop-blur-2xl shadow-2xl p-5 space-y-4 z-10"
          >
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 rounded-xl bg-rose-500/15 text-rose-400 border border-rose-500/20">
                  <Bell className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Notifications &amp; Daily Alerts</h4>
                  <p className="text-[10px] text-neutral-400">
                    {totalPending > 0
                      ? `${totalPending} pending reminder${totalPending > 1 ? 's' : ''}`
                      : 'All daily tasks & goals completed'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="p-1 rounded-lg text-neutral-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Unified Daily Habits + Active Goals */}
            <div className="space-y-2.5 max-h-[380px] overflow-y-auto no-scrollbar">
              {fallbackReminders.map((rem) => {
                const vis = getReminderVisual(rem.id);
                return (
                  <div
                    key={rem.id}
                    className={`p-3.5 rounded-2xl border shadow-lg space-y-2 ${vis.border}`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center space-x-1.5">
                        {vis.icon}
                        <span className="text-xs font-bold text-white uppercase tracking-wider">
                          {rem.title}
                        </span>
                      </div>
                      {rem.badgeText && (
                        <span
                          className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-semibold border ${vis.badgeCls}`}
                        >
                          {rem.badgeText}
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-neutral-200 leading-relaxed">{rem.message}</p>

                    <div className="pt-0.5 flex items-center justify-end">
                      <NavLink
                        to={rem.route}
                        onClick={onClose}
                        className={`px-3 py-1.5 rounded-xl font-semibold text-xs inline-flex items-center gap-1 shadow-md transition-all cursor-pointer ${vis.btnCls}`}
                      >
                        <span>{rem.ctaLabel}</span>
                      </NavLink>
                    </div>
                  </div>
                );
              })}

              {/* Active Goals List */}
              {activeGoals.length > 0 ? (
                activeGoals.map((goal) => (
                  <div
                    key={goal.id}
                    className="p-3 rounded-2xl bg-neutral-900/60 border border-white/5 hover:border-white/15 transition-all space-y-1.5"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-xs font-semibold text-white leading-snug">
                        {goal.title}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleToggle(goal.id)}
                        className="mt-0.5 h-4 w-4 rounded border border-neutral-600 hover:border-emerald-400 flex items-center justify-center shrink-0 cursor-pointer text-transparent hover:text-emerald-400 transition-colors"
                        title="Mark as completed"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-neutral-400 pt-1">
                      <span className="px-1.5 py-0.5 rounded bg-white/5 text-emerald-300 font-mono">
                        {goal.category}
                      </span>
                      <span className="flex items-center gap-1 font-mono text-neutral-400">
                        <Clock className="w-3 h-3 text-amber-400" />
                        {goal.targetDate}
                      </span>
                    </div>
                  </div>
                ))
              ) : fallbackReminders.length === 0 ? (
                <div className="py-8 text-center text-xs text-neutral-400">
                  <Target className="w-8 h-8 text-emerald-400 mx-auto mb-2 opacity-60" />
                  All daily habits &amp; goals completed! Great work!
                </div>
              ) : null}
            </div>

            {/* Footer */}
            <div className="pt-2 border-t border-white/5 flex items-center justify-between">
              <NavLink
                to="/goals"
                onClick={onClose}
                className="text-xs text-emerald-400 hover:underline inline-flex items-center gap-1 font-medium"
              >
                Manage all goals <ArrowRight className="w-3.5 h-3.5" />
              </NavLink>
              <button
                type="button"
                onClick={onClose}
                className="text-xs text-neutral-400 hover:text-white cursor-pointer"
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
