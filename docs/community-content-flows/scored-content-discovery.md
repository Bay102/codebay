## Scored Content Discovery (Home + Explore + Dashboard)

The Community app supports a shared **score-driven ranking mode** for both discussions and blog posts.

## Score Model

Shared logic lives in `apps/community/src/lib/content-scoring.ts` and defines:

- `ScoreMode`: `hot` | `quality`  
- `ScorePeriod`: `24h` | `7d` | `30d` | `365d`

User-facing labels:

- `hot` is displayed as **Momentum**
- `quality` is displayed as **Impact**

Scoring behavior:

- **Momentum (`hot`)** favors recent engagement with stronger time decay.
- **Impact (`quality`)** favors sustained engagement and applies confidence scaling.

## Explore Query Params

Explore supports optional score params in addition to existing filter/sort params:

- `score`: `hot` or `quality`
- `period`: `24h`, `7d`, `30d`, or `365d`

When these are omitted on routes that support scoring (Home, Explore default feed, `/discussions`, `/blogs`), the app uses **`quality` (Impact)** and **`7d`**—see `DEFAULT_SCORE_MODE` / `DEFAULT_SCORE_PERIOD` in `apps/community/src/lib/content-scoring.ts`.

When the default Explore feed is shown (no `forYou`, and no scoped filters `tag`, `author`, `q`, and no explicit `sort`), Explore renders a score-ranked section (`ScoredContentSection`) for the selected content type using the current `score` / `period` (including the defaults above when params are omitted).

## Home Score Controls

The landing page includes a score control surface (`ContentScoreSwitcher`) and a scored list section (`ScoredContentSection`) so users can switch between:

- discussions vs blog posts
- Momentum vs Impact (defaults to Impact on first visit)
- 24h / 7d / 30d / 365d windows (defaults to 7 days)

## Card-Level Score UI

Discussion and blog cards can display a compact score marker + sparkline via card slots.  
The marker now uses icon-led mode affordances:

- **Momentum** uses a flame icon
- **Impact** uses a target icon

The card marker keeps period context (`24H`, `7D`, `30D`, `1Y`) plus a sparkline.

In `ScoredContentSection`, blog post cards show **views / reactions / comments for the same window as the score** (from `scoreSummary.metrics`), not all-time totals—so Momentum over `24h` matches the engagement numbers on the card.

## Dashboard Score Columns + Window Toggle

Dashboard blog/discussion tables render **both Momentum and Impact columns** using shared score marker UI:

- `apps/community/src/components/pages/dashboard/DashboardBlogPostsTable.tsx`
- `apps/community/src/components/pages/dashboard/DashboardDiscussionsTable.tsx`

Dashboard engagement window options:

- `24H`, `7D`, `30D`, `90D`, `6M`

Dashboard row-level score markers now use period-scoped engagement counts for the selected window, so toggling the window updates both KPI cards and per-row Momentum/Impact values.

For score-marker period labels and score periods in tables:

- `24H` maps directly to score period `24h`
- `7D` maps to `7d`
- `30D` and `90D` map to score period `30d`
- `6M` maps to score period `365d`

This keeps dashboard KPI windows and score badges aligned while still using currently-supported core score periods for score summary labels and decay behavior.

## Dashboard Profile Recent Activity

Profile recent activity cards include compact Momentum/Impact mini-badges and a local period selector.

- Component: `apps/community/src/components/pages/dashboard/ProfileRecentActivitySection.tsx`
- Window options: `7D`, `30D`, `90D`, `6M`
- Behavior: selected window filters list items by `createdAt`, then recalculates score summaries for displayed items.

To *optionally* support persisted sparkline **series** (time-bucket history), content tables include JSONB graph-point columns:

- `blog_posts.momentum_graph_points`
- `blog_posts.impact_graph_points`
- `discussions.momentum_graph_points`
- `discussions.impact_graph_points`

**You do not need to populate these columns for scoring or for basic sparkline UI.** Momentum and Impact **numbers** are computed on demand from period-scoped engagement (views / reactions / comments) via `content-scoring.ts`. Mini-graphs can use a score-derived fallback when arrays are empty, near-flat, or unused. Populate `*_graph_points` only when you want **real** stored point history—for example durable trend lines, analytics, exports, or sparklines that should not depend on the current formula or client fallback behavior.

Added in migration:

- `supabase/migrations/20260327143000_add_content_score_graph_columns.sql`

## Index Support

Migration `supabase/migrations/20260327120000_add_scoring_indexes.sql` adds score-window indexes keyed by content id/slug plus `created_at` to support period-constrained metric queries efficiently.
