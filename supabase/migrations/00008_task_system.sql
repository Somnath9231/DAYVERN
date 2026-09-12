-- DAYVERN Migration 00008: User Tasks & Scheduled Activities System
-- Enables user-created tasks, recurring tasks, and secure task completion

CREATE TABLE IF NOT EXISTS public.user_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    task_type TEXT NOT NULL DEFAULT 'task' CHECK (task_type IN ('task', 'workout', 'habit')),
    due_date DATE NOT NULL DEFAULT CURRENT_DATE,
    due_time TIME,
    recurrence_rule TEXT NOT NULL DEFAULT 'none' CHECK (recurrence_rule IN ('none', 'daily', 'weekdays', 'weekly', 'monthly')),
    priority TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('normal', 'high', 'urgent')),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed')),
    completed_at TIMESTAMPTZ,
    xp_reward INTEGER NOT NULL DEFAULT 50,
    gold_reward INTEGER NOT NULL DEFAULT 10,
    linked_habit_id UUID REFERENCES public.habits(id) ON DELETE SET NULL,
    linked_workout_type TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_user_tasks_lookup ON public.user_tasks(user_id, due_date, status);
CREATE INDEX IF NOT EXISTS idx_user_tasks_type ON public.user_tasks(user_id, task_type);

-- Enable RLS
ALTER TABLE public.user_tasks ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "Users can view their own tasks" ON public.user_tasks;
CREATE POLICY "Users can view their own tasks"
    ON public.user_tasks FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create their own tasks" ON public.user_tasks;
CREATE POLICY "Users can create their own tasks"
    ON public.user_tasks FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own tasks" ON public.user_tasks;
CREATE POLICY "Users can update their own tasks"
    ON public.user_tasks FOR UPDATE
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own tasks" ON public.user_tasks;
CREATE POLICY "Users can delete their own tasks"
    ON public.user_tasks FOR DELETE
    USING (auth.uid() = user_id);

-- RPC: Complete User Task securely
CREATE OR REPLACE FUNCTION public.complete_user_task(
    p_task_id UUID,
    p_idempotency_key TEXT DEFAULT NULL
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_user_id UUID := auth.uid();
    v_task public.user_tasks%ROWTYPE;
    v_idempotency TEXT;
    v_next_due_date DATE;
    v_rpg_result JSONB;
BEGIN
    -- 1. Authentication check
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Unauthorized: User must be authenticated to complete tasks.';
    END IF;

    -- 2. Fetch task row with lock
    SELECT * INTO v_task 
    FROM public.user_tasks 
    WHERE id = p_task_id AND user_id = v_user_id 
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Task not found or access denied.';
    END IF;

    -- 3. Idempotency & Status check
    IF v_task.status = 'completed' THEN
        RETURN jsonb_build_object(
            'status', 'already_completed',
            'task_id', p_task_id,
            'completed_at', v_task.completed_at
        );
    END IF;

    -- Generate idempotency key if not provided
    v_idempotency := COALESCE(p_idempotency_key, 'task_complete_' || p_task_id || '_' || EXTRACT(EPOCH FROM NOW())::text);

    -- 4. Mark current task as completed
    UPDATE public.user_tasks
    SET status = 'completed',
        completed_at = NOW(),
        updated_at = NOW()
    WHERE id = p_task_id;

    -- 5. Process RPG Progression via existing secure server transaction
    v_rpg_result := public.process_rpg_progression_tx(
        p_user_id := v_user_id,
        p_idempotency_key := v_idempotency,
        p_event_type := 'quest_completed',
        p_title := v_task.title,
        p_category := COALESCE(v_task.task_type, 'study'),
        p_duration_minutes := 15,
        p_target_id := p_task_id
    );

    -- 6. Spawn Next Recurring Task Occurrence if applicable
    IF v_task.recurrence_rule <> 'none' THEN
        IF v_task.recurrence_rule = 'daily' THEN
            v_next_due_date := v_task.due_date + INTERVAL '1 day';
        ELSIF v_task.recurrence_rule = 'weekdays' THEN
            v_next_due_date := v_task.due_date + INTERVAL '1 day';
            -- Skip Saturday (6) and Sunday (0)
            IF EXTRACT(ISODOW FROM v_next_due_date) = 6 THEN
                v_next_due_date := v_next_due_date + INTERVAL '2 days';
            ELSIF EXTRACT(ISODOW FROM v_next_due_date) = 7 THEN
                v_next_due_date := v_next_due_date + INTERVAL '1 day';
            END IF;
        ELSIF v_task.recurrence_rule = 'weekly' THEN
            v_next_due_date := v_task.due_date + INTERVAL '1 week';
        ELSIF v_task.recurrence_rule = 'monthly' THEN
            v_next_due_date := v_task.due_date + INTERVAL '1 month';
        END IF;

        IF v_next_due_date IS NOT NULL THEN
            INSERT INTO public.user_tasks (
                user_id,
                title,
                description,
                task_type,
                due_date,
                due_time,
                recurrence_rule,
                priority,
                xp_reward,
                gold_reward,
                linked_habit_id,
                linked_workout_type
            ) VALUES (
                v_user_id,
                v_task.title,
                v_task.description,
                v_task.task_type,
                v_next_due_date,
                v_task.due_time,
                v_task.recurrence_rule,
                v_task.priority,
                v_task.xp_reward,
                v_task.gold_reward,
                v_task.linked_habit_id,
                v_task.linked_workout_type
            );
        END IF;
    END IF;

    RETURN jsonb_build_object(
        'status', 'success',
        'task_id', p_task_id,
        'rpg_result', v_rpg_result
    );
END;
$$;
