import { 
  Profile, 
  UserAttribute, 
  ActivityCategory, 
  AttributeType, 
  CharacterClass 
} from '@/types/database';
import { 
  PROGRESSION_CONFIG, 
  getCharacterNextLevelXp, 
  getAttributeNextLevelXp, 
  calculateStreakMultiplier,
  getClassBonusMultiplier 
} from './config';

export interface AuditLogRecord {
  id: string;
  user_id: string;
  idempotency_key: string;
  event_type: 'activity_logged' | 'reading_milestone' | 'habit_completed' | 'quest_completed' | 'reward_claimed';
  title: string;
  category?: ActivityCategory | string;
  xp_awarded: number;
  gold_awarded: number;
  attribute_gains: Record<AttributeType, number>;
  level_before: number;
  level_after: number;
  streak_count: number;
  metadata?: Record<string, any>;
  created_at: string;
}

export interface ProgressionResult {
  status: 'success' | 'idempotent_cached';
  idempotencyKey: string;
  xpAwarded: number;
  goldAwarded: number;
  levelBefore: number;
  levelAfter: number;
  leveledUp: boolean;
  newStreakCount: number;
  updatedProfile: Profile;
  updatedAttributes: UserAttribute[];
  auditRecord: AuditLogRecord;
}

/**
 * Validates and updates daily streak continuity based on last active timestamp.
 */
export function evaluateStreakContinuity(lastActiveAt: string, currentStreak: number): number {
  const now = new Date();
  const lastActive = new Date(lastActiveAt);

  // Normalize dates to YYYY-MM-DD
  const nowDateStr = now.toISOString().slice(0, 10);
  const lastDateStr = lastActive.toISOString().slice(0, 10);

  if (nowDateStr === lastDateStr) {
    return Math.max(currentStreak, 1);
  }

  const diffTime = Math.abs(now.getTime() - lastActive.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays <= 1) {
    return currentStreak + 1;
  }

  // Missed more than 1 day
  return 1;
}

/**
 * TRUSTED SERVER PROGRESSION FORMULA CALCULATOR
 * Calculates prospective XP, Attributes, Level-ups, Gold, and Streaks based on rules.
 * Database procedure process_rpg_progression_tx remains authoritative for persistence.
 */
export function processActivityProgression(
  profile: Profile,
  attributes: UserAttribute[],
  payload: {
    idempotencyKey: string;
    title: string;
    category: ActivityCategory;
    durationMinutes: number;
    notes?: string;
  }
): ProgressionResult {
  // 1. Input Validation
  const duration = Math.min(Math.max(payload.durationMinutes, 1), 480);
  const streak = evaluateStreakContinuity(profile.last_active_at, profile.streak_count);
  const streakMult = calculateStreakMultiplier(streak);
  const baseRate = PROGRESSION_CONFIG.BASE_RATES[payload.category] || 2.0;

  // 2. Compute XP & Gold
  const rawXp = duration * baseRate;
  const xpEarned = Math.round(rawXp * streakMult);
  const goldEarned = Math.round(xpEarned * PROGRESSION_CONFIG.GOLD_CONVERSION_RATIO);

  // 3. Compute Attribute Gains
  const attributeGains: Record<AttributeType, number> = {
    INT: 0,
    STR: 0,
    DEX: 0,
    CON: 0,
    CHA: 0,
  };

  switch (payload.category) {
    case 'coding':
      attributeGains.DEX = Math.round(duration * 1.5 * getClassBonusMultiplier('DEX', profile.character_class));
      attributeGains.INT = Math.round(duration * 1.0 * getClassBonusMultiplier('INT', profile.character_class));
      break;
    case 'study':
      attributeGains.INT = Math.round(duration * 1.8 * getClassBonusMultiplier('INT', profile.character_class));
      attributeGains.CON = Math.round(duration * 0.7 * getClassBonusMultiplier('CON', profile.character_class));
      break;
    case 'fitness':
      attributeGains.STR = Math.round(duration * 2.0 * getClassBonusMultiplier('STR', profile.character_class));
      attributeGains.CON = Math.round(duration * 1.0 * getClassBonusMultiplier('CON', profile.character_class));
      break;
    case 'reading':
      attributeGains.INT = Math.round(duration * 1.2 * getClassBonusMultiplier('INT', profile.character_class));
      attributeGains.CHA = Math.round(duration * 0.8 * getClassBonusMultiplier('CHA', profile.character_class));
      break;
    case 'habit':
      attributeGains.CON = Math.round(duration * 2.0 * getClassBonusMultiplier('CON', profile.character_class));
      break;
    default:
      attributeGains.CON = Math.round(duration * 1.0 * getClassBonusMultiplier('CON', profile.character_class));
      attributeGains.INT = Math.round(duration * 0.5 * getClassBonusMultiplier('INT', profile.character_class));
      break;
  }

  // 4. Non-Linear Level Up Processing for Profile
  let level = profile.level;
  let currentXp = profile.current_xp + xpEarned;
  let totalXp = profile.total_xp + xpEarned;
  const levelBefore = profile.level;

  while (currentXp >= getCharacterNextLevelXp(level)) {
    currentXp -= getCharacterNextLevelXp(level);
    level += 1;
  }

  // 5. Non-Linear Level Up Processing for Attributes
  const updatedAttributes = attributes.map((attr) => {
    const gain = attributeGains[attr.attribute_type] || 0;
    if (gain <= 0) return attr;

    let attrLvl = attr.level;
    let attrXp = attr.current_xp + gain;
    const attrTotal = attr.total_xp + gain;

    while (attrXp >= getAttributeNextLevelXp(attrLvl)) {
      attrXp -= getAttributeNextLevelXp(attrLvl);
      attrLvl += 1;
    }

    return {
      ...attr,
      level: attrLvl,
      current_xp: attrXp,
      total_xp: attrTotal,
    };
  });

  const updatedProfile: Profile = {
    ...profile,
    level,
    current_xp: currentXp,
    total_xp: totalXp,
    gold: profile.gold + goldEarned,
    streak_count: streak,
    last_active_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  // 6. Audit Record Structure Creation
  const auditRecord: AuditLogRecord = {
    id: `log_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    user_id: profile.id,
    idempotency_key: payload.idempotencyKey,
    event_type: 'activity_logged',
    title: payload.title,
    category: payload.category,
    xp_awarded: xpEarned,
    gold_awarded: goldEarned,
    attribute_gains: attributeGains,
    level_before: levelBefore,
    level_after: level,
    streak_count: streak,
    created_at: new Date().toISOString(),
  };

  return {
    status: 'success',
    idempotencyKey: payload.idempotencyKey,
    xpAwarded: xpEarned,
    goldAwarded: goldEarned,
    levelBefore,
    levelAfter: level,
    leveledUp: level > levelBefore,
    newStreakCount: streak,
    updatedProfile,
    updatedAttributes,
    auditRecord,
  };
}
