import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/database";

export type TagOption = {
  id: string;
  name: string;
  slug: string;
};

/**
 * Fetches all preset tags for use in blog/discussion editors and preferred topics UI.
 * Public read on tags table.
 */
export async function fetchAllTags(supabase: SupabaseClient<Database>): Promise<TagOption[]> {
  const { data, error } = await supabase.from("tags").select("id,name,slug").order("name");

  if (error) {
    return [];
  }

  return (data ?? []).map((row) => ({
    id: row.id,
    name: row.name,
    slug: row.slug
  }));
}
