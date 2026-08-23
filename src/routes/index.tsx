import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState, useRef } from "react";
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

import campusImageFallback from "@/assets/campus-aerial.png";
import collaborationImageFallback from "@/assets/students-collaboration.png";
import eventImageFallback from "@/assets/tech-event.png";
import workshopImageFallback from "@/assets/workshop-hands-on.png";
import ctaBgImageFallback from "@/assets/cta-bg.png";
import { benefits, societies, stats } from "@/data/site";
import { useSiteImage } from "@/lib/siteImages";
import { supabase } from "@/integrations/supabase/client";


function useGallerySlides() {
  const [slides, setSlides] = useState<{ url: string; caption: string }[]>([]);

  useEffect(() => {
    supabase
      .from("photos")
      .select("image_url, title, caption, storage_path")
      .eq("show_on_home", true)
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        if (!data || data.length === 0) { setSlides([]); return; }
        const items = data.map((p) => ({
          url: p.storage_path
            ? supabase.storage.from("gallery").getPublicUrl(p.storage_path).data.publicUrl
            : p.image_url,
          caption: p.caption ?? p.title ?? "IEEE BBDITM",
        }));
        setSlides(items);
      });
  }, []);

  return slides;
}

function HeroSlideshow() {
  const slides = useGallerySlides();
  const [current, setCurrent] = useState(0);
  const [animating, setAnimating] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const goTo = (idx: number) => {
    if (animating) return;
    setAnimating(true);
    setTimeout(() => {
      setCurrent(idx);
      setAnimating(false);
    }, 300);
  };

  const next = () => goTo((current + 1) % slides.length);
  const prev = () => goTo((current - 1 + slides.length) % slides.length);

  useEffect(() => {
    if (slides.length === 0) return;
    timerRef.current = setInterval(next, 4500);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [current, slides.length]);

  if (slides.length === 0) return null;

  return (
    <section className="relative border-b border-border bg-background py-6 px-4 md:px-8">
      {/* Slides */}
      <div className="relative h-72 md:h-96 rounded-2xl overflow-hidden shadow-xl mx-auto max-w-6xl">
        {slides.map((slide, i) => (
          <div
            key={i}
            className="absolute inset-0 transition-opacity duration-700"
            style={{ opacity: i === current && !animating ? 1 : 0, zIndex: i === current ? 1 : 0 }}
          >
            <img
              src={slide.url}
              alt={slide.caption}
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-linear-to-t from-black/60 via-black/10 to-transparent" />
            {slide.caption && (
              <p className="absolute bottom-10 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-black/50 px-4 py-1 text-xs font-medium text-white/90 backdrop-blur-sm">
                {slide.caption}
              </p>
            )}
          </div>
        ))}

        {/* Prev / Next arrows */}
        <button
          onClick={prev}
          className="absolute left-3 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/40 p-2 text-white/80 backdrop-blur-sm transition hover:bg-black/70 hover:text-white"
          aria-label="Previous"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <button
          onClick={next}
          className="absolute right-3 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/40 p-2 text-white/80 backdrop-blur-sm transition hover:bg-black/70 hover:text-white"
          aria-label="Next"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        {/* Dot indicators */}
        <div className="absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 gap-1.5">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === current ? "w-5 bg-white" : "w-1.5 bg-white/40 hover:bg-white/70"
              }`}
              aria-label={`Slide ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </section>

  );
}

const benefitIcons = [Globe, Wrench, Award, UserCheck];



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

function useHomePoster() {
  const [poster, setPoster] = useState<{ image_url: string; session: string; label: string | null } | null>(null);

  useEffect(() => {
    supabase
      .from("team_posters")
      .select("image_url, storage_path, session, label")
      .eq("show_on_home", true)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle()
      .then(({ data }) => {
        if (!data) return;
        const url = data.storage_path
          ? supabase.storage.from("gallery").getPublicUrl(data.storage_path).data.publicUrl
          : data.image_url;
        setPoster({ image_url: url, session: data.session, label: data.label });
      });
  }, []);

  return poster;
}

function Index() {
  const [upcoming, setUpcoming] = useState<{title:string;date:string;type:string;status:string;description:string;cover_image_url?:string;video_url?:string}[]>([]);
  const [eventsLoading, setEventsLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("events")
      .select("title, description, event_date, date_label, type, status, cover_image_url, video_url")
      .neq("status", "Past")
      .order("event_date", { ascending: true })
      .limit(3)
      .then(({ data }) => {
        if (data && data.length > 0) {
          setUpcoming(data.map((e) => ({
            title: e.title,
            date: e.date_label ?? e.event_date ?? "Date TBA",
            type: e.type,
            status: e.status,
            description: e.description ?? "",
            ...(e.cover_image_url !== null && { cover_image_url: e.cover_image_url }),
            ...(e.video_url !== null && { video_url: e.video_url }),
          })));
        }
        setEventsLoading(false);
      });
  }, []);

  const campusImage       = campusImageFallback; // hero is a video — never override
  const collaborationImage = useSiteImage("home-collaboration", collaborationImageFallback);
  const eventImage         = useSiteImage("home-event",         eventImageFallback);
  const workshopImage      = useSiteImage("home-workshop",      workshopImageFallback);
  const ctaBgImage         = useSiteImage("home-cta-bg",        ctaBgImageFallback);
  const homePoster          = useHomePoster();

  const societyImages: Record<string, string> = {
    cs:    useSiteImage("society-cs",   "https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=600&h=400&fit=crop"),
    pes:   useSiteImage("society-pes",  "https://images.unsplash.com/photo-1509390144018-eeaf65052242?w=600&h=400&fit=crop"),
    wie:   useSiteImage("society-wie",  "https://images.unsplash.com/photo-1573164713988-8665fc963095?w=600&h=400&fit=crop"),
    sight: useSiteImage("society-sight","https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=600&h=400&fit=crop"),
    sps:   useSiteImage("society-sps",  "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=600&h=400&fit=crop"),
    pels:  useSiteImage("society-pels", "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=600&h=400&fit=crop"),
    emb:   useSiteImage("society-emb",  "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=600&h=400&fit=crop"),
  };

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
                  src="/bbd-logo.png"
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


      {/* ─── Campus Life Slideshow ─── */}
      <HeroSlideshow />

      {/* ─── Chapters Section ─── */}
      <section className="section-shell py-20">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-10">
          <div>
            <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.20em] text-primary" style={{fontFamily:"var(--font-mono,monospace)"}}>
              // Chapters
            </p>
            <h2 className="text-2xl font-bold md:text-3xl text-shimmer">
              Societies &amp; affinity groups
            </h2>
            <p className="mt-2 max-w-lg text-sm text-muted-foreground">
              Seven specialised societies, each with its own events, mentors and projects.
            </p>
          </div>
          <Link
            to="/chapters"
            className="inline-flex items-center gap-1.5 rounded-full border border-primary/25 bg-primary/5 px-4 py-1.5 text-sm font-semibold text-primary transition-all hover:bg-primary/10 hover:gap-2.5"
          >
            View all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {societies.slice(0, 3).map((c) => (
            <a
              href={c.url}
              target="_blank"
              rel="noopener noreferrer"
              key={c.slug}
              className="group relative overflow-hidden rounded-2xl block transition-all duration-300 hover:-translate-y-1.5"
              style={{
                background: "oklch(1 0 0)",
                border: "1px solid oklch(0.88 0.014 252)",
                boxShadow: "0 2px 8px oklch(0 0 0 / 0.04)",
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.borderColor = "oklch(0.55 0.28 255 / 0.40)";
                (e.currentTarget as HTMLElement).style.boxShadow = "0 0 0 1px oklch(0.55 0.28 255 / 0.12), 0 8px 32px oklch(0.42 0.24 258 / 0.12)";
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.borderColor = "oklch(0.88 0.014 252)";
                (e.currentTarget as HTMLElement).style.boxShadow = "0 2px 8px oklch(0 0 0 / 0.04)";
              }}
            >
              {/* Neon corner top-left */}
              <span className="pointer-events-none absolute left-2.5 top-2.5 z-20 opacity-0 transition-opacity duration-300 group-hover:opacity-100" style={{width:14,height:14,borderTop:"2px solid oklch(0.55 0.28 255)",borderLeft:"2px solid oklch(0.55 0.28 255)"}} />
              {/* Neon corner bottom-right */}
              <span className="pointer-events-none absolute right-2.5 bottom-2.5 z-20 opacity-0 transition-opacity duration-300 group-hover:opacity-100" style={{width:14,height:14,borderBottom:"2px solid oklch(0.55 0.28 255)",borderRight:"2px solid oklch(0.55 0.28 255)"}} />
              <div className="relative h-40 overflow-hidden">
                <img
                  src={societyImages[c.slug]}
                  alt={c.name}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                {/* Glassmorphism overlay on hover */}
                <div className="absolute inset-0 bg-linear-to-t from-black/55 via-black/10 to-transparent" />
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{background:"linear-gradient(to top, oklch(0.42 0.24 258 / 0.50), transparent)"}} />
                <span className="absolute bottom-3 left-4 text-[10px] font-bold uppercase tracking-[0.15em] text-white/80" style={{fontFamily:"var(--font-mono,monospace)"}}>
                  {c.tagline}
                </span>
              </div>
              <div className="p-5">
                <h3 className="text-base font-bold">{c.name}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground line-clamp-3">
                  {c.description}
                </p>
              </div>
            </a>
          ))}
        </div>
      </section>



      {/* ─── What We Do ─── */}
      <section style={{background:"oklch(0.96 0.012 252)"}}>
        <div className="section-shell grid items-center gap-10 py-20 md:grid-cols-2">
          {/* Image with glassmorphism overlay */}
          <div className="relative overflow-hidden rounded-2xl group scan-overlay">
            <img
              src={collaborationImage}
              alt="Students working together on projects"
              className="h-80 w-full object-cover rounded-2xl shadow-xl transition-transform duration-700 group-hover:scale-[1.03]"
            />
            <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-primary/20" />
            {/* Glass info strip at bottom */}
            <div
              className="absolute bottom-0 inset-x-0 p-4"
              style={{background:"oklch(1 0 0 / 0.15)",backdropFilter:"blur(12px)",borderTop:"1px solid oklch(1 0 0 / 0.25)"}}
            >
              <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-white" style={{fontFamily:"var(--font-mono,monospace)"}}>// Collaboration &amp; Projects</p>
            </div>
          </div>
          <div>
            <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.20em] text-primary" style={{fontFamily:"var(--font-mono,monospace)"}}>
              // What we do
            </p>
            <h2 className="text-2xl font-bold md:text-3xl section-heading">Engineering beyond the syllabus</h2>
            <p className="mt-5 text-sm leading-relaxed text-muted-foreground">
              We run technical workshops, hackathons, industry talks and humanitarian technology
              projects across the academic year. Members get access to the global IEEE network,
              conference opportunities, the IEEE Xplore digital library and a route into leadership
              roles inside the branch.
            </p>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Our flagship event, Unstoppable Journey, brings together speakers, competitions and
              awards. Alongside it, each chapter runs its own calendar — from PES Day to robotics
              bootcamps and WIE mentorship circles.
            </p>
            <Link
              to="/about"
              className="mt-6 inline-flex items-center gap-2 rounded-lg border border-primary/25 bg-primary/5 px-4 py-2 text-sm font-semibold text-primary transition-all hover:bg-primary/10 hover:gap-3"
            >
              Learn more about us <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ─── Events Section ─── */}
      <section className="py-20">
        <div className="section-shell">
          <div className="flex flex-wrap items-end justify-between gap-4 mb-10">
            <div>
              <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.20em] text-primary" style={{fontFamily:"var(--font-mono,monospace)"}}>
                // Upcoming
              </p>
              <h2 className="text-2xl font-bold md:text-3xl text-shimmer">What's next</h2>
              <p className="mt-2 max-w-lg text-sm text-muted-foreground">
                Upcoming events, drives and opportunities to get involved.
              </p>
            </div>
            <Link
              to="/events"
              className="inline-flex items-center gap-1.5 rounded-full border border-primary/25 bg-primary/5 px-4 py-1.5 text-sm font-semibold text-primary transition-all hover:bg-primary/10 hover:gap-2.5"
            >
              All events <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          {eventsLoading ? (
            <div className="grid gap-5 md:grid-cols-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="rounded-2xl border border-border bg-card overflow-hidden animate-pulse">
                  <div className="h-36 bg-secondary/60" />
                  <div className="p-6 space-y-3">
                    <div className="h-3 w-1/3 rounded bg-secondary/80" />
                    <div className="h-5 w-2/3 rounded bg-secondary/80" />
                    <div className="h-3 w-full rounded bg-secondary/60" />
                  </div>
                </div>
              ))}
            </div>
          ) : upcoming.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No upcoming events yet.{" "}
              <Link to="/events" className="text-primary underline underline-offset-2">View past events</Link>
            </p>
          ) : (
            <div className="grid gap-5 md:grid-cols-3">
              {upcoming.map((e) => (
                <article
                  key={e.title}
                  className="group relative overflow-hidden rounded-2xl transition-all duration-300 hover:-translate-y-1.5"
                  style={{background:"oklch(1 0 0)",border:"1px solid oklch(0.88 0.014 252)",boxShadow:"0 2px 8px oklch(0 0 0 / 0.04)"}}
                >
                  {/* Neon corner brackets */}
                  <span className="pointer-events-none absolute left-2.5 top-2.5 z-20 opacity-0 transition-opacity group-hover:opacity-100" style={{width:12,height:12,borderTop:"1.5px solid oklch(0.55 0.28 255)",borderLeft:"1.5px solid oklch(0.55 0.28 255)",position:"absolute"}} />
                  <span className="pointer-events-none absolute right-2.5 bottom-2.5 z-20 opacity-0 transition-opacity group-hover:opacity-100" style={{width:12,height:12,borderBottom:"1.5px solid oklch(0.55 0.28 255)",borderRight:"1.5px solid oklch(0.55 0.28 255)",position:"absolute"}} />
                  <div className="relative h-36 overflow-hidden bg-secondary/30">
                    {e.cover_image_url ? (
                      <img src={e.cover_image_url} alt={e.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center" style={{background:"linear-gradient(135deg,oklch(0.42 0.24 258 / 0.08),oklch(0.55 0.28 255 / 0.04))"}}>
                        <CalendarDays className="h-8 w-8 text-primary/30" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-linear-to-t from-black/50 to-transparent" />
                    {/* Glowing status badge */}
                    <span
                      className="absolute top-3 right-3 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase text-white"
                      style={{background:"oklch(0.42 0.24 258)",boxShadow:"0 0 0 1px oklch(0.55 0.28 255 / 0.4), 0 2px 8px oklch(0.42 0.24 258 / 0.4)"}}
                    >
                      {e.status}
                    </span>
                  </div>
                  <div className="p-5">
                    <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-primary" style={{fontFamily:"var(--font-mono,monospace)"}}>
                      <CalendarDays className="h-3.5 w-3.5" />
                      {e.date}
                    </div>
                    <h3 className="mt-3 text-base font-bold">{e.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground line-clamp-3">{e.description}</p>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>


      {/* ─── Why Students Join ─── */}
      <section className="section-shell py-20 rounded-3xl mx-4 lg:mx-auto" style={{background:"oklch(0.96 0.012 252)"}}>
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
      {/* ─── Meet the Team ─── */}
      {homePoster && (
        <section className="section-shell pb-20">
          <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
            <div>
              <h2 className="text-2xl font-bold md:text-3xl text-shimmer">Meet our team</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                {homePoster.session}{homePoster.label ? ` — ${homePoster.label}` : ""} Executive Committee
              </p>
            </div>
            <Link
              to="/office-bearers"
              className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
            >
              Full committee <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="overflow-hidden rounded-2xl border border-border shadow-xl">
            <img
              src={homePoster.image_url}
              alt={`IEEE BBDITM Executive Committee ${homePoster.session}`}
              className="w-full object-contain max-h-[70vh]"
            />
          </div>
        </section>
      )}

      {/* ─── CTA ─── */}
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
