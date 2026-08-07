import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { PageHeader } from "@/components/site/PageHeader";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { chapters } from "@/data/site";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "My Dashboard — IEEE BBDITM" },
      { name: "description", content: "Manage your IEEE BBDITM member profile and positions held." },
      { property: "og:title", content: "My Dashboard — IEEE BBDITM" },
      { property: "og:description", content: "Your IEEE BBDITM member profile and positions." },
    ],
  }),
  component: Dashboard,
});

const inputClass =
  "w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary";

type Profile = {
  id: string;
  full_name: string;
  ieee_member_id: string | null;
  email: string | null;
  phone: string | null;
  branch: string | null;
  year_of_study: string | null;
  society: string | null;
};

type Position = {
  id: string;
  title: string;
  society: string | null;
  start_date: string;
  end_date: string | null;
};

export function isCurrent(p: Position) {
  return !p.end_date || new Date(p.end_date) >= new Date();
}

function Dashboard() {
  const { user, roles, canEdit } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [positions, setPositions] = useState<Position[]>([]);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle()
      .then(({ data }) => setProfile(data as Profile | null));
    supabase
      .from("positions")
      .select("id, title, society, start_date, end_date")
      .eq("user_id", user.id)
      .order("start_date", { ascending: false })
      .then(({ data }) => setPositions((data ?? []) as Position[]));
  }, [user]);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!profile) return;
    setError(null);
    const { error: err } = await supabase
      .from("profiles")
      .update({
        full_name: profile.full_name,
        ieee_member_id: profile.ieee_member_id,
        phone: profile.phone,
        branch: profile.branch,
        year_of_study: profile.year_of_study,
        society: profile.society,
      })
      .eq("id", profile.id);
    if (err) setError(err.message);
    else {
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    }
  }

  const set = (k: keyof Profile) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setProfile((p) => (p ? { ...p, [k]: e.target.value } : p));

  return (
    <>
      <PageHeader
        eyebrow="Member portal"
        title="My dashboard"
        description="Keep your membership details current. Positions you hold are recorded with their term dates."
      />

      <section className="section-shell grid gap-6 py-16 lg:grid-cols-[1.4fr_1fr]">
        <div className="rounded-xl border border-border bg-card p-6">
          <h2 className="text-lg font-semibold">My details</h2>
          {!profile ? (
            <p className="mt-4 text-sm text-muted-foreground">Loading…</p>
          ) : (
            <form onSubmit={save} className="mt-5 grid gap-4 sm:grid-cols-2">
              <label className="block sm:col-span-2">
                <span className="mb-1.5 block text-xs font-semibold uppercase text-muted-foreground">Full name</span>
                <input className={inputClass} value={profile.full_name} onChange={set("full_name")} />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-xs font-semibold uppercase text-muted-foreground">IEEE member ID</span>
                <input className={inputClass} value={profile.ieee_member_id ?? ""} onChange={set("ieee_member_id")} />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-xs font-semibold uppercase text-muted-foreground">Phone</span>
                <input className={inputClass} value={profile.phone ?? ""} onChange={set("phone")} />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-xs font-semibold uppercase text-muted-foreground">Branch</span>
                <input className={inputClass} value={profile.branch ?? ""} onChange={set("branch")} />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-xs font-semibold uppercase text-muted-foreground">Year</span>
                <input className={inputClass} value={profile.year_of_study ?? ""} onChange={set("year_of_study")} />
              </label>
              <label className="block sm:col-span-2">
                <span className="mb-1.5 block text-xs font-semibold uppercase text-muted-foreground">Society</span>
                <select className={inputClass} value={profile.society ?? ""} onChange={set("society")}>
                  <option value="">None</option>
                  {chapters.map((c) => (
                    <option key={c.slug} value={c.slug}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </label>
              {error && <p className="text-sm text-destructive sm:col-span-2">{error}</p>}
              <div className="flex items-center gap-3 sm:col-span-2">
                <button className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">
                  Save changes
                </button>
                {saved && <span className="text-sm text-muted-foreground">Saved.</span>}
              </div>
            </form>
          )}
        </div>

        <div className="space-y-6">
          <div className="rounded-xl border border-border bg-card p-6">
            <h2 className="text-lg font-semibold">My roles</h2>
            <ul className="mt-3 flex flex-wrap gap-2">
              {roles.length === 0 && <li className="text-sm text-muted-foreground">Member</li>}
              {roles.map((r) => (
                <li
                  key={r.role + (r.society ?? "")}
                  className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-muted-foreground"
                >
                  {r.role.replace("_", " ")}
                  {r.society ? ` · ${r.society}` : ""}
                </li>
              ))}
            </ul>
            <div className="mt-5 flex flex-wrap gap-2">
              <Link to="/members" className="rounded-md border border-border px-3 py-1.5 text-sm font-medium">
                Member directory
              </Link>
              {canEdit && (
                <Link to="/admin" className="rounded-md bg-primary px-3 py-1.5 text-sm font-semibold text-primary-foreground">
                  Admin panel
                </Link>
              )}
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-6">
            <h2 className="text-lg font-semibold">Positions held</h2>
            {positions.length === 0 ? (
              <p className="mt-3 text-sm text-muted-foreground">No positions recorded yet.</p>
            ) : (
              <ul className="mt-3 space-y-3">
                {positions.map((p) => (
                  <li key={p.id} className="rounded-lg border border-border p-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-semibold">{p.title}</span>
                      <span className="rounded-full bg-secondary px-2 py-0.5 text-[11px] font-semibold text-muted-foreground">
                        {isCurrent(p) ? "Current" : "Past"}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {p.society ? `${p.society} · ` : ""}
                      {p.start_date} → {p.end_date ?? "present"}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </section>
    </>
  );
}