import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { fetchDashboardProfile } from "@/lib/dashboard";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { NewDiscussionForm } from "@/components/pages/dashboard/NewDiscussionForm";

export const metadata: Metadata = {
  title: "New discussion",
  description: "Start a new community discussion."
};

export const dynamic = "force-dynamic";

export default async function NewDiscussionPage() {
  const supabase = await createServerSupabaseClient();
  if (!supabase) redirect("/join");

  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) redirect("/");

  const profile = await fetchDashboardProfile(supabase, user.id);
  if (!profile) redirect("/join?redirect=/dashboard/discussions/new");

  return (
    <main className="min-h-screen bg-background">
      <section className="mx-auto w-full max-w-4xl px-5 py-10 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Link
            href="/dashboard/discussions"
            className="text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            ← Discussion management
          </Link>
          <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-primary">
            CodingBay Community
          </p>
          <h1 className="mt-2 text-2xl font-semibold text-foreground">New discussion</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Start a thread for the community to discuss.
          </p>
        </div>

        <div className="rounded-2xl border border-border/70 bg-card/70 p-5 sm:p-6">
          <NewDiscussionForm authorName={profile.name} />
        </div>
      </section>
    </main>
  );
}
