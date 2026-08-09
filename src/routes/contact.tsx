import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState, type FormEvent } from "react";
import { Mail, MapPin, Send } from "lucide-react";

import { PageHeader } from "@/components/site/PageHeader";
import { supabase } from "@/integrations/supabase/client";
import contactCampus from "@/assets/contact-campus.png";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — IEEE BBDITM Student Branch" },
      {
        name: "description",
        content:
          "Get in touch with the IEEE BBDITM Student Branch for collaborations, sponsorships or membership questions.",
      },
      { property: "og:title", content: "Contact — IEEE BBDITM Student Branch" },
      {
        property: "og:description",
        content: "Reach the IEEE BBDITM Student Branch team in Lucknow.",
      },
      { property: "og:url", content: "/contact" },
    ],
    links: [{ rel: "canonical", href: "/contact" }],
  }),
  component: ContactPage,
});

function ContactPage() {
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const data = new FormData(e.currentTarget);
    const { error: err } = await supabase.from("contact_messages").insert({
      name: data.get("name") as string,
      email: data.get("email") as string,
      subject: data.get("subject") as string,
      message: data.get("message") as string,
    });
    setBusy(false);
    if (err) {
      setError(err.message);
    } else {
      setSent(true);
      formRef.current?.reset();
    }
  }

  return (
    <>
      {/* Hero banner with campus image */}
      <section className="relative overflow-hidden min-h-[40vh] flex items-center">
        <img
          src={contactCampus}
          alt="BBDITM campus at golden hour"
          className="pointer-events-none absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-linear-to-r from-black/70 via-black/50 to-black/30" />
        <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent" />
        <div className="section-shell relative z-10 py-20">
          <span className="text-xs font-semibold uppercase tracking-widest text-primary-foreground/70">
            Contact
          </span>
          <h1 className="mt-3 max-w-2xl text-3xl font-bold text-white md:text-5xl drop-shadow-lg">
            Talk to the branch
          </h1>
          <p className="mt-4 max-w-lg text-sm leading-relaxed text-white/80 md:text-base">
            Collaborations, sponsorships, speaker invites or membership questions — send us a note
            and a committee member will reply.
          </p>
        </div>
      </section>

      <section className="section-shell grid gap-10 py-16 md:grid-cols-[1fr_0.8fr]">
        <form
          ref={formRef}
          onSubmit={handleSubmit}
          className="rounded-xl border border-border bg-card p-7"
        >
          <div className="grid gap-5 sm:grid-cols-2">
            <label className="text-sm font-medium">
              Name
              <input
                required
                name="name"
                className="mt-2 w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none focus:border-primary"
              />
            </label>
            <label className="text-sm font-medium">
              Email
              <input
                required
                type="email"
                name="email"
                className="mt-2 w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none focus:border-primary"
              />
            </label>
          </div>
          <label className="mt-5 block text-sm font-medium">
            Subject
            <input
              required
              name="subject"
              className="mt-2 w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none focus:border-primary"
            />
          </label>
          <label className="mt-5 block text-sm font-medium">
            Message
            <textarea
              required
              name="message"
              rows={5}
              className="mt-2 w-full resize-y rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none focus:border-primary"
            />
          </label>
          <button
            type="submit"
            disabled={busy}
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            <Send className="h-4 w-4" /> {busy ? "Sending…" : "Send message"}
          </button>
          {error && <p className="mt-4 text-sm text-destructive">{error}</p>}
          {sent && (
            <p className="mt-4 text-sm text-primary">
              ✓ Message received — we'll reply by email soon.
            </p>
          )}
        </form>

        <div className="space-y-5">
          <div className="rounded-xl border border-border bg-card p-6">
            <MapPin className="h-5 w-5 text-primary" />
            <h2 className="mt-4 text-base font-semibold">Campus</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              BBDITM, Sector I, Dr. Akhilesh Das Nagar, Faizabad Road, Lucknow 226028, Uttar Pradesh
            </p>
          </div>
          <div className="rounded-xl border border-border bg-card p-6">
            <Mail className="h-5 w-5 text-primary" />
            <h2 className="mt-4 text-base font-semibold">Email</h2>
            <a
              href="mailto:ieee.bbditm@gmail.com"
              className="mt-2 inline-block text-sm text-primary"
            >
              ieee.bbditm@gmail.com
            </a>
          </div>
          {/* Campus map */}
          <div className="overflow-hidden rounded-xl border border-border">
            <img
              src={contactCampus}
              alt="BBDITM campus aerial view"
              className="h-48 w-full object-cover"
            />
          </div>
        </div>
      </section>
    </>
  );
}
