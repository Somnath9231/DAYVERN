'use client';

import { useDayvernStore } from '@/lib/store/dayvernStore';
import { AttributeBars } from '@/components/dashboard/AttributeBars';
import { 
  ArrowRight,
  Flame
} from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const { state } = useDayvernStore();

  const activeQuests = state.quests.filter((q) => q.status === 'active').slice(0, 4);

  // Time of day greeting
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  const displayName = state.profile?.display_name || 'Adventurer';

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* 1. Warm Greeting & Hero Status */}
      <div className="p-6 sm:p-8 bg-white dark:bg-[#17191D] border border-[#E8D6D9] dark:border-[#303238] border-l-4 border-l-[#C1121F] dark:border-l-[#F04452] space-y-6 rounded-lg shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#171717] dark:text-[#F5F5F2]">
              {greeting}, {displayName} 👋
            </h1>
            <p className="text-xs text-[#6B6B6B] dark:text-[#8B8D91] font-mono mt-1">
              Class: <strong className="text-[#C1121F] dark:text-[#F04452]">{state.profile.character_class}</strong> • Ready for today&apos;s effort?
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="px-3.5 py-2 bg-[#FFF5F6] dark:bg-[#0F1012] rounded border border-[#E8D6D9] dark:border-[#303238] text-center font-mono">
              <div className="text-[#C1121F] dark:text-[#F04452] font-bold text-sm flex items-center justify-center gap-1">
                <Flame className="w-4 h-4 text-[#C1121F] dark:text-[#F04452]" /> {state.profile.streak_count}d
              </div>
              <div className="text-[10px] text-[#6B6B6B] dark:text-[#8B8D91]">STREAK</div>
            </div>

            <div className="px-3.5 py-2 bg-[#FFF5F6] dark:bg-[#0F1012] rounded border border-[#E8D6D9] dark:border-[#303238] text-center font-mono">
              <div className="text-[#171717] dark:text-[#F5F5F2] font-bold text-sm flex items-center justify-center gap-1">
                Level {state.profile.level}
              </div>
              <div className="text-[10px] text-[#6B6B6B] dark:text-[#8B8D91]">{state.profile.current_xp} XP</div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Quick Actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Link
          href="/workout"
          className="p-4 flex flex-col items-center justify-center text-center space-y-2 bg-white dark:bg-[#17191D] border border-[#E8D6D9] dark:border-[#303238] hover:border-[#C1121F] dark:hover:border-[#F04452] hover:bg-[#FFF5F6] dark:hover:bg-[#35171B] transition-all min-h-[90px] rounded-lg shadow-sm"
        >
          <span className="text-2xl">🏋️</span>
          <span className="text-xs font-bold font-sans text-[#171717] dark:text-[#F5F5F2]">Workout</span>
        </Link>

        <Link
          href="/quests"
          className="p-4 flex flex-col items-center justify-center text-center space-y-2 bg-white dark:bg-[#17191D] border border-[#E8D6D9] dark:border-[#303238] hover:border-[#C1121F] dark:hover:border-[#F04452] hover:bg-[#FFF5F6] dark:hover:bg-[#35171B] transition-all min-h-[90px] rounded-lg shadow-sm"
        >
          <span className="text-2xl">🎯</span>
          <span className="text-xs font-bold font-sans text-[#171717] dark:text-[#F5F5F2]">Tasks / Quests</span>
        </Link>

        <Link
          href="/library"
          className="p-4 flex flex-col items-center justify-center text-center space-y-2 bg-white dark:bg-[#17191D] border border-[#E8D6D9] dark:border-[#303238] hover:border-[#C1121F] dark:hover:border-[#F04452] hover:bg-[#FFF5F6] dark:hover:bg-[#35171B] transition-all min-h-[90px] rounded-lg shadow-sm"
        >
          <span className="text-2xl">📚</span>
          <span className="text-xs font-bold font-sans text-[#171717] dark:text-[#F5F5F2]">Read Book</span>
        </Link>

        <Link
          href="/history"
          className="p-4 flex flex-col items-center justify-center text-center space-y-2 bg-white dark:bg-[#17191D] border border-[#E8D6D9] dark:border-[#303238] hover:border-[#C1121F] dark:hover:border-[#F04452] hover:bg-[#FFF5F6] dark:hover:bg-[#35171B] transition-all min-h-[90px] rounded-lg shadow-sm"
        >
          <span className="text-2xl">📜</span>
          <span className="text-xs font-bold font-sans text-[#171717] dark:text-[#F5F5F2]">History</span>
        </Link>
      </div>

      {/* 3. Today's Agenda Preview */}
      <div className="p-6 bg-white dark:bg-[#17191D] border border-[#E8D6D9] dark:border-[#303238] rounded-lg shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-[#E8D6D9] dark:border-[#303238] pb-3">
          <h2 className="font-serif font-bold text-lg text-[#171717] dark:text-[#F5F5F2] flex items-center gap-2">
            <span>Today&apos;s Agenda 🎯</span>
          </h2>
          <Link href="/quests" className="text-xs font-mono text-[#C1121F] dark:text-[#F04452] hover:underline font-bold flex items-center gap-1">
            View All Tasks <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="space-y-2.5">
          {(() => {
            const todayStr = new Date().toISOString().slice(0, 10);
            const pendingToday = (state.tasks || []).filter(
              (t) => t.status === 'pending' && (!t.due_date || t.due_date <= todayStr)
            );

            if (pendingToday.length === 0) {
              return (
                <div className="py-4 text-center space-y-1">
                  <p className="text-xs text-[#6B6B6B] dark:text-[#8B8D91] font-mono">
                    Nothing due today. Enjoy your day or add a new task! 😌
                  </p>
                </div>
              );
            }

            return pendingToday.slice(0, 4).map((task) => {
              const icon = task.task_type === 'workout' ? '🏋️' : task.task_type === 'habit' ? '🔥' : '🎯';
              return (
                <div
                  key={task.id}
                  className="bg-[#FFF5F6] dark:bg-[#0F1012] p-3.5 rounded border border-[#E8D6D9] dark:border-[#303238] flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="text-base shrink-0">{icon}</span>
                    <div className="min-w-0">
                      <h3 className="font-bold text-sm text-[#171717] dark:text-[#F5F5F2] truncate">{task.title}</h3>
                      {task.due_time && (
                        <p className="text-[11px] font-mono text-[#6B6B6B] dark:text-[#8B8D91]">
                          Due {task.due_time}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="font-mono text-xs text-[#C1121F] dark:text-[#F04452] font-bold shrink-0">
                    +{task.xp_reward || 50} ⚡
                  </div>
                </div>
              );
            });
          })()}
        </div>
      </div>

      {/* 4. RPG Attributes Progress */}
      <AttributeBars attributes={state.attributes} />
    </div>
  );
}

