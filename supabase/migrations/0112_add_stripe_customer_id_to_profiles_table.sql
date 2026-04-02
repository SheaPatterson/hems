ALTER TABLE public.profiles
ADD COLUMN stripe_customer_id TEXT UNIQUE;

-- Add a policy to allow authenticated users to update their own stripe_customer_id
CREATE POLICY "Allow authenticated users to update their own stripe_customer_id"
ON public.profiles FOR UPDATE TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);