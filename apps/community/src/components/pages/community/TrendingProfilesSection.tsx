import { getFollowStatsAction } from "@/app/actions";
import type { LandingProfile } from "@/lib/landing";
import { fetchTrendingProfiles } from "@/lib/landing";
import { getFollowStatsForProfile } from "@/lib/follows";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { TrendingProfileCard } from "./TrendingProfileCard";

type LandingProfileWithFollowers = LandingProfile & { followerCount: number };

export async function TrendingProfilesSection() {
  const [profiles, supabase] = await Promise.all([fetchTrendingProfiles(6), createServerSupabaseClient()]);

  if (!supabase || profiles.length === 0) {
    return null;
  }

  const profilesWithFollowers: LandingProfileWithFollowers[] = await Promise.all(
    profiles.map(async (profile) => {
      const stats = await getFollowStatsForProfile(supabase, profile.id, null);
      return {
        ...profile,
        followerCount: stats.followerCount ?? 0
      };
    })
  );

  return (
    <section className="mt-8">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Profiles Getting Noticed</h2>
      <div className="mt-3 grid gap-3 sm:grid-cols-2 md:grid-cols-3">
        {profilesWithFollowers.map((profile) => (
          <TrendingProfileCard key={profile.id} profile={profile} getFollowStatsAction={getFollowStatsAction} />
        ))}
      </div>
    </section>
  );
}
