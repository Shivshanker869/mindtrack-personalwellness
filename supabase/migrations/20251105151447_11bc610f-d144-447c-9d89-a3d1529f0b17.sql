-- Create table to track chat API rate limits
CREATE TABLE IF NOT EXISTS public.chat_rate_limits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  request_count INTEGER NOT NULL DEFAULT 1,
  window_start TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.chat_rate_limits ENABLE ROW LEVEL SECURITY;

-- Create policy for users to view their own rate limit data
CREATE POLICY "Users can view their own rate limits"
ON public.chat_rate_limits
FOR SELECT
USING (auth.uid() = user_id);

-- Create index for efficient lookups
CREATE INDEX idx_chat_rate_limits_user_window 
ON public.chat_rate_limits(user_id, window_start);

-- Function to clean up old rate limit records (older than 5 minutes)
CREATE OR REPLACE FUNCTION clean_old_rate_limits()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.chat_rate_limits
  WHERE window_start < now() - INTERVAL '5 minutes';
END;
$$;