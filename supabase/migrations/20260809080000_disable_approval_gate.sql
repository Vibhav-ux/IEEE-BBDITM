-- ─── Disable Pending-Approval Gate ──────────────────────────────────────────
-- New registrations are now auto-approved (no counsellor review needed).

-- 1. Approve any currently pending users
UPDATE public.profiles SET status = 'approved' WHERE status = 'pending';

-- 2. Update handle_new_user so new signups are created as 'approved' immediately
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
    'approved'   -- auto-approve: no counsellor review required
  );
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'member')
  ON CONFLICT DO NOTHING;
  RETURN NEW;
END; $$;
