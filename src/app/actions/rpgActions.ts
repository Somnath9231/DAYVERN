'use server';

import { ActivityCategory, Profile, UserAttribute } from '@/types/database';
import { processActivityProgression, ProgressionResult } from '@/lib/rpg/progressionService';

export async function processActivityServerAction(
  profile: Profile,
  attributes: UserAttribute[],
  payload: {
    idempotencyKey: string;
    title: string;
    category: ActivityCategory;
    durationMinutes: number;
    notes?: string;
  }
): Promise<{ success: boolean; result?: ProgressionResult; error?: string }> {
  try {
    if (!payload.title || payload.durationMinutes <= 0 || !payload.idempotencyKey) {
      return { success: false, error: 'Invalid activity payload params.' };
    }

    const result = processActivityProgression(profile, attributes, payload);
    return { success: true, result };
  } catch (err: any) {
    console.error('Server RPG progression error:', err);
    return { success: false, error: err?.message || 'Server error processing RPG progression.' };
  }
}
