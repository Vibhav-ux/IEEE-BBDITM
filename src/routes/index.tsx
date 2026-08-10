import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  CalendarDays,
  Sparkles,
  Users,
  Globe,
  Wrench,
  Award,
  UserCheck,
} from "lucide-react";

import campusImage from "@/assets/campus-aerial.png";
import collaborationImage from "@/assets/students-collaboration.png";
import eventImage from "@/assets/tech-event.png";
import workshopImage from "@/assets/workshop-hands-on.png";
import ctaBgImage from "@/assets/cta-bg.png";
import { benefits, societies, events, stats } from "@/data/site";

const benefitIcons = [Globe, Wrench, Award, UserCheck];

const chapterImages: Record<string, string> = {
  cs: "https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=600&h=400&fit=crop",
  pes: "https://images.unsplash.com/photo-1509390144018-eeaf65052242?w=600&h=400&fit=crop",
  wie: "https://images.unsplash.com/photo-1573164713988-8665fc963095?w=600&h=400&fit=crop",
  sight: "https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=600&h=400&fit=crop",
  sps: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=600&h=400&fit=crop",
  pels: "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=600&h=400&fit=crop",
  emb: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=600&h=400&fit=crop",
};

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "IEEE BBDITM Student Branch — Technology, Community, Impact" },
      {
        name: "description",
        content:
          "Official home of the IEEE BBDITM Student Branch, Lucknow: chapters, flagship events, workshops and student membership.",
      },
      { property: "og:title", content: "IEEE BBDITM Student Branch" },
      {
        property: "og:description",
        content: "Chapters, flagship events, workshops and membership at IEEE BBDITM, Lucknow.",
      },
      { property: "og:url", content: "/" },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
  component: Index,
});

function Index() {
  const upcoming = events.filter((e) => e.status !== "Past").slice(0, 3);

  return (
    <>
      {/* ─── Hero Section ─── */}
      <section className="relative overflow-hidden min-h-[85vh] flex items-center">
        {/* Auto-playing background video */}
        <video
          autoPlay
          muted
          loop
          playsInline
          className="pointer-events-none absolute inset-0 h-full w-full object-cover"
        >
          <source src="/campus-video-cropped.mp4" type="video/mp4" />
          {/* Fallback image */}
          <img
            src={campusImage}
            alt="BBDITM Campus aerial view"
            className="absolute inset-0 h-full w-full object-cover"
          />
        </video>
        {/* Warm, inviting overlay — dark enough for readability, light enough to feel open */}
        <div className="absolute inset-0 bg-linear-to-r from-black/70 via-black/50 to-black/25" />
        <div className="absolute inset-0 bg-linear-to-t from-black/50 via-transparent to-transparent" />
        {/* Soft warm blue accent at bottom */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 80% 40% at 50% 100%, oklch(0.52 0.17 255 / 0.08) 0%, transparent 70%)",
          }}
        />

        <div className="section-shell relative z-10 py-24 md:py-32">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/15 px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm">
              <Sparkles className="h-3.5 w-3.5" />
              IEEE UP Section · Region 10
            </span>
            {/* BBDITM logo live badge */}
            <span className="relative inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 backdrop-blur-sm">
              <span className="relative flex h-7 w-7 shrink-0">
                {/* Breathing glow ring */}
                <span
                  className="absolute inset-0 rounded-full"
                  style={{
                    background: "radial-gradient(circle, rgba(255,255,255,0.4) 0%, transparent 70%)",
                    animation: "orb3 3s ease-in-out infinite",
                  }}
                />
                <img
                  src="/bbditm-logo.jpg"
                  alt="BBDITM"
                  className="relative h-7 w-7 rounded-full object-cover ring-1 ring-white/50"
                />
              </span>
              <span className="text-xs font-semibold text-white">BBDITM, Lucknow</span>
            </span>
          </div>
          <h1 className="mt-6 max-w-3xl text-4xl font-bold leading-[1.05] text-white md:text-6xl drop-shadow-lg">
            IEEE BBDITM
          </h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-white/85 md:text-lg">
            A student-run engineering community at Babu Banarasi Das Institute of Technology and
            Management, Lucknow — building projects, running events and advancing technology for the
            benefit of humanity.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/join"
              className="btn-primary inline-flex items-center gap-2 rounded-lg px-5 py-3 text-sm font-semibold text-white"
            >
              Become a member <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/events"
              className="inline-flex items-center gap-2 rounded-lg border border-white/25 bg-white/15 px-5 py-3 text-sm font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/25 hover:-translate-y-0.5"
            >
              Explore events
            </Link>
          </div>

          <dl className="mt-16 grid max-w-3xl grid-cols-2 gap-px overflow-hidden rounded-xl border border-white/15 bg-white/10 backdrop-blur-md md:grid-cols-4">
            {stats.map((s) => (
              <div
                key={s.label}
                className="bg-white/5 px-5 py-6 text-center transition-colors hover:bg-white/15"
              >
                <dt className="font-display text-2xl font-bold text-white">{s.value}</dt>
                <dd className="mt-1 text-xs text-white/70">{s.label}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>


      {/* ─── Campus Life Visual Strip ─── */}
      <section className="border-b border-border section-breathe py-4">
        <div className="section-shell flex items-center gap-6 overflow-x-auto scrollbar-none">
          <div className="flex shrink-0 gap-4">
            {[
              collaborationImage,
              eventImage,
              workshopImage,
              collaborationImage,
              eventImage,
              workshopImage,
            ].map((src, i) => (
              <img
                key={i}
                src={src}
                alt=""
                className="h-20 w-32 rounded-lg object-cover opacity-80 transition-all duration-300 hover:opacity-100 hover:shadow-lg hover:scale-[1.03]"
              />
            ))}
          </div>
        </div>
      </section>

      {/* ─── Chapters Section ─── */}
      <section className="section-shell py-20">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold md:text-3xl text-shimmer">
              Societies & affinity groups
            </h2>
            <p className="mt-2 max-w-lg text-sm text-muted-foreground">
              Seven specialised societies, each with its own events, mentors and projects.
            </p>
          </div>
          <Link
            to="/chapters"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary transition-all hover:gap-2.5"
          >
            View all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {societies.slice(0, 3).map((c) => (
            <a
              href={c.url}
              target="_blank"
              rel="noopener noreferrer"
              key={c.slug}
              className="group overflow-hidden rounded-xl card-elevated block"
            >
              <div className="relative h-40 overflow-hidden">
                <img
                  src={chapterImages[c.slug]}
                  alt={c.name}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/50 to-transparent" />
                <span className="absolute bottom-3 left-4 text-xs font-semibold uppercase tracking-wide text-white/90">
                  {c.tagline}
                </span>
              </div>
              <div className="p-6">
                <h3 className="text-lg font-semibold">{c.name}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {c.description}
                </p>
              </div>
            </a>
          ))}
        </div>
      </section>



      {/* ─── What We Do (split with image) ─── */}
      <section className="section-breathe">
        <div className="section-shell grid items-center gap-10 py-20 md:grid-cols-2">
          <div className="relative overflow-hidden rounded-2xl group">
            <img
              src={collaborationImage}
              alt="Students working together on projects"
              className="h-80 w-full object-cover rounded-2xl shadow-xl transition-transform duration-700 group-hover:scale-[1.03]"
            />
            <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-black/10 transition-all group-hover:ring-primary/20" />
          </div>
          <div>
            <span className="text-xs font-semibold uppercase tracking-widest text-primary">
              What we do
            </span>
            <h2 className="mt-3 text-2xl font-bold md:text-3xl">Engineering beyond the syllabus</h2>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              We run technical workshops, hackathons, industry talks and humanitarian technology
              projects across the academic year. Members get access to the global IEEE network,
              conference opportunities, the IEEE Xplore digital library and a route into leadership
              roles inside the branch.
            </p>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              Our flagship event, Unstoppable Journey, brings together speakers, competitions and
              awards. Alongside it, each chapter runs its own calendar — from PES Day to robotics
              bootcamps and WIE mentorship circles.
            </p>
            <Link
              to="/about"
              className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-primary transition-all hover:gap-3"
            >
              Learn more about us <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ─── Events Section ─── */}
      <section className="py-20">
        <div className="section-shell">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold md:text-3xl">What's next</h2>
              <p className="mt-2 max-w-lg text-sm text-muted-foreground">
                Upcoming events, drives and opportunities to get involved.
              </p>
            </div>
            <Link
              to="/events"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary transition-all hover:gap-2.5"
            >
              All events <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {upcoming.map((e, i) => (
              <article key={e.title} className="group overflow-hidden rounded-xl card-elevated">
                <div className="relative h-36 overflow-hidden">
                  <img
                    src={i === 0 ? eventImage : i === 1 ? workshopImage : collaborationImage}
                    alt={e.title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-black/50 to-transparent" />
                  <span className="absolute top-3 right-3 rounded-full bg-primary px-2.5 py-0.5 text-[10px] font-bold uppercase text-primary-foreground shadow-sm">
                    {e.status}
                  </span>
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                    <CalendarDays className="h-4 w-4 text-primary" />
                    {e.date}
                  </div>
                  <h3 className="mt-3 text-lg font-semibold">{e.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {e.description}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Why Students Join ─── */}
      <section className="section-shell py-20 section-breathe rounded-3xl mx-4 lg:mx-auto">
        <h2 className="text-2xl font-bold md:text-3xl text-shimmer">Why students join</h2>
        <p className="mt-2 max-w-lg text-sm text-muted-foreground">
          Real skills, real connections, real impact — here's what IEEE membership gives you.
        </p>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {benefits.map((b, i) => {
            const Icon = benefitIcons[i] ?? Users;
            return (
              <div key={b.title} className="group rounded-xl card-elevated p-6">
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary transition-all group-hover:bg-primary group-hover:text-primary-foreground group-hover:shadow-md"
                  style={{ animation: `soft-float ${4 + i * 0.5}s ease-in-out infinite` }}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-base font-semibold">{b.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{b.body}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ─── CTA Section ─── */}
      <section className="section-shell pb-20">
        <div className="relative overflow-hidden rounded-2xl">
          <img
            src={ctaBgImage}
            alt=""
            aria-hidden="true"
            className="absolute inset-0 h-full w-full object-cover"
          />
          {/* Refined warm blue overlay */}
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.45 0.17 255 / 0.88), oklch(0.52 0.17 255 / 0.85), oklch(0.48 0.15 258 / 0.90))",
              backgroundSize: "200% 200%",
              animation: "gradient-drift 8s ease infinite",
            }}
          />
          <div className="relative z-10 px-8 py-16 text-center md:py-20">
            <h2 className="text-2xl font-bold text-white md:text-3xl drop-shadow-md">
              Ready to build with us?
            </h2>
            <p className="mx-auto mt-3 max-w-lg text-sm text-white/85">
              Membership is open to every BBDITM student. Volunteering applications stay open all
              year.
            </p>
            <div className="mt-7 flex flex-wrap justify-center gap-3">
              <Link
                to="/join"
                className="inline-flex items-center gap-2 rounded-lg bg-white px-6 py-3 text-sm font-semibold text-primary shadow-lg transition-all hover:shadow-xl hover:-translate-y-0.5"
              >
                Join IEEE BBDITM <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 rounded-lg border border-white/30 bg-white/15 px-6 py-3 text-sm font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/25 hover:-translate-y-0.5"
              >
                Get in touch
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
