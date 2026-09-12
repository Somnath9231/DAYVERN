-- DAYVERN Migration 00006: Library System Hardening & Seed Data
-- Adds bookmark uniqueness constraints, seeds curated books/chapters/paragraphs, and hardens admin permissions

-- 1. UNIQUE BOOKMARK CONSTRAINT (PREVENT DUPLICATE BOOKMARKS)
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_user_bookmark 
ON public.user_bookmarks (user_id, book_id, COALESCE(paragraph_id, '00000000-0000-0000-0000-000000000000'::uuid));

-- 2. HARDEN RLS POLICIES FOR LIBRARY BOOKS, CHAPTERS, PARAGRAPHS
ALTER TABLE public.library_books ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.library_chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.library_paragraphs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins insert books" ON public.library_books;
DROP POLICY IF EXISTS "Admins update books" ON public.library_books;
DROP POLICY IF EXISTS "Admins delete books" ON public.library_books;

CREATE POLICY "Admins insert books" ON public.library_books FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY "Admins update books" ON public.library_books FOR UPDATE USING (public.is_admin());
CREATE POLICY "Admins delete books" ON public.library_books FOR DELETE USING (public.is_admin());

DROP POLICY IF EXISTS "Admins insert chapters" ON public.library_chapters;
DROP POLICY IF EXISTS "Admins update chapters" ON public.library_chapters;
DROP POLICY IF EXISTS "Admins delete chapters" ON public.library_chapters;

CREATE POLICY "Admins insert chapters" ON public.library_chapters FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY "Admins update chapters" ON public.library_chapters FOR UPDATE USING (public.is_admin());
CREATE POLICY "Admins delete chapters" ON public.library_chapters FOR DELETE USING (public.is_admin());

DROP POLICY IF EXISTS "Admins insert paragraphs" ON public.library_paragraphs;
DROP POLICY IF EXISTS "Admins update paragraphs" ON public.library_paragraphs;
DROP POLICY IF EXISTS "Admins delete paragraphs" ON public.library_paragraphs;

CREATE POLICY "Admins insert paragraphs" ON public.library_paragraphs FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY "Admins update paragraphs" ON public.library_paragraphs FOR UPDATE USING (public.is_admin());
CREATE POLICY "Admins delete paragraphs" ON public.library_paragraphs FOR DELETE USING (public.is_admin());

-- 3. SEED CURATED CLASSICS INTO DATABASE (DETERMINISTIC VALID HEX UUIDs)
INSERT INTO public.library_books (id, title, author, genre, description, cover_bg_color, est_reading_time_mins, featured_paragraph, published)
VALUES 
    ('b0000000-0000-0000-0000-000000000001', 'Meditations & The Inner Citadel', 'Marcus Aurelius', 'Philosophy', 'Private stoic reflections on self-discipline, mortality, duty, and emotional resilience written by the Roman Emperor.', 'bg-slate-900 border-amber-500/40', 45, 'Begin the morning by saying to yourself: I shall meet with the busybody, the ungrateful, arrogant, deceitful, envious, unsocial. All these things happen to them by reason of their ignorance of what is good and evil.', true),
    ('b0000000-0000-0000-0000-000000000002', 'Focus Engine & Deep Work Architecture', 'Cal Newport', 'Personal Development', 'Rules for focused success in a distracted world. Master cognitive depth to produce elite output in software and science.', 'bg-slate-900 border-sky-500/40', 35, 'Deep work is the ability to focus without distraction on a cognitively demanding task. It is a skill that allows you to quickly master complicated information and produce better results in less time.', true),
    ('b0000000-0000-0000-0000-000000000003', 'Beyond Good and Evil', 'Friedrich Nietzsche', 'Philosophy', 'A critique of past philosophers, moral dogmas, and an exploration of the Will to Power and individual sovereignty.', 'bg-slate-900 border-indigo-500/40', 60, 'He who fights with monsters should look to it that he himself does not become a monster. And if you gaze long into an abyss, the abyss also gazes into you.', true),
    ('b0000000-0000-0000-0000-000000000004', 'The Metamorphosis', 'Franz Kafka', 'Classics', 'The iconic story of Gregor Samsa, who wakes up one morning transformed into a monstrous insectile creature.', 'bg-slate-900 border-red-500/40', 25, 'One morning, when Gregor Samsa woke from troubled dreams, he found himself transformed in his bed into a horrible vermin.', true),
    ('b0000000-0000-0000-0000-000000000005', 'Man''s Search for Meaning', 'Viktor E. Frankl', 'Psychology', 'Psychiatrist Viktor Frankl''s memoir of survival in concentration camps and his development of Logotherapy.', 'bg-slate-900 border-emerald-500/40', 40, 'Everything can be taken from a man but one thing: the last of the human freedoms—to choose one''s attitude in any given set of circumstances, to choose one''s own way.', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.library_chapters (id, book_id, chapter_number, title)
VALUES
    ('c0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 1, 'Book I: Debts and Lessons of Gratitude'),
    ('c0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000001', 2, 'Book II: On the River Gran'),
    ('c0000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000002', 1, 'Chapter 1: The Deep Work Hypothesis'),
    ('c0000000-0000-0000-0000-000000000004', 'b0000000-0000-0000-0000-000000000002', 2, 'Chapter 2: Deep Work is Rare & Valuable'),
    ('c0000000-0000-0000-0000-000000000005', 'b0000000-0000-0000-0000-000000000004', 1, 'Part I: The Awakening')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.library_paragraphs (id, chapter_id, book_id, paragraph_number, content)
VALUES
    ('f0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 1, 'From my grandfather Verus I learned good morals and the government of my temper.'),
    ('f0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 2, 'From the reputation and remembrance of my father, modesty and a manly character.'),
    ('f0000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 3, 'From my mother, piety and beneficence, and abstaining, not only from evil deeds, but even from evil thoughts; and further, simplicity in my way of living, far removed from the habits of the rich.'),
    ('f0000000-0000-0000-0000-000000000004', 'c0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000001', 1, 'Begin the morning by saying to yourself: I shall meet with the busybody, the ungrateful, arrogant, deceitful, envious, unsocial. All these things happen to them by reason of their ignorance of what is good and evil.'),
    ('f0000000-0000-0000-0000-000000000005', 'c0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000001', 2, 'But I have seen the beauty of good, and the ugliness of evil, and I have recognized that the wrongdoer has a nature related to my own, not of the same blood or seed, but participating in the same intelligence and portion of the divine.'),
    ('f0000000-0000-0000-0000-000000000006', 'c0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000001', 3, 'Whatever this is that I am, it is a little flesh and breath, and the ruling part. Devise no longer to be distracted by sensory illusions; regard the body with stoic clarity.'),
    ('f0000000-0000-0000-0000-000000000007', 'c0000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000002', 1, 'Deep work is the ability to focus without distraction on a cognitively demanding task. It is a skill that allows you to quickly master complicated information and produce better results in less time.'),
    ('f0000000-0000-0000-0000-000000000008', 'c0000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000002', 2, 'Deep work will make you better at what you do and provide the sense of true fulfillment that comes from craftsmanship. In short, deep work is like a super power in our increasingly competitive twenty-first century economy.'),
    ('f0000000-0000-0000-0000-000000000009', 'c0000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000002', 3, 'By contrast, shallow work is non-cognitively demanding, logistical-style tasks, often performed while distracted. These efforts tend not to create much new value in the world and are easy to replicate.'),
    ('f0000000-0000-0000-0000-000000000010', 'c0000000-0000-0000-0000-000000000005', 'b0000000-0000-0000-0000-000000000004', 1, 'One morning, when Gregor Samsa woke from troubled dreams, he found himself transformed in his bed into a horrible vermin.'),
    ('f0000000-0000-0000-0000-000000000011', 'c0000000-0000-0000-0000-000000000005', 'b0000000-0000-0000-0000-000000000004', 2, 'He lay on his armour-like back, and if he lifted his head a little he could see his brown belly, slightly domed and divided by arches into stiff sections.')
ON CONFLICT (id) DO NOTHING;
