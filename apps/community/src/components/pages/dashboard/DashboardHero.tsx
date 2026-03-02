import Link from "next/link";
import { SurfaceCard } from "@codebay/ui";
import { blogUrl } from "@/lib/site-urls";

type DashboardHeroProps = {
  name: string;
  username: string | null;
};

export function DashboardHero({ name, username }: DashboardHeroProps) {
  const publicBlogUrl = username ? `${blogUrl}/author/${username}` : null;

  return (
    <SurfaceCard as="section" variant="hero">
      <p className="text-sm font-medium uppercase tracking-wide text-primary">CodeBay Community</p>
      <h1 className="mt-3 max-w-4xl text-3xl font-semibold leading-tight text-foreground sm:text-4xl">
        Welcome back, {name}
      </h1>
      <p className="mt-4 max-w-3xl text-base leading-8 text-muted-foreground sm:text-lg">
        Manage your profile, run your blog workflow, and keep up with community activity from one place.
      </p>
      <div className="mt-6 flex flex-wrap gap-3">
        <Link
          href="/dashboard/blog"
          className="inline-flex h-10 items-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          Open blog dashboard
        </Link>
        {publicBlogUrl ? (
          <Link
            href={publicBlogUrl}
            className="inline-flex h-10 items-center rounded-md border border-border bg-card px-4 text-sm font-medium text-foreground transition-colors hover:bg-secondary/70"
          >
            View your public blog
          </Link>
        ) : null}
      </div>
    </SurfaceCard>
  );
}
