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
    <SurfaceCard as="section" variant="hero" className="px-5 py-6 sm:px-6 sm:py-8 md:px-8">
      <p className="text-sm font-medium uppercase tracking-wide text-primary">CodingBay Community</p>
      <h1 className="mt-2 max-w-4xl text-2xl font-semibold leading-tight text-foreground sm:text-3xl">
        Welcome back, {name}
      </h1>
      <p className="mt-3 max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base">
        Manage your profile, run your blog workflow, and keep up with community activity from one place.
      </p>
      <nav className="mt-4 flex flex-wrap gap-2.5 text-sm">
        <Link
          href="/"
          className="inline-flex items-center rounded-full border border-border/70 bg-card/40 px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-secondary/70 hover:text-foreground sm:text-sm"
        >
          Community home
        </Link>
        <Link
          href="/dashboard/blog"
          className="inline-flex items-center rounded-full border border-border/70 bg-card/40 px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-secondary/70 hover:text-foreground sm:text-sm"
        >
          Blog dashboard
        </Link>
        {publicBlogUrl ? (
          <Link
            href={publicBlogUrl}
            className="inline-flex items-center rounded-full border border-border/70 bg-card/40 px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-secondary/70 hover:text-foreground sm:text-sm"
          >
            Public blog page
          </Link>
        ) : null}
        <Link
          href="#"
          aria-disabled="true"
          className="inline-flex items-center rounded-full border border-dashed border-border/60 bg-card/20 px-3 py-1.5 text-xs font-medium text-muted-foreground/80 sm:text-sm"
        >
          Placeholder link 1
        </Link>
        <Link
          href="#"
          aria-disabled="true"
          className="inline-flex items-center rounded-full border border-dashed border-border/60 bg-card/20 px-3 py-1.5 text-xs font-medium text-muted-foreground/80 sm:text-sm"
        >
          Placeholder link 2
        </Link>
      </nav>
    </SurfaceCard>
  );
}
