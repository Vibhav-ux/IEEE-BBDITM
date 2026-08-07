import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { PageHeader } from "@/components/site/PageHeader";
import { loadPhotos, type Photo } from "@/lib/gallery";

export const Route = createFileRoute("/gallery")({
  head: () => ({
    meta: [
      { title: "Photo Album — IEEE BBDITM" },
      {
        name: "description",
        content:
          "Photographs from IEEE BBDITM Student Branch events, workshops, chapter activities and outreach drives.",
      },
      { property: "og:title", content: "Photo Album — IEEE BBDITM" },
      { property: "og:description", content: "Moments from IEEE BBDITM events and workshops." },
      { property: "og:url", content: "/gallery" },
    ],
    links: [{ rel: "canonical", href: "/gallery" }],
  }),
  component: GalleryPage,
});

function GalleryPage() {
  const [photos, setPhotos] = useState<(Photo & { url: string })[]>([]);
  const [album, setAlbum] = useState("All");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPhotos().then((p) => {
      setPhotos(p);
      setLoading(false);
    });
  }, []);

  const albums = ["All", ...Array.from(new Set(photos.map((p) => p.album)))];
  const list = album === "All" ? photos : photos.filter((p) => p.album === album);

  return (
    <>
      <PageHeader
        eyebrow="Album"
        title="Photo album"
        description="Highlights from our summits, chapter days, bootcamps and community drives."
      />

      <section className="section-shell py-16">
        {albums.length > 1 && (
          <div className="mb-8 flex flex-wrap gap-2">
            {albums.map((a) => (
              <button
                key={a}
                type="button"
                onClick={() => setAlbum(a)}
                className={
                  a === album
                    ? "rounded-full bg-primary px-4 py-1.5 text-sm font-semibold text-primary-foreground"
                    : "rounded-full border border-border bg-card px-4 py-1.5 text-sm font-medium text-muted-foreground"
                }
              >
                {a}
              </button>
            ))}
          </div>
        )}

        {loading ? (
          <p className="text-sm text-muted-foreground">Loading photos…</p>
        ) : list.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No photos yet — the branch team will start uploading soon.
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {list.map((p) => (
              <figure key={p.id} className="overflow-hidden rounded-xl border border-border bg-card">
                <img
                  src={p.url}
                  alt={p.title ?? p.caption ?? "IEEE BBDITM event photo"}
                  loading="lazy"
                  className="h-56 w-full object-cover"
                />
                <figcaption className="p-4">
                  <p className="text-sm font-semibold">{p.title ?? p.album}</p>
                  {p.caption && <p className="mt-1 text-xs text-muted-foreground">{p.caption}</p>}
                </figcaption>
              </figure>
            ))}
          </div>
        )}
      </section>
    </>
  );
}