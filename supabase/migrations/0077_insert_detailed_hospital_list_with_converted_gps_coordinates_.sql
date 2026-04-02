-- Clear existing hospital data
DELETE FROM public.hospitals;

-- Insert detailed hospital data
INSERT INTO public.hospitals (id, name, city, faa_identifier, latitude, longitude, is_trauma_center)
VALUES
('00000000-0000-0000-0000-000000000001', 'Allegheny General Hospital', 'Pittsburgh, PA', '42PN', 40.4547, -80.0086, TRUE),
('00000000-0000-0000-0000-000000000002', 'UPMC Presbyterian', 'Pittsburgh, PA', 'PS78', 40.4420, -79.9590, TRUE),
('00000000-0000-0000-0000-000000000003', 'UPMC Mercy', 'Pittsburgh, PA', 'PN23', 40.4350, -79.9850, TRUE),
('00000000-0000-0000-0000-000000000004', 'St Vincent Hospital', 'Erie, PA', '29PN', 42.1292, -80.0850, FALSE),
('00000000-0000-0000-0000-000000000005', 'UPMC Hamot', 'Erie, PA', '0PS8', 42.1290, -80.0850, TRUE),
('00000000-0000-0000-0000-000000000006', 'Butler Memorial Hospital', 'Butler, PA', 'PA41', 40.8600, -79.9000, FALSE),
('00000000-0000-0000-0000-000000000007', 'Cleveland Clinic Main Campus', 'Cleveland, OH', '6OI8', 41.5048, -81.6300, TRUE),
('00000000-0000-0000-0000-000000000008', 'UPMC Altoona', 'Altoona, PA', '74PN', 40.5180, -78.3950, FALSE),
('00000000-0000-0000-0000-000000000009', 'Forbes Hospital', 'Pittsburgh, PA', '54PN', 40.4350, -79.8300, FALSE),
('00000000-0000-0000-0000-000000000010', 'West Penn Hospital', 'Pittsburgh, PA', 'PN80', 40.4580, -79.9500, TRUE),
('00000000-0000-0000-0000-000000000011', 'AHN Wexford Hospital', 'Wexford, PA', '33PA', 40.6500, -80.0500, FALSE),
('00000000-0000-0000-0000-000000000012', 'Canonsburg Hospital', 'Canonsburg, PA', 'PA67', 40.2500, -80.1800, FALSE),
('00000000-0000-0000-0000-000000000013', 'Jefferson Hospital', 'Pittsburgh, PA', '60PN', 40.3000, -79.9800, FALSE),
('00000000-0000-0000-0000-000000000014', 'Warren General Hospital', 'Warren, PA', 'PA97', 41.8400, -79.1400, FALSE),
('00000000-0000-0000-0000-000000000015', 'Clarion Hospital', 'Clarion, PA', '91PA', 41.2100, -79.3800, FALSE),
('00000000-0000-0000-0000-000000000016', 'Penn Highlands Jefferson Manor', 'Brookville, PA', 'PA04', 41.1500, -79.0800, FALSE),
('00000000-0000-0000-0000-000000000017', 'Penn Highlands DuBois', 'DuBois, PA', 'PA10', 41.1200, -78.7500, FALSE),
('00000000-0000-0000-0000-000000000018', 'UPMC Children''s Hospital of Pittsburgh', 'Pittsburgh, PA', '30PN', 40.4500, -79.9500, TRUE),
('00000000-0000-0000-0000-000000000019', 'UPMC Horizon - Shenango Valley', 'Sharon, PA', 'PS41', 41.2300, -80.4800, FALSE),
('00000000-0000-0000-0000-000000000020', 'UPMC Jameson', 'New Castle, PA', '3PN4', 41.0000, -80.3500, FALSE),
('00000000-0000-0000-0000-000000000021', 'UPMC Kane', 'Kane, PA', 'PA91', 41.6500, -78.8000, FALSE),
('00000000-0000-0000-0000-000000000022', 'UPMC Northwest', 'Seneca, PA', 'PN76', 41.3800, -79.7500, FALSE),
('00000000-0000-0000-0000-000000000023', 'UPMC Passavant - Cranberry', 'Cranberry Twp, PA', 'PA56', 40.7000, -80.0800, FALSE),
('00000000-0000-0000-0000-000000000024', 'UPMC St. Margaret', 'Pittsburgh, PA', '46PA', 40.4800, -79.8800, FALSE);