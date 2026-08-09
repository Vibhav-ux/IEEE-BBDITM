import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { PageHeader } from "@/components/site/PageHeader";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/_authenticated/members")({
  head: () => ({
    meta: [
      { title: "Member Directory — IEEE BBDITM" },
      {
        name: "description",
        content: "IEEE BBDITM member records, visible according to your role.",
      },
      { property: "og:title", content: "Member Directory — IEEE BBDITM" },
      { property: "og:description", content: "IEEE BBDITM member records for branch leadership." },
    ],
  }),
  component: MembersPage,
});

type Member = {
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
  user_id: string;
  title: string;
  society: string | null;
  start_date: string;
  end_date: string | null;
};

const inputClass = "w-full rounded-md border border-input bg-background px-2 py-1.5 text-sm";

function MembersPage() {
  const { canEdit } = useAuth();
  const [members, setMembers] = useState<Member[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [editing, setEditing] = useState<Member | null>(null);
  const [q, setQ] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [newPos, setNewPos] = useState({ title: "", society: "", start_date: "", end_date: "" });

  async function load() {
    const { data } = await supabase.from("profiles").select("*").order("full_name");
    setMembers((data ?? []) as Member[]);
    const { data: pos } = await supabase
      .from("positions")
      .select("id, user_id, title, society, start_date, end_date")
      .order("start_date", { ascending: false });
    setPositions((pos ?? []) as Position[]);
  }

  useEffect(() => {
    void load();
  }, []);

  const filtered = members.filter((m) =>
    [m.full_name, m.ieee_member_id, m.email, m.society]
      .join(" ")
      .toLowerCase()
      .includes(q.toLowerCase()),
  );

  async function saveMember(e: React.FormEvent) {
    e.preventDefault();
    if (!editing) return;
    setError(null);
    const { error: err } = await supabase
      .from("profiles")
      .update({
        full_name: editing.full_name,
        ieee_member_id: editing.ieee_member_id,
        phone: editing.phone,
        branch: editing.branch,
        year_of_study: editing.year_of_study,
        society: editing.society,
      })
      .eq("id", editing.id);
    if (err) return setError(err.message);
    setEditing(null);
    void load();
  }

  async function addPosition(userId: string) {
    if (!newPos.title || !newPos.start_date) return;
    const { error: err } = await supabase.from("positions").insert({
      user_id: userId,
      title: newPos.title,
      society: newPos.society || null,
      start_date: newPos.start_date,
      end_date: newPos.end_date || null,
    });
    if (err) return setError(err.message);
    setNewPos({ title: "", society: "", start_date: "", end_date: "" });
    void load();
  }

  async function removePosition(id: string) {
    await supabase.from("positions").delete().eq("id", id);
    void load();
  }

  return (
    <>
      <PageHeader
        eyebrow="Members"
        title="Member directory"
        description="Records you can see depend on your role. Society chairs see their own society; the branch counsellor and chair see everyone and can edit details."
      />

      <section className="section-shell py-16">
        <input
          className="mb-6 w-full max-w-sm rounded-md border border-input bg-background px-3 py-2 text-sm"
          placeholder="Search name, IEEE ID, society…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        {error && <p className="mb-4 text-sm text-destructive">{error}</p>}

        <div className="grid gap-4 md:grid-cols-2">
          {filtered.map((m) => {
            const held = positions.filter((p) => p.user_id === m.id);
            const current = held.find((p) => !p.end_date || new Date(p.end_date) >= new Date());
            return (
              <article key={m.id} className="rounded-xl border border-border bg-card p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-base font-semibold">{m.full_name || "Unnamed member"}</h2>
                    <p className="text-xs text-muted-foreground">
                      IEEE ID {m.ieee_member_id || "—"} · {m.society || "no society"}
                    </p>
                  </div>
                  {current && (
                    <span className="rounded-full bg-primary-soft px-2.5 py-1 text-[11px] font-semibold text-accent-foreground">
                      {current.title}
                    </span>
                  )}
                </div>
                <dl className="mt-3 grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                  <div>Email: {m.email || "—"}</div>
                  <div>Phone: {m.phone || "—"}</div>
                  <div>Branch: {m.branch || "—"}</div>
                  <div>Year: {m.year_of_study || "—"}</div>
                </dl>

                {held.length > 0 && (
                  <ul className="mt-3 space-y-1 text-xs text-muted-foreground">
                    {held.map((p) => (
                      <li key={p.id} className="flex items-center justify-between gap-2">
                        <span>
                          {p.title} · {p.start_date} → {p.end_date ?? "present"}
                        </span>
                        {canEdit && (
                          <button onClick={() => removePosition(p.id)} className="text-destructive">
                            remove
                          </button>
                        )}
                      </li>
                    ))}
                  </ul>
                )}

                {canEdit && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      onClick={() => setEditing(m)}
                      className="rounded-md border border-border px-3 py-1.5 text-xs font-medium"
                    >
                      Edit details
                    </button>
                  </div>
                )}

                {canEdit && editing?.id === m.id && (
                  <form
                    onSubmit={saveMember}
                    className="mt-4 space-y-2 rounded-lg border border-border p-3"
                  >
                    <input
                      className={inputClass}
                      value={editing.full_name}
                      placeholder="Full name"
                      onChange={(e) => setEditing({ ...editing, full_name: e.target.value })}
                    />
                    <input
                      className={inputClass}
                      value={editing.ieee_member_id ?? ""}
                      placeholder="IEEE member ID"
                      onChange={(e) => setEditing({ ...editing, ieee_member_id: e.target.value })}
                    />
                    <input
                      className={inputClass}
                      value={editing.phone ?? ""}
                      placeholder="Phone"
                      onChange={(e) => setEditing({ ...editing, phone: e.target.value })}
                    />
                    <input
                      className={inputClass}
                      value={editing.branch ?? ""}
                      placeholder="Branch"
                      onChange={(e) => setEditing({ ...editing, branch: e.target.value })}
                    />
                    <input
                      className={inputClass}
                      value={editing.year_of_study ?? ""}
                      placeholder="Year"
                      onChange={(e) => setEditing({ ...editing, year_of_study: e.target.value })}
                    />
                    <input
                      className={inputClass}
                      value={editing.society ?? ""}
                      placeholder="Society slug"
                      onChange={(e) => setEditing({ ...editing, society: e.target.value })}
                    />
                    <div className="grid grid-cols-2 gap-2 border-t border-border pt-2">
                      <input
                        className={inputClass}
                        placeholder="Position title"
                        value={newPos.title}
                        onChange={(e) => setNewPos({ ...newPos, title: e.target.value })}
                      />
                      <input
                        className={inputClass}
                        placeholder="Society"
                        value={newPos.society}
                        onChange={(e) => setNewPos({ ...newPos, society: e.target.value })}
                      />
                      <input
                        type="date"
                        className={inputClass}
                        value={newPos.start_date}
                        onChange={(e) => setNewPos({ ...newPos, start_date: e.target.value })}
                      />
                      <input
                        type="date"
                        className={inputClass}
                        value={newPos.end_date}
                        onChange={(e) => setNewPos({ ...newPos, end_date: e.target.value })}
                      />
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button className="rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground">
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={() => void addPosition(m.id)}
                        className="rounded-md border border-border px-3 py-1.5 text-xs font-medium"
                      >
                        Add position
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditing(null)}
                        className="rounded-md px-3 py-1.5 text-xs text-muted-foreground"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}
              </article>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <p className="text-sm text-muted-foreground">No member records visible to you.</p>
        )}
      </section>
    </>
  );
}
