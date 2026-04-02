ALTER TABLE public.hems_bases
ADD COLUMN helicopter_id UUID REFERENCES public.helicopters(id) ON DELETE SET NULL;