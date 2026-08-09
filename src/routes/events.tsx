import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CalendarDays } from "lucide-react";

import { PageHeader } from "@/components/site/PageHeader";
import { events as fallbackEvents } from "@/data/site";
import { supabase } from "@/integrations/supabase/client";
import eventsHero from "@/assets/events-hero.png";
import eventImage from "@/assets/tech-event.png";
import workshopImage from "@/assets/workshop-hands-on.png";
import collaborationImage from "@/assets/students-collaboration.png";

export const Route = createFileRoute("/events")({
  head: () => ({
    meta: [
      { title: "Events & Workshops — IEEE BBDITM" },
      {
        name: "description",
        content:
          "Flagship summits, chapter days, bootcamps and workshops hosted by the IEEE BBDITM Student Branch.",
      },
      { property: "og:title", content: "Events & Workshops — IEEE BBDITM" },
      {
        property: "og:description",
        content: "Flagship summits, chapter days, bootcamps and workshops at IEEE BBDITM.",
      },
      { property: "og:url", content: "/events" },
    ],
    links: [{ rel: "canonical", href: "/events" }],
  }),
  component: EventsPage,
});

const filters = ["All", "Flagship", "Chapter", "Branch", "Workshop"] as const;

const eventCardImages = [eventImage, workshopImage, collaborationImage];

type EventItem = {
  title: string;
  date: string;
  type: string;
  status: string;
  description: string;
  video_url?: string;
  cover_image_url?: string;
};

function EventsPage() {
  const [active, setActive] = useState<(typeof filters)[number]>("All");
  const [events, setEvents] = useState<EventItem[]>(fallbackEvents);

  useEffect(() => {
    supabase
      .from("events")
      .select("title, description, event_date, date_label, type, status, video_url, cover_image_url")
      .order("event_date", { ascending: true })
      .then(({ data }) => {
        if (data && data.length > 0) {
          setEvents(
            data.map((e) => ({
              title: e.title,
              date: e.date_label ?? e.event_date ?? "Date TBA",
              type: e.type,
              status: e.status,
              description: e.description ?? "",
              video_url: e.video_url ?? undefined,
              cover_image_url: e.cover_image_url ?? undefined,
            })),
          );
        }
      });
  }, []);

  const list = active === "All" ? events : events.filter((e) => e.type === active);

  return (
    <>
      {/* Hero banner with image */}
      <section className="relative overflow-hidden min-h-[40vh] flex items-center">
        <img
          src={eventsHero}
          alt="IEEE BBDITM tech event auditorium"
          className="pointer-events-none absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/30" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        <div className="section-shell relative z-10 py-20">
          <span className="text-xs font-semibold uppercase tracking-widest text-primary-foreground/70">
            Events
          </span>
          <h1 className="mt-3 max-w-2xl text-3xl font-bold text-white md:text-5xl drop-shadow-lg">
            Everything we run through the year
          </h1>
          <p className="mt-4 max-w-lg text-sm leading-relaxed text-white/80 md:text-base">
            From our flagship summit to chapter days and hands-on bootcamps — filter by the kind of event you're after.
          </p>
        </div>
      </section>

      <section className="section-shell py-16">
        <div className="flex flex-wrap gap-2">
          {filters.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setActive(f)}
              className={
                f === active
                  ? "rounded-full bg-primary px-4 py-1.5 text-sm font-semibold text-primary-foreground"
                  : "rounded-full border border-border bg-card px-4 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              }
            >
              {f}
            </button>
          ))}
        </div>

        <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {list.map((e, i) => (
            <article
              key={e.title}
              className="group overflow-hidden rounded-xl card-elevated"
            >
              <div className="relative h-48 overflow-hidden bg-black">
                {e.video_url ? (
                  <iframe
                    src={e.video_url.replace("watch?v=", "embed/")}
                    title={e.title}
                    className="h-full w-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <img
                    src={e.cover_image_url ?? eventCardImages[i % eventCardImages.length]}
                    alt={e.title}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                )}
                {!e.video_url && <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />}
                <span className="absolute top-3 right-3 rounded-full bg-primary/90 px-2.5 py-0.5 text-[10px] font-bold uppercase text-white backdrop-blur-sm z-10 shadow-sm pointer-events-none">
                  {e.status}
                </span>
              </div>
              <div className="p-6">
                <div className="flex items-center justify-between gap-3">
                  <span className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                    <CalendarDays className="h-4 w-4 text-primary" />
                    {e.date}
                  </span>
                </div>
                <h2 className="mt-3 text-lg font-semibold">{e.title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{e.description}</p>
              </div>
            </article>
          ))}
        </div>

        {list.length === 0 && (
          <p className="mt-10 text-sm text-muted-foreground">No events in this category yet.</p>
        )}
      </section>
    </>
  );
}