import { createFileRoute } from "@tanstack/react-router";
import { Compass, Flag, HeartHandshake } from "lucide-react";

import { PageHeader } from "@/components/site/PageHeader";
import { stats } from "@/data/site";
import campusImage from "@/assets/campus-aerial.png";
import collaborationImage from "@/assets/students-collaboration.png";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — IEEE BBDITM Student Branch" },
      {
        name: "description",
        content:
          "Who we are: the mission, values and history of the IEEE BBDITM Student Branch in Lucknow.",
      },
      { property: "og:title", content: "About — IEEE BBDITM Student Branch" },
      {
        property: "og:description",
        content: "The mission, values and history of the IEEE BBDITM Student Branch.",
      },
      { property: "og:url", content: "/about" },
    ],
    links: [{ rel: "canonical", href: "/about" }],
  }),
  component: AboutPage,
});

const pillars = [
  {
    Icon: Flag,
    title: "Mission",
    body: "Give every student at BBDITM a place to learn beyond the syllabus — through projects, competitions and peer mentoring.",
  },
  {
    Icon: Compass,
    title: "Vision",
    body: "A student branch known across IEEE UP Section for consistent technical output and student leadership.",
  },
  {
    Icon: HeartHandshake,
    title: "Values",
    body: "Open participation, mentorship over hierarchy, and technology applied to real community problems.",
  },
];

function AboutPage() {
  return (
    <>
      <PageHeader
        eyebrow="About"
        title="A student community for engineers who build"
        description="The IEEE BBDITM Student Branch operates under the IEEE Uttar Pradesh Section, Region 10, at Babu Banarasi Das Institute of Technology and Management, Lucknow."
      />

      {/* Campus image strip */}
      <section className="section-shell -mt-8 mb-10">
        <div className="overflow-hidden rounded-2xl shadow-xl">
          <img
            src={campusImage}
            alt="BBDITM Campus"
            className="h-64 w-full object-cover md:h-80"
          />
        </div>
      </section>

      <section className="section-shell grid gap-5 pb-4 md:grid-cols-3">
        {pillars.map(({ Icon, title, body }) => (
          <div key={title} className="group rounded-xl card-elevated p-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary transition-all group-hover:bg-primary group-hover:text-primary-foreground group-hover:shadow-md animate-float">
              <Icon className="h-5 w-5" />
            </div>
            <h2 className="mt-4 text-lg font-semibold">{title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</p>
          </div>
        ))}
      </section>

      <section className="section-shell py-16">
        <div className="grid gap-10 md:grid-cols-2">
          <div>
            <h2 className="text-2xl font-bold">What we do</h2>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              We run technical workshops, hackathons, industry talks and humanitarian technology
              projects across the academic year. Members get access to the global IEEE network,
              conference opportunities, the IEEE Xplore digital library and a route into
              leadership roles inside the branch.
            </p>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              Our flagship event, Unstoppable Journey, brings together speakers, competitions and
              awards. Alongside it, each chapter runs its own calendar — from PES Day to robotics
              bootcamps and WIE mentorship circles.
            </p>
            <div className="mt-6 overflow-hidden rounded-xl">
              <img
                src={collaborationImage}
                alt="Students collaborating on projects"
                className="h-48 w-full object-cover rounded-xl"
              />
            </div>
          </div>
          <dl className="grid grid-cols-2 gap-px self-start overflow-hidden rounded-xl border border-border bg-border">
            {stats.map((s) => (
              <div key={s.label} className="bg-card px-6 py-8">
                <dt className="font-display text-3xl font-bold text-primary">{s.value}</dt>
                <dd className="mt-1 text-xs text-muted-foreground">{s.label}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>
    </>
  );
}