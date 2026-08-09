import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { PageHeader } from "@/components/site/PageHeader";
import { faculty, loadTeamFromDb, societies, SOCIETY_SLUGS, type TeamPerson } from "@/lib/team";

export const Route = createFileRoute("/office-bearers")({
  head: () => ({
    meta: [
      { title: "Office Bearers 2026 — IEEE BBDITM" },
      {
        name: "description",
        content:
          "IEEE BBDITM Student Branch Executive Committee 2026 — leadership, society chairs and committee members.",
      },
      { property: "og:title", content: "Office Bearers 2026 — IEEE BBDITM" },
    ],
    links: [{ rel: "canonical", href: "/office-bearers" }],
  }),
  component: OfficeBearersPage,
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
          className="mx-auto h-16 w-16 rounded-full object-cover"
        />
      ) : (
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 font-display text-lg font-bold text-primary transition-all group-hover:bg-primary group-hover:text-primary-foreground group-hover:shadow-md">
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

function OfficeBearersPage() {
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
      <PageHeader
        eyebrow="Executive Committee"
        title="Office Bearers — 2026"
        description="The IEEE BBDITM Student Branch Executive Committee for the academic year 2025–26."
      />

      <section className="section-shell py-16">
        <h2 className="text-xl font-bold md:text-2xl text-shimmer">Faculty & Leadership</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Institutional leadership guiding the IEEE BBDITM Student Branch.
        </p>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
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
        <p className="mt-2 text-sm text-muted-foreground">
          The core team leading the IEEE BBDITM Student Branch.
        </p>
        {loading ? (
          <p className="mt-8 text-sm text-muted-foreground">Loading committee…</p>
        ) : (
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {branch.map((m) => (
              <PersonCard key={`${m.name}-${m.role}`} person={m} />
            ))}
          </div>
        )}
      </section>

      {SOCIETY_SLUGS.map((slug) => {
        const members = bySociety[slug];
        if (!members || members.length === 0) return null;
        const society = societyMap[slug];
        return (
          <section key={slug} className="section-shell pb-16">
            <div className="flex items-center gap-3">
              <span
                className="inline-block h-3 w-3 rounded-full"
                style={{ backgroundColor: society?.color ?? "#006699" }}
              />
              <h2 className="text-lg font-bold md:text-xl">
                {society?.name ?? slug.toUpperCase()}
              </h2>
            </div>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {members.map((m) => (
                <PersonCard key={`${slug}-${m.name}-${m.role}`} person={m} />
              ))}
            </div>
          </section>
        );
      })}
    </>
  );
}
