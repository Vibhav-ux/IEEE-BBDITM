import { supabase } from "@/integrations/supabase/client";

export type Photo = {
  id: string;
  title: string | null;
  album: string;
  caption: string | null;
  image_url: string;
  storage_path: string | null;
  created_at: string;
};

export async function loadPhotos(): Promise<(Photo & { url: string })[]> {
  const { data } = await supabase
    .from("photos")
    .select("*")
    .order("created_at", { ascending: false });
  const photos = (data ?? []) as Photo[];
  const paths = photos.map((p) => p.storage_path).filter(Boolean) as string[];
  const signed = paths.length
    ? (await supabase.storage.from("gallery").createSignedUrls(paths, 60 * 60)).data ?? []
    : [];
  const map = new Map(signed.map((s) => [s.path ?? "", s.signedUrl]));
  return photos.map((p) => ({
    ...p,
    url: (p.storage_path && map.get(p.storage_path)) || p.image_url,
  }));
}