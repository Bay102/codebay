import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProfileOverviewCard } from "@/components/pages/dashboard/ProfileOverviewCard";
import { fetchDashboardProfile, fetchUserBlogPostsWithStats } from "@/lib/dashboard";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Community Profile",
  description: "Public author profile in the CodingBay Community."
};

export const dynamic = "force-dynamic";

type PublicProfilePageProps = {
  params: Promise<{
    username: string;
  }>;
};

export default async function PublicProfilePage({ params }: PublicProfilePageProps) {
  const { username } = await params;

  const supabase = await createServerSupabaseClient();
  if (!supabase) {
    notFound();
  }

  const { data: userRow, error: userError } = await supabase
    .from("community_users")
    .select("id")
    .eq("username", username)
    .maybeSingle();

  if (userError || !userRow) {
    notFound();
  }

  const userId = userRow.id as string;

  const [profile, posts] = await Promise.all([
    fetchDashboardProfile(supabase, userId),
    fetchUserBlogPostsWithStats(supabase, userId)
  ]);

  if (!profile) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-background">
      <section className="mx-auto w-full max-w-4xl px-5 py-10 sm:px-6 lg:px-8">
        <div className="mt-0 grid gap-4 md:grid-cols-1">
          <ProfileOverviewCard profile={profile} posts={posts} showEditLink={false} />
        </div>
      </section>
    </main>
  );
}

