## Community Content Flows

This document describes how the Community landing page decides which content to show, how trending is computed, how "For you" content is selected, and how the **followed-creators email digest** is built and sent. The logic referenced here lives primarily in `apps/community/src/app/page.tsx`, `apps/community/src/lib/landing.ts`, `apps/community/src/lib/discussions.ts`, and (for the newsletter) `apps/community/src/lib/newsletter/digest-job.ts` plus related route handlers and profile UI.

---

## Community Landing Page Sections

The Community landing page (`CommunityLandingPage`) composes the following server components:

- **Trending topics** – `TrendingTopicsSection`
- **Trending discussions** – `TrendingDiscussionsSection`
- **Profiles getting noticed** – `TrendingProfilesSection`
- **For you** – `ForYouSection`
- **Featured blog posts** – `FeaturedBlogPostsSection`

Each section encapsulates its own data‑fetching logic and falls back to `null` when it has no content, so the landing page layout is resilient to empty states.

---

## Featured Blog Posts (Landing)

**Source:** `fetchFeaturedBlogPosts` in `apps/community/src/lib/landing.ts`.

- **Base query**
  - Reads from `blog_posts`:
    - Filters: `status = 'published'`
    - Ordering: `published_at DESC`
    - Limit: 64 rows (used as a candidate pool)
  - Joins author avatars via `community_users` when `author_id` is present.
  - Fetches per‑slug engagement via `fetchEngagementCountsForSlugs` from:
    - `blog_post_views`
    - `blog_post_reactions`
    - `blog_post_comments` (only `is_approved = true`)

- **Admin‑featured priority**
  - Rows where `featured_on_community_landing = true` are treated as **admin‑curated**.
  - If there are at least `limit` admin‑featured posts, those are returned directly (no scoring).

- **Automatic trending scoring for remaining posts**
  - Remaining candidates (`featured_on_community_landing = false`) are scored by:
    - `scoreEngagement(views, reactions, comments)` where  
      `scoreEngagement = views + 2 * reactions + 3 * comments`.
    - A **time decay** factor is applied so newer posts with similar engagement rank higher:
      - Compute age in days from `published_at`.
      - Apply:  
      \[
      \text{finalScore} = \frac{\text{rawScore}}{(1 + \text{ageDays})^{1.5}}
      \]
  - Posts are sorted by this decayed engagement score (descending).
  - Final result is `adminFeatured` (if any) followed by the highest‑scoring remaining posts, truncated to `limit`.

Effectively, **admin‑featured posts always win**, and the rest are an engagement‑ and recency‑weighted trending list.

---

## Trending Discussions

**Components and helpers:**

- `TrendingDiscussionsSection` (`apps/community/src/components/pages/community/TrendingDiscussionsSection.tsx`)
- `getDiscussionsWithCounts` (`apps/community/src/lib/discussions.ts`)

### Query and aggregation

- `TrendingDiscussionsSection` calls:
  - `getDiscussionsWithCounts(supabase, { limit: 4, offset: 0, orderByTrend: true })`
- `getDiscussionsWithCounts`:
  - Base query on `discussions` with joined author info from `community_users`.
  - If no `authorId` is provided and `orderByTrend = true`, the function:
    - Fetches all selected discussion IDs.
    - Queries:
      - `discussion_comments` for comment counts.
      - `discussion_reactions` for reaction counts.
    - Builds `DiscussionListItem` objects with `commentCount` and `reactionCount`.

### Trending scoring

When `orderByTrend && !authorId`, an in‑memory score is computed per item:

- Let:
  - `ageDays` = days since `created_at`
  - `commentWeight = 3`
  - `reactionWeight = 1.5`
  - `base = 1`
- **Raw engagement:**
  \[
  \text{rawEngagement} = 3 \cdot \text{commentCount} + 1.5 \cdot \text{reactionCount} + 1
  \]

- **Time decay:**
  \[
  \text{trendingScore} = \frac{\text{rawEngagement}}{(1 + \text{ageDays})^{1.5}}
  \]

Discussions are sorted by `trendingScore` descending, then sliced to the requested `limit`. This yields a **“hotness” style** ranking that favors active and recent threads.

---

## Trending Profiles (Profiles Getting Noticed)

**Components and helpers:**

- `TrendingProfilesSection` (`apps/community/src/components/pages/community/TrendingProfilesSection.tsx`)
- `fetchTrendingProfiles` (`apps/community/src/lib/landing.ts`)

### Base profile selection

- `fetchTrendingProfiles(limit = 6)`:
  - Reads from `community_users`:
    - Fields: `id, name, username, avatar_url, bio, featured_on_community_landing, tech_stack, featured_blog_post_slugs`
    - Ordering: `created_at DESC`
    - Limit: 128 rows
  - Splits rows into:
    - `adminFeatured`: `featured_on_community_landing = true`
    - `remaining`: everyone else

### Blog engagement‑based scoring

- Fetches all `blog_posts` with:
  - Fields: `author_id, slug, title`
  - Filter: `status = 'published'`
- Derives:
  - `slugsByAuthor: author_id -> [slug]`
  - `postsBySlug: slug -> { slug, title }`
- Calls `fetchEngagementCountsForSlugs` for all unique slugs to compute per‑post:
  - `views`, `reactions`, `comments`
- For each **non‑admin‑featured** profile:
  - Aggregate engagement across all of that author’s posts:
    - Sum of `views`, `reactions`, `comments` over all slugs.
  - Compute `scoreEngagement(aggregate.views, aggregate.reactions, aggregate.comments)`.
  - Sort `remaining` by this score descending.

### Featured articles and final ordering

- For each profile, `buildFeaturedArticlesForProfile`:
  - Uses `featured_blog_post_slugs` on the profile.
  - Converts each slug to a `{ title, href }` pair using `buildPostUrl(profile.name, slug)`.
  - Truncates to at most 4 featured articles.

- Final profile list:
  - `[...adminFeatured, ...scoredRemainingProfiles]` sliced to `limit`.
  - Mapped to `LandingProfile` including `techStack` and `featuredArticles`.

`TrendingProfilesSection` then enriches each `LandingProfile` with a dynamic `followerCount` via `getFollowStatsForProfile` and renders `TrendingProfileCard` instances.

---

## Trending Topics

**Components and helpers:**

- `TrendingTopicsSection` (`apps/community/src/components/pages/community/TrendingTopicsSection.tsx`)
- `fetchTrendingTopics` (`apps/community/src/lib/landing.ts`)

### Tag extraction and aggregation

- `fetchTrendingTopics(limit = 10)`:
  - Reads from `blog_posts`:
    - Fields: `slug, tags`
    - Filter: `status = 'published'`
  - For each row:
    - Normalizes each tag (`trim()`, ignore empty).
    - Maintains `allTags: Map<tag, { postCount, slugs[] }>`:
      - `postCount` = number of posts that include the tag.
      - `slugs` = all associated post slugs.

### Engagement‑aware tag scoring

- Calls `fetchEngagementCountsForSlugs` across all unique slugs.
- For each tag entry:
  - Aggregate engagement across the tag’s slugs.
  - Compute:
    \[
    \text{score} = \text{scoreEngagement(aggregate.views, aggregate.reactions, aggregate.comments)} + \text{postCount}
    \]
- Sort tags by `score` descending.
- Return the top `limit` as `LandingTopic[]` with:
  - `tag`
  - `postCount`

`TrendingTopicsSection` then renders each topic as a pill linking to the blog index filtered by `?tag=<tag>`.

---

## "For You" Posts and Discussions

**Components and helpers:**

- `ForYouSection` (`apps/community/src/components/pages/community/ForYouSection.tsx`)
- `fetchForYouBlogPosts` and `fetchForYouDiscussions` (`apps/community/src/lib/landing.ts`)
- `PreferredTopicsDialog` and tag helpers:
  - `fetchAllTags` (`apps/community/src/lib/tags.ts`)
  - `getPreferredTagIdsAction` (`apps/community/src/lib/actions.ts`)

### Eligibility and empty states

- If no `userId` is available on the landing page:
  - `ForYouSection` renders a card prompting the user to **sign in** and configure preferred topics in `/dashboard/profile`.
- If the user is logged in but their preferences produce no matching posts/discussions:
  - `ForYouSection` renders a card explaining that they need to **choose topics** in profile settings.

### User preference model

- Preferences are stored as:
  - `user_preferred_tags`: rows linking `user_id` to `tag_id`.
  - `tags`: master table containing tag names.
- At runtime:
  - `user_preferred_tags` is queried for the current `userId`.
  - Corresponding rows in `tags` are resolved to an array of tag names.
  - If either list is empty, the "For you" queries bail out early (no results).

### For You – Blog posts

**Function:** `fetchForYouBlogPosts(supabase, userId, limit = 6)`

- Reads `user_preferred_tags` and `tags` to obtain preferred tag names.
- Queries `blog_posts`:
  - Filters:
    - `status = 'published'`
    - `overlaps("tags", preferredTagNames)` – post tags must overlap with the user’s preferred tags.
  - Ordering: `published_at DESC`
  - Limit: `limit`
- Fetches engagement via `fetchEngagementCountsForSlugs` for the resulting slugs.
- Maps to `LandingFeaturedPost` via `mapPostRowToLandingPost`.

On the landing page:

- `ForYouSection` limits blog posts to 4 items for display:
  - `fetchForYouBlogPosts(supabase, userId, 4)`
  - Renders `BlogPostCard` instances with author, date, engagement, and tags.

### For You – Discussions

**Function:** `fetchForYouDiscussions(supabase, userId, limit = 4)`

- Reads `user_preferred_tags` and `tags` to obtain preferred tag names (same mechanism as above).
- Queries `discussions`:
  - Filters:
    - `overlaps("tags", preferredTagNames)` – discussion tags must overlap with the user’s preferred tags.
  - Ordering: `created_at DESC`
  - Limit: `limit`
  - Includes author info via `community_users!discussions_author_id_fkey(name,username)`.
- For the resulting discussion IDs:
  - Counts comments via `discussion_comments`.
  - Counts reactions via `discussion_reactions`.
- Returns a typed `ForYouDiscussion[]` structure with:
  - Metadata (title, slug, createdAt, tags).
  - Engagement counts (comments and reactions).

On the landing page:

- `ForYouSection` limits discussions to 4 items:
  - `fetchForYouDiscussions(supabase, userId, 4)`
  - Renders `DiscussionCard` instances similar to the trending section but scoped to the user’s tags.

### Managing preferred topics

- `ForYouSection` fetches:
  - `allowedTags` via `fetchAllTags`.
  - `preferredTagIds` via `getPreferredTagIdsAction`.
- The header renders `PreferredTopicsDialog`, which:
  - Shows all allowed tags.
  - Allows the user to adjust which tags they follow.
  - Persists updates back to `user_preferred_tags`.

This gives a closed loop where:

- The user sets their preferred topics.
- The "For you" section queries posts and discussions with overlapping tags.
- Trending and featured sections remain global, while "For you" is **personalized by tags only** (no behavioral tracking).

---

## Followed Creators Newsletter Digest

The Community app can email subscribers a digest of **new blog posts and discussions** from people they **follow**, with per-user frequency, content toggles, and optional **mute** rules for specific followed accounts.

### User-facing flow

- **Where to configure:** `/dashboard/profile` — the **Newsletter** block (`NewsletterPreferencesSection`) lets signed-in users set:
  - **Frequency:** `none`, `weekly`, `biweekly`, or `monthly` (stored enum `newsletter_digest_frequency`).
  - **Include blog** / **Include discussions:** booleans (`include_blog`, `include_discussions`); defaults match in-app defaults when no row exists yet (`weekly`, both on).
  - **Muted follows:** users they still follow but whose content should **not** appear in the digest (rows in `newsletter_muted_follows`).
- **Server actions:** `getNewsletterSettingsAction`, `setNewsletterSettingsAction`, and `setNewsletterMutedFollowsAction` in `apps/community/src/lib/newsletter.ts` read/write these preferences under the authenticated user. Mutes are validated so only real `user_follows` pairs for the subscriber can be stored.
- **Unsubscribe from email:** the digest footer includes a signed link to `GET /newsletter/unsubscribe?token=…`, which verifies the token and upserts `newsletter_settings` with `frequency = 'none'` for that user (`apps/community/src/app/newsletter/unsubscribe/route.ts`). Manage-preferences links point at `/dashboard/profile`.
- **Email content:** React Email template `FollowedCreatorsDigestEmail` (`apps/community/src/components/emails/FollowedCreatorsDigestEmail.tsx`), rendered to HTML via `@react-email/render` and sent with **Resend**.

### Data model (Supabase)

Defined in `supabase/migrations/20260321120000_add_newsletter_digest_tables.sql` (and reflected in generated DB types):

- **`newsletter_settings`** — one row per `community_users.id`: `frequency`, `include_blog`, `include_discussions`, `last_digest_sent_at` (updated after a successful send).
- **`newsletter_muted_follows`** — `(subscriber_id, following_id)` with a foreign key to `user_follows` so mutes only apply to relationships that actually exist.
- **`newsletter_send_log`** — idempotency and traceability: unique on `(user_id, frequency, period_key)`; stores `content_count`, optional `provider_message_id`, `sent_at`.

RLS restricts reads/writes on settings and mutes to the owning user; the digest **job** uses the **service role** client and bypasses RLS for batch processing.

### When does an email actually send?

**Cron trigger:** root `vercel.json` schedules `GET` to `/api/cron/newsletter` **daily at 13:00 UTC** (`0 13 * * *`). Vercel Cron invokes that path on the deployed app; the handler also accepts `POST` for manual runs.

**Route security:** `apps/community/src/app/api/cron/newsletter/route.ts` requires `process.env.CRON_SECRET` or `process.env.VERCEL_CRON_SECRET` to be set, and the request must send that value as either `Authorization: Bearer <secret>` or header `x-cron-secret: <secret>`. Optional query `?limit=<n>` caps how many **users** are scanned (default **200** in `runNewsletterDigestJob`).

**Per-user eligibility** (`runNewsletterDigestJob` in `apps/community/src/lib/newsletter/digest-job.ts`):

1. Load up to `limit` users from `community_users` (newest by `created_at`) and merge `newsletter_settings` when present.
2. **Skip** if `frequency = 'none'` or if not **due:** due means no `last_digest_sent_at`, or elapsed time ≥ **7 / 14 / 30 days** for weekly / biweekly / monthly respectively.
3. Build digest items only for **followed** authors not in `newsletter_muted_follows`. If both content types are off (or the user follows nobody un-muted), the digest is empty.
4. **Content time window:** posts and discussions use `created_at >= now - (7|14|30 days)` matching the user’s frequency (same day counts as the cadence).
5. **Blog:** `blog_posts` with `status = 'published'`, `author_id` in the allowed follow set, up to **30** rows ordered by `created_at` desc. Links use `baseUrl/blog/<username>/<slug>`.
6. **Discussions:** `discussions` with `author_id` in the allowed set, same window and limit; links use `baseUrl/discussions/<slug>`.
7. **Skip send** if there are **zero** items after filters (user is counted as skipped; no email).
8. **Idempotency:** insert a row into `newsletter_send_log` with a **period key** derived from frequency and a time bucket. If the insert fails (duplicate for that user/frequency/period), the user is skipped.
9. On **Resend success:** update the log row with `provider_message_id` and upsert `newsletter_settings` including `last_digest_sent_at = now`. On Resend failure, the log row for that period is deleted so a later run can retry.

**Base URL for links** in emails: `NEXT_PUBLIC_SITE_URL` if set, otherwise derived from the incoming cron request URL.

### Operations: environment variables

| Variable | Role |
|----------|------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL (job + unsubscribe use it with service role). |
| `SUPABASE_SERVICE_ROLE_KEY` | **Required** for the digest job and unsubscribe handler (server-only; never `NEXT_PUBLIC_`). |
| `RESEND_API_KEY` | Resend API key. |
| `RESEND_FROM_EMAIL` | Verified sender address in Resend (e.g. `newsletter@yourdomain`). |
| `CRON_SECRET` or `VERCEL_CRON_SECRET` | Shared secret for `/api/cron/newsletter`; also used to sign unsubscribe tokens if `NEWSLETTER_UNSUBSCRIBE_SECRET` is omitted. |
| `NEWSLETTER_UNSUBSCRIBE_SECRET` | Optional dedicated secret for unsubscribe links (otherwise falls back to cron secret). |
| `NEXT_PUBLIC_SITE_URL` | Optional canonical site origin for links in emails. |

If `SUPABASE_SERVICE_ROLE_KEY` (or other required vars) are missing, the cron route returns **500** with an error message from the job.

### Local / staging testing

- Set all required env vars in `apps/community/.env` (or the deployment environment).
- Call the cron endpoint manually, for example:  
  `curl -H "Authorization: Bearer $CRON_SECRET" "http://localhost:3002/api/cron/newsletter"`  
  (adjust host/port to your dev server).
- Expect `usersEmailed: 0` if no user is due, has no eligible follows, has everything muted, or has no content in the window — that is normal.
- Use `?limit=5` to keep test runs small.

**Monorepo note:** `vercel.json` lives at the **repository root**. Cron paths apply to whichever Vercel project uses that config as its deployment root; if the Community app is deployed with a different root, configure an equivalent scheduled request to `/api/cron/newsletter` there.

