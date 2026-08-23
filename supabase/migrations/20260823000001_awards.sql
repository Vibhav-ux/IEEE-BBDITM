-- Awards & Recognition table
CREATE TABLE IF NOT EXISTS public.awards (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title       text NOT NULL,
  recipient   text NOT NULL,           -- person or team name
  category    text NOT NULL DEFAULT 'General',
  year        int  NOT NULL,
  description text,
  image_url   text,
  awarded_by  text,                    -- e.g. "IEEE UP Section"
  created_at  timestamptz DEFAULT now()
);

ALTER TABLE public.awards ENABLE ROW LEVEL SECURITY;

-- Public read
DO $$ BEGIN
  CREATE POLICY "awards public read" ON public.awards FOR SELECT TO anon, authenticated USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Editors+ can manage
DO $$ BEGIN
  CREATE POLICY "editors manage awards" ON public.awards FOR ALL TO authenticated
    USING (public.can_edit_members(auth.uid()))
    WITH CHECK (public.can_edit_members(auth.uid()));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

GRANT SELECT ON public.awards TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.awards TO authenticated;
GRANT ALL ON public.awards TO service_role;
