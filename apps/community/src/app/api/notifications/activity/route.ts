import { NextResponse } from "next/server";
import { fetchDashboardActivity } from "@/lib/dashboard";
import { createServerSupabaseClient } from "@/lib/supabase/server";

const ACTIVITY_LIMIT = 32;

export async function GET() {
  const supabase = await createServerSupabaseClient();
  if (!supabase) {
    return NextResponse.json({ items: [] }, { status: 401 });
  }

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ items: [] }, { status: 401 });
  }

  const { data: postRows } = await supabase
    .from("blog_posts")
    .select("id,slug,title,author_name")
    .eq("author_id", user.id);

  const postMapBySlug = Object.fromEntries(
    ((postRows ?? []) as Array<{ id: string; slug: string; title: string; author_name: string | null }>).map(
      (post) => [
        post.slug,
        { id: post.id, title: post.title, authorName: post.author_name ?? "Author" }
      ]
    )
  );

  const { data: profileRow } = await supabase
    .from("community_users")
    .select("email")
    .eq("id", user.id)
    .maybeSingle();

  const profileEmail =
    (profileRow as { email: string | null } | null)?.email?.trim() || user.email || null;

  const items = await fetchDashboardActivity(supabase, {
    userId: user.id,
    userEmail: profileEmail,
    postMapBySlug,
    limit: ACTIVITY_LIMIT
  });

  return NextResponse.json({ items });
}
