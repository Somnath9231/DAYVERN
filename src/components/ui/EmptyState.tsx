'use client';

import { LucideIcon, Sparkles } from 'lucide-react';
import Link from 'next/link';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
}

export function EmptyState({
  icon: Icon = Sparkles,
  title,
  description,
  actionLabel,
  actionHref,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="rpg-panel p-8 md:p-12 text-center space-y-4 max-w-lg mx-auto my-6 bg-white border border-[#E8D6D9]" role="region" aria-label={title}>
      <div className="w-12 h-12 rounded-lg bg-[#FFF5F6] border border-[#E8D6D9] flex items-center justify-center text-[#C1121F] mx-auto">
        <Icon className="w-6 h-6" />
      </div>

      <div className="space-y-1">
        <h3 className="font-bold font-serif text-lg text-[#171717]">{title}</h3>
        <p className="text-xs text-[#6B6B6B] leading-relaxed font-sans">{description}</p>
      </div>

      {(actionLabel && (actionHref || onAction)) && (
        <div className="pt-2">
          {actionHref ? (
            <Link
              href={actionHref}
              className="inline-flex items-center justify-center gap-2 bg-[#C1121F] hover:bg-[#8F0D16] text-white font-mono font-bold px-4 py-2.5 min-h-[44px] min-w-[44px] rounded border-b-2 border-[#8F0D16] text-xs transition-all focus-visible:ring-2 focus-visible:ring-[#C1121F] focus-visible:outline-none"
            >
              {actionLabel}
            </Link>
          ) : (
            <button
              onClick={onAction}
              className="inline-flex items-center justify-center gap-2 bg-[#C1121F] hover:bg-[#8F0D16] text-white font-mono font-bold px-4 py-2.5 min-h-[44px] min-w-[44px] rounded border-b-2 border-[#8F0D16] text-xs transition-all focus-visible:ring-2 focus-visible:ring-[#C1121F] focus-visible:outline-none"
            >
              {actionLabel}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
