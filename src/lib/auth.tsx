import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";

import { supabase } from "@/integrations/supabase/client";

export type AppRole = "counsellor" | "chair" | "society_chair" | "editor" | "member";

type RoleRow = { role: AppRole; society: string | null };

type AuthValue = {
  user: User | null;
  session: Session | null;
  roles: RoleRow[];
  loading: boolean;
  canEdit: boolean;
  canViewAll: boolean;
  chairSocieties: string[];
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [roles, setRoles] = useState<RoleRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next);
      if (!next) setRoles([]);
    });
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const userId = session?.user.id;
  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    supabase
      .from("user_roles")
      .select("role, society")
      .eq("user_id", userId)
      .then(({ data }) => {
        if (!cancelled) setRoles((data ?? []) as RoleRow[]);
      });
    return () => {
      cancelled = true;
    };
  }, [userId]);

  const roleNames = roles.map((r) => r.role);
  const canEdit = ["counsellor", "chair", "secretary", "editor"].some((r) => roleNames.includes(r as AppRole));

  const value: AuthValue = {
    user: session?.user ?? null,
    session,
    roles,
    loading,
    canEdit,
    canViewAll: canEdit,
    chairSocieties: roles.filter((r) => r.role === "society_chair" && r.society).map((r) => r.society!),
    signOut: async () => {
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