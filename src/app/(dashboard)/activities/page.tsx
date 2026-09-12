'use client';

import { useState } from 'react';
import { useDayvernStore } from '@/lib/store/dayvernStore';
import { ActivityCategory } from '@/types/database';
import { Activity, Clock, Filter, Code, BookOpen, Dumbbell, CheckSquare, Sparkles } from 'lucide-react';

export default function ActivitiesPage() {
  const { state } = useDayvernStore();
  const [filterCategory, setFilterCategory] = useState<string>('all');

  const filteredActivities = state.activities.filter((act) => {
    if (filterCategory === 'all') return true;
    return act.category === filterCategory;
  });

  const categoryIcons: Record<string, any> = {
    coding: Code,
    study: BookOpen,
    fitness: Dumbbell,
    reading: BookOpen,
    habit: CheckSquare,
    custom: Sparkles,
  };

  return (
    <div className="space-y-6 bg-white">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E8D6D9] pb-4">
        <div>
          <h1 className="text-xl font-bold font-serif text-[#171717] flex items-center gap-2">
            <Activity className="w-5 h-5 text-[#C1121F]" />
            Activity Chronicle
          </h1>
          <p className="text-xs text-[#6B6B6B] mt-1 font-sans">
            Complete history of logged work, study sessions, workouts, and XP gains.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          <Filter className="w-4 h-4 text-[#6B6B6B] shrink-0" />
          {['all', 'coding', 'study', 'fitness', 'reading', 'habit'].map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`px-3 py-1 rounded text-xs font-mono capitalize transition-all min-h-[32px] ${
                filterCategory === cat
                  ? 'bg-[#C1121F] text-white font-bold'
                  : 'bg-white border border-[#E8D6D9] text-[#6B6B6B] hover:text-[#171717] hover:bg-[#FFF5F6]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Activity Timeline List */}
      <div className="space-y-3">
        {filteredActivities.length === 0 ? (
          <div className="rpg-panel p-12 text-center space-y-3 bg-white border border-[#E8D6D9]">
            <Activity className="w-8 h-8 text-[#6B6B6B] mx-auto" />
            <p className="text-sm font-mono text-[#6B6B6B]">No activities recorded under this category yet.</p>
          </div>
        ) : (
          filteredActivities.map((act) => {
            const Icon = categoryIcons[act.category] || Sparkles;
            return (
              <div key={act.id} className="rpg-panel p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-[#E8D6D9]">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded bg-[#FFF5F6] border border-[#E8D6D9] text-[#C1121F] mt-0.5">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-sm text-[#171717] font-sans">{act.title}</h3>
                      <span className="text-[10px] font-mono capitalize px-2 py-0.5 rounded bg-[#FFF5F6] border border-[#E8D6D9] text-[#6B6B6B]">
                        {act.category}
                      </span>
                    </div>
                    <p className="text-xs text-[#6B6B6B] font-mono mt-1 flex items-center gap-3">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-[#6B6B6B]" />
                        {act.duration_minutes} Mins
                      </span>
                      <span>•</span>
                      <span>{new Date(act.performed_at).toLocaleString()}</span>
                    </p>
                    {act.notes && (
                      <p className="text-xs text-[#171717] mt-2 bg-[#FFF5F6] p-2 rounded border border-[#E8D6D9]">
                        {act.notes}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0 self-end md:self-center font-mono text-xs">
                  <div className="bg-[#FDE7EA] px-3 py-1.5 rounded border border-[#E8D6D9] text-[#C1121F] font-bold">
                    +{act.xp_earned} XP
                  </div>
                  <div className="flex gap-1.5 text-[11px]">
                    {Object.entries(act.attribute_gains).map(([attr, gain]) => (
                      <span key={attr} className="bg-[#FFF5F6] px-2 py-1 rounded border border-[#E8D6D9] text-[#171717] font-semibold">
                        +{gain} {attr}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
