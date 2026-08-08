-- IEEE BBDITM Supabase Migrations

-- 1. Create storage buckets for avatars and gallery
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true) ON CONFLICT DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('gallery', 'gallery', true) ON CONFLICT DO NOTHING;

-- Storage policies for avatars
CREATE POLICY "Avatar images are publicly accessible." ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
CREATE POLICY "Users can upload their own avatar." ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can update their own avatar." ON storage.objects FOR UPDATE USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Storage policies for gallery
CREATE POLICY "Gallery images are publicly accessible." ON storage.objects FOR SELECT USING (bucket_id = 'gallery');
CREATE POLICY "Authenticated users can upload to gallery." ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'gallery' AND auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can delete from gallery." ON storage.objects FOR DELETE USING (bucket_id = 'gallery' AND auth.role() = 'authenticated');

-- 2. Update profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS enrollment_no text;

-- 3. Update events table
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS video_url text;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS cover_image_url text;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS society text;

-- 4. Create societies table for editable society cards
CREATE TABLE IF NOT EXISTS public.societies (
    slug text PRIMARY KEY,
    name text NOT NULL,
    short_name text NOT NULL,
    tagline text,
    description text,
    color text
);

-- Enable RLS on societies
ALTER TABLE public.societies ENABLE ROW LEVEL SECURITY;

-- Allow public read access to societies
CREATE POLICY "Societies are publicly accessible." ON public.societies FOR SELECT USING (true);

-- Allow designated people to update societies
-- A user can update a society if they have a role of 'counsellor', 'chair', 'secretary', or 'editor' globally,
-- OR if they have the role 'society_chair' for that specific society.
CREATE POLICY "Designated members can update societies" ON public.societies
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.user_roles ur 
            WHERE ur.user_id = auth.uid() 
            AND (
                ur.role IN ('counsellor', 'chair', 'secretary', 'editor') 
                OR (ur.role = 'society_chair' AND ur.society = societies.slug)
            )
        )
    );

CREATE POLICY "Designated members can insert societies" ON public.societies
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.user_roles ur 
            WHERE ur.user_id = auth.uid() 
            AND ur.role IN ('counsellor', 'chair', 'secretary', 'editor') 
        )
    );

-- 5. Insert initial data into societies (Optional seed data based on site.ts)
INSERT INTO public.societies (slug, name, short_name, tagline, description, color) VALUES
('branch', 'IEEE Student Branch', 'IEEE', 'Main Branch', 'BBDITM Main Student Branch', '#006699'),
('cs', 'IEEE Computer Society', 'CS', 'Software, AI & systems', 'Hackathons, open-source sprints and hands-on workshops on AI, cloud and modern web engineering.', '#0072C6'),
('pes', 'IEEE Power & Energy Society', 'PES', 'Grids & clean energy', 'Industry talks, plant visits and PES Day activities focused on renewable energy and smart grids.', '#00843D'),
('wie', 'IEEE Women in Engineering', 'WIE', 'Affinity group', 'Mentorship circles, leadership sessions and outreach that support women pursuing engineering careers.', '#702F8A'),
('sight', 'IEEE SIGHT', 'SIGHT', 'Humanitarian technology', 'Community projects that apply engineering to local problems in education, health and sustainability.', '#E87722'),
('sps', 'IEEE Signal Processing Society', 'SPS', 'Signals, data & intelligence', 'Workshops and study groups on DSP, machine learning, image processing and communications systems.', '#0077B6'),
('pels', 'IEEE Power Electronics Society', 'PELS', 'Power conversion & drives', 'Technical talks, lab sessions and industry visits on power electronics, converters and motor drives.', '#C8102E'),
('emb', 'IEEE Engineering in Medicine & Biology Society', 'EMB', 'Biomedical engineering', 'Explorations at the intersection of engineering and healthcare — biomedical devices, biosignal processing and health-tech innovation.', '#005A9C')
ON CONFLICT (slug) DO NOTHING;
