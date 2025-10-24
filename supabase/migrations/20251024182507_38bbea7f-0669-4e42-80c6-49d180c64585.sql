-- Add additional profile fields
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS contact_number text,
ADD COLUMN IF NOT EXISTS age integer,
ADD COLUMN IF NOT EXISTS personal_goal text;

-- Update RLS policy to allow insert for new users
CREATE POLICY "Users can insert own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = id);