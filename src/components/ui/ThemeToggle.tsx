'use client';

import { useTheme } from '@/components/providers/ThemeProvider';
import { Sun, Moon } from 'lucide-react';

interface ThemeToggleProps {
  showLabel?: boolean;
  className?: string;
}

export function ThemeToggle({ showLabel = false, className = '' }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      type="button"
      className={`flex items-center gap-2 px-3 py-1.5 rounded-md border transition-all text-xs font-mono touch-target ${
        theme === 'dark'
          ? 'bg-[#17191D] border-[#303238] text-[#F5F5F2] hover:border-[#F04452] hover:bg-[#35171B]'
          : 'bg-[#FFF5F6] border-[#E8D6D9] text-[#171717] hover:border-[#C1121F] hover:bg-[#FDE7EA]'
      } ${className}`}
      aria-label={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
      title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
    >
      {theme === 'dark' ? (
        <>
          <Moon className="w-4 h-4 text-[#F04452]" />
          {showLabel && <span>Dark Mode</span>}
        </>
      ) : (
        <>
          <Sun className="w-4 h-4 text-[#C1121F]" />
          {showLabel && <span>Light Mode</span>}
        </>
      )}
    </button>
  );
}
