-- Team posters table: upload group photos / collages for past & current teams
CREATE TABLE IF NOT EXISTS public.team_posters (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session      text NOT NULL,          -- e.g. '2025-26'
  label        text,                   -- optional extra label
  image_url    text NOT NULL,
  storage_path text,
  show_on_home boolean NOT NULL DEFAULT false,
  created_at   timestamptz DEFAULT now()
);

ALTER TABLE public.team_posters ENABLE ROW LEVEL SECURITY;

-- Public read
DO $$ BEGIN
  CREATE POLICY "team_posters public read" ON public.team_posters
    FOR SELECT TO anon, authenticated USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Editors+ can manage
DO $$ BEGIN
  CREATE POLICY "editors manage team_posters" ON public.team_posters
    FOR ALL TO authenticated
    USING (public.can_edit_members(auth.uid()))
    WITH CHECK (public.can_edit_members(auth.uid()));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

GRANT SELECT ON public.team_posters TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.team_posters TO authenticated;
GRANT ALL ON public.team_posters TO service_role;
