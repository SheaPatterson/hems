-- 1. Ensure content table supports dynamic pages
CREATE TABLE IF NOT EXISTS public.content (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  body TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create Global Configuration table
CREATE TABLE IF NOT EXISTS public.config (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  description TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Enable RLS
ALTER TABLE public.content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.config ENABLE ROW LEVEL SECURITY;

-- 4. Standard RLS Policies (Admins can do everything)
CREATE POLICY "Admins manage all content" ON public.content FOR ALL TO authenticated USING (is_admin());
CREATE POLICY "Admins manage all config" ON public.config FOR ALL TO authenticated USING (is_admin());

-- 5. Public read for content (so pilots can see docs)
CREATE POLICY "Anyone can read content" ON public.content FOR SELECT USING (true);