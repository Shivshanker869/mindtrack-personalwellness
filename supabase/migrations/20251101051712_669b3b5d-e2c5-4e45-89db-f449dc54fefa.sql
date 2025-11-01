-- Create water_intake table
CREATE TABLE public.water_intake (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  glasses_count INTEGER NOT NULL DEFAULT 0,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, date)
);

-- Enable RLS
ALTER TABLE public.water_intake ENABLE ROW LEVEL SECURITY;

-- RLS Policies for water_intake
CREATE POLICY "Users can view own water intake"
  ON public.water_intake FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own water intake"
  ON public.water_intake FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own water intake"
  ON public.water_intake FOR UPDATE
  USING (auth.uid() = user_id);

-- Create user_achievements table
CREATE TABLE public.user_achievements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  rank TEXT NOT NULL DEFAULT 'Bronze',
  stars INTEGER NOT NULL DEFAULT 0,
  current_streak INTEGER NOT NULL DEFAULT 0,
  longest_streak INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_achievements
CREATE POLICY "Users can view own achievements"
  ON public.user_achievements FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own achievements"
  ON public.user_achievements FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own achievements"
  ON public.user_achievements FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view all achievements for leaderboard"
  ON public.user_achievements FOR SELECT
  USING (true);

-- Create indexes
CREATE INDEX idx_water_intake_user_date ON public.water_intake(user_id, date);
CREATE INDEX idx_user_achievements_stars ON public.user_achievements(stars DESC);
CREATE INDEX idx_user_achievements_user ON public.user_achievements(user_id);

-- Create trigger for water_intake updated_at
CREATE TRIGGER update_water_intake_updated_at
  BEFORE UPDATE ON public.water_intake
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create trigger for user_achievements updated_at
CREATE TRIGGER update_user_achievements_updated_at
  BEFORE UPDATE ON public.user_achievements
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();