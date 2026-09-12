export type ShareAchievementType = 
  | 'workout' 
  | 'quest' 
  | 'achievement' 
  | 'level_up' 
  | 'streak' 
  | 'reading';

export interface ShareCardData {
  type: ShareAchievementType;
  title: string;
  subtitle?: string;
  primaryMetric: string;
  secondaryMetric?: string;
  xpEarned?: number;
  goldEarned?: number;
  streakCount?: number;
  iconEmoji: string;
  date?: string;
  detailText?: string;
}
