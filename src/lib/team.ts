import { supabase } from "@/integrations/supabase/client";
import { faculty, societies } from "@/data/site";

export type TeamPerson = {
  name: string;
  role: string;
  subtitle?: string;
  avatarUrl?: string | null;
};

type PositionRow = {
  title: string;
  society: string | null;
  profiles: { full_name: string; avatar_url: string | null };
};

type RoleRow = {
  role: string;
  society: string | null;
  profiles: { full_name: string; avatar_url: string | null } | null;
};

const SOCIETY_SLUGS = ["cs", "wie", "sps", "pels", "emb", "sight", "pes"] as const;

// Human-readable labels for user_roles roles
const ROLE_LABELS: Record<string, string> = {
  counsellor: "Branch Counsellor",
  chair: "Branch Chair",
  secretary: "Branch Secretary",
  editor: "Editor",
  society_chair: "Society Chair",
};

function isBranchPosition(society: string | null) {
  return !society || society === "branch";
}

function toPerson(row: PositionRow): TeamPerson {
  return {
    name: row.profiles.full_name,
    role: row.title,
    avatarUrl: row.profiles.avatar_url,
  };
}

export async function loadTeamFromDb(): Promise<{
  branch: TeamPerson[];
  bySociety: Record<string, TeamPerson[]>;
  hasDbData: boolean;
}> {
  // Fetch explicit positions (e.g. "Vice-Chair", "Treasurer", custom titles)
  const { data: posData } = await supabase
    .from("positions")
    .select("title, society, profiles!inner(full_name, avatar_url)")
    .is("end_date", null)
    .order("title");

  // Fetch users with leadership roles (counsellor, chair, secretary, editor, society_chair)
  const { data: roleData } = await supabase
    .from("user_roles")
    .select("role, society, profiles!inner(full_name, avatar_url)")
    .in("role", ["counsellor", "chair", "secretary", "society_chair", "editor"]);

  const posRows = (posData ?? []) as unknown as PositionRow[];
  const roleRows = (roleData ?? []) as unknown as RoleRow[];

  // Build branch team: positions first, then role-based members
  const seen = new Set<string>();

  const branchFromPositions = posRows
    .filter((r) => isBranchPosition(r.society))
    .map(toPerson);

  const branchFromRoles: TeamPerson[] = roleRows
    .filter((r) => isBranchPosition(r.society) && r.profiles)
    .map((r) => ({
      name: r.profiles!.full_name,
      role: ROLE_LABELS[r.role] ?? r.role,
      avatarUrl: r.profiles!.avatar_url,
    }));

  branchFromPositions.forEach((p) => seen.add(p.name));
  const branch = [
    ...branchFromPositions,
    ...branchFromRoles.filter((p) => !seen.has(p.name)),
  ];

  // Build per-society teams
  const bySociety: Record<string, TeamPerson[]> = {};

  for (const slug of SOCIETY_SLUGS) {
    const societySeen = new Set<string>();

    const fromPositions = posRows
      .filter((r) => r.society === slug)
      .map(toPerson);

    const fromRoles: TeamPerson[] = roleRows
      .filter((r) => r.society === slug && r.profiles)
      .map((r) => ({
        name: r.profiles!.full_name,
        role: ROLE_LABELS[r.role] ?? r.role,
        avatarUrl: r.profiles!.avatar_url,
      }));

    fromPositions.forEach((p) => societySeen.add(p.name));
    const merged = [
      ...fromPositions,
      ...fromRoles.filter((p) => !societySeen.has(p.name)),
    ];

    if (merged.length > 0) bySociety[slug] = merged;
  }

  const hasDbData = branch.length > 0 || Object.keys(bySociety).length > 0;
  return { branch, bySociety, hasDbData };
}

export { faculty, societies, SOCIETY_SLUGS };
