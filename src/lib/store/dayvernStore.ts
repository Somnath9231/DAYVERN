'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  Profile, 
  UserAttribute, 
  Activity, 
  Habit, 
  Quest, 
  QuestStatus,
  Achievement, 
  Reward, 
  AttributeType, 
  ActivityCategory,
  CharacterClass,
  UserTask,
  TaskType,
  RecurrenceRule,
  TaskPriority
} from '@/types/database';
import { processActivityProgression, AuditLogRecord } from '@/lib/rpg/progressionService';
import { createClient } from '@/lib/supabase/client';

export interface DayvernState {
  profile: Profile;
  attributes: UserAttribute[];
  activities: Activity[];
  habits: Habit[];
  quests: Quest[];
  tasks: UserTask[];
  achievements: Achievement[];
  rewards: Reward[];
  auditLogs: AuditLogRecord[];
  loading: boolean;
  error: string | null;
}

const DEFAULT_PROFILE: Profile = {
  id: '',
  username: 'Player',
  display_name: 'Player',
  character_class: 'Polymath',
  avatar_url: null,
  level: 1,
  current_xp: 0,
  total_xp: 0,
  gold: 50,
  streak_count: 0,
  is_admin: false,
  last_active_at: new Date().toISOString(),
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

export function useDayvernStore() {
  const [state, setState] = useState<DayvernState>({
    profile: DEFAULT_PROFILE,
    attributes: [],
    activities: [],
    habits: [],
    quests: [],
    tasks: [],
    achievements: [],
    rewards: [],
    auditLogs: [],
    loading: true,
    error: null,
  });

  const [lastNotification, setLastNotification] = useState<{
    title: string;
    message: string;
    type: 'xp' | 'level' | 'gold' | 'achievement';
  } | null>(null);

  // Fetch all RPG state from Supabase for authenticated user
  const fetchRpgData = useCallback(async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      setState((prev) => ({ ...prev, loading: false }));
      return;
    }

    try {
      const todayStr = new Date().toISOString().slice(0, 10);

      // Execute independent Supabase queries in parallel for high-performance load times
      const [
        profileRes,
        attrRes,
        actRes,
        habitRes,
        todayLogsRes,
        questRes,
        staticAchRes,
        unlockedAchRes,
        taskRes,
        rewardRes,
        auditRes
      ] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', user.id).maybeSingle(),
        supabase.from('user_attributes').select('*').eq('user_id', user.id),
        supabase.from('activities').select('*').eq('user_id', user.id).order('performed_at', { ascending: false }),
        supabase.from('habits').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
        supabase.from('habit_logs').select('*').eq('user_id', user.id).eq('completed_date', todayStr),
        supabase.from('quests').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
        supabase.from('achievements').select('*'),
        supabase.from('user_achievements').select('*').eq('user_id', user.id),
        supabase.from('user_tasks').select('*').eq('user_id', user.id).order('due_date', { ascending: true }).order('created_at', { ascending: false }),
        supabase.from('rewards').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
        supabase.from('progression_audit_logs').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
      ]);

      // 1. Process Profile
      let profileData = profileRes.data;
      if (!profileData) {
        const username = user.user_metadata?.username || user.email?.split('@')[0] || 'Player';
        const displayName = user.user_metadata?.display_name || user.email?.split('@')[0] || 'Player';
        const characterClass = user.user_metadata?.character_class || 'Polymath';

        const { data: newProf } = await supabase
          .from('profiles')
          .insert({
            id: user.id,
            username,
            display_name: displayName,
            character_class: characterClass,
            is_admin: false,
          })
          .select()
          .single();

        profileData = newProf || { ...DEFAULT_PROFILE, id: user.id, username, display_name: displayName };
      }

      // 2. Process Attributes
      let attrData = attrRes.data || [];
      const requiredTypes: AttributeType[] = ['INT', 'STR', 'DEX', 'CON', 'CHA'];
      const existingTypes = new Set(attrData.map((a) => a.attribute_type));
      const missingTypes = requiredTypes.filter((t) => !existingTypes.has(t));

      if (missingTypes.length > 0) {
        const toInsert = missingTypes.map((t) => ({
          user_id: user.id,
          attribute_type: t,
          level: 1,
          current_xp: 0,
          total_xp: 0,
        }));
        await supabase.from('user_attributes').insert(toInsert);
        const { data: refetchedAttrs } = await supabase
          .from('user_attributes')
          .select('*')
          .eq('user_id', user.id);
        attrData = refetchedAttrs || attrData;
      }

      // 3. Process Habits & Completed Status
      const completedHabitIds = new Set(todayLogsRes.data?.map((l) => l.habit_id) || []);
      const habitsWithStatus: Habit[] = (habitRes.data || []).map((h) => ({
        ...h,
        completed_today: completedHabitIds.has(h.id),
      }));

      // 4. Process Achievements
      const unlockedMap = new Map(unlockedAchRes.data?.map((u) => [u.achievement_id, u.unlocked_at]) || []);
      const combinedAchievements: Achievement[] = (staticAchRes.data || []).map((ach) => ({
        ...ach,
        unlocked: unlockedMap.has(ach.id),
        unlocked_at: unlockedMap.get(ach.id),
      }));

      setState({
        profile: profileData || DEFAULT_PROFILE,
        attributes: attrData,
        activities: actRes.data || [],
        habits: habitsWithStatus,
        quests: questRes.data || [],
        tasks: taskRes.data || [],
        achievements: combinedAchievements,
        rewards: rewardRes.data || [],
        auditLogs: auditRes.data || [],
        loading: false,
        error: null,
      });
    } catch (err: any) {
      console.error('Error loading Supabase RPG data:', err);
      setState((prev) => ({
        ...prev,
        loading: false,
        error: err?.message || 'Failed to load RPG data from database.',
      }));
    }
  }, []);

  // Subscribe to auth state changes and initial mount
  useEffect(() => {
    fetchRpgData();

    const supabase = createClient();
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      fetchRpgData();
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchRpgData]);

  // Log activity and submit raw inputs to server-authoritative RPC procedure
  const logActivity = async (
    title: string,
    category: ActivityCategory,
    durationMinutes: number,
    notes?: string,
    idempotencyKeyInput?: string
  ) => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const idempotencyKey = idempotencyKeyInput || `idemp_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

    // Client-side display calculation (for UI feedback preview)
    const progResult = processActivityProgression(state.profile, state.attributes, {
      idempotencyKey,
      title,
      category,
      durationMinutes,
      notes,
    });

    // 1. Insert Activity Record in Supabase
    const { data: insertedAct, error: actErr } = await supabase
      .from('activities')
      .insert({
        user_id: user.id,
        title,
        category,
        duration_minutes: durationMinutes,
        xp_earned: progResult.xpAwarded,
        attribute_gains: progResult.auditRecord.attribute_gains,
        notes: notes || null,
        performed_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (actErr) {
      console.error('Error inserting activity record:', actErr);
    }

    // 2. Execute Server-Authoritative RPC (Server calculates XP, Gold, Levels, and Attributes)
    const { error: rpcErr } = await supabase.rpc('process_rpg_progression_tx', {
      p_user_id: user.id,
      p_idempotency_key: idempotencyKey,
      p_event_type: 'activity_logged',
      p_title: title,
      p_category: category,
      p_duration_minutes: durationMinutes,
      p_target_id: insertedAct?.id || null,
      p_metadata: { activity_id: insertedAct?.id || null },
    });

    if (rpcErr) {
      console.error('RPC Progression Error:', rpcErr);
    }

    // 3. Update Matching Active Quests
    const matchingQuests = state.quests.filter((q) => q.status === 'active' && q.category === category);
    for (const q of matchingQuests) {
      const nextCount = q.current_count + durationMinutes;
      const isCompleted = nextCount >= q.target_count;
      const newStatus: QuestStatus = isCompleted ? 'completed' : 'active';

      await supabase
        .from('quests')
        .update({
          current_count: Math.min(nextCount, q.target_count),
          status: newStatus,
        })
        .eq('id', q.id)
        .eq('user_id', user.id);

      // If quest completed, trigger server-authoritative quest reward RPC
      if (isCompleted) {
        const questIdemp = `idemp_quest_${q.id}_${Date.now()}`;

        await supabase.rpc('process_rpg_progression_tx', {
          p_user_id: user.id,
          p_idempotency_key: questIdemp,
          p_event_type: 'quest_completed',
          p_title: `Completed Quest: ${q.title}`,
          p_category: q.category,
          p_duration_minutes: 0,
          p_target_id: q.id,
          p_metadata: { quest_id: q.id },
        });
      }
    }

    // 4. Refresh authoritative state from Supabase
    await fetchRpgData();

    if (progResult.leveledUp) {
      setLastNotification({
        title: 'LEVEL UP!',
        message: `Congratulations! You reached Level ${progResult.levelAfter}!`,
        type: 'level',
      });
    } else {
      setLastNotification({
        title: 'Activity Logged!',
        message: `+${progResult.xpAwarded} XP | +${progResult.goldAwarded} Gold earned`,
        type: 'xp',
      });
    }
  };

  // Toggle habit and log daily record
  const toggleHabit = async (habitId: string) => {
    const habit = state.habits.find((h) => h.id === habitId);
    if (!habit) return;

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const isCompleting = !habit.completed_today;
    const todayStr = new Date().toISOString().slice(0, 10);

    if (isCompleting) {
      // Insert habit log
      await supabase.from('habit_logs').insert({
        habit_id: habitId,
        user_id: user.id,
        completed_date: todayStr,
        xp_earned: habit.base_xp,
        gold_earned: habit.base_gold,
      });

      // Increment habit streak
      const newStreak = habit.streak_count + 1;
      await supabase
        .from('habits')
        .update({ streak_count: newStreak })
        .eq('id', habitId)
        .eq('user_id', user.id);

      // Execute Server-Authoritative RPC procedure for habit reward
      const idemp = `idemp_habit_${habitId}_${todayStr}`;
      await supabase.rpc('process_rpg_progression_tx', {
        p_user_id: user.id,
        p_idempotency_key: idemp,
        p_event_type: 'habit_completed',
        p_title: `Habit Completed: ${habit.title}`,
        p_category: habit.category,
        p_duration_minutes: 0,
        p_target_id: habitId,
        p_metadata: { habit_id: habitId },
      });

      setLastNotification({
        title: 'Habit Completed!',
        message: `${habit.title}: +${habit.base_xp} XP & +${habit.base_gold} Gold!`,
        type: 'xp',
      });
    } else {
      // Un-complete habit log
      await supabase
        .from('habit_logs')
        .delete()
        .eq('habit_id', habitId)
        .eq('user_id', user.id)
        .eq('completed_date', todayStr);

      const newStreak = Math.max(habit.streak_count - 1, 0);
      await supabase
        .from('habits')
        .update({ streak_count: newStreak })
        .eq('id', habitId)
        .eq('user_id', user.id);
    }

    await fetchRpgData();
  };

  // Add new user habit
  const addHabit = async (
    title: string,
    description: string,
    category: string,
    attributeTarget: AttributeType,
    baseXp: number,
    baseGold: number
  ) => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from('habits').insert({
      user_id: user.id,
      title,
      description: description || null,
      category: category || 'discipline',
      attribute_target: attributeTarget,
      base_xp: baseXp,
      base_gold: baseGold,
      streak_count: 0,
      frequency: 'daily',
      active: true,
    });

    await fetchRpgData();
  };

  // Claim shop reward securely
  const claimReward = async (rewardId: string) => {
    const reward = state.rewards.find((r) => r.id === rewardId);
    if (!reward || reward.is_claimed) return;

    if (state.profile.gold < reward.cost_gold) {
      setLastNotification({
        title: 'Insufficient Gold!',
        message: `You need ${reward.cost_gold - state.profile.gold} more Gold to unlock "${reward.title}"`,
        type: 'gold',
      });
      return;
    }

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Deduct gold and mark reward claimed via Server-Authoritative RPC procedure
    const idemp = `idemp_reward_${rewardId}_${Date.now()}`;
    const { error: rpcErr } = await supabase.rpc('process_rpg_progression_tx', {
      p_user_id: user.id,
      p_idempotency_key: idemp,
      p_event_type: 'reward_claimed',
      p_title: `Unlocked Reward: ${reward.title}`,
      p_category: 'reward',
      p_duration_minutes: 0,
      p_target_id: rewardId,
      p_metadata: { reward_id: rewardId },
    });

    if (rpcErr) {
      console.error('Reward claim error:', rpcErr);
      return;
    }

    await fetchRpgData();

    setLastNotification({
      title: 'Reward Unlocked!',
      message: `Enjoy your reward: "${reward.title}"!`,
      type: 'gold',
    });
  };

  // Create custom user shop reward
  const createReward = async (title: string, description: string, costGold: number) => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from('rewards').insert({
      user_id: user.id,
      title,
      description: description || null,
      cost_gold: costGold,
      is_claimed: false,
    });

    await fetchRpgData();
  };

  // Update primary character class spec
  const updateCharacterClass = async (newClass: CharacterClass) => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase
      .from('profiles')
      .update({ character_class: newClass, updated_at: new Date().toISOString() })
      .eq('id', user.id);

    await fetchRpgData();
  };

  // Add new user task
  const addTask = async (
    title: string,
    description?: string,
    taskType: TaskType = 'task',
    dueDate?: string,
    dueTime?: string,
    recurrenceRule: RecurrenceRule = 'none',
    priority: TaskPriority = 'normal',
    linkedHabitId?: string,
    linkedWorkoutType?: string,
    linkedBookId?: string
  ) => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const todayStr = new Date().toISOString().slice(0, 10);
    const xpReward = taskType === 'workout' ? 100 : taskType === 'habit' ? 25 : priority === 'urgent' ? 100 : priority === 'high' ? 75 : 50;
    const goldReward = taskType === 'workout' ? 25 : taskType === 'habit' ? 10 : priority === 'urgent' ? 20 : priority === 'high' ? 15 : 10;

    await supabase.from('user_tasks').insert({
      user_id: user.id,
      title: title.trim(),
      description: description?.trim() || null,
      task_type: taskType,
      due_date: dueDate || todayStr,
      due_time: dueTime || null,
      recurrence_rule: recurrenceRule,
      priority,
      status: 'pending',
      xp_reward: xpReward,
      gold_reward: goldReward,
      linked_habit_id: linkedHabitId || null,
      linked_workout_type: linkedWorkoutType || null,
      linked_book_id: linkedBookId || null,
    });

    await fetchRpgData();
  };

  // Complete user task via server-authoritative RPC
  const completeTask = async (taskId: string) => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const idempotencyKey = `task_complete_${taskId}_${Date.now()}`;

    const { data, error } = await supabase.rpc('complete_user_task', {
      p_task_id: taskId,
      p_idempotency_key: idempotencyKey,
    });

    if (error) {
      console.error('Error completing task via RPC:', error);
      return null;
    }

    await fetchRpgData();

    if (data?.status === 'success') {
      const rpgResult = data.rpg_result;
      setLastNotification({
        title: 'Task Completed! 🎯',
        message: `Awarded +${rpgResult?.xp_awarded || 50} XP & +${rpgResult?.gold_awarded || 10} Gold`,
        type: 'xp',
      });
      return rpgResult;
    }

    return null;
  };

  // Edit existing task
  const editTask = async (taskId: string, updates: Partial<UserTask>) => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase
      .from('user_tasks')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', taskId)
      .eq('user_id', user.id);

    await fetchRpgData();
  };

  // Delete task
  const deleteTask = async (taskId: string) => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase
      .from('user_tasks')
      .delete()
      .eq('id', taskId)
      .eq('user_id', user.id);

    await fetchRpgData();
  };

  // Helper: Schedule Workout Task
  const scheduleWorkoutTask = async (
    workoutType: string,
    dueDate?: string,
    dueTime?: string,
    recurrence: RecurrenceRule = 'none'
  ) => {
    await addTask(
      workoutType,
      `Scheduled ${workoutType} workout session`,
      'workout',
      dueDate,
      dueTime,
      recurrence,
      'normal',
      undefined,
      workoutType
    );
  };

  return {
    state,
    logActivity,
    toggleHabit,
    addHabit,
    addTask,
    completeTask,
    editTask,
    deleteTask,
    scheduleWorkoutTask,
    claimReward,
    createReward,
    updateCharacterClass,
    lastNotification,
    clearNotification: () => setLastNotification(null),
  };
}

