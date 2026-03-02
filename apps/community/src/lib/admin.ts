import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, Tables } from "@/lib/database";

type CommunityUserRow = Tables<"community_users">;

export type AdminContext = {
  user: NonNullable<Awaited<ReturnType<SupabaseClient<Database>["auth"]["getUser"]>>["data"]["user"]>;
  profile: CommunityUserRow;
};

export function isAdmin(profile: Pick<CommunityUserRow, "user_type"> | null | undefined): boolean {
  return profile?.user_type === "admin";
}

export async function requireAdmin(
  supabase: SupabaseClient<Database>
): Promise<AdminContext> {
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("NOT_AUTHENTICATED");
  }

  const { data: profile, error } = await supabase
    .from("community_users")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (error || !profile || !isAdmin(profile)) {
    throw new Error("NOT_ADMIN");
  }

  return { user, profile };
}

