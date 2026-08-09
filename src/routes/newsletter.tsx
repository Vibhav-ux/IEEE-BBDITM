import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Mail, CheckCircle } from "lucide-react";
import { PageHeader } from "@/components/site/PageHeader";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/newsletter")({
  head: () => ({
    meta: [
      { title: "Newsletter — IEEE BBDITM" },
      {
        name: "description",
        content:
          "Subscribe to the IEEE BBDITM Student Branch newsletter for updates on events, workshops and opportunities.",
      },
    ],
    links: [{ rel: "canonical", href: "/newsletter" }],
  }),
  component: NewsletterPage,
});

const inputClass =
  "w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary";

function NewsletterPage() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const { error: err } = await supabase.from("newsletter_subscribers").insert({
      name: name.trim(),
      email: email.trim(),
    });
    setBusy(false);
    if (err) {
      if (err.code === "23505") {
        setError("This email is already subscribed.");
      } else {
        setError(err.message);
      }
    } else {
      setSubmitted(true);
    }
  }

  return (
    <>
      <PageHeader
        eyebrow="Stay updated"
        title="Subscribe to our Newsletter"
        description="Get monthly updates on upcoming events, workshops, achievements and opportunities from the IEEE BBDITM Student Branch."
      />

      <section className="section-shell py-16">
        <div className="mx-auto max-w-lg">
          {submitted ? (
            <div className="rounded-xl card-elevated p-8 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-green-600">
                <CheckCircle className="h-7 w-7" />
              </div>
              <h2 className="mt-4 text-lg font-semibold">You're subscribed!</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Thank you, {name || "member"}! You'll start receiving our newsletter at{" "}
                <strong>{email}</strong>.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="rounded-xl card-elevated p-8 space-y-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Mail className="h-5 w-5" />
                </div>
                <h2 className="text-lg font-semibold">Join our mailing list</h2>
              </div>
              <div>
                <label htmlFor="nl-name" className="text-xs font-medium text-muted-foreground">
                  Full Name
                </label>
                <input
                  id="nl-name"
                  className={inputClass}
                  placeholder="Your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div>
                <label htmlFor="nl-email" className="text-xs font-medium text-muted-foreground">
                  Email address
                </label>
                <input
                  id="nl-email"
                  type="email"
                  className={inputClass}
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <button
                type="submit"
                disabled={busy}
                className="w-full btn-primary rounded-lg px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
              >
                {busy ? "Subscribing…" : "Subscribe"}
              </button>
              {error && <p className="text-sm text-destructive text-center">{error}</p>}
              <p className="text-[11px] text-muted-foreground text-center">
                We'll never spam you. Unsubscribe anytime.
              </p>
            </form>
          )}
        </div>
      </section>
    </>
  );
}
