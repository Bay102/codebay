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

If both params are present and no scoped filters (`tag`, `author`, `q`) are set, Explore renders a score-ranked section (`ScoredContentSection`) for the selected content type.

## Home Score Controls

The landing page includes a score control surface (`ContentScoreSwitcher`) and a scored list section (`ScoredContentSection`) so users can switch between:

- discussions vs blog posts
- hot vs quality
- 24h / 7d / 30d / 365d windows

## Card-Level Score UI

Discussion and blog cards can display a compact score marker + sparkline via card slots.  
The marker now uses icon-led mode affordances:

- **Momentum** uses a flame icon
- **Impact** uses a target icon

The card marker keeps period context (`24H`, `7D`, `30D`, `1Y`) plus a sparkline.

## Dashboard Score Columns + Window Toggle

Dashboard blog/discussion tables render **both Momentum and Impact columns** using shared score marker UI:

- `apps/community/src/components/pages/dashboard/DashboardBlogPostsTable.tsx`
- `apps/community/src/components/pages/dashboard/DashboardDiscussionsTable.tsx`

Dashboard engagement window options:

- `24H`, `7D`, `30D`, `90D`, `6M`

For score-marker period labels in tables:

- `24H` maps directly to score period `24h`
- `7D` maps to `7d`
- `30D` and `90D` currently map to score period `30d`
- `6M` currently maps to score period `365d`

This keeps dashboard KPI windows and score badges visually aligned while using currently-supported core score periods.

## Dashboard Profile Recent Activity

Profile recent activity cards include compact Momentum/Impact mini-badges and a local period selector.

- Component: `apps/community/src/components/pages/dashboard/ProfileRecentActivitySection.tsx`
- Window options: `7D`, `30D`, `90D`, `6M`
- Behavior: selected window filters list items by `createdAt`, then recalculates score summaries for displayed items.

To support persisted sparkline data, content tables include JSONB graph-point columns:

- `blog_posts.momentum_graph_points`
- `blog_posts.impact_graph_points`
- `discussions.momentum_graph_points`
- `discussions.impact_graph_points`

Added in migration:

- `supabase/migrations/20260327143000_add_content_score_graph_columns.sql`

## Index Support

Migration `supabase/migrations/20260327120000_add_scoring_indexes.sql` adds score-window indexes keyed by content id/slug plus `created_at` to support period-constrained metric queries efficiently.
