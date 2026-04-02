UPDATE public.helicopters
SET 
  fuel_capacity_lbs = 1234,
  cruise_speed_kts = 135,
  fuel_burn_rate_lb_hr = 450
WHERE model = 'EC135';

UPDATE public.helicopters
SET 
  fuel_capacity_lbs = 1384,
  cruise_speed_kts = 140,
  fuel_burn_rate_lb_hr = 482
WHERE model = 'EC145';