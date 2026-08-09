import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Eye, EyeOff } from "lucide-react";

import { PageHeader } from "@/components/site/PageHeader";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { societies } from "@/data/site";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "My Dashboard — IEEE BBDITM" },
      {
        name: "description",
        content: "Manage your IEEE BBDITM member profile and positions held.",
      },
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
  enrollment_no: string | null;
  avatar_url: string | null;
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
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [pwForm, setPwForm] = useState({ current: "", next: "", confirm: "" });
  const [pwBusy, setPwBusy] = useState(false);
  const [pwError, setPwError] = useState<string | null>(null);
  const [pwSaved, setPwSaved] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

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
        enrollment_no: profile.enrollment_no,
      })
      .eq("id", profile.id);
    if (err) setError(err.message);
    else {
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    }
  }

  async function changePassword(e: React.FormEvent) {
    e.preventDefault();
    setPwError(null);
    if (pwForm.next !== pwForm.confirm) {
      setPwError("New passwords do not match.");
      return;
    }
    if (pwForm.next.length < 6) {
      setPwError("Password must be at least 6 characters.");
      return;
    }
    setPwBusy(true);
    // Re-authenticate first
    const email = user?.email ?? "";
    const { error: signInErr } = await supabase.auth.signInWithPassword({
      email,
      password: pwForm.current,
    });
    if (signInErr) {
      setPwBusy(false);
      setPwError("Current password is incorrect.");
      return;
    }
    const { error: updateErr } = await supabase.auth.updateUser({ password: pwForm.next });
    setPwBusy(false);
    if (updateErr) {
      setPwError(updateErr.message);
      return;
    }
    setPwForm({ current: "", next: "", confirm: "" });
    setPwSaved(true);
    setTimeout(() => setPwSaved(false), 3000);
  }

  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setUploadingAvatar(true);
    setError(null);

    const ext = file.name.split(".").pop() ?? "jpg";
    const path = `${user.id}/avatar.${ext}`;

    const { error: upErr } = await supabase.storage
      .from("avatars")
      .upload(path, file, { upsert: true });
    if (upErr) {
      setError(upErr.message);
      setUploadingAvatar(false);
      return;
    }

    const { data } = supabase.storage.from("avatars").getPublicUrl(path);
    const avatarUrl = data.publicUrl;

    const { error: updateErr } = await supabase
      .from("profiles")
      .update({ avatar_url: avatarUrl })
      .eq("id", user.id);
    if (updateErr) {
      setError(updateErr.message);
    } else if (profile) {
      setProfile({ ...profile, avatar_url: avatarUrl });
    }

    setUploadingAvatar(false);
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
              <div className="sm:col-span-2 mb-2 flex items-center gap-4">
                <div className="relative h-16 w-16 overflow-hidden rounded-full border border-border bg-secondary/50">
                  {profile.avatar_url ? (
                    <img
                      src={profile.avatar_url}
                      alt="Profile"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-lg font-bold text-muted-foreground">
                      {profile.full_name.charAt(0)}
                    </div>
                  )}
                  <label className="absolute inset-0 flex cursor-pointer items-center justify-center bg-black/50 opacity-0 transition-opacity hover:opacity-100">
                    <span className="text-[10px] font-semibold text-white">Edit</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleAvatarUpload}
                      disabled={uploadingAvatar}
                    />
                  </label>
                </div>
                {uploadingAvatar && (
                  <span className="text-xs text-muted-foreground">Uploading...</span>
                )}
              </div>
              <label className="block sm:col-span-2">
                <span className="mb-1.5 block text-xs font-semibold uppercase text-muted-foreground">
                  Full name
                </span>
                <input
                  className={inputClass}
                  value={profile.full_name}
                  onChange={set("full_name")}
                />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-xs font-semibold uppercase text-muted-foreground">
                  IEEE member ID
                </span>
                <input
                  className={inputClass}
                  value={profile.ieee_member_id ?? ""}
                  onChange={set("ieee_member_id")}
                />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-xs font-semibold uppercase text-muted-foreground">
                  Phone
                </span>
                <input className={inputClass} value={profile.phone ?? ""} onChange={set("phone")} />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-xs font-semibold uppercase text-muted-foreground">
                  Branch
                </span>
                <input
                  className={inputClass}
                  value={profile.branch ?? ""}
                  onChange={set("branch")}
                />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-xs font-semibold uppercase text-muted-foreground">
                  Year
                </span>
                <input
                  className={inputClass}
                  value={profile.year_of_study ?? ""}
                  onChange={set("year_of_study")}
                />
              </label>
              <label className="block sm:col-span-2">
                <span className="mb-1.5 block text-xs font-semibold uppercase text-muted-foreground">
                  Society
                </span>
                <select
                  className={inputClass}
                  value={profile.society ?? ""}
                  onChange={set("society")}
                >
                  <option value="">None</option>
                  {societies.map((c) => (
                    <option key={c.slug} value={c.slug}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block sm:col-span-2">
                <span className="mb-1.5 block text-xs font-semibold uppercase text-muted-foreground">
                  Enrollment No.
                </span>
                <input
                  className={inputClass}
                  value={profile.enrollment_no ?? ""}
                  onChange={set("enrollment_no")}
                />
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
              <Link
                to="/members"
                className="rounded-md border border-border px-3 py-1.5 text-sm font-medium"
              >
                Member directory
              </Link>
              {canEdit && (
                <Link
                  to="/admin"
                  className="rounded-md bg-primary px-3 py-1.5 text-sm font-semibold text-primary-foreground"
                >
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

          {/* Change Password */}
          <div className="rounded-xl border border-border bg-card p-6">
            <h2 className="text-lg font-semibold">Change password</h2>
            <form onSubmit={changePassword} className="mt-4 space-y-3">
              {/* Current password */}
              <label className="block">
                <span className="mb-1.5 block text-xs font-semibold uppercase text-muted-foreground">
                  Current password
                </span>
                <div className="relative">
                  <input
                    required
                    type={showCurrent ? "text" : "password"}
                    className={inputClass}
                    value={pwForm.current}
                    onChange={(e) => setPwForm((f) => ({ ...f, current: e.target.value }))}
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => setShowCurrent((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </label>
              {/* New password */}
              <label className="block">
                <span className="mb-1.5 block text-xs font-semibold uppercase text-muted-foreground">
                  New password
                </span>
                <div className="relative">
                  <input
                    required
                    type={showNew ? "text" : "password"}
                    minLength={6}
                    className={inputClass}
                    value={pwForm.next}
                    onChange={(e) => setPwForm((f) => ({ ...f, next: e.target.value }))}
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => setShowNew((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </label>
              {/* Confirm new password */}
              <label className="block">
                <span className="mb-1.5 block text-xs font-semibold uppercase text-muted-foreground">
                  Confirm new password
                </span>
                <div className="relative">
                  <input
                    required
                    type={showConfirm ? "text" : "password"}
                    minLength={6}
                    className={inputClass}
                    value={pwForm.confirm}
                    onChange={(e) => setPwForm((f) => ({ ...f, confirm: e.target.value }))}
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => setShowConfirm((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </label>
              {pwError && <p className="text-sm text-destructive">{pwError}</p>}
              {pwSaved && (
                <p className="text-sm text-green-600 font-medium">Password updated successfully!</p>
              )}
              <button
                type="submit"
                disabled={pwBusy}
                className="w-full rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-60"
              >
                {pwBusy ? "Updating…" : "Update password"}
              </button>
            </form>
          </div>
        </div>
      </section>
    </>
  );
}
