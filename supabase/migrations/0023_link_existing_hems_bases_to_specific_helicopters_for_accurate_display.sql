-- Link the first HEMS base to the helicopter N131LF
UPDATE public.hems_bases
SET helicopter_id = (SELECT id FROM public.helicopters WHERE registration = 'N131LF' LIMIT 1)
WHERE id = (SELECT id FROM public.hems_bases ORDER BY created_at ASC LIMIT 1);

-- Link the second HEMS base to the helicopter N527ME
UPDATE public.hems_bases
SET helicopter_id = (SELECT id FROM public.helicopters WHERE registration = 'N527ME' LIMIT 1 OFFSET 1)
WHERE id = (SELECT id FROM public.hems_bases ORDER BY created_at ASC LIMIT 1 OFFSET 1);