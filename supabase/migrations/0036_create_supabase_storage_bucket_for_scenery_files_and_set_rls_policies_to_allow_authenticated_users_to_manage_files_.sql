-- Create storage bucket for scenery files
INSERT INTO storage.buckets (id, name, public)
VALUES ('scenery-files', 'scenery-files', true)
ON CONFLICT (id) DO NOTHING;

-- Policy 1: Allow authenticated users to read (download/view) all files
CREATE POLICY "Allow authenticated read access to scenery files"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'scenery-files');

-- Policy 2: Allow authenticated users to insert (upload) files
CREATE POLICY "Allow authenticated insert access to scenery files"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'scenery-files');

-- Policy 3: Allow authenticated users to update (overwrite) files
CREATE POLICY "Allow authenticated update access to scenery files"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'scenery-files');

-- Policy 4: Allow authenticated users to delete files
CREATE POLICY "Allow authenticated delete access to scenery files"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'scenery-files');