-- Clear any existing placeholders for these slugs
DELETE FROM public.content WHERE slug IN ('privacy', 'terms', 'whitepaper');

-- Insert Privacy Policy
INSERT INTO public.content (slug, title, body) VALUES (
  'privacy',
  'Privacy Protocol',
  '<h2>1. Data Transmission</h2><p>HEMS OPS-CENTER utilizes a secure data link to relay telemetry from your flight simulator to our theater command servers. This data includes aircraft position, altitude, speed, and fuel state. This data is used exclusively for real-time tracking and historical logbook generation.</p><h2>2. Information Security</h2><p>All pilot credentials and unique API keys are stored using industry-standard encryption. We do not sell or share pilot data with third-party entities.</p><h2>3. Third-Party Services</h2><p>We utilize Gemini AI for tactical radio synthesis and Box for standalone client distribution. Interactions with these services are anonymized where possible.</p>'
);

-- Insert Terms of Service
INSERT INTO public.content (slug, title, body) VALUES (
  'terms',
  'Terms of Operational Service',
  '<h2>1. Acceptance of Terms</h2><p>By initializing a data link with the HEMS OPS-CENTER, you agree to abide by the safety and professional standards of the community. This platform is for simulation and training purposes only.</p><h2>2. Professional Conduct</h2><p>Pilots are expected to maintain a professional demeanor on global radio frequencies. Misuse of the AI Dispatcher or harassment of other personnel will result in immediate revocation of theater access.</p><h2>3. Disclaimer of Liability</h2><p>HEMS OPS-CENTER is a flight simulation tool. It must never be used for real-world navigation or medical advice. SRP Consulting Group, LLC is not liable for any real-world occurrences resulting from simulator use.</p>'
);

-- Insert Whitepaper / SOP
INSERT INTO public.content (slug, title, body) VALUES (
  'whitepaper',
  'Operational Whitepaper & SOP',
  '<h2>Project Vision</h2><p>The HEMS OPS-CENTER (v5.3.0) represents a shift toward "Connected Simulation," where individual pilots contribute to a shared regional theater. Our goal is to bridge the gap between solo flight and professional dispatch environments.</p><h2>Standard Operating Procedures (SOP)</h2><p>1. <strong>Pre-Flight:</strong> All missions must be logged via the Dispatch Planner to ensure weight and balance compliance.<br>2. <strong>Communications:</strong> Pilots must maintain frequency monitoring while in the "Enroute" phase.<br>3. <strong>Reporting:</strong> Any technical discrepancies or safety hazards must be logged via the SMS (Safety Management System) for regional auditing.</p>'
);