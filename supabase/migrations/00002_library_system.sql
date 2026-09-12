-- DAYVERN Library System Migration Schema

-- 1. LIBRARY BOOKS TABLE
CREATE TABLE IF NOT EXISTS public.library_books (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    author TEXT NOT NULL,
    genre TEXT NOT NULL,
    description TEXT NOT NULL,
    cover_bg_color TEXT NOT NULL DEFAULT 'bg-slate-900',
    est_reading_time_mins INTEGER NOT NULL DEFAULT 30,
    featured_paragraph TEXT,
    published BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. LIBRARY CHAPTERS TABLE
CREATE TABLE IF NOT EXISTS public.library_chapters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    book_id UUID NOT NULL REFERENCES public.library_books(id) ON DELETE CASCADE,
    chapter_number INTEGER NOT NULL,
    title TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_book_chapter UNIQUE (book_id, chapter_number)
);

-- 3. LIBRARY PARAGRAPHS TABLE (STABLE PARAGRAPH IDs)
CREATE TABLE IF NOT EXISTS public.library_paragraphs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chapter_id UUID NOT NULL REFERENCES public.library_chapters(id) ON DELETE CASCADE,
    book_id UUID NOT NULL REFERENCES public.library_books(id) ON DELETE CASCADE,
    paragraph_number INTEGER NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_chapter_paragraph UNIQUE (chapter_id, paragraph_number)
);

-- 4. USER BOOK PROGRESS TABLE
CREATE TABLE IF NOT EXISTS public.user_book_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    book_id UUID NOT NULL REFERENCES public.library_books(id) ON DELETE CASCADE,
    last_chapter_id UUID REFERENCES public.library_chapters(id) ON DELETE SET NULL,
    last_paragraph_id UUID REFERENCES public.library_paragraphs(id) ON DELETE SET NULL,
    progress_percent REAL NOT NULL DEFAULT 0.0,
    status TEXT NOT NULL DEFAULT 'started' CHECK (status IN ('started', 'completed')),
    last_read_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_user_book_progress UNIQUE (user_id, book_id)
);

-- 5. USER BOOKMARKS TABLE (FOR BOOKS & INDIVIDUAL PARAGRAPHS)
CREATE TABLE IF NOT EXISTS public.user_bookmarks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    book_id UUID NOT NULL REFERENCES public.library_books(id) ON DELETE CASCADE,
    paragraph_id UUID REFERENCES public.library_paragraphs(id) ON DELETE CASCADE,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. USER PARAGRAPH LIKES TABLE (PRIVATE LIKED PASSAGES)
CREATE TABLE IF NOT EXISTS public.user_paragraph_likes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    paragraph_id UUID NOT NULL REFERENCES public.library_paragraphs(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_user_paragraph_like UNIQUE (user_id, paragraph_id)
);

-- 7. READING SESSIONS TABLE
CREATE TABLE IF NOT EXISTS public.reading_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    book_id UUID NOT NULL REFERENCES public.library_books(id) ON DELETE CASCADE,
    duration_seconds INTEGER NOT NULL DEFAULT 0,
    paragraphs_read INTEGER NOT NULL DEFAULT 0,
    xp_earned INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- INDEXES FOR FAST QUERYING
CREATE INDEX IF NOT EXISTS idx_chapters_book ON public.library_chapters(book_id, chapter_number);
CREATE INDEX IF NOT EXISTS idx_paragraphs_chapter ON public.library_paragraphs(chapter_id, paragraph_number);
CREATE INDEX IF NOT EXISTS idx_progress_user ON public.user_book_progress(user_id, last_read_at DESC);
CREATE INDEX IF NOT EXISTS idx_likes_user ON public.user_paragraph_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_bookmarks_user ON public.user_bookmarks(user_id);

-- ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.library_books ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.library_chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.library_paragraphs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_book_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_paragraph_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reading_sessions ENABLE ROW LEVEL SECURITY;

-- 1. Library Books RLS (Public read published / Admin full access)
CREATE POLICY "Public read published books" ON public.library_books FOR SELECT USING (published = true OR public.is_admin());
CREATE POLICY "Admins insert books" ON public.library_books FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY "Admins update books" ON public.library_books FOR UPDATE USING (public.is_admin());
CREATE POLICY "Admins delete books" ON public.library_books FOR DELETE USING (public.is_admin());

-- 2. Library Chapters RLS (Public read / Admin write)
CREATE POLICY "Public read chapters" ON public.library_chapters FOR SELECT USING (true);
CREATE POLICY "Admins insert chapters" ON public.library_chapters FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY "Admins update chapters" ON public.library_chapters FOR UPDATE USING (public.is_admin());
CREATE POLICY "Admins delete chapters" ON public.library_chapters FOR DELETE USING (public.is_admin());

-- 3. Library Paragraphs RLS (Public read / Admin write)
CREATE POLICY "Public read paragraphs" ON public.library_paragraphs FOR SELECT USING (true);
CREATE POLICY "Admins insert paragraphs" ON public.library_paragraphs FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY "Admins update paragraphs" ON public.library_paragraphs FOR UPDATE USING (public.is_admin());
CREATE POLICY "Admins delete paragraphs" ON public.library_paragraphs FOR DELETE USING (public.is_admin());

-- 4. User Specific Data RLS Policies
CREATE POLICY "User progress select" ON public.user_book_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "User progress insert" ON public.user_book_progress FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "User progress update" ON public.user_book_progress FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "User progress delete" ON public.user_book_progress FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "User bookmarks select" ON public.user_bookmarks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "User bookmarks insert" ON public.user_bookmarks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "User bookmarks update" ON public.user_bookmarks FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "User bookmarks delete" ON public.user_bookmarks FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "User paragraph likes select" ON public.user_paragraph_likes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "User paragraph likes insert" ON public.user_paragraph_likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "User paragraph likes delete" ON public.user_paragraph_likes FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "User reading sessions select" ON public.reading_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "User reading sessions insert" ON public.reading_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);

-- GRANT PERMISSIONS FOR TABLES
GRANT SELECT ON public.library_books TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.library_books TO authenticated;

GRANT SELECT ON public.library_chapters TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.library_chapters TO authenticated;

GRANT SELECT ON public.library_paragraphs TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.library_paragraphs TO authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_book_progress TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_bookmarks TO authenticated;
GRANT SELECT, INSERT, DELETE ON public.user_paragraph_likes TO authenticated;
GRANT SELECT, INSERT ON public.reading_sessions TO authenticated;
