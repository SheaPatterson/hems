-- Clear existing base scenery data
DELETE FROM public.base_scenery;

-- Re-insert mock scenery for the first two bases with corrected paths
INSERT INTO public.base_scenery (base_id, image_url, description)
VALUES 
(
    (SELECT id FROM public.hems_bases ORDER BY created_at ASC LIMIT 1),
    '/AHN LifeFlight 1.jpg',
    'AHN LifeFlight 1 Helicopter at Base'
),
(
    (SELECT id FROM public.hems_bases ORDER BY created_at ASC LIMIT 1 OFFSET 1),
    '/Stat MedEvac 1.png',
    'Stat MedEvac 1 Helicopter at Base'
);