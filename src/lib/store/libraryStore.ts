'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  Book, 
  UserBookmark, 
  LibraryCategory,
  SourceType,
  ReadingDifficulty,
  ContentType
} from '@/types/database';
import { createClient } from '@/lib/supabase/client';

export interface LibraryState {
  books: Book[];
  savedBookIds: string[];
  likedBookIds: string[];
  loading: boolean;
  error: string | null;
}

export interface ResourceInput {
  title: string;
  author: string;
  category: LibraryCategory | string;
  description: string;
  why_it_matters?: string;
  hook_text: string;
  highlight_text?: string;
  preview_text: string;
  source_url: string;
  source_name: string;
  source_type: SourceType | string;
  difficulty: ReadingDifficulty | string;
  content_type: ContentType | string;
  tags: string[];
  cover_bg_color?: string;
  under_the_radar?: boolean;
  published?: boolean;
}

export function useLibraryStore() {
  const [state, setState] = useState<LibraryState>({
    books: [],
    savedBookIds: [],
    likedBookIds: [],
    loading: true,
    error: null,
  });

  // Fetch all Library discovery data from Supabase PostgreSQL database
  const fetchLibraryData = useCallback(async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    try {
      // 1. Fetch published library discovery resources
      const { data: booksData, error: booksErr } = await supabase
        .from('library_books')
        .select('*')
        .order('created_at', { ascending: false });

      if (booksErr) throw booksErr;

      // 2. Fetch user saved & liked resources
      let savedIds: string[] = [];
      let likedIds: string[] = [];

      if (user) {
        // Saved resources via user_bookmarks table
        const { data: bmData } = await supabase
          .from('user_bookmarks')
          .select('book_id')
          .eq('user_id', user.id);

        if (bmData) {
          savedIds = bmData.map(b => b.book_id);
        }

        // Liked resources via user_resource_likes table
        const { data: likeData } = await supabase
          .from('user_resource_likes')
          .select('book_id')
          .eq('user_id', user.id);

        if (likeData) {
          likedIds = likeData.map(l => l.book_id);
        }
      }

      setState({
        books: booksData || [],
        savedBookIds: savedIds,
        likedBookIds: likedIds,
        loading: false,
        error: null,
      });
    } catch (err: any) {
      console.error('Error fetching Supabase discovery resources:', err);
      setState((prev) => ({
        ...prev,
        loading: false,
        error: err?.message || 'Failed to load library resources.',
      }));
    }
  }, []);

  // Fetch on mount and subscribe to auth state
  useEffect(() => {
    fetchLibraryData();

    const supabase = createClient();
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      fetchLibraryData();
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchLibraryData]);

  // Toggle Save resource
  const toggleSaveBook = async (bookId: string): Promise<boolean> => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const isSaved = state.savedBookIds.includes(bookId);
    const newState = !isSaved;

    // Optimistic UI update
    setState((prev) => ({
      ...prev,
      savedBookIds: newState
        ? [...prev.savedBookIds, bookId]
        : prev.savedBookIds.filter((id) => id !== bookId),
    }));

    if (isSaved) {
      await supabase
        .from('user_bookmarks')
        .delete()
        .eq('user_id', user.id)
        .eq('book_id', bookId);
    } else {
      await supabase.from('user_bookmarks').insert({
        user_id: user.id,
        book_id: bookId,
      });
    }

    await fetchLibraryData();
    return newState; // returns true if now saved
  };

  // Toggle Like resource
  const toggleLikeBook = async (bookId: string) => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const isLiked = state.likedBookIds.includes(bookId);

    // Optimistic UI update
    setState((prev) => ({
      ...prev,
      likedBookIds: isLiked
        ? prev.likedBookIds.filter((id) => id !== bookId)
        : [...prev.likedBookIds, bookId],
    }));

    if (isLiked) {
      await supabase
        .from('user_resource_likes')
        .delete()
        .eq('user_id', user.id)
        .eq('book_id', bookId);
    } else {
      await supabase.from('user_resource_likes').insert({
        user_id: user.id,
        book_id: bookId,
      });
    }

    await fetchLibraryData();
  };

  // Safely open external legitimate source in a new tab
  const openExternalSource = (url: string) => {
    if (!url || typeof url !== 'string') return;
    const trimmed = url.trim();
    if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
      alert('Invalid or missing source URL.');
      return;
    }
    window.open(trimmed, '_blank', 'noopener,noreferrer');
  };

  // Server-Authoritative Reading Milestone Completion (+5 INT reward)
  const completeReadingMilestone = async (bookId: string, taskId?: string) => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: 'Authentication required.' };

    try {
      const { data, error } = await supabase.rpc('complete_reading_milestone', {
        p_book_id: bookId,
        p_task_id: taskId || null,
      });

      if (error) throw error;
      await fetchLibraryData();
      return { success: true, data };
    } catch (err: any) {
      console.error('Error completing reading milestone:', err);
      return { success: false, error: err?.message || 'Failed to claim reading reward.' };
    }
  };

  // Admin function: Create new curated discovery resource
  const createResource = async (input: ResourceInput): Promise<{ success: boolean; error?: string }> => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: 'Authentication required.' };

    // Validate HTTPS protocol
    const url = input.source_url.trim();
    if (!url.startsWith('https://') && !url.startsWith('http://')) {
      return { success: false, error: 'Source URL must be a valid HTTP/HTTPS URL.' };
    }

    try {
      const { error } = await supabase.from('library_books').insert({
        title: input.title.trim(),
        author: input.author.trim(),
        category: input.category,
        description: input.description.trim(),
        why_it_matters: input.why_it_matters?.trim() || null,
        hook_text: input.hook_text.trim(),
        highlight_text: input.highlight_text?.trim() || null,
        preview_text: input.preview_text.trim(),
        source_url: url,
        source_name: input.source_name.trim(),
        source_type: input.source_type,
        difficulty: input.difficulty,
        content_type: input.content_type,
        tags: input.tags,
        cover_bg_color: input.cover_bg_color || '#17191D',
        under_the_radar: input.under_the_radar ?? false,
        published: input.published ?? true,
      });

      if (error) throw error;
      await fetchLibraryData();
      return { success: true };
    } catch (err: any) {
      console.error('Error creating library resource:', err);
      return { success: false, error: err?.message || 'Failed to create resource.' };
    }
  };

  return {
    state,
    books: state.books,
    savedBookIds: state.savedBookIds,
    likedBookIds: state.likedBookIds,
    loading: state.loading,
    error: state.error,
    toggleSaveBook,
    toggleLikeBook,
    openExternalSource,
    completeReadingMilestone,
    createResource,
    refreshLibrary: fetchLibraryData,
  };
}
