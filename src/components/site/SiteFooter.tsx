import { Link } from "@tanstack/react-router";
import { Instagram, Linkedin, Mail, Youtube } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-border bg-secondary/40">
      <div className="section-shell grid gap-10 py-14 md:grid-cols-3">
        <div>
          <p className="font-display text-lg font-semibold">IEEE BBDITM Student Branch</p>
          <p className="mt-3 max-w-sm text-sm text-muted-foreground">
            Babu Banarasi Das Institute of Technology and Management, Lucknow — advancing
            technology for the benefit of humanity.
          </p>
          <div className="mt-5 flex gap-3">
            {[
              { Icon: Linkedin, href: "https://www.linkedin.com/company/ieee-bbditm-student-branch/", label: "LinkedIn" },
              { Icon: Instagram, href: "https://www.instagram.com/ieeebbditm/", label: "Instagram" },
              {
                Icon: Youtube,
                href: "https://www.youtube.com/channel/UCzWiM2vDa7y14JhyFxCLGNQ",
                label: "YouTube",
              },
              { Icon: Mail, href: "mailto:ieee.bbditm@gmail.com", label: "Email" },
            ].map(({ Icon, href, label }) => (
              <a
                key={label}
                href={href}
                aria-label={label}
                target="_blank"
                rel="noreferrer"
                className="grid h-9 w-9 place-items-center rounded-md border border-border bg-card text-muted-foreground transition-all hover:text-primary hover:border-primary/30 hover:-translate-y-0.5"
              >
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>

        <div>
          <p className="text-sm font-semibold">Explore</p>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            {[
              { to: "/about", label: "About us" },
              { to: "/chapters", label: "Chapters & affinity groups" },
              { to: "/events", label: "Events" },
              { to: "/team", label: "Executive committee" },
              { to: "/newsletter", label: "Newsletter" },
              { to: "/join", label: "Become a member" },
            ].map((l) => (
              <li key={l.to}>
                <Link to={l.to} className="transition-colors hover:text-primary">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-sm font-semibold">Reach us</p>
          <address className="mt-4 space-y-2 text-sm not-italic text-muted-foreground">
            <p>BBDITM, Sector I, Dr. Akhilesh Das Nagar, Faizabad Road, Lucknow 226028</p>
            <p>ieee.bbditm@gmail.com</p>
          </address>
        </div>
      </div>
      <div className="border-t border-border">
        <div className="section-shell flex flex-col gap-2 py-5 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} IEEE BBDITM Student Branch. All rights reserved.</p>
          <p>Student Branch · IEEE UP Section · Region 10</p>
        </div>
      </div>
    </footer>
  );
}