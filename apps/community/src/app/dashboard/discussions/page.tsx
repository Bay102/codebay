import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getDiscussionsWithCounts } from "@/lib/discussions";
import { DiscussionManagementCard } from "@/components/pages/dashboard/DiscussionManagementCard";
import { fetchDashboardProfile } from "@/lib/dashboard";

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

  const profile = await fetchDashboardProfile(supabase, user.id);
  if (!profile) {
    redirect("/join?redirect=/dashboard/discussions");
  }

  const discussions = await getDiscussionsWithCounts(supabase, {
    authorId: user.id,
    limit: 32,
    offset: 0,
    orderByTrend: false
  });

  return (
    <main className="min-h-screen bg-background">
      <section className="mx-auto w-full max-w-4xl px-5 py-10 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-primary">
              CodingBay Community
            </p>
            <h1 className="mt-2 text-2xl font-semibold text-foreground">Discussion management</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Start and manage your discussion threads.
            </p>
          </div>
          <Link
            href="/dashboard"
            className="inline-flex h-10 items-center rounded-md border border-border px-4 text-sm font-medium transition-colors hover:bg-secondary/70"
          >
            Back to dashboard
          </Link>
        </div>

        <DiscussionManagementCard discussions={discussions} authorName={profile.name} />
      </section>
    </main>
  );
}
