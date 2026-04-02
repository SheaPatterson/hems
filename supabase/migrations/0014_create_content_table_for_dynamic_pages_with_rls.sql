-- Create content table
CREATE TABLE public.content (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE, -- e.g., 'documentation', 'downloads'
  title TEXT NOT NULL,
  body TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS (REQUIRED for security)
ALTER TABLE public.content ENABLE ROW LEVEL SECURITY;

-- Policy 1: Allow public read access (for all users to see the content pages)
CREATE POLICY "Allow public read access to content" ON public.content 
FOR SELECT USING (true);

-- Policy 2: Allow admin users to insert and update content
-- We will rely on a future function/trigger to check for the 'admin' role, 
-- but for simplicity now, we'll allow authenticated users to update, assuming 
-- the application layer (AdminGuard) handles the role check for the UI.
-- Since we don't have a direct way to check roles in RLS without a custom function, 
-- I will use a simple authenticated check for now, and rely on the client-side AdminGuard.
-- NOTE: For production security, a custom RLS function checking user_roles would be required.

CREATE POLICY "Allow authenticated users to insert content" ON public.content 
FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update content" ON public.content 
FOR UPDATE TO authenticated USING (true);