-- DAYVERN Migration 00010: Library V2 Discovery System & Server-Authoritative +5 INT Progression

-- 1. EXTEND SCHEMA
ALTER TABLE public.library_books
    ADD COLUMN IF NOT EXISTS hook_text TEXT NOT NULL DEFAULT '',
    ADD COLUMN IF NOT EXISTS highlight_text TEXT DEFAULT '';

ALTER TABLE public.user_tasks
    ADD COLUMN IF NOT EXISTS linked_book_id UUID REFERENCES public.library_books(id) ON DELETE SET NULL;

-- Index for fast linked book task lookups
CREATE INDEX IF NOT EXISTS idx_user_tasks_linked_book ON public.user_tasks(user_id, linked_book_id);

-- 2. SECURE SERVER-AUTHORITATIVE READING MILESTONE RPC (+5 INT REWARD)
CREATE OR REPLACE FUNCTION public.complete_reading_milestone(
    p_book_id UUID,
    p_task_id UUID DEFAULT NULL
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_user_id UUID := auth.uid();
    v_book public.library_books%ROWTYPE;
    v_task public.user_tasks%ROWTYPE;
    v_profile public.profiles%ROWTYPE;
    v_idempotency TEXT;
    v_already_logged BOOLEAN := false;
    v_int_gain INTEGER := 5;
    v_xp_gain INTEGER := 50;
    v_gold_gain INTEGER := 10;
    v_rpg_result JSONB;
    v_next_due_date DATE;
BEGIN
    -- 1. Authentication check
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Unauthorized: User must be authenticated to complete reading milestones.';
    END IF;

    -- 2. Verify book exists & is published
    SELECT * INTO v_book 
    FROM public.library_books 
    WHERE id = p_book_id AND published = true;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Book resource not found or not published.';
    END IF;

    -- 3. Construct Idempotency Key
    IF p_task_id IS NOT NULL THEN
        SELECT * INTO v_task 
        FROM public.user_tasks 
        WHERE id = p_task_id AND user_id = v_user_id 
        FOR UPDATE;

        IF NOT FOUND THEN
            RAISE EXCEPTION 'Associated task not found or access denied.';
        END IF;

        IF v_task.status = 'completed' THEN
            RETURN jsonb_build_object(
                'status', 'already_completed',
                'message', 'This reading task has already been completed.'
            );
        END IF;

        v_idempotency := 'read_task_' || p_task_id::text;
    ELSE
        -- Date-based milestone idempotency per user per book
        v_idempotency := 'read_milestone_' || v_user_id::text || '_' || p_book_id::text || '_' || CURRENT_DATE::text;
    END IF;

    -- 4. Check if idempotency key already logged in audit logs
    SELECT EXISTS (
        SELECT 1 FROM public.progression_audit_logs 
        WHERE user_id = v_user_id AND idempotency_key = v_idempotency
    ) INTO v_already_logged;

    IF v_already_logged THEN
        RETURN jsonb_build_object(
            'status', 'already_claimed',
            'message', 'Reading milestone reward already claimed for this period.'
        );
    END IF;

    -- 5. Mark task completed if provided
    IF p_task_id IS NOT NULL THEN
        UPDATE public.user_tasks
        SET status = 'completed',
            completed_at = NOW(),
            updated_at = NOW()
        WHERE id = p_task_id;

        -- Spawn next recurring task occurrence if applicable
        IF v_task.recurrence_rule <> 'none' THEN
            IF v_task.recurrence_rule = 'daily' THEN v_next_due_date := v_task.due_date + INTERVAL '1 day';
            ELSIF v_task.recurrence_rule = 'weekly' THEN v_next_due_date := v_task.due_date + INTERVAL '1 week';
            ELSIF v_task.recurrence_rule = 'monthly' THEN v_next_due_date := v_task.due_date + INTERVAL '1 month';
            END IF;

            IF v_next_due_date IS NOT NULL THEN
                INSERT INTO public.user_tasks (
                    user_id, title, description, task_type, due_date, due_time,
                    recurrence_rule, priority, xp_reward, gold_reward, linked_book_id
                ) VALUES (
                    v_user_id, v_task.title, v_task.description, v_task.task_type, v_next_due_date, v_task.due_time,
                    v_task.recurrence_rule, v_task.priority, v_task.xp_reward, v_task.gold_reward, p_book_id
                );
            END IF;
        END IF;
    END IF;

    -- 6. Trigger Server-Authoritative RPG Progression (+5 INT, +50 XP, +10 Gold)
    v_rpg_result := public.process_rpg_progression_tx(
        p_user_id := v_user_id,
        p_idempotency_key := v_idempotency,
        p_event_type := 'reading_milestone',
        p_title := 'Read: ' || v_book.title,
        p_category := 'reading',
        p_duration_minutes := 20,
        p_target_id := p_book_id,
        p_metadata := jsonb_build_object(
            'book_id', p_book_id,
            'task_id', p_task_id,
            'int_boost', v_int_gain
        )
    );

    RETURN jsonb_build_object(
        'status', 'success',
        'book_id', p_book_id,
        'task_id', p_task_id,
        'int_awarded', v_int_gain,
        'xp_awarded', v_xp_gain,
        'gold_awarded', v_gold_gain,
        'rpg_result', v_rpg_result
    );
END;
$$;


-- 3. SEED CURATED DISCOVERY WORKS WITH CURIOSITY HOOKS & HIGHLIGHTS

TRUNCATE TABLE public.library_books CASCADE;

INSERT INTO public.library_books (
    id, title, author, category, description, why_it_matters, hook_text, highlight_text, preview_text, 
    source_url, source_name, source_type, difficulty, content_type, tags, 
    cover_bg_color, featured, under_the_radar, published
) VALUES

-- 🧠 PSYCHOLOGY
(
    '20000000-0000-0000-0000-000000000001',
    'Theory of Cognitive Dissonance',
    'Leon Festinger',
    'Psychology',
    'Classic study examining the psychological discomfort created by contradictory beliefs and actions.',
    'Why does the mind alter its convictions instead of accepting uncomfortable facts?',
    'Your brain will actively alter reality to defend a belief it knows is wrong.',
    'People may change their interpretation of reality before they change the underlying belief.',
    'The presence of dissonance, giving rise to actions designed to reduce it, is a basic human drive. When an individual holds two cognitions that are psychologically inconsistent, he experiences tension.\n\nRather than admitting error, human beings frequently rationalize, seek confirming information, and reject contradictory evidence to restore internal harmony.',
    'https://www.jstor.org/stable/27856488',
    'JSTOR Open Content',
    'open_access',
    'Advanced',
    'paper',
    ARRAY['Cognitive Dissonance', 'Social Psychology', 'Beliefs'],
    '#17191D',
    true,
    false,
    true
),
(
    '20000000-0000-0000-0000-000000000002',
    'The Principles of Psychology',
    'William James',
    'Psychology',
    'Foundational treatise exploring consciousness, habit formation, stream of thought, and emotion.',
    'Why does habit rule human behavior, and can consciousness be broken down into discrete elements?',
    'Habit is the enormous flywheel of society that keeps us within the bounds of ordinance.',
    'Character is formed by taking immediate concrete advantage of every opportunity to act.',
    'Habit is thus the enormous fly-wheel of society, its most precious conservative agent. It alone is what keeps us all within the bounds of ordinance, and saves the children of fortune from the envious uprisings of the poor.\n\nNo matter how full a reservoir of maxims one may possess, if one has not taken advantage of every concrete opportunity to act, one''s character remains unaffected.',
    'https://www.gutenberg.org/ebooks/57628',
    'Project Gutenberg',
    'public_domain',
    'Advanced',
    'book',
    ARRAY['Habit Formation', 'Consciousness', 'Stream of Thought'],
    '#17191D',
    false,
    false,
    true
),
(
    '20000000-0000-0000-0000-000000000003',
    'Gestalt Psychology',
    'Wolfgang Köhler',
    'Psychology',
    'Landmark investigation into holistic perception and problem-solving mechanisms.',
    'Why does the mind naturally perceive unified patterns and wholes rather than isolated fragments?',
    'We do not see isolated points of light; we see constellations.',
    'The perceptual field organizes itself spontaneously into coherent holistic structures.',
    'The whole is different from the sum of its parts. When we look at a constellation, we do not see seven separate points of light; we see a Big Dipper. The perceptual field organizes itself spontaneously into coherent structures.\n\nInsightful problem solving differs fundamentally from trial-and-error conditioning.',
    'https://www.gutenberg.org/ebooks/68903',
    'Project Gutenberg',
    'public_domain',
    'Advanced',
    'book',
    ARRAY['Gestalt', 'Perception', 'Cognitive Psychology'],
    '#17191D',
    false,
    false,
    true
),
(
    '20000000-0000-0000-0000-000000000004',
    'Group Psychology and the Analysis of the Ego',
    'Sigmund Freud',
    'Psychology',
    'Analysis of how individual psychological mechanisms change radically within crowd settings.',
    'Why do individuals act against their moral standards when absorbed into a group?',
    'Within a crowd, an individual yields to instincts they would otherwise keep strictly restrained.',
    'A group thinks in vivid emotional images, which call one another up by association.',
    'In a group, the individual experiences a feeling of invincible power which allows him to yield to instincts which, had he been alone, he would perforce have kept under restraint.\n\nThe group is extraordinarily credulous and open to influence; it has no critical faculty.',
    'https://www.gutenberg.org/ebooks/35877',
    'Project Gutenberg',
    'public_domain',
    'Intermediate',
    'book',
    ARRAY['Psychoanalysis', 'Social Influence', 'Crowd Behavior'],
    '#17191D',
    false,
    true,
    true
),

-- 📜 PHILOSOPHY
(
    '20000000-0000-0000-0000-000000000005',
    'Meditations',
    'Marcus Aurelius',
    'Philosophy',
    'Private journal of the Roman Emperor documenting Stoic self-discipline, mortality, and duty.',
    'How do you maintain tranquility of mind amidst chaotic external events?',
    'You have power over your mind — not outside events. Realize this, and you find strength.',
    'Waste no more time arguing about what a good man should be. Be one.',
    'You have power over your mind — not outside events. Realize this, and you will find strength. Everything we hear is an opinion, not a fact. Everything we see is a perspective, not the truth.\n\nWaste no more time arguing about what a good man should be. Be one.',
    'https://www.gutenberg.org/ebooks/2680',
    'Project Gutenberg',
    'public_domain',
    'Beginner',
    'book',
    ARRAY['Stoicism', 'Tranquility', 'Duty'],
    '#17191D',
    true,
    false,
    true
),
(
    '20000000-0000-0000-0000-000000000006',
    'Beyond Good and Evil',
    'Friedrich Nietzsche',
    'Philosophy',
    'Critique of traditional morality, truth claims, and dogmatic philosophical assumptions.',
    'What lies behind the human instinct to categorize ideas into absolute good and evil?',
    'If you gaze long into an abyss, the abyss also gazes into you.',
    'There are no moral phenomena at all, only a moral interpretation of phenomena.',
    'He who fights with monsters should look to it that he himself does not become a monster. And if you gaze long into an abyss, the abyss also gazes into you.\n\nThere are no moral phenomena at all, only a moral interpretation of phenomena.',
    'https://www.gutenberg.org/ebooks/4363',
    'Project Gutenberg',
    'public_domain',
    'Advanced',
    'book',
    ARRAY['Existentialism', 'Ethics', 'Morality'],
    '#17191D',
    false,
    false,
    true
),

-- 🏛️ HISTORY
(
    '20000000-0000-0000-0000-000000000007',
    'The History of the Decline and Fall of the Roman Empire',
    'Edward Gibbon',
    'History',
    'Monumental narrative analyzing the structural, military, and moral dissolution of Rome.',
    'Why do vast empires crumble from internal decay rather than external conquest?',
    'The decline of Rome was the natural and inevitable effect of immoderate greatness.',
    'History is little more than the register of the crimes, follies, and misfortunes of mankind.',
    'The decline of Rome was the natural and inevitable effect of immoderate greatness. Prosperity ripened the principle of decay; the causes of destruction multiplied with the extent of conquest.\n\nHistory is indeed little more than the register of the crimes, follies, and misfortunes of mankind.',
    'https://www.gutenberg.org/ebooks/890',
    'Project Gutenberg',
    'public_domain',
    'Advanced',
    'book',
    ARRAY['Roman Empire', 'Civilization Collapse', 'Statecraft'],
    '#17191D',
    true,
    false,
    true
),
(
    '20000000-0000-0000-0000-000000000008',
    'The History of the Peloponnesian War',
    'Thucydides',
    'History',
    'Relentless analysis of power politics, human nature, and the existential war between Athens and Sparta.',
    'Why is conflict inevitable when a rising power threatens an established hegemon?',
    'The strong do what they can and the weak suffer what they must.',
    'What made war inevitable was the growth of Athenian power and the fear which this caused in Sparta.',
    'What made war inevitable was the growth of Athenian power and the fear which this caused in Sparta.\n\nThe strong do what they can and the weak suffer what they must.',
    'https://www.gutenberg.org/ebooks/7142',
    'Project Gutenberg',
    'public_domain',
    'Advanced',
    'book',
    ARRAY['Realpolitik', 'Ancient Greece', 'Thucydides Trap'],
    '#17191D',
    false,
    false,
    true
),

-- 🏗️ ARCHITECTURE
(
    '20000000-0000-0000-0000-000000000009',
    'The Ten Books on Architecture',
    'Vitruvius',
    'Architecture',
    'Classical treatise defining the three pillars of architectural design.',
    'Why must great buildings balance structural firmness, utility, and aesthetic delight?',
    'Architecture must balance three virtues: Firmitas, Utilitas, and Venustas.',
    'Durability, utility, and beauty are the essential elements of all enduring building.',
    'Architecture is a science arising out of many other sciences. Durability will be assured when foundations are carried down to a solid ground. Utility, when the arrangement of the apartments is faultless. Beauty, when the appearance of the work is pleasing.',
    'https://www.gutenberg.org/ebooks/20239',
    'Project Gutenberg',
    'public_domain',
    'Intermediate',
    'book',
    ARRAY['Classical Design', 'Proportion', 'Urbanism'],
    '#17191D',
    true,
    false,
    true
),

-- 📖 FICTION
(
    '20000000-0000-0000-0000-000000000010',
    'The Metamorphosis',
    'Franz Kafka',
    'Fiction',
    'Existential masterpiece depicting alienation, family obligation, and social absurdity.',
    'How quickly does modern society strip dignity from an individual who can no longer produce value?',
    'One morning, Gregor Samsa woke from troubled dreams to find himself transformed into a vermin.',
    'He was a tool of his firm, bound by obligation while his inner life disintegrated.',
    'One morning, when Gregor Samsa woke from troubled dreams, he found himself transformed in his bed into a horrible vermin.\n\nWhat a strenuous career it is that I''ve chosen! Travelling day in and day out. The hurt of real business is much greater than in the home office.',
    'https://www.gutenberg.org/ebooks/5200',
    'Project Gutenberg',
    'public_domain',
    'Intermediate',
    'book',
    ARRAY['Absurdism', 'Alienation', 'Kafkaesque'],
    '#17191D',
    true,
    false,
    true
),

-- ✍️ SHORT STORIES
(
    '20000000-0000-0000-0000-000000000011',
    'The Yellow Wallpaper',
    'Charlotte Perkins Gilman',
    'Short Stories',
    'Haunting masterpiece exploring psychological isolation, medical control, and domestic confinement.',
    'What happens to the human psyche when creative expression is forbidden?',
    'It is the strangest yellow, that wallpaper! It makes me think of all old foul, bad yellow things.',
    'I lie here on this great immovable bed and follow that pattern about by the hour.',
    'There is a delicious garden! I never saw such a garden — large and shady, full of box-bordered paths.\n\nIt is the strangest yellow, that wallpaper! It makes me think of all the yellow things I ever saw — old foul, bad yellow things.',
    'https://www.gutenberg.org/ebooks/1952',
    'Project Gutenberg',
    'public_domain',
    'Beginner',
    'story',
    ARRAY['Psychological Isolation', 'Gothic', 'Confinement'],
    '#17191D',
    true,
    false,
    true
),
(
    '20000000-0000-0000-0000-000000000012',
    'The Machine Stops',
    'E.M. Forster',
    'Short Stories',
    'Prophetic 1909 science fiction story predicting global video networks and human isolation.',
    'What occurs when humanity becomes completely dependent on an automated omnipotent machine?',
    'The Machine feeds us and clothes us; through it we speak to one another, in it we have our being.',
    'Humanity had ceased to move, for the Machine satisfied every desire automatically.',
    'Imagine, if you can, a little room, hexagonal in shape, like the cell of a bee. It is lighted neither by window nor by lamp, yet it is filled with a soft radiance.\n\nThe Machine feeds us and clothes us and houses us; through it we speak to one another, through it we see one another.',
    'https://www.gutenberg.org/ebooks/2230',
    'Project Gutenberg',
    'public_domain',
    'Beginner',
    'story',
    ARRAY['Speculative Dystopia', 'Technology', 'Isolation'],
    '#17191D',
    false,
    false,
    true
),

-- 🔬 SCIENCE
(
    '20000000-0000-0000-0000-000000000013',
    'On the Origin of Species',
    'Charles Darwin',
    'Science',
    'Foundational text of evolutionary biology demonstrating natural selection.',
    'How do small hereditary variations produce the astonishing complexity of all living forms?',
    'There is grandeur in this view of life, with its several powers, cycling on from so simple a beginning.',
    'Endless forms most beautiful and most wonderful have been, and are being, evolved.',
    'There is grandeur in this view of life, with its several powers, having been originally breathed into a few forms or into one; and that, whilst this planet has gone cycling on according to the fixed law of gravity, from so simple a beginning endless forms most beautiful and most wonderful have been, and are being, evolved.',
    'https://www.gutenberg.org/ebooks/2009',
    'Project Gutenberg',
    'public_domain',
    'Intermediate',
    'book',
    ARRAY['Natural Selection', 'Biology', 'Evolution'],
    '#17191D',
    true,
    false,
    true
),
(
    '20000000-0000-0000-0000-000000000014',
    'Relativity: The Special and General Theory',
    'Albert Einstein',
    'Science',
    'Einstein''s exposition of how space, time, and gravity are fundamentally intertwined.',
    'Why is time not an absolute constant, but relative to speed and gravitational fields?',
    'Space and time are not conditions in which we live, but modes in which we think.',
    'The rate of a clock depends on its velocity and gravitational potential.',
    'In order to attain the greatest possible clearness, I have intentionally avoided presenting the subject in a mathematically rigorous manner.\n\nSpace and time are not conditions in which we live, but modes in which we think.',
    'https://www.gutenberg.org/ebooks/30155',
    'Project Gutenberg',
    'public_domain',
    'Advanced',
    'book',
    ARRAY['Physics', 'Spacetime', 'Relativity'],
    '#17191D',
    false,
    false,
    true
),

-- 🎨 ART & CULTURE
(
    '20000000-0000-0000-0000-000000000015',
    'Concerning the Spiritual in Art',
    'Wassily Kandinsky',
    'Art & Culture',
    'Pioneering treatise exploring abstract painting, inner necessity, and color vibration.',
    'How can pure abstract colors and forms evoke deep spiritual emotions directly?',
    'Color is the keyboard, the eyes are the hammers, the soul is the piano with many strings.',
    'The artist is the hand which plays, touching key after key, to cause vibrations in the soul.',
    'Color is the keyboard, the eyes are the hammers, the soul is the piano with many strings. The artist is the hand which plays, touching one key or another, to cause vibrations in the soul.',
    'https://www.gutenberg.org/ebooks/30268',
    'Project Gutenberg',
    'public_domain',
    'Advanced',
    'book',
    ARRAY['Abstract Painting', 'Aesthetics', 'Color Vibration'],
    '#17191D',
    true,
    false,
    true
),

-- 🧩 SOCIOLOGY
(
    '20000000-0000-0000-0000-000000000016',
    'Folkways: Mores, Customs, and Morals',
    'William Graham Sumner',
    'Sociology',
    'Foundational study of how social norms, folkways, and ethnocentrism arise spontaneously.',
    'Why do societal habits transform into unquestioned moral imperatives over generations?',
    'Folkways are produced by the frequent repetition of petty acts, forming unwritten law.',
    'The in-group ethics differ fundamentally from out-group suspicion across human societies.',
    'Folkways are habits for the individual and customs for the group. They are produced by the frequent repetition of petty acts, often serving the same interest.\n\nThe "in-group" ethics differ fundamentally from "out-group" suspicion across human tribes.',
    'https://www.gutenberg.org/ebooks/24253',
    'Project Gutenberg',
    'public_domain',
    'Intermediate',
    'book',
    ARRAY['Social Norms', 'Folkways', 'Ethnocentrism'],
    '#17191D',
    false,
    false,
    true
),

-- 💼 ECONOMICS & BEHAVIOUR
(
    '20000000-0000-0000-0000-000000000017',
    'The Theory of the Leisure Class',
    'Thorstein Veblen',
    'Economics & Behaviour',
    'Incisive critique of status competition, conspicuous consumption, and social signaling.',
    'Why do individuals purchase expensive goods not for utility, but to signal social position?',
    'Wealth must be put in evidence, for esteem is awarded only on visible evidence.',
    'Conspicuous consumption of valuable goods is a primary means of reputability.',
    'In order to gain and to hold the esteem of men it is not sufficient merely to possess wealth or power. The wealth or power must be put in evidence, for esteem is awarded only on evidence.\n\nConspicuous consumption of valuable goods is a means of reputability to the gentleman of leisure.',
    'https://www.gutenberg.org/ebooks/833',
    'Project Gutenberg',
    'public_domain',
    'Intermediate',
    'book',
    ARRAY['Conspicuous Consumption', 'Status Signaling', 'Behavioral Economics'],
    '#17191D',
    true,
    false,
    true
);
