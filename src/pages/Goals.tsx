import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Target,
  Plus,
  CheckCircle2,
  Clock,
  Trash2,
  Edit2,
  Calendar,
  AlertCircle,
  X,
  Save,
  Filter,
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { progressService, type GoalItem } from '@/services/progressService';
import { Button } from '@/components/ui/button';

export const GoalsPage: React.FC = () => {
  const [goals, setGoals] = useState<GoalItem[]>(() => progressService.getGoals());
  const [filterCategory, setFilterCategory] = useState<string>('All');
  const [filterStatus, setFilterStatus] = useState<'All' | 'Active' | 'Completed'>('All');

  // Modal / Form state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGoalId, setEditingGoalId] = useState<string | null>(null);
  const [formTitle, setFormTitle] = useState('');
  const [formCategory, setFormCategory] = useState<GoalItem['category']>('Coding');
  const [formTargetDate, setFormTargetDate] = useState(
    new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0]
  );
  const [formReminderNote, setFormReminderNote] = useState('');

  useEffect(() => {
    const unsub = progressService.subscribe(() => {
      setGoals(progressService.getGoals());
    });
    return () => unsub();
  }, []);

  const handleOpenCreateModal = () => {
    setEditingGoalId(null);
    setFormTitle('');
    setFormCategory('Coding');
    setFormTargetDate(new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0]);
    setFormReminderNote('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (goal: GoalItem) => {
    setEditingGoalId(goal.id);
    setFormTitle(goal.title);
    setFormCategory(goal.category);
    setFormTargetDate(goal.targetDate);
    setFormReminderNote(goal.reminderNote || '');
    setIsModalOpen(true);
  };

  const handleSaveGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) return;

    if (editingGoalId) {
      progressService.updateGoal(editingGoalId, {
        title: formTitle.trim(),
        category: formCategory,
        targetDate: formTargetDate,
        reminderNote: formReminderNote.trim(),
      });
    } else {
      progressService.addGoal({
        title: formTitle.trim(),
        category: formCategory,
        targetDate: formTargetDate,
        reminderNote: formReminderNote.trim(),
      });
    }

    setIsModalOpen(false);
  };

  const handleToggleComplete = (id: string) => {
    progressService.toggleGoalCompleted(id);
  };

  const handleDeleteGoal = (id: string) => {
    progressService.deleteGoal(id);
  };

  // Filtered goals
  const filteredGoals = goals.filter((g) => {
    const matchCat = filterCategory === 'All' || g.category === filterCategory;
    const matchStatus =
      filterStatus === 'All'
        ? true
        : filterStatus === 'Active'
        ? !g.completed
        : g.completed;
    return matchCat && matchStatus;
  });

  const completedCount = goals.filter((g) => g.completed).length;

  return (
    <DashboardLayout
      pageTitle="Preparation Goals & Milestone Reminders"
      pageSubtitle="Set, track, and achieve daily and weekly placement milestones with target deadlines."
    >
      <div className="space-y-6 max-w-6xl mx-auto">
        {/* TOP CONTROLS & STATS */}
        <div className="p-5 rounded-2xl border border-neutral-800 bg-neutral-950/80 backdrop-blur-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-purple-400">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Active Preparation Goals</h3>
              <p className="text-xs text-neutral-400">
                Completed: <strong className="text-emerald-400 font-mono">{completedCount}</strong> / {goals.length} Goals
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="primary"
              size="sm"
              onClick={handleOpenCreateModal}
              className="text-xs cursor-pointer bg-white text-black hover:bg-neutral-200 font-bold shadow-md shadow-white/5"
            >
              <Plus className="w-3.5 h-3.5 mr-1" />
              Add New Goal
            </Button>
          </div>
        </div>

        {/* FILTERS BAR */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center space-x-1.5">
            <span className="text-neutral-400 font-medium">Status:</span>
            {(['All', 'Active', 'Completed'] as const).map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setFilterStatus(st)}
                className={`px-3 py-1 rounded-xl text-xs transition-colors ${
                  filterStatus === st
                    ? 'bg-neutral-800 text-white font-bold border border-neutral-700'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          <div className="flex items-center space-x-1.5">
            <span className="text-neutral-400 font-medium">Category:</span>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="bg-neutral-900 border border-neutral-800 rounded-xl px-2.5 py-1 text-xs text-white focus:outline-none cursor-pointer"
            >
              <option value="All">All Categories</option>
              <option value="Aptitude">Aptitude</option>
              <option value="Coding">Coding</option>
              <option value="Technical">Technical</option>
              <option value="HR">HR</option>
              <option value="Resume">Resume</option>
              <option value="General">General</option>
            </select>
          </div>
        </div>

        {/* GOALS LIST */}
        <div className="space-y-3">
          {filteredGoals.length > 0 ? (
            filteredGoals.map((goal) => (
              <motion.div
                key={goal.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-5 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  goal.completed
                    ? 'bg-neutral-950/40 border-neutral-800/40 opacity-70'
                    : 'bg-neutral-950/90 border-neutral-800/80 hover:border-neutral-700 shadow-xl'
                }`}
              >
                <div className="flex items-start space-x-3.5 min-w-0">
                  <button
                    type="button"
                    onClick={() => handleToggleComplete(goal.id)}
                    className={`mt-1 h-5 w-5 rounded-lg border flex items-center justify-center shrink-0 cursor-pointer transition-colors ${
                      goal.completed
                        ? 'bg-emerald-500 border-emerald-500 text-black'
                        : 'border-neutral-600 hover:border-emerald-400 bg-neutral-900'
                    }`}
                  >
                    {goal.completed && <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />}
                  </button>

                  <div className="space-y-1.5 min-w-0">
                    <div className="flex items-center space-x-2 flex-wrap gap-1">
                      <span
                        className={`text-sm font-semibold text-white ${
                          goal.completed ? 'line-through text-neutral-500' : ''
                        }`}
                      >
                        {goal.title}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 border border-white/10 font-mono text-neutral-300">
                        {goal.category}
                      </span>
                    </div>

                    {goal.reminderNote && (
                      <p className="text-xs text-neutral-400 font-sans leading-relaxed">
                        {goal.reminderNote}
                      </p>
                    )}

                    <div className="flex items-center space-x-2 text-[11px] text-neutral-400 font-mono pt-1">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-neutral-400" />
                        Target: {goal.targetDate}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2 shrink-0 self-end sm:self-center">
                  <button
                    type="button"
                    onClick={() => handleOpenEditModal(goal)}
                    title="Edit Goal"
                    className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-900 transition-colors cursor-pointer"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteGoal(goal.id)}
                    title="Delete Goal"
                    className="p-2 rounded-xl text-neutral-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="rounded-3xl border border-neutral-800 bg-neutral-950/70 p-12 text-center text-neutral-500 space-y-3">
              <Target className="w-8 h-8 mx-auto text-neutral-600" />
              <p className="text-xs">No goals found for this filter. Click "Add New Goal" to set one!</p>
            </div>
          )}
        </div>

        {/* MODAL: CREATE / EDIT GOAL */}
        <AnimatePresence>
          {isModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-md rounded-3xl border border-neutral-800 bg-neutral-950 p-6 sm:p-7 shadow-2xl space-y-5"
              >
                <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
                  <h3 className="text-base font-bold text-white">
                    {editingGoalId ? 'Edit Preparation Goal' : 'Add New Placement Goal'}
                  </h3>
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="p-1 rounded-lg text-neutral-400 hover:text-white"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleSaveGoal} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs text-neutral-300 font-medium block">
                      Goal Title *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Master 10 DP problems"
                      value={formTitle}
                      onChange={(e) => setFormTitle(e.target.value)}
                      className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-neutral-600"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-xs text-neutral-300 font-medium block">
                        Category
                      </label>
                      <select
                        value={formCategory}
                        onChange={(e) =>
                          setFormCategory(e.target.value as GoalItem['category'])
                        }
                        className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none cursor-pointer"
                      >
                        <option value="Coding">Coding</option>
                        <option value="Aptitude">Aptitude</option>
                        <option value="Technical">Technical</option>
                        <option value="HR">HR</option>
                        <option value="Resume">Resume</option>
                        <option value="General">General</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs text-neutral-300 font-medium block">
                        Target Date
                      </label>
                      <input
                        type="date"
                        required
                        value={formTargetDate}
                        onChange={(e) => setFormTargetDate(e.target.value)}
                        className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none cursor-pointer"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs text-neutral-300 font-medium block">
                      Reminder Note (Optional)
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Key milestones or topics to keep in mind..."
                      value={formReminderNote}
                      onChange={(e) => setFormReminderNote(e.target.value)}
                      className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-neutral-600"
                    />
                  </div>

                  <div className="flex items-center justify-end space-x-3 pt-3 border-t border-neutral-800/80">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsModalOpen(false)}
                      className="text-xs"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      variant="primary"
                      size="sm"
                      className="text-xs bg-white text-black hover:bg-neutral-200 font-bold"
                    >
                      <Save className="w-3.5 h-3.5 mr-1" />
                      Save Goal
                    </Button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </DashboardLayout>
  );
};

export default GoalsPage;
