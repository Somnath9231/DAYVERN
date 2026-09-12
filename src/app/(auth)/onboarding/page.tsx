'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CharacterClass } from '@/types/database';
import { CLASS_DETAILS } from '@/lib/rpg/engine';
import { Sparkles, Code, BookOpen, Dumbbell, Shield, Check, ArrowRight } from 'lucide-react';
import { useDayvernStore } from '@/lib/store/dayvernStore';

export default function OnboardingPage() {
  const router = useRouter();
  const { updateCharacterClass } = useDayvernStore();
  const [selectedClass, setSelectedClass] = useState<CharacterClass>('Polymath');

  const classIcons: Record<string, any> = {
    Sparkles,
    Code,
    BookOpen,
    Dumbbell,
    Shield,
  };

  const classes: CharacterClass[] = [
    'Polymath',
    'Code Mage',
    'Cyber Scholar',
    'Iron Athlete',
    'Discipline Monk',
  ];

  const handleFinish = () => {
    updateCharacterClass(selectedClass);
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-white text-[#171717] p-6 flex flex-col justify-between max-w-4xl mx-auto space-y-8">
      <div className="space-y-4 text-center pt-8">
        <div className="flex justify-center mb-2">
          <img src="/DAY.png.png" alt="DAYVERN Logo" className="h-12 w-auto object-contain" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#171717]">Select Your RPG Class Spec</h1>
        <p className="text-xs sm:text-sm text-[#6B6B6B] font-sans max-w-lg mx-auto leading-relaxed">
          Your starting class spec grants unique XP multipliers to your primary activities and attribute progression.
        </p>
      </div>

      {/* Class Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {classes.map((cls) => {
          const detail = CLASS_DETAILS[cls];
          const Icon = classIcons[detail.icon] || Shield;
          const isSelected = selectedClass === cls;

          return (
            <div
              key={cls}
              onClick={() => setSelectedClass(cls)}
              className={`rpg-panel p-5 space-y-3 cursor-pointer transition-all bg-white border ${
                isSelected
                  ? 'border-[#C1121F] bg-[#FFF5F6] shadow-sm'
                  : 'hover:border-[#C1121F]/40 border-[#E8D6D9]'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded border ${
                    isSelected ? 'bg-[#C1121F] text-white border-[#8F0D16]' : 'bg-[#FFF5F6] border-[#E8D6D9] text-[#C1121F]'
                  }`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-[#171717] font-sans">{detail.title}</h3>
                  </div>
                </div>

                {isSelected && (
                  <div className="w-5 h-5 rounded-full bg-[#C1121F] text-white flex items-center justify-center">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                )}
              </div>

              <p className="text-xs text-[#6B6B6B] leading-relaxed font-sans">{detail.description}</p>

              <div className="pt-2 border-t border-[#E8D6D9] text-xs font-mono text-[#C1121F] font-semibold flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#C1121F]" />
                {detail.bonus}
              </div>
            </div>
          );
        })}
      </div>

      {/* Action Footer */}
      <div className="flex justify-end pb-8 border-t border-[#E8D6D9] pt-6">
        <button
          onClick={handleFinish}
          className="bg-[#C1121F] hover:bg-[#8F0D16] text-white font-mono font-bold px-8 py-3 rounded border-b-2 border-[#8F0D16] active:translate-y-[1px] text-xs transition-all flex items-center gap-2 min-h-[44px]"
        >
          CONFIRM CLASS & LAUNCH DAYVERN
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
