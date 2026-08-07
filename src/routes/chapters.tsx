import { createFileRoute } from "@tanstack/react-router";

import { PageHeader } from "@/components/site/PageHeader";
import { chapters } from "@/data/site";

export const Route = createFileRoute("/chapters")({
  head: () => ({
    meta: [
      { title: "Chapters & Affinity Groups — IEEE BBDITM" },
      {
        name: "description",
        content:
          "Computer Society, PES, Women in Engineering, SIGHT and Robotics chapters at IEEE BBDITM Student Branch.",
      },
      { property: "og:title", content: "Chapters & Affinity Groups — IEEE BBDITM" },
      {
        property: "og:description",
        content: "Five specialised communities inside the IEEE BBDITM Student Branch.",
      },
      { property: "og:url", content: "/chapters" },
    ],
    links: [{ rel: "canonical", href: "/chapters" }],
  }),
  component: ChaptersPage,
});

function ChaptersPage() {
  return (
    <>
      <PageHeader
        eyebrow="Chapters"
        title="Find the community that fits your field"
        description="Each chapter runs its own events, projects and mentorship. Members can join more than one."
      />
      <section className="section-shell grid gap-5 py-16 sm:grid-cols-2 lg:grid-cols-3">
        {chapters.map((c) => (
          <article
            key={c.slug}
            className="flex flex-col rounded-xl border border-border bg-card p-6 transition-shadow hover:shadow-lg"
          >
            <span className="w-fit rounded-full bg-primary-soft px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-accent-foreground">
              {c.tagline}
            </span>
            <h2 className="mt-4 text-lg font-semibold">{c.name}</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{c.description}</p>
          </article>
        ))}
      </section>
    </>
  );
}