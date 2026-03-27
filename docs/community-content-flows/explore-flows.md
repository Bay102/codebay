## Explore Flows (`/explore`)

**Route:** `apps/community/src/app/explore/page.tsx`, with UI under `apps/community/src/components/pages/explore/` and URL/query helpers in `apps/community/src/lib/explore.ts`.

## Behavior

1. **Results list (default sort matches toolbar)** - If the URL includes any of `tag` (topic **name**, same as `/discussions` / `/blogs`), `author` (valid `community_users.id` UUID), `q` (search text), a `sort` query value (including explicit `sort=date` for **Recent**), **or** the viewer is signed in and not in the personalized branch below, the page shows a single **Results** list for the active content type (`type=discussions` by default, or `type=blogs`). Data comes from `getDiscussionsWithCounts` or `getBlogPostsForCommunityList` with `tagFilter`, `authorId`, `search`, and `exploreSort`. Blog posts are reordered after `fetchBlogEngagementCounts` via `sortBlogPostsForExplore`. With `exploreSort` **date** (the default when `sort` is omitted), discussions use newest-first (`created_at` desc), not trending.

2. **Signed in, personalized sections (opt-in)** - If the viewer is signed in, there are no scoped filters (`tag`, `author`, `q`), the effective sort is the default **date**, and the URL includes **`forYou=1`** (also accepted: `true`, `yes`, case-insensitive), the page shows two sections per type instead of one Results list:
   - **From people you follow:** `following_id` values from `user_follows` for the viewer are passed as `authorIds` to the list helpers (discussions: trending among those authors; blog: `published_at` descending).
   - **From topics you follow:** Preferred tag names (via `user_preferred_tags` -> `tags.name`) are passed as `anyOfTagNames`. Rows already shown in the first section are dropped so the second section does not duplicate them.

3. **Signed out, no scoped filters** - One list: trending discussions or latest blog posts, with messaging that sign-in unlocks follow- and topic-based sections.

## Shared List Query Extensions

- `getDiscussionsWithCounts` (`apps/community/src/lib/discussions.ts`): optional `authorIds` and `anyOfTagNames` (Postgres `overlaps` on `discussions.tags`). Empty `authorIds` with no `authorId` returns no rows.
- `getBlogPostsForCommunityList` (`apps/community/src/lib/blog.ts`): optional `authorId`, `authorIds`, and `anyOfTagNames` on `blog_posts.tags`. Same empty-array rule for `authorIds`.

The **Explore** toolbar (client) writes `type`, `tag`, `q`, and `sort` (`date` | `views` | `comments` | `engagements`). It does not set `forYou`; that flag is only for linking to the opt-in personalized layout. Legacy `author` in the URL is still honored for filtering when present; there is no author dropdown (search covers author names).

For discussions, `sort=views` now uses persisted thread views from `discussion_views` (not reactions as a proxy).
