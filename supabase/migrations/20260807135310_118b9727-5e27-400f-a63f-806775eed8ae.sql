
CREATE POLICY "gallery read" ON storage.objects FOR SELECT TO anon, authenticated
USING (bucket_id = 'gallery');
CREATE POLICY "gallery editors insert" ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'gallery' AND public.can_edit_members(auth.uid()));
CREATE POLICY "gallery editors update" ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'gallery' AND public.can_edit_members(auth.uid()));
CREATE POLICY "gallery editors delete" ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'gallery' AND public.can_edit_members(auth.uid()));
