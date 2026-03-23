import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { SegmentNavbar } from "@codebay/ui";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getDiscussionsWithCounts } from "@/lib/discussions";
import { DiscussionManagementCard } from "@/components/pages/dashboard/DiscussionManagementCard";
import { fetchDashboardProfile } from "@/lib/dashboard";
import { fetchAllTags } from "@/lib/tags";

export const metadata: Metadata = {
  title: "Discussion management",
  description: "Manage your community discussions."
};

export const dynamic = "force-dynamic";

export default async function DashboardDiscussionsPage() {
  const supabase = await createServerSupabaseClient();
  if (!supabase) redirect("/join");

  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) redirect("/");

  const [profile, discussions, allowedTags] = await Promise.all([
    fetchDashboardProfile(supabase, user.id),
    getDiscussionsWithCounts(supabase, {
      authorId: user.id,
      limit: 32,
      offset: 0,
      orderByTrend: false
    }),
    fetchAllTags(supabase)
  ]);

  if (!profile) {
    redirect("/join?redirect=/dashboard/discussions");
  }

  return (
    <main className="bg-background">
      <section className="mx-auto w-full max-w-4xl px-5 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-primary">
              CodingBay Community
            </p>
            <h1 className="mt-2 text-2xl font-semibold text-foreground">My Discussions</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Start and manage your discussion threads.
            </p>
          </div>
          <div className="flex w-full min-w-0 shrink-0 justify-end sm:w-auto">
            <SegmentNavbar
              aria-label="Discussions page actions"
              className="w-full sm:w-auto"
              links={[{ href: "/dashboard", label: "Back to dashboard", kind: "primary" }]}
            />
          </div>
        </div>

        <DiscussionManagementCard discussions={discussions} authorName={profile.name} allowedTags={allowedTags} />
      </section>
    </main>
  );
}
