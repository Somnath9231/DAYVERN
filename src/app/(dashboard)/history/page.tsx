'use client';

import { useDayvernStore } from '@/lib/store/dayvernStore';
import { History as HistoryIcon } from 'lucide-react';

export default function HistoryPage() {
  const { state } = useDayvernStore();

  // Helper to categorize log by date
  const isToday = (dateStr: string) => {
    const d = new Date(dateStr);
    const today = new Date();
    return d.toDateString() === today.toDateString();
  };

  const isYesterday = (dateStr: string) => {
    const d = new Date(dateStr);
    const yest = new Date();
    yest.setDate(yest.getDate() - 1);
    return d.toDateString() === yest.toDateString();
  };

  const todayLogs = state.auditLogs.filter(l => isToday(l.created_at));
  const yesterdayLogs = state.auditLogs.filter(l => isYesterday(l.created_at));
  const earlierLogs = state.auditLogs.filter(l => !isToday(l.created_at) && !isYesterday(l.created_at));

  const getEventEmoji = (type: string) => {
    switch (type.toLowerCase()) {
      case 'workout':
      case 'heavy lifting':
        return '🏋️';
      case 'running':
        return '🏃';
      case 'reading':
      case 'reading_milestone':
        return '📚';
      case 'study':
      case 'learning':
        return '💻';
      case 'habit_completed':
        return '🔥';
      case 'quest_completed':
        return '🎯';
      case 'reward_claimed':
        return '🪙';
      default:
        return '⚡';
    }
  };

  const renderLogGroup = (title: string, logs: typeof state.auditLogs) => {
    if (logs.length === 0) return null;
    return (
      <div className="space-y-3">
        <h2 className="text-xs font-mono font-bold text-[#6B6B6B] dark:text-[#8B8D91] uppercase tracking-wider">
          {title}
        </h2>
        <div className="space-y-2">
          {logs.map((log) => (
            <div
              key={log.id}
              className="p-4 rounded-lg bg-white dark:bg-[#17191D] border border-[#E8D6D9] dark:border-[#303238] flex items-center justify-between gap-4 shadow-sm"
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className="text-2xl shrink-0">{getEventEmoji(log.event_type)}</span>
                <div className="min-w-0">
                  <h3 className="font-bold text-sm font-sans text-[#171717] dark:text-[#F5F5F2] truncate">{log.title}</h3>
                  <p className="text-xs text-[#6B6B6B] dark:text-[#8B8D91] font-mono">
                    {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>

              <div className="text-right text-xs font-mono shrink-0">
                <div className="text-[#C1121F] dark:text-[#F04452] font-bold">+{log.xp_awarded} ⚡</div>
                {log.gold_awarded > 0 && (
                  <div className="text-[#6B6B6B] dark:text-[#8B8D91]">+{log.gold_awarded} 🪙</div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="border-b border-[#E8D6D9] dark:border-[#303238] pb-4">
        <h1 className="text-2xl font-serif font-bold text-[#171717] dark:text-[#F5F5F2] flex items-center gap-2">
          Activity History 📜
        </h1>
        <p className="text-xs text-[#6B6B6B] dark:text-[#8B8D91] mt-1 font-sans">
          A clean chronological timeline of your earned XP and achievements.
        </p>
      </div>

      {state.auditLogs.length === 0 ? (
        <div className="p-8 text-center border border-[#E8D6D9] dark:border-[#303238] rounded-lg bg-[#FFF5F6]/40 dark:bg-[#17191D] space-y-2">
          <HistoryIcon className="w-8 h-8 text-[#6B6B6B] dark:text-[#8B8D91] mx-auto opacity-50" />
          <p className="text-sm font-mono text-[#6B6B6B] dark:text-[#8B8D91]">No activity recorded yet today.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {renderLogGroup('TODAY', todayLogs)}
          {renderLogGroup('YESTERDAY', yesterdayLogs)}
          {renderLogGroup('EARLIER', earlierLogs)}
        </div>
      )}
    </div>
  );
}


