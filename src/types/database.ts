export type AttributeType = 'INT' | 'STR' | 'DEX' | 'CON' | 'CHA';
export type ActivityCategory = 'study' | 'coding' | 'fitness' | 'habit' | 'reading' | 'custom';
export type QuestType = 'daily' | 'weekly' | 'milestone';
export type QuestStatus = 'active' | 'completed' | 'failed';
export type CharacterClass = 'Polymath' | 'Code Mage' | 'Cyber Scholar' | 'Iron Athlete' | 'Discipline Monk';

export type TaskType = 'task' | 'workout' | 'habit';
export type RecurrenceRule = 'none' | 'daily' | 'weekdays' | 'weekly' | 'monthly';
export type TaskPriority = 'normal' | 'high' | 'urgent';
export type TaskStatus = 'pending' | 'completed';

export interface UserTask {
  id: string;
  user_id: string;
  title: string;
  description?: string | null;
  task_type: TaskType;
  due_date: string; // YYYY-MM-DD
  due_time?: string | null; // HH:MM
  recurrence_rule: RecurrenceRule;
  priority: TaskPriority;
  status: TaskStatus;
  completed_at?: string | null;
  xp_reward: number;
  gold_reward: number;
  linked_habit_id?: string | null;
  linked_workout_type?: string | null;
  linked_book_id?: string | null;
  created_at?: string;
  updated_at?: string;
}


export type LibraryCategory = 
  | 'Psychology' 
  | 'Philosophy' 
  | 'History' 
  | 'Architecture' 
  | 'Fiction' 
  | 'Short Stories' 
  | 'Stories'
  | 'Science' 
  | 'Art & Culture' 
  | 'Art'
  | 'Sociology' 
  | 'Economics & Behaviour' 
  | 'Economics'
  | 'Literature'
  | 'Technology';

export type SourceType = 'public_domain' | 'open_access' | 'publisher' | 'university' | 'archive' | 'other_verified';
export type ReadingDifficulty = 'beginner' | 'intermediate' | 'advanced' | 'Beginner' | 'Intermediate' | 'Advanced';
export type ContentType = 'book' | 'paper' | 'essay' | 'story' | 'theory' | 'lecture' | 'document';

export interface Profile {
  id: string;
  username: string;
  display_name: string | null;
  character_class: CharacterClass;
  avatar_url: string | null;
  level: number;
  current_xp: number;
  total_xp: number;
  gold: number;
  streak_count: number;
  is_admin?: boolean;
  last_active_at: string;
  created_at: string;
  updated_at: string;
}

export interface UserAttribute {
  id: string;
  user_id: string;
  attribute_type: AttributeType;
  level: number;
  current_xp: number;
  total_xp: number;
  created_at?: string;
}

export interface Activity {
  id: string;
  user_id: string;
  title: string;
  category: ActivityCategory;
  duration_minutes: number;
  xp_earned: number;
  attribute_gains: Partial<Record<AttributeType, number>>;
  notes?: string | null;
  performed_at: string;
  created_at?: string;
}

export interface Habit {
  id: string;
  user_id: string;
  title: string;
  description?: string | null;
  category: string;
  attribute_target: AttributeType;
  base_xp: number;
  base_gold: number;
  streak_count: number;
  frequency: 'daily' | 'weekly';
  active: boolean;
  completed_today?: boolean;
  created_at?: string;
}

export interface HabitLog {
  id: string;
  habit_id: string;
  user_id: string;
  completed_date: string;
  xp_earned: number;
  gold_earned: number;
  created_at?: string;
}

export interface Quest {
  id: string;
  user_id: string;
  title: string;
  description?: string | null;
  quest_type: QuestType;
  category: ActivityCategory;
  target_count: number;
  current_count: number;
  xp_reward: number;
  gold_reward: number;
  attribute_reward?: AttributeType | null;
  status: QuestStatus;
  due_date?: string | null;
  created_at?: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  category: string;
  icon_name: string;
  xp_reward: number;
  gold_reward: number;
  unlocked?: boolean;
  unlocked_at?: string;
}

export interface Reward {
  id: string;
  user_id: string;
  title: string;
  description?: string | null;
  cost_gold: number;
  is_claimed: boolean;
  claimed_at?: string | null;
  created_at?: string;
}

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

// LIBRARY SYSTEM TYPES (Curated Discovery System)
export interface Book {
  id: string;
  title: string;
  author: string;
  category: LibraryCategory | string;
  description: string;
  why_it_matters?: string | null;
  hook_text: string;
  highlight_text?: string | null;
  preview_text: string;
  source_url: string;
  source_name: string;
  source_type: SourceType | string;
  difficulty: ReadingDifficulty | string;
  content_type: ContentType | string;
  tags: string[];
  cover_bg_color?: string;
  est_reading_time_mins?: number;
  featured?: boolean;
  under_the_radar?: boolean;
  published: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface UserResourceLike {
  id: string;
  user_id: string;
  book_id: string;
  created_at: string;
}

export interface Chapter {
  id: string;
  book_id: string;
  chapter_number: number;
  title: string;
  paragraphs?: Paragraph[];
  created_at?: string;
}

export interface Paragraph {
  id: string;
  chapter_id: string;
  book_id: string;
  paragraph_number: number;
  content: string;
  created_at?: string;
}

export interface UserBookProgress {
  id: string;
  user_id: string;
  book_id: string;
  last_chapter_id: string | null;
  last_paragraph_id: string | null;
  progress_percent: number;
  status: 'started' | 'completed';
  last_read_at: string;
  created_at?: string;
}

export interface UserBookmark {
  id: string;
  user_id: string;
  book_id: string;
  paragraph_id?: string | null;
  notes?: string | null;
  created_at: string;
}

export interface UserParagraphLike {
  id: string;
  user_id: string;
  paragraph_id: string;
  created_at: string;
}

export interface ReadingSession {
  id: string;
  user_id: string;
  book_id: string;
  duration_seconds: number;
  paragraphs_read: number;
  xp_earned: number;
  created_at: string;
}

export interface ReadingStats {
  books_started: number;
  books_completed: number;
  paragraphs_read: number;
  total_reading_time_mins: number;
  current_reading_streak: number;
  longest_reading_streak: number;
}
