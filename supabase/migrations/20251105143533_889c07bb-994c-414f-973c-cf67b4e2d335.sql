-- Add UPDATE policy to habit_completions table to allow users to edit their own completions
CREATE POLICY "Users can update own completions"
ON public.habit_completions FOR UPDATE
USING (auth.uid() = user_id);