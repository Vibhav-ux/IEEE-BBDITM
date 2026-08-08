import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";

import { PageHeader } from "@/components/site/PageHeader";
import { faculty, officeBearers, societies } from "@/data/site";

export const Route = createFileRoute("/team")({
  head: () => ({
    meta: [
      { title: "Our Team — IEEE BBDITM" },
      { name: "description", content: "Meet the IEEE BBDITM Student Branch Executive Committee 2026 — faculty advisors and student leaders." },
      { property: "og:title", content: "Our Team — IEEE BBDITM" },
    ],
    links: [{ rel: "canonical", href: "/team" }],
  }),
  component: TeamPage,
});

function PersonCard({ name, role, subtitle }: { name: string; role: string; subtitle?: string }) {
  const initials = name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
  return (
    <div className="group rounded-xl card-elevated p-5 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 font-display text-base font-bold text-primary transition-all group-hover:bg-primary group-hover:text-primary-foreground group-hover:shadow-md">
        {initials}
      </div>
      <h3 className="mt-3 text-sm font-semibold">{name}</h3>
      <p className="mt-0.5 text-xs font-medium text-primary">{role}</p>
      {subtitle && <p className="mt-0.5 text-[11px] text-muted-foreground">{subtitle}</p>}
    </div>
  );
}

function TeamPage() {
  const societyMap = Object.fromEntries(societies.map((s) => [s.slug, s]));

  return (
    <>
      <PageHeader
        eyebrow="Our team"
        title="The people behind IEEE BBDITM"
        description="Faculty advisors and student leaders driving the IEEE BBDITM Student Branch."
      />

      {/* Faculty */}
      <section className="section-shell py-16">
        <h2 className="text-xl font-bold md:text-2xl text-shimmer">Faculty & Leadership</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {faculty.map((f) => (
            <PersonCard key={f.name} name={f.name} role={f.role} subtitle={f.affiliation} />
          ))}
        </div>
      </section>

      {/* Branch exec */}
      <section className="section-shell pb-16">
        <h2 className="text-xl font-bold md:text-2xl text-shimmer">Student Branch Executive</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {officeBearers.branch.map((m) => (
            <PersonCard key={m.name} name={m.name} role={m.role} subtitle={m.society} />
          ))}
        </div>
      </section>

      {/* Society leaders */}
      <section className="section-shell pb-16">
        <h2 className="text-xl font-bold md:text-2xl text-shimmer">Society Leaders</h2>
        <div className="mt-6 space-y-10">
          {(["cs", "wie", "sps", "pels", "emb", "sight"] as const).map((slug) => {
            const members = officeBearers[slug];
            if (!members || members.length === 0) return null;
            const society = societyMap[slug];
            return (
              <div key={slug}>
                <div className="flex items-center gap-2 mb-4">
                  <span className="h-3 w-3 rounded-full" style={{ backgroundColor: society?.color ?? "#006699" }} />
                  <h3 className="text-base font-semibold">{society?.name ?? slug}</h3>
                </div>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {members.map((m) => (
                    <PersonCard key={m.name} name={m.name} role={m.role} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* CTA */}
      <section className="section-shell pb-20">
        <div className="rounded-2xl section-breathe p-8 text-center">
          <h2 className="text-xl font-bold">Want to see the full committee?</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            View all office bearers with detailed society breakdowns.
          </p>
          <Link
            to="/office-bearers"
            className="mt-4 inline-flex items-center gap-2 btn-primary rounded-lg px-5 py-2.5 text-sm font-semibold text-white"
          >
            Office Bearers 2026 <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </>
  );
}