'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { 
  LayoutDashboard, 
  BookOpen,
  Activity, 
  CheckSquare, 
  Target, 
  Trophy, 
  ShoppingBag, 
  User, 
  Flame, 
  Coins, 
  Timer,
  History,
  LogOut
} from 'lucide-react';
import { Profile } from '@/types/database';
import { getCharacterNextLevelXp } from '@/lib/rpg/config';

interface SidebarProps {
  profile: Profile;
  onOpenLogger: () => void;
}

export function Sidebar({ profile, onOpenLogger }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const xpNeeded = getCharacterNextLevelXp(profile.level);
  const xpPercent = Math.min(Math.round((profile.current_xp / xpNeeded) * 100), 100);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  const primaryNavItems = [
    { label: 'Home 🏠', href: '/', icon: LayoutDashboard },
    { label: 'Tasks 🎯', href: '/quests', icon: Target },
    { label: 'Workout 🏋️', href: '/workout', icon: Activity },
    { label: 'Habits 🔥', href: '/habits', icon: CheckSquare },
    { label: 'Character 🎮', href: '/character', icon: User },
    { label: 'Library 📚', href: '/library', icon: BookOpen },
  ];

  const secondaryNavItems = [
    { label: 'Achievements 🏆', href: '/achievements', icon: Trophy },
    { label: 'Rewards 🪙', href: '/shop', icon: ShoppingBag },
    { label: 'History Log 📜', href: '/history', icon: History },
    { label: 'Settings ⚙️', href: '/settings', icon: User },
  ];

  return (
    <aside className="hidden lg:flex w-64 bg-[#FFF5F6] dark:bg-[#17191D] border-r border-[#E8D6D9] dark:border-[#303238] flex-col h-screen sticky top-0 z-30 shrink-0">
      {/* Brand Header */}
      <div className="p-4 border-b border-[#E8D6D9] dark:border-[#303238] flex items-center justify-between bg-white dark:bg-[#0F1012]">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="relative w-9 h-9 rounded-md bg-white dark:bg-[#17191D] border border-[#E8D6D9] dark:border-[#303238] p-1 flex items-center justify-center group-hover:border-[#C1121F] dark:group-hover:border-[#F04452] transition-colors shadow-sm">
            <Image
              src="/DAY.png.png"
              alt="DAYVERN Logo"
              width={32}
              height={32}
              className="object-contain"
            />
          </div>
          <div>
            <h1 className="font-serif font-bold text-lg text-[#171717] dark:text-[#F5F5F2] tracking-tight">DAYVERN</h1>
            <p className="text-[9px] font-mono font-semibold uppercase text-[#C1121F] dark:text-[#F04452] tracking-widest">LIFE RPG LEDGER</p>
          </div>
        </Link>
      </div>

      {/* Quick Stats Banner */}
      <div className="p-4 bg-[#FDE7EA]/40 dark:bg-[#35171B]/30 border-b border-[#E8D6D9] dark:border-[#303238] space-y-3">
        <div className="flex items-center justify-between text-xs">
          <span className="text-[#6B6B6B] dark:text-[#8B8D91] font-medium font-mono">LEVEL {profile.level}</span>
          <span className="text-[#C1121F] dark:text-[#F04452] font-mono font-bold">{profile.character_class}</span>
        </div>

        {/* XP Bar */}
        <div className="space-y-1">
          <div className="flex justify-between text-[11px] text-[#6B6B6B] dark:text-[#8B8D91] font-mono">
            <span>XP Progress</span>
            <span className="font-bold text-[#171717] dark:text-[#F5F5F2]">{profile.current_xp} / {xpNeeded} ({xpPercent}%)</span>
          </div>
          <div className="w-full bg-[#E8D6D9] dark:bg-[#303238] h-2 rounded-full overflow-hidden border border-[#E8D6D9] dark:border-[#303238]">
            <div 
              className="bg-[#C1121F] dark:bg-[#F04452] h-full transition-all duration-300 rounded-full"
              style={{ width: `${xpPercent}%` }}
            />
          </div>
        </div>

        {/* Currency & Streaks */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <div className="flex items-center gap-2 bg-white dark:bg-[#0F1012] px-2.5 py-1.5 rounded border border-[#E8D6D9] dark:border-[#303238] text-xs">
            <Coins className="w-3.5 h-3.5 text-[#C1121F] dark:text-[#F04452] shrink-0" />
            <span className="font-mono font-bold text-[#171717] dark:text-[#F5F5F2]">{profile.gold}</span>
            <span className="text-[10px] text-[#6B6B6B] dark:text-[#8B8D91]">GOLD</span>
          </div>
          <div className="flex items-center gap-2 bg-white dark:bg-[#0F1012] px-2.5 py-1.5 rounded border border-[#E8D6D9] dark:border-[#303238] text-xs">
            <Flame className="w-3.5 h-3.5 text-[#C1121F] dark:text-[#F04452] shrink-0" />
            <span className="font-mono font-bold text-[#171717] dark:text-[#F5F5F2]">{profile.streak_count}d</span>
            <span className="text-[10px] text-[#6B6B6B] dark:text-[#8B8D91]">STREAK</span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-4 overflow-y-auto" role="navigation">
        <div className="space-y-1">
          {primaryNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-[#FDE7EA] dark:bg-[#35171B] text-[#C1121F] dark:text-[#F04452] border border-[#C1121F]/30 dark:border-[#F04452]/30 font-bold'
                    : 'text-[#6B6B6B] dark:text-[#8B8D91] hover:text-[#171717] dark:hover:text-[#F5F5F2] hover:bg-white dark:hover:bg-[#0F1012]'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-[#C1121F] dark:text-[#F04452]' : 'text-[#6B6B6B] dark:text-[#8B8D91]'}`} />
                {item.label}
              </Link>
            );
          })}
        </div>

        <div className="pt-2 border-t border-[#E8D6D9]/60 dark:border-[#303238]/60 space-y-1">
          <span className="px-3 text-[10px] font-mono text-[#6B6B6B] dark:text-[#8B8D91] uppercase font-bold tracking-wider">MORE</span>
          {secondaryNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-md text-xs font-medium transition-colors ${
                  isActive
                    ? 'bg-[#FDE7EA] dark:bg-[#35171B] text-[#C1121F] dark:text-[#F04452] border border-[#C1121F]/30 dark:border-[#F04452]/30 font-bold'
                    : 'text-[#6B6B6B] dark:text-[#8B8D91] hover:text-[#171717] dark:hover:text-[#F5F5F2] hover:bg-white dark:hover:bg-[#0F1012]'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#C1121F] dark:text-[#F04452]' : 'text-[#6B6B6B] dark:text-[#8B8D91]'}`} />
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Quick Action Logger & Sign Out */}
      <div className="p-3 border-t border-[#E8D6D9] dark:border-[#303238] bg-white dark:bg-[#0F1012] space-y-2">
        <button
          onClick={onOpenLogger}
          className="w-full flex items-center justify-center gap-2 bg-[#C1121F] dark:bg-[#F04452] hover:bg-[#8F0D16] dark:hover:bg-[#C1121F] text-white font-bold px-3 py-2.5 rounded border-b-2 border-[#8F0D16] dark:border-[#C1121F] active:translate-y-[1px] text-sm transition-all shadow-sm focus-visible:ring-2 focus-visible:ring-[#C1121F] focus-visible:outline-none"
        >
          <Timer className="w-4 h-4" />
          Log Activity + XP
        </button>
        <button
          onClick={handleSignOut}
          className="w-full flex items-center justify-center gap-2 bg-[#FFF5F6] dark:bg-[#1D2025] text-[#C1121F] dark:text-[#F04452] hover:bg-[#FDE7EA] dark:hover:bg-[#35171B] border border-[#E8D6D9] dark:border-[#303238] font-mono font-bold px-3 py-2 rounded text-xs transition-all focus-visible:ring-2 focus-visible:ring-[#C1121F] focus-visible:outline-none"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}

