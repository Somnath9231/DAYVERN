'use client';

import React, { useState } from 'react';
import { Book } from '@/types/database';
import { ExternalLink, Bookmark, Heart, X, ShieldCheck, PlusCircle, CheckCircle2, Sparkles } from 'lucide-react';
import { useLibraryStore } from '@/lib/store/libraryStore';

interface WorkDetailModalProps {
  book: Book | null;
  isOpen: boolean;
  onClose: () => void;
  isSaved: boolean;
  isLiked: boolean;
  onToggleSave: () => void;
  onToggleLike: () => void;
  onRead: (url: string) => void;
  onCreateTask: (book: Book) => void;
}

export function WorkDetailModal({
  book,
  isOpen,
  onClose,
  isSaved,
  isLiked,
  onToggleSave,
  onToggleLike,
  onRead,
  onCreateTask,
}: WorkDetailModalProps) {
  const { completeReadingMilestone } = useLibraryStore();
  const [claiming, setClaiming] = useState(false);
  const [claimFeedback, setClaimFeedback] = useState<string | null>(null);

  if (!isOpen || !book) return null;

  const difficultyColors: Record<string, string> = {
    Beginner: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    Intermediate: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
    Advanced: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
  };

  const handleClaimReward = async () => {
    setClaiming(true);
    setClaimFeedback(null);

    const res = await completeReadingMilestone(book.id);
    setClaiming(false);

    if (res.success) {
      if (res.data?.status === 'already_claimed') {
        setClaimFeedback('Already claimed for this milestone!');
      } else {
        setClaimFeedback('🧠 +5 Intelligence & ⚡ +50 XP Awarded!');
      }
    } else {
      setClaimFeedback(res.error || 'Failed to claim reading milestone.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/70 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div 
        className="relative w-full max-w-2xl bg-white dark:bg-[#17191D] text-[#17191D] dark:text-[#F5F5F2] border border-[#E8D6D9] dark:border-[#303238] rounded-2xl shadow-2xl overflow-hidden my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Decorative Strip */}
        <div className="h-2 w-full bg-[#C1121F] dark:bg-[#F04452]" />

        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 sm:px-8 pt-6 pb-4 border-b border-[#E8D6D9]/50 dark:border-[#303238]">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#C1121F] dark:text-[#F04452] bg-[#FFF5F6] dark:bg-[#35171B] px-2.5 py-1 rounded-md">
              {book.category}
            </span>
            <span className="text-xs text-[#6B6B6B] dark:text-[#B7B7B7] capitalize">
              • {book.content_type}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#6B6B6B] dark:text-[#B7B7B7] hover:bg-[#FFF5F6] dark:hover:bg-[#1D2025] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="px-6 sm:px-8 py-6 max-h-[70vh] overflow-y-auto space-y-6">
          {/* Hook Section */}
          {book.hook_text && (
            <div className="text-xl sm:text-2xl font-serif font-bold text-[#17191D] dark:text-[#F5F5F2] leading-snug tracking-tight">
              {book.hook_text}
            </div>
          )}

          {/* Title & Author */}
          <div>
            <h2 className="font-serif text-lg sm:text-xl font-bold text-[#17191D] dark:text-[#F5F5F2]">
              {book.title}
            </h2>
            <p className="text-sm text-[#6B6B6B] dark:text-[#B7B7B7] font-medium">
              By {book.author}
            </p>
          </div>

          {/* Highlighted Key Idea */}
          {book.highlight_text && (
            <div className="p-4 rounded-xl bg-[#FFF5F6] dark:bg-[#1D2025] border-l-4 border-l-[#C1121F] dark:border-l-[#F04452] border border-[#E8D6D9] dark:border-[#303238]">
              <p className="text-xs font-bold uppercase tracking-wider text-[#C1121F] dark:text-[#F04452] mb-1">
                KEY INSIGHT
              </p>
              <p className="text-sm font-serif italic text-[#171717] dark:text-[#F5F5F2]">
                {book.highlight_text}
              </p>
            </div>
          )}

          {/* Editorial Preview */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-[#6B6B6B] dark:text-[#8B8D91] uppercase tracking-wider">
              Editorial Preview
            </h3>
            <div className="text-sm sm:text-base text-[#171717] dark:text-[#B7B7B7] leading-relaxed whitespace-pre-line font-normal space-y-3">
              {book.preview_text}
            </div>
          </div>

          {/* Badges & Tags */}
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[#E8D6D9]/50 dark:border-[#303238]">
            <span className={`text-xs px-2.5 py-1 rounded-md border font-medium ${difficultyColors[book.difficulty ? book.difficulty.charAt(0).toUpperCase() + book.difficulty.slice(1).toLowerCase() : 'Intermediate'] || 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'}`}>
              {book.difficulty ? book.difficulty.charAt(0).toUpperCase() + book.difficulty.slice(1).toLowerCase() : 'Intermediate'}
            </span>
            {book.tags && book.tags.map((tag, idx) => (
              <span 
                key={idx} 
                className="text-xs font-mono px-2.5 py-1 rounded-md bg-gray-100 dark:bg-[#1D2025] text-[#6B6B6B] dark:text-[#B7B7B7] border border-gray-200 dark:border-[#303238]"
              >
                #{tag}
              </span>
            ))}
          </div>

          {/* Verified Source Line */}
          <div className="p-4 rounded-xl bg-gray-50 dark:bg-[#1D2025] border border-[#E8D6D9] dark:border-[#303238] flex items-start space-x-3">
            <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0" />
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-[#17191D] dark:text-[#F5F5F2]">
                SOURCE: {book.source_name}
              </div>
              <p className="text-xs text-[#6B6B6B] dark:text-[#8B8D91] mt-0.5">
                DAYVERN does not host complete copyrighted works. Click below to read the original material on the verified external source.
              </p>
            </div>
          </div>

          {/* Claim INT Reward Feedback */}
          {claimFeedback && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs font-bold text-emerald-600 dark:text-emerald-400 text-center">
              {claimFeedback}
            </div>
          )}
        </div>

        {/* Modal Actions Footer */}
        <div className="px-6 sm:px-8 py-4 bg-gray-50 dark:bg-[#131518] border-t border-[#E8D6D9] dark:border-[#303238] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <button
              onClick={onToggleSave}
              className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors ${
                isSaved
                  ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                  : 'bg-white dark:bg-[#1D2025] text-[#6B6B6B] dark:text-[#B7B7B7] border border-[#E8D6D9] dark:border-[#303238]'
              }`}
            >
              <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
              <span>{isSaved ? 'Saved' : 'Save'}</span>
            </button>

            <button
              onClick={() => onCreateTask(book)}
              className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-white dark:bg-[#1D2025] text-[#6B6B6B] dark:text-[#B7B7B7] border border-[#E8D6D9] dark:border-[#303238] text-xs font-semibold hover:border-[#C1121F] dark:hover:border-[#F04452]"
            >
              <PlusCircle className="w-4 h-4 text-[#C1121F] dark:text-[#F04452]" />
              <span>Add Task</span>
            </button>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleClaimReward}
              disabled={claiming}
              className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-all disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              <span>{claiming ? 'Claiming...' : 'Mark Complete (🧠 +5 INT)'}</span>
            </button>

            <button
              onClick={() => onRead(book.source_url)}
              className="flex items-center space-x-1.5 px-5 py-2 rounded-xl bg-[#C1121F] dark:bg-[#F04452] hover:bg-[#8F0D16] dark:hover:bg-[#C1121F] text-white font-semibold text-xs shadow-sm transition-all"
            >
              <span>Read Original</span>
              <ExternalLink className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
