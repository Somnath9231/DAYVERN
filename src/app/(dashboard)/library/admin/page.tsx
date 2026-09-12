'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useDayvernStore } from '@/lib/store/dayvernStore';
import { useLibraryStore } from '@/lib/store/libraryStore';
import { LibraryCategory, SourceType, ReadingDifficulty, ContentType } from '@/types/database';
import { 
  ArrowLeft, 
  PlusCircle, 
  CheckCircle2, 
  AlertCircle, 
  ShieldAlert, 
  ShieldCheck,
  Eye,
  Bookmark,
  Heart,
  ExternalLink
} from 'lucide-react';

const CATEGORIES: LibraryCategory[] = [
  'Psychology',
  'Philosophy',
  'History',
  'Architecture',
  'Fiction',
  'Short Stories',
  'Stories',
  'Science',
  'Art & Culture',
  'Art',
  'Sociology',
  'Economics & Behaviour',
  'Economics',
  'Literature',
  'Technology',
];

export default function AdminResourcePage() {
  const router = useRouter();
  const { state: dayvernState } = useDayvernStore();
  const { createResource } = useLibraryStore();

  const isAdmin = dayvernState.profile?.is_admin === true;

  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [category, setCategory] = useState<LibraryCategory>('Psychology');
  const [contentType, setContentType] = useState<ContentType>('book');
  const [hookText, setHookText] = useState('');
  const [highlightText, setHighlightText] = useState('');
  const [description, setDescription] = useState('');
  const [whyItMatters, setWhyItMatters] = useState('');
  const [previewText, setPreviewText] = useState('');
  const [sourceName, setSourceName] = useState('Project Gutenberg');
  const [sourceUrl, setSourceUrl] = useState('');
  const [sourceType, setSourceType] = useState<SourceType>('public_domain');
  const [difficulty, setDifficulty] = useState<ReadingDifficulty>('Intermediate');
  const [tagsInput, setTagsInput] = useState('');
  const [underTheRadar, setUnderTheRadar] = useState(false);

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    // Validate inputs
    if (!title.trim() || !author.trim() || !hookText.trim() || !previewText.trim() || !sourceUrl.trim() || !sourceName.trim()) {
      setErrorMsg('Please fill in Title, Author, Curiosity Hook, Preview Text, Source Name, and Source URL.');
      return;
    }

    const trimmedUrl = sourceUrl.trim();
    if (!trimmedUrl.startsWith('https://') && !trimmedUrl.startsWith('http://')) {
      setErrorMsg('Source URL must start with https:// or http://. Unsafe protocols (javascript:, data:) are blocked.');
      return;
    }

    setSubmitting(true);

    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    const result = await createResource({
      title,
      author,
      category,
      content_type: contentType,
      hook_text: hookText,
      highlight_text: highlightText,
      description,
      why_it_matters: whyItMatters,
      preview_text: previewText,
      source_name: sourceName,
      source_url: trimmedUrl,
      source_type: sourceType,
      difficulty,
      tags,
      under_the_radar: underTheRadar,
      published: true,
    });

    setSubmitting(false);

    if (!result.success) {
      setErrorMsg(result.error || 'Failed to publish discovery resource.');
    } else {
      setSuccessMsg(`Successfully published curated resource "${title}"!`);
      setTitle('');
      setAuthor('');
      setHookText('');
      setHighlightText('');
      setDescription('');
      setWhyItMatters('');
      setPreviewText('');
      setSourceUrl('');
      setTagsInput('');
      setTimeout(() => {
        router.push('/library');
      }, 1500);
    }
  };

  if (!isAdmin && !dayvernState.loading) {
    return (
      <div className="max-w-xl mx-auto py-16 px-4 text-center space-y-4">
        <div className="inline-flex p-3 rounded-2xl bg-rose-50 dark:bg-[#35171B] text-rose-600 dark:text-[#F04452] mb-2">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="font-serif text-xl font-bold text-[#17191D] dark:text-[#F5F5F2]">
          Admin Access Required
        </h2>
        <p className="text-xs text-[#6B6B6B] dark:text-[#B7B7B7] max-w-md mx-auto leading-relaxed">
          Only authorized DAYVERN administrators can publish new curated discovery links and metadata.
        </p>
        <Link 
          href="/library" 
          className="inline-block mt-4 text-xs font-semibold text-[#C1121F] dark:text-[#F04452] hover:underline"
        >
          &larr; Return to Library Main Hall
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] dark:bg-[#0F1012] text-[#17191D] dark:text-[#F5F5F2] font-sans pb-24 transition-colors">
      <header className="border-b border-[#E8D6D9] dark:border-[#303238] bg-white dark:bg-[#17191D]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
          <Link 
            href="/library" 
            className="inline-flex items-center space-x-1.5 text-xs font-semibold text-[#6B6B6B] dark:text-[#B7B7B7] hover:text-[#C1121F] dark:hover:text-[#F04452] transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Library Feed</span>
          </Link>

          <div className="flex items-center space-x-3">
            <PlusCircle className="w-7 h-7 text-[#C1121F] dark:text-[#F04452]" />
            <div>
              <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#17191D] dark:text-[#F5F5F2]">
                Add Curated Discovery Resource
              </h1>
              <p className="text-xs text-[#6B6B6B] dark:text-[#B7B7B7] italic font-serif">
                DAYVERN does not host full copyrighted books. Add metadata, hook, highlight, short preview, and verified source URL.
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 pt-8 space-y-8">
        {/* Alerts */}
        {errorMsg && (
          <div className="p-4 rounded-xl bg-rose-50 dark:bg-[#35171B] border border-rose-200 dark:border-rose-900/30 flex items-center space-x-3 text-xs text-rose-600 dark:text-rose-400">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/30 flex items-center space-x-3 text-xs text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* LIVE PREVIEW SECTION */}
        <div className="space-y-2">
          <div className="flex items-center space-x-2 text-xs font-mono uppercase tracking-widest text-[#6B6B6B] dark:text-[#8B8D91] font-bold">
            <Eye className="w-4 h-4 text-[#C1121F] dark:text-[#F04452]" />
            <span>LIVE FEED PREVIEW</span>
          </div>

          <article className="bg-white dark:bg-[#17191D] border border-[#E8D6D9] dark:border-[#303238] rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-widest text-[#C1121F] dark:text-[#F04452] bg-[#FFF5F6] dark:bg-[#35171B] px-2 py-0.5 rounded">
                {category}
              </span>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-gray-100 dark:bg-[#1D2025] text-[#6B6B6B] dark:text-[#B7B7B7] border border-gray-200 dark:border-[#303238]">
                {difficulty}
              </span>
            </div>

            {hookText && (
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#17191D] dark:text-[#F5F5F2] leading-tight">
                "{hookText}"
              </h2>
            )}

            <div className="text-sm font-serif font-bold text-[#17191D] dark:text-[#F5F5F2]">
              {title || 'Work Title'} <span className="font-sans text-xs font-normal text-[#6B6B6B] dark:text-[#B7B7B7]">— By {author || 'Author'}</span>
            </div>

            {highlightText && (
              <div className="p-3 rounded-xl bg-[#FFF5F6] dark:bg-[#1D2025] border-l-4 border-l-[#C1121F] dark:border-l-[#F04452] border border-[#E8D6D9] dark:border-[#303238] text-xs font-serif italic text-[#171717] dark:text-[#F5F5F2]">
                "{highlightText}"
              </div>
            )}

            <p className="text-xs text-[#6B6B6B] dark:text-[#B7B7B7] line-clamp-3">
              {previewText || 'Editorial preview text will render here...'}
            </p>

            <div className="flex items-center space-x-2 text-xs text-[#6B6B6B] dark:text-[#8B8D91] pt-2 border-t border-[#E8D6D9]/50 dark:border-[#303238]">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>SOURCE: <strong className="text-[#17191D] dark:text-[#F5F5F2]">{sourceName || 'Source'}</strong></span>
            </div>
          </article>
        </div>

        {/* Resource Entry Form */}
        <form onSubmit={handleSubmit} className="bg-white dark:bg-[#17191D] border border-[#E8D6D9] dark:border-[#303238] rounded-2xl p-6 sm:p-8 space-y-6 shadow-sm">
          
          {/* Curiosity Hook */}
          <div>
            <label className="block text-xs font-bold text-[#17191D] dark:text-[#F5F5F2] uppercase tracking-wider mb-2">
              Curiosity Hook (1–3 Intriguing Lines in Newsreader Font) *
            </label>
            <input
              type="text"
              required
              value={hookText}
              onChange={(e) => setHookText(e.target.value)}
              placeholder="e.g. Your brain will actively alter reality to defend a belief it knows is wrong."
              className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-[#1D2025] border border-[#E8D6D9] dark:border-[#303238] text-sm text-[#17191D] dark:text-[#F5F5F2] focus:outline-none focus:border-[#C1121F] font-serif font-bold"
            />
          </div>

          {/* Title & Author */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-[#17191D] dark:text-[#F5F5F2] uppercase tracking-wider mb-2">
                Work Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Cognitive Dissonance Theory"
                className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-[#1D2025] border border-[#E8D6D9] dark:border-[#303238] text-sm text-[#17191D] dark:text-[#F5F5F2] focus:outline-none focus:border-[#C1121F]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#17191D] dark:text-[#F5F5F2] uppercase tracking-wider mb-2">
                Author / Researcher *
              </label>
              <input
                type="text"
                required
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder="e.g. Leon Festinger"
                className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-[#1D2025] border border-[#E8D6D9] dark:border-[#303238] text-sm text-[#17191D] dark:text-[#F5F5F2] focus:outline-none focus:border-[#C1121F]"
              />
            </div>
          </div>

          {/* Highlight Sentence */}
          <div>
            <label className="block text-xs font-bold text-[#17191D] dark:text-[#F5F5F2] uppercase tracking-wider mb-2">
              Key Idea Highlight (Highlighted Quote or Insight)
            </label>
            <input
              type="text"
              value={highlightText}
              onChange={(e) => setHighlightText(e.target.value)}
              placeholder="e.g. People may change their interpretation of reality before they change the belief."
              className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-[#1D2025] border border-[#E8D6D9] dark:border-[#303238] text-sm text-[#17191D] dark:text-[#F5F5F2] focus:outline-none focus:border-[#C1121F] italic font-serif"
            />
          </div>

          {/* Category, Content Type, Difficulty */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div>
              <label className="block text-xs font-bold text-[#17191D] dark:text-[#F5F5F2] uppercase tracking-wider mb-2">
                Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as LibraryCategory)}
                className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-[#1D2025] border border-[#E8D6D9] dark:border-[#303238] text-sm text-[#17191D] dark:text-[#F5F5F2] focus:outline-none focus:border-[#C1121F]"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#17191D] dark:text-[#F5F5F2] uppercase tracking-wider mb-2">
                Content Type
              </label>
              <select
                value={contentType}
                onChange={(e) => setContentType(e.target.value as ContentType)}
                className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-[#1D2025] border border-[#E8D6D9] dark:border-[#303238] text-sm text-[#17191D] dark:text-[#F5F5F2] focus:outline-none focus:border-[#C1121F]"
              >
                <option value="book">Book</option>
                <option value="paper">Paper / Research</option>
                <option value="essay">Essay</option>
                <option value="story">Story / Fiction</option>
                <option value="theory">Theory</option>
                <option value="lecture">Lecture</option>
                <option value="document">Document</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#17191D] dark:text-[#F5F5F2] uppercase tracking-wider mb-2">
                Reading Difficulty
              </label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as ReadingDifficulty)}
                className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-[#1D2025] border border-[#E8D6D9] dark:border-[#303238] text-sm text-[#17191D] dark:text-[#F5F5F2] focus:outline-none focus:border-[#C1121F]"
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>
          </div>

          {/* Short Description */}
          <div>
            <label className="block text-xs font-bold text-[#17191D] dark:text-[#F5F5F2] uppercase tracking-wider mb-2">
              Short Description / Overview *
            </label>
            <textarea
              required
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="High-level overview..."
              className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-[#1D2025] border border-[#E8D6D9] dark:border-[#303238] text-sm text-[#17191D] dark:text-[#F5F5F2] focus:outline-none focus:border-[#C1121F]"
            />
          </div>

          {/* Editorial Preview Excerpt */}
          <div>
            <label className="block text-xs font-bold text-[#17191D] dark:text-[#F5F5F2] uppercase tracking-wider mb-2">
              Editorial Preview Excerpt (2–4 Paragraphs Max) *
            </label>
            <textarea
              required
              rows={6}
              value={previewText}
              onChange={(e) => setPreviewText(e.target.value)}
              placeholder="Short legally appropriate excerpt..."
              className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-[#1D2025] border border-[#E8D6D9] dark:border-[#303238] text-sm text-[#17191D] dark:text-[#F5F5F2] focus:outline-none focus:border-[#C1121F] font-serif"
            />
          </div>

          {/* Verified Source Details */}
          <div className="p-4 rounded-xl bg-[#FFF5F6] dark:bg-[#1D2025] border border-[#E8D6D9] dark:border-[#303238] space-y-4">
            <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-[#C1121F] dark:text-[#F04452]">
              <ShieldCheck className="w-4 h-4" />
              <span>Legitimate Source Specification</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#6B6B6B] dark:text-[#B7B7B7] mb-1">
                  Source Name *
                </label>
                <input
                  type="text"
                  required
                  value={sourceName}
                  onChange={(e) => setSourceName(e.target.value)}
                  placeholder="e.g. Project Gutenberg / JSTOR Open"
                  className="w-full px-3 py-2 rounded-lg bg-white dark:bg-[#17191D] border border-[#E8D6D9] dark:border-[#303238] text-xs text-[#17191D] dark:text-[#F5F5F2]"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-[#6B6B6B] dark:text-[#B7B7B7] mb-1">
                  Legitimate Source HTTPS URL *
                </label>
                <input
                  type="url"
                  required
                  value={sourceUrl}
                  onChange={(e) => setSourceUrl(e.target.value)}
                  placeholder="https://www.gutenberg.org/ebooks/..."
                  className="w-full px-3 py-2 rounded-lg bg-white dark:bg-[#17191D] border border-[#E8D6D9] dark:border-[#303238] text-xs font-mono text-[#17191D] dark:text-[#F5F5F2]"
                />
              </div>
            </div>

            <div className="flex items-center space-x-4 pt-2">
              <label className="text-xs font-semibold text-[#6B6B6B] dark:text-[#B7B7B7]">
                Source Type:
              </label>
              <select
                value={sourceType}
                onChange={(e) => setSourceType(e.target.value as SourceType)}
                className="px-3 py-1.5 rounded-lg bg-white dark:bg-[#17191D] border border-[#E8D6D9] dark:border-[#303238] text-xs text-[#17191D] dark:text-[#F5F5F2]"
              >
                <option value="public_domain">Public Domain</option>
                <option value="open_access">Open Access</option>
                <option value="publisher">Publisher Page</option>
                <option value="university">University Repository</option>
                <option value="archive">Archive</option>
                <option value="other_verified">Other Verified</option>
              </select>
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-xs font-bold text-[#17191D] dark:text-[#F5F5F2] uppercase tracking-wider mb-2">
              Tags (Comma Separated)
            </label>
            <input
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="e.g. Cognition, Behavior, Decision Theory"
              className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-[#1D2025] border border-[#E8D6D9] dark:border-[#303238] text-sm text-[#17191D] dark:text-[#F5F5F2] focus:outline-none focus:border-[#C1121F]"
            />
          </div>

          {/* Checkboxes */}
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="underTheRadar"
              checked={underTheRadar}
              onChange={(e) => setUnderTheRadar(e.target.checked)}
              className="w-4 h-4 text-[#C1121F] dark:text-[#F04452] rounded"
            />
            <label htmlFor="underTheRadar" className="text-xs font-medium text-[#6B6B6B] dark:text-[#B7B7B7]">
              Mark as "Under the Radar" (Featured less-obvious work)
            </label>
          </div>

          {/* Submit Action */}
          <div className="pt-4 flex items-center justify-end space-x-3">
            <Link
              href="/library"
              className="px-4 py-2.5 rounded-xl border border-[#E8D6D9] dark:border-[#303238] text-xs font-semibold text-[#6B6B6B] dark:text-[#B7B7B7] hover:bg-gray-100 dark:hover:bg-[#1D2025]"
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 rounded-xl bg-[#C1121F] dark:bg-[#F04452] hover:bg-[#8F0D16] dark:hover:bg-[#C1121F] text-white text-xs font-semibold shadow-sm transition-all disabled:opacity-50"
            >
              {submitting ? 'Publishing...' : 'Publish Curated Work'}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
