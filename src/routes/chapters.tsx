import { createFileRoute } from "@tanstack/react-router";

import { PageHeader } from "@/components/site/PageHeader";
import { societies as fallbackSocieties } from "@/data/site";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import chaptersHero from "@/assets/chapters-hero.png";

const chapterImages: Record<string, string> = {
  cs: "https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=600&h=400&fit=crop",
  pes: "https://images.unsplash.com/photo-1509390144018-eeaf65052242?w=600&h=400&fit=crop",
  wie: "https://images.unsplash.com/photo-1573164713988-8665fc963095?w=600&h=400&fit=crop",
  sight: "https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=600&h=400&fit=crop",
  sps: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=600&h=400&fit=crop",
  pels: "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=600&h=400&fit=crop",
  emb: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=600&h=400&fit=crop",
};

export const Route = createFileRoute("/chapters")({
  head: () => ({
    meta: [
      { title: "Societies & Affinity Groups — IEEE BBDITM" },
      {
        name: "description",
        content:
          "Computer Society, PES, WIE, SIGHT, SPS, PELS and EMB societies at IEEE BBDITM Student Branch.",
      },
      { property: "og:title", content: "Societies & Affinity Groups — IEEE BBDITM" },
      {
        property: "og:description",
        content: "Seven specialised societies inside the IEEE BBDITM Student Branch.",
      },
      { property: "og:url", content: "/chapters" },
    ],
    links: [{ rel: "canonical", href: "/chapters" }],
  }),
  component: ChaptersPage,
});

function ChaptersPage() {
  const [dbSocieties, setDbSocieties] = useState(fallbackSocieties);
  const [leadership, setLeadership] = useState<Record<string, { name: string, role: string }[]>>({});

  useEffect(() => {
    async function load() {
      // Load societies
      const { data: soc } = await supabase.from("societies").select("*").order("name");
      if (soc && soc.length > 0) {
        setDbSocieties(soc.map(s => ({
          slug: s.slug,
          name: s.name,
          shortName: s.short_name,
          tagline: s.tagline || "",
          description: s.description || "",
          color: s.color || "#006699"
        })));
      }

      // Load leadership for societies (Chair, Vice-Chair, Secretary)
      const { data: pos } = await supabase
        .from("positions")
        .select("title, society, user_id, profiles!inner(full_name)")
        .in("title", ["Chair", "Vice-Chair", "Secretary"])
        .is("end_date", null); // current positions

      if (pos) {
        const ld: Record<string, { name: string, role: string }[]> = {};
        pos.forEach((p: any) => {
          if (p.society) {
            if (!ld[p.society]) ld[p.society] = [];
            ld[p.society].push({ name: p.profiles.full_name, role: p.title });
          }
        });
        setLeadership(ld);
      }
    }
    void load();
  }, []);

  return (
    <>
      {/* Hero banner with image */}
      <section className="relative overflow-hidden min-h-[40vh] flex items-center">
        <img
          src={chaptersHero}
          alt="IEEE BBDITM chapter members in a tech lab"
          className="pointer-events-none absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/30" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        <div className="section-shell relative z-10 py-20">
          <span className="text-xs font-semibold uppercase tracking-widest text-primary-foreground/70">
            Societies
          </span>
          <h1 className="mt-3 max-w-2xl text-3xl font-bold text-white md:text-5xl drop-shadow-lg">
            Find the society that fits your field
          </h1>
          <p className="mt-4 max-w-lg text-sm leading-relaxed text-white/80 md:text-base">
            Each chapter runs its own events, projects and mentorship. Members can join more than one.
          </p>
        </div>
      </section>

      {/* Chapter cards with images */}
      <section className="section-shell grid gap-6 py-16 sm:grid-cols-2 lg:grid-cols-3">
        {dbSocieties.map((c) => (
          <article
            key={c.slug}
            className="group overflow-hidden rounded-xl card-elevated flex flex-col"
          >
            <div className="relative h-44 overflow-hidden shrink-0">
              <img
                src={chapterImages[c.slug]}
                alt={c.name}
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <span className="absolute bottom-3 left-4 rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-white backdrop-blur-sm" style={{ backgroundColor: c.color ? `${c.color}dd` : 'rgba(255,255,255,0.15)' }}>
                {c.tagline}
              </span>
            </div>
            <div className="p-6 flex-1 flex flex-col">
              <h2 className="text-lg font-semibold">{c.name}</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground flex-1">{c.description}</p>
              
              {leadership[c.slug] && leadership[c.slug].length > 0 && (
                <div className="mt-4 pt-4 border-t border-border">
                  <h3 className="text-xs font-semibold uppercase text-muted-foreground mb-2 tracking-wide">Leadership</h3>
                  <ul className="space-y-1.5">
                    {leadership[c.slug].map((l, i) => (
                      <li key={i} className="flex justify-between items-center text-sm">
                        <span className="font-medium text-foreground">{l.name}</span>
                        <span className="text-xs text-primary">{l.role}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </article>
        ))}
      </section>
    </>
  );
}