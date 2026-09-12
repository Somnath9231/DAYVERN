'use client';

import React from 'react';
import Image from 'next/image';
import { ShareCardData } from '@/types/share';

interface SocialShareCardProps {
  data: ShareCardData;
  isDark?: boolean;
  cardRef?: React.RefObject<HTMLDivElement>;
}

export function SocialShareCard({ data, isDark = false, cardRef }: SocialShareCardProps) {
  const formattedDate = data.date || new Date().toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <div
      ref={cardRef}
      style={{ width: '540px', height: '960px' }}
      className={`relative p-10 flex flex-col justify-between overflow-hidden select-none shrink-0 font-sans ${
        isDark 
          ? 'bg-[#0F1012] text-[#F5F5F2] border border-[#303238]' 
          : 'bg-[#FFFFFF] text-[#171717] border border-[#E8D6D9]'
      }`}
    >
      {/* Background Decorative Frame */}
      <div 
        className={`absolute inset-4 rounded-xl border pointer-events-none ${
          isDark ? 'border-[#303238]' : 'border-[#E8D6D9]'
        }`} 
      />

      {/* TOP: Brand Header */}
      <div className="relative z-10 flex items-center justify-between pt-2">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-md border p-1 flex items-center justify-center ${
            isDark ? 'bg-[#17191D] border-[#303238]' : 'bg-[#FFF5F6] border-[#E8D6D9]'
          }`}>
            <Image
              src="/DAY.png.png"
              alt="DAYVERN Logo"
              width={28}
              height={28}
              className="object-contain"
            />
          </div>
          <div>
            <h1 className={`font-serif font-bold text-xl tracking-tight ${isDark ? 'text-[#F5F5F2]' : 'text-[#171717]'}`}>
              DAYVERN
            </h1>
            <p className={`text-[10px] font-mono uppercase tracking-widest font-semibold ${isDark ? 'text-[#F04452]' : 'text-[#C1121F]'}`}>
              LIFE RPG LEDGER
            </p>
          </div>
        </div>

        <div className={`px-3 py-1 rounded-full text-[11px] font-mono font-semibold ${
          isDark ? 'bg-[#17191D] border border-[#303238] text-[#8B8D91]' : 'bg-[#FFF5F6] border border-[#E8D6D9] text-[#6B6B6B]'
        }`}>
          {formattedDate}
        </div>
      </div>

      {/* CENTER: Main Accomplishment Hero */}
      <div className="relative z-10 my-auto text-center space-y-6">
        {/* Category Header */}
        <div className={`inline-block px-3.5 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider ${
          isDark 
            ? 'bg-[#35171B] border border-[#C1121F]/40 text-[#F04452]' 
            : 'bg-[#FDE7EA] border border-[#E8D6D9] text-[#C1121F]'
        }`}>
          {data.type.replace('_', ' ')} MILESTONE
        </div>

        {/* Central Icon Medal */}
        <div className="relative mx-auto w-24 h-24 flex items-center justify-center">
          <div className={`absolute inset-0 rounded-full border-2 ${
            isDark ? 'border-[#F04452]/40 bg-[#17191D]' : 'border-[#C1121F]/40 bg-[#FFF5F6]'
          }`} />
          <span className="relative z-10 text-5xl">{data.iconEmoji}</span>
        </div>

        {/* Subtitle / Phrase */}
        <p className={`text-xs font-mono uppercase tracking-widest font-bold ${
          isDark ? 'text-[#8B8D91]' : 'text-[#6B6B6B]'
        }`}>
          {data.subtitle || 'ACCOMPLISHMENT UNLOCKED'}
        </p>

        {/* Title */}
        <h2 className={`text-3xl font-serif font-bold tracking-tight px-4 leading-tight ${
          isDark ? 'text-[#F5F5F2]' : 'text-[#171717]'
        }`}>
          {data.title}
        </h2>

        {/* Primary Metric */}
        <div className={`text-5xl font-mono font-bold tracking-tight py-2 ${
          isDark ? 'text-[#F04452]' : 'text-[#C1121F]'
        }`}>
          {data.primaryMetric}
        </div>

        {/* Detailed Phrase if present */}
        {data.detailText && (
          <p className={`text-xs font-sans max-w-xs mx-auto ${
            isDark ? 'text-[#B7B7B7]' : 'text-[#6B6B6B]'
          }`}>
            &ldquo;{data.detailText}&rdquo;
          </p>
        )}

        {/* Reward Pills */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2 font-mono text-xs">
          {data.xpEarned !== undefined && data.xpEarned > 0 && (
            <div className={`px-4 py-2 rounded-lg border font-bold ${
              isDark 
                ? 'bg-[#17191D] border-[#303238] text-[#F04452]' 
                : 'bg-[#FFF5F6] border-[#E8D6D9] text-[#C1121F]'
            }`}>
              +{data.xpEarned} ⚡ XP
            </div>
          )}

          {data.goldEarned !== undefined && data.goldEarned > 0 && (
            <div className={`px-4 py-2 rounded-lg border font-bold ${
              isDark 
                ? 'bg-[#17191D] border-[#303238] text-[#F5F5F2]' 
                : 'bg-white border-[#E8D6D9] text-[#171717]'
            }`}>
              +{data.goldEarned} 🪙 GOLD
            </div>
          )}

          {data.streakCount !== undefined && data.streakCount > 0 && (
            <div className={`px-4 py-2 rounded-lg border font-bold ${
              isDark 
                ? 'bg-[#35171B] border-[#C1121F] text-[#F04452]' 
                : 'bg-[#FDE7EA] border-[#E8D6D9] text-[#C1121F]'
            }`}>
              🔥 {data.streakCount} DAY STREAK
            </div>
          )}
        </div>
      </div>

      {/* FOOTER: Minimal Tagline */}
      <div className="relative z-10 border-t pt-4 flex items-center justify-between text-[11px] font-mono">
        <span className={isDark ? 'text-[#8B8D91]' : 'text-[#6B6B6B]'}>
          VERIFIED ON-CHAIN & AUDITED
        </span>
        <span className={`font-semibold ${isDark ? 'text-[#F04452]' : 'text-[#C1121F]'}`}>
          dayvern.app
        </span>
      </div>
    </div>
  );
}
