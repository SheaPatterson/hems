-- 1. Clear existing limited list
DELETE FROM public.hems_bases;

-- 2. Insert the full regional roster
-- Linking to helicopters where registration matches (based on previous fleet seed)
INSERT INTO public.hems_bases (name, location, faa_identifier, latitude, longitude, helicopter_id)
VALUES 
-- LifeFlight Stations
('LifeFlight 1', 'Metro Health (PA)', 'LF1', 40.4406, -79.9959, (SELECT id FROM helicopters WHERE registration = 'N123LF' LIMIT 1)),
('LifeFlight 2', 'Allegheny Co. (PA)', 'LF2', 40.3544, -79.9300, (SELECT id FROM helicopters WHERE registration = 'N456LF' LIMIT 1)),
('LifeFlight 3', 'Indiana (PA)', 'LF3', 40.6314, -79.1022, NULL),
('LifeFlight 4', 'Zelienople (PA)', 'LF4', 40.7981, -80.1264, NULL),
('LifeFlight 5', 'Clarion (PA)', 'LF5', 41.2151, -79.3850, NULL),

-- STAT MedEvac Stations
('STAT 1', 'Pittsburgh (PA)', 'ST1', 40.4500, -80.0000, (SELECT id FROM helicopters WHERE registration = 'N789ST' LIMIT 1)),
('STAT 3', 'Johnstown (PA)', 'ST3', 40.3267, -78.9220, (SELECT id FROM helicopters WHERE registration = 'N101ST' LIMIT 1)),
('STAT 4', 'Latrobe (PA)', 'ST4', 40.2787, -79.4053, (SELECT id FROM helicopters WHERE registration = 'N202ST' LIMIT 1)),
('STAT 5', 'Clearfield (PA)', 'ST5', 41.0264, -78.4395, (SELECT id FROM helicopters WHERE registration = 'N303ST' LIMIT 1)),
('STAT 6', 'Clarion (PA)', 'ST6', 41.2117, -79.3853, (SELECT id FROM helicopters WHERE registration = 'N404ST' LIMIT 1)),
('STAT 7', 'Greensburg (PA)', 'ST7', 40.2995, -79.5292, (SELECT id FROM helicopters WHERE registration = 'N505ST' LIMIT 1)),
('STAT 8', 'Waynesburg (PA)', 'ST8', 39.8970, -80.1809, (SELECT id FROM helicopters WHERE registration = 'N606ST' LIMIT 1)),
('STAT 9', 'Mercer (PA)', 'ST9', 41.2267, -80.2403, (SELECT id FROM helicopters WHERE registration = 'N707ST' LIMIT 1)),
('STAT 10', 'Somerset (PA)', 'ST10', 40.0084, -79.0781, NULL),
('STAT 11', 'Greene County (PA)', 'ST11', 39.9000, -80.1900, NULL),
('STAT 13', 'York (PA)', 'ST13', 39.9626, -76.7277, NULL),
('STAT 14', 'Youngstown (OH)', 'ST14', 41.1000, -80.6500, NULL),
('STAT 16', 'Hagerstown (MD)', 'ST16', 39.6418, -77.7200, NULL),
('STAT 17', 'Lynchburg (VA)', 'ST17', 37.4137, -79.1422, NULL);