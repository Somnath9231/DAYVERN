'use client';

import { useState } from 'react';
import { useDayvernStore } from '@/lib/store/dayvernStore';
import { UserTask, TaskType } from '@/types/database';
import { AddTaskModal } from '@/components/tasks/AddTaskModal';
import { ShareButton } from '@/components/share/ShareButton';
import { ShareCardData } from '@/types/share';
import { 
  Plus, 
  CheckCircle2, 
  Circle, 
  Clock, 
  Repeat, 
  MoreVertical, 
  Trash2, 
  Edit3, 
  Play, 
  Calendar, 
  Sparkles,
  Flame,
  Dumbbell,
  Target,
  BookOpen
} from 'lucide-react';
import Link from 'next/link';
import { useLibraryStore } from '@/lib/store/libraryStore';

export default function TasksPage() {
  const { state, completeTask, deleteTask, toggleHabit } = useDayvernStore();
  const { completeReadingMilestone } = useLibraryStore();
  const [filterType, setFilterType] = useState<string>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [completingTaskId, setCompletingTaskId] = useState<string | null>(null);

  const todayStr = new Date().toISOString().slice(0, 10);

  // Group Tasks
  const allTasks = state.tasks || [];

  // Combine daily habits into Today Tasks list if active
  const todayHabitTasks: Partial<UserTask>[] = state.habits
    .filter((h) => h.active)
    .map((h) => ({
      id: `habit_${h.id}`,
      user_id: h.user_id,
      title: h.title,
      description: h.description,
      task_type: 'habit' as TaskType,
      due_date: todayStr,
      recurrence_rule: h.frequency === 'daily' ? 'daily' : 'weekly',
      priority: 'normal',
      status: h.completed_today ? 'completed' : 'pending',
      xp_reward: h.base_xp,
      gold_reward: h.base_gold,
      linked_habit_id: h.id,
    }));

  const mergedTasks = [
    ...allTasks,
    ...todayHabitTasks.filter(
      (ht) => !allTasks.some((t) => t.linked_habit_id === ht.linked_habit_id && t.due_date === todayStr)
    ),
  ];

  // Apply Filter
  const filteredTasks = mergedTasks.filter((t) => {
    if (filterType === 'all') return true;
    return t.task_type === filterType;
  });

  // Categorize into Today, Upcoming, Completed
  const todayTasks = filteredTasks.filter(
    (t) => t.status === 'pending' && (!t.due_date || t.due_date <= todayStr)
  );

  const upcomingTasks = filteredTasks.filter(
    (t) => t.status === 'pending' && Boolean(t.due_date && t.due_date > todayStr)
  );

  const completedTasks = filteredTasks.filter((t) => t.status === 'completed');

  const handleToggleComplete = async (task: Partial<UserTask>) => {
    if (!task.id || completingTaskId === task.id) return;
    setCompletingTaskId(task.id);

    try {
      if (task.id.startsWith('habit_') && task.linked_habit_id) {
        await toggleHabit(task.linked_habit_id);
      } else if (task.linked_book_id) {
        await completeReadingMilestone(task.linked_book_id, task.id);
      } else {
        await completeTask(task.id);
      }
    } catch (err) {
      console.error('Error completing task:', err);
    } finally {
      setCompletingTaskId(null);
    }
  };

  const handleDelete = async (taskId: string) => {
    if (taskId.startsWith('habit_')) return;
    await deleteTask(taskId);
    setActiveMenuId(null);
  };

  const getTaskIcon = (task?: Partial<UserTask>) => {
    if (task?.linked_book_id) return '📚';
    switch (task?.task_type) {
      case 'workout':
        return '🏋️';
      case 'habit':
        return '🔥';
      case 'task':
      default:
        return '🎯';
    }
  };

  const renderTaskItem = (task: Partial<UserTask>, isCompleted = false) => {
    const isHabitItem = task.id?.startsWith('habit_');
    const isWorkoutItem = task.task_type === 'workout';
    const isMenuOpen = activeMenuId === task.id;

    const shareData: ShareCardData = {
      type: isWorkoutItem ? 'workout' : isHabitItem ? 'streak' : 'quest',
      title: task.title || 'Task Accomplished',
      subtitle: `${(task.task_type || 'task').toUpperCase()} COMPLETED`,
      primaryMetric: isCompleted ? 'COMPLETED' : 'PROGRESS',
      xpEarned: task.xp_reward || 50,
      goldEarned: task.gold_reward || 10,
      streakCount: state.profile.streak_count,
      iconEmoji: getTaskIcon(task),
      detailText: task.description || 'Task completed on DAYVERN workstation.',
    };

    return (
      <div
        key={task.id}
        className={`p-4 rounded-lg border transition-all flex items-start justify-between gap-3 relative ${
          isCompleted
            ? 'bg-[#FFF5F6] dark:bg-[#17191D] border-[#E8D6D9] dark:border-[#303238] opacity-70'
            : 'bg-white dark:bg-[#17191D] border-[#E8D6D9] dark:border-[#303238] hover:border-[#C1121F]/50 dark:hover:border-[#F04452]/50 shadow-xs'
        }`}
      >
        <div className="flex items-start gap-3 min-w-0 flex-1">
          {/* Checkbox Trigger */}
          <button
            type="button"
            disabled={isCompleted || completingTaskId === task.id}
            onClick={() => handleToggleComplete(task)}
            className="mt-0.5 text-[#C1121F] dark:text-[#F04452] hover:scale-110 transition-transform shrink-0 disabled:opacity-50"
            aria-label={isCompleted ? 'Completed' : 'Mark Complete'}
          >
            {isCompleted ? (
              <CheckCircle2 className="w-5 h-5 fill-[#C1121F] dark:fill-[#F04452] text-white dark:text-[#17191D]" />
            ) : (
              <Circle className="w-5 h-5 text-[#6B6B6B] dark:text-[#8B8D91] hover:text-[#C1121F] dark:hover:text-[#F04452]" />
            )}
          </button>

          {/* Details */}
          <div className="min-w-0 space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-base leading-none">{getTaskIcon(task)}</span>
              <h3
                className={`font-bold text-sm font-sans ${
                  isCompleted
                    ? 'line-through text-[#6B6B6B] dark:text-[#8B8D91]'
                    : 'text-[#171717] dark:text-[#F5F5F2]'
                }`}
              >
                {task.title}
              </h3>

              {task.priority === 'urgent' && (
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#C1121F] text-white">
                  URGENT
                </span>
              )}
              {task.priority === 'high' && (
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#FDE7EA] dark:bg-[#35171B] text-[#C1121F] dark:text-[#F04452]">
                  HIGH
                </span>
              )}
            </div>

            {task.description && (
              <p className="text-xs text-[#6B6B6B] dark:text-[#8B8D91] font-sans line-clamp-1">
                {task.description}
              </p>
            )}

            <div className="flex items-center gap-3 text-[11px] font-mono text-[#6B6B6B] dark:text-[#8B8D91] flex-wrap pt-0.5">
              {task.due_time && (
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-[#C1121F] dark:text-[#F04452]" />
                  {task.due_time}
                </span>
              )}

              {task.due_date && task.due_date > todayStr && (
                <span className="flex items-center gap-1 text-[#6B6B6B] dark:text-[#8B8D91]">
                  <Calendar className="w-3 h-3" />
                  {task.due_date}
                </span>
              )}

              {task.recurrence_rule && task.recurrence_rule !== 'none' && (
                <span className="flex items-center gap-1 text-[#C1121F] dark:text-[#F04452] font-semibold">
                  <Repeat className="w-3 h-3" />
                  {task.recurrence_rule}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right Metric & Actions */}
        <div className="flex items-center gap-2 shrink-0">
          {!isCompleted && isWorkoutItem && (
            <Link
              href="/workout"
              className="hidden sm:flex items-center gap-1 px-3 py-1 rounded bg-[#C1121F] dark:bg-[#F04452] hover:bg-[#8F0D16] dark:hover:bg-[#C1121F] text-white font-mono font-bold text-xs"
            >
              <Play className="w-3 h-3 fill-current" /> Start
            </Link>
          )}

          {!isCompleted && task.linked_book_id && (
            <Link
              href={`/library/book/${task.linked_book_id}`}
              className="hidden sm:flex items-center gap-1 px-3 py-1 rounded bg-[#1D2025] border border-[#303238] hover:border-[#F04452] text-[#F5F5F2] font-mono font-bold text-xs"
            >
              <BookOpen className="w-3 h-3 text-[#F04452]" /> Open Book
            </Link>
          )}

          <div className="text-right font-mono text-xs hidden sm:block">
            {task.linked_book_id ? (
              <span className="text-emerald-500 font-bold mr-1">🧠 +5 INT</span>
            ) : null}
            <span className="text-[#C1121F] dark:text-[#F04452] font-bold">+{task.xp_reward || 50} ⚡</span>
          </div>

          {isCompleted ? (
            <ShareButton data={shareData} label="Share" variant="ghost" size="xs" />
          ) : !isHabitItem ? (
            <div className="relative">
              <button
                type="button"
                onClick={() => setActiveMenuId(isMenuOpen ? null : (task.id || null))}
                className="p-1 rounded text-[#6B6B6B] dark:text-[#8B8D91] hover:text-[#171717] dark:hover:text-[#F5F5F2]"
              >
                <MoreVertical className="w-4 h-4" />
              </button>

              {isMenuOpen && (
                <div className="absolute right-0 top-6 z-20 bg-white dark:bg-[#17191D] border border-[#E8D6D9] dark:border-[#303238] rounded-md shadow-lg py-1 w-32">
                  <button
                    onClick={() => handleDelete(task.id!)}
                    className="w-full px-3 py-1.5 text-left text-xs font-mono text-[#C1121F] dark:text-[#F04452] hover:bg-[#FFF5F6] dark:hover:bg-[#35171B] flex items-center gap-2"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Delete
                  </button>
                </div>
              )}
            </div>
          ) : null}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="border-b border-[#E8D6D9] dark:border-[#303238] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-[#171717] dark:text-[#F5F5F2] flex items-center gap-2">
            Tasks Agenda 🎯
          </h1>
          <p className="text-xs text-[#6B6B6B] dark:text-[#8B8D91] font-sans mt-1">
            Your unified workstation agenda for daily tasks, scheduled workouts, and habits.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 bg-[#C1121F] dark:bg-[#F04452] hover:bg-[#8F0D16] dark:hover:bg-[#C1121F] text-white font-mono font-bold px-4 py-2 rounded-md text-xs border-b-2 border-[#8F0D16] dark:border-[#C1121F] transition-all min-h-[44px] self-start sm:self-auto shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Add Task
        </button>
      </div>

      {/* Category Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-[#E8D6D9] dark:border-[#303238] pb-3 overflow-x-auto">
        <button
          onClick={() => setFilterType('all')}
          className={`px-3 py-1.5 rounded-full font-mono text-xs font-bold transition-all whitespace-nowrap ${
            filterType === 'all'
              ? 'bg-[#C1121F] dark:bg-[#F04452] text-white'
              : 'bg-[#FFF5F6] dark:bg-[#1D2025] text-[#6B6B6B] dark:text-[#8B8D91] hover:text-[#171717] dark:hover:text-[#F5F5F2] border border-[#E8D6D9] dark:border-[#303238]'
          }`}
        >
          All Items ({mergedTasks.length})
        </button>

        <button
          onClick={() => setFilterType('task')}
          className={`px-3 py-1.5 rounded-full font-mono text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
            filterType === 'task'
              ? 'bg-[#C1121F] dark:bg-[#F04452] text-white'
              : 'bg-[#FFF5F6] dark:bg-[#1D2025] text-[#6B6B6B] dark:text-[#8B8D91] hover:text-[#171717] dark:hover:text-[#F5F5F2] border border-[#E8D6D9] dark:border-[#303238]'
          }`}
        >
          <Target className="w-3.5 h-3.5" /> 🎯 Tasks
        </button>

        <button
          onClick={() => setFilterType('workout')}
          className={`px-3 py-1.5 rounded-full font-mono text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
            filterType === 'workout'
              ? 'bg-[#C1121F] dark:bg-[#F04452] text-white'
              : 'bg-[#FFF5F6] dark:bg-[#1D2025] text-[#6B6B6B] dark:text-[#8B8D91] hover:text-[#171717] dark:hover:text-[#F5F5F2] border border-[#E8D6D9] dark:border-[#303238]'
          }`}
        >
          <Dumbbell className="w-3.5 h-3.5" /> 🏋️ Workouts
        </button>

        <button
          onClick={() => setFilterType('habit')}
          className={`px-3 py-1.5 rounded-full font-mono text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
            filterType === 'habit'
              ? 'bg-[#C1121F] dark:bg-[#F04452] text-white'
              : 'bg-[#FFF5F6] dark:bg-[#1D2025] text-[#6B6B6B] dark:text-[#8B8D91] hover:text-[#171717] dark:hover:text-[#F5F5F2] border border-[#E8D6D9] dark:border-[#303238]'
          }`}
        >
          <Flame className="w-3.5 h-3.5" /> 🔥 Habits
        </button>
      </div>

      {/* TODAY SECTION */}
      <div className="space-y-3">
        <h2 className="text-xs font-mono font-bold text-[#6B6B6B] dark:text-[#8B8D91] uppercase tracking-wider flex items-center justify-between">
          <span>TODAY ({todayTasks.length})</span>
          <span className="text-[10px] text-[#C1121F] dark:text-[#F04452] lowercase font-normal font-sans">due today</span>
        </h2>

        {todayTasks.length === 0 ? (
          <div className="p-8 text-center bg-white dark:bg-[#17191D] border border-[#E8D6D9] dark:border-[#303238] rounded-xl space-y-3">
            <p className="text-sm font-mono text-[#6B6B6B] dark:text-[#8B8D91]">
              Nothing due today. Nice. 😌
            </p>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-[#C1121F] dark:text-[#F04452] hover:underline"
            >
              <Plus className="w-3.5 h-3.5" /> Add Task
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {todayTasks.map((task) => renderTaskItem(task, false))}
          </div>
        )}
      </div>

      {/* UPCOMING SECTION */}
      {upcomingTasks.length > 0 && (
        <div className="space-y-3 pt-4 border-t border-[#E8D6D9] dark:border-[#303238]">
          <h2 className="text-xs font-mono font-bold text-[#6B6B6B] dark:text-[#8B8D91] uppercase tracking-wider">
            UPCOMING ({upcomingTasks.length})
          </h2>

          <div className="space-y-2">
            {upcomingTasks.map((task) => renderTaskItem(task, false))}
          </div>
        </div>
      )}

      {/* COMPLETED SECTION */}
      {completedTasks.length > 0 && (
        <div className="space-y-3 pt-4 border-t border-[#E8D6D9] dark:border-[#303238]">
          <h2 className="text-xs font-mono font-bold text-[#6B6B6B] dark:text-[#8B8D91] uppercase tracking-wider flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#C1121F] dark:text-[#F04452]" />
            COMPLETED TODAY ({completedTasks.length})
          </h2>

          <div className="space-y-2">
            {completedTasks.map((task) => renderTaskItem(task, true))}
          </div>
        </div>
      )}

      {/* Add Task Modal */}
      <AddTaskModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />
    </div>
  );
}
