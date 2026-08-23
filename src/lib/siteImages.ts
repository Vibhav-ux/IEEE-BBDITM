import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

// All registered image slots across the site
export const SITE_IMAGE_SLOTS = [
  // Home page (hero is a video — not listed here)
  { key: "home-collaboration", label: "Collaboration photo",        section: "Home" },
  { key: "home-event",         label: "Tech event photo",           section: "Home" },
  { key: "home-workshop",      label: "Workshop photo",             section: "Home" },
  { key: "home-cta-bg",        label: "CTA section background",     section: "Home" },
  // About page
  { key: "about-campus",       label: "Campus aerial photo",        section: "About" },
  { key: "about-collaboration",label: "Students collaboration",     section: "About" },
  // Society cards
  { key: "society-cs",         label: "Computer Society card",      section: "Societies" },
  { key: "society-pes",        label: "Power & Energy card",        section: "Societies" },
  { key: "society-wie",        label: "Women in Engineering card",  section: "Societies" },
  { key: "society-sight",      label: "SIGHT card",                 section: "Societies" },
  { key: "society-sps",        label: "Signal Processing card",     section: "Societies" },
  { key: "society-pels",       label: "Power Electronics card",     section: "Societies" },
  { key: "society-emb",        label: "Medicine & Biology card",    section: "Societies" },
  // Page heroes
  { key: "hero-chapters",      label: "Chapters page hero",         section: "Page Heroes" },
  { key: "hero-events",        label: "Events page hero",           section: "Page Heroes" },
  { key: "hero-join",          label: "Join page hero",             section: "Page Heroes" },
  { key: "hero-team",          label: "Team/Committee hero",        section: "Page Heroes" },
  { key: "hero-contact",       label: "Contact page hero",          section: "Page Heroes" },
] as const;

export type SiteImageKey = (typeof SITE_IMAGE_SLOTS)[number]["key"];

// Cache so we don't refetch the same key repeatedly
const cache: Record<string, string | null> = {};

export function useSiteImage(key: SiteImageKey, fallback: string): string {
  const [url, setUrl] = useState<string>(() => cache[key] ?? fallback);

  useEffect(() => {
    if (cache[key] !== undefined) {
      setUrl(cache[key] ?? fallback);
      return;
    }
    supabase
      .from("site_images")
      .select("image_url")
      .eq("key", key)
      .maybeSingle()
      .then(({ data }) => {
        const resolved = data?.image_url ?? null;
        cache[key] = resolved;
        setUrl(resolved ?? fallback);
      });
  }, [key, fallback]);

  return url;
}
