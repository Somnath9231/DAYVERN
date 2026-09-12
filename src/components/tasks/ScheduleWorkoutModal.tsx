'use client';

import React, { useState } from 'react';
import { useDayvernStore } from '@/lib/store/dayvernStore';
import { RecurrenceRule } from '@/types/database';
import { X, Calendar, Clock, Repeat, Dumbbell } from 'lucide-react';

interface ScheduleWorkoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialWorkoutType?: string;
}

export function ScheduleWorkoutModal({ isOpen, onClose, initialWorkoutType = 'Heavy Lifting' }: ScheduleWorkoutModalProps) {
  const { scheduleWorkoutTask } = useDayvernStore();
  const todayStr = new Date().toISOString().slice(0, 10);

  const [workoutType, setWorkoutType] = useState(initialWorkoutType);
  const [dueDate, setDueDate] = useState(todayStr);
  const [dueTime, setDueTime] = useState('18:00');
  const [recurrence, setRecurrence] = useState<RecurrenceRule>('none');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!workoutType.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await scheduleWorkoutTask(workoutType, dueDate, dueTime, recurrence);
      onClose();
    } catch (err) {
      console.error('Error scheduling workout:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const workoutOptions = [
    'Heavy Lifting',
    'Running / Sprinting',
    'Cycling / Spin',
    'Bodyweight Calisthenics',
    'Yoga & Mobility',
    'Swimming',
  ];

  return (
    <div className="fixed inset-0 z-50 bg-[#171717]/50 dark:bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#17191D] border border-[#E8D6D9] dark:border-[#303238] rounded-xl max-w-md w-full p-6 space-y-5 shadow-2xl transition-all">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#E8D6D9] dark:border-[#303238] pb-3">
          <h2 className="text-lg font-serif font-bold text-[#171717] dark:text-[#F5F5F2] flex items-center gap-2">
            <Dumbbell className="w-5 h-5 text-[#C1121F] dark:text-[#F04452]" />
            Schedule Workout Task
          </h2>
          <button
            onClick={onClose}
            className="text-[#6B6B6B] dark:text-[#8B8D91] hover:text-[#171717] dark:hover:text-[#F5F5F2] p-1 rounded"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Workout Select */}
          <div className="space-y-1">
            <label className="text-xs font-mono text-[#6B6B6B] dark:text-[#8B8D91] uppercase font-semibold">
              Workout Activity
            </label>
            <select
              value={workoutType}
              onChange={(e) => setWorkoutType(e.target.value)}
              className="w-full bg-white dark:bg-[#1D2025] border border-[#E8D6D9] dark:border-[#303238] rounded-md px-3.5 py-2.5 text-sm text-[#171717] dark:text-[#F5F5F2] focus:outline-none focus:border-[#C1121F] dark:focus:border-[#F04452]"
            >
              {workoutOptions.map((opt) => (
                <option key={opt} value={opt}>
                  🏋️ {opt}
                </option>
              ))}
            </select>
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-mono text-[#6B6B6B] dark:text-[#8B8D91] uppercase font-medium flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-[#C1121F] dark:text-[#F04452]" /> Date
              </label>
              <input
                type="date"
                required
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full bg-white dark:bg-[#1D2025] border border-[#E8D6D9] dark:border-[#303238] rounded-md px-3 py-2 text-xs font-mono text-[#171717] dark:text-[#F5F5F2] focus:outline-none focus:border-[#C1121F] dark:focus:border-[#F04452]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-mono text-[#6B6B6B] dark:text-[#8B8D91] uppercase font-medium flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-[#6B6B6B] dark:text-[#8B8D91]" /> Time
              </label>
              <input
                type="time"
                value={dueTime}
                onChange={(e) => setDueTime(e.target.value)}
                className="w-full bg-white dark:bg-[#1D2025] border border-[#E8D6D9] dark:border-[#303238] rounded-md px-3 py-2 text-xs font-mono text-[#171717] dark:text-[#F5F5F2] focus:outline-none focus:border-[#C1121F] dark:focus:border-[#F04452]"
              />
            </div>
          </div>

          {/* Repeat */}
          <div className="space-y-1">
            <label className="text-xs font-mono text-[#6B6B6B] dark:text-[#8B8D91] uppercase font-medium flex items-center gap-1">
              <Repeat className="w-3.5 h-3.5 text-[#6B6B6B] dark:text-[#8B8D91]" /> Repeat Schedule
            </label>
            <select
              value={recurrence}
              onChange={(e) => setRecurrence(e.target.value as RecurrenceRule)}
              className="w-full bg-white dark:bg-[#1D2025] border border-[#E8D6D9] dark:border-[#303238] rounded-md px-3 py-2 text-xs font-mono text-[#171717] dark:text-[#F5F5F2] focus:outline-none focus:border-[#C1121F] dark:focus:border-[#F04452]"
            >
              <option value="none">Does not repeat</option>
              <option value="daily">Every day</option>
              <option value="weekdays">Weekdays (Mon-Fri)</option>
              <option value="weekly">Every week</option>
            </select>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E8D6D9] dark:border-[#303238]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded text-xs font-mono text-[#6B6B6B] dark:text-[#8B8D91] hover:text-[#171717] dark:hover:text-[#F5F5F2]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-[#C1121F] dark:bg-[#F04452] hover:bg-[#8F0D16] dark:hover:bg-[#C1121F] text-white font-mono font-bold px-5 py-2 rounded text-xs border-b-2 border-[#8F0D16] dark:border-[#C1121F] transition-all disabled:opacity-50"
            >
              {isSubmitting ? 'Scheduling...' : 'Schedule Workout'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
