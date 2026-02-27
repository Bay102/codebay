import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { CommunityDashboardActions } from "@/components/pages/community/CommunityDashboardActions";

export const metadata: Metadata = {
  title: "Community Dashboard",
  description: "Your personal hub for CodeBay community activity, content, and collaboration."
};

export default async function CommunityDashboardPage() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/community");
  }

  const { data: profile } = await supabase
    .from("community_users")
    .select("name,username,email,bio,created_at")
    .eq("id", user.id)
    .maybeSingle();

  return (
    <main className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border/70 bg-background/95 backdrop-blur-sm">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-4 sm:px-6 lg:px-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-primary">CodeBay Community</p>
            <h1 className="text-lg font-semibold text-foreground sm:text-xl">Dashboard</h1>
          </div>
          <CommunityDashboardActions />
        </div>
      </header>

      <section className="mx-auto w-full max-w-6xl px-5 py-10 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-border/70 bg-card/60 px-6 py-7 sm:px-8">
          <h2 className="text-xl font-semibold text-foreground sm:text-2xl">Welcome back</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            This is the initial dashboard scaffold. We will layer in feeds, discussions, badges, and personalized tools
            next.
          </p>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <article className="rounded-2xl border border-border/70 bg-card/60 p-5">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Profile</h3>
            <div className="mt-3 space-y-2 text-sm text-foreground">
              <p>Name: {profile?.name ?? "Not set yet"}</p>
              <p>Username: {profile?.username ? `@${profile.username}` : "Not set yet"}</p>
              <p>Email: {profile?.email ?? user.email ?? "Not available"}</p>
            </div>
          </article>

          <article className="rounded-2xl border border-border/70 bg-card/60 p-5">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Next steps</h3>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li>Set up your profile details and preferences.</li>
              <li>Start a discussion or publish your first community post.</li>
              <li>Comment on recent blog posts and react to useful content.</li>
            </ul>
          </article>
        </div>

        <div className="mt-6">
          <Link
            href="/community"
            className="inline-flex rounded-full border border-border/80 bg-card px-4 py-2 text-sm text-muted-foreground transition-colors hover:bg-secondary/70 hover:text-foreground"
          >
            Back to community landing
          </Link>
        </div>
      </section>
    </main>
  );
}
