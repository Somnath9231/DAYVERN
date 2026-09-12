-- DAYVERN Migration 00004: Server-Authoritative RPG Progression Engine Security Fix

-- Drop legacy client-trusted RPC function to eliminate parameter tampering vulnerability
DROP FUNCTION IF EXISTS public.process_rpg_progression_tx(
    UUID, TEXT, TEXT, TEXT, TEXT, INTEGER, INTEGER, JSONB, INTEGER, INTEGER, INTEGER, INTEGER, INTEGER, JSONB
);

-- CREATE SECURE SERVER-AUTHORITATIVE RPG PROGRESSION PROCEDURAL FUNCTION
CREATE OR REPLACE FUNCTION public.process_rpg_progression_tx(
    p_user_id UUID,
    p_idempotency_key TEXT,
    p_event_type TEXT,
    p_title TEXT,
    p_category TEXT,
    p_duration_minutes INTEGER DEFAULT 0,
    p_target_id UUID DEFAULT NULL,
    p_metadata JSONB DEFAULT '{}'::jsonb
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_existing_log public.progression_audit_logs%ROWTYPE;
    v_profile public.profiles%ROWTYPE;
    v_habit public.habits%ROWTYPE;
    v_quest public.quests%ROWTYPE;
    v_reward public.rewards%ROWTYPE;
    
    v_last_date DATE;
    v_today_date DATE := CURRENT_DATE;
    v_streak INTEGER;
    v_streak_mult NUMERIC;
    v_base_rate NUMERIC;
    
    v_raw_xp NUMERIC;
    v_xp_awarded INTEGER := 0;
    v_gold_awarded INTEGER := 0;
    
    v_level_before INTEGER;
    v_level_after INTEGER;
    v_curr_xp INTEGER;
    v_tot_xp INTEGER;
    v_gold INTEGER;
    v_next_lvl_xp INTEGER;
    
    v_int_gain INTEGER := 0;
    v_str_gain INTEGER := 0;
    v_dex_gain INTEGER := 0;
    v_con_gain INTEGER := 0;
    v_cha_gain INTEGER := 0;
    
    v_int_mult NUMERIC := 1.0;
    v_str_mult NUMERIC := 1.0;
    v_dex_mult NUMERIC := 1.0;
    v_con_mult NUMERIC := 1.0;
    v_cha_mult NUMERIC := 1.0;
    
    v_attr public.user_attributes%ROWTYPE;
    v_attr_gain INTEGER;
    v_attr_next_xp INTEGER;
    v_attr_gains_summary JSONB := '{}'::jsonb;
    v_duration INTEGER;
BEGIN
    -- 1. STRICT AUTHENTICATION GUARD: Caller must be authenticated matching p_user_id
    IF auth.uid() IS NULL OR auth.uid() <> p_user_id THEN
        RAISE EXCEPTION 'Unauthorized: RPG progression can only be processed by the authenticated account owner.';
    END IF;

    -- 2. EVENT TYPE VALIDATION
    IF p_event_type NOT IN ('activity_logged', 'reading_milestone', 'habit_completed', 'quest_completed', 'reward_claimed') THEN
        RAISE EXCEPTION 'Invalid event_type: %', p_event_type;
    END IF;

    -- 3. IDEMPOTENCY LOCK: Check for existing idempotency key
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

    -- 4. READ AUTHORITATIVE PROFILE FROM DATABASE
    SELECT * INTO v_profile FROM public.profiles WHERE id = p_user_id FOR UPDATE;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Profile for user % not found.', p_user_id;
    END IF;

    v_level_before := v_profile.level;
    v_level_after := v_profile.level;
    v_curr_xp := v_profile.current_xp;
    v_tot_xp := v_profile.total_xp;
    v_gold := v_profile.gold;
    v_duration := LEAST(GREATEST(p_duration_minutes, 1), 480);

    -- 5. CALCULATE STREAK CONTINUITY & MULTIPLIER
    v_last_date := v_profile.last_active_at::date;
    IF v_last_date = v_today_date THEN
        v_streak := GREATEST(v_profile.streak_count, 1);
    ELSIF v_last_date = v_today_date - INTERVAL '1 day' THEN
        v_streak := v_profile.streak_count + 1;
    ELSE
        v_streak := 1;
    END IF;

    v_streak_mult := 1.0 + (LEAST(GREATEST(v_streak, 0), 30) * 0.05);

    -- 6. CLASS BONUS MULTIPLIERS
    IF v_profile.character_class = 'Polymath' THEN
        v_int_mult := 1.05; v_str_mult := 1.05; v_dex_mult := 1.05; v_con_mult := 1.05; v_cha_mult := 1.05;
    ELSIF v_profile.character_class = 'Code Mage' THEN
        v_dex_mult := 1.2; v_int_mult := 1.1;
    ELSIF v_profile.character_class = 'Cyber Scholar' THEN
        v_int_mult := 1.2; v_cha_mult := 1.1;
    ELSIF v_profile.character_class = 'Iron Athlete' THEN
        v_str_mult := 1.2; v_con_mult := 1.1;
    ELSIF v_profile.character_class = 'Discipline Monk' THEN
        v_con_mult := 1.2; v_dex_mult := 1.1;
    END IF;

    -- 7. EVENT SPECIFIC PROGRESSION LOGIC
    IF p_event_type IN ('activity_logged', 'reading_milestone') THEN
        -- Base rate determination
        IF p_category = 'coding' THEN v_base_rate := 2.5;
        ELSIF p_category = 'study' THEN v_base_rate := 2.2;
        ELSIF p_category = 'fitness' THEN v_base_rate := 3.0;
        ELSIF p_category = 'reading' THEN v_base_rate := 1.8;
        ELSIF p_category = 'habit' THEN v_base_rate := 2.5;
        ELSE v_base_rate := 2.0;
        END IF;

        v_raw_xp := v_duration * v_base_rate;
        v_xp_awarded := ROUND(v_raw_xp * v_streak_mult);
        v_gold_awarded := ROUND(v_xp_awarded * 0.35);

        -- Compute attribute gains based on category & duration
        IF p_category = 'coding' THEN
            v_dex_gain := ROUND(v_duration * 1.5 * v_dex_mult);
            v_int_gain := ROUND(v_duration * 1.0 * v_int_mult);
        ELSIF p_category = 'study' THEN
            v_int_gain := ROUND(v_duration * 1.8 * v_int_mult);
            v_con_gain := ROUND(v_duration * 0.7 * v_con_mult);
        ELSIF p_category = 'fitness' THEN
            v_str_gain := ROUND(v_duration * 2.0 * v_str_mult);
            v_con_gain := ROUND(v_duration * 1.0 * v_con_mult);
        ELSIF p_category = 'reading' THEN
            v_int_gain := ROUND(v_duration * 1.2 * v_int_mult);
            v_cha_gain := ROUND(v_duration * 0.8 * v_cha_mult);
        ELSIF p_category = 'habit' THEN
            v_con_gain := ROUND(v_duration * 2.0 * v_con_mult);
        ELSE
            v_con_gain := ROUND(v_duration * 1.0 * v_con_mult);
            v_int_gain := ROUND(v_duration * 0.5 * v_int_mult);
        END IF;

    ELSIF p_event_type = 'habit_completed' THEN
        IF p_target_id IS NOT NULL THEN
            SELECT * INTO v_habit FROM public.habits WHERE id = p_target_id AND user_id = p_user_id;
            IF FOUND THEN
                v_xp_awarded := v_habit.base_xp;
                v_gold_awarded := v_habit.base_gold;
                IF v_habit.attribute_target = 'INT' THEN v_int_gain := ROUND(v_habit.base_xp * v_int_mult);
                ELSIF v_habit.attribute_target = 'STR' THEN v_str_gain := ROUND(v_habit.base_xp * v_str_mult);
                ELSIF v_habit.attribute_target = 'DEX' THEN v_dex_gain := ROUND(v_habit.base_xp * v_dex_mult);
                ELSIF v_habit.attribute_target = 'CON' THEN v_con_gain := ROUND(v_habit.base_xp * v_con_mult);
                ELSIF v_habit.attribute_target = 'CHA' THEN v_cha_gain := ROUND(v_habit.base_xp * v_cha_mult);
                END IF;
            ELSE
                v_xp_awarded := 25; v_gold_awarded := 10; v_con_gain := ROUND(25 * v_con_mult);
            END IF;
        ELSE
            v_xp_awarded := 25; v_gold_awarded := 10; v_con_gain := ROUND(25 * v_con_mult);
        END IF;

    ELSIF p_event_type = 'quest_completed' THEN
        IF p_target_id IS NOT NULL THEN
            SELECT * INTO v_quest FROM public.quests WHERE id = p_target_id AND user_id = p_user_id;
            IF FOUND THEN
                v_xp_awarded := v_quest.xp_reward;
                v_gold_awarded := v_quest.gold_reward;
                IF v_quest.attribute_reward = 'INT' THEN v_int_gain := ROUND(v_quest.xp_reward * v_int_mult);
                ELSIF v_quest.attribute_reward = 'STR' THEN v_str_gain := ROUND(v_quest.xp_reward * v_str_mult);
                ELSIF v_quest.attribute_reward = 'DEX' THEN v_dex_gain := ROUND(v_quest.xp_reward * v_dex_mult);
                ELSIF v_quest.attribute_reward = 'CON' THEN v_con_gain := ROUND(v_quest.xp_reward * v_con_mult);
                ELSIF v_quest.attribute_reward = 'CHA' THEN v_cha_gain := ROUND(v_quest.xp_reward * v_cha_mult);
                END IF;
            ELSE
                v_xp_awarded := 50; v_gold_awarded := 25;
            END IF;
        ELSE
            v_xp_awarded := 50; v_gold_awarded := 25;
        END IF;

    ELSIF p_event_type = 'reward_claimed' THEN
        IF p_target_id IS NOT NULL THEN
            SELECT * INTO v_reward FROM public.rewards WHERE id = p_target_id AND user_id = p_user_id;
            IF FOUND THEN
                IF v_gold < v_reward.cost_gold THEN
                    RAISE EXCEPTION 'Insufficient gold: Required %, Available %', v_reward.cost_gold, v_gold;
                END IF;
                v_xp_awarded := 0;
                v_gold_awarded := -v_reward.cost_gold;
            ELSE
                RAISE EXCEPTION 'Reward record not found.';
            END IF;
        ELSE
            RAISE EXCEPTION 'Reward ID target required.';
        END IF;
    END IF;

    -- 8. CHARACTER NON-LINEAR LEVEL CALCULATION
    v_curr_xp := v_curr_xp + v_xp_awarded;
    v_tot_xp := v_tot_xp + v_xp_awarded;
    v_gold := GREATEST(v_gold + v_gold_awarded, 0);

    -- Formula: 100 * (level ^ 1.35)
    v_next_lvl_xp := FLOOR(100.0 * POWER(v_level_after, 1.35));
    WHILE v_curr_xp >= v_next_lvl_xp LOOP
        v_curr_xp := v_curr_xp - v_next_lvl_xp;
        v_level_after := v_level_after + 1;
        v_next_lvl_xp := FLOOR(100.0 * POWER(v_level_after, 1.35));
    END LOOP;

    -- 9. SET BYPASS GUARD AND UPDATE PROFILES TABLE
    PERFORM set_config('dayvern.bypass_progression_guard', 'true', true);

    UPDATE public.profiles
    SET
        level = v_level_after,
        current_xp = v_curr_xp,
        total_xp = v_tot_xp,
        gold = v_gold,
        streak_count = v_streak,
        last_active_at = NOW(),
        updated_at = NOW()
    WHERE id = p_user_id;

    -- 10. ATTRIBUTE NON-LINEAR LEVEL UP CALCULATIONS & UPDATES
    v_attr_gains_summary := jsonb_build_object(
        'INT', v_int_gain,
        'STR', v_str_gain,
        'DEX', v_dex_gain,
        'CON', v_con_gain,
        'CHA', v_cha_gain
    );

    FOR v_attr IN SELECT * FROM public.user_attributes WHERE user_id = p_user_id
    LOOP
        v_attr_gain := 0;
        IF v_attr.attribute_type = 'INT' THEN v_attr_gain := v_int_gain;
        ELSIF v_attr.attribute_type = 'STR' THEN v_attr_gain := v_str_gain;
        ELSIF v_attr.attribute_type = 'DEX' THEN v_attr_gain := v_dex_gain;
        ELSIF v_attr.attribute_type = 'CON' THEN v_attr_gain := v_con_gain;
        ELSIF v_attr.attribute_type = 'CHA' THEN v_attr_gain := v_cha_gain;
        END IF;

        IF v_attr_gain > 0 THEN
            v_attr.current_xp := v_attr.current_xp + v_attr_gain;
            v_attr.total_xp := v_attr.total_xp + v_attr_gain;
            v_attr_next_xp := FLOOR(50.0 * POWER(v_attr.level, 1.25));

            WHILE v_attr.current_xp >= v_attr_next_xp LOOP
                v_attr.current_xp := v_attr.current_xp - v_attr_next_xp;
                v_attr.level := v_attr.level + 1;
                v_attr_next_xp := FLOOR(50.0 * POWER(v_attr.level, 1.25));
            END LOOP;

            UPDATE public.user_attributes
            SET
                level = v_attr.level,
                current_xp = v_attr.current_xp,
                total_xp = v_attr.total_xp
            WHERE id = v_attr.id;
        END IF;
    END LOOP;

    -- 11. INSERT IMMUTABLE PROGRESSION AUDIT RECORD
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
        v_xp_awarded,
        v_gold_awarded,
        v_attr_gains_summary,
        v_level_before,
        v_level_after,
        v_streak,
        p_metadata
    );

    RETURN jsonb_build_object(
        'status', 'success',
        'idempotency_key', p_idempotency_key,
        'xp_awarded', v_xp_awarded,
        'gold_awarded', v_gold_awarded,
        'level_after', v_level_after,
        'streak_count', v_streak
    );
END;
$$;

-- REVOKE AND GRANT PRIVILEGES SAFELY
REVOKE EXECUTE ON FUNCTION public.process_rpg_progression_tx(
    UUID, TEXT, TEXT, TEXT, TEXT, INTEGER, UUID, JSONB
) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.process_rpg_progression_tx(
    UUID, TEXT, TEXT, TEXT, TEXT, INTEGER, UUID, JSONB
) TO authenticated;
