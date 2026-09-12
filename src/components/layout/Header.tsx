'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Profile } from '@/types/database';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { 
  Timer, 
  Sparkles, 
  Shield, 
  Menu, 
  X, 
  Coins, 
  Flame,
  LayoutDashboard,
  BookOpen,
  Activity,
  CheckSquare,
  Target,
  Trophy,
  ShoppingBag,
  History,
  User,
  LogOut
} from 'lucide-react';

interface HeaderProps {
  profile: Profile;
  onOpenLogger: () => void;
}

export function Header({ profile, onOpenLogger }: HeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  const navItems = [
    { label: 'Home 🏠', href: '/', icon: LayoutDashboard },
    { label: 'Tasks 🎯', href: '/quests', icon: Target },
    { label: 'Workout 🏋️', href: '/workout', icon: Activity },
    { label: 'Habits 🔥', href: '/habits', icon: CheckSquare },
    { label: 'Character 🎮', href: '/character', icon: User },
    { label: 'Library 📚', href: '/library', icon: BookOpen },
    { label: 'Achievements 🏆', href: '/achievements', icon: Trophy },
    { label: 'Rewards 🪙', href: '/shop', icon: ShoppingBag },
    { label: 'History 📜', href: '/history', icon: History },
    { label: 'Settings ⚙️', href: '/settings', icon: User },
  ];

  return (
    <header className="h-16 bg-white/95 dark:bg-[#0F1012]/95 backdrop-blur border-b border-[#E8D6D9] dark:border-[#303238] px-4 sm:px-6 flex items-center justify-between sticky top-0 z-40">
      <div className="flex items-center gap-3">
        {/* Mobile Hamburger Trigger */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="lg:hidden p-2 rounded text-[#171717] dark:text-[#F5F5F2] hover:text-[#C1121F] dark:hover:text-[#F04452] hover:bg-[#FDE7EA] dark:hover:bg-[#35171B] touch-target focus-visible:ring-2 focus-visible:ring-[#C1121F] focus-visible:outline-none"
          aria-label={isMobileMenuOpen ? 'Close Navigation Menu' : 'Open Navigation Menu'}
          aria-expanded={isMobileMenuOpen}
        >
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>

        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-[#FFF5F6] dark:bg-[#17191D] rounded border border-[#E8D6D9] dark:border-[#303238] text-xs font-mono text-[#171717] dark:text-[#F5F5F2]">
          <Shield className="w-3.5 h-3.5 text-[#C1121F] dark:text-[#F04452]" />
          <span>CLASS: <strong className="text-[#C1121F] dark:text-[#F04452]">{profile.character_class}</strong></span>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-[#FFF5F6] dark:bg-[#17191D] rounded border border-[#E8D6D9] dark:border-[#303238] text-xs font-mono text-[#171717] dark:text-[#F5F5F2]">
          <Sparkles className="w-3.5 h-3.5 text-[#C1121F] dark:text-[#F04452]" />
          <span>LVL <strong className="text-[#C1121F] dark:text-[#F04452]">{profile.level}</strong></span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden md:flex items-center gap-4 text-xs font-mono">
          <div className="flex items-center gap-1.5 text-[#C1121F] dark:text-[#F04452]">
            <Coins className="w-4 h-4" />
            <span className="font-bold">{profile.gold} G</span>
          </div>
          <div className="flex items-center gap-1.5 text-[#C1121F] dark:text-[#F04452]">
            <Flame className="w-4 h-4" />
            <span className="font-bold">{profile.streak_count}d streak</span>
          </div>
        </div>

        <ThemeToggle />

        <button
          onClick={onOpenLogger}
          className="flex items-center gap-2 bg-[#C1121F] dark:bg-[#F04452] hover:bg-[#8F0D16] dark:hover:bg-[#C1121F] text-white font-mono font-bold px-3.5 py-2 min-h-[44px] rounded text-xs border-b-2 border-[#8F0D16] dark:border-[#C1121F] active:translate-y-[1px] transition-all focus-visible:ring-2 focus-visible:ring-[#C1121F] focus-visible:outline-none"
          aria-label="Log activity and claim XP"
        >
          <Timer className="w-4 h-4" />
          <span className="hidden xs:inline">Quick Log</span>
        </button>

        <div className="flex items-center gap-2 pl-2 border-l border-[#E8D6D9] dark:border-[#303238]">
          <div className="w-9 h-9 rounded bg-[#FFF5F6] dark:bg-[#17191D] border border-[#E8D6D9] dark:border-[#303238] flex items-center justify-center text-[#C1121F] dark:text-[#F04452] font-bold font-mono text-xs" title={profile.display_name || 'Character'}>
            {profile.display_name?.slice(0, 2).toUpperCase() || 'AV'}
          </div>
          <button
            onClick={handleSignOut}
            className="p-2 rounded text-[#6B6B6B] dark:text-[#8B8D91] hover:text-[#C1121F] dark:hover:text-[#F04452] hover:bg-[#FDE7EA] dark:hover:bg-[#35171B] min-h-[44px] min-w-[44px] flex items-center justify-center focus-visible:ring-2 focus-visible:ring-[#C1121F] focus-visible:outline-none"
            title="Sign Out of Character Session"
            aria-label="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Mobile Slide-Over Navigation Drawer */}
      {isMobileMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 z-50 bg-[#171717]/40 dark:bg-black/60 backdrop-blur-sm flex"
          role="dialog"
          aria-modal="true"
          aria-label="Mobile Navigation"
        >
          <div className="w-72 bg-white dark:bg-[#17191D] border-r border-[#E8D6D9] dark:border-[#303238] h-full flex flex-col p-4 space-y-4 animate-in slide-in-from-left duration-200">
            <div className="flex items-center justify-between border-b border-[#E8D6D9] dark:border-[#303238] pb-3">
              <div className="flex items-center gap-2.5">
                <img src="/DAY.png.png" alt="DAYVERN Logo" className="h-7 w-auto object-contain" />
                <span className="font-serif font-bold text-[#171717] dark:text-[#F5F5F2] tracking-wide text-[#C1121F] dark:text-[#F04452]">DAYVERN</span>
              </div>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 rounded text-[#6B6B6B] dark:text-[#8B8D91] hover:text-[#171717] dark:hover:text-[#F5F5F2] touch-target"
                aria-label="Close Navigation"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <nav className="flex-1 space-y-1 overflow-y-auto" role="navigation">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-3 py-3 rounded-md text-sm font-medium min-h-[44px] transition-colors ${
                      isActive
                        ? 'bg-[#FDE7EA] dark:bg-[#35171B] text-[#C1121F] dark:text-[#F04452] border border-[#C1121F]/30 dark:border-[#F04452]/30 font-bold'
                        : 'text-[#6B6B6B] dark:text-[#8B8D91] hover:text-[#171717] dark:hover:text-[#F5F5F2] hover:bg-[#FFF5F6] dark:hover:bg-[#1D2025]'
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${isActive ? 'text-[#C1121F] dark:text-[#F04452]' : 'text-[#6B6B6B] dark:text-[#8B8D91]'}`} />
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            <div className="pt-2 border-t border-[#E8D6D9] dark:border-[#303238] space-y-2">
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onOpenLogger();
                }}
                className="w-full flex items-center justify-center gap-2 bg-[#C1121F] dark:bg-[#F04452] hover:bg-[#8F0D16] dark:hover:bg-[#C1121F] text-white font-bold px-3 py-3 rounded border-b-2 border-[#8F0D16] dark:border-[#C1121F] text-sm min-h-[44px]"
              >
                <Timer className="w-4 h-4" /> Log Activity + XP
              </button>
              <button
                onClick={handleSignOut}
                className="w-full flex items-center justify-center gap-2 bg-[#FFF5F6] dark:bg-[#1D2025] text-[#C1121F] dark:text-[#F04452] hover:bg-[#FDE7EA] dark:hover:bg-[#35171B] border border-[#E8D6D9] dark:border-[#303238] font-mono font-bold px-3 py-2.5 rounded text-xs min-h-[44px]"
              >
                <LogOut className="w-4 h-4" /> Sign Out
              </button>
            </div>
          </div>

          <div className="flex-1" onClick={() => setIsMobileMenuOpen(false)} />
        </div>
      )}
    </header>
  );
}

