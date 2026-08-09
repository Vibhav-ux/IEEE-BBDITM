import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

import { loadPhotos, type Photo } from "@/lib/gallery";
import teamHero from "@/assets/team-hero.png";

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
  const [lightbox, setLightbox] = useState<number | null>(null); // index into `list`

  useEffect(() => {
    loadPhotos().then((p) => {
      setPhotos(p);
      setLoading(false);
    });
  }, []);

  const albums = ["All", ...Array.from(new Set(photos.map((p) => p.album)))];
  const list = album === "All" ? photos : photos.filter((p) => p.album === album);

  function openLightbox(idx: number) {
    setLightbox(idx);
    document.body.style.overflow = "hidden";
  }

  function closeLightbox() {
    setLightbox(null);
    document.body.style.overflow = "";
  }

  function prev() {
    if (lightbox === null) return;
    setLightbox((lightbox - 1 + list.length) % list.length);
  }

  function next() {
    if (lightbox === null) return;
    setLightbox((lightbox + 1) % list.length);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowLeft") prev();
    if (e.key === "ArrowRight") next();
    if (e.key === "Escape") closeLightbox();
  }

  return (
    <>
      {/* Hero banner */}
      <section className="relative overflow-hidden min-h-[40vh] flex items-center">
        <img
          src={teamHero}
          alt="IEEE BBDITM student branch team"
          className="pointer-events-none absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-linear-to-r from-black/70 via-black/50 to-black/30" />
        <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent" />
        <div className="section-shell relative z-10 py-20">
          <span className="text-xs font-semibold uppercase tracking-widest text-primary-foreground/70">
            Album
          </span>
          <h1 className="mt-3 max-w-2xl text-3xl font-bold text-white md:text-5xl drop-shadow-lg">
            Photo album
          </h1>
          <p className="mt-4 max-w-lg text-sm leading-relaxed text-white/80 md:text-base">
            Highlights from our summits, chapter days, bootcamps and community drives.
          </p>
        </div>
      </section>

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
            {list.map((p, idx) => (
              <figure
                key={p.id}
                className="group overflow-hidden rounded-xl border border-border bg-card cursor-pointer"
                onClick={() => openLightbox(idx)}
              >
                <div className="relative overflow-hidden">
                  <img
                    src={p.url}
                    alt={p.title ?? p.caption ?? "IEEE BBDITM event photo"}
                    loading="lazy"
                    className="h-56 w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/20 flex items-center justify-center">
                    <span className="rounded-full bg-white/80 px-3 py-1 text-xs font-semibold text-foreground opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm">
                      View
                    </span>
                  </div>
                </div>
                <figcaption className="p-4">
                  <p className="text-sm font-semibold">{p.title ?? p.album}</p>
                  {p.caption && <p className="mt-1 text-xs text-muted-foreground">{p.caption}</p>}
                </figcaption>
              </figure>
            ))}
          </div>
        )}
      </section>

      {/* Lightbox */}
      {lightbox !== null && list[lightbox] && (
        <div
          role="dialog"
          aria-modal="true"
          tabIndex={0}
          onKeyDown={handleKeyDown}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm"
          onClick={closeLightbox}
        >
          {/* Close */}
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 z-10 rounded-full bg-white/15 p-2 text-white hover:bg-white/30 transition-colors"
            aria-label="Close"
          >
            <X className="h-6 w-6" />
          </button>

          {/* Prev */}
          {list.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                prev();
              }}
              className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/15 p-3 text-white hover:bg-white/30 transition-colors"
              aria-label="Previous photo"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
          )}

          {/* Image */}
          <div className="relative max-h-[90vh] max-w-[90vw]" onClick={(e) => e.stopPropagation()}>
            <img
              src={list[lightbox].url}
              alt={list[lightbox].title ?? list[lightbox].caption ?? "Photo"}
              className="max-h-[80vh] max-w-[85vw] rounded-lg object-contain shadow-2xl"
            />
            {(list[lightbox].title || list[lightbox].caption) && (
              <div className="absolute bottom-0 left-0 right-0 rounded-b-lg bg-black/60 px-4 py-3 backdrop-blur-sm">
                {list[lightbox].title && (
                  <p className="text-sm font-semibold text-white">{list[lightbox].title}</p>
                )}
                {list[lightbox].caption && (
                  <p className="mt-0.5 text-xs text-white/70">{list[lightbox].caption}</p>
                )}
                <p className="mt-1 text-[10px] text-white/50">
                  {lightbox + 1} / {list.length} · {list[lightbox].album}
                </p>
              </div>
            )}
          </div>

          {/* Next */}
          {list.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                next();
              }}
              className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/15 p-3 text-white hover:bg-white/30 transition-colors"
              aria-label="Next photo"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          )}
        </div>
      )}
    </>
  );
}
