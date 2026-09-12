-- DAYVERN Database Schema Migration
-- Production-quality PostgreSQL schema for Life RPG Web Application

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT UNIQUE NOT NULL,
    display_name TEXT,
    character_class TEXT NOT NULL DEFAULT 'Polymath',
    avatar_url TEXT,
    level INTEGER NOT NULL DEFAULT 1,
    current_xp INTEGER NOT NULL DEFAULT 0,
    total_xp INTEGER NOT NULL DEFAULT 0,
    gold INTEGER NOT NULL DEFAULT 50,
    streak_count INTEGER NOT NULL DEFAULT 0,
    is_admin BOOLEAN NOT NULL DEFAULT false,
    last_active_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. USER ATTRIBUTES TABLE (INT, STR, DEX, CON, CHA)
CREATE TABLE IF NOT EXISTS public.user_attributes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    attribute_type TEXT NOT NULL CHECK (attribute_type IN ('INT', 'STR', 'DEX', 'CON', 'CHA')),
    level INTEGER NOT NULL DEFAULT 1,
    current_xp INTEGER NOT NULL DEFAULT 0,
    total_xp INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_user_attribute UNIQUE (user_id, attribute_type)
);

-- 3. ACTIVITIES TABLE
CREATE TABLE IF NOT EXISTS public.activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('study', 'coding', 'fitness', 'habit', 'reading', 'custom')),
    duration_minutes INTEGER NOT NULL DEFAULT 0,
    xp_earned INTEGER NOT NULL DEFAULT 0,
    attribute_gains JSONB DEFAULT '{}'::jsonb,
    notes TEXT,
    performed_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. HABITS TABLE
CREATE TABLE IF NOT EXISTS public.habits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL DEFAULT 'discipline',
    attribute_target TEXT NOT NULL DEFAULT 'CON' CHECK (attribute_target IN ('INT', 'STR', 'DEX', 'CON', 'CHA')),
    base_xp INTEGER NOT NULL DEFAULT 25,
    base_gold INTEGER NOT NULL DEFAULT 10,
    streak_count INTEGER NOT NULL DEFAULT 0,
    frequency TEXT NOT NULL DEFAULT 'daily',
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. HABIT LOGS TABLE
CREATE TABLE IF NOT EXISTS public.habit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    habit_id UUID NOT NULL REFERENCES public.habits(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    completed_date DATE NOT NULL DEFAULT CURRENT_DATE,
    xp_earned INTEGER NOT NULL DEFAULT 0,
    gold_earned INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_habit_daily_log UNIQUE (habit_id, completed_date)
);

-- 6. QUESTS TABLE
CREATE TABLE IF NOT EXISTS public.quests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    quest_type TEXT NOT NULL DEFAULT 'daily' CHECK (quest_type IN ('daily', 'weekly', 'milestone')),
    category TEXT NOT NULL DEFAULT 'study',
    target_count INTEGER NOT NULL DEFAULT 1,
    current_count INTEGER NOT NULL DEFAULT 0,
    xp_reward INTEGER NOT NULL DEFAULT 50,
    gold_reward INTEGER NOT NULL DEFAULT 25,
    attribute_reward TEXT CHECK (attribute_reward IN ('INT', 'STR', 'DEX', 'CON', 'CHA')),
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'failed')),
    due_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. ACHIEVEMENTS SYSTEM
CREATE TABLE IF NOT EXISTS public.achievements (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL,
    icon_name TEXT NOT NULL,
    xp_reward INTEGER NOT NULL DEFAULT 100,
    gold_reward INTEGER NOT NULL DEFAULT 50
);

CREATE TABLE IF NOT EXISTS public.user_achievements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    achievement_id TEXT NOT NULL REFERENCES public.achievements(id) ON DELETE CASCADE,
    unlocked_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_user_achievement UNIQUE (user_id, achievement_id)
);

-- 8. REWARDS SHOP TABLE
CREATE TABLE IF NOT EXISTS public.rewards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    cost_gold INTEGER NOT NULL DEFAULT 100,
    is_claimed BOOLEAN NOT NULL DEFAULT false,
    claimed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- FOREIGN KEY INDEXES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_activities_user ON public.activities(user_id);
CREATE INDEX IF NOT EXISTS idx_habits_user ON public.habits(user_id);
CREATE INDEX IF NOT EXISTS idx_quests_user ON public.quests(user_id);
CREATE INDEX IF NOT EXISTS idx_rewards_user ON public.rewards(user_id);
CREATE INDEX IF NOT EXISTS idx_habit_logs_user ON public.habit_logs(user_id);

-- INSERT PREDEFINED ACHIEVEMENTS
INSERT INTO public.achievements (id, title, description, category, icon_name, xp_reward, gold_reward)
VALUES 
    ('first_step', 'First Step Taken', 'Log your very first real-world activity', 'starter', 'Footprints', 50, 25),
    ('streak_3', 'Momentum Building', 'Maintain a 3-day activity streak', 'streak', 'Flame', 100, 50),
    ('streak_7', 'Unstoppable Force', 'Maintain a 7-day activity streak', 'streak', 'Zap', 250, 150),
    ('code_initiate', 'Syntax Sorcerer', 'Log over 3 hours of coding work', 'coding', 'Code', 150, 75),
    ('iron_discipline', 'Iron Body', 'Log 5 fitness sessions', 'fitness', 'Dumbbell', 200, 100),
    ('scholar_path', 'Seeker of Knowledge', 'Complete 10 hours of studying or reading', 'study', 'BookOpen', 200, 100),
    ('quest_master', 'Quest Veteran', 'Complete 10 daily or weekly quests', 'quests', 'Trophy', 300, 150)
ON CONFLICT (id) DO NOTHING;

-- ADMIN CHECK HELPER FUNCTION
CREATE OR REPLACE FUNCTION public.is_admin(p_user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
BEGIN
    IF p_user_id IS NULL THEN
        RETURN false;
    END IF;
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = p_user_id AND is_admin = true
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- ROW LEVEL SECURITY (RLS) POLICIES

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_attributes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.habit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;

-- Achievements are globally viewable
CREATE POLICY "Public achievements read" ON public.achievements FOR SELECT USING (true);

-- User specific tables
CREATE POLICY "User can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "User can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "User can view own attributes" ON public.user_attributes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "User can insert own attributes" ON public.user_attributes FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "User can view own activities" ON public.activities FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "User can insert own activities" ON public.activities FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "User can view own habits" ON public.habits FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "User can insert own habits" ON public.habits FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "User can update own habits" ON public.habits FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "User can delete own habits" ON public.habits FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "User can view own habit_logs" ON public.habit_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "User can insert own habit_logs" ON public.habit_logs FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "User can view own quests" ON public.quests FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "User can insert own quests" ON public.quests FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "User can update own quests" ON public.quests FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "User can view own user_achievements" ON public.user_achievements FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "User can insert own user_achievements" ON public.user_achievements FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "User can view own rewards" ON public.rewards FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "User can insert own rewards" ON public.rewards FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "User can update own rewards" ON public.rewards FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "User can delete own rewards" ON public.rewards FOR DELETE USING (auth.uid() = user_id);

-- COLUMN-LEVEL PRIVILEGE SECURITY FOR PROFILES AND USER ATTRIBUTES
-- Prevents normal authenticated clients from modifying sensitive RPG fields directly

REVOKE ALL ON public.profiles FROM PUBLIC, anon, authenticated;
GRANT SELECT ON public.profiles TO authenticated;
GRANT INSERT ON public.profiles TO authenticated;
GRANT UPDATE (username, display_name, character_class, avatar_url, updated_at) ON public.profiles TO authenticated;

REVOKE ALL ON public.user_attributes FROM PUBLIC, anon, authenticated;
GRANT SELECT ON public.user_attributes TO authenticated;
GRANT INSERT ON public.user_attributes TO authenticated;

-- TRIGGER GUARDS TO BLOCK DIRECT RPG STATE MANIPULATION
CREATE OR REPLACE FUNCTION public.enforce_profile_update_security()
RETURNS TRIGGER AS $$
BEGIN
    IF current_setting('dayvern.bypass_progression_guard', true) IS DISTINCT FROM 'true' THEN
        IF (NEW.level IS DISTINCT FROM OLD.level OR
            NEW.current_xp IS DISTINCT FROM OLD.current_xp OR
            NEW.total_xp IS DISTINCT FROM OLD.total_xp OR
            NEW.gold IS DISTINCT FROM OLD.gold OR
            NEW.streak_count IS DISTINCT FROM OLD.streak_count OR
            NEW.last_active_at IS DISTINCT FROM OLD.last_active_at OR
            NEW.is_admin IS DISTINCT FROM OLD.is_admin) THEN
            RAISE EXCEPTION 'Security Violation: Direct modification of sensitive RPG fields (level, XP, gold, streak, is_admin) is forbidden.';
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER trg_protect_profile_sensitive_fields
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.enforce_profile_update_security();

CREATE OR REPLACE FUNCTION public.enforce_user_attributes_update_security()
RETURNS TRIGGER AS $$
BEGIN
    IF current_setting('dayvern.bypass_progression_guard', true) IS DISTINCT FROM 'true' THEN
        IF (NEW.level IS DISTINCT FROM OLD.level OR
            NEW.current_xp IS DISTINCT FROM OLD.current_xp OR
            NEW.total_xp IS DISTINCT FROM OLD.total_xp) THEN
            RAISE EXCEPTION 'Security Violation: Direct modification of user attribute level or XP is forbidden.';
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER trg_protect_user_attributes_fields
    BEFORE UPDATE ON public.user_attributes
    FOR EACH ROW EXECUTE FUNCTION public.enforce_user_attributes_update_security();

-- TRIGGER TO AUTO-CREATE PROFILE ON SIGNUP & INITIALIZE ATTRIBUTES
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    -- Insert profile
    INSERT INTO public.profiles (id, username, display_name, character_class, is_admin)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
        COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)),
        COALESCE(NEW.raw_user_meta_data->>'character_class', 'Polymath'),
        false
    );

    -- Initialize 5 attributes
    INSERT INTO public.user_attributes (user_id, attribute_type, level, current_xp, total_xp)
    VALUES
        (NEW.id, 'INT', 1, 0, 0),
        (NEW.id, 'STR', 1, 0, 0),
        (NEW.id, 'DEX', 1, 0, 0),
        (NEW.id, 'CON', 1, 0, 0),
        (NEW.id, 'CHA', 1, 0, 0);

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger execution on auth.users creation
CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
