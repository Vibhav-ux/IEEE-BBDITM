import { createFileRoute, Link } from "@tanstack/react-router";
import { Check } from "lucide-react";

import { PageHeader } from "@/components/site/PageHeader";
import { benefits } from "@/data/site";
import joinHero from "@/assets/join-hero.png";

export const Route = createFileRoute("/join")({
  head: () => ({
    meta: [
      { title: "Join / Volunteer — IEEE BBDITM" },
      {
        name: "description",
        content:
          "How to become an IEEE member at BBDITM, what membership includes and how to apply for volunteering roles.",
      },
      { property: "og:title", content: "Join / Volunteer — IEEE BBDITM" },
      {
        property: "og:description",
        content: "Membership benefits and volunteering roles at the IEEE BBDITM Student Branch.",
      },
      { property: "og:url", content: "/join" },
    ],
    links: [{ rel: "canonical", href: "/join" }],
  }),
  component: JoinPage,
});

const steps = [
  "Create an IEEE account and pick the student membership tier.",
  "Select IEEE Uttar Pradesh Section and BBDITM as your student branch.",
  "Add the chapters you want — Computer Society, PES, WIE, SIGHT or RAS.",
  "Email us your membership number so we can add you to the branch roster.",
];

const roles = [
  "Technical — workshops, hackathons and project builds",
  "Design — posters, branding and event collateral",
  "Content — write-ups, social media and reporting",
  "Outreach — sponsorships, partnerships and community projects",
];

function JoinPage() {
  return (
    <>
      {/* Hero banner with image */}
      <section className="relative overflow-hidden min-h-[40vh] flex items-center">
        <img
          src={joinHero}
          alt="Students joining hands together at BBDITM campus"
          className="pointer-events-none absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/30" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        <div className="section-shell relative z-10 py-20">
          <span className="text-xs font-semibold uppercase tracking-widest text-primary-foreground/70">
            Membership
          </span>
          <h1 className="mt-3 max-w-2xl text-3xl font-bold text-white md:text-5xl drop-shadow-lg">
            Join IEEE BBDITM
          </h1>
          <p className="mt-4 max-w-lg text-sm leading-relaxed text-white/80 md:text-base">
            Membership is open to every BBDITM student, from first year onwards. Volunteering
            applications stay open throughout the year.
          </p>
        </div>
      </section>

      {/* Benefits */}
      <section className="section-shell grid gap-5 py-16 sm:grid-cols-2 lg:grid-cols-4">
        {benefits.map((b) => (
          <div key={b.title} className="group rounded-xl card-elevated p-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
              <Check className="h-5 w-5" />
            </div>
            <h2 className="mt-4 text-base font-semibold">{b.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{b.body}</p>
          </div>
        ))}
      </section>

      {/* How to sign up + Volunteer */}
      <section className="section-shell grid gap-10 pb-20 md:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-7">
          <h2 className="text-xl font-bold">How to sign up</h2>
          <ol className="mt-5 space-y-4">
            {steps.map((s, i) => (
              <li key={s} className="flex gap-3 text-sm text-muted-foreground">
                <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-primary-soft text-xs font-bold text-accent-foreground">
                  {i + 1}
                </span>
                <span className="leading-relaxed">{s}</span>
              </li>
            ))}
          </ol>
          <a
            href="https://www.ieee.org/membership/join/index.html"
            target="_blank"
            rel="noreferrer"
            className="mt-7 inline-flex rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
          >
            Start IEEE registration
          </a>
        </div>

        <div className="rounded-xl border border-border bg-card p-7">
          <h2 className="text-xl font-bold">Volunteer with us</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Prefer to contribute before committing to membership? Apply to a volunteering vertical
            and work on a live event.
          </p>
          <ul className="mt-5 space-y-3">
            {roles.map((r) => (
              <li key={r} className="flex gap-2.5 text-sm text-muted-foreground">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <span>{r}</span>
              </li>
            ))}
          </ul>
          <Link
            to="/contact"
            className="mt-7 inline-flex rounded-lg border border-border px-5 py-3 text-sm font-semibold transition-colors hover:bg-secondary"
          >
            Apply for volunteering
          </Link>
        </div>
      </section>
    </>
  );
}