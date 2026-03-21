"use server";

import type { Enums } from "@/lib/database";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export type NewsletterDigestFrequency = Enums<"newsletter_digest_frequency">;

export interface NewsletterSettingsState {
  frequency: NewsletterDigestFrequency;
  includeBlog: boolean;
  includeDiscussions: boolean;
  mutedFollowingIds: string[];
}

const NEWSLETTER_DEFAULT_SETTINGS: NewsletterSettingsState = {
  frequency: "weekly",
  includeBlog: true,
  includeDiscussions: true,
  mutedFollowingIds: []
};

const NEWSLETTER_FREQUENCIES: NewsletterDigestFrequency[] = ["none", "weekly", "biweekly", "monthly"];

function isNewsletterFrequency(value: string): value is NewsletterDigestFrequency {
  return NEWSLETTER_FREQUENCIES.includes(value as NewsletterDigestFrequency);
}

export async function getNewsletterSettingsAction(): Promise<NewsletterSettingsState> {
  const supabase = await createServerSupabaseClient();
  if (!supabase) return NEWSLETTER_DEFAULT_SETTINGS;

  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) return NEWSLETTER_DEFAULT_SETTINGS;

  const [{ data: settingsData }, { data: mutedData }] = await Promise.all([
    supabase
      .from("newsletter_settings")
      .select("frequency,include_blog,include_discussions")
      .eq("user_id", user.id)
      .maybeSingle(),
    supabase.from("newsletter_muted_follows").select("following_id").eq("subscriber_id", user.id)
  ]);

  return {
    frequency: settingsData?.frequency ?? NEWSLETTER_DEFAULT_SETTINGS.frequency,
    includeBlog: settingsData?.include_blog ?? NEWSLETTER_DEFAULT_SETTINGS.includeBlog,
    includeDiscussions: settingsData?.include_discussions ?? NEWSLETTER_DEFAULT_SETTINGS.includeDiscussions,
    mutedFollowingIds: (mutedData ?? []).map((row) => row.following_id)
  };
}

export async function setNewsletterSettingsAction(input: {
  frequency: string;
  includeBlog: boolean;
  includeDiscussions: boolean;
}): Promise<{ success: boolean; error?: string }> {
  const supabase = await createServerSupabaseClient();
  if (!supabase) return { success: false, error: "Not configured" };

  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not signed in" };

  if (!isNewsletterFrequency(input.frequency)) {
    return { success: false, error: "Invalid frequency value" };
  }

  const { error } = await supabase.from("newsletter_settings").upsert(
    {
      user_id: user.id,
      frequency: input.frequency,
      include_blog: input.includeBlog,
      include_discussions: input.includeDiscussions
    },
    { onConflict: "user_id" }
  );

  if (error) return { success: false, error: error.message };
  return { success: true };
}

export async function setNewsletterMutedFollowsAction(followingIds: string[]): Promise<{ success: boolean; error?: string }> {
  const supabase = await createServerSupabaseClient();
  if (!supabase) return { success: false, error: "Not configured" };

  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not signed in" };

  const deduped = [...new Set(followingIds)].filter(Boolean);

  if (deduped.length > 0) {
    const { data: followedRows, error: followsError } = await supabase
      .from("user_follows")
      .select("following_id")
      .eq("follower_id", user.id)
      .in("following_id", deduped);

    if (followsError) {
      return { success: false, error: followsError.message };
    }

    const followedIdSet = new Set((followedRows ?? []).map((row) => row.following_id));
    const sanitized = deduped.filter((id) => followedIdSet.has(id));

    const { error: deleteError } = await supabase.from("newsletter_muted_follows").delete().eq("subscriber_id", user.id);
    if (deleteError) {
      return { success: false, error: deleteError.message };
    }

    if (sanitized.length === 0) return { success: true };

    const { error: insertError } = await supabase
      .from("newsletter_muted_follows")
      .insert(sanitized.map((followingId) => ({ subscriber_id: user.id, following_id: followingId })));

    if (insertError) return { success: false, error: insertError.message };
    return { success: true };
  }

  const { error } = await supabase.from("newsletter_muted_follows").delete().eq("subscriber_id", user.id);
  if (error) return { success: false, error: error.message };
  return { success: true };
}
