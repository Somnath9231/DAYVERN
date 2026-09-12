'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDayvernStore } from '@/lib/store/dayvernStore';
import { CharacterClass } from '@/types/database';
import { CLASS_DETAILS } from '@/lib/rpg/engine';
import { createClient } from '@/lib/supabase/client';
import { LogOut, Check, Sun, Moon } from 'lucide-react';
import { useTheme } from '@/components/providers/ThemeProvider';

export default function SettingsPage() {
  const router = useRouter();
  const { state, updateCharacterClass } = useDayvernStore();
  const { profile } = state;
  const { theme, setTheme } = useTheme();

  const [displayName, setDisplayName] = useState(profile.display_name || '');
  const [username] = useState(profile.username || '');

  const classes: CharacterClass[] = [
    'Polymath',
    'Code Mage',
    'Cyber Scholar',
    'Iron Athlete',
    'Discipline Monk',
  ];

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="border-b border-[#E8D6D9] dark:border-[#303238] pb-4">
        <h1 className="text-2xl font-serif font-bold text-[#171717] dark:text-[#F5F5F2]">
          Settings ⚙️
        </h1>
        <p className="text-xs text-[#6B6B6B] dark:text-[#8B8D91] mt-1 font-sans">
          Manage your profile settings, theme appearance, character spec, and account.
        </p>
      </div>

      {/* Theme Appearance Section */}
      <div className="p-5 rounded-lg border border-[#E8D6D9] dark:border-[#303238] bg-white dark:bg-[#17191D] space-y-4 shadow-sm">
        <div>
          <h2 className="text-xs font-mono font-bold text-[#171717] dark:text-[#F5F5F2] uppercase tracking-wider">
            Appearance
          </h2>
          <p className="text-xs text-[#6B6B6B] dark:text-[#8B8D91] font-sans mt-0.5">
            Switch between Classic Editorial Light and Dark mode.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 max-w-sm">
          <button
            type="button"
            onClick={() => setTheme('light')}
            className={`p-3 rounded-lg border flex items-center justify-center gap-2 font-mono text-xs font-bold transition-all min-h-[44px] ${
              theme === 'light'
                ? 'border-[#C1121F] bg-[#FFF5F6] text-[#C1121F] shadow-xs'
                : 'border-[#E8D6D9] dark:border-[#303238] bg-white dark:bg-[#1D2025] text-[#6B6B6B] dark:text-[#8B8D91] hover:text-[#171717] dark:hover:text-[#F5F5F2]'
            }`}
          >
            <Sun className="w-4 h-4" />
            ☀️ Light Mode
          </button>

          <button
            type="button"
            onClick={() => setTheme('dark')}
            className={`p-3 rounded-lg border flex items-center justify-center gap-2 font-mono text-xs font-bold transition-all min-h-[44px] ${
              theme === 'dark'
                ? 'border-[#F04452] bg-[#35171B] text-[#F04452] shadow-xs'
                : 'border-[#E8D6D9] dark:border-[#303238] bg-white dark:bg-[#1D2025] text-[#6B6B6B] dark:text-[#8B8D91] hover:text-[#171717] dark:hover:text-[#F5F5F2]'
            }`}
          >
            <Moon className="w-4 h-4" />
            🌙 Dark Mode
          </button>
        </div>
      </div>

      {/* Profile Section */}
      <div className="p-5 rounded-lg border border-[#E8D6D9] dark:border-[#303238] bg-white dark:bg-[#17191D] space-y-4 shadow-sm">
        <h2 className="text-xs font-mono font-bold text-[#171717] dark:text-[#F5F5F2] uppercase tracking-wider">
          Profile Settings
        </h2>

        <div className="space-y-3">
          <div>
            <label className="text-xs font-mono text-[#6B6B6B] dark:text-[#8B8D91] uppercase font-medium">Display Name</label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Your name"
              className="mt-1 w-full bg-white dark:bg-[#1D2025] border border-[#E8D6D9] dark:border-[#303238] rounded px-3 py-2 text-sm text-[#171717] dark:text-[#F5F5F2] focus:outline-none focus:border-[#C1121F] dark:focus:border-[#F04452]"
            />
          </div>

          <div>
            <label className="text-xs font-mono text-[#6B6B6B] dark:text-[#8B8D91] uppercase font-medium">Username</label>
            <input
              type="text"
              disabled
              value={username}
              className="mt-1 w-full bg-[#FFF5F6] dark:bg-[#1D2025] border border-[#E8D6D9] dark:border-[#303238] rounded px-3 py-2 text-sm text-[#6B6B6B] dark:text-[#8B8D91] cursor-not-allowed font-mono"
            />
          </div>
        </div>
      </div>

      {/* Character Class Spec */}
      <div className="p-5 rounded-lg border border-[#E8D6D9] dark:border-[#303238] bg-white dark:bg-[#17191D] space-y-4 shadow-sm">
        <h2 className="text-xs font-mono font-bold text-[#171717] dark:text-[#F5F5F2] uppercase tracking-wider">
          Character Class Spec
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {classes.map((cls) => {
            const detail = CLASS_DETAILS[cls];
            const isSelected = profile.character_class === cls;

            return (
              <div
                key={cls}
                onClick={() => updateCharacterClass(cls)}
                className={`p-3 rounded-lg border cursor-pointer transition-all ${
                  isSelected
                    ? 'border-[#C1121F] dark:border-[#F04452] bg-[#FFF5F6] dark:bg-[#35171B]'
                    : 'border-[#E8D6D9] dark:border-[#303238] hover:border-[#C1121F]/50 dark:hover:border-[#F04452]/50 bg-white dark:bg-[#1D2025]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-sm text-[#171717] dark:text-[#F5F5F2] font-sans">{detail.title}</h3>
                  {isSelected && (
                    <Check className="w-4 h-4 text-[#C1121F] dark:text-[#F04452]" />
                  )}
                </div>
                <p className="text-xs text-[#6B6B6B] dark:text-[#8B8D91] mt-1 font-sans line-clamp-2">{detail.description}</p>
                <span className="inline-block text-[10px] font-mono text-[#C1121F] dark:text-[#F04452] font-semibold mt-2">
                  Bonus: {detail.bonus}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Account Section */}
      <div className="p-5 rounded-lg border border-[#E8D6D9] dark:border-[#303238] bg-white dark:bg-[#17191D] space-y-3 shadow-sm">
        <h2 className="text-xs font-mono font-bold text-[#171717] dark:text-[#F5F5F2] uppercase tracking-wider">
          Account
        </h2>
        <button
          onClick={handleSignOut}
          className="flex items-center gap-2 bg-[#FFF5F6] dark:bg-[#1D2025] text-[#C1121F] dark:text-[#F04452] hover:bg-[#FDE7EA] dark:hover:bg-[#35171B] border border-[#E8D6D9] dark:border-[#303238] font-mono font-bold px-4 py-2 rounded text-xs transition-all"
        >
          <LogOut className="w-4 h-4" />
          Sign Out of DAYVERN
        </button>
      </div>
    </div>
  );
}


