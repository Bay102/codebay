import Link from "next/link";
import { SurfaceCard } from "@codebay/ui";
import type { LandingProfile } from "@/lib/landing";
import { fetchTrendingProfiles } from "@/lib/landing";
import { blogUrl } from "@/lib/site-urls";

export async function TrendingProfilesSection() {
  const profiles = await fetchTrendingProfiles(6);

  if (profiles.length === 0) {
    return null;
  }

  return (
    <section className="mt-8">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Trending profiles</h2>
      <div className="mt-3 grid gap-3 sm:grid-cols-2 md:grid-cols-3">
        {profiles.map((profile) => (
          <TrendingProfileCard key={profile.id} profile={profile} />
        ))}
      </div>
    </section>
  );
}

function TrendingProfileCard({ profile }: { profile: LandingProfile }) {
  const href = `${blogUrl}/author/${profile.username}`;

  return (
    <SurfaceCard as="article" variant="card" className="flex flex-col gap-2">
      <Link href={href} className="inline-flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary/70 text-xs font-medium text-foreground">
          {getInitials(profile.name)}
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-foreground">{profile.name}</p>
          <p className="truncate text-xs text-muted-foreground">@{profile.username}</p>
        </div>
      </Link>
      {profile.bio ? (
        <p className="mt-1 line-clamp-3 text-xs leading-6 text-muted-foreground">
          {profile.bio}
        </p>
      ) : null}
    </SurfaceCard>
  );
}

function getInitials(name: string): string {
  const parts = name
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (parts.length === 0) return "CB";
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return (parts[0]![0] + parts[1]![0]).toUpperCase();
}

