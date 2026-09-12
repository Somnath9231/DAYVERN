'use client';

import { Profile, UserAttribute } from '@/types/database';
import { getCharacterNextLevelXp } from '@/lib/rpg/config';
import { Shield, Sparkles, Flame, Coins } from 'lucide-react';

interface CharacterCardProps {
  profile: Profile;
  attributes: UserAttribute[];
}

export function CharacterCard({ profile, attributes }: CharacterCardProps) {
  const xpNeeded = getCharacterNextLevelXp(profile.level);
  const xpPercent = Math.min(Math.round((profile.current_xp / xpNeeded) * 100), 100);

  return (
    <div className="rpg-panel p-4 sm:p-6 border-l-4 border-l-[#C1121F] space-y-6 overflow-hidden bg-white">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E8D6D9]">
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Avatar / Level Frame */}
          <div className="relative shrink-0">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded bg-[#FFF5F6] border-2 border-[#C1121F]/40 flex items-center justify-center text-[#C1121F] font-bold font-mono text-lg sm:text-xl shadow-inner">
              {profile.display_name?.slice(0, 2).toUpperCase() || 'AV'}
            </div>
            <div className="absolute -bottom-2 -right-2 bg-[#C1121F] text-white px-2 py-0.5 rounded font-mono font-bold text-[10px] sm:text-xs border border-[#8F0D16] shadow">
              LVL {profile.level}
            </div>
          </div>

          {/* Name & Class */}
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg sm:text-xl font-bold text-[#171717] truncate">{profile.display_name}</h2>
              <span className="text-[11px] text-[#6B6B6B] font-mono">@{profile.username}</span>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded bg-[#FDE7EA] border border-[#E8D6D9] text-[#C1121F] text-[11px] font-mono font-semibold">
                <Shield className="w-3.5 h-3.5" />
                {profile.character_class}
              </span>
            </div>
          </div>
        </div>

        {/* Currency & Streak Stats */}
        <div className="flex items-center gap-2.5 self-start sm:self-auto shrink-0">
          <div className="px-3.5 py-2 bg-[#FFF5F6] rounded border border-[#E8D6D9] text-center">
            <div className="flex items-center justify-center gap-1 text-[#C1121F] text-xs sm:text-sm font-mono font-bold">
              <Coins className="w-3.5 h-3.5" />
              {profile.gold}
            </div>
            <div className="text-[9px] sm:text-[10px] font-mono text-[#6B6B6B] uppercase tracking-wider mt-0.5">GOLD</div>
          </div>

          <div className="px-3.5 py-2 bg-[#FFF5F6] rounded border border-[#E8D6D9] text-center">
            <div className="flex items-center justify-center gap-1 text-[#C1121F] text-xs sm:text-sm font-mono font-bold">
              <Flame className="w-3.5 h-3.5" />
              {profile.streak_count}d
            </div>
            <div className="text-[9px] sm:text-[10px] font-mono text-[#6B6B6B] uppercase tracking-wider mt-0.5">STREAK</div>
          </div>
        </div>
      </div>

      {/* Main XP Level Progress */}
      <div className="space-y-2">
        <div className="flex flex-col xs:flex-row justify-between xs:items-center gap-1 text-xs font-mono">
          <span className="text-[#6B6B6B] flex items-center gap-1.5 font-medium">
            <Sparkles className="w-4 h-4 text-[#C1121F]" />
            CHARACTER LEVEL XP
          </span>
          <span className="text-[#171717] text-[11px] xs:text-xs">
            <strong className="text-[#C1121F]">{profile.current_xp}</strong> / {xpNeeded} XP ({xpPercent}%)
          </span>
        </div>
        <div className="w-full bg-[#FFF5F6] h-3 rounded-full overflow-hidden border border-[#E8D6D9] p-0.5">
          <div 
            className="bg-[#C1121F] h-full rounded-full transition-all duration-500 shadow-cherry-glow"
            style={{ width: `${xpPercent}%` }}
          />
        </div>
      </div>
    </div>
  );
}
