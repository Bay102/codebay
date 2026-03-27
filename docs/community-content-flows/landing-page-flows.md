## Community Landing Page Flows

This document describes how the Community landing page decides what to show for trending and personalized sections.

## Community Landing Page Sections

The Community landing page (`CommunityLandingPage`) composes the following server components:

- **Trending topics** - `TrendingTopicsSection`
- **Trending discussions** - `TrendingDiscussionsSection`
- **Profiles getting noticed** - `TrendingProfilesSection`
- **For you** - `ForYouSection`
- **Featured blog posts** - `FeaturedBlogPostsSection`

Each section encapsulates its own data-fetching logic and falls back to `null` when it has no content, so the landing page layout is resilient to empty states.

---

## Featured Blog Posts (Landing)

**Source:** `fetchFeaturedBlogPosts` in `apps/community/src/lib/landing.ts`.

- **Base query**
  - Reads from `blog_posts`:
    - Filters: `status = 'published'`
    - Ordering: `published_at DESC`
    - Limit: 64 rows (used as a candidate pool)
  - Joins author avatars via `community_users` when `author_id` is present.
  - Fetches per-slug engagement via `fetchEngagementCountsForSlugs` from:
    - `blog_post_views`
    - `blog_post_reactions`
    - `blog_post_comments` (only `is_approved = true`)

- **Admin-featured priority**
  - Rows where `featured_on_community_landing = true` are treated as **admin-curated**.
  - If there are at least `limit` admin-featured posts, those are returned directly (no scoring).

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
  - Final result is `adminFeatured` (if any) followed by the highest-scoring remaining posts, truncated to `limit`.

Effectively, **admin-featured posts always win**, and the rest are an engagement- and recency-weighted trending list.

---

## Trending Discussions

**Components and helpers:**

- `TrendingDiscussionsSection` (`apps/community/src/components/pages/community/TrendingDiscussionsSection.tsx`)
- `getDiscussionsWithCounts` (`apps/community/src/lib/discussions.ts`)

### Query and Aggregation

- `TrendingDiscussionsSection` calls:
  - `getDiscussionsWithCounts(supabase, { limit: 4, offset: 0, orderByTrend: true })`
- `getDiscussionsWithCounts`:
  - Base query on `discussions` with joined author info from `community_users`.
  - If no `authorId` is provided and `orderByTrend = true`, the function:
    - Fetches all selected discussion IDs.
    - Queries:
      - `discussion_views` for view counts.
      - `discussion_comments` for comment counts.
      - `discussion_reactions` for reaction counts.
    - Builds `DiscussionListItem` objects with `viewCount`, `commentCount`, and `reactionCount`.

### Trending Scoring

When `orderByTrend && !authorId`, an in-memory score is computed per item:

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

Discussions are sorted by `trendingScore` descending, then sliced to the requested `limit`. This yields a "hotness" style ranking that favors active and recent threads.

---

## Trending Profiles (Profiles Getting Noticed)

**Components and helpers:**

- `TrendingProfilesSection` (`apps/community/src/components/pages/community/TrendingProfilesSection.tsx`)
- `fetchTrendingProfiles` (`apps/community/src/lib/landing.ts`)

### Base Profile Selection

- `fetchTrendingProfiles(limit = 6)`:
  - Reads from `community_users`:
    - Fields: `id, name, username, avatar_url, bio, featured_on_community_landing, tech_stack, featured_blog_post_slugs`
    - Ordering: `created_at DESC`
    - Limit: 128 rows
  - Splits rows into:
    - `adminFeatured`: `featured_on_community_landing = true`
    - `remaining`: everyone else

### Blog Engagement-Based Scoring

- Fetches all `blog_posts` with:
  - Fields: `author_id, slug, title`
  - Filter: `status = 'published'`
- Derives:
  - `slugsByAuthor: author_id -> [slug]`
  - `postsBySlug: slug -> { slug, title }`
- Calls `fetchEngagementCountsForSlugs` for all unique slugs to compute per-post:
  - `views`, `reactions`, `comments`
- For each **non-admin-featured** profile:
  - Aggregate engagement across all of that author's posts:
    - Sum of `views`, `reactions`, `comments` over all slugs.
  - Compute `scoreEngagement(aggregate.views, aggregate.reactions, aggregate.comments)`.
  - Sort `remaining` by this score descending.

### Featured Articles and Final Ordering

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

### Tag Extraction and Aggregation

- `fetchTrendingTopics(limit = 10)`:
  - Reads from `blog_posts`:
    - Fields: `slug, tags`
    - Filter: `status = 'published'`
  - For each row:
    - Normalizes each tag (`trim()`, ignore empty).
    - Maintains `allTags: Map<tag, { postCount, slugs[] }>`:
      - `postCount` = number of posts that include the tag.
      - `slugs` = all associated post slugs.

### Engagement-Aware Tag Scoring

- Calls `fetchEngagementCountsForSlugs` across all unique slugs.
- For each tag entry:
  - Aggregate engagement across the tag's slugs.
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

### Eligibility and Empty States

- If no `userId` is available on the landing page:
  - `ForYouSection` renders a card prompting the user to **sign in** and configure preferred topics in `/settings`.
- If the user is logged in but their preferences produce no matching posts/discussions:
  - `ForYouSection` renders a card explaining that they need to **choose topics** in profile settings.

### User Preference Model

- Preferences are stored as:
  - `user_preferred_tags`: rows linking `user_id` to `tag_id`.
  - `tags`: master table containing tag names.
- At runtime:
  - `user_preferred_tags` is queried for the current `userId`.
  - Corresponding rows in `tags` are resolved to an array of tag names.
  - If either list is empty, the "For you" queries bail out early (no results).

### For You - Blog Posts

**Function:** `fetchForYouBlogPosts(supabase, userId, limit = 6)`

- Reads `user_preferred_tags` and `tags` to obtain preferred tag names.
- Queries `blog_posts`:
  - Filters:
    - `status = 'published'`
    - `overlaps("tags", preferredTagNames)` - post tags must overlap with the user's preferred tags.
  - Ordering: `published_at DESC`
  - Limit: `limit`
- Fetches engagement via `fetchEngagementCountsForSlugs` for the resulting slugs.
- Maps to `LandingFeaturedPost` via `mapPostRowToLandingPost`.

On the landing page:

- `ForYouSection` limits blog posts to 4 items for display:
  - `fetchForYouBlogPosts(supabase, userId, 4)`
  - Renders `BlogPostCard` instances with author, date, engagement, and tags.

### For You - Discussions

**Function:** `fetchForYouDiscussions(supabase, userId, limit = 4)`

- Reads `user_preferred_tags` and `tags` to obtain preferred tag names (same mechanism as above).
- Queries `discussions`:
  - Filters:
    - `overlaps("tags", preferredTagNames)` - discussion tags must overlap with the user's preferred tags.
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
  - Renders `DiscussionCard` instances similar to the trending section but scoped to the user's tags.

### Managing Preferred Topics

- `ForYouSection` fetches:
  - `allowedTags` via `fetchAllTags`.
  - `preferredTagIds` via `getPreferredTagIdsAction`.
- The header renders `PreferredTopicsDialog`, which:
  - Lists followed tags (with remove) and a search field to find and add more from the catalog.
  - Persists updates back to `user_preferred_tags` (same behavior as `PreferredTopicsSection` on `/settings` and profile).

This gives a closed loop where:

- The user sets their preferred topics.
- The "For you" section queries posts and discussions with overlapping tags.
- Trending and featured sections remain global, while "For you" is **personalized by tags only** (no behavioral tracking).
