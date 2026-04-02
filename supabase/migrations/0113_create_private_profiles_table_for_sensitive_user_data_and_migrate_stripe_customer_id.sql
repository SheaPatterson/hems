-- 1. Create the new private_profiles table
CREATE TABLE public.private_profiles (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  stripe_customer_id TEXT
);

-- 2. Enable RLS (MANDATORY)
ALTER TABLE public.private_profiles ENABLE ROW LEVEL SECURITY;

-- 3. Create RLS policies (Strictly restricted to the owner)
CREATE POLICY "Allow owner to read private profile" ON public.private_profiles 
FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Allow owner to insert private profile" ON public.private_profiles 
FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow owner to update private profile" ON public.private_profiles 
FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- 4. Migrate existing stripe_customer_id data from profiles to private_profiles
INSERT INTO public.private_profiles (user_id, stripe_customer_id)
SELECT id, stripe_customer_id FROM public.profiles WHERE stripe_customer_id IS NOT NULL;

-- 5. Drop the stripe_customer_id column from the public.profiles table
ALTER TABLE public.profiles DROP COLUMN stripe_customer_id;