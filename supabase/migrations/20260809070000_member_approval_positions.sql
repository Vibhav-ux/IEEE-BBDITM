-- ─── Member Approval System & Position Enhancements ───────────────────────────

-- 1. Add status, desired_position, desired_society to profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS status text DEFAULT 'pending'
    CHECK (status IN ('pending', 'approved', 'rejected')),
  ADD COLUMN IF NOT EXISTS desired_position text,
  ADD COLUMN IF NOT EXISTS desired_society  text;

-- 2. Existing users (before this migration) are already approved
UPDATE public.profiles SET status = 'approved' WHERE status IS NULL OR status = 'pending';

-- Wait — but new users should be pending. The UPDATE above approves ALL existing.
-- We only want to approve users who already existed, which is everyone right now.
-- New signups will default to 'pending' via the column default.

-- 3. Update handle_new_user to persist desired_position and desired_society
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (
    id, full_name, email, ieee_member_id, branch, year_of_study,
    society, phone, enrollment_no, desired_position, desired_society, status
  )
  VALUES (
    NEW.id,
    coalesce(NEW.raw_user_meta_data->>'full_name',''),
    NEW.email,
    NEW.raw_user_meta_data->>'ieee_member_id',
    NEW.raw_user_meta_data->>'branch',
    NEW.raw_user_meta_data->>'year_of_study',
    NEW.raw_user_meta_data->>'society',
    NEW.raw_user_meta_data->>'phone',
    NEW.raw_user_meta_data->>'enrollment_no',
    NEW.raw_user_meta_data->>'desired_position',
    NEW.raw_user_meta_data->>'desired_society',
    'pending'
  );
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'member')
  ON CONFLICT DO NOTHING;
  RETURN NEW;
END; $$;

-- 4. Counsellors can approve / reject profiles (update status, assign position)
CREATE POLICY "Counsellors can approve members" ON public.profiles
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid() AND ur.role = 'counsellor'
    )
  );

-- 5. Users can read their own profile (including status) — already exists,
--    but make sure the select policy allows the status field (it reads the whole row).

-- 6. Allow counsellors to insert positions on behalf of any user
--    (They already can INSERT through existing policies, but be explicit)
DO $$ BEGIN
  CREATE POLICY "Counsellors can insert positions" ON public.positions
    FOR INSERT WITH CHECK (
      EXISTS (
        SELECT 1 FROM public.user_roles ur
        WHERE ur.user_id = auth.uid() AND ur.role = 'counsellor'
      )
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Counsellors can delete positions" ON public.positions
    FOR DELETE USING (
      EXISTS (
        SELECT 1 FROM public.user_roles ur
        WHERE ur.user_id = auth.uid() AND ur.role = 'counsellor'
      )
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 7. Index for fast lookup of positions per society
CREATE INDEX IF NOT EXISTS idx_positions_society ON public.positions (society);
CREATE INDEX IF NOT EXISTS idx_positions_user_id ON public.positions (user_id);
