import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getPreferredTagIdsAction } from "@/lib/actions";
import { PreferredTopicsSection } from "@/components/pages/dashboard/PreferredTopicsSection";
import { ProfileSettingsForm } from "@/components/pages/dashboard/ProfileSettingsForm";
import { fetchDashboardProfile, fetchUserBlogPostsWithStats } from "@/lib/dashboard";
import { fetchAllTags } from "@/lib/tags";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Profile Settings",
  description: "Update your community profile for dashboard and author pages."
};

export const dynamic = "force-dynamic";

export default async function DashboardProfilePage() {
  const supabase = await createServerSupabaseClient();
  if (!supabase) {
    redirect("/join");
  }

  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/?next=/dashboard/profile");
  }

  const profile = await fetchDashboardProfile(supabase, user.id);
  if (!profile) {
    redirect("/join?redirect=/dashboard/profile");
  }

  const [posts, allowedTags, preferredTagIds] = await Promise.all([
    fetchUserBlogPostsWithStats(supabase, user.id),
    fetchAllTags(supabase),
    getPreferredTagIdsAction()
  ]);

  return (
    <main className="min-h-screen bg-background">
      <section className="mx-auto w-full max-w-4xl px-5 py-10 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-primary">CodingBay Community</p>
            <h1 className="mt-2 text-2xl font-semibold text-foreground">Profile settings</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Keep your profile updated for the dashboard and your public author page.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/dashboard"
              className="inline-flex h-10 items-center rounded-md border border-border px-4 text-sm font-medium transition-colors hover:bg-secondary/70"
            >
              Back to dashboard
            </Link>
            <Link
              href={`/${profile.username}`}
              className="inline-flex h-10 items-center rounded-md border border-border px-4 text-sm font-medium transition-colors hover:bg-secondary/70"
            >
              View profile
            </Link>
          </div>
        </div>

        <section className="mb-8 rounded-2xl border border-border/70 bg-card/70 p-5 sm:p-6">
          <PreferredTopicsSection allowedTags={allowedTags} initialPreferredTagIds={preferredTagIds} />
        </section>

        <ProfileSettingsForm profile={profile} blogPosts={posts} />
      </section>
    </main>
  );
}
