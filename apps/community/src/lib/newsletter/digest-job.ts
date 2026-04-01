import { render } from "@react-email/render";
import { Resend } from "resend";
import { createClient } from "@supabase/supabase-js";
import type { Database, Enums } from "@/lib/database";
import { buildContentScoreSummary } from "@/lib/content-scoring";
import {
  fetchBlogEngagementCountsBySlugByPeriod,
  fetchDiscussionEngagementCountsByIdByPeriod
} from "@/lib/dashboard";
import {
  FollowedCreatorsDigestEmail,
  type DigestBlogItem,
  type DigestDiscussionItem
} from "@/components/emails/FollowedCreatorsDigestEmail";
import { createUnsubscribeToken } from "@/lib/newsletter/tokens";

type DigestFrequency = Enums<"newsletter_digest_frequency">;

type EffectiveSettings = {
  frequency: DigestFrequency;
  includeBlog: boolean;
  includeDiscussions: boolean;
  lastDigestSentAt: string | null;
};

type CommunityUser = {
  id: string;
  email: string;
  name: string;
  username: string;
};

type BlogEngagementCounts = { views: number; reactions: number; comments: number };

type DigestSummary = {
  usersChecked: number;
  usersEmailed: number;
  usersSkipped: number;
};

const DEFAULT_SETTINGS: EffectiveSettings = {
  frequency: "weekly",
  includeBlog: true,
  includeDiscussions: true,
  lastDigestSentAt: null
};

const frequencyToDays: Record<DigestFrequency, number> = {
  none: 0,
  weekly: 7,
  biweekly: 14,
  monthly: 30
};

function isDue(settings: EffectiveSettings, now: Date): boolean {
  const days = frequencyToDays[settings.frequency];
  if (days <= 0) return false;
  if (!settings.lastDigestSentAt) return true;
  const diffMs = now.getTime() - new Date(settings.lastDigestSentAt).getTime();
  return diffMs >= days * 24 * 60 * 60 * 1000;
}

function getPeriodKey(frequency: DigestFrequency, now: Date): string {
  const days = frequencyToDays[frequency];
  if (days <= 0) return `${frequency}-disabled`;
  const bucket = Math.floor(now.getTime() / (days * 24 * 60 * 60 * 1000));
  return `${frequency}-${bucket}`;
}

function getFrequencyLabel(frequency: DigestFrequency): string {
  if (frequency === "weekly") return "weekly";
  if (frequency === "biweekly") return "biweekly";
  if (frequency === "monthly") return "monthly";
  return "digest";
}

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function getServiceClient(): ReturnType<typeof createClient<Database>> {
  const supabaseUrl = requireEnv("NEXT_PUBLIC_SUPABASE_URL");
  const serviceRoleKey = requireEnv("SUPABASE_SERVICE_ROLE_KEY");
  return createClient<Database>(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false }
  });
}

function normalizeBaseUrl(baseUrl: string): string {
  return baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
}

async function fetchBlogEngagementBySlugs(
  supabase: ReturnType<typeof createClient<Database>>,
  slugs: string[]
): Promise<Record<string, BlogEngagementCounts>> {
  const result: Record<string, BlogEngagementCounts> = Object.fromEntries(
    slugs.map((slug) => [slug, { views: 0, reactions: 0, comments: 0 }])
  );
  if (slugs.length === 0) return result;

  const countRequests = slugs.flatMap((slug) => [
    supabase.from("blog_post_views").select("*", { count: "exact", head: true }).eq("slug", slug),
    supabase.from("blog_post_reactions").select("*", { count: "exact", head: true }).eq("slug", slug),
    supabase
      .from("blog_post_comments")
      .select("*", { count: "exact", head: true })
      .eq("slug", slug)
      .eq("is_approved", true)
  ]);

  const settled = await Promise.all(countRequests);
  const perSlug = 3;
  slugs.forEach((slug, index) => {
    const base = index * perSlug;
    result[slug] = {
      views: settled[base]?.count ?? 0,
      reactions: settled[base + 1]?.count ?? 0,
      comments: settled[base + 2]?.count ?? 0
    };
  });

  return result;
}

async function fetchDiscussionEngagementByIds(
  supabase: ReturnType<typeof createClient<Database>>,
  discussionIds: string[]
): Promise<{ commentById: Map<string, number>; reactionById: Map<string, number> }> {
  const commentById = new Map<string, number>();
  const reactionById = new Map<string, number>();
  if (discussionIds.length === 0) {
    return { commentById, reactionById };
  }

  const [commentCounts, reactionCounts] = await Promise.all([
    supabase.from("discussion_comments").select("discussion_id").in("discussion_id", discussionIds),
    supabase.from("discussion_reactions").select("discussion_id").in("discussion_id", discussionIds)
  ]);

  (commentCounts.data ?? []).forEach((r: { discussion_id: string }) => {
    commentById.set(r.discussion_id, (commentById.get(r.discussion_id) ?? 0) + 1);
  });
  (reactionCounts.data ?? []).forEach((r: { discussion_id: string }) => {
    reactionById.set(r.discussion_id, (reactionById.get(r.discussion_id) ?? 0) + 1);
  });

  return { commentById, reactionById };
}

async function fetchDigestItemsForUser(
  supabase: ReturnType<typeof createClient<Database>>,
  userId: string,
  includeBlog: boolean,
  includeDiscussions: boolean,
  windowStartIso: string,
  baseUrl: string
): Promise<{ blogItems: DigestBlogItem[]; discussionItems: DigestDiscussionItem[] }> {
  const [{ data: follows }, { data: mutedRows }] = await Promise.all([
    supabase.from("user_follows").select("following_id").eq("follower_id", userId),
    supabase.from("newsletter_muted_follows").select("following_id").eq("subscriber_id", userId)
  ]);

  const mutedSet = new Set((mutedRows ?? []).map((row) => row.following_id));
  const followingIds = (follows ?? []).map((row) => row.following_id).filter((id) => !mutedSet.has(id));
  if (followingIds.length === 0) {
    return { blogItems: [], discussionItems: [] };
  }

  const { data: authorRows } = await supabase
    .from("community_users")
    .select("id,name,username,avatar_url")
    .in("id", followingIds);

  const authorById = new Map((authorRows ?? []).map((row) => [row.id, row]));
  const blogItems: DigestBlogItem[] = [];
  const discussionItems: DigestDiscussionItem[] = [];

  if (includeBlog) {
    const { data: blogRows } = await supabase
      .from("blog_posts")
      .select("author_id,slug,title,published_at,created_at")
      .eq("status", "published")
      .in("author_id", followingIds)
      .gte("created_at", windowStartIso)
      .order("created_at", { ascending: false })
      .limit(30);

    const blogSlugList = (blogRows ?? []).map((row) => row.slug);
    const engagementBySlug = await fetchBlogEngagementBySlugs(supabase, blogSlugList);
    const engagementBySlugByPeriod = await fetchBlogEngagementCountsBySlugByPeriod(
      supabase,
      blogSlugList,
      ["7d"]
    );

    (blogRows ?? []).forEach((row) => {
      if (!row.author_id) return;
      const author = authorById.get(row.author_id);
      if (!author) return;
      const counts = engagementBySlug[row.slug] ?? { views: 0, reactions: 0, comments: 0 };
      const periodCounts = engagementBySlugByPeriod[row.slug]?.["7d"] ?? {
        views: 0,
        reactions: 0,
        comments: 0
      };
      const momentumSummary = buildContentScoreSummary({
        mode: "hot",
        period: "7d",
        metrics: {
          views: periodCounts.views,
          reactions: periodCounts.reactions,
          comments: periodCounts.comments
        },
        publishedAt: row.published_at ?? row.created_at
      });
      const impactSummary = buildContentScoreSummary({
        mode: "quality",
        period: "7d",
        metrics: {
          views: periodCounts.views,
          reactions: periodCounts.reactions,
          comments: periodCounts.comments
        },
        publishedAt: row.published_at ?? row.created_at
      });
      blogItems.push({
        title: row.title,
        url: `${baseUrl}/blog/${encodeURIComponent(author.username)}/${encodeURIComponent(row.slug)}`,
        authorName: author.name,
        authorAvatarUrl: author.avatar_url,
        publishedAt: row.published_at ?? row.created_at,
        viewCount: counts.views,
        reactionCount: counts.reactions,
        commentCount: counts.comments,
        momentumScore7d: momentumSummary.score,
        impactScore7d: impactSummary.score
      });
    });
  }

  if (includeDiscussions) {
    const { data: discussionRows } = await supabase
      .from("discussions")
      .select("id,author_id,slug,title,created_at")
      .in("author_id", followingIds)
      .gte("created_at", windowStartIso)
      .order("created_at", { ascending: false })
      .limit(30);

    const discussionIds = (discussionRows ?? []).map((row) => row.id);
    const { commentById, reactionById } = await fetchDiscussionEngagementByIds(supabase, discussionIds);
    const engagementByIdByPeriod = await fetchDiscussionEngagementCountsByIdByPeriod(
      supabase,
      discussionIds,
      ["7d"]
    );

    (discussionRows ?? []).forEach((row) => {
      const author = authorById.get(row.author_id);
      if (!author) return;
      const periodCounts = engagementByIdByPeriod[row.id]?.["7d"] ?? {
        views: 0,
        reactions: 0,
        comments: 0
      };
      const momentumSummary = buildContentScoreSummary({
        mode: "hot",
        period: "7d",
        metrics: {
          views: periodCounts.views,
          reactions: periodCounts.reactions,
          comments: periodCounts.comments
        },
        publishedAt: row.created_at
      });
      const impactSummary = buildContentScoreSummary({
        mode: "quality",
        period: "7d",
        metrics: {
          views: periodCounts.views,
          reactions: periodCounts.reactions,
          comments: periodCounts.comments
        },
        publishedAt: row.created_at
      });
      discussionItems.push({
        title: row.title,
        url: `${baseUrl}/discussions/${encodeURIComponent(row.slug)}`,
        authorName: author.name,
        authorAvatarUrl: author.avatar_url,
        createdAt: row.created_at,
        commentCount: commentById.get(row.id) ?? 0,
        reactionCount: reactionById.get(row.id) ?? 0,
        momentumScore7d: momentumSummary.score,
        impactScore7d: impactSummary.score
      });
    });
  }

  return { blogItems, discussionItems };
}

export async function runNewsletterDigestJob(input: { baseUrl: string; userLimit?: number }): Promise<DigestSummary> {
  const baseUrl = normalizeBaseUrl(input.baseUrl);
  const now = new Date();
  const resend = new Resend(requireEnv("RESEND_API_KEY"));
  const fromEmail = requireEnv("RESEND_FROM_EMAIL");
  const unsubscribeSecret = process.env.NEWSLETTER_UNSUBSCRIBE_SECRET ?? requireEnv("CRON_SECRET");
  const supabase = getServiceClient();
  const userLimit = input.userLimit ?? 200;

  const [{ data: users }, { data: settingsRows }] = await Promise.all([
    supabase
      .from("community_users")
      .select("id,email,name,username")
      .order("created_at", { ascending: false })
      .limit(userLimit),
    supabase
      .from("newsletter_settings")
      .select("user_id,frequency,include_blog,include_discussions,last_digest_sent_at")
      .limit(userLimit * 2)
  ]);

  const settingsByUser = new Map(
    (settingsRows ?? []).map((row) => [
      row.user_id,
      {
        frequency: row.frequency,
        includeBlog: row.include_blog,
        includeDiscussions: row.include_discussions,
        lastDigestSentAt: row.last_digest_sent_at
      } satisfies EffectiveSettings
    ])
  );

  let usersEmailed = 0;
  let usersSkipped = 0;
  const candidates = (users ?? []) as CommunityUser[];

  for (const user of candidates) {
    const settings = settingsByUser.get(user.id) ?? DEFAULT_SETTINGS;
    if (settings.frequency === "none" || !isDue(settings, now)) {
      usersSkipped += 1;
      continue;
    }

    const days = frequencyToDays[settings.frequency];
    const windowStartIso = new Date(now.getTime() - days * 24 * 60 * 60 * 1000).toISOString();
    const { blogItems, discussionItems } = await fetchDigestItemsForUser(
      supabase,
      user.id,
      settings.includeBlog,
      settings.includeDiscussions,
      windowStartIso,
      baseUrl
    );

    const contentCount = blogItems.length + discussionItems.length;
    if (contentCount === 0) {
      usersSkipped += 1;
      continue;
    }

    const periodKey = getPeriodKey(settings.frequency, now);
    const { error: logInsertError } = await supabase.from("newsletter_send_log").insert({
      user_id: user.id,
      frequency: settings.frequency,
      period_key: periodKey,
      content_count: contentCount
    });

    if (logInsertError) {
      usersSkipped += 1;
      continue;
    }

    const token = createUnsubscribeToken(user.id, unsubscribeSecret);
    const unsubscribeUrl = `${baseUrl}/newsletter/unsubscribe?token=${encodeURIComponent(token)}`;
    const managePreferencesUrl = `${baseUrl}/settings`;
    const html = await render(
      FollowedCreatorsDigestEmail({
        recipientName: user.name || user.username || "there",
        frequencyLabel: getFrequencyLabel(settings.frequency),
        blogItems,
        discussionItems,
        siteUrl: baseUrl,
        managePreferencesUrl,
        unsubscribeUrl
      })
    );

    const sendResult = await resend.emails.send({
      from: fromEmail,
      to: user.email,
      subject: `Your ${getFrequencyLabel(settings.frequency)} CodeBay digest`,
      html
    });

    if (sendResult.error) {
      await supabase
        .from("newsletter_send_log")
        .delete()
        .eq("user_id", user.id)
        .eq("frequency", settings.frequency)
        .eq("period_key", periodKey);
      usersSkipped += 1;
      continue;
    }

    await Promise.all([
      supabase
        .from("newsletter_send_log")
        .update({ provider_message_id: sendResult.data?.id ?? null, sent_at: now.toISOString() })
        .eq("user_id", user.id)
        .eq("frequency", settings.frequency)
        .eq("period_key", periodKey),
      supabase
        .from("newsletter_settings")
        .upsert(
          {
            user_id: user.id,
            frequency: settings.frequency,
            include_blog: settings.includeBlog,
            include_discussions: settings.includeDiscussions,
            last_digest_sent_at: now.toISOString()
          },
          { onConflict: "user_id" }
        )
    ]);

    usersEmailed += 1;
  }

  return {
    usersChecked: candidates.length,
    usersEmailed,
    usersSkipped
  };
}
