-- Clear existing data to ensure fresh seed
DELETE FROM public.hospitals;
DELETE FROM public.hems_bases;
DELETE FROM public.helicopters;

-- Insert Helicopters
INSERT INTO public.helicopters (model, registration, fuel_capacity_lbs, cruise_speed_kts, fuel_burn_rate_lb_hr) VALUES
('EC135', 'N135ST', 1200, 120, 450),
('EC145', 'N145AH', 1500, 130, 550),
('AW139', 'N139LF', 1800, 145, 600);

-- Insert HEMS Bases (coordinates roughly in Western PA)
INSERT INTO public.hems_bases (name, location, faa_identifier, latitude, longitude, helicopter_id)
SELECT 'STAT MedEvac 1', 'Pittsburgh, PA', 'PS2', 40.4406, -79.9959, h.id
FROM public.helicopters h WHERE h.registration = 'N135ST';

INSERT INTO public.hems_bases (name, location, faa_identifier, latitude, longitude, helicopter_id)
SELECT 'LifeFlight 2', 'Tarentum, PA', 'LF2', 40.6015, -79.7534, h.id
FROM public.helicopters h WHERE h.registration = 'N145AH';

-- Insert Hospitals
INSERT INTO public.hospitals (name, city, faa_identifier, latitude, longitude, is_trauma_center) VALUES
('UPMC Presbyterian', 'Pittsburgh', 'PA01', 40.4411, -79.9585, true),
('Allegheny General Hospital', 'Pittsburgh', 'PA02', 40.4566, -80.0039, true),
('Washington Hospital', 'Washington', 'PA03', 40.1740, -80.2462, false);