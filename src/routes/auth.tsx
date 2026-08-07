import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { PageHeader } from "@/components/site/PageHeader";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { chapters } from "@/data/site";

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

function AuthPage() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    email: "",
    password: "",
    full_name: "",
    ieee_member_id: "",
    branch: "",
    year_of_study: "",
    society: "",
  });

  useEffect(() => {
    if (!loading && user) navigate({ to: "/dashboard", replace: true });
  }, [loading, user, navigate]);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

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
          },
        },
      });
      if (err) setError(err.message);
      else if (!data.session) setMessage("Account created. Check your email to confirm, then sign in.");
      else navigate({ to: "/dashboard" });
    }
    setBusy(false);
  }

  return (
    <>
      <PageHeader
        eyebrow="Member portal"
        title={mode === "signin" ? "Sign in to your account" : "Create your member account"}
        description="IEEE BBDITM members, society chairs and the branch counsellor use this portal to manage member records, events and the photo album."
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
                <Field label="Society / chapter">
                  <select className={inputClass} value={form.society} onChange={set("society")}>
                    <option value="">None</option>
                    {chapters.map((c) => (
                      <option key={c.slug} value={c.slug}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </Field>
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