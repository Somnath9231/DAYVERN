'use client';

import { useState } from 'react';
import { useDayvernStore } from '@/lib/store/dayvernStore';
import { Coins, Plus, CheckCircle2, X, Sparkles } from 'lucide-react';

export default function ShopPage() {
  const { state, claimReward, createReward } = useDayvernStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [costGold, setCostGold] = useState(100);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || costGold <= 0) return;

    createReward(title.trim(), description.trim(), costGold);
    setTitle('');
    setDescription('');
    setIsModalOpen(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="border-b border-[#E8D6D9] dark:border-[#303238] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-[#171717] dark:text-[#F5F5F2] flex items-center gap-2">
            Rewards Shop 🪙
          </h1>
          <p className="text-xs text-[#6B6B6B] dark:text-[#8B8D91] mt-1 font-sans">
            Treat yourself with real-life rewards unlocked with your hard-earned gold.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-4 py-2 bg-[#FFF5F6] dark:bg-[#17191D] border border-[#E8D6D9] dark:border-[#303238] rounded-full flex items-center gap-2 font-mono text-sm">
            <span className="text-lg">🪙</span>
            <strong className="text-[#C1121F] dark:text-[#F04452] text-base">{state.profile.gold} Gold</strong>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-[#C1121F] dark:bg-[#F04452] hover:bg-[#8F0D16] dark:hover:bg-[#C1121F] text-white font-mono font-bold px-4 py-2 rounded text-xs border-b-2 border-[#8F0D16] dark:border-[#C1121F] transition-all min-h-[44px]"
          >
            <Plus className="w-4 h-4" />
            Add Reward
          </button>
        </div>
      </div>

      {/* Rewards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {state.rewards.map((reward) => (
          <div
            key={reward.id}
            className={`p-5 rounded-lg border flex flex-col justify-between space-y-4 transition-all bg-white dark:bg-[#17191D] ${
              reward.is_claimed
                ? 'opacity-60 border-[#E8D6D9] dark:border-[#303238] bg-[#FFF5F6] dark:bg-[#1D2025]'
                : 'border-[#E8D6D9] dark:border-[#303238] hover:border-[#C1121F] dark:hover:border-[#F04452] shadow-sm'
            }`}
          >
            <div className="space-y-2">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-bold text-base text-[#171717] dark:text-[#F5F5F2] font-sans">{reward.title}</h3>
              </div>
              {reward.description && (
                <p className="text-xs text-[#6B6B6B] dark:text-[#8B8D91] font-sans line-clamp-2">{reward.description}</p>
              )}
            </div>

            <div className="pt-3 border-t border-[#E8D6D9] dark:border-[#303238] flex items-center justify-between">
              <div className="flex items-center gap-1 font-mono font-bold text-sm text-[#C1121F] dark:text-[#F04452]">
                <span>Cost:</span> {reward.cost_gold} 🪙
              </div>

              {reward.is_claimed ? (
                <span className="flex items-center gap-1 px-3 py-1 rounded bg-[#FFF5F6] dark:bg-[#1D2025] border border-[#E8D6D9] dark:border-[#303238] text-[#C1121F] dark:text-[#F04452] font-mono text-xs font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Claimed
                </span>
              ) : (
                <button
                  onClick={() => claimReward(reward.id)}
                  disabled={state.profile.gold < reward.cost_gold}
                  className={`px-4 py-1.5 rounded font-mono font-bold text-xs transition-all min-h-[36px] ${
                    state.profile.gold >= reward.cost_gold
                      ? 'bg-[#C1121F] dark:bg-[#F04452] hover:bg-[#8F0D16] dark:hover:bg-[#C1121F] text-white border-b-2 border-[#8F0D16] dark:border-[#C1121F]'
                      : 'bg-[#FFF5F6] dark:bg-[#1D2025] text-[#6B6B6B] dark:text-[#8B8D91] border border-[#E8D6D9] dark:border-[#303238] cursor-not-allowed'
                  }`}
                >
                  Claim
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Add Custom Reward Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#171717]/40 dark:bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#17191D] border border-[#E8D6D9] dark:border-[#303238] rounded-lg max-w-md w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-[#E8D6D9] dark:border-[#303238] pb-3">
              <h3 className="font-bold text-sm font-mono text-[#171717] dark:text-[#F5F5F2] flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#C1121F] dark:text-[#F04452]" />
                ADD REWARD
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-[#6B6B6B] dark:text-[#8B8D91] hover:text-[#171717] dark:hover:text-[#F5F5F2]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-mono text-[#6B6B6B] dark:text-[#8B8D91] uppercase font-medium">Reward Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. ☕ Coffee Break or 🎮 Gaming Session"
                  className="w-full bg-white dark:bg-[#1D2025] border border-[#E8D6D9] dark:border-[#303238] rounded px-3 py-2 text-sm text-[#171717] dark:text-[#F5F5F2] placeholder-[#6B6B6B] dark:placeholder-[#8B8D91] focus:outline-none focus:border-[#C1121F] dark:focus:border-[#F04452]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-mono text-[#6B6B6B] dark:text-[#8B8D91] uppercase font-medium">Description (Optional)</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. 30 minutes of uninterrupted gaming"
                  className="w-full bg-white dark:bg-[#1D2025] border border-[#E8D6D9] dark:border-[#303238] rounded px-3 py-2 text-sm text-[#171717] dark:text-[#F5F5F2] placeholder-[#6B6B6B] dark:placeholder-[#8B8D91] focus:outline-none focus:border-[#C1121F] dark:focus:border-[#F04452]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-mono text-[#6B6B6B] dark:text-[#8B8D91] uppercase font-medium">Gold Cost (🪙)</label>
                <input
                  type="number"
                  min="10"
                  max="5000"
                  value={costGold}
                  onChange={(e) => setCostGold(Number(e.target.value))}
                  className="w-full bg-white dark:bg-[#1D2025] border border-[#E8D6D9] dark:border-[#303238] rounded px-3 py-2 text-xs font-mono text-[#C1121F] dark:text-[#F04452] font-bold"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-[#E8D6D9] dark:border-[#303238]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded text-xs font-mono text-[#6B6B6B] dark:text-[#8B8D91] hover:text-[#171717] dark:hover:text-[#F5F5F2] hover:bg-[#FFF5F6] dark:hover:bg-[#1D2025]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#C1121F] dark:bg-[#F04452] hover:bg-[#8F0D16] dark:hover:bg-[#C1121F] text-white font-bold px-4 py-2 rounded text-xs font-mono border-b-2 border-[#8F0D16] dark:border-[#C1121F]"
                >
                  Save Reward
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}


