import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) throw redirect({ to: "/auth" });
    return { user: data.user };
  },
  component: AuthenticatedLayout,
});

/** Renders pending-approval screen for unapproved users; normal <Outlet /> otherwise */
function AuthenticatedLayout() {
  const { isApproved, loading, user, signOut } = useAuth();

  // While auth context is loading, render nothing (avoids flicker)
  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (user && !isApproved) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
        <div className="max-w-md">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
            <svg
              className="h-10 w-10 text-primary"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h1 className="font-display text-2xl font-bold">Account pending approval</h1>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Your registration is under review. The Branch Counsellor will approve your account
            shortly. You'll have full access once approved.
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            Signed in as <span className="font-mono font-medium">{user.email}</span>
          </p>
          <button
            onClick={() => signOut()}
            className="mt-6 rounded-lg border border-border px-5 py-2.5 text-sm font-medium transition-colors hover:bg-secondary"
          >
            Sign out
          </button>
        </div>
      </div>
    );
  }

  return <Outlet />;
}
