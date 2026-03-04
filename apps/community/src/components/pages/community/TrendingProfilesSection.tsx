import { getFollowStatsAction } from "@/app/actions";
import type { LandingProfile } from "@/lib/landing";
import { fetchTrendingProfiles } from "@/lib/landing";
import { TrendingProfileCard } from "./TrendingProfileCard";

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
          <TrendingProfileCard key={profile.id} profile={profile} getFollowStatsAction={getFollowStatsAction} />
        ))}
      </div>
    </section>
  );
}
