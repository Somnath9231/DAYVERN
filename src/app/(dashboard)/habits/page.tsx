'use client';

import { useState } from 'react';
import { useDayvernStore } from '@/lib/store/dayvernStore';
import { AttributeType } from '@/types/database';
import { ShareButton } from '@/components/share/ShareButton';
import { Flame, Plus, CheckCircle2, Circle, X, Sparkles } from 'lucide-react';

export default function HabitsPage() {
  const { state, toggleHabit, addHabit } = useDayvernStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('discipline');
  const [attributeTarget, setAttributeTarget] = useState<AttributeType>('CON');
  const [baseXp, setBaseXp] = useState(40);
  const [baseGold, setBaseGold] = useState(15);

  const handleCreateHabit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    addHabit(title.trim(), description.trim(), category, attributeTarget, baseXp, baseGold);
    setTitle('');
    setDescription('');
    setIsModalOpen(false);
  };

  const completedCount = state.habits.filter(h => h.completed_today).length;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E8D6D9] dark:border-[#303238] pb-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-[#171717] dark:text-[#F5F5F2] flex items-center gap-2">
            Today&apos;s Habits 🔥
          </h1>
          <p className="text-xs text-[#6B6B6B] dark:text-[#8B8D91] mt-1 font-sans">
            {completedCount} of {state.habits.length} habits completed today. Keep your daily streak alive!
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-[#C1121F] dark:bg-[#F04452] hover:bg-[#8F0D16] dark:hover:bg-[#C1121F] text-white font-mono font-bold px-4 py-2 rounded text-xs border-b-2 border-[#8F0D16] dark:border-[#C1121F] transition-all self-start sm:self-auto min-h-[44px]"
        >
          <Plus className="w-4 h-4" />
          Create Habit
        </button>
      </div>

      {/* Habits List */}
      <div className="space-y-3">
        {state.habits.length === 0 ? (
          <div className="p-8 text-center border border-[#E8D6D9] dark:border-[#303238] rounded-lg bg-[#FFF5F6]/40 dark:bg-[#17191D]">
            <p className="text-sm text-[#6B6B6B] dark:text-[#8B8D91] font-mono">No habits created yet. Tap &quot;Create Habit&quot; above to start your streak.</p>
          </div>
        ) : (
          state.habits.map((habit) => (
            <div
              key={habit.id}
              onClick={() => toggleHabit(habit.id)}
              className={`p-4 rounded-lg border transition-all cursor-pointer flex items-center justify-between gap-4 ${
                habit.completed_today
                  ? 'bg-[#FFF5F6] dark:bg-[#35171B] border-[#C1121F]/30 dark:border-[#F04452]/30 opacity-90'
                  : 'bg-white dark:bg-[#17191D] border-[#E8D6D9] dark:border-[#303238] hover:border-[#C1121F]/60 dark:hover:border-[#F04452]/60 shadow-sm'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleHabit(habit.id);
                  }}
                  className="shrink-0 text-[#C1121F] dark:text-[#F04452] focus:outline-none"
                >
                  {habit.completed_today ? (
                    <CheckCircle2 className="w-6 h-6 fill-[#C1121F] dark:fill-[#F04452] text-white dark:text-[#0F1012]" />
                  ) : (
                    <Circle className="w-6 h-6 text-[#6B6B6B] dark:text-[#8B8D91] hover:text-[#C1121F] dark:hover:text-[#F04452]" />
                  )}
                </button>

                <div className="min-w-0">
                  <h3 className={`font-bold text-base font-sans truncate ${habit.completed_today ? 'line-through text-[#6B6B6B] dark:text-[#8B8D91]' : 'text-[#171717] dark:text-[#F5F5F2]'}`}>
                    {habit.title}
                  </h3>
                  {habit.description && (
                    <p className="text-xs text-[#6B6B6B] dark:text-[#8B8D91] truncate mt-0.5">{habit.description}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                {/* Rewards */}
                <div className="text-right text-xs font-mono hidden sm:block">
                  <span className="text-[#C1121F] dark:text-[#F04452] font-bold">+{habit.base_xp} ⚡</span>
                  <span className="text-[#6B6B6B] dark:text-[#8B8D91] ml-2">+{habit.base_gold} 🪙</span>
                </div>

                {/* Streak Badge */}
                <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#FDE7EA] dark:bg-[#35171B] border border-[#E8D6D9] dark:border-[#303238] text-[#C1121F] dark:text-[#F04452] font-mono font-bold text-xs">
                  <Flame className="w-3.5 h-3.5 fill-[#C1121F] dark:fill-[#F04452]" />
                  {habit.streak_count}d
                </div>

                {/* Share Button for Streaks */}
                {habit.streak_count > 0 && (
                  <div onClick={(e) => e.stopPropagation()}>
                    <ShareButton
                      variant="ghost"
                      label="Share"
                      data={{
                        type: 'streak',
                        title: habit.title,
                        primaryMetric: `${habit.streak_count} DAY STREAK 🔥`,
                        subtitle: 'DAILY HABIT CONSISTENCY',
                        streakCount: habit.streak_count,
                        xpEarned: habit.base_xp,
                        goldEarned: habit.base_gold,
                        iconEmoji: '🔥',
                        detailText: 'Consistency builds character. Streak maintained on DAYVERN.',
                      }}
                    />
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create Habit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#171717]/40 dark:bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#17191D] border border-[#E8D6D9] dark:border-[#303238] rounded-lg max-w-md w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-[#E8D6D9] dark:border-[#303238] pb-3">
              <h3 className="font-bold text-sm font-mono text-[#171717] dark:text-[#F5F5F2] flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#C1121F] dark:text-[#F04452]" />
                NEW HABIT
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-[#6B6B6B] dark:text-[#8B8D91] hover:text-[#171717] dark:hover:text-[#F5F5F2]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateHabit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-mono text-[#6B6B6B] dark:text-[#8B8D91] uppercase font-medium">Habit Name</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Drink Water 💧"
                  className="w-full bg-white dark:bg-[#0F1012] border border-[#E8D6D9] dark:border-[#303238] rounded px-3 py-2 text-sm text-[#171717] dark:text-[#F5F5F2] placeholder-[#6B6B6B] dark:placeholder-[#8B8D91] focus:outline-none focus:border-[#C1121F] dark:focus:border-[#F04452]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-mono text-[#6B6B6B] dark:text-[#8B8D91] uppercase font-medium">Notes (Optional)</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. 2 liters throughout the day"
                  className="w-full bg-white dark:bg-[#0F1012] border border-[#E8D6D9] dark:border-[#303238] rounded px-3 py-2 text-sm text-[#171717] dark:text-[#F5F5F2] placeholder-[#6B6B6B] dark:placeholder-[#8B8D91] focus:outline-none focus:border-[#C1121F] dark:focus:border-[#F04452]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-mono text-[#6B6B6B] dark:text-[#8B8D91] uppercase font-medium">Attribute Target</label>
                  <select
                    value={attributeTarget}
                    onChange={(e) => setAttributeTarget(e.target.value as AttributeType)}
                    className="w-full bg-white dark:bg-[#0F1012] border border-[#E8D6D9] dark:border-[#303238] rounded px-3 py-2 text-xs font-mono text-[#171717] dark:text-[#F5F5F2] focus:outline-none focus:border-[#C1121F] dark:focus:border-[#F04452]"
                  >
                    <option value="CON">CON (Discipline)</option>
                    <option value="INT">INT (Intelligence)</option>
                    <option value="STR">STR (Strength)</option>
                    <option value="DEX">DEX (Focus)</option>
                    <option value="CHA">CHA (Vitality)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-mono text-[#6B6B6B] dark:text-[#8B8D91] uppercase font-medium">XP Reward</label>
                  <input
                    type="number"
                    min="10"
                    max="200"
                    value={baseXp}
                    onChange={(e) => setBaseXp(Number(e.target.value))}
                    className="w-full bg-white dark:bg-[#0F1012] border border-[#E8D6D9] dark:border-[#303238] rounded px-3 py-2 text-xs font-mono text-[#171717] dark:text-[#F5F5F2]"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-[#E8D6D9] dark:border-[#303238]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded text-xs font-mono text-[#6B6B6B] dark:text-[#8B8D91] hover:text-[#171717] dark:hover:text-[#F5F5F2] hover:bg-[#FFF5F6] dark:hover:bg-[#1D2025]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#C1121F] dark:bg-[#F04452] hover:bg-[#8F0D16] dark:hover:bg-[#C1121F] text-white font-bold px-4 py-2 rounded text-xs font-mono border-b-2 border-[#8F0D16] dark:border-[#C1121F]"
                >
                  Save Habit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}


