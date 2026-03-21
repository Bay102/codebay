import { getFollowStatsAction } from "@/lib/actions";
import type { LandingProfile } from "@/lib/landing";
import { fetchTrendingProfiles } from "@/lib/landing";
import { getFollowStatsForProfile } from "@/lib/follows";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { AnimatedCardSection } from "@codebay/ui";
import { TrendingProfilesTicker } from "./TrendingProfilesTicker";

type LandingProfileWithFollowers = LandingProfile & {
  followerCount: number;
  /** When present, the current viewer follows this profile. Set when viewer is fetched server-side. */
  isFollowing?: boolean;
};

export async function TrendingProfilesSection() {
  const [profiles, supabase] = await Promise.all([fetchTrendingProfiles(18), createServerSupabaseClient()]);

  if (!supabase || profiles.length === 0) {
    return null;
  }

  const {
    data: { user }
  } = await supabase.auth.getUser();
  const viewerId = user?.id ?? null;

  const profilesWithFollowers: LandingProfileWithFollowers[] = await Promise.all(
    profiles.map(async (profile) => {
      const stats = await getFollowStatsForProfile(supabase, profile.id, viewerId);
      return {
        ...profile,
        followerCount: stats.followerCount ?? 0,
        ...(stats.isFollowing !== undefined && { isFollowing: stats.isFollowing })
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
