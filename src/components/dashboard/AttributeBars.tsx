'use client';

import { UserAttribute, AttributeType } from '@/types/database';
import { getAttributeNextLevelXp } from '@/lib/rpg/config';
import { Brain, Dumbbell, Code, Shield, Heart } from 'lucide-react';

interface AttributeBarsProps {
  attributes: UserAttribute[];
}

const ATTRIBUTE_CONFIG: Record<
  AttributeType, 
  { label: string; name: string; icon: any; color: string; barColor: string; description: string }
> = {
  INT: {
    label: 'INT',
    name: 'Intelligence',
    icon: Brain,
    color: 'text-[#C1121F] border-[#E8D6D9] bg-[#FFF5F6]',
    barColor: 'bg-[#C1121F]',
    description: 'Knowledge, deep study, and complex problem solving',
  },
  STR: {
    label: 'STR',
    name: 'Strength',
    icon: Dumbbell,
    color: 'text-[#C1121F] border-[#E8D6D9] bg-[#FFF5F6]',
    barColor: 'bg-[#C1121F]',
    description: 'Physical training, endurance, and raw effort',
  },
  DEX: {
    label: 'DEX',
    name: 'Focus',
    icon: Code,
    color: 'text-[#C1121F] border-[#E8D6D9] bg-[#FFF5F6]',
    barColor: 'bg-[#C1121F]',
    description: 'Software development, precision execution & flow state',
  },
  CON: {
    label: 'CON',
    name: 'Discipline',
    icon: Shield,
    color: 'text-[#C1121F] border-[#E8D6D9] bg-[#FFF5F6]',
    barColor: 'bg-[#C1121F]',
    description: 'Habit consistency, routine adherence & stamina',
  },
  CHA: {
    label: 'CHA',
    name: 'Vitality',
    icon: Heart,
    color: 'text-[#C1121F] border-[#E8D6D9] bg-[#FFF5F6]',
    barColor: 'bg-[#C1121F]',
    description: 'Reading, social energy, rest & mental well-being',
  },
};

export function AttributeBars({ attributes }: AttributeBarsProps) {
  return (
    <div className="p-4 sm:p-6 space-y-4 bg-white dark:bg-[#17191D] border border-[#E8D6D9] dark:border-[#303238] rounded-lg shadow-sm">
      <div className="flex items-center justify-between border-b border-[#E8D6D9] dark:border-[#303238] pb-3">
        <h3 className="font-bold text-sm text-[#171717] dark:text-[#F5F5F2] font-mono flex items-center gap-2">
          <span>RPG ATTRIBUTE PROGRESSION</span>
        </h3>
        <span className="text-xs text-[#6B6B6B] dark:text-[#8B8D91] font-mono">5 CORE SPECS</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {attributes.map((attr) => {
          const config = ATTRIBUTE_CONFIG[attr.attribute_type];
          const Icon = config.icon;
          const xpNeeded = getAttributeNextLevelXp(attr.level);
          const percent = Math.min(Math.round((attr.current_xp / xpNeeded) * 100), 100);

          return (
            <div key={attr.id} className="bg-[#FFF5F6] dark:bg-[#0F1012] p-3.5 rounded border border-[#E8D6D9] dark:border-[#303238] space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded border text-[#C1121F] dark:text-[#F04452] border-[#E8D6D9] dark:border-[#303238] bg-white dark:bg-[#1D2025]">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-mono font-bold text-xs text-[#171717] dark:text-[#F5F5F2]">{config.label}</span>
                    <p className="text-[10px] text-[#6B6B6B] dark:text-[#8B8D91] truncate">{config.name}</p>
                  </div>
                </div>

                <span className="font-mono font-bold text-xs bg-white dark:bg-[#1D2025] px-2 py-0.5 rounded border border-[#E8D6D9] dark:border-[#303238] text-[#171717] dark:text-[#F5F5F2]">
                  LVL {attr.level}
                </span>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-[10px] font-mono text-[#6B6B6B] dark:text-[#8B8D91]">
                  <span>XP</span>
                  <span className="font-semibold text-[#171717] dark:text-[#F5F5F2]">{attr.current_xp}/{xpNeeded}</span>
                </div>
                <div className="w-full bg-[#E8D6D9] dark:bg-[#303238] h-1.5 rounded-full overflow-hidden border border-[#E8D6D9] dark:border-[#303238]">
                  <div 
                    className="bg-[#C1121F] dark:bg-[#F04452] h-full transition-all duration-300 rounded-full"
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

