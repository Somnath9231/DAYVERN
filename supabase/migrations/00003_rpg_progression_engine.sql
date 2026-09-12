-- DAYVERN Server-Side RPG Progression Engine Migration Schema

-- 1. PROGRESSION AUDIT LOGS TABLE (IMMUTABLE SERVER CHRONICLE & IDEMPOTENCY)
CREATE TABLE IF NOT EXISTS public.progression_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    idempotency_key TEXT UNIQUE NOT NULL,
    event_type TEXT NOT NULL CHECK (event_type IN ('activity_logged', 'reading_milestone', 'habit_completed', 'quest_completed', 'reward_claimed')),
    title TEXT NOT NULL,
    category TEXT,
    xp_awarded INTEGER NOT NULL DEFAULT 0,
    gold_awarded INTEGER NOT NULL DEFAULT 0,
    attribute_gains JSONB DEFAULT '{}'::jsonb,
    level_before INTEGER NOT NULL,
    level_after INTEGER NOT NULL,
    streak_count INTEGER NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- INDEXES FOR FAST AUDIT QUERYING
CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON public.progression_audit_logs(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_key ON public.progression_audit_logs(idempotency_key);

-- RLS POLICIES FOR AUDIT LOGS
ALTER TABLE public.progression_audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "User can read own audit logs" ON public.progression_audit_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "User can insert own audit logs" ON public.progression_audit_logs FOR INSERT WITH CHECK (auth.uid() = user_id);

GRANT SELECT, INSERT ON public.progression_audit_logs TO authenticated;

-- 2. ATOMIC RPG TRANSACTION PROCEDURAL FUNCTION
CREATE OR REPLACE FUNCTION public.process_rpg_progression_tx(
    p_user_id UUID,
    p_idempotency_key TEXT,
    p_event_type TEXT,
    p_title TEXT,
    p_category TEXT,
    p_xp_awarded INTEGER,
    p_gold_awarded INTEGER,
    p_attribute_gains JSONB,
    p_new_level INTEGER,
    p_new_current_xp INTEGER,
    p_new_total_xp INTEGER,
    p_new_gold INTEGER,
    p_new_streak INTEGER,
    p_metadata JSONB DEFAULT '{}'::jsonb
) RETURNS JSONB AS $$
DECLARE
    v_existing_log public.progression_audit_logs%ROWTYPE;
    v_level_before INTEGER;
    v_attr_key TEXT;
    v_attr_val JSONB;
BEGIN
    -- Security verification: caller must be authenticated user matching p_user_id
    IF auth.uid() IS NULL OR auth.uid() <> p_user_id THEN
        RAISE EXCEPTION 'Unauthorized: RPG progression can only be executed by the authenticated account owner.';
    END IF;

    -- Check for existing idempotency key (prevent duplicate rewards)
    SELECT * INTO v_existing_log FROM public.progression_audit_logs WHERE idempotency_key = p_idempotency_key;
    IF FOUND THEN
        RETURN jsonb_build_object(
            'status', 'idempotent_cached',
            'idempotency_key', p_idempotency_key,
            'xp_awarded', v_existing_log.xp_awarded,
            'gold_awarded', v_existing_log.gold_awarded,
            'level_after', v_existing_log.level_after
        );
    END IF;

    -- Get current level before update
    SELECT level INTO v_level_before FROM public.profiles WHERE id = p_user_id;

    -- Set local transaction session configuration flag to allow trigger bypass for server progression execution
    PERFORM set_config('dayvern.bypass_progression_guard', 'true', true);

    -- Update Profile (Level, Current XP, Total XP, Gold, Streak, Last Active)
    UPDATE public.profiles
    SET 
        level = p_new_level,
        current_xp = p_new_current_xp,
        total_xp = p_new_total_xp,
        gold = p_new_gold,
        streak_count = p_new_streak,
        last_active_at = NOW(),
        updated_at = NOW()
    WHERE id = p_user_id;

    -- Update attributes if attribute gains provided
    IF p_attribute_gains IS NOT NULL AND jsonb_typeof(p_attribute_gains) = 'object' THEN
        FOR v_attr_key, v_attr_val IN SELECT * FROM jsonb_each(p_attribute_gains)
        LOOP
            UPDATE public.user_attributes
            SET 
                level = COALESCE((v_attr_val->>'level')::INTEGER, level),
                current_xp = COALESCE((v_attr_val->>'current_xp')::INTEGER, current_xp),
                total_xp = COALESCE((v_attr_val->>'total_xp')::INTEGER, total_xp)
            WHERE user_id = p_user_id AND attribute_type = v_attr_key;
        END LOOP;
    END IF;

    -- Insert Audit Record
    INSERT INTO public.progression_audit_logs (
        user_id,
        idempotency_key,
        event_type,
        title,
        category,
        xp_awarded,
        gold_awarded,
        attribute_gains,
        level_before,
        level_after,
        streak_count,
        metadata
    ) VALUES (
        p_user_id,
        p_idempotency_key,
        p_event_type,
        p_title,
        p_category,
        p_xp_awarded,
        p_gold_awarded,
        p_attribute_gains,
        COALESCE(v_level_before, 1),
        p_new_level,
        p_new_streak,
        p_metadata
    );

    RETURN jsonb_build_object(
        'status', 'success',
        'idempotency_key', p_idempotency_key,
        'xp_awarded', p_xp_awarded,
        'gold_awarded', p_gold_awarded,
        'level_after', p_new_level
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
