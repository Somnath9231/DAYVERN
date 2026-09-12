'use client';

import React, { useState, useMemo } from 'react';
import { useLibraryStore } from '@/lib/store/libraryStore';
import { Book, LibraryCategory } from '@/types/database';
import { WorkDetailModal } from '@/components/library/WorkDetailModal';
import { SaveToast } from '@/components/library/SaveToast';
import { SaveTaskModal } from '@/components/library/SaveTaskModal';
import { 
  Search, 
  Bookmark, 
  ExternalLink, 
  Compass, 
  PlusCircle, 
  Heart,
  BookMarked,
  ShieldCheck
} from 'lucide-react';
import Link from 'next/link';

const CATEGORIES: { label: LibraryCategory; icon: string; tagline: string }[] = [
  { label: 'Psychology', icon: '🧠', tagline: 'Understand the machinery behind human thought, decision, and behaviour.' },
  { label: 'Philosophy', icon: '📜', tagline: 'Question reality, ethics, consciousness, and human purpose.' },
  { label: 'History', icon: '🏛️', tagline: 'Discover the unseen forces that built and dissolved civilizations.' },
  { label: 'Architecture', icon: '🏗️', tagline: 'Explore how form, space, and structures shape human experience.' },
  { label: 'Fiction', icon: '📖', tagline: 'Uncover psychological, existential, surreal, and classic narrative worlds.' },
  { label: 'Short Stories', icon: '✍️', tagline: 'Experience concentrated tales of mystery, gothic dread, and irony.' },
  { label: 'Science', icon: '🔬', tagline: 'Investigate natural selection, spacetime, quantum reality, and physics.' },
  { label: 'Art & Culture', icon: '🎨', tagline: 'Examine aesthetic theory, color vibration, modernism, and culture.' },
  { label: 'Sociology', icon: '🧩', tagline: 'Study social norms, group behavior, institutions, and ethnocentrism.' },
  { label: 'Economics & Behaviour', icon: '💼', tagline: 'Analyze status competition, conspicuous consumption, and incentives.' },
  { label: 'Literature', icon: '📚', tagline: 'Study dramatic structure, literary criticism, tragedy, and narrative theory.' },
  { label: 'Technology', icon: '💻', tagline: 'Examine information theory, computing machinery, AI, and digital culture.' },
];

export default function LibraryPage() {
  const { 
    books, 
    savedBookIds, 
    likedBookIds, 
    loading, 
    error, 
    toggleSaveBook, 
    toggleLikeBook, 
    openExternalSource
  } = useLibraryStore();

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals & Overlay state
  const [selectedBookForModal, setSelectedBookForModal] = useState<Book | null>(null);
  const [toastBook, setToastBook] = useState<Book | null>(null);
  const [isToastOpen, setIsToastOpen] = useState(false);
  const [taskModalBook, setTaskModalBook] = useState<Book | null>(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);

  // Active category detail object
  const activeCategoryObj = useMemo(() => {
    if (!selectedCategory) return null;
    return CATEGORIES.find(c => (c.label || '').toLowerCase() === selectedCategory.toLowerCase());
  }, [selectedCategory]);

  // Robust, Deterministic Category & Difficulty Filtering Logic
  const filteredBooks = useMemo(() => {
    if (!Array.isArray(books)) return [];

    const list = books.filter((book) => {
      if (!book) return false;

      // 0. Strict Garbage / Placeholder Protection Filter
      const isGarbageString = (str?: string | null) => {
        if (!str) return false;
        const s = String(str).toLowerCase();
        return (
          s.includes('title-writer') ||
          s.includes('abcaef') ||
          s.includes('aaaaa') ||
          s.includes('(bold)') ||
          s.includes('[bold]')
        );
      };

      if (
        isGarbageString(book.title) || 
        isGarbageString(book.author) || 
        isGarbageString(book.hook_text) || 
        isGarbageString(book.preview_text)
      ) {
        return false;
      }

      // 1. Category Matching with Alias Normalization
      if (selectedCategory) {
        const bookCat = String(book.category || '').trim().toLowerCase();
        const selCat = String(selectedCategory).trim().toLowerCase();

        let isMatch = bookCat === selCat;
        if (!isMatch) {
          if (selCat === 'stories' || selCat === 'fiction') {
            isMatch = bookCat === 'stories' || bookCat === 'fiction' || bookCat === 'short stories';
          } else if (selCat === 'art' || selCat === 'art & culture') {
            isMatch = bookCat === 'art' || bookCat === 'art & culture';
          } else if (selCat === 'economics' || selCat === 'economics & behaviour') {
            isMatch = bookCat === 'economics' || bookCat === 'economics & behaviour';
          }
        }
        if (!isMatch) return false;
      }

      // 2. Case-insensitive, Null-safe Difficulty Filter
      if (selectedDifficulty && selectedDifficulty !== 'All') {
        const bookDiff = String(book.difficulty || '').trim().toLowerCase();
        const selDiff = String(selectedDifficulty).trim().toLowerCase();
        if (bookDiff !== selDiff) return false;
      }

      // 3. Search Query Filter
      if (searchQuery && searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        const titleMatch = String(book.title || '').toLowerCase().includes(q);
        const authorMatch = String(book.author || '').toLowerCase().includes(q);
        const catMatch = String(book.category || '').toLowerCase().includes(q);
        const hookMatch = String(book.hook_text || '').toLowerCase().includes(q);
        const highlightMatch = String(book.highlight_text || '').toLowerCase().includes(q);
        const descMatch = String(book.description || '').toLowerCase().includes(q);
        const tagMatch = Array.isArray(book.tags) && book.tags.some(t => String(t || '').toLowerCase().includes(q));

        return titleMatch || authorMatch || catMatch || hookMatch || highlightMatch || descMatch || tagMatch;
      }

      return true;
    });

    // 4. Deterministic Curated Sort (Featured items first, then by title)
    return list.sort((a, b) => {
      if (a.featured && !b.featured) return -1;
      if (!a.featured && b.featured) return 1;
      return (a.title || '').localeCompare(b.title || '');
    });
  }, [books, selectedCategory, selectedDifficulty, searchQuery]);

  // Handle Save click with Toast trigger
  const handleSaveToggle = async (book: Book) => {
    const isNowSaved = await toggleSaveBook(book.id);
    if (isNowSaved) {
      setToastBook(book);
      setIsToastOpen(true);
    }
  };

  // Helper: Format Hook Text Safely (Quotation Safety Rule)
  const renderHookText = (text: string) => {
    if (!text) return null;
    const trimmed = text.trim();
    // Only wrap in quotes if text naturally starts with a quote character
    const isExplicitQuote = trimmed.startsWith('"') || trimmed.startsWith('“') || trimmed.startsWith("'");
    return isExplicitQuote ? trimmed : trimmed;
  };

  // Helper: Format Highlight Text Safely
  const renderHighlightText = (text: string) => {
    if (!text) return null;
    const trimmed = text.trim();
    const isExplicitQuote = trimmed.startsWith('"') || trimmed.startsWith('“') || trimmed.startsWith("'");
    return isExplicitQuote ? trimmed : trimmed;
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] dark:bg-[#0F1012] text-[#17191D] dark:text-[#F5F5F2] font-sans pb-24 transition-colors">
      {/* Header */}
      <header className="border-b border-[#E8D6D9] dark:border-[#303238] bg-white dark:bg-[#17191D]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="text-xs font-mono uppercase tracking-widest text-[#C1121F] dark:text-[#F04452] font-semibold">
                CURATED INTELLECTUAL DISCOVERY
              </span>
              <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-[#17191D] dark:text-[#F5F5F2] mt-1">
                LIBRARY
              </h1>
              <p className="text-base text-[#6B6B6B] dark:text-[#B7B7B7] italic mt-1 font-serif">
                "Read something that changes the way you think."
              </p>
            </div>

            {/* Header Actions */}
            <div className="flex items-center space-x-3">
              <Link
                href="/library/saved"
                className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-white dark:bg-[#1D2025] border border-[#E8D6D9] dark:border-[#303238] text-xs font-semibold text-[#6B6B6B] dark:text-[#F5F5F2] hover:border-[#C1121F] dark:hover:border-[#F04452] transition-colors"
              >
                <BookMarked className="w-4 h-4 text-[#C1121F] dark:text-[#F04452]" />
                <span>Saved Works ({savedBookIds.length})</span>
              </Link>

              <Link
                href="/library/admin"
                className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-[#FFF5F6] dark:bg-[#35171B] text-xs font-semibold text-[#C1121F] dark:text-[#F04452] hover:bg-[#C1121F] hover:text-white dark:hover:bg-[#F04452] dark:hover:text-white transition-colors"
              >
                <PlusCircle className="w-4 h-4" />
                <span className="hidden sm:inline">Add Resource</span>
              </Link>
            </div>
          </div>

          {/* SQUARE CATEGORY TILES GRID (ALL 11 CATEGORIES) */}
          <div className="mt-8">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-mono uppercase tracking-widest text-[#6B6B6B] dark:text-[#8B8D91] font-bold">
                EXPLORE CATEGORIES
              </h3>
              {selectedCategory && (
                <button
                  onClick={() => setSelectedCategory(null)}
                  className="text-xs font-mono text-[#C1121F] dark:text-[#F04452] hover:underline font-bold"
                >
                  Clear filter (Show All)
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2.5">
              {CATEGORIES.map((cat) => {
                const isActive = selectedCategory?.toLowerCase() === cat.label.toLowerCase();
                return (
                  <button
                    key={cat.label}
                    onClick={() => setSelectedCategory(isActive ? null : cat.label)}
                    className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all ${
                      isActive
                        ? 'bg-[#C1121F] text-white border-[#C1121F] dark:bg-[#35171B] dark:text-[#F5F5F2] dark:border-[#F04452] shadow-sm'
                        : 'bg-white dark:bg-[#1D2025] text-[#17191D] dark:text-[#F5F5F2] border-[#E8D6D9] dark:border-[#303238] hover:border-[#C1121F] dark:hover:border-[#F04452]'
                    }`}
                  >
                    <span className="text-xl mb-1">{cat.icon}</span>
                    <span className="text-xs font-bold font-serif tracking-tight leading-tight">
                      {cat.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </header>

      {/* Main Discovery Feed Area */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-8">

        {/* Selected Category Header Hook */}
        {selectedCategory && activeCategoryObj && (
          <div className="mb-8 pb-6 border-b border-[#E8D6D9] dark:border-[#303238]">
            <div className="flex items-center space-x-2 text-2xl">
              <span>{activeCategoryObj.icon}</span>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold uppercase tracking-wide text-[#17191D] dark:text-[#F5F5F2]">
                {activeCategoryObj.label}
              </h2>
            </div>
            <p className="text-sm text-[#6B6B6B] dark:text-[#B7B7B7] mt-2 font-serif italic">
              "{activeCategoryObj.tagline}"
            </p>
          </div>
        )}

        {/* Search & Difficulty Filter */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B6B6B] dark:text-[#8B8D91]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search hook, theory, author, or tag..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white dark:bg-[#17191D] border border-[#E8D6D9] dark:border-[#303238] text-sm text-[#17191D] dark:text-[#F5F5F2] placeholder-[#8B8D91] focus:outline-none focus:border-[#C1121F] dark:focus:border-[#F04452] transition-colors"
            />
          </div>

          <div className="flex items-center space-x-1 bg-white dark:bg-[#17191D] p-1 rounded-xl border border-[#E8D6D9] dark:border-[#303238]">
            {['All', 'Beginner', 'Intermediate', 'Advanced'].map((diff) => {
              const isSelected = selectedDifficulty.toLowerCase() === diff.toLowerCase();
              return (
                <button
                  key={diff}
                  onClick={() => setSelectedDifficulty(diff)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    isSelected
                      ? 'bg-[#C1121F] text-white dark:bg-[#F04452]'
                      : 'text-[#6B6B6B] dark:text-[#B7B7B7] hover:text-[#17191D] dark:hover:text-[#F5F5F2]'
                  }`}
                >
                  {diff}
                </button>
              );
            })}
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="py-20 text-center">
            <div className="w-8 h-8 border-2 border-[#C1121F] dark:border-[#F04452] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-sm font-serif italic text-[#6B6B6B] dark:text-[#B7B7B7]">
              Curating intellectual discovery feed...
            </p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="p-6 rounded-2xl bg-rose-50 dark:bg-[#35171B] border border-rose-200 dark:border-rose-900/30 text-center my-8">
            <p className="text-sm font-semibold text-rose-600 dark:text-rose-400">{error}</p>
          </div>
        )}

        {/* Empty State (Valid Filter Result) */}
        {!loading && !error && filteredBooks.length === 0 && (
          <div className="py-16 text-center border border-dashed border-[#E8D6D9] dark:border-[#303238] rounded-2xl bg-white dark:bg-[#17191D]">
            <Compass className="w-10 h-10 text-[#6B6B6B] dark:text-[#8B8D91] mx-auto mb-3" />
            <h3 className="font-serif text-lg font-bold text-[#17191D] dark:text-[#F5F5F2]">
              No discoveries found for this criteria
            </h3>
            <p className="text-xs text-[#6B6B6B] dark:text-[#B7B7B7] mt-1">
              Try adjusting your category or difficulty filter.
            </p>
            <button
              onClick={() => { setSelectedCategory(null); setSelectedDifficulty('All'); setSearchQuery(''); }}
              className="mt-4 px-4 py-2 rounded-xl bg-[#C1121F] dark:bg-[#F04452] text-white text-xs font-semibold"
            >
              Explore All Discoveries
            </button>
          </div>
        )}

        {/* EDITORIAL DISCOVERY FEED */}
        {!loading && filteredBooks.length > 0 && (
          <div className="space-y-12">
            <div className="flex items-center justify-between pb-2 border-b border-[#E8D6D9]/50 dark:border-[#303238]">
              <span className="text-xs font-mono uppercase tracking-widest text-[#6B6B6B] dark:text-[#8B8D91] font-bold">
                {selectedCategory ? `${selectedCategory.toUpperCase()} DISCOVERIES` : 'CURATED DISCOVERY FEED'} ({filteredBooks.length} WORKS)
              </span>
            </div>

            {filteredBooks.map((book) => {
              const isSaved = savedBookIds.includes(book.id);
              const isLiked = likedBookIds.includes(book.id);
              const displayCategory = String(book.category || 'General').toUpperCase();
              const displayDifficulty = String(book.difficulty ? book.difficulty.charAt(0).toUpperCase() + book.difficulty.slice(1).toLowerCase() : 'Intermediate');

              return (
                <article
                  key={book.id}
                  className="bg-white dark:bg-[#17191D] border border-[#E8D6D9] dark:border-[#303238] rounded-2xl p-6 sm:p-10 shadow-sm transition-all space-y-5"
                >
                  {/* 1. CATEGORY */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-widest text-[#C1121F] dark:text-[#F04452] bg-[#FFF5F6] dark:bg-[#35171B] px-2.5 py-1 rounded-md">
                      {displayCategory}
                    </span>

                    <span className="text-xs font-mono px-2.5 py-1 rounded-md bg-gray-100 dark:bg-[#1D2025] text-[#6B6B6B] dark:text-[#B7B7B7] border border-gray-200 dark:border-[#303238] capitalize">
                      {book.content_type || 'work'}
                    </span>
                  </div>

                  {/* 2. TITLE & 3. AUTHOR */}
                  <div 
                    onClick={() => setSelectedBookForModal(book)}
                    className="cursor-pointer group space-y-1"
                  >
                    <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#17191D] dark:text-[#F5F5F2] group-hover:text-[#C1121F] dark:group-hover:text-[#F04452] leading-tight transition-colors">
                      {book.title}
                    </h2>
                    <p className="text-sm font-sans font-medium text-[#6B6B6B] dark:text-[#B7B7B7]">
                      By {book.author}
                    </p>
                  </div>

                  {/* 4. DIFFICULTY BADGE */}
                  <div className="pt-0.5">
                    <span className="inline-block text-xs font-semibold px-2.5 py-0.5 rounded-md bg-gray-100 dark:bg-[#1D2025] text-[#6B6B6B] dark:text-[#B7B7B7] border border-gray-200 dark:border-[#303238]">
                      Difficulty: {displayDifficulty}
                    </span>
                  </div>

                  {/* 5. BOLD HOOK (1–2 LINES, BOLD NEWSREADER FONT) */}
                  {book.hook_text && (
                    <div 
                      onClick={() => setSelectedBookForModal(book)}
                      className="cursor-pointer font-serif text-lg sm:text-xl font-bold text-[#17191D] dark:text-[#F5F5F2] leading-snug border-l-2 border-[#C1121F] dark:border-[#F04452] pl-3 py-0.5"
                    >
                      {renderHookText(book.hook_text)}
                    </div>
                  )}

                  {/* 6. SHORT PREVIEW PARAGRAPH (4–15 VISUAL LINES) */}
                  <div className="text-sm sm:text-base text-[#171717] dark:text-[#B7B7B7] leading-relaxed whitespace-pre-line font-normal">
                    {book.preview_text}
                  </div>

                  {/* 7. HIGHLIGHTED / KEY IDEA BOX */}
                  {book.highlight_text && (
                    <div className="p-4 rounded-xl bg-[#FFF5F6] dark:bg-[#1D2025] border-l-4 border-l-[#C1121F] dark:border-l-[#F04452] border border-[#E8D6D9] dark:border-[#303238]">
                      <p className="text-xs font-bold uppercase tracking-wider text-[#C1121F] dark:text-[#F04452] mb-1">
                        KEY INSIGHT
                      </p>
                      <p className="text-sm font-serif italic text-[#171717] dark:text-[#F5F5F2]">
                        {renderHighlightText(book.highlight_text)}
                      </p>
                    </div>
                  )}

                  {/* 8. WHY IT MATTERS */}
                  {book.why_it_matters && (
                    <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-[#1D2025] border border-gray-200 dark:border-[#303238] text-xs">
                      <strong className="text-[#17191D] dark:text-[#F5F5F2] uppercase tracking-wider block mb-0.5">
                        WHY IT MATTERS:
                      </strong>
                      <span className="text-[#6B6B6B] dark:text-[#B7B7B7]">
                        {book.why_it_matters}
                      </span>
                    </div>
                  )}

                  {/* 9. TAGS */}
                  {book.tags && book.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-1">
                      {book.tags.map((tag, idx) => (
                        <span 
                          key={idx}
                          className="text-xs font-mono px-2.5 py-1 rounded-md bg-gray-50 dark:bg-[#1D2025] text-[#6B6B6B] dark:text-[#B7B7B7] border border-[#E8D6D9]/50 dark:border-[#303238]"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Verified Source Attribution */}
                  <div className="pt-3 border-t border-[#E8D6D9]/60 dark:border-[#303238] flex items-center space-x-2 text-xs text-[#6B6B6B] dark:text-[#8B8D91]">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span>SOURCE: <strong className="text-[#17191D] dark:text-[#F5F5F2]">{book.source_name}</strong></span>
                  </div>

                  {/* 10. CONTROLS: SAVE & READ ORIGINAL */}
                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleSaveToggle(book)}
                        className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                          isSaved
                            ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                            : 'bg-gray-100 dark:bg-[#1D2025] text-[#6B6B6B] dark:text-[#B7B7B7] hover:bg-gray-200 dark:hover:bg-[#252830]'
                        }`}
                      >
                        <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-current' : ''}`} />
                        <span>{isSaved ? 'Saved' : 'Save'}</span>
                      </button>

                      <button
                        onClick={() => toggleLikeBook(book.id)}
                        className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                          isLiked
                            ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/30'
                            : 'bg-gray-100 dark:bg-[#1D2025] text-[#6B6B6B] dark:text-[#B7B7B7] hover:bg-gray-200 dark:hover:bg-[#252830]'
                        }`}
                      >
                        <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-current' : ''}`} />
                        <span>{isLiked ? 'Liked' : 'Like'}</span>
                      </button>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setSelectedBookForModal(book)}
                        className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-[#6B6B6B] dark:text-[#B7B7B7] hover:text-[#17191D] dark:hover:text-[#F5F5F2]"
                      >
                        Preview
                      </button>

                      <button
                        onClick={() => openExternalSource(book.source_url)}
                        className="flex items-center space-x-1.5 px-5 py-2 rounded-xl bg-[#C1121F] dark:bg-[#F04452] hover:bg-[#8F0D16] dark:hover:bg-[#C1121F] text-white font-semibold text-xs shadow-sm transition-all"
                      >
                        <span>Read original</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </main>

      {/* Work Detail Modal */}
      <WorkDetailModal
        book={selectedBookForModal}
        isOpen={!!selectedBookForModal}
        onClose={() => setSelectedBookForModal(null)}
        isSaved={selectedBookForModal ? savedBookIds.includes(selectedBookForModal.id) : false}
        isLiked={selectedBookForModal ? likedBookIds.includes(selectedBookForModal.id) : false}
        onToggleSave={() => selectedBookForModal && handleSaveToggle(selectedBookForModal)}
        onToggleLike={() => selectedBookForModal && toggleLikeBook(selectedBookForModal.id)}
        onRead={openExternalSource}
        onCreateTask={(b) => {
          setTaskModalBook(b);
          setIsTaskModalOpen(true);
        }}
      />

      {/* Save → Task Toast Overlay */}
      <SaveToast
        book={toastBook}
        isOpen={isToastOpen}
        onClose={() => setIsToastOpen(false)}
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
