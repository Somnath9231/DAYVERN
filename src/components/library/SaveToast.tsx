'use client';

import React, { useEffect } from 'react';
import { Book } from '@/types/database';
import { Heart, PlusCircle, X } from 'lucide-react';

interface SaveToastProps {
  book: Book | null;
  isOpen: boolean;
  onClose: () => void;
  onCreateTask: (book: Book) => void;
}

export function SaveToast({ book, isOpen, onClose, onCreateTask }: SaveToastProps) {
  useEffect(() => {
    if (!isOpen) return;
    const timer = setTimeout(() => {
      onClose();
    }, 4000); // Auto disappear after 4 seconds
    return () => clearTimeout(timer);
  }, [isOpen, onClose]);

  if (!isOpen || !book) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-11/12 max-w-md animate-slide-up">
      <div className="bg-[#17191D] dark:bg-[#17191D] text-[#F5F5F2] border border-[#303238] rounded-2xl p-4 shadow-2xl flex items-center justify-between gap-3">
        <div className="flex items-center space-x-3 min-w-0">
          <div className="p-2 rounded-xl bg-[#35171B] text-[#F04452] shrink-0">
            <Heart className="w-5 h-5 fill-current" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold text-[#F5F5F2] truncate">
              Saved to your Library
            </p>
            <p className="text-[11px] text-[#B7B7B7] truncate">
              Want to make reading it a task?
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          <button
            onClick={() => {
              onClose();
              onCreateTask(book);
            }}
            className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-[#F04452] hover:bg-[#C1121F] text-white text-xs font-semibold shadow-sm transition-all"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Create Task</span>
          </button>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[#8B8D91] hover:text-[#F5F5F2] transition-colors"
            title="Not now"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
