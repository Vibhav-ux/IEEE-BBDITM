import { createFileRoute } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { Mail, MapPin, Send } from "lucide-react";

import { PageHeader } from "@/components/site/PageHeader";

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

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSent(true);
  }

  return (
    <>
      <PageHeader
        eyebrow="Contact"
        title="Talk to the branch"
        description="Collaborations, sponsorships, speaker invites or membership questions — send us a note and a committee member will reply."
      />

      <section className="section-shell grid gap-10 py-16 md:grid-cols-[1fr_0.8fr]">
        <form onSubmit={handleSubmit} className="rounded-xl border border-border bg-card p-7">
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
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
          >
            <Send className="h-4 w-4" /> Send message
          </button>
          {sent && (
            <p className="mt-4 text-sm text-primary">
              Thanks — your message has been noted. We'll reply by email soon.
            </p>
          )}
        </form>

        <div className="space-y-5">
          <div className="rounded-xl border border-border bg-card p-6">
            <MapPin className="h-5 w-5 text-primary" />
            <h2 className="mt-4 text-base font-semibold">Campus</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              BBDITM, Sector I, Dr. Akhilesh Das Nagar, Faizabad Road, Lucknow 226028, Uttar
              Pradesh
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
        </div>
      </section>
    </>
  );
}