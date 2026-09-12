import { AttributeType, ActivityCategory, CharacterClass } from '@/types/database';

/**
 * Centralized RPG Progression System Configuration
 * Tune non-linear curves, exponents, and reward multipliers here without touching application logic.
 */
export const PROGRESSION_CONFIG = {
  // Non-linear level formula parameters: XP = Base * (Level ^ Exponent)
  CHARACTER_LEVEL_BASE_XP: 100,
  CHARACTER_LEVEL_EXPONENT: 1.35,

  ATTRIBUTE_LEVEL_BASE_XP: 50,
  ATTRIBUTE_LEVEL_EXPONENT: 1.25,

  // Streak Multiplier configuration
  STREAK_BONUS_PER_DAY: 0.05, // 5% per day
  STREAK_MAX_DAYS: 30,         // Max 150% bonus (2.5x total)

  // Gold earnings ratio relative to XP earned
  GOLD_CONVERSION_RATIO: 0.35,

  // Reading anti-farm parameters
  MIN_READING_SECONDS_PER_PARAGRAPH: 3,

  // Base XP rates per minute for activity categories
  BASE_RATES: {
    coding: 2.5,   // Primary DEX, Secondary INT
    study: 2.2,    // Primary INT, Secondary CON
    fitness: 3.0,  // Primary STR, Secondary CON
    reading: 1.8,  // Primary INT, Secondary CHA
    habit: 2.5,    // Primary CON
    custom: 2.0,   // Primary CON, Secondary INT
  } as Record<ActivityCategory, number>,
};

/**
 * Non-linear XP curve for character levels.
 * Formula: 100 * (level ^ 1.35)
 */
export function getCharacterNextLevelXp(level: number): number {
  return Math.floor(
    PROGRESSION_CONFIG.CHARACTER_LEVEL_BASE_XP *
      Math.pow(level, PROGRESSION_CONFIG.CHARACTER_LEVEL_EXPONENT)
  );
}

/**
 * Non-linear XP curve for attribute levels.
 * Formula: 50 * (level ^ 1.25)
 */
export function getAttributeNextLevelXp(level: number): number {
  return Math.floor(
    PROGRESSION_CONFIG.ATTRIBUTE_LEVEL_BASE_XP *
      Math.pow(level, PROGRESSION_CONFIG.ATTRIBUTE_LEVEL_EXPONENT)
  );
}

/**
 * Calculates current streak multiplier bonus.
 * Up to 30 days: 1 + (streak * 0.05). Max 2.5x.
 */
export function calculateStreakMultiplier(streakCount: number): number {
  const cappedDays = Math.min(Math.max(streakCount, 0), PROGRESSION_CONFIG.STREAK_MAX_DAYS);
  return 1 + cappedDays * PROGRESSION_CONFIG.STREAK_BONUS_PER_DAY;
}

/**
 * Class specific attribute gain bonuses.
 */
export function getClassBonusMultiplier(
  attributeType: AttributeType,
  characterClass: CharacterClass = 'Polymath'
): number {
  if (characterClass === 'Polymath') return 1.05; // +5% ALL
  if (characterClass === 'Code Mage' && attributeType === 'DEX') return 1.2;
  if (characterClass === 'Cyber Scholar' && attributeType === 'INT') return 1.2;
  if (characterClass === 'Iron Athlete' && attributeType === 'STR') return 1.2;
  if (characterClass === 'Discipline Monk' && attributeType === 'CON') return 1.2;
  return 1.0;
}
