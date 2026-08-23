-- =============================================================================
-- IEEE BBDITM — Complete Database Setup
-- =============================================================================
-- Run this file in Supabase Dashboard → SQL Editor to set up the entire DB.
-- This is a combined snapshot of all migrations as of 2026-08-23.
-- For future changes, add new sections at the bottom with a date comment.
-- =============================================================================


-- =============================================================================
-- SECTION 1 · Initial Schema (2026-08-07)
-- =============================================================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- App roles enum
DO $$ BEGIN
  CREATE TYPE public.app_role AS ENUM (
    'counsellor', 'chair', 'secretary', 'editor',
    'society_chair', 'member'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Members table
CREATE TABLE IF NOT EXISTS public.members (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid REFERENCES auth.users ON DELETE CASCADE,
  full_name     text NOT NULL,
  email         text UNIQUE NOT NULL,
  roll_number   text,
  branch        text,
  year          int,
  phone         text,
  society       text,
  avatar_url    text,
  status        text DEFAULT 'pending',
  created_at    timestamptz DEFAULT now()
);

-- User roles table
CREATE TABLE IF NOT EXISTS public.user_roles (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  role       public.app_role NOT NULL,
  society    text,
  created_at timestamptz DEFAULT now(),
  UNIQUE (user_id, role, society)
);

-- Helper: check if user can edit members
CREATE OR REPLACE FUNCTION public.can_edit_members(uid uuid)
RETURNS boolean LANGUAGE sql SECURITY DEFINER AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = uid
      AND role IN ('counsellor','chair','secretary','editor','society_chair')
  );
$$;

-- Events table
CREATE TABLE IF NOT EXISTS public.events (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title           text NOT NULL,
  description     text,
  event_date      date,
  date_label      text,
  type            text DEFAULT 'Branch',
  status          text DEFAULT 'Upcoming',
  location        text,
  video_url       text,
  society         text,
  cover_image_url text,
  created_at      timestamptz DEFAULT now()
);

-- Photos / gallery table
CREATE TABLE IF NOT EXISTS public.photos (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  storage_path text NOT NULL,
  title        text,
  album        text DEFAULT 'General',
  caption      text,
  uploaded_by  uuid REFERENCES auth.users,
  created_at   timestamptz DEFAULT now()
);

-- RLS on members
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  CREATE POLICY "members public read" ON public.members FOR SELECT TO anon, authenticated USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "members self insert" ON public.members FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "editors manage members" ON public.members FOR ALL TO authenticated
    USING (public.can_edit_members(auth.uid())) WITH CHECK (public.can_edit_members(auth.uid()));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  CREATE POLICY "roles public read" ON public.user_roles FOR SELECT TO anon, authenticated USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "counsellor manage roles" ON public.user_roles FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM public.user_roles r WHERE r.user_id = auth.uid() AND r.role = 'counsellor'))
    WITH CHECK (EXISTS (SELECT 1 FROM public.user_roles r WHERE r.user_id = auth.uid() AND r.role = 'counsellor'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- RLS on events
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  CREATE POLICY "events public read" ON public.events FOR SELECT TO anon, authenticated USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "editors manage events" ON public.events FOR ALL TO authenticated
    USING (public.can_edit_members(auth.uid())) WITH CHECK (public.can_edit_members(auth.uid()));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- RLS on photos
ALTER TABLE public.photos ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  CREATE POLICY "photos public read" ON public.photos FOR SELECT TO anon, authenticated USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "editors manage photos" ON public.photos FOR ALL TO authenticated
    USING (public.can_edit_members(auth.uid())) WITH CHECK (public.can_edit_members(auth.uid()));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

GRANT SELECT ON public.members, public.user_roles, public.events, public.photos TO anon;
GRANT ALL ON public.members, public.user_roles, public.events, public.photos TO authenticated;
GRANT ALL ON public.members, public.user_roles, public.events, public.photos TO service_role;


-- =============================================================================
-- SECTION 2 · Societies & Avatars (2026-08-08)
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.societies (
  slug        text PRIMARY KEY,
  name        text NOT NULL,
  description text,
  color       text,
  tagline     text,
  website_url text,
  created_at  timestamptz DEFAULT now()
);

-- Avatar URL column on members (safe add)
ALTER TABLE public.members ADD COLUMN IF NOT EXISTS avatar_url text;

ALTER TABLE public.societies ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  CREATE POLICY "societies public read" ON public.societies FOR SELECT TO anon, authenticated USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "counsellor manage societies" ON public.societies FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'counsellor'))
    WITH CHECK (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'counsellor'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

GRANT SELECT ON public.societies TO anon;
GRANT ALL ON public.societies TO authenticated, service_role;


-- =============================================================================
-- SECTION 3 · Fix Roles, Events, Team (2026-08-09)
-- =============================================================================

-- Add missing columns safely
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS society text;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS cover_image_url text;
ALTER TABLE public.photos  ADD COLUMN IF NOT EXISTS album text DEFAULT 'General';
ALTER TABLE public.photos  ADD COLUMN IF NOT EXISTS caption text;


-- =============================================================================
-- SECTION 4 · Contact & Newsletter (2026-08-09)
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.contact_messages (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name       text NOT NULL,
  email      text NOT NULL,
  subject    text,
  message    text NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.newsletter_subscribers (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email      text UNIQUE NOT NULL,
  name       text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  CREATE POLICY "anyone can submit contact" ON public.contact_messages FOR INSERT TO anon, authenticated WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "editors read contact" ON public.contact_messages FOR SELECT TO authenticated
    USING (public.can_edit_members(auth.uid()));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  CREATE POLICY "anyone can subscribe" ON public.newsletter_subscribers FOR INSERT TO anon, authenticated WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "editors read newsletter" ON public.newsletter_subscribers FOR SELECT TO authenticated
    USING (public.can_edit_members(auth.uid()));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

GRANT INSERT ON public.contact_messages TO anon;
GRANT INSERT ON public.newsletter_subscribers TO anon;
GRANT ALL ON public.contact_messages, public.newsletter_subscribers TO authenticated, service_role;


-- =============================================================================
-- SECTION 5 · Member Approval & Positions (2026-08-09)
-- =============================================================================

-- Positions table (committee roles per member)
CREATE TABLE IF NOT EXISTS public.positions (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id  uuid REFERENCES public.members ON DELETE CASCADE,
  title      text NOT NULL,
  society    text,
  start_date date,
  end_date   date,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.positions ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  CREATE POLICY "positions public read" ON public.positions FOR SELECT TO anon, authenticated USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "editors manage positions" ON public.positions FOR ALL TO authenticated
    USING (public.can_edit_members(auth.uid())) WITH CHECK (public.can_edit_members(auth.uid()));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

GRANT SELECT ON public.positions TO anon;
GRANT ALL ON public.positions TO authenticated, service_role;


-- =============================================================================
-- SECTION 6 · Positions Public Read (2026-08-22)
-- =============================================================================

-- Ensure anon can read positions (idempotent)
DO $$ BEGIN
  CREATE POLICY "anon positions read" ON public.positions FOR SELECT TO anon USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;


-- =============================================================================
-- SECTION 7 · Site Images (2026-08-22)
-- =============================================================================

-- Stores overrideable site-wide image slots (hero, banners, etc.)
CREATE TABLE IF NOT EXISTS public.site_images (
  key        text PRIMARY KEY,
  image_url  text NOT NULL,
  label      text,
  section    text,
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.site_images ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  CREATE POLICY "site_images public read" ON public.site_images FOR SELECT TO anon, authenticated USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "editors manage site_images" ON public.site_images FOR ALL TO authenticated
    USING (public.can_edit_members(auth.uid())) WITH CHECK (public.can_edit_members(auth.uid()));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

GRANT SELECT ON public.site_images TO anon;
GRANT ALL ON public.site_images TO authenticated, service_role;


-- =============================================================================
-- SECTION 8 · Photos Show On Home (2026-08-23)
-- =============================================================================

-- Allows selecting which gallery photos appear in the home slideshow
ALTER TABLE public.photos ADD COLUMN IF NOT EXISTS show_on_home boolean NOT NULL DEFAULT false;


-- =============================================================================
-- SECTION 9 · Awards & Recognition (2026-08-23)
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.awards (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title       text NOT NULL,
  recipient   text,
  category    text NOT NULL DEFAULT 'General',
  year        int NOT NULL DEFAULT EXTRACT(YEAR FROM now())::int,
  description text,
  image_url   text,
  storage_path text,
  awarded_by  text,
  created_at  timestamptz DEFAULT now()
);

ALTER TABLE public.awards ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  CREATE POLICY "awards public read" ON public.awards FOR SELECT TO anon, authenticated USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "editors manage awards" ON public.awards FOR ALL TO authenticated
    USING (public.can_edit_members(auth.uid())) WITH CHECK (public.can_edit_members(auth.uid()));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

GRANT SELECT ON public.awards TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.awards TO authenticated;
GRANT ALL ON public.awards TO service_role;


-- =============================================================================
-- SECTION 10 · Team Posters (2026-08-23)
-- =============================================================================

-- Group photos / collages for each session year.
-- show_on_home = true → displayed on landing page "Meet our team" section.
CREATE TABLE IF NOT EXISTS public.team_posters (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session      text NOT NULL,       -- e.g. '2025-26'
  label        text,                -- e.g. 'Executive Committee'
  image_url    text NOT NULL,
  storage_path text,
  show_on_home boolean NOT NULL DEFAULT false,
  created_at   timestamptz DEFAULT now()
);

ALTER TABLE public.team_posters ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  CREATE POLICY "team_posters public read" ON public.team_posters FOR SELECT TO anon, authenticated USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "editors manage team_posters" ON public.team_posters FOR ALL TO authenticated
    USING (public.can_edit_members(auth.uid())) WITH CHECK (public.can_edit_members(auth.uid()));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

GRANT SELECT ON public.team_posters TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.team_posters TO authenticated;
GRANT ALL ON public.team_posters TO service_role;


-- =============================================================================
-- HOW TO ADD FUTURE DATABASE CHANGES
-- =============================================================================
-- 1. Add a new section at the bottom following the same pattern:
--
--    -- =============================================================================
--    -- SECTION N · Feature Name (YYYY-MM-DD)
--    -- =============================================================================
--    ALTER TABLE ... ADD COLUMN IF NOT EXISTS ...;
--    CREATE TABLE IF NOT EXISTS ...;
--    -- etc.
--
-- 2. Also create a matching individual migration file in supabase/migrations/
--    named: YYYYMMDDHHMMSS_description.sql
--
-- 3. Commit and push both this file and the new migration file.
-- =============================================================================
