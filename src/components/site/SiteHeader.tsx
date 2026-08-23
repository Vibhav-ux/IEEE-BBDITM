import { Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Menu, X, Cpu } from "lucide-react";

import { useAuth } from "@/lib/auth";

const links = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About" },
  { to: "/chapters", label: "Societies" },
  { to: "/office-bearers", label: "Committee" },
  { to: "/events", label: "Events" },
  { to: "/awards", label: "Awards" },
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
    <header
      className="sticky top-0 z-50"
      style={{
        background: "oklch(1 0 0 / 0.75)",
        backdropFilter: "blur(20px) saturate(180%)",
        WebkitBackdropFilter: "blur(20px) saturate(180%)",
        borderBottom: "1px solid oklch(0.55 0.28 255 / 0.15)",
        boxShadow:
          "0 1px 0 0 oklch(0.55 0.28 255 / 0.08), 0 4px 24px oklch(0.42 0.24 258 / 0.06)",
      }}
    >
      {/* Neon top-line */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[2px]"
        style={{
          background:
            "linear-gradient(90deg, transparent, oklch(0.55 0.28 255 / 0.7) 30%, oklch(0.55 0.28 255) 50%, oklch(0.55 0.28 255 / 0.7) 70%, transparent)",
          boxShadow: "0 0 8px 1px oklch(0.55 0.28 255 / 0.4)",
        }}
      />

      <div className="section-shell flex h-16 items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <span className="relative flex h-10 w-10 shrink-0 items-center justify-center">
            {/* Neon ring */}
            <span
              className="absolute inset-0 rounded-full"
              style={{
                background: "oklch(0.55 0.28 255 / 0.15)",
                boxShadow: "0 0 0 2px oklch(0.55 0.28 255 / 0.3)",
                animation: "orb3 3s ease-in-out infinite",
              }}
            />
            <img
              src="/bbd-logo.png"
              alt="BBDITM Logo"
              className="relative h-9 w-9 rounded-full object-cover ring-2 ring-primary/40 transition-all group-hover:ring-primary/80 group-hover:scale-105"
            />
          </span>
          <div>
            <span
              className="block font-display text-base font-bold tracking-tight text-foreground"
              style={{ letterSpacing: "-0.02em" }}
            >
              IEEE BBDITM
            </span>
          </div>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-0.5 md:flex">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              activeOptions={{ exact: l.to === "/" }}
              className="relative rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-all hover:text-foreground group"
              activeProps={{
                className:
                  "relative rounded-md px-3 py-2 text-sm font-semibold text-primary group",
              }}
            >
              <span className="relative z-10">{l.label}</span>
              {/* Hover glass pill */}
              <span
                className="absolute inset-0 rounded-md opacity-0 transition-opacity group-hover:opacity-100"
                style={{
                  background: "oklch(0.55 0.28 255 / 0.06)",
                  border: "1px solid oklch(0.55 0.28 255 / 0.12)",
                }}
              />
            </Link>
          ))}
          <Link
            to="/contact"
            className="relative rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-all hover:text-foreground group"
          >
            <span className="relative z-10">Contact</span>
            <span
              className="absolute inset-0 rounded-md opacity-0 transition-opacity group-hover:opacity-100"
              style={{
                background: "oklch(0.55 0.28 255 / 0.06)",
                border: "1px solid oklch(0.55 0.28 255 / 0.12)",
              }}
            />
          </Link>

          {user ? (
            <>
              <Link
                to="/dashboard"
                className="ml-2 inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-semibold text-white transition-all"
                style={{
                  background:
                    "linear-gradient(135deg, oklch(0.34 0.26 262), oklch(0.42 0.24 258))",
                  boxShadow:
                    "0 0 0 1px oklch(0.55 0.28 255 / 0.4), 0 2px 12px oklch(0.42 0.24 258 / 0.30)",
                }}
              >
                <Cpu className="h-3.5 w-3.5" />
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
              className="ml-2 inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-semibold text-white transition-all hover:-translate-y-0.5"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.34 0.26 262), oklch(0.42 0.24 258))",
                boxShadow:
                  "0 0 0 1px oklch(0.55 0.28 255 / 0.4), 0 2px 12px oklch(0.42 0.24 258 / 0.30)",
              }}
            >
              Member login
            </Link>
          )}
        </nav>

        {/* Mobile hamburger */}
        <button
          type="button"
          aria-label="Toggle menu"
          onClick={() => setOpen((v) => !v)}
          className="rounded-md p-2 text-foreground md:hidden"
          style={{
            border: "1px solid oklch(0.55 0.28 255 / 0.20)",
            background: "oklch(0.55 0.28 255 / 0.05)",
          }}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <nav
          className="border-t md:hidden"
          style={{
            borderColor: "oklch(0.55 0.28 255 / 0.15)",
            background: "oklch(1 0 0 / 0.90)",
            backdropFilter: "blur(20px)",
          }}
        >
          <div className="section-shell flex flex-col py-3">
            {[...links, { to: "/contact", label: "Contact" } as const].map((l) => (
              <Link
                key={l.to}
                to={l.to}
                onClick={() => setOpen(false)}
                className="rounded-md px-2 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-primary/5 transition-colors"
                activeProps={{ className: "rounded-md px-2 py-2.5 text-sm font-semibold text-primary bg-primary/5" }}
              >
                {l.label}
              </Link>
            ))}
            {user ? (
              <>
                <Link
                  to="/dashboard"
                  onClick={() => setOpen(false)}
                  className="rounded-md px-2 py-2.5 text-sm font-semibold text-primary"
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
                className="rounded-md px-2 py-2.5 text-sm font-semibold text-primary"
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
