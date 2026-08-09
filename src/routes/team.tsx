import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";

import { faculty, loadTeamFromDb, societies, SOCIETY_SLUGS, type TeamPerson } from "@/lib/team";
import teamHero from "@/assets/team-hero.png";

export const Route = createFileRoute("/team")({
  head: () => ({
    meta: [
      { title: "Our Team — IEEE BBDITM" },
      {
        name: "description",
        content:
          "Meet the IEEE BBDITM Student Branch Executive Committee 2026 — faculty advisors and student leaders.",
      },
      { property: "og:title", content: "Our Team — IEEE BBDITM" },
    ],
    links: [{ rel: "canonical", href: "/team" }],
  }),
  component: TeamPage,
});

function PersonCard({ person }: { person: TeamPerson }) {
  const initials = person.name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  return (
    <div className="group rounded-xl card-elevated p-5 text-center">
      {person.avatarUrl ? (
        <img
          src={person.avatarUrl}
          alt={person.name}
          className="mx-auto h-14 w-14 rounded-full object-cover"
        />
      ) : (
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 font-display text-base font-bold text-primary transition-all group-hover:bg-primary group-hover:text-primary-foreground group-hover:shadow-md">
          {initials}
        </div>
      )}
      <h3 className="mt-3 text-sm font-semibold">{person.name}</h3>
      <p className="mt-0.5 text-xs font-medium text-primary">{person.role}</p>
      {person.subtitle && (
        <p className="mt-0.5 text-[11px] text-muted-foreground">{person.subtitle}</p>
      )}
    </div>
  );
}

function TeamPage() {
  const societyMap = Object.fromEntries(societies.map((s) => [s.slug, s]));
  const [branch, setBranch] = useState<TeamPerson[]>([]);
  const [bySociety, setBySociety] = useState<Record<string, TeamPerson[]>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTeamFromDb().then((data) => {
      setBranch(data.branch);
      setBySociety(data.bySociety);
      setLoading(false);
    });
  }, []);

  return (
    <>
      {/* Hero banner */}
      <section className="relative overflow-hidden min-h-[40vh] flex items-center">
        <img
          src={teamHero}
          alt="IEEE BBDITM team collaboration"
          className="pointer-events-none absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-linear-to-r from-black/70 via-black/50 to-black/30" />
        <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent" />
        <div className="section-shell relative z-10 py-20">
          <span className="text-xs font-semibold uppercase tracking-widest text-primary-foreground/70">
            Our team
          </span>
          <h1 className="mt-3 max-w-2xl text-3xl font-bold text-white md:text-5xl drop-shadow-lg">
            The people behind IEEE BBDITM
          </h1>
          <p className="mt-4 max-w-lg text-sm leading-relaxed text-white/80 md:text-base">
            Faculty advisors and student leaders driving the IEEE BBDITM Student Branch.
          </p>
        </div>
      </section>

      <section className="section-shell py-16">
        <h2 className="text-xl font-bold md:text-2xl text-shimmer">Faculty & Leadership</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {faculty.map((f) => (
            <PersonCard
              key={f.name}
              person={{ name: f.name, role: f.role, subtitle: f.affiliation }}
            />
          ))}
        </div>
      </section>

      <section className="section-shell pb-16">
        <h2 className="text-xl font-bold md:text-2xl text-shimmer">Student Branch Executive</h2>
        {loading ? (
          <p className="mt-6 text-sm text-muted-foreground">Loading team…</p>
        ) : (
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            {branch.map((m) => (
              <PersonCard key={`${m.name}-${m.role}`} person={m} />
            ))}
          </div>
        )}
      </section>

      <section className="section-shell pb-16">
        <h2 className="text-xl font-bold md:text-2xl text-shimmer">Society Leaders</h2>
        <div className="mt-6 space-y-10">
          {SOCIETY_SLUGS.map((slug) => {
            const members = bySociety[slug];
            if (!members || members.length === 0) return null;
            const society = societyMap[slug];
            return (
              <div key={slug}>
                <div className="flex items-center gap-2 mb-4">
                  <span
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: society?.color ?? "#006699" }}
                  />
                  <h3 className="text-base font-semibold">{society?.name ?? slug}</h3>
                </div>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {members.map((m) => (
                    <PersonCard key={`${slug}-${m.name}-${m.role}`} person={m} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>

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
