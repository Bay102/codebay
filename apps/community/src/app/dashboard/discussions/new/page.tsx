import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { fetchDashboardProfile } from "@/lib/dashboard";
import { fetchAllTags } from "@/lib/tags";
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

  const [profile, allowedTags] = await Promise.all([
    fetchDashboardProfile(supabase, user.id),
    fetchAllTags(supabase)
  ]);
  if (!profile) redirect("/join?redirect=/dashboard/discussions/new");

  return (
    <main className="bg-background">
      <section className="mx-auto w-full max-w-5xl px-2 sm:px-6 lg:px-8">
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
            Ask a question, share a win, or start a deep-dive discussion.
          </p>
        </div>

        <div className="grid gap-5 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          <div className="border border-border/70 bg-card/70 px-3.5 py-5 sm:px-3.5 sm:py-6">
            <NewDiscussionForm authorName={profile.name} allowedTags={allowedTags} />
          </div>
          <aside className="hidden lg:block">
            <div className="sticky top-20 space-y-4">
              <div className="border border-border/70 bg-card/60 p-4">
                <h2 className="text-sm font-semibold text-foreground">Tips for a great discussion</h2>
                <ul className="mt-2 list-disc space-y-1 pl-4 text-xs text-muted-foreground">
                  <li>Use a clear, specific title that captures the core question or idea.</li>
                  <li>Explain what you have already tried or are considering.</li>
                  <li>Include relevant code snippets or examples when helpful.</li>
                  <li>Use relevant topic tags to boost visibility & engagement.</li>
                </ul>
              </div>
              <div className="border border-border/70 bg-card/60 p-4">
                <h2 className="text-sm font-semibold text-foreground">Community guidelines</h2>
                <p className="mt-2 text-xs text-muted-foreground">
                  Be kind, stay on topic, and share context so others can give high-signal responses.
                </p>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
