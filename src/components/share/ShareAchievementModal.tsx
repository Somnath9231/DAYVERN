'use client';

import React, { useRef, useState } from 'react';
import { ShareCardData } from '@/types/share';
import { SocialShareCard } from './SocialShareCard';
import { useTheme } from '@/components/providers/ThemeProvider';
import { toJpeg } from 'html-to-image';
import { X, Share2, Download, Sun, Moon, Loader2 } from 'lucide-react';

interface ShareAchievementModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: ShareCardData;
}

export function ShareAchievementModal({ isOpen, onClose, data }: ShareAchievementModalProps) {
  const { theme } = useTheme();
  const cardRef = useRef<HTMLDivElement>(null);
  const [cardThemeIsDark, setCardThemeIsDark] = useState(theme === 'dark');
  const [isGenerating, setIsGenerating] = useState(false);

  if (!isOpen) return null;

  const generateJpgDataUrl = async (): Promise<string | null> => {
    if (!cardRef.current) return null;
    try {
      // 540x960 DOM element rendered at pixelRatio: 2 produces crisp 1080x1920 resolution
      const dataUrl = await toJpeg(cardRef.current, {
        quality: 0.95,
        pixelRatio: 2,
        cacheBust: true,
      });
      return dataUrl;
    } catch (err) {
      console.error('Failed to generate JPG card image:', err);
      return null;
    }
  };

  const handleDownloadJpg = async () => {
    setIsGenerating(true);
    try {
      const dataUrl = await generateJpgDataUrl();
      if (dataUrl) {
        const link = document.createElement('a');
        const fileName = `DAYVERN-${data.type}-${data.title.replace(/[^a-zA-Z0-9]/g, '_')}-${new Date().toISOString().slice(0, 10)}.jpg`;
        link.download = fileName;
        link.href = dataUrl;
        link.click();
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleNativeShare = async () => {
    setIsGenerating(true);
    try {
      const dataUrl = await generateJpgDataUrl();
      if (!dataUrl) {
        handleDownloadJpg();
        return;
      }

      // Convert dataURL to Blob / File for navigator.share
      const response = await fetch(dataUrl);
      const blob = await response.blob();
      const fileName = `DAYVERN-${data.type}-${new Date().toISOString().slice(0, 10)}.jpg`;
      const file = new File([blob], fileName, { type: 'image/jpeg' });

      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: `DAYVERN — ${data.title}`,
          text: `Check out my ${data.title} accomplishment on DAYVERN!`,
        });
      } else {
        // Fallback to downloading JPG
        handleDownloadJpg();
      }
    } catch (err) {
      console.error('Web Share failed, falling back to download:', err);
      handleDownloadJpg();
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#171717]/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-[#17191D] border border-[#E8D6D9] dark:border-[#303238] rounded-xl max-w-lg w-full p-6 space-y-5 shadow-2xl my-8">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#E8D6D9] dark:border-[#303238] pb-3">
          <div>
            <h3 className="font-bold text-lg font-serif text-[#171717] dark:text-[#F5F5F2] flex items-center gap-2">
              <span>Share Achievement</span> ✨
            </h3>
            <p className="text-xs text-[#6B6B6B] dark:text-[#8B8D91] font-mono mt-0.5">
              9:16 Vertical Story Card for Instagram & Socials
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setCardThemeIsDark(!cardThemeIsDark)}
              className="p-2 rounded border border-[#E8D6D9] dark:border-[#303238] text-xs font-mono text-[#6B6B6B] dark:text-[#B7B7B7] hover:text-[#C1121F] dark:hover:text-[#F04452]"
              title="Toggle Card Theme"
            >
              {cardThemeIsDark ? <Sun className="w-4 h-4 text-[#F04452]" /> : <Moon className="w-4 h-4 text-[#C1121F]" />}
            </button>

            <button
              onClick={onClose}
              className="text-[#6B6B6B] dark:text-[#8B8D91] hover:text-[#171717] dark:hover:text-[#F5F5F2] p-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Card Scaled Preview Container */}
        <div className="relative bg-[#FFF5F6] dark:bg-[#0F1012] p-4 rounded-lg border border-[#E8D6D9] dark:border-[#303238] flex items-center justify-center overflow-hidden">
          {/* Scaled Wrapper: Converts 540x960 dimensions into compact responsive preview */}
          <div className="transform scale-[0.45] sm:scale-[0.52] origin-top my-[-240px] sm:my-[-210px]">
            <SocialShareCard data={data} isDark={cardThemeIsDark} cardRef={cardRef} />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          {typeof navigator !== 'undefined' && 'share' in navigator && (
            <button
              onClick={handleNativeShare}
              disabled={isGenerating}
              className="flex-1 flex items-center justify-center gap-2 bg-[#C1121F] dark:bg-[#F04452] hover:bg-[#8F0D16] dark:hover:bg-[#C1121F] text-white font-mono font-bold px-4 py-3 rounded-lg text-xs border-b-2 border-[#8F0D16] dark:border-[#C1121F] transition-all min-h-[44px]"
            >
              {isGenerating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Share2 className="w-4 h-4" />
              )}
              Share Story
            </button>
          )}

          <button
            onClick={handleDownloadJpg}
            disabled={isGenerating}
            className="flex-1 flex items-center justify-center gap-2 bg-[#FFF5F6] dark:bg-[#1D2025] hover:bg-[#FDE7EA] dark:hover:bg-[#35171B] text-[#171717] dark:text-[#F5F5F2] font-mono font-bold px-4 py-3 rounded-lg text-xs border border-[#E8D6D9] dark:border-[#303238] transition-all min-h-[44px]"
          >
            {isGenerating ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Download className="w-4 h-4 text-[#C1121F] dark:text-[#F04452]" />
            )}
            Download JPG (1080×1920)
          </button>
        </div>
      </div>
    </div>
  );
}
