import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { CommunityDashboardActions } from "@/components/pages/community/CommunityDashboardActions";
import { DismissibleNextStepsCard } from "@/components/pages/community/DismissibleNextStepsCard";
import { ActivityOverviewCard } from "@/components/pages/dashboard/ActivityOverviewCard";
import { BlogManagementSummaryCard } from "@/components/pages/dashboard/BlogManagementSummaryCard";
import { DiscussionManagementCard } from "@/components/pages/dashboard/DiscussionManagementCard";
import { DashboardHero } from "@/components/pages/dashboard/DashboardHero";
import { ProfileOverviewCard } from "@/components/pages/dashboard/ProfileOverviewCard";
import {
  buildBlogSummary,
  fetchDashboardActivity,
  fetchDashboardProfile,
  fetchUserBlogPostsWithStats
} from "@/lib/dashboard";
import { getFollowStatsForProfile } from "@/lib/follows";
import { getDiscussionsWithCounts } from "@/lib/discussions";

export const metadata: Metadata = {
  title: "Community Dashboard",
  description: "Your personal hub for CodingBay Community activity, content, and collaboration."
};

export const dynamic = "force-dynamic";

export default async function CommunityDashboardPage() {
  const supabase = await createServerSupabaseClient();
  if (!supabase) {
    redirect("/join");
  }

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  const [profile, posts, followStats, discussions] = await Promise.all([
    fetchDashboardProfile(supabase, user.id),
    fetchUserBlogPostsWithStats(supabase, user.id),
    getFollowStatsForProfile(supabase, user.id, user.id),
    getDiscussionsWithCounts(supabase, { authorId: user.id, limit: 3, orderByTrend: false })
  ]);

  if (!profile) {
    redirect("/join?redirect=/dashboard");
  }

  const profileWithFollowStats = {
    ...profile,
    followerCount: followStats.followerCount,
    followingCount: followStats.followingCount
  };
  const blogSummary = buildBlogSummary(posts);
  const postMapBySlug = Object.fromEntries(
    posts.map((post) => [post.slug, { id: post.id, title: post.title, authorName: post.authorName }])
  );

  const activityItems = await fetchDashboardActivity(supabase, {
    userId: user.id,
    userEmail: profile.email ?? user.email ?? null,
    postMapBySlug,
    limit: 32
  });

  const overviewActivityItems = activityItems.filter((item) => !item.isRead).slice(0, 8);

  return (
    <main className="min-h-screen bg-background">
      <section className="mx-auto w-full max-w-6xl px-5 py-10 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-primary">CodingBay Community</p>
            <h1 className="text-lg font-semibold text-foreground sm:text-xl">Dashboard</h1>
          </div>
          <CommunityDashboardActions />
        </div>
        <DashboardHero name={profile.name} username={profile.username} />

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <ActivityOverviewCard items={overviewActivityItems} allItems={activityItems} />
          <DismissibleNextStepsCard />
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-1">
          <BlogManagementSummaryCard summary={blogSummary} />
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-1">
          <DiscussionManagementCard discussions={discussions} authorName={profile.name} />
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-1">
          <ProfileOverviewCard profile={profileWithFollowStats} posts={posts} viewerId={user.id} />
        </div>

        <div className="mt-6">
          <Link
            href="/"
            className="inline-flex rounded-full border border-border/80 bg-card px-4 py-2 text-sm text-muted-foreground transition-colors hover:bg-secondary/70 hover:text-foreground"
          >
            Back to community landing
          </Link>
        </div>
      </section>
    </main>
  );
}
