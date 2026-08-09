// ⚠️ DEV ONLY — set to false when done testing counsellor features
const DEV_COUNSELLOR = false;

// Hardcoded admin credentials (local, no Supabase needed)
const ADMIN_USERNAME = "ieeeBBDITM";
const ADMIN_PASSWORD = "ieeeBBDITM@2025";
const LOCAL_ADMIN_KEY = "ieee_admin_local";

export function checkAdminCredentials(username: string, password: string) {
  return username === ADMIN_USERNAME && password === ADMIN_PASSWORD;
}

export function setLocalAdmin(value: boolean) {
  if (typeof window === "undefined") return;
  if (value) {
    localStorage.setItem(LOCAL_ADMIN_KEY, "1");
  } else {
    localStorage.removeItem(LOCAL_ADMIN_KEY);
  }
}

export function isLocalAdminActive() {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(LOCAL_ADMIN_KEY) === "1";
}

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";

import { supabase } from "@/integrations/supabase/client";

export type AppRole = "counsellor" | "chair" | "secretary" | "society_chair" | "editor" | "member";

type RoleRow = { role: AppRole; society: string | null };

type AuthValue = {
  user: User | null;
  session: Session | null;
  roles: RoleRow[];
  loading: boolean;
  /** Can edit gallery, photos, society details */
  canEdit: boolean;
  canViewAll: boolean;
  /** Can create/delete events (branch counsellor, chair, secretary ONLY) */
  canCreateEvents: boolean;
  /** Can approve members, assign positions, manage society members (counsellor ONLY) */
  canManageMembers: boolean;
  /** Whether this user's account has been approved by the counsellor */
  isApproved: boolean;
  isCounsellor: boolean;
  chairSocieties: string[];
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [roles, setRoles] = useState<RoleRow[]>([]);
  const [isApproved, setIsApproved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [localAdmin, setLocalAdminState] = useState<boolean>(() => isLocalAdminActive());

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next);
      if (!next) {
        setRoles([]);
        setIsApproved(false);
      }
    });
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  // Listen for local admin state changes (dispatched from login form)
  useEffect(() => {
    const handler = () => setLocalAdminState(isLocalAdminActive());
    window.addEventListener("ieee-admin-change", handler);
    return () => window.removeEventListener("ieee-admin-change", handler);
  }, []);

  const userId = session?.user.id;
  useEffect(() => {
    if (!userId) return;
    let cancelled = false;

    // Fetch roles
    supabase
      .from("user_roles")
      .select("role, society")
      .eq("user_id", userId)
      .then(({ data }) => {
        if (!cancelled) setRoles((data ?? []) as RoleRow[]);
      });

    // Fetch profile status for approval check
    supabase
      .from("profiles")
      .select("status")
      .eq("id", userId)
      .single()
      .then(({ data }) => {
        if (!cancelled) setIsApproved(data?.status === "approved");
      });

    return () => {
      cancelled = true;
    };
  }, [userId]);

  const isAdminSession = DEV_COUNSELLOR || localAdmin;

  const roleNames = isAdminSession
    ? (["counsellor"] as AppRole[])
    : roles.map((r) => r.role);

  // canEdit: gallery, photos, societies (counsellor, chair, secretary, editor)
  const canEdit =
    isAdminSession ||
    ["counsellor", "chair", "secretary", "editor"].some((r) =>
      roleNames.includes(r as AppRole),
    );

  // canCreateEvents: ONLY branch counsellor, chair, secretary (no society qualifier needed)
  // A chair with society='cs' cannot create events — only branch-level roles can
  const canCreateEvents =
    isAdminSession ||
    roleNames.includes("counsellor") ||
    roles.some((r) => r.role === "chair" && !r.society) ||
    roles.some((r) => r.role === "secretary" && !r.society);

  // canManageMembers: counsellor only
  const canManageMembers = isAdminSession || roleNames.includes("counsellor");

  const isCounsellor = isAdminSession || roleNames.includes("counsellor");

  const value: AuthValue = {
    user: localAdmin
      ? ({ id: "local-admin", email: "ieeeBBDITM" } as unknown as User)
      : (session?.user ?? null),
    session: localAdmin ? ({} as unknown as Session) : session,
    roles,
    loading: localAdmin ? false : loading,
    canEdit,
    canViewAll: canEdit,
    canCreateEvents,
    canManageMembers,
    isApproved: isAdminSession ? true : isApproved,
    isCounsellor,
    chairSocieties: roles
      .filter((r) => r.role === "society_chair" && r.society)
      .map((r) => r.society!),
    signOut: async () => {
      if (localAdmin) {
        setLocalAdmin(false);
        setLocalAdminState(false);
        window.dispatchEvent(new Event("ieee-admin-change"));
        return;
      }
      await supabase.auth.signOut();
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
