-- Create community_posts table
CREATE TABLE public.community_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS (REQUIRED for security)
ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;

-- Policies: Authenticated users can read all posts
CREATE POLICY "Allow authenticated users to read all posts" ON public.community_posts 
FOR SELECT TO authenticated USING (true);

-- Policies: Users can insert posts
CREATE POLICY "Users can create posts" ON public.community_posts 
FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Policies: Users can update their own posts
CREATE POLICY "Users can update their own posts" ON public.community_posts 
FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- Policies: Users can delete their own posts
CREATE POLICY "Users can delete their own posts" ON public.community_posts 
FOR DELETE TO authenticated USING (auth.uid() = user_id);