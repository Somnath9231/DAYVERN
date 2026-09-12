'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useLibraryStore } from '@/lib/store/libraryStore';
import { Book } from '@/types/database';
import { WorkDetailModal } from '@/components/library/WorkDetailModal';
import { SaveTaskModal } from '@/components/library/SaveTaskModal';
import { Bookmark, Heart, ArrowLeft, ExternalLink, ShieldCheck, Compass, PlusCircle } from 'lucide-react';

export default function SavedLibraryPage() {
  const { 
    books, 
    savedBookIds, 
    likedBookIds, 
    toggleSaveBook, 
    toggleLikeBook, 
    openExternalSource 
  } = useLibraryStore();

  const [activeTab, setActiveTab] = useState<'saved' | 'liked'>('saved');
  const [selectedBookForModal, setSelectedBookForModal] = useState<Book | null>(null);
  const [taskModalBook, setTaskModalBook] = useState<Book | null>(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);

  // Saved discovery works
  const savedWorks = books.filter((b) => savedBookIds.includes(b.id));

  // Liked discovery works
  const likedWorks = books.filter((b) => likedBookIds.includes(b.id));

  const displayWorks = activeTab === 'saved' ? savedWorks : likedWorks;

  return (
    <div className="min-h-screen bg-[#FAFAFA] dark:bg-[#0F1012] text-[#17191D] dark:text-[#F5F5F2] font-sans pb-24 transition-colors">
      {/* Header */}
      <header className="border-b border-[#E8D6D9] dark:border-[#303238] bg-white dark:bg-[#17191D]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
          <Link 
            href="/library" 
            className="inline-flex items-center space-x-1.5 text-xs font-semibold text-[#6B6B6B] dark:text-[#B7B7B7] hover:text-[#C1121F] dark:hover:text-[#F04452] transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Library Feed</span>
          </Link>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="font-serif text-3xl font-bold tracking-tight text-[#17191D] dark:text-[#F5F5F2]">
                SAVED
              </h1>
              <p className="text-sm text-[#6B6B6B] dark:text-[#B7B7B7] italic font-serif mt-1">
                "Things worth coming back to."
              </p>
            </div>

            {/* Tab Controls */}
            <div className="flex items-center space-x-2 bg-gray-100 dark:bg-[#1D2025] p-1 rounded-xl border border-[#E8D6D9] dark:border-[#303238]">
              <button
                onClick={() => setActiveTab('saved')}
                className={`flex items-center space-x-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'saved'
                    ? 'bg-[#C1121F] text-white dark:bg-[#F04452] shadow-sm'
                    : 'text-[#6B6B6B] dark:text-[#B7B7B7] hover:text-[#17191D] dark:hover:text-[#F5F5F2]'
                }`}
              >
                <Bookmark className="w-3.5 h-3.5" />
                <span>Saved ({savedWorks.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('liked')}
                className={`flex items-center space-x-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'liked'
                    ? 'bg-[#C1121F] text-white dark:bg-[#F04452] shadow-sm'
                    : 'text-[#6B6B6B] dark:text-[#B7B7B7] hover:text-[#17191D] dark:hover:text-[#F5F5F2]'
                }`}
              >
                <Heart className="w-3.5 h-3.5" />
                <span>Liked ({likedWorks.length})</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-8">
        {displayWorks.length === 0 ? (
          <div className="py-20 text-center border border-dashed border-[#E8D6D9] dark:border-[#303238] rounded-2xl bg-white dark:bg-[#17191D]">
            <Compass className="w-10 h-10 text-[#6B6B6B] dark:text-[#8B8D91] mx-auto mb-3" />
            <h3 className="font-serif text-lg font-bold text-[#17191D] dark:text-[#F5F5F2]">
              No {activeTab} works yet
            </h3>
            <p className="text-xs text-[#6B6B6B] dark:text-[#B7B7B7] mt-1 max-w-sm mx-auto">
              {activeTab === 'saved' 
                ? 'Save interesting works from the Library discovery feed to access them here anytime.'
                : 'Like works that resonate with you to curate your favorite intellectual discoveries.'}
            </p>
            <Link
              href="/library"
              className="inline-block mt-4 px-4 py-2 rounded-xl bg-[#C1121F] dark:bg-[#F04452] text-white text-xs font-semibold"
            >
              Explore Discovery Feed
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {displayWorks.map((book) => {
              const isSaved = savedBookIds.includes(book.id);
              const isLiked = likedBookIds.includes(book.id);

              return (
                <div
                  key={book.id}
                  className="bg-white dark:bg-[#17191D] border border-[#E8D6D9] dark:border-[#303238] rounded-2xl p-6 shadow-sm transition-all flex flex-col sm:flex-row sm:items-start justify-between gap-6"
                >
                  <div className="space-y-3 flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-[#C1121F] dark:text-[#F04452]">
                        {book.category}
                      </span>
                      <span className="text-xs text-[#6B6B6B] dark:text-[#B7B7B7]">
                        • {book.content_type}
                      </span>
                      <span className="text-xs font-mono px-2 py-0.5 rounded bg-gray-100 dark:bg-[#1D2025] text-[#6B6B6B] dark:text-[#B7B7B7]">
                        {book.difficulty ? book.difficulty.charAt(0).toUpperCase() + book.difficulty.slice(1).toLowerCase() : 'Intermediate'}
                      </span>
                    </div>

                    {book.hook_text && (
                      <h2 
                        onClick={() => setSelectedBookForModal(book)}
                        className="font-serif text-xl font-bold text-[#17191D] dark:text-[#F5F5F2] hover:text-[#C1121F] dark:hover:text-[#F04452] cursor-pointer transition-colors leading-snug"
                      >
                        {book.hook_text}
                      </h2>
                    )}

                    <h3 className="font-serif text-base font-bold text-[#17191D] dark:text-[#F5F5F2]">
                      {book.title} <span className="text-xs font-sans font-medium text-[#6B6B6B] dark:text-[#B7B7B7]">— By {book.author}</span>
                    </h3>

                    {book.highlight_text && (
                      <div className="p-3 rounded-xl bg-[#FFF5F6] dark:bg-[#1D2025] border-l-4 border-l-[#C1121F] dark:border-l-[#F04452] border border-[#E8D6D9] dark:border-[#303238] text-xs font-serif italic text-[#171717] dark:text-[#F5F5F2]">
                        <span className="block text-[10px] font-mono font-bold uppercase tracking-wider text-[#C1121F] dark:text-[#F04452] not-italic mb-0.5">
                          KEY IDEA
                        </span>
                        {book.highlight_text}
                      </div>
                    )}

                    <div className="flex items-center space-x-2 text-xs text-[#6B6B6B] dark:text-[#8B8D91] pt-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      <span>Source: <strong className="text-[#17191D] dark:text-[#F5F5F2]">{book.source_name}</strong></span>
                    </div>
                  </div>

                  {/* Actions Column */}
                  <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-3 shrink-0 pt-4 sm:pt-0 border-t sm:border-t-0 border-[#E8D6D9]/50 dark:border-[#303238]">
                    <button
                      onClick={() => openExternalSource(book.source_url)}
                      className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-[#C1121F] dark:bg-[#F04452] hover:bg-[#8F0D16] dark:hover:bg-[#C1121F] text-white font-semibold text-xs shadow-sm transition-all"
                    >
                      <span>Read original</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => {
                          setTaskModalBook(book);
                          setIsTaskModalOpen(true);
                        }}
                        className="p-2 rounded-xl text-xs bg-gray-100 dark:bg-[#1D2025] text-[#6B6B6B] dark:text-[#B7B7B7] hover:text-[#C1121F] dark:hover:text-[#F04452]"
                        title="Create Task"
                      >
                        <PlusCircle className="w-4 h-4 text-[#C1121F] dark:text-[#F04452]" />
                      </button>

                      <button
                        onClick={() => toggleSaveBook(book.id)}
                        className={`p-2 rounded-xl text-xs transition-colors ${
                          isSaved 
                            ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30' 
                            : 'bg-gray-100 dark:bg-[#1D2025] text-[#6B6B6B] dark:text-[#B7B7B7]'
                        }`}
                        title={isSaved ? 'Remove from Saved' : 'Save'}
                      >
                        <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
                      </button>

                      <button
                        onClick={() => toggleLikeBook(book.id)}
                        className={`p-2 rounded-xl text-xs transition-colors ${
                          isLiked 
                            ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/30' 
                            : 'bg-gray-100 dark:bg-[#1D2025] text-[#6B6B6B] dark:text-[#B7B7B7]'
                        }`}
                        title={isLiked ? 'Unlike' : 'Like'}
                      >
                        <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Detail Modal */}
      <WorkDetailModal
        book={selectedBookForModal}
        isOpen={!!selectedBookForModal}
        onClose={() => setSelectedBookForModal(null)}
        isSaved={selectedBookForModal ? savedBookIds.includes(selectedBookForModal.id) : false}
        isLiked={selectedBookForModal ? likedBookIds.includes(selectedBookForModal.id) : false}
        onToggleSave={() => selectedBookForModal && toggleSaveBook(selectedBookForModal.id)}
        onToggleLike={() => selectedBookForModal && toggleLikeBook(selectedBookForModal.id)}
        onRead={openExternalSource}
        onCreateTask={(b) => {
          setTaskModalBook(b);
          setIsTaskModalOpen(true);
        }}
      />

      {/* Save → Task Schedule Modal */}
      <SaveTaskModal
        book={taskModalBook}
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
      />
    </div>
  );
}
