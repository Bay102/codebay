import { getFollowStatsAction } from "@/app/actions";
import type { LandingProfile } from "@/lib/landing";
import { fetchTrendingProfiles } from "@/lib/landing";
import { getFollowStatsForProfile } from "@/lib/follows";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { AnimatedCardSection } from "@codebay/ui";
import { TrendingProfilesTicker } from "./TrendingProfilesTicker";

type LandingProfileWithFollowers = LandingProfile & { followerCount: number };

export async function TrendingProfilesSection() {
  const [profiles, supabase] = await Promise.all([fetchTrendingProfiles(18), createServerSupabaseClient()]);

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
    <AnimatedCardSection
      as="section"
      title="Profiles Getting Noticed"
      columns={{ base: 1 }}
      className="mt-11"
    >
      <TrendingProfilesTicker profiles={profilesWithFollowers} getFollowStatsAction={getFollowStatsAction} />
    </AnimatedCardSection>
  );
}
