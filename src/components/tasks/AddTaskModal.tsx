'use client';

import React, { useState } from 'react';
import { useDayvernStore } from '@/lib/store/dayvernStore';
import { TaskType, RecurrenceRule, TaskPriority } from '@/types/database';
import { X, Calendar, Clock, Repeat, Flame, Dumbbell, Target, AlertCircle } from 'lucide-react';

interface AddTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultDate?: string;
  defaultType?: TaskType;
}

export function AddTaskModal({ isOpen, onClose, defaultDate, defaultType }: AddTaskModalProps) {
  const { addTask } = useDayvernStore();
  const todayStr = new Date().toISOString().slice(0, 10);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [taskType, setTaskType] = useState<TaskType>(defaultType || 'task');
  const [dueDate, setDueDate] = useState<string>(defaultDate || todayStr);
  const [dueTime, setDueTime] = useState<string>('');
  const [recurrenceRule, setRecurrenceRule] = useState<RecurrenceRule>('none');
  const [priority, setPriority] = useState<TaskPriority>('normal');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await addTask(
        title,
        description,
        taskType,
        dueDate,
        dueTime || undefined,
        recurrenceRule,
        priority
      );
      // Reset form
      setTitle('');
      setDescription('');
      setTaskType('task');
      setDueDate(todayStr);
      setDueTime('');
      setRecurrenceRule('none');
      setPriority('normal');
      onClose();
    } catch (err) {
      console.error('Error creating task:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#171717]/50 dark:bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#17191D] border border-[#E8D6D9] dark:border-[#303238] rounded-xl max-w-lg w-full p-6 space-y-5 shadow-2xl transition-all">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-[#E8D6D9] dark:border-[#303238] pb-3">
          <h2 className="text-lg font-serif font-bold text-[#171717] dark:text-[#F5F5F2] flex items-center gap-2">
            <span>➕</span> Create Task
          </h2>
          <button
            onClick={onClose}
            className="text-[#6B6B6B] dark:text-[#8B8D91] hover:text-[#171717] dark:hover:text-[#F5F5F2] transition-colors p-1 rounded"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Task Name */}
          <div className="space-y-1">
            <label className="text-xs font-mono text-[#6B6B6B] dark:text-[#8B8D91] uppercase font-semibold">
              Task Name <span className="text-[#C1121F] dark:text-[#F04452]">*</span>
            </label>
            <input
              type="text"
              required
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Read Module 3 or Complete Assignment"
              className="w-full bg-white dark:bg-[#1D2025] border border-[#E8D6D9] dark:border-[#303238] rounded-md px-3.5 py-2.5 text-sm text-[#171717] dark:text-[#F5F5F2] placeholder-[#6B6B6B] dark:placeholder-[#8B8D91] focus:outline-none focus:border-[#C1121F] dark:focus:border-[#F04452]"
            />
          </div>

          {/* Description (Optional) */}
          <div className="space-y-1">
            <label className="text-xs font-mono text-[#6B6B6B] dark:text-[#8B8D91] uppercase font-medium">
              Description (Optional)
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Additional notes or context..."
              className="w-full bg-white dark:bg-[#1D2025] border border-[#E8D6D9] dark:border-[#303238] rounded-md px-3.5 py-2 text-sm text-[#171717] dark:text-[#F5F5F2] placeholder-[#6B6B6B] dark:placeholder-[#8B8D91] focus:outline-none focus:border-[#C1121F] dark:focus:border-[#F04452]"
            />
          </div>

          {/* Type Selector */}
          <div className="space-y-1">
            <label className="text-xs font-mono text-[#6B6B6B] dark:text-[#8B8D91] uppercase font-medium">
              Task Type
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setTaskType('task')}
                className={`py-2 px-3 rounded border text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition-all ${
                  taskType === 'task'
                    ? 'border-[#C1121F] dark:border-[#F04452] bg-[#FFF5F6] dark:bg-[#35171B] text-[#C1121F] dark:text-[#F04452]'
                    : 'border-[#E8D6D9] dark:border-[#303238] bg-white dark:bg-[#1D2025] text-[#6B6B6B] dark:text-[#8B8D91]'
                }`}
              >
                <Target className="w-3.5 h-3.5" /> 🎯 Task
              </button>

              <button
                type="button"
                onClick={() => setTaskType('workout')}
                className={`py-2 px-3 rounded border text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition-all ${
                  taskType === 'workout'
                    ? 'border-[#C1121F] dark:border-[#F04452] bg-[#FFF5F6] dark:bg-[#35171B] text-[#C1121F] dark:text-[#F04452]'
                    : 'border-[#E8D6D9] dark:border-[#303238] bg-white dark:bg-[#1D2025] text-[#6B6B6B] dark:text-[#8B8D91]'
                }`}
              >
                <Dumbbell className="w-3.5 h-3.5" /> 🏋️ Workout
              </button>

              <button
                type="button"
                onClick={() => setTaskType('habit')}
                className={`py-2 px-3 rounded border text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition-all ${
                  taskType === 'habit'
                    ? 'border-[#C1121F] dark:border-[#F04452] bg-[#FFF5F6] dark:bg-[#35171B] text-[#C1121F] dark:text-[#F04452]'
                    : 'border-[#E8D6D9] dark:border-[#303238] bg-white dark:bg-[#1D2025] text-[#6B6B6B] dark:text-[#8B8D91]'
                }`}
              >
                <Flame className="w-3.5 h-3.5" /> 🔥 Habit
              </button>
            </div>
          </div>

          {/* Date & Optional Time Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-mono text-[#6B6B6B] dark:text-[#8B8D91] uppercase font-medium flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-[#C1121F] dark:text-[#F04452]" /> Due Date
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
                <Clock className="w-3.5 h-3.5 text-[#6B6B6B] dark:text-[#8B8D91]" /> Optional Time
              </label>
              <input
                type="time"
                value={dueTime}
                onChange={(e) => setDueTime(e.target.value)}
                className="w-full bg-white dark:bg-[#1D2025] border border-[#E8D6D9] dark:border-[#303238] rounded-md px-3 py-2 text-xs font-mono text-[#171717] dark:text-[#F5F5F2] focus:outline-none focus:border-[#C1121F] dark:focus:border-[#F04452]"
              />
            </div>
          </div>

          {/* Recurrence & Priority Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-mono text-[#6B6B6B] dark:text-[#8B8D91] uppercase font-medium flex items-center gap-1">
                <Repeat className="w-3.5 h-3.5 text-[#6B6B6B] dark:text-[#8B8D91]" /> Repeat
              </label>
              <select
                value={recurrenceRule}
                onChange={(e) => setRecurrenceRule(e.target.value as RecurrenceRule)}
                className="w-full bg-white dark:bg-[#1D2025] border border-[#E8D6D9] dark:border-[#303238] rounded-md px-3 py-2 text-xs font-mono text-[#171717] dark:text-[#F5F5F2] focus:outline-none focus:border-[#C1121F] dark:focus:border-[#F04452]"
              >
                <option value="none">Does not repeat</option>
                <option value="daily">Every day</option>
                <option value="weekdays">Weekdays (Mon-Fri)</option>
                <option value="weekly">Every week</option>
                <option value="monthly">Every month</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-mono text-[#6B6B6B] dark:text-[#8B8D91] uppercase font-medium">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as TaskPriority)}
                className="w-full bg-white dark:bg-[#1D2025] border border-[#E8D6D9] dark:border-[#303238] rounded-md px-3 py-2 text-xs font-mono text-[#171717] dark:text-[#F5F5F2] focus:outline-none focus:border-[#C1121F] dark:focus:border-[#F04452]"
              >
                <option value="normal">Normal (+50 XP)</option>
                <option value="high">High (+75 XP)</option>
                <option value="urgent">Urgent (+100 XP)</option>
              </select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E8D6D9] dark:border-[#303238]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded text-xs font-mono text-[#6B6B6B] dark:text-[#8B8D91] hover:text-[#171717] dark:hover:text-[#F5F5F2] hover:bg-[#FFF5F6] dark:hover:bg-[#1D2025]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-[#C1121F] dark:bg-[#F04452] hover:bg-[#8F0D16] dark:hover:bg-[#C1121F] text-white font-mono font-bold px-5 py-2 rounded text-xs border-b-2 border-[#8F0D16] dark:border-[#C1121F] transition-all disabled:opacity-50"
            >
              {isSubmitting ? 'Adding...' : 'Add Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
