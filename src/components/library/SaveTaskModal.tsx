'use client';

import React, { useState } from 'react';
import { Book, RecurrenceRule, TaskPriority } from '@/types/database';
import { useDayvernStore } from '@/lib/store/dayvernStore';
import { X, Calendar, Clock, Repeat, BookOpen, CheckCircle2 } from 'lucide-react';

interface SaveTaskModalProps {
  book: Book | null;
  isOpen: boolean;
  onClose: () => void;
}

export function SaveTaskModal({ book, isOpen, onClose }: SaveTaskModalProps) {
  const { addTask } = useDayvernStore();

  const [title, setTitle] = useState(book ? `Read: ${book.title}` : '');
  const [dueDate, setDueDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [dueTime, setDueTime] = useState('');
  const [recurrence, setRecurrence] = useState<RecurrenceRule>('none');
  const [priority, setPriority] = useState<TaskPriority>('normal');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  // Sync title when book changes
  React.useEffect(() => {
    if (book) {
      setTitle(`Read: ${book.title}`);
    }
  }, [book]);

  if (!isOpen || !book) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await addTask(
        title.trim() || `Read: ${book.title}`,
        `Curated discovery work: ${book.title} by ${book.author}`,
        'task',
        dueDate,
        dueTime || undefined,
        recurrence,
        priority,
        undefined,
        undefined,
        book.id
      );

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setSubmitting(false);
        onClose();
      }, 1200);
    } catch (err) {
      console.error('Failed to create reading task:', err);
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div 
        className="relative w-full max-w-md bg-[#17191D] text-[#F5F5F2] border border-[#303238] rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-[#303238]">
          <div className="flex items-center space-x-2">
            <BookOpen className="w-5 h-5 text-[#F04452]" />
            <h3 className="font-serif text-lg font-bold text-[#F5F5F2]">
              Schedule Reading Task
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[#8B8D91] hover:text-[#F5F5F2] hover:bg-[#1D2025] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        {success ? (
          <div className="p-8 text-center space-y-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
            <h4 className="font-serif text-lg font-bold text-[#F5F5F2]">Task Created!</h4>
            <p className="text-xs text-[#B7B7B7]">
              Reading task added to your agenda. Completing it awards 🧠 +5 INT.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#B7B7B7] uppercase tracking-wider mb-1">
                Task Title
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-[#1D2025] border border-[#303238] text-sm text-[#F5F5F2] focus:outline-none focus:border-[#F04452]"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#B7B7B7] uppercase tracking-wider mb-1 flex items-center space-x-1">
                  <Calendar className="w-3.5 h-3.5 text-[#F04452]" />
                  <span>Due Date</span>
                </label>
                <input
                  type="date"
                  required
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#1D2025] border border-[#303238] text-xs text-[#F5F5F2] focus:outline-none focus:border-[#F04452]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#B7B7B7] uppercase tracking-wider mb-1 flex items-center space-x-1">
                  <Clock className="w-3.5 h-3.5 text-[#F04452]" />
                  <span>Time (Optional)</span>
                </label>
                <input
                  type="time"
                  value={dueTime}
                  onChange={(e) => setDueTime(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#1D2025] border border-[#303238] text-xs text-[#F5F5F2] focus:outline-none focus:border-[#F04452]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#B7B7B7] uppercase tracking-wider mb-1 flex items-center space-x-1">
                <Repeat className="w-3.5 h-3.5 text-[#F04452]" />
                <span>Repeat Schedule</span>
              </label>
              <select
                value={recurrence}
                onChange={(e) => setRecurrence(e.target.value as RecurrenceRule)}
                className="w-full px-3.5 py-2 rounded-xl bg-[#1D2025] border border-[#303238] text-xs text-[#F5F5F2] focus:outline-none focus:border-[#F04452]"
              >
                <option value="none">Does not repeat</option>
                <option value="daily">Every day</option>
                <option value="weekly">Every week</option>
                <option value="monthly">Every month</option>
              </select>
            </div>

            <div className="p-3 rounded-xl bg-[#1D2025] border border-[#303238] flex items-center space-x-2 text-xs text-[#B7B7B7]">
              <span className="text-base">🧠</span>
              <span>Completing this task awards <strong className="text-[#F5F5F2]">🧠 +5 INT</strong> & <strong className="text-[#F5F5F2]">⚡ +50 XP</strong></span>
            </div>

            <div className="pt-3 flex items-center justify-end space-x-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-[#B7B7B7] hover:bg-[#1D2025]"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2 rounded-xl bg-[#F04452] hover:bg-[#C1121F] text-white text-xs font-semibold shadow-sm transition-all disabled:opacity-50"
              >
                {submitting ? 'Creating...' : 'Create Reading Task'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
