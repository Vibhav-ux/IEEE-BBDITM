import { supabase } from "@/integrations/supabase/client";
import { faculty, officeBearers, societies } from "@/data/site";

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

const SOCIETY_SLUGS = ["cs", "wie", "sps", "pels", "emb", "sight", "pes"] as const;

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
  const { data } = await supabase
    .from("positions")
    .select("title, society, profiles!inner(full_name, avatar_url)")
    .is("end_date", null)
    .order("title");

  const rows = (data ?? []) as PositionRow[];
  if (rows.length === 0) {
    return {
      branch: officeBearers.branch.map((m) => ({
        name: m.name,
        role: m.role,
        subtitle: m.society,
      })),
      bySociety: Object.fromEntries(
        SOCIETY_SLUGS.map((slug) => [
          slug,
          (officeBearers[slug] ?? []).map((m) => ({ name: m.name, role: m.role })),
        ]),
      ),
      hasDbData: false,
    };
  }

  const branch = rows.filter((r) => isBranchPosition(r.society)).map(toPerson);
  const bySociety: Record<string, TeamPerson[]> = {};

  for (const slug of SOCIETY_SLUGS) {
    const members = rows.filter((r) => r.society === slug).map(toPerson);
    if (members.length > 0) bySociety[slug] = members;
  }

  return { branch, bySociety, hasDbData: true };
}

export { faculty, societies, SOCIETY_SLUGS };
