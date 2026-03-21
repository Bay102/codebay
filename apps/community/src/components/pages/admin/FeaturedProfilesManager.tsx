"use client";

import { useEffect, useState } from "react";
import type { Tables } from "@/lib/database";
import { getCommunitySupabaseClient } from "@/lib/supabase/client";
import { SurfaceCard } from "@codebay/ui";

type CommunityUserRow = Pick<Tables<"community_users">, "id" | "name" | "username" | "user_type"> & {
  featured_on_community_landing: boolean;
};

export function FeaturedProfilesManager() {
  const supabase = getCommunitySupabaseClient();
  const [profiles, setProfiles] = useState<CommunityUserRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    if (!supabase) {
      setIsLoading(false);
      return;
    }

    void (async () => {
      setIsLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from("community_users")
        .select("id,name,username,user_type,featured_on_community_landing")
        .order("created_at", { ascending: false })
        .limit(50);

      if (fetchError) {
        setError("Unable to load profiles.");
      } else {
        setProfiles(((data ?? []) as unknown) as CommunityUserRow[]);
      }

      setIsLoading(false);
    })();
  }, [supabase]);

  const handleToggle = async (profile: CommunityUserRow) => {
    if (!supabase) return;
    const nextValue = !profile.featured_on_community_landing;

    setUpdatingId(profile.id);
    setProfiles((prev) =>
      prev.map((p) =>
        p.id === profile.id ? { ...p, featured_on_community_landing: nextValue } : p
      )
    );

    const { error: updateError } = await supabase
      .from("community_users")
      .update({ featured_on_community_landing: nextValue } as any)
      .eq("id", profile.id);

    setUpdatingId(null);

    if (updateError) {
      setError("Unable to update featured flag. Reverting.");
      setProfiles((prev) =>
        prev.map((p) =>
          p.id === profile.id
            ? { ...p, featured_on_community_landing: profile.featured_on_community_landing }
            : p
        )
      );
    }
  };

  return (
    <SurfaceCard variant="subtle">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h2 className="text-sm font-semibold text-foreground">Featured profiles</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Choose which community profiles appear in the Trending Profiles section.
          </p>
        </div>
      </div>

      {isLoading ? (
        <p className="mt-4 text-sm text-muted-foreground">Loading profiles…</p>
      ) : error ? (
        <p className="mt-4 text-sm text-destructive">{error}</p>
      ) : profiles.length === 0 ? (
        <p className="mt-4 text-sm text-muted-foreground">No profiles found.</p>
      ) : (
        <div className="mt-4 space-y-2">
          {profiles.map((profile) => (
            <div
              key={profile.id}
              className="flex items-center justify-between gap-3 border border-border/60 bg-card/40 px-3 py-2 text-sm"
            >
              <div className="min-w-0">
                <p className="truncate font-medium text-foreground">{profile.name}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">@{profile.username}</p>
              </div>
              <button
                type="button"
                onClick={() => void handleToggle(profile)}
                disabled={updatingId === profile.id}
                className="inline-flex shrink-0 items-center rounded-full border border-border/70 bg-background px-3 py-1 text-xs font-medium transition-colors hover:bg-secondary/70 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {profile.featured_on_community_landing ? "Featured" : "Not featured"}
              </button>
            </div>
          ))}
        </div>
      )}
    </SurfaceCard>
  );
}

