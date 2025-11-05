-- Add email notification preferences to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS email_daily_reminder boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS email_weekly_summary boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS email_streak_achievements boolean DEFAULT true;