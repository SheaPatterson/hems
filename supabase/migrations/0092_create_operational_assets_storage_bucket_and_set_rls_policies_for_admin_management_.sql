-- Create the bucket for general operational assets (PDFs, Videos, Audio, etc.)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('operational-assets', 'operational-assets', true)
ON CONFLICT (id) DO NOTHING;

-- Policy: Allow public read access to assets
CREATE POLICY "Public Read Assets" ON storage.objects 
FOR SELECT USING (bucket_id = 'operational-assets');

-- Policy: Allow admins to upload assets
CREATE POLICY "Admin Upload Assets" ON storage.objects 
FOR INSERT TO authenticated 
WITH CHECK (bucket_id = 'operational-assets' AND is_admin());

-- Policy: Allow admins to update assets
CREATE POLICY "Admin Update Assets" ON storage.objects 
FOR UPDATE TO authenticated 
USING (bucket_id = 'operational-assets' AND is_admin());

-- Policy: Allow admins to delete assets
CREATE POLICY "Admin Delete Assets" ON storage.objects 
FOR DELETE TO authenticated 
USING (bucket_id = 'operational-assets' AND is_admin());