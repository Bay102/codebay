import Link from "next/link";

export interface DashboardHeroButtonsProps {
  hasSession: boolean;
  blogUrl: string;
}

export function DashboardHeroButtons({ hasSession, blogUrl }: DashboardHeroButtonsProps) {
  return (
    <div className="mt-5 flex flex-wrap gap-3">
      {!hasSession && (
        <Link
          href="/join"
          className="inline-flex rounded-md border border-primary/35 bg-primary/10 px-5 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary/20"
        >
          Join the community
        </Link>
      )}
      {!hasSession && (
        <Link
          href="/join?mode=signin"
          className="inline-flex rounded-md border border-border/70 bg-card px-5 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary/70 hover:text-foreground"
        >
          Sign in
        </Link>
      )}
      {hasSession && (
        <Link
          href="/dashboard"
          className="inline-flex rounded-md border border-primary/35 bg-primary/10 px-5 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary/20"
        >
          Dashboard
        </Link>
      )}
      <Link
        href={hasSession ? "/dashboard/discussions/new" : "/join?redirect=/dashboard/discussions/new"}
        className="inline-flex rounded-md border border-border/70 bg-card px-5 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary/70 hover:text-foreground"
      >
        Start a discussion
      </Link>
      <Link
        href={blogUrl}
        className="inline-flex rounded-md border border-border/70 bg-card px-5 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary/70 hover:text-foreground"
      >
        Blog
      </Link>
    </div>
  );
}
