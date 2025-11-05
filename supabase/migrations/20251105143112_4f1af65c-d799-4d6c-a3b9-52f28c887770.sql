-- Add display_name to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS display_name TEXT;

-- Add display_name to user_achievements for leaderboard
ALTER TABLE public.user_achievements ADD COLUMN IF NOT EXISTS display_name TEXT;

-- Create function to sync display name from profiles to user_achievements
CREATE OR REPLACE FUNCTION sync_display_name()
RETURNS TRIGGER AS $$
BEGIN
  -- Update user_achievements when profile display_name changes
  UPDATE public.user_achievements
  SET display_name = NEW.display_name
  WHERE user_id = NEW.id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger to automatically sync display names
DROP TRIGGER IF EXISTS sync_display_name_trigger ON public.profiles;
CREATE TRIGGER sync_display_name_trigger
AFTER INSERT OR UPDATE OF display_name ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION sync_display_name();