import { createFileRoute } from "@tanstack/react-router";

import { PageHeader } from "@/components/site/PageHeader";
import { team } from "@/data/site";

export const Route = createFileRoute("/team")({
  head: () => ({
    meta: [
      { title: "Executive Committee — IEEE BBDITM" },
      {
        name: "description",
        content:
          "Meet the student executive committee leading the IEEE BBDITM Student Branch this term.",
      },
      { property: "og:title", content: "Executive Committee — IEEE BBDITM" },
      {
        property: "og:description",
        content: "The student volunteers leading the IEEE BBDITM Student Branch.",
      },
      { property: "og:url", content: "/team" },
    ],
    links: [{ rel: "canonical", href: "/team" }],
  }),
  component: TeamPage,
});

function TeamPage() {
  return (
    <>
      <PageHeader
        eyebrow="Team"
        title="The executive committee"
        description="Student volunteers who plan the calendar, run the chapters and keep the branch moving. Names update each term after the Annual General Meeting."
      />
      <section className="section-shell grid gap-5 py-16 sm:grid-cols-2 lg:grid-cols-3">
        {team.map((m) => (
          <article key={m.role} className="rounded-xl border border-border bg-card p-6">
            <div className="grid h-12 w-12 place-items-center rounded-full bg-primary-soft font-display text-sm font-bold text-accent-foreground">
              {m.role.slice(0, 2).toUpperCase()}
            </div>
            <h2 className="mt-4 text-base font-semibold">{m.role}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{m.area}</p>
          </article>
        ))}
      </section>
    </>
  );
}