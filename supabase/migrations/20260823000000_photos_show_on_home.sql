-- Add show_on_home flag to photos table so admins can choose
-- which photos appear in the home page slideshow
ALTER TABLE public.photos
  ADD COLUMN IF NOT EXISTS show_on_home boolean NOT NULL DEFAULT false;
