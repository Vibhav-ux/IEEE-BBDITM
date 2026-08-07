import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { PageHeader } from "@/components/site/PageHeader";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { loadPhotos, type Photo } from "@/lib/gallery";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { title: "Admin Panel — IEEE BBDITM" },
      { name: "description", content: "Manage IEEE BBDITM events and the photo album." },
      { property: "og:title", content: "Admin Panel — IEEE BBDITM" },
      { property: "og:description", content: "Manage IEEE BBDITM events and gallery uploads." },
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

const inputClass = "w-full rounded-md border border-input bg-background px-3 py-2 text-sm";
const emptyEvent = {
  title: "",
  description: "",
  event_date: "",
  type: "Branch",
  status: "Upcoming",
  location: "",
};

function AdminPage() {
  const { canEdit, user } = useAuth();
  const [events, setEvents] = useState<EventRow[]>([]);
  const [photos, setPhotos] = useState<(Photo & { url: string })[]>([]);
  const [form, setForm] = useState(emptyEvent);
  const [photoMeta, setPhotoMeta] = useState({ title: "", album: "General", caption: "" });
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    const { data } = await supabase.from("events").select("*").order("created_at", { ascending: false });
    setEvents((data ?? []) as EventRow[]);
    setPhotos(await loadPhotos());
  }

  useEffect(() => {
    void load();
  }, []);

  if (!canEdit) {
    return (
      <PageHeader
        eyebrow="Admin"
        title="You don't have access to this panel"
        description="Only the branch counsellor, student branch chair or a member granted editor permission can manage events and photos."
      />
    );
  }

  async function createEvent(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
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
    if (err) return setError(err.message);
    setForm(emptyEvent);
    void load();
  }

  async function deleteEvent(id: string) {
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
    if (photo.storage_path) await supabase.storage.from("gallery").remove([photo.storage_path]);
    await supabase.from("photos").delete().eq("id", photo.id);
    void load();
  }

  return (
    <>
      <PageHeader
        eyebrow="Admin"
        title="Events & album management"
        description="Create or remove upcoming events and upload photographs to the public album."
      />

      <section className="section-shell space-y-10 py-16">
        {error && <p className="text-sm text-destructive">{error}</p>}

        <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
          <form onSubmit={createEvent} className="space-y-3 rounded-xl border border-border bg-card p-6">
            <h2 className="text-lg font-semibold">New event</h2>
            <input required className={inputClass} placeholder="Event title" value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })} />
            <textarea className={inputClass} rows={3} placeholder="Description" value={form.description}
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
            <button className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">
              Create event
            </button>
          </form>

          <div className="rounded-xl border border-border bg-card p-6">
            <h2 className="text-lg font-semibold">Events</h2>
            {events.length === 0 ? (
              <p className="mt-3 text-sm text-muted-foreground">No events created yet.</p>
            ) : (
              <ul className="mt-4 space-y-3">
                {events.map((ev) => (
                  <li key={ev.id} className="flex items-start justify-between gap-3 rounded-lg border border-border p-3">
                    <div>
                      <p className="text-sm font-semibold">{ev.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {ev.date_label ?? ev.event_date ?? "Date TBA"} · {ev.type} · {ev.status}
                      </p>
                    </div>
                    <button onClick={() => deleteEvent(ev.id)} className="text-xs font-medium text-destructive">
                      Delete
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
          <form onSubmit={uploadPhoto} className="space-y-3 rounded-xl border border-border bg-card p-6">
            <h2 className="text-lg font-semibold">Upload photo</h2>
            <input type="file" accept="image/*" className={inputClass}
              onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
            <input className={inputClass} placeholder="Photo title" value={photoMeta.title}
              onChange={(e) => setPhotoMeta({ ...photoMeta, title: e.target.value })} />
            <input className={inputClass} placeholder="Album (e.g. Unstoppable Journey 3.0)" value={photoMeta.album}
              onChange={(e) => setPhotoMeta({ ...photoMeta, album: e.target.value })} />
            <input className={inputClass} placeholder="Caption" value={photoMeta.caption}
              onChange={(e) => setPhotoMeta({ ...photoMeta, caption: e.target.value })} />
            <button disabled={busy || !file}
              className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-60">
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
                    <button onClick={() => deletePhoto(p)} className="text-[11px] text-destructive">
                      ×
                    </button>
                  </figcaption>
                </figure>
              ))}
            </div>
            {photos.length === 0 && <p className="mt-3 text-sm text-muted-foreground">No photos uploaded yet.</p>}
          </div>
        </div>
      </section>
    </>
  );
}