
CREATE TYPE public.app_role AS ENUM ('counsellor','chair','society_chair','editor','member');

CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL DEFAULT '',
  ieee_member_id text,
  email text,
  phone text,
  branch text,
  year_of_study text,
  society text,
  avatar_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  society text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

CREATE TABLE public.positions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  society text,
  start_date date NOT NULL,
  end_date date,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  event_date date,
  date_label text,
  type text NOT NULL DEFAULT 'Branch',
  status text NOT NULL DEFAULT 'Upcoming',
  location text,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.photos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text,
  album text NOT NULL DEFAULT 'General',
  caption text,
  image_url text NOT NULL,
  storage_path text,
  uploaded_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- helper functions
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE OR REPLACE FUNCTION public.can_edit_members(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role IN ('counsellor','chair','editor')
  )
$$;

CREATE OR REPLACE FUNCTION public.can_view_all_members(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role IN ('counsellor','chair','editor')
  )
$$;

CREATE OR REPLACE FUNCTION public.chair_societies(_user_id uuid)
RETURNS text[] LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT coalesce(array_agg(society), '{}') FROM public.user_roles
  WHERE user_id = _user_id AND role = 'society_chair' AND society IS NOT NULL
$$;

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, ieee_member_id, branch, year_of_study, society)
  VALUES (
    NEW.id,
    coalesce(NEW.raw_user_meta_data->>'full_name',''),
    NEW.email,
    NEW.raw_user_meta_data->>'ieee_member_id',
    NEW.raw_user_meta_data->>'branch',
    NEW.raw_user_meta_data->>'year_of_study',
    NEW.raw_user_meta_data->>'society'
  );
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'member')
  ON CONFLICT DO NOTHING;
  RETURN NEW;
END; $$;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- grants
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.positions TO authenticated;
GRANT ALL ON public.positions TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.events TO authenticated;
GRANT SELECT ON public.events TO anon;
GRANT ALL ON public.events TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.photos TO authenticated;
GRANT SELECT ON public.photos TO anon;
GRANT ALL ON public.photos TO service_role;

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.photos ENABLE ROW LEVEL SECURITY;

-- profiles policies
CREATE POLICY "own profile read" ON public.profiles FOR SELECT TO authenticated
USING (id = auth.uid());
CREATE POLICY "leadership read all profiles" ON public.profiles FOR SELECT TO authenticated
USING (public.can_view_all_members(auth.uid()));
CREATE POLICY "society chair reads own society" ON public.profiles FOR SELECT TO authenticated
USING (society IS NOT NULL AND society = ANY (public.chair_societies(auth.uid())));
CREATE POLICY "own profile update" ON public.profiles FOR UPDATE TO authenticated
USING (id = auth.uid()) WITH CHECK (id = auth.uid());
CREATE POLICY "editors update profiles" ON public.profiles FOR UPDATE TO authenticated
USING (public.can_edit_members(auth.uid())) WITH CHECK (public.can_edit_members(auth.uid()));
CREATE POLICY "editors delete profiles" ON public.profiles FOR DELETE TO authenticated
USING (public.can_edit_members(auth.uid()));

-- user_roles policies
CREATE POLICY "read own roles" ON public.user_roles FOR SELECT TO authenticated
USING (user_id = auth.uid() OR public.can_view_all_members(auth.uid()));

-- positions policies
CREATE POLICY "positions readable by authenticated" ON public.positions FOR SELECT TO authenticated
USING (true);
CREATE POLICY "editors manage positions" ON public.positions FOR ALL TO authenticated
USING (public.can_edit_members(auth.uid())) WITH CHECK (public.can_edit_members(auth.uid()));

-- events policies
CREATE POLICY "events public read" ON public.events FOR SELECT TO anon, authenticated
USING (true);
CREATE POLICY "editors manage events" ON public.events FOR ALL TO authenticated
USING (public.can_edit_members(auth.uid())) WITH CHECK (public.can_edit_members(auth.uid()));

-- photos policies
CREATE POLICY "photos public read" ON public.photos FOR SELECT TO anon, authenticated
USING (true);
CREATE POLICY "editors manage photos" ON public.photos FOR ALL TO authenticated
USING (public.can_edit_members(auth.uid())) WITH CHECK (public.can_edit_members(auth.uid()));
