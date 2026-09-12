'use client';

import { useDayvernStore } from '@/lib/store/dayvernStore';
import { getCharacterNextLevelXp } from '@/lib/rpg/config';
import { AttributeType } from '@/types/database';
import { ShareButton } from '@/components/share/ShareButton';
import { ShareCardData } from '@/types/share';

export default function CharacterPage() {
  const { state } = useDayvernStore();
  const { profile, attributes } = state;

  const nextLevelXp = getCharacterNextLevelXp(profile.level);
  const xpPercent = Math.min(Math.round((profile.current_xp / nextLevelXp) * 100), 100);

  const attributeMap: Record<AttributeType, { name: string; icon: string; desc: string }> = {
    STR: { name: 'STR', icon: '💪', desc: 'Strength & Heavy Activity' },
    INT: { name: 'INT', icon: '🧠', desc: 'Intelligence & Learning' },
    DEX: { name: 'DEX', icon: '⚡', desc: 'Agility & Focus' },
    CON: { name: 'CON', icon: '❤️', desc: 'Endurance & Habits' },
    CHA: { name: 'CHA', icon: '✨', desc: 'Vitality & Balance' },
  };

  const shareData: ShareCardData = {
    type: 'level_up',
    title: `${profile.display_name || profile.username || 'Adventurer'} — Level ${profile.level}`,
    subtitle: `${profile.character_class || 'Adventurer'} • DAYVERN`,
    primaryMetric: `LEVEL ${profile.level}`,
    xpEarned: profile.current_xp,
    streakCount: profile.streak_count,
    iconEmoji: '⬆️',
    date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="border-b border-[#E8D6D9] dark:border-[#303238] pb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-serif font-bold text-[#171717] dark:text-[#F5F5F2] flex items-center gap-2">
            Character Profile 🎮
          </h1>
          <p className="text-xs text-[#6B6B6B] dark:text-[#8B8D91] mt-1 font-sans">
            Your active RPG avatar progress, level stats, and attribute allocation.
          </p>
        </div>
        <ShareButton data={shareData} label="Share Profile" variant="outline" size="sm" />
      </div>

      {/* Main Character Hero Card */}
      <div className="p-6 rounded-xl border border-[#E8D6D9] dark:border-[#303238] bg-[#FFF5F6] dark:bg-[#17191D] space-y-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E8D6D9] dark:border-[#303238] pb-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-white dark:bg-[#1D2025] border-2 border-[#C1121F] dark:border-[#F04452] flex items-center justify-center text-3xl shadow-sm">
              🧙‍♂️
            </div>
            <div>
              <h2 className="text-xl font-bold font-serif text-[#171717] dark:text-[#F5F5F2]">
                {profile.display_name || profile.username || 'Adventurer'}
              </h2>
              <div className="flex items-center gap-2 mt-1">
                <span className="px-2.5 py-0.5 rounded bg-[#C1121F] dark:bg-[#F04452] text-white font-mono text-xs font-bold">
                  Level {profile.level}
                </span>
                <span className="text-xs font-mono text-[#6B6B6B] dark:text-[#8B8D91] font-semibold">
                  {profile.character_class}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white dark:bg-[#1D2025] border border-[#E8D6D9] dark:border-[#303238] text-[#C1121F] dark:text-[#F04452] font-mono font-bold text-xs self-start sm:self-auto">
            <span>🔥</span> {profile.streak_count} Day Streak
          </div>
        </div>

        {/* XP Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs font-mono">
            <span className="text-[#171717] dark:text-[#F5F5F2] font-bold flex items-center gap-1">
              ⚡ XP Progress
            </span>
            <span className="text-[#6B6B6B] dark:text-[#8B8D91]">
              {profile.current_xp} / {nextLevelXp} XP ({xpPercent}%)
            </span>
          </div>
          <div className="w-full h-3 bg-white dark:bg-[#1D2025] border border-[#E8D6D9] dark:border-[#303238] rounded-full overflow-hidden p-0.5">
            <div
              className="h-full bg-[#C1121F] dark:bg-[#F04452] rounded-full transition-all duration-500"
              style={{ width: `${xpPercent}%` }}
            />
          </div>
        </div>

        {/* Quick Balance */}
        <div className="flex items-center justify-between pt-2 text-xs font-mono text-[#6B6B6B] dark:text-[#8B8D91]">
          <span>Gold Balance: <strong className="text-[#171717] dark:text-[#F5F5F2]">{profile.gold} 🪙</strong></span>
          <span>Lifetime XP: <strong className="text-[#171717] dark:text-[#F5F5F2]">{profile.total_xp} ⚡</strong></span>
        </div>
      </div>

      {/* Attributes Section */}
      <div className="space-y-3">
        <h2 className="text-xs font-mono font-bold text-[#6B6B6B] dark:text-[#8B8D91] uppercase tracking-wider">
          Attributes
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {(Object.keys(attributeMap) as AttributeType[]).map((attrKey) => {
            const attrMeta = attributeMap[attrKey];
            const attrObj = attributes.find((a) => a.attribute_type === attrKey);
            const currentLevel = attrObj?.level || 1;
            const currentXp = attrObj?.current_xp || 0;
            const progressPercent = Math.min((currentLevel / 50) * 100, 100);

            return (
              <div
                key={attrKey}
                className="p-4 rounded-lg bg-white dark:bg-[#17191D] border border-[#E8D6D9] dark:border-[#303238] space-y-2 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{attrMeta.icon}</span>
                    <div>
                      <h3 className="font-bold text-sm font-sans text-[#171717] dark:text-[#F5F5F2]">{attrMeta.name}</h3>
                      <p className="text-[10px] text-[#6B6B6B] dark:text-[#8B8D91] font-sans">{attrMeta.desc}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-mono font-bold text-sm text-[#C1121F] dark:text-[#F04452]">Lvl {currentLevel}</span>
                    <div className="text-[10px] font-mono text-[#6B6B6B] dark:text-[#8B8D91]">{currentXp} XP</div>
                  </div>
                </div>

                <div className="w-full h-1.5 bg-[#FFF5F6] dark:bg-[#1D2025] rounded-full overflow-hidden border border-[#E8D6D9] dark:border-[#303238]">
                  <div
                    className="h-full bg-[#C1121F] dark:bg-[#F04452] rounded-full"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}


