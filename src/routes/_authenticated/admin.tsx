import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Trash2,
  Plus,
  Users,
  Calendar,
  Image,
  ImagePlus,
  Video,
  Building2,
  Mail,
  Newspaper,
  ClipboardList,
  Check,
  X,
  UserPlus,
  Trophy,
  LayoutTemplate,
  Home,
} from "lucide-react";

import { PageHeader } from "@/components/site/PageHeader";
import { supabase } from "@/integrations/supabase/client";
import { useAuth, type AppRole } from "@/lib/auth";
import { loadPhotos, type Photo } from "@/lib/gallery";
import { societies } from "@/data/site";
import { SITE_IMAGE_SLOTS, type SiteImageKey } from "@/lib/siteImages";

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
  video_url?: string | null;
  cover_image_url?: string | null;
  society?: string | null;
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

type RoleRow = {
  id: string;
  user_id: string;
  role: AppRole;
  society: string | null;
};

type SocietyRow = {
  slug: string;
  name: string;
  short_name: string;
  tagline: string | null;
  description: string | null;
  color: string | null;
};

type ContactMessageRow = {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  created_at: string;
};

type NewsletterRow = {
  id: string;
  name: string;
  email: string;
  subscribed_at: string;
};

type PendingMemberRow = {
  id: string;
  full_name: string;
  email: string | null;
  ieee_member_id: string | null;
  society: string | null;
  branch: string | null;
  year_of_study: string | null;
  desired_position: string | null;
  desired_society: string | null;
  created_at: string;
};

type PositionRow = {
  id: string;
  user_id: string;
  title: string;
  society: string | null;
  start_date: string;
  end_date: string | null;
};

type AwardRow = {
  id: string;
  title: string;
  recipient: string;
  category: string;
  year: number;
  description: string | null;
  image_url: string | null;
  awarded_by: string | null;
};

type PosterRow = {
  id: string;
  session: string;
  label: string | null;
  image_url: string;
  storage_path: string | null;
  show_on_home: boolean;
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

const LEADERSHIP_ROLES: AppRole[] = ["counsellor", "chair", "secretary", "editor", "society_chair"];

function AdminPage() {
  const { canEdit, canCreateEvents, canManageMembers, isCounsellor, user, chairSocieties } =
    useAuth();
  const [tab, setTab] = useState<
    "events" | "photos" | "members" | "societies" | "messages" | "newsletter" | "requests" | "images" | "awards" | "posters"
  >("events");
  const [events, setEvents] = useState<EventRow[]>([]);
  const [photos, setPhotos] = useState<(Photo & { url: string })[]>([]);
  const [members, setMembers] = useState<MemberRow[]>([]);
  const [memberRoles, setMemberRoles] = useState<RoleRow[]>([]);
  const [roleDraft, setRoleDraft] = useState<{ userId: string; role: AppRole; society: string }>({
    userId: "",
    role: "editor",
    society: "",
  });
  const [dbSocieties, setDbSocieties] = useState<SocietyRow[]>([]);
  const [editingSociety, setEditingSociety] = useState<SocietyRow | null>(null);
  const [contactMessages, setContactMessages] = useState<ContactMessageRow[]>([]);
  const [newsletterSubs, setNewsletterSubs] = useState<NewsletterRow[]>([]);
  const [pendingMembers, setPendingMembers] = useState<PendingMemberRow[]>([]);
  const [allPositions, setAllPositions] = useState<PositionRow[]>([]);
  const [positionDraft, setPositionDraft] = useState<{
    userId: string;
    title: string;
    society: string;
    startDate: string;
  }>({ userId: "", title: "", society: "", startDate: new Date().toISOString().slice(0, 10) });
  const [form, setForm] = useState(emptyEvent);
  const [photoMeta, setPhotoMeta] = useState({ title: "", album: "General", caption: "", showOnHome: false });
  const [file, setFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Site images state
  const [siteImages, setSiteImages] = useState<Record<string, string>>({});
  const [imageUploadKey, setImageUploadKey] = useState<SiteImageKey | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUploading, setImageUploading] = useState(false);
  // Awards state
  const [awards, setAwards] = useState<AwardRow[]>([]);
  const [awardForm, setAwardForm] = useState({
    title: "", recipient: "", category: "General",
    year: new Date().getFullYear(), description: "", awarded_by: "",
  });
  const [awardFile, setAwardFile] = useState<File | null>(null);
  const [awardBusy, setAwardBusy] = useState(false);
  // Posters state
  const [posters, setPosters] = useState<PosterRow[]>([]);
  const [posterForm, setPosterForm] = useState({ session: "", label: "" });
  const [posterFile, setPosterFile] = useState<File | null>(null);
  const [posterBusy, setPosterBusy] = useState(false);

  async function load() {
    const { data } = await supabase
      .from("events")
      .select("*")
      .order("created_at", { ascending: false });
    setEvents((data ?? []) as EventRow[]);
    setPhotos(await loadPhotos());
    const { data: m } = await supabase.from("profiles").select("*").order("full_name");
    setMembers((m ?? []) as MemberRow[]);
    const { data: roles } = await supabase.from("user_roles").select("id, user_id, role, society");
    setMemberRoles((roles ?? []) as RoleRow[]);
    const { data: soc } = await supabase.from("societies").select("*").order("name");
    if (soc && soc.length > 0) {
      setDbSocieties(soc as SocietyRow[]);
    } else {
      setDbSocieties(
        societies.map((s) => ({
          ...s,
          short_name: s.shortName,
          tagline: s.tagline || null,
          description: s.description || null,
          color: s.color || null,
        })),
      );
    }
    const { data: msgs } = await supabase
      .from("contact_messages")
      .select("*")
      .order("created_at", { ascending: false });
    setContactMessages((msgs ?? []) as ContactMessageRow[]);
    const { data: subs } = await supabase
      .from("newsletter_subscribers")
      .select("*")
      .order("subscribed_at", { ascending: false });
    setNewsletterSubs((subs ?? []) as NewsletterRow[]);
    const { data: pending } = await supabase
      .from("profiles")
      .select(
        "id, full_name, email, ieee_member_id, society, branch, year_of_study, desired_position, desired_society, created_at",
      )
      .eq("status", "pending")
      .order("created_at", { ascending: false });
    setPendingMembers((pending ?? []) as PendingMemberRow[]);
    const { data: positions } = await supabase
      .from("positions")
      .select("id, user_id, title, society, start_date, end_date")
      .is("end_date", null)
      .order("title");
    setAllPositions((positions ?? []) as PositionRow[]);
    // Load site images
    const { data: imgs } = await supabase.from("site_images").select("key, image_url");
    if (imgs) {
      const map: Record<string, string> = {};
      imgs.forEach((r: { key: string; image_url: string }) => { map[r.key] = r.image_url; });
      setSiteImages(map);
    }
    const { data: awardData } = await supabase
      .from("awards")
      .select("*")
      .order("year", { ascending: false })
      .order("created_at", { ascending: false });
    setAwards((awardData ?? []) as AwardRow[]);
    const { data: posterData } = await supabase
      .from("team_posters")
      .select("*")
      .order("created_at", { ascending: false });
    setPosters((posterData ?? []) as PosterRow[]);
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

    let cover_image_url: string | null = null;
    if (coverFile) {
      const path = `events/${Date.now()}-${coverFile.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
      const { error: upErr } = await supabase.storage.from("gallery").upload(path, coverFile);
      if (upErr) {
        setBusy(false);
        return setError(upErr.message);
      }
      const { data: urlData } = supabase.storage.from("gallery").getPublicUrl(path);
      cover_image_url = urlData.publicUrl;
    }

    const { error: err } = await supabase.from("events").insert({
      title: form.title,
      description: form.description || null,
      event_date: form.event_date || null,
      date_label: form.event_date
        ? new Date(form.event_date).toLocaleDateString(undefined, {
          day: "numeric",
          month: "long",
          year: "numeric",
        })
        : null,
      type: form.type,
      status: form.status,
      location: form.location || null,
      video_url: form.video_url.trim() || null,
      society: form.society || null,
      cover_image_url,
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
      show_on_home: photoMeta.showOnHome,
      uploaded_by: user?.id ?? null,
    });
    setBusy(false);
    if (insErr) return setError(insErr.message);
    setFile(null);
    setPhotoMeta({ title: "", album: "General", caption: "", showOnHome: false });
    void load();
  }

  async function deletePhoto(photo: Photo) {
    if (!confirm("Delete this photo?")) return;
    if (photo.storage_path) await supabase.storage.from("gallery").remove([photo.storage_path]);
    await supabase.from("photos").delete().eq("id", photo.id);
    void load();
  }

  async function deleteMember(id: string) {
    if (!confirm("Remove this member from the directory? This does NOT delete their account."))
      return;
    await supabase.from("profiles").delete().eq("id", id);
    void load();
  }

  async function assignRole(userId: string, role: AppRole, society: string) {
    setError(null);
    const payload: { user_id: string; role: AppRole; society?: string | null } = {
      user_id: userId,
      role,
    };
    if (role === "society_chair") {
      if (!society) return setError("Pick a society for society chair role.");
      payload.society = society;
    }
    const { error: err } = await supabase.from("user_roles").insert(payload);
    if (err) return setError(err.message);
    void load();
  }

  async function removeRole(roleId: string, role: AppRole) {
    if (role === "member") return;
    if (!confirm("Remove this role from the member?")) return;
    const { error: err } = await supabase.from("user_roles").delete().eq("id", roleId);
    if (err) return setError(err.message);
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

  async function approveMember(
    id: string,
    desiredPosition?: string | null,
    desiredSociety?: string | null,
  ) {
    setBusy(true);
    setError(null);
    const { error: err } = await supabase
      .from("profiles")
      .update({ status: "approved" })
      .eq("id", id);
    if (err) {
      setBusy(false);
      return setError(err.message);
    }
    // If they requested a position, create it
    if (desiredPosition && desiredPosition !== "") {
      await supabase.from("positions").insert({
        user_id: id,
        title: desiredPosition,
        society: desiredSociety || null,
        start_date: new Date().toISOString().slice(0, 10),
      });
    }
    setBusy(false);
    void load();
  }

  async function rejectMember(id: string) {
    if (!confirm("Reject this registration request?")) return;
    const { error: err } = await supabase
      .from("profiles")
      .update({ status: "rejected" })
      .eq("id", id);
    if (err) return setError(err.message);
    void load();
  }

  async function addPosition(e: React.FormEvent) {
    e.preventDefault();
    if (!positionDraft.userId || !positionDraft.title) return;
    setBusy(true);
    setError(null);
    const { error: err } = await supabase.from("positions").insert({
      user_id: positionDraft.userId,
      title: positionDraft.title,
      society: positionDraft.society || null,
      start_date: positionDraft.startDate,
    });
    setBusy(false);
    if (err) return setError(err.message);
    setPositionDraft({
      userId: "",
      title: "",
      society: "",
      startDate: new Date().toISOString().slice(0, 10),
    });
    void load();
  }

  async function removePosition(id: string) {
    if (!confirm("Remove this position?")) return;
    const { error: err } = await supabase.from("positions").delete().eq("id", id);
    if (err) return setError(err.message);
    void load();
  }

  async function createAward(e: React.FormEvent) {
    e.preventDefault();
    if (!awardForm.title || !awardForm.recipient) return;
    setAwardBusy(true);
    setError(null);
    let image_url: string | null = null;
    if (awardFile) {
      const path = `awards/${Date.now()}-${awardFile.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
      const { error: upErr } = await supabase.storage.from("gallery").upload(path, awardFile);
      if (upErr) { setAwardBusy(false); return setError(upErr.message); }
      image_url = supabase.storage.from("gallery").getPublicUrl(path).data.publicUrl;
    }
    const { error: err } = await supabase.from("awards").insert({
      title: awardForm.title,
      recipient: awardForm.recipient,
      category: awardForm.category || "General",
      year: awardForm.year,
      description: awardForm.description || null,
      awarded_by: awardForm.awarded_by || null,
      image_url,
    });
    setAwardBusy(false);
    if (err) return setError(err.message);
    setAwardForm({ title: "", recipient: "", category: "General", year: new Date().getFullYear(), description: "", awarded_by: "" });
    setAwardFile(null);
    void load();
  }

  async function deleteAward(id: string) {
    if (!confirm("Delete this award?")) return;
    await supabase.from("awards").delete().eq("id", id);
    void load();
  }

  async function uploadPoster(e: React.FormEvent) {
    e.preventDefault();
    if (!posterFile || !posterForm.session) return;
    setPosterBusy(true);
    setError(null);
    const path = `posters/${Date.now()}-${posterFile.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
    const { error: upErr } = await supabase.storage.from("gallery").upload(path, posterFile);
    if (upErr) { setPosterBusy(false); return setError(upErr.message); }
    const image_url = supabase.storage.from("gallery").getPublicUrl(path).data.publicUrl;
    const { error: dbErr } = await supabase.from("team_posters").insert({
      session: posterForm.session,
      label: posterForm.label || null,
      image_url,
      storage_path: path,
      show_on_home: false,
    });
    setPosterBusy(false);
    if (dbErr) return setError(dbErr.message);
    setPosterForm({ session: "", label: "" });
    setPosterFile(null);
    void load();
  }

  async function deletePoster(id: string) {
    const p = posters.find((x) => x.id === id);
    if (!confirm("Delete this poster?")) return;
    if (p?.storage_path) await supabase.storage.from("gallery").remove([p.storage_path]);
    await supabase.from("team_posters").delete().eq("id", id);
    void load();
  }

  async function togglePosterHome(id: string, current: boolean) {
    await supabase.from("team_posters").update({ show_on_home: !current }).eq("id", id);
    void load();
  }

  const tabs = [
    { key: "events" as const, label: "Events", icon: Calendar },
    { key: "photos" as const, label: "Photos", icon: Image },
    { key: "posters" as const, label: "Posters", icon: LayoutTemplate },
    { key: "members" as const, label: "Members", icon: Users },
    { key: "societies" as const, label: "Societies", icon: Building2 },
    { key: "awards" as const, label: "Awards", icon: Trophy },
    { key: "images" as const, label: "Images", icon: ImagePlus },
    { key: "messages" as const, label: "Messages", icon: Mail },
    { key: "newsletter" as const, label: "Newsletter", icon: Newspaper },
    ...(isCounsellor
      ? [
        {
          key: "requests" as const,
          label: `Requests${pendingMembers.length > 0 ? ` (${pendingMembers.length})` : ""}`,
          icon: ClipboardList,
        },
      ]
      : []),
  ];

  // Group image slots by section
  const imageSlotsBySection = SITE_IMAGE_SLOTS.reduce<Record<string, typeof SITE_IMAGE_SLOTS[number][]>>(
    (acc, slot) => {
      if (!acc[slot.section]) acc[slot.section] = [];
      acc[slot.section]!.push(slot);
      return acc;
    },
    {},
  );

  async function uploadSiteImage(e: React.FormEvent) {
    e.preventDefault();
    if (!imageFile || !imageUploadKey) return;
    setImageUploading(true);
    setError(null);
    const path = `site/${imageUploadKey}-${Date.now()}.${imageFile.name.split(".").pop()}`;
    const { error: upErr } = await supabase.storage.from("gallery").upload(path, imageFile, { upsert: true });
    if (upErr) { setImageUploading(false); return setError(upErr.message); }
    const { data: urlData } = supabase.storage.from("gallery").getPublicUrl(path);
    const { error: dbErr } = await supabase.from("site_images").upsert(
      { key: imageUploadKey, image_url: urlData.publicUrl, updated_at: new Date().toISOString() },
      { onConflict: "key" },
    );
    setImageUploading(false);
    if (dbErr) return setError(dbErr.message);
    setImageFile(null);
    setImageUploadKey(null);
    void load();
  }

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
              className={`flex flex-1 items-center justify-center gap-2 rounded-md px-4 py-2.5 text-sm font-medium transition-all ${tab === t.key
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
            {canCreateEvents ? (
              <form
                onSubmit={createEvent}
                className="space-y-3 rounded-xl border border-border bg-card p-6"
              >
                <h2 className="flex items-center gap-2 text-lg font-semibold">
                  <Plus className="h-4 w-4 text-primary" /> New event
                </h2>
                <input
                  required
                  className={inputClass}
                  placeholder="Event title"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                />
                <textarea
                  className={inputClass}
                  rows={3}
                  placeholder="Description (supports rich text)"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="date"
                    className={inputClass}
                    value={form.event_date}
                    onChange={(e) => setForm({ ...form, event_date: e.target.value })}
                  />
                  <input
                    className={inputClass}
                    placeholder="Location"
                    value={form.location}
                    onChange={(e) => setForm({ ...form, location: e.target.value })}
                  />
                  <select
                    className={inputClass}
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                  >
                    {["Flagship", "Chapter", "Branch", "Workshop"].map((t) => (
                      <option key={t}>{t}</option>
                    ))}
                  </select>
                  <select
                    className={inputClass}
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                  >
                    {["Upcoming", "Open", "Past"].map((t) => (
                      <option key={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2 rounded-lg bg-secondary/40 p-3">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Media & Tags
                  </p>
                  <div className="flex items-center gap-2">
                    <Video className="h-4 w-4 text-muted-foreground" />
                    <input
                      className={inputClass}
                      placeholder="YouTube / video URL (optional)"
                      value={form.video_url}
                      onChange={(e) => setForm({ ...form, video_url: e.target.value })}
                    />
                  </div>
                  <select
                    className={inputClass}
                    value={form.society}
                    onChange={(e) => setForm({ ...form, society: e.target.value })}
                  >
                    <option value="">All societies (general)</option>
                    {societies.map((s) => (
                      <option key={s.slug} value={s.slug}>
                        {s.shortName}
                      </option>
                    ))}
                  </select>
                  <input
                    type="file"
                    accept="image/*"
                    className={inputClass}
                    onChange={(e) => setCoverFile(e.target.files?.[0] ?? null)}
                  />
                  {coverFile && (
                    <p className="text-xs text-muted-foreground">Cover: {coverFile.name}</p>
                  )}
                </div>
                <button
                  disabled={busy}
                  className="w-full rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-60"
                >
                  {busy ? "Creating…" : "Create event"}
                </button>
              </form>
            ) : (
              <div className="rounded-xl border border-border bg-card p-6 flex flex-col items-center justify-center gap-3 text-center">
                <Calendar className="h-8 w-8 text-muted-foreground" />
                <p className="text-sm font-semibold">View-only</p>
                <p className="text-xs text-muted-foreground max-w-xs">
                  Only the Branch Counsellor, Chair and Secretary can create events.
                </p>
              </div>
            )}

            <div className="rounded-xl border border-border bg-card p-6">
              <h2 className="text-lg font-semibold">All events</h2>
              {events.length === 0 ? (
                <p className="mt-3 text-sm text-muted-foreground">No events created yet.</p>
              ) : (
                <ul className="mt-4 space-y-3 max-h-125 overflow-y-auto">
                  {events.map((ev) => (
                    <li
                      key={ev.id}
                      className="flex items-start justify-between gap-3 rounded-lg border border-border p-3"
                    >
                      <div>
                        <p className="text-sm font-semibold">{ev.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {ev.date_label ?? ev.event_date ?? "Date TBA"} · {ev.type} · {ev.status}
                        </p>
                        {ev.description && (
                          <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                            {ev.description}
                          </p>
                        )}
                      </div>
                      {canCreateEvents && (
                        <button
                          onClick={() => deleteEvent(ev.id)}
                          className="shrink-0 rounded-md p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
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
            <form
              onSubmit={uploadPhoto}
              className="space-y-3 rounded-xl border border-border bg-card p-6"
            >
              <h2 className="flex items-center gap-2 text-lg font-semibold">
                <Plus className="h-4 w-4 text-primary" /> Upload photo
              </h2>
              <input
                type="file"
                accept="image/*"
                className={inputClass}
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              />
              <input
                className={inputClass}
                placeholder="Photo title"
                value={photoMeta.title}
                onChange={(e) => setPhotoMeta({ ...photoMeta, title: e.target.value })}
              />
              <input
                className={inputClass}
                placeholder="Album (e.g. Unstoppable Journey 3.0)"
                value={photoMeta.album}
                onChange={(e) => setPhotoMeta({ ...photoMeta, album: e.target.value })}
              />
              <input
                className={inputClass}
                placeholder="Caption"
                value={photoMeta.caption}
                onChange={(e) => setPhotoMeta({ ...photoMeta, caption: e.target.value })}
              />
              <label className="flex items-center gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  id="show-on-home"
                  checked={photoMeta.showOnHome}
                  onChange={(e) => setPhotoMeta({ ...photoMeta, showOnHome: e.target.checked })}
                  className="h-4 w-4 rounded border-input accent-primary"
                />
                <span className="text-sm text-muted-foreground">
                  Show on home page slideshow
                </span>
              </label>
              <button
                disabled={busy || !file}
                className="w-full rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-60"
              >
                {busy ? "Uploading…" : "Upload"}
              </button>
            </form>

            <div className="rounded-xl border border-border bg-card p-6">
              <h2 className="text-lg font-semibold">Album</h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                {photos.map((p) => (
                  <figure key={p.id} className="overflow-hidden rounded-lg border border-border">
                    <img
                      src={p.url}
                      alt={p.title ?? "Album photo"}
                      className="h-24 w-full object-cover"
                    />
                    <figcaption className="flex items-center justify-between gap-2 p-2">
                      <span className="truncate text-[11px] text-muted-foreground">
                        {p.title ?? p.album}
                      </span>
                      <button
                        onClick={() => deletePhoto(p)}
                        className="shrink-0 rounded p-1 text-muted-foreground hover:text-destructive transition-colors"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </figcaption>
                  </figure>
                ))}
              </div>
              {photos.length === 0 && (
                <p className="mt-3 text-sm text-muted-foreground">No photos uploaded yet.</p>
              )}
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
                      <th className="pb-3 pr-4">Roles</th>
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
                      const roles = memberRoles.filter((r) => r.user_id === m.id);
                      return (
                        <tr
                          key={m.id}
                          className="border-b border-border/50 hover:bg-secondary/30 transition-colors"
                        >
                          <td className="py-3 pr-4">
                            <div className="flex items-center gap-2.5">
                              {m.avatar_url ? (
                                <img
                                  src={m.avatar_url}
                                  alt=""
                                  className="h-8 w-8 rounded-full object-cover"
                                />
                              ) : (
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                                  {initials}
                                </div>
                              )}
                              <span className="font-medium">{m.full_name}</span>
                            </div>
                          </td>
                          <td className="py-3 pr-4 text-muted-foreground">{m.email ?? "—"}</td>
                          <td className="py-3 pr-4 font-mono text-xs">{m.ieee_member_id ?? "—"}</td>
                          <td className="py-3 pr-4">
                            {society ? (
                              <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/8 px-2 py-0.5 text-xs font-medium text-primary">
                                <span
                                  className="h-1.5 w-1.5 rounded-full"
                                  style={{ backgroundColor: society.color }}
                                />
                                {society.shortName}
                              </span>
                            ) : (
                              <span className="text-muted-foreground">—</span>
                            )}
                          </td>
                          <td className="py-3 pr-4 text-muted-foreground">{m.branch ?? "—"}</td>
                          <td className="py-3 pr-4 text-muted-foreground">
                            {m.year_of_study ?? "—"}
                          </td>
                          <td className="py-3 pr-4">
                            <div className="flex flex-wrap gap-1">
                              {roles.length === 0 && (
                                <span className="text-xs text-muted-foreground">member</span>
                              )}
                              {roles.map((r) => (
                                <button
                                  key={r.id}
                                  type="button"
                                  onClick={() => removeRole(r.id, r.role)}
                                  disabled={r.role === "member"}
                                  title={r.role === "member" ? "Default role" : "Click to remove"}
                                  className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-semibold text-muted-foreground hover:bg-destructive/10 hover:text-destructive disabled:cursor-default disabled:hover:bg-secondary disabled:hover:text-muted-foreground"
                                >
                                  {r.role.replace("_", " ")}
                                  {r.society ? ` · ${r.society}` : ""}
                                </button>
                              ))}
                            </div>
                            <div className="mt-2 flex flex-wrap items-center gap-1">
                              <select
                                className="rounded border border-input bg-background px-1.5 py-1 text-[10px]"
                                value={roleDraft.userId === m.id ? roleDraft.role : "editor"}
                                onChange={(e) =>
                                  setRoleDraft({
                                    userId: m.id,
                                    role: e.target.value as AppRole,
                                    society: "",
                                  })
                                }
                              >
                                {LEADERSHIP_ROLES.map((r) => (
                                  <option key={r} value={r}>
                                    {r.replace("_", " ")}
                                  </option>
                                ))}
                              </select>
                              {(roleDraft.userId === m.id ? roleDraft.role : "editor") ===
                                "society_chair" && (
                                  <select
                                    className="rounded border border-input bg-background px-1.5 py-1 text-[10px]"
                                    value={roleDraft.userId === m.id ? roleDraft.society : ""}
                                    onChange={(e) =>
                                      setRoleDraft((d) => ({
                                        userId: m.id,
                                        role: d.userId === m.id ? d.role : "society_chair",
                                        society: e.target.value,
                                      }))
                                    }
                                  >
                                    <option value="">Society…</option>
                                    {societies.map((s) => (
                                      <option key={s.slug} value={s.slug}>
                                        {s.shortName}
                                      </option>
                                    ))}
                                  </select>
                                )}
                              <button
                                type="button"
                                onClick={() => {
                                  const role =
                                    roleDraft.userId === m.id ? roleDraft.role : "editor";
                                  const society =
                                    roleDraft.userId === m.id ? roleDraft.society : "";
                                  void assignRole(m.id, role, society);
                                }}
                                className="rounded bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary hover:bg-primary/20"
                              >
                                + Role
                              </button>
                            </div>
                          </td>
                          <td className="py-3">
                            <button
                              onClick={() => deleteMember(m.id)}
                              className="rounded-md p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                            >
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
                const canEditThis =
                  canEdit && (chairSocieties.length === 0 || chairSocieties.includes(s.slug));
                return (
                  <article key={s.slug} className="rounded-xl border border-border p-5">
                    <div className="flex items-center gap-3 mb-2">
                      <span
                        className="h-4 w-4 rounded-full"
                        style={{ backgroundColor: s.color || "#ccc" }}
                      />
                      <h3 className="text-base font-semibold">{s.name}</h3>
                    </div>
                    {editingSociety?.slug === s.slug ? (
                      <form onSubmit={saveSociety} className="mt-4 space-y-3">
                        <input
                          className={inputClass}
                          value={editingSociety.tagline || ""}
                          placeholder="Tagline"
                          onChange={(e) =>
                            setEditingSociety({ ...editingSociety, tagline: e.target.value })
                          }
                        />
                        <textarea
                          className={inputClass}
                          rows={3}
                          value={editingSociety.description || ""}
                          placeholder="Description"
                          onChange={(e) =>
                            setEditingSociety({ ...editingSociety, description: e.target.value })
                          }
                        />
                        <div className="flex items-center gap-2">
                          <label className="text-xs font-semibold uppercase text-muted-foreground">
                            Color:
                          </label>
                          <input
                            type="color"
                            className="h-8 w-14 rounded-md cursor-pointer"
                            value={editingSociety.color || "#006699"}
                            onChange={(e) =>
                              setEditingSociety({ ...editingSociety, color: e.target.value })
                            }
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            disabled={busy}
                            className="rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground"
                          >
                            Save changes
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingSociety(null)}
                            className="text-xs font-medium text-muted-foreground hover:text-foreground"
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    ) : (
                      <>
                        <p className="text-sm font-medium text-primary mt-1">{s.tagline}</p>
                        <p className="mt-2 text-sm text-muted-foreground">{s.description}</p>
                        <div className="mt-4">
                          {canEditThis ? (
                            <button
                              onClick={() => setEditingSociety(s)}
                              className="rounded-md border border-border px-3 py-1.5 text-xs font-medium transition-colors hover:bg-secondary"
                            >
                              Edit details
                            </button>
                          ) : (
                            <p className="text-xs text-muted-foreground">
                              Only branch leadership or this society&apos;s chair can edit.
                            </p>
                          )}
                        </div>
                      </>
                    )}
                  </article>
                );
              })}
            </div>
          </div>
        )}

        {/* ─── Messages Tab ─── */}
        {tab === "messages" && (
          <div className="rounded-xl border border-border bg-card p-6">
            <h2 className="text-lg font-semibold mb-4">
              Contact Messages ({contactMessages.length})
            </h2>
            {contactMessages.length === 0 ? (
              <p className="text-sm text-muted-foreground">No messages yet.</p>
            ) : (
              <div className="space-y-4 max-h-150 overflow-y-auto">
                {contactMessages.map((m) => (
                  <article key={m.id} className="rounded-lg border border-border p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold">{m.name}</p>
                        <a
                          href={`mailto:${m.email}`}
                          className="text-xs text-primary hover:underline"
                        >
                          {m.email}
                        </a>
                      </div>
                      <span className="text-xs text-muted-foreground shrink-0">
                        {new Date(m.created_at).toLocaleDateString(undefined, {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                    <p className="mt-2 text-sm font-medium">{m.subject}</p>
                    <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
                      {m.message}
                    </p>
                  </article>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ─── Newsletter Tab ─── */}
        {tab === "newsletter" && (
          <div className="rounded-xl border border-border bg-card p-6">
            <h2 className="text-lg font-semibold mb-4">
              Newsletter Subscribers ({newsletterSubs.length})
            </h2>
            {newsletterSubs.length === 0 ? (
              <p className="text-sm text-muted-foreground">No subscribers yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      <th className="pb-3 pr-6">Name</th>
                      <th className="pb-3 pr-6">Email</th>
                      <th className="pb-3">Subscribed</th>
                    </tr>
                  </thead>
                  <tbody>
                    {newsletterSubs.map((s) => (
                      <tr
                        key={s.id}
                        className="border-b border-border/50 hover:bg-secondary/30 transition-colors"
                      >
                        <td className="py-3 pr-6 font-medium">{s.name}</td>
                        <td className="py-3 pr-6">
                          <a href={`mailto:${s.email}`} className="text-primary hover:underline">
                            {s.email}
                          </a>
                        </td>
                        <td className="py-3 text-muted-foreground text-xs">
                          {new Date(s.subscribed_at).toLocaleDateString(undefined, {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ─── Requests Tab (counsellor only) ─── */}
        {tab === "requests" && isCounsellor && (
          <div className="space-y-6">
            <div className="rounded-xl border border-border bg-card p-6">
              <h2 className="text-lg font-semibold mb-1">Registration Requests</h2>
              <p className="text-sm text-muted-foreground mb-4">
                Approve members to grant portal access. Their desired position is auto-assigned on
                approval.
              </p>
              {pendingMembers.length === 0 ? (
                <div className="flex flex-col items-center gap-2 py-10 text-center">
                  <Check className="h-8 w-8 text-green-500" />
                  <p className="text-sm font-semibold">All clear — no pending requests.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {pendingMembers.map((m) => (
                    <article key={m.id} className="rounded-xl border border-border p-4">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div className="space-y-1.5">
                          <p className="font-semibold">{m.full_name}</p>
                          <p className="text-xs text-muted-foreground">{m.email}</p>
                          <div className="flex flex-wrap gap-1.5 text-xs">
                            {m.ieee_member_id && (
                              <span className="rounded-full bg-secondary px-2 py-0.5 font-mono">
                                IEEE {m.ieee_member_id}
                              </span>
                            )}
                            {m.branch && (
                              <span className="rounded-full bg-secondary px-2 py-0.5">
                                {m.branch}
                              </span>
                            )}
                            {m.year_of_study && (
                              <span className="rounded-full bg-secondary px-2 py-0.5">
                                Year {m.year_of_study}
                              </span>
                            )}
                            {m.society && (
                              <span className="rounded-full bg-primary/10 text-primary px-2 py-0.5">
                                {societies.find((s) => s.slug === m.society)?.shortName ??
                                  m.society}
                              </span>
                            )}
                          </div>
                          {(m.desired_position || m.desired_society) && (
                            <p className="text-xs text-muted-foreground">
                              Requested position:{" "}
                              <span className="font-medium text-foreground">
                                {m.desired_position}
                                {m.desired_society
                                  ? ` · ${societies.find((s) => s.slug === m.desired_society)?.shortName ?? m.desired_society}`
                                  : " (Branch)"}
                              </span>
                            </p>
                          )}
                          <p className="text-[10px] text-muted-foreground">
                            Registered{" "}
                            {new Date(m.created_at).toLocaleDateString(undefined, {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </p>
                        </div>
                        <div className="flex gap-2 shrink-0">
                          <button
                            disabled={busy}
                            onClick={() =>
                              approveMember(m.id, m.desired_position, m.desired_society)
                            }
                            className="flex items-center gap-1.5 rounded-lg bg-green-600 px-4 py-2 text-xs font-semibold text-white hover:bg-green-700 disabled:opacity-60 transition-colors"
                          >
                            <Check className="h-3.5 w-3.5" /> Approve
                          </button>
                          <button
                            onClick={() => rejectMember(m.id)}
                            className="flex items-center gap-1.5 rounded-lg border border-destructive/30 px-4 py-2 text-xs font-semibold text-destructive hover:bg-destructive/10 transition-colors"
                          >
                            <X className="h-3.5 w-3.5" /> Reject
                          </button>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>

            {/* Assign / remove positions */}
            <div className="rounded-xl border border-border bg-card p-6">
              <h2 className="flex items-center gap-2 text-lg font-semibold mb-4">
                <UserPlus className="h-4 w-4 text-primary" /> Assign Position
              </h2>
              <form onSubmit={addPosition} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <select
                  required
                  className={inputClass}
                  value={positionDraft.userId}
                  onChange={(e) => setPositionDraft((d) => ({ ...d, userId: e.target.value }))}
                >
                  <option value="">Select member…</option>
                  {members
                    .filter((m) => m.full_name)
                    .map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.full_name}
                      </option>
                    ))}
                </select>
                <input
                  required
                  className={inputClass}
                  placeholder="Title e.g. Chair, Secretary"
                  value={positionDraft.title}
                  onChange={(e) => setPositionDraft((d) => ({ ...d, title: e.target.value }))}
                />
                <select
                  className={inputClass}
                  value={positionDraft.society}
                  onChange={(e) => setPositionDraft((d) => ({ ...d, society: e.target.value }))}
                >
                  <option value="">Branch (no society)</option>
                  {societies.map((s) => (
                    <option key={s.slug} value={s.slug}>
                      {s.shortName}
                    </option>
                  ))}
                </select>
                <button
                  type="submit"
                  disabled={busy}
                  className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-60"
                >
                  {busy ? "Saving…" : "Assign"}
                </button>
              </form>
              {allPositions.length > 0 && (
                <div className="mt-4 max-h-56 overflow-y-auto space-y-1">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                    Active positions
                  </p>
                  {allPositions.map((p) => {
                    const member = members.find((mem) => mem.id === p.user_id);
                    return (
                      <div
                        key={p.id}
                        className="flex items-center justify-between rounded-lg border border-border px-3 py-2 text-sm"
                      >
                        <span className="font-medium">{member?.full_name ?? "Unknown"}</span>
                        <span className="text-muted-foreground">
                          {p.title}
                          {p.society ? ` · ${p.society.toUpperCase()}` : ""}
                        </span>
                        <button
                          onClick={() => removePosition(p.id)}
                          className="rounded p-1 text-muted-foreground hover:text-destructive transition-colors"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
        {/* ─── Images Tab ─── */}
        {tab === "images" && (
          <div className="space-y-8">
            <p className="text-sm text-muted-foreground">
              Upload a new image to replace any photo on the site. Changes take effect immediately.
            </p>
            {Object.entries(imageSlotsBySection).map(([section, slots]) => (
              <div key={section}>
                <h2 className="mb-4 text-base font-bold text-muted-foreground uppercase tracking-wider">{section}</h2>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {slots.map((slot) => (
                    <div key={slot.key} className="rounded-xl border border-border bg-card overflow-hidden">
                      {/* Current image preview */}
                      <div className="relative h-32 bg-secondary/40">
                        {siteImages[slot.key] ? (
                          <img
                            src={siteImages[slot.key]}
                            alt={slot.label}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center">
                            <ImagePlus className="h-8 w-8 text-muted-foreground/40" />
                          </div>
                        )}
                        {siteImages[slot.key] && (
                          <span className="absolute top-2 right-2 rounded-full bg-green-500 px-2 py-0.5 text-[10px] font-bold text-white">Custom</span>
                        )}
                      </div>
                      {/* Upload form */}
                      <div className="p-3">
                        <p className="text-xs font-semibold mb-2">{slot.label}</p>
                        {imageUploadKey === slot.key ? (
                          <form onSubmit={uploadSiteImage} className="space-y-2">
                            <input
                              type="file"
                              accept="image/*"
                              className="w-full rounded border border-input bg-background px-2 py-1 text-xs"
                              onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
                            />
                            <div className="flex gap-2">
                              <button
                                type="submit"
                                disabled={imageUploading || !imageFile}
                                className="flex-1 rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground disabled:opacity-60"
                              >
                                {imageUploading ? "Uploading…" : "Upload"}
                              </button>
                              <button
                                type="button"
                                onClick={() => { setImageUploadKey(null); setImageFile(null); }}
                                className="rounded-md border border-border px-3 py-1.5 text-xs"
                              >
                                Cancel
                              </button>
                            </div>
                          </form>
                        ) : (
                          <button
                            onClick={() => setImageUploadKey(slot.key as SiteImageKey)}
                            className="w-full rounded-md border border-dashed border-border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:border-primary hover:text-primary transition-colors"
                          >
                            {siteImages[slot.key] ? "Replace image" : "Upload image"}
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
        {/* ─── Posters Tab ─── */}
        {tab === "posters" && (
          <div className="grid gap-6 lg:grid-cols-[1fr_1.4fr]">
            {/* Upload form */}
            <form onSubmit={uploadPoster} className="space-y-3 rounded-xl border border-border bg-card p-6">
              <h2 className="flex items-center gap-2 text-lg font-semibold">
                <LayoutTemplate className="h-4 w-4 text-primary" /> Upload team poster
              </h2>
              <p className="text-xs text-muted-foreground">
                Upload a group photo or collage for a session. Mark it "Show on home" to display it on the landing page.
              </p>
              <input
                required
                className={inputClass}
                placeholder="Session (e.g. 2025-26) *"
                value={posterForm.session}
                onChange={(e) => setPosterForm({ ...posterForm, session: e.target.value })}
              />
              <input
                className={inputClass}
                placeholder="Label (optional, e.g. Executive Committee)"
                value={posterForm.label}
                onChange={(e) => setPosterForm({ ...posterForm, label: e.target.value })}
              />
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">Poster image *</label>
                <input
                  type="file"
                  accept="image/*"
                  required
                  className={inputClass}
                  onChange={(e) => setPosterFile(e.target.files?.[0] ?? null)}
                />
              </div>
              <button
                disabled={posterBusy || !posterFile || !posterForm.session}
                className="w-full rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-60"
              >
                {posterBusy ? "Uploading…" : "Upload poster"}
              </button>
            </form>

            {/* Posters list */}
            <div className="rounded-xl border border-border bg-card p-6">
              <h2 className="mb-4 text-lg font-semibold">All posters ({posters.length})</h2>
              {posters.length === 0 ? (
                <p className="text-sm text-muted-foreground">No posters uploaded yet.</p>
              ) : (
                <ul className="space-y-3">
                  {posters.map((p) => (
                    <li
                      key={p.id}
                      className="overflow-hidden rounded-xl border border-border/50 hover:bg-secondary/30 transition-colors"
                    >
                      <img
                        src={p.image_url}
                        alt={p.session}
                        className="h-32 w-full object-cover"
                      />
                      <div className="flex items-center justify-between gap-2 p-3">
                        <div className="min-w-0">
                          <p className="text-sm font-semibold truncate">{p.session}</p>
                          {p.label && <p className="text-xs text-muted-foreground truncate">{p.label}</p>}
                        </div>
                        <div className="flex shrink-0 items-center gap-2">
                          <button
                            onClick={() => togglePosterHome(p.id, p.show_on_home)}
                            title={p.show_on_home ? "Remove from home" : "Show on home page"}
                            className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold transition-all ${
                              p.show_on_home
                                ? "bg-primary text-primary-foreground"
                                : "border border-border text-muted-foreground hover:border-primary hover:text-primary"
                            }`}
                          >
                            <Home className="h-3 w-3" />
                            {p.show_on_home ? "On home" : "Home"}
                          </button>
                          <button
                            onClick={() => deletePoster(p.id)}
                            className="rounded p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}

        {/* ─── Awards Tab ─── */}
        {tab === "awards" && (
          <div className="grid gap-6 lg:grid-cols-[1fr_1.4fr]">
            {/* Add form */}
            <form onSubmit={createAward} className="space-y-3 rounded-xl border border-border bg-card p-6">
              <h2 className="flex items-center gap-2 text-lg font-semibold">
                <Trophy className="h-4 w-4 text-primary" /> Add award
              </h2>
              <input
                required
                className={inputClass}
                placeholder="Award title *"
                value={awardForm.title}
                onChange={(e) => setAwardForm({ ...awardForm, title: e.target.value })}
              />
              <input
                required
                className={inputClass}
                placeholder="Recipient name / team *"
                value={awardForm.recipient}
                onChange={(e) => setAwardForm({ ...awardForm, recipient: e.target.value })}
              />
              <div className="grid grid-cols-2 gap-3">
                <select
                  className={inputClass}
                  value={awardForm.category}
                  onChange={(e) => setAwardForm({ ...awardForm, category: e.target.value })}
                >
                  {["General", "Technical Excellence", "Leadership", "Best Paper", "Humanitarian"].map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                <input
                  type="number"
                  className={inputClass}
                  placeholder="Year"
                  value={awardForm.year}
                  onChange={(e) => setAwardForm({ ...awardForm, year: Number(e.target.value) })}
                />
              </div>
              <input
                className={inputClass}
                placeholder="Awarded by (e.g. IEEE UP Section)"
                value={awardForm.awarded_by}
                onChange={(e) => setAwardForm({ ...awardForm, awarded_by: e.target.value })}
              />
              <textarea
                className={inputClass}
                rows={3}
                placeholder="Description (optional)"
                value={awardForm.description}
                onChange={(e) => setAwardForm({ ...awardForm, description: e.target.value })}
              />
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">Photo (optional)</label>
                <input
                  type="file"
                  accept="image/*"
                  className={inputClass}
                  onChange={(e) => setAwardFile(e.target.files?.[0] ?? null)}
                />
              </div>
              <button
                disabled={awardBusy || !awardForm.title || !awardForm.recipient}
                className="w-full rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-60"
              >
                {awardBusy ? "Saving…" : "Add award"}
              </button>
            </form>

            {/* Awards list */}
            <div className="rounded-xl border border-border bg-card p-6">
              <h2 className="mb-4 text-lg font-semibold">All awards ({awards.length})</h2>
              {awards.length === 0 ? (
                <p className="text-sm text-muted-foreground">No awards added yet.</p>
              ) : (
                <ul className="space-y-3">
                  {awards.map((a) => (
                    <li
                      key={a.id}
                      className="flex items-start justify-between gap-3 rounded-lg border border-border/50 p-3 hover:bg-secondary/30 transition-colors"
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-semibold truncate">{a.title}</p>
                        <p className="text-xs text-primary">{a.recipient}</p>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {a.category} · {a.year}{a.awarded_by ? ` · ${a.awarded_by}` : ""}
                        </p>
                        {a.description && (
                          <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{a.description}</p>
                        )}
                      </div>
                      <button
                        onClick={() => deleteAward(a.id)}
                        className="shrink-0 rounded p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}

      </section>
    </>
  );
}
