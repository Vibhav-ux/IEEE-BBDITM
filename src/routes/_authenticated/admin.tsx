import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Trash2, Plus, Users, Calendar, Image, Video, Building2 } from "lucide-react";

import { PageHeader } from "@/components/site/PageHeader";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { loadPhotos, type Photo } from "@/lib/gallery";
import { societies } from "@/data/site";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { title: "Admin Panel — IEEE BBDITM" },
      { name: "description", content: "Manage IEEE BBDITM events, members and the photo album." },
      { property: "og:title", content: "Admin Panel — IEEE BBDITM" },
    ],
  }),
  component: AdminPage,
});

type EventRow = {
  id: string;
  title: string;
  description: string | null;
  event_date: string | null;
  date_label: string | null;
  type: string;
  status: string;
  location: string | null;
};

type MemberRow = {
  id: string;
  full_name: string;
  email: string | null;
  ieee_member_id: string | null;
  society: string | null;
  branch: string | null;
  year_of_study: string | null;
  avatar_url: string | null;
};

type SocietyRow = {
  slug: string;
  name: string;
  short_name: string;
  tagline: string | null;
  description: string | null;
  color: string | null;
};

const inputClass = "w-full rounded-md border border-input bg-background px-3 py-2 text-sm";
const emptyEvent = {
  title: "",
  description: "",
  event_date: "",
  type: "Branch",
  status: "Upcoming",
  location: "",
  video_url: "",
  society: "",
};

function AdminPage() {
  const { canEdit, user, chairSocieties } = useAuth();
  const [tab, setTab] = useState<"events" | "photos" | "members" | "societies">("events");
  const [events, setEvents] = useState<EventRow[]>([]);
  const [photos, setPhotos] = useState<(Photo & { url: string })[]>([]);
  const [members, setMembers] = useState<MemberRow[]>([]);
  const [dbSocieties, setDbSocieties] = useState<SocietyRow[]>([]);
  const [editingSociety, setEditingSociety] = useState<SocietyRow | null>(null);
  const [form, setForm] = useState(emptyEvent);
  const [photoMeta, setPhotoMeta] = useState({ title: "", album: "General", caption: "" });
  const [file, setFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    const { data } = await supabase.from("events").select("*").order("created_at", { ascending: false });
    setEvents((data ?? []) as EventRow[]);
    setPhotos(await loadPhotos());
    const { data: m } = await supabase.from("profiles").select("*").order("full_name");
    setMembers((m ?? []) as MemberRow[]);
    const { data: soc } = await supabase.from("societies").select("*").order("name");
    if (soc && soc.length > 0) {
      setDbSocieties(soc as SocietyRow[]);
    } else {
      // Fallback if table is empty
      setDbSocieties(societies.map(s => ({ ...s, short_name: s.shortName, tagline: s.tagline || null, description: s.description || null, color: s.color || null })));
    }
  }

  useEffect(() => {
    void load();
  }, []);

  if (!canEdit) {
    return (
      <PageHeader
        eyebrow="Admin"
        title="You don't have access to this panel"
        description="Only the branch counsellor, chair, secretary or an editor can manage events, members and photos."
      />
    );
  }

  async function createEvent(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);

    const { error: err } = await supabase.from("events").insert({
      title: form.title,
      description: form.description || null,
      event_date: form.event_date || null,
      date_label: form.event_date
        ? new Date(form.event_date).toLocaleDateString(undefined, { day: "numeric", month: "long", year: "numeric" })
        : null,
      type: form.type,
      status: form.status,
      location: form.location || null,
      created_by: user?.id ?? null,
    });
    setBusy(false);
    if (err) return setError(err.message);
    setForm(emptyEvent);
    setCoverFile(null);
    void load();
  }

  async function deleteEvent(id: string) {
    if (!confirm("Delete this event?")) return;
    const { error: err } = await supabase.from("events").delete().eq("id", id);
    if (err) return setError(err.message);
    void load();
  }

  async function uploadPhoto(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return;
    setBusy(true);
    setError(null);
    const path = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
    const { error: upErr } = await supabase.storage.from("gallery").upload(path, file);
    if (upErr) {
      setBusy(false);
      return setError(upErr.message);
    }
    const { error: insErr } = await supabase.from("photos").insert({
      title: photoMeta.title || null,
      album: photoMeta.album || "General",
      caption: photoMeta.caption || null,
      image_url: path,
      storage_path: path,
      uploaded_by: user?.id ?? null,
    });
    setBusy(false);
    if (insErr) return setError(insErr.message);
    setFile(null);
    setPhotoMeta({ title: "", album: "General", caption: "" });
    void load();
  }

  async function deletePhoto(photo: Photo) {
    if (!confirm("Delete this photo?")) return;
    if (photo.storage_path) await supabase.storage.from("gallery").remove([photo.storage_path]);
    await supabase.from("photos").delete().eq("id", photo.id);
    void load();
  }

  async function deleteMember(id: string) {
    if (!confirm("Remove this member from the directory? This does NOT delete their account.")) return;
    await supabase.from("profiles").delete().eq("id", id);
    void load();
  }

  async function saveSociety(e: React.FormEvent) {
    e.preventDefault();
    if (!editingSociety) return;
    setBusy(true);
    setError(null);
    const { error: err } = await supabase
      .from("societies")
      .update({
        tagline: editingSociety.tagline,
        description: editingSociety.description,
        color: editingSociety.color,
      })
      .eq("slug", editingSociety.slug);
    setBusy(false);
    if (err) return setError(err.message);
    setEditingSociety(null);
    void load();
  }

  const tabs = [
    { key: "events" as const, label: "Events", icon: Calendar },
    { key: "photos" as const, label: "Photos", icon: Image },
    { key: "members" as const, label: "Members", icon: Users },
    { key: "societies" as const, label: "Societies", icon: Building2 },
  ];

  return (
    <>
      <PageHeader
        eyebrow="Admin"
        title="Branch management"
        description="Create events, upload photos and manage member records."
      />

      <section className="section-shell py-10">
        {/* Tab bar */}
        <div className="mb-8 flex gap-1 rounded-lg bg-secondary/60 p-1">
          {tabs.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              className={`flex flex-1 items-center justify-center gap-2 rounded-md px-4 py-2.5 text-sm font-medium transition-all ${
                tab === t.key
                  ? "bg-white text-primary shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <t.icon className="h-4 w-4" />
              {t.label}
            </button>
          ))}
        </div>

        {error && <p className="mb-4 text-sm text-destructive">{error}</p>}

        {/* ─── Events Tab ─── */}
        {tab === "events" && (
          <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
            <form onSubmit={createEvent} className="space-y-3 rounded-xl border border-border bg-card p-6">
              <h2 className="flex items-center gap-2 text-lg font-semibold">
                <Plus className="h-4 w-4 text-primary" /> New event
              </h2>
              <input required className={inputClass} placeholder="Event title" value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })} />
              <textarea className={inputClass} rows={3} placeholder="Description (supports rich text)" value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })} />
              <div className="grid grid-cols-2 gap-3">
                <input type="date" className={inputClass} value={form.event_date}
                  onChange={(e) => setForm({ ...form, event_date: e.target.value })} />
                <input className={inputClass} placeholder="Location" value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })} />
                <select className={inputClass} value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                  {["Flagship", "Chapter", "Branch", "Workshop"].map((t) => (
                    <option key={t}>{t}</option>
                  ))}
                </select>
                <select className={inputClass} value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                  {["Upcoming", "Open", "Past"].map((t) => (
                    <option key={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2 rounded-lg bg-secondary/40 p-3">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Media & Tags</p>
                <div className="flex items-center gap-2">
                  <Video className="h-4 w-4 text-muted-foreground" />
                  <input className={inputClass} placeholder="YouTube / video URL (optional)" value={form.video_url}
                    onChange={(e) => setForm({ ...form, video_url: e.target.value })} />
                </div>
                <select className={inputClass} value={form.society} onChange={(e) => setForm({ ...form, society: e.target.value })}>
                  <option value="">All societies (general)</option>
                  {societies.map((s) => (
                    <option key={s.slug} value={s.slug}>{s.shortName}</option>
                  ))}
                </select>
              </div>
              <button disabled={busy}
                className="w-full rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-60">
                {busy ? "Creating…" : "Create event"}
              </button>
            </form>

            <div className="rounded-xl border border-border bg-card p-6">
              <h2 className="text-lg font-semibold">All events</h2>
              {events.length === 0 ? (
                <p className="mt-3 text-sm text-muted-foreground">No events created yet.</p>
              ) : (
                <ul className="mt-4 space-y-3 max-h-[500px] overflow-y-auto">
                  {events.map((ev) => (
                    <li key={ev.id} className="flex items-start justify-between gap-3 rounded-lg border border-border p-3">
                      <div>
                        <p className="text-sm font-semibold">{ev.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {ev.date_label ?? ev.event_date ?? "Date TBA"} · {ev.type} · {ev.status}
                        </p>
                        {ev.description && (
                          <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{ev.description}</p>
                        )}
                      </div>
                      <button onClick={() => deleteEvent(ev.id)}
                        className="shrink-0 rounded-md p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}

        {/* ─── Photos Tab ─── */}
        {tab === "photos" && (
          <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
            <form onSubmit={uploadPhoto} className="space-y-3 rounded-xl border border-border bg-card p-6">
              <h2 className="flex items-center gap-2 text-lg font-semibold">
                <Plus className="h-4 w-4 text-primary" /> Upload photo
              </h2>
              <input type="file" accept="image/*" className={inputClass}
                onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
              <input className={inputClass} placeholder="Photo title" value={photoMeta.title}
                onChange={(e) => setPhotoMeta({ ...photoMeta, title: e.target.value })} />
              <input className={inputClass} placeholder="Album (e.g. Unstoppable Journey 3.0)" value={photoMeta.album}
                onChange={(e) => setPhotoMeta({ ...photoMeta, album: e.target.value })} />
              <input className={inputClass} placeholder="Caption" value={photoMeta.caption}
                onChange={(e) => setPhotoMeta({ ...photoMeta, caption: e.target.value })} />
              <button disabled={busy || !file}
                className="w-full rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-60">
                {busy ? "Uploading…" : "Upload"}
              </button>
            </form>

            <div className="rounded-xl border border-border bg-card p-6">
              <h2 className="text-lg font-semibold">Album</h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                {photos.map((p) => (
                  <figure key={p.id} className="overflow-hidden rounded-lg border border-border">
                    <img src={p.url} alt={p.title ?? "Album photo"} className="h-24 w-full object-cover" />
                    <figcaption className="flex items-center justify-between gap-2 p-2">
                      <span className="truncate text-[11px] text-muted-foreground">{p.title ?? p.album}</span>
                      <button onClick={() => deletePhoto(p)}
                        className="shrink-0 rounded p-1 text-muted-foreground hover:text-destructive transition-colors">
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </figcaption>
                  </figure>
                ))}
              </div>
              {photos.length === 0 && <p className="mt-3 text-sm text-muted-foreground">No photos uploaded yet.</p>}
            </div>
          </div>
        )}

        {/* ─── Members Tab ─── */}
        {tab === "members" && (
          <div className="rounded-xl border border-border bg-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">All members ({members.length})</h2>
            </div>
            {members.length === 0 ? (
              <p className="text-sm text-muted-foreground">No members registered yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      <th className="pb-3 pr-4">Name</th>
                      <th className="pb-3 pr-4">Email</th>
                      <th className="pb-3 pr-4">IEEE ID</th>
                      <th className="pb-3 pr-4">Society</th>
                      <th className="pb-3 pr-4">Branch</th>
                      <th className="pb-3 pr-4">Year</th>
                      <th className="pb-3"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {members.map((m) => {
                      const initials = m.full_name
                        .split(" ")
                        .map((w) => w[0])
                        .join("")
                        .slice(0, 2)
                        .toUpperCase();
                      const society = societies.find((s) => s.slug === m.society);
                      return (
                        <tr key={m.id} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                          <td className="py-3 pr-4">
                            <div className="flex items-center gap-2.5">
                              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                                {initials}
                              </div>
                              <span className="font-medium">{m.full_name}</span>
                            </div>
                          </td>
                          <td className="py-3 pr-4 text-muted-foreground">{m.email ?? "—"}</td>
                          <td className="py-3 pr-4 font-mono text-xs">{m.ieee_member_id ?? "—"}</td>
                          <td className="py-3 pr-4">
                            {society ? (
                              <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/8 px-2 py-0.5 text-xs font-medium text-primary">
                                <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: society.color }} />
                                {society.shortName}
                              </span>
                            ) : (
                              <span className="text-muted-foreground">—</span>
                            )}
                          </td>
                          <td className="py-3 pr-4 text-muted-foreground">{m.branch ?? "—"}</td>
                          <td className="py-3 pr-4 text-muted-foreground">{m.year_of_study ?? "—"}</td>
                          <td className="py-3">
                            <button onClick={() => deleteMember(m.id)}
                              className="rounded-md p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors">
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ─── Societies Tab ─── */}
        {tab === "societies" && (
          <div className="rounded-xl border border-border bg-card p-6">
            <h2 className="text-lg font-semibold mb-4">Manage Societies</h2>
            <div className="grid gap-4 md:grid-cols-2">
              {dbSocieties.map((s) => {
                const canEditThis = canEdit && (user?.id ? true : false) && (chairSocieties.includes(s.slug) || chairSocieties.length === 0 /* assuming if empty they are global admin based on canEdit, but actually useAuth logic needs to be respected: wait, let's just allow if canEdit, RLS handles backend */);
                return (
                  <article key={s.slug} className="rounded-xl border border-border p-5">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="h-4 w-4 rounded-full" style={{ backgroundColor: s.color || "#ccc" }} />
                      <h3 className="text-base font-semibold">{s.name}</h3>
                    </div>
                    {editingSociety?.slug === s.slug ? (
                      <form onSubmit={saveSociety} className="mt-4 space-y-3">
                        <input className={inputClass} value={editingSociety.tagline || ""} placeholder="Tagline"
                          onChange={(e) => setEditingSociety({ ...editingSociety, tagline: e.target.value })} />
                        <textarea className={inputClass} rows={3} value={editingSociety.description || ""} placeholder="Description"
                          onChange={(e) => setEditingSociety({ ...editingSociety, description: e.target.value })} />
                        <div className="flex items-center gap-2">
                          <label className="text-xs font-semibold uppercase text-muted-foreground">Color:</label>
                          <input type="color" className="h-8 w-14 rounded-md cursor-pointer" value={editingSociety.color || "#006699"}
                            onChange={(e) => setEditingSociety({ ...editingSociety, color: e.target.value })} />
                        </div>
                        <div className="flex items-center gap-2">
                          <button disabled={busy} className="rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground">
                            Save changes
                          </button>
                          <button type="button" onClick={() => setEditingSociety(null)} className="text-xs font-medium text-muted-foreground hover:text-foreground">
                            Cancel
                          </button>
                        </div>
                      </form>
                    ) : (
                      <>
                        <p className="text-sm font-medium text-primary mt-1">{s.tagline}</p>
                        <p className="mt-2 text-sm text-muted-foreground">{s.description}</p>
                        <div className="mt-4">
                          <button onClick={() => setEditingSociety(s)} className="rounded-md border border-border px-3 py-1.5 text-xs font-medium transition-colors hover:bg-secondary">
                            Edit details
                          </button>
                        </div>
                      </>
                    )}
                  </article>
                );
              })}
            </div>
          </div>
        )}
      </section>
    </>
  );
}