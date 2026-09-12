-- DAYVERN Production Sprint: Performance Indexes & Query Optimization
-- Migration: 00014_production_indexes_and_perf.sql

CREATE INDEX IF NOT EXISTS idx_user_tasks_user_status ON public.user_tasks(user_id, status);
CREATE INDEX IF NOT EXISTS idx_user_tasks_scheduled ON public.user_tasks(user_id, scheduled_date);
CREATE INDEX IF NOT EXISTS idx_habit_logs_user_date ON public.habit_logs(user_id, log_date);
CREATE INDEX IF NOT EXISTS idx_activities_user_date ON public.activities(user_id, date);
CREATE INDEX IF NOT EXISTS idx_user_bookmarks_user_book ON public.user_bookmarks(user_id, book_id);
CREATE INDEX IF NOT EXISTS idx_library_books_category ON public.library_books(category);
CREATE INDEX IF NOT EXISTS idx_library_books_difficulty ON public.library_books(difficulty);
CREATE INDEX IF NOT EXISTS idx_user_reading_logs_user_book ON public.user_reading_logs(user_id, book_id);
CREATE INDEX IF NOT EXISTS idx_rpg_events_idempotency ON public.rpg_events(user_id, idempotency_key);
