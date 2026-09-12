'use client';

import { useState } from 'react';
import { ActivityCategory, AttributeType, CharacterClass } from '@/types/database';
import { calculateActivityGain } from '@/lib/rpg/engine';
import { X, Code, BookOpen, Dumbbell, CheckSquare, Sparkles, Clock, FileText } from 'lucide-react';
import { FocusTimer } from './FocusTimer';

interface ActivityLoggerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLog: (title: string, category: ActivityCategory, durationMinutes: number, notes?: string) => void;
  streakCount: number;
  characterClass: CharacterClass;
}

export function ActivityLoggerModal({
  isOpen,
  onClose,
  onLog,
  streakCount,
  characterClass,
}: ActivityLoggerModalProps) {
  const [activeTab, setActiveTab] = useState<'quick' | 'timer'>('quick');
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<ActivityCategory>('coding');
  const [durationMinutes, setDurationMinutes] = useState<number>(45);
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const gainPreview = calculateActivityGain(category, durationMinutes || 0, streakCount, characterClass);

  const categories: { id: ActivityCategory; label: string; emoji: string }[] = [
    { id: 'fitness', label: 'Workout 🏋️', emoji: '🏋️' },
    { id: 'reading', label: 'Reading 📚', emoji: '📚' },
    { id: 'study', label: 'Study 💻', emoji: '💻' },
    { id: 'coding', label: 'Work 💼', emoji: '💼' },
    { id: 'habit', label: 'Discipline 🎯', emoji: '🎯' },
    { id: 'custom', label: 'Hobby ✨', emoji: '✨' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || durationMinutes <= 0) return;

    onLog(title.trim(), category, durationMinutes, notes.trim());
    setTitle('');
    setNotes('');
    onClose();
  };

  const handleTimerComplete = (elapsedMinutes: number, timerCategory: ActivityCategory, timerTitle: string) => {
    onLog(timerTitle, timerCategory, elapsedMinutes, 'Logged via Focus Timer');
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-[#171717]/40 dark:bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className="bg-white dark:bg-[#17191D] border border-[#E8D6D9] dark:border-[#303238] rounded-lg max-w-lg w-full max-h-[90vh] flex flex-col overflow-hidden shadow-xl animate-in fade-in zoom-in-95 duration-200 my-auto">
        
        {/* Header Tabs */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-[#E8D6D9] dark:border-[#303238] bg-[#FFF5F6] dark:bg-[#0F1012] shrink-0">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('quick')}
              className={`px-3.5 py-2 rounded text-xs font-mono font-bold transition-all min-h-[40px] ${
                activeTab === 'quick'
                  ? 'bg-[#C1121F] dark:bg-[#F04452] text-white shadow-sm'
                  : 'text-[#6B6B6B] dark:text-[#8B8D91] hover:text-[#171717] dark:hover:text-[#F5F5F2] hover:bg-white dark:hover:bg-[#1D2025]'
              }`}
            >
              Manual Log
            </button>
            <button
              onClick={() => setActiveTab('timer')}
              className={`px-3.5 py-2 rounded text-xs font-mono font-bold transition-all min-h-[40px] ${
                activeTab === 'timer'
                  ? 'bg-[#C1121F] dark:bg-[#F04452] text-white shadow-sm'
                  : 'text-[#6B6B6B] dark:text-[#8B8D91] hover:text-[#171717] dark:hover:text-[#F5F5F2] hover:bg-white dark:hover:bg-[#1D2025]'
              }`}
            >
              Live Focus Timer
            </button>
          </div>

          <button
            onClick={onClose}
            className="text-[#6B6B6B] dark:text-[#8B8D91] hover:text-[#171717] dark:hover:text-[#F5F5F2] p-2 rounded hover:bg-[#FDE7EA] dark:hover:bg-[#35171B] touch-target focus-visible:ring-2 focus-visible:ring-[#C1121F] focus-visible:outline-none"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab 1: Manual Quick Log Form */}
        {activeTab === 'quick' ? (
          <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1">
            {/* Category Select */}
            <div className="space-y-2">
              <label id="modal-title" className="text-xs font-mono text-[#6B6B6B] dark:text-[#8B8D91] uppercase tracking-wider block font-medium">
                Select Activity Domain
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {categories.map((cat) => {
                  const isSelected = category === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setCategory(cat.id)}
                      className={`flex items-center gap-2 p-2.5 min-h-[44px] rounded border text-xs font-medium transition-all ${
                        isSelected
                          ? 'bg-[#FDE7EA] dark:bg-[#35171B] border-[#C1121F] dark:border-[#F04452] text-[#C1121F] dark:text-[#F04452] font-bold'
                          : 'bg-white dark:bg-[#1D2025] border-[#E8D6D9] dark:border-[#303238] text-[#6B6B6B] dark:text-[#8B8D91] hover:text-[#171717] dark:hover:text-[#F5F5F2] hover:bg-[#FFF5F6] dark:hover:bg-[#35171B]'
                      }`}
                    >
                      <span className="text-base shrink-0">{cat.emoji}</span>
                      <span className="truncate">{cat.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Activity Title */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono text-[#6B6B6B] dark:text-[#8B8D91] uppercase tracking-wider block font-medium">
                Activity Title
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Read 3 chapters of Meditations"
                className="w-full bg-white dark:bg-[#0F1012] border border-[#E8D6D9] dark:border-[#303238] rounded px-3 py-2.5 text-sm text-[#171717] dark:text-[#F5F5F2] placeholder-[#6B6B6B] dark:placeholder-[#8B8D91] focus:outline-none focus:border-[#C1121F] dark:focus:border-[#F04452]"
              />
            </div>

            {/* Duration Input */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs font-mono">
                <label className="text-[#6B6B6B] dark:text-[#8B8D91] uppercase tracking-wider flex items-center gap-1.5 font-medium">
                  <Clock className="w-3.5 h-3.5 text-[#C1121F] dark:text-[#F04452]" />
                  Duration (Minutes)
                </label>
                <span className="text-[#C1121F] dark:text-[#F04452] font-bold">{durationMinutes} MINS</span>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="5"
                  max="180"
                  step="5"
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(Number(e.target.value))}
                  className="w-full accent-[#C1121F] dark:accent-[#F04452] bg-[#FFF5F6] dark:bg-[#1D2025] h-2 rounded-lg"
                />
                <input
                  type="number"
                  min="1"
                  max="480"
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(Number(e.target.value))}
                  className="w-20 bg-white dark:bg-[#0F1012] border border-[#E8D6D9] dark:border-[#303238] rounded px-2 py-2 text-center text-sm font-mono text-[#C1121F] dark:text-[#F04452] font-bold min-h-[44px]"
                />
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono text-[#6B6B6B] dark:text-[#8B8D91] uppercase tracking-wider flex items-center gap-1.5 font-medium">
                <FileText className="w-3.5 h-3.5 text-[#6B6B6B] dark:text-[#8B8D91]" />
                Notes / Key Learnings (Optional)
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Key takeaways or summary of work done..."
                className="w-full bg-white dark:bg-[#0F1012] border border-[#E8D6D9] dark:border-[#303238] rounded px-3 py-2 text-xs text-[#171717] dark:text-[#F5F5F2] placeholder-[#6B6B6B] dark:placeholder-[#8B8D91] focus:outline-none focus:border-[#C1121F] dark:focus:border-[#F04452]"
              />
            </div>

            {/* XP & Attribute Preview Panel */}
            <div className="bg-[#FFF5F6] dark:bg-[#0F1012] border border-[#E8D6D9] dark:border-[#303238] rounded p-3.5 space-y-2">
              <div className="flex flex-wrap justify-between items-center text-xs gap-1">
                <span className="text-[#6B6B6B] dark:text-[#8B8D91] font-mono flex items-center gap-1 font-medium">
                  <Sparkles className="w-3.5 h-3.5 text-[#C1121F] dark:text-[#F04452]" />
                  EXPECTED PROGRESS:
                </span>
                <span className="font-mono font-bold text-[#C1121F] dark:text-[#F04452]">
                  +{gainPreview.totalXp} XP | +{gainPreview.goldEarned} Gold
                </span>
              </div>
              <div className="flex flex-wrap gap-2 text-[11px] font-mono">
                {Object.entries(gainPreview.attributeGains).map(([attr, gain]) => {
                  if (gain <= 0) return null;
                  return (
                    <span key={attr} className="px-2 py-0.5 bg-white dark:bg-[#1D2025] border border-[#E8D6D9] dark:border-[#303238] rounded text-[#171717] dark:text-[#F5F5F2]">
                      {attr}: <strong className="text-[#C1121F] dark:text-[#F04452]">+{gain} XP</strong>
                    </span>
                  );
                })}
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-3 border-t border-[#E8D6D9] dark:border-[#303238]">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded text-xs font-mono text-[#6B6B6B] dark:text-[#8B8D91] hover:text-[#171717] dark:hover:text-[#F5F5F2] hover:bg-[#FFF5F6] dark:hover:bg-[#1D2025] min-h-[44px]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-[#C1121F] dark:bg-[#F04452] hover:bg-[#8F0D16] dark:hover:bg-[#C1121F] text-white font-bold px-5 py-2.5 rounded border-b-2 border-[#8F0D16] dark:border-[#C1121F] active:translate-y-[1px] text-xs font-mono transition-all min-h-[44px]"
              >
                Log Activity & Claim XP
              </button>
            </div>
          </form>
        ) : (
          <div className="p-4 sm:p-6 overflow-y-auto flex-1">
            <FocusTimer onComplete={handleTimerComplete} />
          </div>
        )}
      </div>
    </div>
  );

}
