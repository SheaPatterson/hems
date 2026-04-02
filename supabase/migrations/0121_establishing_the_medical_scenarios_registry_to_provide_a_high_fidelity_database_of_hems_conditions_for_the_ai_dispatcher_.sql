-- Create medical_scenarios table
CREATE TABLE public.medical_scenarios (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT NOT NULL, -- Trauma, Cardiac, Neuro, etc.
  description_base TEXT NOT NULL,
  intervention_base TEXT NOT NULL,
  min_age INTEGER DEFAULT 0,
  max_age INTEGER DEFAULT 100,
  typical_weight_range_lbs INTEGER[] DEFAULT ARRAY[10, 300],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.medical_scenarios ENABLE ROW LEVEL SECURITY;

-- Allow authenticated read access
CREATE POLICY "medical_scenarios_read_policy" ON public.medical_scenarios 
FOR SELECT TO authenticated USING (true);

-- Seed initial high-fidelity scenarios
INSERT INTO public.medical_scenarios (title, category, description_base, intervention_base, min_age, max_age, typical_weight_range_lbs)
VALUES 
('Multi-System Trauma', 'Trauma', 'High-speed motor vehicle accident with passenger entrapment. Significant dashboard intrusion.', 'Extrication support, rapid sequence intubation, bilateral needle decompression, pelvic binder application.', 16, 85, ARRAY[120, 260]),
('ST-Elevation MI (STEMI)', 'Cardiac', 'Acute onset chest pain, diaphoresis, and shortness of breath. 12-lead ECG confirms inferior wall infarction.', '12-lead monitoring, oxygen support, heparin administration, direct transport to PCI capable facility.', 40, 95, ARRAY[150, 280]),
('Acute Ischemic Stroke', 'Neuro', 'Sudden onset right-sided weakness and aphasia. Last seen normal within 2 hours.', 'Neurological assessment, blood glucose verification, blood pressure management, rapid transport to Comprehensive Stroke Center.', 45, 100, ARRAY[110, 240]),
('Pediatric Respiratory Distress', 'Medical', 'Severe wheezing and retractions following upper respiratory infection symptoms. Declining SpO2.', 'High-flow oxygen, nebulized albuterol/ipratropium, potential CPAP/BIPAP, weight-based steroid administration.', 0, 12, ARRAY[10, 100]),
('Penetrating Trauma (GSW)', 'Trauma', 'Gunshot wound to the right upper quadrant of the abdomen. Patient is tachycardic and hypotensive.', 'Hemorrhage control, massive transfusion protocol initiation, TXA administration, emergency surgical consult.', 18, 50, ARRAY[140, 240]),
('Geriatric Fall / ICH', 'Neuro', 'Unwitnessed fall from standing. Patient on anticoagulants with declining GCS and pupillary asymmetry.', 'C-spine immobilization, blood pressure control, airway management, reversal agent coordination.', 65, 100, ARRAY[100, 220]),
('Obstetric Emergency', 'Medical', 'High-risk transfer for pre-eclampsia with concern for impending seizure (Eclampsia).', 'Fetal monitoring, magnesium sulfate drip initiation, blood pressure control, neonatal team coordination.', 18, 45, ARRAY[130, 250]);