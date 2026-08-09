-- Add secretary role and align permissions with the frontend

ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'secretary';

CREATE OR REPLACE FUNCTION public.can_edit_members(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role IN ('counsellor','chair','secretary','editor')
  )
$$;

CREATE OR REPLACE FUNCTION public.can_view_all_members(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role IN ('counsellor','chair','secretary','editor')
  )
$$;

-- Persist phone and enrollment_no on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, ieee_member_id, branch, year_of_study, society, phone, enrollment_no)
  VALUES (
    NEW.id,
    coalesce(NEW.raw_user_meta_data->>'full_name',''),
    NEW.email,
    NEW.raw_user_meta_data->>'ieee_member_id',
    NEW.raw_user_meta_data->>'branch',
    NEW.raw_user_meta_data->>'year_of_study',
    NEW.raw_user_meta_data->>'society',
    NEW.raw_user_meta_data->>'phone',
    NEW.raw_user_meta_data->>'enrollment_no'
  );
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'member')
  ON CONFLICT DO NOTHING;
  RETURN NEW;
END; $$;

-- Leadership can assign roles to members
CREATE POLICY "editors manage roles" ON public.user_roles
  FOR ALL TO authenticated
  USING (public.can_edit_members(auth.uid()))
  WITH CHECK (public.can_edit_members(auth.uid()));

-- Restrict gallery writes to branch leadership (remove overly permissive policies)
DROP POLICY IF EXISTS "Authenticated users can upload to gallery." ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete from gallery." ON storage.objects;

DO $$ BEGIN
  CREATE POLICY "gallery editors insert" ON storage.objects FOR INSERT TO authenticated
    WITH CHECK (bucket_id = 'gallery' AND public.can_edit_members(auth.uid()));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "gallery editors update" ON storage.objects FOR UPDATE TO authenticated
    USING (bucket_id = 'gallery' AND public.can_edit_members(auth.uid()));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "gallery editors delete" ON storage.objects FOR DELETE TO authenticated
    USING (bucket_id = 'gallery' AND public.can_edit_members(auth.uid()));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
