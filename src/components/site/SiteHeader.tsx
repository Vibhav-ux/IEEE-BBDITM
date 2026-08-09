import { Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Menu, X } from "lucide-react";

import { useAuth } from "@/lib/auth";

const links = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About" },
  { to: "/chapters", label: "Societies" },
  { to: "/office-bearers", label: "Committee" },
  { to: "/events", label: "Events" },
  { to: "/gallery", label: "Album" },
  { to: "/join", label: "Join" },
] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  async function handleSignOut() {
    await signOut();
    setOpen(false);
    navigate({ to: "/auth", replace: true });
  }

  return (
    <header className="sticky top-0 z-50 border-b border-border/50 bg-background/90 backdrop-blur-xl">
      <div className="section-shell flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5 group">
          {/* BBDITM college logo with live pulse ring */}
          <span className="relative flex h-10 w-10 shrink-0 items-center justify-center">
            {/* Animated pulse ring */}
            <span
              className="absolute inset-0 rounded-full"
              style={{
                background: "oklch(0.52 0.17 255 / 0.18)",
                animation: "orb3 3s ease-in-out infinite",
              }}
            />
            <img
              src="/bbditm-logo.jpg"
              alt="BBDITM Logo"
              className="relative h-9 w-9 rounded-full object-cover ring-2 ring-primary/30 transition-all group-hover:ring-primary/60 group-hover:scale-105"
            />
          </span>
          <span className="font-display text-base font-semibold tracking-tight">
            IEEE BBDITM
            <span className="block text-[11px] font-medium text-muted-foreground">
              Student Branch
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              activeOptions={{ exact: l.to === "/" }}
              className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-all hover:bg-primary/8 hover:text-foreground"
              activeProps={{ className: "bg-primary/8 text-primary font-semibold" }}
            >
              {l.label}
            </Link>
          ))}
          <Link
            to="/contact"
            className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-all hover:bg-primary/8 hover:text-foreground"
          >
            Contact
          </Link>
          {user ? (
            <>
              <Link
                to="/dashboard"
                className="ml-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90"
              >
                Dashboard
              </Link>
              <button
                type="button"
                onClick={handleSignOut}
                className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground"
              >
                Sign out
              </button>
            </>
          ) : (
            <Link
              to="/auth"
              className="ml-2 rounded-md btn-primary px-4 py-2 text-sm font-semibold text-white"
            >
              Member login
            </Link>
          )}
        </nav>

        <button
          type="button"
          aria-label="Toggle menu"
          onClick={() => setOpen((v) => !v)}
          className="rounded-md p-2 text-foreground md:hidden"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <nav className="border-t border-border bg-background md:hidden">
          <div className="section-shell flex flex-col py-3">
            {[...links, { to: "/contact", label: "Contact" } as const].map((l) => (
              <Link
                key={l.to}
                to={l.to}
                onClick={() => setOpen(false)}
                className="rounded-md px-2 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground"
                activeProps={{ className: "text-foreground" }}
              >
                {l.label}
              </Link>
            ))}
            {user ? (
              <>
                <Link
                  to="/dashboard"
                  onClick={() => setOpen(false)}
                  className="rounded-md px-2 py-2.5 text-sm font-semibold text-foreground"
                >
                  Dashboard
                </Link>
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="rounded-md px-2 py-2.5 text-left text-sm font-medium text-muted-foreground"
                >
                  Sign out
                </button>
              </>
            ) : (
              <Link
                to="/auth"
                onClick={() => setOpen(false)}
                className="rounded-md px-2 py-2.5 text-sm font-semibold text-foreground"
              >
                Member login
              </Link>
            )}
          </div>
        </nav>
      )}
    </header>
  );
}
