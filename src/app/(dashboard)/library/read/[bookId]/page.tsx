'use client';

import { use } from 'react';
import Link from 'next/link';
import { useLibraryStore } from '@/lib/store/libraryStore';
import { 
  ArrowLeft, 
  Bookmark, 
  Heart, 
  ExternalLink, 
  ShieldCheck, 
  BookOpen 
} from 'lucide-react';

export default function ReadModePage({ params }: { params: Promise<{ id?: string; bookId?: string }> }) {
  const resolvedParams = use(params);
  const bookId = resolvedParams.bookId || resolvedParams.id || '';

  const { books, savedBookIds, likedBookIds, toggleSaveBook, toggleLikeBook, openExternalSource } = useLibraryStore();

  const book = books.find((b) => b.id === bookId);
  const isSaved = savedBookIds.includes(bookId);
  const isLiked = likedBookIds.includes(bookId);

  if (!book) {
    return (
      <div className="max-w-xl mx-auto py-16 px-4 text-center space-y-4">
        <BookOpen className="w-10 h-10 text-[#71717A] dark:text-[#A1A1AA] mx-auto" />
        <h2 className="font-serif text-xl font-bold text-[#17191D] dark:text-[#F5F5F2]">Work Not Found</h2>
        <Link href="/library" className="inline-block text-xs font-semibold text-[#C1121F] dark:text-[#F04452] hover:underline">
          &larr; Return to DAYVERN Library Discovery Feed
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] dark:bg-[#0F1012] text-[#17191D] dark:text-[#F5F5F2] font-sans pb-24">
      <header className="border-b border-[#E8D6D9]/60 dark:border-[#2D3139]/60 bg-white dark:bg-[#17191D]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
          <Link 
            href="/library" 
            className="inline-flex items-center space-x-1.5 text-xs font-semibold text-[#52525B] dark:text-[#A1A1AA] hover:text-[#C1121F] dark:hover:text-[#F04452] transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Library Discovery Feed</span>
          </Link>

          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#C1121F] dark:text-[#F04452]">
                {book.category}
              </span>
              <span className="text-xs text-[#71717A] dark:text-[#B7B7B7] capitalize">
                • {book.content_type}
              </span>
              <span className="text-xs font-mono px-2.5 py-0.5 rounded bg-gray-100 dark:bg-[#252830] text-[#52525B] dark:text-[#A1A1AA]">
                {book.difficulty}
              </span>
            </div>

            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#17191D] dark:text-[#F5F5F2] leading-tight">
              {book.title}
            </h1>
            <p className="text-base text-[#52525B] dark:text-[#A1A1AA] font-medium">
              By {book.author}
            </p>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 pt-8 space-y-8">
        {book.why_it_matters && (
          <div className="p-6 rounded-2xl bg-[#FFF5F6] dark:bg-[#1D2025] border border-[#E8D6D9] dark:border-[#2D3139]">
            <p className="text-xs font-bold text-[#C1121F] dark:text-[#F04452] uppercase tracking-wider mb-2">
              Why it matters
            </p>
            <p className="text-base font-serif italic text-[#27272A] dark:text-[#E4E4E7]">
              "{book.why_it_matters}"
            </p>
          </div>
        )}

        <div className="bg-white dark:bg-[#17191D] border border-[#E8D6D9] dark:border-[#2D3139] rounded-2xl p-6 sm:p-8 space-y-6 shadow-sm">
          <h3 className="text-xs font-bold text-[#71717A] dark:text-[#B7B7B7] uppercase tracking-wider">
            Editorial Preview
          </h3>
          <div className="text-base text-[#3F3F46] dark:text-[#D4D4D8] leading-relaxed whitespace-pre-line font-normal space-y-4">
            {book.preview_text}
          </div>

          <div className="p-4 rounded-xl bg-gray-50 dark:bg-[#1D2025] border border-[#E8D6D9] dark:border-[#2D3139] flex items-start space-x-3">
            <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0" />
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-[#17191D] dark:text-[#F5F5F2]">
                SOURCE: {book.source_name}
              </div>
              <p className="text-xs text-[#71717A] dark:text-[#B7B7B7] mt-0.5">
                DAYVERN does not host complete copyrighted works. Click below to read the original material on the verified external source.
              </p>
            </div>
          </div>

          <div className="pt-4 flex flex-wrap items-center justify-between gap-4 border-t border-[#E8D6D9]/50 dark:border-[#2D3139]/50">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => toggleSaveBook(book.id)}
                className={`flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-colors ${
                  isSaved
                    ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                    : 'bg-gray-100 dark:bg-[#252830] text-[#52525B] dark:text-[#A1A1AA]'
                }`}
              >
                <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
                <span>{isSaved ? 'Saved' : 'Save'}</span>
              </button>

              <button
                onClick={() => toggleLikeBook(book.id)}
                className={`flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-colors ${
                  isLiked
                    ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/30'
                    : 'bg-gray-100 dark:bg-[#252830] text-[#52525B] dark:text-[#A1A1AA]'
                }`}
              >
                <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
                <span>{isLiked ? 'Liked' : 'Like'}</span>
              </button>
            </div>

            <button
              onClick={() => openExternalSource(book.source_url)}
              className="flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-[#C1121F] hover:bg-[#8F0D16] text-white font-semibold text-xs shadow-sm transition-all"
            >
              <span>Read Original</span>
              <ExternalLink className="w-4 h-4" />
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
