-- Site Images table: allows admins to replace any site image from the frontend
CREATE TABLE IF NOT EXISTS public.site_images (
  key        text PRIMARY KEY,  -- e.g. 'hero', 'campus', 'about-collaboration'
  image_url  text NOT NULL,
  label      text,              -- human-readable label shown in admin
  section    text,              -- grouping: 'home', 'about', 'chapters', etc.
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.site_images ENABLE ROW LEVEL SECURITY;

-- Anyone can read site images (they're public page assets)
DO $$ BEGIN
  CREATE POLICY "site_images public read" ON public.site_images FOR SELECT TO anon, authenticated USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Only editors+ can update/insert site images
DO $$ BEGIN
  CREATE POLICY "editors manage site_images" ON public.site_images FOR ALL TO authenticated
    USING (public.can_edit_members(auth.uid()))
    WITH CHECK (public.can_edit_members(auth.uid()));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

GRANT SELECT ON public.site_images TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.site_images TO authenticated;
GRANT ALL ON public.site_images TO service_role;
