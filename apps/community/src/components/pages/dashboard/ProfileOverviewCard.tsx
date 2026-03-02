import Link from "next/link";
import type { DashboardProfile } from "@/lib/dashboard";

type ProfileOverviewCardProps = {
  profile: DashboardProfile;
};

function buildInitials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "CB";
  if (words.length === 1) return words[0]!.slice(0, 2).toUpperCase();
  return `${words[0]![0]}${words[1]![0]}`.toUpperCase();
}

export function ProfileOverviewCard({ profile }: ProfileOverviewCardProps) {
  return (
    <article className="rounded-2xl border border-border/70 bg-card/70 p-5 sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Profile</h2>
        <Link
          href="/dashboard/profile"
          className="inline-flex h-8 items-center rounded-md border border-border px-3 text-xs font-medium transition-colors hover:bg-secondary/70"
        >
          Edit profile
        </Link>
      </div>

      <div className="mt-4 flex items-start gap-4">
        {profile.avatarUrl ? (
          <img src={profile.avatarUrl} alt={`${profile.name} avatar`} className="h-14 w-14 rounded-full border border-border/70 object-cover" />
        ) : (
          <div className="flex h-14 w-14 items-center justify-center rounded-full border border-border/70 bg-secondary text-sm font-semibold">
            {buildInitials(profile.name)}
          </div>
        )}
        <div>
          <p className="text-base font-semibold text-foreground">{profile.name}</p>
          <p className="text-sm text-muted-foreground">@{profile.username}</p>
          <p className="mt-2 text-sm text-muted-foreground">{profile.email}</p>
        </div>
      </div>

      <p className="mt-4 text-sm leading-7 text-muted-foreground">{profile.bio?.trim() ? profile.bio : "Add a short bio to personalize your author presence."}</p>

      <div className="mt-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Tech stack</p>
        {profile.techStack.length > 0 ? (
          <div className="mt-2 flex flex-wrap gap-2">
            {profile.techStack.map((item) => (
              <span key={item} className="rounded-full border border-border/80 bg-background px-2.5 py-1 text-xs">
                {item}
              </span>
            ))}
          </div>
        ) : (
          <p className="mt-2 text-sm text-muted-foreground">No technologies added yet.</p>
        )}
      </div>

      <div className="mt-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Featured projects</p>
        {profile.featuredProjects.length > 0 ? (
          <div className="mt-2 space-y-2">
            {profile.featuredProjects.slice(0, 3).map((project) => (
              <div key={project.title} className="rounded-xl border border-border/70 bg-background/70 p-3">
                <p className="text-sm font-medium text-foreground">{project.title}</p>
                {project.description ? <p className="mt-1 text-xs text-muted-foreground">{project.description}</p> : null}
                {project.url ? (
                  <Link
                    href={project.url}
                    className="mt-2 inline-flex text-xs font-medium text-primary underline-offset-4 hover:underline"
                  >
                    View project
                  </Link>
                ) : null}
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-2 text-sm text-muted-foreground">No featured projects yet.</p>
        )}
      </div>
    </article>
  );
}
