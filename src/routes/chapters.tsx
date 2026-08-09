import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { UserPlus, Trash2, ChevronDown, ChevronUp } from "lucide-react";

import { societies as fallbackSocieties } from "@/data/site";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
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

type SocietyMember = {
  positionId: string;
  userId: string;
  name: string;
  role: string;
  avatarUrl: string | null;
  ieeeId: string | null;
};

type AddMemberDraft = { societySlug: string; userId: string; title: string };

const POSITION_TITLES = ["Chair", "Vice-Chair", "Secretary", "Treasurer", "Webmaster", "Editor", "Volunteer", "Member"];

function ChaptersPage() {
  const { canManageMembers } = useAuth();
  const [dbSocieties, setDbSocieties] = useState(fallbackSocieties);
  // All active positions per society slug
  const [members, setMembers] = useState<Record<string, SocietyMember[]>>({});
  // All approved profiles (for counsellor "add" dropdown)
  const [allProfiles, setAllProfiles] = useState<{ id: string; full_name: string }[]>([]);
  const [addDraft, setAddDraft] = useState<AddMemberDraft>({ societySlug: "", userId: "", title: "Member" });
  const [expandedSociety, setExpandedSociety] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function load() {
    // Load societies
    const { data: soc } = await supabase.from("societies").select("*").order("name");
    if (soc && soc.length > 0) {
      setDbSocieties(
        soc.map((s) => ({
          slug: s.slug,
          name: s.name,
          shortName: s.short_name,
          tagline: s.tagline || "",
          description: s.description || "",
          color: s.color || "#006699",
        })),
      );
    }

    // Load all positions with joined profile data
    const { data: pos } = await supabase
      .from("positions")
      .select("id, title, society, user_id, profiles!inner(full_name, avatar_url, ieee_member_id)")
      .is("end_date", null)
      .order("title");

    if (pos) {
      const bySlug: Record<string, SocietyMember[]> = {};
      pos.forEach((p: any) => {
        if (!p.society) return;
        if (!bySlug[p.society]) bySlug[p.society] = [];
        bySlug[p.society]!.push({
          positionId: p.id,
          userId: p.user_id,
          name: p.profiles.full_name,
          role: p.title,
          avatarUrl: p.profiles.avatar_url,
          ieeeId: p.profiles.ieee_member_id,
        });
      });
      setMembers(bySlug);
    }

    // Load approved profiles for add-member dropdown (counsellor only)
    if (canManageMembers) {
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name")
        .eq("status", "approved")
        .order("full_name");
      setAllProfiles((profiles ?? []) as { id: string; full_name: string }[]);
    }
  }

  useEffect(() => { void load(); }, [canManageMembers]);

  async function addMember(e: React.FormEvent) {
    e.preventDefault();
    if (!addDraft.userId || !addDraft.societySlug || !addDraft.title) return;
    setBusy(true);
    setErr(null);
    const { error } = await supabase.from("positions").insert({
      user_id: addDraft.userId,
      title: addDraft.title,
      society: addDraft.societySlug,
      start_date: new Date().toISOString().slice(0, 10),
    });
    setBusy(false);
    if (error) { setErr(error.message); return; }
    setAddDraft((d) => ({ ...d, userId: "", title: "Member" }));
    void load();
  }

  async function removeMember(positionId: string) {
    if (!confirm("Remove this member from the society?")) return;
    const { error } = await supabase.from("positions").delete().eq("id", positionId);
    if (error) { setErr(error.message); return; }
    void load();
  }

  function initials(name: string) {
    return name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
  }

  return (
    <>
      {/* Hero banner */}
      <section className="relative overflow-hidden min-h-[40vh] flex items-center">
        <img
          src={chaptersHero}
          alt="IEEE BBDITM chapter members in a tech lab"
          className="pointer-events-none absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/30" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        <div className="section-shell relative z-10 py-20">
          <span className="text-xs font-semibold uppercase tracking-widest text-primary-foreground/70">Societies</span>
          <h1 className="mt-3 max-w-2xl text-3xl font-bold text-white md:text-5xl drop-shadow-lg">
            Find the society that fits your field
          </h1>
          <p className="mt-4 max-w-lg text-sm leading-relaxed text-white/80 md:text-base">
            Each chapter runs its own events, projects and mentorship. Members can join more than one.
          </p>
        </div>
      </section>

      {err && (
        <div className="section-shell pt-4">
          <p className="text-sm text-destructive">{err}</p>
        </div>
      )}

      {/* Chapter cards */}
      <section className="section-shell grid gap-6 py-16 sm:grid-cols-2 lg:grid-cols-3">
        {dbSocieties.map((c) => {
          const societyMembers = members[c.slug] ?? [];
          const leaders = societyMembers.filter((m) =>
            ["Chair", "Vice-Chair", "Secretary"].includes(m.role),
          );
          const isExpanded = expandedSociety === c.slug;

          return (
            <article
              key={c.slug}
              className="group overflow-hidden rounded-xl card-elevated flex flex-col"
            >
              {/* Image */}
              <div className="relative h-44 overflow-hidden shrink-0">
                <img
                  src={chapterImages[c.slug]}
                  alt={c.name}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <span
                  className="absolute bottom-3 left-4 rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-white backdrop-blur-sm"
                  style={{ backgroundColor: c.color ? `${c.color}dd` : "rgba(255,255,255,0.15)" }}
                >
                  {c.tagline}
                </span>
                {societyMembers.length > 0 && (
                  <span className="absolute bottom-3 right-4 rounded-full bg-black/50 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur-sm">
                    {societyMembers.length} member{societyMembers.length !== 1 ? "s" : ""}
                  </span>
                )}
              </div>

              {/* Content */}
              <div className="p-6 flex-1 flex flex-col gap-4">
                <div>
                  <h2 className="text-lg font-semibold">{c.name}</h2>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{c.description}</p>
                </div>

                {/* Leadership strip */}
                {leaders.length > 0 && (
                  <div className="pt-3 border-t border-border">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                      Leadership
                    </p>
                    <ul className="space-y-1.5">
                      {leaders.map((l, i) => (
                        <li key={i} className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            {l.avatarUrl ? (
                              <img src={l.avatarUrl} alt="" className="h-6 w-6 rounded-full object-cover" />
                            ) : (
                              <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-[9px] font-bold text-primary">
                                {initials(l.name)}
                              </div>
                            )}
                            <span className="font-medium text-foreground">{l.name}</span>
                          </div>
                          <span className="text-xs text-primary">{l.role}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* All members toggle */}
                {societyMembers.length > 0 && (
                  <div>
                    <button
                      type="button"
                      onClick={() => setExpandedSociety(isExpanded ? null : c.slug)}
                      className="flex w-full items-center justify-between text-xs font-semibold uppercase tracking-wide text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <span>All members ({societyMembers.length})</span>
                      {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </button>

                    {isExpanded && (
                      <ul className="mt-3 space-y-2">
                        {societyMembers.map((m) => (
                          <li key={m.positionId} className="flex items-center justify-between gap-2 rounded-lg bg-secondary/40 px-3 py-2">
                            <div className="flex items-center gap-2">
                              {m.avatarUrl ? (
                                <img src={m.avatarUrl} alt="" className="h-7 w-7 rounded-full object-cover" />
                              ) : (
                                <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary">
                                  {initials(m.name)}
                                </div>
                              )}
                              <div>
                                <p className="text-sm font-medium">{m.name}</p>
                                {m.ieeeId && (
                                  <p className="text-[10px] font-mono text-muted-foreground">IEEE {m.ieeeId}</p>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs text-muted-foreground">{m.role}</span>
                              {canManageMembers && (
                                <button
                                  onClick={() => removeMember(m.positionId)}
                                  className="rounded p-1 text-muted-foreground hover:text-destructive transition-colors"
                                  title="Remove from society"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </button>
                              )}
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}

                {/* Add member form — counsellor only */}
                {canManageMembers && (
                  <form
                    onSubmit={(e) => { setAddDraft((d) => ({ ...d, societySlug: c.slug })); addMember(e); }}
                    onClick={() => setAddDraft((d) => ({ ...d, societySlug: c.slug }))}
                    className="mt-auto pt-3 border-t border-border space-y-2"
                  >
                    <p className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      <UserPlus className="h-3.5 w-3.5" /> Add member
                    </p>
                    <select
                      required
                      className="w-full rounded-md border border-input bg-background px-2.5 py-1.5 text-xs"
                      value={addDraft.societySlug === c.slug ? addDraft.userId : ""}
                      onChange={(e) => setAddDraft({ societySlug: c.slug, userId: e.target.value, title: addDraft.societySlug === c.slug ? addDraft.title : "Member" })}
                    >
                      <option value="">Select member…</option>
                      {allProfiles.map((p) => (
                        <option key={p.id} value={p.id}>{p.full_name}</option>
                      ))}
                    </select>
                    <div className="flex gap-2">
                      <select
                        className="flex-1 rounded-md border border-input bg-background px-2.5 py-1.5 text-xs"
                        value={addDraft.societySlug === c.slug ? addDraft.title : "Member"}
                        onChange={(e) => setAddDraft((d) => ({ ...d, societySlug: c.slug, title: e.target.value }))}
                      >
                        {POSITION_TITLES.map((t) => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                      <button
                        type="submit"
                        disabled={busy}
                        className="rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground disabled:opacity-60 whitespace-nowrap"
                      >
                        {busy ? "…" : "Add"}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </article>
          );
        })}
      </section>
    </>
  );
}