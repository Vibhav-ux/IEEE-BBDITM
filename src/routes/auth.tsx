import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Camera, Clock } from "lucide-react";

import { PageHeader } from "@/components/site/PageHeader";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { societies } from "@/data/site";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Member Login — IEEE BBDITM" },
      {
        name: "description",
        content:
          "Sign in to the IEEE BBDITM member portal to manage your profile, positions, events and the photo album.",
      },
      { property: "og:title", content: "Member Login — IEEE BBDITM" },
      { property: "og:description", content: "IEEE BBDITM member and admin portal login." },
      { property: "og:url", content: "/auth" },
    ],
    links: [{ rel: "canonical", href: "/auth" }],
  }),
  component: AuthPage,
});

const inputClass =
  "w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary";

const POSITIONS = [
  "Chair",
  "Vice-Chair",
  "Secretary",
  "Treasurer",
  "Webmaster",
  "Editor",
  "Volunteer",
  "Member",
];

function AuthPage() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [pendingApproval, setPendingApproval] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    email: "",
    password: "",
    full_name: "",
    ieee_member_id: "",
    branch: "",
    year_of_study: "",
    society: "",
    phone: "",
    enrollment_no: "",
    desired_society: "",
    desired_position: "",
  });

  useEffect(() => {
    if (!loading && user) navigate({ to: "/dashboard", replace: true });
  }, [loading, user, navigate]);

  const set =
    (k: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    const reader = new FileReader();
    reader.onload = () => setAvatarPreview(reader.result as string);
    reader.readAsDataURL(file);
  }

  async function uploadAvatar(userId: string): Promise<string | null> {
    if (!avatarFile) return null;
    const ext = avatarFile.name.split(".").pop() ?? "jpg";
    const path = `${userId}/avatar.${ext}`;
    const { error: upErr } = await supabase.storage.from("avatars").upload(path, avatarFile, { upsert: true });
    if (upErr) {
      console.error("Avatar upload error:", upErr.message);
      return null;
    }
    const { data } = supabase.storage.from("avatars").getPublicUrl(path);
    return data.publicUrl;
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setMessage(null);

    if (mode === "signin") {
      const { error: err } = await supabase.auth.signInWithPassword({
        email: form.email.trim(),
        password: form.password,
      });
      if (err) setError(err.message);
      else navigate({ to: "/dashboard" });
    } else {
      const { data, error: err } = await supabase.auth.signUp({
        email: form.email.trim(),
        password: form.password,
        options: {
          emailRedirectTo: window.location.origin,
          data: {
            full_name: form.full_name.trim(),
            ieee_member_id: form.ieee_member_id.trim(),
            branch: form.branch.trim(),
            year_of_study: form.year_of_study.trim(),
            society: form.society,
            phone: form.phone.trim(),
            enrollment_no: form.enrollment_no.trim(),
            desired_society: form.desired_society,
            desired_position: form.desired_position,
          },
        },
      });
      if (err) {
        setError(err.message);
      } else if (data.user) {
        // Upload avatar if provided
        const avatarUrl = await uploadAvatar(data.user.id);
        if (avatarUrl) {
          await supabase.from("profiles").update({ avatar_url: avatarUrl }).eq("id", data.user.id);
        }
        if (!data.session) {
          setMessage("Account created. Check your email to confirm, then sign in.");
        } else {
          // Signed in immediately — show pending approval notice
          setPendingApproval(true);
        }
      }
    }
    setBusy(false);
  }

  if (pendingApproval) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
        <div className="max-w-md">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-amber-50 border-2 border-amber-200">
            <Clock className="h-10 w-10 text-amber-500" />
          </div>
          <h1 className="font-display text-2xl font-bold">You're registered!</h1>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Your account is <strong>pending approval</strong> by the Branch Counsellor. You'll receive
            access to the member portal once your account is approved.
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            Registered as <span className="font-mono font-medium">{form.email}</span>
          </p>
          <a
            href="/"
            className="mt-6 inline-block rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground"
          >
            Back to home
          </a>
        </div>
      </div>
    );
  }

  return (
    <>
      <PageHeader
        eyebrow="Member portal"
        title={mode === "signin" ? "Sign in to your account" : "Create your member account"}
        description={
          mode === "signup"
            ? "Register to join IEEE BBDITM. Your account will be reviewed and approved by the Branch Counsellor."
            : "IEEE BBDITM members, society chairs and the branch counsellor use this portal to manage member records, events and the photo album."
        }
      />

      <section className="section-shell py-16">
        <div className="mx-auto max-w-md rounded-xl border border-border bg-card p-6">
          <div className="mb-6 flex gap-2">
            {(["signin", "signup"] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                className={
                  m === mode
                    ? "flex-1 rounded-full bg-primary px-4 py-1.5 text-sm font-semibold text-primary-foreground"
                    : "flex-1 rounded-full border border-border px-4 py-1.5 text-sm font-medium text-muted-foreground"
                }
              >
                {m === "signin" ? "Sign in" : "Register"}
              </button>
            ))}
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
            {mode === "signup" && (
              <>
                {/* Avatar upload */}
                <div className="flex flex-col items-center gap-2">
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    className="group relative flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border-2 border-dashed border-border bg-secondary/40 transition-all hover:border-primary/50 hover:bg-primary/5"
                  >
                    {avatarPreview ? (
                      <img src={avatarPreview} alt="Avatar preview" className="h-full w-full object-cover" />
                    ) : (
                      <Camera className="h-6 w-6 text-muted-foreground transition-colors group-hover:text-primary" />
                    )}
                    <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                      <Camera className="h-5 w-5 text-white" />
                    </div>
                  </button>
                  <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                  <span className="text-[11px] text-muted-foreground">
                    {avatarFile ? avatarFile.name : "Upload profile photo (optional)"}
                  </span>
                </div>

                <Field label="Full name">
                  <input required className={inputClass} value={form.full_name} onChange={set("full_name")} />
                </Field>
                <Field label="IEEE membership ID">
                  <input
                    required
                    className={inputClass}
                    placeholder="e.g. 98765432"
                    value={form.ieee_member_id}
                    onChange={set("ieee_member_id")}
                  />
                </Field>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Branch">
                    <input className={inputClass} value={form.branch} onChange={set("branch")} />
                  </Field>
                  <Field label="Year">
                    <input className={inputClass} value={form.year_of_study} onChange={set("year_of_study")} />
                  </Field>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Phone">
                    <input className={inputClass} placeholder="+91 ..." value={form.phone} onChange={set("phone")} />
                  </Field>
                  <Field label="Enrollment No.">
                    <input className={inputClass} value={form.enrollment_no} onChange={set("enrollment_no")} />
                  </Field>
                </div>

                {/* Society membership */}
                <Field label="Society / chapter">
                  <select className={inputClass} value={form.society} onChange={set("society")}>
                    <option value="">None</option>
                    {societies.map((c) => (
                      <option key={c.slug} value={c.slug}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </Field>

                {/* Desired position — used by counsellor to review and assign */}
                <div className="rounded-lg bg-secondary/40 p-4 space-y-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Position request (optional)
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Let the counsellor know what role you'd like to hold. You can hold positions in multiple societies.
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Desired society">
                      <select className={inputClass} value={form.desired_society} onChange={set("desired_society")}>
                        <option value="">— Select —</option>
                        <option value="branch">IEEE Student Branch</option>
                        {societies.map((c) => (
                          <option key={c.slug} value={c.slug}>
                            {c.shortName}
                          </option>
                        ))}
                      </select>
                    </Field>
                    <Field label="Desired position">
                      <select className={inputClass} value={form.desired_position} onChange={set("desired_position")}>
                        <option value="">— Select —</option>
                        {POSITIONS.map((p) => (
                          <option key={p} value={p}>
                            {p}
                          </option>
                        ))}
                      </select>
                    </Field>
                  </div>
                </div>

                {/* Approval notice */}
                <div className="flex items-start gap-2.5 rounded-lg border border-amber-200 bg-amber-50 px-3.5 py-3">
                  <Clock className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
                  <p className="text-xs leading-relaxed text-amber-700">
                    Your account will be reviewed by the Branch Counsellor before you get access to the member portal.
                  </p>
                </div>
              </>
            )}

            <Field label="Email">
              <input required type="email" className={inputClass} value={form.email} onChange={set("email")} />
            </Field>
            <Field label="Password">
              <input
                required
                type="password"
                minLength={6}
                className={inputClass}
                value={form.password}
                onChange={set("password")}
              />
            </Field>

            {error && <p className="text-sm text-destructive">{error}</p>}
            {message && <p className="text-sm text-muted-foreground">{message}</p>}

            <button
              type="submit"
              disabled={busy}
              className="w-full rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-60"
            >
              {busy ? "Please wait…" : mode === "signin" ? "Sign in" : "Create account"}
            </button>
          </form>
        </div>
      </section>
    </>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
      {children}
    </label>
  );
}