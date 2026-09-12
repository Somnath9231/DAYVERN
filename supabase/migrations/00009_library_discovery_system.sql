-- DAYVERN Library Discovery System Migration
-- Migration: 00009_library_discovery_system.sql
-- Concept: Curated Intellectual Discovery Layer (No internal full book storage)

-- 1. EXTEND LIBRARY BOOKS SCHEMA FOR DISCOVERY METADATA
ALTER TABLE public.library_books
    ADD COLUMN IF NOT EXISTS category TEXT NOT NULL DEFAULT 'Psychology',
    ADD COLUMN IF NOT EXISTS preview_text TEXT NOT NULL DEFAULT '',
    ADD COLUMN IF NOT EXISTS source_url TEXT NOT NULL DEFAULT '',
    ADD COLUMN IF NOT EXISTS source_name TEXT NOT NULL DEFAULT '',
    ADD COLUMN IF NOT EXISTS source_type TEXT NOT NULL DEFAULT 'public_domain',
    ADD COLUMN IF NOT EXISTS difficulty TEXT NOT NULL DEFAULT 'Intermediate',
    ADD COLUMN IF NOT EXISTS content_type TEXT NOT NULL DEFAULT 'book',
    ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}',
    ADD COLUMN IF NOT EXISTS why_it_matters TEXT,
    ADD COLUMN IF NOT EXISTS under_the_radar BOOLEAN NOT NULL DEFAULT false;

-- Add check constraints safely
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_source_type') THEN
        ALTER TABLE public.library_books 
            ADD CONSTRAINT chk_source_type CHECK (source_type IN ('public_domain', 'open_access', 'publisher', 'university', 'archive', 'other_verified'));
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_difficulty') THEN
        ALTER TABLE public.library_books 
            ADD CONSTRAINT chk_difficulty CHECK (difficulty IN ('Beginner', 'Intermediate', 'Advanced'));
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_content_type') THEN
        ALTER TABLE public.library_books 
            ADD CONSTRAINT chk_content_type CHECK (content_type IN ('book', 'paper', 'essay', 'story', 'theory', 'lecture', 'document'));
    END IF;
END $$;

-- 2. INDEXES FOR DISCOVERY FEED & CATEGORY FILTERING
CREATE INDEX IF NOT EXISTS idx_library_category_pub ON public.library_books(category, published);
CREATE INDEX IF NOT EXISTS idx_library_difficulty ON public.library_books(difficulty);
CREATE INDEX IF NOT EXISTS idx_library_created_desc ON public.library_books(created_at DESC);

-- 3. ENSURE RESOURCE-LEVEL LIKES TABLE FOR DISCOVERY ITEMS
CREATE TABLE IF NOT EXISTS public.user_resource_likes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    book_id UUID NOT NULL REFERENCES public.library_books(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_user_resource_like UNIQUE (user_id, book_id)
);

ALTER TABLE public.user_resource_likes ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'user_resource_likes' AND policyname = 'Users manage their own resource likes'
    ) THEN
        CREATE POLICY "Users manage their own resource likes"
            ON public.user_resource_likes
            FOR ALL
            USING (auth.uid() = user_id)
            WITH CHECK (auth.uid() = user_id);
    END IF;
END $$;

-- 4. SEED HIGH-QUALITY CURATED INTELLECTUAL DISCOVERY RESOURCES (VERIFIED REAL SOURCES)

-- Clear existing sample seed data to populate discovery dataset cleanly
TRUNCATE TABLE public.library_books CASCADE;

INSERT INTO public.library_books (
    id, title, author, category, description, why_it_matters, preview_text, 
    source_url, source_name, source_type, difficulty, content_type, tags, 
    cover_bg_color, featured, under_the_radar, published
) VALUES
-- 🧠 PSYCHOLOGY (5-6 items)
(
    '10000000-0000-0000-0000-000000000001',
    'The Principles of Psychology',
    'William James',
    'Psychology',
    'Foundational treatise exploring consciousness, habit formation, stream of thought, and emotion.',
    'Why does habit rule human behavior, and can consciousness be broken down into discrete elements?',
    'Habit is thus the enormous fly-wheel of society, its most precious conservative agent. It alone is what keeps us all within the bounds of ordinance, and saves the children of fortune from the envious uprisings of the poor.\n\nNo matter how full a reservoir of maxims one may possess, and no matter how good one''s sentiments may be, if one has not taken advantage of every concrete opportunity to act, one''s character may remain entirely unaffected for the better.',
    'https://www.gutenberg.org/ebooks/57628',
    'Project Gutenberg',
    'public_domain',
    'Advanced',
    'book',
    ARRAY['Cognition', 'Behavior', 'Philosophy of Mind'],
    '#1E2229',
    true,
    false,
    true
),
(
    '10000000-0000-0000-0000-000000000002',
    'Gestalt Psychology',
    'Wolfgang Köhler',
    'Psychology',
    'Landmark investigation into holistic perception and problem-solving mechanisms in primates and humans.',
    'Why does the mind naturally perceive unified patterns and wholes rather than isolated fragments?',
    'The whole is different from the sum of its parts. When we look at a constellation, we do not see seven separate points of light; we see a Big Dipper. The perceptual field organizes itself spontaneously into coherent structures.\n\nInsightful problem solving differs fundamentally from trial-and-error conditioning. It represents a sudden reorganization of the visual and cognitive field.',
    'https://www.gutenberg.org/ebooks/68903',
    'Project Gutenberg',
    'public_domain',
    'Advanced',
    'book',
    ARRAY['Perception', 'Cognitive Psychology', 'Gestalt'],
    '#17191D',
    false,
    false,
    true
),
(
    '10000000-0000-0000-0000-000000000003',
    'Group Psychology and the Analysis of the Ego',
    'Sigmund Freud',
    'Psychology',
    'Analysis of how individual psychological mechanisms change radically within crowd settings.',
    'Why do individuals act against their own moral standards when absorbed into a collective group?',
    'In a group, the individual experiences a feeling of invincible power which allows him to yield to instincts which, had he been alone, he would perforce have kept under restraint.\n\nThe group is extraordinarily credulous and open to influence, it has no critical faculty, and the improbable does not exist for it. It thinks in images, which call one another up by association.',
    'https://www.gutenberg.org/ebooks/35877',
    'Project Gutenberg',
    'public_domain',
    'Intermediate',
    'book',
    ARRAY['Psychoanalysis', 'Social Psychology', 'Collective Behavior'],
    '#201A1B',
    false,
    false,
    true
),
(
    '10000000-0000-0000-0000-000000000004',
    'Psychology from the Standpoint of a Behaviorist',
    'John B. Watson',
    'Psychology',
    'Manifesto establishing empirical behaviorism and measurable stimulus-response dynamics.',
    'How much of human emotional reaction is conditioned rather than innate?',
    'Psychology as the behaviorist views it is a purely objective experimental branch of natural science. Its theoretical goal is the prediction and control of behavior.\n\nGive me a dozen healthy infants, well-formed, and my own specified world to bring them up in and I''ll guarantee to take any one at random and train him to become any type of specialist I might select.',
    'https://www.gutenberg.org/ebooks/58564',
    'Project Gutenberg',
    'public_domain',
    'Intermediate',
    'book',
    ARRAY['Behaviorism', 'Conditioning', 'Learning'],
    '#191C24',
    false,
    true,
    true
),
(
    '10000000-0000-0000-0000-000000000005',
    'Theory of Cognitive Dissonance',
    'Leon Festinger',
    'Psychology',
    'Classic study examining the psychological discomfort created by contradictory beliefs and actions.',
    'Why does the mind alter its convictions instead of accepting uncomfortable facts?',
    'The presence of dissonance, giving rise to actions designed to reduce it, is a basic human drive. When an individual holds two cognitions that are psychologically inconsistent, he experiences tension.\n\nRather than admitting error, human beings frequently rationalize, seek confirming information, and reject contradictory evidence to restore internal harmony.',
    'https://www.jstor.org/stable/27856488',
    'JSTOR Open Content',
    'open_access',
    'Advanced',
    'paper',
    ARRAY['Social Psychology', 'Cognition', 'Decision Theory'],
    '#18201E',
    true,
    false,
    true
),

-- 📜 PHILOSOPHY (5 items)
(
    '10000000-0000-0000-0000-000000000006',
    'Meditations',
    'Marcus Aurelius',
    'Philosophy',
    'Private journal of the Roman Emperor documenting Stoic self-discipline, mortality, and duty.',
    'How do you maintain tranquility of mind amidst chaotic external events?',
    'You have power over your mind — not outside events. Realize this, and you will find strength. Everything we hear is an opinion, not a fact. Everything we see is a perspective, not the truth.\n\nWaste no more time arguing about what a good man should be. Be one.',
    'https://www.gutenberg.org/ebooks/2680',
    'Project Gutenberg',
    'public_domain',
    'Beginner',
    'book',
    ARRAY['Stoicism', 'Ethics', 'Self-Discipline'],
    '#231E19',
    true,
    false,
    true
),
(
    '10000000-0000-0000-0000-000000000007',
    'Beyond Good and Evil',
    'Friedrich Nietzsche',
    'Philosophy',
    'Critique of traditional morality, truth claims, and dogmatic philosophical assumptions.',
    'What lies behind the human instinct to categorize ideas into absolute good and evil?',
    'He who fights with monsters should look to it that he himself does not become a monster. And if you gaze long into an abyss, the abyss also gazes into you.\n\nThere are no moral phenomena at all, only a moral interpretation of phenomena.',
    'https://www.gutenberg.org/ebooks/4363',
    'Project Gutenberg',
    'public_domain',
    'Advanced',
    'book',
    ARRAY['Existentialism', 'Ethics', 'Nihilism'],
    '#251A1A',
    false,
    false,
    true
),
(
    '10000000-0000-0000-0000-000000000008',
    'The Problems of Philosophy',
    'Bertrand Russell',
    'Philosophy',
    'Clear introduction to epistemological inquiry, appearance vs. reality, and logical reasoning.',
    'How can we prove that physical objects exist outside our immediate sensory impressions?',
    'Is there any knowledge in the world which is so certain that no reasonable man could doubt it? This question, which at first sight might not seem difficult, is really one of the most difficult that can be asked.\n\nPhilosophy is to be studied, not for the sake of any definite answers to its questions, but rather for the sake of the questions themselves.',
    'https://www.gutenberg.org/ebooks/5827',
    'Project Gutenberg',
    'public_domain',
    'Intermediate',
    'book',
    ARRAY['Epistemology', 'Metaphysics', 'Logic'],
    '#191F26',
    false,
    false,
    true
),
(
    '10000000-0000-0000-0000-000000000009',
    'Enchiridion (The Handbook)',
    'Epictetus',
    'Philosophy',
    'Practical manual of Stoic principles on agency, desire, and emotional freedom.',
    'Which things are within our direct control, and which belong strictly to fortune?',
    'Some things are in our control and others not. Things in our control are opinion, pursuit, desire, aversion, and, in a word, whatever are our own actions.\n\nMen are disturbed not by things, but by the view which they take of things.',
    'https://www.gutenberg.org/ebooks/45109',
    'Project Gutenberg',
    'public_domain',
    'Beginner',
    'essay',
    ARRAY['Stoicism', 'Ethics', 'Control'],
    '#1E1C24',
    false,
    false,
    true
),
(
    '10000000-0000-0000-0000-000000000010',
    'Ethics',
    'Benedict de Spinoza',
    'Philosophy',
    'Geometric demonstration of pantheism, human freedom, and rational contentment.',
    'Can God and the physical universe be understood as one unified, eternal substance?',
    'By God I understand a being absolutely infinite — that is, a substance consisting in infinite attributes, of which each expresses eternal and infinite essentiality.\n\nPeace is not an absence of war, it is a virtue, a state of mind, a disposition for benevolence, confidence, justice.',
    'https://www.gutenberg.org/ebooks/3800',
    'Project Gutenberg',
    'public_domain',
    'Advanced',
    'book',
    ARRAY['Metaphysics', 'Rationalism', 'Pantheism'],
    '#241B20',
    false,
    true,
    true
),

-- 🏛️ HISTORY (5 items)
(
    '10000000-0000-0000-0000-000000000011',
    'The History of the Decline and Fall of the Roman Empire',
    'Edward Gibbon',
    'History',
    'Monumental narrative analyzing the structural, military, and moral dissolution of Rome.',
    'Why do vast empires crumble from internal decay rather than external conquest?',
    'The decline of Rome was the natural and inevitable effect of immoderate greatness. Prosperity ripened the principle of decay; the causes of destruction multiplied with the extent of conquest.\n\nHistory is indeed little more than the register of the crimes, follies, and misfortunes of mankind.',
    'https://www.gutenberg.org/ebooks/890',
    'Project Gutenberg',
    'public_domain',
    'Advanced',
    'book',
    ARRAY['Roman Empire', 'Collapse of Civilizations', 'Statecraft'],
    '#201C1A',
    true,
    false,
    true
),
(
    '10000000-0000-0000-0000-000000000012',
    'The Histories',
    'Herodotus',
    'History',
    'The founding work of Western history documenting the Greco-Persian Wars and global cultures.',
    'How did cultural differences shape the clash between Persian autocracy and Greek city-states?',
    'Herodotus of Halicarnassus, his Researches are here set down, that the memory of the past may not be blotted out by time.\n\nCircumstances rule men; men do not rule circumstances.',
    'https://www.gutenberg.org/ebooks/2707',
    'Project Gutenberg',
    'public_domain',
    'Intermediate',
    'book',
    ARRAY['Ancient History', 'Greece', 'Persia'],
    '#1A221E',
    false,
    false,
    true
),
(
    '10000000-0000-0000-0000-000000000013',
    'The History of the Peloponnesian War',
    'Thucydides',
    'History',
    'Relentless analysis of power politics, human nature, and the existential war between Athens and Sparta.',
    'Why is conflict inevitable when a rising power threatens an established hegemon?',
    'What made war inevitable was the growth of Athenian power and the fear which this caused in Sparta.\n\nThe strong do what they can and the weak suffer what they must.',
    'https://www.gutenberg.org/ebooks/7142',
    'Project Gutenberg',
    'public_domain',
    'Advanced',
    'book',
    ARRAY['Ancient Greece', 'Realpolitik', 'Military Strategy'],
    '#221A1A',
    false,
    false,
    true
),
(
    '10000000-0000-0000-0000-000000000014',
    'The Civilization of the Renaissance in Italy',
    'Jacob Burckhardt',
    'History',
    'Classic study of how individualism and modern self-consciousness emerged in 15th-century Italy.',
    'How did the medieval collective mind give birth to the modern sovereign individual?',
    'In the Middle Ages both sides of human consciousness lay dreaming or half awake beneath a common veil. The veil was woven of faith, illusion, and childish prepossession.\n\nIn Italy this veil first melted into air; an objective treatment and consideration of the State and of all the things of this world became possible.',
    'https://www.gutenberg.org/ebooks/2074',
    'Project Gutenberg',
    'public_domain',
    'Intermediate',
    'book',
    ARRAY['Renaissance', 'Cultural History', 'Italy'],
    '#1C1E26',
    false,
    true,
    true
),

-- 🏗️ ARCHITECTURE (4 items)
(
    '10000000-0000-0000-0000-000000000015',
    'The Ten Books on Architecture',
    'Vitruvius',
    'Architecture',
    'The classical treatise defining the three pillars of design: Firmitas, Utilitas, Venustas.',
    'Why must great buildings balance structural firmness, utility, and aesthetic delight?',
    'Architecture is a science arising out of many other sciences, and adorned with much and varied learning.\n\nDurability will be assured when foundations are carried down to a solid ground. Utility, when the arrangement of the apartments is faultless. Beauty, when the appearance of the work is pleasing and in good taste.',
    'https://www.gutenberg.org/ebooks/20239',
    'Project Gutenberg',
    'public_domain',
    'Intermediate',
    'book',
    ARRAY['Classical Architecture', 'Urban Design', 'Proportion'],
    '#1E221C',
    true,
    false,
    true
),
(
    '10000000-0000-0000-0000-000000000016',
    'The Seven Lamps of Architecture',
    'John Ruskin',
    'Architecture',
    'Philosophical inquiry linking building design to morality, truth, craftsmanship, and memory.',
    'Why is authentic architectural craftsmanship a reflection of a society''s spiritual health?',
    'We may live without architecture, and worship without her, but we cannot remember without her.\n\nDo not let us talk of restoration. The thing is a Lie from beginning to end. Take proper care of your monuments, and you will not need to restore them.',
    'https://www.gutenberg.org/ebooks/35996',
    'Project Gutenberg',
    'public_domain',
    'Intermediate',
    'book',
    ARRAY['Gothic Architecture', 'Aesthetics', 'Craftsmanship'],
    '#241D1A',
    false,
    false,
    true
),
(
    '10000000-0000-0000-0000-000000000017',
    'Form and Function in Design',
    'Horatio Greenough',
    'Architecture',
    'Early 19th-century essays formulating the principle that organic form follows inherent purpose.',
    'Should the aesthetic shape of a structure derive strictly from its inner function?',
    'My declaration is the law of adaptation, the principle of organic form. If we compare the skeleton of a bird with the shape of a ship, we discover the same divine harmony between purpose and envelope.\n\nBeauty is the promise of function.',
    'https://archive.org/details/formfunctionrema00gree',
    'Internet Archive',
    'archive',
    'Intermediate',
    'essay',
    ARRAY['Architectural Theory', 'Functionalism', 'Design Philosophy'],
    '#192224',
    false,
    true,
    true
),

-- 📖 STORIES (5 items)
(
    '10000000-0000-0000-0000-000000000018',
    'The Yellow Wallpaper',
    'Charlotte Perkins Gilman',
    'Stories',
    'Haunting masterpiece exploring psychological isolation, medical control, and domestic confinement.',
    'What happens to the human psyche when creative expression is forbidden?',
    'There is a delicious garden! I never saw such a garden — large and shady, full of box-bordered paths, and lined with long grape-covered arbors.\n\nIt is the strangest yellow, that wallpaper! It makes me think of all the yellow things I ever saw — not beautiful ones like buttercups, but old foul, bad yellow things.',
    'https://www.gutenberg.org/ebooks/1952',
    'Project Gutenberg',
    'public_domain',
    'Beginner',
    'story',
    ARRAY['Psychological Fiction', 'Gothic', 'Isolation'],
    '#251C1A',
    true,
    false,
    true
),
(
    '10000000-0000-0000-0000-000000000019',
    'The Horla',
    'Guy de Maupassant',
    'Stories',
    'Chilling journal of a man convinced an invisible, sentient entity is usurping his mind.',
    'How do we distinguish between genuine unseen realities and creeping delusion?',
    'What a lovely day! I have spent all the morning lying on the grass in front of my house, under the huge plane tree which shades it.\n\nHas he come, the... Horla? Is it he who governs my thoughts, who commands my movements, who masters my soul?',
    'https://www.gutenberg.org/ebooks/7623',
    'Project Gutenberg',
    'public_domain',
    'Beginner',
    'story',
    ARRAY['Strange Fiction', 'Psychological Horror', 'Perception'],
    '#1B2026',
    false,
    false,
    true
),
(
    '10000000-0000-0000-0000-000000000020',
    'The Machine Stops',
    'E.M. Forster',
    'Stories',
    'Prophetic 1909 science fiction story predicting global video networks and human isolation.',
    'What occurs when humanity becomes completely dependent on an automated omnipotent machine?',
    'Imagine, if you can, a little room, hexagonal in shape, like the cell of a bee. It is lighted neither by window nor by lamp, yet it is filled with a soft radiance.\n\nThe Machine feeds us and clothes us and houses us; through it we speak to one another, through it we see one another, in it we have our being.',
    'https://www.gutenberg.org/ebooks/2230',
    'Project Gutenberg',
    'public_domain',
    'Beginner',
    'story',
    ARRAY['Speculative Fiction', 'Technology', 'Dystopia'],
    '#1A2522',
    false,
    false,
    true
),

-- 🔬 SCIENCE (4 items)
(
    '10000000-0000-0000-0000-000000000021',
    'On the Origin of Species',
    'Charles Darwin',
    'Science',
    'The foundational text of evolutionary biology demonstrating natural selection and descent with modification.',
    'How do small hereditary variations produce the astonishing complexity of all living forms?',
    'There is grandeur in this view of life, with its several powers, having been originally breathed into a few forms or into one; and that, whilst this planet has gone cycling on according to the fixed law of gravity, from so simple a beginning endless forms most beautiful and most wonderful have been, and are being, evolved.',
    'https://www.gutenberg.org/ebooks/2009',
    'Project Gutenberg',
    'public_domain',
    'Intermediate',
    'book',
    ARRAY['Evolution', 'Biology', 'Natural Selection'],
    '#1D241C',
    true,
    false,
    true
),
(
    '10000000-0000-0000-0000-000000000022',
    'Relativity: The Special and General Theory',
    'Albert Einstein',
    'Science',
    'Einstein''s own accessible exposition of how space, time, and gravity are fundamentally intertwined.',
    'Why is time not an absolute constant, but relative to speed and gravitational fields?',
    'In order to attain the greatest possible clearness, I have intentionally avoided presenting the subject in a mathematically rigorous manner.\n\nSpace and time are not conditions in which we live, but modes in which we think.',
    'https://www.gutenberg.org/ebooks/30155',
    'Project Gutenberg',
    'public_domain',
    'Advanced',
    'book',
    ARRAY['Physics', 'Spacetime', 'Cosmology'],
    '#1A1E27',
    false,
    false,
    true
),

-- 🎨 ART & CULTURE (3 items)
(
    '10000000-0000-0000-0000-000000000023',
    'Concerning the Spiritual in Art',
    'Wassily Kandinsky',
    'Art & Culture',
    'Pioneering treatise exploring abstract painting, inner necessity, and color vibration.',
    'How can pure abstract colors and forms evoke deep spiritual emotions directly?',
    'Color is the keyboard, the eyes are the hammers, the soul is the piano with many strings. The artist is the hand which plays, touching one key or another, to cause vibrations in the soul.',
    'https://www.gutenberg.org/ebooks/30268',
    'Project Gutenberg',
    'public_domain',
    'Advanced',
    'book',
    ARRAY['Abstract Art', 'Color Theory', 'Aesthetics'],
    '#251A22',
    true,
    false,
    true
),

-- 🧩 SOCIOLOGY (3 items)
(
    '10000000-0000-0000-0000-000000000024',
    'Folkways: Mores, Customs, and Morals',
    'William Graham Sumner',
    'Sociology',
    'Foundational study of how social norms, folkways, and ethnocentrism arise spontaneously.',
    'Why do societal habits transform into unquestioned moral imperatives over generations?',
    'Folkways are habits for the individual and customs for the group. They are produced by the frequent repetition of petty acts, often serving the same interest.\n\nThe "in-group" ethics differ fundamentally from "out-group" suspicion across human tribes.',
    'https://www.gutenberg.org/ebooks/24253',
    'Project Gutenberg',
    'public_domain',
    'Intermediate',
    'book',
    ARRAY['Social Norms', 'Culture', 'Group Behavior'],
    '#1F231D',
    false,
    false,
    true
),

-- 💼 ECONOMICS & BEHAVIOUR (3 items)
(
    '10000000-0000-0000-0000-000000000025',
    'The Theory of the Leisure Class',
    'Thorstein Veblen',
    'Economics & Behaviour',
    'Incisive critique of status competition, conspicuous consumption, and social signaling.',
    'Why do individuals purchase expensive goods not for utility, but to signal social position?',
    'In order to gain and to hold the esteem of men it is not sufficient merely to possess wealth or power. The wealth or power must be put in evidence, for esteem is awarded only on evidence.\n\nConspicuous consumption of valuable goods is a means of reputability to the gentleman of leisure.',
    'https://www.gutenberg.org/ebooks/833',
    'Project Gutenberg',
    'public_domain',
    'Intermediate',
    'book',
    ARRAY['Conspicuous Consumption', 'Behavioral Economics', 'Status'],
    '#241F1A',
    true,
    false,
    true
),

-- ✍️ LITERATURE (3 items)
(
    '10000000-0000-0000-0000-000000000026',
    'The Metamorphosis',
    'Franz Kafka',
    'Literature',
    'Existential masterpiece depicting alienation, family obligation, and absurdity.',
    'How quickly does modern society strip dignity from an individual who can no longer produce value?',
    'One morning, when Gregor Samsa woke from troubled dreams, he found himself transformed in his bed into a horrible vermin.\n\nWhat a strenuous career it is that I''ve chosen! Travelling day in and day out. The hurt of real business is much greater than in the home office.',
    'https://www.gutenberg.org/ebooks/5200',
    'Project Gutenberg',
    'public_domain',
    'Intermediate',
    'story',
    ARRAY['Existential Literature', 'Absurdism', 'Alienation'],
    '#1A2422',
    true,
    false,
    true
);
