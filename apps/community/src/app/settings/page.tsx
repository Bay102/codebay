import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getPreferredTagIdsAction } from "@/lib/actions";
import { getNewsletterSettingsAction } from "@/lib/newsletter";
import { getFollowing } from "@/lib/follows";
import { PreferredTopicsSection } from "@/components/pages/dashboard/PreferredTopicsSection";
import { NewsletterPreferencesSection } from "@/components/pages/dashboard/NewsletterPreferencesSection";
import { SettingsSectionCard } from "@/components/pages/settings/SettingsSectionCard";
import { fetchAllTags } from "@/lib/tags";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Settings",
  description: "Manage your CodeBay Community account preferences."
};

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const supabase = await createServerSupabaseClient();
  if (!supabase) {
    redirect("/join");
  }

  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/?next=/settings");
  }

  const [allowedTags, preferredTagIds, followingUsers, newsletterSettings] = await Promise.all([
    fetchAllTags(supabase),
    getPreferredTagIdsAction(),
    getFollowing(supabase, user.id, 250, 0),
    getNewsletterSettingsAction()
  ]);

  return (
    <main className="min-h-screen bg-background">
      <section className="mx-auto w-full max-w-4xl px-5 py-10 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-primary">Account</p>
            <h1 id="settings-page-title" className="mt-2 text-2xl font-semibold text-foreground">
              Settings
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
              Control how the community is personalized for you. More options will appear here over time.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/dashboard"
              className="inline-flex h-10 items-center rounded-md border border-border px-4 text-sm font-medium transition-colors hover:bg-secondary/70"
            >
              Dashboard
            </Link>
            <Link
              href="/dashboard/profile"
              className="inline-flex h-10 items-center rounded-md border border-border px-4 text-sm font-medium transition-colors hover:bg-secondary/70"
            >
              Profile &amp; blog
            </Link>
          </div>
        </div>

        <nav
          aria-label="On this page"
          className="mb-8 flex flex-wrap gap-x-4 gap-y-2 border-b border-border/60 pb-4 text-sm"
        >
          <a href="#settings-topics" className="font-medium text-primary underline-offset-4 hover:underline">
            Topics you follow
          </a>
          <a href="#settings-newsletter" className="font-medium text-primary underline-offset-4 hover:underline">
            Newsletter
          </a>
        </nav>

        <SettingsSectionCard
          id="settings-topics"
          ariaLabel="Topics you follow"
          collapsible
          defaultCollapsed
        >
          <PreferredTopicsSection
            allowedTags={allowedTags}
            initialPreferredTagIds={preferredTagIds}
            showSectionTitle={false}
          />
        </SettingsSectionCard>

        <SettingsSectionCard id="settings-newsletter" ariaLabel="Newsletter preferences">
          <NewsletterPreferencesSection followingUsers={followingUsers} initialSettings={newsletterSettings} />
        </SettingsSectionCard>
      </section>
    </main>
  );
}
