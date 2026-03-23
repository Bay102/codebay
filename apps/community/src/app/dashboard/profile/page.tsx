import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { SegmentNavbar } from "@codebay/ui";
import { getPreferredTagIdsAction } from "@/lib/actions";
import { getNewsletterSettingsAction } from "@/lib/newsletter";
import { getFollowing } from "@/lib/follows";
import { PreferredTopicsSection } from "@/components/pages/dashboard/PreferredTopicsSection";
import { NewsletterPreferencesSection } from "@/components/pages/dashboard/NewsletterPreferencesSection";
import { ProfileSettingsForm } from "@/components/pages/dashboard/ProfileSettingsForm";
import { SettingsSectionCard } from "@/components/pages/settings/SettingsSectionCard";
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

  const [posts, allowedTags, preferredTagIds, followingUsers, newsletterSettings] = await Promise.all([
    fetchUserBlogPostsWithStats(supabase, user.id),
    fetchAllTags(supabase),
    getPreferredTagIdsAction(),
    getFollowing(supabase, user.id, 250, 0),
    getNewsletterSettingsAction()
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
          <div className="flex w-full min-w-0 shrink-0 justify-end sm:w-auto">
            <SegmentNavbar
              aria-label="Profile settings actions"
              className="w-full sm:w-auto"
              links={[
                { href: "/dashboard", label: "Back to dashboard", kind: "primary" },
                { href: "/settings", label: "Account settings", kind: "neutral" },
                { href: `/${profile.username}`, label: "View profile", kind: "neutral" }
              ]}
            />
          </div>
        </div>

        <SettingsSectionCard ariaLabel="Topics you follow" collapsible defaultCollapsed>
          <PreferredTopicsSection
            allowedTags={allowedTags}
            initialPreferredTagIds={preferredTagIds}
            showSectionTitle={false}
          />
        </SettingsSectionCard>

        <section className="mb-8 border border-border/70 bg-card/70 p-5 sm:p-6">
          <NewsletterPreferencesSection followingUsers={followingUsers} initialSettings={newsletterSettings} />
        </section>

        <ProfileSettingsForm profile={profile} blogPosts={posts} />
      </section>
    </main>
  );
}
