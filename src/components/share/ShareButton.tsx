'use client';

import { useState } from 'react';
import { ShareCardData } from '@/types/share';
import { ShareAchievementModal } from './ShareAchievementModal';
import { Share2 } from 'lucide-react';

interface ShareButtonProps {
  data: ShareCardData;
  label?: string;
  variant?: 'primary' | 'secondary' | 'ghost' | 'icon' | 'outline';
  size?: 'xs' | 'sm' | 'md';
  className?: string;
}

export function ShareButton({
  data,
  label = 'Share Achievement',
  variant = 'secondary',
  size = 'md',
  className = '',
}: ShareButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return 'bg-[#C1121F] dark:bg-[#F04452] hover:bg-[#8F0D16] dark:hover:bg-[#C1121F] text-white border-b-2 border-[#8F0D16] dark:border-[#C1121F] font-bold';
      case 'ghost':
        return 'bg-transparent text-[#C1121F] dark:text-[#F04452] hover:bg-[#FFF5F6] dark:hover:bg-[#35171B] border border-transparent';
      case 'outline':
        return 'bg-white dark:bg-[#17191D] border border-[#E8D6D9] dark:border-[#303238] text-[#C1121F] dark:text-[#F04452] hover:border-[#C1121F] dark:hover:border-[#F04452] font-semibold';
      case 'icon':
        return 'p-2 rounded bg-[#FFF5F6] dark:bg-[#1D2025] border border-[#E8D6D9] dark:border-[#303238] text-[#C1121F] dark:text-[#F04452] hover:border-[#C1121F] dark:hover:border-[#F04452] min-h-[36px] min-w-[36px] justify-center';
      case 'secondary':
      default:
        return 'bg-[#FFF5F6] dark:bg-[#1D2025] text-[#171717] dark:text-[#F5F5F2] hover:bg-[#FDE7EA] dark:hover:bg-[#35171B] border border-[#E8D6D9] dark:border-[#303238] hover:border-[#C1121F] dark:hover:border-[#F04452] font-semibold';
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'xs':
        return 'px-2 py-1 text-[10px]';
      case 'sm':
        return 'px-2.5 py-1.5 text-xs';
      case 'md':
      default:
        return 'px-3.5 py-2 text-xs';
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={`inline-flex items-center gap-1.5 rounded-md font-mono transition-all touch-target ${getVariantStyles()} ${getSizeStyles()} ${className}`}
        aria-label={label}
        title={label}
      >
        <Share2 className="w-4 h-4 shrink-0 text-[#C1121F] dark:text-[#F04452]" />
        {variant !== 'icon' && <span>{label}</span>}
      </button>

      <ShareAchievementModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        data={data}
      />
    </>
  );
}
