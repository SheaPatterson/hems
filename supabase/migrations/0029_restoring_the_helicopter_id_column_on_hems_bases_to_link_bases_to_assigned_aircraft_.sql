-- Add the helicopter_id column back to hems_bases
ALTER TABLE public.hems_bases
ADD COLUMN helicopter_id UUID REFERENCES public.helicopters(id);