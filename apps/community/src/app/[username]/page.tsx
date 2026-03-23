import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProfileOverviewCard } from "@/components/pages/dashboard/ProfileOverviewCard";
import { fetchDashboardProfile, fetchUserBlogPostsWithStats } from "@/lib/dashboard";
import { getFollowStatsForProfile } from "@/lib/follows";
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

  const [profile, posts, followResult] = await Promise.all([
    fetchDashboardProfile(supabase, userId),
    fetchUserBlogPostsWithStats(supabase, userId),
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      const followStats = await getFollowStatsForProfile(supabase, userId, user?.id ?? null);
      return { followStats, viewerId: user?.id ?? null };
    })
  ]);

  if (!profile) {
    notFound();
  }

  const profileWithFollowStats = {
    ...profile,
    followerCount: followResult.followStats.followerCount,
    followingCount: followResult.followStats.followingCount,
    ...(followResult.followStats.isFollowing !== undefined && { isFollowing: followResult.followStats.isFollowing })
  };
  const viewerId = followResult.viewerId;

  return (
    <main className="bg-background">
      <section className="mx-auto w-full max-w-5xl pb-6 ">
        <div className="mt-0 grid gap-4 md:grid-cols-1">
          <ProfileOverviewCard
            profile={profileWithFollowStats}
            posts={posts}
            showEditLink={false}
            viewerId={viewerId}
          />
        </div>
      </section>
    </main>
  );
}

