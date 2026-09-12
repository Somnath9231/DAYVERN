import { AttributeType, ActivityCategory, CharacterClass } from '@/types/database';

/**
 * Calculates XP required to reach the next character level.
 * Formula: 100 * (level ^ 1.35)
 */
export function getXpForNextLevel(level: number): number {
  return Math.floor(100 * Math.pow(level, 1.35));
}

/**
 * Calculates XP required to reach the next attribute level.
 * Formula: 50 * (level ^ 1.25)
 */
export function getAttributeXpForNextLevel(level: number): number {
  return Math.floor(50 * Math.pow(level, 1.25));
}

/**
 * Calculates streak multiplier bonus.
 * Up to 30 days: 5% bonus per streak day. Max +150% (2.5x).
 */
export function getStreakMultiplier(streakCount: number): number {
  const cappedStreak = Math.min(Math.max(streakCount, 0), 30);
  return 1 + cappedStreak * 0.05;
}

export interface ActivityXpResult {
  totalXp: number;
  goldEarned: number;
  attributeGains: Record<AttributeType, number>;
}

/**
 * Calculates total XP, Gold, and Attribute gains for a logged activity.
 */
export function calculateActivityGain(
  category: ActivityCategory,
  durationMinutes: number,
  streakCount: number = 0,
  characterClass: CharacterClass = 'Polymath'
): ActivityXpResult {
  const streakMult = getStreakMultiplier(streakCount);
  
  // Class multipliers
  const classBonus: Record<AttributeType, number> = {
    INT: characterClass === 'Cyber Scholar' ? 1.2 : characterClass === 'Polymath' ? 1.05 : 1.0,
    STR: characterClass === 'Iron Athlete' ? 1.2 : characterClass === 'Polymath' ? 1.05 : 1.0,
    DEX: characterClass === 'Code Mage' ? 1.2 : characterClass === 'Polymath' ? 1.05 : 1.0,
    CON: characterClass === 'Discipline Monk' ? 1.2 : characterClass === 'Polymath' ? 1.05 : 1.0,
    CHA: characterClass === 'Polymath' ? 1.05 : 1.0,
  };

  let baseRatePerMin = 2.0;
  const attributeGains: Record<AttributeType, number> = {
    INT: 0,
    STR: 0,
    DEX: 0,
    CON: 0,
    CHA: 0,
  };

  switch (category) {
    case 'coding':
      baseRatePerMin = 2.5;
      attributeGains.DEX = Math.round(durationMinutes * 1.5 * classBonus.DEX);
      attributeGains.INT = Math.round(durationMinutes * 1.0 * classBonus.INT);
      break;
    case 'study':
      baseRatePerMin = 2.2;
      attributeGains.INT = Math.round(durationMinutes * 1.8 * classBonus.INT);
      attributeGains.CON = Math.round(durationMinutes * 0.7 * classBonus.CON);
      break;
    case 'fitness':
      baseRatePerMin = 3.0;
      attributeGains.STR = Math.round(durationMinutes * 2.0 * classBonus.STR);
      attributeGains.CON = Math.round(durationMinutes * 1.0 * classBonus.CON);
      break;
    case 'reading':
      baseRatePerMin = 1.8;
      attributeGains.INT = Math.round(durationMinutes * 1.2 * classBonus.INT);
      attributeGains.CHA = Math.round(durationMinutes * 0.8 * classBonus.CHA);
      break;
    case 'habit':
      baseRatePerMin = 2.5;
      attributeGains.CON = Math.round(durationMinutes * 2.0 * classBonus.CON);
      break;
    case 'custom':
    default:
      baseRatePerMin = 2.0;
      attributeGains.CON = Math.round(durationMinutes * 1.0 * classBonus.CON);
      attributeGains.INT = Math.round(durationMinutes * 0.5 * classBonus.INT);
      break;
  }

  const rawXp = durationMinutes * baseRatePerMin;
  const totalXp = Math.round(rawXp * streakMult);
  const goldEarned = Math.round((totalXp * 0.35));

  return {
    totalXp,
    goldEarned,
    attributeGains,
  };
}

/**
 * Checks and updates Level & XP state for character or attribute.
 */
export function processLevelUp(
  currentLevel: number,
  currentXp: number,
  addedXp: number,
  isAttribute: boolean = false
): { newLevel: number; newXp: number; leveledUp: boolean; levelsGained: number } {
  let level = currentLevel;
  let xp = currentXp + addedXp;
  let levelsGained = 0;

  const nextLevelFn = isAttribute ? getAttributeXpForNextLevel : getXpForNextLevel;

  while (xp >= nextLevelFn(level)) {
    xp -= nextLevelFn(level);
    level += 1;
    levelsGained += 1;
  }

  return {
    newLevel: level,
    newXp: xp,
    leveledUp: levelsGained > 0,
    levelsGained,
  };
}

export const CLASS_DETAILS: Record<CharacterClass, { title: string; description: string; bonus: string; icon: string }> = {
  Polymath: {
    title: "Polymath",
    description: "Master of all domains. Well-balanced growth across knowledge, code, physical power, and discipline.",
    bonus: "+5% XP boost to all attributes",
    icon: "Sparkles",
  },
  "Code Mage": {
    title: "Code Mage",
    description: "Architect of digital realms. Accelerates DEX (Focus) and INT (Logic) through deep work sessions.",
    bonus: "+20% Focus (DEX) XP gained from coding",
    icon: "Code",
  },
  "Cyber Scholar": {
    title: "Cyber Scholar",
    description: "Voracious consumer of research, books, and complex systems. Maximize Intelligence.",
    bonus: "+20% Intelligence (INT) XP gained from reading & study",
    icon: "BookOpen",
  },
  "Iron Athlete": {
    title: "Iron Athlete",
    description: "Forges physical strength, endurance, and fortitude in real-world fitness challenges.",
    bonus: "+20% Strength (STR) XP gained from workouts",
    icon: "Dumbbell",
  },
  "Discipline Monk": {
    title: "Discipline Monk",
    description: "Master of habits, routines, and unwavering streak maintenance.",
    bonus: "+20% Discipline (CON) XP from daily habits",
    icon: "Shield",
  },
};
