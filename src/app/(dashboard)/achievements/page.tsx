'use client';

import { useDayvernStore } from '@/lib/store/dayvernStore';
import { Lock, CheckCircle2 } from 'lucide-react';
import { ShareButton } from '@/components/share/ShareButton';
import { ShareCardData } from '@/types/share';

export default function AchievementsPage() {
  const { state } = useDayvernStore();

  const unlockedCount = state.achievements.filter((a) => a.unlocked).length;
  const totalCount = state.achievements.length;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="border-b border-[#E8D6D9] dark:border-[#303238] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-[#171717] dark:text-[#F5F5F2] flex items-center gap-2">
            Achievements 🏆
          </h1>
          <p className="text-xs text-[#6B6B6B] dark:text-[#8B8D91] mt-1 font-sans">
            Unlocked milestones prove your real-world progress and dedication.
          </p>
        </div>

        <div className="px-4 py-2 bg-[#FFF5F6] dark:bg-[#1D2025] border border-[#E8D6D9] dark:border-[#303238] rounded-full font-mono text-xs text-[#C1121F] dark:text-[#F04452] font-bold self-start sm:self-auto">
          {unlockedCount} / {totalCount} Unlocked
        </div>
      </div>

      {/* Grid of Achievements */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {state.achievements.map((ach) => {
          const isUnlocked = ach.unlocked;

          const shareData: ShareCardData = {
            type: 'achievement',
            title: ach.title,
            subtitle: ach.description,
            primaryMetric: 'UNLOCKED',
            xpEarned: ach.xp_reward,
            goldEarned: ach.gold_reward,
            iconEmoji: '🏆',
            date: ach.unlocked_at
              ? new Date(ach.unlocked_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
              : undefined,
          };

          return (
            <div
              key={ach.id}
              className={`p-5 rounded-lg border flex flex-col justify-between space-y-3 transition-all ${
                isUnlocked
                  ? 'border-[#C1121F]/40 dark:border-[#F04452]/40 bg-[#FFF5F6] dark:bg-[#17191D] shadow-sm'
                  : 'opacity-50 border-[#E8D6D9] dark:border-[#303238] bg-white dark:bg-[#17191D]'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="text-2xl">{isUnlocked ? '🏆' : '🔒'}</div>
                  <h3 className={`font-bold text-base font-sans ${isUnlocked ? 'text-[#171717] dark:text-[#F5F5F2]' : 'text-[#6B6B6B] dark:text-[#8B8D91]'}`}>
                    {ach.title}
                  </h3>
                  <p className="text-xs text-[#6B6B6B] dark:text-[#8B8D91] font-sans leading-relaxed">{ach.description}</p>
                </div>

                <div>
                  {isUnlocked ? (
                    <CheckCircle2 className="w-5 h-5 text-[#C1121F] dark:text-[#F04452]" />
                  ) : (
                    <Lock className="w-5 h-5 text-[#6B6B6B] dark:text-[#8B8D91]" />
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-[#E8D6D9] dark:border-[#303238] text-xs font-mono">
                <span className="text-[#6B6B6B] dark:text-[#8B8D91] text-[10px] uppercase tracking-wider font-semibold">{ach.category}</span>
                <div className="flex items-center gap-2">
                  <span className="text-[#C1121F] dark:text-[#F04452] font-bold">+{ach.xp_reward} ⚡</span>
                  <span className="text-[#6B6B6B] dark:text-[#8B8D91]">+{ach.gold_reward} 🪙</span>
                  {isUnlocked && (
                    <ShareButton data={shareData} label="Share" variant="ghost" size="xs" />
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}


