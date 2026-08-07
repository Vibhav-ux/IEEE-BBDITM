import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CalendarDays } from "lucide-react";

import { PageHeader } from "@/components/site/PageHeader";
import { events as fallbackEvents } from "@/data/site";
import { supabase } from "@/integrations/supabase/client";

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

type EventItem = {
  title: string;
  date: string;
  type: string;
  status: string;
  description: string;
};

function EventsPage() {
  const [active, setActive] = useState<(typeof filters)[number]>("All");
  const [events, setEvents] = useState<EventItem[]>(fallbackEvents);

  useEffect(() => {
    supabase
      .from("events")
      .select("title, description, event_date, date_label, type, status")
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
            })),
          );
        }
      });
  }, []);

  const list = active === "All" ? events : events.filter((e) => e.type === active);

  return (
    <>
      <PageHeader
        eyebrow="Events"
        title="Everything we run through the year"
        description="From our flagship summit to chapter days and hands-on bootcamps — filter by the kind of event you're after."
      />

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
          {list.map((e) => (
            <article key={e.title} className="flex flex-col rounded-xl border border-border bg-card p-6">
              <div className="flex items-center justify-between gap-3">
                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                  <CalendarDays className="h-4 w-4 text-primary" />
                  {e.date}
                </span>
                <span className="rounded-full bg-secondary px-2.5 py-1 text-[11px] font-semibold text-muted-foreground">
                  {e.status}
                </span>
              </div>
              <h2 className="mt-4 text-lg font-semibold">{e.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{e.description}</p>
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