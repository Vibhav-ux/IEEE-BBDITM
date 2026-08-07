import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, CalendarDays, Sparkles, Users } from "lucide-react";

import heroImage from "@/assets/hero.jpg";
import { benefits, chapters, events, stats } from "@/data/site";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "IEEE BBDITM Student Branch — Technology, Community, Impact" },
      {
        name: "description",
        content:
          "Official home of the IEEE BBDITM Student Branch, Lucknow: chapters, flagship events, workshops and student membership.",
      },
      { property: "og:title", content: "IEEE BBDITM Student Branch" },
      {
        property: "og:description",
        content: "Chapters, flagship events, workshops and membership at IEEE BBDITM, Lucknow.",
      },
      { property: "og:url", content: "/" },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
  component: Index,
});

function Index() {
  const upcoming = events.filter((e) => e.status !== "Past").slice(0, 3);

  return (
    <>
      <section className="relative overflow-hidden border-b border-border">
        <img
          src={heroImage}
          alt=""
          aria-hidden="true"
          width={1600}
          height={1100}
          className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-90"
        />
        <div className="section-shell relative py-24 md:py-32">
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-semibold text-accent-foreground">
            <Sparkles className="h-3.5 w-3.5" />
            IEEE UP Section · Region 10
          </span>
          <h1 className="mt-6 max-w-3xl text-4xl font-bold leading-[1.05] md:text-6xl">
            IEEE BBDITM Student Branch
          </h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground md:text-lg">
            A student-run engineering community at Babu Banarasi Das Institute of Technology and
            Management, Lucknow — building projects, running events and advancing technology for
            the benefit of humanity.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/join"
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
            >
              Become a member <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/events"
              className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-5 py-3 text-sm font-semibold transition-colors hover:bg-secondary"
            >
              Explore events
            </Link>
          </div>

          <dl className="mt-16 grid max-w-3xl grid-cols-2 gap-px overflow-hidden rounded-xl border border-border bg-border md:grid-cols-4">
            {stats.map((s) => (
              <div key={s.label} className="bg-card px-5 py-6">
                <dt className="font-display text-2xl font-bold text-primary">{s.value}</dt>
                <dd className="mt-1 text-xs text-muted-foreground">{s.label}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="section-shell py-20">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold md:text-3xl">Chapters & affinity groups</h2>
            <p className="mt-2 max-w-lg text-sm text-muted-foreground">
              Five specialised communities, each with its own events, mentors and projects.
            </p>
          </div>
          <Link
            to="/chapters"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary"
          >
            View all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {chapters.slice(0, 3).map((c) => (
            <article
              key={c.slug}
              className="rounded-xl border border-border bg-card p-6 transition-shadow hover:shadow-lg"
            >
              <p className="text-xs font-semibold uppercase tracking-wide text-primary">
                {c.tagline}
              </p>
              <h3 className="mt-2 text-lg font-semibold">{c.name}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{c.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="border-y border-border bg-secondary/40 py-20">
        <div className="section-shell">
          <h2 className="text-2xl font-bold md:text-3xl">What's next</h2>
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {upcoming.map((e) => (
              <article key={e.title} className="rounded-xl border border-border bg-card p-6">
                <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                  <CalendarDays className="h-4 w-4 text-primary" />
                  {e.date}
                </div>
                <h3 className="mt-3 text-lg font-semibold">{e.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {e.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section-shell py-20">
        <h2 className="text-2xl font-bold md:text-3xl">Why students join</h2>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {benefits.map((b) => (
            <div key={b.title} className="rounded-xl border border-border bg-card p-6">
              <Users className="h-5 w-5 text-primary" />
              <h3 className="mt-4 text-base font-semibold">{b.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{b.body}</p>
            </div>
          ))}
        </div>

        <div className="mt-14 rounded-2xl border border-border bg-primary px-8 py-12 text-center">
          <h2 className="text-2xl font-bold text-primary-foreground md:text-3xl">
            Ready to build with us?
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-sm text-primary-foreground/80">
            Membership is open to every BBDITM student. Volunteering applications stay open all
            year.
          </p>
          <Link
            to="/join"
            className="mt-7 inline-flex items-center gap-2 rounded-lg bg-card px-5 py-3 text-sm font-semibold text-foreground"
          >
            Join IEEE BBDITM <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </>
  );
}
