-- Clear existing data
DELETE FROM public.hems_bases;
DELETE FROM public.helicopters;

-- Add faa_identifier column to hems_bases table
ALTER TABLE public.hems_bases ADD COLUMN faa_identifier TEXT;