import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { DashboardActivitySection } from "@/components/pages/dashboard/DashboardActivitySection";
import { DashboardBlogPostsTable } from "@/components/pages/dashboard/DashboardBlogPostsTable";
import { DashboardDiscussionsTable } from "@/components/pages/dashboard/DashboardDiscussionsTable";
import { DashboardEngagementCard } from "@/components/pages/dashboard/DashboardEngagementCard";
import { DashboardHero } from "@/components/pages/dashboard/DashboardHero";
import { DashboardKpiRow } from "@/components/pages/dashboard/DashboardKpiRow";
import { ProfileOverviewCard } from "@/components/pages/dashboard/ProfileOverviewCard";
import {
  buildBlogSummary,
  fetchDashboardActivity,
  fetchDashboardProfile,
  fetchEngagementKpisByPeriod,
  fetchUserBlogPostsWithStats
} from "@/lib/dashboard";
import { getFollowStatsForProfile } from "@/lib/follows";
import { getDiscussionsWithCounts } from "@/lib/discussions";
import { SectionSeparator } from "@/components/pages/community/SectionSeparator";
import { DashboardNotificationModalProvider } from "@/contexts/DashboardNotificationModalContext";

const DashboardKpiRowAny = DashboardKpiRow as React.ComponentType<any>;

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
    getDiscussionsWithCounts(supabase, { authorId: user.id, limit: 10, orderByTrend: false })
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

  const postSlugs = posts.map((post) => post.slug);
  const kpiPeriodSummary = await fetchEngagementKpisByPeriod(supabase, {
    slugs: postSlugs,
    periods: ["7d", "30d", "90d", "6m"]
  });

  const { count: preferredTagsCount } = await supabase
    .from("user_preferred_tags")
    .select("tag_id", { count: "exact", head: true })
    .eq("user_id", user.id);

  const { count: blogCommentCount } = await supabase
    .from("blog_post_comments")
    .select("id", { count: "exact", head: true })
    .eq("author_id", user.id);

  const { count: blogReactionCount } = await supabase
    .from("blog_post_reactions")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id);

  const profileComplete =
    Boolean(profile.bio && profile.bio.trim().length > 0) ||
    Boolean(profile.avatarUrl && profile.avatarUrl.trim().length > 0) ||
    profile.techStack.length > 0 ||
    profile.profileLinks.length > 0;

  const createdBlogPostComplete = posts.length > 0;
  const discussionOrPublishedComplete =
    discussions.length > 0 || posts.some((post) => post.status === "published");
  const preferredTopicsComplete = (preferredTagsCount ?? 0) > 0;
  const blogEngagementComplete = (blogCommentCount ?? 0) > 0 || (blogReactionCount ?? 0) > 0;
  const followingComplete = followStats.followingCount > 0;

  const nextSteps = {
    profileComplete,
    preferredTopicsComplete,
    discussionOrPublishedComplete,
    createdBlogPostComplete,
    blogEngagementComplete,
    followingComplete
  };

  const hasAnyIncompleteStep = Object.values(nextSteps).some((value) => !value);

  return (
    <main className="min-h-screen bg-background">
      <section className="mx-auto w-full max-w-6xl p-3 sm:px-6 lg:px-8">

        <DashboardNotificationModalProvider>
          <DashboardHero
            name={profile.name}
            username={profile.username}
            stats={{
              discussionCount: discussions.length,
              publishedPostCount: blogSummary.publishedCount,
              nextStepsDone: Object.values(nextSteps).filter(Boolean).length,
              nextStepsTotal: Object.keys(nextSteps).length
            }}
            quickViewActivityItems={!hasAnyIncompleteStep ? overviewActivityItems.slice(0, 3) : undefined}
          />


          <div
            id="activity"
            className={`mt-6 grid gap-4 ${hasAnyIncompleteStep ? "md:grid-cols-1 lg:grid-cols-2" : "md:grid-cols-1"}`}
          >
            {hasAnyIncompleteStep && <DashboardEngagementCard nextSteps={nextSteps} />}
            <DashboardActivitySection
              showNextSteps={hasAnyIncompleteStep}
              nextSteps={nextSteps}
              overviewActivityItems={overviewActivityItems}
              activityItems={activityItems}
            />
          </div>
        </DashboardNotificationModalProvider>

        <DashboardKpiRowAny
          blogSummary={blogSummary}
          discussionCount={discussions.length}
          followerCount={followStats.followerCount}
          kpiPeriodSummary={kpiPeriodSummary}
        />

        <div className="mt-6">
          <DashboardBlogPostsTable posts={posts} maxRows={8} />
        </div>

        <div className="mt-6">
          <DashboardDiscussionsTable discussions={discussions} maxRows={8} />
        </div>

        <SectionSeparator />

        <div className="grid gap-4 md:grid-cols-1">
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
