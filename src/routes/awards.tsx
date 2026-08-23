import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Trophy, Award, Star, Medal } from "lucide-react";

import { PageHeader } from "@/components/site/PageHeader";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/awards")({
  head: () => ({
    meta: [
      { title: "Awards & Recognition — IEEE BBDITM Student Branch" },
      {
        name: "description",
        content:
          "Celebrating the achievements and recognition received by IEEE BBDITM members, teams, and the student branch.",
      },
      { property: "og:title", content: "Awards & Recognition — IEEE BBDITM" },
      { property: "og:url", content: "/awards" },
    ],
    links: [{ rel: "canonical", href: "/awards" }],
  }),
  component: AwardsPage,
});

type Award = {
  id: string;
  title: string;
  recipient: string;
  category: string;
  year: number;
  description: string | null;
  image_url: string | null;
  awarded_by: string | null;
};

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  "Technical Excellence": Trophy,
  "Leadership": Star,
  "Best Paper": Medal,
  "Humanitarian": Award,
  "General": Award,
};

type CategoryStyle = { from: string; to: string; border: string; text: string };

const CATEGORY_STYLES: Record<string, CategoryStyle> = {
  "Technical Excellence": { from: "from-amber-500/20",  to: "to-yellow-500/10",  border: "border-amber-500/30",  text: "text-amber-600 dark:text-amber-400" },
  "Leadership":           { from: "from-blue-500/20",   to: "to-indigo-500/10",  border: "border-blue-500/30",   text: "text-blue-600 dark:text-blue-400" },
  "Best Paper":           { from: "from-purple-500/20", to: "to-violet-500/10",  border: "border-purple-500/30", text: "text-purple-600 dark:text-purple-400" },
  "Humanitarian":         { from: "from-green-500/20",  to: "to-emerald-500/10", border: "border-green-500/30",  text: "text-green-600 dark:text-green-400" },
  "General":              { from: "from-primary/20",    to: "to-primary/10",     border: "border-primary/30",    text: "text-primary" },
};

const DEFAULT_STYLE: CategoryStyle = CATEGORY_STYLES["General"]!;

function getCategoryStyle(category: string): CategoryStyle {
  return CATEGORY_STYLES[category] ?? DEFAULT_STYLE;
}

function getCategoryIcon(category: string) {
  return CATEGORY_ICONS[category] ?? Award;
}

function AwardsPage() {
  const [awards, setAwards] = useState<Award[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState<number | "all">("all");

  useEffect(() => {
    supabase
      .from("awards")
      .select("*")
      .order("year", { ascending: false })
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setAwards((data ?? []) as Award[]);
        setLoading(false);
      });
  }, []);

  const years = [...new Set(awards.map((a) => a.year))].sort((a, b) => b - a);
  const filtered =
    selectedYear === "all" ? awards : awards.filter((a) => a.year === selectedYear);

  // Group by year for display
  const byYear = filtered.reduce<Record<number, Award[]>>((acc, award) => {
    if (!acc[award.year]) acc[award.year] = [];
    acc[award.year]!.push(award);
    return acc;
  }, {});

  return (
    <>
      <PageHeader
        eyebrow="Recognition"
        title="Awards & Achievements"
        description="Celebrating the milestones, honours, and recognitions earned by IEEE BBDITM members, teams, and the student branch."
      />

      <section className="section-shell py-12">
        {/* Year filter */}
        {years.length > 1 && (
          <div className="mb-10 flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedYear("all")}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all ${
                selectedYear === "all"
                  ? "bg-primary text-primary-foreground shadow"
                  : "bg-secondary text-muted-foreground hover:text-foreground"
              }`}
            >
              All years
            </button>
            {years.map((y) => (
              <button
                key={y}
                onClick={() => setSelectedYear(y)}
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all ${
                  selectedYear === y
                    ? "bg-primary text-primary-foreground shadow"
                    : "bg-secondary text-muted-foreground hover:text-foreground"
                }`}
              >
                {y}
              </button>
            ))}
          </div>
        )}

        {loading && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-48 rounded-2xl bg-secondary/60 animate-pulse" />
            ))}
          </div>
        )}

        {!loading && awards.length === 0 && (
          <div className="flex flex-col items-center gap-4 py-24 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
              <Trophy className="h-8 w-8 text-primary/50" />
            </div>
            <p className="text-lg font-semibold">No awards yet</p>
            <p className="max-w-sm text-sm text-muted-foreground">
              Check back soon — this is where achievements of the branch will be celebrated.
            </p>
          </div>
        )}

        {!loading &&
          Object.entries(byYear)
            .sort(([a], [b]) => Number(b) - Number(a))
            .map(([year, items]) => (
              <div key={year} className="mb-14">
                {/* Year heading */}
                <div className="mb-6 flex items-center gap-4">
                  <span className="font-display text-3xl font-bold text-shimmer">{year}</span>
                  <div className="h-px flex-1 bg-border" />
                  <span className="text-xs text-muted-foreground">
                    {items.length} award{items.length !== 1 ? "s" : ""}
                  </span>
                </div>

                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {items.map((award) => {
                    const Icon = getCategoryIcon(award.category);
                    const s = getCategoryStyle(award.category);
                    return (
                      <article
                        key={award.id}
                        className="group relative overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg"
                      >
                        {/* Gradient top strip */}
                        <div
                          className={`h-1.5 w-full bg-linear-to-r ${s.from} ${s.to}`}
                        />

                        {award.image_url ? (
                          <img
                            src={award.image_url}
                            alt={award.title}
                            className="h-40 w-full object-cover"
                          />
                        ) : (
                          <div
                            className={`flex h-28 items-center justify-center bg-linear-to-br ${s.from} ${s.to}`}
                          >
                            <Icon className={`h-12 w-12 opacity-40 ${s.text}`} />
                          </div>
                        )}

                        <div className="p-5">
                          {/* Category badge */}
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full border ${s.border} px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider bg-linear-to-r ${s.from} ${s.to} ${s.text}`}
                          >
                            <Icon className="h-3 w-3" />
                            {award.category}
                          </span>

                          <h3 className="mt-3 text-base font-bold leading-tight">{award.title}</h3>
                          <p className="mt-1 text-sm font-medium text-primary">{award.recipient}</p>

                          {award.description && (
                            <p className="mt-2 text-xs leading-relaxed text-muted-foreground line-clamp-3">
                              {award.description}
                            </p>
                          )}

                          {award.awarded_by && (
                            <p className="mt-3 border-t border-border pt-3 text-[11px] text-muted-foreground">
                              Awarded by{" "}
                              <span className="font-medium text-foreground">{award.awarded_by}</span>
                            </p>
                          )}
                        </div>
                      </article>
                    );
                  })}
                </div>
              </div>
            ))}
      </section>
    </>
  );
}
